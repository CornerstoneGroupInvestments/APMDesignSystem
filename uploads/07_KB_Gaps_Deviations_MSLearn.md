# Job Seeker Kiosk KBs — Gaps, Deviations and Microsoft Learn Validation

Companion to the Job Seeker Kiosk KB set. Read this before relying on any KB. Every item here is one of three things: a gap in V0.3, an inconsistency in V0.3 the KBs had to interpret, or a deliberate deviation from V0.3 based on Microsoft Learn best practice.

For each item: what I found, what I did in the KBs, and what you need to decide.

---

## Critical — must be resolved before publication

### G-01 Inconsistency: rotation cadence

V0.3 Decision Register DR-004 says password rotation is **12-month**. V0.3 section "Rotation Schedule" says the rotation runbook runs **quarterly**. The Stakeholder Instructions just say "periodically (rotated automatically)".

What I did: The KBs document the rotation as "on the schedule defined in the runbook (quarterly per current design, or ad-hoc on suspected compromise)". I have NOT picked one over the other.

What you need to decide: Lock one cadence in V0.4 — quarterly or annual — and I will update the KBs to match. Recommend quarterly, given RFFR posture.

### G-02 Inconsistency: group naming

V0.3 uses three different names for what appears to be the kiosk-user security group:
- `SG-APM-Kiosk-Users` (account creation runbook, password rotation runbook, retirement runbook, F3 licence assignment)
- `APM-AVD-KioskUsers` (Conditional Access policy tables 52, 53, 56, 57, 58, 59, 60; AVD application group table 62)
- The Entra ID Groups table (Table 50) lists `APM-AVD-KioskUsers` but the Kiosk User Account table (Table 16) says membership is `SG-APM-Kiosk-Users`.

What I did: I treat them as the same group and use `SG-APM-Kiosk-Users` throughout the KBs (it's the runbook-facing name and the F3-licensing name, which are the operational touch points). The CA policy references are noted as targeting "the kiosk users group" with a flag to update once you pick the canonical name.

What you need to decide: Pick one name and apply it consistently in V0.4. Same for the Autopilot device group — V0.3 uses both `APM-Autopilot-Kiosk-Devices` (Table 50, Autopilot profile assignment) and `SG-APM-Autopilot-Kiosk-Devices` (account creation runbook, Shell Launcher profile scope). These should be the same group.

### G-03 Inconsistency: kiosk UPN case

V0.3 says the UPN is `Kiosk-{serialnumber}@apm.net.au` with serialnumber lowercased and non-alphanumeric removed. Two paragraphs later it gives the example `kiosk-CU9G7H2@apm.net.au` (lowercase "kiosk-", uppercase serial), and the Stakeholder Instructions use `Kiosk-[SERIAL]@apm.net.au` (capital K).

What I did: KBs use lowercase consistently — `kiosk-{serialnumber}@apm.net.au` — because Entra ID UPNs are case-insensitive at lookup time but the stored display follows what was set at creation. The account creation runbook generates the UPN; whatever it sets is what kiosks must match.

What you need to decide: Confirm the runbook generates lowercase. If it generates mixed-case, update the KBs.

### G-04 Stakeholder doc error: domain mismatch in example

Stakeholder Instructions section 4.1 has the PowerShell example:
```
Get-WindowsAutopilotInfo -OutputFile C:\AP\hash.csv -GroupTag KIOSKTAGIncLOCATION -AssignedUser kiosk_user_01@apm.com.au
```
The domain is wrong. APM's kiosk domain is `apm.net.au`, not `apm.com.au`. This appears in the doc going to ComputerNow. They will copy-paste and fail.

What I did: CN-01 uses the correct domain `apm.net.au` and does not include an `-AssignedUser` value at all — self-deploying mode does not require an assigned user (V0.3 Autopilot profile: "User sign-in: Not required"). The kiosk user account is created by the Azure Automation runbook after the device joins the device group, so pre-assigning a user during hash registration is pointless.

What you need to decide: Confirm with ComputerNow that an `-AssignedUser` value is not needed for kiosk Autopilot registration. If you want to pre-stage the user, that changes the runbook trigger model and needs a design call.

### G-05 Design contradiction: lockscreen remediation script logic

V0.3 section "Lock Screen Image Generation" describes the per-device remediation script correctly: read serial, call Credential Proxy, get per-device password, write LSA secret, generate lockscreen image.

V0.3 section immediately below ("The remediation script rotates the lockscreen wallpaper by") says the script "Receives the current fleet password from Azure Blob Storage using a read-only SAS token". This is a leftover from the V0.2 single-password design. The per-device design (V0.3) does not use Azure Blob Storage or a SAS token for password retrieval — it uses the Credential Proxy Function App.

What I did: KBs follow the per-device Credential Proxy model. The Blob/SAS path is treated as a stale paragraph and ignored.

What you need to decide: Strike the Blob Storage / SAS paragraph from V0.3 in the next revision.

### G-06 Microsoft 365 licensing: device-based licensing setting is irrelevant for web-only Office

V0.3 includes an Intune Settings Catalog profile `APM-AVD-OfficeDeviceLicense` setting "Use a device-based license for Office 365 ProPlus = Enabled" at `Microsoft Office 2016 (Machine) > Licensing Settings`. Table 10 also lists "Microsoft 365 online Apps device-based based licencing".

Microsoft Learn position:
- The Group Policy / Intune setting **Use a device-based license for Office 365 ProPlus** only applies to **Microsoft 365 Apps for enterprise (desktop)**. It activates the desktop click-to-run client per-device.
- It does nothing for **web-based Office** (Word/Excel/PowerPoint Online), which is what V0.3 actually deploys (Edge bookmarks to Office Online, no desktop install on the AVD session host per the application architecture).
- True "device-based licensing" requires the specific SKU `Microsoft 365 Apps for enterprise (device)`, available only through EA/EAS. F3 is **not** a device-licensed SKU. F3 grants the user web-Office rights.

So one of two things is wrong:
- (a) The plan is web-only Office (per the application architecture and DR-001/DR-007) — in which case the `APM-AVD-OfficeDeviceLicense` Intune profile and the "device-based licensing" claims in Table 10 are dead settings and should be removed.
- (b) The plan is desktop Office on the AVD host pool — in which case F3 is the wrong SKU and you need `Microsoft 365 Apps for enterprise (device)` (or Shared Computer Activation with a user-licensed SKU).

What I did: KBs document the design as web-only Office (matches application architecture and the kiosk user experience). KB-01 and KB-06 do not reference desktop Office activation. The deviations report calls this out so you can resolve.

What you need to decide: Confirm web-only Office is the design. If so, remove `APM-AVD-OfficeDeviceLicense` from Intune scope in V0.4 and correct Table 10's licensing column. If desktop Office is in play, the licensing model needs a redesign.

References:
- https://learn.microsoft.com/microsoft-365-apps/licensing-activation/device-based-licensing
- https://learn.microsoft.com/microsoft-365-apps/licensing-activation/overview-licensing-activation-microsoft-365-apps
- https://learn.microsoft.com/microsoft-365-apps/deploy/deploy-microsoft-365-apps-remote-desktop-services

---

## Important — KBs handle, but you should validate

### G-07 Microsoft Learn — "Proactive Remediations" is now just "Remediations"

V0.3 uses the term "Proactive Remediation" throughout. As of late 2024, Microsoft renamed the feature to **Remediations** in the Intune admin centre (Devices > Manage devices > Scripts and remediations). The term Proactive Remediations still appears in older blog posts.

What I did: KBs use **"Remediation script package"** (current Microsoft terminology) on first mention, and "Remediation" thereafter. They reference the Intune admin centre path Microsoft uses today.

Reference: https://learn.microsoft.com/intune/device-management/tools/deploy-remediations

### G-08 Remediation schedule — what V0.3 says vs how the assignment actually works

V0.3 says the lockscreen Remediation runs every 60 minutes. Microsoft Learn confirms the assignment schedule supports **Hourly with a configurable interval less than 24 hours**, so "every 1 hour" is valid. Important nuance V0.3 doesn't surface:

- The **Intune Management Extension** retrieves remediation policy from the service every 8 hours, on service restart, and on user sign-in.
- The **assignment schedule** (the 60-minute interval) controls when the local script runs.
- If a scheduled run is missed (device off, offline, awake but service paused), the remediation runs as soon as possible after the device is online.

What I did: KBs document this clearly. The "expect the new credential to appear within 60 minutes" message to site staff is fine, but the SLA in KB-03 says "within 60 minutes (up to 90 if the device was offline at the rotation moment)".

Reference: https://learn.microsoft.com/intune/device-management/tools/deploy-remediations#client-policy-retrieval-and-client-reporting

### G-09 Autopilot self-deploying — device re-enrolment requires Intune deletion first

V0.3 mentions this implicitly in the retirement runbook ("Remove the device record from the Intune managed devices list") but does not flag it as a critical step.

Microsoft Learn is explicit: a device cannot automatically re-enrol through Windows Autopilot after an initial deployment with self-deploying mode. If the Intune device record still exists, redeployment fails with error code `0x80180014`. The device record in Intune must be deleted before re-running Autopilot self-deploying.

What I did: KB-06 (Retire) and CN-02 (Replacement build) flag this explicitly. CN-01 troubleshooting includes a check for this on devices that previously enrolled.

Reference: https://learn.microsoft.com/autopilot/known-issues#delete-device-record-in-intune-before-reusing-devices-in-self-deployment-mode-or-pre-provisioning-mode

### G-10 Autopilot self-deploying — TPM 2.0 firmware certificate prerequisite

V0.3 mentions TPM 2.0 as a prerequisite. Microsoft Learn adds a specific networking requirement V0.3 misses: firmware TPMs (Intel, AMD, Qualcomm) must reach `*.microsoftaik.azure.net` plus the per-vendor URL during OOBE to retrieve attestation certificates. Discrete TPMs ship with certificates pre-installed. The DAG (kiosk VLAN) must allow these URLs during initial provisioning at ComputerNow's site.

What I did: CN-01 includes the firmware TPM URL list in the pre-build network check.

Reference: https://learn.microsoft.com/autopilot/requirements#windows-autopilot-self-deploying-mode-and-windows-autopilot-pre-provisioning

### G-11 Hybrid Runbook Worker — Automation Account Managed Identity caveat

V0.3 says the System Hybrid Runbook Worker uses the Automation Account Managed Identity with Get/Set Secret on the Key Vault. Microsoft Learn validates this pattern but notes:

> It is NOT possible to use the Automation Account's User Managed Identity on a Hybrid Runbook Worker, it must be the Automation Account's System Managed Identity.

And once an Automation Account Managed Identity is enabled, the VM's own Managed Identity cannot be used.

What I did: KBs assume the System-Assigned Managed Identity on the Automation Account is the principal with Key Vault RBAC. KB-10 (IR) flags this as a thing to verify if Key Vault access ever fails from a runbook.

Reference: https://learn.microsoft.com/azure/automation/automation-hrw-run-runbooks#configure-runbook-permissions

### G-12 Conditional Access — sign-in frequency is 12 hours

V0.3 sets sign-in frequency to 12 hours on CA-APM-Kiosk-DeviceBound and CA-APM-Kiosk-WebOnly-Office. With 10-minute session timeout and full reimage between sessions, this is fine for the user experience but worth noting in KB-02 troubleshooting — a refresh token forced re-auth could surface as "user says password is right but it's not working" if the device's primary refresh token expired and the kiosk user's password rotated since the last successful AVD sign-in. The 60-minute Remediation cycle picks up the new password and refreshes LSA, so this is self-healing within an hour.

What I did: KB-01 explains the credential lifecycle including the PRT/SFP angle at a high level. KB-02 includes "credential just rotated — wait 60 minutes" as a triage step.

---

## Minor — flagged for V0.4 hygiene

### G-13 Lockscreen image dimensions

V0.3 section "Lock Screen Image Generation" says the remediation script generates a 1920x1080 PNG. The next section (same chapter) says "Generates 1920x1280 image using System/Drawing". 1920x1280 is not a standard display ratio. 1920x1080 is the FHD standard. Treat 1920x1280 as a typo.

What I did: KBs say 1920x1080.

### G-14 Path typo `C:\APM\kisok\current_hash.txt`

V0.3 has both `C:\APM\Kiosk\` and `C:\APM\kisok\` (typo) for the local state directory. KBs use `C:\APM\Kiosk\` (capital K, correct spelling).

### G-15 Account creation runbook trigger — polling vs event

V0.3 says the account creation runbook polls the device group via Microsoft Graph at a 5-minute interval. Microsoft Graph supports change notifications (webhooks) on group membership that would remove the polling delay. Not a blocker — polling at 5 min is operationally fine — but worth a design call if the trigger latency ever becomes a complaint.

What I did: KB-07 (Onboard new device) documents the 5-minute polling cadence so the service desk understands why account/credential aren't immediately ready after a fresh Autopilot completion.

### G-16 ComputerNow asset register fields

Stakeholder doc 4.4 lists serial, device name, assigned site, status, last action date. The V0.3 design does not specify the asset register schema. KBs adopt the stakeholder list verbatim and add Entra device group and dispatch tracking number as recommended additional fields.

### G-17 Naming convention enforcement mechanism

Stakeholder doc says naming is "applied automatically based on the Entra ID group assignment". V0.3 says naming is "enforced via an Intune device rename script during Autopilot provisioning". Two different mechanisms. The Intune rename script is the correct and supported mechanism (Entra group membership cannot rename a device). KBs and CN-01 document the rename script path.

### G-18 Validation host pool vs production host pool

V0.3 Nerdio configuration says "Validation environment: No (separate validation pool for image testing)". Stakeholder doc references a "validation host pool" in section 6.1. V0.3 does not give the validation pool a name. KB-08 uses `HP-APM-Kiosk-Validate` as a placeholder and flags it for confirmation.

### G-19 RFFR SoA — referenced but spreadsheet not in scope of these KBs

V0.3 references "AVD RFFR SoA based on ISM September 2025 v7.7m.xlsx" as the source of compliance controls. Stakeholder doc says Cyber Security reviews this spreadsheet periodically. KBs reference the spreadsheet by name but do not reproduce its content. Recommend the SoA workbook be reviewed for any operational controls the service desk owns (incident logging, evidence capture) and folded into KB-10.

---

## Out of scope — Stakeholder doc sections not covered by these KBs

By your direction, the Network section is excluded. Other stakeholder content that did not become its own KB:

- Site staff procedures (receiving devices, first login, day-to-day, common issues) — these are not internal IT KBs in the ServiceNow sense. They should be a separate site-staff operations sheet (laminated card or intranet page), not an IT KB. KB-02 and KB-05 reference site staff actions where they intersect with IT support.
- Case manager / case worker actions (printing on behalf of job seeker, helping sign-in, helping save work) — same reasoning as above. These belong in a case worker playbook, not IT internal KB.
- Cyber Security periodic reviews (Stakeholder 7.3) — annual reviews are a calendar/governance activity, not a KB-grade procedure.

Confirm if you want any of the above produced as a separate non-KB artefact later.

---

## Microsoft Learn references used in the KB set

| Topic | URL |
| --- | --- |
| Autopilot self-deploying mode | https://learn.microsoft.com/autopilot/self-deploying |
| Autopilot requirements (TPM, networking) | https://learn.microsoft.com/autopilot/requirements |
| Autopilot known issues (re-enrolment, TPM errors) | https://learn.microsoft.com/autopilot/known-issues |
| Get-WindowsAutopilotInfo script and hash collection | https://learn.microsoft.com/autopilot/add-devices |
| Intune Remediations (formerly Proactive Remediations) | https://learn.microsoft.com/intune/device-management/tools/deploy-remediations |
| Azure Automation Hybrid Runbook Worker — managed identities | https://learn.microsoft.com/azure/automation/automation-hrw-run-runbooks |
| Azure Automation Private Link limitations | https://learn.microsoft.com/azure/automation/how-to/private-link-security |
| Microsoft 365 Apps licensing modes | https://learn.microsoft.com/microsoft-365-apps/licensing-activation/overview-licensing-activation-microsoft-365-apps |
| AVD golden image lifecycle | https://learn.microsoft.com/azure/virtual-desktop/set-up-golden-image |
| AVD operational procedures — image management | https://learn.microsoft.com/azure/well-architected/azure-virtual-desktop/operations |
| Assigned Access CSP | https://learn.microsoft.com/windows/client-management/mdm/assignedaccess-csp |
| Shell Launcher overview | https://learn.microsoft.com/windows/configuration/shell-launcher/ |
| Assigned Access recommendations (auto sign-in) | https://learn.microsoft.com/windows/configuration/assigned-access/recommendations |
