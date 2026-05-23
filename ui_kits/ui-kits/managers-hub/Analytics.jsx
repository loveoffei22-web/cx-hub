// Analytics screen — bar charts, daily volume trend, status distribution.

const Analytics = () => {
  const D = window.EK_DATA;
  const max = (rows) => Math.max(1, ...rows.map(r => r.v));
  const tot = D.RESPONSIBLE.reduce((a,r)=>a+r.grand,0);
  const res = D.RESPONSIBLE.reduce((a,r)=>a+r.res,0);
  const prog = D.RESPONSIBLE.reduce((a,r)=>a+r.prog,0);
  const unr = D.RESPONSIBLE.reduce((a,r)=>a+r.unres,0);

  const catMax = max(D.CATEGORY_VOLUME);
  const buMax = max(D.BU_VOLUME);
  const dayMax = max(D.DAILY_VOLUME);

  return (
    <div style={{padding:'22px 28px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h2 style={{font:'800 17px/1 Sora,sans-serif', color:'#fff', margin:0}}>📈 Analytics & Insights</h2>
          <p style={{font:'500 11px/1.4 Sora,sans-serif', color:'#6B85C0', margin:'3px 0 0'}}>
            Day 1–15 · {tot} complaints · Mobile App Channel
          </p>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginTop:18}}>
        <ChartCard title="Category Breakdown" sub="Complaints by category">
          <BarChart rows={D.CATEGORY_VOLUME} max={catMax} fill="bf-b"/>
        </ChartCard>
        <ChartCard title="Business Unit" sub="Complaints by BU">
          <BarChart rows={D.BU_VOLUME} max={buMax} fill="bf-b"/>
        </ChartCard>
        <ChartCard title="Daily Volume Trend" sub="Complaints per day" wide>
          <div style={{display:'flex', alignItems:'flex-end', gap:4, height:120}}>
            {D.DAILY_VOLUME.map((d,i) => (
              <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, height:'100%', justifyContent:'flex-end'}}>
                <div style={{
                  width:'100%', borderRadius:'3px 3px 0 0',
                  background:'rgba(59,130,246,.5)',
                  minHeight:3, height:`${(d.v/dayMax)*100}%`,
                }}/>
                <div style={{font:'400 8px Sora,sans-serif', fontFamily:'JetBrains Mono,monospace', color:'#6B85C0'}}>{d.label}</div>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Resolution Rate by Party" sub="% resolved">
          <BarChart rows={D.RESPONSIBLE.filter(r=>r.grand>0).map(r=>({label:r.name.split(' ')[0], v:r.pct, color:r.pct>=80?'#16A34A':r.pct>=50?'#D97706':'#DC2626'}))} max={100} suffix="%"/>
        </ChartCard>
        <ChartCard title="Status Distribution" sub="Overall breakdown">
          <StatusDist res={res} prog={prog} unr={unr} tot={tot}/>
        </ChartCard>
      </div>
    </div>
  );
};

const ChartCard = ({title, sub, children, wide}) => (
  <div style={{
    background:'#111D4A', border:'1px solid #1E3070', borderRadius:12, overflow:'hidden',
    ...(wide ? {gridColumn:'1 / -1'} : {}),
  }}>
    <div style={{padding:'13px 16px', borderBottom:'1px solid #1E3070'}}>
      <h3 style={{font:'700 13px/1.2 Sora,sans-serif', color:'#fff', margin:0}}>{title}</h3>
      <p style={{font:'500 10px/1.3 Sora,sans-serif', color:'#6B85C0', margin:'2px 0 0'}}>{sub}</p>
    </div>
    <div style={{padding:18}}>{children}</div>
  </div>
);

const BarChart = ({rows, max, suffix=''}) => (
  <div style={{display:'flex', flexDirection:'column', gap:9}}>
    {rows.map((r,i) => (
      <div key={i} style={{display:'flex', alignItems:'center', gap:9}}>
        <div style={{font:'500 11px/1 Sora,sans-serif', color:'#6B85C0', width:110, textAlign:'right', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.label}</div>
        <div style={{flex:1, background:'rgba(255,255,255,.06)', borderRadius:4, height:18}}>
          <div style={{
            height:18, borderRadius:4, transition:'width .6s',
            background: r.color || 'linear-gradient(90deg,#1D4ED8,#60A5FA)',
            width:`${(r.v/max)*100}%`,
          }}/>
        </div>
        <Mono style={{fontSize:11, color:'#6B85C0', width:36, textAlign:'right'}}>{r.v}{suffix}</Mono>
      </div>
    ))}
  </div>
);

const StatusDist = ({res, prog, unr, tot}) => {
  const items = [
    {label:'Resolved',   v:res,  color:'#4ADE80', bg:'rgba(22,163,74,.15)'},
    {label:'In Progress',v:prog, color:'#FCD34D', bg:'rgba(217,119,6,.15)'},
    {label:'Unresolved', v:unr,  color:'#F87171', bg:'rgba(220,38,38,.15)'},
  ];
  return (
    <div style={{display:'flex', flexDirection:'column', gap:10}}>
      {items.map(it => (
        <div key={it.label} style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'11px 14px', background:it.bg, borderRadius:8,
        }}>
          <div style={{flex:1, font:'600 12px/1.2 Sora,sans-serif', color:it.color}}>{it.label}</div>
          <Mono style={{fontWeight:800, fontSize:18, color:it.color}}>{it.v}</Mono>
          <Mono style={{fontSize:11, color:it.color, opacity:.7}}>{Math.round(it.v/tot*100)}%</Mono>
        </div>
      ))}
    </div>
  );
};

Object.assign(window, {Analytics});
