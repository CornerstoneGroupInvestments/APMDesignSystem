<#
    CDG-W11-REM-Time and Time Zone-P-1.0  --  REMEDIATION

    Purpose  Turn on network-derived automatic time zone and NTP time sync.

    Context  Intune Remediations remediation script. SYSTEM, 64-bit host, no user.

    Contract exit 0 = configuration applied. Non-zero = at least one configuration step
             failed. A failed clock sync is REPORTED, not fatal: the settings are correct
             and the fault is on the network. Detection keeps reporting it, which is the
             signal you want on a kiosk fleet.

    Ordering The order below is not cosmetic. lfsvc has been observed rewriting
             SensorPermissionState back to 0 every time it starts, so that value is written
             AFTER lfsvc is running. Written before, it is a no-op with a green log line.

    Language Cmdlet-only plus w32tm.exe, sc.exe and Set-Service. No .NET type access, no
             Add-Type, no New-Object. Constrained Language Mode safe.
             sc.exe is called with its extension on purpose: bare "sc" is the built-in
             alias for Set-Content.

    Idempotent. Safe to run daily forever.
#>

$SvcRoot     = 'HKLM:\SYSTEM\CurrentControlSet\Services'
$SensorKey   = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Sensor\Overrides\{BFA794E4-F964-4FDB-90F6-51056BFE4B44}'
$LfsvcCfgKey = 'HKLM:\SYSTEM\CurrentControlSet\Services\lfsvc\Service\Configuration'
# Windows\CurrentVersion, not Windows NT\CurrentVersion. The "NT" variant is a decoy.
$ConsentKey  = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location'

$W32TimeConfigKey = 'HKLM:\SYSTEM\CurrentControlSet\Services\W32Time\Config'

# Largest clock correction w32time will accept, in seconds. On a device that is not AD
# domain-joined the default is 54,000 (15 hours), and a sample outside that is DISCARDED
# rather than applied: the kiosk stays wrong and logs instead. A kiosk that has been off
# for weeks, or has a flat CMOS battery, lands outside it and never heals.
# 172800 is 48 hours. 4294967295 (0xFFFFFFFF) means always correct, which fixes the flat
# battery case but is explicitly against Microsoft's security recommendation for
# stand-alone clients, because it accepts any time a reachable NTP source claims.
# One constant, one edit, so a change of mind is not a rewrite.
$MaxPhaseCorrectionSeconds = 172800

$failures = @()
$actions  = @()

function Set-RegValue {
    param([string]$Path, [string]$Name, $Value, [string]$Type)
    if (-not (Test-Path -Path $Path)) {
        $null = New-Item -Path $Path -Force -ErrorAction Stop
    }
    Set-ItemProperty -Path $Path -Name $Name -Value $Value -Type $Type -ErrorAction Stop
}

# 0. Wrong host check. HKLM\SOFTWARE writes are redirected to Wow6432Node in a 32-bit
#    host, so two of the three keys below would be written to the wrong place.
if ($env:PROCESSOR_ARCHITEW6432) {
    Write-Output 'REMEDIATION FAILED: running in a 32-bit PowerShell host. Set "Run script in 64-bit PowerShell" to Yes.'
    exit 1
}

# 1. Device location consent. The documented master gate. REG_SZ, "Allow" or "Deny".
try {
    Set-RegValue -Path $ConsentKey -Name 'Value' -Value 'Allow' -Type String
    $actions += 'location consent allowed'
} catch {
    $failures += "location consent: $($_.Exception.Message)"
}

# 2. Location services switch on the service's own configuration key.
try {
    Set-RegValue -Path $LfsvcCfgKey -Name 'Status' -Value 1 -Type DWord
    $actions += 'location services on'
} catch {
    $failures += "lfsvc configuration: $($_.Exception.Message)"
}

# 3. Auto Time Zone Updater. Windows reads demand-start as "Set time zone automatically
#    = On". Set-Service -StartupType Manual writes Start=3, which is the supported route
#    to the same value. Automatic (2) is NOT equivalent and Disabled (4) is the toggle off.
try {
    Set-Service -Name 'tzautoupdate' -StartupType Manual -ErrorAction Stop
    $actions += 'automatic time zone enabled'
} catch {
    $failures += "tzautoupdate: $($_.Exception.Message)"
}

# 4. Geolocation Service. Automatic so its state is deterministic on a kiosk rather than
#    dependent on a trigger nobody can see.
try {
    Set-Service -Name 'lfsvc' -StartupType Automatic -ErrorAction Stop
    $actions += 'lfsvc set Automatic'
} catch {
    $failures += "lfsvc start type: $($_.Exception.Message)"
}

# 5. Restart lfsvc so it reads the newly allowed location state, rather than waiting for
#    the next boot.
try {
    Restart-Service -Name 'lfsvc' -Force -ErrorAction Stop
    $actions += 'lfsvc restarted'
} catch {
    try {
        Start-Service -Name 'lfsvc' -ErrorAction Stop
        $actions += 'lfsvc started'
    } catch {
        $failures += "lfsvc start: $($_.Exception.Message)"
    }
}

# 6. Sensor permission, written AFTER lfsvc is up because lfsvc resets it on start.
try {
    Set-RegValue -Path $SensorKey -Name 'SensorPermissionState' -Value 1 -Type DWord
    $actions += 'sensor permission set'
} catch {
    $failures += "sensor permission: $($_.Exception.Message)"
}

# 7. Prompt a time zone resolve. tzautoupdate does its work and stops itself, so
#    "start failed" here is normal behaviour for a self-stopping service, not a fault.
try {
    Start-Service -Name 'tzautoupdate' -ErrorAction Stop
    $actions += 'tzautoupdate prompted'
} catch {
    $actions += 'tzautoupdate ran and stopped'
}

# 8. Windows Time. On a device that is not AD domain-joined the SCM holds a STOP trigger
#    on "not domain joined", so setting Automatic alone is not enough: the service is
#    started and then stopped again. Removing the triggers is Microsoft's documented
#    workaround for exactly this case.
try {
    Set-Service -Name 'w32time' -StartupType Automatic -ErrorAction Stop
    $actions += 'w32time set Automatic'
} catch {
    $failures += "w32time start type: $($_.Exception.Message)"
}

try {
    $trig = sc.exe triggerinfo w32time delete 2>&1
    if ($LASTEXITCODE -eq 0) {
        $actions += 'w32time stop trigger removed'
    } else {
        # 1168 ELEMENT_NOT_FOUND means there were no triggers, which is the desired state.
        $actions += "w32time triggers already clear ($LASTEXITCODE)"
    }
} catch {
    $actions += 'w32time trigger check skipped'
}

try {
    Start-Service -Name 'w32time' -ErrorAction Stop
    $actions += 'w32time started'
} catch {
    $actions += "w32time start: $($_.Exception.Message)"
}

# 9. Raise the ceiling on how large a correction w32time will accept, so a kiosk that has
#    been off for a long time can actually pull its clock back. Note this is a no-op if
#    the Global Configuration Settings policy is also deployed: policy wins.
try {
    Set-RegValue -Path $W32TimeConfigKey -Name 'MaxPosPhaseCorrection' -Value $MaxPhaseCorrectionSeconds -Type DWord
    Set-RegValue -Path $W32TimeConfigKey -Name 'MaxNegPhaseCorrection' -Value $MaxPhaseCorrectionSeconds -Type DWord
    $actions += "phase correction ceiling $MaxPhaseCorrectionSeconds s"
} catch {
    $failures += "phase correction: $($_.Exception.Message)"
}

# 10. Reload configuration and resync. Reported, never fatal.
#    /force is NOT a w32tm parameter and never has been. /rediscover redetects network
#    configuration and rediscovers sources, which is what a kiosk on an unknown network
#    needs. w32tm has nothing to do with the time zone: it fixes the clock only.
$syncNote = 'sync not attempted'
try {
    $null = w32tm /config /update 2>&1
    if ($LASTEXITCODE -ne 0) {
        $syncNote = "w32tm /config /update returned $LASTEXITCODE"
    } else {
        $resync = w32tm /resync /rediscover 2>&1
        if ($LASTEXITCODE -eq 0) {
            $syncNote = 'clock resynced'
        } else {
            $syncNote = "resync failed: $(($resync | Select-Object -First 1))"
        }
    }
} catch {
    $syncNote = "w32tm error: $($_.Exception.Message)"
}
$actions += $syncNote

if ($actions.Count -eq 0) { $actions += 'no change required' }

if ($failures.Count -gt 0) {
    $message = 'REMEDIATION FAILED: ' + ($failures -join '; ') + ' | did: ' + ($actions -join '; ')
    if ($message.Length -gt 2000) { $message = $message.Substring(0, 2000) }
    Write-Output $message
    exit 1
}

$message = 'REMEDIATED: ' + ($actions -join '; ')
if ($message.Length -gt 2000) { $message = $message.Substring(0, 2000) }
Write-Output $message
exit 0
