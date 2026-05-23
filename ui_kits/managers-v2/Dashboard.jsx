// Dashboard v2 — Slot timeline hero + KPI ring row + Command board
const SLOTS = [
  {id:'9am',  label:'9AM Handover',    start:9,  end:10, emoji:'☀️'},
  {id:'12pm', label:'12PM Update',     start:12, end:13, emoji:'🕛'},
  {id:'mid',  label:'1–2PM Midday',   start:13, end:14, emoji:'🌤️'},
  {id:'cob',  label:'4–5PM COB',      start:16, end:17, emoji:'🌆'},
];

const Dashboard = ({user='Love', onSettings, onNav}) => {
  const D = window.EK_DATA;
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => { const id = setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(id); },[]);

  const wat = new Date(now.toLocaleString('en-US',{timeZone:'Africa/Lagos'}));
  const h = wat.getHours(), m = wat.getMinutes();
  const watTime = wat.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const watDate = wat.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  const greet = h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  const greetEmoji = h<12?'☀️':h<17?'🌤️':'🌙';

  const currentSlot = SLOTS.find(s => h>=s.start && h<s.end) || null;
  const nextSlot = SLOTS.find(s => s.start > h) || null;
  const dayProgress = Math.round(((h*60+m)/(17*60))*100);

  const RT = D.REAL_TOTALS||null;
  const CUM = D.REAL_CUM_DATA || D.RESPONSIBLE;
  const all  = RT ? RT.total     : CUM.reduce((a,r)=>a+r.grand,0);
  const res  = RT ? RT.resolved  : CUM.reduce((a,r)=>a+r.res,0);
  const prog = RT ? RT.progress  : CUM.reduce((a,r)=>a+r.prog,0);
  const unr  = RT ? RT.unresolved: CUM.reduce((a,r)=>a+r.unres,0);
  const today = CUM.reduce((a,r)=>a+(r.today||0),0);
  const rate  = all>0 ? Math.round(res/all*100) : 0;

  const circ = 2*Math.PI*22;
  const Dial = ({v,total,color}) => {
    const pct = total>0 ? v/total : 0;
    const off  = circ*(1-pct);
    return (
      <svg width="54" height="54" viewBox="0 0 54 54" style={{transform:'rotate(-90deg)'}}>
        <circle cx="27" cy="27" r="22" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="5"/>
        <circle cx="27" cy="27" r="22" fill="none" stroke={color} strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={off}
                style={{filter:`drop-shadow(0 0 5px ${color}77)`,transition:'stroke-dashoffset .8s ease'}}/>
      </svg>
    );
  };

  const KPIs = [
    {label:'Total',       value:all,  pct:100,     color:'#60A5FA',  sub:'Day 1–15'},
    {label:'Resolved',    value:res,  pct:rate,    color:'#22C55E',  sub:`${rate}% rate`},
    {label:'In Progress', value:prog, pct:Math.round(prog/all*100), color:'#F59E0B', sub:'Being handled'},
    {label:'Unresolved',  value:unr,  pct:Math.round(unr/all*100),  color:'#EF4444', sub:'Action needed'},
    {label:"Today",       value:today,pct:Math.round(today/all*100),color:'#C4B5FD', sub:'Day 15'},
  ];

  const urgent = (D.REAL_DAY_LIST||D.DAY_LIST).flatMap(d=>d.tickets||[]).filter(t=>t.status==='unresolved').slice(0,5);

  return (
    <div>
      {/* ── HERO COMMAND STRIP ── */}
      <div style={{background:'linear-gradient(140deg,#05174A 0%,#081230 40%,#050B22 100%)',borderBottom:'1px solid var(--border-soft)',padding:'24px 28px 20px',position:'relative',overflow:'hidden'}}>
        {/* Ambient glow */}
        <div style={{position:'absolute',top:'-20%',right:'-5%',width:480,height:480,background:'radial-gradient(circle,rgba(255,199,44,.07) 0%,transparent 65%)',pointerEvents:'none'}}/>

        {/* Top row: greeting + clock */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,marginBottom:20,position:'relative'}}>
          <div>
            <div style={{font:'700 10px/1 Sora,sans-serif',color:'var(--ek-gold)',letterSpacing:'.18em',textTransform:'uppercase',marginBottom:8}}>
              EKEDP Customer Experience · Marina HQ
            </div>
            <h1 style={{font:'800 italic 26px/1.1 Sora,sans-serif',color:'#fff',margin:0}}>
              {greet}, {user} {greetEmoji}
            </h1>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,.05)',border:'1px solid var(--border)',borderRadius:12,padding:'9px 14px'}}>
              <span className="live-dot"/>
              <span className="mono" style={{font:'800 20px/1 JetBrains Mono,monospace',color:'#fff',letterSpacing:'.08em'}}>{watTime}</span>
              <span className="mono" style={{font:'600 10px/1 JetBrains Mono,monospace',color:'var(--muted)'}}>WAT</span>
              <button onClick={onSettings} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',display:'flex',marginLeft:4}}>
                {window.Icon && window.Icon.settings}
              </button>
            </div>
            <div style={{font:'600 11px/1 Sora,sans-serif',color:'var(--muted)'}}>{watDate}</div>
          </div>
        </div>

        {/* Slot timeline */}
        <div style={{background:'rgba(0,0,0,.25)',border:'1px solid var(--border-soft)',borderRadius:12,padding:'13px 16px',position:'relative'}}>
          <div style={{font:'700 9px/1 Sora,sans-serif',color:'var(--sub)',textTransform:'uppercase',letterSpacing:'.14em',marginBottom:12}}>
            Day 15 · Operational Slots
          </div>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            {SLOTS.map(s => {
              const done = h >= s.end;
              const active = h>=s.start && h<s.end;
              return (
                <div key={s.id} style={{
                  flex:1,padding:'10px 12px',borderRadius:9,
                  background: active ? 'rgba(255,199,44,.14)' : done ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.2)',
                  border: active ? '1px solid rgba(255,199,44,.45)' : '1px solid var(--border-soft)',
                  cursor:'pointer',transition:'all .15s',
                }}>
                  <div style={{font:'500 11px/1 Sora,sans-serif',color: active ? 'var(--ek-gold)' : done ? 'var(--ok-bright)' : 'var(--muted)',marginBottom:5}}>
                    {s.emoji} {s.label}
                  </div>
                  {active && <div className="mono" style={{font:'700 9px/1 JetBrains Mono,monospace',color:'var(--ek-gold)',letterSpacing:'.1em'}}>● ACTIVE</div>}
                  {done && <div className="mono" style={{font:'700 9px/1 JetBrains Mono,monospace',color:'var(--ok-bright)',letterSpacing:'.1em'}}>✓ DONE</div>}
                  {!active && !done && <div className="mono" style={{font:'600 9px/1 JetBrains Mono,monospace',color:'var(--sub)',letterSpacing:'.1em'}}>{s.start}:00</div>}
                </div>
              );
            })}
          </div>
          {/* Timeline bar */}
          <div style={{height:3,background:'rgba(255,255,255,.07)',borderRadius:2,overflow:'hidden'}}>
            <div style={{height:3,background:'linear-gradient(90deg,var(--ek-gold),var(--warn-bright))',borderRadius:2,width:`${Math.min(dayProgress,100)}%`,transition:'width 1s ease'}}/>
          </div>
          {nextSlot && (
            <div style={{font:'500 10px/1.3 Sora,sans-serif',color:'var(--muted)',marginTop:8}}>
              Next: <b style={{color:'#fff'}}>{nextSlot.label}</b> at {nextSlot.start}:00 WAT
              {currentSlot && <> · <a href="#" onClick={e=>{e.preventDefault();onNav&&onNav('reports');}} style={{color:'var(--ek-gold)',fontWeight:700,textDecoration:'none'}}>Prepare report →</a></>}
            </div>
          )}
        </div>

        {/* KPI ring row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginTop:16,position:'relative'}}>
          {KPIs.map(k => (
            <div key={k.label} style={{
              background:'rgba(0,0,0,.22)',border:'1px solid var(--border-soft)',borderRadius:12,
              padding:'13px 14px',display:'flex',alignItems:'center',gap:12,
              transition:'transform .15s,border-color .15s,background .15s',cursor:'default',
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor=k.color;}}
            onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor='var(--border-soft)';}}>
              <div style={{position:'relative',flexShrink:0}}>
                <Dial v={k.value} total={all} color={k.color}/>
                <div className="mono" style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',font:'800 11px/1 JetBrains Mono,monospace',color:k.color}}>{k.pct}</div>
              </div>
              <div style={{minWidth:0}}>
                <div style={{font:'700 9px/1 Sora,sans-serif',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.10em',marginBottom:5,whiteSpace:'nowrap'}}>{k.label}</div>
                <div className="mono" style={{font:'800 22px/1 JetBrains Mono,monospace',color:'#fff'}}>{k.value}</div>
                <div style={{font:'500 10px/1.2 Sora,sans-serif',color:'var(--sub)',marginTop:3}}>{k.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY: Command board ── */}
      <div style={{padding:'20px 28px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>

        {/* Responsible parties */}
        <div className="card">
          <div className="card-head">
            <span className="h-card">🎯 Responsible Parties</span>
            <span style={{font:'600 10.5px/1 Sora,sans-serif',color:'var(--muted)'}}>{CUM.filter(r=>r.grand>0).length} active</span>
          </div>
          <div className="card-body" style={{padding:'12px 18px',display:'flex',flexDirection:'column',gap:7}}>
            {CUM.filter(r=>r.grand>0).map(r => (
              <div key={r.sn} style={{display:'flex',alignItems:'center',gap:11,padding:'9px 12px',background:'rgba(0,0,0,.18)',borderRadius:9,border:'1px solid var(--border-soft)'}}>
                <span className="mono" style={{font:'700 10px/1 JetBrains Mono,monospace',color:'var(--sub)',width:16,textAlign:'right'}}>{r.sn}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{font:'600 12px/1.2 Sora,sans-serif',color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.name}</div>
                  <div style={{font:'500 10px/1 Sora,sans-serif',color:'var(--muted)',marginTop:2}}>{r.cat||'General'}</div>
                </div>
                <div style={{width:60,background:'rgba(255,255,255,.05)',borderRadius:3,height:4,flexShrink:0}}>
                  <div style={{height:4,borderRadius:3,background:r.pct>=80?'var(--ok)':r.pct>=50?'var(--warn)':'var(--bad)',width:`${r.pct}%`,transition:'width .6s'}}/>
                </div>
                <span className="mono" style={{font:'800 11px/1 JetBrains Mono,monospace',width:30,textAlign:'right',color:r.pct>=80?'var(--ok-bright)':r.pct>=50?'var(--warn-bright)':'var(--bad-bright)'}}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent updates */}
        <div className="card">
          <div className="card-head">
            <span className="h-card">🔔 Recent Status Updates</span>
            <span style={{font:'600 10.5px/1 Sora,sans-serif',color:'var(--muted)'}}>{D.STATUS_UPDATES.length} today</span>
          </div>
          <div className="card-body" style={{padding:'0 18px',display:'flex',flexDirection:'column'}}>
            {D.STATUS_UPDATES.map((u,i) => (
              <div key={i} style={{
                display:'flex',alignItems:'flex-start',gap:12,
                padding:'12px 0',
                borderBottom: i<D.STATUS_UPDATES.length-1 ? '1px solid var(--border-soft)' : 'none',
              }}>
                <div style={{width:8,height:8,borderRadius:'50%',marginTop:5,flexShrink:0,
                  background:u.did==='resolved'?'var(--ok)':u.did==='progress'?'var(--warn)':'var(--bad)',
                  boxShadow:`0 0 6px ${u.did==='resolved'?'var(--ok)':u.did==='progress'?'var(--warn)':'var(--bad)'}`}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{font:'600 12px/1.3 Sora,sans-serif',color:'var(--text)'}}>
                    <b>{u.who}</b> {u.did==='resolved'?'resolved':u.did==='progress'?'is working on':'flagged'} <span className="mono" style={{color:'var(--info)',fontWeight:700}}>#{u.tkt}</span>
                  </div>
                  <div style={{font:'500 10px/1.2 Sora,sans-serif',color:'var(--muted)',marginTop:2}}>{u.bu} · {u.cat}</div>
                </div>
                <span className="mono" style={{font:'600 10px/1 JetBrains Mono,monospace',color:'var(--sub)',flexShrink:0}}>{u.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Unresolved urgent — full width */}
        {urgent.length > 0 && (
          <div className="card" style={{gridColumn:'1 / -1'}}>
            <div className="card-head" style={{background:'rgba(239,68,68,.08)'}}>
              <span className="h-card" style={{color:'var(--bad-bright)'}}>🔴 Unresolved — Action Needed</span>
              <span style={{font:'600 10.5px/1 Sora,sans-serif',color:'var(--bad-bright)'}}>{urgent.length} tickets</span>
            </div>
            <div className="card-body" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
              {urgent.map(t => (
                <div key={t.num} style={{background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.18)',borderRadius:10,padding:'11px 14px',display:'flex',gap:10}}>
                  <span className="mono" style={{font:'800 12px/1 JetBrains Mono,monospace',color:'var(--bad-bright)',flexShrink:0,marginTop:1}}>#{t.num}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{font:'600 12px/1.2 Sora,sans-serif',color:t.name?'var(--bad-name)':'var(--muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name||t.phone}</div>
                    <div style={{font:'500 10px/1.3 Sora,sans-serif',color:'rgba(255,255,255,.35)',marginTop:2}}>{t.time} · {t.category||t.cat}</div>
                  </div>
                  <span style={{font:'700 10px/1 Sora,sans-serif',padding:'3px 7px',borderRadius:5,background:'rgba(255,255,255,.08)',color:'#fff',whiteSpace:'nowrap',alignSelf:'flex-start'}}>{t.bu}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, {Dashboard});
