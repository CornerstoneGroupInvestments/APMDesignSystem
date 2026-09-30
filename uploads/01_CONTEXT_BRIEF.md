# APM JobSeeker Kiosk SOE — Context Brief

**Part 1 of the project export. Audience: a reader with zero prior context and no access to the originating workspace.**
Delivery party referred to as **"the project team" / "Twiki Corp"**; all individuals by role only; third-party suppliers by role. Client is **APM**. Product and platform names (Microsoft, Azure, Entra, Intune, Nerdio, Zscaler, Palo Alto, Meraki, Dell) are retained because they are part of the architecture.

> **Scope note — where this SOE sits in the broader programme.** This workspace covers **one** Standard Operating Environment: the **self-service JobSeeker Kiosk**. It is one of four SOEs in APM's broader Azure Virtual Desktop (AVD) programme delivered via Nerdio. The other three SOEs are **not present in this workspace** and are therefore **not described here** (they live in their own contexts). Everything below is the complete, current context for the **Kiosk SOE only**. Where the broader programme is relevant, it is flagged explicitly.

---

## 1. Project overview

### What is being delivered
APM (Australia's largest Workforce Australia employment-services provider) operates **self-service kiosks** at its JobSeeker sites so that job seekers can complete mandatory online activities (job search, appointment booking, document upload, messaging their case manager) without staff assistance. The project modernises that kiosk fleet onto a **Windows 11 IoT Enterprise thin-client + Azure Virtual Desktop (AVD)** architecture.

In the target model each physical kiosk is a **locked-down thin client** that auto-launches a single application — the Windows App (the modern successor to the Remote Desktop client) — which connects to a **pooled, single-session AVD desktop** in Azure. The job seeker never touches a general-purpose Windows desktop; they get a brokered, ephemeral cloud session that is wiped between users. The AVD estate, its golden image and its host pool are managed through **Nerdio Manager for Enterprise (NME)**.

The defining characteristic of this SOE is its **per-device credential model**: there is no shared kiosk password and no interactive sign-on by staff. Each physical kiosk has its **own Microsoft Entra ID user account** (named after the device serial) with a **randomly generated 16-character password**. That password is **displayed on the device's Windows lock screen** for the job seeker to read and type, and it is **rotated automatically** on a schedule. The plumbing that generates, stores, displays and rotates those credentials — Key Vault, a Credential Proxy Function App, an Automation runbook and a set of Intune Proactive Remediations — is the single most intricate part of the build.

### Fleet size
**540 devices** across approximately 540 APM sites nationally (Australia-wide). (An earlier figure of ~517 appears in older artifacts; the approved design count is **540** — see decision DR-009 / assumption A-04. Treat 540 as current; 517 is stale.)

### Business drivers
- **Self-service compliance.** Job seekers must complete activities to meet Workforce Australia mutual-obligation requirements; kiosks remove the dependency on staffed terminals.
- **Security and regulatory posture.** APM holds a Workforce Australia Service Deed, which requires **Right Fit for Risk (RFFR)** accreditation. RFFR is built on **ISO 27001 + the ASD Information Security Manual (ISM)** and the **ACSC Essential Eight**. The kiosk SOE must be demonstrably hardened (application control, no persistent local data, full-disk encryption, managed identity, auditable credential handling) to survive RFFR assessment.
- **Operational simplicity at scale.** 540 unattended devices at 540 sites must be zero-touch to provision (Autopilot), self-healing (Intune Proactive Remediations), and recoverable by a third party without a local IT presence.
- **Cost and licensing fit.** APM is a Microsoft shop; the design standardises on Azure and on frontline (F3) + device-based licensing rather than full per-user E-plans.

### Current state vs target state
- **Current (legacy) state.** Older kiosk terminals with a fleet-wide shared password model and a heavier local footprint; this is what the programme replaces. (Detail on the legacy estate is outside this workspace.)
- **Target state.** Windows 11 IoT Enterprise **LTSC** thin clients, Autopilot-enrolled and Intune-managed, WDAC-hardened, BitLocker-encrypted, auto-logging-in to a per-device Entra account and auto-launching the Windows App into a **single-session pooled AVD desktop** (Windows 11 Enterprise, D2s_v5) that is reimaged between users. Credentials are per-device, Key Vault-backed, displayed on the lock screen and auto-rotated. Networking is a **controlled-connectivity hub-and-spoke** in Azure with NAT Gateway egress, NSG service-tag allow-lists, Zscaler and Palo Alto inspection. Identity, policy and compliance are driven from Entra ID + Intune; monitoring flows to Azure Monitor / Sentinel.

### Delivery shape
A single **senior platform/infrastructure resource** from the project team (Twiki Corp) executes the build against a 50-day read-and-do implementation plan, across five phases (see §6). A separate **device-prep partner** handles physical wipe and Autopilot hardware-hash export. APM provides identity/cyber/network governance and the RFFR accreditation context.

---

## 2. The SOE in this workspace (the Kiosk SOE), and the 4-SOE programme

### 2.1 Relationship to the 4 SOEs
The broader APM programme delivers **four Standard Operating Environments on AVD via Nerdio**. This workspace is the authoritative context for **one** of them — the **JobSeeker Kiosk SOE**. The remaining three SOEs are managed elsewhere and are **out of scope of this export**; nothing here should be read as describing them. The Kiosk SOE is the most specialised of the set because of its unattended, public-facing, per-device-credential nature and its RFFR exposure.

> If the destination project already holds the other three SOEs, this document slots in as the Kiosk SOE's complete record. If it does not, the other SOEs must be sourced separately — they are **not** recoverable from this workspace.

### 2.2 The Kiosk SOE in full
Although this SOE is a single environment, it is delivered as **two coupled build targets**, which is the closest thing to an internal "sub-SOE" split:

**(a) The physical thin-client image (on-device SOE).**
- **OS:** Windows 11 IoT Enterprise **LTSC** (long-term servicing; chosen so the device is stable, low-churn and reimage-recoverable).
- **Hardware:** Dell thin-client class devices.
- **Role:** a kiosk-locked endpoint whose only job is to auto-login and launch the Windows App. It holds **no job-seeker state**.
- **Lockdown:** Assigned Access / Shell Launcher restricts the device to the kiosk shell; Microsoft Edge is the only browser and is policy-locked (printing disabled, managed favourites, web filtering); **web-only Office** (no desktop Office installed); USB **removable-storage write exception is enabled** (a deliberate decision — job seekers may need to load documents from USB); BitLocker is enforced; Windows LAPS manages the local `Admin` account; **WDAC application control** is enforced (AllSigned + Constrained Language).
- **Identity behaviour:** the device **auto-logs-in** to its own per-device **F3 Entra account** via the legacy Winlogon `AutoAdminLogon` + LSA `DefaultPassword` pathway (decision A3/D-9). This produces a **user Primary Refresh Token (PRT)** on the device, which the credential pipeline depends on.

**(b) The AVD session-host image (cloud SOE).**
- **OS:** Windows 11 Enterprise, **single-session**, captured as a WDAC-hardened **golden image** (`-ent` image definition, in an Azure Compute Gallery `gal_apm_kiosk` / image definition `imdef-apm-kiosk-w11-ent`). Nerdio also references a Nerdio-managed gallery image `GI-APM-Kiosk-AV`.
- **Role:** the actual desktop the job seeker uses, brokered by AVD. Reimaged/refreshed between users so no session state persists.
- **Sizing:** `Standard_D2s_v5` (2 vCPU / 8 GB RAM), 128 GB Standard SSD.
- **Pool config:** host pool `HP-APM-Kiosk`, **Pooled**, **Breadth-first**, **max session limit = 1** (effectively single-user-per-host while in use), **Start-VM-on-Connect**, FSLogix **ProfileType = 1**.

**Per-SOE constraints / notable requirements (Kiosk SOE):**
- Unattended and public-facing → no staff sign-on; credentials must be readable by the public on the lock screen yet safe (hence per-device, rotated, Key Vault-backed).
- RFFR/ISM hardening is mandatory, which collides with the device-side scripting the credential model needs (WDAC blocks unsigned scripts and forces Constrained Language) — the central engineering tension of the build (see §3, §4).
- No hybrid connectivity to sites today (site→Azure private path is a "future provision"), which constrains how kiosks reach the Credential Proxy.

---

## 3. Technical architecture

### 3.1 AVD host pool and session management
- **Host pool:** `HP-APM-Kiosk` — **Pooled**, **Breadth-first** load balancing, **max session limit = 1**, **Start-VM-on-Connect** enabled, FSLogix profile containers (`ProfileType=1`).
- **Session hosts:** `Standard_D2s_v5`, 128 GB Standard SSD, single-session Windows 11 Enterprise from the golden image.
- **Capacity model (DR-009):** ~**4 devices per host** assumption → **135 baseline hosts for 540 devices** (~135 concurrent baseline sessions), auto-scalable to ~**250 hosts** within the session-host /24. This is a **4:1 contention bet**: if national concurrency exceeds host count, arriving job seekers get no session. **Reimage-on-logoff** (each host is unavailable ~15–45 min after a session while it refreshes) tightens effective capacity, so the **autoscale buffer must cover peak concurrency *plus* reimage churn**. (Flagged capacity risk.)
- **Connection model:** AVD **reverse-connect** — no inbound ports to session hosts, no Private Link needed for AVD itself. RDP Shortpath (UDP 3478) is allowed for performance.
- **Session lifecycle:** ephemeral; reimaged between users; 10-minute in-session inactivity timeout ends abandoned sessions.

### 3.2 Nerdio Manager for Enterprise (NME)
NME manages the AVD lifecycle: host-pool definition, golden-image management (`GI-APM-Kiosk-AV`), autoscaling, and deploy-time host configuration. NME provisions hosts through the **Azure Custom Script Extension (CSE)** and **scripted actions**. This is a key integration point and a known friction with WDAC (see §3.8 and the open issues): the CSE handler and its downloaded scripts collide with application control and with the locked-down host-subnet egress.
- **NME storage:** scripted-action payloads are downloaded from a Nerdio-managed storage account in resource group `auea-rg-avd-ctrl-nme-001`.
- **Resolution path:** NME has a native **Scripts Signing** feature (bring-your-own code-signing certificate, linked from Key Vault) that signs NME's VM extensions and scripted actions so they run under AllSigned / in full language under WDAC — letting WDAC stay enforced on session hosts rather than being exempted.

### 3.3 Golden image strategy
- Built from Windows 11 Enterprise, single-session, pinned to an **`-ent` image definition** (a deliberate pin — a previous mismatch caused image-definition drift).
- Hardened to RFFR/ISM: WDAC enforced, ASR rules, Defender, BitLocker, no desktop Office, Edge-only.
- Build is scripted (base config → Windows updates → Appx cleanup → branding → sysprep) and captured to the Azure Compute Gallery (`gal_apm_kiosk` / `imdef-apm-kiosk-w11-ent`). A CLI-only build path and an execution sheet exist (WP-2.10 artifacts).

### 3.4 Identity and access (Entra ID)
- **Per-device users:** one Entra user per kiosk (named by device serial, e.g. `kiosk-<serial>`), licensed **M365 F3** via **group-based licensing** on `SG-APM-Kiosk-Users`.
- **Account creation:** moved to **APM IAM** (bulk at rollout, trickle for swaps) because the runbook's managed identity **cannot be scoped to an Administrative Unit** for user creation (decision A8/D-18). Two Administrative Units exist in the role model.
- **AutoLogon:** device signs into its F3 account via Winlogon `AutoAdminLogon` + LSA `DefaultPassword` (decision A3/D-9). The legacy route is required because Shell Launcher's `AutoLogonAccount` cannot take an Entra UPN. This yields a **user PRT** on the device.
- **Conditional Access:** a consolidated **five-policy** kiosk set, targeting the kiosk users/group. Gating is by **device filter** (Autopilot `enrollmentProfileName` + `trustType`) + **compliant** + **Windows-only** + **native-client-only**. Notably there is **no named-location / IP condition** — an enrolled kiosk can connect from any network (a deliberate device-bound, not location-bound, posture; on-network-only would require a named-location CA, which is not built). **Blocking legacy authentication** is an open default-yes decision (D-11). Group naming is inconsistent across the design (`SG-`-prefixed vs unprefixed) — a documentation defect to consolidate.

### 3.5 Intune / device management
- **Enrolment:** Autopilot (hardware hash supplied by the device-prep partner) + Enrolment Status Page (ESP).
- **Device naming convention:** `[CompanyCode]-[ChassisCode]-[Last6OfSerial]` (implemented via an Intune Proactive Remediation).
- **Configuration profiles (~13):** including **Profile 2** (Edge-only + removable-drive/USB exception), **Profile 5** (Shell Launcher / Assigned Access kiosk shell, per-device locked to each device's kiosk user), **Profile 7** (managed favourites/bookmarks), **Profile 12** (thin-client BitLocker), **Profile 13** (`Profile-APM-Kiosk-LAPS`, Windows LAPS for the local `Admin`, backed up to Entra).
- **Proactive Remediations (PR pairs):** kiosk credential display (`Detect/Remediate-KioskCredential`), WebView2 runtime health (`Detect/Remediate-WebView2Health`), Shell Launcher state (`Detect/Remediate-KioskShellLauncher`). A 60-minute credential-detection cadence runs on-device.
- **Apps:** the **Windows App** (packaged as a Win32 app with version-aware install/detection, replacing the deprecated `msrdcw.exe` Remote Desktop client) and its **WebView2 / VCLibs** dependency stack. Edge is configured for web-only Office and a managed bookmark set.
- **Compliance:** Windows compliance policy feeding the Conditional Access "compliant device" gate.

### 3.6 Credential management pipeline (the core subsystem)
End-to-end, per device:
1. **Key Vault** `auea-kv-apm-kiosk-001` (private-endpoint only) holds one secret per device, named by uppercase serial.
2. **Create-KioskUser** runbook (Azure Automation, managed identity) creates/licenses the Entra user (creation now delegated to APM IAM — see §3.4).
3. **Rotate-KioskUserPasswords** runbook rotates the password on a **12-month** cadence (decision DR-004; an earlier quarterly assumption is superseded) and writes the new secret to Key Vault.
4. **Credential Proxy Function App** (`func-apm-cred-proxy`, `GetPassword`) returns *only the calling device's* password.
   - **Approved model (design V1.0): EasyAuth + PRT.** The Function App is fronted with App Service Authentication (Entra IdP); the credential PR runs **in the logged-on F3 user context** and uses **MSAL + WAM** to silently acquire a token from the device PRT (audience = a new Credential-Proxy app registration). EasyAuth validates the token and returns only that identity's secret — **no embedded secret on-device**.
   - **Pilot model (as built): per-device Function keys** — a shared `?code=` secret per device. This is now a **deviation** to be migrated to EasyAuth+PRT.
5. **Lock-screen display:** a Proactive Remediation renders a **1920×1080 PNG** showing the device's current password and sets it as the lock-screen image; a hash file detects drift. The approved design renders this **on the device** (`System.Drawing`), which **Constrained Language blocks** on the WDAC fleet — resolved by signing the render script and adding its certificate as a **WDAC allowed signer** (full language for that one script); **server-side rendering** is the fallback.
6. **AutoLogon write:** the device-side PR writes the rotated password into the LSA `DefaultPassword` secret so AutoLogon presents current credentials. **Sequencing safeguard:** the LSA write must complete **before** the device next reboots, or AutoLogon presents a stale secret and the kiosk sits at the lock screen until the next PR-driven reboot (accepted residual risk at 540-site scale).

**Single-grant insight:** one code-signing certificate, added as a WDAC allowed signer, unblocks the *entire* device-side credential pipeline at once — token fetch (MSAL/WAM), lock-screen render (`System.Drawing`) and the LSA write — because all three are .NET and otherwise Constrained-Language-blocked.

### 3.7 Networking
**Controlled-connectivity hub-and-spoke (design V1.0)** — explicitly **not** a fully isolated network (an earlier full-segregation premise is superseded):
- **Hub VNet** `auea-vnet-avd-kiosk-hub-ctrl-001` — `10.40.112.0/24`. Contains DNS Private Resolver inbound/outbound `/28`s, a private-endpoint subnet (`10.40.112.32/28`), a shared-services / Hybrid Runbook Worker subnet (`10.40.112.64/27`), a hub NAT Gateway, and reserved Gateway + Firewall subnets.
- **Spoke VNet** `auea-vnet-avd-kiosk-spoke-ctrl-001` — `10.40.114.0/23`. Session hosts on `10.40.114.0/24`; spoke private-endpoint subnet `10.40.115.0/28` (FSLogix); a management `/27`; a spoke NAT Gateway.
- **Private endpoints (6):** FSLogix file, Key Vault, Function App (blob/table/queue), Credential Proxy.
- **Egress:** NAT Gateway; **NSG service-tag allow-lists** (the production session-host NSG allows AVD, Entra, Azure Monitor, KMS/activation, DNS, FSLogix — **but currently lacks Storage and Microsoft Container Registry egress**, which breaks Nerdio CSE; see open issues).
- **Inspection / SD-WAN:** **Zscaler IPSEC tunnel** (recommended) and **Palo Alto east/west inspection over SD-WAN**.
- **Monitoring:** **no AMPLS** (Azure Monitor Private Link Scope) — telemetry flows via the `AzureMonitor` service tag through the NSG; Sentinel + Zscaler retain logs ~180 days.
- **Site / kiosk-side network:** Meraki-managed kiosk VLAN (kiosk VLAN 73, `10.73.0.0/16`) with a **default-deny allow-list**. Bench testing found the allow-list must also include the Credential Proxy FQDN, `windows365.microsoft.com`, `*.cloud.microsoft`, and Store/Edge-update endpoints (decision A13/D-10).
- **Hybrid connectivity:** site→Azure private path is a **"future provision"** — there is no VPN/ExpressRoute today. This is why the Credential Proxy must keep a **hardened public ingress** (EasyAuth-protected) for remote kiosks to reach it (the single biggest unverified link, D-3).
- **Validation environment (FVE):** a separate test VNet `vnet-avd-fve-aue` (`10.40.249.0/24`) — distinct from the production hub/spoke above. Used to validate host deploys, WDAC behaviour and the credential pipeline before national rollout.

### 3.8 Security / RFFR / compliance
- **Regime:** Workforce Australia Service Deed → **RFFR** accreditation → **ISO 27001 + ASD ISM**, plus **ACSC Essential Eight**.
- **WDAC application control** is the dominant control. Crucially, WDAC is driven by the **RFFR Statement of Applicability (SoA)** (owned by APM cyber), **not** by the Detailed Design — the design's own security-controls table has no application-control row. WDAC enforces **AllSigned** at policy scope and forces unsigned/interactive PowerShell into **Constrained Language**. This is what collides with the device-side scripting the credential model and the Nerdio host deploy both rely on.
- **Code-signing certificate (the master gate, D-14):** every device-side script (Win32 install/detect, all PR pairs) and the NME scripted actions must be **signed** by a fleet-trusted certificate, and CL-safe. Adding that certificate as a **WDAC allowed signer** (signer rule, via a signed supplemental policy — not hash, not path) grants **full language** to signed scripts only. One certificate serves the kiosk device-side scripts, the EasyAuth/MSAL client, the lock-screen render, and the NME session-host scripted actions.
- **Other controls:** BitLocker (device + thin client), Windows LAPS, ASR rules, Defender, web filtering (Edge + Zscaler), session management (10-min timeout), physical security, network segmentation (controlled-connectivity), patching (LTSC servicing). Monitoring/audit to Sentinel.
- **Session-host WDAC posture:** the design is silent on WDAC for session hosts, so excepting/handling them is an **RFFR-register decision**. Preferred path is to keep WDAC enforced and use **NME Scripts Signing** rather than exempt the hosts.

### 3.9 Naming conventions (reference)
- **Production hub VNet:** `auea-vnet-avd-kiosk-hub-ctrl-001` (`10.40.112.0/24`)
- **Production spoke VNet:** `auea-vnet-avd-kiosk-spoke-ctrl-001` (`10.40.114.0/23`)
- **Key Vault:** `auea-kv-apm-kiosk-001`
- **Host pool:** `HP-APM-Kiosk`; **FVE host pool:** `HP-APM-Kiosk-FVE`
- **Compute Gallery / image:** `gal_apm_kiosk` / `imdef-apm-kiosk-w11-ent`; Nerdio gallery image `GI-APM-Kiosk-AV`
- **NME resource group:** `auea-rg-avd-ctrl-nme-001`
- **FVE VNet:** `vnet-avd-fve-aue` (`10.40.249.0/24`)
- **Entra group:** `SG-APM-Kiosk-Users`; **device naming:** `[CompanyCode]-[ChassisCode]-[Last6OfSerial]`
- **Per-device user:** `kiosk-<serial>`; **Key Vault secret:** uppercase serial
- **Kiosk site VLAN:** VLAN 73 (`10.73.0.0/16`)

---

## 4. Scope, assumptions, dependencies, risks, decisions

### 4.1 In scope
Kiosk thin-client image and lockdown; AVD host pool + single-session golden image via Nerdio; per-device Entra identity, licensing and Conditional Access; the full credential pipeline (Key Vault, Credential Proxy, rotation runbook, lock-screen display PRs); Intune configuration/compliance/remediation estate; Azure controlled-connectivity network (hub/spoke, NSGs, NAT, PEs, DNS resolver); RFFR/ISM hardening; Autopilot onboarding with the device-prep partner; pilot, layer testing, penetration test, national rollout, and operational handover (DR, monitoring, runbooks, RFFR evidence, knowledge transfer).

### 4.2 Out of scope
The other three SOEs of the broader AVD programme; APM's site LAN/WAN build (Meraki/Zscaler/Palo Alto are APM-owned — the project team specifies allow-lists, APM builds them); legacy-estate decommissioning detail; per-site physical install logistics beyond the onboarding runbook; site→Azure hybrid connectivity (a future provision).

### 4.3 Key assumptions
- 540 devices / ~540 sites (A-04).
- Sites have internet egress (Meraki/Zscaler) but **no private path to Azure** today.
- The device-prep partner can wipe and export Autopilot hashes at volume.
- Licensing volumes (F3, M365 Apps device, Windows VDA) are procurable for 540 devices via the licensing reseller.
- 4:1 device-to-host contention is acceptable at launch (capacity risk noted).
- A code-signing certificate (internal PKI or purchased) can be sourced and trusted fleet-wide.

### 4.4 Dependencies
- **Code-signing certificate (D-14)** — gates *all* device-side scripts, the credential pipeline, and NME Scripts Signing. **Master gate.**
- **APM cyber** — WDAC/App Control baseline ownership; allowed-signer rule; session-host posture; CA legacy-auth block; RFFR register.
- **APM IAM** — per-device user creation; AU-scoped Graph consent.
- **APM network** — controlled-connectivity build, NSG egress (incl. Storage/MCR), kiosk-VLAN allow-list.
- **Device-prep partner** — wipe + Autopilot hash export; LTSC reset media for break/fix.
- **Licensing reseller** — F3 / M365 Apps device / Windows VDA volumes.
- **Design V1.0** as the approved build-from document (see §4.6).

### 4.5 Risks and issues (live)
- **WDAC vs device-side scripting** (the central tension): unsigned scripts won't run and `.NET` calls are blocked under Constrained Language. Resolved in principle by signer-trust → full language, but **unproven until the certificate exists and the bench probe runs**.
- **Credential Proxy reachability (D-3):** with no hybrid connectivity and the Function App behind a private endpoint, remote kiosks can only reach it if it also keeps a **hardened public ingress** (EasyAuth). This is the **single biggest unverified link** in the approved pipeline.
- **Nerdio host deploy in the locked-down network (D-5):** the production session-host NSG lacks **Storage/MCR egress**, so the NME CSE fails its payload download (HTTP 403, as seen in the FVE); and the CSE handler is blocked by WDAC (Device Guard 4551). Resolved via NME Scripts Signing + `-Command` invocation + adding Storage egress — to be proven on the FVE.
- **AutoLogon rotation sequencing:** stale-secret-on-reboot window at 540 sites (accepted, mitigated by ordering the LSA write before reboot).
- **Capacity (4:1 + reimage churn):** autoscale buffer must cover peak concurrency plus reimage downtime.
- **Push-button reset is not viable on this fleet** (fails `0x80004005` / `ERROR_UNRECOGNIZED_VOLUME`); recovery is **LTSC reimage** via the device-prep partner (C-1 / D-13).

### 4.6 Decision register
*(Letter prefixes: D = open decision for APM; A = analysis/assumption item; C = proposed change; DR = a numbered design decision in the design doc. Status as at the current state of the workspace.)*

| Ref | Decision / item | Status | Rationale / position |
|---|---|---|---|
| **Design V1.0 approval** | V1.0 (dated 23 June 2026) is the approved "build-from" design | **APPROVED** | Supersedes V0.3. Resolved a large batch of opens (below). The DD V1.0 file itself is **not stored in this workspace**; its deltas are fully captured in the as-built register. |
| D-1 / D-2 / D-4 | Network segregation model | **CLOSED by V1.0** | Controlled-connectivity hub/spoke, **not** full isolation. Earlier segregation assessment/risk-review superseded. |
| D-6 | Private monitoring (AMPLS) | **CLOSED — No** | Azure Monitor via service tag; no Private Link Scope. |
| D-8 / A5 | Credential Proxy auth model | **CLOSED by V1.0 — EasyAuth+PRT** | Pilot's per-device function-key build is now a deviation to migrate. |
| D-9 / A3 | Kiosk sign-in model | **DECIDED 23 Jun 2026** | AutoLogon retained, F3 Entra user (not a local IoT account — that wording is a V1.1 typo). Residual: LSA-write-before-reboot sequencing. |
| D-15 | Licensing model | **CLOSED by V1.0** | F3 users + M365 Apps device-based + Windows VDA per device, via the licensing reseller; 540 devices. Remaining: confirm assignable counts. |
| D-16 | USB storage exception | **CLOSED — Enabled** | Removable-drive write exception built (Profile 2). |
| D-17 | Printing | **CLOSED — Disabled** | DR-002 Agreed; Edge `PrintingEnabled=Disabled`. Approved by the APM approver. |
| A9 | Rotation cadence | **CLOSED — 12-month** | DR-004; plus 60-min device-side detection PR. (Earlier quarterly assumption superseded.) |
| A12 | Network reconciliation | **CLOSED** | "As per V1.0 hub/spoke." |
| D-3 | Credential Proxy ingress posture | **OPEN (critical)** | Recommend hardened public ingress (EasyAuth) because no hybrid path exists. Single biggest unverified link. |
| D-5 | Production session-host build prerequisites | **OPEN** | Add NSG Storage/MCR egress; use NME Scripts Signing + `-Command` (keep WDAC enforced) rather than exempt hosts. |
| D-7 | App-control baseline owner + accept signing | **OPEN** | WDAC sits in the RFFR SoA (APM cyber). Add cert as WDAC allowed signer via signed supplemental policy. |
| D-10 / A13 | Kiosk VLAN allow-list additions | **OPEN** | Credential Proxy FQDN, `windows365.microsoft.com`, `*.cloud.microsoft`, Store/Edge-update endpoints. |
| D-11 | Block legacy authentication | **OPEN (default yes)** | Not present in V1.0 CA set. |
| D-12 | Premium Per User (future sub-hourly refresh) | **OPEN (default yes, not now)** | Lower relevance under 12-month rotation. |
| D-13 | LTSC reset media for break/fix | **OPEN** | Required because push-button reset fails on this fleet. |
| D-14 | Code-signing certificate + Intune cert profile | **OPEN (master gate)** | One cert unblocks the whole device-side pipeline + NME signing. |
| D-18 / A8 | User creation to APM IAM | **OPEN (recommendation adopted)** | MI can't be AU-scoped for creation; bulk + trickle on APM IAM. |
| C-1 | LTSC reimage recovery model | **CONFIRMED** | Aligns with V1.0 (Ethernet kept for recovery). |
| C-2 | Device-side scripts signed + CL-safe | **IN PROGRESS** | Depends on D-7/D-14. |
| C-3 | Lock-screen render under WDAC | **RESOLVABLE w/o design change** | Keep V1.0 on-device render via signer-trust → full language; server-side render is fallback. |
| C-6 | Adopt EasyAuth+PRT Credential Proxy | **DESIGN CHANGE (to V1.0)** | Closes the function-key deviation. |

> A running **V1.1 defect list** (documentation corrections to fold into the next design revision) is maintained in the as-built register: e.g. the local-IoT-vs-F3 auto-login wording contradiction, the lock-screen hash filename mismatch, duplicate/inconsistently-named CA tables, the hub NAT Gateway naming defect, and the NSG egress gaps.

---

## 5. Stakeholders (APM-side roles and responsibilities)

*Delivery-side individuals are referred to collectively as **the project team / Twiki Corp** and are not named.*

| Role (APM-side unless noted) | Responsibilities in this SOE |
|---|---|
| **APM Cyber / Security** | Owns the RFFR Statement of Applicability and the WDAC/App Control baseline. Approves the allowed-signer rule, the session-host WDAC posture, the CA legacy-auth decision, and records compensating controls in the RFFR risk register. The gating approver for the credential-pipeline security model. |
| **APM IAM** | Owns Entra user lifecycle. Creates/maintains per-device kiosk users (bulk at rollout, trickle for swaps); consents AU-scoped Graph roles for the runbook identity. |
| **APM Network** (the APM network lead) | Owns the Azure controlled-connectivity build and the site network. Implements NSG egress (incl. Storage/MCR), the kiosk-VLAN allow-list, Zscaler/Palo Alto/Meraki configuration. |
| **APM IT / Procurement** | Sources licensing volumes (via the licensing reseller); maintains LTSC reset media; confirms assignable license counts. |
| **APM Design Authority** (the design author) | Owns the Detailed Design document (V1.0 the approved build-from). Adjudicates design intent; folds V1.1 corrections. |
| **APM Approver(s)** (the APM approver) | Signs off specific design decisions (e.g. DR-002 printing disabled). |
| **Device-prep partner** (third party) | Physical wipe + Autopilot hardware-hash export; provides the onboarding hash feed; holds/serves LTSC reimage media for break/fix. |
| **Licensing reseller** (third party) | Supplies M365 F3, M365 Apps device-based, and Windows VDA volumes for 540 devices. |
| **The project team / Twiki Corp** (delivery) | Designs and builds the SOE end-to-end; produces the implementation plan, runbooks, scripts and as-built record; runs pilot/test/rollout; performs the signing, Intune cert profile, NME configuration and credential pipeline build; carries findings and unblock requests to APM governance. |

> No formal RACI matrix exists as a standalone artifact; the table above is the working split implied by the implementation plan, the open-decision owners, and the cyber correspondence. (If a formal RACI is required for the destination project, it should be built from this.)

---

## 6. Project plan — phases, status

The build follows a **50-day read-and-do implementation plan** (current working version **v0.3.3**; v0.2 is the version named in the workspace's top-level guide) across **five phases**, executed by a single senior platform/infra resource. Effort totals **~53 days** (per the effort estimate v0.1).

| Phase | Effort | Outcome / workstream |
|---|---|---|
| **1 — Thin Client Foundation** | 10.5 d | Identity, policy, Intune scaffolding: Entra groups, Conditional Access set, Autopilot/ESP, the ~13 configuration profiles, Shell Launcher, BitLocker, LAPS, device naming, Windows App + WebView2 packaging. |
| **2 — AVD Infrastructure + Credential Management** | 20 d | The heavy phase: controlled-connectivity network (hub/spoke, NSGs, NAT, PEs, DNS resolver), Key Vault, Credential Proxy Function App, Automation runbooks, host pool, golden image. Phase 2B = the credential pipeline + network unblock package for cyber. |
| **3 — Physical Device Provisioning** | 10.5 d | Pilot device, layer testing, penetration test, escalation framework, onboarding with the device-prep partner. |
| **4 — National Rollout** | 4 d | Reactive support across a 4–6 week rollout window to ~540 sites. |
| **5 — Operational Handover** | 8 d | DR, monitoring, runbooks, RFFR evidence pack, knowledge transfer. |

### Current status (as at the workspace's latest activity)
- **Done / validated:** Design V1.0 approved (23 Jun 2026) and fully reconciled against the as-built; Phase 1 identity/policy/Intune scaffolding substantially built and bench-tested (Shell Launcher, Windows App packaging, BitLocker, LAPS, profiles); golden image captured; runbooks, Function App and PR scripts staged; device-prep partner Autopilot onboarding runbook authored; client-facing decisions brief refreshed to V1.0 (v0.2).
- **In progress:** Phase 2 infrastructure in the **Functional Validation Environment (FVE)**; migrating the Credential Proxy from function-key to EasyAuth+PRT (C-6); reframing the lock-screen render under WDAC (C-3).
- **Blocked / awaiting APM:** **FVE host deployment** (Nerdio CSE blocked by WDAC + missing Storage egress — resolution via NME Scripts Signing + NSG egress, pending the cert and cyber's allowed-signer rule); the **code-signing certificate (D-14, master gate)**; **Credential Proxy ingress confirmation (D-3)**; **block-legacy-auth (D-11)**; production session-host prerequisites (D-5). A cyber unblock package consolidates D-3/D-5/D-7/D-8/D-14.
- **Upcoming:** prove signer-trust → full language on the FVE; complete the credential pipeline; pilot; pen test; then national rollout and handover.

---

## 7. Glossary

| Term | Meaning |
|---|---|
| **APM** | The client. Australia's largest Workforce Australia employment-services provider; operator of the JobSeeker sites. |
| **AMPLS** | Azure Monitor Private Link Scope. **Not used** in this SOE. |
| **ASR** | Attack Surface Reduction (Microsoft Defender rules). |
| **AU** | Administrative Unit (Entra ID scoping boundary). |
| **AUMID** | Application User Model ID (used to target the kiosk app in Assigned Access). |
| **AutoLogon** | Winlogon `AutoAdminLogon` + LSA `DefaultPassword` mechanism that auto-signs the device into its Entra user. |
| **AVD** | Azure Virtual Desktop — the brokered cloud desktop service. |
| **Autopilot** | Microsoft zero-touch device provisioning. |
| **Breadth-first** | AVD load-balancing mode spreading sessions across hosts. |
| **CA** | Conditional Access (Entra ID policy). |
| **Constrained Language (CL)** | PowerShell language mode that blocks `.NET`/`Add-Type`/`New-Object`; enforced by WDAC for untrusted scripts. |
| **Credential Proxy** | The Function App (`func-apm-cred-proxy`) that returns a device's own password from Key Vault. |
| **CSE** | Azure Custom Script Extension — how Nerdio runs deploy-time host config. |
| **Device-prep partner** | Third party performing wipe + Autopilot hash export and holding LTSC reset media. |
| **DR-xxx** | A numbered design decision in the Detailed Design (e.g. DR-002 printing, DR-004 rotation, DR-009 capacity). |
| **Entra ID** | Microsoft's cloud identity service (formerly Azure AD). |
| **ESP** | Enrolment Status Page (Autopilot). |
| **Essential Eight** | ACSC's eight baseline mitigation strategies (part of RFFR). |
| **F3** | Microsoft 365 F3 frontline license (carries Entra ID P1). |
| **FSLogix** | AVD profile-container technology; here `ProfileType=1`. |
| **FVE** | Functional Validation Environment — the isolated test build (`vnet-avd-fve-aue`, `10.40.249.0/24`) used before national rollout. |
| **Golden image** | The captured, hardened session-host OS image (`imdef-apm-kiosk-w11-ent`). |
| **HRW** | Hybrid Runbook Worker (Automation execution inside the VNet). |
| **Host pool** | The AVD pool of session hosts (`HP-APM-Kiosk`). |
| **Intune** | Microsoft endpoint management (MDM/MAM). |
| **IoT Enterprise LTSC** | Windows 11 IoT Enterprise, Long-Term Servicing Channel — the thin-client OS. |
| **ISM** | ASD Information Security Manual (Australian Signals Directorate). |
| **Key Vault** | `auea-kv-apm-kiosk-001` — per-device secret store (private-endpoint only). |
| **LAPS** | Windows Local Administrator Password Solution (here, Entra-backed, Profile 13). |
| **LSA** | Local Security Authority — stores the `DefaultPassword` secret for AutoLogon. |
| **Meraki** | Cisco Meraki — APM's site network platform (kiosk VLAN). |
| **MSAL / WAM** | Microsoft Authentication Library / Web Account Manager broker — used to silently acquire a token from the device PRT. |
| **NAT Gateway** | Outbound-only Azure egress for the hub/spoke. |
| **Nerdio / NME** | Nerdio Manager for Enterprise — manages the AVD lifecycle, golden image and autoscaling. |
| **NSG** | Network Security Group (service-tag allow-lists here). |
| **Palo Alto** | Firewall performing east/west inspection over SD-WAN. |
| **PE** | Private Endpoint. |
| **PR** | Proactive Remediation (Intune detect/remediate script pair). |
| **PRT** | Primary Refresh Token (Entra) — produced on-device by the F3 AutoLogon; consumed by the EasyAuth credential call. |
| **RDP Shortpath** | Direct UDP (3478) transport for AVD. |
| **Reverse-connect** | AVD's no-inbound connection model. |
| **RFFR** | **Right Fit for Risk** — the Workforce Australia accreditation regime (ISO 27001 + ISM + Essential Eight). |
| **Shell Launcher** | Windows feature that replaces the shell with a single app (kiosk lockdown). |
| **SoA** | Statement of Applicability (the RFFR control register; owns WDAC). |
| **SOE** | **Standard Operating Environment** — a defined, repeatable device/desktop build. This workspace = the Kiosk SOE (1 of 4 in the programme). |
| **Twiki Corp / the project team** | The delivery party (anonymised). |
| **VDA** | Windows Virtual Desktop Access licensing (per device, for the session hosts). |
| **WDAC** | Windows Defender Application Control — the dominant RFFR hardening control (AllSigned + Constrained Language). |
| **WebView2** | Edge-based runtime the Windows App depends on. |
| **Windows App** | The modern Microsoft remote-connection client (successor to `msrdcw.exe`) auto-launched on the kiosk. |
| **Zscaler** | Cloud security/SD-WAN; IPSEC tunnel for the controlled-connectivity egress and web filtering. |

---
*End of Part 1 (Context Brief). Part 2 (verbatim artifact export) and the manifest follow.*
