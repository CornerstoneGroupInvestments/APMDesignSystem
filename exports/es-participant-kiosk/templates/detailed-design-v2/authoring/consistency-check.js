// Consistency scanner for a design in the DSL (content.txt) plus its figures (figures.html).
//
// Catches the defect class that qa-checks.js cannot see: statements that were true when
// written and went stale when another section changed. Every failure this finds is a
// sentence contradicting another sentence in the same document.
//
//   const src = await readFile('templates/detailed-design/authoring/consistency-check.js');
//   const { scan } = await import(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
//   const r = scan({ dsl, figuresHtml, figFiles });   // figuresHtml/figFiles optional
//   r.ok / r.findings / r.report
//
// Checks:
//   XREF   every "see 4.3.9" / "(7.3.4)" / "section 5.3.1" resolves to a real heading
//   TREE   top-level sections run 1..n with no gaps, and every heading has a parent heading
//   FIGSEQ FIG captions numbered 1..n in document order, no gaps or repeats
//   FIGREF every "Figure n" in prose points at a figure that exists
//   FIGFILE every FIG image file is present on disk
//   DUAL   a policy object classified under both an "inherited" and an "added/excluded" heading
//   ORPHAN a policy object / named artefact mentioned exactly once (usually a dangling reference)
//   COUNT  a stated count ("four items", "three exclusions") vs the rows of the table below it
//   FIGTXT section numbers and stale terms inside figure captions and notes
//   STALE  terms the design has retired but that still appear somewhere

const NUMWORDS = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12 };
const COUNT_NOUNS = /(items?|policies|policy|controls?|exclusions?|gates?|layers?|phases?|rings?|scenarios?|tiers?|steps?)/i;

function parse(dsl) {
  const lines = dsl.split('\n');
  const headings = [];       // {num, text, line}
  const figs = [];           // {file, caption, line}
  const tables = [];         // {line, rows, headerRow}
  const blocks = [];         // {kind, text, line, section}
  let cur = null, curHeading = null;
  lines.forEach((raw, i) => {
    const m = raw.match(/^(H[1-5]|P|B|NUM|TBL|TH|TR|END|FIG)\s*\|(.*)$/);
    if (!m) return;
    const [, tag, body] = m;
    const text = body.replace(/==/g, '').replace(/\*\*/g, '');
    if (/^H[1-5]$/.test(tag)) {
      const hm = text.match(/^([\d.]+)\s+(.*)$/);
      curHeading = hm ? hm[1].replace(/\.$/, '') : null;
      if (hm) headings.push({ num: curHeading, text: hm[2], line: i + 1 });
      // heading text is pushed WITHOUT its number, so "7.3.4 Controls..." cannot be read as a count
      blocks.push({ kind: 'H', text: hm ? hm[2] : text, line: i + 1, section: curHeading });
      cur = null;
      return;
    }
    if (tag === 'TBL') { cur = { line: i + 1, rows: 0, header: '', section: curHeading }; tables.push(cur); return; }
    if (tag === 'TH') { if (cur) cur.header = text; blocks.push({ kind: 'TH', text, line: i + 1, section: curHeading }); return; }
    // table rows carry most of a design's content - they must be scanned, not just counted
    if (tag === 'TR') { if (cur) cur.rows++; blocks.push({ kind: 'TR', text, line: i + 1, section: curHeading }); return; }
    if (tag === 'END') { cur = null; return; }
    if (tag === 'FIG') {
      const p = body.split('|');
      figs.push({ file: p[0], caption: (p[1] || '').replace(/==/g, ''), line: i + 1, section: curHeading });
      blocks.push({ kind: 'FIG', text: p[1] || '', line: i + 1, section: curHeading });
      return;
    }
    blocks.push({ kind: tag, text, line: i + 1, section: curHeading });
  });
  return { lines, headings, figs, tables, blocks };
}

// Section references, written the handful of ways this house style writes them.
function xrefs(text) {
  const out = [];
  const re = /(?:\bsee\s+|\bin\s+|\bper\s+|\bto\s+|\bsection\s+|\()(\d{1,2}(?:\.\d{1,2}){1,3})(?=[)\s,.;:]|$)/gi;
  let m;
  while ((m = re.exec(text))) {
    const n = m[1];
    const before = text.slice(Math.max(0, m.index - 3), m.index);
    if (/[VvP]-?$/.test(before)) continue;           // P-1.0, V1.6
    if (/\d\/$/.test(before)) continue;              // CIDR
    if (+n.split('.')[0] > 12) continue;
    out.push(n);
  }
  return out;
}

const NAMED = /\b(?:APM|CA|CMP|SG)[A-Za-z0-9]*(?:-[A-Za-z0-9.]+){1,6}\b/g;
// English hyphenations that look like artefact names but are not
const NOT_A_NAME = /^(APM|CA|SG|CMP)-(branded|controlled|managed|licensed|licenced|wide|approved|owned|issued|side|facing|internal|specific|joined)$/i;
// only these shapes are controls that can be classified; SG- groups are assignment TARGETS,
// which legitimately appear under both inherited and excluded policies
const CLASSIFIABLE = /^(?:APM-[A-Za-z0-9]+-SEC|APM-W11|APM-WIN|APM-Kiosk-SEC|CA-|CMP-)/;

function scan({ dsl, figuresHtml, figFiles, staleTerms = [], ignoreOrphans = [] }) {
  const { lines, headings, figs, tables, blocks } = parse(dsl);
  const findings = [];
  const add = (code, line, msg) => findings.push({ code, line, msg });
  const headingNums = new Set(headings.map(h => h.num));
  // a reference to "7.3" is satisfied by 7.3 or by any 7.3.x existing
  const resolves = n => headingNums.has(n) || [...headingNums].some(h => h.startsWith(n + '.'));

  // TREE: a whole section going missing is the defect an edit is most likely to cause,
  // because the deletion leaves no trace in the text - only a gap in the numbering.
  const tops = [...new Set(headings.map(h => +h.num.split('.')[0]))].sort((a, b) => a - b);
  for (let n = 1; n <= (tops[tops.length - 1] || 0); n++) {
    if (!tops.includes(n)) add('TREE', 0, `no section ${n} heading exists, but section ${n + 1} or later does - a top-level heading has been lost`);
    else if (!headingNums.has(String(n))) add('TREE', 0, `section ${n} has subsections but no H1 of its own (numbering will jump in the Contents)`);
  }
  for (const h of headings) {
    const parts = h.num.split('.');
    if (parts.length < 2) continue;
    const parent = parts.slice(0, -1).join('.');
    if (!headingNums.has(parent)) add('TREE', h.line, `${h.num} "${h.text}" has no parent heading ${parent}`);
  }

  // XREF
  for (const b of blocks) {
    for (const n of xrefs(b.text)) {
      if (!resolves(n)) add('XREF', b.line, `reference to section ${n}, which does not exist`);
    }
  }

  // FIGSEQ + FIGFILE
  figs.forEach((f, i) => {
    const m = f.caption.match(/^Figure\s+(\d+)\./);
    if (!m) add('FIGSEQ', f.line, `caption does not start "Figure n.": "${f.caption.slice(0, 60)}"`);
    else if (+m[1] !== i + 1) add('FIGSEQ', f.line, `caption says Figure ${m[1]} but it is figure ${i + 1} in document order`);
    if (figFiles && !figFiles.includes(f.file)) add('FIGFILE', f.line, `image ${f.file} not found in the figs folder`);
  });

  // FIGREF
  for (const b of blocks) {
    if (b.kind === 'FIG') continue;
    for (const m of b.text.matchAll(/\bFigure\s+(\d+)\b/g)) {
      if (+m[1] > figs.length) add('FIGREF', b.line, `prose cites Figure ${m[1]} but the design has ${figs.length} figures`);
    }
  }

  // DUAL + ORPHAN
  const seen = new Map();  // name -> [{line, section, text}]
  for (const b of blocks) {
    for (const m of (b.text.match(NAMED) || [])) {
      const name = m.replace(/[.,;:]$/, '');
      if (NOT_A_NAME.test(name)) continue;
      if (!seen.has(name)) seen.set(name, []);
      seen.get(name).push({ line: b.line, section: b.section, text: b.text });
    }
  }
  const headingText = new Map(headings.map(h => [h.num, h.text]));
  const classOf = sec => {
    const t = (headingText.get(sec) || '').toLowerCase();
    if (/inherit/.test(t)) return 'inherited';
    if (/(add|beyond|exclu|compensat)/.test(t)) return 'added-or-excluded';
    return null;
  };
  for (const [name, hits] of seen) {
    const classes = new Set(hits.map(h => classOf(h.section)).filter(Boolean));
    if (CLASSIFIABLE.test(name) && classes.has('inherited') && classes.has('added-or-excluded')) {
      // partial inheritance is legitimate when the inherited row cross-references the
      // section that carves the exception out, e.g. "...the removable-drive control is
      // excluded (see 7.3.3)". Only an UNRECONCILED dual classification is a defect.
      const excludedSections = hits.filter(h => classOf(h.section) === 'added-or-excluded').map(h => h.section);
      const reconciled = hits.some(h => classOf(h.section) === 'inherited'
        && xrefs(h.text).some(n => excludedSections.includes(n)));
      if (!reconciled) {
        const where = [...new Set(hits.map(h => h.section))].join(', ');
        add('DUAL', hits[0].line, `${name} is classified as both inherited and added/excluded with no cross-reference reconciling them (sections ${where})`);
      }
    }
    if (hits.length === 1 && !ignoreOrphans.includes(name) && /-/.test(name) && name.length > 8) {
      add('ORPHAN', hits[0].line, `${name} is mentioned once only - check it is not a dangling reference`);
    }
  }

  // COUNT: a stated count in the paragraph immediately before a table
  for (const t of tables) {
    // field/value tables describe ONE thing across many rows, so row count is not an item count
    if (/^\**(field|setting|element|aspect|item|control area|ref)\b/i.test(t.header)) continue;
    const lead = [...blocks].reverse().find(b => b.line < t.line && (b.kind === 'P' || b.kind === 'H'));
    if (!lead || t.line - lead.line > 3) continue;
    for (const m of lead.text.matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d{1,2})\s+(\w+)/gi)) {
      if (!COUNT_NOUNS.test(m[2])) continue;
      const stated = NUMWORDS[m[1].toLowerCase()] ?? +m[1];
      if (stated !== t.rows) {
        add('COUNT', t.line, `lead-in says "${m[1]} ${m[2]}" but the table below has ${t.rows} rows (line ${lead.line})`);
      }
    }
  }

  // FIGTXT: figure captions and notes inside figures.html
  if (figuresHtml) {
    const figText = [...figuresHtml.matchAll(/<(?:p class="dgm-note"|div class="dgm-cap")[^>]*>([\s\S]*?)<\/(?:p|div)>/g)]
      .map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/&sect;/g, '').replace(/&middot;/g, ' ').replace(/&amp;/g, '&'));
    for (const t of figText) {
      for (const n of xrefs(t)) {
        if (!resolves(n)) add('FIGTXT', 0, `figure text references section ${n}, which does not exist: "${t.trim().slice(0, 70)}"`);
      }
      for (const term of staleTerms) {
        if (new RegExp(term, 'i').test(t)) add('FIGTXT', 0, `figure text contains retired term "${term}": "${t.trim().slice(0, 70)}"`);
      }
    }
  }

  // STALE
  for (const term of staleTerms) {
    const re = new RegExp(term, 'i');
    lines.forEach((l, i) => { if (re.test(l)) add('STALE', i + 1, `retired term "${term}" still present: "${l.slice(0, 90)}"`); });
  }

  const byCode = {};
  for (const f of findings) (byCode[f.code] = byCode[f.code] || []).push(f);
  const order = ['XREF', 'TREE', 'FIGSEQ', 'FIGREF', 'FIGFILE', 'DUAL', 'COUNT', 'FIGTXT', 'STALE', 'ORPHAN'];
  const report = order.filter(c => byCode[c]).map(c =>
    `${c} (${byCode[c].length})\n` + byCode[c].map(f => `  line ${f.line}: ${f.msg}`).join('\n')).join('\n\n');
  return {
    ok: findings.filter(f => f.code !== 'ORPHAN').length === 0,
    counts: { headings: headings.length, figures: figs.length, tables: tables.length },
    byCode, findings, report: report || 'no findings'
  };
}

export { scan, parse };
