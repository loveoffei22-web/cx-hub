const App = () => {
  const [signedIn, setSignedIn] = React.useState(false);
  const [active, setActive] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(false);
  const [settings, setSettings] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  React.useEffect(()=>{ const s=localStorage.getItem('ek_signed_in'); if(s==='1') setSignedIn(true); },[]);

  if (!signedIn) return <Signin onSubmit={()=>{ setSignedIn(true); localStorage.setItem('ek_signed_in','1'); showToast('Welcome back, Love. ⚡'); }}/>;

  const W = collapsed ? 64 : 220;

  const screen = {
    dashboard:  <Dashboard user="Love" onSettings={()=>setSettings(true)} onNav={setActive}/>,
    daily:      <DailyReport day={15} onPickDay={()=>{}}/>,
    all:        <AllComplaints/>,
    cumulative: <Cumulative/>,
    analytics:  <Analytics/>,
    reports:    <ReportsScreen/>,
    log:        <div style={{padding:40,color:'var(--muted)',font:'500 13px Sora,sans-serif'}}>Log Ticket — coming soon</div>,
    agents:     <div style={{padding:40,color:'var(--muted)',font:'500 13px Sora,sans-serif'}}>Agents screen — switch to Agents Hub for full view</div>,
    sync:       <div style={{padding:40,color:'var(--muted)',font:'500 13px Sora,sans-serif'}}>OneDrive Sync — coming soon</div>,
  }[active] || null;

  return (
    <div>
      <NavV2
        active={active} onChange={setActive}
        collapsed={collapsed} onToggle={()=>setCollapsed(c=>!c)}
        onSettings={()=>setSettings(true)}
        onSignOut={()=>{ setSignedIn(false); localStorage.removeItem('ek_signed_in'); setActive('dashboard'); }}
        user="Love Offei"
      />
      <main style={{paddingLeft:W,transition:'padding-left .25s ease',minHeight:'100vh'}}>
        {screen}
      </main>
      {toast && (
        <div className={`toast${toast.type==='error'?' err':''}`}>
          <span>{toast.type==='error'?'✕':'⚡'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
