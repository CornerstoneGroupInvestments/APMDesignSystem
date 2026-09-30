// Converts a change-request Markdown file (built on templates/emergency-change/) into a
// plain, clean Word document. Deliberately NOT the DDD pipeline: no cover fields, no
// apm-master.docx, no Project Name / Program Name / SDA Approval sheet. A change request
// is a checklist against the live environment, not a design, and should not look like one.
//
// Supports the Markdown subset actually used in these documents: # / ## / ### headings,
// paragraphs with **bold**, `code` and *italic* inline spans, "- " bullet lines, "N. "
// numbered lines (kept as literal text, not native Word numbering, so two separate
// numbered blocks never fight over restart), pipe tables with a header row, and "---"
// horizontal rules.
//
// Usage from run_script:
//   const src = await readFile('change-requests/build-docx.js');
//   const { buildChangeRequestDocx } = await import(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
//   await buildChangeRequestDocx({ readFile, saveFile }, 'change-requests/<slug>/<name>.md', 'change-requests/<slug>/output/<name>.docx');

const NAVY = '1F2D58', NAVY60 = '5A668C', RULE = 'C9D0E0';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function parseInline(text) {
  const out = []; let last = 0;
  const re = /(\*\*.+?\*\*|`.+?`|\*.+?\*)/g; let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: text.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith('**')) out.push({ t: tok.slice(2, -2), bold: true });
    else if (tok.startsWith('`')) out.push({ t: tok.slice(1, -1), mono: true });
    else out.push({ t: tok.slice(1, -1), italic: true });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ t: text.slice(last) });
  return out;
}
function runXml(seg, extra) {
  const rpr = [];
  if (seg.bold) rpr.push('<w:b/>');
  if (seg.italic) rpr.push('<w:i/>');
  if (seg.mono) rpr.push('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>');
  if (extra) rpr.push(extra);
  const pr = rpr.length ? `<w:rPr>${rpr.join('')}</w:rPr>` : '';
  return `<w:r>${pr}<w:t xml:space="preserve">${esc(seg.t)}</w:t></w:r>`;
}
function paraXml(text, opts) {
  opts = opts || {};
  const pPr = [];
  if (opts.style) pPr.push(`<w:pStyle w:val="${opts.style}"/>`);
  if (opts.indent) pPr.push(`<w:ind w:left="${opts.indent}" w:hanging="${opts.hanging || 0}"/>`);
  if (opts.spaceAfter != null) pPr.push(`<w:spacing w:after="${opts.spaceAfter}"/>`);
  const runs = (text === '' ? [{ t: '' }] : parseInline(text)).map(s => runXml(s, opts.runExtra)).join('');
  return `<w:p>${pPr.length ? '<w:pPr>' + pPr.join('') + '</w:pPr>' : ''}${runs}</w:p>`;
}
function cellXml(text, opts) {
  opts = opts || {};
  const shade = opts.header ? `<w:shd w:val="clear" w:fill="E7EAF2"/>` : '';
  const width = opts.width ? `<w:tcW w:w="${opts.width}" w:type="dxa"/>` : '<w:tcW w:w="0" w:type="auto"/>';
  const segs = parseInline(text);
  const p = `<w:p>${segs.map(s => runXml(opts.header ? Object.assign({}, s, { bold: true }) : s)).join('')}</w:p>`;
  return `<w:tc><w:tcPr>${width}${shade}<w:vAlign w:val="top"/></w:tcPr>${p}</w:tc>`;
}
function tableXml(rows) {
  const cols = rows[0].length;
  const total = 9350, base = Math.floor(total / cols);
  const widths = new Array(cols).fill(base);
  const grid = widths.map(w => `<w:gridCol w:w="${w}"/>`).join('');
  const borders = '<w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
    .map(s => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="${RULE}"/>`).join('') + '</w:tblBorders>';
  const trs = rows.map((r, ri) => '<w:tr>' + r.map((c, ci) => cellXml(c, { header: ri === 0, width: widths[ci] })).join('') + '</w:tr>').join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="${total}" w:type="dxa"/>${borders}<w:tblLook w:val="04A0"/></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${trs}</w:tbl>`;
}
function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map(c => c.trim());
}

export function markdownToBodyXml(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  const body = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (/^---+$/.test(line.trim())) {
      body.push(`<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="${RULE}"/></w:pBdr><w:spacing w:after="240"/></w:pPr></w:p>`);
      i++; continue;
    }
    if (line.startsWith('# ')) { body.push(paraXml(line.slice(2), { style: 'Title' })); i++; continue; }
    if (line.startsWith('## ')) { body.push(paraXml(line.slice(3), { style: 'Heading1' })); i++; continue; }
    if (line.startsWith('### ')) { body.push(paraXml(line.slice(4), { style: 'Heading2' })); i++; continue; }
    if (line.trim().startsWith('|')) {
      const tbl = []; let j = i;
      tbl.push(splitRow(lines[j])); j++;
      if (j < lines.length && /^\s*\|?[\s:-]+\|/.test(lines[j])) j++;
      while (j < lines.length && lines[j].trim().startsWith('|')) { tbl.push(splitRow(lines[j])); j++; }
      body.push(tableXml(tbl));
      body.push(paraXml('', { spaceAfter: 160 }));
      i = j; continue;
    }
    if (/^-\s+/.test(line)) {
      body.push(paraXml('\u2022  ' + line.replace(/^-\s+/, ''), { indent: 360, hanging: 360, spaceAfter: 60 }));
      i++; continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      body.push(paraXml(line, { indent: 360, hanging: 360, spaceAfter: 60 }));
      i++; continue;
    }
    body.push(paraXml(line, { spaceAfter: 120 }));
    i++;
  }
  return body.join('');
}

export async function buildChangeRequestDocx(helpers, mdPath, outPath, opts) {
  opts = opts || {};
  const { readFile, saveFile } = helpers;
  const md = await readFile(mdPath);
  const bodyXml = markdownToBodyXml(md);
  const te = new TextEncoder();

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${esc(opts.title || 'Change Request')}</dc:title>
<dc:creator>APM Digital</dc:creator>
</cp:coreProperties>`;

  const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>APM Change Request Builder</Application></Properties>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="21"/><w:lang w:val="en-AU"/></w:rPr></w:rPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:color w:val="${NAVY}"/><w:sz w:val="40"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="320" w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="${NAVY}"/></w:pBdr></w:pPr><w:rPr><w:b/><w:color w:val="${NAVY}"/><w:sz w:val="27"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="240" w:after="100"/></w:pPr><w:rPr><w:b/><w:color w:val="${NAVY}"/><w:sz w:val="23"/></w:rPr></w:style>
</w:styles>`;

  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${bodyXml}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body>
</w:document>`;

  const files = [
    ['[Content_Types].xml', contentTypes],
    ['_rels/.rels', rootRels],
    ['docProps/core.xml', core],
    ['docProps/app.xml', app],
    ['word/document.xml', document],
    ['word/styles.xml', styles],
    ['word/_rels/document.xml.rels', docRels],
  ].map(([name, xml]) => ({ name, bytes: te.encode(xml) }));

  const crcTable = (() => { const t = new Int32Array(256); for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[i] = c; } return t; })();
  const crc32 = b => { let c = -1; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  let size = 22 + 1024; for (const f of files) size += 76 + 2 * f.name.length + f.bytes.length;
  const out = new Uint8Array(size); const ov = new DataView(out.buffer);
  let pos = 0; const central = [];
  for (const f of files) {
    const nb = te.encode(f.name), crc = crc32(f.bytes);
    central.push({ nb, crc, size: f.bytes.length, off: pos });
    ov.setUint32(pos, 0x04034b50, true); ov.setUint16(pos + 4, 20, true);
    ov.setUint32(pos + 14, crc, true); ov.setUint32(pos + 18, f.bytes.length, true); ov.setUint32(pos + 22, f.bytes.length, true);
    ov.setUint16(pos + 26, nb.length, true);
    out.set(nb, pos + 30); out.set(f.bytes, pos + 30 + nb.length);
    pos += 30 + nb.length + f.bytes.length;
  }
  const cdStart = pos;
  for (const c of central) {
    ov.setUint32(pos, 0x02014b50, true); ov.setUint16(pos + 4, 20, true); ov.setUint16(pos + 6, 20, true);
    ov.setUint32(pos + 16, c.crc, true); ov.setUint32(pos + 20, c.size, true); ov.setUint32(pos + 24, c.size, true);
    ov.setUint16(pos + 28, c.nb.length, true); ov.setUint32(pos + 42, c.off, true);
    out.set(c.nb, pos + 46); pos += 46 + c.nb.length;
  }
  ov.setUint32(pos, 0x06054b50, true); ov.setUint16(pos + 8, central.length, true); ov.setUint16(pos + 10, central.length, true);
  ov.setUint32(pos + 12, pos - cdStart, true); ov.setUint32(pos + 16, cdStart, true);
  pos += 22;
  await saveFile(outPath, new Blob([out.slice(0, pos)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
  return outPath;
}
