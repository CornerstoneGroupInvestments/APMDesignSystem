# KB-JSK-01-Credential-Model-Support-Overview


# Knowledge Base Article

**Support Overview – Job Seeker Kiosk Credential Model**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | KB-JSK-01 |
FOR INTERNAL USE ONLY
Commercial in confidence
© APM

**Document control**

**Version History**

| Version | Date | Author | Key changes |
| --- | --- | --- | --- |
| V0.2 | 28 May 2026 | Digital Transformation & Architecture | Reformatted: full-width single-column body, prose paragraphs replace bullet runs, tables introduced for left/right item:explanation pairs. |
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
This article gives Service Desk, Digital Operations, and Cyber Security staff a clear understanding of how Job Seeker Kiosk credentials work end to end. It is the foundation KB for the kiosk service. Every other kiosk support KB assumes you have read this one.

## What Is This?
The Job Seeker Kiosk service runs locked-down Dell thin clients in APM sites. Each kiosk runs Windows 11 IoT Enterprise in Shell Launcher kiosk mode. The thin client auto-signs into a local Windows account, launches Windows App, and connects to an Azure Virtual Desktop session host. The job seeker enters credentials displayed on the kiosk lockscreen and lands in an AVD desktop with Edge, Word, PowerPoint and Excel available via web.
The credentials displayed on the lockscreen are unique to each kiosk. There is no shared password. Each kiosk has its own Microsoft 365 F3 user account and its own randomly generated 16-character password, rotated automatically by an Azure Automation runbook.

## Who Uses It?
Job seekers attending APM Workforce Australia sites nationally use the kiosks. Site staff supervise daily operation. ComputerNow prepares and ships devices. APM IT supports the platform.

## What Is It Used For?
Job search, resume preparation, government service interaction (myGov, Centrelink, Workforce Australia), training, and webmail. Sessions are ephemeral. When a session ends the AVD host is reimaged from the golden image and no job seeker data persists.

## How a Job Seeker Signs In
The kiosk is powered on at the site and auto-signs into a local Windows account. Shell Launcher launches Windows App in place of the standard Windows shell, so there is no Start menu, taskbar, or desktop. Windows App displays the AVD sign-in prompt. Behind the prompt, the kiosk lockscreen wallpaper shows the device's unique username, password, and a data-wipe warning.
The job seeker reads the username and password from the wallpaper, types them into Windows App, and AVD authenticates against Entra ID. Conditional Access policies evaluate the sign-in and, on success, the user lands in their AVD session.
Operationally, the lockscreen wallpaper is always authoritative. The first question for any sign-in problem is whether the job seeker is reading the current credentials off the screen. The credentials change periodically; the wallpaper updates within about 60 minutes of any change.

## Components in the Credential Chain
There are six components in the credential chain. Knowing what each one does makes troubleshooting straightforward.

### 1. Kiosk user account in Entra ID

| Setting | Value |
| --- | --- |
| UPN format | kiosk-{serialnumber}@apm.net.au. Serial number lowercased, non-alphanumeric characters removed. |
| Account scope | One dedicated user account per kiosk device. |
| Created by | The account creation runbook, on first dynamic membership of SG-APM-Autopilot-Kiosk-Devices after Autopilot self-deploying completes. |
| Group membership | SG-APM-Kiosk-Users. This drives the M365 F3 licence via group-based licensing. |
| Password expiration | Disabled at the user level. Rotation is managed by the password rotation runbook. |
| ForceChangePasswordNextSignIn | False. |

### 2. Azure Key Vault

| Setting | Value |
| --- | --- |
| Vault name | kv-apm-kiosk |
| Secret naming | kiosk-{serialnumber} |
| Network access | Private-endpoint only. Public network access disabled. Endpoint pe-kv-apm-kiosk in snet-private-endpoints (hub). |
| Soft-delete retention | 90 days, purge protection enabled. A retired secret can be recovered within 90 days; after that it is permanently lost. |
| Access model | Azure RBAC (no access policies). |

### 3. Credential Proxy Function App
Because the Key Vault is private-endpoint only, a kiosk at a site cannot reach it directly. The Credential Proxy is an Azure Function App in the hub VNet with VNet integration. The kiosk calls the Function App over HTTPS, presents its primary refresh token via App Service Authentication (Easy Auth), and receives the per-device password. The Function App reads from Key Vault using its own managed identity.
The Function App's storage account (stgfuncapmcred) exposes its blob, table, and queue endpoints as separate private endpoints in snet-private-endpoints so all runtime calls stay within the VNet.

### 4. Azure Automation runbooks

| Runbook | What it does |
| --- | --- |
| Account creation | Polls SG-APM-Autopilot-Kiosk-Devices via Microsoft Graph every 5 minutes. On a new member, reads the serial from Intune, normalises it, creates the kiosk user account, generates the password, stores it in Key Vault, adds the user to SG-APM-Kiosk-Users. |
| Password rotation | Iterates SG-APM-Kiosk-Users, generates a new password per user, updates Entra (Update-MgUser, ForceChangePasswordNextSignIn=false), updates the Key Vault secret. Runs on the Automation schedule; can be triggered ad-hoc per device or fleet-wide. |
| Retirement | Disables the kiosk user, removes from SG-APM-Kiosk-Users (drops the F3 licence), soft-deletes the Key Vault secret (90-day recovery window). |
All three runbooks execute on the System Hybrid Runbook Worker hosted on a shared-services VM in snet-shared-service. The Worker uses the Automation Account's System-Assigned Managed Identity, which holds Get/Set Secret RBAC on the Key Vault.

### 5. Intune Remediation script on the kiosk device
Microsoft has renamed Proactive Remediations to Remediations. They live in the Intune admin centre at Devices > Manage devices > Scripts and remediations. The kiosk device has a Remediation script package assigned on an Hourly schedule (interval = 1 hour).

| Script | What it does |
| --- | --- |
| Detection | Reads serial number from WMI. Reads stored hash from C:\APM\Kiosk\current_hash.txt. Calls the Credential Proxy to retrieve the current password. Computes SHA256 and compares. Exit 0 on match, exit 1 on mismatch. |
| Remediation | Writes the new password to LSA private data under the DefaultPassword secret (used by Windows AutoLogon). Generates a 1920x1080 PNG lockscreen with APM branding, the kiosk UPN, the new password, and the data-wipe warning. Saves to C:\APM\Kiosk\lockscreen.png. Updates current_hash.txt. Sets the lockscreen wallpaper. |

### 6. Windows AutoLogon and LSA
The thin client signs into a local Windows account at boot using AutoLogon. AutoLogon reads the DefaultPassword from LSA private data. When the Remediation script rotates the password, it updates the LSA secret in the same run that updates the lockscreen image. These two updates are atomic from the user's point of view: by the time the new wallpaper is showing, the next boot will use the new AutoLogon credential.

## Rotation Timing and Propagation
Two rotation triggers are supported. Scheduled rotation runs the password rotation runbook on the Automation schedule (refer to the schedule definition in the Automation Account; see also G-01 in the gaps and deviations report). Ad-hoc rotation is started manually with a parameter targeting either one device (KB-JSK-03) or the whole fleet (KB-JSK-04).
When the runbook completes, Entra ID and Key Vault are updated immediately. The kiosk's Remediation script runs on its hourly schedule and picks up the new password on its next execution. Net time from rotation to new wallpaper visible on the kiosk is typically under 60 minutes, up to 90 minutes if the device was offline at the rotation moment.

## Identity Controls
Sign-in from a kiosk user account is locked down by several Conditional Access policies. These shape what 'a sign-in failure' can mean during troubleshooting.

| Policy | Effect |
| --- | --- |
| CA-APM-Kiosk-DeviceBound | Requires the device to be compliant and provisioned by the APM-Kiosk-SelfDeploying Autopilot profile. Sign-ins from any other Windows device are denied even if the password is correct. |
| CA-APM-Kiosk-BlockNonWindows | Blocks Android, iOS, macOS, Linux. |
| CA-APM-Kiosk-BlockWebClient | Blocks the AVD web portal (client.wvd.microsoft.com). Only Windows App is allowed. |
| CA-APM-Kiosk-WebOnly-Office | Kiosk users can sign in only to Office Online (Word, Excel, PowerPoint web). All other cloud apps are blocked. |
| CA-APM-Kiosk-BlockExchangeOnline | Explicit block for Outlook / Exchange Online. |
| CA-APM-Kiosk-BlockTeams | Explicit block for Microsoft Teams. |

## Five Quick Checks for Troubleshooting
These five checks resolve the majority of credential-related kiosk tickets.

| Check | What good looks like |
| --- | --- |
| Is the job seeker reading the password off the current lockscreen wallpaper? | They are reading from the live screen, not from a sticky note or piece of paper. If they wrote it down 30 minutes ago and a rotation occurred, the written copy is stale. |
| Does the wallpaper itself look current? | APM-branded, showing the kiosk's UPN, a 16-character password, and the data-wipe warning. If the wallpaper is blank or showing the default Windows wallpaper, the Remediation script has not run or has failed — check the script's run history in Intune. |
| Is the device showing in Intune as compliant, Entra-joined, and provisioned by APM-Kiosk-SelfDeploying? | All three are 'yes'. If not, Conditional Access blocks the sign-in regardless of the password. |
| Has the kiosk user account been created in Entra ID? | kiosk-{serialnumber}@apm.net.au exists, is enabled, and is a member of SG-APM-Kiosk-Users with an F3 licence applied. If missing, the account creation runbook has not yet processed the device — check the runbook's last execution log. |
| Is the Key Vault secret present? | kiosk-{serialnumber} exists in kv-apm-kiosk and has a recent version. If missing or soft-deleted, the rotation or retirement runbook may have run unexpectedly. |

## Escalation Path for Support

| Tier | Scope |
| --- | --- |
| Service Desk | L1 triage, run KB-JSK-02 (Can't log in) and KB-JSK-03 (single-device rotation). Replace device per KB-JSK-05 if hardware fault. |
| Digital Operations (first escalation) | Azure Automation runbook investigation, Intune Remediation script issues, Key Vault state, Hybrid Runbook Worker health. |
| Digital Transformation & Architecture (second escalation) | Conditional Access policy changes, design-level credential model changes. |

## Known Issues

### Wallpaper shows old credentials after rotation
Site staff report the password on screen does not work and a rotation runbook completed within the last hour. Wait up to 60 minutes for the next Remediation cycle. If still stale, force a Remediation run from Intune at Devices > Manage devices > Scripts and remediations > target device > Run on demand.

### Sign-in blocked despite correct password
AVD prompt accepts the credential but returns 'You can't get there from here' or similar. Conditional Access is blocking. Confirm the device is showing compliant in Intune and joined via the APM-Kiosk-SelfDeploying profile. If not, the device is failing CA-APM-Kiosk-DeviceBound. Re-evaluate compliance, sync the device, or escalate for Autopilot reprovisioning.

### Account missing in Entra ID for a newly built device
Device booted, lockscreen shows a username but sign-in fails with 'user not found'. Check the account creation runbook's last execution. The runbook polls every 5 minutes; the account should appear within 10 minutes of the device joining SG-APM-Autopilot-Kiosk-Devices. If 30+ minutes have passed, escalate to Digital Operations to run the runbook manually against the device's serial.

## Summary
Each kiosk is its own identity. Credentials are generated, stored, rotated, and displayed automatically. The lockscreen is the single source of truth for what the current password is. Five quick checks (current wallpaper, wallpaper showing at all, device compliance, Entra account present, Key Vault secret present) cover most tickets. Escalate to Digital Operations for runbook issues and to DT&A for Conditional Access changes.