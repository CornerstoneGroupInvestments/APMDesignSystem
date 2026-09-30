# KB-JSK-06-Retire-Kiosk-Device


# Knowledge Base Article

**Known Issue – Retire a Kiosk Device (Run the Retirement Runbook)**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | KB-JSK-06 |
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
This article retires the Entra ID identity, F3 licence, and Key Vault secret associated with a kiosk device. The procedure is run as part of KB-JSK-05 (break-fix replacement), at end-of-life, or whenever a kiosk identity needs to be permanently disabled.
The retirement runbook is a separate runbook from the password rotation runbook. It does not delete the Autopilot record or the Intune managed-device record — those are manual steps in KB-JSK-05.

## Scenario
Trigger retirement when one of the following applies. Do not run retirement for a device that is being recommissioned at the same site under the same name without coordination — the new build will need a new identity created, which takes about 10 minutes after Autopilot completion.

| Trigger | Context |
| --- | --- |
| Hardware failure with permanent retirement | Physical device returned to vendor or destroyed. |
| Site closure or kiosk decommission | Capacity reduction. |
| Confirmed credential compromise | Identity must be disabled in addition to a fleet rotation per KB-JSK-04. |
| Device repaired and recommissioned at a different site | Original identity retired; rebuilt device gets a new identity. |

## What the Runbook Does

| Action | Effect |
| --- | --- |
| Disables the kiosk user account | kiosk-{serialnumber}@apm.net.au moves to Account Enabled = No. |
| Removes the user from SG-APM-Kiosk-Users | Group-based licensing removes the M365 F3 licence automatically. |
| Soft-deletes the Key Vault secret kiosk-{serialnumber} | Secret enters the 90-day soft-delete window (recoverable for rollback) before final purge. |
| Logs the event to Azure Log Analytics | Audit evidence. |
The runbook does NOT delete the Entra user object outright. Disabled users are retained for audit and recovery. Hard deletion of the kiosk user object is a separate manual operation if ever required.

## Prerequisites

| Requirement | Detail |
| --- | --- |
| Run rights on the Automation account | Automation Operator role. |
| Authorisation per the operational reason | Break-fix ticket reference, decommission approval, or incident reference. |
| Device physical isolation | Device should be powered off and disconnected from the site network before retirement — once the account is disabled, AutoLogon becomes invalid and the device no longer reaches AVD. |

## Fix / Resolution Steps

### Step 1 — Confirm device identity
Confirm the device name (KI-APM-[SITE]-[ID]) and serial number from the asset label or from the ticket. Derive the UPN: kiosk-{serialnumber}@apm.net.au, with serial lowercased and non-alphanumerics removed.
Verify in Entra ID that the account exists and is enabled. If already disabled, retirement may have run previously — investigate before re-running. Verify in Key Vault that the secret kiosk-{serialnumber} exists and is active.

### Step 2 — Open the retirement runbook
Azure portal > Automation Account (typically aa-apm-kiosk — confirm with Digital Operations). Process Automation > Runbooks > kiosk retirement runbook (confirm exact name with Digital Operations).

### Step 3 — Start the runbook

| Field | Value |
| --- | --- |
| Run on | Hybrid Worker, snet-shared-service Hybrid Worker Group. The runbook must run on the Hybrid Worker to reach the private-endpoint Key Vault. |
| Parameter | Target UPN (kiosk-{serialnumber}@apm.net.au). |
Click OK.

### Step 4 — Verify outcome

| Check | Expected |
| --- | --- |
| Job status | Completed. Review All Logs for any errors. |
| Entra user account | Account enabled = No. |
| Group membership | SG-APM-Kiosk-Users no longer lists this user. |
| Licence | F3 removed (may take a few minutes to propagate). |
| Key Vault secret | kiosk-{serialnumber} no longer visible in active secrets list. Switch to Managed deleted secrets view — secret is soft-deleted with purge date 90 days from now. |
Capture the runbook job ID and timestamp in the ticket.

### Step 5 — Manual follow-up steps
The runbook handles the identity layer only. The device records are manual: delete the Intune managed-device record (see KB-JSK-05 Step 5), and keep or delete the Autopilot device registration depending on whether the device is being recommissioned (see KB-JSK-05 Step 6).

## Rollback / Recovery
If retirement was run in error, recovery within the 90-day soft-delete window is possible.

| Step | Action |
| --- | --- |
| Re-enable the user | Entra ID admin centre > the kiosk user > set Account enabled = Yes. |
| Re-add group membership | Add to SG-APM-Kiosk-Users. Licence re-applies via group-based licensing. |
| Recover the Key Vault secret | Key Vault > Managed deleted secrets > select kiosk-{serialnumber} > Recover. |
| Refresh the device | Force a Remediation Run on demand from Intune so the lockscreen and AutoLogon catch up with the recovered secret. |
After 90 days the Key Vault secret is purged and cannot be recovered. Beyond that point, the device must be treated as a new build (KB-JSK-07).

## Common Issues

| Issue | Cause and fix |
| --- | --- |
| Runbook reports 'user not found' | The UPN is wrong. Re-derive from the BIOS serial (lowercase, alphanumerics only). Common error: typing the serial with an embedded hyphen or letter case mismatch. |
| Runbook reports 'secret not found' | The Key Vault secret may have been previously deleted, never created, or named differently than expected. Check the soft-deleted secrets list. If the user exists but the secret never existed, the original account creation runbook may have failed at the Key Vault step — escalate to Digital Operations. |
| Licence remains assigned after group removal | Group-based licensing propagation can take a few minutes. If the licence is still showing after 30 minutes, check the Licensing > Group-based licensing health view in Entra admin centre for processing errors. |

## Summary
Confirm UPN, run the retirement runbook on the Hybrid Worker, verify the user is disabled, the group membership is removed, and the Key Vault secret is soft-deleted. Then delete the Intune record and decide on the Autopilot record. The runbook gives you a 90-day rollback window via soft-delete.