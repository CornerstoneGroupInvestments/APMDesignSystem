# CN-JSK-03-Process-Returned-Device


# Operational Procedure

**ComputerNow Procedure – Process a Returned Kiosk Device**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | CN-JSK-03 |
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
This procedure processes a kiosk device that has been returned from an APM site. The device may be returning for hardware repair, end-of-life retirement, or because the site is being decommissioned. The procedure ensures the device is logged, inspected, and either rebuilt or destroyed according to APM's instruction.

## Procedure

### Step 1 — Log receipt
Open the box on receipt. Confirm the device name on the external label matches the contents. Match against APM's return ticket — the ticket should specify the device name, expected return date, and reason for return.
Record in the asset register: status changes from In transit (return) to Received, date and time of receipt, and condition (sealed, damaged, etc.).

### Step 2 — Physical inspection
Inspect for physical damage: cracked screen, missing keys, dented chassis, damaged ports, missing power supply, missing peripherals. Photograph any damage and attach to the asset register entry. If the device's serial label is illegible, attempt to recover via firmware. If unrecoverable, flag in the asset register — the device may not be eligible for rebuild.

### Step 3 — Confirm APM has run the retirement runbook
Critical step. Before this device is wiped or destroyed, APM must have run the kiosk retirement runbook (KB-JSK-06) to disable the kiosk user account and soft-delete the Key Vault secret. If you wipe before APM retires, the credentials remain valid in Entra ID with no device to receive them — a small but real residual risk.
Confirm with APM service desk by ticket or email: 'Retirement runbook complete for [device name] — please confirm Y/N.' Do not proceed to wipe or destroy until you have written confirmation. Hold the device in a return processing area pending confirmation.

### Step 4 — Decide on next action
APM's return ticket should specify the intended next action. If unclear, ask APM. Two paths apply.

#### Path A — Recommission as a replacement
Device will be wiped and rebuilt as a replacement for another site. Treat the device as spare stock from this point onward. When a replacement request comes in, follow CN-JSK-02 — you will skip CN-JSK-01 Steps 1 and 2 (allocation, unpack) because the device is already received and inspected. Move the asset register status to Spare stock.

#### Path B — Retire permanently
Device will be destroyed or returned to vendor — typically end-of-life hardware, severe damage, or fleet contraction. Run a secure wipe of the storage. Use a wipe method that meets APM's data sanitisation standard (typically NIST SP 800-88 Purge — confirm with APM). Once wiped, dispose per APM's e-waste process or return to vendor under warranty. Update the asset register: status = Retired, retirement date, disposal method, evidence reference.

## Common Issues

| Issue | Action |
| --- | --- |
| Device arrives without an APM return ticket | Hold the device. Do not process. Ask APM service desk to raise the matching ticket before any action — including inspection beyond external photograph. |
| APM cannot confirm retirement runbook completion | Do not wipe. APM service desk needs to run KB-JSK-06 before you proceed. |
| Returned device serial does not match return ticket | Pause processing. Capture both the expected and actual serial. Notify APM. Possible swap-up at the site or in transit. APM may need to update Entra/Intune records before you proceed. |

## Summary
Log on receipt, inspect, wait for APM's retirement runbook confirmation, then either recommission as spare or securely wipe and dispose per APM's instruction. The retirement-runbook check is the load-bearing step — wiping ahead of APM's retirement leaves orphaned credentials, which the design depends on avoiding.