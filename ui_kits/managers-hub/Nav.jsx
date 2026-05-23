// Left retractable sidebar — exact rules from the Managers Hub:
//   188px expanded, 56px collapsed, click logo to toggle.
//   Active tab has 2px red left-border + rgba(227,6,19,.10) bg.

const NAV_TABS = [
  {id:'dashboard',  icon:'🏠', label:'Dashboard'},
  {id:'daily',      icon:'📋', label:'Daily Report'},
  {id:'all',        icon:'📨', label:'All Complaints'},
  {id:'log',        icon:'➕', label:'Log Ticket'},
  {id:'cumulative', icon:'📊', label:'Cumulative'},
  {id:'analytics',  icon:'📈', label:'Analytics'},
  {id:'agents',     icon:'👥', label:'Agents'},
  {id:'reports',    icon:'📤', label:'Reports'},
  {id:'sync',       icon:'☁️', label:'OneDrive Sync'},
];

const Nav = ({active, onChange, collapsed, onToggle, onSettings, onSignOut, user='Love Offei'}) => {
  const W = collapsed ? 56 : 188;
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const wat = new Date(now.toLocaleString('en-US', {timeZone:'Africa/Lagos'}));
  const watTime = wat.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
  const watDate = wat.toLocaleDateString('en-GB', {day:'numeric', month:'short'});
  const watHour = wat.getHours();
  const greetWord = watHour < 12 ? 'Good morning' : watHour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEmoji = watHour < 12 ? '☀️' : watHour < 17 ? '🌤️' : '🌙';
  return (
    <nav id="ek-nav" style={{
      position:'fixed', top:0, left:0, bottom:0, width:W, zIndex:100,
      background:'rgba(6,14,43,.97)', backdropFilter:'blur(12px)',
      borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column',
      padding: collapsed ? '12px 6px' : '12px 10px',
      transition:'width .25s ease, padding .25s ease', overflow:'hidden',
    }}>
      <div onClick={onToggle} style={{
        display:'flex', alignItems:'center', gap:9, marginBottom:14,
        padding:'4px 4px 12px', borderBottom:'1px solid #1E3070',
        cursor:'pointer', userSelect:'none',
      }}>
        <div style={{
          width:34, height:34, borderRadius:8, overflow:'hidden',
          display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0,
        }}>
          <img src="../../assets/ekedp-app-icon.png" alt="EKEDP" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
        </div>
        {!collapsed && (
          <div>
            <div style={{font:'800 12px/1.1 Sora,sans-serif', color:'#fff', letterSpacing:'.2px'}}>EKEDP POWER APP</div>
            <div style={{font:'500 9px/1.2 Sora,sans-serif', color:'#6B85C0'}}>Managers Hub</div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div style={{padding:'10px 6px 12px', marginBottom:8, borderBottom:'1px solid #1E3070'}}>
          <div style={{display:'flex', alignItems:'center', gap:9}}>
            {window.EK_TEAM_PHOTOS && window.EK_TEAM_PHOTOS['love'] ? (
              <img src={window.EK_TEAM_PHOTOS['love']} alt="Love"
                style={{width:36, height:36, borderRadius:'50%', objectFit:'cover',
                  border:'2px solid #E30613', flexShrink:0}} />
            ) : (
              <div style={{width:36, height:36, borderRadius:'50%', background:'rgba(227,6,19,.2)',
                border:'2px solid #E30613', display:'flex', alignItems:'center', justifyContent:'center',
                font:'800 14px Sora,sans-serif', color:'#E30613', flexShrink:0}}>L</div>
            )}
            <div style={{minWidth:0}}>
              <div style={{font:'italic 500 10px/1 Sora,sans-serif', color:'#6B85C0', letterSpacing:'.2px'}}>{greetWord} {greetEmoji}</div>
              <div style={{font:'800 13px/1.2 Sora,sans-serif', color:'#fff', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{user}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex', flexDirection:'column', gap:2, flex:1, overflowY:'auto'}}>
        {NAV_TABS.map(t => {
          const on = t.id === active;
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
              className={`nav-tab-item${on?' on':''}`}
              style={{
              padding: collapsed ? '9px 0' : '9px 10px',
              border:'none', background: on ? 'rgba(227,6,19,.10)' : 'transparent',
              cursor:'pointer', fontFamily:'Sora,sans-serif', fontSize:12, fontWeight:600,
              color: on ? '#fff' : 'var(--muted)',
              borderLeft: on ? '2px solid var(--accent,#E30613)' : '2px solid transparent',
              borderRadius:'0 7px 7px 0',
              display:'flex', alignItems:'center', gap:10, justifyContent: collapsed?'center':'flex-start',
              textAlign:'left', whiteSpace:'nowrap',
              transition:'all .15s',
            }}>
              <span style={{fontSize:15, width:18, textAlign:'center', flexShrink:0}}>{t.icon}</span>
              {!collapsed && <span>{t.label}</span>}
            </button>
          );
        })}
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:5, paddingTop:10, borderTop:'1px solid #1E3070'}}>
        <NavBtn icon="⟳" label="Sync"      collapsed={collapsed}/>
        <NavBtn icon="⬇" label="Export"    collapsed={collapsed} primary/>
        <NavBtn icon="👤" label="Sign out" collapsed={collapsed} onClick={onSignOut}/>
      </div>
    </nav>
  );
};

const NavBtn = ({icon, label, collapsed, primary, onClick}) => (
  <button onClick={onClick} title={label} style={{
    padding:'8px 10px', borderRadius:7,
    border: primary ? '1px solid #E30613' : '1px solid #1E3070',
    background: primary ? '#E30613' : 'rgba(255,255,255,.06)',
    color:'#fff', fontFamily:'Sora,sans-serif', fontSize:11, fontWeight:600,
    cursor:'pointer', display:'flex', alignItems:'center', gap:9,
    whiteSpace:'nowrap', textAlign:'left',
    justifyContent: collapsed ? 'center' : 'flex-start',
  }}>
    <span style={{fontSize:13, width:18, textAlign:'center', flexShrink:0}}>{icon}</span>
    {!collapsed && <span>{label}</span>}
  </button>
);

Object.assign(window, {Nav, NAV_TABS});
