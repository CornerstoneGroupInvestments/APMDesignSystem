// Findings from the APM Conditional Access tenant export (116 policies, 7 August 2026).
// Source: policies/APM-Conditional-Access-Policies-Export.csv -> policies/ca-policies.js
// Severity: conflict (design says something the tenant contradicts) | flag (needs a decision
// or a fix) | good (the tenant supports the design position) | info | unknown (export cannot tell).
window.CA_ANALYSIS = {
  generated: '7 August 2026',
  counts: { total: 116, enabled: 68, reportOnly: 43, disabled: 5 },
  limits: 'The export carries six columns: name, state, users, groups, applications, grant rules. It does NOT carry exclusions, conditions (locations, platforms, client apps, device filters, sign-in risk), session controls, authentication strengths, or directory-role targets. A blank grant rule therefore means "session control or authentication strength", not "no control". Seven policies show neither users nor groups because they target directory roles, which this export does not render.',
  findings: [

  { id: 'CA-F01', sev: 'conflict', t: 'Fourteen kiosk Conditional Access policies exist in the tenant, not seven, and six of them are enforced',
    d: 'Two families are present. CA-APM-Kiosk-* (seven policies: BlockNonWindows, BlockWebClient, RequireCompliantDevice, WebOnly-Office, DeviceBound, BlockExchangeOnline, BlockTeams) are all report-only and target group 761b688c. CA-APM-KioskPB-* (seven policies: RequireCompliantDevice, BlockNonKioskDevices, BlockNonWindows, BlockLegacyAuth, BlockAuthFlows, BlockRiskySignIn, WebOnlyOffice) target group e0378201 and six of the seven are enabled and enforcing right now.',
    why: 'Both families assign to groups, which in Conditional Access means groups of user identities. The Participant Kiosk has no user identity, so every one of these fourteen policies matches nothing the moment the kiosk user group is retired. Six of them are enforced, so they are live policy objects that will silently become no-ops rather than errors. The decommissioning change request currently disposes of "Kiosk Conditional Access policies (seven)" - it is short by seven, and it does not distinguish the enforced family from the report-only one.',
    action: 'Correct the disposition register to fourteen policies in two named families, with the state of each. Delete both families as part of the same change record that retires the user group. Before deleting the six enforced KioskPB policies, export their report-only and sign-in data as RFFR evidence: they are the only record of what the previous access model actually did.',
    owner: 'Shaun Struik to correct the change request; APM Cyber Security to confirm deletion of the enforced family.',
    refs: ['CA export, CA-APM-Kiosk-* and CA-APM-KioskPB-*', 'Kiosk Decommissioning CR 3.1', 'Participant Kiosk DDD 9.4'] },

  { id: 'CA-F02', sev: 'conflict', t: 'The design states tenant policies that are report-only, not enforced',
    d: 'Participant Kiosk DDD 7.2.4 states: "The tenant\u2019s existing policies (multi-factor authentication for all users, phishing-resistant multi-factor authentication for administrators, legacy authentication block, authentication flow restrictions) continue to apply to APM staff identities." The export contradicts two of those four.',
    why: 'Phishing-resistant MFA is report-only in both places it appears: CA-401 (Administrators, All Apps) and CA-106 (All Users and Guests). AdminRoles_Everything_RequireMFA is also report-only. Tenant-wide MFA via CA-101 is report-only. What IS enforced tenant-wide is AllUsers_AllAccess_MFAorDeviceRequired, whose grant is "mfa OR domainJoinedDevice" - satisfied by a managed device with no MFA prompt at all. Legacy authentication is genuinely blocked (Deny Legacy Auth and CA-100 both enabled). The design overstates the identity controls it is relying on, in the one section a Cyber reviewer will read hardest.',
    action: 'Rewrite the last paragraph of 7.2.4 to name the policies that are actually enforced (Deny Legacy Auth, CA-100 legacy protocols, CA-102 non-AU location block, CA-104 high sign-in risk block, CA-105 bad IPs, CA-201 BYOD no persistence, CA-203 high user risk, AllUsers_AllAccess_DeviceRequired, AllUsers_AllAccess_MFAorDeviceRequired) and state that phishing-resistant MFA for administrators is currently report-only, so it must not be cited as a compensating control anywhere in this design.',
    owner: 'Shaun Struik to correct 7.2.4. APM Cyber Security to confirm whether CA-401 and CA-106 are scheduled for enforcement.',
    refs: ['CA export, CA-401 / CA-106 / CA-101 / AdminRoles_Everything_RequireMFA', 'Participant Kiosk DDD 7.2.4'] },

  { id: 'CA-F03', sev: 'good', t: 'The export proves the device-filter block is load-bearing, not belt-and-braces',
    d: 'Two tenant-wide policies are enabled for All users against All apps: AllUsers_AllAccess_DeviceRequired (grant: compliantDevice OR domainJoinedDevice) and AllUsers_AllAccess_MFAorDeviceRequired (grant: mfa OR domainJoinedDevice).',
    why: 'A Participant Kiosk is Entra-joined and carries an Intune compliance policy (7.2.5), so it satisfies both grants. A staff credential typed on a kiosk would pass the estate\u2019s strongest tenant-wide controls - and pass the second one without an MFA prompt, because the device alone satisfies it. Nothing in the inherited policy set stops corporate sign-in from this hardware. Only an explicit device-filter block does. This is the strongest available argument for DR-010 and it is currently absent from the design.',
    action: 'Cite both policies by name in 7.2.4 as the reason the block exists: being managed and compliant makes the fleet look like a corporate device to every existing grant, so denial has to be explicit.',
    owner: 'Shaun Struik to add the citation.',
    refs: ['CA export, AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired', 'Participant Kiosk DDD 7.2.4, DR-010'] },

  { id: 'CA-F04', sev: 'info', t: 'A separate non-AU location block is not needed - the tenant already enforces one',
    d: 'CA-102 (All Users and Guests, All Apps, locations except AU and corporate, block) is enabled. CA-105 (block access from bad IPs) is enabled. CA-500 and CA-501 do the same for guests.',
    why: 'The superseded V1.6 design created its own BlockNonAU policy because the separate kiosk tenant had none. In the corporate tenant that control already exists and applies to all users, so a fleet-specific version would be duplication of the kind this export shows plenty of already.',
    action: 'Where the design or its risk register refers to country-level location control, cite CA-102 rather than creating a policy. AllUsers_UnapprovedCountries_Block is the older report-only twin of CA-102 and should be retired by APM as part of general hygiene.',
    owner: 'Shaun Struik to cite; APM Cyber Security owns retiring the duplicate.',
    refs: ['CA export, CA-102 / CA-105 / AllUsers_UnapprovedCountries_Block'] },

  { id: 'CA-F05', sev: 'info', t: 'Risk-based Conditional Access is live in the corporate tenant, and the fleet gets none of it',
    d: 'CA-104 (high sign-in risk, block), CA-203 (high user risk, require MFA and password reset), AdminRoles_Risky_Sign-ins_MFA and AdminRoles_RiskyUsers_MFA_Password_Reset are all enabled, which means Entra ID P2 risk signals are licensed and in use for staff identities.',
    why: 'Two consequences. First, the V1.6 concern that F3 licensing left no risk-based Conditional Access was an artefact of the separate tenant and is moot here. Second, every one of these policies evaluates a user - identity risk, sign-in risk, user risk. A fleet with no user identity is never evaluated by any of them. That is not a gap, because there is no identity to protect, but the design should say so rather than let a reviewer assume inherited coverage.',
    action: 'Add one sentence to 7.2.4: risk-based policies key on a user principal and therefore do not apply to this fleet; the device-centred equivalents are the compliance policy, App Control and the Defender alerting in 9.2.',
    owner: 'Shaun Struik.',
    refs: ['CA export, CA-104 / CA-203 / AdminRoles_Risky_*', 'Participant Kiosk DDD 7.2.4, 9.2'] },

  { id: 'CA-F06', sev: 'flag', t: 'The new policy name matches no convention in use in the tenant',
    d: 'The design names its policy APM-USER-CAP-Block Participant Kiosk Access-P-1.0. The tenant\u2019s current Conditional Access convention is CA-nnn - <audience> - <apps> - <condition> - <action>, used by more than forty policies, with a number series by audience: CA-1xx all users and guests, CA-2xx organisation users, CA-3xx contract or community populations, CA-4xx administrators, CA-5xx guests.',
    why: 'The Intune Naming Schema governs Intune objects; Conditional Access has its own established convention and a reviewer will read a non-conforming name as an object created outside the process. CA-100 to CA-106 are in use, so CA-107 is the next free number in the all-users series.',
    action: 'Rename to CA-107 - All Users & Guests - All Apps - Participant Kiosk Devices - Block, and record the CA naming convention in the Intune Naming Schema addendum so the two planes are documented together. Note that four numbers are already duplicated in the tenant (CA-204, CA-205, CA-207, CA-208), so confirm CA-107 is unused before creating it.',
    owner: 'Shaun Struik to rename; APM Cyber Security to confirm the number.',
    refs: ['CA export, CA-100 to CA-106', 'Participant Kiosk DDD 7.2.4', 'policies/APM_Intune_Naming_Schema_Addendum.md'] },

  { id: 'CA-F07', sev: 'flag', t: 'Thirty-seven per cent of the Conditional Access estate is report-only, including MFA controls',
    d: '43 of 116 policies are enabledForReportingButNotEnforced and 5 are disabled; only 68 enforce. Report-only includes CA-101 (tenant-wide MFA), CA-106 and CA-401 (phishing-resistant MFA), AdminRoles_Everything_RequireMFA, AdminRoles_Everything_RequireDevice, CA-103 (block unsupported platforms), CA-400 and CA-402 (administrator device and location restrictions), and Guests_Everything_MFARequired.',
    why: 'A report-only policy generates evidence but grants nothing and denies nothing. Essential Eight maturity and the Identity and IT Access Management Standard 4.1.2 both require MFA to be enforced for users, and administrator hardening is the control an assessor tests first. This is wider than our design, but it is a live compliance exposure that any design citing "the tenant enforces MFA" as a compensating control would inherit.',
    action: 'Raise as an estate finding with APM Cyber Security: which of the report-only policies are staged for enforcement, and on what date. Until then, no design in this project may cite tenant MFA or phishing-resistant MFA as a compensating control.',
    owner: 'APM Cyber Security. Shaun Struik to track as an assumption in any design that would otherwise rely on it.',
    refs: ['CA export, state column', 'Identity and IT Access Management Standard 4.1.2'] },

  { id: 'CA-F08', sev: 'flag', t: 'Policy hygiene: duplicates, test artefacts and enforced policies with provisional names',
    d: 'CA-501 ends in the literal word COPY and is enabled. zzADA_Block_Policy_Test_20250626 is a report-only test policy still present. APM Pilot Block Policy and APM Pilot Policy are both enabled, both block All apps, and both carry provisional names. Four CA numbers are duplicated (CA-204, CA-205, CA-207, CA-208). Eight policies are _Reporting twins of live policies. Four names carry leading or trailing whitespace. Eighteen names contain a corrupted separator character where an en dash was intended. Three separate policies block legacy authentication (Deny Legacy Auth enabled, CA-100 enabled, AllUsers_AllAccess_BlockLegacy report-only).',
    why: 'None of this breaks the Participant Kiosk, but it is the environment our policy objects join, and it sets the standard a reviewer will hold our naming to. An enabled block policy called "APM Pilot Block Policy" is the kind of object that is impossible to safely delete later because nobody remembers what it was for.',
    action: 'Supply as an estate hygiene list to APM Cyber Security, separate from this design. For our own objects: one control, one policy, conforming name, no provisional words, no trailing whitespace.',
    owner: 'APM Cyber Security owns remediation. Shaun Struik to supply the list.',
    refs: ['CA export'] },

  { id: 'CA-F09', sev: 'unknown', t: 'The export cannot verify the corporate assignment exclusion register',
    d: 'Participant Kiosk DDD 4.3.8 requires every corporate policy, application and script targeting All Devices, All Users or a broad dynamic group to be explicitly excluded for the fleet before the first device enrols. This export carries no exclusions column.',
    why: 'Nine policies target All users against All apps and cannot be checked for exclusions from this data. The Conditional Access half of the exclusion register is therefore unverified, and the decommissioning risk CR-05 (an exclusion outliving the group it excluded) cannot be tested either.',
    action: 'Request an export that includes conditions and exclusions - Graph identity/conditionalAccess/policies returns the full object, including includeUsers, excludeUsers, includeGroups, excludeGroups, device filters, locations, platforms and client app types. Until then, mark the Conditional Access rows of the 4.3.8 register as unverified rather than complete.',
    owner: 'APM Cyber Security to supply the full export; Shaun Struik to re-run this analysis against it.',
    refs: ['Participant Kiosk DDD 4.3.8', 'Kiosk Decommissioning CR CR-05, V-04'] },

  { id: 'CA-F10', sev: 'flag', t: 'Two enabled policies do the opposite of what their name says',
    d: 'LimitedUsers_EmailOnly_Block is enabled with a grant of mfa, not block. CA-504 - Guests (Assure) - PowerBI - Risky sign ins - Block is enabled with a grant of mfa, not block.',
    why: 'A name that states the wrong action is worse than no name: an operator reading the policy list believes a block is in place where a prompt is. Both are enforced, so the discrepancy is live. CA-APM-Kiosk-WebOnly-Office is a third case in a milder form - the name implies a scoped web-only condition while the export shows All applications with a block grant.',
    action: 'Report to APM Cyber Security for renaming or correction. Confirm which behaviour was intended in each case before the retired kiosk policy is deleted, in case the intent is worth carrying forward.',
    owner: 'APM Cyber Security.',
    refs: ['CA export, LimitedUsers_EmailOnly_Block / CA-504 / CA-APM-Kiosk-WebOnly-Office'] }
  ]
};
