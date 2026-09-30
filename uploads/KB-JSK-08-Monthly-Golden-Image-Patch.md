# KB-JSK-08-Monthly-Golden-Image-Patch


# Knowledge Base Article

**Known Issue – Monthly Kiosk Golden Image Patch and Promote**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | KB-JSK-08 |
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
This article patches and promotes the kiosk AVD golden image on the monthly cadence. The kiosk solution does no in-session patching — all updates land via image refresh. This KB is owned by Digital Operations and is run once per month, or out-of-band for critical security updates.

## Scenario
Monthly cadence patches cover the latest cumulative Windows 11 updates, Edge stable channel update, Defender definitions, and Microsoft 365 Apps updates. Out-of-band triggers are a critical CVE, Intune policy change requiring image rebuild, Nerdio platform update, or rollback to a prior image version.

## Prerequisites

| Requirement | Detail |
| --- | --- |
| Nerdio admin access | On the APM tenant. |
| Azure Compute Gallery contributor access | On the gallery hosting the kiosk image. |
| Change record raised | Per APM change management process. Use the existing change category for AVD golden image updates. |
| Validation host pool configured | HP-APM-Kiosk-Validate — confirm name with Nerdio. See G-18 in the gaps and deviations report. |
| Validation test plan available | Covers session lifecycle, app launch, bookmarks, USB redirection, idle timeout, reimage. Confirm the current plan with Cyber Security and DT&A before the first cycle. |

## Fix / Resolution Steps

### Step 1 — Pull the current golden image
In Nerdio Manager, open the kiosk image used by HP-APM-Kiosk. Identify the current Compute Gallery version (e.g. 1.0.5). Note the version and date — this is your rollback target if the new image fails validation or production promotion. Create a new temporary image VM from the current version (Nerdio: Create new image from existing image).

### Step 2 — Apply updates to the image VM
Start the image VM in Nerdio and sign in via Bastion or the Nerdio-provided RDP. Sign in as a local admin or the AVD image admin account — do not sign in with a domain or Entra user account that may leave profile artefacts.

| Update | Action |
| --- | --- |
| Windows updates | Apply latest. Reboot if prompted. |
| Microsoft Edge | Update to the latest stable channel. |
| Microsoft Defender definitions | Settings > Update & Security > Windows Security > Virus & threat protection > Check for updates. |
| Microsoft 365 Apps | Update where applicable. Note: per the current design the kiosk uses web-Office only, so desktop Office updates may not apply — confirm against V0.4 once G-06 is resolved. |
| Intune policy sync | Settings > Accounts > Access work or school > Connected account > Info > Sync. |

### Step 3 — Pre-capture cleanup
Clean up temp files using cleanmgr /sageset:99 then cleanmgr /sagerun:99 with all options selected, or run Storage Sense. Remove any user profiles created during patch testing. Do not install or join the AVD agent on the image VM — Nerdio adds the agent at session host deployment time. If the agent is present in the image, session host registration fails. Defragment the OS disk (Optimize Drives).

### Step 4 — Capture the new image version
In Nerdio, capture the image. Nerdio handles sysprep automatically. Set the new version number incrementally (e.g. 1.0.6 from 1.0.5). Preserve the previous version in the gallery — do not delete. Wait for capture and gallery upload to complete; typical runtime is 30 to 60 minutes.

### Step 5 — Deploy to validation host pool
In Nerdio, promote the new image version to the validation host pool. Allow Nerdio to reimage all hosts in the validation pool from the new image. Confirm the host pool returns to a healthy state (all hosts available, no agent issues).

### Step 6 — Run the validation test plan
Use a test kiosk credential (or a non-production kiosk user account created for validation) to sign into the validation host pool via Windows App.

| Test | Expected outcome |
| --- | --- |
| Sign-in with test kiosk credential | Succeeds against the validation pool. |
| Edge launches and reaches a configured bookmark | Edge opens, bookmark loads. |
| Word, PowerPoint, Excel Online via Edge bookmarks | All three launch and function. |
| Managed bookmarks render | Folder layout correct, all URLs reachable. |
| USB redirection | USB stick inserted at the kiosk side mounts inside the AVD session. |
| Printer redirection (where in scope) | Per current design, DR-002 is email-to-caseworker so direct print is not required. Confirm path functions as designed. |
| Idle timeout disconnects | 10-minute idle session disconnects. |
| Reimage on disconnect | Session host reimages within the 1-minute disconnected limit. Verify in Nerdio activity log. |
| Accessibility tools | Narrator launches via Win+Ctrl+Enter, Magnifier via Win+Plus, font scaling via Settings, on-screen keyboard via taskbar. |
| Edge ephemeral profile | No profile artefacts persist between sessions. |

### Step 7 — Capture validation evidence
Screenshots or notes per test case. Attach to the change record. If any test fails, do not proceed to production. Investigate, fix, and re-run validation from Step 5.

### Step 8 — Promote to production
In Nerdio, promote the new image version to the production host pool HP-APM-Kiosk. Allow Nerdio to reimage all session hosts. Schedule outside peak site hours where practical. Monitor the reimage progress — each host enters drain mode, waits for sessions to end, reimages from the new image, and rejoins the pool. Confirm all hosts are healthy in Nerdio at the end.

### Step 9 — Production smoke test
Run a single AVD sign-in via a test kiosk against production to confirm sessions broker correctly to a host running the new image. Confirm one site is operating normally — phone or message site staff at a low-volume site to confirm sign-ins are succeeding.

### Step 10 — Close the change
Update the change record with image versions (old and new), validation evidence, production promotion time, and smoke test result. Close per the change management process.

## Rollback
If production reveals an issue not caught in validation, roll back to the previous image version. In Nerdio, set the production host pool image to the previous Compute Gallery version (the one captured before this cycle's update). Allow Nerdio to reimage all session hosts from the previous version.
Open an incident or change failure record. Investigate the failed image before re-attempting. Do not delete the failed image version immediately — keep it for root cause analysis.

## Common Issues

| Issue | Cause and fix |
| --- | --- |
| Capture fails at sysprep | Common cause: antivirus or telemetry tools that haven't been disabled on the image VM. Stop those services and retry. Also common: Unified Write Filter (UWF) enabled. UWF is not supported on AVD session hosts — disable in the image. |
| Session host fails to register after promotion | The AVD agent is the most common cause. Confirm the agent was not pre-installed in the image. Check Nerdio activity log for registration errors. May need to remove and re-add the host. |

## Summary
Patch the image, capture a new version, validate in the validation pool against the full test plan, promote to production via Nerdio, smoke-test, close the change. Always preserve the prior version for rollback. The validation test plan is non-negotiable; AVD problems found in production cost far more than the test run.