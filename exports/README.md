# Exports

Self-contained project bundles. Each folder holds one solution's design folder plus only the guidelines, reference material, policy sources and pipeline files that solution cites, with its own `CLAUDE.md` so the project instructions apply from the first turn of a new project.

| Bundle | Solution | Documents | Uses AVD/Nerdio |
|---|---|---|---|
| `es-participant-kiosk/` | ES Participant Kiosk Solution - physical Dell device in Employment Services sites, Assigned Access, unattended AutoLogon | Design Definition V1.1, Detail Design V1.2, Technical Configuration V1.8, baseline build sheet V1.0 | No |
| `standard-user-avd/` | Standard User SOE on Azure Virtual Desktop - Windows 11 Enterprise multi-session, pooled host pool, FSLogix on Azure Files | Detail Design V1.2. Tiers 1 and 3 not written | Yes |

## How a bundle is made

1. Copy the design folder as it stands: content sources, `figures.html`, `figs/`, the current built document, `history/`, `config/`, `kb/`.
2. Copy `styles.css` and `tokens/` so `figures.html` still renders on the diagram kit. The link from `designs/<slug>/figures.html` is `../../styles.css`, which resolves inside the bundle unchanged.
3. Copy the pipeline the design is built on, plus `qa-checks.js` and `consistency-check.js`.
4. Copy only the `policies/` and `reference/` files the design actually cites. State what was left out and why in the bundle's `README.md`.
5. Write the bundle's `CLAUDE.md`: the solution in one paragraph, the document table, the rebuild recipe with its reserved `relPrefix`/`imgPrefix`/`idBase`, cover fields, the writing and confidentiality rules, and an open-items table with a named owner per row.
6. Add the row above.

## Rules

- **A bundle is a copy, not a fork.** The design system project stays the source of truth. If a bundle is worked on independently and changes, the change comes back here before the next build in this project.
- **Never bundle the whole policy corpus, the program plan or the other designs.** A bundle carries what its own document cites, and its `README.md` names what was deliberately left out.
- **The reserved `relPrefix`/`imgPrefix`/`idBase` travel with the design,** so a document rebuilt in a bundle and a document rebuilt here produce the same relationship IDs.

## Known condition: duplicate pipeline exports

Every bundle carries its own copy of `docx-builder.js` and `consistency-check.js`, because a bundle that cannot build its own document is not self-contained. Identical named exports across bundles collide in the design system's compiler, so **from `standard-user-avd/` onward a bundle's pipeline copies expose a default export instead of named ones**: `export default { buildDocx }` and `export default { scan, parse }`. The loader destructures from `.default`, and each bundle's `CLAUDE.md` and `README.md` carry the matching recipe. Apply the same shape to the next bundle rather than adding a second named copy.
