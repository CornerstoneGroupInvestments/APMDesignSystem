@echo off
setlocal EnableExtensions EnableDelayedExpansion
REM ============================================================================
REM  APM Participant Kiosk - stage the approved wallpaper
REM
REM  Batch, not PowerShell, and rewritten to carry every lesson this pack has
REM  already paid for:
REM
REM   1. NO POWERSHELL. App Control script enforcement leaves no runnable
REM      PowerShell option in SYSTEM context on this fleet: unsigned is blocked
REM      by policy, and a signed script will not load into the
REM      ConstrainedLanguage host that Task Scheduler and the Intune Management
REM      Extension provide. Enforcement does not cover .bat or .cmd.
REM      The PowerShell version of this installer also used
REM      New-Object System.Security.AccessControl.FileSystemAccessRule, which
REM      Constrained Language Mode blocks outright, so it could never have set
REM      the ACL even where it did run.
REM
REM   2. RUN 64-BIT. Intune runs a Win32 app's install command in a 32-bit
REM      process, which redirects HKLM\SOFTWARE to WOW6432Node and
REM      %SystemRoot%\System32 to SysWOW64. The detection marker below would land
REM      where no Intune rule looks.
REM
REM   3. NO $PSScriptRoot EQUIVALENT GUESSWORK. %~dp0 is always the directory
REM      holding this file, including when Intune extracts the package to a temp
REM      path.
REM
REM   4. DETECTION IS A REGISTRY MARKER WRITTEN LAST, NOT A FILE-EXISTS RULE.
REM      The old rule was "C:\APM\PK\wallpaper.png exists", and this installer
REM      copies the file BEFORE it applies the ACL. A file rule therefore reports
REM      installed on a device where the ACL failed and the participant can
REM      replace the wallpaper. The marker is written only after the copy, the
REM      ACL and a size check have all succeeded.
REM
REM   5. icacls, NOT Get-Acl. Same reason as 1, and it is what the session
REM      cleanup installer already uses successfully on this fleet.
REM
REM  Usage:  Install-KioskWallpaper.bat
REM          Install-KioskWallpaper.bat UNINSTALL
REM
REM  The image must be in the package beside this file. The Intune Custom profile
REM  points ./Vendor/MSFT/Personalization/DesktopImageUrl at the staged path
REM  (Detailed Design 5.2.6); this app only puts the file there.
REM ============================================================================

REM ---- run 64-bit ------------------------------------------------------------
if defined PROCESSOR_ARCHITEW6432 (
    echo  Relaunching 64-bit, so the registry marker is not redirected.
    "%SystemRoot%\Sysnative\cmd.exe" /c ""%~f0" %*"
    exit /b %errorlevel%
)

set "DEST=C:\APM\PK"
set "IMAGE=wallpaper-participant-v5.1.png"
set "TARGET=%DEST%\wallpaper.png"
set "MARKER=HKLM\SOFTWARE\APM\ParticipantKiosk"
set "MARKERVALUE=WallpaperVersion"
set "VERSION=5.2"

echo.
echo  APM Participant Kiosk - wallpaper
echo  --------------------------------
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
    REM  Marker first, so a partial uninstall cannot leave the app detected with
    REM  its payload already gone.
    reg delete "%MARKER%" /v %MARKERVALUE% /f >nul 2>&1
    reg delete "HKLM\SOFTWARE\WOW6432Node\APM\ParticipantKiosk" /v %MARKERVALUE% /f >nul 2>&1
    reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\Personalization" /v LockScreenImage /f >nul 2>&1
    reg delete "HKLM\SOFTWARE\Policies\Microsoft\Windows\Personalization" /v LockScreenOverlaysDisabled /f >nul 2>&1
    if exist "%TARGET%" (
        REM  The ACL below removes inheritance and denies Users write access, so
        REM  the file has to be handed back before it can be deleted.
        icacls "%TARGET%" /grant "Administrators:(F)" >nul 2>&1
        del /f /q "%TARGET%" >nul 2>&1
    )
    if exist "%TARGET%" (
        echo  WARN: could not remove %TARGET%.
    ) else (
        echo  Removed %TARGET%
    )
    echo  Uninstall complete. The wallpaper reverts at the next logon once the
    echo  Personalization profile is also unassigned.
    exit /b 0
)

REM ---- 1. locate the image --------------------------------------------------
echo  --- 1. source
set "SRC=%~dp0%IMAGE%"
if not exist "%SRC%" (
    echo  FAIL: %IMAGE% not found beside this installer.
    echo  Looked in: %~dp0
    echo  The image must be inside the .intunewin package, not referenced from a
    echo  share. Repackage with both files in the source folder.
    exit /b 1
)
for %%f in ("%SRC%") do set "SRCSIZE=%%~zf"
echo  Found %IMAGE% (%SRCSIZE% bytes)
if %SRCSIZE% LSS 1024 (
    echo  FAIL: the source image is %SRCSIZE% bytes. That is not a usable PNG.
    exit /b 1
)

REM ---- 2. stage it ---------------------------------------------------------
echo  --- 2. staging
if not exist "%DEST%" md "%DEST%" >nul 2>&1
if not exist "%DEST%" (
    echo  FAIL: could not create %DEST%.
    exit /b 1
)

REM  Hand the file back before overwriting. On a device where this has already
REM  run, the ACL below denies Users write access and removes inheritance, and a
REM  plain copy over it fails with access denied. That is the most likely reason
REM  a reinstall or version bump appeared to do nothing.
if exist "%TARGET%" icacls "%TARGET%" /grant "Administrators:(F)" >nul 2>&1

copy /y "%SRC%" "%TARGET%" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not copy the image to %TARGET%.
    exit /b 1
)
if not exist "%TARGET%" (
    echo  FAIL: %TARGET% is not present after the copy.
    exit /b 1
)
for %%f in ("%TARGET%") do set "DESTSIZE=%%~zf"
if not "%DESTSIZE%"=="%SRCSIZE%" (
    echo  FAIL: staged file is %DESTSIZE% bytes, source is %SRCSIZE%. The copy is
    echo  incomplete, so the marker is not written and Intune will retry.
    exit /b 1
)
echo  Staged %TARGET% (%DESTSIZE% bytes)

REM ---- 3. lock it down -----------------------------------------------------
REM  The participant session must be able to READ the wallpaper and must not be
REM  able to replace it. Inheritance is removed so a permissive ACL on C:\APM\PK
REM  cannot grant write access by the back door.
echo  --- 3. permissions
icacls "%TARGET%" /inheritance:r /grant "*S-1-5-18:(RX)" "*S-1-5-32-544:(F)" "*S-1-5-32-545:(RX)" >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not apply the ACL. Not writing the detection marker: a
    echo  readable-but-writable wallpaper is a defect, not a partial success.
    exit /b 1
)
echo  SYSTEM read and execute, Administrators full, Users read and execute
echo  Inheritance removed

REM  Confirm Users really cannot write. icacls returning 0 is not proof.
icacls "%TARGET%" | find /i "S-1-5-32-545" >nul 2>&1
icacls "%TARGET%" | find /i "(W)" >nul 2>&1
if not errorlevel 1 (
    echo  WARN: a write grant is still present on the file. Review the ACL:
    icacls "%TARGET%"
)

REM ---- 4. apply it by policy, not only by CSP -------------------------------
REM  THIS IS THE FIX FOR A WALLPAPER THAT NEVER APPEARS THOUGH THE FILE IS STAGED
REM  AND THE CSP IS CONFIGURED.
REM
REM  PersonalizationCSP applies once, at the moment the policy is received, and
REM  records the outcome under
REM  HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\PersonalizationCSP. If the
REM  image is not on disk at that moment it marks itself done against a file that
REM  does not exist and never retries. The Personalization profile and this Win32
REM  app land at different points in enrolment, so the profile can easily win the
REM  race, and once DesktopImageStatus is set the CSP will not re-read the path
REM  even after the file appears.
REM
REM  Two things are done about it. First the equivalent Group Policy values are
REM  written, which are read fresh at every logon and do not latch. Second the
REM  stale CSP record is cleared, so the next policy refresh re-applies the CSP
REM  against a file that now exists.
REM
REM  The lock screen value is machine-wide and is written here. The desktop value
REM  is per user and cannot be written from SYSTEM for an account that may not
REM  exist yet, so Clear-KioskUserLogon.bat writes it inside the participant's own
REM  hive at logon. Pack 05 at version 1.8 or later is a prerequisite.
echo  --- 4. policy values
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\Personalization" /v LockScreenImage /t REG_SZ /d "%TARGET%" /f >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not set the lock screen policy value.
    exit /b 1
)
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\Personalization" /v LockScreenOverlaysDisabled /t REG_DWORD /d 1 /f >nul 2>&1
echo  Lock screen policy: %TARGET%

REM  Clearing the CSP record is safe: the image Windows has already cached under
REM  ProgramData is not removed by this, so nothing reverts in the meantime, and
REM  the policy values above hold the setting until the CSP re-applies.
set "CSPKEY=HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\PersonalizationCSP"
reg query "%CSPKEY%" /v DesktopImageStatus >nul 2>&1
if errorlevel 1 (
    echo  No stale PersonalizationCSP status to clear
) else (
    reg delete "%CSPKEY%" /f >nul 2>&1
    echo  Cleared the stale PersonalizationCSP record, so the next policy refresh
    echo  re-applies it against a file that now exists
)

REM ---- 5. detection marker, written last ----------------------------------
echo  --- 5. marker
reg delete "HKLM\SOFTWARE\WOW6432Node\APM\ParticipantKiosk" /v %MARKERVALUE% /f >nul 2>&1
reg add "%MARKER%" /v %MARKERVALUE% /t REG_SZ /d "%VERSION%" /f >nul 2>&1
if errorlevel 1 (
    echo  FAIL: could not write the detection marker.
    exit /b 1
)
echo  %MARKER%\%MARKERVALUE% = %VERSION%

REM ---- 6. what still has to happen ----------------------------------------
echo.
echo  --- next
echo  This app only stages the image. The wallpaper is applied by the
echo  Personalization profile pointing DesktopImageUrl at:
echo      %TARGET%
echo.
echo  Two things to know if the wallpaper does not change on the device:
echo   - PersonalizationCSP applies at logon, so a restart is the reliable test.
echo   - The CSP records what it applied under
echo     HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\PersonalizationCSP.
echo     If DesktopImageStatus is already 1 for the same path, Windows does not
echo     re-read the file, so a NEW IMAGE AT THE SAME PATH can be ignored. Bump
echo     the file name and the profile together when the artwork changes, rather
echo     than overwriting wallpaper.png in place.
echo.
echo  Install complete.
endlocal
exit /b 0
