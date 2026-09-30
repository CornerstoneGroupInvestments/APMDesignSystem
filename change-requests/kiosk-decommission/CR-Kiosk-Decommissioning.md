# Change Request - Job Seeker Kiosk Decommissioning

## Change summary

| Field | Value |
|---|---|
| Change number | *ServiceNow reference* |
| Short description | Remove every cloud component built for the Job Seeker Kiosk solution, superseded in full by Participant Kiosk V1.0 |
| Change type | Normal |
| Risk / impact | Low. Every action reduces exposure: removes an internet-facing endpoint, an unused custom domain and a certificate authority |
| Requester | Digital Transformation and Architecture |
| Implementer | Cloud and Azure, with Identity and Endpoint |
| Approver | Change Advisory Board, with Cyber Security sign-off on the disposition tables below |
| Trigger to start | Participant Kiosk pilot passes its validation and test plan in full (Participant Kiosk DDD section 9.6) |
| Rollback deadline | End of Stage 2 (30-day observation window). See Backout for the position after that |

## Why this change

- The Job Seeker Kiosk credential pipeline, identities and test environment have no remaining purpose once Participant Kiosk V1.0 is live.
- A dormant tenant object, an unowned public endpoint and a Conditional Access exclusion that outlives its group are exactly what an RFFR assessor writes up, and what an attacker looks for.
- Some of what was built is still needed by the Standard User and Developer AVD SOEs. This change separates deletion from handover so nothing needed is destroyed and nothing dormant is left "to be safe."

## Document control

| Version | Date | Author | What changed |
|---|---|---|---|
| V1.4 | 12/08/2026 | Shaun Struik | All kiosk Intune profiles and scripts (section 1f) and all Nerdio configuration objects (section 4) confirmed deleted |
| V1.3 | 12/08/2026 | Shaun Struik | All 14 kiosk Conditional Access policies (section 1b, section 1c) confirmed deleted |
| V1.2 | 7/08/2026 | Shaun Struik | Every Conditional Access policy, Intune profile and private endpoint listed individually. Log Analytics workspace, both kiosk NSGs and the kiosk route table changed from Repurpose to Delete. Private DNS zones changed from Repurpose to No action |
| V1.1 | 7/08/2026 | Shaun Struik | apmkiosk.net.au corrected from separate tenant to custom domain on the existing tenant. 540 kiosk accounts corrected to never created. Added the AVD Functional Validation Environment (section 4) |
| V1.0 | 7/08/2026 | Shaun Struik | Initial change request |

## Description

### 1. Identity and access - main APM tenant

Owner: Identity and Endpoint, unless stated otherwise.

**1a. Accounts and licensing**

| Name | What it is | Where to find it | Action |
|---|---|---|---|
| Kiosk accounts on apmkiosk.net.au | Per-device sign-in identity, never created | Entra admin center > Users > filter Domain name = apmkiosk.net.au | N/A. Confirm zero exist before Stage 8 |
| SG-APM-Kiosk-Users | Security group, drives F3 licensing | Entra admin center > Groups > search "SG-APM-Kiosk-Users" | Delete if present. Expected empty |
| M365 F3 licences | Group-based licence on the group above | Entra admin center > Groups > SG-APM-Kiosk-Users > Licenses | N/A, none consumed. Confirm with SoftwareOne |

**1b. Conditional Access - CA-APM-Kiosk-* family (7 policies, all report-only) - DELETED 12/08/2026**

| # | Policy name | State | Where to find it | Action |
|---|---|---|---|---|
| 1 | CA-APM-Kiosk-BlockNonWindows | Deleted | Entra admin center > Protection > Conditional Access > Policies | Complete |
| 2 | CA-APM-Kiosk-BlockWebClient | Deleted | Same blade | Complete |
| 3 | CA-APM-Kiosk-RequireCompliantDevice | Deleted | Same blade | Complete |
| 4 | CA-APM-Kiosk-WebOnly-Office | Deleted | Same blade | Complete |
| 5 | CA-APM-Kiosk-DeviceBound | Deleted | Same blade | Complete |
| 6 | CA-APM-Kiosk-BlockExchangeOnline | Deleted | Same blade | Complete |
| 7 | CA-APM-Kiosk-BlockTeams | Deleted | Same blade | Complete |

**1c. Conditional Access - CA-APM-KioskPB-* family (7 policies, 6 enforced) - DELETED 12/08/2026**

| # | Policy name | State | Where to find it | Action |
|---|---|---|---|---|
| 1 | CA-APM-KioskPB-RequireCompliantDevice | Deleted | Entra admin center > Protection > Conditional Access > Policies | Complete |
| 2 | CA-APM-KioskPB-BlockNonKioskDevices | Deleted | Same blade | Complete |
| 3 | CA-APM-KioskPB-BlockNonWindows | Deleted | Same blade | Complete |
| 4 | CA-APM-KioskPB-BlockLegacyAuth | Deleted | Same blade | Complete |
| 5 | CA-APM-KioskPB-BlockAuthFlows | Deleted | Same blade | Complete |
| 6 | CA-APM-KioskPB-BlockRiskySignIn | Deleted | Same blade | Complete |
| 7 | CA-APM-KioskPB-WebOnlyOffice | Deleted | Same blade | Complete |

**1d. Exclusions to remove (same change as deleting SG-APM-Kiosk-Users)**

| # | Policy the exclusion sits on | Where to find it | Action |
|---|---|---|---|
| 1 | AllUsers_AllAccess_MFAorDeviceRequired | Conditional Access > this policy > Assignments > Users > Excluded | Remove SG-APM-Kiosk-Users from the exclusion list |
| 2 | AllUsers_Office365_DeviceRequired | Conditional Access > this policy > Assignments > Users > Excluded | Remove SG-APM-Kiosk-Users from the exclusion list |

**1e. Information Barrier, certificate authority**

| Name | What it is | Where to find it | Action |
|---|---|---|---|
| Kiosk Information Barrier segment | Purview segment blocking kiosk-corporate visibility | Microsoft Purview compliance portal > Information barriers > Segments | Delete. Confirm no other segment depends on it first |
| Kiosk Information Barrier policy | The policy applying the segment above | Microsoft Purview compliance portal > Information barriers > Policies | Delete |
| Cloud PKI root CA | Root certificate authority for kiosk device certs | Intune admin center > Tenant administration > Cloud PKI. Confirm exact CA name on portal | **Decision required** before revoking, see note below. Owner: with Cyber Security |
| Cloud PKI issuing CA | Issuing certificate authority under the root above | Same blade | Decision required, same as root CA |
| SCEP certificate profile (kiosk) | Delivers device certs to kiosk devices via the CAs above | Intune admin center > Devices > Configuration profiles > filter "kiosk" + "SCEP" | Decision required, same as root CA |

Cloud PKI decision: confirm with the Standard User AVD SOE and Privileged Access design leads before revoking either CA. Revocation is not reversible.

**1f. Intune profiles and scripts (names as described in the Job Seeker Detailed Design V1.3; confirm exact Intune object name on portal before deleting) - DELETED 12/08/2026**

| # | Item | Function | Where to find it | Action |
|---|---|---|---|---|
| 1 | Assigned Access configuration profile | Locks the kiosk AVD session to the kiosk shell | Intune admin center > Devices > Configuration profiles > filter "kiosk" | Complete |
| 2 | Lock-screen remediation script | Proactive Remediation generating the per-device lock-screen image | Intune admin center > Devices > Scripts and remediations > filter "kiosk" | Complete |
| 3 | OneDrive purge script | Clears kiosk session data between users | Intune admin center > Devices > Scripts and remediations > filter "kiosk" | Complete |
| 4 | Logon lockdown policy | Restricts which accounts may sign in to a kiosk device | Intune admin center > Devices > Configuration profiles > filter "kiosk" | Complete |
| 5 | Kiosk Windows Update ring policy or policies | Patch ring(s) scoped to the kiosk device group | Intune admin center > Devices > Windows Update rings > filter "kiosk" | Complete |

**1g. Device-side artefacts**

| Name | What it is | Where to find it | Action |
|---|---|---|---|
| Device-side artefacts | Local files and scheduled tasks on pilot devices | `C:\APM\Kiosk` on each provisioned pilot device | Wipe and re-provision. Owner: Deployment Team |

### 2. Azure resources

Owner: Cloud and Azure.

**2a. Credential pipeline compute and storage**

| Name | What it is | Where to find it | Action |
|---|---|---|---|
| Credential Proxy Function App | The only internet-facing ingress this design created | Azure Portal search bar > paste `auea-pep-func-apm-kiosk-cred-001` to locate the private endpoint, then open the linked Function App | Remove the public endpoint first, confirm zero calls, then delete |
| Credential Proxy App Service plan | Hosting plan for the Function App above | Same Function App resource > Overview > App Service plan | Delete with the Function App |
| Key Vault auea-kv-apm-kiosk-001 | Stores each device's password | Azure Portal search bar > paste `auea-kv-apm-kiosk-001` | Export audit log, delete, purge after the 90-day soft-delete window. Do not repurpose for AVD |
| Function App storage: blob endpoint | Backs the Credential Proxy runtime | Search `auea-pep-stg-apm-func-blob-001` | Delete with the Function App |
| Function App storage: table endpoint | Backs the Credential Proxy runtime | Search `auea-pep-stg-apm-func-table-001` | Delete with the Function App |
| Function App storage: queue endpoint | Backs the Credential Proxy runtime | Search `auea-pep-stg-apm-func-queue-001` | Delete with the Function App |
| Automation account | Hosts the three runbooks below | Azure Portal > Automation Accounts > filter "kiosk" | Delete once its runbooks are removed |
| Account creation runbook | Creates each kiosk device's Entra ID account and Key Vault secret | Automation account above > Runbooks | Delete, with its schedule and managed identity role assignment |
| Password rotation runbook | Rotates each device's password and Key Vault secret | Automation account above > Runbooks | Delete, with its schedule and managed identity role assignment |
| OneDrive purge runbook | Clears kiosk OneDrive content | Automation account above > Runbooks | Delete, with its schedule and managed identity role assignment |

**2b. Monitoring, network and routing**

| Name | What it is | Where to find it | Action |
|---|---|---|---|
| Log Analytics workspace (kiosk) | Telemetry sink for the credential pipeline | Azure Portal > Log Analytics workspaces > the one linked to the kiosk resource group | **Delete.** Export evidence first. Build a fresh, schema-named workspace for AVD Sentinel/Insights rather than renaming this one |
| NSG nsg-avd-session-hosts | Session host subnet NSG, kiosk ruleset | Azure Portal search bar > paste `nsg-avd-session-hosts` | **Delete.** Build a fresh NSG with rules written for Standard User AVD SOE's traffic pattern |
| NSG nsg-avd-pe | Private endpoint subnet NSG, kiosk ruleset | Azure Portal search bar > paste `nsg-avd-pe` | **Delete.** Build fresh |
| Kiosk-specific route table | Forces kiosk subnet traffic through the credential-pipeline path | Azure Portal > Route tables > filter "kiosk" | **Delete.** Build fresh for the new subnet design |
| NAT gateway, if provisioned | Stable egress IP for the credential pipeline | Azure Portal > NAT gateways > filter "kiosk" | Delete if no AVD spoke wants it. Confirm first |

**2c. Network foundation - kept, audited rather than renamed**

| Name | What it is | Where to find it | Action |
|---|---|---|---|
| Hub/spoke VNet and subnet allocation (Australia East) | The address block and topology, coordinated via the APM Infrastructure team | Azure Portal search bar > paste `auea-snet-avd-kiosk-pe-001` to locate the hub VNet, or Virtual networks blade > filter "kiosk" | **Keep.** Re-coordinating a new CIDR is slow for no security benefit. Audit every rule and route inside it individually (see section 2b for what's actually removed), rename the VNet and subnets to schema |

**2d. Private endpoint DNS registrations**

The zones `privatelink.vaultcore.azure.net`, `privatelink.blob.core.windows.net`, `privatelink.table.core.windows.net`, `privatelink.queue.core.windows.net` and `privatelink.azurewebsites.net` are **shared central zones**, not kiosk-owned - do not delete the zones themselves. Deleting each private endpoint in section 2a automatically removes its own DNS registration from the shared zone. No separate action required here.

### 3. apmkiosk.net.au domain

Owner: Cyber Security, unless stated otherwise.

| Name | What it is | Where to find it | Action |
|---|---|---|---|
| apmkiosk.net.au enrolment/registration DNS records, tenant verification TXT | Domain-verification DNS records | External DNS host for the apmkiosk.net.au zone | Delete once every account using the domain is deleted |
| apmkiosk.net.au managed domain | Custom domain object in the tenant | Entra admin center > Identity > Settings > Domain names | Remove from tenant, only after every account and object referencing it is gone. Owner: Identity and Endpoint |
| apmkiosk.net.au registrar record, lock, null MX, SPF -all, DMARC p=reject | The domain registration itself | Domain registrar portal | **Retain 12 months minimum.** Do not release for tidiness |
| Meraki firewall rule: Key Vault/Credential Proxy egress | Permits the pipeline's outbound traffic | Meraki dashboard > Security & SD-WAN > firewall rules > filter "kiosk" | Delete. Owner: Network team |
| Palo Alto security policy rule: Key Vault/Credential Proxy egress | Permits the pipeline's outbound traffic | Panorama > security policy rules > filter "kiosk" | Delete. Owner: Network team |
| Zscaler enterprise application | Kiosk identity object in Entra for Zscaler SSO | Entra admin center > Enterprise applications > filter "kiosk" | Review, then delete. Owner: Stratus with Cyber Security |
| Zscaler SCIM provisioning job | Syncs kiosk identity to Zscaler | Entra admin center > Enterprise applications > the app above > Provisioning | Review, then delete |
| apm-js-kiosk-users-internet group | Group Zscaler policy targets | Entra admin center > Groups > search "apm-js-kiosk-users-internet" | Review, then delete |
| Zscaler identity provider configuration | IdP config referencing the kiosk identity model | Zscaler admin portal > Administration > IdP Configuration | Review, then delete |

Do not delete the four Zscaler rows before the Zscaler provisioning workshop (DR-013, Participant Kiosk design) concludes - the replacement forwarding model determines which are still required.

### 4. AVD test environment (FVE)

Found in APM-AVD Test Network Detail Design V0.2. Its own document sets a 60-day default lifespan and a build-readiness trigger. **Confirm by resource query whether it was already decommissioned** before assuming any row below still applies. Owner: Cloud and Azure, unless stated otherwise.

| Name | What it is | Where to find it | Action |
|---|---|---|---|
| Resource group auea-rg-avd-test-fve-001 | Contains the whole FVE build: VNet, subnets, session host VMs | Azure Portal search bar > paste `auea-rg-avd-test-fve-001` | Delete. Removes the VNet, subnets and `vm-fvehost-*` VMs in one action |
| Host pool HP-APM-Kiosk-FVE | AVD test host pool | Nerdio Manager, or Azure Portal > Azure Virtual Desktop > Host pools | Deleted 12/08/2026 |
| Workspace WS-APM-Kiosk-FVE | AVD test workspace | Azure Portal > Azure Virtual Desktop > Workspaces | Deleted 12/08/2026 |
| Application group AG-APM-Kiosk-FVE-Desktop | AVD test desktop app group | Azure Portal > Azure Virtual Desktop > Application groups | Deleted 12/08/2026 |
| SG-APM-Kiosk-FVE-Testers | Tester security group | Entra admin center > Groups > search "SG-APM-Kiosk-FVE-Testers" | Delete after the CA policy and test accounts below |
| SG-APM-Kiosk-FVE-SessionHosts | Session-host security group | Entra admin center > Groups > search "SG-APM-Kiosk-FVE-SessionHosts" | Delete after the compliance policy and Intune profile assignments below |
| CA-APM-Kiosk-FVE-Testers | Test Conditional Access policy | Entra admin center > Protection > Conditional Access > search "FVE" | Delete outright |
| Test accounts fve-test{n}@apm.net.au | Real accounts in the main tenant | Entra admin center > Users > filter "fve-test" | Disable, hold 30 days, delete |
| CMP-APM-AVD-SessionHosts | Compliance policy, currently scoped to FVE hosts | Intune admin center > Devices > Compliance policies > search "APM-AVD-SessionHosts" | Confirm not reused by a live AVD SOE test. If unused, delete. If reused, remove only the SG-APM-Kiosk-FVE-SessionHosts assignment |

**FVE-scoped Intune profiles - remove the FVE assignment only, do not delete the profiles (they belong to the production Job Seeker design):**

| # | Profile name | Where to find it | Action |
|---|---|---|---|
| 1 | APM-AVD-OfficeDeviceLicense | Intune admin center > Devices > Configuration profiles > search this name > Assignments | Remove SG-APM-Kiosk-FVE-SessionHosts from Assignments |
| 2 | APM-AVD-AssignedAccess | Same | Remove SG-APM-Kiosk-FVE-SessionHosts from Assignments |
| 3 | APM-AVD-SessionLimits | Same | Remove SG-APM-Kiosk-FVE-SessionHosts from Assignments |
| 4 | APM-AVD-DisconnectOnLock | Same | Remove SG-APM-Kiosk-FVE-SessionHosts from Assignments |
| 5 | APM-AVD-EdgeHardening | Same | Remove SG-APM-Kiosk-FVE-SessionHosts from Assignments |
| 6 | APM-AVD-ProfileCleanup | Same | Remove SG-APM-Kiosk-FVE-SessionHosts from Assignments |

Before reassigning any of these six to a Standard User AVD SOE device group: their *content* was tuned for the kiosk Assigned Access pattern (kiosk-length session limits, kiosk-only Edge hardening, kiosk profile cleanup). Review each setting against Standard User SOE's actual requirements rather than assuming direct reuse.

### 5. Handover to the AVD SOEs

Confirm with the receiving design lead before Stage 3.

| Object | Receiving use case | Used for | Renamed to |
|---|---|---|---|
| Hub and spoke VNet and subnet allocation | Standard User AVD SOE, Developer AVD SOE | Session host subnets, private endpoint subnets, shared services path | Per network foundation naming |
| Microsoft Cloud PKI and SCEP, if retained | Standard User AVD SOE, Privileged Access | Device or user certificates | Decision required first, see section 1e |
| Azure Image Builder prerequisites, if any exist | Developer AVD SOE | The image pipeline the Developer SOE specifies | Confirmed by the Developer design lead |

The FVE (section 4) is **deleted, not handed over**. Rebuild a functional validation environment fresh under AVD naming when required, on fresh Azure Virtual Desktop objects, not the kiosk-scoped resource group.

## Justification

- Removes the only internet-facing endpoint the superseded solution created.
- Closes fourteen Conditional Access policies, a Conditional Access exclusion, and an unowned test environment before an RFFR assessor or an attacker finds them first.
- Frees the naming and address-allocation pattern the Standard User and Developer AVD SOEs need, without losing any of it or carrying forward kiosk-specific rules that don't fit their traffic pattern.

## Implementation plan

**Before starting**

1. Confirm Participant Kiosk V1.0 is approved.
2. Confirm the Participant Kiosk pilot has passed its validation and test plan in full.
3. Complete and file every evidence export in Evidence and close-out.
4. Get sign-off from the Standard User and Developer SOE leads on the Handover table (section 5).
5. Confirm the Zscaler provisioning workshop (DR-013) has concluded.
6. Confirm by resource query whether the FVE (section 4) is still live.

**Execution**

1. **Stage 1 - stop the flow.** Confirm zero kiosk accounts exist (expected, section 1a). Remove the Credential Proxy public endpoint. Fully reversible.
2. **Stage 2 - observe, 30 days.** Confirm zero authentication attempts, zero Key Vault access, zero calls to the proxy.
3. **Stage 3 - hand over.** Rename the VNet/subnet allocation (section 2c) and reassign the section 5 components to their receiving use cases before anything adjacent is deleted.
4. **Stage 4 - delete compute and identity.** Function App, Automation account and its three runbooks, all 14 kiosk Conditional Access policies (section 1b, section 1c - **complete, 12/08/2026**), the two exclusions (section 1d), the Information Barrier segment and policy, kiosk Intune profiles and scripts (section 1f), then confirm zero accounts (section 1a).
5. **Stage 5 - delete vault, monitoring and network.** Key Vault delete and purge. Log Analytics workspace, both NSGs and the kiosk route table (section 2b). Certificate authority revocation only if the section 1e decision is Delete.
6. **Stage 6 - decommission the FVE (section 4).** Nerdio objects, resource group, both groups, the Conditional Access policy, test accounts, then remove the six Intune profile assignments. **Nerdio configuration objects confirmed deleted 12/08/2026.**
7. **Stage 7 - narrow the network.** Remove the Meraki and Palo Alto entries for retired endpoints. Remove the four Zscaler objects once the workshop has concluded.
8. **Stage 8 - remove the domain.** Remove apmkiosk.net.au as a managed domain from the tenant. Retain the registrar record per section 3.

## Verification

- Zero kiosk accounts exist on apmkiosk.net.au before Stage 8.
- Zero calls to the Credential Proxy in the 30 days before Stage 4.
- Zero Key Vault access in the 30 days before Stage 5.
- All 14 Conditional Access policies (section 1b, section 1c) confirmed absent after Stage 4. **Confirmed 12/08/2026.**
- FVE liveness confirmed by resource query before deciding whether Stage 6 applies.
- Both AVD SOE design leads have signed the Handover table (section 5) before Stage 3.

## Test plan

| # | Test | Expected result |
|---|---|---|
| 1 | Authentication attempts against kiosk accounts during the observation window | Zero across 30 days (trivially true - no accounts were created) |
| 2 | Calls to the Credential Proxy endpoint after removal | Zero, confirmed in Function App and network logs |
| 3 | Key Vault access after accounts disabled | Zero, confirmed in the vault audit log |
| 4 | Search Conditional Access for "CA-APM-Kiosk" and "CA-APM-KioskPB" | No results |
| 5 | Conditional Access exclusions referencing SG-APM-Kiosk-Users | None remain, confirmed by policy export |
| 6 | Retained components reachable and named to schema | The section 5 VNet/subnet allocation resolves under its new name; receiving design confirms |
| 7 | Participant Kiosk fleet, throughout the sequence | Fleet compliance, application install state and internet access unchanged |
| 8 | FVE resource group and objects (section 4) | Absent from the subscription, confirmed by resource query after Stage 6 |
| 9 | apmkiosk.net.au domain state | Removed from the tenant's domain list; registrar record still active |

## Out of scope

- The Participant Kiosk design itself - approved separately.
- The APM-KIOSK VLAN, SSID and site network - the Participant Kiosk fleet continues to use these unchanged.
- Estate Intune policies, baselines and Conditional Access set - none were created for the kiosk.
- The Standard User and Developer AVD SOE detailed designs - documented separately.

## Operational risks

- A component is deleted that an AVD SOE needed. Bound: Stage 3 hands over before any adjacent deletion, and both design leads sign off section 5 first.
- Zscaler objects removed before the replacement forwarding model needs them. Bound: sequenced behind the provisioning workshop as an explicit prerequisite.
- The FVE was assumed decommissioned under its own 60-day clause but is still live. Bound: confirmed by resource query in "Before starting" before Stage 6 is skipped.
- Standard User AVD SOE needs the fresh NSGs and route table sooner than they can be authored. Bound: this is a known cost of the Delete-and-rebuild decision in section 2b; raise the NSG rule design with the Standard User SOE lead ahead of Stage 5, not during it.

## Technical risks

- A certificate authority is revoked and a later use case needs it. Bound: held as a decision, not an action, until both design leads confirm. Revocation is not reversible.

## Security risks

- An audit trail is destroyed before export. Bound: evidence export is a prerequisite, not parallel activity. Domain removal is Stage 8, last.
- A Conditional Access exclusion outlives the group it excluded. Bound: removing the exclusion is the same change as deleting the group, not a follow-up task.
- The retired domain name is re-registered and used to phish APM staff or participants. Bound: registration, registrar lock and DMARC reject retained 12 months minimum, reviewed annually.

## Backout plan

| Stage | Trigger | Action |
|---|---|---|
| 1 to 2 | Unexpected authentication, Key Vault access or proxy call during observation | Re-enable the account, restore the licence, republish the endpoint. Fully reversible |
| 3 | Wrong component renamed or reassigned | Rename back. No data lost at this stage |
| 4 onward | Any AVD SOE reports a missing dependency | Not a restoration: rebuild from the design documents. This is why Stages 1 to 3 front-load everything reversible |
| 5 (Key Vault only) | Vault deleted in error | Recoverable for 90 days under soft-delete and purge protection. This is a safety net, not a rollback plan |

## Evidence and close-out

- Export and file Key Vault access logs, the sign-in data for the six enforced CA-APM-KioskPB-* policies, Conditional Access report-only data and Intune device records before any component holding them is deleted. No kiosk account sign-in or audit logs exist, since no accounts were created.
- DEWR notified within 5 days of this material change (removing a tenant-scoped domain and an internet-facing endpoint), on approval and again on completion.
- Statement of Applicability updated: remove controls for the superseded components, add the Participant Kiosk controls.
- Each disposition above raised in the Clew register with an owner and target date.
- Change record updated with outcome, and confirmation that every retained component in section 5 is signed off by its receiving design.
