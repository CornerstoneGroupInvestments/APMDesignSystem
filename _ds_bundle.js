/* @ds-bundle: {"format":4,"namespace":"APMDesignSystem_4c9b4b","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"}],"sourceHashes":{"change-requests/build-docx.js":"4a1fce9d8a1c","components/core/Badge.jsx":"88261dc6d1bd","components/core/Button.jsx":"4e83e092464d","components/core/Card.jsx":"40235fc87ccb","components/core/IconButton.jsx":"5c5edd6b80fb","components/feedback/Alert.jsx":"186f4a8c2db9","components/forms/Input.jsx":"5de2d012f53f","designs/participant-device/config/check-assigned-access.js":"843c3d7a575c","designs/participant-device/doc-page.js":"f52ae9c02fca","designs/participant-device/rebuild-with-comments.js":"9471bfe73693","designs/standard-user-avd/rebuild-with-comments.js":"1b3c4c8ff62e","exports/es-participant-kiosk/designs/participant-device/config/check-assigned-access.js":"d6b288318490","exports/es-participant-kiosk/designs/participant-device/doc-page.js":"f52ae9c02fca","exports/es-participant-kiosk/designs/participant-device/rebuild-with-comments.js":"02c80044686a","exports/es-participant-kiosk/policies/ca-policies.js":"c904af7bdeaf","exports/es-participant-kiosk/policies/environment-config.js":"5bc6bc2ed182","exports/es-participant-kiosk/templates/detailed-design-v2/authoring/consistency-check.js":"e2a29cd91e4a","exports/es-participant-kiosk/templates/detailed-design-v2/authoring/docx-builder.js":"e9464148e148","exports/es-participant-kiosk/templates/detailed-design-v2/authoring/qa-checks.js":"cf5b41da00cd","exports/es-participant-kiosk/templates/detailed-design/authoring/qa-checks.js":"cf5b41da00cd","exports/standard-user-avd/policies/ca-policies.js":"c904af7bdeaf","exports/standard-user-avd/policies/compliance-rules.js":"f34e43bd6f36","exports/standard-user-avd/policies/environment-config.js":"5bc6bc2ed182","exports/standard-user-avd/templates/detailed-design-v2/authoring/consistency-check.js":"fc515a575f86","exports/standard-user-avd/templates/detailed-design-v2/authoring/docx-builder.js":"451c7f98fc51","exports/standard-user-avd/templates/detailed-design-v2/authoring/qa-checks.js":"cf5b41da00cd","exports/standard-user-avd/templates/detailed-design/authoring/docx-to-dsl.js":"232d9cc960b4","exports/standard-user-avd/templates/detailed-design/authoring/qa-checks.js":"cf5b41da00cd","policies/ca-analysis-data.js":"2cae3a14d2bb","policies/ca-policies.js":"c904af7bdeaf","policies/compliance-check.js":"9e56b4393f63","policies/compliance-rules.js":"f34e43bd6f36","policies/environment-config.js":"5bc6bc2ed182","policies/policy-data.js":"4355346a7f2e","program/doc-page.js":"f106e1b77ea0","program/program-data.js":"fff31b40b881","program/program_workbook_data.js":"97fbf84b5335","ui_kits/participant-kiosk/Icons.jsx":"82830ddbdf7c","ui_kits/participant-kiosk/KioskHome.jsx":"bf5bc61fcd9a","ui_kits/participant-kiosk/KioskScreens.jsx":"594387805acc","ui_kits/participant-kiosk/bookmarks.js":"e9515de27099"},"inlinedExternals":[],"unexposedExports":[{"name":"buildChangeRequestDocx","sourcePath":"change-requests/build-docx.js"},{"name":"buildDocx","sourcePath":"exports/es-participant-kiosk/templates/detailed-design-v2/authoring/docx-builder.js"},{"name":"checkAssignedAccess","sourcePath":"designs/participant-device/config/check-assigned-access.js"},{"name":"checkKioskAssignedAccess","sourcePath":"exports/es-participant-kiosk/designs/participant-device/config/check-assigned-access.js"},{"name":"docxToDsl","sourcePath":"exports/standard-user-avd/templates/detailed-design/authoring/docx-to-dsl.js"},{"name":"markdownToBodyXml","sourcePath":"change-requests/build-docx.js"},{"name":"parse","sourcePath":"exports/es-participant-kiosk/templates/detailed-design-v2/authoring/consistency-check.js"},{"name":"rebuildKioskDocWithComments","sourcePath":"exports/es-participant-kiosk/designs/participant-device/rebuild-with-comments.js"},{"name":"rebuildParticipantKioskDoc","sourcePath":"designs/participant-device/rebuild-with-comments.js"},{"name":"rebuildStandardUserAvdDoc","sourcePath":"designs/standard-user-avd/rebuild-with-comments.js"},{"name":"sanitise","sourcePath":"exports/standard-user-avd/templates/detailed-design/authoring/docx-to-dsl.js"},{"name":"scan","sourcePath":"exports/es-participant-kiosk/templates/detailed-design-v2/authoring/consistency-check.js"},{"name":"unzipDocx","sourcePath":"exports/standard-user-avd/templates/detailed-design/authoring/docx-to-dsl.js"}]} */

(() => {

const __ds_ns = (window.APMDesignSystem_4c9b4b = window.APMDesignSystem_4c9b4b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// change-requests/build-docx.js
try { (() => {
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

const NAVY = '1F2D58',
  NAVY60 = '5A668C',
  RULE = 'C9D0E0';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function parseInline(text) {
  const out = [];
  let last = 0;
  const re = /(\*\*.+?\*\*|`.+?`|\*.+?\*)/g;
  let m;
  while (m = re.exec(text)) {
    if (m.index > last) out.push({
      t: text.slice(last, m.index)
    });
    const tok = m[0];
    if (tok.startsWith('**')) out.push({
      t: tok.slice(2, -2),
      bold: true
    });else if (tok.startsWith('`')) out.push({
      t: tok.slice(1, -1),
      mono: true
    });else out.push({
      t: tok.slice(1, -1),
      italic: true
    });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({
    t: text.slice(last)
  });
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
  const runs = (text === '' ? [{
    t: ''
  }] : parseInline(text)).map(s => runXml(s, opts.runExtra)).join('');
  return `<w:p>${pPr.length ? '<w:pPr>' + pPr.join('') + '</w:pPr>' : ''}${runs}</w:p>`;
}
function cellXml(text, opts) {
  opts = opts || {};
  const shade = opts.header ? `<w:shd w:val="clear" w:fill="E7EAF2"/>` : '';
  const width = opts.width ? `<w:tcW w:w="${opts.width}" w:type="dxa"/>` : '<w:tcW w:w="0" w:type="auto"/>';
  const segs = parseInline(text);
  const p = `<w:p>${segs.map(s => runXml(opts.header ? Object.assign({}, s, {
    bold: true
  }) : s)).join('')}</w:p>`;
  return `<w:tc><w:tcPr>${width}${shade}<w:vAlign w:val="top"/></w:tcPr>${p}</w:tc>`;
}
function tableXml(rows) {
  const cols = rows[0].length;
  const total = 9350,
    base = Math.floor(total / cols);
  const widths = new Array(cols).fill(base);
  const grid = widths.map(w => `<w:gridCol w:w="${w}"/>`).join('');
  const borders = '<w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(s => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="${RULE}"/>`).join('') + '</w:tblBorders>';
  const trs = rows.map((r, ri) => '<w:tr>' + r.map((c, ci) => cellXml(c, {
    header: ri === 0,
    width: widths[ci]
  })).join('') + '</w:tr>').join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="${total}" w:type="dxa"/>${borders}<w:tblLook w:val="04A0"/></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${trs}</w:tbl>`;
}
function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map(c => c.trim());
}
function markdownToBodyXml(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  const body = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      body.push(`<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="${RULE}"/></w:pBdr><w:spacing w:after="240"/></w:pPr></w:p>`);
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      body.push(paraXml(line.slice(2), {
        style: 'Title'
      }));
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      body.push(paraXml(line.slice(3), {
        style: 'Heading1'
      }));
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      body.push(paraXml(line.slice(4), {
        style: 'Heading2'
      }));
      i++;
      continue;
    }
    if (line.trim().startsWith('|')) {
      const tbl = [];
      let j = i;
      tbl.push(splitRow(lines[j]));
      j++;
      if (j < lines.length && /^\s*\|?[\s:-]+\|/.test(lines[j])) j++;
      while (j < lines.length && lines[j].trim().startsWith('|')) {
        tbl.push(splitRow(lines[j]));
        j++;
      }
      body.push(tableXml(tbl));
      body.push(paraXml('', {
        spaceAfter: 160
      }));
      i = j;
      continue;
    }
    if (/^-\s+/.test(line)) {
      body.push(paraXml('\u2022  ' + line.replace(/^-\s+/, ''), {
        indent: 360,
        hanging: 360,
        spaceAfter: 60
      }));
      i++;
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      body.push(paraXml(line, {
        indent: 360,
        hanging: 360,
        spaceAfter: 60
      }));
      i++;
      continue;
    }
    body.push(paraXml(line, {
      spaceAfter: 120
    }));
    i++;
  }
  return body.join('');
}
async function buildChangeRequestDocx(helpers, mdPath, outPath, opts) {
  opts = opts || {};
  const {
    readFile,
    saveFile
  } = helpers;
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
  const files = [['[Content_Types].xml', contentTypes], ['_rels/.rels', rootRels], ['docProps/core.xml', core], ['docProps/app.xml', app], ['word/document.xml', document], ['word/styles.xml', styles], ['word/_rels/document.xml.rels', docRels]].map(([name, xml]) => ({
    name,
    bytes: te.encode(xml)
  }));
  const crcTable = (() => {
    const t = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  const crc32 = b => {
    let c = -1;
    for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xFF] ^ c >>> 8;
    return (c ^ -1) >>> 0;
  };
  let size = 22 + 1024;
  for (const f of files) size += 76 + 2 * f.name.length + f.bytes.length;
  const out = new Uint8Array(size);
  const ov = new DataView(out.buffer);
  let pos = 0;
  const central = [];
  for (const f of files) {
    const nb = te.encode(f.name),
      crc = crc32(f.bytes);
    central.push({
      nb,
      crc,
      size: f.bytes.length,
      off: pos
    });
    ov.setUint32(pos, 0x04034b50, true);
    ov.setUint16(pos + 4, 20, true);
    ov.setUint32(pos + 14, crc, true);
    ov.setUint32(pos + 18, f.bytes.length, true);
    ov.setUint32(pos + 22, f.bytes.length, true);
    ov.setUint16(pos + 26, nb.length, true);
    out.set(nb, pos + 30);
    out.set(f.bytes, pos + 30 + nb.length);
    pos += 30 + nb.length + f.bytes.length;
  }
  const cdStart = pos;
  for (const c of central) {
    ov.setUint32(pos, 0x02014b50, true);
    ov.setUint16(pos + 4, 20, true);
    ov.setUint16(pos + 6, 20, true);
    ov.setUint32(pos + 16, c.crc, true);
    ov.setUint32(pos + 20, c.size, true);
    ov.setUint32(pos + 24, c.size, true);
    ov.setUint16(pos + 28, c.nb.length, true);
    ov.setUint32(pos + 42, c.off, true);
    out.set(c.nb, pos + 46);
    pos += 46 + c.nb.length;
  }
  ov.setUint32(pos, 0x06054b50, true);
  ov.setUint16(pos + 8, central.length, true);
  ov.setUint16(pos + 10, central.length, true);
  ov.setUint32(pos + 12, pos - cdStart, true);
  ov.setUint32(pos + 16, cdStart, true);
  pos += 22;
  await saveFile(outPath, new Blob([out.slice(0, pos)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }));
  return outPath;
}
Object.assign(__ds_scope, { markdownToBodyXml, buildChangeRequestDocx });
})(); } catch (e) { __ds_ns.__errors.push({ path: "change-requests/build-docx.js", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  neutral: {
    bg: 'var(--neutral-100)',
    fg: 'var(--neutral-700)',
    dot: 'var(--neutral-500)'
  },
  brand: {
    bg: 'var(--apm-orange-50)',
    fg: 'var(--apm-orange-800)',
    dot: 'var(--apm-orange-500)'
  },
  navy: {
    bg: 'var(--apm-navy-50)',
    fg: 'var(--apm-navy-700)',
    dot: 'var(--apm-navy-600)'
  },
  success: {
    bg: 'var(--status-success-bg)',
    fg: 'var(--status-success)',
    dot: 'var(--status-success)'
  },
  warning: {
    bg: 'var(--status-warning-bg)',
    fg: '#9A6206',
    dot: 'var(--status-warning)'
  },
  danger: {
    bg: 'var(--status-danger-bg)',
    fg: 'var(--status-danger)',
    dot: 'var(--status-danger)'
  },
  info: {
    bg: 'var(--status-info-bg)',
    fg: 'var(--status-info)',
    dot: 'var(--status-info)'
  }
};

/**
 * Small status / category label.
 */
function Badge({
  tone = 'neutral',
  dot = false,
  children,
  style = {},
  ...rest
}) {
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 24,
      padding: '0 10px',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-bold)',
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: t.fg,
      background: t.bg,
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: t.dot
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: {
    fontSize: 'var(--text-sm)',
    padding: '0 14px',
    height: 36,
    gap: 6
  },
  md: {
    fontSize: 'var(--text-base)',
    padding: '0 20px',
    height: 44,
    gap: 8
  },
  lg: {
    fontSize: 'var(--text-md)',
    padding: '0 28px',
    height: 52,
    gap: 10
  }
};
const palette = {
  primary: {
    background: 'var(--brand-primary)',
    color: 'var(--brand-on-primary)',
    border: '1px solid transparent',
    hoverBg: 'var(--brand-primary-hover)',
    activeBg: 'var(--brand-primary-active)'
  },
  secondary: {
    background: 'var(--surface-card)',
    color: 'var(--brand-dark)',
    border: '1.5px solid var(--brand-dark)',
    hoverBg: 'var(--apm-navy-50)',
    activeBg: 'var(--neutral-100)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--brand-dark)',
    border: '1px solid transparent',
    hoverBg: 'var(--apm-navy-50)',
    activeBg: 'var(--neutral-100)'
  },
  danger: {
    background: 'var(--status-danger)',
    color: '#fff',
    border: '1px solid transparent',
    hoverBg: '#BC2F2F',
    activeBg: '#A52929'
  }
};

/**
 * APM primary action button. Pill-shaped, brand orange by default.
 */
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  leadingIcon = null,
  trailingIcon = null,
  children,
  style = {},
  ...rest
}) {
  const s = sizes[size] || sizes.md;
  const p = palette[variant] || palette.primary;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const bg = disabled ? 'var(--neutral-200)' : active ? p.activeBg : hover ? p.hoverBg : p.background;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      fontFamily: 'var(--font-ui)',
      fontSize: s.fontSize,
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1,
      background: bg,
      color: disabled ? 'var(--text-subtle)' : p.color,
      border: disabled ? '1px solid transparent' : p.border,
      borderRadius: 'var(--radius-pill)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: fullWidth ? '100%' : 'auto',
      transition: 'background var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
      transform: active && !disabled ? 'scale(0.98)' : 'scale(1)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), leadingIcon, children, trailingIcon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Surface container with soft elevation. Optional interactive hover lift.
 */
function Card({
  interactive = false,
  padding = 'var(--space-6)',
  elevation = 'sm',
  children,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const shadow = {
    none: 'none',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding,
      boxShadow: interactive && hover ? 'var(--shadow-lg)' : shadow[elevation],
      transition: 'box-shadow var(--duration-base) var(--ease-standard), transform var(--duration-base) var(--ease-standard)',
      transform: interactive && hover ? 'translateY(-2px)' : 'none',
      cursor: interactive ? 'pointer' : 'default',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: 32,
  md: 40,
  lg: 48
};

/**
 * Square icon-only button. Pass an SVG/icon node as children.
 */
function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const dim = sizes[size] || sizes.md;
  const filled = variant === 'filled';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      background: filled ? hover ? 'var(--brand-primary-hover)' : 'var(--brand-primary)' : hover ? 'var(--apm-navy-50)' : 'transparent',
      color: filled ? 'var(--brand-on-primary)' : 'var(--brand-dark)',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'background var(--duration-fast) var(--ease-standard)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  info: {
    bar: 'var(--status-info)',
    bg: 'var(--status-info-bg)',
    fg: 'var(--apm-navy-700)'
  },
  success: {
    bar: 'var(--status-success)',
    bg: 'var(--status-success-bg)',
    fg: 'var(--apm-navy-700)'
  },
  warning: {
    bar: 'var(--status-warning)',
    bg: 'var(--status-warning-bg)',
    fg: 'var(--apm-navy-700)'
  },
  danger: {
    bar: 'var(--status-danger)',
    bg: 'var(--status-danger-bg)',
    fg: 'var(--apm-navy-700)'
  }
};

/**
 * Inline notice banner with a leading status bar. Use for kiosk notices
 * (e.g. the data-wipe warning) and form-level messages.
 */
function Alert({
  tone = 'info',
  title,
  icon = null,
  children,
  style = {},
  ...rest
}) {
  const t = tones[tone] || tones.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: 'flex',
      gap: 12,
      padding: '14px 16px',
      background: t.bg,
      borderRadius: 'var(--radius-md)',
      borderLeft: `4px solid ${t.bar}`,
      fontFamily: 'var(--font-ui)',
      color: t.fg,
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      color: t.bar,
      flexShrink: 0,
      marginTop: 1
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, title && /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 'var(--text-base)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--text-strong)'
    }
  }, title), children && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-normal)'
    }
  }, children)));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Text input with label, helper, and error states.
 */
function Input({
  label,
  helper,
  error,
  leadingIcon = null,
  size = 'md',
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const h = size === 'lg' ? 52 : size === 'sm' ? 38 : 46;
  const borderColor = error ? 'var(--status-danger)' : focus ? 'var(--brand-primary)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-ui)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-strong)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: h,
      padding: '0 14px',
      background: 'var(--surface-card)',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--ring-focus)' : 'none',
      transition: 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)'
    }
  }, leadingIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      color: 'var(--text-muted)'
    }
  }, leadingIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-body)',
      minWidth: 0
    }
  }, rest))), (helper || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: error ? 'var(--status-danger)' : 'var(--text-muted)'
    }
  }, error || helper));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// designs/participant-device/config/check-assigned-access.js
try { (() => {
// Assigned Access consistency and schema-constraint checker.
// Two copies of the Participant Kiosk configuration exist by necessity: the canonical
// file, and the here-string inside the remediation (an Intune remediation is a single
// pasted script and cannot read a sibling file at runtime). They have already drifted
// apart once, silently, with different namespace prefixes on the same element. This
// checker is what stops that recurring.
//
// Usage in run_script:
//   const src = await readFile('designs/participant-device/config/check-assigned-access.js');
//   const { checkAssignedAccess } = await import(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
//   const r = checkAssignedAccess({ xml: await readFile(xmlPath), script: await readFile(ps1Path) });
//   if (!r.ok) throw new Error(r.failures.join('\n'));
//
// Every rule below traces to Microsoft Learn: the Assigned Access XSD, "Create an
// Assigned Access configuration file", "Assigned Access recommendations", or the
// AssignedAccess CSP reference.

const NS = {
  d: 'http://schemas.microsoft.com/AssignedAccess/2017/config',
  rs5: 'http://schemas.microsoft.com/AssignedAccess/201810/config',
  v3: 'http://schemas.microsoft.com/AssignedAccess/2020/config',
  v4: 'http://schemas.microsoft.com/AssignedAccess/2021/config',
  v5: 'http://schemas.microsoft.com/AssignedAccess/2022/config'
};

// Order is fixed by profile_t in the XSD. StartLayout and StartPins are alternatives
// on Windows 11; TaskbarLayout is schema-legal but unsupported in a restricted user
// experience, so it is treated as a failure here rather than a warning.
const ORDER = ['AllAppsList', 'rs5:FileExplorerNamespaceRestrictions', 'StartLayout', 'v5:StartPins', 'Taskbar', 'v5:TaskbarLayout'];
function parse(text, label, failures) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const err = doc.querySelector('parsererror');
  if (err) {
    failures.push(`${label}: not well-formed XML - ${err.textContent.slice(0, 160)}`);
    return null;
  }
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
  if (!/^\{[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}\}$/.test(id)) failures.push(`${label}: Profile Id "${id}" does not match the schema's guid_t pattern`);
  const dp = g(NS.d, 'DefaultProfile')[0];
  if (!dp) failures.push(`${label}: no DefaultProfile element`);else if (dp.getAttribute('Id') !== id) failures.push(`${label}: DefaultProfile Id "${dp.getAttribute('Id')}" does not match Profile Id "${id}"`);
  if (!prof.getAttribute('Name')) warnings.push(`${label}: Profile has no Name attribute. The CSP Status node reports profileId only, so a Name makes a failure legible`);

  // element order and membership
  const kids = [...prof.children].map(c => (c.namespaceURI === NS.d ? '' : c.prefix + ':') + c.localName);
  let last = -1;
  for (const k of kids) {
    const i = ORDER.indexOf(k);
    if (i < 0) {
      failures.push(`${label}: "${k}" is not a legal child of Profile`);
      continue;
    }
    if (i < last) failures.push(`${label}: "${k}" is out of schema order. Required order: ${ORDER.join(', ')}`);
    last = i;
  }
  if (!kids.includes('AllAppsList')) failures.push(`${label}: AllAppsList is mandatory for a restricted user experience`);
  if (!kids.includes('Taskbar')) failures.push(`${label}: Taskbar is mandatory (minOccurs=1 in profile_t)`);
  if (!kids.includes('v5:StartPins') && !kids.includes('StartLayout')) failures.push(`${label}: a restricted user experience profile must define the Start layout`);

  // Taskbar pinning is not supported in a restricted user experience
  if (g(NS.v5, 'TaskbarLayout').length || g(NS.d, 'TaskbarLayout').length) failures.push(`${label}: TaskbarLayout is present. Taskbar pinning is not supported in a restricted user experience; only ShowTaskbar is`);

  // an unprefixed element that only exists in an add-on namespace
  for (const n of ['StartPins', 'TaskbarLayout', 'FileExplorerNamespaceRestrictions', 'AllowedNamespace', 'AllowRemovableDrives', 'NoRestriction']) if (g(NS.d, n).length) failures.push(`${label}: <${n}> is in the default 2017 namespace, where it does not exist. It needs its version prefix`);

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
    if (g(NS.v3, 'NoRestriction').length && (an.length || g(NS.v3, 'AllowRemovableDrives').length)) failures.push(`${label}: NoRestriction is mutually exclusive with AllowedNamespace and AllowRemovableDrives (xs:choice)`);
  }

  // apps
  const apps = g(NS.d, 'App');
  const paths = apps.map(a => a.getAttribute('DesktopAppPath')).filter(Boolean);
  const aumids = apps.map(a => a.getAttribute('AppUserModelId')).filter(Boolean);
  for (const a of apps) {
    if (a.getAttribute('DesktopAppPath') && a.getAttribute('AppUserModelId')) failures.push(`${label}: an App element sets both DesktopAppPath and AppUserModelId. They are mutually exclusive`);
  }
  const seen = new Set();
  for (const v of paths.concat(aumids)) {
    if (seen.has(v)) failures.push(`${label}: duplicate app "${v}". Violates the ForbidDupApps unique constraint`);
    seen.add(v);
  }
  const autoLaunch = apps.filter(a => a.getAttributeNS(NS.rs5, 'AutoLaunch') === 'true');
  if (autoLaunch.length > 1) failures.push(`${label}: ${autoLaunch.length} apps set rs5:AutoLaunch. Only one app can autolaunch`);
  // AppLocker's executable rule collection covers .exe and .com. Pass 3 read that as meaning a
  // dependency with any other extension could not be helped by listing it here, and removed
  // soffice.bin on that basis. Pass 12 overturned it: Microsoft documents that a dependency
  // must appear in the allowed-app list, and there is a field report of AppLocker blocking
  // soffice.bin specifically. An inference from the extension list does not outrank the
  // documented instruction, so this is a warning now, not a failure.
  for (const v of paths) if (!/\.(exe|com)$/i.test(v)) warnings.push(`${label}: "${v}" is not a .exe or .com, so AppLocker's executable rule collection cannot evaluate it. Listed deliberately as a documented dependency (see research-libreoffice-kiosk.md); confirm rule generation still succeeds on a reference device`);
  if (paths.some(v => /\\explorer\.exe$/i.test(v)) === false && paths.length) warnings.push(`${label}: explorer.exe is not allowed, so File Explorer cannot be granted at all`);

  // Start pins. A pin that cannot resolve is dropped from Start with no error anywhere, so
  // a wrong path is invisible until someone looks at the Start menu of a built device.
  // These two were shipped wrong and confirmed on hardware: the LibreOffice shortcuts sit in
  // a LibreOffice subfolder, and the accessibility shortcuts are per-user, not all-users.
  const pins = [];
  for (const sp of g(NS.v5, 'StartPins')) for (const m of sp.textContent.matchAll(/"desktopAppLink"\s*:\s*"([^"]+)"/g)) pins.push(m[1].replace(/\\\\/g, '\\'));
  for (const p of pins) {
    if (/Accessibility\\/i.test(p) && /%ALLUSERSPROFILE%/i.test(p)) failures.push(`${label}: pin "${p}" - the accessibility shortcuts live in the per-user Start Menu, so this must be %APPDATA%, not %ALLUSERSPROFILE%`);
    if (/Voice Access\.lnk/i.test(p)) failures.push(`${label}: pin "${p}" - the shortcut is named VoiceAccess.lnk, with no space`);
    if (/Programs\\LibreOffice [A-Za-z]+\.lnk/i.test(p)) failures.push(`${label}: pin "${p}" - the LibreOffice shortcuts sit in a LibreOffice subfolder: ...\\Programs\\LibreOffice\\LibreOffice <app>.lnk`);
    if (!/\.lnk$/i.test(p)) failures.push(`${label}: pin "${p}" - desktopAppLink expects a shortcut, not an executable`);
  }
  if (pins.length === 0 && kids.includes('v5:StartPins')) warnings.push(`${label}: StartPins is present but contains no desktopAppLink entries`);

  // account form
  const acct = g(NS.d, 'Account')[0];
  const grp = g(NS.d, 'UserGroup')[0],
    auto = g(NS.d, 'AutoLogonAccount')[0];
  if (!acct && !grp && !auto) failures.push(`${label}: Config has no Account, UserGroup or AutoLogonAccount`);
  if (acct) {
    const v = acct.textContent.trim();
    // documented local forms: devicename\user, .\user, or bare user
    const local = /^(\.\\)?[^\\]+$/.test(v) || /^[^\\]+\\[^\\]+$/.test(v);
    if (!local) failures.push(`${label}: Account "${v}" is not a documented form (devicename\\user, .\\user, user, domain\\samAccountName, or AzureAD\\UPN)`);
    const sam = v.replace(/^.*\\/, '');
    if (sam.length > 20) failures.push(`${label}: account name "${sam}" is ${sam.length} characters. The SAM account name limit is 20`);
    if (/[\\/:*?"<>|\[\]]/.test(sam) && !/\[SERIAL\]/.test(sam)) failures.push(`${label}: account name "${sam}" contains a character not legal in a local account name`);
  }
  return {
    paths,
    aumids,
    order: kids,
    pins,
    account: acct ? acct.textContent.trim() : null
  };
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
const CAP_RE = /if \(\$serial\.Length -gt 14\) \{ \$serial = \$serial\.Substring\(0, 14\) \}/;

// Cmdlet parameters with a hard length limit. New-LocalUser -Description throws above 48
// characters, and the failure is a validation error at run time that no XML or schema check
// can see. Found on a test machine, not in review.
const ARG_LIMITS = [{
  re: /-Description\s+'([^']*)'/g,
  max: 48,
  what: 'New-LocalUser -Description'
}, {
  re: /\$desc\s*=\s*'([^']*)'/g,
  max: 48,
  what: 'New-LocalUser -Description (assigned to $desc)'
}, {
  re: /-FullName\s+'([^']*)'/g,
  max: 256,
  what: 'New-LocalUser -FullName'
}, {
  re: /-Name\s+"(Kiosk-[^"]*)"/g,
  max: 20,
  what: 'local account name'
}];
function checkDerivation(label, text, failures) {
  if (!SERIAL_RE.test(text)) failures.push(`${label}: BIOS serial derivation does not match the other scripts`);
  if (!PREFIX_RE.test(text)) failures.push(`${label}: account name prefix does not match the other scripts`);
  if (!CAP_RE.test(text)) failures.push(`${label}: missing or altered serial cap. The serial must be capped at 14 characters before the name is built, so "Kiosk-" plus the serial fits the 20-character SAM limit`);
  for (const {
    re,
    max,
    what
  } of ARG_LIMITS) {
    for (const m of text.matchAll(new RegExp(re.source, 'g'))) if (m[1].length > max) failures.push(`${label}: ${what} is ${m[1].length} characters, limit ${max}. PowerShell throws a parameter validation error at run time - "${m[1].slice(0, 40)}..."`);
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
    if (isPm && /(exit 1|\$blockers\s*\+=|Write-Output)/.test(m[3])) failures.push(`${label}: a PolicyManager blocker is gated on Test-Path ${m[1]}, which tests the KEY. The key exists on every device whether or not the policy is configured, so this reports a blocker permanently - read the specific values instead`);
  }
  if (/DeviceLock/.test(text) && !/DevicePasswordEnabled/.test(text)) failures.push(`${label}: DeviceLock is checked without reading DevicePasswordEnabled. That value is inverted (0 means a password IS required) and is the setting that actually disables automatic logon`);
}
function checkAssignedAccess({
  xml,
  script,
  purge,
  detect
}) {
  const failures = [],
    warnings = [],
    notes = [];
  const xdoc = parse(xml, 'canonical XML', failures);
  const xr = xdoc ? checkOne(xdoc, 'canonical XML', failures, warnings) : null;
  let sr = null;
  if (script) {
    const m = script.match(/\$aaXml = @"\r?\n([\s\S]*?)\r?\n"@/);
    if (!m) failures.push('remediation script: could not find the $aaXml here-string');else {
      // The remediation expands paths and discovers LibreOffice dependencies on the device,
      // so the here-string holds variables where the canonical file holds literal values.
      // Substitute the same values the standard build produces, so the drift comparison is
      // still meaningful. Longest names first: a bare /\$pf/ would match inside $pf86.
      const depLines = '    <App DesktopAppPath="C:\\Program Files\\LibreOffice\\program\\LanguageToolLO.dll" />\n' + '    <App DesktopAppPath="C:\\Program Files\\LibreOffice\\program\\python-core-3.12.13\\lib\\select.pyd" />\n' + '    <App DesktopAppPath="C:\\Program Files\\LibreOffice\\program\\python-core-3.12.13\\lib\\_socket.pyd" />\n';
      const sub = m[1].replace(/\$profileId\b/g, '{4B1E9A0C-6D7F-4A31-9C52-8E0A73B5D411}').replace(/\$depApps\b/g, depLines).replace(/\$pf86\b/g, 'C:\\Program Files (x86)').replace(/\$pf\b/g, 'C:\\Program Files').replace(/\$lo\b/g, 'C:\\Program Files\\LibreOffice\\program').replace(/\$sr\b/g, 'C:\\WINDOWS').replace(/\$user\b/g, 'Kiosk-TESTSER1');
      const sdoc = parse(sub, 'script here-string', failures);
      if (sdoc) sr = checkOne(sdoc, 'script here-string', failures, warnings);
    }

    // Winlogon autologon rules, from "Assigned Access recommendations"
    if (/Set-ItemProperty[^\n]*-Name\s+DefaultDomainName/.test(script)) failures.push('remediation script: DefaultDomainName is set. Microsoft states that for a local account this key must not be added');
    if (!/AutoAdminLogon/.test(script)) failures.push('remediation script: AutoAdminLogon is never set, so the device will not sign itself in');
    if (/Set-ItemProperty[^\n]*-Name\s+DefaultPassword/.test(script)) failures.push('remediation script: writes a cleartext DefaultPassword registry value');
    if (!/PasswordNeverExpires|AccountNeverExpires/.test(script)) warnings.push('remediation script: the session account password can expire, which black-screens an autologon device');

    // the defect class that shipped: two statements collapsed onto one line
    script.split('\n').forEach((l, i) => {
      const code = l.replace(/#.*$/, '');
      if (/-(Type|Value|Name|Force)\s+[A-Za-z0-9_'"$]*(Set|Get|New|Remove|Add|Enable|Disable|Register|Write)-[A-Za-z]+/.test(code)) failures.push(`remediation script line ${i + 1}: two statements on one line, missing a newline - ${l.trim().slice(0, 90)}`);
    });
  }

  // the three scripts that derive the account name must derive it identically
  const derivers = [['remediation script', script], ['detection script', detect], ['purge script', purge]].filter(d => d[1]);
  for (const [label, text] of derivers) checkDerivation(label, text, failures);
  if (derivers.length < 3) notes.push(`Account-name derivation checked in ${derivers.length} of 3 scripts. Pass detect and purge to check all three.`);

  // Every script that reads a policy blocker gets the same guards. Running these on the
  // remediation alone was itself the bug: the identical key-existence defect sat in the
  // detection script and passed clean.
  for (const [label, text] of [['remediation script', script], ['detection script', detect]].filter(d => d[1])) checkPolicyBlockerLogic(label, text, failures);

  // the purge script must reassert autologon, and must never invent a credential
  if (purge) {
    if (!/-Name DefaultUserName/.test(purge)) failures.push('purge script: does not reassert DefaultUserName. An interactive console sign-in leaves the kiosk unable to sign itself in until the next remediation run');
    if (!/Get-LocalUser -Name \$user/.test(purge)) failures.push('purge script: reasserts autologon without confirming the account exists, which can point autologon at a missing account');
    if (/LsaSecret|Set-LocalUser|New-LocalUser|-Password/.test(purge)) failures.push('purge script: touches credentials. It runs at shutdown and must only reassert the account name');
    if (/Set-ItemProperty[^\n]*-Name\s+DefaultDomainName/.test(purge)) failures.push('purge script: sets DefaultDomainName, which must not be set for a local account');
    if (!/exit 0/.test(purge)) failures.push('purge script: must always exit 0 so it cannot block shutdown');
  }

  // drift between the two copies
  if (xr && sr) {
    if (JSON.stringify(xr.paths) !== JSON.stringify(sr.paths)) failures.push('DRIFT: the allowed-app lists differ between the canonical XML and the script here-string');
    if (JSON.stringify(xr.aumids) !== JSON.stringify(sr.aumids)) failures.push('DRIFT: the AUMID lists differ between the two copies');
    if (JSON.stringify(xr.order) !== JSON.stringify(sr.order)) failures.push(`DRIFT: the Profile element structure differs. XML: ${xr.order.join(',')} | script: ${sr.order.join(',')}`);
    if (JSON.stringify(xr.pins) !== JSON.stringify(sr.pins)) failures.push('DRIFT: the Start pin lists differ between the canonical XML and the script here-string');
    const strip = a => (a || '').replace(/Kiosk-[A-Za-z0-9\[\]]+/, 'Kiosk-*');
    if (strip(xr.account) !== strip(sr.account)) failures.push(`DRIFT: the Account form differs. XML: ${xr.account} | script: ${sr.account}`);
    notes.push(`Both copies allow ${xr.paths.length} desktop apps and ${xr.aumids.length} packaged apps, and pin ${xr.pins.length} shortcuts.`);
  }
  return {
    ok: failures.length === 0,
    failures,
    warnings,
    notes
  };
}
Object.assign(__ds_scope, { checkAssignedAccess });
})(); } catch (e) { __ds_ns.__errors.push({ path: "designs/participant-device/config/check-assigned-access.js", error: String((e && e.message) || e) }); }

// designs/participant-device/doc-page.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <doc-page> — paged-document shell for printable HTML.
 *
 * FIRST, decide how the document paginates — up front, before building:
 *
 * - FLOWING document (the default): write the whole document as one
 *   normal HTML flow inside <doc-page>; the browser's print engine
 *   splits it onto pages at export. Use for long-form documents with a
 *   single text flow: reports, memos, letters, essays.
 * - EXPLICIT pagination: a fixed set of pre-paginated pages, one
 *   <section class="page"> child per page. Use when the user asks for a
 *   specific page count, or the design implies one: a one-page resume, a
 *   two-sided flier, a poster, a certificate, a brochure — any richly
 *   laid-out document without a single text flow.
 * - If in doubt, ask the user as part of the build.
 *
 * PAGE SIZING — paper differs by country (letter vs A4), so the printed
 * sheet is not one fixed truth:
 * - FLOWING documents pin NO paper size: the print engine paginates
 *   onto the user's real paper, and the content reflows to it.
 * - EXPLICITLY PAGINATED documents print each page at a FIXED page box
 *   with overflow hidden — letter by default, size="a4" for a clearly
 *   metric user, the user's chosen paper when they export. Design each
 *   page to FILL that box, fitting letter and A4 alike without overlap.
 * - width/height pin an explicit fixed size, ONLY when the user gives
 *   one.
 * Never write your own @page rule or hard-code paper dimensions in the
 * content.
 *
 * Sizing modes (attributes):
 *   (none)                      — portrait: flowing docs use the user's
 *           paper; explicitly paginated pages use the named size box
 *           (letter unless size="a4")
 *   orientation="landscape"     — the same, landscape
 *   width / height              — explicit fixed size, ONLY when the user
 *           gives one (e.g. width="22in" height="30in" for a 22×30
 *           poster): the page IS the design's size, printed at true
 *           dimensions (or scaled onto the user's paper at print time).
 *           Any absolute CSS length: px/in/mm/cm/pt/pc.
 * The component announces the chosen mode to the host app at runtime (a
 * meta tag it injects), so the print path can inject the user's true
 * paper size.
 *
 * On screen the document renders on a desk background: a flowing
 * document as one tall scrolling sheet (Google Docs' pageless view);
 * explicitly paginated documents as one card per page.
 *
 * EXPLICIT pagination usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page>
 *     <section class="page" id="p1">…one page's design…</section>
 *     <section class="page" id="p2">…</section>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * How the page box works, concretely: each .page prints as ONE full-bleed
 * sheet at a FIXED physical size — letter by default (set size="a4" for
 * a clearly metric user), the user's chosen paper when they export —
 * with overflow hidden. Nothing scrolls and nothing reflows onto a next
 * sheet: content that misses the box is CLIPPED. Design each page to
 * FILL that page box, and to fit it — letter and A4 alike — without
 * overlap. Each page is a size container; don't size anything in
 * viewport units (they track the window, not the page), and never set
 * width or height on the .page section itself (the component sizes the
 * page box; an authored height like 100% is meaningless at print and is
 * overridden). The component owns the page box, the screen card chrome,
 * and the page breaks (never add your own break-before/after). Don't mix
 * .page sections with flowing content or header/footer slots in the same
 * document.
 *
 * FLOWING usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page margin="0.75in">
 *     <h1>Title</h1>
 *     <p>…body…</p>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * There is no manual page-splitting — the browser's print engine
 * paginates at export. Standard break-hygiene rules (`break-inside:
 * avoid` on figures, code blocks, images and table rows; `orphans/
 * widows: 3`) are applied so paragraphs and groups split cleanly. On
 * screen and at print, headings default to `text-wrap: balance` and
 * body text to `text-wrap: pretty`; the defaults have zero specificity,
 * so any text-wrap you declare wins.
 *
 * Other attributes:
 *   size    — letter | a4 | legal (default letter). Flowing documents:
 *           preview proportion only — it does NOT pin their printed
 *           paper (the print dialog's paper governs); leave it alone
 *           there. Explicitly paginated documents: it sets the page box
 *           the cards and the pinned @page share (the export dialog's
 *           choice overrides both at print) — set size="a4" for a
 *           clearly metric user. Scaled-fit: names the sheet the fit is
 *           computed against, same a4-for-metric-users advice.
 *   content-width / content-height — the design's own fixed dimensions
 *           (CSS lengths), for scaling a fixed-size design ONTO the
 *           named sheet: content lays out at exactly this size, and the
 *           component scales it to fit that sheet's printable area
 *           (centered horizontally, top-aligned; the export dialog
 *           re-fits to the user's actual paper choice where available).
 *           Both must be set; they do not change the page box. For pages
 *           WITHOUT running header/footer slots.
 *   margin  — printable inset on every page of a FLOWING document
 *           (default 0.75in); margin="0" makes pages full-bleed.
 *           Explicitly paginated pages are always full-bleed.
 *
 * Running header/footer (flowing documents only): give an element
 * `slot="header"` or `slot="footer"` and it repeats on every printed
 * page via `position: fixed`. To keep body text from sliding under it,
 * the component prints inside a single-cell table whose <thead>/<tfoot>
 * are spacers sized to the header/footer height — browsers repeat
 * thead/tfoot on every page, so each sheet's content starts below the
 * header and ends above the footer. On screen the header/footer render
 * once at the top/bottom of the sheet.
 *
 * At print the component injects `@page { margin: 0 }` (which leaves
 * Chrome no margin box to draw its date/URL/page-count header in) and
 * moves the visual margin onto the sheet's own padding. It also marks
 * the document as owning its print CSS (a
 * `meta[name="omelette-owns-print"]` it injects at runtime), so the
 * PDF export never injects page-geometry CSS of its own on top.
 *
 * Print best practices for the content you author:
 * - Multi-column text: use CSS columns (`column-count` +
 *   `column-gap`), never side-by-side flex/grid columns — only real
 *   CSS columns flow and break across pages. `column-span: all` lets
 *   a heading span the columns; `hyphens: auto` (needs `lang` on
 *   the html element) keeps narrow columns readable.
 * - Page breaks in flowing documents: `break-before: page` on an
 *   element that must start a new page (a chapter, an appendix). Add
 *   your own kept-together blocks (callouts, stat tiles, cards) to a
 *   `break-inside: avoid` rule, and keep each one shorter than a page.
 * - Extend `orphans: 3; widows: 3` to any custom text blocks you add
 *   (p and li are covered by default).
 * - Give long tables a <thead> — browsers repeat it on every printed
 *   page.
 * - No `position: fixed`/`sticky` and no viewport units in content:
 *   fixed elements stamp every printed page (running headers/footers go
 *   in the component's slots) and `100vh` mis-sizes at print.
 *
 * Author content as static HTML so the user can click-to-edit any text
 * directly. Do not set width/padding/background on the document body —
 * the component owns the sheet box.
 */
/* END USAGE */

(() => {
  const PAPER = {
    letter: ['8.5in', '11in'],
    a4: ['210mm', '297mm'],
    legal: ['8.5in', '14in']
  };
  const CSS_LENGTH = /^\d+(\.\d+)?(px|in|mm|cm|pt|pc)$/;
  // Unitless "0" is a valid CSS length and the natural way to write
  // margin="0"; normalise it to 0px so max()/calc() (which reject a bare
  // number) keep working.
  const safeLen = (v, fb) => {
    v = (v || '').trim();
    return v === '0' ? '0px' : CSS_LENGTH.test(v) ? v : fb;
  };
  // WebKit (Safari and every iOS browser shell) never repeats a table's
  // thead/tfoot on printed pages (WebKit bug 17205), so the spacer-borne
  // vertical margins of a FLOWING document reach only the first page
  // there. Engine check, not browser check: vendor is 'Apple Computer,
  // Inc.' exactly for WebKit and 'Google Inc.' for Blink.
  const WK_PRINT = /apple/i.test(navigator.vendor || '');
  // CSS length → px number (CSS absolute units are exact: 1in = 96px).
  // Returns NaN for anything safeLen would reject — callers gate on it.
  const PX_PER = {
    px: 1,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
    pt: 96 / 72,
    pc: 16
  };
  const toPx = v => {
    const m = /^(\d+(?:\.\d+)?)(px|in|mm|cm|pt|pc)$/.exec((v || '').trim());
    return m ? parseFloat(m[1]) * PX_PER[m[2]] : NaN;
  };
  const stylesheet = `
    :host {
      position: relative;
      display: block;
      /* When the viewport is narrower than the page, grow to wrap the
       * sheet (plus this padding) instead of staying viewport-width, so
       * the desk background and right margin reach the sheet's far edge
       * in the horizontal scroll. */
      min-width: max-content;
      min-height: 100vh;
      background: #f5f5f4;
      padding: 48px 24px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      --doc-page-w: 8.5in;
      --doc-page-h: 11in;
      --doc-page-margin: 0.75in;
      --doc-hdr-h: 0px;
      --doc-ftr-h: 0px;
      --doc-hdr-pad: 0px;
      --doc-ftr-pad: 0px;
    }
    .sheet {
      width: var(--doc-page-w);
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 2px 10px rgba(20, 20, 19, 0.12);
      border-radius: 7px;
      box-sizing: border-box;
      padding: var(--doc-page-margin);
    }
    .frame { width: 100%; border-collapse: collapse; }
    /* Scaled-fit mode (content-width/content-height): the inner .fit box
     * lays the content out at its authored fixed size and scales it onto
     * the printable area; .fit-box reserves the scaled footprint in flow
     * (transforms don't affect layout) and centers it. Without the mode,
     * both divs are unstyled block pass-throughs. */
    /* Explicit pagination: direct .page children are the pages. The sheet
     * becomes a transparent stack and each page carries the card look on
     * screen; at print each page is exactly one full-bleed sheet. The
     * ::slotted defaults are deliberately weak (document CSS wins), so
     * authored page styling can override any of this. */
    .sheet.paginated {
      background: transparent;
      box-shadow: none;
      border-radius: 0;
      padding: 0;
    }
    .paginated ::slotted(.page) {
      position: relative;
      display: block;
      width: 100%;
      aspect-ratio: var(--doc-page-ar);
      container-type: size;
      overflow: hidden;
      box-sizing: border-box;
      background: #fff;
      border-radius: 7px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      break-inside: avoid;
    }
    .paginated ::slotted(.page:not(:first-child)) { margin-top: 1rem; }
    @media print {
      .sheet.paginated { padding: 0; }
      /* The flowing-document vertical inset lives on the repeating
       * thead/tfoot spacers, not the sheet padding — they must go too,
       * or each full-sheet .page is pushed ~margin down and spills onto
       * a second sheet. Paginated pages are full-bleed by definition
       * (content owns its insets). */
      .sheet.paginated .hdr-space,
      .sheet.paginated .ftr-space { height: 0; }
      .paginated ::slotted(.page) {
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
        /* Physical page-box sizing, no viewport units: Safari resolves
         * 100vh against the window, not the page box, so a vh-sized card
         * paginates wrong there. --doc-page-w/h are the named size by
         * default and are overridden to the user's chosen paper by the
         * export path, so every card is exactly one sheet either way.
         * Width + height (same source values as @page size) rather than
         * width + aspect-ratio: the ratio is a 6-decimal rounding of the
         * same division, and a few millionths of overflow would spill a
         * blank sheet after every page. The screen-only aspect-ratio
         * (preview proportions) must not leak into print. cqh typography
         * tracks the same box.
         *
         * Every declaration is !important: per CSS Scoping, unimportant
         * shadow ::slotted rules LOSE to the document context, so a page
         * section's authored inline style would silently beat this print
         * geometry. A model-authored height:100% did exactly that — the
         * percentage resolves as auto in the all-auto print ancestry, the
         * base rule's size containment turns auto into ZERO, and
         * overflow:hidden then paints nothing: a blank PDF with perfect
         * page boxes. At print the component's geometry is the design's
         * whole contract, so it must win over any authored sizing. */
        aspect-ratio: auto !important;
        width: var(--doc-page-w) !important;
        height: var(--doc-page-h) !important;
        overflow: hidden !important;
      }
      .paginated ::slotted(.page:not(:first-child)) {
        break-before: page !important;
        margin-top: 0 !important;
      }
    }
    .fit-mode .fit-box {
      width: calc(var(--doc-fit-w) * var(--doc-fit-scale));
      height: calc(var(--doc-fit-h) * var(--doc-fit-scale));
      margin: 0 auto;
      break-inside: avoid;
    }
    /* Monolithic at print: Blink slices a transform-scaled child at
     * fragmentainer boundaries mapped in UNSCALED layout coordinates
     * (transforms are paint-time), so the .fit box (authored size, e.g.
     * 1400x990) gets cut at the page's free block space and spills onto
     * a second sheet even though its SCALED footprint fits the page by
     * construction. overflow:hidden makes .fit-box a scroll container —
     * monolithic under fragmentation (css-break-3) — so the scaled
     * content prints atomically on one sheet. No clipping for content
     * within the authored box: .fit-box is calc-sized to exactly the
     * scaled footprint. (Content that bleeds past content-width/height
     * is clipped at the footprint — fit mode's contract; it previously
     * painted beyond it at print.) Print-only, so the screen rendering
     * keeps visible overflow for editor affordances.
     * The export path injects the same rule into frozen copies
     * (print-eval.ts om-print-fit-contain). The .fit-mode scope is
     * load-bearing: .fit-box wraps slotted content in EVERY mode, and an
     * unscoped overflow:hidden would make whole flowing documents
     * monolithic (one truncated sheet). overflow:hidden, never clip —
     * clip is not a scroll container, so not monolithic. */
    @media print {
      .fit-mode .fit-box { overflow: hidden; }
    }
    .fit-mode .fit {
      width: var(--doc-fit-w);
      height: var(--doc-fit-h);
      transform: scale(var(--doc-fit-scale));
      transform-origin: top left;
    }
    .frame td, .frame th { padding: 0; text-align: left; font-weight: inherit; }
    .hdr-space { height: var(--doc-hdr-h); }
    .ftr-space { height: var(--doc-ftr-h); }
    ::slotted([slot="header"]),
    ::slotted([slot="footer"]) { display: block; box-sizing: border-box; }
    @media print {
      :host { background: none; padding: 0; min-width: 0; min-height: 0; }
      .sheet {
        width: auto; margin: 0; box-shadow: none; border-radius: 0;
        padding: 0 var(--doc-page-margin);
      }
      /* The thead/tfoot spacers repeat on every page, so they carry the
       * vertical page margin (which the sheet's own padding cannot, since
       * that padding is consumed once on the first/last page). The running
       * header/footer are fixed inside that band. */
      /* The 0.35in is breathing room between a running header/footer and
       * the body; without one the spacer is exactly the page margin, so a
       * margin="0" full-bleed document gets truly full-bleed pages. */
      .hdr-space { height: max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))); }
      .ftr-space { height: max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))); }
      /* WebKit flowing documents: @page carries the vertical margin (see
       * _syncPrintPageRule), so the spacers keep only whatever a running
       * header/footer needs BEYOND it — page 1 would otherwise double its
       * top inset. Paginated sheets already zero their spacers above. */
      .sheet.wk-print:not(.paginated) .hdr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))) - var(--doc-page-margin))); }
      .sheet.wk-print:not(.paginated) .ftr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))) - var(--doc-page-margin))); }
      ::slotted([slot="header"]) {
        position: fixed; top: 0; left: 0; right: 0; margin: 0;
        padding: calc(var(--doc-page-margin) * 0.45) var(--doc-page-margin) 0;
      }
      ::slotted([slot="footer"]) {
        position: fixed; bottom: 0; left: 0; right: 0; margin: 0;
        padding: 0 var(--doc-page-margin) calc(var(--doc-page-margin) * 0.45);
      }
    }
  `;
  class DocPage extends HTMLElement {
    static get observedAttributes() {
      return ['size', 'width', 'height', 'margin', 'orientation', 'content-width', 'content-height'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._mo = typeof MutationObserver === 'function' ? new MutationObserver(() => this._scheduleMeasure()) : null;
    }

    /** The named paper's [w, h], swapped when orientation="landscape".
     *  Only the named size swaps — explicit width/height are exact values
     *  the author already oriented. */
    _paperSize() {
      const named = PAPER[(this.getAttribute('size') || '').toLowerCase()] || PAPER.letter;
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? [named[1], named[0]] : named;
    }
    get pageWidth() {
      return safeLen(this.getAttribute('width'), this._paperSize()[0]);
    }
    get pageHeight() {
      return safeLen(this.getAttribute('height'), this._paperSize()[1]);
    }
    get pageMargin() {
      return safeLen(this.getAttribute('margin'), '0.75in');
    }

    /** Scaled-fit mode's content box [w, h] as CSS lengths, or null when
     *  the mode is off (either attribute missing/invalid/zero — a partial
     *  declaration falls back to normal flow rather than guessing). */
    _contentFit() {
      const w = safeLen(this.getAttribute('content-width'), null);
      const h = safeLen(this.getAttribute('content-height'), null);
      if (!w || !h) return null;
      const wPx = toPx(w),
        hPx = toPx(h);
      return wPx > 0 && hPx > 0 ? [w, h, wPx, hPx] : null;
    }
    connectedCallback() {
      if (!this._sheet) this._render();
      this._syncSize();
      this._syncPrintPageRule();
      this._ensureTextWrapDefaults();
      this._ensureOwnsPrintMeta();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      if (this._mo) this._mo.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      this._onResize = () => this._scheduleMeasure();
      window.addEventListener('resize', this._onResize);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this._scheduleMeasure());
      }
      this._scheduleMeasure();
    }
    disconnectedCallback() {
      window.removeEventListener('resize', this._onResize);
      if (this._mo) this._mo.disconnect();
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
      // Drop the head rules when the last doc-page leaves, so a deleted
      // document's @page geometry and text-wrap defaults can't apply to
      // whatever replaces it.
      const survivor = document.querySelector('doc-page');
      if (!survivor) {
        ['doc-page-print', 'doc-page-text-wrap', 'doc-page-owns-print', 'doc-page-fixed-size', 'doc-page-print-sizing'].forEach(id => {
          const tag = document.getElementById(id);
          if (tag) tag.remove();
        });
        // A live deck-stage deferred its own print-sizing meta to ours —
        // hand the page-global meta over so the deck isn't left unmarked.
        const deck = document.querySelector('deck-stage');
        if (deck && typeof deck._ensurePrintSizingMeta === 'function') {
          deck._ensurePrintSizingMeta();
        }
      } else {
        // A departed owner hands each page-global meta to whatever
        // doc-page remains (or it's removed).
        if (typeof survivor._syncFixedSizeMeta === 'function') {
          survivor._syncFixedSizeMeta();
        }
        if (typeof survivor._syncPrintSizingMeta === 'function') {
          survivor._syncPrintSizingMeta();
        }
      }
    }
    attributeChangedCallback() {
      if (!this._sheet) return;
      this._syncSize();
      this._syncPrintPageRule();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      this._scheduleMeasure();
    }
    _render() {
      this._root.innerHTML = `
        <style>${stylesheet}</style>
        <style id="vars"></style>
        <div class="sheet" data-screen-label="Document">
          <table class="frame" role="presentation">
            <thead><tr><th><div class="hdr-space"><slot name="header"></slot></div></th></tr></thead>
            <tbody><tr><td class="body"><div class="fit-box"><div class="fit"><slot></slot></div></div></td></tr></tbody>
            <tfoot><tr><td><div class="ftr-space"><slot name="footer"></slot></div></td></tr></tfoot>
          </table>
        </div>`;
      this._sheet = this._root.querySelector('.sheet');
      this._vars = this._root.getElementById('vars');
    }

    /** Runtime sizing lives in a shadow <style> :host rule, never on the
     *  light-DOM host element, so serialize-persist can't write it back. */
    _syncSize(hdrH, ftrH) {
      // Scaled-fit mode: content at its authored size, scaled onto the
      // printable area (page minus margins on both axes). The factor is a
      // plain number var so calc(length * number) stays valid; 4 decimals
      // keeps the shadow style stable across re-measures. Upscaling is
      // allowed — print transforms are vector, so text and CSS stay crisp
      // (raster images soften, which the catalog bullet warns about).
      const fit = this._contentFit();
      let fitVars = '';
      if (fit) {
        const marginPx = toPx(this.pageMargin) || 0;
        const availW = toPx(this.pageWidth) - 2 * marginPx;
        const availH = toPx(this.pageHeight) - 2 * marginPx;
        const scale = Math.min(availW / fit[2], availH / fit[3]);
        if (scale > 0 && Number.isFinite(scale)) {
          fitVars = '--doc-fit-w:' + fit[0] + ';' + '--doc-fit-h:' + fit[1] + ';' + '--doc-fit-scale:' + scale.toFixed(4) + ';';
        }
      }
      this._sheet.classList.toggle('fit-mode', !!fitVars);
      // Numeric w/h ratio for the paginated page cards' aspect-ratio —
      // aspect-ratio takes a number, not a length ratio, so compute it
      // here (CSS length division isn't portable). 6 decimals keeps the
      // shadow style stable across re-syncs.
      const arW = toPx(this.pageWidth);
      const arH = toPx(this.pageHeight);
      const ar = arW > 0 && arH > 0 ? (arW / arH).toFixed(6) : '0.772727';
      this._vars.textContent = ':host{' + fitVars + '--doc-page-ar:' + ar + ';' + '--doc-page-w:' + this.pageWidth + ';' + '--doc-page-h:' + this.pageHeight + ';' + '--doc-page-margin:' + this.pageMargin + ';' + '--doc-hdr-h:' + (hdrH || 0) + 'px;' + '--doc-ftr-h:' + (ftrH || 0) + 'px;' + '--doc-hdr-pad:' + (hdrH ? '0.35in' : '0px') + ';' + '--doc-ftr-pad:' + (ftrH ? '0.35in' : '0px') + '}';
    }

    /** @page is a no-op inside shadow DOM, so the rule lives in <head>.
     *  Re-appended on every sync so it stays last in source order — the
     *  @page cascade is source-order per descriptor, so this rule wins
     *  over any other @page rule in the document.
     *
     *  The @page SIZE is pinned where the page box IS part of the design:
     *  explicit-fixed-size mode (width + height authored), scaled-fit
     *  mode (the named sheet the fit targets), and explicit pagination
     *  (the named size the cards share — so card and sheet agree on
     *  every print path, and the export path's chosen paper overrides
     *  BOTH with one later rule). For FLOWING documents no paper size is
     *  emitted at all — the true size comes from the user's preference,
     *  injected by the export path or chosen in the print dialog — so a
     *  flowing document never fights the paper it lands on.
     *  margin: 0 is emitted in every mode: it leaves Chrome no margin box
     *  to draw its date/URL/page-count header in, and the visual margin
     *  lives on the sheet's own padding. */
    _syncPrintPageRule() {
      const id = 'doc-page-print';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
      }
      document.head.appendChild(tag);
      // Three print-geometry regimes:
      // - true-size: the page IS the design — pin its exact size.
      // - scaled-fit (content-width/height): the fit factor is computed
      //   against the NAMED paper's printable area, so that paper must
      //   stay pinned or the scaled content overflows a smaller sheet
      //   (the export path re-fits and re-pins at print time on top).
      // - default modes: no paper size — but landscape still needs the
      //   paper-agnostic 'size: landscape' keyword, because the size
      //   descriptor is what carries orientation; without it a landscape
      //   document prints portrait whenever nothing injects a size.
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      // Explicit pagination pins the page box to the SAME values that
      // size the cards (the named size by default, the export path's
      // chosen paper when its later rule overrides both) — card and
      // sheet agree on every print path, and a mismatched real paper
      // shrinks-to-fit in the dialog instead of clipping a Letter card
      // on A4. Declared before the paginated read below so both derive
      // from one check.
      const paginatedNow = this.querySelector(':scope > .page') !== null;
      const sizeDescriptor = this._trueSizePx() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : this._contentFit() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : paginatedNow ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : landscape ? 'size: landscape; ' : '';
      // WebKit never repeats the thead/tfoot spacers that carry a flowing
      // document's vertical page margins (see WK_PRINT above), so pages
      // after the first print edge-to-edge there. Carry the VERTICAL
      // margins on @page for WebKit instead, and the shadow print CSS
      // trims the first-page spacers by the same amount (.sheet.wk-print
      // rules). Horizontal inset stays on the sheet's own padding in
      // every engine. Blink keeps margin: 0 (a nonzero margin there
      // re-opens the box Chrome draws its header furniture in). One cost,
      // learned in testing: Safari's own date/URL headers are a USER
      // dialog setting ("Print headers and footers") that renders in the
      // margin area when room exists — margin: 0 only suppressed it by
      // leaving no room, and no CSS controls it. The export dialog's
      // Safari guide teaches turning the setting off for flowing
      // documents. Explicitly paginated and fixed-size documents keep
      // margin: 0 everywhere: their pages ARE the sheet.
      const wkFlowing = WK_PRINT && !paginatedNow && !this._trueSizePx() && !this._contentFit();
      const marginDescriptor = wkFlowing ? 'margin: ' + this.pageMargin + ' 0; ' : 'margin: 0; ';
      // Shadow-internal marker (never serialized), kept in lockstep with
      // the @page decision above: the print CSS trims the first-page
      // spacers ONLY while @page actually carries the margins — a
      // true-size or scaled-fit sheet keeps margin: 0 and must keep its
      // spacers too. Re-synced here so attribute changes and pagination
      // flips move both together.
      if (this._sheet) this._sheet.classList.toggle('wk-print', wkFlowing);
      tag.textContent = '@page { ' + sizeDescriptor + marginDescriptor + '} ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; height: auto !important; overflow: visible !important; } ' + 'h1,h2,h3,h4,h5,h6 { break-after: avoid; } ' + 'figure,pre,blockquote,img,svg,tr { break-inside: avoid; } ' + 'p,li { orphans: 3; widows: 3; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; ' + 'backdrop-filter: none !important; -webkit-backdrop-filter: none !important; } ' + '*, *::before, *::after { animation-delay: -99s !important; animation-duration: .001s !important; ' + 'animation-iteration-count: 1 !important; animation-fill-mode: both !important; ' + 'animation-play-state: running !important; transition-duration: 0s !important; } }';
    }

    /** Typographic defaults for document text: balance headings, avoid
     *  widowed/orphaned words in body copy (browsers without text-wrap
     *  support drop the declarations). Zero-specificity via :where() so
     *  any text-wrap authored on those elements wins; document-level so the
     *  rules reach the slotted (light DOM) content — shadow styles can't.
     *  data-omelette-injected marks the tag for the host editor to strip
     *  at serialize, so it is never written back as authored source. */
    _ensureTextWrapDefaults() {
      if (document.getElementById('doc-page-text-wrap')) return;
      const tag = document.createElement('style');
      tag.id = 'doc-page-text-wrap';
      tag.setAttribute('data-omelette-injected', '');
      tag.textContent = ':where(h1,h2,h3,h4,h5,h6){text-wrap:balance}' + ':where(p,li,blockquote,figcaption){text-wrap:pretty}';
      document.head.appendChild(tag);
    }

    /** Declares that this document owns its print CSS. The instant-PDF
     *  export checks for the meta by NAME PRESENCE alone (content is
     *  ignored) and skips its automatic print-CSS injections, so the
     *  component's @page geometry is never overridden by a heuristic.
     *  data-omelette-injected keeps it out of serialized source. */
    _ensureOwnsPrintMeta() {
      if (document.getElementById('doc-page-owns-print')) return;
      const tag = document.createElement('meta');
      tag.id = 'doc-page-owns-print';
      tag.name = 'omelette-owns-print';
      tag.content = 'true';
      tag.setAttribute('data-omelette-injected', '');
      document.head.appendChild(tag);
    }

    /** This page's valid true-size page box (explicit width AND height)
     *  as [w, h] px ints, or null when the mode is off. */
    _trueSizePx() {
      if (!safeLen(this.getAttribute('width'), null) || !safeLen(this.getAttribute('height'), null)) return null;
      const w = Math.round(toPx(this.pageWidth));
      const h = Math.round(toPx(this.pageHeight));
      return w > 0 && h > 0 ? [w, h] : null;
    }

    /** True-size pages (explicit width AND height) also declare the page
     *  box as the preview size: the in-app preview reads
     *  meta[name="omelette-fixed-size"] (content "W,H" in px ints) and
     *  scales the sheet into view — without it an 18in poster previews at
     *  true size with scrollbars. Never overrides an author-set meta
     *  (only the component's own id is managed). The meta is page-global
     *  while doc-page instances are not, so every sync recomputes the
     *  page-wide owner — the first connected true-size doc-page — and a
     *  non-true-size sibling's sync can never delete the owner's meta.
     *  Removed when no true-size page remains (the owner's disconnect
     *  re-syncs via any survivor) or when an author-set meta exists. */
    _syncFixedSizeMeta() {
      const id = 'doc-page-fixed-size';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-fixed-size"]:not([data-omelette-injected])');
      // The page-wide owner, not this instance: an upgraded true-size page
      // anywhere in the document keeps the meta alive and sized.
      let box = null;
      for (const el of document.querySelectorAll('doc-page')) {
        box = typeof el._trueSizePx === 'function' ? el._trueSizePx() : null;
        if (box) break;
      }
      if (!box || authored) {
        if (own) own.remove();
        return;
      }
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-fixed-size';
      tag.content = box[0] + ',' + box[1];
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }

    /** This page's print-sizing mode: 'fixed' when an explicit width AND
     *  height are authored (the page is the design's own size), else the
     *  default paper in the authored orientation. */
    _printSizingMode() {
      if (this._trueSizePx()) return 'fixed';
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? 'default-landscape' : 'default-portrait';
    }

    /** Announces the print-sizing mode to the host app:
     *  meta[name="omelette-print-sizing"] with content 'default-portrait',
     *  'default-landscape', or 'fixed' (fixed pages also carry the
     *  omelette-fixed-size meta with the page box in px). The export path
     *  probes it to decide what true paper size to inject at print time —
     *  in the default modes the component emits no paper size of its own.
     *  Same page-global ownership rules as the fixed-size meta above:
     *  first connected doc-page owns it, an authored meta is never
     *  overridden, removed when no doc-page remains. */
    _syncPrintSizingMeta() {
      const id = 'doc-page-print-sizing';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-print-sizing"]:not([data-omelette-injected])');
      // A fixed page wins outright (mirroring the fixed-size loop above,
      // so the two metas can never contradict each other in a mixed
      // multi-page document); otherwise the first page's mode holds.
      let mode = null;
      for (const el of document.querySelectorAll('doc-page')) {
        if (typeof el._printSizingMode !== 'function') continue;
        const m = el._printSizingMode();
        if (m === 'fixed') {
          mode = m;
          break;
        }
        if (mode === null) mode = m;
      }
      if (!mode || authored) {
        if (own) own.remove();
        return;
      }
      // A deck-stage that connected first injected its own meta and
      // defers to any existing one — take it over, or the document ends
      // up with two conflicting injected metas (a doc-page page is the
      // document; the deck re-ensures its meta if every doc-page leaves).
      const deckMeta = document.getElementById('deck-stage-print-sizing');
      if (deckMeta) deckMeta.remove();
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-print-sizing';
      tag.content = mode;
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }
    _scheduleMeasure() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        this._measure();
      });
    }

    /** Slot heights feed the print spacers (--doc-hdr-h / --doc-ftr-h), so
     *  they re-measure on content mutation, resize, and font load. The
     *  same pass detects explicit pagination (direct .page children) and
     *  toggles the sheet between the flowing-document card and the
     *  page-per-card stack — content edits can add or remove pages at any
     *  time, so this tracks the same mutations the measurement does. */
    _measure() {
      const hdr = this.querySelector(':scope > [slot="header"]');
      const ftr = this.querySelector(':scope > [slot="footer"]');
      const wasPaginated = this._sheet.classList.contains('paginated');
      this._sheet.classList.toggle('paginated', this.querySelector(':scope > .page') !== null);
      // The WebKit @page margin is flowing-only, so a pagination flip
      // must re-emit the rule (content edits can add or remove .page
      // sections at any time).
      if (this._sheet.classList.contains('paginated') !== wasPaginated) {
        this._syncPrintPageRule();
      }
      this._syncSize(hdr ? hdr.offsetHeight : 0, ftr ? ftr.offsetHeight : 0);
    }
  }
  if (!customElements.get('doc-page')) {
    customElements.define('doc-page', DocPage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "designs/participant-device/doc-page.js", error: String((e && e.message) || e) }); }

// designs/participant-device/rebuild-with-comments.js
try { (() => {
// Rebuild the Participant Kiosk DDD from content.txt AND re-inject the V1.1 review
// comments so they survive every rebuild. Import from run_script via blob URL:
//   const src = await readFile('designs/participant-device/rebuild-with-comments.js');
//   const { rebuildParticipantKioskDoc } = await import(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
//   await rebuildParticipantKioskDoc({ readFile, readFileBinary, saveFile, log }, { version: 'V1.2', versionRows: [...] });
async function rebuildParticipantKioskDoc(h, opts) {
  const {
    readFile,
    readFileBinary,
    saveFile,
    log
  } = h;
  const version = opts.version || 'V1.2';
  const outPath = opts.outPath || 'designs/participant-device/output/APM_DDD_Participant_Kiosk_' + version + '.docx';

  // ---- 1. build the docx from content.txt ----
  const builderSrc = await readFile('templates/detailed-design/authoring/docx-builder.js');
  const {
    buildDocx
  } = await import(URL.createObjectURL(new Blob([builderSrc], {
    type: 'text/javascript'
  })));
  await buildDocx(h, 'templates/detailed-design/authoring/apm-master.docx', 'designs/participant-device/content.txt', 'designs/participant-device/figs/', outPath, {
    relPrefix: 'rIdPK',
    imgPrefix: 'pkfig',
    idBase: 9900,
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
    versionRows: opts.versionRows
  });

  // ---- 2. zip helpers ----
  const td = new TextDecoder(),
    te = new TextEncoder();
  async function unzip(path) {
    const blob = await readFileBinary(path);
    const buf = new Uint8Array(await blob.arrayBuffer());
    const dv = new DataView(buf.buffer);
    let eocd = -1;
    for (let i = buf.length - 22; i >= 0; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    const count = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true);
    const entries = [];
    for (let i = 0; i < count; i++) {
      const nl = dv.getUint16(off + 28, true),
        el = dv.getUint16(off + 30, true),
        cl = dv.getUint16(off + 32, true);
      entries.push({
        name: td.decode(buf.slice(off + 46, off + 46 + nl)),
        method: dv.getUint16(off + 10, true),
        compSize: dv.getUint32(off + 20, true),
        lho: dv.getUint32(off + 42, true)
      });
      off += 46 + nl + el + cl;
    }
    const out = [];
    for (const e of entries) {
      const nl = dv.getUint16(e.lho + 26, true),
        el = dv.getUint16(e.lho + 28, true);
      const s = e.lho + 30 + nl + el;
      const d = buf.slice(s, s + e.compSize);
      out.push({
        name: e.name,
        bytes: e.method === 0 ? d : new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())
      });
    }
    return out;
  }

  // ---- 3. comment parts from the reviewed copy ----
  const src = opts.commentsSource || 'uploads/APM_DDD_Participant_Kiosk_V1.1.docx';
  const vSrc = await unzip(src);
  const want = ['word/comments.xml', 'word/commentsExtended.xml', 'word/commentsIds.xml', 'word/commentsExtensible.xml', 'word/people.xml', 'word/_rels/comments.xml.rels'];
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
  const threads = opts.threads || [{
    ids: [9, 10, 11],
    marker: 'Requirement from the business review: participants who download documents'
  }, {
    ids: [29, 30, 31, 32, 33, 34],
    marker: 'identifiable to network and security tooling by account as well as by hostname'
  }, {
    ids: [61, 62, 63],
    marker: 'access is controlled by a pre-shared key deployed to devices by Intune policy'
  }, {
    ids: [70, 71, 72, 73, 74],
    marker: 'standard DNS forwarders'
  }];
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
    if (!rels.includes('Target="' + target + '"')) rels = rels.replace('</Relationships>', '<Relationship Id="rIdCm' + n++ + '" Type="' + type + '" Target="' + target + '"/></Relationships>');
  }
  byName['word/_rels/document.xml.rels'].bytes = te.encode(rels);
  const all = built.filter(p => !want.includes(p.name)).concat(cparts);
  for (const p of all) if (byName[p.name]) p.bytes = byName[p.name].bytes;

  // ---- 5. rezip (store) ----
  const crcTable = (() => {
    const t = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  const crc32 = b => {
    let c = -1;
    for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xFF] ^ c >>> 8;
    return (c ^ -1) >>> 0;
  };
  let size = 22 + 1024;
  for (const p of all) size += 76 + 2 * p.name.length + p.bytes.length;
  const out = new Uint8Array(size);
  const ov = new DataView(out.buffer);
  let pos = 0;
  const central = [];
  for (const p of all) {
    const nb = te.encode(p.name);
    const crc = crc32(p.bytes);
    central.push({
      nb,
      crc,
      size: p.bytes.length,
      off: pos
    });
    ov.setUint32(pos, 0x04034b50, true);
    ov.setUint16(pos + 4, 20, true);
    ov.setUint32(pos + 14, crc, true);
    ov.setUint32(pos + 18, p.bytes.length, true);
    ov.setUint32(pos + 22, p.bytes.length, true);
    ov.setUint16(pos + 26, nb.length, true);
    out.set(nb, pos + 30);
    out.set(p.bytes, pos + 30 + nb.length);
    pos += 30 + nb.length + p.bytes.length;
  }
  const cdStart = pos;
  for (const c of central) {
    ov.setUint32(pos, 0x02014b50, true);
    ov.setUint16(pos + 4, 20, true);
    ov.setUint16(pos + 6, 20, true);
    ov.setUint32(pos + 16, c.crc, true);
    ov.setUint32(pos + 20, c.size, true);
    ov.setUint32(pos + 24, c.size, true);
    ov.setUint16(pos + 28, c.nb.length, true);
    ov.setUint32(pos + 42, c.off, true);
    out.set(c.nb, pos + 46);
    pos += 46 + c.nb.length;
  }
  ov.setUint32(pos, 0x06054b50, true);
  ov.setUint16(pos + 8, central.length, true);
  ov.setUint16(pos + 10, central.length, true);
  ov.setUint32(pos + 12, pos - cdStart, true);
  ov.setUint32(pos + 16, cdStart, true);
  pos += 22;
  await saveFile(outPath, new Blob([out.slice(0, pos)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }));
  log('rebuilt with comments:', outPath, pos, 'bytes,', all.length, 'parts, threads:', threads.length);
  return outPath;
}
Object.assign(__ds_scope, { rebuildParticipantKioskDoc });
})(); } catch (e) { __ds_ns.__errors.push({ path: "designs/participant-device/rebuild-with-comments.js", error: String((e && e.message) || e) }); }

// designs/standard-user-avd/rebuild-with-comments.js
try { (() => {
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
async function rebuildStandardUserAvdDoc(h, opts) {
  const {
    readFile,
    readFileBinary,
    saveFile,
    log
  } = h;
  const version = opts.version || 'V1.4';
  const outPath = opts.outPath || 'designs/standard-user-avd/output/APM_Detail_Design_Standard_User_AVD_' + version + '.docx';
  const builderSrc = await readFile('templates/detailed-design-v2/authoring/docx-builder.js');
  const {
    buildDocx
  } = await import(URL.createObjectURL(new Blob([builderSrc], {
    type: 'text/javascript'
  })));
  await buildDocx(h, 'templates/detailed-design/authoring/apm-master.docx', 'designs/standard-user-avd/content-detail.txt', 'designs/standard-user-avd/figs/', outPath, {
    relPrefix: 'rSU4',
    imgPrefix: 'su4Fig',
    idBase: 13600,
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
    versionRows: opts.versionRows
  });
  const td = new TextDecoder(),
    te = new TextEncoder();
  async function unzip(path) {
    const blob = await readFileBinary(path);
    const buf = new Uint8Array(await blob.arrayBuffer());
    const dv = new DataView(buf.buffer);
    let eocd = -1;
    for (let i = buf.length - 22; i >= 0; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    const count = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true);
    const entries = [];
    for (let i = 0; i < count; i++) {
      const nl = dv.getUint16(off + 28, true),
        el = dv.getUint16(off + 30, true),
        cl = dv.getUint16(off + 32, true);
      entries.push({
        name: td.decode(buf.slice(off + 46, off + 46 + nl)),
        method: dv.getUint16(off + 10, true),
        compSize: dv.getUint32(off + 20, true),
        lho: dv.getUint32(off + 42, true)
      });
      off += 46 + nl + el + cl;
    }
    const out = [];
    for (const e of entries) {
      const nl = dv.getUint16(e.lho + 26, true),
        el = dv.getUint16(e.lho + 28, true);
      const s = e.lho + 30 + nl + el;
      const d = buf.slice(s, s + e.compSize);
      out.push({
        name: e.name,
        bytes: e.method === 0 ? d : new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())
      });
    }
    return out;
  }
  const src = opts.commentsSource || 'designs/standard-user-avd/history/APM_Detail_Design_Standard_User_AVD_V1.2-reviewed.docx';
  const vSrc = await unzip(src);
  const want = ['word/comments.xml', 'word/commentsExtended.xml', 'word/commentsIds.xml', 'word/commentsExtensible.xml', 'word/people.xml', 'word/_rels/comments.xml.rels'];
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
  const threads = opts.threads || [{
    ids: [14, 15],
    marker: 'Golden image build and versioning through Azure Compute Gallery'
  }, {
    ids: [26, 27],
    marker: 'Print from a session to printers at an APM site'
  }, {
    ids: [46, 47],
    marker: 'ASD Windows Hardening Guidelines'
  }, {
    ids: [50, 51],
    marker: 'CA-202 - Org Users - Azure Virtual Desktop - Allow - Require MFA'
  }, {
    ids: [52, 53, 54],
    marker: 'auea-vnet-avd-ctrl-002'
  }, {
    ids: [63],
    marker: '5.3.2 Address plan'
  }, {
    ids: [70],
    marker: 'auea-nsg-avd-ctrl-avdpe-002'
  }, {
    ids: [128],
    marker: 'aus-sub-dev-controlled-001'
  }];
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
    if (!rels.includes('Target="' + target + '"')) rels = rels.replace('</Relationships>', '<Relationship Id="rIdCm' + n++ + '" Type="' + type + '" Target="' + target + '"/></Relationships>');
  }
  byName['word/_rels/document.xml.rels'].bytes = te.encode(rels);
  const all = built.filter(p => !want.includes(p.name)).concat(cparts);
  for (const p of all) if (byName[p.name]) p.bytes = byName[p.name].bytes;
  const crcTable = (() => {
    const t = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  const crc32 = b => {
    let c = -1;
    for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xFF] ^ c >>> 8;
    return (c ^ -1) >>> 0;
  };
  let size = 22 + 4096;
  for (const p of all) size += 76 + 2 * p.name.length + p.bytes.length;
  const out = new Uint8Array(size);
  const ov = new DataView(out.buffer);
  let pos = 0;
  const central = [];
  for (const p of all) {
    const nb = te.encode(p.name);
    const crc = crc32(p.bytes);
    central.push({
      nb,
      crc,
      size: p.bytes.length,
      off: pos
    });
    ov.setUint32(pos, 0x04034b50, true);
    ov.setUint16(pos + 4, 20, true);
    ov.setUint32(pos + 14, crc, true);
    ov.setUint32(pos + 18, p.bytes.length, true);
    ov.setUint32(pos + 22, p.bytes.length, true);
    ov.setUint16(pos + 26, nb.length, true);
    out.set(nb, pos + 30);
    out.set(p.bytes, pos + 30 + nb.length);
    pos += 30 + nb.length + p.bytes.length;
  }
  const cdStart = pos;
  for (const c of central) {
    ov.setUint32(pos, 0x02014b50, true);
    ov.setUint16(pos + 4, 20, true);
    ov.setUint16(pos + 6, 20, true);
    ov.setUint32(pos + 16, c.crc, true);
    ov.setUint32(pos + 20, c.size, true);
    ov.setUint32(pos + 24, c.size, true);
    ov.setUint16(pos + 28, c.nb.length, true);
    ov.setUint32(pos + 42, c.off, true);
    out.set(c.nb, pos + 46);
    pos += 46 + c.nb.length;
  }
  ov.setUint32(pos, 0x06054b50, true);
  ov.setUint16(pos + 8, central.length, true);
  ov.setUint16(pos + 10, central.length, true);
  ov.setUint32(pos + 12, pos - cdStart, true);
  ov.setUint32(pos + 16, cdStart, true);
  pos += 22;
  await saveFile(outPath, new Blob([out.slice(0, pos)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }));
  log('rebuilt with comments:', outPath, pos, 'bytes,', all.length, 'parts, threads anchored:', placed.join('  '));
  return outPath;
}
Object.assign(__ds_scope, { rebuildStandardUserAvdDoc });
})(); } catch (e) { __ds_ns.__errors.push({ path: "designs/standard-user-avd/rebuild-with-comments.js", error: String((e && e.message) || e) }); }

// exports/es-participant-kiosk/designs/participant-device/config/check-assigned-access.js
try { (() => {
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
  d: 'http://schemas.microsoft.com/AssignedAccess/2017/config',
  rs5: 'http://schemas.microsoft.com/AssignedAccess/201810/config',
  v3: 'http://schemas.microsoft.com/AssignedAccess/2020/config',
  v4: 'http://schemas.microsoft.com/AssignedAccess/2021/config',
  v5: 'http://schemas.microsoft.com/AssignedAccess/2022/config'
};

// Order is fixed by profile_t in the XSD. StartLayout and StartPins are alternatives
// on Windows 11; TaskbarLayout is schema-legal but unsupported in a restricted user
// experience, so it is treated as a failure here rather than a warning.
const ORDER = ['AllAppsList', 'rs5:FileExplorerNamespaceRestrictions', 'StartLayout', 'v5:StartPins', 'Taskbar', 'v5:TaskbarLayout'];
function parse(text, label, failures) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const err = doc.querySelector('parsererror');
  if (err) {
    failures.push(`${label}: not well-formed XML - ${err.textContent.slice(0, 160)}`);
    return null;
  }
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
  if (!/^\{[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}\}$/.test(id)) failures.push(`${label}: Profile Id "${id}" does not match the schema's guid_t pattern`);
  const dp = g(NS.d, 'DefaultProfile')[0];
  if (!dp) failures.push(`${label}: no DefaultProfile element`);else if (dp.getAttribute('Id') !== id) failures.push(`${label}: DefaultProfile Id "${dp.getAttribute('Id')}" does not match Profile Id "${id}"`);
  if (!prof.getAttribute('Name')) warnings.push(`${label}: Profile has no Name attribute. The CSP Status node reports profileId only, so a Name makes a failure legible`);

  // element order and membership
  const kids = [...prof.children].map(c => (c.namespaceURI === NS.d ? '' : c.prefix + ':') + c.localName);
  let last = -1;
  for (const k of kids) {
    const i = ORDER.indexOf(k);
    if (i < 0) {
      failures.push(`${label}: "${k}" is not a legal child of Profile`);
      continue;
    }
    if (i < last) failures.push(`${label}: "${k}" is out of schema order. Required order: ${ORDER.join(', ')}`);
    last = i;
  }
  if (!kids.includes('AllAppsList')) failures.push(`${label}: AllAppsList is mandatory for a restricted user experience`);
  if (!kids.includes('Taskbar')) failures.push(`${label}: Taskbar is mandatory (minOccurs=1 in profile_t)`);
  if (!kids.includes('v5:StartPins') && !kids.includes('StartLayout')) failures.push(`${label}: a restricted user experience profile must define the Start layout`);

  // Taskbar pinning is not supported in a restricted user experience
  if (g(NS.v5, 'TaskbarLayout').length || g(NS.d, 'TaskbarLayout').length) failures.push(`${label}: TaskbarLayout is present. Taskbar pinning is not supported in a restricted user experience; only ShowTaskbar is`);

  // an unprefixed element that only exists in an add-on namespace
  for (const n of ['StartPins', 'TaskbarLayout', 'FileExplorerNamespaceRestrictions', 'AllowedNamespace', 'AllowRemovableDrives', 'NoRestriction']) if (g(NS.d, n).length) failures.push(`${label}: <${n}> is in the default 2017 namespace, where it does not exist. It needs its version prefix`);

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
    if (g(NS.v3, 'NoRestriction').length && (an.length || g(NS.v3, 'AllowRemovableDrives').length)) failures.push(`${label}: NoRestriction is mutually exclusive with AllowedNamespace and AllowRemovableDrives (xs:choice)`);
  }

  // apps
  const apps = g(NS.d, 'App');
  const paths = apps.map(a => a.getAttribute('DesktopAppPath')).filter(Boolean);
  const aumids = apps.map(a => a.getAttribute('AppUserModelId')).filter(Boolean);
  for (const a of apps) {
    if (a.getAttribute('DesktopAppPath') && a.getAttribute('AppUserModelId')) failures.push(`${label}: an App element sets both DesktopAppPath and AppUserModelId. They are mutually exclusive`);
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
  for (const v of paths) if (!/\.(exe|com)$/i.test(v)) failures.push(`${label}: "${v}" is not a .exe or .com. AppLocker's executable rule collection cannot evaluate it, so listing it here has no effect and risks rule generation failing`);
  if (paths.some(v => /\\explorer\.exe$/i.test(v)) === false && paths.length) warnings.push(`${label}: explorer.exe is not allowed, so File Explorer cannot be granted at all`);

  // account form
  const acct = g(NS.d, 'Account')[0];
  const grp = g(NS.d, 'UserGroup')[0],
    auto = g(NS.d, 'AutoLogonAccount')[0];
  if (!acct && !grp && !auto) failures.push(`${label}: Config has no Account, UserGroup or AutoLogonAccount`);
  if (acct) {
    const v = acct.textContent.trim();
    // documented local forms: devicename\user, .\user, or bare user
    const local = /^(\.\\)?[^\\]+$/.test(v) || /^[^\\]+\\[^\\]+$/.test(v);
    if (!local) failures.push(`${label}: Account "${v}" is not a documented form (devicename\\user, .\\user, user, domain\\samAccountName, or AzureAD\\UPN)`);
    const sam = v.replace(/^.*\\/, '');
    if (sam.length > 20) failures.push(`${label}: account name "${sam}" is ${sam.length} characters. The SAM account name limit is 20`);
    if (/[\\/:*?"<>|\[\]]/.test(sam) && !/\[SERIAL\]/.test(sam)) failures.push(`${label}: account name "${sam}" contains a character not legal in a local account name`);
  }
  return {
    paths,
    aumids,
    order: kids,
    account: acct ? acct.textContent.trim() : null
  };
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
const CAP_RE = /if \(\$serial\.Length -gt 14\) \{ \$serial = \$serial\.Substring\(0, 14\) \}/;

// Cmdlet parameters with a hard length limit. New-LocalUser -Description throws above 48
// characters, and the failure is a validation error at run time that no XML or schema check
// can see. Found on a test machine, not in review.
const ARG_LIMITS = [{
  re: /-Description\s+'([^']*)'/g,
  max: 48,
  what: 'New-LocalUser -Description'
}, {
  re: /\$desc\s*=\s*'([^']*)'/g,
  max: 48,
  what: 'New-LocalUser -Description (assigned to $desc)'
}, {
  re: /-FullName\s+'([^']*)'/g,
  max: 256,
  what: 'New-LocalUser -FullName'
}, {
  re: /-Name\s+"(Kiosk-[^"]*)"/g,
  max: 20,
  what: 'local account name'
}];
function checkDerivation(label, text, failures) {
  if (!SERIAL_RE.test(text)) failures.push(`${label}: BIOS serial derivation does not match the other scripts`);
  if (!PREFIX_RE.test(text)) failures.push(`${label}: account name prefix does not match the other scripts`);
  if (!CAP_RE.test(text)) failures.push(`${label}: missing or altered serial cap. The serial must be capped at 14 characters before the name is built, so "Kiosk-" plus the serial fits the 20-character SAM limit`);
  for (const {
    re,
    max,
    what
  } of ARG_LIMITS) {
    for (const m of text.matchAll(new RegExp(re.source, 'g'))) if (m[1].length > max) failures.push(`${label}: ${what} is ${m[1].length} characters, limit ${max}. PowerShell throws a parameter validation error at run time - "${m[1].slice(0, 40)}..."`);
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
    if (isPm && /(exit 1|\$blockers\s*\+=|Write-Output)/.test(m[3])) failures.push(`${label}: a PolicyManager blocker is gated on Test-Path ${m[1]}, which tests the KEY. The key exists on every device whether or not the policy is configured, so this reports a blocker permanently - read the specific values instead`);
  }
  if (/DeviceLock/.test(text) && !/DevicePasswordEnabled/.test(text)) failures.push(`${label}: DeviceLock is checked without reading DevicePasswordEnabled. That value is inverted (0 means a password IS required) and is the setting that actually disables automatic logon`);
}
function checkKioskAssignedAccess({
  xml,
  script,
  purge,
  detect
}) {
  const failures = [],
    warnings = [],
    notes = [];
  const xdoc = parse(xml, 'canonical XML', failures);
  const xr = xdoc ? checkOne(xdoc, 'canonical XML', failures, warnings) : null;
  let sr = null;
  if (script) {
    const m = script.match(/\$aaXml = @"\r?\n([\s\S]*?)\r?\n"@/);
    if (!m) failures.push('remediation script: could not find the $aaXml here-string');else {
      const sub = m[1].replace(/\$profileId/g, '{4B1E9A0C-6D7F-4A31-9C52-8E0A73B5D411}').replace(/\$user/g, 'Kiosk-TESTSER1');
      const sdoc = parse(sub, 'script here-string', failures);
      if (sdoc) sr = checkOne(sdoc, 'script here-string', failures, warnings);
    }

    // Winlogon autologon rules, from "Assigned Access recommendations"
    if (/Set-ItemProperty[^\n]*-Name\s+DefaultDomainName/.test(script)) failures.push('remediation script: DefaultDomainName is set. Microsoft states that for a local account this key must not be added');
    if (!/AutoAdminLogon/.test(script)) failures.push('remediation script: AutoAdminLogon is never set, so the device will not sign itself in');
    if (/Set-ItemProperty[^\n]*-Name\s+DefaultPassword/.test(script)) failures.push('remediation script: writes a cleartext DefaultPassword registry value');
    if (!/PasswordNeverExpires|AccountNeverExpires/.test(script)) warnings.push('remediation script: the session account password can expire, which black-screens an autologon device');

    // the defect class that shipped: two statements collapsed onto one line
    script.split('\n').forEach((l, i) => {
      const code = l.replace(/#.*$/, '');
      if (/-(Type|Value|Name|Force)\s+[A-Za-z0-9_'"$]*(Set|Get|New|Remove|Add|Enable|Disable|Register|Write)-[A-Za-z]+/.test(code)) failures.push(`remediation script line ${i + 1}: two statements on one line, missing a newline - ${l.trim().slice(0, 90)}`);
    });
  }

  // the three scripts that derive the account name must derive it identically
  const derivers = [['remediation script', script], ['detection script', detect], ['purge script', purge]].filter(d => d[1]);
  for (const [label, text] of derivers) checkDerivation(label, text, failures);
  if (derivers.length < 3) notes.push(`Account-name derivation checked in ${derivers.length} of 3 scripts. Pass detect and purge to check all three.`);

  // Every script that reads a policy blocker gets the same guards. Running these on the
  // remediation alone was itself the bug: the identical key-existence defect sat in the
  // detection script and passed clean.
  for (const [label, text] of [['remediation script', script], ['detection script', detect]].filter(d => d[1])) checkPolicyBlockerLogic(label, text, failures);

  // the purge script must reassert autologon, and must never invent a credential
  if (purge) {
    if (!/-Name DefaultUserName/.test(purge)) failures.push('purge script: does not reassert DefaultUserName. An interactive console sign-in leaves the kiosk unable to sign itself in until the next remediation run');
    if (!/Get-LocalUser -Name \$user/.test(purge)) failures.push('purge script: reasserts autologon without confirming the account exists, which can point autologon at a missing account');
    if (/LsaSecret|Set-LocalUser|New-LocalUser|-Password/.test(purge)) failures.push('purge script: touches credentials. It runs at shutdown and must only reassert the account name');
    if (/Set-ItemProperty[^\n]*-Name\s+DefaultDomainName/.test(purge)) failures.push('purge script: sets DefaultDomainName, which must not be set for a local account');
    if (!/exit 0/.test(purge)) failures.push('purge script: must always exit 0 so it cannot block shutdown');
  }

  // drift between the two copies
  if (xr && sr) {
    if (JSON.stringify(xr.paths) !== JSON.stringify(sr.paths)) failures.push('DRIFT: the allowed-app lists differ between the canonical XML and the script here-string');
    if (JSON.stringify(xr.aumids) !== JSON.stringify(sr.aumids)) failures.push('DRIFT: the AUMID lists differ between the two copies');
    if (JSON.stringify(xr.order) !== JSON.stringify(sr.order)) failures.push(`DRIFT: the Profile element structure differs. XML: ${xr.order.join(',')} | script: ${sr.order.join(',')}`);
    const strip = a => (a || '').replace(/Kiosk-[A-Za-z0-9\[\]]+/, 'Kiosk-*');
    if (strip(xr.account) !== strip(sr.account)) failures.push(`DRIFT: the Account form differs. XML: ${xr.account} | script: ${sr.account}`);
    notes.push(`Both copies allow ${xr.paths.length} desktop apps and ${xr.aumids.length} packaged apps.`);
  }
  return {
    ok: failures.length === 0,
    failures,
    warnings,
    notes
  };
}
Object.assign(__ds_scope, { checkKioskAssignedAccess });
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/es-participant-kiosk/designs/participant-device/config/check-assigned-access.js", error: String((e && e.message) || e) }); }

// exports/es-participant-kiosk/designs/participant-device/doc-page.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <doc-page> — paged-document shell for printable HTML.
 *
 * FIRST, decide how the document paginates — up front, before building:
 *
 * - FLOWING document (the default): write the whole document as one
 *   normal HTML flow inside <doc-page>; the browser's print engine
 *   splits it onto pages at export. Use for long-form documents with a
 *   single text flow: reports, memos, letters, essays.
 * - EXPLICIT pagination: a fixed set of pre-paginated pages, one
 *   <section class="page"> child per page. Use when the user asks for a
 *   specific page count, or the design implies one: a one-page resume, a
 *   two-sided flier, a poster, a certificate, a brochure — any richly
 *   laid-out document without a single text flow.
 * - If in doubt, ask the user as part of the build.
 *
 * PAGE SIZING — paper differs by country (letter vs A4), so the printed
 * sheet is not one fixed truth:
 * - FLOWING documents pin NO paper size: the print engine paginates
 *   onto the user's real paper, and the content reflows to it.
 * - EXPLICITLY PAGINATED documents print each page at a FIXED page box
 *   with overflow hidden — letter by default, size="a4" for a clearly
 *   metric user, the user's chosen paper when they export. Design each
 *   page to FILL that box, fitting letter and A4 alike without overlap.
 * - width/height pin an explicit fixed size, ONLY when the user gives
 *   one.
 * Never write your own @page rule or hard-code paper dimensions in the
 * content.
 *
 * Sizing modes (attributes):
 *   (none)                      — portrait: flowing docs use the user's
 *           paper; explicitly paginated pages use the named size box
 *           (letter unless size="a4")
 *   orientation="landscape"     — the same, landscape
 *   width / height              — explicit fixed size, ONLY when the user
 *           gives one (e.g. width="22in" height="30in" for a 22×30
 *           poster): the page IS the design's size, printed at true
 *           dimensions (or scaled onto the user's paper at print time).
 *           Any absolute CSS length: px/in/mm/cm/pt/pc.
 * The component announces the chosen mode to the host app at runtime (a
 * meta tag it injects), so the print path can inject the user's true
 * paper size.
 *
 * On screen the document renders on a desk background: a flowing
 * document as one tall scrolling sheet (Google Docs' pageless view);
 * explicitly paginated documents as one card per page.
 *
 * EXPLICIT pagination usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page>
 *     <section class="page" id="p1">…one page's design…</section>
 *     <section class="page" id="p2">…</section>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * How the page box works, concretely: each .page prints as ONE full-bleed
 * sheet at a FIXED physical size — letter by default (set size="a4" for
 * a clearly metric user), the user's chosen paper when they export —
 * with overflow hidden. Nothing scrolls and nothing reflows onto a next
 * sheet: content that misses the box is CLIPPED. Design each page to
 * FILL that page box, and to fit it — letter and A4 alike — without
 * overlap. Each page is a size container; don't size anything in
 * viewport units (they track the window, not the page), and never set
 * width or height on the .page section itself (the component sizes the
 * page box; an authored height like 100% is meaningless at print and is
 * overridden). The component owns the page box, the screen card chrome,
 * and the page breaks (never add your own break-before/after). Don't mix
 * .page sections with flowing content or header/footer slots in the same
 * document.
 *
 * FLOWING usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page margin="0.75in">
 *     <h1>Title</h1>
 *     <p>…body…</p>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * There is no manual page-splitting — the browser's print engine
 * paginates at export. Standard break-hygiene rules (`break-inside:
 * avoid` on figures, code blocks, images and table rows; `orphans/
 * widows: 3`) are applied so paragraphs and groups split cleanly. On
 * screen and at print, headings default to `text-wrap: balance` and
 * body text to `text-wrap: pretty`; the defaults have zero specificity,
 * so any text-wrap you declare wins.
 *
 * Other attributes:
 *   size    — letter | a4 | legal (default letter). Flowing documents:
 *           preview proportion only — it does NOT pin their printed
 *           paper (the print dialog's paper governs); leave it alone
 *           there. Explicitly paginated documents: it sets the page box
 *           the cards and the pinned @page share (the export dialog's
 *           choice overrides both at print) — set size="a4" for a
 *           clearly metric user. Scaled-fit: names the sheet the fit is
 *           computed against, same a4-for-metric-users advice.
 *   content-width / content-height — the design's own fixed dimensions
 *           (CSS lengths), for scaling a fixed-size design ONTO the
 *           named sheet: content lays out at exactly this size, and the
 *           component scales it to fit that sheet's printable area
 *           (centered horizontally, top-aligned; the export dialog
 *           re-fits to the user's actual paper choice where available).
 *           Both must be set; they do not change the page box. For pages
 *           WITHOUT running header/footer slots.
 *   margin  — printable inset on every page of a FLOWING document
 *           (default 0.75in); margin="0" makes pages full-bleed.
 *           Explicitly paginated pages are always full-bleed.
 *
 * Running header/footer (flowing documents only): give an element
 * `slot="header"` or `slot="footer"` and it repeats on every printed
 * page via `position: fixed`. To keep body text from sliding under it,
 * the component prints inside a single-cell table whose <thead>/<tfoot>
 * are spacers sized to the header/footer height — browsers repeat
 * thead/tfoot on every page, so each sheet's content starts below the
 * header and ends above the footer. On screen the header/footer render
 * once at the top/bottom of the sheet.
 *
 * At print the component injects `@page { margin: 0 }` (which leaves
 * Chrome no margin box to draw its date/URL/page-count header in) and
 * moves the visual margin onto the sheet's own padding. It also marks
 * the document as owning its print CSS (a
 * `meta[name="omelette-owns-print"]` it injects at runtime), so the
 * PDF export never injects page-geometry CSS of its own on top.
 *
 * Print best practices for the content you author:
 * - Multi-column text: use CSS columns (`column-count` +
 *   `column-gap`), never side-by-side flex/grid columns — only real
 *   CSS columns flow and break across pages. `column-span: all` lets
 *   a heading span the columns; `hyphens: auto` (needs `lang` on
 *   the html element) keeps narrow columns readable.
 * - Page breaks in flowing documents: `break-before: page` on an
 *   element that must start a new page (a chapter, an appendix). Add
 *   your own kept-together blocks (callouts, stat tiles, cards) to a
 *   `break-inside: avoid` rule, and keep each one shorter than a page.
 * - Extend `orphans: 3; widows: 3` to any custom text blocks you add
 *   (p and li are covered by default).
 * - Give long tables a <thead> — browsers repeat it on every printed
 *   page.
 * - No `position: fixed`/`sticky` and no viewport units in content:
 *   fixed elements stamp every printed page (running headers/footers go
 *   in the component's slots) and `100vh` mis-sizes at print.
 *
 * Author content as static HTML so the user can click-to-edit any text
 * directly. Do not set width/padding/background on the document body —
 * the component owns the sheet box.
 */
/* END USAGE */

(() => {
  const PAPER = {
    letter: ['8.5in', '11in'],
    a4: ['210mm', '297mm'],
    legal: ['8.5in', '14in']
  };
  const CSS_LENGTH = /^\d+(\.\d+)?(px|in|mm|cm|pt|pc)$/;
  // Unitless "0" is a valid CSS length and the natural way to write
  // margin="0"; normalise it to 0px so max()/calc() (which reject a bare
  // number) keep working.
  const safeLen = (v, fb) => {
    v = (v || '').trim();
    return v === '0' ? '0px' : CSS_LENGTH.test(v) ? v : fb;
  };
  // WebKit (Safari and every iOS browser shell) never repeats a table's
  // thead/tfoot on printed pages (WebKit bug 17205), so the spacer-borne
  // vertical margins of a FLOWING document reach only the first page
  // there. Engine check, not browser check: vendor is 'Apple Computer,
  // Inc.' exactly for WebKit and 'Google Inc.' for Blink.
  const WK_PRINT = /apple/i.test(navigator.vendor || '');
  // CSS length → px number (CSS absolute units are exact: 1in = 96px).
  // Returns NaN for anything safeLen would reject — callers gate on it.
  const PX_PER = {
    px: 1,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
    pt: 96 / 72,
    pc: 16
  };
  const toPx = v => {
    const m = /^(\d+(?:\.\d+)?)(px|in|mm|cm|pt|pc)$/.exec((v || '').trim());
    return m ? parseFloat(m[1]) * PX_PER[m[2]] : NaN;
  };
  const stylesheet = `
    :host {
      position: relative;
      display: block;
      /* When the viewport is narrower than the page, grow to wrap the
       * sheet (plus this padding) instead of staying viewport-width, so
       * the desk background and right margin reach the sheet's far edge
       * in the horizontal scroll. */
      min-width: max-content;
      min-height: 100vh;
      background: #f5f5f4;
      padding: 48px 24px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      --doc-page-w: 8.5in;
      --doc-page-h: 11in;
      --doc-page-margin: 0.75in;
      --doc-hdr-h: 0px;
      --doc-ftr-h: 0px;
      --doc-hdr-pad: 0px;
      --doc-ftr-pad: 0px;
    }
    .sheet {
      width: var(--doc-page-w);
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 2px 10px rgba(20, 20, 19, 0.12);
      border-radius: 7px;
      box-sizing: border-box;
      padding: var(--doc-page-margin);
    }
    .frame { width: 100%; border-collapse: collapse; }
    /* Scaled-fit mode (content-width/content-height): the inner .fit box
     * lays the content out at its authored fixed size and scales it onto
     * the printable area; .fit-box reserves the scaled footprint in flow
     * (transforms don't affect layout) and centers it. Without the mode,
     * both divs are unstyled block pass-throughs. */
    /* Explicit pagination: direct .page children are the pages. The sheet
     * becomes a transparent stack and each page carries the card look on
     * screen; at print each page is exactly one full-bleed sheet. The
     * ::slotted defaults are deliberately weak (document CSS wins), so
     * authored page styling can override any of this. */
    .sheet.paginated {
      background: transparent;
      box-shadow: none;
      border-radius: 0;
      padding: 0;
    }
    .paginated ::slotted(.page) {
      position: relative;
      display: block;
      width: 100%;
      aspect-ratio: var(--doc-page-ar);
      container-type: size;
      overflow: hidden;
      box-sizing: border-box;
      background: #fff;
      border-radius: 7px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      break-inside: avoid;
    }
    .paginated ::slotted(.page:not(:first-child)) { margin-top: 1rem; }
    @media print {
      .sheet.paginated { padding: 0; }
      /* The flowing-document vertical inset lives on the repeating
       * thead/tfoot spacers, not the sheet padding — they must go too,
       * or each full-sheet .page is pushed ~margin down and spills onto
       * a second sheet. Paginated pages are full-bleed by definition
       * (content owns its insets). */
      .sheet.paginated .hdr-space,
      .sheet.paginated .ftr-space { height: 0; }
      .paginated ::slotted(.page) {
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
        /* Physical page-box sizing, no viewport units: Safari resolves
         * 100vh against the window, not the page box, so a vh-sized card
         * paginates wrong there. --doc-page-w/h are the named size by
         * default and are overridden to the user's chosen paper by the
         * export path, so every card is exactly one sheet either way.
         * Width + height (same source values as @page size) rather than
         * width + aspect-ratio: the ratio is a 6-decimal rounding of the
         * same division, and a few millionths of overflow would spill a
         * blank sheet after every page. The screen-only aspect-ratio
         * (preview proportions) must not leak into print. cqh typography
         * tracks the same box.
         *
         * Every declaration is !important: per CSS Scoping, unimportant
         * shadow ::slotted rules LOSE to the document context, so a page
         * section's authored inline style would silently beat this print
         * geometry. A model-authored height:100% did exactly that — the
         * percentage resolves as auto in the all-auto print ancestry, the
         * base rule's size containment turns auto into ZERO, and
         * overflow:hidden then paints nothing: a blank PDF with perfect
         * page boxes. At print the component's geometry is the design's
         * whole contract, so it must win over any authored sizing. */
        aspect-ratio: auto !important;
        width: var(--doc-page-w) !important;
        height: var(--doc-page-h) !important;
        overflow: hidden !important;
      }
      .paginated ::slotted(.page:not(:first-child)) {
        break-before: page !important;
        margin-top: 0 !important;
      }
    }
    .fit-mode .fit-box {
      width: calc(var(--doc-fit-w) * var(--doc-fit-scale));
      height: calc(var(--doc-fit-h) * var(--doc-fit-scale));
      margin: 0 auto;
      break-inside: avoid;
    }
    /* Monolithic at print: Blink slices a transform-scaled child at
     * fragmentainer boundaries mapped in UNSCALED layout coordinates
     * (transforms are paint-time), so the .fit box (authored size, e.g.
     * 1400x990) gets cut at the page's free block space and spills onto
     * a second sheet even though its SCALED footprint fits the page by
     * construction. overflow:hidden makes .fit-box a scroll container —
     * monolithic under fragmentation (css-break-3) — so the scaled
     * content prints atomically on one sheet. No clipping for content
     * within the authored box: .fit-box is calc-sized to exactly the
     * scaled footprint. (Content that bleeds past content-width/height
     * is clipped at the footprint — fit mode's contract; it previously
     * painted beyond it at print.) Print-only, so the screen rendering
     * keeps visible overflow for editor affordances.
     * The export path injects the same rule into frozen copies
     * (print-eval.ts om-print-fit-contain). The .fit-mode scope is
     * load-bearing: .fit-box wraps slotted content in EVERY mode, and an
     * unscoped overflow:hidden would make whole flowing documents
     * monolithic (one truncated sheet). overflow:hidden, never clip —
     * clip is not a scroll container, so not monolithic. */
    @media print {
      .fit-mode .fit-box { overflow: hidden; }
    }
    .fit-mode .fit {
      width: var(--doc-fit-w);
      height: var(--doc-fit-h);
      transform: scale(var(--doc-fit-scale));
      transform-origin: top left;
    }
    .frame td, .frame th { padding: 0; text-align: left; font-weight: inherit; }
    .hdr-space { height: var(--doc-hdr-h); }
    .ftr-space { height: var(--doc-ftr-h); }
    ::slotted([slot="header"]),
    ::slotted([slot="footer"]) { display: block; box-sizing: border-box; }
    @media print {
      :host { background: none; padding: 0; min-width: 0; min-height: 0; }
      .sheet {
        width: auto; margin: 0; box-shadow: none; border-radius: 0;
        padding: 0 var(--doc-page-margin);
      }
      /* The thead/tfoot spacers repeat on every page, so they carry the
       * vertical page margin (which the sheet's own padding cannot, since
       * that padding is consumed once on the first/last page). The running
       * header/footer are fixed inside that band. */
      /* The 0.35in is breathing room between a running header/footer and
       * the body; without one the spacer is exactly the page margin, so a
       * margin="0" full-bleed document gets truly full-bleed pages. */
      .hdr-space { height: max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))); }
      .ftr-space { height: max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))); }
      /* WebKit flowing documents: @page carries the vertical margin (see
       * _syncPrintPageRule), so the spacers keep only whatever a running
       * header/footer needs BEYOND it — page 1 would otherwise double its
       * top inset. Paginated sheets already zero their spacers above. */
      .sheet.wk-print:not(.paginated) .hdr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))) - var(--doc-page-margin))); }
      .sheet.wk-print:not(.paginated) .ftr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))) - var(--doc-page-margin))); }
      ::slotted([slot="header"]) {
        position: fixed; top: 0; left: 0; right: 0; margin: 0;
        padding: calc(var(--doc-page-margin) * 0.45) var(--doc-page-margin) 0;
      }
      ::slotted([slot="footer"]) {
        position: fixed; bottom: 0; left: 0; right: 0; margin: 0;
        padding: 0 var(--doc-page-margin) calc(var(--doc-page-margin) * 0.45);
      }
    }
  `;
  class DocPage extends HTMLElement {
    static get observedAttributes() {
      return ['size', 'width', 'height', 'margin', 'orientation', 'content-width', 'content-height'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._mo = typeof MutationObserver === 'function' ? new MutationObserver(() => this._scheduleMeasure()) : null;
    }

    /** The named paper's [w, h], swapped when orientation="landscape".
     *  Only the named size swaps — explicit width/height are exact values
     *  the author already oriented. */
    _paperSize() {
      const named = PAPER[(this.getAttribute('size') || '').toLowerCase()] || PAPER.letter;
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? [named[1], named[0]] : named;
    }
    get pageWidth() {
      return safeLen(this.getAttribute('width'), this._paperSize()[0]);
    }
    get pageHeight() {
      return safeLen(this.getAttribute('height'), this._paperSize()[1]);
    }
    get pageMargin() {
      return safeLen(this.getAttribute('margin'), '0.75in');
    }

    /** Scaled-fit mode's content box [w, h] as CSS lengths, or null when
     *  the mode is off (either attribute missing/invalid/zero — a partial
     *  declaration falls back to normal flow rather than guessing). */
    _contentFit() {
      const w = safeLen(this.getAttribute('content-width'), null);
      const h = safeLen(this.getAttribute('content-height'), null);
      if (!w || !h) return null;
      const wPx = toPx(w),
        hPx = toPx(h);
      return wPx > 0 && hPx > 0 ? [w, h, wPx, hPx] : null;
    }
    connectedCallback() {
      if (!this._sheet) this._render();
      this._syncSize();
      this._syncPrintPageRule();
      this._ensureTextWrapDefaults();
      this._ensureOwnsPrintMeta();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      if (this._mo) this._mo.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      this._onResize = () => this._scheduleMeasure();
      window.addEventListener('resize', this._onResize);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this._scheduleMeasure());
      }
      this._scheduleMeasure();
    }
    disconnectedCallback() {
      window.removeEventListener('resize', this._onResize);
      if (this._mo) this._mo.disconnect();
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
      // Drop the head rules when the last doc-page leaves, so a deleted
      // document's @page geometry and text-wrap defaults can't apply to
      // whatever replaces it.
      const survivor = document.querySelector('doc-page');
      if (!survivor) {
        ['doc-page-print', 'doc-page-text-wrap', 'doc-page-owns-print', 'doc-page-fixed-size', 'doc-page-print-sizing'].forEach(id => {
          const tag = document.getElementById(id);
          if (tag) tag.remove();
        });
        // A live deck-stage deferred its own print-sizing meta to ours —
        // hand the page-global meta over so the deck isn't left unmarked.
        const deck = document.querySelector('deck-stage');
        if (deck && typeof deck._ensurePrintSizingMeta === 'function') {
          deck._ensurePrintSizingMeta();
        }
      } else {
        // A departed owner hands each page-global meta to whatever
        // doc-page remains (or it's removed).
        if (typeof survivor._syncFixedSizeMeta === 'function') {
          survivor._syncFixedSizeMeta();
        }
        if (typeof survivor._syncPrintSizingMeta === 'function') {
          survivor._syncPrintSizingMeta();
        }
      }
    }
    attributeChangedCallback() {
      if (!this._sheet) return;
      this._syncSize();
      this._syncPrintPageRule();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      this._scheduleMeasure();
    }
    _render() {
      this._root.innerHTML = `
        <style>${stylesheet}</style>
        <style id="vars"></style>
        <div class="sheet" data-screen-label="Document">
          <table class="frame" role="presentation">
            <thead><tr><th><div class="hdr-space"><slot name="header"></slot></div></th></tr></thead>
            <tbody><tr><td class="body"><div class="fit-box"><div class="fit"><slot></slot></div></div></td></tr></tbody>
            <tfoot><tr><td><div class="ftr-space"><slot name="footer"></slot></div></td></tr></tfoot>
          </table>
        </div>`;
      this._sheet = this._root.querySelector('.sheet');
      this._vars = this._root.getElementById('vars');
    }

    /** Runtime sizing lives in a shadow <style> :host rule, never on the
     *  light-DOM host element, so serialize-persist can't write it back. */
    _syncSize(hdrH, ftrH) {
      // Scaled-fit mode: content at its authored size, scaled onto the
      // printable area (page minus margins on both axes). The factor is a
      // plain number var so calc(length * number) stays valid; 4 decimals
      // keeps the shadow style stable across re-measures. Upscaling is
      // allowed — print transforms are vector, so text and CSS stay crisp
      // (raster images soften, which the catalog bullet warns about).
      const fit = this._contentFit();
      let fitVars = '';
      if (fit) {
        const marginPx = toPx(this.pageMargin) || 0;
        const availW = toPx(this.pageWidth) - 2 * marginPx;
        const availH = toPx(this.pageHeight) - 2 * marginPx;
        const scale = Math.min(availW / fit[2], availH / fit[3]);
        if (scale > 0 && Number.isFinite(scale)) {
          fitVars = '--doc-fit-w:' + fit[0] + ';' + '--doc-fit-h:' + fit[1] + ';' + '--doc-fit-scale:' + scale.toFixed(4) + ';';
        }
      }
      this._sheet.classList.toggle('fit-mode', !!fitVars);
      // Numeric w/h ratio for the paginated page cards' aspect-ratio —
      // aspect-ratio takes a number, not a length ratio, so compute it
      // here (CSS length division isn't portable). 6 decimals keeps the
      // shadow style stable across re-syncs.
      const arW = toPx(this.pageWidth);
      const arH = toPx(this.pageHeight);
      const ar = arW > 0 && arH > 0 ? (arW / arH).toFixed(6) : '0.772727';
      this._vars.textContent = ':host{' + fitVars + '--doc-page-ar:' + ar + ';' + '--doc-page-w:' + this.pageWidth + ';' + '--doc-page-h:' + this.pageHeight + ';' + '--doc-page-margin:' + this.pageMargin + ';' + '--doc-hdr-h:' + (hdrH || 0) + 'px;' + '--doc-ftr-h:' + (ftrH || 0) + 'px;' + '--doc-hdr-pad:' + (hdrH ? '0.35in' : '0px') + ';' + '--doc-ftr-pad:' + (ftrH ? '0.35in' : '0px') + '}';
    }

    /** @page is a no-op inside shadow DOM, so the rule lives in <head>.
     *  Re-appended on every sync so it stays last in source order — the
     *  @page cascade is source-order per descriptor, so this rule wins
     *  over any other @page rule in the document.
     *
     *  The @page SIZE is pinned where the page box IS part of the design:
     *  explicit-fixed-size mode (width + height authored), scaled-fit
     *  mode (the named sheet the fit targets), and explicit pagination
     *  (the named size the cards share — so card and sheet agree on
     *  every print path, and the export path's chosen paper overrides
     *  BOTH with one later rule). For FLOWING documents no paper size is
     *  emitted at all — the true size comes from the user's preference,
     *  injected by the export path or chosen in the print dialog — so a
     *  flowing document never fights the paper it lands on.
     *  margin: 0 is emitted in every mode: it leaves Chrome no margin box
     *  to draw its date/URL/page-count header in, and the visual margin
     *  lives on the sheet's own padding. */
    _syncPrintPageRule() {
      const id = 'doc-page-print';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
      }
      document.head.appendChild(tag);
      // Three print-geometry regimes:
      // - true-size: the page IS the design — pin its exact size.
      // - scaled-fit (content-width/height): the fit factor is computed
      //   against the NAMED paper's printable area, so that paper must
      //   stay pinned or the scaled content overflows a smaller sheet
      //   (the export path re-fits and re-pins at print time on top).
      // - default modes: no paper size — but landscape still needs the
      //   paper-agnostic 'size: landscape' keyword, because the size
      //   descriptor is what carries orientation; without it a landscape
      //   document prints portrait whenever nothing injects a size.
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      // Explicit pagination pins the page box to the SAME values that
      // size the cards (the named size by default, the export path's
      // chosen paper when its later rule overrides both) — card and
      // sheet agree on every print path, and a mismatched real paper
      // shrinks-to-fit in the dialog instead of clipping a Letter card
      // on A4. Declared before the paginated read below so both derive
      // from one check.
      const paginatedNow = this.querySelector(':scope > .page') !== null;
      const sizeDescriptor = this._trueSizePx() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : this._contentFit() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : paginatedNow ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : landscape ? 'size: landscape; ' : '';
      // WebKit never repeats the thead/tfoot spacers that carry a flowing
      // document's vertical page margins (see WK_PRINT above), so pages
      // after the first print edge-to-edge there. Carry the VERTICAL
      // margins on @page for WebKit instead, and the shadow print CSS
      // trims the first-page spacers by the same amount (.sheet.wk-print
      // rules). Horizontal inset stays on the sheet's own padding in
      // every engine. Blink keeps margin: 0 (a nonzero margin there
      // re-opens the box Chrome draws its header furniture in). One cost,
      // learned in testing: Safari's own date/URL headers are a USER
      // dialog setting ("Print headers and footers") that renders in the
      // margin area when room exists — margin: 0 only suppressed it by
      // leaving no room, and no CSS controls it. The export dialog's
      // Safari guide teaches turning the setting off for flowing
      // documents. Explicitly paginated and fixed-size documents keep
      // margin: 0 everywhere: their pages ARE the sheet.
      const wkFlowing = WK_PRINT && !paginatedNow && !this._trueSizePx() && !this._contentFit();
      const marginDescriptor = wkFlowing ? 'margin: ' + this.pageMargin + ' 0; ' : 'margin: 0; ';
      // Shadow-internal marker (never serialized), kept in lockstep with
      // the @page decision above: the print CSS trims the first-page
      // spacers ONLY while @page actually carries the margins — a
      // true-size or scaled-fit sheet keeps margin: 0 and must keep its
      // spacers too. Re-synced here so attribute changes and pagination
      // flips move both together.
      if (this._sheet) this._sheet.classList.toggle('wk-print', wkFlowing);
      tag.textContent = '@page { ' + sizeDescriptor + marginDescriptor + '} ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; height: auto !important; overflow: visible !important; } ' + 'h1,h2,h3,h4,h5,h6 { break-after: avoid; } ' + 'figure,pre,blockquote,img,svg,tr { break-inside: avoid; } ' + 'p,li { orphans: 3; widows: 3; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; ' + 'backdrop-filter: none !important; -webkit-backdrop-filter: none !important; } ' + '*, *::before, *::after { animation-delay: -99s !important; animation-duration: .001s !important; ' + 'animation-iteration-count: 1 !important; animation-fill-mode: both !important; ' + 'animation-play-state: running !important; transition-duration: 0s !important; } }';
    }

    /** Typographic defaults for document text: balance headings, avoid
     *  widowed/orphaned words in body copy (browsers without text-wrap
     *  support drop the declarations). Zero-specificity via :where() so
     *  any text-wrap authored on those elements wins; document-level so the
     *  rules reach the slotted (light DOM) content — shadow styles can't.
     *  data-omelette-injected marks the tag for the host editor to strip
     *  at serialize, so it is never written back as authored source. */
    _ensureTextWrapDefaults() {
      if (document.getElementById('doc-page-text-wrap')) return;
      const tag = document.createElement('style');
      tag.id = 'doc-page-text-wrap';
      tag.setAttribute('data-omelette-injected', '');
      tag.textContent = ':where(h1,h2,h3,h4,h5,h6){text-wrap:balance}' + ':where(p,li,blockquote,figcaption){text-wrap:pretty}';
      document.head.appendChild(tag);
    }

    /** Declares that this document owns its print CSS. The instant-PDF
     *  export checks for the meta by NAME PRESENCE alone (content is
     *  ignored) and skips its automatic print-CSS injections, so the
     *  component's @page geometry is never overridden by a heuristic.
     *  data-omelette-injected keeps it out of serialized source. */
    _ensureOwnsPrintMeta() {
      if (document.getElementById('doc-page-owns-print')) return;
      const tag = document.createElement('meta');
      tag.id = 'doc-page-owns-print';
      tag.name = 'omelette-owns-print';
      tag.content = 'true';
      tag.setAttribute('data-omelette-injected', '');
      document.head.appendChild(tag);
    }

    /** This page's valid true-size page box (explicit width AND height)
     *  as [w, h] px ints, or null when the mode is off. */
    _trueSizePx() {
      if (!safeLen(this.getAttribute('width'), null) || !safeLen(this.getAttribute('height'), null)) return null;
      const w = Math.round(toPx(this.pageWidth));
      const h = Math.round(toPx(this.pageHeight));
      return w > 0 && h > 0 ? [w, h] : null;
    }

    /** True-size pages (explicit width AND height) also declare the page
     *  box as the preview size: the in-app preview reads
     *  meta[name="omelette-fixed-size"] (content "W,H" in px ints) and
     *  scales the sheet into view — without it an 18in poster previews at
     *  true size with scrollbars. Never overrides an author-set meta
     *  (only the component's own id is managed). The meta is page-global
     *  while doc-page instances are not, so every sync recomputes the
     *  page-wide owner — the first connected true-size doc-page — and a
     *  non-true-size sibling's sync can never delete the owner's meta.
     *  Removed when no true-size page remains (the owner's disconnect
     *  re-syncs via any survivor) or when an author-set meta exists. */
    _syncFixedSizeMeta() {
      const id = 'doc-page-fixed-size';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-fixed-size"]:not([data-omelette-injected])');
      // The page-wide owner, not this instance: an upgraded true-size page
      // anywhere in the document keeps the meta alive and sized.
      let box = null;
      for (const el of document.querySelectorAll('doc-page')) {
        box = typeof el._trueSizePx === 'function' ? el._trueSizePx() : null;
        if (box) break;
      }
      if (!box || authored) {
        if (own) own.remove();
        return;
      }
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-fixed-size';
      tag.content = box[0] + ',' + box[1];
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }

    /** This page's print-sizing mode: 'fixed' when an explicit width AND
     *  height are authored (the page is the design's own size), else the
     *  default paper in the authored orientation. */
    _printSizingMode() {
      if (this._trueSizePx()) return 'fixed';
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? 'default-landscape' : 'default-portrait';
    }

    /** Announces the print-sizing mode to the host app:
     *  meta[name="omelette-print-sizing"] with content 'default-portrait',
     *  'default-landscape', or 'fixed' (fixed pages also carry the
     *  omelette-fixed-size meta with the page box in px). The export path
     *  probes it to decide what true paper size to inject at print time —
     *  in the default modes the component emits no paper size of its own.
     *  Same page-global ownership rules as the fixed-size meta above:
     *  first connected doc-page owns it, an authored meta is never
     *  overridden, removed when no doc-page remains. */
    _syncPrintSizingMeta() {
      const id = 'doc-page-print-sizing';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-print-sizing"]:not([data-omelette-injected])');
      // A fixed page wins outright (mirroring the fixed-size loop above,
      // so the two metas can never contradict each other in a mixed
      // multi-page document); otherwise the first page's mode holds.
      let mode = null;
      for (const el of document.querySelectorAll('doc-page')) {
        if (typeof el._printSizingMode !== 'function') continue;
        const m = el._printSizingMode();
        if (m === 'fixed') {
          mode = m;
          break;
        }
        if (mode === null) mode = m;
      }
      if (!mode || authored) {
        if (own) own.remove();
        return;
      }
      // A deck-stage that connected first injected its own meta and
      // defers to any existing one — take it over, or the document ends
      // up with two conflicting injected metas (a doc-page page is the
      // document; the deck re-ensures its meta if every doc-page leaves).
      const deckMeta = document.getElementById('deck-stage-print-sizing');
      if (deckMeta) deckMeta.remove();
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-print-sizing';
      tag.content = mode;
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }
    _scheduleMeasure() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        this._measure();
      });
    }

    /** Slot heights feed the print spacers (--doc-hdr-h / --doc-ftr-h), so
     *  they re-measure on content mutation, resize, and font load. The
     *  same pass detects explicit pagination (direct .page children) and
     *  toggles the sheet between the flowing-document card and the
     *  page-per-card stack — content edits can add or remove pages at any
     *  time, so this tracks the same mutations the measurement does. */
    _measure() {
      const hdr = this.querySelector(':scope > [slot="header"]');
      const ftr = this.querySelector(':scope > [slot="footer"]');
      const wasPaginated = this._sheet.classList.contains('paginated');
      this._sheet.classList.toggle('paginated', this.querySelector(':scope > .page') !== null);
      // The WebKit @page margin is flowing-only, so a pagination flip
      // must re-emit the rule (content edits can add or remove .page
      // sections at any time).
      if (this._sheet.classList.contains('paginated') !== wasPaginated) {
        this._syncPrintPageRule();
      }
      this._syncSize(hdr ? hdr.offsetHeight : 0, ftr ? ftr.offsetHeight : 0);
    }
  }
  if (!customElements.get('doc-page')) {
    customElements.define('doc-page', DocPage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/es-participant-kiosk/designs/participant-device/doc-page.js", error: String((e && e.message) || e) }); }

// exports/es-participant-kiosk/designs/participant-device/rebuild-with-comments.js
try { (() => {
// Export renamed from `rebuildWithComments` to `rebuildKioskDocWithComments` for this bundle, so it does not
// collide with the copy in the APM Design System project. Import it by the new name.
// Rebuild the Participant Kiosk DDD from content.txt AND re-inject the V1.1 review
// comments so they survive every rebuild. Import from run_script via blob URL:
//   const src = await readFile('designs/participant-device/rebuild-with-comments.js');
//   const { rebuildKioskDocWithComments } = await import(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
//   await rebuildKioskDocWithComments({ readFile, readFileBinary, saveFile, log }, { version: 'V1.2', versionRows: [...] });
async function rebuildKioskDocWithComments(h, opts) {
  const {
    readFile,
    readFileBinary,
    saveFile,
    log
  } = h;
  const version = opts.version || 'V1.2';
  const outPath = opts.outPath || 'designs/participant-device/output/APM_DDD_Participant_Kiosk_' + version + '.docx';

  // ---- 1. build the docx from content.txt ----
  const builderSrc = await readFile('templates/detailed-design/authoring/docx-builder.js');
  const {
    buildDocx
  } = await import(URL.createObjectURL(new Blob([builderSrc], {
    type: 'text/javascript'
  })));
  await buildDocx(h, 'templates/detailed-design/authoring/apm-master.docx', 'designs/participant-device/content.txt', 'designs/participant-device/figs/', outPath, {
    relPrefix: 'rIdPK',
    imgPrefix: 'pkfig',
    idBase: 9900,
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
    versionRows: opts.versionRows
  });

  // ---- 2. zip helpers ----
  const td = new TextDecoder(),
    te = new TextEncoder();
  async function unzip(path) {
    const blob = await readFileBinary(path);
    const buf = new Uint8Array(await blob.arrayBuffer());
    const dv = new DataView(buf.buffer);
    let eocd = -1;
    for (let i = buf.length - 22; i >= 0; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    const count = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true);
    const entries = [];
    for (let i = 0; i < count; i++) {
      const nl = dv.getUint16(off + 28, true),
        el = dv.getUint16(off + 30, true),
        cl = dv.getUint16(off + 32, true);
      entries.push({
        name: td.decode(buf.slice(off + 46, off + 46 + nl)),
        method: dv.getUint16(off + 10, true),
        compSize: dv.getUint32(off + 20, true),
        lho: dv.getUint32(off + 42, true)
      });
      off += 46 + nl + el + cl;
    }
    const out = [];
    for (const e of entries) {
      const nl = dv.getUint16(e.lho + 26, true),
        el = dv.getUint16(e.lho + 28, true);
      const s = e.lho + 30 + nl + el;
      const d = buf.slice(s, s + e.compSize);
      out.push({
        name: e.name,
        bytes: e.method === 0 ? d : new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())
      });
    }
    return out;
  }

  // ---- 3. comment parts from the reviewed copy ----
  const src = opts.commentsSource || 'uploads/APM_DDD_Participant_Kiosk_V1.1.docx';
  const vSrc = await unzip(src);
  const want = ['word/comments.xml', 'word/commentsExtended.xml', 'word/commentsIds.xml', 'word/commentsExtensible.xml', 'word/people.xml', 'word/_rels/comments.xml.rels'];
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
  const threads = opts.threads || [{
    ids: [9, 10, 11],
    marker: 'Requirement from the business review: participants who download documents'
  }, {
    ids: [29, 30, 31, 32, 33, 34],
    marker: 'identifiable to network and security tooling by account as well as by hostname'
  }, {
    ids: [61, 62, 63],
    marker: 'access is controlled by a pre-shared key deployed to devices by Intune policy'
  }, {
    ids: [70, 71, 72, 73, 74],
    marker: 'standard DNS forwarders'
  }];
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
    if (!rels.includes('Target="' + target + '"')) rels = rels.replace('</Relationships>', '<Relationship Id="rIdCm' + n++ + '" Type="' + type + '" Target="' + target + '"/></Relationships>');
  }
  byName['word/_rels/document.xml.rels'].bytes = te.encode(rels);
  const all = built.filter(p => !want.includes(p.name)).concat(cparts);
  for (const p of all) if (byName[p.name]) p.bytes = byName[p.name].bytes;

  // ---- 5. rezip (store) ----
  const crcTable = (() => {
    const t = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  const crc32 = b => {
    let c = -1;
    for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xFF] ^ c >>> 8;
    return (c ^ -1) >>> 0;
  };
  let size = 22 + 1024;
  for (const p of all) size += 76 + 2 * p.name.length + p.bytes.length;
  const out = new Uint8Array(size);
  const ov = new DataView(out.buffer);
  let pos = 0;
  const central = [];
  for (const p of all) {
    const nb = te.encode(p.name);
    const crc = crc32(p.bytes);
    central.push({
      nb,
      crc,
      size: p.bytes.length,
      off: pos
    });
    ov.setUint32(pos, 0x04034b50, true);
    ov.setUint16(pos + 4, 20, true);
    ov.setUint32(pos + 14, crc, true);
    ov.setUint32(pos + 18, p.bytes.length, true);
    ov.setUint32(pos + 22, p.bytes.length, true);
    ov.setUint16(pos + 26, nb.length, true);
    out.set(nb, pos + 30);
    out.set(p.bytes, pos + 30 + nb.length);
    pos += 30 + nb.length + p.bytes.length;
  }
  const cdStart = pos;
  for (const c of central) {
    ov.setUint32(pos, 0x02014b50, true);
    ov.setUint16(pos + 4, 20, true);
    ov.setUint16(pos + 6, 20, true);
    ov.setUint32(pos + 16, c.crc, true);
    ov.setUint32(pos + 20, c.size, true);
    ov.setUint32(pos + 24, c.size, true);
    ov.setUint16(pos + 28, c.nb.length, true);
    ov.setUint32(pos + 42, c.off, true);
    out.set(c.nb, pos + 46);
    pos += 46 + c.nb.length;
  }
  ov.setUint32(pos, 0x06054b50, true);
  ov.setUint16(pos + 8, central.length, true);
  ov.setUint16(pos + 10, central.length, true);
  ov.setUint32(pos + 12, pos - cdStart, true);
  ov.setUint32(pos + 16, cdStart, true);
  pos += 22;
  await saveFile(outPath, new Blob([out.slice(0, pos)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }));
  log('rebuilt with comments:', outPath, pos, 'bytes,', all.length, 'parts, threads:', threads.length);
  return outPath;
}
Object.assign(__ds_scope, { rebuildKioskDocWithComments });
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/es-participant-kiosk/designs/participant-device/rebuild-with-comments.js", error: String((e && e.message) || e) }); }

// exports/es-participant-kiosk/policies/ca-policies.js
try { (() => {
// Parsed from policies/APM-Conditional-Access-Policies-Export.csv (tenant export, 7 Aug 2026).
// n=name s=state(on|ro|off) u=users g=group count a=apps r=grant rules
window.CA_POLICIES = [{
  "n": "APM Pilot Block Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "APM Pilot Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "Deny Legacy Auth",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "Microsoft.EA.Account_MFA_Required",
  "s": "on",
  "u": "63e569df-3857-41c5-9150-155fa929a66c",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AllUsers_WVDApp_MFAtimeout",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "mfa;compliantDevice;domainJoinedDevice"
}, {
  "n": "AdminAccounts_WVD_DomainDevice",
  "s": "on",
  "u": "",
  "g": 4,
  "a": "3 apps",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "apm-cap-pwdstate",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "AllUsers_Office365Mobile_CompliantDeviceRollout",
  "s": "on",
  "u": "",
  "g": 5,
  "a": "Office365",
  "r": "compliantDevice;compliantApplication"
}, {
  "n": "AllUsers_ZeroTrustApps_AzureADHybridDevice",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_PaloAltoCaptivePortal_ServiceLevelOneDomainDevice",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "AllUsers_AllAccess_DeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "AllUsers_AllAccess_MFAorDeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "AllUsers_Office365_DeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_Office365Mobile_ManagedAppRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "compliantApplication"
}, {
  "n": "AllUsers_Sharepoint_DeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "AdminAccounts_AllAccess_BlockNonJumphostDevices",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "AdminAccounts_WVD_BlockNonAdminDevices",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "AdminAccounts_AllAccess_SigninTimeout",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "Guests_Everything_MFARequired",
  "s": "ro",
  "u": "GuestsOrExternalUsers",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AdminRoles_Everything_RequireDevice",
  "s": "ro",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_AllAccess_DeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "domainJoinedDevice;compliantApplication"
}, {
  "n": "AllUsers_AllAccess_MFAorDeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;domainJoinedDevice;compliantApplication"
}, {
  "n": "AllUsers_Office365_DeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_Office365Mobile_ManagedAppRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "compliantApplication"
}, {
  "n": "AllUsers_Sharepoint_DeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "AdminAccountsPilot_AllAccess_BlockNonJumphostDevices",
  "s": "off",
  "u": "d6e7a686-bc33-40e3-9a4d-fd1d9f7b33ac;d591bed7-60bc-48a6-9023-ab8e859291ba",
  "g": 0,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "Singapore Block Onedrive",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "AllUsers_UnapprovedCountries_Block",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "LimitedUsers_EmailOnly_Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "mfa"
}, {
  "n": "AdminRoles_Everything_RequireMFA",
  "s": "ro",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AllUsers_AllAccess_BlockLegacy",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_Biosymm MFA Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "POC_EarlyAccess_Construct-Health MFA policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "POC_EarlyAccess_My-Integra MFA policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "POC_EarlyAccess_CA_BlockAllApps_Biosymm",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_CA_BlockAllApps_Construct-Health",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_CA_BlockAllApps_My-Integra",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_EarlyAustralia MFA Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "LifeCare SharePoint Restrictions",
  "s": "off",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": ""
}, {
  "n": "AllUsers_AzureAppRegistrations",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "GuestAccess_Mobility_CA MFA Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "6 apps",
  "r": "mfa"
}, {
  "n": "GuestAccess_Mobility_CA BlockAllApps Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "AllUsers_AllAccess_DataSov",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "AzureAD CA Staging V2",
  "s": "on",
  "u": "",
  "g": 4,
  "a": "All",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "AtlasAUUsers_NonProd_RequireAUIPs",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "AtlasAUUsers_Prod_RequireAUIPs",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "GuestAccess_ADA_CA_AllowADAAppsOnly",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "All",
  "r": "block"
}, {
  "n": "AdminRoles_Never_Persistent_Token",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": ""
}, {
  "n": "GuestAccess_ADA_CA MFA Policy",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "33 apps",
  "r": "mfa"
}, {
  "n": "AdminRoles_Risky_Sign-ins_MFA",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AdminRoles_RiskyUsers_MFA_Password_Reset",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "mfa;passwordChange"
}, {
  "n": "Microsoft-managed: Multifactor authentication for per-user multifactor authentication users",
  "s": "on",
  "u": "690cff08-5735-497d-8a78-657ef8a66228;54343a72-487b-4e1b-9b62-c95f186f9919;9022d72e-3ba6-46e3-8408-5b599f42aa9f;b0d6993f-000a-4b4c-9d07-91d4d265d1f3;8dab1eec-c169-4f8f-b566-9ef0cb4649d6;c6336ea5-182d-4402-b146-958e098499f5;9360cc90-9d31-4044-ac86-a6b6cc7a2644;d1823e11-41e3-4ac4-9905-82eab5bd9e83;af058684-b191-4dd6-b2bd-633ac4c2c06d;b972abcc-6527-455f-a092-564cc1cdba16;294cb67b-c316-478f-b091-78f092469945;a3bcf597-ee2b-4a1c-90cb-f3e95c226586;ffe369d4-f8de-44d8-8a49-f56080b81cbc;1cea1751-61a4-4175-95ab-6efcbf5c8a8c;2f1fb3ae-4ffb-4731-93d7-83d21612dbfc;be1e89cf-cff5-4b97-ae5c-fc065825f4cd;ccb04fec-5e67-40c3-b9f8-b0f5ee4b6ae1;84195937-71c0-461e-b1bf-73a3bc2eaf04;c25a8d2b-f26b-4929-8490-eddad4715833;acfc6bc4-6cb4-433d-8700-5495079c2397",
  "g": 0,
  "a": "All",
  "r": ""
}, {
  "n": "Microsoft-managed: Multifactor authentication for admins accessing Microsoft Admin Portals",
  "s": "ro",
  "u": "",
  "g": 0,
  "a": "AdminPortals",
  "r": "mfa"
}, {
  "n": "CA-100 - All Users & Guests - All Apps - Legacy Protocols - Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-101 - All Users & Guests - All Apps - Allow - Require MFA",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "CA-102 - All Users & Guests - All Apps - Locations exc. AU, Corporate - Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-103 - All Users & Guests - All Apps - Any device exc. Android, iOS,  Windows, macOS - Block",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-104 - All Users & Guests - All Apps - High Sign In Risk - Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-200 - Org Users - Microsoft 365 - Windows, macOS - Client Apps - Allow - Require Hybrid or Compliance",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "CA-201 - Org Users - All Apps - Browser - BYOD - Allow - No Persistence",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": ""
}, {
  "n": "CA-203 - Org Users - All Apps - High User Risk - Allow - Require MFA &  Password Reset",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;passwordChange"
}, {
  "n": "CA-204 - Org Users - Entra Join - Allow - Require MFA",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "not set",
  "r": "mfa"
}, {
  "n": "CA-400 - Administrators - All Apps - Devices exc. Windows - Block",
  "s": "ro",
  "u": "",
  "g": 2,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-402 - Administrators - All Apps - Locations exc. DC - Block",
  "s": "ro",
  "u": "",
  "g": 2,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-403 - Administrators - All Apps - Allow - No Persistence--",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "All",
  "r": ""
}, {
  "n": "CA-500 - Guests - All Apps - Locations exc. AU, Corporate - Block",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-501 - Guests - All Apps - Locations exc. AU, Corporate - Block COPY",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-204 - Org Users - iChris - ATO Requirements - Allow - Require Hybrid",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "5 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-401 - Administrators - All Apps - Allow - Require Phish Resistant MFA",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "CA-205 - Org Users - iChris - ATO Requirements - Allow - Require MFA",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "5 apps",
  "r": ""
}, {
  "n": "CA-205 - Org Users - AllApps - ATO Requirements - Allow - No Persistence",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "CA-206 - SACA Users - Dynamics - Allow - Require Hybrid or Intune Compliant",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "CA-207 - SACA Users - Dynamics ? Block - NonAUIPs",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "AdminAccounts_RestrictInternetAccess_JumphostDevices",
  "s": "ro",
  "u": "dc0b9741-04e5-4736-b9de-c60c49dac398",
  "g": 0,
  "a": "4 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-207 - SACA Users - Dynamics ? Allow - Require AU",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "GuestAccess_ADA_CA_AllowMyProfileOnly",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "Email Ingestion App Policy",
  "s": "ro",
  "u": "9eabae13-a1c5-4728-9b83-40e88373ea9e",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-105 - All Users & Guests - Block access from Bad IPs",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-208 ? Org Users ? Selected Apps ? Device Required",
  "s": "off",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-209 ? Org Users (LACs) ? Selected Apps ? Deny ? Outside Australia",
  "s": "off",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-360 - NDIS communities ? PAT - Require MFA - Allow",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "mfa"
}, {
  "n": "AllUsers_Office365Mobile_CompliantDeviceRollout_Reporting",
  "s": "ro",
  "u": "",
  "g": 5,
  "a": "Office365",
  "r": "compliantDevice;compliantApplication"
}, {
  "n": "AzureAD CA Staging V2 - Reporting",
  "s": "ro",
  "u": "",
  "g": 4,
  "a": "All",
  "r": "mfa;domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-208 ? Org Users ? Selected Apps ? Device Required - Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-502 - Guests (Assure) - PowerBI - Locations exc. AU - Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-503 - Guests (Assure) - PowerBI - Require MFA - Allow",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "CA-504 - Guests (Assure) - PowerBI - Risky sign ins - Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "CA-362 - NDIS communities ? Promapp - Require MFA - Allow",
  "s": "on",
  "u": "d2dd0c36-778d-45d6-affc-4db7a216dc72;7fb242c7-8218-4f00-93fe-0be29ffa3c36;0c99932a-887d-4706-9531-1fc363e90cc5",
  "g": 0,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "CA-364 - NDIS communities ? PowerBI - Require MFA - Allow",
  "s": "on",
  "u": "d2dd0c36-778d-45d6-affc-4db7a216dc72;7fb242c7-8218-4f00-93fe-0be29ffa3c36;3c57e0d8-8f74-44b5-811e-f71ff3c4b235;0c99932a-887d-4706-9531-1fc363e90cc5;d09a441c-a384-442d-b306-31e9c115b724;c67bb9db-434a-4a3c-b4a4-c90565483441",
  "g": 1,
  "a": "2 apps",
  "r": "mfa"
}, {
  "n": "CA-262 - All Users exc. NDIS & External ? Promapp - Require Managed devices - Allow",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-263 - All Users exc. NDIS & External ? PowerBI - Require Managed devices - Allow",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "zzADA_Block_Policy_Test_20250626",
  "s": "ro",
  "u": "6f259abd-c3ca-49bd-b1ff-21326f7c2040",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-404 - Administrators - Office 365_AVD - Allow - Token Protection",
  "s": "ro",
  "u": "",
  "g": 2,
  "a": "5 apps",
  "r": ""
}, {
  "n": "CA-361 - NDIS communities ? PAT - Location exc. AU ? Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-363 - NDIS communities ? Promapp - Location exc. AU ? Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-365 - NDIS communities ? PowerBI - Location exc. AU ? Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-260 - All Users exc. NDIS & External ? PAT - Require Managed devices - Allow",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-261 - All Users exc. NDIS & External ? PAT - Location exc. AU ? Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-300 - EncompassCare Users ? Require MFA - Require Managed devices - Allow",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "CA-106 - All Users & Guests - All Apps - Allow - Require Phish Resistant MFA",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "CA-366 - NDIS communities ? Dynamics - Location exc. AU ? Block",
  "s": "off",
  "u": "0c99932a-887d-4706-9531-1fc363e90cc5;c67bb9db-434a-4a3c-b4a4-c90565483441;3c57e0d8-8f74-44b5-811e-f71ff3c4b235",
  "g": 0,
  "a": "4 apps",
  "r": "block"
}, {
  "n": "CA-367 - All Users exc. NDIS & External ? Dynamics- Require Managed devices - Allow",
  "s": "on",
  "u": "802c205f-c95d-4327-b549-eb40adab51c2;0c99932a-887d-4706-9531-1fc363e90cc5;0ecb5407-62b6-41d1-8e33-89dc1f147567",
  "g": 1,
  "a": "All",
  "r": "mfa;domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-APM-Kiosk-BlockNonWindows",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-BlockWebClient",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-RequireCompliantDevice",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "compliantDevice"
}, {
  "n": "CA-APM-Kiosk-WebOnly-Office",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-DeviceBound",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-BlockExchangeOnline",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-BlockTeams",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-RequireCompliantDevice",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "compliantDevice"
}, {
  "n": "CA-APM-KioskPB-BlockNonKioskDevices",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockNonWindows",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockLegacyAuth",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "None",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockAuthFlows",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockRiskySignIn",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-WebOnlyOffice",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/es-participant-kiosk/policies/ca-policies.js", error: String((e && e.message) || e) }); }

// exports/es-participant-kiosk/policies/environment-config.js
try { (() => {
// APM environment register - what is actually configured in the tenant and estate.
// Distinct from compliance-rules.js (what policy demands): these entries describe live
// configuration, and each carries `interactions` - advisory triggers that fire when a
// design touches something this configuration affects. Interactions never fail a
// compliance run; they surface as a "check this" list with the specific remedy.
window.ENVIRONMENT_CONFIG = [{
  id: 'ENV-ESLZ',
  name: 'Azure Enterprise-Scale Landing Zone (APAC)',
  source: 'APM Azure Landing Zone (APAC) - DetailedDesign v1.1 (uploads/) and the ESLZ Reference Corpus (reference/eslz/, 4 parts)',
  cat: 'Configuration',
  owner: 'Head of Digital Transformation and Architecture',
  appliesWhen: {
    min: 3,
    any: [/aus-sub-|azure subscription|subscription (id|scope|placement)/i, /\bvnet\b|virtual network/i, /resource group/i, /management group/i, /azure policy|policy initiative/i, /route table|user[- ]defined route|\budr\b/i, /network security group|\bnsg\b/i, /private endpoint|private dns zone/i, /availability (set|zone)/i, /10\.[45]\d\.\d+\.\d+/, /auea-|ause-/i, /peering|hub-spoke/i]
  },
  facts: [['Topology', 'Hub-spoke, Australia East (10.40.0.0/16) and Australia Southeast (10.50.0.0/16). All spokes peer to the regional connectivity hub; Sandbox and Acquisitions do not peer.'], ['Management groups', 'AUS-MG-PLATFORM (CONNECTIVITY, IDENTITY, SECURITY, MANAGEMENT), AUS-MG-PROD/DEV/SIT/UAT-CONTROLLED and -STANDARD, AUS-MG-ACQUISITIONS, AUS-MG-SANDBOX. Security domains: controlled and standard.'], ['Subscriptions', 'aus-sub-connectivity, -identity, -management, -{prod|dev|sit|uat}-{controlled|standard}-001, -avd-controlled-001, -sandbox-001, -acquisitions-001.'], ['AVD spoke', 'aus-sub-avd-controlled-001 / auea-vnet-avd-ctrl-001 = 10.40.88.0/23, Australia East, controlled domain - the landing place for the AVD SOEs.'], ['DNS', 'Azure DNS Private Resolver in the connectivity subscription; AD DS domain controllers in aus-sub-identity (auea-vnet-identity-001 10.40.4.0/24 / ause 10.50.4.0/24).'], ['Public IPs', 'Azure Policy denies public IP creation in all management groups except the connectivity subscription (Design Decision 17).'], ['RBAC', 'PIM-managed, eligible time-bound Role-Admin-AzureMG* groups per management group; no standing access.'], ['Compliance frame', 'MCSB, RFFR, ISM, APM Policy named as certification targets.'], ['Subscription count', 'Design says 13, the as-built placement table lists 15 rows including AVD, and the policy baseline assigns ASC Default to "all 15". UNRECONCILED - present all three, never pick one silently.'], ['Actually deployed', 'Hub, identity, management, prod-controlled and prod-standard only (40 subnets). Dev, SIT, UAT, AVD, sandbox and acquisitions spokes are designed, not deployed.'], ['Placement anomalies', 'Three, preserved from the as-built table: sandbox shown directly under APM not AUS-MG-SANDBOX; acquisitions shown under AUS-MG-SANDBOX; AVD absent from the 13-subscription design table and shown directly under APM.'], ['Archetype sizing', 'Connectivity /23 (507 usable), Identity /24 (251), Production /22 (1019) per security domain, Dev/SIT/UAT /23 each per domain, Sandbox /24, Management /24 at x.255.0/24, AVD /23. Every VNet carries reserved additional CIDRs for contiguous growth. Unallocated in AUEA: 10.40.96-247.'], ['Mandatory tags', '13: Criticality, application-id, business-service, apm-security-domain, environment, owner, technicalcontact, cost-centre, operationalteam, service-component-type, backup, enableupdate, update-stage. Two drive automation silently: backup (BasicVMBackup / StandardVMBackup / StandardSQLVMBackup / StandardSQLVM(OS)Backup enrol into BK01-BK08) and update-stage (Lead / auto-patch01 / auto-patch02 select the AUM maintenance configuration).'], ['Policy baseline', '218 assignments: 175 policies + 43 initiatives; 32 custom, 186 built-in; enforcement mode Default on all. Scope split: APM intermediate root 99, AUS-MG-PLATFORM 8, AUS-MG-REGION 7, AUS-MG-SANDBOX 1, individual subscriptions 103. Stream01 (16 Dec 2025) 202, Stream03 (17 Jul 2026) 16.'], ['RBAC expiry', 'Every management-group role assignment is PIM-eligible and time-bound, all expiring November 2026, in an estate where PIM was formally excluded from the phase (DD6/DD10). Renewal process is UNKNOWN - no corpus file owns it.'], ['Log retention', 'Operational Log Analytics workspace 90 days, security workspace 30 days. NFR 9.9 requires 180 days queryable. Standing non-compliance at RFFR PROTECTED.'], ['Operating model', 'DD69 ratifies portal-managed policy. The AI landing zone assumes everything-as-code with no portal changes. Unresolved collision.'], ['Inbound north-south', 'Required but NOT enabled at handover, pending an external Azure load balancer and route table. The first designed inbound flow (SmartRecruiters webhook via App Gateway WAF_v2 to the N-S NVA to APIM) is unreconciled with that provision.']],
  interactions: [{
    id: 'ENV-ESLZ-1',
    title: 'New Azure resources must land in the right spoke with allocated CIDR',
    trigger: /new (vnet|virtual network|subnet)|deploy(ed|ing)? (in|into|to) azure|function app|logic app|key vault|storage account|azure (vm|virtual machine)/i,
    note: 'Workloads land in the spoke matching their environment and security domain (controlled vs standard); CIDRs are allocated from the ESLZ plan, not invented; Sandbox cannot reach anything.',
    remedy: 'Name the target subscription and VNet from the ESLZ table, request the subnet CIDR from the platform team, and name every resource per the Azure ESLZ Naming Standard (ENV-NAMING).'
  }, {
    id: 'ENV-ESLZ-2',
    title: 'Public IPs are policy-denied outside connectivity',
    trigger: /public (ip|endpoint)|internet-?facing|inbound (traffic|access|connection)/i,
    guard: /azure|vnet|subscription|endpoint/i,
    window: 200,
    note: 'Azure Policy denies public IP creation everywhere except aus-sub-connectivity. Inbound paths go through the North-South Palo Alto set (external LB + UDR), not a workload-attached public IP.',
    remedy: 'Design ingress via the connectivity hub (Application Gateway / N-S firewall). If a workload genuinely needs its own public IP, raise the policy exemption as a decision-register row with the rejection reasons for the hub path.'
  }, {
    id: 'ENV-ESLZ-3',
    title: 'An AVD spoke is designed but not deployed',
    trigger: /\bavd\b|azure virtual desktop|session host|host pool/i,
    note: 'aus-sub-avd-controlled-001 / auea-vnet-avd-ctrl-001 (10.40.88.0/23) is allocated in the controlled domain and appears in the as-built placement table, but the deployed spoke set is hub, identity, management, prod-controlled and prod-standard only. The AVD spoke is PLANNED.',
    remedy: 'Target the allocated AVD spoke rather than requesting a new subscription, size subnets within the /23, and state its deployment as a dependency, not as existing infrastructure.'
  }, {
    id: 'ENV-ESLZ-4',
    title: 'Management-group role assignments expire November 2026',
    trigger: /role assignment|\brbac\b|management group scope|\bpim\b|privileged identity|eligible (role|assignment)/i,
    note: 'Every MG-level role assignment is PIM-eligible and time-bound, all expiring November 2026, in an estate where PIM was formally excluded from the phase (DD6/DD10). The renewal process is UNKNOWN - no corpus file owns it.',
    remedy: 'Acknowledge the expiry explicitly in the identity section, state whether this design depends on an MG-scope assignment, and name the owner who will renew it. A design that creates MG-scope assignments without this acknowledgement is incomplete.'
  }, {
    id: 'ENV-ESLZ-5',
    title: 'Most spokes are designed, not deployed',
    trigger: /spoke|workload subscription|landing zone subscription|target (vnet|subscription)/i,
    note: 'Deployed: hub, identity, management, prod-controlled, prod-standard (40 subnets). Planned only: dev, SIT, UAT, AVD, sandbox, acquisitions, and 5 of the 8 AI Foundry workload spokes.',
    remedy: 'State the deployment status of every spoke the design targets. If it is planned, it is a dependency with an owner and a date, not infrastructure - and the design must not describe it in the present tense.'
  }, {
    id: 'ENV-ESLZ-6',
    title: 'Deployed log retention is below the 180-day NFR',
    trigger: /log analytics|retention|\blaw\b|workspace|sentinel|180 days|audit log/i,
    guard: /azure|log|retention|workspace/i,
    window: 200,
    note: 'Operational workspace retains 90 days, security workspace 30. NFR 9.9 requires 180 days queryable. This is a standing non-compliance at RFFR PROTECTED with no named owner beyond "security team to adjust".',
    remedy: 'State which workspace the design logs to, its actual retention, and whether NFR 9.9 is met or breached. Do not claim 180-day compliance while targeting a 90- or 30-day workspace.'
  }, {
    id: 'ENV-ESLZ-7',
    title: 'DR posture is unreconciled',
    trigger: /disaster recovery|\bdr\b|regional pair|secondary region|australia ?southeast|failover|geo-?redundan|\bgrs\b/i,
    note: 'The deployed baseline actively builds Australia Southeast as regional pair (VNets, GRS+CRR vaults, domain controllers). A single-region multi-zone decision paper is believed ratified but has never been ingested. UNRECONCILED.',
    remedy: 'State which posture the design assumes as an explicit assumption with its risk, cite both sources, and name the owner who will resolve it. Do not silently prefer either.'
  }, {
    id: 'ENV-ESLZ-8',
    title: 'Two tags silently drive backup and patching',
    trigger: /\bvm\b|virtual machine|compute|workload deploy|tag(ging|s)?\b/i,
    guard: /azure|deploy|resource|workload/i,
    window: 200,
    note: '13 mandatory tags apply. backup (BasicVMBackup / StandardVMBackup / StandardSQLVMBackup / StandardSQLVM(OS)Backup) enrols the VM into policies BK01-BK08. update-stage (Lead / auto-patch01 / auto-patch02) selects the Azure Update Manager maintenance configuration. A VM missing either is unprotected and unpatched without erroring.',
    remedy: 'Put all 13 tag values in a table in the design, and argue backup and update-stage explicitly rather than leaving them to build time.'
  }, {
    id: 'ENV-ESLZ-9',
    title: 'CIDRs come from the archetype sizing rules, not from preference',
    trigger: /\/\d{2}\b|cidr|address (space|plan|range)|subnet mask|supernet/i,
    guard: /azure|vnet|spoke|subnet|10\.4|10\.5/i,
    window: 200,
    note: 'Supernets 10.40.0.0/16 (AUEA) and 10.50.0.0/16 (AUSE), symmetric mirror. Connectivity /23, Identity /24, Production /22 per security domain, Dev/SIT/UAT /23 each, Sandbox /24, Management x.255.0/24. Every VNet carries a reserved adjacent block for contiguous growth. Unallocated AUEA space: 10.40.96-247. Sandbox may deliberately overlap because it is never peered.',
    remedy: 'Request the CIDR against the archetype rule, name the reserved growth block adjacent to it, and record any deviation as a decision-register row with options assessed.'
  }, {
    id: 'ENV-ESLZ-10',
    title: 'Policy-as-code collides with the ratified operating model',
    trigger: /policy[- ]as[- ]code|infrastructure as code|\bbicep\b|terraform|gitops|no portal changes|deployment pipeline/i,
    note: 'DD69 ratifies portal-managed policy for the 218 assignments. The AI landing zone design assumes everything-as-code with no portal changes. Neither side has won; this is the single largest codification blocker.',
    remedy: 'State which operating model this design follows and flag the collision as an open item with the design authority as owner. Do not assume the newer document supersedes.'
  }, {
    id: 'ENV-ESLZ-11',
    title: 'Inbound north-south is provisioned but not enabled',
    trigger: /inbound|ingress|webhook|public endpoint|application gateway|app ?gw|\bwaf\b|internet-?facing/i,
    guard: /azure|hub|firewall|spoke|apim/i,
    window: 220,
    note: 'Inbound N-S inspection is required but was NOT enabled at handover, pending an external Azure load balancer and route table. The first designed inbound flow (Internet to App Gateway WAF_v2 to N-S NVA to APIM) is unreconciled with that provision.',
    remedy: 'State the inbound path explicitly, mark it as depending on inbound N-S being enabled, and reconcile it against the external-LB provision rather than assuming one of the two.'
  }]
}, {
  id: 'ENV-PALO',
  name: 'Palo Alto VM-Series hub firewalls',
  source: 'Palo Alto Firewall Deployment As-Built V1.0 (uploads/, Stratus Phase 3)',
  cat: 'Configuration',
  owner: 'Digital Operations (managed network delivery team)',
  appliesWhen: {
    min: 3,
    any: [/aus-sub-|azure subscription/i, /\bvnet\b|virtual network/i, /hub firewall|security policy rule|panorama|vm-series/i, /route table|user[- ]defined route|\budr\b/i, /network security group|\bnsg\b/i, /peering|hub-spoke/i, /auea-|ause-/i, /10\.[45]\d\.\d+\.\d+/]
  },
  facts: [['Placement', 'North-South and East-West VM-Series clusters in the connectivity hub of each region behind Azure Load Balancers (no PAN HA; LB health probes). AE: 2+2 firewalls; ASE: 1+1.'], ['Inspection', 'All north-south (internet, on-premises) and east-west (inter-VNet, same region) traffic is UDR-forced through the firewalls. Default interzone AND intrazone rules overridden to drop + log.'], ['Egress', 'Outbound HTTP rides IPSEC tunnels from the firewalls to Zscaler; non-HTTP is SNATed out the public interfaces. Outbound is allow-listed by URL category and application; proxy-avoidance and anonymizers blocked and logged.'], ['Backhaul', 'Meraki SD-WAN (vMX in the legacy AE landing zone) advertises BGP routes; inspected traffic forwards to the active vMX.'], ['Management', 'Panorama HA (AE active, ASE passive), template stacks + device groups; config changes only via Panorama. SAML (Entra ID) auth with a local break-glass account; admin access only from the high-privileged jump host.'], ['Logging', 'Firewalls to Panorama (2TB rolling disks), then syslog to Microsoft Sentinel via a syslog VM.'], ['Open items', 'Firewall DNS and NTP servers are TBC pending the Infrastructure Team decision. Advanced ACL migration deferred to APM.']],
  interactions: [{
    id: 'ENV-PALO-1',
    title: 'New egress needs Palo security-policy (and possibly NAT) rules',
    trigger: /egress|outbound (traffic|access|connection)|allow[- ]?list|fqdn|reach(es|ing)? the internet|calls? out to/i,
    guard: /azure|vnet|spoke|cloud|subscription/i,
    window: 250,
    note: 'Nothing leaves an Azure spoke without matching a firewall allow rule - outbound is category- and application-allow-listed, dropped by default.',
    remedy: 'List the destination FQDNs, ports and applications in the design (\u00a75.3 named egress) so the Panorama change can be raised verbatim; do not write "standard internet access".'
  }, {
    id: 'ENV-PALO-2',
    title: 'Zscaler tunnels already terminate on the hub firewalls',
    trigger: /zscaler.{0,80}(tunnel|ipsec)|ipsec.{0,80}zscaler|new (ipsec )?tunnel/i,
    note: 'The hub firewalls hold the IPSEC tunnels to Zscaler for Azure-sourced HTTP egress. Site networks tunnel to Zscaler separately via the managed network provider - two distinct tunnel sets.',
    remedy: 'State which tunnel set carries the design\u2019s traffic. A new site or VLAN rides the site tunnels; a new Azure workload rides the hub firewall tunnels - neither needs a new tunnel by default.'
  }, {
    id: 'ENV-PALO-3',
    title: 'DNS and NTP for hub infrastructure are still undecided',
    trigger: /dns (server|resolver|forward)|name resolution|\bntp\b|time (sync|source)/i,
    guard: /azure|hub|firewall|infrastructure/i,
    window: 250,
    note: 'The as-built records firewall DNS/NTP as TBC pending the Infrastructure Team. The resolver of record for spokes is the Azure DNS Private Resolver in connectivity.',
    remedy: 'State the resolver the design actually uses (Private Resolver inbound endpoint for Azure; site DHCP-issued DNS for devices) and flag any dependency on the undecided infrastructure DNS/NTP as an open item with the Infrastructure Team as owner.'
  }]
}, {
  id: 'ENV-NAMING',
  name: 'Azure ESLZ Naming Standard',
  source: 'Azure ESLZ Naming Standards - 17 July 2026 (uploads/)',
  cat: 'Configuration',
  owner: 'Digital Operations',
  appliesWhen: {
    min: 3,
    any: [/aus-sub-|azure subscription/i, /\bvnet\b|virtual network/i, /resource group/i, /management group/i, /storage account/i, /recovery services vault/i, /network security group|\bnsg\b/i, /auea-|ause-/i, /private endpoint/i]
  },
  facts: [['General form', '[region]-[type]-[environment]-[apm security domain]-[descriptor]-[instance], e.g. auea-rg-prod-ctrl-appname-001, ause-nsg-prod-std-web-001. Regions: auea / ause (short: ae / as).'], ['Compact forms', 'VMs and storage use shortform concatenation: aevmpadds001, aestpcappname001, aestxflowlog001. Palo resources always carry "palo" in the RG name.'], ['Management groups', 'ALL CAPS: AUS-MG-[SCOPE]. Subscriptions all lower with full security-domain word: aus-sub-prod-controlled-01.'], ['NSG rules', '[allow|deny]-[ib|ob]-[source]-to-[destination]-[descriptor]-[nn], e.g. allow-ob-azmonitor-to-law-https-01.'], ['Device/Intune objects', 'Separate schema - the APM Intune Naming Schema V1.0 governs Intune policies, groups and device names (already applied in our designs).']],
  interactions: [{
    id: 'ENV-NAMING-1',
    title: 'Azure resource names must follow the ESLZ standard',
    trigger: /resource group|\bvnet\b|virtual network|\bnsg\b|route table|log analytics|recovery services|private endpoint|storage account/i,
    guard: /azure|deploy|creat/i,
    window: 250,
    note: 'Every Azure object in a design is named per the ESLZ standard, including NSG rule names - reviewers reject invented formats.',
    remedy: 'Write the exact names into the design settings tables using the [region]-[type]-[env]-[domain]-[descriptor]-[instance] form; check the compact VM/storage forms for those two types.'
  }]
}, {
  id: 'ENV-TENANT',
  name: 'APM corporate tenant - estate Intune and Entra behaviour',
  source: 'Working knowledge from the Participant Kiosk gap analysis (G-18/19/20) and the SOE Hardening Standard',
  cat: 'Configuration',
  owner: 'APM Digital',
  facts: [['Broad assignments', 'Corporate policies, apps and scripts assigned to All Devices / All Users / broad dynamic groups land on every Entra-joined device unless the device group is excluded.'], ['Password expiry', 'The estate baseline sets a maximum password age on local accounts - it breaks device-local autologon accounts unless the account is exempted and the device group excluded from the policy.'], ['Delivery Optimization', 'Estate DO policy has no group boundary on Entra-joined devices; without a boundary set every device pulls its own update payload over the site WAN link.'], ['Update management', 'Estate Windows Update rings and Patch My PC exist; new device populations join existing rings rather than creating parallel ones.'], ['App Control', 'Estate WDAC/App Control policies exist with script enforcement DISABLED; fleet variants may enable it (the kiosk does).'], ['Conditional Access', 'Tenant CA policy set exists; new device populations need an exclusion sweep and, where blocking is the intent, a device-filter policy.']],
  interactions: [{
    id: 'ENV-TENANT-1',
    title: 'Local accounts hit the estate password-expiry baseline',
    trigger: /local (standard )?(user )?account|auto[- ]?log(on|in)|session account/i,
    note: 'The inherited baseline\u2019s maximum password age applies to local accounts and will break automatic logon fleet-wide on one day.',
    remedy: 'Exempt the account explicitly (PasswordExpires = False), exclude the device group from the estate expiry policy, and add a test that advances the clock past the maximum age.'
  }, {
    id: 'ENV-TENANT-2',
    title: 'New device population needs the corporate-assignment exclusion sweep',
    trigger: /new (dynamic )?(device )?group|dynamic membership|device population|fleet|enrolment profile|autopilot/i,
    note: 'Everything targeting All Devices / All Users lands on the new fleet unless excluded - the single largest configuration risk for special-purpose devices.',
    remedy: 'Enumerate every corporate assignment (policies, apps, scripts, CA) and record per item: applies, excluded, or replaced by a fleet variant. Put the table in the design, not a wiki.'
  }, {
    id: 'ENV-TENANT-3',
    title: 'Delivery Optimization needs a group boundary for any multi-device site',
    trigger: /delivery optimization|update (payload|download|bandwidth)|20 ?mbps|site (wan|link|bandwidth)/i,
    note: 'Without DOGroupId + group download mode, every device at a site pulls its own copy of each update over the constrained site link.',
    remedy: 'Join or extend the DO boundary policy (group mode 2, DOGroupId per site) and state the expected per-site download reduction.'
  }, {
    id: 'ENV-TENANT-4',
    title: 'Blocking access needs a CA device filter, not membership absence',
    trigger: /must not (access|reach|sign in)|block(ed|ing)? (from )?(microsoft 365|m365|office|corporate)|no (corporate|m365) access/i,
    note: 'A device simply not being licensed or grouped does not block anything; the tenant evaluates CA on the device claim.',
    remedy: 'Write an explicit CA block policy with a device filter on the fleet\u2019s naming prefix or group, plus the browser and network layers for unmanaged-device gaps.'
  }]
}, {
  id: 'ENV-CA',
  name: 'Conditional Access policy set - APM corporate tenant',
  source: 'Tenant export 7 Aug 2026 (policies/APM-Conditional-Access-Policies-Export.csv); analysis in policies/APM_CA_Policy_Analysis.html',
  cat: 'Configuration',
  owner: 'APM Cyber Security',
  appliesWhen: {
    min: 1,
    any: [/conditional access|\bca policy\b|\bca-\d{3}\b|sign-?in|authenticat|\bmfa\b|multi-?factor|device filter|block access/i]
  },
  facts: [['Size and enforcement', '116 policies: 68 enforced, 43 report-only, 5 disabled. 37 per cent of the estate grants and denies nothing.'], ['Enforced tenant-wide (all users, all apps)', 'Deny Legacy Auth (block) - CA-100 legacy protocols (block) - CA-102 locations except AU and corporate (block) - CA-104 high sign-in risk (block) - CA-105 bad IPs (block) - CA-201 BYOD browser no persistence (session) - CA-203 high user risk (MFA + password change) - AllUsers_AllAccess_DeviceRequired (compliant OR Entra-joined) - AllUsers_AllAccess_MFAorDeviceRequired (MFA OR Entra-joined).'], ['Report-only, so NOT a control', 'CA-101 tenant-wide MFA - CA-106 and CA-401 phishing-resistant MFA - AdminRoles_Everything_RequireMFA - AdminRoles_Everything_RequireDevice - CA-103 unsupported platforms - CA-400 and CA-402 administrator device and location - Guests_Everything_MFARequired - AllUsers_UnapprovedCountries_Block - AllUsers_AllAccess_BlockLegacy.'], ['A managed device satisfies both enforced grants', 'AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired are both satisfied by an Entra-joined, Intune-compliant device - the second one with no MFA prompt. Any special-purpose fleet that is managed and compliant looks like a corporate device to every existing grant.'], ['Risk-based CA is live', 'CA-104, CA-203, AdminRoles_Risky_Sign-ins_MFA and AdminRoles_RiskyUsers_MFA_Password_Reset are enforced, so Entra ID P2 risk signals are licensed and in use. All of them evaluate a user principal.'], ['Naming convention', 'CA-nnn - audience - apps - condition - action, by series: CA-1xx all users and guests, CA-2xx organisation users, CA-3xx contract and community populations, CA-4xx administrators, CA-5xx guests. CA-100 to CA-106 are in use. Legacy families also present: Scope_App_Control (AllUsers_*, AdminAccounts_*, AdminRoles_*), POC_EarlyAccess_*, GuestAccess_*.'], ['Retired kiosk policies', 'Fourteen in two families: CA-APM-Kiosk-* (seven, all report-only, group 761b688c) and CA-APM-KioskPB-* (seven, six enforced, group e0378201). Both assign to groups of user identities.'], ['Hygiene', 'CA-501 ends in the literal word COPY and is enabled. zzADA_Block_Policy_Test_20250626 is still present. APM Pilot Block Policy and APM Pilot Policy are both enabled and both block all apps. Four duplicated numbers (CA-204, CA-205, CA-207, CA-208). Eight _Reporting twins. Four names with leading or trailing whitespace. Eighteen with a corrupted separator character. Three policies block legacy authentication. Two enabled policies grant MFA under a name that says Block (LimitedUsers_EmailOnly_Block, CA-504).'], ['Export limitation', 'The CSV carries name, state, users, groups, applications and grant rules only. No exclusions, conditions, device filters, locations, platforms, client apps, session controls, authentication strengths or directory-role targets. A blank grant rule means session control or authentication strength, not no control. Request identity/conditionalAccess/policies from Graph for the full object.']],
  interactions: [{
    id: 'ENV-CA-1',
    title: 'A managed fleet satisfies the tenant grants, so blocking must be explicit',
    trigger: /must not (access|reach|sign in)|block(ed|ing)? (from )?(microsoft 365|m365|office|corporate)|no (corporate|m365) access|device filter/i,
    note: 'AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired are enforced for all users against all apps, and an Entra-joined compliant device satisfies both - the second without an MFA prompt. Absence of a licence or a group grants nothing.',
    remedy: 'Write an explicit block policy with a device filter, cite both tenant policies by name as the reason it is required, and back it with browser and network layers for devices the tenant does not recognise.'
  }, {
    id: 'ENV-CA-2',
    title: 'Phishing-resistant and tenant-wide MFA are report-only, so they cannot be cited as controls',
    trigger: /phishing[- ]resistant|multi-?factor|\bmfa\b|authentication strength/i,
    note: 'CA-401 (administrators) and CA-106 (all users and guests) are report-only, as is CA-101. The only enforced MFA grant tenant-wide is MFA OR Entra-joined device, which a managed device satisfies without prompting.',
    remedy: 'Do not cite tenant MFA or phishing-resistant MFA as an inherited or compensating control. If the design needs it, raise enforcement with APM Cyber Security first and record it as an assumption with an owner until confirmed.'
  }, {
    id: 'ENV-CA-3',
    title: 'New Conditional Access objects follow the CA-nnn convention, not the Intune schema',
    trigger: /conditional access (polic|profile)|\bca polic/i,
    note: 'The tenant convention is CA-nnn - audience - apps - condition - action, with number series by audience. The Intune Naming Schema governs Intune objects only. Four numbers are already duplicated, so a proposed number must be checked against the export.',
    remedy: 'Name the policy CA-nnn in the correct series, confirm the number is unused, and state both the name and the number in the design settings table.'
  }, {
    id: 'ENV-CA-4',
    title: 'Country-level location blocking already exists tenant-wide',
    trigger: /geo[- ]?block|country|location[- ]based|non-?au|outside australia|named location/i,
    note: 'CA-102 blocks locations other than Australia and corporate for all users and all apps, and is enforced. CA-105 blocks known-bad IPs. CA-500 and CA-501 cover guests.',
    remedy: 'Cite CA-102 rather than creating a fleet-specific location policy. The tenant already carries one duplicate of this control in report-only state.'
  }, {
    id: 'ENV-CA-5',
    title: 'A group-assigned CA policy silently dies when its group is retired',
    trigger: /retire|decommission|delete the group|remove the (user )?group|group is retired/i,
    guard: /conditional access|\bca\b|polic/i,
    window: 260,
    note: 'Conditional Access assigns to users and groups of users. Fourteen retired kiosk policies assign to two user groups, and six of them are enforced. When the group goes, they match nothing and raise no error.',
    remedy: 'Delete the policies in the same change record as the group, export their sign-in and report-only data as evidence first, and separately remove any exclusion that named the group so no exclusion outlives it.'
  }, {
    id: 'ENV-CA-6',
    title: 'The Conditional Access half of an exclusion register cannot be verified from the standard export',
    trigger: /exclusion register|excluded from|exclude the (device )?group|assignment exclusion/i,
    guard: /conditional access|\bca\b|polic|tenant/i,
    window: 260,
    note: 'The available export has no exclusions column. Nine policies target all users against all apps and cannot be checked.',
    remedy: 'Mark the Conditional Access rows of the exclusion register as unverified, and request identity/conditionalAccess/policies from Graph to close it.'
  }]
}, {
  id: 'ENV-DOCSET',
  name: 'APM solution document set - DDD and TCD templates',
  source: '02 Detail Design Document - Template V0.1 (24 Jun 2026) and 03 Technical Configuration Document V0.1 (21 Jul 2026) (uploads/)',
  cat: 'Configuration',
  owner: 'Head of Digital Transformation and Architecture; Head of Digital Operations; Head of Product Development',
  facts: [['DDD template', 'APM\u2019s own template orders: Introduction, Overview, Business Architecture, Application Architecture, Technology Architecture, Information & Data, Cyber & Security, Service Availability & DR, Service Management - the same spine as our detailed-design standard. Cover carries Project Name, Document Owner, Contact, Program, Division/Unit, Status, Version, Product ID, plus Consultation, References and Derivation, and an SDA Approval sheet.'], ['TCD companion', 'The Technical Configuration Document is the build-level companion: IP addressing, DNS records, load balancing, NAT and firewall rules, compute specs, RBAC groups, accounts, CA rules, AV exclusions, DNS/NTP/logging/monitoring/patching/PKI/SMTP, RPO/RTO, backup/restore, capacity. "Once approved this document serves as de-facto as-built information."'], ['Approval', 'Both templates carry an SDA (Solution Design Authority) approval block - designs are expected to pass through SDA.']],
  interactions: [{
    id: 'ENV-DOCSET-1',
    title: 'APM expects a TCD companion to every detailed design',
    trigger: /detailed design|solution design|design document/i,
    note: 'The DDD argues the design; the TCD carries the build-level configuration as de-facto as-built. Our \u00a75.3-style settings tables satisfy much of it, but APM review may ask for the TCD artefact itself.',
    remedy: 'Plan a TCD per use case as build detail lands (IPs, rules, accounts, certificates verbatim), and add the SDA approval step to the document\u2019s approval path.'
  }]
}];
if (typeof module !== 'undefined') module.exports = {
  ENVIRONMENT_CONFIG: window.ENVIRONMENT_CONFIG
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/es-participant-kiosk/policies/environment-config.js", error: String((e && e.message) || e) }); }

// exports/es-participant-kiosk/templates/detailed-design-v2/authoring/consistency-check.js
try { (() => {
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

const NUMWORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12
};
const COUNT_NOUNS = /(items?|policies|policy|controls?|exclusions?|gates?|layers?|phases?|rings?|scenarios?|tiers?|steps?)/i;
function parse(dsl) {
  const lines = dsl.split('\n');
  const headings = []; // {num, text, line}
  const figs = []; // {file, caption, line}
  const tables = []; // {line, rows, headerRow}
  const blocks = []; // {kind, text, line, section}
  let cur = null,
    curHeading = null;
  lines.forEach((raw, i) => {
    const m = raw.match(/^(H[1-5]|P|B|NUM|TBL|TH|TR|END|FIG)\s*\|(.*)$/);
    if (!m) return;
    const [, tag, body] = m;
    const text = body.replace(/==/g, '').replace(/\*\*/g, '');
    if (/^H[1-5]$/.test(tag)) {
      const hm = text.match(/^([\d.]+)\s+(.*)$/);
      curHeading = hm ? hm[1].replace(/\.$/, '') : null;
      if (hm) headings.push({
        num: curHeading,
        text: hm[2],
        line: i + 1
      });
      // heading text is pushed WITHOUT its number, so "7.3.4 Controls..." cannot be read as a count
      blocks.push({
        kind: 'H',
        text: hm ? hm[2] : text,
        line: i + 1,
        section: curHeading
      });
      cur = null;
      return;
    }
    if (tag === 'TBL') {
      cur = {
        line: i + 1,
        rows: 0,
        header: '',
        section: curHeading
      };
      tables.push(cur);
      return;
    }
    if (tag === 'TH') {
      if (cur) cur.header = text;
      blocks.push({
        kind: 'TH',
        text,
        line: i + 1,
        section: curHeading
      });
      return;
    }
    // table rows carry most of a design's content - they must be scanned, not just counted
    if (tag === 'TR') {
      if (cur) cur.rows++;
      blocks.push({
        kind: 'TR',
        text,
        line: i + 1,
        section: curHeading
      });
      return;
    }
    if (tag === 'END') {
      cur = null;
      return;
    }
    if (tag === 'FIG') {
      const p = body.split('|');
      figs.push({
        file: p[0],
        caption: (p[1] || '').replace(/==/g, ''),
        line: i + 1,
        section: curHeading
      });
      blocks.push({
        kind: 'FIG',
        text: p[1] || '',
        line: i + 1,
        section: curHeading
      });
      return;
    }
    blocks.push({
      kind: tag,
      text,
      line: i + 1,
      section: curHeading
    });
  });
  return {
    lines,
    headings,
    figs,
    tables,
    blocks
  };
}

// Section references, written the handful of ways this house style writes them.
function xrefs(text) {
  const out = [];
  const re = /(?:\bsee\s+|\bin\s+|\bper\s+|\bto\s+|\bsection\s+|\()(\d{1,2}(?:\.\d{1,2}){1,3})(?=[)\s,.;:]|$)/gi;
  let m;
  while (m = re.exec(text)) {
    const n = m[1];
    const before = text.slice(Math.max(0, m.index - 3), m.index);
    if (/[VvP]-?$/.test(before)) continue; // P-1.0, V1.6
    if (/\d\/$/.test(before)) continue; // CIDR
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
function scan({
  dsl,
  figuresHtml,
  figFiles,
  staleTerms = [],
  ignoreOrphans = []
}) {
  const {
    lines,
    headings,
    figs,
    tables,
    blocks
  } = parse(dsl);
  const findings = [];
  const add = (code, line, msg) => findings.push({
    code,
    line,
    msg
  });
  const headingNums = new Set(headings.map(h => h.num));
  // a reference to "7.3" is satisfied by 7.3 or by any 7.3.x existing
  const resolves = n => headingNums.has(n) || [...headingNums].some(h => h.startsWith(n + '.'));

  // TREE: a whole section going missing is the defect an edit is most likely to cause,
  // because the deletion leaves no trace in the text - only a gap in the numbering.
  const tops = [...new Set(headings.map(h => +h.num.split('.')[0]))].sort((a, b) => a - b);
  for (let n = 1; n <= (tops[tops.length - 1] || 0); n++) {
    if (!tops.includes(n)) add('TREE', 0, `no section ${n} heading exists, but section ${n + 1} or later does - a top-level heading has been lost`);else if (!headingNums.has(String(n))) add('TREE', 0, `section ${n} has subsections but no H1 of its own (numbering will jump in the Contents)`);
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
    if (!m) add('FIGSEQ', f.line, `caption does not start "Figure n.": "${f.caption.slice(0, 60)}"`);else if (+m[1] !== i + 1) add('FIGSEQ', f.line, `caption says Figure ${m[1]} but it is figure ${i + 1} in document order`);
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
  const seen = new Map(); // name -> [{line, section, text}]
  for (const b of blocks) {
    for (const m of b.text.match(NAMED) || []) {
      const name = m.replace(/[.,;:]$/, '');
      if (NOT_A_NAME.test(name)) continue;
      if (!seen.has(name)) seen.set(name, []);
      seen.get(name).push({
        line: b.line,
        section: b.section,
        text: b.text
      });
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
      const reconciled = hits.some(h => classOf(h.section) === 'inherited' && xrefs(h.text).some(n => excludedSections.includes(n)));
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
    const figText = [...figuresHtml.matchAll(/<(?:p class="dgm-note"|div class="dgm-cap")[^>]*>([\s\S]*?)<\/(?:p|div)>/g)].map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/&sect;/g, '').replace(/&middot;/g, ' ').replace(/&amp;/g, '&'));
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
    lines.forEach((l, i) => {
      if (re.test(l)) add('STALE', i + 1, `retired term "${term}" still present: "${l.slice(0, 90)}"`);
    });
  }
  const byCode = {};
  for (const f of findings) (byCode[f.code] = byCode[f.code] || []).push(f);
  const order = ['XREF', 'TREE', 'FIGSEQ', 'FIGREF', 'FIGFILE', 'DUAL', 'COUNT', 'FIGTXT', 'STALE', 'ORPHAN'];
  const report = order.filter(c => byCode[c]).map(c => `${c} (${byCode[c].length})\n` + byCode[c].map(f => `  line ${f.line}: ${f.msg}`).join('\n')).join('\n\n');
  return {
    ok: findings.filter(f => f.code !== 'ORPHAN').length === 0,
    counts: {
      headings: headings.length,
      figures: figs.length,
      tables: tables.length
    },
    byCode,
    findings,
    report: report || 'no findings'
  };
}
Object.assign(__ds_scope, { scan, parse });
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/es-participant-kiosk/templates/detailed-design-v2/authoring/consistency-check.js", error: String((e && e.message) || e) }); }

// exports/es-participant-kiosk/templates/detailed-design-v2/authoring/docx-builder.js
try { (() => {
// Shared docx builder for APM master template. Usage: import via dynamic import in run_script.
async function buildDocx(env, masterPath, contentPath, figDir, outPath, cover) {
  const {
    readFileBinary,
    readFile,
    saveFile,
    log
  } = env;
  const blob = await readFileBinary(masterPath);
  const buf = new Uint8Array(await blob.arrayBuffer());
  const dv = new DataView(buf.buffer);
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  const count = dv.getUint16(eocd + 10, true);
  let off = dv.getUint32(eocd + 16, true);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const nl = dv.getUint16(off + 28, true),
      el = dv.getUint16(off + 30, true),
      cl = dv.getUint16(off + 32, true);
    const name = new TextDecoder().decode(buf.slice(off + 46, off + 46 + nl));
    entries.push({
      name,
      method: dv.getUint16(off + 10, true),
      compSize: dv.getUint32(off + 20, true),
      lho: dv.getUint32(off + 42, true)
    });
    off += 46 + nl + el + cl;
  }
  async function ex(e) {
    const nl = dv.getUint16(e.lho + 26, true),
      el = dv.getUint16(e.lho + 28, true);
    const s = e.lho + 30 + nl + el;
    const d = buf.slice(s, s + e.compSize);
    if (e.method === 0) return d;
    return new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  }
  const files = {};
  for (const e of entries) {
    if (!e.name.startsWith('[trash]')) files[e.name] = await ex(e);
  }
  const td = new TextDecoder(),
    te = new TextEncoder();
  let xml = td.decode(files['word/document.xml']);
  const rootTag = xml.slice(xml.indexOf('<w:document'), xml.indexOf('>', xml.indexOf('<w:document')) + 1);
  let rf = rootTag;
  for (const [k, v] of [['xmlns:wp=', ' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"'], ['xmlns:r=', ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"']]) if (!rootTag.includes(k)) rf = rf.replace('<w:document', '<w:document' + v);
  if (rf !== rootTag) xml = xml.replace(rootTag, rf);
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Sets the value cell immediately after the label cell, replacing whatever the
  // master pre-filled there (some cover fields ship with placeholder text).
  function fillField(label, val) {
    const li = xml.indexOf('<w:t>' + label + '</w:t>');
    if (li < 0) return;
    const tcEnd = xml.indexOf('</w:tc>', li);
    if (tcEnd < 0) return;
    const nTc = xml.indexOf('<w:tc>', tcEnd);
    if (nTc < 0) return;
    const nTcEnd = xml.indexOf('</w:tc>', nTc);
    if (nTcEnd < 0) return;
    let cell = xml.slice(nTc, nTcEnd).replace(/<w:r [^>]*>[\s\S]*?<\/w:r>|<w:r>[\s\S]*?<\/w:r>/g, '');
    const pe = cell.indexOf('</w:p>');
    if (pe < 0) return;
    cell = cell.slice(0, pe) + '<w:r><w:rPr><w:b /></w:rPr><w:t xml:space="preserve">' + esc(val) + '</w:t></w:r>' + cell.slice(pe);
    xml = xml.slice(0, nTc) + cell + xml.slice(nTcEnd);
  }
  for (const [k, v] of Object.entries(cover.fields)) fillField(k, v);
  (function () {
    // versionRows: [[version, date, author, changes], …] rebuilds the whole table body
    // from the master's own data-row markup. history: flat cells filling the first row.
    if (cover.versionRows && cover.versionRows.length) {
      const h = xml.indexOf('Version History');
      if (h < 0) return;
      const tb = xml.indexOf('<w:tbl>', h),
        te = xml.indexOf('</w:tbl>', h);
      if (tb < 0 || te < 0) return;
      const tbl = xml.slice(tb, te + 8);
      const trRe = /<w:tr [^>]*>[\s\S]*?<\/w:tr>/g;
      const trs = tbl.match(trRe) || [];
      if (trs.length < 2) return;
      const tmpl = trs[1];
      const rowFor = vals => {
        const cells = tmpl.match(/<w:tc>[\s\S]*?<\/w:tc>/g) || [];
        const head = tmpl.slice(0, tmpl.indexOf(cells[0]));
        return head + cells.map((cell, ci) => {
          const val = String(vals[ci] == null ? '' : vals[ci]);
          let c = cell.replace(/<w:r [^>]*>[\s\S]*?<\/w:r>|<w:r>[\s\S]*?<\/w:r>/g, '');
          const pe = c.lastIndexOf('</w:p>');
          if (pe < 0) return c;
          const rpr = '<w:rFonts w:eastAsia="MS PGothic" />' + (ci === 0 ? '<w:b />' : '') + '<w:color w:val="000000" /><w:szCs w:val="20" />';
          return c.slice(0, pe) + runs(val, rpr) + c.slice(pe);
        }).join('') + '</w:tr>';
      };
      const rebuilt = tbl.slice(0, tbl.indexOf(trs[1])) + cover.versionRows.map(rowFor).join('') + '</w:tbl>';
      xml = xml.slice(0, tb) + rebuilt + xml.slice(te + 8);
      return;
    }
    if (!cover.history) return;
    let i = xml.indexOf('Version History');
    if (i < 0) return;
    i = xml.indexOf('>V0.1<', i);
    if (i < 0) return;
    let pos = i;
    for (const v of cover.history) {
      while (true) {
        const ps = xml.indexOf('<w:p ', pos);
        if (ps < 0) return;
        const pe = xml.indexOf('</w:p>', ps);
        if (pe < 0) return;
        if (xml.slice(ps, pe).indexOf('<w:t') === -1) {
          xml = xml.slice(0, pe) + '<w:r><w:t xml:space="preserve">' + esc(v) + '</w:t></w:r>' + xml.slice(pe);
          pos = pe + 60;
          break;
        }
        pos = pe + 6;
      }
    }
  })();
  const content = await readFile(contentPath);

  // ---- cross-reference index -------------------------------------------------
  // Pre-pass over the headings so [[5.3.4]] in body text can render as a live
  // hyperlink reading "5.3.4 Routing". The section NAME is never hand-typed in a
  // cross-reference: it is read from the heading, so renaming a heading updates
  // every reference to it. Keys accepted: 5, 5.3, 5.3.4, B.6, "Appendix A".
  function secKey(text) {
    const t = String(text).replace(/\*\*/g, '').trim();
    let m = /^(\d+(?:\.\d+)*)[.\s]/.exec(t);
    if (m) return m[1];
    m = /^(Appendix\s+[A-Z])\b/i.exec(t);
    if (m) return m[1].replace(/\s+/g, ' ');
    m = /^([A-Z]\.\d+(?:\.\d+)*)[.\s]/.exec(t);
    if (m) return m[1];
    return null;
  }
  const secMap = Object.create(null),
    dupSections = [],
    badXrefs = [];
  for (const raw of content.split('\n')) {
    const hm = /^(H1|H2|H3|H4|H5)\s?\|(.*)$/.exec(raw.replace(/\r$/, ''));
    if (!hm) continue;
    const title = hm[2].replace(/\*\*/g, '').trim();
    const key = secKey(title);
    if (!key) continue;
    if (secMap[key]) {
      dupSections.push(key);
      continue;
    }
    secMap[key] = {
      title,
      bm: 'Sec_' + key.replace(/[^A-Za-z0-9]+/g, '_')
    };
  }
  let bmId = 20000;
  function xref(key, extraRpr) {
    const k = String(key).trim(),
      s = secMap[k];
    if (!s) badXrefs.push(k);
    const rpr = '<w:color w:val="1F2D58" /><w:u w:val="single" />' + (extraRpr || '');
    const run = '<w:r><w:rPr>' + rpr + '</w:rPr><w:t xml:space="preserve">' + esc(s ? s.title : k) + '</w:t></w:r>';
    return s ? '<w:hyperlink w:anchor="' + s.bm + '">' + run + '</w:hyperlink>' : run;
  }

  // **bold**, ==yellow highlight== (markers are always balanced within a chunk),
  // [[5.3.4]] cross-reference
  function runs(text, extraRpr) {
    let out = '';
    for (const seg of String(text).split(/(\[\[[^\]]+\]\])/)) {
      if (!seg) continue;
      const xm = /^\[\[([^\]]+)\]\]$/.exec(seg);
      if (xm) {
        out += xref(xm[1], extraRpr);
        continue;
      }
      const hlParts = seg.split('==');
      for (let h = 0; h < hlParts.length; h++) {
        const hl = h % 2 === 1;
        const parts = hlParts[h].split('**');
        for (let k = 0; k < parts.length; k++) {
          if (!parts[k]) continue;
          const bold = k % 2 === 1;
          const rpr = (bold ? '<w:b />' : '') + (hl ? '<w:highlight w:val="yellow" />' : '') + (extraRpr || '');
          out += '<w:r>' + (rpr ? '<w:rPr>' + rpr + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + esc(parts[k].replace(/&amp;/g, '&')) + '</w:t></w:r>';
        }
      }
    }
    return out;
  }
  // Heading paragraph, bookmarked so cross-references can target it.
  function headingP(style, rest, extraPpr) {
    const key = secKey(rest);
    const s = key ? secMap[key] : null;
    let a = '',
      b = '';
    if (s && !s.placed) {
      s.placed = true;
      const id = bmId++;
      a = '<w:bookmarkStart w:id="' + id + '" w:name="' + s.bm + '" />';
      b = '<w:bookmarkEnd w:id="' + id + '" />';
    }
    return '<w:p><w:pPr><w:pStyle w:val="' + style + '" />' + (extraPpr || '') + '</w:pPr>' + a + runs(rest) + b + '</w:p>';
  }
  const NAVY = '1F2D58',
    BORD = 'BFC5D4';
  function cellP(text, hdr) {
    const rpr = '<w:sz w:val="17" /><w:szCs w:val="17" />' + (hdr ? '<w:b /><w:color w:val="FFFFFF" />' : '');
    const segs = String(text).split('<br>');
    return segs.map((s, i) => '<w:p><w:pPr><w:spacing w:before="' + (i ? '20' : '40') + '" w:after="' + (i < segs.length - 1 ? '20' : '40') + '" w:line="240" w:lineRule="auto" /><w:rPr><w:sz w:val="17" /></w:rPr></w:pPr>' + runs(s, rpr) + '</w:p>').join('');
  }
  function tc(text, w, hdr, shade, span) {
    return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa" />' + (span > 1 ? '<w:gridSpan w:val="' + span + '" />' : '') + '<w:tcBorders><w:top w:val="single" w:sz="4" w:color="' + BORD + '" /><w:left w:val="single" w:sz="4" w:color="' + BORD + '" /><w:bottom w:val="single" w:sz="4" w:color="' + BORD + '" /><w:right w:val="single" w:sz="4" w:color="' + BORD + '" /></w:tcBorders>' + (hdr ? '<w:shd w:val="clear" w:color="auto" w:fill="' + NAVY + '" />' : shade ? '<w:shd w:val="clear" w:color="auto" w:fill="F5F7FB" />' : '') + '<w:tcMar><w:top w:w="60" w:type="dxa" /><w:left w:w="100" w:type="dxa" /><w:bottom w:w="60" w:type="dxa" /><w:right w:w="100" w:type="dxa" /></w:tcMar><w:vAlign w:val="center" /></w:tcPr>' + cellP(text, hdr) + '</w:tc>';
  }
  let seq = 0;
  const images = [];
  function figXml(file, caption, w, h) {
    seq++;
    const relId = cover.relPrefix + seq;
    images.push({
      file,
      relId,
      name: cover.imgPrefix + seq + '.png'
    });
    const cx = 5750000,
      cy = Math.round(cx * h / w);
    const id = cover.idBase + seq;
    return '<w:p><w:pPr><w:keepNext /><w:jc w:val="center" /><w:spacing w:before="180" w:after="60" /></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '" /><wp:effectExtent l="0" t="0" r="0" b="0" /><wp:docPr id="' + id + '" name="Figure' + seq + '" /><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1" /></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="' + id + '" name="Figure' + seq + '" /><pic:cNvPicPr /></pic:nvPicPr><pic:blipFill><a:blip r:embed="' + relId + '" /><a:stretch><a:fillRect /></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0" /><a:ext cx="' + cx + '" cy="' + cy + '" /></a:xfrm><a:prstGeom prst="rect"><a:avLst /></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>' + '<w:p><w:pPr><w:pStyle w:val="Caption" /><w:jc w:val="center" /><w:spacing w:after="220" /></w:pPr>' + runs(caption) + '</w:p>';
  }
  let body = '';
  let tbl = null;
  let numCount = 0;
  function flushTbl() {
    if (!tbl) return;
    let t = '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid" /><w:tblW w:w="9360" w:type="dxa" /><w:tblLayout w:type="fixed" /><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1" /></w:tblPr><w:tblGrid>';
    for (const w of tbl.widths) t += '<w:gridCol w:w="' + w + '" />';
    t += '</w:tblGrid>';
    tbl.rows.forEach((r, ri) => {
      t += '<w:tr>' + (r.hdr ? '<w:trPr><w:tblHeader /></w:trPr>' : '');
      let ci = 0;
      r.cells.forEach(raw => {
        let c = raw,
          span = 1;
        const sm = /^@(\d+)@/.exec(c);
        if (sm) {
          span = +sm[1];
          c = c.slice(sm[0].length);
        }
        let w = 0;
        for (let s = 0; s < span; s++) w += tbl.widths[ci + s] || 2000;
        t += tc(c, w || 2000, r.hdr, !r.hdr && ri % 2 === 0, span);
        ci += span;
      });
      t += '</w:tr>';
    });
    t += '</w:tbl><w:p><w:pPr><w:spacing w:after="160" /><w:rPr><w:sz w:val="8" /></w:rPr></w:pPr></w:p>';
    body += t;
    tbl = null;
  }
  for (const raw of content.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (!line.trim()) continue;
    const m = line.match(/^(H1|H2|H3|H4|H5|GD|BQ|NUM|B|P|FIG|TBL|TH|TR|END)\s?\|?(.*)$/);
    if (!m) continue;
    const tag = m[1],
      rest = m[2];
    if (tag === 'TBL') {
      flushTbl();
      tbl = {
        widths: rest.split(',').map(Number),
        rows: []
      };
      continue;
    }
    if (tag === 'TH') {
      if (tbl) tbl.rows.push({
        cells: rest.split('||'),
        hdr: true
      });
      continue;
    }
    if (tag === 'TR') {
      if (tbl) tbl.rows.push({
        cells: rest.split('||'),
        hdr: false
      });
      continue;
    }
    if (tag === 'END') {
      flushTbl();
      continue;
    }
    if (tag !== 'NUM') numCount = 0;
    flushTbl();
    if (tag === 'H1') body += headingP('Heading1', rest, '<w:pageBreakBefore />');else if (tag === 'H2') body += headingP('Heading2', rest);else if (tag === 'H3') body += headingP('Heading3', rest);else if (tag === 'H4') body += headingP('Heading4', rest, '<w:keepNext />');else if (tag === 'H5') body += headingP('Heading5', rest, '<w:keepNext />');else if (tag === 'P') body += '<w:p><w:pPr><w:spacing w:after="140" w:line="276" w:lineRule="auto" /></w:pPr>' + runs(rest) + '</w:p>';else if (tag === 'B') body += '<w:p><w:pPr><w:ind w:left="510" w:hanging="227" /><w:spacing w:after="70" w:line="276" w:lineRule="auto" /></w:pPr><w:r><w:t xml:space="preserve">\u2022  </w:t></w:r>' + runs(rest) + '</w:p>';else if (tag === 'NUM') {
      numCount++;
      body += '<w:p><w:pPr><w:ind w:left="567" w:hanging="284" /><w:spacing w:after="90" w:line="276" w:lineRule="auto" /></w:pPr><w:r><w:rPr><w:b /></w:rPr><w:t xml:space="preserve">' + numCount + '.  </w:t></w:r>' + runs(rest) + '</w:p>';
    } else if (tag === 'GD') body += '<w:p><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="10" w:color="1F2D58" /></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="EEF1F8" /><w:ind w:left="227" w:right="170" /><w:spacing w:before="120" w:after="40" w:line="264" w:lineRule="auto" /></w:pPr><w:r><w:rPr><w:b /><w:caps /><w:color w:val="1F2D58" /><w:sz w:val="15" /></w:rPr><w:t xml:space="preserve">Guidance    </w:t></w:r>' + runs(rest, '<w:i /><w:color w:val="2A3A6B" /><w:sz w:val="18" />') + '</w:p><w:p><w:pPr><w:spacing w:after="80" /><w:rPr><w:sz w:val="8" /></w:rPr></w:pPr></w:p>';else if (tag === 'BQ') body += '<w:p><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="10" w:color="F89728" /></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="FEF7EC" /><w:ind w:left="227" w:right="170" /><w:spacing w:before="120" w:after="180" w:line="276" w:lineRule="auto" /></w:pPr>' + runs(rest, '<w:i /><w:color w:val="95500A" /><w:sz w:val="19" />') + '</w:p>';else if (tag === 'FIG') {
      const p = rest.split('|');
      body += figXml(p[0], p[1], Number(p[2]), Number(p[3]));
    }
  }
  flushTbl();
  const paraRe = /<w:p [^>]*>[\s\S]*?<\/w:p>/g;
  let mm,
    cutStart = -1;
  while ((mm = paraRe.exec(xml)) !== null) {
    const p = mm[0];
    if (/<w:pStyle w:val="Heading1"\s*\/>/.test(p) && /Introduction/.test(p)) {
      cutStart = mm.index;
      break;
    }
  }
  const tailIdx = xml.lastIndexOf('<w:sectPr');
  if (cutStart < 0 || tailIdx < 0) throw new Error('splice markers not found for ' + outPath);
  const newDoc = xml.slice(0, cutStart) + body + xml.slice(tailIdx);
  files['word/document.xml'] = te.encode(newDoc);
  let rels = td.decode(files['word/_rels/document.xml.rels']);
  let addRels = '';
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
  const crcT = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
      t[n] = c;
    }
    return t;
  })();
  const crc32 = d => {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < d.length; i++) c = crcT[(c ^ d[i]) & 0xFF] ^ c >>> 8;
    return (c ^ 0xFFFFFFFF) >>> 0;
  };
  const parts = [],
    central = [];
  let offset = 0;
  const names = Object.keys(files);
  for (const name of names) {
    const data = files[name];
    const nb = te.encode(name);
    const crc = crc32(data);
    const lh = new Uint8Array(30 + nb.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, nb.length, true);
    lh.set(nb, 30);
    parts.push(lh, data);
    const ch = new Uint8Array(46 + nb.length);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nb.length, true);
    cv.setUint32(42, offset, true);
    ch.set(nb, 46);
    central.push(ch);
    offset += lh.length + data.length;
  }
  const cdStart = offset;
  let cdLen = 0;
  for (const c of central) {
    parts.push(c);
    cdLen += c.length;
  }
  const eo = new Uint8Array(22);
  const ev = new DataView(eo.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, names.length, true);
  ev.setUint16(10, names.length, true);
  ev.setUint32(12, cdLen, true);
  ev.setUint32(16, cdStart, true);
  parts.push(eo);
  const out = new Blob(parts, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  await saveFile(outPath, out);
  log(outPath + ' -> ' + out.size + ' bytes, figures=' + images.length + ', xrefs=' + Object.values(secMap).filter(s => s.placed).length + ' bookmarked' + (badXrefs.length ? '\n  UNRESOLVED [[xref]]: ' + [...new Set(badXrefs)].join(', ') : '') + (dupSections.length ? '\n  duplicate section numbers (first occurrence bookmarked): ' + [...new Set(dupSections)].join(', ') : ''));
}
Object.assign(__ds_scope, { buildDocx });
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/es-participant-kiosk/templates/detailed-design-v2/authoring/docx-builder.js", error: String((e && e.message) || e) }); }

// exports/es-participant-kiosk/templates/detailed-design-v2/authoring/qa-checks.js
try { (() => {
// APM design-document QA checks.
// Load in a figures page during authoring, or paste into the console of any page:
//   <script src="./qa-checks.js"></script>
// Then:
//   qa()                 -> runs all four, returns { overlap, contrast, overflow, escapes, ok }
//   qa.overlapScan()     -> element collisions inside every .dgm-fig
//   qa.contrastAudit()   -> WCAG AA failures across the WHOLE page
//   qa.overflowScan()    -> anything spilling outside its figure canvas
//   qa.escapeScan()      -> literal escape sequences, and em dashes (banned in APM artifacts)
//   qa.orphanScan()      -> wire labels sitting too far from any connector to read as annotations
//   qa.legendScan()      -> connector styles used in a figure but absent from its legend
//   qa.occlusionScan()   -> arrows hidden behind opaque boxes, leaving a floating arrowhead
//
// Both return { fails: n, out: [...] }. Ship only when qa().ok === true.
// See guidelines/detailed-design-standard.md §5.

(function () {
  const parseNums = c => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = c => {
    const f = v => (v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const ratio = (a, b) => {
    const L1 = Math.max(lum(a), lum(b)),
      L2 = Math.min(lum(a), lum(b));
    return Math.round((L1 + 0.05) / (L2 + 0.05) * 100) / 100;
  };
  // resolves any CSS colour - including oklab()/color-mix() - to [r,g,b]
  const resolve = col => {
    const d = document.createElement('div');
    d.style.color = col;
    document.body.appendChild(d);
    const c = getComputedStyle(d).color;
    d.remove();
    if (c.startsWith('rgb')) return parseNums(c).slice(0, 3);
    const cv = document.createElement('canvas').getContext('2d');
    cv.fillStyle = col;
    cv.fillRect(0, 0, 1, 1);
    const q = cv.getImageData(0, 0, 1, 1).data;
    return [q[0], q[1], q[2]];
  };
  const composite = (fg, bg) => fg.slice(0, 3).map((v, i) => Math.round(v * fg[3] + bg[i] * (1 - fg[3])));
  // walks ancestors, compositing translucent layers; gradients contribute their first stop
  const bgOf = el => {
    let acc = null;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      let c = null;
      if (s.backgroundImage !== 'none') {
        const m = s.backgroundImage.match(/rgba?\([^)]+\)/);
        if (m) c = parseNums(m[0]);
      }
      if (!c && s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const v = parseNums(s.backgroundColor);
        c = resolve(s.backgroundColor).concat(v.length > 3 ? v[3] : 1);
      }
      if (!c) continue;
      if (c.length === 3) c = c.concat(1);
      acc = acc ? composite(acc, c.slice(0, 3)).concat(1) : c;
      if (acc[3] >= 1) return acc.slice(0, 3);
    }
    return acc ? composite(acc, [255, 255, 255]) : [255, 255, 255];
  };

  // Elements with their OWN text node, so a container isn't judged by its children's colour.
  const textBearing = root => [...root.querySelectorAll('*')].filter(el => {
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0;
  });
  function contrastAudit(root) {
    root = root || document;
    const out = [];
    const els = textBearing(root);
    els.forEach(el => {
      const cs = getComputedStyle(el);
      const r = ratio(resolve(cs.color), bgOf(el));
      const fs = parseFloat(cs.fontSize);
      const large = fs >= 24 || fs >= 18.66 && +cs.fontWeight >= 700;
      const bar = large ? 3 : 4.5;
      if (r < bar) out.push({
        text: el.textContent.trim().slice(0, 34),
        tag: el.tagName,
        cls: typeof el.className === 'string' ? el.className : '',
        size: cs.fontSize,
        weight: cs.fontWeight,
        color: cs.color,
        ratio: r,
        bar
      });
    });
    return {
      checked: els.length,
      fails: out.length,
      out
    };
  }

  // Overlays must not sit on top of boxes, or on each other. Opaque .dgm-lbl
  // backgrounds silently eat the first characters of any box heading they cross.
  function overlapScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const fb = fig.getBoundingClientRect();
      const overlays = [...fig.querySelectorAll('.dgm-lbl, .dgm-step, .dgm-note, .dgm-legend, .dgm-key')];
      const targets = [...fig.querySelectorAll('.dgm-box, .dgm-heat')];
      [[overlays, targets], [overlays, overlays]].forEach(([as, bs], pass) => as.forEach((a, ai) => bs.forEach((b, bi) => {
        if (a === b || pass === 1 && bi <= ai) return;
        const ra = a.getBoundingClientRect(),
          rb = b.getBoundingClientRect();
        const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (ox > 1 && oy > 1) out.push({
          fig: fig.id,
          a: a.textContent.trim().slice(0, 30),
          b: b.textContent.trim().slice(0, 30),
          overlap: Math.round(ox) + 'x' + Math.round(oy),
          // relative to the figure box, so these map onto the inline left/top values
          aLeft: Math.round(ra.left - fb.left),
          aRight: Math.round(ra.right - fb.left),
          aTop: Math.round(ra.top - fb.top)
        });
      })));
    });
    return {
      figures: root.querySelectorAll('.dgm-fig').length,
      fails: out.length,
      out
    };
  }

  // Any element whose content spills outside its own .dgm-fig canvas.
  function overflowScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const fb = fig.getBoundingClientRect();
      fig.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        if (r.right > fb.right + 1 || r.bottom > fb.bottom + 1 || r.left < fb.left - 1 || r.top < fb.top - 1) {
          out.push({
            fig: fig.id,
            el: el.textContent.trim().slice(0, 30) || el.tagName,
            spill: {
              right: Math.round(r.right - fb.right),
              bottom: Math.round(r.bottom - fb.bottom)
            }
          });
        }
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Boxes whose own text is clipped by a fixed height (scrollHeight > clientHeight).
  // overflowScan only measures against the .dgm-fig canvas, so a box that hides its own
  // last line passes it - this catches that. Runs on the elements that carry copy.
  function clipScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      fig.querySelectorAll('.dgm-box, .dgm-heat, .dgm-lbl, .dgm-note').forEach(el => {
        const hid = el.scrollHeight - el.clientHeight,
          wid = el.scrollWidth - el.clientWidth;
        if (hid > 1 || wid > 1) out.push({
          fig: fig.id,
          el: (el.querySelector('h4, h5') || el).textContent.trim().slice(0, 34),
          needs: el.scrollHeight,
          has: el.clientHeight,
          clipped: Math.max(hid, 0),
          widthClipped: Math.max(wid, 0)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Literal escape sequences leaking into rendered copy, invisible to the other scans:
  // a double-encoded unicode escape in a write_file call puts the raw characters into the
  // HTML instead of the glyph. Also flags em dashes, which are banned in APM artifacts
  // (use a spaced hyphen, a colon, or restructure the sentence).
  function escapeScan(root) {
    root = root || document;
    const out = [];
    const bad = /\\u[0-9a-fA-F]{4}|\\n|\\t|\\r|&amp;(amp|lt|gt|quot|#\d+);|\u2014/;
    const walker = document.createTreeWalker(root.body || root, NodeFilter.SHOW_TEXT);
    const NOT_COPY = /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|TITLE)$/;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.textContent;
      if (!t.trim() || !bad.test(t)) continue;
      const host = n.parentElement;
      // script/style contents are source, not rendered copy
      if (host && NOT_COPY.test(host.tagName)) continue;
      out.push({
        match: (t.match(bad) || [])[0],
        text: t.trim().slice(0, 60),
        cls: host && typeof host.className === 'string' ? host.className : '',
        fig: host && host.closest('.dgm-fig') ? host.closest('.dgm-fig').id : null
      });
    }
    return {
      fails: out.length,
      out
    };
  }

  // A wire label must sit near the connector it annotates. Overlap-free is not enough:
  // a label nudged out of a collision can land in dead space, where a reader cannot tell
  // which arrow it refers to. Measures point-to-segment distance from each label centre to
  // every <line> in its figure's SVG, scaling viewBox coordinates to stage pixels.
  function orphanScan(root, maxDist) {
    root = root || document;
    maxDist = maxDist || 80;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      const labels = [...fig.querySelectorAll('.dgm-lbl')];
      if (!svg || !labels.length) return;
      const sb = svg.getBoundingClientRect();
      const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      if (vb.length !== 4 || !sb.width) return;
      const sx = sb.width / vb[2],
        sy = sb.height / vb[3];
      const segs = [...svg.querySelectorAll('line')].map(l => ({
        x1: sb.left + +l.getAttribute('x1') * sx,
        y1: sb.top + +l.getAttribute('y1') * sy,
        x2: sb.left + +l.getAttribute('x2') * sx,
        y2: sb.top + +l.getAttribute('y2') * sy
      }));
      if (!segs.length) return;
      labels.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2,
          cy = r.top + r.height / 2;
        let best = Infinity;
        segs.forEach(s => {
          const dx = s.x2 - s.x1,
            dy = s.y2 - s.y1;
          const len2 = dx * dx + dy * dy;
          let t = len2 ? ((cx - s.x1) * dx + (cy - s.y1) * dy) / len2 : 0;
          t = Math.max(0, Math.min(1, t));
          const px = s.x1 + t * dx,
            py = s.y1 + t * dy;
          best = Math.min(best, Math.hypot(cx - px, cy - py));
        });
        if (best > maxDist) out.push({
          fig: fig.id,
          label: el.textContent.trim().slice(0, 40),
          distToNearestWire: Math.round(best),
          left: Math.round(r.left - fig.getBoundingClientRect().left),
          top: Math.round(r.top - fig.getBoundingClientRect().top)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Every meaning-bearing connector style must be decodable. Collects the distinct
  // stroke + dash combinations of each figure's <line>s and compares the count against
  // that figure's legend entries. Fails when a figure uses more styles than it explains,
  // or uses more than one style with no legend at all.
  function legendScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      if (!svg) return;
      const styles = new Set();
      svg.querySelectorAll('line').forEach(l => {
        // only arrowed lines are connectors; un-arrowed lines are sequence lifelines
        if (!l.getAttribute('marker-end')) return;
        const cs = getComputedStyle(l);
        const dashed = (l.getAttribute('stroke-dasharray') || cs.strokeDasharray || 'none') !== 'none';
        styles.add((l.getAttribute('stroke') || cs.stroke).toLowerCase() + (dashed ? '|dashed' : '|solid'));
      });
      if (styles.size < 2) return; // one style needs no legend
      const entries = fig.querySelectorAll('.dgm-legend i').length;
      if (entries < styles.size) out.push({
        fig: fig.id,
        stylesUsed: styles.size,
        legendEntries: entries,
        styles: [...styles]
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // The SVG wire layer paints BENEATH the opaque .dgm-box elements, so a connector routed
  // through a box column is hidden except for a short stub and its arrowhead. Samples each
  // arrowed line and flags any whose path is mostly covered while its tip sits outside every
  // box. An arrow whose tip is inside its target box is the normal case and passes.
  function occlusionScan(root, maxHidden) {
    root = root || document;
    maxHidden = maxHidden || 0.25;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      if (!svg) return;
      const sb = svg.getBoundingClientRect();
      const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      if (vb.length !== 4 || !sb.width) return;
      const sx = sb.width / vb[2],
        sy = sb.height / vb[3];
      const rects = [...fig.querySelectorAll('.dgm-box, .dgm-heat')].map(b => b.getBoundingClientRect());
      const inAny = (x, y) => rects.some(r => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
      svg.querySelectorAll('line').forEach(l => {
        if (!l.getAttribute('marker-end')) return;
        const x1 = sb.left + +l.getAttribute('x1') * sx,
          y1 = sb.top + +l.getAttribute('y1') * sy;
        const x2 = sb.left + +l.getAttribute('x2') * sx,
          y2 = sb.top + +l.getAttribute('y2') * sy;
        const N = 200;
        let hidden = 0;
        for (let i = 0; i <= N; i++) {
          const t = i / N;
          if (inAny(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) hidden++;
        }
        const frac = hidden / (N + 1);
        // The marker footprint is the last ~11px. An arrow whose TIP is inside its target box
        // is normal ONLY while the arrowhead itself is still visible; if the head is buried the
        // arrow renders as a plain line that stops dead, with no readable direction.
        const len = Math.hypot(x2 - x1, y2 - y1);
        const headFrac = len ? Math.min(1, 11 / len) : 1;
        let headHidden = 0;
        for (let i = 0; i <= 20; i++) {
          const t = 1 - headFrac * (i / 20);
          if (inAny(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) headHidden++;
        }
        const headPct = headHidden / 21;
        const tipInBox = inAny(x2, y2);
        if (headPct > 0.5 || frac > maxHidden && !tipInBox) out.push({
          fig: fig.id,
          line: l.getAttribute('x1') + ',' + l.getAttribute('y1') + ' -> ' + l.getAttribute('x2') + ',' + l.getAttribute('y2'),
          hiddenPct: Math.round(frac * 100),
          headHiddenPct: Math.round(headPct * 100)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }
  function qa(root) {
    const overlap = overlapScan(root),
      contrast = contrastAudit(root),
      overflow = overflowScan(root),
      escapes = escapeScan(root),
      orphans = orphanScan(root),
      legends = legendScan(root),
      occlusion = occlusionScan(root),
      clip = clipScan(root);
    const ok = overlap.fails === 0 && contrast.fails === 0 && overflow.fails === 0 && escapes.fails === 0 && orphans.fails === 0 && legends.fails === 0 && occlusion.fails === 0 && clip.fails === 0;
    console.log(ok ? '✓ QA clean' : '✗ QA failures', {
      overlap: overlap.fails,
      contrast: contrast.fails,
      overflow: overflow.fails,
      escapes: escapes.fails,
      orphans: orphans.fails,
      legends: legends.fails,
      occlusion: occlusion.fails,
      clip: clip.fails
    });
    return {
      ok,
      overlap,
      contrast,
      overflow,
      escapes,
      orphans,
      legends,
      occlusion,
      clip
    };
  }
  qa.overlapScan = overlapScan;
  qa.contrastAudit = contrastAudit;
  qa.overflowScan = overflowScan;
  qa.escapeScan = escapeScan;
  qa.orphanScan = orphanScan;
  qa.legendScan = legendScan;
  qa.occlusionScan = occlusionScan;
  qa.clipScan = clipScan;
  window.qa = qa;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/es-participant-kiosk/templates/detailed-design-v2/authoring/qa-checks.js", error: String((e && e.message) || e) }); }

// exports/es-participant-kiosk/templates/detailed-design/authoring/qa-checks.js
try { (() => {
// APM design-document QA checks.
// Load in a figures page during authoring, or paste into the console of any page:
//   <script src="./qa-checks.js"></script>
// Then:
//   qa()                 -> runs all four, returns { overlap, contrast, overflow, escapes, ok }
//   qa.overlapScan()     -> element collisions inside every .dgm-fig
//   qa.contrastAudit()   -> WCAG AA failures across the WHOLE page
//   qa.overflowScan()    -> anything spilling outside its figure canvas
//   qa.escapeScan()      -> literal escape sequences, and em dashes (banned in APM artifacts)
//   qa.orphanScan()      -> wire labels sitting too far from any connector to read as annotations
//   qa.legendScan()      -> connector styles used in a figure but absent from its legend
//   qa.occlusionScan()   -> arrows hidden behind opaque boxes, leaving a floating arrowhead
//
// Both return { fails: n, out: [...] }. Ship only when qa().ok === true.
// See guidelines/detailed-design-standard.md §5.

(function () {
  const parseNums = c => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = c => {
    const f = v => (v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const ratio = (a, b) => {
    const L1 = Math.max(lum(a), lum(b)),
      L2 = Math.min(lum(a), lum(b));
    return Math.round((L1 + 0.05) / (L2 + 0.05) * 100) / 100;
  };
  // resolves any CSS colour - including oklab()/color-mix() - to [r,g,b]
  const resolve = col => {
    const d = document.createElement('div');
    d.style.color = col;
    document.body.appendChild(d);
    const c = getComputedStyle(d).color;
    d.remove();
    if (c.startsWith('rgb')) return parseNums(c).slice(0, 3);
    const cv = document.createElement('canvas').getContext('2d');
    cv.fillStyle = col;
    cv.fillRect(0, 0, 1, 1);
    const q = cv.getImageData(0, 0, 1, 1).data;
    return [q[0], q[1], q[2]];
  };
  const composite = (fg, bg) => fg.slice(0, 3).map((v, i) => Math.round(v * fg[3] + bg[i] * (1 - fg[3])));
  // walks ancestors, compositing translucent layers; gradients contribute their first stop
  const bgOf = el => {
    let acc = null;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      let c = null;
      if (s.backgroundImage !== 'none') {
        const m = s.backgroundImage.match(/rgba?\([^)]+\)/);
        if (m) c = parseNums(m[0]);
      }
      if (!c && s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const v = parseNums(s.backgroundColor);
        c = resolve(s.backgroundColor).concat(v.length > 3 ? v[3] : 1);
      }
      if (!c) continue;
      if (c.length === 3) c = c.concat(1);
      acc = acc ? composite(acc, c.slice(0, 3)).concat(1) : c;
      if (acc[3] >= 1) return acc.slice(0, 3);
    }
    return acc ? composite(acc, [255, 255, 255]) : [255, 255, 255];
  };

  // Elements with their OWN text node, so a container isn't judged by its children's colour.
  const textBearing = root => [...root.querySelectorAll('*')].filter(el => {
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0;
  });
  function contrastAudit(root) {
    root = root || document;
    const out = [];
    const els = textBearing(root);
    els.forEach(el => {
      const cs = getComputedStyle(el);
      const r = ratio(resolve(cs.color), bgOf(el));
      const fs = parseFloat(cs.fontSize);
      const large = fs >= 24 || fs >= 18.66 && +cs.fontWeight >= 700;
      const bar = large ? 3 : 4.5;
      if (r < bar) out.push({
        text: el.textContent.trim().slice(0, 34),
        tag: el.tagName,
        cls: typeof el.className === 'string' ? el.className : '',
        size: cs.fontSize,
        weight: cs.fontWeight,
        color: cs.color,
        ratio: r,
        bar
      });
    });
    return {
      checked: els.length,
      fails: out.length,
      out
    };
  }

  // Overlays must not sit on top of boxes, or on each other. Opaque .dgm-lbl
  // backgrounds silently eat the first characters of any box heading they cross.
  function overlapScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const fb = fig.getBoundingClientRect();
      const overlays = [...fig.querySelectorAll('.dgm-lbl, .dgm-step, .dgm-note, .dgm-legend, .dgm-key')];
      const targets = [...fig.querySelectorAll('.dgm-box, .dgm-heat')];
      [[overlays, targets], [overlays, overlays]].forEach(([as, bs], pass) => as.forEach((a, ai) => bs.forEach((b, bi) => {
        if (a === b || pass === 1 && bi <= ai) return;
        const ra = a.getBoundingClientRect(),
          rb = b.getBoundingClientRect();
        const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (ox > 1 && oy > 1) out.push({
          fig: fig.id,
          a: a.textContent.trim().slice(0, 30),
          b: b.textContent.trim().slice(0, 30),
          overlap: Math.round(ox) + 'x' + Math.round(oy),
          // relative to the figure box, so these map onto the inline left/top values
          aLeft: Math.round(ra.left - fb.left),
          aRight: Math.round(ra.right - fb.left),
          aTop: Math.round(ra.top - fb.top)
        });
      })));
    });
    return {
      figures: root.querySelectorAll('.dgm-fig').length,
      fails: out.length,
      out
    };
  }

  // Any element whose content spills outside its own .dgm-fig canvas.
  function overflowScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const fb = fig.getBoundingClientRect();
      fig.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        if (r.right > fb.right + 1 || r.bottom > fb.bottom + 1 || r.left < fb.left - 1 || r.top < fb.top - 1) {
          out.push({
            fig: fig.id,
            el: el.textContent.trim().slice(0, 30) || el.tagName,
            spill: {
              right: Math.round(r.right - fb.right),
              bottom: Math.round(r.bottom - fb.bottom)
            }
          });
        }
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Boxes whose own text is clipped by a fixed height (scrollHeight > clientHeight).
  // overflowScan only measures against the .dgm-fig canvas, so a box that hides its own
  // last line passes it - this catches that. Runs on the elements that carry copy.
  function clipScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      fig.querySelectorAll('.dgm-box, .dgm-heat, .dgm-lbl, .dgm-note').forEach(el => {
        const hid = el.scrollHeight - el.clientHeight,
          wid = el.scrollWidth - el.clientWidth;
        if (hid > 1 || wid > 1) out.push({
          fig: fig.id,
          el: (el.querySelector('h4, h5') || el).textContent.trim().slice(0, 34),
          needs: el.scrollHeight,
          has: el.clientHeight,
          clipped: Math.max(hid, 0),
          widthClipped: Math.max(wid, 0)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Literal escape sequences leaking into rendered copy, invisible to the other scans:
  // a double-encoded unicode escape in a write_file call puts the raw characters into the
  // HTML instead of the glyph. Also flags em dashes, which are banned in APM artifacts
  // (use a spaced hyphen, a colon, or restructure the sentence).
  function escapeScan(root) {
    root = root || document;
    const out = [];
    const bad = /\\u[0-9a-fA-F]{4}|\\n|\\t|\\r|&amp;(amp|lt|gt|quot|#\d+);|\u2014/;
    const walker = document.createTreeWalker(root.body || root, NodeFilter.SHOW_TEXT);
    const NOT_COPY = /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|TITLE)$/;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.textContent;
      if (!t.trim() || !bad.test(t)) continue;
      const host = n.parentElement;
      // script/style contents are source, not rendered copy
      if (host && NOT_COPY.test(host.tagName)) continue;
      out.push({
        match: (t.match(bad) || [])[0],
        text: t.trim().slice(0, 60),
        cls: host && typeof host.className === 'string' ? host.className : '',
        fig: host && host.closest('.dgm-fig') ? host.closest('.dgm-fig').id : null
      });
    }
    return {
      fails: out.length,
      out
    };
  }

  // A wire label must sit near the connector it annotates. Overlap-free is not enough:
  // a label nudged out of a collision can land in dead space, where a reader cannot tell
  // which arrow it refers to. Measures point-to-segment distance from each label centre to
  // every <line> in its figure's SVG, scaling viewBox coordinates to stage pixels.
  function orphanScan(root, maxDist) {
    root = root || document;
    maxDist = maxDist || 80;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      const labels = [...fig.querySelectorAll('.dgm-lbl')];
      if (!svg || !labels.length) return;
      const sb = svg.getBoundingClientRect();
      const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      if (vb.length !== 4 || !sb.width) return;
      const sx = sb.width / vb[2],
        sy = sb.height / vb[3];
      const segs = [...svg.querySelectorAll('line')].map(l => ({
        x1: sb.left + +l.getAttribute('x1') * sx,
        y1: sb.top + +l.getAttribute('y1') * sy,
        x2: sb.left + +l.getAttribute('x2') * sx,
        y2: sb.top + +l.getAttribute('y2') * sy
      }));
      if (!segs.length) return;
      labels.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2,
          cy = r.top + r.height / 2;
        let best = Infinity;
        segs.forEach(s => {
          const dx = s.x2 - s.x1,
            dy = s.y2 - s.y1;
          const len2 = dx * dx + dy * dy;
          let t = len2 ? ((cx - s.x1) * dx + (cy - s.y1) * dy) / len2 : 0;
          t = Math.max(0, Math.min(1, t));
          const px = s.x1 + t * dx,
            py = s.y1 + t * dy;
          best = Math.min(best, Math.hypot(cx - px, cy - py));
        });
        if (best > maxDist) out.push({
          fig: fig.id,
          label: el.textContent.trim().slice(0, 40),
          distToNearestWire: Math.round(best),
          left: Math.round(r.left - fig.getBoundingClientRect().left),
          top: Math.round(r.top - fig.getBoundingClientRect().top)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Every meaning-bearing connector style must be decodable. Collects the distinct
  // stroke + dash combinations of each figure's <line>s and compares the count against
  // that figure's legend entries. Fails when a figure uses more styles than it explains,
  // or uses more than one style with no legend at all.
  function legendScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      if (!svg) return;
      const styles = new Set();
      svg.querySelectorAll('line').forEach(l => {
        // only arrowed lines are connectors; un-arrowed lines are sequence lifelines
        if (!l.getAttribute('marker-end')) return;
        const cs = getComputedStyle(l);
        const dashed = (l.getAttribute('stroke-dasharray') || cs.strokeDasharray || 'none') !== 'none';
        styles.add((l.getAttribute('stroke') || cs.stroke).toLowerCase() + (dashed ? '|dashed' : '|solid'));
      });
      if (styles.size < 2) return; // one style needs no legend
      const entries = fig.querySelectorAll('.dgm-legend i').length;
      if (entries < styles.size) out.push({
        fig: fig.id,
        stylesUsed: styles.size,
        legendEntries: entries,
        styles: [...styles]
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // The SVG wire layer paints BENEATH the opaque .dgm-box elements, so a connector routed
  // through a box column is hidden except for a short stub and its arrowhead. Samples each
  // arrowed line and flags any whose path is mostly covered while its tip sits outside every
  // box. An arrow whose tip is inside its target box is the normal case and passes.
  function occlusionScan(root, maxHidden) {
    root = root || document;
    maxHidden = maxHidden || 0.25;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      if (!svg) return;
      const sb = svg.getBoundingClientRect();
      const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      if (vb.length !== 4 || !sb.width) return;
      const sx = sb.width / vb[2],
        sy = sb.height / vb[3];
      const rects = [...fig.querySelectorAll('.dgm-box, .dgm-heat')].map(b => b.getBoundingClientRect());
      const inAny = (x, y) => rects.some(r => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
      svg.querySelectorAll('line').forEach(l => {
        if (!l.getAttribute('marker-end')) return;
        const x1 = sb.left + +l.getAttribute('x1') * sx,
          y1 = sb.top + +l.getAttribute('y1') * sy;
        const x2 = sb.left + +l.getAttribute('x2') * sx,
          y2 = sb.top + +l.getAttribute('y2') * sy;
        const N = 200;
        let hidden = 0;
        for (let i = 0; i <= N; i++) {
          const t = i / N;
          if (inAny(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) hidden++;
        }
        const frac = hidden / (N + 1);
        // The marker footprint is the last ~11px. An arrow whose TIP is inside its target box
        // is normal ONLY while the arrowhead itself is still visible; if the head is buried the
        // arrow renders as a plain line that stops dead, with no readable direction.
        const len = Math.hypot(x2 - x1, y2 - y1);
        const headFrac = len ? Math.min(1, 11 / len) : 1;
        let headHidden = 0;
        for (let i = 0; i <= 20; i++) {
          const t = 1 - headFrac * (i / 20);
          if (inAny(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) headHidden++;
        }
        const headPct = headHidden / 21;
        const tipInBox = inAny(x2, y2);
        if (headPct > 0.5 || frac > maxHidden && !tipInBox) out.push({
          fig: fig.id,
          line: l.getAttribute('x1') + ',' + l.getAttribute('y1') + ' -> ' + l.getAttribute('x2') + ',' + l.getAttribute('y2'),
          hiddenPct: Math.round(frac * 100),
          headHiddenPct: Math.round(headPct * 100)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }
  function qa(root) {
    const overlap = overlapScan(root),
      contrast = contrastAudit(root),
      overflow = overflowScan(root),
      escapes = escapeScan(root),
      orphans = orphanScan(root),
      legends = legendScan(root),
      occlusion = occlusionScan(root),
      clip = clipScan(root);
    const ok = overlap.fails === 0 && contrast.fails === 0 && overflow.fails === 0 && escapes.fails === 0 && orphans.fails === 0 && legends.fails === 0 && occlusion.fails === 0 && clip.fails === 0;
    console.log(ok ? '✓ QA clean' : '✗ QA failures', {
      overlap: overlap.fails,
      contrast: contrast.fails,
      overflow: overflow.fails,
      escapes: escapes.fails,
      orphans: orphans.fails,
      legends: legends.fails,
      occlusion: occlusion.fails,
      clip: clip.fails
    });
    return {
      ok,
      overlap,
      contrast,
      overflow,
      escapes,
      orphans,
      legends,
      occlusion,
      clip
    };
  }
  qa.overlapScan = overlapScan;
  qa.contrastAudit = contrastAudit;
  qa.overflowScan = overflowScan;
  qa.escapeScan = escapeScan;
  qa.orphanScan = orphanScan;
  qa.legendScan = legendScan;
  qa.occlusionScan = occlusionScan;
  qa.clipScan = clipScan;
  window.qa = qa;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/es-participant-kiosk/templates/detailed-design/authoring/qa-checks.js", error: String((e && e.message) || e) }); }

// exports/standard-user-avd/policies/ca-policies.js
try { (() => {
// Parsed from policies/APM-Conditional-Access-Policies-Export.csv (tenant export, 7 Aug 2026).
// n=name s=state(on|ro|off) u=users g=group count a=apps r=grant rules
window.CA_POLICIES = [{
  "n": "APM Pilot Block Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "APM Pilot Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "Deny Legacy Auth",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "Microsoft.EA.Account_MFA_Required",
  "s": "on",
  "u": "63e569df-3857-41c5-9150-155fa929a66c",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AllUsers_WVDApp_MFAtimeout",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "mfa;compliantDevice;domainJoinedDevice"
}, {
  "n": "AdminAccounts_WVD_DomainDevice",
  "s": "on",
  "u": "",
  "g": 4,
  "a": "3 apps",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "apm-cap-pwdstate",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "AllUsers_Office365Mobile_CompliantDeviceRollout",
  "s": "on",
  "u": "",
  "g": 5,
  "a": "Office365",
  "r": "compliantDevice;compliantApplication"
}, {
  "n": "AllUsers_ZeroTrustApps_AzureADHybridDevice",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_PaloAltoCaptivePortal_ServiceLevelOneDomainDevice",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "AllUsers_AllAccess_DeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "AllUsers_AllAccess_MFAorDeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "AllUsers_Office365_DeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_Office365Mobile_ManagedAppRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "compliantApplication"
}, {
  "n": "AllUsers_Sharepoint_DeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "AdminAccounts_AllAccess_BlockNonJumphostDevices",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "AdminAccounts_WVD_BlockNonAdminDevices",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "AdminAccounts_AllAccess_SigninTimeout",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "Guests_Everything_MFARequired",
  "s": "ro",
  "u": "GuestsOrExternalUsers",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AdminRoles_Everything_RequireDevice",
  "s": "ro",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_AllAccess_DeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "domainJoinedDevice;compliantApplication"
}, {
  "n": "AllUsers_AllAccess_MFAorDeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;domainJoinedDevice;compliantApplication"
}, {
  "n": "AllUsers_Office365_DeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_Office365Mobile_ManagedAppRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "compliantApplication"
}, {
  "n": "AllUsers_Sharepoint_DeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "AdminAccountsPilot_AllAccess_BlockNonJumphostDevices",
  "s": "off",
  "u": "d6e7a686-bc33-40e3-9a4d-fd1d9f7b33ac;d591bed7-60bc-48a6-9023-ab8e859291ba",
  "g": 0,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "Singapore Block Onedrive",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "AllUsers_UnapprovedCountries_Block",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "LimitedUsers_EmailOnly_Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "mfa"
}, {
  "n": "AdminRoles_Everything_RequireMFA",
  "s": "ro",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AllUsers_AllAccess_BlockLegacy",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_Biosymm MFA Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "POC_EarlyAccess_Construct-Health MFA policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "POC_EarlyAccess_My-Integra MFA policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "POC_EarlyAccess_CA_BlockAllApps_Biosymm",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_CA_BlockAllApps_Construct-Health",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_CA_BlockAllApps_My-Integra",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_EarlyAustralia MFA Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "LifeCare SharePoint Restrictions",
  "s": "off",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": ""
}, {
  "n": "AllUsers_AzureAppRegistrations",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "GuestAccess_Mobility_CA MFA Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "6 apps",
  "r": "mfa"
}, {
  "n": "GuestAccess_Mobility_CA BlockAllApps Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "AllUsers_AllAccess_DataSov",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "AzureAD CA Staging V2",
  "s": "on",
  "u": "",
  "g": 4,
  "a": "All",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "AtlasAUUsers_NonProd_RequireAUIPs",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "AtlasAUUsers_Prod_RequireAUIPs",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "GuestAccess_ADA_CA_AllowADAAppsOnly",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "All",
  "r": "block"
}, {
  "n": "AdminRoles_Never_Persistent_Token",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": ""
}, {
  "n": "GuestAccess_ADA_CA MFA Policy",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "33 apps",
  "r": "mfa"
}, {
  "n": "AdminRoles_Risky_Sign-ins_MFA",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AdminRoles_RiskyUsers_MFA_Password_Reset",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "mfa;passwordChange"
}, {
  "n": "Microsoft-managed: Multifactor authentication for per-user multifactor authentication users",
  "s": "on",
  "u": "690cff08-5735-497d-8a78-657ef8a66228;54343a72-487b-4e1b-9b62-c95f186f9919;9022d72e-3ba6-46e3-8408-5b599f42aa9f;b0d6993f-000a-4b4c-9d07-91d4d265d1f3;8dab1eec-c169-4f8f-b566-9ef0cb4649d6;c6336ea5-182d-4402-b146-958e098499f5;9360cc90-9d31-4044-ac86-a6b6cc7a2644;d1823e11-41e3-4ac4-9905-82eab5bd9e83;af058684-b191-4dd6-b2bd-633ac4c2c06d;b972abcc-6527-455f-a092-564cc1cdba16;294cb67b-c316-478f-b091-78f092469945;a3bcf597-ee2b-4a1c-90cb-f3e95c226586;ffe369d4-f8de-44d8-8a49-f56080b81cbc;1cea1751-61a4-4175-95ab-6efcbf5c8a8c;2f1fb3ae-4ffb-4731-93d7-83d21612dbfc;be1e89cf-cff5-4b97-ae5c-fc065825f4cd;ccb04fec-5e67-40c3-b9f8-b0f5ee4b6ae1;84195937-71c0-461e-b1bf-73a3bc2eaf04;c25a8d2b-f26b-4929-8490-eddad4715833;acfc6bc4-6cb4-433d-8700-5495079c2397",
  "g": 0,
  "a": "All",
  "r": ""
}, {
  "n": "Microsoft-managed: Multifactor authentication for admins accessing Microsoft Admin Portals",
  "s": "ro",
  "u": "",
  "g": 0,
  "a": "AdminPortals",
  "r": "mfa"
}, {
  "n": "CA-100 - All Users & Guests - All Apps - Legacy Protocols - Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-101 - All Users & Guests - All Apps - Allow - Require MFA",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "CA-102 - All Users & Guests - All Apps - Locations exc. AU, Corporate - Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-103 - All Users & Guests - All Apps - Any device exc. Android, iOS,  Windows, macOS - Block",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-104 - All Users & Guests - All Apps - High Sign In Risk - Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-200 - Org Users - Microsoft 365 - Windows, macOS - Client Apps - Allow - Require Hybrid or Compliance",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "CA-201 - Org Users - All Apps - Browser - BYOD - Allow - No Persistence",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": ""
}, {
  "n": "CA-203 - Org Users - All Apps - High User Risk - Allow - Require MFA &  Password Reset",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;passwordChange"
}, {
  "n": "CA-204 - Org Users - Entra Join - Allow - Require MFA",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "not set",
  "r": "mfa"
}, {
  "n": "CA-400 - Administrators - All Apps - Devices exc. Windows - Block",
  "s": "ro",
  "u": "",
  "g": 2,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-402 - Administrators - All Apps - Locations exc. DC - Block",
  "s": "ro",
  "u": "",
  "g": 2,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-403 - Administrators - All Apps - Allow - No Persistence--",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "All",
  "r": ""
}, {
  "n": "CA-500 - Guests - All Apps - Locations exc. AU, Corporate - Block",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-501 - Guests - All Apps - Locations exc. AU, Corporate - Block COPY",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-204 - Org Users - iChris - ATO Requirements - Allow - Require Hybrid",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "5 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-401 - Administrators - All Apps - Allow - Require Phish Resistant MFA",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "CA-205 - Org Users - iChris - ATO Requirements - Allow - Require MFA",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "5 apps",
  "r": ""
}, {
  "n": "CA-205 - Org Users - AllApps - ATO Requirements - Allow - No Persistence",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "CA-206 - SACA Users - Dynamics - Allow - Require Hybrid or Intune Compliant",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "CA-207 - SACA Users - Dynamics ? Block - NonAUIPs",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "AdminAccounts_RestrictInternetAccess_JumphostDevices",
  "s": "ro",
  "u": "dc0b9741-04e5-4736-b9de-c60c49dac398",
  "g": 0,
  "a": "4 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-207 - SACA Users - Dynamics ? Allow - Require AU",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "GuestAccess_ADA_CA_AllowMyProfileOnly",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "Email Ingestion App Policy",
  "s": "ro",
  "u": "9eabae13-a1c5-4728-9b83-40e88373ea9e",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-105 - All Users & Guests - Block access from Bad IPs",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-208 ? Org Users ? Selected Apps ? Device Required",
  "s": "off",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-209 ? Org Users (LACs) ? Selected Apps ? Deny ? Outside Australia",
  "s": "off",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-360 - NDIS communities ? PAT - Require MFA - Allow",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "mfa"
}, {
  "n": "AllUsers_Office365Mobile_CompliantDeviceRollout_Reporting",
  "s": "ro",
  "u": "",
  "g": 5,
  "a": "Office365",
  "r": "compliantDevice;compliantApplication"
}, {
  "n": "AzureAD CA Staging V2 - Reporting",
  "s": "ro",
  "u": "",
  "g": 4,
  "a": "All",
  "r": "mfa;domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-208 ? Org Users ? Selected Apps ? Device Required - Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-502 - Guests (Assure) - PowerBI - Locations exc. AU - Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-503 - Guests (Assure) - PowerBI - Require MFA - Allow",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "CA-504 - Guests (Assure) - PowerBI - Risky sign ins - Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "CA-362 - NDIS communities ? Promapp - Require MFA - Allow",
  "s": "on",
  "u": "d2dd0c36-778d-45d6-affc-4db7a216dc72;7fb242c7-8218-4f00-93fe-0be29ffa3c36;0c99932a-887d-4706-9531-1fc363e90cc5",
  "g": 0,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "CA-364 - NDIS communities ? PowerBI - Require MFA - Allow",
  "s": "on",
  "u": "d2dd0c36-778d-45d6-affc-4db7a216dc72;7fb242c7-8218-4f00-93fe-0be29ffa3c36;3c57e0d8-8f74-44b5-811e-f71ff3c4b235;0c99932a-887d-4706-9531-1fc363e90cc5;d09a441c-a384-442d-b306-31e9c115b724;c67bb9db-434a-4a3c-b4a4-c90565483441",
  "g": 1,
  "a": "2 apps",
  "r": "mfa"
}, {
  "n": "CA-262 - All Users exc. NDIS & External ? Promapp - Require Managed devices - Allow",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-263 - All Users exc. NDIS & External ? PowerBI - Require Managed devices - Allow",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "zzADA_Block_Policy_Test_20250626",
  "s": "ro",
  "u": "6f259abd-c3ca-49bd-b1ff-21326f7c2040",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-404 - Administrators - Office 365_AVD - Allow - Token Protection",
  "s": "ro",
  "u": "",
  "g": 2,
  "a": "5 apps",
  "r": ""
}, {
  "n": "CA-361 - NDIS communities ? PAT - Location exc. AU ? Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-363 - NDIS communities ? Promapp - Location exc. AU ? Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-365 - NDIS communities ? PowerBI - Location exc. AU ? Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-260 - All Users exc. NDIS & External ? PAT - Require Managed devices - Allow",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-261 - All Users exc. NDIS & External ? PAT - Location exc. AU ? Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-300 - EncompassCare Users ? Require MFA - Require Managed devices - Allow",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "CA-106 - All Users & Guests - All Apps - Allow - Require Phish Resistant MFA",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "CA-366 - NDIS communities ? Dynamics - Location exc. AU ? Block",
  "s": "off",
  "u": "0c99932a-887d-4706-9531-1fc363e90cc5;c67bb9db-434a-4a3c-b4a4-c90565483441;3c57e0d8-8f74-44b5-811e-f71ff3c4b235",
  "g": 0,
  "a": "4 apps",
  "r": "block"
}, {
  "n": "CA-367 - All Users exc. NDIS & External ? Dynamics- Require Managed devices - Allow",
  "s": "on",
  "u": "802c205f-c95d-4327-b549-eb40adab51c2;0c99932a-887d-4706-9531-1fc363e90cc5;0ecb5407-62b6-41d1-8e33-89dc1f147567",
  "g": 1,
  "a": "All",
  "r": "mfa;domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-APM-Kiosk-BlockNonWindows",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-BlockWebClient",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-RequireCompliantDevice",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "compliantDevice"
}, {
  "n": "CA-APM-Kiosk-WebOnly-Office",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-DeviceBound",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-BlockExchangeOnline",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-BlockTeams",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-RequireCompliantDevice",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "compliantDevice"
}, {
  "n": "CA-APM-KioskPB-BlockNonKioskDevices",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockNonWindows",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockLegacyAuth",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "None",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockAuthFlows",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockRiskySignIn",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-WebOnlyOffice",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/standard-user-avd/policies/ca-policies.js", error: String((e && e.message) || e) }); }

// exports/standard-user-avd/policies/compliance-rules.js
try { (() => {
// Machine-checkable rules derived from the APM policies in policies/.
// Each rule states: when it applies (scope), how to test a document, what compensating
// controls the policy itself accepts, and what to change to become compliant.
//
// test.kind:
//   numeric     extract number+unit near a keyword, compare against maxDays
//   mustState   if in scope, the document MUST contain one of these patterns
//   mustNotSay  if the document contains this, it conflicts with the policy
//   pairing     document says A but must also say B
window.COMPLIANCE_RULES = [
// ---------- Cryptography and Key Management Standard (09.03.027-5.0) ----------
{
  id: 'CRY-01',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a75 key rotation table',
  cat: 'Cryptography',
  title: 'Key rotation maximum age',
  requires: 'Production internet-facing or production data: 60 days. Production not internet-facing: 90 days. Non-production internet-facing: 90 days. Non-production: 180 days.',
  scope: /key vault|keyvault|secret|rotat(e|ion)|cryptographic key|private key/i,
  test: {
    kind: 'numeric',
    near: /rotat/i,
    maxDays: 60
  },
  compensating: ['published by design', 'displayed on the .{0,20}lock screen', 'device-bound', 'bound .{0,30}conditional access', 'no corporate (data|information)', 'single device', 'one physical'],
  remedy: 'Obtain a CISO ruling that account credentials are governed by the Identity and IT Access Management Standard rather than \u00a75 keying material, OR record an accepted risk in the RFFR SoA with the blast-radius argument, OR shorten the rotation interval to 60 days.'
}, {
  id: 'CRY-02',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a74.1 approved algorithms',
  cat: 'Cryptography',
  title: 'Minimum key sizes for approved algorithms',
  requires: 'AES 128 min (256 preferred, never ECB). RSA 2048 min (3072 preferred). ECC/ECDH/ECDSA \u2265224 bits. SHA-256/384/512. DH 2048 min, ephemeral only.',
  scope: /\b(rsa|aes|sha-?\d|ecdsa|ecdh|elliptic curve|diffie)\b/i,
  test: {
    kind: 'mustNotSay',
    pattern: /\b(rsa[- ]?1024|aes[- ]?64|sha-?1\b|md5|\bdes\b|3des|rc4|ecb mode)\b/i,
    guard: /encrypt|cipher|algorithm|hash|key size|signing|tls|certificate|cryptograph/i,
    window: 180
  },
  compensating: [],
  remedy: 'Replace any algorithm below the approved minimum. State the actual algorithm and key size in a settings table rather than leaving it to platform defaults.'
}, {
  id: 'CRY-03',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a75 PKI',
  cat: 'Cryptography',
  title: 'Wildcard certificates must not be used',
  requires: 'Due to increased risk, wildcard certificates must not be used.',
  scope: /certificate|x\.509|pki|tls/i,
  test: {
    kind: 'mustNotSay',
    pattern: /wildcard certificate|\*\.[a-z0-9-]+\.[a-z]{2,}/i,
    guard: /certificate|cert\b|x\.509|\bpki\b|issued by|certificate authority/i,
    window: 150
  },
  compensating: [],
  remedy: 'Replace the wildcard certificate with per-host certificates. Public-facing services use a commercial trusted CA; internal services use APM PKI.'
}, {
  id: 'CRY-04',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a74.2 TLS cipher suites',
  cat: 'Cryptography',
  title: 'TLS version and cipher suite must be stated and approved',
  requires: 'TLS 1.2 (16 named suites) or TLS 1.3 (4 named suites). Anonymous DH not permitted. Ephemeral variants only.',
  scope: /tls|https|mtls|mutual tls|cipher/i,
  test: {
    kind: 'mustState',
    pattern: /tls ?1\.[23]|tls_?(aes|ecdhe|dhe)/i
  },
  compensating: [],
  remedy: 'State the TLS version and the approved cipher suite list from \u00a74.2 explicitly, rather than relying on platform defaults. Confirm TLS 1.0/1.1 are disabled.'
}, {
  id: 'CRY-05',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a73 Authorisation',
  cat: 'Cryptography',
  title: 'Certificate issuance requires D&T Operations approval recorded in ITSM',
  requires: 'X.509 certificates and keying material must be requested and approved by the D&T Operations team, with the request recorded in the IT Service Management application.',
  scope: /certificate|scep|cloud pki|x\.509|code[- ]signing/i,
  test: {
    kind: 'mustState',
    pattern: /d&t operations|service management|itsm|servicenow|snow ticket|approved by .{0,40}operations/i
  },
  compensating: [],
  remedy: 'Add a line naming D&T Operations as the approver for certificate issuance and stating that the request is recorded in the ITSM tool.'
}, {
  id: 'CRY-06',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a74.4 encryption in transit',
  cat: 'Cryptography',
  title: 'Internal and above must be encrypted in transit on every network',
  requires: 'Internal, Confidential and Restricted MUST use current ASD approved encryption over public/guest, corporate and secured networks alike.',
  scope: /in transit|transmit|network|traffic|egress/i,
  test: {
    kind: 'mustState',
    pattern: /encrypt|tls|https|ipsec|asd approved/i
  },
  compensating: [],
  remedy: 'State the transit encryption for every documented data path, including internal/corporate hops - the standard makes no exemption for corporate networks.'
},
// ---------- Windows SOE Hardening Standard V3.0 ----------
{
  id: 'SOE-01',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Win11 OS baseline - Min Device Password Length',
  cat: 'Endpoint & SOE',
  title: 'Minimum device password length is 14 characters',
  requires: 'Min Device Password Length = 14.',
  scope: /passphrase|password|credential/i,
  test: {
    kind: 'numeric',
    near: /(passphrase|password|credential|minimum device password)/i,
    minChars: 14
  },
  compensating: [],
  remedy: 'Constrain the generator so every credential is at least 14 characters and state the guaranteed minimum, not an approximate length.'
}, {
  id: 'SOE-02',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Win11 OS baseline - PowerShell Execution Policy',
  cat: 'Endpoint & SOE',
  title: 'PowerShell execution policy allows only signed scripts',
  requires: 'Execution Policy (Device) = Allow only signed scripts, with script block logging enabled.',
  scope: /powershell|\.ps1|script|remediation|runbook/i,
  test: {
    kind: 'mustState',
    pattern: /signed|code[- ]signing|signature/i
  },
  compensating: [],
  remedy: 'State that every device-side script is signed with the APM code-signing certificate, and name the certificate dependency as a build prerequisite.'
}, {
  id: 'SOE-03',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'USB Baseline - removable storage',
  cat: 'Endpoint & SOE',
  title: 'Removable storage is deny-all by default',
  requires: 'All Removable Storage classes: Deny all access = Enabled. Removable Disks: Deny write access = Enabled. BitLocker requires encryption on removable drives.',
  scope: /usb|removable|external drive|thumb drive/i,
  test: {
    kind: 'mustNotSay',
    pattern: /(deny write access[^.]{0,40}(disable|not configured)|removable[^.]{0,30}(enabled|permitted|allowed)|usb (storage )?(enabled|permitted|allowed))/i
  },
  compensating: ['autoplay', 'autorun', 'scan removable', 'block untrusted and unsigned processes', 'app ?control', 'application control', 'file explorer[^.]{0,40}removable', 'explicit approval', 'exception polic'],
  remedy: 'Removable media is administratively disabled by default under the Posture Statement \u00a74.3 with an explicit-approval path. Deliver the exception by assignment (exclude the device group from the estate USB baseline and assign a purpose-built exception profile), record the compensating controls, and cite the \u00a74.3 approval clause plus who granted it.'
}, {
  id: 'SOE-04',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'App Control for Business',
  cat: 'Endpoint & SOE',
  title: 'Application control must be enforced, and script enforcement is an open estate gap',
  requires: 'App Control Audit and Enforced policies, 18 trusted signers. Script Enforcement is DISABLED estate-wide and flagged in the standard for attention.',
  scope: /app ?control|application control|wdac|allow[- ]?list|executable/i,
  test: {
    kind: 'mustState',
    pattern: /script enforcement|enforced|enforce/i
  },
  compensating: ['asr', 'attack surface reduction', 'assigned access', 'no shell'],
  remedy: 'If application control is cited as a compensating control, enable script enforcement in the design variant - the estate policies have it off, so App Control alone does not constrain scripts carried in on removable media.'
}, {
  id: 'SOE-05',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Win11 OS baseline - remote access',
  cat: 'Endpoint & SOE',
  title: 'Remote Assistance, Remote Shell and inbound RDP are disabled',
  requires: 'Configure Offer/Solicited Remote Assistance = Disabled. Allow Remote Shell Access = Disabled. Allow users to connect remotely using Remote Desktop Services = Disabled.',
  scope: /remote (support|access|assistance|desktop|shell)|teamviewer|anydesk|vnc|screen ?share/i,
  test: {
    kind: 'mustNotSay',
    pattern: /teamviewer|anydesk|\bvnc\b|logmein|splashtop/i
  },
  compensating: ['attended', 'consent', 'mfa|multi-factor', 'per-device', 'file transfer disabled', 'session log', 'sentinel'],
  remedy: 'Prefer an approved path (Intune Remote Help or Defender live response), which removes the variation. If a third-party tool is retained, document the full access model and obtain explicit CISO acceptance as a variation to the estate remote-access position.'
}, {
  id: 'SOE-06',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Win11 OS baseline - Block user from showing account details on sign-in',
  cat: 'Endpoint & SOE',
  title: 'Account details must not be shown on the sign-in screen',
  requires: 'Block user from showing account details on sign-in = Enabled. Lock screen further hardened (no camera, no slide show, no app notifications).',
  scope: /lock screen|sign-?in screen|logon screen|wallpaper/i,
  test: {
    kind: 'mustNotSay',
    pattern: /(display|show|shown|shows)[^.]{0,60}(credential|passphrase|password|upn)/i,
    guard: /lock screen|sign-?in|logon|wallpaper/i,
    window: 200
  },
  compensating: ['per-device', 'device-bound', 'conditional access', 'unusable', 'no corporate', 'rotated'],
  remedy: 'Record as an argued deviation naming both this control and the clear desk and screen policy in the Posture Statement \u00a74.1, with the reason a displayed credential is safe here and the reason autologon was rejected. Obtain APM Cyber Security acceptance.'
}, {
  id: 'SOE-07',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Windows compliance policy',
  cat: 'Endpoint & SOE',
  title: 'Compliance policy must carry the nine device-health gates',
  requires: 'BitLocker, Secure Boot, Firewall, TPM, Antivirus, Antispyware, Defender Antimalware, security intelligence up to date, real-time protection - all Required.',
  scope: /compliance polic/i,
  test: {
    kind: 'pairing',
    a: /compliance polic/i,
    b: /secure boot/i
  },
  compensating: [],
  remedy: 'Mirror all nine staff gates in the design compliance policy. The standard records no minimum OS version as an open observation - closing it in your design exceeds the standard.'
}, {
  id: 'SOE-08',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Win11 OS baseline - Interactive Logon Machine Inactivity Limit',
  cat: 'Endpoint & SOE',
  title: 'Machine inactivity limit is 900 seconds',
  requires: 'Interactive Logon Machine Inactivity Limit = 900.',
  scope: /inactiv|idle|timeout|sign-?out/i,
  test: {
    kind: 'numeric',
    near: /(inactiv|idle|timeout)/i,
    maxSeconds: 900
  },
  compensating: [],
  remedy: 'Set the inactivity limit to 900 seconds or lower. A shorter limit exceeds the standard and should be stated as such.'
},
// ---------- Cyber Security Posture Statement (09.01.033-5.0) ----------
{
  id: 'POS-01',
  doc: 'Cyber Security Posture Statement',
  clause: '\u00a74.2 Data Centres',
  cat: 'Governance',
  title: 'Data residency is Microsoft Australian Azure - Sydney and Melbourne',
  requires: 'All data held on APM managed infrastructure is stored in Microsoft Australian Azure, Sydney and Melbourne data centres.',
  scope: /azure|region|data cent|residency|tenant/i,
  test: {
    kind: 'mustNotSay',
    pattern: /\b(east us|west us|west europe|north europe|southeast asia|east asia|uk south|central us|australia central)\b/i,
    guard: /region|deploy|host|data cent|azure/i,
    window: 180
  },
  compensating: [],
  remedy: 'Host in Australia East (Sydney) or Australia Southeast (Melbourne) and state the region explicitly. Any other region breaches the stated residency position.'
}, {
  id: 'POS-02',
  doc: 'Cyber Security Posture Statement',
  clause: '\u00a74.3 Enterprise Asset Management',
  cat: 'Governance',
  title: 'Removable media requires explicit APM ICT stakeholder approval',
  requires: 'Access to removable media is administratively disabled on APM ICT assets. Explicit approval must be granted by APM ICT stakeholder(s) to allow access to APM approved removable media.',
  scope: /usb|removable/i,
  test: {
    kind: 'mustState',
    pattern: /explicit approval|approved by|exception polic|accepted risk|approval[^.]{0,30}(granted|obtained)/i
  },
  compensating: [],
  remedy: 'Cite this clause as the policy basis for the exception and record who granted the explicit approval and when. This converts the USB position from a defence into a citation.'
}, {
  id: 'POS-03',
  doc: 'Cyber Security Posture Statement',
  clause: '\u00a76.2 Remote Access',
  cat: 'Governance',
  title: 'Remote access requires APM VPN or approved VDI',
  requires: 'All remote access to the APM network requires APM VPN, or approval to use its VDI. Services monitored during use; all connections encrypted.',
  scope: /remote access|remote support|vpn|vdi/i,
  test: {
    kind: 'mustState',
    pattern: /vpn|virtual desktop|vdi|avd|approved|variation|accepted/i
  },
  compensating: ['monitored', 'encrypted', 'mfa|multi-factor', 'session log'],
  remedy: 'Use VPN or approved VDI, or document the alternative as an approved variation with monitoring and encryption evidence.'
}, {
  id: 'POS-04',
  doc: 'Cyber Security Posture Statement',
  clause: '\u00a75.2 Identity and Access Management',
  cat: 'Identity & Access',
  title: 'MFA, ISM-aligned complex passwords, inactivity session termination',
  requires: 'Aligned to the Identity and IT Access Management Standard: MFA, complex passwords aligned to ISM, session termination based on inactivity, need-to-know and least-privilege.',
  scope: /authenticat|sign-?in|identity|account|mfa/i,
  test: {
    kind: 'mustState',
    pattern: /mfa|multi-factor|passwordless|phishing-resistant|conditional access|compensating/i
  },
  compensating: ['conditional access', 'device-bound', 'compliant device', 'cannot satisfy', 'compensating control'],
  remedy: 'Where MFA cannot be satisfied (fixed-credential service accounts), state that explicitly and set out the compensating controls that replace the possession factor. Do not leave MFA unaddressed.'
}, {
  id: 'POS-05',
  doc: 'Cyber Security Posture Statement',
  clause: '\u00a74.1 Physical Security',
  cat: 'Governance',
  title: 'Clear desk and clear screen policy is enforced',
  requires: 'Clear desk and screen policy enforced through the Information Security Code of Practice.',
  scope: /screen|display|kiosk|wallpaper|lock screen/i,
  test: {
    kind: 'mustNotSay',
    pattern: /(display|show)[^.]{0,50}(password|passphrase|credential)/i,
    guard: /screen|display|kiosk|wallpaper/i,
    window: 200
  },
  compensating: ['per-device', 'device-bound', 'no corporate', 'rotated', 'conditional access'],
  remedy: 'If information is deliberately displayed on screen, argue it against this clause explicitly rather than leaving the contradiction to be found in review.'
},
// ---------- Continuous Monitoring Plan (09.03.021-5.0) ----------
{
  id: 'MON-01',
  doc: 'Continuous Monitoring Plan',
  clause: 'Penetration Testing',
  cat: 'Monitoring',
  title: 'Penetration testing prior to go-live, after material change, and annually',
  requires: 'Pen testing performed prior to a system going live; after material upgrades or modifications; generally annually. System owner approval required; schedule agreed with System Owners and approved by the CISO.',
  scope: /penetration test|pen ?test|security testing/i,
  test: {
    kind: 'mustState',
    pattern: /prior to (go|going) live|before (go|going) live|pre-?production|annual/i
  },
  compensating: [],
  remedy: 'State that penetration testing completes before the system goes live (not merely before wider rollout), name the System Owner who approves scope, and note the schedule is CISO-approved.'
}, {
  id: 'MON-02',
  doc: 'Continuous Monitoring Plan',
  clause: 'Vulnerability Management',
  cat: 'Monitoring',
  title: 'Continuous vulnerability monitoring via Defender and Wiz.io',
  requires: 'All APM systems are continuously monitored using Defender for Cloud and Defender for Endpoint. Wiz.io continuously monitors cloud service environments. Weekly Cyber/Digital Ops review meeting.',
  scope: /vulnerabilit|patch|monitor|defender|endpoint protection/i,
  test: {
    kind: 'mustState',
    pattern: /defender for endpoint|defender for cloud|wiz\.io|wiz\b/i
  },
  compensating: [],
  remedy: 'Name Defender for Endpoint onboarding for every device population in the design, including any in a separate tenant, and confirm cloud resources are onboarded to Wiz.io. Cross-tenant licensing and log flow must be designed, not assumed.'
}, {
  id: 'MON-03',
  doc: 'Continuous Monitoring Plan',
  clause: 'CONMON independence',
  cat: 'Monitoring',
  title: 'Assessment must be performed by personnel independent of the system',
  requires: 'CONMON activities conducted by the Cyber Security Team or personnel of similar skillset independent of the system being assessed; may be internal or third party.',
  scope: /assessment|vulnerability assessment|audit|review/i,
  test: {
    kind: 'mustState',
    pattern: /independent|third party|external|cyber security team/i
  },
  compensating: [],
  remedy: 'Name who performs the assessment and state their independence from the system owner.'
},
// ---------- Cyber Incident Response Plan (09.03.005-7.0) ----------
{
  id: 'IRP-01',
  doc: 'Cyber Incident Response Plan',
  clause: 'Containment step 9 / ISM 915c',
  cat: 'Incident Response',
  title: 'Personal or sensitive data incidents are notifiable to DEWR and ASD',
  requires: 'Where an incident affects an environment holding personal/sensitive data, the CIRT Manager and Data Owner notify the Department as Accreditation Authority ASAP via securitycompliancesupport@jobs.gov.au and notify ASD. No action affecting evidence integrity prior to ASD involvement (ISM 915c).',
  scope: /incident|compromis|breach|stolen|lost device|wipe|reset/i,
  test: {
    kind: 'mustState',
    pattern: /incident response plan|dewr|accreditation authority|asd|915c|notif/i
  },
  compensating: [],
  remedy: 'Reference the Cyber Incident Response Plan and the Theft / Loss of IT Asset playbook rather than inventing a procedure. State that automated response is limited to containment (disable the account) and that device wipe must not occur before ASD clearance.'
}, {
  id: 'IRP-02',
  doc: 'Cyber Incident Response Plan',
  clause: 'Reporting / Identification',
  cat: 'Incident Response',
  title: 'Incidents reported via APM Assist and logged in ServiceNow',
  requires: 'All staff must immediately report a real or potential incident using APM Assist. All incidents logged in a ServiceNow ticket; P1/P2 update the Major Cyber Security Incident Register.',
  scope: /incident|alert|escalat/i,
  test: {
    kind: 'mustState',
    pattern: /apm assist|servicenow|snow|major cyber security incident register|incident manager/i
  },
  compensating: [],
  remedy: 'Name the reporting path (APM Assist, ServiceNow) in the service management section so operational staff have a defined route.'
}, {
  id: 'IRP-03',
  doc: 'Cyber Incident Response Plan',
  clause: 'Retaining evidence',
  cat: 'Incident Response',
  title: 'Network traffic logs retained 7 days prior to incident discovery',
  requires: 'Network traffic logs retained for a period of seven days prior to the discovery of the incident; all retention or removal logged in the chain of custody document.',
  scope: /log retention|logging|retain|sentinel|log analytics/i,
  test: {
    kind: 'mustState',
    pattern: /\b(7|seven) days|\d+ days|\d+ ?day retention|retention/i
  },
  compensating: [],
  remedy: 'State log retention explicitly and confirm it exceeds 7 days for network traffic. The kiosk design already states 180 days for Sentinel and ZIA, which satisfies this.'
},
// ---------- Trusted Insider Program (09.03.020-6.0) ----------
{
  id: 'TIP-01',
  doc: 'APM Trusted Insider Program',
  clause: '\u00a73.2 Identity and Access Management',
  cat: 'Identity & Access',
  title: 'Privileged administration uses separate accounts with added complexity',
  requires: 'Staff performing privileged administration tasks use separate accounts with trusted insider and additional privileged account protections. Additional password complexity applied. Contractors held to the same controls.',
  scope: /privileged|administrator|admin account|elevated|local admin/i,
  test: {
    kind: 'mustState',
    pattern: /separate account|dedicated .{0,20}account|non-privileged|per-device .{0,20}account|paw|privileged access/i
  },
  compensating: [],
  remedy: 'Name the administrative accounts, confirm they are separate from standard accounts, and state the additional complexity and monitoring applied. Contractors get the same controls.'
}, {
  id: 'TIP-02',
  doc: 'APM Trusted Insider Program',
  clause: '\u00a73.3-3.4',
  cat: 'Identity & Access',
  title: 'Enterprise password manager and Purview Insider Risk Management',
  requires: 'IT Trusted Users provisioned access to an enterprise password management solution. Protective monitoring via external SOC; monitoring includes Microsoft Purview Insider Risk Management. Logging covers authentication events, endpoint protection alerts, internet browsing activity.',
  scope: /privileged|admin|password manager|credential store|insider/i,
  test: {
    kind: 'mustState',
    pattern: /password (manager|state|vault)|key vault|purview|insider risk|soc\b/i
  },
  compensating: [],
  remedy: 'State where privileged credentials are stored (enterprise password manager or Key Vault) and confirm the population is in scope for Purview Insider Risk Management and SOC monitoring.'
},
// ---------- Compliance Management Plan (09.03.055-1.2) ----------
{
  id: 'CMP-01',
  doc: 'Compliance Management Plan',
  clause: 'Statement of Applicability',
  cat: 'Governance',
  title: 'Controls and exclusions must appear in the RFFR Statement of Applicability',
  requires: 'The SoA lists all Annex A controls, states applicability, justifies inclusion/exclusion and references implementation. The RFFR SoA additionally covers DEWR contractual obligations and ISM controls.',
  scope: /exclu|exception|accepted risk|not applicable|deviation|compensating/i,
  test: {
    kind: 'mustState',
    pattern: /statement of applicability|\bsoa\b|rffr/i
  },
  compensating: [],
  remedy: 'Every exclusion or accepted risk claimed in the design must be recorded in the RFFR SoA with justification and implementation reference. Name the SoA in the design.'
}, {
  id: 'CMP-02',
  doc: 'Compliance Management Plan',
  clause: 'Annual compliance calendar',
  cat: 'Governance',
  title: 'Changes to the operating environment are notifiable to DEWR within 5 days',
  requires: 'Notify DEWR within 5 days of any changes to APM or subcontractor circumstances that may affect the risk profile, to enable re-categorisation.',
  scope: /new tenant|new subscription|internet-?facing|public endpoint|third party|subcontractor|new environment/i,
  test: {
    kind: 'mustState',
    pattern: /dewr|notif|5 days|five days|re-?categoris/i
  },
  compensating: [],
  remedy: 'Where the design introduces a new tenant, a new internet-facing endpoint or a new supplier, flag the 5-day DEWR notification as an implementation task and name the owner.'
}, {
  id: 'CMP-03',
  doc: 'Compliance Management Plan',
  clause: 'Governance and accountability',
  cat: 'Governance',
  title: 'Control validation quarterly; ISM updates reviewed quarterly',
  requires: 'Control owners validate implementation status, details and applicability quarterly. Published ISM updates reviewed each Mar, Jun, Sep, Dec with applicability and risk analysis.',
  scope: /control owner|validation|ism|review cadence|assurance/i,
  test: {
    kind: 'mustState',
    pattern: /quarterly|control owner|ism (update|version)|annual review/i
  },
  compensating: [],
  remedy: 'Name the control owner for each control the design introduces, and note that the design is re-checked against quarterly ISM updates.'
},
// ---------- Artificial Intelligence Policy (09.01.037-2.1) ----------
{
  id: 'AI-01',
  doc: 'Artificial Intelligence Policy',
  clause: 'Approval for use of AI',
  cat: 'Governance',
  title: 'AI use requires ELT sign-off, a business case and a privacy impact assessment',
  requires: 'AI use must be signed off by the ELT member for the business, with assessments by the regional Data Privacy and Digital leaders. Business case and privacy impact assessment required. Human in the loop for decision-making.',
  scope: /\b(ai|artificial intelligence|copilot|llm|generative|chatgpt|gemini|machine learning)\b/i,
  test: {
    kind: 'mustState',
    pattern: /elt|privacy impact|business case|approval|data privacy|human in the loop/i
  },
  compensating: ['ephemeral', 'no corporate data', 'public site', 'category filter', 'job seeker'],
  remedy: 'If the design permits, embeds or exposes AI, confirm with Data Privacy whether it constitutes APM use of AI requiring ELT sign-off and a privacy impact assessment. Record the outcome in the decision register.'
}, {
  id: 'AI-02',
  doc: 'Artificial Intelligence Policy',
  clause: 'Ongoing governance of AI use',
  cat: 'Governance',
  title: 'Every shared AI agent or use case has a named owner and appears in the Agent register',
  requires: 'Every shared AI agent, use case or deployment must have an explicitly assigned owner responsible for accuracy, relevance and maintenance. A central regional Agent register records purpose, owner and audience.',
  scope: /\b(ai agent|agent|copilot|assistant|automation with ai)\b/i,
  test: {
    kind: 'mustState',
    pattern: /owner|agent register|accountab/i
  },
  compensating: [],
  remedy: 'Name the owner of any AI agent or use case the design creates and add it to the regional Agent register.'
},
// ---------- Identity and IT Access Management Standard (09.03.035-5.0) ----------
{
  id: 'IAM-01',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a75 Clients Access Management',
  cat: 'Identity & Access',
  title: 'Client-use IT assets are segregated from APM IT systems and store no client information',
  requires: 'Client systems must not be connected to any non-public APM IT systems. No information created by the client is stored on the asset. Clients receive acceptable-use guidelines. APM employees must not use client-designated assets for APM duties.',
  scope: /participant|job ?seeker|client (device|system|computer|kiosk)|public[- ]area|kiosk/i,
  test: {
    kind: 'mustState',
    pattern: /not connect|blocked|cannot (access|reach)|segregat|isolat|no (corporate|apm) (data|information|system)|purge|deleted (on|at|every)/i
  },
  compensating: [],
  remedy: 'State how the fleet is disconnected from non-public APM systems (CA block, network segregation), how client-created information is destroyed, and where the participant acceptable-use guidance lives. This clause is also the policy basis for exempting client assets from staff-user controls - cite it when arguing a deviation.'
}, {
  id: 'IAM-02',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.1 / \u00a74.2.2 shared and generic accounts',
  cat: 'Identity & Access',
  title: 'Shared or generic accounts need an approved business justification and an allocation record',
  requires: 'Shared user IDs avoided unless business justification approved by the Cyber Security Team; never for sensitive applications. Generic accounts get minimum rights, no corporate-system access, a process identifying the user, password reset on membership change and at 12 months.',
  scope: /shared account|generic account|session account|kiosk account|communal|walk-?up/i,
  test: {
    kind: 'mustState',
    pattern: /business justification|approved by[^.]{0,40}cyber|one account per device|per-?device account|device-bound|no corporate|minimum rights|standard (local )?user/i
  },
  compensating: [],
  remedy: 'Record the Cyber-approved justification for the shared/anonymous account, keep it out of corporate systems, and state the per-device binding (or allocation record) that substitutes for user identification.'
}, {
  id: 'IAM-03',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.1.2 Multi-Factor Authentication (ISM-0417)',
  cat: 'Identity & Access',
  title: 'Single-factor authentication requires a minimum of 15 characters',
  requires: 'MFA authenticates all Users. Where a system cannot support MFA, single-factor authentication requires a minimum of 15 characters.',
  scope: /single[- ]factor|cannot support (mfa|multi-factor)|no mfa|without mfa|password-only/i,
  test: {
    kind: 'numeric',
    near: /single[- ]factor|password|credential/i,
    minChars: 15,
    notNear: /standard sets|minimum device password|hardening standard|complexity categor|standard user|policy minimum/i
  },
  compensating: [],
  remedy: 'Raise any single-factor credential to 15+ characters, or implement MFA. State the guaranteed minimum.'
}, {
  id: 'IAM-04',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.2.2 System Administrator \u00b68-9',
  cat: 'Identity & Access',
  title: 'Local administrator passwords, including LAPS-managed, are at least 30 characters and rotate every 30 days',
  requires: 'Default system administrator account passwords automatically changed every 30 days using LAPS. Passwords for Local Administrator accounts, including those managed by LAPS, must be at least 30 characters. Distinct per device. Guest disabled.',
  scope: /\blaps\b|local admin/i,
  test: {
    kind: 'numeric',
    near: /laps|local administrator|admin/i,
    minChars: 30,
    notNear: /standard sets|minimum device password|hardening standard|policy minimum|account-name limit/i
  },
  compensating: [],
  remedy: 'Set the LAPS policy PasswordLength to 30 or more and the rotation period to 30 days, and state both values in the settings table.'
}, {
  id: 'IAM-05',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.3 User Account Locks',
  cat: 'Identity & Access',
  title: 'Accounts lock after five failed logon attempts',
  requires: 'User accounts automatically locked after five failed logon attempts; unlocked only after the administrator proves the user\u2019s identity.',
  scope: /lockout|failed (logon|login|sign-?in)|brute[- ]force/i,
  test: {
    kind: 'mustState',
    pattern: /\b(five|5)\b[^.]{0,30}(failed|attempts)|lockout threshold|account lockout/i
  },
  compensating: ['no password|credential (is |)known to no|autologon|automatic logon'],
  remedy: 'State the lockout threshold (5) in the baseline table, or state why no lockable credential exists.'
}, {
  id: 'IAM-06',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.2.5 Account Deactivation',
  cat: 'Identity & Access',
  title: 'Accounts deactivate same-day on termination and after 30 days of inactivity',
  requires: 'On termination, the account is deactivated across all IT systems the same day the relationship ends. Accounts may also be deactivated on suspected malicious activity or after more than 30 days of inactivity.',
  scope: /deprovision|termination|leaver|offboard|account (deactivat|disabl|lifecycle)/i,
  test: {
    kind: 'mustState',
    pattern: /same day|30 days|inactivity|disabled (on|when|at)/i
  },
  compensating: [],
  remedy: 'State the deactivation trigger and timing for every account class the design creates, including service and support accounts.'
}, {
  id: 'IAM-07',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.4 Application Management',
  cat: 'Identity & Access',
  title: 'Application-control hash, publisher and path rules are validated annually',
  requires: 'Cryptographic hash rules, publisher certificate rules and path rules used for application control are validated annually. Standard users cannot uninstall or disable approved software. Unauthorised access to the authoritative software source is prevented.',
  scope: /app ?control|application control|wdac|allow[- ]?list/i,
  test: {
    kind: 'mustState',
    pattern: /annual|yearly|validated|review(ed)? (at least|every)/i
  },
  compensating: [],
  remedy: 'Add an annual validation of the App Control signer/hash/path rules to the service management calendar and name its owner.'
}, {
  id: 'IAM-08',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.2.2 Service Accounts',
  cat: 'Identity & Access',
  title: 'Service accounts are managed identities or gMSA where possible, 30+ characters when interactive, with a named owner',
  requires: 'Service accounts created as group Managed Service Accounts, Virtual Accounts or Managed Identities where possible. Interactive service accounts (user objects) should have 30+ character passwords, changed on compromise indicators and at 12 months. Minimum permissions. Every service account has an owner.',
  scope: /service account|automation account|service principal|managed identity|workload identity/i,
  test: {
    kind: 'mustState',
    pattern: /managed identit|gmsa|group managed|virtual account|owner/i
  },
  compensating: [],
  remedy: 'Prefer a managed identity (no credential); otherwise state the 30-character minimum, the rotation triggers and the named owner for each service account.'
},
// ---------- Intrusion Detection and Prevention Standard (09.03.034-3.0) ----------
{
  id: 'IDPS-01',
  doc: 'Intrusion Detection and Prevention Standard',
  clause: '\u00a72 Host based Intrusion Detection',
  cat: 'Monitoring',
  title: 'EDR is mandatory on end user devices',
  requires: 'Endpoint Detection and Response technology must detect and prevent threats on end user devices: anti-malware, anti-spyware, behaviour analysis, rootkit and anomaly detection in a cloud-managed platform, plus a cloud heuristic engine for unknown strains.',
  scope: /endpoint|device (fleet|population)|workstation|laptop|kiosk|soe\b/i,
  test: {
    kind: 'mustState',
    pattern: /defender for endpoint|\bedr\b|endpoint detection|\bmde\b/i
  },
  compensating: [],
  remedy: 'Onboard every device population to Defender for Endpoint (or the approved EDR) and state the licence that carries it.'
}, {
  id: 'IDPS-02',
  doc: 'Intrusion Detection and Prevention Standard',
  clause: '\u00a72 Host based Intrusion Detection \u00b63',
  cat: 'Monitoring',
  title: 'End-user web traffic is inspected, logged and alerted',
  requires: 'For End User Computing devices, web traffic must be inspected, logged and alerted upon, with detection for malware, known malicious hosts, botnet and C2 infrastructure.',
  scope: /web (traffic|filtering|access)|internet access|browsing|url filter/i,
  test: {
    kind: 'mustState',
    pattern: /zscaler|inspect|url filter|ssl inspect|proxy|web filter/i
  },
  compensating: [],
  remedy: 'Name the web-inspection layer (Zscaler at APM), its logging destination and who receives the alerts.'
}, {
  id: 'IDPS-03',
  doc: 'Intrusion Detection and Prevention Standard',
  clause: '\u00a72 Email Gateways \u00b63',
  cat: 'Monitoring',
  title: 'Webmail is blocked at APM - email only through Outlook on APM devices',
  requires: 'All webmail is blocked at APM; email may only be accessed through the approved mail application (Microsoft Outlook) on APM devices, to maintain data control and limit loss through third-party email applications.',
  scope: /webmail|personal (e-?)?mail|gmail|hotmail|outlook\.com/i,
  test: {
    kind: 'mustNotSay',
    pattern: /(webmail|personal (e-?)?mail|gmail|hotmail)[^.]{0,80}(allow|permit|open|reachable|accessible|stays open|remains? (open|reachable))/i,
    guard: /mail/i,
    window: 160
  },
  compensating: ['client (device|system|asset)', 'participant', 'job ?seeker', 'not connected to[^.]{0,40}apm it systems', 'no (apm|corporate) (data|mailbox|account)', 'clients access management'],
  remedy: 'Webmail on an APM staff device conflicts with this standard outright. On a client-designated asset, argue the Identity and IT Access Management Standard \u00a75 carve-out explicitly: the device is not connected to APM IT systems, holds no corporate mailbox, and the user is a client, not a User.'
}, {
  id: 'IDPS-04',
  doc: 'Intrusion Detection and Prevention Standard',
  clause: '\u00a72 Reporting and responding / Log and event correlation',
  cat: 'Monitoring',
  title: 'Logs and alerts flow to the 24/7 external SOC and the SIEM',
  requires: 'Logs and alerts from APM devices go to the external 24/7 SOC. Host-based intrusion prevention alerts the APM Cyber Security Team directly. A SIEM correlates alerts and events from endpoints and gateways.',
  scope: /siem|sentinel|\bsoc\b|security operations|alert/i,
  test: {
    kind: 'mustState',
    pattern: /sentinel|siem|\bsoc\b|security operations centre?/i
  },
  compensating: [],
  remedy: 'Route every telemetry source the design creates into Sentinel and state which alerts reach the SOC versus the Cyber Security Team directly.'
},
// ---------- Identity Protection Standard (09.03.044-4.0) ----------
{
  id: 'IDP-01',
  doc: 'Identity Protection Standard',
  clause: 'Defender for Identity',
  cat: 'Identity & Access',
  title: 'Defender for Identity is mandatory on all APM Domain Controllers',
  requires: 'Microsoft Defender for Identity monitors all Active Directory activity; mandatory on all APM Domain Controllers; logs to Sentinel for SOC review and alerting.',
  scope: /domain controller|ad ds\b|active directory domain services|new (dc|domain)/i,
  test: {
    kind: 'mustState',
    pattern: /defender for identity|\bmdi\b/i
  },
  compensating: ['no (ad ds|domain controller|active directory)', 'entra[- ]joined only|entra id join'],
  remedy: 'Any design that stands up or touches AD DS domain controllers must include the Defender for Identity sensor on them. Cloud-native (Entra-only) designs state that no DC exists, which makes this standard not applicable.'
},
// ---------- Risk Management Framework (01.01.004-8.3) ----------
{
  id: 'RMF-01',
  doc: 'Risk Management Framework',
  clause: '\u00a73.3 Risk Assessment / Appendices A-D',
  cat: 'Governance',
  title: 'Risk assessments use the APM methodology: likelihood, consequence, controls, residual rating',
  requires: 'Risks are analysed with the APM likelihood scale (Rare to Almost Certain, 1-5), consequence table (Insignificant to Severe, 1-5), inherent rating from the matrix, control effectiveness rating, and a residual rating mapped back to the matrix (Negligible / Minor / Moderate / High / Extreme).',
  scope: /risk register|risk assessment|residual risk|inherent risk/i,
  test: {
    kind: 'mustState',
    pattern: /likelihood|consequence|residual/i
  },
  compensating: [],
  remedy: 'Rate each register entry with likelihood and consequence on the APM 1-5 scales and state the residual rating after controls, so the register can transfer into Clew without re-assessment.'
}, {
  id: 'RMF-02',
  doc: 'Risk Management Framework',
  clause: '\u00a73.4 Risk Evaluation / Appendix E',
  cat: 'Governance',
  title: 'High and Extreme residual risks need treatment plans and named acceptance authority',
  requires: 'Extreme and High residual risks are generally not acceptable: treatment to a target rating within an agreed timeframe. Acceptance of Extreme only by the Board, High only by the ARC, Moderate by the responsible Executive, Minor by the business unit head. Every risk has an owner and appears in a risk register.',
  scope: /accepted risk|risk acceptance|extreme risk|high risk|risk treatment/i,
  test: {
    kind: 'mustState',
    pattern: /owner|accept(ed|ance) by|treatment|target (rating|risk)/i
  },
  compensating: [],
  remedy: 'Name the risk owner and the acceptance authority matching the residual rating (Board for Extreme, ARC for High, Executive for Moderate). An untreated High risk without ARC acceptance cannot ship.'
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/standard-user-avd/policies/compliance-rules.js", error: String((e && e.message) || e) }); }

// exports/standard-user-avd/policies/environment-config.js
try { (() => {
// APM environment register - what is actually configured in the tenant and estate.
// Distinct from compliance-rules.js (what policy demands): these entries describe live
// configuration, and each carries `interactions` - advisory triggers that fire when a
// design touches something this configuration affects. Interactions never fail a
// compliance run; they surface as a "check this" list with the specific remedy.
window.ENVIRONMENT_CONFIG = [{
  id: 'ENV-ESLZ',
  name: 'Azure Enterprise-Scale Landing Zone (APAC)',
  source: 'APM Azure Landing Zone (APAC) - DetailedDesign v1.1 (uploads/) and the ESLZ Reference Corpus (reference/eslz/, 4 parts)',
  cat: 'Configuration',
  owner: 'Head of Digital Transformation and Architecture',
  appliesWhen: {
    min: 3,
    any: [/aus-sub-|azure subscription|subscription (id|scope|placement)/i, /\bvnet\b|virtual network/i, /resource group/i, /management group/i, /azure policy|policy initiative/i, /route table|user[- ]defined route|\budr\b/i, /network security group|\bnsg\b/i, /private endpoint|private dns zone/i, /availability (set|zone)/i, /10\.[45]\d\.\d+\.\d+/, /auea-|ause-/i, /peering|hub-spoke/i]
  },
  facts: [['Topology', 'Hub-spoke, Australia East (10.40.0.0/16) and Australia Southeast (10.50.0.0/16). All spokes peer to the regional connectivity hub; Sandbox and Acquisitions do not peer.'], ['Management groups', 'AUS-MG-PLATFORM (CONNECTIVITY, IDENTITY, SECURITY, MANAGEMENT), AUS-MG-PROD/DEV/SIT/UAT-CONTROLLED and -STANDARD, AUS-MG-ACQUISITIONS, AUS-MG-SANDBOX. Security domains: controlled and standard.'], ['Subscriptions', 'aus-sub-connectivity, -identity, -management, -{prod|dev|sit|uat}-{controlled|standard}-001, -avd-controlled-001, -sandbox-001, -acquisitions-001.'], ['AVD spoke', 'aus-sub-avd-controlled-001 / auea-vnet-avd-ctrl-001 = 10.40.88.0/23, Australia East, controlled domain - the landing place for the AVD SOEs.'], ['DNS', 'Azure DNS Private Resolver in the connectivity subscription; AD DS domain controllers in aus-sub-identity (auea-vnet-identity-001 10.40.4.0/24 / ause 10.50.4.0/24).'], ['Public IPs', 'Azure Policy denies public IP creation in all management groups except the connectivity subscription (Design Decision 17).'], ['RBAC', 'PIM-managed, eligible time-bound Role-Admin-AzureMG* groups per management group; no standing access.'], ['Compliance frame', 'MCSB, RFFR, ISM, APM Policy named as certification targets.'], ['Subscription count', 'Design says 13, the as-built placement table lists 15 rows including AVD, and the policy baseline assigns ASC Default to "all 15". UNRECONCILED - present all three, never pick one silently.'], ['Actually deployed', 'Hub, identity, management, prod-controlled and prod-standard only (40 subnets). Dev, SIT, UAT, AVD, sandbox and acquisitions spokes are designed, not deployed.'], ['Placement anomalies', 'Three, preserved from the as-built table: sandbox shown directly under APM not AUS-MG-SANDBOX; acquisitions shown under AUS-MG-SANDBOX; AVD absent from the 13-subscription design table and shown directly under APM.'], ['Archetype sizing', 'Connectivity /23 (507 usable), Identity /24 (251), Production /22 (1019) per security domain, Dev/SIT/UAT /23 each per domain, Sandbox /24, Management /24 at x.255.0/24, AVD /23. Every VNet carries reserved additional CIDRs for contiguous growth. Unallocated in AUEA: 10.40.96-247.'], ['Mandatory tags', '13: Criticality, application-id, business-service, apm-security-domain, environment, owner, technicalcontact, cost-centre, operationalteam, service-component-type, backup, enableupdate, update-stage. Two drive automation silently: backup (BasicVMBackup / StandardVMBackup / StandardSQLVMBackup / StandardSQLVM(OS)Backup enrol into BK01-BK08) and update-stage (Lead / auto-patch01 / auto-patch02 select the AUM maintenance configuration).'], ['Policy baseline', '218 assignments: 175 policies + 43 initiatives; 32 custom, 186 built-in; enforcement mode Default on all. Scope split: APM intermediate root 99, AUS-MG-PLATFORM 8, AUS-MG-REGION 7, AUS-MG-SANDBOX 1, individual subscriptions 103. Stream01 (16 Dec 2025) 202, Stream03 (17 Jul 2026) 16.'], ['RBAC expiry', 'Every management-group role assignment is PIM-eligible and time-bound, all expiring November 2026, in an estate where PIM was formally excluded from the phase (DD6/DD10). Renewal process is UNKNOWN - no corpus file owns it.'], ['Log retention', 'Operational Log Analytics workspace 90 days, security workspace 30 days. NFR 9.9 requires 180 days queryable. Standing non-compliance at RFFR PROTECTED.'], ['Operating model', 'DD69 ratifies portal-managed policy. The AI landing zone assumes everything-as-code with no portal changes. Unresolved collision.'], ['Inbound north-south', 'Required but NOT enabled at handover, pending an external Azure load balancer and route table. The first designed inbound flow (SmartRecruiters webhook via App Gateway WAF_v2 to the N-S NVA to APIM) is unreconciled with that provision.']],
  interactions: [{
    id: 'ENV-ESLZ-1',
    title: 'New Azure resources must land in the right spoke with allocated CIDR',
    trigger: /new (vnet|virtual network|subnet)|deploy(ed|ing)? (in|into|to) azure|function app|logic app|key vault|storage account|azure (vm|virtual machine)/i,
    note: 'Workloads land in the spoke matching their environment and security domain (controlled vs standard); CIDRs are allocated from the ESLZ plan, not invented; Sandbox cannot reach anything.',
    remedy: 'Name the target subscription and VNet from the ESLZ table, request the subnet CIDR from the platform team, and name every resource per the Azure ESLZ Naming Standard (ENV-NAMING).'
  }, {
    id: 'ENV-ESLZ-2',
    title: 'Public IPs are policy-denied outside connectivity',
    trigger: /public (ip|endpoint)|internet-?facing|inbound (traffic|access|connection)/i,
    guard: /azure|vnet|subscription|endpoint/i,
    window: 200,
    note: 'Azure Policy denies public IP creation everywhere except aus-sub-connectivity. Inbound paths go through the North-South Palo Alto set (external LB + UDR), not a workload-attached public IP.',
    remedy: 'Design ingress via the connectivity hub (Application Gateway / N-S firewall). If a workload genuinely needs its own public IP, raise the policy exemption as a decision-register row with the rejection reasons for the hub path.'
  }, {
    id: 'ENV-ESLZ-3',
    title: 'An AVD spoke is designed but not deployed',
    trigger: /\bavd\b|azure virtual desktop|session host|host pool/i,
    note: 'aus-sub-avd-controlled-001 / auea-vnet-avd-ctrl-001 (10.40.88.0/23) is allocated in the controlled domain and appears in the as-built placement table, but the deployed spoke set is hub, identity, management, prod-controlled and prod-standard only. The AVD spoke is PLANNED.',
    remedy: 'Target the allocated AVD spoke rather than requesting a new subscription, size subnets within the /23, and state its deployment as a dependency, not as existing infrastructure.'
  }, {
    id: 'ENV-ESLZ-4',
    title: 'Management-group role assignments expire November 2026',
    trigger: /role assignment|\brbac\b|management group scope|\bpim\b|privileged identity|eligible (role|assignment)/i,
    note: 'Every MG-level role assignment is PIM-eligible and time-bound, all expiring November 2026, in an estate where PIM was formally excluded from the phase (DD6/DD10). The renewal process is UNKNOWN - no corpus file owns it.',
    remedy: 'Acknowledge the expiry explicitly in the identity section, state whether this design depends on an MG-scope assignment, and name the owner who will renew it. A design that creates MG-scope assignments without this acknowledgement is incomplete.'
  }, {
    id: 'ENV-ESLZ-5',
    title: 'Most spokes are designed, not deployed',
    trigger: /spoke|workload subscription|landing zone subscription|target (vnet|subscription)/i,
    note: 'Deployed: hub, identity, management, prod-controlled, prod-standard (40 subnets). Planned only: dev, SIT, UAT, AVD, sandbox, acquisitions, and 5 of the 8 AI Foundry workload spokes.',
    remedy: 'State the deployment status of every spoke the design targets. If it is planned, it is a dependency with an owner and a date, not infrastructure - and the design must not describe it in the present tense.'
  }, {
    id: 'ENV-ESLZ-6',
    title: 'Deployed log retention is below the 180-day NFR',
    trigger: /log analytics|retention|\blaw\b|workspace|sentinel|180 days|audit log/i,
    guard: /azure|log|retention|workspace/i,
    window: 200,
    note: 'Operational workspace retains 90 days, security workspace 30. NFR 9.9 requires 180 days queryable. This is a standing non-compliance at RFFR PROTECTED with no named owner beyond "security team to adjust".',
    remedy: 'State which workspace the design logs to, its actual retention, and whether NFR 9.9 is met or breached. Do not claim 180-day compliance while targeting a 90- or 30-day workspace.'
  }, {
    id: 'ENV-ESLZ-7',
    title: 'DR posture is unreconciled',
    trigger: /disaster recovery|\bdr\b|regional pair|secondary region|australia ?southeast|failover|geo-?redundan|\bgrs\b/i,
    note: 'The deployed baseline actively builds Australia Southeast as regional pair (VNets, GRS+CRR vaults, domain controllers). A single-region multi-zone decision paper is believed ratified but has never been ingested. UNRECONCILED.',
    remedy: 'State which posture the design assumes as an explicit assumption with its risk, cite both sources, and name the owner who will resolve it. Do not silently prefer either.'
  }, {
    id: 'ENV-ESLZ-8',
    title: 'Two tags silently drive backup and patching',
    trigger: /\bvm\b|virtual machine|compute|workload deploy|tag(ging|s)?\b/i,
    guard: /azure|deploy|resource|workload/i,
    window: 200,
    note: '13 mandatory tags apply. backup (BasicVMBackup / StandardVMBackup / StandardSQLVMBackup / StandardSQLVM(OS)Backup) enrols the VM into policies BK01-BK08. update-stage (Lead / auto-patch01 / auto-patch02) selects the Azure Update Manager maintenance configuration. A VM missing either is unprotected and unpatched without erroring.',
    remedy: 'Put all 13 tag values in a table in the design, and argue backup and update-stage explicitly rather than leaving them to build time.'
  }, {
    id: 'ENV-ESLZ-9',
    title: 'CIDRs come from the archetype sizing rules, not from preference',
    trigger: /\/\d{2}\b|cidr|address (space|plan|range)|subnet mask|supernet/i,
    guard: /azure|vnet|spoke|subnet|10\.4|10\.5/i,
    window: 200,
    note: 'Supernets 10.40.0.0/16 (AUEA) and 10.50.0.0/16 (AUSE), symmetric mirror. Connectivity /23, Identity /24, Production /22 per security domain, Dev/SIT/UAT /23 each, Sandbox /24, Management x.255.0/24. Every VNet carries a reserved adjacent block for contiguous growth. Unallocated AUEA space: 10.40.96-247. Sandbox may deliberately overlap because it is never peered.',
    remedy: 'Request the CIDR against the archetype rule, name the reserved growth block adjacent to it, and record any deviation as a decision-register row with options assessed.'
  }, {
    id: 'ENV-ESLZ-10',
    title: 'Policy-as-code collides with the ratified operating model',
    trigger: /policy[- ]as[- ]code|infrastructure as code|\bbicep\b|terraform|gitops|no portal changes|deployment pipeline/i,
    note: 'DD69 ratifies portal-managed policy for the 218 assignments. The AI landing zone design assumes everything-as-code with no portal changes. Neither side has won; this is the single largest codification blocker.',
    remedy: 'State which operating model this design follows and flag the collision as an open item with the design authority as owner. Do not assume the newer document supersedes.'
  }, {
    id: 'ENV-ESLZ-11',
    title: 'Inbound north-south is provisioned but not enabled',
    trigger: /inbound|ingress|webhook|public endpoint|application gateway|app ?gw|\bwaf\b|internet-?facing/i,
    guard: /azure|hub|firewall|spoke|apim/i,
    window: 220,
    note: 'Inbound N-S inspection is required but was NOT enabled at handover, pending an external Azure load balancer and route table. The first designed inbound flow (Internet to App Gateway WAF_v2 to N-S NVA to APIM) is unreconciled with that provision.',
    remedy: 'State the inbound path explicitly, mark it as depending on inbound N-S being enabled, and reconcile it against the external-LB provision rather than assuming one of the two.'
  }]
}, {
  id: 'ENV-PALO',
  name: 'Palo Alto VM-Series hub firewalls',
  source: 'Palo Alto Firewall Deployment As-Built V1.0 (uploads/, Stratus Phase 3)',
  cat: 'Configuration',
  owner: 'Digital Operations (managed network delivery team)',
  appliesWhen: {
    min: 3,
    any: [/aus-sub-|azure subscription/i, /\bvnet\b|virtual network/i, /hub firewall|security policy rule|panorama|vm-series/i, /route table|user[- ]defined route|\budr\b/i, /network security group|\bnsg\b/i, /peering|hub-spoke/i, /auea-|ause-/i, /10\.[45]\d\.\d+\.\d+/]
  },
  facts: [['Placement', 'North-South and East-West VM-Series clusters in the connectivity hub of each region behind Azure Load Balancers (no PAN HA; LB health probes). AE: 2+2 firewalls; ASE: 1+1.'], ['Inspection', 'All north-south (internet, on-premises) and east-west (inter-VNet, same region) traffic is UDR-forced through the firewalls. Default interzone AND intrazone rules overridden to drop + log.'], ['Egress', 'Outbound HTTP rides IPSEC tunnels from the firewalls to Zscaler; non-HTTP is SNATed out the public interfaces. Outbound is allow-listed by URL category and application; proxy-avoidance and anonymizers blocked and logged.'], ['Backhaul', 'Meraki SD-WAN (vMX in the legacy AE landing zone) advertises BGP routes; inspected traffic forwards to the active vMX.'], ['Management', 'Panorama HA (AE active, ASE passive), template stacks + device groups; config changes only via Panorama. SAML (Entra ID) auth with a local break-glass account; admin access only from the high-privileged jump host.'], ['Logging', 'Firewalls to Panorama (2TB rolling disks), then syslog to Microsoft Sentinel via a syslog VM.'], ['Open items', 'Firewall DNS and NTP servers are TBC pending the Infrastructure Team decision. Advanced ACL migration deferred to APM.']],
  interactions: [{
    id: 'ENV-PALO-1',
    title: 'New egress needs Palo security-policy (and possibly NAT) rules',
    trigger: /egress|outbound (traffic|access|connection)|allow[- ]?list|fqdn|reach(es|ing)? the internet|calls? out to/i,
    guard: /azure|vnet|spoke|cloud|subscription/i,
    window: 250,
    note: 'Nothing leaves an Azure spoke without matching a firewall allow rule - outbound is category- and application-allow-listed, dropped by default.',
    remedy: 'List the destination FQDNs, ports and applications in the design (\u00a75.3 named egress) so the Panorama change can be raised verbatim; do not write "standard internet access".'
  }, {
    id: 'ENV-PALO-2',
    title: 'Zscaler tunnels already terminate on the hub firewalls',
    trigger: /zscaler.{0,80}(tunnel|ipsec)|ipsec.{0,80}zscaler|new (ipsec )?tunnel/i,
    note: 'The hub firewalls hold the IPSEC tunnels to Zscaler for Azure-sourced HTTP egress. Site networks tunnel to Zscaler separately via the managed network provider - two distinct tunnel sets.',
    remedy: 'State which tunnel set carries the design\u2019s traffic. A new site or VLAN rides the site tunnels; a new Azure workload rides the hub firewall tunnels - neither needs a new tunnel by default.'
  }, {
    id: 'ENV-PALO-3',
    title: 'DNS and NTP for hub infrastructure are still undecided',
    trigger: /dns (server|resolver|forward)|name resolution|\bntp\b|time (sync|source)/i,
    guard: /azure|hub|firewall|infrastructure/i,
    window: 250,
    note: 'The as-built records firewall DNS/NTP as TBC pending the Infrastructure Team. The resolver of record for spokes is the Azure DNS Private Resolver in connectivity.',
    remedy: 'State the resolver the design actually uses (Private Resolver inbound endpoint for Azure; site DHCP-issued DNS for devices) and flag any dependency on the undecided infrastructure DNS/NTP as an open item with the Infrastructure Team as owner.'
  }]
}, {
  id: 'ENV-NAMING',
  name: 'Azure ESLZ Naming Standard',
  source: 'Azure ESLZ Naming Standards - 17 July 2026 (uploads/)',
  cat: 'Configuration',
  owner: 'Digital Operations',
  appliesWhen: {
    min: 3,
    any: [/aus-sub-|azure subscription/i, /\bvnet\b|virtual network/i, /resource group/i, /management group/i, /storage account/i, /recovery services vault/i, /network security group|\bnsg\b/i, /auea-|ause-/i, /private endpoint/i]
  },
  facts: [['General form', '[region]-[type]-[environment]-[apm security domain]-[descriptor]-[instance], e.g. auea-rg-prod-ctrl-appname-001, ause-nsg-prod-std-web-001. Regions: auea / ause (short: ae / as).'], ['Compact forms', 'VMs and storage use shortform concatenation: aevmpadds001, aestpcappname001, aestxflowlog001. Palo resources always carry "palo" in the RG name.'], ['Management groups', 'ALL CAPS: AUS-MG-[SCOPE]. Subscriptions all lower with full security-domain word: aus-sub-prod-controlled-01.'], ['NSG rules', '[allow|deny]-[ib|ob]-[source]-to-[destination]-[descriptor]-[nn], e.g. allow-ob-azmonitor-to-law-https-01.'], ['Device/Intune objects', 'Separate schema - the APM Intune Naming Schema V1.0 governs Intune policies, groups and device names (already applied in our designs).']],
  interactions: [{
    id: 'ENV-NAMING-1',
    title: 'Azure resource names must follow the ESLZ standard',
    trigger: /resource group|\bvnet\b|virtual network|\bnsg\b|route table|log analytics|recovery services|private endpoint|storage account/i,
    guard: /azure|deploy|creat/i,
    window: 250,
    note: 'Every Azure object in a design is named per the ESLZ standard, including NSG rule names - reviewers reject invented formats.',
    remedy: 'Write the exact names into the design settings tables using the [region]-[type]-[env]-[domain]-[descriptor]-[instance] form; check the compact VM/storage forms for those two types.'
  }]
}, {
  id: 'ENV-TENANT',
  name: 'APM corporate tenant - estate Intune and Entra behaviour',
  source: 'Working knowledge from the Participant Kiosk gap analysis (G-18/19/20) and the SOE Hardening Standard',
  cat: 'Configuration',
  owner: 'APM Digital',
  facts: [['Broad assignments', 'Corporate policies, apps and scripts assigned to All Devices / All Users / broad dynamic groups land on every Entra-joined device unless the device group is excluded.'], ['Password expiry', 'The estate baseline sets a maximum password age on local accounts - it breaks device-local autologon accounts unless the account is exempted and the device group excluded from the policy.'], ['Delivery Optimization', 'Estate DO policy has no group boundary on Entra-joined devices; without a boundary set every device pulls its own update payload over the site WAN link.'], ['Update management', 'Estate Windows Update rings and Patch My PC exist; new device populations join existing rings rather than creating parallel ones.'], ['App Control', 'Estate WDAC/App Control policies exist with script enforcement DISABLED; fleet variants may enable it (the kiosk does).'], ['Conditional Access', 'Tenant CA policy set exists; new device populations need an exclusion sweep and, where blocking is the intent, a device-filter policy.']],
  interactions: [{
    id: 'ENV-TENANT-1',
    title: 'Local accounts hit the estate password-expiry baseline',
    trigger: /local (standard )?(user )?account|auto[- ]?log(on|in)|session account/i,
    note: 'The inherited baseline\u2019s maximum password age applies to local accounts and will break automatic logon fleet-wide on one day.',
    remedy: 'Exempt the account explicitly (PasswordExpires = False), exclude the device group from the estate expiry policy, and add a test that advances the clock past the maximum age.'
  }, {
    id: 'ENV-TENANT-2',
    title: 'New device population needs the corporate-assignment exclusion sweep',
    trigger: /new (dynamic )?(device )?group|dynamic membership|device population|fleet|enrolment profile|autopilot/i,
    note: 'Everything targeting All Devices / All Users lands on the new fleet unless excluded - the single largest configuration risk for special-purpose devices.',
    remedy: 'Enumerate every corporate assignment (policies, apps, scripts, CA) and record per item: applies, excluded, or replaced by a fleet variant. Put the table in the design, not a wiki.'
  }, {
    id: 'ENV-TENANT-3',
    title: 'Delivery Optimization needs a group boundary for any multi-device site',
    trigger: /delivery optimization|update (payload|download|bandwidth)|20 ?mbps|site (wan|link|bandwidth)/i,
    note: 'Without DOGroupId + group download mode, every device at a site pulls its own copy of each update over the constrained site link.',
    remedy: 'Join or extend the DO boundary policy (group mode 2, DOGroupId per site) and state the expected per-site download reduction.'
  }, {
    id: 'ENV-TENANT-4',
    title: 'Blocking access needs a CA device filter, not membership absence',
    trigger: /must not (access|reach|sign in)|block(ed|ing)? (from )?(microsoft 365|m365|office|corporate)|no (corporate|m365) access/i,
    note: 'A device simply not being licensed or grouped does not block anything; the tenant evaluates CA on the device claim.',
    remedy: 'Write an explicit CA block policy with a device filter on the fleet\u2019s naming prefix or group, plus the browser and network layers for unmanaged-device gaps.'
  }]
}, {
  id: 'ENV-CA',
  name: 'Conditional Access policy set - APM corporate tenant',
  source: 'Tenant export 7 Aug 2026 (policies/APM-Conditional-Access-Policies-Export.csv); analysis in policies/APM_CA_Policy_Analysis.html',
  cat: 'Configuration',
  owner: 'APM Cyber Security',
  appliesWhen: {
    min: 1,
    any: [/conditional access|\bca policy\b|\bca-\d{3}\b|sign-?in|authenticat|\bmfa\b|multi-?factor|device filter|block access/i]
  },
  facts: [['Size and enforcement', '116 policies: 68 enforced, 43 report-only, 5 disabled. 37 per cent of the estate grants and denies nothing.'], ['Enforced tenant-wide (all users, all apps)', 'Deny Legacy Auth (block) - CA-100 legacy protocols (block) - CA-102 locations except AU and corporate (block) - CA-104 high sign-in risk (block) - CA-105 bad IPs (block) - CA-201 BYOD browser no persistence (session) - CA-203 high user risk (MFA + password change) - AllUsers_AllAccess_DeviceRequired (compliant OR Entra-joined) - AllUsers_AllAccess_MFAorDeviceRequired (MFA OR Entra-joined).'], ['Report-only, so NOT a control', 'CA-101 tenant-wide MFA - CA-106 and CA-401 phishing-resistant MFA - AdminRoles_Everything_RequireMFA - AdminRoles_Everything_RequireDevice - CA-103 unsupported platforms - CA-400 and CA-402 administrator device and location - Guests_Everything_MFARequired - AllUsers_UnapprovedCountries_Block - AllUsers_AllAccess_BlockLegacy.'], ['A managed device satisfies both enforced grants', 'AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired are both satisfied by an Entra-joined, Intune-compliant device - the second one with no MFA prompt. Any special-purpose fleet that is managed and compliant looks like a corporate device to every existing grant.'], ['Risk-based CA is live', 'CA-104, CA-203, AdminRoles_Risky_Sign-ins_MFA and AdminRoles_RiskyUsers_MFA_Password_Reset are enforced, so Entra ID P2 risk signals are licensed and in use. All of them evaluate a user principal.'], ['Naming convention', 'CA-nnn - audience - apps - condition - action, by series: CA-1xx all users and guests, CA-2xx organisation users, CA-3xx contract and community populations, CA-4xx administrators, CA-5xx guests. CA-100 to CA-106 are in use. Legacy families also present: Scope_App_Control (AllUsers_*, AdminAccounts_*, AdminRoles_*), POC_EarlyAccess_*, GuestAccess_*.'], ['Retired kiosk policies', 'Fourteen in two families: CA-APM-Kiosk-* (seven, all report-only, group 761b688c) and CA-APM-KioskPB-* (seven, six enforced, group e0378201). Both assign to groups of user identities.'], ['Hygiene', 'CA-501 ends in the literal word COPY and is enabled. zzADA_Block_Policy_Test_20250626 is still present. APM Pilot Block Policy and APM Pilot Policy are both enabled and both block all apps. Four duplicated numbers (CA-204, CA-205, CA-207, CA-208). Eight _Reporting twins. Four names with leading or trailing whitespace. Eighteen with a corrupted separator character. Three policies block legacy authentication. Two enabled policies grant MFA under a name that says Block (LimitedUsers_EmailOnly_Block, CA-504).'], ['Export limitation', 'The CSV carries name, state, users, groups, applications and grant rules only. No exclusions, conditions, device filters, locations, platforms, client apps, session controls, authentication strengths or directory-role targets. A blank grant rule means session control or authentication strength, not no control. Request identity/conditionalAccess/policies from Graph for the full object.']],
  interactions: [{
    id: 'ENV-CA-1',
    title: 'A managed fleet satisfies the tenant grants, so blocking must be explicit',
    trigger: /must not (access|reach|sign in)|block(ed|ing)? (from )?(microsoft 365|m365|office|corporate)|no (corporate|m365) access|device filter/i,
    note: 'AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired are enforced for all users against all apps, and an Entra-joined compliant device satisfies both - the second without an MFA prompt. Absence of a licence or a group grants nothing.',
    remedy: 'Write an explicit block policy with a device filter, cite both tenant policies by name as the reason it is required, and back it with browser and network layers for devices the tenant does not recognise.'
  }, {
    id: 'ENV-CA-2',
    title: 'Phishing-resistant and tenant-wide MFA are report-only, so they cannot be cited as controls',
    trigger: /phishing[- ]resistant|multi-?factor|\bmfa\b|authentication strength/i,
    note: 'CA-401 (administrators) and CA-106 (all users and guests) are report-only, as is CA-101. The only enforced MFA grant tenant-wide is MFA OR Entra-joined device, which a managed device satisfies without prompting.',
    remedy: 'Do not cite tenant MFA or phishing-resistant MFA as an inherited or compensating control. If the design needs it, raise enforcement with APM Cyber Security first and record it as an assumption with an owner until confirmed.'
  }, {
    id: 'ENV-CA-3',
    title: 'New Conditional Access objects follow the CA-nnn convention, not the Intune schema',
    trigger: /conditional access (polic|profile)|\bca polic/i,
    note: 'The tenant convention is CA-nnn - audience - apps - condition - action, with number series by audience. The Intune Naming Schema governs Intune objects only. Four numbers are already duplicated, so a proposed number must be checked against the export.',
    remedy: 'Name the policy CA-nnn in the correct series, confirm the number is unused, and state both the name and the number in the design settings table.'
  }, {
    id: 'ENV-CA-4',
    title: 'Country-level location blocking already exists tenant-wide',
    trigger: /geo[- ]?block|country|location[- ]based|non-?au|outside australia|named location/i,
    note: 'CA-102 blocks locations other than Australia and corporate for all users and all apps, and is enforced. CA-105 blocks known-bad IPs. CA-500 and CA-501 cover guests.',
    remedy: 'Cite CA-102 rather than creating a fleet-specific location policy. The tenant already carries one duplicate of this control in report-only state.'
  }, {
    id: 'ENV-CA-5',
    title: 'A group-assigned CA policy silently dies when its group is retired',
    trigger: /retire|decommission|delete the group|remove the (user )?group|group is retired/i,
    guard: /conditional access|\bca\b|polic/i,
    window: 260,
    note: 'Conditional Access assigns to users and groups of users. Fourteen retired kiosk policies assign to two user groups, and six of them are enforced. When the group goes, they match nothing and raise no error.',
    remedy: 'Delete the policies in the same change record as the group, export their sign-in and report-only data as evidence first, and separately remove any exclusion that named the group so no exclusion outlives it.'
  }, {
    id: 'ENV-CA-6',
    title: 'The Conditional Access half of an exclusion register cannot be verified from the standard export',
    trigger: /exclusion register|excluded from|exclude the (device )?group|assignment exclusion/i,
    guard: /conditional access|\bca\b|polic|tenant/i,
    window: 260,
    note: 'The available export has no exclusions column. Nine policies target all users against all apps and cannot be checked.',
    remedy: 'Mark the Conditional Access rows of the exclusion register as unverified, and request identity/conditionalAccess/policies from Graph to close it.'
  }]
}, {
  id: 'ENV-DOCSET',
  name: 'APM solution document set - DDD and TCD templates',
  source: '02 Detail Design Document - Template V0.1 (24 Jun 2026) and 03 Technical Configuration Document V0.1 (21 Jul 2026) (uploads/)',
  cat: 'Configuration',
  owner: 'Head of Digital Transformation and Architecture; Head of Digital Operations; Head of Product Development',
  facts: [['DDD template', 'APM\u2019s own template orders: Introduction, Overview, Business Architecture, Application Architecture, Technology Architecture, Information & Data, Cyber & Security, Service Availability & DR, Service Management - the same spine as our detailed-design standard. Cover carries Project Name, Document Owner, Contact, Program, Division/Unit, Status, Version, Product ID, plus Consultation, References and Derivation, and an SDA Approval sheet.'], ['TCD companion', 'The Technical Configuration Document is the build-level companion: IP addressing, DNS records, load balancing, NAT and firewall rules, compute specs, RBAC groups, accounts, CA rules, AV exclusions, DNS/NTP/logging/monitoring/patching/PKI/SMTP, RPO/RTO, backup/restore, capacity. "Once approved this document serves as de-facto as-built information."'], ['Approval', 'Both templates carry an SDA (Solution Design Authority) approval block - designs are expected to pass through SDA.']],
  interactions: [{
    id: 'ENV-DOCSET-1',
    title: 'APM expects a TCD companion to every detailed design',
    trigger: /detailed design|solution design|design document/i,
    note: 'The DDD argues the design; the TCD carries the build-level configuration as de-facto as-built. Our \u00a75.3-style settings tables satisfy much of it, but APM review may ask for the TCD artefact itself.',
    remedy: 'Plan a TCD per use case as build detail lands (IPs, rules, accounts, certificates verbatim), and add the SDA approval step to the document\u2019s approval path.'
  }]
}];
if (typeof module !== 'undefined') module.exports = {
  ENVIRONMENT_CONFIG: window.ENVIRONMENT_CONFIG
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/standard-user-avd/policies/environment-config.js", error: String((e && e.message) || e) }); }

// exports/standard-user-avd/templates/detailed-design-v2/authoring/consistency-check.js
try { (() => {
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

const NUMWORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12
};
const COUNT_NOUNS = /(items?|policies|policy|controls?|exclusions?|gates?|layers?|phases?|rings?|scenarios?|tiers?|steps?)/i;
function parse(dsl) {
  const lines = dsl.split('\n');
  const headings = []; // {num, text, line}
  const figs = []; // {file, caption, line}
  const tables = []; // {line, rows, headerRow}
  const blocks = []; // {kind, text, line, section}
  let cur = null,
    curHeading = null;
  lines.forEach((raw, i) => {
    const m = raw.match(/^(H[1-5]|P|B|NUM|TBL|TH|TR|END|FIG)\s*\|(.*)$/);
    if (!m) return;
    const [, tag, body] = m;
    const text = body.replace(/==/g, '').replace(/\*\*/g, '');
    if (/^H[1-5]$/.test(tag)) {
      const hm = text.match(/^([\d.]+)\s+(.*)$/);
      curHeading = hm ? hm[1].replace(/\.$/, '') : null;
      if (hm) headings.push({
        num: curHeading,
        text: hm[2],
        line: i + 1
      });
      // heading text is pushed WITHOUT its number, so "7.3.4 Controls..." cannot be read as a count
      blocks.push({
        kind: 'H',
        text: hm ? hm[2] : text,
        line: i + 1,
        section: curHeading
      });
      cur = null;
      return;
    }
    if (tag === 'TBL') {
      cur = {
        line: i + 1,
        rows: 0,
        header: '',
        section: curHeading
      };
      tables.push(cur);
      return;
    }
    if (tag === 'TH') {
      if (cur) cur.header = text;
      blocks.push({
        kind: 'TH',
        text,
        line: i + 1,
        section: curHeading
      });
      return;
    }
    // table rows carry most of a design's content - they must be scanned, not just counted
    if (tag === 'TR') {
      if (cur) cur.rows++;
      blocks.push({
        kind: 'TR',
        text,
        line: i + 1,
        section: curHeading
      });
      return;
    }
    if (tag === 'END') {
      cur = null;
      return;
    }
    if (tag === 'FIG') {
      const p = body.split('|');
      figs.push({
        file: p[0],
        caption: (p[1] || '').replace(/==/g, ''),
        line: i + 1,
        section: curHeading
      });
      blocks.push({
        kind: 'FIG',
        text: p[1] || '',
        line: i + 1,
        section: curHeading
      });
      return;
    }
    blocks.push({
      kind: tag,
      text,
      line: i + 1,
      section: curHeading
    });
  });
  return {
    lines,
    headings,
    figs,
    tables,
    blocks
  };
}

// Section references, written the handful of ways this house style writes them.
function xrefs(text) {
  const out = [];
  const re = /(?:\bsee\s+|\bin\s+|\bper\s+|\bto\s+|\bsection\s+|\()(\d{1,2}(?:\.\d{1,2}){1,3})(?=[)\s,.;:]|$)/gi;
  let m;
  while (m = re.exec(text)) {
    const n = m[1];
    const before = text.slice(Math.max(0, m.index - 3), m.index);
    if (/[VvP]-?$/.test(before)) continue; // P-1.0, V1.6
    if (/\d\/$/.test(before)) continue; // CIDR
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
function scan({
  dsl,
  figuresHtml,
  figFiles,
  staleTerms = [],
  ignoreOrphans = []
}) {
  const {
    lines,
    headings,
    figs,
    tables,
    blocks
  } = parse(dsl);
  const findings = [];
  const add = (code, line, msg) => findings.push({
    code,
    line,
    msg
  });
  const headingNums = new Set(headings.map(h => h.num));
  // a reference to "7.3" is satisfied by 7.3 or by any 7.3.x existing
  const resolves = n => headingNums.has(n) || [...headingNums].some(h => h.startsWith(n + '.'));

  // TREE: a whole section going missing is the defect an edit is most likely to cause,
  // because the deletion leaves no trace in the text - only a gap in the numbering.
  const tops = [...new Set(headings.map(h => +h.num.split('.')[0]))].sort((a, b) => a - b);
  for (let n = 1; n <= (tops[tops.length - 1] || 0); n++) {
    if (!tops.includes(n)) add('TREE', 0, `no section ${n} heading exists, but section ${n + 1} or later does - a top-level heading has been lost`);else if (!headingNums.has(String(n))) add('TREE', 0, `section ${n} has subsections but no H1 of its own (numbering will jump in the Contents)`);
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
    if (!m) add('FIGSEQ', f.line, `caption does not start "Figure n.": "${f.caption.slice(0, 60)}"`);else if (+m[1] !== i + 1) add('FIGSEQ', f.line, `caption says Figure ${m[1]} but it is figure ${i + 1} in document order`);
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
  const seen = new Map(); // name -> [{line, section, text}]
  for (const b of blocks) {
    for (const m of b.text.match(NAMED) || []) {
      const name = m.replace(/[.,;:]$/, '');
      if (NOT_A_NAME.test(name)) continue;
      if (!seen.has(name)) seen.set(name, []);
      seen.get(name).push({
        line: b.line,
        section: b.section,
        text: b.text
      });
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
      const reconciled = hits.some(h => classOf(h.section) === 'inherited' && xrefs(h.text).some(n => excludedSections.includes(n)));
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
    const figText = [...figuresHtml.matchAll(/<(?:p class="dgm-note"|div class="dgm-cap")[^>]*>([\s\S]*?)<\/(?:p|div)>/g)].map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/&sect;/g, '').replace(/&middot;/g, ' ').replace(/&amp;/g, '&'));
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
    lines.forEach((l, i) => {
      if (re.test(l)) add('STALE', i + 1, `retired term "${term}" still present: "${l.slice(0, 90)}"`);
    });
  }
  const byCode = {};
  for (const f of findings) (byCode[f.code] = byCode[f.code] || []).push(f);
  const order = ['XREF', 'TREE', 'FIGSEQ', 'FIGREF', 'FIGFILE', 'DUAL', 'COUNT', 'FIGTXT', 'STALE', 'ORPHAN'];
  const report = order.filter(c => byCode[c]).map(c => `${c} (${byCode[c].length})\n` + byCode[c].map(f => `  line ${f.line}: ${f.msg}`).join('\n')).join('\n\n');
  return {
    ok: findings.filter(f => f.code !== 'ORPHAN').length === 0,
    counts: {
      headings: headings.length,
      figures: figs.length,
      tables: tables.length
    },
    byCode,
    findings,
    report: report || 'no findings'
  };
}

// Exported as a default object, not named exports, so this bundle's copy cannot collide with an
// identical copy in another bundle. Destructure from `.default` - see the recipe in CLAUDE.md.
let __ds_default_exports_standard_user_avd_templates_detailed_design_v2_authoring_consistency_check_1ovn9b3;
try {
  __ds_default_exports_standard_user_avd_templates_detailed_design_v2_authoring_consistency_check_1ovn9b3 = {
    scan,
    parse
  };
} catch {}
Object.assign(__ds_scope, { __ds_default_exports_standard_user_avd_templates_detailed_design_v2_authoring_consistency_check_1ovn9b3 });
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/standard-user-avd/templates/detailed-design-v2/authoring/consistency-check.js", error: String((e && e.message) || e) }); }

// exports/standard-user-avd/templates/detailed-design-v2/authoring/docx-builder.js
try { (() => {
// Shared docx builder for APM master template. Usage: import via dynamic import in run_script.
// Exported as a default object, not a named export, so this bundle's copy cannot collide with an
// identical copy in another bundle. Destructure from `.default` - see the recipe in CLAUDE.md.
async function buildDocx(env, masterPath, contentPath, figDir, outPath, cover) {
  const {
    readFileBinary,
    readFile,
    saveFile,
    log
  } = env;
  const blob = await readFileBinary(masterPath);
  const buf = new Uint8Array(await blob.arrayBuffer());
  const dv = new DataView(buf.buffer);
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  const count = dv.getUint16(eocd + 10, true);
  let off = dv.getUint32(eocd + 16, true);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const nl = dv.getUint16(off + 28, true),
      el = dv.getUint16(off + 30, true),
      cl = dv.getUint16(off + 32, true);
    const name = new TextDecoder().decode(buf.slice(off + 46, off + 46 + nl));
    entries.push({
      name,
      method: dv.getUint16(off + 10, true),
      compSize: dv.getUint32(off + 20, true),
      lho: dv.getUint32(off + 42, true)
    });
    off += 46 + nl + el + cl;
  }
  async function ex(e) {
    const nl = dv.getUint16(e.lho + 26, true),
      el = dv.getUint16(e.lho + 28, true);
    const s = e.lho + 30 + nl + el;
    const d = buf.slice(s, s + e.compSize);
    if (e.method === 0) return d;
    return new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  }
  const files = {};
  for (const e of entries) {
    if (!e.name.startsWith('[trash]')) files[e.name] = await ex(e);
  }
  const td = new TextDecoder(),
    te = new TextEncoder();
  let xml = td.decode(files['word/document.xml']);
  const rootTag = xml.slice(xml.indexOf('<w:document'), xml.indexOf('>', xml.indexOf('<w:document')) + 1);
  let rf = rootTag;
  for (const [k, v] of [['xmlns:wp=', ' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"'], ['xmlns:r=', ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"']]) if (!rootTag.includes(k)) rf = rf.replace('<w:document', '<w:document' + v);
  if (rf !== rootTag) xml = xml.replace(rootTag, rf);
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Sets the value cell immediately after the label cell, replacing whatever the
  // master pre-filled there (some cover fields ship with placeholder text).
  function fillField(label, val) {
    const li = xml.indexOf('<w:t>' + label + '</w:t>');
    if (li < 0) return;
    const tcEnd = xml.indexOf('</w:tc>', li);
    if (tcEnd < 0) return;
    const nTc = xml.indexOf('<w:tc>', tcEnd);
    if (nTc < 0) return;
    const nTcEnd = xml.indexOf('</w:tc>', nTc);
    if (nTcEnd < 0) return;
    let cell = xml.slice(nTc, nTcEnd).replace(/<w:r [^>]*>[\s\S]*?<\/w:r>|<w:r>[\s\S]*?<\/w:r>/g, '');
    const pe = cell.indexOf('</w:p>');
    if (pe < 0) return;
    cell = cell.slice(0, pe) + '<w:r><w:rPr><w:b /></w:rPr><w:t xml:space="preserve">' + esc(val) + '</w:t></w:r>' + cell.slice(pe);
    xml = xml.slice(0, nTc) + cell + xml.slice(nTcEnd);
  }
  for (const [k, v] of Object.entries(cover.fields)) fillField(k, v);
  (function () {
    // versionRows: [[version, date, author, changes], …] rebuilds the whole table body
    // from the master's own data-row markup. history: flat cells filling the first row.
    if (cover.versionRows && cover.versionRows.length) {
      const h = xml.indexOf('Version History');
      if (h < 0) return;
      const tb = xml.indexOf('<w:tbl>', h),
        te = xml.indexOf('</w:tbl>', h);
      if (tb < 0 || te < 0) return;
      const tbl = xml.slice(tb, te + 8);
      const trRe = /<w:tr [^>]*>[\s\S]*?<\/w:tr>/g;
      const trs = tbl.match(trRe) || [];
      if (trs.length < 2) return;
      const tmpl = trs[1];
      const rowFor = vals => {
        const cells = tmpl.match(/<w:tc>[\s\S]*?<\/w:tc>/g) || [];
        const head = tmpl.slice(0, tmpl.indexOf(cells[0]));
        return head + cells.map((cell, ci) => {
          const val = String(vals[ci] == null ? '' : vals[ci]);
          let c = cell.replace(/<w:r [^>]*>[\s\S]*?<\/w:r>|<w:r>[\s\S]*?<\/w:r>/g, '');
          const pe = c.lastIndexOf('</w:p>');
          if (pe < 0) return c;
          const rpr = '<w:rFonts w:eastAsia="MS PGothic" />' + (ci === 0 ? '<w:b />' : '') + '<w:color w:val="000000" /><w:szCs w:val="20" />';
          return c.slice(0, pe) + runs(val, rpr) + c.slice(pe);
        }).join('') + '</w:tr>';
      };
      const rebuilt = tbl.slice(0, tbl.indexOf(trs[1])) + cover.versionRows.map(rowFor).join('') + '</w:tbl>';
      xml = xml.slice(0, tb) + rebuilt + xml.slice(te + 8);
      return;
    }
    if (!cover.history) return;
    let i = xml.indexOf('Version History');
    if (i < 0) return;
    i = xml.indexOf('>V0.1<', i);
    if (i < 0) return;
    let pos = i;
    for (const v of cover.history) {
      while (true) {
        const ps = xml.indexOf('<w:p ', pos);
        if (ps < 0) return;
        const pe = xml.indexOf('</w:p>', ps);
        if (pe < 0) return;
        if (xml.slice(ps, pe).indexOf('<w:t') === -1) {
          xml = xml.slice(0, pe) + '<w:r><w:t xml:space="preserve">' + esc(v) + '</w:t></w:r>' + xml.slice(pe);
          pos = pe + 60;
          break;
        }
        pos = pe + 6;
      }
    }
  })();
  const content = await readFile(contentPath);

  // ---- cross-reference index -------------------------------------------------
  // Pre-pass over the headings so [[5.3.4]] in body text can render as a live
  // hyperlink reading "5.3.4 Routing". The section NAME is never hand-typed in a
  // cross-reference: it is read from the heading, so renaming a heading updates
  // every reference to it. Keys accepted: 5, 5.3, 5.3.4, B.6, "Appendix A".
  function secKey(text) {
    const t = String(text).replace(/\*\*/g, '').trim();
    let m = /^(\d+(?:\.\d+)*)[.\s]/.exec(t);
    if (m) return m[1];
    m = /^(Appendix\s+[A-Z])\b/i.exec(t);
    if (m) return m[1].replace(/\s+/g, ' ');
    m = /^([A-Z]\.\d+(?:\.\d+)*)[.\s]/.exec(t);
    if (m) return m[1];
    return null;
  }
  const secMap = Object.create(null),
    dupSections = [],
    badXrefs = [];
  for (const raw of content.split('\n')) {
    const hm = /^(H1|H2|H3|H4|H5)\s?\|(.*)$/.exec(raw.replace(/\r$/, ''));
    if (!hm) continue;
    const title = hm[2].replace(/\*\*/g, '').trim();
    const key = secKey(title);
    if (!key) continue;
    if (secMap[key]) {
      dupSections.push(key);
      continue;
    }
    secMap[key] = {
      title,
      bm: 'Sec_' + key.replace(/[^A-Za-z0-9]+/g, '_')
    };
  }
  let bmId = 20000;
  function xref(key, extraRpr) {
    const k = String(key).trim(),
      s = secMap[k];
    if (!s) badXrefs.push(k);
    const rpr = '<w:color w:val="1F2D58" /><w:u w:val="single" />' + (extraRpr || '');
    const run = '<w:r><w:rPr>' + rpr + '</w:rPr><w:t xml:space="preserve">' + esc(s ? s.title : k) + '</w:t></w:r>';
    return s ? '<w:hyperlink w:anchor="' + s.bm + '">' + run + '</w:hyperlink>' : run;
  }

  // **bold**, ==yellow highlight== (markers are always balanced within a chunk),
  // [[5.3.4]] cross-reference
  function runs(text, extraRpr) {
    let out = '';
    for (const seg of String(text).split(/(\[\[[^\]]+\]\])/)) {
      if (!seg) continue;
      const xm = /^\[\[([^\]]+)\]\]$/.exec(seg);
      if (xm) {
        out += xref(xm[1], extraRpr);
        continue;
      }
      const hlParts = seg.split('==');
      for (let h = 0; h < hlParts.length; h++) {
        const hl = h % 2 === 1;
        const parts = hlParts[h].split('**');
        for (let k = 0; k < parts.length; k++) {
          if (!parts[k]) continue;
          const bold = k % 2 === 1;
          const rpr = (bold ? '<w:b />' : '') + (hl ? '<w:highlight w:val="yellow" />' : '') + (extraRpr || '');
          out += '<w:r>' + (rpr ? '<w:rPr>' + rpr + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + esc(parts[k].replace(/&amp;/g, '&')) + '</w:t></w:r>';
        }
      }
    }
    return out;
  }
  // Heading paragraph, bookmarked so cross-references can target it.
  function headingP(style, rest, extraPpr) {
    const key = secKey(rest);
    const s = key ? secMap[key] : null;
    let a = '',
      b = '';
    if (s && !s.placed) {
      s.placed = true;
      const id = bmId++;
      a = '<w:bookmarkStart w:id="' + id + '" w:name="' + s.bm + '" />';
      b = '<w:bookmarkEnd w:id="' + id + '" />';
    }
    return '<w:p><w:pPr><w:pStyle w:val="' + style + '" />' + (extraPpr || '') + '</w:pPr>' + a + runs(rest) + b + '</w:p>';
  }
  const NAVY = '1F2D58',
    BORD = 'BFC5D4';
  function cellP(text, hdr) {
    const rpr = '<w:sz w:val="17" /><w:szCs w:val="17" />' + (hdr ? '<w:b /><w:color w:val="FFFFFF" />' : '');
    const segs = String(text).split('<br>');
    return segs.map((s, i) => '<w:p><w:pPr><w:spacing w:before="' + (i ? '20' : '40') + '" w:after="' + (i < segs.length - 1 ? '20' : '40') + '" w:line="240" w:lineRule="auto" /><w:rPr><w:sz w:val="17" /></w:rPr></w:pPr>' + runs(s, rpr) + '</w:p>').join('');
  }
  function tc(text, w, hdr, shade, span) {
    return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa" />' + (span > 1 ? '<w:gridSpan w:val="' + span + '" />' : '') + '<w:tcBorders><w:top w:val="single" w:sz="4" w:color="' + BORD + '" /><w:left w:val="single" w:sz="4" w:color="' + BORD + '" /><w:bottom w:val="single" w:sz="4" w:color="' + BORD + '" /><w:right w:val="single" w:sz="4" w:color="' + BORD + '" /></w:tcBorders>' + (hdr ? '<w:shd w:val="clear" w:color="auto" w:fill="' + NAVY + '" />' : shade ? '<w:shd w:val="clear" w:color="auto" w:fill="F5F7FB" />' : '') + '<w:tcMar><w:top w:w="60" w:type="dxa" /><w:left w:w="100" w:type="dxa" /><w:bottom w:w="60" w:type="dxa" /><w:right w:w="100" w:type="dxa" /></w:tcMar><w:vAlign w:val="center" /></w:tcPr>' + cellP(text, hdr) + '</w:tc>';
  }
  let seq = 0;
  const images = [];
  function figXml(file, caption, w, h) {
    seq++;
    const relId = cover.relPrefix + seq;
    images.push({
      file,
      relId,
      name: cover.imgPrefix + seq + '.png'
    });
    const cx = 5750000,
      cy = Math.round(cx * h / w);
    const id = cover.idBase + seq;
    return '<w:p><w:pPr><w:keepNext /><w:jc w:val="center" /><w:spacing w:before="180" w:after="60" /></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '" /><wp:effectExtent l="0" t="0" r="0" b="0" /><wp:docPr id="' + id + '" name="Figure' + seq + '" /><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1" /></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="' + id + '" name="Figure' + seq + '" /><pic:cNvPicPr /></pic:nvPicPr><pic:blipFill><a:blip r:embed="' + relId + '" /><a:stretch><a:fillRect /></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0" /><a:ext cx="' + cx + '" cy="' + cy + '" /></a:xfrm><a:prstGeom prst="rect"><a:avLst /></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>' + '<w:p><w:pPr><w:pStyle w:val="Caption" /><w:jc w:val="center" /><w:spacing w:after="220" /></w:pPr>' + runs(caption) + '</w:p>';
  }
  let body = '';
  let tbl = null;
  let numCount = 0;
  function flushTbl() {
    if (!tbl) return;
    let t = '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid" /><w:tblW w:w="9360" w:type="dxa" /><w:tblLayout w:type="fixed" /><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1" /></w:tblPr><w:tblGrid>';
    for (const w of tbl.widths) t += '<w:gridCol w:w="' + w + '" />';
    t += '</w:tblGrid>';
    tbl.rows.forEach((r, ri) => {
      t += '<w:tr>' + (r.hdr ? '<w:trPr><w:tblHeader /></w:trPr>' : '');
      let ci = 0;
      r.cells.forEach(raw => {
        let c = raw,
          span = 1;
        const sm = /^@(\d+)@/.exec(c);
        if (sm) {
          span = +sm[1];
          c = c.slice(sm[0].length);
        }
        let w = 0;
        for (let s = 0; s < span; s++) w += tbl.widths[ci + s] || 2000;
        t += tc(c, w || 2000, r.hdr, !r.hdr && ri % 2 === 0, span);
        ci += span;
      });
      t += '</w:tr>';
    });
    t += '</w:tbl><w:p><w:pPr><w:spacing w:after="160" /><w:rPr><w:sz w:val="8" /></w:rPr></w:pPr></w:p>';
    body += t;
    tbl = null;
  }
  for (const raw of content.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (!line.trim()) continue;
    const m = line.match(/^(H1|H2|H3|H4|H5|GD|BQ|NUM|B|P|FIG|TBL|TH|TR|END)\s?\|?(.*)$/);
    if (!m) continue;
    const tag = m[1],
      rest = m[2];
    if (tag === 'TBL') {
      flushTbl();
      tbl = {
        widths: rest.split(',').map(Number),
        rows: []
      };
      continue;
    }
    if (tag === 'TH') {
      if (tbl) tbl.rows.push({
        cells: rest.split('||'),
        hdr: true
      });
      continue;
    }
    if (tag === 'TR') {
      if (tbl) tbl.rows.push({
        cells: rest.split('||'),
        hdr: false
      });
      continue;
    }
    if (tag === 'END') {
      flushTbl();
      continue;
    }
    if (tag !== 'NUM') numCount = 0;
    flushTbl();
    if (tag === 'H1') body += headingP('Heading1', rest, '<w:pageBreakBefore />');else if (tag === 'H2') body += headingP('Heading2', rest);else if (tag === 'H3') body += headingP('Heading3', rest);else if (tag === 'H4') body += headingP('Heading4', rest, '<w:keepNext />');else if (tag === 'H5') body += headingP('Heading5', rest, '<w:keepNext />');else if (tag === 'P') body += '<w:p><w:pPr><w:spacing w:after="140" w:line="276" w:lineRule="auto" /></w:pPr>' + runs(rest) + '</w:p>';else if (tag === 'B') body += '<w:p><w:pPr><w:ind w:left="510" w:hanging="227" /><w:spacing w:after="70" w:line="276" w:lineRule="auto" /></w:pPr><w:r><w:t xml:space="preserve">\u2022  </w:t></w:r>' + runs(rest) + '</w:p>';else if (tag === 'NUM') {
      numCount++;
      body += '<w:p><w:pPr><w:ind w:left="567" w:hanging="284" /><w:spacing w:after="90" w:line="276" w:lineRule="auto" /></w:pPr><w:r><w:rPr><w:b /></w:rPr><w:t xml:space="preserve">' + numCount + '.  </w:t></w:r>' + runs(rest) + '</w:p>';
    } else if (tag === 'GD') body += '<w:p><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="10" w:color="1F2D58" /></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="EEF1F8" /><w:ind w:left="227" w:right="170" /><w:spacing w:before="120" w:after="40" w:line="264" w:lineRule="auto" /></w:pPr><w:r><w:rPr><w:b /><w:caps /><w:color w:val="1F2D58" /><w:sz w:val="15" /></w:rPr><w:t xml:space="preserve">Guidance    </w:t></w:r>' + runs(rest, '<w:i /><w:color w:val="2A3A6B" /><w:sz w:val="18" />') + '</w:p><w:p><w:pPr><w:spacing w:after="80" /><w:rPr><w:sz w:val="8" /></w:rPr></w:pPr></w:p>';else if (tag === 'BQ') body += '<w:p><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="10" w:color="F89728" /></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="FEF7EC" /><w:ind w:left="227" w:right="170" /><w:spacing w:before="120" w:after="180" w:line="276" w:lineRule="auto" /></w:pPr>' + runs(rest, '<w:i /><w:color w:val="95500A" /><w:sz w:val="19" />') + '</w:p>';else if (tag === 'FIG') {
      const p = rest.split('|');
      body += figXml(p[0], p[1], Number(p[2]), Number(p[3]));
    }
  }
  flushTbl();
  const paraRe = /<w:p [^>]*>[\s\S]*?<\/w:p>/g;
  let mm,
    cutStart = -1;
  while ((mm = paraRe.exec(xml)) !== null) {
    const p = mm[0];
    if (/<w:pStyle w:val="Heading1"\s*\/>/.test(p) && /Introduction/.test(p)) {
      cutStart = mm.index;
      break;
    }
  }
  const tailIdx = xml.lastIndexOf('<w:sectPr');
  if (cutStart < 0 || tailIdx < 0) throw new Error('splice markers not found for ' + outPath);
  const newDoc = xml.slice(0, cutStart) + body + xml.slice(tailIdx);
  files['word/document.xml'] = te.encode(newDoc);
  let rels = td.decode(files['word/_rels/document.xml.rels']);
  let addRels = '';
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
  const crcT = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
      t[n] = c;
    }
    return t;
  })();
  const crc32 = d => {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < d.length; i++) c = crcT[(c ^ d[i]) & 0xFF] ^ c >>> 8;
    return (c ^ 0xFFFFFFFF) >>> 0;
  };
  const parts = [],
    central = [];
  let offset = 0;
  const names = Object.keys(files);
  for (const name of names) {
    const data = files[name];
    const nb = te.encode(name);
    const crc = crc32(data);
    const lh = new Uint8Array(30 + nb.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, nb.length, true);
    lh.set(nb, 30);
    parts.push(lh, data);
    const ch = new Uint8Array(46 + nb.length);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nb.length, true);
    cv.setUint32(42, offset, true);
    ch.set(nb, 46);
    central.push(ch);
    offset += lh.length + data.length;
  }
  const cdStart = offset;
  let cdLen = 0;
  for (const c of central) {
    parts.push(c);
    cdLen += c.length;
  }
  const eo = new Uint8Array(22);
  const ev = new DataView(eo.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, names.length, true);
  ev.setUint16(10, names.length, true);
  ev.setUint32(12, cdLen, true);
  ev.setUint32(16, cdStart, true);
  parts.push(eo);
  const out = new Blob(parts, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  await saveFile(outPath, out);
  log(outPath + ' -> ' + out.size + ' bytes, figures=' + images.length + ', xrefs=' + Object.values(secMap).filter(s => s.placed).length + ' bookmarked' + (badXrefs.length ? '\n  UNRESOLVED [[xref]]: ' + [...new Set(badXrefs)].join(', ') : '') + (dupSections.length ? '\n  duplicate section numbers (first occurrence bookmarked): ' + [...new Set(dupSections)].join(', ') : ''));
}
let __ds_default_exports_standard_user_avd_templates_detailed_design_v2_authoring_docx_builder_lfgo6c;
try {
  __ds_default_exports_standard_user_avd_templates_detailed_design_v2_authoring_docx_builder_lfgo6c = {
    buildDocx
  };
} catch {}
Object.assign(__ds_scope, { __ds_default_exports_standard_user_avd_templates_detailed_design_v2_authoring_docx_builder_lfgo6c });
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/standard-user-avd/templates/detailed-design-v2/authoring/docx-builder.js", error: String((e && e.message) || e) }); }

// exports/standard-user-avd/templates/detailed-design-v2/authoring/qa-checks.js
try { (() => {
// APM design-document QA checks.
// Load in a figures page during authoring, or paste into the console of any page:
//   <script src="./qa-checks.js"></script>
// Then:
//   qa()                 -> runs all four, returns { overlap, contrast, overflow, escapes, ok }
//   qa.overlapScan()     -> element collisions inside every .dgm-fig
//   qa.contrastAudit()   -> WCAG AA failures across the WHOLE page
//   qa.overflowScan()    -> anything spilling outside its figure canvas
//   qa.escapeScan()      -> literal escape sequences, and em dashes (banned in APM artifacts)
//   qa.orphanScan()      -> wire labels sitting too far from any connector to read as annotations
//   qa.legendScan()      -> connector styles used in a figure but absent from its legend
//   qa.occlusionScan()   -> arrows hidden behind opaque boxes, leaving a floating arrowhead
//
// Both return { fails: n, out: [...] }. Ship only when qa().ok === true.
// See guidelines/detailed-design-standard.md §5.

(function () {
  const parseNums = c => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = c => {
    const f = v => (v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const ratio = (a, b) => {
    const L1 = Math.max(lum(a), lum(b)),
      L2 = Math.min(lum(a), lum(b));
    return Math.round((L1 + 0.05) / (L2 + 0.05) * 100) / 100;
  };
  // resolves any CSS colour - including oklab()/color-mix() - to [r,g,b]
  const resolve = col => {
    const d = document.createElement('div');
    d.style.color = col;
    document.body.appendChild(d);
    const c = getComputedStyle(d).color;
    d.remove();
    if (c.startsWith('rgb')) return parseNums(c).slice(0, 3);
    const cv = document.createElement('canvas').getContext('2d');
    cv.fillStyle = col;
    cv.fillRect(0, 0, 1, 1);
    const q = cv.getImageData(0, 0, 1, 1).data;
    return [q[0], q[1], q[2]];
  };
  const composite = (fg, bg) => fg.slice(0, 3).map((v, i) => Math.round(v * fg[3] + bg[i] * (1 - fg[3])));
  // walks ancestors, compositing translucent layers; gradients contribute their first stop
  const bgOf = el => {
    let acc = null;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      let c = null;
      if (s.backgroundImage !== 'none') {
        const m = s.backgroundImage.match(/rgba?\([^)]+\)/);
        if (m) c = parseNums(m[0]);
      }
      if (!c && s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const v = parseNums(s.backgroundColor);
        c = resolve(s.backgroundColor).concat(v.length > 3 ? v[3] : 1);
      }
      if (!c) continue;
      if (c.length === 3) c = c.concat(1);
      acc = acc ? composite(acc, c.slice(0, 3)).concat(1) : c;
      if (acc[3] >= 1) return acc.slice(0, 3);
    }
    return acc ? composite(acc, [255, 255, 255]) : [255, 255, 255];
  };

  // Elements with their OWN text node, so a container isn't judged by its children's colour.
  const textBearing = root => [...root.querySelectorAll('*')].filter(el => {
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0;
  });
  function contrastAudit(root) {
    root = root || document;
    const out = [];
    const els = textBearing(root);
    els.forEach(el => {
      const cs = getComputedStyle(el);
      const r = ratio(resolve(cs.color), bgOf(el));
      const fs = parseFloat(cs.fontSize);
      const large = fs >= 24 || fs >= 18.66 && +cs.fontWeight >= 700;
      const bar = large ? 3 : 4.5;
      if (r < bar) out.push({
        text: el.textContent.trim().slice(0, 34),
        tag: el.tagName,
        cls: typeof el.className === 'string' ? el.className : '',
        size: cs.fontSize,
        weight: cs.fontWeight,
        color: cs.color,
        ratio: r,
        bar
      });
    });
    return {
      checked: els.length,
      fails: out.length,
      out
    };
  }

  // Overlays must not sit on top of boxes, or on each other. Opaque .dgm-lbl
  // backgrounds silently eat the first characters of any box heading they cross.
  function overlapScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const fb = fig.getBoundingClientRect();
      const overlays = [...fig.querySelectorAll('.dgm-lbl, .dgm-step, .dgm-note, .dgm-legend, .dgm-key')];
      const targets = [...fig.querySelectorAll('.dgm-box, .dgm-heat')];
      [[overlays, targets], [overlays, overlays]].forEach(([as, bs], pass) => as.forEach((a, ai) => bs.forEach((b, bi) => {
        if (a === b || pass === 1 && bi <= ai) return;
        const ra = a.getBoundingClientRect(),
          rb = b.getBoundingClientRect();
        const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (ox > 1 && oy > 1) out.push({
          fig: fig.id,
          a: a.textContent.trim().slice(0, 30),
          b: b.textContent.trim().slice(0, 30),
          overlap: Math.round(ox) + 'x' + Math.round(oy),
          // relative to the figure box, so these map onto the inline left/top values
          aLeft: Math.round(ra.left - fb.left),
          aRight: Math.round(ra.right - fb.left),
          aTop: Math.round(ra.top - fb.top)
        });
      })));
    });
    return {
      figures: root.querySelectorAll('.dgm-fig').length,
      fails: out.length,
      out
    };
  }

  // Any element whose content spills outside its own .dgm-fig canvas.
  function overflowScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const fb = fig.getBoundingClientRect();
      fig.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        if (r.right > fb.right + 1 || r.bottom > fb.bottom + 1 || r.left < fb.left - 1 || r.top < fb.top - 1) {
          out.push({
            fig: fig.id,
            el: el.textContent.trim().slice(0, 30) || el.tagName,
            spill: {
              right: Math.round(r.right - fb.right),
              bottom: Math.round(r.bottom - fb.bottom)
            }
          });
        }
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Boxes whose own text is clipped by a fixed height (scrollHeight > clientHeight).
  // overflowScan only measures against the .dgm-fig canvas, so a box that hides its own
  // last line passes it - this catches that. Runs on the elements that carry copy.
  function clipScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      fig.querySelectorAll('.dgm-box, .dgm-heat, .dgm-lbl, .dgm-note').forEach(el => {
        const hid = el.scrollHeight - el.clientHeight,
          wid = el.scrollWidth - el.clientWidth;
        if (hid > 1 || wid > 1) out.push({
          fig: fig.id,
          el: (el.querySelector('h4, h5') || el).textContent.trim().slice(0, 34),
          needs: el.scrollHeight,
          has: el.clientHeight,
          clipped: Math.max(hid, 0),
          widthClipped: Math.max(wid, 0)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Literal escape sequences leaking into rendered copy, invisible to the other scans:
  // a double-encoded unicode escape in a write_file call puts the raw characters into the
  // HTML instead of the glyph. Also flags em dashes, which are banned in APM artifacts
  // (use a spaced hyphen, a colon, or restructure the sentence).
  function escapeScan(root) {
    root = root || document;
    const out = [];
    const bad = /\\u[0-9a-fA-F]{4}|\\n|\\t|\\r|&amp;(amp|lt|gt|quot|#\d+);|\u2014/;
    const walker = document.createTreeWalker(root.body || root, NodeFilter.SHOW_TEXT);
    const NOT_COPY = /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|TITLE)$/;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.textContent;
      if (!t.trim() || !bad.test(t)) continue;
      const host = n.parentElement;
      // script/style contents are source, not rendered copy
      if (host && NOT_COPY.test(host.tagName)) continue;
      out.push({
        match: (t.match(bad) || [])[0],
        text: t.trim().slice(0, 60),
        cls: host && typeof host.className === 'string' ? host.className : '',
        fig: host && host.closest('.dgm-fig') ? host.closest('.dgm-fig').id : null
      });
    }
    return {
      fails: out.length,
      out
    };
  }

  // A wire label must sit near the connector it annotates. Overlap-free is not enough:
  // a label nudged out of a collision can land in dead space, where a reader cannot tell
  // which arrow it refers to. Measures point-to-segment distance from each label centre to
  // every <line> in its figure's SVG, scaling viewBox coordinates to stage pixels.
  function orphanScan(root, maxDist) {
    root = root || document;
    maxDist = maxDist || 80;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      const labels = [...fig.querySelectorAll('.dgm-lbl')];
      if (!svg || !labels.length) return;
      const sb = svg.getBoundingClientRect();
      const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      if (vb.length !== 4 || !sb.width) return;
      const sx = sb.width / vb[2],
        sy = sb.height / vb[3];
      const segs = [...svg.querySelectorAll('line')].map(l => ({
        x1: sb.left + +l.getAttribute('x1') * sx,
        y1: sb.top + +l.getAttribute('y1') * sy,
        x2: sb.left + +l.getAttribute('x2') * sx,
        y2: sb.top + +l.getAttribute('y2') * sy
      }));
      if (!segs.length) return;
      labels.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2,
          cy = r.top + r.height / 2;
        let best = Infinity;
        segs.forEach(s => {
          const dx = s.x2 - s.x1,
            dy = s.y2 - s.y1;
          const len2 = dx * dx + dy * dy;
          let t = len2 ? ((cx - s.x1) * dx + (cy - s.y1) * dy) / len2 : 0;
          t = Math.max(0, Math.min(1, t));
          const px = s.x1 + t * dx,
            py = s.y1 + t * dy;
          best = Math.min(best, Math.hypot(cx - px, cy - py));
        });
        if (best > maxDist) out.push({
          fig: fig.id,
          label: el.textContent.trim().slice(0, 40),
          distToNearestWire: Math.round(best),
          left: Math.round(r.left - fig.getBoundingClientRect().left),
          top: Math.round(r.top - fig.getBoundingClientRect().top)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Every meaning-bearing connector style must be decodable. Collects the distinct
  // stroke + dash combinations of each figure's <line>s and compares the count against
  // that figure's legend entries. Fails when a figure uses more styles than it explains,
  // or uses more than one style with no legend at all.
  function legendScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      if (!svg) return;
      const styles = new Set();
      svg.querySelectorAll('line').forEach(l => {
        // only arrowed lines are connectors; un-arrowed lines are sequence lifelines
        if (!l.getAttribute('marker-end')) return;
        const cs = getComputedStyle(l);
        const dashed = (l.getAttribute('stroke-dasharray') || cs.strokeDasharray || 'none') !== 'none';
        styles.add((l.getAttribute('stroke') || cs.stroke).toLowerCase() + (dashed ? '|dashed' : '|solid'));
      });
      if (styles.size < 2) return; // one style needs no legend
      const entries = fig.querySelectorAll('.dgm-legend i').length;
      if (entries < styles.size) out.push({
        fig: fig.id,
        stylesUsed: styles.size,
        legendEntries: entries,
        styles: [...styles]
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // The SVG wire layer paints BENEATH the opaque .dgm-box elements, so a connector routed
  // through a box column is hidden except for a short stub and its arrowhead. Samples each
  // arrowed line and flags any whose path is mostly covered while its tip sits outside every
  // box. An arrow whose tip is inside its target box is the normal case and passes.
  function occlusionScan(root, maxHidden) {
    root = root || document;
    maxHidden = maxHidden || 0.25;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      if (!svg) return;
      const sb = svg.getBoundingClientRect();
      const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      if (vb.length !== 4 || !sb.width) return;
      const sx = sb.width / vb[2],
        sy = sb.height / vb[3];
      const rects = [...fig.querySelectorAll('.dgm-box, .dgm-heat')].map(b => b.getBoundingClientRect());
      const inAny = (x, y) => rects.some(r => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
      svg.querySelectorAll('line').forEach(l => {
        if (!l.getAttribute('marker-end')) return;
        const x1 = sb.left + +l.getAttribute('x1') * sx,
          y1 = sb.top + +l.getAttribute('y1') * sy;
        const x2 = sb.left + +l.getAttribute('x2') * sx,
          y2 = sb.top + +l.getAttribute('y2') * sy;
        const N = 200;
        let hidden = 0;
        for (let i = 0; i <= N; i++) {
          const t = i / N;
          if (inAny(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) hidden++;
        }
        const frac = hidden / (N + 1);
        // The marker footprint is the last ~11px. An arrow whose TIP is inside its target box
        // is normal ONLY while the arrowhead itself is still visible; if the head is buried the
        // arrow renders as a plain line that stops dead, with no readable direction.
        const len = Math.hypot(x2 - x1, y2 - y1);
        const headFrac = len ? Math.min(1, 11 / len) : 1;
        let headHidden = 0;
        for (let i = 0; i <= 20; i++) {
          const t = 1 - headFrac * (i / 20);
          if (inAny(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) headHidden++;
        }
        const headPct = headHidden / 21;
        const tipInBox = inAny(x2, y2);
        if (headPct > 0.5 || frac > maxHidden && !tipInBox) out.push({
          fig: fig.id,
          line: l.getAttribute('x1') + ',' + l.getAttribute('y1') + ' -> ' + l.getAttribute('x2') + ',' + l.getAttribute('y2'),
          hiddenPct: Math.round(frac * 100),
          headHiddenPct: Math.round(headPct * 100)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }
  function qa(root) {
    const overlap = overlapScan(root),
      contrast = contrastAudit(root),
      overflow = overflowScan(root),
      escapes = escapeScan(root),
      orphans = orphanScan(root),
      legends = legendScan(root),
      occlusion = occlusionScan(root),
      clip = clipScan(root);
    const ok = overlap.fails === 0 && contrast.fails === 0 && overflow.fails === 0 && escapes.fails === 0 && orphans.fails === 0 && legends.fails === 0 && occlusion.fails === 0 && clip.fails === 0;
    console.log(ok ? '✓ QA clean' : '✗ QA failures', {
      overlap: overlap.fails,
      contrast: contrast.fails,
      overflow: overflow.fails,
      escapes: escapes.fails,
      orphans: orphans.fails,
      legends: legends.fails,
      occlusion: occlusion.fails,
      clip: clip.fails
    });
    return {
      ok,
      overlap,
      contrast,
      overflow,
      escapes,
      orphans,
      legends,
      occlusion,
      clip
    };
  }
  qa.overlapScan = overlapScan;
  qa.contrastAudit = contrastAudit;
  qa.overflowScan = overflowScan;
  qa.escapeScan = escapeScan;
  qa.orphanScan = orphanScan;
  qa.legendScan = legendScan;
  qa.occlusionScan = occlusionScan;
  qa.clipScan = clipScan;
  window.qa = qa;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/standard-user-avd/templates/detailed-design-v2/authoring/qa-checks.js", error: String((e && e.message) || e) }); }

// exports/standard-user-avd/templates/detailed-design/authoring/docx-to-dsl.js
try { (() => {
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
async function unzipDocx(blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  const dv = new DataView(buf.buffer);
  let e = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      e = i;
      break;
    }
  }
  if (e < 0) throw new Error('not a zip');
  const n = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  const out = {};
  for (let i = 0; i < n; i++) {
    const method = dv.getUint16(p + 10, true),
      csize = dv.getUint32(p + 20, true);
    const nl = dv.getUint16(p + 28, true),
      el = dv.getUint16(p + 30, true),
      cl = dv.getUint16(p + 32, true);
    const lho = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + nl));
    const lnl = dv.getUint16(lho + 26, true),
      lel = dv.getUint16(lho + 28, true);
    const s = lho + 30 + lnl + lel;
    const d = buf.subarray(s, s + csize);
    out[name] = method === 0 ? d : new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    p += 46 + nl + el + cl;
  }
  return out;
}

// Australian-English / house-style clean-up applied to every string of copy.
function sanitise(s) {
  return s.replace(/\u00a0/g, ' ').replace(/\s*\u2014\s*/g, ' - ') // em dash is banned house-wide
  .replace(/(\s)\u2013(\s)/g, '$1-$2') // spaced en dash reads as a dash, not a range
  .replace(/\u2011/g, '-').replace(/[\u200b\u200e\u200f]/g, '').replace(/[ \t]+/g, ' ').replace(/,\s*,/g, ',').trim();
}
const escMarkers = s => s.replace(/==/g, '= =').replace(/\*\*/g, '* *');
function docxToDsl(parts, opts = {}) {
  const td = new TextDecoder();
  const dom = x => new DOMParser().parseFromString(x, 'application/xml');
  const docXml = td.decode(parts['word/document.xml']);
  const doc = dom(docXml);
  const perr = doc.querySelector('parsererror');
  if (perr) throw new Error(perr.textContent.slice(0, 200));
  const body = doc.getElementsByTagNameNS(W, 'body')[0];
  const warnings = [];

  // numId -> [numFmt per level]
  const numFmt = {};
  if (parts['word/numbering.xml']) {
    const nd = dom(td.decode(parts['word/numbering.xml']));
    const abs = {};
    for (const a of nd.getElementsByTagNameNS(W, 'abstractNum')) abs[a.getAttribute('w:abstractNumId')] = [...a.getElementsByTagNameNS(W, 'lvl')].map(l => {
      const f = l.getElementsByTagNameNS(W, 'numFmt')[0];
      return f ? f.getAttribute('w:val') : 'bullet';
    });
    for (const nn of nd.getElementsByTagNameNS(W, 'num')) {
      const a = nn.getElementsByTagNameNS(W, 'abstractNumId')[0];
      numFmt[nn.getAttribute('w:numId')] = abs[a && a.getAttribute('w:val')] || [];
    }
  }
  // rId -> media target
  const relMap = {};
  if (parts['word/_rels/document.xml.rels']) for (const m of td.decode(parts['word/_rels/document.xml.rels']).matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) relMap[m[1]] = m[2];
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
          let b = false,
            hl = false;
          if (rPr) {
            const bEl = [...rPr.children].find(x => x.localName === 'b');
            b = !!bEl && bEl.getAttribute('w:val') !== '0' && bEl.getAttribute('w:val') !== 'false';
            const h = [...rPr.children].find(x => x.localName === 'highlight');
            hl = !!h && h.getAttribute('w:val') === 'yellow';
          }
          let t = '';
          for (const x of kids(c)) {
            if (x.localName === 't') t += x.textContent;else if (x.localName === 'tab') t += ' ';else if (x.localName === 'br') t += forCell ? '<br>' : ' ';else if (x.localName === 'noBreakHyphen') t += '-';else if (x.localName === 'drawing' || x.localName === 'pict') t += '';
          }
          if (t) segs.push({
            t,
            b,
            hl
          });
        } else if (ln === 'hyperlink' || ln === 'smartTag' || ln === 'ins' || ln === 'sdt' || ln === 'sdtContent') walk(c);
      }
    })(node);
    // merge adjacent identical formatting, then emit balanced markers
    let out = '',
      prev = null,
      buf = '';
    const flush = () => {
      if (!buf) return;
      let s = escMarkers(buf);
      if (prev.b) s = '**' + s.replace(/^(\s*)/, '$1').trimEnd() + '**' + (/\s$/.test(buf) ? ' ' : '');
      if (prev.hl) s = '==' + s + '==';
      out += s;
      buf = '';
    };
    for (const s of segs) {
      if (prev && s.b === prev.b && s.hl === prev.hl) {
        buf += s.t;
        continue;
      }
      flush();
      prev = s;
      buf = s.t;
    }
    flush();
    return sanitise(out).replace(/\*\* +\*\*/g, ' ').replace(/== *==/g, '');
  }

  // --- heading numbering -------------------------------------------------
  const ctr = [0, 0, 0, 0, 0];
  function headingNo(lvl) {
    ctr[lvl - 1]++;
    for (let i = lvl; i < 5; i++) ctr[i] = 0;
    return ctr.slice(0, lvl).join('.') + (lvl === 1 ? '.' : '');
  }
  const SKIP = new Set(['Title', 'Subtitle', 'TOCHeading', 'Heading1-NotLinked', 'Heading2-NotLinked', 'PulloutBoxHeading', 'SWtablehead', 'SWtabletext', 'TableofFigures']);
  const isSkip = st => SKIP.has(st) || /^TOC\d$/.test(st);

  // cover metadata from the pre-body region
  const cover = {
    fields: {},
    versionRows: []
  };
  const cellText = tc => kids(tc).filter(x => x.localName === 'p').map(pp => inline(pp, false)).filter(Boolean).join(' ');
  const allKids = kids(body);
  let start = allKids.findIndex(k => {
    if (k.localName !== 'p') return false;
    const ps = first(k, 'pStyle');
    return ps && ps.getAttribute('w:val') === 'Heading1';
  });
  if (start < 0) {
    start = 0;
    warnings.push('no Heading1 found; converting from the top');
  }
  for (let i = 0; i < start; i++) {
    const k = allKids[i];
    if (k.localName !== 'tbl') continue;
    const rows = [...k.getElementsByTagNameNS(W, 'tr')].map(r => [...r.getElementsByTagNameNS(W, 'tc')].map(cellText));
    if (rows.some(r => r.length === 2 && /^Project Name:/.test(r[0]))) for (const r of rows) if (r[0]) cover.fields[r[0]] = r[1];
    if (rows[0] && /Version/i.test(rows[0][0]) && /Author/i.test(rows[0][2] || '')) for (const r of rows.slice(1)) if (r.some(c => c)) cover.versionRows.push(r.map(c => c.replace(/<br>/g, ' ')));
  }

  // --- body --------------------------------------------------------------
  const lines = [];
  const images = [];
  let figNo = 0;
  let lastHeading = '';
  const push = l => lines.push(l);
  function figLines(p) {
    for (const dr of p.getElementsByTagNameNS(W, 'drawing')) {
      const ext = dr.getElementsByTagName('wp:extent')[0];
      const cx = ext ? +ext.getAttribute('cx') : 5750000,
        cy = ext ? +ext.getAttribute('cy') : 3500000;
      const blip = dr.getElementsByTagName('a:blip')[0];
      const rid = blip && blip.getAttribute('r:embed');
      const target = relMap[rid] || '';
      const file = opts.figNames && opts.figNames[target.split('/').pop()] || target.split('/').pop();
      figNo++;
      images.push({
        rel: rid,
        target,
        file,
        figNo
      });
      const cap = opts.captions && opts.captions[figNo] || 'Figure ' + figNo + '. ' + lastHeading;
      if (!opts.captions || !opts.captions[figNo]) warnings.push('figure ' + figNo + ' (' + target + ') had no caption in source; generated "' + cap + '"');
      push('FIG|' + file + '|' + cap + '|' + Math.round(cx / 9525) + '|' + Math.round(cy / 9525));
    }
  }
  function paragraph(p) {
    const ps = first(p, 'pStyle');
    const st = ps ? ps.getAttribute('w:val') : '';
    if (isSkip(st)) return;
    const hasDrawing = p.getElementsByTagNameNS(W, 'drawing').length > 0;
    const txt = inline(p, false);
    if (hasDrawing) {
      figLines(p);
      if (txt) push('P |' + txt);
      return;
    }
    if (!txt) return;
    const hm = /^Heading([1-5])$/.exec(st);
    if (hm) {
      const lvl = +hm[1];
      const tag = 'H' + Math.min(lvl, 5);
      lastHeading = txt;
      push(tag + ' |' + headingNo(lvl) + ' ' + txt);
      return;
    }
    const np = first(p, 'numPr');
    if (np) {
      const ni = first(np, 'numId'),
        il = first(np, 'ilvl');
      const lvl = il ? +il.getAttribute('w:val') : 0;
      const fmt = (numFmt[ni && ni.getAttribute('w:val')] || [])[lvl] || 'bullet';
      if (fmt === 'decimal') {
        push('NUM|' + txt);
        return;
      }
      push('B |' + (lvl > 0 ? '\u2013 ' : '') + txt);
      return;
    }
    if (st === 'ListParagraph') {
      push('B |' + txt);
      return;
    }
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
        if (pr) {
          const gs = [...pr.children].find(x => x.localName === 'gridSpan');
          if (gs) span = +gs.getAttribute('w:val');
        }
        const paras = kids(tc).filter(x => x.localName === 'p');
        const bits = paras.map(pp => {
          const t = inline(pp, true);
          if (!t) return '';
          const np = first(pp, 'numPr');
          const psx = first(pp, 'pStyle');
          const listy = np || psx && psx.getAttribute('w:val') === 'ListParagraph';
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
    if (k.localName === 'p') paragraph(k);else if (k.localName === 'tbl') table(k);
  }
  const nComments = parts['word/comments.xml'] ? (td.decode(parts['word/comments.xml']).match(/<w:comment /g) || []).length : 0;
  if (nComments) warnings.push(nComments + ' Word comments in the source were not carried across');
  const nDel = (docXml.match(/<w:del /g) || []).length;
  if (nDel) warnings.push(nDel + ' tracked deletions present in the source');
  return {
    dsl: lines.join('\n') + '\n',
    images,
    warnings,
    cover
  };
}
Object.assign(__ds_scope, { unzipDocx, sanitise, docxToDsl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/standard-user-avd/templates/detailed-design/authoring/docx-to-dsl.js", error: String((e && e.message) || e) }); }

// exports/standard-user-avd/templates/detailed-design/authoring/qa-checks.js
try { (() => {
// APM design-document QA checks.
// Load in a figures page during authoring, or paste into the console of any page:
//   <script src="./qa-checks.js"></script>
// Then:
//   qa()                 -> runs all four, returns { overlap, contrast, overflow, escapes, ok }
//   qa.overlapScan()     -> element collisions inside every .dgm-fig
//   qa.contrastAudit()   -> WCAG AA failures across the WHOLE page
//   qa.overflowScan()    -> anything spilling outside its figure canvas
//   qa.escapeScan()      -> literal escape sequences, and em dashes (banned in APM artifacts)
//   qa.orphanScan()      -> wire labels sitting too far from any connector to read as annotations
//   qa.legendScan()      -> connector styles used in a figure but absent from its legend
//   qa.occlusionScan()   -> arrows hidden behind opaque boxes, leaving a floating arrowhead
//
// Both return { fails: n, out: [...] }. Ship only when qa().ok === true.
// See guidelines/detailed-design-standard.md §5.

(function () {
  const parseNums = c => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = c => {
    const f = v => (v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const ratio = (a, b) => {
    const L1 = Math.max(lum(a), lum(b)),
      L2 = Math.min(lum(a), lum(b));
    return Math.round((L1 + 0.05) / (L2 + 0.05) * 100) / 100;
  };
  // resolves any CSS colour - including oklab()/color-mix() - to [r,g,b]
  const resolve = col => {
    const d = document.createElement('div');
    d.style.color = col;
    document.body.appendChild(d);
    const c = getComputedStyle(d).color;
    d.remove();
    if (c.startsWith('rgb')) return parseNums(c).slice(0, 3);
    const cv = document.createElement('canvas').getContext('2d');
    cv.fillStyle = col;
    cv.fillRect(0, 0, 1, 1);
    const q = cv.getImageData(0, 0, 1, 1).data;
    return [q[0], q[1], q[2]];
  };
  const composite = (fg, bg) => fg.slice(0, 3).map((v, i) => Math.round(v * fg[3] + bg[i] * (1 - fg[3])));
  // walks ancestors, compositing translucent layers; gradients contribute their first stop
  const bgOf = el => {
    let acc = null;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      let c = null;
      if (s.backgroundImage !== 'none') {
        const m = s.backgroundImage.match(/rgba?\([^)]+\)/);
        if (m) c = parseNums(m[0]);
      }
      if (!c && s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const v = parseNums(s.backgroundColor);
        c = resolve(s.backgroundColor).concat(v.length > 3 ? v[3] : 1);
      }
      if (!c) continue;
      if (c.length === 3) c = c.concat(1);
      acc = acc ? composite(acc, c.slice(0, 3)).concat(1) : c;
      if (acc[3] >= 1) return acc.slice(0, 3);
    }
    return acc ? composite(acc, [255, 255, 255]) : [255, 255, 255];
  };

  // Elements with their OWN text node, so a container isn't judged by its children's colour.
  const textBearing = root => [...root.querySelectorAll('*')].filter(el => {
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0;
  });
  function contrastAudit(root) {
    root = root || document;
    const out = [];
    const els = textBearing(root);
    els.forEach(el => {
      const cs = getComputedStyle(el);
      const r = ratio(resolve(cs.color), bgOf(el));
      const fs = parseFloat(cs.fontSize);
      const large = fs >= 24 || fs >= 18.66 && +cs.fontWeight >= 700;
      const bar = large ? 3 : 4.5;
      if (r < bar) out.push({
        text: el.textContent.trim().slice(0, 34),
        tag: el.tagName,
        cls: typeof el.className === 'string' ? el.className : '',
        size: cs.fontSize,
        weight: cs.fontWeight,
        color: cs.color,
        ratio: r,
        bar
      });
    });
    return {
      checked: els.length,
      fails: out.length,
      out
    };
  }

  // Overlays must not sit on top of boxes, or on each other. Opaque .dgm-lbl
  // backgrounds silently eat the first characters of any box heading they cross.
  function overlapScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const fb = fig.getBoundingClientRect();
      const overlays = [...fig.querySelectorAll('.dgm-lbl, .dgm-step, .dgm-note, .dgm-legend, .dgm-key')];
      const targets = [...fig.querySelectorAll('.dgm-box, .dgm-heat')];
      [[overlays, targets], [overlays, overlays]].forEach(([as, bs], pass) => as.forEach((a, ai) => bs.forEach((b, bi) => {
        if (a === b || pass === 1 && bi <= ai) return;
        const ra = a.getBoundingClientRect(),
          rb = b.getBoundingClientRect();
        const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (ox > 1 && oy > 1) out.push({
          fig: fig.id,
          a: a.textContent.trim().slice(0, 30),
          b: b.textContent.trim().slice(0, 30),
          overlap: Math.round(ox) + 'x' + Math.round(oy),
          // relative to the figure box, so these map onto the inline left/top values
          aLeft: Math.round(ra.left - fb.left),
          aRight: Math.round(ra.right - fb.left),
          aTop: Math.round(ra.top - fb.top)
        });
      })));
    });
    return {
      figures: root.querySelectorAll('.dgm-fig').length,
      fails: out.length,
      out
    };
  }

  // Any element whose content spills outside its own .dgm-fig canvas.
  function overflowScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const fb = fig.getBoundingClientRect();
      fig.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        if (r.right > fb.right + 1 || r.bottom > fb.bottom + 1 || r.left < fb.left - 1 || r.top < fb.top - 1) {
          out.push({
            fig: fig.id,
            el: el.textContent.trim().slice(0, 30) || el.tagName,
            spill: {
              right: Math.round(r.right - fb.right),
              bottom: Math.round(r.bottom - fb.bottom)
            }
          });
        }
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Boxes whose own text is clipped by a fixed height (scrollHeight > clientHeight).
  // overflowScan only measures against the .dgm-fig canvas, so a box that hides its own
  // last line passes it - this catches that. Runs on the elements that carry copy.
  function clipScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      fig.querySelectorAll('.dgm-box, .dgm-heat, .dgm-lbl, .dgm-note').forEach(el => {
        const hid = el.scrollHeight - el.clientHeight,
          wid = el.scrollWidth - el.clientWidth;
        if (hid > 1 || wid > 1) out.push({
          fig: fig.id,
          el: (el.querySelector('h4, h5') || el).textContent.trim().slice(0, 34),
          needs: el.scrollHeight,
          has: el.clientHeight,
          clipped: Math.max(hid, 0),
          widthClipped: Math.max(wid, 0)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Literal escape sequences leaking into rendered copy, invisible to the other scans:
  // a double-encoded unicode escape in a write_file call puts the raw characters into the
  // HTML instead of the glyph. Also flags em dashes, which are banned in APM artifacts
  // (use a spaced hyphen, a colon, or restructure the sentence).
  function escapeScan(root) {
    root = root || document;
    const out = [];
    const bad = /\\u[0-9a-fA-F]{4}|\\n|\\t|\\r|&amp;(amp|lt|gt|quot|#\d+);|\u2014/;
    const walker = document.createTreeWalker(root.body || root, NodeFilter.SHOW_TEXT);
    const NOT_COPY = /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|TITLE)$/;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.textContent;
      if (!t.trim() || !bad.test(t)) continue;
      const host = n.parentElement;
      // script/style contents are source, not rendered copy
      if (host && NOT_COPY.test(host.tagName)) continue;
      out.push({
        match: (t.match(bad) || [])[0],
        text: t.trim().slice(0, 60),
        cls: host && typeof host.className === 'string' ? host.className : '',
        fig: host && host.closest('.dgm-fig') ? host.closest('.dgm-fig').id : null
      });
    }
    return {
      fails: out.length,
      out
    };
  }

  // A wire label must sit near the connector it annotates. Overlap-free is not enough:
  // a label nudged out of a collision can land in dead space, where a reader cannot tell
  // which arrow it refers to. Measures point-to-segment distance from each label centre to
  // every <line> in its figure's SVG, scaling viewBox coordinates to stage pixels.
  function orphanScan(root, maxDist) {
    root = root || document;
    maxDist = maxDist || 80;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      const labels = [...fig.querySelectorAll('.dgm-lbl')];
      if (!svg || !labels.length) return;
      const sb = svg.getBoundingClientRect();
      const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      if (vb.length !== 4 || !sb.width) return;
      const sx = sb.width / vb[2],
        sy = sb.height / vb[3];
      const segs = [...svg.querySelectorAll('line')].map(l => ({
        x1: sb.left + +l.getAttribute('x1') * sx,
        y1: sb.top + +l.getAttribute('y1') * sy,
        x2: sb.left + +l.getAttribute('x2') * sx,
        y2: sb.top + +l.getAttribute('y2') * sy
      }));
      if (!segs.length) return;
      labels.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2,
          cy = r.top + r.height / 2;
        let best = Infinity;
        segs.forEach(s => {
          const dx = s.x2 - s.x1,
            dy = s.y2 - s.y1;
          const len2 = dx * dx + dy * dy;
          let t = len2 ? ((cx - s.x1) * dx + (cy - s.y1) * dy) / len2 : 0;
          t = Math.max(0, Math.min(1, t));
          const px = s.x1 + t * dx,
            py = s.y1 + t * dy;
          best = Math.min(best, Math.hypot(cx - px, cy - py));
        });
        if (best > maxDist) out.push({
          fig: fig.id,
          label: el.textContent.trim().slice(0, 40),
          distToNearestWire: Math.round(best),
          left: Math.round(r.left - fig.getBoundingClientRect().left),
          top: Math.round(r.top - fig.getBoundingClientRect().top)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // Every meaning-bearing connector style must be decodable. Collects the distinct
  // stroke + dash combinations of each figure's <line>s and compares the count against
  // that figure's legend entries. Fails when a figure uses more styles than it explains,
  // or uses more than one style with no legend at all.
  function legendScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      if (!svg) return;
      const styles = new Set();
      svg.querySelectorAll('line').forEach(l => {
        // only arrowed lines are connectors; un-arrowed lines are sequence lifelines
        if (!l.getAttribute('marker-end')) return;
        const cs = getComputedStyle(l);
        const dashed = (l.getAttribute('stroke-dasharray') || cs.strokeDasharray || 'none') !== 'none';
        styles.add((l.getAttribute('stroke') || cs.stroke).toLowerCase() + (dashed ? '|dashed' : '|solid'));
      });
      if (styles.size < 2) return; // one style needs no legend
      const entries = fig.querySelectorAll('.dgm-legend i').length;
      if (entries < styles.size) out.push({
        fig: fig.id,
        stylesUsed: styles.size,
        legendEntries: entries,
        styles: [...styles]
      });
    });
    return {
      fails: out.length,
      out
    };
  }

  // The SVG wire layer paints BENEATH the opaque .dgm-box elements, so a connector routed
  // through a box column is hidden except for a short stub and its arrowhead. Samples each
  // arrowed line and flags any whose path is mostly covered while its tip sits outside every
  // box. An arrow whose tip is inside its target box is the normal case and passes.
  function occlusionScan(root, maxHidden) {
    root = root || document;
    maxHidden = maxHidden || 0.25;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      const svg = fig.querySelector('svg.dgm-wires');
      if (!svg) return;
      const sb = svg.getBoundingClientRect();
      const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
      if (vb.length !== 4 || !sb.width) return;
      const sx = sb.width / vb[2],
        sy = sb.height / vb[3];
      const rects = [...fig.querySelectorAll('.dgm-box, .dgm-heat')].map(b => b.getBoundingClientRect());
      const inAny = (x, y) => rects.some(r => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
      svg.querySelectorAll('line').forEach(l => {
        if (!l.getAttribute('marker-end')) return;
        const x1 = sb.left + +l.getAttribute('x1') * sx,
          y1 = sb.top + +l.getAttribute('y1') * sy;
        const x2 = sb.left + +l.getAttribute('x2') * sx,
          y2 = sb.top + +l.getAttribute('y2') * sy;
        const N = 200;
        let hidden = 0;
        for (let i = 0; i <= N; i++) {
          const t = i / N;
          if (inAny(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) hidden++;
        }
        const frac = hidden / (N + 1);
        // The marker footprint is the last ~11px. An arrow whose TIP is inside its target box
        // is normal ONLY while the arrowhead itself is still visible; if the head is buried the
        // arrow renders as a plain line that stops dead, with no readable direction.
        const len = Math.hypot(x2 - x1, y2 - y1);
        const headFrac = len ? Math.min(1, 11 / len) : 1;
        let headHidden = 0;
        for (let i = 0; i <= 20; i++) {
          const t = 1 - headFrac * (i / 20);
          if (inAny(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) headHidden++;
        }
        const headPct = headHidden / 21;
        const tipInBox = inAny(x2, y2);
        if (headPct > 0.5 || frac > maxHidden && !tipInBox) out.push({
          fig: fig.id,
          line: l.getAttribute('x1') + ',' + l.getAttribute('y1') + ' -> ' + l.getAttribute('x2') + ',' + l.getAttribute('y2'),
          hiddenPct: Math.round(frac * 100),
          headHiddenPct: Math.round(headPct * 100)
        });
      });
    });
    return {
      fails: out.length,
      out
    };
  }
  function qa(root) {
    const overlap = overlapScan(root),
      contrast = contrastAudit(root),
      overflow = overflowScan(root),
      escapes = escapeScan(root),
      orphans = orphanScan(root),
      legends = legendScan(root),
      occlusion = occlusionScan(root),
      clip = clipScan(root);
    const ok = overlap.fails === 0 && contrast.fails === 0 && overflow.fails === 0 && escapes.fails === 0 && orphans.fails === 0 && legends.fails === 0 && occlusion.fails === 0 && clip.fails === 0;
    console.log(ok ? '✓ QA clean' : '✗ QA failures', {
      overlap: overlap.fails,
      contrast: contrast.fails,
      overflow: overflow.fails,
      escapes: escapes.fails,
      orphans: orphans.fails,
      legends: legends.fails,
      occlusion: occlusion.fails,
      clip: clip.fails
    });
    return {
      ok,
      overlap,
      contrast,
      overflow,
      escapes,
      orphans,
      legends,
      occlusion,
      clip
    };
  }
  qa.overlapScan = overlapScan;
  qa.contrastAudit = contrastAudit;
  qa.overflowScan = overflowScan;
  qa.escapeScan = escapeScan;
  qa.orphanScan = orphanScan;
  qa.legendScan = legendScan;
  qa.occlusionScan = occlusionScan;
  qa.clipScan = clipScan;
  window.qa = qa;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "exports/standard-user-avd/templates/detailed-design/authoring/qa-checks.js", error: String((e && e.message) || e) }); }

// policies/ca-analysis-data.js
try { (() => {
// Findings from the APM Conditional Access tenant export (116 policies, 7 August 2026).
// Source: policies/APM-Conditional-Access-Policies-Export.csv -> policies/ca-policies.js
// Severity: conflict (design says something the tenant contradicts) | flag (needs a decision
// or a fix) | good (the tenant supports the design position) | info | unknown (export cannot tell).
window.CA_ANALYSIS = {
  generated: '7 August 2026',
  counts: {
    total: 116,
    enabled: 68,
    reportOnly: 43,
    disabled: 5
  },
  limits: 'The export carries six columns: name, state, users, groups, applications, grant rules. It does NOT carry exclusions, conditions (locations, platforms, client apps, device filters, sign-in risk), session controls, authentication strengths, or directory-role targets. A blank grant rule therefore means "session control or authentication strength", not "no control". Seven policies show neither users nor groups because they target directory roles, which this export does not render.',
  findings: [{
    id: 'CA-F01',
    sev: 'conflict',
    t: 'Fourteen kiosk Conditional Access policies exist in the tenant, not seven, and six of them are enforced',
    d: 'Two families are present. CA-APM-Kiosk-* (seven policies: BlockNonWindows, BlockWebClient, RequireCompliantDevice, WebOnly-Office, DeviceBound, BlockExchangeOnline, BlockTeams) are all report-only and target group 761b688c. CA-APM-KioskPB-* (seven policies: RequireCompliantDevice, BlockNonKioskDevices, BlockNonWindows, BlockLegacyAuth, BlockAuthFlows, BlockRiskySignIn, WebOnlyOffice) target group e0378201 and six of the seven are enabled and enforcing right now.',
    why: 'Both families assign to groups, which in Conditional Access means groups of user identities. The Participant Kiosk has no user identity, so every one of these fourteen policies matches nothing the moment the kiosk user group is retired. Six of them are enforced, so they are live policy objects that will silently become no-ops rather than errors. The decommissioning change request currently disposes of "Kiosk Conditional Access policies (seven)" - it is short by seven, and it does not distinguish the enforced family from the report-only one.',
    action: 'Correct the disposition register to fourteen policies in two named families, with the state of each. Delete both families as part of the same change record that retires the user group. Before deleting the six enforced KioskPB policies, export their report-only and sign-in data as RFFR evidence: they are the only record of what the previous access model actually did.',
    owner: 'Shaun Struik to correct the change request; APM Cyber Security to confirm deletion of the enforced family.',
    refs: ['CA export, CA-APM-Kiosk-* and CA-APM-KioskPB-*', 'Kiosk Decommissioning CR 3.1', 'Participant Kiosk DDD 9.4']
  }, {
    id: 'CA-F02',
    sev: 'conflict',
    t: 'The design states tenant policies that are report-only, not enforced',
    d: 'Participant Kiosk DDD 7.2.4 states: "The tenant\u2019s existing policies (multi-factor authentication for all users, phishing-resistant multi-factor authentication for administrators, legacy authentication block, authentication flow restrictions) continue to apply to APM staff identities." The export contradicts two of those four.',
    why: 'Phishing-resistant MFA is report-only in both places it appears: CA-401 (Administrators, All Apps) and CA-106 (All Users and Guests). AdminRoles_Everything_RequireMFA is also report-only. Tenant-wide MFA via CA-101 is report-only. What IS enforced tenant-wide is AllUsers_AllAccess_MFAorDeviceRequired, whose grant is "mfa OR domainJoinedDevice" - satisfied by a managed device with no MFA prompt at all. Legacy authentication is genuinely blocked (Deny Legacy Auth and CA-100 both enabled). The design overstates the identity controls it is relying on, in the one section a Cyber reviewer will read hardest.',
    action: 'Rewrite the last paragraph of 7.2.4 to name the policies that are actually enforced (Deny Legacy Auth, CA-100 legacy protocols, CA-102 non-AU location block, CA-104 high sign-in risk block, CA-105 bad IPs, CA-201 BYOD no persistence, CA-203 high user risk, AllUsers_AllAccess_DeviceRequired, AllUsers_AllAccess_MFAorDeviceRequired) and state that phishing-resistant MFA for administrators is currently report-only, so it must not be cited as a compensating control anywhere in this design.',
    owner: 'Shaun Struik to correct 7.2.4. APM Cyber Security to confirm whether CA-401 and CA-106 are scheduled for enforcement.',
    refs: ['CA export, CA-401 / CA-106 / CA-101 / AdminRoles_Everything_RequireMFA', 'Participant Kiosk DDD 7.2.4']
  }, {
    id: 'CA-F03',
    sev: 'good',
    t: 'The export proves the device-filter block is load-bearing, not belt-and-braces',
    d: 'Two tenant-wide policies are enabled for All users against All apps: AllUsers_AllAccess_DeviceRequired (grant: compliantDevice OR domainJoinedDevice) and AllUsers_AllAccess_MFAorDeviceRequired (grant: mfa OR domainJoinedDevice).',
    why: 'A Participant Kiosk is Entra-joined and carries an Intune compliance policy (7.2.5), so it satisfies both grants. A staff credential typed on a kiosk would pass the estate\u2019s strongest tenant-wide controls - and pass the second one without an MFA prompt, because the device alone satisfies it. Nothing in the inherited policy set stops corporate sign-in from this hardware. Only an explicit device-filter block does. This is the strongest available argument for DR-010 and it is currently absent from the design.',
    action: 'Cite both policies by name in 7.2.4 as the reason the block exists: being managed and compliant makes the fleet look like a corporate device to every existing grant, so denial has to be explicit.',
    owner: 'Shaun Struik to add the citation.',
    refs: ['CA export, AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired', 'Participant Kiosk DDD 7.2.4, DR-010']
  }, {
    id: 'CA-F04',
    sev: 'info',
    t: 'A separate non-AU location block is not needed - the tenant already enforces one',
    d: 'CA-102 (All Users and Guests, All Apps, locations except AU and corporate, block) is enabled. CA-105 (block access from bad IPs) is enabled. CA-500 and CA-501 do the same for guests.',
    why: 'The superseded V1.6 design created its own BlockNonAU policy because the separate kiosk tenant had none. In the corporate tenant that control already exists and applies to all users, so a fleet-specific version would be duplication of the kind this export shows plenty of already.',
    action: 'Where the design or its risk register refers to country-level location control, cite CA-102 rather than creating a policy. AllUsers_UnapprovedCountries_Block is the older report-only twin of CA-102 and should be retired by APM as part of general hygiene.',
    owner: 'Shaun Struik to cite; APM Cyber Security owns retiring the duplicate.',
    refs: ['CA export, CA-102 / CA-105 / AllUsers_UnapprovedCountries_Block']
  }, {
    id: 'CA-F05',
    sev: 'info',
    t: 'Risk-based Conditional Access is live in the corporate tenant, and the fleet gets none of it',
    d: 'CA-104 (high sign-in risk, block), CA-203 (high user risk, require MFA and password reset), AdminRoles_Risky_Sign-ins_MFA and AdminRoles_RiskyUsers_MFA_Password_Reset are all enabled, which means Entra ID P2 risk signals are licensed and in use for staff identities.',
    why: 'Two consequences. First, the V1.6 concern that F3 licensing left no risk-based Conditional Access was an artefact of the separate tenant and is moot here. Second, every one of these policies evaluates a user - identity risk, sign-in risk, user risk. A fleet with no user identity is never evaluated by any of them. That is not a gap, because there is no identity to protect, but the design should say so rather than let a reviewer assume inherited coverage.',
    action: 'Add one sentence to 7.2.4: risk-based policies key on a user principal and therefore do not apply to this fleet; the device-centred equivalents are the compliance policy, App Control and the Defender alerting in 9.2.',
    owner: 'Shaun Struik.',
    refs: ['CA export, CA-104 / CA-203 / AdminRoles_Risky_*', 'Participant Kiosk DDD 7.2.4, 9.2']
  }, {
    id: 'CA-F06',
    sev: 'flag',
    t: 'The new policy name matches no convention in use in the tenant',
    d: 'The design names its policy APM-USER-CAP-Block Participant Kiosk Access-P-1.0. The tenant\u2019s current Conditional Access convention is CA-nnn - <audience> - <apps> - <condition> - <action>, used by more than forty policies, with a number series by audience: CA-1xx all users and guests, CA-2xx organisation users, CA-3xx contract or community populations, CA-4xx administrators, CA-5xx guests.',
    why: 'The Intune Naming Schema governs Intune objects; Conditional Access has its own established convention and a reviewer will read a non-conforming name as an object created outside the process. CA-100 to CA-106 are in use, so CA-107 is the next free number in the all-users series.',
    action: 'Rename to CA-107 - All Users & Guests - All Apps - Participant Kiosk Devices - Block, and record the CA naming convention in the Intune Naming Schema addendum so the two planes are documented together. Note that four numbers are already duplicated in the tenant (CA-204, CA-205, CA-207, CA-208), so confirm CA-107 is unused before creating it.',
    owner: 'Shaun Struik to rename; APM Cyber Security to confirm the number.',
    refs: ['CA export, CA-100 to CA-106', 'Participant Kiosk DDD 7.2.4', 'policies/APM_Intune_Naming_Schema_Addendum.md']
  }, {
    id: 'CA-F07',
    sev: 'flag',
    t: 'Thirty-seven per cent of the Conditional Access estate is report-only, including MFA controls',
    d: '43 of 116 policies are enabledForReportingButNotEnforced and 5 are disabled; only 68 enforce. Report-only includes CA-101 (tenant-wide MFA), CA-106 and CA-401 (phishing-resistant MFA), AdminRoles_Everything_RequireMFA, AdminRoles_Everything_RequireDevice, CA-103 (block unsupported platforms), CA-400 and CA-402 (administrator device and location restrictions), and Guests_Everything_MFARequired.',
    why: 'A report-only policy generates evidence but grants nothing and denies nothing. Essential Eight maturity and the Identity and IT Access Management Standard 4.1.2 both require MFA to be enforced for users, and administrator hardening is the control an assessor tests first. This is wider than our design, but it is a live compliance exposure that any design citing "the tenant enforces MFA" as a compensating control would inherit.',
    action: 'Raise as an estate finding with APM Cyber Security: which of the report-only policies are staged for enforcement, and on what date. Until then, no design in this project may cite tenant MFA or phishing-resistant MFA as a compensating control.',
    owner: 'APM Cyber Security. Shaun Struik to track as an assumption in any design that would otherwise rely on it.',
    refs: ['CA export, state column', 'Identity and IT Access Management Standard 4.1.2']
  }, {
    id: 'CA-F08',
    sev: 'flag',
    t: 'Policy hygiene: duplicates, test artefacts and enforced policies with provisional names',
    d: 'CA-501 ends in the literal word COPY and is enabled. zzADA_Block_Policy_Test_20250626 is a report-only test policy still present. APM Pilot Block Policy and APM Pilot Policy are both enabled, both block All apps, and both carry provisional names. Four CA numbers are duplicated (CA-204, CA-205, CA-207, CA-208). Eight policies are _Reporting twins of live policies. Four names carry leading or trailing whitespace. Eighteen names contain a corrupted separator character where an en dash was intended. Three separate policies block legacy authentication (Deny Legacy Auth enabled, CA-100 enabled, AllUsers_AllAccess_BlockLegacy report-only).',
    why: 'None of this breaks the Participant Kiosk, but it is the environment our policy objects join, and it sets the standard a reviewer will hold our naming to. An enabled block policy called "APM Pilot Block Policy" is the kind of object that is impossible to safely delete later because nobody remembers what it was for.',
    action: 'Supply as an estate hygiene list to APM Cyber Security, separate from this design. For our own objects: one control, one policy, conforming name, no provisional words, no trailing whitespace.',
    owner: 'APM Cyber Security owns remediation. Shaun Struik to supply the list.',
    refs: ['CA export']
  }, {
    id: 'CA-F09',
    sev: 'unknown',
    t: 'The export cannot verify the corporate assignment exclusion register',
    d: 'Participant Kiosk DDD 4.3.8 requires every corporate policy, application and script targeting All Devices, All Users or a broad dynamic group to be explicitly excluded for the fleet before the first device enrols. This export carries no exclusions column.',
    why: 'Nine policies target All users against All apps and cannot be checked for exclusions from this data. The Conditional Access half of the exclusion register is therefore unverified, and the decommissioning risk CR-05 (an exclusion outliving the group it excluded) cannot be tested either.',
    action: 'Request an export that includes conditions and exclusions - Graph identity/conditionalAccess/policies returns the full object, including includeUsers, excludeUsers, includeGroups, excludeGroups, device filters, locations, platforms and client app types. Until then, mark the Conditional Access rows of the 4.3.8 register as unverified rather than complete.',
    owner: 'APM Cyber Security to supply the full export; Shaun Struik to re-run this analysis against it.',
    refs: ['Participant Kiosk DDD 4.3.8', 'Kiosk Decommissioning CR CR-05, V-04']
  }, {
    id: 'CA-F10',
    sev: 'flag',
    t: 'Two enabled policies do the opposite of what their name says',
    d: 'LimitedUsers_EmailOnly_Block is enabled with a grant of mfa, not block. CA-504 - Guests (Assure) - PowerBI - Risky sign ins - Block is enabled with a grant of mfa, not block.',
    why: 'A name that states the wrong action is worse than no name: an operator reading the policy list believes a block is in place where a prompt is. Both are enforced, so the discrepancy is live. CA-APM-Kiosk-WebOnly-Office is a third case in a milder form - the name implies a scoped web-only condition while the export shows All applications with a block grant.',
    action: 'Report to APM Cyber Security for renaming or correction. Confirm which behaviour was intended in each case before the retired kiosk policy is deleted, in case the intent is worth carrying forward.',
    owner: 'APM Cyber Security.',
    refs: ['CA export, LimitedUsers_EmailOnly_Block / CA-504 / CA-APM-Kiosk-WebOnly-Office']
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "policies/ca-analysis-data.js", error: String((e && e.message) || e) }); }

// policies/ca-policies.js
try { (() => {
// Parsed from policies/APM-Conditional-Access-Policies-Export.csv (tenant export, 7 Aug 2026).
// n=name s=state(on|ro|off) u=users g=group count a=apps r=grant rules
window.CA_POLICIES = [{
  "n": "APM Pilot Block Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "APM Pilot Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "Deny Legacy Auth",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "Microsoft.EA.Account_MFA_Required",
  "s": "on",
  "u": "63e569df-3857-41c5-9150-155fa929a66c",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AllUsers_WVDApp_MFAtimeout",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "mfa;compliantDevice;domainJoinedDevice"
}, {
  "n": "AdminAccounts_WVD_DomainDevice",
  "s": "on",
  "u": "",
  "g": 4,
  "a": "3 apps",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "apm-cap-pwdstate",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "AllUsers_Office365Mobile_CompliantDeviceRollout",
  "s": "on",
  "u": "",
  "g": 5,
  "a": "Office365",
  "r": "compliantDevice;compliantApplication"
}, {
  "n": "AllUsers_ZeroTrustApps_AzureADHybridDevice",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_PaloAltoCaptivePortal_ServiceLevelOneDomainDevice",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "AllUsers_AllAccess_DeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "AllUsers_AllAccess_MFAorDeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "AllUsers_Office365_DeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_Office365Mobile_ManagedAppRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "compliantApplication"
}, {
  "n": "AllUsers_Sharepoint_DeviceRequired",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "AdminAccounts_AllAccess_BlockNonJumphostDevices",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "AdminAccounts_WVD_BlockNonAdminDevices",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "AdminAccounts_AllAccess_SigninTimeout",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "Guests_Everything_MFARequired",
  "s": "ro",
  "u": "GuestsOrExternalUsers",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AdminRoles_Everything_RequireDevice",
  "s": "ro",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_AllAccess_DeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "domainJoinedDevice;compliantApplication"
}, {
  "n": "AllUsers_AllAccess_MFAorDeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;domainJoinedDevice;compliantApplication"
}, {
  "n": "AllUsers_Office365_DeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "domainJoinedDevice"
}, {
  "n": "AllUsers_Office365Mobile_ManagedAppRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "Office365",
  "r": "compliantApplication"
}, {
  "n": "AllUsers_Sharepoint_DeviceRequired_Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "AdminAccountsPilot_AllAccess_BlockNonJumphostDevices",
  "s": "off",
  "u": "d6e7a686-bc33-40e3-9a4d-fd1d9f7b33ac;d591bed7-60bc-48a6-9023-ab8e859291ba",
  "g": 0,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "Singapore Block Onedrive",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "AllUsers_UnapprovedCountries_Block",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "LimitedUsers_EmailOnly_Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "mfa"
}, {
  "n": "AdminRoles_Everything_RequireMFA",
  "s": "ro",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AllUsers_AllAccess_BlockLegacy",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_Biosymm MFA Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "POC_EarlyAccess_Construct-Health MFA policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "POC_EarlyAccess_My-Integra MFA policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "POC_EarlyAccess_CA_BlockAllApps_Biosymm",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_CA_BlockAllApps_Construct-Health",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_CA_BlockAllApps_My-Integra",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "POC_EarlyAccess_EarlyAustralia MFA Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "mfa"
}, {
  "n": "LifeCare SharePoint Restrictions",
  "s": "off",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": ""
}, {
  "n": "AllUsers_AzureAppRegistrations",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "GuestAccess_Mobility_CA MFA Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "6 apps",
  "r": "mfa"
}, {
  "n": "GuestAccess_Mobility_CA BlockAllApps Policy",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "AllUsers_AllAccess_DataSov",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "AzureAD CA Staging V2",
  "s": "on",
  "u": "",
  "g": 4,
  "a": "All",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "AtlasAUUsers_NonProd_RequireAUIPs",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "AtlasAUUsers_Prod_RequireAUIPs",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "GuestAccess_ADA_CA_AllowADAAppsOnly",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "All",
  "r": "block"
}, {
  "n": "AdminRoles_Never_Persistent_Token",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": ""
}, {
  "n": "GuestAccess_ADA_CA MFA Policy",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "33 apps",
  "r": "mfa"
}, {
  "n": "AdminRoles_Risky_Sign-ins_MFA",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "mfa"
}, {
  "n": "AdminRoles_RiskyUsers_MFA_Password_Reset",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "mfa;passwordChange"
}, {
  "n": "Microsoft-managed: Multifactor authentication for per-user multifactor authentication users",
  "s": "on",
  "u": "690cff08-5735-497d-8a78-657ef8a66228;54343a72-487b-4e1b-9b62-c95f186f9919;9022d72e-3ba6-46e3-8408-5b599f42aa9f;b0d6993f-000a-4b4c-9d07-91d4d265d1f3;8dab1eec-c169-4f8f-b566-9ef0cb4649d6;c6336ea5-182d-4402-b146-958e098499f5;9360cc90-9d31-4044-ac86-a6b6cc7a2644;d1823e11-41e3-4ac4-9905-82eab5bd9e83;af058684-b191-4dd6-b2bd-633ac4c2c06d;b972abcc-6527-455f-a092-564cc1cdba16;294cb67b-c316-478f-b091-78f092469945;a3bcf597-ee2b-4a1c-90cb-f3e95c226586;ffe369d4-f8de-44d8-8a49-f56080b81cbc;1cea1751-61a4-4175-95ab-6efcbf5c8a8c;2f1fb3ae-4ffb-4731-93d7-83d21612dbfc;be1e89cf-cff5-4b97-ae5c-fc065825f4cd;ccb04fec-5e67-40c3-b9f8-b0f5ee4b6ae1;84195937-71c0-461e-b1bf-73a3bc2eaf04;c25a8d2b-f26b-4929-8490-eddad4715833;acfc6bc4-6cb4-433d-8700-5495079c2397",
  "g": 0,
  "a": "All",
  "r": ""
}, {
  "n": "Microsoft-managed: Multifactor authentication for admins accessing Microsoft Admin Portals",
  "s": "ro",
  "u": "",
  "g": 0,
  "a": "AdminPortals",
  "r": "mfa"
}, {
  "n": "CA-100 - All Users & Guests - All Apps - Legacy Protocols - Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-101 - All Users & Guests - All Apps - Allow - Require MFA",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;domainJoinedDevice"
}, {
  "n": "CA-102 - All Users & Guests - All Apps - Locations exc. AU, Corporate - Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-103 - All Users & Guests - All Apps - Any device exc. Android, iOS,  Windows, macOS - Block",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-104 - All Users & Guests - All Apps - High Sign In Risk - Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-200 - Org Users - Microsoft 365 - Windows, macOS - Client Apps - Allow - Require Hybrid or Compliance",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "CA-201 - Org Users - All Apps - Browser - BYOD - Allow - No Persistence",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": ""
}, {
  "n": "CA-203 - Org Users - All Apps - High User Risk - Allow - Require MFA &  Password Reset",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "mfa;passwordChange"
}, {
  "n": "CA-204 - Org Users - Entra Join - Allow - Require MFA",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "not set",
  "r": "mfa"
}, {
  "n": "CA-400 - Administrators - All Apps - Devices exc. Windows - Block",
  "s": "ro",
  "u": "",
  "g": 2,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-402 - Administrators - All Apps - Locations exc. DC - Block",
  "s": "ro",
  "u": "",
  "g": 2,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-403 - Administrators - All Apps - Allow - No Persistence--",
  "s": "on",
  "u": "",
  "g": 2,
  "a": "All",
  "r": ""
}, {
  "n": "CA-500 - Guests - All Apps - Locations exc. AU, Corporate - Block",
  "s": "on",
  "u": "",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-501 - Guests - All Apps - Locations exc. AU, Corporate - Block COPY",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-204 - Org Users - iChris - ATO Requirements - Allow - Require Hybrid",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "5 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-401 - Administrators - All Apps - Allow - Require Phish Resistant MFA",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "CA-205 - Org Users - iChris - ATO Requirements - Allow - Require MFA",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "5 apps",
  "r": ""
}, {
  "n": "CA-205 - Org Users - AllApps - ATO Requirements - Allow - No Persistence",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "CA-206 - SACA Users - Dynamics - Allow - Require Hybrid or Intune Compliant",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "CA-207 - SACA Users - Dynamics ? Block - NonAUIPs",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "AdminAccounts_RestrictInternetAccess_JumphostDevices",
  "s": "ro",
  "u": "dc0b9741-04e5-4736-b9de-c60c49dac398",
  "g": 0,
  "a": "4 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-207 - SACA Users - Dynamics ? Allow - Require AU",
  "s": "on",
  "u": "",
  "g": 6,
  "a": "1 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "GuestAccess_ADA_CA_AllowMyProfileOnly",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "Email Ingestion App Policy",
  "s": "ro",
  "u": "9eabae13-a1c5-4728-9b83-40e88373ea9e",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-105 - All Users & Guests - Block access from Bad IPs",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-208 ? Org Users ? Selected Apps ? Device Required",
  "s": "off",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-209 ? Org Users (LACs) ? Selected Apps ? Deny ? Outside Australia",
  "s": "off",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-360 - NDIS communities ? PAT - Require MFA - Allow",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "mfa"
}, {
  "n": "AllUsers_Office365Mobile_CompliantDeviceRollout_Reporting",
  "s": "ro",
  "u": "",
  "g": 5,
  "a": "Office365",
  "r": "compliantDevice;compliantApplication"
}, {
  "n": "AzureAD CA Staging V2 - Reporting",
  "s": "ro",
  "u": "",
  "g": 4,
  "a": "All",
  "r": "mfa;domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-208 ? Org Users ? Selected Apps ? Device Required - Reporting",
  "s": "ro",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-502 - Guests (Assure) - PowerBI - Locations exc. AU - Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-503 - Guests (Assure) - PowerBI - Require MFA - Allow",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "CA-504 - Guests (Assure) - PowerBI - Risky sign ins - Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "CA-362 - NDIS communities ? Promapp - Require MFA - Allow",
  "s": "on",
  "u": "d2dd0c36-778d-45d6-affc-4db7a216dc72;7fb242c7-8218-4f00-93fe-0be29ffa3c36;0c99932a-887d-4706-9531-1fc363e90cc5",
  "g": 0,
  "a": "1 apps",
  "r": "mfa"
}, {
  "n": "CA-364 - NDIS communities ? PowerBI - Require MFA - Allow",
  "s": "on",
  "u": "d2dd0c36-778d-45d6-affc-4db7a216dc72;7fb242c7-8218-4f00-93fe-0be29ffa3c36;3c57e0d8-8f74-44b5-811e-f71ff3c4b235;0c99932a-887d-4706-9531-1fc363e90cc5;d09a441c-a384-442d-b306-31e9c115b724;c67bb9db-434a-4a3c-b4a4-c90565483441",
  "g": 1,
  "a": "2 apps",
  "r": "mfa"
}, {
  "n": "CA-262 - All Users exc. NDIS & External ? Promapp - Require Managed devices - Allow",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "1 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-263 - All Users exc. NDIS & External ? PowerBI - Require Managed devices - Allow",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "zzADA_Block_Policy_Test_20250626",
  "s": "ro",
  "u": "6f259abd-c3ca-49bd-b1ff-21326f7c2040",
  "g": 0,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-404 - Administrators - Office 365_AVD - Allow - Token Protection",
  "s": "ro",
  "u": "",
  "g": 2,
  "a": "5 apps",
  "r": ""
}, {
  "n": "CA-361 - NDIS communities ? PAT - Location exc. AU ? Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-363 - NDIS communities ? Promapp - Location exc. AU ? Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-365 - NDIS communities ? PowerBI - Location exc. AU ? Block",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-260 - All Users exc. NDIS & External ? PAT - Require Managed devices - Allow",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "domainJoinedDevice"
}, {
  "n": "CA-261 - All Users exc. NDIS & External ? PAT - Location exc. AU ? Block",
  "s": "on",
  "u": "All",
  "g": 0,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-300 - EncompassCare Users ? Require MFA - Require Managed devices - Allow",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "compliantDevice;domainJoinedDevice"
}, {
  "n": "CA-106 - All Users & Guests - All Apps - Allow - Require Phish Resistant MFA",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": ""
}, {
  "n": "CA-366 - NDIS communities ? Dynamics - Location exc. AU ? Block",
  "s": "off",
  "u": "0c99932a-887d-4706-9531-1fc363e90cc5;c67bb9db-434a-4a3c-b4a4-c90565483441;3c57e0d8-8f74-44b5-811e-f71ff3c4b235",
  "g": 0,
  "a": "4 apps",
  "r": "block"
}, {
  "n": "CA-367 - All Users exc. NDIS & External ? Dynamics- Require Managed devices - Allow",
  "s": "on",
  "u": "802c205f-c95d-4327-b549-eb40adab51c2;0c99932a-887d-4706-9531-1fc363e90cc5;0ecb5407-62b6-41d1-8e33-89dc1f147567",
  "g": 1,
  "a": "All",
  "r": "mfa;domainJoinedDevice;compliantApplication"
}, {
  "n": "CA-APM-Kiosk-BlockNonWindows",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-BlockWebClient",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-RequireCompliantDevice",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "compliantDevice"
}, {
  "n": "CA-APM-Kiosk-WebOnly-Office",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-DeviceBound",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "3 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-BlockExchangeOnline",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "1 apps",
  "r": "block"
}, {
  "n": "CA-APM-Kiosk-BlockTeams",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "2 apps",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-RequireCompliantDevice",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "compliantDevice"
}, {
  "n": "CA-APM-KioskPB-BlockNonKioskDevices",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockNonWindows",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockLegacyAuth",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "None",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockAuthFlows",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-BlockRiskySignIn",
  "s": "on",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}, {
  "n": "CA-APM-KioskPB-WebOnlyOffice",
  "s": "ro",
  "u": "",
  "g": 1,
  "a": "All",
  "r": "block"
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "policies/ca-policies.js", error: String((e && e.message) || e) }); }

// policies/compliance-check.js
try { (() => {
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
  const UNIT_DAYS = {
    day: 1,
    days: 1,
    week: 7,
    weeks: 7,
    month: 30,
    months: 30,
    year: 365,
    years: 365,
    annual: 365,
    annually: 365
  };
  const NUMWORD = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    fourteen: 14
  };
  const norm = t => String(t).replace(/\r/g, '').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[ \t]+/g, ' ');

  // pull a readable sentence around a match so a finding can be evidenced
  function snippet(text, index, len) {
    const from = Math.max(0, text.lastIndexOf('.', index - 1) + 1);
    let to = text.indexOf('.', index + (len || 0));
    if (to < 0 || to - from > 420) to = Math.min(text.length, index + 240);
    return text.slice(from, to + 1).trim().replace(/\s+/g, ' ').slice(0, 400);
  }
  function findAll(text, re) {
    const out = [],
      r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    while (m = r.exec(text)) {
      out.push({
        i: m.index,
        s: m[0],
        m
      });
      if (out.length > 40) break;
    }
    return out;
  }

  // numeric tests: find "12 months", "60 days", "900 seconds" near a keyword.
  // Character-count rules go to charCountTest instead, because proximity is not good
  // enough for them - a site code and a passphrase both count characters, so the
  // credential noun must be ADJACENT to the number, not merely in the same window.
  function numericTest(text, rule) {
    const t = rule.test,
      hits = [];
    if (t.minChars != null) return charCountTest(text, t);
    const re = /(\b\d{1,5}|\bone|\btwo|\bthree|\bfour|\bfive|\bsix|\bseven|\beight|\bnine|\bten|\beleven|\btwelve|\bfourteen)[\s-]*(day|days|week|weeks|month|months|year|years|second|seconds|hour|hours|minute|minutes)\b/gi;
    let m;
    while (m = re.exec(text)) {
      const around = text.slice(Math.max(0, m.index - 160), m.index + 160);
      if (t.near && !t.near.test(around)) continue;
      const nRaw = m[1].toLowerCase();
      const n = NUMWORD[nRaw] != null ? NUMWORD[nRaw] : parseInt(nRaw, 10);
      const unit = m[2].toLowerCase();
      if (t.maxDays != null && UNIT_DAYS[unit]) {
        const days = n * UNIT_DAYS[unit];
        if (days > t.maxDays) hits.push({
          i: m.index,
          s: m[0],
          detail: `${m[0]} = ${days} days, policy maximum ${t.maxDays} days`
        });
      }
      if (t.maxSeconds != null) {
        const secs = /second/.test(unit) ? n : /minute/.test(unit) ? n * 60 : /hour/.test(unit) ? n * 3600 : null;
        if (secs != null && secs > t.maxSeconds) hits.push({
          i: m.index,
          s: m[0],
          detail: `${m[0]} = ${secs}s, policy maximum ${t.maxSeconds}s`
        });
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
    const hits = [],
      seen = new Set();
    const pats = [new RegExp(NOUN + '[^.]{0,60}?' + APPROX + NUMPAT + '\\s*characters?', 'gi'), new RegExp(APPROX + NUMPAT + '\\s*characters?[^.]{0,60}?' + NOUN, 'gi')];
    for (const re of pats) {
      let m;
      while (m = re.exec(text)) {
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
        if (n < t.minChars) detail = `"${whole.trim()}" - ${n} characters, policy minimum ${t.minChars}`;else if (approx) detail = `"${whole.trim()}" - an approximate length does not evidence the ${t.minChars}-character minimum`;
        if (!detail) continue;
        const key = m.index + '|' + n;
        if (seen.has(key)) continue;
        seen.add(key);
        hits.push({
          i: m.index,
          s: whole,
          detail
        });
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
      if (!inScope) {
        findings.push({
          rule,
          verdict: 'na',
          evidence: [],
          compensating: []
        });
        continue;
      }
      const comp = (rule.compensating || []).map(c => {
        const re = new RegExp(c, 'i');
        const m = re.exec(text);
        return m ? {
          pattern: c,
          quote: snippet(text, m.index, m[0].length)
        } : null;
      }).filter(Boolean);
      let verdict = 'met',
        evidence = [];
      const t = rule.test || {};
      if (t.kind === 'numeric') {
        const hits = numericTest(text, rule);
        if (hits.length) {
          verdict = 'conflict';
          evidence = hits.map(h => ({
            quote: snippet(text, h.i, h.s.length),
            detail: h.detail
          }));
        }
      } else if (t.kind === 'mustNotSay') {
        let hits = findAll(text, t.pattern);
        // a guard makes the match count only when the surrounding window is genuinely about
        // the subject - stops "DES" in a program name or "*.office.com" in a URL allow-list
        // being read as a deprecated cipher or a wildcard certificate
        if (t.guard) hits = hits.filter(h => t.guard.test(text.slice(Math.max(0, h.i - (t.window || 200)), h.i + (t.window || 200))));
        if (hits.length) {
          verdict = 'conflict';
          evidence = hits.slice(0, 4).map(h => ({
            quote: snippet(text, h.i, h.s.length),
            detail: `matched "${h.s}"`
          }));
        }
      } else if (t.kind === 'mustState') {
        const hits = findAll(text, t.pattern);
        if (!hits.length) verdict = 'gap';else evidence = hits.slice(0, 3).map(h => ({
          quote: snippet(text, h.i, h.s.length),
          detail: `states "${h.s}"`
        }));
      } else if (t.kind === 'pairing') {
        const a = findAll(text, t.a),
          b = findAll(text, t.b);
        if (a.length && !b.length) {
          verdict = 'gap';
          evidence = a.slice(0, 2).map(h => ({
            quote: snippet(text, h.i, h.s.length),
            detail: 'required companion statement not found'
          }));
        } else if (b.length) evidence = b.slice(0, 2).map(h => ({
          quote: snippet(text, h.i, h.s.length),
          detail: `states "${h.s}"`
        }));
      }
      if (verdict === 'conflict' && comp.length) verdict = 'compensated';
      findings.push({
        rule,
        verdict,
        evidence,
        compensating: comp
      });
    }
    const c = v => findings.filter(f => f.verdict === v).length;
    const assessed = findings.length - c('na');
    const summary = {
      conflict: c('conflict'),
      compensated: c('compensated'),
      gap: c('gap'),
      met: c('met'),
      na: c('na'),
      assessed,
      score: assessed ? Math.round((c('met') + c('compensated')) / assessed * 100) : 0
    };
    const result = {
      doc: opts.name || 'document',
      when: new Date().toISOString().slice(0, 10),
      summary,
      findings
    };
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
        out.push({
          envId: env.id,
          envName: env.name,
          source: env.source,
          id: ix.id,
          title: ix.title,
          note: ix.note,
          remedy: ix.remedy,
          evidence: hits.slice(0, 2).map(h => ({
            quote: snippet(text, h.i, h.s.length),
            detail: `touches "${h.s}"`
          }))
        });
      }
    }
    return out;
  }
  const ORDER = {
    conflict: 0,
    gap: 1,
    compensated: 2,
    met: 3,
    na: 4
  };
  function sortFindings(findings) {
    return [...findings].sort((a, b) => ORDER[a.verdict] - ORDER[b.verdict] || a.rule.id.localeCompare(b.rule.id));
  }

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
      L.push('');
      L.push(`== ${v.toUpperCase()} (${set.length}) ==`);
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
      L.push('');
      L.push(`== ENVIRONMENT INTERACTIONS (${r.interactions.length}) - advisory, not scored ==`);
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
  const api = {
    checkCompliance,
    checkInteractions,
    sortFindings,
    reportText
  };
  if (typeof window !== 'undefined') Object.assign(window, api);
  if (typeof module !== 'undefined') module.exports = api;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "policies/compliance-check.js", error: String((e && e.message) || e) }); }

// policies/compliance-rules.js
try { (() => {
// Machine-checkable rules derived from the APM policies in policies/.
// Each rule states: when it applies (scope), how to test a document, what compensating
// controls the policy itself accepts, and what to change to become compliant.
//
// test.kind:
//   numeric     extract number+unit near a keyword, compare against maxDays
//   mustState   if in scope, the document MUST contain one of these patterns
//   mustNotSay  if the document contains this, it conflicts with the policy
//   pairing     document says A but must also say B
window.COMPLIANCE_RULES = [
// ---------- Cryptography and Key Management Standard (09.03.027-5.0) ----------
{
  id: 'CRY-01',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a75 key rotation table',
  cat: 'Cryptography',
  title: 'Key rotation maximum age',
  requires: 'Production internet-facing or production data: 60 days. Production not internet-facing: 90 days. Non-production internet-facing: 90 days. Non-production: 180 days.',
  scope: /key vault|keyvault|secret|rotat(e|ion)|cryptographic key|private key/i,
  test: {
    kind: 'numeric',
    near: /rotat/i,
    maxDays: 60
  },
  compensating: ['published by design', 'displayed on the .{0,20}lock screen', 'device-bound', 'bound .{0,30}conditional access', 'no corporate (data|information)', 'single device', 'one physical'],
  remedy: 'Obtain a CISO ruling that account credentials are governed by the Identity and IT Access Management Standard rather than \u00a75 keying material, OR record an accepted risk in the RFFR SoA with the blast-radius argument, OR shorten the rotation interval to 60 days.'
}, {
  id: 'CRY-02',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a74.1 approved algorithms',
  cat: 'Cryptography',
  title: 'Minimum key sizes for approved algorithms',
  requires: 'AES 128 min (256 preferred, never ECB). RSA 2048 min (3072 preferred). ECC/ECDH/ECDSA \u2265224 bits. SHA-256/384/512. DH 2048 min, ephemeral only.',
  scope: /\b(rsa|aes|sha-?\d|ecdsa|ecdh|elliptic curve|diffie)\b/i,
  test: {
    kind: 'mustNotSay',
    pattern: /\b(rsa[- ]?1024|aes[- ]?64|sha-?1\b|md5|\bdes\b|3des|rc4|ecb mode)\b/i,
    guard: /encrypt|cipher|algorithm|hash|key size|signing|tls|certificate|cryptograph/i,
    window: 180
  },
  compensating: [],
  remedy: 'Replace any algorithm below the approved minimum. State the actual algorithm and key size in a settings table rather than leaving it to platform defaults.'
}, {
  id: 'CRY-03',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a75 PKI',
  cat: 'Cryptography',
  title: 'Wildcard certificates must not be used',
  requires: 'Due to increased risk, wildcard certificates must not be used.',
  scope: /certificate|x\.509|pki|tls/i,
  test: {
    kind: 'mustNotSay',
    pattern: /wildcard certificate|\*\.[a-z0-9-]+\.[a-z]{2,}/i,
    guard: /certificate|cert\b|x\.509|\bpki\b|issued by|certificate authority/i,
    window: 150
  },
  compensating: [],
  remedy: 'Replace the wildcard certificate with per-host certificates. Public-facing services use a commercial trusted CA; internal services use APM PKI.'
}, {
  id: 'CRY-04',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a74.2 TLS cipher suites',
  cat: 'Cryptography',
  title: 'TLS version and cipher suite must be stated and approved',
  requires: 'TLS 1.2 (16 named suites) or TLS 1.3 (4 named suites). Anonymous DH not permitted. Ephemeral variants only.',
  scope: /tls|https|mtls|mutual tls|cipher/i,
  test: {
    kind: 'mustState',
    pattern: /tls ?1\.[23]|tls_?(aes|ecdhe|dhe)/i
  },
  compensating: [],
  remedy: 'State the TLS version and the approved cipher suite list from \u00a74.2 explicitly, rather than relying on platform defaults. Confirm TLS 1.0/1.1 are disabled.'
}, {
  id: 'CRY-05',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a73 Authorisation',
  cat: 'Cryptography',
  title: 'Certificate issuance requires D&T Operations approval recorded in ITSM',
  requires: 'X.509 certificates and keying material must be requested and approved by the D&T Operations team, with the request recorded in the IT Service Management application.',
  scope: /certificate|scep|cloud pki|x\.509|code[- ]signing/i,
  test: {
    kind: 'mustState',
    pattern: /d&t operations|service management|itsm|servicenow|snow ticket|approved by .{0,40}operations/i
  },
  compensating: [],
  remedy: 'Add a line naming D&T Operations as the approver for certificate issuance and stating that the request is recorded in the ITSM tool.'
}, {
  id: 'CRY-06',
  doc: 'Cryptography and Key Management Standard',
  clause: '\u00a74.4 encryption in transit',
  cat: 'Cryptography',
  title: 'Internal and above must be encrypted in transit on every network',
  requires: 'Internal, Confidential and Restricted MUST use current ASD approved encryption over public/guest, corporate and secured networks alike.',
  scope: /in transit|transmit|network|traffic|egress/i,
  test: {
    kind: 'mustState',
    pattern: /encrypt|tls|https|ipsec|asd approved/i
  },
  compensating: [],
  remedy: 'State the transit encryption for every documented data path, including internal/corporate hops - the standard makes no exemption for corporate networks.'
},
// ---------- Windows SOE Hardening Standard V3.0 ----------
{
  id: 'SOE-01',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Win11 OS baseline - Min Device Password Length',
  cat: 'Endpoint & SOE',
  title: 'Minimum device password length is 14 characters',
  requires: 'Min Device Password Length = 14.',
  scope: /passphrase|password|credential/i,
  test: {
    kind: 'numeric',
    near: /(passphrase|password|credential|minimum device password)/i,
    minChars: 14
  },
  compensating: [],
  remedy: 'Constrain the generator so every credential is at least 14 characters and state the guaranteed minimum, not an approximate length.'
}, {
  id: 'SOE-02',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Win11 OS baseline - PowerShell Execution Policy',
  cat: 'Endpoint & SOE',
  title: 'PowerShell execution policy allows only signed scripts',
  requires: 'Execution Policy (Device) = Allow only signed scripts, with script block logging enabled.',
  scope: /powershell|\.ps1|script|remediation|runbook/i,
  test: {
    kind: 'mustState',
    pattern: /signed|code[- ]signing|signature/i
  },
  compensating: [],
  remedy: 'State that every device-side script is signed with the APM code-signing certificate, and name the certificate dependency as a build prerequisite.'
}, {
  id: 'SOE-03',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'USB Baseline - removable storage',
  cat: 'Endpoint & SOE',
  title: 'Removable storage is deny-all by default',
  requires: 'All Removable Storage classes: Deny all access = Enabled. Removable Disks: Deny write access = Enabled. BitLocker requires encryption on removable drives.',
  scope: /usb|removable|external drive|thumb drive/i,
  test: {
    kind: 'mustNotSay',
    pattern: /(deny write access[^.]{0,40}(disable|not configured)|removable[^.]{0,30}(enabled|permitted|allowed)|usb (storage )?(enabled|permitted|allowed))/i
  },
  compensating: ['autoplay', 'autorun', 'scan removable', 'block untrusted and unsigned processes', 'app ?control', 'application control', 'file explorer[^.]{0,40}removable', 'explicit approval', 'exception polic'],
  remedy: 'Removable media is administratively disabled by default under the Posture Statement \u00a74.3 with an explicit-approval path. Deliver the exception by assignment (exclude the device group from the estate USB baseline and assign a purpose-built exception profile), record the compensating controls, and cite the \u00a74.3 approval clause plus who granted it.'
}, {
  id: 'SOE-04',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'App Control for Business',
  cat: 'Endpoint & SOE',
  title: 'Application control must be enforced, and script enforcement is an open estate gap',
  requires: 'App Control Audit and Enforced policies, 18 trusted signers. Script Enforcement is DISABLED estate-wide and flagged in the standard for attention.',
  scope: /app ?control|application control|wdac|allow[- ]?list|executable/i,
  test: {
    kind: 'mustState',
    pattern: /script enforcement|enforced|enforce/i
  },
  compensating: ['asr', 'attack surface reduction', 'assigned access', 'no shell'],
  remedy: 'If application control is cited as a compensating control, enable script enforcement in the design variant - the estate policies have it off, so App Control alone does not constrain scripts carried in on removable media.'
}, {
  id: 'SOE-05',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Win11 OS baseline - remote access',
  cat: 'Endpoint & SOE',
  title: 'Remote Assistance, Remote Shell and inbound RDP are disabled',
  requires: 'Configure Offer/Solicited Remote Assistance = Disabled. Allow Remote Shell Access = Disabled. Allow users to connect remotely using Remote Desktop Services = Disabled.',
  scope: /remote (support|access|assistance|desktop|shell)|teamviewer|anydesk|vnc|screen ?share/i,
  test: {
    kind: 'mustNotSay',
    pattern: /teamviewer|anydesk|\bvnc\b|logmein|splashtop/i
  },
  compensating: ['attended', 'consent', 'mfa|multi-factor', 'per-device', 'file transfer disabled', 'session log', 'sentinel'],
  remedy: 'Prefer an approved path (Intune Remote Help or Defender live response), which removes the variation. If a third-party tool is retained, document the full access model and obtain explicit CISO acceptance as a variation to the estate remote-access position.'
}, {
  id: 'SOE-06',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Win11 OS baseline - Block user from showing account details on sign-in',
  cat: 'Endpoint & SOE',
  title: 'Account details must not be shown on the sign-in screen',
  requires: 'Block user from showing account details on sign-in = Enabled. Lock screen further hardened (no camera, no slide show, no app notifications).',
  scope: /lock screen|sign-?in screen|logon screen|wallpaper/i,
  test: {
    kind: 'mustNotSay',
    pattern: /(display|show|shown|shows)[^.]{0,60}(credential|passphrase|password|upn)/i,
    guard: /lock screen|sign-?in|logon|wallpaper/i,
    window: 200
  },
  compensating: ['per-device', 'device-bound', 'conditional access', 'unusable', 'no corporate', 'rotated'],
  remedy: 'Record as an argued deviation naming both this control and the clear desk and screen policy in the Posture Statement \u00a74.1, with the reason a displayed credential is safe here and the reason autologon was rejected. Obtain APM Cyber Security acceptance.'
}, {
  id: 'SOE-07',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Windows compliance policy',
  cat: 'Endpoint & SOE',
  title: 'Compliance policy must carry the nine device-health gates',
  requires: 'BitLocker, Secure Boot, Firewall, TPM, Antivirus, Antispyware, Defender Antimalware, security intelligence up to date, real-time protection - all Required.',
  scope: /compliance polic/i,
  test: {
    kind: 'pairing',
    a: /compliance polic/i,
    b: /secure boot/i
  },
  compensating: [],
  remedy: 'Mirror all nine staff gates in the design compliance policy. The standard records no minimum OS version as an open observation - closing it in your design exceeds the standard.'
}, {
  id: 'SOE-08',
  doc: 'Windows SOE Hardening Standard V3.0',
  clause: 'Win11 OS baseline - Interactive Logon Machine Inactivity Limit',
  cat: 'Endpoint & SOE',
  title: 'Machine inactivity limit is 900 seconds',
  requires: 'Interactive Logon Machine Inactivity Limit = 900.',
  scope: /inactiv|idle|timeout|sign-?out/i,
  test: {
    kind: 'numeric',
    near: /(inactiv|idle|timeout)/i,
    maxSeconds: 900
  },
  compensating: [],
  remedy: 'Set the inactivity limit to 900 seconds or lower. A shorter limit exceeds the standard and should be stated as such.'
},
// ---------- Cyber Security Posture Statement (09.01.033-5.0) ----------
{
  id: 'POS-01',
  doc: 'Cyber Security Posture Statement',
  clause: '\u00a74.2 Data Centres',
  cat: 'Governance',
  title: 'Data residency is Microsoft Australian Azure - Sydney and Melbourne',
  requires: 'All data held on APM managed infrastructure is stored in Microsoft Australian Azure, Sydney and Melbourne data centres.',
  scope: /azure|region|data cent|residency|tenant/i,
  test: {
    kind: 'mustNotSay',
    pattern: /\b(east us|west us|west europe|north europe|southeast asia|east asia|uk south|central us|australia central)\b/i,
    guard: /region|deploy|host|data cent|azure/i,
    window: 180
  },
  compensating: [],
  remedy: 'Host in Australia East (Sydney) or Australia Southeast (Melbourne) and state the region explicitly. Any other region breaches the stated residency position.'
}, {
  id: 'POS-02',
  doc: 'Cyber Security Posture Statement',
  clause: '\u00a74.3 Enterprise Asset Management',
  cat: 'Governance',
  title: 'Removable media requires explicit APM ICT stakeholder approval',
  requires: 'Access to removable media is administratively disabled on APM ICT assets. Explicit approval must be granted by APM ICT stakeholder(s) to allow access to APM approved removable media.',
  scope: /usb|removable/i,
  test: {
    kind: 'mustState',
    pattern: /explicit approval|approved by|exception polic|accepted risk|approval[^.]{0,30}(granted|obtained)/i
  },
  compensating: [],
  remedy: 'Cite this clause as the policy basis for the exception and record who granted the explicit approval and when. This converts the USB position from a defence into a citation.'
}, {
  id: 'POS-03',
  doc: 'Cyber Security Posture Statement',
  clause: '\u00a76.2 Remote Access',
  cat: 'Governance',
  title: 'Remote access requires APM VPN or approved VDI',
  requires: 'All remote access to the APM network requires APM VPN, or approval to use its VDI. Services monitored during use; all connections encrypted.',
  scope: /remote access|remote support|vpn|vdi/i,
  test: {
    kind: 'mustState',
    pattern: /vpn|virtual desktop|vdi|avd|approved|variation|accepted/i
  },
  compensating: ['monitored', 'encrypted', 'mfa|multi-factor', 'session log'],
  remedy: 'Use VPN or approved VDI, or document the alternative as an approved variation with monitoring and encryption evidence.'
}, {
  id: 'POS-04',
  doc: 'Cyber Security Posture Statement',
  clause: '\u00a75.2 Identity and Access Management',
  cat: 'Identity & Access',
  title: 'MFA, ISM-aligned complex passwords, inactivity session termination',
  requires: 'Aligned to the Identity and IT Access Management Standard: MFA, complex passwords aligned to ISM, session termination based on inactivity, need-to-know and least-privilege.',
  scope: /authenticat|sign-?in|identity|account|mfa/i,
  test: {
    kind: 'mustState',
    pattern: /mfa|multi-factor|passwordless|phishing-resistant|conditional access|compensating/i
  },
  compensating: ['conditional access', 'device-bound', 'compliant device', 'cannot satisfy', 'compensating control'],
  remedy: 'Where MFA cannot be satisfied (fixed-credential service accounts), state that explicitly and set out the compensating controls that replace the possession factor. Do not leave MFA unaddressed.'
}, {
  id: 'POS-05',
  doc: 'Cyber Security Posture Statement',
  clause: '\u00a74.1 Physical Security',
  cat: 'Governance',
  title: 'Clear desk and clear screen policy is enforced',
  requires: 'Clear desk and screen policy enforced through the Information Security Code of Practice.',
  scope: /screen|display|kiosk|wallpaper|lock screen/i,
  test: {
    kind: 'mustNotSay',
    pattern: /(display|show)[^.]{0,50}(password|passphrase|credential)/i,
    guard: /screen|display|kiosk|wallpaper/i,
    window: 200
  },
  compensating: ['per-device', 'device-bound', 'no corporate', 'rotated', 'conditional access'],
  remedy: 'If information is deliberately displayed on screen, argue it against this clause explicitly rather than leaving the contradiction to be found in review.'
},
// ---------- Continuous Monitoring Plan (09.03.021-5.0) ----------
{
  id: 'MON-01',
  doc: 'Continuous Monitoring Plan',
  clause: 'Penetration Testing',
  cat: 'Monitoring',
  title: 'Penetration testing prior to go-live, after material change, and annually',
  requires: 'Pen testing performed prior to a system going live; after material upgrades or modifications; generally annually. System owner approval required; schedule agreed with System Owners and approved by the CISO.',
  scope: /penetration test|pen ?test|security testing/i,
  test: {
    kind: 'mustState',
    pattern: /prior to (go|going) live|before (go|going) live|pre-?production|annual/i
  },
  compensating: [],
  remedy: 'State that penetration testing completes before the system goes live (not merely before wider rollout), name the System Owner who approves scope, and note the schedule is CISO-approved.'
}, {
  id: 'MON-02',
  doc: 'Continuous Monitoring Plan',
  clause: 'Vulnerability Management',
  cat: 'Monitoring',
  title: 'Continuous vulnerability monitoring via Defender and Wiz.io',
  requires: 'All APM systems are continuously monitored using Defender for Cloud and Defender for Endpoint. Wiz.io continuously monitors cloud service environments. Weekly Cyber/Digital Ops review meeting.',
  scope: /vulnerabilit|patch|monitor|defender|endpoint protection/i,
  test: {
    kind: 'mustState',
    pattern: /defender for endpoint|defender for cloud|wiz\.io|wiz\b/i
  },
  compensating: [],
  remedy: 'Name Defender for Endpoint onboarding for every device population in the design, including any in a separate tenant, and confirm cloud resources are onboarded to Wiz.io. Cross-tenant licensing and log flow must be designed, not assumed.'
}, {
  id: 'MON-03',
  doc: 'Continuous Monitoring Plan',
  clause: 'CONMON independence',
  cat: 'Monitoring',
  title: 'Assessment must be performed by personnel independent of the system',
  requires: 'CONMON activities conducted by the Cyber Security Team or personnel of similar skillset independent of the system being assessed; may be internal or third party.',
  scope: /assessment|vulnerability assessment|audit|review/i,
  test: {
    kind: 'mustState',
    pattern: /independent|third party|external|cyber security team/i
  },
  compensating: [],
  remedy: 'Name who performs the assessment and state their independence from the system owner.'
},
// ---------- Cyber Incident Response Plan (09.03.005-7.0) ----------
{
  id: 'IRP-01',
  doc: 'Cyber Incident Response Plan',
  clause: 'Containment step 9 / ISM 915c',
  cat: 'Incident Response',
  title: 'Personal or sensitive data incidents are notifiable to DEWR and ASD',
  requires: 'Where an incident affects an environment holding personal/sensitive data, the CIRT Manager and Data Owner notify the Department as Accreditation Authority ASAP via securitycompliancesupport@jobs.gov.au and notify ASD. No action affecting evidence integrity prior to ASD involvement (ISM 915c).',
  scope: /incident|compromis|breach|stolen|lost device|wipe|reset/i,
  test: {
    kind: 'mustState',
    pattern: /incident response plan|dewr|accreditation authority|asd|915c|notif/i
  },
  compensating: [],
  remedy: 'Reference the Cyber Incident Response Plan and the Theft / Loss of IT Asset playbook rather than inventing a procedure. State that automated response is limited to containment (disable the account) and that device wipe must not occur before ASD clearance.'
}, {
  id: 'IRP-02',
  doc: 'Cyber Incident Response Plan',
  clause: 'Reporting / Identification',
  cat: 'Incident Response',
  title: 'Incidents reported via APM Assist and logged in ServiceNow',
  requires: 'All staff must immediately report a real or potential incident using APM Assist. All incidents logged in a ServiceNow ticket; P1/P2 update the Major Cyber Security Incident Register.',
  scope: /incident|alert|escalat/i,
  test: {
    kind: 'mustState',
    pattern: /apm assist|servicenow|snow|major cyber security incident register|incident manager/i
  },
  compensating: [],
  remedy: 'Name the reporting path (APM Assist, ServiceNow) in the service management section so operational staff have a defined route.'
}, {
  id: 'IRP-03',
  doc: 'Cyber Incident Response Plan',
  clause: 'Retaining evidence',
  cat: 'Incident Response',
  title: 'Network traffic logs retained 7 days prior to incident discovery',
  requires: 'Network traffic logs retained for a period of seven days prior to the discovery of the incident; all retention or removal logged in the chain of custody document.',
  scope: /log retention|logging|retain|sentinel|log analytics/i,
  test: {
    kind: 'mustState',
    pattern: /\b(7|seven) days|\d+ days|\d+ ?day retention|retention/i
  },
  compensating: [],
  remedy: 'State log retention explicitly and confirm it exceeds 7 days for network traffic. The kiosk design already states 180 days for Sentinel and ZIA, which satisfies this.'
},
// ---------- Trusted Insider Program (09.03.020-6.0) ----------
{
  id: 'TIP-01',
  doc: 'APM Trusted Insider Program',
  clause: '\u00a73.2 Identity and Access Management',
  cat: 'Identity & Access',
  title: 'Privileged administration uses separate accounts with added complexity',
  requires: 'Staff performing privileged administration tasks use separate accounts with trusted insider and additional privileged account protections. Additional password complexity applied. Contractors held to the same controls.',
  scope: /privileged|administrator|admin account|elevated|local admin/i,
  test: {
    kind: 'mustState',
    pattern: /separate account|dedicated .{0,20}account|non-privileged|per-device .{0,20}account|paw|privileged access/i
  },
  compensating: [],
  remedy: 'Name the administrative accounts, confirm they are separate from standard accounts, and state the additional complexity and monitoring applied. Contractors get the same controls.'
}, {
  id: 'TIP-02',
  doc: 'APM Trusted Insider Program',
  clause: '\u00a73.3-3.4',
  cat: 'Identity & Access',
  title: 'Enterprise password manager and Purview Insider Risk Management',
  requires: 'IT Trusted Users provisioned access to an enterprise password management solution. Protective monitoring via external SOC; monitoring includes Microsoft Purview Insider Risk Management. Logging covers authentication events, endpoint protection alerts, internet browsing activity.',
  scope: /privileged|admin|password manager|credential store|insider/i,
  test: {
    kind: 'mustState',
    pattern: /password (manager|state|vault)|key vault|purview|insider risk|soc\b/i
  },
  compensating: [],
  remedy: 'State where privileged credentials are stored (enterprise password manager or Key Vault) and confirm the population is in scope for Purview Insider Risk Management and SOC monitoring.'
},
// ---------- Compliance Management Plan (09.03.055-1.2) ----------
{
  id: 'CMP-01',
  doc: 'Compliance Management Plan',
  clause: 'Statement of Applicability',
  cat: 'Governance',
  title: 'Controls and exclusions must appear in the RFFR Statement of Applicability',
  requires: 'The SoA lists all Annex A controls, states applicability, justifies inclusion/exclusion and references implementation. The RFFR SoA additionally covers DEWR contractual obligations and ISM controls.',
  scope: /exclu|exception|accepted risk|not applicable|deviation|compensating/i,
  test: {
    kind: 'mustState',
    pattern: /statement of applicability|\bsoa\b|rffr/i
  },
  compensating: [],
  remedy: 'Every exclusion or accepted risk claimed in the design must be recorded in the RFFR SoA with justification and implementation reference. Name the SoA in the design.'
}, {
  id: 'CMP-02',
  doc: 'Compliance Management Plan',
  clause: 'Annual compliance calendar',
  cat: 'Governance',
  title: 'Changes to the operating environment are notifiable to DEWR within 5 days',
  requires: 'Notify DEWR within 5 days of any changes to APM or subcontractor circumstances that may affect the risk profile, to enable re-categorisation.',
  scope: /new tenant|new subscription|internet-?facing|public endpoint|third party|subcontractor|new environment/i,
  test: {
    kind: 'mustState',
    pattern: /dewr|notif|5 days|five days|re-?categoris/i
  },
  compensating: [],
  remedy: 'Where the design introduces a new tenant, a new internet-facing endpoint or a new supplier, flag the 5-day DEWR notification as an implementation task and name the owner.'
}, {
  id: 'CMP-03',
  doc: 'Compliance Management Plan',
  clause: 'Governance and accountability',
  cat: 'Governance',
  title: 'Control validation quarterly; ISM updates reviewed quarterly',
  requires: 'Control owners validate implementation status, details and applicability quarterly. Published ISM updates reviewed each Mar, Jun, Sep, Dec with applicability and risk analysis.',
  scope: /control owner|validation|ism|review cadence|assurance/i,
  test: {
    kind: 'mustState',
    pattern: /quarterly|control owner|ism (update|version)|annual review/i
  },
  compensating: [],
  remedy: 'Name the control owner for each control the design introduces, and note that the design is re-checked against quarterly ISM updates.'
},
// ---------- Artificial Intelligence Policy (09.01.037-2.1) ----------
{
  id: 'AI-01',
  doc: 'Artificial Intelligence Policy',
  clause: 'Approval for use of AI',
  cat: 'Governance',
  title: 'AI use requires ELT sign-off, a business case and a privacy impact assessment',
  requires: 'AI use must be signed off by the ELT member for the business, with assessments by the regional Data Privacy and Digital leaders. Business case and privacy impact assessment required. Human in the loop for decision-making.',
  scope: /\b(ai|artificial intelligence|copilot|llm|generative|chatgpt|gemini|machine learning)\b/i,
  test: {
    kind: 'mustState',
    pattern: /elt|privacy impact|business case|approval|data privacy|human in the loop/i
  },
  compensating: ['ephemeral', 'no corporate data', 'public site', 'category filter', 'job seeker'],
  remedy: 'If the design permits, embeds or exposes AI, confirm with Data Privacy whether it constitutes APM use of AI requiring ELT sign-off and a privacy impact assessment. Record the outcome in the decision register.'
}, {
  id: 'AI-02',
  doc: 'Artificial Intelligence Policy',
  clause: 'Ongoing governance of AI use',
  cat: 'Governance',
  title: 'Every shared AI agent or use case has a named owner and appears in the Agent register',
  requires: 'Every shared AI agent, use case or deployment must have an explicitly assigned owner responsible for accuracy, relevance and maintenance. A central regional Agent register records purpose, owner and audience.',
  scope: /\b(ai agent|agent|copilot|assistant|automation with ai)\b/i,
  test: {
    kind: 'mustState',
    pattern: /owner|agent register|accountab/i
  },
  compensating: [],
  remedy: 'Name the owner of any AI agent or use case the design creates and add it to the regional Agent register.'
},
// ---------- Identity and IT Access Management Standard (09.03.035-5.0) ----------
{
  id: 'IAM-01',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a75 Clients Access Management',
  cat: 'Identity & Access',
  title: 'Client-use IT assets are segregated from APM IT systems and store no client information',
  requires: 'Client systems must not be connected to any non-public APM IT systems. No information created by the client is stored on the asset. Clients receive acceptable-use guidelines. APM employees must not use client-designated assets for APM duties.',
  scope: /participant|job ?seeker|client (device|system|computer|kiosk)|public[- ]area|kiosk/i,
  test: {
    kind: 'mustState',
    pattern: /not connect|blocked|cannot (access|reach)|segregat|isolat|no (corporate|apm) (data|information|system)|purge|deleted (on|at|every)/i
  },
  compensating: [],
  remedy: 'State how the fleet is disconnected from non-public APM systems (CA block, network segregation), how client-created information is destroyed, and where the participant acceptable-use guidance lives. This clause is also the policy basis for exempting client assets from staff-user controls - cite it when arguing a deviation.'
}, {
  id: 'IAM-02',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.1 / \u00a74.2.2 shared and generic accounts',
  cat: 'Identity & Access',
  title: 'Shared or generic accounts need an approved business justification and an allocation record',
  requires: 'Shared user IDs avoided unless business justification approved by the Cyber Security Team; never for sensitive applications. Generic accounts get minimum rights, no corporate-system access, a process identifying the user, password reset on membership change and at 12 months.',
  scope: /shared account|generic account|session account|kiosk account|communal|walk-?up/i,
  test: {
    kind: 'mustState',
    pattern: /business justification|approved by[^.]{0,40}cyber|one account per device|per-?device account|device-bound|no corporate|minimum rights|standard (local )?user/i
  },
  compensating: [],
  remedy: 'Record the Cyber-approved justification for the shared/anonymous account, keep it out of corporate systems, and state the per-device binding (or allocation record) that substitutes for user identification.'
}, {
  id: 'IAM-03',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.1.2 Multi-Factor Authentication (ISM-0417)',
  cat: 'Identity & Access',
  title: 'Single-factor authentication requires a minimum of 15 characters',
  requires: 'MFA authenticates all Users. Where a system cannot support MFA, single-factor authentication requires a minimum of 15 characters.',
  scope: /single[- ]factor|cannot support (mfa|multi-factor)|no mfa|without mfa|password-only/i,
  test: {
    kind: 'numeric',
    near: /single[- ]factor|password|credential/i,
    minChars: 15,
    notNear: /standard sets|minimum device password|hardening standard|complexity categor|standard user|policy minimum/i
  },
  compensating: [],
  remedy: 'Raise any single-factor credential to 15+ characters, or implement MFA. State the guaranteed minimum.'
}, {
  id: 'IAM-04',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.2.2 System Administrator \u00b68-9',
  cat: 'Identity & Access',
  title: 'Local administrator passwords, including LAPS-managed, are at least 30 characters and rotate every 30 days',
  requires: 'Default system administrator account passwords automatically changed every 30 days using LAPS. Passwords for Local Administrator accounts, including those managed by LAPS, must be at least 30 characters. Distinct per device. Guest disabled.',
  scope: /\blaps\b|local admin/i,
  test: {
    kind: 'numeric',
    near: /laps|local administrator|admin/i,
    minChars: 30,
    notNear: /standard sets|minimum device password|hardening standard|policy minimum|account-name limit/i
  },
  compensating: [],
  remedy: 'Set the LAPS policy PasswordLength to 30 or more and the rotation period to 30 days, and state both values in the settings table.'
}, {
  id: 'IAM-05',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.3 User Account Locks',
  cat: 'Identity & Access',
  title: 'Accounts lock after five failed logon attempts',
  requires: 'User accounts automatically locked after five failed logon attempts; unlocked only after the administrator proves the user\u2019s identity.',
  scope: /lockout|failed (logon|login|sign-?in)|brute[- ]force/i,
  test: {
    kind: 'mustState',
    pattern: /\b(five|5)\b[^.]{0,30}(failed|attempts)|lockout threshold|account lockout/i
  },
  compensating: ['no password|credential (is |)known to no|autologon|automatic logon'],
  remedy: 'State the lockout threshold (5) in the baseline table, or state why no lockable credential exists.'
}, {
  id: 'IAM-06',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.2.5 Account Deactivation',
  cat: 'Identity & Access',
  title: 'Accounts deactivate same-day on termination and after 30 days of inactivity',
  requires: 'On termination, the account is deactivated across all IT systems the same day the relationship ends. Accounts may also be deactivated on suspected malicious activity or after more than 30 days of inactivity.',
  scope: /deprovision|termination|leaver|offboard|account (deactivat|disabl|lifecycle)/i,
  test: {
    kind: 'mustState',
    pattern: /same day|30 days|inactivity|disabled (on|when|at)/i
  },
  compensating: [],
  remedy: 'State the deactivation trigger and timing for every account class the design creates, including service and support accounts.'
}, {
  id: 'IAM-07',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.4 Application Management',
  cat: 'Identity & Access',
  title: 'Application-control hash, publisher and path rules are validated annually',
  requires: 'Cryptographic hash rules, publisher certificate rules and path rules used for application control are validated annually. Standard users cannot uninstall or disable approved software. Unauthorised access to the authoritative software source is prevented.',
  scope: /app ?control|application control|wdac|allow[- ]?list/i,
  test: {
    kind: 'mustState',
    pattern: /annual|yearly|validated|review(ed)? (at least|every)/i
  },
  compensating: [],
  remedy: 'Add an annual validation of the App Control signer/hash/path rules to the service management calendar and name its owner.'
}, {
  id: 'IAM-08',
  doc: 'Identity and IT Access Management Standard',
  clause: '\u00a74.2.2 Service Accounts',
  cat: 'Identity & Access',
  title: 'Service accounts are managed identities or gMSA where possible, 30+ characters when interactive, with a named owner',
  requires: 'Service accounts created as group Managed Service Accounts, Virtual Accounts or Managed Identities where possible. Interactive service accounts (user objects) should have 30+ character passwords, changed on compromise indicators and at 12 months. Minimum permissions. Every service account has an owner.',
  scope: /service account|automation account|service principal|managed identity|workload identity/i,
  test: {
    kind: 'mustState',
    pattern: /managed identit|gmsa|group managed|virtual account|owner/i
  },
  compensating: [],
  remedy: 'Prefer a managed identity (no credential); otherwise state the 30-character minimum, the rotation triggers and the named owner for each service account.'
},
// ---------- Intrusion Detection and Prevention Standard (09.03.034-3.0) ----------
{
  id: 'IDPS-01',
  doc: 'Intrusion Detection and Prevention Standard',
  clause: '\u00a72 Host based Intrusion Detection',
  cat: 'Monitoring',
  title: 'EDR is mandatory on end user devices',
  requires: 'Endpoint Detection and Response technology must detect and prevent threats on end user devices: anti-malware, anti-spyware, behaviour analysis, rootkit and anomaly detection in a cloud-managed platform, plus a cloud heuristic engine for unknown strains.',
  scope: /endpoint|device (fleet|population)|workstation|laptop|kiosk|soe\b/i,
  test: {
    kind: 'mustState',
    pattern: /defender for endpoint|\bedr\b|endpoint detection|\bmde\b/i
  },
  compensating: [],
  remedy: 'Onboard every device population to Defender for Endpoint (or the approved EDR) and state the licence that carries it.'
}, {
  id: 'IDPS-02',
  doc: 'Intrusion Detection and Prevention Standard',
  clause: '\u00a72 Host based Intrusion Detection \u00b63',
  cat: 'Monitoring',
  title: 'End-user web traffic is inspected, logged and alerted',
  requires: 'For End User Computing devices, web traffic must be inspected, logged and alerted upon, with detection for malware, known malicious hosts, botnet and C2 infrastructure.',
  scope: /web (traffic|filtering|access)|internet access|browsing|url filter/i,
  test: {
    kind: 'mustState',
    pattern: /zscaler|inspect|url filter|ssl inspect|proxy|web filter/i
  },
  compensating: [],
  remedy: 'Name the web-inspection layer (Zscaler at APM), its logging destination and who receives the alerts.'
}, {
  id: 'IDPS-03',
  doc: 'Intrusion Detection and Prevention Standard',
  clause: '\u00a72 Email Gateways \u00b63',
  cat: 'Monitoring',
  title: 'Webmail is blocked at APM - email only through Outlook on APM devices',
  requires: 'All webmail is blocked at APM; email may only be accessed through the approved mail application (Microsoft Outlook) on APM devices, to maintain data control and limit loss through third-party email applications.',
  scope: /webmail|personal (e-?)?mail|gmail|hotmail|outlook\.com/i,
  test: {
    kind: 'mustNotSay',
    pattern: /(webmail|personal (e-?)?mail|gmail|hotmail)[^.]{0,80}(allow|permit|open|reachable|accessible|stays open|remains? (open|reachable))/i,
    guard: /mail/i,
    window: 160
  },
  compensating: ['client (device|system|asset)', 'participant', 'job ?seeker', 'not connected to[^.]{0,40}apm it systems', 'no (apm|corporate) (data|mailbox|account)', 'clients access management'],
  remedy: 'Webmail on an APM staff device conflicts with this standard outright. On a client-designated asset, argue the Identity and IT Access Management Standard \u00a75 carve-out explicitly: the device is not connected to APM IT systems, holds no corporate mailbox, and the user is a client, not a User.'
}, {
  id: 'IDPS-04',
  doc: 'Intrusion Detection and Prevention Standard',
  clause: '\u00a72 Reporting and responding / Log and event correlation',
  cat: 'Monitoring',
  title: 'Logs and alerts flow to the 24/7 external SOC and the SIEM',
  requires: 'Logs and alerts from APM devices go to the external 24/7 SOC. Host-based intrusion prevention alerts the APM Cyber Security Team directly. A SIEM correlates alerts and events from endpoints and gateways.',
  scope: /siem|sentinel|\bsoc\b|security operations|alert/i,
  test: {
    kind: 'mustState',
    pattern: /sentinel|siem|\bsoc\b|security operations centre?/i
  },
  compensating: [],
  remedy: 'Route every telemetry source the design creates into Sentinel and state which alerts reach the SOC versus the Cyber Security Team directly.'
},
// ---------- Identity Protection Standard (09.03.044-4.0) ----------
{
  id: 'IDP-01',
  doc: 'Identity Protection Standard',
  clause: 'Defender for Identity',
  cat: 'Identity & Access',
  title: 'Defender for Identity is mandatory on all APM Domain Controllers',
  requires: 'Microsoft Defender for Identity monitors all Active Directory activity; mandatory on all APM Domain Controllers; logs to Sentinel for SOC review and alerting.',
  scope: /domain controller|ad ds\b|active directory domain services|new (dc|domain)/i,
  test: {
    kind: 'mustState',
    pattern: /defender for identity|\bmdi\b/i
  },
  compensating: ['no (ad ds|domain controller|active directory)', 'entra[- ]joined only|entra id join'],
  remedy: 'Any design that stands up or touches AD DS domain controllers must include the Defender for Identity sensor on them. Cloud-native (Entra-only) designs state that no DC exists, which makes this standard not applicable.'
},
// ---------- Risk Management Framework (01.01.004-8.3) ----------
{
  id: 'RMF-01',
  doc: 'Risk Management Framework',
  clause: '\u00a73.3 Risk Assessment / Appendices A-D',
  cat: 'Governance',
  title: 'Risk assessments use the APM methodology: likelihood, consequence, controls, residual rating',
  requires: 'Risks are analysed with the APM likelihood scale (Rare to Almost Certain, 1-5), consequence table (Insignificant to Severe, 1-5), inherent rating from the matrix, control effectiveness rating, and a residual rating mapped back to the matrix (Negligible / Minor / Moderate / High / Extreme).',
  scope: /risk register|risk assessment|residual risk|inherent risk/i,
  test: {
    kind: 'mustState',
    pattern: /likelihood|consequence|residual/i
  },
  compensating: [],
  remedy: 'Rate each register entry with likelihood and consequence on the APM 1-5 scales and state the residual rating after controls, so the register can transfer into Clew without re-assessment.'
}, {
  id: 'RMF-02',
  doc: 'Risk Management Framework',
  clause: '\u00a73.4 Risk Evaluation / Appendix E',
  cat: 'Governance',
  title: 'High and Extreme residual risks need treatment plans and named acceptance authority',
  requires: 'Extreme and High residual risks are generally not acceptable: treatment to a target rating within an agreed timeframe. Acceptance of Extreme only by the Board, High only by the ARC, Moderate by the responsible Executive, Minor by the business unit head. Every risk has an owner and appears in a risk register.',
  scope: /accepted risk|risk acceptance|extreme risk|high risk|risk treatment/i,
  test: {
    kind: 'mustState',
    pattern: /owner|accept(ed|ance) by|treatment|target (rating|risk)/i
  },
  compensating: [],
  remedy: 'Name the risk owner and the acceptance authority matching the residual rating (Board for Extreme, ARC for High, Executive for Moderate). An untreated High risk without ARC acceptance cannot ship.'
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "policies/compliance-rules.js", error: String((e && e.message) || e) }); }

// policies/environment-config.js
try { (() => {
// APM environment register - what is actually configured in the tenant and estate.
// Distinct from compliance-rules.js (what policy demands): these entries describe live
// configuration, and each carries `interactions` - advisory triggers that fire when a
// design touches something this configuration affects. Interactions never fail a
// compliance run; they surface as a "check this" list with the specific remedy.
window.ENVIRONMENT_CONFIG = [{
  id: 'ENV-ESLZ',
  name: 'Azure Enterprise-Scale Landing Zone (APAC)',
  source: 'APM Azure Landing Zone (APAC) - DetailedDesign v1.1 (uploads/) and the ESLZ Reference Corpus (reference/eslz/, 4 parts)',
  cat: 'Configuration',
  owner: 'Head of Digital Transformation and Architecture',
  appliesWhen: {
    min: 3,
    any: [/aus-sub-|azure subscription|subscription (id|scope|placement)/i, /\bvnet\b|virtual network/i, /resource group/i, /management group/i, /azure policy|policy initiative/i, /route table|user[- ]defined route|\budr\b/i, /network security group|\bnsg\b/i, /private endpoint|private dns zone/i, /availability (set|zone)/i, /10\.[45]\d\.\d+\.\d+/, /auea-|ause-/i, /peering|hub-spoke/i]
  },
  facts: [['Topology', 'Hub-spoke, Australia East (10.40.0.0/16) and Australia Southeast (10.50.0.0/16). All spokes peer to the regional connectivity hub; Sandbox and Acquisitions do not peer.'], ['Management groups', 'AUS-MG-PLATFORM (CONNECTIVITY, IDENTITY, SECURITY, MANAGEMENT), AUS-MG-PROD/DEV/SIT/UAT-CONTROLLED and -STANDARD, AUS-MG-ACQUISITIONS, AUS-MG-SANDBOX. Security domains: controlled and standard.'], ['Subscriptions', 'aus-sub-connectivity, -identity, -management, -{prod|dev|sit|uat}-{controlled|standard}-001, -avd-controlled-001, -sandbox-001, -acquisitions-001.'], ['AVD spoke', 'aus-sub-avd-controlled-001 / auea-vnet-avd-ctrl-001 = 10.40.88.0/23, Australia East, controlled domain - the landing place for the AVD SOEs.'], ['DNS', 'Azure DNS Private Resolver in the connectivity subscription; AD DS domain controllers in aus-sub-identity (auea-vnet-identity-001 10.40.4.0/24 / ause 10.50.4.0/24).'], ['Public IPs', 'Azure Policy denies public IP creation in all management groups except the connectivity subscription (Design Decision 17).'], ['RBAC', 'PIM-managed, eligible time-bound Role-Admin-AzureMG* groups per management group; no standing access.'], ['Compliance frame', 'MCSB, RFFR, ISM, APM Policy named as certification targets.'], ['Subscription count', 'Design says 13, the as-built placement table lists 15 rows including AVD, and the policy baseline assigns ASC Default to "all 15". UNRECONCILED - present all three, never pick one silently.'], ['Actually deployed', 'Hub, identity, management, prod-controlled and prod-standard only (40 subnets). Dev, SIT, UAT, AVD, sandbox and acquisitions spokes are designed, not deployed.'], ['Placement anomalies', 'Three, preserved from the as-built table: sandbox shown directly under APM not AUS-MG-SANDBOX; acquisitions shown under AUS-MG-SANDBOX; AVD absent from the 13-subscription design table and shown directly under APM.'], ['Archetype sizing', 'Connectivity /23 (507 usable), Identity /24 (251), Production /22 (1019) per security domain, Dev/SIT/UAT /23 each per domain, Sandbox /24, Management /24 at x.255.0/24, AVD /23. Every VNet carries reserved additional CIDRs for contiguous growth. Unallocated in AUEA: 10.40.96-247.'], ['Mandatory tags', '13: Criticality, application-id, business-service, apm-security-domain, environment, owner, technicalcontact, cost-centre, operationalteam, service-component-type, backup, enableupdate, update-stage. Two drive automation silently: backup (BasicVMBackup / StandardVMBackup / StandardSQLVMBackup / StandardSQLVM(OS)Backup enrol into BK01-BK08) and update-stage (Lead / auto-patch01 / auto-patch02 select the AUM maintenance configuration).'], ['Policy baseline', '218 assignments: 175 policies + 43 initiatives; 32 custom, 186 built-in; enforcement mode Default on all. Scope split: APM intermediate root 99, AUS-MG-PLATFORM 8, AUS-MG-REGION 7, AUS-MG-SANDBOX 1, individual subscriptions 103. Stream01 (16 Dec 2025) 202, Stream03 (17 Jul 2026) 16.'], ['RBAC expiry', 'Every management-group role assignment is PIM-eligible and time-bound, all expiring November 2026, in an estate where PIM was formally excluded from the phase (DD6/DD10). Renewal process is UNKNOWN - no corpus file owns it.'], ['Log retention', 'Operational Log Analytics workspace 90 days, security workspace 30 days. NFR 9.9 requires 180 days queryable. Standing non-compliance at RFFR PROTECTED.'], ['Operating model', 'DD69 ratifies portal-managed policy. The AI landing zone assumes everything-as-code with no portal changes. Unresolved collision.'], ['Inbound north-south', 'Required but NOT enabled at handover, pending an external Azure load balancer and route table. The first designed inbound flow (SmartRecruiters webhook via App Gateway WAF_v2 to the N-S NVA to APIM) is unreconciled with that provision.']],
  interactions: [{
    id: 'ENV-ESLZ-1',
    title: 'New Azure resources must land in the right spoke with allocated CIDR',
    trigger: /new (vnet|virtual network|subnet)|deploy(ed|ing)? (in|into|to) azure|function app|logic app|key vault|storage account|azure (vm|virtual machine)/i,
    note: 'Workloads land in the spoke matching their environment and security domain (controlled vs standard); CIDRs are allocated from the ESLZ plan, not invented; Sandbox cannot reach anything.',
    remedy: 'Name the target subscription and VNet from the ESLZ table, request the subnet CIDR from the platform team, and name every resource per the Azure ESLZ Naming Standard (ENV-NAMING).'
  }, {
    id: 'ENV-ESLZ-2',
    title: 'Public IPs are policy-denied outside connectivity',
    trigger: /public (ip|endpoint)|internet-?facing|inbound (traffic|access|connection)/i,
    guard: /azure|vnet|subscription|endpoint/i,
    window: 200,
    note: 'Azure Policy denies public IP creation everywhere except aus-sub-connectivity. Inbound paths go through the North-South Palo Alto set (external LB + UDR), not a workload-attached public IP.',
    remedy: 'Design ingress via the connectivity hub (Application Gateway / N-S firewall). If a workload genuinely needs its own public IP, raise the policy exemption as a decision-register row with the rejection reasons for the hub path.'
  }, {
    id: 'ENV-ESLZ-3',
    title: 'An AVD spoke is designed but not deployed',
    trigger: /\bavd\b|azure virtual desktop|session host|host pool/i,
    note: 'aus-sub-avd-controlled-001 / auea-vnet-avd-ctrl-001 (10.40.88.0/23) is allocated in the controlled domain and appears in the as-built placement table, but the deployed spoke set is hub, identity, management, prod-controlled and prod-standard only. The AVD spoke is PLANNED.',
    remedy: 'Target the allocated AVD spoke rather than requesting a new subscription, size subnets within the /23, and state its deployment as a dependency, not as existing infrastructure.'
  }, {
    id: 'ENV-ESLZ-4',
    title: 'Management-group role assignments expire November 2026',
    trigger: /role assignment|\brbac\b|management group scope|\bpim\b|privileged identity|eligible (role|assignment)/i,
    note: 'Every MG-level role assignment is PIM-eligible and time-bound, all expiring November 2026, in an estate where PIM was formally excluded from the phase (DD6/DD10). The renewal process is UNKNOWN - no corpus file owns it.',
    remedy: 'Acknowledge the expiry explicitly in the identity section, state whether this design depends on an MG-scope assignment, and name the owner who will renew it. A design that creates MG-scope assignments without this acknowledgement is incomplete.'
  }, {
    id: 'ENV-ESLZ-5',
    title: 'Most spokes are designed, not deployed',
    trigger: /spoke|workload subscription|landing zone subscription|target (vnet|subscription)/i,
    note: 'Deployed: hub, identity, management, prod-controlled, prod-standard (40 subnets). Planned only: dev, SIT, UAT, AVD, sandbox, acquisitions, and 5 of the 8 AI Foundry workload spokes.',
    remedy: 'State the deployment status of every spoke the design targets. If it is planned, it is a dependency with an owner and a date, not infrastructure - and the design must not describe it in the present tense.'
  }, {
    id: 'ENV-ESLZ-6',
    title: 'Deployed log retention is below the 180-day NFR',
    trigger: /log analytics|retention|\blaw\b|workspace|sentinel|180 days|audit log/i,
    guard: /azure|log|retention|workspace/i,
    window: 200,
    note: 'Operational workspace retains 90 days, security workspace 30. NFR 9.9 requires 180 days queryable. This is a standing non-compliance at RFFR PROTECTED with no named owner beyond "security team to adjust".',
    remedy: 'State which workspace the design logs to, its actual retention, and whether NFR 9.9 is met or breached. Do not claim 180-day compliance while targeting a 90- or 30-day workspace.'
  }, {
    id: 'ENV-ESLZ-7',
    title: 'DR posture is unreconciled',
    trigger: /disaster recovery|\bdr\b|regional pair|secondary region|australia ?southeast|failover|geo-?redundan|\bgrs\b/i,
    note: 'The deployed baseline actively builds Australia Southeast as regional pair (VNets, GRS+CRR vaults, domain controllers). A single-region multi-zone decision paper is believed ratified but has never been ingested. UNRECONCILED.',
    remedy: 'State which posture the design assumes as an explicit assumption with its risk, cite both sources, and name the owner who will resolve it. Do not silently prefer either.'
  }, {
    id: 'ENV-ESLZ-8',
    title: 'Two tags silently drive backup and patching',
    trigger: /\bvm\b|virtual machine|compute|workload deploy|tag(ging|s)?\b/i,
    guard: /azure|deploy|resource|workload/i,
    window: 200,
    note: '13 mandatory tags apply. backup (BasicVMBackup / StandardVMBackup / StandardSQLVMBackup / StandardSQLVM(OS)Backup) enrols the VM into policies BK01-BK08. update-stage (Lead / auto-patch01 / auto-patch02) selects the Azure Update Manager maintenance configuration. A VM missing either is unprotected and unpatched without erroring.',
    remedy: 'Put all 13 tag values in a table in the design, and argue backup and update-stage explicitly rather than leaving them to build time.'
  }, {
    id: 'ENV-ESLZ-9',
    title: 'CIDRs come from the archetype sizing rules, not from preference',
    trigger: /\/\d{2}\b|cidr|address (space|plan|range)|subnet mask|supernet/i,
    guard: /azure|vnet|spoke|subnet|10\.4|10\.5/i,
    window: 200,
    note: 'Supernets 10.40.0.0/16 (AUEA) and 10.50.0.0/16 (AUSE), symmetric mirror. Connectivity /23, Identity /24, Production /22 per security domain, Dev/SIT/UAT /23 each, Sandbox /24, Management x.255.0/24. Every VNet carries a reserved adjacent block for contiguous growth. Unallocated AUEA space: 10.40.96-247. Sandbox may deliberately overlap because it is never peered.',
    remedy: 'Request the CIDR against the archetype rule, name the reserved growth block adjacent to it, and record any deviation as a decision-register row with options assessed.'
  }, {
    id: 'ENV-ESLZ-10',
    title: 'Policy-as-code collides with the ratified operating model',
    trigger: /policy[- ]as[- ]code|infrastructure as code|\bbicep\b|terraform|gitops|no portal changes|deployment pipeline/i,
    note: 'DD69 ratifies portal-managed policy for the 218 assignments. The AI landing zone design assumes everything-as-code with no portal changes. Neither side has won; this is the single largest codification blocker.',
    remedy: 'State which operating model this design follows and flag the collision as an open item with the design authority as owner. Do not assume the newer document supersedes.'
  }, {
    id: 'ENV-ESLZ-11',
    title: 'Inbound north-south is provisioned but not enabled',
    trigger: /inbound|ingress|webhook|public endpoint|application gateway|app ?gw|\bwaf\b|internet-?facing/i,
    guard: /azure|hub|firewall|spoke|apim/i,
    window: 220,
    note: 'Inbound N-S inspection is required but was NOT enabled at handover, pending an external Azure load balancer and route table. The first designed inbound flow (Internet to App Gateway WAF_v2 to N-S NVA to APIM) is unreconciled with that provision.',
    remedy: 'State the inbound path explicitly, mark it as depending on inbound N-S being enabled, and reconcile it against the external-LB provision rather than assuming one of the two.'
  }]
}, {
  id: 'ENV-PALO',
  name: 'Palo Alto VM-Series hub firewalls',
  source: 'Palo Alto Firewall Deployment As-Built V1.0 (uploads/, Stratus Phase 3)',
  cat: 'Configuration',
  owner: 'Digital Operations (managed network delivery team)',
  appliesWhen: {
    min: 3,
    any: [/aus-sub-|azure subscription/i, /\bvnet\b|virtual network/i, /hub firewall|security policy rule|panorama|vm-series/i, /route table|user[- ]defined route|\budr\b/i, /network security group|\bnsg\b/i, /peering|hub-spoke/i, /auea-|ause-/i, /10\.[45]\d\.\d+\.\d+/]
  },
  facts: [['Placement', 'North-South and East-West VM-Series clusters in the connectivity hub of each region behind Azure Load Balancers (no PAN HA; LB health probes). AE: 2+2 firewalls; ASE: 1+1.'], ['Inspection', 'All north-south (internet, on-premises) and east-west (inter-VNet, same region) traffic is UDR-forced through the firewalls. Default interzone AND intrazone rules overridden to drop + log.'], ['Egress', 'Outbound HTTP rides IPSEC tunnels from the firewalls to Zscaler; non-HTTP is SNATed out the public interfaces. Outbound is allow-listed by URL category and application; proxy-avoidance and anonymizers blocked and logged.'], ['Backhaul', 'Meraki SD-WAN (vMX in the legacy AE landing zone) advertises BGP routes; inspected traffic forwards to the active vMX.'], ['Management', 'Panorama HA (AE active, ASE passive), template stacks + device groups; config changes only via Panorama. SAML (Entra ID) auth with a local break-glass account; admin access only from the high-privileged jump host.'], ['Logging', 'Firewalls to Panorama (2TB rolling disks), then syslog to Microsoft Sentinel via a syslog VM.'], ['Open items', 'Firewall DNS and NTP servers are TBC pending the Infrastructure Team decision. Advanced ACL migration deferred to APM.']],
  interactions: [{
    id: 'ENV-PALO-1',
    title: 'New egress needs Palo security-policy (and possibly NAT) rules',
    trigger: /egress|outbound (traffic|access|connection)|allow[- ]?list|fqdn|reach(es|ing)? the internet|calls? out to/i,
    guard: /azure|vnet|spoke|cloud|subscription/i,
    window: 250,
    note: 'Nothing leaves an Azure spoke without matching a firewall allow rule - outbound is category- and application-allow-listed, dropped by default.',
    remedy: 'List the destination FQDNs, ports and applications in the design (\u00a75.3 named egress) so the Panorama change can be raised verbatim; do not write "standard internet access".'
  }, {
    id: 'ENV-PALO-2',
    title: 'Zscaler tunnels already terminate on the hub firewalls',
    trigger: /zscaler.{0,80}(tunnel|ipsec)|ipsec.{0,80}zscaler|new (ipsec )?tunnel/i,
    note: 'The hub firewalls hold the IPSEC tunnels to Zscaler for Azure-sourced HTTP egress. Site networks tunnel to Zscaler separately via the managed network provider - two distinct tunnel sets.',
    remedy: 'State which tunnel set carries the design\u2019s traffic. A new site or VLAN rides the site tunnels; a new Azure workload rides the hub firewall tunnels - neither needs a new tunnel by default.'
  }, {
    id: 'ENV-PALO-3',
    title: 'DNS and NTP for hub infrastructure are still undecided',
    trigger: /dns (server|resolver|forward)|name resolution|\bntp\b|time (sync|source)/i,
    guard: /azure|hub|firewall|infrastructure/i,
    window: 250,
    note: 'The as-built records firewall DNS/NTP as TBC pending the Infrastructure Team. The resolver of record for spokes is the Azure DNS Private Resolver in connectivity.',
    remedy: 'State the resolver the design actually uses (Private Resolver inbound endpoint for Azure; site DHCP-issued DNS for devices) and flag any dependency on the undecided infrastructure DNS/NTP as an open item with the Infrastructure Team as owner.'
  }]
}, {
  id: 'ENV-NAMING',
  name: 'Azure ESLZ Naming Standard',
  source: 'Azure ESLZ Naming Standards - 17 July 2026 (uploads/)',
  cat: 'Configuration',
  owner: 'Digital Operations',
  appliesWhen: {
    min: 3,
    any: [/aus-sub-|azure subscription/i, /\bvnet\b|virtual network/i, /resource group/i, /management group/i, /storage account/i, /recovery services vault/i, /network security group|\bnsg\b/i, /auea-|ause-/i, /private endpoint/i]
  },
  facts: [['General form', '[region]-[type]-[environment]-[apm security domain]-[descriptor]-[instance], e.g. auea-rg-prod-ctrl-appname-001, ause-nsg-prod-std-web-001. Regions: auea / ause (short: ae / as).'], ['Compact forms', 'VMs and storage use shortform concatenation: aevmpadds001, aestpcappname001, aestxflowlog001. Palo resources always carry "palo" in the RG name.'], ['Management groups', 'ALL CAPS: AUS-MG-[SCOPE]. Subscriptions all lower with full security-domain word: aus-sub-prod-controlled-01.'], ['NSG rules', '[allow|deny]-[ib|ob]-[source]-to-[destination]-[descriptor]-[nn], e.g. allow-ob-azmonitor-to-law-https-01.'], ['Device/Intune objects', 'Separate schema - the APM Intune Naming Schema V1.0 governs Intune policies, groups and device names (already applied in our designs).']],
  interactions: [{
    id: 'ENV-NAMING-1',
    title: 'Azure resource names must follow the ESLZ standard',
    trigger: /resource group|\bvnet\b|virtual network|\bnsg\b|route table|log analytics|recovery services|private endpoint|storage account/i,
    guard: /azure|deploy|creat/i,
    window: 250,
    note: 'Every Azure object in a design is named per the ESLZ standard, including NSG rule names - reviewers reject invented formats.',
    remedy: 'Write the exact names into the design settings tables using the [region]-[type]-[env]-[domain]-[descriptor]-[instance] form; check the compact VM/storage forms for those two types.'
  }]
}, {
  id: 'ENV-TENANT',
  name: 'APM corporate tenant - estate Intune and Entra behaviour',
  source: 'Working knowledge from the Participant Kiosk gap analysis (G-18/19/20) and the SOE Hardening Standard',
  cat: 'Configuration',
  owner: 'APM Digital',
  facts: [['Broad assignments', 'Corporate policies, apps and scripts assigned to All Devices / All Users / broad dynamic groups land on every Entra-joined device unless the device group is excluded.'], ['Password expiry', 'The estate baseline sets a maximum password age on local accounts - it breaks device-local autologon accounts unless the account is exempted and the device group excluded from the policy.'], ['Delivery Optimization', 'Estate DO policy has no group boundary on Entra-joined devices; without a boundary set every device pulls its own update payload over the site WAN link.'], ['Update management', 'Estate Windows Update rings and Patch My PC exist; new device populations join existing rings rather than creating parallel ones.'], ['App Control', 'Estate WDAC/App Control policies exist with script enforcement DISABLED; fleet variants may enable it (the kiosk does).'], ['Conditional Access', 'Tenant CA policy set exists; new device populations need an exclusion sweep and, where blocking is the intent, a device-filter policy.']],
  interactions: [{
    id: 'ENV-TENANT-1',
    title: 'Local accounts hit the estate password-expiry baseline',
    trigger: /local (standard )?(user )?account|auto[- ]?log(on|in)|session account/i,
    note: 'The inherited baseline\u2019s maximum password age applies to local accounts and will break automatic logon fleet-wide on one day.',
    remedy: 'Exempt the account explicitly (PasswordExpires = False), exclude the device group from the estate expiry policy, and add a test that advances the clock past the maximum age.'
  }, {
    id: 'ENV-TENANT-2',
    title: 'New device population needs the corporate-assignment exclusion sweep',
    trigger: /new (dynamic )?(device )?group|dynamic membership|device population|fleet|enrolment profile|autopilot/i,
    note: 'Everything targeting All Devices / All Users lands on the new fleet unless excluded - the single largest configuration risk for special-purpose devices.',
    remedy: 'Enumerate every corporate assignment (policies, apps, scripts, CA) and record per item: applies, excluded, or replaced by a fleet variant. Put the table in the design, not a wiki.'
  }, {
    id: 'ENV-TENANT-3',
    title: 'Delivery Optimization needs a group boundary for any multi-device site',
    trigger: /delivery optimization|update (payload|download|bandwidth)|20 ?mbps|site (wan|link|bandwidth)/i,
    note: 'Without DOGroupId + group download mode, every device at a site pulls its own copy of each update over the constrained site link.',
    remedy: 'Join or extend the DO boundary policy (group mode 2, DOGroupId per site) and state the expected per-site download reduction.'
  }, {
    id: 'ENV-TENANT-4',
    title: 'Blocking access needs a CA device filter, not membership absence',
    trigger: /must not (access|reach|sign in)|block(ed|ing)? (from )?(microsoft 365|m365|office|corporate)|no (corporate|m365) access/i,
    note: 'A device simply not being licensed or grouped does not block anything; the tenant evaluates CA on the device claim.',
    remedy: 'Write an explicit CA block policy with a device filter on the fleet\u2019s naming prefix or group, plus the browser and network layers for unmanaged-device gaps.'
  }]
}, {
  id: 'ENV-CA',
  name: 'Conditional Access policy set - APM corporate tenant',
  source: 'Tenant export 7 Aug 2026 (policies/APM-Conditional-Access-Policies-Export.csv); analysis in policies/APM_CA_Policy_Analysis.html',
  cat: 'Configuration',
  owner: 'APM Cyber Security',
  appliesWhen: {
    min: 1,
    any: [/conditional access|\bca policy\b|\bca-\d{3}\b|sign-?in|authenticat|\bmfa\b|multi-?factor|device filter|block access/i]
  },
  facts: [['Size and enforcement', '116 policies: 68 enforced, 43 report-only, 5 disabled. 37 per cent of the estate grants and denies nothing.'], ['Enforced tenant-wide (all users, all apps)', 'Deny Legacy Auth (block) - CA-100 legacy protocols (block) - CA-102 locations except AU and corporate (block) - CA-104 high sign-in risk (block) - CA-105 bad IPs (block) - CA-201 BYOD browser no persistence (session) - CA-203 high user risk (MFA + password change) - AllUsers_AllAccess_DeviceRequired (compliant OR Entra-joined) - AllUsers_AllAccess_MFAorDeviceRequired (MFA OR Entra-joined).'], ['Report-only, so NOT a control', 'CA-101 tenant-wide MFA - CA-106 and CA-401 phishing-resistant MFA - AdminRoles_Everything_RequireMFA - AdminRoles_Everything_RequireDevice - CA-103 unsupported platforms - CA-400 and CA-402 administrator device and location - Guests_Everything_MFARequired - AllUsers_UnapprovedCountries_Block - AllUsers_AllAccess_BlockLegacy.'], ['A managed device satisfies both enforced grants', 'AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired are both satisfied by an Entra-joined, Intune-compliant device - the second one with no MFA prompt. Any special-purpose fleet that is managed and compliant looks like a corporate device to every existing grant.'], ['Risk-based CA is live', 'CA-104, CA-203, AdminRoles_Risky_Sign-ins_MFA and AdminRoles_RiskyUsers_MFA_Password_Reset are enforced, so Entra ID P2 risk signals are licensed and in use. All of them evaluate a user principal.'], ['Naming convention', 'CA-nnn - audience - apps - condition - action, by series: CA-1xx all users and guests, CA-2xx organisation users, CA-3xx contract and community populations, CA-4xx administrators, CA-5xx guests. CA-100 to CA-106 are in use. Legacy families also present: Scope_App_Control (AllUsers_*, AdminAccounts_*, AdminRoles_*), POC_EarlyAccess_*, GuestAccess_*.'], ['Retired kiosk policies', 'Fourteen in two families: CA-APM-Kiosk-* (seven, all report-only, group 761b688c) and CA-APM-KioskPB-* (seven, six enforced, group e0378201). Both assign to groups of user identities.'], ['Hygiene', 'CA-501 ends in the literal word COPY and is enabled. zzADA_Block_Policy_Test_20250626 is still present. APM Pilot Block Policy and APM Pilot Policy are both enabled and both block all apps. Four duplicated numbers (CA-204, CA-205, CA-207, CA-208). Eight _Reporting twins. Four names with leading or trailing whitespace. Eighteen with a corrupted separator character. Three policies block legacy authentication. Two enabled policies grant MFA under a name that says Block (LimitedUsers_EmailOnly_Block, CA-504).'], ['Export limitation', 'The CSV carries name, state, users, groups, applications and grant rules only. No exclusions, conditions, device filters, locations, platforms, client apps, session controls, authentication strengths or directory-role targets. A blank grant rule means session control or authentication strength, not no control. Request identity/conditionalAccess/policies from Graph for the full object.']],
  interactions: [{
    id: 'ENV-CA-1',
    title: 'A managed fleet satisfies the tenant grants, so blocking must be explicit',
    trigger: /must not (access|reach|sign in)|block(ed|ing)? (from )?(microsoft 365|m365|office|corporate)|no (corporate|m365) access|device filter/i,
    note: 'AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired are enforced for all users against all apps, and an Entra-joined compliant device satisfies both - the second without an MFA prompt. Absence of a licence or a group grants nothing.',
    remedy: 'Write an explicit block policy with a device filter, cite both tenant policies by name as the reason it is required, and back it with browser and network layers for devices the tenant does not recognise.'
  }, {
    id: 'ENV-CA-2',
    title: 'Phishing-resistant and tenant-wide MFA are report-only, so they cannot be cited as controls',
    trigger: /phishing[- ]resistant|multi-?factor|\bmfa\b|authentication strength/i,
    note: 'CA-401 (administrators) and CA-106 (all users and guests) are report-only, as is CA-101. The only enforced MFA grant tenant-wide is MFA OR Entra-joined device, which a managed device satisfies without prompting.',
    remedy: 'Do not cite tenant MFA or phishing-resistant MFA as an inherited or compensating control. If the design needs it, raise enforcement with APM Cyber Security first and record it as an assumption with an owner until confirmed.'
  }, {
    id: 'ENV-CA-3',
    title: 'New Conditional Access objects follow the CA-nnn convention, not the Intune schema',
    trigger: /conditional access (polic|profile)|\bca polic/i,
    note: 'The tenant convention is CA-nnn - audience - apps - condition - action, with number series by audience. The Intune Naming Schema governs Intune objects only. Four numbers are already duplicated, so a proposed number must be checked against the export.',
    remedy: 'Name the policy CA-nnn in the correct series, confirm the number is unused, and state both the name and the number in the design settings table.'
  }, {
    id: 'ENV-CA-4',
    title: 'Country-level location blocking already exists tenant-wide',
    trigger: /geo[- ]?block|country|location[- ]based|non-?au|outside australia|named location/i,
    note: 'CA-102 blocks locations other than Australia and corporate for all users and all apps, and is enforced. CA-105 blocks known-bad IPs. CA-500 and CA-501 cover guests.',
    remedy: 'Cite CA-102 rather than creating a fleet-specific location policy. The tenant already carries one duplicate of this control in report-only state.'
  }, {
    id: 'ENV-CA-5',
    title: 'A group-assigned CA policy silently dies when its group is retired',
    trigger: /retire|decommission|delete the group|remove the (user )?group|group is retired/i,
    guard: /conditional access|\bca\b|polic/i,
    window: 260,
    note: 'Conditional Access assigns to users and groups of users. Fourteen retired kiosk policies assign to two user groups, and six of them are enforced. When the group goes, they match nothing and raise no error.',
    remedy: 'Delete the policies in the same change record as the group, export their sign-in and report-only data as evidence first, and separately remove any exclusion that named the group so no exclusion outlives it.'
  }, {
    id: 'ENV-CA-6',
    title: 'The Conditional Access half of an exclusion register cannot be verified from the standard export',
    trigger: /exclusion register|excluded from|exclude the (device )?group|assignment exclusion/i,
    guard: /conditional access|\bca\b|polic|tenant/i,
    window: 260,
    note: 'The available export has no exclusions column. Nine policies target all users against all apps and cannot be checked.',
    remedy: 'Mark the Conditional Access rows of the exclusion register as unverified, and request identity/conditionalAccess/policies from Graph to close it.'
  }]
}, {
  id: 'ENV-DOCSET',
  name: 'APM solution document set - DDD and TCD templates',
  source: '02 Detail Design Document - Template V0.1 (24 Jun 2026) and 03 Technical Configuration Document V0.1 (21 Jul 2026) (uploads/)',
  cat: 'Configuration',
  owner: 'Head of Digital Transformation and Architecture; Head of Digital Operations; Head of Product Development',
  facts: [['DDD template', 'APM\u2019s own template orders: Introduction, Overview, Business Architecture, Application Architecture, Technology Architecture, Information & Data, Cyber & Security, Service Availability & DR, Service Management - the same spine as our detailed-design standard. Cover carries Project Name, Document Owner, Contact, Program, Division/Unit, Status, Version, Product ID, plus Consultation, References and Derivation, and an SDA Approval sheet.'], ['TCD companion', 'The Technical Configuration Document is the build-level companion: IP addressing, DNS records, load balancing, NAT and firewall rules, compute specs, RBAC groups, accounts, CA rules, AV exclusions, DNS/NTP/logging/monitoring/patching/PKI/SMTP, RPO/RTO, backup/restore, capacity. "Once approved this document serves as de-facto as-built information."'], ['Approval', 'Both templates carry an SDA (Solution Design Authority) approval block - designs are expected to pass through SDA.']],
  interactions: [{
    id: 'ENV-DOCSET-1',
    title: 'APM expects a TCD companion to every detailed design',
    trigger: /detailed design|solution design|design document/i,
    note: 'The DDD argues the design; the TCD carries the build-level configuration as de-facto as-built. Our \u00a75.3-style settings tables satisfy much of it, but APM review may ask for the TCD artefact itself.',
    remedy: 'Plan a TCD per use case as build detail lands (IPs, rules, accounts, certificates verbatim), and add the SDA approval step to the document\u2019s approval path.'
  }]
}];
if (typeof module !== 'undefined') module.exports = {
  ENVIRONMENT_CONFIG: window.ENVIRONMENT_CONFIG
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "policies/environment-config.js", error: String((e && e.message) || e) }); }

// policies/policy-data.js
try { (() => {
// APM policy register. Policy and standard PDFs live in policies/; environment and as-built
// documents in reference/environment/; the ESLZ corpus in reference/eslz/; APM template set in
// reference/apm-document-templates/. Every requirement is traceable to a named section.
// Every requirement here is traceable to a named section of a real document.
window.POLICY_DATA = {
  generated: '7 August 2026',
  docs: [{
    id: '09.03.055-1.2',
    slug: 'compliance-management-plan',
    title: 'Compliance Management Plan - RFFR and ISO/IEC 27001 (ANZ)',
    cat: 'Governance & Compliance',
    owner: 'GM - Quality & Compliance',
    published: '26/07/2026',
    classification: 'Internal',
    pages: 9,
    file: 'APM-Compliance-Management-Plan-RFFR-ISO27001-ANZ.pdf',
    purpose: 'Establishes the framework for ongoing compliance with DEWR Right Fit for Risk (RFFR) accreditation and ISO/IEC 27001:2022 ISMS certification, including governance and monitoring mechanisms.',
    reqs: [{
      r: 'Statement of Applicability (SoA) is mandatory',
      d: 'Lists all ISO 27001 Annex A controls, states applicability, justifies inclusion/exclusion, and references how each applicable control is implemented. The RFFR SoA uses a DEWR-prescribed template that additionally covers DEWR contractual obligations and Australian Government ISM controls.'
    }, {
      r: 'Three Lines of Defence governance model',
      d: 'First line: business units, IT teams, system owners own and manage risk. Second line: Information Security, Risk & Compliance provide oversight. Third line: independent assurance/audit.'
    }, {
      r: 'All risks, controls, actions and improvements tracked in Clew',
      d: 'Each action is mapped to relevant business risks and existing controls for traceability.'
    }, {
      r: 'Governance cadence',
      d: 'Steering Committee quarterly (chair: RFFR Program Manager). System Owners Forum monthly. Working Group fortnightly.'
    }, {
      r: 'Quarterly ISM update review',
      d: 'Published ISM updates reviewed each Mar, Jun, Sep, Dec; applicability and risk analysis performed and new requirements actioned. RFFR Program Manager owns the process.'
    }, {
      r: 'Quarterly control validation',
      d: 'Control owners verify implementation status, implementation details and applicability every quarter.'
    }, {
      r: 'Annual internal audit',
      d: 'Internal audit of ISMS controls covering Annex A controls, risk treatment plans, ISM controls, and RFFR core expectations for personnel, physical and cyber security.'
    }, {
      r: 'Annual ISMS management review',
      d: 'Formal management review at least annually, assessing ISMS effectiveness, external/internal issue changes, audit results, incident trends and stakeholder feedback.'
    }, {
      r: 'RFFR accreditation maintenance - annual',
      d: 'Updated documentation submitted 6 weeks prior to the annual anniversary of accreditation.'
    }, {
      r: 'RFFR re-accreditation - three-yearly',
      d: 'Must be completed by the third anniversary of initial accreditation; documents submitted 6 weeks before the anniversary date.'
    }, {
      r: 'Notify DEWR within 5 days of environment changes',
      d: 'Any change to APM or subcontractor circumstances that may affect the risk profile must be notified within 5 days to enable re-categorisation.'
    }, {
      r: 'ISO 27001 audit cycle',
      d: 'External surveillance audits in Year 1 and Year 2; full re-certification audit in Year 3. Last re-certification was 2025.'
    }, {
      r: 'Policy and procedure review at least annually',
      d: 'ISMS and RFFR-related policies and procedures reviewed at least annually, more often if the operating environment changes.'
    }],
    external: ['RFFR accreditation requirements (DEWR)', 'ISO/IEC 27001:2022', "ASD Information Security Manual (ISM)", 'Essential Eight', 'DEWR Deed and contractual clauses', 'Privacy Act (Australian Privacy Principles)'],
    impact: [{
      level: 'info',
      t: 'Every design we produce needs an SoA row, not just a design section',
      d: 'A control claimed in a DDD must appear in the RFFR SoA with implementation detail. The Participant Kiosk RFFR SoA (ISM Sept 2025 v7.7m) is the artefact that carries our exclusions.'
    }, {
      level: 'info',
      t: 'Design changes may trigger a 5-day DEWR notification',
      d: 'A material change to the operating environment (new tenant, new internet-facing endpoint, new subcontractor) is notifiable within 5 days. The Participant Kiosk introduces neither: the fleet enrols into the existing APM corporate tenant and publishes no internet-facing endpoint. What may still be notifiable is the decommissioning of the retired build - confirm with the RFFR Program Manager.'
    }]
  }, {
    id: '09.01.037-2.1',
    slug: 'ai-policy',
    title: 'Artificial Intelligence Policy',
    cat: 'Governance & Compliance',
    owner: 'Chief Information Officer',
    published: '24/07/2026',
    classification: 'Internal',
    pages: 3,
    file: 'APM-Artificial-Intelligence-Policy.pdf',
    purpose: 'Ensures ethical, responsible and effective use of AI across the APM Group (Ancora TopCo Limited and subsidiaries), for all employees, contracted staff, contractors, consultants and stakeholders working within APM\u2019s environment.',
    reqs: [{
      r: 'AI use requires ELT sign-off',
      d: 'Businesses must only use AI where the use has been signed off by the ELT member for that business, with assessments completed by both the regional Data Privacy and Digital leaders.'
    }, {
      r: 'Business case + privacy impact assessment required',
      d: 'Reviewed by the local Digital team under the APM Group AI approval process before final ELT business case sign-off. Assessment covers what data is processed and how it is hosted and accessed by the AI platform.'
    }, {
      r: 'Data controller approval where government or state data is processed',
      d: 'Additional approval may be required from the data controller.'
    }, {
      r: 'Risk review before feeding APM content into any AI service',
      d: 'A review of how that information may be used and shared with third parties is required first.'
    }, {
      r: 'Human in the loop for decision-making',
      d: 'APM commits to always having a human in the loop; removing a human decision that should not be made by AI (for example whether a participant retains benefits) is prohibited.'
    }, {
      r: 'Regular bias audits',
      d: 'Conducted by business contract/service line owners and business process/data owners to check for and mitigate bias where AI is in use.'
    }, {
      r: 'Prohibited uses',
      d: 'IP theft or plagiarism; offensive or vulgar content; removing a human decision that should not be automated; reverse engineering or adding third-party AI code into APM systems.'
    }, {
      r: 'AI data loss incidents are reportable',
      d: 'Any data shared within AI in breach of an APM contract or regional legislative requirement (PII, client data, IP, commercially sensitive information) must be reported to the Data Privacy team or management.'
    }, {
      r: 'Every shared AI agent or use case has a named owner',
      d: '"If you built it, you own it until it is formally reassigned." A central regional Agent register records purpose, owner and audience.'
    }, {
      r: 'Lifecycle review and retirement',
      d: 'Shared agents and use cases reviewed periodically; solutions with no value or no active owner are retired.'
    }, {
      r: 'Training for all staff with AI tool access',
      d: 'Ethical-use training aligned to local legislative and contractual requirements.'
    }],
    impact: [{
      level: 'flag',
      t: 'Participant Kiosk allows public AI tools - check this against the approval process',
      d: 'Participant Kiosk user story 14 permits "public AI tools allowed unless high risk" via Zscaler category filtering (General AI & ML Applications, Generative AI and ML Applications are Allow categories in the ZIA policy). This policy governs APM\u2019s use of AI, and arguably not a participant browsing to a public site on an ephemeral device - but the categories are explicitly allow-listed in an APM-managed control, so confirm with Data Privacy whether that constitutes APM "using" AI and needs an assessment.'
    }]
  }, {
    id: '09.03.020-6.0',
    slug: 'trusted-insider',
    title: 'APM Trusted Insider Program',
    cat: 'Identity & Access',
    owner: 'CISO',
    published: '30/06/2026',
    classification: 'Internal',
    pages: 2,
    file: 'CS-Trusted-Insider-Program.pdf',
    purpose: 'Details the controls and processes implemented to mitigate trusted insider threats, where privileged access and knowledge of business process make threats harder to detect.',
    reqs: [{
      r: 'Trusted insider population defined',
      d: 'IT System Administrators, IT Developers, Database Administrators, Executives, General Managers and above, Finance department staff, and any user with elevated permissions or access to APM data.'
    }, {
      r: 'Role-based training programme',
      d: 'Examples: invoice fraud training for Finance, security training for IT Developers, CEO fraud training for Executives. Plus increased phishing awareness campaigns targeted at all trusted insiders.'
    }, {
      r: 'Separate privileged accounts',
      d: 'Staff performing privileged administration tasks use separate accounts carrying trusted insider and additional privileged account protections.'
    }, {
      r: 'Additional password complexity on privileged accounts',
      d: 'Applied to all trusted insider privileged accounts.'
    }, {
      r: 'Contractors held to the same controls as staff',
      d: 'No reduced control set for contracted personnel.'
    }, {
      r: 'Enterprise password management solution',
      d: 'IT Trusted Users are provisioned access to an enterprise password management solution.'
    }, {
      r: 'Protective monitoring via external SOC',
      d: 'Logging covers authentication events, endpoint protection alerts and internet browsing activity. Monitoring includes Microsoft Purview Insider Risk Management.'
    }],
    impact: [{
      level: 'info',
      t: 'Privileged Access SOE (P4) inherits this directly',
      d: 'The two privileged tiers (zz / xy) are trusted insider populations: separate accounts, additional password complexity, enterprise password manager, and Purview Insider Risk Management monitoring are all mandated here, not optional design choices.'
    }, {
      level: 'flag',
      t: 'Participant Kiosk local administrator account needs a trusted-insider decision',
      d: 'The Participant Kiosk carries one local administrator account per device. If it is treated as "a user with elevated permissions", this policy requires separate-account handling, additional password complexity and SOC monitoring. The design manages its password with Windows LAPS (§7.2.3): 30 characters, distinct per device, rotated every 30 days, escrowed to Entra ID, with retrieval audited to Sentinel. Confirm that satisfies the program owner.'
    }]
  }, {
    id: '09.03.021-5.0',
    slug: 'continuous-monitoring',
    title: 'Continuous Monitoring Plan',
    cat: 'Monitoring & Assurance',
    owner: 'CISO',
    published: '30/06/2026',
    classification: 'Internal',
    pages: 5,
    file: 'CS-Continuous-Monitoring-Plan.pdf',
    purpose: 'Establishes continuous monitoring (CONMON) per NIST SP 800-137 to proactively identify, prioritise and respond to security vulnerabilities and maintain awareness of threats and control effectiveness.',
    reqs: [{
      r: 'CONMON performed by independent, suitably skilled personnel',
      d: 'By a member of the Cyber Security Team or someone with a similar skillset who is independent of the system being assessed; may be internal or third party. Ensures no conflict of interest.'
    }, {
      r: 'Continuous vulnerability monitoring tooling',
      d: 'All APM systems are continuously monitored using Microsoft Defender for Cloud and Defender for Endpoint. Wiz.io continuously monitors cloud service environments for configuration issues.'
    }, {
      r: 'Weekly vulnerability review meeting',
      d: 'Held between the Cyber Security team and Digital Operations to review results and remediation activities per the Patch & Vulnerability Management Standard.'
    }, {
      r: 'Daily threat landscape monitoring',
      d: 'Monitored by the Cyber Security team daily and relayed to relevant business teams; threat reports incorporated into Enterprise and Business Unit Operational Risk Registers.'
    }, {
      r: 'Vulnerability assessment triggers',
      d: 'For new systems before deployment; whenever major or significant changes occur; where new or significant threats are identified; as a result of a specific security incident; and at regular intervals.'
    }, {
      r: 'Penetration testing triggers',
      d: 'Prior to a system going live; after material upgrades or modifications to the technology environment; and at an appropriate frequency, generally annually. All key existing APM systems are pen tested annually.'
    }, {
      r: 'Pen test approval and scheduling',
      d: 'Approval required from the system owners of all in-scope systems before testing. The schedule is agreed with System Owners and approved by the CISO. Testing performed by the Cyber Security team or external testers depending on contractual requirements.'
    }, {
      r: 'Intrusion detection and firewall alerting',
      d: 'HIPS for behaviour-based detection; NIDS/NIPS for known intrusion profiles; alerts generated for information flows that contravene firewall rules.'
    }, {
      r: 'Vulnerability mitigation hierarchy',
      d: 'Prevent (input validation, output filtering, additional access controls, firewall rules), detect (IDS, logged alert monitoring), contain (outbound firewall rules, mandatory access control, file system permissions), resolve (disable functionality, vendor guidance, migrate product, engage developer). Prioritised by risk and implemented as soon as practicable.'
    }],
    impact: [{
      level: 'flag',
      t: 'Participant Kiosk penetration testing must complete before go-live, not before national rollout',
      d: 'The Participant Kiosk implementation sequence puts penetration testing at Phase 4, ahead of Phase 5 national rollout. This plan requires pen testing "prior to a system going live" - confirm whether the pilot devices in Phase 3 count as live. It also requires System Owner approval and a CISO-approved schedule, which the design does not yet name.',
      det: {
        policy: 'Continuous Monitoring Plan, Penetration Testing: performed prior to a system going live; after material upgrades or modifications; and generally annually. Approval required from the system owners of all in-scope systems. Schedule agreed with System Owners and approved by the CISO.',
        design: 'Participant Kiosk DDD \u00a79.5 Implementation Sequence: Phase 3 provisions 5-10 pilot devices across 2-3 sites; Phase 4 conducts pre-production penetration testing; Phase 5 is national rollout.',
        why: 'Phase 3 puts real devices in real sites with real participants before the pen test in Phase 4. If those pilot devices are "live", the sequence inverts the policy requirement. There is also no named System Owner for the Participant Kiosk and no CISO-approved test schedule in the plan, both of which are prerequisites rather than formalities.',
        options: ['Confirm the pilot is a controlled test rather than live service (no real participant PII), which keeps the current sequence valid - and say so in \u00a79.5.', 'Or move a scoped penetration test ahead of Phase 3 pilot deployment and keep Phase 4 as the full pre-production test.', 'Either way, name the Participant Kiosk System Owner and get the test schedule CISO-approved before Phase 3.'],
        owner: 'Shaun Struik with the PM to sequence; CISO approves the schedule; System Owner to be named.',
        refs: ['Continuous Monitoring Plan, Penetration Testing', 'Participant Kiosk DDD \u00a79.5.3', 'Participant Kiosk DDD \u00a79.5.4']
      }
    }, {
      level: 'good',
      t: 'Device-based Defender for Endpoint onboarding satisfies this plan',
      d: 'This plan states all APM systems are continuously monitored via Defender for Cloud and Defender for Endpoint. The Participant Kiosk fleet is licensed by device (Defender for Endpoint P2 per device, §7.2.1) inside the existing APM corporate tenant, so onboarding is native and no cross-tenant arrangement is needed. The earlier separate-tenant complication was removed by the P1 pivot.'
    }, {
      level: 'flag',
      t: 'Confirm the retired cloud components leave Wiz.io scope on decommissioning',
      d: 'Wiz.io continuously monitors cloud service configuration. The retired build\u2019s Key Vault, Function App and Automation Account are in that scope until they are deleted. The Participant Kiosk itself creates no cloud service resources. Confirm the decommissioning change record removes them from Wiz inventory rather than leaving dormant, still-monitored resources behind (§9.4 and the Kiosk Decommissioning change request).'
    }]
  }, {
    id: '09.03.027-5.0',
    slug: 'cryptography',
    title: 'Cryptography and Key Management Standard',
    cat: 'Cryptography',
    owner: 'CISO',
    published: '02/07/2026',
    classification: 'Internal',
    pages: 8,
    file: 'CS-Cryptography-and-Key-Management-Standard.pdf',
    purpose: 'Defines the cryptographic technologies APM must adhere to and how encryption keys are managed. Applies to all APM IT Software Assets (internal or externally managed) and Cloud Service Providers hosting APM Information Assets.',
    reqs: [{
      r: 'Approved algorithms and minimum key sizes',
      d: 'AES 128 bits min, 256 preferred (never ECB mode; AES-128 phased out by 2030). ECC base point order and key size \u2265224 bits (NIST SP 800-186 curves). RSA 2048 min, 3072 preferred - separate key pairs for encryption and signing. SHA-256/384/512. Diffie-Hellman 2048 min, 3072 preferred, ephemeral variants only, anonymous DH not permitted for TLS. Elliptic Curve DH 224 bits. ECDSA 224 bits, NIST P-384 preferred. ML-DSA-65/87 per FIPS 204. ML-KEM-768/1024 per FIPS 203.'
    }, {
      r: 'Only approved algorithms may be used',
      d: 'Use of any other cryptographic algorithm, including proprietary ones, is prohibited.'
    }, {
      r: 'Post-quantum cryptography in new systems',
      d: 'Should be implemented in new systems and services where supported. FIPS 140-3 validated modules preferred, not required. Approved PQC strengths: AES-256, SHA-384/512, ML-KEM-1024, ML-DSA-87 (weaker variants not approved beyond 2030).'
    }, {
      r: 'TLS cipher suites are explicitly enumerated',
      d: 'TLS 1.2: sixteen approved suites (ECDHE/DHE with AES-256/128 GCM, CCM and CCM_8). TLS 1.3: TLS_AES_256_GCM_SHA384, TLS_AES_128_GCM_SHA256, TLS_AES_128_CCM_SHA256, TLS_AES_128_CCM_8_SHA256.'
    }, {
      r: 'Encryption at rest by classification and zone',
      d: 'Internal: MUST use current ASD approved encryption in an uncontrolled zone (internet locations, customer devices); SHOULD use encryption in an externally controlled zone (SaaS); not required but preferred in semi-controlled and controlled zones. Confidential and Restricted: MUST use current ASD approved encryption in uncontrolled, externally controlled and semi-controlled zones; risk-based decision in the controlled zone.'
    }, {
      r: 'Encryption in transit by classification',
      d: 'Internal, Confidential and Restricted MUST use current ASD approved encryption over public/guest networks, corporate networks and secured networks alike. Public classification not required but preferred.'
    }, {
      r: 'Key rotation maximum age',
      d: 'Production, internet-facing or holding production data: 60 days. Production, not internet-facing: 90 days. Non-production, internet-facing: 90 days. Non-production, not internet-facing: 180 days. Rotation applies "where possible".'
    }, {
      r: 'Key custodianship',
      d: 'Keys may only be distributed to and accessed by authorised staff within the IT Department (Key Custodians). Where possible X.509 certificates are installed without the ability to be exported.'
    }, {
      r: 'Key lifecycle obligations',
      d: 'Keys updated once no longer valid or if there is a risk of disclosure. Compromised or corrupted keys must be revoked. All access to and actions against keys and the PKI are captured at time of issue. Recovery of encrypted data supported where possible.'
    }, {
      r: 'Loss of keys is immediately reportable',
      d: 'Loss of any keys, X.509 certificates or other cryptographic materials must be immediately reported to the IT Security Team, and to the relevant contract or government body where needed to satisfy contractual requirements.'
    }, {
      r: 'Wildcard certificates must not be used',
      d: 'Due to increased risk. Public-facing web services should use a commercial Trusted Certificate Authority; internally consumed services use APM\u2019s PKI certificate platform.'
    }, {
      r: 'Cryptographic artefacts require D&T Operations approval',
      d: 'X.509 certificates and keying material must be requested and approved by the D&T Operations team, with the request recorded in the IT Service Management application.'
    }],
    impact: [{
      level: 'good',
      t: 'No APM-managed key or credential remains on the Participant Kiosk, so the rotation table does not bind',
      d: 'The V1.6 design stored a per-device passphrase as an Azure Key Vault secret on a 12-month schedule, which sat against the 60-day maximum age for production internet-facing keys. The P1 pivot removed it entirely. The session credential is now 32 random characters generated on the device by a signed remediation, written only to the Winlogon LSA secret, known to nobody and never held in a vault; the only APM-managed password is the local administrator account, managed by Windows LAPS at 30 characters rotated every 30 days (§7.2.3), which is inside this standard\u2019s tightest bracket. The former CISO-ruling request is withdrawn.'
    }, {
      level: 'info',
      t: 'Certificate requirements apply again only if EAP-TLS Wi-Fi is adopted',
      d: 'The SCEP-issued device certificates and the internet-facing Credential Proxy that carried mTLS are both removed, and Microsoft Cloud PKI is being decommissioned with the retired build. If certificate-based Wi-Fi authentication is later adopted in place of the pre-shared key, this standard applies to it: RSA \u22652048 (3072 preferred) or ECC \u2265224, SHA-256 or better, no wildcard anywhere in the chain, and a D&T Operations-approved request recorded in the ITSM tool.'
    }, {
      level: 'good',
      t: 'Transport security is now specified rather than left to defaults',
      d: 'The fleet hosts no service endpoint, so the position is a client one: §7.2.7 states TLS 1.2 as the floor with TLS 1.3 preferred and the approved suite list from this standard, closing the cipher-suite gap the V1.6 review raised against the Credential Proxy.'
    }, {
      level: 'info',
      t: 'YubiKey design alignment',
      d: 'The phishing-resistant authentication design should cite this standard for its certificate and algorithm choices, including the FIPS-validated module preference.'
    }, {
      level: 'info',
      t: 'Post-quantum expectation for new builds',
      d: 'Any new service should note PQC support where the platform allows it, since this standard asks for it in new systems.'
    }]
  }, {
    id: '09.03.005-7.0',
    slug: 'incident-response',
    title: 'Cyber Incident Response Plan',
    cat: 'Incident Response',
    owner: 'CISO',
    published: '02/07/2026',
    classification: 'Confidential',
    pages: 13,
    file: 'CS-Cyber-Incident-Response-Plan.pdf',
    purpose: 'The formalised, pre-approved response requirements for cyber security incidents, built on NIST 800-53, 800-61 and 800-83. Applies to all APM information systems, operational data, networks and any person or device accessing them.',
    reqs: [{
      r: 'Six-phase methodology',
      d: 'Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned.'
    }, {
      r: 'Priority-1 - immediate response including out of hours',
      d: 'Critical system failure preventing multiple customers accessing services beyond acceptable downtime, or widespread exposure of sensitive customer data. Create ServiceNow ticket, notify all stakeholders, establish Crisis Management Team for external communications, stand up Teams War Room, Google Workspace available for out-of-band communication.'
    }, {
      r: 'Priority-2 - response within 15 minutes in business hours',
      d: 'On-call best effort out of hours. Suspected exploitation of a misconfiguration or vulnerability, exposure of sensitive customer data, or sweeping malware infection across multiple hosts. Monitor for escalation to P1.'
    }, {
      r: 'Priority-3 - within 1 hour',
      d: 'Issues preventing one or more customers using services, security misconfiguration without evidence of exploitation, or commodity malware isolated to a single host.'
    }, {
      r: 'Priority-4 - best effort same business day',
      d: 'Issues requiring triage rather than immediate attention.'
    }, {
      r: 'Reporting path',
      d: 'All staff who identify a real or potential incident must immediately report it using APM Assist. The Incident Manager records details in the online Major Cyber Security Incident Register and immediately notifies the CISO. All incidents logged in ServiceNow; P1 and P2 also update the Major Incident Register.'
    }, {
      r: 'CIRT Manager has delegated containment authority',
      d: 'Delegated authority to take whatever action is necessary to immediately contain an incident and limit damage, without waiting for Executive approval.'
    }, {
      r: 'DEWR and ASD notification for personal or sensitive data incidents',
      d: 'Where the incident affects an environment holding personal or sensitive data, the CIRT Manager and Data Owner notify the Department as Accreditation Authority as soon as possible via securitycompliancesupport@jobs.gov.au, and notify the Australian Signals Directorate seeking assistance. No action that could affect evidence integrity is taken prior to ASD involvement (ISM control 915c).'
    }, {
      r: 'Containment prioritised over evidence collection',
      d: 'Unless instructed otherwise by law enforcement.'
    }, {
      r: 'Evidence retention',
      d: 'Network traffic logs retained for 7 days prior to discovery of the incident; artefacts preserved; all retention or removal logged in the chain of custody document. Low-priority incident files retained 1 year; all others per Legal Team requirements.'
    }, {
      r: 'Out-of-band communications fallback',
      d: 'If Azure becomes untrusted or unavailable, the CIRT Manager may move all communications to the Google Workspace environment.'
    }, {
      r: 'Coordinated eradication',
      d: 'Intrusion remediation conducted in a single coordinated planned outage to avoid alerting the adversary, using an alternative system to plan if email/messaging/collaboration is compromised.'
    }, {
      r: 'Post Incident Report within 7 days',
      d: 'The CIRT Manager compiles documentation and evidence into a Post Incident Report, formally reviewed with those impacted; ideally complete within 7 days.'
    }, {
      r: 'Annual IR plan testing',
      d: 'Complete regular testing of the Incident Response Plan, at least annually.'
    }, {
      r: 'CIRT composition',
      d: 'Core: CISO, CIRT Manager, subject matter experts, Global Threat Lead, APM Security Analysts and Engineers, SOC (Quorum Cyber), Application Managers, IT Operations Manager, IT Infrastructure Lead as required.'
    }, {
      r: 'Supporting playbooks',
      d: 'Ransomware; Phishing / Malicious Link Click; Data Breach / Leak / Spill; Malware Infection; DDoS; Theft / Loss of IT Asset. Plus Incident Communication Process, CIRT Incident Handler Checklist, IR RACI Matrix, Chain of Custody Tracking Form.'
    }],
    impact: [{
      level: 'good',
      t: 'The Participant Kiosk now references this plan rather than inventing a procedure',
      d: '\u00a79.1 states that a suspected or actual security incident involving a Participant Kiosk is reported through APM Assist and logged in ServiceNow under this plan, with the "Theft / Loss of IT Asset" playbook covering device loss. The fleet-specific steps are short because the pivot removed most of them: there is no cloud credential to rotate and no SCEP certificate to revoke - rotate the LAPS password, isolate the device in Defender, and do not wipe until cleared.'
    }, {
      level: 'flag',
      t: 'A Participant Kiosk incident is likely a DEWR-notifiable incident',
      d: 'Participant sessions handle participant PII. Any confirmed compromise engages the securitycompliancesupport@jobs.gov.au notification and ASD involvement, and the evidence-preservation freeze under ISM 915c. The risk is procedural: Autopilot Reset restores service in minutes and destroys the evidence.',
      det: {
        policy: 'Cyber Incident Response Plan, Containment Phase step 9: where an incident affects the environment holding personal/sensitive data, the CIRT Manager and Data Owner notify the Department as Accreditation Authority as soon as possible via securitycompliancesupport@jobs.gov.au, and notify ASD seeking assistance. The CIRT Manager instructs all staff to take no action which could affect the integrity of the evidence prior to ASD involvement (ISM 915c).',
        design: 'Participant Kiosk DDD \u00a79.1 names the reporting path (APM Assist, ServiceNow, this plan). \u00a79.2 defines the Sentinel sources and alerting for the fleet.',
        why: 'A support operator\u2019s natural first instinct on a suspected compromised device is to wipe and re-provision it. Under ISM 915c that destroys evidence before ASD is involved, on an incident that is externally notifiable to the accreditation authority. The design names the reporting path but does not yet state the do-not-wipe constraint in the operational runbooks handed over at Phase 7.',
        options: ['Add the evidence-preservation constraint to the device-replacement and remote-support runbooks (\u00a79.5.7), not just to the design: isolate in Defender, rotate LAPS, escalate to the CIRT Manager, and do NOT reset or wipe until cleared.', 'Constrain any automated Sentinel response to device isolation - containment is delegated to the CIRT Manager and is permitted; device wipe is not.'],
        owner: 'Shaun Struik to draft the runbook constraint; APM Cyber Security to confirm the notification threshold for a single-device compromise.',
        refs: ['Cyber Incident Response Plan, Containment step 9', 'ISM 915c', 'Theft / Loss of IT Asset playbook', 'Participant Kiosk DDD \u00a79.1', 'Participant Kiosk DDD \u00a79.5.7']
      }
    }, {
      level: 'info',
      t: 'Automated containment is device isolation, not account disablement',
      d: 'The V1.6 design proposed auto-disabling a kiosk account on anomaly. There is no such account to disable now - the session account is device-local and Windows-managed. The device-centred equivalent in \u00a79.2 is Defender isolation, which is containment (permitted, delegated to the CIRT Manager). Wiping the device is not, prior to ASD involvement.'
    }]
  }, {
    id: '09.01.033-5.0',
    slug: 'posture-statement',
    title: 'Cyber Security Posture Statement',
    cat: 'Governance & Compliance',
    owner: 'CISO',
    published: '02/07/2026',
    classification: 'Internal',
    pages: 5,
    file: 'CS-Cyber-Security-Posture-Statement.pdf',
    purpose: 'Customer-facing high-level overview of the IT security controls in place across the APM ICT environment, and assurance in APM\u2019s cyber security practices.',
    reqs: [{
      r: 'Certifications held',
      d: 'ISO/IEC 27001:2022 and DEWR Right Fit for Risk, covering the handling of OFFICIAL: Sensitive data. All RFFR compliant technology policies, standards and IT infrastructure procedures are used across all centrally managed APAC Group businesses.'
    }, {
      r: 'Pre-employment screening',
      d: 'Identity check, Australian Federal Police clearance, employment reference, academic reference, and visa or citizenship confirmation. All personnel sign a confidentiality agreement.'
    }, {
      r: 'Security awareness training',
      d: 'Privacy and information security awareness modules at onboarding then annually. Personnel who fail to complete in a timely manner may face disciplinary action. Covers passphrase security, information collection and security, threats and incident actions, and personnel obligations.'
    }, {
      r: 'Offboarding',
      d: 'Staff access terminated and APM assets returned on the last day of employment.'
    }, {
      r: 'Data residency - Microsoft Australian Azure only',
      d: 'All data held by APM APAC centrally managed entities on APM managed infrastructure is stored in Microsoft\u2019s Australian Azure cloud, in the Sydney and Melbourne data centres. Both ISO 27001:2022 and SOC 2 Type 2 compliant.'
    }, {
      r: 'Removable media administratively disabled by default',
      d: 'Access to removable media is administratively disabled on APM ICT assets. Explicit approval must be granted by APM ICT stakeholders to allow access to APM approved removable media.'
    }, {
      r: 'Physical asset controls',
      d: 'Assets labelled with APM name and ICT service desk number. Removal of an APM asset from site must be reviewed and approved by Office Managers or the Operations Team Lead.'
    }, {
      r: 'Premises and clear desk',
      d: 'Operations conducted within APM owned/leased buildings with a defined security perimeter; physical documentation in locked cabinets when not in use; clear desk and screen policy enforced through the Information Security Code of Practice.'
    }, {
      r: 'Identity and access management',
      d: 'Aligned to the Identity and IT Access Management Standard: multi-factor authentication, complex passwords aligned to ISM requirements, session termination based on inactivity, need-to-know and least-privilege access.'
    }, {
      r: 'Cryptography',
      d: 'ASD Approved Cryptographic Algorithms (AACA) for information in transit and at rest, including data stored on removable media.'
    }, {
      r: 'Anti-malware',
      d: 'Multilayer approach with both network and host-based antimalware solutions.'
    }, {
      r: 'Network security',
      d: 'Perimeter firewalls, secure web gateway clients, intrusion detection and prevention. All notifications monitored by the Security Operations Centre. Wireless network devices require authentication before access is granted.'
    }, {
      r: 'Remote access',
      d: 'All remote access requires APM VPN or approved Virtual Desktop Infrastructure. Services are monitored during use and all connections encrypted.'
    }, {
      r: 'Penetration testing',
      d: 'Formalised technical assurance program with annual penetration testing of all key systems and infrastructure, plus prior to go-live of new services and for significant updates.'
    }, {
      r: 'Third party security',
      d: 'Third parties must agree to the Security Standards for Third Parties Engaging with APM Policy and the Information Security Code of Practice before gaining system access. All third-party contracts overseen by Legal.'
    }, {
      r: 'Backup',
      d: 'Performed at a regular cadence per the Information Systems Backup and Archiving Standard, which defines RTOs and RPOs.'
    }],
    related: ['APM - Risk Management Framework', 'Cyber Security Incident Response Plan', 'Disaster Recovery Plan', 'Identity and IT Access Management Standard', 'Information Asset Classification & Handling Standard', 'Information Security Code of Practice', 'Information Security Policy', 'Information Systems Backup and Archiving Standard', 'IT Asset Management Standard', 'Patch and Vulnerability Management Standard', 'Security Standards for Third Parties Engaging with APM Policy'],
    impact: [{
      level: 'good',
      t: 'This is the policy hook that legitimises the kiosk USB exception',
      d: 'Removable media is administratively disabled by default and requires explicit APM ICT stakeholder approval for approved media. The Participant Kiosk USB exception profiles are exactly that mechanism - cite this clause in \u00a77.3.3 so the exclusion reads as policy-compliant rather than policy-breaking.',
      det: {
        policy: 'Cyber Security Posture Statement \u00a74.3 Enterprise Asset Management: "Access to removable media is administratively disabled on APM ICT assets. An explicit approval needs to be granted by APM ICT stakeholder(s) to allow accessing of APM approved removable media."',
        design: 'Participant Kiosk DDD \u00a75.2.3 creates CDG-W11-SEC-USB Exception-P-1.0 and CDG-W11-SEC-Bitlocker Exception-P-1.0, assigned to sg-dyn-dvc-cdg-participant-kiosk, which is excluded from the estate APM-WIN-SEC-USB Baseline-P-1.0 assignment. \u00a77.3.3 records the three excluded controls with compensating controls.',
        why: 'The posture statement does not prohibit removable media outright - it disables it by default and provides an approval path. That reframes the exception from "breaking the standard" to "using the exception mechanism the policy anticipates". This is the strongest single sentence available to defend the USB position in review, and the design does not currently cite it.',
        options: ['Add the quoted clause to \u00a77.3.3 as the policy basis for the exception, and record who granted the explicit approval and when. That converts the argument from a defence to a citation.'],
        owner: 'Shaun Struik to add the citation; explicit approval to be recorded from the APM ICT stakeholder (APM Cyber Security).',
        refs: ['Posture Statement \u00a74.3', 'Participant Kiosk DDD \u00a75.2.3', 'Participant Kiosk DDD \u00a77.3.3']
      }
    }, {
      level: 'good',
      t: 'Data residency is satisfied by holding no data at all',
      d: 'Sydney and Melbourne are the named data centre locations. The Participant Kiosk retains nothing: the profile is destroyed on every restart and there is no cloud store on the device. The management planes it uses - Intune, Entra ID, Defender, Sentinel - are the existing APM Australian tenancy. The V1.6 residency argument rested on a credential pipeline in Australia East; that pipeline is removed.'
    }, {
      level: 'good',
      t: 'The clear-screen deviation is closed by the pivot',
      d: 'The clear desk and screen policy is enforced through the Information Security Code of Practice. The V1.6 design deliberately displayed a credential on the lock screen and carried that as deviation SOE-04. The Participant Kiosk presents no lock screen at all: the device signs itself in to a Windows-managed local account, and nothing is displayed to be read or photographed. SOE-04 as written is retired.'
    }, {
      level: 'flag',
      t: 'Remote access is VPN or approved VDI only',
      d: 'This statement says all remote access requires APM VPN or approved VDI. The Participant Kiosk uses TeamViewer for remote support. That reinforces SOE-03: the remote-support model is a documented variation needing explicit CISO acceptance, and swapping to an approved path would be simpler.',
      det: {
        policy: 'Cyber Security Posture Statement \u00a76.2 Remote Access: "All remote access to the APM network requires access to APM\u2019s Virtual Private Network, or approval to use its Virtual Desktop Infrastructure. These services are monitored during use, and all connections are encrypted." The SOE Hardening Standard separately disables Remote Assistance, Remote Shell and inbound Remote Desktop (5 ASD-aligned controls).',
        design: 'Participant Kiosk DDD \u00a74.3.10 documents a TeamViewer remote-support model: attended consent for participant sessions, unattended for the administrative scenario, a per-device non-privileged support account whose password is managed by Windows LAPS (\u00a77.2.3), operator MFA, file transfer disabled, session logs to Sentinel.',
        why: 'Two documents now constrain remote access, and TeamViewer is neither VPN nor VDI. The design\u2019s controls are genuinely strong, but they are a compensating argument against an explicit policy statement that a customer-facing posture statement makes to APM\u2019s clients. That is a harder position to hold than swapping tools.',
        options: ['Swap to Intune Remote Help or Defender live response - already in APM\u2019s tooling, already covered by the estate posture, removes the variation entirely. Recommended.', 'Or keep TeamViewer and obtain explicit CISO acceptance as a documented variation, noting that the posture statement is customer-facing and may need updating to remain accurate.'],
        owner: 'Shaun Struik to propose the swap; CISO decides.',
        refs: ['Posture Statement \u00a76.2', 'SOE Hardening Standard, Win11 OS baseline (Remote Assistance / Remote Shell / RDP)', 'Participant Kiosk DDD \u00a74.3.10', 'Participant Kiosk DDD SOE-03']
      }
    }, {
      level: 'info',
      t: 'Missing standards we should obtain',
      d: 'The related-documents list names eleven standards. Two are now held: the Identity and IT Access Management Standard (09.03.035-5.0) and the Risk Management Framework (01.01.004-8.3). Still outstanding and load-bearing: Information Asset Classification & Handling Standard, Patch and Vulnerability Management Standard, and the Information Security Code of Practice. Full list in policies/README.md.'
    }]
  }, {
    id: '09.03.009-2.7',
    slug: 'communication-strategy',
    title: 'Cyber Security Communication Strategy',
    cat: 'Monitoring & Assurance',
    owner: 'CISO',
    published: '02/07/2026',
    classification: 'Internal',
    pages: 2,
    file: 'CS-Cyber-Security-Communication-Strategy.pdf',
    purpose: 'Defines how the Cyber Security team communicates with internal D&T teams, end users and business stakeholders as a continuous two-way process.',
    reqs: [{
      r: 'Channels',
      d: 'Email, Microsoft Teams, SMS, telephony, website articles and automated data feeds.'
    }, {
      r: 'Major incident communication',
      d: 'Relevant major security incidents such as a sustained cyber attack are communicated to APM employees across multiple channels including email, Teams and SMS.'
    }, {
      r: 'Periodic awareness communications',
      d: 'Sent by email periodically on topics such as phishing and password hygiene.'
    }, {
      r: 'Knowledge sharing',
      d: 'Monthly Ask Me Anything sessions hosted by Cyber Security and open to all D&T staff. Learnings from penetration tests conducted against APM are shared with all relevant D&T teams.'
    }, {
      r: 'External breach notification',
      d: 'Cyber Security monitors external sources for third-party breaches containing APM user data and notifies affected users by email.'
    }, {
      r: 'Threat intelligence distribution',
      d: 'Actionable threat intelligence from the Cyber Security team or external SOC provider is provided to D&T leaders.'
    }, {
      r: 'Industry benchmarking',
      d: 'Provided to business leaders where available, for example phishing simulation click rate compared with industry peers.'
    }, {
      r: 'Business unit responsibility',
      d: 'Unless otherwise specified, the relevant business unit or contract holder communicates with their key stakeholders regarding the APM ISMS in line with the ISO 27001 strategy.'
    }],
    impact: [{
      level: 'info',
      t: 'Participant Kiosk pen test findings will be shared across D&T',
      d: 'Penetration test learnings are shared with all relevant D&T teams, so the Phase 4 findings (\u00a79.5.4) become an estate-wide input, not just a fleet artefact.'
    }]
  }, {
    id: '09.03.015-6.0',
    slug: 'special-interest-groups',
    title: 'Cyber Security Contact with Special Interest Groups',
    cat: 'Monitoring & Assurance',
    owner: 'CISO',
    published: '02/07/2026',
    classification: 'Internal',
    pages: 1,
    file: 'CS-Contact-with-Special-Interest-Groups.pdf',
    purpose: 'Records APM Cyber Security team membership of external security special interest groups and the resulting access to threat intelligence and professional development.',
    reqs: [{
      r: 'Professional body membership',
      d: 'Members of ISC2 (International Information System Security Certification Consortium) and AISA (Australian Information Security Association).'
    }, {
      r: 'Continuing education',
      d: '40 hours of continual education required each year to maintain qualifications.'
    }, {
      r: 'ACSC relationship',
      d: 'APM has signed a legal memorandum of understanding with the Australian Cyber Security Centre, with access to the ACSC partner portal and community Slack server providing threat intelligence and early warning notifications by email, portal, Slack and dedicated threat intelligence feeds.'
    }],
    impact: [{
      level: 'info',
      t: 'ACSC MOU is the escalation channel referenced by the IR plan',
      d: 'The ASD notification path in the Incident Response Plan runs through this existing relationship.'
    }]
  }, {
    id: 'SOE V3.0',
    slug: 'soe-hardening',
    title: 'Windows SOE Hardening Standard V3.0',
    cat: 'Endpoint & SOE',
    owner: 'End User Computing Manager (content expert); approved by Head of Digital Operations; responsible executive ANZ CIO',
    published: '2026',
    classification: 'APM Internal',
    pages: '11 policy sheets',
    file: 'APM-Windows-SOE-Hardening-Standard-V3.0.xlsx',
    purpose: 'Endpoint hardening applied through Intune, control by control - 748 controls across 11 policies, benchmarked against ASD Windows Hardening Guidelines, the Microsoft Windows 11 v24H2 baseline and the Microsoft Edge security baseline v139, whichever is higher.',
    reqs: [{
      r: '748 controls across 11 policies',
      d: '568 meet or exceed the ASD or Microsoft baseline, 171 are additional hardening beyond it, 9 are recorded as Partial (set below benchmark with a reason). Overall 98.4% met.'
    }, {
      r: 'Windows 11 security baseline (OS) - 594 controls',
      d: 'APM-W11-SEC-Baseline-P-1.2. Carries AutoPlay and AutoRun disabled on all drives, Credential Guard with UEFI lock, virtualisation-based security, SMB v1 disabled, anonymous SAM enumeration denied, PowerShell execution policy allowing only signed scripts with script block logging, Remote Assistance and Remote Shell disabled, inbound Remote Desktop disabled, built-in Administrator and Guest accounts disabled and renamed, minimum device password length 14, machine inactivity limit 900 seconds, full audit policy set.'
    }, {
      r: 'Removable storage control - 16 controls',
      d: 'APM-WIN-SEC-USB Baseline-P-1.0. All Removable Storage classes deny all access (Enabled); Removable Disks deny write access (Enabled); BitLocker requires encryption on removable drives.'
    }, {
      r: 'Attack surface reduction - 20 controls',
      d: 'APM-WIN-SEC-ASR-P-1.0. Includes blocking untrusted and unsigned processes running from USB, LSASS credential theft blocking, obfuscated script blocking, prevalence/age/trusted-list executable blocking, PSExec and WMI process creation blocking, WMI persistence blocking. Controlled Folder Access is set to audit only (Partial) due to legacy applications.'
    }, {
      r: 'Application Control (App Control for Business) - 12 controls',
      d: 'Audit and Enforced policies, base policy v2026.03.27.0216, 18 trusted signers, managed installer enabled, supplemental policies allowed, revoked/expired treated as unsigned. Script Enforcement is DISABLED in both policies - flagged in the standard\u2019s own assessment as an item to enable for ASD script control.'
    }, {
      r: 'BitLocker - 20 controls',
      d: 'APM-W11-SEC-Bitlocker-P-1.1. XTS-AES 256-bit on OS, fixed and removable data drives; additional authentication at startup required; recovery information stored in Entra ID before encryption; client-driven recovery password rotation; write access blocked to fixed and removable data drives not protected by BitLocker.'
    }, {
      r: 'Microsoft Edge security baseline - 25 controls',
      d: 'APM-W11-SEC-Edge Baseline-P-1.2. Password Manager disabled, about:flags blocked, certificate error overrides prevented, SmartScreen enforced with no override for downloads or prompts, DNS-over-HTTPS off, extension install allow-list and block-list enforced, download restrictions enabled, application bound encryption enabled.'
    }, {
      r: 'Developer tools restriction',
      d: 'APM-W11-SEC-Edge Dev Baseline-P-2.0 disables Developer Tools availability. A scoped exception group (APM-W11-SEC-Edge Dev Exception-P-2.0) enables them and is recorded as Partial, below the Microsoft baseline, by design.'
    }, {
      r: 'Windows compliance policy - 9 controls',
      d: 'Staff-Windows-Compliance-Policy. BitLocker, Secure Boot, Firewall, TPM, Antivirus, Antispyware, Defender Antimalware, security intelligence up to date, real-time protection - all Required. Observation recorded: no minimum OS version enforced.'
    }, {
      r: 'Microsoft Store is allowed (Partial)',
      d: '"Turn off the Store application" is Disabled, set below the benchmark because some government contracts require Store-only applications.'
    }],
    impact: [{
      level: 'good',
      t: 'The kiosk design is already aligned to this standard',
      d: 'Participant Kiosk \u00a77.3.1 to 7.3.7 documents inheritance, three named removable-media exclusions with compensating controls, kiosk-additional controls, and the alignment items. The kiosk closes the standard\u2019s own minimum-OS-version observation and turns the Store off.'
    }, {
      level: 'flag',
      t: 'Estate script enforcement gap affects any design leaning on App Control',
      d: 'Script Enforcement is off in both estate App Control policies. Any design that cites App Control as a compensating control must either enable script enforcement in its own variant (as the kiosk does) or re-base the compensation on ASR rules.'
    }]
  }, {
    id: '09.03.035-5.0',
    slug: 'identity-access-management',
    title: 'Identity and IT Access Management Standard',
    cat: 'Identity & Access',
    owner: 'CISO',
    published: '23/02/2026',
    classification: 'Internal',
    pages: 15,
    file: 'policies/CS-Identity-and-IT-Access-Management-Standard.pdf',
    purpose: 'The minimum standards for controlling access to APM IT Assets: identification, authentication, account management, system configuration, application management and access reviews. One of the eleven previously-missing load-bearing standards - now held.',
    reqs: [{
      r: 'Client systems are segregated from APM IT systems (\u00a75)',
      d: 'IT assets used by clients (e.g. job seekers applying for jobs) must not connect to any non-public APM IT systems. No information created by the client is stored on the asset. Clients receive acceptable-use guidelines. APM employees must not use client-designated assets for their duties. Clients are explicitly NOT Users under this standard.'
    }, {
      r: 'Shared and generic accounts (\u00a74.1, \u00a74.2.2)',
      d: 'Shared IDs avoided unless business justification approved by the Cyber Security Team; never for sensitive applications. Generic accounts: minimum rights, no corporate-system access, a process identifying the user, password reset on membership change and at 12 months.'
    }, {
      r: 'MFA for all Users; single-factor needs 15+ characters (\u00a74.1.2, ISM-0417)',
      d: 'Authentication methods susceptible to replay avoided; external services use SSO where possible.'
    }, {
      r: 'Local administrator passwords 30+ characters, LAPS-rotated every 30 days (\u00a74.2.2 \u00b68-9)',
      d: 'Applies to LAPS-managed accounts explicitly. Distinct per device; Guest disabled.'
    }, {
      r: 'Privileged accounts 15+ characters, restricted, recorded, time-bound (\u00a74.2.2 \u00b61-7)',
      d: 'No email or web browsing from privileged accounts; system utilities that bypass access control logged and reviewed.'
    }, {
      r: 'Service accounts as gMSA / managed identities where possible (\u00a74.2.2 \u00b618-29)',
      d: 'Interactive service accounts 30+ characters, changed on compromise indicators and at 12 months; minimum permissions; named owner.'
    }, {
      r: 'Break glass accounts (\u00a74.2.3)',
      d: '30+ character passwords, unidentifiable names, MFA-independent configuration, credential change after each use, all activity logged with immediate notifications, regular validation.'
    }, {
      r: 'Standard user passwords (\u00a74.3)',
      d: '8+ characters, 3 of 4 complexity categories, 90-day expiry, 3-password history, first-logon change, no clear-text display or transmission.'
    }, {
      r: 'Account locks after 5 failed attempts (\u00a74.3)',
      d: 'Unlock only after the administrator proves the user\u2019s identity.'
    }, {
      r: 'Session/screen locks within 15 minutes on staff computers (\u00a74.3)',
      d: 'Conceals all information, requires reauthentication, cannot be disabled by users.'
    }, {
      r: 'Same-day account deactivation on termination; 30-day inactivity disable (\u00a74.2.5)',
      d: 'Across all IT systems.'
    }, {
      r: 'App control rules validated annually (\u00a74.4)',
      d: 'Hash, publisher certificate and path rules. Standard users cannot uninstall approved software.'
    }, {
      r: 'Non-configurable systems need a risk assessment and Cyber exemption (\u00a74.3)',
      d: 'Any IT asset that cannot meet these requirements must be risk assessed with an exemption sought from the Cyber Security Team.'
    }],
    impact: [{
      level: 'good',
      t: '\u00a75 is the policy basis for the whole Participant Kiosk model',
      d: 'The kiosk is a client-designated asset: participants are clients, not Users. \u00a75 requires exactly what the design does - no connection to non-public APM systems (three-layer M365 block), no client information stored (restart purge), acceptable-use guidance (wallpaper notice). Cite \u00a75 in \u00a77 of the design as the standard that the fleet implements rather than deviates from.'
    }, {
      level: 'good',
      t: 'LAPS password length raised to 30 in the kiosk design',
      d: '\u00a74.2.2 \u00b69 requires local administrator passwords including LAPS-managed to be at least 30 characters. The Participant Kiosk stated 20; raised to 30 in V1.2 (7 Aug 2026, \u00a77.2.3) when this standard arrived, with the clause cited in the settings table.'
    }, {
      level: 'flag',
      t: 'Session account is a shared/anonymous account under \u00a74.2.2',
      d: 'The Kiosk-[SERIAL] account is generic by design (no user identification). \u00a74.2.2 \u00b614 requires a Cyber-approved business justification and an allocation record. The per-device binding and DR-011 carry most of this - confirm Cyber\u2019s DR-011 sign-off explicitly covers the generic-account justification.'
    }]
  }, {
    id: '09.03.034-3.0',
    slug: 'idps-standard',
    title: 'Intrusion Detection and Prevention Standard',
    cat: 'Monitoring & Assurance',
    owner: 'CISO',
    published: '16/07/2025',
    classification: 'Internal',
    pages: 5,
    file: 'policies/CS-Intrusion-Detection-and-Prevention-Standard.pdf',
    purpose: 'Detection and prevention standards across network, wireless, host, email and SIEM layers for all IT assets connected to APM systems.',
    reqs: [{
      r: 'Network detection at every gateway',
      d: 'Signature and anomaly-based detection wherever traffic is inspected or traverses a gateway; ingress and egress inspected; east-west traffic within the cloud environment inspected.'
    }, {
      r: 'EDR mandatory on end user devices',
      d: 'Cloud-managed platform combining anti-malware, anti-spyware, behaviour analysis, rootkit and anomaly detection, plus a cloud heuristic engine for unknown strains on workstations and servers.'
    }, {
      r: 'EUC web traffic inspected, logged, alerted',
      d: 'Detection for malware, known malicious hosts, botnet and C2 infrastructure.'
    }, {
      r: 'Webmail blocked at APM',
      d: 'Email may only be accessed through Microsoft Outlook on APM devices - maintains data control and limits loss through third-party email applications.'
    }, {
      r: '24/7 external SOC and SIEM correlation',
      d: 'Logs and alerts to the external SOC (threat hunters, incident responders, intrusion analysts); host-based IPS alerts the Cyber Security Team directly; SIEM correlates endpoint and gateway logs with AI/behaviour analytics.'
    }, {
      r: 'Wireless standardisation',
      d: 'Wireless infrastructure standardised across the APM network; attack-signature databases continually cloud-updated.'
    }],
    impact: [{
      level: 'flag',
      t: 'Kiosk permits personal webmail - argue the client-asset carve-out explicitly',
      d: 'This standard blocks all webmail at APM; the Participant Kiosk deliberately leaves personal webmail reachable. The reconciliation is IAM \u00a75: the kiosk is a client asset outside APM IT systems, participants are not Users, and no APM mailbox exists on the device. The design should cite both standards together so the apparent conflict is pre-argued.'
    }, {
      level: 'good',
      t: 'Kiosk telemetry already matches the reporting model',
      d: 'MDE P2 (EDR), Zscaler web inspection with logging, and Sentinel correlation are all in the design; \u00a79.2 states where each alert lands.'
    }]
  }, {
    id: '09.03.044-4.0',
    slug: 'identity-protection',
    title: 'Identity Protection Standard',
    cat: 'Identity & Access',
    owner: 'CISO',
    published: '16/07/2025',
    classification: 'Internal',
    pages: 2,
    file: 'policies/CS-Identity-Protection-Standard.pdf',
    purpose: 'Mandates Microsoft Defender for Identity monitoring of all Active Directory activity on APM Domain Controllers, covering the attack kill chain from reconnaissance to domain dominance.',
    reqs: [{
      r: 'Defender for Identity on all APM Domain Controllers',
      d: 'Mandatory. Detects reconnaissance, credential compromise, lateral movement (Pass the Ticket/Hash), and domain dominance (DC Shadow, Golden Ticket).'
    }, {
      r: 'Logs to Sentinel',
      d: 'MDI sends logs to Sentinel for SOC review and alerting; access via security.microsoft.com restricted to authorised privileged users.'
    }],
    impact: [{
      level: 'info',
      t: 'Scope is Domain Controllers - Entra-only designs are out of scope by construction',
      d: 'Our device designs are Entra-joined with no AD DS, so MDI does not attach. Any AVD or server design that touches the ADDS DCs in aus-sub-identity must confirm the MDI sensor is present on them.'
    }]
  }, {
    id: '01.01.004-8.3',
    slug: 'risk-management-framework',
    title: 'Risk Management Framework',
    cat: 'Governance & Compliance',
    owner: 'Chief Risk Officer',
    published: '6/05/2026',
    classification: 'Internal',
    pages: 25,
    file: 'policies/APM-Risk-Management-Framework.pdf',
    purpose: 'APM\u2019s enterprise risk methodology (ISO 31000-consistent): governance, three lines of defence, likelihood and consequence criteria, risk matrix, control effectiveness, treatment and acceptance authorities.',
    reqs: [{
      r: 'Likelihood scale 1-5',
      d: 'Rare (5+ years) to Almost Certain (within a month).'
    }, {
      r: 'Consequence scale 1-5 across five dimensions',
      d: 'Financial (EBITDA %), Strategic, Operational, Reputational, Compliance - Insignificant to Severe.'
    }, {
      r: 'Risk matrix produces Negligible / Minor / Moderate / High / Extreme',
      d: 'Inherent rating from likelihood \u00d7 consequence; residual = inherent \u00d7 control effectiveness, mapped back to the matrix with a subjective sanity check.'
    }, {
      r: 'Acceptance authorities by rating (Appendix E)',
      d: 'Extreme: Board only. High: ARC only. Moderate: responsible Executive. Minor: business unit head. Negligible: relevant manager. High/Extreme reviewed by the Executive Team at least monthly.'
    }, {
      r: 'Treatment options',
      d: 'Accept, Treat, Transfer, Avoid - treatment plans documented in the risk register with approval per the acceptance table.'
    }, {
      r: 'Risks recorded in the enterprise risk register',
      d: 'Risk owners keep divisional profiles current; material risk profile reviewed bi-annually by the ARC; post-incident reviews after significant events.'
    }],
    impact: [{
      level: 'flag',
      t: 'Design risk registers should rate on the APM scales',
      d: 'Our DDD risk registers rate likelihood/consequence qualitatively. Mapping them to the 1-5 scales and the five-band residual rating makes them transferable into Clew and tells the approver which acceptance authority each risk needs (a High residual needs the ARC, not a project sign-off).'
    }]
  }, {
    id: 'ENV-ESLZ',
    slug: 'azure-landing-zone',
    title: 'Azure Enterprise-Scale Landing Zone (APAC) - as designed v1.1',
    cat: 'Configuration',
    owner: 'Head of Digital Transformation and Architecture',
    published: '2026',
    classification: 'Internal',
    pages: 300,
    file: 'reference/environment/Azure-Landing-Zone-APAC-DetailedDesign-v1.1.docx + reference/eslz/ (4 corpus parts)',
    purpose: 'The environment our Azure-touching designs deploy into: hub-spoke across Australia East (10.40.0.0/16) and Australia Southeast (10.50.0.0/16), CAF-aligned management groups, controlled and standard security domains.',
    reqs: [{
      r: 'Management group hierarchy',
      d: 'AUS-MG-PLATFORM (Connectivity, Identity, Security, Management), AUS-MG-{PROD|DEV|SIT|UAT}-{CONTROLLED|STANDARD}, AUS-MG-ACQUISITIONS, AUS-MG-SANDBOX. Sandbox never peers to the hub.'
    }, {
      r: 'Subscription and VNet plan',
      d: 'aus-sub-connectivity (hub VNets), -identity (ADDS DCs, 10.40.4.0/24 / 10.50.4.0/24), -management, workload spokes per environment and domain, AVD spoke aus-sub-avd-controlled-001 (auea-vnet-avd-ctrl-001, 10.40.88.0/23).'
    }, {
      r: 'DNS',
      d: 'Azure DNS Private Resolver in the connectivity subscription; private DNS zones per service ([region]-pdz-*).'
    }, {
      r: 'Public IP creation denied outside connectivity (DD-17)',
      d: 'Azure Policy denies public IPs in all management groups except the connectivity subscription; ingress rides the hub.'
    }, {
      r: 'PIM everywhere',
      d: 'Role-Admin-AzureMG* groups are eligible time-bound assignments per management group; no standing access.'
    }],
    impact: [{
      level: 'info',
      t: 'The AVD SOEs land in an existing spoke',
      d: 'aus-sub-avd-controlled-001 / auea-vnet-avd-ctrl-001 (10.40.88.0/23) is already provisioned in the controlled domain - the Standard User and Developer SOE designs target it rather than requesting new subscriptions.'
    }, {
      level: 'info',
      t: 'Interaction triggers live in environment-config.js',
      d: 'The compliance checker now raises advisory findings when a design touches ESLZ configuration: spoke placement, CIDR allocation, public-IP policy, naming.'
    }]
  }, {
    id: 'ENV-PALO',
    slug: 'palo-alto-hub-firewalls',
    title: 'Palo Alto VM-Series hub firewalls - as built V1.0',
    cat: 'Configuration',
    owner: 'Digital Operations',
    published: '22/07/2026',
    classification: 'Internal',
    pages: 40,
    file: 'reference/environment/Palo-Alto-Firewall-Deployment-As-Built-V1.0.docx',
    purpose: 'The enforcement point for all Azure traffic: North-South and East-West VM-Series clusters in each regional hub, Panorama-managed, default-deny both directions.',
    reqs: [{
      r: 'All traffic inspected',
      d: 'UDRs force north-south (internet, on-prem) and east-west (inter-VNet) flows through the firewall load balancers. Default interzone AND intrazone rules overridden to drop and log.'
    }, {
      r: 'Outbound is allow-listed',
      d: 'Security policy permits named applications and URL categories only; proxy-avoidance and anonymizers blocked; all outbound logged. HTTP egress rides IPSEC tunnels to Zscaler; non-HTTP SNATs out the public interfaces.'
    }, {
      r: 'Panorama HA manages everything',
      d: 'AE active / ASE passive; template stacks and device groups; changes via Panorama only; SAML (Entra) admin auth with break-glass; access from the privileged jump host only.'
    }, {
      r: 'Logs to Sentinel',
      d: 'Firewalls forward to Panorama (2TB rolling); Panorama forwards syslog to Sentinel via a syslog VM.'
    }, {
      r: 'Backhaul via Meraki SD-WAN',
      d: 'vMX in the legacy AE landing zone advertises BGP routes; inspected traffic forwards to the active vMX.'
    }, {
      r: 'Open: DNS/NTP for firewall services TBC',
      d: 'Pending the Infrastructure Team decision; designs must not assume.'
    }],
    impact: [{
      level: 'info',
      t: 'Every new Azure egress is a firewall change',
      d: 'A design that adds cloud egress must name FQDNs, ports and applications so the Panorama rule can be raised verbatim - \u00a75.3 named-egress tables are not optional decoration.'
    }]
  }, {
    id: 'ENV-NAMING',
    slug: 'azure-eslz-naming',
    title: 'Azure ESLZ Naming Standard',
    cat: 'Configuration',
    owner: 'Digital Operations',
    published: '17/07/2026',
    classification: 'Internal',
    pages: 5,
    file: 'reference/environment/Azure-ESLZ-Naming-Standards-17July2026.pdf',
    purpose: 'Naming formats for every Azure resource type in the landing zone. Complements the APM Intune Naming Schema V1.0 (device-side objects), which our designs already follow.',
    reqs: [{
      r: 'General form',
      d: '[region]-[type]-[environment]-[apm security domain]-[descriptor]-[instance]: auea-rg-prod-ctrl-appname-001, ause-nsg-prod-std-web-001, auea-kv-management-001.'
    }, {
      r: 'Compact forms for VMs and storage',
      d: 'aevmpadds001, aestpcappname001, aestxflowlog001, aefwppalo001. Palo RGs always contain "palo".'
    }, {
      r: 'Management groups ALL CAPS, subscriptions lower with full domain word',
      d: 'AUS-MG-PLATFORM; aus-sub-prod-controlled-01.'
    }, {
      r: 'NSG rule names',
      d: '[allow|deny]-[ib|ob]-[source]-to-[destination]-[descriptor]-[nn], e.g. allow-ob-azmonitor-to-law-https-01.'
    }],
    impact: [{
      level: 'info',
      t: 'Design settings tables must use these exact forms',
      d: 'Any Azure object a design creates is named here first - the checker now flags Azure resource mentions so the names get written in, not invented at build time.'
    }]
  }, {
    id: 'ENV-DOCSET',
    slug: 'apm-document-templates',
    title: 'APM solution document templates - DDD V0.1 and TCD V0.1',
    cat: 'Configuration',
    owner: 'Head of Digital Transformation and Architecture',
    published: '21/07/2026',
    classification: 'Internal',
    pages: 20,
    file: 'reference/apm-document-templates/APM_Detail_Design_Document_Template_V0.1.docx + APM_Technical_Configuration_Document_Template_V0.1.docx',
    purpose: 'APM\u2019s own template pair: the DDD argues the design (business \u2192 application \u2192 technology \u2192 information \u2192 cyber \u2192 availability \u2192 service management - the same spine as our detailed-design standard) and the Technical Configuration Document carries build-level configuration as de-facto as-built.',
    reqs: [{
      r: 'DDD covers architecture domains in order',
      d: 'Introduction, Overview, Business, Application, Technology, Information & Data, Cyber & Security, Availability & DR, Service Management. Cover: Project Name, Owner, Contact, Program, Division/Unit, Status, Version, Product ID + Consultation + References and Derivation + SDA Approval.'
    }, {
      r: 'TCD carries the build detail',
      d: 'IP addressing, DNS records, load balancing, NAT and firewall rules, compute, RBAC groups, accounts, CA rules, AV exclusions, DNS/NTP/logging/monitoring/patching/PKI/SMTP, RPO/RTO, backup/restore, capacity planning.'
    }, {
      r: 'SDA approval',
      d: 'Both templates carry a Solution Design Authority approval block - the formal gate for designs.'
    }],
    impact: [{
      level: 'flag',
      t: 'Plan a TCD companion per use case',
      d: 'Our DDDs carry most TCD content in \u00a75.3-style settings tables, but APM review may ask for the TCD artefact itself. Produce one per use case as build detail lands, and add the SDA approval step to each design\u2019s approval path.'
    }]
  }, {
    id: 'ENV-CA',
    slug: 'conditional-access',
    title: 'Conditional Access policy set - APM corporate tenant',
    cat: 'Configuration',
    owner: 'APM Cyber Security',
    published: '07/08/2026',
    classification: 'Internal',
    pages: 116,
    file: 'policies/APM-Conditional-Access-Policies-Export.csv',
    purpose: 'The live Conditional Access estate: 116 policies, of which 68 are enforced, 43 are report-only and 5 are disabled. Full findings and a searchable policy table are in policies/APM_CA_Policy_Analysis.html; parsed data in ca-policies.js, findings in ca-analysis-data.js, and six advisory interactions as ENV-CA in environment-config.js.',
    reqs: [{
      r: 'Enforced tenant-wide (all users, all apps)',
      d: 'Deny Legacy Auth (block) \u00b7 CA-100 legacy protocols (block) \u00b7 CA-102 locations except AU and corporate (block) \u00b7 CA-104 high sign-in risk (block) \u00b7 CA-105 bad IPs (block) \u00b7 CA-201 BYOD browser no persistence \u00b7 CA-203 high user risk (MFA + password change) \u00b7 AllUsers_AllAccess_DeviceRequired (compliant OR Entra-joined) \u00b7 AllUsers_AllAccess_MFAorDeviceRequired (MFA OR Entra-joined).'
    }, {
      r: 'Report-only, and therefore not a control',
      d: 'CA-101 tenant-wide MFA \u00b7 CA-106 and CA-401 phishing-resistant MFA \u00b7 AdminRoles_Everything_RequireMFA \u00b7 AdminRoles_Everything_RequireDevice \u00b7 CA-103 unsupported platforms \u00b7 CA-400 and CA-402 administrator device and location \u00b7 Guests_Everything_MFARequired \u00b7 AllUsers_UnapprovedCountries_Block \u00b7 AllUsers_AllAccess_BlockLegacy.'
    }, {
      r: 'A managed device satisfies both enforced grants',
      d: 'An Entra-joined, Intune-compliant device satisfies AllUsers_AllAccess_DeviceRequired and AllUsers_AllAccess_MFAorDeviceRequired, the second with no MFA prompt at all. Blocking a managed fleet from corporate services is therefore always explicit, never inherited.'
    }, {
      r: 'Naming convention',
      d: 'CA-nnn - audience - apps - condition - action, by series: CA-1xx all users and guests, CA-2xx organisation users, CA-3xx contract and community populations, CA-4xx administrators, CA-5xx guests. CA-100 to CA-106 are in use. Legacy families also present: AllUsers_*, AdminAccounts_*, AdminRoles_*, POC_EarlyAccess_*, GuestAccess_*.'
    }, {
      r: 'Risk-based policies are live and user-keyed',
      d: 'CA-104, CA-203, AdminRoles_Risky_Sign-ins_MFA and AdminRoles_RiskyUsers_MFA_Password_Reset are enforced, so Entra ID P2 risk signals are licensed and in use. All of them evaluate a user principal, so a fleet with no user identity is never assessed by them.'
    }, {
      r: 'Retired kiosk policies',
      d: 'Fourteen in two families: CA-APM-Kiosk-* (seven, all report-only) and CA-APM-KioskPB-* (seven, six enforced). Both assign to groups of user identities, so all fourteen stop matching anything once the kiosk user group is retired.'
    }, {
      r: 'Export limitation',
      d: 'The CSV carries name, state, users, groups, applications and grant rules only. No exclusions, conditions, device filters, locations, platforms, client apps, session controls, authentication strengths or directory-role targets. A blank grant rule means session control or authentication strength, not no control. Request identity/conditionalAccess/policies from Graph for the full object.'
    }],
    impact: [{
      level: 'good',
      t: 'Kiosk CA policy count corrected: fourteen, not seven, six of them enforced',
      d: 'The Participant Kiosk decommissioning change request disposed of "seven" kiosk policies. The export shows two families of seven: CA-APM-Kiosk-* (all report-only) and CA-APM-KioskPB-* (six enforced). Both assign to user groups, so all fourteen become silent no-ops when the group is retired. Corrected in the change request on 7 Aug 2026, with an evidence export required before deleting the enforced family.'
    }, {
      level: 'good',
      t: 'Phishing-resistant MFA claim corrected in the design',
      d: 'Participant Kiosk V1.2 \u00a77.2.4 listed phishing-resistant MFA for administrators among the tenant\u2019s existing protections. CA-401 and CA-106 are both report-only, as is CA-101 tenant-wide MFA. V1.3 now names the nine genuinely enforced policies and forbids citing phishing-resistant MFA as a compensating control anywhere in the design.'
    }, {
      level: 'good',
      t: 'The export proves the device-filter block is load-bearing',
      d: 'Because a Participant Kiosk is Entra-joined and compliant, it satisfies both enforced tenant-wide grants - the second without any MFA prompt. A staff credential typed on a kiosk would pass the estate\u2019s strongest controls. That is now the argument for DR-010 in V1.3, and it is stronger than the one the design had.'
    }, {
      level: 'flag',
      t: 'Thirty-seven per cent of the estate grants and denies nothing',
      d: '43 report-only and 5 disabled against 68 enforced. Report-only includes tenant MFA, phishing-resistant MFA and administrator device and location restrictions. Essential Eight maturity and the Identity and IT Access Management Standard 4.1.2 both require MFA to be enforced. Raised as an estate finding with APM Cyber Security; until resolved, no design in this project may cite tenant MFA as a compensating control.'
    }, {
      level: 'flag',
      t: 'Policy hygiene: duplicates, test artefacts and enforced provisional names',
      d: 'CA-501 ends in the literal word COPY and is enabled. zzADA_Block_Policy_Test_20250626 is still present. APM Pilot Block Policy and APM Pilot Policy are both enabled and both block all apps. Four CA numbers are duplicated. Eight _Reporting twins. Two enabled policies grant MFA under a name that says Block. Supplied to APM Cyber Security as an estate hygiene list.'
    }, {
      level: 'info',
      t: 'Exclusion registers cannot be verified from this export',
      d: 'No exclusions column. Nine policies target all users against all apps and cannot be checked, so the Conditional Access half of any design\u2019s corporate-assignment exclusion register stays unverified until the full Graph export arrives.'
    }]
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "policies/policy-data.js", error: String((e && e.message) || e) }); }

// program/doc-page.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <doc-page> — paged-document shell for printable HTML.
 *
 * On screen the document renders as a single continuous sheet on a desk
 * background (Google Docs' pageless view): you scroll one tall page card.
 * There is no manual page-splitting — write the whole document as normal
 * flow inside <doc-page> and the browser's print engine paginates it at
 * export.
 *
 * At print the component injects `@page { size: …; margin: 0 }` (which
 * leaves Chrome no margin box to draw its date/URL/page-count header in)
 * and moves the visual margin onto the sheet's own padding, so the printed
 * page has the same inset you see on screen. Standard break-hygiene rules
 * (`break-inside: avoid` on figures, code blocks, images and table rows;
 * `orphans/widows: 3`) are applied so paragraphs and groups split cleanly.
 * On screen and at print, headings default to `text-wrap: balance` and
 * body text (p, li, blockquote, figcaption) to `text-wrap: pretty`, so
 * the document avoids widowed/orphaned words; the defaults have zero
 * specificity, so any text-wrap you declare on those elements wins.
 * The component also marks the document as owning its print CSS (a
 * `meta[name="omelette-owns-print"]` it injects at runtime), so the
 * PDF export never injects page-geometry CSS of its own on top.
 *
 * Usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page size="letter" margin="0.75in">
 *     <h1>Title</h1>
 *     <p>…body…</p>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 *
 * Attributes:
 *   size    — letter | a4 | legal (default letter)
 *   orientation — portrait (default) | landscape. For documents built to
 *           export, always set it explicitly. landscape swaps the named
 *           size's dimensions (letter landscape prints 11in × 8.5in).
 *   width / height — explicit CSS lengths, override `size` and
 *           `orientation`: the page IS the design's size (a poster
 *           printed at its true dimensions). With both set, the component
 *           also declares the page box as the preview size (a
 *           `meta[name="omelette-fixed-size"]` it injects at runtime,
 *           never overriding one you author), so the in-app preview
 *           scales the whole sheet into view.
 *   content-width / content-height — the design's own fixed dimensions
 *           (CSS lengths), for scaling a fixed-size design ONTO the named
 *           paper: content lays out at exactly this size, and the
 *           component scales it to fit the printable area (centered
 *           horizontally, top-aligned), so e.g. a 960px-wide poster lands
 *           on one Letter page. Both must be set; they do not change the
 *           page box — `size`/`orientation` (or `width`/`height`)
 *           still name the paper. For pages WITHOUT running
 *           header/footer slots — the fit box fills the printable area
 *           and does not subtract slot heights.
 *   margin  — printable inset on every page (default 0.75in); margin="0"
 *           makes pages full-bleed (content then owns its own insets)
 *
 * Running header/footer (optional): give an element `slot="header"` or
 * `slot="footer"` and it repeats on every printed page via
 * `position: fixed`. To keep body text from sliding under it, the
 * component prints inside a single-cell table whose <thead>/<tfoot> are
 * spacers sized to the header/footer height — browsers repeat thead/tfoot
 * on every page, so each sheet's content starts below the header and ends
 * above the footer. On screen the header/footer render once at the
 * top/bottom of the sheet.
 *
 * Print best practices for the content you author:
 * - Multi-column text: use CSS columns (`column-count` +
 *   `column-gap`), never side-by-side flex/grid columns — only real
 *   CSS columns flow and break across pages. `column-span: all` lets
 *   a heading span the columns; `hyphens: auto` (needs `lang` on
 *   the html element) keeps narrow columns readable.
 * - Page breaks: `break-before: page` on an element that must start
 *   a new page (a chapter, an appendix). Add your own kept-together
 *   blocks (callouts, stat tiles, cards) to a `break-inside: avoid`
 *   rule, and keep each one shorter than a page.
 * - Extend `orphans: 3; widows: 3` to any custom text blocks you add
 *   (p and li are covered by default).
 * - Give long tables a <thead> — browsers repeat it on every printed
 *   page.
 * - No `position: fixed`/`sticky` and no viewport units in content:
 *   fixed elements stamp every printed page (running headers/footers go
 *   in the component's slots) and `100vh` mis-sizes at print.
 *
 * Author content as static HTML so the user can click-to-edit any text
 * directly. Do not set width/padding/background on the document body —
 * the component owns the sheet box.
 */
/* END USAGE */

(() => {
  const PAPER = {
    letter: ['8.5in', '11in'],
    a4: ['210mm', '297mm'],
    legal: ['8.5in', '14in']
  };
  const CSS_LENGTH = /^\d+(\.\d+)?(px|in|mm|cm|pt|pc)$/;
  // Unitless "0" is a valid CSS length and the natural way to write
  // margin="0"; normalise it to 0px so max()/calc() (which reject a bare
  // number) keep working.
  const safeLen = (v, fb) => {
    v = (v || '').trim();
    return v === '0' ? '0px' : CSS_LENGTH.test(v) ? v : fb;
  };
  // CSS length → px number (CSS absolute units are exact: 1in = 96px).
  // Returns NaN for anything safeLen would reject — callers gate on it.
  const PX_PER = {
    px: 1,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
    pt: 96 / 72,
    pc: 16
  };
  const toPx = v => {
    const m = /^(\d+(?:\.\d+)?)(px|in|mm|cm|pt|pc)$/.exec((v || '').trim());
    return m ? parseFloat(m[1]) * PX_PER[m[2]] : NaN;
  };
  const stylesheet = `
    :host {
      position: relative;
      display: block;
      /* When the viewport is narrower than the page, grow to wrap the
       * sheet (plus this padding) instead of staying viewport-width, so
       * the desk background and right margin reach the sheet's far edge
       * in the horizontal scroll. */
      min-width: max-content;
      min-height: 100vh;
      background: #ece8dd;
      padding: 48px 24px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      --doc-page-w: 8.5in;
      --doc-page-h: 11in;
      --doc-page-margin: 0.75in;
      --doc-hdr-h: 0px;
      --doc-ftr-h: 0px;
      --doc-hdr-pad: 0px;
      --doc-ftr-pad: 0px;
    }
    .sheet {
      width: var(--doc-page-w);
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 2px 14px rgba(20, 20, 19, 0.12);
      border-radius: 2px;
      box-sizing: border-box;
      padding: var(--doc-page-margin);
    }
    .frame { width: 100%; border-collapse: collapse; }
    /* Scaled-fit mode (content-width/content-height): the inner .fit box
     * lays the content out at its authored fixed size and scales it onto
     * the printable area; .fit-box reserves the scaled footprint in flow
     * (transforms don't affect layout) and centers it. Without the mode,
     * both divs are unstyled block pass-throughs. */
    .fit-mode .fit-box {
      width: calc(var(--doc-fit-w) * var(--doc-fit-scale));
      height: calc(var(--doc-fit-h) * var(--doc-fit-scale));
      margin: 0 auto;
      break-inside: avoid;
    }
    .fit-mode .fit {
      width: var(--doc-fit-w);
      height: var(--doc-fit-h);
      transform: scale(var(--doc-fit-scale));
      transform-origin: top left;
    }
    .frame td, .frame th { padding: 0; text-align: left; font-weight: inherit; }
    .hdr-space { height: var(--doc-hdr-h); }
    .ftr-space { height: var(--doc-ftr-h); }
    ::slotted([slot="header"]),
    ::slotted([slot="footer"]) { display: block; box-sizing: border-box; }
    @media print {
      :host { background: none; padding: 0; min-width: 0; min-height: 0; }
      .sheet {
        width: auto; margin: 0; box-shadow: none; border-radius: 0;
        padding: 0 var(--doc-page-margin);
      }
      /* The thead/tfoot spacers repeat on every page, so they carry the
       * vertical page margin (which the sheet's own padding cannot, since
       * that padding is consumed once on the first/last page). The running
       * header/footer are fixed inside that band. */
      /* The 0.35in is breathing room between a running header/footer and
       * the body; without one the spacer is exactly the page margin, so a
       * margin="0" full-bleed document gets truly full-bleed pages. */
      .hdr-space { height: max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))); }
      .ftr-space { height: max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))); }
      ::slotted([slot="header"]) {
        position: fixed; top: 0; left: 0; right: 0; margin: 0;
        padding: calc(var(--doc-page-margin) * 0.45) var(--doc-page-margin) 0;
      }
      ::slotted([slot="footer"]) {
        position: fixed; bottom: 0; left: 0; right: 0; margin: 0;
        padding: 0 var(--doc-page-margin) calc(var(--doc-page-margin) * 0.45);
      }
    }
  `;
  class DocPage extends HTMLElement {
    static get observedAttributes() {
      return ['size', 'width', 'height', 'margin', 'orientation', 'content-width', 'content-height'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._mo = typeof MutationObserver === 'function' ? new MutationObserver(() => this._scheduleMeasure()) : null;
    }

    /** The named paper's [w, h], swapped when orientation="landscape".
     *  Only the named size swaps — explicit width/height are exact values
     *  the author already oriented. */
    _paperSize() {
      const named = PAPER[(this.getAttribute('size') || '').toLowerCase()] || PAPER.letter;
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? [named[1], named[0]] : named;
    }
    get pageWidth() {
      return safeLen(this.getAttribute('width'), this._paperSize()[0]);
    }
    get pageHeight() {
      return safeLen(this.getAttribute('height'), this._paperSize()[1]);
    }
    get pageMargin() {
      return safeLen(this.getAttribute('margin'), '0.75in');
    }

    /** Scaled-fit mode's content box [w, h] as CSS lengths, or null when
     *  the mode is off (either attribute missing/invalid/zero — a partial
     *  declaration falls back to normal flow rather than guessing). */
    _contentFit() {
      const w = safeLen(this.getAttribute('content-width'), null);
      const h = safeLen(this.getAttribute('content-height'), null);
      if (!w || !h) return null;
      const wPx = toPx(w),
        hPx = toPx(h);
      return wPx > 0 && hPx > 0 ? [w, h, wPx, hPx] : null;
    }
    connectedCallback() {
      if (!this._sheet) this._render();
      this._syncSize();
      this._syncPrintPageRule();
      this._ensureTextWrapDefaults();
      this._ensureOwnsPrintMeta();
      this._syncFixedSizeMeta();
      if (this._mo) this._mo.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      this._onResize = () => this._scheduleMeasure();
      window.addEventListener('resize', this._onResize);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this._scheduleMeasure());
      }
      this._scheduleMeasure();
    }
    disconnectedCallback() {
      window.removeEventListener('resize', this._onResize);
      if (this._mo) this._mo.disconnect();
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
      // Drop the head rules when the last doc-page leaves, so a deleted
      // document's @page geometry and text-wrap defaults can't apply to
      // whatever replaces it.
      const survivor = document.querySelector('doc-page');
      if (!survivor) {
        ['doc-page-print', 'doc-page-text-wrap', 'doc-page-owns-print', 'doc-page-fixed-size'].forEach(id => {
          const tag = document.getElementById(id);
          if (tag) tag.remove();
        });
      } else if (typeof survivor._syncFixedSizeMeta === 'function') {
        // A departed true-size owner hands the page-global preview meta
        // to whatever true-size page remains (or it's removed).
        survivor._syncFixedSizeMeta();
      }
    }
    attributeChangedCallback() {
      if (!this._sheet) return;
      this._syncSize();
      this._syncPrintPageRule();
      this._syncFixedSizeMeta();
      this._scheduleMeasure();
    }
    _render() {
      this._root.innerHTML = `
        <style>${stylesheet}</style>
        <style id="vars"></style>
        <div class="sheet" data-screen-label="Document">
          <table class="frame" role="presentation">
            <thead><tr><th><div class="hdr-space"><slot name="header"></slot></div></th></tr></thead>
            <tbody><tr><td class="body"><div class="fit-box"><div class="fit"><slot></slot></div></div></td></tr></tbody>
            <tfoot><tr><td><div class="ftr-space"><slot name="footer"></slot></div></td></tr></tfoot>
          </table>
        </div>`;
      this._sheet = this._root.querySelector('.sheet');
      this._vars = this._root.getElementById('vars');
    }

    /** Runtime sizing lives in a shadow <style> :host rule, never on the
     *  light-DOM host element, so serialize-persist can't write it back. */
    _syncSize(hdrH, ftrH) {
      // Scaled-fit mode: content at its authored size, scaled onto the
      // printable area (page minus margins on both axes). The factor is a
      // plain number var so calc(length * number) stays valid; 4 decimals
      // keeps the shadow style stable across re-measures. Upscaling is
      // allowed — print transforms are vector, so text and CSS stay crisp
      // (raster images soften, which the catalog bullet warns about).
      const fit = this._contentFit();
      let fitVars = '';
      if (fit) {
        const marginPx = toPx(this.pageMargin) || 0;
        const availW = toPx(this.pageWidth) - 2 * marginPx;
        const availH = toPx(this.pageHeight) - 2 * marginPx;
        const scale = Math.min(availW / fit[2], availH / fit[3]);
        if (scale > 0 && Number.isFinite(scale)) {
          fitVars = '--doc-fit-w:' + fit[0] + ';' + '--doc-fit-h:' + fit[1] + ';' + '--doc-fit-scale:' + scale.toFixed(4) + ';';
        }
      }
      this._sheet.classList.toggle('fit-mode', !!fitVars);
      this._vars.textContent = ':host{' + fitVars + '--doc-page-w:' + this.pageWidth + ';' + '--doc-page-h:' + this.pageHeight + ';' + '--doc-page-margin:' + this.pageMargin + ';' + '--doc-hdr-h:' + (hdrH || 0) + 'px;' + '--doc-ftr-h:' + (ftrH || 0) + 'px;' + '--doc-hdr-pad:' + (hdrH ? '0.35in' : '0px') + ';' + '--doc-ftr-pad:' + (ftrH ? '0.35in' : '0px') + '}';
    }

    /** @page is a no-op inside shadow DOM, so the rule lives in <head>.
     *  Re-appended on every sync so it stays last in source order — the
     *  @page cascade is source-order per descriptor, so this rule wins
     *  over any other @page rule in the document. */
    _syncPrintPageRule() {
      const id = 'doc-page-print';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
      }
      document.head.appendChild(tag);
      tag.textContent = '@page { size: ' + this.pageWidth + ' ' + this.pageHeight + '; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; height: auto !important; overflow: visible !important; } ' + 'h1,h2,h3,h4,h5,h6 { break-after: avoid; } ' + 'figure,pre,blockquote,img,svg,tr { break-inside: avoid; } ' + 'p,li { orphans: 3; widows: 3; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } ' + '*, *::before, *::after { animation-delay: -99s !important; animation-duration: .001s !important; ' + 'animation-iteration-count: 1 !important; animation-fill-mode: both !important; ' + 'animation-play-state: running !important; transition-duration: 0s !important; } }';
    }

    /** Typographic defaults for document text: balance headings, avoid
     *  widowed/orphaned words in body copy (browsers without text-wrap
     *  support drop the declarations). Zero-specificity via :where() so
     *  any text-wrap authored on those elements wins; document-level so the
     *  rules reach the slotted (light DOM) content — shadow styles can't.
     *  data-omelette-injected marks the tag for the host editor to strip
     *  at serialize, so it is never written back as authored source. */
    _ensureTextWrapDefaults() {
      if (document.getElementById('doc-page-text-wrap')) return;
      const tag = document.createElement('style');
      tag.id = 'doc-page-text-wrap';
      tag.setAttribute('data-omelette-injected', '');
      tag.textContent = ':where(h1,h2,h3,h4,h5,h6){text-wrap:balance}' + ':where(p,li,blockquote,figcaption){text-wrap:pretty}';
      document.head.appendChild(tag);
    }

    /** Declares that this document owns its print CSS. The instant-PDF
     *  export checks for the meta by NAME PRESENCE alone (content is
     *  ignored) and skips its automatic print-CSS injections, so the
     *  component's @page geometry is never overridden by a heuristic.
     *  data-omelette-injected keeps it out of serialized source. */
    _ensureOwnsPrintMeta() {
      if (document.getElementById('doc-page-owns-print')) return;
      const tag = document.createElement('meta');
      tag.id = 'doc-page-owns-print';
      tag.name = 'omelette-owns-print';
      tag.content = 'true';
      tag.setAttribute('data-omelette-injected', '');
      document.head.appendChild(tag);
    }

    /** This page's valid true-size page box (explicit width AND height)
     *  as [w, h] px ints, or null when the mode is off. */
    _trueSizePx() {
      if (!safeLen(this.getAttribute('width'), null) || !safeLen(this.getAttribute('height'), null)) return null;
      const w = Math.round(toPx(this.pageWidth));
      const h = Math.round(toPx(this.pageHeight));
      return w > 0 && h > 0 ? [w, h] : null;
    }

    /** True-size pages (explicit width AND height) also declare the page
     *  box as the preview size: the in-app preview reads
     *  meta[name="omelette-fixed-size"] (content "W,H" in px ints) and
     *  scales the sheet into view — without it an 18in poster previews at
     *  true size with scrollbars. Never overrides an author-set meta
     *  (only the component's own id is managed). The meta is page-global
     *  while doc-page instances are not, so every sync recomputes the
     *  page-wide owner — the first connected true-size doc-page — and a
     *  non-true-size sibling's sync can never delete the owner's meta.
     *  Removed when no true-size page remains (the owner's disconnect
     *  re-syncs via any survivor) or when an author-set meta exists. */
    _syncFixedSizeMeta() {
      const id = 'doc-page-fixed-size';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-fixed-size"]:not([data-omelette-injected])');
      // The page-wide owner, not this instance: an upgraded true-size page
      // anywhere in the document keeps the meta alive and sized.
      let box = null;
      for (const el of document.querySelectorAll('doc-page')) {
        box = typeof el._trueSizePx === 'function' ? el._trueSizePx() : null;
        if (box) break;
      }
      if (!box || authored) {
        if (own) own.remove();
        return;
      }
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-fixed-size';
      tag.content = box[0] + ',' + box[1];
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }
    _scheduleMeasure() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        this._measure();
      });
    }

    /** Slot heights feed the print spacers (--doc-hdr-h / --doc-ftr-h), so
     *  they re-measure on content mutation, resize, and font load. */
    _measure() {
      const hdr = this.querySelector(':scope > [slot="header"]');
      const ftr = this.querySelector(':scope > [slot="footer"]');
      this._syncSize(hdr ? hdr.offsetHeight : 0, ftr ? ftr.offsetHeight : 0);
    }
  }
  if (!customElements.get('doc-page')) {
    customElements.define('doc-page', DocPage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "program/doc-page.js", error: String((e && e.message) || e) }); }

// program/program-data.js
try { (() => {
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
  workstreams: [{
    key: 'N',
    label: '0 Network',
    color: '#1F2D58'
  }, {
    key: 'J',
    label: '1 Job Seeker',
    color: '#F89728'
  }, {
    key: 'S',
    label: '2 Standard User',
    color: '#2E3192'
  }, {
    key: 'P',
    label: '3 Privileged',
    color: '#5C2D91'
  }, {
    key: 'D',
    label: '4 Developer',
    color: '#2C6FD6'
  }, {
    key: 'E',
    label: '5 ES',
    color: '#E51C84'
  }, {
    key: 'L',
    label: '6 Logistics',
    color: '#6E7BA6'
  }, {
    key: 'K',
    label: '7 KB & Enablement',
    color: '#1E8E5A'
  }],
  owners: {
    ENG: 'Shaun Struik — build',
    ARCH: 'Shaun Struik — Architect / Design',
    ENG2: 'AVD Build Engineer',
    PM: 'Twiki PM',
    TEAM: 'Twiki team',
    NET: 'APM Network Team (IT Infra Mgr)',
    CYB: 'APM Cyber',
    EUC: 'Nick Dorbie — APM EUC',
    DBP: 'APM Digital Business Partner',
    ES: 'Ben Riches — APM ES',
    DOPS: 'APM Head Digital Ops',
    ARCHD: 'APM Head Arch.',
    PFM: 'APM Portfolio Mgr',
    CTO: 'APM CTO/CISO',
    DBPART: 'Device Build Partner',
    NERDIO: 'Nerdio',
    ESTRAIN: 'APM ES Training Owner',
    PDE: 'APM PDE Owner (TBC)',
    ISVC: 'APM IT Service Lead'
  },
  tasks: [
  // ---- 0 Network ----
  {
    id: 'N1',
    w: 'N',
    t: 'Repurpose JS VLAN → APM-KIOSK (VLAN 73), hidden SSID + PSK via Intune',
    o: 'NET',
    s: '',
    dep: [],
    st: '2026-06-23',
    en: '2026-06-26',
    dy: 4,
    su: 'In progress',
    ty: 'Task',
    cr: true
  }, {
    id: 'N2',
    w: 'N',
    t: 'Meraki per-site /26 template, 20Mbps, remove CAPTCHA',
    o: 'NET',
    s: '',
    dep: [],
    st: '2026-06-23',
    en: '2026-06-26',
    dy: 4,
    su: 'In progress',
    ty: 'Task',
    cr: true
  }, {
    id: 'N3',
    w: 'N',
    t: 'Palo Alto east-west firewall rules (kiosk→AVD, deny-all)',
    o: 'NET',
    s: '',
    dep: ['N1'],
    st: '2026-06-24',
    en: '2026-07-01',
    dy: 6,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'N4',
    w: 'N',
    t: 'Zscaler IPSEC tunnel cutover from ZCC (managed network provider)',
    o: 'CYB',
    s: 'NET',
    dep: ['N3'],
    st: '2026-06-25',
    en: '2026-07-03',
    dy: 7,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'N5',
    w: 'N',
    t: 'MILESTONE: Network build target',
    o: 'NET',
    s: '',
    dep: ['N1', 'N2'],
    st: '2026-06-26',
    en: '2026-06-26',
    su: 'Not started',
    ty: 'Milestone',
    cr: true
  }, {
    id: 'N6',
    w: 'N',
    t: 'Hub VNet — DNS Private Resolver, NAT GW, shared services',
    o: 'NET',
    s: '',
    dep: [],
    st: '2026-06-23',
    en: '2026-07-03',
    dy: 9,
    su: 'In progress',
    ty: 'Task',
    cr: true
  }, {
    id: 'N7',
    w: 'N',
    t: 'AVD spoke VNet, NSGs, private endpoints (KV/Files/Func)',
    o: 'NET',
    s: '',
    dep: ['N6'],
    st: '2026-06-29',
    en: '2026-07-08',
    dy: 8,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'N8',
    w: 'N',
    t: 'DNS Private Resolver zones + FQDN allowlist validation',
    o: 'NET',
    s: '',
    dep: ['N7'],
    st: '2026-07-06',
    en: '2026-07-10',
    dy: 5,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'N9',
    w: 'N',
    t: 'Test network end-to-end (AVD FQDNs, Key Vault, Zscaler path)',
    o: 'NET',
    s: 'ENG',
    dep: ['N4', 'N7'],
    st: '2026-07-06',
    en: '2026-07-10',
    dy: 5,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'N10',
    w: 'N',
    t: 'Network design document (final, as-built)',
    o: 'NET',
    s: '',
    dep: ['N9'],
    st: '2026-07-08',
    en: '2026-07-15',
    dy: 6,
    su: 'Not started',
    ty: 'Task',
    cr: true
  },
  // ---- 1 Job Seeker (COMPRESSED — network 26 Jun · build & test 3 Jul · user testing 10 Jul · pilot/priority sites to 31 Jul · Phase 1 rollout to end Aug · Phase 2 in Sep, returns-dependent) ----
  {
    id: 'J22',
    w: 'J',
    t: 'Code-signing certificate (D-14) + WDAC allowed-signer rule (D-7) — master gate for device-side pipeline + Nerdio signing',
    o: 'CYB',
    s: 'ENG',
    dep: [],
    st: '2026-06-24',
    en: '2026-06-26',
    dy: 3,
    su: 'In progress',
    ty: 'Task',
    cr: true
  }, {
    id: 'J1',
    w: 'J',
    t: 'Jobseeker AVD build — golden image (WDAC-hardened) + Nerdio host pool + credential pipeline (Key Vault / Credential Proxy / rotation) + Conditional Access + Shell Launcher + lock-screen credential PR',
    o: 'ENG',
    s: 'NERDIO',
    dep: ['N5', 'J22'],
    st: '2026-06-26',
    en: '2026-07-02',
    dy: 6,
    su: 'In progress',
    ty: 'Task',
    cr: true
  }, {
    id: 'J6',
    w: 'J',
    t: 'Test AVD build end to end (FVE test env + production network)',
    o: 'ENG',
    s: 'NET',
    dep: ['J1'],
    st: '2026-07-02',
    en: '2026-07-03',
    dy: 2,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'J8',
    w: 'J',
    t: 'MILESTONE: Jobseeker AVD build & test complete',
    o: 'ENG',
    s: 'PFM',
    dep: ['J6'],
    st: '2026-07-03',
    en: '2026-07-03',
    su: 'Not started',
    ty: 'Milestone',
    cr: true
  }, {
    id: 'J9',
    w: 'J',
    t: 'Finalise CompNow build instructions + CompNow proves wipe/prep/Autopilot/label/ship',
    o: 'ENG',
    s: 'DBPART',
    dep: ['J8'],
    st: '2026-07-06',
    en: '2026-07-10',
    dy: 5,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'J23',
    w: 'J',
    t: 'User testing (functional + business acceptance)',
    o: 'EUC',
    s: 'ES',
    dep: ['J8'],
    st: '2026-07-06',
    en: '2026-07-10',
    dy: 5,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'J19',
    w: 'J',
    t: 'Penetration test + remediation (RFFR / ASD ISM scope)',
    o: 'CYB',
    s: 'ENG',
    dep: ['J8'],
    st: '2026-07-03',
    en: '2026-07-10',
    dy: 6,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'J21',
    w: 'J',
    t: 'MILESTONE: User testing + security sign-off complete — cleared for rollout',
    o: 'EUC',
    s: 'CTO',
    dep: ['J23', 'J19'],
    st: '2026-07-10',
    en: '2026-07-10',
    su: 'Not started',
    ty: 'Milestone',
    cr: true
  }, {
    id: 'J13',
    w: 'J',
    t: 'Roll out to pilot + priority sites',
    o: 'TEAM',
    s: 'ES',
    dep: ['J21', 'J9'],
    st: '2026-07-13',
    en: '2026-07-31',
    dy: 15,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'J12',
    w: 'J',
    t: 'MILESTONE: Pilot + priority sites complete',
    o: 'PM',
    s: 'PFM',
    dep: ['J13'],
    st: '2026-07-31',
    en: '2026-07-31',
    su: 'Not started',
    ty: 'Milestone',
    cr: true
  }, {
    id: 'J16',
    w: 'J',
    t: 'Phase 1 rollout — new devices (~360 of 540), rolling',
    o: 'PM',
    s: 'DBPART',
    dep: ['J12'],
    st: '2026-08-04',
    en: '2026-08-31',
    dy: 20,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'J17',
    w: 'J',
    t: 'MILESTONE: Phase 1 rollout complete (~360 of 540 devices)',
    o: 'PM',
    s: 'ES',
    dep: ['J16'],
    st: '2026-08-31',
    en: '2026-08-31',
    su: 'Not started',
    ty: 'Milestone',
    cr: true
  }, {
    id: 'J24',
    w: 'J',
    t: 'Phase 2 rollout — remaining ~180 devices (reimaged returns). DEPENDS ON return of old devices; pace/scope conditional on returned-device condition — faulty / out-of-warranty units need replacement (CompNow + SoftwareOne), not reimage',
    o: 'PM',
    s: 'DBPART',
    dep: ['J17', 'L1'],
    st: '2026-09-01',
    en: '2026-09-30',
    dy: 22,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'J25',
    w: 'J',
    t: 'MILESTONE: Phase 2 rollout complete (full ~540 fleet) — subject to device returns',
    o: 'PM',
    s: 'ES',
    dep: ['J24'],
    st: '2026-09-30',
    en: '2026-09-30',
    su: 'Not started',
    ty: 'Milestone'
  },
  // ---- 2 Standard User (WHOLE workstream — design, approvals, build, pilot, pen-test, rollout, GA — completed 13 Jul → 14 Aug) ----
  {
    id: 'S1',
    w: 'S',
    t: 'Document current Intune laptop SOE + Autopilot (14 policies)',
    o: 'ENG',
    s: 'EUC',
    dep: [],
    st: '2026-07-13',
    en: '2026-07-16',
    dy: 4,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S2',
    w: 'S',
    t: 'Close DR-010 printing + DR-011 mapped drive decisions',
    o: 'DOPS',
    s: 'ENG',
    dep: [],
    st: '2026-07-13',
    en: '2026-07-16',
    dy: 4,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S3',
    w: 'S',
    t: 'Finalise DDD V1.0 + CAB',
    o: 'ENG',
    s: 'ARCHD',
    dep: ['S1', 'S2'],
    st: '2026-07-16',
    en: '2026-07-20',
    dy: 3,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S4',
    w: 'S',
    t: 'MILESTONE: Standard User DDD approved',
    o: 'ARCHD',
    s: 'PFM',
    dep: ['S3'],
    st: '2026-07-20',
    en: '2026-07-20',
    su: 'Not started',
    ty: 'Milestone'
  }, {
    id: 'S5',
    w: 'S',
    t: 'Entra groups (corp/BYOD/hosts) + CA (block unmanaged, allow Windows App)',
    o: 'ENG',
    s: 'CYB',
    dep: ['S4'],
    st: '2026-07-20',
    en: '2026-07-24',
    dy: 4,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S6',
    w: 'S',
    t: 'Azure Files Premium FSLogix + Entra Kerberos',
    o: 'ENG2',
    s: 'ARCH',
    dep: ['N7', 'S4'],
    st: '2026-07-20',
    en: '2026-07-24',
    dy: 4,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S7',
    w: 'S',
    t: 'Compute Gallery + golden image (multi-session, M365, Teams optimised)',
    o: 'ENG2',
    s: 'EUC',
    dep: ['S6'],
    st: '2026-07-24',
    en: '2026-07-30',
    dy: 5,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S8',
    w: 'S',
    t: 'Nerdio pooled host pool + corp/BYOD app groups + autoscale',
    o: 'ENG2',
    s: 'NERDIO',
    dep: ['S7'],
    st: '2026-07-30',
    en: '2026-08-02',
    dy: 3,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S9',
    w: 'S',
    t: 'Scope 14 Intune policies + AVD profiles to session hosts',
    o: 'ENG2',
    s: 'EUC',
    dep: ['S7'],
    st: '2026-07-30',
    en: '2026-08-02',
    dy: 3,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S17',
    w: 'S',
    t: 'MILESTONE: Standard User image build complete',
    o: 'ENG2',
    s: 'PFM',
    dep: ['S8', 'S9'],
    st: '2026-08-02',
    en: '2026-08-02',
    su: 'Not started',
    ty: 'Milestone',
    cr: true
  }, {
    id: 'S10',
    w: 'S',
    t: 'Pilot 25–50 users (mixed personas)',
    o: 'ENG',
    s: 'EUC',
    dep: ['S17'],
    st: '2026-08-02',
    en: '2026-08-07',
    dy: 5,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S14',
    w: 'S',
    t: 'Update DDD with as-built changes + re-CAB approval',
    o: 'ENG',
    s: 'ARCHD',
    dep: ['S17'],
    st: '2026-08-02',
    en: '2026-08-04',
    dy: 2,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S15',
    w: 'S',
    t: 'Penetration test (Standard User SOE)',
    o: 'CYB',
    s: 'ENG',
    dep: ['S14'],
    st: '2026-08-04',
    en: '2026-08-08',
    dy: 4,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'S11',
    w: 'S',
    t: 'Validate CA from corporate + personal device',
    o: 'ENG',
    s: 'CYB',
    dep: ['S5', 'S10'],
    st: '2026-08-07',
    en: '2026-08-09',
    dy: 2,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S16',
    w: 'S',
    t: 'Remediate pen-test findings + retest',
    o: 'ENG2',
    s: 'CYB',
    dep: ['S15'],
    st: '2026-08-08',
    en: '2026-08-11',
    dy: 3,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'S12',
    w: 'S',
    t: 'Production rollout (entitle staff, comms, Windows App self-serve)',
    o: 'EUC',
    s: 'DBP',
    dep: ['S11', 'S16'],
    st: '2026-08-11',
    en: '2026-08-14',
    dy: 3,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'S13',
    w: 'S',
    t: 'MILESTONE: Standard User AVD GA',
    o: 'EUC',
    s: 'PFM',
    dep: ['S12'],
    st: '2026-08-14',
    en: '2026-08-14',
    su: 'Not started',
    ty: 'Milestone',
    cr: true
  },
  // ---- 3 Privileged (commences 17 Aug · 6-week run · live 28 Sep) ----
  {
    id: 'P1',
    w: 'P',
    t: 'Privileged design: PAW-style hardened image (no mail/Teams/browse), tiers Priv(zz)/High-Priv(xy)',
    o: 'ENG',
    s: 'CYB',
    dep: ['N10'],
    st: '2026-08-17',
    en: '2026-08-26',
    dy: 8,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'P2',
    w: 'P',
    t: 'Production access model: PIM per tier, JIT elevation, approval + audit',
    o: 'ENG',
    s: 'CYB',
    dep: ['P1'],
    st: '2026-08-21',
    en: '2026-08-28',
    dy: 6,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'P3',
    w: 'P',
    t: 'Privileged Access DDD + CAB',
    o: 'ENG',
    s: 'ARCHD',
    dep: ['P2'],
    st: '2026-08-27',
    en: '2026-09-01',
    dy: 4,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'P4',
    w: 'P',
    t: 'MILESTONE: Privileged DDD approved',
    o: 'ARCHD',
    s: 'CTO',
    dep: ['P3'],
    st: '2026-09-01',
    en: '2026-09-01',
    su: 'Not started',
    ty: 'Milestone'
  }, {
    id: 'P5',
    w: 'P',
    t: 'Test YubiKey 5C NFC FIPS (phishing-resistant MFA for zz/xy)',
    o: 'ENG2',
    s: 'CYB',
    dep: ['P1'],
    st: '2026-08-21',
    en: '2026-08-28',
    dy: 6,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'P6',
    w: 'P',
    t: 'MILESTONE: YubiKey 5C NFC FIPS validated',
    o: 'CYB',
    s: 'ENG',
    dep: ['P5'],
    st: '2026-08-28',
    en: '2026-08-28',
    su: 'Not started',
    ty: 'Milestone',
    cr: true
  }, {
    id: 'P7',
    w: 'P',
    t: 'Build hardened Privileged image + secure pool',
    o: 'ENG2',
    s: 'ARCH',
    dep: ['P4'],
    st: '2026-09-01',
    en: '2026-09-10',
    dy: 8,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'P8',
    w: 'P',
    t: 'CA + PIM for Priv(zz) & High-Priv(xy) prod scopes; YubiKey-only sign-in',
    o: 'ENG',
    s: 'CYB',
    dep: ['P6', 'P7'],
    st: '2026-09-10',
    en: '2026-09-16',
    dy: 6,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'P9',
    w: 'P',
    t: 'Pilot privileged users (both tiers) + validate prod access via YubiKey',
    o: 'ENG',
    s: 'CYB',
    dep: ['P8'],
    st: '2026-09-16',
    en: '2026-09-22',
    dy: 5,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'P11',
    w: 'P',
    t: 'Penetration test (Privileged image — PAW hardening, prod-access boundary)',
    o: 'CYB',
    s: 'ENG',
    dep: ['P8'],
    st: '2026-09-16',
    en: '2026-09-22',
    dy: 5,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'P12',
    w: 'P',
    t: 'Remediate pen-test findings + retest',
    o: 'ENG2',
    s: 'CYB',
    dep: ['P11', 'P9'],
    st: '2026-09-22',
    en: '2026-09-28',
    dy: 4,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'P10',
    w: 'P',
    t: 'MILESTONE: Privileged Access live (zz + xy)',
    o: 'ENG',
    s: 'CTO',
    dep: ['P12'],
    st: '2026-09-28',
    en: '2026-09-28',
    su: 'Not started',
    ty: 'Milestone',
    cr: true
  },
  // ---- 4 Developer (DDD design in parallel during Sep; IMAGE build starts immediately after Priv completes 28 Sep — runs into early Nov, PAST contract end) ----
  // ---- 4 Developer (WHOLE workstream — design, approvals, build — commences immediately after Privileged completes 28 Sep — GA ~late Nov, PAST contract end) ----
  {
    id: 'D1',
    w: 'D',
    t: 'Finalise Dev DDD: permissive dev image, limited blocks, no production path — Developer work commences after Privileged completes',
    o: 'ENG',
    s: 'ARCHD',
    dep: ['N10', 'P10'],
    st: '2026-09-29',
    en: '2026-10-07',
    dy: 7,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'D2',
    w: 'D',
    t: 'Design Dev network from JS pattern + adjust (deny-by-default egress, Zscaler at endpoint)',
    o: 'ENG',
    s: 'NET',
    dep: ['N10', 'P10'],
    st: '2026-10-05',
    en: '2026-10-09',
    dy: 5,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'D3',
    w: 'D',
    t: 'AVD landing zone (Bicep) + FSLogix Premium ZRS + Sentinel + Entra groups',
    o: 'ENG2',
    s: 'ARCH',
    dep: ['D1', 'D2'],
    st: '2026-10-09',
    en: '2026-10-16',
    dy: 6,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'D4',
    w: 'D',
    t: 'AIB image pipeline (Git template, signing, SBOM)',
    o: 'ENG2',
    s: 'CYB',
    dep: ['D3'],
    st: '2026-10-16',
    en: '2026-10-22',
    dy: 5,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'D5',
    w: 'D',
    t: 'Primary pooled host pool + scaling plan (nested virtualisation)',
    o: 'ENG2',
    s: 'NERDIO',
    dep: ['D4'],
    st: '2026-10-22',
    en: '2026-10-28',
    dy: 4,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'D6',
    w: 'D',
    t: 'Dev tooling layers (VS, Podman/containers, WSL2) with limited blocks',
    o: 'ENG2',
    s: 'EUC',
    dep: ['D5'],
    st: '2026-10-28',
    en: '2026-11-03',
    dy: 5,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'D7',
    w: 'D',
    t: 'Pilot ring (PDE owner + cohort) + smoke test + CA enforced',
    o: 'ENG',
    s: 'PDE',
    dep: ['D5', 'D6'],
    st: '2026-11-03',
    en: '2026-11-09',
    dy: 5,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'D12',
    w: 'D',
    t: 'Penetration test (Developer SOE — permissive image, no-prod-path boundary)',
    o: 'CYB',
    s: 'ENG',
    dep: ['D6'],
    st: '2026-11-03',
    en: '2026-11-10',
    dy: 6,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'D13',
    w: 'D',
    t: 'Remediate pen-test findings + retest',
    o: 'ENG2',
    s: 'CYB',
    dep: ['D12'],
    st: '2026-11-10',
    en: '2026-11-16',
    dy: 4,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'D9',
    w: 'D',
    t: 'Capability phase 2 enabled at GA (winget/ACR); phase 3 (Copilot/MCP/local LLM) configured',
    o: 'ENG2',
    s: 'CYB',
    dep: ['D7'],
    st: '2026-11-09',
    en: '2026-11-16',
    dy: 6,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'D8',
    w: 'D',
    t: 'Team-by-team migration from legacy PDE',
    o: 'ENG2',
    s: 'EUC',
    dep: ['D7', 'D13'],
    st: '2026-11-16',
    en: '2026-11-20',
    dy: 4,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'D10',
    w: 'D',
    t: 'Begin legacy PDE decommission (cutover; full retire after stability window)',
    o: 'ENG2',
    s: 'DOPS',
    dep: ['D8'],
    st: '2026-11-20',
    en: '2026-11-24',
    dy: 2,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'D11',
    w: 'D',
    t: 'MILESTONE: Developer SOE GA (post-contract — ~late Nov)',
    o: 'ENG',
    s: 'PFM',
    dep: ['D8', 'D13'],
    st: '2026-11-20',
    en: '2026-11-20',
    su: 'Not started',
    ty: 'Milestone',
    cr: true
  },
  // ---- 5 ES (PULLED FORWARD — runs in parallel Aug–Sep; live 23 Sep) ----
  {
    id: 'E1',
    w: 'E',
    t: 'Adapt JS image: midnight daily reset (vs 10-min inactivity)',
    o: 'ENG2',
    s: 'ES',
    dep: ['J8'],
    st: '2026-07-27',
    en: '2026-07-31',
    dy: 5,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'E2',
    w: 'E',
    t: 'Redesign take-home: any Wi-Fi, off-site filtering (Zscaler on device), revised CA',
    o: 'ENG',
    s: 'CYB',
    dep: ['E1'],
    st: '2026-08-03',
    en: '2026-08-14',
    dy: 10,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'E3',
    w: 'E',
    t: 'ES DDD + CAB',
    o: 'ENG',
    s: 'ARCHD',
    dep: ['E2'],
    st: '2026-08-17',
    en: '2026-08-21',
    dy: 5,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'E4',
    w: 'E',
    t: 'MILESTONE: ES DDD approved',
    o: 'ARCHD',
    s: 'PFM',
    dep: ['E3'],
    st: '2026-08-21',
    en: '2026-08-21',
    su: 'Not started',
    ty: 'Milestone'
  }, {
    id: 'E5',
    w: 'E',
    t: 'Build ES image/profiles (midnight reset, incl. Eskilled folder)',
    o: 'ENG2',
    s: 'ESTRAIN',
    dep: ['E4'],
    st: '2026-08-24',
    en: '2026-09-02',
    dy: 8,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'E6',
    w: 'E',
    t: 'Test off-site scenarios (home Wi-Fi, reset, filtering)',
    o: 'TEAM',
    s: 'ES',
    dep: ['E5'],
    st: '2026-09-02',
    en: '2026-09-07',
    dy: 4,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'E9',
    w: 'E',
    t: 'Penetration test (ES take-home — off-site filtering, midnight reset, CA)',
    o: 'CYB',
    s: 'ENG',
    dep: ['E5'],
    st: '2026-09-02',
    en: '2026-09-09',
    dy: 5,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'E10',
    w: 'E',
    t: 'Remediate pen-test findings + retest',
    o: 'ENG2',
    s: 'CYB',
    dep: ['E9', 'E6'],
    st: '2026-09-09',
    en: '2026-09-15',
    dy: 4,
    su: 'Not started',
    ty: 'Task',
    cr: true
  }, {
    id: 'E7',
    w: 'E',
    t: 'Pilot + rollout (take-home devices)',
    o: 'PM',
    s: 'ES',
    dep: ['E6', 'E10'],
    st: '2026-09-15',
    en: '2026-09-23',
    dy: 6,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'E8',
    w: 'E',
    t: 'MILESTONE: ES take-home live',
    o: 'PM',
    s: 'PFM',
    dep: ['E7'],
    st: '2026-09-23',
    en: '2026-09-23',
    su: 'Not started',
    ty: 'Milestone',
    cr: true
  },
  // ---- 6 Logistics ----
  {
    id: 'L1',
    w: 'L',
    t: 'Retrieve old JS devices onsite + place new (rolling)',
    o: 'PM',
    s: 'ES',
    dep: ['J8'],
    st: '2026-07-13',
    en: '2026-08-21',
    dy: 29,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'L2',
    w: 'L',
    t: 'Asset register updates (ongoing)',
    o: 'PM',
    s: 'EUC',
    dep: [],
    st: '2026-08-04',
    en: '2026-09-30',
    dy: 42,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'L3',
    w: 'L',
    t: 'Retrieve standard-user laptops as AVD replaces',
    o: 'PM',
    s: 'EUC',
    dep: ['S13'],
    st: '2026-09-07',
    en: '2026-09-30',
    dy: 18,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'L4',
    w: 'L',
    t: 'Retrieve/contract high-priv laptops → users on own Macs (Privileged image)',
    o: 'PM',
    s: 'PFM',
    dep: ['P10'],
    st: '2026-09-23',
    en: '2026-09-30',
    dy: 6,
    su: 'Not started',
    ty: 'Task'
  },
  // ---- 7 KB & Enablement ----
  {
    id: 'K1',
    w: 'K',
    t: 'KB: APM-KIOSK network build',
    o: 'ENG',
    s: 'DBP',
    dep: ['N10'],
    st: '2026-07-13',
    en: '2026-07-20',
    dy: 6,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'K2',
    w: 'K',
    t: 'KB: Device Build Partner wipe/prep/ship process',
    o: 'ENG',
    s: 'DBP',
    dep: ['J9'],
    st: '2026-07-24',
    en: '2026-07-29',
    dy: 4,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'K3',
    w: 'K',
    t: 'KB: JS ops (password rotation, lock screen, device replace)',
    o: 'ENG',
    s: 'DBP',
    dep: ['J8'],
    st: '2026-07-27',
    en: '2026-08-10',
    dy: 11,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'K4',
    w: 'K',
    t: 'KB: image/patch, FSLogix lifecycle, CA BYOD, Windows App onboarding',
    o: 'ENG',
    s: 'DBP',
    dep: ['S8'],
    st: '2026-08-26',
    en: '2026-09-07',
    dy: 9,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'K5',
    w: 'K',
    t: 'KB: ES midnight reset, off-site connectivity, Eskilled access',
    o: 'ENG',
    s: 'DBP',
    dep: ['E5'],
    st: '2026-09-02',
    en: '2026-09-10',
    dy: 8,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'K6',
    w: 'K',
    t: 'KB: Privileged access request, PIM per tier (zz/xy), YubiKey enrolment',
    o: 'ENG',
    s: 'DBP',
    dep: ['P7'],
    st: '2026-09-09',
    en: '2026-09-18',
    dy: 8,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'K7',
    w: 'K',
    t: 'KB: Dev image pipeline/rollback, self-service tooling, MCP request, FSLogix recovery',
    o: 'ENG',
    s: 'DBP',
    dep: ['D6'],
    st: '2026-11-17',
    en: '2026-11-25',
    dy: 7,
    su: 'Not started',
    ty: 'Task'
  }, {
    id: 'K8',
    w: 'K',
    t: 'KB: Tier-1 Service Desk triage runbooks (all use cases)',
    o: 'ENG',
    s: 'DBP',
    dep: ['K3'],
    st: '2026-09-14',
    en: '2026-09-30',
    dy: 13,
    su: 'Not started',
    ty: 'Task'
  }],
  risks: [{
    n: 1,
    risk: 'APM is running several tier-one projects at once. The AVD schedule depends on APM departments (Network, Cyber, EUC) and decision-makers delivering their inputs on time; contention for APM resources and approvals — not delivery capacity — is the main risk to the 30 Sep dates.',
    impact: 'High',
    like: 'High',
    owner: 'Portfolio Mgr (APM)',
    mit: 'Lock an APM owner and due date for every dependency (network, DR-010/011, pen-test window, PDE owner). Weekly dependency review with the Portfolio Manager; escalate APM-side slippage immediately.'
  }, {
    n: 2,
    risk: 'Network (site + Azure) is on the critical path from day one and is delivered by APM Network / Infrastructure. APM-side network slippage directly delays Job Seeker testing and rollout.',
    impact: 'High',
    like: 'Med',
    owner: 'Network Lead / Architect',
    mit: 'Confirm APM Network resourcing now; daily stand-up until network proven. Twiki supports the Azure foundation.'
  }, {
    n: 3,
    risk: 'Privileged Access is net-new (PAW, two tiers, YubiKey) added mid-window; carries production blast-radius risk.',
    impact: 'High',
    like: 'Med',
    owner: 'Cyber lead (Ugbaad Adani)',
    mit: 'Design once, gate hard on YubiKey; the Cyber lead signs off the privileged model; no high-priv cutover until P6 + P8 pass.'
  }, {
    n: 4,
    risk: 'YubiKey 5C NFC FIPS gates Privileged production access; if it fails, no phishing-resistant path from Macs.',
    impact: 'High',
    like: 'Med',
    owner: 'Shaun Struik / Cyber',
    mit: 'Run YubiKey test early (wk 17 Aug). Fallback to a dedicated hardened Cloud PC for the highest tier.'
  }, {
    n: 5,
    risk: 'ES take-home breaks the site-VLAN / PSK / site-Zscaler controls JS relies on — a security redesign. Now compressed into Aug–Sep to land by 30 Sep, running in parallel with Standard User, Privileged and Developer builds.',
    impact: 'High',
    like: 'High',
    owner: 'Shaun Struik / Cyber',
    mit: 'Treat ES as its own design (Zscaler client on device, revised CA, any Wi-Fi, midnight reset). Confirm Eskilled path early; protect the Aug–Sep build capacity.'
  }, {
    n: 6,
    risk: 'Developer must stay a permissive image with no production path; production access lives only in the Privileged image.',
    impact: 'Med',
    like: 'Low',
    owner: 'Shaun Struik / Head Arch.',
    mit: 'Keep the boundary clean — no production scopes on the Dev pool.'
  }, {
    n: 7,
    risk: 'Standard User printing (DR-010) and mapped drive (DR-011) still pending; both gate the SU build.',
    impact: 'Med',
    like: 'High',
    owner: 'Head Digital Ops / EUC',
    mit: 'Force decisions by 24 Jul. Universal Print likely; confirm mapped-drive backend.'
  }, {
    n: 8,
    risk: 'RESOLVED — Job Seeker device count confirmed at 540 (early drafts showed 517 vs 540).',
    impact: 'Low',
    like: 'Low',
    owner: 'Twiki PM / EUC',
    mit: 'Done — 540 is the confirmed count, applied everywhere.'
  }, {
    n: 9,
    risk: 'RESOLVED — Nerdio environment is set up and complete; Standard User, Privileged, Developer and ES all reuse it.',
    impact: 'Low',
    like: 'Low',
    owner: 'Shaun Struik / Architect',
    mit: 'Done. No action.'
  }, {
    n: 10,
    risk: 'Developer (PDE) owner not yet named — gates Dev pilot, image approval and service catalogue.',
    impact: 'Med',
    like: 'Med',
    owner: 'Portfolio Mgr / Head Digital Ops',
    mit: 'Nominate the APM PDE owner now.'
  }, {
    n: 11,
    risk: 'A single AVD Build Engineer cannot build images in parallel, so the use cases are serialised whole-workstream blocks: Standard User (full lifecycle design→GA, 13 Jul–14 Aug) → Privileged (17 Aug–28 Sep) → Developer (commences immediately after Privileged, runs to ~20 Nov). Two consequences: (a) the Standard User window is very tight — image complete ~2 Aug then pilot, pen-test, remediation and production rollout all inside ~12 days; (b) Developer cannot start until 29 Sep and lands ~20 Nov, PAST the 30 Sep contract end. Network, Job Seeker, Standard User, ES and Privileged all complete by 30 Sep.',
    impact: 'High',
    like: 'High',
    owner: 'Portfolio Mgr',
    mit: 'For Standard User, pre-book the pen-test window and agree a fast retest turnaround, or accept a staged rollout where GA is “pilot-proven + pen-test booked”. For Developer, confirm APM accepts post-contract GA, or add a second build engineer from mid-Aug to run Privileged and Developer in parallel. Hold every APM dependency (network, DR-010/011, pen-test windows, PDE owner) to a confirmed date.'
  }, {
    n: 12,
    risk: 'Every image now requires a penetration test + remediation before go-live (RFFR / ASD ISM). No pen-test vendor or booked window is confirmed — an external scheduling dependency that gates every go-live.',
    impact: 'High',
    like: 'High',
    owner: 'Shaun Struik / Cyber / Portfolio Mgr',
    mit: 'Book the pen-test vendor now and reserve per-image windows. Bundle Job Seeker + Standard User into one engagement; confirm scope and retest turnaround up front.'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "program/program-data.js", error: String((e && e.message) || e) }); }

// program/program_workbook_data.js
try { (() => {
// APM AVD Program — full workbook data (faithful recreation of the master .xlsx, supplier names retained).
// Edit rows here and re-export.
window.WB = {
  "meta": {
    "title": "APM Digital Workplace — AVD Program Plan & Gantt",
    "sub": "Delivery: Twiki Corp · Order: Job Seeker, Standard User, ES, Privileged, Developer · Window: 23 Jun – 30 Sep 2026 (contract end) · Network target: 26 Jun",
    "note": "ES = Employment Services take-home device (was CTA). Privileged = production access at two tiers: Priv (zz) and High-Priv (xy), YubiKey-gated."
  },
  "workstreams": [{
    "key": "0 Network",
    "color": "#1F2D58"
  }, {
    "key": "1 Job Seeker",
    "color": "#F89728"
  }, {
    "key": "2 Standard User",
    "color": "#2E3192"
  }, {
    "key": "3 ES",
    "color": "#E51C84"
  }, {
    "key": "4 Privileged",
    "color": "#5C2D91"
  }, {
    "key": "5 Developer",
    "color": "#2C6FD6"
  }, {
    "key": "6 Logistics",
    "color": "#6E7BA6"
  }, {
    "key": "7 KB & Enablement",
    "color": "#1E8E5A"
  }],
  "tasks": [{
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
  }, {
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
  }, {
    "id": "N3",
    "ws": "0 Network",
    "phase": "Site network",
    "task": "Palo Alto east-west firewall rules (kiosk to AVD, deny-all)",
    "owner": "APM Network - Michael Court",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["N1"],
    "st": "2026-06-24",
    "en": "2026-07-01",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": true
  }, {
    "id": "N4",
    "ws": "0 Network",
    "phase": "Site network",
    "task": "Zscaler IPSEC tunnel (Stratus) cutover from ZCC",
    "owner": "APM Network - Michael Court",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["N3"],
    "st": "2026-06-25",
    "en": "2026-07-03",
    "days": 8,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": true
  }, {
    "id": "N5",
    "ws": "0 Network",
    "phase": "Site network",
    "task": "MILESTONE: Network build target",
    "owner": "APM Network - Michael Court",
    "support": "Twiki - Shaun Struik",
    "dep": ["N1", "N2"],
    "st": "2026-06-26",
    "en": "2026-06-26",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": true
  }, {
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
  }, {
    "id": "N7",
    "ws": "0 Network",
    "phase": "Azure foundation",
    "task": "AVD spoke VNet, NSGs, private endpoints (KV/Files/Func)",
    "owner": "Twiki - Shaun Struik",
    "support": "Twiki - Michael Webster",
    "dep": ["N6"],
    "st": "2026-06-29",
    "en": "2026-07-08",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": true
  }, {
    "id": "N8",
    "ws": "0 Network",
    "phase": "Azure foundation",
    "task": "DNS Private Resolver zones + FQDN allowlist validation",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Network - Michael Court",
    "dep": ["N7"],
    "st": "2026-07-06",
    "en": "2026-07-10",
    "days": 4,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "N9",
    "ws": "0 Network",
    "phase": "Test & document",
    "task": "Test network end-to-end (AVD FQDNs, Key Vault, Zscaler path)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Network - Michael Court",
    "dep": ["N4", "N7"],
    "st": "2026-07-06",
    "en": "2026-07-10",
    "days": 4,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": true
  }, {
    "id": "N10",
    "ws": "0 Network",
    "phase": "Test & document",
    "task": "Network As-Built document",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Network - Michael Court",
    "dep": ["N9"],
    "st": "2026-07-08",
    "en": "2026-07-15",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "N11",
    "ws": "0 Network",
    "phase": "Test & document",
    "task": "Patternise reusable Azure hub-spoke build template",
    "owner": "Twiki - Michael Webster",
    "support": "Twiki - Shaun Struik",
    "dep": ["N10"],
    "st": "2026-07-13",
    "en": "2026-07-17",
    "days": 4,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "N12",
    "ws": "0 Network",
    "phase": "Test & document",
    "task": "MILESTONE: Network ready + patternised",
    "owner": "Twiki - Michael Webster",
    "support": "APM - Murray Thomas",
    "dep": ["N9", "N11"],
    "st": "2026-07-17",
    "en": "2026-07-17",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": true
  }, {
    "id": "J1",
    "ws": "1 Job Seeker",
    "phase": "AVD & identity",
    "task": "Golden image captured (WDAC-hardened, Win11 Ent single-session) + Nerdio host pool defined — session-host deploy pending network",
    "owner": "Twiki - Shaun Struik",
    "support": "Nerdio",
    "dep": ["N7"],
    "st": "2026-06-29",
    "en": "2026-07-10",
    "days": 11,
    "pct": 60,
    "status": "In progress",
    "type": "Task",
    "crit": true
  }, {
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
  }, {
    "id": "J2",
    "ws": "1 Job Seeker",
    "phase": "AVD & identity",
    "task": "Credential pipeline: Key Vault + Credential Proxy (EasyAuth+PRT) + rotation runbook + Hybrid Worker — blocked pending cert (J22) + network design",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["N7"],
    "st": "2026-06-29",
    "en": "2026-07-17",
    "days": 18,
    "pct": 0,
    "status": "Blocked",
    "type": "Task",
    "crit": false
  }, {
    "id": "J3",
    "ws": "1 Job Seeker",
    "phase": "AVD & identity",
    "task": "Conditional Access set built — report-only until cyber re-approves (consolidate duplicate set + fix \"Badge\" Teams-block)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["J2"],
    "st": "2026-07-13",
    "en": "2026-07-17",
    "days": 4,
    "pct": 70,
    "status": "In progress",
    "type": "Task",
    "crit": false
  }, {
    "id": "J4",
    "ws": "1 Job Seeker",
    "phase": "AVD & identity",
    "task": "Shell Launcher + Windows App + Autopilot self-deploying profile",
    "owner": "Twiki - Shaun Struik",
    "support": "APM EUC - Nick Dorbie",
    "dep": ["J1"],
    "st": "2026-07-08",
    "en": "2026-07-15",
    "days": 7,
    "pct": 80,
    "status": "In progress",
    "type": "Task",
    "crit": false
  }, {
    "id": "J5",
    "ws": "1 Job Seeker",
    "phase": "AVD & identity",
    "task": "Lock-screen credential PR (render + LSA write) — blocked: needs cert (J22) for full-language under WDAC",
    "owner": "Twiki - Shaun Struik",
    "support": "APM EUC - Nick Dorbie",
    "dep": ["J2"],
    "st": "2026-07-17",
    "en": "2026-07-20",
    "days": 3,
    "pct": 0,
    "status": "Blocked",
    "type": "Task",
    "crit": false
  }, {
    "id": "J6",
    "ws": "1 Job Seeker",
    "phase": "Device test",
    "task": "Validate host deploy + pipeline in FVE (test env) — Nerdio CSE blocked by WDAC + missing Storage egress",
    "owner": "Twiki - Shaun Struik",
    "support": "APM EUC - Nick Dorbie",
    "dep": ["J3", "J4"],
    "st": "2026-07-17",
    "en": "2026-07-17",
    "days": 0,
    "pct": 40,
    "status": "In progress",
    "type": "Task",
    "crit": false
  }, {
    "id": "J7",
    "ws": "1 Job Seeker",
    "phase": "Device test",
    "task": "Test device on prod network — blocked pending finalised + approved network design",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Network - Michael Court",
    "dep": ["N5", "J6"],
    "st": "2026-07-20",
    "en": "2026-07-24",
    "days": 4,
    "pct": 0,
    "status": "Blocked",
    "type": "Task",
    "crit": true
  }, {
    "id": "J8",
    "ws": "1 Job Seeker",
    "phase": "Device test",
    "task": "MILESTONE: Test device validated on both networks",
    "owner": "Twiki - Shaun Struik",
    "support": "APM - Murray Thomas",
    "dep": ["J7"],
    "st": "2026-07-24",
    "en": "2026-07-24",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": true
  }, {
    "id": "J9",
    "ws": "1 Job Seeker",
    "phase": "CompNow build",
    "task": "Finalise CompNow build instructions (wipe/prep/Autopilot/label/ship)",
    "owner": "Twiki - Shaun Struik",
    "support": "CompNow",
    "dep": ["J7"],
    "st": "2026-07-24",
    "en": "2026-07-29",
    "days": 5,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "J10",
    "ws": "1 Job Seeker",
    "phase": "CompNow build",
    "task": "CompNow tests build process",
    "owner": "CompNow",
    "support": "Twiki - Shaun Struik",
    "dep": ["J9"],
    "st": "2026-07-29",
    "en": "2026-07-31",
    "days": 2,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "J11",
    "ws": "1 Job Seeker",
    "phase": "CompNow build",
    "task": "Two team members test order-to-delivery end to end",
    "owner": "Twiki - Shaun + Dave",
    "support": "CompNow",
    "dep": ["J10"],
    "st": "2026-07-31",
    "en": "2026-08-04",
    "days": 4,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": true
  }, {
    "id": "J12",
    "ws": "1 Job Seeker",
    "phase": "CompNow build",
    "task": "MILESTONE: Build process proven end to end",
    "owner": "Twiki - Dave Badger",
    "support": "APM - Murray Thomas",
    "dep": ["J11"],
    "st": "2026-08-04",
    "en": "2026-08-04",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": true
  }, {
    "id": "J13",
    "ws": "1 Job Seeker",
    "phase": "Rollout",
    "task": "Pilot 5-10 devices across 2-3 sites",
    "owner": "Twiki - Shaun + Dave",
    "support": "APM ES - Ben Riches",
    "dep": ["J12"],
    "st": "2026-08-04",
    "en": "2026-08-11",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "J14",
    "ws": "1 Job Seeker",
    "phase": "Rollout",
    "task": "Site network cutover JS to APM-KIOSK (rolling, per site)",
    "owner": "APM Network - Michael Court",
    "support": "Twiki - Dave Badger",
    "dep": ["J8"],
    "st": "2026-08-11",
    "en": "2026-09-11",
    "days": 31,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "J15",
    "ws": "1 Job Seeker",
    "phase": "Rollout",
    "task": "Onsite device test",
    "owner": "Twiki - Dave Badger",
    "support": "APM ES - Ben Riches",
    "dep": ["J13"],
    "st": "2026-08-11",
    "en": "2026-08-14",
    "days": 3,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "J16",
    "ws": "1 Job Seeker",
    "phase": "Rollout",
    "task": "National rollout (~540 devices, rolling)",
    "owner": "Twiki - Dave Badger",
    "support": "CompNow",
    "dep": ["J15"],
    "st": "2026-08-17",
    "en": "2026-09-11",
    "days": 25,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "J17",
    "ws": "1 Job Seeker",
    "phase": "Rollout",
    "task": "MILESTONE: Job Seeker national rollout complete",
    "owner": "Twiki - Dave Badger",
    "support": "APM ES - Ben Riches",
    "dep": ["J16"],
    "st": "2026-09-11",
    "en": "2026-09-11",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": false
  }, {
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
  }, {
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
  }, {
    "id": "S3",
    "ws": "2 Standard User",
    "phase": "Document & design",
    "task": "Finalise DDD V1.0 + CAB",
    "owner": "Twiki - Shaun Struik",
    "support": "APM - Samit Chandra",
    "dep": ["S1", "S2"],
    "st": "2026-07-27",
    "en": "2026-07-31",
    "days": 4,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "S4",
    "ws": "2 Standard User",
    "phase": "Document & design",
    "task": "MILESTONE: Standard User DDD approved",
    "owner": "APM - Samit Chandra",
    "support": "APM - Murray Thomas",
    "dep": ["S3"],
    "st": "2026-07-31",
    "en": "2026-07-31",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": false
  }, {
    "id": "S5",
    "ws": "2 Standard User",
    "phase": "Build",
    "task": "Entra groups (corp/BYOD/hosts) + CA (block unmanaged, allow Windows App, context groups)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["N11", "S4"],
    "st": "2026-08-03",
    "en": "2026-08-12",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "S6",
    "ws": "2 Standard User",
    "phase": "Build",
    "task": "Azure Files Premium FSLogix + Entra Kerberos",
    "owner": "Twiki - Shaun Struik",
    "support": "Twiki - Michael Webster",
    "dep": ["N11"],
    "st": "2026-08-03",
    "en": "2026-08-12",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "S7",
    "ws": "2 Standard User",
    "phase": "Build",
    "task": "Compute Gallery + golden image (multi-session, M365, Teams optimised)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM EUC - Nick Dorbie",
    "dep": ["S6"],
    "st": "2026-08-12",
    "en": "2026-08-21",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "S8",
    "ws": "2 Standard User",
    "phase": "Build",
    "task": "Nerdio pooled host pool + corp/BYOD app groups + autoscale",
    "owner": "Twiki - Shaun Struik",
    "support": "Nerdio",
    "dep": ["S7"],
    "st": "2026-08-21",
    "en": "2026-08-26",
    "days": 5,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "S9",
    "ws": "2 Standard User",
    "phase": "Build",
    "task": "Scope 14 Intune policies + AVD profiles to session hosts",
    "owner": "Twiki - Shaun Struik",
    "support": "APM EUC - Nick Dorbie",
    "dep": ["S7"],
    "st": "2026-08-21",
    "en": "2026-08-26",
    "days": 5,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "S10",
    "ws": "2 Standard User",
    "phase": "Pilot & rollout",
    "task": "Pilot 25-50 users (mixed personas)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM EUC - Nick Dorbie",
    "dep": ["S8", "S9"],
    "st": "2026-08-26",
    "en": "2026-09-04",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "S11",
    "ws": "2 Standard User",
    "phase": "Pilot & rollout",
    "task": "Validate CA from corporate + personal device",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["S5", "S10"],
    "st": "2026-08-26",
    "en": "2026-08-29",
    "days": 3,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "S12",
    "ws": "2 Standard User",
    "phase": "Pilot & rollout",
    "task": "Production rollout (entitle staff, comms, Windows App self-serve)",
    "owner": "APM EUC - Nick Dorbie",
    "support": "APM - Kath Nash",
    "dep": ["S10"],
    "st": "2026-09-07",
    "en": "2026-09-25",
    "days": 18,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "S13",
    "ws": "2 Standard User",
    "phase": "Pilot & rollout",
    "task": "MILESTONE: Standard User AVD GA",
    "owner": "APM EUC - Nick Dorbie",
    "support": "APM - Murray Thomas",
    "dep": ["S12"],
    "st": "2026-09-25",
    "en": "2026-09-25",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": false
  }, {
    "id": "E1",
    "ws": "3 ES",
    "phase": "Design adaptation",
    "task": "Adapt JS image: midnight daily reset (vs 10-min inactivity)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM ES - Ben Riches",
    "dep": ["J8"],
    "st": "2026-07-27",
    "en": "2026-07-31",
    "days": 4,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "E2",
    "ws": "3 ES",
    "phase": "Design adaptation",
    "task": "Redesign take-home: any Wi-Fi, off-site filtering (Zscaler client on device), revised CA",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["E1"],
    "st": "2026-08-03",
    "en": "2026-08-14",
    "days": 11,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": true
  }, {
    "id": "E3",
    "ws": "3 ES",
    "phase": "Design adaptation",
    "task": "ES DDD + CAB",
    "owner": "Twiki - Shaun Struik",
    "support": "APM - Samit Chandra",
    "dep": ["E2"],
    "st": "2026-08-17",
    "en": "2026-08-21",
    "days": 4,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "E4",
    "ws": "3 ES",
    "phase": "Design adaptation",
    "task": "MILESTONE: ES DDD approved",
    "owner": "APM - Samit Chandra",
    "support": "APM - Murray Thomas",
    "dep": ["E3"],
    "st": "2026-08-21",
    "en": "2026-08-21",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": false
  }, {
    "id": "E5",
    "ws": "3 ES",
    "phase": "Build & test",
    "task": "Build ES image/profiles (midnight reset, incl. Eskilled folder)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM ES - Claire McArdle",
    "dep": ["E4"],
    "st": "2026-08-24",
    "en": "2026-09-02",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "E6",
    "ws": "3 ES",
    "phase": "Build & test",
    "task": "Test off-site scenarios (home Wi-Fi, reset, filtering)",
    "owner": "Twiki - Shaun + Dave",
    "support": "APM ES - Ben Riches",
    "dep": ["E5"],
    "st": "2026-09-02",
    "en": "2026-09-07",
    "days": 5,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": true
  }, {
    "id": "E7",
    "ws": "3 ES",
    "phase": "Rollout",
    "task": "Pilot + rollout (take-home devices)",
    "owner": "Twiki - Dave Badger",
    "support": "APM ES - Ben Riches",
    "dep": ["E6"],
    "st": "2026-09-08",
    "en": "2026-09-18",
    "days": 10,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "E8",
    "ws": "3 ES",
    "phase": "Rollout",
    "task": "MILESTONE: ES live",
    "owner": "Twiki - Dave Badger",
    "support": "APM - Murray Thomas",
    "dep": ["E7"],
    "st": "2026-09-18",
    "en": "2026-09-18",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": false
  }, {
    "id": "P1",
    "ws": "4 Privileged",
    "phase": "Design",
    "task": "Privileged design: PAW-style hardened image (no mail/Teams/browse), two tiers Priv(zz)/High-Priv(xy)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["N11"],
    "st": "2026-08-10",
    "en": "2026-08-21",
    "days": 11,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": true
  }, {
    "id": "P2",
    "ws": "4 Privileged",
    "phase": "Design",
    "task": "Production access model: PIM per tier, just-in-time elevation, approval + audit",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["P1"],
    "st": "2026-08-17",
    "en": "2026-08-26",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "P3",
    "ws": "4 Privileged",
    "phase": "Design",
    "task": "Privileged Access DDD + CAB",
    "owner": "Twiki - Shaun Struik",
    "support": "APM - Samit Chandra",
    "dep": ["P2"],
    "st": "2026-08-24",
    "en": "2026-08-28",
    "days": 4,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "P4",
    "ws": "4 Privileged",
    "phase": "Design",
    "task": "MILESTONE: Privileged DDD approved",
    "owner": "APM - Samit Chandra",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["P3"],
    "st": "2026-08-28",
    "en": "2026-08-28",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": false
  }, {
    "id": "P5",
    "ws": "4 Privileged",
    "phase": "YubiKey",
    "task": "Test YubiKey 5C NFC FIPS (phishing-resistant MFA for zz/xy)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["P1"],
    "st": "2026-08-17",
    "en": "2026-08-26",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": true
  }, {
    "id": "P6",
    "ws": "4 Privileged",
    "phase": "YubiKey",
    "task": "MILESTONE: YubiKey 5C NFC FIPS validated",
    "owner": "APM Cyber - Ugbaad Adani",
    "support": "Twiki - Shaun Struik",
    "dep": ["P5"],
    "st": "2026-08-26",
    "en": "2026-08-26",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": true
  }, {
    "id": "P7",
    "ws": "4 Privileged",
    "phase": "Build",
    "task": "Build hardened Privileged image + secure pool",
    "owner": "Twiki - Shaun Struik",
    "support": "Twiki - Michael Webster",
    "dep": ["P4"],
    "st": "2026-08-31",
    "en": "2026-09-09",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": true
  }, {
    "id": "P8",
    "ws": "4 Privileged",
    "phase": "Build",
    "task": "CA + PIM for Priv(zz) & High-Priv(xy) production scopes; YubiKey-only sign-in",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["P6", "P7"],
    "st": "2026-09-09",
    "en": "2026-09-16",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": true
  }, {
    "id": "P9",
    "ws": "4 Privileged",
    "phase": "Pilot & cutover",
    "task": "Pilot privileged users (both tiers) + validate prod access via YubiKey",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["P8"],
    "st": "2026-09-16",
    "en": "2026-09-23",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "P10",
    "ws": "4 Privileged",
    "phase": "Pilot & cutover",
    "task": "MILESTONE: Privileged Access live (zz + xy)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["P9"],
    "st": "2026-09-23",
    "en": "2026-09-23",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": true
  }, {
    "id": "D1",
    "ws": "5 Developer",
    "phase": "Design",
    "task": "Finalise Dev DDD: permissive dev image, limited blocks, no production-access path",
    "owner": "Twiki - Shaun Struik",
    "support": "APM - Samit Chandra",
    "dep": ["N11"],
    "st": "2026-08-24",
    "en": "2026-09-02",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "D2",
    "ws": "5 Developer",
    "phase": "Design",
    "task": "Design Dev network from JS pattern + adjust (deny-by-default egress, Zscaler at endpoint)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Network - Michael Court",
    "dep": ["N11"],
    "st": "2026-08-31",
    "en": "2026-09-04",
    "days": 4,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "D3",
    "ws": "5 Developer",
    "phase": "Build",
    "task": "AVD landing zone (Bicep) + FSLogix Premium ZRS + Sentinel + Entra groups",
    "owner": "Twiki - Shaun Struik",
    "support": "Twiki - Michael Webster",
    "dep": ["D1", "D2"],
    "st": "2026-09-07",
    "en": "2026-09-14",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "D4",
    "ws": "5 Developer",
    "phase": "Build",
    "task": "AIB image pipeline (Git template, signing, SBOM)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["D3"],
    "st": "2026-09-09",
    "en": "2026-09-16",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "D5",
    "ws": "5 Developer",
    "phase": "Build",
    "task": "Primary pooled host pool + scaling plan (nested virtualisation)",
    "owner": "Twiki - Shaun Struik",
    "support": "Nerdio",
    "dep": ["D4"],
    "st": "2026-09-14",
    "en": "2026-09-18",
    "days": 5,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "D6",
    "ws": "5 Developer",
    "phase": "Build",
    "task": "Dev tooling layers (VS, Podman/containers, WSL2) with limited blocks",
    "owner": "Twiki - Shaun Struik",
    "support": "APM EUC - Nick Dorbie",
    "dep": ["D5"],
    "st": "2026-09-16",
    "en": "2026-09-23",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "D7",
    "ws": "5 Developer",
    "phase": "Pilot & GA",
    "task": "Pilot ring (PDE owner + cohort) + smoke test + CA enforced",
    "owner": "Twiki - Shaun Struik",
    "support": "APM - PDE owner (TBC)",
    "dep": ["D5"],
    "st": "2026-09-21",
    "en": "2026-09-25",
    "days": 4,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "D8",
    "ws": "5 Developer",
    "phase": "Pilot & GA",
    "task": "Team-by-team migration from legacy PDE",
    "owner": "Twiki - Shaun Struik",
    "support": "APM EUC - Nick Dorbie",
    "dep": ["D7"],
    "st": "2026-09-25",
    "en": "2026-10-02",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "D9",
    "ws": "5 Developer",
    "phase": "Pilot & GA",
    "task": "Capability phases 2-3 (winget/ACR; Copilot/MCP/local LLM)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Cyber - Ugbaad Adani",
    "dep": ["D8"],
    "st": "2026-09-28",
    "en": "2026-10-09",
    "days": 11,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "D10",
    "ws": "5 Developer",
    "phase": "Pilot & GA",
    "task": "Retire legacy PDE after 1 month stable",
    "owner": "Twiki - Shaun Struik",
    "support": "APM Digital Ops - Michael Barker",
    "dep": ["D8"],
    "st": "2026-10-09",
    "en": "2026-10-16",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "D11",
    "ws": "5 Developer",
    "phase": "Pilot & GA",
    "task": "MILESTONE: Developer SOE GA (past 30 Sep on current resourcing)",
    "owner": "Twiki - Shaun Struik",
    "support": "APM - Murray Thomas",
    "dep": ["D8", "D9"],
    "st": "2026-10-09",
    "en": "2026-10-09",
    "days": 0,
    "pct": 0,
    "status": "Not started",
    "type": "Milestone",
    "crit": true
  }, {
    "id": "L1",
    "ws": "6 Logistics",
    "phase": "Job Seeker",
    "task": "Retrieve old JS devices onsite + place new (rolling)",
    "owner": "Twiki - Dave Badger",
    "support": "APM ES - Ben Riches",
    "dep": ["J12"],
    "st": "2026-08-11",
    "en": "2026-09-11",
    "days": 31,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
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
  }, {
    "id": "L3",
    "ws": "6 Logistics",
    "phase": "Standard User",
    "task": "Retrieve standard-user laptops as AVD replaces",
    "owner": "Twiki - Dave Badger",
    "support": "APM EUC - Nick Dorbie",
    "dep": ["S13"],
    "st": "2026-09-07",
    "en": "2026-09-30",
    "days": 23,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "L4",
    "ws": "6 Logistics",
    "phase": "Privileged",
    "task": "Retrieve/contract high-priv laptops to users on own Macs (via Privileged image)",
    "owner": "Twiki - Dave Badger",
    "support": "APM - Murray Thomas",
    "dep": ["P10"],
    "st": "2026-09-23",
    "en": "2026-09-30",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "K1",
    "ws": "7 KB & Enablement",
    "phase": "Network",
    "task": "KB: APM-KIOSK build/cutover + Azure hub-spoke pattern",
    "owner": "Twiki - Shaun (build)",
    "support": "Kath Nash -> Michael Court",
    "dep": ["N10"],
    "st": "2026-07-13",
    "en": "2026-07-20",
    "days": 7,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "K2",
    "ws": "7 KB & Enablement",
    "phase": "Job Seeker",
    "task": "KB: CompNow wipe/prep/ship process",
    "owner": "Twiki - Shaun (build)",
    "support": "Kath Nash -> CompNow",
    "dep": ["J9"],
    "st": "2026-07-24",
    "en": "2026-07-29",
    "days": 5,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "K3",
    "ws": "7 KB & Enablement",
    "phase": "Job Seeker",
    "task": "KB: JS ops (password rotation, lock screen, site cutover, device replace)",
    "owner": "Twiki - Shaun (build)",
    "support": "Kath Nash -> Nick Dorbie / Rohit Singh",
    "dep": ["J5"],
    "st": "2026-07-27",
    "en": "2026-08-10",
    "days": 14,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "K4",
    "ws": "7 KB & Enablement",
    "phase": "Standard User",
    "task": "KB: image/patch, FSLogix lifecycle, CA BYOD, Windows App onboarding",
    "owner": "Twiki - Shaun (build)",
    "support": "Kath Nash -> Nick Dorbie",
    "dep": ["S8"],
    "st": "2026-08-26",
    "en": "2026-09-07",
    "days": 12,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "K5",
    "ws": "7 KB & Enablement",
    "phase": "ES",
    "task": "KB: ES midnight reset, off-site connectivity, Eskilled access",
    "owner": "Twiki - Shaun (build)",
    "support": "Kath Nash -> Ben Riches / Rohit Singh",
    "dep": ["E5"],
    "st": "2026-08-24",
    "en": "2026-09-02",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "K6",
    "ws": "7 KB & Enablement",
    "phase": "Privileged",
    "task": "KB: Privileged access request, PIM per tier (zz/xy), YubiKey enrolment",
    "owner": "Twiki - Shaun (build)",
    "support": "Kath Nash -> Ugbaad Adani / Rohit Singh",
    "dep": ["P7"],
    "st": "2026-09-09",
    "en": "2026-09-18",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "K7",
    "ws": "7 KB & Enablement",
    "phase": "Developer",
    "task": "KB: Dev image pipeline/rollback, self-service tooling, MCP request, FSLogix recovery",
    "owner": "Twiki - Shaun (build)",
    "support": "Kath Nash -> PDE owner / Rohit Singh",
    "dep": ["D6"],
    "st": "2026-09-23",
    "en": "2026-10-02",
    "days": 9,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }, {
    "id": "K8",
    "ws": "7 KB & Enablement",
    "phase": "Service Desk",
    "task": "KB: Tier-1 Service Desk triage runbooks (all use cases)",
    "owner": "Twiki - Shaun (build)",
    "support": "Kath Nash -> Rohit Singh",
    "dep": ["K3"],
    "st": "2026-09-14",
    "en": "2026-09-30",
    "days": 16,
    "pct": 0,
    "status": "Not started",
    "type": "Task",
    "crit": false
  }],
  "raci": [{
    "name": "Murray Thomas",
    "org": "APM",
    "role": "Digital Delivery Portfolio Manager",
    "owns": "This project - decision authority & escalation. Shaun + Dave report here.",
    "reports": "-"
  }, {
    "name": "Nathan Heaton",
    "org": "APM",
    "role": "Program Manager (overall)",
    "owns": "Program-level coordination across projects",
    "reports": "-"
  }, {
    "name": "Samit Chandra",
    "org": "APM",
    "role": "Head of Digital Transformation & Architecture",
    "owns": "DDD owner; architecture authority; Dev requirements sign-off",
    "reports": "-"
  }, {
    "name": "Jensen Spencer",
    "org": "APM",
    "role": "CTO / CISO",
    "owns": "Executive authority — delegates delivery and sign-off to department heads",
    "reports": "-"
  }, {
    "name": "Michael Barker",
    "org": "APM",
    "role": "Head of Digital Operations",
    "owns": "Operations; SSID approval; Dev support model; PDE decommission",
    "reports": "Jensen Spencer"
  }, {
    "name": "Michael Court",
    "org": "APM",
    "role": "IT Infrastructure Lead",
    "owns": "Network & infrastructure build (site + Azure)",
    "reports": "Jensen Spencer (assumed)"
  }, {
    "name": "Ugbaad Adani",
    "org": "APM",
    "role": "Cyber Security",
    "owns": "Cyber controls, RFFR assurance, CA/PIM, Privileged Access + YubiKey",
    "reports": "Jensen Spencer (assumed)"
  }, {
    "name": "Nick Dorbie",
    "org": "APM",
    "role": "End User Compute Manager",
    "owns": "EUC build/operations, Intune",
    "reports": "Michael Barker (assumed)"
  }, {
    "name": "Rohit Singh",
    "org": "APM",
    "role": "IT Service Lead / Service Desk",
    "owns": "Support, triage runbooks",
    "reports": "Michael Barker (assumed)"
  }, {
    "name": "Kath Nash",
    "org": "APM",
    "role": "Digital Business Partner",
    "owns": "All instructions + comms; KB validation",
    "reports": "Michael Barker (assumed)"
  }, {
    "name": "Ben Riches",
    "org": "APM",
    "role": "ES Lead",
    "owns": "Business owner: Job Seeker, ES (take-home), ES devices",
    "reports": "-"
  }, {
    "name": "James Muller",
    "org": "APM",
    "role": "CEO Employment Services",
    "owns": "Executive sponsor",
    "reports": "-"
  }, {
    "name": "Claire McArdle",
    "org": "APM",
    "role": "ES (Eskilled)",
    "owns": "ES Eskilled training content",
    "reports": "-"
  }, {
    "name": "PDE owner",
    "org": "APM",
    "role": "To be nominated",
    "owns": "Developer platform owner (Dev service catalogue, image approval)",
    "reports": "Michael Barker (assumed)"
  }, {
    "name": "Michael Webster",
    "org": "Twiki Corp",
    "role": "Architecture Lead (Azure, Cloud, Security)",
    "owns": "Solution architecture",
    "reports": "Samit Chandra"
  }, {
    "name": "Shaun Struik",
    "org": "Twiki Corp",
    "role": "Solution Engineer AVD",
    "owns": "AVD build & delivery; KB authoring",
    "reports": "Murray Thomas"
  }, {
    "name": "David Badger",
    "org": "Twiki Corp",
    "role": "Project Manager",
    "owns": "PM + device logistics / retrieval",
    "reports": "Murray Thomas"
  }, {
    "name": "CompNow",
    "org": "External",
    "role": "Device partner",
    "owns": "Device wipe/prep/build/ship",
    "reports": "-"
  }, {
    "name": "Nerdio",
    "org": "External",
    "role": "AVD orchestration platform",
    "owns": "Host pool management, autoscale, reimaging",
    "reports": "-"
  }],
  "kb": [{
    "id": "KB-N1",
    "ws": "0 Network",
    "title": "APM-KIOSK site network build & site cutover",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Michael Court",
    "team": "Network",
    "status": "Not started"
  }, {
    "id": "KB-N2",
    "ws": "0 Network",
    "title": "Azure hub-spoke reusable build pattern",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Michael Webster",
    "team": "Cloud / Azure",
    "status": "Not started"
  }, {
    "id": "KB-J1",
    "ws": "1 Job Seeker",
    "title": "CompNow device wipe / prep / Autopilot / label / ship  ·  drafted: CN-JSK-01, CN-JSK-02",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "CompNow + Nick Dorbie",
    "team": "EUC / Vendor",
    "status": "Drafted"
  }, {
    "id": "KB-J2",
    "ws": "1 Job Seeker",
    "title": "Kiosk password rotation runbook (Azure Automation)  ·  drafted: KB-JSK-03, KB-JSK-04",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Ugbaad Adani",
    "team": "Cyber",
    "status": "Drafted"
  }, {
    "id": "KB-J3",
    "ws": "1 Job Seeker",
    "title": "Lock screen proactive remediation  ·  drafted: KB-JSK-09",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Nick Dorbie",
    "team": "EUC",
    "status": "Drafted"
  }, {
    "id": "KB-J4",
    "ws": "1 Job Seeker",
    "title": "F3 account create / retire runbook  ·  drafted: KB-JSK-01",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Ugbaad Adani",
    "team": "Cyber",
    "status": "Drafted"
  }, {
    "id": "KB-J5",
    "ws": "1 Job Seeker",
    "title": "Site VLAN to APM-KIOSK cutover (per site)",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Michael Court",
    "team": "Network",
    "status": "Not started"
  }, {
    "id": "KB-J6",
    "ws": "1 Job Seeker",
    "title": "Kiosk device replacement / RMA  ·  drafted: KB-JSK-05, KB-JSK-06, KB-JSK-07, CN-JSK-03",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Rohit Singh",
    "team": "Service Desk",
    "status": "Drafted"
  }, {
    "id": "KB-J7",
    "ws": "1 Job Seeker",
    "title": "Golden image build & patch (CLI-only, WDAC-hardened)  ·  drafted: WP-2.10 GoldenImage CLIOnly + ExecutionSheet, golden-image-build/*",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Nick Dorbie",
    "team": "EUC",
    "status": "Drafted"
  }, {
    "id": "KB-J8",
    "ws": "1 Job Seeker",
    "title": "Nerdio scripted-action signing under WDAC + session-host App Control allowed signer  ·  drafted: nerdio-scripts-signing-wdac, cyber note 24 Jun",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Ugbaad Adani",
    "team": "Cyber",
    "status": "Drafted"
  }, {
    "id": "KB-J9",
    "ws": "1 Job Seeker",
    "title": "Shell Launcher / Assigned Access kiosk shell + Windows App onboarding  ·  drafted: shell-launcher/*, windows-app-kiosk/*",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Rohit Singh",
    "team": "Service Desk",
    "status": "Drafted"
  }, {
    "id": "KB-S1",
    "ws": "2 Standard User",
    "title": "Golden image build & monthly patch (Nerdio)",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Nick Dorbie",
    "team": "EUC",
    "status": "Not started"
  }, {
    "id": "KB-S2",
    "ws": "2 Standard User",
    "title": "FSLogix profile lifecycle (create/snapshot/restore/deprovision)",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Nick Dorbie",
    "team": "EUC",
    "status": "Not started"
  }, {
    "id": "KB-S3",
    "ws": "2 Standard User",
    "title": "CA BYOD vs corporate troubleshooting",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Ugbaad Adani",
    "team": "Cyber",
    "status": "Not started"
  }, {
    "id": "KB-S4",
    "ws": "2 Standard User",
    "title": "Windows App onboarding (corporate + BYOD)",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Rohit Singh",
    "team": "Service Desk",
    "status": "Not started"
  }, {
    "id": "KB-S5",
    "ws": "2 Standard User",
    "title": "Host pool scaling / capacity management",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Nick Dorbie",
    "team": "EUC",
    "status": "Not started"
  }, {
    "id": "KB-E1",
    "ws": "3 ES",
    "title": "ES midnight reset operation",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Ben Riches",
    "team": "ES",
    "status": "Not started"
  }, {
    "id": "KB-E2",
    "ws": "3 ES",
    "title": "ES off-site connectivity (any Wi-Fi) + filtering",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Rohit Singh",
    "team": "Service Desk",
    "status": "Not started"
  }, {
    "id": "KB-E3",
    "ws": "3 ES",
    "title": "Eskilled access (ES)",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Claire McArdle",
    "team": "ES",
    "status": "Not started"
  }, {
    "id": "KB-P1",
    "ws": "4 Privileged",
    "title": "Privileged Access request & approval (Priv zz / High-Priv xy)",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Ugbaad Adani",
    "team": "Cyber / Identity",
    "status": "Not started"
  }, {
    "id": "KB-P2",
    "ws": "4 Privileged",
    "title": "PIM elevation per tier (production access)",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Ugbaad Adani",
    "team": "Cyber / Identity",
    "status": "Not started"
  }, {
    "id": "KB-P3",
    "ws": "4 Privileged",
    "title": "YubiKey 5C NFC FIPS enrolment",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Ugbaad Adani",
    "team": "Cyber / Identity",
    "status": "Not started"
  }, {
    "id": "KB-P4",
    "ws": "4 Privileged",
    "title": "Privileged image build & hardening",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Michael Webster",
    "team": "Cloud / Cyber",
    "status": "Not started"
  }, {
    "id": "KB-D1",
    "ws": "5 Developer",
    "title": "AIB image pipeline + rollback",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "PDE owner (TBC)",
    "team": "Platform",
    "status": "Not started"
  }, {
    "id": "KB-D2",
    "ws": "5 Developer",
    "title": "Dev self-service tooling (winget / Company Portal)",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "PDE owner (TBC)",
    "team": "Platform",
    "status": "Not started"
  }, {
    "id": "KB-D3",
    "ws": "5 Developer",
    "title": "MCP server request / allowlist",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "PDE owner (TBC)",
    "team": "Platform",
    "status": "Not started"
  }, {
    "id": "KB-D4",
    "ws": "5 Developer",
    "title": "OIDC deployment pipeline request",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "PDE owner (TBC)",
    "team": "Platform",
    "status": "Not started"
  }, {
    "id": "KB-D5",
    "ws": "5 Developer",
    "title": "FSLogix profile recovery (Dev)",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "PDE owner (TBC)",
    "team": "Platform",
    "status": "Not started"
  }, {
    "id": "KB-SD1",
    "ws": "7 KB & Enablement",
    "title": "Tier-1 Service Desk triage runbooks (all use cases)  ·  drafted: KB-JSK-02, KB-JSK-10",
    "built": "Shaun Struik",
    "v1": "Kath Nash",
    "v2": "Rohit Singh",
    "team": "Service Desk",
    "status": "Drafted"
  }],
  "risks": [{
    "n": 1,
    "risk": "APM is running several tier-one projects in parallel. The AVD program's schedule depends on APM departments (Network, Cyber, EUC) and decision-makers completing their inputs on time. Contention for APM resources and approvals — not delivery capacity — is the primary risk to the 30 Sep dates.",
    "impact": "High",
    "like": "High",
    "owner": "Murray Thomas / Twiki",
    "mit": "Lock an APM owner and a due date for every dependency (network build, DR-010/011 decisions, pen-test window, PDE owner). Weekly dependency review with the Portfolio Manager; escalate any APM-side slippage immediately."
  }, {
    "n": 2,
    "risk": "Network (site + Azure) is on the critical path from day one and is delivered by APM Network / Infrastructure. Any APM-side network slippage directly delays Job Seeker testing and the national rollout.",
    "impact": "High",
    "like": "Med",
    "owner": "Michael Court / Michael Webster",
    "mit": "Confirm APM Network resourcing now and hold a daily stand-up until the network is proven. Twiki supports the Azure foundation."
  }, {
    "n": 3,
    "risk": "Privileged Access is a net-new design (PAW-style, two tiers zz/xy, YubiKey) added mid-window. It carries the production-access blast-radius risk.",
    "impact": "High",
    "like": "Med",
    "owner": "Shaun Struik / Ugbaad Adani (Cyber)",
    "mit": "Design once, gate hard on YubiKey. The Cyber lead (Ugbaad Adani) signs off the privileged model. Do not cut over high-priv until P6 (YubiKey validated) and P8 (CA/PIM) pass."
  }, {
    "n": 4,
    "risk": "YubiKey 5C NFC FIPS now gates Privileged production access for zz/xy. If it fails, no phishing-resistant path to production from Macs.",
    "impact": "High",
    "like": "Med",
    "owner": "Shaun / Ugbaad Adani",
    "mit": "Run the YubiKey test early (week of 17 Aug). Fallback to a dedicated hardened Cloud PC for the highest tier if FIPS keys do not validate."
  }, {
    "n": 5,
    "risk": "ES take-home (was CTA) breaks the site-VLAN / PSK / site-Zscaler controls Job Seeker relies on. It is a security redesign, now 3rd in order.",
    "impact": "High",
    "like": "High",
    "owner": "Shaun / Ugbaad Adani",
    "mit": "Treat ES as its own design (Zscaler client on device, revised CA, any Wi-Fi, midnight reset). Confirm Eskilled access path with Claire McArdle."
  }, {
    "n": 6,
    "risk": "Developer is a separate permissive image (limited blocks, no production path). Production access lives only in the Privileged image.",
    "impact": "Med",
    "like": "Low",
    "owner": "Shaun / Samit Chandra",
    "mit": "Keep the boundary clean: no production scopes on the Dev pool. Samit Chandra signs off Dev requirements."
  }, {
    "n": 7,
    "risk": "Standard User printing (DR-010) and mapped drive (DR-011) still pending. Both gate the SU build.",
    "impact": "Med",
    "like": "High",
    "owner": "Michael Barker / Nick Dorbie",
    "mit": "Force decisions by 24 Jul. Universal Print is the likely path. Confirm mapped-drive backend (SharePoint / Azure Files / on-prem)."
  }, {
    "n": 8,
    "risk": "RESOLVED — Job Seeker device count confirmed at 540 (early drafts showed 517 vs 540).",
    "impact": "Low",
    "like": "Low",
    "owner": "Dave Badger / Nick Dorbie",
    "mit": "Done — 540 is the confirmed count, applied everywhere (licensing + site allocation)."
  }, {
    "n": 9,
    "risk": "Nerdio assumed already deployed and operational. Standard User, ES and Developer all reuse it.",
    "impact": "High",
    "like": "Low",
    "owner": "Shaun / Michael Webster",
    "mit": "Confirm Nerdio is live in the tenant. If not, add a deployment task that gates the Job Seeker AVD build."
  }, {
    "n": 10,
    "risk": "Developer PDE owner not yet named. Gates Dev pilot, image approval and the Dev service catalogue.",
    "impact": "Med",
    "like": "Med",
    "owner": "Murray Thomas / Michael Barker",
    "mit": "Nominate the APM PDE owner now so Dev pilot and KB validation have an APM stakeholder."
  }, {
    "n": 11,
    "risk": "Contract ends 30 Sep with little buffer. The exposure is APM-side dependencies (network completion, security sign-off / pen-test scheduling, approvals) landing late — not delivery throughput.",
    "impact": "High",
    "like": "High",
    "owner": "Murray Thomas",
    "mit": "Confirm APM dependency dates now and agree what 'done by 30 Sep' means per use case (live, piloted, designed). Protect Privileged from descoping."
  }, {
    "n": 12,
    "risk": "JOB SEEKER — Code-signing certificate (D-14) is the master gate. One fleet-trusted cert, added as a WDAC allowed signer (D-7), unblocks the entire device-side credential pipeline (token fetch, lock-screen render, LSA write) and Nerdio session-host script signing. Until it is issued, the credential pipeline cannot complete.",
    "impact": "High",
    "like": "High",
    "owner": "APM Cyber - Ugbaad Adani",
    "mit": "Issue the cert and add it as an allowed signer via a signed supplemental policy (signer rule, not hash/path). One cert closes the kiosk device-side scripts and the Nerdio session-host scripts together."
  }, {
    "n": 13,
    "risk": "JOB SEEKER — Credential Proxy public ingress (D-3) is the single biggest unverified link. With no site→Azure private path today, remote kiosks can only reach the Function App via a hardened public ingress.",
    "impact": "High",
    "like": "Med",
    "owner": "APM Cyber - Ugbaad Adani / Twiki - Shaun Struik",
    "mit": "Confirm a hardened EasyAuth-protected public ingress (Entra-validated, returns only the calling device's secret). Migrate the pilot's per-device function-key build to EasyAuth+PRT (C-6)."
  }, {
    "n": 14,
    "risk": "JOB SEEKER — Network design must be finalised + approved by APM before any networking or credential-pipeline deploys; the temporary public-endpoint workaround was rejected. The live build runs in the FVE (test), not prod.",
    "impact": "High",
    "like": "Med",
    "owner": "APM Network - Vijay Natakar / APM Cyber",
    "mit": "Lock an APM owner and date for the finalised network design. Add NSG Storage/MCR egress (D-5) so the Nerdio CSE host deploy stops failing (HTTP 403 / Device Guard 4551)."
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "program/program_workbook_data.js", error: String((e && e.message) || e) }); }

// ui_kits/participant-kiosk/Icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// APM Kiosk — icon set. Paths sourced from Lucide (lucide.dev, ISC license),
// inlined for offline kiosk use. APM has no proprietary icon set in the source
// material; Lucide's even 2px stroke matches the friendly, accessible brand tone.
// Each icon: stroke, currentColor, 24x24 viewBox.

function Icon({
  d,
  size = 24,
  strokeWidth = 2,
  children,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0,
      ...style
    }
  }, rest), d ? /*#__PURE__*/React.createElement("path", {
    d: d
  }) : children);
}
const Icons = {
  search: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  clipboard: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    width: "8",
    height: "4",
    x: "8",
    y: "2",
    rx: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 12h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 16h6"
  })),
  file: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v5h5"
  })),
  building: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    width: "16",
    height: "20",
    x: "4",
    y: "2",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 22v-4h6v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"
  })),
  heart: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
  })),
  cap: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M22 10v6M2 10l10-5 10 5-10 5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 12v5c3 3 9 3 12 0v-5"
  })),
  bus: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "18",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 18h5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "18",
    r: "2"
  })),
  compass: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
  })),
  accessibility: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "4",
    r: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m18 19 1-7-6 1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m5 8 3-3 5.5 3-2.36 3.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.24 14.5a5 5 0 0 0 6.88 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.76 17.5a5 5 0 0 0-6.88-6"
  })),
  volume: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("polygon", {
    points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"
  })),
  zoom: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3M11 8v6M8 11h6"
  })),
  keyboard: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    width: "20",
    height: "16",
    x: "2",
    y: "4",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"
  })),
  power: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M12 2v10M18.4 6.6a9 9 0 1 1-12.77.04"
  })),
  lock: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    width: "18",
    height: "11",
    x: "3",
    y: "11",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11V7a5 5 0 0 1 10 0v4"
  })),
  user: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 21a8 8 0 0 0-16 0"
  })),
  key: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L21 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 2-9.6 9.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7.5",
    cy: "15.5",
    r: "5.5"
  })),
  tag: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7.5",
    cy: "7.5",
    r: ".5",
    fill: "currentColor"
  })),
  arrowRight: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M12 5l7 7-7 7"
  })),
  clock: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 6v6l4 2"
  })),
  external: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
  })),
  usb: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "7",
    r: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "4",
    cy: "20",
    r: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.7 19.3 19 5M21 3l-3 1 2 2zM9.26 7.68 5 12l2 5M10 14l5 2 3.5-3.5M18 12l1-1 1 1-1 1z"
  })),
  shield: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
  }))
};
window.KioskIcons = Icons;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/participant-kiosk/Icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/participant-kiosk/KioskHome.jsx
try { (() => {
// APM Kiosk — Edge start page (bookmark launcher) + session-ended screen.
const I2 = window.KioskIcons;
const DS2 = window.APMDesignSystem_4c9b4b;
const KS = window.KioskScreens;
const BOOKMARKS = window.KIOSK_BOOKMARKS;

/* ---- Edge browser chrome wrapper ---- */
function EdgeChrome({
  children,
  secondsLeft,
  onEnd
}) {
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      fontFamily: 'var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--neutral-100)',
      padding: '8px 12px 0',
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: '#fff',
      padding: '9px 16px',
      borderRadius: '10px 10px 0 0',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-strong)',
      maxWidth: 240
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: KS.LOGO,
    alt: "",
    style: {
      height: 14
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "APM Start page"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 14px',
      background: '#fff',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      color: 'var(--neutral-400)'
    }
  }, /*#__PURE__*/React.createElement(I2.arrowRight, {
    size: 18,
    style: {
      transform: 'rotate(180deg)'
    }
  }), /*#__PURE__*/React.createElement(I2.arrowRight, {
    size: 18,
    style: {
      opacity: 0.4
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 36,
      padding: '0 14px',
      background: 'var(--neutral-100)',
      borderRadius: 'var(--radius-pill)',
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(I2.lock, {
    size: 13
  }), " apm-kiosk//start"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      fontWeight: 600,
      color: secondsLeft < 60 ? 'var(--status-danger)' : 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(I2.clock, {
    size: 16
  }), " ", mm, ":", ss), /*#__PURE__*/React.createElement(DS2.Button, {
    size: "sm",
    variant: "danger",
    leadingIcon: /*#__PURE__*/React.createElement(I2.power, {
      size: 16
    }),
    onClick: onEnd
  }, "End session")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, children));
}

/* ---- Accessibility quick-tools row ---- */
function A11yBar() {
  const tools = [{
    icon: /*#__PURE__*/React.createElement(I2.volume, {
      size: 18
    }),
    label: 'Read aloud'
  }, {
    icon: /*#__PURE__*/React.createElement(I2.zoom, {
      size: 18
    }),
    label: 'Magnifier'
  }, {
    icon: /*#__PURE__*/React.createElement(I2.keyboard, {
      size: 18
    }),
    label: 'On-screen keyboard'
  }, {
    icon: /*#__PURE__*/React.createElement(I2.accessibility, {
      size: 18
    }),
    label: 'High contrast'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, tools.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.label,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: 40,
      padding: '0 14px',
      background: 'rgba(255,255,255,0.12)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-ui)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, t.icon, t.label)));
}

/* ---- Bookmark tile ---- */
function Tile({
  item,
  accent,
  onOpen
}) {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onOpen,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      textAlign: 'left',
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontFamily: 'var(--font-ui)',
      width: '100%',
      boxShadow: h ? 'var(--shadow-md)' : 'none',
      transform: h ? 'translateY(-2px)' : 'none',
      transition: 'box-shadow .2s var(--ease-standard), transform .2s var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 42,
      height: 42,
      flexShrink: 0,
      borderRadius: 'var(--radius-sm)',
      background: KS.ACCENT[accent],
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: item.mark.length > 2 ? 13 : 16,
      fontFamily: 'var(--font-display)'
    }
  }, item.mark), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--text-strong)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, item.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 12,
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, item.url)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-subtle)',
      opacity: h ? 1 : 0,
      transition: 'opacity .2s'
    }
  }, /*#__PURE__*/React.createElement(I2.external, {
    size: 16
  })));
}

/* ---- Category section ---- */
function CategorySection({
  cat,
  onOpen
}) {
  const Ic = I2[cat.icon] || I2.compass;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 'var(--radius-md)',
      background: KS.ACCENT_SOFT[cat.accent],
      color: KS.ACCENT[cat.accent],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    size: 22
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 19,
      fontWeight: 600,
      color: 'var(--text-strong)',
      margin: 0
    }
  }, cat.label), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      margin: 0
    }
  }, cat.blurb))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
      gap: 12
    }
  }, cat.items.map(it => /*#__PURE__*/React.createElement(Tile, {
    key: it.name,
    item: it,
    accent: cat.accent,
    onOpen: () => onOpen(it)
  }))));
}

/* ============================ KIOSK HOME ============================ */
function KioskHome({
  device,
  secondsLeft,
  onEnd
}) {
  const [toast, setToast] = React.useState(null);
  const open = it => {
    setToast(it.name);
    clearTimeout(window.__kt);
    window.__kt = setTimeout(() => setToast(null), 2200);
  };
  return /*#__PURE__*/React.createElement(EdgeChrome, {
    secondsLeft: secondsLeft,
    onEnd: onEnd
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--gradient-navy)',
      color: '#fff',
      padding: '28px 40px 30px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ribbon-purple.png",
    alt: "",
    style: {
      position: 'absolute',
      bottom: -40,
      right: -20,
      width: '34%',
      opacity: 0.85,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: KS.LOGO,
    alt: "APM",
    style: {
      height: 40,
      filter: 'brightness(0) invert(1)',
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 30,
      fontWeight: 600,
      margin: '0 0 6px'
    }
  }, "Welcome \u2014 where would you like to start?"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: 'var(--apm-navy-100)',
      margin: 0,
      maxWidth: 520
    }
  }, "Pick a service below, or search the web. Need help? Ask your APM consultant.")), /*#__PURE__*/React.createElement(A11yBar, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 2,
      marginTop: 22,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 52,
      maxWidth: 620,
      background: '#fff',
      borderRadius: 'var(--radius-pill)',
      padding: '0 8px 0 20px',
      boxShadow: 'var(--shadow-lg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(I2.search, {
    size: 20
  })), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search jobs, or the web\u2026",
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontFamily: 'var(--font-ui)',
      fontSize: 15,
      color: 'var(--text-body)',
      background: 'transparent'
    }
  }), /*#__PURE__*/React.createElement(DS2.Button, {
    size: "md"
  }, "Search"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 40px 48px',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(DS2.Alert, {
    tone: "warning",
    title: "This is a shared device \u2014 your session will be wiped",
    icon: /*#__PURE__*/React.createElement(I2.usb, {
      size: 20
    })
  }, "Everything you do is erased when your session ends or after 10 minutes of inactivity. Save your resume to a USB stick or email it to yourself before you finish.")), BOOKMARKS.map(cat => /*#__PURE__*/React.createElement(CategorySection, {
    key: cat.id,
    cat: cat,
    onOpen: open
  }))), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--apm-navy-700)',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-ui)',
      fontSize: 14,
      fontWeight: 600,
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement(I2.external, {
    size: 16
  }), " Opening ", toast, "\u2026"));
}

/* ============================ SESSION ENDED ============================ */
function SessionEnded({
  onReset
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--gradient-navy)',
      color: '#fff',
      fontFamily: 'var(--font-ui)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ribbon-magenta.png",
    alt: "",
    style: {
      position: 'absolute',
      top: -60,
      right: -80,
      width: '52%',
      opacity: 0.85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 2,
      maxWidth: 460,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.12)',
      color: 'var(--apm-orange-400)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(I2.shield, {
    size: 36
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 32,
      fontWeight: 600,
      margin: '0 0 12px'
    }
  }, "Your session has ended"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: 'var(--apm-navy-100)',
      lineHeight: 1.6,
      margin: '0 0 28px'
    }
  }, "All your files, history and sign-ins have been securely wiped from this device. Thanks for using the APM Participant Kiosk."), /*#__PURE__*/React.createElement(DS2.Button, {
    size: "lg",
    leadingIcon: /*#__PURE__*/React.createElement(I2.lock, {
      size: 20
    }),
    onClick: onReset
  }, "Return to lock screen")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 28,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 13,
      color: 'var(--apm-navy-100)',
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: KS.LOGO,
    alt: "APM",
    style: {
      height: 22,
      filter: 'brightness(0) invert(1)'
    }
  }), " enabling better lives"));
}
window.KioskHome = KioskHome;
window.SessionEnded = SessionEnded;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/participant-kiosk/KioskHome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/participant-kiosk/KioskScreens.jsx
try { (() => {
// APM Participant Kiosk — screen recreations.
// Composes APM DS primitives (Button, Card, Badge, Alert) + KioskIcons.
const DS = window.APMDesignSystem_4c9b4b;
const I = window.KioskIcons;
const ACCENT = {
  orange: 'var(--apm-orange-500)',
  navy: 'var(--apm-navy-600)',
  purple: 'var(--apm-purple)',
  indigo: 'var(--apm-indigo)',
  magenta: 'var(--apm-magenta)'
};
const ACCENT_SOFT = {
  orange: 'var(--apm-orange-50)',
  navy: 'var(--apm-navy-50)',
  purple: '#EEE7F4',
  indigo: '#E7E8F4',
  magenta: '#FBE5F0'
};
const LOGO = '../../assets/apm-logo.png';
const RIBBON_MAGENTA = '../../assets/ribbon-magenta.png';

/* ============================ LOCK SCREEN ============================ */
function LockScreen({
  device,
  onSignIn
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      background: 'var(--gradient-navy)',
      fontFamily: 'var(--font-ui)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: RIBBON_MAGENTA,
    alt: "",
    style: {
      position: 'absolute',
      top: -60,
      right: -80,
      width: '58%',
      opacity: 0.9,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 40,
      left: 48,
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO,
    alt: "APM",
    style: {
      height: 52,
      filter: 'brightness(0) invert(1)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 18,
      opacity: 0.85,
      borderLeft: '1px solid rgba(255,255,255,.3)',
      paddingLeft: 16
    }
  }, "Participant Kiosk")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 56,
      alignItems: 'center',
      maxWidth: 980,
      padding: 24,
      position: 'relative',
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--apm-orange-400)',
      margin: '0 0 12px'
    }
  }, "Welcome"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 46,
      fontWeight: 600,
      lineHeight: 1.1,
      color: '#fff',
      margin: '0 0 16px'
    }
  }, "Let's find your", /*#__PURE__*/React.createElement("br", null), "next opportunity"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: 1.6,
      color: 'var(--apm-navy-100)',
      maxWidth: 420,
      margin: '0 0 28px'
    }
  }, "Sign in with the details on the right to start your session. Search jobs, build a resume and access support \u2014 all in one place."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 13,
      color: 'var(--apm-navy-100)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--apm-orange-400)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(I.shield, {
    size: 18
  })), "Private & secure \xB7 everything is wiped when you finish")), /*#__PURE__*/React.createElement(DS.Card, {
    padding: "28px",
    style: {
      width: 360,
      flexShrink: 0,
      boxShadow: 'var(--shadow-xl)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brand-primary)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(I.lock, {
    size: 20
  })), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 17,
      color: 'var(--text-strong)'
    }
  }, "Your sign-in details")), /*#__PURE__*/React.createElement(CredRow, {
    icon: /*#__PURE__*/React.createElement(I.user, {
      size: 18
    }),
    label: "Username",
    value: device.user
  }), /*#__PURE__*/React.createElement(CredRow, {
    icon: /*#__PURE__*/React.createElement(I.key, {
      size: 18
    }),
    label: "Password",
    value: device.pass,
    mono: true
  }), /*#__PURE__*/React.createElement(CredRow, {
    icon: /*#__PURE__*/React.createElement(I.tag, {
      size: 18
    }),
    label: "Asset tag",
    value: device.asset
  }), /*#__PURE__*/React.createElement(DS.Button, {
    fullWidth: true,
    size: "lg",
    trailingIcon: /*#__PURE__*/React.createElement(I.arrowRight, {
      size: 20
    }),
    onClick: onSignIn,
    style: {
      marginTop: 8
    }
  }, "Sign in to start"))));
}
function CredRow({
  icon,
  label,
  value,
  mono
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      display: 'flex'
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontWeight: 700,
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: 'var(--text-strong)',
      fontFamily: mono ? 'var(--font-mono)' : 'inherit',
      wordBreak: 'break-all'
    }
  }, value)));
}

/* ============================ SIGN IN (AVD) ============================ */
function SignIn({
  device,
  onDone
}) {
  const [pw, setPw] = React.useState('');
  const [err, setErr] = React.useState('');
  const submit = () => {
    if (pw.trim().length < 3) {
      setErr('Enter the password shown on the lock screen');
      return;
    }
    onDone();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--surface-page)',
      fontFamily: 'var(--font-ui)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 420,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO,
    alt: "APM",
    style: {
      height: 56,
      margin: '0 auto 28px'
    }
  }), /*#__PURE__*/React.createElement(DS.Card, {
    padding: "32px",
    style: {
      textAlign: 'left',
      boxShadow: 'var(--shadow-lg)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 22,
      fontFamily: 'var(--font-display)',
      margin: '0 0 4px'
    }
  }, "Sign in"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)',
      margin: '0 0 22px'
    }
  }, "Connecting to your Workspace"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(DS.Input, {
    label: "Username",
    value: device.user,
    readOnly: true
  }), /*#__PURE__*/React.createElement(DS.Input, {
    label: "Password",
    type: "password",
    placeholder: "Enter password from lock screen",
    value: pw,
    error: err,
    onChange: e => {
      setPw(e.target.value);
      setErr('');
    },
    onKeyDown: e => e.key === 'Enter' && submit()
  }), /*#__PURE__*/React.createElement(DS.Button, {
    fullWidth: true,
    size: "lg",
    onClick: submit
  }, "Sign in"))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--text-subtle)',
      marginTop: 18
    }
  }, "Azure Virtual Desktop \xB7 ", device.asset)));
}
window.KioskScreens = {
  LockScreen,
  SignIn,
  ACCENT,
  ACCENT_SOFT,
  LOGO
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/participant-kiosk/KioskScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/participant-kiosk/bookmarks.js
try { (() => {
// APM Participant Kiosk — managed bookmark dataset.
// Sourced verbatim from "JobSeeker_Detailed Design V1.0" §3.2.2 Kiosk Bookmarks.
// Categories mirror the Edge ManagedFavorites folder structure (DR-003).

window.KIOSK_BOOKMARKS = [{
  id: 'jobsearch',
  label: 'Job search',
  icon: 'search',
  accent: 'orange',
  blurb: 'Find and apply for jobs',
  items: [{
    name: 'Workforce Australia — Jobs',
    url: 'workforceaustralia.gov.au',
    mark: 'WA'
  }, {
    name: 'SEEK',
    url: 'seek.com.au',
    mark: 'S'
  }, {
    name: 'Indeed',
    url: 'au.indeed.com',
    mark: 'In'
  }, {
    name: 'Jora',
    url: 'au.jora.com',
    mark: 'J'
  }, {
    name: 'Gumtree Jobs',
    url: 'gumtree.com.au',
    mark: 'G'
  }, {
    name: 'Ethical Jobs',
    url: 'ethicaljobs.com.au',
    mark: 'EJ'
  }, {
    name: 'APS Jobs',
    url: 'apsjobs.gov.au',
    mark: 'AP'
  }, {
    name: 'National Police Check',
    url: 'cvcheck.com',
    mark: 'PC'
  }]
}, {
  id: 'workforce',
  label: 'Workforce Australia & reporting',
  icon: 'clipboard',
  accent: 'navy',
  blurb: 'Manage your account and obligations',
  items: [{
    name: 'WFA Online for Individuals',
    url: 'workforceaustralia.gov.au/individuals',
    mark: 'WA'
  }, {
    name: 'Your Job Plan explained',
    url: 'youtube.com',
    mark: '▶'
  }, {
    name: 'Your Points Target',
    url: 'youtube.com',
    mark: '▶'
  }, {
    name: 'Compliance Framework',
    url: 'workforceaustralia.gov.au',
    mark: 'CF'
  }, {
    name: 'Contact us',
    url: 'workforceaustralia.gov.au/contact-us',
    mark: 'C'
  }]
}, {
  id: 'documents',
  label: 'Resume & documents',
  icon: 'file',
  accent: 'purple',
  blurb: 'Build your resume and cover letter',
  items: [{
    name: 'Resume templates',
    url: 'create.microsoft.com',
    mark: 'W'
  }, {
    name: 'Cover letter templates',
    url: 'create.microsoft.com',
    mark: 'W'
  }, {
    name: 'Word for the web',
    url: 'office.com',
    mark: 'W'
  }, {
    name: 'Improve your job search',
    url: 'workforceaustralia.gov.au/coaching',
    mark: 'IJ'
  }]
}, {
  id: 'government',
  label: 'Centrelink & Services Australia',
  icon: 'building',
  accent: 'indigo',
  blurb: 'Government forms and reporting',
  items: [{
    name: 'Medical Certificate (SU415)',
    url: 'servicesaustralia.gov.au/su415',
    mark: 'SU'
  }, {
    name: 'Verification of medical conditions (SU684)',
    url: 'servicesaustralia.gov.au/su684',
    mark: 'SU'
  }, {
    name: 'Report employment income',
    url: 'servicesaustralia.gov.au',
    mark: 'SA'
  }]
}, {
  id: 'support',
  label: 'Essential support services',
  icon: 'heart',
  accent: 'magenta',
  blurb: 'Free help when you need it',
  items: [{
    name: 'Ask Izzy',
    url: 'askizzy.org.au',
    mark: 'AI'
  }, {
    name: 'Beyond Blue',
    url: 'beyondblue.org.au',
    mark: 'BB'
  }, {
    name: 'Headspace',
    url: 'headspace.org.au',
    mark: 'H'
  }, {
    name: 'Drug Foundation help & support',
    url: 'adf.org.au',
    mark: 'ADF'
  }]
}, {
  id: 'training',
  label: 'Training',
  icon: 'cap',
  accent: 'navy',
  blurb: 'Courses and skills',
  items: [{
    name: 'TAFE (your state)',
    url: 'tafe.edu.au',
    mark: 'T'
  }, {
    name: 'Duke',
    url: 'duke.co',
    mark: 'D'
  }, {
    name: 'MCI Institute',
    url: 'mciinstitute.edu.au',
    mark: 'M'
  }, {
    name: 'Alffie',
    url: 'alffie.com',
    mark: 'A'
  }]
}, {
  id: 'transport',
  label: 'Transport',
  icon: 'bus',
  accent: 'orange',
  blurb: 'Getting to interviews and work',
  items: [{
    name: 'Transport for NSW',
    url: 'transport.nsw.gov.au',
    mark: 'NSW'
  }, {
    name: 'Transport VIC',
    url: 'vic.gov.au',
    mark: 'VIC'
  }, {
    name: 'TMR Queensland',
    url: 'tmr.qld.gov.au',
    mark: 'QLD'
  }, {
    name: 'Transport WA',
    url: 'transport.wa.gov.au',
    mark: 'WA'
  }]
}, {
  id: 'other',
  label: 'Other services',
  icon: 'compass',
  accent: 'purple',
  blurb: 'Work rights and volunteering',
  items: [{
    name: 'Fair Work',
    url: 'fairwork.gov.au',
    mark: 'FW'
  }, {
    name: 'Pay & Conditions Tool',
    url: 'calculate.fairwork.gov.au',
    mark: 'PC'
  }, {
    name: 'Volunteering Australia',
    url: 'govolunteer.com.au',
    mark: 'V'
  }]
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/participant-kiosk/bookmarks.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Input = __ds_scope.Input;

})();
