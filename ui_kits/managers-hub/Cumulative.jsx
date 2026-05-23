// Cumulative tracker — KPIs + per-responsible-party resolution table.

const Cumulative = () => {
  const D = window.EK_DATA;
  const tot = D.RESPONSIBLE.reduce((a,r)=>a+r.grand,0);
  const res = D.RESPONSIBLE.reduce((a,r)=>a+r.res,0);
  const prog = D.RESPONSIBLE.reduce((a,r)=>a+r.prog,0);
  const unr = D.RESPONSIBLE.reduce((a,r)=>a+r.unres,0);
  const today = D.RESPONSIBLE.reduce((a,r)=>a+r.today,0);

  return (
    <div style={{padding:'22px 28px'}}>
      <div style={{marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12}}>
        <div style={{minWidth:0}}>
          <h2 style={{font:'800 17px/1.2 Sora,sans-serif', color:'#fff', margin:0}}>📊 Cumulative Complaint Tracker</h2>
          <p style={{font:'500 11px/1.4 Sora,sans-serif', color:'#6B85C0', margin:'6px 0 0'}}>
            Day 1–15 · 1 May – 15 May 2026 · Mobile App Channel
          </p>
        </div>
        <button style={{
          padding:'6px 14px', borderRadius:6, border:'1px solid #1E3070',
          background:'rgba(255,255,255,.06)', color:'#F0F4FF',
          font:'600 11px Sora,sans-serif', cursor:'pointer',
        }}>⬇ Export Excel</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20}}>
        <ReportKpi label="Grand Total"          value={tot} stripe="#3B82F6"/>
        <ReportKpi label="Cumulative Resolved"  value={res} stripe="#16A34A"/>
        <ReportKpi label="In Progress"          value={prog} stripe="#D97706"/>
        <ReportKpi label="Unresolved"           value={unr} stripe="#DC2626"/>
      </div>

      <div style={{background:'#111D4A', border:'1px solid #1E3070', borderRadius:12, overflow:'hidden'}}>
        <div style={{padding:'14px 18px', borderBottom:'1px solid #1E3070', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{font:'700 13px/1.2 Sora,sans-serif', color:'#fff', margin:0}}>Resolution by Responsible Party</h3>
          <span style={{font:'500 11px/1.2 Sora,sans-serif', color:'#6B85C0'}}>Computed from all {tot} complaints</span>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#001F5C'}}>
              <CTh>S/N</CTh><CTh>Category</CTh><CTh>Responsible Party</CTh>
              <CTh right>Today</CTh><CTh right>Resolved</CTh>
              <CTh right>In Progress</CTh><CTh right>Unresolved</CTh>
              <CTh right>Grand Total</CTh><CTh right>% Resolution</CTh>
            </tr></thead>
            <tbody>
              {D.RESPONSIBLE.map(r => (
                <tr key={r.sn}>
                  <CTd><Mono style={{color:'#6B85C0'}}>{r.sn}</Mono></CTd>
                  <CTd><div style={{font:'500 11.5px/1.2 Sora,sans-serif', color:'#F0F4FF'}}>{r.cat||'—'}</div></CTd>
                  <CTd><div style={{fontWeight:700, color:'#F0F4FF'}}>{r.name}</div></CTd>
                  <CTd right><Mono>{r.today}</Mono></CTd>
                  <CTd right><Mono style={{color:'#4ADE80', fontWeight:700}}>{r.res}</Mono></CTd>
                  <CTd right><Mono style={{color:'#FCD34D', fontWeight:700}}>{r.prog}</Mono></CTd>
                  <CTd right><Mono style={{color:'#F87171', fontWeight:700}}>{r.unres}</Mono></CTd>
                  <CTd right><Mono style={{color:'#93C5FD', fontWeight:800, fontSize:14}}>{r.grand}</Mono></CTd>
                  <CTd right>
                    {r.grand > 0 && (
                      <span style={{
                        display:'inline-flex', padding:'3px 10px', borderRadius:20,
                        fontFamily:'JetBrains Mono,monospace', fontWeight:800, fontSize:11,
                        background: r.pct>=80?'rgba(22,163,74,.15)':r.pct>=50?'rgba(217,119,6,.15)':'rgba(220,38,38,.15)',
                        color:    r.pct>=80?'#4ADE80':r.pct>=50?'#FCD34D':'#F87171',
                      }}>{r.pct}%</span>
                    )}
                  </CTd>
                </tr>
              ))}
              <tr style={{background:'rgba(0,31,92,.5)', borderTop:'2px solid #1E3070'}}>
                <CTd><b style={{color:'#fff'}}>—</b></CTd>
                <CTd><b style={{color:'#fff'}}>All</b></CTd>
                <CTd><b style={{color:'#fff'}}>Grand Total</b></CTd>
                <CTd right><Mono style={{color:'#fff', fontWeight:800}}>{today}</Mono></CTd>
                <CTd right><Mono style={{color:'#4ADE80', fontWeight:800}}>{res}</Mono></CTd>
                <CTd right><Mono style={{color:'#FCD34D', fontWeight:800}}>{prog}</Mono></CTd>
                <CTd right><Mono style={{color:'#F87171', fontWeight:800}}>{unr}</Mono></CTd>
                <CTd right><Mono style={{color:'#93C5FD', fontWeight:800, fontSize:14}}>{tot}</Mono></CTd>
                <CTd right><Mono style={{color:'#fff', fontWeight:800}}>{Math.round(res/tot*100)}%</Mono></CTd>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CTh = ({children, right}) => (
  <th style={{
    padding:'10px 13px', textAlign: right?'right':'left',
    font:'700 9px/1 Sora,sans-serif', textTransform:'uppercase',
    letterSpacing:'.06em', color:'rgba(255,255,255,.45)', whiteSpace:'nowrap',
  }}>{children}</th>
);
const CTd = ({children, right}) => (
  <td style={{
    padding:'11px 13px', borderBottom:'1px solid #1E3070',
    fontSize:12, textAlign: right?'right':'left',
    fontFamily: right?'JetBrains Mono,monospace':'Sora,sans-serif',
    color:'#F0F4FF',
  }}>{children}</td>
);

Object.assign(window, {Cumulative});
