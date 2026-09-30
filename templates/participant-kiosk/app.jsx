const DEVICE = { user: 'kiosk-CU9G7H2@apm.net.au', pass: 'Brave-Tide-7194', asset: 'KI-APM-042' };
const { LockScreen, SignIn } = window.KioskScreens;
const KioskHome = window.KioskHome, SessionEnded = window.SessionEnded;

function App() {
  const [screen, setScreen] = React.useState('lock'); // lock | signin | home | ended
  const [secs, setSecs] = React.useState(600);

  React.useEffect(() => {
    if (screen !== 'home') return;
    setSecs(600);
    const t = setInterval(() => setSecs((s) => {
      if (s <= 1) { clearInterval(t); setScreen('ended'); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [screen]);

  return (
    <React.Fragment>
      {screen === 'lock' && <LockScreen device={DEVICE} onSignIn={() => setScreen('signin')} />}
      {screen === 'signin' && <SignIn device={DEVICE} onDone={() => setScreen('home')} />}
      {screen === 'home' && <KioskHome device={DEVICE} secondsLeft={secs} onEnd={() => setScreen('ended')} />}
      {screen === 'ended' && <SessionEnded onReset={() => setScreen('lock')} />}
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// Scale the fixed 1440×900 kiosk canvas to fit any viewport
function fit() {
  const c = document.getElementById('canvas');
  const s = Math.min(window.innerWidth / 1440, window.innerHeight / 900);
  c.style.transform = `scale(${s})`;
}
window.addEventListener('resize', fit); fit();
