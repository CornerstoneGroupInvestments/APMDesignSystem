# Known Issue - Kiosk Is Not Showing the Participant Session

## Purpose
To triage a Participant Kiosk that is not presenting its restricted participant session, and to get it either self-healed or escalated with the right information.

This is the highest priority fault on this fleet. No alert is raised when the restricted session fails, so a site report is often the only signal. A kiosk showing an ordinary Windows desktop is an exposed device in a public waiting area.

## Scenario
The site reports one of the following. Each is the same underlying fault class and all are handled here.

| Symptom | What it indicates |
| --- | --- |
| The kiosk shows a normal Windows desktop with a Start menu, taskbar and full file access | The restricted session did not activate. Highest priority |
| The kiosk sits at a Windows sign-in screen asking for a username and password | Automatic logon is not working. There is no password to give the site, so the device cannot be used at all |
| The kiosk shows the restricted session but some or all applications are missing from Start | The application allow-list resolved before the applications finished installing |
| The kiosk shows a black screen or the default Windows wallpaper instead of the APM wallpaper | Often the same root cause. Confirm which of the above it actually is before proceeding |

Ask the site to describe what is on screen, or to send a photo. The difference between a sign-in screen and a full desktop determines the path below.

## Before You Start
Do not attempt to fix settings on the device by hand. Every value involved is re-asserted daily by Intune remediation, so a hand fix is undone within 24 hours and hides the fault from reporting.

There is no password to give site staff for a kiosk sitting at a sign-in screen. The session account password is generated on the device, never written down, and never known to any person.

## Fix / Resolution Steps

### Step 1 - Confirm the device name
Open the Intune admin centre, go to Devices and search for the device. The name is APM-PK- followed by the Dell service tag, 13 characters in total.

If the device name does not start with APM-PK-, stop here and escalate to Digital Operations. A device outside that naming pattern is in no policy group and has received no configuration at all. It is not a session fault, it is an unconfigured device, and it needs reprovisioning.

### Step 2 - Confirm the device is checking in
On the device record in Intune, check the last check-in time and compliance state.

| Finding | Action |
| --- | --- |
| Last check-in is recent and the device is compliant | Continue to step 3 |
| Last check-in is more than 24 hours ago | The device cannot receive its configuration. Treat as a connectivity fault and follow KB-PK-06 |
| Device is not compliant | Note which setting failed and include it in the escalation at step 5 |

### Step 3 - Ask the site to restart the kiosk
A restart re-runs automatic logon and reapplies the session. Ask site staff to shut the device down and power it back on.

Allow up to 10 minutes. Cleanup runs at startup and at logon, and Windows waits for both to finish before the session is available, so a slow start is normal and must not be interrupted.

| Outcome | Action |
| --- | --- |
| The restricted session appears and the applications are present | Resolved. Record in the ticket that a restart cleared it, then continue to step 4, because a repeat is likely |
| The device returns to the same state | Go to step 5 |
| The device now shows the restricted session but applications are still missing | Go to step 4 |

### Step 4 - Missing applications only
If the session is running but Edge or LibreOffice are missing from Start, the applications had not finished installing when the session configuration was built. This is usually a recently deployed or recently rebuilt device.

Check the application install state on the device record in Intune, under the managed apps view. If LibreOffice or Zscaler show as failed or pending, escalate to Digital Operations and state which applications are not installed. The corrective action is a remediation re-run after the applications land, which Digital Operations performs.

Do not attempt to install anything on the device. Application Control is enforced and the install will fail.

### Step 5 - Collect evidence and escalate
Escalate to Digital Operations as an incident. A kiosk that is not in its restricted session is an exposed device, so state that in the ticket.

Include all of the following. The escalation will be returned without them.

| Item | Where to get it |
| --- | --- |
| Device name, APM-PK-[SERVICE TAG] | Intune, or the device asset label |
| Site and the exact on-screen symptom | Site staff, photo preferred |
| Last check-in time and compliance state | Intune device record |
| Result of the session account remediation | Intune, Devices, Scripts and remediations. The detection names the account and the state it failed on |
| Whether a restart was attempted and what happened | Your step 3 |
| Application install state, if applications were missing | Intune device record, managed apps |

### Step 6 - Contain the device until it is fixed
While the device is not in its restricted session, ask site staff to stop participants using it. Powering it off is acceptable and is preferred to leaving an unrestricted Windows desktop available in a public waiting area.

## Common Causes
For context when reading the escalation response. None of these is a Service Desk action.

| Cause | Note |
| --- | --- |
| The session configuration was overwritten | Two objects can write the same configuration and the last one to apply wins. This is a recorded open item and Digital Operations will recognise it |
| A policy that disables automatic logon reached the device | Four categories of policy each disable automatic logon on their own, including a logon banner and any device password policy. A kiosk sitting at a sign-in screen with nothing in the logs is the classic presentation |
| The applications had not installed when the session was built | The allow-list names application files by path, so it cannot resolve against an application that is not there yet |
| The device is not in the policy group | Caused by a device name that does not carry the APM-PK- prefix. Covered at step 1 |

## Summary
Confirm the device name starts with APM-PK-, confirm it is checking in, then ask the site to restart it and allow 10 minutes. If the session does not return, escalate to Digital Operations as an incident with the device name, the symptom, the check-in state and the remediation result, and have the site take the device out of use in the meantime. Never hand-fix settings on the device and never promise site staff a password, because none exists.

**Related articles:** KB-PK-01 support overview, KB-PK-06 offline or no network, KB-PK-07 replace a faulty kiosk

---

**ServiceNow submission fields**

| Field | Value |
| --- | --- |
| Knowledge Base | IT Internal Knowledge Base |
| Category | Standard |
| Ownership Group | Your ServiceNow team |
| Short Description | Known Issue - Kiosk Is Not Showing the Participant Session |
| Meta Tags | participant,kiosk,pk,restricted,session,assigned,access,autologon,sign,in,screen,desktop,not,starting,missing,applications,libreoffice,edge,apm-pk |
