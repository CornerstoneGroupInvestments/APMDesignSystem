# CN-JSK-01-Initial-Kiosk-Build


# Operational Procedure

**ComputerNow Procedure – Initial Kiosk Build (Wipe and Prep)**
28 May 2026

| Project Name: | Job Seeker Kiosk and AVD Solution |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.2 |
| Product ID: | CN-JSK-01 |
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
This procedure prepares a new Dell thin client kiosk device for deployment to an APM site. It is run by ComputerNow technicians before any device leaves the build facility. Every kiosk device must complete this procedure end-to-end.
For a replacement build from spare stock, see CN-JSK-02. For processing returned devices, see CN-JSK-03.

## What You're Building
An APM Job Seeker Kiosk. The device is a Dell thin client running Windows 11 IoT Enterprise in kiosk mode. When deployed at a site, it auto-signs into a local Windows account, launches Windows App, and connects to an Azure Virtual Desktop session. The device does not run Office or any user applications locally — it is purely a thin client to AVD.
The build process registers the device with Windows Autopilot at APM's tenant and lets Autopilot self-deploying mode complete provisioning automatically. ComputerNow's role is to install Windows 11 IoT Enterprise from USB, register the device's hardware hash with APM's tenant, assign it to the correct location group, and validate that provisioning completes successfully before packaging for shipment.

## Before You Start
You will need the items below. If any are missing or unclear, ask APM before opening the device's box.

| Item | Detail |
| --- | --- |
| Locations device allocation list | Confirms how many devices for which site code. |
| USB installation media | Agreed Windows 11 IoT Enterprise image, provided by APM and kept current. |
| Asset register access | The shared register used to track every device action. |
| Build-facility network | Public internet on TCP 443 and TCP 80, plus the TPM attestation URLs (see Step 5). |
| Tenant access for hash registration | Either a CSV-export workflow that APM ingests, or Intune Administrator permissions delegated to ComputerNow to push hashes directly (confirm the agreed model with APM). |

## Procedure

### Step 1 — Confirm the device allocation
Open the allocations list. Note the destination site code and how many devices you are building for that site. The site code drives the location-based Entra ID group (APM-JS-[LOCATION]-Devices). Get this from APM if not present in the allocation list.

### Step 2 — Unpack and DOA check
Unpack the device, power supply, and any included accessories. Power on the device with peripherals attached and confirm it reaches the manufacturer's first-boot screen. If the device fails to power on, shows visible damage, or stops mid-boot with a hardware error: do not proceed. Set aside, photograph, notify APM, and follow the DOA return process. Do not attempt to build a DOA device.
Add or update the device in the asset register: serial number, model, intended site, status = In build.

### Step 3 — Confirm TPM 2.0 and UEFI
Autopilot self-deploying mode requires TPM 2.0 and UEFI boot. A device without these cannot complete provisioning. Boot to firmware (manufacturer-specific key — typically F2, F12, or Delete during POST). Confirm the following.

| Firmware setting | Required state |
| --- | --- |
| TPM 2.0 | Present, enabled, Ready state (not Reduced Functionality). |
| Boot mode | UEFI (not Legacy / CSM). |
| Secure Boot | Enabled. |
Save changes and exit firmware. If TPM or UEFI cannot be enabled, the device is not suitable for the kiosk image — escalate to APM.

### Step 4 — Full wipe and Windows 11 IoT Enterprise install
A full disk wipe is required. Do not use Autopilot Refresh or Reset, even if the device was previously provisioned at ComputerNow — full wipe is required to guarantee no residual state.
Insert the Windows 11 IoT Enterprise USB installation media and boot from the USB. During Windows Setup, choose Custom install. Delete every existing partition on the internal drive. Confirm only Unallocated Space remains. Continue Windows Setup — the installer creates fresh partitions and installs Windows 11 IoT Enterprise. Wait for first reboot; the device boots into OOBE.

### Step 5 — Connect to the network during OOBE
Autopilot requires internet connectivity during OOBE to detect the device's Autopilot profile.

| Connection | Method |
| --- | --- |
| Ethernet (preferred) | Connect a build-facility ethernet cable. OOBE detects the connection automatically. |
| Wi-Fi (if no ethernet) | At the OOBE Wi-Fi screen press Shift + F10 to open Command Prompt. Type start ms-settings: and press Enter. The Settings app opens. Go to Network & Internet > Wi-Fi and join the build-facility Wi-Fi. Close Settings; OOBE picks up the connection. |
The build-facility network must allow outbound HTTPS (TCP 443) to Microsoft cloud endpoints. The TPM attestation paths must also be reachable, or self-deploying fails at the 'Securing your hardware' step with error 0x800705B4.

| TPM vendor | URL to allow |
| --- | --- |
| All firmware TPMs | *.microsoftaik.azure.net |
| Intel | https://ekop.intel.com/ekcertservice |
| AMD | https://ftpm.amd.com/pki/aia |
| Qualcomm | https://ekcert.spserv.microsoft.com/EKCertificate/GetEKCertificate/v1 |

### Step 6 — Capture the hardware hash and register with Autopilot
If APM's tenant does not already have the device's hardware hash registered, capture and submit it now. If still in OOBE: at any OOBE screen press Shift + F10. Type powershell.exe and press Enter. If past OOBE: sign in (if any local account exists), open PowerShell as administrator.
Run: Install-Script -Name Get-WindowsAutopilotInfo -Force (accept the NuGet prompt if shown). Then choose one of the following submission methods based on the agreement with APM.

| Method | Command |
| --- | --- |
| Direct upload to APM tenant | Get-WindowsAutopilotInfo -Online -GroupTag KIOSK-[SITECODE]. You will be prompted to sign in to APM tenant with delegated credentials. The hash uploads and the device is registered immediately. |
| CSV export for APM to ingest | Get-WindowsAutopilotInfo -OutputFile C:\AP\hash.csv -GroupTag KIOSK-[SITECODE]. Save the CSV and send to APM via the agreed channel. |
Do not pre-set -AssignedUser — self-deploying mode does not require an assigned user; APM's runbook creates the kiosk user account after provisioning completes.
Wait for APM to confirm the device is registered in Autopilot and the APM-Kiosk-SelfDeploying profile is assigned (or, if you uploaded directly, confirm in the Intune admin centre under Devices > Device onboarding > Enrollment > Devices).

### Step 7 — Assign to the location-based Entra ID group
The location-based device group (APM-JS-[LOCATION]-Devices) drives the Intune rename script, location-specific policies, and asset attribution. Without this membership, the device will not get the correct name and will not match SG-APM-Autopilot-Kiosk-Devices dynamic membership.

| Option | How |
| --- | --- |
| Option A — APM assigns (safer) | Provide APM the device's serial and destination site after hash registration. APM adds the device to APM-JS-[LOCATION]-Devices in Entra. APM owns the group; ComputerNow doesn't need Entra write access. |
| Option B — ComputerNow assigns | With delegated permissions, add the device object directly to APM-JS-[LOCATION]-Devices in Entra after the device first appears (post Autopilot). |
If using the GroupTag method during hash registration, ensure the tag value aligns with APM's dynamic group rules for location assignment — confirm tag format with APM.

### Step 8 — Restart and let Autopilot self-deploy
Restart the device. On boot, Windows OOBE picks up the Autopilot registration and the APM-Kiosk-SelfDeploying profile begins. Self-deploying mode requires no user interaction. The device joins APM's Entra tenant, enrols into Intune, and applies the Enrollment Status Page (ESP) which blocks until all required apps and policies are installed.
Expect provisioning to take 20 to 60 minutes depending on network speed and the size of the policy and app payload. The device renames itself to KI-APM-[SITECODE]-[ID] via the Intune rename script during provisioning. When provisioning completes, the device reboots into Shell Launcher kiosk mode with Windows App as the shell.

### Step 9 — Validate provisioning success
Wait for the kiosk to reach the lockscreen. The lockscreen wallpaper should show APM branding, the kiosk's username (kiosk-{serialnumber}@apm.net.au), a 16-character password, and the data-wipe warning. This wallpaper is generated by APM's Intune Remediation script and appears within 60 minutes of the device joining SG-APM-Autopilot-Kiosk-Devices.
If the wallpaper does not appear within 90 minutes of provisioning completion, escalate to APM — likely the account creation runbook or the Remediation script has not completed.
Read the credentials from the lockscreen, type them into the AVD sign-in prompt that Windows App displays, and confirm sign-in succeeds and the AVD desktop loads with Edge available. Click an Edge bookmark to confirm internet works inside the session. Log out (or wait for the 10-minute idle timeout). Confirm the device returns to the lockscreen and the Remediation cycle continues.

### Step 10 — Repackage and label
Power the device off. Disconnect any test peripherals. Repack the device in its original Dell carton with its power supply, mouse, keyboard, monitor cable, and any accessories specified by the build sheet. Apply an external label clearly showing the device name (KI-APM-[SITECODE]-[ID]) and the destination site address. Insert an inside-box instruction sheet for site staff (provided by APM). Update the asset register: status = Dispatched, dispatch date, destination site.

### Step 11 — Ship
Hand to the agreed courier. Capture the tracking number and add to the asset register and to APM's build ticket.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Securing your hardware fails (0x800705B4) | TPM 2.0 is not present, not enabled, or is in Reduced Functionality mode — re-check Step 3. Or the build-facility network is blocking TPM attestation URLs — re-check Step 5 firewall list. |
| Autopilot reports 'Account setup phase failed' / 0x80180014 | The device's Intune managed-device record was not cleaned up from a prior enrolment attempt. Notify APM to delete the device from Intune Devices > All devices before retrying. |
| Wallpaper never appears | The device is not a member of SG-APM-Autopilot-Kiosk-Devices. Confirm with APM that the device name is correctly set to KI-APM-[SITECODE]-[ID] and dynamic membership has caught it. |
| Wallpaper appears but sign-in fails | Hand to APM — likely Conditional Access or account creation issue. Provide device name, serial, and time of failed attempt. |

## Summary
Confirm allocation, DOA check, verify TPM and UEFI, full wipe and Windows 11 IoT install, connect to network, register hash with APM tenant, assign to location group, restart for self-deploying, validate sign-in via lockscreen credentials, repack and label, ship. Steps 5 to 9 are where most build failures occur — work through them carefully and escalate to APM with serial number and exact error message if anything fails.