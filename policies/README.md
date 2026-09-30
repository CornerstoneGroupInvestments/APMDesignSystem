# APM Policies & Standards

Source-of-truth APM policy, standard and framework documents (SOE hardening standards, RFFR/ISM control sets, network standards, licensing policy, naming conventions, etc). Every design document, KB article and review in this project should check against what's here before asserting a control is met, excluded or compensated.

**Searchable register: open `policies/APM_Policy_Register.html`.** Every requirement extracted from every document, searchable, categorised, with each document's impact on our designs flagged as conflict / to-confirm / compliant / context. Data lives in `policy-data.js`.

**Compliance checker: open `policies/APM_Compliance_Check.html`.** Drop in a `.docx`, PDF, `content.txt` or any text document and it is checked against `compliance-rules.js` (48 machine-checkable rules drawn from these policies). Output: conflicts, gaps, compensating controls already argued, and what to change to comply - with the policy clause quoted and the offending sentence from the document shown as evidence. Runs entirely in the browser; also callable from `run_script` via `compliance-check.js` (`checkCompliance(text, rules, {env: ENVIRONMENT_CONFIG})` / `reportText(result)`), which is how `reports/` gets written.

**Conditional Access analysis: open `policies/APM_CA_Policy_Analysis.html`.** The tenant CA export (116 policies, 7 Aug 2026) with ten findings against our designs, plus a searchable table of every policy filtered by enforcement state. Parsed data in `ca-policies.js` (the canonical dataset - one file, loaded directly by the page), findings in `ca-analysis-data.js`; source CSV `APM-Conditional-Access-Policies-Export.csv`. **The export carries no exclusions or conditions**, so anything that depends on them is marked unknown - request `identity/conditionalAccess/policies` from Graph to close it.

**Environment register: `environment-config.js`.** What is actually configured in the tenant and estate (Azure ESLZ, Palo Alto hub firewalls, ESLZ naming, corporate Intune/Entra behaviour, the APM DDD+TCD template pair), each entry carrying advisory `interactions` that fire when a design touches that configuration - "this exists, here is what to exclude/adjust/name". Interactions never fail a run and are not scored; they render as an Environment section in the checker and the report. Add an entry whenever a new as-built or tenant fact lands.

**Give every register entry an `appliesWhen` scope gate.** `{min: n, any: [/re/, ...]}` requires n distinct signals before ANY of that entry's interactions are evaluated. Without it the Azure platform registers fire on an endpoint design that merely mentions "Sentinel" or a decommissioning note about the landing zone - 9 false positives on the Participant Kiosk before the gate was added. Signals must be *authoring* signals (`aus-sub-`, `auea-`, `virtual network`, `resource group`, `route table`, a `10.4x.` address), never words that appear in ordinary prose (`subscription`, `policy assignment`, `spoke`). Test every new gate against a document that should NOT trip it.

Baseline run: `reports/JobSeeker_Kiosk_V1.6-compliance-check.txt` - 91% alignment, 1 conflict, 2 gaps.

**Rules use a context guard.** A `mustNotSay` rule fires only when the surrounding window is genuinely about the subject - without it, "DES" matched the Disability Employment Services bookmark, `*.office.com` in a URL allow-list matched the wildcard-certificate ban, and "East US" in unrelated prose matched the data-residency ban. When adding a rule, test it against a real document and check what it catches by accident.

**Character-count rules require adjacency, not proximity.** A site code and a passphrase both count characters, so `charCountTest` only fires when the credential noun sits directly either side of the number (within one sentence, 60 characters), and a negative guard discards anything in naming context (site code, service tag, hostname, serial, UPN format). A proximity window is not sufficient - it read "4-character site code" as a password length whenever a naming table happened to sit near credential prose.

## Index

| Document | Doc ID | Owner | Published | Class | Category |
|---|---|---|---|---|---|
| Compliance Management Plan - RFFR and ISO/IEC 27001 (ANZ) | 09.03.055-1.2 | GM Quality & Compliance | 26/07/2026 | Internal | Governance |
| Artificial Intelligence Policy | 09.01.037-2.1 | CIO | 24/07/2026 | Internal | Governance |
| Cyber Security Posture Statement | 09.01.033-5.0 | CISO | 02/07/2026 | Internal | Governance |
| APM Trusted Insider Program | 09.03.020-6.0 | CISO | 30/06/2026 | Internal | Identity & Access |
| Continuous Monitoring Plan | 09.03.021-5.0 | CISO | 30/06/2026 | Internal | Monitoring |
| Cyber Security Communication Strategy | 09.03.009-2.7 | CISO | 02/07/2026 | Internal | Monitoring |
| Contact with Special Interest Groups | 09.03.015-6.0 | CISO | 02/07/2026 | Internal | Monitoring |
| Cryptography and Key Management Standard | 09.03.027-5.0 | CISO | 02/07/2026 | Internal | Cryptography |
| Cyber Incident Response Plan | 09.03.005-7.0 | CISO | 02/07/2026 | **Confidential** | Incident Response |
| Windows SOE Hardening Standard V3.0 (corporate staff) | SOE V3.0 | End User Computing Mgr | 2026 | APM Internal | Endpoint & SOE |
| Employment Services SOE Hardening Standard (customer-facing) | ES SOE V1.1 | Shaun Struik | 23/08/2026 | APM Internal | Endpoint & SOE |
| ES Kiosk Baseline change record + policy export | ESKIOSK-P-1.0 | Shaun Struik | 21/08/2026 | APM Internal | Endpoint & SOE |
| Identity and IT Access Management Standard | 09.03.035-5.0 | CISO | 23/02/2026 | Internal | Identity & Access |
| Intrusion Detection and Prevention Standard | 09.03.034-3.0 | CISO | 16/07/2025 | Internal | Monitoring |
| Identity Protection Standard | 09.03.044-4.0 | CISO | 16/07/2025 | Internal | Identity & Access |
| Risk Management Framework | 01.01.004-8.3 | Chief Risk Officer | 06/05/2026 | Internal | Governance |
| Azure Landing Zone (APAC) DDD v1.1 | ENV-ESLZ | Head of DT&A | 2026 | Internal | Configuration |
| Palo Alto Hub Firewalls As-Built V1.0 | ENV-PALO | Digital Operations | 22/07/2026 | Internal | Configuration |
| Azure ESLZ Naming Standard | ENV-NAMING | Digital Operations | 17/07/2026 | Internal | Configuration |
| APM DDD + TCD templates V0.1 | ENV-DOCSET | Head of DT&A / Digital Ops | 21/07/2026 | Internal | Configuration |
| Conditional Access policy set (116 policies) | ENV-CA | APM Cyber Security | 07/08/2026 | Internal | Configuration |
| ESLZ Reference Corpus (4 parts) | `reference/eslz/` | Head of DT&A | 2026 | Internal | Configuration |

Update this table and `policy-data.js` whenever a policy is added, replaced or superseded - old version, new version, and which designs need re-checking against it.

**Re-supplied duplicates (7 Aug 2026):** `uploads/Standard - Cryptography and Key Management` is 09.03.027-4.0 (we hold -5.0, no rule change) and `uploads/Compliance - RFFR and ISO-IEC 27001` is 09.03.055-1.0 (we hold -1.2). **Discrepancy to confirm:** the v1.0 Compliance Plan states an Essential Eight **Maturity Level 3** target under external obligations, while program context says ML2 - confirm which applies before any design cites a maturity level.

**Where source documents live.** Policy and standard PDFs are held here in `policies/`. Environment and as-built documents are in `reference/environment/`; the ESLZ corpus is in `reference/eslz/`; APM's own DDD, TCD, HLD and design-review templates are in `reference/apm-document-templates/`. `policy-data.js` `file:` paths point at those durable locations, never at `uploads/` - re-copy and rewire whenever a new source arrives, because `uploads/` is upload scratch space and its contents are disposable.

## Named in these policies but not yet held

Still missing after the 7 Aug 2026 intake (the load-bearing ones bold): **Information Asset Classification & Handling Standard**, **Patch and Vulnerability Management Standard**, **Information Security Code of Practice**, Information Security Policy, Information Systems Backup and Archiving Standard, IT Asset Management Standard, Security Standards for Third Parties Engaging with APM Policy (referenced by IAM \u00a74.2.2), Physical IT Asset Security Standard, Information Security Roles and Responsibilities Standard, External Supplier Security Standard, Disaster Recovery Plan, Business Continuity Plan. Ask for these before writing a design that claims alignment with them. Now held from the previous missing list: Identity and IT Access Management Standard, Risk Management Framework.

## Rules

- **Ingest the whole document before using it.** Read every sheet/section, not just the ones that sound relevant - `9_Application_Control`, `10_ASR_Rules` etc had zero name-based hits for terms like "LAPS" even after a targeted search, and the only way to be sure was to have already read the whole thing.
- **A design "adds" a control on top of a standard, or "excludes" one from it - never both for the same policy object.** If a design needs a tighter variant of a standard policy (kiosk Application Control did), that's a **new policy object replacing the assignment**, filed once under "kiosk-additional", not left in the standard's "inherited unchanged" list too. `templates/detailed-design/authoring/consistency-check.js`'s DUAL check catches this.
- **Quote settings, not summaries.** When a design claims alignment with a policy here, cite the actual setting name and value from this folder's source, in a table, per `guidelines/detailed-design-standard.md` rule 1 - never "meets the standard" without the row that proves it.
- **A superseded policy stays here with its version number**, so a design that cites V2.0 can still be checked against what V2.0 actually said, even after V3.0 replaces it.

## Two hardening standards, one for each device population

**Corporate staff: `APM-Windows-SOE-Hardening-Standard-V3.0.xlsx`.** Held exactly as APM supplied it, 11 policies, 748 controls, 568 met, 9 partial, 171 additional. This file is never edited to accommodate an Employment Services device. A design for a staff endpoint (laptop, AVD session host, developer or privileged workstation) cites this standard and these totals.

**Employment Services, customer-facing: `APM-Employment-Services-SOE-Hardening-Standard-V1.1.xlsx`.** A standard in its own right for devices used by participants rather than staff, built on the same sheet format so an auditor reads both the same way. Covers the ES Participant Kiosk now and the ES take-home device next; expect further ES designs to cite it.

**V1.1 adds three ES exceptions to the security baseline (tab 5, rows 562-564): `DevicePasswordEnabled`, `DevicePasswordHistory` and `MinDevicePasswordLength`.** `DevicePasswordEnabled` is the setting that prevents unattended AutoLogon, and its polarity hides it: in the DeviceLock CSP **0 means a password IS required**, so a row reading `Enabled` is the blocker. While a device password is required the credential provider demands input and Windows performs no automatic logon at all, whatever `AutoAdminLogon` and the Winlogon LSA secret hold. The security baseline now carries thirteen changed control rows, not ten.

The two are kept apart deliberately. An ES device has no corporate user identity, is used by a member of the public, and carries exceptions a staff endpoint would never be granted (removable media open, no inactivity lock, no credential prompt on wake). Folding those into the corporate standard would misstate the corporate compliance position, and folding the corporate figures into an ES report would misstate the ES one.

**What the ES standard changes from the corporate baseline it derives from:**
- **OS baseline** replaced by `APM-W11-SEC-Baseline-ESKiosk-P-1.0`: a copy of corporate `APM-W11-SEC-Baseline-P-1.2` with ten rows changed for unattended AutoLogon (rows 11, 12, 15, 16, 111, 456, 457, 607, 608, 627). Five are ES exceptions to ASD or Microsoft guidance, three are corporate additional hardening not applied, and one (UAC elevation for standard users) is **stricter** than corporate.
- **Removable media** exceptions, because participants carry documents on USB and the fleet has no printing.
- **Edge Dev Exception, Edge Hardened A11y and Edge Hardened LastPass excluded**: all three are user-scoped exception groups, and this fleet has no user identity to place in one.

**Companion evidence:** `ES-Kiosk-Baseline-Change-Record.xlsx` (APM's own change record) and `APM-W11-SEC-Baseline-ESKiosk-P-1.0.json` (the Intune export as built, 427 top-level settings). The JSON is the as-built evidence; the workbook tab is the auditable control statement.

**Two open items recorded on the ES tab itself, not resolved:** row 608 at `0` removes the failsafe inactivity lock, leaving the ten-minute watchdog restart as the only session terminator (APM Cyber Security), and row 111 needs confirming on the reference device because `DisableAutomaticRestartSignOn` and `AutoAdminLogon` are separate mechanisms (APM Solution Engineer).

**Unresolved in the corporate standard, inherited by the ES one:** the workbook names its Windows 11 benchmark inconsistently - cover sheet says v24H2, Report sheet says v23H2. Do not pick one; cite it as unreconciled and refer it to the standard's owner.
