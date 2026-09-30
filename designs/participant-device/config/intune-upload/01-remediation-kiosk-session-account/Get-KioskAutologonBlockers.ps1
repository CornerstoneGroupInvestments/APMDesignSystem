<#
.SYNOPSIS
    Diagnostic: identifies what is delivering the logon banner and the device password
    policy to this kiosk, so the device can be excluded from it.

.DESCRIPTION
    Read-only by default. Nothing is changed unless -TestLocalClear is passed.

    Both settings block automatic logon and neither can be repaired by a script: each is
    delivered by policy and rewritten at the next management check-in. The exclusion has to
    happen in Intune, and to write it you need to know which channel delivered the setting
    and which policy area it landed in. That is what this reports.

    Six sections:
      1. Winlogon state, and whether automatic logon would fire as configured.
      2. Logon banner: effective value, delivery channel, and the enrolment that set it.
      3. Device password policy: every DeviceLock value, which ones are password
         restrictions, and which are lock timeouts (relevant to a kiosk for a different
         reason).
      4. Enrolment identity: which management authority each provider GUID belongs to.
      5. Event log evidence of the policy being applied, with timestamps.
      6. Verdict, and the exact action to take in Intune for each finding.

.PARAMETER MdmReport
    Also runs MdmDiagnosticsTool.exe and writes MDMDiagReport.html to the output folder.
    That report lists every policy the device has received, which is the fastest way to
    match a setting to the profile that sent it.

.PARAMETER TestLocalClear
    Clears the local logon banner values only, to prove causality on a test device. The
    values return at the next management sync. DeviceLock is not touched: it cannot be
    meaningfully cleared locally. Use on a test device only.

.NOTES
    Run elevated. SYSTEM is not required, but is harmless.
    This is a diagnostic, not an Intune object. It is not deployed and not assigned.
#>
[CmdletBinding()]
param(
    [switch]$MdmReport,
    [switch]$TestLocalClear,
    [string]$OutputPath = "$env:TEMP\KioskAutologonDiag"
)

$ErrorActionPreference = 'Continue'
function Head($t) { Write-Host ''; Write-Host ('== ' + $t) -ForegroundColor Cyan }
function Item($k, $v) { Write-Host ('   {0,-42} {1}' -f $k, $v) }
function Good($t) { Write-Host ('   OK    ' + $t) -ForegroundColor Green }
function Bad($t)  { Write-Host ('   BLOCK ' + $t) -ForegroundColor Red }
function Note($t) { Write-Host ('         ' + $t) -ForegroundColor DarkGray }

$PM       = 'HKLM:\SOFTWARE\Microsoft\PolicyManager'
$POLSYS   = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System'
$WINLOGON = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
$findings = @()

Write-Host ''
Write-Host 'Participant Kiosk - automatic logon blocker isolation' -ForegroundColor White
Item 'Device' $env:COMPUTERNAME
Item 'Run at' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
$serial = ((Get-CimInstance Win32_BIOS).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
Item 'Expected session account' "Kiosk-$serial"

# ---------------------------------------------------------------- 1. Winlogon
Head '1. Winlogon automatic logon state'
$wl = Get-ItemProperty $WINLOGON -ErrorAction SilentlyContinue
Item 'AutoAdminLogon' ($wl.AutoAdminLogon)
Item 'DefaultUserName' ($wl.DefaultUserName)
Item 'DefaultDomainName' $(if ($wl.PSObject.Properties['DefaultDomainName']) { "$($wl.DefaultDomainName)  <- must not be set for a local account" } else { '(not set, correct)' })
Item 'DefaultPassword (cleartext)' $(if ($wl.PSObject.Properties['DefaultPassword']) { 'PRESENT - should be LSA secret only' } else { '(not set, correct)' })
Item 'AutoLogonCount' $(if ($wl.PSObject.Properties['AutoLogonCount']) { "$($wl.AutoLogonCount)  <- autologon will expire" } else { '(not set, correct)' })
if ($wl.AutoAdminLogon -eq '1' -and $wl.DefaultUserName -eq "Kiosk-$serial") {
    Good 'Winlogon is configured. If the device still does not sign itself in, the cause is one of the policies below.'
} else {
    Bad 'Winlogon is not configured for this account. Run the remediation first.'
}

# ------------------------------------------------------------ 2. Logon banner
Head '2. Logon banner (LegalNoticeCaption / LegalNoticeText)'
$pol = Get-ItemProperty $POLSYS -ErrorAction SilentlyContinue
$bannerOn = -not ([string]::IsNullOrWhiteSpace($pol.LegalNoticeCaption) -and [string]::IsNullOrWhiteSpace($pol.LegalNoticeText))
if (-not $bannerOn) {
    Good 'No logon banner set.'
} else {
    Bad 'A logon banner is set. Windows shows it before Winlogon can auto-submit, so automatic logon never completes.'
    Item 'Caption' $pol.LegalNoticeCaption
    Item 'Text (first 90 chars)' ($pol.LegalNoticeText -replace '\s+', ' ').Substring(0, [Math]::Min(90, "$($pol.LegalNoticeText)".Length))
    Note 'Search Intune for this exact caption string to find the profile that sets it.'

    # MDM channel: security options land under PolicyManager as well as the policy key
    $mdmArea = "$PM\current\device\LocalPoliciesSecurityOptions"
    $mdm = Get-ItemProperty $mdmArea -ErrorAction SilentlyContinue
    $mdmNames = @('InteractiveLogon_MessageTitleForUsersAttemptingToLogOn', 'InteractiveLogon_MessageTextForUsersAttemptingToLogOn')
    $viaMdm = $false
    foreach ($n in $mdmNames) {
        if ($mdm -and $mdm.PSObject.Properties[$n]) {
            $viaMdm = $true
            Item "MDM: $n" 'set'
        }
    }
    if ($viaMdm) {
        Item 'Delivery channel' 'MDM (Intune) - Local Policies Security Options'
        $findings += [pscustomobject]@{ Setting = 'Logon banner'; Channel = 'MDM'; Area = 'LocalPoliciesSecurityOptions' }
        # which enrolment set it
        Get-ChildItem "$PM\Providers" -ErrorAction SilentlyContinue | ForEach-Object {
            $p = "$($_.PSPath)\default\Device\LocalPoliciesSecurityOptions"
            $v = Get-ItemProperty $p -ErrorAction SilentlyContinue
            if ($v) { foreach ($n in $mdmNames) { if ($v.PSObject.Properties[$n]) { Item 'Set by provider' $_.PSChildName } } }
        }
    } else {
        Item 'Delivery channel' 'NOT MDM - check Group Policy or local security policy below'
        $findings += [pscustomobject]@{ Setting = 'Logon banner'; Channel = 'GP or local'; Area = 'Security Options' }
        Note 'Run: gpresult /scope computer /h gp.html   then search it for LegalNotice.'
        Note 'Or:  secedit /export /cfg sec.inf         then search for LegalNotice.'
    }
}

# ----------------------------------------------------- 3. Device password policy
Head '3. Device password policy (DeviceLock)'
$dlPath = "$PM\current\device\DeviceLock"
# Windows pre-creates an area key under PolicyManager for nearly every policy area whether
# or not anything is configured, so the key existing proves nothing. Only configured values
# matter, and only the ones imposing a password requirement disable automatic logon.
$dl = if (Test-Path $dlPath) { Get-ItemProperty $dlPath -ErrorAction SilentlyContinue } else { $null }
$dlNames = @()
if ($dl) { $dlNames = @($dl.PSObject.Properties | Where-Object { $_.Name -notlike 'PS*' } | Select-Object -ExpandProperty Name) }

# Values that impose a password requirement, and therefore disable automatic logon.
# DevicePasswordEnabled is inverted in the DeviceLock CSP: 0 means a password IS required.
$pwBlocking = @('MinDevicePasswordLength', 'DevicePasswordExpiration', 'MaxDevicePasswordFailedAttempts', 'MinDevicePasswordComplexCharacters')
# Values that do not block automatic logon but do matter to an unattended kiosk.
$lockSettings = @('MaxInactivityTimeDeviceLock', 'ScreenTimeoutWhileLocked', 'AllowScreenTimeoutWhileLockedUserConfig')

if (-not (Test-Path $dlPath)) {
    Good 'No DeviceLock key present.'
} elseif ($dlNames.Count -eq 0) {
    Good 'DeviceLock key exists but holds no configured values, so nothing is being enforced.'
    Note 'The key alone is not a finding: Windows creates a key for nearly every policy area regardless.'
} else {
    $hitPw = @(); $hitLock = @(); $hitOther = @()
    foreach ($n in $dlNames) {
        $v = $dl.$n
        if ($n -eq 'DevicePasswordEnabled') {
            if ([int]$v -eq 0) { $hitPw += "$n=$v"; Item "$n = $v" 'INVERTED: 0 means a password IS required. This blocks automatic logon' }
            else { Item "$n = $v" 'INVERTED: 1 means no password required. Not a blocker' }
        } elseif ($pwBlocking -contains $n) {
            if ([int]$v -gt 0) { $hitPw += "$n=$v"; Item "$n = $v" 'password restriction. This blocks automatic logon' }
            else { Item "$n = $v" 'set to 0, so not enforced. Not a blocker' }
        } elseif ($lockSettings -contains $n) {
            if ([int]$v -gt 0) { $hitLock += "$n=$v"; Item "$n = $v" 'locks the screen. Separate kiosk problem, does not block autologon' }
            else { Item "$n = $v" 'not enforced' }
        } else {
            $hitOther += $n
            Item "$n = $v" 'not a password restriction'
        }
    }
    Write-Host ''
    Item 'Values configured' $dlNames.Count
    Item 'Blocking automatic logon' $(if ($hitPw.Count) { $hitPw -join ', ' } else { 'none' })
    Item 'Lock timeouts' $(if ($hitLock.Count) { $hitLock -join ', ' } else { 'none' })
    if ($hitPw.Count) {
        Bad 'A device password restriction is active. Microsoft states that device password restrictions disable automatic logon by design.'
        $findings += [pscustomobject]@{ Setting = 'Device password policy'; Channel = 'MDM'; Area = 'DeviceLock' }
    } else {
        Good 'DeviceLock values are present but none imposes a password requirement, so automatic logon is not blocked by this area.'
    }
    if ($hitLock.Count) {
        Note 'A lock timeout on an unattended kiosk shows a lock screen the participant cannot clear. Handle it with the same exclusion.'
    }
    Get-ChildItem "$PM\Providers" -ErrorAction SilentlyContinue | ForEach-Object {
        $v = Get-ItemProperty "$($_.PSPath)\default\Device\DeviceLock" -ErrorAction SilentlyContinue
        if ($v) {
            $names = @($v.PSObject.Properties | Where-Object { $_.Name -notlike 'PS*' } | Select-Object -ExpandProperty Name)
            if ($names.Count) { Item 'Set by provider' "$($_.PSChildName)  ($($names -join ', '))" }
        }
    }
}

# ------------------------------------------------------- 4. Enrolment identity
Head '4. Management authority behind each provider GUID'
Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\Enrollments' -ErrorAction SilentlyContinue |
    Where-Object { $_.PSChildName -match '^\{?[0-9A-Fa-f-]{36}\}?$' } | ForEach-Object {
        $e = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
        if ($e.EnrollmentState -or $e.ProviderID) {
            Item $_.PSChildName "ProviderID=$($e.ProviderID)  UPN=$($e.UPN)  State=$($e.EnrollmentState)  Type=$($e.EnrollmentType)"
        }
    }
Note 'ProviderID MS DM Server = Intune. A provider GUID above that set a value in section 2 or 3 is the enrolment to write the exclusion against.'

# --------------------------------------------------------- 5. Event log record
Head '5. Recent policy application events (last 7 days)'
$log = 'Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider/Admin'
try {
    $ev = Get-WinEvent -FilterHashtable @{ LogName = $log; StartTime = (Get-Date).AddDays(-7) } -MaxEvents 400 -ErrorAction Stop |
          Where-Object { $_.Message -match 'DeviceLock|LegalNotice|MessageTitle|MessageText|LocalPoliciesSecurityOptions' }
    if ($ev) {
        $ev | Select-Object -First 12 | ForEach-Object {
            Item $_.TimeCreated.ToString('yyyy-MM-dd HH:mm') (($_.Message -replace '\s+', ' ').Substring(0, [Math]::Min(150, $_.Message.Length)))
        }
        Note "$($ev.Count) matching event(s). Full log: Event Viewer > Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin"
    } else {
        Item 'Matching events' 'none in the last 7 days'
        Note 'Absence is not evidence: the policy may have applied earlier. Force a sync and re-run.'
    }
} catch {
    Item 'Event log' "could not be read - $($_.Exception.Message)"
}

# ------------------------------------------------------------ optional: report
if ($MdmReport) {
    Head 'MDM diagnostic report'
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    & "$env:SystemRoot\System32\MdmDiagnosticsTool.exe" -out $OutputPath | Out-Null
    Item 'Written to' $OutputPath
    Note 'Open MDMDiagReport.html and search for LegalNotice and DeviceLock. The Managed Policies table lists every policy the device received.'
}

# ------------------------------------------------------ optional: prove cause
if ($TestLocalClear -and $bannerOn) {
    Head 'Test: clearing the logon banner locally'
    Write-Host '   This is a test-device action. The values return at the next management sync.' -ForegroundColor Yellow
    Remove-ItemProperty $POLSYS -Name LegalNoticeCaption -ErrorAction SilentlyContinue
    Remove-ItemProperty $POLSYS -Name LegalNoticeText    -ErrorAction SilentlyContinue
    Good 'Cleared. Restart the device. If it signs itself in, the banner is confirmed as the blocker.'
    Note 'DeviceLock is deliberately not touched: clearing it locally does not reproduce an exclusion.'
}

# ----------------------------------------------------------------- 6. Verdict
Head '6. Verdict and action'
if ($findings.Count -eq 0) {
    Good 'No autologon blockers found on this device.'
} else {
    Write-Host "   $($findings.Count) blocker(s). Neither is repairable on the device: each is rewritten at the next check-in." -ForegroundColor Yellow
    Write-Host ''
    foreach ($f in $findings) {
        Write-Host "   $($f.Setting)  [$($f.Channel), $($f.Area)]" -ForegroundColor White
        switch ($f.Area) {
            'LocalPoliciesSecurityOptions' {
                Note 'Intune > Devices > Configuration. Find the profile setting Interactive logon: Message title/text for users attempting to log on.'
                Note 'Add sg-dyn-dvc-cdg-participant-kiosk as an EXCLUDED group on that profile.'
                Note 'The banner is an ASD ISM control, so this also needs a documented variation against the SOE hardening standard (SOE-07), not just an exclusion.'
            }
            'DeviceLock' {
                Note 'Intune > Devices > Configuration, and check the security baseline as well as any settings-catalog profile.'
                Note 'Add sg-dyn-dvc-cdg-participant-kiosk as an EXCLUDED group on whatever sets the password settings.'
                Note 'If the source is a security baseline, per-setting exclusion is not possible: exclude the kiosk group from the baseline and create a kiosk baseline variant without the password settings.'
            }
            default {
                Note 'Not delivered by MDM. Identify the GPO with gpresult /scope computer /h gp.html, or the local policy with secedit /export.'
            }
        }
        Write-Host ''
    }
    Note 'After excluding, force a sync (Company Portal, or Settings > Accounts > Access work or school > Info > Sync), restart, then re-run Detect-KioskSessionAccount.ps1.'
}
Write-Host ''
