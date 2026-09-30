// APM AVD Program — full workbook data (faithful recreation of the master .xlsx, supplier names retained).
// Edit rows here and re-export.
window.WB = {
 "meta": {
  "title": "APM Digital Workplace — AVD Program Plan & Gantt",
  "sub": "Delivery: Twiki Corp · Order: Job Seeker, Standard User, ES, Privileged, Developer · Window: 23 Jun – 30 Sep 2026 (contract end) · Network target: 26 Jun",
  "note": "ES = Employment Services take-home device (was CTA). Privileged = production access at two tiers: Priv (zz) and High-Priv (xy), YubiKey-gated."
 },
 "workstreams": [
  {
   "key": "0 Network",
   "color": "#1F2D58"
  },
  {
   "key": "1 Job Seeker",
   "color": "#F89728"
  },
  {
   "key": "2 Standard User",
   "color": "#2E3192"
  },
  {
   "key": "3 ES",
   "color": "#E51C84"
  },
  {
   "key": "4 Privileged",
   "color": "#5C2D91"
  },
  {
   "key": "5 Developer",
   "color": "#2C6FD6"
  },
  {
   "key": "6 Logistics",
   "color": "#6E7BA6"
  },
  {
   "key": "7 KB & Enablement",
   "color": "#1E8E5A"
  }
 ],
 "tasks": [
  {
   "id": "N1",
   "ws": "0 Network",
   "phase": "Site network",
   "task": "Repurpose JS VLAN to APM-KIOSK (VLAN 73), hidden SSID + PSK via Intune",
   "owner": "APM Network - Michael Court",
   "support": "Twiki - Shaun Struik",
   "dep": [],
   "st": "2026-06-23",
   "en": "2026-06-26",
   "days": 4,
   "pct": 0,
   "status": "In progress",
   "type": "Task",
   "crit": true
  },
  {
   "id": "N2",
   "ws": "0 Network",
   "phase": "Site network",
   "task": "Meraki per-site /26 template, 20Mbps, remove CAPTCHA",
   "owner": "APM Network - Michael Court",
   "support": "Twiki - Michael Webster",
   "dep": [],
   "st": "2026-06-23",
   "en": "2026-06-26",
   "days": 3,
   "pct": 0,
   "status": "In progress",
   "type": "Task",
   "crit": true
  },
  {
   "id": "N3",
   "ws": "0 Network",
   "phase": "Site network",
   "task": "Palo Alto east-west firewall rules (kiosk to AVD, deny-all)",
   "owner": "APM Network - Michael Court",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "N1"
   ],
   "st": "2026-06-24",
   "en": "2026-07-01",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": true
  },
  {
   "id": "N4",
   "ws": "0 Network",
   "phase": "Site network",
   "task": "Zscaler IPSEC tunnel (Stratus) cutover from ZCC",
   "owner": "APM Network - Michael Court",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "N3"
   ],
   "st": "2026-06-25",
   "en": "2026-07-03",
   "days": 8,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": true
  },
  {
   "id": "N5",
   "ws": "0 Network",
   "phase": "Site network",
   "task": "MILESTONE: Network build target",
   "owner": "APM Network - Michael Court",
   "support": "Twiki - Shaun Struik",
   "dep": [
    "N1",
    "N2"
   ],
   "st": "2026-06-26",
   "en": "2026-06-26",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": true
  },
  {
   "id": "N6",
   "ws": "0 Network",
   "phase": "Azure foundation",
   "task": "Hub VNet - DNS Private Resolver, NAT GW, shared services",
   "owner": "Twiki - Michael Webster",
   "support": "Twiki - Shaun Struik",
   "dep": [],
   "st": "2026-06-23",
   "en": "2026-07-03",
   "days": 10,
   "pct": 0,
   "status": "In progress",
   "type": "Task",
   "crit": true
  },
  {
   "id": "N7",
   "ws": "0 Network",
   "phase": "Azure foundation",
   "task": "AVD spoke VNet, NSGs, private endpoints (KV/Files/Func)",
   "owner": "Twiki - Shaun Struik",
   "support": "Twiki - Michael Webster",
   "dep": [
    "N6"
   ],
   "st": "2026-06-29",
   "en": "2026-07-08",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": true
  },
  {
   "id": "N8",
   "ws": "0 Network",
   "phase": "Azure foundation",
   "task": "DNS Private Resolver zones + FQDN allowlist validation",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Network - Michael Court",
   "dep": [
    "N7"
   ],
   "st": "2026-07-06",
   "en": "2026-07-10",
   "days": 4,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "N9",
   "ws": "0 Network",
   "phase": "Test & document",
   "task": "Test network end-to-end (AVD FQDNs, Key Vault, Zscaler path)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Network - Michael Court",
   "dep": [
    "N4",
    "N7"
   ],
   "st": "2026-07-06",
   "en": "2026-07-10",
   "days": 4,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": true
  },
  {
   "id": "N10",
   "ws": "0 Network",
   "phase": "Test & document",
   "task": "Network As-Built document",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Network - Michael Court",
   "dep": [
    "N9"
   ],
   "st": "2026-07-08",
   "en": "2026-07-15",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "N11",
   "ws": "0 Network",
   "phase": "Test & document",
   "task": "Patternise reusable Azure hub-spoke build template",
   "owner": "Twiki - Michael Webster",
   "support": "Twiki - Shaun Struik",
   "dep": [
    "N10"
   ],
   "st": "2026-07-13",
   "en": "2026-07-17",
   "days": 4,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "N12",
   "ws": "0 Network",
   "phase": "Test & document",
   "task": "MILESTONE: Network ready + patternised",
   "owner": "Twiki - Michael Webster",
   "support": "APM - Murray Thomas",
   "dep": [
    "N9",
    "N11"
   ],
   "st": "2026-07-17",
   "en": "2026-07-17",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": true
  },
  {
   "id": "J1",
   "ws": "1 Job Seeker",
   "phase": "AVD & identity",
   "task": "Golden image captured (WDAC-hardened, Win11 Ent single-session) + Nerdio host pool defined — session-host deploy pending network",
   "owner": "Twiki - Shaun Struik",
   "support": "Nerdio",
   "dep": [
    "N7"
   ],
   "st": "2026-06-29",
   "en": "2026-07-10",
   "days": 11,
   "pct": 60,
   "status": "In progress",
   "type": "Task",
   "crit": true
  },
  {
   "id": "J22",
   "ws": "1 Job Seeker",
   "phase": "AVD & identity",
   "task": "Code-signing certificate issued (D-14) + added as WDAC allowed signer (D-7) — master gate for device-side pipeline + Nerdio signing",
   "owner": "APM Cyber - Ugbaad Adani",
   "support": "Twiki - Shaun Struik",
   "dep": [],
   "st": "2026-06-29",
   "en": "2026-07-08",
   "days": 5,
   "pct": 0,
   "status": "Blocked",
   "type": "Task",
   "crit": true
  },
  {
   "id": "J2",
   "ws": "1 Job Seeker",
   "phase": "AVD & identity",
   "task": "Credential pipeline: Key Vault + Credential Proxy (EasyAuth+PRT) + rotation runbook + Hybrid Worker — blocked pending cert (J22) + network design",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "N7"
   ],
   "st": "2026-06-29",
   "en": "2026-07-17",
   "days": 18,
   "pct": 0,
   "status": "Blocked",
   "type": "Task",
   "crit": false
  },
  {
   "id": "J3",
   "ws": "1 Job Seeker",
   "phase": "AVD & identity",
   "task": "Conditional Access set built — report-only until cyber re-approves (consolidate duplicate set + fix \"Badge\" Teams-block)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "J2"
   ],
   "st": "2026-07-13",
   "en": "2026-07-17",
   "days": 4,
   "pct": 70,
   "status": "In progress",
   "type": "Task",
   "crit": false
  },
  {
   "id": "J4",
   "ws": "1 Job Seeker",
   "phase": "AVD & identity",
   "task": "Shell Launcher + Windows App + Autopilot self-deploying profile",
   "owner": "Twiki - Shaun Struik",
   "support": "APM EUC - Nick Dorbie",
   "dep": [
    "J1"
   ],
   "st": "2026-07-08",
   "en": "2026-07-15",
   "days": 7,
   "pct": 80,
   "status": "In progress",
   "type": "Task",
   "crit": false
  },
  {
   "id": "J5",
   "ws": "1 Job Seeker",
   "phase": "AVD & identity",
   "task": "Lock-screen credential PR (render + LSA write) — blocked: needs cert (J22) for full-language under WDAC",
   "owner": "Twiki - Shaun Struik",
   "support": "APM EUC - Nick Dorbie",
   "dep": [
    "J2"
   ],
   "st": "2026-07-17",
   "en": "2026-07-20",
   "days": 3,
   "pct": 0,
   "status": "Blocked",
   "type": "Task",
   "crit": false
  },
  {
   "id": "J6",
   "ws": "1 Job Seeker",
   "phase": "Device test",
   "task": "Validate host deploy + pipeline in FVE (test env) — Nerdio CSE blocked by WDAC + missing Storage egress",
   "owner": "Twiki - Shaun Struik",
   "support": "APM EUC - Nick Dorbie",
   "dep": [
    "J3",
    "J4"
   ],
   "st": "2026-07-17",
   "en": "2026-07-17",
   "days": 0,
   "pct": 40,
   "status": "In progress",
   "type": "Task",
   "crit": false
  },
  {
   "id": "J7",
   "ws": "1 Job Seeker",
   "phase": "Device test",
   "task": "Test device on prod network — blocked pending finalised + approved network design",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Network - Michael Court",
   "dep": [
    "N5",
    "J6"
   ],
   "st": "2026-07-20",
   "en": "2026-07-24",
   "days": 4,
   "pct": 0,
   "status": "Blocked",
   "type": "Task",
   "crit": true
  },
  {
   "id": "J8",
   "ws": "1 Job Seeker",
   "phase": "Device test",
   "task": "MILESTONE: Test device validated on both networks",
   "owner": "Twiki - Shaun Struik",
   "support": "APM - Murray Thomas",
   "dep": [
    "J7"
   ],
   "st": "2026-07-24",
   "en": "2026-07-24",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": true
  },
  {
   "id": "J9",
   "ws": "1 Job Seeker",
   "phase": "CompNow build",
   "task": "Finalise CompNow build instructions (wipe/prep/Autopilot/label/ship)",
   "owner": "Twiki - Shaun Struik",
   "support": "CompNow",
   "dep": [
    "J7"
   ],
   "st": "2026-07-24",
   "en": "2026-07-29",
   "days": 5,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "J10",
   "ws": "1 Job Seeker",
   "phase": "CompNow build",
   "task": "CompNow tests build process",
   "owner": "CompNow",
   "support": "Twiki - Shaun Struik",
   "dep": [
    "J9"
   ],
   "st": "2026-07-29",
   "en": "2026-07-31",
   "days": 2,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "J11",
   "ws": "1 Job Seeker",
   "phase": "CompNow build",
   "task": "Two team members test order-to-delivery end to end",
   "owner": "Twiki - Shaun + Dave",
   "support": "CompNow",
   "dep": [
    "J10"
   ],
   "st": "2026-07-31",
   "en": "2026-08-04",
   "days": 4,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": true
  },
  {
   "id": "J12",
   "ws": "1 Job Seeker",
   "phase": "CompNow build",
   "task": "MILESTONE: Build process proven end to end",
   "owner": "Twiki - Dave Badger",
   "support": "APM - Murray Thomas",
   "dep": [
    "J11"
   ],
   "st": "2026-08-04",
   "en": "2026-08-04",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": true
  },
  {
   "id": "J13",
   "ws": "1 Job Seeker",
   "phase": "Rollout",
   "task": "Pilot 5-10 devices across 2-3 sites",
   "owner": "Twiki - Shaun + Dave",
   "support": "APM ES - Ben Riches",
   "dep": [
    "J12"
   ],
   "st": "2026-08-04",
   "en": "2026-08-11",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "J14",
   "ws": "1 Job Seeker",
   "phase": "Rollout",
   "task": "Site network cutover JS to APM-KIOSK (rolling, per site)",
   "owner": "APM Network - Michael Court",
   "support": "Twiki - Dave Badger",
   "dep": [
    "J8"
   ],
   "st": "2026-08-11",
   "en": "2026-09-11",
   "days": 31,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "J15",
   "ws": "1 Job Seeker",
   "phase": "Rollout",
   "task": "Onsite device test",
   "owner": "Twiki - Dave Badger",
   "support": "APM ES - Ben Riches",
   "dep": [
    "J13"
   ],
   "st": "2026-08-11",
   "en": "2026-08-14",
   "days": 3,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "J16",
   "ws": "1 Job Seeker",
   "phase": "Rollout",
   "task": "National rollout (~540 devices, rolling)",
   "owner": "Twiki - Dave Badger",
   "support": "CompNow",
   "dep": [
    "J15"
   ],
   "st": "2026-08-17",
   "en": "2026-09-11",
   "days": 25,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "J17",
   "ws": "1 Job Seeker",
   "phase": "Rollout",
   "task": "MILESTONE: Job Seeker national rollout complete",
   "owner": "Twiki - Dave Badger",
   "support": "APM ES - Ben Riches",
   "dep": [
    "J16"
   ],
   "st": "2026-09-11",
   "en": "2026-09-11",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": false
  },
  {
   "id": "S1",
   "ws": "2 Standard User",
   "phase": "Document & design",
   "task": "Document current Intune laptop SOE + Autopilot (14 policies)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM EUC - Nick Dorbie",
   "dep": [],
   "st": "2026-07-06",
   "en": "2026-07-17",
   "days": 11,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "S2",
   "ws": "2 Standard User",
   "phase": "Document & design",
   "task": "Close DR-010 printing + DR-011 mapped drive decisions",
   "owner": "APM Digital Ops - Michael Barker",
   "support": "Twiki - Shaun Struik",
   "dep": [],
   "st": "2026-07-13",
   "en": "2026-07-24",
   "days": 11,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "S3",
   "ws": "2 Standard User",
   "phase": "Document & design",
   "task": "Finalise DDD V1.0 + CAB",
   "owner": "Twiki - Shaun Struik",
   "support": "APM - Samit Chandra",
   "dep": [
    "S1",
    "S2"
   ],
   "st": "2026-07-27",
   "en": "2026-07-31",
   "days": 4,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "S4",
   "ws": "2 Standard User",
   "phase": "Document & design",
   "task": "MILESTONE: Standard User DDD approved",
   "owner": "APM - Samit Chandra",
   "support": "APM - Murray Thomas",
   "dep": [
    "S3"
   ],
   "st": "2026-07-31",
   "en": "2026-07-31",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": false
  },
  {
   "id": "S5",
   "ws": "2 Standard User",
   "phase": "Build",
   "task": "Entra groups (corp/BYOD/hosts) + CA (block unmanaged, allow Windows App, context groups)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "N11",
    "S4"
   ],
   "st": "2026-08-03",
   "en": "2026-08-12",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "S6",
   "ws": "2 Standard User",
   "phase": "Build",
   "task": "Azure Files Premium FSLogix + Entra Kerberos",
   "owner": "Twiki - Shaun Struik",
   "support": "Twiki - Michael Webster",
   "dep": [
    "N11"
   ],
   "st": "2026-08-03",
   "en": "2026-08-12",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "S7",
   "ws": "2 Standard User",
   "phase": "Build",
   "task": "Compute Gallery + golden image (multi-session, M365, Teams optimised)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM EUC - Nick Dorbie",
   "dep": [
    "S6"
   ],
   "st": "2026-08-12",
   "en": "2026-08-21",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "S8",
   "ws": "2 Standard User",
   "phase": "Build",
   "task": "Nerdio pooled host pool + corp/BYOD app groups + autoscale",
   "owner": "Twiki - Shaun Struik",
   "support": "Nerdio",
   "dep": [
    "S7"
   ],
   "st": "2026-08-21",
   "en": "2026-08-26",
   "days": 5,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "S9",
   "ws": "2 Standard User",
   "phase": "Build",
   "task": "Scope 14 Intune policies + AVD profiles to session hosts",
   "owner": "Twiki - Shaun Struik",
   "support": "APM EUC - Nick Dorbie",
   "dep": [
    "S7"
   ],
   "st": "2026-08-21",
   "en": "2026-08-26",
   "days": 5,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "S10",
   "ws": "2 Standard User",
   "phase": "Pilot & rollout",
   "task": "Pilot 25-50 users (mixed personas)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM EUC - Nick Dorbie",
   "dep": [
    "S8",
    "S9"
   ],
   "st": "2026-08-26",
   "en": "2026-09-04",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "S11",
   "ws": "2 Standard User",
   "phase": "Pilot & rollout",
   "task": "Validate CA from corporate + personal device",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "S5",
    "S10"
   ],
   "st": "2026-08-26",
   "en": "2026-08-29",
   "days": 3,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "S12",
   "ws": "2 Standard User",
   "phase": "Pilot & rollout",
   "task": "Production rollout (entitle staff, comms, Windows App self-serve)",
   "owner": "APM EUC - Nick Dorbie",
   "support": "APM - Kath Nash",
   "dep": [
    "S10"
   ],
   "st": "2026-09-07",
   "en": "2026-09-25",
   "days": 18,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "S13",
   "ws": "2 Standard User",
   "phase": "Pilot & rollout",
   "task": "MILESTONE: Standard User AVD GA",
   "owner": "APM EUC - Nick Dorbie",
   "support": "APM - Murray Thomas",
   "dep": [
    "S12"
   ],
   "st": "2026-09-25",
   "en": "2026-09-25",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": false
  },
  {
   "id": "E1",
   "ws": "3 ES",
   "phase": "Design adaptation",
   "task": "Adapt JS image: midnight daily reset (vs 10-min inactivity)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM ES - Ben Riches",
   "dep": [
    "J8"
   ],
   "st": "2026-07-27",
   "en": "2026-07-31",
   "days": 4,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "E2",
   "ws": "3 ES",
   "phase": "Design adaptation",
   "task": "Redesign take-home: any Wi-Fi, off-site filtering (Zscaler client on device), revised CA",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "E1"
   ],
   "st": "2026-08-03",
   "en": "2026-08-14",
   "days": 11,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": true
  },
  {
   "id": "E3",
   "ws": "3 ES",
   "phase": "Design adaptation",
   "task": "ES DDD + CAB",
   "owner": "Twiki - Shaun Struik",
   "support": "APM - Samit Chandra",
   "dep": [
    "E2"
   ],
   "st": "2026-08-17",
   "en": "2026-08-21",
   "days": 4,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "E4",
   "ws": "3 ES",
   "phase": "Design adaptation",
   "task": "MILESTONE: ES DDD approved",
   "owner": "APM - Samit Chandra",
   "support": "APM - Murray Thomas",
   "dep": [
    "E3"
   ],
   "st": "2026-08-21",
   "en": "2026-08-21",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": false
  },
  {
   "id": "E5",
   "ws": "3 ES",
   "phase": "Build & test",
   "task": "Build ES image/profiles (midnight reset, incl. Eskilled folder)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM ES - Claire McArdle",
   "dep": [
    "E4"
   ],
   "st": "2026-08-24",
   "en": "2026-09-02",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "E6",
   "ws": "3 ES",
   "phase": "Build & test",
   "task": "Test off-site scenarios (home Wi-Fi, reset, filtering)",
   "owner": "Twiki - Shaun + Dave",
   "support": "APM ES - Ben Riches",
   "dep": [
    "E5"
   ],
   "st": "2026-09-02",
   "en": "2026-09-07",
   "days": 5,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": true
  },
  {
   "id": "E7",
   "ws": "3 ES",
   "phase": "Rollout",
   "task": "Pilot + rollout (take-home devices)",
   "owner": "Twiki - Dave Badger",
   "support": "APM ES - Ben Riches",
   "dep": [
    "E6"
   ],
   "st": "2026-09-08",
   "en": "2026-09-18",
   "days": 10,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "E8",
   "ws": "3 ES",
   "phase": "Rollout",
   "task": "MILESTONE: ES live",
   "owner": "Twiki - Dave Badger",
   "support": "APM - Murray Thomas",
   "dep": [
    "E7"
   ],
   "st": "2026-09-18",
   "en": "2026-09-18",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": false
  },
  {
   "id": "P1",
   "ws": "4 Privileged",
   "phase": "Design",
   "task": "Privileged design: PAW-style hardened image (no mail/Teams/browse), two tiers Priv(zz)/High-Priv(xy)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "N11"
   ],
   "st": "2026-08-10",
   "en": "2026-08-21",
   "days": 11,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": true
  },
  {
   "id": "P2",
   "ws": "4 Privileged",
   "phase": "Design",
   "task": "Production access model: PIM per tier, just-in-time elevation, approval + audit",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "P1"
   ],
   "st": "2026-08-17",
   "en": "2026-08-26",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "P3",
   "ws": "4 Privileged",
   "phase": "Design",
   "task": "Privileged Access DDD + CAB",
   "owner": "Twiki - Shaun Struik",
   "support": "APM - Samit Chandra",
   "dep": [
    "P2"
   ],
   "st": "2026-08-24",
   "en": "2026-08-28",
   "days": 4,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "P4",
   "ws": "4 Privileged",
   "phase": "Design",
   "task": "MILESTONE: Privileged DDD approved",
   "owner": "APM - Samit Chandra",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "P3"
   ],
   "st": "2026-08-28",
   "en": "2026-08-28",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": false
  },
  {
   "id": "P5",
   "ws": "4 Privileged",
   "phase": "YubiKey",
   "task": "Test YubiKey 5C NFC FIPS (phishing-resistant MFA for zz/xy)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "P1"
   ],
   "st": "2026-08-17",
   "en": "2026-08-26",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": true
  },
  {
   "id": "P6",
   "ws": "4 Privileged",
   "phase": "YubiKey",
   "task": "MILESTONE: YubiKey 5C NFC FIPS validated",
   "owner": "APM Cyber - Ugbaad Adani",
   "support": "Twiki - Shaun Struik",
   "dep": [
    "P5"
   ],
   "st": "2026-08-26",
   "en": "2026-08-26",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": true
  },
  {
   "id": "P7",
   "ws": "4 Privileged",
   "phase": "Build",
   "task": "Build hardened Privileged image + secure pool",
   "owner": "Twiki - Shaun Struik",
   "support": "Twiki - Michael Webster",
   "dep": [
    "P4"
   ],
   "st": "2026-08-31",
   "en": "2026-09-09",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": true
  },
  {
   "id": "P8",
   "ws": "4 Privileged",
   "phase": "Build",
   "task": "CA + PIM for Priv(zz) & High-Priv(xy) production scopes; YubiKey-only sign-in",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "P6",
    "P7"
   ],
   "st": "2026-09-09",
   "en": "2026-09-16",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": true
  },
  {
   "id": "P9",
   "ws": "4 Privileged",
   "phase": "Pilot & cutover",
   "task": "Pilot privileged users (both tiers) + validate prod access via YubiKey",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "P8"
   ],
   "st": "2026-09-16",
   "en": "2026-09-23",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "P10",
   "ws": "4 Privileged",
   "phase": "Pilot & cutover",
   "task": "MILESTONE: Privileged Access live (zz + xy)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "P9"
   ],
   "st": "2026-09-23",
   "en": "2026-09-23",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": true
  },
  {
   "id": "D1",
   "ws": "5 Developer",
   "phase": "Design",
   "task": "Finalise Dev DDD: permissive dev image, limited blocks, no production-access path",
   "owner": "Twiki - Shaun Struik",
   "support": "APM - Samit Chandra",
   "dep": [
    "N11"
   ],
   "st": "2026-08-24",
   "en": "2026-09-02",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "D2",
   "ws": "5 Developer",
   "phase": "Design",
   "task": "Design Dev network from JS pattern + adjust (deny-by-default egress, Zscaler at endpoint)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Network - Michael Court",
   "dep": [
    "N11"
   ],
   "st": "2026-08-31",
   "en": "2026-09-04",
   "days": 4,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "D3",
   "ws": "5 Developer",
   "phase": "Build",
   "task": "AVD landing zone (Bicep) + FSLogix Premium ZRS + Sentinel + Entra groups",
   "owner": "Twiki - Shaun Struik",
   "support": "Twiki - Michael Webster",
   "dep": [
    "D1",
    "D2"
   ],
   "st": "2026-09-07",
   "en": "2026-09-14",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "D4",
   "ws": "5 Developer",
   "phase": "Build",
   "task": "AIB image pipeline (Git template, signing, SBOM)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "D3"
   ],
   "st": "2026-09-09",
   "en": "2026-09-16",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "D5",
   "ws": "5 Developer",
   "phase": "Build",
   "task": "Primary pooled host pool + scaling plan (nested virtualisation)",
   "owner": "Twiki - Shaun Struik",
   "support": "Nerdio",
   "dep": [
    "D4"
   ],
   "st": "2026-09-14",
   "en": "2026-09-18",
   "days": 5,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "D6",
   "ws": "5 Developer",
   "phase": "Build",
   "task": "Dev tooling layers (VS, Podman/containers, WSL2) with limited blocks",
   "owner": "Twiki - Shaun Struik",
   "support": "APM EUC - Nick Dorbie",
   "dep": [
    "D5"
   ],
   "st": "2026-09-16",
   "en": "2026-09-23",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "D7",
   "ws": "5 Developer",
   "phase": "Pilot & GA",
   "task": "Pilot ring (PDE owner + cohort) + smoke test + CA enforced",
   "owner": "Twiki - Shaun Struik",
   "support": "APM - PDE owner (TBC)",
   "dep": [
    "D5"
   ],
   "st": "2026-09-21",
   "en": "2026-09-25",
   "days": 4,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "D8",
   "ws": "5 Developer",
   "phase": "Pilot & GA",
   "task": "Team-by-team migration from legacy PDE",
   "owner": "Twiki - Shaun Struik",
   "support": "APM EUC - Nick Dorbie",
   "dep": [
    "D7"
   ],
   "st": "2026-09-25",
   "en": "2026-10-02",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "D9",
   "ws": "5 Developer",
   "phase": "Pilot & GA",
   "task": "Capability phases 2-3 (winget/ACR; Copilot/MCP/local LLM)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Cyber - Ugbaad Adani",
   "dep": [
    "D8"
   ],
   "st": "2026-09-28",
   "en": "2026-10-09",
   "days": 11,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "D10",
   "ws": "5 Developer",
   "phase": "Pilot & GA",
   "task": "Retire legacy PDE after 1 month stable",
   "owner": "Twiki - Shaun Struik",
   "support": "APM Digital Ops - Michael Barker",
   "dep": [
    "D8"
   ],
   "st": "2026-10-09",
   "en": "2026-10-16",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "D11",
   "ws": "5 Developer",
   "phase": "Pilot & GA",
   "task": "MILESTONE: Developer SOE GA (past 30 Sep on current resourcing)",
   "owner": "Twiki - Shaun Struik",
   "support": "APM - Murray Thomas",
   "dep": [
    "D8",
    "D9"
   ],
   "st": "2026-10-09",
   "en": "2026-10-09",
   "days": 0,
   "pct": 0,
   "status": "Not started",
   "type": "Milestone",
   "crit": true
  },
  {
   "id": "L1",
   "ws": "6 Logistics",
   "phase": "Job Seeker",
   "task": "Retrieve old JS devices onsite + place new (rolling)",
   "owner": "Twiki - Dave Badger",
   "support": "APM ES - Ben Riches",
   "dep": [
    "J12"
   ],
   "st": "2026-08-11",
   "en": "2026-09-11",
   "days": 31,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "L2",
   "ws": "6 Logistics",
   "phase": "All",
   "task": "Asset register updates (ongoing)",
   "owner": "Twiki - Dave Badger",
   "support": "APM EUC - Nick Dorbie",
   "dep": [],
   "st": "2026-08-04",
   "en": "2026-09-30",
   "days": 57,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "L3",
   "ws": "6 Logistics",
   "phase": "Standard User",
   "task": "Retrieve standard-user laptops as AVD replaces",
   "owner": "Twiki - Dave Badger",
   "support": "APM EUC - Nick Dorbie",
   "dep": [
    "S13"
   ],
   "st": "2026-09-07",
   "en": "2026-09-30",
   "days": 23,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "L4",
   "ws": "6 Logistics",
   "phase": "Privileged",
   "task": "Retrieve/contract high-priv laptops to users on own Macs (via Privileged image)",
   "owner": "Twiki - Dave Badger",
   "support": "APM - Murray Thomas",
   "dep": [
    "P10"
   ],
   "st": "2026-09-23",
   "en": "2026-09-30",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "K1",
   "ws": "7 KB & Enablement",
   "phase": "Network",
   "task": "KB: APM-KIOSK build/cutover + Azure hub-spoke pattern",
   "owner": "Twiki - Shaun (build)",
   "support": "Kath Nash -> Michael Court",
   "dep": [
    "N10"
   ],
   "st": "2026-07-13",
   "en": "2026-07-20",
   "days": 7,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "K2",
   "ws": "7 KB & Enablement",
   "phase": "Job Seeker",
   "task": "KB: CompNow wipe/prep/ship process",
   "owner": "Twiki - Shaun (build)",
   "support": "Kath Nash -> CompNow",
   "dep": [
    "J9"
   ],
   "st": "2026-07-24",
   "en": "2026-07-29",
   "days": 5,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "K3",
   "ws": "7 KB & Enablement",
   "phase": "Job Seeker",
   "task": "KB: JS ops (password rotation, lock screen, site cutover, device replace)",
   "owner": "Twiki - Shaun (build)",
   "support": "Kath Nash -> Nick Dorbie / Rohit Singh",
   "dep": [
    "J5"
   ],
   "st": "2026-07-27",
   "en": "2026-08-10",
   "days": 14,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "K4",
   "ws": "7 KB & Enablement",
   "phase": "Standard User",
   "task": "KB: image/patch, FSLogix lifecycle, CA BYOD, Windows App onboarding",
   "owner": "Twiki - Shaun (build)",
   "support": "Kath Nash -> Nick Dorbie",
   "dep": [
    "S8"
   ],
   "st": "2026-08-26",
   "en": "2026-09-07",
   "days": 12,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "K5",
   "ws": "7 KB & Enablement",
   "phase": "ES",
   "task": "KB: ES midnight reset, off-site connectivity, Eskilled access",
   "owner": "Twiki - Shaun (build)",
   "support": "Kath Nash -> Ben Riches / Rohit Singh",
   "dep": [
    "E5"
   ],
   "st": "2026-08-24",
   "en": "2026-09-02",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "K6",
   "ws": "7 KB & Enablement",
   "phase": "Privileged",
   "task": "KB: Privileged access request, PIM per tier (zz/xy), YubiKey enrolment",
   "owner": "Twiki - Shaun (build)",
   "support": "Kath Nash -> Ugbaad Adani / Rohit Singh",
   "dep": [
    "P7"
   ],
   "st": "2026-09-09",
   "en": "2026-09-18",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "K7",
   "ws": "7 KB & Enablement",
   "phase": "Developer",
   "task": "KB: Dev image pipeline/rollback, self-service tooling, MCP request, FSLogix recovery",
   "owner": "Twiki - Shaun (build)",
   "support": "Kath Nash -> PDE owner / Rohit Singh",
   "dep": [
    "D6"
   ],
   "st": "2026-09-23",
   "en": "2026-10-02",
   "days": 9,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  },
  {
   "id": "K8",
   "ws": "7 KB & Enablement",
   "phase": "Service Desk",
   "task": "KB: Tier-1 Service Desk triage runbooks (all use cases)",
   "owner": "Twiki - Shaun (build)",
   "support": "Kath Nash -> Rohit Singh",
   "dep": [
    "K3"
   ],
   "st": "2026-09-14",
   "en": "2026-09-30",
   "days": 16,
   "pct": 0,
   "status": "Not started",
   "type": "Task",
   "crit": false
  }
 ],
 "raci": [
  {
   "name": "Murray Thomas",
   "org": "APM",
   "role": "Digital Delivery Portfolio Manager",
   "owns": "This project - decision authority & escalation. Shaun + Dave report here.",
   "reports": "-"
  },
  {
   "name": "Nathan Heaton",
   "org": "APM",
   "role": "Program Manager (overall)",
   "owns": "Program-level coordination across projects",
   "reports": "-"
  },
  {
   "name": "Samit Chandra",
   "org": "APM",
   "role": "Head of Digital Transformation & Architecture",
   "owns": "DDD owner; architecture authority; Dev requirements sign-off",
   "reports": "-"
  },
  {
   "name": "Jensen Spencer",
   "org": "APM",
   "role": "CTO / CISO",
   "owns": "Executive authority — delegates delivery and sign-off to department heads",
   "reports": "-"
  },
  {
   "name": "Michael Barker",
   "org": "APM",
   "role": "Head of Digital Operations",
   "owns": "Operations; SSID approval; Dev support model; PDE decommission",
   "reports": "Jensen Spencer"
  },
  {
   "name": "Michael Court",
   "org": "APM",
   "role": "IT Infrastructure Lead",
   "owns": "Network & infrastructure build (site + Azure)",
   "reports": "Jensen Spencer (assumed)"
  },
  {
   "name": "Ugbaad Adani",
   "org": "APM",
   "role": "Cyber Security",
   "owns": "Cyber controls, RFFR assurance, CA/PIM, Privileged Access + YubiKey",
   "reports": "Jensen Spencer (assumed)"
  },
  {
   "name": "Nick Dorbie",
   "org": "APM",
   "role": "End User Compute Manager",
   "owns": "EUC build/operations, Intune",
   "reports": "Michael Barker (assumed)"
  },
  {
   "name": "Rohit Singh",
   "org": "APM",
   "role": "IT Service Lead / Service Desk",
   "owns": "Support, triage runbooks",
   "reports": "Michael Barker (assumed)"
  },
  {
   "name": "Kath Nash",
   "org": "APM",
   "role": "Digital Business Partner",
   "owns": "All instructions + comms; KB validation",
   "reports": "Michael Barker (assumed)"
  },
  {
   "name": "Ben Riches",
   "org": "APM",
   "role": "ES Lead",
   "owns": "Business owner: Job Seeker, ES (take-home), ES devices",
   "reports": "-"
  },
  {
   "name": "James Muller",
   "org": "APM",
   "role": "CEO Employment Services",
   "owns": "Executive sponsor",
   "reports": "-"
  },
  {
   "name": "Claire McArdle",
   "org": "APM",
   "role": "ES (Eskilled)",
   "owns": "ES Eskilled training content",
   "reports": "-"
  },
  {
   "name": "PDE owner",
   "org": "APM",
   "role": "To be nominated",
   "owns": "Developer platform owner (Dev service catalogue, image approval)",
   "reports": "Michael Barker (assumed)"
  },
  {
   "name": "Michael Webster",
   "org": "Twiki Corp",
   "role": "Architecture Lead (Azure, Cloud, Security)",
   "owns": "Solution architecture",
   "reports": "Samit Chandra"
  },
  {
   "name": "Shaun Struik",
   "org": "Twiki Corp",
   "role": "Solution Engineer AVD",
   "owns": "AVD build & delivery; KB authoring",
   "reports": "Murray Thomas"
  },
  {
   "name": "David Badger",
   "org": "Twiki Corp",
   "role": "Project Manager",
   "owns": "PM + device logistics / retrieval",
   "reports": "Murray Thomas"
  },
  {
   "name": "CompNow",
   "org": "External",
   "role": "Device partner",
   "owns": "Device wipe/prep/build/ship",
   "reports": "-"
  },
  {
   "name": "Nerdio",
   "org": "External",
   "role": "AVD orchestration platform",
   "owns": "Host pool management, autoscale, reimaging",
   "reports": "-"
  }
 ],
 "kb": [
  {
   "id": "KB-N1",
   "ws": "0 Network",
   "title": "APM-KIOSK site network build & site cutover",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Michael Court",
   "team": "Network",
   "status": "Not started"
  },
  {
   "id": "KB-N2",
   "ws": "0 Network",
   "title": "Azure hub-spoke reusable build pattern",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Michael Webster",
   "team": "Cloud / Azure",
   "status": "Not started"
  },
  {
   "id": "KB-J1",
   "ws": "1 Job Seeker",
   "title": "CompNow device wipe / prep / Autopilot / label / ship  ·  drafted: CN-JSK-01, CN-JSK-02",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "CompNow + Nick Dorbie",
   "team": "EUC / Vendor",
   "status": "Drafted"
  },
  {
   "id": "KB-J2",
   "ws": "1 Job Seeker",
   "title": "Kiosk password rotation runbook (Azure Automation)  ·  drafted: KB-JSK-03, KB-JSK-04",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Ugbaad Adani",
   "team": "Cyber",
   "status": "Drafted"
  },
  {
   "id": "KB-J3",
   "ws": "1 Job Seeker",
   "title": "Lock screen proactive remediation  ·  drafted: KB-JSK-09",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Nick Dorbie",
   "team": "EUC",
   "status": "Drafted"
  },
  {
   "id": "KB-J4",
   "ws": "1 Job Seeker",
   "title": "F3 account create / retire runbook  ·  drafted: KB-JSK-01",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Ugbaad Adani",
   "team": "Cyber",
   "status": "Drafted"
  },
  {
   "id": "KB-J5",
   "ws": "1 Job Seeker",
   "title": "Site VLAN to APM-KIOSK cutover (per site)",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Michael Court",
   "team": "Network",
   "status": "Not started"
  },
  {
   "id": "KB-J6",
   "ws": "1 Job Seeker",
   "title": "Kiosk device replacement / RMA  ·  drafted: KB-JSK-05, KB-JSK-06, KB-JSK-07, CN-JSK-03",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Rohit Singh",
   "team": "Service Desk",
   "status": "Drafted"
  },
  {
   "id": "KB-J7",
   "ws": "1 Job Seeker",
   "title": "Golden image build & patch (CLI-only, WDAC-hardened)  ·  drafted: WP-2.10 GoldenImage CLIOnly + ExecutionSheet, golden-image-build/*",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Nick Dorbie",
   "team": "EUC",
   "status": "Drafted"
  },
  {
   "id": "KB-J8",
   "ws": "1 Job Seeker",
   "title": "Nerdio scripted-action signing under WDAC + session-host App Control allowed signer  ·  drafted: nerdio-scripts-signing-wdac, cyber note 24 Jun",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Ugbaad Adani",
   "team": "Cyber",
   "status": "Drafted"
  },
  {
   "id": "KB-J9",
   "ws": "1 Job Seeker",
   "title": "Shell Launcher / Assigned Access kiosk shell + Windows App onboarding  ·  drafted: shell-launcher/*, windows-app-kiosk/*",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Rohit Singh",
   "team": "Service Desk",
   "status": "Drafted"
  },
  {
   "id": "KB-S1",
   "ws": "2 Standard User",
   "title": "Golden image build & monthly patch (Nerdio)",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Nick Dorbie",
   "team": "EUC",
   "status": "Not started"
  },
  {
   "id": "KB-S2",
   "ws": "2 Standard User",
   "title": "FSLogix profile lifecycle (create/snapshot/restore/deprovision)",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Nick Dorbie",
   "team": "EUC",
   "status": "Not started"
  },
  {
   "id": "KB-S3",
   "ws": "2 Standard User",
   "title": "CA BYOD vs corporate troubleshooting",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Ugbaad Adani",
   "team": "Cyber",
   "status": "Not started"
  },
  {
   "id": "KB-S4",
   "ws": "2 Standard User",
   "title": "Windows App onboarding (corporate + BYOD)",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Rohit Singh",
   "team": "Service Desk",
   "status": "Not started"
  },
  {
   "id": "KB-S5",
   "ws": "2 Standard User",
   "title": "Host pool scaling / capacity management",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Nick Dorbie",
   "team": "EUC",
   "status": "Not started"
  },
  {
   "id": "KB-E1",
   "ws": "3 ES",
   "title": "ES midnight reset operation",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Ben Riches",
   "team": "ES",
   "status": "Not started"
  },
  {
   "id": "KB-E2",
   "ws": "3 ES",
   "title": "ES off-site connectivity (any Wi-Fi) + filtering",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Rohit Singh",
   "team": "Service Desk",
   "status": "Not started"
  },
  {
   "id": "KB-E3",
   "ws": "3 ES",
   "title": "Eskilled access (ES)",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Claire McArdle",
   "team": "ES",
   "status": "Not started"
  },
  {
   "id": "KB-P1",
   "ws": "4 Privileged",
   "title": "Privileged Access request & approval (Priv zz / High-Priv xy)",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Ugbaad Adani",
   "team": "Cyber / Identity",
   "status": "Not started"
  },
  {
   "id": "KB-P2",
   "ws": "4 Privileged",
   "title": "PIM elevation per tier (production access)",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Ugbaad Adani",
   "team": "Cyber / Identity",
   "status": "Not started"
  },
  {
   "id": "KB-P3",
   "ws": "4 Privileged",
   "title": "YubiKey 5C NFC FIPS enrolment",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Ugbaad Adani",
   "team": "Cyber / Identity",
   "status": "Not started"
  },
  {
   "id": "KB-P4",
   "ws": "4 Privileged",
   "title": "Privileged image build & hardening",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Michael Webster",
   "team": "Cloud / Cyber",
   "status": "Not started"
  },
  {
   "id": "KB-D1",
   "ws": "5 Developer",
   "title": "AIB image pipeline + rollback",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "PDE owner (TBC)",
   "team": "Platform",
   "status": "Not started"
  },
  {
   "id": "KB-D2",
   "ws": "5 Developer",
   "title": "Dev self-service tooling (winget / Company Portal)",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "PDE owner (TBC)",
   "team": "Platform",
   "status": "Not started"
  },
  {
   "id": "KB-D3",
   "ws": "5 Developer",
   "title": "MCP server request / allowlist",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "PDE owner (TBC)",
   "team": "Platform",
   "status": "Not started"
  },
  {
   "id": "KB-D4",
   "ws": "5 Developer",
   "title": "OIDC deployment pipeline request",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "PDE owner (TBC)",
   "team": "Platform",
   "status": "Not started"
  },
  {
   "id": "KB-D5",
   "ws": "5 Developer",
   "title": "FSLogix profile recovery (Dev)",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "PDE owner (TBC)",
   "team": "Platform",
   "status": "Not started"
  },
  {
   "id": "KB-SD1",
   "ws": "7 KB & Enablement",
   "title": "Tier-1 Service Desk triage runbooks (all use cases)  ·  drafted: KB-JSK-02, KB-JSK-10",
   "built": "Shaun Struik",
   "v1": "Kath Nash",
   "v2": "Rohit Singh",
   "team": "Service Desk",
   "status": "Drafted"
  }
 ],
 "risks": [
  {
   "n": 1,
   "risk": "APM is running several tier-one projects in parallel. The AVD program's schedule depends on APM departments (Network, Cyber, EUC) and decision-makers completing their inputs on time. Contention for APM resources and approvals — not delivery capacity — is the primary risk to the 30 Sep dates.",
   "impact": "High",
   "like": "High",
   "owner": "Murray Thomas / Twiki",
   "mit": "Lock an APM owner and a due date for every dependency (network build, DR-010/011 decisions, pen-test window, PDE owner). Weekly dependency review with the Portfolio Manager; escalate any APM-side slippage immediately."
  },
  {
   "n": 2,
   "risk": "Network (site + Azure) is on the critical path from day one and is delivered by APM Network / Infrastructure. Any APM-side network slippage directly delays Job Seeker testing and the national rollout.",
   "impact": "High",
   "like": "Med",
   "owner": "Michael Court / Michael Webster",
   "mit": "Confirm APM Network resourcing now and hold a daily stand-up until the network is proven. Twiki supports the Azure foundation."
  },
  {
   "n": 3,
   "risk": "Privileged Access is a net-new design (PAW-style, two tiers zz/xy, YubiKey) added mid-window. It carries the production-access blast-radius risk.",
   "impact": "High",
   "like": "Med",
   "owner": "Shaun Struik / Ugbaad Adani (Cyber)",
   "mit": "Design once, gate hard on YubiKey. The Cyber lead (Ugbaad Adani) signs off the privileged model. Do not cut over high-priv until P6 (YubiKey validated) and P8 (CA/PIM) pass."
  },
  {
   "n": 4,
   "risk": "YubiKey 5C NFC FIPS now gates Privileged production access for zz/xy. If it fails, no phishing-resistant path to production from Macs.",
   "impact": "High",
   "like": "Med",
   "owner": "Shaun / Ugbaad Adani",
   "mit": "Run the YubiKey test early (week of 17 Aug). Fallback to a dedicated hardened Cloud PC for the highest tier if FIPS keys do not validate."
  },
  {
   "n": 5,
   "risk": "ES take-home (was CTA) breaks the site-VLAN / PSK / site-Zscaler controls Job Seeker relies on. It is a security redesign, now 3rd in order.",
   "impact": "High",
   "like": "High",
   "owner": "Shaun / Ugbaad Adani",
   "mit": "Treat ES as its own design (Zscaler client on device, revised CA, any Wi-Fi, midnight reset). Confirm Eskilled access path with Claire McArdle."
  },
  {
   "n": 6,
   "risk": "Developer is a separate permissive image (limited blocks, no production path). Production access lives only in the Privileged image.",
   "impact": "Med",
   "like": "Low",
   "owner": "Shaun / Samit Chandra",
   "mit": "Keep the boundary clean: no production scopes on the Dev pool. Samit Chandra signs off Dev requirements."
  },
  {
   "n": 7,
   "risk": "Standard User printing (DR-010) and mapped drive (DR-011) still pending. Both gate the SU build.",
   "impact": "Med",
   "like": "High",
   "owner": "Michael Barker / Nick Dorbie",
   "mit": "Force decisions by 24 Jul. Universal Print is the likely path. Confirm mapped-drive backend (SharePoint / Azure Files / on-prem)."
  },
  {
   "n": 8,
   "risk": "RESOLVED — Job Seeker device count confirmed at 540 (early drafts showed 517 vs 540).",
   "impact": "Low",
   "like": "Low",
   "owner": "Dave Badger / Nick Dorbie",
   "mit": "Done — 540 is the confirmed count, applied everywhere (licensing + site allocation)."
  },
  {
   "n": 9,
   "risk": "Nerdio assumed already deployed and operational. Standard User, ES and Developer all reuse it.",
   "impact": "High",
   "like": "Low",
   "owner": "Shaun / Michael Webster",
   "mit": "Confirm Nerdio is live in the tenant. If not, add a deployment task that gates the Job Seeker AVD build."
  },
  {
   "n": 10,
   "risk": "Developer PDE owner not yet named. Gates Dev pilot, image approval and the Dev service catalogue.",
   "impact": "Med",
   "like": "Med",
   "owner": "Murray Thomas / Michael Barker",
   "mit": "Nominate the APM PDE owner now so Dev pilot and KB validation have an APM stakeholder."
  },
  {
   "n": 11,
   "risk": "Contract ends 30 Sep with little buffer. The exposure is APM-side dependencies (network completion, security sign-off / pen-test scheduling, approvals) landing late — not delivery throughput.",
   "impact": "High",
   "like": "High",
   "owner": "Murray Thomas",
   "mit": "Confirm APM dependency dates now and agree what 'done by 30 Sep' means per use case (live, piloted, designed). Protect Privileged from descoping."
  },
  {
   "n": 12,
   "risk": "JOB SEEKER — Code-signing certificate (D-14) is the master gate. One fleet-trusted cert, added as a WDAC allowed signer (D-7), unblocks the entire device-side credential pipeline (token fetch, lock-screen render, LSA write) and Nerdio session-host script signing. Until it is issued, the credential pipeline cannot complete.",
   "impact": "High",
   "like": "High",
   "owner": "APM Cyber - Ugbaad Adani",
   "mit": "Issue the cert and add it as an allowed signer via a signed supplemental policy (signer rule, not hash/path). One cert closes the kiosk device-side scripts and the Nerdio session-host scripts together."
  },
  {
   "n": 13,
   "risk": "JOB SEEKER — Credential Proxy public ingress (D-3) is the single biggest unverified link. With no site→Azure private path today, remote kiosks can only reach the Function App via a hardened public ingress.",
   "impact": "High",
   "like": "Med",
   "owner": "APM Cyber - Ugbaad Adani / Twiki - Shaun Struik",
   "mit": "Confirm a hardened EasyAuth-protected public ingress (Entra-validated, returns only the calling device's secret). Migrate the pilot's per-device function-key build to EasyAuth+PRT (C-6)."
  },
  {
   "n": 14,
   "risk": "JOB SEEKER — Network design must be finalised + approved by APM before any networking or credential-pipeline deploys; the temporary public-endpoint workaround was rejected. The live build runs in the FVE (test), not prod.",
   "impact": "High",
   "like": "Med",
   "owner": "APM Network - Vijay Natakar / APM Cyber",
   "mit": "Lock an APM owner and date for the finalised network design. Add NSG Storage/MCR egress (D-5) so the Nerdio CSE host deploy stops failing (HTTP 403 / Device Guard 4551)."
  }
 ]
};
