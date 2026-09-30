@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM ============================================================================
REM  APM Participant Kiosk - fast user logon clean
REM
REM  A deliberately small script that runs in the PARTICIPANT'S OWN CONTEXT as a
REM  Group Policy user logon script, synchronously, before the desktop appears.
REM  It clears only what that account owns and what the next participant would
REM  see first.
REM
REM  WHY IT EXISTS. The machine shutdown script is the guarantee, and it runs as
REM  SYSTEM before power-off. A power loss skips it. On the next boot the
REM  machine-side passes race Winlogon and lose, so the previous participant's
REM  files were visible in Downloads for minutes. This closes that gap for the
REM  data a participant can actually see, and the SYSTEM passes still take
REM  everything else afterwards.
REM
REM  WHAT IT DELIBERATELY DOES NOT DO. Everything needing rights this account
REM  does not have: the print spool, the Recycle Bin, Windows Temp, the registry
REM  MRU keys under HKU, the autologon reassertion under HKLM. Those are
REM  machine-wide or HKLM writes, and a standard user cannot make them. They stay
REM  with Clear-KioskSessionData.bat running as SYSTEM.
REM
REM  It also does not remove the LibreOffice or Edge profile TREES. Deleting them
REM  from inside the session that is starting makes the applications rebuild them
REM  mid-launch, which on a slow device shows the participant an error. The
REM  SYSTEM passes remove them when nothing is running. Here only the document
REM  and history CONTENT inside them is cleared.
REM
REM  SPEED IS THE POINT. This runs synchronously, so every second here is a
REM  second the participant waits at a blank screen. No enumeration, no counting,
REM  no verification passes: issue the delete and move on. Under a second on a
REM  clean profile.
REM
REM  Usage:  Clear-KioskUserLogon.bat
REM  Registered by Install-KioskSessionCleanup.bat as a GP user logon script.
REM  Not signed, and does not need to be: App Control script enforcement does not
REM  cover .bat or .cmd.
REM ============================================================================

set "LOG=C:\APM\PK\logs\user-logon-clean.log"
if not exist "C:\APM\PK\logs" md "C:\APM\PK\logs" >nul 2>&1

REM  A participant profile always has %USERPROFILE%, so nothing has to be derived
REM  and nothing can fail to resolve. The machine-side scripts derive the account
REM  from the computer name; this one is already inside it.
echo %DATE% %TIME%  user logon clean starting for %USERNAME%>>"%LOG%" 2>nul

REM ---- 1. the folders a participant sees ------------------------------------
REM  Downloads is the only File Explorer namespace granted, so it is where a CV
REM  lands and the first thing the next participant would find. Desktop and
REM  Documents are not browsable but every save dialog reaches them, and
REM  LibreOffice defaults to Documents.
for %%f in (Downloads Desktop Documents Pictures Videos Music) do (
    if exist "%USERPROFILE%\%%f" (
        del /f /s /q "%USERPROFILE%\%%f\*" >nul 2>&1
        for /d %%d in ("%USERPROFILE%\%%f\*") do rd /s /q "%%d" >nul 2>&1
    )
)

REM ---- 2. recent items and jump lists --------------------------------------
REM  These hold full paths and file names, which on this device means
REM  participant names. Cheap to clear and visible on the Start menu and on every
REM  taskbar right-click.
set "REC=%APPDATA%\Microsoft\Windows\Recent"
if exist "%REC%" (
    del /f /q "%REC%\*" >nul 2>&1
    del /f /q "%REC%\AutomaticDestinations\*" >nul 2>&1
    del /f /q "%REC%\CustomDestinations\*" >nul 2>&1
)

REM ---- 3. document content inside the application profiles -----------------
REM  Not the trees themselves. LibreOffice \backup holds real document copies
REM  from autorecovery, and registrymodifications.xcu holds the recent-documents
REM  list, so both go. The rest of the profile is left for the SYSTEM pass.
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

REM ---- 4. working copies and thumbnails ------------------------------------
REM  LibreOffice and Edge both write working copies of open documents to Temp,
REM  and the thumbnail cache holds rendered previews of them.
if exist "%TEMP%" del /f /s /q "%TEMP%\*" >nul 2>&1
del /f /q "%LOCALAPPDATA%\Microsoft\Windows\Explorer\thumbcache_*.db" >nul 2>&1

REM  The Recycle Bin is deliberately not attempted here. Its per-account folder is
REM  named by SID, not by user name, and resolving a SID from inside a fast logon
REM  script costs more than it saves. Clear-KioskSessionData.bat resolves the SID
REM  from ProfileList and clears it as SYSTEM.

echo %DATE% %TIME%  user logon clean complete>>"%LOG%" 2>nul
endlocal
exit /b 0
