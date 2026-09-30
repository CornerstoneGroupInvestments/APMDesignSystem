# Detect-KioskSessionCleanup.ps1 - APM Participant Kiosk session cleanup 2.0.
# Read-only. Exit 0 compliant, exit 1 drift or error. Always exactly one stdout line.

if ($env:PROCESSOR_ARCHITEW6432) { Write-Output 'PKCLEAN ERROR 2.0 | 32bit-host set-run-64bit'; exit 1 }

$ErrorActionPreference = 'Stop'

$HashSystem = 'E4AEEDCE952F516491A7AA503EB4E72172C098139AE9A684E960F3E06D809F4B'
$HashUser = '8C50173DAE9048D3C9E5418A725403BD5569D54B7AACF767EC81839970731C7B'

$SysBat = 'Clear-KioskSessionData.bat'
$UserBat = 'Clear-KioskUserLogon.bat'
$PkDir = 'C:\APM\PK'
$LogDir = "$PkDir\logs"
$GpRoot = "$env:SystemRoot\System32\GroupPolicy"
$SchTasks = "$env:SystemRoot\System32\schtasks.exe"
$F1 = "$PkDir\$SysBat"
$F2 = "$GpRoot\Machine\Scripts\Startup\$SysBat"
$F3 = "$GpRoot\Machine\Scripts\Shutdown\$SysBat"
$F4 = "$GpRoot\User\Scripts\Logon\$UserBat"
$IniMachinePath = "$GpRoot\Machine\Scripts\scripts.ini"
$IniUserPath = "$GpRoot\User\Scripts\scripts.ini"
$GptPath = "$GpRoot\gpt.ini"
$CseScripts = '{42B5FAAE-6536-11D2-AE5A-0000F87571E3}'
$CseMachine = '{40B6664F-4972-11D1-A7CA-0000F87571E3}'
$CseUser = '{40B66650-4972-11D1-A7CA-0000F87571E3}'
$PolSystem = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System'
$PolWinlogon = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\CurrentVersion\Winlogon'
$PolPower = 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power'
$PolExplorer = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\Explorer'
$MarkerKey = 'HKLM:\SOFTWARE\APM\ParticipantKiosk'
$TaskStart = 'APM-PK-CleanStartup'
$TaskLogon = 'APM-PK-CleanLogon'
$TaskLogoff = 'APM-PK-CleanLogoff'
$IniMachine = @('[Startup]', "0CmdLine=$SysBat", '0Parameters=Startup', '[Shutdown]', "0CmdLine=$SysBat", '0Parameters=Shutdown')
$IniUser = @('[Logon]', "0CmdLine=$UserBat", '0Parameters=')

function Invoke-PkNative($Exe, $NativeArgs) {
    # PS 5.1 promotes redirected native stderr to a terminating error under a global
    # Stop preference. Continue here is scope-local and reverts on return.
    $ErrorActionPreference = 'Continue'
    return (& $Exe @NativeArgs 2>$null)
}

function Test-PayloadHash($Path, $Want) {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }
    $h = Get-FileHash -LiteralPath $Path -Algorithm SHA256 -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty Hash
    return ($h -eq $Want)
}

function Test-IniExact($Path, $Want) {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }
    $got = @(Get-Content -LiteralPath $Path -Force -ErrorAction SilentlyContinue)
    $last = -1
    for ($i = 0; $i -lt $got.Count; $i++) { if ("$($got[$i])".TrimEnd() -ne '') { $last = $i } }
    if (($last + 1) -ne $Want.Count) { return $false }
    for ($i = 0; $i -lt $Want.Count; $i++) { if ("$($got[$i])".TrimEnd() -ne $Want[$i]) { return $false } }
    return $true
}

function Get-IniLine($Lines, $Key) {
    foreach ($ln in $Lines) {
        $t = "$ln".Trim()
        if ($t -like ($Key + '=*')) { return $t }
    }
    return ''
}

function Test-CseLine($Lines, $Key, $NeedA, $NeedB) {
    $v = Get-IniLine $Lines $Key
    return (($v -like "*$NeedA*") -and ($v -like "*$NeedB*"))
}

function Test-GpReg($Phase) {
    # Read Script and Parameters by name: a bare Get-ItemProperty reads every value
    # on the key, and the CSE-written ExecTime QWORD makes that read throw
    # "Specified cast is not valid" on this build (measured on the pilot, 27 Aug 2026).
    $k = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Group Policy\Scripts\$Phase\0\0"
    if (-not (Test-Path -LiteralPath $k)) { return $false }
    $s = ''
    $p = Get-ItemProperty -LiteralPath $k -Name 'Script' -ErrorAction SilentlyContinue
    if ($p) { $s = "$($p | Select-Object -ExpandProperty Script -ErrorAction SilentlyContinue)" }
    $a = ''
    $p = Get-ItemProperty -LiteralPath $k -Name 'Parameters' -ErrorAction SilentlyContinue
    if ($p) { $a = "$($p | Select-Object -ExpandProperty Parameters -ErrorAction SilentlyContinue)" }
    return (($s -like "*$SysBat*") -and ($a -eq $Phase))
}

function Test-TaskOk($Name, $Needles) {
    $raw = Invoke-PkNative $SchTasks @('/query', '/tn', $Name, '/xml', 'ONE')
    if ($LASTEXITCODE -ne 0) { return $false }
    # schtasks writes the XML as UTF-16; captured through a single-byte console
    # encoding every second character is a NUL. Dropping NULs recovers the text.
    $text = ($raw -join ' ') -replace "`0", ''
    foreach ($n in $Needles) {
        if (-not (Select-String -InputObject $text -Pattern $n -SimpleMatch -Quiet)) { return $false }
    }
    return $true
}

function Get-RegValue($Key, $Name) {
    $p = Get-ItemProperty -LiteralPath $Key -Name $Name -ErrorAction SilentlyContinue
    if (-not $p) { return $null }
    return ($p | Select-Object -ExpandProperty $Name -ErrorAction SilentlyContinue)
}

function Get-AuditState {
    $out = Invoke-PkNative "$env:SystemRoot\System32\auditpol.exe" @('/get', '/subcategory:{0CCE9216-69AE-11D9-BED3-505054503030}', '/r')
    if ($LASTEXITCODE -ne 0) { return 'unk' }
    foreach ($ln in $out) {
        if ("$ln" -like '*0CCE9216-69AE-11D9-BED3-505054503030*') {
            $f = "$ln" -split ','
            if ($f.Count -lt 5) { return 'unk' }
            $set = "$($f[4])".Trim()
            if ($set -like '*Success*') { return 'on' }
            if ($set -eq '' -or $set -like '*No Auditing*') { return 'off' }
            return 'unk'
        }
    }
    return 'unk'
}

$line = 'PKCLEAN ERROR 2.0 | detection did not complete'
$exitCode = 1

try {
    $drift = @()

    $fOk = 0
    if (Test-PayloadHash $F1 $HashSystem) { $fOk++ } else { $drift += 'f:pk' }
    if (Test-PayloadHash $F2 $HashSystem) { $fOk++ } else { $drift += 'f:gpstart' }
    if (Test-PayloadHash $F3 $HashSystem) { $fOk++ } else { $drift += 'f:gpshut' }
    if (Test-PayloadHash $F4 $HashUser) { $fOk++ } else { $drift += 'f:gpulogon' }
    if (-not (Test-Path -LiteralPath $LogDir -PathType Container)) { $drift += 'd:logs' }

    $iniOk = 0
    if (Test-IniExact $IniMachinePath $IniMachine) { $iniOk++ } else { $drift += 'ini:m' }
    if (Test-IniExact $IniUserPath $IniUser) { $iniOk++ } else { $drift += 'ini:u' }

    $gptLines = @()
    if (Test-Path -LiteralPath $GptPath -PathType Leaf) {
        $gptLines = @(Get-Content -LiteralPath $GptPath -Force -ErrorAction SilentlyContinue)
    }
    $gptOk = 0
    if (Test-CseLine $gptLines 'gPCMachineExtensionNames' $CseScripts $CseMachine) { $gptOk++ } else { $drift += 'gpt:m' }
    if (Test-CseLine $gptLines 'gPCUserExtensionNames' $CseScripts $CseUser) { $gptOk++ } else { $drift += 'gpt:u' }

    $gpregOk = 0
    if (Test-GpReg 'Startup') { $gpregOk++ } else { $drift += 'gpreg:start' }
    if (Test-GpReg 'Shutdown') { $gpregOk++ } else { $drift += 'gpreg:shut' }

    $tOk = 0
    if (Test-TaskOk $TaskStart @($SysBat, '<Arguments>Startup</Arguments>')) { $tOk++ } else { $drift += 'task:start' }
    if (Test-TaskOk $TaskLogon @($SysBat, '<Arguments>Logon</Arguments>')) { $tOk++ } else { $drift += 'task:logon' }
    if (Test-TaskOk $TaskLogoff @($SysBat, 'EventID=4634 or EventID=4647')) { $tOk++ } else { $drift += 'task:logoff' }

    $polOk = 0
    if ((Get-RegValue $PolSystem 'RunStartupScriptSync') -eq 1) { $polOk++ } else { $drift += 'pol:startupsync' }
    if ((Get-RegValue $PolSystem 'RunLogonScriptSync') -eq 1) { $polOk++ } else { $drift += 'pol:logonsync' }
    if ((Get-RegValue $PolSystem 'MaxGPOScriptWait') -eq 900) { $polOk++ } else { $drift += 'pol:gpwait' }
    if ((Get-RegValue $PolWinlogon 'SyncForegroundPolicy') -eq 1) { $polOk++ } else { $drift += 'pol:syncfg' }
    if ((Get-RegValue $PolPower 'HiberbootEnabled') -eq 0) { $polOk++ } else { $drift += 'pol:hiberboot' }
    if ((Get-RegValue $PolExplorer 'HideAccountNotifications') -eq 1) { $polOk++ } else { $drift += 'pol:acctnotif' }

    $mk = 'no'
    if ("$(Get-RegValue $MarkerKey 'SessionCleanupVersion')" -eq '2.0') { $mk = 'ok' } else { $drift += 'mk' }

    $aud = Get-AuditState
    $lm = "$($ExecutionContext.SessionState.LanguageMode)"
    $counts = "f=$fOk/4 ini=$iniOk/2 gpt=$gptOk/2 gpreg=$gpregOk/2 t=$tOk/3 pol=$polOk/6 mk=$mk"

    if ($drift.Count -eq 0) {
        $line = "PKCLEAN OK 2.0 | $counts | aud=$aud lm=$lm"
        $exitCode = 0
    } else {
        $line = "PKCLEAN DRIFT 2.0 | $counts | drift: " + ($drift -join ' ') + " | aud=$aud lm=$lm"
        $exitCode = 1
    }
} catch {
    $m = (("$_" -split "`n")[0]).Trim()
    if ($m.Length -gt 180) { $m = $m.Substring(0, 180) }
    $ln = ''
    try { $ln = "$($_.InvocationInfo.ScriptLineNumber)" } catch { $ln = '' }
    if ($ln -ne '') { $m = "$m @line $ln" }
    $line = "PKCLEAN ERROR 2.0 | $m"
    $exitCode = 1
}

Write-Output $line
exit $exitCode
# SIG # Begin signature block
# MIIo+gYJKoZIhvcNAQcCoIIo6zCCKOcCAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQUbt6SnSUg2BzZWghWbP4y47nM
# QFGggiITMIIFjTCCBHWgAwIBAgIQDpsYjvnQLefv21DiCEAYWjANBgkqhkiG9w0B
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
# KoZIhvcNAQkEMRYEFKpQLvu6xdZj5DFuxr6ZonQ0jy+DMA0GCSqGSIb3DQEBAQUA
# BIICAGPyfYKBBtOC9t6xEhzFlJoqylZwkgmo+zB/PSTTU3I86wrhS3EtHj44+zSr
# VKIrcE1CwkmK6DwZjap927l622K43hIEV27dszz9mycfTcL1kguDaqJk5nyejJEI
# K7JmxUJQvKQtjMWnjNyITzo8U8iWRBuEVWl83YuXXHcb9llX8qZYDYWbOvUcKHA9
# M5VUjZDPLeqv9q3pW7xFGrxH1B1FNsV7cCLW2vhv1zKHh2/rTQ/pdDHLU1UC3UGm
# KjIFI/iaTGO9M1OGz+NeRNc56dAM9wZ2oGre4UqhB4LSHZghqdeZRGyEY/uO/WYL
# aLLCBXKxYXEqW6IWN0ILYeCtpjvEb/rmLsB0DjuQSL+ZENX8SpQ1Wbi9dYYfjasM
# IDXLurlL4G9G+9jCQjc/gL3btFa+nWcuJqoTBR4NZySzk1oW5U6mOENdOPCYd++H
# ib5MRFW9Id3eB5C6Hy3YmMvD9XJOpDj+xkewiaf8gdGNOOaT4T0XMtbROnd/H8bE
# tGNKNLTi2B3IY9iKAnSkCBEPqiD8pW9HQynaHb87z5Fuu9dr2Hs/HJAAevP4wVqE
# tTmpYEK8GqAj6qx9Sdf83n8f6tWVpPnqwW6UwYH+OFHmBojJOuHM+VRiE5s2s682
# bPakYfaaxNYx1DD+1TaAaY0aTfpaZARRsfLwA2pvHXF2PfeioYIDJjCCAyIGCSqG
# SIb3DQEJBjGCAxMwggMPAgEBMH0waTELMAkGA1UEBhMCVVMxFzAVBgNVBAoTDkRp
# Z2lDZXJ0LCBJbmMuMUEwPwYDVQQDEzhEaWdpQ2VydCBUcnVzdGVkIEc0IFRpbWVT
# dGFtcGluZyBSU0E0MDk2IFNIQTI1NiAyMDI1IENBMQIQCoDvGEuN8QWC0cR2p5V0
# aDANBglghkgBZQMEAgEFAKBpMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJ
# KoZIhvcNAQkFMQ8XDTI2MDgyNzAwMDEzMVowLwYJKoZIhvcNAQkEMSIEIDRRrs6g
# /a2kAgailTA26IOrLO7qAv1LFF1gbU2RKtnPMA0GCSqGSIb3DQEBAQUABIICALlC
# wKQSRXEFWwzeoar5y0rte41FJqGNWybJVL48I65fgsbySbMs8395ouHEAJiyfmDn
# Nmq6Il9FR+poIzbDslqYtkELhD/sQ3nWdpb9s8q39ZB5zEIJmIrejom0cSqpueZv
# YynWGimlaDu85SPIfRbVqt10kmsz81bryqUzLZEOTsi1VukroQ/JvHCuFsgyqcM7
# n1VsNpkncA5fe87U2vkcd8eDBWIePUbq4Jmwon8BJ6b0lHGSuuG5+fKuvVTG3Ypm
# 66mMO+MQ8Y+lmXTJ9qsHrRwr/GQxLYKc20IDN2X9RwV0WFG4VBRligQzHtyvcI7E
# A0MT5u4dkejPv/9Ig8E3kBs0NPe9YLBBvWqAUKxqY5sISGZY8U6ciqDNAOkmdEPK
# VkTNj0ebKpRBtOrICGCV3MmmegWqT6z+swsqqIw8+ROMNkprW9w5PGuUbz3rAOyD
# 0neJPCumelTKVzNg8O2Zzkww+59YBZXBrCGCUxR5cgkdDV4ibigx+T6/N3sGuiw7
# Ga4/eNlcWDnOQ11FSJ8NZzfjA51o67QEqXNcy3aBJAiacgX2uBZ7KOiKoygaCwqy
# 1J8M1YA6Iv9dmBScN4SvBc1G9BSNf95UmfWj/QNcw3mi/6RSrllSEfj3iZ9iKxr2
# KjdYvSXMVEnflKvfaqGZBBf4m47l/WnISeocXhAJ
# SIG # End signature block
