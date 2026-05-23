// Managers Hub — Reports tab. Direct links to each printable report
// (open in new tab so they get full real-estate for printing).

const REPORTS = [
  {
    href:'../../reports/gm_report.html',
    emoji:'📊',
    title:'GM Report',
    sub:'9 AM · 12 PM · 4 PM',
    desc:'Cumulative roll-up by Responsible Party with KPI cards. Email body, Excel, or PDF.',
    tags:['GM','Email','Excel','PDF'],
    accent:'#E30613',
  },
  {
    href:'../../reports/all_days_report.html',
    emoji:'📚',
    title:'All Days Report',
    sub:'Cumulative · all days',
    desc:'Same shape as GM, period-wide. KPI cards lead. Excel + PDF.',
    tags:['GM','Excel','PDF'],
    accent:'#1D4ED8',
  },
  {
    href:'../../reports/slot_report.html',
    emoji:'🌤️',
    title:'Slot Reports — Midday & COB',
    sub:'For the WhatsApp group',
    desc:'Per-ticket breakdown with address, phone, meter, age badges. Resolved / In Progress / Unresolved.',
    tags:['WhatsApp','Print','PDF'],
    accent:'#16A34A',
  },
  {
    href:'../../reports/index.html',
    emoji:'📋',
    title:'Reports landing',
    sub:'Browse all',
    desc:'Full reports index with conventions key, age badges legend, status colours.',
    tags:['Browse'],
    accent:'#FFC72C',
  },
];

const ReportsScreen = () => {
  return (
    <div style={{padding:'22px 28px'}}>
      <div style={{marginBottom:18}}>
        <h2 style={{font:'800 17px/1.2 Sora,sans-serif', color:'#fff', margin:0}}>📤 Reports</h2>
        <p style={{font:'500 11.5px/1.4 Sora,sans-serif', color:'#6B85C0', margin:'4px 0 0'}}>
          Printable & exportable reports for the GM, the team, and the WhatsApp group.
        </p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:14, marginBottom:20}}>
        {REPORTS.map(r => (
          <a key={r.href} href={r.href} target="_blank" rel="noopener" style={{
            display:'flex', flexDirection:'column', gap:10,
            background:'#111D4A', border:'1px solid #1E3070', borderRadius:12,
            padding:'16px 18px', textDecoration:'none', color:'#F0F4FF',
            transition:'all .15s', position:'relative', overflow:'hidden',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = r.accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E3070'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{position:'absolute', top:0, left:0, right:0, height:3, background: r.accent}}/>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div style={{fontSize:32, lineHeight:1}}>{r.emoji}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{font:'800 15px/1.2 Sora,sans-serif', color:'#fff'}}>{r.title}</div>
                <div style={{font:'500 11px/1.3 Sora,sans-serif', color:'#6B85C0', marginTop:3}}>{r.sub}</div>
              </div>
            </div>
            <p style={{font:'500 12px/1.5 Sora,sans-serif', color:'rgba(240,244,255,.75)', margin:0}}>{r.desc}</p>
            <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:4}}>
              {r.tags.map(t => (
                <span key={t} style={{
                  font:'700 9.5px/1 Sora,sans-serif', padding:'3px 8px', borderRadius:6,
                  textTransform:'uppercase', letterSpacing:'.04em',
                  background:'rgba(255,255,255,.06)', color:'#93C5FD', border:'1px solid #1E3070',
                }}>{t}</span>
              ))}
            </div>
            <div style={{font:'800 11px/1 Sora,sans-serif', color: r.accent, marginTop:6, display:'flex', alignItems:'center', gap:5}}>
              Open in new tab →
            </div>
          </a>
        ))}
      </div>

      <div style={{
        background:'rgba(59,130,246,.06)', border:'1px dashed rgba(59,130,246,.25)',
        borderRadius:10, padding:'14px 16px',
        display:'flex', alignItems:'flex-start', gap:12,
      }}>
        <span style={{fontSize:22}}>💡</span>
        <div style={{font:'500 12px/1.55 Sora,sans-serif', color:'rgba(240,244,255,.80)'}}>
          Each report opens in a new tab so you can size it for printing. Use <b style={{color:'#fff'}}>Print → Save as PDF</b> for the WhatsApp slot reports,
          <b style={{color:'#fff'}}> Copy as Email</b> for the GM report (paste straight into Outlook),
          or <b style={{color:'#fff'}}>Export to Excel</b> when you need to attach the workbook.
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {ReportsScreen});
