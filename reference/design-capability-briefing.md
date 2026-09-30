# Design System capability briefing

Practitioner briefing on what this design system holds, and what it would compose fresh, for producing Detailed Design Documents, Technical Configuration Documents and natively-editable PowerPoint diagram packs in a regulated Australian environment.

Capability tags used throughout:

- `[HELD]` a documented system, token set, rule or asset reproducible exactly
- `[PRACTICE]` craft knowledge carried, but not a fixed spec
- `[GENERATED]` invented on request rather than retrieved
- `[CANNOT]` outside reach, with the reason

---

## Canonical sources - one fact, one home

This file **owns craft**: the numbered diagram rules, the token and primitive model with values, audience laddering, editability engineering, render-path analysis and the failure modes. Two companions own the rest and must not restate these values:

- `reference/ddd-tcd-pptx-skill-context.md` owns **operations**: the authoring pipeline, the five gates, the APM environment facts and the rule engine.
- `reference/apm-eslz-design-skill-spec.md` owns **APM ESLZ specifics**: the corpus absorption check, the diagram catalogue, the MSO_SHAPE primitive library, conformance assertions and the gap register.

On any discrepancy about a token value, a diagram rule or a failure mode, this file governs.

---

## SECTION 1 — INVENTORY

Split into two registers, because they behave differently. **Project-resident** material can be opened and reproduced byte-for-byte. **General** material is carried as craft and would be composed or approximated.

### 1.1 Project-resident (this design system)

| Asset | Covers | Format | Verbatim? | Tag |
|---|---|---|---|---|
| `styles.css` | Brand tokens, base type, surfaces, control styling | CSS custom properties | Yes | `[HELD]` |
| `tokens/diagrams.css` | The `.dgm-*` diagram kit: box, heat, label, note, stage, caption classes with fixed geometry and colour | CSS | Yes | `[HELD]` |
| `guidelines/detailed-design-standard.md` | Document structure, the nine §5.3 network requirements, diagram obligations, the bar for approval | Markdown | Yes | `[HELD]` |
| `templates/detailed-design/authoring/` | `apm-master.docx` (real Word styles, cover set, TOC), `docx-builder.js`, the content DSL, `qa-checks.js`, `consistency-check.js` | DOCX + JS | Yes | `[HELD]` |
| `policies/compliance-rules.js` | 48 machine-checkable control rules with clause citations | JS | Yes | `[HELD]` |
| `policies/environment-config.js` | Environment register, 12 advisory interaction triggers | JS | Yes | `[HELD]` |
| Brand palette | APM orange `#F89728`, navy `#1F2D58`, plus the derived tint ladder | Tokens | Yes | `[HELD]` |
| Typeface pairing | Poppins (display) / Mulish (body), both recorded as substitutes for the real brand faces | Names only, no font binaries | Names yes, files no | `[HELD]` / `[CANNOT]` on the binaries |

### 1.2 General design material

| Domain | What is held | Tag | Note |
|---|---|---|---|
| **Colour systems** | WCAG 2.2 contrast maths (4.5:1 normal, 3:1 large at 18.66px / 14pt bold, 3:1 non-text), APCA in outline, perceptual reasoning in OKLCH, tint/shade ladder construction | `[HELD]` for thresholds and maths; `[PRACTICE]` for building a ladder | Ratios are computed exactly. No canonical palette is held for anything but this project |
| Named third-party palettes (Material 3, Carbon, Fluent, Tailwind) | Structure and approximate values | `[PRACTICE]` | No verbatim current hex values. Treat any output as a reconstruction, not the spec |
| **Type scales** | Ratio construction (1.125 / 1.2 / 1.25 / 1.333), optical sizing, measure limits (45-75ch body, 30-40ch in a diagram box), minimum sizes for print and slide | `[PRACTICE]` | No canonical scale held. A composed scale will be internally consistent, not "the" scale |
| **Spacing / grid** | 4pt and 8pt systems, 12/24-column layouts, EMU arithmetic (914400 EMU/in), baseline grids | `[PRACTICE]` | The 1/12in diagram grid is `[GENERATED]` per project, then held once written down |
| **Elevation / depth** | Shadow ladders, layering logic | `[PRACTICE]` | Largely irrelevant here: shadows are a liability in a printed technical diagram (TD-27) |
| **Component patterns** | This project's DS components | `[HELD]` | Generic UI component libraries: `[GENERATED]` |
| **Iconography** | Official Azure / AWS / GCP / Microsoft icon sets as assets | `[CANNOT]` | Licensed binaries, cannot be reproduced or embedded. Supply the SVG/EMF set, or diagrams go icon-free (usually fine for architecture review, TD-24) |
| Lucide icon names | Most names, not a guaranteed-complete current list | `[PRACTICE]` | Already flagged as a substitute in this project |
| **Charts / dataviz** | Encoding-choice rules, axis and zero-baseline discipline, categorical vs sequential vs diverging scales, direct labelling over legends, small multiples | `[PRACTICE]` | Not a spec, and not the problem set here |
| **Accessibility** | WCAG 2.2 success-criterion numbers and thresholds, colour-independence (SC 1.4.1), text-in-image rules, PDF/UA and PowerPoint alt-text mechanics, reading order | `[HELD]` for criteria and thresholds; `[PRACTICE]` for remediation | |
| **Light / dark handling** | Semantic-token indirection, elevation-by-surface rather than shadow in dark, contrast inversion traps | `[PRACTICE]` | Near-irrelevant for print-first documents. A dark-mode deck for a regulated review is a mistake |
| **Diagram craft for architecture** | Section 2 | `[PRACTICE]`, written down here as rules | Held as judgement, not as a published spec |

**The line that decides the skill build:** hard-code from `[HELD]` - the WCAG thresholds, this project's tokens, the docx pipeline, the check scripts. Define in the skill file anything tagged `[PRACTICE]` or `[GENERATED]` - the type scale, the grid unit, the diagram token set, the primitive library. Left to generation time, those produce a competent set that differs slightly every run, and diagrams from two sessions will not sit next to each other cleanly.

---

## SECTION 2 — TECHNICAL DIAGRAM CRAFT

All `[PRACTICE]` unless marked. Stated as numbered rules so they are enforceable.

### Hierarchy

- **TD-01** Three tiers, no more. Tier 1 = the containers that establish the mental model (region, zone, management group). Tier 2 = the subject of the diagram. Tier 3 = everything supporting. Anything a reader cannot assign to a tier is decoration; delete it.
- **TD-02** The eye lands on container structure first, subject second, flows third. Enforce with weight, not colour: containers get the heaviest border (1.5pt) and a tinted fill; the subject gets the only saturated accent on the canvas; flows are 1.25-2pt lines over a white field.
- **TD-03** One accent colour per diagram, used only on the subject. A topology diagram accents the inspection path. An identity diagram accents the trust boundary. Two accents means two diagrams.
- **TD-04** Reading order is left-to-right for flow, top-to-bottom for hierarchy. Never both in one diagram. A diagram that flows diagonally has no order at all.
- **TD-05** Position encodes meaning. Two boxes side by side will be read as peers. Never place an unrelated pair on the same row to fill space.

### Density and splitting

- **TD-06** Slide density: 18 primary shapes maximum (containers and subjects; subnet chips inside a VNet count as one third each). Engineering density: 42. Above 42, the diagram is a table pretending to be a picture.
- **TD-07** Split by **plane**, not by half. The wrong split is "left half of the topology / right half". The right splits, in order of preference: by layer (structure, routing, inspection, logging), by lifecycle (deployed, planned), by region (only when regions are genuinely symmetric), by flow (one flow per diagram, with an overview showing all flows unlabelled).
- **TD-08** When splitting, the first diagram in the set is the **index diagram**: the whole system at Tier 1 only, with each subsequent diagram's scope drawn as a labelled outline on it. Without it a reader cannot reassemble the set.
- **TD-09** A diagram requiring more than seven distinct symbol meanings has failed. Count the legend rows; seven is the ceiling.

### Containment and nesting

- **TD-10** Four levels of containment maximum at engineering density, three at slide density. Region > VNet > subnet > resource is four and is the practical limit in cloud work.
- **TD-11** Container padding is uniform and never optical: label band 0.25in, then 0.1in on all sides. Nested containers inherit the same padding. Inconsistent padding is the fastest way a diagram reads as amateur.
- **TD-12** A container with one child is not a container. Show the sibling that justifies it, or collapse it into a single box with the parent name in the meta line.
- **TD-13** Containers never overlap. If two logical groupings genuinely intersect (a subnet in two zones), that is a matrix, not a nested diagram: draw it as a table, or use a dashed overlay outline with an explicit "spans" label.

### Routing and lanes

- **TD-14** Orthogonal only. No curves, no diagonals. Diagonal lines in a cloud topology read as informal and make crossings ambiguous.
- **TD-15** A connector turns at most twice. Three bends means the layout is wrong; move a shape.
- **TD-16** Crossings are minimised by band ordering, never by jumps or hops. Line-hop notation belongs to circuit diagrams and confuses cloud audiences.
- **TD-17** Reserve a routing channel: at least 0.25in of clear space between any two shape rows, so connectors have somewhere to run. Diagrams fail on rebuild because there is no channel and every new line goes through a box.
- **TD-18** Swimlanes only when the lane is an actor or a stage with a real boundary (on-premises / hub / spoke / internet). A lane per product is a table.
- **TD-19** Zone boxes are for trust and blast-radius boundaries. Do not use a zone box merely to group things that look alike: that is what proximity is for.

### Connector semantics

- **TD-20** Every line class is distinguished on **two** channels: colour and dash pattern. Colour alone fails in greyscale print and for roughly 8% of male reviewers. This is the rule most often broken and the one that gets caught in the room.

| Semantic | Colour | Weight | Dash | Arrow |
|---|---|---|---|---|
| Peering / bidirectional adjacency | navy | 1.5pt | solid | both ends |
| Routing / forced path (inspected) | accent | 2pt | solid | single |
| Uninspected / bypass | navy-60 | 1.25pt | dash | single |
| Tunnel (IPsec / ER / VPN) | teal | 1.75pt | sysDash | single |
| Data flow | slate | 1.5pt | solid, round cap | single, open |
| Trust / logical relationship | plum | 1.25pt | dot | none |
| Private link / PE resolution | plum | 1.25pt | dash | single, open |
| Denied / not permitted | crimson | 1.75pt | dashDot | none, plus a circle-slash midpoint marker |
| Planned | class colour at 50% alpha | class weight | dash | class arrow |

- **TD-21** A denied path must be **drawn**, not omitted, whenever the reader would otherwise assume it exists. Spoke-to-spoke direct traffic in a hub-spoke is the canonical case: undrawn, half the room assumes it works.
- **TD-22** Arrow direction is the direction of session initiation, not the direction of data. State that in the legend once, and never mix conventions in a set.

### Labels

- **TD-23** Every shape carries a label line and an optional meta line, in one text body, never as two shapes. Label = the name a reader would type into a console. Meta = the one fact that makes it identifiable (CIDR, SKU, count).
- **TD-24** No icon without a text label. Vendor icons are recognition aids, not identifiers: an engineer needs the resource name. A diagram with icons and no names is a marketing diagram.
- **TD-25** Connector labels sit on an opaque chip at the midpoint of the longest straight run, never at a corner, never overlapping a shape. If two connectors need labels within 0.3in of each other, one of them should be a legend entry instead.
- **TD-26** Never rotate text. Rotated lane labels are the one common exception, and then only at 90 degrees counter-clockwise, and only on a lane header band 0.4in or wider.

### Colour and print

- **TD-27** Colour carries load in exactly three places: container tint (which plane), connector class (which semantic), state badge (deployed / planned / conflict). Nothing else is coloured. No gradients, no shadows, no glow: all three cost credibility with engineers and all three degrade in print and in Google Slides conversion.
- **TD-28** Test every diagram in greyscale before shipping. Convert fills to their luminance and check that container tiers remain distinguishable and every line class is still readable by dash pattern alone. Two-line check, catches real defects.
- **TD-29** Contrast: shape label text at 7:1 or better against its own fill (not the canvas), connector labels 7:1 against the chip. 4.5:1 is the legal floor, but diagrams are read at distance and at print resolution, so 7:1 is the working floor. `[HELD]` - ratios are computed exactly.
- **TD-30** Brand accent colours frequently fail as text backgrounds. Mid-orange at roughly 2:1 against white is unusable for white text and must take dark text. Check before adopting, not after.

### Legend

- **TD-31** A legend is mandatory when 2 or more line classes or 2 or more state badges appear. It is forbidden when the diagram has one line class: a legend explaining a single arrow makes the diagram look padded.
- **TD-32** The legend lists only what is drawn on **this** slide. A shared legend across a set is a defect: readers check the legend against the picture and lose trust when an entry has no referent.
- **TD-33** Legend position is fixed across the whole set, bottom-left by convention. Moving it per slide costs the reader a search each time.

### Credibility

- **TD-34** What makes an engineer trust a diagram, in order: real resource names, correct CIDRs, next-hop addresses on routing arrows, state honesty (planned marked as planned), consistent geometry. What makes them distrust it: rounded-everything, icons without names, a literal cloud shape labelled "Internet", drop shadows, gradients, 3D perspective, and any line that does not quite touch its box.
- **TD-35** The near-miss connector is the highest-frequency credibility defect. An endpoint 3px off a box edge is invisible at thumbnail scale and glaring at 100%. Detect it geometrically by sampling the endpoint coordinate against the target's bounds, never by eye on a downscaled preview.
- **TD-36** Precision signals: alignment to a grid, identical spacing between peers, identical box widths within a tier, one shape family per concept. Inconsistent box widths within a row is the most common tell that a diagram was assembled by hand under time pressure.
- **TD-37** Show the thing that is unusual. Every estate has one or two facts that surprise a newcomer: an inter-region link carrying management traffic only, an inspection set that does not cover a flow. Diagram those explicitly with a callout. A diagram showing only the expected pattern teaches nothing and gets skimmed.

---

## SECTION 3 — AUDIENCE LADDERING

One architecture, three renderings. The transformation is mechanical, not editorial: define it once and it is repeatable and checkable.

### 3.1 The transformation table

| Dimension | Board | CIO / architecture review | Engineer |
|---|---|---|---|
| Question answered | Are we exposed, and what will it cost | Is the architecture sound and consistent | How do I build in it without breaking something |
| Tier depth (TD-01) | Tier 1 only | Tiers 1-2 | Tiers 1-3 |
| Containment depth | 2 levels (region, plane) | 3 levels (region, VNet, subnet) | 4 levels (adds resource) |
| Primary shapes | 8 maximum | 18 maximum | 42 maximum |
| Body type floor | 16pt | 14pt | 11pt |
| Resource names | Role words only: "inspection", "production" | Real names, no instance suffix: `auea-vnet-hub` | Full names with instance: `auea-vnet-hub-001` |
| Addressing | Absent | Supernet only: `10.40.0.0/16` | Every CIDR, every next hop |
| SKUs, versions, counts | Absent | Counts only ("2 firewalls per region") | Full: SKU, version, instance count |
| Connector classes | 2 maximum (adjacency, egress) | 4 maximum | All 9 |
| Denied paths (TD-21) | Shown | Shown | Shown, with the enforcing control named |
| State badges | Shown, always | Shown, always | Shown, always |
| Legend | Only if 2 classes | Always | Always |
| Source citation | On the pack's closing slide | On every slide | On every slide and every figure caption |
| Open items | Ranked list with owner and date | Full register | Full register with technical dependency |

### 3.2 What must be identical across all three

Non-negotiable, and the basis of the consistency check in 3.3:

1. **Topology.** The same boxes connect to the same boxes. A board diagram may collapse four spokes into one "workloads" box, but it may never show a link that does not exist at engineer level, nor omit one that changes the risk picture.
2. **State.** If a thing is planned at engineer level it is planned at board level. This is the most commonly violated rule and the most damaging: the board approves a state that does not exist.
3. **Direction.** Arrow direction never flips between renderings.
4. **Denied paths.** A path drawn as denied at any level is drawn as denied at every level.
5. **Counts.** A count stated at board level must match the count derivable from the engineer diagram.
6. **Vocabulary.** The same object has the same name-root everywhere. `hub` at board, `auea-vnet-hub` at CIO, `auea-vnet-hub-001` at engineer. Never `hub` in one and `core network` in another.

### 3.3 Proving consistency

Abstraction is a **derivation from one model**, never three hand-built diagrams. Each rendering declares a `detail: board | cio | engineer` level and a collapse map:

```yaml
collapse:
  board:
    workloads-a: [spoke-a1, spoke-a2]      # 2 shapes render as 1
    inspection-a: [ilb-a, nva-a1, nva-a2]
  cio:
    inspection-a: [nva-a1, nva-a2]         # ILB stays, firewalls merge
```

A connector whose endpoint is collapsed re-points to the collapsing shape; duplicate connectors after collapse merge into one and carry a `×n` meta. Two rules then become machine-checkable:

- **AL-01** Every connector in the board rendering must trace to at least one connector in the engineer rendering through the collapse map. A board connector with no engineer counterpart is invented.
- **AL-02** Every engineer connector must either appear in the board rendering or be explicitly listed in a `suppressed:` block with a reason. Silent omission is how a board diagram loses a risk.

### 3.4 What changes in the prose, not just the picture

| Element | Board | CIO | Engineer |
|---|---|---|---|
| Slide title | The consequence: "Half the estate is designed but not built" | The finding: "Six of eleven spokes are not deployed" | The fact: "Deployed subnets by spoke" |
| Subtitle | The decision being asked for | The thesis | The scope of the table below |
| Numbers | Rounded, with a comparison | Exact, with source | Exact, with source and query |
| Risk | Named in business terms with a date | Named as an architectural consequence | Named as a technical dependency |

---

## SECTION 4 — EDITABILITY ENGINEERING

The part that decides whether the pack survives review. Everything here is `[PRACTICE]` grounded in OOXML behaviour, except where a specific API fact is marked `[HELD]`.

### 4.1 Theme colours versus fixed fills

- `[HELD]` A fixed fill is `<a:solidFill><a:srgbClr val="1F2D58"/></a:solidFill>`. A theme fill is `<a:solidFill><a:schemeClr val="accent1"/></a:solidFill>`. In python-pptx: `shape.fill.fore_color.rgb = RGBColor(0x1F,0x2D,0x58)` versus `shape.fill.fore_color.theme_color = MSO_THEME_COLOR.ACCENT_1`.
- **What breaks.** Theme fills follow the deck's theme. If the client applies their own corporate theme (common when a deck is merged into a larger pack), every theme-filled shape restyles, silently, and semantic colour coding is destroyed. Fixed fills survive that, but ignore a legitimate rebrand.
- **The working rule.** Semantic colour is fixed `srgbClr`. Chrome (title bar, footer, section dividers, table header) is theme colour. Semantics must not be reassignable by a theme swap; branding should be.
- `[HELD]` Theme tint and shade use `<a:lumMod val="60000"/><a:lumOff val="40000"/>` inside `schemeClr`. python-pptx does not expose lumMod/lumOff; it requires raw XML on the `a:solidFill` element.
- `[HELD]` python-pptx cannot create or edit a theme (`ppt/theme/theme1.xml`). The theme must exist in the template you open. Ship a `.potx`.

### 4.2 Masters and layouts

- `[HELD]` python-pptx can only use layouts already present in the template: `prs.slide_layouts[i]`. It cannot create a layout or a master.
- **On the master:** background, the six theme colour slots, theme fonts, footer and slide-number placeholders, the logo, the standing rule lines.
- **On the layout:** title and subtitle placeholders with final position and type spec, the source-band placeholder, the legend anchor rectangle (empty, named), the diagram frame guide.
- **On the slide:** only content. Any geometry an editor should never move belongs on the layout, because layout elements are not selectable on the slide and therefore cannot be nudged by accident.
- **Build these layouts:** `Title`, `Section`, `Diagram-Full`, `Diagram-Half-Text`, `Table`, `Statement`, `Decisions`. Seven is enough; more and authors pick the wrong one.

### 4.3 Shape naming

- `[HELD]` The Selection Pane reads `p:cNvPr/@name`. python-pptx exposes it as a writable `shape.name`.
- **Convention:** path-like, slash-delimited, most-significant first, so the pane sorts into visual groups without OOXML grouping: `A/hub/vnet`, `A/hub/inspect/nva-1`, `A/spoke/a1`, `link/A/spoke-a1>hub`. Prefix connectors with `link/` so an editor can find every line in one contiguous block.
- **Never** leave generated defaults (`Rectangle 47`). An editor faced with sixty `Rectangle n` entries will not use the Selection Pane at all, and will resort to click-hunting, which is how shapes get dragged accidentally.
- `[HELD]` Alt text is `p:cNvPr/@descr`. Not exposed by the python-pptx API in most versions; set it with `shape._element._nvXxPr.cNvPr.set('descr', text)`. Required for accessibility conformance and worth automating from the model's own label + meta.

### 4.4 Grouping

- **Depth limit: zero for structural diagrams.** Use containment rectangles behind shapes for visual grouping and shape-name prefixes for logical grouping. Emit no `p:grpSp`.
- **Why.** A group traps the editor: single-click selects the group, so moving one box needs a double-click to enter, and a mis-drag moves twelve shapes. Worse, `p:grpSp` carries its own child coordinate space (`a:chOff` / `a:chExt`); resizing a group rescales children non-uniformly, and a connector attached across a group boundary behaves unpredictably on group move.
- **The one exception:** a badge plus its parent shape, where the two must always travel together and the editor never needs to separate them. Even then, prefer positioning the badge by rule at generation time and accepting that a moved shape leaves its badge behind, detectable by the conformance check.
- `[HELD]` python-pptx added `shapes.add_group_shape()` in 0.6.19+, but child-offset handling is manual. If you must group, verify in PowerPoint, not in code.

### 4.5 Connector attachment

- `[HELD]` `shapes.add_connector(MSO_CONNECTOR.STRAIGHT | ELBOW | CURVE, x1, y1, x2, y2)` then `conn.begin_connect(shape, idx)` / `conn.end_connect(shape, idx)`, which write `<a:stCxn id="..." idx="..."/>` and `<a:endCxn .../>`.
- `[HELD]` **The critical limit:** python-pptx writes the attachment but does not recompute the connector's own `a:off` / `a:ext` / `flipH` / `flipV`. PowerPoint recalculates the routed path when the file is opened and when either endpoint shape moves. Until then the stored geometry is what renders in thumbnails and in some viewers. Therefore always set the initial straight-line geometry to the correct endpoints yourself, then attach. A generator that attaches without setting geometry produces a deck whose thumbnails look broken.
- `[HELD]` Connection site indices come from the preset geometry's `a:cxnLst`. For `rect` and `roundRect` there are four: `0` top, `1` left, `2` bottom, `3` right. Other presets (hexagon, diamond, chevron, can) have different counts and orders. Validate a lookup table once by hand in PowerPoint and store it in the skill; do not infer it at runtime.
- **On move:** an attached connector reroutes; a free-endpoint connector does not. This is the whole reason to attach.
- **On resize:** attached endpoints stay on the site, so the line follows the new edge. Correct behaviour.
- **On delete:** PowerPoint does **not** delete the connector. It leaves it with a dangling endpoint at the last known position. Detect it: a connector whose `stCxn/@id` or `endCxn/@id` no longer resolves to a shape in the `spTree`.
- `[HELD]` Arrowheads are not in the python-pptx API. Write raw XML on `a:ln`: `<a:headEnd type="none"/><a:tailEnd type="triangle" w="med" len="med"/>`. Types: `none`, `triangle`, `stealth`, `diamond`, `oval`, `arrow` (open).
- `[HELD]` `line.dash_style` **is** exposed (`MSO_LINE_DASH_STYLE.DASH`, `SYS_DASH`, `DASH_DOT`, `ROUND_DOT`, and others).
- `[HELD]` The bend position of a `bentConnector3` lives in `<a:avLst><a:gd name="adj1" fmla="val 50000"/></a:avLst>` and is not exposed by the API. Raw XML, or accept PowerPoint's default midpoint bend.
- `[HELD]` A `Connector` object has no `text_frame`. Connector labels must be separate text boxes, which means they do **not** move when the connector reroutes. This is the single largest editability compromise in the whole approach, and the honest mitigation is: keep connector labels few, place them on straight runs, and add a conformance check that flags a label whose midpoint has drifted more than 0.15in from its connector's midpoint.

### 4.6 Text frames

- `[HELD]` `tf.word_wrap = True`; `tf.auto_size` takes `MSO_AUTO_SIZE.NONE`, `SHAPE_TO_FIT_TEXT`, `TEXT_TO_FIT_SHAPE`.
- `[HELD]` **The trap.** `TEXT_TO_FIT_SHAPE` writes `<a:normAutofit/>`, but the `fontScale` and `lnSpcReduction` attributes that actually shrink the text are computed by the *renderer*. python-pptx does not compute them. The result is text that overflows its box in the generated file and only snaps into place after a human edits the text in PowerPoint. Never use it in a generator.
- **The working rule.** `auto_size = NONE`, `word_wrap = True`, and size the box from a character budget you enforce in the model (see 4.10). Set `tf.vertical_anchor = MSO_ANCHOR.MIDDLE` and explicit margins (`tf.margin_left` etc., defaults 0.1in left/right, 0.05in top/bottom - reduce to 0.05/0.03 in dense diagrams).
- Label and meta go in **one** text frame as two paragraphs with different run properties, never two shapes. Two shapes means an editor retypes the label and orphans the meta.
- `[HELD]` Run font size in XML is hundredths of a point: `sz="1200"` is 12pt. EMU: 914400 per inch, 12700 per point.

### 4.7 What reliably breaks

| Trigger | What happens | Countermeasure |
|---|---|---|
| Shape resized smaller | Text overflows silently (with `auto_size=NONE`); box no longer aligns to grid | Conformance check: text length against box capacity; grid-snap check |
| Text lengthened by an editor | Overflow, or wrap into a third line that overlaps the shape below | Size boxes for the longest plausible string plus 20%; leave 0.25in routing channel (TD-17) |
| Shape deleted | Attached connectors survive as dangling lines | Dangling-endpoint check on every rebuild |
| Shape moved | Badge and connector label stay behind | Drift check on badge and label positions |
| Theme changed | Theme-coloured shapes restyle; fixed-colour shapes do not | Semantic colour fixed, chrome themed (4.1) |
| **PowerPoint for Mac** | Generally faithful. Font fallback differs; dash rendering slightly heavier | Use theme fonts present on both platforms, or accept fallback |
| **PowerPoint on the web** | Connectors editable; Selection Pane present but renaming limited; some dash styles approximate; `normAutofit` recompute is unreliable | Do not rely on autofit (already ruled out) |
| **Google Slides** | Converts connectors to plain lines and **drops attachment**; flattens `lumMod`/`lumOff` tints; converts uncommon preset geometries to paths; loses some arrowhead types | Accept that Slides is a read path only. State it in the pack's first slide notes |
| **Keynote** | Drops connector attachment, converts groups, substitutes fonts aggressively, mangles dash patterns | Read-only path. Export PDF for Keynote users |

### 4.8 Alignment and distribution

- `[HELD]` PowerPoint's default snap grid spacing is 0.083in - one twelfth of an inch. Authoring on a 1/12in unit means an editor's nudge lands exactly on your grid instead of one pixel off it. This is the single highest-value choice in the whole geometry spec.
- Every coordinate an integer multiple of `u`. Peer shapes share width and height exactly. Gaps between peers are one of two values (tight `1u`, standard `2u`) and never a third.
- Provide the editor a way back: because everything is on the grid, PowerPoint's own Align and Distribute restores true after a sloppy drag. Off-grid authoring removes that.

### 4.9 Inserting without relayout

- **Band architecture.** Every diagram is a stack of horizontal bands with fixed y and height. A new element is inserted into a band, not into the canvas. Only that band's shapes reflow.
- **Growth gutter.** Each band reserves one shape-width of empty space at its right edge. Up to that limit, insertion needs no reflow at all.
- **Even-count layout.** Lay bands out for an even number of slots even when the current count is odd, so the next insertion is symmetric rather than forcing a re-centre.
- **Anchored furniture.** Legend, callouts and source band are anchored to frame corners, not to content, so content growth never displaces them.

### 4.10 The character budget

Because text cannot be measured without a rendering engine (see Section 7), box capacity is estimated and then enforced:

```
capacity_chars ≈ (box_width_in - 2 * margin_in) / (0.55 * font_size_pt / 72) * lines
```

The `0.55` is an average advance-width ratio for a humanist sans at these sizes and is deliberately conservative. Enforce it as a hard assertion in the model: a label exceeding capacity fails the build rather than shipping clipped. This converts an invisible rendering defect into a loud generation error, which is the only reliable handling available.

---

## SECTION 5 — TOKEN AND COMPONENT MODEL

Real values. EMU given where a generator needs them (914400 EMU per inch, 12700 per point).

### 5.1 Colour tokens

```yaml
# Structure
navy:        "1F2D58"   # primary structure, container borders, headings
navy-60:     "5A668C"   # secondary text, dimension labels
navy-12:     "E7EAF2"   # container fill (region, management group)

# Accent - the subject of the diagram, one per diagram (TD-03)
orange:      "F89728"
orange-16:   "FDEDD9"

# Planes
teal:        "1B7F79"   # network / connectivity
teal-14:     "E2F0EF"
plum:        "6B3F7A"   # identity / trust
plum-14:     "EFE8F2"
slate:       "44506B"   # compute / workload
slate-12:    "E9ECF2"

# State
amber:       "B26B00"   # planned, not enabled
amber-14:    "FBF0DE"
crimson:     "8E1B2C"   # conflict, denied, unreconciled
crimson-12:  "FBE4E7"

# Canvas
paper:       "FFFFFF"
rule:        "C9D0E0"   # non-semantic dividers, grid
ink:         "16203D"   # body text on paper
```

Contrast, computed: `navy` on `paper` 12.6:1. `navy` on `navy-12` 10.9:1. `teal` on `teal-14` 5.4:1 - use `navy` for text on teal fills, not `teal`. `crimson` on `crimson-12` 7.4:1. `orange` on `paper` 2.1:1 - **never** a text colour and never a white-text background (TD-30); `orange` is a stroke and a fill under `navy` text only.

### 5.2 Type tokens

| Token | Family | pt | XML `sz` | Weight | Use |
|---|---|---|---|---|---|
| `t-title` | Poppins | 28 | 2800 | 600 | Slide title |
| `t-sub` | Mulish | 15 | 1500 | 400 | Subtitle / thesis line |
| `t-h2` | Poppins | 18 | 1800 | 600 | In-slide heading |
| `t-container` | Poppins | 13 | 1300 | 600 | Container label |
| `t-box` | Mulish | 12 | 1200 | 600 | Shape label |
| `t-box-sm` | Mulish | 11 | 1100 | 600 | Shape label, engineering density |
| `t-meta` | Mulish | 10 | 1000 | 400 | CIDR, SKU, count |
| `t-wire` | Mulish | 10 | 1000 | 600 | Connector label |
| `t-legend` | Mulish | 11 | 1100 | 400 | Legend entry |
| `t-table` | Mulish | 11 | 1100 | 400 | Table body |
| `t-source` | Mulish | 9 | 900 | 400 | Source band, `navy-60` |

Floor: 9pt, and only in the source band. Line spacing 1.15 for multi-line labels, 1.0 for label+meta pairs. Never justified, never letter-spaced except badge text (0.4pt).

### 5.3 Spacing, radius, stroke

```yaml
unit_u:        0.0833in      # 76200 EMU - matches PowerPoint's default snap grid
gap_tight:     1u            # between chips inside a container
gap_standard:  2u            # between peer shapes
gap_band:      3u            # between bands - the routing channel (TD-17)
pad_container: {label: 3u, sides: 1.2u}

radius_sharp:   0            # subnet, table cell
radius_soft:    0.06         # roundRect adj - container, VNet
radius_pill:    0.50         # badge, external party

stroke_hair:    0.75pt       # subnet, chip
stroke_base:    1.0pt        # subscription, service
stroke_heavy:   1.5pt        # container, peering line
stroke_accent:  2.0pt        # the inspected path
shadow:         none         # always (TD-27)
```

### 5.4 Primitives

The smallest reusable units. `preset` is the OOXML preset geometry name.

| id | preset | Default size | Fill / line | Text | Represents |
|---|---|---|---|---|---|
| `P-zone` | `rect` | container | `navy-12` 40% / `rule` 1pt dash | `t-container` top-left | Region, trust zone |
| `P-mg` | `roundRect` .06 | 24u × 6.6u | `navy-12` / `navy` 1.5pt | `t-container` | Management group |
| `P-sub` | `rect` | 27u × 9u | `paper` / `navy` 1pt | `t-box` + `t-meta` | Subscription |
| `P-vnet` | `roundRect` .04 | 30u × 13u | `teal-14` / `teal` 1.25pt | `t-container` | VNet |
| `P-subnet` | `rect` | 16u × 6u | `paper` / `teal` 0.75pt | `t-box-sm` + `t-meta` | Subnet |
| `P-nva` | `hexagon` .18 | 9u × 7u | `orange-16` / `orange` 1.5pt | `t-box` navy | Firewall, NVA |
| `P-lb` | `flowChartDelay` rot 90 | 9u × 5u | `paper` / `teal` 1pt | `t-box-sm` | Load balancer |
| `P-gw` | `flowChartMagneticDrum` | 14u × 6u | `teal-14` / `teal` 1pt | `t-box-sm` | Gateway (ER, VPN, SD-WAN) |
| `P-svc` | `roundRect` .10 | 21u × 7u | `slate-12` / `slate` 1pt | `t-box` | PaaS service |
| `P-store` | `can` | 13u × 8u | `slate-12` / `slate` 1pt | `t-box-sm` | Storage, vault, workspace |
| `P-id` | `roundRect` .10 | 21u × 7u | `plum-14` / `plum` 1pt | `t-box` | Identity object |
| `P-ext` | `roundRect` .50 | 23u × 6u | `paper` / `navy-60` 1pt dash | `t-box` navy-60 | External party |
| `P-step` | `chevron` | 19u × 6.6u | `navy` / none | `t-box` paper | Ordered process step |
| `P-gate` | `diamond` | 16u × 11u | `orange-16` / `orange` 1.5pt | `t-box-sm` | Decision, policy gate |
| `P-badge` | `roundRect` .50 | auto × 3.1u | per state (5.5) | 9pt caps, 0.4pt tracking | State badge |
| `P-chip` | `rect` | auto × 3u | `paper` / none | `t-wire` | Connector label chip |
| `P-note` | `rect` | auto | `paper` / `rule` 0.75pt | `t-meta` | Callout, legend container |
| `P-flag` | `roundRect` .08 | frame-width × 5u | `crimson-12` / `crimson` 1.25pt | `t-box` crimson | Conflict banner |

### 5.5 State badges

| State | Fill | Text | Border |
|---|---|---|---|
| deployed | (no badge) | | |
| `PLANNED` | `amber-14` | `amber` | `amber` 0.75pt |
| `NOT ENABLED` | `amber-14` | `amber` | `amber` 0.75pt |
| `UNRECONCILED` | `crimson-12` | `crimson` | `crimson` 0.75pt |
| `UNKNOWN` | `paper` | `navy-60` | `navy-60` 0.75pt dash |
| `PROPOSED` | `orange-16` | `navy` | `orange` 0.75pt |

Placement: top-right of the parent, overlapping its border by 0.6u, height 3.1u.

### 5.6 Components

Primitives composed into repeatable objects.

| id | Composition | Rules |
|---|---|---|
| `C-region` | `P-zone` + label + optional supernet meta | Full band height; siblings equal width; 7u gap between regions |
| `C-hub` | `P-vnet` + 2-4 `P-subnet` in 2 rows + inspection cluster | Inspect subnet always the top row; gateway and PE subnets the bottom row |
| `C-inspect` | `P-subnet` containing 1 `P-lb` + n `P-nva` | LB always left of the NVAs; NVAs equal width, `gap_tight` apart |
| `C-spoke` | `P-vnet` + label + CIDR meta + optional badge | All spokes in a band share width and height exactly (TD-36) |
| `C-petier` | `P-subnet` named `snet-pe-*` + `t-meta` listing zone count | Always in the hub, always bottom row |
| `C-legend` | `P-note` + one row per class: 8u line sample + `t-legend` | Bottom-left, fixed across the set (TD-33) |
| `C-callout` | `P-note` + `t-meta` | Bottom-right, one per diagram maximum |
| `C-sourceband` | `t-source` text line | Full frame width, y fixed at 83u |
| `C-slidefurniture` | title + subtitle + frame + legend + source band | Emitted by the layout, not the slide (4.2) |

### 5.7 Composition rules

- **CR-01** A canvas is a stack of bands. A band has fixed `y` and `h`; shapes may only vary in `x` and `w` within it.
- **CR-02** Peer shapes in a band share width and height exactly.
- **CR-03** Containers hold whole components, never a mix of components and loose primitives.
- **CR-04** Only `C-legend`, `C-callout` and `C-sourceband` may sit outside a band; they anchor to frame corners.
- **CR-05** External parties (`P-ext`) sit outside every zone, on the frame edge nearest the party they talk to.
- **CR-06** No shape overlaps another except a badge on its parent and a chip on a connector.

### 5.8 Naming convention

```
Tokens        kebab-case, plane-first:        teal-14, navy-60, t-box-sm, gap_band
Primitives    P-<noun>:                        P-vnet, P-nva, P-badge
Components    C-<noun>:                        C-hub, C-inspect, C-legend
Model ids     <region>-<role><ordinal>:        a-hub, a-spoke1, b-nva2
Shape names   slash path, coarse to fine:      A/hub/inspect/nva-1
Connectors    link/<from>><to>:                link/a-spoke1>a-ilb
Layouts       PascalCase:                      DiagramFull, DiagramHalfText
Figure ids    D<nn>:                           D03
Check ids     <domain>-<nn>:                   TD-20, ED-04, EC-11, AL-01
```

---

## SECTION 6 — ONE MODEL, MANY OUTPUTS

### 6.1 The pattern and its names

This is **single-source-of-truth documentation** with a **model plus layout overlay**. The closest well-known reference is **Structurizr** with the **C4 model**: one workspace defines elements and relationships, many views select subsets, and - critically - manual layout positions are persisted **per view, keyed by element id**, then re-merged after the model changes. That merge step is the entire trick, and any system that omits it will destroy hand-tuning on every regeneration.

Adjacent approaches worth knowing: docs-as-code (AsciiDoc or Sphinx plus PlantUML or Mermaid) - good for prose, poor for layout stability, because auto-layout engines re-flow the whole graph when one node is added; **Graphviz and D2** - deterministic-ish but the output does not look like an architecture diagram an APM reviewer expects; **infrastructure introspection** (Terraform state to diagram) - accurate but unreadable without heavy curation.

### 6.2 Model structure

Three layers, in separate files, with different change rates and different owners.

```yaml
# 1. model.yaml  - semantics. Owns truth. Changes when the architecture changes.
elements:
  a-hub:
    kind: vnet
    name: auea-vnet-hub-001
    meta: "10.40.0.0/23"
    region: australiaeast
    state: deployed
    source: "as-built/topology.md"
relationships:
  - id: a-spoke1>a-hub
    kind: peering
    from: a-spoke1
    to: a-hub
    state: deployed
    source: "as-built/topology.md"
decisions:
  - id: DR-004
    title: "Forced tunnelling of all spoke egress"
    options: [...]
    selected: "UDR 0.0.0.0/0 to internal LB frontend"
    rationale: "..."
assumptions:
  - text: "AVD spoke deploys before wave 2"
    evidence: UNKNOWN
    breaks: "Wave 2 host pool has no network"
    owner: "Platform lead"
```

```yaml
# 2. views.yaml  - which subset, at which audience level, in which figure.
views:
  D03:
    title: "Dual-region hub-spoke topology"
    thesis: "Only intra-region east-west is inspected."
    detail: engineer
    include: [a-*, b-*, internet, onprem]
    collapse: {}
```

```yaml
# 3. layout/D03.yaml  - geometry only, keyed by element id. Hand-editable.
a-hub:    {x: 22, y: 19, w: 38, h: 26}
a-spoke1: {x: 9,  y: 50, w: 30, h: 10}
```

### 6.3 What lives where

| In the model | Presentation-only |
|---|---|
| Element identity, name, kind, state, meta fact | Position, size |
| Relationship, its kind and direction | Which side of a shape a connector attaches to |
| Source citation | Colour (derived from `kind`) |
| Decision records, assumptions, open items | Font size (derived from `detail`) |
| Counts and CIDRs | Legend row order |
| Audience-visibility flags | Badge pixel offset |

If a fact appears in prose **and** in a diagram, it lives in the model once and both renderers read it. The count in the Word paragraph and the count of boxes on the slide then cannot disagree, which removes an entire failure class (see FM-04).

### 6.4 Layout: computed or authored

Authored, held separately, merged by id. Automatic layout is the wrong answer for architecture diagrams for three reasons: force-directed and layered engines produce arrangements that violate the semantics of position (TD-05); they are unstable, so adding one node reshuffles everything and every diff is total; and the result never matches the mental model the reader already has of a hub and spoke.

**The merge algorithm on regeneration:**

1. Load `layout/<view>.yaml`.
2. For every element in the view with a saved position, use it unchanged.
3. For every element with no saved position, place it by the band rules (4.9) into the growth gutter of its band, and mark it `layout: auto` in the emitted file.
4. For every saved position whose element no longer exists, retain it in a `retired:` block for one generation, then drop it. This survives a rename round-trip.
5. Write the merged layout back, so hand-tuning accumulates rather than being lost.

Elements placed automatically are visually flagged in a build-preview render, so the author knows exactly which shapes need a human eye. Nothing else moves.

### 6.5 Round-tripping from PowerPoint

Partially possible, and worth doing for geometry only.

- **Recoverable:** shape position and size, keyed by the slash-path shape name (4.3); connector endpoint attachment; z-order; which shapes were deleted. Read them with python-pptx, map name to model id, write into the layout overlay.
- **Lost:** any semantic change. If a reviewer retypes a label from `auea-vnet-hub-001` to `auea-vnet-core-001`, that is a model change made in the wrong place, and the round-trip cannot tell it from a typo.
- **The working rule.** Geometry round-trips. Semantics do not. Detect semantic drift and refuse it: on import, compare every shape's text against the model-derived text and report mismatches as a list for the author to accept into the model deliberately. Silent acceptance would make the deck the source of truth, which defeats the whole design.
- **Requires:** stable shape names. If a generator renames shapes between runs, round-tripping is impossible. Name from the model id, never from an ordinal.

### 6.6 Diffing

Three levels, all useful, in increasing cost:

1. **Model diff.** Structured comparison of `model.yaml` between versions: elements added, removed, renamed, state-changed; relationships added, removed, re-kinded; decisions added or reversed; assumptions resolved. This renders directly as the document's version-history table and as a "what changed" slide. It is the diff a reviewer actually wants.
2. **Diff view.** A generated diagram of the union of both versions: added elements outlined `teal` with a `+` badge, removed elements ghosted at 35% with a `-` badge, changed elements outlined `amber`. One picture, and it answers "what moved" better than any table.
3. **Visual diff.** Render both versions to PNG at identical geometry and pixel-difference them. Crude, but it is the only thing that catches an unintended layout change, which the model diff cannot see by definition.

For the Word document, generate a redline by producing both versions from the same pipeline and running a document comparison, rather than relying on tracked changes surviving a regeneration - they will not.

### 6.7 Known failure modes of the pattern

- **Layout drift.** Hand positions accumulate against a model that has moved on, until the diagram is technically valid and visually wrong. Countermeasure: flag `layout: auto` elements loudly, and re-baseline a view deliberately when more than a third of its elements are auto-placed.
- **Model bloat.** Everything becomes a model field, including presentation details, and the model stops being readable. Countermeasure: the table in 6.3 is a hard boundary; a field that only one renderer reads belongs in that renderer.
- **The two-source relapse.** Someone edits the PPTX because it is faster, ships it, and the model is now wrong. Countermeasure: the generated deck carries the model version in the source band, and a build check compares it to the current model version.
- **Over-generalisation.** Building a generic diagram engine instead of a specific one. The model above knows what a VNet is. That is a feature; a generic node-and-edge model would produce generic-looking diagrams.

---

## SECTION 7 — RENDER PATH REALITY CHECK

### 7.1 By format

| Path | Direct emit? | Fidelity | Where it degrades |
|---|---|---|---|
| **HTML + CSS** | Yes, directly `[HELD]` | Highest. Full control of geometry, type, colour; renders identically in the review preview and in print | Not editable by a reviewer in their own tools |
| **SVG** | Yes, directly `[HELD]` | Very high, resolution-independent | Editable only in a vector tool. Text becomes fragile if fonts are not embedded or outlined |
| **Word `.docx`** | Yes, via this project's OOXML pipeline `[HELD]` | High. Real heading styles, real tables, working TOC, APM cover set | Figures are embedded as raster PNG, so diagram text is not searchable or editable in Word |
| **PDF** | Yes, print-based from HTML `[HELD]` | High for reading and distribution | Terminal format. Nothing downstream can edit it |
| **PPTX, screenshot mode** | Yes `[HELD]` | Pixel-exact | Not editable at all. Useful only as a fallback |
| **PPTX, native shapes** | Yes, from HTML via the editable export path `[HELD]`, with limits | Text and simple shapes become real PowerPoint objects | Connector **attachment is not produced** - lines convert to standalone shapes. Complex CSS degrades. Good for text-and-box slides, insufficient for a topology diagram that must stay wired |
| **PPTX via python-pptx** | Code emitted for you to run `[PRACTICE]` `[CANNOT]` run it here | Highest editability available: attached connectors, named shapes, theme colours, alt text | Requires you to run Python. No text measurement (4.10). Arrowheads, bend adjustment, lumMod need raw XML |
| **PPTX via pptxgenjs** | Same, in JavaScript `[PRACTICE]` | Comparable; slightly simpler API, weaker raw-XML escape hatch | Same limits |
| **Mermaid, PlantUML, D2, Graphviz, Structurizr DSL** | Source emitted directly `[HELD]`; rendering needs their toolchain `[CANNOT]` here | Fast, versionable, semantically clean | Auto-layout. Output does not look like an enterprise architecture diagram, and is not natively editable in PowerPoint at all |

### 7.2 The direct question

**For a dense cloud network topology that must stay natively editable in PowerPoint, the highest-quality path is:**

Author explicit geometry in the YAML model of Section 6, generate with python-pptx into a client `.potx` that already carries the theme and the seven layouts, and emit: fixed `srgbClr` semantic fills, theme colours for chrome only, `roundRect` and `rect` containers with no groups, slash-path shape names, connectors created with correct initial geometry **and then** attached with `begin_connect` / `end_connect`, arrowheads and bend adjustments written as raw XML, `auto_size = NONE` with character-budget assertions, and `descr` alt text on every shape.

**The honest ceiling.** It will look like a very clean, very precise Visio diagram: flat fills, crisp orthogonal lines, consistent geometry, real names, correct CIDRs. Engineers will trust it, and that is the point (TD-34). It will not look like a designed marketing render, and four things put a hard cap on it:

1. **No text measurement.** Box sizes are estimated from a character budget. Occasionally a box is 10% wider than it needs to be. Visible to a designer; invisible to a reviewer.
2. **No vendor icons** unless you supply the licensed EMF or SVG assets. Icon-free diagrams read as more rigorous in an architecture review anyway, so this is a small loss.
3. **Connector labels do not travel with their connectors** (4.5). Accepted compromise, mitigated by a drift check.
4. **No effects.** No shadow, gradient, isometry or 3D - and every one of those would reduce credibility rather than raise it (TD-27).

The remaining gap between this and a hand-crafted diagram is roughly the last 10% of visual polish, and it is bought with the thing you actually need: an architect can open the slide mid-review, drag a spoke, and the wiring follows.

**One deliberate exclusion.** Do not use the HTML-to-PPTX editable export for topology diagrams. It produces editable text and boxes but unattached lines, which means the first drag breaks the diagram - the exact failure the whole approach exists to prevent. Use it for text slides and tables; use python-pptx for anything wired.

---

## SECTION 8 — FAILURE MODES

Ranked roughly by how much damage they do after surviving review.

### FM-01 Plausible invented identifiers

**Looks like:** a subnet named `snet-app-prod-002` that does not exist, an IP `10.40.2.4` that is nobody's, a policy `Deny-Public-IP` whose real name is different. Everything around it is correct, which is what makes it lethal.
**Why:** generative completion fills a structural gap with the most probable value. A naming convention makes the invented value *more* plausible, not less.
**Countermeasure:** every identifier in output must resolve to a source register, or carry a `[PROPOSED]` marker and a decision row.
**Detection:** extract every token matching the naming grammar and every CIDR and IP; set-difference against the source register; anything unmatched and unmarked fails the build.

### FM-02 State drift - planned rendered as deployed

**Looks like:** present-tense prose about a spoke that does not exist. Board approves a state that is not real.
**Why:** design documents and as-builts use the same vocabulary; a generator reading both flattens tense.
**Countermeasure:** `state` is a mandatory model field; renderers derive tense and badge from it, never from prose.
**Detection:** scan for present-tense verbs ("is deployed", "provides", "inspects") within a sentence window of any element whose model state is not `deployed`.

### FM-03 Stale cross-references after renumbering

**Looks like:** "see 4.3.9" pointing at a section that moved; "Figure 5" now showing something else.
**Why:** inserting a section or a figure renumbers everything after it, in two files.
**Countermeasure:** references by id, resolved to numbers at build time.
**Detection:** already solved here - the XREF, FIGSEQ, FIGREF and TREE checks in `consistency-check.js`.

### FM-04 Count contradiction

**Looks like:** "the six spokes" above a table with five rows; "13 subscriptions" where the as-built lists 15.
**Why:** a count is written once and the list changes later.
**Countermeasure:** counts derive from the model, never typed.
**Detection:** the COUNT check - a stated numeral immediately preceding a table or list, compared to its length.

### FM-05 Silent text clipping

**Looks like:** a box whose last line is hidden. Invisible in a thumbnail, obvious in the room.
**Why:** no text measurement in the generator; autofit that never computed.
**Countermeasure:** character budget as a hard assertion (4.10); `auto_size = NONE`.
**Detection:** for HTML figures, `scrollHeight > clientHeight` on every box - already in `qa()`. For PPTX, the character-budget assertion at build time.

### FM-06 Near-miss connector

**Looks like:** a line ending 3px short of its box. Reads as sloppy at 100% zoom and is the fastest way to lose an engineer's confidence.
**Why:** endpoints authored as free coordinates rather than attached.
**Countermeasure:** attach every endpoint to a shape and a connection site.
**Detection:** any connector without `stCxn` and `endCxn` fails. For rasterised figures, sample the pixel at the endpoint coordinate rather than eyeballing a downscaled preview.

### FM-07 Symmetry hallucination

**Looks like:** region B drawn as a perfect mirror of region A, including facts that are only true of A. The real corpus example: a two-firewall region documented with four load balancers because the four-firewall region has four.
**Why:** the model completes a pattern rather than reading the source. Extremely hard to spot, because symmetry looks *more* correct.
**Countermeasure:** mirrored regions are separate model entries, never a generated mirror. Any element in region B with no distinct source citation is flagged.
**Detection:** compare source citations across mirrored elements; identical citation for both regions with region-specific values is a finding.

### FM-08 Confident unknowns

**Looks like:** a renewal process, an owner or a retention period stated plainly with no source, because the sentence needed an object.
**Why:** omission reads as incomplete; the generator prefers complete prose.
**Countermeasure:** `[UNKNOWN]` is a first-class output token that must appear inline, plus an assumptions row with a named owner.
**Detection:** every claim of fact must carry a citation marker; uncited assertions in fact-bearing sections fail.

### FM-09 Diagram and prose divergence

**Looks like:** §5.3 says traffic egresses via the hub firewall; the figure shows a direct internet path, because one was edited and the other was not.
**Why:** two artefacts, one edit.
**Countermeasure:** both derive from the model (Section 6).
**Detection:** extract relationships implied by the prose (from → to → kind) and compare against the model's relationship set for the figures cited in that section.

### FM-10 Monochrome collapse

**Looks like:** in a printed pack, three line classes are indistinguishable grey.
**Why:** colour used as the only channel.
**Countermeasure:** TD-20, two channels always.
**Detection:** convert fills and strokes to luminance; assert that every pair of classes differs either in dash pattern or by 20% luminance.

### FM-11 Legend and style drift

**Looks like:** a dashed teal line on the slide with no legend entry, usually because a class was added late.
**Countermeasure and detection:** legend coverage check - the set of drawn line classes must equal the set of legend entries, both directions.

### FM-12 Cross-document contamination

**Looks like:** a value, a control name or a paragraph from a different design surviving a copy. Occasionally another client's.
**Why:** template reuse without a scrub.
**Countermeasure:** a per-document stale-term list; every retired term from the predecessor document goes on it.
**Detection:** the STALE scan, run on prose, figure captions and figure text alike.

### FM-13 Dual classification

**Looks like:** a control listed as both inherited and excluded, in two different sections, both true when written.
**Countermeasure and detection:** the DUAL check - a policy appearing in both an inheritance table and an exclusion table without an explicit reconciling cross-reference.

### FM-14 Narrative padding

**Looks like:** three paragraphs of rationale where a settings table should be. Survives review because it reads well, then the build engineer cannot proceed.
**Why:** prose is easier to generate than a table of real values, and reads as thorough.
**Countermeasure:** the standard's rule - show the settings, not the intent. Every configuration claim needs setting name, value, scope.
**Detection:** heuristic but effective - a subsection over roughly 200 words in the technology sections with no table is flagged for review.

### FM-15 Accessibility regressions

**Looks like:** brand accent used as a text background; alt text absent; reading order following creation order rather than visual order.
**Detection:** contrast computed across every text-on-fill pair; `descr` present on every shape; tab order compared to the geometric reading order.

### FM-16 Version-history fiction

**Looks like:** a version-history row describing changes that were not made, because the row was written from intent rather than from the diff.
**Countermeasure:** generate the row from the model diff (6.6), not by hand.

---

## SECTION 9 — WHAT YOU NEED FROM ME

Ranked by gain. Sizes are honest estimates of quality lift, not of effort.

| # | Input | Gain | Why |
|---|---|---|---|
| 1 | **Two approved exemplar documents** - one DDD, one TCD, that actually passed the client's review | **Very large** | Beats any amount of style guidance. They encode section order, depth expectations, the level of settings detail the assessor demanded, house phrasing, and what the approver did **not** ask about. One exemplar plus its review comments is worth more than a fifty-page style guide |
| 2 | **The review comments from a heavily-marked-up draft** | **Very large** | Tells us what reviewers actually catch, which is never what a style guide predicts. Directly generates conformance rules. Ranked this high because it is the only input that reveals the failure modes specific to *these* reviewers |
| 3 | **The client `.potx` or a real approved deck** with masters, layouts and theme intact | **Large** | python-pptx cannot create themes or layouts (4.1, 4.2). Without it, every deck is off-brand or hand-fixed. With it, everything downstream inherits correctly |
| 4 | **A brand token file with real values** - hex, font names, weights, spacing | **Large** | A brand guidelines PDF without extractable values is nearly worthless; a 20-line token file is transformative. Ranked below the template only because the template usually contains the tokens |
| 5 | **One real approved architecture diagram as a native `.pptx`** | **Large** | Reverse-engineerable: their conventions for zone boxes, connector semantics, icon use, label style. Tells us which of the Section 2 rules the client already follows and which would look alien |
| 6 | **The assessor's or approver's checklist** - what the gate actually tests | **Large** | Converts directly into machine checks. If it exists at all, it is the highest-value single page in the engagement |
| 7 | **The authoritative source register** - resource inventory, naming register, IPAM export, policy list | **Large** | The countermeasure for FM-01. Without it, invented-identifier detection is impossible and every identifier must be marked `[PROPOSED]` |
| 8 | **Font files, or an explicit substitution decision** | Medium | Currently substituted and flagged. Fine, but it should be a decision on the record rather than a default |
| 9 | **Two or three prior documents that were rejected**, with the reason | Medium | Negative examples are unusually informative and rarely offered |
| 10 | **The Word style definitions** if the client's template differs from the master already held | Medium | Only matters if there is a mismatch; cheap to check |

**Adds nothing, do not spend time on:**

- Mood boards, adjective lists, "make it feel modern"
- A brand guidelines PDF with no extractable values
- Competitor or vendor reference decks - they optimise for persuasion, not for audit
- More corpus text on topics already covered; breadth is not the constraint
- Verbal descriptions of the review process; the checklist or the comments, or nothing

**One structural request that outranks most of the list:** whichever of the above you supply, supply the **source register** (#7) in a machine-readable form. Everything else improves the writing. That one makes a whole class of error impossible.

---

## SECTION 10 — DEMONSTRATION

A complete, generator-ready specification for a generic dual-region hub-and-spoke with central inspection, four spokes, forced egress routing and a private endpoint tier.

Coordinates in grid units. `1u = 0.0833in = 76200 EMU`. Slide is 160u × 90u (13.333in × 7.5in). Every value is an integer multiple of `u`, so PowerPoint's default 0.083in snap grid aligns exactly (4.8).

### 10.1 The specification

```yaml
diagram:
  id: D-DEMO
  title: "Dual-region hub-spoke with central inspection"
  thesis: "All spoke egress is forced through the regional inspection tier. Spokes never talk directly."
  density: engineering        # 22 primary shapes, 11pt floor
  canvas: {w: 160, h: 90}
  frame:  {x: 6, y: 14, w: 148, h: 68}
  emit:
    groups: none              # logical grouping via shape-name prefix only (4.4)
    theme_colours: chrome_only
    autofit: none

  shapes:

    # ---------------- Region A ----------------
    - {id: zone-a, name: "A/zone", p: P-zone, x: 6, y: 15, w: 70, h: 57,
       label: "Region A (primary)", meta: "10.40.0.0/16", state: deployed}

    - {id: a-hub, name: "A/hub/vnet", p: P-vnet, x: 22, y: 19, w: 38, h: 26,
       label: "vnet-hub-a", meta: "10.40.0.0/23", parent: zone-a, state: deployed}

    - {id: a-insp, name: "A/hub/inspect", p: P-subnet, x: 24, y: 22, w: 34, h: 13,
       label: "snet-inspect", meta: "10.40.0.64/26", parent: a-hub, state: deployed}
    - {id: a-ilb, name: "A/hub/inspect/ilb", p: P-lb, x: 26, y: 26, w: 9, h: 5,
       label: "ILB", meta: ".68", parent: a-insp, state: deployed}
    - {id: a-nva1, name: "A/hub/inspect/nva-1", p: P-nva, x: 37, y: 25, w: 9, h: 7,
       label: "NVA-1", meta: ".70", parent: a-insp, state: deployed}
    - {id: a-nva2, name: "A/hub/inspect/nva-2", p: P-nva, x: 47, y: 25, w: 9, h: 7,
       label: "NVA-2", meta: ".71", parent: a-insp, state: deployed}

    - {id: a-gw, name: "A/hub/gateway", p: P-subnet, x: 24, y: 37, w: 16, h: 6,
       label: "GatewaySubnet", meta: "10.40.0.0/27", parent: a-hub, state: deployed}
    - {id: a-pe, name: "A/hub/pe", p: P-subnet, x: 42, y: 37, w: 16, h: 6,
       label: "snet-pe", meta: "10.40.0.128/26 · 9 zones", parent: a-hub, state: deployed}

    - {id: a-spoke1, name: "A/spoke/1", p: P-vnet, x: 9, y: 50, w: 30, h: 10,
       label: "vnet-app-a", meta: "10.40.8.0/22", parent: zone-a, state: deployed}
    - {id: a-spoke2, name: "A/spoke/2", p: P-vnet, x: 43, y: 50, w: 30, h: 10,
       label: "vnet-data-a", meta: "10.40.12.0/22", parent: zone-a, state: deployed}

    - {id: onprem, name: "A/ext/onprem", p: P-ext, x: 9, y: 64, w: 26, h: 5,
       label: "On-premises", meta: "via ExpressRoute", state: deployed}

    # ---------------- Region B ----------------
    - {id: zone-b, name: "B/zone", p: P-zone, x: 83, y: 15, w: 70, h: 57,
       label: "Region B (secondary)", meta: "10.50.0.0/16", state: deployed}

    - {id: b-hub, name: "B/hub/vnet", p: P-vnet, x: 99, y: 19, w: 38, h: 26,
       label: "vnet-hub-b", meta: "10.50.0.0/23", parent: zone-b, state: deployed}

    - {id: b-insp, name: "B/hub/inspect", p: P-subnet, x: 101, y: 22, w: 34, h: 13,
       label: "snet-inspect", meta: "10.50.0.64/26", parent: b-hub, state: deployed}
    - {id: b-ilb, name: "B/hub/inspect/ilb", p: P-lb, x: 103, y: 26, w: 9, h: 5,
       label: "ILB", meta: ".68", parent: b-insp, state: deployed}
    - {id: b-nva1, name: "B/hub/inspect/nva-1", p: P-nva, x: 114, y: 25, w: 9, h: 7,
       label: "NVA-1", meta: ".70", parent: b-insp, state: deployed}
    - {id: b-nva2, name: "B/hub/inspect/nva-2", p: P-nva, x: 124, y: 25, w: 9, h: 7,
       label: "NVA-2", meta: ".71", parent: b-insp, state: deployed}

    - {id: b-gw, name: "B/hub/gateway", p: P-subnet, x: 101, y: 37, w: 16, h: 6,
       label: "GatewaySubnet", meta: "10.50.0.0/27", parent: b-hub, state: planned,
       badge: PLANNED}
    - {id: b-pe, name: "B/hub/pe", p: P-subnet, x: 119, y: 37, w: 16, h: 6,
       label: "snet-pe", meta: "10.50.0.128/26 · 9 zones", parent: b-hub, state: deployed}

    - {id: b-spoke1, name: "B/spoke/1", p: P-vnet, x: 86, y: 50, w: 30, h: 10,
       label: "vnet-app-b", meta: "10.50.8.0/22", parent: zone-b, state: deployed}
    - {id: b-spoke2, name: "B/spoke/2", p: P-vnet, x: 120, y: 50, w: 30, h: 10,
       label: "vnet-data-b", meta: "10.50.12.0/22", parent: zone-b, state: planned,
       badge: PLANNED}

    # ---------------- External ----------------
    - {id: internet, name: "ext/internet", p: P-ext, x: 66, y: 8, w: 28, h: 5,
       label: "Internet", meta: "inspected egress only", state: deployed}

  connectors:
    # --- peering: spoke to hub (navy, both ends) ---
    - {id: "a-spoke1>a-hub", name: "link/a-spoke1>a-hub", from: a-spoke1, fromSite: 0,
       to: a-hub, toSite: 2, class: peering, route: bent, state: deployed}
    - {id: "a-spoke2>a-hub", name: "link/a-spoke2>a-hub", from: a-spoke2, fromSite: 0,
       to: a-hub, toSite: 2, class: peering, route: bent, state: deployed}
    - {id: "b-spoke1>b-hub", name: "link/b-spoke1>b-hub", from: b-spoke1, fromSite: 0,
       to: b-hub, toSite: 2, class: peering, route: bent, state: deployed}
    - {id: "b-spoke2>b-hub", name: "link/b-spoke2>b-hub", from: b-spoke2, fromSite: 0,
       to: b-hub, toSite: 2, class: planned, state: planned}

    # --- global peering between hubs ---
    - {id: "a-hub>b-hub", name: "link/a-hub>b-hub", from: a-hub, fromSite: 3,
       to: b-hub, toSite: 1, class: peering, route: straight, state: deployed,
       label: "global peering · management and replication only"}

    # --- forced egress: UDR next hop is the ILB frontend (accent) ---
    - {id: "a-spoke1>a-ilb", name: "link/a-spoke1>a-ilb", from: a-spoke1, fromSite: 0,
       to: a-ilb, toSite: 2, class: routing-inspected, route: bent, state: deployed,
       label: "UDR 0.0.0.0/0 → 10.40.0.68"}
    - {id: "a-spoke2>a-ilb", name: "link/a-spoke2>a-ilb", from: a-spoke2, fromSite: 0,
       to: a-ilb, toSite: 2, class: routing-inspected, route: bent, state: deployed}
    - {id: "b-spoke1>b-ilb", name: "link/b-spoke1>b-ilb", from: b-spoke1, fromSite: 0,
       to: b-ilb, toSite: 2, class: routing-inspected, route: bent, state: deployed,
       label: "UDR 0.0.0.0/0 → 10.50.0.68"}
    - {id: "b-spoke2>b-ilb", name: "link/b-spoke2>b-ilb", from: b-spoke2, fromSite: 0,
       to: b-ilb, toSite: 2, class: planned, state: planned}

    # --- ILB to NVA backend pool ---
    - {id: "a-ilb>a-nva1", name: "link/a-ilb>a-nva1", from: a-ilb, fromSite: 3,
       to: a-nva1, toSite: 1, class: routing-inspected, route: straight, state: deployed}
    - {id: "a-ilb>a-nva2", name: "link/a-ilb>a-nva2", from: a-ilb, fromSite: 3,
       to: a-nva2, toSite: 1, class: routing-inspected, route: bent, state: deployed}
    - {id: "b-ilb>b-nva1", name: "link/b-ilb>b-nva1", from: b-ilb, fromSite: 3,
       to: b-nva1, toSite: 1, class: routing-inspected, route: straight, state: deployed}
    - {id: "b-ilb>b-nva2", name: "link/b-ilb>b-nva2", from: b-ilb, fromSite: 3,
       to: b-nva2, toSite: 1, class: routing-inspected, route: bent, state: deployed}

    # --- inspected egress to internet ---
    - {id: "a-nva2>internet", name: "link/a-nva2>internet", from: a-nva2, fromSite: 0,
       to: internet, toSite: 2, class: routing-inspected, route: bent, state: deployed}
    - {id: "b-nva1>internet", name: "link/b-nva1>internet", from: b-nva1, fromSite: 0,
       to: internet, toSite: 2, class: routing-inspected, route: bent, state: deployed}

    # --- tunnel to on-premises ---
    - {id: "a-gw>onprem", name: "link/a-gw>onprem", from: a-gw, fromSite: 1,
       to: onprem, toSite: 0, class: tunnel, route: bent, state: deployed,
       label: "ExpressRoute"}

    # --- private endpoint resolution ---
    - {id: "a-spoke1>a-pe", name: "link/a-spoke1>a-pe", from: a-spoke1, fromSite: 3,
       to: a-pe, toSite: 2, class: privatelink, route: bent, state: deployed,
       label: "privatelink zones"}
    - {id: "b-spoke1>b-pe", name: "link/b-spoke1>b-pe", from: b-spoke1, fromSite: 3,
       to: b-pe, toSite: 2, class: privatelink, route: bent, state: deployed}

    # --- the denied path, drawn deliberately (TD-21) ---
    - {id: "a-spoke1!a-spoke2", name: "link/denied/a-spoke1-a-spoke2",
       from: a-spoke1, fromSite: 3, to: a-spoke2, toSite: 1,
       class: denied, route: straight, state: deployed,
       label: "no direct spoke-to-spoke", marker: slash}

  legend:
    at: {x: 8, y: 74, w: 62, h: 7}
    note: "Arrows show direction of session initiation."
    entries:
      - {class: peering,            text: "VNet peering"}
      - {class: routing-inspected,  text: "Forced egress, inspected (UDR to ILB frontend)"}
      - {class: tunnel,             text: "ExpressRoute / IPsec"}
      - {class: privatelink,        text: "Private endpoint resolution"}
      - {class: denied,             text: "Not permitted"}
      - {class: planned,            text: "Planned, not deployed"}

  callout:
    at: {x: 92, y: 74, w: 60, h: 7}
    text: "Inter-region peering carries management and replication traffic only. It is not an inspected data path."

  source_band:
    at: {x: 6, y: 83}
    text: "Source: as-built topology · generated from model v-, layout v-"

  styles:
    peering:           {colour: navy,    width: 1.5,  dash: solid,   head: triangle, tail: triangle}
    routing-inspected: {colour: orange,  width: 2.0,  dash: solid,   head: none,     tail: triangle}
    tunnel:            {colour: teal,    width: 1.75, dash: sysDash, head: none,     tail: triangle}
    privatelink:       {colour: plum,    width: 1.25, dash: dash,    head: none,     tail: arrow}
    denied:            {colour: crimson, width: 1.75, dash: dashDot, head: none,     tail: none}
    planned:           {colour: navy,    width: 1.5,  dash: dash,    alpha: 0.5,     tail: triangle}
```

### 10.2 Shape count check

22 primary shapes; the six subnet chips count as one third each (TD-06), giving an effective 18. Engineering density, ceiling 42. Legend has six entries, ceiling seven (TD-09). Containment depth: zone > vnet > subnet > resource = four (TD-10). Conformant.

### 10.3 Where the specification depends on something the generator cannot do

| # | Dependency | Why the generator cannot do it | Workaround |
|---|---|---|---|
| 1 | Box sized to fit its label | No text measurement without a rendering engine | Character budget (4.10) asserted at build time; longest string per primitive fixed in the model; build fails rather than clips |
| 2 | `route: bent` bend position | `bentConnector3`'s `adj1` is not exposed by python-pptx | Raw XML: `<a:avLst><a:gd name="adj1" fmla="val 50000"/></a:avLst>`. Default midpoint is acceptable for all but two connectors here |
| 3 | Connector path geometry after attach | python-pptx writes `stCxn`/`endCxn` but does not recompute `a:off`/`a:ext` | Compute and set the straight-line geometry from the two connection-site coordinates **before** attaching. PowerPoint then re-routes on open |
| 4 | Connection site indices for `hexagon`, `flowChartDelay`, `diamond` | Not documented in python-pptx; vary by preset | Hand-validate once in PowerPoint, store the lookup table in the skill, assert the index is in range at build |
| 5 | Arrowheads | Not in the python-pptx API | Raw XML on `a:ln`: `<a:headEnd type="none"/><a:tailEnd type="triangle" w="med" len="med"/>` |
| 6 | `alpha: 0.5` on planned connectors | Line transparency not exposed | Raw XML `<a:alpha val="50000"/>` inside the `a:solidFill` of `a:ln` |
| 7 | `marker: slash` on the denied connector | No such connector decoration exists in OOXML | Emit a separate small shape - a `noSmoking` preset or a rotated `rect` pair - positioned at the computed connector midpoint. It will not travel if the connector reroutes; flagged by the drift check |
| 8 | Connector labels | `Connector` has no text frame (4.5) | Separate `P-chip` textbox at the computed midpoint, named `link/<id>/label`, with a drift check comparing its centre to the connector midpoint on every rebuild |
| 9 | Badge attached to its parent | No grouping, by policy (4.4) | Position by rule at generation; conformance check flags a badge more than 0.6u from its parent's top-right |
| 10 | Z-order (zones behind, connectors above fills, chips above connectors) | No z-order API; shapes render in `spTree` document order | Emit in strict order: zones, containers, subnets, resources, connectors, chips, badges, furniture. Never append later |
| 11 | Theme creation | python-pptx cannot create a theme or a layout | Open a `.potx` that already has both. Hard dependency, listed as input #3 in Section 9 |
| 12 | Alt text | Not exposed in most versions | `shape._element._nvXxPr.cNvPr.set('descr', f"{label}. {meta}")` |
| 13 | Font embedding | python-pptx cannot embed fonts | Use theme fonts present on the client SOE, or accept documented fallback |
| 14 | Vendor icons | Licensed binaries not held (`[CANNOT]`) | Icon-free, which suits an architecture review. If icons are required, client supplies EMF and the generator places them at a fixed offset inside each primitive |
| 15 | Region-B facts mirrored from Region A | Symmetry hallucination risk (FM-07) | Every Region B element carries its own source citation in the model. Any B element citing an A-only source fails the build |

Items 2, 5, 6, 7, 10 and 12 all resolve to the same workaround: python-pptx's `_element` escape hatch to raw `lxml`. Budget for a small XML helper layer in the generator - roughly 150 lines - and treat it as a first-class part of the build, not as a patch.

