# Participant Device V1.0 - transposition notes

How this design was produced from the superseded Job Seeker Kiosk detailed design V1.6, and what a reviewer of that document needs to know.

## Provenance

- Source: `designs/job-seeker-kiosk/content.txt` (V1.6, built 31 Jul 2026).
- This is a **new baseline**, not a revision: new folder, new slug, V1.0, new document identity. The kiosk design remains in its own folder as the record of what was approved and what is being decommissioned.
- No highlight markers (`==`) are carried. Highlight marks change since the last version; a fresh baseline has no such delta, and the delta a reviewer needs is in section 2.5 instead.

## Carried across verbatim, with terminology swapped

| Content | Source section | Now | Change |
|---|---|---|---|
| Requirements user stories and acceptance criteria | 3.2.1 | 3.2.1 | Stories 01, 04, 05, 08, 09 acceptance criteria rewritten for auto-logon, restart purge, LibreOffice and Edge PDF. No requirement withdrawn |
| Bookmark link set | 3.2.2 | 3.2.2 | Unchanged. Office web app links removed from the Favourites Bar folder in 4.3.5 |
| App Control for Business | 4.3.9 | 4.3.9 | LibreOffice publisher rule added; installer row reworded (Intune-delivered trusted packages do install); script row renamed |
| Remote support access model | 4.3.10 | 4.3.10 | Support account is now APM-PDAdmin with Windows LAPS instead of Key Vault; lock-screen references removed; residual-risk paragraph rewritten for the corporate tenant |
| Zscaler tenant configuration | 5.3.4 | 5.3.4 | Reproduced verbatim as supplied, including object names. Intro rewritten to flag the identity-dependent elements for DR-107 revalidation |
| SOE hardening inheritance | 7.3.1 - 7.3.3 | 7.3.1 - 7.3.3 | Terminology only, plus the identity-exclusion paragraph rewritten (there is no identity to exclude) |
| Patching lifecycle | 9.3 | 9.3 | Ring names APM-Kiosk-* to APM-PD-*; LibreOffice/Patch My PC paragraph appended |

Terminology map applied to carried text: Job Seeker / job seeker to Participant / participant; kiosk device(s) to Participant Device(s); `SG-APM-Kiosk-Devices` to `SG-APM-ParticipantDevice-Devices`; `SG-APM-Autopilot-Kiosk-Devices` to `SG-APM-ParticipantDevice-Autopilot`; `APM-Kiosk-*` to `APM-PD-*`; `CMP-APM-Kiosk-Devices` to `CMP-APM-ParticipantDevice`; `KI-` to `PD-`; case worker to case manager. **Not** swapped: `APM-KIOSK` (VLAN and SSID, approved network objects under DR-008, see DR-109) and the supplied Zscaler object names (`apm-js-kiosk-users*`, `js-kiosk-allow`, `apmkiosk idp`).

## Written new

Sections 1.2 (audience asks), 2.5 (change table), 3.2.3 (requirements traceability), 4.1, 4.2, 4.3.1 - 4.3.8, 4.4 (interface catalogue), 5.1.1 - 5.1.6, 5.2.1 - 5.2.5, 5.3 - 5.3.3, 5.3.5 - 5.3.8, 6 in full, 7.1, 7.2 in full, 7.3.4 - 7.3.7, 7.5 (risk register), 8, 9.1, 9.2, 9.4 (decommissioning), 9.5, 9.6 (test plan), Appendix A (acronyms) and Appendix B (Assigned Access XML).

## Removed with the identity model

Credential pipeline in all its parts (Key Vault, Credential Proxy Function App, Automation runbooks, Cloud PKI and SCEP, server-rendered lock screens, 12-month rotation), the cloud-only identity domain and its DNS and mail hardening, the F3 licence and service-plan model, per-device Entra ID accounts, the seven kiosk Conditional Access policies and their base-policy exclusions, Office for the web and the three-layer OneDrive purge, the Purview Information Barrier, Defender for Identity, and the domain management section. Each has a decommissioning line in 9.4.

## Figures

Nine, all on the diagram kit, `qa()` clean.

| Figure | File | Source |
|---|---|---|
| 1 Solution context | `solution-context.png` | New |
| 2 Provisioning | `provisioning-flow.png` | Reworked from V1.6 Figure 2 (credential steps removed) |
| 3 Application delivery and trust chain | `app-delivery-chain.png` | New |
| 4 Network and security zones | `network-zones.png` | Reworked from V1.6 Figure 3 (Azure subscription zone removed) |
| 5 Internet interaction sequence | `zscaler-sequence.png` | Reworked from V1.6 Figure 4 |
| 6 Zscaler tenant overview | `zscaler-tenant-overview.png` | Reworked from V1.6 Figure 5 |
| 7 Session lifecycle and purge | `session-lifecycle.png` | New, replaces the OneDrive purge timeline |
| 8 Access control model | `access-control-model.png` | New, replaces the nine-gate CA flow |
| 9 SOE inheritance | `soe-inheritance.png` | Reworked from V1.6 Figure 8 |

Retired: `credential-pipeline.png`, `onedrive-purge.png`, `ca-control-gates.png`.

## Scans

- `consistency-check.js`: `ok: true`, 128 headings, 9 figures, 80 tables. Only ORPHAN informational findings (single-mention policy names, expected in a settings document).
- `qa()` on `figures.html`: clean across overlap, contrast, overflow, escapes, orphans, legends, occlusion and clipping.
- `compliance-check.js` against the ten held APM policies: **100%**, 0 conflicts, 0 gaps, 5 compensated, 26 met. Report: `policies/reports/Participant_Device_V1.0-compliance-check.txt`. The two gaps open against V1.6 (TLS cipher suites, incident reporting path) are closed by 7.2.7 and 9.1.

## Open items carried into review

- DR-107 Zscaler forwarding and provisioning model with no user identity - workshop with Zscaler once a validated device exists.
- SOE-02 APM code-signing certificate - still the largest build gate; the idle watchdog and both purge scripts depend on it.
- SOE-05 BitLocker pre-boot authentication cannot apply to a device that signs itself in - needs a formal variation. Inherited unresolved from V1.6.
- SOE-06 and SOE-07 user-scope to device-scope conversion of the Edge and Windows 11 baselines - raised by APM Cyber Security.
- A-04 licensing confirmation with SoftwareOne: Windows 11 Enterprise E5 per device, Intune device licences, Defender for Endpoint P2 entitlement for a device with no assigned user.
- Hardware check with CompNow: the fleet was specified for IoT LTSC on thin clients; Windows 11 Enterprise plus LibreOffice needs 8 GB and 128 GB.
