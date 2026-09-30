@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM ============================================================================
REM  APM Participant Kiosk - restart on inactivity lock
REM
REM  Registers ONE event-triggered scheduled task. Windows does the idle
REM  detection; this only reacts to the lock it produces.
REM
REM  WHY THIS REPLACES THE POLLING WATCHDOG. Three builds of a watchdog read the
REM  IDLE TIME column from quser and none of them worked. That column does not
REM  report session input idle time: it is widely documented as counting from the
REM  last logon event and as showing the same value for Active and Disconnected
REM  sessions. Fixing the parser could not have made the mechanism correct.
REM
REM  Windows already detects user-input inactivity, for exactly this purpose,
REM  through the security policy Interactive logon: Machine inactivity limit. When
REM  the limit is exceeded it locks the session, and the lock writes Security
REM  event 4800 naming the account. A task triggered on that event restarts the
REM  device. No polling, no parsing, no arming logic, no state files.
REM
REM  Full reasoning and sources: ../research-kiosk-idle-restart.md
REM
REM  Usage:  Install-KioskIdleRestart.bat
REM          Install-KioskIdleRestart.bat UNINSTALL
REM ============================================================================

if defined PROCESSOR_ARCHITEW6432 (
    echo  Relaunching 64-bit, so the registry marker is not redirected.
    "%SystemRoot%\Sysnative\cmd.exe" /c ""%~f0" %*"
    exit /b %errorlevel%
)

set "DEST=C:\APM\PK"
set "PAYLOAD=Restart-KioskOnLock.bat"
set "TARGET=%DEST%\%PAYLOAD%"
set "TASK=APM-PK-IdleRestart"
set "OLDTASK=APM-PK-IdleWatchdog"
set "LIMIT=600"
set "MARKER=HKLM\SOFTWARE\APM\ParticipantKiosk"
set "MARKERVALUE=IdleRestartVersion"
set "VERSION=3.0"

echo.
echo  APM Participant Kiosk - restart on inactivity lock
echo  -------------------------------------------------
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
    REM  The inactivity limit is left in place deliberately. It is a hardening
    REM  control in its own right, it is owned by an Intune profile rather than by
    REM  this app, and removing it here would fight that profile.
    if exist "%TARGET%" del /f /q "%TARGET%" >nul 2>&1
    echo  Removed %TARGET%
    echo  The inactivity limit and the audit setting are owned by Intune profiles
    echo  and are not changed by this uninstall.
    exit /b 0
)

REM ---- 1. retire the polling watchdog ---------------------------------------
REM  Removed here rather than left to a separate uninstall, because both would
REM  otherwise restart the same device on two different mechanisms.
echo  --- 1. retiring the polling watchdog
schtasks /query /tn "%OLDTASK%" >nul 2>&1
if errorlevel 1 (
    echo  %OLDTASK% not present
) else (
    schtasks /delete /tn "%OLDTASK%" /f >nul 2>&1
    echo  Removed %OLDTASK%
)
shutdown /a >nul 2>&1
for %%f in ("idle-state.txt" "idle-armed.txt" "idle-pending.txt" "idle-debug.txt" "Watch-KioskIdle.bat" "Watch-KioskIdle.ps1") do (
    if exist "%DEST%\%%~f" del /f /q "%DEST%\%%~f" >nul 2>&1
)
reg delete "%MARKER%" /v IdleWatchdogVersion /f >nul 2>&1
echo  Removed its state files and detection marker

REM ---- 2. resolve the kiosk account -----------------------------------------
REM  From the computer name, which is APM-PK-<serial> on every device, then
REM  confirmed against the profile directory on disk. Same rule as every other
REM  script in this pack. The account name goes into the event filter, so a device
REM  that cannot resolve it must not end up with a task that fires on an
REM  administrator locking the console.
echo  --- 2. account
set "ACCOUNT="
set "SERIAL=%COMPUTERNAME:APM-PK-=%"
if not "!SERIAL!"=="%COMPUTERNAME%" set "ACCOUNT=Kiosk-!SERIAL!"
if defined ACCOUNT if not exist "C:\Users\!ACCOUNT!" set "ACCOUNT="
if not defined ACCOUNT (
    for /d %%d in ("C:\Users\Kiosk-*") do if not defined ACCOUNT set "ACCOUNT=%%~nxd"
)
if not defined ACCOUNT (
    echo  FAIL: could not resolve the kiosk account. The event filter needs it, and
    echo  a task without it would restart the device when an administrator locks the
    echo  console. Nothing installed.
    echo  Run the session account remediation first, or pass the name:
    echo      Install-KioskIdleRestart.bat ACCOUNT Kiosk-XXXXXXX
    exit /b 1
)
if /i "%~1"=="ACCOUNT" if not "%~2"=="" set "ACCOUNT=%~2"
echo  Kiosk account: !ACCOUNT!

REM ---- 3. stage the payload -------------------------------------------------
echo  --- 3. staging
set "SRC=%~dp0%PAYLOAD%"
if not exist "%SRC%" (
    echo  FAIL: %PAYLOAD% not found beside this installer.
    echo  Looked in: %~dp0
    exit /b 1
)
if not exist "%DEST%" md "%DEST%" >nul 2>&1
if not exist "%DEST%\logs" md "%DEST%\logs" >nul 2>&1
copy /y "%SRC%" "%TARGET%" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not copy the payload to %TARGET%.
    exit /b 1
)
icacls "%TARGET%" /inheritance:r /grant "*S-1-5-18:(RX)" "*S-1-5-32-544:(F)" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not apply the ACL. A participant-writable script running as
    echo  SYSTEM is worse than no restart mechanism.
    exit /b 1
)
echo  Staged %TARGET%, SYSTEM read and execute only

REM ---- 4. the inactivity limit ----------------------------------------------
REM  Owned by CDG-W11-SEC-Inactivity Limit-P-1.0. Written here as well so a
REM  device works before that profile lands and so the value is never absent while
REM  the task exists. The profile wins at the next refresh, which is correct.
echo  --- 4. inactivity limit
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v InactivityTimeoutSecs /t REG_DWORD /d %LIMIT% /f >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not set InactivityTimeoutSecs.
    exit /b 1
)
echo  InactivityTimeoutSecs = %LIMIT% seconds

REM ---- 5. the audit setting the trigger depends on --------------------------
REM  Event 4800 is only written when Audit Other Logon/Logoff Events is enabled.
REM  Without it the task registers, reports no error and never fires. This is the
REM  same silent dependency the logoff cleanup hit.
echo  --- 5. audit
auditpol /set /subcategory:"Other Logon/Logoff Events" /success:enable >nul 2>&1
if errorlevel 1 (
    echo  WARN: auditpol returned an error. Check the subcategory name on this
    echo  build. Without it event 4800 is never written and nothing will restart.
) else (
    echo  Audit Other Logon/Logoff Events: Success enabled
)
auditpol /get /subcategory:"Other Logon/Logoff Events" 2>nul | find /i "Success" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: the audit setting did not take. Not writing the detection marker,
    echo  because the task cannot fire without it.
    echo  Set Audit Other Logon/Logoff Events to Success by Intune policy: a local
    echo  auditpol change is overwritten at the next policy refresh anyway.
    exit /b 1
)
echo  Verified: the audit setting is active

REM ---- 6. register the event-triggered task ---------------------------------
REM  /sc ONEVENT with an XPath query, so there is no task XML file to write and no
REM  caret escaping of angle brackets. The query contains no < or >, so it passes
REM  through cmd unaltered inside quotes.
REM
REM  Filtered to the kiosk account. Event 4800 also fires when an administrator
REM  locks the console during support, and restarting the device underneath them
REM  would be a poor outcome.
REM
REM  A manual lock by the participant fires it too, which is wanted: a participant
REM  who locks the kiosk has walked away, and the session cannot be unlocked by
REM  anyone without the LAPS credential.
echo  --- 6. task
set "XPATH=*[System[(EventID=4800)]] and *[EventData[Data[@Name='TargetUserName']='!ACCOUNT!']]"
schtasks /delete /tn "%TASK%" /f >nul 2>&1
schtasks /create /tn "%TASK%" /tr "cmd /c %TARGET%" /sc ONEVENT /ec Security /mo "!XPATH!" /ru SYSTEM /rl HIGHEST /f >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not register %TASK%.
    echo  Filter used: !XPATH!
    exit /b 1
)
echo  Registered %TASK% on Security event 4800 for !ACCOUNT!

REM ---- 7. verify what was registered ---------------------------------------
echo  --- 7. verify
schtasks /query /tn "%TASK%" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: %TASK% is not present after registration.
    exit /b 1
)
schtasks /query /tn "%TASK%" /fo LIST /v 2>nul | find /i "%PAYLOAD%" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: the registered action does not reference %PAYLOAD%. Not writing the
    echo  detection marker. Inspect with:
    echo      schtasks /query /tn "%TASK%" /fo LIST /v
    exit /b 1
)
echo  Action references %PAYLOAD%
for /f "tokens=2 delims=:" %%s in ('schtasks /query /tn "%TASK%" /fo LIST 2^>nul ^| find /i "Status:"') do echo  Status:%%s

REM ---- 8. report the two dependencies this app does not own -----------------
echo  --- 8. dependencies owned elsewhere
set "PFAIL="
for /f "tokens=3" %%v in ('powercfg /query SCHEME_CURRENT SUB_VIDEO VIDEOIDLE 2^>nul ^| find /i "Current AC Power Setting"') do set "VIDEOIDLE=%%v"
if defined VIDEOIDLE (
    if /i not "!VIDEOIDLE!"=="0x00000000" set "PFAIL=1"
)
if defined PFAIL (
    echo  WARN: a display-off timer is set on AC power.
    echo  A configured inactivity limit also locks the device when the display turns
    echo  off because of power settings, so the kiosk will restart EARLY and at
    echo  unpredictable intervals. Deploy CDG-W11-CFG-Power Management-P-1.0 with
    echo  display, sleep and disk timeouts set to 0.
) else (
    echo  Display-off timer on AC: none, correct
)
echo.
echo  The screen saver must be active in the participant's session for the
echo  inactivity limit to lock it. Those values are per user and no Intune
echo  user-scoped policy can reach a local account, so they are written by
echo  Clear-KioskUserLogon.bat at logon. Confirm inside the session with:
echo      reg query "HKCU\Control Panel\Desktop" /v ScreenSaveActive

REM ---- 9. marker, written last ----------------------------------------------
echo  --- 9. marker
reg delete "HKLM\SOFTWARE\WOW6432Node\APM\ParticipantKiosk" /v %MARKERVALUE% /f >nul 2>&1
reg add "%MARKER%" /v %MARKERVALUE% /t REG_SZ /d "%VERSION%" /f >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not write the detection marker.
    exit /b 1
)
echo  %MARKER%\%MARKERVALUE% = %VERSION%

echo.
echo  Install complete. Log: %DEST%\logs\idle-restart.log
echo.
echo  Test: sign in as !ACCOUNT!, touch nothing for %LIMIT% seconds. The session
echo  locks, event 4800 is written, and the device restarts. Confirm with:
echo      wevtutil qe Security /q:"*[System[(EventID=4800)]]" /c:3 /rd:true /f:text
endlocal
exit /b 0
