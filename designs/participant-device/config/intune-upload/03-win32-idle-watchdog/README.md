# 03 - Win32 app: Participant inactivity watchdog

**Batch, and a different design from the PowerShell version.** Not a translation: the old approach could not work on this fleet.

## Why it had to change

| Old | Problem |
|---|---|
| `Add-Type` P/Invoke to `GetLastInputInfo` | `Add-Type` is blocked in Constrained Language Mode, and the scheduled-task host is Constrained. Signing does not help: a signed FullLanguage script will not load into a Constrained host |
| Ran **in the participant session**, because `GetLastInputInfo` only returns a real value there | `powershell.exe` would have to be in the Assigned Access allowed-app list on a public kiosk |
| `System.Windows.Forms` full-screen warning | More `Add-Type`, more blocked types |

What replaces them:

| New | Why it works |
|---|---|
| `quser` reports the session's IDLE TIME | Runs as SYSTEM. No API call, no code in the participant session |
| Task runs as **SYSTEM** | Nothing added to `AllowedApps` |
| `shutdown /r /t 60 /c "..."` | Windows draws the countdown itself, and `shutdown /a` cancels it when input resumes |

## Package

```
Install-KioskIdleWatchdog.bat
Watch-KioskIdle.bat
```

```
IntuneWinAppUtil.exe -c <folder> -s Install-KioskIdleWatchdog.bat -o <output>
```

## Intune settings

Name: `CDG-W11-REM-Idle Restart-P-1.0`

| Field | Value |
|---|---|
| Install command | `Install-KioskIdleWatchdog.bat` |
| Uninstall command | `Install-KioskIdleWatchdog.bat UNINSTALL` |
| Install behaviour | System |
| Assignment | `sg-dyn-dvc-cdg-participant-kiosk` |

Detection rule, registry:

| Field | Value |
|---|---|
| Key path | `HKEY_LOCAL_MACHINE\SOFTWARE\APM\ParticipantKiosk` |
| Value name | `IdleWatchdogVersion` |
| Method | String comparison, Equals, `2.0` |
| Associated with a 32-bit app | No |

**Not a file-exists rule.** The installer copies the payload before it applies the ACL and registers the task, so a file rule reports installed on a device with no task and no lockdown. The marker is written only after the copy, the ACL, the task registration, the task verification and a `quser` presence check have all succeeded.

## Behaviour

| Idle | What happens |
|---|---|
| 0-1 min | Arms the watchdog for this session, if not already armed |
| under 9 min | Nothing. Cancels a pending restart if one exists |
| 9 min | `shutdown /r /t 60` with the participant warning, plus a `msg` prompt as a second signal |
| 10 min | Windows restarts the device |

**It arms only once it has seen the session in use**, and the arm flag carries the session's logon time. A device nobody has touched since boot will not restart, and it will not restart in a loop. A bare flag file would survive the restart and re-arm the next, untouched, session immediately.

**It only watches a `Kiosk-` account on an Active console session.** An administrator signed in for support does not get the device restarted underneath them, and a disconnected session is ignored.

Poll is every minute, not every 30 seconds: `schtasks` takes whole minutes on the command line, and the warning is drawn and cancelled by Windows rather than by the poll.

## Verify on device

```
Watch-KioskIdle.bat STATUS
type C:\APM\PK\logs\idle-watchdog.log
schtasks /query /tn APM-PK-IdleWatchdog /fo LIST /v
```

`STATUS` prints the session, its idle time as `quser` reports it, the converted minutes, the thresholds, and whether the watchdog is armed and whether a restart is pending. It changes nothing.

Test by signing in as the kiosk account, moving the mouse once, then leaving it alone for nine minutes.

## Two things to confirm on the reference device

1. **That the native shutdown warning is visible inside a restricted user experience.** It is a system notification, so it should be, but Assigned Access suppresses a good deal of shell UI and this has not been observed yet. If it is not visible, the `msg` prompt is the fallback and the design needs to say so.
2. **`msg.exe` is present.** It ships with Enterprise but the call is best-effort and its failure is ignored, so its absence would be silent.
