# APM ESLZ Reference Corpus — complete contents

Full verbatim dump of the `apm-eslz-reference` Claude skill (19 files, ~26,000 words).
Every file below is reproduced exactly as it exists in the skill package, including its
YAML frontmatter. Nothing summarised, nothing omitted.

**What this is.** A queryable knowledge pack for the APM (Advanced Personnel Management)
Azure Enterprise-Scale Landing Zone. It records ratified architectural decisions,
standards, address plans and known defects so every project touching APM works from the
same source of truth.

**Classification.** APM operates at RFFR PROTECTED. The corpus is sanitised to schemes,
patterns and ratified decisions, but it still carries subscription GUIDs, tenant root MG
ID, internal RFC 1918 addressing, Terraform state account and service-connection names.
Handle accordingly.

**Baseline provenance.** Ingested 2026-07-21 to 2026-08-02. Records the state delivered
by SoftwareOne ("Stratus" program, Stream01 16 Dec 2025 + Stream03 17 Jul 2026), captured
before APM remediation. Files marked `baseline: partner-delivered` preserve known defects
deliberately. Those defects are catalogued in the Remediation Register (file 16).

---

## File index

| # | Path | Scope |
|---|---|---|
| 1 | `SKILL.md` | Index, ground rules, baseline provenance, ingest workflows |
| 2 | `architecture/topology.md` | Dual-region hub-spoke, NVA placement, peering, perimeter |
| 3 | `architecture/landing-zones.md` | MG hierarchy, 14 subscriptions + IDs, RGs, locks |
| 4 | `architecture/connectivity.md` | UDRs, private DNS, private endpoints, public IPs |
| 5 | `architecture/firewall-nva.md` | Palo Alto VM-Series as-built, Panorama, Zscaler, IaC |
| 6 | `architecture/identity-rbac.md` | Entra tenancy, custom roles, group scheme, PIM posture |
| 7 | `architecture/platform-services.md` | LAW split, diagnostics, AUM rings, cost, storage, KV |
| 8 | `architecture/resilience-dr.md` | Regions/AZs, DC redundancy, backup vaults and policies |
| 9 | `architecture/integration-services.md` | APIM / Boomi / AI Gateway design intent (no as-built) |
| 10 | `architecture/ai-landing-zone.md` | ES AI Landing Zone TCD v0.5 (authoritative AI config) |
| 11 | `ipam/address-plan.md` | 10.40/10.50 supernets, VNet and subnet tables, reservations |
| 12 | `policies/policy-baseline.md` | 218 deployed policy/initiative assignments |
| 13 | `policies/governance.md` | Compliance frame, operating model, DD1-DD81 register |
| 14 | `standards/naming.md` | Resource naming convention, abbreviation registry |
| 15 | `standards/tagging.md` | 13 mandatory tags, enforcement, discrepancies |
| 16 | `references/remediation-register.md` | 45 source defects + 16 CAF/ALZ deviations |
| 17 | `references/ai-lz-reconciliation.md` | AI LZ vs ESLZ reconciliation R1-R25 |
| 18 | `references/curation-guide.md` | Rules for curating new deliverables into the corpus |
| 19 | `scripts/ingest.py` | docx/pdf/xlsx extraction script for Workflow B |

---

## Known gaps in the corpus (candidates for addition)

The corpus itself flags these as not yet ingested or unresolved:

1. **ExpressRoute / VPN cross-premises design** — hub GatewaySubnets exist, the design
   document is outstanding.
2. **DR decision paper** — a ratified multi-zone single-region (Australia East) posture
   is believed to supersede the Australia Southeast regional-pair model in Detailed
   Design v1.1. Not ingested. Two files carry conflicting positions.
3. **Policy uplift paper** — ISM control mappings, Essential Eight framing, ownership and
   review cadence. Not ingested.
4. **DevOps decisions DD87-DD95** — deferred to the DevOps Wiki, never imported.
5. **APIM / Boomi / AI Gateway as-built** — only v0.1 review-stage design intent exists.
6. **AI LZ TCD v0.5 approval** — "de-facto as-built once approved"; approval not evidenced.
7. **Palo Alto As-Built v1.0 endorsement** — marked "Ready for APM to Review & Endorse";
   endorsement not evidenced, sign-off dates absent.
8. **Firewall DNS and NTP servers** — TBC at handover, pending Infrastructure team.
9. **No IPAM system** (accepted risk RS07) — the address plan document is the system of
   record; nothing machine-readable exists.
10. **Open Decision Register OD-01..OD-08 and control set C-01..C-08** — referenced but
    the companion Excel control matrix is not in the corpus.

---



# FILE 1 of 19 — `SKILL.md`

---
name: apm-eslz-reference
description: Canonical reference corpus for the APM Azure Enterprise-Scale Landing Zone (ESLZ) — architecture, network topology, policies, naming and tagging standards, and IP address management. Consult this skill whenever a task touches the APM environment in any way, including designing or reviewing anything deployed into the APM ESLZ, answering questions about APM's Azure architecture, subscriptions, hub-spoke topology, Palo Alto NVAs, connectivity, Entra ID/RBAC model, Azure Policy baseline, naming conventions, tagging, or IP allocations — even if the user doesn't say "ESLZ" and just mentions APM, the landing zone, or a specific APM workload. Also use this skill when the user wants to ADD or UPDATE a document in the reference corpus ("ingest this into the APM reference", "update the naming standard", "add this design to the knowledge pack").
---

# APM ESLZ reference corpus

This skill is the canonical, queryable knowledge pack for the APM Enterprise-Scale Landing
Zone. It exists so that every project touching APM works from the same set of ratified
architectural decisions, standards, and address plans — instead of re-deriving them or
contradicting a published deliverable.

Two workflows live here: **referencing** (the common case) and **ingesting** (maintenance,
when a deliverable is published or revised).

## Ground rules

1. **The markdown in this skill is the working truth; the branded Word/PDF deliverables are
   the client artefacts.** If they disagree, the deliverable that APM has ratified wins — flag
   the discrepancy to the user and offer to re-ingest.
2. **Load only what the task needs.** This SKILL.md is an index. Do not bulk-read the corpus;
   read the specific file(s) the index points to.
3. **Classification.** APM operates at RFFR PROTECTED. Corpus files are sanitised to
   schemes, patterns, and ratified decisions. Do not add live PROTECTED operational data
   (actual firewall rulebases, credentials, live address assignments beyond the published
   plan) during ingest — see `references/curation-guide.md`.
4. **Currency.** Every corpus file carries a frontmatter block with `source_document`,
   `source_version`, and `ingested` date. Cite these when the answer depends on a decision
   ("per the Logging Architecture Decision Paper v1.2"). If a file's source version looks
   stale relative to what the user says, ask before relying on it.
5. **IPAM currency.** APM has no dedicated IPAM system; the ratified address plan document
   is the system of record, and `ipam/address-plan.md` carries it in full — supernets,
   per-landing-zone blocks, and subnet allocations. Its authority is only as current as its
   `source_version`; if the user indicates allocations have changed since that version,
   treat the file as stale and offer re-ingest rather than answering from it.

## Baseline provenance

**The corpus as ingested on 2026-07-21 records the ESLZ baseline state as delivered by
the delivery partner** (SoftwareOne, "Stratus" program — Stream01 build of 16 Dec 2025
plus Stream03 continuous-improvement additions of 17 Jul 2026), captured from the
partner's deliverables *before* APM's source remediation. Files carrying
`baseline: partner-delivered` in frontmatter reflect this state, **including its known
defects and internal inconsistencies** — these are deliberately preserved, not corrected,
so the corpus is a faithful record of what was handed over.

Known defects and CAF deviations in the baseline are catalogued in
`references/remediation-register.md`. When answering from a baseline file, treat items
listed in that register as suspect and say so. When APM remediates a source document and
it is re-ingested, update the affected file's frontmatter: replace the `baseline` marker
with `supersedes: partner-delivered baseline (2026-07-21)` so the departure from the
handover state is recorded rather than silently overwritten.

## Corpus index

Read the file(s) relevant to the task. One-line scope notes below; each file has its own
table of contents if long.

### architecture/
- `architecture/topology.md` — Dual-region hub-spoke (AUEA/AUSE), Palo Alto NVA
  placement, peering + east-west/north-south inspection model, sandbox isolation,
  perimeter decisions (DDoS/AppGW/WAF/NSG/Front Door/Bastion).
- `architecture/landing-zones.md` — Full MG hierarchy with as-built subscription
  placement and IDs, subscription archetypes and purposes, environment segregation,
  resource group strategy, resource locks, guiding principles.
- `architecture/connectivity.md` — UDR/forced-tunnelling design, central private DNS
  zones, private endpoint and service endpoint patterns, public IP stance, Network
  Watcher, egress/backhaul summary. (ExpressRoute/VPN and Boomi MCS IPsec designs not
  yet ingested.)
- `architecture/firewall-nva.md` — Palo Alto VM-Series as-built (Firewall Deployment
  As-Built v1.0): fleet/SKUs/PAN-OS, dual N-S/E-W sets behind Azure LBs (no PAN-OS HA),
  inspected flows (Zscaler egress, Meraki SD-WAN backhaul, legacy-LZ east-west),
  interfaces/zones/VRs, Panorama HA + log forwarding to Sentinel, baseline policy
  pattern, DevOps/Terraform deployment and DR redeploy.
- `architecture/integration-services.md` — APIM/Boomi/AI Gateway platform (three DDDs
  v0.1 + BoomiChanges note; **DESIGN INTENT ONLY, no as-built**): APIM Premium v2
  build/injection/dedicated VNet, services MG placement + relocation, Boomi MCS IPsec
  VPN + addressing, AI Gateway policy set/Foundry egress boundary, traffic inspection
  matrix, DR-by-IaC, consolidated open items and cross-document consistency flags.
  AI Gateway egress/logging model partially superseded by the ES AI LZ DDD v2.4.
- `architecture/ai-landing-zone.md` — Enterprise-Scale AI Landing Zone (**TCD v0.5
  AUTHORITATIVE** over DDD v2.4 over AI Gateway DDD; near-as-built technical
  configuration, approval pending): Foundry ×8 on the EXISTING workload
  subscriptions, Custom VNet injection (managed VNet prohibited), E-W internal
  inspection with internet egress via N-S + Zscaler, concrete agent/PE/gateway-tier
  addressing (10.40.120–130 carve-outs), PaaS inventory + naming (aif/cosno/srch/
  apim/wafpol proposed), sg-ailz-* RBAC/PIM/CA model, guardrail stack + authN model,
  OD-01..08, C-01..08, two-tier logging, RA-01 DR, waves, TCD internal-contradiction
  flags.
- `references/ai-lz-reconciliation.md` — Point-in-time reconciliation (21 Jul 2026) of
  AI LZ DDD v2.4 against the corpus: conflicts R1–R6, deviations R7–R12, ESLZ build
  dependencies R13–R20, unverifiable R21–R25. Preamble tracks later resolutions
  (R3/R5/R8/R17/R21/R24 updated by the firewall as-built and TCD v0.5 ingests).
  Consult when planning AI LZ build activities.
- `architecture/identity-rbac.md` — Entra tenancy + hybrid identity, RBAC built-in and
  custom roles, cloud-only security group scheme and assignment scopes, PIM/JIT/break-
  glass posture, managed identities, known IAM compliance gaps.
- `architecture/platform-services.md` — Operational vs security LAW separation and
  retention, diagnostics/alerting/DCRs/workbooks, AUM three-ring patching, change
  tracking, cost management/budgets, storage design, key vault standards.
- `architecture/resilience-dr.md` — Regions/AZ posture, DC redundancy, backup vault
  strategy and tag-driven backup policy tiers, SQL/PaaS backup, DR tiers per service.
  CURRENCY FLAG: carries Detailed Design v1.1 dual-region posture; the multi-zone
  single-region decision paper is not yet ingested.

### policies/
- `policies/policy-baseline.md` — Deployed policy/initiative assignments (218, per the
  Assignment List Record, Stream03 Jul 2026): scope model, naming families, full
  MG-scoped assignment table, per-subscription ASC/backup patterns.
- `policies/governance.md` — Compliance frame (RFFR/ISM/MCSB), policy operating model
  and ServiceNow exemption path, design decision register DD1-DD81, security standards
  decisions, known compliance gaps. (Policy uplift paper not yet ingested.)

### standards/
- `standards/naming.md` — Resource naming convention (CAF-derived), Azure DevOps project
  naming schema, abbreviation registry.
- `standards/tagging.md` — 13 mandatory tags with values and enforcement (APM025/030/031),
  RG-inheritance model, backup/update-stage automation tags, source discrepancies.

### references/
- `references/remediation-register.md` — Known defects in the partner-delivered baseline
  (45 source discrepancies incl. A5 Palo Alto As-Built items) and CAF/ALZ deviations
  affecting codification (16). Consult before treating any baseline claim as
  authoritative; update as items are remediated.
- `references/curation-guide.md` — Curation rules for Workflow B (existing).

### ipam/
- `ipam/address-plan.md` — 10.40/10.50 supernets, per-subscription allocations, full
  VNet CIDR + subnet tables (planned and as-built), sizing rules. Source: Detailed
  Design v1.1 (no separate ratified address plan ingested; see ground rule 5).

Files not yet populated contain a `status: stub` frontmatter flag and a note of what belongs
there. If the answer lives in a stub, tell the user the corpus doesn't cover it yet and
offer to ingest the source document.

## Workflow A — answering with the corpus

1. Identify which index entries the task touches (often one or two; rarely more than three).
2. Read those files. Check their frontmatter for version/currency.
3. Answer, citing the source deliverable and version for any decision-dependent claim.
4. If the task exposes a gap or a conflict with newer information from the user, say so
   explicitly and offer the ingest workflow.

## Workflow B — ingesting or updating a document

Run this when the user supplies a new or revised deliverable (docx, PDF, or xlsx matrix).

### 1. Extract

```
python3 scripts/ingest.py <source-file> --out staging/
```

The script produces `staging/<slug>.md`: raw markdown with document-control boilerplate
heuristically stripped, tables preserved, and a frontmatter header recording source
filename, detected version/date, and extraction method. For xlsx it emits one markdown
table per sheet. Extraction is deliberately raw — curation is the next step, not the
script's job.

### 2. Curate

Read `references/curation-guide.md`, then transform the staged markdown into corpus
content. In brief: keep decisions, standards, tables, rationale; drop executive framing,
sign-off pages, revision histories, branding; sanitise per the classification rules; split
content across the corpus taxonomy above rather than mirroring the source document's
structure (one deliverable often feeds several corpus files).

### 3. Review and commit

Show the user a summary of what changed per corpus file (a diff if updating) **before**
writing final content. On approval, write to the corpus directories, update each touched
file's frontmatter (`source_version`, `ingested`), and remove the staging file. Remind the
user to commit the skill directory to Git if it is under version control.

**If the skill directory is read-only** (in Cowork the installed skill is a cached,
read-only copy — writing to it does not change the saved skill), committing curated
content in place will silently fail or land outside the skill, where Workflow A will
never find it. Instead: copy the whole skill to a writable working area, apply the
changes there, zip the folder as `apm-eslz-reference.skill` (or use skill-creator's
`package_skill.py`), and present the `.skill` file so the user can click **Save skill**
to reinstall the updated version. Tell the user explicitly that the corpus is only
updated once they reinstall the package.

### 4. Index maintenance

If ingest created a new file or materially changed a file's scope, update the one-line
description in this SKILL.md's index so Workflow A keeps routing correctly.

---


# FILE 2 of 19 — `architecture/topology.md`

---
status: active
source_document: APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx; Palo Alto Firewall Deployment As-Built_V1.0.docx; APIM/Boomi/AI DDD set + BoomiChanges (design intent — see architecture/integration-services.md)
source_version: DD 1.1 (17 July 2026); Palo Alto As-Built 1.0 (12 Dec 2025)
ingested: 2026-07-22
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
---

# Network topology — hub-spoke, NVA inspection, perimeter

## Hub-spoke model

Dual-region: **Australia East** (`auea`, 10.40.0.0/16) and **Australia Southeast**
(`ause`, 10.50.0.0/16) — DD11 allocates two regional CIDRs. One hub VNet per region
(`auea-vnet-connectivity-001`, `ause-vnet-connectivity-001`) in **aus-sub-connectivity**,
hosting the **Palo Alto VM-Series NVA firewalls**, VPN (GatewaySubnet), shared
Application Gateways, and the NVA load balancer. Spokes: Identity, Management,
{Prod,Dev,SIT,UAT} × {Controlled,Standard}, AVD (Controlled), Sandbox, Acquisitions —
in both regions.

## Peering and inspection model (DD13)

- Spokes peer only to their **regional hub** — no spoke-to-spoke peering. The two hubs
  peer to each other for inter-region connectivity.
- **East-West** (VNet-to-VNet, tier-to-tier) and **North-South** (internet and
  on-premises) traffic are both inspected by the hub Palo Alto NVA.
- Intra-subnet/tier isolation via NSGs (every subnet has a dedicated NSG).
- Hub-side peerings: "virtual network gateway or route server" Enabled; spoke-side
  Disabled. Both directions allow forwarded traffic.
- Peering naming `peer-<source-vnet>-to-<target-vnet>`; as-built pairs: hub↔identity,
  hub↔management, hub↔{prod,dev,sit,uat}-{ctrl,std}, hub↔avd, and auea-hub↔ause-hub —
  bidirectional, both regions.
- **Egress**: all spoke egress forced through the hub NVA via UDR 0.0.0.0/0 →
  VirtualAppliance (see `architecture/connectivity.md` for routing detail). Public IPs
  prohibited outside the Connectivity subscription (DD17).
- Per the Palo Alto As-Built v1.0: **legacy-LZ spokes also peer to the new regional
  hub** (E-W between new and legacy LZs in-region is inspected); only intra-region
  east-west is firewall-inspected; inter-region peerings exist solely to reach Panorama
  and the Meraki vMX in Australia East. Flow detail in `architecture/firewall-nva.md`.

## Sandbox isolation (DD12)

Sandbox VNets are fully isolated — no peering to hub or any VNet, enforced by initiative
`apm011-sandbox-guardrails` (APM011.1 at AUS-MG-SANDBOX; design also plans APM011.2 at
AUS-MG-ACQUISITIONS). Sandbox CIDRs may intentionally overlap other VNets.

## Hub subnet layout (per region)

GatewaySubnet (VPN), `snet-mgmt` (firewall management), `snet-public` / `snet-private` /
`snet-dmz` (NVA dataplane interfaces), plus as-built `snet-vmx-001` (10.40.0.160/27 /
10.50.0.160/27 — not in the design tables; deployed addition. Purpose confirmed by the
Palo Alto As-Built v1.0: hosts the Meraki vMX appliance interfaces for SD-WAN backhaul).
Full CIDRs in `ipam/address-plan.md`.

## Perimeter protection

| Control | Decision |
|---|---|
| Firewall (DD-firewall stream) | Palo Alto NVA in hub is the perimeter firewall — the only firewall between internal networks and public infrastructure (incl. Sandpit). Fleet, dual N-S/E-W sets, LB-based resilience, Panorama, inspection flows and IaC deployment: see `architecture/firewall-nva.md` |
| Azure DDoS Protection (DD77) | **Not onboarded** (no Network/IP Protection plan; application-dependent) |
| App Gateway + WAF (DD78) | **Shared App Gateways in the hub/connectivity subscription** by default; WAF per application need; dedicated gateways where justified (cost, RTO/RPO, throughput, config/RBAC, blast radius, compliance — per-app decisions in Stream 02). All HTTP listeners redirect to HTTPS. Not deployed in base LZ. Design intent (BoomiChanges, unratified): first internet-inbound flow Internet → AppGW WAF_v2 → N-S NVA → APIM for the SmartRecruiters webhook — see `architecture/integration-services.md` |
| NSGs (DD79) | Dedicated NSG per subnet; east-west/tier isolation; combined with UDRs forcing hub NVA inspection. 32 baseline NSGs deployed across both regions |
| Azure Front Door (DD80) | Not in base LZ; later per application. Regardless: port 80 blocked at firewall, HTTPS-only policy on App Service/Functions |
| Azure Bastion (DD81) | **Not onboarded** — management access via jump hosts in `snet-mgmt-jumphost` (Management VNet) instead |

Layered model: Palo Alto NVA + NSGs + peering segmentation + (per-app) AppGW/WAF/Front
Door; Zero Trust orientation.

## Data-quality flags from source

(a) Design Table 27 hub rows mislabelled `auea-` against 10.50.x CIDRs; (b) planning
tables use `-pl-` subnet names, deployed state uses `-pe-`; (c) `snet-vmx-001` deployed
but undocumented in planning tables; (d) consistent `aquisitions` misspelling in resource
names (as deployed); (e) traffic-flow detail exists only as Figure 19 (image) in the
source — no textual flow matrix (partially remedied: textual flow description now in
`architecture/firewall-nva.md`).

Cross-references: firewall platform detail in `architecture/firewall-nva.md`;
routing/DNS/PE in `architecture/connectivity.md`; CIDR and subnet tables in
`ipam/address-plan.md`; NSG/peering-relevant policies in `policies/policy-baseline.md`.

---


# FILE 3 of 19 — `architecture/landing-zones.md`

---
status: active
source_document: APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx; APIM/Boomi/AI DDD set + BoomiChanges (design intent — see architecture/integration-services.md); APM_ES_AI_LZ_DDD v2.4 (design intent — see architecture/ai-landing-zone.md); APM_ES_AI_LZ_TCD v0.5 (authoritative AI config — see architecture/ai-landing-zone.md)
source_version: 1.1 (17 July 2026)
ingested: 2026-08-02
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
---

# Landing zones — management group hierarchy and subscription model

Per the Detailed Design v1.1 (DD62/DD63, Confirmed): structure follows the Microsoft ESLZ
model; 13 design subscriptions (14 as-built with AVD); billing for common resources
centralised in the foundational platform subscriptions. Tenant Root Group is not used
directly. "Permissions for creating new management groups" is enabled to prevent rogue
MGs. Complies with RFFR, ISM, and APM Policy.

## Management group hierarchy

- **Level 0 — Tenant Root Group** (`fa7adf0d-de2d-4570-8f5f-4bca4772988f`): not used
  directly; reserved for a possible future equivalent test tenant.
- **Level 1 — APM**: intermediate root; all subscriptions managed under it (existing
  transferred or new added via MCA).
- **Level 2**:
  - **AUS-MG-PLATFORM** — hosts platform sub-MGs.
  - **AUS-MG-REGION** — all Australia-region business workloads (Controlled/Standard).
  - **NZ-MG-Region / SG-MG-Region** — out of scope at this stage (naming reserved).
- **Level 3** (under PLATFORM): **AUS-MG-SECURITY** (security logs, Sentinel, security
  tools), **AUS-MG-MANAGEMENT** (platform logs, change tracking, inventory),
  **AUS-MG-IDENTITY** (AD domain controllers), **AUS-MG-CONNECTIVITY** (hub-spoke
  networking, Palo Alto firewall, DNS Private Resolver, VPN Gateway, Route Server).
- **Level 3** (under REGION): **AUS-MG-CONTROLLED** (RFFR-regulated applications),
  **AUS-MG-STANDARD** (all other corporate services), **AUS-MG-ACQUISITIONS** (future
  acquisitions; nothing deployed), **AUS-MG-SANDBOX** (experimentation; policy-isolated
  from production, control-plane and data-plane).
- **Level 4**: AUS-MG-{PROD|DEV|SIT|UAT}-CONTROLLED and
  AUS-MG-{PROD|DEV|SIT|UAT}-STANDARD.

### As-built subscription placement

| Subscription | ID | Management group |
|---|---|---|
| aus-sub-connectivity | 8f23887a-5cac-4932-8929-5c6fe0294808 | AUS-MG-CONNECTIVITY |
| aus-sub-identity | cd182761-4ab3-4eea-a44e-bc0e2c1bb5fd | AUS-MG-IDENTITY |
| aus-sub-management | 11e390a7-880a-4d2b-8d3e-d80af1138665 | AUS-MG-MANAGEMENT |
| aus-sub-security | db53478c-38ce-452f-bde8-f7714dc22b6f | AUS-MG-SECURITY |
| aus-sub-prod-controlled-001 | 1e1289ca-7095-45bc-979a-e703277083c3 | AUS-MG-PROD-CONTROLLED |
| aus-sub-dev-controlled-001 | 8a9c13a3-4f94-49b1-b836-2e99a054b239 | AUS-MG-DEV-CONTROLLED |
| aus-sub-sit-controlled-001 | 2c881ef2-3c86-40d5-87e0-925dc42633a4 | AUS-MG-SIT-CONTROLLED |
| aus-sub-uat-controlled-001 | a5ae6e09-aaca-495f-ab0d-e0f6129cee94 | AUS-MG-UAT-CONTROLLED |
| aus-sub-prod-standard-001 | 36734222-e894-4a89-ab88-c2ce8dff7477 | AUS-MG-PROD-STANDARD |
| aus-sub-dev-standard-001 | 6eb8010d-ba65-440f-a7f1-b23bb3b8d472 | AUS-MG-DEV-STANDARD |
| aus-sub-sit-standard-001 | f2c80fa1-4347-478f-8928-6b5cd0be0cd6 | AUS-MG-SIT-STANDARD |
| aus-sub-uat-standard-001 | 2261dc4e-22b0-4091-af9f-01a3c71b8eb6 | AUS-MG-UAT-STANDARD |
| aus-sub-sandbox-001 | 622aa236-084a-426d-af04-bc697a205c7c | AUS-MG-SANDBOX (as-built table shows path under APM — anomaly) |
| aus-sub-acquisitions-001 | 833a7841-b9a8-4cf6-ae93-0039fab7e9b9 | AUS-MG-ACQUISITIONS (as-built table shows AUS-MG-SANDBOX — anomaly) |
| aus-sub-avd-controlled-001 | fa8d54a6-5d67-4510-a97a-f59e30d42cec | 14th as-built subscription, not in the 13-subscription design table; path shown under APM — anomaly |

Source-table anomalies preserved verbatim for verification against the live tenant.

## Subscription model

Enrolment via MCA linked to the APM Entra tenant; all subscriptions are CSP-managed. The
APM Infrastructure Team controls subscription creation/deletion. Each subscription is an
administrative and scaling boundary. Principles: minimise subscription count; billing
boundaries expressed with resource groups and tags rather than extra subscriptions.

| Subscription | Purpose |
|---|---|
| aus-sub-connectivity | ER, vWAN, firewalls, VPN, DNS (private/public) |
| aus-sub-management | Dashboards, Log Analytics, Automation |
| aus-sub-identity | AD DS, monitoring, Key Vaults |
| aus-sub-security | Security logs, Microsoft Sentinel, security tools |
| aus-sub-{prod,dev,sit,uat}-controlled-001 | Workloads requiring RFFR compliance |
| aus-sub-{prod,dev,sit,uat}-standard-001 | Workloads not requiring RFFR |
| aus-sub-sandbox-001 | Sandpit for experimentation |
| aus-sub-acquisitions-001 | Placeholder for future acquisitions |
| aus-sub-avd-controlled-001 | AVD (as-built addition) |

### Environment segregation (DD64)

DEV, SIT, UAT, PROD each in own subscription with individual VNets in both regions.
DEV: synthetic data, developer-only access, **no on-prem connectivity, no APM data, no
on-prem enterprise identity connectivity**. SIT: simulated data. UAT: production-like
data, prod-identical config except data. PROD: real data, active users. All environments:
chargeback/showback, standardised policies.

## Resource group strategy (DD65/DD66)

Group by application affinity, then environment; separate RGs for dedicated
infrastructure vs shared services; RGs delegate administrative authority. Standard
per-region RG set (prefix `auea-`/`ause-`):

| RG pattern | Subscription | Purpose |
|---|---|---|
| [r]-rg-connectivity-net/admin/backup/palo/(meraki)/devops-001, [r]-rg-connectivity-dns-001 | connectivity | Network, admin, backup, Palo Alto (name must contain "palo"), Cisco/Route Server, DevOps, DNS |
| [r]-rg-identity-net/adds/backup/admin-001 | identity | Identity network, AD DS, backup, admin |
| [r]-rg-security-backup/audit/logs-001 | security | Backup, audit & compliance, centralised security logs |
| [r]-rg-management-monitoring/operations-law/sharedservices/devops-001 | management | Monitoring, LAW, shared services (incl. Key Vaults), CI/CD |
| [r]-rg-[env]-[ctrl/std]-net/shared/backup/(appname)-001 | workload subs | Per-environment networking, shared, backup, app RGs |

Application RGs: `[region]-rg-[env]-[domain]-[appname]-[instance]` (env codes incl. SBX).
As-built additions beyond the design tables: `-alertrules-` RGs in every subscription,
`auea-rg-management-tfstate-001` (Terraform state),
`auea-rg-management-paloaltotfstate-001`, `auea-rg-management-validation-001`,
`[r]-rg-management-net-001`, `[r]-rg-prod-ctrl/std-monitoring-001`, Azure-generated
`AzureBackupRG_australiaeast_1` and `NetworkWatcherRG`. Design table said `[r]-rg-dns-001`
but as-built is `[r]-rg-connectivity-dns-001`.

## Resource locks (DD67)

CanNotDelete locks at RG level in Connectivity, Security, Identity, Management, and
Production subscriptions covering networking resources (firewalls, VNets, VPN Gateway),
LAW, Key Vaults, and critical VMs (e.g. DCs). Enforced via APM006.1 (custom, APM scope)
and GEN04.1/.2 (Platform/Region). As-built: policy created; assignment pending
post-deployment completion. See `policies/policy-baseline.md`.

## Guiding principles

Cloud native focus; policy compliance; cost responsibility; environment segregation;
standardised operations; secure by design; reduced complexity; resilient design; minimal
customisation (Microsoft best practice, minimal deviation); centralised management
(GitHub + automated workflows); certification compliance (MCSB, RFFR, ISM, APM Policy).

Cross-references: policy assignments in `policies/policy-baseline.md`; RBAC scheme in
`architecture/identity-rbac.md`; network topology in `architecture/topology.md`; address
allocations in `ipam/address-plan.md`.

## Proposed changes — integration/AI services tier (design intent, not deployed)

The APIM/Boomi DDD set (v0.1, see `architecture/integration-services.md`) proposed a
new **AUS-MG-SERVICES** under AUS-MG-PLATFORM with subscriptions
`aus-prod-sub-services` / `aus-nonprod-sub-services`; the subsequent BoomiChanges note
renames the tier **AUS-MG-SHARED** and relocates it under **AUS-MG-REGION** (CAF
conformance: workload-facing tier out of the Platform inheritance path), and refers to
an APIM subscription as `aus-sub-apim-001`. Naming is not yet reconciled with the
tenant `aus-sub-<purpose>` convention and none of this exists in the as-built MG
hierarchy above — treat as pipeline, not landscape.

The AI LZ TCD v0.5 (`architecture/ai-landing-zone.md`, authoritative) resolves the AI
workload placement: the eight Foundry subscriptions are the EXISTING workload
subscriptions (prod/dev/sit/uat × controlled/standard — no new workload
subscriptions). The gateway tier remains open at OD-01: subscriptions `prod-shared` /
`non-prod-shared` (names still non-conformant with the `aus-sub-[env]-[domain]`
grammar) with target MG placement AUS-MG-PROD-CONTROLLED (prod) and an
AUS-MG-CONTROLLED child (non-prod) if created; the `nonprod` shared tier spans
dev/sit/uat, which still needs ratification against the DD64 four-environment model
(`references/ai-lz-reconciliation.md` R7/R8). Subscription vending baseline (ASC
Default, budgets, alerts, Network Watcher, backup policies) applies to any new
subscription.

---


# FILE 4 of 19 — `architecture/connectivity.md`

---
status: active
source_document: APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx; Palo Alto Firewall Deployment As-Built_V1.0.docx; APIM/Boomi/AI DDD set + BoomiChanges (design intent — see architecture/integration-services.md); APM_ES_AI_LZ_DDD v2.4 (design intent — see architecture/ai-landing-zone.md); APM_ES_AI_LZ_TCD v0.5 (authoritative AI config — see architecture/ai-landing-zone.md)
source_version: DD 1.1 (17 July 2026); Palo Alto As-Built 1.0 (12 Dec 2025)
ingested: 2026-08-02
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
---

# Connectivity — routing, DNS, private endpoints

Scope note: the Detailed Design covers intra-Azure routing, DNS, and private access
patterns; the Palo Alto As-Built v1.0 adds the firewall-side egress and inspection
detail (see `architecture/firewall-nva.md`). ExpressRoute/VPN cross-premises (on-premises) detail
is still NOT ingested — hub GatewaySubnets exist and the connectivity subscription
purpose lists ER/VPN, but that design document is outstanding. The **Boomi MCS IPsec
design is now ingested at design stage** (DDD v0.1, not as-built): new dedicated VPN
gateways in the hub (prod VpnGw2AZ active-active/BGP, non-prod VpnGw1AZ
active-passive), IKEv2/AES-256-GCM/SHA-384/DH20, N-S NVA inspection before encryption —
see `architecture/integration-services.md`.
Internet egress and on-prem backhaul as-built: outbound HTTP via IPsec tunnels to
Zscaler, non-HTTP SNAT out the firewall public interfaces, backhaul via Meraki SD-WAN
(legacy LZ, AUEA) with BGP routes into Azure.

## User-defined routes (DD16)

Every VNet has a dedicated route table (`[region]-rt-[env]-001`) associated to all its
subnets, carrying `0.0.0.0/0` → next hop **VirtualAppliance** (hub Palo Alto NVA) —
forces both north-south and east-west flows through inspection, prevents VNet-to-VNet
bypass, centralises logging. Route priority: UDR > BGP > System.

As-built route tables (route name "Routes-to-Firewall"; **Propagate gateway routes: No**):
`auea/ause-rt-connectivity-001` (2 subnet assocs each), `-rt-identity-001` (1),
`-rt-management-001` (1–2), `-rt-prod-ctrl-001` (5), `-rt-prod-std-001` (5). Next-hop IP
was placeholder 1.1.1.1 pending firewall deployment; per the Palo Alto As-Built v1.0 the
intended next hop is the **internal LB frontend in the hub private subnet**
(auea/ause-snet-private-001) fronting the E-W firewall backend pool — the as-built does
not state the frontend IP, so verify the live route table value before relying on it.

## DNS architecture (DD18)

Private DNS zones are created and managed **centrally in the connectivity subscription**
(RG `auea-rg-connectivity-dns-001`); no custom DNS servers (cloud-native resolution).
Spoke VNets are linked via VNet links so private endpoint FQDNs resolve consistently.
VNets currently use "Azure provided" DNS.

As-built zones (each with 6 VNet links — connectivity/identity/management in both
regions; auto-registration disabled): `privatelink.azurewebsites.net`,
`privatelink.blob.core.windows.net`, `privatelink.database.windows.net`,
`privatelink.file.core.windows.net`, `privatelink.mysql.database.azure.com`,
`privatelink.vaultcore.azure.net`. Custom zone naming scheme `[region]-pdz-[svc]-001`
exists in the naming standard for zone resources.

Private DNS zone creation is policy-controlled: APM001 (audit/deny Private Link private
DNS zones, APM scope), APM007.1/.2 (deny private DNS, Platform/Region).

Design-stage additions (unbuilt; AI LZ TCD v0.5 authoritative): new central zones
privatelink.services.ai.azure.com, privatelink.openai.azure.com,
privatelink.search.windows.net, privatelink.documents.azure.com (blob/vaultcore
already exist), VNet links from all eight AI workload VNets plus the new gateway-tier
VNets, and internal gateway names ai-gateway.prod.apm.internal /
ai-gateway.nonprod.apm.internal → AppGW private frontends. The earlier AI Gateway DDD
also required privatelink.cognitiveservices.azure.com — absent from the TCD list,
confirm. See `architecture/ai-landing-zone.md`.

## Private endpoints (DD20)

PEs are created **in the same subscription, VNet, and subnet as the consuming workload**
(dedicated `-pe-` subnets), traffic staying private via hub-spoke routing. Naming
`[region]-pep-[env]-[domain]-[descriptor]-[instance]`. As-built examples (management):
`auea-pep-management-aestmflowlog001-001` (10.40.255.68), `-aestmopsdiaglog001-001`
(10.40.255.69), `-auestppaloaltotfst001-001` (10.40.255.70), and AUSE equivalents — all
in `snet-mgmt-pe` subnets, blob sub-resource.

## Service endpoints (DD14/DD15)

Not used unless necessary — only where Private Link is unavailable and no data
exfiltration concern exists; mitigate via NVA filtering or service endpoint policies.
Enforced by APM028 (deny/audit service endpoints on subnets, APM scope).

## Public IPs (DD17)

Public IP creation denied everywhere except the Connectivity subscription. Initially only
the Palo Alto load balancer PIP; future shared AppGW/LB PIPs possible. Supporting
policies: APM003, GEN07, GEN03.

## Network Watcher (DD21)

One per subscription per region in `NetworkWatcherRG` (Azure default names retained —
`NetworkWatcher_australiaeast` / `_australiasoutheast`); deployed so far in management,
prod-standard, connectivity, identity per region. Used for connection monitoring,
topology, packet capture, and NSG/VNet flow logs (14-day retention in
`aestmflowlog001`/`asstmflowlog001` behind private endpoints; also connected to LAW;
Traffic Analytics not configured).

## Hybrid identity connectivity

On-premises AD (`ad.apn.net.au`) syncs to Entra via Entra Connect Sync; regional AD DS
IaaS VMs (2 per region) in the Identity subscription provide directory and DNS locally —
see `architecture/identity-rbac.md` and `architecture/resilience-dr.md`.

Cross-references: inspection model in `architecture/topology.md`; firewall platform,
traffic flows and Zscaler/Meraki integration in `architecture/firewall-nva.md`;
APIM/Boomi/AI design intent incl. VPN and central-DNS additions in
`architecture/integration-services.md`; subnet CIDRs in `ipam/address-plan.md`.

---


# FILE 5 of 19 — `architecture/firewall-nva.md`

---
status: active
source_document: Palo Alto Firewall Deployment As-Built_V1.0.docx (Stratus Phase 3, SoftwareOne); APIM/Boomi/AI DDD set + BoomiChanges (design intent — see architecture/integration-services.md); APM_ES_AI_LZ_DDD v2.4 (design intent — see architecture/ai-landing-zone.md); APM_ES_AI_LZ_TCD v0.5 (authoritative AI config — see architecture/ai-landing-zone.md)
source_version: 1.0 (12 Dec 2025; marked "Ready for APM to Review & Endorse" — endorsement not evidenced in the document)
ingested: 2026-08-02
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
---

# Palo Alto NVA firewall platform — as-built

Firewall-specific design for the hub Palo Alto VM-Series NVAs referenced by
`architecture/topology.md` (which previously flagged this workstream as not yet
ingested). Covers fleet, resilience model, traffic inspection and routing, Panorama
management, baseline policy pattern, and the IaC deployment method.

## Fleet and cluster model

Dual firewall sets per region, logically separated by traffic direction, each behind
Azure Load Balancers in the hub VNet (Connectivity subscription):

- **Australia East**: 4 × VM-Series NGFW — 2 × North-South (aefwppalo001/002,
  Standard_D8as_v5, 8 vCPU) + 2 × East-West (aefwppalo003/004, Standard_D16as_v5,
  16 vCPU); 4 load balancers; 2 availability sets; 1 Panorama (aefwppano01,
  Standard_D16as_v5).
- **Australia Southeast**: 2 × NGFW — 1 × North-South (asfwppalo001, Standard_E8-4as_v5)
  + 1 × East-West (asfwppalo002, Standard_D8as_v5); 4 load balancers; 2 availability
  sets; 1 Panorama (asfwppano01, Standard_D16as_v5).
- PAN-OS **11.2.7-h7** across all firewalls and Panorama at handover.

**Resilience: no traditional PAN-OS HA.** Firewall instances operate independently
behind Azure LBs; failure handling is via LB health probes removing a failed backend.
No shared session state — sessions re-establish on the surviving firewall. Panorama, by
contrast, runs true active/passive HA (see below).

**Licensing**: N-S firewalls — Advanced Threat Prevention, Advanced WildFire, Premium
Support. E-W firewalls — those plus Advanced DNS Security and Advanced URL Filtering.
Panorama — Premium + Device Management licence.

## Inspected traffic flows (ratified decisions)

APM decided the following flows are inspected in-line by the VM-Series:

1. East-West within the new landing zone (VNet-to-VNet via hub).
2. East-West between the new and legacy landing zones in the same region.
3. Outbound internet — including traffic to the **Zscaler Cloud Proxy**.
4. Traffic to/from **Meraki SD-WAN** (backhaul).

**Inbound (N-S) inspection**: required but **not enabled at handover** — no inbound
traffic initially; infrastructure is ready pending deployment of an external Azure LB
and route table. (Design intent since handover: the first inbound flow — SmartRecruiters
webhook — is designed as Internet → AppGW WAF_v2 → N-S NVA → APIM, an AppGW-fronted
path rather than the external-LB provision above; unreconciled — see
`architecture/integration-services.md`.)

## Traffic flow and routing detail

- **Outbound from private subnets**: spoke/landing-zone UDRs (0.0.0.0/0 →
  VirtualAppliance) direct traffic to the **internal LB frontend** in the hub private
  subnet (shared with firewall private interfaces); LB rules forward all TCP/UDP ports
  to the firewall backend pool. Outbound **HTTP traffic egresses via IPsec VPN tunnels
  to Zscaler**; **non-HTTP** traffic is SNAT'd to the firewall public interface, then
  Azure applies a second SNAT via the PIPs attached to the public interfaces before
  internet egress.
- **East-West**: all inter-VNet traffic routed via the E-W set — UDR to internal LB, then
  to the destination VNet through the firewalls.
- **Backhaul**: all backhaul traffic goes to the **Meraki SD-WAN in the legacy landing
  zone (Australia East)**; Meraki advertises BGP routes into Azure; inspected traffic is
  forwarded to the active Meraki vMX. The hub `snet-vmx-001` subnets host the vMX
  appliance interfaces (resolves the "undocumented vmx subnet" flag in
  `architecture/topology.md`).
- **Firewall management egress**: VM-Series management traffic destined to the internet
  routes via the private subnet LB and is filtered by the E-W set before egress.
- **Peering**: new and legacy spoke VNets peer to the new regional hub; only intra-region
  east-west is firewall-inspected. Inter-region peerings exist solely for reaching
  Panorama and the Meraki vMX in Australia East.
- Route priority: UDR > BGP > System (consistent with `architecture/connectivity.md`).

## Interfaces, zones, virtual routers

Dataplane interfaces take Azure DHCP-delivered addresses statically reserved on the
vNICs. Scheme (per region; concrete IPs sit inside the hub subnet plan in
`ipam/address-plan.md`):

| Interface | Subnet | Zone | Virtual router | Notes |
|---|---|---|---|---|
| mgmt | snet-mgmt | — | — | e.g. 10.40.0.36/.37 (AUEA N-S pair); Panorama servers 10.40.0.40 / 10.50.0.40 |
| ethernet1/1 | snet-public | Public | N-S: VR-Public; E-W: single VR | LB health-probe mgmt profile on N-S; E-W public side has none |
| ethernet1/2 | snet-private | Private | N-S: VR-Private; E-W: single VR | Internal LB frontend shares this subnet |
| ethernet1/3 (N-S only) | snet-dmz | DMZ | VR-DMZ | DMZ LB attached |
| tunnel.1 (N-S only) | — | — | VR-Public | IPsec tunnels to Zscaler |

N-S firewalls run three virtual routers (Public/Private/DMZ); E-W firewalls run a single
VR with public + private interfaces only. In the E-W transit topology all ingress arrives
on one interface/zone, so security policy cannot rely on zones alone — address objects
(subnet CIDRs) or dynamic address groups are used instead (VM-Series-in-Azure design
constraint).

## Panorama management

- Two instances, **active (AUEA) / passive (AUSE)** HA pair; passive holds a
  synchronised config copy and takes over automatically.
- Each has a **2 TB logging disk**; rolling retention (oldest logs deleted when full);
  additional 2 TB disks can be added to extend retention.
- **Log forwarding chain (DD 5.5.1.9)**: firewalls → Panorama (security, threat, URL,
  WildFire, system logs) → syslog-format forward to **Microsoft Sentinel via a syslog
  server VM** (syslog/SIEM servers provided by IMP projects). Duplicate logging
  (cloud + on-prem) and Enhanced Application Logging enabled.
- **Access & authentication**: SAML to Entra ID with a local break-glass admin;
  management access only from a secure high-privileged jump host (see
  `architecture/topology.md` — no Bastion; jump hosts in Management VNet).
- **Templates**: per-direction template stacks layered Global → NS/EW → regional
  (TS-NS-AU-East, TS-EW-AU-East, TS-NS-AU-Southeast, TS-EW-AU-Southeast); all device
  config changes made via Panorama templates, never locally — enables identical config
  and horizontal scaling into LB backend pools.
- **Device groups**: Shared → EW/NS → regional groups; objects created in Shared,
  policies in post-rules of the Azure-specific device group; identical policy within a
  group.

## Device settings (handover state)

Domain `apm.com.au`; timezone Australia/Melbourne; automated commit recovery and device
monitoring push to Panorama enabled. Management services HTTPS/SSH; network services
SNMP/ping. Dynamic updates: antivirus hourly; Applications & Threats every 30 min;
WildFire every minute; GlobalProtect none. **DNS and NTP servers were TBC at handover**
(pending Infrastructure team decision) — treat as an open item. EDL service route: via
management interface.

## Baseline security and NAT policy (pattern only)

Per the curation rules, the corpus records the policy *pattern*, not the rulebase:

- Global block rules (Shared) for known-malicious IPs/FQDNs via Palo Alto-maintained
  **External Dynamic Lists**.
- Allow rules for Azure LB health probes, internal ICMP (diagnostics), firewall↔Panorama,
  firewall/Panorama internet access, and VPN to Zscaler.
- Default interzone/intrazone rules **overridden to drop + log + forward to Panorama**.
- Outbound internet restricted by allowed URL categories and applications;
  proxy-avoidance/anonymisers blocked and logged; security profiles (AV/vulnerability),
  URL filtering, file blocking and data filtering applied; all outbound traffic logged.
- NAT: outbound-internet NAT rules created at deployment; further NAT rules added as
  workloads land. (Source is internally inconsistent on which set carries them — see
  data-quality flags.)
- Advanced firewall configuration (ACL evaluation/migration) deferred to APM
  post-handover (assumption AS19).

## IaC deployment (Azure DevOps + Terraform)

- One repo per region; Terraform provisions firewalls, vNICs, PIPs, OS/logging disks,
  availability sets, and the four LBs (public, private, dmz, internal) per region;
  `main.tf` references pre-existing ESLZ resources. Panorama deployed via `panorama.tf`.
- State in storage account `auestpdevopstfst001`, container `firewall-tfstate`, keys
  `auae-palo-deployment.tfstate` / `auas-palo-deployment.tfstate`; backend subscription
  11e390a7-880a-4d2b-8d3e-d80af1138665; deployment subscription
  8f23887a-5cac-4932-8929-5c6fe0294808; service connection `sc-alz-mgmt-apply`.
- Environment values held in Azure DevOps **variable groups**
  (`auae/auas-palo-deployment-variables`); scripts generate `terraform.tfvars` from the
  variable group (importVariables.ps1 / export-tfvars.ps1), removing manual config.
- **Prerequisite**: firewall/Panorama local-admin password pre-created as a Key Vault
  secret (`palo-firewall-password`).
- **DR position**: everything is in code — the full stack is redeployable to another
  region via the pipeline with a DR-specific tfvars file. Initial production deployment
  was semi-manual (hand-built tfvars); the automated pipeline was retrofitted and
  validated in non-production with production-equivalent values.
- Plan/approve/apply flow: pipeline generates a Terraform plan for review; apply enabled
  by adding the apply stage after plan approval.

## Planned role change — AI landing zone traffic (TCD v0.5, authoritative design intent)

Per the AI LZ TCD v0.5 (`architecture/ai-landing-zone.md`): the **E-W pair** carries
all internal AI inspection (consumer→AppGW→APIM, APIM→Foundry-PE, agent flows) and
Prod/Non-prod separation, in a new Panorama **"AI device group"** with rulebase
additions (default-deny FQDN allow-list for agent egress, QUIC/ECH deny, explicit
inter-environment deny). **Internet-bound AI egress continues from the E-W path to
the N-S egress path, then through Zscaler to the internet** — consistent with the
as-built Zscaler egress model above (this supersedes the earlier DDD v2.4 single-hop
E-W-only egress design). A scoped no-decrypt policy applies to Foundry agent egress
(TLS inspection breaks the Microsoft-managed runtime). TCD carries an internal
contradiction on the perimeter-NAT point (E-W public IP vs N-S egress range) —
verify at build. Shared-NVA capacity for aggregate AI load remains open (OD-03) with
a Panorama scale-out path required. Not reflected in the as-built rulebase above.

## Constraints and assumptions worth retaining

- Palo Alto NVAs are the **only** firewalls between internal networks and public
  infrastructure — none elsewhere, including Sandpit (AS11).
- Generic device config principle: DHCP management interfaces, interface-referencing NAT
  rules — supports bootstrap scaling into Panorama template stacks/device groups.
- SNAT rules exist where needed for return-traffic handling between new hub, legacy
  spokes, and on-premises; Application Gateway operates concurrently with the firewalls
  (AS09).
- DR scope stated inconsistently: AS04 scopes DR to firewalls/related resources; AS16 to
  production and identity resources (AZ or regional scenarios). No BCP was provided.

## Data-quality flags from source

(a) Device naming inconsistent between sections — instance table `aefwppalo00x` /
`asfwppalo00x` vs interface/template/device-group sections `aefwpalo00x` / `asfwpalo00x`
(single "p"); actual deployed names unverified against Azure. (b) Template stack
TS-NS-AU-Southeast lists member `aefwpalo001` — almost certainly `asfwpalo001`.
(c) Interface table mgmt IPs malformed for four devices (`10.40.38`, `10.40.37`,
`10.50.39`, `10.50.35` — missing an octet), and `aefwpalo004` mgmt duplicates
`aefwpalo002`'s `.37`. (d) NAT section prose says rules were created "only for the
East/West firewall" for outbound internet, but the accompanying tables are titled for
both N-S and E-W sets, and the outbound-egress narrative (Zscaler tunnels terminate on
N-S tunnel.1) implies N-S involvement — reconcile against the live config. (e) AUSE
scope lists 4 load balancers for a 2-firewall region (mirrors AUEA count; plausible but
unconfirmed). (f) Document status page is truncated ("Ready to") and the consultation
table carries no sign-off dates — ratification status unconfirmed. Recorded in
`references/remediation-register.md` §A5.

Cross-references: hub/peering/perimeter model in `architecture/topology.md`; UDR/DNS/PE
patterns in `architecture/connectivity.md`; hub subnet CIDRs and device addressing in
`ipam/address-plan.md`; log platform in `architecture/platform-services.md`.

---


# FILE 6 of 19 — `architecture/identity-rbac.md`

---
status: active
source_document: APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx
source_version: 1.1 (17 July 2026)
ingested: 2026-07-21
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
---

# Identity and RBAC

Sanitisation note: group/identity object IDs, principal names, and break-glass account
identifiers are deliberately excluded (RFFR PROTECTED handling); names below are schemes,
not secrets.

## Tenancy and hybrid identity

Single Entra tenant `advancedpersonnelmanagement.onmicrosoft.com`, licensed **Entra ID
P2**. On-premises AD DS (`ad.apn.net.au`) synchronised via **Entra Connect Sync** (DD4).
Regional AD DS IaaS VMs (2× Australia East across AZs, 2× Australia Southeast in an
availability set) in the Identity subscription; AD VMs must not be shut down from the
portal. MCA billing hierarchy (billing profiles → invoice sections → subscriptions);
billing RBAC is distinct from Azure RBAC (DD2). All subscriptions CSP-managed.

**Open compliance gap (DD5)**: per NFR 1.9 privileged accounts should not be synchronised
from AD DS to Entra; as-built this could not be completed — the environment remains
hybrid and APM is to investigate an alternative pathway.

## RBAC model (DD8, Confirmed)

Built-in roles in use: Owner, Contributor, Reader, Security Admin, Security Reader,
Network Contributor. Custom roles created at MG `APM`:

| Custom role | Permission summary |
|---|---|
| APMLZ-NetworkManagement (NetOps) | Platform-wide connectivity: VNets, UDRs, NSGs, NVAs, VPN, ExpressRoute |
| APMLZ-SecurityOperations (SecOps) | Security admin horizontally across estate + Key Vault purge policy |
| APMLZ-SubscriptionOwner | Manages subscription except write on network resources (VPN GW, ER circuits, route tables, VPN sites) |
| APMLZ-ApplicationOwner (DevOps, App operations) | Contributor at subscription scope except public IP creation, VNet creation, vault purge |

## Security group scheme and assignment scopes (DD9)

Cloud-only, assigned-membership, security-enabled Entra groups (not role-assignable).
Admin groups: `Role-Admin-<Scope>-<Role>`; app groups at RG level: `<App>-<Env>-<role>`.

| Tier | Groups | Scope |
|---|---|---|
| Tenant root | Role-Admin-AzureTenant-{Owner,Contributor,Reader,SecurityAdmin,SecurityReader,NetworkContributor} | MG APM |
| NetOps/SecOps | Role-Admin-AzureMG-NetworkOperationManagement, -SecurityOperations | MG AUS-MG-PLATFORM and AUS-MG-REGION |
| Platform | Role-Admin-AzureMGAUSPlatform-{Contributor,Reader,SecurityAdmin,SecurityReader,NetworkContributor} | AUS-MG-PLATFORM |
| Region | Role-Admin-AzureMGAUSRegion-{Reader,SecurityAdmin,SecurityReader,NetworkContributor} | AUS-MG-REGION |
| Security-domain MGs | **NONE — no roles ever assigned at AUS-MG-CONTROLLED / AUS-MG-STANDARD** | — |
| Environment | Role-Admin-AzureMGAUS{Controlled,Standard}-{PROD,DEV,SIT,UAT}-Contributor | Per-environment MGs |
| Subscription | APMLZ SubscriptionOwner / ApplicationOwner delegated groups | Subscription |
| Resource group | `<App>-<Env>-{owner,contributor,reader}` | RG |

As-built: ~27 groups matching the scheme plus `Role-Admin-APMLZ-ApplicationOwner`,
`Role-Admin-APMLZ-SubscriptionOwner`, `Role-Admin-AzureMG-APMLZ-*` NetOps/SecOps groups.
**All MG-level assignments are PIM-eligible, time-bound (1 year, expiring Nov 2026)** —
not permanent. Subscription/app-level assignment is BAU.

## PIM, JIT, break-glass

- **PIM and identity governance are excluded from this LZ phase** (with Access Reviews,
  Entitlement Management, Defender for Identity, LAPS, Entra Password Protection) —
  deferred to a broader APM program. PIM mechanics are nevertheless used for the
  time-bound eligible MG assignments above.
- **JIT (DD10)**: only MFA + RBAC implemented this phase (partial NFR 1.1). Forward path:
  Entra PIM role JIT; Defender for Cloud JIT VM access (RDP/SSH) — requires Defender for
  Servers Plan 2.
- **Break-glass (DD3)**: existing APM process retained — covers Global Administrator only;
  minimum two emergency accounts, monitored, excluded from Conditional Access, credentials
  in Key Vault. Other roles via named privileged accounts per APM Identity and IT Access
  Management Standards (associated doc RF07).
- PAWs delivered via the AVD solution (next phase); jump hosts interim (see
  `architecture/topology.md`).

## IAM toolset status (DD6)

Included: RBAC, custom roles, PAWs (via AVD). In place: break-glass, managed identities,
MFA, Entra sign-in logs, Conditional Access, Entra ID Protection. Excluded this phase:
LAPS, Entitlement Management, PIM, Defender for Identity, Access Reviews, Defender for
Cloud (IAM aspects), Entra ID Governance, Entra Password Protection.

## Managed identities and automation identities (DD7)

Managed identity preferred over service principals for Azure-to-Azure access; service
principals for external apps/broad automation.

| Identity | RG | Purpose |
|---|---|---|
| auea-mi-management-deploymentbypolicy-001 | auea-rg-management-sharedservices-001 | Azure Policy remediation (Modify/DINE) — do not remove |
| ause-mi-management-deploymentbypolicy-001 | ause-rg-management-sharedservices-001 | Same, AUSE — do not remove |
| auea-uami-alz-plan-001 | auea-rg-management-tfstate-001 | Terraform ALZ plan pipeline |
| auea-uami-alz-apply-001 | auea-rg-management-tfstate-001 | Terraform ALZ apply pipeline |

Service principals `AUMAlertRule-{AssessmentFailed,PatchInstallationFailed,RebootPending,ScheduleFailed}-001`
hold Reader on all subscriptions for AUM alert rules.

## Build-time access (transitional)

Delivery-partner LZ team held Owner + tenant-wide roles (User Access Administrator,
deployment identity SP) during build; all privileged permissions revoked at handover.
Policy-remediation managed identities (table above) are the persistent automation path.

Cross-references: MG tree in `architecture/landing-zones.md`; DevOps identity usage in
`architecture/platform-services.md`.

---


# FILE 7 of 19 — `architecture/platform-services.md`

---
status: active
source_document: APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx
source_version: 1.1 (17 July 2026)
ingested: 2026-07-21
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
---

# Platform services — logging, monitoring, update management, cost, storage, key vaults

## Log Analytics workspace separation (DD38)

Operational and security logs are split. Every LZ resource sends diagnostics to the
**Operational LAW in aus-sub-management**; **security logs go to dedicated LAWs in
aus-sub-security** (which centralises Sentinel, Defender for Cloud, security tooling —
SecOps-owned; Sentinel/SIEM shipping itself is owned by the parallel IMP project).
Workspace access control mode: "Use resource or workspace permissions".

| Workspace | RG | Region | Subscription | Retention |
|---|---|---|---|---|
| auea-law-mgmt-operation-001 | auea-rg-management-monitoring-001 | AUEA | management | 90 days |
| ause-law-mgmt-operation-001 | ause-rg-management-monitoring-001 | AUSE | management | 90 days |
| auea-law-sec-001 | auea-rg-security-logs-001 | AUEA | security | 30 days (handover baseline; security team to adjust) |
| ause-law-sec-001 | ause-rg-security-logs-001 | AUSE | security | 30 days (as above) |

**Retention model (DD39, NFR 9.9 — 180-day minimum)**: 90 days in LAW + export to
diagnostics storage accounts `aestmopsdiaglog001`/`asstmopsdiaglog001` with 180-day
lifecycle retention. Flow logs: 14 days (`aestmflowlog001`/`asstmflowlog001`).

## Diagnostics and monitoring (DD31/DD37)

Azure Monitor is primary for Azure platform operational logs (PRTG remains for
non-Azure). Diagnostic settings are policy-enforced (DIAG/LOG/MON families — see
`policies/policy-baseline.md`) with **dual destinations: LAW + storage account**.
Activity logs stream to LAW (LOG013) and storage (APM033).

**Alerts (DD32)**: per-subscription Service Health, Resource Health, and Advisor alert
rules (Sev4, activity-log based) across all subscriptions; AUM alert rules ×4 (Sev3,
scheduled query, management scope); LAW-based rules for RSV deletion activity, protected
item changes, VM heartbeat missing, logical disk >95% used, LAW ingestion-rate and
operational issues (Sev2/3). Alert processing rules apply the action group to Sev0-2
backup alerts per backup RG (connectivity, identity, management, security, prod-std, both
regions). Single action group `auea-ag-management-itinfrastructureteam-001` (Global; email
to IT Infrastructure Team mailbox — flagged pending update post-handover).

**DCRs**: 18 total — change tracking per region (mgmt), VM Insights/perf-counter DCRs per
subscription+region; OS-split (Windows/Linux) perf DCRs for management and prod-standard;
combined "All" DCRs for connectivity/identity/security.

**Insights**: Application Insights deferred (per application). VM Insights via AMA +
UAMI + DCR policy at MG APM; caveat — Map/Dependency agent retires 30 Jun 2028 and new
onboarding restricted since 30 Sep 2025; rely on AMA change tracking/inventory instead
(DD34). Baseline VM monitoring (DD35): disk free <5%, heartbeat 15-min, dynamic CPU
alerts for Identity and Production VMs. Network Insights (DD36): flow logs on all
hub/identity/management/prod VNets, both regions; Traffic Analytics not configured.

**Workbooks (DD40)**: 15 shared workbooks + APM LZ inventory dashboard in
auea-rg-management-monitoring-001 (cost optimisation, governance, orphaned resources,
backup suite ×6, update compliance, LAW insight, change tracking, VM key metrics, alerts
reporting, AMA health).

## Update and change management (DD23/DD24/DD25)

**Patch SLAs**: critical vulnerabilities 48 hours; non-critical 2 weeks (internet-facing)
/ 1 month (non-internet-facing). AUM with periodic assessment (24 h) and policy-scheduled
patching; cross-subscription patching; staged rollout anchored on Patch Tuesday.

**Three-ring orchestration** — 12 maintenance configurations
(`auea-aum-management-mntconf-{critical|noncritical}-{windows|linux}-{ring}-001`, 2-hour
window, reboot if required):

| Ring | Schedule |
|---|---|
| Lead | 1 day after 2nd Tuesday monthly |
| Autopatch-01 | 4 days after 2nd Tuesday monthly |
| Autopatch-02 | 4th Saturday monthly |

Ring membership is tag-driven (`update-stage`: Lead/auto-patch01/auto-patch02; tag
enforcement via APM031). AUM policy families AUM01–AUM07 at MG APM. Change Tracking &
Inventory via MON001/MON002 initiatives + 2 change-tracking DCRs; limits per machine:
files 500, registry 250, Windows software 250, Linux packages 1250, services/daemons 250.

## Cost management (DD22)

Native Cost Management + Billing (MCA). Baseline budgets on all 13 subscriptions (reset
monthly, created 1 Nov 2025, expiring 31 Oct 2026, AUD 5,000 placeholder; alerts at 80%
and 110% of actual; recipient IT Infrastructure Team). Reserved Instances/Savings Plans
for long-term workloads; AHUB (APM004 policy); orphaned-resources workbook; cost tags
enforced via tagging policy.

## Storage design (DD29/DD30/DD45)

Settings matrix: production = dedicated accounts, GRS/RA-GRS, strict RBAC, encryption at
rest+transit, private endpoints only, comprehensive monitoring; non-production = LRS/ZRS,
shorter retention. DR replication: production-with-regional-failover = GRS, other
production = ZRS, non-production = LRS. Defender enabled on all storage accounts; SAS
least-privilege with expiry, IP allow-listing, HTTPS-only.

Platform accounts (all StorageV2, Hot, public access disabled, private-endpointed unless
noted): `aestmflowlog001`/`asstmflowlog001` (LRS, flow logs, 14-day),
`aestmopsdiaglog001`/`asstmopsdiaglog001` (LRS, diagnostics, 180-day),
`auestpdevopstfst001` (GRS, Terraform state), `auestppaloaltotfst001` (RA-GRS, Palo Alto
Terraform state).

## Key vaults (DD58/DD60)

Production KVs: soft delete + purge protection, 90-day retention. Non-production: soft
delete, 90-day. Vaults separated per application; dedicated service vaults for ADE keys
(`[r]-kv-[env]-[domain]-ade-[nnn]`) and AppGW certificates (`…-gwcert-[nnn]`); platform
KVs Standard SKU, software-protected keys, in management shared-services RGs. SSH private
keys protected via passphrase or KEK in Key Vault (DD59). Guardrail: APM015 initiative.

Cross-references: backup/DR in `architecture/resilience-dr.md`; policy IDs in
`policies/policy-baseline.md`; tag scheme driving backup/update automation in
`standards/tagging.md`.

---


# FILE 8 of 19 — `architecture/resilience-dr.md`

---
status: active
source_document: APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx
source_version: 1.1 (17 July 2026)
ingested: 2026-07-21
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
---

# Resilience and DR

**Currency flag**: the corpus index describes a ratified multi-zone **single-region**
(Australia East) DR posture superseding Australia Southeast as a DR site — that decision
paper has NOT yet been ingested. This file reflects the Detailed Design v1.1, which
actively uses Australia Southeast as the regional pair (VNets, vaults with GRS+CRR, DCs).
If the single-region decision post-dates v1.1, it supersedes the regional-pair posture
below — ingest the DR decision paper to resolve.

## Regions and zones (DD50)

Primary: **Australia East** (3 availability zones). Pair: **Australia Southeast** (no
AZs — RS10). DR focus is **Production and Identity only**, at AZ or regional level; no
BCP provided by APM. Region locked by GEN01; zone resilience audited by GEN05.1
(Platform). Older VM SKUs (e.g. Standard_D1) lack AZ support.

## Availability posture

- VM availability (DD42/DD43, per application): single VM 95–99.9%, availability sets
  99.95%, AZs 99.99%; ASR for paired-region replication of critical VMs, two-hour RTO.
- Disk guidance: prod high-performance = Premium SSD (dedicated OS/Data/Log); prod
  standard = Standard SSD; non-prod = Standard SSD/HDD.
- App Services DR tiers (DD47): prod critical = multi-region; prod standard = AZs;
  non-prod = deployment slots. App Gateway (DD44): >1 instance or AZs. PaaS/SQL MI DR
  (DD41/DD46/DD56): deferred to application assessment (Stream 02).
- Autoscaling (DD26–28/DD55): decided per application by APM Architecture Team;
  capacity/availability oversight via Azure Monitor per NFR 9.24.

## Domain controller redundancy (DD49)

Two DCs per region: AUEA across availability zones, AUSE in an availability set. Spec:
Windows Server 2025, Premium SSD encrypted OS disk, separate SYSVOL data disk (host
caching disabled, encrypted), static private IP, no public IP, subnet-level NSG, in the
Identity subscription. On DC failure: **rebuild, don't restore** (hence Identity vaults
are LRS with soft delete disabled).

## Backup — vault strategy (DD51)

One RSV per environment per subscription (cross-subscription backup unsupported; CSR for
cross-subscription restore; CRR requires GRS). Redundancy: **non-prod = LRS + soft
delete; production and connectivity = GRS + CRR + soft delete; Identity = LRS, soft
delete disabled**. Security PIN for critical operations; policy-driven auto-enrolment via
`Backup` tag.

As-built vaults: `auea/ause-rsv-{connectivity,management,prod-std,security}-001` (GRS,
CRR enabled), `auea/ause-rsv-identity-001` (LRS, CRR disabled), plus Backup vaults
`auea/ause-rsv-management-002` (GRS, CRR) for blob/Files backup of the diagnostics
storage accounts. Immutability enabled-not-locked posture audited by APM016/APM018;
soft delete audited by GEN010/GEN011.

## VM backup policies (DD52) — tag-driven

Tag `Backup` = `BasicVMBackup` | `StandardVMBackup` (see `standards/tagging.md`; BK01–04
policies auto-enable backup per subscription/region).

| | Basic (non-prod) | Standard (prod) |
|---|---|---|
| Schedule | Daily 21:00 AEST | Daily 21:00 AEST |
| Snapshots | 2 days | 2 days |
| Retention | Daily 30 days | Daily 14 days; Monthly 13 months (1st Sat); Yearly 7 years (1st Sat Jan). Design also shows a variant: Daily 30d / Weekly 5w / Monthly 13m / Yearly 7y |

36 VM backup policies deployed (`{r}-rsvp-{domain}-backup-{basic|standard}-{001|002}`).

## SQL-on-VM backup (DD53)

Tag `Backup` = `StandardSQLVMBackup` | `StandardSQLVM(OS)Backup` (BK05–08 policies).
Basic: daily 19:30 AEST, 14-day, log 15-min/2d. Standard: daily, 14d + monthly 13m +
yearly 7y, log 15-min/7d. OS-only: weekly Sat, 3w/13m/7y. Enhanced: every 4 h, 30-day +
14d/13m/7y.

## Azure SQL Database (PaaS) backup (DD54)

Native: weekly full, 12/24 h differential, ~10-min log; TDE encrypts backups. APM tiers:
Basic (non-prod) PITR 21 days; Standard (prod) PITR 7 days + LTR 4 weekly / 13 months /
7 years, LTR stored geo-redundant. Manual download/restore restricted. Per-application
finalisation outside base LZ.

## Backup encryption

At rest 256-bit AES (FIPS 140-2) via Azure Storage encryption; in transit HTTPS on the
Azure backbone.

Cross-references: vault/RG naming in `standards/naming.md`; BK policy assignments in
`policies/policy-baseline.md`; storage replication tiers in
`architecture/platform-services.md`.

---


# FILE 9 of 19 — `architecture/integration-services.md`

---
status: active
source_document: APIMBoomiPlatform-APIM-DDD.docx; APIMBoomiPlatform-Boomi-DDD.docx; APIMBoomiPlatform-AIGateway-DDD.docx; BoomiChanges.docx; APM_ES_AI_LZ_DDD v2.4 (design intent — see architecture/ai-landing-zone.md)
source_version: three DDDs v0.1 "For review" (OFFICIAL-INTERNAL); BoomiChanges change note (undated, unversioned) — NONE ratified, NO as-built exists
ingested: 2026-07-22
supersedes: the earlier consolidated APIM/Boomi platform design (per the DDDs themselves); BoomiChanges supersedes parts of the APIM DDD (MG placement, APIM networking)
---

# Integration & AI services platform (APIM / Boomi / AI Gateway) — DESIGN INTENT

**Currency warning**: everything in this file is design intent from v0.1 review-stage
documents. Nothing here is as-built. **The AI Gateway sections are partially superseded
by the ES AI LZ DDD v2.4** (`architecture/ai-landing-zone.md`, 21 Jul 2026): Foundry
managed-VNet mode (AllowOnlyApprovedOutbound) is now PROHIBITED in favour of Custom
VNet injection with E-W NVA-inspected single-hop egress, and the content-logging model
moved to the two-tier default-off scheme — see the supersession table in that file.
The APIM platform and Boomi sections here remain the current design position. The three DDDs replace an earlier consolidated
platform design; the BoomiChanges note then amends the APIM DDD in three places
(recorded inline below). Verify against deployment before relying on any claim, and
re-ingest when an as-built or ratified revision exists.

Purpose: close the ESLZ capability gap for API mediation, Boomi MCS integration, and
governed AI consumption. One APIM platform mediates both the integration plane (Boomi)
and the AI plane (Foundry/Azure OpenAI/third-party models).

## Resource organisation

**Original DDD position**: new Services MG `AUS-MG-SERVICES` under `AUS-MG-PLATFORM`,
holding two vended subscriptions `aus-prod-sub-services` and `aus-nonprod-sub-services`.
The DDD itself records this Platform-placement as a CAF deviation (shared mediation
infrastructure vs application landing zone).

**Superseded by BoomiChanges change 1**: the tier — renamed `AUS-MG-SHARED` ("formerly
AUS-MG-SERVICES") — relocates to beneath `AUS-MG-REGION` (the workload landing-zone
hierarchy in `architecture/landing-zones.md`). Driver: RBAC/policy inheritance —
placement under Platform put a workload-facing tier in the same inheritance path as
connectivity/identity/management; relocation confines scope to the landing-zone
boundary and restores CAF/ALZ conformance. Residual: one-off migration of RBAC/policy
scopes; verify no platform dependency (diagnostic routing, management-subscription
linkage) breaks.

Targeted policy at the services MG (design): allowed locations AUEA/AUSE; deny public
network access on APIM/Key Vault/Storage/LAW; CMK on LAW and Storage; diagnostics
enforcement; Defender for APIs/Key Vault/Storage; TLS 1.2 minimum; resource-type
allowlist scoped to APIM and dependencies. Same set both environments — env differences
live in resource config, not policy. Privileged access PIM-governed, no standing Owner,
workload identities preferred.

## APIM platform (APIM DDD)

| Attribute | Production | Non-production |
|---|---|---|
| Tier | APIM Premium v2 | APIM Premium v2 |
| Region | australiaeast | australiaeast |
| Scale units | 2 (headroom; confirm vs capacity testing) | 1 |
| Zone posture | Single-zone (zonal) — NOT zone-redundant | Single-zone |
| Networking | VNet injection (inbound + outbound) | VNet injection |
| DR | IaC rebuild in australiasoutheast | None |

- **Injection, not integration**: Premium v2's integration model secures outbound only;
  injection secures both. APM needs private inbound, so injection. The models are
  mutually exclusive and cannot be switched after creation. This supersedes the
  consolidated design's "injection outbound + separate inbound Private Endpoint" — the
  injected gateway already presents a private inbound VIP.
- **Networking superseded by BoomiChanges change 3**: APIM moves from a delegated subnet
  in the shared Services spoke to **its own dedicated VNet** (subscription named
  `aus-sub-apim-001` in the change note) reached via peering, hub-transit UDRs
  unchanged. Driver: unscoped future demand — avoids IP exhaustion, delegation lock-in
  and shared-VNet re-architecture. Injection mechanism itself unchanged (delegated
  subnet within the dedicated VNet, `Microsoft.Web/hostingEnvironments` delegation, NSG
  permitting Storage/KV 443 + agreed consumer/backend flows).
- **Zone-posture deviation (recorded)**: Microsoft recommends zone redundancy (≥2
  units); APM accepts single-AZ tenant-wide with region-pair IaC rebuild as compensating
  control. Residual: a zone outage takes prod offline until DR is invoked. Zone
  redundancy is set at creation only — revisiting requires rebuild, not reconfiguration.
- **DNS**: injection requires self-managed DNS. Private DNS zone hosted centrally in the
  Connectivity subscription (ESLZ pattern, auto-registration off); A record for the
  gateway hostname → private VIP is IaC-managed because the injected VIP is dynamic —
  set at first build and re-pointed on DR rebuild.

## Traffic inspection matrix (across all three DDDs + change note)

| Flow | Path | Inspected by |
|---|---|---|
| Consumer → APIM | Spoke UDR → E-W Palo Alto NVA → injected APIM private IP | E-W NVA |
| APIM → Boomi MCS | Services spoke → hub → N-S NVA → VPN Gateway → IPsec to AWS | N-S NVA (pre-encryption — "the genuine inspection point") |
| APIM → Foundry/AOAI | UDR → E-W NVA → model Private Endpoint | E-W NVA |
| Foundry managed-VNet egress (agents/grounding) | Microsoft-managed PEs / MS-managed Azure Firewall | **NOT APM-inspected** — governed only by egress mode (AllowOnlyApprovedOutbound selected). SUPERSEDED: ES AI LZ DDD v2.4 prohibits managed VNet entirely — see `architecture/ai-landing-zone.md` |
| APIM → third-party model | N-S NVA → internet/provider link | N-S NVA |
| Internet → webhook (BoomiChanges change 2) | Internet → AppGW WAF_v2 → N-S NVA → APIM (dedicated API fronting internal handler) | WAF (L7/OWASP CRS) + N-S NVA |

The E-W NVA is deliberately NOT on the Boomi egress path (Boomi runtime is not a
landing zone); the E-W requirement is satisfied on the consumer→APIM hop. The Foundry
managed-VNet row is the honest inspection-boundary statement the AI DDD makes: private
network mode ≠ APM-inspected.

**SmartRecruiters webhook (change 2)** is the first internet-inbound flow: push
webhooks need controlled HTTPS ingress the topology lacked. APIM terminates the
webhook (auth, source-IP allow-listing, rate limiting, schema/size validation, full
logging). Open: SmartRecruiters' webhook auth model (HMAC/shared secret) and stable
source-IP ranges; payloads may carry candidate PII (Privacy Act APPs, AU residency).
Note: the Palo Alto as-built (`architecture/firewall-nva.md`) provisioned for inbound
via an external Azure LB + route table; this design uses AppGW WAF_v2 as the ingress
instead — reconcile at implementation.

## Boomi MCS connectivity (Boomi DDD)

Boomi MCS runtime is Boomi-managed in AWS (Australian region — confirmation open);
demarcation is the IPsec boundary. **No consumer reaches Boomi directly**: APIM is the
sole sanctioned interface (auth + rate-limit + credential mediation); the MCS address
space is not advertised into spokes.

**VPN design** (new dedicated gateways in the Connectivity hub — consolidation question
open with the Connectivity service owner):

| Attribute | Production | Non-production |
|---|---|---|
| Gateway SKU | VpnGw2AZ (zone-redundant) | VpnGw1AZ (zone-redundant) |
| Mode | Active-active, 2 public IPs | Active-passive |
| Tunnels | 2 × IPsec, BGP | 1 × IPsec (static or single-session BGP) |
| IKE/IPsec | IKEv2; AES-256-GCM; SHA-384; DH group 20 | same |
| DR | IaC rebuild in AUSE advertising DR range | None |

**Addressing (APM-provided space presented by the MCS across the VPN)**: production
10.40.2.0/24 (DR 10.50.2.0/24 — never advertised simultaneously); non-production
10.40.3.0/24. See `ipam/address-plan.md` for the reservation conflict flag against hub
growth CIDRs. Crypto parameters pending confirmation against Boomi-supported IPsec
values; PSK/certificate custody process to be agreed jointly.

**Mediation controls**: subscription key + OAuth (per product) at APIM; rate-limit-by-key
and quota-by-key per product/consumer; Boomi-issued backend credentials held as Key
Vault-backed named values, never exposed to consumers; backends resolve to the private
VPN-presented address, no public Boomi endpoint.

**Telemetry**: Boomi Audit Log Streaming + Process Reporting → dedicated Event Hubs
namespace (Premium, Private Endpoint, public access off) over the same VPN (AMQP 1.0) →
central LAW via managed identity. Alerts: tunnel down (correlated with gateway metrics
to distinguish instance loss from connection loss), pipeline failure, process error
spikes, ingestion lag. DR precondition (open): Boomi must be able to present the MCS on
10.50.2.0/24 and terminate IPsec from AUSE — no committed RTO until confirmed.

## AI Gateway (AI Gateway DDD)

Gateway-as-control-point: workloads hold no model credential and no bypass route.
OAuth consumer auth (validate-azure-ad-token — also removes the DR subscription-key
re-keying exposure raised in the APIM DDD); APIM→backend auth via system-assigned
managed identity (no model API keys).

**Policy set** (Microsoft AI Gateway policies on Premium v2, IaC-versioned; changes via
APIOps with mandatory cyber review for security-category policy):

| Policy | Stage | APM position |
|---|---|---|
| llm-token-limit | Inbound | Per product + consumer key; TPM/quota with AI Governance; pre-calculated prompt tokens reject over-limit before backend; doubles as compromised-credential containment signal |
| llm-emit-token-metric | Outbound | Dimensions product/consumer/model → App Insights; feeds FinOps + capacity |
| llm-semantic-cache-lookup/store | In/Out | High-volume read-style products; requires external RediSearch-compatible cache; tenancy per product/API |
| llm-content-safety | In + Out | Azure AI Content Safety backend; hate/sexual/violence/self-harm thresholds with AI Governance; Prompt Shields for direct + indirect (document-embedded) injection |

- **Model selection**: APIM backend pools; priority-based LB favours provisioned
  throughput, spills to PAYG; circuit breaker uses backend Retry-After for dynamic trip
  duration; model bound to product where a workload needs a specific model.
- **Semantic cache**: **Azure Managed Redis — new BoM line**; treated as a PROTECTED
  store (CMK + Private Endpoint posture to confirm — open); embeddings deployment
  computes vectors; rebuilt empty on DR (cold-cache cost only).
- **Content safety streaming behaviour**: on violation mid-stream the gateway stops
  forwarding events without a 403 — stated so operators understand terminated streams.
- **Prompt/completion logging**: GenAIPromptCompletionLogs → dedicated CMK LAW,
  PE-only, RBAC restricted to AI Governance + GRC, all access logged, 12-month default
  retention. **Content logging ships disabled until GRC signs off the pre-logging
  redaction pattern set** (PSPF markers etc. redacted before the stream). Aggregate
  metrics deliberately separated (App Insights, broad ops/FinOps RBAC, no content).
- **Foundry managed-VNet egress**: AllowOnlyApprovedOutbound selected (auto-created PEs
  to Storage/Cosmos/AI Search; per-scenario approved FQDNs, kept minimal — Microsoft
  cannot guarantee exfiltration protection with FQDN rules). Constraints: mode cannot be
  relaxed post-creation; firewall SKU fixed at deployment.
- **Third-party models**: same policy chain (llm-emit-token-metric supports OpenAI and
  Anthropic Messages API schemas); N-S NVA-inspected egress; introduction is a
  governance decision (third-party assurance + data residency) recorded in the APIM
  Governance Model, not a config change.
- **AI Private DNS zones** (central, Connectivity subscription): privatelink.openai.azure.com,
  privatelink.cognitiveservices.azure.com, privatelink.services.ai.azure.com —
  workload-local zones not permitted.

## Observability and DR (common pattern)

Operational telemetry → central LAW (Management subscription), 90-day operational
retention, scheduled export to WORM immutable Storage to meet the 180-day Log
Management Standard floor (ISM-aligned schedule with GRC — open). APIM diagnostics:
GatewayLogs, WebSocketConnectionLogs, DeveloperPortalAuditLogs, 100% sampling for prod
APIs. Alerting → Digital Operations business hours / on-call after hours; APIM gateway
capacity metrics are the scale-unit adjustment signal.

DR across the platform: **production-only, IaC rebuild in australiasoutheast** (Premium
v2 has no multi-region; VPN rebuilt, not failed over). IaC repo is the synchronised
state; config RPO ≈ 0; in-flight requests retried by consumers; no numerical RTO until
a DR rehearsal. APIM rebuild regenerates subscription keys unless set in IaC —
resolution direction is OAuth consumer auth (AI DDD) or explicit KV-held key values;
decision open with the APIM Governance Model owner.

## Security standards mapping (summary)

Each DDD carries a control mapping to: Network Configuration Standard (09.03.004-4.0),
Cryptography & Key Management (09.03.027-4.0), Log Management & Monitoring
(09.03.025-4.0), Intrusion Detection & Prevention (09.03.034-3.0), Identity & IT Access
Management (09.03.035-5.0), and the RFFR/ISO 27001 Compliance Plan (09.03.055-1.0).
Notable "confirm at build" residuals: NSG rule set + consumer prefixes; TLS suite list;
IPsec parameters vs Boomi; SOC onboarding of APIM/Boomi/AI log sources; Redis CMK;
Boomi NTP/shared-responsibility currency (IRAP). The two accepted deviations (single
zone; MG placement — since resolved by relocation) are recorded with GRC.

## Consolidated open items (design-stage)

Premium v2 regional availability; prod scale-unit count vs capacity testing;
single-zone acceptance by service owner; subscription-key vs OAuth decision; central
DNS A-record ownership at build/DR; ISM retention schedules (APIM, Boomi, AI); Boomi
IPsec parameters + key custody; VPN gateway consolidation vs dedicated; Boomi DR range
capability; IPAM confirmation of 10.40.2.0/24, 10.50.2.0/24, 10.40.3.0/24; Boomi
IRAP/shared-responsibility currency + AWS region; Redis BoM/FinOps line + CMK; embeddings
deployment region/quota; AI Governance token limits + content-safety thresholds; GRC
redaction sign-off; Foundry approved-FQDN set; third-party model assurance position;
SmartRecruiters auth model + source IPs.

## Consistency flags across the document set

(a) Subscription naming drift: APIM DDD `aus-prod-sub-services` / `aus-nonprod-sub-services`
(env-first) vs BoomiChanges `aus-sub-apim-001` vs the tenant convention
`aus-sub-<purpose>[-nnn]` (`standards/naming.md`) — no single ratified name for the
APIM subscription(s), and the change note names one subscription where the DDD has two.
(b) MG naming: AUS-MG-SERVICES renamed AUS-MG-SHARED in the change note without a
formal supersession record. (c) BoomiChanges is undated and unversioned — sequence
relative to the v0.1 DDDs is inferred from content. (d) Change 2/3 route APIM inbound
via the **N-S** NVA (internet ingress), while the APIM DDD's consumer path is **E-W** —
consistent (different flows) but easily misread; the E-W consumer-path claim predates
the dedicated-VNet change and should be revalidated after change 3. (e) Inbound ingress
mechanism differs from the firewall as-built provision (AppGW WAF_v2 vs external LB +
route table). (f) DDD control mappings claim "Met" for build-dependent controls —
treat all "Met" entries as design assertions, not evidence.

Cross-references: MG hierarchy in `architecture/landing-zones.md`; hub/NVA model in
`architecture/topology.md` and `architecture/firewall-nva.md`; UDR/DNS/PE patterns in
`architecture/connectivity.md`; Boomi/APIM address reservations in
`ipam/address-plan.md`; LAW architecture in `architecture/platform-services.md`;
policy exemption path in `policies/governance.md`.

---


# FILE 10 of 19 — `architecture/ai-landing-zone.md`

---
status: active
source_document: APM_ES_AI_LZ_TCD_v05.docx (24 Jul 2026, owners Michael Barker/Leah Brenton); APM_ES_AI_LZ_DDD_v24.docx (21 Jul 2026, owner Samit Chandra)
source_version: TCD v0.5 ("Draft for review"; cover block says V0.4 — see flags) layered on DDD v2.4; NO formal as-built, but the TCD is "de-facto as-built once approved" and USER-DESIGNATED AUTHORITATIVE over all earlier AI design detail
ingested: 2026-08-02
supersedes: AI LZ DDD v2.4 single-hop E-W egress/NAT model and unresolved gateway-tier addressing; DDD v2.4 in turn supersedes the AI Gateway DDD v0.1 Foundry model (managed VNet prohibited)
---

# Enterprise-Scale AI Landing Zone — TCD v0.5 (authoritative) over DDD v2.4

**Precedence**: TCD v0.5 > DDD v2.4 > AI Gateway DDD v0.1. The TCD is the technical
configuration ("de-facto as-built once approved" — approval not yet evidenced); where
it conflicts with anything earlier in this corpus, **the TCD governs**. Reconciliation
register: the “AI LZ DDD v2.4 Reconciliation Register” copy at
`references/ai-lz-reconciliation.md` (several items now resolved by the TCD — see its
preamble).

Purpose: governed generative AI across the estate — Microsoft Foundry per workload
subscription, APIM AI Gateway per environment, AppGW WAF v2 ingress, shared platform
LZ. ISM / E8 ML2 / RFFR, IRAP alignment; Australia East only (RA-01).

## Positions carried from DDD v2.4 (unchanged by the TCD)

- AI workloads are application landing zones: one Foundry account + per-team child
  projects per workload subscription; never platform-hosted; projects are the
  chargeback unit. Guardrails centralised at the environment gateway; backends
  distributed.
- **Managed VNet prohibited** (CON-005): Custom VNet injection only, enforced by the
  IaC module and Azure Policy.
- Create-time constraints (CON-002/003): agent capability (CapHost + network
  injection) is an at-creation account decision — not retrofittable; a model-only
  account later needing agents is a new build. Agent subnet size immutable; min /27,
  /24 recommended, ≥/26 for the 50-concurrent-session platform max; RFC 1918.
- No-decrypt constraint (CON-001/EX-01): TLS decryption impossible on Foundry Agent
  egress (Microsoft-managed runtime); scoped no-decrypt with **QUIC and ECH blocked**;
  payload control at the APIM tier. Internal-path tool bypass (EX-02) governed by
  per-project approved-tool policy.
- Open Decision Register OD-01..08 with the gate-blocking rule (TCD mirrors as
  DEP-001..008). Guardrail stack order: authN/authZ → token rate limit → quota →
  content safety → two-tier logging → MI forwarding. §5.2.1 authN model: validate-jwt
  first; subscription keys never sufficient alone; disableLocalAuth=true on every
  Foundry account by policy; no cross-environment role assignments.
- Control set C-01..C-08 with evidence obligations; companion Excel matrix
  authoritative. WAF false-positive risk on large LLM bodies managed by AI-tuned
  change-controlled exclusions (RSK-004).
- Two-tier logging operating rule: telemetry always-on; payload tier default-OFF per
  product by decision record (ceiling OFFICIAL: Sensitive, OD-07), ingestion-time
  redaction, dedicated CMK table, 90-day, PIM-gated 8-hour access, spillage → ISM
  data-spill purge. Prompts/completions classified up to OFFICIAL: Sensitive.
- DR: single-region + RA-01 (CTO+CISO, 12-month review); zone loss ≤15 min; shared
  component ≤4 h (hits both environments); **regional loss 10 business days** (model
  quota re-approval on critical path); strict rebuild sequence; annual rebuild/DR/
  restore tests; Tier 2.

## TCD REVISION — egress and inspection model (supersedes v2.4 “single-hop”)

Internal AI traffic (consumer→AppGW→APIM, APIM→Foundry PE, agent→internal approved
destinations) stays on the **E-W pair** for inspection and environment separation and
does not traverse the N-S firewall. **Internet-bound AI egress continues from the E-W
path to the N-S egress path, then through Zscaler to the internet** — aligning AI
egress with the estate egress model in the “Palo Alto NVA Firewall Platform
(As-Built)” file (Zscaler tunnels terminate on the N-S set). §5.2: perimeter NAT on
the N-S egress path; third-party source-IP allow-lists reference the approved N-S
egress range.

**Internal contradiction flag**: TCD §6.1.2 (Azure–Public table) and §6.1.5 (NAT rule)
still name an "E/W NVA egress public IP" as the perimeter NAT / "single inspected
hop", and §5.2 text also says AppGW sits in "existing auea-snet-appgw-001 /26"
subnets while §6.1.2 defines new dedicated shrd-appgw VNets — both look like v2.4
residue against the revised narrative in §§4, 4.2, 5.1, 5.2 (routing). The revised
E-W→N-S→Zscaler narrative is taken as the design position; verify NAT point and AppGW
subnet at build.

## TCD — the eight subscriptions (resolves the DDD 4+4 depiction; ASP-003)

The eight Foundry subscriptions are the **existing as-built ESLZ workload
subscriptions**: aus-sub-{prod|dev|sit|uat}-{controlled|standard}-001 — 2 Prod + 6
Non-prod. No new workload subscriptions. Mapping ratified at OD-01. MG placement is
the as-built hierarchy (AUS-MG-REGION → CONTROLLED/STANDARD → env MGs). NOTE: the TCD
labels all non-prod workload VNets "[existing]", but the ESLZ as-built record has
dev/sit/uat spokes **not deployed** — verify deployment state before relying
(reconciliation R5).

**AI Gateway tier**: subscriptions still prod-shared / non-prod-shared "[not in ESLZ
v1.1 — OD-01]"; target MG placement AUS-MG-PROD-CONTROLLED (prod) and an
AUS-MG-CONTROLLED child (non-prod) if new subscriptions are created. The TCD lists
the APIM instances as "[existing — actual names per CMDB]" — unverified against the
corpus, which has no as-built APIM (reconciliation R22).

## TCD — addressing (proposed, OD-04; drawn from the as-built address plan)

Per-subscription PE + agent injection subnets (agent = delegated
Microsoft.App/environments, UDR 0.0.0.0/0 → E-W NVA trust VIP via
auea-rt-<env>-<domain>-agent-001):

| Subscription | VNet (CIDR) | PE subnet | Agent subnet |
|---|---|---|---|
| prod-controlled | auea-vnet-prod-ctrl-001 (10.40.8.0/22) | auea-snet-prod-pe-001 10.40.9.128/25 | auea-snet-prod-ctrl-agent-001 10.40.10.64/26 |
| prod-standard | auea-vnet-prod-std-001 (10.40.48.0/22) | 10.40.49.128/25 | auea-snet-prod-std-agent-001 10.40.50.64/26 |
| dev-controlled | auea-vnet-dev-ctrl-001 (10.40.24.0/23) | auea-snet-dev-pe-001 10.40.24.192/26 | auea-snet-dev-agent-001 10.40.25.192/26 |
| dev-standard | auea-vnet-dev-std-001 (10.40.64.0/23) | 10.40.64.192/26 | 10.40.65.0/26 |
| sit-controlled | auea-vnet-sit-ctrl-001 (10.40.32.0/23) | 10.40.32.192/26 | 10.40.33.0/26 |
| sit-standard | auea-vnet-sit-std-001 (10.40.72.0/23) | 10.40.72.192/26 | 10.40.73.0/26 |
| uat-controlled | auea-vnet-uat-ctrl-001 (10.40.40.0/23) | 10.40.40.192/26 | 10.40.41.96/**27** |
| uat-standard | auea-vnet-uat-std-001 (10.40.80.0/23) | 10.40.80.192/26 | 10.40.81.0/26 |

**Gateway tier (new VNets — new carve-outs from unallocated 10.40.x space):**

| VNet | CIDR | Subnets |
|---|---|---|
| auea-vnet-nonprod-shrd-001 | 10.40.120.0/23 | auea-snet-nonprod-apim-injection-001 10.40.120.0/24; auea-snet-nonprod-pe-001 10.40.121.0/26 |
| auea-vnet-nonprod-shrd-appgw-001 | 10.40.122.0/24 | auea-snet-nonprod-appgw-001 10.40.122.0/24 |
| auea-vnet-prod-shrd-001 | 10.40.128.0/23 | auea-snet-prod-apim-injection-001 10.40.128.0/24; auea-snet-prod-pe-001 10.40.129.0/26 |
| auea-vnet-prod-shrd-appgw-001 | 10.40.130.0/24 | auea-snet-prod-appgw-001 10.40.130.0/24 |

Flag: §6.1.5 NAT source cites agent subnets "10.40.11.0/24, 10.40.51.0/24" —
inconsistent with the /26 allocations above; the tabled /26s govern, verify at build.
Full addressing context in the “IP Address Plan” file.

## TCD — DNS

Central zones (Connectivity): privatelink.services.ai.azure.com,
privatelink.openai.azure.com, privatelink.blob.core.windows.net,
privatelink.vaultcore.azure.net, privatelink.search.windows.net,
privatelink.documents.azure.com — PE records auto-registered via zone-group policy.
Published gateway names: **ai-gateway.prod.apm.internal /
ai-gateway.nonprod.apm.internal** → AppGW private frontend [TBC]. No public DNS —
platform has no public endpoints. Resolution via Azure resolver 168.63.129.16.

## TCD — firewall configuration pattern (E-W "AI device group" in Panorama)

Rule pattern (names per ESLZ NSG/rule grammar): allow workload→AppGW 443; AppGW→APIM
443; APIM→Foundry-PE 443; agent→approved-FQDN allow-list 443 (App-ID, default-deny);
deny agent QUIC/ECH; **explicit deny Prod↔Non-prod zones**; default deny any. Service
tags: AzureMonitor (AMPLS-first), AzureActiveDirectory. NAT: single outbound rule for
agent subnets → approved FQDNs (translated address: see contradiction flag above).
E-W traffic+threat logs from the AI device group → Panorama → Sentinel.

## TCD — PaaS inventory and naming (concrete; several abbreviations pending approval)

Per workload (×8; CapHost rows only where agent-capable per OD-01), all PE-only, CMK,
zone-redundant where SKU supports: Foundry account auea-aif-<env>-<domain>-001 [aif
pending]; CapHost Storage aest<env><domain>foundry001 (prod-ctrl: aestpcfoundry001);
Cosmos DB NoSQL auea-cosno-<env>-<domain>-foundry-001 [cosno pending] (agent threads,
≥3000 RU/s per project); AI Search auea-srch-<env>-<domain>-foundry-001 [srch
pending] (vector store); Key Vault auea-kv-<env>-<domain>-foundry-001; RG
auea-rg-<env>-<domain>-foundry-001; PEs auea-pep-<env>-<domain>-<descriptor>-001.
Gateway tier: APIM auea-apim-<env>-ctrl-aigw-001 [apim pending], AppGW
auea-appgw-<env>-ctrl-aigw-001, WAF policy auea-wafpol-<env>-ctrl-aigw-001 [wafpol
pending]. Proposed abbreviation additions to the naming standard: **aif, cosno, srch,
apim, wafpol**; `nonprod` env token used only for the shared gateway tier spanning
dev/sit/uat. Workspaces: telemetry → auea-law-mgmt-operation-001 (management);
Sentinel → auea-law-sec-001 (security) — resolves the DDD's "environment workspace"
ambiguity (reconciliation R3).

## TCD — identity, RBAC and access

Entra groups [naming placeholder, outside the resource standard]:
sg-ailz-platform-admins (PIM-eligible Contributor on AI RGs; no standing access),
sg-ailz-security-ops (Sentinel Responder + payload-table PIM reader),
sg-ailz-<env>-<domain>-developers (Azure AI User per project), sg-ailz-grc-audit
(Reader + compliance dashboards). Foundry data-plane: Azure AI User (teams), Azure AI
Project Manager (platform only). Managed identities end-to-end: workload SAMIs
(gateway audience tokens), APIM SAMI (min data-plane role per fronted backend), AppGW
UAMI (KV cert get), Foundry SAMIs (CapHost store roles), Entra Agent ID per published
agent (federated credentials), pipelines via workload identity federation. No service
accounts, no shared accounts, no secrets in code/prompts/pipelines. Conditional
Access: phishing-resistant MFA + compliant device for admin groups; agent-identity CA
per OD-05 licensing; monitored break-glass exclusions. App registrations
api://auea-apim-<env>-ctrl-aigw-001 [placeholder], client-credentials only. Defender
for Cloud: Defender for APIs + AI workloads on AI subscriptions.

## TCD — operations, build and test

Repos: **iac-ailz-foundry** (Terraform+AVM module) and **apim-ai-guardrails**
(fragment library); PR-mandatory, semantic-versioned, MDP agents, per-environment
pipelines/state, workload identity federation. No portal changes in Prod; shared-
platform changes follow Prod change control. PaaS patching Microsoft-managed; APM
change surfaces: module, fragments, Panorama rulebase, WAF rule-set versions.
Certificates: AppGW listener + APIM custom-domain certs from the APM Standard Public
issuer, held in Key Vault. Backup: Cosmos platform backup [mode TBC]; Storage
soft-delete+ZRS; **Search has no native backup — rebuilt from grounding sources**;
config in Git+state. Verification matrix ×8 (UDR evidence, denied-egress tests, authN
negative set, policy export, WAF negative test); Wave 1 (one Non-prod sub) is the
hard-gated proving ground; Wave 2 remaining Non-prod; Wave 3 Prod. Synthetic data
only in Non-prod; payload logging default-off everywhere. Costs: all [TBC — Gate 3
capacity review / OD-08 budgets / programme cost model].

## Data-quality flags from source (TCD v0.5)

(a) Filename v05 vs cover block V0.4; version history, consultation and SDA approval
tables all empty — "Draft for review", approval not evidenced. (b) Perimeter-NAT
contradiction: §5.2 (N-S NAT, N-S egress range) vs §6.1.2/§6.1.5 (E-W egress public
IP, "single inspected hop") — E-W→N-S→Zscaler narrative adopted; verify. (c) AppGW
placement: §5.2 "existing auea-snet-appgw-001 /26" vs §6.1.2 new dedicated
shrd-appgw VNets /24. (d) NAT source subnets 10.40.11.0/24 / 10.40.51.0/24 vs tabled
agent /26s. (e) IF-02 says APIM "user assigned MI" vs §11.3.1 system-assigned.
(f) Non-prod workload VNets marked [existing] against the corpus record of undeployed
dev/sit/uat spokes. (g) APIM instances marked [existing] with no corpus as-built
evidence. (h) ASP-001 carries the refuted 180-day-queryable retention assumption
(reconciliation R1) despite "Validated at Wave 1". (i) Foundry naming example in §4.2
(auea-aif-<env>-ctrl-<env>-<domain>-001) is garbled vs the §9 format. (j) TCD §6.1.3
zone list omits privatelink.cognitiveservices.azure.com, which the AI Gateway DDD
required — confirm whether intentional.

Cross-references: reconciliation register in the “AI LZ DDD v2.4 Reconciliation
Register” file (`references/ai-lz-reconciliation.md`); APIM/Boomi design set in
`architecture/integration-services.md`; NVA platform in
`architecture/firewall-nva.md`; DNS/UDR in `architecture/connectivity.md`; addressing
in `ipam/address-plan.md`; naming in `standards/naming.md`; policy baseline in
`policies/policy-baseline.md`.

---


# FILE 11 of 19 — `ipam/address-plan.md`

---
status: active
source_document: APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx; Palo Alto Firewall Deployment As-Built_V1.0.docx; APIM/Boomi/AI DDD set + BoomiChanges (design intent — see architecture/integration-services.md); APM_ES_AI_LZ_DDD v2.4 (design intent — see architecture/ai-landing-zone.md); APM_ES_AI_LZ_TCD v0.5 (authoritative AI config — see architecture/ai-landing-zone.md)
source_version: DD 1.1 (17 July 2026); Palo Alto As-Built 1.0 (12 Dec 2025)
ingested: 2026-08-02
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
---

# Address plan

**System-of-record caveat**: APM manages IP allocations via a shared document, not an
IPAM system (accepted risk RS07). This file carries the allocations from the Detailed
Design v1.1 (Tables 24–27 + as-built). If a separately maintained address plan document
exists with later allocations, it governs — re-ingest it here.

## Supernet strategy (DD11)

Two regional /16 supernets: **Australia East 10.40.0.0/16**, **Australia Southeast
10.50.0.0/16**. Symmetric allocation: the AUSE plan mirrors AUEA with 10.50.x.x.
Sandbox/Acquisitions ranges sit at the top of each supernet (x.248–x.254); Management at
x.255.0/24. Each VNet holds reserved additional CIDRs for contiguous growth.

## Per-subscription allocation sizing

| Subscription | Allocation | Usable IPs |
|---|---|---|
| Connectivity | /23 | 507 |
| Identity | /24 | 251 |
| Production (each domain) | /22 | 1019 |
| Dev / SIT / UAT (each domain) | /23 | 507 |
| Sandbox | /24 | 251 |
| Management | /24 | 251 |

## VNet allocations — Australia East (Table 24)

| Subscription | VNet | CIDR | Reserved additional CIDRs |
|---|---|---|---|
| aus-sub-connectivity | auea-vnet-connectivity-001 | 10.40.0.0/23 | 10.40.2.0/23 |
| aus-sub-identity | auea-vnet-identity-001 | 10.40.4.0/24 | 10.40.5.0/24; 10.40.6.0/24; 10.40.7.0/24 |
| aus-sub-prod-controlled-001 | auea-vnet-prod-ctrl-001 | 10.40.8.0/22 | 10.40.12.0/22; 10.40.16.0/22; 10.40.20.0/22 |
| aus-sub-dev-controlled-001 | auea-vnet-dev-ctrl-001 | 10.40.24.0/23 | 10.40.26.0/23; 10.40.28.0/23; 10.40.30.0/23 |
| aus-sub-sit-controlled-001 | auea-vnet-sit-ctrl-001 | 10.40.32.0/23 | 10.40.34.0/23; 10.40.36.0/23; 10.40.38.0/23 |
| aus-sub-uat-controlled-001 | auea-vnet-uat-ctrl-001 | 10.40.40.0/23 | 10.40.42.0/23; 10.40.44.0/23; 10.40.46.0/23 |
| aus-sub-prod-standard-001 | auea-vnet-prod-std-001 | 10.40.48.0/22 | 10.40.52.0/22; 10.40.56.0/22; 10.40.60.0/22 |
| aus-sub-dev-standard-001 | auea-vnet-dev-std-001 | 10.40.64.0/23 | 10.40.66.0/23; 10.40.68.0/23; 10.40.70.0/23 |
| aus-sub-sit-standard-001 | auea-vnet-sit-std-001 | 10.40.72.0/23 | 10.40.74.0/23; 10.40.76.0/23; 10.40.78.0/23 |
| aus-sub-uat-standard-001 | auea-vnet-uat-std-001 | 10.40.80.0/23 | 10.40.82.0/23; 10.40.84.0/23; 10.40.86.0/23 |
| aus-sub-avd-controlled-001 | auea-vnet-avd-ctrl-001 | 10.40.88.0/23 | 10.40.90.0/23; 10.40.92.0/23; 10.40.94.0/23 |
| aus-sub-sandbox-001 | auea-vnet-sandbox-001 | 10.40.248.0/24 | 10.40.249.0/24; 10.40.250.0/24; 10.40.251.0/24 |
| aus-sub-acquisitions-001 | auea-vnet-acquisitions-001 | 10.40.252.0/24 | 10.40.253.0/24; 10.40.254.0/24 |
| aus-sub-management | auea-vnet-management-001 | 10.40.255.0/24 | — |

## VNet allocations — Australia Southeast (Table 25)

Mirrors the AUEA plan on 10.50.x.x with `ause-` names (this design table uses `-01`
instance suffixes; deployed VNets use `-001`):

| Subscription | VNet | CIDR | Reserved additional CIDRs |
|---|---|---|---|
| aus-sub-connectivity | ause-vnet-connectivity-01 | 10.50.0.0/23 | 10.50.2.0/23 |
| aus-sub-identity | ause-vnet-identity-01 | 10.50.4.0/24 | 10.50.5.0/24; 10.50.6.0/24; 10.50.7.0/24 |
| aus-sub-prod-controlled-001 | ause-vnet-prod-ctrl-01 | 10.50.8.0/22 | 10.50.12.0/22; 10.50.16.0/22; 10.50.20.0/22 |
| aus-sub-dev-controlled-001 | ause-vnet-dev-ctrl-01 | 10.50.24.0/23 | 10.50.26.0/23; 10.50.28.0/23; 10.50.30.0/23 |
| aus-sub-sit-controlled-001 | ause-vnet-sit-ctrl-01 | 10.50.32.0/23 | 10.50.34.0/23; 10.50.36.0/23; 10.50.38.0/23 |
| aus-sub-uat-controlled-001 | ause-vnet-uat-ctrl-01 | 10.50.40.0/23 | 10.50.42.0/23; 10.50.44.0/23; 10.50.46.0/23 |
| aus-sub-prod-standard-001 | ause-vnet-prod-std-01 | 10.50.48.0/22 | 10.50.52.0/22; 10.50.56.0/22; 10.50.60.0/22 |
| aus-sub-dev-standard-001 | ause-vnet-dev-std-01 | 10.50.64.0/23 | 10.50.66.0/23; 10.50.68.0/23; 10.50.70.0/23 |
| aus-sub-sit-standard-001 | ause-vnet-sit-std-01 | 10.50.72.0/23 | 10.50.74.0/23; 10.50.76.0/23; 10.50.78.0/23 |
| aus-sub-uat-standard-001 | ause-vnet-uat-std-01 | 10.50.80.0/23 | 10.50.82.0/23; 10.50.84.0/23; 10.50.86.0/23 |
| aus-sub-avd-controlled-001 | ause-vnet-avd-ctrl-001 | 10.50.88.0/23 | 10.50.90.0/23 … (mirrors AUEA) |
| aus-sub-sandbox-001 | ause-vnet-sandbox-01 | 10.50.248.0/24 | 10.50.249.0/24; 10.50.250.0/24; 10.50.251.0/24 |
| aus-sub-acquisitions-001 | ause-vnet-acquisitions-01 | 10.50.252.0/24 | 10.50.253.0/24; 10.50.254.0/24 |
| aus-sub-management | ause-vnet-management-01 | 10.50.255.0/24 | — |

Sandbox CIDRs may intentionally overlap other VNets (isolated, never peered).

## Subnet plan — Australia East (Table 26; usable IPs in parentheses)

| VNet | Subnet | CIDR | Reserved |
|---|---|---|---|
| auea-vnet-connectivity-001 | GatewaySubnet | 10.40.0.0/27 | 10.40.0.128/26; 10.40.0.192/26; 10.40.1.0/24 |
| auea-vnet-connectivity-001 | auea-snet-mgmt-001 | 10.40.0.32/27 | |
| auea-vnet-connectivity-001 | auea-snet-public-001 | 10.40.0.64/27 | |
| auea-vnet-connectivity-001 | auea-snet-private-001 | 10.40.0.96/27 | |
| auea-vnet-connectivity-001 | auea-snet-dmz-001 | 10.40.0.128/27 | |
| auea-vnet-identity-001 | auea-snet-identity-001 | 10.40.4.0/26 (59) | 10.40.4.64/26; 10.40.4.128/25 |
| auea-vnet-prod-ctrl-001 | auea-snet-prod-web-001 | 10.40.8.0/25 (123) | 10.40.10.64/26; 10.40.10.128/25; 10.40.11.0/24 |
| auea-vnet-prod-ctrl-001 | auea-snet-prod-app-001 | 10.40.8.128/25 (123) | |
| auea-vnet-prod-ctrl-001 | auea-snet-prod-db-001 | 10.40.9.0/25 (123) | |
| auea-vnet-prod-ctrl-001 | auea-snet-prod-pl-001 | 10.40.9.128/25 (123) | |
| auea-vnet-prod-ctrl-001 | auea-snet-appgw-001 | 10.40.10.0/26 (59) | |
| auea-vnet-dev-ctrl-001 | auea-snet-dev-{web,app,db,pl}-001 | 10.40.24.0/26; .64/26; .128/26; .192/26 (59 each) | 10.40.25.0/24 |
| auea-vnet-sit-ctrl-001 | auea-snet-sit-{web,app,db,pl}-001 | 10.40.32.0/26; .64/26; .128/26; .192/26 (59 each) | 10.40.33.0/24 |
| auea-vnet-uat-ctrl-001 | auea-snet-uat-{web,app,db,pl}-001 | 10.40.40.0/26; .64/26; .128/26; .192/26 (59 each) | 10.40.41.0/24 |
| auea-vnet-prod-std-001 | auea-snet-prod-web-001 | 10.40.48.0/25 (123) | 10.40.50.64/26; 10.40.50.128/25; 10.40.51.0/24 |
| auea-vnet-prod-std-001 | auea-snet-prod-app-001 | 10.40.48.128/25 (123) | |
| auea-vnet-prod-std-001 | auea-snet-prod-db-001 | 10.40.49.0/25 (123) | |
| auea-vnet-prod-std-001 | auea-snet-prod-pl-001 | 10.40.49.128/25 (123) | |
| auea-vnet-prod-std-001 | auea-snet-appgw-001 | 10.40.50.0/26 (59) | |
| auea-vnet-dev-std-001 | auea-snet-dev-{web,app,db,pl}-001 | 10.40.64.0/26; .64/26; .128/26; .192/26 (59 each) | 10.40.65.0/24 |
| auea-vnet-sit-std-001 | auea-snet-sit-{web,app,db,pl}-001 | 10.40.72.0/26; .64/26; .128/26; .192/26 (59 each) | 10.40.73.0/24 |
| auea-vnet-uat-std-001 | auea-snet-uat-{web,app,db,pl}-001 | 10.40.80.0/26; .64/26; .128/26; .192/26 (59 each) | 10.40.81.0/24 |
| auea-vnet-avd-ctrl-001 | auea-snet-avd-personal-001 | 10.40.88.0/25 | 10.40.89.64/26; 10.40.89.128/25 |
| auea-vnet-avd-ctrl-001 | auea-snet-avd-prvj-pooled-001 | 10.40.88.128/26 | |
| auea-vnet-avd-ctrl-001 | auea-snet-avd-std-pooled-001 | 10.40.88.192/26 | |
| auea-vnet-avd-ctrl-001 | auea-snet-avd-nme-001 | 10.40.89.0/26 | |
| auea-vnet-sandbox-001 | auea-snet-sandbox-{web,app,db}-001 | 10.40.248.0/26; .64/26; .128/26 (59 each) | 10.40.248.192/26 |
| auea-vnet-aquisitions-001 [sic] | auea-snet-aquisitions-{web,app,db}-001 | 10.40.252.0/26; .64/26; .128/26 (59 each) | 10.40.252.192/26 |
| auea-vnet-management-001 | auea-snet-mgmt-jumphost-001 | 10.40.255.0/27 | |
| auea-vnet-management-001 | auea-snet-mgmt-devops-001 | 10.40.255.32/28 | |
| auea-vnet-management-001 | auea-snet-mgmt-pe-001 | 10.40.255.64/27 | |

## Subnet plan — Australia Southeast (Table 27)

Mirrors Table 26 exactly on 10.50.x.x with `ause-` names. Source anomalies: the hub rows
are mislabelled `auea-*` against 10.50 CIDRs (typo for `ause-`); a trailing block
duplicates hub/identity rows with conflicting entries (`ause-snet-connectivity-001`
10.50.0.0/26 vs GatewaySubnet 10.50.0.0/27; `ause-snet-appgw-001` 10.50.0.64/26 vs
public 10.50.0.64/27) — an internal inconsistency in the design document. The as-built
state below governs.

## As-built deployed subnets (authoritative deployed state, 40 subnets)

Deviations from plan: `-pl-` subnets deployed as `-pe-`; both hubs gained
`snet-vmx-001` (10.40.0.160/27, 10.50.0.160/27).

Hub AUEA: GatewaySubnet 10.40.0.0/27; mgmt .32/27; public .64/27; private .96/27; dmz
.128/27; vmx .160/27 (Meraki vMX appliance interfaces). Hub AUSE: same pattern on
10.50.0.x.

Hub subnet occupancy (Palo Alto As-Built v1.0; Azure-DHCP addresses statically reserved
on the vNICs): firewall mgmt interfaces from x.0.32/27 (e.g. 10.40.0.36/.37, AUEA N-S
pair) with **Panorama at 10.40.0.40 / 10.50.0.40**; firewall public interfaces from
x.0.64/27 (10.40.0.69/.70 N-S, .72/.73 E-W; 10.50.0.69/.70); private interfaces from
x.0.96/27 (10.40.0.101–.104; 10.50.0.101/.102) shared with the internal LB frontend; DMZ
interfaces from x.0.128/27 (10.40.0.132/.133; 10.50.0.132). Four of the source's mgmt
IPs are malformed — see `architecture/firewall-nva.md` data-quality flags before citing
per-device mgmt addresses.
Identity: auea-snet-identity-001 10.40.4.0/26; ause 10.50.4.0/26.
Management (both regions): jumphost x.255.0/27; devops x.255.32/28; pe x.255.64/27.
Prod-ctrl (both regions): web x.8.0/25; app x.8.128/25; db x.9.0/25; pe x.9.128/25;
appgw x.10.0/26. Prod-std (both regions): web x.48.0/25; app x.48.128/25; db x.49.0/25;
pe x.49.128/25; appgw x.50.0/26.

Dev/SIT/UAT/AVD/Sandbox/Acquisitions subnets are planned but not yet deployed (spoke
VNets provisioned at application migration).

## Design-stage reservations — Boomi MCS (NOT ratified, NOT deployed)

The Boomi DDD v0.1 (see `architecture/integration-services.md`) assigns APM-provided
space to be presented by the Boomi MCS across the cross-cloud VPN: **production
10.40.2.0/24**, **production DR 10.50.2.0/24** (never advertised simultaneously),
**non-production 10.40.3.0/24**.

**Reservation conflict flag**: all three ranges sit inside CIDRs this plan reserves as
*additional growth space for the hub VNets* (10.40.2.0/23 for
auea-vnet-connectivity-001; 10.50.2.0/23 for ause-vnet-connectivity-01). The DDD
asserts the ranges "are reserved in the APM address management plan and do not overlap
any advertised hub, spoke, or on-premises range" — true only while the hub growth
reservations remain unused. If the Boomi design proceeds, this plan must be updated to
reassign 10.40.2.0/24, 10.40.3.0/24 and 10.50.2.0/24 from hub growth to Boomi MCS;
until then treat the Boomi DDD open item ("confirm reserved ranges, no overlap") as
unresolved.

## Design-stage reservations — AI landing zone (TCD v0.5 proposed, OD-04; AUTHORITATIVE over earlier AI addressing)

Per the AI LZ TCD v0.5 (see `architecture/ai-landing-zone.md`; user-designated
authoritative), agent injection subnets (delegated Microsoft.App/environments,
size immutable) and PE subnets per workload subscription — carved from existing VNet
space and reserved blocks, no new supernet carve-outs:

prod-ctrl agent 10.40.10.64/26; prod-std agent 10.40.50.64/26; dev-ctrl agent
10.40.25.192/26; dev-std agent 10.40.65.0/26; sit-ctrl agent 10.40.33.0/26; sit-std
agent 10.40.73.0/26; uat-ctrl agent 10.40.41.96/27; uat-std agent 10.40.81.0/26.
PE subnets: prod x.9.128/25 | x.49.128/25 (existing); non-prod <env>.192/26 within
each first /24 (dev-ctrl 10.40.24.192/26 etc. — matches the planned `-pl-`→`-pe-`
positions).

**New gateway-tier VNet carve-outs from previously unallocated 10.40.96–10.40.247
space** (proposed): auea-vnet-nonprod-shrd-001 **10.40.120.0/23** (apim-injection
10.40.120.0/24, pe 10.40.121.0/26); auea-vnet-nonprod-shrd-appgw-001
**10.40.122.0/24**; auea-vnet-prod-shrd-001 **10.40.128.0/23** (apim-injection
10.40.128.0/24, pe 10.40.129.0/26); auea-vnet-prod-shrd-appgw-001 **10.40.130.0/24**.
No collisions with existing allocations; record here on ratification (OD-04 — no IPAM
system; this plan is the system of record). TCD internal inconsistency: its NAT rule
cites agent sources 10.40.11.0/24 / 10.40.51.0/24 — the tabled /26s above govern.

## Allocation rules

Subnets sized to accommodate dedicated-subnet services (SQL MI, ASE) plus reserved
growth space; IaaS and PaaS not co-hosted in a subnet; every subnet gets a dedicated NSG
and the VNet's route table; private endpoints live in the dedicated `-pe-` subnets.
Allocation changes go through the APM Infrastructure team (owner of network/route
changes).

---


# FILE 12 of 19 — `policies/policy-baseline.md`

---
status: active
source_document: AzurePolicyAssignmentListRecord.xlsx; APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx (planning summary cross-check)
source_version: Stream03-17July2026 (latest deployment stream in record)
ingested: 2026-07-21
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
---

# Azure Policy baseline

Deployed Azure Policy assignments across the APM ESLZ, as recorded in the Azure Policy
Assignment List Record. 218 assignments total: 175 policies and 43 initiatives; 32 are
custom definitions hosted at the APM management group, 186 are Azure built-ins.

Assignments were deployed in streams; this record covers **Stream01 (16 Dec 2025)** (202
assignments) and **Stream03 (17 Jul 2026)** (16 assignments). All assignments run with
enforcement mode `Default` (enforced).

## Assignment scope model

| Scope | Level | Assignments |
|---|---|---|
| APM | Intermediate root management group | 99 |
| AUS-MG-PLATFORM | Platform management group | 8 |
| AUS-MG-REGION | Region (landing zones) management group | 7 |
| AUS-MG-SANDBOX | Sandbox management group | 1 |
| Individual subscriptions | Subscription | 103 (ASC Default + BK backup policies) |

Pattern: broadly applicable guardrails are assigned once at the APM root; controls that
differ between platform and workload contexts are assigned in pairs at AUS-MG-PLATFORM /
AUS-MG-REGION (suffixed `.1`/`.2` or `(Platform)`/`(Region)`); sandbox-specific guardrails
sit at AUS-MG-SANDBOX; Defender for Cloud defaults and tag-driven backup policies are
per-subscription.

## Naming families

Assignment names are prefixed by family: **APMxxx** (APM-specific governance controls,
mostly custom), **AUM** (Azure Update Manager patch scheduling), **ASC** (Defender for
Cloud default initiative), **BK** (tag-driven VM backup), **COMP** (compliance initiatives
incl. ISM PROTECTED), **DIAG**/**LOG** (diagnostic settings to Log Analytics / storage),
**GEN** (general resource guardrails), **MON** (monitoring agents and change tracking).
Region-suffixed names use AUEA (Australia East) and AUSE (Australia Southeast).

## Management-group-scoped assignments

| Assignment | Scope | Type | Definition | Stream |
|---|---|---|---|---|
| APM001-Audit or Deny the creation of Private Link Private DNS Zones | APM | Policy | Custom | S1 |
| APM002-Audit Unattached NICs | APM | Policy | Custom | S1 |
| APM003-Audit unattached static Public IPs | APM | Policy | Custom | S1 |
| APM004-Enforce hybrid use benefit | APM | Policy | Custom | S1 |
| APM005.1-Trusted Launch (Platform) | AUS-MG-PLATFORM | Initiative | Custom | S1 |
| APM005.2-Trusted Launch (Region) | AUS-MG-REGION | Initiative | Custom | S1 |
| APM005.3-[Preview]: Configure prerequisites to enable Guest Attestation on Trusted Launch enabled VMs (Platform) | AUS-MG-PLATFORM | Initiative | Built-in | S1 |
| APM005.4-[Preview]: Configure prerequisites to enable Guest Attestation on Trusted Launch enabled VMs (Region) | AUS-MG-REGION | Initiative | Built-in | S1 |
| APM006.1-Deploy CanNotDelete Resource Lock on Resource Groups | APM | Policy | Custom | S1 |
| APM007.1-Deny Private DNS (Platform) | AUS-MG-PLATFORM | Policy | Custom | S1 |
| APM007.2-Deny Private DNS (Region) | AUS-MG-REGION | Policy | Custom | S1 |
| APM008.1-Deny Unmanaged Disks (Platform) | AUS-MG-PLATFORM | Policy | Custom | S1 |
| APM008.2-Deny Unmanaged Disks (Region) | AUS-MG-REGION | Policy | Custom | S1 |
| APM009.1-Management port access from the Internet should be blocked (Platform) | AUS-MG-PLATFORM | Policy | Custom | S1 |
| APM009.2-Management port access from the Internet should be blocked (Region) | AUS-MG-REGION | Policy | Custom | S1 |
| APM011.1-Enforce Sandbox Guardrails | AUS-MG-SANDBOX | Initiative | Custom | S1 |
| APM012-Compute Security | APM | Initiative | Custom | S1 |
| APM013-Enforce enhanced recovery and backup policies | APM | Policy | Custom | S1 |
| APM014.1-Public network access should be disabled for PaaS services | APM | Initiative | Custom | S1 |
| APM014.2-Audit Public network access should be disabled for PaaS services | APM | Initiative | Custom | S1 |
| APM015-[Preview]: Control the use of Key Vault in a Virtual Enclave | APM | Initiative | Built-in | S1 |
| APM016-[Preview]: Immutability must be enabled for backup vaults | APM | Policy | Built-in | S1 |
| APM017-Audit flow logs configuration for every virtual network | APM | Policy | Built-in | S1 |
| APM018-[Preview]: Immutability must be enabled for Recovery Services vaults | APM | Policy | Built-in | S1 |
| APM019-Unused resources driving cost should be avoided | APM | Initiative | Custom | S1 |
| APM020.1-Deny or Deploy and append TLS requirements and SSL enforcement on resources without Encryption in transit | APM | Initiative | Custom | S1 |
| APM020.2-Audit or Deploy and append TLS requirements and SSL enforcement on resources without Encryption in transit | APM | Initiative | Custom | S1 |
| APM020.3-App Service Environment should be configured with strongest TLS Cipher suites | APM | Policy | Built-in | S3 |
| APM020.4-Certificates using RSA cryptography should have the specified minimum key size | APM | Policy | Built-in | S3 |
| APM020.5-Keys using RSA cryptography should have a specified minimum key size | APM | Policy | Built-in | S3 |
| APM021-AppService append enable https only setting to enforce https setting | APM | Policy | Custom | S1 |
| APM022-AppService append sites with minimum TLS version to enforce | APM | Policy | Custom | S1 |
| APM025-Tagging Initiatives | APM | Initiative | Custom | S1 |
| APM028-Deny or Audit service endpoints on subnets | APM | Policy | Custom | S1 |
| APM029-Auditing on SQL server should be enabled | APM | Policy | Built-in | S1 |
| APM030-Required Tags on Azure VMs for Backup | APM | Policy | Custom | S1 |
| APM031-Required Tags on Azure VMs for Azure Update Management | APM | Policy | Custom | S1 |
| APM033-Deploy Diagnostic Settings for Activity Log to storage account | APM | Policy | Custom | S1 |
| APM038-Deny Application Gateway without TLS 1.2 minimum and Certificate Key Size ≥ 224 Bits | APM | Initiative | Custom | S3 |
| AUM01.1-Schedule recurring updates using AUM for Windows: Critical and Security Updates in Scope APM (Lead) | APM | Policy | Built-in | S1 |
| AUM01.2-Schedule recurring updates using AUM for Windows: Critical and Security Updates in Scope APM (Autopatch-01) | APM | Policy | Built-in | S1 |
| AUM01.3-Schedule recurring updates using AUM for Windows: Critical and Security Updates in Scope APM (Autopatch-02) | APM | Policy | Built-in | S1 |
| AUM02.1-Schedule recurring updates using AUM for Windows: Other Updates in Scope APM (Lead) | APM | Policy | Built-in | S1 |
| AUM02.2-Schedule recurring updates using AUM for Windows: Other Updates in Scope APM (Autopatch-01) | APM | Policy | Built-in | S1 |
| AUM02.3-Schedule recurring updates using AUM for Windows: Other Updates in Scope APM (Autopatch-02) | APM | Policy | Built-in | S1 |
| AUM03.1-Schedule recurring updates using AUM for Linux: Critical and Security Updates in Scope APM (Lead) | APM | Policy | Built-in | S1 |
| AUM03.2-Schedule recurring updates using AUM for Linux: Critical and Security Updates in Scope APM (Autopatch-01) | APM | Policy | Built-in | S1 |
| AUM03.3-Schedule recurring updates using AUM for Linux: Critical and Security Updates in Scope APM (Autopatch-02) | APM | Policy | Built-in | S1 |
| AUM04.1-Schedule recurring updates using AUM for Linux: Other Updates in Scope APM (Lead) | APM | Policy | Built-in | S1 |
| AUM04.2-Schedule recurring updates using AUM for Linux: Other Updates in Scope APM (Autopatch-01) | APM | Policy | Built-in | S1 |
| AUM04.3-Schedule recurring updates using AUM for Linux: Other Updates in Scope APM (Autopatch-02) | APM | Policy | Built-in | S1 |
| AUM05-Machines should be configured to periodically check for missing system updates | APM | Policy | Built-in | S1 |
| AUM05.1-Machines should be configured to periodically check for missing system updates | APM | Policy | Custom | S3 |
| AUM06-Configure periodic checking for missing system updates on azure virtual machines: Linux | APM | Policy | Built-in | S1 |
| AUM07-Configure periodic checking for missing system updates on azure virtual machines: Windows | APM | Policy | Built-in | S1 |
| COMP001-Australian Government ISM PROTECTED | APM | Initiative | Built-in | S1 |
| COMP02.1-Microsoft cloud security benchmark (Region) | AUS-MG-REGION | Initiative | Built-in | S1 |
| COMP02.2-Microsoft cloud security benchmark (Platform) | AUS-MG-PLATFORM | Initiative | Built-in | S1 |
| COMP03.1-Deny-Virtual machines and virtual machine scale sets without encryption at host enabled | APM | Policy | Built-in | S1 |
| COMP04-Microsoft Managed Control 1327 - Authenticator Management / Password-Based Authentication | APM | Policy | Built-in | S3 |
| DIAG001-Configure diagnostic settings for Azure Network Security Groups to Log Analytics workspace | APM | Policy | Built-in | S1 |
| DIAG002-Configure diagnostic settings for Blob Services to Log Analytics workspace | APM | Policy | Built-in | S1 |
| DIAG003-Configure diagnostic settings for File Services to Log Analytics workspace | APM | Policy | Built-in | S1 |
| DIAG004-Configure diagnostic settings for Queue Services to Log Analytics workspace | APM | Policy | Built-in | S1 |
| DIAG005-Configure diagnostic settings for Storage Accounts to Log Analytics workspace | APM | Policy | Built-in | S1 |
| DIAG006-Configure diagnostic settings for Table Services to Log Analytics workspace | APM | Policy | Built-in | S1 |
| DIAG007-Deploy - Configure diagnostic settings for SQL Databases to Log Analytics workspace | APM | Policy | Built-in | S1 |
| DIAG008-Deploy - Configure diagnostic settings for Azure Key Vault to Log Analytics workspace | APM | Policy | Built-in | S1 |
| DIAG009-Deploy Diagnostic Settings for Recovery Services Vault to Log Analytics workspace for resource specific categories. | APM | Policy | Built-in | S1 |
| DIAG010-Enable logging by category group for Backup vaults (microsoft.dataprotection/backupvaults) to Log Analytics | APM | Policy | Built-in | S1 |
| DIAG011-Enable logging by category group for Load balancers (microsoft.network/loadbalancers) to Storage - AUEA | APM | Policy | Built-in | S1 |
| DIAG012-Enable logging by category group for Load balancers (microsoft.network/loadbalancers) to Storage-AUSE | APM | Policy | Built-in | S1 |
| DIAG013-Configure Azure SQL database servers diagnostic settings to Log Analytics workspace-AUEA | APM | Policy | Built-in | S3 |
| DIAG014-Enable logging by category group for SQL databases (microsoft.sql/servers/databases) to Log Analytics-AUEA | APM | Policy | Built-in | S3 |
| GEN01-Allowed locations for resource groups | APM | Policy | Built-in | S1 |
| GEN010-[Preview]: Soft delete must be enabled for Recovery Services Vaults. | APM | Policy | Built-in | S1 |
| GEN011-[Preview]: Soft delete should be enabled for Backup Vaults | APM | Policy | Built-in | S1 |
| GEN012-Allow Only Approved VM Images by OS Family | APM | Policy | Custom | S3 |
| GEN013-Audit-Allow Only Approved VM Images by OS Family | APM | Policy | Custom | S3 |
| GEN02-Allowed resource types | APM | Policy | Built-in | S1 |
| GEN03-Not allowed resource types | APM | Policy | Built-in | S1 |
| GEN04.1-Do not allow deletion of resource types (Platform) | AUS-MG-PLATFORM | Policy | Built-in | S1 |
| GEN04.2-Do not allow deletion of resource types (Region) | AUS-MG-REGION | Policy | Built-in | S1 |
| GEN05.1-[Preview]: Resources should be Zone Resilient (Platform) | AUS-MG-PLATFORM | Initiative | Built-in | S1 |
| GEN06-Network interfaces should disable IP forwarding | APM | Policy | Built-in | S1 |
| GEN07-Network interfaces should not have public IPs | APM | Policy | Built-in | S1 |
| GEN08-Subnets should be private | APM | Policy | Built-in | S1 |
| GEN09-Deploy network watcher when virtual networks are created | APM | Policy | Built-in | S1 |
| LOG001-Enable logging by category group for Backup vaults (microsoft.dataprotection/backupvaults) to Storage-AUEA | APM | Policy | Built-in | S1 |
| LOG002-Enable logging by category group for Backup vaults (microsoft.dataprotection/backupvaults) to Storage-AUSE | APM | Policy | Built-in | S1 |
| LOG003-Enable logging by category group for Endpoints (microsoft.cdn/profiles/endpoints) to Storage-AUEA | APM | Policy | Built-in | S1 |
| LOG004-Enable logging by category group for Endpoints (microsoft.cdn/profiles/endpoints) to Storage-AUSE | APM | Policy | Built-in | S1 |
| LOG005-Enable logging by category group for Key vaults (microsoft.keyvault/vaults) to Storage-AUEA | APM | Policy | Built-in | S1 |
| LOG006-Enable logging by category group for Key vaults (microsoft.keyvault/vaults) to Storage-AUSE | APM | Policy | Built-in | S1 |
| LOG007-Enable logging by category group for Network security groups (microsoft.network/networksecuritygroups) to Storage-AUEA | APM | Policy | Built-in | S1 |
| LOG008-Enable logging by category group for Network security groups (microsoft.network/networksecuritygroups) to Storage-AUSE | APM | Policy | Built-in | S1 |
| LOG009-Enable logging by category group for Recovery Services vaults (microsoft.recoveryservices/vaults) to Storage-AUSE | APM | Policy | Built-in | S1 |
| LOG010-Enable logging by category group for Recovery Services vaults (microsoft.recoveryservices/vaults) to Storage-AUEA | APM | Policy | Built-in | S1 |
| LOG011-Enable logging by category group for Virtual networks (microsoft.network/virtualnetworks) to Storage-AUEA | APM | Policy | Built-in | S1 |
| LOG012-Enable logging by category group for Virtual networks (microsoft.network/virtualnetworks) to Storage-AUSE | APM | Policy | Built-in | S1 |
| LOG013-Configure Azure Activity logs to stream to specified Log Analytics workspace | APM | Policy | Built-in | S1 |
| LOG014-Enable logging by category group for SQL databases (microsoft.sql/servers/databases) to Storage-AUEA | APM | Policy | Built-in | S3 |
| LOG015-Enable logging by category group for SQL databases (microsoft.sql/servers/databases) to Storage-AUSE | APM | Policy | Built-in | S3 |
| MON001.1-Enable ChangeTracking and Inventory for virtual machines-AUEA | APM | Initiative | Built-in | S1 |
| MON001.2-Enable ChangeTracking and Inventory for virtual machines-AUSE | APM | Initiative | Built-in | S1 |
| MON002.1-Enable ChangeTracking and Inventory for virtual machine scale sets-AUEA | APM | Initiative | Built-in | S1 |
| MON002.2-Enable ChangeTracking and Inventory for virtual machine scale sets-AUSE | APM | Initiative | Built-in | S1 |
| MON003.1-Enable Azure Monitor with Azure Monitoring Agent(AMA) for VMs & VMSS-Windows-AUEA | APM | Initiative | Built-in | S1 |
| MON003.2-Enable Azure Monitor with Azure Monitoring Agent(AMA) for VMs & VMSS-Linux-AUEA | APM | Initiative | Built-in | S1 |
| MON004.1-Enable Azure Monitor with Azure Monitoring Agent(AMA) for VMs & VMSS-Windows-AUSE | APM | Initiative | Built-in | S1 |
| MON004.2-Enable Azure Monitor with Azure Monitoring Agent(AMA) for VMs & VMSS-Linux-AUSE | APM | Initiative | Built-in | S1 |
| MON005.1-Legacy - Enable Azure Monitor for VMs-AUEA | APM | Initiative | Built-in | S1 |
| MON005.2-Legacy - Enable Azure Monitor for VMs-AUSE | APM | Initiative | Built-in | S1 |
| MON008.1-Enable logging by category group for Data collection rules (microsoft.insights/datacollectionrules) to Log Analytics | APM | Policy | Built-in | S1 |
| MON008.2-Enable logging by category group for Data collection rules (microsoft.insights/datacollectionrules) to Log Analytics | APM | Policy | Built-in | S1 |

Notes:

- APM020.x is the encryption-in-transit family: paired Deny (020.1) and Audit (020.2)
  initiatives from Stream01, extended in Stream03 with ASE cipher-suite, RSA
  certificate/key minimum-size policies (020.3–020.5) and the APM038 Application Gateway
  TLS 1.2 / certificate key size ≥ 224-bit deny initiative.
- AUM05.1 (Stream03, custom) supersedes-in-function AUM05 (Stream01, built-in) for
  periodic update checking; both remain assigned in the record.
- GEN012/GEN013 (Stream03) introduce approved-VM-image allow-listing in Deny and Audit
  variants.
- COMP001 assigns the built-in **Australian Government ISM PROTECTED** initiative at the
  APM root; COMP02.x assigns Microsoft cloud security benchmark at Platform/Region.
- Numbering gaps (APM010, APM023–024, APM026–027, APM032, APM034–037, MON006–007) exist
  in the record; whether these were retired or never deployed is not stated in the source.

## Subscription-scoped assignments

### ASC Default (Microsoft Defender for Cloud)

The built-in `securitycenterbuiltin` initiative is assigned per-subscription on all 15
subscriptions: aus-sub-management, aus-sub-connectivity, aus-sub-identity,
aus-sub-security, aus-sub-sandbox-001, aus-sub-acquisitions-001, and the workload pairs
{dev,sit,uat,prod}-{controlled,standard}-001 plus aus-sub-avd-controlled-001.

### BK — tag-driven VM backup to Recovery Services Vaults

Backup enablement is driven by VM tags, assigned per subscription per region. BK01–BK04
cover general VM backup; BK05–BK08 cover SQL VM backup and are scoped to workload
subscriptions only.

| ID | Trigger tag | Vault region | Assigned to |
|---|---|---|---|
| BK01 | StandardVMBackup | AUEA | 13 subs (all except sandbox, acquisitions) |
| BK02 | BasicVMBackup | AUEA | same 13 |
| BK03 | StandardVMBackup | AUSE | same 13 |
| BK04 | BasicVMBackup | AUSE | same 13 |
| BK05 | StandardSQLVMBackup | AUEA | 9 workload subs ({dev,sit,uat,prod}-{controlled,standard}, avd-controlled) |
| BK06 | StandardSQLVM(OS)Backup | AUEA | same 9 |
| BK07 | StandardSQLVMBackup | AUSE | same 9 |
| BK08 | StandardSQLVM(OS)Backup | AUSE | same 9 |

The aus-sub-security BK01–BK04 assignments were added in Stream03; all other BK
assignments are Stream01. See `standards/tagging.md` for the backup tag scheme and
`architecture/resilience-dr.md` for the AUEA/AUSE vault posture.

## Stream03 (17 Jul 2026) additions

16 assignments: APM020.3–020.5 (TLS/RSA hardening), APM038 (App Gateway TLS deny
initiative), AUM05.1 (custom periodic update check), COMP04 (Microsoft Managed Control
1327 — Authenticator Management / Password-Based Authentication), DIAG013–014 and
LOG014–015 (SQL database diagnostics to Log Analytics and storage), GEN012–013 (approved
VM images), and BK01–BK04 for aus-sub-security.

## Cross-references from the Detailed Design v1.1 (17 Jul 2026)

The design's "APM ESLZ Base Policy Planning Summary (Revised)" appendix aligns with the
deployed record above, with these deltas worth verifying against the live tenant:

- Design plans **APM011.2-Enforce ALZ Sandbox Guardrails (Acquisitions)** at
  AUS-MG-ACQUISITIONS; the deployed record contains only APM011.1 at AUS-MG-SANDBOX.
- Design lists **COMP03.1** (deny VMs/VMSS without encryption at host) scoped to
  aus-mg-sandbox and aus-mg-acquisitions; the deployed record shows it at APM root.
- Design's BK planning covers connectivity/identity/management only; the deployed record
  extends BK01-08 to 13 subscriptions (record is newer and governs).

Operating model (DD69/DD70): policies managed via Azure Portal (not IaC); exemptions via
ServiceNow Cyber Security Request; standard non-compliance message references the Company
Cyber Security Policy; preview policies deliberately included for Zero Trust posture.
Custom definitions are hosted at the APM MG namespace; regulatory baselines are MCSB
(COMP02.x) and Australian Government ISM PROTECTED (COMP001). See
`policies/governance.md`.

---


# FILE 13 of 19 — `policies/governance.md`

---
status: active
source_document: APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx
source_version: 1.1 (17 July 2026)
ingested: 2026-07-21
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
---

# Governance

Scope note: the policy uplift paper (ISM control mappings, Essential Eight framing,
ownership and review cadence) has NOT yet been ingested — this file currently carries the
governance decisions from the Detailed Design v1.1 only.

## Compliance frame

Certification compliance is a guiding principle: MCSB, **RFFR**, **ISM**, and APM Policy.
Regulatory baseline initiatives applied estate-wide (DD70): **Microsoft cloud security
benchmark** (COMP02.x at Platform/Region) and **Australian Government ISM PROTECTED**
(COMP001 at APM root). The Controlled/Standard security-domain split exists specifically
to scope RFFR-regulated workloads (AUS-MG-CONTROLLED) apart from the rest.

## Policy operating model (DD69)

Policies are managed via the **Azure Portal** (not IaC). Standard non-compliance message:
"The resource you are deploying does not comply with the Company Cyber Security Policy.
If an exception is required, please submit a Cyber Security Request through ServiceNow."
— i.e. the **exemption path is a ServiceNow Cyber Security Request**. Preview policies
are deliberately included for Zero Trust posture. The as-built policy register is
`AzurePolicyAssignmentListRecord.xlsx` on APM SharePoint (Stream03 additions tagged
`Stream03-17July2026`); the ingested register is `policies/policy-baseline.md`.

## Key governance decisions

- Subscription creation/deletion controlled by the APM Infrastructure Team; "Permissions
  for creating new management groups" enabled; subscription policies enabled with
  exempted users (DD62/63).
- APM Infrastructure team owns NSG/ASG and all network, route, tag, firewall, and access
  changes (design assumption).
- No preview features in production without a step-out (assumption).
- IP management deliberately remains a shared document, not an IPAM system (accepted risk
  RS07) — `ipam/address-plan.md` mirrors the ratified allocations.
- Old/new LZ coexistence (DNS, backup, automation, storage) deferred to Phase 2 (RS09).
- An ESLZ test-case framework exists (categories: governance, security, compliance,
  networking, identity) — full test cases produced post-design.

## Design decision register (Detailed Design v1.1)

81 ratified decisions (DD1–DD81). Titles only in the register; full bodies in the source
document. Near-duplicate IDs in source preserved (14/15, 18/19, 26/27, 47/48). DevOps
decisions DD87–95 are deferred to the DevOps Wiki.

| ID | Decision |
|---|---|
| DD1 | Resource Naming Convention |
| DD2 | Billing Management |
| DD3 | Emergency Break Glass Account/s |
| DD4 | Extension of On-premises Authentication |
| DD5 | Adapting Account Management Practices |
| DD6 | Proposed Toolsets to Satisfy all Security Control (NFR): IAM |
| DD7 | Managed Identity vs Service Principal usages |
| DD8 | Default RBAC Roles List to be enforced |
| DD9 | Default RBAC Assignment |
| DD10 | Just-in-Time (JIT) Access |
| DD11 | Allocate two CIDRs for Australia Region |
| DD12 | VNet Sandbox Segregation and Traffic Inspection |
| DD13 | VNet Traffic Inspection and Peering |
| DD14/15 | Service Endpoints not to be used unless necessary |
| DD16 | User Defined Routes (UDRs) |
| DD17 | Public IP address creation shall be limited |
| DD18/19 | Private DNS Zone |
| DD20 | Private Endpoint |
| DD21 | Network Watcher |
| DD22 | Maximising Value and Efficiency in the Cloud |
| DD23 | Azure Update and Patch Management for Azure Servers |
| DD24 | Azure Update and Patch Management Orchestration |
| DD25 | Enable Change Tracking and Inventory |
| DD26/27 | Auto Scaling and Azure Monitor |
| DD28 | Strategies for Capacity and Availability Oversight |
| DD29 | Azure Storage Account Settings |
| DD30 | Shared Azure Storage Account Access |
| DD31 | Azure Monitor for Operational Logs |
| DD32 | Azure Monitor Alerts |
| DD33 | Enable Application Insight |
| DD34 | Enable VM Insight |
| DD35 | Baseline VM Monitoring |
| DD36 | Enable Network Insight |
| DD37 | Audit and Diagnostic Logging |
| DD38 | Log Analytics Workspace Separation: Operational vs Security |
| DD39 | System Logs Storage Destination: Data Retention |
| DD40 | Custom Workbook for Operation, Reporting for LZ |
| DD41 | Use Native DR Capabilities for PaaS |
| DD42 | High-Availability for Azure VM |
| DD43 | DR capabilities of Azure VM |
| DD44 | DR capabilities of Azure Application Gateway |
| DD45 | DR capabilities of Azure Storage |
| DD46 | DR capabilities of Azure SQL Managed Instances |
| DD47/48 | DR capabilities of Azure App Services |
| DD49 | Build Two (2) DCs across two AZs |
| DD50 | Primary and Secondary Data Centre Locations |
| DD51 | Azure Backup Organisation & Governance: Vault Strategy |
| DD52 | Backup Policies for Azure Cloud VMs Using RSV |
| DD53 | Backup Policies for Azure Cloud VMs With SQL Using RSV |
| DD54 | Backup capabilities of PaaS services: Azure SQL Databases |
| DD55 | Auto-Scaling for Azure VM |
| DD56 | Azure PaaS |
| DD57 | Azure Storage Account (Additional 01) |
| DD58 | Key Vaults Specific Settings |
| DD59 | Protecting SSH Private Keys |
| DD60 | Platform Key Vaults |
| DD61 | Use Encryption at Host over Azure Disk Encryption |
| DD62 | Management Group Hierarchy |
| DD63 | Management Group Names/Descriptions |
| DD64 | Environment Segregation |
| DD65 | Grouping resources with application affinity |
| DD66 | Base Platform Resource Groups |
| DD67 | Resource Locks |
| DD68 | Tagging Scheme (Revised) |
| DD69 | Azure Policies Deployment |
| DD70 | Azure Regulatory Baseline Policy Initiative |
| DD71 | Network Management Traffic to Administrative Infrastructure (Jump Host) |
| DD72 | Enforce a Minimum Required Version of TLS |
| DD73 | Secure Admin Workstations (Jump Host) |
| DD74 | Data Security in Transit (Between DB and Web Servers) |
| DD75 | Encryption for Network Communication in Azure |
| DD76 | Selection of Cryptographic Algorithms and Protocols |
| DD77 | Azure DDoS Protection |
| DD78 | Azure Application Gateway with WAF |
| DD79 | Network Security Groups (NSGs) |
| DD80 | Azure Front Door |
| DD81 | Azure Bastion |

## Security standards decisions (summary)

TLS minimum enforced platform-wide by policy; databases mandate TLS 1.2+ (DD72). HTTPS
everywhere with HTTP→HTTPS redirect; Private Link for web-to-DB paths (DD74/75).
High-assurance crypto only: DH modulus ≥2048, ECDH/ECDSA ≥224-bit, SHA-2 ≥224-bit output,
AES-256 (DD76, per FR1.6, NRF 5.10, 5.13–5.21). **Encryption at Host over ADE** (DD61;
ADE retires Sep 2028). Jump hosts in the Management subnet with NSG-restricted 22/3389,
MFA, and JIT logging (DD71/73), pending PAWs via AVD.

## Known compliance gaps (as-built)

- Privileged accounts remain synchronised from AD DS to Entra (NFR 1.9 not met) — APM to
  investigate an alternative pathway (DD5).
- JIT administration only partially implemented (MFA + RBAC; PIM excluded this phase)
  (DD10, NFR 1.1).
- Log retention: security LAWs at 30-day handover baseline pending security team
  adjustment against the 180-day requirement (operational logs meet it via storage
  export).

Cross-references: `policies/policy-baseline.md` (assignments),
`architecture/landing-zones.md` (MG/subscription governance),
`standards/tagging.md` (enforced tag scheme).

---


# FILE 14 of 19 — `standards/naming.md`

---
status: active
source_document: Azure ESLZ Naming Standards-17July2026.pdf; APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx (design context); APM_ES_AI_LZ_TCD v0.5 (authoritative AI config — see architecture/ai-landing-zone.md)
source_version: 17 July 2026 (per "Updated Date" in document)
ingested: 2026-08-02
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
supersedes: Azure Front Door (v2) naming (marked [INCORRECT] in source; excluded — see Ingest flags)
---

# Naming standard

Ratified APM resource naming convention (CAF-derived). Source document instruction:
"Follow the below and update any new items as approved."

Items the source marks as incorrect, internally inconsistent, or colliding are **not**
carried into the tables below — they are listed in [Ingest flags](#ingest-flags--unresolved-items-not-part-of-the-ratified-standard)
for resolution with APM.

## General grammar

```
[region]-[abbreviation]-[environment]-[apm security domain]-[descriptor]-[instance identifier]
```

Example: `auea-<abbrev>-prod-std-demo-001`

Two notational styles exist:

1. **Hyphenated (default)** — tokens separated by `-`, long-form region/environment.
2. **Shortform concatenated** — used where Azure constrains names (storage accounts) or
   by convention for VMs, Palo Alto firewalls, and internal LBs: shortform tokens
   concatenated with **no hyphens** (e.g. `aestpcappname001`, `aefwppalo001`,
   `aevmpadds001`). The source writes these format strings with hyphens between tokens,
   but every example concatenates — the examples govern.

Platform subscriptions (connectivity, identity, management, security) have no APM
security domain token; the environment slot carries the platform function
(e.g. `auea-rg-connectivity-palo-001`, `auea-vnet-connectivity-001`).

## Token registry

| Token | Values |
|---|---|
| region | `auea` = Australia East, `ause` = Australia Southeast |
| region:shortform | `ae` = Australia East, `as` = Australia Southeast |
| country | `aus` (lower) / `AUS` (management groups) |
| environment | `prod`, `dev`, `sit`, `uat`, `nonprod`; platform: `connectivity` (`conn`), `identity`, `management` (`mgmt`), `security` (`sec`) |
| environment:shortform | `p` = prod, `m` = management, `x` = security (observed in storage examples) |
| apm security domain | `controlled` / `standard` (full word — subscriptions only); `ctrl` / `std` (all other resources) |
| apm security domain:shortform | `c` = controlled, `s` = standard |
| instance identifier | `001` (three digits); subscriptions and some VM/rule examples use two digits (`01`) |
| global scope | `apm` prefix replaces region for globally unique services (Front Door family) |

## Abbreviation registry

| Abbrev | Resource | Abbrev | Resource |
|---|---|---|---|
| `mg` | Management group | `sub` | Subscription |
| `rg` | Resource group | `vnet` | Virtual network |
| `snet` | Subnet | `rt` | Route table |
| `fw` | Firewall (Palo Alto) | `nsg` | Network security group |
| `lbi` | Internal load balancer | `lbe` | External load balancer |
| `pip` | Public IP | `fe` | Frontend |
| `bepool` | Backend pool | `lbrule` | LB rule |
| `probe` | Probe | `appgw` | Application Gateway |
| `vm` | Virtual machine | `nic` | Network interface |
| `osdisk` | OS disk | `datadisk` | Data disk |
| `kv` | Key Vault | `st` | Storage account |
| `rsv` | Recovery Services vault | `rsvp` | Backup policy |
| `law` | Log Analytics workspace | `pdz` | Private DNS zone |
| `pep` | Private endpoint | `avail` | Availability set |
| `ipconfig` | IP configuration | `sql` | SQL Database server |
| `sqldb` | SQL database | `sqlep` | SQL Elastic Pool |
| `sqlmi` | SQL Managed Instance | `ase` | App Service environment |
| `asp` | App Service plan | `func` | Function App |
| `aapi` | Application Insights | `fde` | Front Door endpoint |
| `fdfp` | Front Door firewall policy | `adf` | Azure Data Factory |
| `app` | Azure Web App | `uami` / `sami` | Managed identity (user/system assigned) |
| `logic` | Logic App | | |

Note: `aapi` for Application Insights is as documented (CAF commonly uses `appi`) — see
Ingest flags. The Front Door **Profile** abbreviation is unresolved — see Ingest flags.

## Per-resource formats

### Governance scopes

| Resource | Format | Example | Notes |
|---|---|---|---|
| Management group | `[COUNTRY]-MG-[SCOPE]` | `AUS-MG-PLATFORM`, `AUS-MG-CONNECTIVITY`, `AUS-MG-IDENTITY`, `AUS-MG-SECURITY`, `AUS-MG-MANAGEMENT`, `AUS-MG-PROD-CONTROLLED`, `AUS-MG-DEV-STANDARD` | All capitals |
| Subscription | `[country]-sub-[environment]-[apm security domain]-[instance]` | `aus-sub-prod-controlled-01`, `aus-sub-uat-standard-01` | All lowercase; security domain as **full word** |
| Resource group | `[region]-rg-[environment]-[apm security domain]-[descriptor]-[instance]` | Connectivity: `auea-rg-connectivity-palo-001` · Identity: `auea-rg-identity-adds-001` · Management: `auea-rg-management-monitoring-001` · Security: `auea-rg-security-logs-001` · Workload: `auea-rg-prod-ctrl-[appname]-001` · Backup: `auea-rg-prod-std-backup-001` | For Palo Alto, `palo` must always appear in the RG name. Backup RG pattern: `[region]-rg-[env]-[ctrl/std]-backup-[instance]` |

### Networking

| Resource | Format | Example | Notes |
|---|---|---|---|
| Virtual network | `[region]-vnet-[environment]-[apm security domain]-[instance]` | `auea-vnet-connectivity-001`, `auea-vnet-prod-std-001`, `auea-vnet-avd-ctrl-001` | All VNets peered to hub (Connectivity) except Sandbox and Acquisition |
| Subnet | `[region]-snet-[descriptor]-[instance]` | `auea-snet-app-001`, `ause-snet-db-001` | No environment/security domain — inherited from parent VNet |
| Route table | `[region]-rt-[environment]-[apm security domain]-[descriptor]-[instance]` | `auea-rt-connectivity-001`, `ause-rt-dev-std-001` | Source example `auea-rt-prod-crtl-001` contains a typo — see Ingest flags |
| NSG | `[region]-nsg-[environment]-[apm security domain]-[descriptor]-[instance]` | `ause-nsg-dev-ctrl-web-001`, `ause-nsg-prod-std-db-001`, `auea-nsg-connectivity-001`, `auea-nsg-mgmt-jumphost-001` | |
| NSG rule | `[allow/deny]-[ob/ib]-[source]-to-[destination]-[optional descriptor]-[instance]` | `deny-ib-vnet-to-vnet-https-01` | `ib` inbound, `ob` outbound. Second source example contains a typo — see Ingest flags |
| Public IP | `[region]-pip-[environment]-[descriptor]-[instance]` | `auea-pip-conn-s2sgateway-001` | AppGw PIP examples deviate — see Ingest flags |
| Private DNS zone | `[region]-pdz-[descriptor]-[instance]` | `auea-pdz-blob-001`, `ause-pdz-file-001`, `auea-pdz-sqldb-001`, `ause-pdz-appsvc-001` | |
| Private endpoint | `[region]-pep-[environment]-[apm security domain]-[descriptor]-[instance]` | `auea-pep-prod-ctrl-kvsecrets-001`, `auea-pep-sit-std-aestpcblob001-001` | |
| Application Gateway | `[region]-appgw-[environment]-[apm security domain]-[optional descriptor]-[instance]` | `auea-appgw-conn-001`, `auea-appgw-prod-ctrl-001` | In connectivity subscription use RG `[region]-rg-connectivity-appgw-001` |
| Network Watcher | (Azure default names) | `NetworkWatcher_australiaeast` in RG `NetworkWatcherRG` | One per subscription per region. Source format line inconsistent with examples — see Ingest flags |
| Availability set | `[region]-avail-[environment]-[apm security domain]-[descriptor]-[instance]` | `auea-avail-conn-palo-01` | |
| IP config | `[region]-ipconfig-[environment]-[apm security domain]-[descriptor]-[instance]` | `auea-ipconfig-aefwppalo001-001` | Descriptor is the parent NIC/VM name |

### Palo Alto NVA stack (shortform concatenated)

| Resource | Format | Example |
|---|---|---|
| Firewall VM | `[region:sf][fw][env:sf][descriptor][instance]` | `aefwppalo001`, `asfwppalo001` |
| OS disk | `[region:sf]-osdisk-[vmname]` | `ae-osdisk-aefwppalo001` |
| Data disk | `[region:sf]-datadisk-[vmname]-[instance]` | `ae-datadisk-aefwppalo001-001` |
| NIC | `[region:sf]-nic-[vmname]-[instance]` | `ae-nic-aefwppalo001-001` |
| Internal LB | `[region:sf][lbi][env:sf][descriptor][instance]` | `aelbippalo001`, `aslbippalo001` |
| ILB Public IP | `auea-pip-prod-[descriptor]-[instance]` | — |
| ILB Frontend | `auea-fe-prod-[descriptor]-[instance]` | — |
| ILB Backend pool | `auea-bepool-prod-[descriptor]-[instance]` | — |
| ILB Rule | `auea-lbrule-prod-[descriptor]-https-[instance]` | — |
| ILB Probe | `auea-probe-prod-[descriptor]-https-[instance]` | — |

### Compute and identity

| Resource | Format | Example | Notes |
|---|---|---|---|
| VM (server host) | `[region:sf][vm][env:sf][domain:sf][descriptor][instance]` | `aevmpscrm01`, `aevmpcsp01` | OS disk / data disk / NIC follow the Palo Alto disk/NIC patterns above |
| ADDS VM | same as VM | `aevmpadds001`, `asvmpadds001` | RG: `[region]-rg-identity-adds-001` |
| Managed identity | `[region]-[uami/sami]-[environment]-[apm security domain]-[descriptor]-[instance]` | `auea-uami-management-demo-001`, `auea-sami-management-demo-001` | `u` = user assigned, `s` = system assigned |

### Storage, backup, and monitoring

| Resource | Format | Example | Notes |
|---|---|---|---|
| Storage account | `[region:sf][st][env:sf][domain:sf][descriptor][instance]` (concatenated) | `aestmopslog001`, `aestpcappname001`, `asstpsappname001` | |
| Security flow-log SA | `[region:sf]stxflowlog[instance]` | `aestxflowlog001` | |
| Security diagnostic SA | `[region:sf]stxsecdiag[instance]` | `aestxsecdiag001` | |
| Recovery Services vault | (see Ingest flags — format string and examples disagree) | `auea-rsv-connectivity-001`, `auea-rsv-prod-ctrl-001` | All controlled/standard subscriptions also get `[region]-rg-[env]-[ctrl/std]-backup-001` |
| Backup policy | `[region]-rsvp-[environment]-[apm security domain]-[descriptor]-[instance]` | `auea-rsvp-prod-ctrl-backup-basic-001`, `auea-rsvp-prod-ctrl-vmsqlbackup-enhanced-001` | |
| Log Analytics | `[region]-law-[environment]-[descriptor]-[instance]` | `auea-law-mgmt-operation-001`, `auea-law-sec-001` | RGs: Management → `<region>-rg-management-monitoring-001`; Security → `<region>-rg-security-logs-001` |
| Key Vault | `[region]-kv-[environment]-[apm security domain]-[descriptor]-[instance]` | `auea-kv-management-001`, `ause-kv-prod-ctrl-001` | Management KVs in `[region]-rg-management-sharedservices-001` |

### Application and data services

All follow the general grammar `[region]-[abbrev]-[environment]-[apm security domain]-[descriptor]-[instance]` unless noted.

| Resource | Abbrev | Example | Notes |
|---|---|---|---|
| SQL Database server | `sql` | `auea-sql-prod-std-demo-001`, `auea-sql-nonprod-ctrl-demo-001` | 128-char limit |
| SQL database | `sqldb` | `auea-sqldb-prod-std-demo-001` | 116-char limit |
| SQL Elastic Pool | `sqlep` | `auea-sqlep-prod-std-demo-001` | |
| SQL Managed Instance | `sqlmi` | `auea-sqlmi-prod-std-demo-001` | |
| App Service environment | `ase` | `auea-ase-prod-std-demo-001` | |
| App Service plan | `asp` | `auea-asp-prod-std-demo-001` | |
| Function App | `func` | `auea-func-prod-std-demo-001` | |
| Application Insights | `aapi` | `auea-aapi-prod-std-demo-001` | As documented; CAF norm is `appi` — see Ingest flags |
| Azure Data Factory | `adf` | `auea-adf-prod-ctrl-demo-001` | |
| Azure Web App | `app` | `auea-app-prod-ctrl-demo-001` | 2–60 chars, globally unique |
| Logic App | `logic` | `auea-logic-prod-std-demo-001` | |
| External LB (frontend PIP) | — | `auea-lbe-prod-std-demofepip-001` | Format string says `[lb]`, example uses `lbe` — see Ingest flags |
| External LB (PIP) | — | `auea-lb-prod-std-demofeip-001` | See Ingest flags |
| Front Door endpoint | `fde` | `apm-fde-prod-std-demo-001` | `apm` global prefix replaces region |
| Front Door firewall policy | `fdfp` | `apm-fdfp-prod-std-demo-001` | `apm` global prefix replaces region |
| Front Door profile | — | — | Globally unique, 5–64 chars, `apm` prefix; **abbreviation unresolved** — see Ingest flags |

## Design heritage (Detailed Design v1.1, DD1)

Pre-existing naming was inconsistent (mixed `rg-`/`apm-` prefixes). The convention is
inherited from a previous vendor baseline with two APM changes: the **APM security
domain** segment (controlled/standard) as a first-class token, and abbreviated region
names to fit Azure length limits. The design's Table 7 is a living standard explicitly
superseded by the 17 July 2026 PDF (this file's primary source) for Stream03 additions.
As-built, all resources follow the standard except Azure-generated defaults
(`AzureBackupRG_australiaeast_1`, `NetworkWatcherRG`).

## Ingest flags — unresolved items (not part of the ratified standard)

Flagged at ingest on 2026-07-21 per instruction: collisions and discrepancies are recorded
here and deliberately **not** inserted into the tables above. Resolve with APM and
re-ingest.

1. **Front Door Profile abbreviation collides with Data Factory.** The profile example is
   `apm-adf-prod-std-demo-001`, but `adf` is also the documented Azure Data Factory
   abbreviation (`auea-adf-prod-ctrl-demo-001`). Likely intended `afd` (as used in the
   superseded v2 section, `global-afd-001`). Not inserted.
2. **Azure Front Door (v2) section is marked `[INCORRECT]` in the source**
   (`global-afd-001` in `global-rg-connectivity-frontdoor-001`). Excluded from the
   standard; recorded in frontmatter `supersedes`.
3. **Recovery Services vault format vs examples.** Format string places region fifth
   (`[rsv]-[environment]-[apm security domain]-[descriptor]-[region]-[instance]`) but both
   examples are region-first (`auea-rsv-prod-ctrl-001`), consistent with every other
   resource type. Neither variant inserted as the format; examples recorded.
4. **Network Watcher format vs examples.** Format says `NetworkWatcherRG_[region]`;
   examples are `NetworkWatcher_australiaeast` (resource) in RG `NetworkWatcherRG`
   (Azure defaults). Examples recorded; format line not inserted.
5. **External Load Balancer abbreviation inconsistency.** Both external LB sections use
   `[lb]` in the format string; the abbreviation registry and first example use `lbe`;
   the second example uses bare `lb` (`auea-lb-prod-std-demofeip-001`). No format
   inserted; needs a ruling on `lb` vs `lbe`.
6. **Typos in source examples (not propagated):** `auea-rt-prod-crtl-001` (`crtl` →
   `ctrl`), `allow-ob-azmoniror-to-law-https-01` (`azmoniror` → `azmonitor`),
   "User Assigneed" (→ Assigned).
7. **Application Insights `aapi`** deviates from the common CAF abbreviation `appi`.
   Inserted as documented (the source is the authority) but flagged in case it is a typo.
8. **Application Gateway public IP examples** (`ae-pip-p-appgw-001`) use shortform
   region + shortform environment, inconsistent with the Public IP section
   (`auea-pip-conn-s2sgateway-001`). Both recorded; pattern needs a ruling.
9. **Australia Southeast examples throughout** (`ause`/`as`). The corpus index notes the
   ratified DR posture is multi-zone single-region Australia East, superseding Australia
   Southeast (architecture/resilience-dr.md — currently a stub). The naming standard
   (17 July 2026) still carries `ause` examples; tokens retained as documented, but
   confirm whether Australia Southeast naming remains in scope.

## Design-stage additions — AI LZ TCD v0.5 (proposed, pending approval)

New abbreviations proposed under the standard's update process: **aif** (AI Foundry
account), **cosno** (Cosmos DB NoSQL), **srch** (AI Search), **apim** (API
Management), **wafpol** (AppGW WAF policy). Environment token usage: `nonprod` only
for the shared gateway tier spanning dev/sit/uat. New subnet descriptors in use:
`agent` (Foundry injection), `apim-injection`. Private DNS zone resources retain
mandatory privatelink FQDN names; `[region]-pdz-[descriptor]-001` for inventory
records only. Non-prod storage-account env shortforms TBC with the standard's owner.
See `architecture/ai-landing-zone.md`.

---


# FILE 15 of 19 — `standards/tagging.md`

---
status: active
source_document: APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx
source_version: 1.1 (17 July 2026)
ingested: 2026-07-21
baseline: partner-delivered  # see SKILL.md "Baseline provenance"
---

# Tagging standard

## Enforcement (DD68, Revised)

Every supported resource requires tags. **Azure Policy blocks resource group creation
without mandatory tags**, and tags inherit (auto-apply) from RG to contained resources
(RG tags are not natively inherited — policy does it). Enforced by **APM025-Tagging
Initiatives** (custom initiative `apm025-tagging-initiatives`, APM scope), plus APM030
(backup tags on VMs) and APM031 (update-management tags on VMs). Azure limits: 50
tags/resource, name ≤512 chars (some resources 15 tags max), value ≤256 chars, no
`< > % & \ ? /` in names.

## Tag scheme (all mandatory)

| Tag | Source of values | Example values | Notes |
|---|---|---|---|
| Criticality | Service catalog | Low, Medium, High | Recovery urgency classification |
| application-id | Service catalog | saphana, avd, paloalto, sharepoint | Unique application ID |
| business-service | Service catalog | health, hr, payroll, digital technology marketing | Owning business service |
| apm-security-domain | Service catalog | controlled, standard, platform | Auto-inherited from RG/subscription. controlled = RFFR-regulated; standard = non-RFFR; platform = corporate services |
| environment | Service catalog | SECURITY, MGMT, IDY, CONN, DEV, SIT, UAT, TEST, PROD, SBX | Auto-inherited from RG/subscription |
| owner | Org structure | Integration Platform, Cloud Platform, Data Platform, … | Application owner (team) |
| technicalcontact | Outlook GAL | (team mailbox) | Business service owner contact |
| cost-centre | SAP Finance cost centre list | XXXXXXX | No leading zeroes |
| operationalteam | Org structure | Integration Platform, Cloud Platform, … | Support team |
| service-component-type | Service catalog | sqldb, redis, firewall, webapp, private dns, key vault | Component role |
| backup | Application owner | BasicVMBackup, StandardVMBackup, StandardSQLVMBackup, StandardSQLVM(OS)Backup | Drives BK01–BK08 auto-backup policy enrolment (see `architecture/resilience-dr.md`) |
| enableupdate | — | Yes, no | AUM opt-in (section 6.x table only) |
| update-stage | — | Lead, auto-patch01, auto-patch02 | Patch ring; drives AUM maintenance configurations (see `architecture/platform-services.md`) |

## Source discrepancies (for remediation)

1. The appendix "Details Tagging Scheme" (Table 44) lists only 11 tags — it **omits
   `enableupdate` and `update-stage`**, which appear in the section 6.x mandatory table
   and are demonstrably in use (AUM patch rings). One table needs correcting.
2. The section 6.x table duplicates `service-component-type` (rows 10/11) and skips a
   row number.
3. The `backup` tag description names three tiers (Basic/Standard/Enhanced) but the value
   list has four values and no `Enhanced*` value — enhanced policies exist
   (`…-vmsqlbackup-enhanced-001`) without a documented tag value.

---


# FILE 16 of 19 — `references/remediation-register.md`

> Skill-internal copy of the remediation register. The corpus files marked
> `baseline: partner-delivered` intentionally preserve these defects as the handover
> record. Working copy for APM edits: `APM-ESLZ-Remediation-Register.md` in the
> ESLZ-PLATFORM-INFO project folder.

# APM ESLZ — Source Remediation Register & CAF Deviation Log

Compiled 21 July 2026 (A5 added 22 July 2026 from ingest of `Palo Alto Firewall
Deployment As-Built_V1.0.docx`) from ingest of `AzurePolicyAssignmentListRecord.xlsx`
(Stream03-17July2026) and `APM Azure Landing Zone (APAC) - DetailedDesign v 1.1.docx`,
cross-checked against `Azure ESLZ Naming Standards-17July2026.pdf` (previously ingested).

## Part A — Discrepancies to fix at source

### A1. Detailed Design v1.1 (document corrections)

| # | Location | Issue | Suggested fix |
|---|---|---|---|
| 1 | Table 27 (AUSE subnet plan) | Hub rows labelled `auea-vnet-connectivity-001` / `auea-snet-*` against 10.50.x CIDRs | Relabel `ause-` |
| 2 | Table 27 trailing block | Conflicting duplicate rows: `ause-snet-connectivity-001` 10.50.0.0/26 overlaps GatewaySubnet 10.50.0.0/27; `ause-snet-appgw-001` 10.50.0.64/26 overlaps public subnet 10.50.0.64/27 | Delete/reconcile the duplicate block against as-built |
| 3 | Tables 26/27 vs as-built | Planned `-pl-` subnets deployed as `-pe-` | Update plan tables to `-pe-` (matches naming standard) |
| 4 | Hub subnet tables | `snet-vmx-001` (10.40.0.160/27, 10.50.0.160/27) deployed but absent from design | Add to design with purpose statement |
| 5 | Table 25 (AUSE VNets) | `-01` instance suffixes vs `-001` deployed and standard | Normalise to `-001` |
| 6 | §6.x + Table 44 (tagging) | Appendix omits `enableupdate` and `update-stage`; §6.x duplicates `service-component-type` and mis-numbers rows | Single authoritative tag table carrying all 13 tags |
| 7 | Tagging — `backup` tag | Description names Basic/Standard/Enhanced tiers; value list has four values, none `Enhanced*`, yet `…-vmsqlbackup-enhanced-001` policies exist | Define the enhanced tag value or remove the tier from prose |
| 8 | Design decision register | Duplicate IDs/titles: DD14/15, DD18/19, DD26/27, DD47/48; DD87–95 exist only in DevOps Wiki | De-duplicate; either import DevOps DDs or reference the wiki formally |
| 9 | As-built MG placement table | aus-sub-acquisitions-001 path shows AUS-MG-SANDBOX; aus-sub-sandbox-001 and aus-sub-avd-controlled-001 show paths directly under APM | Correct paths (or move subs if the table reflects reality) |
| 10 | Subscription model (Table 35) | aus-sub-avd-controlled-001 (14th, as-built) absent from the 13-subscription design | Add AVD subscription to the model |
| 11 | UDR section | Next-hop documented as placeholder 1.1.1.1 | Update with the firewall ILB frontend IP |
| 12 | RG tables | Design `[r]-rg-dns-001` vs as-built `[r]-rg-connectivity-dns-001` | Align design to as-built |
| 13 | Network Watcher | Planned `[region]-nw-[env]-001` naming vs as-built Azure defaults (`NetworkWatcher_australiaeast` in `NetworkWatcherRG`) | Ratify the Azure-default exception in the design (naming PDF already does) |
| 14 | Budget register (Table 47) | Second budget named `BudgetAlertFor-aus-sub-management` is scoped to db53478c… (the security subscription); AUD 5,000 placeholder amounts; recipient mailbox flagged "pending update" | Rename to …-security; set real amounts and recipients |
| 15 | Alert appendix (Table 46) | prod-standard-001 present in Service Health list but missing from Resource Health list | Add the missing rule (or record why) |
| 16 | Storage as-built list | Numbered list skips No. 4 — `asstmopsdiaglog001` table absent though the account exists | Add the missing table |
| 17 | Resource names as deployed | `aquisitions` misspelling ("acquisitions") consistent in VNet/subnet names | Decide: ratify the spelling as-is in the standard, or plan renames — don't leave undocumented |

### A2. Open design/compliance actions (source-level, not just editorial)

| # | Item | Issue |
|---|---|---|
| 18 | DD5 / NFR 1.9 | Privileged accounts still synchronised from AD DS to Entra; as-built notes this "could not be completed" — alternative pathway unresolved |
| 19 | DD10 / NFR 1.1 | JIT administration only partial (MFA + RBAC); PIM excluded this phase yet MG RBAC uses PIM-eligible assignments — clarify licence/ownership |
| 20 | RBAC expiry cliff | All MG-level role assignments are eligible, time-bound, expiring **Nov 2026** — renewal process needed before expiry |
| 21 | Security LAW retention | 30 days (handover baseline) vs NFR 9.9 180-day requirement; security team to set deliberately |
| 22 | Resource locks (DD67) | Policy created but assignment "pending post-deployment completion" — confirm now deployed |
| 23 | DR posture conflict | Corpus index references a ratified multi-zone single-region (AUEA) DR decision superseding AUSE; Detailed Design v1.1 actively builds AUSE as regional pair (VNets, GRS+CRR vaults, DCs). Which governs? Ingest the DR decision paper and align the design |
| 24 | VM Insights (DD34) | Dependency/Map agent deprecated (new onboarding blocked since Sep 2025, retiring 2028) — design still references it; formally shift to AMA-based tracking |

### A3. Policy register (`AzurePolicyAssignmentListRecord.xlsx`)

| # | Issue | Suggested fix |
|---|---|---|
| 25 | COMP04 assignment name contains a pipe (`… Authenticator Management \| Password-Based Authentication`) — breaks tabular exports/parsers | Rename without the pipe |
| 26 | Numbering gaps: APM010, APM023–024, APM026–027, APM032, APM034–037, MON006–007 | Record disposition (retired / reserved / never deployed) in the register |
| 27 | AUM05 (built-in, Stream01) and AUM05.1 (custom, Stream03) both assigned for the same control | Retire one or document the supersession |
| 28 | MON008.1 / MON008.2 have identical names with no region discriminator | Add AUEA/AUSE suffix per the DIAG/LOG convention |
| 29 | DIAG011/012 (load balancers → Storage) follow the LOG-family pattern but sit in DIAG | Renumber or note the taxonomy exception |
| 30 | Design plans APM011.2 (Acquisitions guardrails) and COMP03.1 at sandbox/acquisitions scopes; deployed record shows APM011.1 only and COMP03.1 at APM root | Reconcile design intent vs deployment; deploy APM011.2 or amend design |

### A4. Naming Standards PDF (carried from previous ingest — still open)

| # | Issue |
|---|---|
| 31 | Front Door Profile example uses `adf`, colliding with Data Factory; likely intended `afd` |
| 32 | Front Door v2 section marked `[INCORRECT]` in source — needs replacement content |
| 33 | RSV format string places region fifth; every example is region-first — ratify region-first |
| 34 | External LB: format `[lb]` vs registry/example `lbe` vs bare-`lb` example — needs a ruling |
| 35 | AppGW PIP examples (`ae-pip-p-appgw-001`) use shortform region+env, conflicting with the full-form Public IP pattern |
| 36 | `aapi` for Application Insights deviates from CAF `appi` — confirm intentional |
| 37 | Typos: `auea-rt-prod-crtl-001`, `allow-ob-azmoniror-to-law-https-01`, "User Assigneed" |

### A5. Palo Alto Firewall Deployment As-Built v1.0 (added 22 Jul 2026)

| # | Location | Issue | Suggested fix |
|---|---|---|---|
| 38 | Instance table vs interface/template/device-group sections | Device names inconsistent: `aefwppalo00x`/`asfwppalo00x` vs `aefwpalo00x`/`asfwpalo00x` (single "p") | Verify deployed names in Azure; correct document to match |
| 39 | Template structure | TS-NS-AU-Southeast lists member `aefwpalo001` (an AUEA N-S device) | Correct to `asfwpalo001` |
| 40 | Table 8 (interface config) | Malformed mgmt IPs `10.40.38`, `10.40.37`, `10.50.39`, `10.50.35` (missing octet); `aefwpalo004` mgmt duplicates `aefwpalo002`'s 10.40.0.37 | Correct to full, unique addresses from snet-mgmt |
| 41 | NAT policy section | Prose: NAT rules "only … for the East/West firewall"; tables titled for both N-S and E-W; egress narrative (Zscaler tunnel.1 on N-S) implies N-S NAT | Reconcile prose/tables against live config |
| 42 | Scope (AUSE) | 4 load balancers listed for the 2-firewall region (copy of AUEA count?) | Confirm actual AUSE LB count |
| 43 | Document control | Status truncated ("Ready to"); consultation table has no sign-off dates; v1.0 marked "Ready for APM to Review & Endorse" — ratification unconfirmed | Record endorsement outcome and finalise status |
| 44 | Services settings | Primary/secondary DNS and NTP servers TBC at handover | Ratify values and update firewall config + document |
| 45 | DR scope | AS04 (DR = firewalls/related resources) conflicts with AS16 (DR = production and identity resources) | Align assumption set |

## Part B — CAF/ALZ deviations complicating codification

These are not errors — they are ratified choices that diverge from CAF/ALZ reference
patterns. Each imposes cost when codifying the corpus into IaC (Terraform/Bicep ALZ
modules, policy-as-code, subscription vending):

1. **Region-first naming grammar.** CAF ordering is resource-type-first (`rg-`, `vnet-`);
   APM is `[region]-[type]-…`. Standard CAF naming providers (`azurecaf_name`, ALZ Bicep
   naming modules) can't emit this — a custom naming module/function is required for
   every resource type.
2. **Dual grammar (hyphenated + compact concatenated).** VMs, storage, firewalls, LBs use
   concatenated shortform with single-letter env/domain codes (`p`, `c`, `x`); everything
   else is hyphenated long-form. Codification needs two generators plus a
   shortform↔longform token map, and the compact form is lossy (single letters collide as
   the estate grows).
3. **APM security domain as a first-class token** (controlled/standard/platform) — absent
   from CAF entirely, and encoded three different ways: full word (subscriptions),
   `ctrl`/`std` (resources), `c`/`s` (compact). Every module needs the extra variable and
   the three encodings.
4. **Platform subscriptions drop the domain token** and overload the environment slot
   with a platform function (connectivity/identity/management/security) — naming logic
   becomes conditional on subscription archetype.
5. **Environment-based Level 4 management groups**
   (AUS-MG-{PROD|DEV|SIT|UAT}-{CONTROLLED|STANDARD}). ALZ guidance explicitly recommends
   archetype-based MGs (Corp/Online) and discourages environment MGs; ALZ policy
   assignment defaults, archetype definitions, and subscription-vending modules all
   assume the reference hierarchy. Adopting ALZ accelerator code means re-mapping every
   archetype, and the "no RBAC at CONTROLLED/STANDARD MGs" rule must be enforced by
   convention since tooling won't know it.
6. **Portal-managed policies (DD69), not policy-as-code.** The single largest
   codification blocker: any IaC representation immediately drifts. Compounded by
   inconsistent custom definition IDs (readable slugs like `apm001-private-link-dns`
   mixed with opaque hex like `756e53b7bea14a39965a429a`) and assignment names that are
   random hex for some assignments and readable for others — a full import/mapping
   exercise is needed before policy-as-code is viable.
7. **Non-CAF abbreviations** in the registry: `aapi` (CAF `appi`), `pdz` (CAF `pdnsz`),
   `pep` (CAF `pe`), `law` (CAF `log`), `rsvp` (no CAF equivalent), `snet` matches CAF
   but subnets deliberately omit env/domain tokens. A bespoke abbreviation registry must
   ship with any naming module — CAF defaults cannot be assumed anywhere.
8. **Two DNS zone conventions coexist**: the naming standard defines `[region]-pdz-…`
   resources while deployed private DNS zones necessarily use service FQDNs
   (`privatelink.blob.core.windows.net`). Codification must special-case DNS zones
   (FQDN-named) vs the documented scheme.
9. **Azure-default names ratified as exceptions** (`NetworkWatcher_australiaeast`,
   `NetworkWatcherRG`, `AzureBackupRG_australiaeast_1`) — deny/naming policies and
   linting must allow-list these.
10. **Instance padding inconsistency**: `001` standard, but `01` for subscriptions, VM
    hosts, NSG rules, and Table 25 VNets — normalisation rule needed before generators
    can round-trip names.
11. **Tag scheme vs naming tokens mismatch.** Tag `environment` values (SECURITY, MGMT,
    IDY, CONN, TEST, SBX, PROD…) don't match naming environment tokens
    (security/mgmt/identity/conn/sandbox); `TEST` has no subscription; tag names mix
    hyphenation styles (`apm-security-domain`, `application-id` vs `technicalcontact`,
    `operationalteam`). Mapping tables required between tag values, naming tokens, and MG
    archetypes.
12. **Behaviour encoded in tag values** (`Backup`, `update-stage` drive policy
    enrolment) — tags are control-plane inputs, so tag policy-as-code must be treated as
    change-managed configuration, not metadata.
13. **No IPAM system** (accepted risk RS07): the address plan is document-borne. Nothing
    machine-readable exists to feed subscription vending or `azurerm` address-space
    validation; sandbox CIDRs may deliberately overlap, which breaks naive overlap
    checks.
14. **Region token set is bespoke**: `auea`/`ause` + shortforms `ae`/`as` + `global` +
    reserved `nz`/`sg` — no standard CAF region-code map matches; must be maintained
    in-house.
15. **PIM-eligible, time-bound MG role assignments** (1-year) — `azurerm` has no
    first-class support for eligible assignments (AzAPI/Graph needed), so the RBAC model
    resists plain Terraform; the Nov 2026 expiry compounds this (see A2 #20).
16. **CSP-managed subscriptions under MCA** — subscription vending automation (ALZ
    vending module) assumes EA/MCA programmatic subscription creation; CSP flow differs
    and the design keeps creation manual with the Infrastructure team.

## Suggested priority order

1. A2 #20 (RBAC expiry cliff — operational risk with a date), A2 #23 (DR posture
   conflict — architecture-level ambiguity), A2 #22 (locks pending).
2. A3 items (register hygiene) — cheap fixes that unblock reliable policy tooling.
3. A1 #1–5 (address-plan table errors) — these are the IPAM system of record until an
   IPAM exists; errors here propagate.
4. A1 tagging items (#6–7) — tags drive backup/patching automation.
5. Part B decisions — each needs an explicit "ratify deviation" or "converge to CAF"
   ruling before IaC codification starts; #5 and #6 dominate the effort estimate.

---


# FILE 17 of 19 — `references/ai-lz-reconciliation.md`

---
status: active
source_document: AI-LZ-DDD-v2.4-Reconciliation.md (project working copy, ESLZ-PLATFORM-INFO folder); APM_ES_AI_LZ_TCD v0.5 (authoritative AI config — see architecture/ai-landing-zone.md)
source_version: 21 July 2026 (point-in-time, against the 2026-07-21 corpus baseline)
ingested: 2026-08-02
---

> Skill-internal copy. **Status updates since compilation (2026-07-22 ingests):**
> R21 (firewall design unverifiable) — RESOLVED: Palo Alto As-Built v1.0 ingested as
> `architecture/firewall-nva.md`; the two-pair split, E-W licensing asymmetry
> (Advanced URL Filtering/DNS Security on E-W only) and Panorama NS/EW device-group
> structure are all confirmed. R24 (Boomi not ingested) — PARTIALLY RESOLVED: Boomi
> DDD v0.1 ingested at design stage in `architecture/integration-services.md` (still
> no as-built). R22 (APIM estate) — CLARIFIED: APIM exists as design intent only
> (APIM DDD v0.1, same file); still nothing as-built, so the "Change vs New" concern
> stands. All other items remain open as written.

# Reconciliation — APM ES AI LZ DDD v2.4 vs APM ESLZ Standards

Reconciled 21 July 2026 against the apm-eslz-reference corpus (partner-delivered
baseline, ingested 2026-07-21: Detailed Design v1.1, Policy Assignment Record
Stream03-17Jul2026, Naming Standards PDF 17Jul2026). Corpus is the SoftwareOne handover
state — where the AI design assumes a remediated state, that is noted rather than scored
against it.

Verdicts: **Conformant** · **Deviation** (diverges from a ratified ESLZ decision — needs
explicit ratification) · **Conflict** (contradicts recorded fact — one side must change)
· **Unverifiable** (reference source not in corpus) · **Dependency** (ESLZ change
required before build).

## 1. Conflicts — must be resolved before Gate 2

| # | AI DDD claim | ESLZ corpus position | Resolution needed |
|---|---|---|---|
| R1 | Assumption: "existing Log Analytics / Sentinel retention architecture (**180-day queryable**) is reused without change" (§2.3, §5.1, §9.2) | Per platform-services.md (DDD v1.1/as-built): operational LAWs are **90-day queryable** + 180-day storage-account export; security LAWs are **30-day** handover baseline pending security-team uplift (remediation register A2 #21). No 180-day queryable workspace exists | Either uplift workspace retention (cost decision) or restate the AI assumption as 90-day queryable + archive. The §9.2 payload-tier "90 vs 180" comparison inherits this error |
| R2 | Sentinel operational with AI analytics rules; "Sentinel workspace" in shared platform (§4.2, §5.3, §9.2) | Sentinel deployment/SIEM log shipping is owned by the **IMP project**, not the LZ; the LZ delivered the security LAWs only (platform-services.md; RS11) | Confirm Sentinel is live post-IMP, or add it as an Open Decision with IMP as owner — currently absent from the OD register |
| R3 | "Per-environment workspace" logging (WAF logs "to the environment workspace", payload table "in the environment workspace") (§5.3, §9.2) | Workspaces are **per-region** (auea/ause-law-mgmt-operation-001) plus security — there is no per-environment (Prod/Non-prod) workspace | Map "environment workspace" to actual workspaces or request new ones (naming, subscription placement, retention all follow) |
| R4 | OD-04: "CIDR allocations **recorded in IPAM**" | APM has **no IPAM system** — accepted risk RS07; the address plan document is the system of record (governance.md, address-plan.md) | Point OD-04 at the address plan document/corpus, or stand up an IPAM (which would supersede RS07) |
| R5 | "Private Endpoint subnet (**existing**)" and "workload subnets (existing)" in each of 8 Foundry subscriptions (§5.3) | As-built, only **prod-ctrl, prod-std, management, identity, connectivity** VNets/subnets exist. Dev/SIT/UAT (and their `-pe-` subnets) are planned but **not deployed** — spoke VNets are provisioned at application migration (address-plan.md) | 5 of 8 target subscriptions need VNet/subnet builds first — this belongs in the wave plan as a predecessor activity, not an assumption |
| R6 | "Everything as code… no portal changes in Prod"; Azure Policy deployed via module/pipeline (§5.4, §9.1) | ESLZ policy operating model is **Azure Portal-managed** (DD69), with ServiceNow exemption path | Direct operating-model conflict. Either the AI programme gets a ratified carve-out (policy-as-code for AI-scoped assignments) or DD69 is revised estate-wide — remediation register Part B #6 already flags DD69 as the main codification blocker; this design forces the decision |

## 2. Deviations — ratification required

| # | Item | ESLZ position | AI DDD position |
|---|---|---|---|
| R7 | Environment model | DD64: four environments (DEV/SIT/UAT/PROD) × two security domains, each with own subscription/VNet; DEV has **no on-prem connectivity, no APM data** | Two-environment model (Prod / "Non-prod"); one shared Non-prod APIM gateway and one shared Non-prod AppGW serve DEV+SIT+UAT collectively — cross-environment aggregation inside "Non-prod" dilutes DD64 segregation (e.g. UAT prod-like data transiting a gateway shared with DEV). Needs explicit ratification, incl. whether DEV workloads consuming AI violates the "no APM data in DEV" rule |
| R8 | New subscriptions "prod-shared" / "non-prod-shared" | Subscription set is ratified (13+AVD); naming grammar `aus-sub-[env]-[domain]-[instance]`; MG placement per hierarchy | Two new gateway subscriptions implied, names non-conformant ("shared" is not an environment token; "non-prod" exists as a resource token but not for subscriptions), MG placement unstated. Need: ratified names (e.g. `aus-sub-prod-shared-001`?), MG placement (CONTROLLED? STANDARD? a new shared-services MG?), CIDR allocations, tags, budgets, ASC/BK policy coverage |
| R9 | App Gateway WAF v2 placement | DD78: shared App Gateways **in the hub/connectivity subscription** by default; dedicated gateways only with recorded justification (blast radius, RBAC, compliance) | Per-environment AppGW in workload-side "gateway services spokes". Justification criteria exist in DD78 — record the justification formally rather than silently deviating |
| R10 | Single-region (Australia East) | Baseline DDD v1.1 is dual-region active (AUSE VNets, GRS+CRR vaults, DCs); corpus carries an unresolved flag that a single-region multi-zone decision may supersede | AI design is single-region with RA-01 risk acceptance — consistent with the flagged direction but **contradicts the deployed dual-region baseline**. RA-01 ratification should explicitly reference and resolve the estate-level DR posture question (remediation register A2 #23), not just the AI scope |
| R11 | Exceptions handling | Policy exemption path is ServiceNow Cyber Security Request (DD69/governance.md) | Design-local exceptions register (EX-01/EX-02) with 12-month reviews. Sound structure, but any Azure Policy exemption these imply (e.g. resource-type allow-list changes) must still transit the ServiceNow path — state the linkage |
| R12 | PIM dependency | PIM/identity governance **excluded from the ESLZ phase** (DD6/DD10); only MG RBAC uses PIM-eligible mechanics | Payload-tier access requires "PIM-eligible role, approval required, 8-hour activation" and agent governance leans on Conditional Access/lifecycle (OD-05). The design's controls assume PIM capability the ESLZ deliberately deferred — OD-05 covers agent licensing but not the payload-access PIM dependency; add it |

## 3. Build dependencies on the ESLZ (additions the platform must make)

| # | Dependency | Detail |
|---|---|---|
| R13 | Private DNS zones | Required: privatelink.services.ai.azure.com, privatelink.openai.azure.com, AI Search, Cosmos DB. Corpus as-built has only azurewebsites/blob/database/file/mysql/vaultcore — four+ new central zones, plus VNet links from all 8 workload VNets (current zones link only conn/identity/mgmt). Conformant with the DD18 central model; APM001/APM007 deny workload-local zones, and the design correctly creates none |
| R14 | Resource-type allow-list | GEN02/GEN03 (allowed / not-allowed resource types, APM scope) and AS24 policy allow-listing must admit: Cognitive Services/Foundry accounts, Microsoft.App environments (delegated subnet), Cosmos DB, AI Search, APIM, AppGW WAF v2 — else module deploys are denied. Verify current parameter values (not in corpus — parameters weren't in the assignment record) |
| R15 | Policy additions | disableLocalAuth-on-Foundry (enforced "by Azure Policy" per §5.2.1), Foundry/APIM/AppGW diagnostic DINE settings, CMK enforcement for AI stores — none exist in the 218-assignment baseline. New assignments should follow the APMxxx/DIAG/LOG naming families; note free numbers APM010, 023-024, 026-027, 032, 034-037 (confirm they're free, per remediation register A3 #26) |
| R16 | Naming standard extensions | No registry abbreviations exist for: Foundry account/project, APIM, Cosmos DB, AI Search, Container App environment, WAF policy, AppGW components beyond `appgw`. The PDF instructs "update any new items as approved" — extend before Wave 1 so the module emits conformant names. Also decide the environment token for shared-gateway resources (`nonprod` exists as a resource token; "shared" does not) |
| R17 | IPAM allocations | Injection subnets (/27 min, /24 recommended) fit the reserved additional CIDRs in the address plan (e.g. dev-ctrl 10.40.25.0/24, prod-ctrl 10.40.11.0/24 reserved blocks) — feasible without new supernet carve-outs, but each allocation must be recorded in the address plan (see R4). Gateway-spoke CIDRs for the two new subscriptions have **no reserved block** — new allocation required |
| R18 | Tagging | Module must emit all 13 mandatory tags (APM025 blocks untagged RG creation). Required tag decisions: `application-id` values for the AI platform, `environment` values (no "nonprod" value exists in the ratified set — SECURITY/MGMT/IDY/CONN/DEV/SIT/UAT/TEST/PROD/SBX), `apm-security-domain` for gateway subscriptions, cost-centre mapping for chargeback alignment with Foundry-project showback |
| R19 | Backup for stateful AI stores | RPO ≤24 h for Cosmos/Storage/Search "where backup is enabled" — ESLZ backup is VM-tag-driven (BK01-08) plus Backup vaults for two diagnostics storage accounts only. PaaS backup policies for CapHost stores are a new platform capability; define under DD51/DD57 patterns |
| R20 | Subscriptions vending | Two new gateway subscriptions require: MCA/CSP creation via APM Infrastructure Team, MG placement, ASC Default + budget + alert-rule + Network Watcher + BK policy rollout to match the per-subscription baseline (103 per-subscription assignments pattern) |

## 4. Unverifiable against corpus (source documents not ingested)

| # | Item | Why unverifiable |
|---|---|---|
| R21 | "N/S and E/W Palo Alto NVA pairs", E/W pair licensed for App-ID/URL filtering, Panorama device groups | The firewall detailed design is a separate workstream document, never ingested. Corpus knows only "Palo Alto NVA in hub" with public/private/dmz/mgmt/vmx subnets — the two-pair split, licensing asymmetry, and Panorama structure cannot be confirmed. **Recommend ingesting the firewall design** — three designs now depend on it |
| R22 | "Existing shared APIM estate" (APIM Premium v2 prod-shared / non-prod-shared marked "Change", not "New") | No APIM exists anywhere in the corpus (subscriptions, RGs, policy record). Either APIM was deployed outside the ingested record, or these are actually New components mislabelled as Change. Materially affects scope and cost — verify |
| R23 | "Gateway services spokes" (existing spokes per §5.3) | No such spokes in the as-built VNet inventory. Same question as R22 |
| R24 | Boomi MCS IPsec continuity | Boomi design not ingested (corpus connectivity.md scope note) |
| R25 | Managed DevOps Pool agents | ESLZ DevOps content deferred to the DevOps Wiki (DD87-95, not ingested); `snet-mgmt-devops` exists but MDP placement unconfirmed |

## 5. Conformant (no action)

- Foundry as workload component in workload subscriptions, never platform — aligns with ESLZ subscription archetypes and workload/platform split.
- One shared Connectivity subscription serving all environments — matches the ESLZ (the v2.0 change actually *corrected* the AI design into ESLZ alignment).
- Private-by-default: PE-only, public network access disabled, no public IPs outside connectivity — aligns with DD17/DD20, APM014.1, GEN07/GEN08.
- No service endpoints — aligns with DD14/APM028.
- UDR 0.0.0.0/0 to hub NVA for egress — aligns with DD16 forced tunnelling.
- Managed identity everywhere, no secrets in code — aligns with DD7.
- Central private DNS with zone-group registration, no workload-local zones — aligns with DD18, APM001/APM007.
- CMK via Key Vault, per-application vault separation — aligns with DD58/DD60.
- ISM/E8 ML2/RFFR/IRAP compliance frame — aligns with governance.md; the evidence-based control matrix exceeds the baseline's assurance practice.
- AppGW private listener only, HTTPS end-to-end — aligns with DD74/DD78 TLS posture; DDoS not-onboarded position unaffected (no public frontend).
- SoftwareOne handover with runbook evidence — consistent with established practice.

## 6. Summary

The design is architecturally consistent with the ESLZ's intent — its private-by-default,
hub-inspected, workload-aligned pattern is the ESLZ pattern. The reconciliation risk is
concentrated in three places: (1) **assumed platform state that doesn't exist yet** (R1
Sentinel/retention, R5 missing spoke VNets, R22/R23 APIM and gateway spokes); (2) **the
two-environment simplification** over the ESLZ's four-environment/two-domain model (R7,
R8); and (3) **operating-model collisions** the ESLZ must resolve anyway (R6 policy-as-
code vs DD69 portal management, R4 IPAM, R10 single-region DR). None of the conflicts
are design flaws in isolation — most are the AI design assuming the *remediated* estate
rather than the partner-delivered baseline the corpus records.

Recommended sequencing: resolve R1/R22/R23 by evidence (they're factual, cheap to check);
take R6, R7 and R10 to the programme board as ratification items alongside RA-01; ingest
the firewall design (R21) before Phase 2 routing sign-off (OD-03 depends on it).

---


# FILE 18 of 19 — `references/curation-guide.md`

# Curation guide — staged extraction → corpus content

Read this before performing Workflow B step 2. Curation is the judgment step the ingest
script deliberately does not attempt.

## What to keep

- **Ratified decisions** and their rationale (the "we chose X over Y because Z" material —
  rationale is what makes the corpus useful across projects, keep it tight but keep it).
- **Standards and rules**: naming grammars, tagging schemas, subnet sizing rules, policy
  assignment scopes, RBAC role definitions.
- **Tables**: control matrices, address plans, role mappings, policy lists. Verify PDF-
  extracted tables cell-by-cell against the source — `pdftotext` mangles merged cells.
- **Diagable structure**: describe topology in text/tables even where the source used a
  diagram; the corpus is text-first. Reproduce diagrams as Mermaid only where structure is
  genuinely load-bearing.
- **Constraints and known limitations** (e.g. PSK rotation limits, managed-VNet
  incompatibilities) — these prevent repeated rediscovery.

## What to drop

- Executive summaries, purpose/audience/scope preamble, background sections that restate
  the ESLZ generally.
- Document control, revision history, approvals, distribution — the script strips most of
  this from docx, but PDFs and stubborn layouts need a manual pass.
- Branding, headers/footers, page furniture, ToC artifacts.
- Anything already covered by another corpus file — link to it instead of duplicating.
  Duplication is how corpora rot: two copies, one updated.

## Sanitisation (RFFR PROTECTED)

The corpus holds **schemes, patterns, and ratified decisions**, not live operational
state. During curation:

- Address plan: the ratified plan is carried in full — allocation blocks, subnet
  allocations, sizing rules, and reservation policy are all in scope, because the plan
  document is APM's IPAM system of record. Strip personal contact details (owner names,
  emails) from allocation tables; keep the team/landing-zone attribution.
- Network security: inspection *model* and traffic-flow *patterns* are in scope. Actual
  firewall rulebases, specific security policies, and object names are not.
- Identity: role model, identity classes, and PIM design are in scope. Actual principal
  names, group object IDs, and break-glass account details are not.
- Never carry credentials, keys, connection strings, or PSKs into the corpus, even
  redacted ones.
- When in doubt, generalise — except where a file is designated the system of record
  (the address plan): there, fidelity to the ratified document takes precedence, and
  sanitisation is limited to personal details and secrets. Confirm the engagement's
  data-handling terms govern what may be persisted here.

## Splitting across the taxonomy

Source deliverables are organised for a reader; the corpus is organised for retrieval.
One deliverable usually feeds several corpus files — e.g. a DR design paper contributes
to `architecture/resilience-dr.md` (the posture and decision), `policies/governance.md`
(any risk-acceptance governance), and possibly `standards/naming.md` (DR-site naming).
Place each piece where Workflow A's index would route a question about it, and add
cross-links (`see architecture/topology.md §Egress`) rather than copies.

## Frontmatter contract

Every corpus file starts with:

```yaml
---
status: active            # or: stub
source_document: <primary source filename(s)>
source_version: <version of the ratified deliverable>
ingested: <YYYY-MM-DD of last curation>
supersedes: <optional — earlier decisions this content replaces>
---
```

If a file draws on multiple deliverables, list them all; the version cited in answers
should be the one governing the specific claim.

## Updating an existing corpus file

Never blind-overwrite. Read the current file, merge the new content, and present the user
a per-file summary of changes (added / changed / removed decisions) before writing. If the
new deliverable *supersedes* a decision rather than extending it, record that in
`supersedes` — silent decision reversals are the most damaging corpus failure.

---


# FILE 19 of 19 — `scripts/ingest.py`

```python
#!/usr/bin/env python3
"""Ingest a deliverable (docx / pdf / xlsx) into staged raw markdown.

Deliberately does extraction only. Curation (deciding what is reference
material, sanitising classification-sensitive detail, splitting across the
corpus taxonomy) is a judgment task performed by Claude in Workflow B step 2.

Usage:
    python3 scripts/ingest.py <source-file> [--out staging/] [--keep-boilerplate]

Output:
    <out>/<slug>.md  — raw markdown with a YAML frontmatter provenance header.
"""

import argparse
import datetime
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

# ---------------------------------------------------------------- helpers

BOILERPLATE_HEADINGS = [
    # Headings whose entire section is dropped (case-insensitive match).
    r"document\s+control",
    r"revision\s+history",
    r"version\s+history",
    r"document\s+information",
    r"approval[s]?\b",
    r"sign[\s-]?off",
    r"distribution\s+list",
    r"copyright",
    r"disclaimer",
]

VERSION_PATTERNS = [
    r"\bv(?:ersion)?\s*([0-9]+\.[0-9]+(?:\.[0-9]+)?)\b",
    r"\b([0-9]+\.[0-9]+)\s*(?:draft|final)\b",
]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").lower()
    return text or "document"


def detect_version(text: str, filename: str) -> str:
    for source in (filename, text[:4000]):
        for pat in VERSION_PATTERNS:
            m = re.search(pat, source, re.IGNORECASE)
            if m:
                return m.group(1)
    return "unknown"


def strip_boilerplate(md: str) -> str:
    """Drop whole sections whose heading matches a boilerplate pattern.

    Works on ATX headings (#, ##, ...). A dropped section ends at the next
    heading of the same or higher level.
    """
    lines = md.splitlines()
    out, skip_level = [], None
    heading_re = re.compile(r"^(#{1,6})\s+(.*)$")
    for line in lines:
        m = heading_re.match(line)
        if m:
            level, title = len(m.group(1)), m.group(2)
            if skip_level is not None and level <= skip_level:
                skip_level = None
            if skip_level is None and any(
                re.search(p, title, re.IGNORECASE) for p in BOILERPLATE_HEADINGS
            ):
                skip_level = level
                continue
        if skip_level is None:
            out.append(line)
    md = "\n".join(out)
    return re.sub(r"\n{4,}", "\n\n\n", md)


# ------------------------------------------------------------- extractors

def extract_docx(path: Path) -> str:
    """pandoc gives the best structure (headings, tables) for docx."""
    result = subprocess.run(
        ["pandoc", str(path), "-f", "docx", "-t", "gfm", "--wrap=none"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"pandoc failed: {result.stderr[:500]}")
    return result.stdout


def extract_pdf(path: Path) -> str:
    """pdftotext -layout; tables survive as fixed-width text for curation.

    PDF extraction is inherently lossy — the frontmatter flags it so the
    curation step knows to verify tables against the source.
    """
    result = subprocess.run(
        ["pdftotext", "-layout", str(path), "-"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"pdftotext failed: {result.stderr[:500]}")
    text = result.stdout
    # Form-feed page breaks -> horizontal rules so page structure is visible.
    text = text.replace("\f", "\n\n---\n\n")
    return text


def extract_xlsx(path: Path) -> str:
    import openpyxl

    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    parts = []
    for ws in wb.worksheets:
        rows = [
            [("" if c is None else str(c).replace("|", "\\|").replace("\n", " "))
             for c in row]
            for row in ws.iter_rows(values_only=True)
        ]
        rows = [r for r in rows if any(cell.strip() for cell in r)]
        if not rows:
            continue
        width = max(len(r) for r in rows)
        rows = [r + [""] * (width - len(r)) for r in rows]
        parts.append(f"## Sheet: {ws.title}\n")
        parts.append("| " + " | ".join(rows[0]) + " |")
        parts.append("|" + "---|" * width)
        for r in rows[1:]:
            parts.append("| " + " | ".join(r) + " |")
        parts.append("")
    wb.close()
    return "\n".join(parts)


EXTRACTORS = {
    ".docx": ("pandoc docx->gfm", extract_docx),
    ".pdf": ("pdftotext -layout (lossy; verify tables)", extract_pdf),
    ".xlsx": ("openpyxl sheets->markdown tables", extract_xlsx),
    ".xlsm": ("openpyxl sheets->markdown tables", extract_xlsx),
}

# ------------------------------------------------------------------ main

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("source", type=Path)
    ap.add_argument("--out", type=Path, default=Path(__file__).parent.parent / "staging")
    ap.add_argument("--keep-boilerplate", action="store_true",
                    help="Skip the document-control/revision-history stripping pass")
    args = ap.parse_args()

    src = args.source
    if not src.exists():
        print(f"error: {src} not found", file=sys.stderr)
        return 1
    ext = src.suffix.lower()
    if ext not in EXTRACTORS:
        print(f"error: unsupported type {ext} (supported: {', '.join(EXTRACTORS)})",
              file=sys.stderr)
        return 1

    method, fn = EXTRACTORS[ext]
    print(f"extracting {src.name} via {method} ...")
    body = fn(src)

    if ext == ".docx" and not args.keep_boilerplate:
        body = strip_boilerplate(body)

    version = detect_version(body, src.name)
    args.out.mkdir(parents=True, exist_ok=True)
    dest = args.out / f"{slugify(src.stem)}.md"

    frontmatter = "\n".join([
        "---",
        "status: staged  # raw extraction — curate before moving into the corpus",
        f"source_document: {src.name}",
        f"source_version: {version}",
        f"extraction_method: {method}",
        f"ingested: {datetime.date.today().isoformat()}",
        "---",
        "",
    ])
    dest.write_text(frontmatter + body, encoding="utf-8")

    print(f"staged -> {dest}")
    print(f"detected version: {version}"
          + ("  (verify manually)" if version == "unknown" else ""))
    if ext == ".pdf":
        print("note: PDF extraction is lossy — verify tables against the source "
              "during curation.")
    print("next: curate per references/curation-guide.md (Workflow B step 2).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

---


---

# End of corpus

19 files, reproduced in full. Source package: `apm-eslz-reference.skill`.
