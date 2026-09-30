---
title: APM ESLZ Design Generator - specification pack
purpose: Specification for a second Claude skill that generates APM Azure architecture designs with natively-editable PowerPoint diagram packs
source_corpus: apm-eslz-reference (19 files, 26,208 words, ingested 21 July - 2 August 2026)
authored: 2026-08-07
classification: Internal. APM operates at RFFR PROTECTED. Contains no GUIDs, credentials, keys or host addresses.
scope: APM only. Not a client-agnostic framework.
---

# APM ESLZ Design Generator - specification pack

Sourcing discipline used throughout, and mandatory in the generated skill:

- `[CORPUS: <filename>]` drawn from the `apm-eslz-reference` corpus. The only tag that may carry an APM-specific fact.
- `[EXTERNAL]` Microsoft documentation, Azure service behaviour, CAF or ALZ guidance, PowerPoint or OOXML mechanics, general product knowledge. Never carries an APM-specific value.
- `[INFERENCE]` reasoned from the sources, stated by neither outright.
- `[UNKNOWN]` no source exists. States which document would answer it.
- `[UNRECONCILED]` two corpus files disagree. Both positions recorded, both files named, no winner picked.

An untagged APM-specific claim is a defect. Subscription GUIDs, tenant IDs and specific host addresses are never reproduced; placeholder tokens (`<ae-ilb-frontend>`) are used instead.

## Canonical sources - one fact, one home

This file **owns APM ESLZ specifics**: the corpus absorption check, the diagram catalogue, the MSO_SHAPE primitive library with EMU sizing, the D03 worked example, the slide-pack spine, the 113 conformance assertions, the gap and conflict register with exact flag wording, and the skill file plan. Two companions own the rest:

- `reference/design-capability-briefing.md` owns **craft** - the numbered diagram rules, the token and primitive model, audience laddering, editability engineering, render-path analysis and the failure modes. It governs on any discrepancy about a token value or a diagram rule.
- `reference/ddd-tcd-pptx-skill-context.md` owns **operations** - the authoring pipeline, the five gates and the rule engine.

Sections 3 and 5 here restate token and structure values deliberately, because this file must stand alone when uploaded to the generated skill. When a value changes, change it in the briefing first, then propagate here in the same edit.


---

## SECTION 1 - ABSORPTION CHECK

### 1.1 Subscriptions and management group placement

`[CORPUS: architecture/landing-zones.md]`. GUIDs present in the corpus, deliberately omitted here.

| Subscription | Management group |
|---|---|
| aus-sub-connectivity | AUS-MG-CONNECTIVITY |
| aus-sub-identity | AUS-MG-IDENTITY |
| aus-sub-management | AUS-MG-MANAGEMENT |
| aus-sub-security | AUS-MG-SECURITY |
| aus-sub-prod-controlled-001 | AUS-MG-PROD-CONTROLLED |
| aus-sub-dev-controlled-001 | AUS-MG-DEV-CONTROLLED |
| aus-sub-sit-controlled-001 | AUS-MG-SIT-CONTROLLED |
| aus-sub-uat-controlled-001 | AUS-MG-UAT-CONTROLLED |
| aus-sub-prod-standard-001 | AUS-MG-PROD-STANDARD |
| aus-sub-dev-standard-001 | AUS-MG-DEV-STANDARD |
| aus-sub-sit-standard-001 | AUS-MG-SIT-STANDARD |
| aus-sub-uat-standard-001 | AUS-MG-UAT-STANDARD |
| aus-sub-sandbox-001 | AUS-MG-SANDBOX (anomaly 1) |
| aus-sub-acquisitions-001 | AUS-MG-ACQUISITIONS (anomaly 2) |
| aus-sub-avd-controlled-001 | expected AUS-MG-PROD-CONTROLLED (anomaly 3) |

Management group hierarchy `[CORPUS: architecture/landing-zones.md]`: Tenant root, then APM intermediate root; L2 AUS-MG-PLATFORM and AUS-MG-REGION with NZ-MG-Region and SG-MG-Region reserved and out of scope; L3 under PLATFORM: AUS-MG-SECURITY, AUS-MG-MANAGEMENT, AUS-MG-IDENTITY, AUS-MG-CONNECTIVITY; L3 under REGION: AUS-MG-CONTROLLED, AUS-MG-STANDARD, AUS-MG-ACQUISITIONS, AUS-MG-SANDBOX; L4: AUS-MG-{PROD|DEV|SIT|UAT}-CONTROLLED and -STANDARD.

Three placement anomalies flagged by the corpus:

1. `aus-sub-sandbox-001` - as-built table shows its path directly under APM, not under AUS-MG-SANDBOX.
2. `aus-sub-acquisitions-001` - as-built table shows AUS-MG-SANDBOX, not AUS-MG-ACQUISITIONS.
3. `aus-sub-avd-controlled-001` - absent from the design's 13-subscription table; as-built path shown directly under APM.

Subscription count is `[UNRECONCILED]` across three files: the index describes 14 as-built subscriptions `[CORPUS: architecture/landing-zones.md]`; ASC Default is assigned per-subscription on "all 15 subscriptions" and enumerates fifteen `[CORPUS: policies/policy-baseline.md]`; the address plan lists fourteen and omits `aus-sub-security` entirely `[CORPUS: ipam/address-plan.md]`.

`[INFERENCE]` `aus-sub-security` has no VNet or CIDR allocation in either regional table while carrying BK01-BK04 backup assignments added in Stream03. Either it is intentionally network-free, with log and Sentinel resources reached by private endpoint from elsewhere, or the address plan has an omission. `[UNKNOWN]` which - Detailed Design v1.1 Tables 24-27 would answer it.

### 1.2 Firewall fleet by region

`[CORPUS: architecture/firewall-nva.md]`

**Australia East, 4 x VM-Series.** North-South pair `aefwppalo001` / `aefwppalo002`, Standard_D8as_v5. East-West pair `aefwppalo003` / `aefwppalo004`, Standard_D16as_v5. 4 load balancers, 2 availability sets. Panorama `aefwppano01`, Standard_D16as_v5.

**Australia Southeast, 2 x VM-Series.** North-South `asfwppalo001`, Standard_E8-4as_v5. East-West `asfwppalo002`, Standard_D8as_v5. 4 load balancers, flagged as mirroring the AUEA count and unconfirmed for a two-firewall region `[CORPUS: references/remediation-register.md A5 #42]`. Panorama `asfwppano01`.

PAN-OS **11.2.7-h7** fleet-wide at handover. Device names inconsistent in source, `aefwppalo00x` against `aefwpalo00x` `[CORPUS: references/remediation-register.md A5 #38]`.

Licensing asymmetry: North-South carries Advanced Threat Prevention, Advanced WildFire, Premium Support. East-West adds Advanced DNS Security and Advanced URL Filtering.

**Resilience model, and why it is not PAN-OS HA.** Instances run independently behind Azure Load Balancers. No PAN-OS HA pair, no shared session state; load balancer health probes remove a failed backend and in-flight sessions re-establish on the survivor `[CORPUS: architecture/firewall-nva.md]`. `[EXTERNAL]` PAN-OS HA depends on layer-2 failover mechanics - floating IP ownership and gratuitous ARP - that Azure's software-defined network does not honour, so the load-balancer sandwich is Palo Alto's own Azure reference pattern. Panorama by contrast runs true active (AUEA) / passive (AUSE) HA `[CORPUS: architecture/firewall-nva.md]`.

### 1.3 Inspected flows

`[CORPUS: architecture/firewall-nva.md; architecture/topology.md]`

1. East-West within the new landing zone: VNet to VNet via the regional hub, East-West set.
2. East-West between new and legacy landing zones in the same region: legacy-LZ spokes also peer to the new regional hub.
3. Outbound internet: HTTP egress via IPsec tunnels from the firewalls to Zscaler Cloud Proxy (`tunnel.1`, North-South set); non-HTTP SNATed out the firewall public interfaces with a second Azure SNAT via attached public IPs.
4. Meraki SD-WAN backhaul to and from on-premises: vMX in the legacy AUEA landing zone, BGP into Azure, interfaces in `snet-vmx-001`.
5. Firewall management egress to internet: via the private-subnet load balancer, filtered by the East-West set.
6. Inbound North-South: required but **NOT enabled at handover**, pending an external Azure Load Balancer and route table. The first designed inbound flow (SmartRecruiters webhook: Internet, Application Gateway WAF_v2, North-South NVA, APIM) is unreconciled with that provision `[CORPUS: architecture/integration-services.md consistency flag (e)]`.

Scope rule: only intra-region east-west is firewall-inspected. Inter-region peerings exist solely to reach Panorama and the Meraki vMX in Australia East `[CORPUS: architecture/topology.md]`.

### 1.4 Supernet scheme and sizing rule per archetype

`[CORPUS: ipam/address-plan.md]`

Australia East **10.40.0.0/16**, Australia Southeast **10.50.0.0/16** (DD11), symmetric mirror. Sandbox and Acquisitions at the top of each supernet (x.248-x.254); Management at x.255.0/24. Every VNet carries reserved additional CIDRs for contiguous growth. Sandbox CIDRs may intentionally overlap other VNets, being isolated and never peered. IP allocations are managed in a shared document, not an IPAM system (accepted risk RS07).

| Archetype | Allocation | Usable IPs |
|---|---|---|
| Connectivity | /23 | 507 |
| Identity | /24 | 251 |
| Production, each security domain | /22 | 1019 |
| Dev / SIT / UAT, each security domain | /23 | 507 |
| Sandbox | /24 | 251 |
| Management | /24 | 251 |
| AVD (controlled) | /23 | 507 - as-built addition, no row in the archetype table |

As-built deployed: hub, identity, management, prod-controlled, prod-standard only - **40 subnets**. Dev, SIT, UAT, AVD, Sandbox, Acquisitions planned, not deployed. Deviations from plan: `-pl-` subnets deployed as `-pe-`; both hubs gained `snet-vmx-001`.

### 1.5 The 13 mandatory tags

`[CORPUS: standards/tagging.md]`

Criticality, application-id, business-service, apm-security-domain, environment, owner, technicalcontact, cost-centre, operationalteam, service-component-type, **backup**, enableupdate, **update-stage**.

The two that drive automation:

- **backup** - `BasicVMBackup`, `StandardVMBackup`, `StandardSQLVMBackup`, `StandardSQLVM(OS)Backup`. Drives enrolment into policies BK01-BK08 and therefore into Recovery Services Vaults.
- **update-stage** - `Lead`, `auto-patch01`, `auto-patch02`. Selects the Azure Update Manager maintenance configuration, i.e. the patch ring.

`apm-security-domain` and `environment` are auto-inherited from resource group and subscription. RG-to-resource inheritance is done by policy, not natively.

Three source discrepancies: appendix Table 44 lists only 11 tags and omits `enableupdate` and `update-stage`; the section 6.x table duplicates `service-component-type`; the `backup` description names three tiers against four values, with enhanced backup policies existing (`...-vmsqlbackup-enhanced-001`) and no documented `Enhanced*` tag value.

### 1.6 Policy assignment count and scope split

`[CORPUS: policies/policy-baseline.md]`

**218 assignments** - 175 policies, 43 initiatives; 32 custom definitions hosted at the APM management group, 186 Azure built-ins. All enforcement mode `Default`. Stream01 (16 Dec 2025) 202 assignments; Stream03 (17 Jul 2026) 16 assignments.

| Scope | Level | Assignments |
|---|---|---|
| APM | Intermediate root MG | 99 |
| AUS-MG-PLATFORM | Platform MG | 8 |
| AUS-MG-REGION | Region MG | 7 |
| AUS-MG-SANDBOX | Sandbox MG | 1 |
| Individual subscriptions | Subscription | 103 (ASC Default + BK families) |

Naming families: APMxxx, AUM, ASC, BK, COMP, DIAG, LOG, GEN, MON. Paired Platform/Region assignments use `.1`/`.2` suffixes or `(Platform)`/`(Region)`. Numbering gaps exist (APM010, APM023-024, APM026-027, APM032, APM034-037, MON006-007); the source does not state whether these were retired or never deployed.

### 1.7 Five most consequential open items, ranked

1. **DR posture currency conflict.** `architecture/resilience-dr.md` describes a dual-region posture and the deployed baseline actively builds Australia Southeast - VNets, GRS and cross-region-restore vaults, two domain controllers (DD49/DD50). A single-region multi-zone decision paper is believed to supersede it and has never been ingested `[CORPUS: architecture/resilience-dr.md; standards/naming.md ingest flag 9; references/ai-lz-reconciliation.md R10]`. First because it validates or invalidates roughly half the corpus at once: every diagram, every `ause-` name, vault redundancy, cost, and the naming standard's own scope. No design can be produced without taking a position, and the corpus forbids taking one.
2. **RBAC expiry, November 2026.** All management-group role assignments are PIM-eligible and time-bound with a November 2026 expiry, in an estate where PIM was formally excluded from this phase (DD6/DD10, NFR 1.1 not met) `[CORPUS: architecture/identity-rbac.md; policies/governance.md; references/remediation-register.md A2 #20]`. Renewal process `[UNKNOWN]` - no corpus file owns it. Second because it is the only item with a date on which platform administration stops working.
3. **DD69 portal-managed policy against policy-as-code.** DD69 ratifies management of all 218 assignments via the Azure Portal, not IaC `[CORPUS: policies/governance.md]`. The AI landing zone assumes everything-as-code with no portal changes `[CORPUS: references/ai-lz-reconciliation.md R6]`. Third because a generator that emits policy artefacts must know which side won, and today neither has.
4. **AI landing zone assumed-state gaps.** Five of eight target workload spokes are not deployed; the "existing" APIM estate has no as-built evidence anywhere in the corpus; the 180-day-queryable retention assumption is refuted by the deployed 90-day operational and 30-day security workspaces `[CORPUS: references/ai-lz-reconciliation.md R1, R5, R22, R23]`. Fourth because Wave 1 is gated on facts that are currently false.
5. **Security Log Analytics workspace retention, 30 days against a 180-day requirement.** A handover baseline pending security-team adjustment, with operational logs meeting the requirement only via storage export `[CORPUS: architecture/platform-services.md; policies/governance.md; references/remediation-register.md A2 #21]`. Fifth because it is a standing non-compliance in production at RFFR PROTECTED, cheap to fix, with no owner named beyond "security team". Ranked above the Boomi hub-growth CIDR reservation conflict `[CORPUS: ipam/address-plan.md]` only because that conflict blocks a design not yet ratified, whereas this one is live.

---

## SECTION 2 - DIAGRAM CATALOGUE

| id | title | what it shows | corpus source file(s) | audience | complexity | depends on |
|---|---|---|---|---|---|---|
| D01 | Management group hierarchy | Tenant root, APM intermediate root, AUS-MG-PLATFORM / AUS-MG-REGION, L3, L4; reserved NZ and SG MGs; the no-RBAC-at-L4 rule | architecture/landing-zones.md | board, CIO, architect | M | - |
| D02 | Subscription topology | All as-built subscriptions on the MG tree, archetype colour-coding, the three placement anomalies badged, the 14/15 count conflict banner | architecture/landing-zones.md; policies/policy-baseline.md | CIO, architect | M | D01 |
| D03 | Dual-region hub-spoke topology | Both hubs, all spokes with deployed and planned distinguished, hub-hub peering scoped to Panorama and vMX reach, legacy-LZ peering, sandbox isolation | architecture/topology.md; ipam/address-plan.md | board, CIO, architect | L | D02 |
| D04 | Hub subnet layout | Per-region hub VNet: GatewaySubnet, mgmt, public, private, dmz, vmx, with CIDRs and occupants | ipam/address-plan.md; architecture/firewall-nva.md | engineer | M | D03 |
| D05 | East-west inspection flow | Spoke, UDR, internal LB, E-W set, destination spoke; new-to-legacy in-region flow; the intra-region-only rule | architecture/firewall-nva.md; architecture/topology.md | architect, engineer | M | D03, D04 |
| D06 | North-south egress flow (Zscaler) | HTTP via IPsec `tunnel.1` to Zscaler; non-HTTP dual-SNAT path; URL-category allow-listing point | architecture/firewall-nva.md | architect, engineer | M | D04 |
| D07 | Backhaul flow (Meraki SD-WAN) | Spoke, E-W, vMX in legacy AUEA, on-premises; BGP advertisement; inter-region reach to vMX and Panorama | architecture/firewall-nva.md | architect, engineer | M | D04 |
| D08 | Inbound ingress: state against intent | Handover state (not enabled, external-LB provision) beside the designed SmartRecruiters path, marked unreconciled | architecture/firewall-nva.md; architecture/integration-services.md | architect | M | D06 |
| D09 | Firewall interface and zone model | Per-set interfaces (mgmt, e1-1, e1-2, e1-3, tunnel.1), zones, three-VR North-South against single-VR East-West, the address-object-not-zone constraint | architecture/firewall-nva.md | engineer | L | D04 |
| D10 | Panorama management structure | Active/passive HA pair, template stack layering (Global, NS/EW, regional), device groups, log-forwarding chain to Sentinel | architecture/firewall-nva.md | engineer | M | D09 |
| D11 | Routing and UDR model | Per-VNet route tables, `0.0.0.0/0` to VirtualAppliance at the internal LB frontend, gateway route propagation setting, UDR over BGP over system precedence | architecture/connectivity.md | engineer | M | D03 |
| D12 | Private DNS and private endpoint model | Central zones in connectivity, VNet links, dedicated `-pe-` subnets, policy denial of workload-local zones, planned AI zone additions | architecture/connectivity.md | architect, engineer | M | D03 |
| D13 | Identity and RBAC scope model | Group scheme per tier, custom roles, PIM-eligible time-bound MG assignments with the Nov 2026 expiry, no-RBAC MGs, break-glass accounts | architecture/identity-rbac.md | architect | M | D01 |
| D14 | Logging and monitoring data flow | Operational against security workspace separation (DD38), dual LAW and storage destinations, retention tiers, DCRs, Panorama to syslog to Sentinel | architecture/platform-services.md; architecture/firewall-nva.md | architect, engineer | L | D03 |
| D15 | Backup and DR topology | Recovery Services Vaults per environment and subscription, GRS with cross-region restore against LRS, tag-driven BK01-BK08 enrolment, DC rebuild-not-restore, with the dual-region conflict banner | architecture/resilience-dr.md; standards/tagging.md | CIO, architect | M | D02 |
| D16 | Policy scope model | 218 assignments across the five scope tiers, naming families, the paired `.1`/`.2` pattern, per-subscription ASC and BK | policies/policy-baseline.md | architect | M | D01 |
| D17 | Address plan visualisation | Both /16 supernets as proportional bars: allocated, reserved growth, unallocated (10.40.96-247), archetype sizing, the sandbox overlap exception, the Boomi reservation conflict | ipam/address-plan.md | architect, engineer | L | - |
| D18 | Three-ring patch orchestration | Lead / auto-patch01 / auto-patch02 rings, tag-driven membership, AUM maintenance configurations, Windows and Linux critical-and-security against other-updates families | architecture/platform-services.md; standards/tagging.md; policies/policy-baseline.md | engineer | S | - |
| D19 | Tag-driven automation model | All 13 tags; `backup` flowing to BK01-BK08 and `update-stage` to AUM rings; RG-to-resource inheritance by policy | standards/tagging.md | architect, engineer | S | D18 |
| D20 | AI landing zone target state | Eight Foundry workload subscriptions plus the shared gateway tier, agent injection and PE subnets, E-W to N-S to Zscaler egress, the no-decrypt scope | architecture/ai-landing-zone.md; ipam/address-plan.md | CIO, architect | L | D03, D05, D06 |
| D21 | AI guardrail stack | authN, token limit, quota, content safety, two-tier logging, managed-identity forwarding; `disableLocalAuth`; QUIC and ECH deny | architecture/ai-landing-zone.md | architect | M | D20 |
| D22 | Integration platform target state | APIM Premium v2 with VNet injection, Boomi MCS cross-cloud VPN and its addressing, webhook ingress, the per-flow inspection matrix | architecture/integration-services.md | architect | L | D03, D08 |
| D23 | AI two-tier logging model | Telemetry always-on against payload default-off, customer-managed-key workspace, PIM-gated access, redaction gate, OFFICIAL: Sensitive ceiling | architecture/ai-landing-zone.md | architect, engineer | M | D14, D20 |
| D24 | Remediation heat map | 45 baseline defects plus 16 CAF and ALZ deviations by source document and priority, with the five consequential open items called out | references/remediation-register.md | CIO, architect | M | - |
| D25 | Security domain segregation | The controlled and standard split as an RFFR scoping boundary: MG, subscription, VNet, tag encoding, and what crosses it | architecture/landing-zones.md; policies/governance.md; standards/tagging.md | board, CIO, architect | S | D01 |
| D26 | Resource group and lock strategy | Base platform RGs, application-affinity grouping (DD65/DD66), CanNotDelete lock deployment by APM006.1, Azure-generated exceptions | architecture/landing-zones.md; policies/policy-baseline.md | engineer | S | D02 |
| D27 | Deployment and change path | Terraform and DevOps build for the NVA stack, portal-managed policy per DD69, the ServiceNow exemption path, and where the two operating models collide | architecture/firewall-nva.md; policies/governance.md | architect, engineer | M | D16 |

Additions beyond the requested list, each justified by a corpus file whose content is structural: **D18** and **D19** because two tags silently drive backup enrolment and patch-ring membership, and a workload that omits them is unprotected and unpatched without erroring `[CORPUS: standards/tagging.md]`. **D21** and **D23** because the AI guardrail chain and two-tier logging are the AI landing zone's actual control content. **D24** because the remediation register is load-bearing for every baseline conversation. **D25** because the controlled/standard split exists specifically to scope RFFR and is the one structural idea a board audience must hold `[CORPUS: policies/governance.md]`. **D26** and **D27** because resource-group strategy and the portal-against-code operating model are ratified decisions a generated design must respect. **D08** is split out of D06 because the corpus records inbound state and intent as unreconciled.

---

## SECTION 3 - NATIVE PPTX DIAGRAM SPECIFICATION

All EMU: `914400` per inch, `12700` per point `[EXTERNAL]`. Base unit `u = 76200` EMU = 0.0833in = one twelfth of an inch, chosen because it is PowerPoint's own default snap-grid spacing, so an architect's nudge lands on the authored grid `[EXTERNAL]`.

### 3a. Shape primitive library

`MSO_SHAPE` values are python-pptx enum names `[EXTERNAL]`. Text frame abbreviations: `WW` word_wrap True, `AS-NONE` auto_size MSO_AUTO_SIZE.NONE, `ANC-M` vertical_anchor MIDDLE, `ANC-T` TOP. Margins EMU (L,R,T,B).

| concept | MSO_SHAPE enum | default size (EMU, w x h) | fill token | line token | corner radius | text frame settings | icon treatment |
|---|---|---|---|---|---|---|---|
| Region | `RECTANGLE` | 4419600 x 4343400 | `navy-12` @40% alpha | `rule` 1pt dash | 0 | WW, AS-NONE, ANC-T, (45720,45720,27432,27432), `t-container` top-left | none |
| Availability zone | `RECTANGLE` | 2133600 x 1524000 | none | `navy-60` 0.75pt dot | 0 | WW, AS-NONE, ANC-T, `t-meta` | none |
| Management group | `ROUNDED_RECTANGLE` adj 0.06 | 1828800 x 502920 | `navy-12` | `navy` 1.5pt | 0.06 | WW, AS-NONE, ANC-M, (45720,45720,18288,18288), `t-container` | none |
| Subscription | `RECTANGLE` | 2057400 x 685800 | `paper` | `navy` 1pt | 0 | WW, AS-NONE, ANC-M, (45720,45720,18288,18288), `t-box` + `t-meta` | none |
| VNet | `ROUNDED_RECTANGLE` adj 0.04 | 2286000 x 990600 | `teal-14` | `teal` 1.25pt, dash if planned | 0.04 | WW, AS-NONE, ANC-T, (45720,45720,22860,22860), `t-container` | none |
| Subnet | `RECTANGLE` | 1219200 x 457200 | `paper` | `teal` 0.75pt | 0 | WW, AS-NONE, ANC-M, (36576,36576,13716,13716), `t-box-sm` + `t-meta` | none |
| Hub (VNet variant) | `ROUNDED_RECTANGLE` adj 0.04 | 2895600 x 1981200 | `teal-14` | `teal` 1.5pt | 0.04 | as VNet | none |
| Spoke (VNet variant) | `ROUNDED_RECTANGLE` adj 0.04 | 2286000 x 762000 | `teal-14` | `teal` 1.25pt | 0.04 | as VNet | none |
| Firewall / NVA | `HEXAGON` adj 0.18 | 685800 x 533400 | `orange-16` | `orange` 1.5pt | n/a | WW, AS-NONE, ANC-M, (27432,27432,13716,13716), `t-box` in `ink` | text label only |
| Load balancer | `FLOWCHART_DELAY` rot 90 | 685800 x 381000 | `paper` | `teal` 1pt | n/a | WW, AS-NONE, ANC-M, (27432,27432,9144,9144), `t-box-sm` | none |
| Private endpoint | `FLOWCHART_CONNECTOR` | 274320 x 274320 | `plum-14` | `plum` 1pt | n/a | no text frame; adjacent `t-meta` textbox | none |
| Private DNS zone | `FLOWCHART_MAGNETIC_DISK` | 838200 x 609600 | `plum-14` | `plum` 1pt | n/a | WW, AS-NONE, ANC-M, `t-box-sm` | none |
| Route table | `FLOWCHART_DOCUMENT` | 990600 x 457200 | `paper` | `navy-60` 1pt | n/a | WW, AS-NONE, ANC-M, `t-box-sm` + `t-meta` | none |
| NSG | `FLOWCHART_PREPARATION` | 838200 x 342900 | `paper` | `navy-60` 0.75pt | n/a | WW, AS-NONE, ANC-M, `t-meta` | none |
| VM | `RECTANGLE` | 990600 x 533400 | `slate-12` | `slate` 1pt | 0 | WW, AS-NONE, ANC-M, `t-box-sm` + `t-meta` | none |
| PaaS service | `ROUNDED_RECTANGLE` adj 0.10 | 1600200 x 533400 | `slate-12` | `slate` 1pt | 0.10 | WW, AS-NONE, ANC-M, `t-box` | none |
| Gateway (VPN / ER / vMX) | `FLOWCHART_MAGNETIC_DRUM` | 1066800 x 457200 | `teal-14` | `teal` 1pt | n/a | WW, AS-NONE, ANC-M, `t-box-sm` | none |
| Internet boundary | `ROUNDED_RECTANGLE` adj 0.50 | 1752600 x 381000 | `paper` | `navy-60` 1pt dash | 0.50 | WW, AS-NONE, ANC-M, `t-box` in `navy-60` | cloud glyph forbidden |
| On-premises boundary | `ROUNDED_RECTANGLE` adj 0.50 | 1981200 x 381000 | `paper` | `navy-60` 1pt dash | 0.50 | as internet boundary | none |
| SaaS boundary (Zscaler, Boomi) | `ROUNDED_RECTANGLE` adj 0.50 | 2133600 x 381000 | `paper` | `navy-60` 1pt dash | 0.50 | as internet boundary, vendor name in label | vendor logo forbidden (licensing) |
| Peering link | `p:cxnSp` `ELBOW` | n/a | n/a | `navy` 1.5pt solid | n/a | no text frame | arrowheads both ends |
| Inspected flow | `p:cxnSp` `ELBOW` | n/a | n/a | `orange` 2pt solid | n/a | label as chip | single tail arrowhead |
| Uninspected flow | `p:cxnSp` `ELBOW` | n/a | n/a | `navy-60` 1.25pt dash | n/a | label as chip | single tail arrowhead |
| Denied flow | `p:cxnSp` `STRAIGHT` + `NO_SYMBOL` | n/a | overlay `crimson-12` | `crimson` 1.75pt dashDot | n/a | label as chip | no arrowhead; `NO_SYMBOL` at midpoint |
| State badge | `ROUNDED_RECTANGLE` adj 0.50 | auto x 236220 | per state | per state 0.75pt | 0.50 | WW, AS-NONE, ANC-M, (22860,22860,0,0), 9pt caps 0.4pt spacing | none |
| Connector label chip | `RECTANGLE` | auto x 228600 | `paper` | none | 0 | WW, AS-NONE, ANC-M, (22860,22860,0,0), `t-wire` | none |
| Legend container | `RECTANGLE` | 4724400 x 533400 | `paper` | `rule` 0.75pt | 0 | WW, AS-NONE, ANC-T, `t-legend` | none |
| Conflict banner | `ROUNDED_RECTANGLE` adj 0.08 | frame width x 381000 | `crimson-12` | `crimson` 1.25pt | 0.08 | WW, AS-NONE, ANC-M, `t-box` in `crimson` | none |

`[EXTERNAL]` `NO_SYMBOL` is the circle-backslash autoshape; OOXML has no connector decoration for a denied path, so the marker is a separate shape.

`[INFERENCE]` Icon treatment is none throughout. The corpus contains no icon set, and official Azure and vendor icon libraries are licensed binaries that cannot be reproduced. An architecture-review audience reads a named box as more rigorous than an unnamed icon, so icon-free is the recommended position rather than a limitation. If APM supplies EMF assets, place them at a fixed 182880 EMU inset from the shape top-left and shrink the text frame left margin to match.

### 3b. Layout grammar

#### Canvas

| Property | Inches | EMU |
|---|---|---|
| Slide | 13.333 x 7.5 | 12192000 x 6858000 |
| Diagram frame | x 0.5, y 1.1667, w 12.3333, h 5.6667 | 457200, 1066800, 11277600, 5181600 |
| Title baseline | x 0.5, y 0.375 | 457200, 342900 |
| Subtitle baseline | x 0.5, y 0.8194 | 457200, 749300 |
| Source band | x 0.5, y 6.9167 | 457200, 6324600 |
| Safe margin, all edges | 0.5 | 457200 |

Grid 160 columns x 90 rows of `u`. Gutters: tight `1u`, standard `2u`, band separation `3u` - the last is the routing channel, and connectors may only run in it. Every coordinate an integer multiple of `u`; off-grid is a layout failure, not an exception.

Density ceilings: **slide** 18 primary shapes, 14pt body floor. **Engineering** 42 primary shapes, 11pt body floor, always paired with an A3-landscape variant in the design document. Subnet chips inside a VNet count as one third of a primary shape.

#### Colour tokens

| Token | Hex | Where used | Contrast-checked pairing |
|---|---|---|---|
| `navy` | `1F2D58` | Structure, container borders | on `paper` 12.6:1; on `navy-12` 10.9:1 |
| `navy-60` | `5A668C` | Secondary text, boundary pills, uninspected flows | on `paper` 5.7:1 |
| `navy-12` | `E7EAF2` | Region and MG container fill | text: `navy` |
| `orange` | `F89728` | NVA border, inspected flow. The single accent | never a text colour (2.1:1 on `paper`); fills take `ink` |
| `orange-16` | `FDEDD9` | NVA fill, PROPOSED badge | text: `ink` 13.9:1 |
| `teal` | `1B7F79` | Network plane borders, tunnels | on `paper` 4.8:1; not for text on `teal-14` (4.1:1) |
| `teal-14` | `E2F0EF` | VNet, hub, spoke, gateway fill | text: `#12544F` 7.4:1 |
| `plum` | `6B3F7A` | Identity plane, private link | on `paper` 7.2:1 |
| `plum-14` | `EFE8F2` | Identity and PE fill | text: `plum` 6.6:1 |
| `slate` | `44506B` | Compute plane borders | on `paper` 8.4:1 |
| `slate-12` | `E9ECF2` | VM and PaaS fill | text: `slate` 7.6:1 |
| `amber` | `B26B00` | Planned, not-enabled state | not for text on `amber-14` (3.7:1) |
| `amber-14` | `FBF0DE` | PLANNED / NOT ENABLED badge fill | text: `#6B4200` 7.8:1 |
| `crimson` | `8E1B2C` | Conflict, denied, unreconciled | on `paper` 7.9:1; on `crimson-12` 7.4:1 |
| `crimson-12` | `FBE4E7` | UNRECONCILED badge, conflict banner | text: `crimson` |
| `paper` | `FFFFFF` | Canvas, chips, subnet fill | - |
| `rule` | `C9D0E0` | Non-semantic dividers, legend border | never carries text |
| `ink` | `16203D` | Body text on light fills | on `paper` 15.5:1 |

Emit semantic colour as fixed `<a:srgbClr>` so a theme swap cannot destroy the coding; emit chrome as `<a:schemeClr>` so a rebrand works `[EXTERNAL]`.

#### Type tokens

| Token | Font | Size | XML `sz` | Weight | Colour |
|---|---|---|---|---|---|
| `t-title` | Poppins | 28pt | 2800 | 600 | `navy` |
| `t-sub` | Mulish | 15pt | 1500 | 400 | `navy-60` |
| `t-container` | Poppins | 13pt | 1300 | 600 | `navy` |
| `t-box` | Mulish | 12pt | 1200 | 600 | `ink` |
| `t-box-sm` | Mulish | 11pt | 1100 | 600 | `ink` |
| `t-meta` | Mulish | 10pt | 1000 | 400 | `navy-60` |
| `t-wire` | Mulish | 10pt | 1000 | 600 | `ink` |
| `t-legend` | Mulish | 11pt | 1100 | 400 | `ink` |
| `t-source` | Mulish | 9pt | 900 | 400 | `navy-60` |

`[EXTERNAL]` Poppins and Mulish are not Windows-bundled; PowerPoint falls back per machine. Either declare them as theme major and minor fonts in the shipped `.potx`, or substitute Segoe UI Semibold and Segoe UI, whose metrics are close enough that the character budget still holds. `[UNKNOWN]` whether these are APM's brand fonts - an APM brand guideline or supplied `.potx` would answer it. Floor 9pt, and only in the source band. Never rotate text; the single exception is a lane header band 0.4in or wider at 90 degrees counter-clockwise.

#### Connector rules

| Relationship | Connector type | Line | Arrowheads | Routing |
|---|---|---|---|---|
| VNet peering | `MSO_CONNECTOR.ELBOW` | `navy` 1.5pt solid | `triangle` both ends, med/med | Orthogonal, max 2 bends |
| Inspected / forced path | `ELBOW` | `orange` 2pt solid | `triangle` tail | Orthogonal |
| Uninspected / bypass | `ELBOW` | `navy-60` 1.25pt `DASH` | `triangle` tail | Orthogonal |
| Tunnel (IPsec, ER, VPN) | `STRAIGHT` | `teal` 1.75pt `SYS_DASH` | `triangle` tail | Straight, must carry a label |
| Data flow | `ELBOW` | `slate` 1.5pt solid, round cap | `arrow` open tail | Orthogonal |
| Trust / logical | `STRAIGHT` | `plum` 1.25pt `ROUND_DOT` | none | Straight |
| Private endpoint resolution | `ELBOW` | `plum` 1.25pt `DASH` | `arrow` open tail | Orthogonal |
| Denied / not permitted | `STRAIGHT` | `crimson` 1.75pt `DASH_DOT` | none | Straight, `NO_SYMBOL` at midpoint |
| Planned link | class connector | class colour @50% alpha, `DASH` | class arrowhead | As class; both endpoints carry a `PLANNED` badge |

Rules for all classes:

- **Two channels always.** Every class differs from every other in both colour and dash pattern. Colour alone fails in greyscale print and for roughly 8% of male reviewers `[EXTERNAL]`.
- **Bind both ends.** `begin_connect(shape, idx)` / `end_connect(shape, idx)`, never free coordinates. `RECTANGLE` and `ROUNDED_RECTANGLE` connection sites: 0 top, 1 left, 2 bottom, 3 right `[EXTERNAL]`.
- **Arrow direction is session initiation**, not data direction. State once in the legend; never mix conventions across a pack.
- **Crossings** minimised by band ordering, never by line-hop notation.
- **A denied path is drawn, not omitted**, whenever a reader would otherwise assume it exists. Sandbox-to-hub is mandatory for APM: the corpus states sandbox VNets have no peering to hub or any VNet `[CORPUS: architecture/topology.md]`, and an undrawn absence reads as an oversight.
- **Labelling.** A connector whose meaning is not self-evident carries a `t-wire` label on an opaque `paper` chip, centred on the longest straight run, never at a corner, never overlapping a shape. Two labels within 0.3in of each other: one becomes a legend entry instead.

#### Z-order and grouping

Emit in strict order - there is no z-order API in python-pptx and shapes render in `spTree` document order `[EXTERNAL]`: region and zone containers, MG and subscription containers, VNet containers, subnets, resources, boundary pills, connectors, connector label chips, state badges, slide furniture. Never append after this sequence.

**Emit zero `p:grpSp` for structural diagrams.** Use containment rectangles for visual grouping and shape-name prefixes for logical grouping. A group traps the editor - single-click selects the group, so moving one box needs a double-click to enter, and a mis-drag moves twelve shapes - and `p:grpSp` carries its own child coordinate space (`a:chOff` / `a:chExt`) that rescales children non-uniformly on group resize, with unpredictable behaviour for connectors attached across the boundary `[EXTERNAL]`.

#### Shape naming for the selection pane

`p:cNvPr/@name`, writable as `shape.name` `[EXTERNAL]`. Path-like, slash-delimited, coarse to fine:

```
<region>/<container>/<sub-container>/<resource>   ae/hub/inspect/nva-ns-1
<region>/spoke/<name>                            ae/spoke/prod-ctrl
link/<from-id>><to-id>                           link/ae-spoke-prod-ctrl>ae-ilb
link/<from-id>><to-id>/label                     link/ae-nva-ns-1>zscaler/label
badge/<element-id>                               badge/as-gw
furniture/<part>                                 furniture/legend
```

Prefix every connector with `link/` so an architect finds every line in one contiguous block. Never leave generated defaults such as `Rectangle 47` - an editor facing sixty of those abandons the selection pane and resorts to click-hunting, which is how shapes get dragged accidentally.

#### Legend construction

Mandatory at two or more line classes or two or more state badges; **forbidden** at one line class, where it makes the diagram look padded. Position fixed bottom-left across the whole pack. One row per class actually drawn on this slide - a shared pack-wide legend is a defect, because readers check the legend against the picture and lose trust when an entry has no referent. Construction: `RECTANGLE` container (`paper` fill, `rule` 0.75pt), then per row a 609600 EMU line sample of the class connector plus a `t-legend` textbox at 152400 EMU offset, row pitch 228600 EMU. The first row carries the arrow-direction convention as a `t-meta` note.

#### Worked example - D03 dual-region hub-spoke topology

Coordinates in grid units `u`; a generator multiplies by 76200. All values integers. Host addresses tokenised.

```yaml
diagram:
  id: D03
  title: "Only intra-region east-west traffic is inspected"
  thesis: "Two symmetric /16 supernets. Inter-region peering exists to reach Panorama and the vMX, not to carry inspected workload traffic."
  density: engineering
  canvas:  {w: 160, h: 90}
  frame:   {x: 6, y: 14, w: 148, h: 68}
  emit:
    groups: none
    theme_colours: chrome_only
    autofit: none
    zorder: [zone, mg, vnet, subnet, resource, boundary, connector, chip, badge, furniture]
  source:
    corpus: [architecture/topology.md, ipam/address-plan.md, architecture/firewall-nva.md]
    note: "As-built at handover. Deployed spokes solid; planned spokes badged."
  conflict_banner:
    show: true
    text: "DR posture UNRECONCILED. This diagram renders the deployed dual-region baseline (architecture/resilience-dr.md). A single-region multi-zone decision paper is believed to supersede it and has not been ingested. Neither region layout is ratified."

  shapes:
    # ---------------- Australia East ----------------
    - {id: zone-ae, name: "ae/zone", p: region, x: 6, y: 15, w: 70, h: 57,
       label: "Australia East", meta: "10.40.0.0/16", state: deployed}
    - {id: ae-hub, name: "ae/hub/vnet", p: hub, x: 22, y: 19, w: 38, h: 26,
       label: "auea-vnet-connectivity-001", meta: "10.40.0.0/23 | reserved 10.40.2.0/23",
       parent: zone-ae, state: deployed}
    - {id: ae-insp, name: "ae/hub/inspect", p: subnet, x: 24, y: 22, w: 34, h: 13,
       label: "auea-snet-private-001", meta: "10.40.0.96/27 | ILB frontend + firewall private interfaces",
       parent: ae-hub, state: deployed}
    - {id: ae-ilb, name: "ae/hub/inspect/ilb", p: load_balancer, x: 26, y: 26, w: 9, h: 5,
       label: "aelbippalo001", meta: "<ae-ilb-frontend>", parent: ae-insp, state: deployed}
    - {id: ae-nva-ew1, name: "ae/hub/inspect/nva-ew-1", p: firewall, x: 37, y: 25, w: 9, h: 7,
       label: "aefwppalo003", meta: "E-W | D16as_v5", parent: ae-insp, state: deployed}
    - {id: ae-nva-ew2, name: "ae/hub/inspect/nva-ew-2", p: firewall, x: 47, y: 25, w: 9, h: 7,
       label: "aefwppalo004", meta: "E-W | D16as_v5", parent: ae-insp, state: deployed}
    - {id: ae-public, name: "ae/hub/public", p: subnet, x: 24, y: 37, w: 16, h: 6,
       label: "auea-snet-public-001", meta: "10.40.0.64/27 | N-S pair 001/002",
       parent: ae-hub, state: deployed}
    - {id: ae-vmx, name: "ae/hub/vmx", p: subnet, x: 42, y: 37, w: 16, h: 6,
       label: "auea-snet-vmx-001", meta: "10.40.0.160/27 | undocumented in plan",
       parent: ae-hub, state: deployed, badge: UNRECONCILED}
    - {id: ae-identity, name: "ae/spoke/identity", p: spoke, x: 9, y: 50, w: 20, h: 9,
       label: "auea-vnet-identity-001", meta: "10.40.4.0/24", parent: zone-ae, state: deployed}
    - {id: ae-prod-ctrl, name: "ae/spoke/prod-ctrl", p: spoke, x: 31, y: 50, w: 20, h: 9,
       label: "auea-vnet-prod-ctrl-001", meta: "10.40.8.0/22", parent: zone-ae, state: deployed}
    - {id: ae-prod-std, name: "ae/spoke/prod-std", p: spoke, x: 53, y: 50, w: 20, h: 9,
       label: "auea-vnet-prod-std-001", meta: "10.40.48.0/22", parent: zone-ae, state: deployed}
    - {id: ae-nonprod, name: "ae/spoke/nonprod", p: spoke, x: 9, y: 61, w: 30, h: 8,
       label: "dev / sit / uat, both domains", meta: "6 x /23 | 10.40.24-86",
       parent: zone-ae, state: planned, badge: PLANNED}
    - {id: ae-avd, name: "ae/spoke/avd", p: spoke, x: 41, y: 61, w: 14, h: 8,
       label: "auea-vnet-avd-ctrl-001", meta: "10.40.88.0/23",
       parent: zone-ae, state: planned, badge: PLANNED}
    - {id: ae-sandbox, name: "ae/spoke/sandbox", p: spoke, x: 57, y: 61, w: 16, h: 8,
       label: "sandbox / acquisitions", meta: "10.40.248-254 | CIDRs may overlap",
       parent: zone-ae, state: planned, badge: PLANNED}
    - {id: ae-legacy, name: "ae/ext/legacy-lz", p: on_premises_boundary, x: 9, y: 46, w: 26, h: 5,
       label: "Legacy AUEA landing zone", meta: "peered to new hub | hosts Meraki vMX", state: deployed}

    # ---------------- Australia Southeast ----------------
    - {id: zone-as, name: "as/zone", p: region, x: 83, y: 15, w: 70, h: 57,
       label: "Australia Southeast", meta: "10.50.0.0/16", state: deployed, badge: UNRECONCILED}
    - {id: as-hub, name: "as/hub/vnet", p: hub, x: 99, y: 19, w: 38, h: 26,
       label: "ause-vnet-connectivity-001", meta: "10.50.0.0/23 | design table says -01",
       parent: zone-as, state: deployed}
    - {id: as-insp, name: "as/hub/inspect", p: subnet, x: 101, y: 22, w: 34, h: 13,
       label: "ause-snet-private-001", meta: "10.50.0.96/27", parent: as-hub, state: deployed}
    - {id: as-ilb, name: "as/hub/inspect/ilb", p: load_balancer, x: 103, y: 26, w: 9, h: 5,
       label: "aslbippalo001", meta: "<as-ilb-frontend>", parent: as-insp, state: deployed}
    - {id: as-nva-ew1, name: "as/hub/inspect/nva-ew-1", p: firewall, x: 116, y: 25, w: 9, h: 7,
       label: "asfwppalo002", meta: "E-W | D8as_v5 | single instance", parent: as-insp, state: deployed}
    - {id: as-public, name: "as/hub/public", p: subnet, x: 101, y: 37, w: 16, h: 6,
       label: "ause-snet-public-001", meta: "10.50.0.64/27 | N-S asfwppalo001",
       parent: as-hub, state: deployed}
    - {id: as-vmx, name: "as/hub/vmx", p: subnet, x: 119, y: 37, w: 16, h: 6,
       label: "ause-snet-vmx-001", meta: "10.50.0.160/27", parent: as-hub, state: deployed}
    - {id: as-identity, name: "as/spoke/identity", p: spoke, x: 86, y: 50, w: 20, h: 9,
       label: "ause-vnet-identity-001", meta: "10.50.4.0/24", parent: zone-as, state: deployed}
    - {id: as-prod-ctrl, name: "as/spoke/prod-ctrl", p: spoke, x: 108, y: 50, w: 20, h: 9,
       label: "ause-vnet-prod-ctrl-001", meta: "10.50.8.0/22", parent: zone-as, state: deployed}
    - {id: as-rest, name: "as/spoke/rest", p: spoke, x: 86, y: 61, w: 42, h: 8,
       label: "prod-std, dev / sit / uat, avd, sandbox", meta: "mirror allocation on 10.50.x.x",
       parent: zone-as, state: planned, badge: PLANNED}
    - {id: as-legacy, name: "as/ext/legacy-lz", p: on_premises_boundary, x: 86, y: 46, w: 26, h: 5,
       label: "Legacy AUSE landing zone", meta: "peered to new hub", state: deployed}

    # ---------------- External boundaries ----------------
    - {id: zscaler, name: "ext/zscaler", p: saas_boundary, x: 62, y: 8, w: 30, h: 5,
       label: "Zscaler Cloud Proxy", meta: "HTTP egress via tunnel.1", state: deployed}
    - {id: onprem, name: "ext/onprem", p: on_premises_boundary, x: 6, y: 8, w: 26, h: 5,
       label: "On-premises", meta: "via Meraki SD-WAN, BGP", state: deployed}

  connectors:
    - {id: "ae-identity>ae-hub",  from: ae-identity,  fromSite: 0, to: ae-hub, toSite: 2, class: peering}
    - {id: "ae-prod-ctrl>ae-hub", from: ae-prod-ctrl, fromSite: 0, to: ae-hub, toSite: 2, class: peering}
    - {id: "ae-prod-std>ae-hub",  from: ae-prod-std,  fromSite: 0, to: ae-hub, toSite: 2, class: peering}
    - {id: "ae-nonprod>ae-hub",   from: ae-nonprod,   fromSite: 0, to: ae-hub, toSite: 1, class: planned}
    - {id: "ae-avd>ae-hub",       from: ae-avd,       fromSite: 0, to: ae-hub, toSite: 2, class: planned}
    - {id: "ae-legacy>ae-hub",    from: ae-legacy,    fromSite: 0, to: ae-hub, toSite: 1, class: peering,
       label: "legacy-LZ peering | in-region E-W inspected"}
    - {id: "ae-sandbox!ae-hub",   from: ae-sandbox,   fromSite: 0, to: ae-hub, toSite: 2,
       class: denied, label: "no peering by design (DD12)", marker: no_symbol}
    - {id: "as-identity>as-hub",  from: as-identity,  fromSite: 0, to: as-hub, toSite: 2, class: peering}
    - {id: "as-prod-ctrl>as-hub", from: as-prod-ctrl, fromSite: 0, to: as-hub, toSite: 2, class: peering}
    - {id: "as-rest>as-hub",      from: as-rest,      fromSite: 0, to: as-hub, toSite: 2, class: planned}
    - {id: "as-legacy>as-hub",    from: as-legacy,    fromSite: 0, to: as-hub, toSite: 1, class: peering}
    - {id: "ae-prod-ctrl>ae-ilb", from: ae-prod-ctrl, fromSite: 0, to: ae-ilb, toSite: 2,
       class: inspected, label: "UDR 0.0.0.0/0 -> <ae-ilb-frontend>"}
    - {id: "ae-prod-std>ae-ilb",  from: ae-prod-std,  fromSite: 0, to: ae-ilb, toSite: 2, class: inspected}
    - {id: "ae-ilb>ae-nva-ew1",   from: ae-ilb, fromSite: 3, to: ae-nva-ew1, toSite: 1, class: inspected}
    - {id: "ae-ilb>ae-nva-ew2",   from: ae-ilb, fromSite: 3, to: ae-nva-ew2, toSite: 1, class: inspected}
    - {id: "as-prod-ctrl>as-ilb", from: as-prod-ctrl, fromSite: 0, to: as-ilb, toSite: 2,
       class: inspected, label: "UDR 0.0.0.0/0 -> <as-ilb-frontend>"}
    - {id: "as-ilb>as-nva-ew1",   from: as-ilb, fromSite: 3, to: as-nva-ew1, toSite: 1, class: inspected}
    - {id: "ae-public>zscaler",   from: ae-public, fromSite: 0, to: zscaler, toSite: 2,
       class: tunnel, label: "IPsec tunnel.1 | HTTP only"}
    - {id: "as-public>zscaler",   from: as-public, fromSite: 0, to: zscaler, toSite: 2,
       class: tunnel, label: "IPsec tunnel.1"}
    - {id: "ae-vmx>onprem",       from: ae-vmx, fromSite: 1, to: onprem, toSite: 2,
       class: uninspected, label: "Meraki SD-WAN, BGP | vMX in legacy AUEA"}
    - {id: "ae-hub<>as-hub",      from: ae-hub, fromSite: 3, to: as-hub, toSite: 1, class: logical,
       label: "hub-to-hub peering | Panorama HA + vMX reach only, NOT an inspected data path"}

  legend:
    at: {x: 8, y: 74, w: 62, h: 8}
    convention: "Arrows show direction of session initiation."
    entries:
      - {class: peering,     text: "VNet peering, deployed"}
      - {class: planned,     text: "VNet peering, planned (spoke not deployed)"}
      - {class: inspected,   text: "Forced east-west path, inspected (UDR to ILB frontend)"}
      - {class: tunnel,      text: "IPsec tunnel to Zscaler"}
      - {class: uninspected, text: "SD-WAN backhaul"}
      - {class: logical,     text: "Reachability only, no inspection"}
      - {class: denied,      text: "Deliberately not peered"}

  callout:
    at: {x: 92, y: 74, w: 60, h: 8}
    text: "Only intra-region east-west is firewall-inspected. AUSE runs one firewall per set against AUEA's two; the AUSE load-balancer count is unconfirmed (remediation register A5 #42)."

  source_band:
    at: {x: 6, y: 83}
    text: "[CORPUS: architecture/topology.md; ipam/address-plan.md; architecture/firewall-nva.md] | As-built handover | model v-, layout v-"
```

Conformance self-check: 22 primary shapes with six subnet chips counting as two gives an effective 18, inside the engineering ceiling of 42. Seven legend entries, at the ceiling of seven distinct symbol meanings. Containment depth region, vnet, subnet, resource = four, at the engineering limit. All coordinates integer `u`.

#### Where python-pptx cannot do what this layout needs

| # | Requirement | Limitation | Workaround |
|---|---|---|---|
| 1 | Box sized to fit its label | No text measurement without a rendering engine `[EXTERNAL]` | Character budget `capacity ~= (w_in - 2*margin_in) / (0.55 * pt/72) * lines`, asserted at build. A label over capacity **fails the build** rather than shipping clipped |
| 2 | `ELBOW` bend position | `bentConnector3` `adj1` not exposed `[EXTERNAL]` | Raw XML `<a:avLst><a:gd name="adj1" fmla="val 50000"/></a:avLst>` |
| 3 | Connector path after attachment | `begin_connect` writes `stCxn` but does not recompute the connector's `a:off` / `a:ext` / `flipH` / `flipV` `[EXTERNAL]` | Set straight-line geometry from the two connection-site coordinates **before** attaching. PowerPoint re-routes on open; without this, thumbnails render broken |
| 4 | Connection sites on `HEXAGON`, `FLOWCHART_DELAY`, `FLOWCHART_MAGNETIC_DRUM` | Site count and order vary by preset, undocumented in python-pptx `[EXTERNAL]` | Hand-validate a lookup table once in PowerPoint, store in `refs/`, range-assert at build |
| 5 | Arrowheads | Not in the API `[EXTERNAL]` | Raw XML on `a:ln`: `<a:headEnd type="none"/><a:tailEnd type="triangle" w="med" len="med"/>` |
| 6 | 50% alpha on planned connectors | Line transparency not exposed `[EXTERNAL]` | Raw XML `<a:alpha val="50000"/>` inside the `a:ln` solid fill |
| 7 | Region container at 40% alpha | Shape fill transparency not exposed `[EXTERNAL]` | Raw XML `<a:alpha val="40000"/>`, or pre-compute the flattened hex against `paper` and emit opaque. Flattening preferred: it survives Google Slides conversion, which drops alpha |
| 8 | `NO_SYMBOL` on the denied connector | No OOXML connector decoration exists | Separate `NO_SYMBOL` shape at the computed midpoint; does not travel if the connector reroutes; flagged by the drift check |
| 9 | Connector text | `Connector` has no `text_frame` `[EXTERNAL]` | Separate chip textbox named `link/<id>/label`. It does **not** move when the connector reroutes - the single largest editability compromise. Drift check comparing chip centre to connector midpoint, tolerance 0.15in |
| 10 | Badge travelling with its parent | No grouping, by policy | Position by rule; conformance check flags a badge more than `0.6u` from its parent's top-right |
| 11 | Z-order control | No API; render order is `spTree` document order `[EXTERNAL]` | Emit in the ten-step order and never append |
| 12 | Theme and layout creation | python-pptx cannot create a theme or a slide layout `[EXTERNAL]` | Ship a `.potx` carrying the theme and seven layouts. Hard dependency; `[UNKNOWN]` whether APM has one |
| 13 | Alt text | `descr` not exposed in most versions `[EXTERNAL]` | `shape._element._nvXxPr.cNvPr.set('descr', f"{label}. {meta}")` |
| 14 | Font embedding | Not supported `[EXTERNAL]` | Declare theme fonts in the `.potx`, or substitute Segoe UI and record the substitution |
| 15 | Vendor and Azure icons | Licensed binaries, cannot be reproduced | Icon-free. If APM supplies EMF, `add_picture` accepts EMF and WMF; SVG is not a python-pptx image type and needs raw part injection |
| 16 | Table cell borders in `graphicFrame` | Not exposed `[EXTERNAL]` | Raw XML `a:lnL` / `a:lnR` / `a:lnT` / `a:lnB` per cell |

Items 2, 5, 6, 7, 11 and 13 resolve to the same mechanism: python-pptx's `_element` escape hatch to raw lxml. Budget roughly 150 lines of XML helper as first-class build code.

`[EXTERNAL]` Verify against current documentation before relying on: python-pptx group-shape support (`add_group_shape` behaviour has changed across 0.6.x), whether `descr` has since been exposed as a first-class property, and the current `add_picture` image-type list.

---

## SECTION 4 - SLIDE PACK BLUEPRINT

Spine: **context, current state, target state, decisions, risks and gaps, roadmap**. M = mandatory in every pack. C = conditional, with the trigger stated.

| # | layout type | title | body content spec | diagram | corpus source | speaker note purpose | M/C |
|---|---|---|---|---|---|---|---|
| 1 | Title | `<engagement name>` - architecture design | Client, engagement, document version, date, classification line "Internal - APM operates at RFFR PROTECTED" | - | - | State the decision being asked for in one sentence | M |
| 2 | Statement | What this pack asks you to approve | 3-5 bullets, each a decision with a named owner. No architecture | - | - | The only slide the approver must remember | M |
| 3 | Metric row | The estate as it stands | 6 tiles: 15 subscriptions (count conflict flagged), 218 policy assignments, 6 firewalls, 2 regions, 40 subnets deployed, 81 ratified decisions | - | landing-zones.md; policy-baseline.md; ipam/address-plan.md; governance.md | Every number carries its corpus file; do not round | M |
| 4 | Section opener | Context | Full-bleed `navy`, section title only | - | - | - | M |
| 5 | Diagram-Full | Governance structure is enforced, not aspirational | 3 bullets max under the diagram | D01 | landing-zones.md | Name the L4 no-RBAC rule and why | M |
| 6 | Diagram-Full | The controlled and standard split is the RFFR boundary | What crosses it and what does not | D25 | landing-zones.md; governance.md; tagging.md | This is the structural idea a board must hold | M |
| 7 | Section opener | Current state | Full-bleed `navy` | - | - | - | M |
| 8 | Diagram-Full | The estate in one picture | Deployed and planned distinguished; conflict banner present | D03 | topology.md; ipam/address-plan.md | Half the spokes are planned, not built | M |
| 9 | Diagram-Full | Deployed is not the same as designed | Deployed against planned subscription count, the three placement anomalies | D02 | landing-zones.md; policy-baseline.md | Name the 14/15 count conflict; do not resolve it | M |
| 10 | Diagram-Full | How traffic is controlled | Six inspected flows, with flow 6 badged NOT ENABLED | D05 + D06 composited | firewall-nva.md | Default-deny both directions; egress allow-listed via Zscaler | M |
| 11 | Diagram-Half-Text | Only intra-region east-west is inspected | Left: D05. Right: the inter-region exception in prose | D05 | firewall-nva.md; topology.md | The most misread fact in the topology | M |
| 12 | Diagram-Full | What we watch | Two log planes, retention tiers, the 30-day security exposure called out | D14 | platform-services.md; firewall-nva.md | Retention is a live non-compliance | M |
| 13 | Table | Two tags silently drive automation | All 13 tags; `backup` and `update-stage` rows highlighted with what they trigger | D19 (inline, S) | tagging.md | A workload missing either is unprotected and unpatched without erroring | M |
| 14 | Table | Address allocation follows the archetype rule | Archetype sizing table plus the requested CIDR and its reserved growth block | D17 | ipam/address-plan.md | No ad-hoc CIDRs; the plan is the system of record (RS07) | M |
| 15 | Section opener | Target state | Full-bleed `navy` | - | - | - | M |
| 16 | Diagram-Full | Where this workload lands | The design's own placement on the existing topology | D03 derivative | topology.md; ipam/address-plan.md | Subscription, MG, CIDR, inspection path, egress FQDNs | M |
| 17 | Diagram-Full | Build-level network | Subnets, masks, NSGs, next hops as tokens | D04 derivative | ipam/address-plan.md; connectivity.md | Engineering density; A3 variant in the document | M |
| 18 | Section opener | Decisions | Full-bleed `navy` | - | - | - | M |
| 19 | Decisions | Decisions this design makes | One row per decision: id, decision, options considered, rejection reasons, owner | - | governance.md (DD register format) | Options assessed, not asserted | M |
| 20 | Decisions | Decisions we need from you | One row per open decision with owner and date | - | - | Four named decisions, four owners, four dates | M |
| 21 | Section opener | Risks and gaps | Full-bleed `navy` | - | - | - | M |
| 22 | Statement | The November 2026 cliff | Single fact on an empty slide: every MG role assignment expires; no renewal process exists | - | identity-rbac.md; remediation-register.md A2 #20 | The only item with a date on which administration stops working | M |
| 23 | Conflict | Two architectures, one estate | Two-column: deployed dual-region against believed-ratified single-region multi-zone, both cited, verdict band beneath | D15 with banner | resilience-dr.md; ai-lz-reconciliation.md R10 | Do not pick a side in the room either | M |
| 24 | Table | Assumptions this design makes | Assumption, corpus evidence or `[UNKNOWN]`, what breaks if false, owner to confirm | - | - | An assumption with no owner is a finding | M |
| 25 | Diagram-Full | Baseline defects we inherit | 45 source defects plus 16 CAF and ALZ deviations by priority | D24 | remediation-register.md | The baseline has real problems; the design inherits them honestly | M |
| 26 | Section opener | Roadmap | Full-bleed `navy` | - | - | - | M |
| 27 | Roadmap band | What good looks like | Remediation and build grouped into waves with gates | - | remediation-register.md | Name the gate for each wave | M |
| 28 | Statement | Close | Restate the asks from slide 2 | - | - | - | M |
| C1 | Diagram-Full | Firewall interface and zone model | Interfaces, zones, three-VR against single-VR | D09 | firewall-nva.md | Trigger: the design changes firewall configuration | C |
| C2 | Diagram-Full | Panorama management structure | HA pair, template stacks, device groups, Sentinel chain | D10 | firewall-nva.md | Trigger: the design adds security policy | C |
| C3 | Diagram-Full | Routing and UDR model | Route tables, next hops, propagation, precedence | D11 | connectivity.md | Trigger: the design adds or changes a route table | C |
| C4 | Diagram-Full | Private DNS and private endpoint model | Central zones, VNet links, `-pe-` subnets, policy denial of local zones | D12 | connectivity.md | Trigger: the design uses a private endpoint | C |
| C5 | Diagram-Full | Identity and RBAC scope | Groups, custom roles, PIM eligibility, Nov 2026 expiry | D13 | identity-rbac.md | Trigger: the design creates role assignments | C |
| C6 | Diagram-Full | Backup and DR topology | Vaults, GRS against LRS, tag-driven enrolment | D15 | resilience-dr.md; tagging.md | Trigger: the design deploys IaaS or SQL | C |
| C7 | Diagram-Full | Policy scope model | 218 assignments across five tiers; which apply here | D16 | policy-baseline.md | Trigger: the design seeks a policy exemption | C |
| C8 | Diagram-Full | Three-ring patch orchestration | Rings, tag-driven membership, AUM configurations | D18 | platform-services.md; tagging.md | Trigger: the design deploys a VM | C |
| C9 | Diagram-Full | Inbound ingress: state against intent | Handover state beside designed path, marked unreconciled | D08 | firewall-nva.md; integration-services.md | Trigger: the design needs inbound access | C |
| C10 | Diagram-Full | AI landing zone target state | Eight workload subscriptions, gateway tier, egress path | D20 | ai-landing-zone.md | Trigger: AI engagement | C |
| C11 | Diagram-Full | AI guardrail stack | authN, token limit, quota, content safety, two-tier logging | D21 | ai-landing-zone.md | Trigger: AI engagement | C |
| C12 | Diagram-Full | AI two-tier logging | Telemetry always-on against payload default-off | D23 | ai-landing-zone.md | Trigger: AI engagement handling prompts or completions | C |
| C13 | Diagram-Full | Integration platform target state | APIM Premium v2 injection, Boomi MCS VPN, webhook ingress | D22 | integration-services.md | Trigger: integration engagement. Slide must carry a "design intent v0.1, nothing built" banner | C |
| C14 | Diagram-Full | Deployment and change path | Terraform for NVA, portal-managed policy, ServiceNow exemptions | D27 | firewall-nva.md; governance.md | Trigger: the design emits IaC or policy artefacts. Must surface the DD69 collision | C |
| C15 | Diagram-Full | Resource group and lock strategy | Base RGs, affinity grouping, CanNotDelete locks | D26 | landing-zones.md; policy-baseline.md | Trigger: the design creates resource groups | C |

Engagement-type presets: **platform review** = M only. **Workload landing** = M + C3, C4, C6, C8, C15. **Security or firewall change** = M + C1, C2, C9. **AI** = M + C4, C5, C10, C11, C12, C14. **Integration** = M + C4, C9, C13, C14.

Standing slide grammar: title states a finding, never a topic ("Only intra-region east-west is inspected", not "Network inspection"). Subtitle is one line, the thesis; if it cannot be written the slide has no argument and is cut. Body is one diagram **or** one table **or** five bullets, never two of those. Every count carries its `[CORPUS: …]` file. Anything not deployed carries its state badge on the slide, not only in the diagram. Section openers full-bleed `navy`; maximum two consecutive content slides without a diagram. Speaker notes are written only when the user asks for them.

---

## SECTION 5 - DESIGN DOCUMENT BLUEPRINT

### 5.1 The four document types and when each applies

Evidenced in the corpus by the source documents each corpus file cites `[CORPUS: SKILL.md; ipam/address-plan.md; standards/naming.md; architecture/ai-landing-zone.md]`.

| Type | Corpus exemplar | Scope | Written when | Authority |
|---|---|---|---|---|
| **Detailed Design** | APM Azure Landing Zone (APAC) - DetailedDesign v1.1, 17 July 2026 | Platform-wide. Establishes the estate: MG hierarchy, subscriptions, addressing, policy planning, the DD1-DD81 ratified decision register | Once per platform, revised per stream | Governs platform structure. Superseded in parts by later standards documents, e.g. its Table 7 naming is explicitly superseded by the 17 July 2026 naming PDF |
| **DDD** (Detailed Design Document) | APM_ES_AI_LZ_DDD v2.4; Boomi DDD v0.1; AI Gateway DDD v0.1 | One solution or platform capability. Architecture, decisions, rationale, control mapping | Per solution, before build | Governs solution intent. Loses to the TCD on conflict |
| **TCD** (Technical Configuration Document) | APM_ES_AI_LZ_TCD v0.5 | Build-level configuration for one solution: resource inventory, addressing, NAT and firewall rules, accounts, RBAC, verification matrix | Per solution, at or after build readiness | **Authoritative over the DDD on conflict.** Becomes de-facto as-built on approval |
| **As-Built** | Palo Alto Firewall Deployment As-Built v1.0, 12 Dec 2025 | Deployed state of one platform component, including its defects | Post-implementation, per component | Governs deployed state. `baseline: partner-delivered` - check every claim against the remediation register before treating it as true |

`[CORPUS: SKILL.md]` AI landing zone precedence is TCD v0.5, then DDD v2.4, then AI Gateway DDD v0.1; the TCD governs on conflict. `[CORPUS: architecture/integration-services.md]` is design intent at v0.1 and nothing in it is built.

`[INFERENCE]` A generated design is a DDD by default. It becomes a TCD when the engagement asks for build-level configuration, and the generator should refuse to emit an As-Built unless the user supplies deployment evidence, because an As-Built asserts deployed state and the generator has none.

### 5.2 DDD section blueprint

| # | Heading | Purpose | Corpus source | Required tables | Required diagrams | Notes |
|---|---|---|---|---|---|---|
| 1 | Introduction | Purpose, audience, scope, the decision being asked for | - | Audience table: who is asked for what, and what to read first | - | Cover fields per APM template: Project Name, Program Name, Division/Unit, Document Status, Document Version, Document Owner, Contact Details, Product ID, plus Consultation, References and Derivation, SDA Approval |
| 2 | Solution Overview | The architecture in one page; components; what is deliberately absent and why | - | Component inventory | D03 derivative | State the RFFR position in this section, not later |
| 3 | Platform Context (inherited) | What this design inherits rather than re-derives. **Ten mandatory rows, see 5.3** | landing-zones.md; ipam/address-plan.md; firewall-nva.md; standards/naming.md; standards/tagging.md; policy-baseline.md; identity-rbac.md; platform-services.md; resilience-dr.md | Platform Context table | D01 or D02 | A design missing any row is not reviewable |
| 4 | Business and Application Architecture | Requirements as user stories with acceptance criteria; applications and their configuration | - | Requirements table; application inventory | - | - |
| 5 | Technology Architecture | Compute, image, PaaS, and **5.3 Network** | ipam/address-plan.md; connectivity.md; firewall-nva.md | Per-setting tables | D04 derivative, D11 if routing changes | Section 5.3 carries the nine network requirements below |
| 6 | Information and Data | What data exists, where it lives, retention, flows | platform-services.md | Retention table | D14 derivative | Reconcile against the 180-day requirement explicitly |
| 7 | Cyber and Security | Compliance frame, identity and access, control alignment, exclusions with compensating controls, risk register | governance.md; identity-rbac.md; policy-baseline.md | Policy exposure table; control alignment table; risk register | D13 if role assignments created, D16 if exemption sought | MCSB, RFFR, ISM, APM Policy are the frame. COMP001 is ISM PROTECTED at APM root |
| 8 | Service Availability and DR | Availability model, failure modes, recovery, the DR-posture assumption | resilience-dr.md | RPO and RTO table; vault table | D15 | Must state which side of the DR conflict it assumes, as an assumption with its risk |
| 9 | Service Management | Monitoring and alerting, patching, backup enrolment, implementation sequence, validation | platform-services.md; tagging.md | Alerting table; patch ring table; test plan | D18 if VMs deployed | Every test has a pass criterion that is objectively true or false |
| 10 | Decision register | Every decision this design makes | governance.md for format | Decision table, format in 5.4 | - | Numbered from 001 |
| 11 | Assumption ledger | Every assumption, with evidence and owner | - | Assumption table, format in 5.5 | - | An assumption with neither evidence nor owner is a finding |
| A+ | Appendices | Full configuration payloads verbatim | - | - | A3 variants of engineering-density diagrams | Third-party supplied configuration goes in verbatim, same order, role-neutral attribution |

### 5.3 Platform Context - the ten mandatory rows

| Row | Must state | Corpus source |
|---|---|---|
| Placement | Target subscription and management group, chosen from the as-built set, with the archetype rationale | landing-zones.md |
| Address allocation | The CIDR requested, the archetype sizing rule it follows, and the adjacent reserved growth block | ipam/address-plan.md |
| Inspection | Which of the six flows the workload uses, and therefore which firewall set inspects it | firewall-nva.md |
| Egress | Named FQDNs and URL categories for the Zscaler allow-list. Never "standard internet access" | firewall-nva.md |
| Naming | Every object named per the standard, in a table, before build | standards/naming.md |
| Tagging | All 13 tags with the values this workload will carry; `backup` and `update-stage` argued explicitly | standards/tagging.md |
| Policy exposure | Which of the 218 assignments apply at the chosen scope, and any exemption sought via ServiceNow | policy-baseline.md; governance.md |
| Identity | RBAC groups, custom roles, PIM eligibility, and a mandatory acknowledgement of the November 2026 expiry | identity-rbac.md |
| Logging | Which workspace, which DCR, what retention, and whether the 180-day requirement is met or breached | platform-services.md |
| Resilience | Which side of the DR conflict the design assumes, stated as an assumption with its risk | resilience-dr.md |

### 5.3.1 Section 5.3 Network - the nine

1. Naming convention, per `standards/naming.md`, including which notational style applies.
2. Address plan including the reserved growth block.
3. Subnet allocation with masks and the dedicated NSG per subnet.
4. Routing with next hop, expressed as a token, not a host address.
5. DNS resolver and private zones; workload-local private DNS zones are policy-denied.
6. Named egress FQDNs and URL categories.
7. NSG rule baseline, named per the NSG rule convention.
8. Connectivity and resilience: region, zones, and the DR-posture assumption.
9. A build-level diagram showing the CIDRs, at engineering density.

### 5.4 Decision record format

Matches the ratified register's shape `[CORPUS: policies/governance.md]`, extended with options so an approver can see what was considered.

```yaml
- id: DR-001
  title: "Forced tunnelling of workload egress through the hub East-West set"
  status: proposed          # proposed | ratified | superseded
  relates_to: [DD16, DD13]  # ratified platform decisions this depends on
  context: "<one paragraph, with [CORPUS: …] citations>"
  options:
    - option: "UDR 0.0.0.0/0 to the internal LB frontend of the East-West set"
      selected: true
      rationale: "<why>"
    - option: "Direct internet egress from the spoke"
      selected: false
      rejected_because: "GEN07 and GEN08 deny public IPs on NICs and require private subnets; DD17 limits public IP creation to the Connectivity subscription"
    - option: "Service endpoints instead of private endpoints"
      selected: false
      rejected_because: "DD14/15 - service endpoints are not to be used unless necessary; APM028 audits or denies them"
  consequence: "<what this commits APM to>"
  owner: "<role, never an individual's name>"
  decided_on: null          # null while proposed
```

A decision row is mandatory for: any deviation from an archetype sizing rule; any policy exemption; any workload-local private DNS zone; any inbound path, because inbound North-South is not enabled; any assumption about DR posture; any reliance on an undeployed spoke; any new naming token or abbreviation, which also needs the naming standard's own update process.

### 5.5 Assumption ledger format

```yaml
- assumption: "The AVD spoke is deployed before this workload migrates"
  evidence: "[UNKNOWN]"
  would_be_answered_by: "APM Infrastructure team confirmation, or a revised as-built"
  breaks_if_false: "The workload has no network; migration cannot start"
  owner: "APM Infrastructure Team"
```

---

## SECTION 6 - CONFORMANCE RULE SET

Every rule is a testable assertion. `AUTO` = machine-checkable. `RULING` = cannot be automated, needs an APM decision first.

### 6.1 Naming rules

`[CORPUS: standards/naming.md]`

General grammar: `[region]-[abbreviation]-[environment]-[apm security domain]-[descriptor]-[instance identifier]`.

Two notational styles. **Hyphenated** is the default. **Shortform concatenated** is used where Azure constrains names (storage accounts) and by convention for VMs, Palo Alto firewalls and internal load balancers. The source writes shortform format strings with hyphens between tokens but every example concatenates; **the examples govern**.

Token encodings, including the security domain in its three forms:

```
region            auea | ause
region:shortform  ae | as
country           aus (lower) | AUS (management groups)
environment       prod | dev | sit | uat | nonprod | connectivity (conn) | identity | management (mgmt) | security (sec)
environment:sf    p = prod | m = management | x = security
security domain   controlled | standard      <- FULL WORD, subscriptions only
                  ctrl | std                 <- all other resources
                  c | s                      <- shortform concatenated names
instance          001 (three digits); subscriptions and some VM/rule examples use 01
global scope      apm prefix replaces region for globally unique services (Front Door family)
```

| id | rule | assertion | mode |
|---|---|---|---|
| N-01 | Management group | `^AUS-MG-[A-Z0-9-]+$` | AUTO |
| N-02 | Subscription | `^aus-sub-(prod\|dev\|sit\|uat)-(controlled\|standard)-\d{2,3}$` or `^aus-sub-(connectivity\|identity\|management\|security\|sandbox\|acquisitions)(-\d{3})?$` | AUTO |
| N-03 | Subscription uses the full-word security domain | name must not contain `-ctrl-` or `-std-` | AUTO |
| N-04 | Resource group | `^(auea\|ause)-rg-(prod\|dev\|sit\|uat\|nonprod\|connectivity\|identity\|management\|security)(-(ctrl\|std))?-[a-z0-9]+-\d{3}$` | AUTO |
| N-05 | Palo Alto resource group must contain `palo` | if resource relates to the NVA stack, RG name matches `palo` | AUTO |
| N-06 | Virtual network | `^(auea\|ause)-vnet-(prod\|dev\|sit\|uat\|nonprod\|connectivity\|identity\|management\|security\|avd)(-(ctrl\|std))?-\d{3}$` | AUTO |
| N-07 | Subnet carries no environment or security domain | `^(auea\|ause)-snet-[a-z0-9-]+-\d{3}$` and must not match `-(ctrl\|std)-` | AUTO |
| N-08 | Route table | `^(auea\|ause)-rt-[a-z]+(-(ctrl\|std))?(-[a-z0-9]+)?-\d{3}$` | AUTO |
| N-09 | NSG | `^(auea\|ause)-nsg-[a-z]+(-(ctrl\|std))?(-[a-z0-9]+)?-\d{3}$` | AUTO |
| N-10 | NSG rule | `^(allow\|deny)-(ib\|ob)-[a-z0-9]+-to-[a-z0-9]+(-[a-z0-9]+)?-\d{2}$` | AUTO |
| N-11 | Public IP | `^(auea\|ause)-pip-[a-z]+(-[a-z0-9]+)?-\d{3}$` | AUTO |
| N-12 | Private DNS zone inventory record | `^(auea\|ause)-pdz-[a-z0-9]+-\d{3}$`. The Azure resource itself must retain the mandatory `privatelink` FQDN name | AUTO |
| N-13 | Private endpoint | `^(auea\|ause)-pep-[a-z]+(-(ctrl\|std))?-[a-z0-9]+-\d{3}$` | AUTO |
| N-14 | Application Gateway | `^(auea\|ause)-appgw-[a-z]+(-(ctrl\|std))?(-[a-z0-9]+)?-\d{3}$` | AUTO |
| N-15 | Availability set | `^(auea\|ause)-avail-[a-z]+(-(ctrl\|std))?-[a-z0-9]+-\d{2,3}$` | AUTO |
| N-16 | Firewall VM (shortform, concatenated, no hyphens) | `^(ae\|as)fw[pmx][a-z0-9]+\d{3}$` | AUTO |
| N-17 | Internal load balancer (shortform) | `^(ae\|as)lbi[pmx][a-z0-9]+\d{3}$` | AUTO |
| N-18 | OS disk | `^(ae\|as)-osdisk-[a-z0-9]+$` | AUTO |
| N-19 | Data disk | `^(ae\|as)-datadisk-[a-z0-9]+-\d{3}$` | AUTO |
| N-20 | NIC | `^(ae\|as)-nic-[a-z0-9]+-\d{3}$` | AUTO |
| N-21 | Server VM (shortform) | `^(ae\|as)vm[pmx][cs]?[a-z0-9]+\d{2,3}$` | AUTO |
| N-22 | Storage account (shortform, 3-24 chars, lowercase alphanumeric only) | `^(ae\|as)st[pmx][cs]?[a-z0-9]+\d{3}$` and `length <= 24` | AUTO |
| N-23 | Security flow-log storage account | `^(ae\|as)stxflowlog\d{3}$` | AUTO |
| N-24 | Security diagnostic storage account | `^(ae\|as)stxsecdiag\d{3}$` | AUTO |
| N-25 | Backup policy | `^(auea\|ause)-rsvp-[a-z]+(-(ctrl\|std))?-[a-z0-9-]+-\d{3}$` | AUTO |
| N-26 | Log Analytics workspace | `^(auea\|ause)-law-[a-z]+(-[a-z0-9]+)?-\d{3}$` | AUTO |
| N-27 | Key Vault | `^(auea\|ause)-kv-[a-z]+(-(ctrl\|std))?(-[a-z0-9]+)?-\d{3}$` and `length <= 24` | AUTO |
| N-28 | Managed identity | `^(auea\|ause)-(uami\|sami)-[a-z]+(-(ctrl\|std))?-[a-z0-9]+-\d{3}$` | AUTO |
| N-29 | Application and data services | `^(auea\|ause)-(sql\|sqldb\|sqlep\|sqlmi\|ase\|asp\|func\|aapi\|adf\|app\|logic)-[a-z]+(-(ctrl\|std))?-[a-z0-9]+-\d{3}$` | AUTO |
| N-30 | Front Door endpoint and firewall policy use the global prefix | `^apm-(fde\|fdfp)-[a-z]+(-(ctrl\|std))?-[a-z0-9]+-\d{3}$` | AUTO |
| N-31 | Platform subscriptions carry no security domain token | if environment in {connectivity, identity, management, security}, name must not contain `-ctrl-`, `-std-`, `-controlled-`, `-standard-` | AUTO |
| N-32 | Azure-generated names are exempt | `^(NetworkWatcher(RG)?_?.*\|AzureBackupRG_.*)$` bypasses N-01..N-31 | AUTO |
| N-33 | New abbreviation | any abbreviation not in the registry must carry a decision row and go through the naming standard's update process | RULING |
| N-34 | Length limits | SQL server 128, SQL database 116, Web App 2-60 and globally unique, storage account 24, Key Vault 24, Front Door profile 5-64 | AUTO |

**Unresolved naming items - the generator must not silently choose.** All are `RULING`, and all nine are flagged in the standard itself `[CORPUS: standards/naming.md ingest flags]`:

| id | Unresolved item | Generator behaviour |
|---|---|---|
| N-R1 | Front Door **profile** abbreviation collides with Data Factory (`adf`); likely intended `afd` | Refuse to name a Front Door profile; emit the flag |
| N-R2 | Azure Front Door v2 section is marked `[INCORRECT]` in source and excluded | Refuse to use the v2 pattern |
| N-R3 | Recovery Services vault: format string is region-fifth, both examples are region-first | Use the example form, emit the flag, require confirmation |
| N-R4 | Network Watcher: format says `NetworkWatcherRG_[region]`, examples are Azure defaults | Use Azure defaults, exempt from N-rules |
| N-R5 | External load balancer: `lb` against `lbe` | Refuse to name an external LB; emit the flag |
| N-R6 | Source typos not propagated: `crtl`, `azmoniror`, "Assigneed" | Never reproduce; assert absence |
| N-R7 | Application Insights `aapi` deviates from the CAF norm `appi` | Use `aapi` as documented; emit an advisory |
| N-R8 | Application Gateway public IP examples use shortform region and environment, inconsistent with the Public IP section | Refuse; emit the flag |
| N-R9 | `ause` and `as` tokens remain in the standard while the DR posture is unreconciled | Emit `ause` names only inside the DR conflict banner's scope; never assert them as ratified |
| N-R10 | AI LZ TCD v0.5 proposes new abbreviations `aif`, `cosno`, `srch`, `apim`, `wafpol`; non-prod storage-account environment shortforms are TBC | Mark every use `[PROPOSED]` with a decision row |

### 6.2 Tagging rules

`[CORPUS: standards/tagging.md]`

| id | rule | assertion | mode |
|---|---|---|---|
| T-01 | All 13 tags present on every supported resource | set equality against {Criticality, application-id, business-service, apm-security-domain, environment, owner, technicalcontact, cost-centre, operationalteam, service-component-type, backup, enableupdate, update-stage} | AUTO |
| T-02 | Resource group creation blocked without mandatory tags | design must state the RG tag set before any resource | AUTO |
| T-03 | Inherited tags not hand-set | `apm-security-domain` and `environment` are auto-inherited from RG or subscription; a design that hand-sets them at resource level is flagged | AUTO |
| T-04 | `apm-security-domain` enumeration | value in {controlled, standard, platform} | AUTO |
| T-05 | `environment` enumeration | value in {SECURITY, MGMT, IDY, CONN, DEV, SIT, UAT, TEST, PROD, SBX} | AUTO |
| T-06 | `Criticality` enumeration | value in {Low, Medium, High} | AUTO |
| T-07 | `backup` enumeration | value in {BasicVMBackup, StandardVMBackup, StandardSQLVMBackup, StandardSQLVM(OS)Backup} | AUTO |
| T-08 | `backup` present on every VM | VMs without it are not enrolled in BK01-BK08 and are unprotected without erroring | AUTO |
| T-09 | `update-stage` enumeration | value in {Lead, auto-patch01, auto-patch02} | AUTO |
| T-10 | `update-stage` present on every VM | VMs without it join no AUM maintenance configuration and are unpatched without erroring | AUTO |
| T-11 | `enableupdate` enumeration | value in {Yes, no} - source uses inconsistent case; assert case-insensitively and emit an advisory | AUTO |
| T-12 | `cost-centre` format | numeric, no leading zeroes, from the SAP Finance cost centre list | AUTO for format, RULING for membership |
| T-13 | Azure tag limits | at most 50 tags per resource (15 on some types), tag name at most 512 chars, value at most 256, and no `< > % & \ ? /` in names | AUTO |
| T-14 | `technicalcontact` is a team mailbox, never an individual | assert the value is not a personal name | AUTO |
| T-15 | Enhanced backup tier has no documented tag value | if the design uses an enhanced backup policy, refuse and emit the flag: the `backup` description names three tiers, the value list has four values, and no `Enhanced*` value exists while `...-vmsqlbackup-enhanced-001` policies do | RULING |
| T-16 | Tag-count discrepancy | appendix Table 44 lists 11 tags and omits `enableupdate` and `update-stage`; the section 6.x table duplicates `service-component-type`. The generator asserts 13 and cites the discrepancy rather than resolving it | RULING |

### 6.3 Address allocation rules

`[CORPUS: ipam/address-plan.md]`

| id | rule | assertion | mode |
|---|---|---|---|
A-01 | Region supernet | AUEA prefixes within `10.40.0.0/16`; AUSE within `10.50.0.0/16` | AUTO |
| A-02 | Archetype sizing | Connectivity /23, Identity /24, Production /22 per domain, Dev-SIT-UAT /23 each per domain, Sandbox /24, Management /24, AVD /23 | AUTO |
| A-03 | Symmetric mirror | an AUSE allocation must mirror its AUEA counterpart's fourth octet and mask | AUTO |
| A-04 | Reserved growth block named | every new VNet allocation states its adjacent reserved CIDRs | AUTO |
| A-05 | Management position | Management VNet at `x.255.0/24` | AUTO |
| A-06 | Sandbox and Acquisitions position | within `x.248.0/24` to `x.254.0/24` | AUTO |
| A-07 | **Sandbox overlap exception** | overlap detection must be skipped for sandbox CIDRs, which may intentionally overlap other VNets because sandbox is never peered. Every other pair must be non-overlapping | AUTO |
| A-08 | No allocation from unallocated space without a decision | `10.40.96.0` to `10.40.247.255` is unallocated; any use needs a decision row and an address-plan update, because the plan is the system of record (RS07) | AUTO |
| A-09 | Dedicated NSG and route table per subnet | every subnet has its own NSG and inherits the VNet's route table | AUTO |
| A-10 | Private endpoints live in `-pe-` subnets | a PE outside a `-pe-` subnet fails | AUTO |
| A-11 | No IaaS and PaaS co-hosting in a subnet | assert subnet occupancy is homogeneous | AUTO |
| A-12 | Dedicated-subnet services sized with growth | SQL MI and ASE subnets sized for the service plus reserved growth | RULING |
| A-13 | **Boomi reservation conflict** | `10.40.2.0/24`, `10.40.3.0/24` and `10.50.2.0/24` are claimed by the Boomi MCS design **and** reserved as hub VNet growth space. A design touching any of them must refuse and emit the conflict | RULING |
| A-14 | AI LZ agent subnets are delegated and size-immutable | agent injection subnets delegate `Microsoft.App/environments`; size cannot change after creation | AUTO |
| A-15 | AI LZ NAT-rule inconsistency | the TCD's NAT rule cites agent sources `10.40.11.0/24` and `10.40.51.0/24`; the tabled `/26`s govern. Assert the `/26`s and emit the flag | RULING |
| A-16 | Allocation change ownership | any change routes through the APM Infrastructure team | RULING |
| A-17 | Subnet plan source anomalies | AUSE hub rows are mislabelled `auea-*` against 10.50 CIDRs, and a trailing block duplicates hub and identity rows with conflicting entries. The as-built state governs; assert against as-built, cite the design-document inconsistency | AUTO |

### 6.4 Policy constraints that would deny a deployment

`[CORPUS: policies/policy-baseline.md]`. All assignments run enforcement mode `Default`, so a deny effect blocks the deployment `[EXTERNAL]`.

| id | Assignment | What is denied | Design must therefore | mode |
|---|---|---|---|---|
| P-01 | APM007.1 / APM007.2 | Private DNS zones outside the central pattern (Platform and Region) | Use the central zones in Connectivity; never create a workload-local private DNS zone | AUTO |
| P-02 | APM001 | Audit or deny creation of Private Link private DNS zones at APM root | As P-01 | AUTO |
| P-03 | APM008.1 / APM008.2 | Unmanaged disks | Managed disks only | AUTO |
| P-04 | APM009.1 / APM009.2 | Management port access from the internet | No inbound RDP or SSH from internet; jump host via Management subnet with NSG-restricted 22 and 3389 | AUTO |
| P-05 | APM014.1 | Public network access enabled on PaaS services | `publicNetworkAccess: Disabled` plus a private endpoint | AUTO |
| P-06 | APM020.1 | Resources without encryption in transit; TLS requirements appended or denied | TLS 1.2 minimum stated for every service | AUTO |
| P-07 | APM038 | Application Gateway without TLS 1.2 minimum and certificate key size at least 224 bits | State both in the AppGW spec | AUTO |
| P-08 | APM020.3 / 020.4 / 020.5 | ASE without strongest TLS cipher suites; RSA certificates and keys below minimum size | State cipher suite and key sizes | AUTO |
| P-09 | COMP03.1 | VMs and VM scale sets without encryption at host | `encryptionAtHost: true`; DD61 prefers this over Azure Disk Encryption, which retires Sep 2028 | AUTO |
| P-10 | GEN01 | Resource groups outside allowed locations | Australia East or Australia Southeast only | AUTO |
| P-11 | GEN02 / GEN03 | Resource types outside the allowed list, or on the not-allowed list | Assert every resource type against both lists. `[UNKNOWN]` the list contents - the policy definition JSON would answer it | RULING |
| P-12 | GEN04.1 / GEN04.2 | Deletion of protected resource types | Deletion needs a step-out | AUTO |
| P-13 | GEN06 | Network interfaces with IP forwarding enabled | Exception required for NVA NICs; a design enabling IP forwarding elsewhere fails | AUTO |
| P-14 | GEN07 | Network interfaces with public IPs | No NIC-attached public IPs | AUTO |
| P-15 | GEN08 | Subnets that are not private | Every subnet private | AUTO |
| P-16 | GEN012 | VM images outside the approved OS-family list | Assert the image against the approved list. `[UNKNOWN]` list contents | RULING |
| P-17 | APM011.1 | Sandbox guardrails at AUS-MG-SANDBOX | No peering from sandbox; control-plane and data-plane isolation | AUTO |
| P-18 | APM028 | Service endpoints on subnets, audited or denied | Private endpoints, not service endpoints (DD14/15) | AUTO |
| P-19 | APM006.1 | Deploys CanNotDelete locks on resource groups | Design must account for the lock in any teardown or redeploy step | AUTO |
| P-20 | APM030 / APM031 | VMs without backup and update-management tags | See T-08 and T-10 | AUTO |
| P-21 | APM025 | Resource groups without mandatory tags | See T-02 | AUTO |
| P-22 | DD17 | Public IP creation outside the Connectivity subscription | Ingress via the hub, not a workload public IP | AUTO |
| P-23 | APM016 / APM018 | Backup vaults and Recovery Services vaults without immutability | State immutability | AUTO |
| P-24 | GEN010 / GEN011 | Vaults without soft delete | State soft delete | AUTO |
| P-25 | APM004 | Enforces hybrid use benefit | State licensing position for Windows VMs | AUTO |
| P-26 | Exemption path | Any exemption is a ServiceNow Cyber Security Request, and the standard non-compliance message references the Company Cyber Security Policy | RULING |

Policy scope selection rule `[CORPUS: policies/policy-baseline.md]`: broadly applicable guardrails are assigned once at APM root; controls differing between platform and workload contexts are assigned in pairs at AUS-MG-PLATFORM and AUS-MG-REGION with `.1`/`.2` suffixes; sandbox-specific guardrails at AUS-MG-SANDBOX; Defender for Cloud defaults and tag-driven backup per subscription. A generated policy proposal that ignores this pattern is flagged.

### 6.5 Placement rules

| id | rule | assertion | mode |
|---|---|---|---|
| PL-01 | RFFR-regulated workload | subscription under AUS-MG-CONTROLLED; `apm-security-domain: controlled` | AUTO |
| PL-02 | Non-RFFR corporate service | under AUS-MG-STANDARD; `apm-security-domain: standard` | AUTO |
| PL-03 | Platform service | Connectivity, Identity, Management or Security subscription; `apm-security-domain: platform`; no security-domain token in the name | AUTO |
| PL-04 | Hub-resident resources | Palo Alto NVA stack, VPN gateway, shared Application Gateways, NVA load balancer, DNS Private Resolver, Route Server all live in `aus-sub-connectivity` | AUTO |
| PL-05 | Domain controllers | `aus-sub-identity`, two across two availability zones (DD49) | AUTO |
| PL-06 | Security logging | `aus-sub-security` under AUS-MG-SECURITY: security workspace, Sentinel, security tooling | AUTO |
| PL-07 | Platform logging and change tracking | `aus-sub-management` under AUS-MG-MANAGEMENT | AUTO |
| PL-08 | Jump hosts | Management VNet, `snet-mgmt-jumphost`, NSG-restricted 22 and 3389, MFA and JIT logging (DD71/DD73) | AUTO |
| PL-09 | Sandbox | `aus-sub-sandbox-001`, never peered, CIDRs may overlap | AUTO |
| PL-10 | Environment segregation | one subscription per environment per security domain; a design placing two environments in one subscription fails (DD64) | AUTO |
| PL-11 | Application affinity | resources grouped by application affinity into resource groups (DD65/DD66) | RULING |
| PL-12 | Undeployed spoke | placement into dev, sit, uat, avd, sandbox or acquisitions must be declared a dependency with an owner, not described in the present tense | AUTO |
| PL-13 | Placement anomaly | if the target is sandbox, acquisitions or avd-controlled, the design must reproduce the placement anomaly note rather than assert the expected parent | AUTO |
| PL-14 | New subscription | creation and deletion are controlled by the APM Infrastructure Team (DD62/DD63) | RULING |

### 6.6 Document conformance

| id | rule | mode |
|---|---|---|
| C-01 | Every APM-specific claim carries `[CORPUS: …]`, `[EXTERNAL]`, `[INFERENCE]`, `[UNKNOWN]` or `[UNRECONCILED]` | AUTO |
| C-02 | No GUID-shaped string anywhere in output: `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}` | AUTO |
| C-03 | No host address: an IPv4 literal whose last octet is not `0`, outside a CIDR expression, must be a placeholder token | AUTO |
| C-04 | Present-tense assertion about anything the corpus marks planned or not-enabled fails | AUTO |
| C-05 | A stated count contradicting the corpus, or silently resolving a known count conflict, fails | AUTO |
| C-06 | Platform Context table missing any of the ten rows fails | AUTO |
| C-07 | An assumption row with neither evidence nor a named owner fails | AUTO |
| C-08 | An MG-scope role assignment without the November 2026 expiry acknowledgement fails | AUTO |
| C-09 | "standard internet access" or equivalent instead of named FQDNs fails | AUTO |
| C-10 | A logging design claiming the 180-day requirement while targeting the 90-day operational or 30-day security workspace fails | AUTO |
| C-11 | No em dash in any output, including cover fields and figure captions | AUTO |
| C-12 | An individual's personal name anywhere in output fails; roles only | AUTO |
| C-13 | Every diagram carries a source band citing its corpus files | AUTO |
| C-14 | Any element whose corpus state is planned, not-enabled, unreconciled, unknown or proposed carries its badge | AUTO |
| C-15 | An `UNRECONCILED` element present with no conflict banner fails | AUTO |
| C-16 | Every connector endpoint bound to a shape id and connection-site index | AUTO |
| C-17 | Every drawn line class present in the legend, and every legend row drawn | AUTO |
| C-18 | Every coordinate an integer multiple of `u`; density within the ceiling for the declared level; font floor respected | AUTO |
| C-19 | Every diagram element a native shape, never a picture | AUTO |
| C-20 | Character budget satisfied for every shape label | AUTO |

---

## SECTION 7 - EXTERNAL KNOWLEDGE LAYER

All `[EXTERNAL]`. This is knowledge the corpus assumes and never states. Verification notes at the end.

### 7.1 Azure limits and constraints that bind these decisions

- **VNet peering is non-transitive.** A spoke cannot reach another spoke through the hub on peering alone; that is precisely why UDRs force traffic to the NVA. It is also why hub-to-hub peering does not give AUEA spokes reach into AUSE spokes, which matches the corpus's statement that inter-region peering exists only to reach Panorama and the vMX.
- **UDR next hop `VirtualAppliance` must be an IP in a peered or local VNet**, and for an HA pair behind a load balancer it is the internal load balancer frontend, not a firewall NIC. A UDR cannot name two next hops, so the load balancer is architecturally required, not a convenience.
- **Route precedence is UDR, then BGP, then system.** A UDR always wins over a BGP-learned route, which is what makes forced tunnelling reliable in the presence of the Meraki SD-WAN BGP advertisements.
- **`GatewaySubnet` cannot carry an NSG in some configurations and must be at least /29**, /27 recommended. The corpus allocates /27, which is correct.
- **Subnet size loses 5 addresses to Azure**, not 3, so a /26 yields 59 usable - matching the corpus's parenthetical counts.
- **Delegated subnets cannot be resized after creation** and cannot host other resource types. This is why the AI landing zone's agent injection subnets are called size-immutable.
- **Azure Load Balancer requires health probes for backend removal**; without a probe a failed NVA continues receiving flows. Probe interval and threshold set the real failover time.
- **Availability sets give a 99.95% SLA and no zone protection; availability zones give 99.99% across zones.** The corpus places the AUEA firewalls in two availability sets, which protects against rack and update-domain failure but not zone failure - relevant to the single-region multi-zone DR question.
- **Storage account names are globally unique, 3-24 characters, lowercase alphanumeric only.** This is why the shortform concatenated style exists at all.
- **Key Vault names are 3-24 characters and globally unique.** Long descriptors will breach it.
- **Management group depth is capped at six levels below root** and a management group can hold at most 10,000 subscriptions. APM's hierarchy at L4 is within the cap with room for one more level.
- **Azure Policy evaluation is not instantaneous**: new assignments take up to 30 minutes to take effect and existing-resource compliance scans run roughly every 24 hours. A design that expects immediate enforcement of a newly created assignment is wrong.
- **Tags do not inherit natively from resource group to resource.** Inheritance requires a `modify`-effect policy, which is what APM025 does. A design that assumes native inheritance will ship untagged resources.

### 7.2 CAF and ALZ positions the corpus deviates from, and why the deviation matters

- **ALZ ships policy as code via a deployment pipeline.** APM ratified portal management (DD69). Consequence: no drift detection, no review history on a policy change, and no way to reproduce the 218 assignments into another tenant. It also collides directly with the AI landing zone's everything-as-code assumption.
- **ALZ's default connectivity is Azure Firewall or Virtual WAN.** APM uses third-party VM-Series NVAs in a classic hub-spoke. Consequence: APM owns patching, licensing, capacity and failover behaviour that a managed service would own, and the load-balancer sandwich replaces built-in HA.
- **CAF names management groups `<company>-<function>` in lowercase.** APM uses uppercase `AUS-MG-*` with a country prefix. Harmless, but it means CAF-derived automation templates need adjusting.
- **ALZ separates identity into its own subscription and expects Entra-only or minimal AD DS.** APM runs domain controllers in the identity subscription and continues to synchronise privileged accounts from AD DS to Entra, which the corpus itself records as NFR 1.9 not met.
- **ALZ expects PIM for all privileged access.** APM excluded PIM from this phase while making every MG role assignment time-bound - the worst of both: the expiry cost without the just-in-time benefit.
- **CAF recommends a single Log Analytics workspace unless sovereignty or RBAC forces separation.** APM separates operational and security (DD38), which is defensible for RFFR but doubles ingestion cost for anything needed in both.
- **ALZ's sandbox archetype is policy-isolated but usually still peered for shared services.** APM's sandbox has no peering at all, which is stricter and means sandbox workloads have no path to shared DNS or identity.

### 7.3 Palo Alto VM-Series in Azure design constraints

- **No PAN-OS HA in Azure.** Layer-2 mechanisms (floating IP, gratuitous ARP) are not available, so the vendor pattern is independent instances behind Azure Load Balancers - the "sandwich". Consequence: no session synchronisation, so stateful flows drop on instance failure and long-lived connections need application-level retry.
- **Interface count is bounded by VM size.** Standard_D8as_v5 supports 8 NICs, D16as_v5 supports 8; the firewall needs management plus at least three dataplane interfaces plus tunnel interfaces, so instance sizing constrains zone design.
- **Accelerated networking must be enabled per NIC** for line-rate throughput and is not on by default for every SKU.
- **IP forwarding must be enabled on every dataplane NIC**, which is why GEN06 (deny IP forwarding) needs an NVA exception.
- **Azure SNAT applies on top of firewall SNAT** for outbound flows using a public IP, giving the double-SNAT the corpus describes. Consequence: source IP visibility is lost twice, and SNAT port exhaustion becomes a capacity limit at scale.
- **Zone-based policy does not work as expected in Azure** because Azure's routing presents traffic on interfaces that do not map cleanly to security zones; the practical pattern is address-object-based rules, which is what the corpus's "address-object-not-zone constraint" refers to.
- **Panorama template stacks apply in order**, with the last matching value winning; a three-layer stack (Global, set-specific, regional) means a regional override silently beats a global intent.
- **Bootstrap via Azure storage** is the standard automated build path; the corpus's Terraform build implies bootstrap containers, whose contents include licensing and initial configuration.

### 7.4 Azure Policy effect behaviour

- **Effects ordered by evaluation:** `disabled`, `append`, `modify`, `deny`, `audit`, `auditIfNotExists`, `deployIfNotExists`, `denyAction`.
- **`deny` blocks the ARM request at submission.** `audit` records non-compliance and changes nothing. `deployIfNotExists` and `modify` need a managed identity with the right role, and if that identity lacks permission the remediation silently fails while the assignment still reports as compliant-by-remediation.
- **`enforcementMode: Default` means effects apply; `DoNotEnforce` makes deny behave as audit.** All 218 APM assignments are `Default`, so every deny is live.
- **Initiatives (policy sets) can carry parameter overrides per assignment**, so two assignments of the same initiative at Platform and Region can behave differently. The `.1`/`.2` pairs must be read as two distinct configurations, not duplicates.
- **Exemptions are scoped objects with an expiry**, and an expired exemption re-enables the deny without warning. The corpus's exemption path is a ServiceNow request, which does not by itself track expiry.
- **Preview policies (`[Preview]:` prefix) can change definition between versions**, altering effect or parameters without an APM change. The corpus records preview inclusion as deliberate for Zero Trust posture; the consequence is uncontrolled definition drift.

### 7.5 Private endpoint and private DNS mechanics

- **A private endpoint is a NIC in a subnet with a private IP**; name resolution is separate and does not follow automatically.
- **Resolution requires a privatelink DNS zone with the mandatory FQDN name** (for example `privatelink.blob.core.windows.net`). The zone name is fixed by Microsoft and cannot be renamed to fit a naming convention - which is exactly why the corpus keeps `[region]-pdz-[descriptor]-001` for inventory records only.
- **The zone must be linked to every VNet that resolves the name**, or centrally resolvable via a DNS Private Resolver forwarding ruleset. APM centralises zones in Connectivity, so spokes resolve through the resolver, not through local links.
- **A workload-created local private DNZ zone shadows the central one** and resolves correctly only inside that VNet, producing intermittent failures elsewhere. That is the failure APM007.x exists to prevent.
- **Private endpoints ignore NSGs by default**; network policies on the subnet must be explicitly enabled for NSG and UDR support on PE subnets.
- **Disabling public network access on a PaaS resource breaks any control-plane operation that uses the public endpoint**, including some portal features and deployment tasks.

### 7.6 APIM Premium v2 networking constraints

- **VNet injection in Premium v2 differs from classic Premium**: it uses a delegated subnet and outbound-only integration modes with different NSG requirements, and migration between v1 and v2 is not in-place.
- **Injected APIM requires a dedicated subnet** with specific service delegation, and the subnet cannot be shared.
- **The developer portal and management endpoint have their own DNS and certificate requirements** when injected.
- **Self-hosted gateways are the pattern for reaching on-premises backends** without exposing the injected instance.
- `[UNKNOWN]` whether APM's existing APIM estate is v1 or v2, or whether it is injected at all - the corpus contains no APIM as-built. An APIM as-built or a portal export would answer it. This is the R5 reconciliation gap.

### 7.7 AI Foundry create-time constraints

- **Agent injection subnets are delegated to `Microsoft.App/environments` and cannot be resized after creation**, so the /26 sizing is a permanent commitment.
- **`disableLocalAuth` must be set at creation on several dependent resources** to force managed-identity-only access; enabling it afterwards does not revoke keys already issued.
- **Customer-managed-key configuration is create-time for some Foundry dependencies**, so a design that adds CMK later needs a rebuild.
- **Content safety and token-limit policies are gateway-side, not model-side**; bypassing the gateway bypasses them entirely, which is why the guardrail chain order matters.
- **Private-endpoint-only Foundry requires private DNS zones for each dependent service** (storage, search, Cosmos, Key Vault, the Foundry account itself), each with its mandatory privatelink name.

### 7.8 python-pptx capabilities and limits

Covered operationally in Section 3b. Summary of the hard limits: no text measurement; no theme or layout creation; no arrowhead, dash-adjacent alpha, connector bend or z-order API; connectors have no text frame; `descr` not exposed in most versions; `normAutofit` written but `fontScale` not computed; group-shape support present but child-offset handling manual; image types exclude SVG. Everything else is reachable through `shape._element` and raw lxml.

### 7.9 OOXML shape and connector behaviour

- **`p:cxnSp` with `a:stCxn` / `a:endCxn`** binds an endpoint to a shape id and connection-site index; PowerPoint recomputes the route on open and on either endpoint moving.
- **Connection sites come from the preset geometry's `a:cxnLst`.** Rectangle-family presets have four (top, left, bottom, right, in that index order). Other presets vary and are not documented in python-pptx.
- **Deleting a shape does not delete its connectors.** PowerPoint leaves them with a dangling endpoint at the last known position, detectable as a `stCxn` or `endCxn` id that no longer resolves in the `spTree`.
- **Shapes render in `spTree` document order.** There is no z-index attribute.
- **`p:grpSp` carries its own child coordinate space** via `a:chOff` and `a:chExt`; resizing a group rescales children non-uniformly.
- **Font size is in hundredths of a point** (`sz="1200"` is 12pt). EMU per inch 914400, per point 12700.
- **Theme colours resolve through `a:schemeClr` with optional `a:lumMod` and `a:lumOff`** for tint and shade; those two elements are not exposed by the python-pptx API.

### 7.10 PowerPoint editability traps

- **The default snap grid is 0.083in** - one twelfth of an inch. Authoring on any other unit means every nudge moves a shape off the authored grid.
- **A theme swap restyles every `schemeClr` shape silently.** Semantic colour must therefore be `srgbClr`.
- **`TEXT_TO_FIT_SHAPE` autofit is renderer-computed.** A generator that sets it ships overflowing text that only corrects after a human edits the text box.
- **Selection Pane names are the only navigation aid** in a sixty-shape diagram. Generated defaults make it useless.
- **Google Slides drops connector attachment**, converting connectors to plain lines, and flattens `lumMod` and `lumOff` tints. **Keynote** additionally converts groups and substitutes fonts aggressively. Both are read paths only; export PDF for those audiences.
- **PowerPoint for Mac** is faithful but falls back on non-installed fonts, and dash patterns render slightly heavier.
- **Grouped shapes cannot be individually selected without entering the group**, and a mis-drag on a group moves everything inside it.

### 7.11 What to verify against current documentation

`[EXTERNAL]` My knowledge here may be out of date. Verify before relying on: PAN-OS version-specific Azure behaviour and current VM-Series SKU-to-NIC limits; APIM Premium v2 networking, which has changed materially since v1 and is still evolving; AI Foundry create-time immutability, which is the newest and least stable area of this list; Azure Policy definition versions for any `[Preview]:` assignment; python-pptx release notes for `add_group_shape`, `descr` exposure and the `add_picture` image-type list; current Azure subnet-delegation resource-provider names; and Azure Load Balancer HA-port behaviour for NVA scenarios.

---

## SECTION 8 - GAP AND CONFLICT HANDLING

Three behaviours: **REFUSE** (do not emit the design section; emit the flag and stop), **ASSUME** (proceed with a stated assumption plus an assumption-ledger row), **PLACEHOLDER** (emit the artefact with a flagged hole).

Flag wording is exact. The generator emits it verbatim.

| # | Gap or conflict | Corpus source | Behaviour | Exact flag wording |
|---|---|---|---|---|
| 1 | DR posture: dual-region deployed against believed-ratified single-region multi-zone | resilience-dr.md; ai-lz-reconciliation.md R10 | REFUSE for any DR, vault-redundancy or regional-pair claim. ASSUME only if the user states a posture in the request | `[UNRECONCILED - DR POSTURE] The deployed baseline builds Australia Southeast as regional pair (VNets, GRS with cross-region restore, two domain controllers) per architecture/resilience-dr.md. A single-region multi-zone decision paper is believed to supersede it and has never been ingested (references/ai-lz-reconciliation.md R10). This design cannot state a DR posture until APM confirms which holds. Consequence if resolved as single-region: every ause- named object, both AUSE hubs, the AUSE vault set and this design's regional diagram change.` |
| 2 | RBAC renewal process before the November 2026 expiry | identity-rbac.md; remediation-register.md A2 #20 | PLACEHOLDER, plus a mandatory assumption row | `[UNKNOWN - RBAC RENEWAL] Every management-group role assignment is PIM-eligible and time-bound, expiring November 2026. No corpus file owns the renewal process. Owner required: APM Infrastructure Team. This design's role assignments inherit the expiry. A renewal runbook or a PIM ratification decision would answer this.` |
| 3 | DD69 portal-managed policy against policy-as-code | governance.md; ai-lz-reconciliation.md R6 | REFUSE to emit policy-as-code artefacts. PLACEHOLDER for the deployment-method section | `[UNRECONCILED - POLICY OPERATING MODEL] DD69 ratifies management of all 218 policy assignments via the Azure Portal, not infrastructure as code (policies/governance.md). The AI landing zone design assumes everything as code with no portal changes (references/ai-lz-reconciliation.md R6). This design does not emit policy artefacts until the Solution Design Authority rules. Exemptions in either model route through a ServiceNow Cyber Security Request.` |
| 4 | Subscription count 14 against 15, and the missing security-subscription allocation | landing-zones.md; policy-baseline.md; ipam/address-plan.md | PLACEHOLDER wherever a count is stated | `[UNRECONCILED - SUBSCRIPTION COUNT] Three corpus files disagree: architecture/landing-zones.md describes 14 as-built subscriptions, policies/policy-baseline.md assigns ASC Default to all 15 and enumerates fifteen, and ipam/address-plan.md lists fourteen while omitting aus-sub-security entirely. This design states all three positions and does not select one. Detailed Design v1.1 Tables 24-27 would answer whether aus-sub-security is intentionally network-free.` |
| 5 | Security workspace retention 30 days against the 180-day requirement | platform-services.md; governance.md; remediation-register.md A2 #21 | ASSUME with a stated breach, never a silent compliance claim | `[NON-COMPLIANCE - LOG RETENTION] The security Log Analytics workspace retains 30 days at handover against a 180-day requirement (architecture/platform-services.md). Operational logs meet the requirement only via storage export. This design's logging cannot claim 180-day queryable retention. Owner: APM Cyber Security to confirm the adjustment date.` |
| 6 | Inbound North-South not enabled | firewall-nva.md; integration-services.md | REFUSE any design needing inbound access until a path is ratified | `[NOT ENABLED - INBOUND NORTH-SOUTH] Inbound north-south inspection is required but was not enabled at handover, pending an external Azure Load Balancer and route table (architecture/firewall-nva.md). The one designed inbound flow routes Internet to Application Gateway WAF_v2 to the North-South NVA to APIM and is unreconciled with that provision. This design cannot specify an inbound path until APM ratifies one.` |
| 7 | Boomi MCS ranges also reserved as hub growth space | ipam/address-plan.md | REFUSE any allocation from 10.40.2.0/24, 10.40.3.0/24, 10.50.2.0/24 | `[CONFLICT - ADDRESS RESERVATION] 10.40.2.0/24, 10.40.3.0/24 and 10.50.2.0/24 are claimed by the Boomi MCS design (v0.1, not ratified, not deployed) and simultaneously reserved as growth space for the hub VNets. No allocation may be made from these ranges until the address plan is updated. Owner: APM Infrastructure Team.` |
| 8 | Integration platform is design intent at v0.1 | integration-services.md | PLACEHOLDER on every slide and section that references it | `[DESIGN INTENT ONLY - v0.1] architecture/integration-services.md is design intent at version 0.1. Nothing in it is built. No claim in this design may depend on APIM, Boomi or the AI Gateway existing.` |
| 9 | AI landing zone assumes undeployed spokes | ai-lz-reconciliation.md R1 | ASSUME with dependency rows | `[PLANNED, NOT DEPLOYED] Five of eight target AI workload spokes are not deployed (references/ai-lz-reconciliation.md R1). This design treats each as a dependency with an owner and a date, not as existing infrastructure.` |
| 10 | No APIM as-built evidence | ai-lz-reconciliation.md R5 | REFUSE to state APIM configuration | `[UNKNOWN - APIM AS-BUILT] The corpus contains no as-built evidence for the existing APIM estate (references/ai-lz-reconciliation.md R5). This design cannot state APIM SKU, networking mode or version. An APIM as-built or a portal configuration export would answer it.` |
| 11 | AI LZ 180-day retention assumption refuted | ai-lz-reconciliation.md R23 | ASSUME the deployed values, flag the design assumption | `[ASSUMPTION REFUTED] The AI landing zone design assumes 180-day queryable retention. The deployed workspaces retain 90 days (operational) and 30 days (security). This design uses the deployed values.` |
| 12 | Nine unresolved naming items | standards/naming.md ingest flags | REFUSE to name the affected resource types | `[NAMING UNRESOLVED - <item>] standards/naming.md flags this pattern as unresolved (<detail>). This design does not invent a name for it. Owner: the naming standard's owner.` |
| 13 | Enhanced backup tier has no tag value | standards/tagging.md | REFUSE to specify an enhanced backup policy | `[TAG VALUE MISSING] Enhanced backup policies exist (…-vmsqlbackup-enhanced-001) but standards/tagging.md documents no Enhanced* value for the backup tag. This design cannot enrol a resource in an enhanced policy by tag. Owner: APM Digital Operations.` |
| 14 | Allowed and not-allowed resource type lists, and approved VM image list | policy-baseline.md | PLACEHOLDER; the design lists its resource types for manual check | `[UNKNOWN - POLICY PARAMETER] GEN02, GEN03 and GEN012 constrain resource types and VM images by parameter list. The corpus records the assignments but not the list contents. The resource types and images this design uses are listed below for manual verification against the live assignments.` |
| 15 | AUSE load-balancer count | remediation-register.md A5 #42 | PLACEHOLDER in any AUSE firewall diagram | `[UNCONFIRMED] The Australia Southeast load-balancer count of four mirrors Australia East and is unconfirmed for a two-firewall region (references/remediation-register.md A5 #42).` |
| 16 | Firewall device-name inconsistency | remediation-register.md A5 #38 | ASSUME the naming-standard form, flag the source | `[SOURCE INCONSISTENT] Firewall device names appear as both aefwppalo00x and aefwpalo00x in source. This design uses the naming-standard form aefwppalo00x (references/remediation-register.md A5 #38).` |
| 17 | Baseline is partner-delivered with known defects | SKILL.md; remediation-register.md | Every design section touching baseline state cites the register | `[BASELINE - PARTNER DELIVERED] This claim derives from the partner-delivered handover record, which carries 45 known defects and 16 CAF and ALZ deviations. Checked against references/remediation-register.md on <date>.` |
| 18 | Subnet plan source anomalies in the AUSE tables | ipam/address-plan.md | ASSUME as-built, flag the design document | `[SOURCE ANOMALY] The Australia Southeast subnet tables mislabel hub rows as auea-* against 10.50 CIDRs and duplicate hub and identity rows with conflicting entries. The as-built state governs.` |
| 19 | Privileged accounts synchronised from AD DS to Entra, NFR 1.9 not met | governance.md | PLACEHOLDER in any identity section | `[KNOWN NON-COMPLIANCE] Privileged accounts remain synchronised from AD DS to Entra; NFR 1.9 is not met and APM is investigating an alternative pathway (DD5). This design does not resolve it.` |
| 20 | PIM excluded, JIT only partially implemented | governance.md | ASSUME with the constraint stated | `[PARTIAL CONTROL] Just-in-time administration is partially implemented (MFA and RBAC only; PIM excluded this phase, DD10, NFR 1.1). This design cannot cite PIM as a control.` |

### 8.1 Gaps the corpus has not noticed

`[INFERENCE]` in each case; each needs an APM ruling.

| # | Gap | Why it matters | Suggested flag |
|---|---|---|---|
| G-01 | **`aus-sub-security` has no VNet or CIDR allocation** in either regional address table, while carrying BK01-BK04 backup assignments | Either intentionally network-free, or an omission in the plan. A design placing a security tool there has no subnet to use | `[UNKNOWN - SECURITY SUBSCRIPTION NETWORK] aus-sub-security appears in the management group and policy records but has no VNet or CIDR allocation in ipam/address-plan.md.` |
| G-02 | **No exemption expiry tracking.** Exemptions route through ServiceNow, but Azure Policy exemptions are objects with their own expiry | An expired exemption silently re-enables a deny, breaking a deployment that previously worked | `[PROCESS GAP - EXEMPTION EXPIRY] The exemption path is a ServiceNow request. No corpus file records how Azure Policy exemption expiry is tracked.` |
| G-03 | **Preview policy definition drift.** Preview policies are deliberately included; their definitions can change between versions without an APM change | A design compliant at authoring can be non-compliant after a Microsoft definition update | `[RISK - PREVIEW POLICY DRIFT] This design depends on assignment <id>, which is a preview policy. Definition changes are outside APM change control.` |
| G-04 | **No stated NVA capacity or throughput baseline.** SKUs are recorded but not the throughput they were sized for | A design adding significant east-west volume cannot know whether the E-W set has headroom, and SNAT port exhaustion is a real limit at scale | `[UNKNOWN - NVA CAPACITY] No throughput or session baseline is recorded for the firewall fleet. Capacity impact of this design cannot be assessed.` |
| G-05 | **No AUSE Panorama log path stated.** Panorama runs active AUEA and passive AUSE, and logs forward to Sentinel via a syslog VM | If the syslog path is AUEA-only, an AUSE-region failover loses firewall logging, which is an RFFR evidence gap | `[UNKNOWN - AUSE LOG PATH] The corpus records Panorama HA and Sentinel forwarding but not whether the syslog path survives a regional failover.` |
| G-06 | **Availability sets do not protect against zone failure.** The AUEA firewalls sit in two availability sets | If the ratified DR posture becomes single-region multi-zone, the firewall tier is the one component not zone-redundant, and it is the component every flow depends on | `[RISK - FIREWALL ZONE REDUNDANCY] The firewall fleet uses availability sets, which protect against rack and update-domain failure but not zone failure. Under a single-region multi-zone posture this is the critical path.` |
| G-07 | **Tag inheritance depends on a modify-effect policy with a managed identity.** If APM025's identity loses its role assignment, inheritance silently stops | New resources ship untagged, which silently disables backup and patch enrolment | `[RISK - TAG INHERITANCE DEPENDENCY] Tag inheritance is delivered by the APM025 modify-effect policy and depends on its managed identity retaining permission. Failure is silent.` |
| G-08 | **No corpus record of who owns the `.potx` or the APM presentation template** | Every generated pack depends on one | `[UNKNOWN - PRESENTATION TEMPLATE] No corpus file records an APM PowerPoint template. Native-shape output requires a .potx carrying the theme and layouts.` |

---

## SECTION 9 - PROPOSED SKILL FILE PLAN

Mirrors the `apm-eslz-reference` pattern: thin `SKILL.md` index, reference files loaded only when needed, scripts for mechanical work, YAML frontmatter carrying provenance on every file.

### 9.1 File tree

```
apm-eslz-design/
  SKILL.md
  design/
    document-blueprint.md
    slide-pack-blueprint.md
    audience-laddering.md
    decision-records.md
  diagrams/
    catalogue.md
    primitives.md
    layout-grammar.md
    tokens.md
    connection-sites.md
    worked-example-D03.yaml
  rules/
    naming.md
    tagging.md
    addressing.md
    policy-constraints.md
    placement.md
    document-conformance.md
  gaps/
    conflict-register.md
    flag-wording.md
  external/
    azure-constraints.md
    caf-alz-deviations.md
    palo-alto-azure.md
    pptx-mechanics.md
  templates/
    apm-design.potx
    model.schema.yaml
    views.schema.yaml
  scripts/
    build_pack.py
    build_diagram.py
    pptx_xml.py
    check_conformance.py
    check_diagram.py
    layout_merge.py
    roundtrip.py
    model_diff.py
```

### 9.2 File index

| Path | Purpose | One-line index description | Approx size | Filled by |
|---|---|---|---|---|
| `SKILL.md` | Router | Ground rules, sourcing tags, corpus dependency, workflow, file index | 2,000 words | 9.3, 9.4 |
| `design/document-blueprint.md` | DDD and TCD structure | Section-by-section blueprint, the four document types and when each applies, Platform Context ten rows, the nine network requirements | 2,400 words | S5 |
| `design/slide-pack-blueprint.md` | Pack spine | Per-slide specification, mandatory and conditional slides, engagement-type presets, slide grammar | 2,000 words | S4 |
| `design/audience-laddering.md` | Board, CIO, engineer | The transformation table, what must stay identical, the collapse map and the two consistency assertions | 900 words | S4 grammar + derived |
| `design/decision-records.md` | Decision and assumption formats | YAML formats, when a decision row is mandatory, link to the ratified DD register | 700 words | S5.4, S5.5 |
| `diagrams/catalogue.md` | Which diagram to build | 27 diagram rows with source, audience, complexity, dependencies | 1,200 words | S2 |
| `diagrams/primitives.md` | Concept to shape | The primitive library table with MSO_SHAPE, EMU sizing, fills, lines, text frames | 1,400 words | S3a |
| `diagrams/layout-grammar.md` | How a diagram is composed | Canvas, grid, density ceilings, connector rules, z-order, shape naming, legend, badges | 1,800 words | S3b |
| `diagrams/tokens.md` | Colour and type | Token tables with hex, contrast-checked pairings, XML `sz` values | 700 words | S3b |
| `diagrams/connection-sites.md` | Hand-validated lookup | Connection-site index per preset geometry, validated in PowerPoint, with the validation date | 300 words | S3b limitation 4 |
| `diagrams/worked-example-D03.yaml` | Reference implementation | The fully populated dual-region hub-spoke model | 400 lines | S3b |
| `rules/naming.md` | Naming assertions | N-01 to N-34 as regex, plus the ten unresolved items and their refuse behaviour | 1,600 words | S6.1 |
| `rules/tagging.md` | Tag assertions | T-01 to T-16 with enumerations and Azure limits | 800 words | S6.2 |
| `rules/addressing.md` | Address assertions | A-01 to A-17 including the sandbox overlap exception and the Boomi conflict | 900 words | S6.3 |
| `rules/policy-constraints.md` | Deny-effect register | P-01 to P-26: what blocks a deployment and what the design must state | 1,200 words | S6.4 |
| `rules/placement.md` | Placement assertions | PL-01 to PL-14 | 700 words | S6.5 |
| `rules/document-conformance.md` | Output assertions | C-01 to C-20 including the GUID and host-address bans | 700 words | S6.6 |
| `gaps/conflict-register.md` | Known gaps | 20 corpus gaps plus 8 newly identified, each with generator behaviour | 1,600 words | S8, S8.1 |
| `gaps/flag-wording.md` | Exact strings | Verbatim flag text, one per gap, for copy-paste into output | 900 words | S8 |
| `external/azure-constraints.md` | Service behaviour | Limits that bind these decisions: peering, UDR, subnets, policy evaluation, tag inheritance | 1,100 words | S7.1, S7.4, S7.5 |
| `external/caf-alz-deviations.md` | Where APM differs | Seven deviations and why each matters | 700 words | S7.2 |
| `external/palo-alto-azure.md` | NVA constraints | No PAN-OS HA, NIC limits, IP forwarding, double SNAT, zone-policy limitation, template stack order | 800 words | S7.3 |
| `external/pptx-mechanics.md` | Render path | python-pptx limits, OOXML behaviour, editability traps, cross-application degradation, the raw-XML helper list | 1,400 words | S7.8, S7.9, S7.10, S3b limits |
| `templates/apm-design.potx` | Theme and layouts | Seven layouts: Title, Section, Diagram-Full, Diagram-Half-Text, Table, Statement, Decisions | binary | Must be supplied by APM (G-08) |
| `templates/model.schema.yaml` | Model contract | Element, relationship, decision and assumption schemas with mandatory `state` and `source` fields | 200 lines | S5, S6.6 |
| `templates/views.schema.yaml` | View contract | View selection, audience level, collapse map | 80 lines | S4, laddering |

### 9.3 Scripts

| Script | What it does |
|---|---|
| `build_pack.py` | Reads `model.yaml` and `views.yaml`, resolves the engagement preset to a slide list, calls `build_diagram.py` per diagram, emits the `.pptx` from `apm-design.potx`. Refuses to run if `check_conformance.py` fails. |
| `build_diagram.py` | Takes one diagram model plus its layout overlay, emits native shapes and attached connectors onto a slide. Owns the emit order, the character-budget assertion and badge placement. |
| `pptx_xml.py` | The raw-lxml helper layer: arrowheads, connector bend `adj1`, line and fill alpha, z-order manipulation, `descr` alt text, table cell borders. Roughly 150 lines, first-class build code. |
| `check_conformance.py` | Runs the naming, tagging, addressing, policy, placement and document rule sets (N, T, A, P, PL, C) against a model and a document draft. Exit non-zero on any failure; prints rule id, the offending value and the remedy. |
| `check_diagram.py` | Grid snap, palette lock, font floor, badge completeness, connector binding, legend coverage, density, nesting depth, conflict banner presence, arrowhead clearance, native-shape-only, label drift. |
| `layout_merge.py` | Merges a saved layout overlay onto a regenerated model by element id: keeps hand positions, band-places new elements into the growth gutter and marks them `layout: auto`, retains removed positions in `retired:` for one generation, writes the merged overlay back. |
| `roundtrip.py` | Reads an edited `.pptx` back, maps shape names to model ids, extracts geometry into the layout overlay, and reports text mismatches as semantic drift for deliberate acceptance rather than silent import. |
| `model_diff.py` | Structured diff of two model versions: elements and relationships added, removed, renamed, state-changed; decisions reversed; assumptions resolved. Emits the version-history row and the "what changed" slide content. |

`[EXTERNAL]` `build_pack.py` and `build_diagram.py` require `python-pptx`; `roundtrip.py` requires it too. `check_conformance.py` and `model_diff.py` are dependency-free.

### 9.4 Proposed `SKILL.md` description field

```yaml
name: apm-eslz-design
description: >-
  Generates APM Azure architecture designs and their PowerPoint packs, with every
  diagram built from native PowerPoint shapes an architect can select, move and edit.
  Use for any APM Azure design work: a detailed design document (DDD), a technical
  configuration document (TCD), an architecture design pack, a workload landing
  design, an AI landing zone or integration design, a network or firewall change
  design, a policy or naming or tagging conformance check, or a diagram of the APM
  landing zone (management groups, subscriptions, hub-spoke topology, traffic
  inspection, routing, private DNS, RBAC scope, logging, backup and DR, policy
  scope, address plan). Also use when asked to check a proposed APM resource name,
  tag set, CIDR allocation or subscription placement against the APM standards, or
  to produce board, CIO and engineer renderings of one APM architecture. Depends on
  the apm-eslz-reference skill for all APM facts; every APM claim it emits is tagged
  to a corpus file, and it refuses to invent subscription names, CIDRs, policy IDs or
  deployment state.
```

`[INFERENCE]` Trigger reliability comes from naming the artefacts (DDD, TCD, design pack), the diagram subjects (management group, hub-spoke, traffic inspection, address plan), and the check verbs (check a name, check a CIDR, check placement) rather than describing the skill's method. The dependency sentence is load-bearing: it tells the model to load the reference corpus first, which is what makes the sourcing discipline enforceable.

### 9.5 Workflow to state in `SKILL.md`

1. **Load the corpus.** Read the `apm-eslz-reference` index and the two or three files the task touches. Never answer an APM-specific question without one.
2. **Check the remediation register** before treating any baseline claim as true.
3. **Check the conflict register** (`gaps/conflict-register.md`). If the task touches a listed gap, apply the stated behaviour and emit the exact flag.
4. **Build the model** against `templates/model.schema.yaml`. Every element carries `state` and `source`.
5. **Run `check_conformance.py`.** Fix or flag every failure before emitting anything.
6. **Emit the document**, then the pack via `build_pack.py`, then `check_diagram.py`.
7. **Persist the layout overlay** so hand-tuning survives the next regeneration.
8. **Record what changed** with `model_diff.py` into the version history.

