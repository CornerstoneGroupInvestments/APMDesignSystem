<#
    CDG-W11-TST-Time and Time Zone Readiness-P-1.0

    Purpose  Pilot-device verification. Run this on ONE device before assigning anything
             to the fleet, and again on any device that reports the wrong zone.
             It is the tool that produces the real egress deny list: it exercises the
             documented endpoints so the Palo Alto and Zscaler logs have something to show.

    Read-only. It changes nothing. Run it in an elevated PowerShell session on the device.

    Not an Intune script. Output is long on purpose. Save it with the pilot evidence.
#>

$ErrorActionPreference = 'Continue'

$SvcRoot     = 'HKLM:\SYSTEM\CurrentControlSet\Services'
$SensorKey   = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Sensor\Overrides\{BFA794E4-F964-4FDB-90F6-51056BFE4B44}'
$LfsvcCfgKey = 'HKLM:\SYSTEM\CurrentControlSet\Services\lfsvc\Service\Configuration'
$ConsentKey  = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location'
$TzPolicyKey = 'HKLM:\SOFTWARE\Microsoft\PolicyManager\current\device\TimeLanguageSettings'
$LocPolicy   = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors'
$AppPrivacy  = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\AppPrivacy'
$W32Config   = 'HKLM:\SYSTEM\CurrentControlSet\Services\W32Time\Config'

# The only Location endpoint Microsoft documents for Windows 11.
$LocationEndpoint = 'inference.location.live.net'
$NtpHost          = 'time.windows.com'

function Write-Section { param([string]$Title) Write-Output ''; Write-Output "=== $Title ===" }

function Get-RegValue {
    param([string]$Path, [string]$Name)
    try { return Get-ItemPropertyValue -Path $Path -Name $Name -ErrorAction Stop } catch { return $null }
}

function Show-Value {
    param([string]$Label, $Value, $Expected)
    $shown = if ($null -eq $Value) { '(absent)' } else { "$Value" }
    $verdict = ''
    if ($PSBoundParameters.ContainsKey('Expected')) {
        $verdict = if ("$Value" -eq "$Expected") { '  OK' } else { "  EXPECTED $Expected" }
    }
    Write-Output ("  {0,-42} {1}{2}" -f $Label, $shown, $verdict)
}

Write-Output "Time and time zone readiness  --  $env:COMPUTERNAME  --  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Write-Section 'Host'
Show-Value 'PowerShell version' $PSVersionTable.PSVersion
Show-Value '32-bit host (should be blank)' $env:PROCESSOR_ARCHITEW6432
Show-Value 'Language mode' $ExecutionContext.SessionState.LanguageMode
Show-Value 'Domain joined' ((Get-CimInstance Win32_ComputerSystem).PartOfDomain)

Write-Section 'Service start values (2 Automatic, 3 Demand, 4 Disabled)'
Show-Value 'lfsvc Start'        (Get-RegValue "$SvcRoot\lfsvc" 'Start')        2
Show-Value 'w32time Start'      (Get-RegValue "$SvcRoot\w32time" 'Start')      2
Show-Value 'tzautoupdate Start' (Get-RegValue "$SvcRoot\tzautoupdate" 'Start') 3
Write-Output '  Live state (Running is NOT a health signal, all three self-stop):'
foreach ($s in @('lfsvc', 'w32time', 'tzautoupdate')) {
    try {
        $svc = Get-Service -Name $s -ErrorAction Stop
        Write-Output ("    {0,-16} {1,-10} {2}" -f $s, $svc.Status, $svc.StartType)
    } catch {
        Write-Output ("    {0,-16} not present" -f $s)
    }
}
Write-Output '  Triggers (w32time carries a STOP trigger on "not domain joined"):'
sc.exe qtriggerinfo w32time | ForEach-Object { "    $_" }

Write-Section 'Location gates'
Show-Value 'ConsentStore location Value' (Get-RegValue $ConsentKey 'Value') 'Allow'
Show-Value 'lfsvc Configuration Status'  (Get-RegValue $LfsvcCfgKey 'Status') 1
Show-Value 'SensorPermissionState'       (Get-RegValue $SensorKey 'SensorPermissionState') 1
Write-Output '  Note: lfsvc has been observed resetting SensorPermissionState to 0 on every'
Write-Output '  start, so 0 here is not automatically a fault. The policy is the real gate.'

Write-Section 'Policies that override everything else'
Show-Value 'AllowLocation (PolicyManager)' (Get-RegValue 'HKLM:\SOFTWARE\Microsoft\PolicyManager\current\device\System' 'AllowLocation')
Show-Value 'GP DisableLocation'            (Get-RegValue $LocPolicy 'DisableLocation')
Show-Value 'GP DisableWindowsLocationProvider' (Get-RegValue $LocPolicy 'DisableWindowsLocationProvider')
Show-Value 'GP LetAppsAccessLocation'      (Get-RegValue $AppPrivacy 'LetAppsAccessLocation')
Show-Value 'ConfigureTimeZone (fixed zone)' (Get-RegValue $TzPolicyKey 'ConfigureTimeZone')
Write-Output '  A fixed ConfigureTimeZone value and automatic time zone are two controls'
Write-Output '  writing the same field. Decide which one owns it, do not deploy both.'

Write-Section 'Time zone'
Show-Value 'Current zone' (Get-TimeZone | Select-Object -ExpandProperty Id)
Show-Value 'DST supported' (Get-TimeZone | Select-Object -ExpandProperty SupportsDaylightSavingTime)

Write-Section 'Clock and phase correction'
Show-Value 'MaxPosPhaseCorrection (s)' (Get-RegValue $W32Config 'MaxPosPhaseCorrection')
Show-Value 'MaxNegPhaseCorrection (s)' (Get-RegValue $W32Config 'MaxNegPhaseCorrection')
Write-Output '  Default on a device that is not AD domain-joined is 54000 (15 hours). A'
Write-Output '  correction larger than this is DISCARDED, not applied: the clock stays wrong.'
Write-Output '  w32tm /query /source:'
w32tm /query /source | ForEach-Object { "    $_" }
Write-Output '  w32tm /query /status:'
w32tm /query /status | ForEach-Object { "    $_" }
Write-Output '  w32tm /query /configuration (NtpServer flags, poll intervals):'
w32tm /query /configuration | Select-String -Pattern 'NtpServer|Type:|SpecialPollInterval|MinPollInterval|MaxPollInterval|MaxPosPhase|MaxNegPhase' | ForEach-Object { "    $_" }

Write-Section "Egress test 1: NTP to $NtpHost (UDP 123)"
Write-Output '  UDP 123 does not traverse a web proxy. This is a firewall rule, never a'
Write-Output '  Zscaler URL exception. Every sample timing out means UDP 123 is blocked.'
Write-Output "  nslookup $NtpHost :"
Resolve-DnsName -Name $NtpHost -ErrorAction SilentlyContinue | Select-Object Name, Type, IPAddress | Format-Table | Out-String -Width 120 | ForEach-Object { $_.TrimEnd() }
Write-Output '  w32tm /stripchart (the definitive test, it sends real NTP packets):'
w32tm /stripchart /computer:$NtpHost /samples:5 /dataonly | ForEach-Object { "    $_" }

Write-Section "Egress test 2: Location service ($LocationEndpoint, TLS 1.2)"
Write-Output '  This is the only Location endpoint Microsoft documents for Windows 11.'
Write-Output '  The port is not stated in the doc; 443 is inferred from the protocol.'
Write-Output "  nslookup $LocationEndpoint :"
Resolve-DnsName -Name $LocationEndpoint -ErrorAction SilentlyContinue | Select-Object Name, Type, IPAddress, NameHost | Format-Table | Out-String -Width 140 | ForEach-Object { $_.TrimEnd() }
$tcp = Test-NetConnection -ComputerName $LocationEndpoint -Port 443 -InformationLevel Quiet -ErrorAction SilentlyContinue
Show-Value 'TCP 443 reachable' $tcp $true
Write-Output '  Certificate issuer, which is how you tell whether it is being decrypted:'
Write-Output '  a public CA means no inspection, your own or Zscaler CA means inspection.'
$curl = & "$env:SystemRoot\System32\curl.exe" -sv --max-time 20 "https://$LocationEndpoint" 2>&1
$curl | Select-String -Pattern 'issuer|subject|SSL certificate|CONNECT|Proxy' | ForEach-Object { "    $_" }
Write-Output '  System-wide proxy (lfsvc runs as a machine service, so a user-authenticated'
Write-Output '  proxy has no token to authenticate with and will fail):'
netsh winhttp show proxy | ForEach-Object { "    $_" }

Write-Section 'Windows Time event log (event 264 names an unreachable peer)'
try {
    Get-WinEvent -LogName 'Microsoft-Windows-Time-Service/Operational' -MaxEvents 15 -ErrorAction Stop |
        Select-Object TimeCreated, Id, @{ n = 'Message'; e = { ($_.Message -split "`r?`n")[0] } } |
        Format-Table -AutoSize | Out-String -Width 200 | ForEach-Object { $_.TrimEnd() }
} catch {
    Write-Output "  Could not read the Time-Service log: $($_.Exception.Message)"
}

Write-Section 'Location log channels present on this build'
Write-Output '  Microsoft documents no operational log for the location service, so'
Write-Output '  enumerate what this build actually has rather than trusting a blog.'
wevtutil el | Select-String -Pattern 'Location|Geolocation|Sensor' | ForEach-Object { "    $_" }

Write-Section 'If the zone is still wrong and the clock is right'
Write-Output '  Location resolution is being blocked, or lfsvc is serving a stale cached fix.'
Write-Output '  The cache has been observed pinning a device to the wrong country. To clear it:'
Write-Output '    Stop-Service lfsvc'
Write-Output '    Remove-Item "$env:ProgramData\Microsoft\Windows\LfSvc\Cache" -Recurse -Force'
Write-Output '    Start-Service lfsvc'
Write-Output '  Then read the Palo Alto and Zscaler denies for this device and add whatever'
Write-Output '  they name to the egress list. Do not guess the FQDNs.'
Write-Output ''
