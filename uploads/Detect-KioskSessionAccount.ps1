<#
.SYNOPSIS
    Detection script for the Participant Kiosk session account and Assigned Access state.
    Intune remediation pair: detect. Exit 0 = compliant, 1 = run remediation.
#>
$ErrorActionPreference = 'Stop'
try {
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
<#
    $pol = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' -ErrorAction SilentlyContinue
    if ($pol.LegalNoticeCaption -or $pol.LegalNoticeText) { Write-Output 'Logon banner set (LegalNoticeCaption/LegalNoticeText) - disables autologon, needs a policy exclusion (SOE-07)'; exit 1 }
#>

    $aadPol = Get-ItemProperty 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\System' -ErrorAction SilentlyContinue
    if ($aadPol.PreferredAadTenantDomainName) { Write-Output 'PreferredAadTenantDomainName is set - Microsoft names this as preventing autologon, needs an assignment exclusion'; exit 1 }
    if (Test-Path 'HKLM:\SOFTWARE\Microsoft\PolicyManager\current\device\DeviceLock') { Write-Output 'Device password policy present (PolicyManager DeviceLock) - device password restrictions disable autologon by design, needs an exclusion from the corporate baseline'; exit 1 }

    $aa = Get-CimInstance -Namespace 'root\cimv2\mdm\dmmap' -ClassName 'MDM_AssignedAccess' -ErrorAction SilentlyContinue
    if (-not $aa -or -not $aa.Configuration) { Write-Output 'Assigned Access not applied'; exit 1 }
    $cfgXml = [System.Net.WebUtility]::HtmlDecode($aa.Configuration)
    if ($cfgXml -notmatch [regex]::Escape($user)) { Write-Output 'Assigned Access does not name the kiosk account'; exit 1 }
    if ($cfgXml -match '\[SERIAL\]') { Write-Output 'Assigned Access holds the literal [SERIAL] placeholder - a configuration profile has overwritten this node'; exit 1 }

    Write-Output "Compliant: $user, autologon set, Assigned Access applied"
    exit 0
}
catch { Write-Output "Detection error: $($_.Exception.Message)"; exit 1 }

# SIG # Begin signature block
# MIISlgYJKoZIhvcNAQcCoIIShzCCEoMCAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQUprPBr6W8JtF3IqPoOOXyfKH6
# pReggg7ZMIIGMTCCBRmgAwIBAgITEwAAAAi20mNWi5YBRgAAAAAACDANBgkqhkiG
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
# AQsxDjAMBgorBgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBQ1ZWFd+hOtxYCEChyi
# FhCB63YE6jANBgkqhkiG9w0BAQEFAASCAgAaSqAOdeTxRM8Vw5WTQ+jX6PH3AgzV
# M/eQKa7KEdY2yhyUONt3QJ6/1uYmpy/86mA6DUaU5x94Fn47LdbeudqpHz7ZfLwm
# Mn0GgeOzHjTPJnkqybCU+4I58lpJt9bcTWbRIkbJIZrOLBHZczdohirY8/9bOjN8
# 4ojUYxIWElD4DLwSo9dg9r+96phdyuzNv2Wqjph1qhw2pUNg6dCtfNAX4CVRjs63
# ZIHRA8ORGHiHAJ0xVMi9tzHDUyXFXH068eDdKBfivpN17dMGBN9soptCiqr96w56
# bBS0tprf6KTLxmXQBFEN2/96dunvU6BgfFTNwYdesr9ahaLLPlGxB4o/bbAcBgRd
# eprJncGtUslGCOmuC9rNTIRY0BgFvMQDwWZxAMgoHJRGDNguWlG3xo+39DcXNPiC
# OJgr8ETMCM9sxS0BmpD5ZZjEF8GKH7dxGMxmuQBbbF7U7HDnXDTOcRkDIYjP/jSf
# WTCVu9aE7MsPb41Spw7IV/EK1xS1gkNyvWA7hdbxdnsYbfTXZLiCD7NZvtBEaUEp
# xUk/Rc6ATEn4HCR+zkUIlKvL84alYqqDplAAZfkQFqpGkkJNqi0Li9607Iy6wRf8
# h8MF0c5+IetmFCi9jyNPgO3j/apL6R1lQUMxBSd2pDs9v0YTHglvccsKFTdGc7j4
# JfTLc0ZJebFTEQ==
# SIG # End signature block
