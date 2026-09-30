# APM ESLZ Reference Corpus

Authoritative reference for **APM Azure facts**. Anything this project states about the Azure estate - subscriptions, VNets, CIDRs, firewalls, policies, tags, retention, RBAC - traces to a file here or is marked as not sourced.

| File | Covers |
|---|---|
| `Part1-Core-Architecture-As-Built.md` | Management groups, subscriptions, topology, firewall/NVA fleet, connectivity, identity and RBAC, platform services, resilience and DR |
| `Part2-Integration-and-AI-Design-Intent.md` | AI landing zone target state, guardrail stack, two-tier logging, integration services (APIM, Boomi, webhooks), AI LZ reconciliation |
| `Part3-IPAM-Policy-Standards.md` | Address plan, archetype sizing, policy baseline (218 assignments), tagging standard, naming |
| `Part4-Remediation-and-Corpus-Maintenance.md` | Remediation register (45 source defects, 16 CAF deviations), corpus maintenance rules |
| `FULL-CORPUS.md` | All four parts concatenated |

## Marker discipline - mandatory in every artefact

| Marker | Meaning |
|---|---|
| `[CORPUS: <file>]` | A named corpus file states this. The only marker that may carry an APM fact |
| `[EXTERNAL]` | General product, vendor or standards knowledge. Never carries an APM-specific value |
| `[UNKNOWN]` | No corpus source exists. Emit inline where the fact would have sat, and raise an assumptions row with a named owner |
| `[UNRECONCILED]` | Two sources disagree. Present both verbatim with citations, then state the consequence. Never pick, never average |
| `[PROPOSED]` | This design is inventing the identifier. Needs a decision-register row. Graduates to plain text only when the corpus is updated |

**Never external, never inferred:** any resource name, IP, CIDR, port, FQDN, count, SKU, version, date, owner, or statement of deployment state. If the corpus does not say it, the answer is `[UNKNOWN]`.

**Precedence when sources overlap:** as-built over design for deployed state; the remediation register over both where it explicitly supersedes; newer over older *only* when the newer document says it supersedes, otherwise `[UNRECONCILED]`; a count in a table over a count in prose, with the discrepancy still surfaced.

## The five consequential open items

1. **RBAC expiry cliff, November 2026** - every MG role assignment is PIM-eligible and time-bound, all expiring; renewal process `[UNKNOWN]`. The only item with a date on which platform administration stops working.
2. **DR posture `[UNRECONCILED]`** - dual-region deployed versus a believed-ratified single-region multi-zone paper never ingested.
3. **DD69 portal-managed policy versus policy-as-code** - the largest codification blocker.
4. **AI LZ assumed-state gaps** - 5 of 8 workload spokes not deployed, no APIM as-built evidence, 180-day retention assumption refuted by deployed 90/30-day workspaces.
5. **Security workspace retention 30 days versus the 180-day NFR 9.9** - standing non-compliance at RFFR PROTECTED.

## How this applies itself

`policies/environment-config.js` carries the corpus facts as the `ENV-ESLZ` entry with eleven advisory `interactions`. The compliance checker raises them automatically when a design touches the configuration they describe - spoke placement, CIDR allocation, RBAC scope, retention, DR posture, tagging, policy-as-code, inbound ingress. Advisory only, never scored.

## Maintenance

When a design ratifies something the corpus marks `[UNKNOWN]` or `[UNRECONCILED]`, update the corpus entry in the **same change** as the design, and graduate any `[PROPOSED]` markers. Triggers for a refresh: a new as-built, a ratified decision paper, a delivery wave completing.
