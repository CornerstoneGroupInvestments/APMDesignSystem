# APM ESLZ Reference Corpus — Part 2 of 4: Integration and AI Design Intent

Verbatim extract from the `apm-eslz-reference` Claude skill. Part 2 contains 3 of 19 files. Classification: APM operates at RFFR PROTECTED.

Files in this part:

- `architecture/integration-services.md`
- `architecture/ai-landing-zone.md`
- `references/ai-lz-reconciliation.md`

---


# `architecture/integration-services.md`

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


# `architecture/ai-landing-zone.md`

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


# `references/ai-lz-reconciliation.md`

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


*End of Part 2 of 4.*
