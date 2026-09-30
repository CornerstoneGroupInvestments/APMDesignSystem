
# Detail Design Document

**Standard User SOE on AVD**
15 May 2026

| Project Name: | Standard User SOE on Azure Virtual Desktop |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: | Digital Workplace Transformation |
| Division/Unit: | Digital Transformation & Architecture |
| Document Status: | Draft |
| Document Version: | V0.1 |
| Product ID: | DDD-AVD-STD-001 |
FOR INTERNAL USE ONLY
Commercial in confidence
© APM

**Document control**

**Version History**

| Version | Date | Author | Key changes |
| --- | --- | --- | --- |
| V0.1 | 15 May 2026 | Digital Transformation & Architecture | Initial draft |
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

## 1. Introduction

### 1.1 Purpose
This document provides the detailed technical design for the Standard User SOE delivered through Azure Virtual Desktop (AVD) as part of the APM digital workplace transformation programme. It defines the AVD host pool architecture, Windows 11 Multi-Session golden image, identity and access controls, Intune policy scope, application delivery model, security architecture, and service management approach.
This document extends the existing Entra-joined, Intune-managed laptop SOE into AVD. The intent is one SOE, two delivery channels: a physical laptop, or an AVD session reached via the Windows App. Staff choose the channel that suits the work.
This document builds on APM's existing Standard Laptop SOE policy stack and the AVD foundation already operating for the Job Seeker Kiosk solution. It maps each requirement to its technical resolution and is implementation-ready for the build, pilot, and rollout phases.
The aim of this document is to:
Define the AVD architecture across all architecture domains (business, application, technology, information, and cyber)
Trace business requirements to their detailed technical implementation
Specify the Intune profile scope, Entra ID groups, Conditional Access policies, Nerdio host pool configuration, and FSLogix profile design at build-ready depth
Document design decisions, assumptions, and open items requiring stakeholder sign-off
Outline the implementation sequence, service management model, and operational handover plan

### 1.2 Audience
The primary audience for this document is APM's Digital Delivery, Digital Operations, Cyber Security, and Information Architecture teams responsible for build, integration, support, and maintenance. Business owners and operations staff should be involved in reviewing the business requirements traceability and the user-impact decisions in the Decision Register.
This includes:
Business Sponsor,
Business Partners,
Project Management office,
Digital Transformation & Architecture,
Digital Operations
Digital Delivery
Cyber Security
And wider Digital teams.

## 2. Overview
APM operates a mature Standard Laptop SOE for staff: Entra-joined Windows 11 devices managed via Intune, hardened to ASD ISM and Microsoft baselines, with Application Control for Business in enforcement and a 14-policy Intune stack covering operating system hardening, Office, Edge, BitLocker, USB control, and compliance for Conditional Access.
This design extends that same SOE into Azure Virtual Desktop. AVD is offered as a parallel delivery channel, not a replacement: a member of staff can work from their corporate laptop, or they can reach the same SOE experience by connecting to an AVD session from a corporate device or a personal one. The choice is per session, not per person.
Session hosts run Windows 11 Enterprise Multi-Session on a pooled host pool managed through Nerdio Manager for Enterprise. User profiles persist via FSLogix profile containers on Azure Files Premium with Entra Kerberos authentication. Every host is Entra-joined and Intune-managed: the same 14 Intune policies that govern the laptop SOE are scoped to the AVD device group with no functional changes. AVD-specific Intune profiles (FSLogix, session time limits, RDP redirection control) are added on top.
Access from personal devices (BYOD) is restricted by Conditional Access: a personal device can reach APM resources only through the Windows App into AVD. Direct browser access to Microsoft 365, Outlook on the web, Teams, SharePoint, and the M365 admin surfaces is blocked from unmanaged devices. Corporate Entra-joined laptops retain full access. This design relies on identity and the AVD session boundary as the security perimeter for unmanaged endpoints.
The solution is designed for global rollout with a regional host pool pattern. The initial deployment targets Australia East as the primary region. The same pattern (host pool, golden image replicated to a regional Compute Gallery, regional FSLogix store, regional Nerdio scope) repeats per region as APM extends AVD beyond Australia.

### 2.1 Scope
This design covers the build, deployment, and operation of the Standard User SOE on Azure Virtual Desktop. Specifically:
AVD host pool design and configuration (Windows 11 Enterprise Multi-Session, pooled, breadth-first load balancing)
Nerdio Manager for Enterprise host pool management, auto-scaling, golden image lifecycle, and image versioning
Golden image build (Win 11 Enterprise Multi-Session 24H2, M365 Apps, FSLogix agent, AVD agents, Teams optimisation, baseline LOB applications)
FSLogix profile container design on Azure Files Premium with Entra Kerberos authentication
Reuse of the 14 existing Intune policies, scoped to a new APM-AVD-SessionHosts device group
Additional AVD-specific Intune configuration profiles (FSLogix, session time limits, RDP redirection control, multi-session behaviour)
AVD application group and RDP property profile (clipboard, drive, USB, printer, audio, camera redirection control)
Identity architecture (Entra ID device groups, user groups, role-based access)
Conditional Access design covering BYOD access via Windows App and corporate device unrestricted access
Compliance policy for Multi-Session session hosts (Entra ID compliant device for Conditional Access)
LOB application delivery: bake critical apps into the golden image, deliver the broad set via Nerdio App Attach (MSIX), Intune Win32 for stragglers
Network architecture: hub-spoke VNet, NAT Gateway for outbound, NSGs, Azure DNS Private Resolver, no public-facing infrastructure
Web filtering alignment with the existing Zscaler design
Service availability tiering, regional pattern for disaster recovery, and golden image versioning as the rollback control
Operational handover: monitoring, logging, patching lifecycle, and a phased implementation plan

#### Out of Scope
The Standard Laptop SOE itself (already in production and the reference baseline for this design)
Job Seeker Kiosk solution and the CTA Laptop SOE (separate detail designs)
Printer architecture for AVD sessions to 150 site printers (placeholder section; design pending decision on Universal Print versus alternatives)
Mapped network drive integration (placeholder section; design pending confirmation of the back-end share — SharePoint, Azure Files, or on-premises file server)
LOB application packaging and certification effort (planned as a separate workstream feeding this design)
Application Control for Business policy authoring (the workstation policy is reused; this design adopts the policy as-is)
Nerdio Manager for Enterprise deployment (already operational; reused for the staff host pool)
Microsoft 365 licensing procurement (assumed in place via existing E3/E5 entitlement)
RFFR formal accreditation audit (this document supports but does not constitute the ISMS)

### 2.2 Guiding Principles
The following principles drive how this solution is designed, built, and operated:

#### SOE consistency
The AVD experience matches the laptop SOE one-for-one wherever Multi-Session permits. A user moving between channels sees the same desktop, applications, and policies.

#### Identity is the perimeter
Trust is anchored in Entra ID. Conditional Access governs what a device or session can reach. The AVD session, not the BYOD endpoint, is the trusted compute environment for personal devices.

#### Modern management only
Entra Join + Intune. No Active Directory Domain Services, no Group Policy, no on-premises management plane. Anything that cannot be delivered through this stack is redesigned or accepted as a constraint.

#### Cost over capacity
Multi-Session pooled hosts with breadth-first load balancing and aggressive auto-scale-in during off-peak. The design favours density over headroom for non-critical workloads.

#### Designed for global, deployed regionally
A repeatable per-region pattern (host pool, FSLogix store, image gallery replica, Nerdio scope) so APM can spin up additional regions without redesign.

#### Build once, deploy many
One golden image. One Intune policy stack. One Conditional Access model. Regional differences are scope and DNS, not design.

#### RFFR alignment maintained
Every control in the laptop SOE that maps to RFFR is preserved on AVD. The session host is treated as an endpoint for control purposes, not as server infrastructure.

#### Operational visibility by default
Diagnostic settings, Azure Monitor, Defender for Cloud, and Intune reporting are configured during build, not retrofitted.
The Guiding Principles are a set of key statements and ideas that drive how elements of the project will be designed, implemented, and operated. These principles are contextualised focusing on the project deliver aligning to the project/program success criteria

### 2.3 Assumptions
The following assumptions underpin this design. Each is open to validation during the build and pilot phases.
All staff have Entra ID accounts and existing Microsoft 365 licensing covers the AVD user access right (M365 E3/E5 with Windows 11 Enterprise user subscription, or Windows Enterprise E3/E5 separately).
APM's Entra ID and Intune tenant are operationally mature. Existing Conditional Access framework, dynamic group patterns, and policy assignment patterns are reused.
Nerdio Manager for Enterprise is deployed and operational from the Job Seeker Kiosk solution. The same Nerdio instance manages the staff host pool with a separate workspace.
Azure subscriptions exist with budgetary cover for AVD compute, Azure Files Premium, Compute Gallery, and supporting networking. FinOps governance is already established.
APM-issued corporate laptops are Entra-joined and Intune-managed and meet the existing Staff-Windows-Compliance-Policy. They are treated as compliant managed devices for Conditional Access purposes.
Personal devices are out of APM's MDM control. They are treated as untrusted endpoints. The only path to APM data from a personal device is the Windows App into AVD.
All 14 existing Intune policies are authoritative and the policy owners agree to scope the AVD device group into them. No content changes are required to those policies for this design.
Application Control for Business is in enforcement on the laptop fleet. The same enforcement policy is applied to AVD session hosts.
Standard staff have no requirement for local administrator rights inside the AVD session. UAC behaviour matches the laptop SOE (prompt for credentials).
Outlook is used in cached-mode equivalent (OST in profile). FSLogix profile container size is provisioned accordingly. Office Container is not used in the initial design.
Printing requirements will be addressed in a subsequent design decision; this document marks the printing section as a placeholder.
The existing mapped network drive will be migrated or remapped during AVD rollout. The technical detail is captured in a subsequent design decision; this document marks the section as a placeholder.

## 3. Business Architecture
The Standard User SOE on AVD is a response to three business outcomes: reducing total cost of endpoint ownership across the staff fleet, supporting flexible working through BYOD without compromising data protection, and increasing operational agility through cloud-native deployment of the staff desktop.
APM operates national and global delivery teams supporting employment services. Current SOE is a managed Windows 11 laptop with the full Intune policy stack. The laptop model delivers a hardened, RFFR-aligned desktop, but it carries fixed cost per seat, manual provisioning lead time, and replacement cycles that tie the workforce to hardware refresh.
AVD reframes the staff desktop as a service: the same SOE, the same Intune-managed posture, the same RFFR controls, delivered as a session that can be reached from any compatible endpoint. The physical device becomes interchangeable. Cost moves from capital hardware to scalable cloud consumption. New starters reach productivity in the time it takes to log in. Lost or stolen endpoints carry no data, only a Windows App.
AVD is offered alongside the laptop SOE, not as a replacement. Staff who need persistent local compute (offline work, specialist peripherals, heavy graphics) remain on the laptop SOE. Staff whose work is browser, Office, and standard LOB applications are candidates for AVD. The mix is expected to shift toward AVD over time as the model proves out.

### 3.2 Business Context
The business capabilities impacted by this design are Workforce Productivity, Identity and Access Management, Endpoint Operations, and Information Security. The capability uplift is summarised below.

| Capability | Current State | Target State |
| --- | --- | --- |
| Workforce Productivity | Provisioning time, hardware-bound work, flexibility | Same SOE delivered as a session reachable from any compatible device. New starter productive in under 30 minutes. |
| Identity and Access Management | Trust anchored to managed device | Trust anchored to identity. Conditional Access blocks unmanaged endpoints from anything except a Windows App session to AVD. |
| Endpoint Operations | Hardware refresh cycles, lost/stolen replacement | Endpoint becomes interchangeable. Loss does not equal data exposure. Refresh moves to BYO or extended-life thin clients. |
| Information Security | Endpoint as enforcement point | Enforcement moves into the AVD session host. BYOD never holds APM data outside the session. |

### 3.3 Business Requirements
The following requirements are derived from the APM Unified SOE Requirements V2 and stakeholder consultation. Each is expressed as a user story with acceptance criteria and priority (Must / Should / Could).

| ID | Priority | Persona | User Story | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| BR-001 | Must | Standard User | As a standard user, I can sign in to my AVD session from a corporate Entra-joined laptop using my APM identity and reach my full SOE within 60 seconds. | Sign-in succeeds, profile loads, Outlook, Teams, Edge, and Office launch without re-authentication. |
| BR-002 | Must | Standard User | As a standard user, I can sign in to my AVD session from a personal Windows or macOS device via the Windows App and reach the same SOE. | Windows App connects, AVD session opens, no other APM resources reachable from the host OS. |
| BR-003 | Must | Cyber Security | As Cyber Security, I require any access from an unmanaged device to APM data to be denied unless it is via a Windows App session to AVD. | Conditional Access blocks Outlook, OWA, SharePoint, Teams, Graph, Office portal from unmanaged devices; allows Windows App + AVD. |
| BR-004 | Must | Cyber Security | As Cyber Security, I require AVD session hosts to apply the same Intune policy posture as the laptop SOE. | All 14 existing Intune policies scoped to the AVD device group. Reporting confirms compliance. |
| BR-005 | Must | Digital Operations | As Digital Operations, I require auto-scaling that meets demand at peak (70 to 80 percent concurrent) and scales in during off-peak. | Nerdio auto-scale rules tested. Peak provisions enough capacity for concurrent demand. Off-peak scales below 30 percent. |
| BR-006 | Must | Standard User | As a standard user, my profile, OneDrive, Outlook cache, and Teams data persist between sessions. | FSLogix profile container mounts at sign-in. OST and OneDrive cache survive sign-out and host reimaging. |
| BR-007 | Should | Digital Operations | As Digital Operations, I can update the golden image without disrupting active users. | Image versioned in Compute Gallery. Drain-mode reimaging via Nerdio with no in-session interruption. |
| BR-008 | Should | Standard User | As a standard user, I can use Microsoft Teams with media optimisation (audio, video, screen share offloaded to the local client). | Teams Optimisation Pack installed. Calls show as optimised in the Teams admin centre. |
| BR-009 | Should | Standard User | As a standard user, I can print from my AVD session to a printer in my site. | Print mechanism to be confirmed in subsequent design decision. Placeholder in this document. |
| BR-010 | Should | Standard User | As a standard user, I can access the existing mapped network drive from my AVD session. | Mapped drive design to be confirmed in subsequent decision. Placeholder in this document. |
| BR-011 | Could | Digital Operations | As Digital Operations, I can spin up an AVD region outside Australia using the same pattern. | Per-region pattern documented. Subsequent regions are configuration changes, not redesign. |
| BR-012 | Could | Cyber Security | As Cyber Security, I can restrict clipboard, file, USB, and print redirection from BYOD into the AVD session to prevent data exfiltration. | RDP property profile applied to host pool. BYOD sessions have egress-direction redirection disabled or limited; corporate sessions retain functionality. |

### 3.4 Decision Register
The following design decisions have been raised during the requirements and design process. Items marked Pending require formal sign-off before build. The design documents the most likely resolution and can accommodate the alternatives where flagged.

| ID | Decision | Resolution | Status | Rationale / Notes |
| --- | --- | --- | --- | --- |
| DR-001 | Policy targeting strategy | Reuse the 14 existing laptop SOE Intune policies; scope each to a new APM-AVD-SessionHosts device group rather than cloning. | Approved | Some settings have no effect on multi-session and will show as not-applicable in Intune reporting. This is accepted noise in exchange for single-source-of-truth operations. |
| DR-002 | Business overrides on AVD | All four laptop business overrides (Location forced on, UAC prompt-for-credentials, Edge extension allowlist, SmartScreen allowlist) carry to AVD unchanged through policy reuse. | Approved | AVD posture matches laptop posture. No AVD-specific tightening in V1.0. |
| DR-003 | Desktop model | Windows 11 Enterprise Multi-Session, pooled host pool, breadth-first load balancing. | Approved | Maximises density and cost efficiency. Personal desktop model rejected; not required for office worker persona. |
| DR-004 | FSLogix storage | Azure Files Premium with Entra Kerberos authentication. One share per region. | Approved | Cloud-native, no AD DS dependency. Sufficient IOPS for office workload. ANF reserved as a future option if Outlook OST IO exceeds Azure Files Premium limits. |
| DR-005 | Session host identity | Entra ID joined only. No hybrid join. | Approved | Modern management. Matches existing laptop SOE identity model. |
| DR-006 | Application delivery | Mixed model: bake critical apps into golden image (Office, Teams, FSLogix, AVD agents, Edge, Defender, baseline LOB); deliver broad LOB via Nerdio App Attach (MSIX); use Intune Win32 for apps that cannot be packaged. | Approved | Image stays manageable. App updates do not require image rebuild for App Attach apps. |
| DR-007 | BYOD endpoint posture | Personal devices are not managed. Conditional Access blocks unmanaged devices from all M365 resources except the Windows App into AVD. | Approved | Identity-only control on BYOD. The AVD session is the trusted compute environment. |
| DR-008 | Application Control for Business on AVD | Reuse the workstation enforcement policy as-is on AVD session hosts. | Approved | WDAC is live in enforcement on laptops. Same policy on AVD preserves consistency. |
| DR-009 | AVD region(s) | Australia East primary. Per-region pattern documented for future regional expansion. | Approved | Aligns with current APM Azure footprint. Additional regions added via the documented pattern. |
| DR-010 | Print architecture | Deferred. Section in this document is a placeholder. | Pending | Universal Print is the most likely path. Decision pending APM evaluation. |
| DR-011 | Mapped network drive | Deferred. Section in this document is a placeholder. | Pending | Backend share type (SharePoint, Azure Files, or on-premises SMB) to be confirmed. Drives hybrid connectivity decision. |
| DR-012 | Disaster recovery posture | Regional pattern is the primary DR control. Cross-region FSLogix replication is not used in V1.0. | Approved | Per-region recovery via Nerdio rebuild from Compute Gallery. Cross-region replication considered too expensive for the Tier 2 classification. |
| DR-013 | RDP redirection control | RDP property profile applied at host pool level. Clipboard, drive, printer, USB redirection disabled by default for BYOD sessions; reviewed per Conditional Access context where technically feasible. | Approved | Reduces data exfiltration risk from BYOD. Corporate devices may carry exceptions if business case supports it. |

## 4. Application Architecture
The application architecture has two tiers: the endpoint tier (corporate Entra-joined laptop or BYOD device running the Windows App) and the AVD session-host tier (Windows 11 Enterprise Multi-Session VMs in a Nerdio-managed host pool). All application execution occurs on the session host. The endpoint is a presentation layer.
This separation means that data handled by the user lives only within the AVD session and the user's FSLogix profile container in Azure Files. No application data resides on the endpoint outside the active session frame.

### 4.1 System Context Diagram
The system context diagram (to be inserted) shows how the AVD session interacts with the following systems and services.

| External System / Service | Interaction with the AVD Solution |
| --- | --- |
| Microsoft Entra ID | Identity and Conditional Access for both endpoint sign-in and AVD session sign-in |
| Microsoft Intune | Device management and policy delivery for AVD session hosts and corporate endpoints |
| Azure Virtual Desktop control plane | Session brokering, gateway, web client (blocked by CA), and management endpoints |
| Nerdio Manager for Enterprise | Host pool lifecycle, auto-scale, golden image management, reimaging operations |
| Azure Files Premium (with Entra Kerberos) | FSLogix profile containers, one share per region |
| Azure Compute Gallery | Golden image versioning and regional replication |
| Microsoft 365 services | Mail (Exchange Online), files (SharePoint, OneDrive), collaboration (Teams), productivity (Office) |
| Microsoft Defender for Endpoint | EDR signal collection from AVD session hosts and corporate endpoints |
| Zscaler | Web filtering and proxy enforcement for outbound web traffic from AVD session hosts |
| Universal Print (placeholder) | Cloud print to site printers - pending decision |
| Mapped network drive backend (placeholder) | User-facing file share - backend pending decision |
| Existing LOB applications | Browser-delivered SaaS, Nerdio App Attach VHDX packages, Intune-installed Win32 apps |

### 4.2 Solution/Product Component Inventory
The following components are in scope. Status flags new components introduced by this design and existing components reused from the laptop SOE or Job Seeker Kiosk foundation.

| Component | Identifier | Vendor | Version / Edition | Licensing Model | Status |
| --- | --- | --- | --- | --- | --- |
| AVD Host Pool | APM-AVD-HP-StaffPooled-AUE | Microsoft | AVD service | Native AVD | New |
| AVD Workspace | APM-AVD-WS-Staff-AUE | Microsoft | AVD service | Native AVD | New |
| AVD Application Group | APM-AVD-AG-StaffDesktop-AUE (Desktop) | Microsoft | AVD service | Native AVD | New |
| Session Host VMs | vmavd-stf-aue-NNN | Microsoft | Windows 11 Enterprise Multi-Session 24H2 | Per-user via M365 E3/E5 | New |
| Nerdio Manager for Enterprise | Existing instance | Nerdio | Nerdio MFE current | Per-named-user | Reused from Job Seeker |
| Azure Files Premium | stfslogixaue001 (file share apm-fslogix) | Microsoft | Premium tier | Provisioned capacity | New |
| Azure Compute Gallery | gal-apm-avd-staff | Microsoft | Compute Gallery | Native Azure | New |
| Golden Image | img-apm-avd-staff-w11-ms-24h2-vN | APM build | Win 11 Enterprise Multi-Session 24H2 | Image of OS + apps | New |
| FSLogix Agent | Within golden image | Microsoft | Latest GA | Included in Win Enterprise | New (within image) |
| AVD Agent / Boot Loader | Within golden image | Microsoft | Latest GA | Native AVD | New (within image) |
| Microsoft Teams (AVD-optimised) | Within golden image | Microsoft | Teams + Optimisation Pack | Per-user via M365 | New (within image) |
| Microsoft 365 Apps for Enterprise | Within golden image | Microsoft | Current channel, shared-computer activation enabled | Per-user via M365 E3/E5 | Reused from laptop SOE |
| Microsoft Edge (Chromium) | Within golden image | Microsoft | Current channel | Included with Windows | Reused from laptop SOE |
| Microsoft Defender for Endpoint | On session host | Microsoft | Latest | Per-user via M365 E5 / D4B | Reused from laptop SOE |
| Nerdio App Attach catalogue | stgapmappattach | Microsoft (storage) / Nerdio (orchestration) | MSIX packages mounted as VHDX | Nerdio managed | New |
| Conditional Access Policies | CA-APM-AVD-* set (see Cyber section) | Microsoft | Entra ID P2 | Existing entitlement | New (new CA policies, existing CA framework) |
| Entra ID Groups | SG-APM-AVD-* set (see Cyber section) | Microsoft | Entra ID | Existing entitlement | New (within existing group framework) |
| Intune Configuration Profiles | 14 reused + AVD-specific additions (see 4.5) | Microsoft | Intune | Per-user via M365 E3/E5 | Reused + new |
| Application Control for Business policy | Existing workstation policy | Microsoft / APM build | Latest | Native Windows | Reused from laptop SOE |
| Windows App (endpoint client) | Deployed to BYOD via direct download; deployed to corporate Entra-joined laptops via Intune | Microsoft | Latest GA | Free | New deployment, existing app |
| Universal Print (placeholder) | TBC | Microsoft | TBC | Per-printer via M365 | Pending decision |
| Mapped Network Drive (placeholder) | TBC | TBC | TBC | TBC | Pending decision |

### 4.3 Solution Interface Diagram
The solution interface diagram (to be inserted) presents the AVD session-host interactions: endpoint sign-in flow, AVD broker handshake, FSLogix container mount, Intune policy fetch, Entra Conditional Access evaluation, Defender for Endpoint signal, Zscaler outbound, and Microsoft 365 service calls. Specific interface configuration is documented in the Technology Architecture, Information & Data Architecture, and Cyber & Security Architecture sections below.

### 4.4 Solution/Product Interface catalogue
The following interfaces are in scope. Where the interface is provided by a Microsoft service over the public internet, the network path is Microsoft-managed and does not require APM firewall configuration beyond outbound TCP 443.

| ID | Interface | Protocol / Port | Authentication | Purpose |
| --- | --- | --- | --- | --- |
| I-01 | Endpoint to Entra ID | HTTPS / TCP 443 | Modern Authentication (OAuth 2.0 / OpenID Connect) | User sign-in to Windows App and to AVD session |
| I-02 | Endpoint to AVD Gateway | HTTPS / TCP 443 (reverse-connect) and UDP 3478 (RDP Shortpath where available) | AVD reverse-connect transport; falls back to TCP if UDP blocked | Session establishment between endpoint and session host |
| I-03 | Session host to Entra ID | HTTPS / TCP 443 | Modern Authentication, device join, primary refresh token | Host join and session sign-in |
| I-04 | Session host to Intune | HTTPS / TCP 443 | MDM enrolment and policy fetch | Policy delivery to session host |
| I-05 | Session host to AVD control plane | HTTPS / TCP 443 | AVD agent heartbeat, session orchestration, registration | AVD service operations |
| I-06 | Session host to Azure Files Premium (FSLogix) | SMB 3.x / TCP 445 over VNet (private endpoint) | Kerberos against Entra ID | FSLogix profile container mount |
| I-07 | Session host to Microsoft 365 (Exchange, SharePoint, Teams, Graph) | HTTPS / TCP 443 | Modern Authentication | User Office workload calls from inside session |
| I-08 | Session host to Microsoft Defender for Endpoint | HTTPS / TCP 443 | MDE telemetry stream | Continuous EDR signal |
| I-09 | Session host to Zscaler | HTTPS / TCP 443 (PAC / ZTNA tunnel where applicable) | Existing Zscaler authentication model | Web filtering and outbound web egress |
| I-10 | Session host to Nerdio Manager backend | HTTPS / TCP 443 | Managed identity / service principal | Host pool management and image lifecycle commands |
| I-11 | Nerdio App Attach storage to session host | HTTPS / TCP 443 (storage) and SMB / TCP 445 (mount) | Managed identity | On-demand MSIX VHDX mount |
| I-12 | Session host to Universal Print (placeholder) | HTTPS / TCP 443 | Entra ID | Pending decision |
| I-13 | Session host to mapped drive backend (placeholder) | SMB / TCP 445 or HTTPS / TCP 443 | TBC | Pending decision |

### 4.5 Intune Configuration Profiles
Intune is the management plane for all Standard User SOE devices, on both laptops and AVD session hosts. The 14 policies that govern the laptop SOE are reused unchanged and scoped to a new device group, APM-AVD-SessionHosts, in addition to their existing laptop scope. Where settings are not applicable on Windows 11 Enterprise Multi-Session, they remain assigned but show as not-applicable in Intune reporting; this is accepted in exchange for a single-source-of-truth policy stack.
AVD-specific behaviours that are not part of the laptop SOE (FSLogix profile container path, session time limits, RDP redirection control, and Multi-Session licensing) are delivered through new AVD-specific configuration profiles scoped only to APM-AVD-SessionHosts.

#### Reused laptop SOE policies (scoped to APM-AVD-SessionHosts)

| Intune Policy Name | Coverage | Notes for AVD |
| --- | --- | --- |
| APM-Win11-Hardened Baseline v1.0 | 434 OS hardening settings | Reused as-is. AVD device group added to scope. Settings related to physical Wi-Fi/Ethernet adapters and BitLocker boot are not applicable to session hosts and are accepted as not-applicable in reporting. |
| APM-Win11-ACSC Office Hardening Guidelines | 83 Office hardening settings (macro, OLE, protected view, untrusted file types) | Reused as-is. AVD device group added to scope. |
| APM RFFR - O365 Digital Signing Controls (Phase 2) | 39 settings: VBA V3 macro signing, command-bar disable IDs, signed-only execution | Reused as-is. AVD device group added to scope. |
| APM-Edge-Hardened-Baseline-V1.1 | 31 Edge browser settings (Do Not Track, password manager off, pop-ups, SmartScreen, allowed extension list) | Reused as-is including the business override extension allowlist (uBlock Origin, Dark Reader, Level Up for Dynamics 365) and SmartScreen allowlist (apps.mypurecloud.com.au, anaplan.com). |
| Windows 11 Defaults | 24 Windows-enforced defaults (Secure Boot virtualised, VBS, Credential Guard, LSA Protection, HVCI, SMBv1 removed, NTLMv1 disabled, WDigest off, PowerShell 2.0 removed) | Applies via OS default behaviour on the session host. Documented for completeness. |
| Staff-Win11-Bitlocker | 22 BitLocker settings | Scoped to AVD device group, but BitLocker is not used on Multi-Session session hosts. Disk encryption is provided by Azure Storage Service Encryption at the platform layer and Azure Managed Disk encryption at rest. Policy will report not-applicable; this is the accepted outcome of DR-001. |
| Staff-Windows-Compliance-Policy | 19 compliance checks (BitLocker, Secure Boot, Firewall, TPM, AV, Antispyware, Defender Antimalware, Min OS, Encryption, etc.) | A new derivative is required for Multi-Session - see new AVD-specific policy CMP-APM-AVD-SessionHosts below. |
| APM-Win11-USB Storage Block | 16 settings: deny all removable storage classes, CD/DVD execute/write, floppy execute/write, removable disks | Reused as-is at the OS level on session hosts. USB redirection from the endpoint into the session is controlled separately at the host pool RDP property profile (see Cyber & Security section). |
| Default | 4 Edge default settings | Reused as-is. AVD device group added to scope. |
| Win11 - OfficeMacroHardening-PreventActivationofOLE | 3 settings: Excel/PowerPoint/Word PackagerPrompt | Reused as-is. AVD device group added to scope. |
| Entra Managed | 2 settings | Reused as-is. AVD device group added to scope. |
| APM-Edge-Hardened-Baseline-V2.0-dev tools block | 2 settings (developer tools disabled) | Reused as-is. AVD device group added to scope. |
| Workstation-Audit-Base-MsAppBlocklist | Microsoft application blocklist (audit mode) | Reused as-is. AVD device group added to scope. |
| Application Control for Business (workstation policy) | Enforced workstation policy from Apr-May 2026 rollout | Reused as-is on AVD session hosts. Adoption confirmed via WDAC reporting from Defender for Endpoint. |

#### AVD-specific configuration profiles
The following profiles are new and scoped only to APM-AVD-SessionHosts. They deliver behaviours that are intrinsic to Multi-Session AVD and are not present in the laptop SOE.

##### APM-AVD-FSLogix-ProfileContainer
Setting Name: APM-AVD-FSLogix-ProfileContainer
Setting Type: Settings Catalog (FSLogix templates)
Scope: APM-AVD-SessionHosts
Enabled: 1
VHDLocations: \\stfslogixaue001.file.core.windows.net\apm-fslogix
VolumeType: VHDX
SizeInMBs: 30720 (30 GB, dynamic)
FlipFlopProfileDirectoryName: 1
ProfileType: 0 (regular profile container)
DeleteLocalProfileWhenVHDShouldApply: 1
CleanupInvalidSessions: 1
PreventLoginWithFailure: 1 (block sign-in if FSLogix cannot mount)
RoamSearch: 0 (Windows Search index handled per-host; not roamed)
Authentication to the Azure Files share is Kerberos against Entra ID. The session host obtains a Kerberos ticket from Entra ID at user sign-in, and SMB to the file share uses that ticket. No AD DS is required. NTFS ACLs on the share root grant the AVD user group Read/Execute on the parent, with the FSLogix-managed VHDX file inheriting per-user permissions on creation.

##### APM-AVD-SessionLimits
Setting Name: APM-AVD-SessionLimits
Setting Type: Settings Catalog
Scope: APM-AVD-SessionHosts
Path: Admin Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Session Time Limits
Set time limit for active but idle Remote Desktop Services sessions: 1 hour
Set time limit for disconnected sessions: 4 hours
End session when time limits are reached: Enabled
Set time limit for active Remote Desktop Services sessions: Not configured
An idle user is disconnected (not logged off) after one hour. The disconnected session lingers for up to four hours so a user returning to their desk reconnects to the same in-progress work. After four hours disconnected, the session is logged off, the FSLogix container unmounts, and the host slot is returned to the pool. These values are tuned to typical office working patterns and the regional auto-scale schedule.

##### APM-AVD-RDPRedirectionControl
Setting Name: APM-AVD-RDPRedirectionControl
Setting Type: AVD host pool RDP property profile (applied through Nerdio)
Scope: APM-AVD-HP-StaffPooled-AUE host pool
audiocapturemode: 1 (audio capture from endpoint allowed - microphone)
audiomode: 0 (audio playback to endpoint)
camerastoredirect: * (all cameras redirected, required for Teams)
redirectclipboard: 0 for BYOD-context sessions; 1 for corporate-context (see note)
redirectdrives: 0 (local drive redirection disabled)
redirectprinters: 1 (allow if a print model requires it; revisit when printing decision is taken)
redirectsmartcards: 1
redirectwebauthn: 1
usbdevicestoredirect: disabled by default; reviewed under DR-013
enablerdsaadauth: 1 (Entra ID authentication to session host)
AVD does not natively expose a different RDP profile per device-trust state. Where APM requires clipboard or other redirection to be open for corporate Entra-joined devices but closed for BYOD, the design implements two AVD application groups attached to the same host pool: one for corporate-context users and one for BYOD-context users. Group membership is driven by the user's compliant-device status at sign-in. This pattern is documented in the Cyber & Security section.

##### CMP-APM-AVD-SessionHosts (new compliance policy)
Setting Name: CMP-APM-AVD-SessionHosts
Setting Type: Intune Compliance Policy
Scope: APM-AVD-SessionHosts
Require BitLocker: Not configured (Multi-Session uses Azure platform encryption)
Require Secure Boot: Required (virtualised on Trusted Launch VM)
Require Trusted Platform Module: Required (vTPM on Trusted Launch VM)
Require Firewall: Required
Require Antivirus: Required (Microsoft Defender Antivirus)
Require Antispyware: Required
Require Defender Antimalware: Required
Minimum OS version: 10.0.26100 (Windows 11 24H2 baseline)
Maximum OS version: Not configured
Microsoft Defender Antimalware minimum version: Latest GA
This policy is the multi-session counterpart of Staff-Windows-Compliance-Policy. It drives the compliant-device signal that Conditional Access consumes for AVD session hosts and, by extension, for the user sessions running on them. A non-compliant session host is excluded from the host pool by Nerdio drain-mode until reimaging restores it.

## 5. Technology Architecture
The technology architecture has three planes. The endpoint plane (corporate Entra-joined laptops and unmanaged BYOD devices running the Windows App) is the user's point of access. The AVD compute plane (Windows 11 Enterprise Multi-Session session host VMs managed by Nerdio in an Azure hub-spoke network) is where applications and data are processed. The supporting services plane (Entra ID, Intune, Azure Files Premium, Compute Gallery, Defender for Endpoint, Zscaler) provides identity, management, storage, security and outbound web egress.

### 5.1 Technology Component Standards
The following technology component standards apply to this design. Each component is either already approved in APM's reference architecture or is introduced and recommended for approval as part of this design.

| Domain | Component Standard | Status |
| --- | --- | --- |
| Endpoint OS (corporate) | Windows 11 Enterprise 24H2 | Approved (laptop SOE) |
| Endpoint client | Microsoft Windows App (latest GA) | Approved (used in Job Seeker Kiosk) |
| Session host OS | Windows 11 Enterprise Multi-Session 24H2 | New, approval requested |
| Identity | Microsoft Entra ID P2 | Approved |
| Device management | Microsoft Intune | Approved |
| AVD orchestration | Nerdio Manager for Enterprise (current GA) | Approved (Job Seeker Kiosk) |
| AVD service tier | Azure Virtual Desktop, pooled host pool, breadth-first load balancing | New, approval requested |
| VM sizing baseline | Standard_D8s_v5 (8 vCPU, 32 GB) - tunable per host pool | New, baseline recommendation |
| VM disk | Premium SSD (P10 / P30 OS disk, ephemeral OS where appropriate) | Approved |
| VM security profile | Trusted Launch (Secure Boot + vTPM) | Approved |
| Image store | Azure Compute Gallery with regional replication | New, approval requested |
| Profile storage | Azure Files Premium provisioned tier, Entra Kerberos authentication | New, approval requested |
| Endpoint security | Microsoft Defender for Endpoint (laptop) and Defender for Servers Plan 2 (session host as endpoint class) | Approved |
| Web filtering | Zscaler Internet Access via existing tenant | Approved |
| Network egress | Azure NAT Gateway per spoke | Approved (Job Seeker pattern) |
| DNS | Azure DNS Private Resolver in hub VNet | Approved (Job Seeker pattern) |
| Audit and monitoring | Azure Monitor + Log Analytics workspace | Approved |

### 5.2 Integration standards and patterns
Integration is intentionally minimal. The AVD solution does not introduce new APIs or persistent integrations beyond the standard Microsoft cloud surface and Nerdio management.
The integration pattern is identity-led: every interaction between the session host and any Microsoft 365 service is authenticated via Entra ID OAuth 2.0 / OIDC tokens. Sub-system to sub-system calls (Nerdio to Azure Resource Manager, Intune to session host) are over native cloud APIs using managed identities or service principals.
No bespoke middleware, API gateway, or message broker is introduced by this design.

### 5.3 Network & Infrastructure Standards & Patterns
The network architecture follows the hub-spoke pattern established for the Job Seeker Kiosk solution. Per region, one hub VNet provides shared services (DNS Private Resolver, NAT egress, Gateway Subnet reservation for future hybrid connectivity), and one AVD spoke VNet hosts the session host pool, the FSLogix file share private endpoint, and supporting private endpoints.
Kiosk-style cloud-native ingress is reused: AVD session traffic uses the Microsoft-managed reverse-connect transport over the public internet. There is no inbound port opened to the spoke. Outbound from the spoke goes through a dedicated NAT Gateway with NSGs restricting traffic to known Microsoft service endpoints and the Zscaler tunnel for general web egress.

##### Subnets (per region)

| Subnet | Example CIDR | Purpose |
| --- | --- | --- |
| snet-avd-session-hosts | 10.X.1.0/24 | AVD session host VMs and Nerdio scale-set objects |
| snet-avd-private-endpoints | 10.X.2.0/27 | Private endpoints for Azure Files (FSLogix), Compute Gallery, Storage (App Attach), and Key Vault |
| snet-avd-app-attach | 10.X.2.32/27 | Optional - dedicated subnet for App Attach storage account private endpoint if isolation required |
| GatewaySubnet (hub) | 10.X.5.0/27 | Reserved for future hybrid connectivity (ExpressRoute / VPN) |
| AzureFirewallSubnet (hub) | 10.X.6.0/26 | Reserved for future centralised egress |
| snet-shared-service (hub) | 10.X.3.0/27 | DNS Private Resolver, Hybrid Runbook Worker (shared with Job Seeker) |
| snet-dnspr-inbound (hub) | 10.X.4.0/28 | DNS Private Resolver inbound endpoint |
| snet-dnspr-outbound (hub) | 10.X.4.16/28 | DNS Private Resolver outbound endpoint |

### 5.4 Technology component Deployment Patterns
Deployment of the AVD solution follows three patterns: golden image build and replication, host pool lifecycle through Nerdio, and policy delivery through Intune. Each is detailed below.

#### Golden Image Build and Replication
The golden image is the heart of the SOE delivery. A change to the image is the primary mechanism for delivering updates, application packaging, and configuration drift remediation across the host pool. The image is built once per region, versioned, and replicated to a regional Compute Gallery for fast VM provisioning.
Image build runs on an Azure VM provisioned from the Microsoft Marketplace Win 11 Enterprise Multi-Session 24H2 image
M365 Apps for Enterprise (current channel) installed with Shared Computer Activation enabled
Microsoft Teams installed with the AVD optimisation pack
FSLogix agent installed and configured per the APM-AVD-FSLogix-ProfileContainer profile
Microsoft Edge (latest current channel), Visual C++ runtimes, .NET runtimes installed
Baseline LOB applications installed (per DR-006 mixed-delivery: only the apps that must be in the image)
Nerdio Manager extensions and Azure Monitor / Defender agents installed
Sysprep with /generalize /oobe /shutdown
Image captured to Azure Compute Gallery (gal-apm-avd-staff) as a versioned image definition (img-apm-avd-staff-w11-ms-24h2)
Image replicated to the production region (Australia East) and any additional regions in scope
Validation host pool reimaged from the new version for smoke testing (sign-in, profile load, app launch, Teams call, Office activation)
Promotion to production host pool through Nerdio image-update workflow with drain-mode reimaging

#### Host Pool Lifecycle through Nerdio
Nerdio Manager for Enterprise is the operational interface for the host pool. It orchestrates VM provisioning from the Compute Gallery image, auto-scale based on session count and schedule, drain-mode reimaging during patch cycles, and host pool capacity management.
Host pool name: APM-AVD-HP-StaffPooled-AUE
Host pool type: pooled, breadth-first
Maximum sessions per host: 8 (initial baseline for D8s_v5; tuned during pilot)
Validation pool: APM-AVD-HP-StaffPooledValidation-AUE (one host, latest image version, drained except during validation)
Auto-scale schedule (Australia East): scale-out from 06:30 AUE; full capacity from 08:00; scale-in from 18:00; off-peak minimum 5 percent of peak capacity
Auto-scale buffer: maintain at least one available standby host during business hours
Reimage cadence: monthly, drained per host, no in-session interruption
Reimage on disconnect: not applied (profiles persist across sessions; reimage is image-update driven, not session-driven)
Patching policy: reimage replaces in-place Windows Update; in-image patching only

#### Intune Policy Delivery
Session hosts enrol in Intune at Entra Join. Dynamic device group APM-AVD-SessionHosts auto-includes any device whose name matches the pattern vmavd-stf-* and whose Entra ID join type is Cloud-only Azure AD Joined. All 14 reused policies and all AVD-specific profiles target this group. Policy applies on a 60-minute MDM check-in cycle.
Application Control for Business enforcement is applied through the same Intune profile that governs the laptop fleet. The Defender for Endpoint feed reports policy hits to APM Cyber Security in the existing reporting stream.

#### Windows App Deployment to Endpoints
Two endpoint contexts are in scope. Corporate Entra-joined laptops receive Windows App through Intune as a required Microsoft Store app deployment. Personal devices download Windows App directly from Microsoft (Microsoft Store on Windows 11; the App Store on macOS; Google Play on Android; the App Store on iOS).
No installation guidance is shipped to BYOD users beyond a short instruction card hosted on the APM intranet (or sign-in landing page). The first-run experience for the user is: install Windows App, sign in with APM identity, see the APM AVD workspace, click the Staff Desktop icon, sign in again to the session, work.

#### DNS
AVD session hosts use the Azure DNS Private Resolver in the hub VNet as their primary DNS resolver. The Private Resolver's inbound endpoint IP is configured as the spoke VNet's custom DNS server. Private endpoints for Azure Files, Compute Gallery, Storage, and Key Vault use Azure-private DNS zones linked to both hub and spoke. Microsoft cloud service FQDNs (Entra ID, Intune, AVD control plane, M365) resolve to public IPs via the Private Resolver's outbound forwarding.

#### Zscaler
Outbound web traffic from the AVD session is routed through APM's existing Zscaler tenancy. The session-host build includes the Zscaler Client Connector installed in machine mode. Existing Zscaler categories (block adult, gambling, explicit, violence, illegal; allow Facebook, approved AI tools, all managed Edge bookmarks) apply unchanged to AVD users.
Web filtering on AVD therefore matches the user's existing laptop SOE experience. The same allow-list and SmartScreen domains apply.

#### Printing
Pending decision. To be populated when the printing architecture is confirmed. The most likely path is Microsoft Universal Print: printers register with the Universal Print service via the Universal Print connector deployed at each site (or natively where the printer supports it). The AVD session host has Universal Print connector integration in the image, and the user prints to their site queue authenticated by Entra ID. Universal Print does not require hybrid network connectivity from AVD to the site networks.
Alternatives under consideration: AVD client-side printer redirection (only when the user's endpoint is on the site LAN with the printer); third-party cloud-print (Printix, ezeep); direct IP printing over hybrid connectivity to each site (heavy operational burden at 150 sites and not recommended).
This section will be revised when the decision is taken (DR-010).

#### Mapped Network Drive
Pending decision. To be populated when the backend for the existing mapped network drive is confirmed. The design path depends on the share type:
If the mapped drive is a SharePoint document library, the AVD session host accesses it through the SharePoint Online client and the user maps the library via OneDrive sync or direct browser. No hybrid network is required.
If the mapped drive is an Azure Files share, the session host mounts it over private endpoint with Entra Kerberos or service-principal-managed authentication. No hybrid network is required.
If the mapped drive is an on-premises SMB share, the session host requires hybrid connectivity (ExpressRoute or site-to-site VPN) from the AVD spoke to the on-premises network. The GatewaySubnet reserved in the hub supports this without re-addressing.
This section will be revised when the decision is taken (DR-011).

## 6. Information & Data Architecture

### 6.1 Information Model
The AVD solution does not introduce a new data store. User-generated data lives in three places: within the active session (RAM, temporary disk on the session host), within the user's FSLogix profile container on Azure Files Premium, and within the Microsoft 365 services that the user interacts with from inside the session (Exchange Online mailbox, SharePoint Online, OneDrive, Teams).
The information model is therefore:

| Data type | Storage location | Lifecycle |
| --- | --- | --- |
| Session state | Session host VM (volatile) | Removed when session signs off; lost on host reimage |
| User profile (NTUSER.DAT, AppData, Desktop, Documents, OneDrive cache, Outlook OST, Teams cache) | FSLogix VHDX in Azure Files Premium per user | Persists across sessions; 30 GB dynamic per user; cleaned up on user deprovisioning |
| Mail data | Exchange Online mailbox + Outlook OST in FSLogix | Subject to existing Exchange retention |
| Files (work documents, downloads) | SharePoint Online / OneDrive synced through FSLogix-contained OneDrive client | Subject to existing OneDrive/SharePoint retention policies |
| Teams chat and meeting recordings | Microsoft 365 (Teams + SharePoint backing store) | Subject to existing Teams retention |
| Browser data (Edge profile, history, cookies, saved passwords - if any) | Edge profile within FSLogix container | Persists in profile; password manager disabled per Edge baseline |

### 6.2 Information Classification
Data classification on AVD matches the laptop SOE classification model. The AVD solution processes APM internal information including job seeker personally identifiable information (PII), employment service records, internal correspondence, and operational data. Classification levels follow the APM data classification standard.
Data is not classified as a function of being on AVD versus laptop. The classification follows the data; the platform applies controls equivalent to or stronger than the laptop SOE.
Key controls that bear on classification:
Encryption in transit: TLS 1.2+ on all session traffic, SMB 3.x encrypted to Azure Files, TLS to all M365 services.
Encryption at rest: Azure Storage Service Encryption on session host disks, FSLogix container files, and Azure Files. Customer-managed key option available if required by classification escalation.
Data sovereignty: All AVD compute and FSLogix data resides in Australia East for AU staff. Subsequent regions follow data sovereignty rules of their respective jurisdictions.
Data egress control: clipboard, drive, and USB redirection are constrained at the RDP property level. BYOD sessions cannot pull data out of the session by default.

### 6.3 Data Lifecycle on AVD
User data on AVD follows a managed lifecycle. The lifecycle is identical to the laptop SOE for cloud-stored content (mail, OneDrive, SharePoint) because both surfaces interact with the same Microsoft 365 backend. The difference is the profile lifecycle, which on AVD lives in the FSLogix container rather than on a physical disk.
User joins APM, Entra ID account provisioned, AVD entitlement granted via group membership
First sign-in to AVD: FSLogix container created on Azure Files Premium, 30 GB dynamic. User receives default profile.
Active use: profile and cached data persist in the FSLogix VHDX across every session and every session host
Idle: profile remains on the share. Storage cost continues at the provisioned tier.
User leaves APM: Entra ID account disabled. AVD entitlement removed.
After a confirmed retention period (default 90 days), the FSLogix container is soft-deleted on Azure Files
After retention plus 30 days, the container is hard-deleted, subject to any legal-hold flag set in the FSLogix lifecycle workflow
FSLogix containers are backed up via Azure Files share snapshots at a defined cadence (daily, with a 30-day retention as the initial recommendation). Snapshot policy is set on the share at provisioning time.

## 7. Cyber & Security Architecture
Cyber and security architecture for the Standard User SOE on AVD inherits the laptop SOE baseline and extends it with controls intrinsic to a multi-session, BYOD-capable virtual desktop. The controls below are designed to maintain APM's existing RFFR alignment, preserve ASD ISM compliance posture, and enforce the BYOD versus corporate trust boundary at the identity and session layer.

### RFFR Alignment
APM operates under the Workforce Australia Service Deed, which requires compliance with the Right Fit for Risk (RFFR) cybersecurity accreditation framework administered by DEWR. RFFR is based on ISO 27001 and the ASD ISM. RFFR compliance is managed under APM's existing ISMS with the Compliance Manager as responsible owner and Cyber Security providing assurance.
This design preserves the RFFR controls established for the laptop SOE: hardened OS baseline, hardened Office, hardened browser, EDR coverage, application control in enforcement, BitLocker-equivalent data-at-rest encryption (provided by Azure platform encryption on session host disks and Azure Files), audit logging, and access governance. No RFFR control is lost by moving a user from laptop SOE to AVD SOE.

### Identity and Access Control

#### Entra ID Groups

| Group | Type | Purpose |
| --- | --- | --- |
| APM-AVD-Users | Security group | All staff entitled to AVD access. Drives AVD app group assignment and FSLogix share entitlement. |
| APM-AVD-Users-Corporate | Dynamic security group | Users currently signed in from a compliant Entra-joined corporate device. Drives the corporate-context application group attachment. |
| APM-AVD-Users-BYOD | Dynamic security group | Users currently signed in from an unmanaged device. Drives the BYOD-context application group attachment with redirection constraints. |
| APM-AVD-SessionHosts | Dynamic device group | Auto-includes session host VMs by name pattern (vmavd-stf-*) and join type (Cloud AAD Joined). Target for all reused and AVD-specific Intune policies. |
| APM-AVD-Admins | Security group | Nerdio operators and AVD lifecycle administrators. PIM-eligible role assignments only. |
| APM-AVD-Image-Builders | Security group | Holds image-build identities permitted to write to the Compute Gallery. |
Encryption

#### Conditional Access Policies
Conditional Access enforces the BYOD versus corporate trust boundary. Three sets of policies apply: a global block of unmanaged Windows access to non-AVD M365 resources, an allow rule for the Windows App into AVD, and a set of session controls that govern what each context can do inside AVD.

##### CA-APM-AVD-BlockUnmanagedFromM365
Users: APM-AVD-Users (excluded: emergency-access admin accounts)
Cloud apps: Office 365 (covers Exchange Online, SharePoint Online, Teams, Graph, M365 admin centres)
Conditions: Device platforms = any; Device state = device is not marked compliant and not hybrid-joined
Grant: Block
Stops a personal device from reaching Outlook on the web, the SharePoint site, the Teams web client, or any Microsoft 365 admin surface.

##### CA-APM-AVD-AllowWindowsAppToAVD
Users: APM-AVD-Users
Cloud apps: Azure Virtual Desktop and Microsoft Remote Desktop client app IDs
Conditions: Client apps = Mobile apps and desktop clients (Windows App ID); Device platforms = Windows, macOS, iOS, Android
Grant: Require MFA; Sign-in frequency 12 hours; Persistent browser session = disabled
Explicitly allows the Windows App on any platform to authenticate to AVD with MFA. The user's BYOD endpoint is not trusted; the AVD session is trusted.

##### CA-APM-AVD-RequireCompliantForCorporateContext
Users: APM-AVD-Users
Cloud apps: All cloud apps except AVD
Conditions: Device platforms = Windows
Grant: Require device to be marked as compliant OR hybrid-joined
Re-asserts the existing baseline that any non-AVD M365 access from Windows requires a compliant managed device. Personal Windows devices fail this gate and only reach M365 through the AVD session.

##### CA-APM-AVD-SessionContextAppGroup
Users: APM-AVD-Users
Cloud apps: Azure Virtual Desktop
Conditions: filter for device.compliantDevice = true => add to APM-AVD-Users-Corporate; else => add to APM-AVD-Users-BYOD
Grant: implemented via group membership change, not a CA grant
Drives the corporate-versus-BYOD application group selection inside AVD. Practically implemented through Entra ID Authentication Context or a sign-in risk policy and a Logic App that mutates group membership; alternatively through two AVD application groups with separate user assignments managed via a sign-in driven workflow. The chosen pattern is documented in the build runbook.

##### CA-APM-AVD-RequireMFA
Users: APM-AVD-Users
Cloud apps: Azure Virtual Desktop, Office 365
Conditions: All
Grant: Require multi-factor authentication
MFA is mandatory for every AVD session sign-in. The existing APM MFA framework is reused (Authenticator app, FIDO2, or phone-as-fallback per APM standards).

### AVD Application Groups and Session Controls
Two AVD application groups are attached to the host pool. Both expose the same Desktop application. They differ only in the RDP property profile that governs redirection. User assignment to a group is driven by the corporate-versus-BYOD context evaluated at sign-in.

#### AG-APM-AVD-StaffDesktop-Corporate
Application: Desktop
Assigned to: APM-AVD-Users-Corporate
RDP property profile: clipboard, drive, audio, camera, smartcard, webauthn redirection enabled; USB and printer per policy

#### AG-APM-AVD-StaffDesktop-BYOD
Application: Desktop
Assigned to: APM-AVD-Users-BYOD
RDP property profile: clipboard disabled; drive redirection disabled; USB disabled; camera and audio enabled (required for Teams); printer redirection deferred to printing decision
The BYOD application group is the data egress boundary. A user on a personal device can see and interact with their AVD desktop but cannot copy content out of the session via clipboard or local file. Camera and microphone redirection remain to preserve the Teams experience.

### Office and Macro Hardening
Office hardening is delivered through APM-Win11-ACSC Office Hardening Guidelines, Win11 - OfficeMacroHardening-PreventActivationofOLE, and APM RFFR - O365 Digital Signing Controls (Phase 2). These three policies, scoped to the AVD device group, deliver the full Office hardening baseline on the session host. Macro execution requires V3 digital signing; OLE Packager prompts; legacy file format use is gated by the existing ACSC controls.

### Web Filtering and Browser Hardening
Web filtering uses the existing Zscaler tenancy. Browser hardening is delivered through APM-Edge-Hardened-Baseline-V1.1 and APM-Edge-Hardened-Baseline-V2.0-dev tools block. The Edge extension allowlist and the SmartScreen domain allowlist carry from the laptop SOE per DR-002. No AVD-specific tightening of Edge is applied in V1.0.

### Application Control for Business
The existing APM workstation Application Control for Business policy, which moved to enforcement on the laptop fleet through April-May 2026, is applied to AVD session hosts. Defender for Endpoint reports policy events into the existing APM Cyber Security monitoring stream. The AVD device group is added to the policy's assignment scope.

### Encryption
In transit: AVD session traffic uses TLS 1.2+; SMB to Azure Files uses SMB 3.x with encryption-in-transit forced; M365 traffic uses TLS
At rest (session host): Azure Managed Disk encryption with platform-managed keys; ephemeral OS disk where used inherits host encryption
At rest (FSLogix profiles): Azure Storage Service Encryption on Azure Files Premium with platform-managed keys
Customer-managed key (CMK) option: available for both managed disks and Azure Files if classification escalation requires it; not enabled in V1.0

### Data Sovereignty
Australian operations: all AVD compute, FSLogix profile data, Compute Gallery image storage, and supporting storage accounts reside in Australia East. Australian data does not leave the country except as part of standard Microsoft 365 service traffic (which APM has already accepted under existing tenancy agreements). When additional regions are added, the same single-region rule applies: a user's session compute and profile data reside in the region they sign in to.

### Audit and Monitoring
Diagnostic settings are enabled on the host pool, workspace, NAT Gateway, NSGs, and Azure Files share, sending logs to a Log Analytics workspace. AVD insights workbooks are enabled. Defender for Endpoint is installed on every session host and reports to the existing Defender tenancy. Intune compliance reporting covers the AVD device group. Nerdio audit logs are exported to the Log Analytics workspace via the Nerdio diagnostic export.

## 8. Service Availability and Disaster Recovery

### 8.1 Business Service Tiering
The Standard User SOE on AVD is classified as a Tier 2 business service: business-critical, where an extended outage impacts staff productivity across the organisation and directly affects APM's ability to deliver employment services. Tier 2 services target an availability of 99.9 percent and a recovery time objective (RTO) of four hours, with a recovery point objective (RPO) of 24 hours.
The classification is more stringent than the Job Seeker Kiosk solution (Tier 3) because staff productivity loss carries higher organisational impact than a temporary degradation of job-seeker self-service. It is less stringent than core revenue or compliance systems (Tier 1) because alternate work modes exist: staff with corporate laptops continue working when AVD is degraded, and staff on AVD can move to a laptop if available.

### 8.2 Service Availability
Service availability is supported by:
Azure Virtual Desktop platform SLA of 99.99 percent for the AVD service control plane and gateway
Azure compute SLA on session host VMs (99.95 percent for Premium SSD-backed VMs in an availability set or 99.99 percent for availability zones; design baseline uses zones)
Azure Files Premium SLA of 99.9 percent for the FSLogix profile store
Nerdio Manager auto-recovery and host-pool capacity buffer (at least one warm standby host during business hours)
Health monitoring through Defender for Cloud and AVD insights with alerts to the APM Service Desk and Cyber Security
If the AVD service control plane fails (a Microsoft-side incident), session establishment is unavailable globally for the affected region. Users with corporate laptops fall back to laptop work mode. Users on BYOD have no alternative until the service is restored. This is an accepted residual risk at the Tier 2 classification.

### 8.3 Disaster recovery & Resilience
The AVD architecture is inherently resilient: the session is stateless except for the FSLogix profile, the image is versioned, and the host pool can be rebuilt from gallery within minutes. Disaster recovery for the staff AVD service relies on five mechanisms:
Image immutability: the golden image is versioned in Azure Compute Gallery. Reverting to a previous version is a Nerdio operation. Image corruption recovery is measured in minutes, not hours.
Host pool elasticity: if individual session hosts fail, Nerdio replaces them from the same image. No data is lost; the user reconnects to a new host and the FSLogix container mounts.
FSLogix snapshot policy: Azure Files share snapshots run daily and retain for 30 days. A user can be restored to a prior profile state if their profile is corrupted or accidentally cleared.
Regional pattern: regional independence is the primary DR posture. Each region runs its own host pool, FSLogix store, and image gallery replica. Inter-region failure does not cascade.
BCP fallback: where an entire region fails for an extended period, the affected user base falls back to laptop SOE (for corporate-laptop users) or pauses (for BYOD-only users). This is accepted as Tier 2 behaviour.
Cross-region FSLogix replication is not implemented in V0.1 per DR-012. It is a future option if the user base in a region grows beyond what can be absorbed by laptop fallback or if the classification escalates to Tier 1 for any user cohort.

## 9. Service Management

### 9.1 Service Management principles
Operation of the Standard User SOE on AVD follows APM's existing service management framework. The principles below apply specifically to this design:
All changes to the AVD solution follow APM's existing change management process and run through CAB where the change affects production capacity or security posture.
Golden image changes are tested in a validation host pool before promotion. No untested image reaches production.
Intune policy changes affecting AVD are deployed to a pilot device group before broad rollout.
Operational runbooks are maintained for image build, host pool patching, capacity scaling, FSLogix container lifecycle, and incident response.
Incident response on the AVD platform follows the existing APM major incident process, with the AVD product owner as the named technical lead during incidents.
Capacity planning reviews are conducted quarterly; auto-scale targets are tuned based on actual concurrency observed.

### 9.2 Monitoring, Logging, Reporting and Alerting
Telemetry from the AVD platform is collected into the existing APM Log Analytics workspace and Defender for Endpoint tenancy. The following sources are configured during build.

### 9.3 Patching Lifecycle
Patching on the AVD platform follows an image-replacement model. Session hosts are not patched in place. Updates flow through the image, the image flows through the gallery, and Nerdio reimages session hosts from the new version.
Image patched monthly: Windows cumulative update, Microsoft Edge, M365 Apps for Enterprise current channel, Defender signatures, FSLogix agent, AVD agents
Patched image deployed to the validation host pool first
Validation confirms session lifecycle (sign-in, profile load, Teams call, Office activation, app launch, sign-out)
Promotion to production via Nerdio image-update workflow; drain-mode reimaging respects active sessions
Out-of-band security image rebuilds run on a defined SLA when triggered by a high-severity advisory
Application Control for Business policy updates flow through Intune, not through the image. Defender for Endpoint and FSLogix update channels remain through their own services to minimise image rebuild cadence.

### 9.4 Implementation Sequence
The implementation is structured in five phases. Each phase has a defined entry criterion, deliverables, and exit criterion. Phases overlap where dependencies permit.

#### Phase 1 - Identity and Policy Foundation
Create Entra ID groups (APM-AVD-Users, APM-AVD-Users-Corporate, APM-AVD-Users-BYOD, APM-AVD-SessionHosts, APM-AVD-Admins, APM-AVD-Image-Builders)
Add APM-AVD-SessionHosts to the assignment scope of the 14 reused Intune policies
Author and assign AVD-specific Intune profiles (FSLogix, Session Limits, RDP Redirection Control, CMP-APM-AVD-SessionHosts)
Author and assign the Conditional Access policies (CA-APM-AVD-* set)
Establish the AVD entitlement licensing position with the licensing reseller / Microsoft

#### Phase 2 - AVD Infrastructure
Deploy regional hub and AVD spoke VNets, NAT Gateway, NSGs, DNS Private Resolver linkages
Deploy Azure Files Premium share for FSLogix and configure Entra Kerberos
Provision Azure Compute Gallery and define the image
Build the golden image (v1.0)
Create the AVD host pool, workspace, and corporate / BYOD application groups in Nerdio
Configure auto-scale schedule and reimage policy

#### Phase 3 - Pilot
Onboard a controlled pilot of 25 to 50 users across mixed personas (case worker, admin, manager)
Validate sign-in, profile load, Teams optimisation, Office activation, browsing, baseline LOB launch
Validate Conditional Access posture from a corporate laptop and from a personal device
Tune VM sizing, max sessions per host, FSLogix sizing, auto-scale parameters
Pilot exit: defined success metrics on sign-in latency, session stability, and user satisfaction

#### Phase 4 - Production Rollout
Open AVD entitlement broadly to staff via APM-AVD-Users group
Communicate self-service download and sign-in instructions for the Windows App
Monitor concurrency, scale events, and any policy non-applicable noise; address as it arises
Resolve the open decisions on printing (DR-010) and mapped network drive (DR-011) and revise the design

#### Phase 5 - Operational Handover
Hand over operational runbooks to Digital Operations
Stand up the standing monitoring and alerting; confirm Service Desk routing
RFFR alignment review with the Compliance Manager
Schedule the first quarterly capacity review

| Source | Mechanism | Captured Signal |
| --- | --- | --- |
| AVD host pool, workspace, app groups | Diagnostic settings | Connection events, session host availability, errors |
| Session host VM | Azure Monitor agent (AMA) | Performance, security events, AppLocker / WDAC, Defender |
| FSLogix logs | Custom log collection (CSE or AMA file watcher) | Container mount success/failure, sign-in performance |
| Defender for Endpoint | MDE cloud tenancy | EDR, threat detections, security alerts, WDAC enforcement |
| Intune | Native Intune reporting + Defender for Cloud Apps integration | Compliance state, policy assignment health, device inventory |
| Nerdio | Nerdio Audit + diagnostic export | Host pool operations, image lifecycle, auto-scale events |
| Azure Files (FSLogix store) | Diagnostic settings | SMB transactions, throttling, capacity |
| NAT Gateway | Diagnostic settings | Outbound flows, port allocation |
| NSGs | Flow logs | Allowed and denied traffic |
| Conditional Access | Entra ID sign-in logs | Sign-in conditions, CA evaluation outcome, blocked attempts |