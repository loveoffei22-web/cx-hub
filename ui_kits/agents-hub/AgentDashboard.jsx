// Agents Hub — Dashboard screen.
// Shows all 5 agents as coloured cards: photo · name · email · shift pill ·
// Tickets / Resolved / Rate stats · Day / Night / Off / Leave shift buttons.
// The logged-in agent's card gets a brighter border + "You" badge.

const AgentDashboard = ({agent, tickets, onChange}) => {
  const AGENTS  = window.EK_AGENTS  || [];
  const PHOTOS  = window.EK_AGENT_PHOTOS || window.EK_TEAM_PHOTOS || {};
  const allTix  = window.AGENT_TICKETS || {};

  // Roster persisted in localStorage (shared key with Managers Hub)
  const initRoster = () => {
    try { return JSON.parse(localStorage.getItem('po_roster') || '{}'); }
    catch(e){ return {}; }
  };
  const [roster, setRoster] = React.useState(initRoster);

  const setShift = (agentId, shift) => {
    const next = {...roster, [agentId]: shift};
    setRoster(next);
    localStorage.setItem('po_roster', JSON.stringify(next));
  };

  const shiftMeta = {
    Day:       {label:'Day',       emoji:'☀️',  pill:'Day Shift',   bg:'rgba(245,158,11,.15)',  color:'#FCD34D'},
    Night:     {label:'Night',     emoji:'🌙',  pill:'Night Shift', bg:'rgba(139,92,246,.15)',  color:'#A78BFA'},
    Shadowing: {label:'Shadowing', emoji:'📊',  pill:'Night · Shadowing', bg:'rgba(59,130,246,.15)', color:'#93C5FD'},
    Off:       {label:'Off',       emoji:'🔴',  pill:'Day Off',     bg:'rgba(156,163,175,.15)', color:'#9CA3AF'},
    Leave:     {label:'Leave',     emoji:'🏖️', pill:'On Leave',    bg:'rgba(16,185,129,.15)',  color:'#34D399'},
  };

  const wat = new Date(new Date().toLocaleString('en-US',{timeZone:'Africa/Lagos'}));
  const todayStr = wat.toLocaleDateString('en-GB',{weekday:'long', day:'numeric', month:'long'});

  return (
    <div style={{padding:'22px 28px', maxWidth:1100}}>

      {/* Header row */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20, flexWrap:'wrap', gap:10}}>
        <div>
          <div style={{font:'700 10px/1 Sora,sans-serif', color:'#6B85C0', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:5}}>
            EKEDP CUSTOMER EXPERIENCE · MARINA HQ
          </div>
          <h2 style={{font:'800 18px/1.2 Sora,sans-serif', color:'#fff', margin:0}}>👥 Agents</h2>
          <p style={{font:'500 12px/1.4 Sora,sans-serif', color:'#6B85C0', margin:'4px 0 0'}}>
            {AGENTS.length} CX agents · {todayStr}
          </p>
        </div>
        <button onClick={()=>onChange('add')} style={{
          padding:'10px 18px', background:'#E30613', border:'none', borderRadius:9,
          color:'#fff', font:'800 12px Sora,sans-serif', cursor:'pointer',
          display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 14px rgba(227,6,19,.35)',
        }}>➕ Add Ticket</button>
      </div>

      {/* Agent grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:14}}>
        {AGENTS.map(a => {
          const isMe    = a.id === agent.id;
          const shift   = roster[a.id] || 'Off';
          const sm      = shiftMeta[shift] || shiftMeta.Off;
          const agTix   = allTix[a.id] || (isMe ? tickets : []);
          const total   = agTix.length;
          const res     = agTix.filter(t=>t.status==='resolved').length;
          const rate    = total ? Math.round(res/total*100) : 0;
          const photo   = PHOTOS[a.id];

          return (
            <div key={a.id} style={{
              background:'#111D4A',
              border:`2px solid ${a.color}`,
              borderRadius:14,
              overflow:'hidden',
              boxShadow: isMe ? `0 0 0 1px ${a.color}55, 0 8px 28px ${a.color}30` : 'none',
              position:'relative',
            }}>
              {/* Top accent stripe */}
              <div style={{height:4, background:a.color, width:'100%'}}/>

              <div style={{padding:'16px 18px'}}>

                {/* Agent identity row */}
                <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14}}>
                  {photo ? (
                    <img src={photo} alt={a.name} style={{
                      width:52, height:52, borderRadius:'50%', objectFit:'cover',
                      border:`2.5px solid ${a.color}`,
                      boxShadow:`0 4px 12px ${a.color}44`,
                      flexShrink:0,
                    }}/>
                  ) : (
                    <div style={{
                      width:52, height:52, borderRadius:'50%',
                      background:a.tint, border:`2.5px solid ${a.color}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      font:'800 18px/1 Sora,sans-serif', color:'#fff', flexShrink:0,
                    }}>{a.initials}</div>
                  )}
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div style={{font:'800 15px/1.1 Sora,sans-serif', color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.name}</div>
                      {isMe && <span style={{
                        font:'800 9px/1 Sora,sans-serif', padding:'3px 7px', borderRadius:6,
                        background:a.color, color:'#fff', textTransform:'uppercase', letterSpacing:'.06em', flexShrink:0,
                      }}>YOU</span>}
                    </div>
                    <div style={{font:'500 11px/1.3 Sora,sans-serif', color: a.color, marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.email}</div>
                  </div>
                </div>

                {/* Shift pill */}
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  padding:'6px 12px', borderRadius:20,
                  background:sm.bg, marginBottom:14,
                }}>
                  <span style={{fontSize:14}}>{sm.emoji}</span>
                  <span style={{font:'700 11.5px/1 Sora,sans-serif', color:sm.color}}>
                    {sm.label} · {sm.pill}
                  </span>
                </div>

                {/* Stats row */}
                <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14}}>
                  {[
                    {label:'Tickets',  v:total,      color:'#3B82F6',  fmt:String},
                    {label:'Resolved', v:res,         color:'#4ADE80',  fmt:String},
                    {label:'Rate',     v:rate,        color:'#F87171',  fmt:v=>v+'%'},
                  ].map(s=>(
                    <div key={s.label} style={{
                      background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.07)',
                      borderRadius:9, padding:'10px 8px', textAlign:'center',
                    }}>
                      <div style={{font:`800 22px/1 'JetBrains Mono',monospace`, color:s.color}}>{s.fmt(s.v)}</div>
                      <div style={{font:'700 9px/1 Sora,sans-serif', color:'#6B85C0', textTransform:'uppercase', letterSpacing:'.10em', marginTop:5}}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Shift buttons */}
                <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6}}>
                  {Object.entries(shiftMeta).map(([k,m])=>{
                    const on = shift === k;
                    return (
                      <button key={k} onClick={()=>setShift(a.id, k)} style={{
                        padding:'8px 4px',
                        border: on ? `2px solid ${a.color}` : '1px solid rgba(255,255,255,.10)',
                        borderRadius:8,
                        background: on ? a.tint : 'rgba(255,255,255,.04)',
                        color: on ? '#fff' : '#6B85C0',
                        font:'700 11px Sora,sans-serif',
                        cursor:'pointer',
                        display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                        transition:'all .15s',
                      }}>
                        <span style={{fontSize:15}}>{m.emoji}</span>
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div style={{
        marginTop:18, padding:'12px 16px',
        background:'rgba(255,199,44,.06)', border:'1px dashed rgba(255,199,44,.22)',
        borderRadius:10, font:'500 11.5px/1.5 Sora,sans-serif', color:'rgba(255,199,44,.75)',
      }}>
        💡 Shift changes are saved locally and sync to Managers Hub when OneDrive is wired.
      </div>
    </div>
  );
};

Object.assign(window, {AgentDashboard});
