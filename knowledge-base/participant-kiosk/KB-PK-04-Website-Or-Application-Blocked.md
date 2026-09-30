# Known Issue - Website Blocked or Application Will Not Open on a Kiosk

## Purpose
To determine whether a blocked website or an application that will not open on a Participant Kiosk is the design working or a fault, and to route the small number of genuine faults correctly.

Most tickets in this class are the design working. Answer the first question below before doing anything else.

## First Question: Is an APM Staff Member Trying to Use the Kiosk?
If the ticket is a staff member reporting they cannot reach Outlook, Teams, SharePoint, the Azure portal or any APM service from a kiosk, that is the control working exactly as intended.

Every APM identity is blocked from signing in on this hardware, at three independent layers. It cannot be exempted for one person, one device or one occasion, and there is no override.

Close the ticket with this explanation.

> Participant Kiosks are participant devices and are deliberately isolated from all APM corporate services. Staff cannot sign in to Microsoft 365 or any APM system from a kiosk. Please use your APM device.

Do not raise a Conditional Access exception request. Escalate to APM Cyber Security only if a staff member actually succeeded in signing in to a corporate service from a kiosk, which is a control failure and is urgent.

## Scenario
Once staff use is ruled out, identify which of these the ticket is.

| Report | Path |
| --- | --- |
| A Microsoft 365 or Azure site will not load for a participant | By design. See the table below and close |
| A participant cannot reach a job search, government or training site | Possible fault. Go to the resolution steps |
| A participant cannot reach personal webmail | Possible fault. Webmail is supposed to work. Go to the resolution steps |
| Edge or LibreOffice will not open, or is missing from Start | Follow KB-PK-02 step 4. Not a filtering issue |
| A message about an administrator blocking the application appears | Application Control. Go to the Application Control section |
| A participant wants a new application installed | Not possible. See the Application Control section |

## What Is Blocked and Allowed by Design

| Disposition | Destinations |
| --- | --- |
| Blocked | The Microsoft 365 and Azure service surface: login.microsoftonline.com, office.com, portal.office.com, admin.microsoft.com, outlook.office.com, teams.microsoft.com, SharePoint, myapps and myaccount, portal.azure.com |
| Allowed | Personal webmail, including outlook.live.com, login.live.com and Gmail. This is the participant document transfer path |
| Allowed | create.microsoft.com, for resume and cover letter templates, with no sign-in required |

Blocked destinations are enforced in three places at once, so a block cannot be lifted for a single device.

## Fix / Resolution Steps
Use these when a participant cannot reach a site that ought to work.

### Step 1 - Get the exact address and the exact message
A ticket saying "the internet does not work" cannot be actioned. Ask the site for the full web address from the address bar, and what appears on screen.

| On-screen message | Meaning |
| --- | --- |
| A block page naming APM or Zscaler | Web filtering. The site is categorised as blocked. Go to step 3 |
| An Edge message that the site is blocked by the administrator | The Edge block list. Go to step 3 |
| A certificate or security warning | Do not advise the participant to continue. Overrides are prevented by design. Go to step 3 |
| The page does not load at all, and nothing else works either | This is connectivity, not filtering. Follow KB-PK-06 |
| The page partly loads or is slow | Likely connectivity. Follow KB-PK-06 |

### Step 2 - Confirm it is not just this device
Ask site staff to try the same address on another kiosk at the same site.

| Result | Meaning |
| --- | --- |
| Blocked on every kiosk | Expected for a filtering block. Go to step 3 |
| Works on another kiosk | Not a filtering issue, because filtering is identical across the fleet. Follow KB-PK-06 for the affected device |

### Step 3 - Raise a filtering review
If a participant needs a site that supports job search, government services, training or webmail, and it is blocked, that is a legitimate request to review.

Raise it with APM Cyber Security as a filtering review request. Include the following.

| Item | Detail |
| --- | --- |
| The full web address | From the address bar, not a search result or a description |
| What the participant was trying to do | Job search, government service, training, webmail, resume |
| The on-screen message | From step 1 |
| Site and device name | APM-PK-[SERVICE TAG] |
| Whether it is blocked on all kiosks at the site | From step 2 |

Set expectations with the site: this is a review, not a same-day change, and a Microsoft 365 or Azure destination will not be approved.

## Application Control
The fleet runs only an approved set of applications: Edge, LibreOffice Writer, Calc and Impress, File Explorer, the accessibility tools, and two support tools. Anything else is blocked from running.

| Request | Response |
| --- | --- |
| Install an application for a participant | Not possible and not a valid request. Close it. Participants use the provided applications or web-based services |
| An approved application stopped opening and shows a block message | Escalate to APM Cyber Security, giving the device name, the application and the exact message. Do not attempt a reinstall |
| An approved application is missing from Start | Not Application Control. Follow KB-PK-02 step 4 |

Administrative access does not help here. The APM-PKAdmin account cannot install software either, because Application Control is enforced for every account on the device.

## Google Drive or iCloud Will Not Open
The wallpaper tells participants to save work to their own cloud storage, such as Google Drive or iCloud. Personal webmail is allowed. Consumer cloud storage is a different web filtering category and is not confirmed as allowed on the kiosk network.

1. Confirm the exact address the participant tried and the message shown.
2. Direct the participant to personal webmail or a USB drive for the current session.
3. Raise a filtering review with APM Cyber Security, quoting the address and the site. Reference the open item on cloud storage access for the Participant Kiosk wallpaper.

## Printing and Saving
| Request | Response |
| --- | --- |
| Print from a kiosk | No print path is configured on this fleet. Not a fault and not a Service Desk action. Refer the site to their own staff printing arrangements |
| Where can a participant save a file | The Downloads folder, a USB drive, or personal webmail. Google Drive and iCloud are named on the wallpaper but are not confirmed as reachable. Desktop, Documents and the C: drive are not reachable, and everything saved locally is deleted at the end of the session |
| Recover a saved file | Not possible. See KB-PK-03 |

## Summary
Staff cannot sign in to APM services from a kiosk, by design, and that ticket closes with an explanation rather than an exception request. Microsoft 365 and Azure destinations are blocked at three layers and cannot be unblocked for one device. Personal webmail is allowed and is the intended way participants move documents. For any other blocked site, get the exact address and message, confirm it is blocked on more than one kiosk, and raise a filtering review with APM Cyber Security. New applications cannot be installed by anyone, including administrators.

**Related articles:** KB-PK-01 support overview, KB-PK-02 restricted session, KB-PK-03 restart and lost files, KB-PK-06 offline or no network

---

**ServiceNow submission fields**

| Field | Value |
| --- | --- |
| Knowledge Base | IT Internal Knowledge Base |
| Category | Standard |
| Ownership Group | Your ServiceNow team |
| Short Description | Known Issue - Website Blocked or Application Will Not Open on a Kiosk |
| Meta Tags | participant,kiosk,pk,blocked,website,url,filtering,zscaler,edge,application,control,wdac,cannot,install,m365,office,teams,outlook,sharepoint,webmail,print,save,google,drive,icloud,cloud,storage |
