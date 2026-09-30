// APM Participant Kiosk — screen recreations.
// Composes APM DS primitives (Button, Card, Badge, Alert) + KioskIcons.
const DS = window.APMDesignSystem_4c9b4b;
const I = window.KioskIcons;

const ACCENT = {
  orange: 'var(--apm-orange-500)', navy: 'var(--apm-navy-600)',
  purple: 'var(--apm-purple)', indigo: 'var(--apm-indigo)', magenta: 'var(--apm-magenta)',
};
const ACCENT_SOFT = {
  orange: 'var(--apm-orange-50)', navy: 'var(--apm-navy-50)',
  purple: '#EEE7F4', indigo: '#E7E8F4', magenta: '#FBE5F0',
};

const LOGO = '../../assets/apm-logo.png';
const RIBBON_MAGENTA = '../../assets/ribbon-magenta.png';

/* ============================ LOCK SCREEN ============================ */
function LockScreen({ device, onSignIn }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: 'var(--gradient-navy)',
      fontFamily: 'var(--font-ui)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img src={RIBBON_MAGENTA} alt="" style={{ position: 'absolute', top: -60, right: -80, width: '58%', opacity: 0.9, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 40, left: 48, display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src={LOGO} alt="APM" style={{ height: 52, filter: 'brightness(0) invert(1)' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, opacity: 0.85, borderLeft: '1px solid rgba(255,255,255,.3)', paddingLeft: 16 }}>Participant Kiosk</span>
      </div>

      <div style={{ display: 'flex', gap: 56, alignItems: 'center', maxWidth: 980, padding: 24, position: 'relative', zIndex: 2 }}>
        <div style={{ flex: 1 }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 13, fontWeight: 700, color: 'var(--apm-orange-400)', margin: '0 0 12px' }}>Welcome</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 46, fontWeight: 600, lineHeight: 1.1, color: '#fff', margin: '0 0 16px' }}>Let's find your<br/>next opportunity</h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--apm-navy-100)', maxWidth: 420, margin: '0 0 28px' }}>
            Sign in with the details on the right to start your session. Search jobs, build a resume and access support — all in one place.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--apm-navy-100)' }}>
            <span style={{ color: 'var(--apm-orange-400)', display: 'flex' }}><I.shield size={18} /></span>
            Private &amp; secure · everything is wiped when you finish
          </div>
        </div>

        <DS.Card padding="28px" style={{ width: 360, flexShrink: 0, boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <span style={{ color: 'var(--brand-primary)', display: 'flex' }}><I.lock size={20} /></span>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-strong)' }}>Your sign-in details</strong>
          </div>
          <CredRow icon={<I.user size={18} />} label="Username" value={device.user} />
          <CredRow icon={<I.key size={18} />} label="Password" value={device.pass} mono />
          <CredRow icon={<I.tag size={18} />} label="Asset tag" value={device.asset} />
          <DS.Button fullWidth size="lg" trailingIcon={<I.arrowRight size={20} />} onClick={onSignIn} style={{ marginTop: 8 }}>
            Sign in to start
          </DS.Button>
        </DS.Card>
      </div>
    </div>
  );
}

function CredRow({ icon, label, value, mono }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-strong)', fontFamily: mono ? 'var(--font-mono)' : 'inherit', wordBreak: 'break-all' }}>{value}</div>
      </div>
    </div>
  );
}

/* ============================ SIGN IN (AVD) ============================ */
function SignIn({ device, onDone }) {
  const [pw, setPw] = React.useState('');
  const [err, setErr] = React.useState('');
  const submit = () => {
    if (pw.trim().length < 3) { setErr('Enter the password shown on the lock screen'); return; }
    onDone();
  };
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'var(--surface-page)',
      fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 420, textAlign: 'center' }}>
        <img src={LOGO} alt="APM" style={{ height: 56, margin: '0 auto 28px' }} />
        <DS.Card padding="32px" style={{ textAlign: 'left', boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ fontSize: 22, fontFamily: 'var(--font-display)', margin: '0 0 4px' }}>Sign in</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 22px' }}>Connecting to your Workspace</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <DS.Input label="Username" value={device.user} readOnly />
            <DS.Input label="Password" type="password" placeholder="Enter password from lock screen"
              value={pw} error={err} onChange={(e) => { setPw(e.target.value); setErr(''); }}
              onKeyDown={(e) => e.key === 'Enter' && submit()} />
            <DS.Button fullWidth size="lg" onClick={submit}>Sign in</DS.Button>
          </div>
        </DS.Card>
        <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 18 }}>Azure Virtual Desktop · {device.asset}</p>
      </div>
    </div>
  );
}

window.KioskScreens = { LockScreen, SignIn, ACCENT, ACCENT_SOFT, LOGO };
