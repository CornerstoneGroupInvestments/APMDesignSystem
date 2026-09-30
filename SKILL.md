---
name: apm-design
description: Use this skill to generate well-branded interfaces, design documents and assets for APM (Advanced Personnel Management, "enabling better lives"), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, the architecture diagram kit, the APM Detailed Design Document standard + authoring pipeline, and the Job Seeker Kiosk UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Writing a design document, HLD, DDD or solution design

**If the user asks for any design document, read `guidelines/detailed-design-standard.md` first and follow it - it is mandatory, and there is no "lite" version.** The bar it enforces: a build engineer can construct the solution from the document without asking a question, and an approver can say yes without asking for more information. Three rules: show the actual settings rather than the intent; diagram every structural idea on the diagram kit; keep a logical order with the contentious argument made openly and early.

The pipeline is in `templates/detailed-design/authoring/` (see its `README.md`) - an APM Word master with the real cover set and heading styles, a builder that splices generated content into it, a content DSL, nine worked example figures, and `qa-checks.js`. Never rebuild the cover, document control or heading styles by hand.

Build diagrams with the **architecture diagram kit** (`tokens/diagrams.css`, `.dgm-*` classes - see the "Architecture diagram kit" card in the Design System tab). **Before shipping, load `qa-checks.js` and run `qa()` - it must return `ok: true`** (overlap, WCAG AA contrast across the whole page, figure overflow).

Each design lives in `designs/<slug>/` with `content.txt` as the canonical source; `designs/README.md` is the register of every design, its version, status and approver.

Key files:
- `readme.md` - full brand guide: content fundamentals, visual foundations, iconography, index.
- `guidelines/detailed-design-standard.md` - **the design-document standard** (structure, depth bar, network section, DSL, build steps, QA checks, approval checklist).
- `policies/` - **APM policy and standard source documents** (SOE hardening standards, RFFR/ISM control sets, licensing policy, naming conventions). Read the whole document before asserting a control is met, excluded or compensated against it - see `policies/README.md` for the index and rules.
- `designs/README.md` - the design register + per-design folder convention.
- `templates/detailed-design/` - the Detailed Design Document template; `authoring/` holds the Word pipeline.
- `styles.css` - link this one file to get all tokens + fonts.
- `tokens/` - colors, typography, spacing, elevation, **diagrams** CSS custom properties.
- `components/` - React primitives (Button, IconButton, Badge, Card, Input, Alert).
- `ui_kits/job-seeker-kiosk/` - the kiosk product recreation.
- `assets/` - APM logo, brand gradient ribbons, employment photography.

Brand in one line: **APM orange (`#F89728`) + navy (`#1F2D58`)**, pill-shaped controls, soft 16px cards with navy-tinted shadows, friendly geometric headings (Poppins*) over a legible humanist UI face (Mulish*), warm documentary photography, angular gradient ribbons as the only decorative gradient, calm fade/lift motion, no emoji, Australian English, second-person warm tone. (*fonts are flagged substitutes - swap for APM's licensed faces if available.)
