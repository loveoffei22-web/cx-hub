// Daily Report — left inner sidebar (actions + day list) + ticket table.

const DailyReport = () => {
  const D = window.EK_DATA;
  const [activeDay, setActiveDay] = React.useState(15);
  const tickets = D.SAMPLE_TICKETS_BASE;

  const counts = tickets.reduce((acc,t)=>{acc[t.status]=(acc[t.status]||0)+1; acc.tot=(acc.tot||0)+1; return acc;}, {});

  return (
    <div style={{display:'flex', minHeight:'calc(100vh)'}}>
      {/* Inner sidebar */}
      <aside style={{
        width:210, minWidth:210, background:'#0D1B45', borderRight:'1px solid #1E3070',
        padding:'14px 10px', position:'sticky', top:0, height:'100vh', overflowY:'auto',
      }}>
        <SbSection label="Actions">
          <SbBtn>⬇ Export Excel (4 sheets)</SbBtn>
          <SbBtn>⟳ Refresh / Sync</SbBtn>
          <SbBtn>📂 Import Snapshot</SbBtn>
        </SbSection>
        <SbSection label="📤 Reports — Excel / PDF / HTML">
          <SbBtn>☀️ 9AM Handover</SbBtn>
          <SbBtn>🕛 12PM Update</SbBtn>
          <SbBtn>🌤️ 1–2PM Midday</SbBtn>
          <SbBtn>🌆 4–5PM COB</SbBtn>
        </SbSection>
        <SbSection label="Select Day">
          {D.DAY_LIST.slice().reverse().map(d => (
            <button key={d.day} onClick={()=>setActiveDay(d.day)} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'8px 10px', borderRadius:6, cursor:'pointer', fontSize:12,
              color: d.day===activeDay ? '#fff' : '#6B85C0',
              transition:'all .15s', marginBottom:2,
              background: d.day===activeDay ? 'rgba(227,6,19,.15)' : 'transparent',
              borderLeft: d.day===activeDay ? '2px solid #E30613' : '2px solid transparent',
              border:'none', width:'100%', fontFamily:'Sora,sans-serif', textAlign:'left',
            }}>
              <div>
                <div style={{fontSize:11, fontWeight:600}}>{d.dateLabel}</div>
                <Mono style={{fontSize:9, color:'#6B85C0'}}>{d.wkd}</Mono>
              </div>
              <div style={{fontSize:10, background:'rgba(255,255,255,.08)', padding:'1px 6px', borderRadius:10}}>{d.count}</div>
            </button>
          ))}
        </SbSection>
      </aside>

      {/* Main */}
      <div style={{flex:1, padding:22, overflow:'auto'}}>
        <div>
          <h2 style={{font:'800 17px/1 Sora,sans-serif', color:'#fff', margin:0}}>Day {activeDay} — 15 May 2026</h2>
          <p style={{font:'500 11px/1.4 Sora,sans-serif', color:'#6B85C0', margin:'3px 0 0'}}>
            Customer Experience · Marina HQ · Mobile App Channel
          </p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, margin:'16px 0'}}>
          <ReportKpi label="Total"       value={counts.tot||0}        stripe="#3B82F6"/>
          <ReportKpi label="Resolved"    value={counts.resolved||0}   stripe="#16A34A"/>
          <ReportKpi label="In Progress" value={counts.progress||0}   stripe="#D97706"/>
          <ReportKpi label="Unresolved"  value={counts.unresolved||0} stripe="#DC2626"/>
        </div>

        <div style={{background:'#111D4A', border:'1px solid #1E3070', borderRadius:12, overflow:'hidden'}}>
          <div style={{padding:'13px 16px', borderBottom:'1px solid #1E3070', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{font:'700 13px/1.2 Sora,sans-serif', color:'#fff', margin:0}}>Tickets</h3>
            <span style={{font:'500 11px/1.2 Sora,sans-serif', color:'#6B85C0'}}>Mobile App · All statuses</span>
          </div>
          <div style={{overflowX:'auto'}}>
            <TicketTable tickets={tickets}/>
          </div>
        </div>
      </div>
    </div>
  );
};

const SbSection = ({label, children}) => (
  <div style={{marginBottom:18}}>
    <div style={{font:'700 9px/1 Sora,sans-serif', color:'#3A5299', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:7, padding:'0 4px'}}>
      {label}
    </div>
    <div style={{display:'flex', flexDirection:'column', gap:2}}>{children}</div>
  </div>
);

const SbBtn = ({children}) => (
  <button style={{
    width:'100%', padding:9, borderRadius:8,
    border:'1px solid #1E3070', background:'rgba(255,255,255,.05)',
    color:'#F0F4FF', fontFamily:'Sora,sans-serif',
    fontSize:11, fontWeight:600, cursor:'pointer',
    transition:'all .2s', marginBottom:5,
    textAlign:'left', display:'flex', alignItems:'center', gap:7,
  }}>{children}</button>
);

const TicketTable = ({tickets, showDay=false}) => (
  <table style={{width:'100%', borderCollapse:'collapse', fontSize:11, fontFamily:'Sora,sans-serif'}}>
    <thead><tr style={{background:'rgba(0,31,92,.7)'}}>
      <Th>#</Th><Th>Ticket</Th><Th>Time</Th>{showDay&&<Th>Day</Th>}<Th>Customer</Th><Th>Phone</Th>
      <Th>BU</Th><Th>Category</Th><Th>Status</Th><Th>Note</Th>
    </tr></thead>
    <tbody>
      {tickets.map((t,i) => (
        <tr key={t.num} style={{cursor:'pointer'}}>
          <Td><Mono style={{color:'#6B85C0'}}>{String(i+1).padStart(2,'0')}</Mono></Td>
          <Td><Mono style={{fontWeight:700, color:'#93C5FD'}}>#{t.num}</Mono></Td>
          <Td>{t.time}</Td>
          {showDay && <Td><Mono style={{color:'#6B85C0'}}>Day {t.day||15}</Mono></Td>}
          <Td>{t.name}</Td>
          <Td><Mono style={{color:'#6B85C0', fontSize:10}}>{t.phone}</Mono></Td>
          <Td><BuPill bu={t.bu}/></Td>
          <Td><div>{t.cat}</div><div style={{font:'500 9.5px/1.2 Sora,sans-serif', color:'#6B85C0', marginTop:1}}>{t.sub}</div></Td>
          <Td><StatusBadge s={t.status}/></Td>
          <Td><span style={{color:'rgba(240,244,255,.7)'}}>{t.note}</span></Td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Th = ({children}) => (
  <th style={{padding:'9px 11px', textAlign:'left', font:'700 9px/1 Sora,sans-serif', textTransform:'uppercase', letterSpacing:'.06em', color:'#6B85C0', whiteSpace:'nowrap'}}>{children}</th>
);
const Td = ({children}) => (
  <td style={{padding:'8px 11px', borderBottom:'1px solid rgba(255,255,255,.04)', verticalAlign:'top', color:'#F0F4FF'}}>{children}</td>
);

Object.assign(window, {DailyReport, TicketTable});
