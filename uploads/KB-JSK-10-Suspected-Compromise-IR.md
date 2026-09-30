# KB-JSK-10-Suspected-Compromise-IR


# Knowledge Base Article

**Known Issue – Suspected Kiosk Credential or Device Compromise (Incident Response)**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | KB-JSK-10 |
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
This article executes the operational response when a kiosk credential or device is suspected to be compromised. It is the action playbook for the Service Desk and Digital Operations. It does not replace the formal Cyber Security incident response process — it runs alongside it, providing the technical containment and recovery steps Cyber Security will instruct.

## Scenario
Triggers for invocation include any of the following events.

| Trigger | Source |
| --- | --- |
| Suspicious sign-in pattern from a kiosk user account | Cyber Security alert (unusual location, after-hours, automated tooling signature). |
| Defender for Endpoint alert on a kiosk device or AVD session host | Defender. |
| Zscaler alert indicating policy violation or anomalous traffic from a kiosk | Zscaler. |
| Behaviour suggesting recorded credentials or out-of-scope access attempts | Site staff or case worker report. |
| Malware detection on a USB device inserted at a kiosk | Defender or site staff. |
| Lost or stolen kiosk device | Site staff. |

## Roles and Sequence

| Role | Responsibility |
| --- | --- |
| Cyber Security | Incident owner. Decides scope, communicates externally, classifies the incident. |
| Digital Operations | Executes technical containment and recovery actions in this KB. |
| Service Desk | Coordinates with affected sites, executes single-device actions (KB-JSK-03, KB-JSK-05, KB-JSK-06) under Cyber Security or Digital Operations direction. |

## Fix / Resolution Steps

### Step 1 — Triage and classify
Cyber Security determines scope: single device, multiple devices at one site, multiple sites, or fleet-wide. Capture the trigger alert reference, affected device names or UPNs, time window, and indicators of compromise. Set incident severity per APM IR process. Communicate per existing IR playbook.

### Step 2 — Containment
Choose containment scope based on triage.

#### Single-device containment
Isolate the device in Intune (Devices > All devices > target device > Isolate device, if Defender integration enables this — confirm with Cyber Security). Trigger an ad-hoc single-device password rotation per KB-JSK-03 to invalidate any captured credential. Ask site staff to power the device off and disconnect it from the network until investigation completes.

#### Multi-device or fleet-wide containment
Trigger a fleet-wide password rotation per KB-JSK-04. This invalidates all current kiosk credentials simultaneously. For specific devices of high concern, isolate via Intune as in single-device containment.
Consider temporarily disabling SG-APM-Kiosk-Users at the Conditional Access level — adding a temporary CA policy that blocks the group prevents any sign-in regardless of credentials. Use only with Cyber Security sign-off; this stops all kiosks from working.

### Step 3 — Evidence collection

| Source | What to collect |
| --- | --- |
| Entra ID sign-in logs | Filter by the affected UPN(s) for the time window. Export. |
| Intune | Device check-in logs and Remediation script logs for the affected devices. |
| AVD diagnostics | Session connection records for the affected user account(s). |
| Zscaler | Web activity for the affected kiosk(s) for the time window. Retention is 180 days per the current standard. |
| Defender for Endpoint | Alert details and timeline. |
| Azure Automation | Runbook job logs related to the affected UPN — confirm whether any rotation, retirement, or account creation actions occurred recently. |
| Key Vault | Activity Log filtered by the affected secret name. |
Attach all to the incident record. Do not store outside the IR process.

### Step 4 — Eradication
If a device was confirmed compromised at the OS level (malware persistence, unauthorised access via the local IoT account), recover the device by retiring the identity (KB-JSK-06), wiping at ComputerNow (CN-JSK-03), and rebuilding (CN-JSK-02).
If AVD session hosts were involved, coordinate with Digital Operations to rebuild the session host pool from a clean golden image (KB-JSK-08 with the latest image; consider rebuilding the golden image itself from base if image integrity is in question).
If the compromise was credential-only with no device-level indicators, the fleet/single rotation in containment is the eradication step.

### Step 5 — Recovery and validation
Remove any temporary Conditional Access blocks once eradication is complete. Confirm a sample of devices in different sites can sign in after the password change has propagated (60 minutes after rotation). Confirm Cyber Security is satisfied with the IoC clearance evidence.

### Step 6 — Post-incident hardening

| Review | Question |
| --- | --- |
| Alerting | Should the alerting that caught (or failed to catch) the incident be tuned? Liaise with Cyber Security. |
| Conditional Access | Should any policy be tightened (additional named locations, stricter device filter)? |
| Rotation cadence | If scheduled cadence is currently annual or quarterly and the IR exposed a window where a stale credential was usable, consider tightening. Link to G-01 in the gaps and deviations report. |

### Step 7 — Postmortem and documentation
Per APM IR process, produce a blameless postmortem covering trigger, response timeline, containment actions, eradication steps, recovery, root cause where known, and follow-up actions. Update this KB and / or supporting KBs (KB-JSK-02, KB-JSK-03, KB-JSK-04) with any new triage signals or steps the incident revealed.

## What This KB Doesn't Cover

| Excluded | Owner |
| --- | --- |
| Formal incident classification, communications to DEWR, RFFR breach notification, legal escalation | APM IR process and Compliance Manager. |
| Forensic analysis of malware | Cyber Security or external IR provider. |
| Job seeker notification | Cyber Security and Compliance decide if and when. |

## Summary
Triage with Cyber Security, contain via rotation and isolation, collect evidence, eradicate (rebuild devices or images if needed), recover, validate, harden, postmortem. The technical actions (rotate, isolate, rebuild) are well-defined in supporting KBs; this KB orchestrates them under Cyber Security direction.