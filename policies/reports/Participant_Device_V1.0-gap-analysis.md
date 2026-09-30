# Participant Device V1.0 - policy and compliance gap analysis

**Assessed:** 4 August 2026 · **Document:** `APM_DDD_Participant_Device_V1.0.docx` (source `designs/participant-device/content.txt`)
**Assessed against:** the ten APM policy and standard documents held in `policies/`, all 111 extracted requirements in `policies/policy-data.js`, and the 32 machine-checkable rules in `policies/compliance-rules.js`.

## Verdict

| Scan | Result |
|---|---|
| Machine check (`compliance-check.js`, 32 rules) | **100%** - 0 conflicts, 0 gaps, 5 compensated, 26 met, 1 n/a |
| Manual review against all 111 extracted requirements | **15 gaps**: 6 material (1 closed 4 Aug), 9 minor |
| Second-pass technical review (round 2, below) | **9 discrepancies**: 4 material (all closed 4 Aug), 5 minor |
| Requirements that cannot be assessed | **11 standards named in the Posture Statement but not held** |

The machine check passes because every rule it can test is satisfied. The gaps below are the class of finding a rule set cannot see: obligations that live in process documents (notify, register, approve, assess) rather than in device configuration, and obligations that belong to standards APM has not yet given us.

**Closed by the pivot** - these were live findings against V1.6 and are gone, not deferred: the Cryptography Standard key-rotation conflict (no credential to rotate; LAPS rotates at 30 days, inside the 60-day maximum), the SOE-04 lock-screen credential deviation, the internet-facing Credential Proxy endpoint, the Purview Information Barrier dependency, the missing TLS cipher-suite specification (now §7.2.7) and the unnamed incident reporting path (now §9.1).

---

## A. Material gaps - close before approval

### G-01 · No DEWR notification for a material environment change
**Policy:** Compliance Management Plan 09.03.055-1.2, requirement 11 - notify DEWR within 5 days of a change to the operating environment.
**Design today:** §9.4 decommissions a Microsoft 365 tenant, a public Azure endpoint, 540 cloud identities and a licensing model, and §5.2.4 introduces a new third-party publishing path into Intune. None of it is notified.
**Gap:** This pivot is the most notifiable change the program has produced, in both directions - removing an internet-facing endpoint and changing the identity model of a fleet that handles participant PII.
**Fix:** A change record in §9.4 and a step in §9.5 Phase 1: RFFR Program Manager notifies DEWR within five days of the design being approved, and again on completion of decommissioning. **Owner:** Compliance Manager.

### G-02 · Risks and actions are not registered in Clew
**Policy:** Compliance Management Plan, requirement 3 - all risks, controls, actions and improvements are tracked in Clew.
**Design today:** §7.5 carries a ten-row risk register with owners; §7.3.5 carries seven alignment items. Neither says where they live after approval.
**Gap:** A risk accepted in a design document and not registered in the ISMS tool is not accepted at all, and an RFFR assessor will ask for the register entry, not the design section.
**Fix:** One sentence at the head of §7.5 and §7.3.5: every row is raised in Clew on approval, with the named owner and a review date. **Owner:** Compliance Manager with Shaun Struik.

### G-03 · Penetration testing is scheduled after devices are live
**Policy:** Continuous Monitoring Plan, requirements 6 and 7 - testing prior to a system going live; System Owner approval and a CISO-approved schedule.
**Design today:** §9.5 puts the pilot (5 to 10 devices at real sites, used by real participants) at Phase 3 and penetration testing at Phase 4.
**Gap:** If a pilot device is used by a participant it is live, and the test is late. The design also names no approver and no schedule.
**Fix:** Either declare the pilot a closed test with no public access and say so, or move the penetration test ahead of participant use. Name the System Owner who approves and the CISO-approved test window. **Owner:** APM Cyber Security with the PM.

### G-04 · No vulnerability management cadence or remediation timeframe - **CLOSED 4 Aug 2026**
**Policy:** Continuous Monitoring Plan, requirements 2, 3 and 9.
**Closed by:** a vulnerability management position added to §9.3 and a Defender vulnerability management row added to §9.2. Exposure is managed by two automated patch channels (Windows Update for Business rings for the operating system, Edge and the Defender platform; Patch My PC for LibreOffice), both inside the ISM two-week window with the expedite policy covering actively exploited vulnerabilities in 48 hours. Findings are reviewed at the existing weekly vulnerability review meeting rather than in a fleet-specific process. §4.3.8 now states that the fleet joins an existing estate update ring where that ring meets the 03:00 restart window, rather than duplicating a policy object.
**Residual:** none. The remaining question is operational, not design: confirm which estate ring, if any, already carries a 03:00 daily install and restart.

### G-05 · No device loss, theft or compromise procedure
**Policy:** Cyber Incident Response Plan 09.03.005-7.0, requirements 6, 8 and 13 - reporting path, DEWR and ASD notification for personal or sensitive data incidents, Post Incident Report within 7 days. Supporting playbook: Theft / Loss of IT Asset.
**Design today:** §9.1 names the reporting path (APM Assist, ServiceNow, Major Incident Register). Nothing describes what happens to a stolen or compromised Participant Device.
**Gap:** Risk R-01 accepts device theft as a risk and points at BitLocker, but no one is told what to do when it happens. The design does not need to invent a procedure - it needs to reference the existing playbook and add the three fleet-specific steps.
**Fix:** A short §9.x: report through APM Assist; the CIRT engages the Theft / Loss of IT Asset playbook; fleet-specific containment is to disable the Entra device object, revoke its LAPS password, and Autopilot Reset or wipe on recovery; a participant PII incident is DEWR-notifiable and engages the securitycompliance path; Post Incident Report within 7 days. **Owner:** Digital Operations with APM Cyber Security.

### G-06 · No third-party security assessment for the software publishing path
**Policy:** Cyber Security Posture Statement 09.01.033-5.0, requirement 15 - third party security. (The Security Standards for Third Parties policy itself is not held.)
**Design today:** A-08 assumes Patch My PC Publisher is licensed and integrated with Intune. §5.2.4 gives it the authority to publish executable content that installs on 540 devices.
**Gap:** That is a supply-chain path into a public-area fleet, and it is assumed rather than assessed. TeamViewer, CompNow and Stratus each have an existing relationship; Patch My PC in this role may not.
**Fix:** Record the third-party assessment status of Patch My PC (and confirm TeamViewer's) as an assumption with an owner, and state the compensating position: every published binary must still satisfy the App Control publisher rule, so a compromised publisher cannot introduce an untrusted binary. **Owner:** APM Cyber Security with Digital Delivery.

---

## B. Minor gaps - tidy before circulation

| Ref | Policy | Gap | Fix |
|---|---|---|---|
| G-07 | Information Asset Classification and Handling Standard (**not held**) | §6.2 classifies data as "PII - Sensitive", "PII - Health", "Activity data" - our labels, not APM's scheme | Request the standard and map §6.2 to the official taxonomy. Until then, state that the labels are provisional |
| G-08 | Posture Statement §4.3 - removable media administratively disabled, explicit APM ICT approval required for approved media | §7.3.3 argues the USB exception against the SOE Hardening Standard only. The Posture Statement is the clause that *legitimises* it | Cite §4.3 in §7.3.3 and name the ICT stakeholder who grants the approval. This turns the exclusion from a deviation into a policy-compliant exception |
| G-09 | AI Policy 09.01.037-2.1, requirements 1 to 3 | §7.4 allow-lists Generative AI categories in an APM-managed control. Whether that is "APM using AI" is undetermined | Decision-register row: Data Privacy to confirm that participant use of public AI tools on an APM asset does not trigger the ELT sign-off and privacy impact assessment |
| G-10 | Posture Statement, requirement 5 - Microsoft Australian regions only | No data-residency statement. The Azure footprint is gone, but Intune, Entra ID and Defender still hold device data | One row in §7.2.7 or §5.3 confirming the tenant's data residency and that no fleet data leaves the Australian region |
| G-11 | Trusted Insider Program 09.03.020-6.0, requirements 3, 4 and 6 | Support operators hold local administrator rights on 540 devices. The design does not classify them as a trusted insider population, nor name the enterprise password manager for the Zscaler and TeamViewer tenant credentials | Short paragraph in §4.3.10: operators are in scope of the Trusted Insider Program, use separate privileged accounts, and any shared tenant credential is held in the enterprise password manager |
| G-12 | Cryptography Standard, requirements 3 and 12 | No post-quantum position; the code-signing certificate's issuance and approval path (D&T Operations) is not named | One line in §7.2.7 for each. The certificate is the build's master gate (SOE-02) and its approval owner should be explicit |
| G-13 | Posture Statement, requirement 8 - clear desk and clear screen | A device that signs itself in and never locks is a clear-screen question a reviewer will raise | Argue it in §6.3: the screen displays no participant data after a restart, the session holds nothing to protect, and locking a device with no credential would make it unusable |
| G-14 | Estate naming convention (`APM-<scope>-<function>-P-<version>`) | `APM-PD-AssignedAccess`, `APM-PD-EdgeHardening`, `APM-PD-IdleRestart`, `APM-PD-LogonLockdown` and `APM-PD-ProfilePurge` do not carry the `-P-1.0` suffix that the security profiles in the same document do | Rename for consistency, or state why the configuration profiles differ from the security profiles |
| G-15 | Compliance Management Plan, requirements 5, 6 and 13 | The design commits to an annual review with the hardening standard, but not to the quarterly control validation or the quarterly ISM update review | Name both in §9.1 so the fleet is inside the existing governance cadence rather than reviewed only once a year |

---

## C. Rulings and variations already tracked in the design

These are not gaps in the analysis sense - they are open items the design already argues openly. Listed so the two lists are not confused in review.

| Ref | Item | Status |
|---|---|---|
| SOE-02 | APM code-signing certificate for device scripts and the App Control policy | Open, master build gate |
| SOE-05 | BitLocker pre-boot authentication cannot apply to a device that signs itself in | Open, needs a formal variation |
| SOE-06 | Edge hardening converted from user scope to device scope, CIS Level 2 minimum | Open, raised by APM Cyber Security |
| SOE-07 | ISM Windows 11 baseline audited for user-scoped components | Open, raised by APM Cyber Security |
| DR-107 | Zscaler forwarding and provisioning model with no user identity | Open, workshop scheduled |
| §7.3.3 | Three removable-media exclusions with compensating controls | Argued, awaiting acceptance in the SoA |

---

## D. Cannot be assessed - standards not held

The Posture Statement names eleven standards we do not have. Six of them bear directly on this design, and each represents an unassessable area rather than a pass:

| Standard | What it would govern here |
|---|---|
| **Identity and IT Access Management Standard** | The local account model, automatic logon, break-glass administration, LAPS parameters, session timeout. This is the standard the whole identity section should be argued against, and we are arguing it against first principles |
| **Information Asset Classification and Handling Standard** | §6.2 classification labels and the handling rules that follow from them (G-07) |
| **Patch and Vulnerability Management Standard** | Patch windows and remediation SLAs. §9.3 currently cites ISM and Essential Eight timeframes as a substitute (G-04) |
| **Information Security Code of Practice** | Clear desk and clear screen, acceptable use on a public-area device (G-13) |
| **Security Standards for Third Parties Engaging with APM** | The Patch My PC, TeamViewer, CompNow and Stratus relationships (G-06) |
| **Risk Management Framework** | The likelihood and impact scale used in §7.5, which is currently ours rather than APM's |

Request these before the design goes to formal review; four of the fifteen gaps above close on receipt.

---

## E. Round 2 - technical discrepancies inside the design

Found on a second pass reading the configuration against itself rather than against policy. These are the class of defect no scan catches: two sections that are each individually correct and cannot both be true on a real device. Four are material because they would be discovered on the pilot bench, not in review.

### G-16 · The App Control allow-list does not include Patch My PC (material)
§4.3.9 trusts five publishers: Microsoft, The Document Foundation, Zscaler, TeamViewer and the APM code-signing certificate. §5.2.4 gives Patch My PC the job of installing LibreOffice updates, and Patch My PC's Intune packages execute their own signed wrapper script during install. With script enforcement ON and no Patch My PC signer in the allow-list, the wrapper is blocked and the update fails - silently, as an Intune app install error rather than a security event.
**Fix:** add the Patch My PC signer to the publisher list in §4.3.9, or configure the packages to run the vendor MSI directly with no wrapper, and state which. Confirm the wrapper's signer on the bench during the pilot.

### G-17 · Accessibility tools are promised but not allow-listed (material)
§5.2.1 lists Narrator, Magnifier, high contrast, font scaling and the on-screen keyboard. Requirements 02 and 03 make them Must. T-18 tests them. Appendix B does not list any of them in `AllowedApps`, and multi-app Assigned Access will not launch an application that is not on that list.
**Fix:** add the accessibility AUMIDs to Appendix B, or state which tools are reachable through the Ease of Access affordances that Assigned Access exposes natively, and re-scope T-18 to what is actually deliverable. This is the single most likely pilot failure in the document.

### G-18 · A signed App Control policy cannot be deployed the way §4.3.9 says (material)
§4.3.9 sets "Delivery: Intune endpoint security, App Control for Business" and, in the rule options, "the policy is signed". Intune's built-in App Control profile deploys an unsigned policy; a signed policy is deployed as a signed binary through the ApplicationControl CSP by custom OMA-URI, and once it is applied it cannot be removed without the signing certificate - which is also the recovery consideration nobody wants to discover on 540 devices.
**Fix:** specify the deployment mechanism for the signed policy explicitly, and add the removal and rollback path to §8.3. Keep the audit policy on the built-in profile if that is simpler.

### G-19 · The auto-logon account may inherit a password expiry it cannot satisfy (material)
The inherited Windows 11 baseline sets a maximum password age and a 14-character minimum for local accounts. The Assigned Access account's credential is generated and held by Windows, and §5.1.2 states there is no rotation schedule. If the baseline's expiry applies to that account, automatic logon fails at expiry and the device presents a logon screen no member of the public can use - the fail-secure behaviour in §5.1.2, arriving unannounced across the fleet on the same day.
**Fix:** verify on the bench whether the managed account is exempt, and if it is not, exclude it from the expiry setting explicitly. Add it to §9.6 as a test with a hard pass criterion (advance the clock past the expiry age and confirm auto-logon still works).

### Minor

| Ref | Discrepancy | Fix |
|---|---|---|
| G-20 | §9.3 sets Delivery Optimization download mode to **Group (site peers)**, but Entra-joined devices with no AD site have no group boundary unless a GroupID source is configured. Peering silently falls back to LAN or nothing, and each device pulls its own copy over a 20 Mbps site link | Specify the GroupID source (DHCP option or a per-site GroupID set by policy), or set download mode to LAN and accept it |
| G-21 | LibreOffice bundles components that may not all carry The Document Foundation signature. §4.3.9 sets **Allow Supplemental Policies = No**, so any unsigned bundled component means re-issuing the signed base policy rather than adding a supplement | Expect audit-mode blocks on the pilot, and state the change path for the base policy in §5.2.5 |
| G-22 | §7.2.6 blocks `login.microsoftonline.com` in the browser. If the Zscaler client ever completes a browser-based SAML sign-in, that block breaks enrolment | Fold into the DR-107 workshop and record the outcome; the build verification note in §7.2.6 should name it |
| G-23 | The compliance policy (§7.2.5) gates nothing: no user authenticates from the device, and the Conditional Access policy blocks everyone regardless of compliance state | Say so. Compliance is used for reporting and alerting on this fleet, not as an access gate. A reviewer will otherwise assume it is load-bearing |
| G-24 | §6.4 purges the print spool while §5.2.2 provides no printing, and §5.2.1 promises a wallpaper data-wipe notice without naming how it is applied | Trim the spool reference or justify it, and name PersonalizationCSP desktop image for the wallpaper. There is no lock screen on this fleet to carry the notice |

### G-16 · The App Control allow-list does not include Patch My PC - **CLOSED 4 Aug 2026**
**Closed by:** a sixth publisher rule in §4.3.9 for the Patch My PC LLC signer, with the reason stated (the wrapper script fails as an application install error, not a security event). Publisher counts corrected to six in §7.3 and §7.3.4. New test T-20 proves a published update installs end to end with script enforcement on and no CodeIntegrity block.

### G-17 · Accessibility tools are promised but not allow-listed - **CLOSED 4 Aug 2026**
**Closed by:** new §4.3.1.1, which allow-lists Narrator, Magnifier, the on-screen keyboard and Voice access by path, pins them to Start, and states how the features that are not launchable applications are delivered (contrast theme by policy plus the keyboard shortcut, text scaling by policy, Read Aloud and translation in Edge). Appendix B updated with the four executables and three Start pins. T-18 rewritten to test what the design actually delivers.

### G-18 · A signed App Control policy cannot be deployed the way §4.3.9 says - **CLOSED 4 Aug 2026**
**Closed by:** DR-111 and a split delivery specification in §4.3.9. The audit policy stays on the built-in Intune App Control profile, unsigned and removable, which is what a pilot needs. The enforced policy is converted with `ConvertFrom-CIPolicy`, signed with the APM code-signing certificate (listed in the policy's own `UpdatePolicySigners`) and deployed as a signed binary through the ApplicationControl CSP by custom OMA-URI. The recovery problem is answered in §8.3: a pre-signed audit-mode replacement policy is produced and held in escrow with the certificate **before** the enforced policy is deployed, Boot Audit On Failure degrades a policy fault to audit rather than blocking boot, and T-21 proves the rollback on a pilot device.

### G-19 · The auto-logon account may inherit a password expiry it cannot satisfy - **CLOSED 4 Aug 2026**
**Closed by:** an explicit exemption row in §4.3.3 (`PasswordExpires = False` on the Assigned Access account only, applied by the signed logon-lockdown remediation) and a matching line in §5.1.2. The account is exempted deliberately rather than assumed exempt. T-19 advances the clock past the baseline maximum password age and requires automatic logon to still work.

### Round 2 items still open

| Ref | Item | Status |
|---|---|---|
| G-20 | Delivery Optimization Group mode has no group boundary on Entra-joined devices | **CLOSED 4 Aug 2026.** §9.3 now specifies LAN mode with peer selection restricted by subnet mask (each site is a discrete /26, so the subnet is the correct boundary and no GroupID plumbing is needed), a 60-second HTTP fallback delay and a lowered minimum background QoS so peers are actually preferred, bandwidth ceilings tuned to a 20 Mbps shared link (40%, tightened to 20% in business hours), a 3-day cache age matching the fleet deferral, and the reasoning for a dedicated fleet policy rather than joining the estate one. The two network preconditions - wireless client isolation off on APM-KIOSK and intra-VLAN TCP 7680 - are in §5.3.7, and T-22 proves peering happened rather than assuming it |
| G-21 | LibreOffice bundled components versus "no supplemental policies" | Open - resolved on the pilot bench in audit mode |
| G-22 | `login.microsoftonline.com` browser block versus any browser-based Zscaler sign-in | Open - folded into the DR-107 workshop |
| G-23 | The compliance policy gates nothing on this fleet and should say so | Open - one sentence in §7.2.5 |
| G-24 | Print-spool purge on a fleet with no printing; wallpaper delivery not specified | Open - trim or specify |

---

## Suggested rule-set additions

`compliance-rules.js` cannot currently see G-01, G-02, G-03, G-05, G-06 or G-10. Each is machine-checkable with a context guard:

- `mustState` for a DEWR notification where the document describes a tenant, endpoint or identity-model change
- `mustState` for "Clew" where the document contains a risk register table
- `pairing` between "penetration testing" and a named approver or schedule
- `mustState` for an incident containment procedure where the document accepts a device-loss risk
- `mustState` for a third-party assessment where the document names a supplier that delivers executable content
- `mustState` for data residency where the document names a cloud service

Add them with the adjacency guards the register already uses, and test each against both this design and the superseded V1.6 before committing.
