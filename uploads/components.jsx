// Small reusable atoms used across screens. Sora + JetBrains Mono.

const Pill = ({color='#3B82F6', tint, border, children, style={}}) => {
  const bg = tint || `rgba(59,130,246,.10)`;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'2px 8px', borderRadius:10,
      font:'700 10px/1 Sora,sans-serif', textTransform:'uppercase',
      letterSpacing:'.04em', color, background:bg,
      ...(border ? {border:`1px solid ${border}`} : {}),
      ...style,
    }}>{children}</span>
  );
};

const STATUS_STYLES_MH = {
  resolved:   {color:'#4ADE80', tint:'rgba(22,163,74,.15)'},
  progress:   {color:'#FCD34D', tint:'rgba(217,119,6,.15)'},
  unresolved: {color:'#F87171', tint:'rgba(220,38,38,.15)'},
};
const STATUS_LABELS_MH = {resolved:'RESOLVED', progress:'IN PROGRESS', unresolved:'UNRESOLVED'};
const STATUS_GLYPH_MH  = {resolved:'✅', progress:'⏳', unresolved:'🔴'};

const StatusBadge = ({s}) => {
  const sty = STATUS_STYLES_MH[s] || STATUS_STYLES_MH.progress;
  return <Pill color={sty.color} tint={sty.tint}>{STATUS_LABELS_MH[s]}</Pill>;
};

const BuPill = ({bu}) => (
  <Pill color="#93C5FD" tint="rgba(59,130,246,.10)">{bu}</Pill>
);

const Mono = ({children, style={}}) => (
  <span style={{fontFamily:'JetBrains Mono,monospace', ...style}}>{children}</span>
);

const KpiTile = ({label, value, sub, stripe='#3B82F6', valueColor='#fff'}) => (
  <div style={{
    background:'rgba(255,255,255,.06)',
    border:'1px solid rgba(255,255,255,.1)',
    borderRadius:10, padding:'14px 16px',
    position:'relative', overflow:'hidden',
  }}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:stripe}}/>
    <div style={{
      font:'700 9px/1 Sora,sans-serif', textTransform:'uppercase',
      letterSpacing:'.08em', color:'rgba(255,255,255,.4)', marginBottom:6,
    }}>{label}</div>
    <Mono style={{fontWeight:800, fontSize:28, color:valueColor}}>{value}</Mono>
    {sub && <div style={{font:'500 10px/1.3 Sora,sans-serif', color:'rgba(255,255,255,.3)', marginTop:3}}>{sub}</div>}
  </div>
);

// Smaller report-kpi (4-up). Used in Daily and Cumulative screens.
const ReportKpi = ({label, value, stripe}) => (
  <div style={{
    background:'#111D4A', border:'1px solid #1E3070', borderRadius:10,
    padding:'13px 15px', borderTop:`3px solid ${stripe}`,
  }}>
    <div style={{font:'700 9px/1 Sora,sans-serif', textTransform:'uppercase', letterSpacing:'.08em', color:'#6B85C0', marginBottom:5}}>{label}</div>
    <Mono style={{fontWeight:800, fontSize:26, color:'#fff'}}>{value}</Mono>
  </div>
);

// Card frame for dashboard sections
const Card = ({title, right, children, span1=false}) => (
  <div style={{
    background:'#111D4A', border:'1px solid #1E3070', borderRadius:12,
    overflow:'hidden',
    ...(span1 ? {gridColumn:'1 / -1'} : {}),
  }}>
    <div style={{padding:'13px 16px', borderBottom:'1px solid #1E3070', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <h3 style={{font:'700 13px/1.2 Sora,sans-serif', color:'#fff', margin:0}}>{title}</h3>
      {right && <span style={{font:'500 11px/1.2 Sora,sans-serif', color:'#6B85C0'}}>{right}</span>}
    </div>
    <div style={{padding:'14px 16px'}}>{children}</div>
  </div>
);

const SectionH = ({children}) => (
  <div style={{padding:'22px 28px 0'}}>
    <h2 style={{font:'800 17px/1 Sora,sans-serif', color:'#fff', margin:0}}>{children}</h2>
  </div>
);

const Toolbar = ({children, style={}}) => (
  <div style={{padding:'14px 28px 6px', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', ...style}}>{children}</div>
);

Object.assign(window, {
  Pill, StatusBadge, BuPill, Mono, KpiTile, ReportKpi, Card, SectionH, Toolbar,
});
