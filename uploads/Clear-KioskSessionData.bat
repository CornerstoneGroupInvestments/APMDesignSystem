@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM ============================================================================
REM  APM Participant Kiosk - clear participant data
REM
REM  A batch file, and not by preference. App Control script enforcement on this
REM  fleet leaves no runnable PowerShell option for a scheduled task:
REM    unsigned                     blocked outright by policy
REM    signed, SYSTEM interactive   host is FullLanguage, script loads, works
REM    signed, Scheduled Task       host is ConstrainedLanguage, a FullLanguage
REM                                 script will not load into it, refused
REM  Measured on the pilot device 25 August 2026. Script enforcement covers
REM  PowerShell, VBScript, JScript, HTA and MSI. It does NOT cover .bat or .cmd,
REM  so this runs with no certificate and no language mode to work around.
REM
REM  Usage:  Clear-KioskSessionData.bat Logon
REM          Clear-KioskSessionData.bat Logoff
REM          Clear-KioskSessionData.bat Startup
REM          Clear-KioskSessionData.bat Shutdown
REM          Clear-KioskSessionData.bat Logon DRYRUN
REM          Clear-KioskSessionData.bat Logon Kiosk-63TFTJ4
REM          Clear-KioskSessionData.bat Logon Kiosk-63TFTJ4 DRYRUN
REM
REM  The account is resolved from the computer name, which is APM-PK-<serial> on
REM  every device, and then confirmed against the profile directory on disk. Pass
REM  it explicitly to override both.
REM
REM  Shutdown is the pass that closes the real window. On an autologon device
REM  every boot-side pass competes with Winlogon, and Windows presents the desktop
REM  while they are still running, so a participant's files survived minutes into
REM  the next session. A machine shutdown script runs as SYSTEM and Windows waits
REM  for it before powering off, so the data is gone before the device is next
REM  touched. It is also the one pass with no application holding anything open.
REM
REM  Logon and Startup are the authoritative passes: the participant has done
REM  nothing and holds nothing open. Logoff is best effort, because a closing
REM  application still holds files open.
REM
REM  LOGGING RECORDS NO FILE NAMES, DELIBERATELY. A log listing what was deleted
REM  from a participant's Downloads folder is itself a disclosure, and it would
REM  outlive the file it names. Directories, counts and outcomes only. Never add
REM  a file name to it.
REM
REM  DELETION IS NOT SANITISATION. On a BitLocker volume with TRIM an overwrite
REM  cannot be guaranteed to reach the original blocks and is not attempted.
REM  At-rest protection is full-volume encryption. This removes the data from the
REM  live file system so the next participant cannot reach it.
REM ============================================================================

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

REM ---- must be SYSTEM or an administrator ------------------------------------
net session >nul 2>&1
if errorlevel 1 (
    call :log "FAIL: not elevated. The print spool, the Recycle Bin and another account's profile are unreachable."
    goto :finish
)

REM ---- resolve the kiosk account --------------------------------------------
REM  Three sources, in order, and the last one is authoritative.
REM
REM   1. An account name passed as the second argument. Always wins.
REM   2. The computer name. Every device is APM-PK-<serial>, so stripping the
REM      prefix gives the serial with no external command at all. WMIC is absent
REM      on current Windows 11 builds and the registry read that replaced it also
REM      failed on this device, so both are gone.
REM   3. The profile directory actually on disk, matched as C:\Users\Kiosk-*.
REM      This overrides 2 when they disagree, because the directory is the thing
REM      being cleaned and its name came from the account that created it.
REM
REM  2 and 3 can legitimately disagree. A NetBIOS name is capped at 15 characters
REM  and APM-PK- uses 7 of them, so a serial longer than 8 characters is truncated
REM  in the computer name but not in the account name. A 7-character Dell service
REM  tag fits and they agree; a 14-character virtual-machine serial does not.
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

REM  The SID is needed for the Recycle Bin, which lives outside the profile. Read
REM  from ProfileList by matching ProfileImagePath.
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

REM ---- 1. participant-facing folders ----------------------------------------
call :log "--- participant folders"
if defined PROFILE (
    for %%f in (Downloads Desktop Documents Pictures Videos Music OneDrive) do call :clear "!PROFILE!\%%f" "profile\%%f"
)
call :clear "C:\Users\Public\Downloads" "Public\Downloads"
call :clear "C:\Users\Public\Documents" "Public\Documents"
call :clear "C:\Users\Public\Desktop" "Public\Desktop"

REM ---- 2. application state holding document content or names ----------------
call :log "--- application state"
if defined PROFILE (
    REM  LibreOffice \backup holds real document copies from autorecovery, and
    REM  registrymodifications.xcu holds the recent-documents list. The tree is
    REM  rebuilt on next launch and every managed setting comes from policy.
    call :nuke "!PROFILE!\AppData\Roaming\LibreOffice" "LibreOffice user profile"

    REM  History, cookies, cache, autofill, form data, saved passwords, downloads.
    call :nuke "!PROFILE!\AppData\Local\Microsoft\Edge\User Data" "Edge user data"

    REM  Jump lists persist full paths and file names independently of Recent.
    call :clear "!PROFILE!\AppData\Roaming\Microsoft\Windows\Recent\AutomaticDestinations" "Jump lists automatic"
    call :clear "!PROFILE!\AppData\Roaming\Microsoft\Windows\Recent\CustomDestinations" "Jump lists custom"
    call :clear "!PROFILE!\AppData\Roaming\Microsoft\Windows\Recent" "Recent items"

    REM  Rendered previews of documents.
    call :wipe "!PROFILE!\AppData\Local\Microsoft\Windows\Explorer" "thumbcache_*.db" "Thumbnail cache"
    call :wipe "!PROFILE!\AppData\Local\Microsoft\Windows\Explorer" "iconcache_*.db" "Icon cache"

    REM  Working copies of open documents.
    call :clear "!PROFILE!\AppData\Local\Temp" "profile Temp"
    call :clear "!PROFILE!\AppData\Local\Microsoft\Windows\INetCache" "INetCache"

    REM  Typed text reaches both of these.
    call :nuke "!PROFILE!\AppData\Local\Microsoft\Windows\Clipboard" "Clipboard history"
    call :wipe "!PROFILE!\AppData\Local\Microsoft\Windows\Notifications" "wpndatabase.db*" "Notification database"
)

REM ---- 3. per-user registry MRU lists ---------------------------------------
REM  These record file names and paths, which on this device means participant
REM  names. reg.exe reaches a loaded hive under HKU directly. If the hive is not
REM  loaded the keys are skipped and the next Logon or Startup pass takes them.
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

REM ---- 4. machine-wide residue ---------------------------------------------
REM  Spool files hold the full content of anything printed. On a kiosk whose
REM  purpose includes printing a CV this is the highest-value location here.
call :log "--- machine-wide"
call :clear "C:\Windows\System32\spool\PRINTERS" "Print spool"
call :clear "C:\Windows\Temp" "Windows Temp"
if defined SID call :clear "C:\$Recycle.Bin\!SID!" "Recycle Bin kiosk SID"

REM ---- 5. autologon reassertion --------------------------------------------
REM  Not a privacy function. An interactive administrator sign-in at the console
REM  rewrites DefaultUserName and the kiosk then stops signing itself in with
REM  nothing to explain why. The password is never read or rewritten here: only
REM  the account name and the flag. The LSA secret is untouched.
call :log "--- autologon"
if defined DRYRUN (
    call :log "DRYRUN     autologon reassertion"
) else (
    set "WL=HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
    set "BEFORE="
    for /f "tokens=2,*" %%a in ('reg query "!WL!" /v DefaultUserName 2^>nul ^| find /i "DefaultUserName"') do set "BEFORE=%%b"
    reg add "!WL!" /v DefaultUserName /t REG_SZ /d "!ACCOUNT!" /f >nul 2>&1
    reg add "!WL!" /v AutoAdminLogon /t REG_SZ /d 1 /f >nul 2>&1
    reg delete "!WL!" /v DefaultPassword /f >nul 2>&1
    reg delete "!WL!" /v DefaultDomainName /f >nul 2>&1
    reg delete "!WL!" /v AutoLogonCount /f >nul 2>&1
    if defined BEFORE (
        if /i not "!BEFORE!"=="!ACCOUNT!" (
            call :log "autologon reasserted: DefaultUserName was !BEFORE!, now !ACCOUNT!"
        ) else (
            call :log "autologon confirmed for !ACCOUNT!"
        )
    ) else (
        call :log "autologon set for !ACCOUNT!"
    )
)

:finish
call :log "--- summary"
call :log "locations cleared: !CLEARED!   not present: !SKIPPED!   items in use: !LOCKED!"
if !LOCKED! GTR 0 if /i "%PHASE%"=="Logoff" call :log "Items in use at logoff are expected. The Shutdown, Startup and Logon passes take them before the next participant starts."
if !LOCKED! GTR 0 if /i not "%PHASE%"=="Logoff" call :log "WARNING: items in use during the %PHASE% pass. Something holds participant data open before the session has started. Investigate."
call :log "=== %PHASE% pass complete ==="
endlocal
exit /b 0

REM ============================================================================
REM  helpers
REM ============================================================================

:sanitise
REM  Strip everything but letters and digits, uppercase, cap at 14. Batch has no
REM  regex, so this is a fixed substitution list covering what a BIOS serial can
REM  contain in practice: spaces, dots, hyphens, underscores, colons, commas and
REM  slashes. No cmd /c round trip: an empty value made that echo "ECHO is on."
REM  and the account name was then built from that string.
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
REM  Uppercase without PowerShell: a per-letter substitution table.
for %%p in ("a=A" "b=B" "c=C" "d=D" "e=E" "f=F" "g=G" "h=H" "i=I" "j=J" "k=K" "l=L" "m=M" "n=N" "o=O" "p=P" "q=Q" "r=R" "s=S" "t=T" "u=U" "v=V" "w=W" "x=X" "y=Y" "z=Z") do (
    for /f "tokens=1,2 delims==" %%x in (%%p) do set "SERIAL=!SERIAL:%%x=%%y!"
)
exit /b 0

:clear
REM  %~1 path, %~2 label. Clears the CONTENTS and keeps the directory. Keeping it
REM  matters: Downloads, Desktop and Documents are Known Folders, and deleting
REM  one leaves the shell without a target and the participant with a broken
REM  save dialog.
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
REM  %~1 path, %~2 label. Removes the whole tree and lets the application rebuild.
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
REM  %~1 directory, %~2 pattern, %~3 label.
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
REM  %~1 key, %~2 label.
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
