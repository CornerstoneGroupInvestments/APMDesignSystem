# Detailed Design Document - authoring pipeline

Everything needed to produce an APM design document that passes approval. **Read `guidelines/detailed-design-standard.md` first** - it is the standard; this folder is the machinery.

## Files

| File | What it is |
|---|---|
| `apm-master.docx` | The APM Word master. Cover set, document control tables, Confidentiality & Disclaimer, APM Contact, Contents, and the real heading styles (`Heading1/2/3`, `Caption`, `ListParagraph`). **Never rebuild these by hand** - the builder splices into this file and preserves them. |
| `docx-builder.js` | ES module exporting `buildDocx(env, master, contentFile, figDir, outPath, cover)`. Unzips the master, fills the cover fields and version history, converts your content file to WordprocessingML, embeds the figures, re-zips. |
| `content-example.txt` | The worked-example content file. Doubles as the DSL reference and the depth reference - read it to see what "detailed enough to build from" looks like, especially §5.3. |
| `example-figures.html` | The nine example figures, built on the diagram kit, with a Tweaks panel (accent, zone style, corners, density, width, annotation toggles). |
| `figs/t1…t9.png` | Those figures rendered at 2×, ready to embed. |

## Producing a document

1. **Write the content file** using the DSL below, following the section structure in the standard. Copy `content-example.txt` and replace its content - that keeps the section order and numbering correct.
2. **Build the figures.** Copy `example-figures.html`, replace the box/zone content with the real architecture, keeping the `.dgm-*` classes. Then run the **overlap scan** and **contrast audit** from the standard (§5) - both must return zero - and snapshot each `.dgm-fig` at 2× into a figures directory.
3. **Build the document** in a single `run_script` call (two large documents in one call exceeds the budget and nothing is written):

   ```js
   const src = await readFile('templates/detailed-design/authoring/docx-builder.js');
   const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
   const { buildDocx } = await import(url);
   await buildDocx({ readFileBinary, readFile, saveFile, log },
     'templates/detailed-design/authoring/apm-master.docx',
     '<your content file>',
     '<your figs dir>/',
     '<Output_Name>.docx',
     { relPrefix: 'rIdXYZ', imgPrefix: 'xyzfig', idBase: 9600,   // unique per document
       fields: { 'Project Name:': '…', 'Program Name:': '…', 'Division/Unit:': 'Digital',
                 'Document Status:': 'Draft - for review', 'Document Version:': 'V0.1' },
       history: ['<date>', '<author>', '<change note>'] });
   ```

   `relPrefix` / `imgPrefix` / `idBase` **must be unique per document** or relationship IDs collide.
4. **In Word, update the Contents field** (right-click → Update field). The builder cannot refresh it.

## Content DSL

One tag per line, `TAG |content`. Bold with `**…**`.

```
H1 |1. Introduction              top-level section (starts a new page)
H2 |1.1 Purpose                  sub-section
H3 |5.3.2 Address plan           sub-sub-section
P  |Body paragraph.              supports **bold**
B  |Bullet item                  consecutive B lines form a list
NUM|Numbered item                auto-numbered, resets on any other tag
GD |Guidance text                navy "GUIDANCE" callout - exemplar editions only
BQ |Note text                    orange callout - verification tasks, deployment notes
FIG|t4.png|Figure 6. Caption|3040|2240
TBL|2400,3200,3760               starts a table; widths in dxa, must total ~9360
TH |Col A||Col B||Col C          header row (navy, white text, repeats across pages)
TR |Cell||Cell||Cell             body row (zebra shading applied automatically)
END                              ends the table
```

`GD` lines are the teaching apparatus. Keep them for a document circulated as an exemplar; delete them from a real design.

## Two editions

- **Exemplar** (`GD` lines kept) - shows people the expected content and depth. Reference output: `APM_Detail_Design_Document_TEMPLATE_Guidance_and_Worked_Example_V1.0.docx`.
- **Real design** (`GD` lines omitted) - the user's content only. Reference output: `APM_DDD_YubiKey_Phishing-Resistant_Authentication_V0.1.docx`.

## Before you ship

Run the approval checklist at the end of the standard. The two mechanical gates: the overlap scan returns `total: 0`, the contrast audit returns `fails: 0`, and the PNGs were re-snapshotted **after** the last figure edit - embedded images do not update themselves.
