<#
.SYNOPSIS
    Detection script for the Participant Kiosk session account and Assigned Access state.
    Intune remediation pair: detect. Exit 0 = compliant, 1 = run remediation.

    Compliant means all of:
      1. A local account named Kiosk-<SERIAL> exists (serial from Win32_BIOS, sanitised and
         capped at 14 characters so the name fits the 20-character SAM limit), is enabled,
         is a standard user, carries the same value as its display name, has
         PasswordExpires = False and cannot change its own password.
      2. Winlogon is configured to auto-logon that account, with no cleartext
         DefaultPassword value and no DefaultDomainName value. The password itself lives in
         the LSA DefaultPassword secret, which this script does not and cannot read back.
      3. Assigned Access configuration is applied and names the same account.

    It deliberately does NOT test for the policy-delivered settings that can suppress
    automatic logon (a logon banner, PreferredAadTenantDomainName, a device password
    policy). Every one of them arrives by policy and is rewritten at the next check-in, so
    the remediation cannot repair any of them: a device carrying one stayed permanently
    non-compliant and the remediation reported as permanently failed, which told an engineer
    nothing they could act on. Diagnosis of a device that does not sign itself in belongs in
    Get-KioskAutologonBlockers.ps1, which reports each setting, its delivery channel and the
    exclusion needed.

    This script now answers one question only: is the session account built and is the
    restricted session configured. That is the whole of what the remediation can fix.

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
    # A locked-out account is not a disabled account, and Get-LocalUser cannot report a lockout.
    # An autologon failure loop locks the account out, the lockout survives a reboot and a
    # password rotation, and every check above still passes while the device asks for a
    # password on every boot. Without this the remediation is never re-run to clear it.
    try {
        if (([adsi]"WinNT://./$user,user").IsAccountLocked) { Write-Output "$user is locked out"; exit 1 }
    } catch { Write-Output "Could not read the lockout state on $user"; exit 1 }
    if (Get-LocalGroupMember -Group 'Administrators' -Member $user -ErrorAction SilentlyContinue) { Write-Output "$user is an administrator"; exit 1 }

    $wl = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
    if ($wl.AutoAdminLogon -ne '1' -or $wl.DefaultUserName -ne $user) { Write-Output 'Autologon not configured'; exit 1 }
    if ($null -ne $wl.DefaultPassword)   { Write-Output 'Cleartext DefaultPassword present - must be LSA secret only'; exit 1 }
    if ($null -ne $wl.DefaultDomainName) { Write-Output 'DefaultDomainName is set - must not be set for a local account'; exit 1 }

    $aa = Get-CimInstance -Namespace 'root\cimv2\mdm\dmmap' -ClassName 'MDM_AssignedAccess' -ErrorAction SilentlyContinue
    if (-not $aa -or -not $aa.Configuration) { Write-Output 'Assigned Access not applied'; exit 1 }
    $cfgXml = [System.Net.WebUtility]::HtmlDecode($aa.Configuration)
    if (-not $cfgXml.Contains($user)) { Write-Output 'Assigned Access does not name the kiosk account'; exit 1 }
    if ($cfgXml.Contains('[SERIAL]')) { Write-Output 'Assigned Access holds the literal [SERIAL] placeholder - a configuration profile has overwritten this node'; exit 1 }

    Write-Output "Compliant: $user, autologon set, Assigned Access applied"
    exit 0
}
catch { Write-Output "Detection error: $($_.Exception.Message)"; exit 1 }
