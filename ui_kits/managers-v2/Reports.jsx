// Reports screen v2 — functional slot reports + GM Report + All Days

// ─── Shared report helpers ───────────────────────────────────────────────
const fmtDate = (dayNum) => {
  const d = new Date(Date.UTC(2026, 4, dayNum));
  return d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
};
const allTickets = () => {
  const D = window.EK_DATA;
  if (D.REAL_DAY_LIST) return D.REAL_DAY_LIST.flatMap(d => (d.tickets||[]).map(t=>({...t,day:d.day})));
  return D.DAY_LIST.flatMap(d => D.SAMPLE_TICKETS_BASE.map(t=>({...t,day:d.day})));
};
const ticketsForDay = (day) => {
  const D = window.EK_DATA;
  const rd = D.REAL_DAY_LIST && D.REAL_DAY_LIST.find(d=>d.day===day);
  return rd ? rd.tickets : D.SAMPLE_TICKETS_BASE;
};
const ticketsForSlot = (day, slotId) => {
  const tix = ticketsForDay(day);
  const slotHours = {
    '9am':[8,10],'12pm':[11,13],'mid':[13,15],'cob':[15,18],
  };
  const [hStart,hEnd] = slotHours[slotId]||[0,24];
  return tix.filter(t => {
    const m = (t.time||'').match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return true;
    let h = parseInt(m[1]); const pm = m[3].toUpperCase()==='PM';
    if (pm && h!==12) h+=12; if (!pm && h===12) h=0;
    return h>=hStart && h<hEnd;
  });
};
const SLOT_DEFS = [
  {id:'9am',  label:'9AM Handover',  emoji:'☀️',  color:'#FFC72C', hRange:'09:00–10:00'},
  {id:'12pm', label:'12PM Update',   emoji:'🕛',  color:'#60A5FA', hRange:'12:00–13:00'},
  {id:'mid',  label:'1–2PM Midday', emoji:'🌤️', color:'#22C55E', hRange:'13:00–14:00'},
  {id:'cob',  label:'4–5PM COB',    emoji:'🌆',  color:'#C4B5FD', hRange:'16:00–17:00'},
];

// ─── Slot Report Modal ───────────────────────────────────────────────────
const SlotReportModal = ({slot, day=15, onClose}) => {
  const D = window.EK_DATA;
  const tix = ticketsForSlot(day, slot.id);
  const res = tix.filter(t=>t.status==='resolved');
  const prg = tix.filter(t=>t.status==='progress');
  const unr = tix.filter(t=>t.status==='unresolved');
  const dateStr = fmtDate(day);

  const getStatusIcon = (s) => s==='resolved'?'✅':s==='progress'?'⏳':'🔴';

  // Generate WhatsApp-formatted plain text
  const makeText = () => {
    const lines = [
      `*EKEDP POWER APP — ${slot.emoji} ${slot.label.toUpperCase()}*`,
      `*${dateStr} · Day ${day} of Ops*`,
      `_EKEDP Customer Experience · Marina HQ_`,
      ``,
      `*📊 Summary*`,
      `Total: ${tix.length}  |  ✅ Resolved: ${res.length}  |  ⏳ In Progress: ${prg.length}  |  🔴 Unresolved: ${unr.length}`,
      ``,
    ];
    if (res.length) {
      lines.push(`*✅ RESOLVED (${res.length})*`);
      res.forEach(t=>lines.push(`• #${t.num} — ${t.category||t.cat||'General'} — ${t.bu} — ${t.note||t.resolutionNote||''}`));
      lines.push('');
    }
    if (prg.length) {
      lines.push(`*⏳ IN PROGRESS (${prg.length})*`);
      prg.forEach(t=>lines.push(`• #${t.num} — ${t.category||t.cat||'General'} — ${t.bu} — ${t.note||''}`));
      lines.push('');
    }
    if (unr.length) {
      lines.push(`*🔴 UNRESOLVED (${unr.length})*`);
      unr.forEach(t=>lines.push(`• #${t.num} — ${t.category||t.cat||'General'} — ${t.bu} — ${t.note||''}`));
      lines.push('');
    }
    lines.push(`_EKEDP Power App · Managers Hub · ${new Date().toLocaleTimeString('en-GB',{timeZone:'Africa/Lagos',hour:'2-digit',minute:'2-digit'})} WAT_`);
    return lines.join('\n');
  };

  const [copied, setCopied] = React.useState(false);
  const doCopy = () => {
    navigator.clipboard?.writeText(makeText());
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const StatusRow = ({label, color, items}) => items.length===0 ? null : (
    <div style={{marginBottom:16}}>
      <div style={{font:'800 11px/1 Sora,sans-serif',color,textTransform:'uppercase',letterSpacing:'.12em',marginBottom:8,padding:'6px 12px',background:`${color}18`,borderRadius:6,display:'inline-flex',alignItems:'center',gap:7}}>
        {label} ({items.length})
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        {items.map(t=>(
          <div key={t.num||t.id} style={{display:'flex',gap:10,padding:'9px 12px',background:'rgba(0,0,0,.22)',borderRadius:8,border:`1px solid ${color}25`,alignItems:'flex-start'}}>
            <span className="mono" style={{font:'700 11px/1 JetBrains Mono,monospace',color,flexShrink:0,marginTop:2}}>#{t.num}</span>
            <div style={{flex:1,minWidth:0}}>
              <span style={{font:'600 11.5px/1.2 Sora,sans-serif',color:'var(--text)'}}>{t.category||t.cat||'—'}</span>
              <span style={{margin:'0 6px',color:'var(--sub)'}}>·</span>
              <span style={{font:'500 11px/1.2 Sora,sans-serif',color:'var(--muted)'}}>{t.subcategory||t.sub||''}</span>
            </div>
            <span style={{font:'700 10px/1 Sora,sans-serif',padding:'2px 7px',borderRadius:5,background:'rgba(96,165,250,.10)',color:'#BFDBFE',whiteSpace:'nowrap',flexShrink:0}}>{t.bu}</span>
            {t.note && <span style={{font:'500 10px/1.2 Sora,sans-serif',color:'var(--muted)',maxWidth:160,flexShrink:0}}>{t.note}</span>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',alignItems:'flex-start',justifyContent:'flex-end',background:'rgba(0,0,0,.6)',backdropFilter:'blur(6px)'}} onClick={onClose}>
      <div style={{width:680,height:'100%',background:'var(--bg-2)',borderLeft:'1px solid var(--border)',display:'flex',flexDirection:'column',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border-soft)',display:'flex',alignItems:'center',gap:14,background:'rgba(0,0,0,.28)',flexShrink:0}}>
          <div style={{width:44,height:44,borderRadius:10,background:`${slot.color}22`,border:`1px solid ${slot.color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>
            {slot.emoji}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{font:'800 16px/1.1 Sora,sans-serif',color:'#fff'}}>{slot.label}</div>
            <div style={{font:'500 11px/1.2 Sora,sans-serif',color:'var(--muted)',marginTop:3}}>Day {day} · {dateStr} · {slot.hRange} WAT</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn sm" onClick={doCopy} style={{borderColor:slot.color,color:slot.color}}>{copied?'✓ Copied!':'📋 Copy WhatsApp'}</button>
            <button className="btn sm" onClick={()=>window.print()}>🖨 Print</button>
            <button className="btn sm icon" onClick={onClose}>✕</button>
          </div>
        </div>
        {/* KPI strip */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,borderBottom:'1px solid var(--border-soft)',flexShrink:0}}>
          {[['Total',tix.length,'var(--info-bright)'],[' Resolved',res.length,'var(--ok-bright)'],['In Progress',prg.length,'var(--warn-bright)'],['Unresolved',unr.length,'var(--bad-bright)']].map(([l,v,c])=>(
            <div key={l} style={{padding:'14px 18px',borderRight:'1px solid var(--border-soft)',textAlign:'center'}}>
              <div className="mono" style={{font:'800 28px/1 JetBrains Mono,monospace',color:c}}>{v}</div>
              <div style={{font:'700 9px/1 Sora,sans-serif',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.10em',marginTop:5}}>{l}</div>
            </div>
          ))}
        </div>
        {/* Body */}
        <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
          <StatusRow label="✅ Resolved"   color="var(--ok)"   items={res}/>
          <StatusRow label="⏳ In Progress" color="var(--warn)" items={prg}/>
          <StatusRow label="🔴 Unresolved" color="var(--bad)"  items={unr}/>
          {tix.length===0 && <div style={{textAlign:'center',padding:60,color:'var(--muted)',font:'500 13px Sora,sans-serif'}}>No tickets in this time window. Export will show empty slots.</div>}
        </div>
        {/* Footer */}
        <div style={{padding:'14px 24px',borderTop:'1px solid var(--border-soft)',font:'500 10.5px/1.4 Sora,sans-serif',color:'var(--sub)',flexShrink:0,background:'rgba(0,0,0,.2)'}}>
          EKEDP Power App · Managers Hub · Generated {new Date().toLocaleString('en-GB',{timeZone:'Africa/Lagos'})} WAT
        </div>
      </div>
    </div>
  );
};

// ─── GM Report Modal ────────────────────────────────────────────────────
const GMReportModal = ({onClose}) => {
  const D = window.EK_DATA;
  const CUM = D.REAL_CUM_DATA || D.RESPONSIBLE;
  const all  = CUM.reduce((a,r)=>a+r.grand,0);
  const res  = CUM.reduce((a,r)=>a+r.res,0);
  const prog = CUM.reduce((a,r)=>a+r.prog,0);
  const unr  = CUM.reduce((a,r)=>a+r.unres,0);
  const rate = all>0 ? Math.round(res/all*100) : 0;
  const today = CUM.reduce((a,r)=>a+(r.today||0),0);
  const [copied, setCopied] = React.useState(false);

  const makeEmail = () => {
    const lines = [
      `EKEDP POWER APP — MANAGERS' HUB REPORT`,
      `Day 1–15 | 1 May – 15 May 2026`,
      `EKEDP Customer Experience · Marina HQ`,
      ``,
      `SUMMARY`,
      `─────────────────────────────`,
      `Total Complaints:   ${all}`,
      `Resolved:           ${res} (${rate}%)`,
      `In Progress:        ${prog}`,
      `Unresolved:         ${unr}`,
      `Today (Day 15):     ${today}`,
      ``,
      `RESOLUTION BY RESPONSIBLE PARTY`,
      `─────────────────────────────`,
      ...CUM.filter(r=>r.grand>0).map(r =>
        `${String(r.sn).padStart(2,'0')}. ${r.name.padEnd(28)} ${String(r.grand).padStart(3)} total | ${String(r.res).padStart(3)} resolved | ${r.pct}%`
      ),
      ``,
      `─────────────────────────────`,
      `This report was generated by EKEDP Power App · Managers Hub`,
      `Generated: ${new Date().toLocaleString('en-GB',{timeZone:'Africa/Lagos'})} WAT`,
    ];
    return lines.join('\n');
  };

  const doCopy = () => {
    navigator.clipboard?.writeText(makeEmail());
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',alignItems:'flex-start',justifyContent:'flex-end',background:'rgba(0,0,0,.6)',backdropFilter:'blur(6px)'}} onClick={onClose}>
      <div style={{width:680,height:'100%',background:'var(--bg-2)',borderLeft:'1px solid var(--border)',display:'flex',flexDirection:'column',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border-soft)',display:'flex',alignItems:'center',gap:14,background:'rgba(0,0,0,.28)',flexShrink:0}}>
          <div style={{width:44,height:44,borderRadius:10,background:'rgba(227,6,19,.14)',border:'1px solid rgba(227,6,19,.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>📊</div>
          <div style={{flex:1}}>
            <div style={{font:'800 16px/1.1 Sora,sans-serif',color:'#fff'}}>GM Report</div>
            <div style={{font:'500 11px Sora,sans-serif',color:'var(--muted)',marginTop:3}}>Day 1–15 · 1 May – 15 May 2026 · Cumulative roll-up</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn sm" onClick={doCopy} style={{borderColor:'#FFC72C',color:'#FFC72C'}}>{copied?'✓ Copied!':'📧 Copy Email'}</button>
            <button className="btn sm" onClick={()=>window.print()}>🖨 Print</button>
            <button className="btn sm icon" onClick={onClose}>✕</button>
          </div>
        </div>
        {/* KPI 5-up */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',borderBottom:'1px solid var(--border-soft)',flexShrink:0}}>
          {[['Total',all,'var(--info-bright)'],['Resolved',res,'var(--ok-bright)'],['In Progress',prog,'var(--warn-bright)'],['Unresolved',unr,'var(--bad-bright)'],['Today',today,'var(--violet-bright)']].map(([l,v,c])=>(
            <div key={l} style={{padding:'14px 16px',borderRight:'1px solid var(--border-soft)',textAlign:'center'}}>
              <div className="mono" style={{font:'800 26px/1 JetBrains Mono,monospace',color:c}}>{v}</div>
              <div style={{font:'700 8.5px/1 Sora,sans-serif',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.10em',marginTop:5}}>{l}</div>
            </div>
          ))}
        </div>
        {/* Party table */}
        <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
          <div style={{font:'700 11px/1 Sora,sans-serif',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.12em',marginBottom:14}}>Resolution by Responsible Party</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {CUM.map(r=>(
              <div key={r.sn} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',background:'rgba(0,0,0,.22)',borderRadius:10,border:'1px solid var(--border-soft)'}}>
                <span className="mono" style={{font:'700 10px/1 JetBrains Mono,monospace',color:'var(--sub)',width:18,textAlign:'right'}}>{r.sn}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{font:'600 12px/1.1 Sora,sans-serif',color:'var(--text)'}}>{r.name}</div>
                  <div style={{font:'500 10px/1 Sora,sans-serif',color:'var(--muted)',marginTop:2}}>{r.cat||'—'}</div>
                </div>
                {r.grand>0 ? (
                  <>
                    <span className="mono" style={{font:'700 11px/1 JetBrains Mono,monospace',color:'var(--ok-bright)',width:28,textAlign:'right'}}>{r.res}</span>
                    <span className="mono" style={{font:'700 11px/1 JetBrains Mono,monospace',color:'var(--warn-bright)',width:28,textAlign:'right'}}>{r.prog}</span>
                    <span className="mono" style={{font:'700 11px/1 JetBrains Mono,monospace',color:'var(--bad-bright)',width:28,textAlign:'right'}}>{r.unres}</span>
                    <span className="mono" style={{font:'800 13px/1 JetBrains Mono,monospace',color:'var(--info-bright)',width:32,textAlign:'right'}}>{r.grand}</span>
                    <span style={{
                      display:'inline-flex',padding:'3px 8px',borderRadius:20,
                      font:'800 11px/1 JetBrains Mono,monospace',
                      background:r.pct>=80?'var(--ok-tint)':r.pct>=50?'var(--warn-tint)':'var(--bad-tint)',
                      color:r.pct>=80?'var(--ok-bright)':r.pct>=50?'var(--warn-bright)':'var(--bad-bright)',
                      width:48, justifyContent:'center',
                    }}>{r.pct}%</span>
                  </>
                ) : (
                  <span style={{font:'500 11px Sora,sans-serif',color:'var(--sub)',marginLeft:'auto'}}>No tickets</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:'14px 24px',borderTop:'1px solid var(--border-soft)',font:'500 10.5px/1.4 Sora,sans-serif',color:'var(--sub)',flexShrink:0,background:'rgba(0,0,0,.2)'}}>
          EKEDP Power App · Managers Hub · Generated {new Date().toLocaleString('en-GB',{timeZone:'Africa/Lagos'})} WAT
        </div>
      </div>
    </div>
  );
};

// ─── Reports landing ────────────────────────────────────────────────────
const ReportsScreen = () => {
  const [modal, setModal] = React.useState(null);
  const [activeDay, setActiveDay] = React.useState(15);
  const D = window.EK_DATA;

  return (
    <div style={{padding:'24px 28px'}}>
      <div style={{marginBottom:22}}>
        <h2 className="h-section">📤 Reports</h2>
        <p style={{font:'500 12px/1.5 Sora,sans-serif',color:'var(--muted)',marginTop:5}}>
          Printable & exportable reports — copy as email, WhatsApp, or print to PDF.
        </p>
      </div>

      {/* Day selector for slot reports */}
      <div style={{marginBottom:20}}>
        <div className="eyebrow" style={{marginBottom:10}}>Select Day for Slot Reports</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {(D.REAL_DAY_LIST||D.DAY_LIST).slice().reverse().slice(0,10).map(d=>(
            <button key={d.day} onClick={()=>setActiveDay(d.day)} style={{
              padding:'6px 12px',borderRadius:8,border:'1px solid',cursor:'pointer',
              borderColor:d.day===activeDay?'var(--ek-gold)':'var(--border)',
              background:d.day===activeDay?'rgba(255,199,44,.14)':'rgba(0,0,0,.2)',
              color:d.day===activeDay?'var(--ek-gold)':'var(--text-2)',
              font:'700 11px Sora,sans-serif',transition:'all .15s',
            }}>
              Day {d.day}
              <span className="mono" style={{marginLeft:6,font:'600 10px JetBrains Mono,monospace',color:'var(--sub)'}}>({d.count||'—'})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slot reports */}
      <div className="eyebrow" style={{marginBottom:10}}>Slot Reports — Day {activeDay} · {fmtDate(activeDay)}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {SLOT_DEFS.map(s => {
          const tix = ticketsForSlot(activeDay, s.id);
          const res = tix.filter(t=>t.status==='resolved').length;
          const unr = tix.filter(t=>t.status==='unresolved').length;
          return (
            <div key={s.id} className="card" style={{cursor:'pointer',transition:'transform .15s,border-color .15s'}}
              onClick={()=>setModal({type:'slot',slot:s,day:activeDay})}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor=s.color;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor='var(--border)';}}>
              <div style={{height:3,background:s.color,boxShadow:`0 0 10px ${s.color}55`}}/>
              <div style={{padding:'16px'}}>
                <div style={{fontSize:28,marginBottom:10}}>{s.emoji}</div>
                <div style={{font:'800 14px/1.2 Sora,sans-serif',color:'#fff',marginBottom:4}}>{s.label}</div>
                <div style={{font:'500 10.5px/1.3 Sora,sans-serif',color:'var(--muted)',marginBottom:12}}>{s.hRange} WAT</div>
                <div style={{display:'flex',gap:8,marginBottom:14}}>
                  <span className="pill res">{res} resolved</span>
                  {unr>0 && <span className="pill unr">{unr} unresolved</span>}
                </div>
                <div style={{font:'800 11px/1 Sora,sans-serif',color:s.color,display:'flex',alignItems:'center',gap:5}}>
                  Open & copy →
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GM + All Days */}
      <div className="eyebrow" style={{marginBottom:10}}>Cumulative Reports</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
        <div className="card" style={{cursor:'pointer',transition:'transform .15s,border-color .15s'}}
          onClick={()=>setModal({type:'gm'})}
          onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='var(--ek-gold)';}}
          onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor='var(--border)';}}>
          <div style={{height:3,background:'linear-gradient(90deg,var(--ek-gold),var(--ek-gold-deep))'}}/>
          <div style={{padding:'18px 20px',display:'flex',alignItems:'center',gap:16}}>
            <div style={{fontSize:36}}>📊</div>
            <div>
              <div style={{font:'800 15px/1.2 Sora,sans-serif',color:'#fff'}}>GM Report</div>
              <div style={{font:'500 11.5px/1.4 Sora,sans-serif',color:'var(--muted)',marginTop:3}}>Cumulative KPIs + party resolution table. Copy as email or print to PDF.</div>
              <div style={{marginTop:10,display:'flex',gap:6,flexWrap:'wrap'}}>
                <span style={{font:'700 9.5px/1 Sora,sans-serif',padding:'3px 8px',borderRadius:6,background:'rgba(255,255,255,.06)',color:'var(--info-bright)',border:'1px solid var(--border)'}}>GM</span>
                <span style={{font:'700 9.5px/1 Sora,sans-serif',padding:'3px 8px',borderRadius:6,background:'rgba(255,255,255,.06)',color:'var(--info-bright)',border:'1px solid var(--border)'}}>Email</span>
                <span style={{font:'700 9.5px/1 Sora,sans-serif',padding:'3px 8px',borderRadius:6,background:'rgba(255,255,255,.06)',color:'var(--info-bright)',border:'1px solid var(--border)'}}>PDF</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{cursor:'pointer',transition:'transform .15s,border-color .15s'}}
          onClick={()=>setModal({type:'alldays'})}
          onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='var(--info)';}}
          onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor='var(--border)';}}>
          <div style={{height:3,background:'linear-gradient(90deg,var(--info),var(--info-bright))'}}/>
          <div style={{padding:'18px 20px',display:'flex',alignItems:'center',gap:16}}>
            <div style={{fontSize:36}}>📚</div>
            <div>
              <div style={{font:'800 15px/1.2 Sora,sans-serif',color:'#fff'}}>All Days Report</div>
              <div style={{font:'500 11.5px/1.4 Sora,sans-serif',color:'var(--muted)',marginTop:3}}>Full period roll-up — all 15 days. Day-by-day ticket log + summary.</div>
              <div style={{marginTop:10,display:'flex',gap:6,flexWrap:'wrap'}}>
                <span style={{font:'700 9.5px/1 Sora,sans-serif',padding:'3px 8px',borderRadius:6,background:'rgba(255,255,255,.06)',color:'var(--info-bright)',border:'1px solid var(--border)'}}>All Days</span>
                <span style={{font:'700 9.5px/1 Sora,sans-serif',padding:'3px 8px',borderRadius:6,background:'rgba(255,255,255,.06)',color:'var(--info-bright)',border:'1px solid var(--border)'}}>PDF</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal?.type==='slot' && <SlotReportModal slot={modal.slot} day={modal.day} onClose={()=>setModal(null)}/>}
      {modal?.type==='gm' && <GMReportModal onClose={()=>setModal(null)}/>}
    </div>
  );
};

Object.assign(window, {ReportsScreen});
