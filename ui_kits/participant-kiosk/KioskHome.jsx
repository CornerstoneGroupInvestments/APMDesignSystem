// APM Kiosk — Edge start page (bookmark launcher) + session-ended screen.
const I2 = window.KioskIcons;
const DS2 = window.APMDesignSystem_4c9b4b;
const KS = window.KioskScreens;
const BOOKMARKS = window.KIOSK_BOOKMARKS;

/* ---- Edge browser chrome wrapper ---- */
function EdgeChrome({ children, secondsLeft, onEnd }) {
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'var(--font-ui)' }}>
      {/* tab strip */}
      <div style={{ background: 'var(--neutral-100)', padding: '8px 12px 0', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '9px 16px', borderRadius: '10px 10px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', maxWidth: 240 }}>
          <img src={KS.LOGO} alt="" style={{ height: 14 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>APM Start page</span>
        </div>
      </div>
      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', background: '#fff', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: 4, color: 'var(--neutral-400)' }}>
          <I2.arrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
          <I2.arrowRight size={18} style={{ opacity: 0.4 }} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-pill)', fontSize: 13, color: 'var(--text-muted)' }}>
          <I2.lock size={13} /> apm-kiosk//start
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: secondsLeft < 60 ? 'var(--status-danger)' : 'var(--text-muted)' }}>
          <I2.clock size={16} /> {mm}:{ss}
        </div>
        <DS2.Button size="sm" variant="danger" leadingIcon={<I2.power size={16} />} onClick={onEnd}>End session</DS2.Button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
    </div>
  );
}

/* ---- Accessibility quick-tools row ---- */
function A11yBar() {
  const tools = [
    { icon: <I2.volume size={18} />, label: 'Read aloud' },
    { icon: <I2.zoom size={18} />, label: 'Magnifier' },
    { icon: <I2.keyboard size={18} />, label: 'On-screen keyboard' },
    { icon: <I2.accessibility size={18} />, label: 'High contrast' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tools.map((t) => (
        <button key={t.label} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 14px',
          background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>{t.icon}{t.label}</button>
      ))}
    </div>
  );
}

/* ---- Bookmark tile ---- */
function Tile({ item, accent, onOpen }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onOpen} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: 12, textAlign: 'left',
        background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
        cursor: 'pointer', fontFamily: 'var(--font-ui)', width: '100%',
        boxShadow: h ? 'var(--shadow-md)' : 'none', transform: h ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow .2s var(--ease-standard), transform .2s var(--ease-standard)',
      }}>
      <span style={{
        width: 42, height: 42, flexShrink: 0, borderRadius: 'var(--radius-sm)',
        background: KS.ACCENT[accent], color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: item.mark.length > 2 ? 13 : 16, fontFamily: 'var(--font-display)',
      }}>{item.mark}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</span>
      </span>
      <span style={{ color: 'var(--text-subtle)', opacity: h ? 1 : 0, transition: 'opacity .2s' }}><I2.external size={16} /></span>
    </button>
  );
}

/* ---- Category section ---- */
function CategorySection({ cat, onOpen }) {
  const Ic = I2[cat.icon] || I2.compass;
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: KS.ACCENT_SOFT[cat.accent], color: KS.ACCENT[cat.accent], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ic size={22} />
        </span>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, color: 'var(--text-strong)', margin: 0 }}>{cat.label}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{cat.blurb}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
        {cat.items.map((it) => <Tile key={it.name} item={it} accent={cat.accent} onOpen={() => onOpen(it)} />)}
      </div>
    </section>
  );
}

/* ============================ KIOSK HOME ============================ */
function KioskHome({ device, secondsLeft, onEnd }) {
  const [toast, setToast] = React.useState(null);
  const open = (it) => { setToast(it.name); clearTimeout(window.__kt); window.__kt = setTimeout(() => setToast(null), 2200); };
  return (
    <EdgeChrome secondsLeft={secondsLeft} onEnd={onEnd}>
      {/* brand hero band */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--gradient-navy)', color: '#fff', padding: '28px 40px 30px' }}>
        <img src="../../assets/ribbon-purple.png" alt="" style={{ position: 'absolute', bottom: -40, right: -20, width: '34%', opacity: 0.85, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <img src={KS.LOGO} alt="APM" style={{ height: 40, filter: 'brightness(0) invert(1)', marginBottom: 16 }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, margin: '0 0 6px' }}>Welcome — where would you like to start?</h1>
            <p style={{ fontSize: 15, color: 'var(--apm-navy-100)', margin: 0, maxWidth: 520 }}>Pick a service below, or search the web. Need help? Ask your APM consultant.</p>
          </div>
          <A11yBar />
        </div>
        {/* search */}
        <div style={{ position: 'relative', zIndex: 2, marginTop: 22, display: 'flex', alignItems: 'center', gap: 10, height: 52, maxWidth: 620, background: '#fff', borderRadius: 'var(--radius-pill)', padding: '0 8px 0 20px', boxShadow: 'var(--shadow-lg)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex' }}><I2.search size={20} /></span>
          <input placeholder="Search jobs, or the web…" style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-body)', background: 'transparent' }} />
          <DS2.Button size="md">Search</DS2.Button>
        </div>
      </div>

      {/* data-wipe notice + categories */}
      <div style={{ padding: '24px 40px 48px', background: 'var(--surface-page)' }}>
        <div style={{ marginBottom: 28 }}>
          <DS2.Alert tone="warning" title="This is a shared device — your session will be wiped" icon={<I2.usb size={20} />}>
            Everything you do is erased when your session ends or after 10 minutes of inactivity. Save your resume to a USB stick or email it to yourself before you finish.
          </DS2.Alert>
        </div>
        {BOOKMARKS.map((cat) => <CategorySection key={cat.id} cat={cat} onOpen={open} />)}
      </div>

      {/* toast */}
      {toast && (
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--apm-navy-700)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 10, zIndex: 50 }}>
          <I2.external size={16} /> Opening {toast}…
        </div>
      )}
    </EdgeChrome>
  );
}

/* ============================ SESSION ENDED ============================ */
function SessionEnded({ onReset }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-navy)', color: '#fff', fontFamily: 'var(--font-ui)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden' }}>
      <img src="../../assets/ribbon-magenta.png" alt="" style={{ position: 'absolute', top: -60, right: -80, width: '52%', opacity: 0.85 }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 460, padding: 24 }}>
        <span style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', color: 'var(--apm-orange-400)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <I2.shield size={36} />
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, margin: '0 0 12px' }}>Your session has ended</h1>
        <p style={{ fontSize: 16, color: 'var(--apm-navy-100)', lineHeight: 1.6, margin: '0 0 28px' }}>
          All your files, history and sign-ins have been securely wiped from this device. Thanks for using the APM Participant Kiosk.
        </p>
        <DS2.Button size="lg" leadingIcon={<I2.lock size={20} />} onClick={onReset}>Return to lock screen</DS2.Button>
      </div>
      <div style={{ position: 'absolute', bottom: 28, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--apm-navy-100)', zIndex: 2 }}>
        <img src={KS.LOGO} alt="APM" style={{ height: 22, filter: 'brightness(0) invert(1)' }} /> enabling better lives
      </div>
    </div>
  );
}

window.KioskHome = KioskHome;
window.SessionEnded = SessionEnded;
