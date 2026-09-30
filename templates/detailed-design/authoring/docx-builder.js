// Shared docx builder for APM master template. Usage: import via dynamic import in run_script.
export async function buildDocx(env, masterPath, contentPath, figDir, outPath, cover) {
  const { readFileBinary, readFile, saveFile, log } = env;
  const blob = await readFileBinary(masterPath);
  const buf = new Uint8Array(await blob.arrayBuffer()); const dv = new DataView(buf.buffer);
  let eocd = -1; for (let i = buf.length - 22; i >= 0; i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
  const count = dv.getUint16(eocd + 10, true); let off = dv.getUint32(eocd + 16, true); const entries = [];
  for (let i = 0; i < count; i++) {
    const nl = dv.getUint16(off + 28, true), el = dv.getUint16(off + 30, true), cl = dv.getUint16(off + 32, true);
    const name = new TextDecoder().decode(buf.slice(off + 46, off + 46 + nl));
    entries.push({ name, method: dv.getUint16(off + 10, true), compSize: dv.getUint32(off + 20, true), lho: dv.getUint32(off + 42, true) });
    off += 46 + nl + el + cl;
  }
  async function ex(e) {
    const nl = dv.getUint16(e.lho + 26, true), el = dv.getUint16(e.lho + 28, true);
    const s = e.lho + 30 + nl + el; const d = buf.slice(s, s + e.compSize);
    if (e.method === 0) return d;
    return new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  }
  const files = {}; for (const e of entries) { if (!e.name.startsWith('[trash]')) files[e.name] = await ex(e); }
  const td = new TextDecoder(), te = new TextEncoder();
  let xml = td.decode(files['word/document.xml']);
  const rootTag = xml.slice(xml.indexOf('<w:document'), xml.indexOf('>', xml.indexOf('<w:document')) + 1);
  let rf = rootTag;
  for (const [k, v] of [['xmlns:wp=', ' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"'], ['xmlns:r=', ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"']]) if (!rootTag.includes(k)) rf = rf.replace('<w:document', '<w:document' + v);
  if (rf !== rootTag) xml = xml.replace(rootTag, rf);
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Sets the value cell immediately after the label cell, replacing whatever the
  // master pre-filled there (some cover fields ship with placeholder text).
  function fillField(label, val) {
    const li = xml.indexOf('<w:t>' + label + '</w:t>'); if (li < 0) return;
    const tcEnd = xml.indexOf('</w:tc>', li); if (tcEnd < 0) return;
    const nTc = xml.indexOf('<w:tc>', tcEnd); if (nTc < 0) return;
    const nTcEnd = xml.indexOf('</w:tc>', nTc); if (nTcEnd < 0) return;
    let cell = xml.slice(nTc, nTcEnd).replace(/<w:r [^>]*>[\s\S]*?<\/w:r>|<w:r>[\s\S]*?<\/w:r>/g, '');
    const pe = cell.indexOf('</w:p>'); if (pe < 0) return;
    cell = cell.slice(0, pe) + '<w:r><w:rPr><w:b /></w:rPr><w:t xml:space="preserve">' + esc(val) + '</w:t></w:r>' + cell.slice(pe);
    xml = xml.slice(0, nTc) + cell + xml.slice(nTcEnd);
  }
  for (const [k, v] of Object.entries(cover.fields)) fillField(k, v);
  (function () {
    // versionRows: [[version, date, author, changes], …] rebuilds the whole table body
    // from the master's own data-row markup. history: flat cells filling the first row.
    if (cover.versionRows && cover.versionRows.length) {
      const h = xml.indexOf('Version History'); if (h < 0) return;
      const tb = xml.indexOf('<w:tbl>', h), te = xml.indexOf('</w:tbl>', h); if (tb < 0 || te < 0) return;
      const tbl = xml.slice(tb, te + 8);
      const trRe = /<w:tr [^>]*>[\s\S]*?<\/w:tr>/g; const trs = tbl.match(trRe) || [];
      if (trs.length < 2) return;
      const tmpl = trs[1];
      const rowFor = vals => {
        const cells = tmpl.match(/<w:tc>[\s\S]*?<\/w:tc>/g) || [];
        const head = tmpl.slice(0, tmpl.indexOf(cells[0]));
        return head + cells.map((cell, ci) => {
          const val = String(vals[ci] == null ? '' : vals[ci]);
          let c = cell.replace(/<w:r [^>]*>[\s\S]*?<\/w:r>|<w:r>[\s\S]*?<\/w:r>/g, '');
          const pe = c.lastIndexOf('</w:p>'); if (pe < 0) return c;
          const rpr = '<w:rFonts w:eastAsia="MS PGothic" />' + (ci === 0 ? '<w:b />' : '') + '<w:color w:val="000000" /><w:szCs w:val="20" />';
          return c.slice(0, pe) + runs(val, rpr) + c.slice(pe);
        }).join('') + '</w:tr>';
      };
      const rebuilt = tbl.slice(0, tbl.indexOf(trs[1])) + cover.versionRows.map(rowFor).join('') + '</w:tbl>';
      xml = xml.slice(0, tb) + rebuilt + xml.slice(te + 8);
      return;
    }
    if (!cover.history) return;
    let i = xml.indexOf('Version History'); if (i < 0) return; i = xml.indexOf('>V0.1<', i); if (i < 0) return;
    let pos = i;
    for (const v of cover.history) {
      while (true) {
        const ps = xml.indexOf('<w:p ', pos); if (ps < 0) return; const pe = xml.indexOf('</w:p>', ps); if (pe < 0) return;
        if (xml.slice(ps, pe).indexOf('<w:t') === -1) { xml = xml.slice(0, pe) + '<w:r><w:t xml:space="preserve">' + esc(v) + '</w:t></w:r>' + xml.slice(pe); pos = pe + 60; break; }
        pos = pe + 6;
      }
    }
  })();
  const content = await readFile(contentPath);
  // **bold**, ==yellow highlight== (markers are always balanced within a chunk)
  function runs(text, extraRpr) {
    let out = ''; const hlParts = String(text).split('==');
    for (let h = 0; h < hlParts.length; h++) {
      const hl = h % 2 === 1; const parts = hlParts[h].split('**');
      for (let k = 0; k < parts.length; k++) {
        if (!parts[k]) continue; const bold = k % 2 === 1;
        const rpr = (bold ? '<w:b />' : '') + (hl ? '<w:highlight w:val="yellow" />' : '') + (extraRpr || '');
        out += '<w:r>' + (rpr ? '<w:rPr>' + rpr + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + esc(parts[k].replace(/&amp;/g, '&')) + '</w:t></w:r>';
      }
    }
    return out;
  }
  const NAVY = '1F2D58', BORD = 'BFC5D4';
  function cellP(text, hdr) {
    const rpr = '<w:sz w:val="17" /><w:szCs w:val="17" />' + (hdr ? '<w:b /><w:color w:val="FFFFFF" />' : '');
    const segs = String(text).split('<br>');
    return segs.map((s, i) => '<w:p><w:pPr><w:spacing w:before="' + (i ? '20' : '40') + '" w:after="' + (i < segs.length - 1 ? '20' : '40') + '" w:line="240" w:lineRule="auto" /><w:rPr><w:sz w:val="17" /></w:rPr></w:pPr>' + runs(s, rpr) + '</w:p>').join('');
  }
  function tc(text, w, hdr, shade, span) {
    return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa" />' + (span > 1 ? '<w:gridSpan w:val="' + span + '" />' : '') + '<w:tcBorders><w:top w:val="single" w:sz="4" w:color="' + BORD + '" /><w:left w:val="single" w:sz="4" w:color="' + BORD + '" /><w:bottom w:val="single" w:sz="4" w:color="' + BORD + '" /><w:right w:val="single" w:sz="4" w:color="' + BORD + '" /></w:tcBorders>' + (hdr ? '<w:shd w:val="clear" w:color="auto" w:fill="' + NAVY + '" />' : (shade ? '<w:shd w:val="clear" w:color="auto" w:fill="F5F7FB" />' : '')) + '<w:tcMar><w:top w:w="60" w:type="dxa" /><w:left w:w="100" w:type="dxa" /><w:bottom w:w="60" w:type="dxa" /><w:right w:w="100" w:type="dxa" /></w:tcMar><w:vAlign w:val="center" /></w:tcPr>' + cellP(text, hdr) + '</w:tc>';
  }
  let seq = 0; const images = [];
  function figXml(file, caption, w, h) {
    seq++; const relId = cover.relPrefix + seq; images.push({ file, relId, name: cover.imgPrefix + seq + '.png' });
    const cx = 5750000, cy = Math.round(cx * h / w); const id = cover.idBase + seq;
    return '<w:p><w:pPr><w:keepNext /><w:jc w:val="center" /><w:spacing w:before="180" w:after="60" /></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '" /><wp:effectExtent l="0" t="0" r="0" b="0" /><wp:docPr id="' + id + '" name="Figure' + seq + '" /><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1" /></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="' + id + '" name="Figure' + seq + '" /><pic:cNvPicPr /></pic:nvPicPr><pic:blipFill><a:blip r:embed="' + relId + '" /><a:stretch><a:fillRect /></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0" /><a:ext cx="' + cx + '" cy="' + cy + '" /></a:xfrm><a:prstGeom prst="rect"><a:avLst /></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>' +
      '<w:p><w:pPr><w:pStyle w:val="Caption" /><w:jc w:val="center" /><w:spacing w:after="220" /></w:pPr>' + runs(caption) + '</w:p>';
  }
  let body = ''; let tbl = null; let numCount = 0;
  function flushTbl() {
    if (!tbl) return;
    let t = '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid" /><w:tblW w:w="9360" w:type="dxa" /><w:tblLayout w:type="fixed" /><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1" /></w:tblPr><w:tblGrid>';
    for (const w of tbl.widths) t += '<w:gridCol w:w="' + w + '" />';
    t += '</w:tblGrid>';
    tbl.rows.forEach((r, ri) => {
      t += '<w:tr>' + (r.hdr ? '<w:trPr><w:tblHeader /></w:trPr>' : '');
      let ci = 0;
      r.cells.forEach(raw => {
        let c = raw, span = 1; const sm = /^@(\d+)@/.exec(c); if (sm) { span = +sm[1]; c = c.slice(sm[0].length); }
        let w = 0; for (let s = 0; s < span; s++) w += tbl.widths[ci + s] || 2000;
        t += tc(c, w || 2000, r.hdr, !r.hdr && ri % 2 === 0, span); ci += span;
      });
      t += '</w:tr>';
    });
    t += '</w:tbl><w:p><w:pPr><w:spacing w:after="160" /><w:rPr><w:sz w:val="8" /></w:rPr></w:pPr></w:p>'; body += t; tbl = null;
  }
  for (const raw of content.split('\n')) {
    const line = raw.replace(/\r$/, ''); if (!line.trim()) continue;
    const m = line.match(/^(H1|H2|H3|H4|H5|GD|BQ|NUM|B|P|FIG|TBL|TH|TR|END)\s?\|?(.*)$/); if (!m) continue;
    const tag = m[1], rest = m[2];
    if (tag === 'TBL') { flushTbl(); tbl = { widths: rest.split(',').map(Number), rows: [] }; continue; }
    if (tag === 'TH') { if (tbl) tbl.rows.push({ cells: rest.split('||'), hdr: true }); continue; }
    if (tag === 'TR') { if (tbl) tbl.rows.push({ cells: rest.split('||'), hdr: false }); continue; }
    if (tag === 'END') { flushTbl(); continue; }
    if (tag !== 'NUM') numCount = 0;
    flushTbl();
    if (tag === 'H1') body += '<w:p><w:pPr><w:pStyle w:val="Heading1" /><w:pageBreakBefore /></w:pPr>' + runs(rest) + '</w:p>';
    else if (tag === 'H2') body += '<w:p><w:pPr><w:pStyle w:val="Heading2" /></w:pPr>' + runs(rest) + '</w:p>';
    else if (tag === 'H3') body += '<w:p><w:pPr><w:pStyle w:val="Heading3" /></w:pPr>' + runs(rest) + '</w:p>';
    else if (tag === 'H4') body += '<w:p><w:pPr><w:pStyle w:val="Heading4" /><w:keepNext /></w:pPr>' + runs(rest) + '</w:p>';
    else if (tag === 'H5') body += '<w:p><w:pPr><w:pStyle w:val="Heading5" /><w:keepNext /></w:pPr>' + runs(rest) + '</w:p>';
    else if (tag === 'P') body += '<w:p><w:pPr><w:spacing w:after="140" w:line="276" w:lineRule="auto" /></w:pPr>' + runs(rest) + '</w:p>';
    else if (tag === 'B') body += '<w:p><w:pPr><w:ind w:left="510" w:hanging="227" /><w:spacing w:after="70" w:line="276" w:lineRule="auto" /></w:pPr><w:r><w:t xml:space="preserve">\u2022  </w:t></w:r>' + runs(rest) + '</w:p>';
    else if (tag === 'NUM') { numCount++; body += '<w:p><w:pPr><w:ind w:left="567" w:hanging="284" /><w:spacing w:after="90" w:line="276" w:lineRule="auto" /></w:pPr><w:r><w:rPr><w:b /></w:rPr><w:t xml:space="preserve">' + numCount + '.  </w:t></w:r>' + runs(rest) + '</w:p>'; }
    else if (tag === 'GD') body += '<w:p><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="10" w:color="1F2D58" /></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="EEF1F8" /><w:ind w:left="227" w:right="170" /><w:spacing w:before="120" w:after="40" w:line="264" w:lineRule="auto" /></w:pPr><w:r><w:rPr><w:b /><w:caps /><w:color w:val="1F2D58" /><w:sz w:val="15" /></w:rPr><w:t xml:space="preserve">Guidance    </w:t></w:r>' + runs(rest, '<w:i /><w:color w:val="2A3A6B" /><w:sz w:val="18" />') + '</w:p><w:p><w:pPr><w:spacing w:after="80" /><w:rPr><w:sz w:val="8" /></w:rPr></w:pPr></w:p>';
    else if (tag === 'BQ') body += '<w:p><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="10" w:color="F89728" /></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="FEF7EC" /><w:ind w:left="227" w:right="170" /><w:spacing w:before="120" w:after="180" w:line="276" w:lineRule="auto" /></w:pPr>' + runs(rest, '<w:i /><w:color w:val="95500A" /><w:sz w:val="19" />') + '</w:p>';
    else if (tag === 'FIG') { const p = rest.split('|'); body += figXml(p[0], p[1], Number(p[2]), Number(p[3])); }
  }
  flushTbl();
  const paraRe = /<w:p [^>]*>[\s\S]*?<\/w:p>/g; let mm, cutStart = -1;
  while ((mm = paraRe.exec(xml)) !== null) {
    const p = mm[0];
    if (/<w:pStyle w:val="Heading1"\s*\/>/.test(p) && /Introduction/.test(p)) { cutStart = mm.index; break; }
  }
  const tailIdx = xml.lastIndexOf('<w:sectPr');
  if (cutStart < 0 || tailIdx < 0) throw new Error('splice markers not found for ' + outPath);
  const newDoc = xml.slice(0, cutStart) + body + xml.slice(tailIdx);
  files['word/document.xml'] = te.encode(newDoc);
  let rels = td.decode(files['word/_rels/document.xml.rels']); let addRels = '';
  for (const im of images) {
    files['word/media/' + im.name] = new Uint8Array(await (await readFileBinary(figDir + im.file)).arrayBuffer());
    addRels += '<Relationship Id="' + im.relId + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + im.name + '" />';
  }
  files['word/_rels/document.xml.rels'] = te.encode(rels.replace('</Relationships>', addRels + '</Relationships>'));
  let ct = td.decode(files['[Content_Types].xml']);
  if (ct.indexOf('Extension="png"') === -1) ct = ct.replace('</Types>', '<Default Extension="png" ContentType="image/png" /></Types>');
  files['[Content_Types].xml'] = te.encode(ct);
  const perr = new DOMParser().parseFromString(newDoc, 'application/xml').querySelector('parsererror');
  if (perr) throw new Error('XML not well-formed in ' + outPath + ': ' + perr.textContent.slice(0, 200));
  const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
  const crc32 = d => { let c = 0xFFFFFFFF; for (let i = 0; i < d.length; i++) c = crcT[(c ^ d[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const parts = [], central = []; let offset = 0; const names = Object.keys(files);
  for (const name of names) {
    const data = files[name]; const nb = te.encode(name); const crc = crc32(data);
    const lh = new Uint8Array(30 + nb.length); const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true); lv.setUint16(26, nb.length, true); lh.set(nb, 30);
    parts.push(lh, data);
    const ch = new Uint8Array(46 + nb.length); const cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, nb.length, true); cv.setUint32(42, offset, true); ch.set(nb, 46);
    central.push(ch); offset += lh.length + data.length;
  }
  const cdStart = offset; let cdLen = 0; for (const c of central) { parts.push(c); cdLen += c.length; }
  const eo = new Uint8Array(22); const ev = new DataView(eo.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, names.length, true); ev.setUint16(10, names.length, true); ev.setUint32(12, cdLen, true); ev.setUint32(16, cdStart, true);
  parts.push(eo);
  const out = new Blob(parts, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  await saveFile(outPath, out);
  log(outPath + ' -> ' + out.size + ' bytes, figures=' + images.length);
}
