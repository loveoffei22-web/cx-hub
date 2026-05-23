// Agents Hub — Shell (sidebar + topbar + screen routing).
// Tinted with the active agent's colour. Supports Midnight/Daylight/Solar/Green themes.

const AGENT_TABS = [
  {id:'dashboard', icon:'🏠', label:'Dashboard'},
  {id:'tickets',   icon:'📋', label:'My Tickets'},
  {id:'add',       icon:'➕', label:'Add Ticket'},
  {id:'slot',      icon:'🌤️', label:'Slot Updates'},
  {id:'inbox',     icon:'📥', label:'Inbox'},
  {id:'export',    icon:'📤', label:'Export Day'},
  {id:'sync',      icon:'☁️', label:'Sync'},
];

const THEME_LIST = [
  {id:'',         emoji:'🌙', label:'Midnight'},
  {id:'daylight', emoji:'⬜', label:'White'},
  {id:'solar',    emoji:'🌅', label:'Solar'},
  {id:'green',    emoji:'🌿', label:'Green'},
];

const Shell = ({agent, active, onChange, onSignOut, onImport, alertCount, children}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [theme, setTheme] = React.useState(() => localStorage.getItem('ag_theme') || '');
  const W = collapsed ? 60 : 200;

  // Apply theme to body
  React.useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('ag_theme', theme);
  }, [theme]);

  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const wat     = new Date(now.toLocaleString('en-US', {timeZone:'Africa/Lagos'}));
  const watTime = wat.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
  const watHour = wat.getHours();
  const greet   = watHour < 12 ? 'Good morning' : watHour < 17 ? 'Good afternoon' : 'Good evening';
  const greetE  = watHour < 12 ? '☀️' : watHour < 17 ? '🌤️' : '🌙';

  const isLight = theme === 'daylight';
  const photos  = window.EK_AGENT_PHOTOS || {};

  // CSS-var shortcuts
  const navBg    = 'var(--ah-nav)';
  const border   = `1px solid var(--ah-border)`;
  const textCol  = 'var(--ah-text)';
  const mutedCol = 'var(--ah-muted)';

  return (
    <div style={{minHeight:'100vh', background:'var(--ah-bg)', color:textCol, fontFamily:'Sora,sans-serif'}}>

      {/* ── SIDEBAR ── */}
      <nav style={{
        position:'fixed', top:0, left:0, bottom:0, width:W, zIndex:100,
        background: navBg, backdropFilter:'blur(12px)',
        borderRight: '1px solid ' + agent.color + '33',
        display:'flex', flexDirection:'column',
        padding: collapsed ? '12px 6px' : '12px 10px',
        transition:'width .25s ease, padding .25s ease', overflow:'hidden',
      }}>

        {/* Logo / collapse toggle */}
        <div onClick={()=>setCollapsed(c=>!c)} style={{
          display:'flex', alignItems:'center', gap:9, marginBottom:12,
          padding:'4px 4px 12px', borderBottom: border, cursor:'pointer',
        }}>
          <div style={{width:34, height:34, borderRadius:8, overflow:'hidden', flexShrink:0}}>
            <img src="../../assets/ekedp-app-icon.png" alt="EKEDP" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          </div>
          {!collapsed && (
            <div>
              <div style={{font:'800 11px/1.1 Sora,sans-serif', color:textCol, letterSpacing:'.2px'}}>EKEDP POWER APP</div>
              <div style={{font:'500 9px/1.2 Sora,sans-serif', color:mutedCol}}>Agents Hub</div>
            </div>
          )}
        </div>

        {/* Agent identity */}
        {!collapsed && (
          <div style={{padding:'10px 8px 12px', marginBottom:8, borderBottom:border, display:'flex', alignItems:'center', gap:10}}>
            {photos[agent.id] ? (
              <img src={photos[agent.id]} alt={agent.name} style={{
                width:36, height:36, borderRadius:'50%', objectFit:'cover',
                border:'2px solid ' + agent.color, flexShrink:0,
                boxShadow:'0 2px 8px ' + agent.color + '55',
              }}/>
            ) : (
              <div style={{
                width:36, height:36, borderRadius:'50%',
                background: agent.tint, border:'2px solid ' + agent.color,
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0, fontSize:18,
              }}>{agent.emoji}</div>
            )}
            <div style={{minWidth:0}}>
              <div style={{font:'italic 500 9.5px/1 Sora,sans-serif', color:mutedCol}}>{greet} {greetE}</div>
              <div style={{font:'800 13px/1.1 Sora,sans-serif', color:textCol, marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{agent.name.split(' ')[0]}</div>
            </div>
          </div>
        )}

        {/* Nav tabs */}
        <div style={{display:'flex', flexDirection:'column', gap:2, flex:1, overflowY:'auto'}}>
          {AGENT_TABS.map(t => {
            const on = t.id === active;
            return (
              <button key={t.id} onClick={()=>onChange(t.id)} style={{
                padding: collapsed ? '9px 0' : '9px 10px', border:'none',
                background: on ? agent.tint : 'transparent',
                cursor:'pointer', fontFamily:'Sora,sans-serif', fontSize:12, fontWeight:600,
                color: on ? '#fff' : mutedCol,
                borderLeft: on ? '2px solid ' + agent.color : '2px solid transparent',
                borderRadius:'0 7px 7px 0',
                display:'flex', alignItems:'center', gap:10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                textAlign:'left', whiteSpace:'nowrap', transition:'all .15s',
                position:'relative',
              }}>
                <span style={{fontSize:15, width:18, textAlign:'center', flexShrink:0}}>{t.icon}</span>
                {!collapsed && <span>{t.label}</span>}
                {t.id==='tickets' && alertCount>0 && (
                  <span style={{
                    position:'absolute', top:4, right: collapsed?2:6,
                    background:'#EF4444', color:'#fff', borderRadius:'50%',
                    width:16, height:16, fontSize:10, fontWeight:800,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    lineHeight:1, animation:'pulse 1s infinite',
                  }}>{alertCount>9?'9+':alertCount}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{display:'flex', flexDirection:'column', gap:5, paddingTop:10, borderTop:border}}>

          {/* Theme switcher */}
          {!collapsed && (
            <div style={{display:'flex', gap:4, marginBottom:2}}>
              {THEME_LIST.map(th => (
                <button key={th.id} onClick={()=>setTheme(th.id)} title={th.label} style={{
                  flex:1, padding:'5px 0', borderRadius:6, border:'none',
                  background: theme===th.id ? agent.tint : 'rgba(255,255,255,.06)',
                  cursor:'pointer', fontSize:13,
                  boxShadow: theme===th.id ? '0 0 0 1.5px ' + agent.color : 'none',
                  transition:'all .15s',
                }}>{th.emoji}</button>
              ))}
            </div>
          )}

          {/* Import JSON */}
          <input type="file" id="agentImportFile" accept=".json" style={{display:'none'}} onChange={e=>{ if(e.target.files[0] && onImport){ onImport(e.target.files[0]); } e.target.value=''; }}/>
          <button onClick={()=>document.getElementById('agentImportFile').click()} title="Import snapshot" style={{
            padding:'8px 10px', borderRadius:7,
            border:'1px solid rgba(59,130,246,.3)',
            background:'rgba(59,130,246,.12)', color:'#93C5FD',
            fontFamily:'Sora,sans-serif', fontSize:11, fontWeight:700,
            cursor:'pointer', display:'flex', alignItems:'center', gap:9,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <span style={{fontSize:13, width:18, textAlign:'center', flexShrink:0}}>📂</span>
            {!collapsed && <span>Import JSON</span>}
          </button>

          {/* Sign out */}
          <button onClick={onSignOut} title="Sign out" style={{
            padding:'8px 10px', borderRadius:7,
            border:'1px solid rgba(220,38,38,.3)',
            background:'rgba(220,38,38,.15)', color:'#F87171',
            fontFamily:'Sora,sans-serif', fontSize:11, fontWeight:700,
            cursor:'pointer', display:'flex', alignItems:'center', gap:9,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <span style={{fontSize:13, width:18, textAlign:'center', flexShrink:0}}>👤</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={{paddingLeft: W, transition:'padding-left .25s ease', minHeight:'100vh'}}>
        {/* Topbar */}
        <div style={{
          background: isLight
            ? 'linear-gradient(135deg,' + agent.color + '18,transparent 35%), #fff'
            : 'linear-gradient(135deg,' + agent.color + '11,transparent 30%), var(--ah-surface)',
          borderBottom:'3px solid ' + agent.color,
          padding:'14px 28px', position:'sticky', top:0, zIndex:10,
          display:'flex', justifyContent:'space-between', alignItems:'center',
          boxShadow: isLight ? '0 2px 12px rgba(0,0,0,.07)' : 'none',
        }}>
          <div>
            <div style={{font:'800 10px/1 Sora,sans-serif', color:agent.color, letterSpacing:'.10em', textTransform:'uppercase'}}>
              {AGENT_TABS.find(t=>t.id===active)?.label || 'Agents Hub'}
            </div>
            <div style={{font:'italic 800 18px/1.2 Sora,sans-serif', color:textCol, marginTop:4}}>
              {greet}, {agent.name.split(' ')[0]} {greetE}
            </div>
          </div>
          <div style={{
            fontFamily:'JetBrains Mono,monospace', fontSize:13, fontWeight:700,
            color: isLight ? '#475569' : 'rgba(255,255,255,.55)',
            background: isLight ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.07)',
            border: isLight ? '1px solid rgba(0,0,0,.08)' : '1px solid rgba(255,255,255,.12)',
            borderRadius:8, padding:'7px 14px', letterSpacing:'.04em',
          }}>
            {watTime} <span style={{color: isLight ? '#94A3B8' : 'rgba(255,255,255,.3)'}}>WAT</span>
          </div>
        </div>
        <div>{children}</div>
      </main>
    </div>
  );
};

Object.assign(window, {Shell, AGENT_TABS});
