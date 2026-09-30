# APM Detailed Design Document - authoring standard

**This is the standard for every design document produced in this project.** It is not a style preference; it is the depth bar. The test a document must pass:

> **A build engineer can construct the solution from this document without asking the designer a question, and an approver can say yes without asking for more information.**

If either of those is not true, the document is not finished.

---

## 1. Why this standard exists

Design documents fail approval for two reasons, and both are avoidable:

1. **Not enough detail to build from.** Sections describe intent ("traffic is inspected on egress") instead of configuration ("`0.0.0.0/0 → 10.100.0.68`, applied to `snet-app-prod` and `snet-data-prod`, BGP propagation disabled"). The build engineer then designs the missing part themselves, and the delivered solution diverges from the approved one.
2. **The reviewer has to hunt.** Controls are implied rather than mapped, risks are omitted rather than accepted, and the contentious decision is buried instead of argued. Reviewers reject what they cannot verify quickly.

The standard removes both. Every section states what it must contain, then contains it.

---

## 2. The three rules

### Rule 1 - Show the settings, not the intent
Every configurable thing gets its actual value in a table: the setting name exactly as it appears in the product, the value, and the rationale. Examples of the bar:

- Not "MFA is enforced for admins" → **policy name, scope group, exclusions, grant control, session control, and the report-only/enforced state.**
- Not "the network is segmented" → **VNet names, address space, subnet prefixes with masks, the NSG on each subnet, the route table with next-hop IP, the DNS resolver IP, and the named FQDNs allowed outbound.**
- Not "we monitor for suspicious activity" → **the event, its log source, the alert severity, the destination, and the owner who responds.**

### Rule 2 - Diagram every structural idea
Prose describes; diagrams let a reader hold the whole shape at once. Every design document carries figures for: business capability impact, system context, interface sequence, technology placement, network topology, deployment path, information flow, and security zones. Diagrams use the design system's **diagram kit** (`tokens/diagrams.css`) so every document in the program looks like the same program.

### Rule 3 - Logical order, front-loaded argument
Sections run business → application → technology → information → cyber → availability → service management, because each layer answers the questions the previous one raises. Within a section, state the position first and the supporting detail after. Anything a reviewer would challenge - BYOD access, standing privilege, an unmet requirement, an accepted risk - is argued **openly and early**, never left to be discovered.

---

## 2a. Write like a person, not like a machine

**Canonical source for this rule.** The tier standards cross-reference it rather than restating it.

These documents are read by people deciding whether to approve work, and by engineers who have to build from them. Write the way a senior architect writes to a colleague: plainly, in the first sentence, with no throat-clearing.

**Cut on sight:**

| Do not write | Write |
|---|---|
| "It is important to note that the policy is report-only" | "The policy is report-only" |
| "This section aims to provide an overview of..." | Just give the overview |
| "leverage", "utilise", "facilitate", "enable" (as filler) | "use", "let", "do" |
| "robust", "seamless", "comprehensive", "holistic", "cutting-edge" | Nothing. Say what it does |
| "In order to" | "To" |
| "Additionally", "Furthermore", "Moreover" opening a paragraph | Start with the point |
| "It should be noted", "Please note", "It is worth mentioning" | Delete the phrase, keep the fact |
| "delve into", "dive deep", "unpack" | "cover", "set out" |
| "a number of", "various", "several" where a count is known | The count |
| "may potentially", "could possibly" | "may" |
| Three adjectives where one works | One adjective |

**Also avoid:** the rule-of-three flourish ("faster, safer, and more compliant"), a paragraph that restates its own first sentence at the end, and a closing sentence that summarises what the reader has just read.

**Do write:** short sentences. Active voice with a named actor ("APM Cyber Security approves the exclusion", not "the exclusion is to be approved"). Concrete nouns. A number instead of an adjective. Contractions are fine in guidance text and out of place in a settings table.

The test: read the paragraph aloud. If you would not say it to a colleague standing at a whiteboard, rewrite it.

---

## 2b. Cross-references name the section and link to it

**Canonical source for this rule.** Every reference to another section gives **both its number and its name**, and in the built `.docx` it is a **live internal hyperlink** the reader can click.

Never a bare number ("see 5.3"), never a name with no number ("see the Network section"), never a section symbol.

**In the DSL, write the marker and nothing else:**

```
P |Egress follows the pattern set out in [[5.3.4]] without variation.
P |The test set is in [[B.6]] and the placement decision in [[Appendix B]].
TR |DR-006||Egress path||Approved||...||[[5.3.4]], [[5.3.8]]
```

`docx-builder.js` resolves `[[5.3.4]]` to the heading's full text - "5.3.4 Routing" - and wraps it in a hyperlink to a bookmark on that heading. **The name is never hand-typed**, so renaming a heading updates every reference to it and a reference can never go stale. Markers work in body text, bullets, numbered steps and table cells alike.

Accepted keys: `5`, `5.3`, `5.3.4`, `B.6`, `Appendix A`. The builder reports `UNRESOLVED [[xref]]` for a key with no matching heading - treat that as a build failure, not a warning. Where the master carries a duplicate section number (the tier-2 template has two 8.2s), the first occurrence gets the bookmark and the builder says so.

**References to the companion document** in another tier are not links, because they leave the file. Name the document and the section: "Technical Configuration Document, 12.6". Keep those as plain text.

---

## 3. Section structure and depth

Follow the APM master (`templates/detailed-design/authoring/apm-master.docx`) exactly - its numbering, its heading styles, its cover set. Do not invent sections or renumber.

| Section | Must contain | Depth test |
|---|---|---|
| 1 Introduction | Purpose, the decision being asked for, audience by group and what each is asked for | A reader knows in one page whether this concerns them |
| 2 Overview | Plain-language description, in/out of scope, guiding principles, assumptions with IDs | A scope disagreement can be settled by reading it |
| 3 Business Architecture | Capability impact heatmap, requirements with traceability, gap treatment | Every requirement points to the section that meets it |
| 4 Application Architecture | System context diagram, component inventory with status, interface diagram, interface catalogue with IDs | The build backlog can be derived from 4.2 |
| 5 Technology Architecture | Component standards, integration patterns, **network build-level detail**, deployment pattern | See §4 below - this is the section that fails most often |
| 6 Information & Data | Entity model with custodians, classification with the control that follows, reporting | Every entity has a classification and a named custodian |
| 7 Cyber & Security | Control mapping to standard, trust boundaries, threats and controls, risk register, compliance alignment | Every arrow in the zone diagram has a named policy permitting it |
| 8 Availability & DR | Service tier with targets, availability by component, DR scenarios with validation | Single points of failure are named, not hidden |
| 9 Service Management | Support tiers, monitoring events with owners and actions, validation/test plan | Every alert has an owner; every test has a binary pass criterion |
| Appendix A | Every acronym used | Including the ones you consider obvious |

### Guidance boxes
The template edition of the document carries a **navy Guidance box** at the head of each section stating what the section must contain. In a real design document these are deleted; in the template they are the teaching. Keep them in any document circulated as an exemplar.

---

## 4. The network section - the depth bar in full

§5.3 is under-specified more often than any other section and is the most expensive to get wrong. It must include, as tables:

1. **Naming convention** - the pattern and worked examples.
2. **Address plan** - every VNet with address space, region and purpose, *including reserved and unallocated ranges*, and the on-premises ranges advertised.
3. **Subnet allocation** - subnet name, prefix with mask, the NSG applied, purpose and any platform constraint.
4. **Routing** - route table, route, next hop **as an IP address**, and which subnets it is applied to. State whether BGP propagation is on or off and why.
5. **DNS** - the resolver IP, every private DNS zone linked, and conditional forwarders in both directions.
6. **Egress control** - the actual FQDNs permitted with ports, and the default deny. Never "required Microsoft endpoints".
7. **NSG baseline** - inbound and outbound rule intent per subnet, plus flow-log configuration and retention.
8. **Connectivity and resilience** - circuit bandwidth, peering type, failover behaviour, BGP ASN, and the latency/throughput budget.
9. **A build-level diagram** carrying the CIDRs, subnet names and the firewall next-hop IP on its face.

If a build engineer would have to ask a question, the section is not finished.

---

## 5. How to build one

The pipeline lives in `templates/detailed-design/authoring/`.

| File | Purpose |
|---|---|
| `apm-master.docx` | The APM master. Cover set, document control, Confidentiality & Disclaimer, APM Contact, Contents, and the real heading styles. Never rebuild these by hand. |
| `docx-builder.js` | Assembles the document. Splices generated body content into the master at the body `Heading1` "1. Introduction" paragraph, preserving everything before it and the final `sectPr`. |
| `content-example.txt` | The worked-example content file - the reference for both the DSL and the expected depth. |
| `example-figures.html` | The nine example diagrams, built on the diagram kit, with a Tweaks panel (accent, zone style, corners, density, width, annotation toggles). Snapshot each `.dgm-fig` at 2× into `figs/`. |
| `figs/*.png` | Rendered example figures at 2×. |

### Content DSL
One tag per line, `TAG |content`. Bold with `**…**`.

```
H1 |1. Introduction              top-level section (starts a new page)
H2 |1.1 Purpose                  sub-section
H3 |5.3.2 Address plan           sub-sub-section
P  |Body paragraph.              supports **bold**
B  |Bullet item                  consecutive B lines form a list
NUM|Numbered item                auto-numbered, resets on any other tag
GD |Guidance text                navy "GUIDANCE" callout - template editions only
BQ |Note text                    orange callout - verification tasks, deployment notes
FIG|file.png|Caption|width|height
TBL|2400,3200,3760               starts a table; widths in dxa, must total ~9360
TH |Col A||Col B||Col C          header row (navy, white text, repeats across pages)
TR |Cell||Cell||Cell             body row (zebra shading applied automatically)
END                              ends the table
```

### Build steps
1. Write the content file using the DSL, following the section structure above.
2. Build the figures in `example-figures.html` (or a copy) using the diagram kit classes, then snapshot each `.dgm-fig` at 2× to PNG.
3. Call `buildDocx` from `docx-builder.js`, passing the master, content file, figure directory, output path, and the cover metadata (`fields`, `history`, `relPrefix`, `imgPrefix`, `idBase`). Use a distinct `relPrefix`/`imgPrefix`/`idBase` per document so relationship IDs never collide.
4. In Word, update the Contents field.

### Traps already hit - do not repeat
- **Doubled bullets.** The master's `ListParagraph` style already supplies a bullet glyph. Use plain indented paragraphs with a manual `•`, never `ListParagraph`.
- **`pStyle` self-closes with a space** in this master (`<w:pStyle w:val="Heading1" />`). Regex that assumes `"/>` will not match.
- **Cutting on the first "Introduction"** hits the *Contents* entry and deletes the TOC. Splice on the paragraph whose `pStyle` is `Heading1` *and* whose text contains "Introduction".
- **Namespaces.** Add `xmlns:wp` and `xmlns:r` to the root `w:document` element before inserting images.
- **Step/label collisions.** In sequence diagrams, place the step circle at the wire start and the label after it; overlapping them clips both.
- **Opaque wire labels crossing into boxes.** `.dgm-lbl` has a solid background, so a label whose right edge crosses the box it annotates silently eats the first characters of that box's heading (`AzureBastionSubnet` rendering as `zureBastionSubnet`, `API gateway` as `PI gateway`). The numeric rule: **measure the gutter** - the gap between where one column's boxes end and the next column's boxes begin - and keep every label narrower than it. Shorten the label text; the accompanying table already carries the full detail.
- **Footnotes under tall columns.** `.dgm-note` is absolutely positioned; check it clears the bottom box of every column, not just the shortest one.
- **A buried arrowhead is a headless arrow.** An arrow whose tip is inside its target box is normal only while the marker itself stays visible. The marker footprint is the last ~11px, so a tip more than ~11px inside an opaque box renders as a plain line that stops dead with no readable direction. `qa.occlusionScan()` tests the head region separately for exactly this reason - an earlier version short-circuited on "tip is inside the target" and passed two headless arrows straight into a shipped document. Terminate arrows just short of the box edge.
- **Re-snapshot after any figure edit, then rebuild the document.** The PNGs are embedded, so fixed HTML with stale PNGs still ships the defect. Note that a snapshot taken immediately after an edit can capture a stale render - confirm the live DOM with a quick `eval_js` on the element's inline `top`/`left` before trusting the capture, and view the written PNG under a fresh filename if you need to check it visually twice in a row.
- **Column gaps must be wide enough to draw in.** Adjacent columns 24px apart cannot carry a readable connector: the arrowhead is 11px, so the whole arrow becomes a stub that reads as pointing the wrong way. Allow at least 50px between columns for any connector, and route anything that must reach a further column *around* the intervening boxes with un-arrowed segments (only the final segment carries the marker), never straight through them.

**Every connector style must be decodable.** A figure that uses two or more arrow styles needs a `.dgm-legend` naming each one, and the legend must cover every style actually present - `qa.legendScan()` compares the distinct stroke + dash combinations of the arrowed lines against the legend entry count. Sequence lifelines are un-arrowed and are correctly ignored. This caught two figures publishing a three-entry legend while quietly using a fourth style, and five figures using two meaning-bearing styles with no legend at all.

**A figure must not contradict the document's own tables.** Geometry can assert something the prose denies: an arrow drawn from the authenticator past the client column to the identity provider claims CTAP2 runs key-to-Entra, contradicting the interface catalogue's INT-01 (key to client) and INT-02 (client to Entra). Likewise a "peering" arrow between a Microsoft public endpoint and an APM hub VNet is simply wrong, because peering is VNet-to-VNet. No scan can catch these; read every figure against §4.4 and §5.3 before shipping.

### Always run the QA checks before snapshotting
Load `templates/detailed-design/authoring/qa-checks.js` in the figures page and call **`qa()`** in the console. It runs six scans and returns `{ ok }` - ship only when `ok === true`:

- **`qa.overlapScan()`** - element collisions inside every `.dgm-fig` (labels over boxes, steps over labels, footnotes over columns)
- **`qa.contrastAudit()`** - WCAG AA failures across the **whole page**, enumerating every text-bearing element, resolving `oklab()`/`color-mix()` and compositing translucent and gradient backgrounds
- **`qa.overflowScan()`** - anything spilling outside its figure canvas
- **`qa.escapeScan()`** - literal escape sequences, and em dashes, in rendered copy
- **`qa.orphanScan()`** - wire labels more than 80px from any connector, which read as floating text rather than annotations
- **`qa.legendScan()`** - connector styles used but not explained in that figure's legend
- **`qa.occlusionScan()`** - arrowed lines routed behind opaque boxes, which render as a floating arrowhead with no visible tail

Do not hand-write these checks or maintain a selector list - a hand-written list missed `.dgm-step` (white on orange, 2.22:1) through two rounds, and running the audit on the figures only left 40 failures in the document body. `qa()` on the figures page and `qa.contrastAudit()` on the document both need to be clean.

What the checks have caught, so you know what to expect: opaque `.dgm-lbl` backgrounds crossing into the box they annotate and eating its heading's first characters; a footnote crossing the bottom box of a tall column; `#8A90A5` secondary text at 2.91:1; orange section numbers on white at 2.04:1; a navy `<h1>` on the navy cover at 1.0:1 (element selectors beat inheritance - the global stylesheet sets `h1 { color: var(--text-strong) }`); white on red/green status pills at 3.4–4.4:1; and a brand ribbon PNG that was 78% opaque white and painted a slab over the cover.

Compliant substitutions now in use: secondary text `#545F6E` (6.4:1 on white), orange text on white `--apm-orange-800` `#95500A` (6.1:1), zone labels `--apm-orange-800`, step markers `#4A2705` on orange, status pills `#C63A3A` / `#1E7A44`. Orange on the navy cover is fine at 6:1 - **classify by background before replacing, never blanket-swap a hex.**
**Colour rules the checks enforce.** Diagram body text is 11–13px, at the AA bar of 4.5:1 with no margin. Never author small diagram text against `--text-subtle`, `--text-muted` or `--apm-navy-300`; **`--apm-navy-400` (#41507F) is the floor** - 7.3:1 on white, 6.9:1 on `--neutral-100`. On the orange heat cell and step markers use dark ink (`#4A2705`), never white - white on `--brand-primary` is 2.0:1. Keep every accent `color-mix` body value at roughly 25% accent / 75% ink, and remember the Tweaks override block is in the cascade even when Tweaks is off, so a low-contrast mix there silently beats the authored token.

**Where the reported coordinates map to.** `aLeft`/`aRight`/`aTop` in the overlap output are relative to the figure box, so they map straight onto the inline `left`/`top` values in the source. When a label crosses into a box, measure the **gutter** - the gap between where one column's boxes end and the next column's begin - and shorten the label text to fit; the accompanying table already carries the full detail.

- **Build one document per `run_script` call.** Two large documents in one call exceeds the execution budget and nothing is written.

---

## 6. Diagram conventions

Use `tokens/diagrams.css` (see the "Architecture diagram kit" card in the Design System tab). Vocabulary:

- `.dgm-fig` - fixed-size canvas · `.dgm-cap` - navy caption bar with `EXAMPLE` tag and section reference
- `.dgm-zone` (`.is-accent`, `.is-boundary`) - dashed groupings with notched labels
- `.dgm-box` (`.is-navy`, `.is-accent`, `.is-soft`, `.is-centred`) - the nouns; title plus one line
- `.dgm-chip` - attributes inside a box · `.dgm-lbl` (`.is-accent`) - wire labels · `.dgm-step` - sequence markers
- `.dgm-heat` (`.is-high`, `.is-medium`, `.is-low`) - capability impact · `.dgm-legend`, `.dgm-key`, `.dgm-note`

Rules: one SVG overlay per figure sized to the stage viewBox so arrows share the box coordinate space; accent colour marks the element under design; navy marks platform and target systems; soft grey marks supporting or out-of-scope elements. Snapshot at 2× for Word and PDF.

---

## 7. Approval checklist

Before circulating, confirm:

- [ ] Every requirement in §3.3 has a section reference in the "Met by" column
- [ ] Every component in §4.2 has a status: new, changed or unchanged
- [ ] Every interface in §4.4 has an ID, and every arrow in the §4.3 diagram has a matching row
- [ ] §5.3 passes the nine-point network test in §4 above
- [ ] Every risk has a likelihood, an impact and a treatment; every ACCEPT names who accepts it
- [ ] Every monitoring event in §9.2 has an owner and an action
- [ ] Every test in §9.3 has a pass criterion that is objectively true or false
- [ ] Every acronym is in Appendix A
- [ ] The contentious decision is argued in the document, not left for the reviewer to find
- [ ] The overlap scan in §5 returns `total: 0` for every figure, the contrast audit returns `fails: 0` **over the whole document (`*`, not just `.dgm-fig *`)**, and the PNGs were re-snapshotted after the last figure edit
- [ ] Contents field updated in Word
