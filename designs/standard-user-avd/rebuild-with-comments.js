// Rebuild the Standard User AVD detail design from content-detail.txt AND re-inject the
// V1.2 review comments (Ugbaad Adani, Chris Katigbak) so the threads survive every rebuild.
// Import from run_script via blob URL:
//   const src = await readFile('designs/standard-user-avd/rebuild-with-comments.js');
//   const { rebuildStandardUserAvdDoc } = await import(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
//   await rebuildStandardUserAvdDoc({ readFile, readFileBinary, saveFile, log }, { version: 'V1.4', versionRows: [...] });
//
// Anchors are plain-text markers that must sit inside a single <w:t>. A marker that spans a
// bold run is split across runs in the built document and will not be found, so never use a
// marker that includes **emphasis** from the DSL.
export async function rebuildStandardUserAvdDoc(h, opts) {
  const { readFile, readFileBinary, saveFile, log } = h;
  const version = opts.version || 'V1.4';
  const outPath = opts.outPath || ('designs/standard-user-avd/output/APM_Detail_Design_Standard_User_AVD_' + version + '.docx');

  const builderSrc = await readFile('templates/detailed-design-v2/authoring/docx-builder.js');
  const { buildDocx } = await import(URL.createObjectURL(new Blob([builderSrc], { type: 'text/javascript' })));
  await buildDocx(h,
    'templates/detailed-design/authoring/apm-master.docx',
    'designs/standard-user-avd/content-detail.txt',
    'designs/standard-user-avd/figs/',
    outPath,
    { relPrefix: 'rSU4', imgPrefix: 'su4Fig', idBase: 13600,
      fields: Object.assign({
        'Project Name:': 'Standard User SOE on Azure Virtual Desktop',
        'Program Name:': 'Standard Operating Environment Program',
        'Division/Unit:': 'Digital',
        'Document Status:': 'For approval',
        'Document Version:': version,
        'Document Owner:': 'Head of Digital Transformation and Architecture',
        'Contact Details:': 'Digital Operations',
        'Product ID:': 'APM-DD-SUA-' + version
      }, opts.fields || {}),
      versionRows: opts.versionRows });

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

  const src = opts.commentsSource || 'designs/standard-user-avd/history/APM_Detail_Design_Standard_User_AVD_V1.2-reviewed.docx';
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

  // Each thread is anchored to the run holding its marker. Markers are chosen to be stable
  // across content edits and to sit in a single run.
  const threads = opts.threads || [
    { ids: [14, 15],     marker: 'Golden image build and versioning through Azure Compute Gallery' },
    { ids: [26, 27],     marker: 'Print from a session to printers at an APM site' },
    { ids: [46, 47],     marker: 'ASD Windows Hardening Guidelines' },
    { ids: [50, 51],     marker: 'CA-202 - Org Users - Azure Virtual Desktop - Allow - Require MFA' },
    { ids: [52, 53, 54], marker: 'auea-vnet-avd-ctrl-002' },
    { ids: [63],         marker: '5.3.2 Address plan' },
    { ids: [70],         marker: 'auea-nsg-avd-ctrl-avdpe-002' },
    { ids: [128],        marker: 'aus-sub-dev-controlled-001' }
  ];
  const built = await unzip(outPath);
  const byName = Object.fromEntries(built.map(p => [p.name, p]));
  let doc = td.decode(byName['word/document.xml'].bytes);
  const placed = [];
  for (const t of threads) {
    const idx = doc.indexOf(t.marker);
    if (idx < 0) throw new Error('comment anchor not found: ' + t.marker.slice(0, 60));
    const rs = Math.max(doc.lastIndexOf('<w:r>', idx), doc.lastIndexOf('<w:r ', idx));
    const re = doc.indexOf('</w:r>', idx) + 6;
    if (rs < 0 || re < rs) throw new Error('run boundary not found for: ' + t.marker.slice(0, 60));
    const starts = t.ids.map(id => '<w:commentRangeStart w:id="' + id + '"/>').join('');
    const ends = t.ids.map(id => '<w:commentRangeEnd w:id="' + id + '"/><w:r><w:commentReference w:id="' + id + '"/></w:r>').join('');
    doc = doc.slice(0, rs) + starts + doc.slice(rs, re) + ends + doc.slice(re);
    placed.push(t.ids.join('/'));
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

  const crcTable = (() => { const t = new Int32Array(256); for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[i] = c; } return t; })();
  const crc32 = b => { let c = -1; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  let size = 22 + 4096; for (const p of all) size += 76 + 2 * p.name.length + p.bytes.length;
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
  log('rebuilt with comments:', outPath, pos, 'bytes,', all.length, 'parts, threads anchored:', placed.join('  '));
  return outPath;
}
