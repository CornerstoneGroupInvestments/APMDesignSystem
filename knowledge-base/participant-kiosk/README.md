# Knowledge base - ES Participant Kiosk Solution

Service Desk knowledge base articles for the ES Participant Kiosk fleet. Written from the **ES Participant Kiosk Solution as-built record V2.4** and the APM Internal KB Article Standard (ServiceNow, KB0011901 v5.0): Verdana, title 24 pt bold, heading 18 pt bold, sub-heading 14 pt bold, body 12 pt; every article opens with Purpose and closes with Summary.

## Articles

| ID | Title | Type | Use when |
| --- | --- | --- | --- |
| KB-PK-01 | Support Overview - ES Participant Kiosk | Application Support | Foundation article. Read before all others |
| KB-PK-02 | Kiosk is not showing the participant session | Known Issue | Ordinary Windows desktop, sign-in screen, or missing applications. Highest priority fault |
| KB-PK-03 | Kiosk restart and inactivity behaviour | Known Issue | Unexpected restarts, no restart, lost participant files, device asleep |
| KB-PK-04 | Website blocked or application will not open | Known Issue | Blocked sites, Application Control, staff unable to reach M365, printing and saving |
| KB-PK-05 | Wrong date, time or time zone | Known Issue | Wrong clock or zone, wrong dates on saved documents |
| KB-PK-06 | Kiosk is offline or not connecting to the network | Known Issue | No internet, not checking in to Intune, site-wide loss |
| KB-PK-07 | Replace a faulty kiosk | Known Issue | Hardware fault, beyond remote recovery |

## The three facts that shape every article

1. **No participant identity.** No username, password, account or licence. "Cannot log in" is never a credential fault on this fleet.
2. **Data is destroyed continuously.** Four cleanup passes per session, plus a restart after 10 minutes idle. Nothing a participant saves is recoverable.
3. **The fleet repairs itself daily.** Four Intune remediations re-assert the configuration every day, so most faults clear within 24 hours **and any manual fix is undone in the same cycle**. This is why no article tells the Service Desk to change a setting on a device.

## Escalation routing used throughout

| Escalation | Owns |
| --- | --- |
| Digital Operations | Remediation failures, compliance, application installs, single-device faults |
| APM Network Management | Site network, Wi-Fi, egress rules, site-wide faults |
| APM Cyber Security | Application Control, Conditional Access, filtering reviews, Defender alerts |
| Digital Transformation and Architecture | Design or baseline configuration change |

## Files

| Folder | Contents |
| --- | --- |
| `*.md` | The articles, canonical. Edit these |
| `output/*.doc` | One Word file per article, formatted to the KB standard. Regenerable from the markdown |
| `output/KB-PK-Articles.html` | All seven articles on one page, each with a Copy article body button for pasting into the ServiceNow editor |

Articles carry no cover page, document control or disclaimer: the ServiceNow article is the record. The ServiceNow submission fields (Knowledge Base, Ownership Group, Short Description, Meta Tags) sit below a rule at the foot of each article and are not pasted into the body.

## Before publishing to ServiceNow

Per the APM KB standard:
- Knowledge Base: **IT Internal Knowledge Base**; Ownership Group: the correct ServiceNow team
- Short Description must match the article title exactly
- Formatting: Verdana, title 24 pt bold, heading 18 pt bold, sub-heading 14 pt bold, body 12 pt
- Meta tags are supplied at the foot of each article, comma separated
- Only a ServiceNow Knowledge Admin can review and publish. Notify one once saved

## Superseded material

The `KB-JSK-*` articles in `uploads/` describe the **retired** Job Seeker Kiosk credential model: per-device Entra identities, Key Vault, the Credential Proxy, AVD session hosts and lock-screen credentials. None of that exists in the current solution. They must not be published or used for this fleet, and should be retired in ServiceNow if any were published.

## Source documents

| Document | Version | Holds |
| --- | --- | --- |
| ES Participant Kiosk Solution as-built record | V2.4 | Every object, value and console. The source for these articles |
| ES Participant Kiosk Technical Configuration Document | V2.8 | Build specification and script appendices |
| Participant Kiosk Conditional Access as-built record | V1.0 | CA-107 build steps and verification tests |
| CN-PK-01 Participant Kiosk Build Procedure | V1.0 | Build facility procedure |
| APM-PK-02 Participant Kiosk Deployment Guide | V1.0 | APM bench deployment procedure |

## Open items that affect support

These are recorded in section 18 of the as-built record and are reflected in the articles as known constraints, not as faults to investigate.

- **No alert when the restricted session fails to activate.** A kiosk that never enters its session is invisible until someone visits the site (KB-PK-01, KB-PK-02).
- **No power management profile.** A kiosk can sleep and look broken (KB-PK-01, KB-PK-03, KB-PK-06).
- **Google Drive and iCloud not confirmed as reachable.** The wallpaper names them as save locations (as-built open item 19) (KB-PK-01, KB-PK-03, KB-PK-04).
- **Keyboard shortcuts not blocked.** Alt+F4, Alt+Tab and Ctrl+Alt+Del reach the Windows security screen (KB-PK-01).
