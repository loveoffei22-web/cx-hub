// Nav v2 — leaner icon rail, gold accent for active tab, navy ink surface.
// 64px collapsed / 220px expanded. Lucide-style inline SVGs replace heavy emoji.

const Icon = {
  dash:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  daily:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  all:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 8h16"/><path d="M9 12h11"/><path d="M9 16h11"/><path d="M4 12h2"/><path d="M4 16h2"/></svg>,
  log:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  cum:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="20" x2="21" y2="20"/><rect x="5" y="10" width="3" height="10"/><rect x="10.5" y="6" width="3" height="14"/><rect x="16" y="13" width="3" height="7"/></svg>,
  analy:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>,
  reports: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="14 3 14 9 20 9"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="9" y1="18" x2="13" y2="18"/></svg>,
  agents:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  sync:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  settings:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chev:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
};

const NAV_GROUPS = [
  {label:'Operations', items:[
    {id:'dashboard',  icon:Icon.dash,    label:'Dashboard'},
    {id:'daily',      icon:Icon.daily,   label:'Daily Report'},
    {id:'all',        icon:Icon.all,     label:'All Complaints'},
    {id:'log',        icon:Icon.log,     label:'Log Ticket'},
  ]},
  {label:'Insights', items:[
    {id:'cumulative', icon:Icon.cum,     label:'Cumulative'},
    {id:'analytics',  icon:Icon.analy,   label:'Analytics'},
    {id:'reports',    icon:Icon.reports, label:'Reports', badge:'NEW'},
  ]},
  {label:'Team', items:[
    {id:'agents',     icon:Icon.agents,  label:'Agents'},
    {id:'sync',       icon:Icon.sync,    label:'OneDrive Sync'},
  ]},
];

const NavV2 = ({active, onChange, collapsed, onToggle, onSignOut, onSettings, user='Love Offei'}) => {
  const W = collapsed ? 64 : 220;
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const wat = new Date(now.toLocaleString('en-US', {timeZone:'Africa/Lagos'}));
  const watTime = wat.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});

  const initial = user[0];
  const photoSrc = (window.EK_AGENT_PHOTOS||{})[user.toLowerCase().split(' ')[0]];

  return (
    <nav style={{
      position:'fixed',top:0,left:0,bottom:0,width:W,zIndex:100,
      background:'linear-gradient(180deg,rgba(15,30,85,.96) 0%,rgba(5,11,34,.98) 100%)',
      backdropFilter:'blur(14px)',
      borderRight:'1px solid var(--border-soft)',
      display:'flex',flexDirection:'column',
      transition:'width .25s ease',overflow:'hidden',
    }}>
      {/* Top: brand */}
      <div style={{
        padding: collapsed ? '14px 12px' : '14px 16px',
        borderBottom:'1px solid var(--border-soft)',
        display:'flex',alignItems:'center',gap:10,
      }}>
        <div style={{
          width:38,height:38,borderRadius:9,flexShrink:0,
          background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:'0 4px 14px rgba(255,199,44,.22)',
          overflow:'hidden',
        }}>
          <img src="../assets/ekedp-app-icon.png" alt="EKEDP" style={{width:'100%',height:'100%',objectFit:'contain'}}/>
        </div>
        {!collapsed && (
          <div style={{minWidth:0,flex:1}}>
            <div style={{font:'900 12.5px/1 Sora,sans-serif',color:'#fff',letterSpacing:'.3px'}}>
              EKEDP <span style={{color:'var(--ek-gold)'}}>Power App</span>
            </div>
            <div style={{font:'600 9px/1.2 Sora,sans-serif',color:'var(--muted)',letterSpacing:'.14em',textTransform:'uppercase',marginTop:5}}>
              Managers Hub · v2
            </div>
          </div>
        )}
        <button onClick={onToggle} title={collapsed?'Expand':'Collapse'} style={{
          background:'none',border:'none',color:'var(--muted)',cursor:'pointer',
          padding:4,borderRadius:5,
          transform: collapsed ? 'rotate(180deg)' : 'none',
          transition:'transform .25s',
          display: collapsed && false ? 'none' : 'flex',
        }}>{Icon.chev}</button>
      </div>

      {/* User strip */}
      {!collapsed && (
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border-soft)',display:'flex',alignItems:'center',gap:11}}>
          {photoSrc ? (
            <img src={photoSrc} alt={user} style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',boxShadow:'0 0 0 2px var(--ek-gold)'}}/>
          ) : (
            <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(255,199,44,.18)',display:'flex',alignItems:'center',justifyContent:'center',font:'800 14px Sora,sans-serif',color:'var(--ek-gold)',boxShadow:'0 0 0 2px var(--ek-gold)'}}>{initial}</div>
          )}
          <div style={{minWidth:0,flex:1}}>
            <div style={{font:'800 12.5px/1.1 Sora,sans-serif',color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user}</div>
            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
              <span className="live-dot"/>
              <span className="mono" style={{font:'600 10px/1 JetBrains Mono,monospace',color:'var(--muted)'}}>{watTime} WAT</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{flex:1,overflowY:'auto',padding: collapsed ? '8px 8px' : '8px 12px'}}>
        {NAV_GROUPS.map((g,gi) => (
          <div key={g.label} style={{marginBottom: gi<NAV_GROUPS.length-1 ? 14 : 0}}>
            {!collapsed && (
              <div style={{font:'700 8.5px/1 Sora,sans-serif',color:'var(--sub)',textTransform:'uppercase',letterSpacing:'.16em',padding:'10px 8px 7px'}}>{g.label}</div>
            )}
            {collapsed && gi>0 && (
              <div style={{height:1,background:'var(--border-soft)',margin:'8px 6px'}}/>
            )}
            {g.items.map(t => {
              const on = active===t.id;
              return (
                <button key={t.id} onClick={()=>onChange(t.id)} title={t.label} style={{
                  width:'100%',
                  padding: collapsed ? '10px 0' : '9px 11px',
                  border:'none',
                  background: on ? 'linear-gradient(90deg,rgba(255,199,44,.14) 0%,rgba(255,199,44,.02) 100%)' : 'transparent',
                  borderLeft: on ? '2px solid var(--ek-gold)' : '2px solid transparent',
                  borderRadius:'0 8px 8px 0',
                  cursor:'pointer',display:'flex',alignItems:'center',
                  gap: collapsed ? 0 : 12,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: on ? '#fff' : 'var(--text-2)',
                  font:'600 12px/1 Sora,sans-serif',
                  transition:'all .15s',marginBottom:2,
                  position:'relative',
                }}
                onMouseEnter={e => { if(!on) e.currentTarget.style.background='rgba(255,255,255,.04)'; }}
                onMouseLeave={e => { if(!on) e.currentTarget.style.background='transparent'; }}>
                  <span style={{color: on ? 'var(--ek-gold)' : 'var(--muted)',display:'flex'}}>{t.icon}</span>
                  {!collapsed && <span style={{flex:1,textAlign:'left'}}>{t.label}</span>}
                  {!collapsed && t.badge && (
                    <span style={{font:'800 8.5px/1 Sora,sans-serif',padding:'2px 5px',borderRadius:4,background:'var(--ek-gold)',color:'#0A1A4F',letterSpacing:'.06em'}}>{t.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{padding: collapsed ? '10px 8px' : '10px 12px',borderTop:'1px solid var(--border-soft)',display:'flex',flexDirection:'column',gap:4}}>
        <NavFootBtn icon={Icon.settings} label="Settings" collapsed={collapsed} onClick={onSettings}/>
        <NavFootBtn icon={Icon.logout}   label="Sign out" collapsed={collapsed} onClick={onSignOut}/>
      </div>
    </nav>
  );
};

const NavFootBtn = ({icon, label, collapsed, onClick}) => (
  <button onClick={onClick} title={label} style={{
    width:'100%',padding: collapsed ? '8px 0' : '8px 11px',
    background:'transparent',border:'1px solid transparent',borderRadius:8,
    color:'var(--muted)',font:'600 11px Sora,sans-serif',
    display:'flex',alignItems:'center',gap: collapsed ? 0 : 11,
    justifyContent: collapsed ? 'center' : 'flex-start',
    cursor:'pointer',transition:'all .15s',
  }}
  onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.05)';e.currentTarget.style.color='#fff';}}
  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--muted)';}}>
    <span style={{display:'flex'}}>{icon}</span>
    {!collapsed && <span>{label}</span>}
  </button>
);

Object.assign(window, {NavV2, Icon});
