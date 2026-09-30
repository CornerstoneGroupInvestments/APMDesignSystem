<#
    CDG-W11-REM-Time and Time Zone-P-1.0  --  DETECTION

    Purpose  Report whether a device is configured to derive its time zone from network
             location and its clock from NTP.

    Context  Intune Remediations detection script.
             Devices > Manage devices > Scripts and remediations > Remediations.
             Runs as SYSTEM, 64-bit host, no interactive user.

    Contract Only exit 1 triggers the remediation script. Every other exit code, including
             0 and including an unhandled crash, is read by Intune as "issue not found".
             So this script catches everything and exits 1 on its own faults too.
             One line of stdout, well inside the 2048 character report limit. Never stderr.

    Design   Compliance is judged on service START TYPE and on OUTCOME, never on whether a
             service is Running. lfsvc, w32time and tzautoupdate are all demand or
             trigger-start and stop themselves when idle, so Running is not a health signal
             and a detection built on it flaps forever.
             Start types are read from the registry, not from Get-Service, because
             HKLM\SYSTEM is not WOW64-redirected and an int needs no type handling.

    Language Cmdlet-only plus w32tm.exe and tzutil.exe. No .NET type access, no Add-Type,
             no New-Object, no type methods. Runs identically in FullLanguage and in
             Constrained Language Mode, so it is portable whether or not App Control
             script enforcement is on.
#>

# --- what compliant looks like -----------------------------------------------------------
# Service start values are the SCM's own: 2 = Automatic, 3 = Demand (Manual), 4 = Disabled.
# tzautoupdate is the odd one: Windows treats demand-start (3) as "Set time zone
# automatically = On" and Disabled (4) as Off. 2 is not a valid substitute for 3.
$Want = @{
    'lfsvc'        = 2   # Geolocation Service. Deliberate: Automatic makes it deterministic.
    'w32time'      = 2   # Windows Time.
    'tzautoupdate' = 3   # Auto Time Zone Updater. Must be exactly 3.
}

$SvcRoot     = 'HKLM:\SYSTEM\CurrentControlSet\Services'
$SensorKey   = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Sensor\Overrides\{BFA794E4-F964-4FDB-90F6-51056BFE4B44}'
$LfsvcCfgKey = 'HKLM:\SYSTEM\CurrentControlSet\Services\lfsvc\Service\Configuration'
# Note the hive: Windows\CurrentVersion, NOT Windows NT\CurrentVersion. The "NT" variant
# is a different key and writing to it changes nothing.
$ConsentKey  = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location'
$TzPolicyKey = 'HKLM:\SOFTWARE\Microsoft\PolicyManager\current\device\TimeLanguageSettings'
$LocPolicy   = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors'
$AppPrivacy  = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\AppPrivacy'

# A source of one of these means the clock is running free, not synchronised.
$UnsyncedSources = @('Local CMOS Clock', 'Free-running System Clock')

function Get-RegValue {
    param([string]$Path, [string]$Name)
    # Missing key and missing value are both NON-terminating on the registry provider,
    # so -ErrorAction Stop is what makes the catch live rather than decorative.
    try {
        return Get-ItemPropertyValue -Path $Path -Name $Name -ErrorAction Stop
    } catch {
        return $null
    }
}

$faults = @()
$notes  = @()

try {
    # 0. Wrong host. HKLM\SOFTWARE reads and writes are redirected to Wow6432Node in a
    #    32-bit host, so a 32-bit run half-works, which is the worst failure mode.
    #    PROCESSOR_ARCHITEW6432 is only present in a 32-bit process on 64-bit Windows.
    if ($env:PROCESSOR_ARCHITEW6432) {
        Write-Output 'NOT COMPLIANT: running in a 32-bit PowerShell host. Set "Run script in 64-bit PowerShell" to Yes.'
        exit 1
    }

    # 1. Service start types, read from the SCM's own registry values.
    foreach ($svc in @('lfsvc', 'w32time', 'tzautoupdate')) {
        $start = Get-RegValue -Path "$SvcRoot\$svc" -Name 'Start'
        if ($null -eq $start) {
            $faults += "$svc Start unreadable"
        } elseif ([int]$start -ne $Want[$svc]) {
            $faults += "$svc Start=$start want $($Want[$svc])"
        }
    }

    # 2. Device location consent. This is the documented master gate.
    $consent = Get-RegValue -Path $ConsentKey -Name 'Value'
    if ($consent -ne 'Allow') { $faults += "location consent=$consent" }

    # 3. Is the clock actually synchronised to a real source.
    $source = 'unknown'
    try {
        $srcOut = w32tm /query /source 2>&1
        if ($LASTEXITCODE -eq 0 -and $srcOut) {
            $source = ($srcOut | Select-Object -First 1).ToString().Trim()
        }
    } catch {
        $source = 'unknown'
    }
    if ($source -eq 'unknown' -or $UnsyncedSources -contains $source) {
        $faults += "time source=$source"
    }

    # --- report-only from here. None of the below fails compliance. --------------------

    # 4. The two location registry values the hardening baseline writes directly.
    #    NOT a compliance gate: lfsvc has been observed rewriting SensorPermissionState
    #    to 0 every time it starts, so gating on it would report the whole fleet
    #    non-compliant at every detection. Remediation still sets them. Reported so you
    #    can see on a real fleet whether they hold.
    $sensor = Get-RegValue -Path $SensorKey -Name 'SensorPermissionState'
    $cfg    = Get-RegValue -Path $LfsvcCfgKey -Name 'Status'
    if ($null -eq $sensor -or [int]$sensor -ne 1) { $notes += "sensorPerm=$sensor" }
    if ($null -eq $cfg -or [int]$cfg -ne 1)       { $notes += "lfsvcCfg=$cfg" }

    # 5. Policies that override everything below them. A script cannot and must not remove
    #    an MDM or GP policy value, so these are named, not fixed.
    $tzPolicy = Get-RegValue -Path $TzPolicyKey -Name 'ConfigureTimeZone'
    if ($null -ne $tzPolicy -and "$tzPolicy".Trim() -ne '') {
        $notes += "CONFLICT fixed time zone policy=$tzPolicy"
    }
    $disableLoc = Get-RegValue -Path $LocPolicy -Name 'DisableLocation'
    if ($null -ne $disableLoc -and [int]$disableLoc -eq 1) {
        $notes += 'CONFLICT policy Turn off location=Enabled'
    }
    $disableProvider = Get-RegValue -Path $LocPolicy -Name 'DisableWindowsLocationProvider'
    if ($null -ne $disableProvider -and [int]$disableProvider -eq 1) {
        $notes += 'CONFLICT policy Turn off Windows Location Provider=Enabled'
    }
    $letApps = Get-RegValue -Path $AppPrivacy -Name 'LetAppsAccessLocation'
    if ($null -ne $letApps -and [int]$letApps -eq 2) {
        $notes += 'CONFLICT policy LetAppsAccessLocation=Force Deny'
    }

    # 6. Which zone the device landed on, so the Intune report shows it per device.
    #    This is the number that tells you whether location resolution is working.
    $zone = 'unknown'
    try {
        $g = tzutil /g 2>&1
        if ($LASTEXITCODE -eq 0 -and $g) { $zone = ($g | Select-Object -First 1).ToString().Trim() }
    } catch {
        $zone = 'unknown'
    }
    $notes += "tz=$zone"
    $notes += "src=$source"

} catch {
    Write-Output "NOT COMPLIANT: detection fault: $($_.Exception.Message)"
    exit 1
}

$suffix = ''
if ($notes.Count -gt 0) { $suffix = ' [' + ($notes -join '; ') + ']' }

if ($faults.Count -gt 0) {
    $message = 'NOT COMPLIANT: ' + ($faults -join '; ') + $suffix
    if ($message.Length -gt 2000) { $message = $message.Substring(0, 2000) }
    Write-Output $message
    exit 1
}

$message = 'COMPLIANT: automatic time zone and NTP configured' + $suffix
if ($message.Length -gt 2000) { $message = $message.Substring(0, 2000) }
Write-Output $message
exit 0
