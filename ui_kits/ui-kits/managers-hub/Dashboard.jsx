// ─── EKEDP Managers Hub — Dashboard Screen ───────────────────────────────

function Dashboard({ user, onSettings }) {
  const D   = window.EK_DATA;
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  const dayNo   = now.getDate();
  const months  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
  const hour    = now.getHours();
  const greet   = hour < 12 ? 'Good Morning, My Madam' : hour < 17 ? 'Good Afternoon, Boss' : 'Good Evening, Boss';
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';

  // ── Correct responsible parties with proper categories ──
  const PARTIES = [
    {sn:1, name:'Nonye Angelina Nnadozie', cat:'Band Reclassification'},
    {sn:2, name:'Mojibola Adefuwa',        cat:'Billing'},
    {sn:3, name:'Ogheneyoreme Agbroko',    cat:'Interruption / Voltage / Safety'},
    {sn:4, name:'Holyland Umude',          cat:'Metering'},
    {sn:5, name:'Adetoun Adebayo',         cat:'General'},
    {sn:6, name:'Olusegun Owokade',        cat:'PPM Metering'},
    {sn:7, name:'Clara Olutola',           cat:'Customer Onboarding'},
    {sn:8, name:'Glory Mycron',            cat:'MYCRON'},
    {sn:9, name:'Festus Moko',             cat:'AMISA'},
  ];

  // ── Use real cumulative data ──
  const rows = (D.REAL_CUM_DATA || D.RESPONSIBLE).map(function(r, i) {
    return Object.assign({}, r, { cat: PARTIES[i] ? PARTIES[i].cat : r.cat, name: PARTIES[i] ? PARTIES[i].name : r.name });
  });

  const totals = rows.reduce(function(acc, r) {
    acc.today += (r.today || 0);
    acc.res   += (r.res   || 0);
    acc.prog  += (r.prog  || 0);
    acc.unr   += (r.unres || 0);
    return acc;
  }, { today:0, res:0, prog:0, unr:0 });
  totals.grand = totals.res + totals.prog + totals.unr;
  totals.pct   = totals.grand ? Math.round((totals.res / totals.grand) * 100) : 0;

  // ── Today's tickets from SNAP ──
  const snap = D.SNAP;
  const todayDayObj = snap ? snap.days.find(function(d) { return d.dayNum === dayNo; }) : null;
  const todayTickets = todayDayObj ? (todayDayObj.tickets || []) : [];

  // ── Pending (unresolved across ALL days) ──
  const allTickets = snap ? snap.days.flatMap(function(d) {
    return (d.tickets || []).map(function(t) { return Object.assign({}, t, {dayNum: d.dayNum, dateBig: d.dateBig}); });
  }) : [];
  const pending = allTickets.filter(function(t) { return t.status === 'unresolved'; }).slice(0, 8);

  // ── Pie chart SVG ──
  function PieChart({ res, prog, unr }) {
    const total = res + prog + unr || 1;
    const r = 60, cx = 80, cy = 80;
    function slice(start, val, color) {
      const startAngle = (start / total) * 2 * Math.PI - Math.PI / 2;
      const endAngle   = ((start + val) / total) * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const large = val / total > 0.5 ? 1 : 0;
      if (val === 0) return null;
      return (
        <path
          d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
          fill={color} stroke="#111D4A" strokeWidth="2"
        />
      );
    }
    return (
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="#1E3070" opacity="0.3"/>
        {slice(0,       res,  '#4ADE80')}
        {slice(res,     prog, '#F59E0B')}
        {slice(res+prog,unr,  '#F87171')}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="#0D1B45"/>
        <text x={cx} y={cy - 8}  textAnchor="middle" fill="#fff"  fontSize="18" fontWeight="900" fontFamily="JetBrains Mono,monospace">{Math.round(res/total*100)}%</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#6B85C0" fontSize="9" fontFamily="Sora,sans-serif">RESOLVED</text>
      </svg>
    );
  }

  function pctBadge(pct) {
    const bg  = pct >= 80 ? 'rgba(22,163,74,.15)'  : pct >= 50 ? 'rgba(217,119,6,.15)'  : 'rgba(220,38,38,.15)';
    const col = pct >= 80 ? '#4ADE80'               : pct >= 50 ? '#FCD34D'               : '#F87171';
    return <span style={{display:'inline-flex', padding:'3px 10px', borderRadius:20, fontFamily:'JetBrains Mono,monospace', fontWeight:800, fontSize:11, background:bg, color:col}}>{pct}%</span>;
  }

  return (
    <div style={{ padding:'22px 28px', maxWidth:1200, margin:'0 auto' }}>

      {/* ── Header banner ── */}
      <div style={{
        background:'linear-gradient(135deg,#001F5C,#0A1A4F 60%,#1a3a8f)',
        borderRadius:14, padding:'22px 28px', marginBottom:18,
        display:'flex', alignItems:'center', gap:18, color:'#fff',
      }}>
        <div style={{ flex:1 }}>
          <div style={{ font:'600 14px/1 Sora,sans-serif', color:'rgba(255,255,255,.7)', marginBottom:6 }}>
            {greetEmoji} {greet} 👑
          </div>
          <div style={{ font:'900 26px/1.1 Sora,sans-serif', marginBottom:4 }}>
            📊 Daily Roll-up · Day {dayNo}
          </div>
          <div style={{ font:'500 12px/1.4 Sora,sans-serif', color:'rgba(255,255,255,.6)' }}>
            {dateStr} · Customer Experience · Marina HQ · Mobile App Channel
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ font:'800 16px/1 JetBrains Mono,monospace', color:'#FFC72C' }}>
            {now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})} WAT
          </div>
          <button onClick={onSettings} style={{
            marginTop:10, padding:'8px 16px', borderRadius:8,
            border:'1px solid rgba(255,255,255,.2)',
            background:'rgba(255,255,255,.08)', color:'#fff',
            font:'700 12px Sora,sans-serif', cursor:'pointer',
          }}>⚙ Settings</button>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:18 }}>
        {[
          {label:'Grand Total',    value:totals.grand,        stripe:'#3B82F6', vc:'#93C5FD'},
          {label:'Resolved',       value:totals.res,          stripe:'#16A34A', vc:'#4ADE80'},
          {label:'In Progress',    value:totals.prog,         stripe:'#D97706', vc:'#FCD34D'},
          {label:'Unresolved',     value:totals.unr,          stripe:'#DC2626', vc:'#F87171'},
          {label:'% Resolution',   value:totals.pct+'%',      stripe:'#8B5CF6', vc:'#A78BFA'},
        ].map(function(k) {
          return (
            <div key={k.label} style={{
              background:'#111D4A', border:'1px solid #1E3070', borderRadius:10,
              padding:'14px 16px', borderTop:'3px solid '+k.stripe,
            }}>
              <div style={{font:'700 9px/1 Sora,sans-serif', textTransform:'uppercase', letterSpacing:'.08em', color:'#6B85C0', marginBottom:6}}>{k.label}</div>
              <div style={{font:'800 28px/1 JetBrains Mono,monospace', color:k.vc}}>{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* ── Today note ── */}
      {totals.today > 0 && (
        <div style={{marginBottom:18, padding:'10px 16px', background:'rgba(255,199,44,.08)', border:'1px solid rgba(255,199,44,.25)', borderRadius:8, font:'600 13px/1.5 Sora,sans-serif', color:'#FCD34D'}}>
          📥 <strong>{totals.today}</strong> new complaint{totals.today !== 1 ? 's' : ''} received today.
        </div>
      )}

      {/* ── Two column layout: Pie + Today's Tickets ── */}
      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:14, marginBottom:18 }}>

        {/* Pie chart */}
        <div style={{ background:'#111D4A', border:'1px solid #1E3070', borderRadius:12, padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ font:'700 11px Sora,sans-serif', color:'#6B85C0', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Status Split</div>
          <PieChart res={totals.res} prog={totals.prog} unr={totals.unr}/>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:12, width:'100%' }}>
            {[
              {label:'Resolved',    val:totals.res,  col:'#4ADE80'},
              {label:'In Progress', val:totals.prog, col:'#F59E0B'},
              {label:'Unresolved',  val:totals.unr,  col:'#F87171'},
            ].map(function(l) {
              return (
                <div key={l.label} style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:l.col, flexShrink:0 }}/>
                  <span style={{ font:'500 11px Sora,sans-serif', color:'#6B85C0', flex:1 }}>{l.label}</span>
                  <span style={{ font:'700 11px JetBrains Mono,monospace', color:l.col }}>{l.val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's tickets */}
        <div style={{ background:'#111D4A', border:'1px solid #1E3070', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'13px 16px', borderBottom:'1px solid #1E3070', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ font:'700 13px Sora,sans-serif', color:'#fff' }}>📅 Today's Tickets — Day {dayNo} ({dateStr})</div>
            <span style={{ font:'500 11px Sora,sans-serif', color:'#6B85C0' }}>{todayTickets.length} tickets</span>
          </div>
          {todayTickets.length === 0 ? (
            <div style={{ padding:'24px 16px', textAlign:'center', color:'#3A5299', font:'500 12px Sora,sans-serif' }}>
              No tickets logged for today yet — data will appear once loaded via Settings.
            </div>
          ) : (
            <div style={{ overflowX:'auto', maxHeight:220, overflowY:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, fontFamily:'Sora,sans-serif' }}>
                <thead><tr style={{ background:'rgba(0,31,92,.8)' }}>
                  {['#','Ticket','Time','Phone','BU','Category','Status'].map(function(h) {
                    return <th key={h} style={{ padding:'8px 10px', textAlign:'left', font:'700 9px Sora,sans-serif', textTransform:'uppercase', letterSpacing:'.06em', color:'#6B85C0', whiteSpace:'nowrap' }}>{h}</th>;
                  })}
                </tr></thead>
                <tbody>
                  {todayTickets.map(function(t, i) {
                    var sc = t.status==='resolved'?'#4ADE80':t.status==='progress'?'#F59E0B':'#F87171';
                    var sb = t.status==='resolved'?'rgba(22,163,74,.15)':t.status==='progress'?'rgba(245,158,11,.15)':'rgba(220,38,38,.15)';
                    var sl = t.status==='resolved'?'RESOLVED':t.status==='progress'?'IN PROGRESS':'UNRESOLVED';
                    return (
                      <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                        <td style={{ padding:'7px 10px', color:'#3A5299', fontFamily:'JetBrains Mono,monospace' }}>{String(i+1).padStart(2,'0')}</td>
                        <td style={{ padding:'7px 10px' }}><span style={{ fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#93C5FD' }}>#{t.num}</span></td>
                        <td style={{ padding:'7px 10px', color:'#6B85C0' }}>{t.time||'—'}</td>
                        <td style={{ padding:'7px 10px' }}><span style={{ fontFamily:'JetBrains Mono,monospace', color:'#6B85C0', fontSize:10 }}>{t.phone||'—'}</span></td>
                        <td style={{ padding:'7px 10px' }}><span style={{ background:'rgba(59,130,246,.12)', color:'#93C5FD', padding:'2px 7px', borderRadius:6, font:'700 9px Sora,sans-serif', textTransform:'uppercase' }}>{t.bu||'—'}</span></td>
                        <td style={{ padding:'7px 10px', color:'#F0F4FF', fontWeight:600 }}>{t.category||'—'}</td>
                        <td style={{ padding:'7px 10px' }}><span style={{ background:sb, color:sc, padding:'2px 8px', borderRadius:10, font:'700 9px Sora,sans-serif', textTransform:'uppercase' }}>{sl}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Pending Complaints ── */}
      {pending.length > 0 && (
        <div style={{ background:'#111D4A', border:'1px solid rgba(220,38,38,.3)', borderRadius:12, overflow:'hidden', marginBottom:18 }}>
          <div style={{ padding:'13px 16px', borderBottom:'1px solid rgba(220,38,38,.2)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(220,38,38,.05)' }}>
            <div style={{ font:'700 13px Sora,sans-serif', color:'#F87171' }}>🔴 Pending Unresolved Complaints (Action Needed)</div>
            <span style={{ font:'500 11px Sora,sans-serif', color:'#6B85C0' }}>Showing {pending.length} of {allTickets.filter(function(t){return t.status==='unresolved';}).length} total</span>
          </div>
          <div style={{ overflowX:'auto', maxHeight:200, overflowY:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, fontFamily:'Sora,sans-serif' }}>
              <thead><tr style={{ background:'rgba(0,31,92,.8)' }}>
                {['Day','Ticket','Phone','BU','Category','Complaint'].map(function(h) {
                  return <th key={h} style={{ padding:'8px 10px', textAlign:'left', font:'700 9px Sora,sans-serif', textTransform:'uppercase', letterSpacing:'.06em', color:'#6B85C0', whiteSpace:'nowrap' }}>{h}</th>;
                })}
              </tr></thead>
              <tbody>
                {pending.map(function(t, i) {
                  return (
                    <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                      <td style={{ padding:'7px 10px' }}><span style={{ fontFamily:'JetBrains Mono,monospace', color:'#6B85C0', fontSize:10 }}>Day {t.dayNum}</span></td>
                      <td style={{ padding:'7px 10px' }}><span style={{ fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#F87171' }}>#{t.num}</span></td>
                      <td style={{ padding:'7px 10px' }}><span style={{ fontFamily:'JetBrains Mono,monospace', color:'#6B85C0', fontSize:10 }}>{t.phone||'—'}</span></td>
                      <td style={{ padding:'7px 10px' }}><span style={{ background:'rgba(59,130,246,.12)', color:'#93C5FD', padding:'2px 7px', borderRadius:6, font:'700 9px Sora,sans-serif', textTransform:'uppercase' }}>{t.bu||'—'}</span></td>
                      <td style={{ padding:'7px 10px', color:'#F0F4FF', fontWeight:600 }}>{t.category||'—'}</td>
                      <td style={{ padding:'7px 10px', color:'rgba(240,244,255,.6)', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.note||t.complaint||'—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Responsible party table ── */}
      <div style={{ background:'#111D4A', border:'1px solid #1E3070', borderRadius:12, overflow:'hidden', marginBottom:18 }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #1E3070', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ font:'700 13px Sora,sans-serif', color:'#fff', margin:0 }}>By Responsible Party</h3>
          <span style={{ font:'500 11px Sora,sans-serif', color:'#6B85C0' }}>Cumulative · {snap ? snap.days.length : dayNo} days</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ background:'#001F5C' }}>
                {['S/N','Responsible Party','Category','Today','Resolved','In Progress','Unresolved','Grand Total','% Resolution'].map(function(h) {
                  return <th key={h} style={{ padding:'10px 12px', textAlign:['S/N','Responsible Party','Category'].includes(h)?'left':'right', font:'700 9.5px Sora,sans-serif', textTransform:'uppercase', letterSpacing:'.05em', color:'rgba(255,255,255,.75)', whiteSpace:'nowrap' }}>{h}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map(function(r, i) {
                var g   = (r.res||0) + (r.prog||0) + (r.unres||0);
                var pct = g ? Math.round((r.res||0) / g * 100) : 0;
                return (
                  <tr key={r.sn} style={{ background: i%2===1 ? 'rgba(0,0,0,.2)' : 'transparent' }}>
                    <td style={{ padding:'10px 12px', fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#1D4ED8' }}>{r.sn}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <div style={{ font:'700 12px Sora,sans-serif', color:'#fff' }}>{r.name}</div>
                    </td>
                    <td style={{ padding:'10px 12px', font:'500 11px Sora,sans-serif', color:'#6B85C0' }}>{r.cat}</td>
                    <td style={{ padding:'10px 12px', textAlign:'right', fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#fff' }}>{r.today||0}</td>
                    <td style={{ padding:'10px 12px', textAlign:'right', fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#4ADE80' }}>{r.res||0}</td>
                    <td style={{ padding:'10px 12px', textAlign:'right', fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#FCD34D' }}>{r.prog||0}</td>
                    <td style={{ padding:'10px 12px', textAlign:'right', fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#F87171' }}>{r.unres||0}</td>
                    <td style={{ padding:'10px 12px', textAlign:'right', fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#93C5FD', fontSize:14 }}>{g}</td>
                    <td style={{ padding:'10px 12px', textAlign:'right' }}>
                      {g > 0 ? pctBadge(pct) : <span style={{ color:'#3A5299' }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background:'rgba(0,31,92,.6)', borderTop:'2px solid #1E3070' }}>
                <td colSpan={3} style={{ padding:'11px 12px', color:'#fff', font:'800 12px Sora,sans-serif', textAlign:'right', letterSpacing:'.08em' }}>TOTAL</td>
                <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:'JetBrains Mono,monospace', fontWeight:800, color:'#fff' }}>{totals.today}</td>
                <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:'JetBrains Mono,monospace', fontWeight:800, color:'#4ADE80' }}>{totals.res}</td>
                <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:'JetBrains Mono,monospace', fontWeight:800, color:'#FCD34D' }}>{totals.prog}</td>
                <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:'JetBrains Mono,monospace', fontWeight:800, color:'#F87171' }}>{totals.unr}</td>
                <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:'JetBrains Mono,monospace', fontWeight:800, color:'#93C5FD', fontSize:14 }}>{totals.grand}</td>
                <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:'JetBrains Mono,monospace', fontWeight:800, color:'#fff' }}>{totals.pct}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Recent Status Updates ── */}
      <div style={{ background:'#111D4A', border:'1px solid #1E3070', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #1E3070' }}>
          <h3 style={{ font:'700 13px Sora,sans-serif', color:'#fff', margin:0 }}>🕐 Recent Status Updates</h3>
        </div>
        <div style={{ padding:'10px 14px', display:'flex', flexDirection:'column', gap:6 }}>
          {(D.STATUS_UPDATES || []).map(function(u, i) {
            var dc = u.did==='resolved'?'#4ADE80':u.did==='progress'?'#FCD34D':'#F87171';
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', borderRadius:8, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.05)' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:dc, flexShrink:0, boxShadow:'0 0 6px '+dc }}/>
                <span style={{ font:'700 12px Sora,sans-serif', color:'#F0F4FF', flex:1 }}>{u.who}</span>
                <span style={{ font:'500 11px Sora,sans-serif', color:'#6B85C0' }}>marked</span>
                <span style={{ font:'700 11px Sora,sans-serif', color:dc, textTransform:'uppercase', letterSpacing:'.04em' }}>{u.did}</span>
                <span style={{ font:'500 11px JetBrains Mono,monospace', color:'#3A5299' }}>#{u.tkt}</span>
                <span style={{ font:'500 11px Sora,sans-serif', color:'#6B85C0' }}>{u.cat}</span>
                <span style={{ marginLeft:'auto', font:'500 10px JetBrains Mono,monospace', color:'#3A5299' }}>{u.t} WAT</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

Object.assign(window, { Dashboard });
