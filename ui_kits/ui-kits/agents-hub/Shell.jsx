// Agents Hub — Shell (sidebar + topbar + screen routing).
// Uses CSS variables throughout so the 5 themes actually work.

const AGENT_TABS = [
  {id:'tickets', icon:'📋', label:'My Tickets'},
  {id:'add',     icon:'➕', label:'Add Ticket'},
  {id:'slot',    icon:'🌤️', label:'Slot Updates'},
  {id:'inbox',   icon:'📥', label:'Inbox'},
  {id:'export',  icon:'📤', label:'Export Day'},
];

const AGENT_THEMES = [
  {id:'daylight', emoji:'☀️', label:'Daylight',  sw:'linear-gradient(135deg,#DBEAFE,#BFDBFE,#E0E7FF)', light:true},
  {id:'midnight', emoji:'🌙', label:'Midnight',  sw:'linear-gradient(135deg,#001040,#001F5C,#0a0020)'},
  {id:'solar',    emoji:'🌅', label:'Solar',     sw:'linear-gradient(135deg,#52391B,#92400E,#F59E0B)'},
  {id:'green',    emoji:'🌿', label:'Forest',    sw:'linear-gradient(135deg,#071A10,#14532D,#052e16)'},
  {id:'violet',   emoji:'🔮', label:'Violet',    sw:'linear-gradient(135deg,#0C0118,#1B0444,#2E0B72)'},
];

const Shell = ({agent, active, onChange, onSignOut, theme, onTheme, children}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const W = collapsed ? 60 : 200;

  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const wat     = new Date(now.toLocaleString('en-US', {timeZone:'Africa/Lagos'}));
  const watTime = wat.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
  const watDate = wat.toLocaleDateString('en-GB', {day:'numeric', month:'short'});
  const watHour = wat.getHours();
  const greet   = watHour < 12 ? 'Good morning' : watHour < 17 ? 'Good afternoon' : 'Good evening';
  const greetE  = watHour < 12 ? '☀️' : watHour < 17 ? '🌤️' : '🌙';

  const photos = window.EK_AGENT_PHOTOS || {};

  return (
    <div style={{
      minHeight:'100vh',
      background:'var(--bg, #060E2B)',
      color:'var(--text, #F0F4FF)',
      fontFamily:'Sora,sans-serif',
      transition:'background .35s, color .35s',
    }}>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <nav style={{
        position:'fixed', top:0, left:0, bottom:0, width:W, zIndex:100,
        background:'var(--surface, rgba(6,14,43,.97))',
        backdropFilter:'blur(12px)',
        borderRight:'1px solid ' + agent.color + '33',
        display:'flex', flexDirection:'column',
        padding: collapsed ? '12px 6px' : '12px 10px',
        transition:'width .25s ease, padding .25s ease',
        overflow:'hidden',
      }}>

        {/* Logo row — click to collapse */}
        <div onClick={() => setCollapsed(c => !c)} style={{
          display:'flex', alignItems:'center', gap:9, marginBottom:12,
          padding:'4px 4px 12px',
          borderBottom:'1px solid var(--border, #1E3070)',
          cursor:'pointer',
        }}>
          <div style={{
            width:34, height:34, borderRadius:8, overflow:'hidden',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <img src="../../assets/ekedp-app-icon.png" alt="EKEDP"
              style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          </div>
          {!collapsed && (
            <div>
              <div style={{font:'800 11px/1.1 Sora,sans-serif', color:'var(--text, #fff)', letterSpacing:'.2px'}}>EKEDP POWER APP</div>
              <div style={{font:'500 9px/1.2 Sora,sans-serif', color:'var(--muted, #6B85C0)'}}>Agents Hub</div>
            </div>
          )}
        </div>

        {/* Agent info */}
        {!collapsed && (
          <div style={{
            padding:'10px 8px 12px', marginBottom:8,
            borderBottom:'1px solid var(--border, #1E3070)',
            display:'flex', alignItems:'center', gap:10,
          }}>
            {photos[agent.id] ? (
              <img src={photos[agent.id]} alt={agent.name} style={{
                width:36, height:36, borderRadius:'50%', objectFit:'cover',
                border:'2px solid ' + agent.color, flexShrink:0,
                boxShadow:'0 2px 8px ' + agent.color + '55',
              }}/>
            ) : (
              <div style={{
                width:36, height:36, borderRadius:'50%',
                background:agent.tint, border:'2px solid ' + agent.color,
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0, fontSize:18,
              }}>{agent.emoji}</div>
            )}
            <div style={{minWidth:0}}>
              <div style={{font:'italic 500 9.5px/1 Sora,sans-serif', color:'var(--muted, #6B85C0)'}}>{greet} {greetE}</div>
              <div style={{font:'800 13px/1.1 Sora,sans-serif', color:'var(--text, #fff)', marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                {agent.name.split(' ')[0]}
              </div>
            </div>
          </div>
        )}

        {/* Nav tabs */}
        <div style={{display:'flex', flexDirection:'column', gap:2, flex:1, overflowY:'auto'}}>
          {AGENT_TABS.map(t => {
            const on = t.id === active;
            return (
              <button key={t.id} onClick={() => onChange(t.id)} style={{
                padding: collapsed ? '9px 0' : '9px 10px',
                border:'none',
                background: on ? agent.tint : 'transparent',
                cursor:'pointer', fontFamily:'Sora,sans-serif', fontSize:12, fontWeight:600,
                color: on ? '#fff' : 'var(--muted, #6B85C0)',
                borderLeft: on ? '2px solid ' + agent.color : '2px solid transparent',
                borderRadius:'0 7px 7px 0',
                display:'flex', alignItems:'center', gap:10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                textAlign:'left', whiteSpace:'nowrap',
                transition:'all .15s',
              }}>
                <span style={{fontSize:15, width:18, textAlign:'center', flexShrink:0}}>{t.icon}</span>
                {!collapsed && <span>{t.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Bottom: theme picker + clock + sign-out */}
        <div style={{display:'flex', flexDirection:'column', gap:5, paddingTop:10, borderTop:'1px solid var(--border, #1E3070)'}}>

          {!collapsed && (
            <div style={{display:'flex', gap:4, marginBottom:4, justifyContent:'center'}}>
              {AGENT_THEMES.map(t => (
                <button key={t.id} onClick={() => onTheme(t.id)} title={t.emoji + ' ' + t.label} style={{
                  width:22, height:22, borderRadius:6,
                  border: theme === t.id
                    ? '2px solid #FFC72C'
                    : t.light
                      ? '2px solid #94A3B8'   /* visible edge for the pale daylight swatch */
                      : '2px solid transparent',
                  background: t.sw,
                  cursor:'pointer', padding:0, flexShrink:0,
                  boxShadow: theme === t.id ? '0 0 8px rgba(255,199,44,.7)' : 'none',
                  transition:'all .15s',
                }}/>
              ))}
            </div>
          )}

          {!collapsed && (
            <div style={{
              fontFamily:'JetBrains Mono,monospace', fontSize:10,
              color:'var(--muted, #6B85C0)',
              padding:'0 6px', marginBottom:4, textAlign:'center',
            }}>
              {watTime} WAT · {watDate}
            </div>
          )}

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

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main style={{paddingLeft:W, transition:'padding-left .25s ease', minHeight:'100vh'}}>

        {/* Topbar */}
        <div style={{
          background:'linear-gradient(135deg, ' + agent.color + '18, transparent 35%), var(--surface, #0D1B45)',
          borderBottom:'3px solid ' + agent.color,
          padding:'18px 28px',
          position:'sticky', top:0, zIndex:10,
          transition:'background .35s',
        }}>
          <div style={{font:'800 10px/1 Sora,sans-serif', color:agent.color, letterSpacing:'.10em', textTransform:'uppercase'}}>
            {AGENT_TABS.find(t => t.id === active)?.label || 'Agents Hub'}
          </div>
          <div style={{font:'italic 800 18px/1.2 Sora,sans-serif', color:'var(--text, #fff)', marginTop:4}}>
            {greet}, {agent.name.split(' ')[0]} {greetE}
          </div>
        </div>

        {children}
      </main>
    </div>
  );
};

Object.assign(window, {Shell, AGENT_TABS});
