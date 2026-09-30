# designs/participant-device/config

Configuration this design defines, held as files rather than as prose so it can be run or imported directly. `intune-upload/` holds an upload-ready copy grouped one folder per Intune object, with `00-UPLOAD-GUIDE.md` giving the console path, every field and the assignment for each.

| File | What it is |
|---|---|
| `AssignedAccess-ParticipantKiosk.xml` | Multi-app Assigned Access configuration for `CDG-W11-CFG-Assigned Access XML-P-1.0`. Uploaded to OMA-URI `./Vendor/MSFT/AssignedAccess/Configuration`, Data type String (XML file). `[SERIAL]` in the Account element is the substitution point the session-account remediation fills per device |
| `Detect-KioskSessionAccount.ps1`<br>`Remediate-KioskSessionAccount.ps1` | Intune remediation pair `CDG-W11-REM-Kiosk Session Account-P-1.0`. Creates the local session account `Kiosk-<SERIAL>`, configures autologon with the credential held only in the Winlogon LSA secret, and renders + applies the Assigned Access XML per device via the WMI bridge. Decision DR-011 |
| `Install-KioskIdleWatchdog.ps1`<br>`Watch-KioskIdle.ps1` | Win32 app `CDG-W11-REM-Idle Restart-P-1.0`. The installer copies the watchdog to `C:\APM\PK\`, verifies its Authenticode signature, ACLs it read-only, and registers scheduled task `APM-PK-IdleWatchdog` in the interactive session |
| `Install-KioskSessionPurge.ps1`<br>`Invoke-KioskSessionPurge.ps1` | Win32 app `CDG-W11-REM-Profile Purge-P-1.0`. The installer registers the shutdown pass as a local Group Policy shutdown script and the startup pass as scheduled task `APM-PK-PurgeStartup` |
| `Install-KioskWallpaper.ps1`<br>`wallpaper-participant-v5.1.png` | Win32 app `CDG-W11-CFG-Wallpaper-P-1.0`. Stages the approved wallpaper to `C:\APM\PK\wallpaper.png` read-only, which the PersonalizationCSP profile points at. Artwork carries the retention line "deleted after 10 minutes of inactivity" |
| `managed-favorites.json` | Value for the **Managed favorites** setting of `CDG-W11-SEC-Edge Hardening-P-1.0`. Ten folders, 55 links, fixed and not participant-editable |
| `AppControl-ParticipantKiosk-Base.xml`<br>`Build-AppControlPolicy.ps1` | App Control for Business, `CDG-W11-SEC-AppControl Audit-T-1.0` and `CDG-W11-SEC-AppControl Enforced-P-1.0`. The base XML carries the rule option set, the deny rules and the policy identity; the script scans the reference device for the publisher allow rules, merges, applies the options in the order that matters, and emits the enforced, audit and rollback policies with their `.cip` binaries. Appendix A.8, TCD 12.1.3 |
| `Rename-ParticipantKiosk.ps1` | **Archived, not used by this design.** Held in `history/`. Would have appended a site code from the device's Entra ID location group; rejected (DR-018) because the location-group assignment step cannot be relied on to be done correctly and consistently by the device-prep partner at fleet scale. The device name carries no location component |
| `APMES0153_ES Site Desktop Wallpapers V5 CTA.pdf` | Source artwork as supplied; brand team to reissue with the amended line and Participant Kiosk title |

## Signing is a precondition, not a step

Every `.ps1` here is signed with the APM code-signing certificate (SOE-02) before upload or packaging. The fleet runs a signed-scripts-only execution policy, and both installers verify their payload script's signature and exit 1 without registering anything if it is not `Valid`.

## Two deployment mechanisms that are not interchangeable

**The idle watchdog is a Win32 app, not a platform script.** The scheduled task launches the watchdog with `-ExecutionPolicy AllSigned`, so the watchdog must be a separately signed file. A platform script is a single file and cannot carry one; a watchdog generated on the device cannot be signed, so it would never execute, and the ten-minute purge claimed on the participant wallpaper would not be met.

**The session purge is a Win32 app, not a platform script.** The purge needs a shutdown pass and a startup pass. An Intune platform script has no shutdown hook, and Task Scheduler has no shutdown trigger, so the shutdown pass is registered as a local Group Policy shutdown script (`psscripts.ini` plus a `gpt.ini` version bump naming the Scripts client-side extension) - the only mechanism Windows waits for during shutdown, with a default 600-second timeout.

## Kiosk session account remediation (Detect/Remediate-KioskSessionAccount.ps1)
**What it establishes on every device:** a local standard user `Kiosk-<SERIAL>` (BIOS serial, sanitised, 20-character SAM cap), password = 32 characters from a cryptographic RNG generated in memory, set on the account and written **only** to the Winlogon LSA `DefaultPassword` secret, then discarded; `PasswordExpires = False`; Winlogon `AutoAdminLogon` = 1 with no cleartext `DefaultPassword` registry value and `AutoLogonCount` removed; the multi-app Assigned Access configuration rendered with this account name and applied through `MDM_AssignedAccess`.

**Why named, why not AutoLogonAccount:** Security Operations need the endpoint identifiable by account name in Zscaler and Sentinel telemetry; the Windows-managed `AutoLogonAccount` cannot be named. The trade, stated in DR-011: the LSA secret is extractable with local administrator rights - which Windows LAPS gates and audits. With APM Cyber Security for confirmation.

**Deployment:** Intune Remediations, assigned to `sg-dyn-dvc-cdg-participant-kiosk`, run at enrolment and daily. Detection also fails a device where a cleartext `DefaultPassword` value exists, so drift toward the insecure form is self-reported. Re-running remediation rotates the credential; that is the on-demand rotation path.

## App Control denies nothing the build depends on

A WDAC deny rule applies in every context, including SYSTEM. `powershell.exe`, `cmd.exe`, `msiexec.exe` and `reg.exe` are deliberately absent from the deny list in `AppControl-ParticipantKiosk-Base.xml`: the session-account remediation, the idle watchdog, both purge passes and every Win32 install command run through them. Participants are kept out of them by Assigned Access, which offers no route to launch them, and UMCI enforcement places PowerShell in Constrained Language Mode on every device the enforced policy reaches. Adding any of the four to the deny list breaks the build without improving what T-03 tests.
