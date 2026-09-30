# KB-JSK-02-Job-Seeker-Cannot-Sign-In


# Knowledge Base Article

**Known Issue – Job Seeker Cannot Sign In to a Kiosk**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | KB-JSK-02 |
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
This article resolves sign-in failures on a Job Seeker Kiosk. It is the most common kiosk ticket. Most cases close at L1 by directing site staff and the job seeker to the current lockscreen credentials. The rest resolve through one of three escalations covered below.
Read KB-JSK-01 first if you do not understand the credential model. Every step here assumes that grounding.

## Scenario
A job seeker at an APM site attempts to sign in to a kiosk and the AVD prompt rejects the credentials. The symptom may be one of four patterns.

| Symptom | What it indicates |
| --- | --- |
| Your account or password is incorrect | Credentials rejected by Entra ID. |
| You can't get there from here / Sign-in was blocked by Conditional Access | Credentials accepted but policy rejected the session. |
| We couldn't connect / Windows App stays on a blank screen | Session broker or network issue, not a credential issue. |
| Lockscreen is blank, wrong wallpaper, or showing old credentials | The Remediation script has not completed a recent cycle. |

## Information to Capture Before Troubleshooting

| Item | Where to find it |
| --- | --- |
| Site code and device name (KI-APM-[SITE]-[ID]) | Asset label on the device, or ask site staff. |
| Time of the attempt and exact error message text | From the user or site staff. |
| Whether other kiosks at the same site are working | If all kiosks at one site are down it points to network or Conditional Access, not a per-device credential issue. |
| Whether the lockscreen shows a current-looking wallpaper | APM-branded with username, password, and data-wipe warning. |

## Fix / Resolution Steps

### Step 1 — Confirm the job seeker is reading the current wallpaper
The single most common cause is that the job seeker is typing a previously-noted password rather than reading the one currently on screen. Passwords rotate; what was correct an hour ago may not be correct now.
Ask the site staff to read the current username and password directly off the lockscreen wallpaper and re-enter, character by character. Watch for case-sensitivity and common pitfalls (O vs 0, l vs 1, capital I vs lowercase l, and symbols on a keyboard the job seeker is unfamiliar with). If sign-in succeeds, close the ticket.

### Step 2 — Confirm the wallpaper itself looks current
If the wallpaper looks wrong (default Windows wallpaper, blank, or showing a stale-looking timestamp/warning), the Remediation script on the device has not completed a recent cycle. Open the Intune admin centre, navigate to Devices > Manage devices > Scripts and remediations, open the kiosk lockscreen Remediation script package, select Device status, and find the affected device by name.
Note the last detection result and last remediation result. If the last run is more than 90 minutes ago or shows an error, use Run on demand to trigger immediate execution. Wait 5 to 10 minutes, then ask site staff to confirm the wallpaper updated and retry sign-in.

### Step 3 — Confirm a rotation hasn't just happened
If a fleet-wide or per-device rotation runbook has run in the last 60 minutes, the lockscreen on the affected device may not yet reflect the new password. The Remediation script runs hourly; until it next runs, the wallpaper still shows the old password.
Open the Azure portal, navigate to the Automation account that hosts the kiosk runbooks, and go to Process Automation > Jobs. Filter to the password rotation runbook and check whether a job ran in the last 60 minutes targeting this device or the whole fleet. If yes, advise site staff to wait up to 60 minutes for the device's next Remediation cycle, or use Run on demand in Intune to bring this forward.

### Step 4 — Confirm the kiosk user account exists and is enabled
If the device is new, the account creation runbook may not yet have created the kiosk user account. In Entra ID admin centre, search for kiosk-{serialnumber}@apm.net.au (serial from the device label, lowercased, non-alphanumerics removed) and verify the following:

| Check | Expected |
| --- | --- |
| Account Enabled | Yes |
| Group membership | Includes SG-APM-Kiosk-Users |
| Licence | M365 F3 assigned (via group-based licensing on SG-APM-Kiosk-Users) |
If the account is missing on a recently-built device, follow KB-JSK-07 — the account creation runbook polls every 5 minutes; allow 10 minutes from when the device joined SG-APM-Autopilot-Kiosk-Devices. If the account is disabled or missing on an established device, escalate to Digital Operations — this should not happen without a retirement runbook run.

### Step 5 — Confirm device compliance and enrolment profile
CA-APM-Kiosk-DeviceBound requires the device to be Intune-compliant and provisioned by the APM-Kiosk-SelfDeploying Autopilot profile. A non-compliant device is blocked regardless of password.

| Check | Expected |
| --- | --- |
| Compliance | Compliant. If not, open the device's compliance details and resolve (commonly BitLocker, Defender, TPM, or Firewall). Trigger Sync from the device's actions. |
| Enrollment profile name | APM-Kiosk-SelfDeploying. If different, the device was provisioned outside the kiosk Autopilot profile and CA blocks it. Escalate to Digital Operations for re-provisioning. |

### Step 6 — Trigger an ad-hoc password rotation for this device
If steps 1 to 5 do not resolve and the account state looks correct, follow KB-JSK-03 to trigger a single-device rotation. This regenerates the password in Entra and Key Vault and forces the device's next Remediation cycle to refresh the lockscreen. After the runbook completes, force a Remediation Run on demand from Intune to skip the wait. Ask site staff to retry sign-in once the wallpaper updates.

### Step 7 — Replace the device
If the device is unreachable, the Remediation script has not run for 24+ hours, the lockscreen image cannot be regenerated, or Step 6 fails to resolve, the device needs to be replaced. Follow KB-JSK-05 for the full break-fix workflow.

## When to Escalate Immediately

| Pattern | Escalation |
| --- | --- |
| Multiple kiosks at the same site failing simultaneously | Site network or Wi-Fi VLAN issue. Escalate to Network team. |
| Multiple kiosks across multiple sites failing simultaneously | Tenant or service issue. Check Azure status, Entra ID status, Intune service health. Escalate to Digital Operations. |
| Sign-in error indicates Conditional Access block but device looks compliant | Escalate to Digital Transformation & Architecture for CA policy review. |
| Suspected credential compromise | Escalate immediately to Cyber Security; see KB-JSK-10. |

## Summary
Start with the screen. Confirm the credential being typed is the one currently on the wallpaper, and confirm the wallpaper itself looks current. Most tickets close at Step 1 or Step 2. If the wallpaper looks current and the credentials still fail, work through account state, device compliance, and an ad-hoc rotation. Only after that should the device be replaced.