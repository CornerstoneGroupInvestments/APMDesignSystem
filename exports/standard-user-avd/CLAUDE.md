# Project: APM Standard User SOE on Azure Virtual Desktop

Standalone project for the **Standard User SOE on AVD** - Windows 11 Enterprise multi-session on a pooled Azure Virtual Desktop host pool in Australia East, orchestrated by **Nerdio Manager for Enterprise**, managed by **Intune + Entra ID**. Part of APM's **Standard Operating Environment Program**.

**One SOE, two channels.** The session host is assigned the same 11 Intune policy objects as the Windows 11 thick client, not a copy of them. **Where the channels diverge it is named, and there are four:** device join type (thick clients hybrid joined to on-premises Active Directory and federated by ADFS, session hosts **Entra ID joined**), SOE update by **golden image replacement** rather than in-place patching, the **five varied controls** in section 7, and the **multi-session application requirements** in 5.4. Everything else is common. **Australia East is the only region.**

Do not restate that count as an absolute unless you have just checked it. "The only divergence" has gone stale twice: once when the update mechanism was added, once when the application requirements were.

**Staff accounts are hybrid identities and stay that way** (A-09). The design changes the device join type, not the user identity type. Microsoft Entra Kerberos authenticates that hybrid identity to the profile store from an Entra ID joined host, so no domain-joined session host is required. Do not conflate the two: a claim about "cloud only" belongs to the user identity, not the host.

**Separability is a requirement, not an aspiration** (BR-13, DR-019, 5.4.8). Nothing in the session host path needs Active Directory or ADFS: no domain membership, no Group Policy, no domain controller reachability, and no on-premises destination on the named egress list. T-18 proves it by blocking the on-premises ranges and working a full session. The one option that would break it is an on-premises file server back end for the mapped drive (G-01).

## The documents

| Tier | Source | Current version | Master |
|---|---|---|---|
| 1 Design Definition | not written | - | `definition-master.docx` |
| 2 Detail Design | `designs/standard-user-avd/content-detail.txt` | V1.2 | `detail-master.docx` |
| 3 Technical Configuration | not written | - | `technical-master.docx` |

The Detail Design defers every configuration value, console path and build step to "the companion Technical Configuration Document". **Tier 3 is the next document this solution needs**, and it is what the build engineer will work from.

**V1.2 is the current issue.** It answers an 11-comment stakeholder review and is built on the APM template's exact 33 headings, with the Decision Register as Appendix A and the Test Environment as Appendix B. The document control table carries two rows, V1.0 and V1.2: **a version row records a change to the design, never a change to the document's authoring**, so cross-reference corrections, register reordering and count fixes are not versions. `designs/standard-user-avd/review-responses-v2.0.md` records every review comment and what changed; `research-notes.md` records the identity facts and the open verification task behind G-03. Read both before re-reviewing or revising.

Read the matching standard in `guidelines/` **before** editing any of them:
- `detail-design-document-standard.md` - tier 2, carries the master's verbatim heading map
- `technical-configuration-document-standard.md` - tier 3, build-sequence order and depth bar
- `detailed-design-standard.md` - the craft rules (sections 2a and 2b) that apply to all tiers

**Rule zero: the masters' outlines are reproduced verbatim, defects included.** The tier-2 master's Business Architecture starts at 3.2 with no 3.1, its section 8 carries two 8.2s, and its section 7 has no subsections (use bold lead-in paragraphs, never an invented `H2 |7.1`). The tier-3 master has no section 3. Do not renumber to "fix" any of them.

## Rebuild recipe

```js
const dbuilder = await readFile('templates/detailed-design-v2/authoring/docx-builder.js');
const { buildDocx } = (await import(URL.createObjectURL(new Blob([dbuilder], { type: 'text/javascript' })))).default;
await buildDocx({ readFile, readFileBinary, saveFile, log },
  'templates/detailed-design-v2/authoring/detail-master.docx',
  'designs/standard-user-avd/content-detail.txt',
  'designs/standard-user-avd/figs/',
  'designs/standard-user-avd/output/APM_Detail_Design_Standard_User_AVD_V1.3.docx',
  { fields: { /* see cover fields below */ },
    versionRows: [ /* one row per version */ ],
    relPrefix: 'rJ', imgPrefix: 'ddFigSU', idBase: 5700 });
```

`relPrefix`/`imgPrefix`/`idBase` must be unique per document. Used: `rR`/`ddFigSU8`/`6400` (V1.2). Pick fresh values for the next build and for tiers 1 and 3.

**Cover fields, every document:**
- `Project Name:` `Standard User SOE on Azure Virtual Desktop`
- `Program Name:` `Standard Operating Environment Program`
- `Document Owner:` `Shaun Struik` · `Contact Details:` `shaun.struik@apm.net.au`
- `Division/Unit:` `Digital Workplace` · `Product ID:` `N/A`
- `Document Status:` `Draft - for review` (tiers 1-2) or `Draft - for build` (tier 3)

Never write `AVD/Nerdio Implementation` in `Program Name:`. The programme covers all five SOE use cases, three of which use neither.

**Version History records changes to the DESIGN, never to the document's authoring.** "Printer redirection changed from server-side to client-side" is a version row. "Editorial pass", "figure re-exported", "cross-references converted to hyperlinks" are not. The rows live on the built cover, not in `content-detail.txt` - read them off the current V1.2 document before adding one.

## Before shipping any document

1. Rebuild the `.docx`
2. `consistency-check.js` `scan({dsl, figFiles})` - must return no findings beyond informational ORPHAN entries. Both pipeline scripts in this bundle expose a **default** export, so destructure from `.default`
3. If a figure changed: `show_html` on `figures.html`, run `qa()` in the console until `ok: true`, then `snapshot_element` per figure, then rebuild
4. Assert every register is in ID order - one pass over `^TR \|(PREFIX-\d+)` per prefix (`G`, `BR`, `A`, `R`, `T`, `I`, `SOE`, `DR`), compared against its own sort. Appending a row with an existing row as the `str_replace` anchor puts it in the wrong place, and `scan()` does not check ordering
5. Check no sentence carries the same `[[xref]]` twice. It resolves to the same heading name twice and reads as nonsense; `scan()` counts both as valid
6. Reconcile every count stated in the DSL against the table it names. `scan()`'s COUNT check only sees the table directly below a count, so a count in one section about a table in another is invisible to it - grep for `\d+ (tests|controls|policies|profiles|requirements|figures|objects|interfaces)` and the spelled-out numbers, and read each hit
7. Never `present_fs_item_for_download` a figure PNG without re-snapshotting after the last edit to `figures.html`

## Cross-references

Write `[[5.3.4]]` in the DSL and nothing else. `docx-builder.js` resolves it to "5.3.4 Routing" as a live hyperlink to that heading, so the section name is never hand-typed and cannot go stale. `UNRESOLVED [[xref]]` in the build log is a build failure. References into a companion tier stay plain text and name the document ("Technical Configuration Document, 12.6").

## Writing rules - non-negotiable

**Facts, not commentary.** A shipped document contains settled facts and technical content. No sentence describing the document's own construction, genre or revision history. No assistant-voice reasoning ("this reframes the argument", "recommended", "the best option is"). The Decision Register records decisions stakeholders made, with options actually considered stated as fact - never a proposal with supporting argument.

**Write like a person.** No "it is important to note", "leverage", "utilise", "robust", "seamless", "comprehensive", "In order to", or a paragraph opening with "Additionally/Furthermore/Moreover". Active voice with a named actor. A number instead of an adjective.

**Never use em dashes.** Spaced hyphen, colon, comma, or restructure. **Never use the section symbol.** Write "section 3.2" or bare "3.2".

**Australian English throughout.**

## Confidentiality - never violate

- **Every artifact reads as APM's own work.** Never name a delivery party: no consultancy, no "the project team", no "contractor", no "vendor team". Owner and RACI columns use an APM role: **APM AVD Build Engineer**, **APM Architecture Lead**, **Shaun Struik**, **Digital Operations**, **APM Cyber Security**, **APM Network Management**, **Digital Transformation and Architecture**.
- **Delivery-side suppliers MAY be named:** SoftwareOne (licensing, and the source of the A-01 licence confirmation), Stratus (managed network), CompNow (device prep).
- **Technology vendors MAY be named:** Microsoft, Nerdio, Zscaler, Palo Alto, Dell.
- **People: roles only.** Never introduce or restore an individual's personal name. Re-anonymise any new input before saving it. The pre-standard V0.1 draft in `history/` names a document owner by position title; it is a historical input and its wording is never carried into a new document.

## Design system

This project consumes the **APM Design System** for the diagram kit and brand tokens: `styles.css` and `tokens/` are copied in, and `figures.html` links `../../styles.css`. Every figure uses the `.dgm-*` classes so all program documents look alike. `reference/design-capability-briefing.md` carries the diagram rules. If you rebind this project to the live design system, point those links at the bound `_ds/` tree instead and delete the local copies.

## Azure facts come from the corpus, and are cited

`reference/eslz/` holds the two corpus parts this design cites - Part 1 (core architecture as-built) and Part 3 (IPAM and policy standards) - and its `README.md` carries the marker discipline: `[CORPUS]` for a corpus fact, `[EXTERNAL]` for a vendor fact, `[UNKNOWN]` where no source establishes the answer, `[UNRECONCILED]` where two sources disagree, `[PROPOSED]` for something this design is asking for. Every Azure value in `content-detail.txt` carries its marker. Do not restate a corpus fact without one, and do not silently resolve an `[UNKNOWN]`.

`reference/environment/` holds the source documents behind those facts, including **`APM-AVD-Test-Network-DetailDesign-V0.2.docx`**, the design of the non-production environment that Appendix B places in the Dev Controlled subscription (DR-018).

## Policy sources

`policies/` holds only what this solution cites:
- `APM-Windows-SOE-Hardening-Standard-V3.0.xlsx` - **the standard this SOE is governed by**, 748 controls across 11 Intune policies, benchmarked against the ASD Windows Hardening Guidelines, the Microsoft Windows 11 v24H2 security baseline and the Microsoft Edge security baseline v139. The cover sheet is the authority on the benchmark version; the Report tab's references list cites v23H2 and is wrong. The inheritance position in section 7 is measured against this standard. Never edit it to accommodate a session host; vary the control in the design and name the compensating control
- `APM-Conditional-Access-Policies-Export.csv` + `ca-policies.js` - the tenant CA baseline (116 policies, 68 enforced, 43 report-only, 5 off). Two new policies are created in the CA-2xx series, and both numbers are confirmed unused immediately before creation because four numbers in that series are already carried by two policies each
- `APM_Intune_Naming_Schema_Addendum.md` - Part 2 is this design's proposed additions (the `AVD` Scope value and the group names), raised by DR-017 and pending APM ITS management approval
- `APM-Compliance-Management-Plan-RFFR-ISO27001-ANZ.pdf` - the RFFR and ISO 27001 position section 7 is written against
- `environment-config.js`, `compliance-rules.js` - environment facts and the compliance rule set

**One fact, one home.** A value lives in exactly one file; every other mention cross-references it. Object names live in 5.1 of the Detail Design and nowhere else.

## Knowledge base

`designs/standard-user-avd/kb/KB-AVD-Standard-User-SOE-Support-Overview.md` is the support overview article, V0.1, 28 May 2026, authored before the current design and **not yet reconciled to it**. It predates DR-013 (client-side printer redirection to APM site printers only) and the redirection boundary in section 7. Reconcile it before publication, and re-anonymise its cover block.

## Open items

The register is 3.4 of the Detail Design. Every item carries an action, a named owner and a date it is needed by.

| Ref | Item | Owner |
|---|---|---|
| G-02 | **No address range is reserved for AVD.** A /23 must be allocated from the Australia East supernet and the spoke peered to the hub. Blocks every network object, and it is phase 1 of the implementation sequence. The subnet plan in 5.3.2 is stated as offsets so it applies to whichever /23 is issued | APM Network Management |
| G-03 | Two identity facts are unproven: that staff accounts remain hybrid identities for the life of this design, and that the profile container mounts on an Entra ID joined host for a hybrid identity user. Record the planned date of any move to cloud only; prove the mount with T-15 | Digital Transformation and Architecture |
| G-01 | The mapped network drive back end is not recorded in any document available to this design. All three candidate paths are specified in 5.4.5; the answer selects one | Digital Operations |
| G-04 | The inherited App Control for Business policy does not enforce script control, so PowerShell and equivalent script hosts are unconstrained. ASD Essential Eight application control expects script control | APM Cyber Security |
| G-05 | `Staff-Windows-Compliance-Policy` sets no minimum operating system version. A minimum build is added to the AVD compliance policy | APM Cyber Security |
| G-06 | Session host sizing is not established: users per host, virtual machine SKU and disk type. Fixed from pilot measurement | Digital Operations |
| G-08 | **Application deployment definitions are not held.** Needed from Intune: the Microsoft 365 Apps deployment (channel, architecture, app inclusion list), the Teams deployment, the OneDrive profile (Known Folder Move, Files On-Demand), the Edge configuration profile (managed favourites JSON, homepage, start-up URLs), the desktop and lock screen branding profile, and the line-of-business application list. The hardening standard in `policies/` covers **security settings only** and carries none of these | Digital Operations |

| G-07 | Security log retention in the Australia East security workspace is shorter than APM's 180-day requirement for security logs | APM Cyber Security |

One further item sits in Appendix B rather than 3.4: free space in `10.40.24.0/23` is confirmed with APM Network Management before the test subnets in B.3 are created.

**Four application settings are load-bearing on a pooled host and are easy to get wrong.** Microsoft 365 Apps needs **shared computer activation**, or the first user to sign in consumes the host's activation and everyone after is refused. Teams needs the **AVD media optimisation** components, or every call renders on the session host. OneDrive needs **Files On-Demand**, and its Known Folder Move configuration has to be reconciled with FSLogix, because both claim the user's folders. Edge favourites and homepage are **not** in `APM-W11-SEC-Edge Baseline-P-1.2`; they are separate settings in their own profile. Every baked-in application is a **per-machine** install: a per-user installer does not survive a pooled host.

## Appendix B is not optional

The 18 tests in B.6 all pass before the production build begins, and the set is re-run for every subsequent image version and policy change. **T-04, T-08, T-09, T-10, T-13, T-15 and T-18 prove a control rather than a feature.** If time is constrained they are the last to be cut, not the first. T-15 in particular cannot be substituted by T-03: a profile container that mounts on a clean host proves nothing about a hardened host under the production Conditional Access set. T-18 is the evidence for BR-13: block the on-premises ranges from the host subnet, then work a full session.
