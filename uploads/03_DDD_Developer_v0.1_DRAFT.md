
# Detailed Design Document

**Template V0.1**
10 May 2026

| Project Name: | Developer Standard Operation Environment |
| --- | --- |
| Document Owner: | the Head of Digital Transformation & Architecture,  <br> Head of Digital Transformation & Architecture |
| Contact Details: | [redacted]@apm.net.au |
| Program Name: |  |
| Division/Unit: |  |
| Document Status: |  |
| Document Version: |  |
| Product ID: |  |
FOR INTERNAL USE ONLY
Commercial in confidence
© APM

**Document control**

**Version History**

| Version | Date | Author | Key changes |
| --- | --- | --- | --- |
| V0.1 | 05/05/26 | the AVD Solution Engineer (Twiki Corp) | Creation |
|  |  |  |  |
Consultation

| Name | Position title | Date |
| --- | --- | --- |
|  |  |  |
|  |  |  |
References and Derivation

| Version # | Document Title | Reference Location |
| --- | --- | --- |
|  |  |  |
|  |  |  |
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

## Introduction

### Purpose
This document defines the design of APM's next-generation developer Standard Operating Environment (SOE), replacing the existing Platform Development Environment (PDE). It will serve as the reference for the build once APM has reviewed and approved it. The design covers platform choice, startup performance, image composition, profile and data persistence, endpoint security, identity and access, networking, Microsoft 365 integration, AI tooling, and the operational support model. It is written to design-document depth and is intended to directly support the build team.

### Audience
The intended audience is the teams responsible for reviewing, approving, implementing, and operating the developer SOE, including the developer team, APM IT, the platform engineering team, and the cybersecurity team. The document is also intended for review by the APM requirements author / technical approver, as the requirements author and APM technical approver, and by the Head of Digital Operations, as the business stakeholder for the service-catalogue and support-model decisions. Operations staff, support analysts, and ServiceNow catalogue owners will refer back to it for the runbook patterns referenced in the Support and Operations Model section.

## Overview

### Scope
This design covers the developer SOE end-to-end at design-document depth, including:
Platform selection (AVD, Windows 365, physical, Dev Box) and the recommended host pool model
AVD architecture
Profiles, persistence, and storage
Endpoint security
Identity and access
Pulse Dev production access
Microsoft 365 in AVD covering Teams, Outlook, and OneDrive
AI tooling and MCP support
Support and operations model

### Out of Scope
The following items have been deemed out of scope for the purpose of this design document:
An isolated dev/test Azure subscription (future-state requirement)
Some data engineering requirements are in scope, but they are addressed in the first 90-day remediation plan rather than through architectural decisions
GPU compute for local LLM inference is out of scope
A region-wide Australia East failure
Detailed commercial modelling

### Guiding Principles
The design is shaped by five principles applied consistently across every section.
Remove failure modes by design rather than configuration workaround
Prefer isolation over compensating control where security separation matters
Stage capabilities behind their gating controls
Reuse the kiosk infrastructure pattern where it fits
Make assumptions explicit and track them

### Assumptions
The design proceeds on the following assumptions about APM's environment. These have been detailed below.
AVD is the platform direction. Per-user persistent desktops across the entire developer population are not required
APM accepts the Pulse Dev personal (single-session) pool as the default
SNOW refers to ServiceNow which is the ITSM platform
MCP servers are local-only for v1
Defender for Endpoint Plan 2 is either deployed in the APM tenant
"Non-prod" at APM is scoped to a subscription or resource-group pattern that APM will designate
Azure Image Builder is a greenfield introduction
GitHub Advanced Security is enabled (or will be enabled) at the APM GitHub organisation level
Microsoft Sentinel is the SIEM, or an existing SIEM, that accepts the developer-platform Log Analytics workspace as a data source
ACR pull-through cache with Notation signing is acceptable as the container image supply chain

## Business Architecture

### Business Context
The existing PDE has three failure modes that this design must address. The first is a 15-minute welcome screen on cold start, compounded by a 5 to 10-minute function-app initialisation, making the worst-case time to a working desktop approximately 20 minutes every morning. The second is write-access instability: developers report that only %TEMP% is reliably writable, preventing them from saving scripts and repositories to standard locations. The third is tooling lockout: the existing PDE blocks installation of Visual Studio 2022, Teams, Outlook, and a range of other tools that are core to APM developers' daily work. The design removes all three failure modes by design, not by configuration workaround.

### Business Requirements
The following requirements are drawn from the “Dev laptop requirements – old and new.xlxs” spreadsheet, specifically the “as at 3.10.25” sheet. Each requirement below is mapped to the requirements spreadsheet and is expressed typically as a user story with acceptance criteria and priority.

| Domain | Requirements |
| --- | --- |
| Performance and startup | <3 min cold start, Zscaler must not degrade, 5,000+ IOPS, resilience |
| Security and access | R-03 (developer-aware AV/EDR), R-12 (non-prod autonomy), R-13 (PowerShell/Az CLI in non-prod), R-14 (pre-approved patterns), R-20 (Pulse Dev production access from primary identity), R-24 (unrestricted access to GitHub, NuGet, Azure Artifacts) |
| Tooling | R-04 (containers), R-08 (self-service install incl. VS 2022/2025), R-09 (resilient package pipeline), R-10 (built-in AI tooling), R-11 (MCP and orchestration), R-17 (Office 365, Teams), R-23 (Linux/WSL2) |
| Profiles and data | R-06 (persistent profiles), R-07 (guaranteed writable standard paths) |
| Onboarding and platform | R-16 (Windows 11), R-18 (role/team-based onboarding) |
| Support and service model | R-15 (PDE ownership, Service Catalogue), R-21 (streamlined dev support workflows) |
| UX | R-25 (multi-monitor, clipboard, file transfer) |
| Future / out of scope | R-22 (isolated dev/test subscription or tenant) |
| Data Engineer (Appendix A) | R-26 to R-34 |

### Decision Register
The table below records the architectural decisions made in this design, the alternatives considered, and the location of each decision’s details.

| Decision | Choice | Alternatives Considered | Rationale | Reference |
| --- | --- | --- | --- | --- |
| Platform | Azure Virtual Desktop | Windows 365 Cloud PC, physical Windows 11, Microsoft Dev Box | AVD is 40-50% cheaper than Win365 at expected utilisation; physical fails R-19 (multi-day rebuild on loss); Dev Box closed to new customers Nov 2025 | Platform Selection |
| Host pool model | Two pools – pooled multi-session (primary) plus personal single-session (Pulse Dev) | Single pooled pool for both; personal pool for both | Closes token-theft path on Pulse Dev PIM activation while keeping primary-pool economics; hibernation cuts Pulse Dev cost gap | Platform Selection, AVD Session Host Architecture |
| Image pipeline | Azure Image Builder with Git-backed template, two-ring rollout | MDT, Autopilot only, manual | AIB integrates with Azure Compute Gallery, supports SBOM and signing | Image, Tooling, and Self-Service |
| Container runtime | Podman Desktop default; Docker Desktop on request | Docker Desktop default | Docker Desktop Business licence at APM scale could be costly; Podman is OSI-licensed | Image, Tooling, and Self-Service |
| Profile storage | FSLogix on Premium ZRS Azure Files | Standard/Premium LRS, Cloud Cache | ZRS survives single-AZ failure; Premium tier required for sub-30-second mount in cold-start budget | Profiles, Persistence, and Storage |
| Backup | OneDrive Known Folder Move (per-machine) | Per-user OneDrive, third-party backup | Per-user OneDrive not supported on multi-session; KFM gives implicit off-host backup with no developer action | Profiles, Persistence, and Storage |
| Network filtering | Zscaler at physical endpoint, not on session host | Zscaler on session host, no Zscaler | Zscaler per-user tunnel not supported on Win11 multi-session; defender web protection compensates on the session host | Network & Infrastructure, Web Filtering |
| Identity (non-prod) | Standing Reader plus PIM-eligible Contributor | Standing Contributor; per-team SP credentials | Speed on non-prod; full audit trail; eliminates stored SP secrets | Identity and Access Control |
| Identity (Pulse Dev prod) | Personal AVD pool plus PIM elevation, phishing-resistant MFA, 4h activation | Multi-session with PIM; PAW exclusively | PAW remains the hardened option for the strongest-separation cohort | Identity and Access Control |
| Deployment from CI/CD | OIDC workload identity federation | Stored service principal client secrets in GitHub | Eliminates the most common credential-leak vector | Identity and Access Control |
| AI tooling | GitHub Copilot Business plus VS Code MCP with allowlist | Copilot Business without MCP; third-party assistants | Business tier doesn't train on customer code; MCP allowlist is the gating control for Phase 3 enablement | AI Tooling and MCP Support |
| Container image supply chain | ACR pull-through cache with Notation signing | Direct Docker Hub | Direct Docker Hub remains permitted only as a fallback | Image, Tooling, and Self-Service |
| SIEM | Microsoft Sentinel (or existing SIEM via connector) | Sentinel-only; vendor-supplied SIEM only | Allows APM to extend an existing investment; meets SOC 2, Privacy Act, ISO 27001 retention | Monitoring, Logging, Reporting and Alerting |

## Technology Architecture

### Platform Selection
The recommended platform is AVD. Two host pools have been proposed: a primary developer pool for the general developer population running pooled multi-session, and a dedicated personal pool for Pulse developers. The driver behind the latter is the Pulse developers’ requirement for access to the production environment(s) due to the risk of a token-theft lateral-movement path to Azure subscriptions on multi-session hosts.
This recommendation is also driven by the defined requirements. Three-minute cold start maps to AVD scaling plans and warm pools. Container support requires nested virtualisation, available on AVD D-series VMs. Resilience maps to FSLogix profile containers on ZRS Azure Files. Multi-monitor, clipboard, and file transfer are native AVD. Performance (5,000+ IOPS) is achieved with Premium SSD OS disks and Premium ZRS Azure Files for the profile share.
Another option considered was Microsoft’s Dev Box; however, it is now closed to new customers as of 1 November 2025, and Microsoft is directing enterprise developer scenarios to Windows 365 instead. Thus, Microsoft Dev Box was ruled out.

| Option | Relative Cost | Cold-Start | Resilience | Container Support | Pulse Dev Fit |
| --- | --- | --- | --- | --- | --- |
| AVD pooled multi-session | Lowest at scale | <3 min with scaling plan | High – profile on ZRS Files | Full – nested virtualisation on D-series | Not recommended – token-theft risk on PIM activation |
| AVD personal (hibernation) | Medium | <3 min with hibernation | High – profile on ZRS Files | Full – nested virtualisation on D-series | Recommended default for Pulse Dev |
| Windows 365 Cloud PC | Highest (fixed/user) | Always-on, no cold start | High | Limited on smaller SKUs | Adequate |
| Physical Windows 11 | Lowest per device | Minutes to days (rebuild) | Low | Full | Poor |
At 50% session utilisation, pooled AVD multi-session is approximately 40-50% cheaper per active developer than an equivalent Windows 365 Cloud PC SKU. The Pulse Dev personal pool runs approximately 30%-40% higher per Pulse Dev than their equivalent share of a pooled multi-session host, because each Pulse Dev occupies a full VM rather than sharing one. Given the small Pulse developer population, the absolute dollar impact is low and is justified by the security separation. This is based on the assumption that APM considers the token theft risk sufficiently high to warrant this approach. If this assumption is incorrect, the Pulse Devs could use the pooled multi-session AVD.

### AVD Session Host Architecture

#### VM Sizing
It should be noted that without a detailed understanding of each developer’s workflows, this VM sizing is based on some assumptions. Where the assumptions are incorrect, the sizing can be adjusted.
Session hosts run on the Dsv5 series, which supports nested virtualisation and sits within the AVD-recommended 4 to 24 vCPU band.

| SKU | vCPU | RAM | OS Disk | Nested Virt. | Use Case |
| --- | --- | --- | --- | --- | --- |
| Standard_D8s_v5 | 8 | 32 GiB | Premium SSD P30 | Yes | Baseline developer session host (primary pool and Pulse Dev personal pool) |
| Standard_D16s_v5 | 16 | 64 GiB | Premium SSD P40 | Yes | Escalation for data engineering or heavy build teams |
The D8s_v5 is the default, with an escalation to D16s_v5 where it is justified based on profile/resource saturation.

#### Host Pools

| Pool | Type | Max Sessions/Host | Baseline Hosts | Max Hours | AZ Distribution |
| --- | --- | --- | --- | --- | --- |
| hp-apm-dev-primary | Pooled multi-session | 8-12 (validate UAT) | 2 | 6 | AZ 1, AZ 2 |
| hp-apm-dev-pulse | Personal single-session | 1 | 2 | 6 | AZ 1, AZ 2 |
The primary pool session limit (8-12 per host) is an initial estimate based on the D8s_v5 compute budget at expected developer workload profiles. This must be validated during UAT before go-live; adjust downward if CPU or memory saturation occurs during peak build times.
The Pulse Dev pool is a personal, single-session pool. Each Pulse Dev is assigned to their own VM. The session limit of 1 is not configurable; it is a property of the personal pool type. VM hibernation (GA for single-session AVD) is the primary cost-control mechanism for the Pulse Dev pool: VMs hibernate when disconnected and resume on reconnect rather than running idle. This brings the Pulse Dev cost closer to pooled multi-session economics during off-hours.
Clipboard redirection and file-transfer redirection are set to one-way only (endpoint to session, not session to endpoint) in the host pool RDP settings. This applies to both pools. Developers can paste content into a session from their physical endpoint; they cannot paste out of the session to the endpoint without going through a managed channel. This is a compensating control for the DLP gap.
Assumption: APM source code is not in scope for Purview sensitivity labels in this design document.

#### Startup Performance and Scaling Plan
The existing PDE worst-case is approximately 20 minutes: 15-minute welcome screen plus 5 to 10 minutes of function-app initialisation. The three-minute target is met by layering four mechanisms.

| Mechanism | How it Works | PDE Baseline | Target |
| --- | --- | --- | --- |
| AVD Scaling Plan Ramp-up | Hosts are warm before first user signs in | 15-min welcome screen | Session connects to already-running host |
| Start VM on Connect | Safety net for off-hours sign-ins or Pulse Dev hibernation resume | 5-10 min function-app start | <3 min (VM boot or hibernation resume) |
| FSLogix Profile Tuning | Lean profile, Office Container split, excluded build artefacts | Profile mount adds to welcome time | Sub-30 sec mount |
| Image Bake | All core tools pre-installed; Intune per-team extras post-login | Install-on-first login | Desktop ready before extras finish |
Ramp-up adds idle VM cost for the 45 minutes between host start and first user arrival. At D8s_v5 on-demand pricing, one idle host costs approximately AUD 0.75-1.00 per hour. Reserved Instance pricing reduces this by approximately 30%. That cost is the price of the cold start guarantee. Set against the productivity cost of 20-minute morning starts across the developer population, it is straightforward to justify.

#### Scaling Plan (Primary Pool)
The scaling plan triggers can be adjusted based on APM requirements and UAT.

| Phase | Trigger | ACTION |
| --- | --- | --- |
| Ramp-up | 07:15 AEST daily | Start sufficient hosts for 80% of expected peak session count |
| Peak | 08:00-18:00 AEST Mon-Fri | Maintain capacity; scale out at 60% load threshold |
| Ramp-down | 18:00 AEST | Scale in; drain sessions to minimum host count (1) |
| Off-peak | 18:00-07:15 AEST | 1 host running; Start VM on Connect as safety net |
The Pulse Dev pool scaling schedule is replaced by the hibernation model: VMs hibernate on disconnect and resume on Start VM on Connect, so no separate scaling plan is required.

##### Post-Boot Patch Compliance
Before a session host is marked available in the pool, a post-boot initialisation script runs Windows Update and a Defender signature update. The host is held in AVD drain mode during this window, so it does not accept user connections while potentially carrying an outstanding patch. A host with an unresolved critical patch is reported as unhealthy to the AVD health subsystem and does not receive sessions until the patch is applied.

##### Image Rebuild Cadence and Session Cleanup.
Session hosts are reimaged weekly, aligned with the image promotion cycle, closing the window during which secrets written to C:\Windows\Temp or C:\Temp could persist on a long-running host. A GPO or Intune logoff script clears those paths at each session logoff for within-session cleanup, while FSLogix profile exclusions for %LOCALAPPDATA%\Temp and %TEMP% prevent credential-store files from persisting inside profile containers across sessions.
The Dev Drive is per-host; uncommitted build state on it is lost at reimage. Developers are expected to commit work in progress to a Git branch before the close-of-business drain. This work commit process is not enforced programmatically in this design.

## Network Infrastructure

### Network and Hub-Spoke
The session-host VNet architecture follows the hub-and-spoke pattern established in the APM Job Seeker Kiosk Infrastructure Specification, using vnet-apm-hub and a new AVD spoke VNet (vnet-apm-avd-dev) that is peered with the hub. The kiosk design document serves as the reference for the hub topology, DNS Private Resolver, NAT Gateway, NSG patterns, and private-endpoint configuration; it includes only the AVD-specific concerns. Subnets follow the same naming convention: snet-avd-dev-session-hosts, snet-avd-dev-private-endpoints, snet-avd-dev-management.

### Infrastructure as Code
The AVD landing zone is committed to Bicep. Infrastructure as Code (IaC) sits in the same Git repository as the AIB template, under the same PR-review governance. Azure Policy provides drift detection for key security configurations:
Private-endpoint-only on the FSLogix storage account (stgapmdevprofiles)
NSG rules on snet-avd-dev-session-hosts that match the approved outbound allowlist
Conditional Access policy state. A portal-driven egress rule change on snet-avd-dev-session-hosts triggers an Azure Policy non-compliance alert to the PDE owner.

### Image, Tooling and Self-Service

#### Three-Layer Model
The SOE tooling model has three layers: baked image, baseline Intune app assignments, and developer self-service.
The image contains everything a developer needs on first login. Baseline Intune Win32 app groups push per-team tooling after sign-in, before the developer has reached a productive state, but without blocking the desktop. Self-service via Winget and the Intune Company Portal handles the long tail of individual tool preferences.

#### Image Contents
Azure Image Builder is the proposed image pipeline. The image is built on a schedule and replaces session hosts on a rolling basis during off-peak windows, using the two-ring rollout process described in the Image Rollout and Rollback section.

| Component | Install-Order Sensitive | Notes |
| --- | --- | --- |
| Windows 11 Enterprise multi-session | Base | Patched to current before bake; SHA256 checksums verified on all downloaded binaries before execution |
| AVD agent stack | After OS | Required for pool registration |
| FSLogix agent | After AVD agents | Profile mount must be in place before user tools |
| Microsoft Defender for Endpoint | After FSLogix | Onboarding package applied at image time |
| Microsoft Office (Word, Excel, PowerPoint, OneNote) | After Defender | Per-machine install |
| New Teams client (SlimCore) | After Office | Per-machine install; see Microsoft 365 section |
| OneDrive | After Office | Per-machine install |
| Visual Studio 2022 (Community or Enterprise per licence) | Before SQLLocalDB | Install-order dependency |
| SQLLocalDB 2022 | After VS 2022 | VS 2022 installer registers the prerequisite path |
| VS Code | No constraint | Extensions deployed per-user via Intune or settings sync; includes IDE-level dependency scanner (Snyk or GHAS extension) |
| Git | No constraint | Latest stable; git on PATH; includes Git Credential Manager (DPAPI-backed PAT storage) |
| gitleaks | No constraint | Pre-commit hook configured by default; prevents secrets reaching Git remotes |
| Windows Terminal | No constraint | Default shell profile set to PowerShell 7 |
| PowerShell 7 | No constraint | Side-by-side with Windows PowerShell 5.1 |
Podman vs Docker Desktop
Docker Desktop's licence requires a Business subscription. Podman Desktop is the default container runtime; Docker Desktop is available on request through Company Portal for teams with a documented dependency. Podman compose provides Compose v2 compatibility, though not zero-friction for teams with hard Docker Desktop assumptions.

### Per-Team Intune App Groups
Three Entra security groups drive per-team baseline app assignments via Intune Win32.

| Group | Assigned Tooling |
| --- | --- |
| SG-Dev-Apps-PulseDev | Pulse-specific tooling, Redgate suite, Azure Data Studio, additional Azure CLI extensions |
| SG-Dev-Apps-DataEng | Azure Data Studio, Synapse/Databricks CLI, miniforge-conda, Jupyter, Spark tooling |
| SG-Dev-Apps-Generic | Greenshot (pending Q-13 on GPL posture), additional Git tools, preferred terminals |

### Self-Service
Developers install tools not in the baseline via Winget (Microsoft Store source and curated corporate catalogue) for public packages, or the Intune Company Portal for licensed, signed, or internally packaged tools. There is no first-party private Winget feed as of May 2026; internal tools not in the public source are packaged as Intune Win32. Chocolatey is not used unless APM already runs a Choco repository.
Machine-wide package source enforcement is via package source policies, which are enforced at the machine level. Intune MDM policy restricts Winget source modifications. Machine-wide .npmrc under a system-owned path sets npm's default registry to APM's feed. A session-start Intune validation script checks these and logs to Azure Monitor; an alert fires on configuration drift.
The container image supply chain is managed with developers pulling from an Azure Container Registry pull-through cache rather than directly from Docker Hub. The cache is configured with Notation image signing; unsigned images are rejected. Defender for Endpoint ASR rules alert on the internet-package-manager binary being executed from developer sessions.
Capability Enablement Staging enables all capabilities simultaneously on day one, without the supporting monitoring infrastructure, which creates an operational burden that a small platform team cannot sustain. Capabilities are enabled in three phases.
Phase 1, day 1:
Git
VS Code
VS 2022
PowerShell 7
Az CLI
Defender for Endpoint
FSLogix
Teams
Office
Python
Node
.NET SDK
OneDrive KFM.
Phase 2, first 30 days:
WSL2 with Defender MDE plug-in health monitoring active
Podman
winget self-service with machine-level source-restriction policy enforced
ACR pull-through cache online
Phase 3, 60 to 90 days:
MCP server frameworks (langchain-mcp-adapters, fastmcp)
local LLMs (Ollama, LM Studio),
GitHub Copilot

### Image Rollout and Rollback
New image versions are promoted through two rings: a pilot ring of one or two hosts (held in a separate Intune assignment group, staffed by the PDE owner plus one developer from the pilot cohort) and a GA ring covering the remainder of both pools. Promotion from pilot to GA requires a passing automated smoke test and explicit sign-off from the PDE owner. This rollout model prevents the existing PDE's "15 devs offline while Steven scrambles" failure pattern.
The smoke test exercises remote desktop session connect, Visual Studio 2022 launch, git clone of a known internal repository, dotnet build of a known sample project, and npm install of a known sample package manifest. Steps run in sequence; any failure blocks promotion and logs to Azure Monitor.
Azure Compute Gallery retains at minimum the previous two gallery image versions in addition to the current version, providing a rollback target without manual action. The rollback procedure on a failed pilot or post-GA failure is:
Put affected hosts into drain mode
Force-disconnect active sessions
Update the host pool image reference to the previous approved gallery version
Re-image affected hosts
Verify the smoke test passes before removing drain mode. Estimated MTTR is under 60 minutes for a practised team.
Suggested change-freeze windows: No image promotions on Mondays or on the working day before an Australian public holiday. These rules are documented in the ServiceNow change type for SOE image changes.

### Image Build Pipeline Governance
The Azure Image Builder template is the trust anchor for the entire developer fleet. A compromise of the pipeline injects malicious content into every session host image. The controls below are the minimum required to protect that trust anchor.

| Control | Implementation |
| --- | --- |
| Version control and peer review | AIB template in Git; branch protection on main; every change requires a PR with at least one non-author reviewer; gate applies to provisioner changes, binary download references, and image configuration |
| Service principal scoping | AIB SP holds Contributor on the image resource group only (gallery, image definition, staging); not subscription-level; not on production or session-host resource groups |
| Staging storage account | Public access disabled; AIB build traffic routes via private endpoint |
| Binary checksum verification | Each provisioner step that downloads a binary verifies SHA256 against an expected hash stored in the Git repo; mismatch fails the build before execution |
| Software Bill of Materials | Each build produces an SBOM (SBOM Tool or Syft) attached to the gallery image version as metadata; supports expedited CVE triage |
| Image signing | Gallery image versions signed using AIB trusted-launch integration; session hosts provision from signed versions only |
| Version control and peer review | AIB template in Git; branch protection on main; every change requires a PR with at least one non-author reviewer; gate applies to provisioner changes, binary download references, and image configuration |

### Profiles, Persistence, and Storage

#### FSLogix Profile Container
Each developer gets a dedicated FSLogix profile container (VHD) mounted at the session host login. The container holds the user's full Windows profile, making it fully portable across session hosts.

| Setting | Value |
| --- | --- |
| Storage account | stgapmdevprofiles |
| Account kind | FileStorage (Premium) |
| Performance tier | Premium SSD |
| Redundancy | ZRS (survives a single AZ failure in Australia East) |
| File share | profiles |
| Share quota | 100 GiB initial (growable; VHD compaction enabled in FSLogix 2210+) |
| Network access | Private endpoint only; public access disabled |
| RBAC | Storage File Data SMB Share Contributor on SG-APM-Dev-Users |
| Profile path format | \\stgapmdevprofiles.file.core.windows.net\profiles\%username% |
Standard HDD file shares have unacceptable profile-mount latency at scale. Premium ZRS is non-negotiable for a developer SOE where profile-mount time is part of the cold-start budget.
The profile container and Office Container are sized separately using FSLogix SizeInMBs and DynamicRequirePercent settings.

| Container | Cap | Rationale |
| --- | --- | --- |
| Profile container | 70 GiB | Developer profile, VS Code settings, JetBrains caches, Git credential store |
| Office Container | 30 GiB | Outlook OST (3-6 months), Teams cache, OneDrive metadata |
| Combined maximum | 100 GiB | Matches the per-developer share quota on the storage account |
Per-VHD NTFS ACLs restrict VHD access to the owning user and the SYSTEM account. This is FSLogix’s default behaviour when VHDLocations is set correctly, but must be verified at build by mounting a second user's VHD path from a different session and confirming access is denied. A Log Analytics alert fires when the profiles storage account receives an SMB access request where the accessing UPN does not match the username segment of the path.
The Office Container split isolates Outlook OST, Teams cache, and OneDrive metadata, keeping the main profile container lean and simplifying recovery if the Office Container grows unexpectedly.

### OneDrive Known Folder Move
OneDrive is deployed per-machine via the image. Known Folder Move silently redirects Desktop, Documents, and Pictures to OneDrive cloud storage with Files-on-Demand, keeping the local footprint small, providing an implicit off-host backup without developer intervention. KFM is configured via Intune ADMX; silent sign-in uses the developer's Entra session.
Intune policy blocks consumer OneDrive sign-in from within AVD sessions, preventing source code or IP sync to personal storage.

#### Profile Redirections
The following paths are redirected into the FSLogix container to provide persistence across host hops:
%USERPROFILE%\source
%LOCALAPPDATA%\Programs
%APPDATA%\Code
%APPDATA%\Code - Insiders
%APPDATA%\JetBrains
%LOCALAPPDATA%\GitHub*
%LOCALAPPDATA%\Microsoft\WindowsApps

#### Profile Exclusions
The following paths are excluded to keep profile containers lean:
%LOCALAPPDATA%\Temp
%TEMP%
Build artefact directories
npm, yarn, pnpm, etc.

#### Dev Drive
A Dev Drive (ReFS volume) is provisioned per host for source trees and package caches. Drive Dev with Defender performance mode (asynchronous scanning) reduces the AV penalty for large build trees. The Dev Drive is per-host, not per-user; at session logon, a per-user directory is created with NTFS ACLs restricted to the owning user and SYSTEM. A co-resident developer cannot access another developer's Dev Drive directory.
Authoritative source lives in Git remotes; the Dev Drive provides performance, OneDrive and Git provide durability. Uncommitted build state on the Dev Drive is lost during the weekly reimage; developers are advised to commit work in progress before 18:00 AEST each day.

## Application Architecture

### Solution Overview
The application stack consists of the Microsoft 365 client suite, the AI tooling stack, and per-team and self-service tooling delivered through Intune Win32 app groups and Winget. This section covers the Microsoft 365 and AI components; the development tooling stack is part of the golden image.

### Microsoft 365 in AVD

#### Teams
The new Teams client is per-machine in the image. The legacy WebRTC AVD optimisation stack is end-of-support on 1 October 2026 and end-of-availability on 1 April 2027. Any design committed today must use the new client.
The SlimCore plug-in loads at the physical endpoint via Windows App or the Remote Desktop client. An up-to-date client at the endpoint is required; older clients fall back to non-optimised audio and video paths, and call quality degrades. The endpoint estate must run a current Windows App or Remote Desktop client before go-live.

#### Outlook
Outlook is in cached mode with a 3-to-6-month OST cap, sized into the FSLogix Office Container so the OST is portable across hosts and excluded from the main profile. Online mode is an alternative on fast-spinning hosts where local search matters less; cached mode is the default for developer use.

#### OneDrive
Per-machine in the image. KFM and the OneDrive Personal block are described in the Profiles, Persistence, and Storage section.

### AI Tooling and MCP Support

#### GitHub Copilot
GitHub Copilot Business is the default AI assistant for the SOE. In the Business or Enterprise tier, the customer code is not used to train models and policy controls are managed at the GitHub organisation level.

#### MCP and AI Orchestration
VS Code has built-in MCP support. Python MCP frameworks are installed per-user via pip rather than baked into the image because they move too fast to bake reliably; the runtimes (Python, Node.js) are in the image. Semantic Kernel and LangChain are available through the standard pip and NuGet channels, with no special image tooling required. MCP server frameworks are a Phase 3 capability.
MCP servers are enabled only from a curated, signed allowlist maintained by the PDE owner:
Only allowlisted MCP servers may register within a VS Code session.
VS Code MCP configurations sourced from untrusted repositories require explicit user confirmation before any tool calls execute.
The allowlist is a JSON file in the same Git repository as the AIB template, under the same PR-review governance.
New MCP server requests come through the ServiceNow developer catalogue. The PDE owner reviews the server's declared tool surface, repository provenance, and outbound network calls before adding it.

#### Local LLMs
Ollama and LM Studio are supported on Windows 11. Storing model files per-user inside the FSLogix profile container is impractical for multi-session environments. Models live on a separate Azure Files share (stgapmdevmodels, Premium tier) mounted read-only on all session hosts. Administrators manage which models are present; developers select from what is available.
A dedicated managed identity holds Storage File Data SMB Share Contributor on stgapmdevmodels and is the only identity permitted to write. Session host and developer identities are granted Reader-only access. The write identity is not the AIB service principal; the two write paths are separated, so a compromise of the image build pipeline does not also compromise the model store, and vice versa.
Local LLM capabilities are Phase 3. GPU compute is out of scope: the D8s_v5 and D16s_v5 are CPU-only. If real local inference at scale becomes a requirement, a GPU-backed host pool is a separate design exercise.

## Information & Data Architecture

### Information Model
The data managed by the developer SOE falls into five categories:
Developer source code
Persistent profile data, including IDE state, credential stores, and working trees
Transient build artefacts
Developer documents redirected by OneDrive Known Folder Move
Platform telemetry in the Log Analytics workspace.
The source of truth is:
Git remotes for source code
OneDrive for developer documents
FSLogix profiles are recoverable from the last KFM-synced state, plus a fresh Git pull. The Dev Drive is scratch storage with no durability expectation.

### Information Classification
The information classification scheme follows APM's standard data classification. The developer SOE interacts with the following (assumed) classes:

| Class | Example in SOE | Handling |
| --- | --- | --- |
| Public | Open-source dependencies pulled from public package registries | No restrictions; checksum verification on AIB-baked binaries |
| Internal | Developer source code, design documents in OneDrive, internal documentation | KFM to OneDrive for Business; no OneDrive Personal sync; standard Defender controls |
| Sensitive | Production database connection strings, GitHub PATs, Azure client secrets, Pulse Dev production PIM activations | Key Vault references; DPAPI-backed credential store; gitleaks pre-commit hook; GHAS secret scanning; phishing-resistant MFA on production PIM |
| Restricted | Customer personal information accessed via dev-environment databases | Out of scope for v1; if in scope, additional Purview DLP policies will need to be defined |

### Analytics and Reporting Patterns
Telemetry is queried via Sentinel analytic rules (assuming Sentinel is in use), Azure Monitor alert rules, and ad hoc PDE-owner queries in the developer-platform Log Analytics workspace. Reporting outputs cover monthly platform health, quarterly access reviews for app registrations and PIM eligible assignments, and the SOC 2/ISO 27001 audit evidence pack from the retention described under Service Management.

## Cyber & Security Architecture

### RFFR Posture
The developer SOE is (assumed to be) in scope for the DSS Right-Fit For Risk (RFFR) framework, where developers handle data classified under APM's contractual obligations to DSS. RFFR-relevant controls are:
Entra-based identity with Conditional Access and PIM
Defender for Endpoint Plan 2 with EDR and the WSL2 plug-in
Sentinel or equivalent SIEM with 12-month log retention
Australia East data residency
PR-reviewed governance over the AIB template and Conditional Access state.

### Endpoint Security

#### Defender for Endpoint
Defender for Endpoint (Plan 2) is the AV and EDR platform for the SOE (assumption). Defender is applied to session hosts via Intune Endpoint Security policy. The Defender for Endpoint plug-in for WSL2 is active in the image to provide EDR coverage inside the Linux distro rather than sitting blind at the host boundary.
Full scans are scheduled outside working hours. Quick scans run during the session host boot before user profiles are mounted. This removes the common failure mode where a full scan fires at 09:00 during peak build load.

#### Defender Antivirus Exclusions
Every exclusion is a coverage gap. Each entry below is justified individually; the security team should review this list before go-live and reject any exclusion whose trade-off is not acceptable. The table distinguishes AV exclusions from EDR exclusions. AV exclusions are applied only where scan-time performance is the specific driver; EDR-only exclusions are used elsewhere

| Path | Reason | AV Exclusion | EDR Exclusion |
| --- | --- | --- | --- |
| %ProgramFiles%\Microsoft Visual Studio | VS build system generates large volumes of temporary files; real-time scanning causes multi-second build pauses | Yes | No |
| %LOCALAPPDATA%\Microsoft\VisualStudio | VS component cache; same reason | Yes | No |
| MSBuild output directories (bin, obj under project roots) | High-frequency write operations during build | Yes | No |
| %USERPROFILE%\.nuget\packages | NuGet package cache; read-heavy, large file count | Yes | No |
| %APPDATA%\npm-cache | npm download cache | Yes | No |
| pnpm store directory | pnpm content-addressable store | Yes | No |
| Yarn cache | Yarn download cache | Yes | No |
| pip wheel cache | pip pre-built wheel cache | Yes | No |
| %PROGRAMDATA%\Docker | Docker/Podman data root | Yes | No |
| %LOCALAPPDATA%\Docker | Docker Desktop local state (if deployed) | Yes | No |
| Git working trees (on Dev Drive) | Dev Drive performance mode applies; excluded at the volume level | Yes | No |
| JetBrains IDE caches (%LOCALAPPDATA%\JetBrains) | Index and cache files generate high scan load | Yes | No |
| WSL2 distro VHDs (%LOCALAPPDATA%\Packages\CanonicalGroupLimited.*) | WSL2 is protected by the Defender for Endpoint WSL plug-in; this AV exclusion is conditional on the plug-in health check passing | Yes (conditional) | No |
The WSL2 VHD AV exclusion is conditional on the MDE WSL2 plug-in health check passing. If the plug-in is unhealthy, the WSL2 VHD reverts to full AV scanning until it is restored, preventing an unmonitored WSL2 if the plug-in fails to load after an image rebuild. A Log Analytics alert fires when plug-in health degrades.
EDR exclusions are preferred over AV exclusions wherever possible. Run Performance Analyser during UAT to identify any additional high-impact paths before go-live.

#### Dev Drive Performance Mode
Dev Drive performance mode enables asynchronous scanning on the ReFS volume. Files are scanned after write rather than during write, removing the synchronous AV penalty from build operations. This is Microsoft's documented developer storage optimisation.

#### Conditional Access Posture
AVD session hosts are managed devices. The Conditional Access policy for developer access to the SOE requires:
Device compliance
Microsoft Authenticator MFA on session sign-in
Phishing-resistant MFA Pulse Dev production PIM activation
Continuous Access Evaluation (CAE) is enabled tenant-wide. CAE-capable applications on the SOE use CAE tokens, so a revocation or policy change takes effect within minutes rather than at the next token expiry. A Conditional Access policy enforces a 4-hour sign-in frequency on production Azure resource scopes; a PIM-activated production token has a maximum lifetime of 4 hours, capping the window during which a stolen in-session token could be used.

### Identity and Access Control

#### Non-Production Developer Autonomy
Developers hold a standing Reader on the non-production subscription. Contributor and User Access Administrator are PIM-eligible, scoped to non-prod, with the following activation settings:

| Setting | Value |
| --- | --- |
| Activation duration | 8 hours |
| Approval required | No |
| MFA on activation | Yes |
| Justification required | Yes |
| Scope | Non-production subscription |

#### Pulse Dev Production Access
Two patterns are in scope for Pulse Dev production:

##### Personal AVD Pool with PIM Elevation (Recommended)
Pulse Dev runs on a dedicated personal single-session pool (hp-apm-dev-pulse). With no co-resident session, the token-theft lateral-movement path is eliminated. Within that isolated VM, the developer's primary identity holds PIM-eligible Contributor on the production subscription, with APM-side approval, phishing-resistant MFA, and a 4-hour activation window.

##### Privileged Access Workstation (PAW)
A separate cloud-only admin identity and hardened Cloud PC with no email, Teams, or browsing. Microsoft's recommended model for high-value production operations. Appropriate for the subset of Pulse Devs whose role requires the strongest separation (those with standing production Owner or Security Admin access).

#### Developer Resource Access (Zscaler Bypass)
The following FQDNs must be excluded from Zscaler SSL inspection to avoid blocking package registries and development services.

| Category | FQDNs/Domains |
| --- | --- |
| GitHub | github.com, raw.githubusercontent.com, objects.githubusercontent.com, api.github.com |
| Azure DevOps | dev.azure.com, *.visualstudio.com, *.vsassets.io |
| Azure package CDN | packages.nuget.org, pypi.org, files.pythonhosted.org (specific CDN FQDNs; replaces *.azureedge.net) |
| Container registries | mcr.microsoft.com, <apm>.azurecr.io (ACR pull-through; see Self-Service) |
| npm | registry.npmjs.org |
| NuGet | nuget.org, api.nuget.org |
| Go modules | pkg.go.dev, sum.golang.org |
Compensating controls for any remaining exposure on the wildcards: Defender web content filtering alerting on anomalous upload volume to CDN endpoints, and Defender for Endpoint network protection in block mode. Internal NuGet and Azure Artifacts feeds are on private endpoints and must not traverse Zscaler at all; confirm routing with APM's network team before go-live.

#### Secrets Management in Developer Workflows
Without a prescribed pattern, developers default to .env files, hardcoded values in appsettings.Development.json, or credentials in the user profile, all of which persist in the FSLogix profile container and are accessible to anyone who mounts the VHD. The prescribed pattern is:

| Mechanism | Purpose |
| --- | --- |
| az login (device-code or integrated Windows auth) | Azure resource access during a session via the developer's CAE-refreshed Entra session. No stored credentials |
| Key Vault references in appsettings.json | Replace hardcoded connection strings and API keys for local debugging. The Azure SDK DefaultAzureCredential chain picks up the developer's Entra session transparently in VS and VS Code; secrets stay in Key Vault |
| Git Credential Manager (in Git for Windows, baked into the image) | GitHub PATs in the DPAPI-backed Windows credential store. PATs are not pasted into scripts or environment variables |
| gitleaks pre-commit hook (baked into the image) | Blocks commits that stage files matching credential patterns and shows which pattern matched. Developer rotates the exposed secret before re-staging |
| GitHub Advanced Security (GHAS) secret scanning at the organisation level | Second line of defence; scans commits that reach the remote and alerts within minutes |

#### Developer Deployment Patterns
Two deployment patterns are prescribed. Using any other pattern is an anti-pattern that this SOE is designed to eliminate.

##### Local Deployment from a Developer Session
The developer activates their PIM-eligible Contributor role for the target subscription via az role assignment activate or the PIM portal. The activation requires MFA and a written justification. The developer then runs az commands or Bicep/Terraform deployments from their Az CLI session using the activated identity. The session carries the PIM activation for the configured duration (8 hours for non-prod, 4 hours for production). No service principal secrets or stored credentials are involved.
For production deployments from a Pulse Dev session, the personal AVD pool provides the isolated host context described in the Pulse Dev Production Access section.

##### GitHub Actions Deployments to Azure (OIDC)
All GitHub Actions workflows that deploy to Azure must use OIDC workload identity federation. The workflow authenticates to Azure by presenting a GitHub-issued OIDC token; Azure validates the token against a configured federated credential on the managed identity or service principal. No Azure client secrets are stored in GitHub repository or environment secrets.
The setup steps are:
Create a user-assigned managed identity in the non-production (or production) Azure subscription.
Configure a federated credential on the managed identity that trusts the GitHub repository and branch pattern.
Assign the required Azure RBAC role to the managed identity (scoped to the target resource group, not the subscription).
Reference the managed identity's client ID in the GitHub Actions workflow
Adding a new OIDC-federated deployment pipeline is a self-service request type in the ServiceNow developer catalogue; the PDE owner provisions the managed identity and federated credential as part of the fulfilment process.
Storing service principal secrets in a GitHub repository or environment secrets is an anti-pattern. Any existing GitHub Actions consumers that use stored secrets must be migrated to OIDC within 90 days of go-live.

### Web Filtering and Network Security
The underlying network topology is described in Network & Infrastructure under Technology Architecture. This section covers the security controls that operate at the network boundary: Zscaler placement, the session-host outbound NSG allowlist, and the bypass list for AVD service operation.

#### Zscaler – Endpoint, Not Session Host
The recommended pattern is Zscaler Client Connector at the developer's physical endpoint (the Windows laptop or thin client used to connect to AVD), not on the AVD session hosts. The session host routes outbound web traffic via the NAT Gateway, using NSG egress rules as described below.
The trade-off is that outbound web traffic from session hosts is not SSL-inspected by Zscaler. Defender for Endpoint web protection covers that gap on the session host instead. The residual risk of not using Zscaler on session hosts must be assessed and accepted by APM security.
If APM's security policy requires Zscaler on the session host regardless, this must be confirmed with APM's Zscaler administrator before design sign-off, including Zscaler's current documented position on Windows 11 multi-session support.

#### Session-Host NSG Egress Allowlist (HIGH-01)
The NSG for snet-avd-dev-session-hosts enforces a deny-by-default outbound posture. The following rules are the complete approved outbound allowlist. Traffic that does not match these rules is denied.

| Priority | Name | Direction | Destination | Port | Protocol | Action |
| --- | --- | --- | --- | --- | --- | --- |
| 200 | Allow-Azure-IMDS | Outbound | 169.254.169.254 | 80 | TCP | Allow |
| 210 | Allow-Azure-WireServer | Outbound | 168.63.129.16 | 80, 32526 | TCP | Allow |
| 300 | Allow-AVD-Service | Outbound | WindowsVirtualDesktop (service tag) | 443 | TCP | Allow |
| 310 | Allow-Entra-Auth | Outbound | AzureActiveDirectory (service tag) | 443 | TCP | Allow |
| 320 | Allow-AzureMonitor | Outbound | AzureMonitor (service tag) | 443 | TCP | Allow |
| 330 | Allow-KMS | Outbound | Internet | 1688 | TCP | Allow |
| 340 | Allow-Package-Registries | Outbound | Internet | 443 | TCP | Allow |
| 350 | Allow-Cert-Revocation | Outbound | Internet | 80 | TCP | Allow |
| 360 | Allow-RDP-Shortpath | Outbound | Internet | 3478 | UDP | Allow |
| 400 | Allow-DNS-Hub | Outbound | 10.0.4.0/28 | 53 | UDP, TCP | Allow |
| 500 | Allow-FSLogix-PE | Outbound | 10.1.2.0/24 | 445 | TCP | Allow |
| 4096 | Deny-All-Outbound | Outbound | * | * | * | Deny |

#### AVD Service FQDN Bypass
The following FQDNs must not be intercepted, proxied, or SSL-inspected by any network device or client. These are required for AVD agent operation, authentication, and monitoring.

| FQDN | Port | Purpose |
| --- | --- | --- |
| 200 | Allow-Azure-IMDS | Outbound |
| *.wvd.microsoft.com | TCP 443 | AVD service traffic |
| *.service.windows.cloud.microsoft | TCP 443 | AVD service traffic |
| login.microsoftonline.com | TCP 443 | Entra ID authentication |
| catalogartifact.azureedge.net | TCP 443 | Azure Marketplace |
| *.prod.warm.ingest.monitor.core.windows.net | TCP 443 | Azure Monitor telemetry |
| gcs.prod.monitoring.core.windows.net | TCP 443 | Azure Monitor |
| azkms.core.windows.net | TCP 1688 | Windows KMS activation |
| mrsglobalsteus2prod.blob.core.windows.net | TCP 443 | AVD agent |
| oneocsp.microsoft.com | TCP 80 | Certificate revocation |
| ctldl.windowsupdate.com | TCP 80 | Certificate trust list |
| 169.254.169.254 | TCP 80 | Azure Instance Metadata Service |
| 168.63.129.16 | TCP 80, 32526 | Azure WireServer |
Traffic to 169.254.169.254 and 168.63.129.16 must not be intercepted or redirected. Blocking or proxying these addresses causes provisioning failures and connection problems. This constraint is unchanged from the kiosk specification.

### Security Controls Alignment
The table below maps the principal controls in this design to the relevant clauses in DSS RFFR, ACSC Essential Eight, ISO 27001:2022 Annex A, and SOC 2 Type II.

| Control | DSS RFFR | ACSC Essential Eight | ISO 27001:2022 | SOC 2 Type II |
| --- | --- | --- | --- | --- |
| Conditional Access with phishing-resistant MFA on production PIM | Identity & Access | Multi-factor Authentication | A.5.15, A.8.5 | CC6.1, CC6.2 |
| Defender for Endpoint Plan 2, EDR, WSL2 plug-in | Endpoint Protection | Application Control, Patching | A.8.7, A.8.8 | CC6.6, CC6.8 |
| Application allowlist via Intune Win32 + winget machine policy | Application Control | Application Control | A.8.19 | CC6.8 |
| Defender AV exclusions reviewed before go-live | Endpoint Protection | Application Control | A.8.7 | CC6.8 |
| AIB template under PR review, branch protection, peer review | Change Management | – | A.8.32 | CC8.1 |
| AIB image signing, SBOM per image version, SHA256 binary checksum | Software Supply Chain | – | A.5.20, A.8.30 | CC6.6 |
| FSLogix on Premium ZRS, AZ-distributed host pools | Availability | – | A.8.14 | A1.2 |
| Audit log retention (90d hot/12mo cold) for sign-in, audit, activity | Logging & Monitoring | – | A.8.15, A.5.28 | CC7.2, CC7.3 |
| Microsoft Sentinel analytic rules; SOC notification pathway | Logging & Monitoring | – | A.5.24, A.5.25 | CC7.3, CC7.4 |
| OIDC workload identity federation; no stored client secrets | Identity & Access | Restrict Admin Privileges | A.8.5 | CC6.1 |
| GHAS secret scanning + gitleaks pre-commit | Software Supply Chain | – | A.8.30 | CC6.1 |
| Quarterly Entra ID Governance access reviews | Identity & Access | – | A.5.18 | CC6.1, CC6.3 |
| Patching SLAs and gallery-image weekly cadence | Patching | Patch Applications, Patch OS | A.8.8 | CC6.8 |
| Incident response runbook for the session-host fleet | Incident Response | – | A.5.24, A.5.26 | CC7.4 |
NOTE: The table is illustrative rather than exhaustive.

## Service Availability and Disaster Recovery

### Business Service Tiering
The developer SOE is an internal productivity platform, not customer-facing. APM's standard service-tier scheme (assumption) treats the platform as Tier 2: significant productivity impact during outages, with recovery measured in hours, not minutes. The Pulse Dev personal pool inherits the same tier; Pulse Dev's production-PIM workflow can fall back to the PAW alternative or a temporary direct-portal session if the personal pool is unavailable.

### Service Availability
Both host pools are distributed across Australia East AZ 1 and AZ 2, so a single-AZ failure removes capacity but not the platform. The FSLogix profile share on Premium ZRS Azure Files replicates synchronously across AZs; profile mounts continue without manual intervention. The image gallery, Sentinel workspace, and Log Analytics workspace are regional services that survive single-AZ failure.
Indicative targets:
99.9% monthly availability on the primary pool, excluding planned maintenance
RTO under one hour for a single-AZ failure with no developer action
RPO effectively zero for FSLogix profile data
RPO unaffected for source code

### Disaster Recovery and Resilience
A region-wide Australia East failure is treated as a major incident with documented recovery, not automated failover, consistent with the Tier 2 trade-off.
Recovery:
Re-provision a host pool in a secondary Azure region using the same AIB gallery image
Stand up a new FSLogix profile share in the secondary region
Conditional Access is unchanged
Reconnect to Sentinel or the existing SIEM. Estimated RTO is 24 hours.
Single-user profile corruption recovery is handled within the region: snapshot the affected VHD for forensic preservation, if required, then provision a fresh, empty FSLogix container with KFM and Git rehydration. The procedure is documented in the operations runbook.

## Service Management

### Service Management Principles

#### PDE Ownership
The new SOE requires a named owner in APM's IT team. This person is the single escalation point for the platform, responsible for:
Approving changes to the image build
Reviewing and acting on Azure Monitor alerts
Owning the developer service catalogue items in ServiceNow
Acting as the first line of escalation above the support channel
Enforcing the CVE remediation SLAs described below
This design assumes an IT-side owner will be nominated as part of the SOE project.
The following (indicative) SLAs apply to all components in the SOE, whether baked into the image or deployed via Intune:

| CVE Severity | SLA |
| --- | --- |
| High or Critical in direct dependencies | Fix PR within 5 business days |
| Medium in direct dependencies | Fix PR within 30 days |
| High or Critical in baked or Intune-deployed components (VS extensions, Redgate, Defender plug-ins) | Expedited repackage and deploy within 5 business days |

#### ServiceNow Developer Service Catalogue
The assumption is that APM uses ServiceNow as its ITSM platform. If APM uses a different platform, the catalogue structure below applies, but the implementation differs.
The developer service catalogue contains templated request types that route to a developer-specific support queue rather than the general service desk queue.

| Request Type | Description |
| --- | --- |
| New SOE user onboarding | Provision AVD access, FSLogix container, Entra group membership, per-team app group |
| App group change | Add or remove a developer from a per-team Intune app group |
| Install non-catalogue tool | Request evaluation and packaging of a tool not in the standard catalogue |
| PIM activation outside standard | Request an extended or out-of-band PIM activation for non-prod |
| SOE bug report | Report a platform fault (profile failure, tool not launching, session stability issue) |
| New OIDC deployment pipeline | Request provisioning of a managed identity and federated credential for a new GitHub Actions deployment |
| New MCP server request | Request evaluation and allowlisting of an MCP server for use in VS Code |
| SOE image change | Change request for AIB template or Intune configuration; requires PDE owner approval |
| New SOE user onboarding | Provision AVD access, FSLogix container, Entra group membership, per-team app group |
Each template routes to the dev platform support queue. Response SLAs are time-to-first-response only (for non-prod issues) and are appropriate for a developer platform where impact is on one developer rather than a business service.

#### Teams Support Channel
A dedicated Teams channel is monitored by the named PDE owner and a small rotation. The channel is for questions and workarounds; formal requests go through the ServiceNow catalogue. It catches issues before they become tickets and builds a searchable record of recurring problems and their fixes.

### Monitoring, Logging, Reporting and Alerting

#### Monitoring
Azure Monitor and a dedicated Log Analytics workspace cover session-host health. The workspace is separated from any general operational workspace; access is restricted to the named PDE owner and the cyber SOC, so developer operations are not commingled with general operational logs where access is broader.

| Log Category | Hot Retention | Cold/Archive | Method |
| --- | --- | --- | --- |
| Entra ID sign-in logs | 90 days | 12 months | Diagnostic Settings to Log Analytics (archive tier) |
| Entra ID audit logs (PIM activations, app reg changes) | 90 days | 12 months | Diagnostic Settings to Log Analytics |
| Azure activity logs (subscription) | 90 days | 12 months | Diagnostic Settings to Log Analytics |
| Defender for Endpoint alerts and raw telemetry | 180 days (MDE default) | 12 months | MDE portal; confirm Sentinel connector active |
| Log Analytics workspace operational logs | 90 days | 12 months | Archive tier on Log Analytics |

#### Alert Rules
The following alert rules are configured in Azure Monitor and, where marked with (Sentinel), as Sentinel analytic rules.

| Alert | Source | Condition | Severity | Owner |
| --- | --- | --- | --- | --- |
| FSLogix profile mount failure | AVD Diagnostics | Mount error event on session host | High | PDE owner |
| Host pool at maximum capacity | AVD Autoscale log | Scale-out limit reached | Medium | PDE owner |
| Profile VHD near-full | FSLogix telemetry | VHD container at 80% or above | Medium | PDE owner |
| Defender exclusion drift | Intune compliance | Session-host compliance drops below 100% | High | PDE owner |
| Session host health check failure | AVD host pool | Host reports unhealthy | High | PDE owner |
| Cross-user SMB access pattern (Sentinel) | Storage account diagnostics | UPN of accessing identity does not match username segment of profile path | Critical | PDE owner + SOC |
| WSL2 MDE plug-in health degradation | Defender telemetry | Plug-in not loaded on session host | High | PDE owner |
| AIB template change event (Sentinel) | Azure activity log | Write operation on AIB template resource | High | PDE owner + SOC |
| Gallery image version promotion (Sentinel) | Azure activity log | New image version published to gallery | Medium | PDE owner |
| Conditional Access denial spike (Sentinel) | Entra sign-in logs | 5 or more CA denials for a single user within 1 hour | High | SOC |
| PIM activation rate anomaly (Sentinel) | Entra audit logs | 10 or more PIM activations by a single user within 1 hour | High | SOC |
| App registration secret creation (Sentinel) | Entra audit logs | Client secret added to app registration by non-admin identity | High | SOC |
| FSLogix mount from unexpected pool | AVD Diagnostics | Profile VHD mounted from a session host not in hp-apm-dev-primary or hp-apm-dev-pulse | Critical | PDE owner + SOC |

### Patching Lifecycle
Patching is layered across four cadences. Defender signature updates apply automatically with no service window. Windows Update applies at the weekly host reimage; the post-boot script ensures a host is patched before going available. Gallery image base-OS updates pick up at the next scheduled build, with Microsoft Patch Tuesday triggering an out-of-cycle build for critical patches. Baked-component updates bundle into the next image build, with high- or critical CVEs triggering an expedited build per the PDE Ownership SLA.
Intune-deployed components follow the same SLA:
High-or-critical CVEs expedited within 5 business days
Medium within 30 days.
GHAS Dependabot is the primary signal for direct-dependency CVEs; SBOM metadata on each gallery image version supports triage for baked-component CVEs.

### Implementation Sequence
The build is sequenced so that no developer is moved to the new SOE before it has demonstrated stability for an internal pilot group, and so that the legacy PDE remains available until the new platform has run a full working cycle without major incident. Indicative durations below assume a standard APM project tempo and are subject to refinement once Q-DSO-01 (platform team capacity) is answered.

| Alert | Source | Condition |
| --- | --- | --- |
| 0 – Foundation | 4 weeks | AVD landing zone in Australia East, hub VNet peering, FSLogix storage account on Premium ZRS, Sentinel workspace (or existing-SIEM connector), Entra security groups, Conditional Access policy in report-only mode, AIB Git repository and template skeleton |
| 1 – Pilot | 4 weeks | First gallery image version, primary host pool with two baseline hosts, pilot ring with the PDE owner plus a small volunteer cohort, automated smoke test live, Conditional Access policy moved from report-only to enforced, all Day-1 tooling validated |
| 2 – Primary GA | 4 weeks | Primary pool scaled to expected GA capacity, general developer population migrated team-by-team from the legacy PDE, per-team Intune app groups assigned, ServiceNow catalogue items live, Teams support channel staffed |
| 3 – Pulse Dev | 2 weeks | Pulse Dev personal pool stood up, Pulse Dev cutover from legacy with PIM-on-personal-pool model active, phishing-resistant MFA enforced on production PIM activation |
| 4 – Capability enablement | 4–8 weeks | Phase 2 capabilities (WSL2, Podman, ACR pull-through, winget self-service) at first 30 days; Phase 3 capabilities (Copilot, MCP, local LLMs) at 60–90 days, gated on GHAS secret scanning and MCP allowlist being live |
| 5 – Operational Handover and PDE decommissioning | 4 weeks | Legacy PDE retired only after a full month of new-SOE stability with zero high-severity incidents and a positive developer-satisfaction signal; runbook handover to APM platform team; final RFFR/SOC 2 evidence pack collated |
Phase 1 (pilot) is the most consequential for risk reduction. Any image issue caught in the pilot is fixed before any general developer is moved. Phase 2 migrates teams in waves rather than all at once, calibrated on platform-team capacity. The legacy PDE is retained until the new SOE has run a full month with no high-severity incidents and a positive developer-satisfaction signal; this is the rollback safety net for the first month.

## Monthly Cost Estimate
Indicative AUD per active developer per month. The primary pool assumptions are:
Pooled multi-session
Approximately 5 developers per D8s_v5 host
50 hours per week of active use
Australia East on-demand pricing
If applicable, APM's EA discount may reduce the AVD compute and storage lines; the table is indicative, not a budget commitment.

| Component | AUD / Dev / Month (Primary Pool) | Notes |
| --- | --- | --- |
| AVD compute (D8s_v5 at ~5 devs/host, 50 hrs active/week) | ~150 | 1-year RI cuts this by ~30% |
| Premium SSD OS disk (P30 share across host) | ~15 | Per-developer share of host disk cost |
| FSLogix Premium ZRS file share (100 GiB/dev) | ~25 | ZRS is ~50% premium over LRS; trade-off is AZ resilience |
| OneDrive storage | Included | M365 E3/E5 |
| GitHub Copilot Business | ~30 | USD 19/month; usage-based from 1 June 2026 |
| Defender for Endpoint Plan 2 | Included | M365 E5, or standalone if E3 |
| Intune | Included | M365 E3/E5 |
| AVD network (NAT Gateway share + egress) | ~10 | Higher if developers pull large container images regularly |
| Indicative total (primary pool) | ~230 | Per active developer per month |

#### Pulse Dev Personal Pool Cost Delta
The Pulse Dev personal pool runs at approximately AUD 300 to 320 per Pulse Dev per month at D8s_v5 on-demand pricing, a 30 to 40 per cent premium over the primary pooled rate. VM hibernation during off-hours narrows the gap. The absolute dollar impact across a small Pulse Dev population is modest compared with the security gain from single-session isolation.