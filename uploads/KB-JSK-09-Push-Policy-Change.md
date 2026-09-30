# KB-JSK-09-Push-Policy-Change


# Knowledge Base Article

**Known Issue – Push a Bookmark, Edge or Intune Policy Change to Kiosks**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | KB-JSK-09 |
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
This article deploys a change to kiosk Intune configuration safely: pilot first, validate, broaden, document. It applies to managed bookmarks, Edge policies, Assigned Access XML, Shell Launcher XML, session limits, compliance settings, or any other Intune profile in the kiosk scope.
This procedure is the operational guardrail. A wrong policy applied to all 500+ kiosks fleet-wide is a much more expensive lesson than a wrong policy applied to one pilot site.

## Scenario
Typical change requests include adding or removing a managed bookmark, adjusting an Edge policy (e.g. new download restriction or search engine change), adjusting session timeout values, refining Assigned Access XML on the session host (rare given the kiosk is web-only by design), or tightening a compliance policy (e.g. Defender required state).

## Prerequisites

| Requirement | Detail |
| --- | --- |
| Change record raised | Categorise as low-risk if the change is reversible and the pilot scope is small; standard otherwise. |
| Pilot device group | If not yet defined, create a Pilot group as a subset of one site's devices (typically 2–5 devices at one site, chosen for site staff who can communicate quickly). |
| Intune profile access | Configuration profile or Settings catalog access for the relevant scope. Kiosk physical device profiles target SG-APM-Autopilot-Kiosk-Devices. AVD session host profiles target APM-AVD-SessionHosts. |

## Fix / Resolution Steps

### Step 1 — Define the change clearly

| Element | Capture |
| --- | --- |
| What is changing | The exact policy name, setting name, current value, target value, scope group. |
| Why | Business or technical driver. Reference any ticket or incident. |
| Expected user-facing effect | What should be different for job seekers or site staff once applied. |
| Rollback plan | The steps to revert. |

### Step 2 — Apply to the pilot scope
The cleanest approach is to clone the existing configuration profile, change the setting, scope to the pilot group, and leave the production profile untouched. Alternative: temporarily change the scope of the existing profile to exclude all non-pilot devices, then add a pilot-only override (less clean than the clone approach).
Save and assign. Wait for Intune to push the policy — typically within 15 minutes for online devices.

### Step 3 — Trigger sync on pilot devices
From Intune admin centre: Devices > All devices > select pilot device > Sync. Repeat for each pilot device. For Edge ManagedFavorites changes, the new bookmark JSON applies on next Edge launch (Edge picks up the policy on profile load).

### Step 4 — Validate the pilot
Contact site staff at the pilot site. Ask them to perform a kiosk sign-in and report what they see. Confirm the expected user-facing effect (e.g. new bookmark folder visible, new timeout applies). Confirm nothing else has regressed — sign-in still works, AVD still loads, accessibility tools still available.
Leave the pilot in place for at least 24 hours where the change is non-urgent. This catches issues that only manifest over a full day cycle (idle timeout, golden image reimage, peak session count).

### Step 5 — Broaden the scope
Update the configuration profile assignment from the pilot group to the full kiosk scope (SG-APM-Autopilot-Kiosk-Devices for physical device profiles, APM-AVD-SessionHosts for session host profiles). Save. The policy propagates to all in-scope devices within the standard Intune sync window (within a few hours; faster if you trigger sync on representative devices).
If a clone profile was used for pilot, also disable or delete the original after broadening to avoid policy conflict.

### Step 6 — Verify broad propagation
Intune admin centre > the relevant configuration profile > Device assignment status. Confirm devices report Succeeded for the policy. Check a sample of devices in different sites for the expected user-facing effect.

### Step 7 — Document the change
Update the change record with start time, pilot result, broaden time, and final verification. If the change modifies a setting documented in V0.4 Detail Design Document, raise a document update — the design document is the source of truth and should be kept current.

## Rollback
Restore the original setting value in the configuration profile. Trigger sync on a sample device to validate the rollback is effective. Notify any stakeholders who were informed of the change.

## Common Issues

| Issue | Cause and fix |
| --- | --- |
| Bookmark change not visible after sync | Edge picks up the ManagedFavorites policy on Edge launch. The currently-running Edge instance does not show the new bookmark until restart. Because kiosk sessions are ephemeral, the next job-seeker session naturally picks up the change. To force immediate visibility in the current AVD session for testing, sign out and back in. |
| Policy conflict — two profiles set the same setting | Intune reports a conflict on Device assignment status. Identify the two profiles, decide which is authoritative, remove the duplicate. |
| Change reaches devices but no user-visible effect | Check the policy is scoped correctly (physical device profiles vs session host profiles — these are different scopes). Check the setting is in the right ADMX path. ADMX naming changes between Office versions and Edge channels — a setting at the wrong path silently does nothing. |

## Summary
Define the change, apply to pilot, validate the pilot for 24 hours, broaden to full scope, verify, document. Rollback is reverse-of-apply. Never deploy a policy change straight to the full fleet; the cost of pilot is small and the cost of a fleet-wide regression is high.