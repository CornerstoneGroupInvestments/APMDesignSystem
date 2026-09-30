// Converts an authored .docx into the APM content DSL (see README.md).
// Usage in run_script:
//   const src = await readFile('templates/detailed-design/authoring/docx-to-dsl.js');
//   const { unzipDocx, docxToDsl } = await import(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
//   const parts = await unzipDocx(await readFileBinary('uploads/Some.docx'));
//   const r = docxToDsl(parts);   // { dsl, images, warnings, cover }
//
// Preserves: heading levels (auto-numbered 1 / 1.1 / 1.1.1 / 1.1.1.1), bold (**),
// yellow highlight (==), bullets/numbered lists, tables incl. gridSpan and
// multi-paragraph cells (<br>), inline images (FIG lines).

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

export async function unzipDocx(blob) {
  const buf = new Uint8Array(await blob.arrayBuffer()); const dv = new DataView(buf.buffer);
  let e = -1; for (let i = buf.length - 22; i >= 0; i--) { if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; } }
  if (e < 0) throw new Error('not a zip');
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const out = {};
  for (let i = 0; i < n; i++) {
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
    const lho = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + nl));
    const lnl = dv.getUint16(lho + 26, true), lel = dv.getUint16(lho + 28, true);
    const s = lho + 30 + lnl + lel; const d = buf.subarray(s, s + csize);
    out[name] = method === 0 ? d : new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    p += 46 + nl + el + cl;
  }
  return out;
}

// Australian-English / house-style clean-up applied to every string of copy.
export function sanitise(s) {
  return s
    .replace(/\u00a0/g, ' ')
    .replace(/\s*\u2014\s*/g, ' - ')          // em dash is banned house-wide
    .replace(/(\s)\u2013(\s)/g, '$1-$2')      // spaced en dash reads as a dash, not a range
    .replace(/\u2011/g, '-')
    .replace(/[\u200b\u200e\u200f]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/,\s*,/g, ',')
    .trim();
}

const escMarkers = s => s.replace(/==/g, '= =').replace(/\*\*/g, '* *');

export function docxToDsl(parts, opts = {}) {
  const td = new TextDecoder();
  const dom = x => new DOMParser().parseFromString(x, 'application/xml');
  const docXml = td.decode(parts['word/document.xml']);
  const doc = dom(docXml);
  const perr = doc.querySelector('parsererror'); if (perr) throw new Error(perr.textContent.slice(0, 200));
  const body = doc.getElementsByTagNameNS(W, 'body')[0];
  const warnings = [];

  // numId -> [numFmt per level]
  const numFmt = {};
  if (parts['word/numbering.xml']) {
    const nd = dom(td.decode(parts['word/numbering.xml'])); const abs = {};
    for (const a of nd.getElementsByTagNameNS(W, 'abstractNum'))
      abs[a.getAttribute('w:abstractNumId')] = [...a.getElementsByTagNameNS(W, 'lvl')].map(l => {
        const f = l.getElementsByTagNameNS(W, 'numFmt')[0]; return f ? f.getAttribute('w:val') : 'bullet';
      });
    for (const nn of nd.getElementsByTagNameNS(W, 'num')) {
      const a = nn.getElementsByTagNameNS(W, 'abstractNumId')[0];
      numFmt[nn.getAttribute('w:numId')] = abs[a && a.getAttribute('w:val')] || [];
    }
  }
  // rId -> media target
  const relMap = {};
  if (parts['word/_rels/document.xml.rels'])
    for (const m of td.decode(parts['word/_rels/document.xml.rels']).matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g))
      relMap[m[1]] = m[2];

  const first = (el, n) => el.getElementsByTagNameNS(W, n)[0];
  const kids = el => [...el.children];

  // --- inline runs -> marked-up text -------------------------------------
  function inline(node, forCell) {
    const segs = [];
    (function walk(el) {
      for (const c of kids(el)) {
        const ln = c.localName;
        if (ln === 'r') {
          const rPr = first(c, 'rPr');
          let b = false, hl = false;
          if (rPr) {
            const bEl = [...rPr.children].find(x => x.localName === 'b');
            b = !!bEl && bEl.getAttribute('w:val') !== '0' && bEl.getAttribute('w:val') !== 'false';
            const h = [...rPr.children].find(x => x.localName === 'highlight');
            hl = !!h && h.getAttribute('w:val') === 'yellow';
          }
          let t = '';
          for (const x of kids(c)) {
            if (x.localName === 't') t += x.textContent;
            else if (x.localName === 'tab') t += ' ';
            else if (x.localName === 'br') t += forCell ? '<br>' : ' ';
            else if (x.localName === 'noBreakHyphen') t += '-';
            else if (x.localName === 'drawing' || x.localName === 'pict') t += '';
          }
          if (t) segs.push({ t, b, hl });
        } else if (ln === 'hyperlink' || ln === 'smartTag' || ln === 'ins' || ln === 'sdt' || ln === 'sdtContent') walk(c);
      }
    })(node);
    // merge adjacent identical formatting, then emit balanced markers
    let out = '', prev = null, buf = '';
    const flush = () => {
      if (!buf) return;
      let s = escMarkers(buf);
      if (prev.b) s = '**' + s.replace(/^(\s*)/, '$1').trimEnd() + '**' + (/\s$/.test(buf) ? ' ' : '');
      if (prev.hl) s = '==' + s + '==';
      out += s; buf = '';
    };
    for (const s of segs) {
      if (prev && s.b === prev.b && s.hl === prev.hl) { buf += s.t; continue; }
      flush(); prev = s; buf = s.t;
    }
    flush();
    return sanitise(out).replace(/\*\* +\*\*/g, ' ').replace(/== *==/g, '');
  }

  // --- heading numbering -------------------------------------------------
  const ctr = [0, 0, 0, 0, 0];
  function headingNo(lvl) {
    ctr[lvl - 1]++; for (let i = lvl; i < 5; i++) ctr[i] = 0;
    return ctr.slice(0, lvl).join('.') + (lvl === 1 ? '.' : '');
  }

  const SKIP = new Set(['Title', 'Subtitle', 'TOCHeading', 'Heading1-NotLinked', 'Heading2-NotLinked', 'PulloutBoxHeading', 'SWtablehead', 'SWtabletext', 'TableofFigures']);
  const isSkip = st => SKIP.has(st) || /^TOC\d$/.test(st);

  // cover metadata from the pre-body region
  const cover = { fields: {}, versionRows: [] };
  const cellText = tc => kids(tc).filter(x => x.localName === 'p').map(pp => inline(pp, false)).filter(Boolean).join(' ');
  const allKids = kids(body);
  let start = allKids.findIndex(k => {
    if (k.localName !== 'p') return false; const ps = first(k, 'pStyle');
    return ps && ps.getAttribute('w:val') === 'Heading1';
  });
  if (start < 0) { start = 0; warnings.push('no Heading1 found; converting from the top'); }
  for (let i = 0; i < start; i++) {
    const k = allKids[i]; if (k.localName !== 'tbl') continue;
    const rows = [...k.getElementsByTagNameNS(W, 'tr')].map(r => [...r.getElementsByTagNameNS(W, 'tc')].map(cellText));
    if (rows.some(r => r.length === 2 && /^Project Name:/.test(r[0]))) for (const r of rows) if (r[0]) cover.fields[r[0]] = r[1];
    if (rows[0] && /Version/i.test(rows[0][0]) && /Author/i.test(rows[0][2] || ''))
      for (const r of rows.slice(1)) if (r.some(c => c)) cover.versionRows.push(r.map(c => c.replace(/<br>/g, ' ')));
  }

  // --- body --------------------------------------------------------------
  const lines = []; const images = []; let figNo = 0; let lastHeading = '';
  const push = l => lines.push(l);

  function figLines(p) {
    for (const dr of p.getElementsByTagNameNS(W, 'drawing')) {
      const ext = dr.getElementsByTagName('wp:extent')[0];
      const cx = ext ? +ext.getAttribute('cx') : 5750000, cy = ext ? +ext.getAttribute('cy') : 3500000;
      const blip = dr.getElementsByTagName('a:blip')[0];
      const rid = blip && blip.getAttribute('r:embed');
      const target = relMap[rid] || '';
      const file = (opts.figNames && opts.figNames[target.split('/').pop()]) || target.split('/').pop();
      figNo++;
      images.push({ rel: rid, target, file, figNo });
      const cap = (opts.captions && opts.captions[figNo]) || ('Figure ' + figNo + '. ' + lastHeading);
      if (!opts.captions || !opts.captions[figNo]) warnings.push('figure ' + figNo + ' (' + target + ') had no caption in source; generated "' + cap + '"');
      push('FIG|' + file + '|' + cap + '|' + Math.round(cx / 9525) + '|' + Math.round(cy / 9525));
    }
  }

  function paragraph(p) {
    const ps = first(p, 'pStyle'); const st = ps ? ps.getAttribute('w:val') : '';
    if (isSkip(st)) return;
    const hasDrawing = p.getElementsByTagNameNS(W, 'drawing').length > 0;
    const txt = inline(p, false);
    if (hasDrawing) { figLines(p); if (txt) push('P |' + txt); return; }
    if (!txt) return;
    const hm = /^Heading([1-5])$/.exec(st);
    if (hm) {
      const lvl = +hm[1]; const tag = 'H' + Math.min(lvl, 5);
      lastHeading = txt;
      push(tag + ' |' + headingNo(lvl) + ' ' + txt);
      return;
    }
    const np = first(p, 'numPr');
    if (np) {
      const ni = first(np, 'numId'), il = first(np, 'ilvl');
      const lvl = il ? +il.getAttribute('w:val') : 0;
      const fmt = ((numFmt[ni && ni.getAttribute('w:val')] || [])[lvl]) || 'bullet';
      if (fmt === 'decimal') { push('NUM|' + txt); return; }
      push('B |' + (lvl > 0 ? '\u2013 ' : '') + txt); return;
    }
    if (st === 'ListParagraph') { push('B |' + txt); return; }
    push('P |' + txt);
  }

  function table(tbl) {
    const grid = [...(first(tbl, 'tblGrid') ? first(tbl, 'tblGrid').getElementsByTagNameNS(W, 'gridCol') : [])].map(g => +g.getAttribute('w:w'));
    const total = grid.reduce((a, b) => a + b, 0) || 9360;
    let widths = grid.map(w => Math.round(w * 9360 / total));
    if (widths.length) widths[widths.length - 1] += 9360 - widths.reduce((a, b) => a + b, 0);
    if (!widths.length) widths = [9360];
    push('TBL|' + widths.join(','));
    const rows = kids(tbl).filter(r => r.localName === 'tr');
    rows.forEach((r, ri) => {
      const hdr = !!first(r, 'tblHeader') || ri === 0;
      const cells = kids(r).filter(c => c.localName === 'tc').map(tc => {
        const pr = first(tc, 'tcPr');
        let span = 1;
        if (pr) { const gs = [...pr.children].find(x => x.localName === 'gridSpan'); if (gs) span = +gs.getAttribute('w:val'); }
        const paras = kids(tc).filter(x => x.localName === 'p');
        const bits = paras.map(pp => {
          const t = inline(pp, true); if (!t) return '';
          const np = first(pp, 'numPr'); const psx = first(pp, 'pStyle');
          const listy = np || (psx && psx.getAttribute('w:val') === 'ListParagraph');
          return listy && paras.length > 1 ? '\u2022 ' + t : t;
        }).filter(Boolean);
        let txt = bits.join('<br>').replace(/\|\|/g, '| |');
        return (span > 1 ? '@' + span + '@' : '') + txt;
      });
      if (cells.some(c => c.replace(/^@\d+@/, ''))) push((hdr ? 'TH |' : 'TR |') + cells.join('||'));
    });
    push('END');
  }

  for (let i = start; i < allKids.length; i++) {
    const k = allKids[i];
    if (k.localName === 'p') paragraph(k);
    else if (k.localName === 'tbl') table(k);
  }

  const nComments = parts['word/comments.xml'] ? (td.decode(parts['word/comments.xml']).match(/<w:comment /g) || []).length : 0;
  if (nComments) warnings.push(nComments + ' Word comments in the source were not carried across');
  const nDel = (docXml.match(/<w:del /g) || []).length;
  if (nDel) warnings.push(nDel + ' tracked deletions present in the source');

  return { dsl: lines.join('\n') + '\n', images, warnings, cover };
}
