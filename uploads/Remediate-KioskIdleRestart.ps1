# Remediate-KioskIdleRestart.ps1 - APM Participant Kiosk idle restart 4.0.
# Converges every item Detect-KioskIdleRestart.ps1 asserts, then re-verifies and
# writes the marker last. Exit 0 remediated, exit 1 failed. Always one stdout line.

if ($env:PROCESSOR_ARCHITEW6432) { Write-Output 'PKIDLE ERROR 4.0 | 32bit-host set-run-64bit'; exit 1 }

$ErrorActionPreference = 'Stop'

$PayloadRestart = @'
@echo off
setlocal EnableExtensions

if defined PROCESSOR_ARCHITEW6432 (
    "%SystemRoot%\Sysnative\cmd.exe" /c ""%~f0" %*"
    exit /b %errorlevel%
)

set "LOG=C:\APM\PK\logs\idle-restart.log"
if not exist "C:\APM\PK\logs" md "C:\APM\PK\logs" >nul 2>&1

REM  One generation of rollover, so the log cannot grow without bound.
if exist "%LOG%" for %%f in ("%LOG%") do if %%~zf GTR 524288 move /y "%LOG%" "%LOG%.old" >nul 2>&1

echo %DATE% %TIME%  inactivity lock detected, restarting >>"%LOG%"

REM  /f closes applications without prompting. Participant data is disposable by
REM  design and the session is already locked, so there is nobody to prompt.
"%SystemRoot%\System32\shutdown.exe" /r /f /t 0
if errorlevel 1 (
    echo %DATE% %TIME%  shutdown /r returned an error, retrying once >>"%LOG%"
    timeout /t 5 /nobreak >nul 2>&1
    "%SystemRoot%\System32\shutdown.exe" /r /f /t 0
    if errorlevel 1 echo %DATE% %TIME%  second attempt also failed >>"%LOG%"
)
endlocal
exit /b 0
'@

$HashRestart = 'C92628A2824A4E4F7F4E35F111763DC7E7ED54D7E505785A4B740D7046BA1172'

$RestartBat = 'Restart-KioskOnLock.bat'
$PkDir = 'C:\APM\PK'
$LogDir = "$PkDir\logs"
$SchTasks = "$env:SystemRoot\System32\schtasks.exe"
$AuditPol = "$env:SystemRoot\System32\auditpol.exe"
$F1 = "$PkDir\$RestartBat"
$PolSystem = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System'
$MarkerKey = 'HKLM:\SOFTWARE\APM\ParticipantKiosk'
$MarkerWow = 'HKLM:\SOFTWARE\WOW6432Node\APM\ParticipantKiosk'
$ProfileList = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList'
$TaskIdle = 'APM-PK-IdleRestart'
$TaskOld = 'APM-PK-IdleWatchdog'
$OldFiles = @('idle-state.txt', 'idle-armed.txt', 'idle-pending.txt', 'idle-debug.txt', 'Watch-KioskIdle.bat', 'Watch-KioskIdle.ps1')
$PwrPolicy = 'HKLM:\SOFTWARE\Policies\Microsoft\Power\PowerSettings\3c0bc021-c8a8-4e07-a973-6b14cbcb2b7e'
$PwrSchemes = 'HKLM:\SYSTEM\CurrentControlSet\Control\Power\User\PowerSchemes'
$PwrVideo = '7516b95f-f776-4464-8c53-06167f40cc99\3c0bc021-c8a8-4e07-a973-6b14cbcb2b7e'
$SsNames = @('ScreenSaveActive', 'ScreenSaveTimeOut', 'ScreenSaverIsSecure', 'SCRNSAVE.EXE')
$SsData = @('1', '600', '1', "$env:SystemRoot\System32\scrnsave.scr")
$LogPath = ''

function Invoke-PkNative($Exe, $NativeArgs) {
    # PS 5.1 promotes redirected native stderr to a terminating error under a global
    # Stop preference. Continue here is scope-local and reverts on return.
    $ErrorActionPreference = 'Continue'
    return (& $Exe @NativeArgs 2>$null)
}

function Write-PkLog($Message) {
    if ($LogPath -ne '') {
        Add-Content -LiteralPath $LogPath -Value ((Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + '  ' + $Message) -Encoding Ascii -ErrorAction SilentlyContinue
    }
}

function Test-PayloadHash($Path, $Want) {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }
    $h = Get-FileHash -LiteralPath $Path -Algorithm SHA256 -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty Hash
    return ($h -eq $Want)
}

function Test-TaskOk($Name, $Needles) {
    $raw = Invoke-PkNative $SchTasks @('/query', '/tn', $Name, '/xml', 'ONE')
    if ($LASTEXITCODE -ne 0) { return $false }
    # schtasks writes the XML as UTF-16; captured through a single-byte console
    # encoding every second character is a NUL. Dropping NULs recovers the text.
    $text = ($raw -join ' ') -replace "`0", ''
    foreach ($n in $Needles) {
        if (-not (Select-String -InputObject $text -Pattern $n -SimpleMatch -CaseSensitive -Quiet)) { return $false }
    }
    return $true
}

function Get-RegValue($Key, $Name) {
    $p = Get-ItemProperty -LiteralPath $Key -Name $Name -ErrorAction SilentlyContinue
    if (-not $p) { return $null }
    return ($p | Select-Object -ExpandProperty $Name -ErrorAction SilentlyContinue)
}

function Get-AuditState {
    $out = Invoke-PkNative $AuditPol @('/get', '/subcategory:{0CCE921C-69AE-11D9-BED3-505054503030}', '/r')
    if ($LASTEXITCODE -ne 0) { return 'unk' }
    foreach ($ln in $out) {
        if ("$ln" -like '*0CCE921C-69AE-11D9-BED3-505054503030*') {
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

function Get-KioskAccount {
    # The directory leaf carries the account's stored case. The computer-name
    # derivation is always uppercase and a path test is case-insensitive, so
    # deriving the name that way can silently produce a filter that never matches.
    # A leaf outside the account shape would build an XPath that registers cleanly
    # and never fires; filter first so a stray sibling cannot mask a valid account.
    $names = @(Get-ChildItem -Path 'C:\Users\Kiosk-*' -Directory -Force -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty Name |
        Where-Object { $_ -match '^Kiosk-[0-9A-Za-z]{1,14}$' } | Sort-Object)
    if ($names.Count -eq 0) { return '' }
    return "$($names[0])"
}

function Get-KioskSid($ProfileDir) {
    if ($ProfileDir -eq '') { return '' }
    $subs = @(Get-ChildItem -LiteralPath $ProfileList -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty PSChildName)
    foreach ($s in $subs) {
        if ("$(Get-RegValue ($ProfileList + '\' + $s) 'ProfileImagePath')" -eq $ProfileDir) { return "$s" }
    }
    return ''
}

function Test-SsValue($Sid, $Name, $Data) {
    # Type matters as much as data: winlogon does a string read, so a REG_DWORD
    # here is a silent no-op. GetValueKind is CLM-blocked; reg.exe reports the type.
    $out = Invoke-PkNative "$env:SystemRoot\System32\reg.exe" @('query', "HKU\$Sid\Control Panel\Desktop", '/v', $Name)
    if ($LASTEXITCODE -ne 0) { return $false }
    if (-not (Select-String -InputObject ($out -join ' ') -Pattern ' REG_SZ ' -SimpleMatch -Quiet)) { return $false }
    return ("$(Get-RegValue "Registry::HKEY_USERS\$Sid\Control Panel\Desktop" $Name)" -eq $Data)
}

function Get-PwrState {
    # Policy override, else the active scheme's value. Absence is never ok: it
    # means the effective value comes from a scheme default this chain never read.
    $v = Get-RegValue $PwrPolicy 'ACSettingIndex'
    if ($null -eq $v) {
        $scheme = "$(Get-RegValue $PwrSchemes 'ActivePowerScheme')"
        if ($scheme -ne '') { $v = Get-RegValue ($PwrSchemes + '\' + $scheme + '\' + $PwrVideo) 'ACSettingIndex' }
    }
    if ($null -eq $v) { return 'unk' }
    if ("$v" -eq '0') { return 'ok' }
    return "$v"
}

function New-PkDir($Path) {
    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        $null = New-Item -Path $Path -ItemType Directory -Force
    }
}

function Write-PkFile($Path, $Text, $Want, $Token) {
    New-PkDir (Split-Path -Path $Path -Parent)
    $try = 0
    while ($true) {
        $try++
        # Delete first: the staged copy is ACLed SYSTEM:(RX), so it is replaced
        # through the parent directory's delete-child right, not overwritten.
        if (Test-Path -LiteralPath $Path -PathType Leaf) {
            Remove-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
        }
        Set-Content -LiteralPath $Path -Value ($Text + "`r`n") -NoNewline -Encoding Ascii -Force -ErrorAction SilentlyContinue
        if (Test-PayloadHash $Path $Want) { return }
        if ($try -ge 2) { throw "PKFAIL: $Token write-failed" }
        Start-Sleep -Seconds 5
    }
}

function Set-PkDword($Key, $Name, $Data, $Token) {
    if (-not (Test-Path -LiteralPath $Key)) { $null = New-Item -Path $Key -Force -ErrorAction SilentlyContinue }
    $null = New-ItemProperty -LiteralPath $Key -Name $Name -PropertyType DWord -Value $Data -Force -ErrorAction SilentlyContinue
    if ((Get-RegValue $Key $Name) -ne $Data) { throw "PKFAIL: $Token write-failed" }
}

function Set-PkString($Key, $Name, $Data, $Token) {
    # REG_SZ, not REG_DWORD: the ADMX stores all four screen-saver values as
    # strings and a DWORD is read as nothing at all.
    if (-not (Test-Path -LiteralPath $Key)) { $null = New-Item -Path $Key -Force -ErrorAction SilentlyContinue }
    $null = New-ItemProperty -LiteralPath $Key -Name $Name -PropertyType String -Value $Data -Force -ErrorAction SilentlyContinue
    if ("$(Get-RegValue $Key $Name)" -ne $Data) { throw "PKFAIL: $Token write-failed" }
}

function Invoke-PkAcl($Path) {
    $null = Invoke-PkNative "$env:SystemRoot\System32\icacls.exe" @($Path, '/inheritance:r', '/grant', 'SYSTEM:(RX)', 'Administrators:(F)')
    return $LASTEXITCODE
}

function New-PkTask($Name, $TaskArgs, $Needles, $Token) {
    $null = Invoke-PkNative $SchTasks @('/delete', '/tn', $Name, '/f')
    $null = Invoke-PkNative $SchTasks $TaskArgs
    $rc = $LASTEXITCODE
    if (-not (Test-TaskOk $Name $Needles)) { throw "PKFAIL: $Token create-failed rc=$rc" }
}

$changed = @()
$acctTxt = 'none'
$aud = 'unk'
$lm = 'unk'
$pwr = 'unk'
$inact = 'none'
$line = 'PKIDLE ERROR 4.0 | remediation did not complete'
$exitCode = 1

try {
    # The marker goes first: a run that fails below must leave the device not-detected.
    Remove-ItemProperty -LiteralPath $MarkerKey -Name 'IdleRestartVersion' -Force -ErrorAction SilentlyContinue

    New-PkDir $PkDir
    if (-not (Test-Path -LiteralPath $LogDir -PathType Container)) {
        New-PkDir $LogDir
        $changed += 'd:logs'
    }
    $LogPath = "$LogDir\remediation-idle-" + (Get-Date -Format 'yyyyMMdd') + '.log'
    Write-PkLog 'run start'

    $lm = "$($ExecutionContext.SessionState.LanguageMode)"
    $aud = Get-AuditState
    try { $pwr = Get-PwrState } catch { $pwr = 'unk' }

    # Unresolvable account is a hard stop, before the task is touched at all. A
    # filterless task would restart the device under an administrator who locked
    # the console, and deleting an existing one would disarm a working device.
    $acct = Get-KioskAccount
    if ($acct -eq '') { throw 'PKFAIL: acct-unresolved' }
    $acctTxt = $acct
    $derived = ''
    if ("$env:COMPUTERNAME" -like 'APM-PK-*') { $derived = 'Kiosk-' + "$env:COMPUTERNAME".Substring(7) }
    if ($derived -ne '' -and $derived -cne $acct) { Write-PkLog "account cross-check: computer name derives $derived, disk has $acct" }
    Write-PkLog "account $acct"

    $null = Invoke-PkNative $SchTasks @('/query', '/tn', $TaskOld)
    if ($LASTEXITCODE -eq 0) {
        # Two mechanisms restarting the same device on two different signals.
        $null = Invoke-PkNative $SchTasks @('/delete', '/tn', $TaskOld, '/f')
        Write-PkLog "watchdog task deleted rc=$LASTEXITCODE"
        $changed += 'old:task'
    }
    $gone = 0
    foreach ($f in $OldFiles) {
        $p = "$PkDir\$f"
        if (Test-Path -LiteralPath $p -PathType Leaf) {
            Remove-Item -LiteralPath $p -Force -ErrorAction SilentlyContinue
            $gone++
        }
    }
    if ($gone -gt 0) { Write-PkLog "watchdog state files removed: $gone" }
    Remove-ItemProperty -LiteralPath $MarkerKey -Name 'IdleWatchdogVersion' -Force -ErrorAction SilentlyContinue
    Remove-ItemProperty -LiteralPath $MarkerWow -Name 'IdleWatchdogVersion' -Force -ErrorAction SilentlyContinue

    if (-not (Test-PayloadHash $F1 $HashRestart)) { Write-PkFile $F1 $PayloadRestart $HashRestart 'f:pk'; $changed += 'f:pk' }

    $rc = Invoke-PkAcl $F1
    if ($rc -ne 0) {
        # icacls needs WRITE_DAC, which only the owner has. Rewriting the file makes
        # SYSTEM the owner again after an elevated admin has replaced it by hand.
        Write-PkLog "acl rc=$rc, rewriting f:pk"
        Write-PkFile $F1 $PayloadRestart $HashRestart 'f:pk'
        if ($changed -notcontains 'f:pk') { $changed += 'f:pk' }
        $rc = Invoke-PkAcl $F1
    }
    if ($rc -ne 0) { throw "PKFAIL: acl:pk icacls rc=$rc" }

    # Absent or 0 only. A different non-zero number belongs to the owning profile.
    $iv = Get-RegValue $PolSystem 'InactivityTimeoutSecs'
    $needInact = ($null -eq $iv)
    if (-not $needInact) { $needInact = ("$iv" -eq '0' -or "$iv" -eq '') }
    if ($needInact) {
        # Never fatal before the task exists: a failed write here lands at verify.
        try {
            Set-PkDword $PolSystem 'InactivityTimeoutSecs' 600 'inact'
            Write-PkLog 'InactivityTimeoutSecs written, 600'
            $changed += 'inact'
        } catch {
            Write-PkLog ("inact write failed: " + (("$_" -split "`n")[0]).Trim())
        }
    }

    # Asserted, not reported: without Success on this subcategory no 4800 is ever
    # written and nothing in this pack fires. Recorded here, failed at the verify.
    if ($aud -ne 'on') {
        $null = Invoke-PkNative $AuditPol @('/set', '/subcategory:{0CCE921C-69AE-11D9-BED3-505054503030}', '/success:enable')
        Write-PkLog "auditpol set rc=$LASTEXITCODE"
        $aud = Get-AuditState
        if ($aud -eq 'on') { $changed += 'aud' }
    }

    $sid = Get-KioskSid ('C:\Users\' + $acct)
    $hive = $false
    if ($sid -ne '') { $hive = (Test-Path -LiteralPath "Registry::HKEY_USERS\$sid") }
    if ($hive) {
        $k = "Registry::HKEY_USERS\$sid\Control Panel\Desktop"
        $n = 0
        # Never fatal before the task exists: a failed write here lands at verify.
        try {
            for ($i = 0; $i -lt $SsNames.Count; $i++) {
                if (-not (Test-SsValue $sid $SsNames[$i] $SsData[$i])) {
                    Set-PkString $k $SsNames[$i] $SsData[$i] 'ss'
                    $n++
                }
            }
        } catch {
            Write-PkLog ("ss write failed: " + (("$_" -split "`n")[0]).Trim())
        }
        if ($n -gt 0) {
            Write-PkLog "screen saver values written: $n"
            $changed += 'ss'
        }
    } else {
        Write-PkLog 'kiosk hive not loaded, screen saver values skipped'
    }

    $xpath = "*[System[(EventID=4800)]] and *[EventData[Data[@Name='TargetUserName']='$acct']]"
    $tr = '\"' + $F1 + '\"'
    $needles = @($RestartBat, 'EventID=4800', $acct)
    if (-not (Test-TaskOk $TaskIdle $needles)) {
        New-PkTask $TaskIdle @('/create', '/tn', $TaskIdle, '/tr', $tr, '/sc', 'ONEVENT', '/ec', 'Security', '/mo', $xpath, '/ru', 'SYSTEM', '/rl', 'HIGHEST', '/f') $needles 'task'
        Write-PkLog 'task registered on Security 4800 for the resolved account'
        $changed += 'task'
    }

    Remove-ItemProperty -LiteralPath $MarkerWow -Name 'IdleRestartVersion' -Force -ErrorAction SilentlyContinue

    $bad = @()
    if (-not (Test-PayloadHash $F1 $HashRestart)) { $bad += 'f:pk' }
    if (-not (Test-Path -LiteralPath $LogDir -PathType Container)) { $bad += 'd:logs' }
    if (-not (Test-TaskOk $TaskIdle @($RestartBat, 'EventID=4800'))) { $bad += 'task' }
    if (-not (Test-TaskOk $TaskIdle @($acct))) { $bad += 'task:acct' }
    if ($aud -ne 'on') { $bad += 'aud' }
    $iv = Get-RegValue $PolSystem 'InactivityTimeoutSecs'
    if ($null -ne $iv) { $inact = "$iv" }
    if ($inact -eq '') { $inact = 'none' }
    if ($inact -eq 'none' -or $inact -eq '0') { $bad += 'inact' }
    if ($hive) {
        for ($i = 0; $i -lt $SsNames.Count; $i++) {
            if (-not (Test-SsValue $sid $SsNames[$i] $SsData[$i])) {
                if ($bad -notcontains 'ss') { $bad += 'ss' }
            }
        }
    }
    $null = Invoke-PkNative $SchTasks @('/query', '/tn', $TaskOld)
    if ($LASTEXITCODE -eq 0) { $bad += 'old:task' }
    if ($bad.Count -gt 0) { throw ('PKFAIL: verify ' + ($bad -join ' ')) }

    if (-not (Test-Path -LiteralPath $MarkerKey)) { $null = New-Item -Path $MarkerKey -Force -ErrorAction SilentlyContinue }
    $null = New-ItemProperty -LiteralPath $MarkerKey -Name 'IdleRestartVersion' -PropertyType String -Value '4.0' -Force -ErrorAction SilentlyContinue
    if ("$(Get-RegValue $MarkerKey 'IdleRestartVersion')" -ne '4.0') { throw 'PKFAIL: mk write-failed' }

    $chTxt = 'none'
    if ($changed.Count -gt 0) { $chTxt = ($changed -join ' ') }
    $line = "PKIDLE REMEDIATED 4.0 | changed: $chTxt | verify=ok acct=$acctTxt aud=$aud inact=$inact pwr=$pwr lm=$lm"
    $exitCode = 0
    Write-PkLog "run ok changed=$chTxt acct=$acctTxt aud=$aud inact=$inact pwr=$pwr lm=$lm"
} catch {
    $m = (("$_" -split "`n")[0]).Trim()
    if ($m.Length -gt 180) { $m = $m.Substring(0, 180) }
    $ln = ''
    try { $ln = "$($_.InvocationInfo.ScriptLineNumber)" } catch { $ln = '' }
    if ($ln -ne '') { $m = "$m @line $ln" }
    $chTxt = 'none'
    if ($changed.Count -gt 0) { $chTxt = ($changed -join ' ') }
    if ($m -like 'PKFAIL:*') {
        $line = "PKIDLE FAIL 4.0 | " + $m.Substring(7).Trim() + " | changed: $chTxt acct=$acctTxt aud=$aud lm=$lm"
    } else {
        $line = "PKIDLE ERROR 4.0 | $m"
    }
    $exitCode = 1
    Write-PkLog "run failed $m changed=$chTxt"
}

Write-Output $line
exit $exitCode

# SIG # Begin signature block
# MIIo+gYJKoZIhvcNAQcCoIIo6zCCKOcCAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQUWzJiNzOT65bhoPqe6seA9tj1
# t1iggiITMIIFjTCCBHWgAwIBAgIQDpsYjvnQLefv21DiCEAYWjANBgkqhkiG9w0B
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
# KoZIhvcNAQkEMRYEFMmbOsH1gO7B/uXgG2NULT6NEv7KMA0GCSqGSIb3DQEBAQUA
# BIICAA4nraB8mnIwmoabWjzbtPCbJYZOmf1Dc0YyyhgawbXfXx1PbsUH20cU0tdU
# KW+slyjoXLVPfICNvRCJwaXz32ufrNT7QdZAiMAcj2dNgJTlUvQ6ya0mHauBvA3z
# Iw9ZK1n/cHnJqyldpmDZM/CoL0smqfGShlyX7/vInswh5pFXXkbs+9hs/YL8qe6q
# SJ7aM0QAAyBKOFhyfwOBE2BAXrFAPtt17260LYKLErWf4rTxZvVO/NU0FzWXaWkh
# eqF5CKL0D8znfftToIlA/p39WaaAPO4SpwJapgexOKPoFjL07cm7G+Gdny/tgEGJ
# AAM7QKpKkYL+P+avLQWwOzBDRV1uva658aTDaf3N0LExgk+X/UI7JVfLG7tCFreH
# 4SzE3OVpxYcAFOZeN8jY3l9DMcANy52fr9BIBnl3XAG+UfL5klc+wLhfEV3qjP1G
# MSN5CDlNM//BXPwrVOrj8Bn/IjseZy4nZQWiaacsokCp1/WrAzcaS/Zky2md/8GS
# S6p/pTnDJUagSRoS+fD2WyZomvZXJr0qFYkEeyu5TwSLINx/JdHwc386gfYN4h/D
# /+mRUfLLYqiXEHeiSXwO5qtsBeekpfU/0qjRElAvaIYplLijTiwXfh1Q2ueBaY6G
# hvJNYnqSbmgBHir8pw7lPKbv3TZLVhjw+68TqcpIm3j3Uj2koYIDJjCCAyIGCSqG
# SIb3DQEJBjGCAxMwggMPAgEBMH0waTELMAkGA1UEBhMCVVMxFzAVBgNVBAoTDkRp
# Z2lDZXJ0LCBJbmMuMUEwPwYDVQQDEzhEaWdpQ2VydCBUcnVzdGVkIEc0IFRpbWVT
# dGFtcGluZyBSU0E0MDk2IFNIQTI1NiAyMDI1IENBMQIQCoDvGEuN8QWC0cR2p5V0
# aDANBglghkgBZQMEAgEFAKBpMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJ
# KoZIhvcNAQkFMQ8XDTI2MDgyNzAzMDIwNlowLwYJKoZIhvcNAQkEMSIEIMk4Ycbc
# 33KoqGbJSKbhpKAKdwHBXhPWZIMv7et9MPPqMA0GCSqGSIb3DQEBAQUABIICAJjZ
# doS0WPlP3h01AXSSaunw3PyDxWC1GrGnVXz+4I7L/c2jZgWVe847FPPvqitxy4pm
# CONLJURLMlYI0IPwoukifrBMj5QU44UfNNlrJQhtq5IfDNhyedcMYSGqd0A8hOON
# AbGEvrMQe2ONtlTUDNnJsRvDUpmEFY3+tHuArc80vkKmXJ0D6tr9lxB/2ZbFfP5U
# xgxjSCdnHuGEBnX3huaHzTgIW2pL8ED9ePoDFJqTRYGPPss9+fgj23p1opjM+0S/
# bwKTJGGPrB5MdRbOFKD4VcJBLbfZn/CfdABv5Lv/bEAaz3lXEtFaKhCz5bC5OHOp
# +ZYkpiAhxdxVKx1sn94D85sjpqKOldGzkM6bkTFJz77KGdNsxfKZe0/EhAxeUKaL
# w7HIG5zqj4ER/OqtPKkgrdCaHKbELXLgSO7/Kzej8vo+WeSCNwwCKXdeW/gKB5fO
# iOSGqdJ34So53gbUJp2MWmEqF3yQRhb0ZVqKwtQb8hH5vuN/nCMKQy5xFpJMEssN
# D6Gn8qQeC7PPigOGpQTvVj1JtpO3/6aI2ZheMVpHM2LfSxTrme4UwCxMGt7nMokZ
# 6U/jJ4eqxI0Kk+HzXFpcB+JQCxiP9L6HnH7YVaUygBNy9oYeD6xEBS9SmDi/1VBJ
# goYTN4TqPGos481EQJZOC8kvzR97/q17AcNEK7Lh
# SIG # End signature block
