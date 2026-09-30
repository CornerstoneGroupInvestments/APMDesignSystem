# CN-JSK-02-Replacement-Kiosk-Build


# Operational Procedure

**ComputerNow Procedure – Replacement Kiosk Build**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | CN-JSK-02 |
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
This procedure prepares a kiosk device pulled from spare stock for dispatch to an APM site as a replacement for a faulty unit. It is a variant of the initial build procedure (CN-JSK-01); the differences are described below. Where the procedures are the same, follow CN-JSK-01.

## When to Use This Procedure
Use this procedure when APM service desk has raised a replacement request specifying a faulty device that needs to be swapped at a site, and the replacement is being pulled from existing spare stock (kept at the buffer threshold agreed with APM) rather than from new procurement. If new procurement is required (no spare stock available), use CN-JSK-01 in full.

## Differences from Initial Build

### Source device — spare stock
Pull the device from the spare stock area. It has already been through CN-JSK-01 — Windows 11 IoT is installed and the device's hash is registered in Autopilot.
Skip CN-JSK-01 Step 4 (full wipe and Windows install) and Step 6 (hash registration) unless evidence suggests the device has been tampered with or the registration has been deleted at APM. If unsure, run a full wipe and re-register to be safe — it adds about an hour to the build but eliminates ambiguity.

### Destination location group
The destination site is determined by the replacement request, not by the spare stock's original allocation. If the spare was built for one location and is being shipped to another, the location-based Entra ID group assignment must reflect the new destination.

| Check | Action |
| --- | --- |
| Confirm destination site code | From APM's replacement ticket. |
| Assign to APM-JS-[NEW_LOCATION]-Devices | Option A (APM assigns) or Option B (ComputerNow assigns) per CN-JSK-01 Step 7. |
| Remove any prior location group membership | If the spare device was a member of a different location group from a prior intent, that membership must be removed first. Coordinate with APM. |

### Device name
The replaced device's old name (KI-APM-[OLD_SITE]-[ID]) does not transfer. The replacement gets a new name based on the new site. Whether the new name reuses the old ID (e.g. KI-APM-U718-03 again at the same site) or takes a new ID depends on APM's instruction in the replacement request. Default behaviour: new ID, to avoid any chance of confusion if both old and new are in flight. APM's Intune rename script applies the new name during Autopilot provisioning — ComputerNow does not need to rename manually.

### Pre-flight check — Intune cleanup at APM
Before re-running Autopilot self-deploying on a device that was previously provisioned, APM must delete the device's existing Intune managed-device record. If APM has not done this, the device fails Autopilot with error 0x80180014.
Confirm with APM that the failed device's Intune record has been deleted as part of their KB-JSK-05 / KB-JSK-06 workflow before you begin the replacement build.

### Boot for provisioning
After confirming hash registration, location group assignment, and Intune cleanup, restart the device to kick off self-deploying provisioning per CN-JSK-01 Step 8. Validate sign-in via the lockscreen credentials per CN-JSK-01 Step 9.

## Asset Register Updates

| Event | Record |
| --- | --- |
| Spare pulled from stock | Serial, original allocation (if any), date pulled. |
| Replacement build complete | New device name, destination site, original device being replaced, dispatch date. |
| Stock at or below buffer threshold | Notify APM so they can authorise top-up procurement. |

## Repackage and Ship
Repack per CN-JSK-01 Step 10. Label clearly with the new device name and destination site. Include any return-label or pickup instructions APM has requested be shipped with the replacement (to allow site staff to return the faulty unit using the new unit's outbound shipment).

## Common Issues

| Issue | Cause and fix |
| --- | --- |
| Autopilot fails with 0x80180014 on first boot | Intune managed-device record from a previous build of this physical device still exists. Notify APM to delete it. Then power-cycle the device to retry. |
| Wrong location group inherited from spare-stock build | If the device was previously in APM-JS-[OLD]-Devices and is now being shipped to a new site, the old group membership may cause incorrect policy application. Confirm with APM that group membership has been moved before proceeding. |

## Summary
Pull from spare, confirm Intune cleanup at APM, assign to the new location group, restart for self-deploying, validate sign-in, repack with the new name, ship. The replacement build is faster than initial build (typically 30 to 60 minutes per device) because the OS install and hash registration are already done.