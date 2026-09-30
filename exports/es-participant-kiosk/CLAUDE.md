# Project: APM ES Participant Kiosk Solution

Standalone project for the **ES Participant Kiosk** - a physical Dell device in APM Employment Services sites, for participant use, running Windows 11 Enterprise under multi-app Assigned Access with unattended AutoLogon. Part of APM's **Standard Operating Environment Program**.

**This solution uses neither Azure Virtual Desktop nor Nerdio.** Never write `AVD/Nerdio Implementation` on any cover field here.

## The three documents

| Tier | Source | Current version | Master |
|---|---|---|---|
| 1 Design Definition | `designs/participant-device/content-definition.txt` | V1.1 | `definition-master.docx` |
| 2 Detail Design | `designs/participant-device/content-detail.txt` | V1.2 | `detail-master.docx` |
| 3 Technical Configuration | `designs/participant-device/content-technical.txt` | V1.8 | `technical-master.docx` |

Read the matching standard in `guidelines/` **before** editing any of them:
- `detail-design-document-standard.md` - tier 2, carries the master's verbatim heading map
- `technical-configuration-document-standard.md` - tier 3, build-sequence order and depth bar
- `detailed-design-standard.md` - the craft rules (sections 2a and 2b) that apply to all tiers

**Rule zero: the masters' outlines are reproduced verbatim, defects included.** The tier-2 master's Business Architecture starts at 3.2 with no 3.1, its section 8 carries two 8.2s, and its section 7 has no subsections (use bold lead-in paragraphs, never an invented `H2 |7.1`). The tier-3 master has no section 3. Do not renumber to "fix" any of them.

## Rebuild recipe

```js
const dbuilder = await readFile('templates/detailed-design-v2/authoring/docx-builder.js');
const { buildDocx } = await import(URL.createObjectURL(new Blob([dbuilder], { type: 'text/javascript' })));
await buildDocx({ readFile, readFileBinary, saveFile, log },
  'templates/detailed-design-v2/authoring/detail-master.docx',
  'designs/participant-device/content-detail.txt',
  'designs/participant-device/figs/',
  'designs/participant-device/output/APM_Detail_Design_ES_Participant_Kiosk_V1.3.docx',
  { fields: { /* see cover fields below */ },
    versionRows: [ /* one row per version */ ],
    relPrefix: 'rH', imgPrefix: 'ddFigPK', idBase: 5500 });
```

`relPrefix`/`imgPrefix`/`idBase` must be unique per document. Reserved: tier 1 `rI`/`defFigPK`/`5600`, tier 2 `rH`/`ddFigPK`/`5500`, tier 3 `rG`/`tcdFig`/`5400`.

**Cover fields, every document:**
- `Project Name:` `ES Participant Kiosk Solution`
- `Program Name:` `Standard Operating Environment Program`
- `Document Owner:` `Shaun Struik` · `Contact Details:` `shaun.struik@apm.net.au`
- `Division/Unit:` `Digital Workplace` · `Product ID:` `N/A`
- `Document Status:` `Draft - for review` (tiers 1-2) or `Draft - for build` (tier 3)

**Version History records changes to the DESIGN, never to the document's authoring.** "Palo Alto removed from the egress path" is a version row. "Editorial pass", "figure re-exported", "cross-references converted to hyperlinks" are not.

## Before shipping any document

1. Rebuild the `.docx`
2. `consistency-check.js` `scan({dsl, figFiles})` - must return no findings beyond informational ORPHAN entries
3. If a figure changed: `show_html` on `figures.html`, run `qa()` in the console until `ok: true`, then `snapshot_element` per figure, then rebuild
4. Never `present_fs_item_for_download` a figure PNG without re-snapshotting after the last edit to `figures.html`

## Cross-references

Write `[[5.3.4]]` in the DSL and nothing else. `docx-builder.js` resolves it to "5.3.4 Routing" as a live hyperlink to that heading, so the section name is never hand-typed and cannot go stale. `UNRESOLVED [[xref]]` in the build log is a build failure. References into a companion tier stay plain text and name the document ("Technical Configuration Document, 12.6").

## Writing rules - non-negotiable

**Facts, not commentary.** A shipped document contains settled facts and technical content. No sentence describing the document's own construction, genre or revision history. No assistant-voice reasoning ("this reframes the argument", "recommended", "the best option is"). The Decision Register records decisions stakeholders made, with options actually considered stated as fact - never a proposal with supporting argument.

**Write like a person.** No "it is important to note", "leverage", "utilise", "robust", "seamless", "comprehensive", "In order to", or a paragraph opening with "Additionally/Furthermore/Moreover". Active voice with a named actor. A number instead of an adjective.

**Never use em dashes.** Spaced hyphen, colon, comma, or restructure. **Never use the section symbol.** Write "section 3.2" or bare "3.2".

**Australian English throughout.**

## Confidentiality - never violate

- **Every artifact reads as APM's own work.** Never name a delivery party: no consultancy, no "the project team", no "contractor", no "vendor team". Owner and RACI columns use an APM role: **APM Solution Engineer**, **APM Architecture Lead**, **Shaun Struik**, **Digital Operations**, **APM Cyber Security**, **APM Network Management**.
- **Delivery-side suppliers MAY be named:** CompNow (device prep, build, ship), Stratus (managed network), SoftwareOne (licensing).
- **Technology vendors MAY be named:** Microsoft, Zscaler, Dell, Palo Alto, Cisco Meraki.
- **People: roles only.** Never introduce or restore an individual's personal name. Re-anonymise any new input before saving it.

## Design system

This project consumes the **APM Design System** for the diagram kit and brand tokens: `styles.css` and `tokens/` are copied in, and `figures.html` links `../../styles.css`. Every figure uses the `.dgm-*` classes so all program documents look alike. If you rebind this project to the live design system, point those links at the bound `_ds/` tree instead and delete the local copies.

## Policy sources

`policies/` holds only what this solution cites:
- `APM-Employment-Services-SOE-Hardening-Standard-V1.0.xlsx` - **the standard this fleet is governed by**, 8 policy tabs. Tab 5 "Security Baseline" is the OS baseline with the ten ES changes
- `APM-Windows-SOE-Hardening-Standard-V3.0.xlsx` - the corporate staff standard this derives from, held for comparison. Never edit it to accommodate an ES device
- `APM-W11-SEC-Baseline-ESKiosk-P-1.0.json` - the Intune export as built (04:33 21/08/2026, 427 settings), the as-built evidence
- `ES-Kiosk-Baseline-Change-Record.xlsx` - APM's own change record for that policy
- `APM_Intune_Naming_Schema_Addendum.md` - proposed additions to the naming schema
- `APM-Conditional-Access-Policies-Export.csv` + `ca-policies.js` - the tenant CA baseline (116 policies, 68 enforced, 43 report-only, 5 off)
- `environment-config.js` - environment facts

**One fact, one home.** A value lives in exactly one file; every other mention cross-references it.

## Policy naming - settled

All Kiosk Intune objects use **`CDG-W11-*`**, matching the Technical Configuration Document. The register is `designs/participant-device/config/intune-object-register.md`.

**Outstanding action in the tenant:** the live security baseline is named `APM-W11-SEC-Baseline-ESKiosk-P-1.0` and must be renamed to **`CDG-W11-SEC-Baseline-P-1.0`**. Recorded on tab 5 of the ES hardening standard.

## Scripts and pasteable values

`designs/participant-device/config/` holds every script and configuration file, with an upload-ready copy per Intune object in `config/intune-upload/` and `00-UPLOAD-GUIDE.md` giving the console path, every field and the assignment for each.

**Every `.ps1` must be signed with the APM code-signing certificate (dependency SOE-02) before upload or packaging.** The fleet runs a signed-scripts-only execution policy, and both installers exit 1 without registering anything if their payload script is unsigned.

Two deployment mechanisms are **not** interchangeable:
- **Idle watchdog is a Win32 app, not a platform script.** The scheduled task launches the watchdog with `-ExecutionPolicy AllSigned`, so the watchdog must be a separately signed file. A platform script is one file and cannot carry one.
- **Session purge is a Win32 app, not a platform script.** It needs a shutdown pass and a startup pass. A platform script has no shutdown hook and Task Scheduler has no shutdown trigger, so the shutdown pass is a local Group Policy shutdown script.

## Open items

| Item | Owner |
|---|---|
| Inactivity limit set to 0 removes the failsafe lock, leaving the watchdog restart as the only session terminator | APM Cyber Security |
| `DisableAutomaticRestartSignOn` vs `AutoAdminLogon` interaction to be confirmed on the reference device | APM Solution Engineer |
| Code-signing certificate issue (SOE-02) - gates the whole build | APM Cyber Security |
| Windows 11 benchmark version stated inconsistently in the hardening standard: cover sheet v24H2, Report sheet v23H2. Cite as unreconciled; do not pick one | End User Computing Manager |
| Rename the live security baseline policy to `CDG-W11-SEC-Baseline-P-1.0` | APM Solution Engineer |

## Autopilot: userless enrolment

`Userless enrolment status = Blocked` on an Autopilot device record is **not** an enrolment restriction outcome. It is a per-device anti-reuse property, set when a device is reset after a completed self-deploying run, and cleared with the **Unblock** action on the Autopilot devices blade. Autopilot is an authorised corporate enrolment method, so the Default restriction's `Personally owned = Block` does not affect this fleet and **no restriction change is required**. Unblock before every rebuild, and confirm status before dispatch from staging.
