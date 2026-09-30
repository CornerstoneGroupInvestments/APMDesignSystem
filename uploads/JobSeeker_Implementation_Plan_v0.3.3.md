# APM JobSeeker Kiosk — Implementation Plan v0.3.3

Companion playbook to the V0.3 Detailed Design and the V0.1 Effort Estimate spreadsheet. Read top-to-bottom and execute. Each work package has a prerequisites block, a numbered procedure, validation steps, and references to the DD section it implements.

**Document basis:** JobSeeker_Detailed Design_V0.3.docx; JobSeeker_DD_Implementation_Effort_v0.1.xlsx.
**Target audience:** single senior platform/infrastructure resource executing the build.
**Source of truth for design decisions:** the DD V0.3. If this playbook and the DD disagree, the DD wins; raise a defect against this playbook.

### Version history

| Version | Date | Summary |
|---|---|---|
| v0.1 | 2026-05-04 | Initial draft based on DD V0.2 and Effort Estimate v0.1. |
| v0.2 | 2026-05-21 | Cyber approval framing (§0.6) added. Phase 2 split into 2A (APPROVED) and 2B (BLOCKED pending network design). |
| v0.3 | 2026-05-25 | Re-aligned Intune profile target population to DD §4.3 (7 of 10 profiles re-assigned to AVD session host group); added `SG-APM-AVD-SessionHosts` (WP-1.1) and session-host Intune-enrolment toggle (WP-2.9, WP-2.10); aligned UPN format and CA policy set to DD §5.1.1 and §6.2 (six CA policies, 12-hour sign-in frequency, target apps restricted to the three AVD apps); split WP-1.3 into two compliance policies (thin client + session host); fixed Windows App AUMID; fixed session disconnect timer (5 min → 1 min); hardened the WP-1.8 PR script; physically moved WP-1.6 into Phase 2B; re-estimated Phase 4 reactive support; added HRW DR coverage and missing alerts; closed F-19; applied all P2 and P3 remediations from `/scope/findings.md` and `/scope/findings-v0.3.md`. |
| v0.3.1 | 2026-05-27 | Added **WP-2.0a — Resource group and RBAC scaffold** as the first work package in Phase 2A (explicit RG creation procedure that v0.3 left implicit; covers tags, RBAC for implementer / APM platform / Nerdio MI, CanNotDelete lock, sensitivity label, and NME Linked Resource Group registration). Rewrote WP-2.9 against the current Nerdio Manager for Enterprise UI, corrected three DD-divergence defects (Desktop Experience to `Single User Desktop (Pooled)`, Max session limit from 8 to 1, RDP properties expanded with `redirectprinters:i:1;drivestoredirect:s:USB`), and annotated every WP-2.9 step with cyber-approval status (APPROVED / MIXED / UNAPPROVED-IF-EXECUTED) inline so the build-now vs build-later boundary is unambiguous at execution time. Added a "Quick reference — what would push WP-2.9 into UNAPPROVED territory" callout. Specified the marketplace placeholder image for WP-2.9 Step 3 because NME's host pool form requires a Desktop Image reference at create time (the image is referenced, not deployed; swapped to the WP-2.10 custom golden image once captured). No findings beyond F-01..F-40 introduced. |
| v0.3.2 | 2026-05-27 | Fixed three CA-policy defects in WP-1.4: (1) `CA-APM-Kiosk-DeviceBound` filter direction was wrong (Include kiosks + Block would have blocked legitimate kiosks); changed to Exclude filtered devices + Block, so non-kiosks are blocked and kiosks fall through. (2) `CA-APM-Kiosk-RequireCompliantDevice` added an Include filter scoped to kiosks so it stops re-evaluating the non-kiosks that DeviceBound has already blocked; rewrote its Gotcha to correct an error from v0.3 that said this policy evaluates the session host (it evaluates the client thin client). (3) Fixed the related Gotcha in WP-2.13 — session-host Intune enrolment still matters but for Intune profile delivery and `CMP-APM-AVD-SessionHosts` evidence, not for CA-RequireCompliantDevice. With Fix 1 and Fix 2 the two policies are no longer redundant: DeviceBound is the identity gate (right kind of device), RequireCompliantDevice is the state gate (kiosk is currently healthy). Raised DD V0.4 defect against Tables 53 and 56 (duplicate policy definitions). |
| v0.3.3 | 2026-06-10 | Applied all Critical and Major findings from `scope/review-v0.3.2.md`, grounded in the June 3-9 production build of WP-2.10 and WP-1.7 Profile 5 field testing. **WP-1.7 Profile 5 (Shell Launcher):** corrected the Windows App AUMID to the field-confirmed `MicrosoftCorporationII.Windows365_8wekyb3d8bbwe!Windows365` (the v0.3 "fix" was itself stale); fixed the `ID` → `Id` attribute case bug in all four XML locations (XSD requires `Id`; profile binding silently fails with `ID`); added the `V2:AppType="UWP"` attribute and 2019 v2 namespace required for UWP shells; added the `Client-EmbeddedShellLauncher` optional-feature prerequisite (Intune Platform Script `Enable-ShellLauncherFeature.ps1`). **WP-1.7:** added Profile 11 (Settings Catalog time-zone profile for session hosts — win11-24h2-avd resets TZ to UTC during OOBE specialize, so image-level TZ does not survive). **WP-2.10:** corrected the image capture flag (`--managed-image` → `--virtual-machine`); added the APM management-group policy requirements to all `az vm create` commands (mandatory tags `enableupdate`/`update-stage`/`backup` with policy-allowed values, plus `--encryption-at-host`); added `--computer-name` overrides for VM names exceeding the Windows 15-character hostname limit; added Nerdio prerequisites (Azure Compute Gallery deployment mode for TrustedLaunch images; NME default VM tags); corrected the default-image navigation to Auto-scale → Desktop Image (Template); cross-referenced the CLI-only execution record and the `outputs/golden-image-build/` rebuild bundle. **WP-1.6/WP-2.5/WP-2.6:** replaced the declined tenant-wide Graph permissions with the APM IAM-approved least-privilege set (`User.ReadWrite.All` AU-scoped to `AU-APM-Kiosk`, `GroupMember.ReadWrite.All`, `GroupMember.Read.All`) per Permission Requirements v0.2. **WP-1.0:** corrected the session-host capacity estimate to the single-session model (one host per concurrent session; the 517/8 arithmetic was stale). **WP-5.1/WP-5.3/WP-5.4/WP-5.5:** DR and runbook VM-creation paths annotated with the mandatory APM tags; patching cycle re-pointed at the scripted rebuild bundle; fixed the three-vs-seven failure mode contradiction; corrected duplicate ISM control numbers in the RFFR map; added the AU-scoped least-privilege model to the evidence pack. Minor fixes N-1 to N-9 per the review. |

---

## 0. Conventions and prerequisites

### 0.1 Conventions used in this document

- **Portal nav** uses breadcrumbs: `Intune admin centre → Devices → Compliance policies → Create policy`.
- **PowerShell** uses the Microsoft Graph PowerShell SDK v2. Code blocks are runnable as-is once the placeholders (in `{curlies}`) are substituted.
- **Placeholders** use this format: `{tenantId}`, `{siteCode}`, `{appId}`. Every placeholder is listed in §0.3.
- **Validation steps** confirm a step worked. Every numbered step has at least one validation check before moving on.
- **Gotchas** call out the specific traps the DD or our prior runs flagged. Read these.
- **References** point to the DD section, the Microsoft Learn topic, and any implementer reference doc that justifies the step.

### 0.2 Global prerequisites before starting Phase 1

Before any work in this playbook starts, confirm the following exist in the APM tenant:

| Item | How to confirm | Owner if missing |
|---|---|---|
| Global Administrator or Privileged Role Administrator role for the executor (you) | `Get-MgUser -UserId (Get-MgContext).Account \| Select-Object -ExpandProperty Id` then `Get-MgUserMemberOf -UserId <yourId>` and check for role membership | APM IAM team |
| Intune service is licensed and operational (P1 minimum) | `Intune admin centre → Tenant administration → Tenant status` shows Healthy | APM licensing |
| Azure subscription with Contributor for the resource group hosting Key Vault, Function App, Automation Account | Azure portal → Subscriptions → IAM → confirm role assignment | APM Azure platform team |
| ExchangeOnlineManagement PowerShell module installed (only needed if you re-scope app policies) | `Get-Module -ListAvailable ExchangeOnlineManagement` | Install with `Install-Module ExchangeOnlineManagement -Scope CurrentUser` |
| Microsoft Graph PowerShell SDK v2 installed | `Get-Module -ListAvailable Microsoft.Graph` and confirm version 2.x | Install with `Install-Module Microsoft.Graph -Scope CurrentUser` |
| Sufficient Conditional Access licences (Entra ID P1 or P2) for all kiosk users | `Intune admin centre → Tenant administration → Tenant status → Connector status → Entra ID licensing` | APM licensing |
| Pilot device hardware in hand (5-10 units) — Dell thin clients with TPM 2.0 and UEFI per DD §5.1.1 | Physical confirmation | the device-prep partner |
| Access to a Windows 11 IoT Enterprise install media | Microsoft Volume Licensing Service Center | APM licensing |
| the device-prep partner process for hardware hash export agreed | Email confirmation from the device-prep partner lead | APM operations + the device-prep partner |
| Break-glass administrator accounts exist and are excluded from any blanket CA policy | `Get-MgGroup -Filter "DisplayName eq 'SG-BreakGlass-Admins'"` | APM IAM (must exist before WP-1.4) |

### 0.3 Placeholder register

| Placeholder | What it is | Example value | Where used |
|---|---|---|---|
| `{tenantId}` | APM's Entra tenant ID (GUID) | `12345678-...` | Throughout |
| `{siteCode}` | APM-defined site code, one per site (length and format set by APM at WP-1.0; DD example is 4-char alphanumeric) | `U718` | WP-1.5 device naming |
| `{kioskId}` | Per-site sequential kiosk identifier, 2-digit zero-padded (allocation method confirmed at WP-1.0; default is sequential 01-99) | `01` | WP-1.5 device naming |
| `{kioskFleetRG}` | Resource group hosting all kiosk infrastructure | `auea-rg-avd-ctrl-kiosk-001` (CONFIRMED in production June 2026; pre-v0.3.3 drafts used an illustrative placeholder name — all commands in this plan now use the confirmed name) | Phase 2 |
| `{keyVaultName}` | Key Vault name | `kv-apm-kiosk` | Phase 2 |
| `{credentialProxyAppId}` | Credential Proxy Function App AppId | (issued at WP-2.4) | Phase 2 |
| `{automationAccountName}` | Azure Automation Account name | `aa-apm-kiosk` | Phase 2B (originally WP-1.6) |
| `{hybridWorkerVmName}` | Existing shared-services VM that will host the Hybrid Runbook Worker | `vm-shared-001` | Phase 2B |
| `{autopilotProfileId}` | Autopilot deployment profile object id (issued at WP-1.5) | (GUID) | WP-1.4 |
| `{kioskUsersGroupId}` | Object id of SG-APM-Kiosk-Users (issued at WP-1.1) | (GUID) | Throughout |
| `{sessionHostGroupId}` | Object id of SG-APM-AVD-SessionHosts (issued at WP-1.1) | (GUID) | WP-1.3, WP-1.7, WP-2.9, WP-2.10, WP-2.13 |
| `{kioskUpnPrefix}` | UPN namespace prefix per DD §5.1.1 paragraph 185 | `kiosk-` (lowercase, hyphen-terminated; fixed by DD) | WP-1.6, WP-2.5, WP-2.6, WP-5.2 KQL |
| `{kioskUpnDomain}` | UPN domain suffix per DD §5.1.1 paragraph 185 | `apm.net.au` (confirm at WP-1.0 that this is a verified Entra domain) | WP-1.6, WP-2.5, WP-2.6 |
| `{sessionHostNamePrefix}` | Nerdio host-pool VM naming prefix; drives the SG-APM-AVD-SessionHosts dynamic membership rule (if dynamic). Confirm at WP-1.0. | `HP-APM-Kiosk-` (Nerdio default) | WP-1.1, WP-2.9 |
| `{credentialProxyUrl}` | FQDN of the Credential Proxy Function App | `func-apm-cred-proxy.azurewebsites.net` (or the private DNS name once private endpoints are deployed) | WP-1.8, WP-2.4, WP-2.7 |

**Device name template (DD V0.3 §6.1.5):** `KI-APM-{siteCode}-{kioskId}` (example: `KI-APM-U718-01`). The `KI-APM-` prefix is a fixed literal, not a placeholder. Naming is enforced via an Intune device rename script during Autopilot provisioning. Dynamic device groups filter on the `KI-APM-` prefix.

**Kiosk UPN template (DD V0.3 §5.1.1 paragraph 185):** `{kioskUpnPrefix}{serial}@{kioskUpnDomain}` (example: `kiosk-XPYCK14@apm.net.au`). The `kiosk-` prefix is load-bearing per DD §5.1.1 paragraph 189 — it gives namespace separation that drives filtering, dynamic groups, CA targeting and identity governance reporting. Do not strip the prefix; do not use the `apm.onmicrosoft.com` namespace (v0.2 used `apm.onmicrosoft.com`, which was a plan-side defect now corrected).

### 0.4 Parallel execution opportunities

The 50-day estimate assumes sequential execution. If you parallelise where dependencies allow, elapsed time compresses to about 8-10 weeks. The parallelisable threads are:

- Phase 1 WP-1.1, WP-1.2 can both start day 1. (WP-1.6 has been moved to Phase 2B per the cyber sign-off, see §0.6.)
- Phase 1 WP-1.4 (Conditional Access) and WP-1.7 (Intune configuration profiles) can run in parallel after WP-1.1 lands.
- Phase 2B credential-management infrastructure (Key Vault, Function App, Hybrid Runbook Worker, runbooks) is sequentially dependent. Do not parallelise within Phase 2B. **(WP-1.6 Automation Account was carved out and approved/created 2026-06-11, ahead of the rest of 2B — see §0.6.)**
- Phase 2A network-free AVD work (host pool definitions, golden image build, scaling logic) can run in parallel with the Phase 1 Conditional Access and Intune work.

### 0.5 Ordering note — Rotation Password Proactive Remediation

The original Excel had WP-1.9 (Rotation Password PR script) entirely in Phase 1. Correct ordering:

- **Phase 1 — WP-1.8** drafts and unit-tests the PowerShell detection + remediation script standalone. The script is APPROVED for draft-only per cyber item 2; the script is not assigned to any real device at this point.
- **Phase 2B — WP-2.7** (end-to-end rotation cycle test) integrates the script with the Credential Proxy Function App and runs the full flow against pilot devices.

Do not attempt to assign the PR to a real device until WP-2.7 completes successfully and cyber explicitly unblocks Phase 2B.

### 0.6 Build approval status (cyber sign-off, 2026-05-21)

APM cyber has approved a partial build scope and explicitly blocked the remainder pending a finalised network design. Until the blocked items are unblocked, the project team must not deploy the corresponding infrastructure or run the corresponding runbooks. The verbatim approval text from the cyber sign-off email is included below for traceability.

#### Approval text (verbatim)

> Sending out cyber's approval to proceed with the building of the AVD for these specific sections as detailed in the email below:
>
> 1. Approval to create the Entra ID groups, kiosk user model, default-deny F3 licensing template and all listed Conditional Access policies in report-only mode.
> 2. Approval to create the Intune Autopilot profile, configuration profiles, compliance policies, Windows App deployment and Proactive Remediations as listed.
> 3. Approval to stand up the AVD workspace (only the definitions), host pools (only the definitions and logic) application group, golden image and Nerdio configuration (logic only).
>
> The following has Not Approved to Proceed:
>
> 4. Deploy the Automation Account, runbooks, Key Vault and Credential Proxy Function App with temporary public endpoints, with the explicit commitment that they will be re-platformed to private endpoints before production credentials are issued.
>
> This is a workaround in place to align with project timelines, with the explicit understanding that no networking configurations/building can begin until a network design is finalised and approved.

#### What this means in practice

- **APPROVED scope** (items 1, 2, 3) can be built now. CA policies must remain in **report-only mode** until cyber re-approves enforcement. AVD components are limited to definitions and logic; no actual session host deployment until the network design lands and item 4 unblocks.
- **BLOCKED scope** (item 4) covers the entire credential pipeline (Automation Account, runbooks, Key Vault, Credential Proxy Function App, Hybrid Runbook Worker) and all network architecture work. The proposed public-endpoint workaround has been rejected. No deployment of any blocked component can start until APM signs off the finalised network design.
- **Per-device kiosk users** depend on the (blocked) credential runbooks. The Entra group structure and the F3 licensing template can be built now; actual kiosk user account creation (per-device password, Key Vault secret, lock screen image refresh) waits for the runbooks. For pilot test cases that need a real user, create one or two manually under the approved licensing template and document the exception.

#### Approval-to-WP map

| WP | Status | Why |
|---|---|---|
| WP-1.0 Inputs from APM | APPROVED | Information gathering only |
| WP-1.1 Entra ID groups | APPROVED | Item 1 |
| WP-1.2 Sensitivity label | APPROVED | Information classification, no infra impact (treat as approved by silence; confirm if challenged) |
| WP-1.3 Intune compliance policy | APPROVED | Item 2 |
| WP-1.4 Conditional Access policies | APPROVED (report-only) | Item 1 — **must stay in report-only until cyber re-approves enforcement**. Do not flip to On. |
| WP-1.5 Autopilot self-deploying profile | APPROVED | Item 2 |
| **WP-1.6 Azure Automation Account + initial UPN runbook** | **APPROVED (2026-06-11)** | Cyber carved the Automation Account out of item 4 and approved it; **created `aa-apm-kiosk`, implementer as Owner**. The AA is a cloud resource and the starter runbook uses Graph in the Azure sandbox, so it needs no network. The production runbooks that build on it (WP-2.5/2.6) and the HRW (WP-2.8) remain BLOCKED — they need Key Vault + the VNet. |
| WP-1.7 Intune configuration profiles | APPROVED | Item 2 — all 11 profiles (Profile 11 time zone added in v0.3.3). Nine now target `SG-APM-AVD-SessionHosts` (Office, in-session Assigned Access lockdown, session timers, lock, Edge, favourites, Office 365 web, profile cleanup, time zone) per DD §4.3. Profiles 5 (Shell Launcher v2) and 10 (Rotation PR) target the thin-client group. Profile 2 (Assigned Access, in-session lockdown) restored per the 2026-06-10 drift review — the earlier "skipped" status conflated it with the thin-client shell control. |
| WP-1.8 Rotation Password PR script (draft only) | APPROVED | Item 2 — script drafted and unit-tested in isolation. **Do not assign to any real device** until WP-2.7 unblocks. |
| WP-2.0a Resource group and RBAC scaffold | APPROVED | Required prerequisite for item 3 (workspace, host pool, app group, golden image cannot exist without an RG). Empty RG is not what item 4 blocks. |
| **WP-2.1 Network architecture** | **BLOCKED** | Item 4 footnote — no networking config until design is finalised |
| **WP-2.2 DNS architecture** | **BLOCKED** | Item 4 footnote |
| **WP-2.3 Key Vault** | **BLOCKED** | Item 4 |
| **WP-2.4 Credential Proxy Function App** | **BLOCKED** | Item 4 |
| **WP-2.5 Full Kiosk User Account Creation runbook** | **BLOCKED** | Item 4 |
| **WP-2.6 Kiosk User Password Rotation runbook** | **BLOCKED** | Item 4 |
| **WP-2.7 End-to-end rotation cycle test** | **BLOCKED** | Item 4 |
| **WP-2.8 Hybrid Runbook Worker** | **BLOCKED** | Item 4 |
| WP-2.9 Nerdio + AVD host pool (definitions only) | APPROVED (definitions and logic only) | Item 3 — define host pool, application group, workspace. **Do not deploy session host VMs** until network unblocks. |
| WP-2.10 AVD Golden image | APPROVED | Item 3 — golden image build is permitted. Will need a transient build VNet; coordinate with item 4 timing. |
| WP-2.11 Nerdio auto-scaling | APPROVED (logic only) | Item 3 — define scaling rules; cannot exercise without session hosts |
| WP-2.12 Single-session enforcement | APPROVED (definitions only) | Item 3 — RDP property at host pool level; cannot validate without session hosts |
| WP-2.13 AVD application group permissions | APPROVED | Item 3 |
| WP-2.14 Office hardening (web-only) | APPROVED | Image-level setting, part of item 3 |
| **WP-2.15 Zscaler outbound integration** | **BLOCKED** | Item 4 footnote — networking |
| **WP-3.1 Site network coordination** | **BLOCKED** | Networking + depends on pilot readiness |
| **WP-3.2 Pilot deployment** | **BLOCKED** | Requires credentials (item 4) and physical network |
| **WP-3.3 Layer 1-4 enforcement validation** | **PARTIALLY BLOCKED** | Layers 1-2 may be partially validated in report-only against any AVD endpoint with a temporary kiosk user; Layers 3-4 require provisioned pilot kiosks and a live session host (gated on Phase 2B unblock). |
| **WP-3.4 Penetration testing coordination** | **BLOCKED** | Requires pilot devices |
| WP-3.5 National rollout escalation support framework | APPROVED (preparation only) | Documentation and process design can proceed; execution waits |
| **WP-4.1 Rollout monitoring and escalation support** | **BLOCKED** | Phase 4 cannot start until Phase 3 unblocks |
| **WP-5.x Operational handover (DR, monitoring, patching, runbooks, RFFR pack, handover)** | **BLOCKED** | Phase 5 cannot start until Phase 2-4 are operational |

#### CA report-only gate (item 1 qualifier)

Item 1 approves the kiosk CA policies **in report-only mode** (six at sign-off; five after the 2026-06-11 removal of the inert WebOnly-Office policy). The plan currently includes a "flip from report-only to On" step (WP-1.4 step 7). That step is **not approved by this sign-off**. Until cyber explicitly approves enforcement, leave all five policies in report-only. Capture report-only sign-in log evidence and brief cyber when the policies are ready for the enforcement flip.

#### Phase reorganisation applied in v0.3

To make the build-now vs build-later boundary unambiguous, Phase 2 is split into two physical sections in this version:

- **Phase 2A (APPROVED, ready to start)**: WP-2.9 (definitions), WP-2.10 (image), WP-2.11 (scaling logic), WP-2.12 (definitions), WP-2.13, WP-2.14.
- **Phase 2B**: WP-2.1, WP-2.2, WP-2.3, WP-2.4, WP-2.5, WP-2.6, WP-2.7, WP-2.8, WP-2.15 remain BLOCKED awaiting network design + cyber re-approval. **WP-1.6 (Automation Account) was carved out and APPROVED/created 2026-06-11** — the AA needs no network; the production runbooks and HRW that depend on it stay blocked.

Phase 2A is approximately 6 days of work. Phase 2B is approximately 11 days (10 days original + 0.5 d WP-1.6 + 0.5 d for the Option A Function-key design that F-04 surfaced) and cannot start until network design lands.

---

## Phase 1 — Thin Client Foundation

**Effort:** ~11.5 days single resource under cyber approval (WP-1.6 relocated to Phase 2B). Up from v0.2's 10.5 d due to v0.3 scope adjustments: WP-1.3 split into two compliance policies (+0.5 d), WP-1.4 adds three additional CA policies (+0.5 d).
**Phase status:** APPROVED with one exception — WP-1.6 (Azure Automation Account) is BLOCKED per cyber item 4. CA policies under WP-1.4 must remain in **report-only** mode until cyber re-approves enforcement.
**Phase checkbox:** [ ] Phase 1 complete (all approved WPs done; WP-1.6 remains blocked).
**Outcome:** all identity, policy, and Intune scaffolding in place such that a Windows 11 IoT Enterprise device, when registered in Autopilot under the APM-Kiosk-SelfDeploying profile, self-provisions into a locked-down kiosk shell ready to authenticate to AVD — with Conditional Access enforcing device-bound access at sign-in (initially in report-only).

Order of execution below is the recommended sequential path. See §0.4 for the parallel option.

### WP-1.0 — Inputs from APM (0.5 d)

**Status:** APPROVED. [ ] Complete.

**Purpose.** Gather every APM-side input the rest of Phase 1 depends on, before any implementer-side work starts. Going to Phase 1.1 without these forces re-work.

**Prerequisites.**
- Project kick-off complete; APM project lead identified.

**Procedure.**

1. Send APM project lead the following request email (template at the end of this WP). Set a target turnaround of 5 business days.

2. Capture in `./inputs/apm-inputs.md`:
   - **Branding kit** — APM JobSeeker brand colours (RGB hex) and any logo assets approved for kiosk lock screen and AVD desktop.
   - **Bookmark list** — every URL that must appear in managed Edge favourites. Confirm whether `Workforce Australia portal` and `MyGov` are mandatory.
   - **Decision register** — confirm any open decisions in DD V0.3 §4.3 are now closed. The ones to chase explicitly are: (a) does APM want to enable USB storage exception per DD §6.2.4; (b) does APM want printing enabled per DD §6.2.3; (c) which CA policies should also block legacy authentication (default yes); (d) confirm Premium Per User is acceptable for any future sub-hourly refresh need.
   - **APM AVD environment confirmation** — the existing host pool name, location, and the Entra group that grants AVD application group access. The DD references `HP-APM-Kiosk` as the new host pool; confirm there is no naming collision. Also confirm whether APM's existing staff AVD host pool is currently Intune-enrolled (the kiosk pool will need to be — see WP-2.9), and what session-host VM naming prefix Nerdio is configured to use (drives the `SG-APM-AVD-SessionHosts` dynamic-membership rule).
   - **Tenant identifiers** — `{tenantId}`, primary domain (e.g. `apm.com.au`).
   - **UPN domain confirmation** — the DD specifies kiosk UPNs as `kiosk-{serial}@apm.net.au`. Confirm `apm.net.au` is a verified Entra domain in the tenant. If only `apm.com.au` or `apm.onmicrosoft.com` are verified, raise as a Phase 1 prerequisite to add `apm.net.au` (DNS TXT verification, allow 24-48 hours). The plan v0.2 used `apm.onmicrosoft.com` as a workaround; v0.3 corrects to the DD form. Do not start WP-2.5 user-creation work until this is verified.
   - **Windows 11 IoT Enterprise channel** — SAC (Semi-Annual Channel, regular feature updates) or LTSC (Long-Term Servicing Channel, no feature updates, 10-year support). Drives the WP-5.3 patching ring configuration. APM volume licensing typically includes both options. The Workforce Australia operating posture favours LTSC for kiosk stability.
   - **Intune device count licensing** — kiosk fleet adds ~517 thin clients plus the AVD session host fleet to Intune. The design enforces **single-session** (one session host per concurrent kiosk session, DD §5.1.4 Table 22 / WP-2.12) — at theoretical peak (every kiosk in simultaneous use) this is up to ~517 session hosts, not the 65 that the earlier 8-sessions-per-host arithmetic implied. Nerdio auto-scaling (WP-2.11) provisions hosts against actual concurrency, so standing capacity is far lower; the licensing and budget question is the **expected peak concurrency**, which APM must confirm here at WP-1.0 (what fraction of 517 kiosks are simultaneously active in the busiest hour). Confirm APM's Intune licensing tier absorbs the combined device count at the confirmed concurrency ceiling.
   - **Compliance policy scope** — v0.3 ships two compliance policies (thin client + session host) per DD §6.2. Confirm `CMP-APM-AVD-SessionHosts` (Windows Server-flavoured controls) and `Compliance-APM-Kiosk-W11IoT` (BitLocker / Secure Boot / TPM on the physical hardware) is the right split.
   - **Site list and site codes** — for every APM site in the rollout: site name, address, and the `{siteCode}` (the alphanumeric site identifier that goes into the device name per DD §6.1.5, e.g. `U718`). Confirm format (length, character set). The DD example is 4-char alphanumeric. The DD says ~517 devices but doesn't list sites.
   - **24-hour site operating hours** — are any of the 517 Workforce Australia sites 24-hour operations? Drives the WP-2.11 burst-delete schedule and minimum host pool capacity. If any sites are 24h, the burst delete window narrows and minimum active capacity needs to be set above 1.
   - **Kiosk ID allocation** — confirm how `{kioskId}` (the per-site sequential identifier in `KI-APM-{siteCode}-{kioskId}`) is allocated. Default assumption: 2-digit zero-padded sequence (01-99) per site, allocated by the Intune device rename script via a shared counter in Azure Table Storage. Confirm with APM before WP-1.5.
   - **Dell thin client service tag length** — confirm the typical Dell service-tag length for the kiosk SKU. The 15-character NetBIOS device-name limit means the `KI-APM-{siteCode}-{kioskId}` form caps the combined tail at 8 characters. Dell thin-client service tags are typically 7 characters (e.g. XPYCK14), which fits, but the rename script must handle a longer tag if encountered. Confirm before WP-1.5.
   - **MDE / EDR coverage on AVD session hosts** — DD §7 does not say MDE is out of scope. Confirm with APM whether their M365 licensing covers MDE for the AVD session hosts. If not, capture the residual risk decision (document EDR-absence acceptance, or budget MDE add-on licensing). RFFR auditors will look for EDR coverage on endpoints handling PII.
   - **the device-prep partner contact** — named contact for the device prep workflow including hardware-hash export.

3. Validate APM has confirmed all items above. Do not start WP-1.1 with any item still TBC; document any TBC items as a risk in the project register.

**Validation.**
- File `apm-inputs.md` exists and every section has content (no `TBC` markers).
- APM project lead confirms by email.

**References.** DD V0.3 §4 Business Architecture; DD V0.3 §6.1.5 Naming Convention.

**Request email template.**

```
Subject: APM JobSeeker Kiosk build — inputs needed by {date+5bd}

Hi {APM lead},

Before we start the kiosk build, I need the following from APM. Most are
quick confirmations; the bookmark list and site list will need a few
minutes of input from your team.

1. Brand assets — APM job seeker portal colours (hex), any logo file you
   want on the lock screen and the AVD desktop.

2. Bookmark list — every URL that must appear as a managed Edge favourite
   in the AVD session. Workforce Australia and MyGov are assumed
   mandatory; please confirm and add anything else.

3. Open decisions from the V0.3 DD:
   - USB storage exception enabled? (DD §6.2.4)
   - Printing enabled? (DD §6.2.3)
   - Block legacy authentication on the kiosk CA policies? (default yes)
   - Premium Per User accepted as a future option if sub-hourly refresh
     needed? (default yes)
   - Two compliance policies (thin client + session host) vs one — DD
     §6.2 describes one (session host); v0.3 of the plan ships two for
     defence in depth on the physical Win11 IoT hardware. Confirm.

4. AVD environment:
   - Existing host pool name we should target. Confirm no naming
     collision with `HP-APM-Kiosk`.
   - Is APM's existing staff AVD host pool Intune-enrolled? The kiosk
     pool needs to be (see DD §4.3); if your staff pool is not, this is
     a small platform-side decision before WP-2.9.
   - The Nerdio session-host VM naming prefix. Drives the dynamic-group
     rule for `SG-APM-AVD-SessionHosts`. Default Nerdio is
     `HP-APM-Kiosk-` (i.e. `HP-APM-Kiosk-001`, `-002` etc.).

5. Identity:
   - Tenant ID GUID, primary domain.
   - Verify `apm.net.au` is a verified Entra domain in the tenant.
     The DD §5.1.1 specifies kiosk UPNs as `kiosk-{serial}@apm.net.au`.
     If `apm.net.au` is not verified, please add it before Phase 2B
     unblocks (DNS TXT verification, 24-48 hours).
   - Confirm Intune licensing absorbs ~517 thin clients plus the AVD
     session host fleet (single-session design: one host per concurrent
     session, up to ~517 at theoretical peak — please confirm expected
     peak concurrency so we can size standing capacity and licensing).
   - Confirm whether APM M365 licensing extends Microsoft Defender for
     Endpoint to AVD session hosts. If not, we will document the
     residual EDR-absence risk for RFFR.

6. Device naming — per DD §6.1.5 the device name format is
   `KI-APM-[SITECODE]-[ID]` (e.g. `KI-APM-U718-01`). Please provide:
   - The full site list (site name, address, site code) for the
     rollout, approximately 517 devices.
   - Which of those sites operate 24-hour (drives AVD burst-delete
     scheduling).
   - The site code format (length, character set; the DD example
     "U718" is 4-character alphanumeric).
   - The kiosk ID allocation method — we propose 2-digit zero-padded
     sequence per site (01-99), allocated by the Intune device rename
     script via Azure Table Storage. Confirm or specify your preference.
   - The typical Dell service-tag length for the kiosk SKU (the
     15-character NetBIOS name limit means we cap the device tail at
     8 characters; Dell thin-client service tags are typically 7).

7. Patching:
   - Windows 11 IoT Enterprise channel — SAC or LTSC. Drives the
     WP-5.3 WUfB configuration.

8. the device-prep partner point of contact for the hardware-hash export workflow.

Five business days would be ideal so we can start the build on
{start date}.

Thanks,
{your name}
```

---

### WP-1.1 — Entra ID groups (0.5 d)

**Status:** APPROVED (cyber item 1). [ ] Complete.

**Purpose.** Establish the three security groups that drive every assignment in Phase 1 and beyond.

**Prerequisites.**
- `{tenantId}` confirmed.
- Microsoft Graph PowerShell SDK v2 installed.

**Procedure.**

1. Connect to Microsoft Graph with the right scopes:

```powershell
# Group.Create covers the New-MgGroup calls in this WP; GroupMember.ReadWrite.All
# covers member management. The broader Group.ReadWrite.All / Directory.Read.All
# pair from earlier drafts was declined by APM IAM (June 2026) — see Permission
# Requirements v0.2 for the approved least-privilege model.
Connect-MgGraph -Scopes "Group.Create", "GroupMember.ReadWrite.All" -NoWelcome
Get-MgContext  # confirm correct tenant and account
```

2. Create the four security groups (three assigned, one for session hosts):

```powershell
$kioskUsers = New-MgGroup `
    -DisplayName "SG-APM-Kiosk-Users" `
    -MailEnabled:$false `
    -MailNickname "SG-APM-Kiosk-Users" `
    -SecurityEnabled:$true `
    -Description "Kiosk user accounts. Assignment of CA policies, AVD application group, kiosk-user-specific controls. Membership is managed by the Kiosk User Account Creation runbook (Phase 2B)."

$kioskCAExclusion = New-MgGroup `
    -DisplayName "SG-APM-Kiosk-CA-Exclusion" `
    -MailEnabled:$false `
    -MailNickname "SG-APM-Kiosk-CA-Exclusion" `
    -SecurityEnabled:$true `
    -Description "Temporary exclusion group for kiosk users during incidents. Members are exempt from CA-APM-Kiosk-DeviceBound, BlockNonWindows, BlockWebClient, BlockExchangeOnline and BlockTeams. Membership must be reviewed weekly; expected to be empty in steady state."

$kioskAdmins = New-MgGroup `
    -DisplayName "SG-APM-Kiosk-Admins" `
    -MailEnabled:$false `
    -MailNickname "SG-APM-Kiosk-Admins" `
    -SecurityEnabled:$true `
    -Description "Implementation team and APM administrators authorised to manage the kiosk fleet. Used for Intune RBAC and Azure resource access."

# New in v0.3: session-host group for the Intune profiles that target the AVD session-host
# VM, not the physical kiosk. Per DD §4.3 paragraph 123 and Table 50.
# AS-BUILT 2026-06-11: created as a DYNAMIC device group keyed on the Nerdio session-host
# VM name prefix "HP-Kiosk-" (set in NME host pool VM naming). Hosts join the group
# automatically at provisioning; no manual membership. COUPLING: if the NME VM name prefix
# ever changes, this rule must change with it or new hosts silently receive no profiles.
# Dynamic evaluation adds a few minutes' lag between Entra join and profile targeting.
$sessionHosts = New-MgGroup `
    -DisplayName "SG-APM-AVD-SessionHosts" `
    -MailEnabled:$false `
    -MailNickname "SG-APM-AVD-SessionHosts" `
    -SecurityEnabled:$true `
    -GroupTypes @("DynamicMembership") `
    -MembershipRule 'device.displayName -startsWith "HP-Kiosk-"' `
    -MembershipRuleProcessingState "On" `
    -Description "AVD session host devices (Entra-joined and Intune-enrolled). DYNAMIC: device name starts with HP-Kiosk- (Nerdio VM name prefix — keep in sync with NME host pool VM naming). Target for the seven active session-host Intune profiles and the CMP-APM-AVD-SessionHosts compliance policy."
```

3. Capture the object IDs into the placeholder register:

```powershell
@{
    KioskUsersGroupId         = $kioskUsers.Id
    KioskCAExclusionGroupId   = $kioskCAExclusion.Id
    KioskAdminsGroupId        = $kioskAdmins.Id
    SessionHostGroupId        = $sessionHosts.Id
} | ConvertTo-Json | Out-File ./inputs/group-ids.json
```

4. Add yourself plus the APM project lead to `SG-APM-Kiosk-Admins`:

```powershell
$you = Get-MgUser -UserId (Get-MgContext).Account
$apmLead = Get-MgUser -Filter "userPrincipalName eq '{apmLeadUPN}'"
New-MgGroupMember -GroupId $kioskAdmins.Id -DirectoryObjectId $you.Id
New-MgGroupMember -GroupId $kioskAdmins.Id -DirectoryObjectId $apmLead.Id
```

5. Decide membership model for `SG-APM-AVD-SessionHosts`:

The session-host group can be populated by one of two mechanisms. The choice depends on WP-1.0 input 4 (Nerdio session-host VM naming prefix).

- **Option (a) — assigned.** Nerdio's session-host provisioning script adds each new host to the group via Graph (`POST /groups/{id}/members/$ref`) at provisioning time. Pros: works regardless of host naming. Cons: dependency on Nerdio scripting. This is the default for v0.3 because the Nerdio prefix is a WP-1.0 input that may not be confirmed at this stage.
- **Option (b) — dynamic.** Membership rule on device display name, e.g. `(device.displayName -startsWith "{sessionHostNamePrefix}") -and (device.deviceOSType -eq "Windows")`. Pros: zero scripting dependency. Cons: requires the Nerdio prefix to be locked.

If WP-1.0 has confirmed the Nerdio prefix, prefer option (b):

```powershell
# Option (b) only — uncomment and run if WP-1.0 confirms the prefix.
# Update-MgGroup -GroupId $sessionHosts.Id `
#     -GroupTypes @("DynamicMembership") `
#     -MembershipRuleProcessingState "On" `
#     -MembershipRule "(device.displayName -startsWith ""{sessionHostNamePrefix}"") -and (device.deviceOSType -eq ""Windows"")"
```

Document the choice in `evidence/group-membership-model.md`.

**Validation.**
- `Get-MgGroup -Filter "displayName eq 'SG-APM-Kiosk-Users'"` returns one result.
- Repeat for the other three groups (`SG-APM-Kiosk-CA-Exclusion`, `SG-APM-Kiosk-Admins`, `SG-APM-AVD-SessionHosts`).
- File `group-ids.json` exists with four GUIDs.
- `SG-APM-AVD-SessionHosts` shows membership model matching the documented choice (assigned or dynamic).

**Gotchas.**
- Do not make `SG-APM-Kiosk-Users` a dynamic group. The kiosk user accounts are created with a specific UPN pattern (`kiosk-{serial}@apm.net.au`) which the user-creation runbook (WP-1.6, sequenced in Phase 2B) adds to `SG-APM-Kiosk-Users` directly. Dynamic membership rules would race with the runbook.
- `SG-APM-AVD-SessionHosts` is empty at Phase 1 close (no session hosts exist until WP-2.10). The group is created now so WP-1.7 profile assignments can reference its object ID. First members appear when WP-2.10 provisions the first session host.
- Group display names are referenced verbatim in CA policies, scripts, and runbooks downstream — do not rename without sweeping every reference. Use the `{kioskUsersGroupId}` / `{sessionHostGroupId}` placeholders in scripts; reserve literal names for display in the Entra admin centre.
- DD V0.3 §6.2 Table 50 names these groups without the `SG-` prefix (`APM-AVD-SessionHosts`, `APM-AVD-KioskUsers`, `APM-Autopilot-Kiosk-Devices`). v0.3 of this plan keeps the `SG-` prefix to match the existing `SG-APM-Kiosk-Admins` convention at APM. A DD V0.4 defect is raised in the Calibration Notes to align the DD names.

**References.** DD V0.3 §6.2 Identity and Access Control (Table 50); DD V0.3 §4.3 paragraph 123 (Intune profile scoping); graph-powershell-patterns skill.

---

### WP-1.2 — Sensitivity label (Purview) (1.0 d)

**Status:** APPROVED (information classification, no infra impact; treat as approved by silence). [ ] Complete.

**Purpose.** Apply the existing Internal sensitivity label to all kiosk-related Azure and M365 resources so DLP and export controls fire correctly.

**Prerequisites.**
- APM Purview is configured with at minimum an `Internal` (or equivalent) sensitivity label.
- You have Compliance Administrator or Sensitivity Label Administrator role.

**Procedure.**

1. Confirm the label exists:

```powershell
Connect-IPPSSession -UserPrincipalName {yourUPN}
Get-Label -Identity "Internal" | Format-List DisplayName,Name,Settings,Workload
```

If APM uses different naming (e.g. `APM-Internal`), substitute throughout.

2. Confirm the label policy already targets `SG-APM-Kiosk-Admins` (so project team admins can apply the label). If not, add the group:

```powershell
$policy = Get-LabelPolicy -Identity "APM-Standard-Labels"  # name TBC from APM
Set-LabelPolicy -Identity $policy.Identity -AddLabels "Internal" -AddPolicyMembers ("SG-APM-Kiosk-Admins")
```

3. Document the label mapping in `./inputs/sensitivity-label.md`:
   - Workspace label: Internal
   - Azure resources (`auea-rg-avd-ctrl-kiosk-001`): Internal (applied via tags in Phase 2 IaC)
   - Intune configuration profiles: not labelled (no resource-level sensitivity supported)
   - Log Analytics workspace: Internal

4. Confirm the label's protection settings include "Prevent export of underlying data to unlabelled files" (Purview UI: `Microsoft Purview → Information Protection → Labels → Internal → Edit label → Encryption / Content marking`).

**Validation.**
- `Get-Label -Identity "Internal"` returns the label with the expected settings.
- A test file labelled Internal cannot be exported to an unlabelled location (test from a non-admin user).

**Gotchas.**
- Some Purview policy operations take up to 24 hours to propagate. Do not block Phase 2 on Purview propagation.

**References.** DD V0.3 §6 Information & Data Architecture; Microsoft Learn — Microsoft Purview Information Protection.

---

### WP-1.3 — Intune compliance policies (1.0 d)

**Status:** APPROVED (cyber item 2). [ ] Complete.

**Purpose.** Define the two compliance baselines that `CA-APM-Kiosk-RequireCompliantDevice` (WP-1.4) evaluates: one for the physical Windows 11 IoT thin client, one for the AVD multi-session host. DD §6.2 names the session-host policy `CMP-APM-AVD-SessionHosts`; v0.3 of this plan adds a second policy `Compliance-APM-Kiosk-W11IoT` for the physical hardware to give a defence-in-depth posture across both device populations. APM confirmed the two-policy approach as the v0.3 baseline.

**Why two policies.** The CA policy `CA-APM-Kiosk-RequireCompliantDevice` (WP-1.4) requires the **session host** to report compliant before the kiosk user is allowed into the AVD app group. If only one compliance policy existed (session host), the physical kiosk would have no compliance signal at all. Adding a thin-client policy enforces BitLocker, Secure Boot and TPM 2.0 on the physical hardware as a separate evidence trail for RFFR.

**Prerequisites.**
- WP-1.1 complete (`SG-APM-AVD-SessionHosts` exists).
- `SG-APM-Kiosk-Devices` is created in WP-1.5, **after** this WP. Create Policy 1 here without an assignment and assign it to the device group at WP-1.5, or defer the assignment step to the WP-1.5 validation pass.

**Procedure.**

#### Policy 1 of 2 — Thin-client compliance (`Compliance-APM-Kiosk-W11IoT`)

1. In the Intune admin centre: `Devices → Compliance policies → Policies → Create policy`.

2. Platform: **Windows 10 and later**. Profile type: **Windows 10/11 compliance policy**.

3. Name: `Compliance-APM-Kiosk-W11IoT`. Description: `Kiosk thin-client (Windows 11 IoT Enterprise) compliance baseline. BitLocker, Secure Boot, TPM, encryption on physical hardware. Aligned with DD V0.3 §6.2.`

4. Settings:

| Setting category | Setting | Value |
|---|---|---|
| Device Health | BitLocker | Require |
| Device Health | Secure Boot | Require |
| Device Health | Code integrity | Require |
| Device Properties | Minimum OS version | leave blank (handled by update rings) |
| Device Properties | Maximum OS version | leave blank |
| Configuration Manager Compliance | Require device compliance from System Center Configuration Manager | Not configured (no SCCM in kiosk path) |
| System Security | Encryption of data storage on device | Require |
| System Security | Firewall | Require |
| System Security | Antivirus | Require |
| System Security | Antispyware | Require |
| Microsoft Defender for Endpoint | Require the device to be at or under the machine risk score | Conditional — set to `Medium` if WP-1.0 confirms APM's M365 licensing covers MDE for kiosk endpoints. Otherwise leave Not configured and document the residual risk decision in `evidence/edr-risk-acceptance.md` per WP-1.0 input item. |

5. Actions for non-compliance:
   - Mark device noncompliant: **Immediately (0 days)**.
   - Send email to user: **Not configured** (kiosk accounts have no real mailbox).
   - Send push notification: **Not configured**.

6. Scope tags: **default**.

7. **Assignment:** include `SG-APM-Kiosk-Devices` (the thin-client device group; created in WP-1.5). Exclude **nothing**.

8. Review + Create.

#### Policy 2 of 2 — Session-host compliance (`CMP-APM-AVD-SessionHosts`)

1. Create policy again: `Devices → Compliance policies → Policies → Create policy`.

2. Platform: **Windows 10 and later**. Profile type: **Windows 10/11 compliance policy**.

3. Name: `CMP-APM-AVD-SessionHosts`. Description: `AVD session host compliance baseline. Encryption on, firewall on, defender real-time on. Session hosts run Windows 11 Multi-Session on Azure infrastructure; BitLocker is Azure-managed at the disk level, so the device-level BitLocker setting is not used. Aligned with DD V0.3 §6.2.`

4. Settings:

| Setting category | Setting | Value |
|---|---|---|
| Device Health | BitLocker | Not configured (Azure-managed at the disk level for multi-session hosts) |
| Device Health | Secure Boot | Require |
| Device Health | Code integrity | Require |
| Device Properties | Minimum OS version | leave blank |
| Device Properties | Maximum OS version | leave blank |
| Configuration Manager Compliance | Require device compliance from System Center Configuration Manager | Not configured |
| System Security | Encryption of data storage on device | Require |
| System Security | Firewall | Require |
| System Security | Antivirus | Require |
| System Security | Antispyware | Require |
| Microsoft Defender for Endpoint | Require the device to be at or under the machine risk score | Same as above — set to `Medium` if MDE covers the AVD session hosts under APM's licensing; otherwise Not configured and document. |

5. Actions for non-compliance: same as Policy 1.

6. Scope tags: **default**.

7. **Assignment:** include `SG-APM-AVD-SessionHosts`. Exclude **nothing**.

8. Review + Create.

**Validation.**
- Both policies appear under `Devices → Compliance policies → Policies`.
- Confirm policy assignments: Policy 1 → `SG-APM-Kiosk-Devices`; Policy 2 → `SG-APM-AVD-SessionHosts`.
- After WP-1.5 lands an Autopilot-provisioned test device: thin-client compliance state should be `Compliant` within 30 minutes of enrolment.
- After WP-2.10 provisions the first session host: session-host compliance state should be `Compliant` within 30 minutes (this validation step is deferred to Phase 2A).

**Gotchas.**
- "Minimum OS version" should stay blank on both — Windows 11 IoT Enterprise and Windows 11 Multi-Session follow different update cadences to retail Windows 11, and a hard minimum will inadvertently mark devices non-compliant during a routine reboot before the update applies.
- v0.2 of this plan assigned a single compliance policy to `SG-APM-Kiosk-Users` (a user group). That was wrong — Intune compliance policies evaluate against the **device** the user signs in from, not the user. For the AVD architecture the device that matters at the CA evaluation point is the session host (which is what `CA-APM-Kiosk-RequireCompliantDevice` checks), and a separate policy on the thin client gives RFFR a physical-hardware compliance trail. v0.3 fixes this.
- The BitLocker setting on the session-host policy is intentionally not configured. AVD multi-session hosts use Azure-platform-managed disk encryption rather than device-level BitLocker; enabling the BitLocker compliance requirement on a multi-session host will report Not Compliant indefinitely.
- F-11 (MDE coverage decision) is captured here as a Yes/No on a per-setting basis. The decision goes into `evidence/edr-risk-acceptance.md` per WP-1.0; that file becomes part of the RFFR pack.

**References.** DD V0.3 §6.2 Compliance Policy (`CMP-APM-AVD-SessionHosts`); DD V0.3 §6.2 Table 61.

---

### WP-1.4 — Conditional Access policies (5 policies) (3.0 d)

**Status:** APPROVED — **report-only mode only** (cyber item 1). [ ] All five policies created in report-only. [ ] Cyber re-approval obtained for enforcement flip. [ ] Policies flipped to On. Do not flip without explicit cyber re-approval.

**Purpose.** The four-layer device-bound access design (Layer 1 CA device filter, Layer 2 platform block, Layer 3 Shell Launcher v2, Layer 4 single-session enforcement) sourced from DD §7 is enforced by five CA policies. The first four (DeviceBound, BlockNonWindows, BlockWebClient, RequireCompliantDevice) hold the four-layer model. The fifth and sixth (BlockExchangeOnline, BlockTeams) add token-level defence in depth on top of the F3 default-deny licensing template, denying any unintended access to Exchange Online and Teams even if a licensing or group misassignment briefly enables them. All five must be in place before any kiosk device hits production.

**WebOnly-Office removed (as-built 2026-06-11).** A sixth policy, `CA-APM-Kiosk-WebOnly-Office`, was specified here in v0.3. It has been **removed** — it did not do what its name claimed. App-enforced restrictions (the session control it used) only applies to SharePoint Online and Exchange Online, cannot force Office to web-only, and grants the **full** (not limited) experience to managed/compliant devices — which the kiosks are by design — making it inert on this fleet. Its stated intent is delivered elsewhere: web-only Office by not installing desktop Office (golden image), Exchange/Teams blocking by the dedicated Block policies, and third-party/other-workload denial by the F3 default-deny licensing model. See drift review A14 (extended) and the DD V0.4 defect list. The DD's own Table 53 variant of this policy is separately defective (block-all-cloud-apps would block AVD itself).

**v0.3 change vs v0.2.** v0.2 shipped four policies and targeted `All cloud apps` on the BlockNonWindows policy. v0.3 shipped six; v0.3.3 (2026-06-11) removes the inert WebOnly-Office policy leaving **five**, restricts target apps to the three AVD-specific cloud apps per DD §6.2 Tables 52-60, adds 12-hour sign-in frequency per DD on all five, and adds `Microsoft Remote Desktop` to the target apps where missing.

**Prerequisites.**
- WP-1.1 (`SG-APM-Kiosk-Users`, `SG-APM-Kiosk-CA-Exclusion`, `SG-APM-AVD-SessionHosts`).
- WP-1.3 (both compliance policies).
- WP-1.5 (Autopilot deployment profile object ID for the DeviceBound device filter — can be done in parallel; the policy can be created with a placeholder filter, then updated when WP-1.5 completes).
- Break-glass admin accounts exist and are excluded from all blanket CA policies (per the DD's break-glass procedure, §7).

**Procedure — common pattern for all five policies.**

For each of the five policies below, follow this loop:

1. Create the policy in **Report-only** mode.
2. Assign to `SG-APM-Kiosk-Users` only. Exclude `SG-APM-Kiosk-CA-Exclusion` plus the break-glass admin group.
3. Test sign-in scenarios as listed in the policy's Validation block (allowed scenarios should show `Success` in the policy report column; blocked scenarios should show `Failure`).
4. Once all test scenarios behave as expected in report-only and cyber re-approves enforcement, switch the policy to **On**.
5. Document the sign-in log evidence in `./evidence/ca-policy-evidence.md`.

**Sign-in frequency baseline.** Per DD §6.2 Tables 52-60, every kiosk CA policy carries a **Sign-in frequency: 12 hours** session control. This is set under Session → Sign-in frequency → Periodic reauthentication → 12 hours. Documented per policy below.

#### CA-APM-Kiosk-DeviceBound

Identity gate. Blocks kiosk-user sign-ins from any device that is not a kiosk-fleet, Entra-joined device.

**v0.3.2 fix vs v0.3.1.** v0.3.1 had the filter direction wrong (Include filtered devices + Block would have blocked legitimate kiosks). v0.3.2 corrects to "Exclude filtered devices + Block" so the policy applies to non-kiosks and lets kiosks fall through. DD §6.2 Table 53 has the same defect; raised as a DD V0.4 defect in the Calibration Notes.

| Block | Setting |
|---|---|
| Users | Include: `SG-APM-Kiosk-Users`. Exclude: `SG-APM-Kiosk-CA-Exclusion` + break-glass admin group. |
| Target resources | Cloud apps: `Azure Virtual Desktop`, `Windows Cloud Login`, `Microsoft Remote Desktop`. |
| Conditions → Device platforms | Include: Any device. |
| Conditions → **Filter for devices** | **Exclude filtered devices**: `device.enrollmentProfileName -eq "APM-Kiosk-SelfDeploying" -and device.trustType -eq "AzureAD"` |
| Conditions → Client apps | Include: Browsers, Mobile apps and desktop clients, **Other clients (legacy auth)** — defence in depth on top of the F3 licensing default-deny. |
| Grant | **Block access**. |
| Session → Sign-in frequency | Periodic reauthentication, **12 hours**. |

Read the filter as: "any device that is not a kiosk-fleet, Entra-joined device is captured by this policy and blocked from the AVD broker cloud apps." Compliance is not checked here — the kiosk's compliance state is the job of `CA-APM-Kiosk-RequireCompliantDevice` below. DeviceBound answers "is the device the user is signing in from one we built?"; RequireCompliantDevice answers "is that kiosk currently healthy?". The two together give defence in depth on identity and state respectively.

**Validation scenarios for CA-APM-Kiosk-DeviceBound** (use report-only mode):

| Scenario | Expected result | Sign-in log search |
|---|---|---|
| Kiosk user signs in from a provisioned kiosk | Allowed (policy not applied — device excluded by filter) | Conditional Access section shows `Not applied` for DeviceBound |
| Kiosk user signs in from a personal Windows laptop | Blocked | `Failure - Block access` |
| Kiosk user signs in from another APM-enrolled device under a different Autopilot profile | Blocked | `Failure - Block access` |
| Kiosk user signs in from a hybrid-joined device (`trustType ≠ AzureAD`) | Blocked | `Failure - Block access` |
| Same kiosk user 13 hours into an active token | Re-prompted to authenticate | Sign-in frequency control fires; policy re-evaluates |
| Break-glass admin signs in from anywhere | Allowed (policy not evaluated for this user) | `Not applied` |

#### CA-APM-Kiosk-BlockNonWindows

Layer 2 of the device-bound access design (DD §6.2 Table 54). Blocks kiosk users from authenticating on non-Windows platforms even if Layer 1 is misconfigured.

| Block | Setting |
|---|---|
| Users | Include: `SG-APM-Kiosk-Users`. Exclude: `SG-APM-Kiosk-CA-Exclusion` + break-glass. |
| Target resources | Cloud apps: `Azure Virtual Desktop`, `Windows Cloud Login`, `Microsoft Remote Desktop` (per DD Table 54). **Not** `All cloud apps` (v0.2 had this wrong; targeting All cloud apps could lock kiosk user accounts out of platform endpoints they need during device join and Intune enrolment flows). |
| Conditions → Device platforms | Include: Android, iOS, macOS, Linux. Exclude: Windows. |
| Grant | **Block access**. |
| Session → Sign-in frequency | 12 hours. |

**Validation scenarios:**

| Scenario | Expected result |
|---|---|
| Test kiosk user signs in on iOS, hits AVD endpoint | Blocked |
| Test kiosk user signs in on Android, hits AVD endpoint | Blocked |
| Test kiosk user signs in on macOS, hits AVD endpoint | Blocked |
| Test kiosk user signs in on Windows | Allowed (this policy not applied) |
| Test kiosk user signs in on iOS, hits a non-AVD app | Not evaluated by this policy (good — v0.2 would have blocked here unnecessarily) |

#### CA-APM-Kiosk-BlockWebClient

Layer 2b (DD §6.2 Table 55). Blocks the AVD web client (`https://client.wvd.microsoft.com`) which does not present a device identity and would therefore bypass the DeviceBound filter.

| Block | Setting |
|---|---|
| Users | Include: `SG-APM-Kiosk-Users`. Exclude: `SG-APM-Kiosk-CA-Exclusion` + break-glass. |
| Target resources | Cloud apps: `Azure Virtual Desktop`, `Microsoft Remote Desktop`. |
| Conditions → Client apps | Include: Browser **only**. Exclude: Mobile apps and desktop clients. |
| Grant | **Block access**. |
| Session → Sign-in frequency | 12 hours. |

**Validation scenarios:**

| Scenario | Expected result |
|---|---|
| Test kiosk user opens `client.wvd.microsoft.com` in any browser | Blocked at sign-in |
| Test kiosk user uses native Windows App on a provisioned kiosk | Allowed |

#### CA-APM-Kiosk-RequireCompliantDevice

State gate. For devices that DeviceBound has let through (i.e. kiosks), requires that the device's current Intune compliance state is Compliant per `Compliance-APM-Kiosk-W11IoT` (WP-1.3).

**v0.3.2 fix vs v0.3.1.** v0.3.1 had no device filter and a Gotcha that said this policy evaluated the session host. Both wrong. v0.3.2 adds an Include filter scoped to kiosks (so this policy doesn't re-evaluate the non-kiosks DeviceBound has already blocked) and rewrites the Gotcha to correctly state that this policy evaluates the **client thin client**, not the session host. DD §6.2 Tables 53 and 56 are byte-identical apart from the name field — a duplicate-policy defect raised as DD V0.4 in the Calibration Notes.

| Block | Setting |
|---|---|
| Users | Include: `SG-APM-Kiosk-Users`. Exclude: `SG-APM-Kiosk-CA-Exclusion` + break-glass. |
| Target resources | Cloud apps: `Azure Virtual Desktop`, `Windows Cloud Login`, `Microsoft Remote Desktop`. |
| Conditions → Device platforms | Include: Windows. |
| Conditions → **Filter for devices** | **Include filtered devices**: `device.enrollmentProfileName -eq "APM-Kiosk-SelfDeploying" -and device.trustType -eq "AzureAD"` |
| Grant | Require: **Require device to be marked as compliant**. (Single grant control, no `OR`.) |
| Session → Sign-in frequency | 12 hours. |

**Validation scenarios:**

| Scenario | Expected result |
|---|---|
| Compliant kiosk → kiosk user signs in | Allowed |
| Kiosk with compliance Pending or Not evaluated | Blocked, with `Requires compliant device` reason |
| Tampered kiosk (BitLocker disabled, TPM cleared, encryption off) | Blocked |
| Non-kiosk device | Not evaluated by this policy (filter excludes; DeviceBound has already blocked) |

**Gotcha.** This policy evaluates compliance of the **client device the user is signing in from** — that is, the kiosk thin client (`KI-APM-{siteCode}-{kioskId}`), not the AVD session host VM. The thin client's compliance is governed by `Compliance-APM-Kiosk-W11IoT` from WP-1.3 (BitLocker, Secure Boot, TPM 2.0, encryption, firewall, antivirus). If a kiosk falls out of compliance, this policy blocks the kiosk-user sign-in to AVD until compliance returns. The DeviceBound policy above has already excluded non-kiosk devices, so this policy effectively only evaluates against kiosks, which is the intent. Session-host compliance (via `CMP-APM-AVD-SessionHosts`) is a separate concern — see the Gotcha in WP-2.13.

#### CA-APM-Kiosk-BlockExchangeOnline

New in v0.3 (DD §6.2 Table 59). Token-level defence-in-depth on top of the F3 default-deny licensing template — denies any unintended Exchange Online access by kiosk user accounts even if the licensing template is briefly misapplied.

| Block | Setting |
|---|---|
| Users | Include: `SG-APM-Kiosk-Users`. Exclude: `SG-APM-Kiosk-CA-Exclusion` + break-glass. |
| Target resources | Cloud apps: `Office 365 Exchange Online`. |
| Conditions → Client apps | Include: All client apps (Browsers, Mobile apps and desktop clients, Other clients including legacy auth). |
| Grant | **Block access**. |
| Session → Sign-in frequency | 12 hours. |

**Validation scenarios:**

| Scenario | Expected result |
|---|---|
| Test kiosk user attempts to access Outlook on the web | Blocked |
| Test kiosk user attempts to authenticate against `outlook.office.com` from any client | Blocked |
| Test kiosk user reaches AVD session host (Exchange not in target apps) | Allowed |

#### CA-APM-Kiosk-BlockTeams

New in v0.3 (DD §6.2 Table 60). Same defence-in-depth pattern, applied to Teams.

| Block | Setting |
|---|---|
| Users | Include: `SG-APM-Kiosk-Users`. Exclude: `SG-APM-Kiosk-CA-Exclusion` + break-glass. |
| Target resources | Cloud apps: `Microsoft Teams Services`, `Microsoft Teams Web Client`. |
| Conditions → Client apps | Include: All client apps. |
| Grant | **Block access**. |
| Session → Sign-in frequency | 12 hours. |

**Validation scenarios:**

| Scenario | Expected result |
|---|---|
| Test kiosk user attempts to access Teams on the web | Blocked |
| Test kiosk user attempts to launch the Teams desktop client (would not normally happen on a kiosk shell, but a token leak could) | Blocked |

**Final cutover for all five policies.**

Once every Validation scenario passes in report-only mode and cyber re-approves enforcement, switch each policy to **On** sequentially with a 30-minute observation gap between each. Do not switch all five at once — if something breaks you cannot isolate the cause. Recommended order: DeviceBound first (the load-bearing one), then RequireCompliantDevice, then the three block policies (BlockNonWindows, BlockWebClient, BlockExchangeOnline, BlockTeams).

**Gotchas.**
- The `enrollmentProfileName` filter is case-sensitive. `APM-Kiosk-SelfDeploying` must match exactly between the Autopilot profile name and the CA filter string. The same literal also appears in the WP-1.5 dynamic group rule; one typo, no enforcement. v0.3 raises this to a Phase 1 acceptance check (F-17).
- Break-glass account exclusion is mandatory. The DD's break-glass procedure (§7) assumes break-glass admins can sign in even if every kiosk CA policy is misconfigured.
- The AVD `Windows Cloud Login` cloud app is the modern entry point. The DD also lists `Microsoft Remote Desktop` (added in v0.3) for the newer Windows App client. Include both alongside `Azure Virtual Desktop`.
- Report-only mode evidence must be captured before flipping to On. The evidence is what justifies the design under RFFR audit. Capture: at minimum, 24 hours of sign-in logs filtered to `SG-APM-Kiosk-Users`, showing the policy verdict column for each of the five policies across a mix of legitimate and adversarial sign-in scenarios.
- Sign-in frequency at 12 hours means the kiosk user's AVD token survives across an 8-hour business day without re-auth, but expires overnight. This matches the DD's design intent. If shorter sign-in frequency is needed (e.g. for 24-hour sites per WP-1.0 input), reduce per-policy; do not deviate without raising a DD divergence.
- DD §6.2 Tables 52-60 are the canonical source for each policy's target apps and conditions. If a future DD revision changes these, the v0.3 policy bodies must change with them; raise a defect.

**References.** DD V0.3 §6.2 Conditional Access Policies (Tables 52-60); DD V0.3 §6.2 Break-Glass Procedure; cap-m365-entra conditional-access-impact skill.

---

### WP-1.5 — Autopilot self-deploying profile + hardware-hash ingestion (1.0 d)

**Status:** APPROVED (cyber item 2). [ ] Complete.

**Purpose.** Configure the Autopilot deployment profile that every kiosk device joins under, and establish the workflow for ingesting hardware hashes from the device-prep partner.

**As-built 2026-06-11:** the the device-prep partner device prep flow is now the standalone runbook `outputs/JobSeeker_the device-prep partner_Autopilot_Onboarding_v0.1.md` — factory Dell Windows 11 IoT Enterprise LTSC image retained (no wipe/USB reimage, superseding the DD's the device-prep partner section): factory Admin sign-in (`Admin#<SERIAL-IN-CAPS>`), Unified Write Filter disabled permanently, TPM/SecureBoot pre-checks, Get-WindowsAutopilotInfo import (online or CSV hand-back), removal of factory `unattend.xml` answer files (field finding — they re-arm the autoboot auto-logon), sysprep `/generalize /oobe /shutdown`, optional validation boot to the branded lock screen. Security note: the factory Admin password is derivable from the serial printed on the chassis and shown on the lock screen — the Windows LAPS policy (break-glass decision, 2026-06-10) must target that account name; verify at pilot.

**Prerequisites.**
- WP-1.1 (`SG-APM-Kiosk-Users`).
- the device-prep partner contact and process confirmed (WP-1.0).

**Procedure.**

1. Create a device group that Autopilot devices will land in. This is **device-based**, not user-based. Naming: `SG-APM-Kiosk-Devices`. Membership rule: dynamic, using both the Autopilot enrolment profile name and the DD §6.1.5 `KI-APM-` device name prefix. Joining on both gives device coverage during the brief window between enrolment and rename (when the device has the enrolment profile but does not yet have the canonical name) and after rename (when the device has both).

```powershell
$kioskDevices = New-MgGroup `
    -DisplayName "SG-APM-Kiosk-Devices" `
    -MailEnabled:$false `
    -MailNickname "SG-APM-Kiosk-Devices" `
    -SecurityEnabled:$true `
    -GroupTypes @("DynamicMembership") `
    -MembershipRule '(device.enrollmentProfileName -eq "APM-Kiosk-SelfDeploying") -or (device.displayName -startsWith "KI-APM-")' `
    -MembershipRuleProcessingState "On" `
    -Description "Dynamic group of APM JobSeeker kiosk devices. Joins on Autopilot profile name (during/post-enrolment) and KI-APM- device name prefix (post-rename per DD §6.1.5)."

# Stash the GroupId
Add-Content ./inputs/group-ids.json "kioskDevicesGroupId: $($kioskDevices.Id)"
```

2. Create the Autopilot deployment profile. Intune admin centre: `Devices → Windows enrollment → Deployment profiles → Create profile → Windows PC`.

3. Profile settings:

| Block | Setting | Value |
|---|---|---|
| Basics | Name | `APM-Kiosk-SelfDeploying` (exactly — this string is referenced by CA policy filter) |
| Basics | Description | `Self-deploying Autopilot profile for APM JobSeeker Kiosk devices. Per DD V0.3 §5.1.1.` |
| Basics | Convert all targeted devices to Autopilot | **No** (we deliberately only convert devices that go through the device-prep partner prep) |
| OOBE | Deployment mode | **Self-Deploying (preview)** |
| OOBE | Join to Microsoft Entra ID as | Microsoft Entra joined |
| OOBE | Language (Region) | English (Australia) |
| OOBE | Automatically configure keyboard | Yes |
| OOBE | Microsoft Software License Terms | Hide |
| OOBE | Privacy settings | Hide |
| OOBE | Hide change account options | Hide |
| OOBE | User account type | Standard |
| OOBE | Allow White Glove OOBE | No |
| OOBE | Apply device name template | **Yes** (this sets a temporary name; the Intune device rename script in step 5 below overrides it with the DD's canonical name) |
| OOBE | Enter a name | `KI-APM-%SERIAL%` (truncated to 15 chars by Windows automatically; this is a temporary name and will be replaced by the rename script) |
| Assignments | Included groups | `SG-APM-Kiosk-Devices` |
| Assignments | Excluded groups | (none) |

4. Establish the the device-prep partner hardware-hash workflow:

   a. Send the device-prep partner the standard `Get-WindowsAutopilotInfo` PowerShell script via email. The script is documented at Microsoft Learn — *Add devices to Windows Autopilot*.

   b. the device-prep partner runs the script on each device during their wipe/prep process:

```powershell
Install-Script -Name Get-WindowsAutopilotInfo -Force
Get-WindowsAutopilotInfo -OutputFile C:\AP\hash.csv -GroupTag KIOSKTAG -AssignedUser ""
```

   c. the device-prep partner sends the CSV per batch to a shared SharePoint location agreed at WP-1.0.

   d. You import the CSV into Autopilot: `Intune admin centre → Devices → Windows enrollment → Devices → Import → Upload CSV`.

   e. Within 15 minutes, the imported devices appear and are automatically added to `SG-APM-Kiosk-Devices` via the dynamic rule.

5. Deploy the Intune device rename script that enforces the canonical name `KI-APM-{siteCode}-{kioskId}` (DD §6.1.5). Deliver this as an **Intune PowerShell script** (`Devices → Scripts and remediations → Platform scripts → Add → Windows 10 and later`). The script runs once per device after Intune enrolment, looks up the device's site code from a tagging mechanism (default: Autopilot group tag), allocates the next available `{kioskId}` for that site from a shared counter, and renames the device with a reboot at the next maintenance window.

   Script reference structure (do not assign until APM has confirmed the site-code source and ID allocation method per WP-1.0):

   ```powershell
   # APM-Kiosk-Rename.ps1
   # Renames a freshly-Autopilot-enrolled kiosk to KI-APM-{siteCode}-{kioskId}.
   # Site code is read from the Autopilot group tag (GroupTag set by the device-prep partner during hardware-hash export).
   # Kiosk ID is allocated from an Azure Table Storage counter keyed by site code.
   # Requires the device to have a system-assigned managed identity OR a SAS token in script-vars.

   $ErrorActionPreference = 'Stop'
   $logPath = 'C:\ProgramData\APM-Kiosk\rename.log'
   New-Item -ItemType Directory -Path (Split-Path $logPath) -Force | Out-Null

   # Already renamed? Exit clean.
   $current = $env:COMPUTERNAME
   if ($current -like 'KI-APM-*-*') {
       Add-Content $logPath "$(Get-Date -Format o) Already named '$current'; no action."
       exit 0
   }

   # Site code from the Autopilot group tag.
   $groupTag = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Provisioning\Diagnostics\Autopilot' -Name 'CloudAssignedTenantDomain' -ErrorAction SilentlyContinue).CloudAssignedTenantDomain
   # NOTE: the actual group tag is read from MDM_DevDetail_Ext01 or via the Get-AutopilotDiagnostics path.
   # Confirm the source with APM at WP-1.0 — placeholder shown.
   $siteCode = '{siteCode_from_group_tag}'  # e.g. 'U718'

   # Kiosk ID from Azure Table Storage counter.
   # This requires either a managed identity on the kiosk (not available on physical devices)
   # or a constrained SAS token baked into the script. Confirm the auth approach at WP-1.0.
   $kioskId = '{nextAvailableId_from_table_storage}'  # e.g. '01'

   $newName = "KI-APM-$siteCode-$kioskId"
   if ($newName.Length -gt 15) {
       Add-Content $logPath "$(Get-Date -Format o) ERROR new name '$newName' exceeds 15 chars; aborting."
       exit 1
   }

   Rename-Computer -NewName $newName -Force -ErrorAction Stop
   Add-Content $logPath "$(Get-Date -Format o) Renamed to '$newName'; reboot scheduled by Intune."
   ```

   Assign the script to `SG-APM-Kiosk-Devices`. Set "Run this script using the logged on credentials" = **No** (run as SYSTEM). Set "Run script in 64 bit PowerShell" = **Yes**.

   The Azure Table Storage counter is a small piece of infrastructure not currently in Phase 2 scope. Default placement: `st{apmkioskprod}` storage account, table `kioskIdCounters`, partition key = `{siteCode}`, row key = `counter`. Confirm placement with APM at WP-1.0; this storage account would normally be in the BLOCKED Phase 2B scope, so for the Phase 2A approval window the rename script can be drafted but not assigned until storage is available.

6. Run a pilot ingest with one the device-prep partner-prepped device end-to-end before scaling.

**Validation.**
- Profile exists at `Intune admin centre → Devices → Windows enrollment → Deployment profiles`.
- `Get-MgGroup -GroupId $kioskDevices.Id` returns the dynamic group.
- A pilot device, after CSV import, appears in `SG-APM-Kiosk-Devices` within 30 minutes (dynamic group evaluation is asynchronous).
- The pilot device, when powered on and connected to network, self-provisions through OOBE without any user input.
- After the rename script runs (post-enrolment, may require one reboot), the device name matches the `KI-APM-{siteCode}-{kioskId}` pattern and the dynamic group prefix filter recognises it.

**Gotchas.**
- The DD's naming format `KI-APM-{siteCode}-{kioskId}` has a 15-character NetBIOS ceiling. `KI-APM-` is 7 characters including dashes; that leaves 8 characters for `{siteCode}-{kioskId}`. With a 4-char site code and 2-digit kiosk ID, the full name is 14 characters (`KI-APM-U718-01`) — one char spare. Anything longer than 4 chars for the site code or 2 digits for the kiosk ID breaks NetBIOS. APM must confirm site codes do not exceed 4 characters at WP-1.0.
- The Autopilot OOBE name template `KI-APM-%SERIAL%` is **temporary**. Windows truncates `%SERIAL%` to fit 15 chars, so the OOBE name will look like `KI-APM-XPYCK14` initially. The rename script replaces this with the canonical name. Do not rely on the OOBE name for any downstream lookup.
- Self-deploying mode requires TPM 2.0 attestation. Devices that fail attestation fall back to "Self-deploying could not be completed" and the OOBE stops. If this happens, confirm TPM is enabled in UEFI on the device (it is by default on the current Dell thin client SKU but worth checking).
- The Autopilot profile name `APM-Kiosk-SelfDeploying` is referenced verbatim in three places: the Autopilot profile (this WP, step 3), the CA-APM-Kiosk-DeviceBound filter (WP-1.4), and the `SG-APM-Kiosk-Devices` dynamic-group rule (step 1 above). The string is case-sensitive. Phase 1 acceptance check: the three references must be byte-identical. If `APM-Kiosk-SelfDeploying` is later changed, all three must be updated in the same pass. The same goes for the `KI-APM-` device-name prefix. Promote both to placeholders in §0.3 if APM wants to relabel; otherwise treat both as fixed literals and grep before any rename.
- The site code source (Autopilot group tag, custom Intune attribute, or hardware-hash CSV) must be settled at WP-1.0. If the device-prep partner are populating the GroupTag field during hash export, that's the cleanest path. The placeholder in the script above must be replaced with the actual lookup.

**References.** DD V0.3 §6.1.3 Autopilot Self-Deploying mode; DD V0.3 §6.1.5 Naming Convention; Microsoft Learn — Add devices to Windows Autopilot; Microsoft Learn — Use PowerShell scripts on Windows 10/11 devices in Intune.

---

### WP-1.6 — Azure Automation Account + initial UPN runbook

**Status:** **APPROVED (2026-06-11)** — cyber carved the Automation Account out of item 4 and approved it; `aa-apm-kiosk` is created (implementer as Owner). The full procedure lives in the Phase 2B section (the body was relocated there in v0.3); it is now live. See "WP-1.6 — relocated to Phase 2B" below.

**Why the body sits in Phase 2B.** v0.3 relocated the procedure into Phase 2B when the Automation Account was still blocked under item 4. The procedure stays there for continuity; the 2026-06-11 carve-out means it is now executable. The dependent production runbooks (WP-2.5/2.6) and the HRW (WP-2.8) remain blocked on Key Vault + the VNet.

**Numbering kept.** Still labelled WP-1.6 so cross-references in the plan, the Effort Estimate, and the DD continue to resolve.

---

### WP-1.7 — Intune configuration profiles (11 profiles, two target populations) (3.0 d)

**Status:** APPROVED (cyber item 2, includes Windows App deployment in Profile 5). [ ] Complete.

**Purpose.** Apply the **eleven active** Intune configuration profiles. Seven target the AVD session host (the VM where the job seeker browses and reaches web Office); four target the physical Windows 11 IoT thin client (Profile 12 BitLocker and Profile 13 LAPS added 2026-06-11). Profile numbers 1–12 are retained for stable cross-referencing; **Profiles 1 (Office device-based licensing) and 8 (Office 365 application access) were removed 2026-06-11** — both are desktop-Office controls and Office is web-only on this fleet (confirmed 2026-06-11), so both were inert. Profile 2 (in-session Assigned Access lockdown) was wrongly skipped in earlier versions and is restored per the 2026-06-10 drift review (A2); the split is below.

**Why two target groups, not one.** DD §4.3 paragraph 123 (verbatim): "Profiles targeting the physical device are scoped to SG-APM-Autopilot-Kiosk-Devices. Profiles targeting the AVD session host are scoped to APM-AVD-SessionHosts." The thin client only runs the Windows App as its shell. It does not run Edge, does not run Office, and does not hold any user profile (it auto-logs in to a local kiosk account that never logs out). Applying Edge, Office, RDS-session-timer or user-profile-cleanup settings to the thin client is a no-op at best and a silent failure at worst. The session host is where those settings actually apply. v0.2 of this plan assigned all ten profiles to `SG-APM-Kiosk-Devices`; v0.3 re-targets them per DD §4.3.

**Prerequisites.**
- WP-1.1 (`SG-APM-Kiosk-Users`, `SG-APM-AVD-SessionHosts`).
- WP-1.5 (`SG-APM-Kiosk-Devices`).

**Procedure.**

This work package is the longest single item in Phase 1. Each profile is fast individually but cumulatively significant.

For each of the eleven profiles below: `Intune admin centre → Devices → Configuration → Create → New policy`. Platform and Profile type per the table. Apply the settings exactly as listed. **Assignment varies per profile — read the Assignment row of each profile table; there is no default any more.**

**Profile assignment summary (read this first):**

| Profile | Target population | Assignment |
|---|---|---|
| ~~1. Office device-based licensing~~ | **REMOVED 2026-06-11** — desktop-Office Shared Computer Licensing; Office is web-only (no install) so it was a no-op | — |
| 2. Assigned Access (multi-app, in-session lockdown) | Session host (restricts the job seeker to Word/Excel/PowerPoint/Edge **inside the AVD session** — distinct from Profile 5, which controls the thin-client shell) | `SG-APM-AVD-SessionHosts` |
| 3. Session time limits | Session host (RDS Session Host timers are evaluated on the AVD VM) | `SG-APM-AVD-SessionHosts` |
| 4. Session lock behaviour | Session host | `SG-APM-AVD-SessionHosts` |
| 5. Shell Launcher v2 | Thin client (replaces explorer.exe on Windows 11 IoT) | `SG-APM-Kiosk-Devices` |
| 6. Edge browser policies | Session host (Edge runs in the AVD session, not on the thin client) | `SG-APM-AVD-SessionHosts` |
| 7. Edge managed favourites | Session host | `SG-APM-AVD-SessionHosts` |
| ~~8. Office 365 application access~~ | **REMOVED 2026-06-11** — Office Inventory Agent is a desktop-Office component; web-only so it was a no-op | — |
| 9. User profile cleanup | Session host (user profiles materialise on the AVD VM, not the thin client) | `SG-APM-AVD-SessionHosts` |
| 10. Rotation Password Proactive Remediation | Thin client (PR runs on the physical device) | `SG-APM-Kiosk-Devices` (built in WP-1.8; assignment activated in WP-2.7 only) |
| 11. Time zone (new in v0.3.3) | Session host (win11-24h2-avd resets TZ to UTC during OOBE specialize; image-level TZ does not survive — field-confirmed June 2026) | `SG-APM-AVD-SessionHosts` |
| 12. BitLocker (new 2026-06-11) | Thin client (Windows 11 IoT Enterprise LTSC — silent OS-drive encryption, recovery key escrowed to Entra) | `SG-APM-Kiosk-Devices` |
| 13. Windows LAPS (new 2026-06-11) | Thin client — manages the local **`Admin`** account password (the Dell factory break-glass admin), backed up to Entra | `SG-APM-Kiosk-Devices` |

#### Profile 1: Office device-based licensing — REMOVED (2026-06-11)

Removed. This profile set Office **Shared Computer Licensing** (`./Vendor/MSFT/Office/Installation/SharedComputerLicensing = 1`), which only matters for *installed* desktop Office (M365 Apps / ProPlus) activating per-device. Office on this fleet is **web-only** (office.com in Edge, confirmed 2026-06-11): there is no desktop Office to license, and the web apps are entitled by the signed-in kiosk user's M365 F3, not by device licensing. The profile was therefore inert. The DD's golden-image and §4.3 references to device-based / Shared Computer Licensing are a desktop-Office assumption that contradicts the stated web-only model — raised as a DD V0.4 defect.

#### Profile 2: Assigned Access (multi-app) — in-session lockdown (restored in v0.3.3 drift review)

**History.** v0.3 through the first v0.3.3 cut marked this profile "skipped", reasoning that Shell Launcher v2 (Profile 5) was the authoritative shell control. That conflated two different controls on two different devices: Profile 5 restricts the **thin-client** shell; this profile restricts what the job seeker can run **inside the AVD session**. DD §4.3 calls this "the primary control enforcing the Word, PowerPoint, Edge only experience" on the session host, and the FVE addendum's test T4 explicitly tests it. The 2026-06-10 drift review (A2) restores it — without it, a job seeker inside the AVD desktop can open File Explorer, Settings, cmd, PowerShell and Task Manager.

| Property | Value |
|---|---|
| Platform | Windows 10 and later |
| Profile type | Templates → Custom |
| Name | `Profile-APM-AVD-AssignedAccess` |
| OMA-URI | `./Vendor/MSFT/AssignedAccess/Configuration` |
| Data type | String (multi-app Assigned Access XML) |
| **Assignment** | **`SG-APM-AVD-SessionHosts`** |

**Authored XML: `outputs/assigned-access/kiosk-assignedaccess.xml`** (with README). It uses `GlobalProfile` so the restricted experience applies to every non-admin user that lands on the pooled, reimaged session host (a per-UPN binding can't work there); break-glass admins fall through to a full desktop. First authored draft — well-formed but not yet XSD-validated or bench-tested; **FVE test T4 is the acceptance gate**, and it's where the Assigned-Access-on-`-ent` question gets settled (AppLocker fallback if it fails).

**Allowed apps (revised 2026-06-11 — Option A, web-only Office confirmed): Microsoft Edge only.** DD §4.3 Table 12 listed Word, Excel, PowerPoint and Edge, but with Office web-only there are no desktop Office apps to allow — the job seeker reaches Word/Excel/PowerPoint at office.com through Edge (the managed favourites in Profile 7). So the multi-app Assigned Access allow-list contains a single entry, Edge, plus the accessibility tools the design requires discoverable (Magnifier, Narrator — DD requirements 02/03; pin them to the restricted Start). Everything else is implicitly blocked: File Explorer, Control Panel, Settings, Command Prompt, PowerShell, Task Manager and all other applications. Do **not** add File Explorer to the allow-list — file-system access is a data-leak path; the restricted Assigned Access shell provides the windowing without it. DD V0.4 defect raised to update Table 12 to the Edge-only web reality.

**Implementation caution — verify before building the XML.** Multi-app Assigned Access has SKU and session-model constraints that the DD does not address:

1. **Multi-session support is doubtful.** Assigned Access is a kiosk feature designed for single-user client SKUs; its behaviour on Windows 11 Enterprise **multi-session** (which is what the current golden image actually is — see the drift review A1 edition finding) is not a documented supported scenario. If the image stays multi-session, expect this profile to fail or behave inconsistently.
2. **Fallback that works on both editions: AppLocker (or WDAC) baked into the golden image** — allow-list Word/Excel/PowerPoint/Edge plus required system processes for the kiosk user group, deny everything else, supplemented by Settings Catalog policies hiding File Explorer/Settings/Task Manager surface. This achieves DD Table 12's intent without the Assigned Access SKU question, at the cost of being image-level rather than declarative.

**Action:** spike both routes on the FVE's first session host (the FVE exists precisely for this). If Assigned Access applies and enforces on the chosen edition, keep this profile. If not, implement the AppLocker route in the next golden image version (add to the WP-2.10 build scripts) and convert this profile entry to document that decision. Either way, FVE test T4 ("no Start menu, no other apps available") is the acceptance test. Record the route chosen in `evidence/dd-divergences.md` and, if AppLocker, raise a DD V0.4 defect updating §4.3.

DD reference: DD §4.3 Assigned Access (Multi-App Kiosk), Table 12; FVE addendum Table 19 + test T4; drift review A2.

#### Profile 3: Session time limits

| Property | Value |
|---|---|
| Platform | Windows 10 and later |
| Profile type | Settings catalog |
| Name | `Profile-APM-AVD-SessionLimits` |
| Setting (search "Set time limit for active but idle Remote Desktop Services sessions") | 10 minutes |
| Setting (search "Set time limit for disconnected sessions") | **1 minute** (per DD §4.3 Table 12 row 2; v0.2 had 5 minutes which is a DD divergence) |
| Setting (search "Set time limit for logoff of RemoteApp sessions") | Immediately |
| **Assignment** | **`SG-APM-AVD-SessionHosts`** |

Rationale. These are RDS Session Host timers — they are evaluated by the RDS service running on the multi-session AVD VM, not by the thin client. The 1-minute disconnect setting (down from v0.2's 5 minutes) aligns with DD §5.1.1.2 paragraph 149: "When the session locks, it disconnects... 1-minute disconnected session limit triggers Nerdio reimaging". Shorter disconnect closes the window where an orphan session could be resumed by a subsequent job seeker on the same kiosk.

DD reference: DD §4.3 paragraph 142, DD §5.1.1.2 paragraph 149, DD §4.3 Table 12.

#### Profile 4: Session lock behaviour

| Property | Value |
|---|---|
| Platform | Windows 10 and later |
| Profile type | Settings catalog |
| Name | `Profile-APM-AVD-DisconnectOnLock` |
| Setting "Disconnect remote session on lock for Microsoft identity platform authentication" | Enabled |
| Setting "Machine inactivity limit" | 600 seconds (10 minutes) |
| Setting "Interactive logon: Machine inactivity limit" | 600 |
| **Assignment** | **`SG-APM-AVD-SessionHosts`** |

Rationale. The "Disconnect remote session on lock" setting is the AVD-side mechanism that fires when the job seeker locks their session (or walks away and the inactivity limit triggers). The interactive-logon machine-inactivity-limit settings are likewise evaluated on the session host. None of these apply to the thin client where there is no interactive logon (the device auto-logs in to a local IoT kiosk account that never locks).

DD reference: DD §4.3 paragraph 147 (verbatim setting name).

#### Profile 5: Shell Launcher v2 — per-user shell restriction

This is the most important profile in the build and the one most likely to misfire. **Thin-client only.**

**Prerequisites — three, all field-confirmed on the pilot bench (2026-06-10; see `evidence/pilot-shelllauncher-bench-2026-06-10.md` and `scope/windows-app-shelllauncher-research.md`).**

**(1) Windows App provisioned DEVICE-WIDE, ESP-blocking.** Shell Launcher launches the app by AUMID for the kiosk user at their first sign-in; if the package is not provisioned device-wide, the AUMID does not resolve for that user and the result is a **black screen** (field-confirmed; also Azure/WindowsAppKiosk issue #16). Intune "Microsoft Store app (new)" device assignment was field-confirmed NOT to provision (it registered the app for a single user). Deploy instead as the Win32 app in `outputs/intune-apps/windows-app-kiosk/` (Add-AppxProvisionedPackage + VCLibs, per Microsoft's Azure/WindowsAppKiosk Deploy-WindowsApp.ps1 pattern), Required to `SG-APM-Kiosk-Devices`, and **add it to the Autopilot ESP blocking-app list** so provisioning completes before any sign-in. Remove the Store (new) assignment after cutover. The same package sets `HKLM\SOFTWARE\Microsoft\Windows365\SkipFRE=1` (skip first-run experience) and the auto-logoff session-reset values `AutoLogoffEnable=1` / `AutoLogoffTimeInterval=5` (decision 2026-06-10 — interval 5 not 10 because the documented trigger latency is up to 2x the interval, keeping the worst case inside the DD's 10-minute inactivity promise; per Microsoft this is data hygiene, not a security control — the authoritative wipe remains the AVD-side timers + reimage).

**(2) WebView2 Evergreen runtime present AND healthy.** The Windows App renders all content through `msedgewebview2.exe`; a broken/pending-update runtime renders a **blank white app** even though the runtime folder and registry version look present (field-confirmed; the fix is re-running the Evergreen bootstrapper). Deploy the WebView2 Standalone installer as an ESP-blocking Win32 app (dependency of (1)), plus the daily Remediation pair `Detect-/Remediate-WebView2Health.ps1` (in `outputs/ps-scripts/`) which catches the registry-vs-folder version-mismatch broken state that file-presence detection misses.

**(3) Shell Launcher optional feature.** The `Client-EmbeddedShellLauncher` Windows optional feature must be enabled on the device before the AssignedAccess/ShellLauncher CSP will apply; without it the profile reports an error (`0x87d1fde8`) or is silently ignored. Deploy the Intune Platform Script `Enable-ShellLauncherFeature.ps1` (in `outputs/scripts/` of the project workspace) targeted at `SG-APM-Kiosk-Devices` **before** assigning this profile:

| Platform script setting | Value |
|---|---|
| Name | `APM-Kiosk-EnableShellLauncherFeature` |
| Run using logged-on credentials | No |
| Enforce signature check | No |
| Run in 64-bit PowerShell host | Yes |
| Assignment | `SG-APM-Kiosk-Devices` |

The script is idempotent and defers the required reboot to the Autopilot ESP reboot (or the next Intune reboot cycle). Profile 5 retries on each Intune sync, so it lands after the feature is active even if both arrive in the same sync window.

Profile properties:

| Property | Value |
|---|---|
| Platform | Windows 10 and later |
| Profile type | Templates → Custom |
| Name | `Profile-APM-Kiosk-ShellLauncherV2` |
| OMA-URI | `./Vendor/MSFT/AssignedAccess/ShellLauncher` |
| Data type | **String** (paste the XML inline — do not use "String (XML file)", whose upload validator rejects valid ShellLauncher v2 patterns) |
| Value | (see XML body below) |
| **Assignment** | **`SG-APM-Kiosk-Devices`** |

XML body for Shell Launcher v2 (the per-user shell restriction pattern, Layer 3 of the device-bound access design):

The canonical, XSD-validated XML lives in `outputs/shell-launcher/` (three variants plus a README and the two XSD files). The structure below is the per-device pattern, **field-validated on the pilot bench 2026-06-10** (kiosk user signs in, Windows App auto-launches full screen as the shell). Substitute fresh GUIDs (`New-Guid`, keep the braces, same value in each `<Profile>` declaration and its `<Config>` reference) and the device's kiosk UPN. Note `V2:AllAppsFullScreen` is deliberately absent — Microsoft's Azure/WindowsAppKiosk reference XML and both 2025 field-confirmed configs omit it (see `scope/windows-app-shelllauncher-research.md`).

```xml
<?xml version="1.0" encoding="utf-8"?>
<ShellLauncherConfiguration
    xmlns="http://schemas.microsoft.com/ShellLauncher/2018/Configuration"
    xmlns:V2="http://schemas.microsoft.com/ShellLauncher/2019/Configuration">
  <Profiles>
    <!-- Everyone NOT named under <Configs> gets logoff.exe and is signed out at once.
         DefaultProfile is the schema-legal way to express this; Shell Launcher does NOT
         support <Account UserGroup="..."/> (that attribute belongs to multi-app
         Assigned Access, a different CSP/schema, and is rejected by the XSD). -->
    <DefaultProfile>
      <Shell Shell="C:\Windows\System32\logoff.exe">
        <DefaultAction Action="DoNothing"/>
      </Shell>
    </DefaultProfile>
    <!-- Windows App AUMID, field-confirmed 2026-06-09 on Win11 24H2 via Get-StartApps.
         Re-verify before each batch. V2:AppType="UWP" is REQUIRED for a UWP shell.
         RestartShell relaunches the app if it exits rather than dropping to a black screen.
         Action values are STRING enums (RestartShell|RestartDevice|ShutdownDevice|DoNothing),
         not the numeric 0/3 used by older schema revisions. -->
    <Profile Id="{guid-A}">
      <Shell Shell="MicrosoftCorporationII.Windows365_8wekyb3d8bbwe!Windows365"
             V2:AppType="UWP">
        <DefaultAction Action="RestartShell"/>
      </Shell>
    </Profile>
    <!-- Break-glass: local Administrators get a full desktop. Microsoft's pattern
         (Azure/WindowsAppKiosk). Field-validated 2026-06-10. Decision: break-glass is a
         LOCAL admin managed by Windows LAPS (LAPS policy on SG-APM-Kiosk-Devices; ensure
         the managed account exists - LAPS rotates passwords, it does not create accounts).
         Cyber to be informed per decision 2026-06-10. -->
    <Profile Id="{guid-B}">
      <Shell Shell="C:\Windows\explorer.exe">
        <DefaultAction Action="RestartShell"/>
      </Shell>
    </Profile>
  </Profiles>
  <Configs>
    <Config>
      <Account Name="AzureAD\kiosk-{serial}@apm.net.au"/>
      <Profile Id="{guid-A}"/>
    </Config>
    <Config>
      <Account Sid="S-1-5-32-544"/>
      <Profile Id="{guid-B}"/>
    </Config>
  </Configs>
</ShellLauncherConfiguration>
```

The pattern says:

- The named kiosk user gets the Windows App as their shell. There is **no** `AutoLogonAccount`: that element creates and manages a *local* standard user named `Kiosk` and cannot be pointed at an Entra UPN, and auto-logon would defeat the lock-screen credential model (the job seeker is meant to read the per-device credential and type it at the Windows sign-in). The signed-in kiosk identity SSOs into the AVD session via the Windows App shell.
- Every other user falls through to the `DefaultProfile` (logoff) and is signed out immediately.

**Fleet scaling — DECIDED 2026-06-11 (A4): per-device via the MDM Bridge WMI Provider.** A single Intune custom OMA-URI profile pushes one XML to every device and cannot carry a per-device UPN, so it can't be the fleet mechanism. The chosen route keeps each thin client locked to its own `kiosk-{serial}@apm.net.au` user (the DD's stated design, and the stronger per-*user* Layer 3): a Proactive Remediation generates the device-specific XML and applies it locally through the MDM Bridge WMI Provider (`root\cimv2\mdm\dmmap`, `MDM_AssignedAccess.ShellLauncher`, SYSTEM). Scripts: `outputs/shell-launcher/Detect-KioskShellLauncher.ps1` + `Remediate-KioskShellLauncher.ps1` (assigned to `SG-APM-Kiosk-Devices`). A remediation, not a one-shot platform script, because the kiosk user is created by the WP-2.5 runbook shortly after the device joins its group — the binding self-heals on the next cycle once the account exists. **Do NOT also deploy Profile 5 as an Intune custom OMA-URI ShellLauncher profile** — it writes the same CSP node and the two would fight; the OMA-URI form (`kiosk-shelllauncher.pilot.xml`) is pilot-only. The rejected alternative (`kiosk-shelllauncher.fleet-defaultprofile.xml`, one shared DefaultProfile=Windows App) is retained for reference only; it weakened Layer 3 to a shell restriction with the per-user binding leaning on CA device-binding, which APM declined.

**XSD-validated.** All `outputs/shell-launcher/` variants pass `xmllint --schema` against Microsoft's current Shell Launcher XSD. The earlier draft of this block failed validation on three counts: `<Account UserGroup="S-1-5-32-545"/>` (`UserGroup` not allowed), `<AutoLogonAccount Sid=""/>` (`AutoLogonAccount` accepts only the fixed `HiddenId`), and numeric `DefaultAction Action="0"`/`"3"` (the enum is string-valued). These are now fixed.

**Attribute case matters.** The Shell Launcher XSD defines the profile identifier attribute as `Id` (capital I, lowercase d) in **both** the `<Profiles>` declarations and the `<Configs>` references. XML attributes are case-sensitive; `ID` parses without error but the profile binding silently fails and the shell never applies. Microsoft Learn's own "complete example" contains this bug — the XSD is the ground truth. (Field-confirmed June 2026; reproduced via `xmllint` — `<Profile ID=…>` is rejected with "attribute 'ID' is not allowed".)

**AUMID verification.** The AUMID above — `MicrosoftCorporationII.Windows365_8wekyb3d8bbwe!Windows365` — was field-confirmed on 2026-06-09 against a Windows 11 24H2 reference install. The history of wrong values: v0.2 used `ms-availableapps://Microsoft.WindowsApp_8wekyb3d8bbwe` (a URI, not an AUMID); the DD body suggested `ms-resource://Microsoft.DesktopAppInstaller` (winget, not the Windows App); v0.3 through v0.3.2 used `MicrosoftCorporationII.MicrosoftRemoteDesktop_8wekyb3d8bbwe!Microsoft.RemoteDesktop.Client` (the pre-rebrand package, no longer present on fresh 24H2 installs). Microsoft has renamed this package repeatedly, so **re-verify on a reference install before each deployment batch**:

```powershell
Get-StartApps | Where-Object Name -like '*Windows*'
# The "AppID" column gives the AUMID string. Use that value verbatim in the XML.
# If the app is not in Start for the signed-in user, enumerate packages instead:
Get-AppxPackage -Name "*Windows365*" | ForEach-Object {
    $pfn = $_.PackageFamilyName
    (Get-AppxPackageManifest $_).package.applications.application.id |
        ForEach-Object { "$pfn!$_" }
}
```

Document the verified AUMID and the date of verification in `evidence/aumid-verification.md`. Re-verify if a future Windows App update changes the package name. The Calibration Notes raise this as a DD V0.4 defect against §5.1.1.2 / §4.3.

**Troubleshooting a failed apply.** The Intune device configuration report shows only the generic `0x87d1fde8` for any CSP failure. The real cause is on the device: `Event Viewer → Applications and Services Logs → Microsoft → Windows → AssignedAccess → Admin` (configuration apply/error events) and `→ DeviceManagement-Enterprise-Diagnostics-Provider → Admin` (MDM delivery). Common causes: feature not enabled (see prerequisite above), `ID` instead of `Id`, smart quotes or non-breaking spaces from a rich-text copy-paste, kiosk account not yet present on the device (Shell Launcher resolves `AzureAD\<UPN>` accounts only after the account exists / has signed in once).

DD reference: DD §4.3 paragraph 153.

#### Profile 6: Edge browser policies

**Rebuilt in the 2026-06-10 drift review (A10).** The earlier version carried 7 settings against the DD's 14 (Table 14) and directly contradicted the DD on downloads — it blocked them, while DD requirement 15 (Must) needs job seekers to download resume templates and save to USB. This version implements the full DD Table 14 set, keeps the earlier version's useful additions (marked *plan addition*), and corrects two DD Table 14 values that conflict with closed DD decisions (marked, raised as DD V0.4 defects).

| Property | Value |
|---|---|
| Platform | Windows 10 and later |
| Profile type | Settings catalog |
| Name | `Profile-APM-AVD-EdgeHardening` |
| **Assignment** | **`SG-APM-AVD-SessionHosts`** |

Settings (Settings catalog → Microsoft Edge; catalog names may drift — search by the policy key):

| Policy key | Value | Source |
|---|---|---|
| `RestoreOnStartup` | 4 (Open a list of URLs) — startup URL list from WP-1.0 (default: Workforce Australia home) | DD Table 14 |
| `ClearBrowsingDataOnExit` | Enabled | DD Table 14 (FVE test T10 depends on this) |
| `ForceEphemeralProfiles` | Enabled | DD Table 14 |
| `PasswordManagerEnabled` | Disabled | DD Table 14 |
| `AutofillAddressEnabled` | Disabled | DD Table 14 |
| `AutofillCreditCardEnabled` | Disabled | DD Table 14 |
| `SavingBrowserHistoryDisabled` | Enabled | DD Table 14 |
| `SearchSuggestEnabled` | Disabled | DD Table 14 |
| `BrowserSignin` | 0 (Disabled) | DD Table 14 |
| `SyncDisabled` | Enabled | DD Table 14 |
| `DefaultGeolocationSetting` | 2 (Block) | DD Table 14 |
| `DownloadRestrictions` | 0 (No restrictions) | DD Table 14 — downloads land in the ephemeral session profile, destroyed on reimage; required for resume templates → USB (requirement 15) |
| `PrintingEnabled` | **Disabled** | DD Table 14 says Enabled, but that predates DR-002 (closed: email-to-caseworker, "printing is not required in this design"). DD V0.4 defect raised to align Table 14 |
| `ManagedFavorites` | (configured in Profile 7 — keep separate so the bookmark list can change without touching the hardening profile) | DD Table 14 / DD V0.4 note |
| `BlockThirdPartyCookies` | Enabled | *plan addition* |
| `InPrivateModeAvailability` | Disabled | *plan addition* |
| `SmartScreenEnabled` | Enabled | *plan addition* |
| `DefaultSearchProviderEnabled` + Bing | Enabled / Bing | *plan addition* |
| `BasicAuthOverHttpEnabled` | Disabled | *plan addition* |

Rationale. Edge is installed on the AVD golden image (WP-2.10). The job seeker's Edge usage happens inside the AVD session, not on the thin client. The thin client does not have Edge installed; this policy is a no-op there. The full DD set matters: the privacy cluster (`PasswordManagerEnabled`, autofill, history, sign-in, sync) is what stops one job seeker's data leaking to the next within an unreimaged window, and `ClearBrowsingDataOnExit` is the first of the three independent destruction mechanisms in DD §7's information lifecycle.

DD reference: DD §4.3 Table 14; DD DR-002 (printing closed); drift review A10; FVE addendum tests T2/T10.

#### Profile 7: Edge managed favourites (bookmark list from WP-1.0)

| Property | Value |
|---|---|
| Platform | Windows 10 and later |
| Profile type | Settings catalog |
| Name | `Profile-APM-AVD-EdgeFavourites` |
| Microsoft Edge → Configure favourites → Managed Favourites | (JSON below) |
| **Assignment** | **`SG-APM-AVD-SessionHosts`** |

Managed Favourites JSON (substitute the bookmark list from WP-1.0):

```json
[
  {
    "toplevel_name": "Job Seeker Resources"
  },
  {
    "name": "Workforce Australia",
    "url": "https://www.workforceaustralia.gov.au"
  },
  {
    "name": "MyGov",
    "url": "https://my.gov.au"
  },
  {
    "name": "{bookmark from WP-1.0}",
    "url": "{url from WP-1.0}"
  }
]
```

DD reference: DD §4.3 (Edge Managed Favourites sub-section, no explicit paragraph number; the scope is implied by Profile 6 hardening targeting session hosts).

#### Profile 8: Office 365 application access — REMOVED (2026-06-11)

Removed. Its only setting, *Disable Office Inventory Agent*, is a desktop-Office telemetry component — with no desktop Office installed (web-only confirmed 2026-06-11) there is nothing to inventory and the profile was inert. Web-only Office is enforced by **not installing desktop Office** and by Profile 2 allowing only Edge as the launchable app; no Office hardening profile is required. (DD §6.2 acknowledges web Office cannot be endpoint-hardened anyway — that residual risk is accepted in the DD.)

#### Profile 9: User profile cleanup

| Property | Value |
|---|---|
| Platform | Windows 10 and later |
| Profile type | Settings catalog |
| Name | `Profile-APM-AVD-ProfileCleanup` |
| Setting "Delete user profiles older than a specified number of days on system restart" | Enabled, 0 days |
| **Assignment** | **`SG-APM-AVD-SessionHosts`** |

Rationale. The DD §4.3 paragraph 169 names this profile's scope as `APM-SessionHosts` verbatim. User profiles materialise on the session host when a job seeker signs in; the cleanup deletes them on the next reimage. The thin client never has a user profile to clean up — it auto-logs in to one local kiosk account that never logs out. Assigning this to the thin client is a no-op.

DD reference: DD §4.3 paragraph 169 (verbatim).

#### Profile 10: Rotation Password Proactive Remediation (placeholder — built in WP-1.8 next)

Listed here as Profile 10 for completeness; the PR script itself is built in WP-1.8 below. **Assignment when activated:** `SG-APM-Kiosk-Devices` (the PR runs on the physical thin client to read the device serial, fetch the per-device password from the Credential Proxy Function App, and render the lock screen). Assignment is held until WP-2.7 unblocks in Phase 2B.

#### Profile 11: Session host time zone (new in v0.3.3)

**Why this profile exists.** The golden image build (WP-2.10) sets the time zone to AEST, but the `win11-24h2-avd` image resets time zone to UTC during the OOBE specialize phase on every session host provisioned from the captured image — the image-level setting does not survive (field-confirmed on the 2026.06.09 probe host). The only reliable path is declarative configuration post-deploy.

| Property | Value |
|---|---|
| Platform | Windows 10 and later |
| Profile type | Settings catalog |
| Name | `Profile-APM-AVD-TimeZone` |
| Settings | Search the catalog for "Time zone" (Administrative Templates → System → Locale Services, or the Time Language Settings category depending on catalog version) |
| Time zone value | `E. Australia Standard Time` (AEST/Brisbane; adjust if APM confirms per-site zones at WP-1.0) |
| **Assignment** | **`SG-APM-AVD-SessionHosts`** |

Belt-and-braces option: also enable **time zone redirection** at the host pool RDP properties (`timezone redirection:i:1`, set in WP-2.9) so the session inherits the connecting thin client's local zone. The Intune profile is the baseline; redirection refines per-site if APM operates across multiple time zones.

**Validation.** On the next session host provisioned (or after the next Intune sync on an existing host): `(Get-TimeZone).Id` returns `E. Australia Standard Time`, not `UTC`.

#### Profile 12: BitLocker — thin client OS drive (new 2026-06-11)

**Why this profile exists.** As-built addition (2026-06-11): APM requires BitLocker on the Windows 11 IoT Enterprise LTSC thin clients. The thin client holds little persistent data by design, but it does hold the Function key file (`C:\APM\Kiosk\funckey.txt`, Option B), the rendered credential lock screen, and Intune/Entra device state — disk encryption closes the stolen-device disk-extraction path and strengthens the ISM/RFFR data-at-rest position. The DD only specifies BitLocker on session hosts (Table 62); this extends it to the physical fleet — raised as a DD V0.4 addition.

| Property | Value |
|---|---|
| Blade | Intune → Endpoint security → Disk encryption → Create policy |
| Platform / profile | Windows 10 and later → BitLocker |
| Name | `Profile-APM-Kiosk-BitLocker` |
| **Assignment** | **`SG-APM-Kiosk-Devices`** |

Settings (the silent-enablement set — kiosks have no interactive admin, so every prompt must be suppressed):

| Setting | Value | Why |
|---|---|---|
| Require Device Encryption | Enabled | The enforcement switch |
| Allow Warning For Other Disk Encryption | **Disabled** | THE silent-enable setting — suppresses the user wizard; silent enablement requires Entra-joined + TPM |
| Allow Standard User Encryption | Enabled | Kiosk sessions never run as admin |
| Configure Recovery Password Rotation | Refresh on for Entra-joined devices | Key rotates after each recovery use |
| Encryption method (OS drive) | XTS-AES 256 | ISM-friendly margin over the 128 default |
| OS drive: Require startup authentication | TPM only — **no PIN, no startup key** | Kiosks must boot unattended (lock-screen credential model); a PIN would brick the fleet's reboot path |
| OS drive: Recovery key escrow | Store recovery information in Entra ID **before** enabling BitLocker; do not enable until backup succeeds; 48-digit password; hide recovery options from end users | Recovery via Entra portal / Graph only |
| Fixed data drives | Not configured | Thin clients have a single OS volume |
| Removable drives | **Not configured** | Deliberate: DD §5.2 explicitly excludes BitLocker-to-Go on job-seeker USB sticks (compatibility with their own devices). Do not let this policy collide with the WP-1.0 USB exception decision |

**Validation.**
- Pilot device encrypts silently within two sync cycles: `Get-BitLockerVolume -MountPoint C:` shows `ProtectionStatus: On`, `EncryptionMethod: XtsAes256`, protector = TPM.
- Recovery key visible in Entra: device → BitLocker keys (and via `Get-MgInformationProtectionBitlockerRecoveryKey`).
- Device reboots unattended to the lock screen — no PIN prompt (hard requirement).
- After fleet coverage: consider flipping `Compliance-APM-Kiosk-W11IoT`'s BitLocker/encryption setting from Not configured to Require, so CA's compliant-device gate also attests encryption (WP-1.3 follow-up; do not flip before the fleet reports encrypted or every kiosk goes non-compliant at once).

**Gotchas.**
- Silent enablement hard-requires TPM 2.0 ready (the Autopilot fleet qualifies, A-01) and fails silently on devices with TPM issues — watch the Endpoint security → Disk encryption report for "Not encrypted" stragglers and check `BitLocker-API` event log on those.
- IoT Enterprise **LTSC** carries the BitLocker CSP (same Enterprise binaries) — but this is the first LTSC-specific policy in the build; validate on the bench device before fleet assignment (the bench device channel should be confirmed as the WP-1.0 channel decision).
- Encryption runs in the background post-ESP; first-day device performance dips slightly. Used-space-only encryption keeps this short on fresh devices.

DD reference: none (as-built addition; DD V0.4 to add thin-client BitLocker alongside Table 62).

#### Profile 13: Windows LAPS — local `Admin` account (new 2026-06-11)

**Why this profile exists.** The break-glass decision (2026-06-10) is a local administrator managed by Windows LAPS. The the device-prep partner onboarding (WP-1.5 runbook) confirmed the Dell factory image ships a local admin account literally named **`Admin`** whose factory password is `Admin#<SERIAL-IN-CAPS>` — derivable from the serial printed on the chassis **and** rendered on the lock-screen asset tag. Every kiosk therefore ships with a guessable local admin until LAPS takes the account over and rotates it to a random value escrowed in Entra. This profile closes that exposure and is the mechanism behind the `BUILTIN\Administrators → explorer` break-glass entries in Profiles 5 and 2.

**Tenant prerequisite (do first, once).** Enable Entra LAPS at the directory level: `Entra admin centre → Devices → Device settings → Enable Microsoft Entra Local Administrator Password Solution (LAPS) = Yes`. Without it, clients have nowhere to back the password up and the policy reports an error.

**Account prerequisite.** LAPS *manages the password of an existing account — it does not create one*. The managed account `Admin` must already exist and be a member of the local Administrators group; the the device-prep partner factory image provides it, and the onboarding runbook deliberately leaves it in place. If a future image drops or renames that account, this policy silently manages nothing — verify on the pilot device.

| Property | Value |
|---|---|
| Blade | Intune → Endpoint security → Account protection → Create policy → Local admin password solution (Windows LAPS) |
| Name | `Profile-APM-Kiosk-LAPS` |
| **Assignment** | **`SG-APM-Kiosk-Devices`** |

| Setting | Value | Why |
|---|---|---|
| Backup Directory | **Microsoft Entra ID** | Entra-joined fleet; recovery via Entra/Graph, not on-prem AD |
| Administrator Account Name | **`Admin`** | The Dell factory local admin (NOT the built-in 500 — must be set explicitly or LAPS manages the wrong account) |
| Password Age Days | 30 | Routine rotation cadence |
| Password Complexity | Large + small letters + numbers + special (4) | Strongest |
| Password Length | 24 | Well above the 14 default; serial-derivable factory password is gone after first rotation |
| Post-Authentication Actions | **Reset the password and log off the managed account** (3) | After a break-glass sign-in, rotate so a used password is never reusable |
| Post-Authentication Reset Delay (hours) | 8 | Lets the technician finish, then auto-rotates the same day |

**Validation.**
- Pilot device: `Entra admin centre → Devices → <device> → Local administrator password` shows a recovery entry for `Admin`; `Get-LapsAADPassword -DeviceIds <id> -IncludePasswords` (or the portal) returns the current password.
- On the device, `Get-LapsDiagnostics` / Event Viewer `Microsoft-Windows-LAPS/Operational` shows a successful policy processing + password update event, managing account **`Admin`**.
- Confirm the **factory `Admin#<SERIAL>` password no longer works** after the first rotation (the whole point) and the Entra-stored password does.
- Break-glass dry run: retrieve the password from Entra, sign in as `Admin` on a kiosk → full desktop (Shell Launcher / Assigned Access break-glass profile), then confirm post-authentication rotation fires after the delay. Feed this into RB-5 (WP-5.4).

**Gotchas.**
- Setting a custom `Administrator Account Name` that doesn't exist = LAPS manages nothing, no error obvious in Intune. Confirm `Admin` exists on the pilot before fleet assignment.
- LAPS post-authentication reset needs the device online to write the new password to Entra before the action; an offline kiosk defers the rotation until it next checks in.
- The kiosk **autoboot** account (factory auto-logon) is a different account from `Admin` — do not point LAPS at it. LAPS targets only `Admin`.
- Don't enable EAS password restrictions on these devices — they break automatic-logon flows elsewhere in the build.

DD reference: none (as-built, follows the 2026-06-10 break-glass decision and the WP-1.5 the device-prep partner finding; DD V0.4 to document the LAPS-managed local admin).

**Validation.**
- Each profile appears under `Devices → Configuration` with the correct assignment per the table above.
- After WP-1.5 lands a pilot thin-client device: Profiles 5, 12, 13 and 10 (when activated) report Succeeded on that device; the device encrypts silently (Profile 12) and LAPS manages the `Admin` account (Profile 13).
- After WP-2.10 provisions the first session host (or the FVE host, whichever lands first): Profiles 2, 3, 4, 6, 7, 9, 11 report Succeeded on that host. (Profile 2 has an SKU caveat — see its Implementation caution; FVE test T4 is the acceptance test.)
- The thin client does **not** show Profiles 2, 3, 4, 6, 7, 9, 11 in its Intune device configuration page (correct — they are not assigned to it).
- The session host does **not** show Profiles 5, 10 and 12 in its Intune device configuration page (correct — they are not assigned to it).

**Gotchas.**
- The Shell Launcher v2 XML is unforgiving — a single malformed tag and the profile fails silently with "Configuration error" on the device. Validate the XML against an XSD or sanity-check by deploying to one test device before scaling. Also verify the Windows App AUMID with `Get-StartApps` per the verification step in Profile 5.
- Profile assignment order in Intune is alphabetical, not creation order; if you depend on one profile applying before another (you don't here), use Filters not order.
- Settings catalog profiles can drift over time as Microsoft renames settings. If a future profile creation fails with "setting not found", search the catalog for the new name and update this playbook.
- Intune evaluates "setting not applicable" silently. If a session-host-scoped profile (e.g. Profile 6 Edge) were mis-assigned to thin clients, Intune would mark it "Succeeded" without actually applying anything, which is the v0.2 trap that v0.3 fixes. After the first thin client and the first session host have provisioned in Phase 2A / Phase 3, spot-check both devices' Intune Configuration page and confirm only the correct profiles appear.
- Profile naming. v0.3 renames the seven active session-host profiles with a `Profile-APM-AVD-` prefix and the four thin-client profiles with a `Profile-APM-Kiosk-` prefix. This makes mis-assignment visually obvious in the Intune admin centre. Rename existing v0.2 profiles in-place during the WP-1.7 rebuild; the names are referenced only in this playbook and in `evidence/intune-profile-evidence.md`.

**References.** DD V0.3 §4.3 Intune Configuration Profiles; DD V0.3 §6.2 Microsoft Office Hardening.

---

### WP-1.8 — Rotation Password Proactive Remediation script (draft only) (1.5 d)

**Status:** APPROVED — **draft and unit-test only** (cyber item 2). Do not assign to any real device. [ ] Script drafted. [ ] Unit-tested in isolation. [ ] Held for WP-2.7 integration when Phase 2B unblocks.

**Purpose.** Draft the PowerShell detection + remediation scripts for the per-device password lock screen. Full integration testing happens in Phase 2 (WP-2.7) once the Credential Proxy Function App exists.

**Prerequisites.**
- DD §5.1.1.4 read in detail.
- Phase 2 Credential Proxy endpoint URL pattern agreed (placeholder for now).

**Procedure.**

1. Create the detection script. It runs hourly per the DD's PR schedule, checks whether the displayed credential matches the latest Key Vault version (via SHA256 hash comparison), and signals remediation if not.

```powershell
<#
.SYNOPSIS
    APM Kiosk lock screen credential hash detection script.
.DESCRIPTION
    Detection script for Intune Proactive Remediation. Runs as SYSTEM
    on the kiosk every hour. Reads the device serial via CIM (NOT
    deprecated WMI), calls the Credential Proxy Function App with
    bounded retry to retrieve the current per-device password, computes
    SHA256, and compares against the stamp written at the last
    successful remediation. If the hash mismatches (or no stamp
    exists), exits 1 to trigger the remediation script.

    Phase 1: this script is drafted but not yet deployed to production.
    Phase 2B (WP-2.7) integrates with the live Credential Proxy.

    Exit code policy (v0.3 hardened):
      0 = match (no action) OR transient call failure (fail-safe).
      1 = unrecoverable mismatch (trigger remediation).
    Rationale: a Credential Proxy outage should NOT trigger remediation,
    because the remediation script will also fail in the same outage
    and the second failure puts the device into an Intune-flagged
    failure state for no operational benefit. Stale lock-screen wallpaper
    is the correct behaviour during an outage; the next successful
    detection run will reconcile.
#>

[CmdletBinding()]
param(
    # Parameterised in v0.3 so the URL can be retargeted without
    # reissuing the Proactive Remediation. WP-2.7 injects the live
    # URL via Intune script parameters.
    [string]$CredentialProxyUrl = "https://{credentialProxyUrl}/api/GetPassword",
    [string]$KioskDir           = "C:\APM\Kiosk",
    [int]$MaxRetries            = 3,
    [int]$BaseDelaySeconds      = 2
)

$ErrorActionPreference = "Stop"

$hashStampPath  = Join-Path $KioskDir "current_hash.txt"
$wallpaperPath  = Join-Path $KioskDir "lockscreen.png"
$eventLogSource = "APMKioskRotation"

# Ensure event source exists (idempotent).
if (-not [System.Diagnostics.EventLog]::SourceExists($eventLogSource)) {
    [System.Diagnostics.EventLog]::CreateEventSource($eventLogSource, "Application")
}

function Write-KioskLog {
    param([string]$Message, [System.Diagnostics.EventLogEntryType]$Level = "Information", [int]$Id = 1000)
    Write-Output $Message
    [System.Diagnostics.EventLog]::WriteEntry($eventLogSource, $Message, $Level, $Id)
}

# Bail out early if the wallpaper file is missing — remediation is needed.
if (-not (Test-Path $wallpaperPath)) {
    Write-KioskLog "Wallpaper missing; triggering remediation" Warning 1001
    exit 1
}

# Read device serial via CIM (Get-WmiObject is deprecated since PowerShell 6).
try {
    # Strip non-alphanumerics per DD §5.1.1 (matches runbook / Credential Proxy convention).
    $serial = ((Get-CimInstance -ClassName Win32_BIOS -ErrorAction Stop).SerialNumber -replace '[^a-zA-Z0-9]', '').Trim().ToUpper()
} catch {
    Write-KioskLog "Could not read serial via CIM: $($_.Exception.Message). Fail-safe exit 0." Error 1002
    exit 0
}

if ([string]::IsNullOrWhiteSpace($serial)) {
    Write-KioskLog "Empty serial returned from CIM. Fail-safe exit 0." Error 1003
    exit 0
}

# Call Credential Proxy Function App with bounded retry + exponential back-off.
# The Function key for now is read from a script-vars file dropped by the
# provisioning script (WP-2.7 details the long-term Option A flow that
# replaces this with a Key Vault fetch via the device's Entra registration
# token). For pilot the key lives in C:\APM\Kiosk\funckey.txt with ACL
# restricted to SYSTEM read.
$functionKeyPath = Join-Path $KioskDir "funckey.txt"
if (-not (Test-Path $functionKeyPath)) {
    Write-KioskLog "Function key file missing at $functionKeyPath. Fail-safe exit 0." Error 1004
    exit 0
}
$functionKey = (Get-Content -Path $functionKeyPath -Raw).Trim()

$headers = @{ "x-functions-key" = $functionKey }
$body    = @{ serialNumber = $serial } | ConvertTo-Json

$response = $null
for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
    try {
        $response = Invoke-RestMethod -Method POST -Uri $CredentialProxyUrl `
            -Headers $headers -Body $body -ContentType "application/json" `
            -TimeoutSec 10
        break
    } catch {
        $delay = [Math]::Pow($BaseDelaySeconds, $attempt)
        Write-KioskLog "Credential Proxy call failed (attempt $attempt/$MaxRetries): $($_.Exception.Message). Retry in ${delay}s." Warning 1005
        if ($attempt -lt $MaxRetries) { Start-Sleep -Seconds $delay }
    }
}

if (-not $response) {
    Write-KioskLog "All $MaxRetries attempts to Credential Proxy failed. Fail-safe exit 0 (stale lock screen retained)." Error 1006
    exit 0
}

$currentPassword = $response.password
if ([string]::IsNullOrWhiteSpace($currentPassword)) {
    Write-KioskLog "Credential Proxy returned empty password. Fail-safe exit 0." Error 1007
    exit 0
}

# Compute SHA256.
$bytes        = [System.Text.Encoding]::UTF8.GetBytes($currentPassword)
$computedHash = [System.BitConverter]::ToString(
    [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)).Replace("-", "")

# Compare with stamp.
if (Test-Path $hashStampPath) {
    $storedHash = (Get-Content -Path $hashStampPath -Raw).Trim()
    if ($storedHash -eq $computedHash) {
        Write-KioskLog "Hash match; no remediation needed" Information 1008
        exit 0
    }
}

Write-KioskLog "Hash mismatch (or no stamp); triggering remediation" Information 1009
exit 1
```

2. Create the remediation script. It regenerates the lock screen image with the new password and writes the new hash stamp.

```powershell
<#
.SYNOPSIS
    APM Kiosk lock screen credential remediation script.
.DESCRIPTION
    Runs when the detection script exits 1. Pulls the current per-device
    password from the Credential Proxy with bounded retry, generates a
    1920x1080 lock screen image with the device-specific UPN and
    password displayed in white text on the APM-branded background,
    writes the new SHA256 stamp, and sets the lock screen wallpaper via
    the Personalization CSP.
.NOTES
    Runs as SYSTEM. Output captured to Proactive Remediation logs.
    Exit codes: 0 = success or fail-safe; 1 = unrecoverable error.
#>

[CmdletBinding()]
param(
    [string]$CredentialProxyUrl = "https://{credentialProxyUrl}/api/GetPassword",
    [string]$KioskDir           = "C:\APM\Kiosk",
    [int]$MaxRetries            = 3,
    [int]$BaseDelaySeconds      = 2,
    [int]$Width                 = 1920,
    [int]$Height                = 1080
)

$ErrorActionPreference = "Stop"

$hashStampPath  = Join-Path $KioskDir "current_hash.txt"
$wallpaperPath  = Join-Path $KioskDir "lockscreen.png"
$eventLogSource = "APMKioskRotation"

if (-not (Test-Path $KioskDir)) {
    New-Item -Path $KioskDir -ItemType Directory -Force | Out-Null
}
if (-not [System.Diagnostics.EventLog]::SourceExists($eventLogSource)) {
    [System.Diagnostics.EventLog]::CreateEventSource($eventLogSource, "Application")
}

function Write-KioskLog {
    param([string]$Message, [System.Diagnostics.EventLogEntryType]$Level = "Information", [int]$Id = 2000)
    Write-Output $Message
    [System.Diagnostics.EventLog]::WriteEntry($eventLogSource, $Message, $Level, $Id)
}

# Read serial via CIM (not deprecated WMI).
try {
    # Strip non-alphanumerics per DD §5.1.1 (matches runbook / Credential Proxy convention).
    $serial = ((Get-CimInstance -ClassName Win32_BIOS -ErrorAction Stop).SerialNumber -replace '[^a-zA-Z0-9]', '').Trim().ToUpper()
} catch {
    Write-KioskLog "Could not read serial via CIM: $($_.Exception.Message). Exit 1." Error 2001
    exit 1
}

# Function key from local SYSTEM-readable file (see detection script comment).
$functionKeyPath = Join-Path $KioskDir "funckey.txt"
if (-not (Test-Path $functionKeyPath)) {
    Write-KioskLog "Function key file missing. Exit 1." Error 2002
    exit 1
}
$functionKey = (Get-Content -Path $functionKeyPath -Raw).Trim()

$headers = @{ "x-functions-key" = $functionKey }
$body    = @{ serialNumber = $serial } | ConvertTo-Json

# Bounded retry as in detection.
$response = $null
for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
    try {
        $response = Invoke-RestMethod -Method POST -Uri $CredentialProxyUrl `
            -Headers $headers -Body $body -ContentType "application/json" `
            -TimeoutSec 10
        break
    } catch {
        $delay = [Math]::Pow($BaseDelaySeconds, $attempt)
        Write-KioskLog "Credential Proxy call failed (attempt $attempt/$MaxRetries): $($_.Exception.Message). Retry in ${delay}s." Warning 2003
        if ($attempt -lt $MaxRetries) { Start-Sleep -Seconds $delay }
    }
}

if (-not $response) {
    Write-KioskLog "All $MaxRetries attempts to Credential Proxy failed during remediation. Exit 1 — next detection cycle will retry." Error 2004
    exit 1
}

$upn      = $response.upn
$password = $response.password

# Generate 1920x1080 lock screen PNG
Add-Type -AssemblyName System.Drawing
$bitmap   = New-Object System.Drawing.Bitmap $Width, $Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([System.Drawing.Color]::FromArgb(20, 30, 80))  # APM brand colour TBC from WP-1.0
$font     = New-Object System.Drawing.Font("Segoe UI", 48, [System.Drawing.FontStyle]::Bold)
$brush    = [System.Drawing.Brushes]::White
$graphics.DrawString("Username: $upn", $font, $brush, 100, 400)
$graphics.DrawString("Password: $password", $font, $brush, 100, 500)
$warningFont = New-Object System.Drawing.Font("Segoe UI", 24)
$graphics.DrawString(
    "This device automatically deletes all content after 10 minutes of inactivity.",
    $warningFont, $brush, 100, 700)
$graphics.DrawString(
    "Save personal information to your USB device or personal email before signing out.",
    $warningFont, $brush, 100, 740)
# Asset tag per DD §6.2 Table 52 (username, password, asset tag, data wipe notice).
$tagFont = New-Object System.Drawing.Font("Segoe UI", 18)
$graphics.DrawString("Device: $env:COMPUTERNAME", $tagFont, $brush, 100, ($Height - 60))
$bitmap.Save($wallpaperPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

# Compute and store the new hash
$bytes        = [System.Text.Encoding]::UTF8.GetBytes($password)
$computedHash = [System.BitConverter]::ToString(
    [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)).Replace("-", "")
$computedHash | Out-File -FilePath $hashStampPath -Encoding utf8 -NoNewline

# Set the lock screen wallpaper via PersonalizationCSP
$regPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Personalization"
if (-not (Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}
Set-ItemProperty -Path $regPath -Name "LockScreenImage" -Value $wallpaperPath

Write-Output "Lock screen regenerated for $upn (hash=$computedHash)"
```

3. Test both scripts locally in a development VM. Substitute a mock Credential Proxy response (a local HTTP listener returning a fixed `{ "upn": "...", "password": "..." }` JSON body) so you can exercise the hash-compare and retry logic without Phase 2B in place. Confirm the retry loop fires three times against an unreachable URL and the script exits 0 (fail-safe), not 1.

4. Stage in `./outputs/ps-scripts/` for review and Phase 2B integration testing.

5. Do **not** deploy as an Intune Proactive Remediation yet. WP-2.7 (in Phase 2B) wires this up against the real Credential Proxy.

**Validation.**
- Both scripts parse without syntax errors (`Invoke-ScriptAnalyzer -Path .\detect.ps1` and `.\remediate.ps1`; no warnings on `PSAvoidUsingWMICmdlet`).
- A local dry-run with a mocked Credential Proxy returns sensible output and produces a sample lock screen PNG.
- A local dry-run against an unreachable URL exercises the retry loop three times and the detection script exits 0 (fail-safe), not 1.
- APM brand colour applied to the PNG looks reasonable (open in Preview / Photos).
- Event log entries appear under Application log with source `APMKioskRotation` for each retry attempt and the final outcome.

**Gotchas.**
- Lock screen image is `$Width`x`$Height` (default 1920x1080) for most kiosk display hardware. If APM has higher-resolution displays in the fleet, pass the right resolution via Intune script parameters at deployment time rather than editing the script.
- The PNG is written to `C:\APM\Kiosk\` which the standard user cannot read — `LockScreenImage` policy requires a SYSTEM-readable path. The `C:\APM\Kiosk\` folder ACL needs SYSTEM read+write; the script's `New-Item` creates with inherited ACLs which by default permit SYSTEM read.
- The PersonalizationCSP path differs slightly between Windows 11 versions. The path above works on Windows 11 IoT Enterprise 23H2; revalidate if APM moves to a newer Windows 11 IoT LTSC release.
- v0.2 used `Get-WmiObject` which is deprecated since PowerShell 6 and emits an analyzer warning. v0.3 uses `Get-CimInstance`.
- v0.2 had no retry on the Function App call, no error handling, no fail-safe behaviour, and a hard-coded URL. v0.3 fixes all four. The exit-code policy is also inverted from v0.2: a Credential Proxy outage now exits 0 (do not trigger remediation) rather than exiting 1 (which would cascade into a failed remediation and an Intune-flagged failure state).
- The Function key currently lives in `C:\APM\Kiosk\funckey.txt` (set by the provisioning script). This is Option B from DD §5.1.1 — acceptable for pilot, not the production-target Option A. The DD's Option A (PR script authenticates to Key Vault using device identity to fetch its own Function key at runtime) requires a non-trivial design effort that has not yet been completed. v0.3 of this plan flags Option A as a Phase 2B prerequisite (see Calibration Notes). The transition path: either design the Option A flow end-to-end before Phase 2B unblocks, or accept Option B as the production design and rotate Function keys quarterly with the password.

**References.** DD V0.3 §6.1.1.1.7 Lock Screen Image Generation; DD V0.3 §6.1.5 Naming Convention; DD V0.3 §5.1.1 paragraph 220 (Credential Proxy authentication options).

---

### Phase 1 acceptance checklist

Before declaring Phase 1 complete and moving to Phase 2A, confirm:

- [ ] All four Entra ID groups exist (`SG-APM-Kiosk-Users`, `SG-APM-Kiosk-CA-Exclusion`, `SG-APM-Kiosk-Admins`, `SG-APM-AVD-SessionHosts`).
- [ ] Dynamic device group `SG-APM-Kiosk-Devices` exists and resolves to the Autopilot profile.
- [ ] Internal sensitivity label applied to the kiosk workspace.
- [ ] Two compliance policies exist: `Compliance-APM-Kiosk-W11IoT` assigned to `SG-APM-Kiosk-Devices`, and `CMP-APM-AVD-SessionHosts` assigned to `SG-APM-AVD-SessionHosts`.
- [ ] All five Conditional Access policies exist in **Report-only** state (cyber item 1). Validation scenarios pass in report-only. Enforcement flip held until cyber re-approves.
- [ ] Break-glass admin accounts are excluded from all five CA policies (verified by sign-in log evidence).
- [ ] Autopilot deployment profile `APM-Kiosk-SelfDeploying` exists.
- [ ] Hardware-hash ingestion workflow with the device-prep partner has run end-to-end with at least one pilot device.
- [ ] Pilot device self-provisions and lands as Compliant against `Compliance-APM-Kiosk-W11IoT` within 30 minutes. (Compliance check against `CMP-APM-AVD-SessionHosts` is deferred to Phase 2A when the first session host provisions.)
- [ ] All eleven active Intune configuration profiles exist with the correct assignment per the WP-1.7 summary table (seven on session hosts including the restored Profile 2 in-session lockdown, four on thin clients including the Profile 12 BitLocker and Profile 13 LAPS additions; Profiles 1 and 8 removed as web-only no-ops). Validate by spot-check on Intune `Devices → Configuration → Filter by group`. Profile 2 = Edge-only allow-list; enforcement route (Assigned Access vs AppLocker fallback) confirmed on the FVE host (test T4). Profile 13: Entra LAPS enabled at tenant level; `Admin` account managed and rotated off its factory password.
- [ ] `Client-EmbeddedShellLauncher` feature-enable Platform Script (`Enable-ShellLauncherFeature.ps1`) deployed to `SG-APM-Kiosk-Devices` and reporting success.
- [ ] Profile 5 Shell Launcher v2 AUMID verified on a reference Windows App install (`Get-StartApps`) and recorded in `evidence/aumid-verification.md`.
- [ ] Shell Launcher v2 XML applied to test device and the per-user shell behaves as designed (non-kiosk users get logoff.exe).
- [ ] Profile 11 time zone profile created and assigned to `SG-APM-AVD-SessionHosts` (validation deferred to first session host).
- [ ] Rotation Password PR scripts (detect + remediate) are drafted, syntax-clean (`Invoke-ScriptAnalyzer` clean), retry logic exercised, and staged for Phase 2B.
- [ ] WP-1.6 (Azure Automation Account) **not executed** in Phase 1 — relocated to Phase 2B per cyber item 4.
- [ ] Phase 1 evidence pack in `evidence/phase-1-signoff.md` references all of the above with timestamps and operator initials.

Sign off Phase 1 acceptance in `./evidence/phase-1-signoff.md` with the date and the evidence linked.

---

## Phase 2 — AVD Infrastructure + Credential Management

**Effort:** ~21 days single resource (the largest phase). Approximately 6.5 days under cyber approval today (Phase 2A, includes the new 0.5 d WP-2.0a resource group scaffold); the remaining 14.5 days (Phase 2B, includes the relocated 0.5 d WP-1.6) is BLOCKED awaiting network design finalisation and cyber re-approval.
**Phase status:** SPLIT — Phase 2A (APPROVED, AVD definitions and golden image) and Phase 2B (BLOCKED, network and credential infrastructure).
**Phase checkbox:** [ ] Phase 2A complete. [ ] Network design finalised and cyber unblock confirmed. [ ] Phase 2B complete.
**Outcome:** Network architecture deployed; credential management infrastructure (Key Vault → Credential Proxy Function App → Hybrid Runbook Worker → Automation Runbooks) operational with end-to-end rotation cycle verified; AVD host pool live with golden image, auto-scaling, and single-session enforcement; Zscaler outbound integration tested.

### Phase 2A — APPROVED (cyber item 3)

The following work can proceed now. Definitions and logic only; no session host VM deployment, no credential infrastructure, no network configuration.

- **WP-2.0a (Resource group and RBAC scaffold)** — new in v0.3.1; prerequisite for everything else in Phase 2A.
- WP-2.9 (Nerdio Manager + AVD host pool, definitions only)
- WP-2.10 (AVD Golden image)
- WP-2.11 (Nerdio auto-scaling, logic only)
- WP-2.12 (Single-session enforcement, definitions only)
- WP-2.13 (AVD application group permissions)
- WP-2.14 (Microsoft Office hardening, web-only)

### Phase 2B — BLOCKED (cyber item 4, awaiting network design)

Do not start any of the following until APM finalises the network design and cyber re-approves item 4. The previously proposed public-endpoint workaround has been rejected.

- **WP-1.6 (Azure Automation Account + initial UPN runbook)** — relocated here in v0.3 from Phase 1.
- WP-2.1 (Network architecture)
- WP-2.2 (DNS architecture)
- WP-2.3 (Key Vault + private endpoint)
- WP-2.8 (Hybrid Runbook Worker)
- WP-2.4 (Credential Proxy Function App)
- WP-2.5 (Full Kiosk User Account Creation runbook)
- WP-2.6 (Kiosk User Password Rotation runbook)
- WP-2.7 (End-to-end rotation cycle test)
- WP-2.15 (Zscaler outbound integration)

### Execution ordering (Phase 2B)

The execution order below applies once Phase 2B unblocks. Phase 2A can run today in parallel with the wait on Phase 2B's network design.

| Thread | Work packages | Notes |
|---|---|---|
| **A — Network foundation** | WP-2.1, WP-2.2 | Run first; everything else in Phase 2B depends on this. **(BLOCKED)** |
| **B — Credential management** (sequential) | WP-1.6 → WP-2.3 → WP-2.8 → WP-2.4 → WP-2.5 → WP-2.6 → WP-2.7 | WP-1.6 is first in B because the Automation Account underpins everything that follows. WP-2.8 (Hybrid Worker) moves earlier than the original numbering — runbooks need somewhere to run before they can be tested. **(BLOCKED)** |
| **C — AVD build** (sequential; can start in parallel with B once A is done) | WP-2.9 → WP-2.10 → WP-2.11 → WP-2.12 → WP-2.13 | Golden image (WP-2.10) is the biggest single item; protect 3 days of focused time. **(APPROVED, definitions and image only)** |
| **D — Final integration** | WP-2.14 **(APPROVED)**, WP-2.15 **(BLOCKED)** | After threads B and C. |

Parallelising threads B and C compresses elapsed time from ~20 weeks to ~6-8 weeks at the same resource-days, once Phase 2B unblocks.

---

### WP-1.6 — Azure Automation Account + initial UPN runbook (0.5 d) — relocated to Phase 2B

**Status:** **APPROVED (2026-06-11)** — cyber carved the Automation Account out of item 4 and approved it. [x] Automation Account `aa-apm-kiosk` created (implementer as Owner). [ ] System-assigned managed identity confirmed on. [ ] AU-scoped Graph permissions consented by APM IAM. [ ] Starter runbook published. The AA needs no network (cloud resource; starter runbook uses Graph in the sandbox); the production runbooks WP-2.5/2.6 and the HRW WP-2.8 that depend on it remain blocked on Key Vault + the VNet.

**Purpose.** Establish the Azure Automation Account that hosts the kiosk-user-creation and password-rotation runbooks. WP-2.5 builds the production user-creation runbook on top of this account; WP-2.6 adds the rotation runbook.

**v0.3 changes vs v0.2.** This WP was originally numbered WP-1.6 and sequenced inside Phase 1; v0.3 relocated it into Phase 2B because cyber item 4 named the Automation Account. The UPN format inside the starter runbook has been corrected to the DD's `kiosk-{serial}@apm.net.au` form (v0.2 incorrectly used `{serial}@apm.onmicrosoft.com`). The Graph permission assignment now uses `Find-MgGraphPermission` for self-documenting role lookup rather than hard-coded GUIDs (F-20).

**As-built 2026-06-11 — APPROVED and created.** Cyber approved the Automation Account ahead of the rest of Phase 2B; `aa-apm-kiosk` is created with the project team as **Owner** (hand Owner to APM at engagement close, WP-5.6). This WP is therefore live, even though the surrounding Phase 2B (Key Vault, Function App, HRW, runbooks, network) stays blocked. What this unblocks: the AA scaffold and the **starter** user-creation runbook (Graph-only, temporary password, runs in the Azure sandbox — no Key Vault, no HRW). What it does NOT unblock: the **production** runbooks WP-2.5 (Key Vault-backed password) and WP-2.6 (rotation), and WP-2.8 (HRW) — those need the Key Vault private endpoint and the VNet, both still blocked. Do not enrol production kiosks against the starter runbook alone (its temporary password is a placeholder WP-2.5 replaces).

**Prerequisites.**
- Owner/Contributor on the kiosk resource group (the project team is Owner on `aa-apm-kiosk` as of 2026-06-11).
- `AU-APM-Kiosk` Administrative Unit exists and APM IAM available to consent the AU-scoped Graph permissions (step 4).
- `apm.net.au` confirmed as a verified Entra domain (WP-1.0 input).
- No network dependency — the Automation Account is a cloud resource and the starter runbook calls Graph from the Azure sandbox.

**Procedure.**

1. **[DONE 2026-06-11]** Resource group present and Automation Account `aa-apm-kiosk` created (implementer as Owner). Commands retained for reference / rebuild:

```bash
az group create --name auea-rg-avd-ctrl-kiosk-001 --location australiaeast --tags "Project=APMKiosk" "Sensitivity=Internal"
```

2. **[DONE 2026-06-11]** Automation Account created:

```bash
az automation account create \
    --resource-group auea-rg-avd-ctrl-kiosk-001 \
    --name aa-apm-kiosk \
    --location australiaeast \
    --sku Basic \
    --tags "Project=APMKiosk" "Sensitivity=Internal"
# Verify: az automation account show -g auea-rg-avd-ctrl-kiosk-001 -n aa-apm-kiosk
# Confirm Owner role assignment is the project team (transfers to APM at WP-5.6 handover).
```

3. **[DONE 2026-06-11]** Enable system-assigned managed identity on the Automation Account. **As-built:** the identity was already ON from account creation (verified in the portal: Account Settings → Identity → System assigned). The Object (principal) ID on that blade is the input to step 4. Commands retained for reference / rebuild:

```bash
# The entire `az automation` group lives in the `automation` CLI EXTENSION, not core
# Azure CLI (field finding 2026-06-11: bare Cloud Shell fails with "'automation' is
# misspelled or not recognized"). Install once — this also covers every later
# `az automation` command in this plan (WP-2.5/2.7/2.8 runbooks, schedules, hrwg).
# Cloud Shell persists extensions only when backed by a mounted storage account;
# ephemeral sessions need the add re-run.
az extension add --name automation

az automation account identity assign \
    --resource-group auea-rg-avd-ctrl-kiosk-001 \
    --name aa-apm-kiosk
```

If the installed extension version does not expose `identity assign`, use the core-CLI
fallback (no extension required):

```bash
az resource update \
    --resource-group auea-rg-avd-ctrl-kiosk-001 \
    --name aa-apm-kiosk \
    --resource-type "Microsoft.Automation/automationAccounts" \
    --set identity.type=SystemAssigned
```

Capture the principal ID — it appears in the JSON output (or read it back with the
command below). Note it for the Graph role assignment step.

```bash
az resource show -g auea-rg-avd-ctrl-kiosk-001 -n aa-apm-kiosk \
    --resource-type "Microsoft.Automation/automationAccounts" \
    --query identity.principalId -o tsv
```

4. Grant the Automation Account managed identity its directory access — **the role-based model adopted 2026-06-11 (supersedes Permission Requirements v0.2; v0.3 to issue after validation)**. APM IAM correctly identified that Graph application permissions cannot be AU-scoped: consent is tenant-wide, and the only AU-scoping mechanism is a directory role assignment with `directoryScopeId = /administrativeUnits/{id}` (Microsoft Learn, "Assign Microsoft Entra roles", AU-scope section; the app-only pattern and its read-baseline requirement are documented on the Graph "Add a member" API page). Do not request the v0.2 app-permission set. The adopted model carries **no tenant-wide write of any kind**:

| Access | Mechanism | Covers |
|---|---|---|
| Password rotation | **Password Administrator** scoped to `AU-APM-Kiosk-Users` | Password resets for the non-admin kiosk users in the AU (WP-2.6/2.7) |
| Kiosk group membership | **Groups Administrator** scoped to `AU-APM-Kiosk-Groups` | Membership of `SG-APM-Kiosk-Users` (the group object sits in that AU) |
| Directory reads | **Directory Readers**, tenant scope | App-only read baseline; device-group reads |
| User creation / licensing | **Not granted** | Creation cannot be AU-scoped — it moves to APM IAM (bulk CSV at rollout, ad hoc for swaps; also resolves A8). Recommend group-based F3 licensing on `SG-APM-Kiosk-Users` so the licence follows membership |

**Prerequisite — TWO Administrative Units** (a dynamic-membership AU cannot contain groups; Microsoft's documented workaround is one AU for users, one for groups):

- `AU-APM-Kiosk-Users` — **dynamic** membership, rule `user.userPrincipalName startsWith "kiosk-"`. New kiosk users join automatically; the rule evaluates with minutes of lag, so runbooks must tolerate a just-created user not yet being in scope. Restricted-management optional (APM's call — it blocks tenant-wide admins and apps from touching members, which strengthens the model).
- `AU-APM-Kiosk-Groups` — **assigned** membership, containing `SG-APM-Kiosk-Users` and `SG-APM-Kiosk-Devices`.

APM IAM (Privileged Role Administrator) performs the AU creation and role assignments — the preferred least-trust path. Reference commands for their use:

```powershell
Connect-MgGraph -Scopes "RoleManagement.ReadWrite.Directory" -NoWelcome

$mi       = Get-MgServicePrincipal -Filter "displayName eq 'aa-apm-kiosk'"
$usersAu  = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'AU-APM-Kiosk-Users'"
$groupsAu = Get-MgDirectoryAdministrativeUnit -Filter "displayName eq 'AU-APM-Kiosk-Groups'"

$assignments = @(
    @{ Role = 'Password Administrator'; Scope = "/administrativeUnits/$($usersAu.Id)"  }
    @{ Role = 'Groups Administrator';   Scope = "/administrativeUnits/$($groupsAu.Id)" }
    @{ Role = 'Directory Readers';      Scope = '/' }
)
foreach ($a in $assignments) {
    $def = Get-MgRoleManagementDirectoryRoleDefinition -Filter "displayName eq '$($a.Role)'"
    New-MgRoleManagementDirectoryRoleAssignment `
        -PrincipalId $mi.Id `
        -RoleDefinitionId $def.Id `
        -DirectoryScopeId $a.Scope | Out-Null
    Write-Host "Assigned $($a.Role) at scope $($a.Scope)"
}
```

After assignment, verify the scopes (expect the two roles at `/administrativeUnits/{id}` and Directory Readers at `/`):

```powershell
Get-MgRoleManagementDirectoryRoleAssignment -Filter "principalId eq '$($mi.Id)'" |
    Select-Object RoleDefinitionId, DirectoryScopeId
```

5. Create the WP-1.6 validation runbook. **As-built 2026-06-11: this replaces the v0.2 "starter Create-KioskUser"** — under the adopted role model the MI holds no user-creation rights, so a creation starter can never pass; the WP-1.6 proof point is now that the MI can do exactly what production needs (read, password reset, group membership write) and nothing more.

   `Azure portal → Automation Accounts → aa-apm-kiosk → Process Automation → Runbooks → Create a runbook`.
   Name: `Test-KioskMIAccess`. Type: `PowerShell`. Runtime version: `7.2`.

6. Paste the content of `outputs/runbooks/Test-KioskMIAccess.ps1` (also in the build-reference scripts appendix). **Module prerequisite:** the PS 7.2 runtime has no Graph modules by default — import `Microsoft.Graph.Authentication`, `Microsoft.Graph.Users`, `Microsoft.Graph.Groups` and `Microsoft.Graph.Identity.DirectoryManagement` into the Automation Account first (`Modules → Add a module`, runtime 7.2), or the job fails at the first cmdlet with "command not recognised" before any permission is tested. The runbook runs four tests against the **test kiosk user only** (`-TestUserUpn`, `-KioskUsersGroupId`, optional `-UsersAuId`):

   1. Read the user — proves Directory Readers (tenant read baseline for app-only callers).
   2. Confirm the user is in `AU-APM-Kiosk-Users` — proves the dynamic rule caught it (WARN, not FAIL, if absent: the rule evaluates with minutes of lag).
   3. Reset the user's password — proves Password Administrator scoped to the users AU.
   4. Add the user to `SG-APM-Kiosk-Users` — proves Groups Administrator scoped to the groups AU. A "member already exists" response also passes: Graph evaluates authorisation before the duplicate check, so a 400 duplicate proves the write right without changing anything.

7. Publish, then run against the test kiosk user. Two cautions: (a) test 3 writes the new password to **job output** so the bench device stays usable — acceptable for the test user only (the WP-2.6 production rotation stores to Key Vault and never emits a password); record the new password for the bench after the run. (b) a 403 on test 3 can mean the dynamic AU rule has not picked the user up rather than a missing role — read test 2's result before concluding the assignment failed. A clean pass is the validation gate for issuing Permission Requirements v0.3.

8. Decide the runbook trigger model. DD §5.1.1 paragraph 191 specifies "polls the group via Microsoft Graph at a five-minute interval". **As-built 2026-06-11: the adopted permission model moves user creation to APM IAM (bulk CSV at rollout, ad hoc for device swaps), which supersedes the poller default and resolves A8 in the same stroke** — the poller needed `DeviceManagementManagedDevices.Read.All`, which sat outside the approved permission set, and creation cannot be AU-scoped anyway. Pending APM's confirmation, record the divergence from the DD's five-minute-poll wording as a DD V0.4 item.

**Validation.**
- Automation account exists: `az automation account show -g auea-rg-avd-ctrl-kiosk-001 -n aa-apm-kiosk` (needs the `automation` CLI extension; see step 3).
- Managed identity: confirmed ON (2026-06-11), principal ID captured from the Identity blade.
- Role assignments visible: `Get-MgRoleManagementDirectoryRoleAssignment -Filter "principalId eq '{principalId}'"` shows Password Administrator at `/administrativeUnits/{AU-APM-Kiosk-Users id}`, Groups Administrator at `/administrativeUnits/{AU-APM-Kiosk-Groups id}`, Directory Readers at `/`. No app-permission consents on the MI (`Enterprise applications → aa-apm-kiosk → Permissions` should be empty).
- `Test-KioskMIAccess` runbook published and **passed clean** against the test kiosk user — job output retained as evidence for Permission Requirements v0.3.
- Runbook is published with no syntax errors.

**Gotchas.**
- The starter runbook sets a temporary local password that is **not** secure for production. WP-2.5 replaces this with a Key Vault-sourced random password using a cryptographic RNG. Do not enrol production kiosks against this WP-1.6 runbook alone.
- The UPN form `kiosk-{serial}@apm.net.au` requires `apm.net.au` to be a verified Entra domain in the tenant. Verify before running the runbook (WP-1.0 input check); MgUser will return a generic 400 if the domain is unverified.
- `Find-MgGraphPermission` returns multiple results when the search string is a prefix of more than one permission. The pattern above filters for an exact name match via `Where-Object { $_.Name -eq $name }` then takes the first. If Microsoft Graph adds a new permission with the same name, the script will still work; if it removes one, the `throw` fires.

**References.** DD V0.3 §6.2 Azure Runbooks; DD V0.3 §5.1.1 paragraph 185 (UPN format); DD V0.3 §5.1.1 paragraph 191 (polling trigger model); DD V0.3 §5.1.1.3 Password Generation (production version of this runbook lives in WP-2.5); graph-powershell-patterns skill.

---

### WP-2.1 — Network architecture (2.5 d)

**Status:** **BLOCKED** (cyber item 4 — no networking configuration or build until APM signs off the finalised network design). [ ] Network design finalised by APM. [ ] Cyber unblock confirmed. [ ] Complete.

**Purpose.** Build the hub-and-spoke VNet topology that hosts AVD session hosts, the Credential Proxy Function App, the Hybrid Runbook Worker, and all private endpoints.

**Prerequisites.**
- Contributor on the kiosk subscription.
- Phase 1 complete (`auea-rg-avd-ctrl-kiosk-001` exists from WP-1.6).
- APM network team confirms IP ranges; if APM has an existing Azure landing zone with prescribed VNet patterns, those override this playbook.

**Procedure.**

1. Define address ranges (substitute with APM-confirmed values):

```bash
HUB_VNET_CIDR="10.100.0.0/22"
HUB_GATEWAY_SUBNET="10.100.0.0/27"
HUB_PE_SUBNET="10.100.0.96/27"
HUB_FUNCAPP_SUBNET="10.100.0.128/27"

AVD_SPOKE_CIDR="10.101.0.0/22"
AVD_SESSIONHOST_SUBNET="10.101.0.0/24"
AVD_PE_SUBNET="10.101.1.0/27"

SHARED_VNET_CIDR="10.102.0.0/24"
SHARED_SUBNET="10.102.0.0/26"
```

2. Create the three VNets:

```bash
RG="auea-rg-avd-ctrl-kiosk-001"
LOCATION="australiaeast"

# Hub
az network vnet create -g $RG -n vnet-apm-kiosk-hub \
    --address-prefixes $HUB_VNET_CIDR -l $LOCATION \
    --tags Project=APMKiosk Sensitivity=Internal
az network vnet subnet create -g $RG --vnet-name vnet-apm-kiosk-hub \
    --name GatewaySubnet --address-prefixes $HUB_GATEWAY_SUBNET
az network vnet subnet create -g $RG --vnet-name vnet-apm-kiosk-hub \
    --name snet-private-endpoints --address-prefixes $HUB_PE_SUBNET \
    --disable-private-endpoint-network-policies true
az network vnet subnet create -g $RG --vnet-name vnet-apm-kiosk-hub \
    --name snet-funcapp --address-prefixes $HUB_FUNCAPP_SUBNET \
    --delegations Microsoft.Web/serverFarms

# AVD Spoke
az network vnet create -g $RG -n vnet-apm-kiosk-avd \
    --address-prefixes $AVD_SPOKE_CIDR -l $LOCATION \
    --tags Project=APMKiosk Sensitivity=Internal
az network vnet subnet create -g $RG --vnet-name vnet-apm-kiosk-avd \
    --name snet-avd-sessionhosts --address-prefixes $AVD_SESSIONHOST_SUBNET
az network vnet subnet create -g $RG --vnet-name vnet-apm-kiosk-avd \
    --name snet-avd-pe --address-prefixes $AVD_PE_SUBNET \
    --disable-private-endpoint-network-policies true

# Shared Services
az network vnet create -g $RG -n vnet-apm-kiosk-shared \
    --address-prefixes $SHARED_VNET_CIDR -l $LOCATION
az network vnet subnet create -g $RG --vnet-name vnet-apm-kiosk-shared \
    --name snet-shared-service --address-prefixes $SHARED_SUBNET
```

3. Establish VNet peering (Hub ↔ AVD; Hub ↔ Shared):

```bash
for pair in "hub avd" "hub shared"; do
    set -- $pair
    az network vnet peering create -g $RG --name peer-$1-to-$2 \
        --vnet-name vnet-apm-kiosk-$1 --remote-vnet vnet-apm-kiosk-$2 \
        --allow-vnet-access --allow-forwarded-traffic
    az network vnet peering create -g $RG --name peer-$2-to-$1 \
        --vnet-name vnet-apm-kiosk-$2 --remote-vnet vnet-apm-kiosk-$1 \
        --allow-vnet-access --allow-forwarded-traffic
done
```

4. Create NAT Gateways for predictable outbound IPs (give the resulting IPs to APM for Zscaler/firewall rules):

```bash
# AVD spoke NAT
az network public-ip create -g $RG -n pip-natgw-avd \
    --sku Standard --allocation-method Static
az network nat gateway create -g $RG -n natgw-apm-kiosk-avd \
    --public-ip-addresses pip-natgw-avd --idle-timeout 10
az network vnet subnet update -g $RG --vnet-name vnet-apm-kiosk-avd \
    --name snet-avd-sessionhosts --nat-gateway natgw-apm-kiosk-avd

# Hub NAT (for Function App outbound)
az network public-ip create -g $RG -n pip-natgw-hub \
    --sku Standard --allocation-method Static
az network nat gateway create -g $RG -n natgw-apm-kiosk-hub \
    --public-ip-addresses pip-natgw-hub --idle-timeout 10
az network vnet subnet update -g $RG --vnet-name vnet-apm-kiosk-hub \
    --name snet-funcapp --nat-gateway natgw-apm-kiosk-hub
```

5. Create NSGs (per DD §5.1.4):

```bash
# Session hosts NSG — outbound only, no inbound from internet
az network nsg create -g $RG -n nsg-avd-session-hosts
az network nsg rule create -g $RG --nsg-name nsg-avd-session-hosts \
    --name AllowAVDOutbound --priority 100 --direction Outbound \
    --protocol Tcp --destination-port-ranges 443 \
    --destination-address-prefixes "WindowsVirtualDesktop" --access Allow
az network nsg rule create -g $RG --nsg-name nsg-avd-session-hosts \
    --name DenyInboundInternet --priority 100 --direction Inbound \
    --protocol "*" --source-address-prefixes Internet --access Deny
az network vnet subnet update -g $RG --vnet-name vnet-apm-kiosk-avd \
    --name snet-avd-sessionhosts --network-security-group nsg-avd-session-hosts

# Private endpoint NSG — allow VNet, deny internet
az network nsg create -g $RG -n nsg-avd-pe
az network nsg rule create -g $RG --nsg-name nsg-avd-pe \
    --name AllowVnetInbound --priority 100 --direction Inbound \
    --source-address-prefixes VirtualNetwork --access Allow
az network vnet subnet update -g $RG --vnet-name vnet-apm-kiosk-avd \
    --name snet-avd-pe --network-security-group nsg-avd-pe
```

6. Document the topology and NAT public IPs in `./evidence/network-topology.md`.

**Validation.**
- `az network vnet list -g $RG -o table` shows three VNets.
- `az network vnet peering list -g $RG --vnet-name vnet-apm-kiosk-hub -o table` shows both peerings Connected.
- `az network public-ip show -g $RG -n pip-natgw-avd --query ipAddress -o tsv` returns a stable Standard IP — hand this to APM network/Zscaler.

**Gotchas.**
- `--disable-private-endpoint-network-policies true` is mandatory on PE subnets; without it the PE deployment errors with a non-obvious message.
- Subnet delegations are permanent. `snet-funcapp` delegated to `Microsoft.Web/serverFarms` can't host anything else.
- If converting to Terraform later, do so before steady-state; the CLI commands above are illustrative for the one-off build.

**References.** DD V0.3 §5.1.4 Network & Infrastructure; Microsoft Learn — Hub-spoke network topology in Azure.

---

### WP-2.2 — DNS architecture (1.0 d)

**Status:** **BLOCKED** (cyber item 4 — networking). [ ] Unblocked. [ ] Complete.

**Purpose.** Resolve private endpoint FQDNs from within the VNets, and document the FQDN allowlist for outbound AVD traffic (used in WP-2.15 Zscaler).

**Prerequisites.**
- WP-2.1 complete.

**Procedure.**

1. Create Azure Private DNS zones for the private endpoints we'll use:

```bash
for zone in \
    "privatelink.vaultcore.azure.net" \
    "privatelink.azurewebsites.net" \
    "privatelink.blob.core.windows.net" \
    "privatelink.queue.core.windows.net" \
    "privatelink.table.core.windows.net" \
    "privatelink.file.core.windows.net" \
    "privatelink.wvd.microsoft.com"; do
    az network private-dns zone create -g $RG -n $zone
done
```

2. Link the zones to all three VNets so resources in any VNet resolve correctly:

```bash
for vnet in vnet-apm-kiosk-hub vnet-apm-kiosk-avd vnet-apm-kiosk-shared; do
    VNET_ID=$(az network vnet show -g $RG -n $vnet --query id -o tsv)
    for zone in \
        "privatelink.vaultcore.azure.net" \
        "privatelink.azurewebsites.net" \
        "privatelink.blob.core.windows.net" \
        "privatelink.queue.core.windows.net" \
        "privatelink.table.core.windows.net" \
        "privatelink.file.core.windows.net" \
        "privatelink.wvd.microsoft.com"; do
        az network private-dns link vnet create -g $RG -n "lnk-$vnet-$zone" \
            --zone-name $zone --virtual-network $VNET_ID \
            --registration-enabled false
    done
done
```

3. Document the AVD outbound FQDN allowlist in `./inputs/avd-fqdn-allowlist.md`. The canonical list lives at Microsoft Learn — *Required FQDNs and endpoints for Azure Virtual Desktop*. Key entries:

```
*.wvd.microsoft.com
*.prod.warm.ingest.monitor.core.windows.net
*.events.data.microsoft.com
*.servicebus.windows.net
catalogartifact.azureedge.net
gcs.prod.monitoring.core.windows.net
kms.core.windows.net
mrsglobalsteus2prod.blob.core.windows.net
oneocsp.microsoft.com
www.microsoft.com
azkms.core.windows.net
prod-data-collection-endpoint-aue1.australiaeast-1.metrics.ingest.monitor.azure.com
login.microsoftonline.com
login.windows.net
*.cloudapp.azure.com
*.azure.com
go.microsoft.com
aka.ms
```

Plus Office 365 / Edge / Intune FQDNs (Microsoft 365 Worldwide endpoints JSON: `https://endpoints.office.com/endpoints/worldwide`). Include in the same allowlist file.

4. This file is the source of truth for WP-2.15 Zscaler integration. Keep updated when Microsoft refreshes the AVD FQDN list (quarterly or so).

**Validation.**
- `az network private-dns zone list -g $RG -o table` shows all 7 zones.
- A test VM in `snet-avd-sessionhosts` resolves `kv-apm-kiosk.vaultcore.azure.net` to a private IP (after WP-2.3 creates the PE).

**Gotchas.**
- Azure Private Resolver as a discrete service is **not** required when the VNet uses Azure-default DNS — VNet-integrated resources resolve private endpoints automatically via the Azure DNS resolver provided the Private DNS zone is linked to the VNet. Only deploy Azure Private Resolver if APM mandates resolution from outside the VNet (e.g. on-prem network resolving Azure private FQDNs). Likely not needed.
- Microsoft updates the AVD FQDN list quarterly. Subscribe to the AVD service announcements and refresh the allowlist file when changes hit.

**References.** DD V0.3 §5.1.4 DNS Configuration; Microsoft Learn — Required FQDNs and endpoints for AVD; Microsoft 365 endpoints web service.

---

### WP-2.3 — Key Vault `kv-apm-kiosk` + private endpoint (0.5 d)

**Status:** **BLOCKED** (cyber item 4 — Key Vault explicitly named). [ ] Unblocked. [ ] Complete.

**Purpose.** Provision the Key Vault that stores per-device kiosk passwords, with public network access disabled and a private endpoint inside the hub VNet.

**Prerequisites.**
- WP-2.1, WP-2.2 complete.

**Procedure.**

1. Create the Key Vault with RBAC mode, soft-delete (default 90 days), and purge protection enabled:

```bash
az keyvault create -g $RG -n kv-apm-kiosk -l $LOCATION \
    --enable-rbac-authorization true \
    --enable-purge-protection true \
    --retention-days 90 \
    --public-network-access Disabled \
    --tags Project=APMKiosk Sensitivity=Internal
```

2. Create the private endpoint in the hub PE subnet:

```bash
KV_ID=$(az keyvault show -g $RG -n kv-apm-kiosk --query id -o tsv)

az network private-endpoint create -g $RG -n pe-kv-apm-kiosk \
    --vnet-name vnet-apm-kiosk-hub --subnet snet-private-endpoints \
    --private-connection-resource-id $KV_ID \
    --group-id vault --connection-name pe-kv-apm-kiosk-conn

# Register the private endpoint in the Private DNS zone
az network private-endpoint dns-zone-group create -g $RG \
    --endpoint-name pe-kv-apm-kiosk \
    --name pe-kv-apm-kiosk-dns \
    --private-dns-zone privatelink.vaultcore.azure.net \
    --zone-name vault
```

3. Assign yourself the `Key Vault Administrator` role for the build window:

```bash
ME=$(az ad signed-in-user show --query id -o tsv)
az role assignment create --role "Key Vault Administrator" \
    --assignee $ME --scope $KV_ID
```

4. Configure diagnostic logging to Log Analytics (create the workspace if not already done — first use of it in this build):

```bash
az monitor log-analytics workspace create -g $RG -n law-apm-kiosk -l $LOCATION
LAW_ID=$(az monitor log-analytics workspace show -g $RG -n law-apm-kiosk --query id -o tsv)

az monitor diagnostic-settings create \
    --name diag-kv-apm-kiosk \
    --resource $KV_ID \
    --workspace $LAW_ID \
    --logs '[{"category":"AuditEvent","enabled":true}]' \
    --metrics '[{"category":"AllMetrics","enabled":true}]'
```

**Validation.**
- `az keyvault show -g $RG -n kv-apm-kiosk --query "properties.publicNetworkAccess"` returns `Disabled`.
- A test secret create from a VM inside the hub VNet works; the same command from your laptop (outside the VNet) fails with `Public network access is disabled`.
- `nslookup kv-apm-kiosk.vault.azure.net` from a VM inside any of the three VNets returns a 10.100.x.x private IP.
- Diagnostic logs flowing — query Log Analytics: `AzureDiagnostics | where ResourceProvider == "MICROSOFT.KEYVAULT" | take 10`.

**Gotchas.**
- Once `--enable-purge-protection` is set, it cannot be disabled — the vault must wait the full soft-delete retention before purge. This is intentional; do not "undo" by trying to disable it during testing.
- Private endpoint DNS registration is required; without the DNS zone group, the FQDN resolves to a public IP that public-access-disabled Key Vault then refuses, with confusing error messages.
- v0.2 included `AzurePolicyEvaluationDetails` in the diagnostic-settings categories; that category exists on Policy resources, not on Key Vault, and the create call fails with "category not supported". v0.3 removes it (F-22).

**References.** DD V0.3 §5.1.1.3 Credential Storage; Microsoft Learn — Azure Key Vault private endpoints.

---

### WP-2.8 — System Hybrid Runbook Worker on shared-services VM (1.0 d)

**Status:** **BLOCKED** (cyber item 4 — HRW is part of the Automation Account chain). [ ] Unblocked. [ ] Complete.

**Purpose.** Azure-hosted Automation runbooks execute in a sandbox outside the customer VNet and cannot reach the Key Vault private endpoint. A System Hybrid Runbook Worker runs runbooks on a VM inside the VNet, in the context of the Automation Account managed identity.

**Prerequisites.**
- WP-2.1 (Shared Services VNet exists).
- WP-2.3 (Key Vault exists for the runbooks to reach).
- Phase 1 WP-1.6 (Automation Account `aa-apm-kiosk` exists).

**Procedure.**

1. Provision (or repurpose) a Windows Server 2022 VM in `snet-shared-service` to host the hybrid worker. Naming: `vm-apm-kiosk-hrw` (Azure resource name; note the explicit `--computer-name` below — the resource name is 16 chars, one over the Windows 15-character hostname limit). Standard_B2ms is fine (low utilisation; runbook bursts).

```bash
# APM management-group policy requires the enableupdate / update-stage / backup
# tags (backup must be one of: BasicVMBackup, StandardVMBackup,
# StandardSQLVMBackup, StandardSQLVM(OS)Backup — "no" is NOT valid) and
# encryption-at-host on every VM, or creation is denied with
# RequestDisallowedByPolicy. Field-confirmed June 2026. The HRW is a permanent
# production VM: updates on (autopatch ring), standard backup. Confirm the
# update-stage ring with APM platform team.
az vm create -g $RG -n vm-apm-kiosk-hrw \
    --computer-name apmkioskhrw \
    --image Win2022Datacenter --size Standard_B2ms \
    --vnet-name vnet-apm-kiosk-shared --subnet snet-shared-service \
    --public-ip-address "" \
    --admin-username apmadmin --admin-password '{strongPassword}' \
    --encryption-at-host \
    --tags Project=APMKiosk Sensitivity=Internal \
        enableupdate=yes update-stage=autopatch-01 backup=StandardVMBackup
```

2. Enable system-assigned managed identity on the VM:

```bash
az vm identity assign -g $RG -n vm-apm-kiosk-hrw
```

3. Create the Hybrid Runbook Worker Group `hwg-apm-kiosk` in the Automation Account:

```bash
az automation hrwg create \
    --resource-group $RG \
    --automation-account-name aa-apm-kiosk \
    --hybrid-runbook-worker-group-name hwg-apm-kiosk
```

4. Install the Hybrid Worker extension on the VM:

```bash
AA_ID=$(az automation account show -g $RG -n aa-apm-kiosk --query id -o tsv)

az vm extension set \
    --resource-group $RG --vm-name vm-apm-kiosk-hrw \
    --name HybridWorkerForWindows \
    --publisher Microsoft.Azure.Automation.HybridWorker \
    --settings "{\"AutomationAccountURL\":\"https://aa-apm-kiosk.agentsvc.${LOCATION}.azure-automation.net\"}"

# Register the VM as a worker in the hwg
az automation hrwg-worker create \
    --resource-group $RG \
    --automation-account-name aa-apm-kiosk \
    --hybrid-runbook-worker-group-name hwg-apm-kiosk \
    --hybrid-runbook-worker-name "hrw-vm-apm-kiosk-hrw" \
    --vm-resource-id $(az vm show -g $RG -n vm-apm-kiosk-hrw --query id -o tsv)
```

5. Grant the Automation Account managed identity the `Key Vault Secrets Officer` role on the vault:

```bash
AA_MI=$(az automation account show -g $RG -n aa-apm-kiosk --query identity.principalId -o tsv)
az role assignment create --role "Key Vault Secrets Officer" \
    --assignee-object-id $AA_MI --assignee-principal-type ServicePrincipal \
    --scope $KV_ID
```

6. Network test from the VM:

```powershell
# RDP / Bastion into vm-apm-kiosk-hrw and run:
Test-NetConnection -ComputerName kv-apm-kiosk.vault.azure.net -Port 443
# Expected: TcpTestSucceeded = True; RemoteAddress is 10.100.x.x (private)
```

7. **Treat the HRW VM as a production component, not a build-and-forget.** It is the single most likely operational failure point for the entire credential pipeline (every rotation runbook depends on it; if it goes offline, rotations silently stop and devices begin failing as Function keys age out). v0.3 adds the following hardening steps to WP-2.8 (per F-06):

   a. **Patching.** Enrol the VM in Azure Update Manager with a defined patch window:
   ```bash
   az maintenance configuration create -g $RG -n mc-apm-kiosk-hrw \
       --maintenance-scope InGuestPatch --location $LOCATION \
       --duration "03:55" --recur-every "Week Sunday" --start-date-time "2026-06-01 02:00"
   az maintenance assignment create -g $RG --provider-name "Microsoft.Compute" \
       --resource-type "virtualMachines" --resource-name vm-apm-kiosk-hrw \
       --configuration-assignment-name ma-vm-apm-kiosk-hrw \
       --maintenance-configuration-id $(az maintenance configuration show -g $RG -n mc-apm-kiosk-hrw --query id -o tsv)
   ```

   b. **OS baseline.** Apply the Microsoft Windows Server 2022 security baseline via Intune or Azure Policy. The Intune path requires the VM to be Entra-joined or hybrid-joined and Intune-enrolled; if that's not the operating model at APM for shared-services VMs, fall back to the Azure Policy "Windows machines should meet requirements for Windows Server" built-in initiative.

   c. **Defender for Servers.** Enable Defender for Servers Plan 2 on the subscription (or the resource group). This gives EDR signal and the integrated FIM agent.

   d. **Diagnostic settings.** Stream the VM's Windows Event Log (Application, System, Security) and Performance counters to the kiosk Log Analytics workspace:
   ```bash
   az monitor diagnostic-settings create --name diag-vm-apm-kiosk-hrw \
       --resource $(az vm show -g $RG -n vm-apm-kiosk-hrw --query id -o tsv) \
       --workspace $LAW_ID --metrics '[{"category":"AllMetrics","enabled":true}]'
   # Plus install the Azure Monitor Agent with a Data Collection Rule scoping the Windows Event Log channels.
   ```

   e. **Heartbeat alert.** Add to the WP-5.2 monitoring set: "HRW heartbeat loss" alert on the Log Analytics `Heartbeat | where Computer == 'vm-apm-kiosk-hrw'` query, evaluating every 5 minutes with a 10-minute window. Send to the kiosk on-call distribution list.

   f. **Ownership.** Document the VM's ownership in `evidence/operational-ownership.md` — which APM team owns patching, monitoring, restoration. This is a hand-off to APM ops; the project team cannot fix an HRW VM outage in production.

   g. **Optional but recommended: deploy a second HRW VM in the same worker group.** Azure Automation balances jobs across workers in the same group; if one VM is rebooting for patches, the other carries the load. A low-cost improvement with significant resilience benefit given the VM is the credential pipeline's single point of failure.

**Validation.**
- `Azure portal → Automation Accounts → aa-apm-kiosk → Process Automation → Hybrid worker groups` shows `hwg-apm-kiosk` with at least 1 worker, Status = Online.
- A simple test runbook (`Write-Output (Get-Date)`) targeted at `hwg-apm-kiosk` runs successfully.
- A test runbook attempting `Get-AzKeyVaultSecret -VaultName kv-apm-kiosk` from `hwg-apm-kiosk` succeeds; the same from Azure sandbox fails.
- The maintenance configuration is visible in `Azure portal → Maintenance Configurations` and the VM is listed under Resources.
- Heartbeat events from the VM are visible in Log Analytics: `Heartbeat | where Computer == 'vm-apm-kiosk-hrw' | take 5`.
- Ownership entry exists in `evidence/operational-ownership.md`.

**Gotchas.**
- The Hybrid Worker extension installer downloads from `*.agentsvc.<region>.azure-automation.net`. Confirm outbound 443 to that FQDN is permitted from the shared-services subnet.
- "System Hybrid Runbook Worker" is the new name (V2 architecture). The legacy "User Hybrid Worker" is being deprecated; don't follow old documentation that uses Get-AzAutomationHybridWorker without the `hrwg` namespace.
- The VM is a production component. v0.2 deferred patching, baselining, monitoring and DR; v0.3 lands those in this WP per F-06. Skipping any of steps 7a-7g leaves the credential pipeline with an undocumented single point of failure.

**References.** DD V0.3 §5.1.1.4 Hybrid Runbook Worker; Microsoft Learn — Deploy an extension-based Hybrid Runbook Worker; Microsoft Learn — Azure Update Manager.

---

### WP-2.4 — Credential Proxy Function App (2.0 d)

**Status:** **BLOCKED** (cyber item 4 — Function App explicitly named; the public-endpoint workaround proposal was rejected). [ ] Unblocked. [ ] Complete.

**Purpose.** Public-facing HTTPS endpoint that kiosk devices call to retrieve their per-device password. Function App authenticates the caller via per-device Function key (Option A in the DD), then reads the secret from Key Vault via VNet integration.

**Prerequisites.**
- WP-2.1, WP-2.2, WP-2.3 complete.

**Procedure.**

1. Create the backing storage account with private endpoints for blob/queue/table:

```bash
az storage account create -g $RG -n stapmkioskcred -l $LOCATION \
    --sku Standard_LRS --kind StorageV2 \
    --allow-blob-public-access false \
    --min-tls-version TLS1_2 \
    --public-network-access Disabled \
    --tags Project=APMKiosk Sensitivity=Internal

ST_ID=$(az storage account show -g $RG -n stapmkioskcred --query id -o tsv)

for sub in blob queue table file; do
    az network private-endpoint create -g $RG -n pe-stapmkioskcred-$sub \
        --vnet-name vnet-apm-kiosk-hub --subnet snet-private-endpoints \
        --private-connection-resource-id $ST_ID \
        --group-id $sub --connection-name pe-stapmkioskcred-$sub-conn
    az network private-endpoint dns-zone-group create -g $RG \
        --endpoint-name pe-stapmkioskcred-$sub --name pe-dns-$sub \
        --private-dns-zone privatelink.$sub.core.windows.net --zone-name $sub
done
```

2. Create a **Functions Elastic Premium** plan (EP1 — Functions-flavoured Premium, not App Service Premium V3) and Function App. The Elastic Premium plan gives VNet integration with per-execution scaling and an always-ready warm instance to avoid cold-start on the credential-on-lock-screen flow. v0.2 specified P0v3 which is an App Service plan, not a Functions plan, and loses Functions-style scaling.

```bash
az functionapp plan create -g $RG -n asp-apm-kiosk-funcs \
    --location $LOCATION --is-linux --sku EP1 \
    --min-instances 1 --max-burst 5

az functionapp create -g $RG -n func-apm-cred-proxy \
    --plan asp-apm-kiosk-funcs --runtime powershell --runtime-version 7.2 \
    --functions-version 4 --os-type Linux \
    --storage-account stapmkioskcred \
    --assign-identity '[system]'

# Configure one always-ready instance to avoid cold start on the credential-on-lock-screen flow.
az functionapp config appsettings set -g $RG -n func-apm-cred-proxy \
    --settings "WEBSITE_ALWAYS_READY_INSTANCES=1"

# VNet integration into the Function App subnet
FUNC_SUBNET_ID=$(az network vnet subnet show -g $RG \
    --vnet-name vnet-apm-kiosk-hub --name snet-funcapp --query id -o tsv)
az functionapp vnet-integration add -g $RG -n func-apm-cred-proxy \
    --vnet vnet-apm-kiosk-hub --subnet snet-funcapp

# Force outbound through VNet
az functionapp config appsettings set -g $RG -n func-apm-cred-proxy \
    --settings "WEBSITE_VNET_ROUTE_ALL=1"
```

3. Grant the Function App managed identity `Key Vault Secrets User` (read-only) on the vault:

```bash
FUNC_MI=$(az functionapp show -g $RG -n func-apm-cred-proxy --query identity.principalId -o tsv)
az role assignment create --role "Key Vault Secrets User" \
    --assignee-object-id $FUNC_MI --assignee-principal-type ServicePrincipal \
    --scope $KV_ID
```

4. Write the Function code. Local working directory: `./outputs/func-apm-cred-proxy/`. File: `GetPassword/run.ps1`.

```powershell
using namespace System.Net

# Input bindings are passed in via param block.
param($Request, $TriggerMetadata)

$ErrorActionPreference = "Stop"

# Validate the function key was supplied (Azure Functions checks function-level
# key automatically; this is belt-and-braces).
if (-not $Request.Headers.'x-functions-key') {
    Push-OutputBinding -Name Response -Value (
        [HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::Unauthorized
            Body = "Missing function key"
        })
    return
}

# Extract serial number from body
$serial = $Request.Body.serialNumber
if (-not $serial) {
    Push-OutputBinding -Name Response -Value (
        [HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::BadRequest
            Body = "Missing serialNumber in body"
        })
    return
}

# Normalise the serial — strip non-alphanumerics (DD §5.1.1, matches the runbook
# convention), uppercase, trim
$serial = ($serial -replace '[^a-zA-Z0-9]', '').ToUpper().Trim()

# Build the secret name (matches the convention used by the rotation runbook)
$secretName = "kiosk-$($serial.ToLower())"

try {
    # Authenticate via the Function App's managed identity
    Connect-AzAccount -Identity -ErrorAction Stop | Out-Null

    $secret = Get-AzKeyVaultSecret `
        -VaultName "kv-apm-kiosk" `
        -Name $secretName `
        -AsPlainText `
        -ErrorAction Stop

    if (-not $secret) {
        Push-OutputBinding -Name Response -Value (
            [HttpResponseContext]@{
                StatusCode = [HttpStatusCode]::NotFound
                Body = "No credential found for serial $serial"
            })
        return
    }

    # Build the response
    $upn = "kiosk-$($serial.ToLower())@apm.net.au"
    $body = @{
        upn = $upn
        password = $secret
        retrievedAt = (Get-Date).ToString("o")
    } | ConvertTo-Json

    Push-OutputBinding -Name Response -Value (
        [HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::OK
            Headers = @{ "Content-Type" = "application/json" }
            Body = $body
        })

} catch {
    # Log to Application Insights
    Write-Error "Credential retrieval failed for serial $($serial): $($_.Exception.Message)"
    Push-OutputBinding -Name Response -Value (
        [HttpResponseContext]@{
            StatusCode = [HttpStatusCode]::InternalServerError
            Body = "Credential retrieval failed; check Function App logs"
        })
}
```

The function.json binding:

```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "Request",
      "methods": ["post"]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "Response"
    }
  ]
}
```

5. Deploy. Either via the Azure Functions Core Tools (`func azure functionapp publish func-apm-cred-proxy`) or via VS Code Azure Functions extension. Production should be deployed via a CI/CD pipeline from a Git repository.

6. Create per-device Function keys. Each kiosk device gets its own key, named by serial:

```bash
# Pattern: one key per device, named by uppercase serial
# Run once per device at provisioning time
SERIAL="ABCD1234XY56"
az functionapp keys set -g $RG -n func-apm-cred-proxy \
    --key-name "kiosk-$SERIAL" --key-type functionKeys
# The returned key value is what's injected into the PR script (WP-1.8 placeholder)
```

7. Configure Application Insights for monitoring:

```bash
APPINSIGHTS_ID=$(az monitor app-insights component create \
    -g $RG -a ai-apm-cred-proxy -l $LOCATION \
    --workspace $LAW_ID --query instrumentationKey -o tsv)
az functionapp config appsettings set -g $RG -n func-apm-cred-proxy \
    --settings "APPINSIGHTS_INSTRUMENTATIONKEY=$APPINSIGHTS_ID"
```

8. Restrict the Function App's public access to only the kiosk fleet's egress IPs (defence in depth — even with a Function key, narrow the network surface):

```bash
# Add an access restriction for each APM site's egress IP (TBC from APM)
az functionapp config access-restriction add \
    -g $RG -n func-apm-cred-proxy \
    --rule-name "APM-Site-{siteName}" --priority 100 --action Allow \
    --ip-address "{siteEgressIP}/32"

# Default deny for everything else
az functionapp config access-restriction add \
    -g $RG -n func-apm-cred-proxy \
    --rule-name "DenyAll" --priority 65000 --action Deny --ip-address "0.0.0.0/0"
```

**Validation.**
- `curl https://func-apm-cred-proxy.azurewebsites.net/api/GetPassword` without the function key returns 401.
- With the function key but a serial that has no secret: returns 404.
- With both: returns the JSON body with `upn` and `password` fields. (Don't run this in production for a real serial unless you intend to log the password to your terminal.)
- App Insights shows the request and the Key Vault call latency.

**Gotchas.**
- The plan choice matters. **EP1 (Functions Elastic Premium)** is the right SKU because it keeps per-execution billing, supports VNet integration, and avoids cold-start on the credential flow when configured with one always-ready instance. The App Service Premium V3 family (P0v3 / P1v3) also supports VNet integration but loses Functions-style scaling and pays for always-on capacity. Consumption (Y1) supports VNet integration on Linux but the cold-start latency is unacceptable for a credential-on-lock-screen flow.
- The Key Vault MUST be referenced over its private endpoint. If the Function App can reach the public Key Vault endpoint (it can't, since you set public-access-disabled in WP-2.3), the design defence-in-depth is broken.
- Each kiosk device's Function key must be rotated alongside its password. The rotation runbook (WP-2.6) handles this.
- `WEBSITE_VNET_ROUTE_ALL=1` is required to force outbound traffic through the VNet — without it, the Function App might reach Microsoft endpoints via public routes, bypassing Zscaler/NAT.
- Application Insights doesn't capture the password itself (the function code never logs it), but it does capture the serial. Confirm with APM's data classification policy whether the serial is sensitive (likely Internal-only, fine).

**References.** DD V0.3 §5.1.1.3 Credential Proxy (Azure Function); Microsoft Learn — Integrate Function App with VNet; Microsoft Learn — Azure Functions HTTP triggers.

---

### WP-2.5 — Full Kiosk User Account Creation runbook (1.5 d)

**Status:** **BLOCKED** (cyber item 4 — runbook). [ ] Unblocked. [ ] Complete.

**Purpose.** Replace the Phase 1 starter runbook with the production version that generates a random password, writes to Key Vault, and creates the Entra user with that password.

**Prerequisites.**
- WP-2.3 (Key Vault), WP-2.4 (managed identity has Key Vault Secrets User), WP-2.8 (Hybrid Worker). WP-1.6 Automation Account + starter runbook — **done 2026-06-11**, so this dependency is satisfied; WP-2.5 still BLOCKED on Key Vault + HRW.

**Procedure.**

1. Confirm the Automation Account managed identity has `Key Vault Secrets Officer` role (set in WP-2.8 step 5).

2. In Azure portal: `Automation Account aa-apm-kiosk → Runbooks → Create-KioskUser → Edit`. Replace the entire starter content with the production version:

```powershell
<#
.SYNOPSIS
    APM Kiosk User Account Creation runbook (production).
.DESCRIPTION
    Creates a kiosk M365 F3 user account with UPN
    kiosk-{serialnumber}@apm.net.au. Generates a 16-character random
    password, stores it in Key Vault as a per-device secret, sets it on
    the Entra user, assigns F3 licence, and adds to SG-APM-Kiosk-Users.

    Must execute on the System Hybrid Runbook Worker (hwg-apm-kiosk) so
    it can reach the Key Vault private endpoint.
.PARAMETER SerialNumber
    Device serial number (used for UPN and Key Vault secret name).
.PARAMETER F3SkuId
    F3 licence SKU id (lookup once with Get-MgSubscribedSku).
#>
param(
    [Parameter(Mandatory)][string]$SerialNumber,
    [Parameter(Mandatory)][string]$F3SkuId
)

$ErrorActionPreference = "Stop"

# Normalise. DD §5.1.1: non-alphanumeric characters removed (drift review A6).
$serial = ($SerialNumber -replace '[^a-zA-Z0-9]', '').ToUpper().Trim()
$upn    = "kiosk-$($serial.ToLower())@apm.net.au"
$secretName = "kiosk-$($serial.ToLower())"

# Auth — managed identity
Connect-AzAccount -Identity | Out-Null
Connect-MgGraph -Identity -NoWelcome
Write-Output "Connected for serial=$serial"

# Idempotency: skip if user exists
$existing = Get-MgUser -Filter "userPrincipalName eq '$upn'" -ErrorAction SilentlyContinue
if ($existing) {
    Write-Output "User $upn already exists; skipping create. Rotation runbook owns ongoing changes."
    return
}

# Generate 16-character password using a cryptographic RNG (v0.3 hardened).
# v0.2 used Get-Random (Mersenne Twister, non-CSPRNG); v0.3 uses the System.Security
# .Cryptography.RandomNumberGenerator class. Cost: ~8 extra lines, no operational
# impact. The displayed-on-screen visibility risk is real but defence-in-depth says
# don't compound it with weak randomness (F-14).
function New-RandomPassword {
    [CmdletBinding()]
    param([int]$Length = 16)

    $upper   = 65..90  | ForEach-Object { [char]$_ }
    $lower   = 97..122 | ForEach-Object { [char]$_ }
    $digits  = 48..57  | ForEach-Object { [char]$_ }
    $symbols = '!@#$%^&*-_=+'.ToCharArray()
    $sets    = @($upper, $lower, $digits, $symbols)
    $all     = $sets | ForEach-Object { $_ } | Select-Object -Unique

    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        function Get-CryptoChar {
            param([char[]]$Pool)
            $bytes = [byte[]]::new(4)
            $rng.GetBytes($bytes)
            $value = [System.BitConverter]::ToUInt32($bytes, 0)
            return $Pool[$value % $Pool.Count]
        }

        # Guarantee at least one from each character set.
        $required = $sets | ForEach-Object { Get-CryptoChar -Pool $_ }
        $rest     = 1..($Length - 4) | ForEach-Object { Get-CryptoChar -Pool $all }
        $chars    = @($required) + @($rest)

        # Cryptographic Fisher-Yates shuffle so the guaranteed chars aren't at fixed positions.
        for ($i = $chars.Count - 1; $i -gt 0; $i--) {
            $bytes = [byte[]]::new(4)
            $rng.GetBytes($bytes)
            $j = [System.BitConverter]::ToUInt32($bytes, 0) % ($i + 1)
            $tmp = $chars[$i]; $chars[$i] = $chars[$j]; $chars[$j] = $tmp
        }
        return -join $chars
    } finally {
        $rng.Dispose()
    }
}
$password = New-RandomPassword -Length 16

# Store in Key Vault first (so we can recover if user-create fails later)
$securePassword = ConvertTo-SecureString -String $password -AsPlainText -Force
Set-AzKeyVaultSecret -VaultName "kv-apm-kiosk" -Name $secretName `
    -SecretValue $securePassword `
    -ContentType "text/plain" `
    -Tag @{ "serial" = $serial; "created" = (Get-Date).ToString("o") } | Out-Null
Write-Output "Stored secret $secretName in Key Vault"

# Create the Entra user per DD §5.1.1 Table 17.
# PasswordPolicies=DisablePasswordExpiration is load-bearing (drift review A7): without
# it, a tenant password-expiration policy can expire the whole kiosk fleet's passwords
# mid-quarter — the rotation runbook owns password lifecycle, not the tenant policy.
$passwordProfile = @{
    ForceChangePasswordNextSignIn = $false
    Password = $password
}
$newUser = New-MgUser `
    -UserPrincipalName $upn `
    -DisplayName "Kiosk $serial" `
    -AccountEnabled:$true `
    -MailNickname "kiosk-$($serial.ToLower())" `
    -PasswordProfile $passwordProfile `
    -PasswordPolicies "DisablePasswordExpiration" `
    -JobTitle "Kiosk Device" `
    -Department "Kiosk Fleet" `
    -UsageLocation "AU"
Write-Output "Created user $upn (id=$($newUser.Id))"

# Assign F3 licence (direct assignment). DD Table 17 specifies GROUP-BASED licensing on
# SG-APM-Kiosk-Users instead — if APM enables that (preferred, single licensing path),
# remove this step and the F3SkuId parameter; the group-add below licenses the user.
Set-MgUserLicense -UserId $newUser.Id `
    -AddLicenses @(@{ SkuId = $F3SkuId }) -RemoveLicenses @() | Out-Null
Write-Output "Assigned F3 licence"

# Add to kiosk users group
$kioskUsersGroupId = Get-AutomationVariable -Name "KioskUsersGroupId"
New-MgGroupMember -GroupId $kioskUsersGroupId -DirectoryObjectId $newUser.Id
Write-Output "Added to SG-APM-Kiosk-Users"

# Emit Log Analytics event (custom log, optional)
Write-Output "Kiosk user creation complete: serial=$serial upn=$upn"
```

3. Set the Automation Account variable `KioskUsersGroupId` (the GUID captured in WP-1.1):

```bash
az automation variable create -g $RG --automation-account-name aa-apm-kiosk \
    --name KioskUsersGroupId --value "{kioskUsersGroupId}" --is-encrypted false
```

4. Configure the runbook to execute on the Hybrid Runbook Worker by default. Azure portal: `Runbooks → Create-KioskUser → Settings → Run settings → Default to: Hybrid Worker → hwg-apm-kiosk`.

5. Publish the runbook.

6. Test by running it for one pilot device:

```bash
# Look up the F3 SKU id once
F3_SKU=$(az rest --method get --url "https://graph.microsoft.com/v1.0/subscribedSkus" \
    --query "value[?skuPartNumber=='M365_F3'].skuId" -o tsv)

# Start the runbook against one pilot serial
az automation runbook start -g $RG --automation-account-name aa-apm-kiosk \
    --name Create-KioskUser \
    --parameters "{\"SerialNumber\":\"PILOT001\",\"F3SkuId\":\"$F3_SKU\"}" \
    --run-on hwg-apm-kiosk
```

**Validation.**
- `Get-MgUser -Filter "userPrincipalName eq 'kiosk-pilot001@apm.net.au'"` returns the user.
- `Get-AzKeyVaultSecret -VaultName kv-apm-kiosk -Name kiosk-pilot001` returns the secret (with the password as the value).
- The user appears in `SG-APM-Kiosk-Users`.
- Idempotency: re-run with the same serial; runbook exits early with "already exists; skipping create".

**Gotchas.**
- The password generator uses `System.Security.Cryptography.RandomNumberGenerator` (cryptographic) and a Fisher-Yates shuffle. v0.2 used `Get-Random` and `Sort-Object {Get-Random}` which is non-CSPRNG and a non-uniform shuffle. v0.3 fixes both (F-14). The displayed-on-screen visibility risk is the design-accepted disclosure; weak randomness compounded it.
- F3 licence assignment requires the tenant to have F3 licences available. Confirm `Get-MgSubscribedSku` shows F3 with `ConsumedUnits < PrepaidUnits.Enabled`.
- Idempotent design: if the runbook fails partway, the Key Vault secret may exist but the Entra user may not. Re-running will skip the user create if the user exists; but if the user doesn't exist and the secret does, the secret will be overwritten with a new random value. This is intentional — there's no value in preserving a secret with no user attached.

**References.** DD V0.3 §5.1.1.3 Password Generation; graph-powershell-patterns skill.

---

### WP-2.6 — Kiosk User Password Rotation runbook (1.5 d)

**Status:** **BLOCKED** (cyber item 4 — runbook). [ ] Unblocked. [ ] Complete.

**Purpose.** Quarterly (or on demand) rotation runbook that iterates all members of `SG-APM-Kiosk-Users` and rotates each user's password, updating Key Vault and Entra in lockstep.

**Prerequisites.**
- WP-2.5 complete; rotation works end-to-end for one device.

**Procedure.**

1. Create a new runbook `Rotate-KioskUserPasswords` in `aa-apm-kiosk`. Type PowerShell 7.2. Set to default to `hwg-apm-kiosk`.

```powershell
<#
.SYNOPSIS
    Rotate kiosk user passwords (per-device).
.DESCRIPTION
    Iterates all members of SG-APM-Kiosk-Users. For each user, generates
    a new 16-character password, sets it on the Entra user, and updates
    the corresponding Key Vault secret. Logs each rotation to Log
    Analytics. Sends a summary email to APM Service Desk.
.PARAMETER ServiceDeskEmail
    Where to send the rotation summary.
.PARAMETER SingleUserUpn
    Optional. If set, rotates only this one user (for testing or
    targeted compromise response). Otherwise rotates all SG members.
#>
param(
    [Parameter(Mandatory)][string]$ServiceDeskEmail,
    [string]$SingleUserUpn = $null
)

$ErrorActionPreference = "Continue"

Connect-AzAccount -Identity | Out-Null
Connect-MgGraph -Identity -NoWelcome
Write-Output "Connected"

function New-RandomPassword {
    # Cryptographic RNG version (v0.3, F-14). See WP-2.5 for rationale.
    [CmdletBinding()]
    param([int]$Length = 16)

    $upper   = 65..90  | ForEach-Object { [char]$_ }
    $lower   = 97..122 | ForEach-Object { [char]$_ }
    $digits  = 48..57  | ForEach-Object { [char]$_ }
    $symbols = '!@#$%^&*-_=+'.ToCharArray()
    $sets    = @($upper, $lower, $digits, $symbols)
    $all     = $sets | ForEach-Object { $_ } | Select-Object -Unique

    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        function Get-CryptoChar {
            param([char[]]$Pool)
            $bytes = [byte[]]::new(4)
            $rng.GetBytes($bytes)
            return $Pool[[System.BitConverter]::ToUInt32($bytes, 0) % $Pool.Count]
        }
        $required = $sets | ForEach-Object { Get-CryptoChar -Pool $_ }
        $rest     = 1..($Length - 4) | ForEach-Object { Get-CryptoChar -Pool $all }
        $chars    = @($required) + @($rest)
        for ($i = $chars.Count - 1; $i -gt 0; $i--) {
            $bytes = [byte[]]::new(4); $rng.GetBytes($bytes)
            $j = [System.BitConverter]::ToUInt32($bytes, 0) % ($i + 1)
            $tmp = $chars[$i]; $chars[$i] = $chars[$j]; $chars[$j] = $tmp
        }
        return -join $chars
    } finally {
        $rng.Dispose()
    }
}

$kioskUsersGroupId = Get-AutomationVariable -Name "KioskUsersGroupId"

# Resolve target users
if ($SingleUserUpn) {
    $targets = @(Get-MgUser -Filter "userPrincipalName eq '$SingleUserUpn'")
} else {
    $targets = Get-MgGroupMember -GroupId $kioskUsersGroupId -All | ForEach-Object {
        Get-MgUser -UserId $_.Id
    }
}
Write-Output "Rotating $($targets.Count) user(s)"

$report = @{ rotated = @(); failed = @() }

foreach ($user in $targets) {
    $upn = "(unknown)"
    try {
        $upn = $user.UserPrincipalName
        # Extract serial from UPN. v0.3 fixes a v0.2-era bug: the UPN local-part is
        # `kiosk-{serial}` (lowercase prefix) per DD §5.1.1 paragraph 185, so
        # uppercasing the whole local-part gives "KIOSK-XPYCK14" and downstream
        # `"kiosk-$($serial.ToLower())"` constructs the wrong secret name
        # `kiosk-kiosk-xpyck14`. Strip the prefix first.
        $localPart = $upn.Split('@')[0]
        if (-not $localPart.StartsWith("kiosk-")) {
            throw "UPN local-part '$localPart' does not begin with the expected 'kiosk-' prefix; refusing to rotate."
        }
        $serial     = $localPart.Substring("kiosk-".Length).ToUpper()
        $secretName = "kiosk-$($serial.ToLower())"

        $newPassword = New-RandomPassword -Length 16

        # Update Key Vault first
        $secure = ConvertTo-SecureString $newPassword -AsPlainText -Force
        Set-AzKeyVaultSecret -VaultName "kv-apm-kiosk" -Name $secretName `
            -SecretValue $secure -ContentType "text/plain" `
            -Tag @{ "serial" = $serial; "rotated" = (Get-Date).ToString("o") } | Out-Null

        # Update Entra
        $passwordProfile = @{
            ForceChangePasswordNextSignIn = $false
            Password = $newPassword
        }
        Update-MgUser -UserId $user.Id -PasswordProfile $passwordProfile

        $report.rotated += @{ upn = $upn; serial = $serial }
        Write-Output "Rotated: $upn"
    } catch {
        $report.failed += @{ upn = $upn; error = $_.Exception.Message }
        Write-Error "FAILED: $upn — $($_.Exception.Message)"
    }
}

# Summary email — uses Send-MgUserMail with the Automation Account managed identity
# (requires Mail.Send permission scoped via Application Access Policy to a service mailbox)
$summary = @"
<h2>Kiosk Password Rotation — Summary</h2>
<p>Rotated $($report.rotated.Count) user(s) successfully.</p>
<p>Failed: $($report.failed.Count)</p>
<h3>Failures</h3>
<pre>$($report.failed | ConvertTo-Json -Depth 3)</pre>
"@

$mail = @{
    Message = @{
        Subject = "[APM Kiosk] Password rotation $(Get-Date -Format 'yyyy-MM-dd')"
        Body = @{ ContentType = "HTML"; Content = $summary }
        ToRecipients = @(@{ EmailAddress = @{ Address = $ServiceDeskEmail } })
    }
    SaveToSentItems = $true
}
# Sender mailbox TBC with APM — typically a service mailbox like apmkiosk-noreply@apm.com.au
# Send-MgUserMail -UserId "apmkiosk-noreply@apm.com.au" -BodyParameter $mail

Write-Output "Rotation complete. Rotated=$($report.rotated.Count) Failed=$($report.failed.Count)"
```

2. Create a recurring schedule (quarterly, 02:00 local time):

```bash
# First Monday of Jan, Apr, Jul, Oct — adjust to APM's preferred quarter cadence
az automation schedule create -g $RG --automation-account-name aa-apm-kiosk \
    --name "Quarterly-Rotation" \
    --start-time "2026-07-01T02:00:00+10:00" \
    --frequency Month --interval 3 \
    --time-zone "Australia/Brisbane"

az automation runbook schedule create -g $RG \
    --automation-account-name aa-apm-kiosk \
    --runbook-name "Rotate-KioskUserPasswords" \
    --schedule-name "Quarterly-Rotation" \
    --parameters "{\"ServiceDeskEmail\":\"servicedesk@apm.com.au\"}" \
    --run-on hwg-apm-kiosk
```

3. Publish.

**Validation.**
- Manual test against one user: `az automation runbook start ... --parameters "{...SingleUserUpn: kiosk-pilot001@apm.net.au}"`.
- Confirm new Key Vault secret version: `az keyvault secret list-versions --vault-name kv-apm-kiosk -n kiosk-pilot001 -o table` shows the new version.
- Confirm sign-in works with the new password (against AVD — sign-in tests can wait until WP-2.13).
- Quarterly schedule visible in `Automation Account → Schedules`.

**Gotchas.**
- The Send-MgUserMail call requires a sender mailbox that the Automation Account managed identity has Mail.Send permission to. APM IT may need to create a service mailbox (e.g. `apmkiosk-noreply@apm.com.au`) and apply an Exchange Application Access Policy. This is set up in WP-5.4 if not earlier.
- The runbook does not currently handle the per-device Function key rotation. That should be added once Function key naming/rotation policy is locked with APM — for now, Function keys rotate manually alongside any compromise response.
- Rotation runtime grows linearly with fleet size. At 517 devices, a quarterly rotation runs ~5-10 minutes. Acceptable within the Automation Account's job timeout.

**References.** DD V0.3 §5.1.1.3 Rotation Schedule; DD §7 Azure Runbooks Kiosk User Password Rotation.

---

### WP-2.7 — End-to-end rotation cycle test (1.0 d)

**Status:** **BLOCKED** (depends on WP-2.3 to WP-2.6 and WP-2.8 which are all blocked). [ ] Unblocked. [ ] Complete.

**Purpose.** Validate the full chain: rotation runbook → Key Vault → Function App → PR script → lock screen regeneration.

**Prerequisites.**
- WP-2.1 through WP-2.6 complete.
- One pilot kiosk device provisioned (from Phase 1 WP-1.5) but not yet enrolled with the PR deployed.

**Procedure.**

1. Deploy the Phase 1 PR scripts (WP-1.8) as an Intune Proactive Remediation, scoped to the pilot device only:
   - `Intune admin centre → Devices → Scripts and remediations → Platform scripts → Create → New script`. Type: Proactive Remediation (Endpoint Analytics).
   - Name: `PR-APM-Kiosk-CredentialDisplay`. Description: `Per-device credential lock screen regeneration. DD §5.1.1.4.`
   - Detection script: paste from WP-1.8 detection.
   - Remediation script: paste from WP-1.8 remediation.
   - Run script in 64-bit PowerShell: **Yes**. Run with logged-on credentials: **No**. Enforce signature check: **No** (until you sign the scripts).
   - Assign to `SG-APM-Kiosk-Devices` (or a pilot subset group).
   - Schedule: hourly.

2. Inject the per-device Function key into the PR script per WP-2.4 step 6. The Function key is created in Azure and read from the script as a static string at provisioning time. (Future: store in Key Vault and pull at PR runtime, but that adds complexity for marginal benefit.)

3. Run the rotation runbook scoped to the pilot user:

```bash
az automation runbook start -g $RG --automation-account-name aa-apm-kiosk \
    --name Rotate-KioskUserPasswords \
    --parameters "{\"ServiceDeskEmail\":\"yourtestemail@apm.com.au\",\"SingleUserUpn\":\"kiosk-pilot001@apm.net.au\"}" \
    --run-on hwg-apm-kiosk
```

4. Within 30 seconds, confirm Key Vault has a new secret version.

5. Test the Function App returns the new password:

```bash
FUNC_KEY=$(az functionapp keys list -g $RG -n func-apm-cred-proxy \
    --query "functionKeys.\"kiosk-PILOT001\"" -o tsv)

curl -X POST "https://func-apm-cred-proxy.azurewebsites.net/api/GetPassword" \
    -H "x-functions-key: $FUNC_KEY" \
    -H "Content-Type: application/json" \
    -d '{"serialNumber":"PILOT001"}'
```

Expected: JSON body with `upn`, `password` (the new one), `retrievedAt`. Save the password value for the next step.

6. On the pilot device, trigger the PR manually (or wait for the hourly cycle). Confirm via the device's `C:\APM\Kiosk\current_hash.txt` — the hash should now match the SHA256 of the new password from step 5.

7. Confirm the lock screen `C:\APM\Kiosk\lockscreen.png` has the new password rendered on it.

8. Sign in to AVD on the device with the new credentials. Sign-in should succeed.

9. Document the test outcome in `./evidence/rotation-e2e-test.md`:
   - Pilot device serial, timestamp of rotation, timestamp of PR detection success, timestamp of successful sign-in.
   - End-to-end elapsed time from rotation trigger to lock screen display (target: under 60 minutes per DD §5.1.1.4 hourly PR cadence).

**Validation.**
- All steps complete without errors.
- The end-to-end timeline (rotation → display) is under 60 minutes.

**Gotchas.**
- If the PR runs faster than 60 minutes (e.g. you triggered it manually), confirm there isn't a stale Function key cached. The PR script reads the key from its embedded value at runtime each time.
- If the lock screen doesn't update visibly, confirm the PersonalizationCSP policy is applied (Settings → Personalization → Lock screen background, should be the PNG path). The setting may need a reboot to take effect — note this in the runbook.
- The Function App might cold-start (Premium plans keep instances warm; if you see a 10+ second response on first call, the plan may need warm-up instances configured).

**References.** DD V0.3 §5.1.1.4 Lock Screen Image Generation.

---

### WP-2.0a — Resource group and RBAC scaffold (0.5 d)

**Status:** APPROVED. Prerequisite for every other Phase 2A WP. [ ] RG created. [ ] Tags applied. [ ] RBAC assigned. [ ] Linked in Nerdio. [ ] Lock applied. [ ] Sensitivity label applied (or gap noted).

**Purpose.** Create the kiosk resource group, apply tags and RBAC, register it as a Linked Resource Group in Nerdio Manager for Enterprise, and apply the protective lock and sensitivity label. DD V0.3 §5.1.4 specifies "a new dedicated resource group" — singular — for the kiosk workload; this WP creates that container so WP-2.9 (workspace, host pool, application group) and WP-2.10 (golden image, Compute Gallery) have somewhere to land.

**Cyber-approval rationale.** Cyber item 4 blocks specific *resources* (Automation Account, runbooks, Key Vault, Function App, networking). It does not block empty resource groups. Item 3 explicitly approves the AVD workspace, host pool, application group, golden image, and Nerdio configuration, none of which can exist without an RG. Creating the RG now is therefore approved by necessity.

**Prerequisites.**
- WP-1.0 inputs gathered (subscription ID, APM RG naming convention, tag policy, cost centre code).
- Implementer holds Owner on the APM kiosk subscription (or Owner on the parent management group that will inherit to the new RG).
- Nerdio Manager for Enterprise managed identity principal ID known (ask APM Azure platform team if not documented).

**Procedure.**

1. **Confirm naming and tag conventions with APM platform team.** RESOLVED June 2026: APM platform team provisioned `auea-rg-avd-ctrl-kiosk-001` per their established convention (`auea-` region prefix, `-ctrl-` security domain segment). The plan's commands use this confirmed name throughout.

2. **Create the resource group.**

```bash
SUB_ID="{apmKioskSubscriptionId}"
RG="auea-rg-avd-ctrl-kiosk-001"
LOC="australiaeast"

az account set --subscription "$SUB_ID"

az group create \
    --name "$RG" \
    --location "$LOC" \
    --tags \
        Project="APMKiosk" \
        Workload="JobSeekerKiosk" \
        Environment="Production" \
        Sensitivity="Internal" \
        DataClassification="PII" \
        CostCentre="{apmCostCentre}" \
        Owner="{apmKioskOpsOwnerEmail}" \
        ImplementationPlan="v0.3.1" \
        DD="V0.3" \
        CyberApprovalScope="Phase2A-Approved" \
    --query "{name:name, location:location, id:id, provisioningState:properties.provisioningState}" \
    -o table

# Save the resource ID
az group show -n "$RG" --query id -o tsv >> ./inputs/azure-ids.md
```

If `az group create` fails with `RequestDisallowedByPolicy`, dump policy assignments with `az policy assignment list --scope /providers/Microsoft.Management/managementGroups/{mgId}` and align tag values to APM's governance before retrying.

3. **Apply RBAC.** Three principals get role assignments at RG scope.

```bash
RG_ID=$(az group show -n "$RG" --query id -o tsv)

# 3a. Implementer team — Contributor (build access for Phase 2A)
IMPL_GROUP_OBJID="{implementerTeamGroupObjId}"  # SG-APM-Kiosk-Admins object ID from WP-1.1
az role assignment create \
    --role "Contributor" \
    --assignee-object-id "$IMPL_GROUP_OBJID" \
    --assignee-principal-type Group \
    --scope "$RG_ID"

# 3b. APM platform team — Reader (visibility)
APM_PLATFORM_GROUP_OBJID="{apmPlatformTeamGroupObjId}"
az role assignment create \
    --role "Reader" \
    --assignee-object-id "$APM_PLATFORM_GROUP_OBJID" \
    --assignee-principal-type Group \
    --scope "$RG_ID"

# 3c. Nerdio Manager for Enterprise managed identity — Contributor
# Required for NME to deploy the host pool, application group, and (later) session host VMs into this RG.
NERDIO_MI_PRINCIPAL_ID=$(az webapp identity show \
    --name "{nerdioAppServiceName}" \
    --resource-group "{nerdioResourceGroup}" \
    --query principalId -o tsv)

az role assignment create \
    --role "Contributor" \
    --assignee-object-id "$NERDIO_MI_PRINCIPAL_ID" \
    --assignee-principal-type ServicePrincipal \
    --scope "$RG_ID"
```

If you do not know the Nerdio App Service name, ask APM Azure platform team — they applied this when NME was first onboarded. Check Nerdio's portal under Settings → Integrations → Azure subscriptions if you have NME Admin.

4. **Link the RG to Nerdio.** Azure-side Contributor (Step 3c) gives the permission. NME also needs the RG explicitly added to its Linked Resource Groups so it appears in the host pool create form dropdown in WP-2.9.

1. NME portal → **Settings → Azure Environment**.
2. Section **Linked Resource Groups** → **Add**.
3. Subscription: APM kiosk subscription.
4. Resource group: `auea-rg-avd-ctrl-kiosk-001`.
5. **OK**.

5. **Apply a delete lock.**

```bash
az lock create \
    --name "lock-apm-kiosk-prod-nodelete" \
    --resource-group "$RG" \
    --lock-type CanNotDelete \
    --notes "Production kiosk infrastructure. Removal requires APM change approval. Created via WP-2.0a $(date -u +%Y-%m-%d)."
```

`CanNotDelete` allows resource create / modify inside the RG (Nerdio needs this for session host reimage, runbook deployment, image versioning) and only blocks RG deletion. Do not use `ReadOnly`.

6. **Apply the sensitivity label.** Per WP-1.2.

1. Microsoft Purview portal → **Information Protection → Labels** → confirm the **Internal** label policy targets Azure resources.
2. Azure portal → `auea-rg-avd-ctrl-kiosk-001` → **Properties → Sensitivity** → apply **Internal**.

If Purview Information Protection doesn't target Azure resources at APM, capture the gap in `evidence/sensitivity-label-gap.md` and raise to APM Compliance Manager. Same residual-risk path WP-1.2 follows.

**Validation.**

```bash
# RG exists with correct metadata
az group show -n "$RG" \
    --query "{name:name, location:location, provisioningState:properties.provisioningState, tags:tags}" \
    -o json

# RBAC assignments
az role assignment list --resource-group "$RG" \
    --query "[].{principalName:principalName, role:roleDefinitionName, scope:scope}" -o table
# Expected: 3 entries — implementer Contributor, APM platform Reader, Nerdio MI Contributor.

# Lock present
az lock list --resource-group "$RG" -o table
# Expected: lock-apm-kiosk-prod-nodelete, type CanNotDelete.
```

- [ ] `auea-rg-avd-ctrl-kiosk-001` appears in NME's Linked Resource Groups list (manual check).
- [ ] Sensitivity label state captured in `evidence/wp-2.0a-resource-group.md` (Applied or Gap-noted).

**Gotchas.**

- **Tag values are case-sensitive and may be policy-governed.** APM's Azure Policy at MG scope may enforce specific allowed values for `Environment` or `CostCentre`. Align before creating.
- **The RG region binds the metadata only**, not the resources inside. You can deploy Australia East AVD resources into an `australiaeast` RG; don't accidentally pick `eastus` from a recently-used Azure portal session.
- **Nerdio MI Contributor on the RG is what makes Nerdio able to deploy into it.** Without it, WP-2.9 host pool create fails with 403 at the "deploying" stage. Verify the role assignment via `az role assignment list` before kicking off WP-2.9.
- **The `CanNotDelete` lock does not block create / modify inside the RG.** Nerdio reimaging, runbook deployment, and golden image versioning all work normally.
- **Don't put the Nerdio Manager for Enterprise app itself in this RG.** NME lives in its own RG created during NME deployment. This RG is for what NME *manages*, not for NME.
- **Empty RGs don't trigger Azure Policy violations for resource-type allow lists** (the policy evaluates resources, not their containers). The Phase 2A trigger for the allow-list issue surfaces at WP-2.9 when Nerdio tries to create the host pool, not here.

**References.** DD V0.3 §5.1.4 ("a new dedicated resource group"); Microsoft Learn — Manage Azure resource groups by using the Azure CLI; Microsoft Learn — Lock your resources to protect your infrastructure; Nerdio Manager for Enterprise — Azure Environment: linked networks and resource groups.

---

### WP-2.9 — Nerdio Manager + AVD host pool (1.0 d)

**Status:** APPROVED — **definitions and logic only** (cyber item 3). Do not provision session host VMs and do not enable auto-scaling until networking unblocks (item 4). [ ] Workspace defined. [ ] Host pool defined. [ ] Application group auto-created. [ ] Identity / Intune-enrol verified. [ ] Auto-scale toggle confirmed OFF. [ ] Session hosts deployed (gated on network unblock).

**Cyber sign-off scope (item 3, verbatim).** "Approval to stand up the AVD workspace (only the definitions), host pools (only the definitions and logic), application group, golden image and Nerdio configuration (logic only)."

**Out of scope for this WP** (item 4): session host VM provisioning, networking, Key Vault, Function App, Automation Account, runbooks.

**Purpose.** Define the kiosk AVD workspace and host pool in Nerdio Manager for Enterprise, with all design parameters from DD §5.1.3 / §5.1.4 in place. No session host VMs are provisioned. No networking is touched. The default Desktop application group is auto-created alongside the host pool.

**Prerequisites.**
- WP-2.0a complete (resource group, RBAC, NME Linked Resource Group entry).
- Nerdio Manager for Enterprise already deployed in the APM tenant (confirmed at WP-1.0). If not, NME deployment is a 2-hour separate activity outside this WP's 1-day budget.
- Implementer holds NME Administrator (granted).
- APM Entra ID directory profile exists in NME with **Enroll with Intune** checked (Step 0 below; one-off per tenant).

**Procedure.**

#### Step 0 — Confirm the Entra ID directory profile exists (prerequisite) — **[APPROVED]**

*Cyber rationale: Configuring an NME Directory profile is "Nerdio configuration (logic only)" under item 3. No Azure or Entra resource is deployed at this step; the profile is a template Nerdio uses when a future session host is provisioned.*

The host pool creation form will ask you to pick a Directory; that directory must already exist in NME with Intune enrolment enabled. **Do this once per tenant; if APM has an existing Entra ID directory profile in NME, skip to Step 1.**

1. NME portal → **Settings → Integrations**.
2. Locate the **Directory** tile → click **Add** (or **Edit** the existing entry if Entra ID is already configured).
3. Fill in the form:
   - **Profile name**: `APM-EntraID-Kiosk` (or reuse APM's existing tenant profile name).
   - **Directory**: select **Entra ID** from the dropdown. (The AD Domain / AD Username / AD Password fields disappear after you pick Entra ID.)
   - **Enroll with Intune**: **check this box**. NME's wording is verbatim "Enroll with Intune: Be sure to select this option." This is the toggle that causes session hosts to enrol in Intune at provisioning so the seven session-host Intune profiles from WP-1.7 actually land.
4. **OK** to save.

Take note of the profile name — you'll pick it in Step 3.

#### Step 1 — Create the AVD workspace — **[APPROVED]**

*Cyber rationale: Item 3 verbatim — "AVD workspace (only the definitions)". This step creates exactly that: the `Microsoft.DesktopVirtualization/workspaces` resource definition. No session hosts, no networking, no credential infrastructure.*

1. NME portal → **Workspaces** in the left navigation → **Add Workspace** (top-right).
2. Fill in:
   - **Workspace name**: `ws-apm-kiosk`
   - **Friendly name**: `APM JobSeeker Kiosk`
   - **Description**: `AVD workspace for the APM JobSeeker Kiosk solution. DD V0.3.`
   - **Subscription**: select the APM kiosk subscription.
   - **Resource group**: `auea-rg-avd-ctrl-kiosk-001`.
   - **Region**: `Australia East`.
3. **OK** to create. Workspace appears in the Workspaces list.

#### Step 2 — Open the workspace and start the host pool create flow — **[APPROVED]**

*Cyber rationale: Navigation only.*

1. Click the workspace name `ws-apm-kiosk` in the Workspaces list.
2. In the workspace detail view, navigate to **Dynamic Host Pools** (left sub-nav).
3. **Add Dynamic Host Pool** (top-right).

#### Step 3 — Configure the host pool create form — **[APPROVED]**

*Cyber rationale: Item 3 verbatim — "host pools (only the definitions and logic)". Every field on this form is definition / logic. Clicking Save creates the `Microsoft.DesktopVirtualization/hostPools` resource and the auto-generated default Desktop application group (also covered by item 3: "application group"). No session host VMs are provisioned.*

Apply every field exactly as below. The order on the form may differ slightly between NME minor releases; the fields and values do not.

| Field (NME UI label) | Value | DD reference | Approval note |
|---|---|---|---|
| **Name** | `HP-APM-Kiosk` | DD §5.1.3 Table 26 | Definition |
| **Friendly name** | `APM JobSeeker Kiosk Host Pool` | — | Definition |
| **Description** | `Pooled, single-session, ephemeral kiosk session hosts. Reimaged after each session. DD V0.3 §5.1.3.` | — | Definition |
| **Resource group** | `auea-rg-avd-ctrl-kiosk-001` | — | RG creation covered in WP-2.0a |
| **Region** | `Australia East` | DD §5.1.4 | Definition |
| **Workspace** | `ws-apm-kiosk` | — | Definition |
| **Desktop Experience** | **`Single User Desktop (Pooled)`** | DD §5.1.3 Table 26 + §5.1.4 (single-session) | Definition. v0.2 wrongly said "Pooled (multi-session)" — v0.3.1 corrects to single-session per DD §5.1.4 Table 22 ("no multi-session"). |
| **Load Balancing** | **`Breadth First`** | DD §5.1.3 Table 26 | Logic |
| **Max session limit** | **`1`** | DD §5.1.3 Table 26 ("Max session limit \| 1 (single-session kiosk)") | Logic. v0.2 wrongly said 8 — v0.3.1 corrects to 1 per DD. Max = 1 plus `singlesessionperuser:i:1` (WP-2.12) is the ephemeral guarantee; raising the limit breaks Layer 4 single-session enforcement. |
| **Validation environment** | **`No`** | DD §5.1.3 Table 26 | Definition |
| **Preferred app group type** | **`Desktop`** | DD §5.1.3 Table 26 + §6.2 Table 62 | Definition |
| **Start VM on Connect** | **`Enabled`** | DD §5.1.3 Table 26 | Logic (no VMs exist to start until item 4 unblocks; flag stays armed) |
| **Directory** | `APM-EntraID-Kiosk` (the Entra ID profile from Step 0) | DD §4.3 paragraph 123 (Intune-managed session hosts) | Logic — references the Step 0 profile |
| **FSLogix Configuration Profile** | **`OFF`** (do not select a profile) | DD §5.1.3 (zero persistence; ephemeral profiles) | Logic |
| **Name Prefix (VM naming)** | `HP-APM-Kiosk-` (becomes `HP-APM-Kiosk-001`, `-002`, etc.) | Drives the `SG-APM-AVD-SessionHosts` dynamic-membership rule from WP-1.1 | Logic — defines future host names; doesn't create them |
| **Desktop Image** | **Placeholder** — Azure Marketplace, `MicrosoftWindowsDesktop:Windows-11:win11-24h2-ent:latest` (Windows 11 **Enterprise single-session** 24H2, per DD §5.1.4 Table 22. CAUTION: the `-avd` SKUs in this offer are the multi-session edition — the 2026-06-10 drift review (A1) found the original build used `win11-24h2-avd` while mislabelling it single-session). NME requires this field; selecting an image only adds a reference to the host pool definition, no VM is created. WP-2.10 builds the custom golden image and swaps the reference. | WP-2.10 | Definition — picking a marketplace image reference is APPROVED under item 3 "host pools — definitions and logic only". The image only matters when "Add session hosts" is clicked, which is the UNAPPROVED action. |
| **VM Size** | `Standard_D2s_v5` (2 vCPU, 8 GB) | DD §5.1.4 Table 22 | Definition — describes what future hosts WILL be; doesn't deploy any |
| **OS Disk** | `128 GB`, **Standard SSD** | DD §5.1.4 Table 22 | Definition |
| **Quick Assign** | leave empty — assignment happens in WP-2.13 against `SG-APM-Kiosk-Users` | WP-2.13 | Deferred to WP-2.13 (also APPROVED) |

#### Step 4 — Apply RDP properties — **[APPROVED]**

*Cyber rationale: RDP properties are a string field on the host pool definition. Defining them is logic; they only take effect when a user connects to a session host, which won't happen until item 4 unblocks.*

The RDP properties section is on the same form (often near the bottom) or accessible via **Properties → AVD** on the saved host pool. Apply all three DD-required values:

```
enablerdsaadauth:i:1;redirectprinters:i:1;drivestoredirect:s:USB
```

- `enablerdsaadauth:i:1` — required for Entra ID SSO from the kiosk Windows App to the session host. Without it, the job seeker hits a second auth prompt at session-host sign-in (which the kiosk shell can't satisfy).
- `redirectprinters:i:1` — DD §5.1.3 Table 26.
- `drivestoredirect:s:USB` — DD §5.1.3 Table 26 (constrains drive redirection to USB devices only, subject to WP-1.0 decision on USB enablement).

Do not add `singlesessionperuser:i:1` here — that's added in WP-2.12 as a separate step so the change is auditable. With Max session limit = 1 the practical effect is already in place.

#### Step 5 — Save and capture the host pool resource ID — **[APPROVED with one trap]**

*Cyber rationale: Clicking Save creates the `Microsoft.DesktopVirtualization/hostPools` resource (and Nerdio auto-creates the default Desktop application group alongside it, which cyber item 3 explicitly approves). The host pool appears with 0 hosts — correct, because session host VM provisioning is BLOCKED.*

Click **OK** / **Save**. The host pool appears in the workspace's Dynamic Host Pools list with **0** hosts (expected).

Capture the Azure resource ID for cross-references in later WPs:

```bash
az desktopvirtualization hostpool show \
    -g auea-rg-avd-ctrl-kiosk-001 -n HP-APM-Kiosk \
    --query id -o tsv >> ./inputs/avd-ids.md
```

**Sub-action that would cross into UNAPPROVED:**

- After saving, NME often surfaces an **"Add hosts" / "Add session hosts" / "Provision hosts now"** action on the host pool. **DO NOT click this.** — **[UNAPPROVED IF EXECUTED]** Adding session hosts provisions VMs in `snet-avd-sessionhosts`, which depends on the AVD spoke VNet — BLOCKED under cyber item 4 (networking). The host pool definition stays at 0 hosts until item 4 unblocks.

#### Step 6 — Verify the identity / Intune configuration — **[APPROVED]**

*Cyber rationale: Read-only verification of the host pool definition. No deployment action.*

This is the load-bearing check from F-33. The session-host group `SG-APM-AVD-SessionHosts` and the seven session-host Intune profiles from WP-1.7 only work if the host pool is configured to Entra-join AND Intune-enrol each session host.

1. NME portal → **Workspaces → ws-apm-kiosk → Dynamic Host Pools → HP-APM-Kiosk**.
2. **Properties → Identity** (or **Properties → AVD** depending on NME version).
3. Confirm both:
   - **Directory**: `APM-EntraID-Kiosk` (Entra ID profile).
   - **Enroll with Intune**: **checked**.
4. Screenshot to `evidence/wp-2.9-host-pool-identity.png` for the Phase 2A evidence pack.

If "Enroll with Intune" is unchecked here, every session host that WP-2.10 provisions later (under item 4 unblock) will be invisible to Intune. `CMP-APM-AVD-SessionHosts` will report `Not evaluated` permanently. `CA-APM-Kiosk-RequireCompliantDevice` will deny every kiosk user. This is the silent-failure mode the v0.3 review flagged; the fix is to flip the checkbox now (which is APPROVED), not in Phase 3 after pilot devices have shipped.

#### Step 7 — Defer auto-scaling and reimaging to WP-2.11 — **[MIXED — see sub-actions]**

*Cyber rationale: Two sub-actions on opposite sides of the line.*

- **Configure auto-scaling logic (rules, thresholds, schedules) without enabling.** — **[APPROVED]** Cyber item 3 explicitly covers "Nerdio configuration (logic only)". You can draft the auto-scale plan and save it.
- **Enable / activate the auto-scale toggle.** — **[UNAPPROVED IF EXECUTED]** Activating auto-scale instructs Nerdio to begin provisioning session host VMs to meet the minimum capacity, which depends on the BLOCKED networking. Leave the auto-scale **toggle OFF** until item 4 unblocks.

NME may prompt for auto-scale configuration immediately after host pool creation. **Skip** the wizard, or complete it with **Auto-scaling: Off** in the top-right of the auto-scale page. The detailed auto-scale logic is configured in WP-2.11.

You can return and enable it after WP-2.10 + WP-2.11, when item 4 unblocks.

#### Step 8 — Validation — **[APPROVED]**

*Cyber rationale: Read-only confirmation checks on definitions and logic.*

Confirm before signing off WP-2.9:

- [ ] `az desktopvirtualization hostpool list -g auea-rg-avd-ctrl-kiosk-001 -o table` shows `HP-APM-Kiosk`.
- [ ] NME shows the host pool with **0 hosts**. (Expected — session host provisioning is BLOCKED.)
- [ ] Workspace `ws-apm-kiosk` exists; application group is auto-created by NME alongside the host pool (verify in `az desktopvirtualization applicationgroup list -g auea-rg-avd-ctrl-kiosk-001 -o table`).
- [ ] In Properties → Identity (Step 6): Directory = Entra ID profile, Enroll with Intune = checked.
- [ ] RDP property string saved with all three values (`enablerdsaadauth:i:1;redirectprinters:i:1;drivestoredirect:s:USB`).
- [ ] Auto-scale toggle is **OFF** (Step 7).
- [ ] Host pool definition exported to `evidence/wp-2.9-host-pool-config.json` via:
  ```bash
  az desktopvirtualization hostpool show -g auea-rg-avd-ctrl-kiosk-001 -n HP-APM-Kiosk > evidence/wp-2.9-host-pool-config.json
  ```

#### Quick reference — what would push WP-2.9 into UNAPPROVED territory

The whole WP-2.9 as written stays inside cyber's item 3 approval. The actions below would cross the line. If NME prompts you toward any of them, **save the definition, do not execute the deploy action**.

| Action | Why unapproved |
|---|---|
| Clicking "Add session hosts" / "Provision hosts now" on the host pool after creation | Provisions VMs in `snet-avd-sessionhosts`; networking is BLOCKED under item 4 |
| Enabling the auto-scale toggle to On | Triggers session host VM provisioning to meet minimum capacity; same blocker |
| Deploying any VNet, NSG, NAT gateway, or private endpoint that NME's host pool form might prompt for | Networking BLOCKED under item 4 footnote |
| Creating the Key Vault, Function App, or Automation Account that some Nerdio integrations offer to auto-deploy | Item 4 explicitly blocks these by name |
| Attaching the golden image from WP-2.10 to the host pool **and** clicking "Add host from this image" | Image attachment is fine (logic); the "Add host" action provisions a VM (unapproved) |
| Configuring FSLogix profile storage (Azure Files share or storage account) | Storage account is networking-adjacent; design says FSLogix is OFF anyway |

**Gotchas.**
- Nerdio creates ARM-deployed infrastructure with its own naming conventions. Don't manually edit Nerdio-managed resources via Azure portal — work through Nerdio.
- The `enablerdsaadauth:i:1` RDP property is essential for the single-sign-on flow from the kiosk's Windows App. Without it, users get a second authentication prompt at the session host.
- Pooled vs Personal: choose Pooled (the host pool **type**, set via Desktop Experience = `Single User Desktop (Pooled)`). Personal host pools are for dedicated 1:1 user-host assignment which is incompatible with the kiosk reimage cycle.
- Single-session vs multi-session is the **OS edition** decision, not the host pool type. DD §5.1.4 Table 22 specifies single-session ("no multi-session"). Max session limit = 1 plus single-user-per-VM gives the ephemeral guarantee.
- The "Entra ID join + Intune enrol" setting is the single most important setting in this WP. If it is left at "Entra ID join only", every session host that provisions in WP-2.10 (under item 4 unblock) is invisible to Intune. This is the silent-failure mode flagged as F-33 in `/scope/findings-v0.3.md`.
- **Desktop Image is mandatory at host pool create.** NME will not let you save the host pool with the field blank. The marketplace `MicrosoftWindowsDesktop:Windows-11:win11-24h2-ent:latest` reference (Step 3 table) is a placeholder that satisfies the field; it does not deploy any VM. After WP-2.10 captures the custom golden image to the Compute Gallery, return to **Host pool → Properties → VM Deployment → Desktop Image** and swap the reference. Use the `-ent` (single-session Enterprise) SKU, not `-avd` (multi-session) — the editions are easy to confuse in the picker and the DD specifies single-session.

**References.** DD V0.3 §4.3 paragraph 123 (Intune profile target scoping); DD V0.3 §5.1.3 Host Pool Configuration (Table 26); DD V0.3 §5.1.4 AVD Sizing Specification (Table 22); Nerdio Manager for Enterprise — Host Pool AVD Configuration; Nerdio Manager for Enterprise — Entra ID Join Feature.

---

### WP-2.10 — AVD Golden image (3.0 d)

**Status:** **COMPLETE (2026-06-09)** — image version `2026.06.09` captured to `gal_apm_kiosk / imdef-apm-kiosk-w11`, registered in Nerdio, set as the default for `HP-APM-Kiosk`. The procedure below is corrected to match what actually worked in production (v0.3.3) and is the reference for the quarterly image refresh. [x] Complete.

**Execution records.** The June 2026 build was executed entirely via CLI (no Bastion session was available). Two companion artefacts supersede portions of this section for re-runs:
- `outputs/JobSeeker_WP-2.10_GoldenImage_CLIOnly.md` — the CLI-only execution sheet (run-command based, with all policy gates and workarounds documented).
- `outputs/golden-image-build/rebuild.sh` + five PowerShell scripts — the re-runnable fire-and-forget rebuild bundle. **Use this for every future image refresh.**

**Purpose.** Build the gold-master Windows 11 **single-session** image (`win11-24h2-ent`, per DD §5.1.4 Table 22 and the WP-2.9/WP-2.12 single-session design) that every session host is provisioned from. Largest single WP in Phase 2.

**Edition correction (drift review A1, 2026-06-10).** The 2026.06.09 build used `win11-24h2-avd`, which is Windows 11 Enterprise **multi-session** — earlier versions of this plan mislabelled that SKU as single-session. Consequences: ProductType reports as Server (3), FSLogix comes pre-installed, and the captured edition contradicts the DD and the RFFR evidence trail. The re-bake path is scripted: `outputs/golden-image-build/rebuild.sh` now defaults to `win11-24h2-ent` and captures into a NEW gallery definition `imdef-apm-kiosk-w11-ent` (gallery definition properties are immutable; the original `imdef-apm-kiosk-w11`, sku label `Win11Multi`, is retained for rollback only). After capture: swap the Nerdio Desktop Image reference (HP-APM-Kiosk and, if live, the FVE host pool) to the new definition, re-run the probe validation, and record the change in `evidence/`. Expected single-session behavioural differences worth a probe check: FSLogix absent (fine — design disables it), Profile 2 Assigned Access more likely to be supported, and re-verify the Profile 11 time-zone reset behaviour on the `-ent` SKU before assuming it matches `-avd`.

**Prerequisites.**
- WP-2.9 (host pool exists).
- Bookmark list, branding, and Edge favourites JSON from WP-1.0.
- **Nerdio prerequisites (field-discovered June 2026, both required before step 4):**
  - NME → Settings → Azure Environment → **Azure Compute Gallery / geographic distribution** deployment mode enabled. Without it, TrustedLaunch images cannot be registered (the security-type selector is greyed out and the add fails with a security-type mismatch).
  - NME → Settings → **Default VM tags** configured with the APM mandatory tag set (`enableupdate`, `update-stage`, `backup` — see step 1 note). Nerdio's image-management working VM (`GI-APM-Kiosk`) and every future Nerdio-created session host are subject to the same management-group policies; without default tags, Nerdio VM operations are denied by policy.

**Procedure.**

Recommended approach: build the image in a temporary VM, capture to Azure Compute Gallery, then add to Nerdio's image catalogue.

1. Create the build VM in a temporary build subnet (or in `snet-avd-sessionhosts` with a `-build` suffix on the VM name):

```bash
# Three field-confirmed requirements (June 2026):
# (1) APM management-group policy denies any VM without the enableupdate /
#     update-stage / backup tags (backup must be one of: BasicVMBackup,
#     StandardVMBackup, StandardSQLVMBackup, StandardSQLVM(OS)Backup) and
#     --encryption-at-host.
# (2) --computer-name is required: the resource name (21 chars) exceeds the
#     Windows 15-character hostname limit and deployment fails without it.
# (3) TrustedLaunch on the build VM is required for the TrustedLaunch image
#     definition created at capture (security types must match end-to-end).
az vm create -g $RG -n vm-apm-kiosk-buildimg \
    --computer-name apmkioskbuild \
    --image MicrosoftWindowsDesktop:Windows-11:win11-24h2-ent:latest \
    --size Standard_D4s_v5 \
    --vnet-name vnet-apm-kiosk-avd --subnet snet-avd-sessionhosts \
    --public-ip-address "" \
    --admin-username apmbuilder --admin-password '{strongPassword}' \
    --license-type Windows_Client \
    --security-type TrustedLaunch \
    --enable-secure-boot true --enable-vtpm true \
    --encryption-at-host \
    --tags enableupdate=no update-stage=lead backup=BasicVMBackup \
        purpose=goldenimage-build-vm-transient
```

Connect via Bastion (recommended) or your APM jump host. **If no interactive session is available**, the entire configuration can be driven remotely via `az vm run-command invoke` — see the CLI-only execution sheet referenced above, which is the method the June 2026 production build used.

2. Inside the VM, apply the configuration in this order:

**a. Windows Updates.** Bring fully up to date. `Settings → Windows Update → Check for updates`. Reboot as required.

**b. AVD agents.** If using Nerdio, skip — Nerdio injects the AVD agents at session host provisioning. If hand-rolling, install the Microsoft AVD agent and the Boot Loader per Microsoft Learn.

**c. Edge configuration.** Edge is the only browser on the kiosk. Most policy is applied at runtime via the Intune profiles (WP-1.7 Profile 6 + 7), but the build image should:
   - Confirm Edge is current version (`edge://settings/help`).
   - Disable browser updates inside the session (handled by Intune; just confirm).

**d. Office.** Skip. The DD §7 Office Hardening says Office is **web-only**. Do not install Office click-to-run on the image.

**e. AVD-required configuration.** Apply per Microsoft Learn — *Prepare a Windows image for upload to Azure*:
   - Set time zone to Australia/Brisbane (or per APM site). **Note (field-confirmed June 2026): this setting does NOT survive — win11-24h2-avd resets the time zone to UTC during OOBE specialize on every session host provisioned from the captured image. The authoritative fix is WP-1.7 Profile 11 (Intune Settings Catalog time-zone profile targeting `SG-APM-AVD-SessionHosts`). Set it here anyway as belt-and-braces for pre-Sysprep sanity tests, but do not rely on it.**
   - Enable Remote Desktop.
   - Disable Storage Sense.
   - Disable Windows Update during the build (so Sysprep doesn't run during an update cycle).
   - Disable Cortana, Windows tips, suggested apps.

**f. Branding.** Apply the APM branding from WP-1.0:
   - Lock screen wallpaper is per-device (PR script generates), so leave the default here.
   - Desktop wallpaper: APM brand image at `C:\Windows\Web\Wallpaper\APMBrand.png`. Set as default via registry: `HKLM\Software\Microsoft\Windows\CurrentVersion\PersonalizationCSP\DesktopImageUrl`.
   - Themes: APM brand theme.

**g. USB rules.** Per DD §5.2 USB Configuration exception policy:
   - Confirm USB storage is **disabled by default**.
   - The USB exception (if APM enables it per WP-1.0 decision) is applied via Intune profile, not on the image.

**h. Audit.** Enable Windows audit logging for AVD-relevant events: sign-in failures, RDP session events, account lockout. Configure via Local Security Policy.

**i. Sysprep.** Final step before capture:

```powershell
C:\Windows\System32\Sysprep\sysprep.exe /generalize /shutdown /oobe /mode:vm
```

3. After Sysprep stops the VM, deallocate it and capture to Azure Compute Gallery:

```bash
# Stop and deallocate
az vm deallocate -g $RG -n vm-apm-kiosk-buildimg
az vm generalize -g $RG -n vm-apm-kiosk-buildimg

# Verify generalize via instance view (storageProfile.osDisk.osState does not
# reliably populate — check the status code instead):
az vm get-instance-view -g $RG -n vm-apm-kiosk-buildimg \
    --query "instanceView.statuses[?contains(code,'generalized')]" -o table

# Create Compute Gallery (one-time)
az sig create -g $RG --gallery-name gal_apm_kiosk -l $LOCATION

# Create image definition (one-time). SKU is a freeform label — use Win11Single
# to match the single-session design (the production gallery created June 2026
# carries the historical Win11Multi label; the value is immutable and cosmetic).
az sig image-definition create -g $RG --gallery-name gal_apm_kiosk \
    --gallery-image-definition imdef-apm-kiosk-w11 \
    --os-type Windows --publisher APM --offer Kiosk --sku Win11Single \
    --os-state Generalized --hyper-v-generation V2 \
    --features SecurityType=TrustedLaunch

# Create the image version. Field-confirmed June 2026: use --virtual-machine,
# NOT --managed-image. --managed-image expects an intermediate
# Microsoft.Compute/images resource that this flow never creates; with a VM
# resource ID it fails with "gallery image version source id must be specified
# in galleryimageversion.properties.storageprofile.source.virtualmachineid".
TODAY=$(date +%Y.%m.%d)
VM_ID=$(az vm show -g $RG -n vm-apm-kiosk-buildimg --query id -o tsv)
az sig image-version create -g $RG --gallery-name gal_apm_kiosk \
    --gallery-image-definition imdef-apm-kiosk-w11 \
    --gallery-image-version $TODAY \
    --virtual-machine $VM_ID \
    --target-regions "$LOCATION=1" \
    --replica-count 1
```

4. Add the image to Nerdio's catalogue: `Nerdio Manager → Desktop images → Add desktop image → From Azure Compute Gallery → gal_apm_kiosk / imdef-apm-kiosk-w11 / $TODAY`. Both Nerdio prerequisites from the Prerequisites block (Compute Gallery deployment mode; default VM tags) must be in place or this step fails — the first with a greyed-out security type, the second with a `RequestDisallowedByPolicy` on Nerdio's `GI-APM-Kiosk` working VM.

5. Mark this image as the default for `HP-APM-Kiosk`: `NME → Host pools → HP-APM-Kiosk → Auto-scale → Desktop Image (Template) → select the new version → Save`. (Field note June 2026: NME has no "Host pool → Properties → Image" screen — the Auto-scale Template field is the single binding setting; manual adds and reimage operations both reference it.)

6. **[BLOCKED — Phase 2B. Do NOT execute until the network unblocks (cyber item 4).]** Provision one session host from the new image:
   - Nerdio → Hostpools → HP-APM-Kiosk → Hosts → Add host → from the new image.
   - Wait for the host to provision (5-10 minutes).
   - This step requires `snet-avd-sessionhosts` to exist (WP-2.1, BLOCKED). Clicking "Add host" before the unblock crosses the cyber-approval line — see the WP-2.9 "what would push this into UNAPPROVED territory" callout. The June 2026 build validated the image with a transient probe VM in the placeholder VNet instead (boot-diagnostics screenshot of the lock screen + run-command acceptance checks); see the CLI-only execution sheet, section 10.

7. Delete the temporary build VM:

```bash
az vm delete -g $RG -n vm-apm-kiosk-buildimg --yes
```

**Validation.**
- A session host shows up in `HP-APM-Kiosk` with status Available.
- **Within 30 minutes of provisioning**, the session host appears in Intune `Devices → All devices` as Entra joined and Managed by Intune. If it appears as Entra joined only (no "Managed by Intune" column), the host pool was not configured with Intune enrol — go back to WP-2.9 step 3 and fix. Capture screenshot in `evidence/session-host-enrolment.md`.
- **Within 30 minutes** of provisioning, the session host appears in `SG-APM-AVD-SessionHosts`. If the group is assigned (Option (a) at WP-1.1), this happens via the Nerdio post-create hook calling Graph; if dynamic (Option (b)), it happens via the dynamic-membership rule on `device.displayName -startsWith "{sessionHostNamePrefix}"`. If neither path adds the host, debug at WP-1.1.
- **Within 30 minutes** of provisioning, all seven session-host Intune profiles (Profile 2, 3, 4, 6, 7, 9, 11 from WP-1.7) report Succeeded on the host (Intune → Devices → select host → Device configuration → all seven Succeeded; Profile 2 may report an Assigned Access error on a multi-session edition — see its Implementation caution).
- The session-host compliance policy `CMP-APM-AVD-SessionHosts` evaluates to Compliant within 30 minutes.
- Sign in to the session host (as your admin user, after granting access at WP-2.13): Edge launches, bookmarks present, no Office Click-to-Run installed, default theme is APM-branded.
- Sysprep didn't leave artefacts in `C:\Windows\Panther\` indicating issues (review setupact.log briefly).

**Gotchas.**
- Sysprep on Windows 11 (win11-24h2-avd) is fussy about installed Store apps. If Sysprep fails with "package was registered for a user but not installed", the standard fix is to remove the offending package via `Get-AppxPackage -AllUsers | Where-Object Name -like "*OffendingPackageName*" | Remove-AppxPackage -AllUsers`. Microsoft Learn has the full failure-mode list. The rebuild bundle's `03-appx-cleanup.ps1` pre-strips the known offenders (Copilot, the Xbox stack, consumer Teams, etc.) — keep its kill list current against Microsoft Learn at each refresh.
- Don't install AVD agents in the image if Nerdio injects them — duplicates cause sign-in to silently fail.
- Image versions are immutable. Future updates are new versions (e.g. `2026.09.09`) that Nerdio swaps in on next reimage cycle.
- Trusted Launch is required end-to-end: build VM, image definition (`--features SecurityType=TrustedLaunch`), Nerdio deployment mode, and any probe/session host. A mismatch at any point fails with a security-type error.
- **Cloud Shell CLI bug (June 2026):** `az vm boot-diagnostics enable` crashes client-side ("Conflict key when apply client flatten") on any VM carrying the APM Guest Configuration policy extension (`AzurePolicyforWindows` — i.e. every VM in this tenant). The API call may still succeed. Workaround: enable via `az rest --method PATCH` on the VM's `diagnosticsProfile`, or use the portal (Help → Boot diagnostics → Settings). Details in the CLI-only execution sheet.
- **Starting a Sysprepped VM destroys its generalized state** (OOBE specialize runs and the capture window is lost). If the VM is accidentally started post-Sysprep, rebuild rather than attempting to re-Sysprep — a conditionally-clean image is not worth the risk at fleet scale. The rebuild bundle makes this a ~2-hour unattended operation.
- **If the session host's compliance state stays "Not evaluated"**, the host has not been Intune-enrolled at provisioning. Check Nerdio host-pool identity settings (WP-2.9 step 3). This is the silent failure mode that breaks `CA-APM-Kiosk-RequireCompliantDevice` and locks out every kiosk user — catch it here, not in Phase 3.

**References.** DD V0.3 §5.1.2 Golden Image Specification; DD V0.3 §4.3 paragraph 123 (Intune profile scoping); Microsoft Learn — Prepare a Windows image for upload to Azure; Nerdio image management.

---

### WP-2.11 — Nerdio auto-scaling + scheduled reimaging (1.0 d)

**Status:** APPROVED — **logic only** (cyber item 3). Scaling rules and reimage schedule defined; cannot exercise without session hosts. [ ] Logic defined. [ ] Exercised against session hosts (gated on network unblock).

**Purpose.** Configure dynamic capacity and nightly reimaging so session hosts stay current with the golden image and never accumulate user data.

**Prerequisites.**
- WP-2.9, WP-2.10 complete.

**Procedure.**

1. **Auto-scaling.** In Nerdio: `Hostpools → HP-APM-Kiosk → Auto-scale → Configure`.

| Setting | Value | Reason |
|---|---|---|
| Auto-scale type | Dynamic | Scale up/down by demand |
| Min active host pool capacity | 1 | Always at least one host on |
| Max active host pool capacity | 10 | Bound the cost; revisit at scale |
| Scale-out threshold | 75% session capacity | Add a host before saturation |
| Scale-out increment | 1 host | Conservative ramp |
| Scale-in threshold | 30% session capacity | Drain when underutilised |
| Scale-in delay | 30 minutes | Avoid flapping |
| Burst delete (after-hours) | Yes | Reduce baseline to min during overnight |
| Burst delete schedule | 22:00-06:00 local | Off-hours window |
| Burst delete force-disconnect | Yes after 30 min idle | Don't keep ghost sessions overnight |
| Drain mode for over-capacity hosts | Yes | New sessions go elsewhere |

2. **Scheduled reimaging.** `Hostpools → HP-APM-Kiosk → Auto-scale → Scheduled Reimage`.

| Setting | Value | Reason |
|---|---|---|
| Schedule | Daily 01:00 local | DD §5.2 — nightly reimage |
| Reimage source | Current default image (set in WP-2.10) | Always uses the gold-master |
| Allow active sessions | No | Force-disconnect before reimage |
| Force-disconnect delay | 15 minutes warning | Operators get advance notice |

3. **Drain mode.** Confirm hosts marked for delete enter drain mode (new sessions blocked) before deletion. This is Nerdio default.

4. **Cost report.** Enable cost reporting in Nerdio's reporting module so APM can see the kiosk fleet's daily Azure spend.

**Validation.**
- `Nerdio → Hostpools → HP-APM-Kiosk → Auto-scale` shows the configured rules.
- Force a manual scale: create 5 sessions on the single host; confirm Nerdio scales up to a second host within the configured delay.
- Wait for the nightly reimage window; confirm next morning the host pool has a freshly reimaged host with no residual data.

**Gotchas.**
- Burst delete during off-hours assumes APM operates the kiosks in business hours. Confirm whether 24h sites need overnight capacity (some Workforce Australia sites do).
- Scheduled reimage destroys session host data. Anything written to `C:\` during the day is gone. This is the design (stateless), but document it loudly so APM ops don't get surprised.

**References.** DD V0.3 §5.2 Auto-Scaling, Session Host Reimaging; Nerdio Manager auto-scale documentation.

---

### WP-2.12 — Single-session enforcement (0.5 d)

**Status:** APPROVED — **definitions only** (cyber item 3). RDP property defined at host pool level; cannot validate without session hosts. [ ] Definitions in place. [ ] Validated against session hosts (gated on network unblock).

**Purpose.** Layer 4 of the device-bound access design. A kiosk user identity can only have one active AVD session at any time, preventing the "two legitimate kiosk devices simultaneously" residual risk.

**Prerequisites.**
- WP-2.9 (host pool exists).

**Procedure.**

An earlier DD revision referred to this control as "FSLogix Single-Session Enforcement". The more correct mechanism for AVD pooled host pools is the host pool's own `personalDesktopAssignmentType=Disabled` plus the RDP setting `singlesessionperuser:i:1`. FSLogix is also involved (it normally manages profiles; here, with no profile container, FSLogix is configured to enforce single-session-per-user at the agent level).

1. Apply the RDP property at the host pool level. `Nerdio → Hostpools → HP-APM-Kiosk → Properties → RDP properties` — add:

```
singlesessionperuser:i:1
enablerdsaadauth:i:1
```

(The `enablerdsaadauth:i:1` was set in WP-2.9; confirm both are present.)

2. Disable FSLogix Profile Containers (kiosks are stateless; no need to persist user data):
   - In the golden image (re-bake if not already done): set `HKLM\SOFTWARE\FSLogix\Profiles\Enabled = 0`.
   - Confirm `Office Container Enabled = 0` likewise.

3. If FSLogix is required for any reason (it shouldn't be on a kiosk):
   - Configure single-session enforcement: `HKLM\SOFTWARE\FSLogix\Profiles\PreventLoginWithFailure = 1` and `PreventLoginWithTempProfile = 1`.

4. Test: sign in as the pilot kiosk user on device A. Then attempt to sign in as the same user on device B. Expected: device B's sign-in is refused with "You can't sign in to this device because someone is already signed in".

**Validation.**
- The pilot user can sign in on one device.
- A second simultaneous sign-in on a different device is refused.
- After signing out of device A, device B sign-in succeeds (single-session, not lockout).

**Gotchas.**
- The `singlesessionperuser` flag is honoured by the Microsoft Windows App client. The AVD web client may not honour it identically; the CA policy `CA-APM-Kiosk-BlockWebClient` (WP-1.4) already blocks the web client so this isn't a practical gap.
- FSLogix being **disabled** is the right answer for kiosks; some operators/architects assume FSLogix should always be on. Document the choice explicitly in `evidence/avd-config.md`.

**References.** DD V0.3 §7 Cyber & Security Architecture (Layer 4 of the device-bound access design).

---

### WP-2.13 — AVD application group permissions (0.5 d)

**Status:** APPROVED (cyber item 3). [ ] Complete.

**Purpose.** Grant kiosk users access to the AVD application group so they can launch the desktop session.

**Prerequisites.**
- WP-2.9 (application group exists), WP-1.1 (`SG-APM-Kiosk-Users` exists).

**Procedure.**

1. Find the application group ID:

```bash
APP_GROUP_ID=$(az desktopvirtualization applicationgroup list -g $RG \
    --query "[?contains(name, 'HP-APM-Kiosk')].id" -o tsv)
```

2. Assign `SG-APM-Kiosk-Users` the `Desktop Virtualization User` role on the application group:

```bash
KIOSK_USERS_GROUP_ID="{kioskUsersGroupId}"
az role assignment create \
    --role "Desktop Virtualization User" \
    --assignee-object-id $KIOSK_USERS_GROUP_ID \
    --assignee-principal-type Group \
    --scope $APP_GROUP_ID
```

3. Assign `SG-APM-Kiosk-Admins` the `Desktop Virtualization Host Pool Reader` role on the host pool (for diagnostics):

```bash
KIOSK_ADMINS_GROUP_ID="{kioskAdminsGroupId}"
HOSTPOOL_ID=$(az desktopvirtualization hostpool show -g $RG -n HP-APM-Kiosk --query id -o tsv)
az role assignment create \
    --role "Desktop Virtualization Host Pool Reader" \
    --assignee-object-id $KIOSK_ADMINS_GROUP_ID \
    --assignee-principal-type Group \
    --scope $HOSTPOOL_ID
```

**Validation.**
- Pilot kiosk user can launch Windows App and see the `HP-APM-Kiosk` desktop in the available resources list.
- Pilot user signs in successfully (lands at the Windows desktop / Shell Launcher-controlled shell per WP-1.7 Profile 5).
- Validation requires a real kiosk user account, which depends on the WP-2.5 user-creation runbook (BLOCKED Phase 2B). For Phase 2A validation, create one or two kiosk user accounts manually under the approved F3 licensing template (per §0.6 "What this means in practice" guidance) and use them for the WP-2.13 sign-in test.

**Gotchas.**
- Role propagation can take 15-30 minutes. If a user can't see the desktop immediately after assignment, wait before troubleshooting further.
- The CA policy `CA-APM-Kiosk-DeviceBound` is in **report-only** mode under cyber item 1, so it will not actually block the sign-in but will log a Would-Block verdict. Sign-in test that hits the desktop will still succeed from any device; the report-only column is the evidence path.
- `CA-APM-Kiosk-RequireCompliantDevice` evaluates the **client device** the user is signing in from (the kiosk thin client), not the session host. So an AVD sign-in test will succeed at the CA gate as long as the thin client is Compliant against `Compliance-APM-Kiosk-W11IoT`. Session host Intune enrolment from WP-2.9 / WP-2.10 still matters for two other reasons: (1) so the seven session-host Intune profiles from WP-1.7 actually land on the host (in-session lockdown, Edge hardening, Edge favourites, RDS timers, lock-on-disconnect, profile cleanup, time zone), and (2) so `CMP-APM-AVD-SessionHosts` evaluates and provides RFFR audit evidence of session-host posture. If the session host is Compliance state `Not evaluated`, AVD sign-in still works (no CA policy gates on session-host compliance), but the seven profiles silently don't apply and the RFFR evidence pack has a gap. Spot-check both `Compliance-APM-Kiosk-W11IoT` (thin client) and `CMP-APM-AVD-SessionHosts` (session host) show Compliant before pen test in WP-3.4.

**References.** DD V0.3 §6.2 AVD Application Group; DD V0.3 §6.2 Table 62.

---

### WP-2.14 — Microsoft Office hardening (web-only) (0.5 d)

**Status:** APPROVED (cyber item 3, image-level hardening). [ ] Complete.

**Purpose.** Document the residual risk that Office Online (Word/Excel/PowerPoint in browser) does not support endpoint-level application hardening, and apply the compensating controls.

**Prerequisites.**
- WP-2.10 (golden image confirms no local Office install).

**Procedure.**

1. Confirm no local Office click-to-run install on the golden image. `Programs and Features` on the session host shows no Microsoft Office or Microsoft 365 Apps entry.

2. Document the residual risk acceptance in `./decisions.md`:

> Microsoft Office Hardening — Residual Risk Acceptance
>
> Per DD V0.3 §7, Office Online (Word, Excel, PowerPoint accessed via Edge) does not support endpoint-level application hardening controls (macro configuration, Protected View enforcement, OLE/DDE restrictions, application allow-listing). The compensating controls applied are:
>
> 1. No local Office install — there is no Word/Excel/PowerPoint executable on the kiosk session host.
> 2. Edge SmartScreen enabled (WP-1.7 Profile 6) blocks known-malicious file downloads.
> 3. Edge file download policy (WP-1.7 Profile 6) restricts download destinations.
> 4. Stateless session — anything downloaded during a session is destroyed on session end (nightly reimage; immediate user profile cleanup per WP-1.7 Profile 9).
> 5. No persistent user profile — FSLogix disabled (WP-2.12); no document accumulates session-to-session.
>
> The residual risk is that a malicious Office file opened in Office Online could exploit a Microsoft-hosted vulnerability. This is a Microsoft service security boundary, accepted as residual risk under the standard SaaS shared-responsibility model.
>
> Signed: [implementer]. Date: [date]. Accepted by: [APM lead].

3. Edge policy refinement: block downloads of Office macro-enabled file types (`.docm`, `.xlsm`, `.pptm`) at the Edge layer. Update WP-1.7 Profile 6 with:

| Setting | Value |
|---|---|
| Microsoft Edge → Block dangerous file downloads | `.docm,.xlsm,.pptm,.xlsb` |

Re-deploy the Edge configuration profile.

**Validation.**
- Sign in to AVD session, open Edge, navigate to a known `.docm` test URL. Download blocked.
- `Programs and Features` on the session host shows no Office install.

**Gotchas.**
- The residual risk acceptance document must be signed by APM, not by the project team. The risk is in APM's environment under their compliance regime.
- If APM later requires local Office for any reason, this WP's design assumption changes and the hardening scope expands materially.

**References.** DD V0.3 §7 Microsoft Office Hardening.

---

### WP-2.15 — Zscaler outbound integration (1.5 d)

**Status:** **BLOCKED** (cyber item 4 — networking). [ ] Unblocked. [ ] Complete.

**Purpose.** Coordinate with APM's Zscaler administrator to permit the outbound traffic the kiosk solution requires.

**Prerequisites.**
- WP-2.2 complete (`avd-fqdn-allowlist.md` exists).
- APM Zscaler administrator engaged (chase via APM lead from WP-1.0).

**Procedure.**

1. Package the allowlist for handover to APM Zscaler admin. Source: `./inputs/avd-fqdn-allowlist.md`. Add a covering note explaining:

```
APM JobSeeker Kiosk — Zscaler Outbound Allowlist Request

Source: APM kiosk fleet egress (Australian sites)
Destination: Azure Virtual Desktop + Microsoft 365 endpoints + the
             Credential Proxy (func-apm-cred-proxy.azurewebsites.net)

Required action: Allow outbound HTTPS (443) to the FQDNs and IP CIDRs
listed below. AVD reverse-connect uses TLS 1.2+ with certificate
pinning; Zscaler SSL inspection must be DISABLED for the AVD FQDNs
(certificate pinning breaks under MITM inspection).

Allowed-to-bypass-SSL-inspection FQDNs (mandatory):
*.wvd.microsoft.com
*.prod.warm.ingest.monitor.core.windows.net
catalogartifact.azureedge.net

Allowed-with-SSL-inspection FQDNs:
[full list from avd-fqdn-allowlist.md]

NAT public IPs for platform-managed outbound (from WP-2.1):
- {pip-natgw-avd value}
- {pip-natgw-hub value}
```

2. Schedule a working session with the Zscaler admin to walk the list and confirm:
   - The kiosk fleet's identification at Zscaler (likely by source IP range of the site networks; not the kiosk's individual identity since kiosks egress via site router).
   - Which Zscaler policy applies — APM Standard, APM-Kiosk, or new policy.
   - SSL inspection bypass for the AVD FQDNs (critical — without this, AVD sign-in fails).

3. Once Zscaler policy is in place, test from a pilot kiosk:
   - From kiosk → AVD sign-in succeeds.
   - From kiosk → Edge → workforceaustralia.gov.au loads.
   - From kiosk → Edge → an arbitrary blocked site (e.g. `gambling.example.com`) is blocked by Zscaler with the expected block page.

4. Document the Zscaler configuration in `./evidence/zscaler-config.md` for future reference.

**Validation.**
- Pilot kiosk reaches AVD via the Microsoft Windows App and signs in successfully.
- The Credential Proxy Function App is reachable from the kiosk (test: PR detection script run on pilot device returns 200).
- Edge browser loads bookmark URLs.
- Unauthorised destinations are blocked by Zscaler (test: an arbitrary non-allowlisted URL).

**Gotchas.**
- AVD certificate pinning is the single most common Zscaler failure mode. Symptoms: AVD sign-in starts, then fails at the session-host handshake with `0x3000018` or similar. Fix: ensure `*.wvd.microsoft.com` is in the SSL-inspection bypass list.
- Microsoft refreshes the AVD FQDN list quarterly. Schedule a calendar reminder to refresh `avd-fqdn-allowlist.md` and re-share with Zscaler admin.
- If APM uses Zscaler Client Connector (endpoint agent) anywhere in the path, confirm the kiosk session is NOT in scope of the agent — kiosks don't have ZCC installed.

**References.** DD V0.3 §5.1.4 Zscaler Proxy Configuration; Microsoft Learn — Required FQDNs and endpoints for AVD; APM Zscaler standards documentation.

---

### Phase 2 acceptance checklist

Before declaring Phase 2 complete and moving to Phase 3, confirm:

- [ ] Three VNets exist (hub, AVD spoke, shared services); peerings Connected; NAT gateways have stable public IPs.
- [ ] Azure Private DNS zones for Key Vault, Function App, Storage, AVD are created and VNet-linked.
- [ ] `kv-apm-kiosk` exists with public access disabled, private endpoint, purge protection, RBAC mode.
- [ ] System Hybrid Runbook Worker is online on `vm-apm-kiosk-hrw`; test runbook executes against it.
- [ ] Credential Proxy Function App is deployed, VNet-integrated, public endpoint accessible with function key, can fetch from Key Vault.
- [ ] `Create-KioskUser` runbook is the production version (not the Phase 1 starter) and creates user + Key Vault secret + group membership in one transaction.
- [ ] `Rotate-KioskUserPasswords` runbook is scheduled quarterly and tested on at least one pilot user.
- [ ] End-to-end rotation cycle test passes within 60 minutes (per DD §5.1.1.4).
- [ ] Nerdio Manager connected; `HP-APM-Kiosk` host pool exists; **(Phase 2B gate)** one session host provisioned and reachable — deferred until WP-2.1 network unblocks; image validated via transient probe VM in the interim (June 2026).
- [ ] Golden image captured to Azure Compute Gallery and set as default in Nerdio.
- [ ] Auto-scaling and scheduled reimaging configured and observed working.
- [ ] Single-session enforcement (Layer 4) tested — same user cannot sign in to two devices simultaneously.
- [ ] AVD application group permissions assigned; pilot kiosk user can sign in to AVD.
- [ ] Office Online hardening residual risk acceptance signed by APM.
- [ ] Zscaler allowlist applied; kiosk reaches AVD, Credential Proxy, and bookmark URLs; unauthorised destinations blocked.

Sign off Phase 2 acceptance in `./evidence/phase-2-signoff.md`.

---

## Phase 3 — Physical Device Provisioning

**Effort:** ~10.5 days single resource.
**Phase status:** BLOCKED — requires Phase 2B credential infrastructure and finalised network. WP-3.5 framework drafting can proceed now in preparation; WP-3.4 pen test scope drafting can proceed now.
**Phase checkbox:** [ ] Phase 2B complete. [ ] Phase 3 complete.
**Outcome:** Pilot fleet of 5-10 devices deployed across 2-3 sites; the four-layer device-bound access design validated against the test plan in WP-3.3 below; third-party penetration test completed and findings remediated; escalation framework established ready for Phase 4 national rollout.

### Execution ordering

Phase 3 is more sequential than Phase 2 — each WP gates the next:

| Order | Work package | Why this order |
|---|---|---|
| 1 | WP-3.1 — Site network coordination | Sites must be network-ready before any device ships |
| 2 | WP-3.2 — Pilot deployment | First contact with reality; surfaces every assumption the design got wrong |
| 3 | WP-3.3 — Layer 1-4 enforcement validation | Tests the security model against real devices |
| 4 | WP-3.4 — Penetration testing | Third-party validation; remediation cycle |
| 5 | WP-3.5 — National rollout support setup | Establish the monitoring and escalation framework before Phase 4 ramps |

WP-3.5 is mostly preparation; the actual reactive support load is in Phase 4 WP-4.1.

---

### WP-3.1 — Site network coordination (1.0 d, implementer-advise role)

**Status:** **BLOCKED** (depends on network design finalisation). Preparatory checklist drafting can proceed. [ ] Site checklist drafted. [ ] Network unblock. [ ] Complete.

**Purpose.** APM is responsible for site-level network readiness (WiFi, ethernet, internet egress). the project team's role is to define the requirements clearly and validate readiness before each site receives devices. This WP produces the site readiness checklist and walks it with APM site IT.

**Prerequisites.**
- Phase 1 and Phase 2 complete.
- WP-2.1 NAT public IPs documented (Zscaler/firewall identification).
- WP-2.15 Zscaler allowlist applied.
- APM site list confirmed (from WP-1.0).

**Procedure.**

1. Produce the site readiness checklist. Save to `./outputs/site-readiness-checklist.md`:

```markdown
# APM JobSeeker Kiosk — Site Readiness Checklist

For each site receiving kiosk devices, the following must be in place
**before** devices are shipped:

## Network
- [ ] WiFi SSID broadcasting and reachable from the kiosk install location
- [ ] WiFi credentials documented (WPA2-Enterprise preferred; PSK acceptable
      for pilot; per-device cert via SCEP profile for production)
- [ ] At least one Ethernet port within 3m of the kiosk install location
      (for re-imaging fallback per DD §5.1.4)
- [ ] Outbound 443/TCP permitted to Microsoft AVD endpoints
      (see avd-fqdn-allowlist.md)
- [ ] Outbound 443/TCP permitted to func-apm-cred-proxy.azurewebsites.net
- [ ] DNS resolution working — `nslookup login.microsoftonline.com` succeeds
- [ ] No proxy authentication required for the kiosk's egress path
      (Zscaler transparent or device-bypass per WP-2.15)
- [ ] Bandwidth sufficient for one AVD session per kiosk (~1.5 Mbps minimum,
      5 Mbps recommended) at peak concurrent device count

## Power and physical
- [ ] Mains power outlet within 1m of the kiosk install location
- [ ] Surge protection at the power point
- [ ] Kiosk install location away from direct sunlight (display visibility)
- [ ] Tamper-resistant mounting hardware specified per APM site standard
- [ ] Sufficient space for the kiosk hardware footprint plus monitor

## Site contact
- [ ] Named on-site contact for each device (powers on, reports issues)
- [ ] Contact reachable during business hours; out-of-hours protocol noted

## Confirmation
- Site name: ___
- Confirmed by: ___ (APM site IT)
- Date: ___
- Number of devices for this site: ___
```

2. Send to APM site coordinator with a covering note: "Please run this checklist for each site before we ship devices. Sites failing the checklist will receive their devices after the relevant fix is in place. We expect to pilot at 2-3 sites first, then ramp."

3. For the pilot sites (WP-3.2), conduct a remote walkthrough with each site's IT contact:
   - Confirm WiFi connectivity from a test device.
   - Run network reachability tests (Microsoft Connectivity Test at `aka.ms/aadbrowsersupport` and the AVD-specific tool at `azure.microsoft.com/en-us/services/virtual-desktop/check`).
   - Confirm DNS, NTP (sync within 5 minutes of `time.windows.com`).
   - Validate Zscaler bypass / allowlist by running `Test-NetConnection` against `func-apm-cred-proxy.azurewebsites.net` over 443.

4. Document any site-specific deviations (e.g. SCEP-issued WiFi certs for production, dedicated VLAN per site) in `./evidence/site-network.md`.

5. Confirm the project team's commitment in writing: this WP delivers requirements and validates them; APM owns physical site readiness. If a site fails the checklist at deployment time, the device is held back, not shipped. This sets the precedent for the Phase 4 rollout.

**Validation.**
- Site readiness checklist signed off for the 2-3 pilot sites before WP-3.2 starts.
- Test device from each pilot site reaches `login.microsoftonline.com` and `func-apm-cred-proxy.azurewebsites.net` over 443.

**Gotchas.**
- WiFi captive portals are the biggest pilot-time killer. Many APM sites use a corporate WiFi that requires a sign-in landing page; this is incompatible with the headless Autopilot OOBE. Confirm captive portals are bypassed or pre-authenticated by MAC or 802.1X for the kiosk devices.
- Some APM sites have outbound proxy enforcement at the site router level (in addition to Zscaler). Catch these on the walkthrough — `Test-NetConnection -ComputerName login.microsoftonline.com -Port 443` shows the route.
- The NAT public IP from WP-2.1 (`pip-natgw-avd`) is for **cloud-side** egress. Kiosk-side egress is the site router's public IP, not the NAT gateway. APM Zscaler admin needs both: the kiosk fleet's site egress IPs and the platform's cloud NAT IPs.

**References.** DD V0.3 §5.1.4 Network & Infrastructure (Kiosk Device Connectivity); DD §5.1.4 Network Responsibilities & Dependencies.

---

### WP-3.2 — Pilot deployment (5-10 devices across 2-3 sites) (3.0 d)

**Status:** **BLOCKED** (requires credential infra from Phase 2B + physical network). [ ] Phase 2B unblocked. [ ] Pilot devices deployed. [ ] Complete.

**Purpose.** First production-shape deployment. Validate every Phase 1 + 2 design choice against real hardware in a real site. Surface the assumptions that didn't survive contact.

**Prerequisites.**
- WP-3.1 (sites confirmed ready).
- the device-prep partner process for hash CSV operational (Phase 1 WP-1.5).
- All Phase 2 acceptance criteria signed off.

**Procedure.**

1. **Batch register devices.** the device-prep partner runs the wipe-and-prep process per DD §5.1.1.4 on the pilot devices and produces a single CSV of hardware hashes.

   Receive the CSV; import to Autopilot:

```bash
# Manual ingest via Intune admin centre:
# Devices → Windows enrolment → Devices → Import → CSV
# Or via Graph API:
$csv = Import-Csv ./pilot-batch-1.csv
foreach ($row in $csv) {
    New-MgDeviceManagementWindowsAutopilotDeviceIdentity `
        -SerialNumber $row.'Device Serial Number' `
        -ProductKey $row.'Windows Product ID' `
        -HardwareIdentifier $row.'Hardware Hash' `
        -GroupTag "KIOSK" `
        -AssignedUser ""
}
```

   Within 30 minutes, each imported device appears in the `SG-APM-Kiosk-Devices` dynamic group.

2. **Create kiosk users for the pilot batch.** Run the Phase 2 `Create-KioskUser` runbook for each device:

```bash
# Get F3 SKU
F3_SKU=$(az rest --method get --url "https://graph.microsoft.com/v1.0/subscribedSkus" \
    --query "value[?skuPartNumber=='M365_F3'].skuId" -o tsv)

# For each device serial in the pilot batch
for SERIAL in PILOT001 PILOT002 PILOT003 PILOT004 PILOT005; do
    az automation runbook start -g $RG \
        --automation-account-name aa-apm-kiosk \
        --name Create-KioskUser \
        --parameters "{\"SerialNumber\":\"$SERIAL\",\"F3SkuId\":\"$F3_SKU\"}" \
        --run-on hwg-apm-kiosk
    sleep 10  # avoid hammering the Automation Account
done
```

3. **Generate per-device Function keys** (one per device, per WP-2.4):

```bash
for SERIAL in PILOT001 PILOT002 PILOT003 PILOT004 PILOT005; do
    KEY=$(az functionapp keys set -g $RG -n func-apm-cred-proxy \
        --key-name "kiosk-$SERIAL" --key-type functionKeys --query value -o tsv)
    echo "$SERIAL,$KEY" >> ./inputs/pilot-function-keys.csv
done
```

4. **Inject the per-device Function key into a per-device PR script.** This is the one tricky bit — the PR detection/remediation scripts from WP-1.8 have `{perDeviceFunctionKey}` as a placeholder. For the pilot you have two options:

   **Option A (recommended for pilot):** A single PR with the script reading the Function key from a known location written by an Autopilot-time setup script. Use Intune Win32 app or PowerShell script during ESP (Enrolment Status Page) to write `C:\APM\Kiosk\funckey.txt` based on the device serial, looked up against `pilot-function-keys.csv` hosted in a Key Vault secret read at provisioning. This stays maintainable at scale.

   **Option B (simpler but worse):** One PR per device with the key baked in. Doesn't scale beyond pilot.

   For the pilot, use Option B — bake the key per device. Update the PR detection/remediation scripts from WP-1.8 to replace `{perDeviceFunctionKey}` with the actual value, and deploy as 5 separate PR instances scoped to single-device filter groups. Migrate to Option A before Phase 4 rollout (note this in the Phase 3 acceptance checklist).

5. **Ship the devices.** the device-prep partner ships per APM standard. Confirm tracking numbers per device → site mapping in `./evidence/pilot-shipments.md`.

6. **Site activation.** For each pilot site, coordinate the device power-on:

   a. APM site contact unboxes and connects to power + network (WiFi or ethernet).
   b. Device powers on; Windows 11 OOBE begins.
   c. Autopilot detects the device, downloads the `APM-Kiosk-SelfDeploying` profile, joins to Entra ID, applies Intune profiles, configures Shell Launcher v2, runs the PR for lock screen generation.
   d. Total OOBE-to-ready time should be 20-40 minutes depending on network speed.
   e. APM site contact confirms the lock screen displays the per-device credentials.

7. **Validate each pilot device end-to-end.**

| Check | How | Pass criteria |
|---|---|---|
| Device enrolled in Autopilot | Intune admin centre → Devices | Status = `Healthy`, Compliance = `Compliant` |
| Device in `SG-APM-Kiosk-Devices` | `Get-MgGroupMember -GroupId $kioskDevicesGroupId` | Device present |
| Kiosk user account exists | `Get-MgUser -Filter "userPrincipalName eq 'kiosk-<serial>@apm.net.au'"` | User present, F3 assigned |
| Key Vault has per-device secret | `Get-AzKeyVaultSecret -VaultName kv-apm-kiosk -Name kiosk-<serial>` | Secret present, latest version |
| Lock screen displays credentials | Site contact reports via photo or video call | Username and password visible, readable |
| AVD sign-in works | Site contact signs in using lock screen credentials | Windows App launches, AVD desktop appears, Edge opens with bookmarks |
| Conditional Access policies fire correctly | Entra sign-in logs | All 6 CA policies show `Success`, `Not applied`, or `Not enforced` as expected |
| Compliance reports Compliant | Intune device record | Compliance = `Compliant` within 30 min |
| Hourly PR runs successfully | Intune → Devices → Reports → Endpoint analytics → Proactive remediations | Detection runs, no remediation triggered after initial setup |
| Sign-out triggers profile cleanup | Local C:\Users\ folder | No persistent profile remains after sign-out + reboot |

8. **Document each pilot device's outcome.** One row per device in `./evidence/pilot-results.md` with: serial, site, ship date, activation date, OOBE elapsed time, any issues, sign-off.

9. **Triage and remediate any pilot issues** before declaring WP-3.2 complete. Common issues to anticipate:
   - WiFi auth failures (loop back to WP-3.1).
   - Shell Launcher XML errors (fix per WP-1.7 Profile 5; redeploy).
   - PR script failures (fix the script, redeploy as a new PR version).
   - CA policy unexpected blocks (review sign-in logs, adjust if needed — likely report-only first).
   - Lock screen image not rendering (PersonalizationCSP path issue, fix and redeploy).

**Validation.**
- All 5-10 pilot devices reach `Healthy + Compliant + signed in to AVD successfully`.
- A standardised acceptance test (the table in step 7) passes for every device.
- The end-to-end deployment time per device is documented and within 40 minutes for production planning purposes.

**Gotchas.**
- Per-device Function key management is the single biggest scale problem. Option B (bake the key per device) works for pilot but does not scale to 517 devices. Migrate to Option A or move the Function key to a Key Vault secret per device that the PR script fetches via Workload Identity at runtime, **before** Phase 4 rollout.
- Lock screen credential photo evidence — confirm with APM whether site contacts photographing the kiosk lock screen is acceptable. If not, use video call screen share.
- ESP (Enrolment Status Page) timeouts are the most common Autopilot failure. Default is 60 minutes; on slow site WiFi this can lapse. Tune ESP timeout to 120 minutes for the kiosk profile if any pilot device hits this.
- Multiple devices powering on simultaneously can throttle the Intune backend; stagger by 5-10 minutes if a site activates multiple devices at once.

**References.** DD V0.3 §5.1.1.5 End-to-End Device Experience; DD §9 Implementation Sequence Phase 3.

---

### WP-3.3 — Layer 1-4 enforcement validation (2.0 d)

**Status:** **PARTIALLY BLOCKED** by Phase 2B (see per-layer notes below). [ ] Layers 1-2 preliminary evidence captured in report-only against any AVD endpoint. [ ] Layers 3-4 full validation against provisioned pilot devices and a live session host (gated on Phase 2B unblock). [ ] Validation complete. Note: CA enforcement flip required to convert preliminary report-only evidence into final pass evidence — coordinate cyber re-approval before running the enforcement tests.

**Per-layer Phase 2B dependency (new in v0.3 per F-40):**

- **Layer 1 (CA-APM-Kiosk-DeviceBound device filter):** can be partially validated **now** in report-only mode against any AVD endpoint, using a temporarily-created kiosk user account under the F3 licensing template. Capture the policy verdict from the sign-in log; treat as preliminary evidence only. Final pass evidence requires a Phase 2B-provisioned pilot kiosk and the CA enforcement flip.
- **Layer 2 (CA-APM-Kiosk-BlockNonWindows, CA-APM-Kiosk-BlockWebClient):** same — partial validation in report-only against an iOS / macOS / browser endpoint, using the temporary kiosk user. Preliminary evidence.
- **Layer 3 (Shell Launcher v2):** **requires a provisioned pilot kiosk** (Phase 3, dependent on Phase 2B). Cannot be tested before then. The thin-client device must run the WP-1.7 Profile 5 configuration end-to-end with a real kiosk user logged in.
- **Layer 4 (single-session-per-user RDP property):** **requires a live AVD session host** (Phase 2A WP-2.10 has built the golden image but session host VMs are not deployed until Phase 2B unblocks). Cannot be tested before then.

For Phase 3 sign-off, partial completion of Layers 1-2 (preliminary evidence) is acceptable; full completion of Layers 3-4 is gated on Phase 2B unblock and at least one pilot kiosk reaching the AVD session.

**Purpose.** Prove the four-layer device-bound access design works against real attack scenarios. Produce the evidence pack that supports the RFFR alignment review in Phase 5.

**Prerequisites.**
- WP-3.2 (pilot devices deployed and signed in) for Layers 3-4.
- For Layers 1-2 preliminary tests: a manually-created kiosk user under the F3 licensing template and access to any AVD endpoint (the existing APM staff host pool if available).
- DD §7 Cyber & Security Architecture read in detail (this section now carries the four-layer access design content that previously lived in DD V0.2 Appendix A).

**Procedure.**

Run each test scenario below from a pilot device unless noted otherwise. Capture sign-in log evidence (screenshot or JSON export) for every scenario. Save outputs to `./evidence/layer-1-4-tests/`. For Layers 1-2 preliminary runs (before Phase 2B unblocks), capture into `./evidence/layer-1-4-tests/preliminary/` so the final-pass run does not overwrite the preliminary evidence.

#### Layer 1 — CA-APM-Kiosk-DeviceBound

| Test | Setup | Action | Expected result | Sign-in log search |
|---|---|---|---|---|
| L1-T1 | Pilot kiosk device, kiosk user | Sign in to AVD via Windows App | Allowed | CA-APM-Kiosk-DeviceBound `Success` |
| L1-T2 | Personal Windows laptop (not Autopilot-enrolled) | Use the same kiosk user credentials to sign in to AVD | Blocked at sign-in with `Conditional Access policy ... required` | CA-APM-Kiosk-DeviceBound `Failure - Block access` |
| L1-T3 | APM corporate laptop (enrolled under a different Autopilot profile, e.g. corporate SOE) | Same kiosk user creds, sign in to AVD | Blocked | Filter for `enrollmentProfileName -eq "APM-Kiosk-SelfDeploying"` fails |
| L1-T4 | Break-glass admin account | Sign in to anything | Allowed (policy not evaluated for break-glass) | Policy shows `Not applied` |

#### Layer 2a — CA-APM-Kiosk-BlockNonWindows

| Test | Setup | Action | Expected result |
|---|---|---|---|
| L2a-T1 | iPad or iPhone with Microsoft Authenticator + Windows App | Kiosk user sign-in | Blocked |
| L2a-T2 | Android device with Windows App | Kiosk user sign-in | Blocked |
| L2a-T3 | macOS with Windows App | Kiosk user sign-in | Blocked |
| L2a-T4 | Windows pilot kiosk | Kiosk user sign-in | Allowed |

#### Layer 2b — CA-APM-Kiosk-BlockWebClient

| Test | Setup | Action | Expected result |
|---|---|---|---|
| L2b-T1 | Any browser navigates to `client.wvd.microsoft.com` | Kiosk user sign-in | Blocked |
| L2b-T2 | Pilot kiosk uses native Windows App | Kiosk user sign-in | Allowed |

#### Layer 3 — Shell Launcher v2 per-user shell restriction

| Test | Setup | Action | Expected result |
|---|---|---|---|
| L3-T1 | Pilot kiosk device, the assigned kiosk UPN | Sign in | Windows App launches as the shell |
| L3-T2 | Pilot kiosk device, a different Entra user (e.g. break-glass admin, with CA exclusion to allow sign-in) | Sign in | Session terminated immediately by `logoff.exe` as shell |
| L3-T3 | Pilot kiosk device, a different Entra user with admin privileges | Sign in | Same result — terminated. Confirms even an admin can't get a useful session on the kiosk hardware |

#### Layer 4 — Single-session enforcement

| Test | Setup | Action | Expected result |
|---|---|---|---|
| L4-T1 | Pilot kiosk user signed in to device A | Same user signs in on device B | Device B sign-in refused with "Already signed in elsewhere" message |
| L4-T2 | After L4-T1, sign out of device A | Device B sign-in retry | Sign-in now succeeds |
| L4-T3 | Same user signed in to device A, network connection lost on device A (simulate by disabling WiFi) | Wait 5 minutes, then sign in on device B | Device B sign-in eventually succeeds after AVD orphan-session cleanup (~5-10 minutes) |

#### Attack scenarios (Attack Scenarios and Mitigations)

| Attack | Scenario | Expected mitigation |
|---|---|---|
| AS-1 | Adversary obtains kiosk credentials from a discarded lock-screen photo | Attempts to sign in from personal laptop | Layer 1 (DeviceBound) blocks |
| AS-2 | Adversary obtains kiosk credentials, attempts iOS Windows App | Mobile sign-in | Layer 2a (BlockNonWindows) blocks |
| AS-3 | Adversary opens AVD web client with kiosk credentials | Browser sign-in | Layer 2b (BlockWebClient) blocks |
| AS-4 | Adversary physically replaces kiosk hardware with a similar device pre-enrolled to APM under a different profile | Local sign-in | Layer 1 device filter fails — different Autopilot profile name |
| AS-5 | Adversary modifies the lock-screen PNG to display fabricated credentials | Site contact sees wrong password and tells job seeker | PR remediation rewrites the lock screen within 60 minutes; site contact reports anomaly; investigate via Intune |
| AS-6 | Adversary signs in as their own Entra account on a kiosk device they have physical access to | Local sign-in | Layer 3 (Shell Launcher) — session terminated by logoff.exe |
| AS-7 | Adversary uses two stolen kiosk credentials simultaneously on two devices | Two parallel sign-ins | Layer 4 — second sign-in refused |
| AS-8 | Adversary intercepts the Credential Proxy traffic (network MITM) | Modifies the returned password | PR detection SHA256 hash mismatch detected; PR remediation re-pulls. Note: Zscaler SSL inspection bypass for `*.azurewebsites.net` would have to be misconfigured for this to even be possible |

#### Break-glass procedure validation

Per DD §7 — break-glass account scenarios:

| Test | Setup | Action | Expected result |
|---|---|---|---|
| BG-T1 | All five CA policies enforcing | Break-glass admin signs in to Entra admin centre | Allowed — break-glass excluded from all five policies |
| BG-T2 | Site reports kiosk user account locked | Admin temporarily adds the kiosk UPN to `SG-APM-Kiosk-CA-Exclusion`, signs in for remediation from a non-kiosk device | Allowed; documented in incident system |
| BG-T3 | After remediation, admin removes the UPN from `SG-APM-Kiosk-CA-Exclusion` | Subsequent sign-in from non-kiosk device | Blocked (CA-APM-Kiosk-DeviceBound resumes enforcement) |

**Procedure summary.** Execute each test in sequence. For each:
1. Document the precondition (which devices, which user, which CA state).
2. Run the action.
3. Capture the outcome — sign-in log JSON export plus a screenshot of the user-facing result.
4. Mark pass/fail.

Build the evidence pack:

```bash
mkdir -p ./evidence/layer-1-4-tests
# For each test, save:
# - precondition.md (what was set up)
# - action.md (what was done)
# - signin-log.json (the Entra ID sign-in log entry)
# - screenshot.png (the user-facing result)
# - result.md (pass/fail with timestamp)
```

**Validation.**
- Every scenario in the tables above either passes or has a documented variance with APM acceptance.
- The evidence pack is complete and timestamped.
- Any failed scenario has a remediation ticket logged before Phase 3 sign-off.

**Gotchas.**
- L2a-T1 to T3 require actual non-Windows test devices. If APM doesn't have them on hand, borrow from your own kit or a colleague's; do not skip the test on the basis of equipment unavailability.
- Sign-in log entries can take 5-15 minutes to appear in the Entra portal. If a test appears to have unexpected results, wait and refresh before concluding.
- AS-5 (lock screen tampering) is a destructive test; coordinate with the site contact and use a device that's not in active use.

**References.** DD V0.3 §7 Conditional Access Policies; DD §7 Break-Glass Procedure. The attack scenario matrix above is the authoritative version for this build (the DD V0.2 Appendix A version has been removed in V0.3).

---

### WP-3.4 — Penetration testing coordination (1.5 d)

**Status:** **BLOCKED** (requires pilot devices). Scope and engagement letter drafting can proceed. [ ] Scope drafted. [ ] Engagement letter signed. [ ] Pen test executed. [ ] Findings remediated.

**Purpose.** Third-party penetration test of the thin client and the AVD image. Coordination, scope definition, remediation cycle. The actual testing is performed by a third party — the project team's role is the engagement, the documentation pack, and remediation tracking.

**Prerequisites.**
- WP-3.3 (Layer 1-4 validation passed — pen test is the independent check).
- APM has engaged a penetration testing vendor (chase via APM lead if not in motion).

**Procedure.**

1. Define the pen test scope. Save to `./outputs/pentest-scope.md`:

```markdown
# APM JobSeeker Kiosk — Penetration Test Scope

## In scope
- Thin client hardware (Dell, model TBC) with the production golden image
- The Autopilot self-deploying provisioning flow on a virgin device
- Conditional Access policies — all five (`CA-APM-Kiosk-DeviceBound`, `CA-APM-Kiosk-BlockNonWindows`, `CA-APM-Kiosk-BlockWebClient`, `CA-APM-Kiosk-RequireCompliantDevice`, `CA-APM-Kiosk-BlockExchangeOnline`, `CA-APM-Kiosk-BlockTeams`)
- Shell Launcher v2 per-user shell restriction (Layer 3)
- AVD session host golden image
- Credential Proxy Function App (func-apm-cred-proxy)
- The Hybrid Runbook Worker security posture
- The lock screen credential disclosure pattern — is it exploitable?
- Privilege escalation from a kiosk session
- Lateral movement from a compromised session host
- Data exfiltration paths (USB, clipboard, file upload via Edge)

## Out of scope
- APM corporate network beyond the kiosk-specific paths
- Microsoft Azure or AVD platform itself (Microsoft's responsibility)
- Microsoft Entra ID identity service (Microsoft's responsibility)
- Physical security beyond what's testable in scope (e.g. crowbars off; logical access in scope)

## Rules of engagement
- Test windows: outside business hours where possible; coordinate with APM site contact
- Pilot site only: test from one of the 2-3 pilot sites, not the broader fleet
- Implementer on standby for any critical findings (red-line breach)
- Findings classified Critical/High/Medium/Low per CVSS 4.0
- Critical and High findings: 7-day remediation SLA; Medium 30 days; Low at discretion
```

2. Provide the documentation pack to the pen test team:
   - DD V0.3 PDF
   - This implementation plan (the relevant phases)
   - Architecture diagrams (logical and deployment)
   - The Layer 1-4 evidence pack from WP-3.3
   - A pilot device serial that's reserved for testing (not in user-facing service)
   - Test kiosk user credentials with a known disposable password
   - The CA exclusion mechanism if needed (`SG-APM-Kiosk-CA-Exclusion`) so the testers can run scenarios that bypass the device filter

3. Schedule the test window with the pen test vendor. Typical 5-10 working days for a kiosk scope of this size.

4. Be on call during the test window. Critical findings (e.g. successful credential exfiltration, successful privilege escalation) trigger immediate engagement.

5. On receipt of the report, triage each finding into one of:
   - **Accept the residual risk** with APM sign-off (rare; document)
   - **Remediate in current sprint** (Critical/High)
   - **Remediate in next sprint** (Medium)
   - **Backlog** (Low)

6. For each remediation, raise a defect against the implementation plan and the DD. Re-test after fix. Maintain `./evidence/pentest-findings.md` with the disposition of every finding.

**Validation.**
- Pen test scope document signed by APM, the test vendor, and the project team.
- Pen test complete; report received.
- Every Critical and High finding has a closed remediation ticket with re-test evidence.
- Medium and Low findings have a documented disposition.

**Gotchas.**
- Pen test scope should be explicit on the kiosk and the Credential Proxy. If the vendor goes deep on the AVD platform itself, you're paying for testing Microsoft's product, not APM's deployment.
- Coordinate with APM SOC if they have one — pen testing will generate sign-in failures and may trigger alerts. Pre-notify to avoid burning out the SOC.
- A critical finding before Phase 4 rollout is a Phase 4 blocker, not an inconvenience. Build remediation time into the schedule rather than into "we'll fix it later".

**References.** DD V0.3 §9 Implementation Sequence — Penetration Testing.

---

### WP-3.5 — National rollout escalation support framework (3.0 d)

**Status:** APPROVED — **preparation only** (documentation and process design). Execution gated on Phase 2B and Phase 3 unblocks. [ ] Framework drafted. [ ] Reviewed with APM ops. [ ] Activated for rollout.

**Purpose.** Set up the monitoring, escalation, and on-call infrastructure that supports the Phase 4 national rollout. This WP is preparation; Phase 4 WP-4.1 is the reactive support load itself.

**Prerequisites.**
- WP-3.2 (pilot deployment patterns understood).
- WP-3.3 and WP-3.4 (security posture validated).

**Procedure.**

1. **Define the escalation matrix.** Save to `./outputs/escalation-matrix.md`:

```markdown
# APM JobSeeker Kiosk — Rollout Escalation Matrix

## Severity definitions
- **P1 (Critical)** — Multiple devices failing to provision OR Credential Proxy
  down OR security incident in progress. Response: immediate, page the project team.
- **P2 (High)** — One device failing OOBE after retry OR one site fully blocked.
  Response: 4 business hours, implementer email.
- **P3 (Medium)** — Single-device intermittent issue. Response: 1 business day.
- **P4 (Low)** — Cosmetic or documentation. Response: weekly batch.

## Escalation flow
1. Site contact identifies issue → reports to APM site IT
2. APM site IT triages → if hardware: the device-prep partner; if software: the project team
3. Implementer first-line: review Intune device record, Azure AD sign-in logs,
   Function App logs, runbook job logs
4. Implementer second-line (you): re-image device or invoke runbook remediation
5. the device-prep partner: hardware replacement under warranty

## Contact list
- Implementer first-line: {your name}, {email}, {phone}
- Implementer second-line: {alternate}
- APM site IT lead: TBC from APM
- the device-prep partner ops: TBC from APM
- APM SOC: TBC (for security incidents)
```

2. **Set up the rollout monitoring dashboard** in Azure or Power BI. Required visualisations:

   a. Device provisioning health — count of devices in each Autopilot/Intune state per site per day:

   ```kusto
   IntuneDevices
   | where DeviceCategoryName == "Kiosk"
   | summarize count() by EnrollmentState, Site = ifempty(tostring(DeviceTags.Site), "Unknown"), bin(TimeGenerated, 1d)
   ```

   b. Function App reliability — request count, error rate, latency:

   ```kusto
   AppRequests
   | where AppRoleName == "func-apm-cred-proxy"
   | summarize total = count(), errors = countif(Success == false), avgDuration = avg(DurationMs)
       by bin(TimeGenerated, 1h)
   ```

   c. Rotation runbook outcomes — success vs failure per run:

   ```kusto
   AzureDiagnostics
   | where ResourceProvider == "MICROSOFT.AUTOMATION" and RunbookName_s == "Rotate-KioskUserPasswords"
   | summarize count() by ResultType, bin(TimeGenerated, 1d)
   ```

   d. Key Vault access — successful and failed reads:

   ```kusto
   AzureDiagnostics
   | where ResourceProvider == "MICROSOFT.KEYVAULT" and OperationName == "SecretGet"
   | summarize count() by ResultType, identity_claim_appid_g, bin(TimeGenerated, 1h)
   ```

   e. PR detection/remediation outcomes — count of devices with detection mismatch over time:

   ```kusto
   IntuneProactiveRemediations
   | where ScriptName == "PR-APM-Kiosk-CredentialDisplay"
   | summarize count() by DetectionResult, RemediationResult, bin(TimeGenerated, 1d)
   ```

   Save the dashboard at a known URL; share with APM ops.

3. **Build the common issue runbook.** Save to `./outputs/runbook-common-issues.md`. Pre-populate with the issues you anticipate from the pilot deployment:

```markdown
# APM JobSeeker Kiosk — Common Issue Runbook

## Device stuck at "Setting up your device" during OOBE for > 30 min
1. Check WiFi connectivity from the site contact's phone
2. If WiFi OK, check Intune → Devices → device → Diagnostics → request diagnostics
3. If hardware hash never landed in Autopilot, the device-prep partner re-export
4. Last resort: factory reset and re-run via ethernet

## Lock screen shows the wrong password
1. Check Key Vault secret latest version (compare with PR detection script hash)
2. Force PR run via Intune
3. If still wrong: invoke single-user rotation runbook
4. Document in evidence/incidents.md

## AVD sign-in shows "Conditional Access policy required" error
1. Confirm device is in SG-APM-Kiosk-Devices
2. Confirm device compliance state is Compliant
3. Confirm Autopilot profile name matches CA filter exactly
4. Sign-in logs at Entra → Sign-ins → filter by UPN

## Site reports all devices simultaneously offline
1. Check Function App health (App Insights)
2. Check Key Vault availability
3. Check AVD service health (status.azure.com)
4. Check site WiFi/network with APM site IT
5. If isolated to one site: site network issue
6. If multiple sites: cloud-side issue

## Device fails compliance check
1. Intune → Devices → device → Compliance → drill into failing setting
2. Common: BitLocker not yet enrolled (wait 30 min and retry)
3. Common: TPM attestation pending (reboot)
```

4. **Establish on-call coverage** for the rollout window. The Phase 4 national rollout spans multiple weeks. Confirm with APM whether on-call coverage is required outside the project team's standard hours.

5. **Test the framework end-to-end** with the pilot devices. Simulate a P1 by deliberately blocking one device's Function App access — confirm the monitoring dashboard flags it and the escalation path responds in under 30 minutes.

**Validation.**
- Escalation matrix signed off by APM and the project team.
- Monitoring dashboard live, accessible to APM ops, populated with pilot data.
- Common issue runbook complete with at least 5 anticipated issues.
- A simulated P1 escalation completes the loop within target SLA.

**Gotchas.**
- The 3 days for this WP is preparation, not the support load. Phase 4 WP-4.1's 4 days is the actual support during national rollout, which is reactive.
- The KQL queries above assume the diagnostic settings from WP-2.3 (Key Vault) and WP-2.4 (App Insights) are firing into Log Analytics. Confirm before Phase 4.
- **Phase 2A vs Phase 2B data sources (new in v0.3 per F-38).** Tile 1 (device provisioning, sourced from Intune device inventory) is live from Phase 1 and has data immediately. Tiles 2 (Function App availability), 3 (rotation runbook outcomes), 4 (Key Vault access), and 5 (PR detection mismatches) all depend on Phase 2B-deployed resources (the Function App, Automation Account, Key Vault, and PR script-against-real-devices). Build all five tiles now using the KQL above; expect tiles 2-5 to show "no data" until Phase 2B unblocks and those resources land. Do not conclude diagnostic settings are misconfigured if tiles 2-5 are empty before Phase 2B; that is the expected state. Acceptance gate: [ ] Dashboard JSON drafted in this WP. [ ] All five tiles populated with live data after Phase 2B unblocks.
- Common issue runbooks ossify quickly. Plan a quarterly refresh in Phase 5.

**References.** DD V0.3 §8 Monitoring, Logging, Reporting and Alerting; DD §9 Implementation Sequence — Phase 4 + 5.

---

### Phase 3 acceptance checklist

Before declaring Phase 3 complete and Phase 4 ready to ramp:

- [ ] Site readiness checklist applied to the 2-3 pilot sites and signed off.
- [ ] 5-10 pilot devices provisioned, signed in to AVD, lock screen displays per-device credentials correctly, end-to-end functioning.
- [ ] Pilot results documented per device in `evidence/pilot-results.md`.
- [ ] Per-device Function key management approach is locked — Option A (Key Vault-sourced at runtime) is the scaling answer for Phase 4; the Option B baked-key approach is acknowledged as pilot-only.
- [ ] Layer 1-4 enforcement evidence pack complete; every scenario passes or has a documented variance.
- [ ] Break-glass procedure validated.
- [ ] Pen test scope signed, test executed, report received, all Critical and High findings closed.
- [ ] Escalation matrix and monitoring dashboard live.
- [ ] Common issue runbook in place; at least one simulated escalation completed.
- [ ] Pilot site contacts trained on the day-1 device experience.

Sign off Phase 3 acceptance in `./evidence/phase-3-signoff.md`.

---

## Phase 4 — National Rollout

**Effort:** 4 days reactive support across the rollout window (see infrastructure review F-05 for the budget concern; this estimate is likely understated by ~3x).
**Phase status:** BLOCKED — cannot start until Phase 3 unblocks. No preparatory work is required.
**Phase checkbox:** [ ] Phase 3 complete. [ ] National rollout commenced. [ ] All ~517 devices deployed. [ ] Phase 4 complete.
**Outcome:** All ~517 devices deployed across all APM sites, monitored through the dashboard from WP-3.5, with escalation handled and remediated. Single-resource is in a reactive support role, not direct deployment — APM and the device-prep partner lead the physical activity.

### Phase 4 character

Phase 4 differs from Phases 1-3 in that it's *reactive*, not *constructive*. The build is done; the work is now monitoring, escalation handling, and per-site issue resolution. The 4 days of resource time is spread across the rollout calendar — typically 4-6 weeks elapsed — at a pattern of roughly 30-60 minutes per day plus occasional half-day spikes for genuine incidents.

The actual rollout pace is APM's call. Common patterns:
- **Wave** — five to ten sites per week, batched
- **Daily** — one to two sites per day across the rollout window
- **Big bang** — all sites in a single weekend (not recommended; the reactive support load spikes)

This playbook assumes the **wave** pattern. Adjust the support shape if APM picks differently.

### Execution ordering

Phase 4 has one work package; the daily / weekly cadence within it follows the rhythm below.

| Order | Activity | Cadence |
|---|---|---|
| 1 | Pre-wave site readiness review | Friday of week before each wave |
| 2 | Device prep coordination with the device-prep partner | Monday of wave week |
| 3 | Per-wave deployment validation | Daily through the wave week |
| 4 | Incident response | Reactive (within SLA from WP-3.5 escalation matrix) |
| 5 | Wave retrospective + design feedback loop | Friday of each wave week |

---

### WP-4.1 — Rollout monitoring and escalation support (4.0 d across 4-6 weeks elapsed)

**Status:** **BLOCKED** (Phase 4 cannot start until Phase 3 unblocks). [ ] Phase 3 complete. [ ] Rollout commenced. [ ] Complete.

**Purpose.** Operate the reactive support function during the national rollout. Triage and resolve issues that surface at scale. Feed structural defects back to the design.

**Prerequisites.**
- All Phase 3 work packages signed off.
- Phase 3 acceptance checklist complete (especially the Option A per-device Function key approach now in place).
- WP-3.5 escalation matrix, monitoring dashboard, and common issue runbook live and exercised.

**Procedure.**

#### Per-wave loop (run for each wave through the rollout window)

1. **Pre-wave site readiness review (Friday of week W-1).**

   For each site in the upcoming wave:
   - Review the site readiness checklist (WP-3.1 template) — confirm signed off by APM site IT.
   - Confirm device counts and serial ranges allocated for this wave.
   - Confirm the device-prep partner has the hash CSV ready for the wave's batch.
   - Confirm site contact list is current.

   Block any site that hasn't completed the readiness checklist; defer to a later wave. Do not let unfit sites slip into the deployment queue — every blocked device returns as an incident later, multiplying the support load.

2. **Device prep coordination (Monday of wave week W).**

   a. Receive the hash CSV from the device-prep partner for the wave's batch.
   b. Import into Autopilot via the bulk import script (Phase 3 WP-3.2 step 1):

```powershell
# Bulk Autopilot import for a wave
$csv = Import-Csv ./inputs/wave-${WAVE_NUMBER}-hashes.csv
foreach ($row in $csv) {
    New-MgDeviceManagementWindowsAutopilotDeviceIdentity `
        -SerialNumber $row.'Device Serial Number' `
        -ProductKey $row.'Windows Product ID' `
        -HardwareIdentifier $row.'Hardware Hash' `
        -GroupTag "KIOSK" `
        -AssignedUser ""
}
```

   c. Trigger the Kiosk User Account Creation runbook for each device in the wave:

```bash
WAVE_NUMBER=3
F3_SKU=$(az rest --method get --url "https://graph.microsoft.com/v1.0/subscribedSkus" \
    --query "value[?skuPartNumber=='M365_F3'].skuId" -o tsv)

for SERIAL in $(awk -F',' 'NR>1 {print $1}' ./inputs/wave-${WAVE_NUMBER}-hashes.csv); do
    az automation runbook start -g $RG \
        --automation-account-name aa-apm-kiosk \
        --name Create-KioskUser \
        --parameters "{\"SerialNumber\":\"$SERIAL\",\"F3SkuId\":\"$F3_SKU\"}" \
        --run-on hwg-apm-kiosk
    sleep 5
done
```

   d. Generate per-device Function keys for the wave. By Phase 4, the Option A approach is in place — Function keys are stored in Key Vault and read by the PR script at runtime. The Function App per-device key is still generated and stored, but the kiosk-side delivery is via Key Vault, not baked-in.

```bash
for SERIAL in $(awk -F',' 'NR>1 {print $1}' ./inputs/wave-${WAVE_NUMBER}-hashes.csv); do
    KEY=$(az functionapp keys set -g $RG -n func-apm-cred-proxy \
        --key-name "kiosk-$SERIAL" --key-type functionKeys --query value -o tsv)
    # Store in Key Vault for PR-runtime fetch (Option A scaling path)
    az keyvault secret set --vault-name kv-apm-kiosk \
        --name "funckey-$(echo $SERIAL | tr '[:upper:]' '[:lower:]')" \
        --value "$KEY" --content-type "text/plain"
done
```

3. **Daily validation through wave week (Tue-Fri).**

   Each morning, review the monitoring dashboard (from WP-3.5):

   - Devices provisioned overnight — count vs expected.
   - Provisioning failures — drill into Intune device record for any device stuck in ESP or Autopilot.
   - Function App health — error rate above 1%, latency above 2 seconds: investigate.
   - PR detection / remediation outcomes — any device with persistent detection mismatch.
   - Compliance failures — any device dropping below Compliant.
   - Sign-in failures — Entra sign-in log filter on kiosk UPN pattern.

   Capture issues in a wave defect log (`./evidence/wave-${WAVE_NUMBER}-defects.md`). Triage per the escalation matrix.

4. **Common-issue handling during a wave.** Use the runbook from WP-3.5 (`./outputs/runbook-common-issues.md`). Document any new issue patterns and feed back into the runbook for the next wave.

5. **Wave retrospective (Friday of wave week W).**

   Review with APM:
   - Devices deployed vs target.
   - Issues encountered and resolved (count by category).
   - Issues escalated to the next wave.
   - Patterns to feed back into the implementation plan or the DD (e.g. "all devices at site X failed first-boot WiFi auth — captive portal needs work").
   - Approval to proceed to wave W+1.

   Save the retrospective in `./evidence/wave-${WAVE_NUMBER}-retro.md`.

#### Across-the-rollout patterns

6. **Trend analysis.** Every two waves, look at the dashboard data over the full rollout window. Watch for:

   - **Systemic failure pattern.** If the same failure mode appears in three or more devices across two waves, it's a design defect, not random failure. Raise to the implementation plan for fix.
   - **Site failure pattern.** If a site contributes more than 5% of all defects, the site has an environmental issue (network, power, site contact engagement) — pause shipments to that site until resolved.
   - **Cumulative compliance posture.** Devices that drift out of compliance over time (e.g. BitLocker turning off) indicate a configuration profile issue. Investigate and re-deploy the offending profile.

7. **Capacity tracking.** As the fleet grows, watch:

   - Function App scaling — Premium plan should auto-scale, but track concurrent requests.
   - Automation Account job runtime — the quarterly rotation runbook's execution time grows with fleet size; budget the upper limit.
   - Key Vault transaction limits — Azure Key Vault has per-vault transaction limits; at 517 devices with hourly PR calls, the load is well within limits but track to be sure.

8. **Per-site go-live confirmation.** When every device at a site is operational, send the APM site contact a brief "site go-live" confirmation including: device serials live, sign-in tested, monitoring dashboard URL, escalation contact for ongoing issues. Save signed confirmations in `./evidence/site-go-live/`.

9. **Rollout completion review.** When all ~517 devices are live and stable for at least one full week:

   - Final fleet count vs target.
   - Final defect log; categorise by root cause.
   - Carry-forward items for Phase 5 (operational handover).
   - APM sign-off on rollout completion.

   Save to `./evidence/phase-4-completion-review.md`.

**Validation.**
- All planned sites have at least one device live.
- All ~517 devices show `Healthy` and `Compliant` in Intune for at least one week running.
- Function App availability over the rollout window is ≥ 99.9%.
- No outstanding Critical defects; High defects either closed or carried forward with APM acceptance.
- Wave retrospectives complete; structural defects fed back to the DD where applicable.

**Gotchas.**
- Reactive support is hard to schedule. The 4 days of effort assumes a healthy rollout. A bad wave can consume a full day in itself; budget for headroom or push back on wave size if support is overwhelmed.
- The Option A per-device Function key approach is dependent on Phase 3's locked-in solution. If Phase 3 closed with Option B (baked keys), Phase 4 absorbs the migration work — which is **not** in this WP's 4-day estimate. If that's the case, add 2-3 days for the migration script + per-device redeploy.
- the device-prep partner batch hash CSV format can drift if their process changes or they bring in a new operator. Validate the first wave's CSV against the import script; if columns don't match, the import silently skips rows. Test with one device first per wave.
- Site contacts churn. The named contact from WP-3.1 may have left, changed role, or be on leave during the wave week. Confirm contact viability one week ahead.
- ESP timeouts are the most common per-device failure. If a device sits at "Setting up your device" for over 60 minutes, the ESP profile timed out. Document the recovery: factory reset, re-import via the device-prep partner, retry — costs 30 minutes per affected device.

**References.** DD V0.3 §9 Implementation Sequence — Phase 4 National Rollout.

---

### Phase 4 acceptance checklist

Before declaring Phase 4 complete and moving to Phase 5 operational handover:

- [ ] All ~517 devices imported into Autopilot and provisioned.
- [ ] All sites in the APM rollout list have at least one live device.
- [ ] Defect log shows zero outstanding Critical and no unaccepted High defects.
- [ ] Per-site go-live confirmations signed for every site.
- [ ] Function App availability over the rollout window meets ≥ 99.9%.
- [ ] Common issue runbook updated with all patterns seen during the rollout.
- [ ] Wave retrospectives complete; structural design feedback captured.
- [ ] Cumulative compliance posture stable — no widespread drift detected at the end of the rollout window.
- [ ] APM sign-off on rollout completion.

Sign off Phase 4 acceptance in `./evidence/phase-4-signoff.md`.

---

## Phase 5 — Operational Handover

**Effort:** ~8.0 days single resource.
**Phase status:** BLOCKED — cannot start until Phase 2-4 are operational. Documentation drafting (DR plan, runbooks, RFFR control map) can proceed now to compress the eventual handover window.
**Phase checkbox:** [ ] Phase 4 complete. [ ] Phase 5 documentation drafted in advance. [ ] Handover signed off by APM ops.
**Outcome:** Documented DR posture; monitoring and alerting live; operational runbooks signed; RFFR / ASD ISM evidence pack delivered; knowledge transfer complete and APM operations team owning day-to-day running.

### Execution ordering

Phase 5 is mostly documentation and process work. Several work packages can run in parallel.

| Order | Work package | Dependencies |
|---|---|---|
| 1 (parallel-safe) | WP-5.1 DR plan | None — can start as soon as Phase 4 begins |
| 2 (parallel-safe) | WP-5.2 Monitoring | WP-2.3 Log Analytics workspace already exists |
| 3 (parallel-safe) | WP-5.3 Patching lifecycle | None |
| 4 | WP-5.4 Operational runbooks | After WP-5.1, 5.2, 5.3 (assembles their content) |
| 5 | WP-5.5 RFFR evidence pack | After WP-5.1 through 5.4 (cites them) |
| 6 | WP-5.6 Handover + knowledge transfer | Final — needs everything else in place |

---

### WP-5.1 — DR plan, image rollback, host pool failover (1.0 d)

**Status:** **BLOCKED** (Phase 5 cannot start until Phase 2-4 are operational). Plan can be drafted now if useful. [ ] Drafted. [ ] Reviewed. [ ] Activated.

**Purpose.** Document the disaster recovery posture and the operational procedures for the seven failure modes the architecture is exposed to (F1–F7, defined below): golden image regression, host pool unavailability, regional Azure failure, Credential Proxy outage, Key Vault outage, site network failure, and per-device hardware failure.

**Prerequisites.**
- Phase 4 underway (real operational signal informing the document).

**Procedure.**

1. Document the DR posture. Save to `./outputs/dr-plan.md`:

```markdown
# APM JobSeeker Kiosk — Disaster Recovery Plan

## Service tier classification
- Tier: 3 (important but not mission-critical) per DD §6
- RTO (Recovery Time Objective): 4 business hours for the AVD service
- RPO (Recovery Point Objective): N/A — the architecture is stateless;
  no job seeker data persists beyond the active session

## Stateless architecture summary
The kiosk solution has no persistent customer data:
- Devices run only the Windows App client (thin)
- AVD session hosts are reimaged nightly from the golden image
- User profiles are deleted on every restart
- All inflight job seeker data lives only in the AVD session (RAM and
  ephemeral disk)
- The Key Vault is the only stateful artefact and it's protected by
  soft-delete + purge protection (DD §5.1.1.3)

## Failure modes and responses

### F1. Golden image regression (bad image breaks new sessions)
Recovery: Roll back to the previous image version in the Azure Compute
Gallery; reset Nerdio's default image; trigger reimage of host pool.
RTO: 30 minutes from detection.
Procedure: see ./outputs/runbook-image-rollback.md (WP-5.4)

### F2. Host pool unavailable (all session hosts unhealthy)
Recovery: Nerdio auto-scaling normally regenerates hosts; manual override
available via Nerdio admin. Worst case: redeploy host pool from IaC.
Any VM-creation path (Nerdio or IaC) must satisfy the APM management-group
policies: mandatory tags (enableupdate, update-stage, backup with a
policy-allowed value) and encryption-at-host — confirm the IaC template and
NME default VM tags carry these before relying on this recovery path.
RTO: 2 hours from detection.
Procedure: see ./outputs/runbook-hostpool-recovery.md (WP-5.4)

### F3. Azure region failure (australiaeast unavailable)
This is the longest-recovery scenario. The design does not include cross-
region replication for the POC budget. Recovery is "wait for Microsoft"
plus a documented escalation to APM IT for status communication to sites.
RTO: dependent on Microsoft regional SLA + APM communications.
Procedure: see ./outputs/runbook-region-failure.md (WP-5.4)

### F4. Credential Proxy down (devices can't fetch new password)
Existing devices continue working with their cached credential until next
rotation. New device provisioning is blocked.
Recovery: Function App restart; if persistent, escalate per WP-5.2 alert.
RTO: 1 hour from detection.

### F5. Key Vault down
Same impact as F4. Recovery: Microsoft service health. Devices continue
on cached credentials.
RTO: dependent on Microsoft SLA (Key Vault is 99.9% SLA).

### F6. Site network failure
Site contact reports; APM site IT engages; kiosk devices unreachable
from the cloud during outage. Recovery is site-side, not cloud-side.

### F7. Per-device hardware failure
the device-prep partner replaces hardware; new hash imported via the Phase 4
wave-batch process; user account re-created via Create-KioskUser
runbook for the new serial; old device serial decommissioned.
RTO: device-by-device; 2-3 business days per replacement.

## Failover and rollback decision tree
- Symptom severity per the WP-3.5 escalation matrix
- Detection via the monitoring dashboard (WP-5.2)
- Response per the failure mode above
- Authority to declare an incident: APM ops + the project team (joint)
```

2. Cross-link the failure modes to the operational runbooks (WP-5.4 builds these).

**Validation.**
- DR plan document exists and is signed by APM ops + the project team.
- The seven failure modes (F1-F7) each have a documented recovery path with RTO.

**Gotchas.**
- The 4-hour RTO for AVD service availability is consistent with Tier 3 classification per DD §6. If APM later wants this tightened (Tier 2 or higher), cross-region replication of the host pool is the architectural change required — significant scope and cost increase.
- The DR plan must explicitly acknowledge no cross-region capacity in the POC budget. Don't hand over a DR plan that promises something the architecture can't deliver.

**References.** DD V0.3 §6 Service Availability and Disaster Recovery; DD §6 Business Service Tiering.

---

### WP-5.2 — Monitoring, logging, alerting (1.5 d)

**Status:** **BLOCKED** (Phase 5 — depends on operational infra). [ ] Complete.

**Purpose.** Operationalise the Log Analytics workspace from WP-2.3 into actionable alerts and dashboards. Until alerts wake someone up, there's no monitoring — only logging.

**Prerequisites.**
- WP-2.3 (Log Analytics workspace `law-apm-kiosk` exists).
- WP-3.5 (monitoring dashboard built; alerts now go on top).

**Procedure.**

1. Confirm diagnostic settings firing on all components. Check each:

```bash
# Should show diag settings for each of these resources
for resource in \
    "kv-apm-kiosk" \
    "aa-apm-kiosk" \
    "func-apm-cred-proxy" \
    "stapmkioskcred"; do
    echo "=== $resource ==="
    RES_ID=$(az resource list --name $resource --query "[0].id" -o tsv)
    az monitor diagnostic-settings list --resource $RES_ID -o table
done
```

If any component lacks diag settings, add them — log retention 30 days minimum, metrics enabled.

2. Create the Action Group for alert delivery:

```bash
az monitor action-group create -g $RG -n ag-apm-kiosk-ops \
    --short-name apm-kiosk \
    --email-receivers "name=ServiceDesk email=servicedesk@apm.com.au" \
                      "name=ImplementerOncall email={oncall@implementer.com}"
```

(APM may have an existing action group / SOC integration. Coordinate.)

3. Create the alert rules. Save each as a JSON template in `./outputs/alerts/` for IaC migration later.

**Alert A1: Function App availability degraded**

```bash
FUNC_ID=$(az functionapp show -g $RG -n func-apm-cred-proxy --query id -o tsv)
AG_ID=$(az monitor action-group show -g $RG -n ag-apm-kiosk-ops --query id -o tsv)

az monitor metrics alert create \
    -g $RG -n alert-funcapp-availability \
    --scopes $FUNC_ID \
    --condition "min Http5xx > 5" \
    --window-size 15m --evaluation-frequency 5m \
    --severity 2 --action $AG_ID \
    --description "Function App returning HTTP 5xx errors — Credential Proxy may be impaired"
```

**Alert A2: Key Vault unauthorised access attempt**

Log Analytics scheduled query alert. Query:

```kusto
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.KEYVAULT" and ResourceId contains "kv-apm-kiosk"
| where ResultType == "Unauthorized" or ResultType == "Forbidden"
| where TimeGenerated > ago(15m)
| project TimeGenerated, identity_claim_appid_g, OperationName, ResultType, ResultDescription
```

Threshold: any results in the last 15 minutes → alert.

```bash
az monitor scheduled-query create -g $RG -n alert-kv-unauthorised \
    --scopes $LAW_ID \
    --condition "count > 0" \
    --condition-query "AzureDiagnostics | where ResourceProvider == 'MICROSOFT.KEYVAULT' | where ResultType == 'Unauthorized' or ResultType == 'Forbidden'" \
    --window-size 15m --evaluation-frequency 5m \
    --severity 1 --action-groups $AG_ID
```

**Alert A3: Rotation runbook failure**

Trigger when the quarterly rotation runbook execution reports a failed job.

```kusto
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.AUTOMATION"
| where RunbookName_s == "Rotate-KioskUserPasswords"
| where ResultType == "Failed"
| where TimeGenerated > ago(1h)
```

**Alert A4: PR detection mismatch on > 10 devices**

```kusto
IntuneProactiveRemediations
| where ScriptName == "PR-APM-Kiosk-CredentialDisplay"
| where DetectionResult == "Issue found" and TimeGenerated > ago(2h)
| summarize uniqueDevices = dcount(DeviceId)
| where uniqueDevices > 10
```

A mismatch on > 10 devices simultaneously is structural, not random — investigate before the remediation cycle rewrites them.

**Alert A5: Compliance posture drop**

```kusto
IntuneDevices
| where DeviceCategoryName == "Kiosk"
| summarize CompliantPct = countif(ComplianceState == "Compliant") * 100.0 / count(), Total = count() by bin(TimeGenerated, 1h)
| where CompliantPct < 95 and Total > 50
```

Compliant percentage dropping below 95% on a fleet of 50+ devices is structural — investigate.

**Alert A6: Sign-in failure spike**

```kusto
SigninLogs
| where UserPrincipalName startswith "kiosk-" and UserPrincipalName endswith "@apm.net.au"
| where ResultType != 0
| summarize Failures = count() by bin(TimeGenerated, 15m)
| where Failures > 20
```

20+ kiosk sign-in failures in 15 minutes is either widespread credential mismatch or an attack.

4. Build the operations workbook. Azure Monitor → Workbooks → New workbook → save as `wb-apm-kiosk-ops`. Pages:
   - **Fleet health** — device counts by state per site
   - **Credential pipeline** — Function App, Key Vault, runbook execution health
   - **Compliance** — current compliance posture, drift over time
   - **Security signals** — failed sign-ins, unauthorised Key Vault attempts
   - **Capacity** — Function App concurrency, runbook runtime trends

Share the workbook link with APM ops.

5. Test each alert:
   - A1: stop the Function App for 5 minutes; confirm alert fires.
   - A2: attempt a Key Vault access from an account without the right role; confirm alert fires.
   - A3-A6: simulate the condition; confirm alert and email delivery.

**Validation.**
- Six alert rules configured and tested.
- Action group delivers email to APM Service Desk + implementer on-call.
- Operations workbook accessible to APM ops with read-only role.

**Gotchas.**
- Alert action groups can be misconfigured to email a mailbox no one watches. Test the delivery; sit with APM Service Desk to confirm the email lands in their queue.
- The 20-failure threshold on A6 is for the steady-state fleet of 517 devices. During the Phase 4 ramp the same threshold would fire too often — temporarily raise it during Phase 4 and tighten on Phase 5 cutover.
- Some alerts (A4, A5) only make sense once the fleet is at scale. They will not trigger during Phase 3 pilot; do not assume they're broken if they're silent before steady state.

**References.** DD V0.3 §8 Monitoring, Logging, Reporting and Alerting; Microsoft Learn — Azure Monitor alerts.

---

### WP-5.3 — Patching lifecycle (0.5 d)

**Status:** **BLOCKED** (Phase 5). Documentation drafting can proceed now. [ ] Complete.

**Purpose.** Document the patching cadence and the change management around it.

**Prerequisites.**
- Phase 2 complete (Nerdio reimaging schedule configured in WP-2.11).

**Procedure.**

1. Document Windows Update for Business (WUfB) configuration for kiosks. Save to `./outputs/patching-lifecycle.md`:

```markdown
# APM JobSeeker Kiosk — Patching Lifecycle

## Two-tier patching model
The kiosk fleet is patched on two cadences:

### Tier A — AVD session host (centrally controlled)
- Patched via nightly reimage from the golden image (WP-2.11)
- The golden image is patched monthly (Patch Tuesday + 1 week soak)
- Golden image versions are immutable; updates are new versions in the
  Azure Compute Gallery
- Validation host pool (separate; recommended but optional) receives the
  new image first; production host pool follows after soak

### Tier B — Thin client physical device
- Patched via Windows Update for Business policies in Intune
- Update ring: KIOSK-Stable, 14-day deferral on quality updates, 30-day
  deferral on feature updates
- Maintenance window: 02:00-04:00 local time (devices auto-reboot)

## Monthly cycle (golden image refresh)

**Canonical rebuild method (June 2026 onward):** the scripted CLI-only bundle at `outputs/golden-image-build/` (`rebuild.sh` + five PowerShell scripts). It produced the first production image (`2026.06.09`), encodes every APM policy gate discovered during that build (mandatory VM tags, encryption-at-host, hostname limit, TrustedLaunch end-to-end, `--virtual-machine` capture), runs ~2 hours largely unattended, and is updated in place as gates change. Do not rebuild via portal/Bastion from the WP-2.10 prose — run the bundle.

| Day | Activity |
|---|---|
| Patch Tuesday (2nd Tue) | Microsoft publishes updates |
| Wed-Fri week 1 | Validation in a dedicated build VM (run `outputs/golden-image-build/rebuild.sh`; per WP-2.10 procedure for the acceptance checks) |
| Mon week 2 | Build new golden image version; capture to gallery (rebuild.sh does both; bump the version date, refresh the AppX kill list in `03-appx-cleanup.ps1` against Microsoft Learn) |
| Tue week 2 | Deploy to validation host pool (if used) |
| Wed-Fri week 2 | Soak — observe for new defects |
| Mon week 3 | Promote to production host pool (NME → Auto-scale → Desktop Image (Template) swap) |
| Tue night week 3 | Auto-reimage rolls the new image across the fleet |

## Change management
Each new golden image version is a documented change per APM CM process:
- Change record with the build's CVE / KB list
- Validation evidence
- Production deployment approval
- Rollback procedure reference (WP-5.4)

## Emergency / out-of-band patching
For zero-days or critical CVEs, the cycle compresses:
- Same-day build of a hotfix golden image
- Skip validation host pool (with documented risk acceptance)
- Production reimage triggered manually
- Post-deployment validation
```

2. Confirm the Intune WUfB ring is configured for the kiosk fleet:

```bash
# Should already exist from Phase 1 — confirm policy name and assignment
az rest --method get --url "https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurations" \
    --query "value[?contains(displayName, 'WUfB')].{name:displayName, id:id}" -o table
```

If no WUfB ring exists for kiosks, create one via Intune admin centre and assign to `SG-APM-Kiosk-Devices`. Settings per the document above.

**Validation.**
- Patching lifecycle document exists and is signed by APM ops.
- WUfB ring assigned to kiosk devices.
- A test golden image rebuild + production promotion has been rehearsed (probably during the Phase 2 build); document the timing.

**Gotchas.**
- The nightly reimage means any Tier A patch lands within 24 hours of golden image promotion. This is faster than typical enterprise patching cycles — flag to APM ops as a feature, not a defect.
- Tier B (thin client) reboots during the maintenance window. Sites that operate outside business hours (24/7 sites) need a different maintenance window — confirm in WP-3.1.

**References.** DD V0.3 §8 Patching Lifecyle (note: original DD has a typo "Lifecyle" instead of "Lifecycle"; preserve the section reference verbatim).

---

### WP-5.4 — Operational runbooks (1.5 d)

**Status:** **BLOCKED** (Phase 5). Runbook drafting can proceed now. [ ] Complete.

**Purpose.** Write the procedural runbooks APM ops will use day-to-day. These complement WP-3.5's common-issue runbook with the deeper procedures that aren't issue-driven.

**Prerequisites.**
- WP-5.1, WP-5.2, WP-5.3 complete (their content gets assembled here).

**Procedure.**

Create the following runbook documents in `./outputs/runbooks/`. Each is a short procedural document with: trigger, prerequisites, procedure, validation, escalation if it fails.

**Runbook RB-1: Ad-hoc password rotation on suspected compromise**

```markdown
# RB-1 — Ad-hoc Password Rotation

## When to use
- Suspected compromise of a kiosk credential (lock screen photographed
  off-site, social engineering report, anomalous Entra sign-in)
- Per-device or fleet-wide

## Procedure (single device)
1. Identify the affected device serial.
2. Sign in to Azure portal; navigate to Automation Account aa-apm-kiosk.
3. Runbooks → Rotate-KioskUserPasswords → Start.
4. Parameters: ServiceDeskEmail = servicedesk@apm.com.au;
   SingleUserUpn = kiosk-<serial>@apm.net.au
5. Run on hwg-apm-kiosk
6. Wait for completion (typically 30 seconds)
7. Within 60 minutes, the device's PR re-pulls and the lock screen
   updates with the new password
8. Confirm the site contact sees the new credentials

## Procedure (fleet-wide)
Same as above, omit SingleUserUpn parameter. Runtime ~5-10 minutes for
517 devices.

## Validation
- Key Vault shows new secret version for the affected secret
- Function App returns the new password when queried
- PR detection script reports hash match on next cycle

## Escalation
If the runbook fails: check hwg-apm-kiosk health, Key Vault availability,
Entra service health. Escalate to the project team on-call (WP-5.2 action
group).

## Note — AU-scoped permissions
The Automation Account MI's Graph permissions are AU-scoped to
AU-APM-Kiosk (Permission Requirements v0.2, June 2026). The runbook can
only operate on kiosk identities inside that Administrative Unit. A
"Insufficient privileges" error against a kiosk user usually means the
user was created outside the AU — check AU membership before suspecting
the consent.
```

**Runbook RB-2: Golden image rollback**

```markdown
# RB-2 — Golden Image Rollback

## When to use
- A new golden image version has been promoted to production and is
  causing widespread issues (sign-in failures, missing applications,
  unexpected behaviour at scale)

## Procedure
1. Identify the offending image version in the Azure Compute Gallery
   (gal_apm_kiosk → imdef-apm-kiosk-w11 → versions).
2. Identify the previous known-good version.
3. In Nerdio Manager: Desktop images → Set the previous version as the
   default for HP-APM-Kiosk.
4. Trigger immediate reimage of all session hosts via Nerdio (override
   the nightly schedule for a one-off reimage cycle).
5. Wait 30 minutes for the reimage to complete.
6. Validate: a test sign-in succeeds and the previously-broken
   functionality works.

## Validation
- All host pool VMs reimaged from the previous version
- Test sign-in successful from a pilot device

## Escalation
If rollback also breaks: investigate whether the issue is not actually
image-related (CA policy, Function App, network). Escalate to the
implementer on-call.

## Communication
APM Service Desk announces "Kiosk service interruption resolved" once
the rollback is in place and validated.
```

**Runbook RB-3: Host pool failover / recovery**

```markdown
# RB-3 — Host Pool Failover

## When to use
- HP-APM-Kiosk all session hosts unhealthy
- Nerdio auto-scaling unable to regenerate
- AVD service health shows region-wide issue

## Procedure
1. Confirm Microsoft AVD service health at status.azure.com →
   Australia East
2. If region-wide outage: announce to sites; no implementer-side action.
   APM Service Desk distributes hold message.
3. If isolated to HP-APM-Kiosk: in Nerdio, delete all session hosts;
   trigger fresh provisioning from the current default image.
4. Wait for new hosts to come online (10-15 minutes per host).
5. Validate one sign-in.

## Last resort
If Nerdio cannot regenerate: redeploy the host pool from IaC. Reference:
Phase 2 WP-2.9 commands. Ensure the IaC template carries the mandatory
APM management-group requirements on every VM: tags enableupdate,
update-stage, backup (policy-allowed value), and encryption-at-host —
deployment is denied by policy without them.

## Validation
- At least one healthy session host
- Test sign-in succeeds
```

**Runbook RB-4: Region failure**

```markdown
# RB-4 — Region Failure

## When to use
- Microsoft Azure Australia East region unavailable

## Procedure
1. Confirm region-wide outage at status.azure.com.
2. Communicate to APM Service Desk; distribute hold message to sites.
3. Wait for Microsoft recovery.
4. On region recovery, validate end-to-end: kiosks reach Function App,
   Function App reaches Key Vault, AVD session hosts provision.

## Limitations
The POC architecture does not include cross-region replication. There is
no failover destination. Recovery time depends on Microsoft. APM ops
should not attempt to "fix" this — it's not fixable from APM's side.
```

**Runbook RB-5: Break-glass admin access**

Per DD V0.3 §7 Break-Glass Procedure. Save in full:

```markdown
# RB-5 — Break-Glass Admin Access

## When to use
- Conditional Access policy misconfiguration locks out kiosk users
- Implementer admin (or APM admin) cannot reach Azure for incident response
- Emergency administrative action required

## Prerequisites
- Break-glass admin account exists (provisioned at initial tenant
  configuration; excluded from all blanket CA policies)
- Break-glass account credentials are stored offline per APM standard
  (sealed envelope, physical safe, or equivalent)
- Break-glass account is MFA-enforced via a separate Conditional Access
  policy that applies only to break-glass accounts

## Procedure
1. Retrieve break-glass credentials per APM standard.
2. Sign in to entra.microsoft.com with break-glass credentials.
3. Perform the emergency action (e.g. disable a CA policy, add a user
   to SG-APM-Kiosk-CA-Exclusion, recover a deleted account).
4. Document the use of break-glass credentials in the incident system
   with: reason, duration, alternative remediation considered, named
   authorising personnel.
5. Sign out of break-glass account.
6. Rotate break-glass credentials within 24 hours of use.

## Post-use requirements
- Quarterly access review of all break-glass account activity
- Annual rotation of break-glass credentials (regardless of use)
- Sign-in events from break-glass accounts trigger a separate alert
  (per WP-5.2; add this alert if not already configured)
```

**Runbook RB-6: Site addition**

Procedure for onboarding a new APM site after the national rollout completes.

```markdown
# RB-6 — Site Addition

## When to use
- A new APM site comes online and needs kiosk devices

## Procedure
1. Run the site readiness checklist (./outputs/site-readiness-checklist.md)
   with the new site's IT contact.
2. the device-prep partner allocates and preps devices.
3. Hash CSV imported into Autopilot.
4. Kiosk user accounts created via Create-KioskUser runbook.
5. Per-device Function keys generated and stored in Key Vault.
6. Devices shipped to site.
7. Site activation per Phase 3 WP-3.2 process.
8. Add the site to the monitoring dashboard's site filter.
```

**Runbook RB-7: Device decommission**

```markdown
# RB-7 — Device Decommission

## When to use
- Hardware failure (replace with new device under warranty)
- Site closing
- Device theft

## Procedure
1. Identify the device serial.
2. Intune admin centre → Devices → select device → Retire or Wipe.
3. Disable the corresponding Entra user account:
   `Update-MgUser -UserId <upn> -AccountEnabled $false`
4. Disable the Function App per-device key:
   `az functionapp keys delete -g $RG -n func-apm-cred-proxy --key-name kiosk-<serial> --key-type functionKeys`
5. Move the corresponding Key Vault secret to a tombstone tag for audit:
   `az keyvault secret set-attributes --vault-name kv-apm-kiosk --name kiosk-<serial> --enabled false`
6. Remove the Autopilot device entry from Intune.
7. Document the decommission in the asset register.

## Note
Do NOT delete the Key Vault secret. Soft-delete + purge protection mean
the historical record remains for audit purposes.
```

**Validation.**
- All seven runbooks exist and are signed off by APM ops.
- A tabletop walkthrough of RB-1 and RB-5 has been done with APM Service Desk.

**Gotchas.**
- Runbooks rot quickly. Schedule a six-monthly review of all seven; the project team should be on the hook for the first review at minimum.
- RB-5 is the most important and the least exercised. Practise it with APM at least once before handover; otherwise it'll be the runbook that fails when it's most needed.

**References.** DD V0.3 §7 Break-Glass Procedure; DD §8 Operational Runbooks.

---

### WP-5.5 — RFFR / ASD ISM control alignment evidence pack (1.5 d)

**Status:** **BLOCKED** (Phase 5 — needs operational evidence). Control map drafting can proceed now. [ ] Complete.

**Purpose.** APM operates under the Workforce Australia Service Deed, which requires Right Fit for Risk (RFFR) accreditation administered by DEWR. RFFR is based on ISO 27001 + ASD ISM. This WP produces the evidence map that demonstrates how the kiosk solution supports APM's RFFR posture.

**Important framing per DD V0.3 §7:** "RFFR compliance is managed under APM's existing ISMS with the Compliance Manager as responsible, Cyber Security is consulted and provides assurance. This document supports the accreditation process but does not constitute the ISMS."

The evidence pack supports APM's RFFR cycle; APM owns the accreditation.

**Prerequisites.**
- WP-5.1, WP-5.2, WP-5.3, WP-5.4 complete (they're the evidence source).

**Procedure.**

1. Build the control-mapping matrix. Save to `./outputs/rffr-evidence-pack.md`:

```markdown
# APM JobSeeker Kiosk — RFFR / ASD ISM Evidence Pack

## Scope
The kiosk solution as deployed under the Detailed Design V0.3 and this
Implementation Plan. Supports — does not constitute — APM's ISMS under
the Workforce Australia Service Deed.

## Control mapping

### Identification, authentication, and access control

| ASD ISM Control | How the kiosk solution supports | Evidence |
|---|---|---|
| ISM-0405 Privileged access to systems | Privileged Azure access via SG-APM-Kiosk-Admins; access reviewed quarterly | WP-1.1, WP-5.4 quarterly review |
| ISM-1546 Multi-factor authentication | MFA enforced on break-glass and admin accounts via dedicated CA policy | WP-1.4, RB-5 |
| ISM-1175 Application allow-listing | Shell Launcher v2 restricts kiosk shell to Windows App only | WP-1.7 Profile 5; Layer 3 of the device-bound access design |
| ISM-1507 Access restricted to authorised devices | Four Conditional Access layers ensure credentials only work on provisioned kiosk devices. **Control number to be re-verified against the current ISM release before evidence-pack submission — v0.3.2 incorrectly re-used ISM-1546 (MFA) for this row.** | WP-1.4 + WP-3.3 evidence pack |
| ISM-1507 Least privilege (service identities) | Automation Account managed identity holds AU-scoped Graph permissions only (`User.ReadWrite.All` constrained to `AU-APM-Kiosk`; `GroupMember.*` in place of the broader `Group.ReadWrite.All` / `Directory.Read.All`, which APM IAM declined June 2026). Compromise of the MI cannot reach identities outside the kiosk Administrative Unit. | Permission Requirements v0.2; WP-1.6 consent verification |
| ISM-0408 Removal of user accounts | Decommission runbook deactivates Entra user + tombstones Key Vault secret | RB-7 |

### Cryptography

| ASD ISM Control | How supported | Evidence |
|---|---|---|
| ISM-1139 Cryptography in transit | TLS 1.2+ enforced on all in-flight traffic — kiosk to Function App, Function App to Key Vault | DD §5.1.1.3; WP-2.4 |
| ISM-0457 Cryptographic algorithm selection | Microsoft-default encryption (AES-256 at rest in Azure services); SHA-256 hash comparison in PR script | WP-1.8 PR script |
| ISM-1090 Cryptographic keys | Key Vault HSM-backed (configurable); soft-delete + purge protection | WP-2.3 |

### Audit, monitoring, and event logging

| ASD ISM Control | How supported | Evidence |
|---|---|---|
| ISM-0580 Event log content | Sign-in logs, Key Vault audit logs, Function App App Insights, Automation runbook logs all captured | WP-5.2 |
| ISM-0859 Event log retention | Log Analytics workspace retention: 30 days hot, 365 days archive | WP-5.2 |
| ISM-1228 Event log protection | Logs in Log Analytics workspace; immutable; access role-based | WP-2.3 |
| ISM-0109 Monitoring | Active alerts on Function App availability, Key Vault unauthorised access, rotation failures | WP-5.2 alert rules A1-A6 |

### Information protection and data handling

| ASD ISM Control | How supported | Evidence |
|---|---|---|
| ISM-0843 Information classification | Internal sensitivity label applied to workspace + workspace artefacts | WP-1.2 |
| ISM-1199 Information handling | Stateless architecture; no job seeker data persists beyond session; nightly reimage + user profile cleanup | DD §6, WP-1.7 Profile 9, WP-2.11 |
| ISM-0432 Removable media | USB storage controlled by exception policy; not enabled by default | DD §5.2 |

### Incident response and business continuity

| ASD ISM Control | How supported | Evidence |
|---|---|---|
| ISM-0125 Incident response plan | Common-issue runbook + escalation matrix + operational runbooks | WP-3.5, WP-5.4 |
| ISM-1166 Business continuity / DR | DR plan documents seven failure modes with RTOs | WP-5.1 |
| ISM-1511 Backup of important data | Stateless design — no application data to back up; Key Vault soft-delete + purge protection covers secrets. **Control number to be re-verified against the current ISM release before evidence-pack submission — v0.3.2 incorrectly re-used ISM-1175 (application control) for this row.** | WP-2.3 |

### Networking and infrastructure

| ASD ISM Control | How supported | Evidence |
|---|---|---|
| ISM-1182 Network segmentation | Hub-spoke VNet with NSGs; AVD session hosts isolated from internet inbound | WP-2.1 |
| ISM-0639 Boundary protection | Zscaler outbound + Azure NSGs + Function App access restrictions | WP-2.4, WP-2.15 |
| ISM-1428 DNS | Azure Private DNS for private endpoints; public DNS for outbound | WP-2.2 |

### Application security and patching

| ASD ISM Control | How supported | Evidence |
|---|---|---|
| ISM-1493 Application hardening | Edge browser policies; managed favourites; download restrictions | WP-1.7 Profile 6 |
| ISM-1144 Operating system patching | Two-tier model: nightly reimage (AVD); WUfB ring (thin clients) | WP-5.3 |
| ISM-1496 Web browser security | Edge SmartScreen, InPrivate disabled, ephemeral profiles, blocked file types | WP-1.7 Profile 6 |

## Gaps and accepted residual risks

| Gap / risk | Mitigation | Accepted by |
|---|---|---|
| Office Online has no endpoint hardening surface | Stateless session; no local Office; Edge SmartScreen | APM (WP-2.14) |
| No cross-region DR | Tier 3 RTO accepted | APM (WP-5.1) |
| Per-device credential displayed on lock screen | Device-bound CA + Shell Launcher per-user shell + Layer 4 single-session | APM (DD §7) |

## Document control
- Author: the project team
- Date: [completion date]
- Version: 1.0
- Review cycle: aligned to APM's RFFR re-accreditation cycle (typically annual)
- Owner post-handover: APM Compliance Manager
```

2. Walk the matrix with APM Cyber Security as a consultation session. Cyber Security's role is assurance (per DD §7); they confirm the evidence base is credible, then APM's Compliance Manager incorporates it into the ISMS.

3. Capture any gaps surfaced in the review and remediate before final sign-off.

**Validation.**
- RFFR evidence pack reviewed by APM Cyber Security.
- All control mappings have cited evidence in this implementation plan.
- Any gaps are documented with mitigation or APM-accepted residual risk.

**Gotchas.**
- This is **not** an accreditation. APM goes through the RFFR accreditation themselves with DEWR. This pack supports their work, not the other way around.
- ISM control numbers shift with each ISM revision. Cite the ISM revision used. Re-verify before each annual review.
- Some controls in the table above may be marked "Not applicable" by APM's specific RFFR scope. That's a Compliance Manager call, not the project team's. Don't argue with their applicability decisions.

**References.** DD V0.3 §7 RFFR Overview; Australian Signals Directorate Information Security Manual (current revision); ISO/IEC 27001.

---

### WP-5.6 — Operational handover and knowledge transfer (2.0 d)

**Status:** **BLOCKED** (Phase 5 — final activity). [ ] Complete.

**Purpose.** Hand over the running system to APM operations. The last 2 days of the engagement before the project team steps back into a support agreement.

**Prerequisites.**
- WP-5.1 through WP-5.5 complete.
- Phase 4 rollout complete (or substantially complete).

**Procedure.**

1. **Schedule the handover sessions.** Four sessions of ~90 minutes each:

| Session | Audience | Content |
|---|---|---|
| H1 — Architecture walk-through | APM ops + APM Cyber Security | DD V0.3 + this implementation plan; the four-layer access design; the credential management chain; the AU-scoped Graph permission model and the `AU-APM-Kiosk` Administrative Unit boundary (what the Automation MI can and cannot touch) |
| H2 — Day-to-day operations | APM ops + APM Service Desk | Monitoring dashboard; the seven operational runbooks; common-issue runbook; escalation matrix |
| H3 — Compliance review | APM Compliance Manager + APM Cyber Security | RFFR evidence pack walkthrough; mapping to APM ISMS |
| H4 — Tabletop incident drill | APM ops + Service Desk + implementer on-call | Run a scenario through the runbooks live (e.g. RB-5 break-glass, RB-1 ad-hoc rotation, A6 sign-in failure spike) |

2. **Build the handover pack.** Save to `./outputs/handover-pack/`:

| Document | Source |
|---|---|
| DD V0.3 | Existing |
| This implementation plan (current version) | This document |
| Effort estimate (final) | The v0.1 Excel, updated with actuals |
| DR plan | WP-5.1 |
| Monitoring dashboard URL + workbook | WP-5.2 |
| Patching lifecycle | WP-5.3 |
| All seven operational runbooks | WP-5.4 |
| RFFR evidence pack | WP-5.5 |
| Phase 1-4 evidence packs | Sign-off folders |
| Decision register | Throughout (capture all decisions made during the engagement) |
| Open items + carry-forward | Run a final walk-through to capture what's deferred |

3. **Run each handover session.** Capture attendance, key questions, and any defects raised. Update documentation post-session.

4. **Sign-off package.** APM signs:
   - Acceptance of the implementation as delivered.
   - Acknowledgement of accepted residual risks.
   - Confirmation of the post-handover support model and SLA.

5. **Post-handover support agreement.** Confirm with APM the ongoing support model — typically a defined number of hours per month, an SLA on response time, and a quarterly review. This is commercially negotiated; documented in this WP for traceability.

6. **Lessons-learned document.** Save to `./outputs/lessons-learned.md`. Capture what worked, what didn't, what would change if done again. This is for the project team's future kiosk engagements as much as for APM.

7. **Decommission build artefacts.** Once handover is signed:
   - Remove your `Key Vault Administrator` role assignment (revert to `Key Vault Secrets Officer` for ongoing read-only audit, or remove entirely).
   - Hand over the build VM administrative credentials.
   - Remove implementer-side break-glass access (APM owns this going forward).
   - Archive build artefacts.

**Validation.**
- All four handover sessions complete, with attendance and minutes captured.
- Handover pack delivered to APM in a documented location.
- Sign-off package signed by APM.
- Post-handover support agreement in place.
- Lessons-learned document complete.

**Gotchas.**
- The tabletop drill (H4) is the most valuable session. Don't skip it. People who can read a runbook off paper often can't execute it under pressure; the drill surfaces the gap.
- Sign-off should happen at H4 or shortly after, not at H1. APM signs off after they've seen everything, not after the architecture walk-through.
- Post-handover support is real work that needs commercial framing. Don't promise "we'll be there" verbally without a written agreement; ambiguity here erodes the relationship over time.

**References.** DD V0.3 §8 Service Management Implementation Sequence Phase 5.

---

### Phase 5 acceptance checklist

The final phase. When this checklist closes, the engagement closes.

- [ ] DR plan documents seven failure modes with RTOs; signed by APM ops.
- [ ] All six monitoring alerts configured and tested; action group delivers to APM Service Desk.
- [ ] Operations workbook in Azure Monitor accessible to APM ops.
- [ ] Patching lifecycle documented; WUfB ring assigned; first golden image refresh rehearsed.
- [ ] All seven operational runbooks signed off by APM ops; RB-1 and RB-5 walked through in a tabletop.
- [ ] RFFR evidence pack reviewed by APM Cyber Security; mapped to ASD ISM with cited evidence.
- [ ] Four handover sessions complete; minutes captured.
- [ ] Handover pack delivered to APM in agreed location.
- [ ] APM sign-off signed.
- [ ] Post-handover support agreement in place.
- [ ] Lessons-learned document complete.
- [ ] Implementer-side build access revoked or downgraded per the decommission step.

Sign off Phase 5 acceptance — and engagement close — in `./evidence/phase-5-signoff.md`.

---

## Engagement close

When Phase 5 is signed off, the engagement is complete. The kiosk solution is operating, monitored, documented, and owned by APM. the project team's role transitions to whatever post-handover support agreement is in place.

Three closing notes for the project team:

1. **The first 30 days post-handover are the validation window.** Issues that didn't surface during the build will surface here as APM ops runs the system without the project team at the keyboard. Schedule a 30-day review with APM to surface anything that the runbooks didn't cover.
2. **Update this playbook with what actually happened.** Where the procedure didn't match reality, fix it. The next kiosk engagement starts from this version.
3. **Carry forward the design defects into V0.4 of the DD.** ADRs drift, decisions get made in flight, documentation lags. The DD V0.3 was the design at the start of the build; V0.4 should reflect what was actually built.

---

## Calibration notes

1. The full playbook is now at the same depth across all five phases.
2. Where the DD V0.3 has ambiguities or open decisions (USB enabled? Premium Per User? per-device Function key Option A vs B?), this playbook flags them at WP-1.0 and again where they bite downstream — close them out before they become rework.
3. The Rotation Password PR ordering correction in §0.5 is the most important structural change relative to the V0.1 effort estimate.
4. Phase 2 uses "RDP `singlesessionperuser` plus FSLogix-disabled" as the correct mechanism for Layer 4 single-session enforcement. Earlier DD revisions named this "FSLogix Single-Session Enforcement"; that wording is incorrect and was carried into Appendix A which has now been removed from DD V0.3 by the client.
5. DD V0.3 (post-appendix-removal) restructured the body section numbering. Many references in this playbook still use the older DD section numbers (e.g. §5.1.1.2 for Intune Configuration Profiles which is now §5.3.5 in the latest DD; §7 for Cyber & Security which is now §8). A future DD revision should re-map every DD section reference.
6. Phase 4's headline 4-day budget is unrealistic at ~517 devices. At a charitable 3% per-device defect rate (15 devices) and 30 minutes per ESP-recovery, that's 7.5 hours of recovery work alone. Add wave retrospectives, dashboard review, communications, and any actual incident response, and a realistic budget is 8 days minimum (one day per wave at 5-6 waves plus contingency). This is flagged in WP-4.1 Gotchas; v0.3 carries the headline 4 days at APM's previous expectation and surfaces the gap explicitly rather than papering it.
7. Phase 5's 8 days is the documentation and handover envelope. It does not include post-handover support, which is a separate commercial conversation.
8. Where this playbook is uncertain about a specific Azure portal click-path or PowerShell command syntax, it is flagged in the Gotchas note rather than asserted as fact. Microsoft Learn is the canonical reference if the UI or commands have drifted since this playbook was written.

### v0.2 → v0.3 change log (forensic detail)

v0.3 of this playbook applies the punchlist captured in `/scope/findings.md` (F-01 to F-30) and `/scope/findings-v0.3.md` (F-31 to F-40). The substantive changes:

- **F-31 / F-33 (P1).** Intune configuration profile target population corrected per DD §4.3 paragraph 123. Seven of the ten profiles (Office device licensing, RDS session timers, lock-on-disconnect, Edge hardening, Edge favourites, Office 365 web access, user profile cleanup) re-assigned from `SG-APM-Kiosk-Devices` to the new `SG-APM-AVD-SessionHosts`. Two (Shell Launcher v2, Rotation PR) stay on `SG-APM-Kiosk-Devices`. The session-host group is created in WP-1.1. WP-2.9 host pool identity set to "Entra ID join + Intune enrol". WP-2.10 validation now checks session host appears in `SG-APM-AVD-SessionHosts` and the seven session-host profiles apply.
- **F-32 (P1).** Group naming reconciliation. v0.3 keeps the `SG-` prefix throughout to match APM's internal convention (`SG-APM-Kiosk-Admins` already exists). DD V0.4 defect raised to align DD §6.2 Table 50 with the `SG-` prefix.
- **F-35 (P2 new).** Kiosk UPN format corrected to DD §5.1.1 paragraph 185 form: `kiosk-{serial}@apm.net.au`. v0.2 used `{serial}@apm.onmicrosoft.com` which lost the load-bearing `kiosk-` namespace prefix.
- **F-02 (P1).** Conditional Access — three new policies added (BlockExchangeOnline, BlockTeams, WebOnly-Office) per DD §6.2 Tables 52, 59, 60. Sign-in frequency set to 12 hours. BlockNonWindows target apps restricted from "All cloud apps" to the three AVD apps. `Microsoft Remote Desktop` added to target apps where missing. Legacy auth client inclusion added to DeviceBound. **(WebOnly-Office subsequently removed 2026-06-11 as inert — see WP-1.4; net CA count is five.)**
- **F-01 (P1).** Windows App AUMID in Profile 5 Shell Launcher v2 XML. v0.3 updated it to `MicrosoftCorporationII.MicrosoftRemoteDesktop_8wekyb3d8bbwe!Microsoft.RemoteDesktop.Client` (then believed correct); field verification on 2026-06-09 against a Win11 24H2 reference install confirmed that value was itself stale — v0.3.3 carries the confirmed `MicrosoftCorporationII.Windows365_8wekyb3d8bbwe!Windows365` (verified via `Get-StartApps`; recorded in `evidence/aumid-verification.md`). The `Get-StartApps` verification step in WP-1.7 remains mandatory before each deployment batch — Microsoft has renamed this package repeatedly.
- **F-12 (P2).** Session disconnect timer in Profile 3 reduced from 5 minutes (v0.2) to 1 minute (DD §4.3 Table 12).
- **F-13 (P2).** WP-1.8 PR script hardened: `Get-CimInstance` instead of deprecated `Get-WmiObject`; bounded retry with exponential back-off on Function App call; fail-safe exit code (network failure exits 0, not 1); parameterised URL; Event Log instrumentation under source `APMKioskRotation`.
- **F-14 (P2).** WP-2.5 / WP-2.6 password generator uses `System.Security.Cryptography.RandomNumberGenerator` and a Fisher-Yates shuffle (was `Get-Random` + non-uniform `Sort-Object` shuffle in v0.2).
- **F-08 (P2).** WP-2.4 Function App plan SKU corrected from P0v3 (App Service) to EP1 (Functions Elastic Premium) with one always-ready instance.
- **F-22 (P3).** WP-2.3 Key Vault diagnostic-settings categories: `AzurePolicyEvaluationDetails` removed (doesn't exist on KV).
- **F-20 (P3).** WP-1.6 (now in Phase 2B) Graph permission assignment refactored to use `Find-MgGraphPermission` instead of hard-coded role-id GUIDs.
- **F-06 (P1).** WP-2.8 HRW VM now lands as a production component: Azure Update Manager maintenance configuration, Windows Server 2022 baseline, Defender for Servers Plan 2, diagnostic settings to Log Analytics, heartbeat alert (added to WP-5.2), documented ownership, optional second HRW VM for resilience.
- **WP-1.6 relocation.** Physically moved from Phase 1 to Phase 2B per cyber item 4. Phase 1 carries a one-paragraph breadcrumb at the original location. Numbering kept (still WP-1.6) so cross-references resolve.
- **WP-1.3 split.** Two compliance policies now — `Compliance-APM-Kiosk-W11IoT` on the thin client and `CMP-APM-AVD-SessionHosts` on the session host. v0.2 had a single policy on the user group, which evaluates the wrong device population for the CA grant control.

### DD V0.4 defect list (raised for the DD team)

When DD V0.4 is reissued, the following defects from v0.2 / v0.3 review should be addressed:

- DD §5.1.1 paragraph 248 — delete the "Receives the current fleet password from Azure Blob Storage using a read-only SAS token" sentence. Contradicts the per-device Key Vault model described in the same section. (F-03, F-34.)
- DD §6.2 Table 50 — add `SG-` prefix to all group names to match APM internal convention and the v0.3 plan. (F-32.)
- DD §4.3 / §5.1.1.2 Shell Launcher v2 — fix the Windows App AUMID. The DD currently quotes `ms-resource://Microsoft.DesktopAppInstaller` which is winget, not the Windows App. (F-01.)
- DD §5.1.1.4 — fix the internal forward reference to "§5.1.1.1" (a section that doesn't exist). The actual referenced material is at §5.1.1.4 itself. (F-21.)
- DD §8.4 Phase 2 — move "Apply Intune configuration profiles" to Phase 1 (the plan creates profiles in Phase 1 and consumes them in Phase 2 via the golden image). (F-39.)
- DD §5.1.1 paragraph 191 — clarify the runbook trigger model. Paragraph 191 says "polls the group via Microsoft Graph at a five-minute interval"; v0.3 of the plan defaults to a 5-minute Automation Account schedule per the wording. If the intent is event-triggered, the DD wording should change. (F-36.)
- DD §6.2 Tables 53-60 — confirm sign-in frequency 12 hours is the intended value on every kiosk CA policy. The v0.2 plan omitted sign-in frequency entirely; v0.3 adds it per the DD; confirm the value is current intent.
- Brand-leak references throughout the DD — Nucor, Crane Twin, PPE — these slipped into earlier versions of the source documents and should be scrubbed from any DD that may go to APM RFFR auditors. (F-07.)
- DD §6.2 Tables 53 and 56 — `CA-APM-Kiosk-DeviceBound` and `CA-APM-Kiosk-RequireCompliantDevice` are byte-identical apart from the name field, which is a duplicate-policy defect. Table 53 should be rewritten to the "Exclude filtered devices + Block" identity-check pattern (blocks non-kiosks entirely); Table 56 should keep the "Include filtered devices + Require compliant device" state-check pattern (requires current compliance on the kiosks DeviceBound has already let through). v0.3.2 of the plan implements this corrected split; DD V0.4 should align. Surfaced 2026-05-27.

### Per-device Function key Option A — design gap (Phase 2B prerequisite)

The DD presents Option A (Entra ID device authentication to Key Vault via the PR script) as the production target and Option B (baked Function key on the device) as acceptable for pilot. v0.3 of this plan ships Option B in WP-1.8 (Function key in a SYSTEM-readable file dropped by the provisioning script) because Option A is not yet designed end-to-end. The actual Option A flow requires either (a) the PR script gets an Entra access token using the device PRT and calls a Function App endpoint that maps device serial to Function key, or (b) a SCEP-issued client cert that authenticates to Key Vault. Either approach is non-trivial design work. Before Phase 2B unblocks, the project team should either:

- design the Option A flow in detail and add WP-2.4b (Function key mapping endpoint) or WP-1.7b (SCEP client cert profile) to this plan; or
- accept Option B as the production design and add a quarterly Function key rotation step to the rotation runbook (WP-2.6).

The honest path is acknowledging the design gap rather than carrying "Option A coming soon" through to Phase 4.
