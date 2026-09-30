# 03 - Win32 app: Restart on inactivity lock

**Supersedes the polling watchdog** (`CDG-W11-REM-Idle Restart-P-1.0`, `Watch-KioskIdle.bat`/`.ps1`, task `APM-PK-IdleWatchdog`). Three builds of that watchdog failed on a reference device, and the reason was the signal rather than the code: `quser`'s IDLE TIME column does not report session input idle time. Full reasoning and sources: `../../research-kiosk-idle-restart.md`.

The installer removes the old task, its state files and its detection marker, so there is nothing to uninstall first.

## How it works

| | |
|---|---|
| Idle detection | Windows, via `Interactive logon: Machine inactivity limit` (600 seconds) |
| Signal | Security event 4800, the workstation lock, filtered to the kiosk account |
| Action | `shutdown /r /f /t 0` from an event-triggered scheduled task as SYSTEM |

No polling, no parsing, no arming logic, no state files. Nothing runs until the device is genuinely idle.

The task is registered with `/sc ONEVENT /ec Security /mo "<XPath>"`, so there is no task XML file and no caret escaping.

## Package

```
Install-KioskIdleRestart.bat
Restart-KioskOnLock.bat
```

```
IntuneWinAppUtil.exe -c <folder> -s Install-KioskIdleRestart.bat -o <output>
```

## Intune settings

Name: `CDG-W11-REM-Idle Restart-P-2.0`

| Field | Value |
|---|---|
| Install command | `Install-KioskIdleRestart.bat` |
| Uninstall command | `Install-KioskIdleRestart.bat UNINSTALL` |
| Install behaviour | System |
| Assignment | `sg-dyn-dvc-cdg-participant-kiosk` |

Detection rule, registry:

| Field | Value |
|---|---|
| Key path | `HKEY_LOCAL_MACHINE\SOFTWARE\APM\ParticipantKiosk` |
| Value name | `IdleRestartVersion` |
| Method | String comparison, Equals, `3.0` |
| Associated with a 32-bit app | No |

The marker is written only after the payload is staged and locked down, the inactivity limit is set, the audit setting is **verified active**, the task is registered, and the registered action is confirmed to reference the payload.

## Three dependencies, each of which fails silently

**1. Audit Other Logon/Logoff Events must be Success.** Without it event 4800 is never written, the task registers cleanly and never fires. The installer sets it and then re-reads it, and refuses to write the marker if it did not take. **Set it by Intune policy** as well: a local `auditpol` change is overwritten at the next policy refresh.

**2. The screen saver must be active in the participant's session.** Microsoft qualifies the inactivity limit with "screen saver should be active on the destination machine", and those values are per user. No Intune user-scoped policy can reach a local kiosk account, so `Clear-KioskUserLogon.bat` in pack 05 writes them at logon (`ScreenSaveActive`, `ScreenSaveTimeOut` = 600, `ScreenSaverIsSecure`, `SCRNSAVE.EXE`). **Pack 05 at version 1.7 or later is a prerequisite for this app.**

`ScreenSaveTimeOut` matches the inactivity limit exactly: where both are set, the shorter wins, so a smaller value restarts the device early.

**3. No display-off or sleep timer.** A configured inactivity limit also locks the device when the display turns off because of power settings, so a display timeout shorter than ten minutes restarts the kiosk early and at unpredictable intervals. `CDG-W11-CFG-Power Management-P-1.0` with display, sleep and disk timeouts set to 0 is now a prerequisite rather than an improvement. The installer reads the current AC display timeout and warns.

## Behaviour the design document needs to state

The session **locks** at ten minutes and the device restarts immediately afterwards.

**The lock is not recoverable by the participant.** The session account's credential lives only in the Winlogon LSA secret and no person knows it, so the restart is the recovery path, not a courtesy. That is why it is `/t 0` rather than a countdown.

**There is no warning.** A participant who reads the screen for ten minutes without touching anything loses unsaved work with no prompt. That is what the wallpaper already tells them, and it should be stated in the design rather than found in a support call.

One property is better than the old design: the screen locks **first**, so participant data is off-screen at the ten-minute mark and the restart then purges it. The polling watchdog left the desktop visible through a 60-second countdown.

## Verification

```
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v InactivityTimeoutSecs
auditpol /get /subcategory:"Other Logon/Logoff Events"
schtasks /query /tn APM-PK-IdleRestart /fo LIST /v
powercfg /query SCHEME_CURRENT SUB_VIDEO VIDEOIDLE
```

From inside the participant session:

```
reg query "HKCU\Control Panel\Desktop" /v ScreenSaveActive
reg query "HKCU\Control Panel\Desktop" /v ScreenSaveTimeOut
```

Then sign in as the kiosk account, touch nothing for ten minutes. Afterwards:

```
wevtutil qe Security /q:"*[System[(EventID=4800)]]" /c:3 /rd:true /f:text
type C:\APM\PK\logs\idle-restart.log
```

A 4800 with no log entry means the task did not fire: check the XPath in the registered task against the account name. A log entry with no restart means `shutdown` failed, and the log records the retry.
