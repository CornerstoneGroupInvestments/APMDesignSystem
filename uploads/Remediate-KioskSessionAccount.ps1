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

# ---- 4. autologon via LSA secret (no cleartext registry password) ------------
$wl = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
[LsaSecret]::Store('DefaultPassword', $pwPlain)
$pwPlain = $null
Set-ItemProperty $wl -Name AutoAdminLogon  -Value '1'   -Type String
Set-ItemProperty $wl -Name DefaultUserName -Value $user -Type String
Remove-ItemProperty $wl -Name DefaultPassword -ErrorAction SilentlyContinue   # never cleartext
Remove-ItemProperty $wl -Name AutoLogonCount  -ErrorAction SilentlyContinue   # never expires
Remove-ItemProperty $wl -Name DefaultDomainName -ErrorAction SilentlyContinue
Write-Output 'Autologon configured (LSA secret)'


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
if (Test-Path $dl) {
    $blockers += "a device password policy is present at $dl. Device password restrictions disable automatic logon by design, and exempting the account from expiry does not address a device-level restriction. Needs an exclusion from the password and DeviceLock settings of the corporate baseline"
}
foreach ($b in $blockers) { Write-Output "BLOCKED: $b" }

# ---- 5. Assigned Access XML, rendered for this account, applied via WMI bridge
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

# SIG # Begin signature block
# MIISlgYJKoZIhvcNAQcCoIIShzCCEoMCAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQUzTDP4gvsleyIBj3XbGQV3uXU
# 4Raggg7ZMIIGMTCCBRmgAwIBAgITEwAAAAi20mNWi5YBRgAAAAAACDANBgkqhkiG
# 9w0BAQsFADAYMRYwFAYDVQQDEw1QREMtUkNBLTAxLUNBMB4XDTI0MDIyOTA4NDUy
# MFoXDTM0MDIyODA4NTUyMFowbjESMBAGCgmSJomT8ixkARkWAmF1MRMwEQYKCZIm
# iZPyLGQBGRYDbmV0MRMwEQYKCZImiZPyLGQBGRYDYXBtMRIwEAYKCZImiZPyLGQB
# GRYCYWQxGjAYBgNVBAMTEWFkLVBEQy1JSUNBLTAxLUNBMIIBIjANBgkqhkiG9w0B
# AQEFAAOCAQ8AMIIBCgKCAQEArdg+ml5IGvnrWduWnksT3jt1kalDcXNedDUbgQza
# XARwX46REk9DL3yR2eS5ljkTW8SZ7PiCXuFUR9D8g4d+l3TgsBkHNC43xjqh0sdI
# GL3kN8mt2x9tVn5qHqGwVziT4Tqtbl5zbxG73woU+u5wzDYHJQV6vooYTOgsrnZX
# X4HZIZwUsdh5rhAW7YibKvlG4uBstYpwvnwdKwSTcj691sFipZJLPq0aQbaF5WmX
# o6aPz6zPkgvnuHGRdnOqxrJBNjJywzSM4SwYM3DdepRC7DrX8g3jbxwOXOWh2TZc
# jABkka/4pVi0e6USlku+yv9HgIPqNIeuaUJSxBgPgDvCHQIDAQABo4IDHDCCAxgw
# EAYJKwYBBAGCNxUBBAMCAQEwIwYJKwYBBAGCNxUCBBYEFMq58m6YjZ6XW7JPEnrg
# 5d8fA009MB0GA1UdDgQWBBRp2LfYO4vYuubZOkDVOZEIjZH42zAZBgkrBgEEAYI3
# FAIEDB4KAFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAf
# BgNVHSMEGDAWgBTaSQdlTWhNMMUJnCCb9v7CVQRpUTCCAUIGA1UdHwSCATkwggE1
# MIIBMaCCAS2gggEphoG/bGRhcDovLy9DTj1QREMtUkNBLTAxLUNBLENOPVBEQy1S
# Q0EtMDEsQ049Q0RQLENOPVB1YmxpYyUyMEtleSUyMFNlcnZpY2VzLENOPVNlcnZp
# Y2VzLENOPUNvbmZpZ3VyYXRpb24sREM9YWQsREM9YXBtLERDPW5ldCxEQz1hdT9j
# ZXJ0aWZpY2F0ZVJldm9jYXRpb25MaXN0P2Jhc2U/b2JqZWN0Q2xhc3M9Y1JMRGlz
# dHJpYnV0aW9uUG9pbnSGPGh0dHA6Ly9wZGMtbWd0LTAyLmFkLmFwbS5uZXQuYXUv
# Q2VydEVucm9sbC9QREMtUkNBLTAxLUNBLmNybIYnaHR0cDovL3BraS5hcG0ubmV0
# LmF1L1BEQy1SQ0EtMDEtQ0EuY3JsMIIBHgYIKwYBBQUHAQEEggEQMIIBDDCBtAYI
# KwYBBQUHMAKGgadsZGFwOi8vL0NOPVBEQy1SQ0EtMDEtQ0EsQ049QUlBLENOPVB1
# YmxpYyUyMEtleSUyMFNlcnZpY2VzLENOPVNlcnZpY2VzLENOPUNvbmZpZ3VyYXRp
# b24sREM9YWQsREM9YXBtLERDPW5ldCxEQz1hdT9jQUNlcnRpZmljYXRlP2Jhc2U/
# b2JqZWN0Q2xhc3M9Y2VydGlmaWNhdGlvbkF1dGhvcml0eTBTBggrBgEFBQcwAoZH
# aHR0cDovL3BkYy1tZ3QtMDIuYWQuYXBtLm5ldC5hdS9DZXJ0RW5yb2xsL1BEQy1S
# Q0EtMDFfUERDLVJDQS0wMS1DQS5jcnQwDQYJKoZIhvcNAQELBQADggEBAKpOhWCa
# 3pv8bxC80GI1Z3JmoZbgcn5GOuKD3+/CJ3DTcEnNee646gKpv6ECXOqQMKt1ouyn
# c3Yu1m0SsmuqaEvevfp1xsdUPHYRyahIYugoSasiMuiJniUgXLUTnnKJyQ8Ixv1x
# FFo9tdYoatV3BdUzPNMgpzf+iL2SOcVRmK7a0G8aeY7tgzi18tei5VXUIxyrGiFv
# YDDkh0blVS7UGbX0pW4a76wN0pvuC9PvHrZ6FIy5z5Mi/DrxVoEJU5WW+DrkFBAm
# XR2gDJIBalPKQ2LeLh0VkRW6vtBytVAdyZXujEF728mM2oRYRegQ5kHWjcF6WAeh
# vpmr9CekBn3Q9+cwggigMIIHiKADAgECAhNOAA0pZo5JjexSy/4MAAEADSlmMA0G
# CSqGSIb3DQEBCwUAMG4xEjAQBgoJkiaJk/IsZAEZFgJhdTETMBEGCgmSJomT8ixk
# ARkWA25ldDETMBEGCgmSJomT8ixkARkWA2FwbTESMBAGCgmSJomT8ixkARkWAmFk
# MRowGAYDVQQDExFhZC1QREMtSUlDQS0wMS1DQTAeFw0yNjAzMTYwMjUxMThaFw0y
# ODAzMTUwMjUxMThaMBsxGTAXBgNVBAMTEEFQTSBDb2RlIFNpZ25pbmcwggIiMA0G
# CSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCw6NVr92cNFDE+5f/Iy++PJqIYbBfo
# CF6N5edt+dWml2yQTRl4uAzzP8EYL6PbajFOVXLyzhd1CisLtD6RYSs6Bujdll0Q
# OTv1lFQX4mBzoO6gYWF+/EB31J7V4JMRX8wxMplt1pDWAgiCtGAsoOjq2hbGZ66t
# bU/exHcprX02uyXdfaH4RnN/FFgZkSaJU76OvFmICJAERblvDXbFUf/kw9iUmhAQ
# BcEwwwU2Oqr2dIHpokdjwv+Y9lVfBEAB7qYRLpx6pDNTeUpkxcHZFby9MfA2QZjK
# b+vHpoE+wiAGId+oEDZsyDSQPBu51mjGCRMCzZXEoto1VidnTIY0Zf/TmPYzmtou
# TQuT1ZBkWUGo6VL0/5X5WSKcoMwysl6AUfwbLjq1ue7hr6Y8LCZEbSMQdClUzJWH
# mGNc0/rsJtvp93Vdf/BLAl6OOrGCqCwXsABEmkLLnrPwlJrOt+KkKSbcnndyiUhK
# VVvWAdXwStuhy5ETh64Qsc/pgEE8QyAPSKkc17F7plqCcyWKmN0oJSgpKPgJrEzo
# +yDOJrdQhceixwcxNxxm/OnZ5ucWJjIDtAALEP/vMvCnZv8Zop9boIjb8f7sULL4
# ZC0z4rMPzbALMoPHJ0qYIb5b49VfxhAhgH6Q6tNT9L/1ogNzNAx66n7iEpzdWkYA
# ttfGqHNRalBDAQIDAQABo4IEiDCCBIQwPQYJKwYBBAGCNxUHBDAwLgYmKwYBBAGC
# NxUIhruSJILnqFuC1Z08hYS6YIWszRtUgfylGoeJ+WMCAWQCAQ0wEwYDVR0lBAww
# CgYIKwYBBQUHAwMwCwYDVR0PBAQDAgeAMBsGCSsGAQQBgjcVCgQOMAwwCgYIKwYB
# BQUHAwMwHQYDVR0OBBYEFKPAApYFoYQ9voVGUJZIeAUfFlBCMB8GA1UdIwQYMBaA
# FGnYt9g7i9i65tk6QNU5kQiNkfjbMIIBkQYDVR0fBIIBiDCCAYQwggGAoIIBfKCC
# AXiGgcRsZGFwOi8vL0NOPWFkLVBEQy1JSUNBLTAxLUNBLENOPVBEQy1JSUNBLTAx
# LENOPUNEUCxDTj1QdWJsaWMlMjBLZXklMjBTZXJ2aWNlcyxDTj1TZXJ2aWNlcyxD
# Tj1Db25maWd1cmF0aW9uLERDPWFkLERDPWFwbSxEQz1uZXQsREM9YXU/Y2VydGlm
# aWNhdGVSZXZvY2F0aW9uTGlzdD9iYXNlP29iamVjdENsYXNzPWNSTERpc3RyaWJ1
# dGlvblBvaW50hkBodHRwOi8vcGRjLW1ndC0wMS5hZC5hcG0ubmV0LmF1L0NlcnRF
# bnJvbGwvYWQtUERDLUlJQ0EtMDEtQ0EuY3JshitodHRwOi8vcGtpLmFwbS5uZXQu
# YXUvYWQtUERDLUlJQ0EtMDEtQ0EuY3JshkBodHRwOi8vcGRjLW1ndC0wMi5hZC5h
# cG0ubmV0LmF1L0NlcnRFbnJvbGwvYWQtUERDLUlJQ0EtMDEtQ0EuY3JsMIIBowYI
# KwYBBQUHAQEEggGVMIIBkTCBuAYIKwYBBQUHMAKGgatsZGFwOi8vL0NOPWFkLVBE
# Qy1JSUNBLTAxLUNBLENOPUFJQSxDTj1QdWJsaWMlMjBLZXklMjBTZXJ2aWNlcyxD
# Tj1TZXJ2aWNlcyxDTj1Db25maWd1cmF0aW9uLERDPWFkLERDPWFwbSxEQz1uZXQs
# REM9YXU/Y0FDZXJ0aWZpY2F0ZT9iYXNlP29iamVjdENsYXNzPWNlcnRpZmljYXRp
# b25BdXRob3JpdHkwaQYIKwYBBQUHMAKGXWh0dHA6Ly9wZGMtbWd0LTAxLmFkLmFw
# bS5uZXQuYXUvQ2VydEVucm9sbC9QREMtSUlDQS0wMS5hZC5hcG0ubmV0LmF1X2Fk
# LVBEQy1JSUNBLTAxLUNBKDEpLmNydDBpBggrBgEFBQcwAoZdaHR0cDovL3BkYy1t
# Z3QtMDIuYWQuYXBtLm5ldC5hdS9DZXJ0RW5yb2xsL1BEQy1JSUNBLTAxLmFkLmFw
# bS5uZXQuYXVfYWQtUERDLUlJQ0EtMDEtQ0EoMSkuY3J0MDcGA1UdEQQwMC6gLAYK
# KwYBBAGCNxQCA6AeDBxBUE1Db2RlU2lnbmluZ0BhZC5hcG0ubmV0LmF1ME8GCSsG
# AQQBgjcZAgRCMECgPgYKKwYBBAGCNxkCAaAwBC5TLTEtNS0yMS0yMDAwNDc4MzU0
# LTEyMDI2NjA2MjktODM5NTIyMTE1LTI1MTg3MA0GCSqGSIb3DQEBCwUAA4IBAQAl
# eMUk1ajz9jAz8dzPyvaJO+v57Cu8jeBGTiWD2eNgTNnGmC5ijs5tsXSQ9xstn6Ym
# L7AKa6zG1nwt1RNS8Ph2iTFsueTsrNC26fWZdxv5tJWiOae+sbseBrcvu/n6A9TF
# 3P9ZV+kepfdCIc9+nBERa/2x9q+QSlMFB/1YlmIdJL5vz3GdpHRRF0Lq25JiJE4m
# GuSalnEm2VhO2Fo8wJeWfML3x3UdpxweIR9ipiUFiRo1LwI4JJrmwBXdOouL5dSj
# I5AIwJlTFWluje1lJwJ0M1int/AEWbBQaLmv37DjtYTVBx6TAMSz4WdQHGcBs0MV
# 9cfE7lXPDcLT3qbH8Vi2MYIDJzCCAyMCAQEwgYUwbjESMBAGCgmSJomT8ixkARkW
# AmF1MRMwEQYKCZImiZPyLGQBGRYDbmV0MRMwEQYKCZImiZPyLGQBGRYDYXBtMRIw
# EAYKCZImiZPyLGQBGRYCYWQxGjAYBgNVBAMTEWFkLVBEQy1JSUNBLTAxLUNBAhNO
# AA0pZo5JjexSy/4MAAEADSlmMAkGBSsOAwIaBQCgeDAYBgorBgEEAYI3AgEMMQow
# CKACgAChAoAAMBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisGAQQBgjcC
# AQsxDjAMBgorBgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBRfPIMS1EMGvNPPWcJR
# SfsnFNMEeTANBgkqhkiG9w0BAQEFAASCAgAQBvEt/QmBeLjZ8pEsYK/QVns4jyNw
# lnfyoGcaztIEPZc/vfJACb2JX20MmVIP7AB0LMEDBrqSS7EodEkSyvJEcoMibDAU
# opA3RVlk7pkvYrZ4hVN70F9FwSIhrgUGg8LZe2rrdfeDUZleRp17I+G9/dqmty0+
# NkTHA6+l9t8yfuXNvmfKtedDuzT4Nj1Gv/nm833bxyVLQZV7YJ5kPWeibIoHrfhy
# nPMb1ooe+BPRYNMsQSa2o/v1OO4zuImznkZyb8MM3K4jENSwap8gsjz+aFocX6gz
# MlEAP9eHLhPMCbUos9rYmnGnyPIaUwPAXyoQDZVw/pjDrQMGfOUbZF9p4io/Npoa
# Zh26TG/wPG0UbW94tNKBT8t1MEy20d6XEOdJsv+s6yHrvvoQgdkc77jton6c3L4a
# f4EwyhldDm7Ob5TRNkEctHixYtkXj72JUj7Ear6lap80yzo9JJFYcAWwh0j1+cWl
# BxYC7763WIZVeqj7wQ80DyhPqkqluHL+DpwNDzptoZ4lxcrVEYdseM4H8WuDOCIV
# 0Lq+JTWJ1pteh9PIdcnjqLZmhJfhUASkrC6hJqDW4+2mwXes7mYdb9pV5TvWX7D4
# f9ZoolyGpezzHt/w8agRNn5chCaQtr+vdnjQ0ydYiSGU5qqC57I40fRTKe2iWUG/
# JCjJBgbBJWxD1g==
# SIG # End signature block
