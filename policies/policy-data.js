// APM policy register. Policy and standard PDFs live in policies/; environment and as-built
// documents in reference/environment/; the ESLZ corpus in reference/eslz/; APM template set in
// reference/apm-document-templates/. Every requirement is traceable to a named section.
// Every requirement here is traceable to a named section of a real document.
window.POLICY_DATA = {
  generated: '7 August 2026',
  docs: [
    {
      id: '09.03.055-1.2', slug: 'compliance-management-plan',
      title: 'Compliance Management Plan - RFFR and ISO/IEC 27001 (ANZ)',
      cat: 'Governance & Compliance', owner: 'GM - Quality & Compliance', published: '26/07/2026',
      classification: 'Internal', pages: 9, file: 'APM-Compliance-Management-Plan-RFFR-ISO27001-ANZ.pdf',
      purpose: 'Establishes the framework for ongoing compliance with DEWR Right Fit for Risk (RFFR) accreditation and ISO/IEC 27001:2022 ISMS certification, including governance and monitoring mechanisms.',
      reqs: [
        { r: 'Statement of Applicability (SoA) is mandatory', d: 'Lists all ISO 27001 Annex A controls, states applicability, justifies inclusion/exclusion, and references how each applicable control is implemented. The RFFR SoA uses a DEWR-prescribed template that additionally covers DEWR contractual obligations and Australian Government ISM controls.' },
        { r: 'Three Lines of Defence governance model', d: 'First line: business units, IT teams, system owners own and manage risk. Second line: Information Security, Risk & Compliance provide oversight. Third line: independent assurance/audit.' },
        { r: 'All risks, controls, actions and improvements tracked in Clew', d: 'Each action is mapped to relevant business risks and existing controls for traceability.' },
        { r: 'Governance cadence', d: 'Steering Committee quarterly (chair: RFFR Program Manager). System Owners Forum monthly. Working Group fortnightly.' },
        { r: 'Quarterly ISM update review', d: 'Published ISM updates reviewed each Mar, Jun, Sep, Dec; applicability and risk analysis performed and new requirements actioned. RFFR Program Manager owns the process.' },
        { r: 'Quarterly control validation', d: 'Control owners verify implementation status, implementation details and applicability every quarter.' },
        { r: 'Annual internal audit', d: 'Internal audit of ISMS controls covering Annex A controls, risk treatment plans, ISM controls, and RFFR core expectations for personnel, physical and cyber security.' },
        { r: 'Annual ISMS management review', d: 'Formal management review at least annually, assessing ISMS effectiveness, external/internal issue changes, audit results, incident trends and stakeholder feedback.' },
        { r: 'RFFR accreditation maintenance - annual', d: 'Updated documentation submitted 6 weeks prior to the annual anniversary of accreditation.' },
        { r: 'RFFR re-accreditation - three-yearly', d: 'Must be completed by the third anniversary of initial accreditation; documents submitted 6 weeks before the anniversary date.' },
        { r: 'Notify DEWR within 5 days of environment changes', d: 'Any change to APM or subcontractor circumstances that may affect the risk profile must be notified within 5 days to enable re-categorisation.' },
        { r: 'ISO 27001 audit cycle', d: 'External surveillance audits in Year 1 and Year 2; full re-certification audit in Year 3. Last re-certification was 2025.' },
        { r: 'Policy and procedure review at least annually', d: 'ISMS and RFFR-related policies and procedures reviewed at least annually, more often if the operating environment changes.' }
      ],
      external: ['RFFR accreditation requirements (DEWR)', 'ISO/IEC 27001:2022', "ASD Information Security Manual (ISM)", 'Essential Eight', 'DEWR Deed and contractual clauses', 'Privacy Act (Australian Privacy Principles)'],
      impact: [
        { level: 'info', t: 'Every design we produce needs an SoA row, not just a design section', d: 'A control claimed in a DDD must appear in the RFFR SoA with implementation detail. The Participant Kiosk RFFR SoA (ISM Sept 2025 v7.7m) is the artefact that carries our exclusions.' },
        { level: 'info', t: 'Design changes may trigger a 5-day DEWR notification', d: 'A material change to the operating environment (new tenant, new internet-facing endpoint, new subcontractor) is notifiable within 5 days. The Participant Kiosk introduces neither: the fleet enrols into the existing APM corporate tenant and publishes no internet-facing endpoint. What may still be notifiable is the decommissioning of the retired build - confirm with the RFFR Program Manager.' }
      ]
    },
    {
      id: '09.01.037-2.1', slug: 'ai-policy',
      title: 'Artificial Intelligence Policy',
      cat: 'Governance & Compliance', owner: 'Chief Information Officer', published: '24/07/2026',
      classification: 'Internal', pages: 3, file: 'APM-Artificial-Intelligence-Policy.pdf',
      purpose: 'Ensures ethical, responsible and effective use of AI across the APM Group (Ancora TopCo Limited and subsidiaries), for all employees, contracted staff, contractors, consultants and stakeholders working within APM\u2019s environment.',
      reqs: [
        { r: 'AI use requires ELT sign-off', d: 'Businesses must only use AI where the use has been signed off by the ELT member for that business, with assessments completed by both the regional Data Privacy and Digital leaders.' },
        { r: 'Business case + privacy impact assessment required', d: 'Reviewed by the local Digital team under the APM Group AI approval process before final ELT business case sign-off. Assessment covers what data is processed and how it is hosted and accessed by the AI platform.' },
        { r: 'Data controller approval where government or state data is processed', d: 'Additional approval may be required from the data controller.' },
        { r: 'Risk review before feeding APM content into any AI service', d: 'A review of how that information may be used and shared with third parties is required first.' },
        { r: 'Human in the loop for decision-making', d: 'APM commits to always having a human in the loop; removing a human decision that should not be made by AI (for example whether a participant retains benefits) is prohibited.' },
        { r: 'Regular bias audits', d: 'Conducted by business contract/service line owners and business process/data owners to check for and mitigate bias where AI is in use.' },
        { r: 'Prohibited uses', d: 'IP theft or plagiarism; offensive or vulgar content; removing a human decision that should not be automated; reverse engineering or adding third-party AI code into APM systems.' },
        { r: 'AI data loss incidents are reportable', d: 'Any data shared within AI in breach of an APM contract or regional legislative requirement (PII, client data, IP, commercially sensitive information) must be reported to the Data Privacy team or management.' },
        { r: 'Every shared AI agent or use case has a named owner', d: '"If you built it, you own it until it is formally reassigned." A central regional Agent register records purpose, owner and audience.' },
        { r: 'Lifecycle review and retirement', d: 'Shared agents and use cases reviewed periodically; solutions with no value or no active owner are retired.' },
        { r: 'Training for all staff with AI tool access', d: 'Ethical-use training aligned to local legislative and contractual requirements.' }
      ],
      impact: [
        { level: 'flag', t: 'Participant Kiosk allows public AI tools - check this against the approval process', d: 'Participant Kiosk user story 14 permits "public AI tools allowed unless high risk" via Zscaler category filtering (General AI & ML Applications, Generative AI and ML Applications are Allow categories in the ZIA policy). This policy governs APM\u2019s use of AI, and arguably not a participant browsing to a public site on an ephemeral device - but the categories are explicitly allow-listed in an APM-managed control, so confirm with Data Privacy whether that constitutes APM "using" AI and needs an assessment.' }
      ]
    },
    {
      id: '09.03.020-6.0', slug: 'trusted-insider',
      title: 'APM Trusted Insider Program',
      cat: 'Identity & Access', owner: 'CISO', published: '30/06/2026',
      classification: 'Internal', pages: 2, file: 'CS-Trusted-Insider-Program.pdf',
      purpose: 'Details the controls and processes implemented to mitigate trusted insider threats, where privileged access and knowledge of business process make threats harder to detect.',
      reqs: [
        { r: 'Trusted insider population defined', d: 'IT System Administrators, IT Developers, Database Administrators, Executives, General Managers and above, Finance department staff, and any user with elevated permissions or access to APM data.' },
        { r: 'Role-based training programme', d: 'Examples: invoice fraud training for Finance, security training for IT Developers, CEO fraud training for Executives. Plus increased phishing awareness campaigns targeted at all trusted insiders.' },
        { r: 'Separate privileged accounts', d: 'Staff performing privileged administration tasks use separate accounts carrying trusted insider and additional privileged account protections.' },
        { r: 'Additional password complexity on privileged accounts', d: 'Applied to all trusted insider privileged accounts.' },
        { r: 'Contractors held to the same controls as staff', d: 'No reduced control set for contracted personnel.' },
        { r: 'Enterprise password management solution', d: 'IT Trusted Users are provisioned access to an enterprise password management solution.' },
        { r: 'Protective monitoring via external SOC', d: 'Logging covers authentication events, endpoint protection alerts and internet browsing activity. Monitoring includes Microsoft Purview Insider Risk Management.' }
      ],
      impact: [
        { level: 'info', t: 'Privileged Access SOE (P4) inherits this directly', d: 'The two privileged tiers (zz / xy) are trusted insider populations: separate accounts, additional password complexity, enterprise password manager, and Purview Insider Risk Management monitoring are all mandated here, not optional design choices.' },
        { level: 'flag', t: 'Participant Kiosk local administrator account needs a trusted-insider decision', d: 'The Participant Kiosk carries one local administrator account per device. If it is treated as "a user with elevated permissions", this policy requires separate-account handling, additional password complexity and SOC monitoring. The design manages its password with Windows LAPS (§7.2.3): 30 characters, distinct per device, rotated every 30 days, escrowed to Entra ID, with retrieval audited to Sentinel. Confirm that satisfies the program owner.' }
      ]
    },
    {
      id: '09.03.021-5.0', slug: 'continuous-monitoring',
      title: 'Continuous Monitoring Plan',
      cat: 'Monitoring & Assurance', owner: 'CISO', published: '30/06/2026',
      classification: 'Internal', pages: 5, file: 'CS-Continuous-Monitoring-Plan.pdf',
      purpose: 'Establishes continuous monitoring (CONMON) per NIST SP 800-137 to proactively identify, prioritise and respond to security vulnerabilities and maintain awareness of threats and control effectiveness.',
      reqs: [
        { r: 'CONMON performed by independent, suitably skilled personnel', d: 'By a member of the Cyber Security Team or someone with a similar skillset who is independent of the system being assessed; may be internal or third party. Ensures no conflict of interest.' },
        { r: 'Continuous vulnerability monitoring tooling', d: 'All APM systems are continuously monitored using Microsoft Defender for Cloud and Defender for Endpoint. Wiz.io continuously monitors cloud service environments for configuration issues.' },
        { r: 'Weekly vulnerability review meeting', d: 'Held between the Cyber Security team and Digital Operations to review results and remediation activities per the Patch & Vulnerability Management Standard.' },
        { r: 'Daily threat landscape monitoring', d: 'Monitored by the Cyber Security team daily and relayed to relevant business teams; threat reports incorporated into Enterprise and Business Unit Operational Risk Registers.' },
        { r: 'Vulnerability assessment triggers', d: 'For new systems before deployment; whenever major or significant changes occur; where new or significant threats are identified; as a result of a specific security incident; and at regular intervals.' },
        { r: 'Penetration testing triggers', d: 'Prior to a system going live; after material upgrades or modifications to the technology environment; and at an appropriate frequency, generally annually. All key existing APM systems are pen tested annually.' },
        { r: 'Pen test approval and scheduling', d: 'Approval required from the system owners of all in-scope systems before testing. The schedule is agreed with System Owners and approved by the CISO. Testing performed by the Cyber Security team or external testers depending on contractual requirements.' },
        { r: 'Intrusion detection and firewall alerting', d: 'HIPS for behaviour-based detection; NIDS/NIPS for known intrusion profiles; alerts generated for information flows that contravene firewall rules.' },
        { r: 'Vulnerability mitigation hierarchy', d: 'Prevent (input validation, output filtering, additional access controls, firewall rules), detect (IDS, logged alert monitoring), contain (outbound firewall rules, mandatory access control, file system permissions), resolve (disable functionality, vendor guidance, migrate product, engage developer). Prioritised by risk and implemented as soon as practicable.' }
      ],
      impact: [
        { level: 'flag', t: 'Participant Kiosk penetration testing must complete before go-live, not before national rollout', d: 'The Participant Kiosk implementation sequence puts penetration testing at Phase 4, ahead of Phase 5 national rollout. This plan requires pen testing "prior to a system going live" - confirm whether the pilot devices in Phase 3 count as live. It also requires System Owner approval and a CISO-approved schedule, which the design does not yet name.',
          det: {
            policy: 'Continuous Monitoring Plan, Penetration Testing: performed prior to a system going live; after material upgrades or modifications; and generally annually. Approval required from the system owners of all in-scope systems. Schedule agreed with System Owners and approved by the CISO.',
            design: 'Participant Kiosk DDD \u00a79.5 Implementation Sequence: Phase 3 provisions 5-10 pilot devices across 2-3 sites; Phase 4 conducts pre-production penetration testing; Phase 5 is national rollout.',
            why: 'Phase 3 puts real devices in real sites with real participants before the pen test in Phase 4. If those pilot devices are "live", the sequence inverts the policy requirement. There is also no named System Owner for the Participant Kiosk and no CISO-approved test schedule in the plan, both of which are prerequisites rather than formalities.',
            options: [
              'Confirm the pilot is a controlled test rather than live service (no real participant PII), which keeps the current sequence valid - and say so in \u00a79.5.',
              'Or move a scoped penetration test ahead of Phase 3 pilot deployment and keep Phase 4 as the full pre-production test.',
              'Either way, name the Participant Kiosk System Owner and get the test schedule CISO-approved before Phase 3.'
            ],
            owner: 'Shaun Struik with the PM to sequence; CISO approves the schedule; System Owner to be named.',
            refs: ['Continuous Monitoring Plan, Penetration Testing', 'Participant Kiosk DDD \u00a79.5.3', 'Participant Kiosk DDD \u00a79.5.4']
          } },
        { level: 'good', t: 'Device-based Defender for Endpoint onboarding satisfies this plan', d: 'This plan states all APM systems are continuously monitored via Defender for Cloud and Defender for Endpoint. The Participant Kiosk fleet is licensed by device (Defender for Endpoint P2 per device, §7.2.1) inside the existing APM corporate tenant, so onboarding is native and no cross-tenant arrangement is needed. The earlier separate-tenant complication was removed by the P1 pivot.' },
        { level: 'flag', t: 'Confirm the retired cloud components leave Wiz.io scope on decommissioning', d: 'Wiz.io continuously monitors cloud service configuration. The retired build\u2019s Key Vault, Function App and Automation Account are in that scope until they are deleted. The Participant Kiosk itself creates no cloud service resources. Confirm the decommissioning change record removes them from Wiz inventory rather than leaving dormant, still-monitored resources behind (§9.4 and the Kiosk Decommissioning change request).' }
      ]
    },
    {
      id: '09.03.027-5.0', slug: 'cryptography',
      title: 'Cryptography and Key Management Standard',
      cat: 'Cryptography', owner: 'CISO', published: '02/07/2026',
      classification: 'Internal', pages: 8, file: 'CS-Cryptography-and-Key-Management-Standard.pdf',
      purpose: 'Defines the cryptographic technologies APM must adhere to and how encryption keys are managed. Applies to all APM IT Software Assets (internal or externally managed) and Cloud Service Providers hosting APM Information Assets.',
      reqs: [
        { r: 'Approved algorithms and minimum key sizes', d: 'AES 128 bits min, 256 preferred (never ECB mode; AES-128 phased out by 2030). ECC base point order and key size \u2265224 bits (NIST SP 800-186 curves). RSA 2048 min, 3072 preferred - separate key pairs for encryption and signing. SHA-256/384/512. Diffie-Hellman 2048 min, 3072 preferred, ephemeral variants only, anonymous DH not permitted for TLS. Elliptic Curve DH 224 bits. ECDSA 224 bits, NIST P-384 preferred. ML-DSA-65/87 per FIPS 204. ML-KEM-768/1024 per FIPS 203.' },
        { r: 'Only approved algorithms may be used', d: 'Use of any other cryptographic algorithm, including proprietary ones, is prohibited.' },
        { r: 'Post-quantum cryptography in new systems', d: 'Should be implemented in new systems and services where supported. FIPS 140-3 validated modules preferred, not required. Approved PQC strengths: AES-256, SHA-384/512, ML-KEM-1024, ML-DSA-87 (weaker variants not approved beyond 2030).' },
        { r: 'TLS cipher suites are explicitly enumerated', d: 'TLS 1.2: sixteen approved suites (ECDHE/DHE with AES-256/128 GCM, CCM and CCM_8). TLS 1.3: TLS_AES_256_GCM_SHA384, TLS_AES_128_GCM_SHA256, TLS_AES_128_CCM_SHA256, TLS_AES_128_CCM_8_SHA256.' },
        { r: 'Encryption at rest by classification and zone', d: 'Internal: MUST use current ASD approved encryption in an uncontrolled zone (internet locations, customer devices); SHOULD use encryption in an externally controlled zone (SaaS); not required but preferred in semi-controlled and controlled zones. Confidential and Restricted: MUST use current ASD approved encryption in uncontrolled, externally controlled and semi-controlled zones; risk-based decision in the controlled zone.' },
        { r: 'Encryption in transit by classification', d: 'Internal, Confidential and Restricted MUST use current ASD approved encryption over public/guest networks, corporate networks and secured networks alike. Public classification not required but preferred.' },
        { r: 'Key rotation maximum age', d: 'Production, internet-facing or holding production data: 60 days. Production, not internet-facing: 90 days. Non-production, internet-facing: 90 days. Non-production, not internet-facing: 180 days. Rotation applies "where possible".' },
        { r: 'Key custodianship', d: 'Keys may only be distributed to and accessed by authorised staff within the IT Department (Key Custodians). Where possible X.509 certificates are installed without the ability to be exported.' },
        { r: 'Key lifecycle obligations', d: 'Keys updated once no longer valid or if there is a risk of disclosure. Compromised or corrupted keys must be revoked. All access to and actions against keys and the PKI are captured at time of issue. Recovery of encrypted data supported where possible.' },
        { r: 'Loss of keys is immediately reportable', d: 'Loss of any keys, X.509 certificates or other cryptographic materials must be immediately reported to the IT Security Team, and to the relevant contract or government body where needed to satisfy contractual requirements.' },
        { r: 'Wildcard certificates must not be used', d: 'Due to increased risk. Public-facing web services should use a commercial Trusted Certificate Authority; internally consumed services use APM\u2019s PKI certificate platform.' },
        { r: 'Cryptographic artefacts require D&T Operations approval', d: 'X.509 certificates and keying material must be requested and approved by the D&T Operations team, with the request recorded in the IT Service Management application.' }
      ],
      impact: [
        { level: 'good', t: 'No APM-managed key or credential remains on the Participant Kiosk, so the rotation table does not bind', d: 'The V1.6 design stored a per-device passphrase as an Azure Key Vault secret on a 12-month schedule, which sat against the 60-day maximum age for production internet-facing keys. The P1 pivot removed it entirely. The session credential is now 32 random characters generated on the device by a signed remediation, written only to the Winlogon LSA secret, known to nobody and never held in a vault; the only APM-managed password is the local administrator account, managed by Windows LAPS at 30 characters rotated every 30 days (§7.2.3), which is inside this standard\u2019s tightest bracket. The former CISO-ruling request is withdrawn.' },
        { level: 'info', t: 'Certificate requirements apply again only if EAP-TLS Wi-Fi is adopted', d: 'The SCEP-issued device certificates and the internet-facing Credential Proxy that carried mTLS are both removed, and Microsoft Cloud PKI is being decommissioned with the retired build. If certificate-based Wi-Fi authentication is later adopted in place of the pre-shared key, this standard applies to it: RSA \u22652048 (3072 preferred) or ECC \u2265224, SHA-256 or better, no wildcard anywhere in the chain, and a D&T Operations-approved request recorded in the ITSM tool.' },
        { level: 'good', t: 'Transport security is now specified rather than left to defaults', d: 'The fleet hosts no service endpoint, so the position is a client one: §7.2.7 states TLS 1.2 as the floor with TLS 1.3 preferred and the approved suite list from this standard, closing the cipher-suite gap the V1.6 review raised against the Credential Proxy.' },
        { level: 'info', t: 'YubiKey design alignment', d: 'The phishing-resistant authentication design should cite this standard for its certificate and algorithm choices, including the FIPS-validated module preference.' },
        { level: 'info', t: 'Post-quantum expectation for new builds', d: 'Any new service should note PQC support where the platform allows it, since this standard asks for it in new systems.' }
      ]
    },
    {
      id: '09.03.005-7.0', slug: 'incident-response',
      title: 'Cyber Incident Response Plan',
      cat: 'Incident Response', owner: 'CISO', published: '02/07/2026',
      classification: 'Confidential', pages: 13, file: 'CS-Cyber-Incident-Response-Plan.pdf',
      purpose: 'The formalised, pre-approved response requirements for cyber security incidents, built on NIST 800-53, 800-61 and 800-83. Applies to all APM information systems, operational data, networks and any person or device accessing them.',
      reqs: [
        { r: 'Six-phase methodology', d: 'Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned.' },
        { r: 'Priority-1 - immediate response including out of hours', d: 'Critical system failure preventing multiple customers accessing services beyond acceptable downtime, or widespread exposure of sensitive customer data. Create ServiceNow ticket, notify all stakeholders, establish Crisis Management Team for external communications, stand up Teams War Room, Google Workspace available for out-of-band communication.' },
        { r: 'Priority-2 - response within 15 minutes in business hours', d: 'On-call best effort out of hours. Suspected exploitation of a misconfiguration or vulnerability, exposure of sensitive customer data, or sweeping malware infection across multiple hosts. Monitor for escalation to P1.' },
        { r: 'Priority-3 - within 1 hour', d: 'Issues preventing one or more customers using services, security misconfiguration without evidence of exploitation, or commodity malware isolated to a single host.' },
        { r: 'Priority-4 - best effort same business day', d: 'Issues requiring triage rather than immediate attention.' },
        { r: 'Reporting path', d: 'All staff who identify a real or potential incident must immediately report it using APM Assist. The Incident Manager records details in the online Major Cyber Security Incident Register and immediately notifies the CISO. All incidents logged in ServiceNow; P1 and P2 also update the Major Incident Register.' },
        { r: 'CIRT Manager has delegated containment authority', d: 'Delegated authority to take whatever action is necessary to immediately contain an incident and limit damage, without waiting for Executive approval.' },
        { r: 'DEWR and ASD notification for personal or sensitive data incidents', d: 'Where the incident affects an environment holding personal or sensitive data, the CIRT Manager and Data Owner notify the Department as Accreditation Authority as soon as possible via securitycompliancesupport@jobs.gov.au, and notify the Australian Signals Directorate seeking assistance. No action that could affect evidence integrity is taken prior to ASD involvement (ISM control 915c).' },
        { r: 'Containment prioritised over evidence collection', d: 'Unless instructed otherwise by law enforcement.' },
        { r: 'Evidence retention', d: 'Network traffic logs retained for 7 days prior to discovery of the incident; artefacts preserved; all retention or removal logged in the chain of custody document. Low-priority incident files retained 1 year; all others per Legal Team requirements.' },
        { r: 'Out-of-band communications fallback', d: 'If Azure becomes untrusted or unavailable, the CIRT Manager may move all communications to the Google Workspace environment.' },
        { r: 'Coordinated eradication', d: 'Intrusion remediation conducted in a single coordinated planned outage to avoid alerting the adversary, using an alternative system to plan if email/messaging/collaboration is compromised.' },
        { r: 'Post Incident Report within 7 days', d: 'The CIRT Manager compiles documentation and evidence into a Post Incident Report, formally reviewed with those impacted; ideally complete within 7 days.' },
        { r: 'Annual IR plan testing', d: 'Complete regular testing of the Incident Response Plan, at least annually.' },
        { r: 'CIRT composition', d: 'Core: CISO, CIRT Manager, subject matter experts, Global Threat Lead, APM Security Analysts and Engineers, SOC (Quorum Cyber), Application Managers, IT Operations Manager, IT Infrastructure Lead as required.' },
        { r: 'Supporting playbooks', d: 'Ransomware; Phishing / Malicious Link Click; Data Breach / Leak / Spill; Malware Infection; DDoS; Theft / Loss of IT Asset. Plus Incident Communication Process, CIRT Incident Handler Checklist, IR RACI Matrix, Chain of Custody Tracking Form.' }
      ],
      impact: [
        { level: 'good', t: 'The Participant Kiosk now references this plan rather than inventing a procedure', d: '\u00a79.1 states that a suspected or actual security incident involving a Participant Kiosk is reported through APM Assist and logged in ServiceNow under this plan, with the "Theft / Loss of IT Asset" playbook covering device loss. The fleet-specific steps are short because the pivot removed most of them: there is no cloud credential to rotate and no SCEP certificate to revoke - rotate the LAPS password, isolate the device in Defender, and do not wipe until cleared.' },
        { level: 'flag', t: 'A Participant Kiosk incident is likely a DEWR-notifiable incident', d: 'Participant sessions handle participant PII. Any confirmed compromise engages the securitycompliancesupport@jobs.gov.au notification and ASD involvement, and the evidence-preservation freeze under ISM 915c. The risk is procedural: Autopilot Reset restores service in minutes and destroys the evidence.',
          det: {
            policy: 'Cyber Incident Response Plan, Containment Phase step 9: where an incident affects the environment holding personal/sensitive data, the CIRT Manager and Data Owner notify the Department as Accreditation Authority as soon as possible via securitycompliancesupport@jobs.gov.au, and notify ASD seeking assistance. The CIRT Manager instructs all staff to take no action which could affect the integrity of the evidence prior to ASD involvement (ISM 915c).',
            design: 'Participant Kiosk DDD \u00a79.1 names the reporting path (APM Assist, ServiceNow, this plan). \u00a79.2 defines the Sentinel sources and alerting for the fleet.',
            why: 'A support operator\u2019s natural first instinct on a suspected compromised device is to wipe and re-provision it. Under ISM 915c that destroys evidence before ASD is involved, on an incident that is externally notifiable to the accreditation authority. The design names the reporting path but does not yet state the do-not-wipe constraint in the operational runbooks handed over at Phase 7.',
            options: [
              'Add the evidence-preservation constraint to the device-replacement and remote-support runbooks (\u00a79.5.7), not just to the design: isolate in Defender, rotate LAPS, escalate to the CIRT Manager, and do NOT reset or wipe until cleared.',
              'Constrain any automated Sentinel response to device isolation - containment is delegated to the CIRT Manager and is permitted; device wipe is not.'
            ],
            owner: 'Shaun Struik to draft the runbook constraint; APM Cyber Security to confirm the notification threshold for a single-device compromise.',
            refs: ['Cyber Incident Response Plan, Containment step 9', 'ISM 915c', 'Theft / Loss of IT Asset playbook', 'Participant Kiosk DDD \u00a79.1', 'Participant Kiosk DDD \u00a79.5.7']
          } },
        { level: 'info', t: 'Automated containment is device isolation, not account disablement', d: 'The V1.6 design proposed auto-disabling a kiosk account on anomaly. There is no such account to disable now - the session account is device-local and Windows-managed. The device-centred equivalent in \u00a79.2 is Defender isolation, which is containment (permitted, delegated to the CIRT Manager). Wiping the device is not, prior to ASD involvement.' }
      ]
    },
    {
      id: '09.01.033-5.0', slug: 'posture-statement',
      title: 'Cyber Security Posture Statement',
      cat: 'Governance & Compliance', owner: 'CISO', published: '02/07/2026',
      classification: 'Internal', pages: 5, file: 'CS-Cyber-Security-Posture-Statement.pdf',
      purpose: 'Customer-facing high-level overview of the IT security controls in place across the APM ICT environment, and assurance in APM\u2019s cyber security practices.',
      reqs: [
        { r: 'Certifications held', d: 'ISO/IEC 27001:2022 and DEWR Right Fit for Risk, covering the handling of OFFICIAL: Sensitive data. All RFFR compliant technology policies, standards and IT infrastructure procedures are used across all centrally managed APAC Group businesses.' },
        { r: 'Pre-employment screening', d: 'Identity check, Australian Federal Police clearance, employment reference, academic reference, and visa or citizenship confirmation. All personnel sign a confidentiality agreement.' },
        { r: 'Security awareness training', d: 'Privacy and information security awareness modules at onboarding then annually. Personnel who fail to complete in a timely manner may face disciplinary action. Covers passphrase security, information collection and security, threats and incident actions, and personnel obligations.' },
        { r: 'Offboarding', d: 'Staff access terminated and APM assets returned on the last day of employment.' },
        { r: 'Data residency - Microsoft Australian Azure only', d: 'All data held by APM APAC centrally managed entities on APM managed infrastructure is stored in Microsoft\u2019s Australian Azure cloud, in the Sydney and Melbourne data centres. Both ISO 27001:2022 and SOC 2 Type 2 compliant.' },
        { r: 'Removable media administratively disabled by default', d: 'Access to removable media is administratively disabled on APM ICT assets. Explicit approval must be granted by APM ICT stakeholders to allow access to APM approved removable media.' },
        { r: 'Physical asset controls', d: 'Assets labelled with APM name and ICT service desk number. Removal of an APM asset from site must be reviewed and approved by Office Managers or the Operations Team Lead.' },
        { r: 'Premises and clear desk', d: 'Operations conducted within APM owned/leased buildings with a defined security perimeter; physical documentation in locked cabinets when not in use; clear desk and screen policy enforced through the Information Security Code of Practice.' },
        { r: 'Identity and access management', d: 'Aligned to the Identity and IT Access Management Standard: multi-factor authentication, complex passwords aligned to ISM requirements, session termination based on inactivity, need-to-know and least-privilege access.' },
        { r: 'Cryptography', d: 'ASD Approved Cryptographic Algorithms (AACA) for information in transit and at rest, including data stored on removable media.' },
        { r: 'Anti-malware', d: 'Multilayer approach with both network and host-based antimalware solutions.' },
        { r: 'Network security', d: 'Perimeter firewalls, secure web gateway clients, intrusion detection and prevention. All notifications monitored by the Security Operations Centre. Wireless network devices require authentication before access is granted.' },
        { r: 'Remote access', d: 'All remote access requires APM VPN or approved Virtual Desktop Infrastructure. Services are monitored during use and all connections encrypted.' },
        { r: 'Penetration testing', d: 'Formalised technical assurance program with annual penetration testing of all key systems and infrastructure, plus prior to go-live of new services and for significant updates.' },
        { r: 'Third party security', d: 'Third parties must agree to the Security Standards for Third Parties Engaging with APM Policy and the Information Security Code of Practice before gaining system access. All third-party contracts overseen by Legal.' },
        { r: 'Backup', d: 'Performed at a regular cadence per the Information Systems Backup and Archiving Standard, which defines RTOs and RPOs.' }
      ],
      related: ['APM - Risk Management Framework', 'Cyber Security Incident Response Plan', 'Disaster Recovery Plan', 'Identity and IT Access Management Standard', 'Information Asset Classification & Handling Standard', 'Information Security Code of Practice', 'Information Security Policy', 'Information Systems Backup and Archiving Standard', 'IT Asset Management Standard', 'Patch and Vulnerability Management Standard', 'Security Standards for Third Parties Engaging with APM Policy'],
      impact: [
        { level: 'good', t: 'This is the policy hook that legitimises the kiosk USB exception', d: 'Removable media is administratively disabled by default and requires explicit APM ICT stakeholder approval for approved media. The Participant Kiosk USB exception profiles are exactly that mechanism - cite this clause in \u00a77.3.3 so the exclusion reads as policy-compliant rather than policy-breaking.',
          det: {
            policy: 'Cyber Security Posture Statement \u00a74.3 Enterprise Asset Management: "Access to removable media is administratively disabled on APM ICT assets. An explicit approval needs to be granted by APM ICT stakeholder(s) to allow accessing of APM approved removable media."',
            design: 'Participant Kiosk DDD \u00a75.2.3 creates CDG-W11-SEC-USB Exception-P-1.0 and CDG-W11-SEC-Bitlocker Exception-P-1.0, assigned to sg-dyn-dvc-cdg-participant-kiosk, which is excluded from the estate APM-WIN-SEC-USB Baseline-P-1.0 assignment. \u00a77.3.3 records the three excluded controls with compensating controls.',
            why: 'The posture statement does not prohibit removable media outright - it disables it by default and provides an approval path. That reframes the exception from "breaking the standard" to "using the exception mechanism the policy anticipates". This is the strongest single sentence available to defend the USB position in review, and the design does not currently cite it.',
            options: ['Add the quoted clause to \u00a77.3.3 as the policy basis for the exception, and record who granted the explicit approval and when. That converts the argument from a defence to a citation.'],
            owner: 'Shaun Struik to add the citation; explicit approval to be recorded from the APM ICT stakeholder (APM Cyber Security).',
            refs: ['Posture Statement \u00a74.3', 'Participant Kiosk DDD \u00a75.2.3', 'Participant Kiosk DDD \u00a77.3.3']
          } },
        { level: 'good', t: 'Data residency is satisfied by holding no data at all', d: 'Sydney and Melbourne are the named data centre locations. The Participant Kiosk retains nothing: the profile is destroyed on every restart and there is no cloud store on the device. The management planes it uses - Intune, Entra ID, Defender, Sentinel - are the existing APM Australian tenancy. The V1.6 residency argument rested on a credential pipeline in Australia East; that pipeline is removed.' },
        { level: 'good', t: 'The clear-screen deviation is closed by the pivot', d: 'The clear desk and screen policy is enforced through the Information Security Code of Practice. The V1.6 design deliberately displayed a credential on the lock screen and carried that as deviation SOE-04. The Participant Kiosk presents no lock screen at all: the device signs itself in to a Windows-managed local account, and nothing is displayed to be read or photographed. SOE-04 as written is retired.' },
        { level: 'flag', t: 'Remote access is VPN or approved VDI only', d: 'This statement says all remote access requires APM VPN or approved VDI. The Participant Kiosk uses TeamViewer for remote support. That reinforces SOE-03: the remote-support model is a documented variation needing explicit CISO acceptance, and swapping to an approved path would be simpler.',
          det: {
            policy: 'Cyber Security Posture Statement \u00a76.2 Remote Access: "All remote access to the APM network requires access to APM\u2019s Virtual Private Network, or approval to use its Virtual Desktop Infrastructure. These services are monitored during use, and all connections are encrypted." The SOE Hardening Standard separately disables Remote Assistance, Remote Shell and inbound Remote Desktop (5 ASD-aligned controls).',
            design: 'Participant Kiosk DDD \u00a74.3.10 documents a TeamViewer remote-support model: attended consent for participant sessions, unattended for the administrative scenario, a per-device non-privileged support account whose password is managed by Windows LAPS (\u00a77.2.3), operator MFA, file transfer disabled, session logs to Sentinel.',
            why: 'Two documents now constrain remote access, and TeamViewer is neither VPN nor VDI. The design\u2019s controls are genuinely strong, but they are a compensating argument against an explicit policy statement that a customer-facing posture statement makes to APM\u2019s clients. That is a harder position to hold than swapping tools.',
            options: [
              'Swap to Intune Remote Help or Defender live response - already in APM\u2019s tooling, already covered by the estate posture, removes the variation entirely. Recommended.',
              'Or keep TeamViewer and obtain explicit CISO acceptance as a documented variation, noting that the posture statement is customer-facing and may need updating to remain accurate.'
            ],
            owner: 'Shaun Struik to propose the swap; CISO decides.',
            refs: ['Posture Statement \u00a76.2', 'SOE Hardening Standard, Win11 OS baseline (Remote Assistance / Remote Shell / RDP)', 'Participant Kiosk DDD \u00a74.3.10', 'Participant Kiosk DDD SOE-03']
          } },
        { level: 'info', t: 'Missing standards we should obtain', d: 'The related-documents list names eleven standards. Two are now held: the Identity and IT Access Management Standard (09.03.035-5.0) and the Risk Management Framework (01.01.004-8.3). Still outstanding and load-bearing: Information Asset Classification & Handling Standard, Patch and Vulnerability Management Standard, and the Information Security Code of Practice. Full list in policies/README.md.' }
      ]
    },
    {
      id: '09.03.009-2.7', slug: 'communication-strategy',
      title: 'Cyber Security Communication Strategy',
      cat: 'Monitoring & Assurance', owner: 'CISO', published: '02/07/2026',
      classification: 'Internal', pages: 2, file: 'CS-Cyber-Security-Communication-Strategy.pdf',
      purpose: 'Defines how the Cyber Security team communicates with internal D&T teams, end users and business stakeholders as a continuous two-way process.',
      reqs: [
        { r: 'Channels', d: 'Email, Microsoft Teams, SMS, telephony, website articles and automated data feeds.' },
        { r: 'Major incident communication', d: 'Relevant major security incidents such as a sustained cyber attack are communicated to APM employees across multiple channels including email, Teams and SMS.' },
        { r: 'Periodic awareness communications', d: 'Sent by email periodically on topics such as phishing and password hygiene.' },
        { r: 'Knowledge sharing', d: 'Monthly Ask Me Anything sessions hosted by Cyber Security and open to all D&T staff. Learnings from penetration tests conducted against APM are shared with all relevant D&T teams.' },
        { r: 'External breach notification', d: 'Cyber Security monitors external sources for third-party breaches containing APM user data and notifies affected users by email.' },
        { r: 'Threat intelligence distribution', d: 'Actionable threat intelligence from the Cyber Security team or external SOC provider is provided to D&T leaders.' },
        { r: 'Industry benchmarking', d: 'Provided to business leaders where available, for example phishing simulation click rate compared with industry peers.' },
        { r: 'Business unit responsibility', d: 'Unless otherwise specified, the relevant business unit or contract holder communicates with their key stakeholders regarding the APM ISMS in line with the ISO 27001 strategy.' }
      ],
      impact: [
        { level: 'info', t: 'Participant Kiosk pen test findings will be shared across D&T', d: 'Penetration test learnings are shared with all relevant D&T teams, so the Phase 4 findings (\u00a79.5.4) become an estate-wide input, not just a fleet artefact.' }
      ]
    },
    {
      id: '09.03.015-6.0', slug: 'special-interest-groups',
      title: 'Cyber Security Contact with Special Interest Groups',
      cat: 'Monitoring & Assurance', owner: 'CISO', published: '02/07/2026',
      classification: 'Internal', pages: 1, file: 'CS-Contact-with-Special-Interest-Groups.pdf',
      purpose: 'Records APM Cyber Security team membership of external security special interest groups and the resulting access to threat intelligence and professional development.',
      reqs: [
        { r: 'Professional body membership', d: 'Members of ISC2 (International Information System Security Certification Consortium) and AISA (Australian Information Security Association).' },
        { r: 'Continuing education', d: '40 hours of continual education required each year to maintain qualifications.' },
        { r: 'ACSC relationship', d: 'APM has signed a legal memorandum of understanding with the Australian Cyber Security Centre, with access to the ACSC partner portal and community Slack server providing threat intelligence and early warning notifications by email, portal, Slack and dedicated threat intelligence feeds.' }
      ],
      impact: [
        { level: 'info', t: 'ACSC MOU is the escalation channel referenced by the IR plan', d: 'The ASD notification path in the Incident Response Plan runs through this existing relationship.' }
      ]
    },
    {
      id: 'SOE V3.0', slug: 'soe-hardening',
      title: 'Windows SOE Hardening Standard V3.0',
      cat: 'Endpoint & SOE', owner: 'End User Computing Manager (content expert); approved by Head of Digital Operations; responsible executive ANZ CIO', published: '2026',
      classification: 'APM Internal', pages: '11 policy sheets', file: 'APM-Windows-SOE-Hardening-Standard-V3.0.xlsx',
      purpose: 'Endpoint hardening applied through Intune, control by control - 748 controls across 11 policies, benchmarked against ASD Windows Hardening Guidelines, the Microsoft Windows 11 v24H2 baseline and the Microsoft Edge security baseline v139, whichever is higher.',
      reqs: [
        { r: '748 controls across 11 policies', d: '568 meet or exceed the ASD or Microsoft baseline, 171 are additional hardening beyond it, 9 are recorded as Partial (set below benchmark with a reason). Overall 98.4% met.' },
        { r: 'Windows 11 security baseline (OS) - 594 controls', d: 'APM-W11-SEC-Baseline-P-1.2. Carries AutoPlay and AutoRun disabled on all drives, Credential Guard with UEFI lock, virtualisation-based security, SMB v1 disabled, anonymous SAM enumeration denied, PowerShell execution policy allowing only signed scripts with script block logging, Remote Assistance and Remote Shell disabled, inbound Remote Desktop disabled, built-in Administrator and Guest accounts disabled and renamed, minimum device password length 14, machine inactivity limit 900 seconds, full audit policy set.' },
        { r: 'Removable storage control - 16 controls', d: 'APM-WIN-SEC-USB Baseline-P-1.0. All Removable Storage classes deny all access (Enabled); Removable Disks deny write access (Enabled); BitLocker requires encryption on removable drives.' },
        { r: 'Attack surface reduction - 20 controls', d: 'APM-WIN-SEC-ASR-P-1.0. Includes blocking untrusted and unsigned processes running from USB, LSASS credential theft blocking, obfuscated script blocking, prevalence/age/trusted-list executable blocking, PSExec and WMI process creation blocking, WMI persistence blocking. Controlled Folder Access is set to audit only (Partial) due to legacy applications.' },
        { r: 'Application Control (App Control for Business) - 12 controls', d: 'Audit and Enforced policies, base policy v2026.03.27.0216, 18 trusted signers, managed installer enabled, supplemental policies allowed, revoked/expired treated as unsigned. Script Enforcement is DISABLED in both policies - flagged in the standard\u2019s own assessment as an item to enable for ASD script control.' },
        { r: 'BitLocker - 20 controls', d: 'APM-W11-SEC-Bitlocker-P-1.1. XTS-AES 256-bit on OS, fixed and removable data drives; additional authentication at startup required; recovery information stored in Entra ID before encryption; client-driven recovery password rotation; write access blocked to fixed and removable data drives not protected by BitLocker.' },
        { r: 'Microsoft Edge security baseline - 25 controls', d: 'APM-W11-SEC-Edge Baseline-P-1.2. Password Manager disabled, about:flags blocked, certificate error overrides prevented, SmartScreen enforced with no override for downloads or prompts, DNS-over-HTTPS off, extension install allow-list and block-list enforced, download restrictions enabled, application bound encryption enabled.' },
        { r: 'Developer tools restriction', d: 'APM-W11-SEC-Edge Dev Baseline-P-2.0 disables Developer Tools availability. A scoped exception group (APM-W11-SEC-Edge Dev Exception-P-2.0) enables them and is recorded as Partial, below the Microsoft baseline, by design.' },
        { r: 'Windows compliance policy - 9 controls', d: 'Staff-Windows-Compliance-Policy. BitLocker, Secure Boot, Firewall, TPM, Antivirus, Antispyware, Defender Antimalware, security intelligence up to date, real-time protection - all Required. Observation recorded: no minimum OS version enforced.' },
        { r: 'Microsoft Store is allowed (Partial)', d: '"Turn off the Store application" is Disabled, set below the benchmark because some government contracts require Store-only applications.' }
      ],
      impact: [
        { level: 'good', t: 'The kiosk design is already aligned to this standard', d: 'Participant Kiosk \u00a77.3.1 to 7.3.7 documents inheritance, three named removable-media exclusions with compensating controls, kiosk-additional controls, and the alignment items. The kiosk closes the standard\u2019s own minimum-OS-version observation and turns the Store off.' },
        { level: 'flag', t: 'Estate script enforcement gap affects any design leaning on App Control', d: 'Script Enforcement is off in both estate App Control policies. Any design that cites App Control as a compensating control must either enable script enforcement in its own variant (as the kiosk does) or re-base the compensation on ASR rules.' }
      ]
    },
    {
      id: '09.03.035-5.0', slug: 'identity-access-management',
      title: 'Identity and IT Access Management Standard',
      cat: 'Identity & Access', owner: 'CISO', published: '23/02/2026',
      classification: 'Internal', pages: 15, file: 'policies/CS-Identity-and-IT-Access-Management-Standard.pdf',
      purpose: 'The minimum standards for controlling access to APM IT Assets: identification, authentication, account management, system configuration, application management and access reviews. One of the eleven previously-missing load-bearing standards - now held.',
      reqs: [
        { r: 'Client systems are segregated from APM IT systems (\u00a75)', d: 'IT assets used by clients (e.g. job seekers applying for jobs) must not connect to any non-public APM IT systems. No information created by the client is stored on the asset. Clients receive acceptable-use guidelines. APM employees must not use client-designated assets for their duties. Clients are explicitly NOT Users under this standard.' },
        { r: 'Shared and generic accounts (\u00a74.1, \u00a74.2.2)', d: 'Shared IDs avoided unless business justification approved by the Cyber Security Team; never for sensitive applications. Generic accounts: minimum rights, no corporate-system access, a process identifying the user, password reset on membership change and at 12 months.' },
        { r: 'MFA for all Users; single-factor needs 15+ characters (\u00a74.1.2, ISM-0417)', d: 'Authentication methods susceptible to replay avoided; external services use SSO where possible.' },
        { r: 'Local administrator passwords 30+ characters, LAPS-rotated every 30 days (\u00a74.2.2 \u00b68-9)', d: 'Applies to LAPS-managed accounts explicitly. Distinct per device; Guest disabled.' },
        { r: 'Privileged accounts 15+ characters, restricted, recorded, time-bound (\u00a74.2.2 \u00b61-7)', d: 'No email or web browsing from privileged accounts; system utilities that bypass access control logged and reviewed.' },
        { r: 'Service accounts as gMSA / managed identities where possible (\u00a74.2.2 \u00b618-29)', d: 'Interactive service accounts 30+ characters, changed on compromise indicators and at 12 months; minimum permissions; named owner.' },
        { r: 'Break glass accounts (\u00a74.2.3)', d: '30+ character passwords, unidentifiable names, MFA-independent configuration, credential change after each use, all activity logged with immediate notifications, regular validation.' },
        { r: 'Standard user passwords (\u00a74.3)', d: '8+ characters, 3 of 4 complexity categories, 90-day expiry, 3-password history, first-logon change, no clear-text display or transmission.' },
        { r: 'Account locks after 5 failed attempts (\u00a74.3)', d: 'Unlock only after the administrator proves the user\u2019s identity.' },
        { r: 'Session/screen locks within 15 minutes on staff computers (\u00a74.3)', d: 'Conceals all information, requires reauthentication, cannot be disabled by users.' },
        { r: 'Same-day account deactivation on termination; 30-day inactivity disable (\u00a74.2.5)', d: 'Across all IT systems.' },
        { r: 'App control rules validated annually (\u00a74.4)', d: 'Hash, publisher certificate and path rules. Standard users cannot uninstall approved software.' },
        { r: 'Non-configurable systems need a risk assessment and Cyber exemption (\u00a74.3)', d: 'Any IT asset that cannot meet these requirements must be risk assessed with an exemption sought from the Cyber Security Team.' }
      ],
      impact: [
        { level: 'good', t: '\u00a75 is the policy basis for the whole Participant Kiosk model', d: 'The kiosk is a client-designated asset: participants are clients, not Users. \u00a75 requires exactly what the design does - no connection to non-public APM systems (three-layer M365 block), no client information stored (restart purge), acceptable-use guidance (wallpaper notice). Cite \u00a75 in \u00a77 of the design as the standard that the fleet implements rather than deviates from.' },
        { level: 'good', t: 'LAPS password length raised to 30 in the kiosk design', d: '\u00a74.2.2 \u00b69 requires local administrator passwords including LAPS-managed to be at least 30 characters. The Participant Kiosk stated 20; raised to 30 in V1.2 (7 Aug 2026, \u00a77.2.3) when this standard arrived, with the clause cited in the settings table.' },
        { level: 'flag', t: 'Session account is a shared/anonymous account under \u00a74.2.2', d: 'The Kiosk-[SERIAL] account is generic by design (no user identification). \u00a74.2.2 \u00b614 requires a Cyber-approved business justification and an allocation record. The per-device binding and DR-011 carry most of this - confirm Cyber\u2019s DR-011 sign-off explicitly covers the generic-account justification.' }
      ]
    },
    {
      id: '09.03.034-3.0', slug: 'idps-standard',
      title: 'Intrusion Detection and Prevention Standard',
      cat: 'Monitoring & Assurance', owner: 'CISO', published: '16/07/2025',
      classification: 'Internal', pages: 5, file: 'policies/CS-Intrusion-Detection-and-Prevention-Standard.pdf',
      purpose: 'Detection and prevention standards across network, wireless, host, email and SIEM layers for all IT assets connected to APM systems.',
      reqs: [
        { r: 'Network detection at every gateway', d: 'Signature and anomaly-based detection wherever traffic is inspected or traverses a gateway; ingress and egress inspected; east-west traffic within the cloud environment inspected.' },
        { r: 'EDR mandatory on end user devices', d: 'Cloud-managed platform combining anti-malware, anti-spyware, behaviour analysis, rootkit and anomaly detection, plus a cloud heuristic engine for unknown strains on workstations and servers.' },
        { r: 'EUC web traffic inspected, logged, alerted', d: 'Detection for malware, known malicious hosts, botnet and C2 infrastructure.' },
        { r: 'Webmail blocked at APM', d: 'Email may only be accessed through Microsoft Outlook on APM devices - maintains data control and limits loss through third-party email applications.' },
        { r: '24/7 external SOC and SIEM correlation', d: 'Logs and alerts to the external SOC (threat hunters, incident responders, intrusion analysts); host-based IPS alerts the Cyber Security Team directly; SIEM correlates endpoint and gateway logs with AI/behaviour analytics.' },
        { r: 'Wireless standardisation', d: 'Wireless infrastructure standardised across the APM network; attack-signature databases continually cloud-updated.' }
      ],
      impact: [
        { level: 'flag', t: 'Kiosk permits personal webmail - argue the client-asset carve-out explicitly', d: 'This standard blocks all webmail at APM; the Participant Kiosk deliberately leaves personal webmail reachable. The reconciliation is IAM \u00a75: the kiosk is a client asset outside APM IT systems, participants are not Users, and no APM mailbox exists on the device. The design should cite both standards together so the apparent conflict is pre-argued.' },
        { level: 'good', t: 'Kiosk telemetry already matches the reporting model', d: 'MDE P2 (EDR), Zscaler web inspection with logging, and Sentinel correlation are all in the design; \u00a79.2 states where each alert lands.' }
      ]
    },
    {
      id: '09.03.044-4.0', slug: 'identity-protection',
      title: 'Identity Protection Standard',
      cat: 'Identity & Access', owner: 'CISO', published: '16/07/2025',
      classification: 'Internal', pages: 2, file: 'policies/CS-Identity-Protection-Standard.pdf',
      purpose: 'Mandates Microsoft Defender for Identity monitoring of all Active Directory activity on APM Domain Controllers, covering the attack kill chain from reconnaissance to domain dominance.',
      reqs: [
        { r: 'Defender for Identity on all APM Domain Controllers', d: 'Mandatory. Detects reconnaissance, credential compromise, lateral movement (Pass the Ticket/Hash), and domain dominance (DC Shadow, Golden Ticket).' },
        { r: 'Logs to Sentinel', d: 'MDI sends logs to Sentinel for SOC review and alerting; access via security.microsoft.com restricted to authorised privileged users.' }
      ],
      impact: [
        { level: 'info', t: 'Scope is Domain Controllers - Entra-only designs are out of scope by construction', d: 'Our device designs are Entra-joined with no AD DS, so MDI does not attach. Any AVD or server design that touches the ADDS DCs in aus-sub-identity must confirm the MDI sensor is present on them.' }
      ]
    },
    {
      id: '01.01.004-8.3', slug: 'risk-management-framework',
      title: 'Risk Management Framework',
      cat: 'Governance & Compliance', owner: 'Chief Risk Officer', published: '6/05/2026',
      classification: 'Internal', pages: 25, file: 'policies/APM-Risk-Management-Framework.pdf',
      purpose: 'APM\u2019s enterprise risk methodology (ISO 31000-consistent): governance, three lines of defence, likelihood and consequence criteria, risk matrix, control effectiveness, treatment and acceptance authorities.',
      reqs: [
        { r: 'Likelihood scale 1-5', d: 'Rare (5+ years) to Almost Certain (within a month).' },
        { r: 'Consequence scale 1-5 across five dimensions', d: 'Financial (EBITDA %), Strategic, Operational, Reputational, Compliance - Insignificant to Severe.' },
        { r: 'Risk matrix produces Negligible / Minor / Moderate / High / Extreme', d: 'Inherent rating from likelihood \u00d7 consequence; residual = inherent \u00d7 control effectiveness, mapped back to the matrix with a subjective sanity check.' },
        { r: 'Acceptance authorities by rating (Appendix E)', d: 'Extreme: Board only. High: ARC only. Moderate: responsible Executive. Minor: business unit head. Negligible: relevant manager. High/Extreme reviewed by the Executive Team at least monthly.' },
        { r: 'Treatment options', d: 'Accept, Treat, Transfer, Avoid - treatment plans documented in the risk register with approval per the acceptance table.' },
        { r: 'Risks recorded in the enterprise risk register', d: 'Risk owners keep divisional profiles current; material risk profile reviewed bi-annually by the ARC; post-incident reviews after significant events.' }
      ],
      impact: [
        { level: 'flag', t: 'Design risk registers should rate on the APM scales', d: 'Our DDD risk registers rate likelihood/consequence qualitatively. Mapping them to the 1-5 scales and the five-band residual rating makes them transferable into Clew and tells the approver which acceptance authority each risk needs (a High residual needs the ARC, not a project sign-off).' }
      ]
    },
    {
      id: 'ENV-ESLZ', slug: 'azure-landing-zone',
      title: 'Azure Enterprise-Scale Landing Zone (APAC) - as designed v1.1',
      cat: 'Configuration', owner: 'Head of Digital Transformation and Architecture', published: '2026',
      classification: 'Internal', pages: 300, file: 'reference/environment/Azure-Landing-Zone-APAC-DetailedDesign-v1.1.docx + reference/eslz/ (4 corpus parts)',
      purpose: 'The environment our Azure-touching designs deploy into: hub-spoke across Australia East (10.40.0.0/16) and Australia Southeast (10.50.0.0/16), CAF-aligned management groups, controlled and standard security domains.',
      reqs: [
        { r: 'Management group hierarchy', d: 'AUS-MG-PLATFORM (Connectivity, Identity, Security, Management), AUS-MG-{PROD|DEV|SIT|UAT}-{CONTROLLED|STANDARD}, AUS-MG-ACQUISITIONS, AUS-MG-SANDBOX. Sandbox never peers to the hub.' },
        { r: 'Subscription and VNet plan', d: 'aus-sub-connectivity (hub VNets), -identity (ADDS DCs, 10.40.4.0/24 / 10.50.4.0/24), -management, workload spokes per environment and domain, AVD spoke aus-sub-avd-controlled-001 (auea-vnet-avd-ctrl-001, 10.40.88.0/23).' },
        { r: 'DNS', d: 'Azure DNS Private Resolver in the connectivity subscription; private DNS zones per service ([region]-pdz-*).' },
        { r: 'Public IP creation denied outside connectivity (DD-17)', d: 'Azure Policy denies public IPs in all management groups except the connectivity subscription; ingress rides the hub.' },
        { r: 'PIM everywhere', d: 'Role-Admin-AzureMG* groups are eligible time-bound assignments per management group; no standing access.' }
      ],
      impact: [
        { level: 'info', t: 'The AVD SOEs land in an existing spoke', d: 'aus-sub-avd-controlled-001 / auea-vnet-avd-ctrl-001 (10.40.88.0/23) is already provisioned in the controlled domain - the Standard User and Developer SOE designs target it rather than requesting new subscriptions.' },
        { level: 'info', t: 'Interaction triggers live in environment-config.js', d: 'The compliance checker now raises advisory findings when a design touches ESLZ configuration: spoke placement, CIDR allocation, public-IP policy, naming.' }
      ]
    },
    {
      id: 'ENV-PALO', slug: 'palo-alto-hub-firewalls',
      title: 'Palo Alto VM-Series hub firewalls - as built V1.0',
      cat: 'Configuration', owner: 'Digital Operations', published: '22/07/2026',
      classification: 'Internal', pages: 40, file: 'reference/environment/Palo-Alto-Firewall-Deployment-As-Built-V1.0.docx',
      purpose: 'The enforcement point for all Azure traffic: North-South and East-West VM-Series clusters in each regional hub, Panorama-managed, default-deny both directions.',
      reqs: [
        { r: 'All traffic inspected', d: 'UDRs force north-south (internet, on-prem) and east-west (inter-VNet) flows through the firewall load balancers. Default interzone AND intrazone rules overridden to drop and log.' },
        { r: 'Outbound is allow-listed', d: 'Security policy permits named applications and URL categories only; proxy-avoidance and anonymizers blocked; all outbound logged. HTTP egress rides IPSEC tunnels to Zscaler; non-HTTP SNATs out the public interfaces.' },
        { r: 'Panorama HA manages everything', d: 'AE active / ASE passive; template stacks and device groups; changes via Panorama only; SAML (Entra) admin auth with break-glass; access from the privileged jump host only.' },
        { r: 'Logs to Sentinel', d: 'Firewalls forward to Panorama (2TB rolling); Panorama forwards syslog to Sentinel via a syslog VM.' },
        { r: 'Backhaul via Meraki SD-WAN', d: 'vMX in the legacy AE landing zone advertises BGP routes; inspected traffic forwards to the active vMX.' },
        { r: 'Open: DNS/NTP for firewall services TBC', d: 'Pending the Infrastructure Team decision; designs must not assume.' }
      ],
      impact: [
        { level: 'info', t: 'Every new Azure egress is a firewall change', d: 'A design that adds cloud egress must name FQDNs, ports and applications so the Panorama rule can be raised verbatim - \u00a75.3 named-egress tables are not optional decoration.' }
      ]
    },
    {
      id: 'ENV-NAMING', slug: 'azure-eslz-naming',
      title: 'Azure ESLZ Naming Standard',
      cat: 'Configuration', owner: 'Digital Operations', published: '17/07/2026',
      classification: 'Internal', pages: 5, file: 'reference/environment/Azure-ESLZ-Naming-Standards-17July2026.pdf',
      purpose: 'Naming formats for every Azure resource type in the landing zone. Complements the APM Intune Naming Schema V1.0 (device-side objects), which our designs already follow.',
      reqs: [
        { r: 'General form', d: '[region]-[type]-[environment]-[apm security domain]-[descriptor]-[instance]: auea-rg-prod-ctrl-appname-001, ause-nsg-prod-std-web-001, auea-kv-management-001.' },
        { r: 'Compact forms for VMs and storage', d: 'aevmpadds001, aestpcappname001, aestxflowlog001, aefwppalo001. Palo RGs always contain "palo".' },
        { r: 'Management groups ALL CAPS, subscriptions lower with full domain word', d: 'AUS-MG-PLATFORM; aus-sub-prod-controlled-01.' },
        { r: 'NSG rule names', d: '[allow|deny]-[ib|ob]-[source]-to-[destination]-[descriptor]-[nn], e.g. allow-ob-azmonitor-to-law-https-01.' }
      ],
      impact: [
        { level: 'info', t: 'Design settings tables must use these exact forms', d: 'Any Azure object a design creates is named here first - the checker now flags Azure resource mentions so the names get written in, not invented at build time.' }
      ]
    },
    {
      id: 'ENV-DOCSET', slug: 'apm-document-templates',
      title: 'APM solution document templates - DDD V0.1 and TCD V0.1',
      cat: 'Configuration', owner: 'Head of Digital Transformation and Architecture', published: '21/07/2026',
      classification: 'Internal', pages: 20, file: 'reference/apm-document-templates/APM_Detail_Design_Document_Template_V0.1.docx + APM_Technical_Configuration_Document_Template_V0.1.docx',
      purpose: 'APM\u2019s own template pair: the DDD argues the design (business \u2192 application \u2192 technology \u2192 information \u2192 cyber \u2192 availability \u2192 service management - the same spine as our detailed-design standard) and the Technical Configuration Document carries build-level configuration as de-facto as-built.',
      reqs: [
        { r: 'DDD covers architecture domains in order', d: 'Introduction, Overview, Business, Application, Technology, Information & Data, Cyber & Security, Availability & DR, Service Management. Cover: Project Name, Owner, Contact, Program, Division/Unit, Status, Version, Product ID + Consultation + References and Derivation + SDA Approval.' },
        { r: 'TCD carries the build detail', d: 'IP addressing, DNS records, load balancing, NAT and firewall rules, compute, RBAC groups, accounts, CA rules, AV exclusions, DNS/NTP/logging/monitoring/patching/PKI/SMTP, RPO/RTO, backup/restore, capacity planning.' },
        { r: 'SDA approval', d: 'Both templates carry a Solution Design Authority approval block - the formal gate for designs.' }
      ],
      impact: [
        { level: 'flag', t: 'Plan a TCD companion per use case', d: 'Our DDDs carry most TCD content in \u00a75.3-style settings tables, but APM review may ask for the TCD artefact itself. Produce one per use case as build detail lands, and add the SDA approval step to each design\u2019s approval path.' }
      ]
    },
    {
      id: 'ENV-CA', slug: 'conditional-access',
      title: 'Conditional Access policy set - APM corporate tenant',
      cat: 'Configuration', owner: 'APM Cyber Security', published: '07/08/2026',
      classification: 'Internal', pages: 116, file: 'policies/APM-Conditional-Access-Policies-Export.csv',
      purpose: 'The live Conditional Access estate: 116 policies, of which 68 are enforced, 43 are report-only and 5 are disabled. Full findings and a searchable policy table are in policies/APM_CA_Policy_Analysis.html; parsed data in ca-policies.js, findings in ca-analysis-data.js, and six advisory interactions as ENV-CA in environment-config.js.',
      reqs: [
        { r: 'Enforced tenant-wide (all users, all apps)', d: 'Deny Legacy Auth (block) \u00b7 CA-100 legacy protocols (block) \u00b7 CA-102 locations except AU and corporate (block) \u00b7 CA-104 high sign-in risk (block) \u00b7 CA-105 bad IPs (block) \u00b7 CA-201 BYOD browser no persistence \u00b7 CA-203 high user risk (MFA + password change) \u00b7 AllUsers_AllAccess_DeviceRequired (compliant OR Entra-joined) \u00b7 AllUsers_AllAccess_MFAorDeviceRequired (MFA OR Entra-joined).' },
        { r: 'Report-only, and therefore not a control', d: 'CA-101 tenant-wide MFA \u00b7 CA-106 and CA-401 phishing-resistant MFA \u00b7 AdminRoles_Everything_RequireMFA \u00b7 AdminRoles_Everything_RequireDevice \u00b7 CA-103 unsupported platforms \u00b7 CA-400 and CA-402 administrator device and location \u00b7 Guests_Everything_MFARequired \u00b7 AllUsers_UnapprovedCountries_Block \u00b7 AllUsers_AllAccess_BlockLegacy.' },
        { r: 'A managed device satisfies both enforced grants', d: 'An Entra-joined, Intune-compliant device satisfies AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired, the second with no MFA prompt at all. Blocking a managed fleet from corporate services is therefore always explicit, never inherited.' },
        { r: 'Naming convention', d: 'CA-nnn - audience - apps - condition - action, by series: CA-1xx all users and guests, CA-2xx organisation users, CA-3xx contract and community populations, CA-4xx administrators, CA-5xx guests. CA-100 to CA-106 are in use. Legacy families also present: AllUsers_*, AdminAccounts_*, AdminRoles_*, POC_EarlyAccess_*, GuestAccess_*.' },
        { r: 'Risk-based policies are live and user-keyed', d: 'CA-104, CA-203, AdminRoles_Risky_Sign-ins_MFA and AdminRoles_RiskyUsers_MFA_Password_Reset are enforced, so Entra ID P2 risk signals are licensed and in use. All of them evaluate a user principal, so a fleet with no user identity is never assessed by them.' },
        { r: 'Retired kiosk policies', d: 'Fourteen in two families: CA-APM-Kiosk-* (seven, all report-only) and CA-APM-KioskPB-* (seven, six enforced). Both assign to groups of user identities, so all fourteen stop matching anything once the kiosk user group is retired.' },
        { r: 'Export limitation', d: 'The CSV carries name, state, users, groups, applications and grant rules only. No exclusions, conditions, device filters, locations, platforms, client apps, session controls, authentication strengths or directory-role targets. A blank grant rule means session control or authentication strength, not no control. Request identity/conditionalAccess/policies from Graph for the full object.' }
      ],
      impact: [
        { level: 'good', t: 'Kiosk CA policy count corrected: fourteen, not seven, six of them enforced', d: 'The Participant Kiosk decommissioning change request disposed of "seven" kiosk policies. The export shows two families of seven: CA-APM-Kiosk-* (all report-only) and CA-APM-KioskPB-* (six enforced). Both assign to user groups, so all fourteen become silent no-ops when the group is retired. Corrected in the change request on 7 Aug 2026, with an evidence export required before deleting the enforced family.' },
        { level: 'good', t: 'Phishing-resistant MFA claim corrected in the design', d: 'Participant Kiosk V1.2 \u00a77.2.4 listed phishing-resistant MFA for administrators among the tenant\u2019s existing protections. CA-401 and CA-106 are both report-only, as is CA-101 tenant-wide MFA. V1.3 now names the nine genuinely enforced policies and forbids citing phishing-resistant MFA as a compensating control anywhere in the design.' },
        { level: 'good', t: 'The export proves the device-filter block is load-bearing', d: 'Because a Participant Kiosk is Entra-joined and compliant, it satisfies both enforced tenant-wide grants - the second without any MFA prompt. A staff credential typed on a kiosk would pass the estate\u2019s strongest controls. That is now the argument for DR-010 in V1.3, and it is stronger than the one the design had.' },
        { level: 'flag', t: 'Thirty-seven per cent of the estate grants and denies nothing', d: '43 report-only and 5 disabled against 68 enforced. Report-only includes tenant MFA, phishing-resistant MFA and administrator device and location restrictions. Essential Eight maturity and the Identity and IT Access Management Standard 4.1.2 both require MFA to be enforced. Raised as an estate finding with APM Cyber Security; until resolved, no design in this project may cite tenant MFA as a compensating control.' },
        { level: 'flag', t: 'Policy hygiene: duplicates, test artefacts and enforced provisional names', d: 'CA-501 ends in the literal word COPY and is enabled. zzADA_Block_Policy_Test_20250626 is still present. APM Pilot Block Policy and APM Pilot Policy are both enabled and both block all apps. Four CA numbers are duplicated. Eight _Reporting twins. Two enabled policies grant MFA under a name that says Block. Supplied to APM Cyber Security as an estate hygiene list.' },
        { level: 'info', t: 'Exclusion registers cannot be verified from this export', d: 'No exclusions column. Nine policies target all users against all apps and cannot be checked, so the Conditional Access half of any design\u2019s corporate-assignment exclusion register stays unverified until the full Graph export arrives.' }
      ]
    }
  ]
};
