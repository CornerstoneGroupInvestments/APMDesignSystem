<#
.SYNOPSIS
    Test harness: applies the Assigned Access configuration directly to the CSP, so the
    configuration the signed remediation will produce can be proven before it is signed.

.DESCRIPTION
    Written to run under Constrained Language Mode, so it needs no signing. Nothing here uses
    Add-Type, New-Object, [pscustomobject], the [xml] cast, or a static call on a type CLM
    disallows. The XML is escaped with a -replace chain rather than SecurityElement::Escape,
    and the CIM instance is updated through -Property rather than by assigning to a property
    of the returned object, because both of those are blocked.

    A DEFAULT RUN CARRIES BOTH FIXES UNDER TEST. The LibreOffice changes match what
    Remediate-KioskSessionAccount.ps1 already renders: literal paths expanded from the
    environment, soffice.bin allowed, and LibreOffice's dependencies discovered on disk. The
    Edge pin does NOT yet match the remediation: a default run pins Edge by its application
    identifier rather than by shortcut path, which is the candidate fix for the pin that
    appears on first sign-in and vanishes on some later reboots. Fold it into the remediation
    once several reboots have held.

    The four switches SUBTRACT from that configuration, so a fix can still be narrowed. Each
    switch removes exactly one change, and a run that still works tells you that change was
    not needed.

.PARAMETER UseVariablePaths
    Reverts to %ProgramFiles% and %SystemRoot% instead of literal paths.

.PARAMETER OmitSofficeBin
    Leaves soffice.bin out of AllowedApps.

.PARAMETER OmitDependencies
    Leaves LanguageToolLO.dll and the two Python modules out of AllowedApps.

.PARAMETER EdgePinByShortcut
    Reverts the Edge pin to the Microsoft Edge.lnk shortcut path. A default run pins Edge by the
    exact AppID that Get-StartApps reports for it on this build.

    Three pin forms exist. Which one is right is not a matter of opinion: it is whatever
    Get-StartApps reports as Edge's AppID, and on this build that is a classic desktop AppID in
    Known Folder GUID form, not the packaged AUMID.
      desktopAppLink   a path to a .lnk. Legal, and what this design used. Depends on a file
                       this build does not ship and the remediation has to create, and on Start
                       resolving that file to Edge's identity.
      packagedAppId    the packaged AUMID. Tried, and it does not resolve: Edge's package IS
                       registered on this device, but Start does not surface Edge under it.
      desktopAppId     the classic desktop AppID. Correct, with the value measured from
                       Get-StartApps:
                       {7C5A40EF-A0FB-4BFC-874A-C0F2E0B9FA8E}\Microsoft\Edge\Application\msedge.exe
                       The GUID is the Known Folder ID for Program Files (x86). An earlier
                       attempt used the value MSEdge, which was a guess and does not resolve.

.PARAMETER ShowOnly
    Prints the configuration currently applied to the device and exits. Changes nothing.

.PARAMETER Restore
    Writes back the configuration saved by the last run of this script.

.NOTES
    MUST run as SYSTEM. The MDM WMI bridge rejects writes from an ordinary administrator.
    psexec -s -i powershell.exe -File .\Set-KioskAssignedAccessTest.ps1

    Assigned Access applies at next sign-in. Sign out of the kiosk account and back in.

    The remediation owns this CSP node and will overwrite anything written here at its next
    run. Pause its assignment, or finish testing before the next check-in.

    Test tooling. Not an Intune object, not deployed, not assigned.
#>
[CmdletBinding()]
param(
    [switch]$UseVariablePaths,
    [switch]$OmitSofficeBin,
    [switch]$OmitDependencies,
    [switch]$EdgePinByShortcut,
    [switch]$ShowOnly,
    [switch]$Restore,
    [string]$AccountName,
    [string]$BackupPath = 'C:\APM\PK\assigned-access-test-backup.xml'
)

$ErrorActionPreference = 'Stop'
function Head($t) { Write-Host ''; Write-Host ('== ' + $t) -ForegroundColor Cyan }
function Item($k, $v) { Write-Host ('   {0,-38} {1}' -f $k, $v) }
function Good($t) { Write-Host ('   OK    ' + $t) -ForegroundColor Green }
function Bad($t)  { Write-Host ('   FAIL  ' + $t) -ForegroundColor Red }
function Warn($t) { Write-Host ('   WARN  ' + $t) -ForegroundColor Yellow }
function Note($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray }

$NS = 'root\cimv2\mdm\dmmap'
$CLASS = 'MDM_AssignedAccess'

# XML escape and unescape without SecurityElement or WebUtility, both blocked in CLM.
# Ampersand first on the way out, because the other four substitutions introduce one.
# Ampersand last on the way back, for the same reason in reverse.
function Escape-Xml($s) {
    return $s -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;' -replace '"', '&quot;' -replace "'", '&apos;'
}
function Unescape-Xml($s) {
    return $s -replace '&lt;', '<' -replace '&gt;', '>' -replace '&quot;', '"' -replace '&apos;', "'" -replace '&amp;', '&'
}
function Get-Applied {
    $i = Get-CimInstance -Namespace $NS -ClassName $CLASS -ErrorAction SilentlyContinue
    if (-not $i) { return $null }
    if (-not $i.Configuration) { return '' }
    return Unescape-Xml "$($i.Configuration)"
}
function Set-Applied($xmlText) {
    $escaped = Escape-Xml $xmlText
    $existing = Get-CimInstance -Namespace $NS -ClassName $CLASS -ErrorAction SilentlyContinue
    if ($existing) {
        # -Property, not $existing.Configuration = ... : property assignment on a CIM object
        # is a method call underneath and CLM blocks it.
        Set-CimInstance -InputObject $existing -Property @{ Configuration = $escaped }
    } else {
        New-CimInstance -Namespace $NS -ClassName $CLASS -Property @{
            ParentID = './Vendor/MSFT'; InstanceID = 'AssignedAccess'; Configuration = $escaped
        } | Out-Null
    }
}

Write-Host ''
Write-Host 'Participant Kiosk - Assigned Access test harness' -ForegroundColor White
Item 'Device' $env:COMPUTERNAME
Item 'Run at' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Item 'Language mode' $ExecutionContext.SessionState.LanguageMode

$who = (& whoami) -join ''
Item 'Running as' $who
if ($who -notmatch 'nt authority\\system') {
    Bad 'Not running as SYSTEM. The MDM WMI bridge rejects writes from an ordinary administrator.'
    Note 'psexec -s -i powershell.exe -File .\Set-KioskAssignedAccessTest.ps1'
    if (-not $ShowOnly) { exit 1 }
    Warn 'Continuing, because -ShowOnly only reads.'
}

# ------------------------------------------------------------------ show only
if ($ShowOnly) {
    Head 'Configuration currently applied'
    $cur = Get-Applied
    if ($null -eq $cur) { Bad 'No MDM_AssignedAccess instance. Assigned Access has never been configured.'; exit 1 }
    if ($cur -eq '') { Bad 'The instance exists but Configuration is empty.'; exit 1 }
    Write-Host $cur
    Head 'Quick reads'
    Item 'soffice.bin present' $(if ($cur -match 'soffice\.bin') { 'yes' } else { 'NO' })
    Item 'LibreOffice dependencies' ([regex]::Matches($cur, '\.dll"|\.pyd"')).Count
    Item 'Path style' $(if ($cur -match '%ProgramFiles') { '%ProgramFiles% variables' } else { 'literal' })
    Item 'Edge pinned by' $(if ($cur -match 'desktopAppId"\s*:\s*"\{7C5A40EF') { 'desktopAppId, measured AppID' } elseif ($cur -match 'packagedAppId') { 'packagedAppId' } elseif ($cur -match 'desktopAppId') { 'desktopAppId, other value' } elseif ($cur -match 'Microsoft Edge\.lnk') { 'shortcut path' } else { 'NOT PINNED' })
    Item 'Literal [SERIAL] present' $(if ($cur -match '\[SERIAL\]') { 'YES, this cannot resolve' } else { 'no' })
    if ($cur -match '<Account>([^<]+)</Account>') { Item 'Account named' $Matches[1] }
    Item 'AllowedApps entries' ([regex]::Matches($cur, '<App ')).Count
    exit 0
}

# -------------------------------------------------------------------- restore
if ($Restore) {
    Head 'Restore'
    if (-not (Test-Path $BackupPath)) { Bad "No backup at $BackupPath"; exit 1 }
    $saved = Get-Content -LiteralPath $BackupPath -Raw
    if (-not $saved) { Bad 'Backup file is empty.'; exit 1 }
    Set-Applied $saved
    $back = Get-Applied
    Item 'Restored bytes' "$($saved.Length)"
    Item 'AllowedApps entries' ([regex]::Matches($back, '<App ')).Count
    Good 'Restored. Sign out of the kiosk account and back in.'
    exit 0
}

# ---------------------------------------------------------------- account name
if (-not $AccountName) {
    $serial = ((Get-CimInstance Win32_BIOS).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
    if (-not $serial) { Bad 'No BIOS serial number available.'; exit 1 }
    if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
    $AccountName = "Kiosk-$serial"
}
Item 'Session account' $AccountName
$acct = Get-LocalUser -Name $AccountName -ErrorAction SilentlyContinue
if (-not $acct) {
    Bad "Local account $AccountName does not exist. Assigned Access fails the whole configuration when the named account is missing."
    Note 'Run the remediation first, or pass -AccountName with an account that exists.'
    exit 1
}
Good 'Account exists.'

# --------------------------------------------------------------------- backup
Head 'Backup'
$current = Get-Applied
if ($null -eq $current) {
    Warn 'No existing configuration to back up. -Restore will not be available.'
} else {
    $dir = Split-Path $BackupPath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Set-Content -LiteralPath $BackupPath -Value $current -Encoding UTF8 -Force
    Item 'Saved to' $BackupPath
    Item 'AllowedApps entries saved' ([regex]::Matches($current, '<App ')).Count
    Note 'Reverse with:  -Restore'
}

# ------------------------------------------------- paths, mirroring the remediation
# The remediation expands these on the device. The same logic runs here so the
# configuration under test is the configuration that will ship.
if ($UseVariablePaths) {
    $pf = '%ProgramFiles%'
    $pf86 = '%ProgramFiles(x86)%'
    $sr = '%SystemRoot%'
    $lo = '%ProgramFiles%\LibreOffice\program'
} else {
    $pf = "$env:ProgramFiles"
    $pf86 = "${env:ProgramFiles(x86)}"
    $sr = "$env:SystemRoot"
    $lo = "$pf\LibreOffice\program"
}

$sofficeBinApp = ''
if (-not $OmitSofficeBin) { $sofficeBinApp = "    <App DesktopAppPath=`"$lo\soffice.bin`" />`n" }

# Edge is pinned by the exact AppID Get-StartApps reports for it, which on this build is a
# classic desktop AppID in Known Folder GUID form. The GUID is the Known Folder ID for
# Program Files (x86), so the value is path-independent without being a file reference.
#
# Measured, not guessed. Two earlier attempts failed because the value was not measured: the
# packaged AUMID does not resolve (Edge's package is registered, but Start does not surface
# Edge under it), and desktopAppId with the value MSEdge was invented.
#
# Re-measure with Get-StartApps if Edge is ever reinstalled into a different Program Files
# tree, because the Known Folder GUID changes with it.
if ($EdgePinByShortcut) {
    $edgePin = '{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\Microsoft Edge.lnk"}'
} else {
    $edgePin = '{"desktopAppId":"{7C5A40EF-A0FB-4BFC-874A-C0F2E0B9FA8E}\\Microsoft\\Edge\\Application\\msedge.exe"}'
}

# Discovered, not hardcoded: the bundled Python folder carries a version number that changes
# with every LibreOffice update.
$depApps = ''
$deps = @()
if (-not $OmitDependencies) {
    $loReal = "$env:ProgramFiles\LibreOffice\program"
    if (Test-Path "$loReal\LanguageToolLO.dll") { $deps += "$lo\LanguageToolLO.dll" }
    foreach ($f in @(Get-ChildItem $loReal -Recurse -Filter '*.pyd' -ErrorAction SilentlyContinue)) {
        if ($f.Name -eq 'select.pyd' -or $f.Name -eq '_socket.pyd') {
            $rel = "$($f.FullName)".Substring($loReal.Length)
            $deps += "$lo$rel"
        }
    }
    foreach ($d in $deps) { $depApps += "    <App DesktopAppPath=`"$d`" />`n" }
}

# ----------------------------------------------------------- candidate config
$profileId = '{4B1E9A0C-6D7F-4A31-9C52-8E0A73B5D411}'
$aaXml = @"
<?xml version="1.0" encoding="utf-8" ?>
<AssignedAccessConfiguration
 xmlns="http://schemas.microsoft.com/AssignedAccess/2017/config"
 xmlns:rs5="http://schemas.microsoft.com/AssignedAccess/201810/config"
 xmlns:v3="http://schemas.microsoft.com/AssignedAccess/2020/config"
 xmlns:v5="http://schemas.microsoft.com/AssignedAccess/2022/config">
 <Profiles>
  <Profile Id="$profileId" Name="APM Participant Kiosk">
   <AllAppsList><AllowedApps>
    <App DesktopAppPath="$pf86\Microsoft\Edge\Application\msedge.exe" />
    <App DesktopAppPath="$pf86\Microsoft\Edge\Application\msedge_proxy.exe" />
    <App AppUserModelId="Microsoft.MicrosoftEdge.Stable_8wekyb3d8bbwe!App" />
    <App DesktopAppPath="$lo\swriter.exe" />
    <App DesktopAppPath="$lo\scalc.exe" />
    <App DesktopAppPath="$lo\simpress.exe" />
    <App DesktopAppPath="$lo\soffice.exe" />
$sofficeBinApp$depApps    <App DesktopAppPath="$pf\Zscaler\ZSATray\ZSATray.exe" />
    <App DesktopAppPath="$pf\TeamViewer\TeamViewer.exe" />
    <App DesktopAppPath="$sr\System32\Narrator.exe" />
    <App DesktopAppPath="$sr\System32\Magnify.exe" />
    <App DesktopAppPath="$sr\System32\osk.exe" />
    <App DesktopAppPath="$sr\System32\VoiceAccess.exe" />
    <App DesktopAppPath="$sr\explorer.exe" />
   </AllowedApps></AllAppsList>
   <rs5:FileExplorerNamespaceRestrictions>
    <rs5:AllowedNamespace Name="Downloads" />
    <v3:AllowRemovableDrives />
   </rs5:FileExplorerNamespaceRestrictions>
   <v5:StartPins><![CDATA[{"pinnedList":[$edgePin,{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\LibreOffice\\LibreOffice Writer.lnk"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\LibreOffice\\LibreOffice Calc.lnk"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\LibreOffice\\LibreOffice Impress.lnk"},{"desktopAppLink":"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\File Explorer.lnk"},{"desktopAppLink":"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\Narrator.lnk"},{"desktopAppLink":"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\Magnify.lnk"},{"desktopAppLink":"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\On-Screen Keyboard.lnk"},{"desktopAppLink":"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\VoiceAccess.lnk"}]}]]></v5:StartPins>
   <Taskbar ShowTaskbar="true" />
  </Profile>
 </Profiles>
 <Configs>
  <Config>
   <Account>.\$AccountName</Account>
   <DefaultProfile Id="$profileId" />
  </Config>
 </Configs>
</AssignedAccessConfiguration>
"@

# ---------------------------------------------------------------------- apply
Head 'Configuration being applied'
$subtracted = @()
if ($UseVariablePaths) { $subtracted += 'literal paths' }
if ($OmitSofficeBin) { $subtracted += 'soffice.bin' }
if ($OmitDependencies) { $subtracted += 'dependencies' }
if ($EdgePinByShortcut) { $subtracted += 'Edge pinned by identifier' }
if ($subtracted.Count -eq 0) {
    Good 'Everything under test is on. The LibreOffice fix matches the remediation; the Edge pin does not yet.'
    Note 'The remediation still pins Edge by shortcut. Fold this in once it is proven.'
} else {
    Warn "Subtracted: $($subtracted -join ', ')"
    Note 'A run that still works means the subtracted change was not needed.'
}
Item 'Path style' $(if ($UseVariablePaths) { '%ProgramFiles% variables' } else { 'literal, expanded here' })
Item 'soffice.bin' $(if ($OmitSofficeBin) { 'omitted' } else { 'allowed' })
Item 'Edge pin form' $(if ($EdgePinByShortcut) { 'desktopAppLink, Microsoft Edge.lnk' } else { 'desktopAppId, measured from Get-StartApps' })
Item 'Dependencies found and allowed' $(if ($OmitDependencies) { 'omitted' } else { "$($deps.Count)" })
foreach ($d in $deps) { Note "  $d" }
if (-not $OmitDependencies -and $deps.Count -lt 3) {
    Warn 'Fewer than 3 dependencies found. If LibreOffice is not installed, install it and run again.'
}
Item 'AllowedApps entries' ([regex]::Matches($aaXml, '<App ')).Count

Head 'Applying'
Set-Applied $aaXml
Good 'Written to ./Vendor/MSFT/AssignedAccess/Configuration'

# --------------------------------------------------------------------- verify
Head 'Verify'
$after = Get-Applied
if ($null -eq $after -or $after -eq '') { Bad 'Read-back returned nothing. The write did not take.'; exit 1 }
Item 'Bytes applied' "$($after.Length)"
Item 'AllowedApps entries' ([regex]::Matches($after, '<App ')).Count
Item 'soffice.bin present' $(if ($after -match 'soffice\.bin') { 'yes' } else { 'no' })
Item 'Dependencies present' ([regex]::Matches($after, '\.dll"|\.pyd"')).Count
Item 'Account named' $(if ($after -match '<Account>([^<]+)</Account>') { $Matches[1] } else { 'not found' })
Item 'Edge pinned by' $(if ($after -match 'desktopAppId"\s*:\s*"\{7C5A40EF') { 'desktopAppId, measured AppID' } elseif ($after -match 'packagedAppId') { 'packagedAppId' } elseif ($after -match 'desktopAppId') { 'desktopAppId, other value' } elseif ($after -match 'Microsoft Edge\.lnk') { 'shortcut path' } else { 'NOT PINNED' })
$expected = ([regex]::Matches($aaXml, '<App ')).Count
$actual = ([regex]::Matches($after, '<App ')).Count
if ($expected -ne $actual) {
    Bad "Applied $actual entries, expected $expected. Assigned Access may have rejected part of the document."
    Note 'Event Viewer > Applications and Services Logs > Microsoft > Windows > AssignedAccess > Operational.'
    exit 1
}
Good 'The applied configuration matches what was sent.'

Head 'Next'
Note '1. Sign out of the kiosk account, then sign back in. Assigned Access applies at sign-in.'
Note '2. Confirm Edge is pinned and opens, and click each LibreOffice pin.'
Note '3. REBOOT SEVERAL TIMES. The Edge pin fault is intermittent, so one good boot proves'
Note '   nothing. Four or five clean reboots is the test, and note whether any boot applied a'
Note '   pending Edge update.'
Note '4. If the pin holds, fold this desktopAppId value into the remediation and the canonical'
Note '   XML. Re-measure it with Get-StartApps if Edge is ever moved to a different Program'
Note '   Files tree, because the Known Folder GUID changes with it.'
Note '5. If it still drops, the pin form is exhausted. The remaining candidate is the Edge'
Note '   updater re-staging the package at restart: edgeupdate is set to Automatic on this'
Note '   device and two update tasks are live. See research-edge-start-pin.md.'
Write-Host ''
Warn 'The remediation owns this CSP node and will overwrite this at its next run. Pause its'
Note 'assignment while testing, or finish before the next Intune check-in.'
Write-Host ''
