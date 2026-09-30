# Prompt to paste into Claude Design

How to use this. Attach the four corpus parts (or the single full-corpus file) first. Then send everything below the line as your message.

---

## Context: what you have been given

You have been given the complete contents of `apm-eslz-reference`, a Claude skill that acts as the canonical knowledge pack for the APM Azure Enterprise-Scale Landing Zone. APM is Advanced Personnel Management, an Australian organisation operating at RFFR PROTECTED. The landing zone was built by delivery partner SoftwareOne under the "Stratus" program.

The corpus is 19 files, 26,208 words, ingested between 21 July and 2 August 2026. It is text-first by design. Every file carries YAML frontmatter recording its source document, source version and ingest date.

### What each file represents

| File | What it is |
|---|---|
| `SKILL.md` | The index. Ground rules, baseline provenance, corpus taxonomy, two workflows (reference and ingest) |
| `architecture/topology.md` | Dual-region hub-spoke, Palo Alto NVA placement, peering and inspection model, sandbox isolation, perimeter decisions |
| `architecture/landing-zones.md` | Management group hierarchy, 14 as-built subscriptions with IDs, subscription archetypes, resource group strategy, locks |
| `architecture/connectivity.md` | UDR forced tunnelling, central private DNS zones, private endpoint patterns, public IP stance, Network Watcher |
| `architecture/firewall-nva.md` | Palo Alto VM-Series as-built. Fleet, SKUs, PAN-OS version, dual North-South and East-West sets, Panorama HA, inspected flows, Terraform build |
| `architecture/identity-rbac.md` | Entra tenancy, hybrid identity, custom roles, security group scheme, PIM and break-glass posture, managed identities |
| `architecture/platform-services.md` | Log Analytics workspace separation, diagnostics, alerting, DCRs, three-ring patching, cost, storage, key vaults |
| `architecture/resilience-dr.md` | Regions and zones, DC redundancy, backup vault strategy, tag-driven backup tiers, DR tiers per service |
| `architecture/integration-services.md` | APIM, Boomi and AI Gateway platform. Design intent only, version 0.1, nothing built |
| `architecture/ai-landing-zone.md` | Enterprise-Scale AI Landing Zone, TCD v0.5. Authoritative over all earlier AI design detail |
| `ipam/address-plan.md` | 10.40 and 10.50 supernets, per-subscription allocations, full VNet and subnet tables, sizing rules |
| `policies/policy-baseline.md` | 218 deployed Azure Policy assignments with scope, type and stream |
| `policies/governance.md` | Compliance frame, policy operating model, the DD1 to DD81 design decision register, known gaps |
| `standards/naming.md` | Resource naming convention, token registry, abbreviation registry, per-resource formats |
| `standards/tagging.md` | 13 mandatory tags, enforcement policies, source discrepancies |
| `references/remediation-register.md` | 45 known defects in the partner-delivered baseline plus 16 CAF and ALZ deviations |
| `references/ai-lz-reconciliation.md` | Reconciliation of the AI landing zone design against the corpus. Items R1 to R25 |
| `references/curation-guide.md` | Rules for curating a new deliverable into the corpus |
| `scripts/ingest.py` | Extraction script for docx, pdf and xlsx sources |

### Authority hierarchy

Read this before you assert anything.

1. Files marked `baseline: partner-delivered` record the handover state **including its known defects**. Those defects are preserved deliberately, not corrected. Before treating any baseline claim as true, check it against `references/remediation-register.md`.
2. For AI landing zone content the precedence is: TCD v0.5, then DDD v2.4, then AI Gateway DDD v0.1. The TCD governs on conflict.
3. `architecture/integration-services.md` is design intent at version 0.1. Nothing in it is built.
4. `architecture/resilience-dr.md` carries a live currency conflict. It describes a dual-region posture. A single-region multi-zone decision paper is believed to supersede it and has never been ingested. Do not resolve this conflict by choosing a side. Surface it.
5. Where two corpus files disagree, say so explicitly and name both files.

### Classification

APM operates at RFFR PROTECTED. The corpus is sanitised to schemes, patterns and ratified decisions. It contains no rulebases, credentials or keys, but it does contain subscription GUIDs and internal addressing. Do not reproduce GUIDs or specific host addresses in any example, template or diagram you generate. Use placeholder tokens.

---

## Your task

Absorb the corpus. Then produce a specification pack that will be turned into a second Claude skill.

That second skill has one job: generate accurate APM architecture designs, each accompanied by an editable PowerPoint pack in which every diagram is built from **native PowerPoint shapes**. Not images. Not embedded objects. Real autoshapes, connectors and text frames that an APM architect can select, move and edit in PowerPoint.

The skill will be built the same way `apm-eslz-reference` is built: a thin `SKILL.md` index, reference files loaded only when needed, scripts for mechanical work, YAML frontmatter carrying provenance on every file. Progressive disclosure. Your output must be structured so it maps onto that pattern.

Scope is APM only. Do not generalise the output into a client-agnostic framework.

---

## Sourcing rules, non-negotiable

Every factual statement you make must carry one of three tags.

- `[CORPUS: <filename>]` for anything drawn from the supplied files. Name the file.
- `[EXTERNAL]` for Microsoft documentation, Azure service behaviour, CAF or ALZ guidance, PowerPoint or OOXML mechanics, or anything else from your own knowledge.
- `[INFERENCE]` for anything you have reasoned to that neither source states outright.

An untagged APM-specific claim is a defect. If you do not know something, write `[UNKNOWN]` and state what document would answer it. Do not fill gaps with plausible detail. On a PROTECTED client engagement an invented subnet or a fabricated policy ID is worse than a blank.

Where the corpus contradicts itself, do not pick a winner. Record both positions, name the files, and specify what the generator should do at runtime.

---

## What to produce

Nine sections, in this order, using these exact headings. Machine-consumable formats where specified. Do not write essays.

### SECTION 1 — ABSORPTION CHECK

Prove you have read it. Give me:

- The 14 subscriptions and their management group placement, with the three placement anomalies the corpus flags
- The firewall fleet by region, including the resilience model and why it is not standard PAN-OS HA
- The full inspected-flow list
- The address supernet scheme and the sizing rule per subscription archetype
- The 13 mandatory tags and the two that drive automation
- The count and scope split of policy assignments
- The five most consequential open items across the whole corpus, ranked, with your reasoning

Flat lists. No commentary.

### SECTION 2 — DIAGRAM CATALOGUE

Every diagram an APM ESLZ design pack should contain. For each, a row with:

`id | title | what it shows | corpus source file(s) | audience (board, CIO, architect, engineer) | complexity (S/M/L) | depends on diagram id`

Cover at minimum: management group hierarchy, subscription topology, dual-region hub-spoke, hub subnet layout, traffic inspection flows (east-west, north-south, backhaul, Zscaler egress), firewall interface and zone model, Panorama structure, routing and UDR model, private DNS and private endpoint model, identity and RBAC scope model, logging and monitoring data flow, backup and DR topology, policy scope model, address plan visualisation, AI landing zone target state, integration platform target state.

Add any I have not listed that the corpus justifies.

### SECTION 3 — NATIVE PPTX DIAGRAM SPECIFICATION

The core deliverable. Two parts.

**3a. Shape primitive library.** A table mapping every APM architecture concept to its PowerPoint construction:

`concept | MSO_SHAPE enum | default size (EMU) | fill token | line token | corner radius | text frame settings | icon treatment`

Cover: region, availability zone, management group, subscription, VNet, subnet, hub, spoke, firewall, load balancer, private endpoint, private DNS zone, route table, NSG, VM, PaaS service, gateway, internet boundary, on-premises boundary, SaaS boundary (Zscaler, Boomi), peering link, inspected flow, uninspected flow, denied flow.

**3b. Layout grammar and one worked example.** Give me:

- Canvas: 16:9, 13.333in by 7.5in, stated in EMU
- Grid system, gutters, safe margins
- Colour token table (token name, hex, where used, contrast-checked pairing)
- Type token table (token, font, size, weight, colour)
- Connector rules: which connector type for which relationship, routing, arrowheads, labelling, crossing behaviour
- Z-order and grouping rules, and the naming convention for shape names so an architect can find things in the selection pane
- Legend construction

Then one fully populated worked example: the dual-region hub-spoke topology, expressed as YAML, every shape with absolute position, size, style token, text and group membership, every connector with endpoints and routing. Complete enough that a python-pptx generator produces the slide with no further decisions.

Flag every place where python-pptx cannot do what the layout needs and state the workaround.

### SECTION 4 — SLIDE PACK BLUEPRINT

The standard APM design pack. Per slide:

`slide no | layout type | title | body content spec | diagram id (if any) | source corpus file(s) | speaker note purpose`

Give the pack a defined spine: context, current state, target state, decisions, risks and gaps, roadmap. State which slides are mandatory and which are conditional on engagement type.

### SECTION 5 — DESIGN DOCUMENT BLUEPRINT

The written design that accompanies the pack. Section by section, with: heading, purpose, corpus source, required tables, required diagrams, and the decision-record format. Match the structure APM's own deliverables use, as evidenced in the corpus (Detailed Design, DDD, TCD, As-Built). State the differences between those four document types and when each applies.

### SECTION 6 — CONFORMANCE RULE SET

Machine-checkable rules the skill must apply before it emits any design. Express each as a testable assertion.

- Naming rules derived from `standards/naming.md`, including the dual grammar (hyphenated and concatenated shortform), the security domain token in its three encodings, and every unresolved item the standard flags
- Tagging rules from `standards/tagging.md`, all 13 tags, including which are inherited
- Address allocation rules from `ipam/address-plan.md`, including the sandbox overlap exception
- Policy constraints from `policies/policy-baseline.md` that would cause a deployment to be denied
- Placement rules: what belongs in which subscription and management group

Format as regex or predicate where possible. Note where a rule cannot be automated and needs a human ruling.

### SECTION 7 — EXTERNAL KNOWLEDGE LAYER

Everything you know that the corpus assumes but never states, and that an architect would need to produce a correct design. Tag all of it `[EXTERNAL]`.

Include: Azure service limits and constraints that bind these decisions, CAF and ALZ reference positions the corpus deviates from and why the deviation matters, Palo Alto VM-Series in Azure design constraints, Azure Policy effect behaviour, private endpoint and private DNS mechanics, APIM Premium v2 networking constraints, AI Foundry create-time constraints, python-pptx capabilities and limits, OOXML shape and connector behaviour, PowerPoint editability traps.

State plainly where your knowledge may be out of date and what should be verified against current Microsoft documentation.

### SECTION 8 — GAP AND CONFLICT HANDLING

The corpus lists its own gaps. For each, specify what the generator does when a design touches it: refuse, proceed with a stated assumption, or emit a placeholder with a flag. Give the exact wording of the flag.

Add any gap the corpus has not noticed that you have.

### SECTION 9 — PROPOSED SKILL FILE PLAN

The file tree for the new skill, mirroring the `apm-eslz-reference` pattern. For each file: path, purpose, one-line index description, approximate size, and which of your sections above fills it. Include the scripts needed and what each does. Propose the `SKILL.md` description field text, written so the skill triggers reliably.

---

## Output format

- Plain markdown. No canvas, no artifact, no rendered preview. I need to copy the text.
- Use the exact section headings above.
- Fence all YAML, JSON and code.
- If the response will not fit in one message, split it and label each part `PART n OF m`, breaking only at section boundaries. Tell me at the end of each part what comes next.
- No preamble. No closing summary. Start at SECTION 1.

## Do not

- Do not reproduce subscription GUIDs, tenant IDs or specific host IP addresses anywhere in your output.
- Do not invent APM facts. `[UNKNOWN]` is the correct answer when you do not know.
- Do not resolve the corpus's internal conflicts on your own authority.
- Do not soften the defects. The remediation register exists because the baseline has real problems, and the generated designs must inherit that honesty.
- Do not produce a client-agnostic framework. This is APM only.
