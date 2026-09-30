# KB-JSK-05-Replace-Faulty-Kiosk-Device


# Knowledge Base Article

**Known Issue – Replace a Faulty Kiosk Device**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | KB-JSK-05 |
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
This article replaces a kiosk device that cannot be recovered by remote support. It covers the full break-fix workflow from raising a replacement with ComputerNow, through retiring the failed device's identity, to validating the replacement on site.
This is the right KB when the cause is hardware fault, persistent provisioning failure, physical damage, or repeated Remediation failures that single-device rotation does not resolve. It is the wrong KB for a simple sign-in issue — see KB-JSK-02 first.

## Scenario
The following symptoms warrant device replacement.

| Symptom | Indicator |
| --- | --- |
| Will not power on, or boots but does not reach the lockscreen within 10 minutes | Hardware fault or persistent provisioning failure. |
| Physical damage (cracked screen, missing keys, broken USB port) | Hardware fault. |
| Persistent Intune non-compliance that cannot be cleared remotely | Provisioning or hardware fault. |
| Repeated Remediation script failures across multiple cycles | Likely OS-level issue beyond remote recovery. |
| Cannot complete Autopilot self-deploying on re-provisioning attempts | Hardware fault or TPM attestation failure. |

## Decision — Replace or Repair-and-Recommission?
Some faults are repairable (e.g. swap of a power supply or keyboard at ComputerNow's facility). Others require full retirement and replacement with new stock. The decision affects how the existing identity is treated.

| Path | Identity treatment |
| --- | --- |
| Replace and retire permanently | The existing kiosk user account is disabled and the Key Vault secret soft-deleted. The Autopilot record is removed. The device is destroyed or returned to vendor. |
| Repair and recommission as a replacement somewhere else | The existing identity is still retired, but the physical device is wiped and re-imaged at ComputerNow under a new identity for a new site (treat as spare stock per KB-JSK-07 and CN-JSK-02). |
When in doubt, treat as full retirement. The identity is cheap to re-create; risk of residual state if a 'repair' returns the same device to the same site without an identity reset is much higher.

## Fix / Resolution Steps

### Step 1 — Confirm replacement is the right call
Work through KB-JSK-02 to rule out credential-side fixes. Attempt a single-device rotation per KB-JSK-03. Confirm compliance state, Remediation script status, and account state in Entra and Intune. If the fault is hardware (won't power on, damaged, won't reach lockscreen), skip the above checks and proceed directly to replacement.

### Step 2 — Raise a replacement request with ComputerNow
Use the agreed channel (ComputerNow ticket portal or email) and provide the following.

| Field | Value |
| --- | --- |
| Site code and address | From the failing device's location group. |
| Current device name | KI-APM-[SITE]-[ID] |
| Serial number | From the device asset label or Intune. |
| Fault description and urgency | Plain language. |
| Destination Entra ID group | APM-JS-[LOCATION]-Devices — drives the replacement's device name and location-specific policy. |
| Stock source | Request spare stock for same/next-day metro delivery where available. |

### Step 3 — Send a return label to the site
Generate or request a return label via ComputerNow or APM's logistics process. Email site staff with the label plus a copy of the device repack instructions from the site-staff playbook. Confirm they have the original Dell carton (kept on-site per the site staff procedure).

### Step 4 — Run the retirement runbook against the faulty device
Critical — do this before the device is destroyed or wiped at ComputerNow. The retirement runbook puts the identity into the correct state for replacement and provides a rollback window if the wrong device was retired in error. Follow KB-JSK-06 in full. Capture the runbook job ID in the ticket.

### Step 5 — Remove the device from Intune
This step is critical for permanent retirement and is also required if the same physical device may ever re-enrol — Autopilot self-deploying mode requires a clean Intune state on re-enrolment, or it fails with 0x80180014.
Open Intune admin centre > Devices > All devices. Search the device by name (KI-APM-[SITE]-[ID]). Select the device. Click Delete in the top toolbar and confirm. This removes the Intune managed-device record. The Entra device object is removed automatically if the device was cloud-Entra-joined via Autopilot.

### Step 6 — Decide on Autopilot record retention
The Autopilot device registration is separate from the Intune managed-device record. Choose one path.

| Outcome | Action |
| --- | --- |
| Permanent retirement of the physical device (destruction, vendor return, no further use) | Delete the Autopilot record. Intune admin centre > Devices > Device onboarding > Enrollment > Devices (under Windows Autopilot). Find by serial, delete. |
| Device being repaired and recommissioned elsewhere | Keep the Autopilot record. ComputerNow wipes and re-images; on next OOBE, Autopilot picks up the existing registration and self-deploys under the new location group. |
| Unsure | Keep the Autopilot record. Re-deleting it later is cheaper than re-registering a destroyed device's hash. |

### Step 7 — Track the replacement build
ComputerNow follows CN-JSK-02 (Replacement kiosk build) for replacements from spare stock. Confirm via their ticket update that the build has started.
Once dispatched, capture: new serial, new device name (KI-APM-[SITE]-[ID] — may be reissued or new ID per the service desk's instruction), tracking number, expected delivery date. Update the original ticket with these details.

### Step 8 — Site receives and powers up the replacement
Site staff follow their device receipt procedure (inspect, unbox, place, connect peripherals, power on). The device boots and joins the kiosk Wi-Fi VLAN automatically (Wi-Fi profile is in the Autopilot self-deploying provisioning package). Autopilot self-deploying completes and the device joins SG-APM-Autopilot-Kiosk-Devices via dynamic membership.
Within 5 minutes, the account creation runbook detects the new device group member, creates the kiosk user account, stores the password in Key Vault, and adds the user to SG-APM-Kiosk-Users. Within 60 minutes (one Remediation cycle), the lockscreen wallpaper renders with the new credentials.

### Step 9 — Validate sign-in onsite
Ask site staff to perform a first-login test per the site-staff procedure: read username and password from the wallpaper, sign in, confirm the AVD desktop loads, test a bookmark, log out, confirm the 10-minute idle timeout still works. If the test fails, work through KB-JSK-02 starting at Step 4 (account check).

### Step 10 — Close the ticket
Confirm with site staff the device is operational and accepted. Update the asset register entry: faulty device retired, replacement deployed, site assignment updated. Close the ticket with all references — original device name, new device name, ComputerNow ticket reference, retirement runbook job ID.

## Common Issues

| Issue | Cause and fix |
| --- | --- |
| Replacement won't complete Autopilot — error 0x80180014 | The Intune device record still exists from a prior enrolment. Delete it (Step 5) and reboot the device. Microsoft Learn — Autopilot known issues. |
| Replacement provisions but kiosk user account never appears | Confirm the device is a member of SG-APM-Autopilot-Kiosk-Devices in Entra (dynamic membership rule: device name starts with KI-APM-). If the device name was not applied correctly (rename script failure), the dynamic group does not match. Check Intune rename script status; manually rename via Entra if necessary, then wait 5 minutes for the runbook poll cycle. |
| Old credentials linger on the new device | If the new device was assigned the same KI-APM-[SITE]-[ID] as the old device, the kiosk user UPN is derived from the new serial — they are different accounts. The new device's wallpaper shows the new device's credentials. If site staff are reading off old paperwork, that is not the device's fault. |

## Summary
Confirm replacement is needed, raise with ComputerNow, retire the identity (KB-JSK-06), delete from Intune, decide on Autopilot record, track delivery, validate onsite, close. The retirement runbook plus Intune deletion before re-enrolment is the non-obvious step that catches people.