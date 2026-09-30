// Compliance check engine. Pure functions - usable in the browser or in run_script.
//
//   const r = window.checkCompliance(documentText, window.COMPLIANCE_RULES, {name:'Some_Design.docx'});
//   r.summary  -> { conflict, gap, compensated, met, na, score }
//   r.findings -> [{rule, verdict, evidence, compensating, remedy, ...}]
//
// Verdicts:
//   conflict     the document says something the policy forbids, with no compensating language
//   compensated  it conflicts, but the document already argues the compensating controls the policy accepts
//   gap          the rule is in scope but the document is silent on what the policy requires
//   met          in scope and the document states what the policy requires
//   na           the rule is not in scope for this document
(function () {
  const UNIT_DAYS = { day: 1, days: 1, week: 7, weeks: 7, month: 30, months: 30, year: 365, years: 365, annual: 365, annually: 365 };
  const NUMWORD = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12, fourteen:14 };

  const norm = t => String(t).replace(/\r/g, '').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[ \t]+/g, ' ');

  // pull a readable sentence around a match so a finding can be evidenced
  function snippet(text, index, len) {
    const from = Math.max(0, text.lastIndexOf('.', index - 1) + 1);
    let to = text.indexOf('.', index + (len || 0));
    if (to < 0 || to - from > 420) to = Math.min(text.length, index + 240);
    return text.slice(from, to + 1).trim().replace(/\s+/g, ' ').slice(0, 400);
  }

  function findAll(text, re) {
    const out = [], r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m; while ((m = r.exec(text))) { out.push({ i: m.index, s: m[0], m }); if (out.length > 40) break; }
    return out;
  }

  // numeric tests: find "12 months", "60 days", "900 seconds" near a keyword.
  // Character-count rules go to charCountTest instead, because proximity is not good
  // enough for them - a site code and a passphrase both count characters, so the
  // credential noun must be ADJACENT to the number, not merely in the same window.
  function numericTest(text, rule) {
    const t = rule.test, hits = [];
    if (t.minChars != null) return charCountTest(text, t);
    const re = /(\b\d{1,5}|\bone|\btwo|\bthree|\bfour|\bfive|\bsix|\bseven|\beight|\bnine|\bten|\beleven|\btwelve|\bfourteen)[\s-]*(day|days|week|weeks|month|months|year|years|second|seconds|hour|hours|minute|minutes)\b/gi;
    let m;
    while ((m = re.exec(text))) {
      const around = text.slice(Math.max(0, m.index - 160), m.index + 160);
      if (t.near && !t.near.test(around)) continue;
      const nRaw = m[1].toLowerCase();
      const n = NUMWORD[nRaw] != null ? NUMWORD[nRaw] : parseInt(nRaw, 10);
      const unit = m[2].toLowerCase();
      if (t.maxDays != null && UNIT_DAYS[unit]) {
        const days = n * UNIT_DAYS[unit];
        if (days > t.maxDays) hits.push({ i: m.index, s: m[0], detail: `${m[0]} = ${days} days, policy maximum ${t.maxDays} days` });
      }
      if (t.maxSeconds != null) {
        const secs = /second/.test(unit) ? n : /minute/.test(unit) ? n * 60 : /hour/.test(unit) ? n * 3600 : null;
        if (secs != null && secs > t.maxSeconds) hits.push({ i: m.index, s: m[0], detail: `${m[0]} = ${secs}s, policy maximum ${t.maxSeconds}s` });
      }
      if (hits.length > 8) break;
    }
    return hits;
  }

  // A character count only means a credential length when the credential noun sits
  // immediately either side of it. "4-character site code" and "up to 7 characters" in a
  // device-naming table are not password policy, however close they happen to sit to the
  // word "passphrase". A negative guard drops anything in naming context.
  const NAMING = /site code|service tag|hostname|host name|device name|naming convention|serial|asset tag|\bupn format\b/i;
  const NUMPAT = '(\\d{1,3}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fourteen)';
  const APPROX = '(?:~|approximately\\s*|about\\s*|around\\s*|circa\\s*)?';
  const NOUN = '(passphrase|password|credential)';
  function charCountTest(text, t) {
    const hits = [], seen = new Set();
    const pats = [
      new RegExp(NOUN + '[^.]{0,60}?' + APPROX + NUMPAT + '\\s*characters?', 'gi'),
      new RegExp(APPROX + NUMPAT + '\\s*characters?[^.]{0,60}?' + NOUN, 'gi')
    ];
    for (const re of pats) {
      let m;
      while ((m = re.exec(text))) {
        const whole = m[0];
        const numTok = (whole.match(new RegExp(NUMPAT + '\\s*characters?', 'i')) || [])[1];
        if (numTok == null) continue;
        const nl = String(numTok).toLowerCase();
        const n = NUMWORD[nl] != null ? NUMWORD[nl] : parseInt(nl, 10);
        if (!isFinite(n)) continue;
        const around = text.slice(Math.max(0, m.index - 90), m.index + whole.length + 90);
        if (NAMING.test(around)) continue;
        if (t.notNear && t.notNear.test(around)) continue;
        const approx = /~|approximately|about|around|circa/i.test(whole);
        let detail = null;
        if (n < t.minChars) detail = `"${whole.trim()}" - ${n} characters, policy minimum ${t.minChars}`;
        else if (approx) detail = `"${whole.trim()}" - an approximate length does not evidence the ${t.minChars}-character minimum`;
        if (!detail) continue;
        const key = m.index + '|' + n;
        if (seen.has(key)) continue;
        seen.add(key);
        hits.push({ i: m.index, s: whole, detail });
        if (hits.length > 8) break;
      }
    }
    return hits;
  }

  function checkCompliance(rawText, rules, opts) {
    opts = opts || {};
    const text = norm(rawText);
    const findings = [];

    for (const rule of rules) {
      const inScope = rule.scope ? rule.scope.test(text) : true;
      if (!inScope) { findings.push({ rule, verdict: 'na', evidence: [], compensating: [] }); continue; }

      const comp = (rule.compensating || []).map(c => {
        const re = new RegExp(c, 'i'); const m = re.exec(text);
        return m ? { pattern: c, quote: snippet(text, m.index, m[0].length) } : null;
      }).filter(Boolean);

      let verdict = 'met', evidence = [];
      const t = rule.test || {};

      if (t.kind === 'numeric') {
        const hits = numericTest(text, rule);
        if (hits.length) { verdict = 'conflict'; evidence = hits.map(h => ({ quote: snippet(text, h.i, h.s.length), detail: h.detail })); }
      } else if (t.kind === 'mustNotSay') {
        let hits = findAll(text, t.pattern);
        // a guard makes the match count only when the surrounding window is genuinely about
        // the subject - stops "DES" in a program name or "*.office.com" in a URL allow-list
        // being read as a deprecated cipher or a wildcard certificate
        if (t.guard) hits = hits.filter(h => t.guard.test(text.slice(Math.max(0, h.i - (t.window || 200)), h.i + (t.window || 200))));
        if (hits.length) { verdict = 'conflict'; evidence = hits.slice(0, 4).map(h => ({ quote: snippet(text, h.i, h.s.length), detail: `matched "${h.s}"` })); }
      } else if (t.kind === 'mustState') {
        const hits = findAll(text, t.pattern);
        if (!hits.length) verdict = 'gap';
        else evidence = hits.slice(0, 3).map(h => ({ quote: snippet(text, h.i, h.s.length), detail: `states "${h.s}"` }));
      } else if (t.kind === 'pairing') {
        const a = findAll(text, t.a), b = findAll(text, t.b);
        if (a.length && !b.length) { verdict = 'gap'; evidence = a.slice(0, 2).map(h => ({ quote: snippet(text, h.i, h.s.length), detail: 'required companion statement not found' })); }
        else if (b.length) evidence = b.slice(0, 2).map(h => ({ quote: snippet(text, h.i, h.s.length), detail: `states "${h.s}"` }));
      }

      if (verdict === 'conflict' && comp.length) verdict = 'compensated';
      findings.push({ rule, verdict, evidence, compensating: comp });
    }

    const c = v => findings.filter(f => f.verdict === v).length;
    const assessed = findings.length - c('na');
    const summary = {
      conflict: c('conflict'), compensated: c('compensated'), gap: c('gap'),
      met: c('met'), na: c('na'), assessed,
      score: assessed ? Math.round(((c('met') + c('compensated')) / assessed) * 100) : 0
    };
    const result = { doc: opts.name || 'document', when: new Date().toISOString().slice(0, 10), summary, findings };
    if (opts.env) result.interactions = checkInteractions(text, opts.env);
    return result;
  }

  // Environment interactions - advisory, never scored. An entry fires when the design
  // touches configuration that exists in the environment: the finding says what exists,
  // why it matters here, and what to adjust or exclude.
  // An entry may carry `appliesWhen: {any: [/re/, ...], min: n}` - a scope gate requiring
  // at least n distinct signals before ANY of its interactions are evaluated. Without it,
  // an Azure platform register fires on an endpoint design that merely says "Sentinel".
  function checkInteractions(rawText, envItems) {
    const text = norm(rawText);
    const out = [];
    for (const env of envItems || []) {
      if (env.appliesWhen) {
        const signals = (env.appliesWhen.any || []).filter(re => re.test(text)).length;
        if (signals < (env.appliesWhen.min || 1)) continue;
      }
      for (const ix of env.interactions || []) {
        let hits = findAll(text, ix.trigger);
        if (ix.guard) hits = hits.filter(h => ix.guard.test(text.slice(Math.max(0, h.i - (ix.window || 200)), h.i + (ix.window || 200))));
        if (!hits.length) continue;
        out.push({ envId: env.id, envName: env.name, source: env.source, id: ix.id, title: ix.title, note: ix.note, remedy: ix.remedy,
          evidence: hits.slice(0, 2).map(h => ({ quote: snippet(text, h.i, h.s.length), detail: `touches "${h.s}"` })) });
      }
    }
    return out;
  }

  const ORDER = { conflict: 0, gap: 1, compensated: 2, met: 3, na: 4 };
  function sortFindings(findings) { return [...findings].sort((a, b) => ORDER[a.verdict] - ORDER[b.verdict] || a.rule.id.localeCompare(b.rule.id)); }

  // plain-text report, for run_script use and for pasting into a status update
  function reportText(r) {
    const L = [];
    L.push(`APM compliance check - ${r.doc}`);
    L.push(`Run ${r.when} against ${r.findings.length} rules from the APM policy register`);
    L.push('');
    L.push(`Conflicts ${r.summary.conflict} | Compensated ${r.summary.compensated} | Gaps ${r.summary.gap} | Met ${r.summary.met} | Not applicable ${r.summary.na}`);
    L.push(`Alignment score ${r.summary.score}% of ${r.summary.assessed} applicable rules`);
    for (const v of ['conflict', 'gap', 'compensated', 'met']) {
      const set = sortFindings(r.findings).filter(f => f.verdict === v);
      if (!set.length) continue;
      L.push(''); L.push(`== ${v.toUpperCase()} (${set.length}) ==`);
      for (const f of set) {
        L.push('');
        L.push(`[${f.rule.id}] ${f.rule.title}`);
        L.push(`  Policy: ${f.rule.doc}, ${f.rule.clause}`);
        L.push(`  Requires: ${f.rule.requires}`);
        if (f.evidence.length) f.evidence.forEach(e => L.push(`  Found: ${e.detail} - "${e.quote}"`));
        if (f.compensating.length) L.push(`  Compensating controls present: ${f.compensating.map(x => x.pattern).join('; ')}`);
        if (v !== 'met') L.push(`  To comply: ${f.rule.remedy}`);
      }
    }
    if (r.interactions && r.interactions.length) {
      L.push(''); L.push(`== ENVIRONMENT INTERACTIONS (${r.interactions.length}) - advisory, not scored ==`);
      for (const x of r.interactions) {
        L.push('');
        L.push(`[${x.id}] ${x.title}`);
        L.push(`  Environment: ${x.envName} (${x.source})`);
        L.push(`  What exists: ${x.note}`);
        if (x.evidence.length) L.push(`  Where the design touches it: ${x.evidence[0].detail} - "${x.evidence[0].quote}"`);
        L.push(`  Check: ${x.remedy}`);
      }
    }
    return L.join('\n');
  }

  const api = { checkCompliance, checkInteractions, sortFindings, reportText };
  if (typeof window !== 'undefined') Object.assign(window, api);
  if (typeof module !== 'undefined') module.exports = api;
})();
