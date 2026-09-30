@echo off
setlocal EnableExtensions
REM ============================================================================
REM  APM Participant Kiosk - restart the device, called on the inactivity lock
REM
REM  Launched by the APM-PK-IdleRestart scheduled task, which is triggered by
REM  Security event 4800 for the kiosk account. Windows has already detected the
REM  inactivity and locked the session by this point; nothing here measures
REM  anything.
REM
REM  THE RESTART IS IMMEDIATE, AND THAT IS DELIBERATE. The session account's
REM  credential is held only in the Winlogon LSA secret and no person knows it, so
REM  a locked kiosk cannot be unlocked by the participant. The restart is not a
REM  convenience, it is the recovery path, and delaying it behind a countdown
REM  nobody can act on would only extend the time the device is unusable.
REM
REM  There is deliberately no warning. A participant who reads the screen for ten
REM  minutes without touching anything loses unsaved work, which is exactly what
REM  the wallpaper tells them will happen.
REM ============================================================================

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
REM  /t 0 for the reason in the header.
"%SystemRoot%\System32\shutdown.exe" /r /f /t 0
if errorlevel 1 (
    echo %DATE% %TIME%  shutdown /r returned an error, retrying once >>"%LOG%"
    REM  A restart already in progress is the usual cause and needs no second
    REM  attempt. Any other failure is worth one retry before giving up, because
    REM  the alternative is a device sitting locked and unusable until someone
    REM  visits it.
    timeout /t 5 /nobreak >nul 2>&1
    "%SystemRoot%\System32\shutdown.exe" /r /f /t 0
    if errorlevel 1 echo %DATE% %TIME%  second attempt also failed >>"%LOG%"
)
endlocal
exit /b 0
