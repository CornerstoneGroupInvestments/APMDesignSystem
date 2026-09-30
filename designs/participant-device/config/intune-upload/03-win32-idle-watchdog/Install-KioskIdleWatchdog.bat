@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM ============================================================================
REM  APM Participant Kiosk - inactivity watchdog installer
REM
REM  ONE TASK, running as SYSTEM every minute. The watchdog no longer runs in the
REM  participant session, so nothing has to be added to the Assigned Access
REM  allowed-app list and no participant-facing process is involved.
REM
REM  Usage:  Install-KioskIdleWatchdog.bat
REM          Install-KioskIdleWatchdog.bat UNINSTALL
REM ============================================================================

if defined PROCESSOR_ARCHITEW6432 (
    echo  Relaunching 64-bit, so the registry marker is not redirected.
    "%SystemRoot%\Sysnative\cmd.exe" /c ""%~f0" %*"
    exit /b %errorlevel%
)

set "DEST=C:\APM\PK"
set "PAYLOAD=Watch-KioskIdle.bat"
set "TARGET=%DEST%\%PAYLOAD%"
set "TASK=APM-PK-IdleWatchdog"
set "MARKER=HKLM\SOFTWARE\APM\ParticipantKiosk"
set "MARKERVALUE=IdleWatchdogVersion"
set "VERSION=2.3"

echo.
echo  APM Participant Kiosk - inactivity watchdog
echo  ------------------------------------------
echo  Device: %COMPUTERNAME%
echo  Run at: %DATE% %TIME%
echo.

net session >nul 2>&1
if errorlevel 1 (
    echo  FAIL: not elevated. Run as administrator, or as SYSTEM via the Intune
    echo  Management Extension.
    exit /b 1
)

REM ---- uninstall -------------------------------------------------------------
if /i "%~1"=="UNINSTALL" (
    echo  --- uninstall
    reg delete "%MARKER%" /v %MARKERVALUE% /f >nul 2>&1
    reg delete "HKLM\SOFTWARE\WOW6432Node\APM\ParticipantKiosk" /v %MARKERVALUE% /f >nul 2>&1
    schtasks /delete /tn "%TASK%" /f >nul 2>&1
    echo  Removed task %TASK%
    REM  Cancel anything the watchdog had already scheduled, or the device
    REM  restarts once more after the app is gone.
    shutdown /a >nul 2>&1
    if exist "%TARGET%" del /f /q "%TARGET%" >nul 2>&1
    if exist "%DEST%\idle-state.txt" del /f /q "%DEST%\idle-state.txt" >nul 2>&1
    if exist "%DEST%\idle-armed.txt" del /f /q "%DEST%\idle-armed.txt" >nul 2>&1
    if exist "%DEST%\idle-pending.txt" del /f /q "%DEST%\idle-pending.txt" >nul 2>&1
    if exist "%DEST%\idle-debug.txt" del /f /q "%DEST%\idle-debug.txt" >nul 2>&1
    echo  Removed %TARGET% and its state files
    echo  Logs under %DEST%\logs are left in place.
    exit /b 0
)

REM ---- 1. stage --------------------------------------------------------------
echo  --- 1. staging
set "SRC=%~dp0%PAYLOAD%"
if not exist "%SRC%" (
    echo  FAIL: %PAYLOAD% not found beside this installer.
    echo  Looked in: %~dp0
    exit /b 1
)

REM  quser is checked BEFORE anything is registered. The watchdog reads session
REM  idle time from it and can do nothing without it, so a device missing quser
REM  should end with no task at all rather than a task that runs every minute and
REM  silently achieves nothing.
where quser >nul 2>&1
if errorlevel 1 (
    echo  FAIL: quser.exe not found. The watchdog cannot read session idle time
    echo  without it. Nothing installed.
    exit /b 1
)
echo  quser present

REM  The task is removed BEFORE the payload is replaced. cmd reads a batch file
REM  line by line as it executes, so overwriting the script while a scheduled run
REM  is part-way through it produces undefined behaviour. Removing the task first
REM  closes that window.
schtasks /delete /tn "%TASK%" /f >nul 2>&1

if not exist "%DEST%" md "%DEST%" >nul 2>&1
if not exist "%DEST%\logs" md "%DEST%\logs" >nul 2>&1

REM  Clear any state left by an earlier version. The arming logic compares the
REM  current idle reading against the previous one, so a reading written before
REM  the upgrade would be compared against by the new logic on the first poll and
REM  could arm a session nobody has touched.
if exist "%DEST%\idle-state.txt" del /f /q "%DEST%\idle-state.txt" >nul 2>&1
if exist "%DEST%\idle-armed.txt" del /f /q "%DEST%\idle-armed.txt" >nul 2>&1
if exist "%DEST%\idle-pending.txt" del /f /q "%DEST%\idle-pending.txt" >nul 2>&1
shutdown /a >nul 2>&1
copy /y "%SRC%" "%TARGET%" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not copy the payload to %TARGET%.
    exit /b 1
)
echo  Staged %TARGET%

REM ---- 2. lock it down ------------------------------------------------------
REM  The task runs this as SYSTEM. Write access to it is SYSTEM code execution,
REM  and there is no signature to fall back on because App Control does not
REM  enforce .bat. The ACL is the whole control.
echo  --- 2. permissions
icacls "%TARGET%" /inheritance:r /grant "*S-1-5-18:(RX)" "*S-1-5-32-544:(F)" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not apply the ACL. Not registering the task: a
    echo  participant-writable script running as SYSTEM is worse than no watchdog.
    exit /b 1
)
echo  SYSTEM read and execute, Administrators full, inheritance removed

REM ---- 3. register the task -------------------------------------------------
REM  The action is "cmd /c <path>" with NO inner quotes. An earlier build used
REM  /tr "\"%TARGET%\"", which cannot work: cmd has no backslash escape, so the
REM  backslash-quote pairs were passed through literally and the stored action was
REM  a malformed path that could never launch. The staged path contains no spaces,
REM  so no inner quoting is needed at all, and cmd /c makes the interpreter
REM  explicit rather than relying on Task Scheduler resolving the .bat association.
REM
REM  Every minute, not every 30 seconds. schtasks takes whole minutes on the
REM  command line, and a 60-second poll against a 60-second grace period is
REM  enough: the warning is drawn by Windows and cancelled by input, not by the
REM  poll interval.
echo  --- 3. task
schtasks /create /tn "%TASK%" /tr "cmd /c %TARGET%" /sc MINUTE /mo 1 /ru SYSTEM /rl HIGHEST /f >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not register %TASK%.
    exit /b 1
)
echo  Registered %TASK%, every minute as SYSTEM

REM ---- 4. verify ------------------------------------------------------------
echo  --- 4. verify
schtasks /query /tn "%TASK%" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: %TASK% is not present after registration.
    exit /b 1
)
for /f "tokens=2 delims=:" %%s in ('schtasks /query /tn "%TASK%" /fo LIST 2^>nul ^| find /i "Status:"') do echo  %TASK% status:%%s

REM  Confirm the action stored is the one intended. A task can register cleanly
REM  with an action that cannot launch, which is exactly what the old /tr quoting
REM  produced, and nothing else in this installer would have noticed.
schtasks /query /tn "%TASK%" /fo LIST /v 2>nul | find /i "%PAYLOAD%" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: the registered task action does not reference %PAYLOAD%. Not
    echo  writing the detection marker. Inspect it with:
    echo      schtasks /query /tn "%TASK%" /fo LIST /v
    exit /b 1
)
echo  Task action references %PAYLOAD%

REM  Run it once now, so a task that cannot launch is discovered here rather than
REM  on the first idle participant session.
schtasks /run /tn "%TASK%" >nul 2>&1
if errorlevel 1 (
    echo  WARN: schtasks /run returned an error. Check the task history.
) else (
    echo  Test run triggered
)

REM ---- 5. marker, written last ----------------------------------------------
echo  --- 5. marker
reg delete "HKLM\SOFTWARE\WOW6432Node\APM\ParticipantKiosk" /v %MARKERVALUE% /f >nul 2>&1
reg add "%MARKER%" /v %MARKERVALUE% /t REG_SZ /d "%VERSION%" /f >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not write the detection marker.
    exit /b 1
)
echo  %MARKER%\%MARKERVALUE% = %VERSION%

REM ---- 6. show what it sees now ---------------------------------------------
echo.
echo  --- current state
call "%TARGET%" STATUS
echo.
echo  Install complete. Log: %DEST%\logs\idle-watchdog.log
echo.
echo  The watchdog arms only after comparing two readings and seeing input, so a
echo  device nobody has touched will not restart. That is what makes it safe to
echo  install during Autopilot provisioning.
echo.
echo  Test by signing in as the kiosk account, moving the mouse, then leaving it
echo  alone. Two polls after the mouse move it is armed; nine minutes later the
echo  warning appears.
endlocal
exit /b 0
