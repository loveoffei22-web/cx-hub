// Log Ticket screen — same form as Agents Hub AddTicket,
// but stamps "Logged by: Love Offei (Manager)"

const LogTicket = () => {
  const empty = {
    num:'', name:'', phone:'', meter:'', addr:'',
    bu:'ISLAND', issue:'', category:'METERING / UNABLE TO LOAD',
    resp:'Holyland Umude', status:'progress', note:'',
  };
  const [form, setForm] = React.useState(empty);
  const [pasted, setPasted] = React.useState('');
  const [saved, setSaved] = React.useState(false);

  const setF = (k, v) => setForm(f => ({...f, [k]: v}));

  const tryParse = (txt) => {
    setPasted(txt);
    const phone = txt.match(/(\+?234\d{10}|0\d{10})/);
    if (phone) setF('phone', phone[0]);
    const tkt = txt.match(/\b(7\d{5})\b/);
    if (tkt) setF('num', tkt[1]);
    const meter = txt.match(/\b(\d{10,13})\b/);
    if (meter && (!tkt || meter[1] !== tkt[1])) setF('meter', meter[1]);
    setF('issue', txt.slice(0, 300));
  };

  const save = () => {
    if (!form.num || !form.name) { alert('Need at least Ticket # and Customer Name.'); return; }
    const wat = new Date(new Date().toLocaleString('en-US',{timeZone:'Africa/Lagos'}));
    const ticket = {
      ...form,
      created: wat.toISOString().slice(0,16).replace('T',' '),
      time: wat.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),
      loggedBy: 'Love Offei (Manager)',
    };
    // Persist to localStorage
    const existing = JSON.parse(localStorage.getItem('ekedp_manager_tickets')||'[]');
    existing.unshift(ticket);
    localStorage.setItem('ekedp_manager_tickets', JSON.stringify(existing));
    window.EK_MANAGER_TICKETS = existing;
    setSaved(true);
    setForm(empty); setPasted('');
    setTimeout(() => setSaved(false), 3000);
  };

  const PARTIES = window.EK_RESPONSIBLE_PARTIES || [];
  const BUS     = window.EK_BUSINESS_UNITS || ['ISLAND','IJORA','MUSHIN','AJAH','OJO','FESTAC','ORILE'];

  return (
    <div style={{padding:'22px 28px', maxWidth:1100}}>
      <div style={{marginBottom:14}}>
        <h2 style={{font:'800 17px/1.2 Sora,sans-serif', color:'var(--text)', margin:0}}>➕ Log Ticket</h2>
        <p style={{font:'500 11.5px/1.4 Sora,sans-serif', color:'var(--muted)', margin:'4px 0 0'}}>
          Paste the complaint from SharePoint — phone, meter and ticket # are auto-detected. Stamped as logged by Love Offei (Manager).
        </p>
      </div>

      {saved && (
        <div style={{
          padding:'12px 16px', borderRadius:9, marginBottom:14,
          background:'rgba(22,163,74,.15)', border:'1px solid rgba(22,163,74,.30)',
          font:'700 13px Sora,sans-serif', color:'#4ADE80',
        }}>✔ Ticket saved to manager log.</div>
      )}

      {/* Paste area */}
      <div style={{
        background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:12, padding:'14px 18px', marginBottom:16,
      }}>
        <div style={{font:'800 11px Sora,sans-serif', color:'var(--text)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.08em'}}>
          Paste complaint text from SharePoint
        </div>
        <textarea value={pasted} onChange={e=>tryParse(e.target.value)}
          placeholder="Paste the full SharePoint complaint here — phone, meter and ticket # will auto-fill..."
          style={{
            width:'100%', minHeight:80, padding:12,
            background:'var(--bg)', color:'var(--text)',
            border:'1px solid var(--border)', borderRadius:8,
            fontFamily:'JetBrains Mono,monospace', fontSize:11.5,
            outline:'none', resize:'vertical', boxSizing:'border-box', lineHeight:1.5,
          }}/>
      </div>

      {/* Form grid */}
      <div style={{
        background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:12, padding:'18px 20px', marginBottom:16,
      }}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:12}}>
          <LField label="Ticket #">
            <input value={form.num} onChange={e=>setF('num',e.target.value)} placeholder="710xxx" style={inp}/>
          </LField>
          <LField label="Customer Name">
            <input value={form.name} onChange={e=>setF('name',e.target.value)} style={inp}/>
          </LField>
          <LField label="Phone">
            <input value={form.phone} onChange={e=>setF('phone',e.target.value)} placeholder="+234..." style={inp}/>
          </LField>
          <LField label="Meter / Account #">
            <input value={form.meter} onChange={e=>setF('meter',e.target.value)} style={inp}/>
          </LField>
          <LField label="Business Unit">
            <select value={form.bu} onChange={e=>setF('bu',e.target.value)} style={inp}>
              {BUS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </LField>
          <LField label="Responsible Party">
            <select value={form.resp} onChange={e=>setF('resp',e.target.value)} style={inp}>
              {PARTIES.map(r => <option key={r.sn} value={r.name}>{r.name}</option>)}
            </select>
          </LField>
          <LField label="Address" full>
            <input value={form.addr} onChange={e=>setF('addr',e.target.value)} style={inp}/>
          </LField>
          <LField label="Issue / Complaint Description" full>
            <input value={form.issue} onChange={e=>setF('issue',e.target.value)} style={inp}/>
          </LField>
          <LField label="Action Taken / Note" full>
            <textarea value={form.note} onChange={e=>setF('note',e.target.value)}
              style={{...inp, minHeight:60, resize:'vertical'}}/>
          </LField>
        </div>

        {/* Status */}
        <div style={{marginBottom:12}}>
          <div style={{font:'700 10px Sora,sans-serif', color:'var(--muted)', letterSpacing:'.6px', textTransform:'uppercase', marginBottom:8}}>Status</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
            {[
              ['progress','⏳ In Progress','#D97706'],
              ['resolved','✅ Resolved','#16A34A'],
              ['unresolved','🔴 Unresolved','#DC2626'],
            ].map(([k,lbl,c]) => (
              <button key={k} onClick={()=>setF('status',k)} style={{
                padding:11, borderRadius:8,
                border: form.status===k ? '2px solid '+c : '2px solid var(--border)',
                background: form.status===k ? 'rgba('+hexRgb(c)+',.18)' : 'var(--bg)',
                color:'var(--text)', font:'700 12.5px Sora,sans-serif', cursor:'pointer',
              }}>{lbl}</button>
            ))}
          </div>
        </div>

        <div style={{display:'flex', gap:10}}>
          <button onClick={save} style={{
            padding:'12px 24px', background:'#E30613', color:'#fff', border:'none',
            borderRadius:10, font:'800 13px Sora,sans-serif', cursor:'pointer',
            boxShadow:'0 4px 14px rgba(227,6,19,.35)',
          }}>➕ Save ticket</button>
          <button onClick={()=>{setForm(empty); setPasted('');}} style={{
            padding:'12px 20px', background:'var(--bg)', color:'var(--muted)',
            border:'1px solid var(--border)', borderRadius:10,
            font:'700 13px Sora,sans-serif', cursor:'pointer',
          }}>Clear</button>
        </div>
      </div>
    </div>
  );
};

const LField = ({label, full, children}) => (
  <div style={{gridColumn: full ? '1 / -1' : 'auto'}}>
    <label style={{display:'block', font:'700 10px/1 Sora,sans-serif', color:'var(--muted)', letterSpacing:'.6px', textTransform:'uppercase', marginBottom:5}}>{label}</label>
    {children}
  </div>
);

// Simple hex to r,g,b string helper for rgba()
function hexRgb(h) {
  const r = parseInt(h.slice(1,3),16);
  const g = parseInt(h.slice(3,5),16);
  const b = parseInt(h.slice(5,7),16);
  return r+','+g+','+b;
}

const inp = {
  width:'100%', padding:'10px 12px',
  background:'var(--bg)', color:'var(--text)',
  border:'1px solid var(--border)', borderRadius:8,
  fontFamily:'Sora,sans-serif', fontSize:13, outline:'none', boxSizing:'border-box',
};

Object.assign(window, {LogTicket});
