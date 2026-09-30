# Known Issue - Kiosk Restart and Inactivity Behaviour

## Purpose
To handle tickets about a kiosk restarting, and tickets about a kiosk failing to restart or failing to clear between participants. Both directions are the same mechanism and are covered here.

Most tickets in this class are the device working as designed. The value of this article is closing them correctly and quickly, and recognising the two versions that are genuine faults.

## Scenario

| Report | Verdict |
| --- | --- |
| "The kiosk restarted while the participant was using it" | Almost always by design. The device restarts after 10 minutes with no keyboard or mouse input. Reading on screen without touching anything counts as inactivity |
| "The kiosk restarts every night" | By design. Updates install and the device restarts at 03:00 local time |
| "The kiosk lost the participant's work" | By design and not recoverable. See the section below |
| "The kiosk does not restart any more, and the previous participant's files are still there" | Genuine fault. Go to the resolution steps |
| "The kiosk screen goes blank or it seems to be asleep" | Known constraint, not the restart mechanism. See the section below |
| "The kiosk restarts constantly, in a loop" | Genuine fault. Escalate at step 4 |

## How the Restart Works
Three things happen in sequence, and the sequence explains most reports.

| Step | Timing |
| --- | --- |
| The participant stops using the device | Ten-minute countdown starts on the last keyboard or mouse input |
| Windows locks the screen | At 10 minutes |
| The device restarts | Immediately on the lock |

Participant data is destroyed at four separate points: shutdown, startup, logon and logoff. Four passes means no single failure leaves a participant's files for the next person.

## Lost Work Is Not Recoverable
When a ticket says the participant lost a document, there is nothing to recover. The files are deleted, not moved to a Recycle Bin, and no backup of any kind exists on this fleet.

The wallpaper tells the participant: "Don't save files to the desktop. They'll be deleted after 10 minutes of inactivity." The participant has been told. Close the ticket with that explanation and this advice for site staff to pass on.

| Tell the participant | Reason |
| --- | --- |
| Email the document to yourself as you go, using personal webmail | Webmail is allowed on the kiosk and is the intended transfer path |
| Or save it to a USB drive | USB drives are allowed, including personal unencrypted drives |
| Or save it to your own cloud storage, such as Google Drive or iCloud | Named on the wallpaper. Not confirmed as reachable from every site. If it does not open, use webmail or a USB drive (KB-PK-04) |
| Do not leave the kiosk unattended with unsaved work | Ten minutes of no input ends the session |

If a site reports this repeatedly, raise it with the site manager as a participant briefing matter rather than an IT fault.

## Fix / Resolution Steps
Use these only for the two genuine faults: a device that no longer restarts and is not clearing between participants, or a device restarting in a loop.

### Step 1 - Confirm what is actually happening
Ask site staff to leave the device untouched for 15 minutes and report what happens. Distinguish the three outcomes.

| Outcome | Meaning |
| --- | --- |
| Screen locks at 10 minutes and the device restarts | Working. Investigate the original report again |
| Screen locks but the device does not restart | The restart trigger is not firing. Go to step 2 |
| Screen never locks | The inactivity settings are not applied. Go to step 2 |

### Step 2 - Confirm the device is checking in
In the Intune admin centre, open the device record and check the last check-in time and compliance state. A device that has not checked in for more than 24 hours cannot receive or repair its configuration. Treat that as a connectivity fault and follow KB-PK-06.

### Step 3 - Ask the site to restart the kiosk, then allow 24 hours
A restart re-runs the cleanup passes immediately, which addresses the data still being present. The configuration itself is re-asserted by remediation on a daily cycle, so a device that has drifted usually repairs itself within 24 hours without any intervention.

Tell the site to restart the device, then leave the ticket open and check the following day.

| Outcome | Action |
| --- | --- |
| Inactivity restart is working the next day | Resolved. Note in the ticket that it self-healed |
| Still not restarting after 24 hours and a check-in | Go to step 4 |

Do not change any setting on the device by hand. Every value in this mechanism is re-asserted daily, so a hand fix is reverted and the underlying fault is masked.

### Step 4 - Escalate to Digital Operations
Escalate if the fault persists after a restart and a full day, or immediately if the device is restarting in a loop. A looping device is unusable and should be taken out of service at the site until it is resolved.

Include the following.

| Item | Where to get it |
| --- | --- |
| Device name, APM-PK-[SERVICE TAG] | Intune, or the device asset label |
| Which of the step 1 outcomes was observed | Site staff, after the 15-minute test |
| Last check-in time and compliance state | Intune device record |
| Result of the idle restart remediation | Intune, Devices, Scripts and remediations. The detection writes a single line starting PKIDLE, and a drift line names the exact item |
| Result of the session cleanup remediation | Same location. The detection line starts PKCLEAN |
| Whether participant files were still present, and where | Site staff |

State in the ticket if participant data from a previous session was found on the device. That is a privacy matter as well as a fault, and it changes how Digital Operations prioritises it.

## Device Appears Asleep
A separate issue that presents similarly. No power management profile is assigned to this fleet, so although the display is set never to blank, sleep is not controlled. This is a recorded open item.

Ask site staff to move the mouse or press a key. If the device wakes, it is this constraint and not a fault. Note the device and site in the ticket and close it, because the accumulating record supports the case for adding a power profile. If the device does not wake, follow KB-PK-02.

## Summary
The device restarts after 10 minutes of no input and again nightly at 03:00, and it destroys participant data at four points in every session. That behaviour is correct and most tickets in this class close on the explanation. Lost work is never recoverable, and the advice to participants is to use webmail or a USB drive as they go. Only two things are faults: a device that no longer restarts or clear itself, and a device restarting in a loop. For those, confirm check-in, restart, allow 24 hours for self-repair, then escalate with the PKIDLE and PKCLEAN remediation lines.

**Related articles:** KB-PK-01 support overview, KB-PK-02 restricted session, KB-PK-06 offline or no network

---

**ServiceNow submission fields**

| Field | Value |
| --- | --- |
| Knowledge Base | IT Internal Knowledge Base |
| Category | Standard |
| Ownership Group | Your ServiceNow team |
| Short Description | Known Issue - Kiosk Restart and Inactivity Behaviour |
| Meta Tags | participant,kiosk,pk,restart,reboot,idle,inactivity,timeout,10,minutes,lock,screen,lost,files,work,data,cleared,purge,sleep,overnight,03:00,google,drive,icloud,cloud |
