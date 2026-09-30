# 3-tier design pipeline (Design Definition / Detail Design / Technical Configuration)

**Read the tier's authoring standard before writing content. Both carry the verbatim heading map, the depth bar and the traps that produce a wrong-looking document from correct-looking source.**

- Tier 2: `guidelines/detail-design-document-standard.md` - the master's verbatim outline (including its own numbering defects), the N/A rule, the tier-2/tier-3 content boundary, cover fields, figure subset.
- Tier 3: `guidelines/technical-configuration-document-standard.md` - build-sequence phase order, breadcrumb-plus-table pattern, script and pasteable-value rules, the gap audit, DSL/build traps.

**Rule zero for both: extract the master's heading list from its `word/document.xml` and match every `H1`/`H2` character for character - number, wording and capitalisation - before writing any content.** The masters' outlines contain defects that are preserved deliberately: the tier-1 master's Technology Context carries **two 3.5s** (Program/Portfolio Dependencies and Product/Project Methodology); the tier-2 master's Business Architecture starts at **3.2** with no 3.1, its section 8 carries **two 8.2s**, and its Cyber & Security Architecture (7) has **no subsections at all** (organise it with bold lead-in paragraphs, never invented `H2 |7.1`); the tier-3 master has **no section 3**. Do not renumber to "fix" any of them.

**Tier-1 verbatim outline** (`definition-master.docx`): `1. Introduction` (1.1 Purpose · 1.2 Document Scope · 1.3 Document Audience) · `2. Business Context` (2.1 Business Goals · 2.2 Business Operational Considerations · 2.3 Project Scope) · `3. Technology Context` (3.1 Technology Recommendation · 3.2 Technology Strategic alignment · 3.3 Key Architecture Principles · 3.4 Conceptual View · 3.5 Program/Portfolio Dependencies · 3.5 Product/Project Methodology · 3.6 Assumptions, Gaps, Risks and Constraints) · `Appendix - Definition`. Tier 1 states no configuration values, policy names or object names at all: components by role, standards alignment (including where alignment is not possible and why), principles, one conceptual figure, dependencies, methodology, and the assumptions/gaps/risks/constraints table.

Second design-document pipeline, used only for **new** designs going forward. The original single-DDD pipeline (`templates/detailed-design/`) is unchanged and stays the pipeline of record for existing designs (Kiosk, YubiKey, etc.) - see `designs/README.md`.

## The three tiers

| Tier | Master | Content file | Depth |
|---|---|---|---|
| 1 - Design Definition | `definition-master.docx` | `content-definition-*.txt` | Conceptual target state - what components, how they interact. No configuration detail. |
| 2 - Detail Design Document | `detail-master.docx` | `content-detail-*.txt` | Logical + physical architecture, decisions, requirements traceability. Configuration values only where architecturally significant. |
| 3 - Technical Configuration Document | `technical-master.docx` | `content-technical-*.txt` | Every build setting: RBAC, accounts, network, Intune policy JSON/settings, capacity. |

Masters are the **uploaded APM-native templates, used exactly as supplied** - same cover field set (Project Name, Document Owner, Contact Details, Program Name, Division/Unit, Document Status, Document Version, Product ID), same disclaimer, Photography and APM Contact blocks. Do not edit the masters' cover/disclaimer text.

**Cover field values for a real design** (the names baked into the blank masters - Samit Chandra on tiers 1-2, Michael Barker/Leah Brenton on tier 3 - are the templates' own sample content, not values to carry into a real document): `Project Name:` the solution name as APM calls it (`ES Participant Kiosk Solution`, never tier-labelled), `Document Owner:` `Shaun Struik`, `Contact Details:` `shaun.struik@apm.net.au` (never an invented example domain), `Program Name:` `Standard Operating Environment Program` - the programme, not the technology in the document, so never `AVD/Nerdio Implementation` on a design that uses neither - `Division/Unit:` `Digital Workplace`, `Product ID:` `N/A`, `Document Status:` `Draft - for review` (tier 2) or `Draft - for build` (tier 3). Version History is **one row** for an initial build, and every later row records a change to the design, never to the document's authoring.

## Worked example: Kiosk-style Intune policy change

The three `*-example.txt` files and their built `output-*-example.docx` outputs demonstrate the pattern from the brief: an SOE that applies Policy 1, 2 and 3 unchanged, exempts Policy 4 (USB redirect) per a functional requirement, and introduces a new Policy 5 with its own settings, detailed fully in tier 3 section 5 and section 11 (RBAC groups for the exclusion/assignment). These are validation content only. **The Participant Kiosk is now migrated onto this pipeline at all three tiers** - `designs/participant-device/content-definition.txt`, `content-detail.txt` and `content-technical.txt`, derived from the approved Detailed Design Document V1.4. Use those as the worked reference for a real design rather than the examples.

## DSL, builder, QA - all reused unchanged

`docx-builder.js`, `qa-checks.js` and `consistency-check.js` are **copies of the tier-1 pipeline's own scripts, unmodified** - the DSL (`H1/H2/H3 | P | B | NUM | GD | BQ | FIG | TBL/TH/TR/END`), the splice logic (cuts on the body's `Heading1` "...Introduction" paragraph, same in all three masters), and the QA checks are all generic over heading/table/figure structure, not tied to the original DDD's section names. See `guidelines/detailed-design-standard.md` for the full DSL reference - it applies to all three tiers.

**Known quirk, not a defect:** the Technical Configuration Document's own TOC jumps from section "2.4.2" straight to "4. Solution Design" - there is no section 3 in APM's native template. `consistency-check.js` will report a TREE finding for this; it is the master's own numbering, preserved because these templates are used in exact form. Do not renumber to "fix" it.

## Conventions decided for this pipeline

- **N/A rule.** Any section that doesn't apply to a given design keeps its heading and states `N/A` (optionally with a one-line reason) rather than being deleted. See `content-technical-example.txt` sections 6-9, 12-15 for the pattern - most infrastructure sections are N/A for a policy-only change; only the Solution Design, Cyber & Security, and Service Management sections are detailed.
- **Decision Register stays in tier 2 only.** The Detail Design Document (tier 2) is the single home for the options-considered Decision Register convention, same as the existing DDD standard. Tier 3 does not duplicate decisions - it carries a **Configuration Register** instead (the RBAC/policy-settings tables in section 11 onward), which implements tier-2 decisions and cross-references them by ID rather than re-arguing them. One fact, one home.
- **Folder convention** for a real design on this pipeline: `designs/<slug>/` with `content-definition.txt`, `content-detail.txt`, `content-technical.txt` side by side, one `figs/` folder shared across all three (same diagram kit, `tokens/diagrams.css`), and `output/` holding the three built `.docx` files. Register it in `designs/README.md` alongside the existing single-DDD designs, noting which pipeline it uses.
- **Figures** use the same diagram kit and the same `qa-checks.js`/`consistency-check.js` gate as the existing pipeline - run `qa()` before snapshotting and `scan()` before shipping, tier by tier. A tier reuses the design's existing `figs/` PNGs and **renumbers captions sequentially for that document**, selecting only the figures at its own altitude.
- **`relPrefix`/`imgPrefix`/`idBase` already used by a real design:** `designs/participant-device/` tier 1 `rI`/`defFigPK`/`5600`, tier 2 `rH`/`ddFigPK`/`5500`, tier 3 `rG`/`tcdFig`/`5400`; `designs/standard-user-avd/` tier 2 `rJ`/`ddFigSU`/`5700`. Pick fresh values per document.

## Build steps for a real design

1. Create `designs/<slug>/` with the three content files, written to the section list of the relevant master's Contents (see the extracted structure in this folder's history, or read the master `.docx` files directly).
2. Build figures in a shared `figures.html` on the diagram kit; snapshot to `figs/`.
3. Call `buildDocx` from `docx-builder.js` three times (one per tier), each with the matching master, its own content file, the shared `figs/` folder, a distinct output path, and a distinct `relPrefix`/`imgPrefix`/`idBase` (already reserved in this folder: `rD/defFig/5100+` for tier 1, `rE/detFig/5200+` for tier 2, `rF/techFig/5300+` for tier 3 - pick fresh ones per real design).
4. Run `consistency-check.js` `scan()` against each content file and `qa-checks.js` `qa()` against the figures page before shipping.
5. Register the design in `designs/README.md`.
