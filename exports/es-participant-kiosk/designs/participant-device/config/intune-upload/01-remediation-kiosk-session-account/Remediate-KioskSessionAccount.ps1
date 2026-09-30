<#
.SYNOPSIS
    Remediation script: creates the per-device kiosk session account Kiosk-<SERIAL>,
    configures automatic logon with a password nobody knows, and applies the multi-app
    Assigned Access configuration naming that account.

.DESCRIPTION
    This script owns ./Vendor/MSFT/AssignedAccess/Configuration. No configuration profile
    writes that node. The account name is per device, so no single uploaded payload can
    serve the fleet.

    What it does, in order:
      1. Reads the BIOS serial and derives the account name Kiosk-<SERIAL>. The serial is
         sanitised and capped at 14 characters, so the name stays inside the 20-character
         SAM limit.
      2. Creates the local standard user if missing. The display name is set to the same
         value as the account name, so support sees one identifier and not two. The password
         is 32 characters from a cryptographic RNG, generated in memory on this device. It is set on the account
         and written ONLY to the Winlogon LSA DefaultPassword secret, then discarded.
         It is never logged, never transmitted, never written to the registry in cleartext,
         and never known to any person. A local administrator (LAPS-gated) could extract
         the LSA secret; that is the stated trade in DDD section 4.3.1 and DR-019.
      3. Marks the account PasswordExpires = False and denies the account the right to
         change its own password. Ctrl+Alt+Del is reachable from a restricted session, so
         a participant can otherwise open Change password; a changed password does not
         update the LSA secret and automatic logon then fails permanently on that device.
      4. Configures Winlogon AutoAdminLogon for the account, with AutoLogonCount removed,
         no cleartext DefaultPassword value, and DefaultDomainName removed (it must not be
         set for a local account, and an earlier build of this script set it).
         Reports, but cannot fix, the three policy-delivered settings that each disable
         automatic logon on their own: a logon banner, PreferredAadTenantDomainName, and a
         device password policy. All three arrive by policy and need an assignment
         exclusion, so the script names them instead of failing silently.
      5. Renders the multi-app Assigned Access XML with this account name and applies it
         through the WMI bridge (MDM_AssignedAccess). The body is the canonical copy in
         AssignedAccess-ParticipantKiosk.xml with <Account> substituted per device.
         Validate any edit to either copy with check-assigned-access.js.
      6. Rotates: if the account already exists but autologon is broken, it resets the
         password to a fresh random value and re-writes the LSA secret. Re-running is safe.

.NOTES
    Runs as SYSTEM, 64-bit. Sign with the APM code-signing certificate (SOE-02).
    Policy: CDG-W11-REM-Kiosk Session Account-P-1.0 (remediation half).
    Assignment: sg-dyn-dvc-cdg-participant-kiosk, run at enrolment and daily.
#>
$ErrorActionPreference = 'Stop'

# ---- LSA secret writer (LsaStorePrivateData) --------------------------------
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class LsaSecret {
    [StructLayout(LayoutKind.Sequential)] struct LSA_UNICODE_STRING { public ushort Length; public ushort MaximumLength; public IntPtr Buffer; }
    [StructLayout(LayoutKind.Sequential)] struct LSA_OBJECT_ATTRIBUTES { public int Length; public IntPtr RootDirectory; public IntPtr ObjectName; public uint Attributes; public IntPtr SecurityDescriptor; public IntPtr SecurityQualityOfService; }
    [DllImport("advapi32.dll", SetLastError = true)] static extern uint LsaOpenPolicy(IntPtr systemName, ref LSA_OBJECT_ATTRIBUTES attrs, uint access, out IntPtr handle);
    [DllImport("advapi32.dll", SetLastError = true)] static extern uint LsaStorePrivateData(IntPtr handle, ref LSA_UNICODE_STRING key, ref LSA_UNICODE_STRING data);
    [DllImport("advapi32.dll")] static extern uint LsaClose(IntPtr handle);
    static LSA_UNICODE_STRING ToLsa(string s, IntPtr buf) { LSA_UNICODE_STRING u; u.Buffer = buf; u.Length = (ushort)(s.Length * 2); u.MaximumLength = (ushort)((s.Length + 1) * 2); return u; }
    public static void Store(string key, string value) {
        var attrs = new LSA_OBJECT_ATTRIBUTES(); attrs.Length = Marshal.SizeOf(attrs);
        IntPtr h;
        if (LsaOpenPolicy(IntPtr.Zero, ref attrs, 0x00000FFF, out h) != 0) throw new Exception("LsaOpenPolicy failed");
        var kb = Marshal.StringToHGlobalUni(key); var vb = Marshal.StringToHGlobalUni(value);
        try {
            var k = ToLsa(key, kb); var v = ToLsa(value, vb);
            if (LsaStorePrivateData(h, ref k, ref v) != 0) throw new Exception("LsaStorePrivateData failed");
        } finally { Marshal.ZeroFreeGlobalAllocUnicode(vb); Marshal.FreeHGlobal(kb); LsaClose(h); }
    }
}
'@

function New-RandomPassword {
    # 32 characters drawn uniformly from a 69-character alphabet (ambiguous I, O, l, 0 and 1
    # are excluded). Rejection sampling keeps the draw unbiased: a plain byte modulo 69 would
    # favour the first 49 characters, because 256 is not a whole multiple of 69.
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*+-=?'
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $limit = 256 - (256 % $alphabet.Length)   # 207 for a 69-character alphabet
    $chars = New-Object System.Collections.Generic.List[char]
    $b = New-Object byte[] 1
    while ($chars.Count -lt 32) {
        $rng.GetBytes($b)
        if ($b[0] -lt $limit) { $chars.Add($alphabet[$b[0] % $alphabet.Length]) }
    }
    -join $chars
}

# ---- 1. account name from the serial ----------------------------------------
# A SAM account name is 20 characters maximum. "Kiosk-" is 6, so the serial is capped at
# 14. A Dell service tag is 7 characters and is unaffected. Virtual-machine serials are
# long: a Parallels serial is 14 after sanitising (exactly at the limit), and VMware and
# Hyper-V serials are longer, which would produce an invalid name. Truncation is
# deterministic and the detection script applies the identical rule, so both halves of the
# pair always derive the same account name.
$serial = ((Get-CimInstance Win32_BIOS).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
if (-not $serial) { throw 'No BIOS serial number available' }
if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
$user = "Kiosk-$serial"

# ---- 2/3. create or repair the account --------------------------------------
$pwPlain = New-RandomPassword
$pw = ConvertTo-SecureString $pwPlain -AsPlainText -Force
# New-LocalUser -Description is limited to 48 characters and throws on a longer value.
# The policy name does not fit; it lives in this script's header instead.
$desc = 'APM Participant Kiosk - managed, do not modify'
$acct = Get-LocalUser -Name $user -ErrorAction SilentlyContinue
if (-not $acct) {
    New-LocalUser -Name $user -Password $pw -FullName $user -Description $desc -AccountNeverExpires | Out-Null
    Write-Output "Created $user"
} else {
    Set-LocalUser -Name $user -Password $pw -AccountNeverExpires -FullName $user
    Write-Output "Rotated credential on existing $user"
}
Set-LocalUser -Name $user -PasswordNeverExpires $true
# Ctrl+Alt+Del is reachable from a restricted session, so Change password is reachable.
# A participant-changed password does not update the LSA secret, and automatic logon then
# fails permanently on that device with nothing to explain it.
Set-LocalUser -Name $user -UserMayChangePassword $false
Enable-LocalUser -Name $user
foreach ($g in 'Administrators') {
    if (Get-LocalGroupMember -Group $g -Member $user -ErrorAction SilentlyContinue) { Remove-LocalGroupMember -Group $g -Member $user }
}
if (-not (Get-LocalGroupMember -Group 'Users' -Member $user -ErrorAction SilentlyContinue)) { Add-LocalGroupMember -Group 'Users' -Member $user }

# ---- 4. autologon via LSA secret (no cleartext registry password) ------------
# Order matters. The LSA secret is stored BEFORE AutoAdminLogon is set: if neither a
# registry DefaultPassword value nor an LSA secret exists when Winlogon evaluates it,
# Windows flips AutoAdminLogon from 1 to 0 and the feature disables itself. Storing the
# password in the LSA secret rather than the registry is the arrangement Sysinternals
# Autologon uses and is documented as supported; the registry route stores the password
# in plain text in a key readable by Authenticated Users, which is what DR-011 avoids.
$wl = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
[LsaSecret]::Store('DefaultPassword', $pwPlain)
$pwPlain = $null
Set-ItemProperty $wl -Name AutoAdminLogon  -Value '1'   -Type String
Set-ItemProperty $wl -Name DefaultUserName -Value $user -Type String
Remove-ItemProperty $wl -Name DefaultPassword -ErrorAction SilentlyContinue   # never cleartext
Remove-ItemProperty $wl -Name AutoLogonCount  -ErrorAction SilentlyContinue   # never expires
# DefaultDomainName must NOT be set for a local account. Removed rather than skipped,
# because a device that ran an earlier build of this script has the value set and
# nothing else would ever clear it.
Remove-ItemProperty $wl -Name DefaultDomainName -ErrorAction SilentlyContinue
Write-Output 'Autologon configured (LSA secret)'

# Three policy-delivered settings each disable automatic logon on their own, and no script
# can clear any of them: they arrive by policy and are rewritten at every check-in. Report
# each by name so the cause is visible, instead of presenting as a device that reaches the
# sign-in screen and waits with nothing in any log.
$blockers = @()
$pol = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' -ErrorAction SilentlyContinue
if ($pol.LegalNoticeCaption -or $pol.LegalNoticeText) {
    $blockers += 'a logon banner is set (LegalNoticeCaption/LegalNoticeText). Needs an exclusion from the policy that sets it, and a variation against the SOE hardening standard (SOE-07)'
}
$aadPol = Get-ItemProperty 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\System' -ErrorAction SilentlyContinue
if ($aadPol.PreferredAadTenantDomainName) {
    $blockers += 'PreferredAadTenantDomainName is set. Microsoft names this setting as preventing automatic logon. Needs an assignment exclusion'
}
$dl = 'HKLM:\SOFTWARE\Microsoft\PolicyManager\current\device\DeviceLock'
# Test the VALUES, never the key. Windows pre-creates an area key under PolicyManager for
# nearly every policy area whether or not anything is configured, so the key existing proves
# nothing. Testing the key made this a false positive on every device, which meant a
# permanent exit 1 and a remediation Intune reported as failing forever.
# DevicePasswordEnabled is inverted in the DeviceLock CSP: 0 means a password IS required.
$dlv = if (Test-Path $dl) { Get-ItemProperty $dl -ErrorAction SilentlyContinue } else { $null }
$pwHits = @()
if ($dlv) {
    if ($null -ne $dlv.DevicePasswordEnabled -and [int]$dlv.DevicePasswordEnabled -eq 0) { $pwHits += 'DevicePasswordEnabled=0 (inverted: a password IS required)' }
    foreach ($n in 'MinDevicePasswordLength', 'DevicePasswordExpiration', 'MaxDevicePasswordFailedAttempts', 'MinDevicePasswordComplexCharacters') {
        if ($null -ne $dlv.$n -and [int]$dlv.$n -gt 0) { $pwHits += "$n=$($dlv.$n)" }
    }
}
if ($pwHits.Count -gt 0) {
    $blockers += "a device password policy is active: $($pwHits -join ', '). Device password restrictions disable automatic logon by design, and exempting the account from expiry does not address a device-level restriction. Needs an exclusion from the password and DeviceLock settings of the corporate baseline"
}
foreach ($b in $blockers) { Write-Output "BLOCKED: $b" }

# ---- 5. Assigned Access XML, rendered for this account, applied via WMI bridge
# This body must stay structurally identical to AssignedAccess-ParticipantKiosk.xml.
# check-assigned-access.js compares the two and fails on any difference.
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
    <App DesktopAppPath="%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" />
    <App DesktopAppPath="%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge_proxy.exe" />
    <App DesktopAppPath="%ProgramFiles%\LibreOffice\program\swriter.exe" />
    <App DesktopAppPath="%ProgramFiles%\LibreOffice\program\scalc.exe" />
    <App DesktopAppPath="%ProgramFiles%\LibreOffice\program\simpress.exe" />
    <App DesktopAppPath="%ProgramFiles%\LibreOffice\program\soffice.exe" />
    <App DesktopAppPath="%ProgramFiles%\Zscaler\ZSATray\ZSATray.exe" />
    <App DesktopAppPath="%ProgramFiles%\TeamViewer\TeamViewer.exe" />
    <App DesktopAppPath="%SystemRoot%\System32\Narrator.exe" />
    <App DesktopAppPath="%SystemRoot%\System32\Magnify.exe" />
    <App DesktopAppPath="%SystemRoot%\System32\osk.exe" />
    <App DesktopAppPath="%SystemRoot%\System32\VoiceAccess.exe" />
    <App DesktopAppPath="%SystemRoot%\explorer.exe" />
   </AllowedApps></AllAppsList>
   <rs5:FileExplorerNamespaceRestrictions>
    <rs5:AllowedNamespace Name="Downloads" />
    <v3:AllowRemovableDrives />
   </rs5:FileExplorerNamespaceRestrictions>
   <v5:StartPins><![CDATA[{"pinnedList":[{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\Microsoft Edge.lnk"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\LibreOffice Writer.lnk"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\LibreOffice Calc.lnk"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\LibreOffice Impress.lnk"},{"desktopAppLink":"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\File Explorer.lnk"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\Narrator.lnk"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\Magnify.lnk"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\On-Screen Keyboard.lnk"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\Voice Access.lnk"}]}]]></v5:StartPins>
   <Taskbar ShowTaskbar="true" />
  </Profile>
 </Profiles>
 <Configs>
  <Config>
   <Account>.\$user</Account>
   <DefaultProfile Id="$profileId" />
  </Config>
 </Configs>
</AssignedAccessConfiguration>
"@

$ns = 'root\cimv2\mdm\dmmap'
$escaped = [System.Security.SecurityElement]::Escape($aaXml)
$existing = Get-CimInstance -Namespace $ns -ClassName 'MDM_AssignedAccess' -ErrorAction SilentlyContinue
if ($existing) {
    $existing.Configuration = $escaped
    Set-CimInstance -CimInstance $existing
} else {
    New-CimInstance -Namespace $ns -ClassName 'MDM_AssignedAccess' -Property @{ ParentID = './Vendor/MSFT'; InstanceID = 'AssignedAccess'; Configuration = $escaped } | Out-Null
}
Write-Output "Assigned Access applied for .\$user"
if ($blockers.Count -gt 0) {
    Write-Output "Remediation complete, but $($blockers.Count) policy-delivered blocker(s) above will stop automatic logon until excluded."
    exit 1
}
Write-Output 'Remediation complete. Autologon takes effect at next restart.'
exit 0
