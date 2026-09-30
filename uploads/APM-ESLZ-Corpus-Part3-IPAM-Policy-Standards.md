# APM ESLZ Reference Corpus — Part 3 of 4: IPAM Policy Standards

Verbatim extract from the `apm-eslz-reference` Claude skill. Part 3 contains 5 of 19 files. Classification: APM operates at RFFR PROTECTED.

Files in this part:

- `ipam/address-plan.md`
- `policies/policy-baseline.md`
- `policies/governance.md`
- `standards/naming.md`
- `standards/tagging.md`

---


# `ipam/address-plan.md`

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


# `policies/policy-baseline.md`

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


# `policies/governance.md`

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


# `standards/naming.md`

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


# `standards/tagging.md`

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


*End of Part 3 of 4.*
