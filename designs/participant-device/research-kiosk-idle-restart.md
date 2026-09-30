# Restarting a Participant Kiosk after inactivity: a reliable mechanism

Research note, 26 August 2026. Written after three builds of a polling watchdog failed on a reference device.

**The polling approach was built on a signal that does not report what it appears to report.** The fix is not another correction to the parser: it is to stop measuring idle time in a script at all and let Windows do it, which it already does correctly and for exactly this purpose.

---

## 1. `quser` idle time cannot be used for this

The watchdog read the IDLE TIME column from `quser`. That column is documented by practitioners as unreliable for an active session.

From a Microsoft forum thread on the same problem: <cite index="2-29">"The IdleTime value cannot be used to work out how long an active or connected session has been idle."</cite> The same thread records that <cite index="2-5,2-6,2-7">idle time keeps counting even after a session is reconnected and user activity resumes, that `Get-RDUserSession` returns the same incorrect value, and that only `query user` returns correct information</cite> - and the last of those is contradicted by wider testing.

A detailed write-up of an automated logoff built on it reports: <cite index="3-1">"In testing, it seems more like 'the time since any user last had a log on event.'"</cite> and that an Active user and a Disconnected user show <cite index="3-8">the same idle time</cite>. The author's conclusion for Windows 10 is blunt: <cite index="3-4,3-5,3-6">"you can't use only idle time to log off a user - as it will log off an active user... Yes, I got logged off as I was testing this theory."</cite> On Windows 11 the same author found it <cite index="3-2">"closer to the user's idle time"</cite>, which is an improvement and not a guarantee.

So the value the watchdog was parsing is not the participant's input idle time. The parsing bugs found and fixed in versions 2.2 and 2.3 were real bugs, and fixing them could not have made the mechanism correct.

## 2. Windows already detects input idle time, for this exact purpose

`Interactive logon: Machine inactivity limit`. Microsoft: <cite index="26-2,26-3">"Beginning with Windows Server 2012 and Windows 8, Windows detects user-input inactivity of a sign-in (logon) session by using the security policy setting Interactive logon: Machine inactivity limit. If the amount of inactive time exceeds the inactivity limit set by this policy, then the user's session locks by invoking the screen saver."</cite>

This is the same detection the abandoned `GetLastInputInfo` call was reaching for, implemented inside the OS, running in the session, needing no code of ours and no Add-Type. <cite index="23-5">The registry value is `InactivityTimeoutSecs` under `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System`, in seconds</cite>, and it is settable from the Intune settings catalogue as a security option.

## 3. The lock raises an event, and a task can trigger on it

<cite index="9-1,9-2">"If a workstation is locked manually by a user or automatically due to inactivity, event 4800 is generated. If a user returns and unlocks the workstation, event 4801 is triggered."</cite> Microsoft's own reference confirms 4800 carries `TargetUserName` and `SessionId` in its EventData, so a trigger can be filtered to one account.

That gives the whole mechanism:

| | |
|---|---|
| Idle detection | Windows, via `InactivityTimeoutSecs` |
| Signal | Security event 4800, filtered to the kiosk account |
| Action | `shutdown /r /f /t 0` from an event-triggered scheduled task as SYSTEM |

No polling. No `quser`. No idle arithmetic. No arming logic. No state files. Nothing runs except once, when the device is genuinely idle.

A Microsoft Q&A thread on this pattern is worth reading for one detail: the poster could not make a **logoff** work from an event-triggered task, but reports <cite index="14-5">"Works - But if mention cmd it works in Action: Start a Program: C:\Windows\System32\Shutdown.exe /r /f"</cite>. A restart from an event-triggered task is the path that works, and a restart is what this design needs anyway.

## 4. Three dependencies, each of which fails silently

**Audit "Other Logon/Logoff Events" must be enabled**, or 4800 is never written and the trigger never fires. The same Q&A thread names it as the prerequisite: <cite index="14-1">"Enable other logon/logoff events success failure this will enable log in security with event id 4800 for account lock schedule task."</cite>

```
auditpol /set /subcategory:"Other Logon/Logoff Events" /success:enable
```

This is the same class of dependency as the logoff auditing the session cleanup needed. Set it by policy, not on the device, or it is overwritten at the next refresh.

**The screen saver must be active in the participant's session.** Microsoft qualifies the inactivity limit with <cite index="26-3">"(screen saver should be active on the destination machine)"</cite> and points at <cite index="26-4">the user-scoped `Enable screen saver` policy</cite>. Corroborated: <cite index="21-12">"the timeout policy has no effect if 'Enable Screen Saver' is disabled"</cite>, and <cite index="22-1">"For the screen saver to run under policy, the timeout must be nonzero, Enable screen saver must not be disabled, and a valid screen-saver program must be selected."</cite>

Those values are per user, in `HKCU\Control Panel\Desktop`, so **no Intune user-scoped policy can reach the local kiosk account.** `Clear-KioskUserLogon.bat` already runs in the participant's own hive at logon, which is where they now get written. That script is earning its place for the third time.

**The screen saver timeout must not be shorter than the inactivity limit.** <cite index="20-1">"if the Machine inactivity limit is defined in the local security policy or GPO, and a screen saver is enabled, the shorter of the two will be in effect."</cite> Set both to the same value.

## 5. A fourth interaction, and it is the one that would look like a fault

Microsoft's note on the inactivity limit: <cite index="27-3">"If the Interactive logon: Machine inactivity limit security policy setting is configured, the device locks not only when inactive time exceeds the inactivity limit, but also when the screensaver activates or when the display turns off because of power settings."</cite>

**So a display-off timer shorter than ten minutes restarts the kiosk early**, and it would present as a device that restarts at unpredictable intervals. The power management profile already recommended for this fleet sets display, sleep and hard-disk timeouts to 0, which removes it. That object stops being a nicety and becomes a prerequisite for this one.

## 6. What the participant experiences, stated plainly

The session locks at the inactivity limit and the device restarts immediately afterwards.

**The lock is not recoverable by the participant** - the session account's credential is held only in the LSA secret and no person knows it - so the restart is not a convenience, it is the recovery path. It must be immediate rather than delayed behind a countdown nobody can act on.

**There is no warning.** A participant who reads the screen for ten minutes without touching the mouse loses unsaved work with no prompt. That is a deliberate trade and it is exactly what the wallpaper already tells them: data is deleted after 10 minutes of inactivity. It is worth stating in the design rather than discovering in a support call.

One property of this order is better than the old design: the screen **locks first**, so participant data is off-screen at the ten-minute mark, and the restart then purges it. The polling watchdog left the desktop visible through its 60-second countdown.

## 7. What this replaces

| Retired | Reason |
|---|---|
| `Watch-KioskIdle.bat` | Read a value that does not report session input idle time |
| `Watch-KioskIdle.ps1` | `Add-Type` P/Invoke, blocked in Constrained Language Mode |
| `APM-PK-IdleWatchdog` task, every minute | Replaced by one event-triggered task that runs only when needed |
| The arming logic, state file, debug flag and idle-time parser | All existed to compensate for the wrong signal |

## 8. Objects

| Object | Type | Purpose |
|---|---|---|
| `CDG-W11-SEC-Inactivity Limit-P-1.0` | Settings catalog, Local Policies Security Options | `Interactive logon: Machine inactivity limit` = 600 |
| `CDG-W11-SEC-Audit Logon Events-P-1.0` | Settings catalog, Audit policy | Audit Other Logon/Logoff Events = Success. Without it 4800 is never written |
| `CDG-W11-CFG-Power Management-P-1.0` | Settings catalog, Power | Display, sleep and disk timeouts 0. Now a prerequisite, not an improvement |
| `CDG-W11-REM-Idle Restart-P-2.0` | Win32 app | Registers the event-triggered task. Supersedes the polling watchdog |
| `CDG-W11-REM-Session Cleanup-P-1.0` | Existing Win32 app | Its user logon script writes the per-user screen saver values |

## 9. Verification

```
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v InactivityTimeoutSecs
auditpol /get /subcategory:"Other Logon/Logoff Events"
schtasks /query /tn APM-PK-IdleRestart /fo LIST /v
powercfg /query SCHEME_CURRENT SUB_VIDEO VIDEOIDLE
```

And from inside the participant session:

```
reg query "HKCU\Control Panel\Desktop" /v ScreenSaveActive
reg query "HKCU\Control Panel\Desktop" /v ScreenSaveTimeOut
```

Then sign in as the kiosk account, touch nothing for ten minutes, and confirm a 4800 in the Security log followed by a restart. `Test-KioskIdleRestart.bat` reads all of the above and reports which dependency is missing.

## 10. If the lock does not happen

Reviewed a Microsoft Q&A thread describing an identical setup: public library computers, autologon to a standard account, a restart wanted after 10 to 15 minutes idle. Two things in it are worth carrying, and one thing in it should not be.

**The question author reports that `GetLastInputInfo` "does not work at all if auto login is being used".** The conclusion is right and the reason given is not. `GetLastInputInfo` reports input for the **calling session**. A scheduled task running as SYSTEM sits in session 0, which has no interactive input, so it returns a value that has nothing to do with the participant. It works correctly when called *inside* the session, which is why the original PowerShell watchdog had to run there, and why Constrained Language Mode then made it impossible. Autologon is incidental.

**The accepted answer's script is broken and should not be copied.** It captures `[System.Environment]::TickCount` once, before the loop, and never updates it, so it restarts the machine after fifteen minutes regardless of activity. `TickCount` is uptime, not input time. The thread's other suggestion, a Task Scheduler idle trigger, is worth knowing about and not worth using here: Task Scheduler's idle definition requires low CPU and disk activity as well as no input, so a kiosk playing a video in Edge would never satisfy it.

### The first thing to check

The inactivity limit has a documented prerequisite: the screen saver must be active in the session. Those values are per user and are written by `Clear-KioskUserLogon.bat`, which only carries them from **pack 05 version 1.8**. A device running the idle-restart app with an older cleanup package has no screen saver configured in the participant session, and the limit has nothing to invoke.

Confirm inside the participant session before concluding anything about the mechanism:

```
reg query "HKCU\Control Panel\Desktop" /v ScreenSaveActive
reg query "HKCU\Control Panel\Desktop" /v ScreenSaveTimeOut
reg query "HKCU\Control Panel\Desktop" /v SCRNSAVE.EXE
```

### The fallback, and it reverses earlier advice in this note

Microsoft's note on the inactivity limit lists three things that lock the device: inactivity exceeding the limit, the screen saver activating, **and the display turning off because of power settings**.

Section 5 treats the display-off timer as a hazard to be set to 0, because it would restart the kiosk early. That holds while the screen saver route works. If it does not, the same sentence makes the display timer the more reliable of the two: power management's idle detection is part of the OS, needs nothing written into a per-user hive, and does not depend on a screen saver being configured.

The fallback is therefore to set the AC display-off timeout to **600 seconds rather than 0** and let display-off produce the lock:

```
powercfg /change monitor-timeout-ac 10
powercfg /change standby-timeout-ac 0
```

Sleep stays at 0. A sleeping device does not restart, it sits asleep, and the participant sees a dead screen.

Only one of the two detectors should be armed at a time, or the shorter wins and ten minutes becomes unpredictable. Decide which is authoritative, set the other to 0, and record which one the design relies on.

### Test order

1. Confirm the screen saver values in the participant session, after pack 05 1.8 has landed.
2. Sign in as the kiosk account and touch nothing for ten minutes.
3. `wevtutil qe Security /q:"*[System[(EventID=4800)]]" /c:3 /rd:true /f:text`
4. A 4800 with no restart means the task did not fire: compare the XPath in the registered task against the account name.
5. No 4800 at all means the lock never happened: switch to the display-timer fallback above.

## 11. Ruled out

**Requiring Ctrl+Alt+Del at startup**, the workaround the library thread settled on, is not available here. Requirement 01 states the device powers on directly into the participant session with no interaction, and a participant who has to know to press a key sequence is a support call at every site.
