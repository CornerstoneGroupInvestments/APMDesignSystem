# Job Seeker Kiosk DDD - transposition notes

## V1.6 (30 Jul 2026)

Source: `uploads/JobSeeker_Detailed_Design_V1.6.docx` (author's Word draft). Built to `APM_DDD_JobSeeker_Kiosk_V1.6.docx`. `content.txt` regenerated from the V1.6 source via `docx-to-dsl.js` - the V1.6 draft supersedes the V1.5 transposition wholesale (Hybrid Runbook Worker removed, Key Vault posture = public endpoint + Azure RBAC, File Explorer for removable drives, self-deploying Autopilot).

Figure work:
- The source's four text-arrow (▼) pseudo-figures and two control-gate tables were replaced with figures on the diagram kit: **Fig 1** credential pipeline (§5.1.1.1, flowchart with rotation loop), **Fig 2** provisioning flow (§5.1.5), **Fig 5** OneDrive purge timeline (§6.4), **Fig 6** CA + network control-gate flow (§7.2.4, deny outcomes per gate).
- **Fig 3** network zones reinstated at §5.3.1 (dropped from the author's draft) and corrected to V1.6 facts: Automation sandbox instead of HRW, Key Vault public endpoint + RBAC instead of private endpoint.
- **Fig 4** interaction sequence renumbered (was Fig 2); body references to Figures 4/5 renumbered to 5/6.
- Cover version set to V1.6 and a V1.6 row added to the version history (the source cover still said V1.5).
- `qa()` returns `ok: true` across all six figures.

Verify: the V1.6 version-history wording and the Figure 3 lead-in sentence are mine, not the author's.

### F3-only licensing change (same day)

F5 Security add-on removed at the user's direction - the solution carries Microsoft 365 F3 only; Defender for Endpoint P2, Defender for Office 365 P2 and Defender for Identity are APM-licensed separately. Consequences applied: §7.2.1 retitled "F3 Licence Assignment" with a highlighted no-Entra-ID-P2 note; CA-APM-Kiosk-BlockRiskySignIn and CA-APM-AllUsersandGuests-AllApps-BlockHighSigninRisk removed (policy inventory now 6 policies); CA-Base-RiskPolicies removed from the base policy list; the §7.2.4 layered-controls argument rewritten to accept the absence of risk signals openly (device binding as the compensating position, highlighted); Figure 6 redrawn; Figure 1 licence text now "F3" only; component inventory rows now "APM M365 F3".

**Then added as the F3-licensed substitute (all additions highlighted):** CA-APM-Kiosk-BlockNonAU - blocks sign-ins presenting a non-Australian IP (kiosk traffic always egresses via Zscaler's AU datacentres; deterministic, no P2, no per-site config; Zscaler's shared ranges deliberately NOT allow-listed). Policy inventory row 7, full settings table, §7.2.4 targeting + argument updated, Security Controls Alignment row updated, and a Sentinel sign-in anomaly rule added to §9.2 (non-AU attempts, out-of-hours sign-ins, one account from two IPs; playbook disables the account). Figure 6 now shows 9 gates with Location as gate 7. Verify: named location "Australia" must be created in the tenant; Stratus/network to confirm ZIA egress is AU-only for this tenant.

## V1.5 (28 Jul 2026)

Source: `uploads/JobSeeker_Detailed_Design_V1.5.docx` (author's Word draft, 28 Jul 2026).
Built to: `APM_DDD_JobSeeker_Kiosk_V1.5.docx` (project root).
Canonical source from here on: `designs/job-seeker-kiosk/content.txt`.

## What came across

- 122 headings, renumbered from the APM master's own heading styles: 9 × H1, 31 × H2, 53 × H3, 16 × H4, 13 × H5.
- 65 tables, including the 6 merged cells (`gridSpan`) and every multi-paragraph cell.
- **424 yellow-highlighted runs**, carried through as `==…==` in the DSL and re-emitted as `w:highlight="yellow"`. Highlight survives every rebuild, including inside table cells, headings and the V1.5 version-history row.
- Both figures, embedded at their original aspect ratio with new captions (the source had none).
- Cover fields and the full 7-row version history, rebuilt in the master's own table styling.

## What changed in the move

| Change | Why |
|---|---|
| Em dashes replaced with a spaced hyphen (0 remain) | House rule. Affected 8 headings, e.g. "Windows App Deployment - removed (Plan C: no AVD…)". |
| Spaced en dashes normalised to a hyphen | Same. Numeric ranges left alone. |
| People replaced with roles (see map below) | Project rule: roles only, never individual names. |
| "ComputersNow" → "CompNow" | The device-prep partner's actual name. |
| `", ,"` in §1.1 collapsed to a single comma | Left over from an edit in the source. |
| Figure captions written | The source images were uncaptioned; the standard requires numbered captions. |
| Cover `Document Owner` / `Contact Details` set to the role, not the individual | Same anonymisation rule. |

### Name → role map

| Source | Rendered as | Where |
|---|---|---|
| Jensen Spencer | the APM Business Owner | printing operating-model approval (§3.2.1 R16-R18, §5.2.2) |
| James Muller / James | APM Digital lead | decision register DR-001, DR-003, DR-005, DR-010 |
| Michael Barker | APM Infrastructure lead | DR-008, DR-010 |
| Ben Riches | APM Cyber lead | DR-010 |
| Ugbaad (cybersecurity) | APM Cyber Security | assumption A-07 |
| Samit Chandra | Head of Digital Transformation & Architecture | cover |

**Confirm these role labels.** They are inferred from the context each name appeared in, and three of them sit in approval columns where being wrong matters.

## Figures

Both figures were rebuilt on the diagram kit in `figures.html` (28 Jul 2026) and re-snapshotted at 2×. `qa()` returns `ok: true` - overlap, contrast, overflow, escapes, orphans, legend and occlusion scans all zero.

- **Figure 1 - Kiosk logical network and security zones (§5.3)**: four zones (site, perimeter, approved destinations, apmkiosk.net.au subscription) carrying the real facts - VLAN 73, `10.73.0.0/16` with a `/26` per site, 20 Mbps, hidden SSID with PSK from Intune, Palo Alto default deny, Zscaler IPSEC to ZIA, Key Vault private-endpoint-only, in-VNet Hybrid Runbook Worker.
- **Figure 2 - Kiosk to internet interaction sequence (§5.3.3)**: eight steps, no AVD or RDP hop; ends on idle sign-out clearing the profile.

The replaced Visio exports showed `AVD Client`, `AVD Session` and `VDI Subnet`, contradicting the Plan C body copy. Both are now consistent with §5.3.

**Figures are authored at 760px wide** so that 13px diagram text lands near 8pt once the PNG is placed at 6.04in in Word. A 1520px canvas (as in `example-figures.html`) prints at roughly 3.7pt and is unreadable. Also note the SVG overlay carries an explicit pixel `width`/`height` matching its `viewBox`; leaving it on percentages made the browser scale the wires about 31px away from the boxes they annotate.

## Outstanding - not fixed in this pass

1. **No Appendix A (acronyms).** **No Appendix A (acronyms).** The source has none and the standard requires one. Not invented.
3. **21 Word comments in the source were not carried across.** If any of them are unresolved review points they need to move into `uploads/10_Decisions_and_Open_Items.md`.
4. **§5.3 has not been re-tested against the nine-point network bar** in the standard. The Plan C rewrite removed the AVD network sections, so the routing/DNS/egress tables need re-reading as a set.
5. **Contents field.** Word cannot refresh it from here - right-click → Update field on first open.
6. **39 remaining "AVD" mentions and 11 "Nerdio"** - most are deliberate ("removed (Plan C…)"), but worth a read-through for ones that still describe live behaviour.

## Rebuild

```js
const src = await readFile('templates/detailed-design/authoring/docx-builder.js');
const { buildDocx } = await import(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
await buildDocx({ readFileBinary, readFile, saveFile, log },
  'templates/detailed-design/authoring/apm-master.docx',
  'designs/job-seeker-kiosk/content.txt',
  'designs/job-seeker-kiosk/figs/',
  'APM_DDD_JobSeeker_Kiosk_V1.5.docx',
  { relPrefix: 'rIdJSK', imgPrefix: 'jskfig', idBase: 9800, fields: { … }, versionRows: [ … ] });
```
