# Support Overview - ES Participant Kiosk

## Purpose
To give Service Desk staff what they need to triage and resolve tickets about ES Participant Kiosks, and to make clear which tickets the Service Desk can close and which must be escalated.

Read this article before any other KB-PK article. The others assume it.

## What Is This?
A Participant Kiosk is a Dell desktop running Windows 11 Enterprise, placed in an APM site for participants to use. It is locked into a restricted session showing a fixed set of applications: Microsoft Edge, LibreOffice Writer, Calc and Impress, File Explorer, and the Windows accessibility tools.

Three things about this fleet are different from every other APM device, and nearly every ticket turns on one of them.

| Fact | What it means for support |
| --- | --- |
| There is no participant identity | No username, no password, no account to reset, no licence. The device signs itself in automatically at boot. "The participant cannot log in" is never a credential problem on this fleet |
| The device destroys its own data constantly | Participant files are deleted at every session boundary, and the device restarts itself after 10 minutes of inactivity. Nothing a participant saves is recoverable, ever |
| The device repairs itself daily | Four Intune remediations re-assert the whole configuration every day. Most faults clear on their own within 24 hours, and any manual fix applied by hand is undone at the next check-in |

## Who Uses It?
Participants attending APM Employment Services sites use the kiosks. Site staff supervise them but do not administer them. There is no sign-in, so any participant can walk up and use a kiosk.

## What Is It Used For?
Job search, resume and cover letter preparation, government services such as myGov and Workforce Australia, and personal webmail. Participants transfer their own documents in and out using personal webmail or a USB drive. Corporate APM services are deliberately unreachable.

## How a Session Works
The device powers on, signs itself into a local Windows account named Kiosk-[SERIAL], and opens the restricted session. There is no sign-in screen and no password prompt at any point.

| Stage | What happens |
| --- | --- |
| Power on | Automatic logon signs in the local session account. Cleanup runs at startup and again at logon, before the participant can touch anything |
| In use | The participant uses Edge and LibreOffice. Files save to the Downloads folder. Desktop, Documents and the C: drive are not reachable |
| 10 minutes idle | Windows locks the screen. The lock triggers a restart |
| Restart | Cleanup runs at shutdown and again at the next startup and logon. The next participant gets a clean device |

The wallpaper tells the participant: "Don't save files to the desktop. They'll be deleted after 10 minutes of inactivity." It also tells them to save work to their own cloud storage, such as Google Drive or iCloud, or to a USB drive. The retention statement is accurate, and it is the reason a "my file is gone" ticket has no recovery path.

## What the Device Is Named
Two different names, and confusing them wastes time on a ticket.

| Name | Format | Where you see it |
| --- | --- | --- |
| Device name | APM-PK-[SERVICE TAG], 13 characters | Intune, Entra, asset register. This is the name to search on |
| Session account | Kiosk-[SERIAL], a local account | Only on the device itself. It is not in Entra and cannot be searched for centrally |

A device whose name does not start with APM-PK- receives no configuration at all. If a device is misbehaving in every respect at once, check the name first.

## Access
There is nothing for a participant or a staff member to request. Participants need no account. Site staff need no account. No access request is ever valid for this fleet, and a request to "add a user to the kiosk" should be rejected and closed with an explanation.

Administrative access is by the local account APM-PKAdmin, whose password is held in Entra ID and rotates every 30 days. It is retrieved from the device record in the Entra admin centre, is restricted to the named support group, and every retrieval is logged and reviewed monthly. It cannot install software, because Application Control is enforced.

## Deployment
Devices are prepared by the build partner CompNow, shipped to site, and provisioned automatically by Autopilot when first powered on at the site. Enrolment takes 20 to 60 minutes and requires no action from anyone at the site beyond powering the device on and connecting it.

The Service Desk does not build, image or enrol these devices. Requests for a new or replacement kiosk follow KB-PK-07.

## What Is Deliberately Blocked
Tickets are raised about all of these. None is a fault.

| Blocked | Why |
| --- | --- |
| All Microsoft 365 and Azure services, including Outlook, Teams, SharePoint and the Azure portal | Blocked at three independent layers. No APM staff member can sign in to corporate services from a kiosk, by design |
| Any APM staff sign-in at all | Conditional Access policy CA-107 blocks every APM identity from this hardware. This is the control working, not a fault |
| Desktop, Documents and the C: drive | File Explorer is scoped to Downloads and removable drives only |
| Installing anything | Application Control is enforced. Only the approved application set runs |
| Printing | No print path is configured on this fleet |

## What Is Deliberately Allowed
| Allowed | Why |
| --- | --- |
| Personal webmail, including outlook.live.com and Gmail | This is the participant's document transfer path, in and out |
| USB drives, including unencrypted personal drives | Participants bring their own documents. The device holds no corporate data |
| create.microsoft.com | Resume and cover letter templates, no sign-in required |

## Service Desk Scope
The Service Desk owns triage, the checks in the KB-PK articles, and the site-level actions below. It does not own any configuration change to this fleet.

| Service Desk can | Service Desk must not |
| --- | --- |
| Confirm the device in Intune: name, compliance, last check-in, remediation results | Change any Intune profile, policy, remediation or application |
| Ask site staff to restart a kiosk, and confirm the fault clears | Fix a setting by hand on a device. Every asserted value reverts within 24 hours, so a hand fix hides the fault rather than resolving it |
| Trigger a remediation to run on demand from Intune where the role permits it | Retrieve the LAPS password unless in the named support group and the ticket justifies it |
| Raise a replacement per KB-PK-07 | Promise recovery of any participant file. There is none |

## Escalation Path for Support

| Tier | Scope |
| --- | --- |
| Service Desk | Triage using the KB-PK articles. Restart, confirm device state in Intune, confirm the fault is not by design, raise replacements |
| Digital Operations (first escalation) | Remediation failures and repeated drift, compliance and profile assignment failures, Autopatch, Intune application installs, the Assigned Access failure in KB-PK-02 |
| APM Network Management | Site network, Wi-Fi, VLAN 73, egress rules and anything in KB-PK-06 that is not a single device |
| APM Cyber Security | Application Control blocks, Conditional Access, Defender alerts, suspected compromise |
| Digital Transformation and Architecture (second escalation) | Any change to the design or to the configuration baseline |

## Known Issues
These are recorded constraints in the as-built record. Recognise them so they are not investigated as new faults.

### A kiosk that never enters its restricted session is not alerted
No alert is raised when the restricted session fails to activate. The daily remediation reports it one check-in later, but until then the only way it is noticed is someone at the site seeing it. Treat any site report of a kiosk showing an ordinary Windows desktop as urgent, and follow KB-PK-02.

### A kiosk may go to sleep
No power management profile is assigned. The display is set never to blank, but sleep and hard disk timeouts are not controlled. A sleeping kiosk looks broken to a participant standing at it. Ask site staff to move the mouse or press a key before treating it as a fault.

### The keyboard is not fully locked
Alt+F4, Alt+Tab, Alt+Shift+Tab and Ctrl+Alt+Del are not blocked in the restricted session. A participant can reach the Windows security screen. This does not give access to files or applications, and the device is restored at the next restart.

### Google Drive and iCloud may not open
The wallpaper names Google Drive and iCloud as places to save work. Personal webmail is allowed on the kiosk network. Consumer cloud storage is a different web filtering category and is not confirmed as allowed. If a participant cannot reach either service, direct them to personal webmail or a USB drive and follow KB-PK-04.

### A kiosk shows Not ready in Windows Autopatch
Kiosks are patched by their own Autopatch group, Kiosk-Autopatch, and are excluded from the estate Autopatch group. A kiosk that appears in both reports Not ready and is not patched. Escalate to Digital Operations with the device name.

### Manual changes disappear
Anything corrected by hand on a device is re-asserted to its configured value within 24 hours. This is intended. If a fault returns a day after being fixed by hand, that is the system working, and the fault needs a configuration change rather than a repeat manual fix.

## Summary
There is no participant identity, so there is no sign-in problem to solve. Participant data is unrecoverable by design. Most faults self-heal within 24 hours because four remediations re-assert the configuration daily, and any hand fix is undone in the same way. The Service Desk triages, restarts, confirms device state in Intune, and escalates configuration matters to Digital Operations. A kiosk showing an ordinary Windows desktop instead of the restricted session is the one fault to treat as urgent.

**Related articles:** KB-PK-02 restricted session, KB-PK-03 restart behaviour, KB-PK-04 website or application blocked, KB-PK-05 date and time, KB-PK-06 offline or no network, KB-PK-07 replace a faulty kiosk

---

**ServiceNow submission fields**

| Field | Value |
| --- | --- |
| Knowledge Base | IT Internal Knowledge Base |
| Category | Standard |
| Ownership Group | Your ServiceNow team |
| Short Description | Support Overview - ES Participant Kiosk |
| Meta Tags | participant,kiosk,pk,es,employment,services,overview,support,apm-pk,restricted,session,assigned,access,libreoffice,edge,no,identity,autologon,autopatch,not,ready,google,drive,icloud |
