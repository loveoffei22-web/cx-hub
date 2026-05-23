// App orchestrator — sign-in → main shell with nav + active screen.
// Theme switching: just sets body[data-theme] and CSS vars do all the work.

const THEMES = [
  {id:'midnight',label:'Midnight',emoji:'🌙',sw:'linear-gradient(135deg,#001040,#001F5C,#0a0020)'},
  {id:'daylight', label:'Daylight',emoji:'☀️',sw:'linear-gradient(135deg,#DBEAFE,#BFDBFE,#E0E7FF)'},
  {id:'solar',    label:'Solar',   emoji:'🌅',sw:'linear-gradient(135deg,#52391B,#92400E,#F59E0B)'},
  {id:'green',    label:'Green',   emoji:'🌿',sw:'linear-gradient(135deg,#071A10,#14532D,#052e16)'},
  {id:'violet',   label:'Violet',  emoji:'🔮',sw:'linear-gradient(135deg,#0C0118,#1B0444,#2E0B72)'},
];

const resolveAutoTheme = () => {
  const h = new Date(new Date().toLocaleString('en-US',{timeZone:'Africa/Lagos'})).getHours();
  if (h >= 6 && h < 12) return 'daylight';
  if (h >= 12 && h < 17) return 'solar';
  return 'violet';
};

const App = () => {
  const [signedIn, setSignedIn] = React.useState(false);
  const [active, setActive]     = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(false);
  const [settings, setSettings] = React.useState(false);
  const [theme, setTheme]       = React.useState(() => localStorage.getItem('ekedp_theme') || 'midnight');
  const [toast, setToast]       = React.useState(null);

  // Set body[data-theme] — pure CSS cascade handles everything.
  React.useEffect(() => {
    document.body.dataset.theme = theme === 'midnight' ? '' : theme;
    if (theme !== 'midnight') document.body.dataset.theme = theme;
    else delete document.body.dataset.theme;
    localStorage.setItem('ekedp_theme', theme);
  }, [theme]);

  const switchTheme = (t) => {
    const next = t === 'auto' ? resolveAutoTheme() : t;
    setTheme(next);
    localStorage.setItem('ekedp_shared_theme', next); // broadcast to Agents Hub
    showToast(`Theme → ${next}`);
  };

  const showToast = (msg, type='success') => {
    setToast({msg, type});
    setTimeout(()=>setToast(null), 3000);
  };

  if (!signedIn) {
    return <Signin onSubmit={() => { setSignedIn(true); showToast('Welcome back, Love.'); }}/>;
  }

  const screen = {
    dashboard:  <Dashboard user="Love" onSettings={()=>setSettings(true)}/>,
    daily:      <DailyReport/>,
    all:        <AllComplaints/>,
    log:        <LogTicket/>,
    cumulative: <Cumulative/>,
    analytics:  <Analytics/>,
    agents:     <AgentsScreen/>,
    reports:    <ReportsScreen/>,
    sync:       <SyncScreen/>,
  }[active];

  return (
    <div className="ek-screen">
      <Nav
        active={active} onChange={setActive}
        collapsed={collapsed} onToggle={()=>setCollapsed(c=>!c)}
        onSettings={()=>setSettings(true)}
        onSignOut={()=>{setSignedIn(false); setActive('dashboard');}}
        user="Love Offei"
      />
      <main style={{paddingLeft: collapsed ? 56 : 188, transition:'padding-left .25s ease', minHeight:'100vh'}}>
        {screen}
      </main>
      <SettingsModal
        open={settings} onClose={()=>setSettings(false)}
        theme={theme} onTheme={switchTheme}
        themes={THEMES}
        onSignOut={()=>{setSignedIn(false); setActive('dashboard');}}
      />
      {toast && (
        <div style={{
          position:'fixed', bottom:20, right:20, zIndex:9999,
          background: toast.type==='error' ? 'rgba(220,38,38,.9)' : 'rgba(22,163,74,.9)',
          borderRadius:10, padding:'11px 18px',
          font:'700 12px Sora,sans-serif', color:'#fff',
          boxShadow:'0 8px 32px rgba(0,0,0,.4)', maxWidth:300,
          animation:'slideUp .25s ease',
        }}>{toast.type==='error'?'✕':'✔'} {toast.msg}</div>
      )}
      <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
