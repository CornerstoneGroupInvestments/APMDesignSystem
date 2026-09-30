# Design register

Every design document produced for this program. **One row per document, one folder per subject.** Everything belonging to a design lives in its folder: the source, the figures, the built Word document, any configuration it defines, and any superseded versions. `content.txt` is the source of truth; the `.docx` in `output/` is a build artefact and can always be regenerated from it.

Authored to `guidelines/detailed-design-standard.md` on the pipeline in `templates/detailed-design/authoring/`.

**A design that needs to be worked on outside this project is bundled into `exports/<slug>/`** - the design folder plus only the guidelines, reference material, policy sources and pipeline files it cites, with its own `CLAUDE.md`. See `exports/README.md`.

**Second pipeline for new designs:** `templates/detailed-design-v2/authoring/` builds a 3-tier document set (Design Definition -> Detail Design Document -> Technical Configuration Document) on APM's own native templates, used in exact form. Existing designs below stay on the single-DDD pipeline; a design built on the 3-tier pipeline is noted as such in its row and lists three built documents, not one. See that folder's `README.md` for conventions (N/A rule, Decision Register scope, folder layout).

## Register

| Design | Slug | Version | Status | Approver | Built document | Built |
|---|---|---|---|---|---|---|
| YubiKey Phishing-Resistant Authentication | `yubikey` | V0.1 | Draft - for Cyber Security review | APM Cyber Security | `designs/yubikey/output/APM_DDD_YubiKey_Phishing-Resistant_Authentication_V0.1.docx` | 27 Jul 2026 |
| Participant Kiosk (was Job Seeker Kiosk) | `participant-device` | V1.6 | Draft - for review | APM Cyber Security | `designs/participant-device/output/APM_DDD_Participant_Kiosk_V1.6.docx` | 14 Aug 2026 |
| ES Participant Kiosk - Technical Configuration Document | `participant-device` | V2.8 | Draft - for build | APM Solution Engineer | `designs/participant-device/output/APM_TCD_ES_Participant_Kiosk_V2.8.docx` | 10 Sep 2026 |
| Standard User SOE on AVD - Detail Design Document | `standard-user-avd` | V1.5 | Draft - for review | APM Cyber Security | `designs/standard-user-avd/output/APM_Detail_Design_Standard_User_AVD_V1.5.docx` | 10 Sep 2026 |
| Standard User SOE on AVD - Technical Configuration Document | `standard-user-avd` | V1.0 | Draft - for build | APM AVD Build Engineer | `designs/standard-user-avd/output/APM_TCD_Standard_User_AVD_V1.0.docx` | 23 Sep 2026 |
| ES Participant Kiosk - Detail Design Document | `participant-device` | V1.7 | Draft - for review | APM Cyber Security | `designs/participant-device/output/APM_Detail_Design_ES_Participant_Kiosk_V1.7.docx` | 10 Sep 2026 |
| ES Participant Kiosk - Design Definition | `participant-device` | V1.1 | Draft - for review | Digital Transformation and Architecture | `designs/participant-device/output/APM_Design_Definition_ES_Participant_Kiosk_V1.1.docx` | 13 Aug 2026 |
| ES Participant Kiosk Solution - **as-built record** | `participant-device` | V2.4 | Issued - as-built record | Digital Operations | `designs/participant-device/output/APM_AsBuilt_ES_Participant_Kiosk_Solution_V2.4.docx` | 10 Sep 2026 |
| Participant Kiosk Conditional Access - as-built record | `participant-device` | V1.0 | Issued - as-built record | APM Cyber Security | `designs/participant-device/output/APM_AsBuilt_Participant_Kiosk_Conditional_Access_V1.0.docx` | Aug 2026 |

**An as-built record is a fourth kind of document, and it is not a design tier.** A design says what to build; an as-built says what is configured, where each object lives, what maintenance it needs, and what may not be changed without a change record. Source: `content-asbuilt.txt` (solution-wide) and `content-asbuilt-ca.txt` (Conditional Access), both built on the generic `apm-master.docx`. It is updated in the same change as the configuration it records, never on a review cycle. Reserved build values: `rAB`/`abpkFig`/`7300` (solution as-built).

**Build an as-built on `templates/detailed-design-v2/authoring/docx-builder.js`, not the tier-1 builder.** The two builders are otherwise identical, but only the v2 one resolves `[[x.y]]` cross-references; the tier-1 builder emits the literal `[[15]]` into the document text and reports nothing, so the failure is silent and survives every text-level assertion that does not grep for `[[`. It works against `apm-master.docx` unchanged. Assert `xrefs=n bookmarked` in the build log and grep the built text for `[[` before shipping.

**Technical Configuration Documents follow `guidelines/technical-configuration-document-standard.md`** and **Detail Design Documents (tier 2) follow `guidelines/detail-design-document-standard.md`** (sources: `content-technical.txt`, `content-detail.txt`, built on the matching master in `templates/detailed-design-v2/authoring/`). Read the relevant standard before starting or revising either - each carries its master's verbatim heading map and cover-field values. Scripts and pasteable values live in the design's `config/` folder and are reproduced in full in the tier-3 appendices.
*(Kiosk Decommissioning is a Change Request, not a design - see `change-requests/kiosk-decommission/CR-Kiosk-Decommissioning.md` and `change-requests/README.md`)*
| Job Seeker Kiosk - **superseded by Participant Kiosk** | `participant-device/history/job-seeker-kiosk-v1.6` | V1.6 | Superseded | APM Cyber Security | `designs/participant-device/history/job-seeker-kiosk-v1.6/output/APM_DDD_JobSeeker_Kiosk_V1.6.docx` | 31 Jul 2026 |
| Developer SOE | - | V0.1 | Draft | - | `uploads/03_DDD_Developer_v0.1_DRAFT.md` (pre-standard) | - |
| Privileged Access (PAW) | - | not started | - | - | - | - |
| ES take-home device | - | not started | - | - | - | - |
| Network foundation | - | not started | - | - | - | - |

Job Seeker Kiosk V1.6 was transposed from the author's Word draft (`uploads/JobSeeker_Detailed_Design_V1.6.docx`) via `docx-to-dsl.js`; the source's text-arrow pseudo-figures and control-gate tables were replaced with six figures on the diagram kit. See `designs/job-seeker-kiosk/transposition-notes.md`. V1.0 (approved 23 Jun 2026) remains the last approved baseline of that design.

**The Job Seeker Kiosk design is superseded.** Participant Kiosk V1.0 replaces it in full: device-only identity in the APM corporate tenant (no per-device Entra ID accounts, no credential pipeline), automatic logon to a Windows-managed local account, Windows 11 Enterprise instead of IoT LTSC, LibreOffice instead of Office for the web, device-based licensing, Microsoft 365 access blocked outright, and a restart-based session purge. The kiosk folder stays as the record of what was approved and what the decommissioning change request removes. See `designs/participant-device/transposition-notes.md` for the full delta and what was carried across verbatim.

The folder slug `participant-device` predates the rename to Participant Kiosk (the name was aligned to APM's approved participant wallpaper artwork). The slug is retained so figure, output and config paths stay stable; the document, its Intune objects and its prose all say Participant Kiosk, and device names are `APM-PK-[RRR][LLLL]`.

**Standard User SOE on AVD is on the 3-tier pipeline at tiers 2 and 3.** `content-detail.txt` (Detail Design) and `content-technical.txt` (Technical Configuration Document, built on `technical-master.docx`, reserved values `rST1`/`stFig`/`16800`) are the sources; tier 1 is not written. Subnet CIDRs, routes, DNS, network security group rules, the firewall egress list, Defender exclusion paths and the test plan live in the TCD only (review comment #82). **V1.2 is a rewrite, not a revision** - it answers an 11-comment stakeholder review (`review-responses-v2.0.md`) and is built on the APM template's exact 33 headings, with the Decision Register and Test Environment as Appendix A and Appendix B. The document control table carries two rows, V1.0 and V1.2, because a version row records a change to the design and not to the document's authoring. The V1.x builds, the reviewed V1.0 with its comment threads and the superseded source are in `designs/standard-user-avd/history/`; the support-overview knowledge base article is in `designs/standard-user-avd/kb/` and is not yet reconciled to the current design. Reserved build values: tier 2 `rR`/`ddFigSU8`/`6400` (V1.2).

The remaining pre-standard drafts were authored before `guidelines/detailed-design-standard.md` existed. They are not yet on the pipeline - converting one means creating its `designs/<slug>/` folder and porting the content into the DSL.

## Folder convention

Everything for a subject lives under its slug. Nothing about a design lives at the project root.

```
designs/<slug>/
  content.txt              the document, in the DSL - THE source of truth
  solution-index.html      the resource index for this solution - REQUIRED, see below
  figures.html             the figures, on the diagram kit; loads qa-checks.js
  figs/*.png               figures snapshotted at 2x, named for what they show
  output/*.docx            the built Word document(s) - build artefacts, regenerable
  config/                  optional: configuration this design defines (policy XML, CSV exports)
  history/                 optional: superseded or pre-standard versions, kept for traceability
  kb/                      optional: knowledge base articles belonging to this solution
  research-notes.md        optional: sourcing, vendor facts, verification tasks
  transposition-notes.md   optional: what changed when importing an authored draft
```

**Name figures for their subject, not their position.** `credential-pipeline.png`, not `f1.png` - a positional name goes stale the moment a figure is inserted, and it cost this project a mislabelled pair (the YubiKey `f7`/`f8` were the wrong way round relative to their captions for two versions).

## Every design gets a solution index

`designs/<slug>/solution-index.html` is a one-page, on-brand resource index for the solution: every artefact by kind, with its path, and what each one is for. It is the page someone opens to find a resource, cite it or lift it out without reading the whole design. **Build it as soon as the design has a folder, and update it in the same change as any version bump.** Reference implementations: `designs/participant-device/solution-index.html` and `designs/standard-user-avd/solution-index.html`.

It carries a `@dsCard` marker on the first line so it appears in the Design System tab, links `../../styles.css`, and uses the same section set every time:

| Section | Holds |
|---|---|
| Hero + rule bar | The solution in three sentences, programme, use-case number, and the one load-bearing rule a reader must not miss |
| Design documents | One row per tier: source of record, version, the question it answers, who approves. A tier that is not written says so, with the master it would be built on |
| Diagrams | `figures.html` as the source, then one row per figure naming the section that cites it |
| Objects this solution creates | Azure, Entra ID and Intune objects by name, from the design's naming section - never a second copy of the values, a pointer to the one home |
| Test environment and validation | Where it sits, what it cannot prove, and the tests that prove a control rather than a feature |
| Policy, standards and reference sources | Facts the design cites but does not own, and what it takes from each |
| Authoring pipeline | The masters, the builder, the checks, the reserved `relPrefix`/`imgPrefix`/`idBase` |
| Lifting the solution out | The `exports/<slug>/` bundle, what stays behind, and one settled fact worth surfacing |
| Open items | One row per item with a **named owner**. Ordered so the items that gate the build come first |

Drop a section that has nothing in it rather than filling it. Never restate a configuration value the design owns: name the object and point at the section that specifies it.

**Never restate a count as an absolute unless you have just verified it.** "The only divergence between the channels" went stale twice in two versions of one design: first when a second divergence was added, then when a fourth was. Either name the members and let the count follow, or drop the absolute. The same applies to "the one place", "nowhere else" and "exactly n".

**Append a register row immediately before the table's closing tag, never anchored on a sibling row.** Using an existing row as the `str_replace` anchor prepends rather than appends. This has now happened three times: DR-019/DR-020 between DR-015 and DR-016, A-09 between A-02 and A-03, and open item 7 between 5 and 6 in CN-PK-01 - each time from the same reflex of reaching for the nearest unique string. The unique string to reach for is the table's `END` line, or `</tbody>` in HTML.

**A count check cannot see a permutation, so assert the sequence.** The edit that misplaced open item 7 was verified with `boxes === rows` (7 === 7) and list-tag balance, and both passed. Every ordered column must equal its own sort: register IDs per prefix, record-sheet cells, `Stage n` and `Test n` headings. One pass, one boolean per sequence. An assertion must end in a boolean, and it must be the boolean that can fail.

**Check for a cross-reference repeated inside one sentence.** `[[5.4]] and [[5.4]]` resolves to the same heading twice and ships as "5.4 Technology component Deployment Patterns and 5.4 Technology component Deployment Patterns". `scan()` sees two valid xrefs and passes. It means two different subsections were intended: name them.

**A count stated in one section about a table in another section is checked by hand, every version bump.** `consistency-check.js`'s COUNT check only compares a stated count against the table immediately below it, so "All 17 tests pass" in section 9, describing the Appendix B test set, was invisible to it and survived five versions. Sweep the DSL itself, not just the index: grep for `\d+ (tests|controls|policies|profiles|requirements|figures|objects|interfaces)` plus the spelled-out numbers, and reconcile each hit against the table it names. Register sizes come from counting `^TR \|(PREFIX-\d+)`, so the comparison is mechanical. Heading lines produce false positives ("2.3 Assumptions" reads as "3 assumptions") - read each hit.

**On a version bump, the sync is not finished at the index.** Every file that states a version or a count is in scope: the design's companion `.md` files (`research-notes.md`, `review-responses-*.md`), the register in this file, and the bundle's `README.md` **and** `CLAUDE.md`. Two failure modes live in prose rather than in the DSL, so no scan catches either: a version claim that has moved on, and **a recommendation the bump has since implemented** - a note reading "this should be carried into the document" when it already was, which sends the next reader to re-do settled work. Grep every one of those files for the previous version string and for the counts that changed.

**A stale-claim sweep flags its own rules.** The guard text above quotes retired phrases as examples, so a grep for them hits this file and the bundle's `CLAUDE.md` legitimately. Scope the sweep to shipped content and read each hit before acting on it: a phrase inside a rule that says "never write this" is the rule working, not a defect.

**On every version bump, re-sync the index against the source in the same change.** `consistency-check.js` reads the DSL and cannot see the index, so a stale index ships silently. Check five things against `content.txt`: every section number the index cites still exists (a heading renumber is the usual cause), the highest `DR-` number, the set of open-item IDs, any stated count (variations, figures, tests), and **any count of objects the design creates** - Conditional Access policies, subnets, Intune profiles, security groups. The last one is the hardest to see, because a stale count is a bare word like "three" rather than an ID a grep can anchor on, and it usually survives because the assumption that carried it was deleted. Also re-read the index in the document's own voice: a phrase like "section 7 argues" is authoring commentary and does not belong in either file.

**When a register row is reworded in `content.txt`, re-copy the row text into the index. Do not edit it by hand.** Hand-editing is what leaves the index arguing the old position while the document argues the new one, and the two sit on the same screen. Removing a row means renumbering the IDs after it in both files, and any risk-treatment cell that cites one.

**Adding a card to a fixed-column grid breaks the layout silently.** The "Lifting the solution out" grid was `repeat(3,1fr)`; a fourth card left one alone on a second row with 570px of dead space beside it. Use `repeat(auto-fit,minmax(190px,1fr))` so the count can change.

This is exactly how a V1.2 index survived a V2.0 rewrite claiming six variations, a section 5.1.5 that no longer existed, and three enforcement changes when the design creates two policies.

**A bundle in `exports/<slug>/` tracks the design.** Re-copy the sources, figures, built document and index, and update the bundle's own `README.md` and `CLAUDE.md` version, recipe output name and open-items table.

## Rebuilding a document

1. Edit `content.txt`.
2. If figures changed: open `figures.html`, run `qa()` in the console - it must return `ok: true` - then re-snapshot each `.dgm-fig` at 2× into `figs/`.
3. Build (one document per `run_script` call):

   ```js
   const src = await readFile('templates/detailed-design/authoring/docx-builder.js');
   const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
   const { buildDocx } = await import(url);
   await buildDocx({ readFileBinary, readFile, saveFile, log },
     'templates/detailed-design/authoring/apm-master.docx',
     'designs/<slug>/content.txt',
     'designs/<slug>/figs/',
     'designs/<slug>/output/<Output_Name>.docx',
     { relPrefix: 'rIdXXX', imgPrefix: 'xxxfig', idBase: 9800,  // unique per document
       fields: { … }, versionRows: [ ['V1.0','1/1/26','Author','Note'], … ] });
   ```

4. Update this register - version, status and built date.
5. In Word, update the Contents field.

`relPrefix` / `imgPrefix` / `idBase` must be unique per document or relationship IDs collide.

## Importing an existing Word draft

`templates/detailed-design/authoring/docx-to-dsl.js` converts an authored `.docx` into the DSL - heading levels renumbered 1 / 1.1 / 1.1.1 / 1.1.1.1, bold as `**`, **yellow highlight as `==`**, bullets and numbered lists, tables including `gridSpan` and multi-paragraph cells (`<br>`), inline images as `FIG` lines. It also lifts the cover fields and version history off the source cover.

```js
const src = await readFile('templates/detailed-design/authoring/docx-to-dsl.js');
const { unzipDocx, docxToDsl } = await import(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
const parts = await unzipDocx(await readFileBinary('uploads/Some_Draft.docx'));
const r = docxToDsl(parts, { figNames: { 'image7.png':'network-zones.png' }, captions: { 1:'Figure 1. …' } });
await saveFile('designs/<slug>/content.txt', r.dsl);
log(r.warnings, r.cover);
```

Always read `r.warnings` - it reports Word comments and tracked deletions that did **not** come across, and any figure it had to invent a caption for. Then re-anonymise people to roles (the converter does not), and check cross-references that name a section number still point at the right section after renumbering.

## Rules

- **The content file is canonical.** Never hand-edit a generated `.docx` and expect it to survive - the next build overwrites it. Changes go into `content.txt`.
- **The built document goes in the design’s own `output/`,** never the project root. The root is for the design system itself.
- **One output format.** A design ships as Word, because that is what APM reviews and approves. Do not maintain a parallel HTML copy of the same document - two sources of truth is how documents rot. (An earlier HTML edition of the YubiKey design was retired for exactly this reason: it had already drifted from the Word version.)
- **Bump the version in the register and the cover fields together**, in the same change.
- **Australian English throughout.**
