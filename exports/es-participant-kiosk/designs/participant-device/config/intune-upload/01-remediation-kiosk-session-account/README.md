# 01 - Remediation: Kiosk session account

**Intune admin centre > Devices > Scripts and remediations > Remediations > Create script package**

Name: `CDG-W11-REM-Kiosk Session Account-P-1.0`

| Field | Value |
|---|---|
| Detection script | `Detect-KioskSessionAccount.ps1` |
| Remediation script | `Remediate-KioskSessionAccount.ps1` |
| Run this script using the logged-on credentials | No (SYSTEM) |
| Enforce script signature check | Yes |
| Run script in 64-bit PowerShell | Yes |
| Assignment | `sg-dyn-dvc-cdg-participant-kiosk` |
| Schedule | Daily, plus first check-in after enrolment |

Both scripts must be signed with the APM code-signing certificate before upload (SOE-02). Signature enforcement is on, so an unsigned script does not run.

**This object owns `./Vendor/MSFT/AssignedAccess/Configuration`.** It creates the per-device account `Kiosk-<SERIAL>`, sets automatic logon with the password held only in the Winlogon LSA secret, and applies the Assigned Access configuration naming that account. No configuration profile writes that node: pack 02 is reference material only.

## Before assigning

Run `Remediate-KioskSessionAccount.ps1` by hand once, in an elevated 64-bit session, on a reference device. Two of the defects found in this script's history (a collapsed statement, and `DefaultDomainName` set for a local account) surface immediately on a manual run and report only as a failure count through a policy assignment.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Account, autologon and Assigned Access all configured. Autologon takes effect at next restart |
| 1 | Configuration applied, but a policy-delivered blocker will stop automatic logon. The output names it |

The remediation exits 1 rather than 0 when it finds a logon banner, `PreferredAadTenantDomainName`, or a device password policy. Each disables automatic logon, none can be cleared by a script, and each needs an assignment exclusion. A device in that state is genuinely broken and reads as broken.

## Editing the Assigned Access body

The XML lives twice: canonically in `../AssignedAccess-ParticipantKiosk.xml`, and as a here-string in the remediation, because an Intune remediation is a single pasted script and cannot read a sibling file at runtime. The two have drifted apart once already, with different namespace prefixes on the same element.

After editing either copy, run `../check-assigned-access.js`. It compares them and fails on any structural difference, and it carries a negative test for every defect this configuration has shipped.
