# Known Issue - Kiosk Is Offline or Not Connecting to the Network

## Purpose
To triage a Participant Kiosk that cannot reach the internet or has stopped checking in to Intune, and to route it to the right escalation.

A kiosk that is offline is also a kiosk that cannot repair itself. Every other fault on this fleet is fixed by a daily remediation that needs a network connection, so this article is often the real first step for a ticket that presents as something else.

## Scenario

| Report | Path |
| --- | --- |
| No website loads on the kiosk | Go to the resolution steps |
| The kiosk has not appeared in Intune for days | Go to the resolution steps |
| Websites are slow or load partly | Go to the resolution steps |
| One specific website will not load and others work | This is filtering, not connectivity. Follow KB-PK-04 |
| The kiosk shows an ordinary Windows desktop | Follow KB-PK-02 first. An unconfigured device also has no network profile |
| Every kiosk at the site is offline, and staff devices are affected too | Site outage. Raise with APM Network Management immediately and do not work through the device steps |

## Key Facts
| Fact | Consequence for support |
| --- | --- |
| Kiosks use their own hidden wireless network, not the staff wireless network | A kiosk cannot be connected to the staff network as a workaround, and site staff will not see the kiosk network in their own list of available networks |
| Kiosks connect using a certificate, not a password | There is no wireless password to give the site, and none should be requested |
| The kiosk network denies everything by default | Only a specific list of destinations is reachable. This is why a kiosk can reach the internet and still not reach a particular service |
| Kiosks are wireless | A network cable is not a diagnostic step or a workaround on this fleet |

## Fix / Resolution Steps

### Step 1 - Establish the scope
This determines everything that follows, so establish it before any device work.

| Scope | Meaning and action |
| --- | --- |
| One kiosk at a site, others fine | Device fault. Continue to step 2 |
| All kiosks at a site, staff devices fine | Site kiosk network fault. Go straight to step 5 and escalate to APM Network Management |
| All devices at a site, including staff | Site outage. Raise with APM Network Management under the normal site outage process. This article does not apply |
| Kiosks at several sites | Escalate to APM Network Management and Digital Operations together, and state it is multi-site |

### Step 2 - Confirm what Intune knows
Open the Intune admin centre, find the device by its APM-PK- name, and check the last check-in time.

| Finding | Meaning |
| --- | --- |
| Last check-in is recent | The device is reaching the management service, so the fault is narrower than a total loss of connectivity. Note this, it is useful evidence |
| Last check-in is days old | The device has been off, or off the network, since then. Continue |
| The device is not in Intune at all | It was never enrolled, or its record was removed. Escalate to Digital Operations, not Network Management |

Record the last check-in time in the ticket in every case.

### Step 3 - Confirm the basics at the site
Ask site staff to confirm, in this order.

| Check | Note |
| --- | --- |
| The device is powered on and awake | No power management profile is assigned to this fleet, so a device can be asleep and look dead. Ask them to press a key |
| The device has been restarted | A restart re-establishes the wireless connection and re-runs the profile |
| Nothing has changed physically at the site | A moved device, a new wall, or a relocated wireless access point can put a kiosk out of range |
| Other kiosks at the same site still work | Confirms the scope from step 1 |

### Step 4 - Restart and allow one check-in cycle
Ask the site to shut the device down fully and power it back on, then wait. Allow up to an hour before deciding it has not worked, then re-check the last check-in time in Intune.

| Outcome | Action |
| --- | --- |
| Check-in time updates | Resolved. Leave the ticket open for a day if the original fault was intermittent |
| No change | Go to step 5 |

Do not attempt to reconnect the device to a network by hand, and do not connect it to the staff wireless network. The kiosk network profile and certificate are delivered by policy, and a manual connection is both unsupported and reverted.

### Step 5 - Escalate
Route by the scope established at step 1.

| Scope | Escalate to |
| --- | --- |
| One device | Digital Operations |
| All kiosks at a site | APM Network Management, with Digital Operations informed |
| New site, or a site that has never worked | APM Network Management. A new site needs its kiosk network built and verified before devices will work at all |

Include the following.

| Item | Where to get it |
| --- | --- |
| Device name or names, APM-PK-[SERVICE TAG] | Intune, or the device asset label |
| Site | Ticket |
| Scope, in the words of step 1 | Step 1 |
| Last check-in time for each device | Intune device record |
| Compliance state | Intune device record |
| Whether a restart was attempted and what happened | Step 4 |
| Whether the clock is also wrong | Site staff. A badly wrong clock breaks secure connections and can cause this, so say so. See KB-PK-05 |
| Whether the device shows the correct restricted session | Site staff. If not, KB-PK-02 is the primary fault |

## Common Causes
Background only. None is a Service Desk action.

| Cause | Note |
| --- | --- |
| The device certificate is missing or not valid | The kiosk joins the wireless network with a certificate. Without it the device cannot connect at all, and there is no password fallback |
| The site kiosk network is not built or not enabled | Applies to new sites. The kiosk network is separate from the staff network and is built per site |
| A site firewall change removed a required rule | The kiosk network denies everything except a specific destination list. A routine tidy-up at a site can remove a rule the fleet depends on |
| The device clock is far out | Secure connections fail, which presents as no internet access. See KB-PK-05 |
| The device is out of wireless range | Common after a device or an access point has been moved |

## Summary
Establish the scope first, because one device, one site and several sites go to different teams. Confirm the last check-in time in Intune and record it. Have the site confirm the device is awake and restart it, then allow an hour. Escalate to Digital Operations for a single device and to APM Network Management for a whole site, always including the last check-in time and whether the clock and the restricted session are also affected. There is no wireless password for this fleet and the staff network is never a workaround.

**Related articles:** KB-PK-01 support overview, KB-PK-02 restricted session, KB-PK-04 website blocked, KB-PK-05 date and time, KB-PK-07 replace a faulty kiosk

---

**ServiceNow submission fields**

| Field | Value |
| --- | --- |
| Knowledge Base | IT Internal Knowledge Base |
| Category | Standard |
| Ownership Group | Your ServiceNow team |
| Short Description | Known Issue - Kiosk Is Offline or Not Connecting to the Network |
| Meta Tags | participant,kiosk,pk,offline,network,wifi,wireless,no,internet,not,checking,in,intune,connection,certificate,eap,site,outage,vlan |
