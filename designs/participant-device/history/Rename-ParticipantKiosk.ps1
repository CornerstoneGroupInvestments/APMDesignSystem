<#
.SYNOPSIS
    Completes APM Participant Kiosk names to APM-PK-<RRR><LLLL>, taking the site digits
    from the Entra ID location group the device belongs to.

.DESCRIPTION
    Device names are built in two stages. Autopilot names the device APM-PK-<RRR> at
    provisioning, where RRR is %RAND:3%. This script appends <LLLL>, the last four digits
    of the site's Loc#, which it reads from the device's Entra ID location group
    (sg-stc-dvc-site-LOC########, per the APM Intune Naming Schema V1.0). Result:
    APM-PK-1231001, 14 characters, one inside the Windows hostname limit.

    The naming authority for the site component is the location group, which is directory
    data. A device-side script would need a directory credential to read its own group
    membership, and this design does not place a directory credential on a device that
    sits in a public area and signs itself in. So the rename is issued from the cloud and
    the device only receives the result.

    Idempotent. Devices already named correctly are skipped, so the script is safe to run
    on a schedule, and a device moved to another site's group is corrected on the next run.

.PARAMETER GroupNamePattern
    Regex matching the location groups, with a named capture 'loc' for the Loc# digits.
    Default matches sg-stc-dvc-site-LOC00001001 and captures 00001001.

.PARAMETER Prefix
    Device name prefix, including its trailing hyphen. Default 'APM-PK-'.

.PARAMETER SiteDigits
    How many trailing digits of the Loc# to use. Default 4.

.PARAMETER RandomDigits
    Length of the random component Autopilot assigns. Default 3.

.PARAMETER SeparateSiteComponent
    Insert a hyphen before the site digits (APM-PK-123-1001, 15 characters). Off by
    default: the design specifies the 14-character form.

.PARAMETER AuthMode
    Interactive for an operator run; ManagedIdentity for the scheduled runner.

.EXAMPLE
    .\Rename-ParticipantKiosk.ps1 -WhatIf
    Reports what would change without touching anything. Always run this first.

.EXAMPLE
    .\Rename-ParticipantKiosk.ps1 -MaxRenames 10
    The pilot run: renames the first ten devices that need it.

.EXAMPLE
    .\Rename-ParticipantKiosk.ps1 -AuthMode ManagedIdentity -Unattended
    The scheduled runner. Entra ID has no membership-change trigger, so automatic means
    polled: run this every 15 minutes and devices are renamed as they are added to a
    location group.

.NOTES
    Microsoft Graph PowerShell SDK v2. Permissions: Group.Read.All, Device.Read.All,
    DeviceManagementManagedDevices.PrivilegedOperations.All. Run by a named operator from
    an APM-managed admin workstation, or as the Automation account's managed identity.
    Never under a credential held on a Participant Kiosk.
#>
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [string] $GroupNamePattern = '^sg-stc-dvc-site-LOC(?<loc>\d+)$',
    [string] $Prefix           = 'APM-PK-',
    [ValidateRange(2, 6)]
    [int]    $SiteDigits       = 4,
    [ValidateRange(2, 4)]
    [int]    $RandomDigits     = 3,
    [switch] $SeparateSiteComponent,
    [ValidateRange(8, 15)]
    [int]    $MaxNameLength    = 15,
    [int]    $MaxRenames       = 1000,
    [ValidateSet('Interactive', 'ManagedIdentity')]
    [string] $AuthMode         = 'Interactive',
    [switch] $Unattended,
    [string] $LogPath          = ".\Rename-ParticipantKiosk-$(Get-Date -Format yyyyMMdd-HHmmss).csv"
)

$ErrorActionPreference = 'Stop'
if ($Unattended) { $ConfirmPreference = 'None' }   # scheduled runs must not prompt

$sep = if ($SeparateSiteComponent) { '-' } else { '' }
$nameLength = $Prefix.Length + $RandomDigits + $sep.Length + $SiteDigits
if ($nameLength -gt $MaxNameLength) {
    throw "The configured name would be $nameLength characters (prefix '$Prefix' + $RandomDigits random + '$sep' + $SiteDigits site digits), over the $MaxNameLength limit. Drop -SeparateSiteComponent, shorten the prefix, or reduce a component."
}
Write-Host "Target name form: $Prefix$('R' * $RandomDigits)$sep$('L' * $SiteDigits)  ($nameLength characters)" -ForegroundColor Cyan

$results = [System.Collections.Generic.List[object]]::new()
$renamed = 0

function Add-Result {
    param($Loc, $Group, $EntraDeviceId, $Serial, $CurrentName, $TargetName, $Action, $Detail)
    $results.Add([pscustomobject]@{
        Timestamp = (Get-Date).ToString('s'); Loc = $Loc; Group = $Group
        EntraDeviceId = $EntraDeviceId; Serial = $Serial
        CurrentName = $CurrentName; TargetName = $TargetName
        Action = $Action; Detail = $Detail
    })
}

# ---- connect ----------------------------------------------------------------
$scopes = @('Group.Read.All', 'Device.Read.All', 'DeviceManagementManagedDevices.PrivilegedOperations.All')
if (-not (Get-MgContext)) {
    if ($AuthMode -eq 'ManagedIdentity') { Connect-MgGraph -Identity -NoWelcome }
    else { Connect-MgGraph -Scopes $scopes -NoWelcome }
}
$ctx = Get-MgContext
Write-Host "Connected to tenant $($ctx.TenantId) as $(if ($ctx.Account) { $ctx.Account } else { 'managed identity' })" -ForegroundColor Cyan

# ---- location groups -------------------------------------------------------
# Graph filters cannot express a regex, so the set is narrowed server-side by prefix and
# then matched client-side.
$startsWith = 'sg-stc-dvc-site-'
Write-Host "Reading location groups (prefix '$startsWith', pattern '$GroupNamePattern')..."
$groups = Get-MgGroup -Filter "startswith(displayName,'$startsWith')" -All -Property 'id,displayName' |
          Where-Object { $_.DisplayName -match $GroupNamePattern }
if (-not $groups) { throw "No groups matched '$GroupNamePattern'. Confirm the location group naming and pass -GroupNamePattern." }
Write-Host "Matched $($groups.Count) location groups." -ForegroundColor Green

# ---- read membership, and guard against a device in two sites ---------------
$membership = @{}; $groupMembers = @{}
foreach ($g in $groups) {
    $digits = [regex]::Match($g.DisplayName, $GroupNamePattern).Groups['loc'].Value
    $loc4 = $digits.PadLeft($SiteDigits, '0')
    if ($loc4.Length -gt $SiteDigits) { $loc4 = $loc4.Substring($loc4.Length - $SiteDigits) }
    $members = Get-MgGroupMemberAsDevice -GroupId $g.Id -All -Property 'id,deviceId,displayName' -ErrorAction SilentlyContinue
    $groupMembers[$g.Id] = @{ Loc = $loc4; Name = $g.DisplayName; Members = $members }
    foreach ($m in $members) {
        if (-not $membership.ContainsKey($m.DeviceId)) { $membership[$m.DeviceId] = @() }
        $membership[$m.DeviceId] += "$($g.DisplayName) -> $loc4"
    }
}

# Existing names, used to guarantee a generated random component is unique.
$takenNames = [System.Collections.Generic.HashSet[string]]::new(
    [string[]](Get-MgDeviceManagementManagedDevice -Filter "startswith(deviceName,'$($Prefix.TrimEnd('-'))')" -All -Property 'deviceName' |
               ForEach-Object { $_.DeviceName }), [StringComparer]::OrdinalIgnoreCase)

$rand = [Random]::new()
function New-RandomComponent {
    param($Loc4)
    for ($i = 0; $i -lt 200; $i++) {
        $r = ($rand.Next(0, [math]::Pow(10, $RandomDigits))).ToString().PadLeft($RandomDigits, '0')
        $candidate = "$Prefix$r$sep$Loc4"
        if (-not $takenNames.Contains($candidate)) { return $r }
    }
    throw "Could not find an unused random component for site $Loc4 after 200 attempts. Increase -RandomDigits."
}

# ---- rename ----------------------------------------------------------------
foreach ($entry in $groupMembers.GetEnumerator()) {
    $loc4 = $entry.Value.Loc; $groupName = $entry.Value.Name

    foreach ($device in $entry.Value.Members) {
        if ($renamed -ge $MaxRenames) { Write-Warning "MaxRenames ($MaxRenames) reached - stopping."; break }

        if ($membership[$device.DeviceId].Count -gt 1) {
            Add-Result $loc4 $groupName $device.DeviceId '' $device.DisplayName '' 'Skipped' "Device is in $($membership[$device.DeviceId].Count) location groups: $($membership[$device.DeviceId] -join '; ')"
            Write-Warning "$($device.DisplayName): in multiple location groups - skipped."
            continue
        }

        $managed = Get-MgDeviceManagementManagedDevice -Filter "azureADDeviceId eq '$($device.DeviceId)'" -Property 'id,deviceName,serialNumber' -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $managed) {
            Add-Result $loc4 $groupName $device.DeviceId '' $device.DisplayName '' 'Skipped' 'No Intune managed device record - not enrolled yet'
            continue
        }

        $current = $managed.DeviceName
        $escPrefix = [regex]::Escape($Prefix); $escSep = [regex]::Escape($sep)
        $target = $null; $detail = ''

        if ($current -match "^$escPrefix(?<r>\d{$RandomDigits})$escSep(?<l>\d{$SiteDigits})$") {
            # Already complete. Correct only if the site digits match the group it is in.
            $target = "$Prefix$($Matches.r)$sep$loc4"
            if ($Matches.l -ne $loc4) { $detail = "Site component changed from $($Matches.l) - device moved sites" }
        }
        elseif ($current -match "^$escPrefix(?<r>\d{$RandomDigits})$") {
            # Autopilot stage-one name. Append the site digits, keeping the random component.
            $target = "$Prefix$($Matches.r)$sep$loc4"
            $detail = 'Site component appended to the Autopilot name'
        }
        else {
            # Name is not from the template at all: generate a unique random component.
            $r = New-RandomComponent -Loc4 $loc4
            $target = "$Prefix$r$sep$loc4"
            $detail = "Name did not match the template - random component generated. Check the Autopilot device-name template."
        }

        if ($target.Length -gt $MaxNameLength) {
            Add-Result $loc4 $groupName $device.DeviceId $managed.SerialNumber $current $target 'Skipped' "Target name is $($target.Length) characters, over the $MaxNameLength limit"
            continue
        }

        if ($current -eq $target) {
            Add-Result $loc4 $groupName $device.DeviceId $managed.SerialNumber $current $target 'AlreadyCorrect' ''
            continue
        }

        if ($PSCmdlet.ShouldProcess("$current (serial $($managed.SerialNumber))", "Rename to $target")) {
            try {
                $uri = "https://graph.microsoft.com/beta/deviceManagement/managedDevices('$($managed.Id)')/setDeviceName"
                Invoke-MgGraphRequest -Method POST -Uri $uri -Body (@{ deviceName = $target } | ConvertTo-Json)
                [void]$takenNames.Add($target); $renamed++
                Add-Result $loc4 $groupName $device.DeviceId $managed.SerialNumber $current $target 'Renamed' ($detail + ' Applies at next restart.').Trim()
                Write-Host "$current -> $target" -ForegroundColor Green
            }
            catch {
                Add-Result $loc4 $groupName $device.DeviceId $managed.SerialNumber $current $target 'Failed' $_.Exception.Message
                Write-Warning "$current -> $target FAILED: $($_.Exception.Message)"
            }
        }
        else {
            Add-Result $loc4 $groupName $device.DeviceId $managed.SerialNumber $current $target 'WouldRename' ($detail + ' WhatIf.').Trim()
        }
    }
}

# ---- report ----------------------------------------------------------------
$results | Export-Csv -Path $LogPath -NoTypeInformation -Encoding UTF8
Write-Host ''
Write-Host 'Summary' -ForegroundColor Cyan
$results | Group-Object Action | Sort-Object Name | ForEach-Object { Write-Host ("  {0,-15} {1}" -f $_.Name, $_.Count) }
Write-Host "  Log            $LogPath"
Write-Host ''
Write-Host 'The new name applies at the next device restart: the daily 03:00 update restart, or the next inactivity restart.' -ForegroundColor Yellow
