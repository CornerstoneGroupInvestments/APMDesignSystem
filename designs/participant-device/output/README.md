# Build artefacts - Participant Kiosk

**Current document set, all rebuilt 10 Sep 2026** from the 27 review comments on the TCD and the final signed scripts: **Detail Design V1.7**, **Technical Configuration Document V2.3**, **as-built V1.9**. All three carry the same corrected facts.

**One fact landed after the first rebuild and rippled through all three.** All ten scripts are now signed, which closes SOE-02 but invalidates the four time and time zone hashes recorded across the set - signing changes the file, so they were taken from the pre-signing copies and must be recomputed. 7 characters, so the serial cap must be 13, not the 14 the signed script still uses. And all ten scripts are now signed, which closes SOE-02 but invalidates the four time and time zone hashes recorded across the set - signing changes the file, so they were taken from the pre-signing copies and must be recomputed.

**The device name template is `APM-PK-%SERIAL%`** (previously recorded as `%RAND:6%` under DR-018), yielding `APM-PK-<SERVICE TAG>`, 13 characters. The **session account** is `Kiosk-<SERIAL>` from the same service tag - deliberately a different name, so no local account collides with the computer name. Both names went through a wrong intermediate state during this revision; the device is `APM-PK-`, the account is `Kiosk-`.

**Placeholder notation is square brackets, never escaped angle brackets.** `docx-builder.js` escapes the ampersand, so `&lt;SERIAL&gt;` in the DSL renders as the literal text `&lt;SERIAL&gt;` in the built document. Nineteen occurrences shipped that way across the as-built and the TCD before it was caught. Write `[SERIAL]`.3 characters. Windows may refuse a local account whose name matches the computer name; if it does, it fails on every device at account creation, leaving no automatic logon. That bench test is the highest-priority open item in all three documents (as-built open item 20, Detail Design R-16). The serial cap must also fall from 14 to 13 - `APM-PK-` is one character longer than `Kiosk-`, and a Parallels serial sanitises to 14 characters, which would overflow the 20-character SAM limit.

**Two sources look like the design and only one is.** `content-detail.txt` (35 headings) is the Detail Design of record and builds `APM_Detail_Design_ES_Participant_Kiosk_*.docx`. `content.txt` (134 headings) is the **superseded single-tier DDD** whose last build is `APM_DDD_Participant_Kiosk_V1.6.docx`; it now carries a superseded-source marker on its first line. A whole revision was applied to the wrong one of these before the heading count gave it away - the built docx had 35 headings and `content.txt` has 134. Check the heading count against the document you are revising before editing either.

**Current build documents:** `APM_DDD_Participant_Kiosk_V1.6.docx`, `APM_Detail_Design_Participant_Kiosk_V1.2.docx` and `APM_TCD_Participant_Kiosk_V1.2.docx` (all 14 Aug 2026), in sync with `../content.txt`, `../content-detail.txt` and `../content-technical.txt` respectively.

**As-built records.** `APM_AsBuilt_ES_Participant_Kiosk_Solution_V1.5.docx` (10 Sep 2026, from `../content-asbuilt.txt`) is the solution-wide configuration record: 20 sections, 59 tables, 5 figures, a console map, a routine maintenance schedule with a named owner per task, the change-controlled items, and a script register carrying the SHA-256 and signed state of all ten scripts. `APM_AsBuilt_Participant_Kiosk_Conditional_Access_V1.0.docx` remains the CA-107 build and verification record.

**Current design set, all rebuilt 10 Sep 2026 from the 27 TCD review comments and the final signed scripts:** DDD V1.3, TCD V1.1, as-built V1.5. All three carry the same corrected facts; the three DSL sources are the only place any of them is edited.

**V1.5 corrected the Autopilot deployment profile name to `CDG W11 Autopilot SelfDeploying`** - spaces, no hyphens - in all four documents including the CA-107 device filter. The filter matches `device.enrollmentProfileName` as a literal string, so as previously documented it could never have matched, and the fleet would have satisfied both corporate grant policies with nothing blocking it. This is the exact failure the change-control section warns about, found in a review comment rather than in production.

**V1.4** records how the fleet is kept off the estate baseline: the kiosk device group is a member of the App Control policy `APM-W11-SEC-ACfB Exclusion-P`, not a plain assignment exclusion. That membership is the single object separating the two App Control models, so it is a change-controlled item and a half-yearly check.

**V1.3 replaced the App Control model.** Base policy duplicated from the estate enforced baseline plus a supplemental policy carrying the application rules. **Two facts the document had been asserting became untrue and had to be removed, not just amended:** "No supplemental policies", and script-enforcement-on / signed-policy-only. A duplicated estate policy inherits the estate's rule options, which are the opposite of both.

**V1.2 added section 9, Time and Time Zone**, which pushed sections 9-19 up by one. Renumbering the DSL is safe to do programmatically **only because every cross-reference is `[[n.m]]`** and the consistency checker's TREE and XREF checks validate the result - grep for `[Ss]ection [0-9]` first to confirm no plain-prose section reference exists, then shift headings and refs and re-scan. The heading regex must allow the bare trailing dot: `H1 |9. Applications` has `9` + `.` + space, so a pattern expecting `(?:\.\d+)*` before the space matches H2 lines and silently skips every H1, which half-renumbers the document.

**V1.1 records the move from Win32 applications to remediation pairs.** The idle restart (4.0) and the session cleanup (2.0) are Intune remediation pairs, so the Win32 application count is four, not six. The idle restart no longer polls for idle time: the secure screen saver locks the console at 600 seconds, the lock writes Security event 4800, and a scheduled task filtered to that event and to the resolved session account restarts the device.

**The DSL cannot carry a verbatim code listing, and the failure is silent.** `==` and `**` are highlight and bold markers that `runs()` consumes and removes, so a batch line such as `if "%PHASE%"==""` renders without its `==` and ships subtly wrong. `CODE|` is not a directive either - the line regex accepts only `H1`-`H5`, `GD`, `BQ`, `NUM`, `B`, `P`, `FIG`, `TBL`, `TH`, `TR`, `END`, and anything else is dropped with no warning (1717 appendix lines vanished this way before the register replaced them). Script text belongs in `config/`; the document carries a hash-identified register pointing at it.

**An as-built must be built on the v2 builder** (`templates/detailed-design-v2/authoring/docx-builder.js`). It is a superset of the tier-1 builder, and the only difference that matters is `[[x.y]]` cross-reference resolution: the tier-1 builder silently emits the literal `[[15]]` into the document text and logs nothing. The first build of the solution as-built shipped 83 unresolved references that way, and every other assertion passed. Check the log for `xrefs=n bookmarked`, and grep the extracted text for `[[`.

**Three open items carry into review as DR-021, DR-022 and DR-023** (Assigned Access configuration ownership, the Shut down the system user right for the session account, and the profile deletion mechanism of record at restart). They are recorded in both Decision Registers and are not resolved in the build.

**Appendix script blocks are generated, not hand-edited.** A.2.1, A.2.2, A.4.1, A.4.2, A.5.1 and A.5.2 are regenerated from the live files in `../config/intune-upload/` (one `P |` line per source line), so the appendix cannot drift from the scripts an engineer actually uploads. Change the `.ps1`, then regenerate the block - never edit the appendix prose copy of a script. Carries all 43 review comment threads from the V1.2 stakeholder review (Nick Dorbie, Chris Katigbak, Phil De'ath, David Badger, Ugbaad Adani), left open/unresolved by design so the reviewers get resolution notifications when they close their own threads.

V1.5 / TCD V1.1 correct the deployment mechanism stated for the idle restart and profile purge: both are Win32 applications carrying two files each, matching the build sequence and Appendices A.4 and A.5. The earlier "Intune platform script" and "ADMX plus a signed shutdown script" summaries in DDD 4.3.2 / 4.3.7 and TCD 12.1.5 / 12.1.7 were stale and contradicted the build steps.

`APM_DDD_Participant_Kiosk_V1.2.docx` is retained as the previous issue. Do not circulate it: it names the retired `APM-USER-CAP-...` policy and wrongly lists phishing-resistant MFA among the tenant's enforced protections.

## Rebuild - as-built (solution)

```
buildDocx(helpers,                                   // from detailed-design-v2/authoring
  'templates/detailed-design/authoring/apm-master.docx',
  'designs/participant-device/content-asbuilt.txt',
  'designs/participant-device/figs/',
  'designs/participant-device/output/APM_AsBuilt_ES_Participant_Kiosk_Solution_V1.9.docx',
  { relPrefix: 'rAB', imgPrefix: 'abpkFig', idBase: 7300, fields: {...}, versionRows: [...] })
```

## Rebuild - DDD

```
buildDocx(helpers,
  'templates/detailed-design/authoring/apm-master.docx',
  'designs/participant-device/content.txt',
  'designs/participant-device/figs/',
  'designs/participant-device/output/APM_DDD_Participant_Kiosk_V1.3.docx',
  { relPrefix: 'rIdPK', imgPrefix: 'pkfig', idBase: 9900, fields: {...}, versionRows: [...] })
```

Then re-inject the review comments with `../rebuild-with-comments.js`.

## If the build times out

It reads the master (1.9 MB) plus ten figures in one call. When project I/O runs slow (4-10 seconds per read, as on 7 Aug 2026) twelve reads can exceed a single script budget.

Two mitigations, both already applied:

1. **Figures are exported at 0.6 scale** (roughly 912 px wide, about 0.15 MB each). The `FIG|` lines in `content.txt` carry explicit width and height, so Word places them at the same physical size regardless of pixel dimensions - re-exporting at a different scale needs no content change. The built document dropped from 8.8 MB to 7.4 MB.
2. **Comment injection runs as a separate pass.** `config/comment-parts.json` holds the five comment parts extracted from the V1.1 review copy, so the injector never has to open that file again. If `rebuild-with-comments.js` times out, build the document first, then inject from `comment-parts.json` in a second call.
