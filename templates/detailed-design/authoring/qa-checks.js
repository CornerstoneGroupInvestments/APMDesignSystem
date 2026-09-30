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
    const L1 = Math.max(lum(a), lum(b)), L2 = Math.min(lum(a), lum(b));
    return Math.round((L1 + 0.05) / (L2 + 0.05) * 100) / 100;
  };
  // resolves any CSS colour - including oklab()/color-mix() - to [r,g,b]
  const resolve = col => {
    const d = document.createElement('div');
    d.style.color = col; document.body.appendChild(d);
    const c = getComputedStyle(d).color; d.remove();
    if (c.startsWith('rgb')) return parseNums(c).slice(0, 3);
    const cv = document.createElement('canvas').getContext('2d');
    cv.fillStyle = col; cv.fillRect(0, 0, 1, 1);
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
      const large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
      const bar = large ? 3 : 4.5;
      if (r < bar) out.push({
        text: el.textContent.trim().slice(0, 34), tag: el.tagName,
        cls: typeof el.className === 'string' ? el.className : '',
        size: cs.fontSize, weight: cs.fontWeight, color: cs.color, ratio: r, bar
      });
    });
    return { checked: els.length, fails: out.length, out };
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
      [[overlays, targets], [overlays, overlays]].forEach(([as, bs], pass) =>
        as.forEach((a, ai) => bs.forEach((b, bi) => {
          if (a === b || (pass === 1 && bi <= ai)) return;
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (ox > 1 && oy > 1) out.push({
            fig: fig.id,
            a: a.textContent.trim().slice(0, 30), b: b.textContent.trim().slice(0, 30),
            overlap: Math.round(ox) + 'x' + Math.round(oy),
            // relative to the figure box, so these map onto the inline left/top values
            aLeft: Math.round(ra.left - fb.left), aRight: Math.round(ra.right - fb.left),
            aTop: Math.round(ra.top - fb.top)
          });
        })));
    });
    return { figures: root.querySelectorAll('.dgm-fig').length, fails: out.length, out };
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
          out.push({ fig: fig.id, el: el.textContent.trim().slice(0, 30) || el.tagName,
            spill: { right: Math.round(r.right - fb.right), bottom: Math.round(r.bottom - fb.bottom) } });
        }
      });
    });
    return { fails: out.length, out };
  }

  // Boxes whose own text is clipped by a fixed height (scrollHeight > clientHeight).
  // overflowScan only measures against the .dgm-fig canvas, so a box that hides its own
  // last line passes it - this catches that. Runs on the elements that carry copy.
  function clipScan(root) {
    root = root || document;
    const out = [];
    root.querySelectorAll('.dgm-fig').forEach(fig => {
      fig.querySelectorAll('.dgm-box, .dgm-heat, .dgm-lbl, .dgm-note').forEach(el => {
        const hid = el.scrollHeight - el.clientHeight, wid = el.scrollWidth - el.clientWidth;
        if (hid > 1 || wid > 1) out.push({ fig: fig.id,
          el: (el.querySelector('h4, h5') || el).textContent.trim().slice(0, 34),
          needs: el.scrollHeight, has: el.clientHeight, clipped: Math.max(hid, 0), widthClipped: Math.max(wid, 0) });
      });
    });
    return { fails: out.length, out };
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
    return { fails: out.length, out };
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
      const sx = sb.width / vb[2], sy = sb.height / vb[3];
      const segs = [...svg.querySelectorAll('line')].map(l => ({
        x1: sb.left + (+l.getAttribute('x1')) * sx, y1: sb.top + (+l.getAttribute('y1')) * sy,
        x2: sb.left + (+l.getAttribute('x2')) * sx, y2: sb.top + (+l.getAttribute('y2')) * sy
      }));
      if (!segs.length) return;
      labels.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        let best = Infinity;
        segs.forEach(s => {
          const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
          const len2 = dx * dx + dy * dy;
          let t = len2 ? ((cx - s.x1) * dx + (cy - s.y1) * dy) / len2 : 0;
          t = Math.max(0, Math.min(1, t));
          const px = s.x1 + t * dx, py = s.y1 + t * dy;
          best = Math.min(best, Math.hypot(cx - px, cy - py));
        });
        if (best > maxDist) out.push({
          fig: fig.id, label: el.textContent.trim().slice(0, 40),
          distToNearestWire: Math.round(best),
          left: Math.round(r.left - fig.getBoundingClientRect().left),
          top: Math.round(r.top - fig.getBoundingClientRect().top)
        });
      });
    });
    return { fails: out.length, out };
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
        fig: fig.id, stylesUsed: styles.size, legendEntries: entries,
        styles: [...styles]
      });
    });
    return { fails: out.length, out };
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
      const sx = sb.width / vb[2], sy = sb.height / vb[3];
      const rects = [...fig.querySelectorAll('.dgm-box, .dgm-heat')].map(b => b.getBoundingClientRect());
      const inAny = (x, y) => rects.some(r => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
      svg.querySelectorAll('line').forEach(l => {
        if (!l.getAttribute('marker-end')) return;
        const x1 = sb.left + (+l.getAttribute('x1')) * sx, y1 = sb.top + (+l.getAttribute('y1')) * sy;
        const x2 = sb.left + (+l.getAttribute('x2')) * sx, y2 = sb.top + (+l.getAttribute('y2')) * sy;
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
        if (headPct > 0.5 || (frac > maxHidden && !tipInBox)) out.push({
          fig: fig.id,
          line: l.getAttribute('x1') + ',' + l.getAttribute('y1') + ' -> ' + l.getAttribute('x2') + ',' + l.getAttribute('y2'),
          hiddenPct: Math.round(frac * 100),
          headHiddenPct: Math.round(headPct * 100)
        });
      });
    });
    return { fails: out.length, out };
  }

  function qa(root) {
    const overlap = overlapScan(root), contrast = contrastAudit(root),
          overflow = overflowScan(root), escapes = escapeScan(root),
          orphans = orphanScan(root), legends = legendScan(root), occlusion = occlusionScan(root),
          clip = clipScan(root);
    const ok = overlap.fails === 0 && contrast.fails === 0 && overflow.fails === 0
            && escapes.fails === 0 && orphans.fails === 0 && legends.fails === 0
            && occlusion.fails === 0 && clip.fails === 0;
    console.log(ok ? '✓ QA clean' : '✗ QA failures',
      { overlap: overlap.fails, contrast: contrast.fails, overflow: overflow.fails,
        escapes: escapes.fails, orphans: orphans.fails, legends: legends.fails,
        occlusion: occlusion.fails, clip: clip.fails });
    return { ok, overlap, contrast, overflow, escapes, orphans, legends, occlusion, clip };
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
