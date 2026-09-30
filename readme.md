# APM Design System

Brand + UI system for **APM** (Advanced Personnel Management) - a global health and human-services provider whose purpose is *"enabling better lives."* This system was built to support the **Job Seeker Kiosk** programme: standardised, locked-down Microsoft Edge kiosks deployed at APM sites nationally so Workforce Australia participants can search and apply for jobs, build resumes, report obligations, and reach support services.

> APM delivers Workforce Australia employment services under contract with the Department of Employment and Workplace Relations (DEWR). Kiosks are non-persistent: every session is wiped on sign-out or after 10 minutes of inactivity.

## Sources

- **`uploads/JobSeeker_Detailed Design_V1.0.docx`** - APM internal "Detailed Design Document: Job Seeker Kiosk and AVD Solution" (V1.0, 23 Jun 2026). Owner: Samit Chandra, Head of Digital Transformation & Architecture. Extracted text lives at `uploads/_document_text.txt`; brand imagery at `uploads/media/`.
  - Brand assets harvested: APM logo, brand gradient ribbons, employment photography.
  - Product content harvested: the managed bookmark list (§3.2.2), kiosk end-to-end experience (§5.1.6), lock-screen/wallpaper spec (§7), accessibility requirements (§3.2.1).

No codebase or Figma file was provided - the kiosk UI here is a faithful **recreation from the design document's written spec**, not a pixel copy of shipped software. Brand colours are sampled from the supplied logo + ribbon assets.

---

## Content fundamentals

How APM writes for job seekers on the kiosk:

- **Voice: warm, plain, encouraging.** Second person ("your session", "where would you like to start?"). The job seeker is always *you*; APM is *we / your consultant*. Never bureaucratic.
- **Reassurance before instruction.** Privacy and the data-wipe are stated kindly, framed as protection ("everything is wiped when you finish" → *for your safety*), not as a warning bark.
- **Sentence case** everywhere except short overline labels (UPPERCASE, tracked). No ALL-CAPS shouting in body copy.
- **Short sentences, concrete verbs.** "Search jobs, build a resume and access support - all in one place."
- **Australian English** (favourites, organisation, recognised).
- **No emoji.** The audience includes people with low digital literacy, vision/language needs, and stressful circumstances - tone stays calm and professional. A leading "▶" on video links is the only glyph used, and only as a play affordance.
- **Tagline:** *enabling better lives* - lowercase, navy, paired with the logo.

Examples from the kiosk:
- Lock screen: *"Let's find your next opportunity."*
- Data-wipe notice: *"This is a shared device - your session will be wiped. Save your resume to a USB stick or email it to yourself before you finish."*
- Session end: *"Your session has ended. All your files, history and sign-ins have been securely wiped from this device. Thanks for using the APM Job Seeker Kiosk."*

---

## Visual foundations

- **Colour.** Two brand anchors: **APM orange** (`#F89728`, warm golden - primary actions, highlights, energy) and **APM navy** (`#1F2D58` - text, dark surfaces, trust). A decorative **ribbon accent family** (indigo `#2E3192` → purple `#5C2D91` → magenta `#E51C84`) appears only as angular gradient artwork, never as UI fill. Orange-on-navy is the signature pairing.
- **Type.** *Substituted* (APM's licensed brand face is not in the source): **Poppins** for display/headings (friendly geometric, echoes the rounded wordmark) and **Mulish** for UI/body (humanist, highly legible - important for kiosk accessibility). Sentence case; tight leading on headings, generous on body. **Flagged for replacement with the real APM font.**
- **Backgrounds.** Mostly flat: off-white pages (`--surface-page`), white cards. Dark surfaces use a **navy linear gradient** (`--gradient-navy`), accented with the angular brand **ribbon PNGs** bleeding off a corner. No noise, no glassmorphism, no purple SaaS gradients as UI backgrounds - ribbons are the only gradient, and they're decorative artwork.
- **Corners & cards.** Soft, friendly rounding: cards 16px (`--radius-lg`), inputs/tiles 10px, controls fully **pill-shaped** (`--radius-pill`). Cards are white with a 1px `--border-subtle` hairline + a soft, **navy-tinted** shadow (`--shadow-sm/md`). No coloured left-border accent cards.
- **Elevation.** Low-contrast navy-tinted shadows, four steps. Interactive cards/tiles lift `translateY(-2px)` and deepen shadow on hover.
- **Motion.** Calm and quick. `--ease-standard` (cubic-bezier(.2,0,0,1)); 120–320ms. Fades and small lifts only - **no bounce, no spring**. Buttons scale to `0.98` on press.
- **Hover / press.** Primary buttons darken (orange-500 → 600 → 700). Ghost/secondary tint navy-50. Tiles lift + shadow. Press = subtle scale-down. Focus = 3px translucent-orange ring (`--ring-focus`).
- **Imagery.** Real, warm, documentary photography of people at work (e.g. `assets/hero-employment.jpg` - a supported employee at Fins Seafood). Natural light, authentic, not stock-posed. Subjects centred, shallow depth of field.
- **Accessibility is foundational.** Kiosk hit targets ≥44px; visible focus rings; high colour contrast; Mulish chosen for legibility. The kiosk surfaces Read aloud / Magnifier / On-screen keyboard / High contrast tools directly.

---

## Iconography

APM ships **no proprietary icon set** in the source material (it is an infrastructure document). Icons here are **[Lucide](https://lucide.dev)** (ISC license) - chosen because its even 2px stroke and rounded line-caps match APM's friendly, approachable tone. **This is a flagged substitution.**

- Icons are **stroke**, 2px, `currentColor`, 24×24 - never filled, never multicolour.
- The set is **inlined** as SVG path data in `ui_kits/job-seeker-kiosk/Icons.jsx` for offline kiosk reliability (no CDN dependency at runtime). Add icons by copying Lucide path data into that map.
- **No emoji** as icons. The single "▶" play glyph on video bookmarks is the only exception.
- Category bookmark tiles use **2–3 letter monogram marks** on an accent-coloured rounded square (in place of live favicons, which can't be fetched on a locked-down kiosk).
- Logo and brand artwork are raster PNGs in `assets/` - never redrawn as SVG.

---

## Index - what's in this system

**Foundations**
- `styles.css` - global entry point (import this). Imports everything below.
- `tokens/colors.css` - brand orange, navy, ribbon accents, neutrals, semantic + aliases.
- `tokens/typography.css` - Poppins / Mulish families, scale, weights (loads Google Fonts).
- `tokens/spacing.css` - 8px grid, radii, hit targets.
- `tokens/elevation.css` - shadows, focus ring, motion easings/durations.
- `tokens/base.css` - light element resets.
- `tokens/diagrams.css` - **architecture diagram kit**: zones, boxes, wires, step markers, heat cells, legends for technical figures in design documents and decks.
- `guidelines/*.card.html` - foundation specimen cards (Colors, Type, Spacing, Brand).
- `diagrams/DiagramKit.card.html` - the diagram vocabulary in one specimen.

**Design documents**
- `guidelines/detailed-design-standard.md` - **the standard every design document, HLD, DDD and solution design follows.** Read it before starting one. Covers the depth bar, section-by-section requirements, the nine-point network test, the content DSL, build steps, the traps already hit, and an approval checklist.
- `templates/detailed-design/` - the Detailed Design Document template (Design Component + branded HTML).
- `templates/detailed-design/authoring/` - the Word pipeline: `apm-master.docx` (APM cover set, document control, disclaimer, Contents, real heading styles), `docx-builder.js`, `content-example.txt` (worked example + DSL reference), `example-figures.html` (nine example figures + Tweaks panel), `figs/`. See its `README.md`.

**Components** (`window.APMDesignSystem_4c9b4b.*`)
- `components/core/` - **Button**, **IconButton**, **Badge**, **Card**
- `components/forms/` - **Input**
- `components/feedback/` - **Alert**
  Each has `.jsx` + `.d.ts` + `.prompt.md` + a `.card.html` specimen.

**UI kit**
- `ui_kits/job-seeker-kiosk/` - interactive recreation of the kiosk flow: lock screen → AVD sign-in → branded bookmark launcher (categorised: Job search, Workforce Australia & reporting, Resume & documents, Centrelink, Support services, Training, Transport, Other) → 10-minute timeout → session-wiped screen. Bookmark data in `bookmarks.js` (from the design doc). Entry: `index.html`.

**Assets** (`assets/`)
- `apm-logo.png` - APM wordmark (orange + navy, transparent).
- `ribbon-magenta.png`, `ribbon-purple.png`, `ribbon-navy.png` - angular brand gradient artwork, cropped to the coloured band with a genuine alpha channel (the originals carried 71–78% opaque white, which painted a slab over any dark surface they were placed on).
- `hero-employment.jpg` - documentary employment photography.

**Other**
- `SKILL.md` - Agent-Skills-compatible entry point.

---

## Open questions / flags for the user

1. **Fonts are substitutes** (Poppins + Mulish). Please provide APM's licensed brand typeface(s) so we can swap them in `tokens/typography.css`.
2. **Icons are Lucide** (substituted). Confirm, or supply APM's preferred icon set.
3. **Exact brand hex values** were sampled from the logo/ribbon PNGs - confirm against APM's official brand palette.
4. The kiosk credentials, asset tag, and "Brave-Tide" password are **illustrative placeholders**.
