# APM ESLZ Reference Corpus — Part 1 of 4: Core Architecture As Built

Verbatim extract from the `apm-eslz-reference` Claude skill. Part 1 contains 8 of 19 files. Classification: APM operates at RFFR PROTECTED.

Files in this part:

- `SKILL.md`
- `architecture/topology.md`
- `architecture/landing-zones.md`
- `architecture/connectivity.md`
- `architecture/firewall-nva.md`
- `architecture/identity-rbac.md`
- `architecture/platform-services.md`
- `architecture/resilience-dr.md`

---


# `SKILL.md`

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


# `architecture/topology.md`

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


# `architecture/landing-zones.md`

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


# `architecture/connectivity.md`

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


# `architecture/firewall-nva.md`

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


# `architecture/identity-rbac.md`

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


# `architecture/platform-services.md`

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


# `architecture/resilience-dr.md`

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


*End of Part 1 of 4.*
