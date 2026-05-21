// Agents Hub — Shell (sidebar + topbar + screen routing).
// v2: theme-aware via ThemeCtx, new nav tabs, theme switcher

const AGENT_TABS = [
  {id:'tickets', icon:'📋', label:'My Tickets'},
  {id:'all',     icon:'📨', label:'All Complaints'},
  {id:'add',     icon:'➕', label:'Add Ticket'},
  {id:'slot',    icon:'🌤️', label:'Slot Updates'},
  {id:'import',  icon:'📂', label:'Import JSON'},
  {id:'export',  icon:'📤', label:'Export Day'},
];

const THEME_BTNS = [
  {id:'midnight', icon:'🌙'},
  {id:'daylight', icon:'☀️'},
  {id:'solar',    icon:'🌅'},
  {id:'auto',     icon:'⏰'},
];

const Shell = ({agent, active, onChange, onSignOut, themeName, onTheme, children}) => {
  const th = React.useContext(window.ThemeCtx);

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

  const photos  = window.EK_AGENT_PHOTOS || {};

  // Topbar gradient adapts to dark vs light theme
  const topbarBg = th.dark
    ? `linear-gradient(135deg, ${agent.color}11, transparent 30%), ${th.surface}`
    : `linear-gradient(135deg, ${agent.color}22, ${th.bg} 80%)`;

  return (
    <div style={{
      minHeight: '100vh',
      background: th.bg,
      color: th.text,
      fontFamily: 'Sora,sans-serif',
      transition: 'background .3s, color .3s',
    }}>
      {/* ── SIDEBAR ───────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: W, zIndex: 100,
        background: th.dark
          ? `rgba(6,14,43,.97)`
          : `rgba(255,255,255,.97)`,
        backdropFilter: 'blur(12px)',
        borderRight: `1px solid ${agent.color}33`,
        display: 'flex', flexDirection: 'column',
        padding: collapsed ? '12px 6px' : '12px 10px',
        transition: 'width .25s ease, padding .25s ease, background .3s',
        overflow: 'hidden',
      }}>
        {/* Logo row (click to collapse) */}
        <div onClick={() => setCollapsed(c => !c)} style={{
          display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12,
          padding: '4px 4px 12px',
          borderBottom: `1px solid ${th.border}`,
          cursor: 'pointer',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <img src="../../assets/ekedp-app-icon.png" alt="EKEDP"
              style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
          </div>
          {!collapsed && (
            <div>
              <div style={{font: '800 11px/1.1 Sora,sans-serif', color: th.text, letterSpacing: '.2px'}}>
                EKEDP POWER APP
              </div>
              <div style={{font: '500 9px/1.2 Sora,sans-serif', color: th.muted}}>
                Agents Hub
              </div>
            </div>
          )}
        </div>

        {/* Agent identity */}
        {!collapsed && (
          <div style={{
            padding: '10px 8px 12px', marginBottom: 8,
            borderBottom: `1px solid ${th.border}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {photos[agent.id] ? (
              <img src={photos[agent.id]} alt={agent.name} style={{
                width: 36, height: 36, borderRadius: '50%', objectFit: 'cover',
                border: `2px solid ${agent.color}`, flexShrink: 0,
                boxShadow: `0 2px 8px ${agent.color}55`,
              }}/>
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: agent.tint, border: `2px solid ${agent.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 18,
              }}>{agent.emoji}</div>
            )}
            <div style={{minWidth: 0}}>
              <div style={{font: 'italic 500 9.5px/1 Sora,sans-serif', color: th.muted}}>
                {greet} {greetE}
              </div>
              <div style={{
                font: '800 13px/1.1 Sora,sans-serif', color: th.text, marginTop: 3,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {agent.name.split(' ')[0]}
              </div>
            </div>
          </div>
        )}

        {/* Nav tabs */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto'}}>
          {AGENT_TABS.map(t => {
            const on = t.id === active;
            return (
              <button key={t.id} onClick={() => onChange(t.id)} style={{
                padding: collapsed ? '9px 0' : '9px 10px',
                border: 'none',
                background: on ? agent.tint : 'transparent',
                cursor: 'pointer',
                fontFamily: 'Sora,sans-serif', fontSize: 12, fontWeight: 600,
                color: on ? th.text : th.muted,
                borderLeft: on ? `2px solid ${agent.color}` : '2px solid transparent',
                borderRadius: '0 7px 7px 0',
                display: 'flex', alignItems: 'center', gap: 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                textAlign: 'left', whiteSpace: 'nowrap',
                transition: 'background .15s, color .15s',
              }}>
                <span style={{fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0}}>{t.icon}</span>
                {!collapsed && <span>{t.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Bottom: theme picker + clock + sign out */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 5,
          paddingTop: 10, borderTop: `1px solid ${th.border}`,
        }}>
          {/* Theme switcher */}
          {!collapsed && (
            <div style={{marginBottom: 4}}>
              <div style={{
                font: '700 8px/1 Sora,sans-serif', color: th.muted,
                letterSpacing: '.10em', textTransform: 'uppercase',
                marginBottom: 5, padding: '0 4px',
              }}>Theme</div>
              <div style={{display: 'flex', gap: 4}}>
                {THEME_BTNS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onTheme(t.id)}
                    title={t.id.charAt(0).toUpperCase() + t.id.slice(1)}
                    style={{
                      flex: 1, padding: '5px 0',
                      background: themeName === t.id ? agent.tint : 'transparent',
                      border: themeName === t.id ? `1px solid ${agent.color}` : `1px solid ${th.border}`,
                      borderRadius: 6, cursor: 'pointer', fontSize: 13,
                      transition: 'all .15s',
                    }}
                  >{t.icon}</button>
                ))}
              </div>
            </div>
          )}

          {!collapsed && (
            <div style={{
              fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: th.muted,
              padding: '0 6px', marginBottom: 4, textAlign: 'center',
            }}>
              {watTime} WAT · {watDate}
            </div>
          )}

          <button onClick={onSignOut} title="Sign out" style={{
            padding: '8px 10px', borderRadius: 7,
            border: 'none',
            background: 'rgba(220,38,38,.12)',
            color: '#F87171',
            fontFamily: 'Sora,sans-serif', fontSize: 11, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <span style={{fontSize: 13, width: 18, textAlign: 'center', flexShrink: 0}}>👤</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </nav>

      {/* ── MAIN ──────────────────────────────────────────────── */}
      <main style={{
        paddingLeft: W, transition: 'padding-left .25s ease', minHeight: '100vh',
      }}>
        {/* Topbar */}
        <div style={{
          background: topbarBg,
          borderBottom: `3px solid ${agent.color}`,
          padding: '18px 28px',
          position: 'sticky', top: 0, zIndex: 10,
          transition: 'background .3s',
        }}>
          <div style={{
            font: '800 10px/1 Sora,sans-serif',
            color: agent.color,
            letterSpacing: '.10em', textTransform: 'uppercase',
          }}>
            {AGENT_TABS.find(t => t.id === active)?.label || 'Agents Hub'}
          </div>
          <div style={{font: 'italic 800 18px/1.2 Sora,sans-serif', color: th.text, marginTop: 4}}>
            {greet}, {agent.name.split(' ')[0]} {greetE}
          </div>
        </div>

        <div>{children}</div>
      </main>
    </div>
  );
};

Object.assign(window, {Shell, AGENT_TABS});
