// Export renamed from `rebuildWithComments` to `rebuildKioskDocWithComments` for this bundle, so it does not
// collide with the copy in the APM Design System project. Import it by the new name.
// Rebuild the Participant Kiosk DDD from content.txt AND re-inject the V1.1 review
// comments so they survive every rebuild. Import from run_script via blob URL:
//   const src = await readFile('designs/participant-device/rebuild-with-comments.js');
//   const { rebuildKioskDocWithComments } = await import(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
//   await rebuildKioskDocWithComments({ readFile, readFileBinary, saveFile, log }, { version: 'V1.2', versionRows: [...] });
export async function rebuildKioskDocWithComments(h, opts) {
  const { readFile, readFileBinary, saveFile, log } = h;
  const version = opts.version || 'V1.2';
  const outPath = opts.outPath || ('designs/participant-device/output/APM_DDD_Participant_Kiosk_' + version + '.docx');

  // ---- 1. build the docx from content.txt ----
  const builderSrc = await readFile('templates/detailed-design/authoring/docx-builder.js');
  const { buildDocx } = await import(URL.createObjectURL(new Blob([builderSrc], { type: 'text/javascript' })));
  await buildDocx(h,
    'templates/detailed-design/authoring/apm-master.docx',
    'designs/participant-device/content.txt',
    'designs/participant-device/figs/',
    outPath,
    { relPrefix: 'rIdPK', imgPrefix: 'pkfig', idBase: 9900,
      fields: Object.assign({
        'Project Name:': 'Participant Kiosk - Detailed Design',
        'Program Name:': 'Digital Workplace Transformation',
        'Division/Unit:': 'Digital',
        'Document Status:': 'Draft - for review',
        'Document Version:': version,
        'Document Owner:': 'Head of Digital Transformation and Architecture',
        'Contact Details:': 'Digital Transformation and Architecture',
        'Product ID:': 'APM-DDD-PK-' + version
      }, opts.fields || {}),
      versionRows: opts.versionRows });

  // ---- 2. zip helpers ----
  const td = new TextDecoder(), te = new TextEncoder();
  async function unzip(path) {
    const blob = await readFileBinary(path);
    const buf = new Uint8Array(await blob.arrayBuffer()); const dv = new DataView(buf.buffer);
    let eocd = -1; for (let i = buf.length - 22; i >= 0; i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    const count = dv.getUint16(eocd + 10, true); let off = dv.getUint32(eocd + 16, true); const entries = [];
    for (let i = 0; i < count; i++) {
      const nl = dv.getUint16(off + 28, true), el = dv.getUint16(off + 30, true), cl = dv.getUint16(off + 32, true);
      entries.push({ name: td.decode(buf.slice(off + 46, off + 46 + nl)), method: dv.getUint16(off + 10, true), compSize: dv.getUint32(off + 20, true), lho: dv.getUint32(off + 42, true) });
      off += 46 + nl + el + cl;
    }
    const out = [];
    for (const e of entries) {
      const nl = dv.getUint16(e.lho + 26, true), el = dv.getUint16(e.lho + 28, true); const s = e.lho + 30 + nl + el;
      const d = buf.slice(s, s + e.compSize);
      out.push({ name: e.name, bytes: e.method === 0 ? d : new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()) });
    }
    return out;
  }

  // ---- 3. comment parts from the reviewed copy ----
  const src = opts.commentsSource || 'uploads/APM_DDD_Participant_Kiosk_V1.1.docx';
  const vSrc = await unzip(src);
  const want = ['word/comments.xml','word/commentsExtended.xml','word/commentsIds.xml','word/commentsExtensible.xml','word/people.xml','word/_rels/comments.xml.rels'];
  const cparts = vSrc.filter(p => want.includes(p.name));
  const ctSrc = td.decode(vSrc.find(p => p.name === '[Content_Types].xml').bytes);
  const relsSrc = td.decode(vSrc.find(p => p.name === 'word/_rels/document.xml.rels').bytes);
  const overrides = [...ctSrc.matchAll(/<Override PartName="\/word\/(comments[^"]*|people)\.xml"[^>]*\/>/g)].map(m => m[0]);
  const relTypes = {};
  for (const m of relsSrc.matchAll(/<Relationship [^>]*Target="(comments[^"]*|people)\.xml"[^>]*>/g)) {
    relTypes[m[0].match(/Target="([^"]+)"/)[1]] = m[0].match(/Type="([^"]+)"/)[1];
  }

  // ---- 4. anchor threads in the fresh build ----
  // Default anchors; override with opts.threads when the anchor text changes.
  const threads = opts.threads || [
    { ids: [9,10,11],           marker: 'Requirement from the business review: participants who download documents' },
    { ids: [29,30,31,32,33,34], marker: 'identifiable to network and security tooling by account as well as by hostname' },
    { ids: [61,62,63],          marker: 'access is controlled by a pre-shared key deployed to devices by Intune policy' },
    { ids: [70,71,72,73,74],    marker: 'standard DNS forwarders' },
  ];
  const built = await unzip(outPath);
  const byName = Object.fromEntries(built.map(p => [p.name, p]));
  let doc = td.decode(byName['word/document.xml'].bytes);
  for (const t of threads) {
    const idx = doc.indexOf(t.marker);
    if (idx < 0) throw new Error('comment anchor not found: ' + t.marker.slice(0, 50));
    const rs = Math.max(doc.lastIndexOf('<w:r>', idx), doc.lastIndexOf('<w:r ', idx));
    const re = doc.indexOf('</w:r>', idx) + 6;
    const starts = t.ids.map(id => '<w:commentRangeStart w:id="' + id + '"/>').join('');
    const ends = t.ids.map(id => '<w:commentRangeEnd w:id="' + id + '"/><w:r><w:commentReference w:id="' + id + '"/></w:r>').join('');
    doc = doc.slice(0, rs) + starts + doc.slice(rs, re) + ends + doc.slice(re);
  }
  byName['word/document.xml'].bytes = te.encode(doc);
  let ct = td.decode(byName['[Content_Types].xml'].bytes);
  for (const ov of overrides) if (!ct.includes(ov.match(/PartName="([^"]+)"/)[1])) ct = ct.replace('</Types>', ov + '</Types>');
  byName['[Content_Types].xml'].bytes = te.encode(ct);
  let rels = td.decode(byName['word/_rels/document.xml.rels'].bytes);
  let n = 1;
  for (const [target, type] of Object.entries(relTypes)) {
    if (!rels.includes('Target="' + target + '"')) rels = rels.replace('</Relationships>', '<Relationship Id="rIdCm' + (n++) + '" Type="' + type + '" Target="' + target + '"/></Relationships>');
  }
  byName['word/_rels/document.xml.rels'].bytes = te.encode(rels);
  const all = built.filter(p => !want.includes(p.name)).concat(cparts);
  for (const p of all) if (byName[p.name]) p.bytes = byName[p.name].bytes;

  // ---- 5. rezip (store) ----
  const crcTable = (() => { const t = new Int32Array(256); for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[i] = c; } return t; })();
  const crc32 = b => { let c = -1; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  let size = 22 + 1024; for (const p of all) size += 76 + 2 * p.name.length + p.bytes.length;
  const out = new Uint8Array(size); const ov = new DataView(out.buffer);
  let pos = 0; const central = [];
  for (const p of all) {
    const nb = te.encode(p.name); const crc = crc32(p.bytes);
    central.push({ nb, crc, size: p.bytes.length, off: pos });
    ov.setUint32(pos, 0x04034b50, true); ov.setUint16(pos + 4, 20, true);
    ov.setUint32(pos + 14, crc, true); ov.setUint32(pos + 18, p.bytes.length, true); ov.setUint32(pos + 22, p.bytes.length, true);
    ov.setUint16(pos + 26, nb.length, true);
    out.set(nb, pos + 30); out.set(p.bytes, pos + 30 + nb.length);
    pos += 30 + nb.length + p.bytes.length;
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
  log('rebuilt with comments:', outPath, pos, 'bytes,', all.length, 'parts, threads:', threads.length);
  return outPath;
}
