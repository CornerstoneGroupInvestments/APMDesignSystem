# Templates

Reusable starting points. Each folder is self-contained and carries its own README.

| Folder | What it is | Use when |
|---|---|---|
| `detailed-design/` | The DDD and TCD authoring pipeline: `apm-master.docx`, `docx-builder.js`, the content DSL, `qa-checks.js`, `consistency-check.js`, `docx-to-dsl.js`, worked example content and figures | Writing any design document, HLD, DDD or TCD. Governed by `guidelines/detailed-design-standard.md` |
| `emergency-change/` | Emergency change record template, worked example, and the writing rules | Raising any change outside the normal window |
| `participant-kiosk/` | Design Component template: the interactive participant kiosk flow (lock screen, sign-in, bookmark launcher, timeout, session wiped) | Prototyping or demonstrating the participant experience |

## Standing rules for anything written from these

- **Show the settings, not the intent.** Actual values in tables: setting name as it appears in the product, value, rationale.
- **Name the exact object every time.** A policy name, a group name, a CIDR, an account. Never "the policies" or "the group".
- **Every claim resolves to a register.** Policy claims to `policies/`, Azure facts to `reference/eslz/`, Conditional Access to `policies/APM_CA_Policy_Analysis.html`. An invented identifier is the worst defect any of these artefacts can carry.
- **Australian English, no em dashes, roles never personal names.**
