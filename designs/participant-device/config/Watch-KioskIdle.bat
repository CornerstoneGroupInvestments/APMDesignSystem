@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM ============================================================================
REM  APM Participant Kiosk - inactivity watchdog
REM
REM  Restarts the device after 10 minutes with no input in the participant
REM  session, which is the mechanism behind the "deleted after 10 minutes of
REM  inactivity" statement on the participant wallpaper.
REM
REM  THIS IS A REWRITE, NOT A TRANSLATION. The PowerShell version could not work
REM  on this fleet and its whole approach had to change:
REM
REM   1. It called GetLastInputInfo through Add-Type. Add-Type is blocked in
REM      Constrained Language Mode, and the scheduled task host is Constrained,
REM      so the P/Invoke could never compile. Signing does not help: a signed
REM      FullLanguage script will not load into a Constrained host at all.
REM   2. It had to run IN the participant session, because GetLastInputInfo only
REM      returns a real value there. That meant powershell.exe had to be allowed
REM      to run inside a public kiosk session, which is a poor trade.
REM   3. It built a full-screen warning with System.Windows.Forms, which is more
REM      Add-Type and more blocked types.
REM
REM  What replaces each:
REM   1. quser reports the session's IDLE TIME directly and runs as SYSTEM, so no
REM      API call and no code in the participant session.
REM   2. The task runs as SYSTEM. Nothing is added to the Assigned Access
REM      allowed-app list.
REM   3. Windows draws the countdown itself. shutdown /r /t 60 /c "..." shows the
REM      native warning, and shutdown /a cancels it when input resumes.
REM
REM  Usage:  Watch-KioskIdle.bat            normal, run by the task every minute
REM          Watch-KioskIdle.bat STATUS     print what it sees and change nothing
REM
REM  IT WILL NOT RESTART A DEVICE NOBODY HAS TOUCHED. See the arming block below:
REM  arming needs two readings showing observed input, so an untouched kiosk, an
REM  Autopilot provisioning window and a device left on overnight are all safe.
REM
REM  Values per the Detailed Design 4.3.2.
REM ============================================================================

REM ---- run 64-bit ------------------------------------------------------------
REM  quser.exe and shutdown.exe live in System32, which a 32-bit process has
REM  redirected to SysWOW64.
if defined PROCESSOR_ARCHITEW6432 (
    "%SystemRoot%\Sysnative\cmd.exe" /c ""%~f0" %*"
    exit /b %errorlevel%
)

set "IDLE_LIMIT=10"
set "WARN_AT=9"
set "GRACE=60"
REM  WARN_AT plus GRACE is what actually determines the restart point: the warning
REM  is raised at 9 minutes and Windows restarts 60 seconds later. IDLE_LIMIT is
REM  the stated 10-minute figure those two produce, and is reported by STATUS. It
REM  is not itself a threshold, so changing it alone changes nothing.
set "STATE=C:\APM\PK"
set "STATEFILE=%STATE%\idle-state.txt"
set "PENDFLAG=%STATE%\idle-pending.txt"
set "LOG=%STATE%\logs\idle-watchdog.log"
set "STATUSONLY="
if /i "%~1"=="STATUS" set "STATUSONLY=1"

if not exist "%STATE%\logs" md "%STATE%\logs" >nul 2>&1

REM ---- read the participant session from quser ------------------------------
REM  quser output, with the current session prefixed by ">":
REM   USERNAME  SESSIONNAME  ID  STATE  IDLE TIME  LOGON TIME
REM  IDLE TIME is ".", "none", minutes, "h:mm", or "d+hh:mm".
REM  Only a console session in the Active state is considered: a disconnected or
REM  listening session has no participant in front of it.
set "SESSUSER="
set "SESSIDLE="
set "SESSLOGON="
for /f "skip=1 tokens=1,2,3,4,5,6*" %%a in ('quser 2^>nul') do (
    set "U=%%a"
    set "U=!U:>=!"
    if /i "%%b"=="console" if /i "%%d"=="Active" (
        if not defined SESSUSER (
            set "SESSUSER=!U!"
            set "SESSIDLE=%%e"
            set "SESSLOGON=%%f %%g"
        )
    )
)

if not defined SESSUSER (
    if defined STATUSONLY echo  No active console session. Nothing to watch.
    goto :end
)

REM  Only watch a kiosk session. An administrator signed in for support must not
REM  have the device restarted underneath them.
echo !SESSUSER! | find /i "kiosk-" >nul 2>&1
if errorlevel 1 (
    if defined STATUSONLY echo  Active session is !SESSUSER!, not a kiosk account. Not watching.
    goto :end
)

REM ---- convert IDLE TIME to whole minutes -----------------------------------
REM  quser reports idle as "." or "none" (active now), plain minutes, "h:mm", or
REM  "d+hh:mm".
REM
REM  WRITTEN AS if BLOCKS, NOT "if COND set X & goto Y". That shorthand parses as
REM  (if COND set X) & goto Y, so the goto fires unconditionally. An earlier build
REM  used it here, which meant MINS stayed 0 for every reading no matter what
REM  quser said: the watchdog armed correctly and then never reached the warning
REM  threshold, so a device left idle for twenty minutes never restarted.
set "MINS="
set "RAW=!SESSIDLE!"

if "!RAW!"=="." set "MINS=0"
if not defined MINS if /i "!RAW!"=="none" set "MINS=0"

REM  d+hh:mm, a day or more. Well past any threshold this design uses.
if not defined MINS (
    echo !RAW! | find "+" >nul 2>&1
    if not errorlevel 1 set "MINS=9999"
)

REM  h:mm. Hours carry no leading zero in quser output and minutes always have
REM  two digits, so the 1nn-100 trick is applied to the minutes only. Applying it
REM  to a single-digit hour would give 11-100 and a negative total.
if not defined MINS (
    echo !RAW! | find ":" >nul 2>&1
    if not errorlevel 1 (
        for /f "tokens=1,2 delims=:" %%h in ("!RAW!") do set /a "MINS=%%h*60+(1%%i-100)" >nul 2>&1
    )
)

REM  Plain minutes.
if not defined MINS set /a "MINS=!RAW!" >nul 2>&1

REM  Anything unparseable is treated as active, never as idle. Restarting a device
REM  because a field could not be read is the wrong way to fail.
if not defined MINS set "MINS=0"

if defined STATUSONLY (
    echo  Session      : !SESSUSER!
    echo  Logon time   : !SESSLOGON!
    echo  Idle, raw    : "!SESSIDLE!"  as quser reports it
    echo  Idle, minutes: !MINS!
    echo  Warn at      : !WARN_AT! minutes
    echo  Restart at   : !IDLE_LIMIT! minutes
    if exist "%STATEFILE%" (set /p A=<"%STATEFILE%" & echo  State file   : !A!) else (echo  State file   : none yet)
    if exist "%PENDFLAG%" (echo  Restart      : PENDING) else (echo  Restart      : not pending)
    if exist "%STATE%\idle-debug.txt" (echo  Per-poll log : on) else (echo  Per-poll log : off, create %STATE%\idle-debug.txt to enable)
    goto :end
)

REM ---- arm only on OBSERVED INPUT, never on a fresh session -----------------
REM  This is the part that has to be got right, and the obvious version of it is
REM  wrong. Arming on "idle is 0 or 1" looks like a test for recent use, but a
REM  session that has just auto-logged on ALSO reports idle 0, so an untouched
REM  kiosk would arm at logon, restart ten minutes later, auto-log on again, and
REM  repeat forever. During Autopilot that reboot loop would land in the middle of
REM  app installs and policy delivery.
REM
REM  Input is a CHANGE, not a value, so two consecutive readings are compared:
REM
REM    idle went DOWN          someone touched it. Only input reduces idle time.
REM    idle stayed at 0        also input: with a one-minute poll, an untouched
REM                            session would have climbed to 1.
REM    idle went UP            nobody touched it. Never arms.
REM
REM  On a never-touched session idle increases strictly and monotonically from
REM  logon, so neither arming condition can ever fire. On a session in continuous
REM  use idle stays at 0 and the second condition fires. On a session used once
REM  and left, idle drops when it is used and the first condition fires.
REM
REM  The state is keyed to the session's logon time, so a new session starts with
REM  no previous reading and therefore cannot arm on its first poll. Without that
REM  key the reading from the session before the restart would carry over and
REM  re-arm the new, untouched one.
set "KEY=!SESSLOGON!"
set "KEY=!KEY: =!"
set "KEY=!KEY:/=!"
set "KEY=!KEY::=!"

set "PKEY="
set "PLAST="
set "PARMED=0"
if exist "%STATEFILE%" (
    for /f "tokens=1,2,3" %%a in ('type "%STATEFILE%" 2^>nul') do (
        set "PKEY=%%a"
        set "PLAST=%%b"
        set "PARMED=%%c"
    )
)
if not "!PKEY!"=="!KEY!" (
    set "PLAST="
    set "PARMED=0"
    call :log "new session, logged on !SESSLOGON!. Not armed until input is observed."
    REM  A pending flag from before the restart refers to a session that no longer
    REM  exists. Left in place it is only cleared on the first armed poll, so a
    REM  device could carry it for as long as nobody touches the new session.
    if exist "%PENDFLAG%" (
        del /f /q "%PENDFLAG%" >nul 2>&1
        shutdown /a >nul 2>&1
    )
)

REM  Written flat, one condition per line, with no else and no nested blocks. The
REM  version with an if/else and a nested two-part if inside the else parsed but
REM  was one edit away from breaking: cmd resolves a block's parentheses at parse
REM  time, so a stray bracket anywhere inside changes the meaning of the whole
REM  structure silently.
set "ARMED=!PARMED!"
if "!ARMED!"=="0" if defined PLAST if !MINS! LSS !PLAST! set "ARMED=1"
if "!ARMED!"=="0" if defined PLAST if !MINS! EQU 0 if !PLAST! EQU 0 set "ARMED=1"
if "!ARMED!"=="1" if "!PARMED!"=="0" call :log "input observed, idle !PLAST! then !MINS!. Armed."

REM  Written on every run, whatever happens next, so the next poll has something
REM  to compare against.
> "%STATEFILE%" echo !KEY! !MINS! !ARMED!

REM  Per-poll logging is opt-in. This task runs every minute, so logging every
REM  reading is 1440 lines a day and grows without limit on a device that stays in
REM  service for a year. Transitions are always logged; the full trace is only
REM  written when the debug flag file exists, which is how it should be read back
REM  when something looks wrong.
if exist "%STATE%\idle-debug.txt" call :log "idle !SESSIDLE! = !MINS! min, armed !ARMED!"

if "!ARMED!"=="0" goto :end

REM ---- input resumed while a restart was pending ----------------------------
if exist "%PENDFLAG%" (
    if !MINS! LSS !WARN_AT! (
        shutdown /a >nul 2>&1
        del /f /q "%PENDFLAG%" >nul 2>&1
        call :log "restart cancelled, input resumed at !MINS! minute(s) idle"
    )
    goto :end
)

REM ---- warn, and let Windows run the countdown ------------------------------
REM  shutdown /r /t 60 draws the native warning and performs the restart, so this
REM  script needs no window, no GUI assembly and nothing running in the
REM  participant session. shutdown /a above cancels it if the participant returns.
if !MINS! GEQ !WARN_AT! (
    shutdown /r /t %GRACE% /f /c "This device will restart in one minute. Any unsaved work will be deleted. Move the mouse or press a key to continue your session." >nul 2>&1
    if errorlevel 1 (
        call :log "shutdown /r failed at !MINS! minute(s) idle"
    ) else (
        > "%PENDFLAG%" echo !KEY!
        call :log "restart scheduled in %GRACE%s at !MINS! minute(s) idle"
        REM  Belt and braces on the warning being seen. The native countdown is
        REM  the primary; this is a second, plainer prompt in the session itself.
        REM  Best effort: msg.exe is absent on some editions and the failure is
        REM  deliberately ignored.
        msg "!SESSUSER!" /time:%GRACE% "This device will restart in one minute. Any unsaved work will be deleted. Move the mouse or press a key to continue." >nul 2>&1
    )
    goto :end
)

REM  Below the warning threshold. The arm flag stays: the session is still in use.
:end
endlocal
exit /b 0

:log
REM  One generation of rollover, so the log cannot grow without bound.
if exist "%LOG%" for %%f in ("%LOG%") do if %%~zf GTR 1048576 move /y "%LOG%" "%LOG%.old" >nul 2>&1
echo %DATE% %TIME%  %~1 >>"%LOG%"
exit /b 0
