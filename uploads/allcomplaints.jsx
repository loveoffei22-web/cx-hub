// All Complaints — filters + scrollable table.

const AllComplaints = () => {
  const D = window.EK_DATA;
  // Expand the base sample tickets across some days for richer fake data
  const tickets = [];
  D.DAY_LIST.forEach(d => {
    D.SAMPLE_TICKETS_BASE.forEach(t => {
      tickets.push({...t, day:d.day});
    });
  });

  const [q, setQ] = React.useState('');
  const [stat, setStat] = React.useState('');
  const [bu, setBu] = React.useState('');
  const [cat, setCat] = React.useState('');

  let filtered = tickets;
  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(t => Object.values(t).some(v => String(v).toLowerCase().includes(lower)));
  }
  if (stat) filtered = filtered.filter(t => t.status === stat);
  if (bu)   filtered = filtered.filter(t => t.bu === bu);
  if (cat)  filtered = filtered.filter(t => t.cat === cat);

  return (
    <div style={{padding:'22px 28px'}}>
      <div style={{marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12}}>
        <div>
          <h2 style={{font:'800 17px/1 Sora,sans-serif', color:'#fff', margin:0}}>📨 All Complaints</h2>
          <p style={{font:'500 11px/1.4 Sora,sans-serif', color:'#6B85C0', margin:'3px 0 0'}}>
            All days · all statuses · {tickets.length} complaints
          </p>
        </div>
        <button style={{
          padding:'6px 14px', borderRadius:6, border:'1px solid #E30613',
          background:'#E30613', color:'#fff',
          font:'700 11px Sora,sans-serif', cursor:'pointer',
        }}>⬇ Export Excel</button>
      </div>

      <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:14, alignItems:'center'}}>
        <input value={q} onChange={e=>setQ(e.target.value)}
          placeholder="🔎 Search ticket # · customer · phone · category · address · BU…"
          style={{
            flex:1, minWidth:260, padding:'10px 14px',
            background:'#111D4A', color:'#F0F4FF',
            border:'1px solid #1E3070', borderRadius:10,
            fontFamily:'Sora,sans-serif', fontSize:13, outline:'none',
          }}/>
        <FilterSelect value={stat} onChange={setStat} options={[
          ['','All statuses'],['resolved','✅ Resolved'],['progress','⏳ In Progress'],['unresolved','🔴 Unresolved'],
        ]}/>
        <FilterSelect value={bu} onChange={setBu} options={[['','All BUs'], ...D.BUS.map(b=>[b,b])]}/>
        <FilterSelect value={cat} onChange={setCat} options={[['','All categories'], ...D.CATEGORIES.map(c=>[c,c])]}/>
      </div>

      <div style={{background:'#111D4A', border:'1px solid #1E3070', borderRadius:12, overflow:'hidden'}}>
        <div style={{padding:'14px 18px', borderBottom:'1px solid #1E3070', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{font:'700 13px/1.2 Sora,sans-serif', color:'#fff', margin:0}}>Tickets · {filtered.length}</h3>
          <span style={{font:'500 11px/1.2 Sora,sans-serif', color:'#6B85C0'}}>Sorted newest first</span>
        </div>
        <div style={{overflowX:'auto', maxHeight:'62vh', overflowY:'auto'}}>
          <TicketTable tickets={filtered.slice(0,40)} showDay/>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({value, onChange, options}) => (
  <select value={value} onChange={e=>onChange(e.target.value)} style={{
    padding:'10px 12px', background:'#111D4A', color:'#F0F4FF',
    border:'1px solid #1E3070', borderRadius:10,
    fontFamily:'Sora,sans-serif', fontSize:12, outline:'none', cursor:'pointer',
  }}>
    {options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

Object.assign(window, {AllComplaints});
