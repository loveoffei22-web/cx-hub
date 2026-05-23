// Dashboard screen — hero w/ greeting + day badge, 5 KPI cards,
// "Responsible Parties" leaderboard, "Recent Status Updates", "Unresolved".

const Dashboard = ({user='CX Team', onSettings}) => {
  const D = window.EK_DATA;
  if (!D) return (
    <div style={{padding:40, color:'#F87171', fontFamily:'Sora,sans-serif', fontSize:13}}>
      ⚠️ Data not loaded — SampleData.js is missing or failed to run. Check the browser console.
    </div>
  );
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
  // Use real data if available, fall back to sample
  const RT = D.REAL_TOTALS || null;
  const CUM = D.REAL_CUM_DATA || D.RESPONSIBLE;
  const all = RT ? RT.total : D.RESPONSIBLE.reduce((acc,r)=>acc+r.grand,0);
  const res = RT ? RT.resolved : D.RESPONSIBLE.reduce((acc,r)=>acc+r.res,0);
  const prog = RT ? RT.progress : D.RESPONSIBLE.reduce((acc,r)=>acc+r.prog,0);
  const unr = RT ? RT.unresolved : D.RESPONSIBLE.reduce((acc,r)=>acc+r.unres,0);
  const todayN = CUM.reduce((acc,r)=>acc+(r.today||0),0);
  const rate = Math.round(res/all*100);

  const urgent = [
    {num:'710087', name:'Aisha Bello',      time:'4:51 PM', cat:'Metering', bu:'AJAH'},
    {num:'710105', name:'Tope Oluwa',       time:'5:43 PM', cat:'Billing',  bu:'IKOYI'},
    {num:'710092', name:'Kunle Adetayo',    time:'5:08 PM', cat:'Voltage',  bu:'LEKKI'},
    {num:'710147', name:'Funmilayo Okeke',  time:'2:13 PM', cat:'Metering', bu:'MUSHIN'},
    {num:'710162', name:'Bidemi Akande',    time:'3:45 PM', cat:'Voltage',  bu:'IKOYI'},
  ];

  return (
    <div>
      {/* HERO */}
      <div className="dash-hero-bg" style={{
        background:'linear-gradient(135deg,#001040 0%,#001F5C 50%,#0a0020 100%)',
        padding:28, borderBottom:'1px solid var(--border)', position:'relative', overflow:'hidden',
      }}>
        <div style={{
          content:'""', position:'absolute', top:'-50%', right:'-5%',
          width:600, height:600,
          background:'radial-gradient(circle, rgba(227,6,19,.12) 0%, transparent 70%)',
          pointerEvents:'none',
        }}/>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22, flexWrap:'wrap', gap:12, position:'relative'}}>
          <div>
            <h1 style={{font:'italic 800 20px/1.15 Sora,sans-serif', color:'#fff', margin:0}}>
              {greetWord}, {user} {greetEmoji}
            </h1>
            <p style={{font:'500 11px/1.4 Sora,sans-serif', color:'rgba(255,255,255,.45)', margin:'3px 0 0'}}>
              EKEDP Customer Experience · Marina HQ
            </p>
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8}}>
            <div style={{
              display:'flex', alignItems:'center', gap:8,
              background:'rgba(255,255,255,.06)',
              border:'1px solid rgba(255,255,255,.12)',
              borderRadius:10, padding:'6px 10px',
            }}>
              <span style={{width:6, height:6, borderRadius:'50%', background:'#22C55E', boxShadow:'0 0 0 0 rgba(34,197,94,.7)'}}/>
              <Mono style={{fontSize:11, color:'#fff', fontWeight:700}}>{watTime} WAT</Mono>
              <Mono style={{fontSize:10, color:'rgba(255,255,255,.45)'}}>· {watDate}</Mono>
              <button onClick={onSettings} title="Settings" style={{
                marginLeft:6, background:'rgba(255,255,255,.08)',
                border:'1px solid rgba(255,255,255,.12)',
                color:'#fff', borderRadius:7, width:24, height:24,
                fontSize:13, cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center', padding:0,
              }}>⚙</button>
            </div>
            <div className="day-badge-box" style={{
              background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)',
              borderRadius:10, padding:'10px 18px', textAlign:'center',
            }}>
              <div style={{font:'800 28px/1 JetBrains Mono,monospace', color:'#F59E0B'}}>15</div>
              <div style={{font:'700 9px/1 Sora,sans-serif', color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.1em', marginTop:4}}>
                Day of Ops · 1–15 May 2026
              </div>
            </div>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, position:'relative'}}>
          <KpiTile label="Total Complaints" value={all}    sub="Day 1–15"          stripe="#3B82F6"/>
          <KpiTile label="Resolved"         value={res}    sub={`${rate}% rate`}   stripe="#16A34A"/>
          <KpiTile label="In Progress"      value={prog}   sub="Being handled"     stripe="#D97706"/>
          <KpiTile label="Unresolved"       value={unr}    sub="Action needed"     stripe="#DC2626"/>
          <KpiTile label="Today's Complaints" value={todayN} sub="Day 15"          stripe="#8B5CF6"/>
        </div>
      </div>

      {/* BODY */}
      <div style={{padding:'20px 28px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
        <Card title="🎯 Responsible Parties">
          {(D.REAL_CUM_DATA || D.RESPONSIBLE).map(r => (
            <div key={r.sn} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'9px 12px', background:'rgba(255,255,255,.03)',
              borderRadius:8, border:'1px solid #1E3070', marginBottom:8,
            }}>
              <Mono style={{fontSize:10, color:'#6B85C0', width:18}}>{String(r.sn).padStart(2,'0')}</Mono>
              <div style={{flex:1, minWidth:0}}>
                <div style={{font:'600 12px/1.2 Sora,sans-serif', color:'#F0F4FF', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.name}</div>
                <div style={{font:'500 10px/1.2 Sora,sans-serif', color:'#6B85C0', marginTop:1}}>{r.cat}</div>
              </div>
              <div style={{width:70, background:'rgba(255,255,255,.06)', borderRadius:4, height:5}}>
                <div style={{
                  width:`${r.pct}%`, height:5, borderRadius:4,
                  background: r.pct>=80 ? '#4ADE80' : r.pct>=50 ? '#FCD34D' : '#F87171',
                }}/>
              </div>
              <Mono style={{
                fontWeight:700, fontSize:11, width:34, textAlign:'right',
                color: r.pct>=80 ? '#4ADE80' : r.pct>=50 ? '#FCD34D' : '#F87171',
              }}>{r.pct}%</Mono>
            </div>
          ))}
        </Card>

        <Card title="🔔 Recent Status Updates" right={`${D.STATUS_UPDATES.length} today`}>
          {D.STATUS_UPDATES.map((u,i) => (
            <div key={i} style={{
              display:'flex', alignItems:'flex-start', gap:10,
              padding:'10px 0', borderBottom: i<D.STATUS_UPDATES.length-1 ? '1px solid #1E3070' : 'none',
            }}>
              <div style={{
                width:10, height:10, borderRadius:'50%', marginTop:5, flexShrink:0,
                background: u.did==='resolved'?'#4ADE80':u.did==='progress'?'#FCD34D':'#F87171',
              }}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{font:'600 12px/1.3 Sora,sans-serif', color:'#F0F4FF'}}>
                  {u.who} {u.did==='resolved'?'resolved':u.did==='progress'?'is working':'flagged'} #{u.tkt}
                </div>
                <div style={{font:'500 10px/1.3 Sora,sans-serif', color:'#6B85C0', marginTop:1}}>{u.bu} · {u.cat}</div>
              </div>
              <Mono style={{fontSize:10, color:'#3A5299', whiteSpace:'nowrap'}}>{u.t}</Mono>
            </div>
          ))}
        </Card>

        <Card title="🔴 Unresolved — Action Needed" right={`${urgent.length} tickets`} span1>
          {urgent.map(t => (
            <div key={t.num} style={{
              padding:'9px 12px', background:'rgba(220,38,38,.07)',
              border:'1px solid rgba(220,38,38,.18)', borderRadius:8,
              display:'flex', alignItems:'flex-start', gap:9, marginBottom:7,
            }}>
              <Mono style={{fontWeight:700, fontSize:11, color:'#F87171', whiteSpace:'nowrap'}}>#{t.num}</Mono>
              <div style={{flex:1, minWidth:0}}>
                <div style={{font:'600 12px/1.2 Sora,sans-serif', color:'#FCA5A5', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.name}</div>
                <div style={{font:'500 10px/1.3 Sora,sans-serif', color:'rgba(255,255,255,.35)', marginTop:1}}>{t.time} · {t.cat}</div>
              </div>
              <div style={{font:'700 10px/1.2 Sora,sans-serif', padding:'2px 6px', borderRadius:4, background:'rgba(255,255,255,.1)', color:'#fff', whiteSpace:'nowrap'}}>{t.bu}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, {Dashboard});
