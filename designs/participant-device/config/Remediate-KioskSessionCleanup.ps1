# Remediate-KioskSessionCleanup.ps1 - APM Participant Kiosk session cleanup 2.0.
# Converges every item Detect-KioskSessionCleanup.ps1 asserts, then re-verifies and
# writes the marker last. Exit 0 remediated, exit 1 failed. Always one stdout line.

if ($env:PROCESSOR_ARCHITEW6432) { Write-Output 'PKCLEAN ERROR 2.0 | 32bit-host set-run-64bit'; exit 1 }

$ErrorActionPreference = 'Stop'

$PayloadSystem = @'
@echo off
setlocal EnableExtensions EnableDelayedExpansion

if defined PROCESSOR_ARCHITEW6432 (
    "%SystemRoot%\Sysnative\cmd.exe" /c ""%~f0" %*"
    exit /b %errorlevel%
)

set "PHASE=%~1"
if "%PHASE%"=="" set "PHASE=Logon"
set "DRYRUN="
set "ACCOUNT="
if /i "%~2"=="DRYRUN" set "DRYRUN=1"
if /i not "%~2"=="DRYRUN" if not "%~2"=="" set "ACCOUNT=%~2"
if /i "%~3"=="DRYRUN" set "DRYRUN=1"

set "LOGDIR=C:\APM\PK\logs"
if not exist "%LOGDIR%" md "%LOGDIR%" >nul 2>&1
for /f "tokens=1-3 delims=/ " %%a in ("%DATE%") do set "STAMP=%%c%%b%%a"
set "LOG=%LOGDIR%\session-clean-%STAMP%.log"

set "CLEARED=0"
set "SKIPPED=0"
set "LOCKED=0"

call :log "=== %PHASE% pass starting on %COMPUTERNAME% ==="
if defined DRYRUN call :log "DRY RUN - nothing will be removed"

net session >nul 2>&1
if errorlevel 1 (
    call :log "FAIL: not elevated. The print spool, the Recycle Bin and another account's profile are unreachable."
    goto :finish
)

if not defined ACCOUNT (
    set "SERIAL=%COMPUTERNAME:APM-PK-=%"
    if not "!SERIAL!"=="%COMPUTERNAME%" (
        set "ACCOUNT=Kiosk-!SERIAL!"
        call :log "Account from computer name: Kiosk-!SERIAL!"
    ) else (
        call :log "Computer name %COMPUTERNAME% does not carry the APM-PK- prefix."
    )
) else (
    call :log "Account given on the command line: !ACCOUNT!"
)

set "PROFILE="
if defined ACCOUNT if exist "C:\Users\!ACCOUNT!" set "PROFILE=C:\Users\!ACCOUNT!"
if not defined PROFILE (
    for /d %%d in ("C:\Users\Kiosk-*") do (
        if not defined PROFILE (
            set "PROFILE=%%~fd"
            set "ACCOUNT=%%~nxd"
            call :log "Account from the profile on disk: %%~nxd"
        )
    )
)
if defined PROFILE (
    call :log "Cleaning profile !PROFILE!"
) else (
    call :log "No Kiosk- profile found under C:\Users. Per-user locations skipped."
    call :log "Machine-wide locations are still cleared below."
)

set "SID="
if defined PROFILE (
    for /f "tokens=*" %%k in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList" 2^>nul ^| find "S-1-5-21"') do (
        for /f "tokens=2,*" %%p in ('reg query "%%k" /v ProfileImagePath 2^>nul ^| find /i "ProfileImagePath"') do (
            if /i "%%q"=="!PROFILE!" (
                for %%s in ("%%k") do set "SID=%%~nxs"
            )
        )
    )
)
if defined SID (call :log "SID !SID!") else (call :log "Recycle Bin skipped: could not resolve the account SID.")

call :log "--- participant folders"
if defined PROFILE (
    for %%f in (Downloads Desktop Documents Pictures Videos Music OneDrive) do call :clear "!PROFILE!\%%f" "profile\%%f"
)
call :clear "C:\Users\Public\Downloads" "Public\Downloads"
call :clear "C:\Users\Public\Documents" "Public\Documents"
call :clear "C:\Users\Public\Desktop" "Public\Desktop"

call :log "--- application state"
if defined PROFILE (
    call :nuke "!PROFILE!\AppData\Roaming\LibreOffice" "LibreOffice user profile"

    call :nuke "!PROFILE!\AppData\Local\Microsoft\Edge\User Data" "Edge user data"

    call :clear "!PROFILE!\AppData\Roaming\Microsoft\Windows\Recent\AutomaticDestinations" "Jump lists automatic"
    call :clear "!PROFILE!\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations" "Jump lists custom"
    call :clear "!PROFILE!\AppData\Roaming\Microsoft\Windows\Recent" "Recent items"

    call :wipe "!PROFILE!\AppData\Local\Microsoft\Windows\Explorer" "thumbcache_*.db" "Thumbnail cache"
    call :wipe "!PROFILE!\AppData\Local\Microsoft\Windows\Explorer" "iconcache_*.db" "Icon cache"

    call :clear "!PROFILE!\AppData\Local\Temp" "profile Temp"
    call :clear "!PROFILE!\AppData\Local\Microsoft\Windows\INetCache" "INetCache"

    call :nuke "!PROFILE!\AppData\Local\Microsoft\Windows\Clipboard" "Clipboard history"
    call :wipe "!PROFILE!\AppData\Local\Microsoft\Windows\Notifications" "wpndatabase.db*" "Notification database"
)

call :log "--- registry MRU lists"
if defined SID (
    reg query "HKU\!SID!" >nul 2>&1
    if errorlevel 1 (
        call :log "hive not loaded, registry pass skipped - expected at Logoff"
        set /a SKIPPED+=1
    ) else (
        for %%k in (RecentDocs TypedPaths RunMRU WordWheelQuery FileExts) do call :regdel "HKU\!SID!\Software\Microsoft\Windows\CurrentVersion\Explorer\%%k" "%%k"
        for %%k in (OpenSavePidlMRU LastVisitedPidlMRU CIDSizeMRU) do call :regdel "HKU\!SID!\Software\Microsoft\Windows\CurrentVersion\Explorer\ComDlg32\%%k" "ComDlg32\%%k"
    )
)

call :log "--- machine-wide"
call :clear "C:\Windows\System32\spool\PRINTERS" "Print spool"
call :clear "C:\Windows\Temp" "Windows Temp"
if defined SID call :clear "C:\$Recycle.Bin\!SID!" "Recycle Bin kiosk SID"

call :log "--- autologon"
if defined DRYRUN (
    call :log "DRYRUN     autologon repair"
    goto :skipautologon
)
if not defined ACCOUNT (
    call :log "skipped    autologon repair - no account resolved"
    goto :skipautologon
)
net user "!ACCOUNT!" >nul 2>&1
if errorlevel 1 (
    call :log "skipped    autologon repair - local account !ACCOUNT! does not exist yet. The remediation creates it and owns the credential."
    goto :skipautologon
)
set "WL=HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
set "AAL="
for /f "tokens=2,*" %%a in ('reg query "!WL!" /v AutoAdminLogon 2^>nul ^| find /i "AutoAdminLogon"') do set "AAL=%%b"
if not "!AAL!"=="1" (
    call :log "skipped    autologon repair - AutoAdminLogon is '!AAL!', not 1. Enabling it is the remediation's job, not this script's."
    goto :skipautologon
)
set "BEFORE="
for /f "tokens=2,*" %%a in ('reg query "!WL!" /v DefaultUserName 2^>nul ^| find /i "DefaultUserName"') do set "BEFORE=%%b"
if /i "!BEFORE!"=="!ACCOUNT!" (
    call :log "autologon already correct for !ACCOUNT!"
    goto :skipautologon
)
reg add "!WL!" /v DefaultUserName /t REG_SZ /d "!ACCOUNT!" /f >nul 2>&1
reg delete "!WL!" /v DefaultDomainName /f >nul 2>&1
reg delete "!WL!" /v AutoLogonCount /f >nul 2>&1
call :log "autologon repaired: DefaultUserName was '!BEFORE!', now !ACCOUNT!"
:skipautologon

:finish
call :log "--- summary"
call :log "locations cleared: !CLEARED!   not present: !SKIPPED!   items in use: !LOCKED!"
if !LOCKED! GTR 0 if /i "%PHASE%"=="Logoff" call :log "Items in use at logoff are expected. The Shutdown, Startup and Logon passes take them before the next participant starts."
if !LOCKED! GTR 0 if /i not "%PHASE%"=="Logoff" call :log "WARNING: items in use during the %PHASE% pass. Something holds participant data open before the session has started. Investigate."
call :log "=== %PHASE% pass complete ==="
endlocal
exit /b 0

:sanitise
set "RAW=!RAW: =!"
set "RAW=!RAW:.=!"
set "RAW=!RAW:-=!"
set "RAW=!RAW:_=!"
set "RAW=!RAW::=!"
set "RAW=!RAW:,=!"
set "RAW=!RAW:/=!"
set "RAW=!RAW:\=!"
if not defined RAW exit /b 0
set "SERIAL=!RAW:~0,14!"
for %%p in ("a=A" "b=B" "c=C" "d=D" "e=E" "f=F" "g=G" "h=H" "i=I" "j=J" "k=K" "l=L" "m=M" "n=N" "o=O" "p=P" "q=Q" "r=R" "s=S" "t=T" "u=U" "v=V" "w=W" "x=X" "y=Y" "z=Z") do (
    for /f "tokens=1,2 delims==" %%x in (%%p) do set "SERIAL=!SERIAL:%%x=%%y!"
)
exit /b 0

:clear
if not exist "%~1" (set /a SKIPPED+=1 & exit /b 0)
set "N=0"
for /f %%c in ('dir /a /b "%~1" 2^>nul ^| find /c /v ""') do set "N=%%c"
if "!N!"=="0" (call :log "empty      %~2" & exit /b 0)
if defined DRYRUN (call :log "DRYRUN     %~2 - !N! item^(s^)" & exit /b 0)
REM  "*" not "*.*": a wildcard with a dot only matches files that have an
REM  extension, so an extensionless file survived it.
del /f /s /q "%~1\*" >nul 2>&1
for /d %%d in ("%~1\*") do rd /s /q "%%d" >nul 2>&1
set "M=0"
for /f %%c in ('dir /a /b "%~1" 2^>nul ^| find /c /v ""') do set "M=%%c"
if "!M!"=="0" (
    set /a CLEARED+=1
    call :log "cleared    %~2 - !N! item^(s^)"
) else (
    set /a LOCKED+=!M!
    call :log "PARTIAL    %~2 - !N! item^(s^), !M! could not be removed, in use"
)
exit /b 0

:nuke
if not exist "%~1" (set /a SKIPPED+=1 & exit /b 0)
if defined DRYRUN (call :log "DRYRUN     %~2" & exit /b 0)
rd /s /q "%~1" >nul 2>&1
if exist "%~1" (
    set /a LOCKED+=1
    call :log "PARTIAL    %~2 - still present, in use"
) else (
    set /a CLEARED+=1
    call :log "removed    %~2"
)
exit /b 0

:wipe
if not exist "%~1" (set /a SKIPPED+=1 & exit /b 0)
set "N=0"
for %%f in ("%~1\%~2") do if exist "%%f" set /a N+=1
if "!N!"=="0" (call :log "none       %~3" & exit /b 0)
if defined DRYRUN (call :log "DRYRUN     %~3 - !N! file^(s^)" & exit /b 0)
del /f /q "%~1\%~2" >nul 2>&1
set "M=0"
for %%f in ("%~1\%~2") do if exist "%%f" set /a M+=1
if "!M!"=="0" (
    set /a CLEARED+=1
    call :log "cleared    %~3 - !N! file^(s^)"
) else (
    set /a LOCKED+=!M!
    call :log "PARTIAL    %~3 - !M! of !N! in use"
)
exit /b 0

:regdel
reg query "%~1" >nul 2>&1
if errorlevel 1 (set /a SKIPPED+=1 & exit /b 0)
if defined DRYRUN (call :log "DRYRUN     registry %~2" & exit /b 0)
reg delete "%~1" /f >nul 2>&1
reg query "%~1" >nul 2>&1
if errorlevel 1 (
    set /a CLEARED+=1
    call :log "removed    registry %~2"
) else (
    call :log "PARTIAL    registry %~2"
)
exit /b 0

:log
REM  Directory paths, counts and outcomes only. Never a file name.
echo %DATE% %TIME%  %~1
echo %DATE% %TIME%  %~1>>"%LOG%"
exit /b 0
'@

$PayloadUser = @'
@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "LOG=C:\APM\PK\logs\user-logon-clean.log"
if not exist "C:\APM\PK\logs" md "C:\APM\PK\logs" >nul 2>&1

echo %DATE% %TIME%  user logon clean starting for %USERNAME%>>"%LOG%" 2>nul

for %%f in (Downloads Desktop Documents Pictures Videos Music) do (
    if exist "%USERPROFILE%\%%f" (
        del /f /s /q "%USERPROFILE%\%%f\*" >nul 2>&1
        for /d %%d in ("%USERPROFILE%\%%f\*") do rd /s /q "%%d" >nul 2>&1
    )
)

set "REC=%APPDATA%\Microsoft\Windows\Recent"
if exist "%REC%" (
    del /f /q "%REC%\*" >nul 2>&1
    del /f /q "%REC%\AutomaticDestinations\*" >nul 2>&1
    del /f /q "%REC%\CustomDestinations\*" >nul 2>&1
)

set "LO=%APPDATA%\LibreOffice\4\user"
if exist "%LO%\backup" del /f /s /q "%LO%\backup\*" >nul 2>&1
if exist "%LO%\registrymodifications.xcu" del /f /q "%LO%\registrymodifications.xcu" >nul 2>&1
if exist "%LO%\temp" del /f /s /q "%LO%\temp\*" >nul 2>&1

REM  Edge history, downloads list, cookies and form data. Named files rather than
REM  the tree, so Edge starts cleanly instead of rebuilding a missing profile.
set "EDGE=%LOCALAPPDATA%\Microsoft\Edge\User Data\Default"
if exist "%EDGE%" (
    for %%f in (History "History Provider Cache" Cookies "Web Data" "Login Data" "Network Action Predictor" "Top Sites" Favicons "Visited Links") do (
        del /f /q "%EDGE%\%%~f" >nul 2>&1
    )
    del /f /s /q "%EDGE%\Cache\*" >nul 2>&1
    del /f /s /q "%EDGE%\Sessions\*" >nul 2>&1
)

if exist "%TEMP%" del /f /s /q "%TEMP%\*" >nul 2>&1
del /f /q "%LOCALAPPDATA%\Microsoft\Windows\Explorer\thumbcache_*.db" >nul 2>&1

reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v Start_AccountNotifications /t REG_DWORD /d 0 /f >nul 2>&1
REM  User-scope policy values, writable only from inside this hive.
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v HideLogonScripts /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\Software\Policies\Microsoft\Windows\CurrentVersion\AccountNotifications" /v DisableAccountNotifications /t REG_DWORD /d 1 /f >nul 2>&1

echo %DATE% %TIME%  user logon clean complete>>"%LOG%" 2>nul
endlocal
exit /b 0
'@

$HashSystem = 'E4AEEDCE952F516491A7AA503EB4E72172C098139AE9A684E960F3E06D809F4B'
$HashUser = '8C50173DAE9048D3C9E5418A725403BD5569D54B7AACF767EC81839970731C7B'

$SysBat = 'Clear-KioskSessionData.bat'
$UserBat = 'Clear-KioskUserLogon.bat'
$PkDir = 'C:\APM\PK'
$LogDir = "$PkDir\logs"
$GpRoot = "$env:SystemRoot\System32\GroupPolicy"
$SchTasks = "$env:SystemRoot\System32\schtasks.exe"
$Attrib = "$env:SystemRoot\System32\attrib.exe"
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
$MarkerWow = 'HKLM:\SOFTWARE\WOW6432Node\APM\ParticipantKiosk'
$TaskStart = 'APM-PK-CleanStartup'
$TaskLogon = 'APM-PK-CleanLogon'
$TaskLogoff = 'APM-PK-CleanLogoff'
$IniMachine = @('[Startup]', "0CmdLine=$SysBat", '0Parameters=Startup', '[Shutdown]', "0CmdLine=$SysBat", '0Parameters=Shutdown')
$IniUser = @('[Logon]', "0CmdLine=$UserBat", '0Parameters=')
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

function Write-PkIni($Path, $Lines, $Token) {
    New-PkDir (Split-Path -Path $Path -Parent)
    if (Test-Path -LiteralPath $Path -PathType Leaf) { $null = Invoke-PkNative $Attrib @('-h', $Path) }
    Set-Content -LiteralPath $Path -Value $Lines -Encoding Ascii -Force -ErrorAction SilentlyContinue
    if (-not (Test-IniExact $Path $Lines)) { throw "PKFAIL: $Token write-failed" }
    $null = Invoke-PkNative $Attrib @('+h', $Path)
    if ($LASTEXITCODE -ne 0) { Write-PkLog "$Token hide rc=$LASTEXITCODE" }
}

function Add-IniLine($Lines, $NewLine) {
    $ix = -1
    for ($i = 0; $i -lt $Lines.Count; $i++) {
        if ("$($Lines[$i])".Trim() -eq '[General]') { $ix = $i; break }
    }
    if ($ix -lt 0) { return (@('[General]', $NewLine) + $Lines) }
    $out = @()
    for ($i = 0; $i -lt $Lines.Count; $i++) {
        $out += $Lines[$i]
        if ($i -eq $ix) { $out += $NewLine }
    }
    return $out
}

function Add-CseGroup($Lines, $Key, $Group, $NeedA, $NeedB) {
    $ix = -1
    for ($i = 0; $i -lt $Lines.Count; $i++) {
        if ("$($Lines[$i])".Trim() -like ($Key + '=*')) { $ix = $i; break }
    }
    if ($ix -lt 0) { return (Add-IniLine $Lines ($Key + '=' + $Group)) }
    $cur = "$($Lines[$ix])".Trim()
    if (($cur -like "*$NeedA*") -and ($cur -like "*$NeedB*")) { return $Lines }
    # CSE GUID already present with another snap-in: extend that group in place,
    # never append a second group carrying the same CSE.
    if ($cur -like "*$NeedA*") { $new = $cur.Replace($NeedA, ($NeedA + $NeedB)) } else { $new = $cur + $Group }
    if ($new -eq $cur) { $new = $cur + $Group }
    $out = @()
    for ($i = 0; $i -lt $Lines.Count; $i++) {
        if ($i -eq $ix) { $out += $new } else { $out += $Lines[$i] }
    }
    return $out
}

function Step-GptVersion($Lines) {
    $ix = -1
    for ($i = 0; $i -lt $Lines.Count; $i++) {
        if ("$($Lines[$i])".Trim() -like 'Version=*') { $ix = $i; break }
    }
    $ver = [long]0
    if ($ix -ge 0) {
        $txt = ("$($Lines[$ix])".Trim() -replace '(?i)^version=', '')
        if ($txt -match '^\d+$') { $ver = [long]$txt }
    }
    $mach = $ver -band 0xFFFF
    $user = ($ver -shr 16) -band 0xFFFF
    # A wrap lowers the composite value; safe only because gpupdate /force always
    # follows a version step and bypasses version-based change detection.
    if ($mach -ge 65535) { $mach = 1 } else { $mach = $mach + 1 }
    if ($user -ge 65535) { $user = 1 } else { $user = $user + 1 }
    $new = 'Version=' + (($user -shl 16) -bor $mach)
    if ($ix -lt 0) { return (Add-IniLine $Lines $new) }
    $out = @()
    for ($i = 0; $i -lt $Lines.Count; $i++) {
        if ($i -eq $ix) { $out += $new } else { $out += $Lines[$i] }
    }
    return $out
}

function Write-PkGpt($Path, $Lines) {
    Set-Content -LiteralPath $Path -Value $Lines -Encoding Ascii -Force -ErrorAction SilentlyContinue
    # Symmetric compare: $Lines came from a real file and may carry trailing blank
    # lines or whitespace, which Test-IniExact's one-sided contract rejects.
    $back = @()
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $back = @(Get-Content -LiteralPath $Path -Force -ErrorAction SilentlyContinue)
    }
    $ok = ($back.Count -ge $Lines.Count)
    if ($ok) {
        for ($i = 0; $i -lt $Lines.Count; $i++) {
            if ("$($back[$i])".TrimEnd() -ne "$($Lines[$i])".TrimEnd()) { $ok = $false; break }
        }
    }
    if (-not $ok) {
        Write-PkLog ('gpt verify failed lines=' + $Lines.Count)
        throw 'PKFAIL: gpt:m gpt:u write-failed'
    }
}

function Set-PkDword($Key, $Name, $Data, $Token) {
    if (-not (Test-Path -LiteralPath $Key)) { $null = New-Item -Path $Key -Force -ErrorAction SilentlyContinue }
    $null = New-ItemProperty -LiteralPath $Key -Name $Name -PropertyType DWord -Value $Data -Force -ErrorAction SilentlyContinue
    if ((Get-RegValue $Key $Name) -ne $Data) { throw "PKFAIL: $Token write-failed" }
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
$aud = 'unk'
$lm = 'unk'
$line = 'PKCLEAN ERROR 2.0 | remediation did not complete'
$exitCode = 1

try {
    # The marker goes first: a run that fails below must leave the device not-detected.
    Remove-ItemProperty -LiteralPath $MarkerKey -Name 'SessionCleanupVersion' -Force -ErrorAction SilentlyContinue

    New-PkDir $PkDir
    if (-not (Test-Path -LiteralPath $LogDir -PathType Container)) {
        New-PkDir $LogDir
        $changed += 'd:logs'
    }
    $LogPath = "$LogDir\remediation-" + (Get-Date -Format 'yyyyMMdd') + '.log'
    Write-PkLog 'run start'

    $lm = "$($ExecutionContext.SessionState.LanguageMode)"
    $aud = Get-AuditState

    if (-not (Test-PayloadHash $F1 $HashSystem)) { Write-PkFile $F1 $PayloadSystem $HashSystem 'f:pk'; $changed += 'f:pk' }
    if (-not (Test-PayloadHash $F2 $HashSystem)) { Write-PkFile $F2 $PayloadSystem $HashSystem 'f:gpstart'; $changed += 'f:gpstart' }
    if (-not (Test-PayloadHash $F3 $HashSystem)) { Write-PkFile $F3 $PayloadSystem $HashSystem 'f:gpshut'; $changed += 'f:gpshut' }
    if (-not (Test-PayloadHash $F4 $HashUser)) { Write-PkFile $F4 $PayloadUser $HashUser 'f:gpulogon'; $changed += 'f:gpulogon' }

    $rc = Invoke-PkAcl $F1
    if ($rc -ne 0) {
        # icacls needs WRITE_DAC, which only the owner has. Rewriting the file makes
        # SYSTEM the owner again after an elevated admin has replaced it by hand.
        Write-PkLog "acl rc=$rc, rewriting f:pk"
        Write-PkFile $F1 $PayloadSystem $HashSystem 'f:pk'
        if ($changed -notcontains 'f:pk') { $changed += 'f:pk' }
        $rc = Invoke-PkAcl $F1
    }
    if ($rc -ne 0) { throw "PKFAIL: acl:pk icacls rc=$rc" }

    if (-not (Test-IniExact $IniMachinePath $IniMachine)) { Write-PkIni $IniMachinePath $IniMachine 'ini:m'; $changed += 'ini:m' }
    if (-not (Test-IniExact $IniUserPath $IniUser)) { Write-PkIni $IniUserPath $IniUser 'ini:u'; $changed += 'ini:u' }

    $gptLines = @()
    if (Test-Path -LiteralPath $GptPath -PathType Leaf) {
        # A failed read must abort the run: merging against an empty parse would
        # rewrite gpt.ini and destroy other CSE registrations.
        $gptLines = @(Get-Content -LiteralPath $GptPath -Force -ErrorAction Stop)
    }
    if ($gptLines.Count -eq 0) { $gptLines = @('[General]', 'Version=0') }
    $gptWas = ($gptLines -join "`n")
    $gptLines = @(Add-CseGroup $gptLines 'gPCMachineExtensionNames' ('[' + $CseScripts + $CseMachine + ']') $CseScripts $CseMachine)
    if (($gptLines -join "`n") -ne $gptWas) { $changed += 'gpt:m' }
    $gptWas = ($gptLines -join "`n")
    $gptLines = @(Add-CseGroup $gptLines 'gPCUserExtensionNames' ('[' + $CseScripts + $CseUser + ']') $CseScripts $CseUser)
    if (($gptLines -join "`n") -ne $gptWas) { $changed += 'gpt:u' }

    $gpChanged = $false
    foreach ($t in @('f:gpstart', 'f:gpshut', 'f:gpulogon', 'ini:m', 'ini:u', 'gpt:m', 'gpt:u')) {
        if ($changed -contains $t) { $gpChanged = $true }
    }
    if ($gpChanged) {
        $gptLines = @(Step-GptVersion $gptLines)
        Write-PkGpt $GptPath $gptLines
        Write-PkLog 'gpt.ini merged and version stepped'
    }

    if ((Get-RegValue $PolSystem 'RunStartupScriptSync') -ne 1) { Set-PkDword $PolSystem 'RunStartupScriptSync' 1 'pol:startupsync'; $changed += 'pol:startupsync' }
    if ((Get-RegValue $PolSystem 'RunLogonScriptSync') -ne 1) { Set-PkDword $PolSystem 'RunLogonScriptSync' 1 'pol:logonsync'; $changed += 'pol:logonsync' }
    if ((Get-RegValue $PolSystem 'MaxGPOScriptWait') -ne 900) { Set-PkDword $PolSystem 'MaxGPOScriptWait' 900 'pol:gpwait'; $changed += 'pol:gpwait' }
    if ((Get-RegValue $PolWinlogon 'SyncForegroundPolicy') -ne 1) { Set-PkDword $PolWinlogon 'SyncForegroundPolicy' 1 'pol:syncfg'; $changed += 'pol:syncfg' }
    if ((Get-RegValue $PolPower 'HiberbootEnabled') -ne 0) { Set-PkDword $PolPower 'HiberbootEnabled' 0 'pol:hiberboot'; $changed += 'pol:hiberboot' }
    if ((Get-RegValue $PolExplorer 'HideAccountNotifications') -ne 1) { Set-PkDword $PolExplorer 'HideAccountNotifications' 1 'pol:acctnotif'; $changed += 'pol:acctnotif' }

    $trStart = '\"' + $F1 + '\" Startup'
    $trLogon = '\"' + $F1 + '\" Logon'
    $trLogoff = '\"' + $F1 + '\" Logoff'
    $xpath = '*[System[(EventID=4634 or EventID=4647)]]'
    if (-not (Test-TaskOk $TaskStart @($SysBat, '<Arguments>Startup</Arguments>'))) {
        New-PkTask $TaskStart @('/create', '/tn', $TaskStart, '/tr', $trStart, '/sc', 'ONSTART', '/ru', 'SYSTEM', '/rl', 'HIGHEST', '/f') @($SysBat, '<Arguments>Startup</Arguments>') 'task:start'
        $changed += 'task:start'
    }
    if (-not (Test-TaskOk $TaskLogon @($SysBat, '<Arguments>Logon</Arguments>'))) {
        New-PkTask $TaskLogon @('/create', '/tn', $TaskLogon, '/tr', $trLogon, '/sc', 'ONLOGON', '/ru', 'SYSTEM', '/rl', 'HIGHEST', '/f') @($SysBat, '<Arguments>Logon</Arguments>') 'task:logon'
        $changed += 'task:logon'
    }
    if (-not (Test-TaskOk $TaskLogoff @($SysBat, 'EventID=4634 or EventID=4647'))) {
        New-PkTask $TaskLogoff @('/create', '/tn', $TaskLogoff, '/tr', $trLogoff, '/sc', 'ONEVENT', '/ec', 'Security', '/mo', $xpath, '/ru', 'SYSTEM', '/rl', 'HIGHEST', '/f') @($SysBat, 'EventID=4634 or EventID=4647') 'task:logoff'
        $changed += 'task:logoff'
    }

    $stateMissing = (-not (Test-GpReg 'Startup')) -or (-not (Test-GpReg 'Shutdown'))
    if ($gpChanged -or $stateMissing) {
        # echo n| defuses the logoff/restart prompt that has nobody to answer it in
        # session 0; /wait bounds the call. The exit code is not meaningful here.
        $null = Invoke-PkNative "$env:SystemRoot\System32\cmd.exe" @('/c', 'echo n| gpupdate /target:computer /force /wait:120')
        Write-PkLog "gpupdate rc=$LASTEXITCODE"
        $try = 0
        while ($true) {
            $try++
            $gpStart = Test-GpReg 'Startup'
            $gpShut = Test-GpReg 'Shutdown'
            if (($gpStart -and $gpShut) -or $try -ge 2) { break }
            Start-Sleep -Seconds 5
        }
        $bad = @()
        if (-not $gpStart) { $bad += 'gpreg:start' }
        if (-not $gpShut) { $bad += 'gpreg:shut' }
        if ($bad.Count -gt 0) { throw ('PKFAIL: ' + ($bad -join ' ')) }
    }

    Remove-ItemProperty -LiteralPath $MarkerWow -Name 'SessionCleanupVersion' -Force -ErrorAction SilentlyContinue

    $bad = @()
    if (-not (Test-PayloadHash $F1 $HashSystem)) { $bad += 'f:pk' }
    if (-not (Test-PayloadHash $F2 $HashSystem)) { $bad += 'f:gpstart' }
    if (-not (Test-PayloadHash $F3 $HashSystem)) { $bad += 'f:gpshut' }
    if (-not (Test-PayloadHash $F4 $HashUser)) { $bad += 'f:gpulogon' }
    if (-not (Test-Path -LiteralPath $LogDir -PathType Container)) { $bad += 'd:logs' }
    if (-not (Test-IniExact $IniMachinePath $IniMachine)) { $bad += 'ini:m' }
    if (-not (Test-IniExact $IniUserPath $IniUser)) { $bad += 'ini:u' }
    $gptBack = @()
    if (Test-Path -LiteralPath $GptPath -PathType Leaf) {
        $gptBack = @(Get-Content -LiteralPath $GptPath -Force -ErrorAction SilentlyContinue)
    }
    if (-not (Test-CseLine $gptBack 'gPCMachineExtensionNames' $CseScripts $CseMachine)) { $bad += 'gpt:m' }
    if (-not (Test-CseLine $gptBack 'gPCUserExtensionNames' $CseScripts $CseUser)) { $bad += 'gpt:u' }
    if (-not (Test-GpReg 'Startup')) { $bad += 'gpreg:start' }
    if (-not (Test-GpReg 'Shutdown')) { $bad += 'gpreg:shut' }
    if (-not (Test-TaskOk $TaskStart @($SysBat, '<Arguments>Startup</Arguments>'))) { $bad += 'task:start' }
    if (-not (Test-TaskOk $TaskLogon @($SysBat, '<Arguments>Logon</Arguments>'))) { $bad += 'task:logon' }
    if (-not (Test-TaskOk $TaskLogoff @($SysBat, 'EventID=4634 or EventID=4647'))) { $bad += 'task:logoff' }
    if ((Get-RegValue $PolSystem 'RunStartupScriptSync') -ne 1) { $bad += 'pol:startupsync' }
    if ((Get-RegValue $PolSystem 'RunLogonScriptSync') -ne 1) { $bad += 'pol:logonsync' }
    if ((Get-RegValue $PolSystem 'MaxGPOScriptWait') -ne 900) { $bad += 'pol:gpwait' }
    if ((Get-RegValue $PolWinlogon 'SyncForegroundPolicy') -ne 1) { $bad += 'pol:syncfg' }
    if ((Get-RegValue $PolPower 'HiberbootEnabled') -ne 0) { $bad += 'pol:hiberboot' }
    if ((Get-RegValue $PolExplorer 'HideAccountNotifications') -ne 1) { $bad += 'pol:acctnotif' }
    if ($bad.Count -gt 0) { throw ('PKFAIL: verify ' + ($bad -join ' ')) }

    if (-not (Test-Path -LiteralPath $MarkerKey)) { $null = New-Item -Path $MarkerKey -Force -ErrorAction SilentlyContinue }
    $null = New-ItemProperty -LiteralPath $MarkerKey -Name 'SessionCleanupVersion' -PropertyType String -Value '2.0' -Force -ErrorAction SilentlyContinue
    if ("$(Get-RegValue $MarkerKey 'SessionCleanupVersion')" -ne '2.0') { throw 'PKFAIL: mk write-failed' }

    $chTxt = 'none'
    if ($changed.Count -gt 0) { $chTxt = ($changed -join ' ') }
    $line = "PKCLEAN REMEDIATED 2.0 | changed: $chTxt | verify=ok aud=$aud lm=$lm"
    $exitCode = 0
    Write-PkLog "run ok changed=$chTxt aud=$aud lm=$lm"
} catch {
    $m = (("$_" -split "`n")[0]).Trim()
    if ($m.Length -gt 180) { $m = $m.Substring(0, 180) }
    $ln = ''
    try { $ln = "$($_.InvocationInfo.ScriptLineNumber)" } catch { $ln = '' }
    if ($ln -ne '') { $m = "$m @line $ln" }
    $chTxt = 'none'
    if ($changed.Count -gt 0) { $chTxt = ($changed -join ' ') }
    if ($m -like 'PKFAIL:*') {
        $line = "PKCLEAN FAIL 2.0 | " + $m.Substring(7).Trim() + " | changed: $chTxt aud=$aud lm=$lm"
    } else {
        $line = "PKCLEAN ERROR 2.0 | $m"
    }
    $exitCode = 1
    Write-PkLog "run failed $m changed=$chTxt"
}

Write-Output $line
exit $exitCode

# SIG # Begin signature block
# MIIo+gYJKoZIhvcNAQcCoIIo6zCCKOcCAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQUXygO5ppQ+rcximKyHeXt6pWc
# VBiggiITMIIFjTCCBHWgAwIBAgIQDpsYjvnQLefv21DiCEAYWjANBgkqhkiG9w0B
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
# KoZIhvcNAQkEMRYEFLEr99GwObq67iWRabRQ0l+93jZXMA0GCSqGSIb3DQEBAQUA
# BIICAC7l4iEgWRJ8TbRZ8uURXXy+d1a41NcaainuVhMITGMH7SIjxSn8r1s6GKER
# qa+/Vpsi2/+Jg+0MkKrBWFXQ5nuCVURfSg601meT60dXLXgtOLhfjPb5Jbh1Du7B
# ze8+iPeneiU3ICZsO3UYDr2atHA1wv8NSMa2qsyDee1LFb6sijlxNq71W97rt4iY
# bu551kkQiwcsNxdoGWpDuzp6bjo66SG2PHGRXpRlp2a6xzLeIqEVmH4+4AiEh8zv
# pt7p2cc1slBpCNOfv65wSZjafDgZxC1BwPJ99F63vdBxqmfJlI8FgliwTkL6F3l2
# O7pcYR0RLX5U5hBXiNTY+Li1yxU4p/XTah0Bjoz7AT0tRExbAAYkcypawsqABPfI
# 2ELIqmTuyEt404zIxURh6TYtsZRHAuqDj9M3uHv45b8Ikm9sDoZnv00x2o+ke3mm
# GsQ/aqOvMZF0bNOAHKFKS5p85b+I6xHBLhlACTVNYEbh/RygXgkPu8UhsIdnljyy
# Q+f9WfnV5mDC30sYvUYyg0fMy28hqfvjOZl8c4lr+WMLsHkoPz/Uolk2eHUpfhN6
# +KDbFV2gHld6Ypdw0+ugDjhuIK0VzO70kX5noVVCWXzg5gD1b076l50TVDhpHg5G
# K76s8wohVZgHzSI8np9kpyxRp7mSMJb7YIkSdlsr2ZX4NgAroYIDJjCCAyIGCSqG
# SIb3DQEJBjGCAxMwggMPAgEBMH0waTELMAkGA1UEBhMCVVMxFzAVBgNVBAoTDkRp
# Z2lDZXJ0LCBJbmMuMUEwPwYDVQQDEzhEaWdpQ2VydCBUcnVzdGVkIEc0IFRpbWVT
# dGFtcGluZyBSU0E0MDk2IFNIQTI1NiAyMDI1IENBMQIQCoDvGEuN8QWC0cR2p5V0
# aDANBglghkgBZQMEAgEFAKBpMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJ
# KoZIhvcNAQkFMQ8XDTI2MDgyNzAwMDEzMlowLwYJKoZIhvcNAQkEMSIEIKPqjT9A
# I3EvVsXyhnRCTWmfLQ5XHuSY+0CsZglAo+XpMA0GCSqGSIb3DQEBAQUABIICAIVr
# nUG2hCBoYXqRzfULJtk1hsIYMaP+HytFhFVjui5XODBV+PY8Wq07xHo1TFXlL6VM
# 3N1Wcqw1MO6GFCndAadYSpmLGDKta6RDf09zupuLxqa43SVSuEcTivzpYwH/sUnQ
# jihhKfUH1pxhhyJWGAJaFC0cLBti/radfU0zDpqUjlIyfgY4wgNKmrjKqtXmmF0w
# wAJVWkPgRF5HFS9mPQbTjRSjPhpRqhdSmgw+h40MVOwDqx1GG8qpGQRBuM6+0A2b
# /Wz9F7Ui59jWP5+HcaaVXvrz8h8s9btGixx3Yfk1sHDQdYe0Q4tFsVbeZIoVvZ9u
# f89QKy5zWt5Dij9vJ4ILOSX7Igvd4NO+RgxN7BXxwPPEP8aJ9w+myp/bXaaszAOn
# B//pUyrRTEj/VvEnlNpScEXKRzo7d5JSYElfFjbF4nbuvNF4pVTwifZhs0Lag31s
# OwEjPNY9Sp0CgWnTwvx6ow5sUjcK5Vfm8en21N/MmFXFK9u82YcSENWvSwQ9yLeF
# ve6xm71yzsjrX+TE2yfr8394Er9buGn8EfQpdY0AyrbzE67H+Ga1RnoYq/fJhalI
# euXOYZoZZtx/RUjHNXugyyR2GUPle2b6HhLFH3x5UPn5ZJQ0k9iqyXfIAwqw4JHF
# 02K3hbd+emKSUlcVq0buv4zuT3nC36ZXXtZjEXOd
# SIG # End signature block
