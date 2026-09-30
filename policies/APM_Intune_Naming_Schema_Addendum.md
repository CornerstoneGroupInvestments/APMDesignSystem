# APM Intune Naming Schema V1.0 - addendum

**Status:** proposed additions for APM ITS management approval, to be folded into the schema at V1.1.
**Source standard:** `APM - Intune Naming Schema v1.0.docx` (26 March 2026), held in `uploads/`.
**Raised by:** Participant Device detailed design V1.0 section 5.1.5 (items 1-6); Standard User SOE on AVD detail design V1.0 section 5.1.5 and DR-017 (items 7-9).

The schema covers Intune configuration items and Entra ID security groups. Two things the Participant Device fleet needs are not in it, and one existing value needs a clarification. Nothing here changes the schema's structure; each item extends it in its own idiom.

## 1. Device hostnames are not covered by the schema

The schema names policies, profiles and groups. It does not name devices, so the Participant Device fleet has had to define a hostname format. It is documented here so that the next fleet does not invent a different one.

**Proposed section: Device Naming**

| Field | Value | Notes |
|---|---|---|
| Scope | `APM` | As the schema's scope table |
| Type | `PD` | Participant Device. See item 3 |
| Random | 3 digits | Assigned by the Autopilot device-name template (`%RAND:3%`) at provisioning, so it is unique to the device from first boot |
| Site | Last 4 digits of the Loc# | Read from the device's location group (`sg-stc-dvc-site-LOC########`) and appended by an automated rename |

Format: `APM-PD-[RRR][LLLL]` - for example `APM-PD-1231001` for a device at `LOC00001001`.

**Length.** 14 characters, one inside the 15-character Windows hostname limit. The site digits run on from the random digits with no separator because a hyphen would make the name exactly 15; `APM-PD-123-1001` is legal but leaves no headroom. If APM prefers the more readable form, that is a one-parameter change in the rename script and this addendum should be updated to match.

**No serial number in the name.** Traceability from hostname to hardware is held in Intune and the asset register, not in the name. A serial would not fit alongside the site digits inside 15 characters, and the site is what operations need to read at a glance.

## 2. Location device group format, clarified

The schema's body text gives `sg-device-site-[LOC#]` (example `sg-dvc-site-LOC`) while its table gives `sg-stc-dvc-site-LOC00001001`. The table form is the one in use for the ~750 groups that exist, and it is the form this design's automation matches. **Recommend the body text be corrected to the table form** so a future reader does not build against the other one.

## 3. `PD` as a device type identifier

`PD` is used in the device hostname only, not as an Intune Type value. The Intune Type values this fleet uses are all existing schema values: `CFG`, `SEC`, `REM`, `APPC`, `COM`, `UPD`, `CAP`. **Recommend `PD` be added to a Device Naming section rather than to the Type table**, so the Type table keeps its current meaning.

## 4. Scope `CDG` confirmed as the fleet's scope

The schema defines `CDG` as "Client Device Group - Jobseeker/CTA groups". The Participant Device fleet is the renamed Job Seeker fleet, so `CDG` applies without change. **Recommend the description be updated to "Client Device Group - Participant Device / ES take-home device groups"** to match the current program terminology; the value itself does not change.

## 5. Function values introduced by this design

For the Function field, which the schema leaves open. Listed so they are reused rather than reinvented:

`Assigned Access` · `Idle Restart` · `Profile Purge` · `Logon Lockdown` · `Edge Hardening` · `LAPS` · `USB Exception` · `Bitlocker Exception` · `AppControl Audit` · `AppControl Enforced` · `Delivery Optimization` · `Autopilot Self-Deploying` · `LibreOffice` · `Expedite` · `Participant Device` (compliance) · `Block Participant Device Access` (Conditional Access)

## 6. Ring value applied to a pilot policy

The schema's Ring values are P, T and D. This design uses `T` for the App Control audit policy and the pilot update ring, because both run only on the pilot device group, and `P` for their production counterparts. That is the schema's intent, recorded here as a worked example: `CDG-W11-SEC-AppControl Audit-T-1.0` alongside `CDG-W11-SEC-AppControl Enforced-P-1.0`.

## Objects this design creates, for the schema's own record

| Object | Name |
|---|---|
| Autopilot profile | `CDG-W11-CFG-Autopilot Self-Deploying-P-1.0` |
| Assigned Access | `CDG-W11-CFG-Assigned Access-P-1.0` |
| Delivery Optimization | `CDG-W11-CFG-Delivery Optimization-P-1.0` |
| Edge hardening | `CDG-W11-SEC-Edge Hardening-P-1.0` |
| Logon lockdown | `CDG-W11-SEC-Logon Lockdown-P-1.0` |
| Windows LAPS | `CDG-W11-SEC-LAPS-P-1.0` |
| USB exception | `CDG-W11-SEC-USB Exception-P-1.0` |
| BitLocker exception | `CDG-W11-SEC-Bitlocker Exception-P-1.0` |
| App Control | `CDG-W11-SEC-AppControl Audit-T-1.0` · `CDG-W11-SEC-AppControl Enforced-P-1.0` |
| Idle restart | `CDG-W11-REM-Idle Restart-P-1.0` |
| Profile purge | `CDG-W11-REM-Profile Purge-P-1.0` |
| LibreOffice | `CDG-W11-APPC-LibreOffice-P-1.0` |
| Compliance | `CDG-W11-COM-Participant Device-P-1.0` |
| Update rings | `CDG-W11-UPD-Windows Update-T-Ring 1` · `CDG-W11-UPD-Windows Update-P-Ring 2` |
| Expedite | `CDG-W11-UPD-Expedite-P-1.0` |
| Conditional Access | `APM-USER-CAP-Block Participant Device Access-P-1.0` |
| Device group | `sg-dyn-dvc-cdg-participant-devices` |
| Autopilot group | `sg-dyn-dvc-cdg-participant-autopilot` |
| Pilot ring group | `sg-stc-dvc-cdg-participant-ring1` |
| Location groups | `sg-stc-dvc-site-LOC########` (existing, ~750) |


---

# Part 2 - additions for the Standard User SOE on Azure Virtual Desktop

Raised by the Standard User SOE on AVD detail design V1.0, DR-017. Same status: proposed additions for APM ITS management approval.

## 7. `AVD` as a Scope value

The session host fleet is a distinct managed device population needing its own assignment scope, on exactly the basis `CDG` exists for the participant and take-home device population. Without it, AVD policies would have to sit in the `APM` global scope and be distinguished only by the Function field, which is not an assignment boundary.

**Proposed addition to the Scope table**

| Scope | Description |
|---|---|
| `AVD` | Azure Virtual Desktop session hosts - Standard User SOE delivered on AVD |

**Platform stays `W11`.** Windows 11 Enterprise multi-session is an edition of Windows 11, not a separate platform, so no new Platform value is required. Recommend the schema not gain a multi-session platform value, because the hardening standard treats a session host as a Windows 11 endpoint and a separate platform token would imply otherwise.

## 8. Objects the AVD design creates, for the schema's own record

| Object | Name |
|---|---|
| FSLogix profile container | `AVD-W11-CFG-FSLogix Profile-P-1.0` |
| Session time limits | `AVD-W11-CFG-Session Time Limits-P-1.0` |
| Multi-session host behaviour | `AVD-W11-CFG-Multi-Session Host-P-1.0` |
| Compliance | `AVD-W11-COM-Session Host-P-1.0` |
| Win32 applications | `AVD-W11-APPC-<Application>-P-1.0` |
| Test-ring twins | `AVD-W11-CFG-FSLogix Profile-T-1.0`, `AVD-W11-CFG-Session Time Limits-T-1.0`, `AVD-W11-CFG-Multi-Session Host-T-1.0`, `AVD-W11-COM-Session Host-T-1.0` |
| Session host device group | `sg-dyn-dvc-avd-session-hosts` |
| Pilot host ring | `sg-stc-dvc-avd-session-hosts-ring1` |
| AVD entitlement | `sg-stc-usr-avd-standard-user` |
| Desktop assignment | `sg-stc-usr-avd-desktop-managed`, `sg-stc-usr-avd-desktop-unmanaged` |
| AVD operators | `sg-stc-usr-avd-operators` |
| Image builders | `sg-stc-usr-avd-image-builders` |
| Test groups | `sg-dyn-dvc-avd-session-hosts-test`, `sg-stc-usr-avd-standard-user-test`, `sg-stc-usr-avd-desktop-managed-test`, `sg-stc-usr-avd-desktop-unmanaged-test` |
| Conditional Access | `CA-202 - Org Users - Azure Virtual Desktop - Allow - Require MFA`, `CA-210 - Org Users - Microsoft 365 exc. AVD - Unmanaged Devices - Block` |

**No update ring object.** Session hosts are replaced from a new image version rather than patched in place, so the AVD scope creates no `UPD` object. Recorded so a future reader does not read its absence as an omission.

**New Function values introduced:** `FSLogix Profile` · `Session Time Limits` · `Multi-Session Host` · `Session Host` (compliance).

## 9. The Azure ESLZ naming standard needs AVD additions too

Not the Intune schema's business, but recorded here because the two standards are read together and the AVD design is the first to need Azure resource types the ESLZ standard does not cover. Raise with Digital Operations as the owner of `reference/environment/Azure-ESLZ-Naming-Standards-17July2026.pdf`.

| Gap | Proposed |
|---|---|
| No abbreviation for an AVD host pool, workspace or application group | `avdhp`, `avdws`, `avdag` - e.g. `auea-avdhp-avd-ctrl-staff-001` |
| No abbreviation for a Compute Gallery or an image definition | `gal`, `img`. A gallery name cannot contain a hyphen, so it takes the shortform concatenated variant: `aegalacstaff001` |
| No environment shortform for `avd`, needed for storage account and virtual machine names | `a` - e.g. `aestacfslogix001`, virtual machine prefix `aevmacstd` |
| The `avd-ctrl` token pair reads as a repetition in hyphenated names | Accepted as-is. The environment token is fixed by the deployed `auea-vnet-avd-ctrl-001`, and diverging from it for other resource types would be worse than the repetition |

## 10. Superseded convention

The Standard User AVD draft V0.1 (15 May 2026) used a parallel `APM-AVD-*` convention for Intune, Entra and Azure objects (`APM-AVD-HP-StaffPooled-AUE`, `APM-AVD-SessionHosts`, `CA-APM-AVD-*`, `SG-APM-AVD-*`, `vmavd-stf-aue-NNN`, `stfslogixaue001`, `gal-apm-avd-staff`). It conforms to none of the three standards in force. It is superseded by the detail design V1.0 section 5.1.5 and should not be reused.
