# Participant Kiosk - Intune upload pack

Every script and configuration file the Participant Kiosk build requires, in the order they are deployed. Folder names match the Build Sequence phases in the Technical Configuration Document, 4.6.

## Before uploading anything: sign every .ps1

All six PowerShell files must be signed with the APM code-signing certificate (dependency SOE-02) **before** upload or packaging. The fleet runs a signed-scripts-only execution policy, so an unsigned script does not execute, and two of the installers below refuse to register anything if their payload script is unsigned.

```powershell
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -like '*APM*' }
Get-ChildItem -Path . -Recurse -Filter *.ps1 | ForEach-Object {
    Set-AuthenticodeSignature -FilePath $_.FullName -Certificate $cert -TimestampServer 'http://timestamp.digicert.com'
}
```

Verify before packaging: `Get-ChildItem -Recurse -Filter *.ps1 | Get-AuthenticodeSignature | Format-Table Path, Status`. Every row must read `Valid`.

---

## 01 - Remediation: Kiosk session account

**Intune admin centre > Devices > Scripts and remediations > Remediations > Create script package**

Name: `CDG-W11-REM-Kiosk Session Account-P-1.0`

| Field | Value |
|---|---|
| Detection script | `Detect-KioskSessionAccount.ps1` |
| Remediation script | `Remediate-KioskSessionAccount.ps1` |
| Run using logged-on credentials | No (SYSTEM) |
| Enforce script signature check | Yes |
| Run in 64-bit PowerShell | Yes |
| Assignment | `sg-dyn-dvc-cdg-participant-kiosk` |
| Schedule | Daily, plus first check-in after enrolment |

**This object owns `./Vendor/MSFT/AssignedAccess/Configuration`.** The session account name is per device (`Kiosk-<SERIAL>`), and a custom OMA-URI profile sends one identical payload to every device with no token substitution, so only an on-device script can produce it. Pack 02 is reference material only.

Sign both scripts with the APM code-signing certificate before upload (SOE-02). Signature enforcement is on. Run the remediation by hand once on a reference device first: see that pack's README.

**Intune admin centre > Devices > Scripts and remediations > Remediations > Create**

Name: `CDG-W11-REM-Kiosk Session Account-P-1.0`

| Field | Value |
|---|---|
| Detection script file | `Detect-KioskSessionAccount.ps1` |
| Remediation script file | `Remediate-KioskSessionAccount.ps1` |
| Run this script using the logged-on credentials | No |
| Enforce script signature check | Yes |
| Run this script in 64-bit PowerShell | Yes |
| Schedule | Daily, plus at enrolment |
| Assignment | `sg-dyn-dvc-cdg-participant-kiosk` |

Creates the local session account `Kiosk-<SERIAL>`, sets automatic logon with the credential held only in the Winlogon LSA secret, and applies the Assigned Access configuration with that account name substituted.

## 02 - Assigned Access XML - REFERENCE ONLY, DO NOT UPLOAD

**No Intune object is created from this folder.** `CDG-W11-CFG-Assigned Access XML-P-1.0` is not built.

The session account name is per device, so a single uploaded payload cannot serve the fleet. `AssignedAccess-ParticipantKiosk.xml` is the **canonical copy** of the configuration, carrying `[SERIAL]` as the substitution point. The remediation in pack 01 renders it per device and applies it through the WMI bridge.

The here-string inside `Remediate-KioskSessionAccount.ps1` must stay structurally identical to this file. After editing either one, run `../check-assigned-access.js`: the two copies have drifted apart once already, with different namespace prefixes on the same element.

> **Never upload this file as-is.** A literal `[SERIAL]` resolves to no account, and Assigned Access fails the whole configuration when the named account does not exist. If a configuration profile writing this OMA-URI already exists, delete it: the node supports Delete, so removing the profile clears Assigned Access from every device that held it, after which the remediation's detection reports non-compliant and re-applies.

**No Intune object is created from this folder.** `CDG-W11-CFG-Assigned Access XML-P-1.0` is not built.

DR-021 is decided: the session account name is per device (`Kiosk-[SERIAL]`), and a custom OMA-URI profile sends one identical payload to every device with no token substitution. Only the remediation in 01 can produce a per-device name, so **the remediation owns `./Vendor/MSFT/AssignedAccess/Configuration`** and applies its own rendered copy through the WMI bridge.

`AssignedAccess-ParticipantKiosk.xml` remains the **canonical copy** of the configuration. The here-string inside `Remediate-KioskSessionAccount.ps1` must match it. After editing either one, run `check-assigned-access.js` (see `../assigned-access-schema-review.md`): the two copies have drifted apart once already, with different namespace prefixes on the same element.

> **If `CDG-W11-CFG-Assigned Access XML-P-1.0` was already created, delete it before relying on 01.** The `Configuration` node supports Delete, so removing the profile wipes Assigned Access from every device that held it. The remediation's detection then reports non-compliant and re-applies, so it self-heals, but there is a window per device between the two.

## 03 - Win32 app: Idle watchdog

**Intune admin centre > Apps > Windows apps > Add > App type: Windows app (Win32)**

Package both files in one `.intunewin`: `IntuneWinAppUtil.exe -c .\03-win32-idle-watchdog -s Install-KioskIdleWatchdog.ps1 -o .\out`

Name: `CDG-W11-REM-Idle Restart-P-1.0`

| Field | Value |
|---|---|
| Install command | `powershell.exe -NoProfile -ExecutionPolicy AllSigned -File .\Install-KioskIdleWatchdog.ps1` |
| Uninstall command | `powershell.exe -NoProfile -ExecutionPolicy AllSigned -Command "Unregister-ScheduledTask -TaskName 'APM-PK-IdleWatchdog' -Confirm:$false; Remove-Item 'C:\APM\PK\Watch-KioskIdle.ps1' -Force"` |
| Install behaviour | System |
| Device restart behaviour | No specific action |
| Detection rule | Manually configure > File > Path `C:\APM\PK`, File `Watch-KioskIdle.ps1`, Detection method: File or folder exists |
| Assignment | Required, `sg-dyn-dvc-cdg-participant-kiosk` |

**Why a Win32 app and not a platform script:** the scheduled task launches the watchdog with `-ExecutionPolicy AllSigned`, so the watchdog itself must be a separately signed file. A platform script is a single file and cannot carry one. The installer verifies the watchdog's signature and exits 1 without registering the task if it is not valid.

## 04 - Win32 app: Session purge

**Intune admin centre > Apps > Windows apps > Add > App type: Windows app (Win32)**

Package both files in one `.intunewin`: `IntuneWinAppUtil.exe -c .\04-win32-session-purge -s Install-KioskSessionPurge.ps1 -o .\out`

Name: `CDG-W11-REM-Profile Purge-P-1.0`

| Field | Value |
|---|---|
| Install command | `powershell.exe -NoProfile -ExecutionPolicy AllSigned -File .\Install-KioskSessionPurge.ps1` |
| Uninstall command | `powershell.exe -NoProfile -ExecutionPolicy AllSigned -File .\Install-KioskSessionPurge.ps1 -Uninstall` |
| Install behaviour | System |
| Device restart behaviour | No specific action |
| Detection rule | Manually configure > File > Path `C:\APM\PK`, File `Invoke-KioskSessionPurge.ps1`, Detection method: File or folder exists |
| Assignment | Required, `sg-dyn-dvc-cdg-participant-kiosk` |

**Why a Win32 app and not a platform script:** the purge needs a shutdown pass and a startup pass. Task Scheduler has no shutdown trigger and an Intune platform script has no shutdown hook, so the installer registers the shutdown pass as a local Group Policy shutdown script (the only mechanism Windows waits for during shutdown) and the startup pass as a scheduled task.

Layer 3 of the purge is a separate Settings catalog profile, not part of this package: **Delete user profiles older than a specified number of days on system restart = 0**.

## 05 - Win32 app: Wallpaper

**Intune admin centre > Apps > Windows apps > Add > App type: Windows app (Win32)**

Package both files in one `.intunewin`: `IntuneWinAppUtil.exe -c .\05-win32-wallpaper -s Install-KioskWallpaper.ps1 -o .\out`

Name: `CDG-W11-CFG-Wallpaper-P-1.0`

| Field | Value |
|---|---|
| Install command | `powershell.exe -NoProfile -ExecutionPolicy AllSigned -File .\Install-KioskWallpaper.ps1` |
| Install behaviour | System |
| Detection rule | Manually configure > File > Path `C:\APM\PK`, File `wallpaper.png`, Detection method: File or folder exists |
| Assignment | Required, `sg-dyn-dvc-cdg-participant-kiosk` |

Then point the image at it: **Devices > Configuration profiles > Create > Windows 10 and later > Templates > Custom**, OMA-URI `./Vendor/MSFT/Personalization/DesktopImageUrl`, Data type String, value `C:\APM\PK\wallpaper.png`.

The wallpaper states files are deleted after 10 minutes of inactivity. The controls that make that true are 03 and 04. Do not deploy this ahead of them.

## 06 - Edge managed favourites

Not an upload: paste `managed-favorites.json` into a setting.

**Intune admin centre > Devices > Configuration profiles > `CDG-W11-SEC-Edge Hardening-P-1.0` > Settings catalog > Microsoft Edge > Managed favorites**

Paste the file contents as the value. Ten folders, 55 links, fixed and not participant-editable.

---

## 07 - App Control for Business (WDAC)

**Two files, neither uploaded as-is.** `AppControl-ParticipantKiosk-Base.xml` carries the rule option set, the deny rules and the policy identity; `Build-AppControlPolicy.ps1` scans the reference device for the six publisher allow rules, merges, applies the options in the order that matters, and emits the enforced, audit and rollback policies with their `.cip` binaries.

Publisher rules are keyed on the signing certificate of each binary as installed, so that half of the policy can only come from a device carrying the fleet application set at the versions the fleet will run. Everything independent of the scan is in the base XML.

Run it on a reference device that has completed Phases 5 and 6, elevated, 64-bit PowerShell. See `07-app-control/README.md` for the command, the outputs and the A.8.4 signer review. Full sequence in the Technical Configuration Document, Appendix A.8.

| Output | Deploys as |
|---|---|
| `CDG-W11-SEC-AppControl-Audit-T-1.0.xml` | Endpoint security > App Control for Business, unsigned, pilot ring `sg-stc-dvc-cdg-participant-kiosk-Autopatch-Test` |
| `{PolicyGUID}.cip` | Devices > Configuration profiles > Custom, OMA-URI `./Vendor/MSFT/ApplicationControl/Policies/{PolicyGUID}/Policy`, Data type Base64 (file), signed, `sg-dyn-dvc-cdg-participant-kiosk` after pilot validation |
| `CDG-W11-SEC-AppControl-Rollback-1.0.0.1.cip` | Not deployed. Held in escrow with the certificate before the enforced policy is assigned anywhere |
