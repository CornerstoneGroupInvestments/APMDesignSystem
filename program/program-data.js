/* APM AVD Program — live tracker data (source of truth).
   Edit rows here and re-export. Dates: YYYY-MM-DD.
   Owner/Support codes -> see `owners`. o/s = ENG or ARCH are flagged as Shaun Struik's tasks.
   v1.3: ALL five use cases compressed to complete by 30 Sep 2026 (contract end).
         ES pulled back into Aug–Sep to run in PARALLEL (reverses the earlier 'ES last'
         sequencing); Developer track compressed so GA lands 29 Sep; pen-test +
         KB tails (K5/K7) brought inside the window. Binding constraint is now four
         concurrent image builds on the single AVD Build Engineer in Aug–Sep.
   v1.4: Job Seeker timeline compressed — network complete 26 Jun; AVD build & test
         (Shaun Struik) complete 3 Jul; user testing (APM EUC + ES) 10 Jul; pilot +
         priority sites 13–31 Jul; national rollout complete ~21 Aug. EUC/ES owners named.
   v1.5: Dropped network "patternise/template" work (N11) + its milestone (N12) — a design
         doc (N10) is the deliverable; repointed S5/S6/P1/D1/D2 to N10. Removed Job Seeker
         site network cutover (J14) — new APM-KIOSK network runs in parallel to the old one,
         no cutover. Split national rollout into Phase 1 (~360 of 540 new devices, complete
         end Aug) and Phase 2 (~180 remaining, dependent on return + condition of old devices).
   v1.6: Removed Zscaler from the APM Cyber owner label (not a responsible party). Standard User
         re-baselined — build commences 13 Jul, image build complete 14 Aug (new milestone S17),
         GA ~23 Sep. Privileged re-sequenced to commence 17 Aug with a 6-week run to 28 Sep.
         Developer commences its image immediately after Priv completes — so Developer now lands
         ~early Nov, PAST the 30 Sep contract end (single build engineer cannot build images in
         parallel; image builds are serialised Standard → Priv → Developer).
   v1.7: "Work" on a use case = the whole workstream (design + approvals + build), not just the
         image build. Standard User whole workstream commences 13 Jul (image build still complete
         14 Aug, GA ~23 Sep). Developer whole workstream (incl. DDD + CAB) commences immediately
         after Privileged completes 28 Sep — so Developer GA moves to ~20 Nov (post-contract).
   v1.8: Standard User WHOLE workstream (design → approvals → build → pilot → pen-test →
         rollout → GA) compressed to complete 13 Jul → 14 Aug (image-complete pulls back to
         ~2 Aug so the pilot/pen-test/rollout tail fits before the 14 Aug GA). Same whole-
         workstream-in-window logic confirmed for Privileged (17 Aug–28 Sep) and Developer
         (commences after Priv, runs to ~20 Nov). Very aggressive — see risk 11. */
window.PROGRAM = {
  workstreams: [
    { key: 'N', label: '0 Network',        color: '#1F2D58' },
    { key: 'J', label: '1 Job Seeker',     color: '#F89728' },
    { key: 'S', label: '2 Standard User',  color: '#2E3192' },
    { key: 'P', label: '3 Privileged',     color: '#5C2D91' },
    { key: 'D', label: '4 Developer',      color: '#2C6FD6' },
    { key: 'E', label: '5 ES', color: '#E51C84' },
    { key: 'L', label: '6 Logistics',      color: '#6E7BA6' },
    { key: 'K', label: '7 KB & Enablement',color: '#1E8E5A' },
  ],
  owners: {
    ENG: 'Shaun Struik — build', ARCH: 'Shaun Struik — Architect / Design', ENG2: 'AVD Build Engineer', PM: 'Twiki PM', TEAM: 'Twiki team',
    NET: 'APM Network Team (IT Infra Mgr)', CYB: 'APM Cyber', EUC: 'Nick Dorbie — APM EUC', DBP: 'APM Digital Business Partner',
    ES: 'Ben Riches — APM ES', DOPS: 'APM Head Digital Ops', ARCHD: 'APM Head Arch.', PFM: 'APM Portfolio Mgr',
    CTO: 'APM CTO/CISO', DBPART: 'Device Build Partner', NERDIO: 'Nerdio', ESTRAIN: 'APM ES Training Owner',
    PDE: 'APM PDE Owner (TBC)', ISVC: 'APM IT Service Lead',
  },
  tasks: [
    // ---- 0 Network ----
    { id:'N1', w:'N', t:'Repurpose JS VLAN → APM-KIOSK (VLAN 73), hidden SSID + PSK via Intune', o:'NET', s:'', dep:[], st:'2026-06-23', en:'2026-06-26', dy:4, su:'In progress', ty:'Task', cr:true },
    { id:'N2', w:'N', t:'Meraki per-site /26 template, 20Mbps, remove CAPTCHA', o:'NET', s:'', dep:[], st:'2026-06-23', en:'2026-06-26', dy:4, su:'In progress', ty:'Task', cr:true },
    { id:'N3', w:'N', t:'Palo Alto east-west firewall rules (kiosk→AVD, deny-all)', o:'NET', s:'', dep:['N1'], st:'2026-06-24', en:'2026-07-01', dy:6, su:'Not started', ty:'Task', cr:true },
    { id:'N4', w:'N', t:'Zscaler IPSEC tunnel cutover from ZCC (managed network provider)', o:'CYB', s:'NET', dep:['N3'], st:'2026-06-25', en:'2026-07-03', dy:7, su:'Not started', ty:'Task', cr:true },
    { id:'N5', w:'N', t:'MILESTONE: Network build target', o:'NET', s:'', dep:['N1','N2'], st:'2026-06-26', en:'2026-06-26', su:'Not started', ty:'Milestone', cr:true },
    { id:'N6', w:'N', t:'Hub VNet — DNS Private Resolver, NAT GW, shared services', o:'NET', s:'', dep:[], st:'2026-06-23', en:'2026-07-03', dy:9, su:'In progress', ty:'Task', cr:true },
    { id:'N7', w:'N', t:'AVD spoke VNet, NSGs, private endpoints (KV/Files/Func)', o:'NET', s:'', dep:['N6'], st:'2026-06-29', en:'2026-07-08', dy:8, su:'Not started', ty:'Task', cr:true },
    { id:'N8', w:'N', t:'DNS Private Resolver zones + FQDN allowlist validation', o:'NET', s:'', dep:['N7'], st:'2026-07-06', en:'2026-07-10', dy:5, su:'Not started', ty:'Task' },
    { id:'N9', w:'N', t:'Test network end-to-end (AVD FQDNs, Key Vault, Zscaler path)', o:'NET', s:'ENG', dep:['N4','N7'], st:'2026-07-06', en:'2026-07-10', dy:5, su:'Not started', ty:'Task', cr:true },
    { id:'N10', w:'N', t:'Network design document (final, as-built)', o:'NET', s:'', dep:['N9'], st:'2026-07-08', en:'2026-07-15', dy:6, su:'Not started', ty:'Task', cr:true },
    // ---- 1 Job Seeker (COMPRESSED — network 26 Jun · build & test 3 Jul · user testing 10 Jul · pilot/priority sites to 31 Jul · Phase 1 rollout to end Aug · Phase 2 in Sep, returns-dependent) ----
    { id:'J22', w:'J', t:'Code-signing certificate (D-14) + WDAC allowed-signer rule (D-7) — master gate for device-side pipeline + Nerdio signing', o:'CYB', s:'ENG', dep:[], st:'2026-06-24', en:'2026-06-26', dy:3, su:'In progress', ty:'Task', cr:true },
    { id:'J1', w:'J', t:'Jobseeker AVD build — golden image (WDAC-hardened) + Nerdio host pool + credential pipeline (Key Vault / Credential Proxy / rotation) + Conditional Access + Shell Launcher + lock-screen credential PR', o:'ENG', s:'NERDIO', dep:['N5','J22'], st:'2026-06-26', en:'2026-07-02', dy:6, su:'In progress', ty:'Task', cr:true },
    { id:'J6', w:'J', t:'Test AVD build end to end (FVE test env + production network)', o:'ENG', s:'NET', dep:['J1'], st:'2026-07-02', en:'2026-07-03', dy:2, su:'Not started', ty:'Task', cr:true },
    { id:'J8', w:'J', t:'MILESTONE: Jobseeker AVD build & test complete', o:'ENG', s:'PFM', dep:['J6'], st:'2026-07-03', en:'2026-07-03', su:'Not started', ty:'Milestone', cr:true },
    { id:'J9', w:'J', t:'Finalise CompNow build instructions + CompNow proves wipe/prep/Autopilot/label/ship', o:'ENG', s:'DBPART', dep:['J8'], st:'2026-07-06', en:'2026-07-10', dy:5, su:'Not started', ty:'Task' },
    { id:'J23', w:'J', t:'User testing (functional + business acceptance)', o:'EUC', s:'ES', dep:['J8'], st:'2026-07-06', en:'2026-07-10', dy:5, su:'Not started', ty:'Task', cr:true },
    { id:'J19', w:'J', t:'Penetration test + remediation (RFFR / ASD ISM scope)', o:'CYB', s:'ENG', dep:['J8'], st:'2026-07-03', en:'2026-07-10', dy:6, su:'Not started', ty:'Task', cr:true },
    { id:'J21', w:'J', t:'MILESTONE: User testing + security sign-off complete — cleared for rollout', o:'EUC', s:'CTO', dep:['J23','J19'], st:'2026-07-10', en:'2026-07-10', su:'Not started', ty:'Milestone', cr:true },
    { id:'J13', w:'J', t:'Roll out to pilot + priority sites', o:'TEAM', s:'ES', dep:['J21','J9'], st:'2026-07-13', en:'2026-07-31', dy:15, su:'Not started', ty:'Task', cr:true },
    { id:'J12', w:'J', t:'MILESTONE: Pilot + priority sites complete', o:'PM', s:'PFM', dep:['J13'], st:'2026-07-31', en:'2026-07-31', su:'Not started', ty:'Milestone', cr:true },
    { id:'J16', w:'J', t:'Phase 1 rollout — new devices (~360 of 540), rolling', o:'PM', s:'DBPART', dep:['J12'], st:'2026-08-04', en:'2026-08-31', dy:20, su:'Not started', ty:'Task', cr:true },
    { id:'J17', w:'J', t:'MILESTONE: Phase 1 rollout complete (~360 of 540 devices)', o:'PM', s:'ES', dep:['J16'], st:'2026-08-31', en:'2026-08-31', su:'Not started', ty:'Milestone', cr:true },
    { id:'J24', w:'J', t:'Phase 2 rollout — remaining ~180 devices (reimaged returns). DEPENDS ON return of old devices; pace/scope conditional on returned-device condition — faulty / out-of-warranty units need replacement (CompNow + SoftwareOne), not reimage', o:'PM', s:'DBPART', dep:['J17','L1'], st:'2026-09-01', en:'2026-09-30', dy:22, su:'Not started', ty:'Task' },
    { id:'J25', w:'J', t:'MILESTONE: Phase 2 rollout complete (full ~540 fleet) — subject to device returns', o:'PM', s:'ES', dep:['J24'], st:'2026-09-30', en:'2026-09-30', su:'Not started', ty:'Milestone' },
    // ---- 2 Standard User (WHOLE workstream — design, approvals, build, pilot, pen-test, rollout, GA — completed 13 Jul → 14 Aug) ----
    { id:'S1', w:'S', t:'Document current Intune laptop SOE + Autopilot (14 policies)', o:'ENG', s:'EUC', dep:[], st:'2026-07-13', en:'2026-07-16', dy:4, su:'Not started', ty:'Task' },
    { id:'S2', w:'S', t:'Close DR-010 printing + DR-011 mapped drive decisions', o:'DOPS', s:'ENG', dep:[], st:'2026-07-13', en:'2026-07-16', dy:4, su:'Not started', ty:'Task' },
    { id:'S3', w:'S', t:'Finalise DDD V1.0 + CAB', o:'ENG', s:'ARCHD', dep:['S1','S2'], st:'2026-07-16', en:'2026-07-20', dy:3, su:'Not started', ty:'Task' },
    { id:'S4', w:'S', t:'MILESTONE: Standard User DDD approved', o:'ARCHD', s:'PFM', dep:['S3'], st:'2026-07-20', en:'2026-07-20', su:'Not started', ty:'Milestone' },
    { id:'S5', w:'S', t:'Entra groups (corp/BYOD/hosts) + CA (block unmanaged, allow Windows App)', o:'ENG', s:'CYB', dep:['S4'], st:'2026-07-20', en:'2026-07-24', dy:4, su:'Not started', ty:'Task' },
    { id:'S6', w:'S', t:'Azure Files Premium FSLogix + Entra Kerberos', o:'ENG2', s:'ARCH', dep:['N7','S4'], st:'2026-07-20', en:'2026-07-24', dy:4, su:'Not started', ty:'Task' },
    { id:'S7', w:'S', t:'Compute Gallery + golden image (multi-session, M365, Teams optimised)', o:'ENG2', s:'EUC', dep:['S6'], st:'2026-07-24', en:'2026-07-30', dy:5, su:'Not started', ty:'Task' },
    { id:'S8', w:'S', t:'Nerdio pooled host pool + corp/BYOD app groups + autoscale', o:'ENG2', s:'NERDIO', dep:['S7'], st:'2026-07-30', en:'2026-08-02', dy:3, su:'Not started', ty:'Task' },
    { id:'S9', w:'S', t:'Scope 14 Intune policies + AVD profiles to session hosts', o:'ENG2', s:'EUC', dep:['S7'], st:'2026-07-30', en:'2026-08-02', dy:3, su:'Not started', ty:'Task' },
    { id:'S17', w:'S', t:'MILESTONE: Standard User image build complete', o:'ENG2', s:'PFM', dep:['S8','S9'], st:'2026-08-02', en:'2026-08-02', su:'Not started', ty:'Milestone', cr:true },
    { id:'S10', w:'S', t:'Pilot 25–50 users (mixed personas)', o:'ENG', s:'EUC', dep:['S17'], st:'2026-08-02', en:'2026-08-07', dy:5, su:'Not started', ty:'Task' },
    { id:'S14', w:'S', t:'Update DDD with as-built changes + re-CAB approval', o:'ENG', s:'ARCHD', dep:['S17'], st:'2026-08-02', en:'2026-08-04', dy:2, su:'Not started', ty:'Task' },
    { id:'S15', w:'S', t:'Penetration test (Standard User SOE)', o:'CYB', s:'ENG', dep:['S14'], st:'2026-08-04', en:'2026-08-08', dy:4, su:'Not started', ty:'Task', cr:true },
    { id:'S11', w:'S', t:'Validate CA from corporate + personal device', o:'ENG', s:'CYB', dep:['S5','S10'], st:'2026-08-07', en:'2026-08-09', dy:2, su:'Not started', ty:'Task' },
    { id:'S16', w:'S', t:'Remediate pen-test findings + retest', o:'ENG2', s:'CYB', dep:['S15'], st:'2026-08-08', en:'2026-08-11', dy:3, su:'Not started', ty:'Task', cr:true },
    { id:'S12', w:'S', t:'Production rollout (entitle staff, comms, Windows App self-serve)', o:'EUC', s:'DBP', dep:['S11','S16'], st:'2026-08-11', en:'2026-08-14', dy:3, su:'Not started', ty:'Task' },
    { id:'S13', w:'S', t:'MILESTONE: Standard User AVD GA', o:'EUC', s:'PFM', dep:['S12'], st:'2026-08-14', en:'2026-08-14', su:'Not started', ty:'Milestone', cr:true },
    // ---- 3 Privileged (commences 17 Aug · 6-week run · live 28 Sep) ----
    { id:'P1', w:'P', t:'Privileged design: PAW-style hardened image (no mail/Teams/browse), tiers Priv(zz)/High-Priv(xy)', o:'ENG', s:'CYB', dep:['N10'], st:'2026-08-17', en:'2026-08-26', dy:8, su:'Not started', ty:'Task' },
    { id:'P2', w:'P', t:'Production access model: PIM per tier, JIT elevation, approval + audit', o:'ENG', s:'CYB', dep:['P1'], st:'2026-08-21', en:'2026-08-28', dy:6, su:'Not started', ty:'Task' },
    { id:'P3', w:'P', t:'Privileged Access DDD + CAB', o:'ENG', s:'ARCHD', dep:['P2'], st:'2026-08-27', en:'2026-09-01', dy:4, su:'Not started', ty:'Task' },
    { id:'P4', w:'P', t:'MILESTONE: Privileged DDD approved', o:'ARCHD', s:'CTO', dep:['P3'], st:'2026-09-01', en:'2026-09-01', su:'Not started', ty:'Milestone' },
    { id:'P5', w:'P', t:'Test YubiKey 5C NFC FIPS (phishing-resistant MFA for zz/xy)', o:'ENG2', s:'CYB', dep:['P1'], st:'2026-08-21', en:'2026-08-28', dy:6, su:'Not started', ty:'Task', cr:true },
    { id:'P6', w:'P', t:'MILESTONE: YubiKey 5C NFC FIPS validated', o:'CYB', s:'ENG', dep:['P5'], st:'2026-08-28', en:'2026-08-28', su:'Not started', ty:'Milestone', cr:true },
    { id:'P7', w:'P', t:'Build hardened Privileged image + secure pool', o:'ENG2', s:'ARCH', dep:['P4'], st:'2026-09-01', en:'2026-09-10', dy:8, su:'Not started', ty:'Task', cr:true },
    { id:'P8', w:'P', t:'CA + PIM for Priv(zz) & High-Priv(xy) prod scopes; YubiKey-only sign-in', o:'ENG', s:'CYB', dep:['P6','P7'], st:'2026-09-10', en:'2026-09-16', dy:6, su:'Not started', ty:'Task', cr:true },
    { id:'P9', w:'P', t:'Pilot privileged users (both tiers) + validate prod access via YubiKey', o:'ENG', s:'CYB', dep:['P8'], st:'2026-09-16', en:'2026-09-22', dy:5, su:'Not started', ty:'Task' },
    { id:'P11', w:'P', t:'Penetration test (Privileged image — PAW hardening, prod-access boundary)', o:'CYB', s:'ENG', dep:['P8'], st:'2026-09-16', en:'2026-09-22', dy:5, su:'Not started', ty:'Task', cr:true },
    { id:'P12', w:'P', t:'Remediate pen-test findings + retest', o:'ENG2', s:'CYB', dep:['P11','P9'], st:'2026-09-22', en:'2026-09-28', dy:4, su:'Not started', ty:'Task', cr:true },
    { id:'P10', w:'P', t:'MILESTONE: Privileged Access live (zz + xy)', o:'ENG', s:'CTO', dep:['P12'], st:'2026-09-28', en:'2026-09-28', su:'Not started', ty:'Milestone', cr:true },
    // ---- 4 Developer (DDD design in parallel during Sep; IMAGE build starts immediately after Priv completes 28 Sep — runs into early Nov, PAST contract end) ----
    // ---- 4 Developer (WHOLE workstream — design, approvals, build — commences immediately after Privileged completes 28 Sep — GA ~late Nov, PAST contract end) ----
    { id:'D1', w:'D', t:'Finalise Dev DDD: permissive dev image, limited blocks, no production path — Developer work commences after Privileged completes', o:'ENG', s:'ARCHD', dep:['N10','P10'], st:'2026-09-29', en:'2026-10-07', dy:7, su:'Not started', ty:'Task' },
    { id:'D2', w:'D', t:'Design Dev network from JS pattern + adjust (deny-by-default egress, Zscaler at endpoint)', o:'ENG', s:'NET', dep:['N10','P10'], st:'2026-10-05', en:'2026-10-09', dy:5, su:'Not started', ty:'Task' },
    { id:'D3', w:'D', t:'AVD landing zone (Bicep) + FSLogix Premium ZRS + Sentinel + Entra groups', o:'ENG2', s:'ARCH', dep:['D1','D2'], st:'2026-10-09', en:'2026-10-16', dy:6, su:'Not started', ty:'Task', cr:true },
    { id:'D4', w:'D', t:'AIB image pipeline (Git template, signing, SBOM)', o:'ENG2', s:'CYB', dep:['D3'], st:'2026-10-16', en:'2026-10-22', dy:5, su:'Not started', ty:'Task', cr:true },
    { id:'D5', w:'D', t:'Primary pooled host pool + scaling plan (nested virtualisation)', o:'ENG2', s:'NERDIO', dep:['D4'], st:'2026-10-22', en:'2026-10-28', dy:4, su:'Not started', ty:'Task', cr:true },
    { id:'D6', w:'D', t:'Dev tooling layers (VS, Podman/containers, WSL2) with limited blocks', o:'ENG2', s:'EUC', dep:['D5'], st:'2026-10-28', en:'2026-11-03', dy:5, su:'Not started', ty:'Task', cr:true },
    { id:'D7', w:'D', t:'Pilot ring (PDE owner + cohort) + smoke test + CA enforced', o:'ENG', s:'PDE', dep:['D5','D6'], st:'2026-11-03', en:'2026-11-09', dy:5, su:'Not started', ty:'Task' },
    { id:'D12', w:'D', t:'Penetration test (Developer SOE — permissive image, no-prod-path boundary)', o:'CYB', s:'ENG', dep:['D6'], st:'2026-11-03', en:'2026-11-10', dy:6, su:'Not started', ty:'Task', cr:true },
    { id:'D13', w:'D', t:'Remediate pen-test findings + retest', o:'ENG2', s:'CYB', dep:['D12'], st:'2026-11-10', en:'2026-11-16', dy:4, su:'Not started', ty:'Task', cr:true },
    { id:'D9', w:'D', t:'Capability phase 2 enabled at GA (winget/ACR); phase 3 (Copilot/MCP/local LLM) configured', o:'ENG2', s:'CYB', dep:['D7'], st:'2026-11-09', en:'2026-11-16', dy:6, su:'Not started', ty:'Task' },
    { id:'D8', w:'D', t:'Team-by-team migration from legacy PDE', o:'ENG2', s:'EUC', dep:['D7','D13'], st:'2026-11-16', en:'2026-11-20', dy:4, su:'Not started', ty:'Task', cr:true },
    { id:'D10', w:'D', t:'Begin legacy PDE decommission (cutover; full retire after stability window)', o:'ENG2', s:'DOPS', dep:['D8'], st:'2026-11-20', en:'2026-11-24', dy:2, su:'Not started', ty:'Task' },
    { id:'D11', w:'D', t:'MILESTONE: Developer SOE GA (post-contract — ~late Nov)', o:'ENG', s:'PFM', dep:['D8','D13'], st:'2026-11-20', en:'2026-11-20', su:'Not started', ty:'Milestone', cr:true },
    // ---- 5 ES (PULLED FORWARD — runs in parallel Aug–Sep; live 23 Sep) ----
    { id:'E1', w:'E', t:'Adapt JS image: midnight daily reset (vs 10-min inactivity)', o:'ENG2', s:'ES', dep:['J8'], st:'2026-07-27', en:'2026-07-31', dy:5, su:'Not started', ty:'Task' },
    { id:'E2', w:'E', t:'Redesign take-home: any Wi-Fi, off-site filtering (Zscaler on device), revised CA', o:'ENG', s:'CYB', dep:['E1'], st:'2026-08-03', en:'2026-08-14', dy:10, su:'Not started', ty:'Task', cr:true },
    { id:'E3', w:'E', t:'ES DDD + CAB', o:'ENG', s:'ARCHD', dep:['E2'], st:'2026-08-17', en:'2026-08-21', dy:5, su:'Not started', ty:'Task' },
    { id:'E4', w:'E', t:'MILESTONE: ES DDD approved', o:'ARCHD', s:'PFM', dep:['E3'], st:'2026-08-21', en:'2026-08-21', su:'Not started', ty:'Milestone' },
    { id:'E5', w:'E', t:'Build ES image/profiles (midnight reset, incl. Eskilled folder)', o:'ENG2', s:'ESTRAIN', dep:['E4'], st:'2026-08-24', en:'2026-09-02', dy:8, su:'Not started', ty:'Task' },
    { id:'E6', w:'E', t:'Test off-site scenarios (home Wi-Fi, reset, filtering)', o:'TEAM', s:'ES', dep:['E5'], st:'2026-09-02', en:'2026-09-07', dy:4, su:'Not started', ty:'Task', cr:true },
    { id:'E9', w:'E', t:'Penetration test (ES take-home — off-site filtering, midnight reset, CA)', o:'CYB', s:'ENG', dep:['E5'], st:'2026-09-02', en:'2026-09-09', dy:5, su:'Not started', ty:'Task', cr:true },
    { id:'E10', w:'E', t:'Remediate pen-test findings + retest', o:'ENG2', s:'CYB', dep:['E9','E6'], st:'2026-09-09', en:'2026-09-15', dy:4, su:'Not started', ty:'Task', cr:true },
    { id:'E7', w:'E', t:'Pilot + rollout (take-home devices)', o:'PM', s:'ES', dep:['E6','E10'], st:'2026-09-15', en:'2026-09-23', dy:6, su:'Not started', ty:'Task' },
    { id:'E8', w:'E', t:'MILESTONE: ES take-home live', o:'PM', s:'PFM', dep:['E7'], st:'2026-09-23', en:'2026-09-23', su:'Not started', ty:'Milestone', cr:true },
    // ---- 6 Logistics ----
    { id:'L1', w:'L', t:'Retrieve old JS devices onsite + place new (rolling)', o:'PM', s:'ES', dep:['J8'], st:'2026-07-13', en:'2026-08-21', dy:29, su:'Not started', ty:'Task' },
    { id:'L2', w:'L', t:'Asset register updates (ongoing)', o:'PM', s:'EUC', dep:[], st:'2026-08-04', en:'2026-09-30', dy:42, su:'Not started', ty:'Task' },
    { id:'L3', w:'L', t:'Retrieve standard-user laptops as AVD replaces', o:'PM', s:'EUC', dep:['S13'], st:'2026-09-07', en:'2026-09-30', dy:18, su:'Not started', ty:'Task' },
    { id:'L4', w:'L', t:'Retrieve/contract high-priv laptops → users on own Macs (Privileged image)', o:'PM', s:'PFM', dep:['P10'], st:'2026-09-23', en:'2026-09-30', dy:6, su:'Not started', ty:'Task' },
    // ---- 7 KB & Enablement ----
    { id:'K1', w:'K', t:'KB: APM-KIOSK network build', o:'ENG', s:'DBP', dep:['N10'], st:'2026-07-13', en:'2026-07-20', dy:6, su:'Not started', ty:'Task' },
    { id:'K2', w:'K', t:'KB: Device Build Partner wipe/prep/ship process', o:'ENG', s:'DBP', dep:['J9'], st:'2026-07-24', en:'2026-07-29', dy:4, su:'Not started', ty:'Task' },
    { id:'K3', w:'K', t:'KB: JS ops (password rotation, lock screen, device replace)', o:'ENG', s:'DBP', dep:['J8'], st:'2026-07-27', en:'2026-08-10', dy:11, su:'Not started', ty:'Task' },
    { id:'K4', w:'K', t:'KB: image/patch, FSLogix lifecycle, CA BYOD, Windows App onboarding', o:'ENG', s:'DBP', dep:['S8'], st:'2026-08-26', en:'2026-09-07', dy:9, su:'Not started', ty:'Task' },
    { id:'K5', w:'K', t:'KB: ES midnight reset, off-site connectivity, Eskilled access', o:'ENG', s:'DBP', dep:['E5'], st:'2026-09-02', en:'2026-09-10', dy:8, su:'Not started', ty:'Task' },
    { id:'K6', w:'K', t:'KB: Privileged access request, PIM per tier (zz/xy), YubiKey enrolment', o:'ENG', s:'DBP', dep:['P7'], st:'2026-09-09', en:'2026-09-18', dy:8, su:'Not started', ty:'Task' },
    { id:'K7', w:'K', t:'KB: Dev image pipeline/rollback, self-service tooling, MCP request, FSLogix recovery', o:'ENG', s:'DBP', dep:['D6'], st:'2026-11-17', en:'2026-11-25', dy:7, su:'Not started', ty:'Task' },
    { id:'K8', w:'K', t:'KB: Tier-1 Service Desk triage runbooks (all use cases)', o:'ENG', s:'DBP', dep:['K3'], st:'2026-09-14', en:'2026-09-30', dy:13, su:'Not started', ty:'Task' },
  ],
  risks: [
    { n:1, risk:'APM is running several tier-one projects at once. The AVD schedule depends on APM departments (Network, Cyber, EUC) and decision-makers delivering their inputs on time; contention for APM resources and approvals — not delivery capacity — is the main risk to the 30 Sep dates.', impact:'High', like:'High', owner:'Portfolio Mgr (APM)', mit:'Lock an APM owner and due date for every dependency (network, DR-010/011, pen-test window, PDE owner). Weekly dependency review with the Portfolio Manager; escalate APM-side slippage immediately.' },
    { n:2, risk:'Network (site + Azure) is on the critical path from day one and is delivered by APM Network / Infrastructure. APM-side network slippage directly delays Job Seeker testing and rollout.', impact:'High', like:'Med', owner:'Network Lead / Architect', mit:'Confirm APM Network resourcing now; daily stand-up until network proven. Twiki supports the Azure foundation.' },
    { n:3, risk:'Privileged Access is net-new (PAW, two tiers, YubiKey) added mid-window; carries production blast-radius risk.', impact:'High', like:'Med', owner:'Cyber lead (Ugbaad Adani)', mit:'Design once, gate hard on YubiKey; the Cyber lead signs off the privileged model; no high-priv cutover until P6 + P8 pass.' },
    { n:4, risk:'YubiKey 5C NFC FIPS gates Privileged production access; if it fails, no phishing-resistant path from Macs.', impact:'High', like:'Med', owner:'Shaun Struik / Cyber', mit:'Run YubiKey test early (wk 17 Aug). Fallback to a dedicated hardened Cloud PC for the highest tier.' },
    { n:5, risk:'ES take-home breaks the site-VLAN / PSK / site-Zscaler controls JS relies on — a security redesign. Now compressed into Aug–Sep to land by 30 Sep, running in parallel with Standard User, Privileged and Developer builds.', impact:'High', like:'High', owner:'Shaun Struik / Cyber', mit:'Treat ES as its own design (Zscaler client on device, revised CA, any Wi-Fi, midnight reset). Confirm Eskilled path early; protect the Aug–Sep build capacity.' },
    { n:6, risk:'Developer must stay a permissive image with no production path; production access lives only in the Privileged image.', impact:'Med', like:'Low', owner:'Shaun Struik / Head Arch.', mit:'Keep the boundary clean — no production scopes on the Dev pool.' },
    { n:7, risk:'Standard User printing (DR-010) and mapped drive (DR-011) still pending; both gate the SU build.', impact:'Med', like:'High', owner:'Head Digital Ops / EUC', mit:'Force decisions by 24 Jul. Universal Print likely; confirm mapped-drive backend.' },
    { n:8, risk:'RESOLVED — Job Seeker device count confirmed at 540 (early drafts showed 517 vs 540).', impact:'Low', like:'Low', owner:'Twiki PM / EUC', mit:'Done — 540 is the confirmed count, applied everywhere.' },
    { n:9, risk:'RESOLVED — Nerdio environment is set up and complete; Standard User, Privileged, Developer and ES all reuse it.', impact:'Low', like:'Low', owner:'Shaun Struik / Architect', mit:'Done. No action.' },
    { n:10, risk:'Developer (PDE) owner not yet named — gates Dev pilot, image approval and service catalogue.', impact:'Med', like:'Med', owner:'Portfolio Mgr / Head Digital Ops', mit:'Nominate the APM PDE owner now.' },
    { n:11, risk:'A single AVD Build Engineer cannot build images in parallel, so the use cases are serialised whole-workstream blocks: Standard User (full lifecycle design→GA, 13 Jul–14 Aug) → Privileged (17 Aug–28 Sep) → Developer (commences immediately after Privileged, runs to ~20 Nov). Two consequences: (a) the Standard User window is very tight — image complete ~2 Aug then pilot, pen-test, remediation and production rollout all inside ~12 days; (b) Developer cannot start until 29 Sep and lands ~20 Nov, PAST the 30 Sep contract end. Network, Job Seeker, Standard User, ES and Privileged all complete by 30 Sep.', impact:'High', like:'High', owner:'Portfolio Mgr', mit:'For Standard User, pre-book the pen-test window and agree a fast retest turnaround, or accept a staged rollout where GA is “pilot-proven + pen-test booked”. For Developer, confirm APM accepts post-contract GA, or add a second build engineer from mid-Aug to run Privileged and Developer in parallel. Hold every APM dependency (network, DR-010/011, pen-test windows, PDE owner) to a confirmed date.' },
    { n:12, risk:'Every image now requires a penetration test + remediation before go-live (RFFR / ASD ISM). No pen-test vendor or booked window is confirmed — an external scheduling dependency that gates every go-live.', impact:'High', like:'High', owner:'Shaun Struik / Cyber / Portfolio Mgr', mit:'Book the pen-test vendor now and reserve per-image windows. Bundle Job Seeker + Standard User into one engagement; confirm scope and retest turnaround up front.' },
  ],
};
