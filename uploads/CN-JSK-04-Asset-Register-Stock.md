# CN-JSK-04-Asset-Register-Stock


# Operational Procedure

**ComputerNow Procedure – Asset Register Hygiene and Stock Holding**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | CN-JSK-04 |
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
This procedure keeps the kiosk asset register accurate and maintains agreed buffer stock levels. The asset register is the shared source of truth between ComputerNow and APM for every device in the fleet. Stock holding underwrites APM's replacement SLA at metro sites.

## Asset Register

### Required fields per device

| Field | Detail |
| --- | --- |
| Device serial number | BIOS serial, as printed on the device label. |
| Device name | KI-APM-[SITECODE]-[ID]. Updated whenever the name changes (replacement build, site move). |
| Model and manufacturer | e.g. Dell OptiPlex 3000 Thin Client. |
| Date of receipt at ComputerNow | From manufacturer. |
| Assigned site | Site code and address. |
| Destination Entra ID group | APM-JS-[LOCATION]-Devices. |
| Status | In build / In transit (outbound) / Deployed / Returned / In transit (inbound) / Spare stock / Retired. |
| Date of last status change | Always current. |
| Dispatch tracking reference | When outbound. |
| Return tracking reference | When inbound. |
| Notes | Any condition, damage, or special handling. |

### Triggers for updates
The register must be updated on every device-state change.

| Trigger event | Register update |
| --- | --- |
| Receipt from manufacturer | Create register entry. |
| DOA flagged | Status = DOA. Escalate to APM. |
| Build complete and dispatched | Status = In transit (outbound). Tracking ref recorded. |
| Site confirms delivery and operation | Status = Deployed. |
| Site initiates return | Status = In transit (inbound). |
| Return received at ComputerNow | Status = Returned. |
| Decision to recommission | Status = Spare stock. |
| Decision to destroy | Status = Retired, with disposal evidence. |

### Reconciliation
ComputerNow and APM reconcile the register on the agreed cadence (typically quarterly). Reconciliation compares ComputerNow's register against APM's Intune device list, Entra device group memberships, and the kiosk user account count. Any discrepancies are flagged and investigated.

## Stock Holding

### Buffer threshold
Maintain the agreed buffer stock of pre-imaged kiosk devices ready for dispatch (confirm exact threshold with APM — typically a small percentage of the total deployed fleet). Buffer stock should consist of devices that have completed CN-JSK-01 through Step 6 (Windows installed, hash registered, ready for assignment to a destination location).
Buffer stock is NOT pre-assigned to a specific site. The destination is determined when the replacement request comes in (CN-JSK-02).

### Replenishment trigger
When spare stock count drops below the buffer threshold, notify APM via the agreed channel. APM authorises top-up procurement and provides the next batch's allocation. Build the top-up batch per CN-JSK-01 and hold in the spare stock area.

### Stock health checks
Periodically (monthly) power on each spare-stock device, allow it to sync with Intune (it receives the latest policies and updates), then power off again. This prevents the spare stock from accumulating large pending updates that would extend deployment time when called into service.
Spare stock that has been held longer than 6 months should be re-validated end-to-end (boot, sign-in to AVD, log out) before dispatch. Old Windows updates may need to apply on first boot.

## Operational Conventions

| Topic | Convention |
| --- | --- |
| Site codes | Issued by APM. Do not invent a site code if it is not in the allocation list — ask APM. |
| Sequential IDs within a site | Assigned per APM's instruction. ComputerNow does not unilaterally re-use a retired ID without APM's authorisation. |
| Returning devices via new device shipment | Where site staff have a faulty device awaiting return and a new device is being shipped, include a return label and instructions inside the new shipment. This consolidates logistics and ensures the faulty device returns promptly. |

## Summary
Keep the register current on every state change. Maintain agreed buffer stock. Refresh stock periodically to avoid stale spare devices. Reconcile with APM quarterly. The register is the audit trail for the fleet — invest in keeping it accurate.