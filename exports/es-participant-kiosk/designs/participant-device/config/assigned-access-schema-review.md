# Assigned Access and session account remediation - three-pass adversarial review

Reviewed 19 August 2026 against Microsoft Learn. Three passes, each set up to break the artefact rather than confirm it. Fourteen defects found across the two objects, all corrected. One finding from Pass 1 was **wrong and is retracted by Pass 2**, which is recorded below rather than quietly dropped.

Sources: *Assigned Access XML Schema Definition (XSD)* · *Create an Assigned Access configuration file* · *Assigned Access recommendations* · *AssignedAccess CSP*.

Files: `AssignedAccess-ParticipantKiosk.xml` (canonical) · `Remediate-KioskSessionAccount.ps1` · `check-assigned-access.js` (new).

---

## DR-021 is decided: the remediation owns the CSP node

**Separate local users per device is a requirement (confirmed 19 August 2026), so the per-device account name stands.** A custom OMA-URI profile sends one identical payload to every device and performs no token substitution, so a per-device account name can only be produced on the device. **`CDG-W11-REM-Kiosk Session Account-P-1.0` owns `./Vendor/MSFT/AssignedAccess/Configuration`, and `CDG-W11-CFG-Assigned Access XML-P-1.0` is not built.**

The alternative examined in Passes 1 and 4 was `<AutoLogonAccount />`, where Assigned Access creates, credentials and signs in the account itself: no pre-staged account, no password anywhere, no device script. **It is ruled out by the per-device requirement**, because the account Windows creates is always named `kioskUser0` and the name is not configurable. Recorded here as an option considered and rejected.

What the per-device name costs, all of which is in scope and none of which is optional:

1. **`CDG-W11-CFG-Assigned Access XML-P-1.0` is not created.** Pack 02 becomes reference material, not a deployable object. The device configuration profile count drops from 14 to 13.
2. **If that profile was ever created and assigned, delete it before the remediation is relied on.** The CSP `Configuration` node supports Delete, so removing the profile issues a Delete against the node and wipes Assigned Access from every device that held it. The remediation's detection then reports non-compliant and re-applies, so it self-heals, but there is a window per device between the two. The detection script now also fails on a literal `[SERIAL]` in the applied configuration, which is the signature of a profile having overwritten the node.
3. **The XML exists in two places by necessity** - the canonical file, and the here-string in the remediation, because an Intune remediation is a single pasted script and cannot read a sibling file at runtime. They have already drifted apart once, with different namespace prefixes on the same element. `check-assigned-access.js` must be run after any edit to either.
4. **The credential pipeline stays**: a generated 32-character password, the Winlogon LSA secret, rotation on repair, DR-011, and DR-019's stated trade that a LAPS-gated local administrator could extract the secret.
5. **Three policy-delivered settings each disable automatic logon** and none can be cleared by a script (3.2, 3.3, Pass 4.3). All three need assignment exclusions, and the logon banner additionally needs an SOE-07 variation.
6. **`CDG-W11-SEC-Logon Lockdown-P-1.0` cannot express a per-device account name.** Its Allow log on locally allow-list is a single static policy value. Open, with three candidate answers and no decision: see Open below.
3. **The XML now exists in two places by necessity** (the canonical file, and the here-string in the script, because an Intune remediation is a single pasted script that cannot read a sibling file at runtime). They had already drifted: the file used `rs5:AllowedNamespace`, the script used `v3:AllowedNamespace`. `check-assigned-access.js` exists to stop that recurring and must be run after any edit to either file.

---

## Pass 1 - the CSP contract

Attacked the transport and the node itself: is this payload even shaped the way the CSP expects?

**1.1 Escaping is correct.** The CSP page states that XML encoding and CDATA both work, and that the CSP must receive the original unescaped XML. `SecurityElement::Escape` before writing `MDM_AssignedAccess.Configuration`, with `HtmlDecode` on read in the detection script, is the matching pair. The nested `<![CDATA[` inside `StartPins` survives escaping intact, which matches Microsoft's own escaped example showing `&lt;![CDATA[`. **No change.**

**1.2 `ParentID` and `InstanceID` are correct.** `./Vendor/MSFT` and `AssignedAccess`. **No change.**

**1.3 RETRACTED: `.\Kiosk-[SERIAL]` is fine.** Pass 1 flagged `.\` as undocumented, on the grounds that the CSP page's examples use a bare name and its KioskModeApp text says a local account's domain name should be the machine name. **Pass 2 disproved this.** *Create an Assigned Access configuration file* states plainly that a local account can be entered as `devicename\user`, `.\user`, or just `user`. The design's form is documented and is the right choice, because it does not depend on the computer name. **No change. This is recorded because a review that only reports confirmed hits hides its own error rate.**

**1.4 GAP: there is no runtime status monitoring.** The CSP exposes `Status` and `StatusConfiguration`. With `StatusConfiguration` set to `OnWithAlerts`, Windows raises a critical MDM alert the moment Assigned Access fails, carrying a status code: `2 AppNotFound` (an allowed app is not installed) or `3 ActivationFailed` (the account did not sign in). Those are precisely the two failures this fleet will hit. Without it, `Status` returns node not found and a kiosk that fails to enter its restricted session is invisible until someone visits the site.

This whole review exists because a failure was silent. **Recommended as a new object**, listed under Open below rather than added unilaterally, because it is a new Intune object and a design change.

---

## Pass 2 - the account model and the profile contract

Attacked the profile body: does Windows actually support what this profile asks for?

**2.1 CRITICAL. `TaskbarLayout` is unsupported in a restricted user experience.** Microsoft states: *"You can't pin apps on the taskbar in a restricted user experience. It's not supported to configure a Taskbar layout using the `<CustomTaskbarLayoutCollection>` tag in a layout modification XML, as part of the Assigned Access configuration. The only Taskbar customization available is the option to show or hide it."*

This profile uses `AllAppsList`, which is the restricted user experience, and carried a `v5:TaskbarLayout` containing exactly that tag. Note that the same Learn page then shows a `v5:TaskbarLayout` example, so the documentation contradicts itself; the normative statement is unambiguous and appears in the section governing this profile type. **Removed from both copies.** It was schema-legal, which is why the XSD pass did not catch it: schema-valid but unsupported is a defect class only a behavioural pass finds.

**Follow-on decision.** With no taskbar layout, `ShowTaskbar="true"` yields the *default* Windows 11 taskbar, including default pins the participant cannot use (anything not in the allow-list is blocked by the generated AppLocker rules, so those pins fail silently rather than opening anything). Two options, and this needs a decision:

| | `ShowTaskbar="true"` (as now) | `ShowTaskbar="false"` |
|---|---|---|
| Window switching | Taskbar plus Alt+Tab | Alt+Tab only |
| Participant sees | Default pins, some of which do nothing when clicked | No taskbar at all |
| Extra work | Policy to suppress Widgets, Chat, Search and Task View | None |

A participant with a CV in LibreOffice and a job site in Edge switches windows constantly, which argues for keeping the taskbar and suppressing the default pins by policy.

**2.2 CRITICAL. The design's break-glass mechanism does not exist in this profile type.** The Detailed Design states that "a defined breakout sequence leaves the restricted session and presents the standard logon screen." In the XSD, `v4:BreakoutSequence` sits in the `KioskModeApp` branch of the profile `xs:choice`, not the `AllAppsList` branch, and Learn documents it only under `KioskModeApp`. **A restricted user experience cannot define a breakout sequence.**

The actual exit is Ctrl+Alt+Del, then Lock, then Other user. Which leads to:

**2.3 The LAPS administrator will not be listed at the sign-in screen.** Microsoft: *"On Microsoft Entra joined and domain joined devices, local user accounts aren't displayed on the sign-in screen by default."* Good for the design's "no credential displayed anywhere" claim, and it means the session account is correctly hidden. But the support engineer must select Other user and type `.\<account>` by hand. Without that written down, a site visit concludes the device is bricked. The alternative, enabling `EnumerateLocalUsersOnDomainJoinedComputers`, would also expose the session account name and is not worth it.

**2.4 Conditional Access can block Windows sign-in outright.** Microsoft: *"Don't apply the profile to users or groups that are targeted by conditional access policies that require user interaction. For example, multi-factor authentication (MFA), or Terms of Use."* Microsoft carries a dedicated troubleshooting article for this failure. The session account is local and never authenticates to Entra, so the exposure is low, but CA-107 targets all users and guests on these devices and the tenant carries two enforced grants. **Needs an explicit validation step**, not an assumption.

**2.5 Start pins fail soft.** *"If an app isn't installed for the user, but is included in the Start layout XML, the app isn't shown on the Start screen."* Confirms that wrong `.lnk` paths cost a missing pin, not a failed configuration. **No change, and it lowers the severity of the LibreOffice and Voice Access path items.**

**2.6 Added `Name="APM Participant Kiosk"` to the Profile.** The CSP `Status` payload reports `profileId` only. A Name makes a reported failure legible without a GUID lookup.

---

## Pass 3 - runtime, autologon and hardening

Attacked the parts outside the XML that the XML depends on.

**3.1 CRITICAL. `DefaultDomainName` must not be set for a local account.** *Assigned Access recommendations*, autologon registry table: *"Set value for domain, only for domain accounts. For local accounts, don't add this key."*

The script set it to `$env:COMPUTERNAME`. **Removed.** This is the most likely cause of the next failure after the newline bug, and it would have presented as a device that reaches the sign-in screen and waits, with nothing in the Assigned Access log to explain it.

**3.2 `PreferredAadTenantDomainName` breaks automatic sign-in.** Microsoft names this policy specifically as one that prevents autologon from working. It is a common Entra-join convenience setting and may well be in the corporate baseline. **The kiosk group must be excluded from any profile that sets it**, and it is not on the design's exclusion list. New exclusion item.

**3.3 Device password policy breaks automatic sign-in.** Microsoft: *"When Exchange Active Sync (EAS) password restrictions are active on the device, the autologon feature doesn't work. This behavior is by design."* APM's SOE baseline sets a minimum password length of 14 and a maximum password age. Exempting the *account* from expiry, which the design already does, does not address a *device* password restriction delivered by policy. **The kiosk group needs excluding from the DeviceLock and password-policy settings of the corporate baseline**, which is also not on the exclusion list. New exclusion item.

**3.4 DR-022 has an answer, and it is not the one the design was heading for.** DR-022 asks whether to grant the session account the Shut down the system user right, because the idle watchdog runs in the participant session and must restart the device. Microsoft's kiosk hardening guidance is the opposite: remove users and groups from that right and keep only Administrators, and set `Shutdown_AllowSystemToBeShutDownWithoutHavingToLogOn` to 0.

Granting a public-session standard user the right to shut the machine down to satisfy a watchdog inverts the control. **The watchdog should not restart from the participant session.** It should detect idle in the session and signal a SYSTEM-context scheduled task to perform the restart, leaving the user right removed. That reframes DR-022 from a permission decision into a design change in pack 03.

**3.5 Ctrl+Alt+Del, Alt+F4, Alt+Tab and Alt+Shift+Tab are not blocked for any restricted-experience account.** Microsoft names all four and points at Keyboard Filter as the control. Alt+F4 closes Edge on a public kiosk. Keyboard Filter is an optional Windows component that has to be enabled, and it is not in the design. New item.

**3.6 Accessibility shortcuts open the Settings app.** WIN+U opens the Settings accessibility panel, and Assigned Access does not change accessibility settings. The design's App Control deny rule on `SystemSettings.exe` already blocks the target, so this route is closed by a control the design already has. **Recorded as a positive interaction, no change.**

**3.7 UNRECONCILED: the type of `AutoAdminLogon`.** *Assigned Access recommendations* gives it as `REG_DWORD`. The long-standing Microsoft article "How to turn on automatic logon in Windows", and Sysinternals Autologon, which is the tool that establishes the LSA-secret arrangement this design uses, both write `REG_SZ`. The script writes `REG_SZ`. **Left as `REG_SZ`, matching the tool whose behaviour with an LSA secret is known**, and recorded here as unreconciled rather than resolved. If autologon fails after 3.1, 3.2 and 3.3 are cleared, this is the next thing to change.

**3.8 `soffice.bin` removed, reversing the earlier fix.** It was added on the documented rule that an app's dependencies must also be listed. Adversarially: Assigned Access implements the allow-list by generating AppLocker rules, and AppLocker's executable rule collection covers `.exe` and `.com` only. A `.bin` cannot be evaluated by that collection, so listing it cannot help, and listing a path the rule generator cannot classify risks failing generation for the whole profile. **The dependency does matter under App Control, which evaluates any portable executable regardless of extension** - there it is covered by The Document Foundation publisher rule from the reference-device scan. Confirm LibreOffice launches on the reference device, and confirm the publisher rule covers `soffice.bin` in the signer review.

**3.9 A multi-app kiosk applies policy settings that affect every non-administrator user on the device**, not just the session account. The support account is a local administrator, so it is unaffected. **No change, worth one line in the design.**

**3.10 Lock screen notifications.** `AboveLock/AllowToasts` set to 0 stops toasts appearing on the lock screen of a public device. Not in the design. Minor new item.

---

## Pass 4 - external corroboration (Devicie, CIS 3.0.0 L1 + BitLocker)

A managed-service implementation of multi-app kiosk under a hardened CIS baseline, reviewed 19 August 2026. It is not a Microsoft source, so nothing here is treated as authoritative on its own, but where it agrees with Learn it settles a question, and where it does something APM does not it is worth reading.

**4.1 The whole approach is `<AutoLogonAccount rs5:DisplayName="Kiosk" />`.** Delivered as a single custom OMA-URI configuration profile, Data type String (XML file), with no local account creation, no password, and no device script for the session account. A production implementation under CIS Level 1 plus BitLocker reaches the same conclusion as 1.4 and the P1 design of record: the Windows-managed account is the approach that removes the credential rather than protecting it.

**4.2 The per-device identifier belongs in the device name, not the account name.** Their Autopilot profile sets a device name template of `KIOSK-%SERIAL%`. APM already does this: the fleet dynamic group is built on a device name starting with `APM-PK-`. So the serial is already recoverable per device from the device object, and the account name does not need to carry it. That removes the only real argument for `Kiosk-[SERIAL]`, which was support identifiability, and it removes it without keeping a stored credential.

**4.3 They ship a separate baseline build named "CIS Benchmark 3.0.0 Level 1 + BitLocker - Kiosk without DeviceLock".** Independent confirmation of finding 3.3: a device password policy disables automatic logon, and the fix is to remove DeviceLock from the baseline for kiosks. A commercial vendor maintaining a distinct hardened-baseline variant for exactly this reason moves 3.3 from advisory to mandatory. APM's equivalent action is an exclusion from the SOE hardening standard's password and DeviceLock settings, plus a documented variation.

**4.4 They maintain a documented list of settings excluded from the hardened baseline for kiosk.** Not one exclusion, a maintained set. APM needs the same artefact against the SOE Hardening Standard rather than a handful of exclusions discovered one failure at a time. Items 41a to 41c in the object register are the beginning of that list, not the whole of it.

**4.5 GAP: APM has no power management profile.** Theirs sets the High Performance power plan, and hard disk, sleep and display timeouts all to 0, on battery and plugged in. Microsoft's *Assigned Access recommendations* lists the same settings. A kiosk that sleeps is a kiosk that appears broken to the participant standing at it, and nothing in the current object register prevents it. New object required.

**4.6 The Enrolment Status Page is how application ordering is guaranteed.** They set "Block device use until required apps are installed" and name the applications. That closes verification item 4: rather than confirming by observation that LibreOffice, Zscaler and TeamViewer land before the Assigned Access configuration, `CDG-W11-CFG-Kiosk ESP-P-1.0` should block on those three.

**4.7 The AppLocker event log is the diagnostic path for the `soffice.bin` question.** Their stated prerequisite is to check AppLocker logs in Event Viewer for blocked applications. That settles 3.8 empirically on the reference device instead of by argument: launch LibreOffice under the restricted session and read the log.

**4.8 Do not copy their StartPins.** Their `desktopAppLink` values point at `.exe` paths. `desktopAppLink` expects a shortcut, so those pins will not resolve. APM's `.lnk` paths are correct and stay as they are.

---

## Corrected, cumulative

| # | Object | Defect | Pass |
|---|---|---|---|
| 1 | Script | Two statements on one line. Script died at step 4 on every run | Initial |
| 2 | Script | `v3:AllowedNamespace` is an rs5 element | Initial |
| 3 | Script | Unprefixed `TaskbarLayout` | Initial |
| 4 | XML | Unprefixed `TaskbarLayout` | Initial |
| 5 | XML | Two `AllowedNamespace` elements, schema permits one | Initial |
| 6 | XML | `Name="Desktop"` not in the enumeration | Initial |
| 7 | Both | `TaskbarLayout` unsupported in a restricted user experience | 2 |
| 8 | Both | No `Profile Name`, so failures report a bare GUID | 2 |
| 9 | Script | `DefaultDomainName` set for a local account | 3 |
| 10 | Both | `soffice.bin` cannot be evaluated by AppLocker | 3 |
| 11 | Both | App list order differed between the two copies | 3 |
| 12 | Repo | No check preventing the two copies drifting | 3 |
| 13 | Guide | Pack 02 documented as deployable | DR-021 |
| 14 | Design | File Explorer scope claims Desktop, which Windows cannot grant | Initial |
| 15 | Script | Session account could change its own password. Ctrl+Alt+Del is reachable from a restricted session, so Change password is reachable; a changed password does not update the LSA secret and automatic logon then fails permanently on that device | 5 |
| 16 | Both scripts | Only one of the three autologon blockers was detected. `PreferredAadTenantDomainName` and the device password policy were found in Pass 3 but never added to the scripts, so a device disabled by either reported compliant | 5 |
| 17 | Detection | No check for a literal `[SERIAL]` in the applied configuration, which is the signature of a configuration profile having overwritten the CSP node | 5 |
| 18 | Script | `New-LocalUser -Description` was 109 characters against a hard 48-character limit. The account was never created, on any device. Found on a test machine, not in review | 6 |
| 19 | All three scripts | The serial was not capped, only the assembled name. A long virtual-machine serial (VMware, Hyper-V) produced an invalid name, and two devices sharing a 14-character serial prefix produced the same name | 6 |
| 20 | Remediation and detection | **The DeviceLock blocker was tested with `Test-Path` on the registry KEY, not its values.** Windows pre-creates an area key under `PolicyManager\current\device` for nearly every policy area whether or not anything is configured, so the test was true on every device. The remediation exited 1 permanently and the detection reported non-compliant permanently, on devices with no password policy at all | 8 |
| 21 | Diagnostic | Same defect, and it also reported every DeviceLock value as a password restriction, including `MaxInactivityTimeDeviceLock` (a screen lock, not a password) and values explicitly set to 0 | 8 |
| 22 | Checker | The PowerShell guards ran against the remediation only. The identical key-existence defect sat in the detection script and passed clean | 8 |

### Pass 8 - the false positive

Reported from the field: the diagnostic said DeviceLock was present, but also said nothing was set at MDM level, and the two statements contradicted each other. They were both right. The key existed; no values were configured.

**This is the defect that made the remediation fail in Intune.** A non-zero exit is read as a failed remediation, so `CDG-W11-REM-Kiosk Session Account-P-1.0` would have failed on every device in the fleet indefinitely, for a policy that was never applied. It also survived a local override of the real blocker, because no change to any policy could ever satisfy a test of key existence.

Corrected in all three scripts, and the checker now runs its PowerShell guards over the detection script as well as the remediation. Two properties of the fix are worth stating, because both were wrong in the first attempt:

- **The test reads specific values, and reads them correctly.** `DevicePasswordEnabled` is inverted (0 means a password **is** required). A value present and set to 0 is not a restriction for the numeric settings, but for this one it is the restriction. Reporting "DeviceLock present" told an engineer nothing; naming `MinDevicePasswordLength=14` tells them exactly which setting to exclude.
- **The guard follows variables.** Written as a literal-path match it missed the shipped defect entirely, which was `Test-Path $dl` - the same failure as the earlier `-Description` guard that matched only a literal and missed `$desc`. Five negative tests now cover the variable form and the literal form in both scripts, plus the dropped inverted value.

### Pass 6 - first run on hardware

The two defects above came out of the first manual run on a test device and neither was reachable by any static check that existed at the time. Both are now guarded:

- `check-assigned-access.js` carries cmdlet argument length limits (`ARG_LIMITS`), covering `-Description` both as a literal and as the `$desc` variable the script actually passes. The literal-only form was written first and missed the real defect, which is worth recording: a guard that does not match how the code is written is not a guard.
- The serial is capped at 14 characters **before** the name is assembled, in all three scripts, and `CAP_RE` fails any script that caps the assembled name instead. Capping the name hides an overflow rather than preventing it, and it collides two long serials that share a prefix.

Observed: a Parallels serial sanitises to `PARALLELS34846`, 14 characters, making `Kiosk-PARALLELS34846` exactly 20. It fits, and it is the longest name that does.

### Pass 7 - confirmed on a managed device

Run on a Dell device under the corporate baseline (20 August 2026). The account was created and repaired correctly, autologon was configured, and **two of the three predicted blockers fired for real**: the logon banner and a DeviceLock device password policy. `PreferredAadTenantDomainName` was not set on that device.

This moves items 41a to 41c in the object register from predicted to observed, and it makes the exclusion work a prerequisite for the pilot rather than a hardening task afterwards. Neither setting can be cleared on the device: both are rewritten at the next management check-in.

`Get-KioskAutologonBlockers.ps1` was written for this: it reports the effective value of each blocker, the delivery channel, the provider GUID and management authority that set it, and the event-log record of it applying, then states the exclusion action for each. Read-only unless `-TestLocalClear` is passed.

**Two things the run also established.** The remediation exits 1 when it finds a blocker, and Intune reads a non-zero exit as a failed remediation - so a remediation reported as failing in the console is the expected result on a device that still carries these policies, not a broken script. And `DeviceLock/DevicePasswordEnabled` is inverted (0 means a password **is** required), which is worth knowing before reading a value off a device and drawing the wrong conclusion.

### Pass 5 - the reversal pass

Defects 15 to 17 were found when the per-device requirement was confirmed and the scripts were re-pointed at the corrected XML. All three are the same class: a finding recorded in an earlier pass that never reached the code. Pass 3 named `PreferredAadTenantDomainName` and the device password policy as autologon blockers; the scripts checked only the logon banner. A review finding that does not reach the artefact is not a finding, it is a note.

`check-assigned-access.js` now enforces all of the above. It carries nine negative tests, one per shipped defect, and every one is caught.

---

## Open

**BLOCKER, found while answering the Ctrl+Alt+Del question**

**A logon banner disables autologon outright.** Microsoft, *Turn on automatic logon in Windows*: *"This registry change does not work if the Logon Banner value is defined on the server either by a Group Policy object (GPO) or by a local policy."*

APM operates under RFFR, which is built on ISO 27001 and the ASD ISM, and the ISM requires a system-use banner at logon. So `LegalNoticeCaption` and `LegalNoticeText` are very likely set by the SOE hardening baseline, and if they are, **no Participant Kiosk will ever sign itself in**, no matter how correct the remediation is. Nothing in any log explains it: the device reaches the sign-in screen and waits.

Two actions, and the second is not optional:

1. **Exclude the kiosk group from whatever profile sets the logon banner.** New exclusion item.
2. **Raise a variation against the SOE hardening standard**, in the same form as SOE-05 for BitLocker pre-boot authentication. Removing an ISM logon banner from a device is a control deviation and has to be argued, not just configured. Suggested reference **SOE-07**, which both scripts already cite.

The detection script now fails a device with a banner set, and stays failing until the exclusion is applied. That is deliberate. The remediation cannot clear a policy-delivered value, and a kiosk with a banner is genuinely broken, so it should read as broken rather than as compliant-but-dead.

**Answered: requiring Ctrl+Alt+Del does not prevent autologon.** "Interactive logon: Do not require CTRL+ALT+DEL" set to Disabled is not among the documented blockers. The secure attention sequence governs interactive credential entry; `AutoAdminLogon` runs before that path. It stays required.

**Also found, and it is a guaranteed field failure**

**Every interactive admin sign-in at the console breaks autologon until the next remediation run.** Microsoft: *"An interactive console logon that has a different user on the server changes the DefaultUserName registry entry as the last logged-on user indicator. AutoAdminLogon relies on the DefaultUserName entry to match the user and password. Therefore, AutoAdminLogon may fail. You can configure a shutdown script to set the correct DefaultUserName."*

The break-glass path signs in with the LAPS local administrator at the console. That rewrites `DefaultUserName` to the administrator account, and the kiosk stops signing itself in. The daily remediation repairs it, so the exposure is up to 24 hours of a kiosk sitting at a sign-in screen after every support visit.

Microsoft's own fix is a shutdown script, and **pack 04 already registers one** for the session purge. Reasserting `DefaultUserName` and `AutoAdminLogon` in the shutdown pass closes the window to zero using machinery that already exists. Change required in `Invoke-KioskSessionPurge.ps1`.

**Confirmed correct, with the reasoning, because it looks wrong on inspection**

| Item | Finding |
|---|---|
| No registry `DefaultPassword` value | Correct. Microsoft: *"If no DefaultPassword string is specified, Windows automatically changes the value of the AutoAdminLogon key from 1 to 0"* - but the LSA secret satisfies it, and that is precisely what Sysinternals Autologon does: *"the password will be stored in a Local Security Authority (LSA) secret instead of the Winlogon key."* The script stores the secret **before** setting `AutoAdminLogon`, which is the order that matters |
| DR-011's rejection of the registry route | Vindicated. Microsoft: *"when autologon is turned on, the password is stored in the registry in plain text. The specific registry key that stores this value can be remotely read by the Authenticated Users group"* |
| The design's claim that a kiosk with no internet still signs itself in | Correct, and it depends on the account being local. Microsoft warns that for an Entra ID user there is no way to delay autologon until the network is up and *"the computer will attempt the logon and fail"*. A local account has no such dependency |

**Decisions**

| Item | Owner |
|---|---|
| Exclude the kiosk group from the logon banner policy, and raise SOE-07 as a variation | APM Cyber Security |
| **`CDG-W11-SEC-Logon Lockdown-P-1.0` cannot enumerate a per-device account name.** Its Allow log on locally allow-list is one static policy value and every device's account is named differently. Three candidates: name the built-in `Users` group (the session account is its only member on a kiosk), have the remediation set the right per device with `LsaAddAccountRights`, or drop the allow-list and rely on Deny log on locally for the accounts that must be blocked | APM Cyber Security |
| `ShowTaskbar` true with default pins suppressed by policy, or false (2.1) | Digital Transformation and Architecture |
| DR-022, reframed: move the restart to a SYSTEM-context task rather than grant the user right (3.4) | APM Cyber Security |
| Add `StatusConfiguration` set to `OnWithAlerts` as a new Intune object (1.4) | Digital Transformation and Architecture |
| Enable Keyboard Filter to block Alt+F4 and Ctrl+Alt+Del (3.5) | APM Cyber Security |

**Design document changes required**

1. File Explorer scope: "Downloads, Desktop and removable drives" becomes "Downloads and removable drives" in the in-scope bullet, the Least Privilege row and requirement 04, and in the Technical Configuration Document (14).
2. Break-glass: rewrite the breakout-sequence claim as Ctrl+Alt+Del, Lock, Other user, typing `.\<account>`, and state that local accounts are not enumerated on an Entra-joined device (2.2, 2.3).
3. Device configuration profile count: 14 becomes 13, with `CDG-W11-CFG-Assigned Access XML-P-1.0` removed and DR-021 recorded as decided.
4. Exclusion list: add `PreferredAadTenantDomainName`, the corporate password/DeviceLock policy, and the logon banner policy (3.2, 3.3, blocker above).
5. SOE alignment table: add SOE-07 for the logon banner variation, alongside SOE-05.
6. Section 9 runbooks: the remote-support runbook must state that an interactive console sign-in breaks autologon, and what restores it.
7. Section 7 contradicts itself. The prose describes an account "that Windows creates, credentials and signs in on its own behalf", which is `AutoLogonAccount` and is not what this design uses; the table directly under it correctly describes a signed remediation creating `Kiosk-<SERIAL>` with the credential in the LSA secret. Technical Configuration Document 11.3 repeats the wrong one ("created and credentialed by Assigned Access on-device"). Correct both to match the table.
8. Technical Configuration Document Appendix A.2 holds a verbatim copy of both scripts, including the collapsed statement and the `DefaultDomainName` write. Re-sync from `config/` at the next version bump.

**Verification on a reference device**

1. LibreOffice launches under the restricted session with `soffice.bin` absent from the allow-list (3.8).
2. `%SystemRoot%\System32\VoiceAccess.exe` exists, and `Voice Access.lnk` sits where the pin expects it.
3. The three LibreOffice `.lnk` paths match the installed MSI.
4. Applications install before the Assigned Access configuration is applied.
5. Autologon survives the corporate baseline, after 3.2 and 3.3 exclusions are in place.
6. No Conditional Access policy requiring interaction reaches the session logon path (2.4).

---

## Running the checker

```js
const src = await readFile('designs/participant-device/config/check-assigned-access.js');
const { checkAssignedAccess } = await import(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
const r = checkAssignedAccess({
  xml:    await readFile('designs/participant-device/config/AssignedAccess-ParticipantKiosk.xml'),
  script: await readFile('designs/participant-device/config/Remediate-KioskSessionAccount.ps1'),
});
if (!r.ok) throw new Error(r.failures.join('\n'));
```

## Diagnosing on-device

Event Viewer, Applications and Services Logs > Microsoft > Windows > AssignedAccess > Operational. Machine state under `HKLM\Software\Microsoft\Windows\AssignedAccessConfiguration` and `HKLM\Software\Microsoft\Windows\AssignedAccessCsp`; applied per-user configuration under `HKCU\SOFTWARE\Microsoft\Windows\AssignedAccessConfiguration`.

Test a candidate XML locally with `Import-AssignedAccessConfiguration -Path <file>` rather than through a policy round trip. Run the remediation by hand in an elevated 64-bit session before assigning it: defect 1 and defect 9 both surface on a single manual run and report only as a failure count through a policy assignment.
