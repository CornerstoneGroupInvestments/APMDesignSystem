# Skill context: APM Detailed Design, Technical Configuration Document, and native PowerPoint pack

Everything needed to complete the skill, in one file.

## Canonical sources - one fact, one home

Three reference files cover this ground. Each owns a distinct part; none duplicates another. When a value changes, change it in its owning file only.

| File | Owns |
|---|---|
| `reference/design-capability-briefing.md` | **Craft.** The 37 numbered diagram rules (TD-01..37), the full token / primitive / component model with values, audience laddering, PowerPoint editability engineering, render-path analysis, the 16 failure modes with detection, and the client-agnostic worked demonstration |
| **This file** | **Operations.** Hard rules, folder convention, DDD and TCD structure, the DSL and authoring pipeline, the five gates, the APM environment facts, the rule engine, cascade warnings, required inputs |
| `reference/apm-eslz-design-skill-spec.md` | **APM ESLZ specifics.** Corpus absorption check, the 27-diagram catalogue, MSO_SHAPE primitive library with EMU sizing, the D03 worked example, the slide-pack spine, 113 conformance assertions, the gap and conflict register with exact flag wording, and the skill file plan |

Where this file states a token value or a failure mode, it is a **summary for convenience** and the briefing governs on any discrepancy.

Capability tags where a claim needs one: `[HELD]` reproducible exactly · `[PRACTICE]` craft, not a fixed spec · `[GENERATED]` invented per run · `[CANNOT]` out of reach.

---

## 1. What the skill produces

| Artefact | Format | Owner of truth | Gate |
|---|---|---|---|
| Detailed Design Document (DDD) | Word `.docx` from the APM master template | `content.txt` (the DSL) | Architecture review + security review |
| Technical Configuration Document (TCD) | Word `.docx`, same pipeline | `content.txt` | Becomes de-facto as-built on approval |
| Diagram set | `figures.html` on the diagram kit, exported to `figs/*.png` for Word | `figures.html` | `qa()` |
| PowerPoint pack | Native shapes, one per audience level | The same model | Editable by an architect mid-review |

One output format per design. Never maintain a parallel HTML copy of a Word document.

---

## 2. Hard rules - never violate

**Confidentiality.** Never name the delivery consultancy's own brand. Never name or reference the subcontracted build engineer, in any artefact, comment or output - his work appears only as a neutral APM role, and the subcontracting arrangement is never revealed. People are roles only; never introduce, infer or restore an individual's personal name. Re-anonymise any new input before saving it.

**Named parties. Everything is APM.** Never write "Twiki Corp", "Cornerstone Cyber", "the delivery consultancy", "the project team (Twiki Corp)", "contractor", "subcontractor", or any construction identifying a delivery party distinct from APM. Every artefact reads as APM's own work, produced by APM roles: **APM Solution Engineer** (the general build role - use **APM AVD Build Engineer** only on an AVD design, never on a physical-device design such as the Participant Kiosk), **APM Architecture Lead**, **Shaun Struik**, **Digital Operations**, **APM Cyber Security**, **APM Network Management**. Never a company name in parentheses after a role. The "Twiki Corp / the project team" wording in the `uploads/` export material is superseded historical input and is never carried into a new document. Ordinary suppliers MAY be named: CompNow (device prep), Stratus (managed network), SoftwareOne (licensing). Technology vendors MAY be named: Microsoft, Nerdio, Zscaler, Dell, Palo Alto, Cisco Meraki - they are architecture, not parties.

**Language.** Australian English. **Never use em dashes** anywhere, including cover fields and figure captions - use a spaced hyphen, a colon, a comma, or restructure. En dashes in numeric ranges are fine.

**The bar for every document.** A build engineer can construct the solution from it without asking a question, and an approver can say yes without asking for more information.

Three rules that follow from the bar:

1. **Show the settings, not the intent.** Actual values in tables: setting name as it appears in the product, value, rationale. Never "traffic is inspected on egress"; always `0.0.0.0/0 -> 10.100.0.68`, applied to which subnets, BGP propagation on or off.
2. **Diagram every structural idea.** Capability impact, system context, interface sequence, technology placement, network topology, deployment path, information flow, security zones. Always on the same diagram kit, so every document in the program looks like the same program.
3. **Logical order, front-loaded argument.** Business, application, technology, information, cyber, availability, service management. Anything a reviewer would challenge - BYOD access, standing privilege, an unmet requirement, an accepted risk - is argued openly and early, never left to be discovered.

---

## 3. Folder convention

Every design lives in `designs/<slug>/`, and nothing about a design lives at the project root.

```
designs/<slug>/
  content.txt                 the DSL source - canonical
  figures.html                the diagram set, on the kit
  figs/*.png                  named for their subject (credential-pipeline.png, never f1.png)
  output/*.docx               build artefacts, regenerable
  config/                     policy XML, scripts, CSV exports the design defines
  history/                    superseded or pre-standard versions
  research-notes.md           optional
  transposition-notes.md      optional, required when importing an authored Word draft
```

`designs/README.md` is the register: doc, version, status, approver, built document, built date - plus the folder convention, the rebuild recipe and the Word-import recipe. Update it in the same change as any version bump. `relPrefix` / `imgPrefix` / `idBase` must be unique per document.

---

## 4. DDD structure

Matches APM's own template spine (`reference/apm-document-templates/`), which carries an SDA (Solution Design Authority) approval block.

| # | Section | Carries |
|---|---|---|
| 1 | Introduction | Purpose, audience table (who is asked for what, and what to read first), scope, the decision being asked for |
| 2 | Solution Overview | The architecture in one page, the components, what is deliberately absent and why |
| 3 | Business Architecture | Requirements as user stories with acceptance criteria, bookmarks and URL sets, business process impact |
| 4 | Application Architecture | Applications, configuration profiles, packaging, per-setting tables |
| 5 | Technology Architecture | Hardware, image, image lifecycle, network (see §5 below), infrastructure |
| 6 | Information and Data | What data exists, where it lives, retention, purge, information flow |
| 7 | Cyber and Security | Compliance frame, identity and access, control alignment and inheritance, exclusions with compensating controls, web filtering, risk register |
| 8 | Service Availability and DR | Availability model, failure modes, recovery |
| 9 | Service Management | Principles, monitoring and alerting, patching, decommissioning, implementation sequence, validation and test plan |
| A+ | Appendices | Full configuration payloads (Assigned Access XML, PAC files, policy exports) |

**Cover fields:** Project Name, Program Name, Division/Unit, Document Status, Document Version, Document Owner, Contact Details, Product ID. Plus Consultation, References and Derivation, and the SDA Approval sheet.

**Decision register.** Every design carries one, numbered from 001. A row needs 2-3 alternatives actually considered, the rejection reason for each, and the selected option's rationale. Mandatory rows: any deviation from a standard, any policy exemption, any accepted risk, any network change (adding or removing a tunnel, moving an endpoint from private to public), any reliance on something not yet deployed.

**Assumption ledger.** Four columns: assumption, evidence or `[UNKNOWN]`, what breaks if false, owner to confirm. An assumption with no evidence and no owner is a finding, not an assumption. This section exists because a previous design assumed eight things about an estate and five were false.

---

## 5. Section 5.3 Network - the section that fails most often

It must carry all nine:

1. Naming convention
2. Address plan including reserved ranges
3. Subnet allocation with masks and NSGs
4. Routing with next-hop IPs
5. DNS resolver and private zones
6. Named egress FQDNs - never "standard internet access"
7. NSG rule baseline
8. Connectivity and resilience spec
9. A build-level diagram showing the CIDRs

---

## 6. The TCD

The build-level companion. On approval it serves as de-facto as-built information, so it is written to be audited, not read.

Carries: IP addressing · DNS records · load balancing · NAT and firewall rules · compute specifications · RBAC groups · accounts · Conditional Access rules · antivirus exclusions · DNS, NTP, logging, monitoring, patching, PKI and SMTP configuration · RPO and RTO · backup and restore · capacity planning.

A DDD's §5.3-style settings tables satisfy much of this, but APM review may ask for the TCD artefact itself. Plan one per use case as build detail lands.

---

## 7. Authoring pipeline

Do not rebuild by hand. `templates/detailed-design/authoring/`:

| File | Role |
|---|---|
| `apm-master.docx` | APM cover set, document control, disclaimer, Contents, real heading styles |
| `docx-builder.js` | Splices generated body into the master. `buildDocx(helpers, master, content, figsDir, out, opts)` |
| `content-example.txt` | Worked example content plus the DSL reference |
| `example-figures.html` | Nine example diagrams plus a Tweaks panel |
| `qa-checks.js` | The eight visual scans |
| `consistency-check.js` | The ten structural scans |
| `docx-to-dsl.js` | Converts an authored `.docx` to the DSL |
| `figs/*.png` | Example figure exports |

### The DSL

One directive per line, `TAG |content`, cells separated by `||`.

```
H1 |4. Application Architecture          heading levels H1..H5
P  |Body paragraph.                      **bold** supported
B  |Bullet item
NUM|Numbered item
BQ |Callout / reviewer note
GD |Guidance block
FIG|filename.png|Figure 9. Caption text|width|height
TBL|2400,3200,3760                       column widths, then rows
TH |**Header**||**Header**
TR |Cell||Cell<br>second line
END                                      closes a table
```

Traps already hit, all `[HELD]`:

- Doubled bullets come from `ListParagraph` - use the builder's own bullet handling.
- `pStyle` must self-close with a space: `<w:pStyle w:val="Heading1" />`.
- Cutting on the wrong "Introduction" deletes the TOC - the builder cuts on the Heading1-styled one.
- Missing `xmlns:wp` / `xmlns:r` breaks image relationships.
- One document per `run_script` call. Large figure sets exceed a 30-second budget when file I/O is slow; build in one call and do nothing else in it.
- Large copy-pasted code (a PAC file, a script) renders as one `P` line per source line. The builder's `<br>` splitting applies inside table cells only.
- Third-party supplied configuration goes in verbatim, in the same order, under a role-neutral attribution ("provided by the network delivery team").

### Editing content.txt safely

**Never edit prose with an unguarded `replaceText`.** It returns the input unchanged on a no-match and does not throw, so a silent miss ships a document that contradicts itself. `content.txt` mixes straight (`'`) and typographic (`’`) apostrophes and hand-typed quotes are the usual cause. Use a string-replace tool that fails loudly, or grep the exact bytes first. If a batch script must do it, assert each replacement changed the string and throw when it did not.

**When an `old_string` spans a boundary, the `new_string` must reproduce every line of it.** Appending a table row by matching `"END\nH1 |4. Application Architecture"` and replacing with `"...\nEND"` silently deletes that H1. The text leaves no trace of its removal, only a gap in the numbering.

**Inserting a figure mid-sequence renumbers everything after it, in both files.** A new Figure 5 makes the old 5-7 into 6-8: update every `FIG|` caption number and every prose "Figure n" cross-reference, then re-run the consistency check. `figures.html` needs no caption edits (captions live in `content.txt`), but re-check it if a figure ID or file order matters elsewhere.

**When resizing a figure, never `replaceText` on a `.dgm-stage` or `viewBox` string** - those are near-identical across figures and the edit lands on the wrong one. Slice the figure block by its `<!-- ===== Fn` marker and edit inside it.

---

## 8. The five gates - all clean, or it does not ship

Run in this order.

| # | Gate | Invocation | Catches |
|---|---|---|---|
| 1 | Structure | `consistency-check.js` → `scan({dsl, figuresHtml, figFiles, staleTerms})` must return `ok:true` | Ten checks (below) |
| 2 | Facts | Content conformance (EC-01..12, §14) | Invented identifiers, state drift, uncited claims |
| 3 | Policy | `compliance-check.js` → `checkCompliance(text, COMPLIANCE_RULES, {name, env: ENVIRONMENT_CONFIG})` | 48 rules + 26 advisory environment interactions |
| 4 | Visual | `qa-checks.js` → `qa()` must return `ok:true` | Eight scans (below) |
| 5 | Diagram grammar | Diagram conformance (ED-01..12, §14) | Grid, palette, badges, connector binding |

### `consistency-check.js` - ten structural scans

**TREE** (top-level sections run 1..n with no gaps; every heading has a parent - this is what catches an H1 accidentally consumed by an edit) · **XREF** (every "see 4.3.9" resolves to a real heading) · **FIGSEQ** / **FIGREF** / **FIGFILE** · **DUAL** (a policy classified as both inherited and excluded, unless an explicit cross-reference reconciles them) · **COUNT** (a stated count versus the rows of the table below it) · **FIGTXT** (section refs and retired terms inside figure captions and notes) · **STALE** (retired terms anywhere) · **ORPHAN** (an artefact named once - informational, not a failure).

Run it after every content edit, not just before shipping. It catches the defect class `qa()` cannot see: a statement that was true when written and went stale when another section changed.

### `qa()` - eight visual scans

Overlaps · WCAG AA contrast across the whole page · figure overflow · **box-level clipping** (`scrollHeight > clientHeight` on every `.dgm-box` / `.dgm-heat` / `.dgm-lbl` / `.dgm-note`, so a box that hides its own last line cannot pass) · literal escapes and em dashes · orphaned wire labels · legend coverage of every connector style · arrows occluded by boxes, including buried arrowheads.

Do not hand-write these checks.

### Re-render before re-exporting, every time

Exporting a figure PNG serves whatever is on disk at that instant. If an edit to `figures.html` landed after the last snapshot, the export is stale even though the source is fixed. Always sequence: **edit → render + read console (qa clean) → snapshot → export**. Never reuse an earlier snapshot after a further edit.

### A connector "not joining its shape" is a coordinate bug, not a style one

If a line's start or end sits a visible gap from the box it should touch, its `x1/y1` or `x2/y2` simply is not ON that box's edge. Find the box's actual left/right/top/bottom from its `style` attribute and set the coordinate to match exactly, or 2-4px past it, never mid-air. Trust the occlusion scan for the overlap case, but verify true near-miss gaps by sampling actual pixel colour at the expected coordinate in the exported PNG - eyeballing a downscaled preview is unreliable at this scale.

---

## 9. Diagram system

Full rationale in `reference/design-capability-briefing.md` §2 (rules TD-01..37) and §5 (tokens). The operational subset:

### Colour tokens

```
navy 1F2D58   navy-60 5A668C   navy-12 E7EAF2      structure
orange F89728  orange-16 FDEDD9                     accent - the subject, ONE per diagram
teal 1B7F79    teal-14 E2F0EF                       network plane
plum 6B3F7A    plum-14 EFE8F2                       identity plane
slate 44506B   slate-12 E9ECF2                      compute plane
amber B26B00   amber-14 FBF0DE                      planned / not enabled
crimson 8E1B2C crimson-12 FBE4E7                    conflict / denied / unreconciled
paper FFFFFF   rule C9D0E0    ink 16203D
```

**Text on a tint takes the darker value, never the full-strength plane colour.** `teal` on `teal-14` is 5.4:1 and `amber` on `amber-14` is 3.7:1 - both fail the 7:1 working floor at small sizes. Use `#12544F` on teal-14 and `#6B4200` on amber-14, or `navy` / `ink`. `orange` on white is 2.1:1: never a text colour, never a white-text background.

### Type tokens

`t-title` Poppins 28/600 · `t-sub` Mulish 15/400 · `t-container` Poppins 13/600 · `t-box` Mulish 12/600 · `t-box-sm` Mulish 11/600 · `t-meta` Mulish 10/400 · `t-wire` Mulish 10/600 · `t-legend` Mulish 11/400 · `t-source` Mulish 9/400. Floor 9pt, and only in the source band. Slide text never below 24px at 1920x1080; print never below 12pt.

### Geometry

`1u = 0.0833in = 76200 EMU` - one twelfth of an inch, which is **PowerPoint's own default snap grid**, so an editor's nudge lands exactly on your grid. Every coordinate an integer multiple of `u`. Gaps between peers take one of two values (tight `1u`, standard `2u`), never a third. Container padding: label band `3u`, sides `1.2u`, uniform and never optical. Routing channel between shape rows: `3u` minimum.

Density: **slide** 18 primary shapes maximum, 14pt floor. **Engineering** 42 maximum, 11pt floor, always paired with an A3 variant in the document appendix.

### Primitives

`P-zone` rect · `P-mg` roundRect .06 · `P-sub` rect · `P-vnet` roundRect .04 · `P-subnet` rect · `P-nva` hexagon .18 · `P-lb` flowChartDelay rot 90 · `P-gw` flowChartMagneticDrum · `P-svc` roundRect .10 · `P-store` can · `P-id` roundRect .10 · `P-ext` pill dashed · `P-step` chevron · `P-gate` diamond · `P-badge` pill · `P-chip` rect (connector label) · `P-note` rect · `P-flag` conflict banner.

Nesting: zone > vnet > subnet > resource. Four levels maximum at engineering density, three at slide density.

### Connector classes - two channels always

Colour alone fails in greyscale print and for roughly 8% of male reviewers.

| Semantic | Colour | Weight | Dash | Arrow |
|---|---|---|---|---|
| Peering / adjacency | navy | 1.5pt | solid | both ends |
| Routing, forced path, inspected | accent | 2pt | solid | single |
| Uninspected / bypass | navy-60 | 1.25pt | dash | single |
| Tunnel (IPsec, ExpressRoute, VPN) | teal | 1.75pt | sysDash | single |
| Data flow | slate | 1.5pt | solid, round cap | single, open |
| Trust / logical | plum | 1.25pt | dot | none |
| Private link / PE resolution | plum | 1.25pt | dash | single, open |
| Denied / not permitted | crimson | 1.75pt | dashDot | none + midpoint slash |
| Planned | class colour @50% | class weight | dash | class arrow |

Orthogonal only, two bends maximum. Arrow direction is **session initiation**, stated once in the legend. A denied path is **drawn, not omitted**, whenever the reader would otherwise assume it exists - spoke-to-spoke in a hub-spoke is the canonical case. Legend mandatory at two or more classes, forbidden at one, and it lists only what is drawn on this slide.

### State badges - the most important convention in the system

This is what stops an as-built diagram being read as a target-state diagram.

| Badge | Fill / text | For |
|---|---|---|
| (none) | | Deployed and confirmed |
| `PLANNED` | amber-14 / #6B4200 | Designed, not deployed |
| `NOT ENABLED` | amber-14 / #6B4200 | Provisioned but switched off |
| `UNRECONCILED` | crimson-12 / crimson | Two sources disagree |
| `UNKNOWN` | paper / navy-60, dashed | No source exists |
| `PROPOSED` | orange-16 / navy | This design invents it |

Top-right of the parent, overlapping the border by `0.6u`, height `3.1u`, 9pt caps, 0.4pt tracking.

### Slide furniture, in emit order

Title (`t-title`, states a finding not a topic) → subtitle (one line, the thesis; if it cannot be written the slide has no argument and gets cut) → diagram frame → legend (bottom-left, fixed across the set) → source band (`[CORPUS: …]`, `As-built <date>`) → conflict banner pinned at the top of the frame if any `UNRECONCILED` element is present.

---

## 10. Native PowerPoint generation

The highest-quality path for a dense topology that must stay natively editable: **author explicit geometry in a YAML model, generate with python-pptx into a client `.potx` that already carries the theme and the layouts.** Emit fixed `srgbClr` semantic fills, theme colours for chrome only, `roundRect` and `rect` containers with **no groups**, slash-path shape names, connectors created with correct initial geometry **and then** attached, arrowheads and bend adjustments as raw XML, `auto_size = NONE` with character-budget assertions, `descr` alt text on every shape.

### Editability rules

| Concern | Rule |
|---|---|
| Colour | Semantic colour is fixed `srgbClr` so a theme swap cannot destroy the coding. Chrome is theme colour so a rebrand works |
| Layouts | python-pptx cannot create a theme or a layout `[HELD]`. Ship a `.potx` with seven layouts: Title, Section, Diagram-Full, Diagram-Half-Text, Table, Statement, Decisions |
| Shape names | Path-like, slash-delimited, coarse to fine: `A/hub/inspect/nva-1`. Connectors prefixed `link/` so every line sits in one contiguous block of the Selection Pane. Never leave `Rectangle 47` |
| Grouping | **Zero `p:grpSp` for structural diagrams.** A group traps the editor (double-click to enter, mis-drag moves twelve shapes) and carries its own child coordinate space that rescales children non-uniformly. Use containment rectangles for visual grouping and name prefixes for logical grouping |
| Connectors | Always `begin_connect` / `end_connect` to a shape id and connection site index. `rect` and `roundRect` sites: 0 top, 1 left, 2 bottom, 3 right. Other presets differ - hand-validate a lookup table once and store it |
| Connector geometry | python-pptx writes the attachment but does **not** recompute the connector's `a:off` / `a:ext` `[HELD]`. Set the correct straight-line geometry yourself before attaching, or thumbnails render broken |
| Text | `word_wrap = True`, `auto_size = NONE`, `vertical_anchor = MIDDLE`. **Never `TEXT_TO_FIT_SHAPE`** - it writes `<a:normAutofit/>` but the `fontScale` is computed by the renderer, so text overflows until a human edits it |
| Label + meta | One text frame, two paragraphs, never two shapes. Two shapes means an editor retypes the label and orphans the CIDR |
| Z-order | No API. Emit in strict order: zones, containers, subnets, resources, connectors, chips, badges, furniture. Never append later |
| Alignment | Everything on the `1u` grid, so PowerPoint's own Align and Distribute restores true after a sloppy drag |
| Insertion | Band architecture with a growth gutter of one shape-width at each band's right edge, so a new element needs no reflow. Anchor legend, callouts and source band to frame corners |

### The character budget

Text cannot be measured without a rendering engine, so box capacity is estimated and then **asserted**:

```
capacity_chars ~= (box_width_in - 2 * margin_in) / (0.55 * font_size_pt / 72) * lines
```

A label exceeding capacity **fails the build** rather than shipping clipped. This converts an invisible rendering defect into a loud generation error, which is the only reliable handling available.

### What the generator cannot do, and the workaround

| Dependency | Workaround |
|---|---|
| Fit box to label | Character budget asserted at build time |
| `bentConnector3` bend position | Raw XML `<a:gd name="adj1" fmla="val 50000"/>` |
| Connector path after attach | Compute straight-line geometry from the two site coordinates before attaching |
| Connection sites on hexagon, delay, diamond | Hand-validated lookup table, range-asserted at build |
| Arrowheads | Raw XML `<a:headEnd type="none"/><a:tailEnd type="triangle" w="med" len="med"/>` |
| Line transparency for planned links | Raw XML `<a:alpha val="50000"/>` inside the `a:ln` fill |
| Denied-path slash marker | Separate small shape at the computed midpoint; flagged by the drift check if the connector reroutes |
| Connector labels | `Connector` has no text frame `[HELD]`. Separate chip textbox named `link/<id>/label`, with a drift check comparing its centre to the connector midpoint |
| Badge travelling with its parent | Positioned by rule; conformance check flags a badge more than `0.6u` from its parent's top-right |
| Theme and layout creation | Ship a `.potx`. Hard dependency |
| Alt text | `shape._element._nvXxPr.cNvPr.set('descr', f"{label}. {meta}")` |
| Font embedding | Not possible. Use theme fonts present on the client SOE, or accept documented fallback |
| Vendor icons | `[CANNOT]` - licensed binaries. Icon-free suits an architecture review; otherwise the client supplies EMF |
| Mirrored-region facts | Every mirrored element carries its own source citation; an element citing the other region's source fails the build |

Six of these resolve to python-pptx's `_element` escape hatch to raw lxml. Budget roughly 150 lines of XML helper and treat it as first-class build code.

### Cross-application degradation

**PowerPoint for Mac** faithful, font fallback differs. **PowerPoint on the web** connectors editable, Selection Pane renaming limited, autofit recompute unreliable. **Google Slides** converts connectors to plain lines and **drops attachment**, flattens tint `lumMod`/`lumOff`. **Keynote** drops connector attachment, converts groups, substitutes fonts aggressively. Treat Slides and Keynote as read paths; export PDF for them.

**One exclusion:** do not use an HTML-to-PPTX editable export for topology diagrams. It produces editable text and boxes but unattached lines, so the first drag breaks the diagram - the exact failure the approach exists to prevent. Use it for text slides and tables only.

### The honest ceiling

A very clean, very precise Visio-grade diagram: flat fills, crisp orthogonal lines, consistent geometry, real names, correct CIDRs. Engineers will trust it, which is the point. It will not look like a designed marketing render, and no shadow, gradient, isometry or 3D should be attempted - every one of those reduces credibility rather than raising it.

---

## 11. Audience laddering

One architecture, three renderings, derived from one model. Never three hand-built diagrams.

| Dimension | Board | CIO / architecture review | Engineer |
|---|---|---|---|
| Question | Are we exposed, what does it cost | Is the architecture sound | How do I build here safely |
| Tiers | 1 only | 1-2 | 1-3 |
| Containment | 2 levels | 3 | 4 |
| Primary shapes | 8 max | 18 max | 42 max |
| Body floor | 16pt | 14pt | 11pt |
| Names | Role words | Real names, no instance suffix | Full names with instance |
| Addressing | Absent | Supernet only | Every CIDR and next hop |
| SKUs / counts | Absent | Counts only | Full |
| Connector classes | 2 max | 4 max | All 9 |
| Legend | Only at 2+ classes | Always | Always |
| Citation | Closing slide | Every slide | Every slide and caption |

**Identical across all three, non-negotiable:** topology (the same boxes connect to the same boxes) · state (planned at engineer level is planned at board level) · arrow direction · denied paths · counts · vocabulary (same name-root everywhere).

Two machine checks: **AL-01** every board connector traces to at least one engineer connector through the collapse map, or it is invented. **AL-02** every engineer connector either appears at board level or is listed in a `suppressed:` block with a reason - silent omission is how a board diagram loses a risk.

---

## 12. One model, many outputs

The pattern is **single-source-of-truth documentation with a model plus layout overlay**. The reference implementation to study is **Structurizr with the C4 model**: one workspace, many views, and manual layout persisted per view keyed by element id, then re-merged after the model changes. That merge step is the entire trick.

Three files, three change rates:

- `model.yaml` - semantics. Elements (kind, name, meta, state, source), relationships (kind, from, to, state, source), decisions, assumptions. Owns truth.
- `views.yaml` - which subset, at which audience level, in which figure, with the collapse map.
- `layout/<view>.yaml` - geometry only, keyed by element id, hand-editable.

**In the model:** identity, name, kind, state, meta fact, relationship and direction, source citation, decisions, assumptions, counts, CIDRs, audience-visibility flags. **Presentation-only:** position, size, connection side, colour (derived from kind), font size (derived from detail level), legend row order, badge offset.

If a fact appears in prose **and** a diagram it lives in the model once and both renderers read it - which removes the count-contradiction and prose-diagram-divergence failure classes entirely.

**Layout is authored, not computed.** Automatic layout is wrong here for three reasons: it violates the semantics of position, it is unstable so one added node reshuffles everything and every diff is total, and the result never matches the reader's existing mental model of a hub and spoke.

**Merge algorithm on regeneration:** use every saved position unchanged; place unpositioned elements by the band rules into the growth gutter and mark them `layout: auto`; retain positions for removed elements in a `retired:` block for one generation so a rename round-trips; write the merged layout back so hand-tuning accumulates. Flag `auto` elements loudly in a build preview, and re-baseline a view deliberately when more than a third of its elements are auto-placed.

**Round-tripping.** Geometry round-trips: read shape position, size, attachment and z-order back via shape name, write into the layout overlay. Semantics do not - on import, compare every shape's text against the model-derived text and report mismatches for deliberate acceptance. Silent acceptance makes the deck the source of truth, which defeats the design. Requires stable shape names derived from model ids, never ordinals.

**Diffing, three levels.** Model diff (structured: elements and relationships added, removed, renamed, state-changed; decisions reversed; assumptions resolved) generates the version-history row and the "what changed" slide - and is the diff a reviewer actually wants. Diff view (one diagram of the union: added outlined teal with `+`, removed ghosted at 35% with `-`, changed outlined amber). Visual diff (render both to PNG and pixel-difference) is the only thing that catches an unintended layout change.

**Known failure modes of the pattern:** layout drift (valid model, visually wrong diagram) · model bloat (presentation detail creeping in) · the two-source relapse (someone edits the PPTX because it is faster) - countered by stamping the model version in the source band and comparing it at build · over-generalisation (a generic node-and-edge model produces generic-looking diagrams; this model knows what a VNet is, and that is a feature).

---

## 13. APM environment context

### Marker discipline - mandatory

| Marker | Meaning |
|---|---|
| `[CORPUS: <file>]` | A named APM source states this. The only marker that may carry an APM fact |
| `[EXTERNAL]` | General product, vendor or standards knowledge. Never carries an APM-specific value |
| `[UNKNOWN]` | No source exists. Emit inline where the fact would have sat, plus an assumptions row with a named owner |
| `[UNRECONCILED]` | Two sources disagree. Present both verbatim with citations, then state the consequence. Never pick, never average, never quietly prefer the newer document |
| `[PROPOSED]` | This design invents the identifier. Needs a decision row. Graduates to plain text only when the source is updated |

**Never external, never inferred:** any resource name, IP, CIDR, port, FQDN, count, SKU, version, date, owner, or statement of deployment state.

**Preferred sentence shape** when joining a fact to its explanation - fact first, explanation second, never the reverse:

> The firewall sets run independently behind Azure Load Balancers with no PAN-OS HA `[CORPUS: architecture/firewall-nva.md]`, because PAN-OS HA depends on layer-2 failover mechanics that Azure's SDN does not honour `[EXTERNAL]`.

**Precedence:** as-built over design for deployed state · the remediation register over both where it explicitly supersedes · newer over older **only** when the newer document says it supersedes · a count in a table over a count in prose, with the discrepancy still surfaced.

### Azure estate - `reference/eslz/`

Hub-spoke across Australia East `10.40.0.0/16` and Australia Southeast `10.50.0.0/16`, symmetric mirror. Management groups `AUS-MG-PLATFORM` (Connectivity, Identity, Security, Management) and `AUS-MG-{PROD|DEV|SIT|UAT}-{CONTROLLED|STANDARD}`, plus Sandbox and Acquisitions. Palo Alto VM-Series N-S and E-W sets per region behind Azure Load Balancers, default-deny both directions, Panorama-managed, HTTP egress via IPsec to Zscaler. Azure Policy denies public IPs outside the connectivity subscription.

**Archetype sizing:** Connectivity /23 · Identity /24 · Production /22 per security domain · Dev, SIT, UAT /23 each per domain · Sandbox /24 · Management at `x.255.0/24` · AVD /23. Every VNet carries a reserved adjacent block for contiguous growth. Unallocated in AUEA: `10.40.96-247`.

**Actually deployed:** hub, identity, management, prod-controlled, prod-standard only (40 subnets). Dev, SIT, UAT, AVD, sandbox, acquisitions and five of the eight AI workload spokes are **PLANNED**.

**Thirteen mandatory tags.** Criticality, application-id, business-service, apm-security-domain, environment, owner, technicalcontact, cost-centre, operationalteam, service-component-type, backup, enableupdate, update-stage. Two drive automation silently: **backup** enrols the VM into policies BK01-BK08, **update-stage** selects the Azure Update Manager ring. A VM missing either is unprotected and unpatched without erroring.

**Policy baseline.** 218 assignments (175 policies, 43 initiatives; 32 custom, 186 built-in), all in Default enforcement mode.

**Five consequential open items:** RBAC expiry cliff November 2026 (all MG role assignments PIM-eligible and time-bound, renewal process `[UNKNOWN]`) · DR posture `[UNRECONCILED]` (dual-region deployed versus a believed-ratified single-region multi-zone paper never ingested) · DD69 portal-managed policy versus policy-as-code · AI LZ assumed-state gaps · security workspace 30-day retention versus the 180-day NFR 9.9.

**Subscription count is itself `[UNRECONCILED]`:** the design says 13, the as-built table lists 15 rows including AVD, the policy baseline assigns to "all 15". Present all three; picking one silently is a conformance failure.

### Conditional Access - `policies/APM_CA_Policy_Analysis.html`

116 policies: 68 enforced, 43 report-only, 5 disabled. Three facts every design must respect:

1. **An Entra-joined, Intune-compliant device satisfies both enforced tenant-wide grants** - `AllUsers_AllAccess_DeviceRequired` (compliant OR Entra-joined) and `AllUsers_AllAccess_MFAorDeviceRequired` (MFA OR Entra-joined, so no MFA prompt at all). Blocking is therefore always explicit, never inherited.
2. **Phishing-resistant and tenant-wide MFA are report-only** (CA-401, CA-106, CA-101) and may never be cited as compensating controls.
3. **New CA objects follow the tenant's own convention** `CA-nnn - audience - apps - condition - action` (CA-1xx all users and guests, CA-2xx org users, CA-3xx contract populations, CA-4xx administrators, CA-5xx guests), **not** the Intune schema. Four numbers are already duplicated, so confirm a proposed number against the export.

The standard export has no exclusions or conditions column, so exclusion registers **cannot be verified** from it - request `identity/conditionalAccess/policies` from Graph.

### Estate endpoint behaviour

Corporate policies, apps and scripts assigned to All Devices or All Users land on every Entra-joined device unless the device group is excluded - the single largest configuration risk for a special-purpose fleet. Enumerate every corporate assignment and record per item: applies, excluded, or replaced by a fleet variant, in the design, not a wiki. The estate baseline sets a maximum password age that breaks device-local autologon accounts. Delivery Optimization has no group boundary on Entra-joined devices, so every device pulls its own update payload over the site link. Estate App Control has script enforcement **disabled**; a fleet variant may enable it.

### Policy corpus - `policies/`

Fifteen policy and standard documents held; four environment and as-built documents. `policies/README.md` is the index and lists what is still missing. Load-bearing facts:

- **Identity and IT Access Management Standard §5 (Clients Access Management)** is the policy basis for a client-facing device fleet - cite it as compliance, not as a deviation. Client systems must not connect to non-public APM IT systems, store no client-created information, and receive acceptable-use guidance.
- **Local administrator passwords, including LAPS-managed, are 30+ characters rotated every 30 days** (§4.2.2). Single-factor authentication needs 15+ characters (§4.1.2).
- **The IDPS Standard blocks all webmail at APM.** A client-asset carve-out under IAM §5 is the only defensible exception, and it must be argued explicitly with both standards cited together.
- **Open discrepancy:** the Compliance Plan states Essential Eight Maturity Level 3 under external obligations; program context says ML2. Confirm before citing a maturity level.

### Rule engine

`policies/compliance-rules.js` (48 machine-checkable rules with clause citations) and `policies/environment-config.js` (six environment entries, 26 advisory interactions). Run via `checkCompliance(text, COMPLIANCE_RULES, {name, env: ENVIRONMENT_CONFIG})`.

**When adding a rule, give `mustNotSay` rules a context `guard`.** Without one, "DES" matches the Disability Employment Services bookmark, `*.office.com` in a URL allow-list matches the wildcard-certificate ban, and "4-character site code" matches the 14-character password minimum. **Character-count rules need adjacency, not proximity** - the credential noun must sit directly either side of the number, with a negative guard for naming context. Test every new rule against a real document and check what it catches by accident: a checker that cries wolf gets ignored.

**Give every environment entry an `appliesWhen` scope gate** - `{min: n, any: [/re/, ...]}` requiring n distinct signals before any of its interactions evaluate. Without it an Azure platform register fires on an endpoint design that merely mentions "Sentinel". Signals must be *authoring* signals (`aus-sub-`, `auea-`, `virtual network`, `resource group`, a `10.4x.` address), never words that appear in ordinary prose (`subscription`, `policy assignment`, `spoke`).

### Cascade warnings

**A licence change cascades further than the licence table.** Dropping one SKU meant walking the CA policy inventory, the base and admin CA lists, the SOE-alignment narrative, an information-barrier control that needed a compliance SKU, and every runbook description naming the old licence pair. Grep the whole `content.txt` for the dropped term before declaring the change done.

**A network decision needs an options-assessed decision row**, not just a settings change: 2-3 alternatives actually considered, the rejection reason for each, and the selected rationale in one place. This is what an approver reads first and it prevents the same question being re-litigated.

---

## 14. Conformance rule sets

### Diagram conformance (ED)

| id | Fails when |
|---|---|
| ED-01 | A coordinate is not an integer multiple of `u` |
| ED-02 | A run is below 11pt outside the source band, or below 9pt anywhere |
| ED-03 | A fill or line colour is outside the token table |
| ED-04 | A shape whose source marks it planned, not-enabled, unreconciled or unknown carries no badge |
| ED-05 | A connector endpoint is not bound to a shape id and site index |
| ED-06 | A line class is drawn but absent from the legend (at two or more classes) |
| ED-07 | The source band has no citation |
| ED-08 | Slide density above 18 primary shapes, engineering above 42 |
| ED-09 | Container nesting deeper than four levels at slide density |
| ED-10 | An `UNRECONCILED` shape exists with no conflict banner |
| ED-11 | An arrowhead tip is inside the target shape's bounds |
| ED-12 | A diagram element is emitted as a picture rather than a shape |

### Content conformance (EC)

| id | Fails when |
|---|---|
| EC-01 | A stated fact about the estate carries no `[CORPUS: …]` or `[EXTERNAL]` marker |
| EC-02 | An identifier not present in the source register appears without `[PROPOSED]` |
| EC-03 | Any GUID-shaped string appears (subscription IDs are deliberately omitted) |
| EC-04 | A stated count contradicts the source, or silently picks one side of a known inconsistency |
| EC-05 | "is deployed" is applied to something the source marks planned |
| EC-06 | An ESLZ design is missing any Platform Context row |
| EC-07 | An assumption row has neither evidence nor a named owner |
| EC-08 | A design creates MG-scope role assignments without acknowledging the November 2026 expiry |
| EC-09 | "standard internet access" or equivalent appears instead of named FQDNs |
| EC-10 | A logging design claims NFR 9.9 compliance while targeting a 90- or 30-day workspace |
| EC-11 | Any em dash appears |
| EC-12 | Retired terminology appears in prose, figures or captions |

---

## 15. Failure modes, ranked by damage after surviving review

| id | Failure | Looks like | Detection |
|---|---|---|---|
| FM-01 | **Plausible invented identifiers** | A subnet, IP or policy name that does not exist, surrounded by correct detail. A naming convention makes the invention *more* plausible | Extract every token matching the naming grammar plus every CIDR and IP; set-difference against the source register; unmatched and unmarked fails |
| FM-02 | **State drift** | Present-tense prose about a spoke that does not exist. The board approves a state that is not real | Scan for present-tense verbs within a sentence window of any element whose state is not `deployed` |
| FM-03 | Stale cross-references | "see 4.3.9" pointing at a moved section; "Figure 5" showing something else | XREF, FIGSEQ, FIGREF, TREE |
| FM-04 | Count contradiction | "the six spokes" above a five-row table | COUNT - a numeral immediately preceding a table, compared to its length |
| FM-05 | Silent text clipping | A box hiding its own last line. Invisible in a thumbnail, obvious in the room | `scrollHeight > clientHeight` per box; character-budget assertion for PPTX |
| FM-06 | Near-miss connector | A line ending 3px short of its box | Any connector without `stCxn` and `endCxn` fails; sample the actual pixel at the endpoint, never eyeball a downscaled preview |
| FM-07 | **Symmetry hallucination** | Region B mirrored perfectly from A, including facts true only of A. A two-firewall region documented with four load balancers. Hard to spot because symmetry looks *more* correct | Compare source citations across mirrored elements; identical citation with region-specific values is a finding |
| FM-08 | Confident unknowns | An owner or retention period stated plainly with no source, because the sentence needed an object | Every fact-bearing claim must carry a citation marker |
| FM-09 | Diagram / prose divergence | §5.3 says egress via the firewall; the figure shows a direct path | Extract relationships implied by the prose and compare to the model's relationship set for the cited figures |
| FM-10 | Monochrome collapse | Three line classes indistinguishable grey in print | Convert to luminance; assert each class pair differs by dash pattern or 20% luminance |
| FM-11 | Legend drift | A style drawn but not legended | Legend coverage, both directions |
| FM-12 | Cross-document contamination | A value or paragraph from another design surviving a copy | Per-document stale-term list, scanned in prose, captions and figure text |
| FM-13 | Dual classification | A control listed as both inherited and excluded, both true when written | DUAL |
| FM-14 | **Narrative padding** | Three paragraphs of rationale where a settings table belongs. Survives review because it reads well, then the build engineer cannot proceed | A technology subsection over ~200 words with no table is flagged |
| FM-15 | Accessibility regression | Brand accent as a text background; missing alt text; creation-order reading order | Contrast per text-on-fill pair; `descr` present; tab order versus geometric order |
| FM-16 | Version-history fiction | A history row describing changes that were not made, written from intent | Generate the row from the model diff, never by hand |

---

## 16. Inputs that would most raise output quality

Ranked by gain, not effort.

1. **Two approved exemplar documents** - one DDD, one TCD, that passed review. Very large. Beats any amount of style guidance: encodes section order, depth expectations, house phrasing, and what the approver did *not* ask about.
2. **Review comments from a heavily marked-up draft.** Very large. The only input that reveals the failure modes specific to *these* reviewers, and it converts directly into conformance rules.
3. **The client `.potx`** with masters, layouts and theme intact. Large. python-pptx cannot create themes or layouts, so without it every deck is off-brand or hand-fixed.
4. **A brand token file with real values.** Large. A guidelines PDF without extractable values is nearly worthless; a 20-line token file is transformative.
5. **One real approved architecture diagram as native `.pptx`.** Large. Reverse-engineerable conventions, and it shows which house rules would look alien.
6. **The assessor's or approver's checklist.** Large. Converts directly into machine checks; the highest-value single page in the engagement if it exists.
7. **The authoritative source register** - resource inventory, naming register, IPAM export, policy list, full CA export. Large, and structurally the most important: it is the only thing that makes FM-01 impossible rather than merely detectable.
8. Font files, or an explicit substitution decision. Medium.
9. Two or three rejected documents with the reason. Medium - negative examples are unusually informative and rarely offered.

**Adds nothing:** mood boards, adjective lists, a brand PDF with no extractable values, competitor or vendor decks (they optimise for persuasion, not audit), more corpus text on covered topics, verbal descriptions of the review process.

---

## 17. Open items to carry into the skill

- **Confirm the Essential Eight maturity target** (ML2 versus ML3) before any design cites one.
- **Request the full Conditional Access export** (`identity/conditionalAccess/policies`) so exclusion registers become verifiable.
- **Obtain the four outstanding standards**: Information Asset Classification and Handling, Patch and Vulnerability Management, Information Security Code of Practice, Information Security Policy.
- **Resolve the five ESLZ open items** - each is a live architectural decision without an owner, not a documentation defect.
- **Decide the operating model** (portal-managed policy versus policy-as-code) before generating any policy artefact.
