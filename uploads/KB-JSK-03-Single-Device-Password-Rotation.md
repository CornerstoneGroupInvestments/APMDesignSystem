# KB-JSK-03-Single-Device-Password-Rotation


# Knowledge Base Article

**Known Issue – Trigger an Ad-hoc Password Rotation for a Single Kiosk**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | KB-JSK-03 |
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
This article rotates the password on a single kiosk device by manually triggering the kiosk password rotation runbook. Use it when KB-JSK-02 reaches Step 6, or whenever a single-device rotation is required outside the scheduled cadence.

## Scenario
A specific kiosk needs a password rotation now, not at the next scheduled cycle. Common triggers are troubleshooting a sign-in failure where the device's current credential state is suspect (per KB-JSK-02 Step 6), suspected single-device compromise where the credential may have been observed or copied, or post-incident hygiene after Cyber Security has investigated a kiosk.
For fleet-wide rotation, use KB-JSK-04 instead.

## Prerequisites

| Requirement | Detail |
| --- | --- |
| Run rights on the Automation account | Automation Operator role on the Automation account hosting the kiosk runbooks (typically aa-apm-kiosk). |
| Target kiosk's UPN | Derived from the BIOS serial: kiosk-{serialnumber}@apm.net.au, lowercased and stripped of non-alphanumerics. |
| Site staff aware | The currently-displayed password becomes invalid immediately on runbook completion. The new password appears on the wallpaper within 60 minutes (next Remediation cycle). |

## Fix / Resolution Steps

### Step 1 — Identify the target kiosk's UPN
The runbook parameter is the kiosk user UPN. Read the BIOS serial from the asset label or from Intune (Devices > All devices > select device > Hardware > Serial number). Lowercase the serial, remove any non-alphanumeric characters (hyphens, dots, spaces). Compose the UPN as kiosk-{serialnumber}@apm.net.au. Example: serial 1ABC-345 becomes kiosk-1abc345@apm.net.au.
Verify the UPN exists in the Entra ID admin centre before running the runbook. If not present, do not run rotation — see KB-JSK-02 Step 4 for missing-account triage.

### Step 2 — Open the runbook
Sign in to the Azure portal and navigate to the Automation Account that hosts the kiosk runbooks (typically named aa-apm-kiosk — confirm the exact name with Digital Operations). Under Process Automation, select Runbooks and open the kiosk password rotation runbook (confirm exact name with Digital Operations).

### Step 3 — Start the runbook

| Field | Value |
| --- | --- |
| Run on | Hybrid Worker. Choose the Hybrid Worker Group in snet-shared-service. Cloud sandbox cannot reach the private-endpoint Key Vault. |
| Parameter | Target UPN from Step 1 (the runbook accepts either a single UPN or the fleet group name; this case uses a single UPN). |
Click OK to start the job.

### Step 4 — Confirm runbook success
Wait for the job status to move from Queued to Running to Completed. Typical runtime is under one minute for a single device. Open the job output and confirm there are no errors. The runbook should log: new password generated, Update-MgUser succeeded, Key Vault secret updated, Log Analytics event logged.

| Failure | Action |
| --- | --- |
| Key Vault access error | The Hybrid Worker may have lost its managed identity binding. Escalate to Digital Operations. |
| Graph permission error on Update-MgUser | The Automation Account's managed identity is missing User.ReadWrite.All. Escalate to Digital Operations. |

### Step 5 — Verify the Key Vault secret
Open Key Vault kv-apm-kiosk and navigate to Secrets > kiosk-{serialnumber}. Confirm a new version has been created with the current date and time. Do not reveal the value. The previous version remains for 90 days via soft-delete (rollback cover).

### Step 6 — Force the kiosk lockscreen refresh
Optional but recommended when the user is waiting. By default the kiosk Remediation runs hourly; forcing a Run on demand brings the lockscreen update forward.
In Intune admin centre go to Devices > Manage devices > Scripts and remediations. Open the kiosk lockscreen Remediation script package. Click Device status, find the target device, click Run on demand. Wait 5 to 10 minutes — the detection script runs, finds the hash mismatch, the remediation script regenerates the lockscreen with the new credential, and the AutoLogon LSA secret is updated in the same run.

### Step 7 — Communicate to site staff
Tell site staff the password has been refreshed and ask them to read the password from the lockscreen and retry sign-in. If Step 6 was skipped, advise the new password appears automatically within 60 minutes.

### Step 8 — Update the ticket
Record the device name, target UPN, runbook job ID, Key Vault secret version, and time of rotation. If this was triggered as part of a security investigation, link the ticket to the incident record.

## Common Issues

| Issue | Cause and fix |
| --- | --- |
| Runbook completes but lockscreen never updates | Likely the device's Remediation script is failing. Check Intune Devices > Manage devices > Scripts and remediations > Device status for error output. Failures on the Credential Proxy call point to a Function App or Key Vault private endpoint issue — escalate to Digital Operations. If the device is offline, the Remediation runs on next online check-in. |
| Runbook fails with 'principal not found' | The kiosk user account does not exist in Entra. The device may not have completed account creation yet (KB-JSK-07) or may have been retired (KB-JSK-06). |
| Runbook fails with 'soft-deleted secret cannot be set' | The Key Vault secret has been soft-deleted (likely by a previous retirement runbook). The runbook needs the secret to be either active or absent. Either recover the secret or have Digital Operations purge it before re-running. |

## Summary
Derive UPN, run the rotation runbook on the Hybrid Worker with the UPN parameter, verify Key Vault, force a Remediation Run on demand to speed up the lockscreen refresh, tell the site staff. Total elapsed time is typically under 15 minutes.