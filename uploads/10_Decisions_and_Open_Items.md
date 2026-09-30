# Artifact 10 — Decisions & Open Items (working-session context)

Context that was decided or surfaced in working sessions and is not yet folded into the design documents. Action: merge each item into the relevant design doc and register, then mark it resolved here.

## A. Open decision — Developer SOE completion (UNRESOLVED)
The build order is Network → Job Seeker → Standard User → ES → Privileged → Developer, inside a window ending **30 September 2026**, delivered by a single build engineer. On current resourcing, Developer GA lands about **9 October 2026**, past the contract end.

Recommendation: commit Network + Job Seeker + Standard User + ES to 30 September; protect Privileged; make Developer the flex item.

Decision needed (choose one):
1. Scope Developer to **design + pilot** by 30 September, with GA after.
2. **Add a second build engineer** for the September overlap so Developer can finish in-window.
3. **Re-order** Developer earlier (displacing another use case) if it must be live in-contract.

Owner: Digital Delivery Portfolio Manager. Once chosen, update `00_Context_Brief.md` §4.5 (risk 1) and §6, and the program plan.

## B. Design QA findings to action (Job Seeker design)
1. **Addressing is described inconsistently.** A /16 supernet (10.73.0.0/16), a /26 per site, and a statement of "253 available / 256 total" that implies a /24. Reconcile the per-site mask against the stated available-host count and the device count. *(Still open — in the V1.1 defect list below.)*
2. **Device count — RESOLVED = 540.** 540 is the approved design count (per DR-009 / assumption A-04); the older ~517 figure is stale and has been corrected across the plan, workbook and tracker.
3. **Conditional Access policies are duplicated — CORROBORATED.** The V1.0 design defines two near-identical device-bound / block-non-Windows / block-web-client policy sets under two different group names, and the Teams-block policy lists a placeholder cloud app ("Badge") instead of Microsoft Teams. This now also appears in the V1.1 defect list. Consolidate to one set and correct the Teams-block target.

Action: raise these as corrections against the Job Seeker design and add 1–2 to the risk register if they affect build.

## B1a. Interim thick-client (Plan B) CA decisions — LOCKED 20 Jul 2026 (user-confirmed, doc updated by user)
- **CA-APM-KioskPB-WebOnlyOffice** (renamed from CAAPMKioskWebOnlyOffice) **exclude list (final): Microsoft Office Web Apps Service + Office 365 SharePoint Online only.** Tenant picker has no "Microsoft Office Online" app; Web Apps Service is the Word/Excel/PowerPoint web (WOPI) service. **Microsoft Office 365 Portal stays BLOCKED** — kiosk entry is via Edge bookmarks direct to word/excel/powerpoint.cloud.microsoft, not office.com. Office Licensing Service stays blocked unless sign-in logs prove it breaks the flow.
- Remaining §7.2.4 set: 6 CA-APM-KioskPB-* policies (RequireCompliantDevice, BlockNonKioskDevices, BlockNonWindows, BlockLegacyAuth, BlockAuthFlows, BlockRiskySignIn) + CA-104 tenant baseline. Device filter convention: `extensionAttribute1 -eq "KioskPlanB"`. No location policy (no dedicated site egress IPs). **STATUS 20 Jul 2026: all 7 KioskPB policies built in tenant, REPORT-ONLY.** Enable sequence: flip KioskPB set to On after sign-in-log review, THEN add tenant MFA exclusions.
- **Tenant policy exclusions to apply:** exclude `SG-APM-Kiosk-PlanB-Users` (user group, not device group) from `ALLUsers_AllAccess_MFAorDeviceRequired` and `AllUsers_Office365_DeviceRequired` (kiosks are Entra-joined, not hybrid — the latter hard-blocks them). Sequence: enable KioskPB set first, then add exclusions.
- Assigned Access single-app policy (Edge + ZSATray + explorer.exe, Start pins Edge + File Explorer) working; CSV/XML in project root. ZCC is user-based enrolment — per-session SSO re-enrolment is a test item.
- Follow-ups: Edge URLBlocklist/Allowlist spec (block office.com portal browsing device-side); hide non-removable drives in File Explorer; update V1.2 domain note group name if wanted.

## B2. Job Seeker Kiosk decision register (from the deep-context bundle, m0147 — KIOSK-ONLY)
*Scope: Job Seeker Kiosk SOE only. Do not apply to the other use cases. Prefixes: D = open APM decision; A = assumption; C = proposed change; DR = numbered design decision.*

**OPEN (live):**
- **D-14 — Code-signing certificate + Intune cert profile (MASTER GATE).** One fleet-trusted cert, added as a WDAC allowed signer, unblocks the entire device-side credential pipeline (MSAL/WAM token fetch, lock-screen render, LSA write) AND Nerdio session-host script signing. Everything device-side waits on this. Owner: APM Cyber / PKI.
- **D-7 — App-control baseline owner + accept signing.** WDAC sits in the RFFR Statement of Applicability (APM Cyber, not the DD). Add the cert as an allowed signer via a signed supplemental policy (signer rule, not hash/path). Owner: APM Cyber (Ugbaad Adani).
- **Network design finalised + approved (gates everything networked).** Per the 21 May cyber sign-off, no networking or credential-pipeline deployment proceeds until APM approves the finalised network design; the temporary public-endpoint workaround was **rejected**. Owner: APM Network (Vijay Natakar) + Cyber.
- **D-3 — Credential Proxy public ingress posture (CRITICAL).** With no site→Azure private path today, remote kiosks can only reach the Function App if it keeps a hardened public ingress (EasyAuth-protected). Single biggest unverified link. Owner: APM Cyber + project team.
- **D-5 — Production session-host build prerequisites.** Production session-host NSG lacks Storage / Microsoft Container Registry egress, breaking the Nerdio CSE host deploy (HTTP 403 + Device Guard 4551). Fix: add NSG egress + use NME Scripts Signing (keep WDAC enforced rather than exempt hosts). Owner: APM Network. *(See the 24 Jun cyber note.)*
- **D-10 / A13 — Kiosk VLAN allow-list additions.** Add Credential Proxy FQDN, `windows365.microsoft.com`, `*.cloud.microsoft`, Store/Edge-update endpoints. Owner: APM Network.
- **D-11 — Block legacy authentication** (default yes; not present in the V1.0 CA set). Owner: APM Cyber.
- **D-12 — Premium Per User** (future sub-hourly refresh) — default yes, not now (lower relevance under 12-month rotation).
- **D-13 — LTSC reset media for break/fix** — required because push-button reset fails on this fleet (`0x80004005` / `ERROR_UNRECOGNIZED_VOLUME`). Owner: APM IT / CompNow.
- **D-18 / A8 — Per-device user creation moved to APM IAM** (managed identity can't be AU-scoped for creation; bulk at rollout + trickle for swaps). Recommendation adopted.

**CLOSED by V1.0 (23 Jun 2026):** network model = controlled-connectivity hub/spoke, NOT full isolation (D-1/D-2/D-4); no AMPLS private monitoring (D-6); Credential Proxy auth = EasyAuth + PRT, pilot's per-device function-key build is now a deviation to migrate (D-8/C-6); AutoLogon retained on per-device F3 Entra user (D-9/A3; residual = LSA-write-before-reboot sequencing); licensing = F3 + M365 Apps device + Windows VDA for 540 (D-15, via SoftwareOne); USB write exception enabled (D-16); printing disabled (D-17 / DR-002); rotation cadence 12-month + 60-min device-side detection PR (A9 / DR-004).

## B3. V1.1 documentation defect list (fold into next DD revision — KIOSK-ONLY)
Maintained in the as-built register; corrections only, no build impact:
- Local-IoT-vs-F3 auto-login wording contradiction (it IS an F3 Entra user, not a local IoT account).
- Lock-screen hash filename mismatch.
- Duplicate / inconsistently-named CA tables (the "Badge" Teams-block placeholder — see B.3 above).
- Hub NAT Gateway naming defect.
- NSG egress gaps (Storage / MCR — see D-5).
- Entra group naming inconsistency (`SG-`-prefixed vs unprefixed).

## C. KB source specs (now in the export)
`artifacts/kb-specs/*.json` (14 files) are the structured, regenerable source for the Job Seeker KB and runbook articles. The KB Builder tooling (artifact 09) renders them to documents. Workflow: edit the spec, regenerate, then validate (Digital Business Partner, then the process stakeholder) before publishing under the APM KB standard (artifact 06). Keep specs anonymised.

## D. Live program plan workbook (now in the export)
`APM_AVD_Program_Plan.xlsx` (in the export root) is the working plan: live Gantt bars, native chart, dependency checks and dropdowns. The Markdown in artifact 05 is a data snapshot; the workbook is the editable source.

## E. Watch-list (already in the registers)
- Standard User printing decision (DR-010) and mapped-drive decision (DR-011) — both gate the Standard User build.
- Confirm Nerdio Manager for Enterprise is actually deployed in the tenant (assumed; reused by several use cases).
- Nominate the Developer platform owner (PDE owner) — gates Developer pilot, image approval and the service catalogue.

## F. Memory note
The originating assistant held the program context, including real individual names, in its own memory, separate from these files. In the destination project, rebuild any memory from roles only and do not reintroduce personal names.
