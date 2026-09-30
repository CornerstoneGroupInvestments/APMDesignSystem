# Change requests

Real, filed change requests against the running environment. Distinct from `designs/` (what to build) and `templates/emergency-change/` (the blank template and a worked example).

A change request lives here when it answers "what do we remove or alter in the running tenant, subscription or estate" rather than "what should we build." Built on `templates/emergency-change/EMERGENCY-CHANGE-TEMPLATE.md`: plain Markdown, no DDD structure, no docx pipeline, no apm-master.docx.

| Change | Folder | Status | Approver |
|---|---|---|---|
| Job Seeker Kiosk Decommissioning | `kiosk-decommission/CR-Kiosk-Decommissioning.md` (+ `output/CR-Kiosk-Decommissioning.docx`) | Draft - for Change Advisory Board approval | Change Advisory Board |

## Producing a Word copy

`build-docx.js` converts a change-request Markdown file straight to a plain `.docx` - no cover fields, no apm-master.docx, no DDD styling. Headings, tables, bullets and bold/code/italic spans only.

```js
const src = await readFile('change-requests/build-docx.js');
const { buildChangeRequestDocx } = await import(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
await buildChangeRequestDocx({ readFile, saveFile }, 'change-requests/<slug>/<name>.md', 'change-requests/<slug>/output/<name>.docx', { title: '<doc title>' });
```

Re-run it after every edit to the source Markdown - the `.docx` is a build artefact, not a second source of truth.

## Why this is separate from `designs/`

A design document argues an architecture: business case, decisions, control mapping, what to build. A change request is a checklist against the live environment: exact object, exact location, exact action, bounded risk, backout. Building a change request through the DDD docx pipeline produces a document that reads and looks like a design - wrong genre, wrong expectations for the Change Advisory Board reading it.

## Rules, same as `templates/emergency-change/README.md`

- One action per line, imperative verb first, exact object named every time.
- Every risk line states the risk and what bounds it.
- Every test has an objectively true-or-false pass criterion.
- The test plan tests this change only - everything else goes in Out of scope.
- Every object named must resolve against the relevant register (`policies/APM_CA_Policy_Analysis.html` for Conditional Access, `reference/eslz/` for Azure facts) before submission.
