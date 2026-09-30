# Export Manifest (Part 2 index)

This export is a self-contained, anonymised migration package for the APM AVD program. All individual names are reduced to roles; the delivery party is "Twiki Corp" / "the project team"; delivery-side suppliers are referred to by function; references to the delivery consultancy's own brand are stripped entirely. Technology product vendors (Microsoft, Nerdio, Zscaler, Dell, Palo Alto, Cisco Meraki) are retained as architecture.

## Folder layout
```
Project_Export/
  PASTE_INTO_NEW_PROJECT.md      (handover prompt - paste into the destination project)
  00_Context_Brief.md            (Part 1 - prose briefing)
  99_Manifest.md                 (this file)
  APM_AVD_Program_Plan.xlsx      (live working plan - Gantt bars + native chart)
  artifacts/
    01_DDD_JobSeeker_v1.0.md
    02_DDD_StandardUser_v0.1.md
    03_DDD_Developer_v0.1_DRAFT.md
    04_DDD-Template_v0.1.md
    05_Program_Plan.md
    06_KB_Standard.md
    07_KB_Gaps_Deviations_MSLearn.md
    08_KB_Template.md
    09_KB_Builder_Tooling.md
    10_Decisions_and_Open_Items.md
    kb/                          (15 knowledge-base / runbook articles)
    kb-specs/                    (14 JSON source specs for the KB articles)
    images/                      (5 diagrams + template_chrome/ branding)
```
The live workbook `APM_AVD_Program_Plan.xlsx` (Gantt bars + native chart) is included in the export root; its sheet data is also reproduced verbatim in `artifacts/05_Program_Plan.md`.

## Numbered manifest of exported artifacts

| # | Artifact | Type | Version | Last updated | Export file |
| --- | --- | --- | --- | --- | --- |
| 1 | Job Seeker Kiosk & AVD Solution — Detailed Design | Design doc | V1.0 | 23 Jun 2026 | artifacts/01_DDD_JobSeeker_v1.0.md |
| 2 | Standard User SOE on AVD — Detailed Design | Design doc (draft) | V0.1 | 15 May 2026 | artifacts/02_DDD_StandardUser_v0.1.md |
| 3 | Developer SOE — Detailed Design | Design doc (draft) | V0.1 DRAFT | 10 May 2026 | artifacts/03_DDD_Developer_v0.1_DRAFT.md |
| 4 | Detailed Design Document — blank template | Template | V0.1 | 15 May 2026 | artifacts/04_DDD-Template_v0.1.md |
| 5 | AVD Program Plan & Gantt (workbook) | Plan / tables | built 23 Jun 2026 | 23 Jun 2026 | artifacts/05_Program_Plan.md (+ .xlsx in parent) |
| 6 | APM KB Article Standard | Standard | — | 28 May 2026 | artifacts/06_KB_Standard.md |
| 7 | Job Seeker KB — Gaps, Deviations & MS Learn Validation | Validation log | — | 28 May 2026 | artifacts/07_KB_Gaps_Deviations_MSLearn.md |
| 8 | APM KB Template | Template | — | 28 May 2026 | artifacts/08_KB_Template.md |
| 9 | KB Builder skill (SKILL.md, build_kb.py, spec.example.json) | Tooling / config | — | 28 May 2026 | artifacts/09_KB_Builder_Tooling.md |
| 10 | CN-JSK-01 Initial Kiosk Build (Device Build Partner) | Runbook | — | 29 May 2026 | artifacts/kb/CN-JSK-01-Initial-Kiosk-Build.md |
| 11 | CN-JSK-02 Replacement Kiosk Build | Runbook | — | 29 May 2026 | artifacts/kb/CN-JSK-02-Replacement-Kiosk-Build.md |
| 12 | CN-JSK-03 Process Returned Device | Runbook | — | 29 May 2026 | artifacts/kb/CN-JSK-03-Process-Returned-Device.md |
| 13 | CN-JSK-04 Asset Register Stock | Runbook | — | 29 May 2026 | artifacts/kb/CN-JSK-04-Asset-Register-Stock.md |
| 14 | KB-JSK-01 Credential Model Support Overview | KB article | — | 29 May 2026 | artifacts/kb/KB-JSK-01-Credential-Model-Support-Overview.md |
| 15 | KB-JSK-02 Job Seeker Cannot Sign In | KB article | — | 29 May 2026 | artifacts/kb/KB-JSK-02-Job-Seeker-Cannot-Sign-In.md |
| 16 | KB-JSK-03 Single Device Password Rotation | KB article | — | 29 May 2026 | artifacts/kb/KB-JSK-03-Single-Device-Password-Rotation.md |
| 17 | KB-JSK-04 Fleet-Wide Password Rotation | KB article | — | 29 May 2026 | artifacts/kb/KB-JSK-04-Fleet-Wide-Password-Rotation.md |
| 18 | KB-JSK-05 Replace Faulty Kiosk Device | KB article | — | 29 May 2026 | artifacts/kb/KB-JSK-05-Replace-Faulty-Kiosk-Device.md |
| 19 | KB-JSK-06 Retire Kiosk Device | KB article | — | 29 May 2026 | artifacts/kb/KB-JSK-06-Retire-Kiosk-Device.md |
| 20 | KB-JSK-07 Onboard New Kiosk Device | KB article | — | 29 May 2026 | artifacts/kb/KB-JSK-07-Onboard-New-Kiosk-Device.md |
| 21 | KB-JSK-08 Monthly Golden Image Patch | KB article | — | 29 May 2026 | artifacts/kb/KB-JSK-08-Monthly-Golden-Image-Patch.md |
| 22 | KB-JSK-09 Push Policy Change | KB article | — | 29 May 2026 | artifacts/kb/KB-JSK-09-Push-Policy-Change.md |
| 23 | KB-JSK-10 Suspected Compromise (Incident Response) | KB article | — | 29 May 2026 | artifacts/kb/KB-JSK-10-Suspected-Compromise-IR.md |
| 24 | KB-AVD Standard User SOE Support Overview | KB article | — | 28 May 2026 | artifacts/kb/KB-AVD-Standard-User-SOE-Support-Overview.md |
| 25 | Job Seeker network — logical diagram | Diagram (PNG) | — | — | artifacts/images/JobSeeker_Network_Logical_Diagram.png |
| 26 | Job Seeker — Zscaler interaction sequence | Diagram (PNG) | — | — | artifacts/images/JobSeeker_Zscaler_Interaction_Sequence.png |
| 27 | APM Business Capability Model — Core Services | Diagram (PNG) | — | — | artifacts/images/APM_Business_Capability_Model_CoreServices.png |
| 28 | Generic Reference Architecture Toolkit | Diagram (PNG) | — | — | artifacts/images/Generic_Reference_Architecture_Toolkit.png |
| 29 | Generic Technology Reference Model | Diagram (PNG) | — | — | artifacts/images/Generic_Technology_Reference_Model.png |
| 30 | Decisions & Open Items (working-session context) | Notes / decisions | — | 23 Jun 2026 | artifacts/10_Decisions_and_Open_Items.md |
| 31 | KB source specs (14 JSON files) | Source / config | — | 29 May 2026 | artifacts/kb-specs/*.json |
| 32 | AVD Program Plan & Gantt (live working file) | Plan (.xlsx) | built 23 Jun 2026 | 23 Jun 2026 | APM_AVD_Program_Plan.xlsx |
| 33 | Handover prompt for the destination project | Prompt | — | 23 Jun 2026 | PASTE_INTO_NEW_PROJECT.md |

## Diagram descriptions

**25. Job Seeker network — logical diagram.** Left-to-right trust zones: *User Zone/Untrusted* (the job seeker), *Controlled Trusted* (kiosk devices on the isolated new VLAN, Intune-managed thin client, SSID "APM-KIOSK", no corporate/public internet), *Public Internet Breakout* (outbound HTTPS 443), *Perimeter Edge Zone* (private endpoint), and *Controlled Restricted Zone* (a new resource group and Azure VNet in Australia East containing the VDI subnet, Entra, Key Vault, an Azure Function App, and a Palo Alto firewall, with a Zscaler agent on the VDI). On the right, Zscaler ZIA and the internet connect over an IPSEC tunnel. Shows the kiosk-to-AVD path and the private-endpoint and Palo Alto/Zscaler controls.

**26. Job Seeker — Zscaler interaction sequence.** A sequence/swimlane across Job Seeker → Kiosk → Palo Firewall → AVD Session → IPSEC Tunnel → Zscaler ZIA → Internet. Dashed lines are manual interactions (user logs into kiosk, initiates AVD session); solid lines are system interactions (Palo flow, traffic forwarded to the IPSEC tunnel, ZIA applies security policy, traffic exits to internet, browser displays permitted content).

**27. APM Business Capability Model — Core Services.** APM's employment-services business capability map across the participant journey: Engage, Assess & Enable, Navigate Life, Reconnect with Community, plus supporting capabilities (manage onboarding, assessments, job plans, appointments, billing/remittance, provider compliance, travel/logistics, suspensions). Business-architecture context carried in the design template.

**28. Generic Reference Architecture Toolkit.** A generic enterprise-architecture method diagram mapping audience (senior IT/EA leadership, solution architects, developers) against purpose (govern, guide, improve delivery): principles, reference models, standards, patterns, decision frameworks, implementation guides, working prototypes, reusable source code. Illustrative content from the design template.

**29. Generic Technology Reference Model.** A stock "Customer Technology Platform Technology Reference Model" (points of interaction, applications, cross-CX technologies, supporting business platforms, integration/orchestration, data fabric, network/infrastructure, plus BI/analytics, security, system management). A vendor/analyst reference model used illustratively in the Standard User design.

## Anonymisation applied
- Individual personal names replaced with roles throughout.
- Delivery party rendered as "Twiki Corp" / "the project team".
- Delivery-side suppliers rendered by function: the **Device Build Partner** (device wipe/prep/build/ship), the **managed network service provider** (Zscaler tunnel), the **licensing reseller**.
- References to the delivery consultancy's own brand stripped.
- A document owner email reduced to `[redacted]@apm.net.au`.
- Technology product vendors retained as architecture (Microsoft, Nerdio, Zscaler, Dell, Palo Alto, Cisco Meraki).
- **Judgment call to confirm:** the three delivery-side supplier names were anonymised on the basis of "strip internal supplier/consultancy names". If any should be named in the destination workspace, say so and I will reinstate them.

## Not exported (and why)
1. **Original .docx source files** are not attached. Office documents carry author/owner metadata and tracked identities; they were converted to anonymised Markdown instead. (The program-plan workbook `.xlsx` is generated content with owners anonymised to role, so it **is** included in the export root.)
2. **Duplicate KB set** `KB-JobSeeker/New Folder With Items/` — byte-for-near-identical copies of artifacts 10–23; not exported separately to avoid duplication.
3. **Native Gantt bars and chart** in the workbook are visual; the underlying data is exported verbatim in artifact 05, but the rendered chart and conditional-format bars live only in the `.xlsx`.
4. **Template branding images** (cover photo, logos, page decorations — 25 files) were moved to `artifacts/images/template_chrome/` and are not described individually; they carry no project content.
5. **"To be inserted" diagram placeholders** in the Standard User and Developer drafts had no underlying image to export; the drafts mark them as pending.
