// Export renamed from `checkAssignedAccess` to `checkKioskAssignedAccess` for this bundle, so it does not
// collide with the copy in the APM Design System project. Import it by the new name.
// Assigned Access consistency and schema-constraint checker.
// Two copies of the Participant Kiosk configuration exist by necessity: the canonical
// file, and the here-string inside the remediation (an Intune remediation is a single
// pasted script and cannot read a sibling file at runtime). They have already drifted
// apart once, silently, with different namespace prefixes on the same element. This
// checker is what stops that recurring.
//
// Usage in run_script:
//   const src = await readFile('designs/participant-device/config/check-assigned-access.js');
//   const { checkKioskAssignedAccess } = await import(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
//   const r = checkKioskAssignedAccess({ xml: await readFile(xmlPath), script: await readFile(ps1Path) });
//   if (!r.ok) throw new Error(r.failures.join('\n'));
//
// Every rule below traces to Microsoft Learn: the Assigned Access XSD, "Create an
// Assigned Access configuration file", "Assigned Access recommendations", or the
// AssignedAccess CSP reference.

const NS = {
  d:   'http://schemas.microsoft.com/AssignedAccess/2017/config',
  rs5: 'http://schemas.microsoft.com/AssignedAccess/201810/config',
  v3:  'http://schemas.microsoft.com/AssignedAccess/2020/config',
  v4:  'http://schemas.microsoft.com/AssignedAccess/2021/config',
  v5:  'http://schemas.microsoft.com/AssignedAccess/2022/config',
};

// Order is fixed by profile_t in the XSD. StartLayout and StartPins are alternatives
// on Windows 11; TaskbarLayout is schema-legal but unsupported in a restricted user
// experience, so it is treated as a failure here rather than a warning.
const ORDER = ['AllAppsList', 'rs5:FileExplorerNamespaceRestrictions', 'StartLayout', 'v5:StartPins', 'Taskbar', 'v5:TaskbarLayout'];

function parse(text, label, failures) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const err = doc.querySelector('parsererror');
  if (err) { failures.push(`${label}: not well-formed XML - ${err.textContent.slice(0, 160)}`); return null; }
  return doc;
}

function checkOne(doc, label, failures, warnings) {
  const g = (ns, n) => [...doc.getElementsByTagNameNS(ns, n)];
  const profiles = g(NS.d, 'Profile');
  if (profiles.length !== 1) failures.push(`${label}: expected 1 Profile, found ${profiles.length}`);
  const prof = profiles[0];
  if (!prof) return null;

  // guid_t
  const id = prof.getAttribute('Id') || '';
  if (!/^\{[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}\}$/.test(id))
    failures.push(`${label}: Profile Id "${id}" does not match the schema's guid_t pattern`);
  const dp = g(NS.d, 'DefaultProfile')[0];
  if (!dp) failures.push(`${label}: no DefaultProfile element`);
  else if (dp.getAttribute('Id') !== id) failures.push(`${label}: DefaultProfile Id "${dp.getAttribute('Id')}" does not match Profile Id "${id}"`);
  if (!prof.getAttribute('Name')) warnings.push(`${label}: Profile has no Name attribute. The CSP Status node reports profileId only, so a Name makes a failure legible`);

  // element order and membership
  const kids = [...prof.children].map(c => (c.namespaceURI === NS.d ? '' : c.prefix + ':') + c.localName);
  let last = -1;
  for (const k of kids) {
    const i = ORDER.indexOf(k);
    if (i < 0) { failures.push(`${label}: "${k}" is not a legal child of Profile`); continue; }
    if (i < last) failures.push(`${label}: "${k}" is out of schema order. Required order: ${ORDER.join(', ')}`);
    last = i;
  }
  if (!kids.includes('AllAppsList')) failures.push(`${label}: AllAppsList is mandatory for a restricted user experience`);
  if (!kids.includes('Taskbar')) failures.push(`${label}: Taskbar is mandatory (minOccurs=1 in profile_t)`);
  if (!kids.includes('v5:StartPins') && !kids.includes('StartLayout'))
    failures.push(`${label}: a restricted user experience profile must define the Start layout`);

  // Taskbar pinning is not supported in a restricted user experience
  if (g(NS.v5, 'TaskbarLayout').length || g(NS.d, 'TaskbarLayout').length)
    failures.push(`${label}: TaskbarLayout is present. Taskbar pinning is not supported in a restricted user experience; only ShowTaskbar is`);

  // an unprefixed element that only exists in an add-on namespace
  for (const n of ['StartPins', 'TaskbarLayout', 'FileExplorerNamespaceRestrictions', 'AllowedNamespace', 'AllowRemovableDrives', 'NoRestriction'])
    if (g(NS.d, n).length) failures.push(`${label}: <${n}> is in the default 2017 namespace, where it does not exist. It needs its version prefix`);

  // File Explorer restrictions
  const fen = g(NS.rs5, 'FileExplorerNamespaceRestrictions')[0];
  if (fen) {
    const an = g(NS.rs5, 'AllowedNamespace');
    const wrongNs = g(NS.v3, 'AllowedNamespace');
    if (wrongNs.length) failures.push(`${label}: AllowedNamespace is an rs5 (201810) element, not v3. Found ${wrongNs.length} in the v3 namespace`);
    if (an.length > 1) failures.push(`${label}: ${an.length} AllowedNamespace elements. The schema permits one (maxOccurs defaults to 1)`);
    for (const e of an) {
      const v = e.getAttribute('Name');
      if (v !== 'Downloads') failures.push(`${label}: AllowedNamespace Name="${v}" is not legal. The enumeration allowedFileExplorerNamespaceValues_t accepts only "Downloads"`);
    }
    if (g(NS.v3, 'NoRestriction').length && (an.length || g(NS.v3, 'AllowRemovableDrives').length))
      failures.push(`${label}: NoRestriction is mutually exclusive with AllowedNamespace and AllowRemovableDrives (xs:choice)`);
  }

  // apps
  const apps = g(NS.d, 'App');
  const paths = apps.map(a => a.getAttribute('DesktopAppPath')).filter(Boolean);
  const aumids = apps.map(a => a.getAttribute('AppUserModelId')).filter(Boolean);
  for (const a of apps) {
    if (a.getAttribute('DesktopAppPath') && a.getAttribute('AppUserModelId'))
      failures.push(`${label}: an App element sets both DesktopAppPath and AppUserModelId. They are mutually exclusive`);
  }
  const seen = new Set();
  for (const v of paths.concat(aumids)) {
    if (seen.has(v)) failures.push(`${label}: duplicate app "${v}". Violates the ForbidDupApps unique constraint`);
    seen.add(v);
  }
  const autoLaunch = apps.filter(a => a.getAttributeNS(NS.rs5, 'AutoLaunch') === 'true');
  if (autoLaunch.length > 1) failures.push(`${label}: ${autoLaunch.length} apps set rs5:AutoLaunch. Only one app can autolaunch`);
  // AppLocker's executable rule collection is .exe and .com. Assigned Access generates
  // AppLocker rules, so any other extension cannot be evaluated and cannot be helped by
  // being listed here. Dependency PEs with other extensions belong in the App Control policy.
  for (const v of paths)
    if (!/\.(exe|com)$/i.test(v)) failures.push(`${label}: "${v}" is not a .exe or .com. AppLocker's executable rule collection cannot evaluate it, so listing it here has no effect and risks rule generation failing`);
  if (paths.some(v => /\\explorer\.exe$/i.test(v)) === false && paths.length)
    warnings.push(`${label}: explorer.exe is not allowed, so File Explorer cannot be granted at all`);

  // account form
  const acct = g(NS.d, 'Account')[0];
  const grp = g(NS.d, 'UserGroup')[0], auto = g(NS.d, 'AutoLogonAccount')[0];
  if (!acct && !grp && !auto) failures.push(`${label}: Config has no Account, UserGroup or AutoLogonAccount`);
  if (acct) {
    const v = acct.textContent.trim();
    // documented local forms: devicename\user, .\user, or bare user
    const local = /^(\.\\)?[^\\]+$/.test(v) || /^[^\\]+\\[^\\]+$/.test(v);
    if (!local) failures.push(`${label}: Account "${v}" is not a documented form (devicename\\user, .\\user, user, domain\\samAccountName, or AzureAD\\UPN)`);
    const sam = v.replace(/^.*\\/, '');
    if (sam.length > 20) failures.push(`${label}: account name "${sam}" is ${sam.length} characters. The SAM account name limit is 20`);
    if (/[\\/:*?"<>|\[\]]/.test(sam) && !/\[SERIAL\]/.test(sam))
      failures.push(`${label}: account name "${sam}" contains a character not legal in a local account name`);
  }
  return { paths, aumids, order: kids, account: acct ? acct.textContent.trim() : null };
}

// The account-name derivation is duplicated across the detection, remediation and purge
// scripts, because each is a standalone pasted artefact that cannot share a helper. All
// three must agree exactly or the kiosk signs in as nobody.
const SERIAL_RE = /\(\(Get-CimInstance Win32_BIOS(?: -ErrorAction Stop)?\)\.SerialNumber -replace '\[\^A-Za-z0-9\]', ''\)\.ToUpperInvariant\(\)/;
const PREFIX_RE = /\$user = "Kiosk-\$serial"/;
// A SAM account name is 20 characters maximum. "Kiosk-" is 6, so the serial is capped at
// 14 BEFORE the name is built. Capping the assembled name instead is not equivalent: it
// hides the overflow rather than preventing it, and it silently produces the same name for
// two different long serials sharing a 14-character prefix.
const CAP_RE    = /if \(\$serial\.Length -gt 14\) \{ \$serial = \$serial\.Substring\(0, 14\) \}/;

// Cmdlet parameters with a hard length limit. New-LocalUser -Description throws above 48
// characters, and the failure is a validation error at run time that no XML or schema check
// can see. Found on a test machine, not in review.
const ARG_LIMITS = [
  { re: /-Description\s+'([^']*)'/g, max: 48, what: 'New-LocalUser -Description' },
  { re: /\$desc\s*=\s*'([^']*)'/g,   max: 48, what: 'New-LocalUser -Description (assigned to $desc)' },
  { re: /-FullName\s+'([^']*)'/g,    max: 256, what: 'New-LocalUser -FullName' },
  { re: /-Name\s+"(Kiosk-[^"]*)"/g,  max: 20, what: 'local account name' },
];

function checkDerivation(label, text, failures) {
  if (!SERIAL_RE.test(text)) failures.push(`${label}: BIOS serial derivation does not match the other scripts`);
  if (!PREFIX_RE.test(text)) failures.push(`${label}: account name prefix does not match the other scripts`);
  if (!CAP_RE.test(text))    failures.push(`${label}: missing or altered serial cap. The serial must be capped at 14 characters before the name is built, so "Kiosk-" plus the serial fits the 20-character SAM limit`);
  for (const { re, max, what } of ARG_LIMITS) {
    for (const m of text.matchAll(new RegExp(re.source, 'g')))
      if (m[1].length > max) failures.push(`${label}: ${what} is ${m[1].length} characters, limit ${max}. PowerShell throws a parameter validation error at run time - "${m[1].slice(0, 40)}..."`);
  }
}

// A policy blocker must be tested by its VALUES, never by the existence of its registry
// key. Windows pre-creates an area key under PolicyManager for nearly every policy area
// whether or not anything is configured, so Test-Path on the key is true on every device.
// Shipped twice: in the remediation it meant a permanent exit 1, which Intune reads as a
// remediation that fails forever, and in the detection script it meant permanently
// non-compliant. Both reported a blocker on devices that had none.
//
// The check follows variables. The shipped defect was written `Test-Path $dl`, so a guard
// matching only a literal HKLM path inside Test-Path misses the real thing - the same way
// an earlier guard matched only a literal -Description and missed `$desc`.
function checkPolicyBlockerLogic(label, text, failures) {
  const pmVars = new Set();
  for (const m of text.matchAll(/\$(\w+)\s*=\s*['"]HKLM:\\SOFTWARE\\Microsoft\\PolicyManager[^'"]*['"]/g)) pmVars.add(m[1]);
  for (const m of text.matchAll(/Test-Path\s+(\$(\w+)|['"]HKLM:\\SOFTWARE\\Microsoft\\PolicyManager[^'"]*['"])\s*\)\s*\{([^}]*)/g)) {
    const isPm = m[2] ? pmVars.has(m[2]) : true;
    if (isPm && /(exit 1|\$blockers\s*\+=|Write-Output)/.test(m[3]))
      failures.push(`${label}: a PolicyManager blocker is gated on Test-Path ${m[1]}, which tests the KEY. The key exists on every device whether or not the policy is configured, so this reports a blocker permanently - read the specific values instead`);
  }
  if (/DeviceLock/.test(text) && !/DevicePasswordEnabled/.test(text))
    failures.push(`${label}: DeviceLock is checked without reading DevicePasswordEnabled. That value is inverted (0 means a password IS required) and is the setting that actually disables automatic logon`);
}

export function checkKioskAssignedAccess({ xml, script, purge, detect }) {
  const failures = [], warnings = [], notes = [];

  const xdoc = parse(xml, 'canonical XML', failures);
  const xr = xdoc ? checkOne(xdoc, 'canonical XML', failures, warnings) : null;

  let sr = null;
  if (script) {
    const m = script.match(/\$aaXml = @"\r?\n([\s\S]*?)\r?\n"@/);
    if (!m) failures.push('remediation script: could not find the $aaXml here-string');
    else {
      const sub = m[1].replace(/\$profileId/g, '{4B1E9A0C-6D7F-4A31-9C52-8E0A73B5D411}').replace(/\$user/g, 'Kiosk-TESTSER1');
      const sdoc = parse(sub, 'script here-string', failures);
      if (sdoc) sr = checkOne(sdoc, 'script here-string', failures, warnings);
    }

    // Winlogon autologon rules, from "Assigned Access recommendations"
    if (/Set-ItemProperty[^\n]*-Name\s+DefaultDomainName/.test(script))
      failures.push('remediation script: DefaultDomainName is set. Microsoft states that for a local account this key must not be added');
    if (!/AutoAdminLogon/.test(script))
      failures.push('remediation script: AutoAdminLogon is never set, so the device will not sign itself in');
    if (/Set-ItemProperty[^\n]*-Name\s+DefaultPassword/.test(script))
      failures.push('remediation script: writes a cleartext DefaultPassword registry value');
    if (!/PasswordNeverExpires|AccountNeverExpires/.test(script))
      warnings.push('remediation script: the session account password can expire, which black-screens an autologon device');

    // the defect class that shipped: two statements collapsed onto one line
    script.split('\n').forEach((l, i) => {
      const code = l.replace(/#.*$/, '');
      if (/-(Type|Value|Name|Force)\s+[A-Za-z0-9_'"$]*(Set|Get|New|Remove|Add|Enable|Disable|Register|Write)-[A-Za-z]+/.test(code))
        failures.push(`remediation script line ${i + 1}: two statements on one line, missing a newline - ${l.trim().slice(0, 90)}`);
    });
  }

  // the three scripts that derive the account name must derive it identically
  const derivers = [['remediation script', script], ['detection script', detect], ['purge script', purge]].filter(d => d[1]);
  for (const [label, text] of derivers) checkDerivation(label, text, failures);
  if (derivers.length < 3) notes.push(`Account-name derivation checked in ${derivers.length} of 3 scripts. Pass detect and purge to check all three.`);

  // Every script that reads a policy blocker gets the same guards. Running these on the
  // remediation alone was itself the bug: the identical key-existence defect sat in the
  // detection script and passed clean.
  for (const [label, text] of [['remediation script', script], ['detection script', detect]].filter(d => d[1]))
    checkPolicyBlockerLogic(label, text, failures);

  // the purge script must reassert autologon, and must never invent a credential
  if (purge) {
    if (!/-Name DefaultUserName/.test(purge))
      failures.push('purge script: does not reassert DefaultUserName. An interactive console sign-in leaves the kiosk unable to sign itself in until the next remediation run');
    if (!/Get-LocalUser -Name \$user/.test(purge))
      failures.push('purge script: reasserts autologon without confirming the account exists, which can point autologon at a missing account');
    if (/LsaSecret|Set-LocalUser|New-LocalUser|-Password/.test(purge))
      failures.push('purge script: touches credentials. It runs at shutdown and must only reassert the account name');
    if (/Set-ItemProperty[^\n]*-Name\s+DefaultDomainName/.test(purge))
      failures.push('purge script: sets DefaultDomainName, which must not be set for a local account');
    if (!/exit 0/.test(purge))
      failures.push('purge script: must always exit 0 so it cannot block shutdown');
  }

  // drift between the two copies
  if (xr && sr) {
    if (JSON.stringify(xr.paths) !== JSON.stringify(sr.paths))
      failures.push('DRIFT: the allowed-app lists differ between the canonical XML and the script here-string');
    if (JSON.stringify(xr.aumids) !== JSON.stringify(sr.aumids))
      failures.push('DRIFT: the AUMID lists differ between the two copies');
    if (JSON.stringify(xr.order) !== JSON.stringify(sr.order))
      failures.push(`DRIFT: the Profile element structure differs. XML: ${xr.order.join(',')} | script: ${sr.order.join(',')}`);
    const strip = a => (a || '').replace(/Kiosk-[A-Za-z0-9\[\]]+/, 'Kiosk-*');
    if (strip(xr.account) !== strip(sr.account))
      failures.push(`DRIFT: the Account form differs. XML: ${xr.account} | script: ${sr.account}`);
    notes.push(`Both copies allow ${xr.paths.length} desktop apps and ${xr.aumids.length} packaged apps.`);
  }

  return { ok: failures.length === 0, failures, warnings, notes };
}
