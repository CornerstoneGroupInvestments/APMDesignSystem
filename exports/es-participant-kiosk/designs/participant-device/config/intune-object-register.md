# Participant Kiosk - Intune and Entra object register

Cross-check list. Every object this build creates, changes or excludes. Source: `content-technical.txt` (TCD V1.2), section 4.6 build sequence and section 12.

Assignment targets:
`A` = `sg-dyn-dvc-cdg-participant-kiosk-autopilot` · `K` = `sg-dyn-dvc-cdg-participant-kiosk` · `R1` = `sg-stc-dvc-cdg-participant-kiosk-ring1`

---

## 1. Entra ID groups - 3 new

| # | Name | Type | Membership |
|---|---|---|---|
| 1 | `sg-dyn-dvc-cdg-participant-kiosk-autopilot` | Device, dynamic | `device.devicePhysicalIds -any (_ -eq "[OrderID]:PARTICIPANT")` |
| 2 | `sg-dyn-dvc-cdg-participant-kiosk` | Device, dynamic | Device name starts with `APM-PK-` |
| 3 | `sg-stc-dvc-cdg-participant-kiosk-ring1` | Device, assigned | ~10 devices: staging lab plus 1-2 low-traffic sites |

## 2. Conditional Access - 1 new

| # | Name | State at build | State at Phase 9 |
|---|---|---|---|
| 4 | `CA-107 - All Users & Guests - All Apps - Participant Kiosk Devices - Block` | Report-only | On |

Targets by device filter, not group. No existing CA policy is modified or excluded.

## 3. Enrolment - 2 new

| # | Name | Object | Assign |
|---|---|---|---|
| 5 | `CDG-W11-CFG-Autopilot Self-Deploying-P-1.0` | Autopilot deployment profile, Self-Deploying, Entra joined | A |
| 6 | `CDG-W11-CFG-Kiosk ESP-P-1.0` | Enrollment Status Page | A |

Set **Block device use until required apps are installed** and name LibreOffice, Zscaler Client Connector and TeamViewer. This is the mechanism that guarantees the applications land before the Assigned Access configuration applies; without it the allow-list and Start pins resolve against paths that do not yet exist.

Plus: hardware hashes imported with Group Tag `PARTICIPANT` (CompNow CSV or Dell OEM direct).

The Autopilot profile's device name template carries the per-device identifier (`APM-PK-` prefix, which is also what the dynamic group in section 1 keys on). That is where the serial belongs. The session account name does not need to carry it, which is what removes the argument for a per-device account.

## 4. Compliance - 1 new

| # | Name | Object | Assign |
|---|---|---|---|
| 7 | `CDG-W11-COM-Participant Kiosk-P-1.0` | Compliance policy, Windows 10 and later, Templates | K |

## 5. Device configuration profiles - 13 new

| # | Name | Type | Assign | Source file |
|---|---|---|---|---|
| 8 | ~~`CDG-W11-CFG-Assigned Access XML-P-1.0`~~ **NOT BUILT** | Custom, OMA-URI `./Vendor/MSFT/AssignedAccess/Configuration` | - | `AssignedAccess-ParticipantKiosk.xml` (reference copy) |
| 9 | `CDG-W11-SEC-Logon Lockdown-P-1.0` | Settings catalog, Allow log on locally | K | - |
| 10 | **[unnamed in TCD]** Delete user profiles older than 0 days on system restart | Settings catalog, Windows Components > User Profiles | K | - |
| 11 | `CDG-W11-SEC-Edge Hardening-P-1.0` | Settings catalog, Microsoft Edge | K | `managed-favorites.json` |
| 12 | `CDG-W11-SEC-USB Exception-P-1.0` | Settings catalog | K | - |
| 13 | `CDG-W11-SEC-Bitlocker Exception-P-1.0` | Settings catalog, higher priority than the estate baseline | K | - |
| 14 | `CDG-W11-SEC-LAPS-P-1.0` | Endpoint protection template, or Settings catalog category LAPS | K | - |
| 15 | **[unnamed in TCD]** Wallpaper | Custom, OMA-URI `./Vendor/MSFT/Personalization/DesktopImageUrl`, String | K | - |
| 16 | **[unnamed in TCD]** LibreOffice locked configuration | ADMX / Settings catalog (DDD 4.3.6.2) | K | - |
| 17 | `CDG-W11-CFG-Restart Notification-P-1.0` | Settings catalog, Windows Update for Business | K | - |
| 18 | `CDG-W11-CFG-Delivery Optimization-P-1.0` | Delivery Optimization template | K | - |
| 19 | **[unnamed in TCD]** Trusted certificate | Templates > Trusted certificate, root/issuing CA for EAP-TLS | K | - |
| 20 | **[unnamed in TCD]** Device certificate | Templates > SCEP certificate (or PKCS - confirm with network/PKI team) | K | - |
| 21 | **[unnamed in TCD]** Wi-Fi | Templates > Wi-Fi, SSID `APM-KIOSK`, WPA2/WPA3-Enterprise, EAP-TLS | K | - |

**Count:** items 9-18 are 10 profiles; items 19-21 (Phase 4 certificate and Wi-Fi profiles) make **13**. TCD 2.2 states "11 device configuration profiles" and needs correcting.

Item 8 is not built. **DR-021 is decided in favour of the remediation (item 22) owning the Assigned Access CSP node**, because the session account name is per device and only an on-device script can substitute it. A custom OMA-URI profile sends one identical payload to every device and performs no token substitution.

## 6. Remediations - 1 new pair

| # | Name | Detection / remediation | Assign | Schedule |
|---|---|---|---|---|
| 22 | `CDG-W11-REM-Kiosk Session Account-P-1.0` | `Detect-KioskSessionAccount.ps1` / `Remediate-KioskSessionAccount.ps1` | K | Daily + first enrolment check-in |

**This object owns `./Vendor/MSFT/AssignedAccess/Configuration`** (DR-021). It creates the per-device account `Kiosk-<SERIAL>`, sets automatic logon with the password held only in the Winlogon LSA secret, and renders and applies the Assigned Access configuration naming that account. SYSTEM context, signature check on, 64-bit.

It exits 1, not 0, when it finds a logon banner, `PreferredAadTenantDomainName` or a device password policy. Each disables automatic logon, none can be cleared by a script, and each needs an assignment exclusion (items 41a and 41b, plus the SOE-07 variation).

## 7. Applications (Win32) - 6 new

| # | Name | Package contents | Assign |
|---|---|---|---|
| 23 | `CDG-W11-REM-Idle Restart-P-1.0` | `Install-KioskIdleWatchdog.ps1` + `Watch-KioskIdle.ps1` | K, Required |
| 24 | `CDG-W11-REM-Profile Purge-P-1.0` | `Install-KioskSessionPurge.ps1` + `Invoke-KioskSessionPurge.ps1` | K, Required |
| 25 | `CDG-W11-CFG-Wallpaper-P-1.0` | `Install-KioskWallpaper.ps1` + `wallpaper-participant-v5.1.png` | K, Required |
| 26 | `CDG-W11-APPC-LibreOffice-P-1.0` | LibreOffice Fresh MSI, published by Patch My PC | K, Required |
| 27 | **[unnamed in TCD]** Zscaler Client Connector | Local breakout configuration (11.5) | K, Required |
| 28 | **[unnamed in TCD]** TeamViewer | Pinned major version | K, Required |

## 8. App Control for Business - 2 new, 1 escrow

| # | Name | Mode | Delivery | Assign |
|---|---|---|---|---|
| 29 | `CDG-W11-SEC-AppControl Audit-T-1.0` | Audit | Endpoint security > App Control for Business, unsigned XML | R1 |
| 30 | `CDG-W11-SEC-AppControl Enforced-P-1.0` | Enforced, script enforcement on | Custom OMA-URI `./Vendor/MSFT/ApplicationControl/Policies/{PolicyGUID}/Policy`, Base64 (file), signed | K, Phase 9 only |
| 31 | Rollback policy, version 1.0.0.1 | Audit | Signed `.cip`, not deployed | Escrow with the certificate |

Policy identity `CDG-W11-PK-1.0`. Six trusted publishers: Microsoft, The Document Foundation, Zscaler Inc., TeamViewer, Dell, Patch My PC LLC.

## 9. Windows Autopatch - registration, no new policy

| # | Action | Target |
|---|---|---|
| 32 | Nest `sg-dyn-dvc-cdg-participant-kiosk` in the Windows Autopatch Device Registration group | K |
| 33 | Autopatch Groups: Test ring | R1 |
| 34 | Autopatch Groups: Broad ring | A (minus Test) |

First and Fast rings: no group assigned.

## 10. Exclusions from estate objects - 8

| # | Estate object | Mechanism | Exclude |
|---|---|---|---|
| 35 | Corporate Wi-Fi, VPN and certificate profiles (all except EAP-TLS) | Assignment exclusion | K |
| 36 | `AllUsers_AllAccess_DeviceRequired`, `AllUsers_AllAccess_MFAorDeviceRequired` | **No exclusion added** - CA-107 block precedence | - |
| 37 | Corporate Edge configuration profile(s), user-scoped | Assignment exclusion | K |
| 38 | Corporate PowerShell platform scripts and remediations | Assignment exclusion | K |
| 39 | `Staff-Windows-Compliance-Policy` | Assignment exclusion | K |
| 40 | `APM-WIN-SEC-ACfB Audit Baseline-P-1.0`, `APM-WIN-SEC-ACfB Enforced Baseline-P-1.0` | Assignment exclusion | K |
| 41 | `APM-WIN-SEC-USB Baseline-P-1.0` | Assignment exclusion | K |
| 41a | Any profile setting `PreferredAadTenantDomainName` | Assignment exclusion | K |
| 41b | Corporate password / DeviceLock policy settings | Assignment exclusion | K |
| 41c | Logon banner policy (`LegalNoticeCaption` / `LegalNoticeText`) | Assignment exclusion | K |
| 42 | `APM-W11-SEC-Bitlocker-P-1.1`, removable-drive settings only | **Not an exclusion** - higher-priority conflicting profile (item 13) | K |
| 43 | Corporate device-management applications / Company Portal | Assignment exclusion | K |

Estate object names are per the current Intune admin centre exports and the tenant compliance worksheet. Confirm each against the tenant before adding an exclusion.

**Items 41a to 41c all exist for one reason: each one disables automatic logon on its own.** A kiosk that cannot sign itself in presents as a device sitting at the sign-in screen with nothing in any log to explain it. `PreferredAadTenantDomainName` is named by Microsoft as preventing automatic sign-in; a device password policy disables it by design, and hardened-baseline vendors ship a separate "without DeviceLock" build for exactly this; 41c additionally needs a variation against the SOE hardening standard (SOE-07), because the logon banner is an ASD ISM control. The detection script in item 22 reports all three by name. A documented exclusion set against the SOE Hardening Standard is needed, not exclusions discovered one failure at a time. See `assigned-access-schema-review.md`.

**Open, and it has no clean answer yet: `CDG-W11-SEC-Logon Lockdown-P-1.0` cannot enumerate a per-device account name.** Its Allow log on locally allow-list is a single static policy value, and every device's session account is named differently. Three options, none yet decided: name the built-in `Users` group instead (the session account is its only member on a kiosk), have the remediation set the user right per device with `LsaAddAccountRights`, or drop the allow-list and rely on Deny log on locally for the accounts that must be blocked. Decision owner: APM Cyber Security.

## 11. Outside Intune

| # | Object | Owner |
|---|---|---|
| 44 | Meraki SSID `APM-KIOSK`, hidden, WPA2/WPA3-Enterprise 802.1X/EAP-TLS, no PSK | Network team / Stratus |
| 45 | Meraki firewall, default outbound deny for VLAN 73, explicit allows per 6.1.6 | Network team / Stratus |
| 46 | Meraki traffic shaping, 20 Mbps per SSID | Network team / Stratus |
| 47 | Wireless client isolation OFF, TCP 7680 permitted intra-VLAN `10.73.0.0/16` | Network team / Stratus |
| 48 | Zscaler tenant configuration | Network team / Stratus |
| 49 | APM code-signing certificate (SOE-02) | APM Cyber Security |

---

## Unnamed objects to resolve before build

Items 10, 15, 16, 19, 20, 21, 27 and 28 have no object name in the TCD. Seven of the eight are configuration profiles or applications that need a name under the `CDG-W11-<class>-<name>-<env>-<version>` convention before an engineer can build them without inventing one.

## Candidate additions from the Assigned Access review

Not yet approved. Full reasoning in `assigned-access-schema-review.md`.

| Object | Purpose | Owner |
|---|---|---|
| **Settings catalog, Power Management** - High Performance power plan; hard disk, sleep and display timeouts all 0, on battery and plugged in | A kiosk that sleeps looks broken to the participant standing at it. Listed in Microsoft's *Assigned Access recommendations* and shipped by hardened-baseline implementations. Nothing in the current object set prevents it | Digital Operations |
| Custom profile, OMA-URI `./Vendor/MSFT/AssignedAccess/StatusConfiguration`, value `OnWithAlerts` | Raises a critical MDM alert when Assigned Access fails to activate, carrying status code 2 (AppNotFound) or 3 (ActivationFailed). Without it a kiosk that never enters its restricted session is invisible until someone visits the site | Digital Transformation and Architecture |
| Keyboard Filter | Alt+F4, Alt+Tab, Alt+Shift+Tab and Ctrl+Alt+Del are not blocked for any restricted-experience account | APM Cyber Security |
| Settings catalog, `AboveLock/AllowToasts` = 0 | Stops notifications appearing on the lock screen of a public device | Digital Operations |
| Policy to suppress default taskbar pins (Widgets, Chat, Search, Task View) | Taskbar pinning is not supported in a restricted user experience, so a shown taskbar carries the Windows 11 defaults | Digital Transformation and Architecture |
