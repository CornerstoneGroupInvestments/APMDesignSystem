# ES Participant Kiosk Solution - project bundle

Everything for the ES Participant Kiosk, ready to work on independently of the APM Design System project it was authored in.

**To use it:** create a new project, upload this folder's contents to its root, and the project instructions in `CLAUDE.md` apply from the first turn.

## What is here

```
CLAUDE.md                        project instructions - read first
styles.css, tokens/              brand tokens and the .dgm-* diagram kit
guidelines/                      the three authoring standards
designs/participant-device/
  content-definition.txt         tier 1 source (Design Definition V1.1)
  content-detail.txt             tier 2 source (Detail Design V1.2)
  content-technical.txt          tier 3 source (Technical Configuration V1.8)
  figures.html                   all ten figures on the diagram kit, with qa()
  figs/*.png                     exported figures, named for their subject
  config/                        every script, XML and JSON, plus intune-upload/
  output/                        the four current built documents
  history/                       the superseded single-tier DDD and its source
  ES-Device-Baseline-Exceptions.html   one-page build sheet for the baseline copy
templates/detailed-design-v2/authoring/   the three masters + docx-builder + checks
templates/detailed-design/authoring/      qa-checks.js and consistency-check.js
policies/                        only the standards and registers this design cites
```

## Current documents

| Document | Version | Status | File |
|---|---|---|---|
| Design Definition | V1.1 | Draft - for review | `APM_Design_Definition_ES_Participant_Kiosk_V1.1.docx` |
| Detail Design | V1.2 | Draft - for review | `APM_Detail_Design_ES_Participant_Kiosk_V1.2.docx` |
| Technical Configuration | V1.8 | Draft - for build | `APM_TCD_ES_Participant_Kiosk_V1.8.docx` |
| ES Device Baseline build sheet | V1.0 | For build | `APM_ES_Device_Baseline_Build_Sheet_V1.0.docx` |

All four are regenerable from the `content-*.txt` sources. The sources are canonical; the `.docx` files are build artefacts.

## The solution in one paragraph

A physical Dell device in an APM Employment Services site, for participant use. Windows 11 Enterprise, Entra-joined and Intune-managed, provisioned by Autopilot self-deploying with no technician sign-in. Multi-app Assigned Access presents Edge, LibreOffice, File Explorer scoped to Downloads and removable drives, the Zscaler tray and TeamViewer. The device signs itself in to a local account `Kiosk-<SERIAL>` with a credential known to no person, so no participant holds an identity or a password. Ten minutes of inactivity restarts the device and destroys the session. Licensing is device-based only. Web filtering is Zscaler with the Client Connector on the device, local breakout, no Palo Alto hop. Participants carry documents on their own USB media; there is no printing from the fleet.

## What is deliberately NOT here

- The wider APM policy corpus, ESLZ reference material, program plan and other designs - they stay in the design system project
- Superseded build artefacts, other than the last commented DDD kept in `history/`
- The design system's own component library and card grid - only `styles.css` and `tokens/` are needed to render the figures

## First things to check after import

1. Open `designs/participant-device/figures.html` and confirm the figures render on the diagram kit. If `styles.css` does not resolve, the relative path `../../styles.css` from that file is what to fix.
2. Rebuild one document with the recipe in `CLAUDE.md` to confirm the pipeline works end to end.
3. Read the open items table at the foot of `CLAUDE.md` - five items are outstanding, one of which (the code-signing certificate) gates the whole build.
