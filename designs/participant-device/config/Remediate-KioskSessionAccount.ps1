<#
.SYNOPSIS
    Remediation script: creates the per-device kiosk session account Kiosk-<SERIAL>,
    configures automatic logon with a password nobody knows, and applies the multi-app
    Assigned Access configuration naming that account.
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
    # are excluded).
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
Set-LocalUser -Name $user -UserMayChangePassword $false
Enable-LocalUser -Name $user
foreach ($g in 'Administrators') {
    if (Get-LocalGroupMember -Group $g -Member $user -ErrorAction SilentlyContinue) { Remove-LocalGroupMember -Group $g -Member $user }
}
if (-not (Get-LocalGroupMember -Group 'Users' -Member $user -ErrorAction SilentlyContinue)) { Add-LocalGroupMember -Group 'Users' -Member $user }

# ---- 4. autologon (no cleartext registry password) --------------------------
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
$pf = "$env:ProgramFiles"
$pf86 = "${env:ProgramFiles(x86)}"
$sr = "$env:SystemRoot"
$lo = "$pf\LibreOffice\program"

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

# SIG # Begin signature block
# MIIo+gYJKoZIhvcNAQcCoIIo6zCCKOcCAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQUtsK/byOdmPB0xB0tMpI+ff8k
# GbCggiITMIIFjTCCBHWgAwIBAgIQDpsYjvnQLefv21DiCEAYWjANBgkqhkiG9w0B
# AQwFADBlMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYD
# VQQLExB3d3cuZGlnaWNlcnQuY29tMSQwIgYDVQQDExtEaWdpQ2VydCBBc3N1cmVk
# IElEIFJvb3QgQ0EwHhcNMjIwODAxMDAwMDAwWhcNMzExMTA5MjM1OTU5WjBiMQsw
# CQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3d3cu
# ZGlnaWNlcnQuY29tMSEwHwYDVQQDExhEaWdpQ2VydCBUcnVzdGVkIFJvb3QgRzQw
# ggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQC/5pBzaN675F1KPDAiMGkz
# 7MKnJS7JIT3yithZwuEppz1Yq3aaza57G4QNxDAf8xukOBbrVsaXbR2rsnnyyhHS
# 5F/WBTxSD1Ifxp4VpX6+n6lXFllVcq9ok3DCsrp1mWpzMpTREEQQLt+C8weE5nQ7
# bXHiLQwb7iDVySAdYyktzuxeTsiT+CFhmzTrBcZe7FsavOvJz82sNEBfsXpm7nfI
# SKhmV1efVFiODCu3T6cw2Vbuyntd463JT17lNecxy9qTXtyOj4DatpGYQJB5w3jH
# trHEtWoYOAMQjdjUN6QuBX2I9YI+EJFwq1WCQTLX2wRzKm6RAXwhTNS8rhsDdV14
# Ztk6MUSaM0C/CNdaSaTC5qmgZ92kJ7yhTzm1EVgX9yRcRo9k98FpiHaYdj1ZXUJ2
# h4mXaXpI8OCiEhtmmnTK3kse5w5jrubU75KSOp493ADkRSWJtppEGSt+wJS00mFt
# 6zPZxd9LBADMfRyVw4/3IbKyEbe7f/LVjHAsQWCqsWMYRJUadmJ+9oCw++hkpjPR
# iQfhvbfmQ6QYuKZ3AeEPlAwhHbJUKSWJbOUOUlFHdL4mrLZBdd56rF+NP8m800ER
# ElvlEFDrMcXKchYiCd98THU/Y+whX8QgUWtvsauGi0/C1kVfnSD8oR7FwI+isX4K
# Jpn15GkvmB0t9dmpsh3lGwIDAQABo4IBOjCCATYwDwYDVR0TAQH/BAUwAwEB/zAd
# BgNVHQ4EFgQU7NfjgtJxXWRM3y5nP+e6mK4cD08wHwYDVR0jBBgwFoAUReuir/SS
# y4IxLVGLp6chnfNtyA8wDgYDVR0PAQH/BAQDAgGGMHkGCCsGAQUFBwEBBG0wazAk
# BggrBgEFBQcwAYYYaHR0cDovL29jc3AuZGlnaWNlcnQuY29tMEMGCCsGAQUFBzAC
# hjdodHRwOi8vY2FjZXJ0cy5kaWdpY2VydC5jb20vRGlnaUNlcnRBc3N1cmVkSURS
# b290Q0EuY3J0MEUGA1UdHwQ+MDwwOqA4oDaGNGh0dHA6Ly9jcmwzLmRpZ2ljZXJ0
# LmNvbS9EaWdpQ2VydEFzc3VyZWRJRFJvb3RDQS5jcmwwEQYDVR0gBAowCDAGBgRV
# HSAAMA0GCSqGSIb3DQEBDAUAA4IBAQBwoL9DXFXnOF+go3QbPbYW1/e/Vwe9mqyh
# hyzshV6pGrsi+IcaaVQi7aSId229GhT0E0p6Ly23OO/0/4C5+KH38nLeJLxSA8hO
# 0Cre+i1Wz/n096wwepqLsl7Uz9FDRJtDIeuWcqFItJnLnU+nBgMTdydE1Od/6Fmo
# 8L8vC6bp8jQ87PcDx4eo0kxAGTVGamlUsLihVo7spNU96LHc/RzY9HdaXFSMb++h
# UD38dglohJ9vytsgjTVgHAIDyyCwrFigDkBjxZgiwbJZ9VVrzyerbHbObyMt9H5x
# aiNrIv8SuFQtJ37YOtnwtoeW/VvRXKwYw02fc7cBqZ9Xql4o4rmUMIIGMTCCBRmg
# AwIBAgITEwAAAAi20mNWi5YBRgAAAAAACDANBgkqhkiG9w0BAQsFADAYMRYwFAYD
# VQQDEw1QREMtUkNBLTAxLUNBMB4XDTI0MDIyOTA4NDUyMFoXDTM0MDIyODA4NTUy
# MFowbjESMBAGCgmSJomT8ixkARkWAmF1MRMwEQYKCZImiZPyLGQBGRYDbmV0MRMw
# EQYKCZImiZPyLGQBGRYDYXBtMRIwEAYKCZImiZPyLGQBGRYCYWQxGjAYBgNVBAMT
# EWFkLVBEQy1JSUNBLTAxLUNBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
# AQEArdg+ml5IGvnrWduWnksT3jt1kalDcXNedDUbgQzaXARwX46REk9DL3yR2eS5
# ljkTW8SZ7PiCXuFUR9D8g4d+l3TgsBkHNC43xjqh0sdIGL3kN8mt2x9tVn5qHqGw
# VziT4Tqtbl5zbxG73woU+u5wzDYHJQV6vooYTOgsrnZXX4HZIZwUsdh5rhAW7Yib
# KvlG4uBstYpwvnwdKwSTcj691sFipZJLPq0aQbaF5WmXo6aPz6zPkgvnuHGRdnOq
# xrJBNjJywzSM4SwYM3DdepRC7DrX8g3jbxwOXOWh2TZcjABkka/4pVi0e6USlku+
# yv9HgIPqNIeuaUJSxBgPgDvCHQIDAQABo4IDHDCCAxgwEAYJKwYBBAGCNxUBBAMC
# AQEwIwYJKwYBBAGCNxUCBBYEFMq58m6YjZ6XW7JPEnrg5d8fA009MB0GA1UdDgQW
# BBRp2LfYO4vYuubZOkDVOZEIjZH42zAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMA
# QTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBTaSQdl
# TWhNMMUJnCCb9v7CVQRpUTCCAUIGA1UdHwSCATkwggE1MIIBMaCCAS2gggEphoG/
# bGRhcDovLy9DTj1QREMtUkNBLTAxLUNBLENOPVBEQy1SQ0EtMDEsQ049Q0RQLENO
# PVB1YmxpYyUyMEtleSUyMFNlcnZpY2VzLENOPVNlcnZpY2VzLENOPUNvbmZpZ3Vy
# YXRpb24sREM9YWQsREM9YXBtLERDPW5ldCxEQz1hdT9jZXJ0aWZpY2F0ZVJldm9j
# YXRpb25MaXN0P2Jhc2U/b2JqZWN0Q2xhc3M9Y1JMRGlzdHJpYnV0aW9uUG9pbnSG
# PGh0dHA6Ly9wZGMtbWd0LTAyLmFkLmFwbS5uZXQuYXUvQ2VydEVucm9sbC9QREMt
# UkNBLTAxLUNBLmNybIYnaHR0cDovL3BraS5hcG0ubmV0LmF1L1BEQy1SQ0EtMDEt
# Q0EuY3JsMIIBHgYIKwYBBQUHAQEEggEQMIIBDDCBtAYIKwYBBQUHMAKGgadsZGFw
# Oi8vL0NOPVBEQy1SQ0EtMDEtQ0EsQ049QUlBLENOPVB1YmxpYyUyMEtleSUyMFNl
# cnZpY2VzLENOPVNlcnZpY2VzLENOPUNvbmZpZ3VyYXRpb24sREM9YWQsREM9YXBt
# LERDPW5ldCxEQz1hdT9jQUNlcnRpZmljYXRlP2Jhc2U/b2JqZWN0Q2xhc3M9Y2Vy
# dGlmaWNhdGlvbkF1dGhvcml0eTBTBggrBgEFBQcwAoZHaHR0cDovL3BkYy1tZ3Qt
# MDIuYWQuYXBtLm5ldC5hdS9DZXJ0RW5yb2xsL1BEQy1SQ0EtMDFfUERDLVJDQS0w
# MS1DQS5jcnQwDQYJKoZIhvcNAQELBQADggEBAKpOhWCa3pv8bxC80GI1Z3JmoZbg
# cn5GOuKD3+/CJ3DTcEnNee646gKpv6ECXOqQMKt1ouync3Yu1m0SsmuqaEvevfp1
# xsdUPHYRyahIYugoSasiMuiJniUgXLUTnnKJyQ8Ixv1xFFo9tdYoatV3BdUzPNMg
# pzf+iL2SOcVRmK7a0G8aeY7tgzi18tei5VXUIxyrGiFvYDDkh0blVS7UGbX0pW4a
# 76wN0pvuC9PvHrZ6FIy5z5Mi/DrxVoEJU5WW+DrkFBAmXR2gDJIBalPKQ2LeLh0V
# kRW6vtBytVAdyZXujEF728mM2oRYRegQ5kHWjcF6WAehvpmr9CekBn3Q9+cwgga0
# MIIEnKADAgECAhANx6xXBf8hmS5AQyIMOkmGMA0GCSqGSIb3DQEBCwUAMGIxCzAJ
# BgNVBAYTAlVTMRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5k
# aWdpY2VydC5jb20xITAfBgNVBAMTGERpZ2lDZXJ0IFRydXN0ZWQgUm9vdCBHNDAe
# Fw0yNTA1MDcwMDAwMDBaFw0zODAxMTQyMzU5NTlaMGkxCzAJBgNVBAYTAlVTMRcw
# FQYDVQQKEw5EaWdpQ2VydCwgSW5jLjFBMD8GA1UEAxM4RGlnaUNlcnQgVHJ1c3Rl
# ZCBHNCBUaW1lU3RhbXBpbmcgUlNBNDA5NiBTSEEyNTYgMjAyNSBDQTEwggIiMA0G
# CSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQC0eDHTCphBcr48RsAcrHXbo0ZodLRR
# F51NrY0NlLWZloMsVO1DahGPNRcybEKq+RuwOnPhof6pvF4uGjwjqNjfEvUi6wui
# m5bap+0lgloM2zX4kftn5B1IpYzTqpyFQ/4Bt0mAxAHeHYNnQxqXmRinvuNgxVBd
# Jkf77S2uPoCj7GH8BLuxBG5AvftBdsOECS1UkxBvMgEdgkFiDNYiOTx4OtiFcMSk
# qTtF2hfQz3zQSku2Ws3IfDReb6e3mmdglTcaarps0wjUjsZvkgFkriK9tUKJm/s8
# 0FiocSk1VYLZlDwFt+cVFBURJg6zMUjZa/zbCclF83bRVFLeGkuAhHiGPMvSGmhg
# aTzVyhYn4p0+8y9oHRaQT/aofEnS5xLrfxnGpTXiUOeSLsJygoLPp66bkDX1ZlAe
# SpQl92QOMeRxykvq6gbylsXQskBBBnGy3tW/AMOMCZIVNSaz7BX8VtYGqLt9MmeO
# reGPRdtBx3yGOP+rx3rKWDEJlIqLXvJWnY0v5ydPpOjL6s36czwzsucuoKs7Yk/e
# hb//Wx+5kMqIMRvUBDx6z1ev+7psNOdgJMoiwOrUG2ZdSoQbU2rMkpLiQ6bGRinZ
# bI4OLu9BMIFm1UUl9VnePs6BaaeEWvjJSjNm2qA+sdFUeEY0qVjPKOWug/G6X5uA
# iynM7Bu2ayBjUwIDAQABo4IBXTCCAVkwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNV
# HQ4EFgQU729TSunkBnx6yuKQVvYv1Ensy04wHwYDVR0jBBgwFoAU7NfjgtJxXWRM
# 3y5nP+e6mK4cD08wDgYDVR0PAQH/BAQDAgGGMBMGA1UdJQQMMAoGCCsGAQUFBwMI
# MHcGCCsGAQUFBwEBBGswaTAkBggrBgEFBQcwAYYYaHR0cDovL29jc3AuZGlnaWNl
# cnQuY29tMEEGCCsGAQUFBzAChjVodHRwOi8vY2FjZXJ0cy5kaWdpY2VydC5jb20v
# RGlnaUNlcnRUcnVzdGVkUm9vdEc0LmNydDBDBgNVHR8EPDA6MDigNqA0hjJodHRw
# Oi8vY3JsMy5kaWdpY2VydC5jb20vRGlnaUNlcnRUcnVzdGVkUm9vdEc0LmNybDAg
# BgNVHSAEGTAXMAgGBmeBDAEEAjALBglghkgBhv1sBwEwDQYJKoZIhvcNAQELBQAD
# ggIBABfO+xaAHP4HPRF2cTC9vgvItTSmf83Qh8WIGjB/T8ObXAZz8OjuhUxjaaFd
# leMM0lBryPTQM2qEJPe36zwbSI/mS83afsl3YTj+IQhQE7jU/kXjjytJgnn0hvrV
# 6hqWGd3rLAUt6vJy9lMDPjTLxLgXf9r5nWMQwr8Myb9rEVKChHyfpzee5kH0F8HA
# BBgr0UdqirZ7bowe9Vj2AIMD8liyrukZ2iA/wdG2th9y1IsA0QF8dTXqvcnTmpfe
# Qh35k5zOCPmSNq1UH410ANVko43+Cdmu4y81hjajV/gxdEkMx1NKU4uHQcKfZxAv
# BAKqMVuqte69M9J6A47OvgRaPs+2ykgcGV00TYr2Lr3ty9qIijanrUR3anzEwlvz
# ZiiyfTPjLbnFRsjsYg39OlV8cipDoq7+qNNjqFzeGxcytL5TTLL4ZaoBdqbhOhZ3
# ZRDUphPvSRmMThi0vw9vODRzW6AxnJll38F0cuJG7uEBYTptMSbhdhGQDpOXgpIU
# sWTjd6xpR6oaQf/DJbg3s6KCLPAlZ66RzIg9sC+NJpud/v4+7RWsWCiKi9EOLLHf
# MR2ZyJ/+xhCx9yHbxtl5TPau1j/1MIDpMPx0LckTetiSuEtQvLsNz3Qbp7wGWqbI
# iOWCnb5WqxL3/BAPvIXKUjPSxyZsq8WhbaM2tszWkPZPubdcMIIG7TCCBNWgAwIB
# AgIQCoDvGEuN8QWC0cR2p5V0aDANBgkqhkiG9w0BAQsFADBpMQswCQYDVQQGEwJV
# UzEXMBUGA1UEChMORGlnaUNlcnQsIEluYy4xQTA/BgNVBAMTOERpZ2lDZXJ0IFRy
# dXN0ZWQgRzQgVGltZVN0YW1waW5nIFJTQTQwOTYgU0hBMjU2IDIwMjUgQ0ExMB4X
# DTI1MDYwNDAwMDAwMFoXDTM2MDkwMzIzNTk1OVowYzELMAkGA1UEBhMCVVMxFzAV
# BgNVBAoTDkRpZ2lDZXJ0LCBJbmMuMTswOQYDVQQDEzJEaWdpQ2VydCBTSEEyNTYg
# UlNBNDA5NiBUaW1lc3RhbXAgUmVzcG9uZGVyIDIwMjUgMTCCAiIwDQYJKoZIhvcN
# AQEBBQADggIPADCCAgoCggIBANBGrC0Sxp7Q6q5gVrMrV7pvUf+GcAoB38o3zBlC
# MGMyqJnfFNZx+wvA69HFTBdwbHwBSOeLpvPnZ8ZN+vo8dE2/pPvOx/Vj8TchTySA
# 2R4QKpVD7dvNZh6wW2R6kSu9RJt/4QhguSssp3qome7MrxVyfQO9sMx6ZAWjFDYO
# zDi8SOhPUWlLnh00Cll8pjrUcCV3K3E0zz09ldQ//nBZZREr4h/GI6Dxb2UoyrN0
# ijtUDVHRXdmncOOMA3CoB/iUSROUINDT98oksouTMYFOnHoRh6+86Ltc5zjPKHW5
# KqCvpSduSwhwUmotuQhcg9tw2YD3w6ySSSu+3qU8DD+nigNJFmt6LAHvH3KSuNLo
# ZLc1Hf2JNMVL4Q1OpbybpMe46YceNA0LfNsnqcnpJeItK/DhKbPxTTuGoX7wJNdo
# RORVbPR1VVnDuSeHVZlc4seAO+6d2sC26/PQPdP51ho1zBp+xUIZkpSFA8vWdoUo
# HLWnqWU3dCCyFG1roSrgHjSHlq8xymLnjCbSLZ49kPmk8iyyizNDIXj//cOgrY7r
# lRyTlaCCfw7aSUROwnu7zER6EaJ+AliL7ojTdS5PWPsWeupWs7NpChUk555K096V
# 1hE0yZIXe+giAwW00aHzrDchIc2bQhpp0IoKRR7YufAkprxMiXAJQ1XCmnCfgPf8
# +3mnAgMBAAGjggGVMIIBkTAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBTkO/zyMe39
# /dfzkXFjGVBDz2GM6DAfBgNVHSMEGDAWgBTvb1NK6eQGfHrK4pBW9i/USezLTjAO
# BgNVHQ8BAf8EBAMCB4AwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwgwgZUGCCsGAQUF
# BwEBBIGIMIGFMCQGCCsGAQUFBzABhhhodHRwOi8vb2NzcC5kaWdpY2VydC5jb20w
# XQYIKwYBBQUHMAKGUWh0dHA6Ly9jYWNlcnRzLmRpZ2ljZXJ0LmNvbS9EaWdpQ2Vy
# dFRydXN0ZWRHNFRpbWVTdGFtcGluZ1JTQTQwOTZTSEEyNTYyMDI1Q0ExLmNydDBf
# BgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vY3JsMy5kaWdpY2VydC5jb20vRGlnaUNl
# cnRUcnVzdGVkRzRUaW1lU3RhbXBpbmdSU0E0MDk2U0hBMjU2MjAyNUNBMS5jcmww
# IAYDVR0gBBkwFzAIBgZngQwBBAIwCwYJYIZIAYb9bAcBMA0GCSqGSIb3DQEBCwUA
# A4ICAQBlKq3xHCcEua5gQezRCESeY0ByIfjk9iJP2zWLpQq1b4URGnwWBdEZD9gB
# q9fNaNmFj6Eh8/YmRDfxT7C0k8FUFqNh+tshgb4O6Lgjg8K8elC4+oWCqnU/ML9l
# Ffim8/9yJmZSe2F8AQ/UdKFOtj7YMTmqPO9mzskgiC3QYIUP2S3HQvHG1FDu+WUq
# W4daIqToXFE/JQ/EABgfZXLWU0ziTN6R3ygQBHMUBaB5bdrPbF6MRYs03h4obEMn
# xYOX8VBRKe1uNnzQVTeLni2nHkX/QqvXnNb+YkDFkxUGtMTaiLR9wjxUxu2hECZp
# qyU1d0IbX6Wq8/gVutDojBIFeRlqAcuEVT0cKsb+zJNEsuEB7O7/cuvTQasnM9AW
# cIQfVjnzrvwiCZ85EE8LUkqRhoS3Y50OHgaY7T/lwd6UArb+BOVAkg2oOvol/DJg
# ddJ35XTxfUlQ+8Hggt8l2Yv7roancJIFcbojBcxlRcGG0LIhp6GvReQGgMgYxQbV
# 1S3CrWqZzBt1R9xJgKf47CdxVRd/ndUlQ05oxYy2zRWVFjF7mcr4C34Mj3ocCVcc
# AvlKV9jEnstrniLvUxxVZE/rptb7IRE2lskKPIJgbaP5t2nGj/ULLi49xTcBZU8a
# tufk+EMF/cWuiC7POGT75qaL6vdCvHlshtjdNXOCIUjsarfNZzCCCKAwggeIoAMC
# AQICE04ADSlmjkmN7FLL/gwAAQANKWYwDQYJKoZIhvcNAQELBQAwbjESMBAGCgmS
# JomT8ixkARkWAmF1MRMwEQYKCZImiZPyLGQBGRYDbmV0MRMwEQYKCZImiZPyLGQB
# GRYDYXBtMRIwEAYKCZImiZPyLGQBGRYCYWQxGjAYBgNVBAMTEWFkLVBEQy1JSUNB
# LTAxLUNBMB4XDTI2MDMxNjAyNTExOFoXDTI4MDMxNTAyNTExOFowGzEZMBcGA1UE
# AxMQQVBNIENvZGUgU2lnbmluZzCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
# ggIBALDo1Wv3Zw0UMT7l/8jL748mohhsF+gIXo3l52351aaXbJBNGXi4DPM/wRgv
# o9tqMU5VcvLOF3UKKwu0PpFhKzoG6N2WXRA5O/WUVBfiYHOg7qBhYX78QHfUntXg
# kxFfzDEymW3WkNYCCIK0YCyg6OraFsZnrq1tT97EdymtfTa7Jd19ofhGc38UWBmR
# JolTvo68WYgIkARFuW8NdsVR/+TD2JSaEBAFwTDDBTY6qvZ0gemiR2PC/5j2VV8E
# QAHuphEunHqkM1N5SmTFwdkVvL0x8DZBmMpv68emgT7CIAYh36gQNmzINJA8G7nW
# aMYJEwLNlcSi2jVWJ2dMhjRl/9OY9jOa2i5NC5PVkGRZQajpUvT/lflZIpygzDKy
# XoBR/BsuOrW57uGvpjwsJkRtIxB0KVTMlYeYY1zT+uwm2+n3dV1/8EsCXo46sYKo
# LBewAESaQsues/CUms634qQpJtyed3KJSEpVW9YB1fBK26HLkROHrhCxz+mAQTxD
# IA9IqRzXsXumWoJzJYqY3SglKCko+AmsTOj7IM4mt1CFx6LHBzE3HGb86dnm5xYm
# MgO0AAsQ/+8y8Kdm/xmin1ugiNvx/uxQsvhkLTPisw/NsAsyg8cnSpghvlvj1V/G
# ECGAfpDq01P0v/WiA3M0DHrqfuISnN1aRgC218aoc1FqUEMBAgMBAAGjggSIMIIE
# hDA9BgkrBgEEAYI3FQcEMDAuBiYrBgEEAYI3FQiGu5IkgueoW4LVnTyFhLpghazN
# G1SB/KUah4n5YwIBZAIBDTATBgNVHSUEDDAKBggrBgEFBQcDAzALBgNVHQ8EBAMC
# B4AwGwYJKwYBBAGCNxUKBA4wDDAKBggrBgEFBQcDAzAdBgNVHQ4EFgQUo8AClgWh
# hD2+hUZQlkh4BR8WUEIwHwYDVR0jBBgwFoAUadi32DuL2Lrm2TpA1TmRCI2R+Nsw
# ggGRBgNVHR8EggGIMIIBhDCCAYCgggF8oIIBeIaBxGxkYXA6Ly8vQ049YWQtUERD
# LUlJQ0EtMDEtQ0EsQ049UERDLUlJQ0EtMDEsQ049Q0RQLENOPVB1YmxpYyUyMEtl
# eSUyMFNlcnZpY2VzLENOPVNlcnZpY2VzLENOPUNvbmZpZ3VyYXRpb24sREM9YWQs
# REM9YXBtLERDPW5ldCxEQz1hdT9jZXJ0aWZpY2F0ZVJldm9jYXRpb25MaXN0P2Jh
# c2U/b2JqZWN0Q2xhc3M9Y1JMRGlzdHJpYnV0aW9uUG9pbnSGQGh0dHA6Ly9wZGMt
# bWd0LTAxLmFkLmFwbS5uZXQuYXUvQ2VydEVucm9sbC9hZC1QREMtSUlDQS0wMS1D
# QS5jcmyGK2h0dHA6Ly9wa2kuYXBtLm5ldC5hdS9hZC1QREMtSUlDQS0wMS1DQS5j
# cmyGQGh0dHA6Ly9wZGMtbWd0LTAyLmFkLmFwbS5uZXQuYXUvQ2VydEVucm9sbC9h
# ZC1QREMtSUlDQS0wMS1DQS5jcmwwggGjBggrBgEFBQcBAQSCAZUwggGRMIG4Bggr
# BgEFBQcwAoaBq2xkYXA6Ly8vQ049YWQtUERDLUlJQ0EtMDEtQ0EsQ049QUlBLENO
# PVB1YmxpYyUyMEtleSUyMFNlcnZpY2VzLENOPVNlcnZpY2VzLENOPUNvbmZpZ3Vy
# YXRpb24sREM9YWQsREM9YXBtLERDPW5ldCxEQz1hdT9jQUNlcnRpZmljYXRlP2Jh
# c2U/b2JqZWN0Q2xhc3M9Y2VydGlmaWNhdGlvbkF1dGhvcml0eTBpBggrBgEFBQcw
# AoZdaHR0cDovL3BkYy1tZ3QtMDEuYWQuYXBtLm5ldC5hdS9DZXJ0RW5yb2xsL1BE
# Qy1JSUNBLTAxLmFkLmFwbS5uZXQuYXVfYWQtUERDLUlJQ0EtMDEtQ0EoMSkuY3J0
# MGkGCCsGAQUFBzAChl1odHRwOi8vcGRjLW1ndC0wMi5hZC5hcG0ubmV0LmF1L0Nl
# cnRFbnJvbGwvUERDLUlJQ0EtMDEuYWQuYXBtLm5ldC5hdV9hZC1QREMtSUlDQS0w
# MS1DQSgxKS5jcnQwNwYDVR0RBDAwLqAsBgorBgEEAYI3FAIDoB4MHEFQTUNvZGVT
# aWduaW5nQGFkLmFwbS5uZXQuYXUwTwYJKwYBBAGCNxkCBEIwQKA+BgorBgEEAYI3
# GQIBoDAELlMtMS01LTIxLTIwMDA0NzgzNTQtMTIwMjY2MDYyOS04Mzk1MjIxMTUt
# MjUxODcwDQYJKoZIhvcNAQELBQADggEBACV4xSTVqPP2MDPx3M/K9ok76/nsK7yN
# 4EZOJYPZ42BM2caYLmKOzm2xdJD3Gy2fpiYvsAprrMbWfC3VE1Lw+HaJMWy55Oys
# 0Lbp9Zl3G/m0laI5p76xux4Gty+7+foD1MXc/1lX6R6l90Ihz36cERFr/bH2r5BK
# UwUH/ViWYh0kvm/PcZ2kdFEXQurbkmIkTiYa5JqWcSbZWE7YWjzAl5Z8wvfHdR2n
# HB4hH2KmJQWJGjUvAjgkmubAFd06i4vl1KMjkAjAmVMVaW6N7WUnAnQzWKe38ARZ
# sFBoua/fsOO1hNUHHpMAxLPhZ1AcZwGzQxX1x8TuVc8NwtPepsfxWLYxggZRMIIG
# TQIBATCBhTBuMRIwEAYKCZImiZPyLGQBGRYCYXUxEzARBgoJkiaJk/IsZAEZFgNu
# ZXQxEzARBgoJkiaJk/IsZAEZFgNhcG0xEjAQBgoJkiaJk/IsZAEZFgJhZDEaMBgG
# A1UEAxMRYWQtUERDLUlJQ0EtMDEtQ0ECE04ADSlmjkmN7FLL/gwAAQANKWYwCQYF
# Kw4DAhoFAKB4MBgGCisGAQQBgjcCAQwxCjAIoAKAAKECgAAwGQYJKoZIhvcNAQkD
# MQwGCisGAQQBgjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcCARUwIwYJ
# KoZIhvcNAQkEMRYEFBlIJ9ixS2TGivFg/9hhw6dHyT0+MA0GCSqGSIb3DQEBAQUA
# BIICAFimXGFrRgWsyTlwYWbeG0L2Buh3u8QF86svJycOUcf5jJpRiHOf503QfGOm
# FdIMsKJ4xF7JP10zpEMvAHy2wZS0kAnWhM7tBXB+yX/xyBlOAtv6xtMxtYV0F/GY
# ORtzLHXzaGHuDn0QuRDVKcMk6ZwU1QW4GLOKIvbf8rtWfVnJuOzFvQNGJlHEOv72
# NJwtbEqe/wVvU40S6TNGdd5FLULGNxxTu8H6S5pYvru3yViaL3TnLKW2LZVjy8t5
# z7+GaJspxykoEf/ZQc+65BU9LhGGl7pnRlEElGXCKRp7zI5tuUnSxsYNl+BMpKWV
# 1bkczgC/jloW6VlVuUbtzBwbP1yWwjTuXA3hJ7e9HZlfVWB5B0U7Mxe2XFGx/v3f
# j9aCN2c9lfy4VTr3JFv3v6jh3iOW8USLdK7kwwr4NQ8JHHDQfDON86fTy0JQUaKa
# J53/69MJXt/HoVhDO1PvzewK0JBIHwlCdLkXxvOQWb01NiqWSete/zGtFoarIqW/
# M9ufc7i4PA86hit3kUMwoICnSrSa3/PU4NPzbg1BJ7mNcGib9vMa7CXAFfpcxXWJ
# 2syeJ5rKHojElIX12/x99z82meaeq3+89+U9SuEWpY+CNswAvuofuQ+fn7k2rOkz
# Wlf+ouSlNfxBKytcHQ+s+7h7n2KFWbGGqCkkGcLiJ1f4p5OpoYIDJjCCAyIGCSqG
# SIb3DQEJBjGCAxMwggMPAgEBMH0waTELMAkGA1UEBhMCVVMxFzAVBgNVBAoTDkRp
# Z2lDZXJ0LCBJbmMuMUEwPwYDVQQDEzhEaWdpQ2VydCBUcnVzdGVkIEc0IFRpbWVT
# dGFtcGluZyBSU0E0MDk2IFNIQTI1NiAyMDI1IENBMQIQCoDvGEuN8QWC0cR2p5V0
# aDANBglghkgBZQMEAgEFAKBpMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJ
# KoZIhvcNAQkFMQ8XDTI2MDgyNTA1MDkwNFowLwYJKoZIhvcNAQkEMSIEILpTPF2j
# ogw+9EvKLrbgep2Zlxbl5fkYudDMsXeEkR0aMA0GCSqGSIb3DQEBAQUABIICAGIw
# wsboZLtFUy1maRFwD/OKQyrUamHttTPnMRIhsRU9d9jlbI14c4Sj92O4rm83xYwn
# KWil2wQWDOwOPjI95yCGJYC1QJtdGO5EHLouXjJj0oPsYR+9o/8rvH4YXoSFcV43
# 3/8/pjQ7/dLmf1a6lWbst5OiuIfQzSQO/yJBK0mKZPXYFjKL6eD76ElCBttDTXVt
# s3dLTH0NZKxV7g8LNF3QANn9cziwLBekIgIhAW2B4eLpBTVV7LDRD5gdGHNA8uHy
# XgF0KcaVKcDzVa6MY/TC9+43nHo8AY//hg16ZfFZ5ae9BF0MEMPQ/0F4NNTqAEgb
# aehvcVoLTKUSXRM8194fr7YpgnguEINbxJ4KdBeM61OCxJMiMrPNdUxSad1ORCM7
# zMWi7SN+i9viNr4rupe/7XJB/SBwEoeFdJ3oRdoi5uaMJ82KfiZoRylTNaHpiWfk
# rQUtbHhc/1ZsEainFe1/av6lLFOkvRggQOWCL1eeF47JfuciK4/ipMg6Ooi2NGRL
# QyuoM40PlAZg8mSkWMB+abaBxsVev+4NqqkeT8rF/T5yzeqqd2B9eY2fBz7VjjaF
# OLrl+OrmuutJOpyujfYyv1NplV85CvDP4fh3Ur3Fu+rpXAXMswiphc1Cyh2Cb4Uw
# 1JcjCqNI3v1KuYIxNUqsvs5NV/brqZLR6Xz0kmzE
# SIG # End signature block
