// Managers Hub — Agents tab. Interactive roster of the 5 CX agents.
// Only Love can edit shifts here; agents see only their own day in
// the Agents Hub.

const AgentsScreen = () => {
  const A = window.EK_AGENTS;
  const today = new Date(new Date().toLocaleString('en-US', {timeZone:'Africa/Lagos'}));
  const dayOfWeek = today.toLocaleDateString('en-GB', {weekday:'long'});
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  // Mock current-week roster (matches what the SharePoint RosterList provides)
  const [roster, setRoster] = React.useState({
    matthew: 'Day',
    racheal: 'Day',
    tomina:  'Off',
    esther:  'Night',
    loveth:  'Day',
  });

  const shiftHours = isWeekend ? '10:00 – 16:00' : '08:00 – 17:00';

  return (
    <div style={{padding:'22px 28px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:18}}>
        <div>
          <h2 style={{font:'800 17px/1.2 Sora,sans-serif', color:'#fff', margin:0}}>👥 Agents</h2>
          <p style={{font:'500 11.5px/1.4 Sora,sans-serif', color:'#6B85C0', margin:'4px 0 0'}}>
            5 CX team members · rotational shifts · {dayOfWeek} · {isWeekend ? 'Weekend' : 'Weekday'} window {shiftHours}
          </p>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12, marginBottom:18}}>
        {A.map(agent => {
          const shift = roster[agent.id];
          const shiftLabel = shift==='Day'?'☀️ Day':shift==='Night'?'🌙 Night':'⛔ Off';
          const shiftBg   = shift==='Day'?'rgba(245,158,11,.15)':shift==='Night'?'rgba(139,92,246,.15)':'rgba(156,163,175,.15)';
          const shiftCol  = shift==='Day'?'#F59E0B':shift==='Night'?'#A78BFA':'#9CA3AF';
          return (
            <div key={agent.id} style={{
              background:'#111D4A', border:`1px solid ${agent.color}55`, borderRadius:12,
              overflow:'hidden', position:'relative',
            }}>
              <div style={{height:4, background: agent.color}}/>
              <div style={{padding:'14px 16px'}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                  <div style={{
                    width:38, height:38, borderRadius:'50%',
                    background: agent.tint, border:`2px solid ${agent.color}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:18, flexShrink:0,
                  }}>{agent.emoji}</div>
                  <div style={{minWidth:0}}>
                    <div style={{font:'800 13px/1.1 Sora,sans-serif', color:'#fff'}}>{agent.name}</div>
                    <div style={{font:'500 10px/1 JetBrains Mono,monospace', color:'#6B85C0', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{agent.email}</div>
                  </div>
                </div>
                <div style={{
                  display:'inline-flex', alignItems:'center', padding:'5px 12px', borderRadius:14,
                  background: shiftBg, color: shiftCol,
                  font:'800 11px/1 Sora,sans-serif', letterSpacing:'.04em',
                  marginBottom:10,
                }}>{shiftLabel} · {shift==='Off'?'Day Off':shiftHours}</div>
                <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                  {['Day','Night','Off'].map(s => (
                    <button key={s} onClick={() => setRoster(r => ({...r, [agent.id]: s}))} style={{
                      padding:'6px 11px', borderRadius:7,
                      border: shift===s ? `2px solid ${agent.color}` : '1px solid #1E3070',
                      background: shift===s ? agent.tint : 'rgba(255,255,255,.04)',
                      color: shift===s ? '#fff' : '#6B85C0',
                      font:'700 11px Sora,sans-serif', cursor:'pointer',
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background:'rgba(255,199,44,.06)', border:'1px dashed rgba(255,199,44,.25)',
        borderRadius:10, padding:'12px 16px',
        display:'flex', alignItems:'flex-start', gap:10,
      }}>
        <span style={{fontSize:18}}>💡</span>
        <div>
          <div style={{font:'800 12px Sora,sans-serif', color:'#FFC72C', marginBottom:3}}>Roster is editable only here.</div>
          <div style={{font:'500 11.5px/1.5 Sora,sans-serif', color:'rgba(240,244,255,.75)'}}>
            Agents see their own shift in the Agents Hub but cannot change it. When OneDrive sync is wired,
            this roster pushes to all 5 agents' hubs automatically.
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {AgentsScreen});
