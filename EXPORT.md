# Export - APM Design System

Full copy of this project. Load it into a new project and work exactly as before.

## Load order in the new instance

1. `CLAUDE.md` - project instructions. Paste its contents into the new project's instructions if they are not picked up automatically. It holds the confidentiality, naming, em dash and section-symbol rules.
2. `SKILL.md` then `readme.md` - brand, tokens, diagram kit, component index.
3. `guidelines/detailed-design-standard.md`, `guidelines/detail-design-document-standard.md`, `guidelines/technical-configuration-document-standard.md` - the design document standards.
4. `designs/README.md` - register of every design, version, status, built file, and the reserved build values (`relPrefix` / `imgPrefix` / `idBase`) per document.

## How documents are built

| Item | Location |
|---|---|
| Word builder (use this one) | `templates/detailed-design-v2/authoring/docx-builder.js` - resolves `[[x.y]]` cross-references. The tier-1 builder in `templates/detailed-design/authoring/` does not |
| Masters | `templates/detailed-design/authoring/apm-master.docx` (single-tier, as-built), `templates/detailed-design-v2/authoring/definition-master.docx`, `detail-master.docx`, `technical-master.docx` |
| Consistency scan | `templates/detailed-design/authoring/consistency-check.js` - `scan()` must return `ok: true` |
| Figure QA | `templates/detailed-design/authoring/qa-checks.js` - `qa()` in the figure page must return `ok: true` |
| Word import | `templates/detailed-design/authoring/docx-to-dsl.js` |
| Diagram kit | `tokens/diagrams.css` |
| Change records | `templates/emergency-change/` |

## Per-design folders

Each design is `designs/<slug>/`: `content*.txt` (DSL source, canonical), `figures.html`, `figs/*.png`, `output/*.docx`, `history/`, `config/`.

- `designs/standard-user-avd/` - Detail Design V1.5 (`content-detail.txt`) and TCD V1.0 (`content-technical.txt`). Rebuild the Detail Design with `rebuild-with-comments.js`, which re-injects the 30 review comments from `history/APM_Detail_Design_Standard_User_AVD_V1.4-reviewed.docx`.
- `designs/participant-device/` - ES Participant Kiosk: Design Definition, Detail Design (`content-detail.txt`), TCD (`content-technical.txt`), as-built (`content-asbuilt.txt`, `content-asbuilt-ca.txt`), runbooks in `runbooks/`, device scripts in `config/`. `content.txt` is the superseded single-tier DDD; do not edit it.
- Knowledge base articles: `knowledge-base/participant-kiosk/`.

## Regenerated automatically

`_ds_bundle.js`, `_ds_manifest.json` and `_adherence.oxlintrc.json` are compiled by the design system on every turn. Do not edit them.

## Scratch

`uploads/` is upload scratch. It holds historic source material under an older naming convention that is superseded by `CLAUDE.md`. Nothing current cites it.
