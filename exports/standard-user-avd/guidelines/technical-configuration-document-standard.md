# Technical Configuration Document (TCD) - authoring standard

Companion to `guidelines/detailed-design-standard.md`. That standard governs the design (what to build and why). This one governs the tier-3 Technical Configuration Document (how to build it), produced on `templates/detailed-design-v2/authoring/technical-master.docx`.

**The bar, and it is higher than the DDD's:**

> An engineer with limited product knowledge builds the entire solution from this document alone, in the order it is written, without opening the design document and without asking a question. Every step is a place they can click, a field they can fill, a toggle they can set, or a block they can paste.

If a step describes intent, names a setting without its value, or references a file that does not exist, the document is not finished.

---

## 1. Order the document by build dependency, not by template taxonomy

The master template's section list is a taxonomy (Solution Design, Technology Architecture, Cyber, Threat Management). An engineer cannot build from a taxonomy. Add a **Build Sequence** section inside Solution Design that walks the whole build in dependency order, and let the taxonomy sections hold the reference tables it points at.

Phase order that worked, and why each phase must precede the next:

| Phase | Contents | Why here |
|---|---|---|
| 1 | Identity groups, then the corporate assignment exclusion register | Nothing can be assigned before the groups exist; exclusions must land before the first device enrols or estate policy reaches the fleet |
| 2 | Enrolment (hardware registration, deployment profile, enrolment status page) | Devices must be able to arrive before anything is targeted at them |
| 3 | Compliance policy, then Conditional Access **in report-only** | Compliance state feeds CA; CA enforced before pilot validation locks people out of their own build |
| 4 | Network, Wi-Fi, certificates | A device that cannot reach the management plane cannot receive anything below |
| 5 | Session/lockdown profiles and their scripts | Depends on the account and session model existing first |
| 6 | Browser, applications, peripherals, local password management | Depends on the lockdown model being in place |
| 7 | Application control, audit first, enforced **held back** | Enforcing before pilot validation can brick a fleet |
| 8 | Patching and content distribution | Needs the device population registered and stable |
| 9 | Pilot, validate, **then** flip the two held-back controls (CA to On, App Control to Enforced), then roll out | The only safe order |

State the hard prerequisites at the top of the sequence ("steps 1-4 in Phase 1 are prerequisites for every later phase") and cross-reference them to the Dependencies table.

---

## 2. Every step is a breadcrumb plus a table

**The failure to avoid:** cramming a dozen settings into one bolded paragraph. It renders as an unreadable wall and a technician loses their place mid-build. Reviewer feedback on exactly this: *"table form, user can't read this."*

**The pattern:**

1. One numbered step, opening with the **full console path in bold**, using `>` separators, ending with the exact object name to create:
   `**Intune admin centre > Devices > Configuration profiles > Create > Windows 10 and later > Settings catalog.** Name it CDG-W11-SEC-Edge Hardening-P-1.0`
2. Immediately below it, a `Setting | Value` table - one row per field, in the order the console presents them.
3. Anything below three settings can stay inline. Anything more goes in a table.

Name the **tab or blade** each group of settings lives under, not just the profile. "Compliance settings > Device Health tab" and "Actions for noncompliance tab" save an engineer hunting through a wizard.

Where a full settings table already exists elsewhere in the document, the build step references it (`Full setting table: 12.6`) rather than repeating it. One fact, one home, and it keeps the sequence readable.

---

## 3. Scripts and pasteable blocks

**Reproduce every script and every pasteable value in full, in an appendix.** A filename reference is not a build instruction. If the document says "use the signed idle-watchdog script", an engineer needs that script.

- Label them unmistakably: **"This is a script paste item"** / **"full script, copy and paste"**. An engineer must never have to work out whether a step is click-through configuration or a paste.
- Give each one its console breadcrumb, its OMA-URI (where applicable), its data type, and its assignment.
- Include the *supporting* scripts too - the ones that stage a file, register a scheduled task, or set ACLs. This session shipped three scripts that the document had been instructing an engineer to use while they did not exist anywhere: the idle watchdog installer, the session purge, and the wallpaper staging script.
- Reproduce structured values in full as well: the managed-favourites JSON, ADMX/registry value sets, XML configurations.
- Keep the file on disk in the design's `config/` folder as well as in the appendix, so it is version-controlled and the appendix can be regenerated from it.

**Some artefacts genuinely cannot be pre-built.** A WDAC policy XML references the real signer certificates of the binaries as installed, so it must be generated on a reference device. When that is the case, ship the **command sequence** instead: the generation command with every switch, each rule option as its own command, the manual review step, the signing step, the rollback artefact, and the deployment path. Never leave "author the policy" as the instruction.

---

## 4. Hunt for the trap where two similar objects deploy differently

The single highest-value thing this session surfaced: the audit and enforced application-control policies look like one object built twice, and they are not.

- The audit policy deploys **unsigned** through the built-in Intune profile, because a pilot needs to be able to remove it by deleting the profile.
- The enforced policy **cannot** use that profile at all. It must be converted, signed, and deployed as a Base64 binary to a custom OMA-URI.
- And the signing certificate must be written into the policy's own `UpdatePolicySigners`, or no future policy can ever replace it and the only recovery is reimaging.

Look for this class of trap in every design: two objects with the same name stem, one of which has a different delivery mechanism, a different signing requirement, or a different console entirely.

---

## 5. Exclusions are configuration, and need the same detail as creations

For every estate object the fleet must be excluded from, give:

- The **real object name**, grounded in an actual tenant export - not a wildcard or a guess. Placeholder names like `APM-*-SEC-AppControl` are unusable at the keyboard; the real objects were `APM-WIN-SEC-ACfB Audit Baseline-P-1.0` and `APM-WIN-SEC-ACfB Enforced Baseline-P-1.0`. Read the uploaded admin-centre exports and worksheets before writing this table.
- The **console path to the exclusion field**: `... > [policy] > Properties > Assignments > Exclude > Add group`.
- The **group to exclude**, by name.
- What replaces the excluded control in this build.

Two cases that need stating explicitly rather than leaving blank:

- **Where no exclusion is needed**, say so and say why. A blank row reads as an omission. Grant policies overridden by a block policy need no exclusion, and that is worth a sentence.
- **Where an exclusion is not possible.** A policy whose fixed-drive settings are inherited but whose removable-drive settings must differ cannot be excluded by group at all; it needs a higher-priority conflicting profile and a pilot test to confirm the conflict resolves as expected.

---

## 6. Verify product behaviour against vendor documentation, and record the constraint as fact

Do not write product mechanics from memory. This session found a real defect by checking: `AllowedNamespace` belongs to the `rs5` namespace, not `v3` (only `AllowRemovableDrives` and `NoRestriction` are `v3`). The design had carried it wrong.

Also check for **known issues on the target build**, and give the fallback. `FileExplorerNamespaceRestrictions` enforcement is inconsistent on current Windows 11 cumulative updates; the document states the fallback and points at the test that validates it, rather than assuming it works.

Record the finding as a fact with its source, in a reference appendix. Not as a narration of the checking.

---

## 7. Facts, not commentary

Same rule as the DDD standard, and it is easy to breach in a TCD because verification work feels worth reporting. It is not.

- **Out:** "Confirmed against Microsoft Learn", "corrected in this document", "this document does not repeat the DDD's figures", "nothing here is a new value, only the sequence", "listed for completeness because it was raised in review".
- **In:** the settled value, the constraint, the source citation where a fact needs support.
- **Version History for an initial build is one row.** "Initial issue." Do not log the authoring iterations as version rows; they are not versions of the document anyone received.
- **Every version row records a change to the DESIGN, never to the document's authoring.** "Idle restart deployed as a Win32 application rather than a platform script" is a version row. "Editorial pass", "re-exported the figure", "removed explanatory text from 4.2", "converted cross-references to hyperlinks" are not - the reader wants what is different about the build, not what the author did to the file.

**Two further rules apply to every design in this project and are not restated here** - see `guidelines/detailed-design-standard.md`:

- **2a. Write like a person, not like a machine.** No "it is important to note", no "leverage", no "robust", no rule-of-three flourishes. Active voice with a named actor. A console breadcrumb is an instruction, not a sentence to dress up.
- **2b. Cross-references name the section and link to it.** Write `[[12.6]]` in the DSL and the builder renders "12.6 Patching" as a live hyperlink. Applies to internal references only: a reference into the companion Detail Design Document stays plain text and names the document ("Detail Design Document, 5.3.4"), because the link cannot leave the file.

---

## 8. Cross-references to the design document

A TCD extracted from a DDD will reference the DDD constantly. Label it, once, near the top: section references point into the DDD unless a heading in this document is named. Then use the DDD prefix in the body where ambiguity is possible (`DDD 5.1.5`).

`consistency-check.js` will report XREF findings for every DDD reference and FIGREF findings for every DDD figure cited. **These are expected, not defects** - the checker only sees one document. Read the list, confirm each finding is a DDD reference, and move on. What you are looking for in that output is an *internal* reference that does not resolve, which is a real defect.

---

## 9. The gap audit, run before shipping

Read the document as the engineer, and for every step ask the mechanical question:

| If the step says | Check |
|---|---|
| "use the X script" | Does X exist, in full, in an appendix and in `config/`? |
| "paste the Y JSON/XML/value" | Is the complete value in the document? |
| "full detail: section Z" | Is Z in **this** document, or only in the DDD? |
| "create policy P" | Is every field of P specified, with its tab, and its assignment? |
| "exclude the fleet from Q" | Is Q's real name given, with the path to its exclusion field? |
| "sign it" | Is it stated what signs it, and what happens if that is skipped? |
| "assign to group G" | Was G created in an earlier phase? |
| a value came from the DDD | Did the DDD actually specify it, or is it being invented here? |

Then run the decommission cross-check, if the build replaces an existing environment: for every artefact the decommissioning change request destroys, confirm the new build either rebuilds it or states plainly that it is deliberately not rebuilt. A control the old environment had and the new one silently lacks is the defect this catches.

Finally, check that any **claim made to the end user** has a control behind it. The participant wallpaper states files are deleted after ten minutes of inactivity; the idle-restart and purge scripts are what make that true, they are built in an earlier phase than the wallpaper, and the wallpaper step cross-references them and requires their tests to pass first.

---

## 10. Build pipeline traps (DSL and tooling)

These cost real rework this session. All of them produce a document that looks fine in source and is broken on the page.

- **Never write `&gt;` or `&lt;` in the DSL source.** `docx-builder.js` escapes raw characters itself, so an entity in the source becomes `&amp;gt;` and renders as visible `&gt;` text throughout the document. Write raw `>` and `<` and let the builder escape them. `&amp;` is the exception: it round-trips correctly and is the house convention for "and" in headings.
- **Never let a literal `\n` reach the file.** An escaped newline inside a tool parameter embeds the characters `\nNUM|` into a paragraph as visible text. Multi-line insertions belong in a `run_script` with real newlines, or in separate edits.
- **Never use a heading as a replace anchor without reproducing it.** Matching on `H1 |5. Technology Architecture` and replacing it with new content silently deletes that heading; the only trace is a numbering gap that `consistency-check.js` TREE catches. End the replacement with the heading line.
- **Rebuild and re-run the consistency check after every content edit**, not just before shipping. Both are seconds; a stale build is what gets downloaded.
- The technical-configuration master's own section numbering skips section 3. That is APM's template, used in exact form; TREE will report it every run. Do not renumber to silence it.

---

## 11. What a finished TCD contains

- Build Sequence in dependency order, every step a breadcrumb plus a table
- Every policy with every field, its tab, and its assignment
- Every exclusion with its real object name and console path
- Every script in full, labelled as a paste item, and on disk in `config/`
- Every structured value in full (JSON, XML, ADMX/registry sets)
- A command sequence for anything that cannot be pre-built
- Test plan with binary pass criteria, and the two held-back controls tied to it
- Sections that do not apply marked `N/A` with a one-line reason, heading kept
- One version row for an initial build, and no commentary anywhere
