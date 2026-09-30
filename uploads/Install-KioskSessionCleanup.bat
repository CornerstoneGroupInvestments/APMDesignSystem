@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM ============================================================================
REM  APM Participant Kiosk - session cleanup installer
REM
REM  Batch, for the same reason the payload is. App Control script enforcement
REM  leaves no runnable PowerShell option in SYSTEM context on this fleet:
REM  unsigned is blocked by policy, and a signed script will not load into the
REM  ConstrainedLanguage host that Task Scheduler and the Intune Management
REM  Extension provide. Enforcement covers PowerShell, VBScript, JScript, HTA
REM  and MSI, not .bat or .cmd.
REM
REM  THREE TASKS, not two. The PowerShell version combined boot and logon in one
REM  task using a task XML definition with two triggers. schtasks on the command
REM  line takes one schedule per task, and generating task XML from batch means
REM  escaping every angle bracket, so three plain registrations are used instead.
REM
REM    APM-PK-CleanStartup   at boot.   Authoritative. Also takes whatever the
REM                                     logoff pass could not, and reasserts
REM                                     autologon before the first logon attempt,
REM                                     which is the only point that is any use.
REM                                     Backed by a Group Policy machine startup
REM                                     script, because the task alone races
REM                                     autologon and loses on some boots.
REM    APM-PK-CleanLogon     at kiosk logon. Authoritative.
REM    APM-PK-CleanLogoff    on Security 4634 or 4647. Best effort, and on this
REM                                     device it is doing most of the work.
REM
REM  Plus TWO Group Policy scripts that do not race anything, because Windows
REM  runs each synchronously and waits for it:
REM    machine SHUTDOWN   as SYSTEM, before power-off. The guarantee: the data is
REM                       gone before the device is next touched. There is no
REM                       scheduled-task trigger for shutdown at all.
REM    machine STARTUP    as SYSTEM, before the logon screen appears.
REM    user LOGON         as the participant, before their desktop appears. Small
REM                       and fast, and limited to what that account owns. It
REM                       exists for the power-loss case, where the shutdown
REM                       script never ran and the machine passes lose the race to
REM                       Winlogon, which left files visible in Downloads for
REM                       minutes.
REM
REM  All three run as SYSTEM. SYSTEM is exempt from AppLocker and from the
REM  RestrictRun list Assigned Access writes into the kiosk hive, so nothing has
REM  to be added to AllowedApps. Adding cmd.exe to a public kiosk's allowed
REM  applications to run a cleanup script would be a poor trade.
REM
REM  Usage:  Install-KioskSessionCleanup.bat
REM          Install-KioskSessionCleanup.bat UNINSTALL
REM ============================================================================

set "DEST=C:\APM\PK"
set "PAYLOAD=Clear-KioskSessionData.bat"
set "USERPAYLOAD=Clear-KioskUserLogon.bat"
set "TARGET=%DEST%\%PAYLOAD%"
set "T_BOOT=APM-PK-CleanStartup"
set "T_LOGON=APM-PK-CleanLogon"
set "T_LOGOFF=APM-PK-CleanLogoff"
set "MARKER=HKLM\SOFTWARE\APM\ParticipantKiosk"

echo.
echo  APM Participant Kiosk - session cleanup installer
echo  ------------------------------------------------
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
    for %%t in ("%T_BOOT%" "%T_LOGON%" "%T_LOGOFF%") do (
        schtasks /delete /tn %%t /f >nul 2>&1
        echo  Removed task %%~t
    )
    REM  The startup and shutdown scripts have to go too, or they keep running
    REM  after the app is reported as uninstalled.
    set "GPSCRIPTS=%SystemRoot%\System32\GroupPolicy\Machine\Scripts"
    for %%p in (Startup Shutdown) do (
        if exist "%GPSCRIPTS%\%%p\%PAYLOAD%" del /f /q "%GPSCRIPTS%\%%p\%PAYLOAD%" >nul 2>&1
    )
    if exist "%GPSCRIPTS%\scripts.ini" del /f /q "%GPSCRIPTS%\scripts.ini" >nul 2>&1
    set "GPUSER=%SystemRoot%\System32\GroupPolicy\User\Scripts"
    if exist "%GPUSER%\Logon\%USERPAYLOAD%" del /f /q "%GPUSER%\Logon\%USERPAYLOAD%" >nul 2>&1
    if exist "%GPUSER%\scripts.ini" del /f /q "%GPUSER%\scripts.ini" >nul 2>&1
    reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v RunLogonScriptSync /f >nul 2>&1
    reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v HideLogonScripts /f >nul 2>&1
    gpupdate /force >nul 2>&1
    echo  Removed the machine startup and shutdown scripts, and the user logon script
    REM  The marker goes first, so a failure below cannot leave the app detected
    REM  with its tasks already gone.
    reg delete "%MARKER%" /v SessionCleanupVersion /f >nul 2>&1
    if exist "%TARGET%" del /f /q "%TARGET%" >nul 2>&1
    echo  Removed %TARGET%
    echo  Logs under %DEST%\logs are left in place.
    exit /b 0
)

REM ---- 1. stage the payload -------------------------------------------------
echo  --- 1. staging
set "SRC=%~dp0%PAYLOAD%"
if not exist "%SRC%" (
    echo  FAIL: %PAYLOAD% not found next to this installer.
    echo  Looked in: %~dp0
    exit /b 1
)
if not exist "%~dp0%USERPAYLOAD%" (
    echo  FAIL: %USERPAYLOAD% not found next to this installer.
    echo  Both payloads have to be in the package.
    exit /b 1
)
if not exist "%DEST%" md "%DEST%" >nul 2>&1
if not exist "%DEST%\logs" md "%DEST%\logs" >nul 2>&1
copy /y "%SRC%" "%TARGET%" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not copy the payload to %TARGET%.
    exit /b 1
)
echo  Staged %TARGET%

REM ---- 2. lock the payload down --------------------------------------------
REM  Three tasks run this as SYSTEM. If a standard user can write to it, they can
REM  run code as SYSTEM. This ACL is what bounds that exposure, because App
REM  Control cannot enforce a .bat and there is no signature to rely on.
echo  --- 2. permissions
icacls "%TARGET%" /inheritance:r /grant "SYSTEM:(RX)" "Administrators:(F)" >nul 2>&1
if errorlevel 1 (
    echo  WARN: could not apply the ACL. The payload is writable by whoever
    echo  inherits from %DEST%, and it runs as SYSTEM. Fix before production.
) else (
    echo  SYSTEM read and execute, Administrators full, inheritance removed
)

REM ---- 3. register the tasks -----------------------------------------------
echo  --- 3. tasks
set "FAILED=0"

REM  Delete first, ignoring the result. A delete of a task that does not exist
REM  writes to stderr and returns non-zero, which is expected on a first install.
for %%t in ("%T_BOOT%" "%T_LOGON%" "%T_LOGOFF%") do schtasks /delete /tn %%t /f >nul 2>&1

schtasks /create /tn "%T_BOOT%" /tr "\"%TARGET%\" Startup" /sc ONSTART /ru SYSTEM /rl HIGHEST /f >nul 2>&1
if errorlevel 1 (echo  FAIL: %T_BOOT% & set "FAILED=1") else (echo  Registered %T_BOOT%)

schtasks /create /tn "%T_LOGON%" /tr "\"%TARGET%\" Logon" /sc ONLOGON /ru SYSTEM /rl HIGHEST /f >nul 2>&1
if errorlevel 1 (echo  FAIL: %T_LOGON% & set "FAILED=1") else (echo  Registered %T_LOGON%)

REM  /sc ONEVENT with an XPath query avoids a task XML file entirely. The query
REM  is not filtered to the kiosk account: the payload resolves the kiosk account
REM  itself and only cleans that profile, so firing on an administrator logoff is
REM  harmless, and it usefully reasserts autologon after a support visit.
schtasks /create /tn "%T_LOGOFF%" /tr "\"%TARGET%\" Logoff" /sc ONEVENT /ec Security /mo "*[System[(EventID=4634 or EventID=4647)]]" /ru SYSTEM /rl HIGHEST /f >nul 2>&1
if errorlevel 1 (echo  FAIL: %T_LOGOFF% & set "FAILED=1") else (echo  Registered %T_LOGOFF%)

REM ---- 3b. Group Policy machine startup and shutdown scripts ---------------
REM  Two reasons this is not left to the scheduled tasks.
REM
REM  The ONSTART task races autologon. /sc ONSTART fires when the Task Scheduler
REM  service starts, which competes with Winlogon signing the kiosk account in,
REM  so on some boots the participant session is already running before the pass
REM  executes. Observed: a reboot out of the kiosk profile cleaned because the
REM  LOGOFF pass did the work; a reboot out of the admin session did not clean at
REM  all; and files saved to Downloads survived minutes into the next session.
REM
REM  A SHUTDOWN script is the mechanism that actually closes that window. Windows
REM  runs it as SYSTEM and waits for it to finish before powering off, so the data
REM  is gone before the device is next touched rather than shortly after. Task
REM  Scheduler has no shutdown trigger, so this can only be a Group Policy script.
REM  A STARTUP script likewise completes before the logon screen appears, so it
REM  cannot lose the race the way the task does.
REM
REM  Both tasks are kept as well. If local Group Policy processing is disabled or
REM  the CSE registration below does not take, the tasks still run, just later.
echo  --- 3b. startup and shutdown scripts
set "GPROOT=%SystemRoot%\System32\GroupPolicy"
set "GPSCRIPTS=%GPROOT%\Machine\Scripts"
set "GPOK=1"
for %%p in (Startup Shutdown) do (
    if not exist "%GPSCRIPTS%\%%p" md "%GPSCRIPTS%\%%p" >nul 2>&1
    copy /y "%SRC%" "%GPSCRIPTS%\%%p\%PAYLOAD%" >nul 2>&1
    if errorlevel 1 (
        echo  WARN: could not stage the %%p script.
        set "GPOK="
    ) else (
        echo  Staged %GPSCRIPTS%\%%p\%PAYLOAD%
    )
)
if not defined GPOK (
    echo  The scheduled tasks still cover boot and logon, but they race autologon,
    echo  and nothing covers shutdown. Fix before production.
) else (
    REM  scripts.ini holds both sections. psscripts.ini is the PowerShell list and
    REM  is not used here. The Shutdown pass runs with the Shutdown phase argument
    REM  so its log line names the phase that produced it.
    > "%GPSCRIPTS%\scripts.ini" echo [Startup]
    >>"%GPSCRIPTS%\scripts.ini" echo 0CmdLine=%PAYLOAD%
    >>"%GPSCRIPTS%\scripts.ini" echo 0Parameters=Startup
    >>"%GPSCRIPTS%\scripts.ini" echo [Shutdown]
    >>"%GPSCRIPTS%\scripts.ini" echo 0CmdLine=%PAYLOAD%
    >>"%GPSCRIPTS%\scripts.ini" echo 0Parameters=Shutdown
    attrib +h "%GPSCRIPTS%\scripts.ini" >nul 2>&1
    echo  Wrote scripts.ini with Startup and Shutdown sections

    REM  Without the Scripts client-side extension in gpt.ini the script list is
    REM  never read. The two GUIDs are the Scripts CSE and its snap-in.
    find /i "42B5FAAE-6536-11D2-AE5A-0000F87571E3" "%GPROOT%\gpt.ini" >nul 2>&1
    if errorlevel 1 (
        > "%GPROOT%\gpt.ini" echo [General]
        >>"%GPROOT%\gpt.ini" echo gPCMachineExtensionNames=[{42B5FAAE-6536-11D2-AE5A-0000F87571E3}{40B6664F-4972-11D1-A7CA-0000F87571E3}]
        >>"%GPROOT%\gpt.ini" echo Version=1
        echo  Registered the Scripts client-side extension in gpt.ini
    ) else (
        echo  Scripts client-side extension already registered
    )

    REM  A shutdown script that overruns its timeout is killed mid-pass, which on
    REM  a large Downloads folder would leave data behind. The default is 600
    REM  seconds; this raises the ceiling without making shutdown slower, because
    REM  the script exits as soon as it is done.
    reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v MaxGPOScriptWait /t REG_DWORD /d 900 /f >nul 2>&1
    echo  Script timeout ceiling set to 900 seconds

    gpupdate /target:computer /force >nul 2>&1
    echo  Policy refreshed
)

REM ---- 3c. Group Policy USER logon script ----------------------------------
REM  Runs as the participant, synchronously, before the desktop appears. It exists
REM  for one case: a power loss skips the shutdown script, and on the next boot the
REM  machine-side passes race Winlogon and lose, so the previous participant's
REM  files were visible in Downloads for minutes.
REM
REM  It clears only what that account owns and what the next participant sees
REM  first. Everything needing SYSTEM rights stays with the machine passes: the
REM  print spool, other accounts' Recycle Bins, Windows Temp, the HKU registry MRU
REM  keys and the HKLM autologon reassertion. A standard user cannot make those
REM  writes, which is why this is a second script and not the same one.
REM
REM  RunLogonScriptSync is what makes Windows wait for it. Without that value the
REM  script still runs but asynchronously, the desktop appears immediately, and the
REM  gap this is meant to close stays open. Startup and shutdown scripts are
REM  synchronous by default; user logon scripts are not.
echo  --- 3c. user logon script
set "GPUSER=%GPROOT%\User\Scripts"
if not exist "%GPUSER%\Logon" md "%GPUSER%\Logon" >nul 2>&1
copy /y "%~dp0%USERPAYLOAD%" "%GPUSER%\Logon\%USERPAYLOAD%" >nul 2>&1
if errorlevel 1 (
    echo  WARN: could not stage %USERPAYLOAD%. A power loss will leave participant
    echo  files visible until the machine passes catch up.
) else (
    echo  Staged %GPUSER%\Logon\%USERPAYLOAD%
    > "%GPUSER%\scripts.ini" echo [Logon]
    >>"%GPUSER%\scripts.ini" echo 0CmdLine=%USERPAYLOAD%
    >>"%GPUSER%\scripts.ini" echo 0Parameters=
    attrib +h "%GPUSER%\scripts.ini" >nul 2>&1
    echo  Wrote user scripts.ini

    REM  The USER half of gpt.ini. gPCUserExtensionNames is a separate value from
    REM  the machine one written above, and a user logon script list is not read
    REM  without it.
    find /i "gPCUserExtensionNames" "%GPROOT%\gpt.ini" >nul 2>&1
    if errorlevel 1 (
        >>"%GPROOT%\gpt.ini" echo gPCUserExtensionNames=[{42B5FAAE-6536-11D2-AE5A-0000F87571E3}{40B66650-4972-11D1-A7CA-0000F87571E3}]
        echo  Registered the user Scripts client-side extension
    ) else (
        echo  User Scripts client-side extension already registered
    )

    REM  Make the logon script synchronous, so the desktop waits for it.
    reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v RunLogonScriptSync /t REG_DWORD /d 1 /f >nul 2>&1
    echo  Logon scripts set to run synchronously

    REM  Hide the console window, so a participant does not see a command prompt
    REM  flash past before their desktop appears.
    reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v HideLogonScripts /t REG_DWORD /d 1 /f >nul 2>&1
    echo  Logon script window hidden

    gpupdate /target:user /force >nul 2>&1
)

REM ---- 4. verify, before claiming anything ---------------------------------
REM  Registration succeeding is not the same as a task being able to run, and a
REM  detection rule that trusts the file copy alone reports a broken device as
REM  healthy. Three other kiosk installers in this design carry that defect.
echo  --- 4. verify
for %%t in ("%T_BOOT%" "%T_LOGON%" "%T_LOGOFF%") do (
    schtasks /query /tn %%t >nul 2>&1
    if errorlevel 1 (
        echo  FAIL: %%~t is not present after registration
        set "FAILED=1"
    ) else (
        for /f "tokens=2 delims=:" %%s in ('schtasks /query /tn %%t /fo LIST 2^>nul ^| find /i "Status:"') do echo  %%~t status:%%s
    )
)

REM ---- 5. detection marker, written last ----------------------------------
REM  Intune detection is a registry rule on this value, not a file rule. It is
REM  written only after every task has verified, so a device where registration
REM  failed reports not-detected and Intune retries.
if "%FAILED%"=="1" (
    reg delete "%MARKER%" /v SessionCleanupVersion /f >nul 2>&1
    echo.
    echo  FAIL: one or more tasks did not register. Detection marker not written,
    echo  so Intune will retry rather than reporting this device as healthy.
    exit /b 1
)
reg add "%MARKER%" /v SessionCleanupVersion /t REG_SZ /d "1.2" /f >nul 2>&1
echo  Detection marker: %MARKER%\SessionCleanupVersion = 1.2

REM ---- 6. the logoff task's silent dependency -----------------------------
echo  --- 5. logoff auditing
auditpol /get /subcategory:"Logoff" 2>nul | find /i "Success" >nul 2>&1
if errorlevel 1 (
    echo  WARNING: logoff auditing is not enabled. %T_LOGOFF% is registered and
    echo  will never fire, and it will report no error. Enable it with:
    echo      auditpol /set /subcategory:"Logoff" /success:enable
    echo  Check whether the SOE hardening standard already sets this first: a
    echo  local auditpol change is overwritten at the next policy refresh.
    echo  The Startup and Logon passes are unaffected and are the authoritative
    echo  ones, so this is a gap rather than a failure.
) else (
    echo  Logoff auditing is enabled, so %T_LOGOFF% will fire.
)

REM ---- 7. first run --------------------------------------------------------
echo.
echo  --- 6. first run
echo  Running the Logon pass now, so the device does not carry data from before
echo  this install.
call "%TARGET%" Logon
echo.
echo  Install complete. Log: %DEST%\logs
endlocal
exit /b 0
