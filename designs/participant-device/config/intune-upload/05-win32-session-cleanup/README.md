# 05 - Win32 app: Participant session data cleanup

**Batch, not PowerShell.** App Control script enforcement leaves no runnable PowerShell option in SYSTEM context on this fleet. The PowerShell versions are kept in `config/` as a record and are not deployed.

**Intune admin centre > Apps > Windows > Add > Windows app (Win32)**

Name: `CDG-W11-REM-Session Cleanup-P-1.0`

| Field | Value |
|---|---|
| Install command | `Install-KioskSessionCleanup.bat` |
| Uninstall command | `Install-KioskSessionCleanup.bat UNINSTALL` |
| Install behaviour | System |
| Assignment | `sg-dyn-dvc-cdg-participant-kiosk` |

**Detection rule: registry, not file, and not a script.** A detection script has to be PowerShell, which is the thing this pack exists to avoid.

| Field | Value |
|---|---|
| Rule type | Registry |
| Key path | `HKEY_LOCAL_MACHINE\SOFTWARE\APM\ParticipantKiosk` |
| Value name | `SessionCleanupVersion` |
| Detection method | String comparison, equals `1.0` |

The installer writes that value **only after all three tasks have verified**, and deletes it if any failed. So a device where task registration failed reports not-detected and Intune retries, instead of showing green with no cleanup running. A file-exists rule on the payload would report installed on exactly that broken device, which is the defect three other kiosk installers in this design carry.

## Three tasks

| Task | Trigger | Role |
|---|---|---|
| `APM-PK-CleanStartup` | at boot | Authoritative. Also takes what the logoff pass could not, and reasserts autologon before the first logon attempt of the boot |
| `APM-PK-CleanLogon` | kiosk account logon | Authoritative |
| `APM-PK-CleanLogoff` | Security event 4634 or 4647 | Best effort. A closing application still holds files open |

Three rather than two because `schtasks` on the command line takes one schedule per task, and generating task XML from batch means escaping every angle bracket. The logoff trigger uses `/sc ONEVENT /ec Security /mo` with an XPath query, which needs no XML file.

The logoff query is not filtered to the kiosk account. The payload resolves the kiosk account itself and only cleans that profile, so firing on an administrator logoff is harmless and usefully reasserts autologon after a support visit.

All three run as SYSTEM, which is exempt from AppLocker and from the RestrictRun list Assigned Access writes into the kiosk hive, so nothing needs adding to `AllowedApps`.

## Running it by hand

```
Clear-KioskSessionData.bat Logon
Clear-KioskSessionData.bat Logon DRYRUN
Clear-KioskSessionData.bat Logoff
Clear-KioskSessionData.bat Startup
```

`DRYRUN` reports every location it would touch and removes nothing.

## Signing and language mode: measured, and it constrains all four device scripts

**Measured on the pilot device, 25 August 2026.** A scheduled task running as SYSTEM gets a `powershell.exe` host in **ConstrainedLanguage**. An interactive administrator console on the same device gets **FullLanguage**.

That difference is the whole problem. A script carrying a valid Authenticode signature is evaluated as FullLanguage, and PowerShell refuses to load a FullLanguage script into a Constrained host:

```
Cannot dot-source this command because it was defined in a different language mode.
```

So the same signed script runs correctly when a support engineer runs it by hand and fails when the task runs it. Signing the script is what breaks it, and testing it interactively cannot reveal that.

### What to do

**All three PowerShell files in this pack must be unsigned, not just one.** Every one of them runs in SYSTEM context, launched either by Task Scheduler or by the Intune Management Extension, and both give a ConstrainedLanguage host.

| File | Launched by | Host mode | Sign it? |
|---|---|---|---|
| `Clear-KioskSessionData.ps1` | Task Scheduler, as SYSTEM | Constrained | No |
| `Install-KioskSessionCleanup.ps1` | Intune Management Extension, Win32 app install | Constrained | No |
| `Detect-KioskSessionCleanup.ps1` | Intune Management Extension, detection | Constrained | No |
| `Set-KioskTimeAuto.bat` | either | not applicable | Not needed. App Control script enforcement does not cover `.bat` or `.cmd` |

Signing any of the three makes it FullLanguage and it then fails to load. All three are written CLM-safe, so unsigned they match the host and run.

**Until the App Control policy grants the SYSTEM host FullLanguage, signing these scripts is a net negative.** It adds no protection the ACL does not already provide and it stops them running. That is a statement about this device configuration, not about signing in general.

Re-run the installer with `-SkipSignatureCheck` from the folder holding the unsigned copies.

Write access to `C:\APM\PK\Clear-KioskSessionData.ps1` is restricted to SYSTEM and Administrators by the installer, so the SYSTEM code-execution exposure is bounded by the ACL rather than by the signature. That is not the SOE-02 position and it needs recording as an accepted deviation until the item below is resolved.

**The proper fix is an App Control policy change, not a script change.** The task host has to be FullLanguage for a signed script to load, and that is determined by `CDG-W11-PK-1.0`, not by anything in this pack. Owner: APM Cyber Security. It is the same dependency as the D-7 allowed-signer gate.

### This affects the other three device scripts

`CDG-W11-REM-Idle Restart-P-1.0` and `CDG-W11-CFG-Wallpaper-P-1.0` install a payload and register a scheduled task, so both are on the same collision course as this pack was and both will pass a manual interactive test first. Test every one of them **through its task**, never by running it by hand.

**`CDG-W11-REM-Kiosk Session Account-P-1.0` is the exception, and it is confirmed working.** Signed, run by the Intune remediation agent, it succeeds. The remediation agent therefore provides a FullLanguage host, unlike Task Scheduler. That narrows the fault to Task Scheduler specifically rather than to SYSTEM context generally, and it means the remediation pair needs no rewrite.

It also means the two remaining installers have a second option besides a batch rewrite: move their scheduled-task work into an Intune remediation, which is a host that demonstrably runs signed PowerShell. Worth weighing against the batch route, because a remediation reports per-device success in the console and a scheduled task does not.

Confirm the host's mode on any device before drawing conclusions:

```powershell
@'
powershell.exe -NoProfile -Command "$ExecutionContext.SessionState.LanguageMode | Out-File C:\APM\PK\logs\langmode.txt -Encoding ascii"
'@ | Set-Content C:\APM\PK\probe.bat -Encoding ascii
schtasks /create /tn APM-PK-LangProbe /ru SYSTEM /rl HIGHEST /sc ONCE /st 00:00 /f /tr "C:\APM\PK\probe.bat"
schtasks /run /tn APM-PK-LangProbe
```

The command goes in a `.bat` because a `/tr` string has to survive both PowerShell and cmd quoting, and `$ExecutionContext` is expanded by PowerShell before schtasks ever sees it. A `.bat` also needs no signing: App Control script enforcement covers PowerShell, VBScript, JScript, HTA and MSI, not `.bat` or `.cmd`.

## What it clears

Every location a participant can reach that may hold personal information: Downloads, Desktop, Documents, Pictures, Videos, Music, Public equivalents, the LibreOffice user profile (which holds the recent-documents list and real document copies under `\backup`), Edge user data, Recent items and both jump-list stores, the thumbnail and icon caches, profile Temp, clipboard history, the notification database, the Explorer MRU registry keys, the print spool, Windows Temp, and the Recycle Bin for the kiosk SID.

It does **not** touch removable drives, and it does **not** delete the kiosk profile.

## Two tasks

| Task | Trigger | Role |
|---|---|---|
| `APM-PK-CleanLogon` | kiosk account logon | Authoritative. Profile loaded, nothing locked, everything on the list can be removed |
| `APM-PK-CleanLogoff` | Security event 4634 or 4647 for the kiosk account | Best effort. A closing application still holds files open |

Both run as SYSTEM, which is exempt from AppLocker and from the RestrictRun list Assigned Access writes into the kiosk hive. Nothing needs adding to `AllowedApps`.

## The logoff task has a dependency that fails silently

Its event trigger only fires if logoff auditing is enabled. Without it the task registers, reports no error, and never runs. The installer checks and warns. To enable:

```
auditpol /set /subcategory:"Logoff" /success:enable
```

Check whether the SOE hardening standard already sets this before changing it locally, because a local `auditpol` change is overwritten at the next policy refresh.

## Overlap to resolve before deployment

`Invoke-KioskSessionPurge.ps1` clears Public Downloads, Windows Temp and the print spool as its steps 2 to 4, and this script covers all three. Once this is deployed those steps should come out of the purge, so one file owns each location. The purge then owns only the profile delete and the autologon reassertion.

Worth deciding at the same time whether the profile delete is still wanted at all. It destroys Edge's per-user registration and the Start layout cache on every restart, which is a known cause of Start pins failing to appear (see `../../research-edge-start-pin.md`). This cleaner removes participant data without that side effect.

## Two things the design document needs to state

**Logging records no file names.** A log listing what was deleted from a participant's Downloads folder is itself a personal-information disclosure, and it would outlive the file it names. The log records directory paths, counts and outcomes only, and is pruned at 30 days. Never add a file name to it.

**Deletion is not sanitisation.** On a BitLocker-encrypted volume with TRIM active, an overwrite pass cannot be guaranteed to reach the original blocks and is not attempted. At-rest protection comes from full-volume encryption; this removes the data from the live file system so the next participant cannot reach it. If the RFFR position requires sanitisation rather than deletion, that is a different control and needs a decision.

## Open

The Windows Search index retains file names indexed from Documents and Downloads. Not cleared here, and it needs a decision: either disable indexing of those locations for the kiosk profile, or accept it and record why.
