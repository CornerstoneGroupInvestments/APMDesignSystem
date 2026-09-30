# Reference

Standing reference material. Not deliverables, not designs - the things designs are built against and checked against.

| Folder / file | What it is |
|---|---|
| `eslz/` | **APM ESLZ Reference Corpus** (4 parts + full concatenation). Authoritative for every APM Azure fact. Its `README.md` carries the marker discipline (`[CORPUS]` / `[EXTERNAL]` / `[UNKNOWN]` / `[UNRECONCILED]` / `[PROPOSED]`), the source-precedence rules and the five consequential open items |
| `environment/` | As-built and environment source documents: Azure Landing Zone (APAC) DDD v1.1, Palo Alto Firewall Deployment As-Built V1.0, Azure ESLZ Naming Standards, APM AVD Test Network Detail Design V0.2 (the non-production environment the Standard User SOE on AVD builds in, DR-018) |
| `apm-document-templates/` | APM's own templates: Detail Design Document (V0.1, V0.2), Detailed Design (V1.0, V1.1), High Level Design (V1.0, V1.1), Technical Configuration Document V0.1, Architecture Design Review deck V0.1 |
| `design-capability-briefing.md` | The craft reference for producing DDDs, TCDs and native-PowerPoint diagram packs: 37 numbered diagram rules, audience laddering with a machine-checkable collapse map, PowerPoint editability engineering with the OOXML and python-pptx limits named, the full token / primitive / component model with real values, the one-model-many-outputs pattern, render-path ceilings, and 16 named failure modes each with automated detection |

## How this is used

- **Any design touching Azure** reads `eslz/` first and cites it. `policies/environment-config.js` raises the corpus facts automatically as advisory interactions when a design trips its scope gate.
- **Any diagram** follows the rules in `design-capability-briefing.md` on the design system's diagram kit (`tokens/diagrams.css`).
- **Any document** follows `guidelines/detailed-design-standard.md`; `apm-document-templates/` is what APM's own structure looks like, for reconciling section order and the SDA approval path.

Policy and standard source documents live in `policies/`, not here.
