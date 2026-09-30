# KB-JSK-07-Onboard-New-Kiosk-Device


# Knowledge Base Article

**Known Issue – Onboard a New Kiosk Device Post-Rollout**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | KB-JSK-07 |
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
This article onboards new kiosk capacity after the national rollout has completed. It covers a new site coming online, or additional kiosks added to an existing site. The procedure orchestrates the network, identity, licensing, build, and deployment steps.
For replacing a faulty existing kiosk, use KB-JSK-05. This KB is for net-new capacity.

## Scenario
Drivers for new kiosk onboarding are a new APM site opening with kiosk capacity required from day one, an existing site adding kiosks due to demand or extended footprint, or a pilot or trial expansion.

## Fix / Resolution Steps

### Step 1 — Confirm site network readiness
Kiosks must connect to the segregated kiosk VLAN/SSID. Until that is in place, devices cannot complete Autopilot self-deploying. For a new site, raise a request with the Network team to provision the kiosk SSID mapped to the kiosk VLAN, with Zscaler routing in place. Wait for Network confirmation that the site is ready for kiosk deployment before ordering devices. (Network is out of scope for this KB set; see the Network team's own playbook for details.)

### Step 2 — Confirm Entra ID location group exists
Each location has a device group APM-JS-[LOCATION]-Devices. For an existing site, the group already exists. For a new site, create the device group: Entra ID admin centre > Groups > New group. Type: Security. Membership type: Assigned. Name: APM-JS-[LOCATION]-Devices where [LOCATION] is the 4-character site code.
If location-specific Intune policies exist (location-aware compliance, accessibility, naming), ensure they are scoped to the new group.

### Step 3 — Confirm F3 licence headroom
Each kiosk consumes one M365 F3 licence assigned via SG-APM-Kiosk-Users group-based licensing. Open Microsoft 365 admin centre > Billing > Licences and confirm available F3 count is greater than the number of new kiosks being onboarded.
If insufficient, top up via the licensing reseller before raising the build request. Account creation will fail if no licence is available when the runbook adds the user to SG-APM-Kiosk-Users.

### Step 4 — Raise the ComputerNow build request

| Field | Value |
| --- | --- |
| Site code and address | Destination site. |
| Number of devices | Count required. |
| Destination Entra group | APM-JS-[LOCATION]-Devices |
| Stock source | Spare stock (faster) or new procurement (longer lead time). |
ComputerNow follows CN-JSK-01 for new procurement or CN-JSK-02 for spare stock.

### Step 5 — Monitor the build pipeline
ComputerNow updates the build ticket as devices progress through wipe-and-prep. When ComputerNow registers hashes in Autopilot, the devices appear in Intune admin centre > Devices > Device onboarding > Enrollment > Devices (Windows Autopilot). Capture serial numbers and device names as they are dispatched.

### Step 6 — Validate Autopilot provisioning per device
Once a device is delivered to the site and powered on, the following happens automatically. Track this for each device to catch issues early.

| Phase | What happens |
| --- | --- |
| Boot | Device connects to kiosk Wi-Fi. OOBE picks up the Autopilot registration. |
| Self-deploying provisioning | Tenant join, Intune enrolment, ESP applies apps and policies. 20–60 minutes. |
| Rename | Intune rename script sets the device name to KI-APM-[SITECODE]-[ID]. |
| Dynamic group catch | Device name prefix triggers dynamic membership of SG-APM-Autopilot-Kiosk-Devices. |
| Account creation | Within 5 minutes, the account creation runbook polls the group, finds the new member, creates the kiosk user account, stores the password in Key Vault, and adds the user to SG-APM-Kiosk-Users. |
| Lockscreen render | Within 60 minutes (one Remediation cycle), the wallpaper renders with credentials. |

### Step 7 — First-login validation
Ask site staff to perform the first-login test per the site-staff procedure: read credentials, sign in, confirm AVD, test a bookmark, log out, wait for timeout. If sign-in fails, work KB-JSK-02 starting at Step 4. If the wallpaper has not rendered after 90 minutes, force a Remediation Run on demand from Intune.

### Step 8 — Update the asset register and close
Confirm ComputerNow has logged the build, dispatch, and delivery. Confirm site staff have signed off on the test. Close the ticket with all references.

## Common Issues

| Issue | Cause and fix |
| --- | --- |
| Device provisioned but kiosk user account never appears | The account creation runbook polls every 5 minutes. If 30+ minutes have passed, check the runbook's last execution log. Confirm the device is a member of SG-APM-Autopilot-Kiosk-Devices. If not, the device name does not match the dynamic membership rule (KI-APM- prefix) — the rename script may have failed. If runbook execution is failing, escalate to Digital Operations. |
| Wallpaper renders but credentials don't work | Treat as KB-JSK-02 starting at Step 4 (confirm account state). |
| Site reports kiosk can't reach AVD | Network: confirm the device is on the kiosk VLAN and Zscaler is applied. Conditional Access: confirm compliance and Autopilot profile assignment per KB-JSK-02 Step 5. |

## Summary
Network ready, location group exists, F3 headroom available, ComputerNow build raised, monitored to delivery, automatic identity provisioning verified, first-login test signed off. New site onboarding adds the network and group setup steps; same-site capacity expansion is simpler.