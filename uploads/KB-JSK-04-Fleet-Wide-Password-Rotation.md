# KB-JSK-04-Fleet-Wide-Password-Rotation


# Knowledge Base Article

**Known Issue – Trigger a Fleet-Wide Password Rotation**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | KB-JSK-04 |
FOR INTERNAL USE ONLY
Commercial in confidence
© APM

**Document control**

**Version History**

| Version | Date | Author | Key changes |
| --- | --- | --- | --- |
| V0.2 | 28 May 2026 | Digital Transformation & Architecture | Reformatted to paragraph-prose plus left/right tables. |
|  |  |  |  |
Consultation

| Name | Position title | Date |
| --- | --- | --- |
| Digital Operations | Operations Lead |  |
| Cyber Security | Cyber Security Lead |  |
References and Derivation

| Version # | Document Title | Reference Location |
| --- | --- | --- |
| V2.0 | Unified SOE Requirements | Digital Transformation & Architecture SharePoint |
| V0.3 | Job Seeker Kiosk Detail Design | Digital Transformation & Architecture SharePoint |
SDA Approval

| Name | Role/Group | Signature | Date |
| --- | --- | --- | --- |
|  |  |  |  |

## Confidentiality & Disclaimer
This document is provided by Advanced Personnel Management International Pty Ltd and / or its related entities (APM) on a confidential basis. This document is subject to approval of the APM Board and does not constitute an offer capable of acceptance. No agreement binding APM or its related companies in respect of this document is intended or proposed unless and until the terms and conditions between APM or its related entities are agreed in writing in a formal agreement with the named Company or Prospective Client.
APM will not be bound by any pricing or any other material contained in this response until the above has taken place.

### Photography
Photographs used in this document are for illustration only 
and should not be interpreted to mean that any person or organisation whose assets are shown in them endorses this document.

## Purpose
This article rotates the password on every kiosk in the fleet by running the kiosk password rotation runbook against the SG-APM-Kiosk-Users group. Use it only when single-device rotation is not sufficient — suspected fleet-wide compromise, audit or compliance-forced rotation, or post-incident hygiene at scale.
For a single device, use KB-JSK-03. The scheduled rotation handles routine rotations automatically (refer to the current Automation schedule in V0.4 — see G-01 in the gaps and deviations report).

## Scenario
Trigger a fleet rotation when Cyber Security has confirmed a suspected compromise that may extend beyond a single device (KB-JSK-10), when an audit finding requires an immediate evidenced rotation across the fleet, or when a change in the credential generation logic (length, complexity, character set) needs to be applied to every device.
Do NOT trigger fleet rotation as a first response to a generic 'kiosk sign-in problem at one site'. Use KB-JSK-02 and KB-JSK-03 first.

## Authorisation
Fleet rotation requires sign-off from a Digital Operations engineer or Cyber Security on-call before execution. Record the approving party in the ticket. If this is being triggered as part of an active incident, the incident record is sufficient authorisation; log the IR reference in the ticket.

## Prerequisites

| Requirement | Detail |
| --- | --- |
| Run rights on the Automation Account | Automation Operator role at minimum. |
| Communication path to sites is ready | Fleet rotation invalidates all currently-displayed kiosk passwords simultaneously. Job seekers mid-session are not affected (their AVD session continues until disconnect/idle). New sign-ins fail on each device until that device's next Remediation cycle refreshes the wallpaper (up to 60 minutes per device). |
| Timing window | Ideally run outside peak site hours where possible. Check the operational calendar. |

## Fix / Resolution Steps

### Step 1 — Pre-rotation health check
Confirm the Automation Account (aa-apm-kiosk) is healthy by checking Process Automation > Jobs for any failed jobs in the last 24 hours. Confirm the Hybrid Runbook Worker on the shared-services VM is online — in the Automation Account, go to Hybrid Worker Groups and check the worker is reporting in. Confirm Key Vault kv-apm-kiosk is reachable and not in any administrative lockdown state by checking the Activity Log for recent changes.
Confirm SG-APM-Kiosk-Users has the expected member count (should align with the number of provisioned kiosks). A wildly different count indicates an account-creation or retirement problem that needs to be resolved first.

### Step 2 — Pre-announce to sites
Send a notice via the agreed channel (typically email and/or Teams) to all sites: 'Kiosk passwords will be rotated at [time]. Existing passwords will stop working immediately. The new password will appear on each kiosk lockscreen within 60 minutes.'
For incident-driven rotations, communicate the operational impact only — do not communicate the security cause to site staff. Cyber Security will handle any wider communication.

### Step 3 — Run the rotation runbook
Azure portal > Automation Account > Runbooks > kiosk password rotation runbook. Click Start. Set Run on = Hybrid Worker, select the snet-shared-service Hybrid Worker Group. Target the fleet group SG-APM-Kiosk-Users (the runbook accepts either a single UPN or the group). Confirm with Digital Operations the exact parameter name and expected value (e.g. -TargetGroup 'SG-APM-Kiosk-Users'). Click OK to start the job.

### Step 4 — Monitor execution
Open the job's All Logs view. The runbook iterates the group members. Expect approximately 1 to 2 seconds per user, so a 540-device fleet completes in roughly 10 to 20 minutes.
Watch for any per-user failures. The runbook should be designed to log a failure and continue, not abort. Capture any failing UPNs for follow-up. On completion, confirm Job Status = Completed.

### Step 5 — Spot-check Key Vault
Open kv-apm-kiosk > Secrets and filter to kiosk-* secrets. Verify a sample of secrets shows a new version with the current date and time. Use the Activity Log filtered by SecretSet to confirm the rotation event count matches the expected device count.

### Step 6 — Optionally accelerate device Remediation cycles
By default, each kiosk's Remediation picks up the new password on its next hourly cycle. Net time to all devices showing new wallpaper is up to 60 minutes.
If immediate refresh is required (e.g. high-profile incident), iterate the affected devices and Run on demand from Intune (Devices > Manage devices > Scripts and remediations > Kiosk lockscreen Remediation > Device status). Not practical for 500+ devices; reserve for small high-priority subsets.

### Step 7 — Post-rotation communication
Send the all-clear to sites confirming the rotation has completed. If this was incident-driven, hand the ticket back to the incident owner (Cyber Security) with the runbook job ID and Key Vault confirmation.

### Step 8 — Record evidence
Capture and attach to the ticket — and to the incident record if relevant — the following items. This is RFFR audit evidence.

| Item | Source |
| --- | --- |
| Trigger reason | From the ticket or incident. |
| Authoriser | Digital Operations engineer or Cyber Security on-call name. |
| Start and completion times | Job log timestamps. |
| Runbook job ID | Automation Account > Jobs. |
| Count of successful rotations | From runbook log summary. |
| Count and list of failed rotations | From runbook log per-user failures. |
| Key Vault secret version sample | Spot-check from Step 5. |

### Step 9 — Follow up any failed devices
For each device that failed in the runbook log, run KB-JSK-03 against the specific UPN. If a device repeatedly fails rotation, investigate whether the kiosk user account is in an unexpected state (disabled, missing from SG-APM-Kiosk-Users, soft-deleted Key Vault secret). KB-JSK-06 or escalation to Digital Operations may be needed.

## Rollback
A fleet rotation is not designed to be rolled back as a unit. Each Key Vault secret has soft-delete and version history — a single device can be reverted via Key Vault if absolutely necessary, but rolling the entire fleet back is operationally messy and contradicts the security intent of the rotation. If a rotation was triggered for the wrong reason, treat the new passwords as the new baseline and communicate accordingly.

## Summary
Authorise, pre-announce, run on the Hybrid Worker against SG-APM-Kiosk-Users, monitor for per-user failures, spot-check Key Vault, optionally accelerate device wallpaper refresh, communicate completion, capture evidence, chase any failures with single-device rotation. Use sparingly — this is for incidents, audits, or design changes, not routine support.