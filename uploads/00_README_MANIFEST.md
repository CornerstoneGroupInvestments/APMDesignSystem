# APM JobSeeker Kiosk SOE — Export Manifest & README

**Part 0 of the export.** This bundle is the complete, anonymised context for the **JobSeeker Kiosk SOE** — one of four SOEs in APM's broader AVD-via-Nerdio programme. The other three SOEs are **not** in this bundle.

## Bundle structure

```
APM_Kiosk_SOE_Export/
  00_README_MANIFEST.md   <- this file
  01_CONTEXT_BRIEF.md     <- Part 1 (prose briefing, 7 sections)
  artifacts/              <- Part 2 (every artifact, full verbatim, anonymised)
    _from_docx/           <- Word docs converted to Markdown
    _from_xlsx/           <- Excel sheets converted to Markdown tables
    outputs/ scope/ evidence/ inputs/   <- mirror of the source layout
```

## Anonymisation applied (verbatim except these substitutions)

| Original | Replaced with |
|---|---|
| Delivery consultancy names | **Twiki Corp** / **the project team** |
| Delivery individuals | **the project team** (role only) |
| Design author (individual) | **the design author** |
| Network/cyber lead (individual) | **the APM network lead** |
| Decision approver (individual) | **the APM approver** |
| Device-prep supplier | **the device-prep partner** |
| Licensing supplier | **the licensing reseller** |

> Leak check after substitution: **0 source names remained** across all staged files. Client name **APM** and product/vendor names (Microsoft, Azure, Entra, Intune, Nerdio, Zscaler, Palo Alto, Meraki, Dell) are intentionally retained.

## Manifest — every artifact exported

Type/version/date are inferred from filenames and source metadata. All content is full verbatim (anonymised); tables rendered as Markdown; Word/Excel converted to Markdown.


### Governance & design

| # | Artifact (path in bundle) | KB |
|---|---|---|
| 1 | `artifacts/_from_docx/APM-AVD-Test_Network-DetailDesign-V0.2.md` | 44.2 |
| 2 | `artifacts/_from_docx/APM_Job_Seeker_Kiosk_-_Infrastructure_Spec.md` | 60.9 |
| 3 | `artifacts/_from_docx/JobSeeker_Detailed_Design_V0.3.md` | 118.6 |
| 4 | `artifacts/_from_xlsx/JobSeeker_DD_Implementation_Effort_v0.1.md` | 10.1 |
| 5 | `artifacts/_from_xlsx/JobSeeker_WBS_v0.3.md` | 14.7 |
| 6 | `artifacts/_from_xlsx/Project_WBS_Import_Template.md` | 0.3 |
| 7 | `artifacts/outputs/JobSeeker_Permission_Requirements_v0.1.md` | 36.9 |
| 8 | `artifacts/outputs/JobSeeker_Permission_Requirements_v0.2.md` | 36.9 |
| 9 | `artifacts/outputs/JobSeeker_Proposed_Changes_and_Open_Decisions_v0.1.md` | 12.7 |
| 10 | `artifacts/outputs/JobSeeker_Proposed_Changes_and_Open_Decisions_v0.2.md` | 15.6 |

### Implementation plan (all versions)

| # | Artifact (path in bundle) | KB |
|---|---|---|
| 11 | `artifacts/outputs/JobSeeker_Implementation_Plan_v0.2.md` | 214.7 |
| 12 | `artifacts/outputs/JobSeeker_Implementation_Plan_v0.2_infra_review_v1.md` | 35.2 |
| 13 | `artifacts/outputs/JobSeeker_Implementation_Plan_v0.3.1.md` | 296.1 |
| 14 | `artifacts/outputs/JobSeeker_Implementation_Plan_v0.3.2.md` | 300.1 |
| 15 | `artifacts/outputs/JobSeeker_Implementation_Plan_v0.3.3.md` | 347.8 |
| 16 | `artifacts/outputs/JobSeeker_Implementation_Plan_v0.3.md` | 300.1 |

### Change register & evidence

| # | Artifact (path in bundle) | KB |
|---|---|---|
| 17 | `artifacts/CLAUDE.md` | 6.2 |
| 18 | `artifacts/evidence/Probe-WdacLanguageMode.ps1` | 0.8 |
| 19 | `artifacts/evidence/as-built-register.md` | 116.2 |
| 20 | `artifacts/evidence/aumid-verification.md` | 1.5 |
| 21 | `artifacts/evidence/code-staging-lint.md` | 5.8 |
| 22 | `artifacts/evidence/pilot-shelllauncher-bench-2026-06-10.md` | 5.1 |
| 23 | `artifacts/evidence/windowsapp-package-0x80070000-2026-06-11.md` | 6.8 |

### Build runbooks & procedures

| # | Artifact (path in bundle) | KB |
|---|---|---|
| 24 | `artifacts/outputs/JobSeeker_WP-2.10_GoldenImage_CLIOnly.md` | 27.3 |
| 25 | `artifacts/outputs/JobSeeker_WP-2.10_GoldenImage_ExecutionSheet.md` | 18.5 |

### Scope / research / reviews

| # | Artifact (path in bundle) | KB |
|---|---|---|
| 26 | `artifacts/scope/dd-drift-review-2026-06-10.md` | 18.6 |
| 27 | `artifacts/scope/findings-v0.3.md` | 31.4 |
| 28 | `artifacts/scope/findings.md` | 43.3 |
| 29 | `artifacts/scope/fve-network-design-review-2026-06-10.md` | 8.8 |
| 30 | `artifacts/scope/fve-network-design-review-v0.2-reissue-2026-06-11.md` | 10.2 |
| 31 | `artifacts/scope/nerdio-scripts-signing-wdac-2026-06-23.md` | 10.2 |
| 32 | `artifacts/scope/nerdio-wdac-cse-research-2026-06-18.md` | 28.1 |
| 33 | `artifacts/scope/review-v0.3.2.md` | 13.1 |
| 34 | `artifacts/scope/review-v0.3.md` | 7.4 |
| 35 | `artifacts/scope/review.md` | 6.9 |
| 36 | `artifacts/scope/segregated-network-impact-assessment-2026-06-15.md` | 15.1 |
| 37 | `artifacts/scope/segregated-network-risk-review-2026-06-15.md` | 9.5 |
| 38 | `artifacts/scope/windows-app-shelllauncher-research.md` | 11.7 |

### Cyber correspondence

| # | Artifact (path in bundle) | KB |
|---|---|---|
| 39 | `artifacts/outputs/note-apm-cyber-enable-nerdio-fve-2026-06-18.md` | 2.4 |
| 40 | `artifacts/outputs/note-apm-cyber-fve-natgw-pip-2026-06-16.md` | 1.2 |
| 41 | `artifacts/outputs/note-apm-cyber-fve-storage-access-2026-06-18.md` | 1.4 |
| 42 | `artifacts/outputs/note-apm-cyber-kiosk-pilot-2026-06-10.md` | 2.4 |
| 43 | `artifacts/outputs/note-apm-cyber-nerdio-scripts-signing-2026-06-24.md` | 3.9 |
| 44 | `artifacts/outputs/note-apm-cyber-powershell-signing-2026-06-15.md` | 2.7 |

### Code & config (scripts, runbooks, function app, profiles)

| # | Artifact (path in bundle) | KB |
|---|---|---|
| 45 | `artifacts/outputs/assigned-access/README.md` | 4.1 |
| 46 | `artifacts/outputs/func-apm-cred-proxy/GetPassword/function.json` | 0.3 |
| 47 | `artifacts/outputs/func-apm-cred-proxy/GetPassword/run.ps1` | 3.2 |
| 48 | `artifacts/outputs/func-apm-cred-proxy/host.json` | 0.3 |
| 49 | `artifacts/outputs/func-apm-cred-proxy/profile.ps1` | 0.5 |
| 50 | `artifacts/outputs/golden-image-build/01-base-config.ps1` | 2.4 |
| 51 | `artifacts/outputs/golden-image-build/02-windows-updates.ps1` | 1.4 |
| 52 | `artifacts/outputs/golden-image-build/03-appx-cleanup.ps1` | 1.2 |
| 53 | `artifacts/outputs/golden-image-build/04-branding.ps1` | 0.9 |
| 54 | `artifacts/outputs/golden-image-build/05-sysprep.ps1` | 0.6 |
| 55 | `artifacts/outputs/golden-image-build/probe.txt` | 2.0 |
| 56 | `artifacts/outputs/intune-apps/webview2/README.md` | 3.0 |
| 57 | `artifacts/outputs/intune-apps/windows-app-kiosk/Detect-WindowsAppKiosk.ps1` | 2.1 |
| 58 | `artifacts/outputs/intune-apps/windows-app-kiosk/Install-WindowsAppKiosk.ps1` | 8.9 |
| 59 | `artifacts/outputs/intune-apps/windows-app-kiosk/README.md` | 8.1 |
| 60 | `artifacts/outputs/ps-scripts/Detect-KioskCredential.ps1` | 5.3 |
| 61 | `artifacts/outputs/ps-scripts/Detect-WebView2Health.ps1` | 1.5 |
| 62 | `artifacts/outputs/ps-scripts/Remediate-KioskCredential.ps1` | 5.3 |
| 63 | `artifacts/outputs/ps-scripts/Remediate-WebView2Health.ps1` | 2.2 |
| 64 | `artifacts/outputs/runbooks/Create-KioskUser.ps1` | 5.5 |
| 65 | `artifacts/outputs/runbooks/Rotate-KioskUserPasswords.ps1` | 5.3 |
| 66 | `artifacts/outputs/runbooks/Test-KioskMIAccess.ps1` | 6.1 |
| 67 | `artifacts/outputs/scripts/Enable-ShellLauncherFeature.ps1` | 3.6 |
| 68 | `artifacts/outputs/scripts/New-EntraGroupsFromCsv.ps1` | 10.9 |
| 69 | `artifacts/outputs/scripts/groups_sample.csv` | 0.3 |
| 70 | `artifacts/outputs/shell-launcher/Detect-KioskShellLauncher.ps1` | 1.9 |
| 71 | `artifacts/outputs/shell-launcher/README.md` | 4.1 |
| 72 | `artifacts/outputs/shell-launcher/Remediate-KioskShellLauncher.ps1` | 4.6 |

### Diagrams (Mermaid sources)

| # | Artifact (path in bundle) | KB |
|---|---|---|
| 73 | `artifacts/outputs/diagrams/README.md` | 2.5 |
| 74 | `artifacts/outputs/diagrams/fve-architecture-detailed.mmd` | 4.6 |
| 75 | `artifacts/outputs/diagrams/fve-architecture.mmd` | 2.9 |
| 76 | `artifacts/outputs/diagrams/production-architecture-detailed.mmd` | 5.5 |
| 77 | `artifacts/outputs/diagrams/production-architecture.mmd` | 2.8 |

### Inputs

| # | Artifact (path in bundle) | KB |
|---|---|---|
| 78 | `artifacts/inputs/README.md` | 0.9 |

### Other staged files

| # | Artifact | KB |
|---|---|---|
| 79 | `artifacts/outputs/JobSeeker_DevicePrepPartner_Autopilot_Onboarding_v0.1.md` | 15.5 |

**Total artifacts exported: 79.**

## Could NOT be exported (and why)

| Item | Why | Mitigation |
|---|---|---|
| **Detailed Design V1.0** (the *approved* build-from design, 23 Jun 2026) | Not stored as a file in the source workspace — it was reviewed from an external source. Only **V0.3** (and V0.2) Word files exist locally. | V0.3 is exported in full (`_from_docx/`). **All V1.0 deltas vs the as-built are captured verbatim in the change register** (`evidence/as-built-register.md`, rows dated 2026-06-23) and summarised in the Context Brief §3–§4. |
| **FigJam architecture boards** (2 rendered boards) | Hosted in Figma; require Figma access; cannot be embedded as images here. | The **canonical Mermaid sources** for all four diagrams are exported verbatim (`outputs/diagrams/*.mmd`) and can be re-rendered. Board URLs are in `outputs/diagrams/README.md`. |
| **Original binary Word/Excel files** | The bundle is Markdown-first for portability into a Claude project. | Canonical docs were **converted to Markdown** (`_from_docx/`, `_from_xlsx/`). Excel conversion preserves **values** (cell formulas/formatting not retained). Superseded plan/decision Word files have Markdown twins already exported. |
| **`JobSeeker_Build_Status.html`** (≈692 KB generated dashboard) | Generated output; large; not meaningful as pasted text. | Its **sources are all exported**: `_build_status_data.js`, `_build_status_template.html`, `_generate_build_status.py`, plus the register it renders. |
| **Assistant memory file** (`dd-v1-approved-canonical`) | Lives outside the workspace (assistant memory store), not a project artifact. | Its substance is reflected in the Context Brief and the change register. |
| **Superseded artifact versions** | Retained in the bundle for completeness (e.g. plan v0.2→v0.3.3, decisions v0.1, permissions v0.1, DD V0.2). | All exported as Markdown; the Context Brief flags which version is current (plan **v0.3.3**, decisions **v0.2**, design **V1.0**). |

## How to use this bundle in the destination project
1. Read **01_CONTEXT_BRIEF.md** first — it is the self-contained narrative.
2. Treat **`evidence/as-built-register.md`** as the live source of truth for build state, decisions and V1.1 defects.
3. The **current** versions are: design **V1.0** (deltas in the register; V0.3 doc as the local base), plan **v0.3.3**, decisions brief **v0.2**, permissions **v0.2**.
4. This is the **Kiosk SOE only** — pair it with the other three SOEs' contexts in the broader programme.
