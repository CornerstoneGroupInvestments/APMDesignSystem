# Known Issue - Replace a Faulty Participant Kiosk

## Purpose
To replace a Participant Kiosk that cannot be recovered remotely, from raising the replacement through to confirming the new device is working at the site.

## Scenario
Replacement is the right path for these.

| Symptom | Note |
| --- | --- |
| Will not power on, or does not reach the participant session after repeated restarts | Hardware or provisioning fault |
| Physical damage: screen, ports, keyboard, mouse | Hardware fault |
| The date resets to a wildly wrong value at every power off | Flat CMOS battery. Not repairable remotely. See KB-PK-05 |
| Repeated faults on the same device after the relevant KB has been worked through and Digital Operations has escalated back | Beyond remote recovery |
| Enrolment never completes on a newly delivered device, after a retry | Hardware or attestation fault |

It is the wrong path for anything that has not been triaged first. Work the relevant article before raising a replacement.

| Symptom | Use instead |
| --- | --- |
| Not showing the participant session | KB-PK-02 |
| Restart or data clearing problem | KB-PK-03 |
| A blocked website or application | KB-PK-04 |
| Wrong time or time zone | KB-PK-05 |
| Offline or no network | KB-PK-06 |

A device that is simply offline is not faulty. Confirm the site network is working before condemning a device, because an entire site of "faulty" kiosks is a network fault.

## What Makes This Fleet Simple to Replace
There is no user identity, no mailbox, no licence and no data to migrate. Nothing about the failed device needs to be preserved, and nothing needs to be recovered from it.

Participant data is destroyed at every session boundary, so a failed device holds nothing of value. If the device is physically damaged and cannot be wiped, that is not a data risk in itself, but state it in the ticket so it is handled under the normal asset disposal process.

## Fix / Resolution Steps

### Step 1 - Confirm replacement is the right call
Confirm the relevant triage article has been worked through, and that the fault is not the site network. Record in the ticket which article was followed and what the outcome was.

For anything other than obvious physical damage or a device that will not power on, have Digital Operations confirm the device is beyond remote recovery before raising a replacement. A device that would have self-healed within 24 hours should not be replaced.

### Step 2 - Capture the failed device details
| Item | Where to get it |
| --- | --- |
| Device name, APM-PK-[SERVICE TAG] | Intune, or the device asset label |
| Dell service tag | The device asset label |
| Site and exact location within the site | Site staff |
| Fault description and the triage already done | The ticket |
| Whether the device powers on at all | Site staff. Determines whether it can be wiped before return |

### Step 3 - Raise the replacement with CompNow
Raise the replacement request with the device build partner, CompNow, through the agreed channel. Provide the details from step 2, and state the urgency based on how many working kiosks remain at that site.

CompNow prepares the replacement, including registering it for automatic provisioning. Nothing needs to be built or configured by APM.

### Step 4 - Arrange the return of the failed device
Arrange the return label and confirm with site staff that they have suitable packaging. Ask them to keep the failed device switched off and out of use until it is collected.

### Step 5 - Remove the failed device from management
Once the replacement has been confirmed as dispatched, ask Digital Operations to remove the failed device's records from Intune and Entra ID.

Do not skip this and do not leave it until later. A stale record for a device that is later rebuilt or returned to stock causes the replacement provisioning to fail, and the cause is not obvious from the error. Record in the ticket that the removal was requested and when it was completed.

### Step 6 - Site receives and powers up the replacement
Site staff unbox the device, place it, connect the peripherals and power it on. There is nothing else for them to do, and nothing to type.

The device provisions itself automatically. Allow 20 to 60 minutes. Tell the site not to interrupt it, not to switch it off during this period, and that several restarts during provisioning are normal.

### Step 7 - Confirm the replacement is working
Ask site staff to confirm all of the following before the ticket is closed.

| Check | What good looks like |
| --- | --- |
| The device reaches the participant session on its own | No sign-in screen, no ordinary desktop, no password prompt |
| The APM wallpaper is showing | Confirms the device has taken its configuration |
| Edge and LibreOffice Writer, Calc and Impress all open from Start | Confirms the applications installed before the session was built |
| A website loads | Confirms the device is on the kiosk network |
| Left untouched for 15 minutes, the device locks and restarts | Confirms the inactivity mechanism is working |

If any check fails, follow the relevant article: KB-PK-02 for the session or missing applications, KB-PK-06 for the network.

Then confirm in Intune that the new device appears with an APM-PK- name, is compliant, and has checked in.

### Step 8 - Close the ticket
Update the asset register: failed device retired, replacement deployed, site assignment updated. Close the ticket recording the old device name, the new device name, the CompNow reference, and confirmation that the old records were removed from Intune and Entra ID.

## Common Issues
| Issue | Cause and fix |
| --- | --- |
| The replacement will not complete provisioning | Most often a leftover record from a previous enrolment of that same hardware. Confirm step 5 was completed for any device that has been enrolled before, then have the site restart it |
| The replacement provisions but stays on an ordinary Windows desktop | Follow KB-PK-02. Check the device name starts with APM-PK- first, because a device outside that naming pattern receives no configuration at all |
| The replacement works but some applications are missing | The session was built before the applications finished installing. Follow KB-PK-02 step 4 |
| The site says the new device asks for a password | It has not taken its configuration. Follow KB-PK-02. Never attempt to supply a password, because none exists |
| A whole site of kiosks appears faulty | This is a network fault, not a hardware fault. Follow KB-PK-06 before raising any replacement |

## Summary
Triage first, and confirm the fault is the device rather than the site network. There is no identity, licence or data to migrate, so replacement is straightforward. Capture the device name and service tag, raise it with CompNow, arrange the return, and make sure the old Intune and Entra records are removed, because a stale record is the usual cause of a replacement failing to provision. The new device builds itself in 20 to 60 minutes with no input from the site, and the ticket closes on the five confirmation checks.

**Related articles:** KB-PK-01 support overview, KB-PK-02 restricted session, KB-PK-05 date and time, KB-PK-06 offline or no network

---

**ServiceNow submission fields**

| Field | Value |
| --- | --- |
| Knowledge Base | IT Internal Knowledge Base |
| Category | Standard |
| Ownership Group | Your ServiceNow team |
| Short Description | Known Issue - Replace a Faulty Participant Kiosk |
| Meta Tags | participant,kiosk,pk,replace,replacement,faulty,broken,hardware,rma,compnow,swap,new,device,provisioning,autopilot,retire,asset |
