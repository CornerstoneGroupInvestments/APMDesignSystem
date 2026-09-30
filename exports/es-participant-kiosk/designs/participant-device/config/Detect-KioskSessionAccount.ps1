<#
.SYNOPSIS
    Detection script for the Participant Kiosk session account and Assigned Access state.
    Intune remediation pair: detect. Exit 0 = compliant, 1 = run remediation.

.DESCRIPTION
    Compliant means all of:
      1. A local account named Kiosk-<SERIAL> exists (serial from Win32_BIOS, sanitised and
         capped at 14 characters so the name fits the 20-character SAM limit), is enabled,
         is a standard user (not in Administrators), carries the same value as its display
         name, has PasswordExpires = False and cannot change its own password.
      2. Winlogon is configured to auto-logon that account (AutoAdminLogon = 1,
         DefaultUserName matches; the password lives in the LSA DefaultPassword secret,
         which this script does not and cannot read back for comparison), with no
         cleartext DefaultPassword value and no DefaultDomainName value.
      3. Nothing on the device is known to disable autologon: no logon banner, no
         PreferredAadTenantDomainName, no device password policy.
      4. Assigned Access configuration is applied (MDM_AssignedAccess.Configuration not
         empty) and names the same account.

    Checks 2 and 3 exist because an autologon failure otherwise presents as a device that
    reaches the sign-in screen and waits, with nothing in any log to say why. None of the
    three settings in check 3 can be repaired by the remediation: each arrives by policy
    and is rewritten at every check-in. This reports non-compliant and stays non-compliant
    until the device is excluded from the policy that sets it. That is deliberate: the
    device genuinely is broken, and it should read as broken.

    Check 1's password-change condition matters because Ctrl+Alt+Del is reachable from a
    restricted session. A participant-changed password does not update the LSA secret, and
    automatic logon then fails permanently on that device.

.NOTES
    Runs as SYSTEM, 64-bit. Sign with the APM code-signing certificate (SOE-02).
    Policy: CDG-W11-REM-Kiosk Session Account-P-1.0 (detection half).
#>
$ErrorActionPreference = 'Stop'
try {
    # A SAM account name is 20 characters maximum, so the serial is capped at 14. This rule
    # is identical to the remediation's, deliberately: if the two halves derived different
    # names, detection would never see the account the remediation had just created.
    $serial = ((Get-CimInstance Win32_BIOS).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
    if (-not $serial) { Write-Output 'No BIOS serial'; exit 1 }
    if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
    $user = "Kiosk-$serial"

    $acct = Get-LocalUser -Name $user -ErrorAction SilentlyContinue
    if (-not $acct -or -not $acct.Enabled) { Write-Output "Account $user missing or disabled"; exit 1 }
    if ($acct.FullName -ne $user) { Write-Output "$user display name is '$($acct.FullName)', expected '$user'"; exit 1 }
    if ($acct.PasswordExpires) { Write-Output "$user has password expiry"; exit 1 }
    if ($acct.UserMayChangePassword) { Write-Output "$user may change its own password - a change breaks autologon permanently"; exit 1 }
    if (Get-LocalGroupMember -Group 'Administrators' -Member $user -ErrorAction SilentlyContinue) { Write-Output "$user is an administrator"; exit 1 }

    $wl = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
    if ($wl.AutoAdminLogon -ne '1' -or $wl.DefaultUserName -ne $user) { Write-Output 'Autologon not configured'; exit 1 }
    if ($wl.PSObject.Properties['DefaultPassword']) { Write-Output 'Cleartext DefaultPassword present - must be LSA secret only'; exit 1 }
    if ($wl.PSObject.Properties['DefaultDomainName']) { Write-Output 'DefaultDomainName is set - must not be set for a local account'; exit 1 }

    # Three policy-delivered settings each disable autologon on their own. None can be
    # repaired by the remediation, so each needs an assignment exclusion.
    $pol = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' -ErrorAction SilentlyContinue
    if ($pol.LegalNoticeCaption -or $pol.LegalNoticeText) { Write-Output 'Logon banner set (LegalNoticeCaption/LegalNoticeText) - disables autologon, needs a policy exclusion (SOE-07)'; exit 1 }
    $aadPol = Get-ItemProperty 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\System' -ErrorAction SilentlyContinue
    if ($aadPol.PreferredAadTenantDomainName) { Write-Output 'PreferredAadTenantDomainName is set - Microsoft names this as preventing autologon, needs an assignment exclusion'; exit 1 }
    # Test the VALUES, never the key. Windows pre-creates an area key under PolicyManager for
    # nearly every policy area whether or not anything is configured, so the key existing
    # proves nothing and made this a false positive on every device.
    # DevicePasswordEnabled is inverted in the DeviceLock CSP: 0 means a password IS required.
    $dlPath = 'HKLM:\SOFTWARE\Microsoft\PolicyManager\current\device\DeviceLock'
    $dlv = if (Test-Path $dlPath) { Get-ItemProperty $dlPath -ErrorAction SilentlyContinue } else { $null }
    if ($dlv) {
        if ($null -ne $dlv.DevicePasswordEnabled -and [int]$dlv.DevicePasswordEnabled -eq 0) { Write-Output 'Device password required (DeviceLock/DevicePasswordEnabled=0, inverted) - disables autologon, needs an exclusion from the corporate baseline'; exit 1 }
        foreach ($n in 'MinDevicePasswordLength', 'DevicePasswordExpiration', 'MaxDevicePasswordFailedAttempts', 'MinDevicePasswordComplexCharacters') {
            if ($null -ne $dlv.$n -and [int]$dlv.$n -gt 0) { Write-Output "Device password restriction active (DeviceLock/$n=$($dlv.$n)) - disables autologon, needs an exclusion from the corporate baseline"; exit 1 }
        }
    }

    $aa = Get-CimInstance -Namespace 'root\cimv2\mdm\dmmap' -ClassName 'MDM_AssignedAccess' -ErrorAction SilentlyContinue
    if (-not $aa -or -not $aa.Configuration) { Write-Output 'Assigned Access not applied'; exit 1 }
    $cfgXml = [System.Net.WebUtility]::HtmlDecode($aa.Configuration)
    if ($cfgXml -notmatch [regex]::Escape($user)) { Write-Output 'Assigned Access does not name the kiosk account'; exit 1 }
    if ($cfgXml -match '\[SERIAL\]') { Write-Output 'Assigned Access holds the literal [SERIAL] placeholder - a configuration profile has overwritten this node'; exit 1 }

    Write-Output "Compliant: $user, autologon set, Assigned Access applied"
    exit 0
}
catch { Write-Output "Detection error: $($_.Exception.Message)"; exit 1 }
