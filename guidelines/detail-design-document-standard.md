# Detail Design Document (tier 2) - authoring standard

Companion to `guidelines/technical-configuration-document-standard.md` (tier 3) and `guidelines/detailed-design-standard.md` (the single-tier DDD pipeline). Applies to any tier-2 Detail Design Document built on `templates/detailed-design-v2/authoring/detail-master.docx`.

**The bar:** an architect or cyber approver can say yes without asking for more information, and a build engineer can find every setting they need by following this document's cross-references into the Technical Configuration Document. Tier 2 argues and decides; tier 3 configures.

---

## 1. Extract the master's heading map BEFORE writing a line of content

This is the step that was missed and cost a full rewrite. The master's section list is **not** what a clean-numbering instinct would produce, and "used exactly as supplied" means reproducing its outline verbatim, including its own defects.

Extract it with a `run_script` that unzips `word/document.xml` and lists every paragraph whose `pStyle` matches `Heading`, then write your `H1`/`H2` lines to match that list character for character: same numbers, same wording, same capitalisation.

**The tier-2 master's verbatim outline** (confirmed from `uploads/02 Detail Design Document V0.1-2ae06a90.docx`):

| Level | Heading text, exactly |
|---|---|
| H1 | `1. Introduction` |
| H2 | `1.1 Purpose` · `1.2 Audience` |
| H1 | `2. Overview` |
| H2 | `2.1 Scope` · `2.2 Guiding Principles` · `2.3 Assumptions` |
| H1 | `3. Business Architecture` |
| H2 | `3.2 Business Reference architecture` · `3.3 Business Requirements` · `3.4 Gap treatment` |
| H1 | `4. Application Architecture` |
| H2 | `4.1 System Context Diagram` · `4.2 Solution/Product Component Inventory` · `4.3 Solution Interface Diagram` · `4.4 Solution/Product Interface catalogue` |
| H1 | `5. Technology Architecture` |
| H2 | `5.1 Technology Component Standards` · `5.2 Integration standards and patterns` · `5.3 Network & Infrastructure Standards & Patterns` · `5.4 Technology component Deployment Patterns` |
| H1 | `6. Information & Data Architecture` |
| H2 | `6.1 Information Model` · `6.2 Information Classification` · `6.3 Analytics and reporting Patterns` |
| H1 | `7. Cyber & Security Architecture` |
| H1 | `8. Service Availability and Disaster Recovery` |
| H2 | `8.1 Business Service Tiering` · `8.2 Service Availability` · `8.2 Disaster recovery & Resilience` |
| H1 | `9. Service Management` |
| H2 | `9.1 Service Management principles` · `9.2 Monitoring, Logging, Reporting and Alerting` |

**Four traps in that outline, all preserved deliberately:**

1. **Business Architecture starts at 3.2.** There is no 3.1 heading. Do not shift 3.2/3.3/3.4 down to 3.1/3.2/3.3.
2. **Section 8 has two 8.2s** - Service Availability and Disaster recovery & Resilience are both numbered 8.2 in APM's template. Do not renumber the second to 8.3.
3. **Section 7 has no subsections at all.** Cyber & Security Architecture is a single H1 covering identity, data and network policy, accessibility and controls, device protection, data sovereignty and encryption. Organise it with **bold lead-in paragraphs** (`P |**Identity and access control.** …`), never invented `H2 |7.1 …` headings.
4. **Casing is not title case.** `Business Reference architecture`, `Gap treatment`, `Interface catalogue`, `Integration standards and patterns`, `Technology component Deployment Patterns`, `Analytics and reporting Patterns`, `Disaster recovery & Resilience`, `Service Management principles`. Match them.

The tier-3 master has its own equivalent: its outline jumps from 2.4.2 to `4. Solution Design` (no section 3). Same rule.

**Permitted additions** (precedent, both accepted): `3.5 Decision Register`, extending the numbering of the section it belongs to, and `Appendix A: Terms & Abbreviations`. Anything else new needs a reason beyond tidiness.

---

## 2. Apply the N/A rule literally

A section that does not apply keeps its heading and **opens with the characters `N/A`**, then a dash and a one-line reason. Descriptive prose that means "nothing here" but never says `N/A` does not satisfy the rule and reads as an unanswered section.

Typical tier-2 N/A sections for an endpoint/SOE design: `4.3 Solution Interface Diagram` (the context diagram already carries the interfaces), `5.2 Integration standards and patterns` (no ETL/API/message pattern), `6.3 Analytics and reporting Patterns` (no new BI pattern), `3.4 Gap treatment` (no requirement gap). Sections with genuine content - business reference architecture, requirements, component inventory, network, cyber, availability, service management - are written out in full.

---

## 3. What lives at tier 2, and what is a cross-reference

| Tier 2 owns | Cross-reference to tier 3 |
|---|---|
| Decision Register with options assessed (the single home) | Console paths, tabs, field-by-field settings tables |
| Business requirements and their traceability | Scripts, XML, JSON, ADMX/registry values |
| Component and interface inventories | Build sequence and phase order |
| Architecturally significant values: address plan, VLAN, authentication method, licence model, timeout, purge layers, group model | Exhaustive allow-lists, FQDN sets, cipher suites, per-setting values, exclusion console paths |
| Risk register, SOE standard alignment (inherited / excluded / compensated / added), RFFR position | Test plan with pass criteria |
| Service tiering, availability targets, DR reasoning, monitoring model | Patch rings, deferrals, Delivery Optimization values |

Name the companion document in the cross-reference ("Technical Configuration Document, 12.6"), not a file path.

---

## 4. Cover fields and version history

For a **real** design (not the pipeline's validation examples), fill the cover fields with the real document's values:

- `Project Name:` the **solution** name as APM calls it - `ES Participant Kiosk Solution`, `Standard User SOE on Azure Virtual Desktop`. Not a tier-labelled name like "Participant Kiosk - Detail Design"; the tier is the document's own title. Confirm the solution's real name with the user rather than shortening it.
- `Program Name:` the **programme**, which is not necessarily the technology in this document. `Standard Operating Environment Program` covers all five SOE use cases. Do **not** write `AVD/Nerdio Implementation` on a document whose solution uses neither - the ES Participant Kiosk is a physical Dell device with no AVD and no Nerdio anywhere in it.
- `Document Owner:` `Shaun Struik` · `Contact Details:` `shaun.struik@apm.net.au`. Never invent an example or placeholder domain.
- `Program Name:` `Standard Operating Environment Program` · `Division/Unit:` `Digital Workplace` · `Product ID:` `N/A`.
- `Document Status:` `Draft - for review` at tier 2, `Draft - for build` at tier 3.
- The names carried in the blank masters (Samit Chandra on tiers 1-2, Michael Barker / Leah Brenton on tier 3) are **the templates' own sample content**, not values to preserve in a real document. The disclaimer, APM Contact and Photography blocks are preserved untouched.

**Version History is one row for an initial build**: `V1.0 | <date> | Shaun Struik | Initial issue`.

**Every row records a change to the DESIGN, never a change to the document's authoring.** The reader wants to know what is different about the solution, not what the author did to the file. "Palo Alto firewall removed from the participant device egress path" is a version row. "Editorial pass across all sections", "prose reduced to fact statements", "Figure 2 re-exported", "explanatory text removed from 1.1, 3.3, 4.2" and "cross-references converted to hyperlinks" are not - they are authoring activity and belong in chat. Where a revision changed only the writing, either fold it into the next substantive version or record the one design fact that did change. Authoring iterations are not versions.

---

## 5. Facts, not commentary

Same rule as every other document in this project, and tier 2 is where it is easiest to breach because decisions carry reasoning. Legitimate: the decision as made, the options actually assessed with a one-line rejection reason each, the stakeholder position, a settled rationale as fact. Not legitimate: the assistant's own voice arguing a recommendation, narrating how the document was assembled or revised, or describing the document's own genre.

**Two further rules apply to every design in this project and are not restated here** - see `guidelines/detailed-design-standard.md`:

- **2a. Write like a person, not like a machine.** No "it is important to note", no "leverage", no "robust", no rule-of-three flourishes, no paragraph that summarises itself. Active voice with a named actor.
- **2b. Cross-references name the section and link to it.** Write `[[5.3.4]]` in the DSL; the builder renders "5.3.4 Routing" as a live hyperlink to that heading. Never a bare number, never a hand-typed section name. `UNRESOLVED [[xref]]` in the build log is a failure, not a warning.

---

## 6. Build, check, register

1. `buildDocx` with `detail-master.docx`, the design's `content-detail.txt`, the shared `figs/` folder, and a `relPrefix`/`imgPrefix`/`idBase` unique to this document.
2. Read the build log: `UNRESOLVED [[xref]]` means a cross-reference points at a heading that does not exist. Fix it before shipping.
3. `consistency-check.js` `scan({dsl})` must return no findings. On a tier-2 document there is no expected-noise allowance: unlike tier 3 (which legitimately cross-references the companion design's sections), a clean tier-2 scan is achievable and was achieved.
4. `qa()` on the figures page if any figure changed.
5. Register in `designs/README.md`, one row per built document.

**Reservations already used** for `designs/participant-device/`: tier 2 `rH` / `ddFigPK` / `5500`, tier 3 `rG` / `tcdFig` / `5400`. Pick fresh values for another design.

---

## 7. Figures

Reuse the design's existing `figures.html` and `figs/` PNGs; tier 2 selects the architecture-level subset and **renumbers the captions sequentially for this document**. The Participant Kiosk tier-2 set is: solution context (Figure 1), network zones (Figure 2), session lifecycle (Figure 3), SOE inheritance (Figure 4), access control model (Figure 5). Process and build-level figures (provisioning flow, app delivery chain, wallpaper, Zscaler tenant overview) stay out of tier 2.
