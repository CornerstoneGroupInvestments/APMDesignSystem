# Standard User SOE on Azure Virtual Desktop - project bundle

Everything for the Standard User SOE on AVD, ready to work on independently of the APM Design System project it was authored in.

**To use it:** create a new project, upload this folder's contents to its root, and the project instructions in `CLAUDE.md` apply from the first turn.

## What is here

```
CLAUDE.md                        project instructions - read first
styles.css, tokens/              brand tokens and the .dgm-* diagram kit
guidelines/                      the three authoring standards
designs/standard-user-avd/
  content-detail.txt             tier 2 source (Detail Design V1.2) - canonical
  solution-index.html            every artefact for this solution, by kind, with its path
  review-responses-v2.0.md       the 11 stakeholder comments on V1.0 and what changed
  research-notes.md              identity facts, the G-03 verification task, open items
  figures.html                   all five figures on the diagram kit, with qa()
  figs/*.png                     exported figures, named for their subject
  output/                        the current built document
  history/                       V1.x sources and builds, the reviewed V1.0, and the pre-standard V0.1 draft
  kb/                            the support-overview knowledge base article
reference/
  eslz/                          the two corpus parts this design cites, plus the marker discipline
  environment/                   AVD test network design, landing zone DDD, Palo Alto as-built, ESLZ naming
  design-capability-briefing.md  the diagram craft reference
policies/                        only the standards and registers this design cites
templates/detailed-design-v2/authoring/   the three masters + docx-builder + qa + consistency
templates/detailed-design/authoring/      docx-to-dsl.js, for importing an authored Word draft
```

## Current document

| Document | Version | Status | Approver | File |
|---|---|---|---|---|
| Detail Design Document (tier 2) | V1.2 | Draft - for review | APM Cyber Security | `output/APM_Detail_Design_Standard_User_AVD_V1.2.docx` |

Regenerable from `content-detail.txt`. The source is canonical; the `.docx` is a build artefact.

**V1.2 is the current issue.** It answers an 11-comment stakeholder review and is built on the APM template's exact 33 headings. See `review-responses-v2.0.md` and `research-notes.md`.

**Tier 1 (Design Definition) and tier 3 (Technical Configuration Document) are not written.** Both masters are in `templates/detailed-design-v2/authoring/`, and `content-detail.txt` already defers configuration values, console paths and build steps to "the companion Technical Configuration Document", so tier 3 is the next document this solution needs.

## The solution in one paragraph

Windows 11 Enterprise multi-session on a pooled AVD host pool in Australia East, orchestrated by Nerdio Manager for Enterprise, Entra ID joined and Intune enrolled so the same 11 policy objects govern it as govern the Windows 11 thick client fleet. The thick clients stay hybrid joined and ADFS-federated. Four divergences between the channels are named in the document: join type, SOE update by golden image replacement, the five varied controls, and the multi-session application requirements. Staff accounts remain hybrid identities, and Microsoft Entra Kerberos authenticates that identity to FSLogix profile containers on Azure Files Premium. It deploys into the APM Azure landing zone and requires a new /23 allocation and a spoke virtual network peered to the Australia East hub, taking the landing zone's forced tunnel egress through the hub Palo Alto firewalls. No public IP address, no inbound port, no internet-facing infrastructure in the spoke, and no domain controller reachability. A user reaches a session through the Windows App from an APM laptop or a personal device; from an unmanaged endpoint, clipboard and drive redirection are closed.

## What is in the document

Nine sections plus two appendices, built on the APM template's exact 33 headings (3.2 with no 3.1, section 7 with no subsections, two 8.2s; 5.2 and 6.3 state N/A):

- **16 requirements** traced to the architecture that meets them, **9 assumptions**, and **3.4 as an eight-item open register** (G-01 to G-08) with an action, a named owner and a date needed by against each
- **Appendix A: Decision Register**, DR-001 to DR-020, options assessed per decision
- **14 interfaces** (I-01 to I-14) with protocol, port, authentication and path
- **Five figures**: solution context, sign-in interface sequence, spoke and subnet plan with forced tunnel egress, access control model, hardening standard inheritance
- **Section 7** states the inherited policy set policy by policy - all 11 by Intune profile name and control count, 748 controls total - then the **five varied controls** (SOE-01 to SOE-05) each with its compensating control, the four added AVD policies, the two Conditional Access policies, the redirection boundary and the risk register to R-11
- **5.4** carries the deployment patterns: the five-step golden image update cycle, the application set a user gets and the multi-session requirements for Microsoft 365 Apps, Teams, OneDrive and Edge, the three mapped-drive paths, printing, desktop and browser configuration including Start menu and taskbar layout, the user experience in a session with the four things a session cannot give a user, and separability from Active Directory and ADFS element by element
- **Appendix B** specifies the non-production environment in the Dev Controlled subscription and the **18 tests** (T-01 to T-18) that pass before the production build begins. Intune and Conditional Access are tenant-level, so isolation there is by assignment, not by boundary (R-11)

## Rebuild recipe

```js
const dbuilder = await readFile('templates/detailed-design-v2/authoring/docx-builder.js');
const { buildDocx } = (await import(URL.createObjectURL(new Blob([dbuilder], { type: 'text/javascript' })))).default;
await buildDocx({ readFile, readFileBinary, saveFile, log },
  'templates/detailed-design-v2/authoring/detail-master.docx',
  'designs/standard-user-avd/content-detail.txt',
  'designs/standard-user-avd/figs/',
  'designs/standard-user-avd/output/APM_Detail_Design_Standard_User_AVD_V1.3.docx',
  { fields: { /* cover fields - see CLAUDE.md */ },
    versionRows: [ /* one row per version */ ],
    relPrefix: 'rJ', imgPrefix: 'ddFigSU', idBase: 5700 });
```

`relPrefix` / `imgPrefix` / `idBase` must be unique per document. Used: `rR`/`ddFigSU8`/`6400` (V1.2). Tier 1 and tier 3, when written, take fresh values.

**Version History rows live on the built cover, not in `content-detail.txt`.** Read them off the current V1.2 document before adding a row, so the history is continuous. The table carries two rows, V1.0 and V1.2: a version row records a change to the design, never a change to the document's authoring.

## What is deliberately NOT here

- The other four SOE designs, the wider APM policy corpus, the program plan and the design system's component library - they stay in the design system project
- ESLZ corpus Parts 2 and 4, which this design does not cite
- The Employment Services SOE Hardening Standard, which governs the Participant Kiosk fleet and not this one

## First things to check after import

1. Open `designs/standard-user-avd/figures.html` and confirm the figures render on the diagram kit. If `styles.css` does not resolve, the relative path `../../styles.css` from that file is what to fix. Run `qa()` in the console; it must return `ok: true`.
2. Rebuild the document with the recipe above to confirm the pipeline works end to end.
3. Read the open items table at the foot of `CLAUDE.md`. G-02 (address allocation) blocks every network object, and G-03 (staff accounts staying hybrid identities, and the profile mount proven by T-15) blocks the profile share.
