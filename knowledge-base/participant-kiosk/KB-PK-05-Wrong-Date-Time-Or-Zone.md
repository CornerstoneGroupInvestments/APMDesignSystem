# Known Issue - Wrong Date, Time or Time Zone on a Kiosk

## Purpose
To triage a Participant Kiosk showing the wrong date, time or time zone, and to escalate it with the information Digital Operations needs.

This looks cosmetic and is not. A wrong clock puts a wrong date on every document a participant saves, and a clock far enough out breaks secure connections, which presents as a device that can suddenly reach nothing at all.

## Scenario

| Report | Likely cause |
| --- | --- |
| The clock is showing the wrong time zone, for example eastern time at a Perth or Adelaide site | The device has not resolved its location. Most common report |
| The clock is a few minutes or hours out | Time synchronisation is not completing |
| The date is wildly wrong, for example a past year | Flat CMOS battery, or the device has been switched off for a long period |
| Documents the participant saves carry the wrong date | Same fault. Confirm the clock, then treat as above |
| The kiosk suddenly cannot reach any website, and the clock is also wrong | The clock is the cause. Secure connections fail when the clock is far out. Treat as urgent |

A device at a Perth or Adelaide site showing eastern time has almost certainly fallen back to its default zone because location did not resolve. That is the single most common presentation.

## Before You Start
Do not set the clock or time zone by hand on the device. Both are re-asserted by Intune remediation on a daily cycle, so a manual change is reverted within 24 hours and the underlying fault is hidden from reporting.

There is no user-facing setting for site staff to change, and none should be suggested to them.

## Fix / Resolution Steps

### Step 1 - Record what is actually displayed
Ask site staff for all three, ideally from a photo of the clock and the Windows date and time panel.

| Item | Why it matters |
| --- | --- |
| The time zone name shown | Distinguishes a zone fault from a clock fault |
| The time shown | A correct time in the wrong zone is a different fault from a wrong time |
| The date shown | A wrong date points to a hardware or long-power-off cause |

The two faults are separate and are fixed by different things, so do not merge them in the ticket.

### Step 2 - Confirm the device is checking in
In the Intune admin centre, open the device record and check the last check-in time. A device that has not checked in cannot repair its clock, and connectivity is the fault to pursue instead. Follow KB-PK-06.

Note that a badly wrong clock can itself stop a device checking in. If both are true, say so in the escalation, because it changes the order Digital Operations works in.

### Step 3 - Ask the site to restart the kiosk, then allow 24 hours
A restart re-triggers location resolution and time synchronisation. The remediation that corrects both runs daily, so a device that has drifted usually repairs itself within a day.

Restart the device, leave the ticket open, and check the following day.

| Outcome | Action |
| --- | --- |
| Clock and zone correct the next day | Resolved. Note that it self-healed |
| Still wrong after a restart and a full day | Go to step 4 |
| Date is wildly wrong and returns after every restart | Likely a flat CMOS battery. This is a hardware fault. Follow KB-PK-07 |

### Step 4 - Escalate to Digital Operations
Include the following.

| Item | Where to get it |
| --- | --- |
| Device name, APM-PK-[SERVICE TAG] | Intune, or the device asset label |
| Site, including the state it is in | Site record. The state is what determines the correct zone |
| Zone, time and date as displayed | Step 1 |
| Whether other kiosks at the same site are also wrong | Site staff. One device is a device fault, all devices is a site network fault |
| Last check-in time | Intune device record |
| Result of the time and time zone remediation | Intune, Devices, Scripts and remediations. The detection reports COMPLIANT or NOT COMPLIANT, and also reports the resolved zone and the current time source for the device |
| Whether the device also cannot reach websites | Site staff |

If every kiosk at a site is wrong in the same way, say so prominently. That points to the site network rather than the devices, and Digital Operations will involve APM Network Management.

## Why This Happens
Background only. None of these is a Service Desk action.

| Cause | Note |
| --- | --- |
| The device cannot reach the location service | The time zone is derived from network location. If that service is unreachable from the site, the device stays on its fallback zone, which is eastern time. Common cause of a whole site being wrong |
| Time traffic is blocked at the site | Time synchronisation uses a protocol that does not travel through the web proxy, so it needs its own firewall rule. That rule is the one most often lost in a site firewall tidy-up |
| The device has been off for a long period | A device switched off for weeks can come back far enough out that it will not accept a correction. This case is handled in the configuration, but a device that has never checked in since will not have received it |
| Flat CMOS battery | Hardware. The clock resets at every power off. Replace the device per KB-PK-07 |
| A stale cached location | The device can hold an old location fix and stay on the wrong zone. Digital Operations clears it |

## Summary
Record the zone, time and date exactly as displayed, and treat a wrong zone and a wrong time as two separate faults. Confirm the device is checking in, ask for a restart, and allow 24 hours for the daily remediation to repair it. Escalate to Digital Operations with the time and time zone remediation result, and flag clearly whether one device or the whole site is affected, because those have different causes. A wildly wrong date that returns after every restart is a flat battery and needs a replacement device. Never set the clock by hand.

**Related articles:** KB-PK-01 support overview, KB-PK-06 offline or no network, KB-PK-07 replace a faulty kiosk

---

**ServiceNow submission fields**

| Field | Value |
| --- | --- |
| Knowledge Base | IT Internal Knowledge Base |
| Category | Standard |
| Ownership Group | Your ServiceNow team |
| Short Description | Known Issue - Wrong Date, Time or Time Zone on a Kiosk |
| Meta Tags | participant,kiosk,pk,time,date,clock,zone,timezone,wrong,ntp,location,perth,adelaide,eastern,cmos,battery,certificate,error |
