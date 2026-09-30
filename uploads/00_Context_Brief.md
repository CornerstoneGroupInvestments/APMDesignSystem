# APM Digital Workplace — AVD Program: Context Brief (Export Part 1)

**Audience:** a reader with zero prior context and no access to the originating workspace.
**Delivery party:** Twiki Corp ("the project team"). Individuals are referred to by role only. Third-party delivery suppliers are referred to by function (the Device Build Partner, the managed network service provider, the licensing reseller). Technology product vendors are named where they are part of the architecture (Microsoft, Nerdio, Zscaler, Dell, Palo Alto, Cisco Meraki).
**Client:** APM (Advanced Personnel Management), an Australian employment-services provider delivering Workforce Australia services under contract to the Department of Employment and Workplace Relations (DEWR).
**Status of this brief:** current as at 23 June 2026.

---

## 1. Project overview

### What is being delivered
APM is standardising its end-user computing onto **Azure Virtual Desktop (AVD)**, orchestrated through **Nerdio Manager for Enterprise**, managed by **Microsoft Intune** and **Microsoft Entra ID**. The program delivers a set of standardised, image-based computing environments ("Standard Operating Environments", SOEs) and device patterns, each tuned to a different user population, all sharing one reusable Azure platform and one management plane.

The engagement was originally scoped as **four SOEs**. It has since expanded to **five AVD use cases** with the addition of a dedicated Privileged Access image. A foundation **network workstream** underpins all of them and is on the critical path.

### Purpose and business drivers
- **Replace an ageing, unmanageable device fleet.** The current job-seeker devices are old, slow, and not centrally manageable.
- **Consistent data privacy across all sites**, particularly for job-seeker personally identifiable information (PII).
- **Standardised device management at scale** via Intune and Nerdio rather than per-site manual builds.
- **Compliance** with the **Right Fit For Risk (RFFR)** accreditation framework administered by DEWR (based on ISO 27001 and the ASD Information Security Manual), required under the Workforce Australia Service Deed.
- **Lower total cost of endpoint ownership** by moving from hardware-bound desktops to pooled, auto-scaled cloud sessions, and enabling bring-your-own-device (BYOD) access without holding data on the endpoint.
- **Cloud-native, modern management only** (Entra join + Intune; no Active Directory Domain Services, no Group Policy, no on-premises management plane).

### Current state vs target state
- **Current state:** mixed/ageing physical devices; a mature Intune-managed Windows 11 laptop SOE for staff; a legacy developer "Platform Development Environment" (PDE) with serious usability faults (long cold-start, unstable write access, tooling lockout); job-seeker shared devices on an existing site network.
- **Target state:** a hub-and-spoke Azure platform hosting AVD session hosts; thin clients and BYOD endpoints connecting via the Microsoft Windows App; ephemeral or persistent profiles depending on use case; a single Intune policy stack and Conditional Access model; one reusable network and image pattern repeated per use case and per region.

### Commercial frame
The project team is contracted to complete the program by **30 September 2026**. The network build started **23 June 2026** with a target of **26 June 2026**. The original "everything in place" date of 30 June 2026 was missed, attributed to a lack of internal network skills. Resourcing is the binding constraint: a single build engineer on the delivery side, supported by an architecture lead and a project manager.

---

## 2. The AVD use cases / SOEs

Five use cases sit on top of the shared platform, plus the foundation network. They are listed in the current build order.

### 2.0 Network foundation (enabler, not an SOE)
The reusable platform. Two distinct layers that are often both called "the network":
- **Site network (job-seeker sites):** the existing Job Seeker VLAN repurposed and renamed **APM-KIOSK** (VLAN 73), hidden SSID with a pre-shared key pushed by Intune, Cisco Meraki per-site addressing, Palo Alto east-west firewalls, and a Zscaler IPSEC tunnel for web filtering.
- **Azure network pattern:** a hub-and-spoke virtual network (DNS Private Resolver, NAT Gateway, NSGs, private endpoints) that the AVD use cases reuse. This Azure pattern, not the site SSID, is what the Standard User, Developer and Privileged use cases build on.

### 2.1 Job Seeker Kiosk (priority 1; design approved, at CAB)
- **For:** walk-in job seekers at APM sites nationally.
- **Device:** Dell thin client running **Windows 11 IoT Enterprise** in kiosk mode (Shell Launcher replaces Explorer with the Windows App). Connects over Wi-Fi to an AVD session.
- **Experience:** every session is **ephemeral**. The session host is reimaged from a golden image after each use; the user works in a locked-down AVD desktop limited to **Edge, Word, Excel, PowerPoint** (Office via web only). 10-minute inactivity timeout; disconnect-on-lock; profile cleanup.
- **Identity:** a **per-device unique credential model**. Each device has its own Microsoft 365 **F3** account named `Kiosk-[SERIAL]@apm.net.au`, created by an Azure Automation Runbook, password stored per-device in Azure Key Vault, rotated by runbook, displayed on a per-device lock screen.
- **Key constraints:** RFFR PII protection; USB storage permitted for resume transfer (BitLocker-to-Go cannot be enforced because client-owned USB media must remain readable on client computers); no direct printing (documents emailed to a case worker via webmail); web filtering blocks adult/gambling/explicit/violence/illegal and TikTok/Instagram/X, allows Facebook and public AI tools.
- **Scale:** the design references **~517–540 devices** (an inconsistency to reconcile).

### 2.2 Standard User SOE (priority 2; draft design V0.1)
- **For:** general APM staff (case workers, admin, managers).
- **Model:** "one SOE, two delivery channels" — staff use either their physical corporate laptop SOE or the **same SOE delivered as an AVD session** reached via the Windows App, from a corporate device or a personal one. The choice is per session.
- **Session host:** **Windows 11 Enterprise multi-session**, pooled, breadth-first, managed by Nerdio. Profiles persist via **FSLogix** containers on **Azure Files Premium** with **Entra Kerberos** authentication.
- **Policy:** reuses the **14 existing laptop-SOE Intune policies** scoped to a new AVD device group, plus AVD-specific profiles (FSLogix, session limits, RDP redirection).
- **Security perimeter for BYOD:** identity and the AVD session boundary. Conditional Access blocks unmanaged devices from all M365 resources except the Windows App into AVD. Two application groups (corporate vs BYOD) differ only in RDP redirection (clipboard/drive/USB disabled for BYOD).
- **Downstream:** once live, the project manager runs a program to retrieve and replace physical staff laptops with AVD.
- **Open items:** printing (most likely Universal Print) and the mapped network drive backend are deferred design decisions that gate build.

### 2.3 ES (Employment Services take-home device; priority 3; formerly "CTA")
- **For:** Employment Services field/training use where the device leaves the site with an individual.
- **Basis:** the Job Seeker kiosk pattern, with two material differences:
  1. **Midnight daily reset** in addition to the 10-minute inactivity behaviour.
  2. **Take-home use:** the device must join arbitrary Wi-Fi networks off-site.
- **Why it is a redesign, not a config change:** take-home use removes the three controls the Job Seeker design depends on — the site VLAN isolation, the hidden SSID/pre-shared key, and site-based Zscaler/Palo Alto inspection. The ES design must therefore move web filtering to a **Zscaler client on the device**, revise Conditional Access so it is device-bound without the site network, and handle any-Wi-Fi connectivity.
- **Extra content:** a separate "Eskilled" training-portal bookmark folder.

### 2.4 Privileged Access image (priority 4; new use case)
- **For:** privileged administrative access to **production systems**, at **two tiers** — **Priv** (account prefix `zz`) and **High-Priv** (account prefix `xy`).
- **Model:** a hardened, **Privileged Access Workstation (PAW)-style** AVD image with **no mail, Teams, or browsing**. It is the only path to production access in the program.
- **Authentication:** **YubiKey 5C NFC FIPS** as phishing-resistant MFA. The YubiKey test and validation milestone live in this workstream and gate any production cutover. Just-in-time elevation via Privileged Identity Management (PIM) per tier, with approval and audit.
- **Authority:** the APM CTO/CISO signs off the privileged model.

### 2.5 Developer SOE (priority 5; draft design V0.1; now last)
- **For:** APM developers, replacing the legacy PDE.
- **Model:** a **separate, permissive developer image** where developers can work with **limited blocks**. It has **no production-access path** — production access is provided only by the Privileged Access image (2.4). The YubiKey requirement therefore does not sit on the Developer SOE.
- **Platform:** AVD pooled multi-session on the D-series (nested virtualisation for containers), image built via **Azure Image Builder** with Git-backed template, signing and SBOM; FSLogix on **Premium ZRS** Azure Files; OneDrive Known Folder Move for backup; tooling delivered in three layers (baked image, per-team Intune Win32 app groups, self-service via winget/Company Portal).
- **Capabilities staged in phases:** day-1 core tooling; 30-day (WSL2, Podman, ACR pull-through, winget self-service); 60–90-day (Copilot, MCP frameworks, local LLMs).
- **Timeline reality:** as the last use case with a single build engineer, Developer GA lands in **mid-October 2026, past the 30 September contract end** on current resourcing.

### How they differ (summary)
| Use case | Session model | Persistence | Apps | Endpoint | Distinguishing control |
| --- | --- | --- | --- | --- | --- |
| Job Seeker | Single-session, reimaged each use | None (ephemeral) | Edge + Office web | Dell thin client (kiosk) | Per-device F3 + Key Vault, site VLAN |
| Standard User | Multi-session pooled | FSLogix profile | Full staff SOE | Corporate laptop or BYOD | BYOD Conditional Access boundary |
| ES (take-home) | Single-session, midnight reset | None (ephemeral) | Edge + Office web + Eskilled | Take-home device, any Wi-Fi | Zscaler client on device, revised CA |
| Privileged | Hardened pool, two tiers | Minimal | Admin tools only (no mail/Teams/browse) | Managed endpoint | YubiKey FIPS + PIM per tier |
| Developer | Multi-session pooled (permissive) | FSLogix profile (Premium ZRS) | Full dev toolchain | Managed/permissive | AIB image pipeline; no production path |

---

## 3. Technical architecture

### 3.1 AVD and Nerdio
- **Orchestration:** Nerdio Manager for Enterprise (assumed already deployed in the APM tenant; reused across use cases).
- **Job Seeker host pool:** `HP-APM-Kiosk` — pooled, breadth-first, max session limit 1 (single-session), Start VM on Connect enabled (scale-to-zero off-peak), no printer/drive redirection, FSLogix single-session enforcement (ProfileType = 1).
- **Standard User host pool:** `APM-AVD-HP-StaffPooled-AUE` — pooled, breadth-first, max ~8 sessions/host (D8s_v5, validated in pilot), validation pool `APM-AVD-HP-StaffPooledValidation-AUE`.
- **Developer host pools:** `hp-apm-dev-primary` (pooled multi-session, 8–12 sessions/host to validate) and originally a Pulse personal pool; under the revised scope, production access moves to the Privileged image.
- **Autoscaling (Job Seeker):** business hours 07:00–19:00 minimum = expected concurrent users; ramp-up 06:00–07:00; ramp-down 19:00–20:00; off-peak 20:00–06:00 scale to zero.
- **Autoscaling (Standard User AUE):** scale-out from 06:30, full capacity 08:00, scale-in from 18:00, off-peak minimum ~5% of peak, at least one warm standby in business hours.
- **Session management (Job Seeker):** idle 10 min → disconnect; disconnected 1 min → log off → Nerdio reimage; disconnect-on-lock enabled so locking ends the session.
- **Session management (Standard User):** idle 1 hour → disconnect; disconnected 4 hours → log off and FSLogix unmount.

### 3.2 Golden image strategy
- **Job Seeker session host:** Windows 11 Enterprise base, Edge (hardened), M365 Apps (web only, device-based licensing), Defender, Zscaler IPSEC, custom wallpaper (data-wipe notice), accessibility tools. D2s_v5 (2 vCPU/8 GB), 128 GB Standard SSD. Reimaged after every session; patched monthly via validation pool then promotion.
- **Standard User session host:** Windows 11 Enterprise multi-session 24H2, M365 Apps with shared computer activation, Teams with AVD optimisation, FSLogix agent, Edge, Defender, baseline LOB. Built once per region, versioned in Azure Compute Gallery (`gal-apm-avd-staff`, image `img-apm-avd-staff-w11-ms-24h2`), replicated regionally; D8s_v5 baseline, Trusted Launch (Secure Boot + vTPM), Premium SSD. Monthly image-replacement patching with drain-mode reimaging; no in-place patching.
- **Developer session host:** Windows 11 Enterprise multi-session, built by Azure Image Builder (Git template, SHA256 binary checks, SBOM, signing), two-ring rollout (pilot then GA), weekly reimage, gallery retains the previous two versions for rollback.

### 3.3 Intune and Entra ID
- **Management plane:** Intune for all session hosts and endpoints; Entra ID for identity, device join, Conditional Access, and groups.
- **Job Seeker key profiles:** Office device-based licensing (`APM-AVD-OfficeDeviceLicense`); Assigned Access multi-app kiosk (Word/Excel/PowerPoint/Edge only, everything else blocked); session time limits; disconnect-on-lock; Shell Launcher (`APM-Kiosk-ShellLauncher`, dynamic per-device XML keyed to serial/UPN); Edge hardening (ephemeral profiles, clear-on-exit, no password manager, managed favourites); profile cleanup; hourly password-rotation proactive remediation.
- **Standard User:** the 14 reused laptop-SOE policies (hardened baseline ~434 settings, ACSC Office hardening, RFFR signing controls, Edge baseline, BitLocker — not applicable on multi-session, USB block, etc.) scoped to `APM-AVD-SessionHosts`; plus AVD-specific FSLogix, session limits, RDP redirection, and a multi-session compliance policy `CMP-APM-AVD-SessionHosts`.
- **Naming conventions:** Job Seeker device name `KI-APM-[SITECODE]-[ID]`; kiosk UPN `Kiosk-[serial]@apm.net.au`; Standard User session host `vmavd-stf-aue-NNN`; dynamic device groups filter on name prefix.

### 3.4 Networking
- **Site (Job Seeker / ES):** APM-KIOSK SSID (hidden, pre-shared key via Intune), VLAN 73, supernet `10.73.0.0/16` with a unique /26 per site via Meraki templates, 20 Mbps per site, CAPTCHA removed; default-deny egress, TCP 443 only, FQDN/IP allow-rules for Microsoft/Azure/Zscaler.
- **Azure hub VNet:** `auea-vnet-avd-kiosk-hub-ctrl-001`, Australia East, `10.40.112.0/24` — subnets for DNS Private Resolver inbound/outbound, hub private endpoints (Key Vault, Function App storage), shared-services (Hybrid Runbook Worker), NAT Gateway, reserved GatewaySubnet and AzureFirewallSubnet.
- **Azure spoke VNet:** `auea-vnet-avd-kiosk-spoke-ctrl-001`, `10.40.114.0/23` — session host subnet, spoke private endpoints (Azure Files/FSLogix), management, NAT Gateway. Hub-spoke peering; no spoke-to-spoke.
- **Egress:** NAT Gateway per VNet (Azure is retiring default outbound). NSGs default-deny inbound; explicit outbound allows for AVD service tag, Entra, Azure Monitor, KMS (1688), DNS to hub, FSLogix private endpoint (445); deny-all at priority 4096. Traffic to 169.254.169.254 (IMDS) and 168.63.129.16 (WireServer) must not be intercepted.
- **East-west control:** Palo Alto east-west firewalls restrict the AVD VNet from other Azure resources; permitted to approved internet destinations and Zscaler via IPSEC tunnel; all other east-west blocked by default.
- **Web filtering:** Zscaler Internet Access via IPSEC tunnel (preferred over the Zscaler client connector on the session host where Palo Alto already inspects). The managed network service provider configures the tunnel.
- **DNS:** Azure DNS Private Resolver in the hub (`auea-dnspr-avd-kiosk-001`); private DNS zones for file/vault/blob/table/queue/azurewebsites; kiosk devices use site DNS forwarders to public endpoints.
- **Connectivity model:** kiosk and BYOD endpoints are cloud-native, reaching AVD over the Microsoft-managed reverse-connect transport on the public internet (TCP 443; UDP 3478 RDP Shortpath where available). No site-to-site VPN or ExpressRoute in the initial deployment (GatewaySubnet reserved for future hybrid).

### 3.5 Identity and access
- **Job Seeker:** per-device F3 accounts; 16-character random passwords generated by Azure Automation Runbook on a Hybrid Runbook Worker (so it can reach the Key Vault private endpoint); secrets in Key Vault `auea-kv-apm-kiosk-001` (private endpoint only, 90-day soft delete, purge protection, RBAC); a Credential Proxy Azure Function (VNet-integrated, EasyAuth, primary refresh token, no embedded secrets) lets devices retrieve their password; AutoLogon via LSA; lock screen regenerated by hourly Intune proactive remediation.
- **Conditional Access (Job Seeker):** device-bound (filters on `enrollmentProfileName -eq "APM-Kiosk-SelfDeploying"` and `trustType -eq "AzureAD"`); web-only Office scope; explicit blocks for non-Windows platforms, the AVD web client, Exchange Online and Teams; high-risk sign-in block.
- **Conditional Access (Standard User):** block unmanaged Windows from non-AVD M365; allow Windows App into AVD with MFA; require compliant/hybrid for non-AVD M365 from Windows; corporate-vs-BYOD application group selection driven by compliant-device status.
- **Privileged:** PIM per tier (Priv `zz`, High-Priv `xy`), phishing-resistant **YubiKey 5C NFC FIPS** MFA, short activation windows, approval and audit. This is the only production-access path.
- **Developer (non-prod):** standing Reader plus PIM-eligible Contributor on non-production; deployment via OIDC workload identity federation (no stored secrets); secrets via Key Vault references, Git Credential Manager, gitleaks pre-commit, and GitHub Advanced Security.

### 3.6 Security and compliance (RFFR)
- **Framework:** RFFR (DEWR), based on ISO 27001 and the ASD ISM, managed under APM's existing ISMS. This program supports accreditation but does not constitute the ISMS.
- **Job Seeker controls:** zero data persistence (ephemeral profile + Nerdio reimage + profile cleanup), device-based Conditional Access, Defender for Endpoint, Zscaler filtering and logging (to Microsoft Sentinel, ~180-day retention), data-wipe notice, network segmentation, monthly patched golden image.
- **Standard User controls:** the full laptop-SOE hardening baseline preserved on AVD (OS, Office, Edge, Application Control for Business in enforcement, EDR, platform encryption in place of BitLocker on multi-session), BYOD redirection limits, Australia East data residency.
- **Service tiering:** Job Seeker is Tier 3; Standard User and Developer are Tier 2 (99.9% target, 4-hour RTO, 24-hour RPO). Disaster recovery is by image immutability, host-pool elasticity, FSLogix snapshots, and a regional pattern (no cross-region FSLogix replication in V1).

---

## 4. Scope, assumptions, dependencies, risks, decisions

### 4.1 In scope
The five use cases above, the foundation network (site + Azure pattern), the reusable Azure hub-spoke pattern, identity and Conditional Access, image and policy management, the device logistics/retrieval program, and knowledge-base/runbook authoring for every major supportable process.

### 4.2 Out of scope
Outreach Laptop (referenced in the Job Seeker design as a separate future design; parked); RFFR formal accreditation audit (supported, not constituted); printer hardware procurement and placement; site cabling, switch upgrades, Wi-Fi coverage, internet bandwidth upgrades; detailed commercial modelling; a GPU-backed developer pool; region-wide Australia East failure recovery.

### 4.3 Key assumptions
- Nerdio Manager for Enterprise is deployed and operational and is reused across use cases.
- Thin-client hardware ships with TPM 2.0 and supports Autopilot self-deploying mode; hardware hashes registered at procurement.
- Device-based M365 Apps and Windows VDA per-device licensing procured (via the licensing reseller) for the kiosk fleet.
- The existing Conditional Access framework, dynamic-group patterns and the 14 laptop-SOE Intune policies are authoritative and reused.
- Personal devices are unmanaged and reach APM data only through the Windows App into AVD.
- Microsoft Sentinel (or an existing SIEM via connector) accepts the platform Log Analytics workspace.

### 4.4 Dependencies
- The **site network build** gates Job Seeker device testing (production-network test follows the 26 June network target).
- The **Azure hub-spoke pattern** (and its As-Built/patternisation) is the reference for the Standard User, ES, Privileged and Developer Azure spokes.
- **Nerdio operational** gates the Job Seeker AVD build and is reused downstream.
- The **YubiKey FIPS validation** gates the Privileged production cutover.
- Standard User **printing and mapped-drive decisions** gate the Standard User build.
- A named **Developer platform owner (PDE owner)** gates the Developer pilot, image approval and service catalogue.

### 4.5 Risks and issues (consolidated)
1. Five use cases plus a national device rollout in ~14 weeks with a single build engineer does not fit; Developer (now last) lands past 30 September. **Recommendation:** commit Network + Job Seeker + Standard User + ES; treat Privileged and Developer as protected-stretch; add an engineer or scope Developer to design-plus-pilot by 30 September.
2. Network skills gap caused the 30 June miss; network is on the critical path from day one.
3. Privileged Access is net-new (PAW-style, two tiers, YubiKey) added mid-window; it carries production blast-radius risk and must gate hard on YubiKey and on the CTO/CISO sign-off.
4. YubiKey 5C NFC FIPS gates production access for `zz`/`xy`; if it fails, there is no phishing-resistant path from Macs — fallback to a dedicated hardened Cloud PC for the highest tier.
5. ES take-home removes the site VLAN/PSK/site-Zscaler controls Job Seeker relies on; it is a security redesign.
6. Developer must stay a permissive image with no production path; keep the boundary clean.
7. Standard User printing (DR-010) and mapped drive (DR-011) still pending; both gate build.
8. Job Seeker device count inconsistent in the design (517 vs 540); reconcile against licensing and the site allocation list before procurement.
9. Nerdio assumed deployed; confirm, or add a deployment task that gates the Job Seeker AVD build.
10. Developer PDE owner not yet named.
11. Contract ends 30 September; Privileged lands on the final week, Developer past it, with no buffer.

### 4.6 Decision registers

**Job Seeker design decisions**
| ID | Decision | Status | Resolution / note |
| --- | --- | --- | --- |
| DR-001 | Include Excel on kiosk devices | Pending→included | Provisioned for web use under the kiosk licensing model |
| DR-002 | Printing approach | Agreed | No direct printing; email to case worker via webmail |
| DR-003 | Bookmark consolidation | Agreed | Unified bookmark set with categorised folders; separate Eskilled folder for ES |
| DR-004 | Password rotation frequency | Agreed | Individual per-device password; rotatable at any frequency (default 12 months) |
| DR-005 | Data-wipe notice on screensaver | Under consideration | Wallpaper implemented; screensaver a build-phase enhancement |
| DR-006 | Wi-Fi/VLAN | Agreed | Reuse VLAN; single subnet per site; hidden APM-KIOSK SSID with pre-shared key |
| DR-007 | PDF viewer | Agreed | PDFs via Edge |
| DR-008 | SSID naming | Approved | Rename to APM-KIOSK; hidden; pre-shared key via Intune |
| DR-009 | IP addressing | Agreed | /26 per site; 4 devices per server; ~540 devices total |

**Standard User design decisions**
| ID | Decision | Status | Note |
| --- | --- | --- | --- |
| DR-001 | Policy targeting | Approved | Reuse 14 laptop policies, scope to AVD device group |
| DR-002 | Business overrides on AVD | Approved | All four laptop overrides carry to AVD |
| DR-003 | Desktop model | Approved | Windows 11 Enterprise multi-session, pooled, breadth-first |
| DR-004 | FSLogix storage | Approved | Azure Files Premium + Entra Kerberos; one share per region |
| DR-005 | Session host identity | Approved | Entra ID joined only |
| DR-006 | Application delivery | Approved | Bake critical apps; App Attach (MSIX); Intune Win32 for stragglers |
| DR-007 | BYOD posture | Approved | Unmanaged blocked from M365 except Windows App into AVD |
| DR-008 | Application Control for Business | Approved | Reuse workstation enforcement policy as-is |
| DR-009 | Region | Approved | Australia East primary; per-region pattern documented |
| DR-010 | Print architecture | Pending | Universal Print most likely |
| DR-011 | Mapped network drive | Pending | Backend (SharePoint / Azure Files / on-prem SMB) to confirm |
| DR-012 | DR posture | Approved | Regional pattern; no cross-region FSLogix replication in V1 |
| DR-013 | RDP redirection control | Approved | Disabled by default for BYOD; corporate exceptions if justified |

**Developer design decisions (selected)**
Platform = AVD (cheaper than Windows 365 at expected utilisation); two pools originally (pooled primary + personal), now production access moved to the Privileged image; Azure Image Builder pipeline; Podman default container runtime (Docker on request); FSLogix on Premium ZRS; OneDrive Known Folder Move backup; Zscaler at the physical endpoint, not the session host; standing Reader + PIM-eligible Contributor for non-prod; OIDC federation for CI/CD; GitHub Copilot Business with MCP allowlist; Microsoft Sentinel (or existing SIEM) for retention.

---

## 5. Stakeholders (APM-side, roles only)

| Role | Responsibility on this program |
| --- | --- |
| Digital Delivery Portfolio Manager | Owns this project; decision authority and escalation; the project team reports here |
| Program Manager (overall) | Program-level coordination across related projects |
| Head of Digital Transformation & Architecture | Design document owner; architecture authority; signs off Developer requirements |
| CTO / CISO | Accountable for all Cyber and IT; Privileged Access authority; approved the job-seeker printing model |
| Head of Digital Operations | Operations; approved SSID naming; Developer support-model stakeholder; PDE decommission |
| IT Infrastructure Lead | APM network and infrastructure build (site and Azure) |
| Cyber Security Lead | Cyber controls, RFFR assurance, Conditional Access/PIM, Privileged Access and YubiKey |
| End User Compute Manager | EUC build and operations; Intune |
| IT Service Lead / Service Desk | Support; tier-1 triage runbooks |
| Digital Business Partner | Owns all instructions and communications; validates knowledge-base articles |
| Employment Services Lead | Business owner for Job Seeker, ES (take-home) and ES devices |
| CEO, Employment Services | Executive sponsor |
| Employment Services training owner | Eskilled training content (Job Seeker/ES) |
| Developer platform owner (PDE owner) | To be nominated; owns Developer pilot, image approval and service catalogue |

**Delivery side (Twiki Corp / the project team), by role:** Architecture Lead (Azure, cloud, security); AVD Solution Engineer (build and KB authoring); Project Manager (delivery and device logistics).

**External suppliers (by function):** the Device Build Partner (device wipe/prep/build/ship); the managed network service provider (Zscaler tunnel); the licensing reseller; Nerdio (AVD orchestration platform).

**RACI (by role, summary):**
- **Accountable** for delivery outcomes: Digital Delivery Portfolio Manager (project), CTO/CISO (privileged/security), Head of Digital Transformation & Architecture (design).
- **Responsible** for build: the project team's AVD Solution Engineer, with the Architecture Lead; APM Network/Infrastructure, EUC, Cyber as co-responsible by domain.
- **Consulted:** Cyber Security Lead, Head of Digital Operations, Employment Services Lead, Digital Business Partner.
- **Informed:** Program Manager, CEO Employment Services, Service Desk.

---

## 6. Project plan

### 6.1 Order and window
Build order: **Network foundation → Job Seeker → Standard User → ES → Privileged → Developer.** Program window **23 June 2026 to 30 September 2026** (contract end). Network build started 23 June, target 26 June.

### 6.2 Workstreams and phases
- **Network foundation:** site network (VLAN/SSID/Meraki/Palo Alto/Zscaler) and Azure foundation (hub/spoke, DNS resolver, NAT, NSGs, private endpoints), then test, As-Built document, and patternisation of the reusable Azure template.
- **Job Seeker:** AVD and identity (Nerdio pool, golden image, F3 runbook, Key Vault, Credential Proxy, Conditional Access, Shell Launcher, lock-screen remediation); device test (test then production network); the Device Build Partner build process (finalise instructions, partner tests, two-person end-to-end order-to-delivery test); rollout (pilot, per-site cutover, national rollout of ~517 devices).
- **Standard User:** document the current laptop SOE and close the printing/mapped-drive decisions; build (Entra groups + Conditional Access, FSLogix on Azure Files Premium, Compute Gallery + golden image, Nerdio pool + app groups, scope the 14 policies); pilot 25–50 users; production rollout.
- **ES:** design adaptation (midnight reset, take-home/any-Wi-Fi, Zscaler-on-device, revised CA), DDD and CAB; build and off-site test; pilot and rollout.
- **Privileged:** design (PAW-style image, two tiers, PIM model), DDD and CAB; YubiKey 5C NFC FIPS test and validation milestone; build hardened image and CA/PIM; pilot and cutover.
- **Developer:** finalise the permissive-image design and Dev network; build (landing zone, FSLogix Premium ZRS, Sentinel, AIB pipeline, pooled host pool, tooling layers); pilot ring and team-by-team migration; capability phases; retire the legacy PDE.
- **Logistics (project manager):** retrieve old Job Seeker devices and place new; retrieve staff laptops as AVD replaces; retrieve/contract high-privilege laptops so those users move to their own Macs via the Privileged image; ongoing asset-register updates.
- **KB & Enablement:** a knowledge-base article for every major supportable process. Flow: the AVD Solution Engineer builds it, the Digital Business Partner validates, then the process stakeholder validates, then publish under the APM KB standard (admin review before publish).

### 6.3 Key milestones
- Network build target — 26 June 2026 (critical).
- Network ready + patternised — ~17 July 2026.
- Job Seeker test device validated on both networks — ~24 July; build process proven end-to-end — ~4 August; national rollout complete — ~11 September.
- Standard User DDD approved — ~31 July; AVD GA — ~25 September.
- ES DDD approved — ~21 August; ES live — ~18 September.
- YubiKey FIPS validated — ~26 August (gate); Privileged Access live (zz + xy) — ~23 September (critical).
- Developer SOE GA — ~9 October (past contract end on current resourcing).

### 6.4 Current status (as at 23 June 2026)
- **In progress:** site network build and Azure hub foundation (network started today).
- **Approved/at CAB:** Job Seeker detailed design (V1.0).
- **Draft:** Standard User SOE (V0.1), Developer SOE (V0.1 draft). ES and Privileged designs to be produced/adapted.
- **Upcoming:** Job Seeker AVD and identity build once the Azure spoke exists; the device build process with the Device Build Partner.
- **Blocked / awaiting decisions:** Standard User printing and mapped-drive decisions; Nerdio-deployed confirmation; Developer PDE owner nomination; device-count reconciliation.

---

## 7. Glossary

| Term | Meaning |
| --- | --- |
| APM | Advanced Personnel Management; the client; an Australian employment-services provider |
| AVD | Azure Virtual Desktop; Microsoft's cloud virtual-desktop service |
| SOE | Standard Operating Environment; a standardised, managed desktop image/configuration |
| Nerdio (Nerdio Manager for Enterprise) | Management/orchestration layer for AVD (host pools, autoscale, image lifecycle, reimaging) |
| Intune | Microsoft Intune; cloud device-management (MDM) plane |
| Entra ID | Microsoft Entra ID; cloud identity provider (formerly Azure AD) |
| Conditional Access (CA) | Entra ID policies controlling who/what can access resources under which conditions |
| PIM | Privileged Identity Management; just-in-time elevation of privileged roles |
| FSLogix | Profile-container technology that roams the Windows user profile for AVD |
| Azure Files Premium | SMB file storage tier used for FSLogix profile containers |
| Entra Kerberos | Kerberos authentication to Azure Files using Entra ID (no AD DS) |
| Compute Gallery | Azure image store with versioning and regional replication |
| AIB | Azure Image Builder; pipeline that builds golden images from a Git-backed template |
| Windows App | Microsoft client used on endpoints to connect to AVD sessions |
| Shell Launcher | Windows feature replacing Explorer with a single app (used for kiosk lockdown) |
| Assigned Access | Windows multi-app kiosk configuration limiting which apps run |
| Autopilot self-deploying | Zero-touch device provisioning bound to the tenant with no user interaction |
| Windows 11 IoT Enterprise | Locked-down Windows edition used on the kiosk thin clients |
| Windows 11 Enterprise multi-session | AVD-specific Windows allowing multiple users per host |
| F3 | Microsoft 365 F3 frontline licence; used for per-device kiosk accounts |
| Key Vault | Azure secret store; holds per-device kiosk passwords behind a private endpoint |
| Credential Proxy | Azure Function that lets kiosk devices retrieve their password without exposing Key Vault |
| Hybrid Runbook Worker | Azure Automation worker on a VM inside the VNet, able to reach private endpoints |
| Proactive Remediation | Intune detect-and-fix scripts (used to rotate the kiosk lock-screen/credentials) |
| APM-KIOSK | The repurposed/renamed job-seeker site network (VLAN 73), hidden SSID + pre-shared key |
| VLAN 73 | The job-seeker site VLAN; supernet 10.73.0.0/16, /26 per site |
| Hub-and-spoke | Azure network topology: shared services in a hub VNet, workloads in spoke VNets |
| NAT Gateway | Provides explicit outbound internet egress for Azure subnets |
| DNS Private Resolver | Azure service resolving private and public DNS for the VNets |
| Private endpoint | Private IP access to Azure PaaS (Key Vault, Azure Files, Function App) inside the VNet |
| NSG | Network Security Group; subnet-level allow/deny rules |
| Palo Alto (east-west) | Firewalls enforcing east-west segmentation between Azure workloads |
| Zscaler / ZIA / IPSEC tunnel | Cloud web-filtering (Zscaler Internet Access), reached via an IPSEC tunnel |
| IMDS / WireServer | Azure platform endpoints (169.254.169.254 / 168.63.129.16) that must not be intercepted |
| RDP Shortpath | Direct UDP transport for AVD (falls back to TCP 443 reverse-connect) |
| RFFR | Right Fit For Risk; DEWR cybersecurity accreditation (ISO 27001 + ASD ISM based) |
| DEWR | Australian Department of Employment and Workplace Relations |
| Workforce Australia | The Australian government employment-services program APM delivers |
| ASD ISM | Australian Signals Directorate Information Security Manual |
| ISMS | Information Security Management System |
| Tier 2 / Tier 3 | Service availability tiers (Tier 2 = business-critical; Tier 3 = important, not critical) |
| RTO / RPO | Recovery Time Objective / Recovery Point Objective |
| BYOD | Bring Your Own Device (unmanaged personal endpoint) |
| PAW | Privileged Access Workstation; hardened admin desktop with no mail/Teams/browsing |
| zz / xy | APM privileged-account naming prefixes: Priv tier (zz) and High-Priv tier (xy) |
| YubiKey 5C NFC FIPS | FIPS-validated hardware security key used for phishing-resistant MFA on privileged access |
| Application Control for Business (WDAC) | Windows application allow-listing in enforcement |
| Defender for Endpoint | Microsoft EDR/AV on session hosts |
| MSIX / App Attach | Application packaging and on-demand mounting (Nerdio App Attach) |
| WSL2 | Windows Subsystem for Linux v2 (developer use case) |
| Podman / Docker | Container runtimes (Podman default in the Developer SOE) |
| MCP | Model Context Protocol; AI tooling integration in the Developer SOE (allowlisted) |
| OIDC workload identity federation | Secret-less CI/CD authentication to Azure |
| SBOM | Software Bill of Materials; produced per developer image build |
| Sentinel | Microsoft Sentinel; SIEM for log retention and alerting |
| CAB | Change Advisory Board; approves designs/changes for build |
| DDD | Detailed Design Document |
| Eskilled | Third-party training portal bookmarked for Job Seeker/ES users |
| Device Build Partner | External supplier that wipes, prepares, builds and ships the physical devices |
| The project team / Twiki Corp | The delivery party for this program |
