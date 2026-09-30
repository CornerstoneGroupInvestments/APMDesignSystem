@echo off
setlocal EnableExtensions
REM ============================================================================
REM  APM Participant Kiosk - set automatic time zone and force a time sync
REM
REM  A batch file, deliberately. App Control for Business script enforcement
REM  covers PowerShell, VBScript, JScript, HTA and MSI. It does NOT cover .bat
REM  or .cmd, so this runs on an enforced device with no code-signing
REM  certificate and no Constrained Language Mode to work around.
REM
REM  TEST TOOLING. Read the two warnings below before running it anywhere real.
REM
REM  WARNING 1 - THIS TURNS THE LOCATION SERVICE ON.
REM  Automatic time zone is resolved by geolocation, so it needs the Windows
REM  Location service running and location access allowed machine-wide. On a
REM  public device with no signed-in user that is a privacy posture change, not
REM  a convenience setting, and it needs a recorded decision before it reaches
REM  production. The SOE hardening standard may also disable it, in which case
REM  policy wins at the next refresh and this reverts.
REM
REM  WARNING 2 - AUTOMATIC TIME ZONE AND THE ZSCALER TUNNEL DISAGREE.
REM  Geolocation falls back to IP address when Wi-Fi positioning is
REM  unavailable. Site traffic egresses through a Zscaler ZIA node, so the
REM  apparent IP location is the ZIA node's, not the kiosk's. A Brisbane device
REM  egressing via a Sydney node can be given AUS Eastern Standard Time and
REM  observe daylight saving that Queensland does not. That failure is correct
REM  in winter and an hour out all summer.
REM  A fixed per-state time zone set by policy does not have this problem.
REM  See timezone-and-time-sync.md.
REM
REM  Usage: right-click, Run as administrator. Or from an elevated prompt:
REM      Set-KioskTimeAuto.bat
REM ============================================================================

echo.
echo  APM Participant Kiosk - automatic time zone and time sync
echo  ---------------------------------------------------------
echo  Device: %COMPUTERNAME%
echo  Run at: %DATE% %TIME%
echo.

REM ---- elevation -------------------------------------------------------------
net session >nul 2>&1
if errorlevel 1 (
    echo  FAIL: not elevated. Right-click and Run as administrator.
    echo.
    exit /b 1
)
echo  Running elevated.
echo.

REM ---- before ----------------------------------------------------------------
echo  --- before
for /f "tokens=*" %%T in ('tzutil /g') do echo  Time zone:        %%T
w32tm /query /source 2>nul
echo.

REM ---- 1. location service, which automatic time zone depends on -------------
REM  Order matters. A policy value that disables location overrides the consent
REM  store and the service, so the policy blocks are cleared first, then
REM  consent, then the service itself. Clearing them in the other order leaves
REM  a service that starts and never returns a fix.
REM
REM  Automatic time zone reads the SYSTEM location, not a per-user one, so the
REM  machine consent below is sufficient. There is no need to touch the kiosk
REM  account's own hive.
echo  --- 1. location, which automatic time zone depends on
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" /v DisableLocation /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" /v DisableWindowsLocationProvider /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" /v DisableLocationScripting /f >nul 2>&1
echo  Cleared any local policy value disabling location

reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location" /v Value /t REG_SZ /d Allow /f >nul 2>&1
if errorlevel 1 (echo  WARN: could not set machine location consent.) else (echo  Machine location consent: Allow)

reg add "HKLM\SYSTEM\CurrentControlSet\Services\lfsvc\Service\Configuration" /v Status /t REG_DWORD /d 1 /f >nul 2>&1
if errorlevel 1 (echo  WARN: could not enable the location service configuration.) else (echo  Location service configuration: enabled)

sc config lfsvc start= auto >nul 2>&1
net start lfsvc >nul 2>&1
sc query lfsvc | find "STATE" 2>nul

REM  An Intune policy under PolicyManager cannot be cleared here. It is
REM  rewritten at every check-in, so if one is present the kiosk group needs an
REM  assignment exclusion and nothing done on the device will hold.
echo.
echo  Checking for an Intune location restriction that would override all of the above:
reg query "HKLM\SOFTWARE\Microsoft\PolicyManager\current\device\Privacy" /v LetAppsAccessLocation 2>nul | find "LetAppsAccessLocation"
if errorlevel 1 (
    echo  None found. Nothing is overriding the settings above.
) else (
    echo  FOUND. An Intune policy is controlling location access and it wins.
    echo  A value of 2 denies it. This cannot be fixed on the device: exclude the
    echo  kiosk group from the profile that sets it, or accept that automatic
    echo  time zone will not work and set a fixed zone by policy instead.
)
echo.

REM ---- 2. automatic time zone ------------------------------------------------
REM  The "Set time zone automatically" toggle is the tzautoupdate service start
REM  value. 3 is demand-start, which is the toggle On. 4 is disabled, the Off
REM  position and the Windows default.
echo  --- 2. automatic time zone
sc config tzautoupdate start= demand >nul 2>&1
if errorlevel 1 (echo  WARN: could not enable tzautoupdate.) else (echo  tzautoupdate: demand start, toggle is now On)
reg query "HKLM\SYSTEM\CurrentControlSet\Services\tzautoupdate" /v Start 2>nul | find "Start"
echo.

REM ---- 3. time service ------------------------------------------------------
REM  Type must be NTP, not NT5DS. NT5DS tells the device to follow a domain
REM  time hierarchy, and an Entra-joined device with no domain has none, so it
REM  never synchronises while the service reports success.
echo  --- 3. time service
sc config w32time start= auto >nul 2>&1
net start w32time >nul 2>&1

w32tm /config /manualpeerlist:"time.windows.com,0x9" /syncfromflags:manual /update >nul 2>&1
if errorlevel 1 (echo  WARN: w32tm /config returned an error.) else (echo  NTP peer set: time.windows.com,0x9 - flag 0x9 makes the poll interval below apply)

REM  The default SpecialPollInterval is 604800 seconds, seven days. On this
REM  class of hardware that is minutes of drift, not seconds.
reg add "HKLM\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\NtpClient" /v SpecialPollInterval /t REG_DWORD /d 3600 /f >nul 2>&1
echo  Poll interval: 3600 seconds, replacing the seven-day default

net stop w32time >nul 2>&1
net start w32time >nul 2>&1
echo  Time service restarted
echo.

REM ---- 4. force a sync ------------------------------------------------------
echo  --- 4. forcing a resync
w32tm /resync /force
if errorlevel 1 (
    echo.
    echo  FAIL: the resync did not succeed.
    echo  NTP is UDP 123 and it is not web traffic, so the Zscaler tunnel does
    echo  not carry it. Outbound UDP 123 from the kiosk range has to be
    echo  permitted at the Meraki edge and on the Palo Alto pair. Raise with
    echo  APM Network Management, and confirm with Stratus whether the tunnel
    echo  carries UDP 123.
)
echo.

REM ---- 5. after -------------------------------------------------------------
echo  --- after
for /f "tokens=*" %%T in ('tzutil /g') do echo  Time zone:        %%T
echo  Local time:       %DATE% %TIME%
w32tm /query /source 2>nul
w32tm /query /status 2>nul | find /i "Last Successful Sync Time"
w32tm /query /status 2>nul | find /i "Source"
w32tm /query /status 2>nul | find /i "Stratum"
echo.

echo  --- reachability
echo  Three samples against the configured source. An offset means UDP 123 got through.
w32tm /stripchart /computer:time.windows.com /dataonly /samples:3
echo.

echo  Done.
echo.
echo  Automatic time zone takes a few minutes and needs the location service to
echo  get a fix. Check tzutil /g again after five minutes, and confirm it picked
echo  the state the device is actually in rather than the state its Zscaler
echo  egress node is in.
echo.
endlocal
exit /b 0
