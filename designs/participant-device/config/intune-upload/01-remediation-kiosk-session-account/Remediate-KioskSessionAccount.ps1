<#
.SYNOPSIS
    Remediation script: creates the per-device kiosk session account Kiosk-<SERIAL>,
    configures automatic logon with a password nobody knows, and applies the multi-app
    Assigned Access configuration naming that account.

.DESCRIPTION
    What it does, in order:
      1. Reads the BIOS serial and derives the account name Kiosk-<SERIAL>. The serial is
         sanitised and capped at 14 characters, so the name stays inside the 20-character
         SAM limit. The detection and purge scripts apply the identical rule.
      2. Creates the local standard user if missing, with the display name set to the same
         value as the account name. The password is 32 characters from a cryptographic RNG,
         generated in memory on this device, set on the account and written only to the
         Winlogon LSA DefaultPassword secret, then discarded. It is never logged, never
         transmitted, never written to the registry in cleartext, and never known to any
         person. A LAPS-gated local administrator could extract the LSA secret; that is the
         stated trade in DDD section 4.3.1 and DR-019.
      3. Denies the account the right to change its own password. Ctrl+Alt+Del is reachable
         from a restricted session, so Change password is reachable; a changed password does
         not update the LSA secret and automatic logon then fails permanently.
      4. Configures Winlogon automatic logon, and creates the Microsoft Edge Start menu
         shortcut, which this Windows build does not ship and without which the
         participant's primary application never appears on Start.
      5. Renders the multi-app Assigned Access XML with this account name and applies it
         through the WMI bridge. Paths are expanded on the device rather than left as
         %ProgramFiles%, and LibreOffice's dependencies are discovered and allowed: both
         were required to make LibreOffice launch under the restricted session. The body is
         the canonical copy in AssignedAccess-ParticipantKiosk.xml with <Account>, the paths
         and the dependency list substituted per device.
         Validate any edit to either copy with check-assigned-access.js.
      6. Rotates: re-running resets the password to a fresh value and re-writes the secret.

    This script does NOT test for the policy-delivered settings that can suppress automatic
    logon (a logon banner, PreferredAadTenantDomainName, a device password policy). Every
    one of them arrives by policy and is rewritten at the next check-in, so no script can
    repair any of them: failing the remediation on them only produced a remediation that
    reported as failed and told an engineer nothing they could act on. Diagnosis of a device
    that does not sign itself in belongs in Get-KioskAutologonBlockers.ps1, which reports
    each setting, its delivery channel and the exclusion needed.

    The remediation's job is the account, the credential, the Edge shortcut and the
    restricted session. That is the whole of what it can fix, and it exits 0 when they are
    in place.

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
# A SAM account name is 20 characters maximum. "Kiosk-" is 6, so the serial is capped at 14
# BEFORE the name is built. The detection and purge scripts apply the identical rule.
$serial = ((Get-CimInstance Win32_BIOS).SerialNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
if (-not $serial) { throw 'No BIOS serial number available' }
if ($serial.Length -gt 14) { $serial = $serial.Substring(0, 14) }
$user = "Kiosk-$serial"

# ---- 2/3. create or repair the account --------------------------------------
$pwPlain = New-RandomPassword
$pw = ConvertTo-SecureString $pwPlain -AsPlainText -Force
# New-LocalUser -Description is limited to 48 characters and throws on a longer value.
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
# Ctrl+Alt+Del is reachable from a restricted session, so Change password is reachable. A
# participant-changed password does not update the LSA secret, and automatic logon then
# fails permanently on that device.
Set-LocalUser -Name $user -UserMayChangePassword $false
Enable-LocalUser -Name $user

# Clear an account lockout. Enable-LocalUser does NOT do this: a disabled account and a
# locked-out account are different states, and there is no Unlock-LocalUser cmdlet.
#
# This matters because of how autologon fails. Each failed automatic logon is a failed logon
# against the account, and the SOE hardening standard sets a lockout threshold. A few boots
# with a wrong or absent credential lock the account out, and a lockout SURVIVES A REBOOT and
# survives a password rotation, so the device asks for a user name and password on every boot
# even though the credential is now correct. Nothing else in this design clears it.
try {
    $adsi = [adsi]"WinNT://./$user,user"
    if ($adsi.IsAccountLocked) {
        $adsi.IsAccountLocked = $false
        $adsi.SetInfo()
        Write-Output "Cleared an account lockout on $user"
    }
} catch {
    Write-Output "WARNING: could not read or clear the lockout state on $user - $($_.Exception.Message)"
}
foreach ($g in 'Administrators') {
    if (Get-LocalGroupMember -Group $g -Member $user -ErrorAction SilentlyContinue) { Remove-LocalGroupMember -Group $g -Member $user }
}
if (-not (Get-LocalGroupMember -Group 'Users' -Member $user -ErrorAction SilentlyContinue)) { Add-LocalGroupMember -Group 'Users' -Member $user }

# ---- 4. autologon (no cleartext registry password) --------------------------
# The secret is stored BEFORE AutoAdminLogon is set: if neither a registry DefaultPassword
# value nor an LSA secret exists when Winlogon evaluates it, Windows flips AutoAdminLogon
# from 1 to 0 and the feature disables itself.
$wl = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
[LsaSecret]::Store('DefaultPassword', $pwPlain)
$pwPlain = $null
Set-ItemProperty $wl -Name AutoAdminLogon  -Value '1'   -Type String
Set-ItemProperty $wl -Name DefaultUserName -Value $user -Type String
Remove-ItemProperty $wl -Name DefaultPassword -ErrorAction SilentlyContinue   # never cleartext
Remove-ItemProperty $wl -Name AutoLogonCount  -ErrorAction SilentlyContinue   # never expires
# Must not be set for a local account. Removed rather than skipped, because an earlier build
# of this script set it, and nothing else would ever clear it.
Remove-ItemProperty $wl -Name DefaultDomainName -ErrorAction SilentlyContinue
Write-Output 'Autologon configured (LSA secret)'

# ---- 4b. Microsoft Edge Start menu shortcut ---------------------------------
# Edge ships no Start menu shortcut on this build: the executable is present and there is no
# Microsoft Edge.lnk in either Start Menu tree. Created here so the build is not missing a
# shortcut every other Windows device has.
#
# NOTHING DEPENDS ON THIS. The Start pin names Edge by its AppID, not by this file (see the
# StartPins comment below). Removing this block would not break the pin. It was load-bearing
# while the pin used desktopAppLink, and it is not any longer.
$edgeExe = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$edgeLnk = "$env:ALLUSERSPROFILE\Microsoft\Windows\Start Menu\Programs\Microsoft Edge.lnk"
if (Test-Path $edgeLnk) {
    Write-Output 'Edge Start menu shortcut already present'
} elseif (-not (Test-Path $edgeExe)) {
    Write-Output "WARNING: $edgeExe not found. The Edge pin cannot appear."
} else {
    $ws = New-Object -ComObject WScript.Shell
    $sc = $ws.CreateShortcut($edgeLnk)
    $sc.TargetPath = $edgeExe
    $sc.WorkingDirectory = Split-Path $edgeExe -Parent
    $sc.Description = 'Microsoft Edge'
    $sc.Save()
    Write-Output "Created Edge Start menu shortcut: $edgeLnk"
}

# ---- 5. Assigned Access XML, rendered for this account, applied via WMI bridge
# Paths are expanded here rather than left as %ProgramFiles% and %SystemRoot%. Environment
# variables in DesktopAppPath expand differently inside the restricted shell than they do for
# an administrator, and an allowed app whose generated rule does not match the path the shell
# launches is denied with nothing the participant can see. Expanding on the device keeps the
# script portable while giving the CSP literal paths only.
$pf = "$env:ProgramFiles"
$pf86 = "${env:ProgramFiles(x86)}"
$sr = "$env:SystemRoot"
$lo = "$pf\LibreOffice\program"

# AppLocker generates one rule per listed file, so a dependency loaded by an allowed
# executable needs its own entry: Microsoft states that if an app has a dependency on another
# app, both must be in the allowed list. These three raised AppLocker audit events on the
# reference device. They are discovered rather than hardcoded, because the bundled Python
# folder carries a version number that changes with every LibreOffice update.
$depApps = ''
$deps = @()
if (Test-Path "$lo\LanguageToolLO.dll") { $deps += "$lo\LanguageToolLO.dll" }
foreach ($f in @(Get-ChildItem $lo -Recurse -Filter '*.pyd' -ErrorAction SilentlyContinue)) {
    if ($f.Name -eq 'select.pyd' -or $f.Name -eq '_socket.pyd') { $deps += "$($f.FullName)" }
}
foreach ($d in $deps) { $depApps += "    <App DesktopAppPath=`"$d`" />`n" }
Write-Output "LibreOffice dependencies allowed: $($deps.Count)"
if ($deps.Count -lt 3) {
    Write-Output 'WARNING: fewer than 3 LibreOffice dependencies found. If LibreOffice is not installed yet, re-run this remediation after it lands, or the allow-list will not name its dependencies.'
}

# This body must stay structurally identical to AssignedAccess-ParticipantKiosk.xml.
# check-assigned-access.js compares the two and fails on any difference.
#
# The Edge Start pin names Edge by the AppID Get-StartApps reports for it, where the GUID is
# the Known Folder ID for Program Files (x86). Measured on the reference device, not guessed:
# a desktopAppLink to Microsoft Edge.lnk, and a packagedAppId naming Edge's AUMID, were both
# tested and both dropped after a restart. Start surfaces Edge as a classic desktop app on
# this build, so desktopAppId is the form that resolves. Re-measure with Get-StartApps if Edge
# ever installs into a different Program Files tree, because the Known Folder GUID changes.
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
    <App DesktopAppPath="$lo\soffice.bin" />
$depApps    <App DesktopAppPath="$pf\Zscaler\ZSATray\ZSATray.exe" />
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
   <v5:StartPins><![CDATA[{"pinnedList":[{"desktopAppId":"{7C5A40EF-A0FB-4BFC-874A-C0F2E0B9FA8E}\\Microsoft\\Edge\\Application\\msedge.exe"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\LibreOffice\\LibreOffice Writer.lnk"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\LibreOffice\\LibreOffice Calc.lnk"},{"desktopAppLink":"%ALLUSERSPROFILE%\\Microsoft\\Windows\\Start Menu\\Programs\\LibreOffice\\LibreOffice Impress.lnk"},{"desktopAppLink":"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\File Explorer.lnk"},{"desktopAppLink":"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\Narrator.lnk"},{"desktopAppLink":"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\Magnify.lnk"},{"desktopAppLink":"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\On-Screen Keyboard.lnk"},{"desktopAppLink":"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Accessibility\\VoiceAccess.lnk"}]}]]></v5:StartPins>
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

$escaped = [System.Security.SecurityElement]::Escape($aaXml)

$ns = 'root\cimv2\mdm\dmmap'
$existing = Get-CimInstance -Namespace $ns -ClassName 'MDM_AssignedAccess' -ErrorAction SilentlyContinue
if ($existing) {
    Set-CimInstance -InputObject $existing -Property @{ Configuration = $escaped }
} else {
    New-CimInstance -Namespace $ns -ClassName 'MDM_AssignedAccess' -Property @{ ParentID = './Vendor/MSFT'; InstanceID = 'AssignedAccess'; Configuration = $escaped } | Out-Null
}
Write-Output "Assigned Access applied for .\$user"
Write-Output 'Remediation complete. Autologon takes effect at next restart.'
exit 0
