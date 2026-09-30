// APM environment register - what is actually configured in the tenant and estate.
// Distinct from compliance-rules.js (what policy demands): these entries describe live
// configuration, and each carries `interactions` - advisory triggers that fire when a
// design touches something this configuration affects. Interactions never fail a
// compliance run; they surface as a "check this" list with the specific remedy.
window.ENVIRONMENT_CONFIG = [

{ id:'ENV-ESLZ', name:'Azure Enterprise-Scale Landing Zone (APAC)',
  source:'APM Azure Landing Zone (APAC) - DetailedDesign v1.1 (uploads/) and the ESLZ Reference Corpus (reference/eslz/, 4 parts)', cat:'Configuration',
  owner:'Head of Digital Transformation and Architecture',
  appliesWhen:{ min:3, any:[/aus-sub-|azure subscription|subscription (id|scope|placement)/i, /\bvnet\b|virtual network/i, /resource group/i, /management group/i, /azure policy|policy initiative/i, /route table|user[- ]defined route|\budr\b/i, /network security group|\bnsg\b/i, /private endpoint|private dns zone/i, /availability (set|zone)/i, /10\.[45]\d\.\d+\.\d+/, /auea-|ause-/i, /peering|hub-spoke/i] },
  facts:[
    ['Topology','Hub-spoke, Australia East (10.40.0.0/16) and Australia Southeast (10.50.0.0/16). All spokes peer to the regional connectivity hub; Sandbox and Acquisitions do not peer.'],
    ['Management groups','AUS-MG-PLATFORM (CONNECTIVITY, IDENTITY, SECURITY, MANAGEMENT), AUS-MG-PROD/DEV/SIT/UAT-CONTROLLED and -STANDARD, AUS-MG-ACQUISITIONS, AUS-MG-SANDBOX. Security domains: controlled and standard.'],
    ['Subscriptions','aus-sub-connectivity, -identity, -management, -{prod|dev|sit|uat}-{controlled|standard}-001, -avd-controlled-001, -sandbox-001, -acquisitions-001.'],
    ['AVD spoke','aus-sub-avd-controlled-001 / auea-vnet-avd-ctrl-001 = 10.40.88.0/23, Australia East, controlled domain - the landing place for the AVD SOEs.'],
    ['DNS','Azure DNS Private Resolver in the connectivity subscription; AD DS domain controllers in aus-sub-identity (auea-vnet-identity-001 10.40.4.0/24 / ause 10.50.4.0/24).'],
    ['Public IPs','Azure Policy denies public IP creation in all management groups except the connectivity subscription (Design Decision 17).'],
    ['RBAC','PIM-managed, eligible time-bound Role-Admin-AzureMG* groups per management group; no standing access.'],
    ['Compliance frame','MCSB, RFFR, ISM, APM Policy named as certification targets.'],
    ['Subscription count','Design says 13, the as-built placement table lists 15 rows including AVD, and the policy baseline assigns ASC Default to "all 15". UNRECONCILED - present all three, never pick one silently.'],
    ['Actually deployed','Hub, identity, management, prod-controlled and prod-standard only (40 subnets). Dev, SIT, UAT, AVD, sandbox and acquisitions spokes are designed, not deployed.'],
    ['Placement anomalies','Three, preserved from the as-built table: sandbox shown directly under APM not AUS-MG-SANDBOX; acquisitions shown under AUS-MG-SANDBOX; AVD absent from the 13-subscription design table and shown directly under APM.'],
    ['Archetype sizing','Connectivity /23 (507 usable), Identity /24 (251), Production /22 (1019) per security domain, Dev/SIT/UAT /23 each per domain, Sandbox /24, Management /24 at x.255.0/24, AVD /23. Every VNet carries reserved additional CIDRs for contiguous growth. Unallocated in AUEA: 10.40.96-247.'],
    ['Mandatory tags','13: Criticality, application-id, business-service, apm-security-domain, environment, owner, technicalcontact, cost-centre, operationalteam, service-component-type, backup, enableupdate, update-stage. Two drive automation silently: backup (BasicVMBackup / StandardVMBackup / StandardSQLVMBackup / StandardSQLVM(OS)Backup enrol into BK01-BK08) and update-stage (Lead / auto-patch01 / auto-patch02 select the AUM maintenance configuration).'],
    ['Policy baseline','218 assignments: 175 policies + 43 initiatives; 32 custom, 186 built-in; enforcement mode Default on all. Scope split: APM intermediate root 99, AUS-MG-PLATFORM 8, AUS-MG-REGION 7, AUS-MG-SANDBOX 1, individual subscriptions 103. Stream01 (16 Dec 2025) 202, Stream03 (17 Jul 2026) 16.'],
    ['RBAC expiry','Every management-group role assignment is PIM-eligible and time-bound, all expiring November 2026, in an estate where PIM was formally excluded from the phase (DD6/DD10). Renewal process is UNKNOWN - no corpus file owns it.'],
    ['Log retention','Operational Log Analytics workspace 90 days, security workspace 30 days. NFR 9.9 requires 180 days queryable. Standing non-compliance at RFFR PROTECTED.'],
    ['Operating model','DD69 ratifies portal-managed policy. The AI landing zone assumes everything-as-code with no portal changes. Unresolved collision.'],
    ['Inbound north-south','Required but NOT enabled at handover, pending an external Azure load balancer and route table. The first designed inbound flow (SmartRecruiters webhook via App Gateway WAF_v2 to the N-S NVA to APIM) is unreconciled with that provision.']
  ],
  interactions:[
    { id:'ENV-ESLZ-1', title:'New Azure resources must land in the right spoke with allocated CIDR',
      trigger:/new (vnet|virtual network|subnet)|deploy(ed|ing)? (in|into|to) azure|function app|logic app|key vault|storage account|azure (vm|virtual machine)/i,
      note:'Workloads land in the spoke matching their environment and security domain (controlled vs standard); CIDRs are allocated from the ESLZ plan, not invented; Sandbox cannot reach anything.',
      remedy:'Name the target subscription and VNet from the ESLZ table, request the subnet CIDR from the platform team, and name every resource per the Azure ESLZ Naming Standard (ENV-NAMING).' },
    { id:'ENV-ESLZ-2', title:'Public IPs are policy-denied outside connectivity',
      trigger:/public (ip|endpoint)|internet-?facing|inbound (traffic|access|connection)/i, guard:/azure|vnet|subscription|endpoint/i, window:200,
      note:'Azure Policy denies public IP creation everywhere except aus-sub-connectivity. Inbound paths go through the North-South Palo Alto set (external LB + UDR), not a workload-attached public IP.',
      remedy:'Design ingress via the connectivity hub (Application Gateway / N-S firewall). If a workload genuinely needs its own public IP, raise the policy exemption as a decision-register row with the rejection reasons for the hub path.' },
    { id:'ENV-ESLZ-3', title:'An AVD spoke is designed but not deployed',
      trigger:/\bavd\b|azure virtual desktop|session host|host pool/i,
      note:'aus-sub-avd-controlled-001 / auea-vnet-avd-ctrl-001 (10.40.88.0/23) is allocated in the controlled domain and appears in the as-built placement table, but the deployed spoke set is hub, identity, management, prod-controlled and prod-standard only. The AVD spoke is PLANNED.',
      remedy:'Target the allocated AVD spoke rather than requesting a new subscription, size subnets within the /23, and state its deployment as a dependency, not as existing infrastructure.' },

    { id:'ENV-ESLZ-4', title:'Management-group role assignments expire November 2026',
      trigger:/role assignment|\brbac\b|management group scope|\bpim\b|privileged identity|eligible (role|assignment)/i,
      note:'Every MG-level role assignment is PIM-eligible and time-bound, all expiring November 2026, in an estate where PIM was formally excluded from the phase (DD6/DD10). The renewal process is UNKNOWN - no corpus file owns it.',
      remedy:'Acknowledge the expiry explicitly in the identity section, state whether this design depends on an MG-scope assignment, and name the owner who will renew it. A design that creates MG-scope assignments without this acknowledgement is incomplete.' },

    { id:'ENV-ESLZ-5', title:'Most spokes are designed, not deployed',
      trigger:/spoke|workload subscription|landing zone subscription|target (vnet|subscription)/i,
      note:'Deployed: hub, identity, management, prod-controlled, prod-standard (40 subnets). Planned only: dev, SIT, UAT, AVD, sandbox, acquisitions, and 5 of the 8 AI Foundry workload spokes.',
      remedy:'State the deployment status of every spoke the design targets. If it is planned, it is a dependency with an owner and a date, not infrastructure - and the design must not describe it in the present tense.' },

    { id:'ENV-ESLZ-6', title:'Deployed log retention is below the 180-day NFR',
      trigger:/log analytics|retention|\blaw\b|workspace|sentinel|180 days|audit log/i, guard:/azure|log|retention|workspace/i, window:200,
      note:'Operational workspace retains 90 days, security workspace 30. NFR 9.9 requires 180 days queryable. This is a standing non-compliance at RFFR PROTECTED with no named owner beyond "security team to adjust".',
      remedy:'State which workspace the design logs to, its actual retention, and whether NFR 9.9 is met or breached. Do not claim 180-day compliance while targeting a 90- or 30-day workspace.' },

    { id:'ENV-ESLZ-7', title:'DR posture is unreconciled',
      trigger:/disaster recovery|\bdr\b|regional pair|secondary region|australia ?southeast|failover|geo-?redundan|\bgrs\b/i,
      note:'The deployed baseline actively builds Australia Southeast as regional pair (VNets, GRS+CRR vaults, domain controllers). A single-region multi-zone decision paper is believed ratified but has never been ingested. UNRECONCILED.',
      remedy:'State which posture the design assumes as an explicit assumption with its risk, cite both sources, and name the owner who will resolve it. Do not silently prefer either.' },

    { id:'ENV-ESLZ-8', title:'Two tags silently drive backup and patching',
      trigger:/\bvm\b|virtual machine|compute|workload deploy|tag(ging|s)?\b/i, guard:/azure|deploy|resource|workload/i, window:200,
      note:'13 mandatory tags apply. backup (BasicVMBackup / StandardVMBackup / StandardSQLVMBackup / StandardSQLVM(OS)Backup) enrols the VM into policies BK01-BK08. update-stage (Lead / auto-patch01 / auto-patch02) selects the Azure Update Manager maintenance configuration. A VM missing either is unprotected and unpatched without erroring.',
      remedy:'Put all 13 tag values in a table in the design, and argue backup and update-stage explicitly rather than leaving them to build time.' },

    { id:'ENV-ESLZ-9', title:'CIDRs come from the archetype sizing rules, not from preference',
      trigger:/\/\d{2}\b|cidr|address (space|plan|range)|subnet mask|supernet/i, guard:/azure|vnet|spoke|subnet|10\.4|10\.5/i, window:200,
      note:'Supernets 10.40.0.0/16 (AUEA) and 10.50.0.0/16 (AUSE), symmetric mirror. Connectivity /23, Identity /24, Production /22 per security domain, Dev/SIT/UAT /23 each, Sandbox /24, Management x.255.0/24. Every VNet carries a reserved adjacent block for contiguous growth. Unallocated AUEA space: 10.40.96-247. Sandbox may deliberately overlap because it is never peered.',
      remedy:'Request the CIDR against the archetype rule, name the reserved growth block adjacent to it, and record any deviation as a decision-register row with options assessed.' },

    { id:'ENV-ESLZ-10', title:'Policy-as-code collides with the ratified operating model',
      trigger:/policy[- ]as[- ]code|infrastructure as code|\bbicep\b|terraform|gitops|no portal changes|deployment pipeline/i,
      note:'DD69 ratifies portal-managed policy for the 218 assignments. The AI landing zone design assumes everything-as-code with no portal changes. Neither side has won; this is the single largest codification blocker.',
      remedy:'State which operating model this design follows and flag the collision as an open item with the design authority as owner. Do not assume the newer document supersedes.' },

    { id:'ENV-ESLZ-11', title:'Inbound north-south is provisioned but not enabled',
      trigger:/inbound|ingress|webhook|public endpoint|application gateway|app ?gw|\bwaf\b|internet-?facing/i, guard:/azure|hub|firewall|spoke|apim/i, window:220,
      note:'Inbound N-S inspection is required but was NOT enabled at handover, pending an external Azure load balancer and route table. The first designed inbound flow (Internet to App Gateway WAF_v2 to N-S NVA to APIM) is unreconciled with that provision.',
      remedy:'State the inbound path explicitly, mark it as depending on inbound N-S being enabled, and reconcile it against the external-LB provision rather than assuming one of the two.' }
  ] },

{ id:'ENV-PALO', name:'Palo Alto VM-Series hub firewalls',
  source:'Palo Alto Firewall Deployment As-Built V1.0 (uploads/, Stratus Phase 3)', cat:'Configuration',
  owner:'Digital Operations (managed network delivery team)',
  appliesWhen:{ min:3, any:[/aus-sub-|azure subscription/i, /\bvnet\b|virtual network/i, /hub firewall|security policy rule|panorama|vm-series/i, /route table|user[- ]defined route|\budr\b/i, /network security group|\bnsg\b/i, /peering|hub-spoke/i, /auea-|ause-/i, /10\.[45]\d\.\d+\.\d+/] },
  facts:[
    ['Placement','North-South and East-West VM-Series clusters in the connectivity hub of each region behind Azure Load Balancers (no PAN HA; LB health probes). AE: 2+2 firewalls; ASE: 1+1.'],
    ['Inspection','All north-south (internet, on-premises) and east-west (inter-VNet, same region) traffic is UDR-forced through the firewalls. Default interzone AND intrazone rules overridden to drop + log.'],
    ['Egress','Outbound HTTP rides IPSEC tunnels from the firewalls to Zscaler; non-HTTP is SNATed out the public interfaces. Outbound is allow-listed by URL category and application; proxy-avoidance and anonymizers blocked and logged.'],
    ['Backhaul','Meraki SD-WAN (vMX in the legacy AE landing zone) advertises BGP routes; inspected traffic forwards to the active vMX.'],
    ['Management','Panorama HA (AE active, ASE passive), template stacks + device groups; config changes only via Panorama. SAML (Entra ID) auth with a local break-glass account; admin access only from the high-privileged jump host.'],
    ['Logging','Firewalls to Panorama (2TB rolling disks), then syslog to Microsoft Sentinel via a syslog VM.'],
    ['Open items','Firewall DNS and NTP servers are TBC pending the Infrastructure Team decision. Advanced ACL migration deferred to APM.']
  ],
  interactions:[
    { id:'ENV-PALO-1', title:'New egress needs Palo security-policy (and possibly NAT) rules',
      trigger:/egress|outbound (traffic|access|connection)|allow[- ]?list|fqdn|reach(es|ing)? the internet|calls? out to/i, guard:/azure|vnet|spoke|cloud|subscription/i, window:250,
      note:'Nothing leaves an Azure spoke without matching a firewall allow rule - outbound is category- and application-allow-listed, dropped by default.',
      remedy:'List the destination FQDNs, ports and applications in the design (\u00a75.3 named egress) so the Panorama change can be raised verbatim; do not write "standard internet access".' },
    { id:'ENV-PALO-2', title:'Zscaler tunnels already terminate on the hub firewalls',
      trigger:/zscaler.{0,80}(tunnel|ipsec)|ipsec.{0,80}zscaler|new (ipsec )?tunnel/i,
      note:'The hub firewalls hold the IPSEC tunnels to Zscaler for Azure-sourced HTTP egress. Site networks tunnel to Zscaler separately via the managed network provider - two distinct tunnel sets.',
      remedy:'State which tunnel set carries the design\u2019s traffic. A new site or VLAN rides the site tunnels; a new Azure workload rides the hub firewall tunnels - neither needs a new tunnel by default.' },
    { id:'ENV-PALO-3', title:'DNS and NTP for hub infrastructure are still undecided',
      trigger:/dns (server|resolver|forward)|name resolution|\bntp\b|time (sync|source)/i, guard:/azure|hub|firewall|infrastructure/i, window:250,
      note:'The as-built records firewall DNS/NTP as TBC pending the Infrastructure Team. The resolver of record for spokes is the Azure DNS Private Resolver in connectivity.',
      remedy:'State the resolver the design actually uses (Private Resolver inbound endpoint for Azure; site DHCP-issued DNS for devices) and flag any dependency on the undecided infrastructure DNS/NTP as an open item with the Infrastructure Team as owner.' }
  ] },

{ id:'ENV-NAMING', name:'Azure ESLZ Naming Standard',
  source:'Azure ESLZ Naming Standards - 17 July 2026 (uploads/)', cat:'Configuration',
  owner:'Digital Operations',
  appliesWhen:{ min:3, any:[/aus-sub-|azure subscription/i, /\bvnet\b|virtual network/i, /resource group/i, /management group/i, /storage account/i, /recovery services vault/i, /network security group|\bnsg\b/i, /auea-|ause-/i, /private endpoint/i] },
  facts:[
    ['General form','[region]-[type]-[environment]-[apm security domain]-[descriptor]-[instance], e.g. auea-rg-prod-ctrl-appname-001, ause-nsg-prod-std-web-001. Regions: auea / ause (short: ae / as).'],
    ['Compact forms','VMs and storage use shortform concatenation: aevmpadds001, aestpcappname001, aestxflowlog001. Palo resources always carry "palo" in the RG name.'],
    ['Management groups','ALL CAPS: AUS-MG-[SCOPE]. Subscriptions all lower with full security-domain word: aus-sub-prod-controlled-01.'],
    ['NSG rules','[allow|deny]-[ib|ob]-[source]-to-[destination]-[descriptor]-[nn], e.g. allow-ob-azmonitor-to-law-https-01.'],
    ['Device/Intune objects','Separate schema - the APM Intune Naming Schema V1.0 governs Intune policies, groups and device names (already applied in our designs).']
  ],
  interactions:[
    { id:'ENV-NAMING-1', title:'Azure resource names must follow the ESLZ standard',
      trigger:/resource group|\bvnet\b|virtual network|\bnsg\b|route table|log analytics|recovery services|private endpoint|storage account/i, guard:/azure|deploy|creat/i, window:250,
      note:'Every Azure object in a design is named per the ESLZ standard, including NSG rule names - reviewers reject invented formats.',
      remedy:'Write the exact names into the design settings tables using the [region]-[type]-[env]-[domain]-[descriptor]-[instance] form; check the compact VM/storage forms for those two types.' }
  ] },

{ id:'ENV-TENANT', name:'APM corporate tenant - estate Intune and Entra behaviour',
  source:'Working knowledge from the Participant Kiosk gap analysis (G-18/19/20) and the SOE Hardening Standard', cat:'Configuration',
  owner:'APM Digital',
  facts:[
    ['Broad assignments','Corporate policies, apps and scripts assigned to All Devices / All Users / broad dynamic groups land on every Entra-joined device unless the device group is excluded.'],
    ['Password expiry','The estate baseline sets a maximum password age on local accounts - it breaks device-local autologon accounts unless the account is exempted and the device group excluded from the policy.'],
    ['Delivery Optimization','Estate DO policy has no group boundary on Entra-joined devices; without a boundary set every device pulls its own update payload over the site WAN link.'],
    ['Update management','Estate Windows Update rings and Patch My PC exist; new device populations join existing rings rather than creating parallel ones.'],
    ['App Control','Estate WDAC/App Control policies exist with script enforcement DISABLED; fleet variants may enable it (the kiosk does).'],
    ['Conditional Access','Tenant CA policy set exists; new device populations need an exclusion sweep and, where blocking is the intent, a device-filter policy.']
  ],
  interactions:[
    { id:'ENV-TENANT-1', title:'Local accounts hit the estate password-expiry baseline',
      trigger:/local (standard )?(user )?account|auto[- ]?log(on|in)|session account/i,
      note:'The inherited baseline\u2019s maximum password age applies to local accounts and will break automatic logon fleet-wide on one day.',
      remedy:'Exempt the account explicitly (PasswordExpires = False), exclude the device group from the estate expiry policy, and add a test that advances the clock past the maximum age.' },
    { id:'ENV-TENANT-2', title:'New device population needs the corporate-assignment exclusion sweep',
      trigger:/new (dynamic )?(device )?group|dynamic membership|device population|fleet|enrolment profile|autopilot/i,
      note:'Everything targeting All Devices / All Users lands on the new fleet unless excluded - the single largest configuration risk for special-purpose devices.',
      remedy:'Enumerate every corporate assignment (policies, apps, scripts, CA) and record per item: applies, excluded, or replaced by a fleet variant. Put the table in the design, not a wiki.' },
    { id:'ENV-TENANT-3', title:'Delivery Optimization needs a group boundary for any multi-device site',
      trigger:/delivery optimization|update (payload|download|bandwidth)|20 ?mbps|site (wan|link|bandwidth)/i,
      note:'Without DOGroupId + group download mode, every device at a site pulls its own copy of each update over the constrained site link.',
      remedy:'Join or extend the DO boundary policy (group mode 2, DOGroupId per site) and state the expected per-site download reduction.' },
    { id:'ENV-TENANT-4', title:'Blocking access needs a CA device filter, not membership absence',
      trigger:/must not (access|reach|sign in)|block(ed|ing)? (from )?(microsoft 365|m365|office|corporate)|no (corporate|m365) access/i,
      note:'A device simply not being licensed or grouped does not block anything; the tenant evaluates CA on the device claim.',
      remedy:'Write an explicit CA block policy with a device filter on the fleet\u2019s naming prefix or group, plus the browser and network layers for unmanaged-device gaps.' }
  ] },

{ id:'ENV-CA', name:'Conditional Access policy set - APM corporate tenant',
  source:'Tenant export 7 Aug 2026 (policies/APM-Conditional-Access-Policies-Export.csv); analysis in policies/APM_CA_Policy_Analysis.html', cat:'Configuration',
  owner:'APM Cyber Security',
  appliesWhen:{ min:1, any:[/conditional access|\bca policy\b|\bca-\d{3}\b|sign-?in|authenticat|\bmfa\b|multi-?factor|device filter|block access/i] },
  facts:[
    ['Size and enforcement','116 policies: 68 enforced, 43 report-only, 5 disabled. 37 per cent of the estate grants and denies nothing.'],
    ['Enforced tenant-wide (all users, all apps)','Deny Legacy Auth (block) - CA-100 legacy protocols (block) - CA-102 locations except AU and corporate (block) - CA-104 high sign-in risk (block) - CA-105 bad IPs (block) - CA-201 BYOD browser no persistence (session) - CA-203 high user risk (MFA + password change) - AllUsers_AllAccess_DeviceRequired (compliant OR Entra-joined) - AllUsers_AllAccess_MFAorDeviceRequired (MFA OR Entra-joined).'],
    ['Report-only, so NOT a control','CA-101 tenant-wide MFA - CA-106 and CA-401 phishing-resistant MFA - AdminRoles_Everything_RequireMFA - AdminRoles_Everything_RequireDevice - CA-103 unsupported platforms - CA-400 and CA-402 administrator device and location - Guests_Everything_MFARequired - AllUsers_UnapprovedCountries_Block - AllUsers_AllAccess_BlockLegacy.'],
    ['A managed device satisfies both enforced grants','AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired are both satisfied by an Entra-joined, Intune-compliant device - the second one with no MFA prompt. Any special-purpose fleet that is managed and compliant looks like a corporate device to every existing grant.'],
    ['Risk-based CA is live','CA-104, CA-203, AdminRoles_Risky_Sign-ins_MFA and AdminRoles_RiskyUsers_MFA_Password_Reset are enforced, so Entra ID P2 risk signals are licensed and in use. All of them evaluate a user principal.'],
    ['Naming convention','CA-nnn - audience - apps - condition - action, by series: CA-1xx all users and guests, CA-2xx organisation users, CA-3xx contract and community populations, CA-4xx administrators, CA-5xx guests. CA-100 to CA-106 are in use. Legacy families also present: Scope_App_Control (AllUsers_*, AdminAccounts_*, AdminRoles_*), POC_EarlyAccess_*, GuestAccess_*.'],
    ['Retired kiosk policies','Fourteen in two families: CA-APM-Kiosk-* (seven, all report-only, group 761b688c) and CA-APM-KioskPB-* (seven, six enforced, group e0378201). Both assign to groups of user identities.'],
    ['Hygiene','CA-501 ends in the literal word COPY and is enabled. zzADA_Block_Policy_Test_20250626 is still present. APM Pilot Block Policy and APM Pilot Policy are both enabled and both block all apps. Four duplicated numbers (CA-204, CA-205, CA-207, CA-208). Eight _Reporting twins. Four names with leading or trailing whitespace. Eighteen with a corrupted separator character. Three policies block legacy authentication. Two enabled policies grant MFA under a name that says Block (LimitedUsers_EmailOnly_Block, CA-504).'],
    ['Export limitation','The CSV carries name, state, users, groups, applications and grant rules only. No exclusions, conditions, device filters, locations, platforms, client apps, session controls, authentication strengths or directory-role targets. A blank grant rule means session control or authentication strength, not no control. Request identity/conditionalAccess/policies from Graph for the full object.']
  ],
  interactions:[
    { id:'ENV-CA-1', title:'A managed fleet satisfies the tenant grants, so blocking must be explicit',
      trigger:/must not (access|reach|sign in)|block(ed|ing)? (from )?(microsoft 365|m365|office|corporate)|no (corporate|m365) access|device filter/i,
      note:'AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired are enforced for all users against all apps, and an Entra-joined compliant device satisfies both - the second without an MFA prompt. Absence of a licence or a group grants nothing.',
      remedy:'Write an explicit block policy with a device filter, cite both tenant policies by name as the reason it is required, and back it with browser and network layers for devices the tenant does not recognise.' },
    { id:'ENV-CA-2', title:'Phishing-resistant and tenant-wide MFA are report-only, so they cannot be cited as controls',
      trigger:/phishing[- ]resistant|multi-?factor|\bmfa\b|authentication strength/i,
      note:'CA-401 (administrators) and CA-106 (all users and guests) are report-only, as is CA-101. The only enforced MFA grant tenant-wide is MFA OR Entra-joined device, which a managed device satisfies without prompting.',
      remedy:'Do not cite tenant MFA or phishing-resistant MFA as an inherited or compensating control. If the design needs it, raise enforcement with APM Cyber Security first and record it as an assumption with an owner until confirmed.' },
    { id:'ENV-CA-3', title:'New Conditional Access objects follow the CA-nnn convention, not the Intune schema',
      trigger:/conditional access (polic|profile)|\bca polic/i,
      note:'The tenant convention is CA-nnn - audience - apps - condition - action, with number series by audience. The Intune Naming Schema governs Intune objects only. Four numbers are already duplicated, so a proposed number must be checked against the export.',
      remedy:'Name the policy CA-nnn in the correct series, confirm the number is unused, and state both the name and the number in the design settings table.' },
    { id:'ENV-CA-4', title:'Country-level location blocking already exists tenant-wide',
      trigger:/geo[- ]?block|country|location[- ]based|non-?au|outside australia|named location/i,
      note:'CA-102 blocks locations other than Australia and corporate for all users and all apps, and is enforced. CA-105 blocks known-bad IPs. CA-500 and CA-501 cover guests.',
      remedy:'Cite CA-102 rather than creating a fleet-specific location policy. The tenant already carries one duplicate of this control in report-only state.' },
    { id:'ENV-CA-5', title:'A group-assigned CA policy silently dies when its group is retired',
      trigger:/retire|decommission|delete the group|remove the (user )?group|group is retired/i, guard:/conditional access|\bca\b|polic/i, window:260,
      note:'Conditional Access assigns to users and groups of users. Fourteen retired kiosk policies assign to two user groups, and six of them are enforced. When the group goes, they match nothing and raise no error.',
      remedy:'Delete the policies in the same change record as the group, export their sign-in and report-only data as evidence first, and separately remove any exclusion that named the group so no exclusion outlives it.' },
    { id:'ENV-CA-6', title:'The Conditional Access half of an exclusion register cannot be verified from the standard export',
      trigger:/exclusion register|excluded from|exclude the (device )?group|assignment exclusion/i, guard:/conditional access|\bca\b|polic|tenant/i, window:260,
      note:'The available export has no exclusions column. Nine policies target all users against all apps and cannot be checked.',
      remedy:'Mark the Conditional Access rows of the exclusion register as unverified, and request identity/conditionalAccess/policies from Graph to close it.' }
  ] },

{ id:'ENV-DOCSET', name:'APM solution document set - DDD and TCD templates',
  source:'02 Detail Design Document - Template V0.1 (24 Jun 2026) and 03 Technical Configuration Document V0.1 (21 Jul 2026) (uploads/)', cat:'Configuration',
  owner:'Head of Digital Transformation and Architecture; Head of Digital Operations; Head of Product Development',
  facts:[
    ['DDD template','APM\u2019s own template orders: Introduction, Overview, Business Architecture, Application Architecture, Technology Architecture, Information & Data, Cyber & Security, Service Availability & DR, Service Management - the same spine as our detailed-design standard. Cover carries Project Name, Document Owner, Contact, Program, Division/Unit, Status, Version, Product ID, plus Consultation, References and Derivation, and an SDA Approval sheet.'],
    ['TCD companion','The Technical Configuration Document is the build-level companion: IP addressing, DNS records, load balancing, NAT and firewall rules, compute specs, RBAC groups, accounts, CA rules, AV exclusions, DNS/NTP/logging/monitoring/patching/PKI/SMTP, RPO/RTO, backup/restore, capacity. "Once approved this document serves as de-facto as-built information."'],
    ['Approval','Both templates carry an SDA (Solution Design Authority) approval block - designs are expected to pass through SDA.']
  ],
  interactions:[
    { id:'ENV-DOCSET-1', title:'APM expects a TCD companion to every detailed design',
      trigger:/detailed design|solution design|design document/i,
      note:'The DDD argues the design; the TCD carries the build-level configuration as de-facto as-built. Our \u00a75.3-style settings tables satisfy much of it, but APM review may ask for the TCD artefact itself.',
      remedy:'Plan a TCD per use case as build detail lands (IPs, rules, accounts, certificates verbatim), and add the SDA approval step to the document\u2019s approval path.' }
  ] }
];
if (typeof module !== 'undefined') module.exports = { ENVIRONMENT_CONFIG: window.ENVIRONMENT_CONFIG };
