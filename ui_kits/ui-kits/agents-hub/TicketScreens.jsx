// Agents Hub — MyTickets, AddTicket (multi-paste), UpdateTicket modal.

// ─── HELPERS ────────────────────────────────────────────────
const stripEmoji = (s) =>
  (s||'').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{200D}\u{20E3}]+/gu,'')
         .replace(/\s{2,}/g,' ').trim();

function cleanIssueForDisplay(raw) {
  if (!raw) return '—';
  let s = stripEmoji(raw);
  s = s.replace(/^(complaint|issue|problem|request|description|remarks?|nature of complaint)\s*:?\s*/i,'');
  s = s.replace(/\|/g,' ').trim().replace(/\n/g,' ').replace(/\s{2,}/g,' ');
  return s.length > 120 ? s.slice(0,117)+'…' : s||'—';
}

function matchBU(value) {
  const buList = window.EK_BUSINESS_UNITS || [];
  const v = stripEmoji(value).trim().toUpperCase().replace(/\s+/g,' ');
  // Exact match first
  const exact = buList.find(b => b.toUpperCase() === v);
  if (exact) return exact;
  // Partial match
  const partial = buList.find(b => v.includes(b.toUpperCase()) || b.toUpperCase().includes(v.split(' ')[0]));
  return partial || null;
}

/**
 * Parse a SINGLE complaint block (pipe-separated Mobile App format OR labelled text).
 * Returns { num, name, phone, meter, addr, bu, issue, category } — only fields found.
 */
function parseSingle(txt) {
  const result = {};

  // ── PIPE-SEPARATED FORMAT (SharePoint Mobile App) ──────────
  // e.g. "📱 NEW MOBILE APP COMPLAINT| 📅 18 May 2026| 🎫 Ticket No: 720390| ..."
  if ((txt.match(/\|/g)||[]).length > 3) {
    const segs = txt.split('|').map(s => s.trim());
    for (const seg of segs) {
      const clean = stripEmoji(seg).trim();
      const ci = clean.indexOf(':');
      if (ci < 1 || ci > 50) continue;
      const label = clean.slice(0, ci).trim().toLowerCase().replace(/\s+/g,' ');
      const val   = clean.slice(ci + 1).trim();
      if (!val || /^n\/a$/i.test(val)) continue;

      if (/ticket\s*(no\.?|number|#)?$/.test(label) || label === 'ticket no') {
        const m = val.match(/\b(7\d{5})\b/);
        if (m) result.num = m[1];
      }
      else if (/^customer/.test(label))             result.name     = stripEmoji(val);
      else if (/^phone$|^tel$|^mobile$/.test(label)) result.phone   = val.replace(/\s/g,'');
      else if (/^meter\s*(no\.?|number|#)?$/.test(label)) {
        // Only set meter if it's NOT the same as the phone
        const nums = val.match(/\d{10,13}/);
        if (nums && nums[0] !== (result.phone||'').replace(/\D/g,'')) result.meter = nums[0];
      }
      else if (/^(business\s*unit|bu)$/.test(label)) {
        const bu = matchBU(val);
        if (bu) result.bu = bu;
      }
      else if (/^address$/.test(label))     result.addr     = stripEmoji(val);
      else if (/^(description|complaint)$/.test(label)) result.issue = val;
      else if (/^category$/.test(label))    result.category = stripEmoji(val);
    }
    // Deduplicate: if meter === phone digits, clear meter
    if (result.meter && result.phone && result.meter === result.phone.replace(/\D/g,'')) {
      delete result.meter;
    }
    if (Object.keys(result).length >= 2) return result;
  }

  // ── LABEL: VALUE FORMAT (line by line) ────────────────────
  const tktM = txt.match(/(?:ticket\s*(?:no\.?|#|number)?\s*[:–-]?\s*)(7\d{5})/i)||txt.match(/\b(7\d{5})\b/);
  if (tktM) result.num = tktM[1];

  const phoneM = txt.match(/(?:phone|tel|mobile|contact)\s*[:–-]?\s*(\+?234\d{10}|0[789]\d{9})/i)
               ||txt.match(/(\+?234\d{10}|0[789]\d{9})/);
  if (phoneM) result.phone = phoneM[1];

  const meterM = txt.match(/(?:meter|account|acct)\s*(?:no\.?|number|#)?\s*[:–-]?\s*(\d{10,13})/i);
  if (meterM && meterM[1] !== (result.phone||'').replace(/\D/g,'')) result.meter = meterM[1];

  const nameM = txt.match(/(?:customer\s*(?:name|details)?|name\s*[:–-])\s*[:–-]?\s*([A-Za-z][A-Za-z .'-]{2,50})/i);
  if (nameM) result.name = stripEmoji(nameM[1]).trim();

  const addrM = txt.match(/(?:^|\n)\s*address\s*[:–-]?\s*(.+?)(?=\n[A-Za-z ]+\s*[:–-]|$)/im);
  if (addrM) result.addr = stripEmoji(addrM[1]).trim();

  const buM = txt.match(/(?:business\s*unit|BU)\s*[:–-]?\s*([A-Za-z\s/]+?)(?:\n|,|$)/i);
  if (buM) { const bu = matchBU(buM[1]); if (bu) result.bu = bu; }

  const descM = txt.match(/(?:description|complaint|issue)\s*[:–-]?\s*(.+?)(?=\n[A-Za-z ]+\s*[:–-]|$)/is);
  if (descM) result.issue = descM[1].trim();
  else result.issue = cleanIssueForDisplay(txt);

  return result;
}

/**
 * Split pasted text into individual complaint blocks and parse each.
 * Returns array of parsed objects.
 */
function parseMultiple(txt) {
  // Split on the Mobile App complaint header
  const headerRe = /(?=(?:📱|🔔|⚠️|NEW\s+MOBILE))/gi;
  let blocks = txt.split(headerRe).map(b => b.trim()).filter(Boolean);

  // If only one block, try splitting on blank lines followed by another ticket #
  if (blocks.length <= 1) {
    blocks = txt.split(/\n{2,}(?=.*7\d{5})/g).map(b=>b.trim()).filter(Boolean);
  }
  // Still one? Just return single
  if (blocks.length <= 1) return [parseSingle(txt)];

  return blocks.map(parseSingle).filter(b => b.num || b.name || b.phone);
}

// ─── STATUS / AGE ATOMS ─────────────────────────────────────
const StatusPill = ({s}) => {
  const map={resolved:{c:'#4ADE80',bg:'rgba(22,163,74,.15)',label:'Resolved'},progress:{c:'#FCD34D',bg:'rgba(217,119,6,.15)',label:'In Progress'},unresolved:{c:'#F87171',bg:'rgba(220,38,38,.15)',label:'Unresolved'},duplicate:{c:'#9CA3AF',bg:'rgba(156,163,175,.15)',label:'Duplicate'}};
  const v=map[s]||map.progress;
  return <span style={{display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:10,font:'700 10px/1 Sora,sans-serif',letterSpacing:'.04em',textTransform:'uppercase',color:v.c,background:v.bg}}>{v.label}</span>;
};
const AgeBadge = ({created}) => {
  const cls=window.getAgeClass(created),lbl=window.getAgeLabel(created);
  const s={'age-green':{bg:'#EAF3DE',c:'#3B6D11'},'age-amber':{bg:'#FAEEDA',c:'#854F0B'},'age-red':{bg:'#FCEBEB',c:'#A32D2D'}};
  const v=s[cls]||s['age-green'];
  return <span style={{display:'inline-block',padding:'2px 8px',borderRadius:20,font:'700 10.5px/1.3 Sora,sans-serif',whiteSpace:'nowrap',background:v.bg,color:v.c}}>{lbl}</span>;
};

// ─── MY TICKETS ─────────────────────────────────────────────
const MyTickets = ({agent,tickets,onEdit}) => {
  const [filter,setFilter]=React.useState('all');
  const filtered=filter==='all'?tickets:tickets.filter(t=>t.status===filter);
  const counts={all:tickets.length,resolved:tickets.filter(t=>t.status==='resolved').length,progress:tickets.filter(t=>t.status==='progress').length,unresolved:tickets.filter(t=>t.status==='unresolved').length};
  return (
    <div style={{padding:'22px 28px'}}>
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {[['all','All',counts.all,'#3B82F6'],['resolved','Resolved',counts.resolved,'#4ADE80'],['progress','In Progress',counts.progress,'#FCD34D'],['unresolved','Unresolved',counts.unresolved,'#F87171']].map(([k,label,n,c])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{padding:'8px 14px',borderRadius:8,border:filter===k?`2px solid ${c}`:'1px solid var(--border,#1E3070)',background:filter===k?`${c}22`:'var(--card,#111D4A)',color:'var(--text,#F0F4FF)',font:'700 12px Sora,sans-serif',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
            {label}<span style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:c,fontWeight:800}}>{n}</span>
          </button>
        ))}
      </div>
      <div style={{background:'var(--card,#111D4A)',border:'1px solid var(--border,#1E3070)',borderRadius:12,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border,#1E3070)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{font:'700 13px/1.2 Sora,sans-serif',color:'var(--text,#fff)',margin:0}}>My Tickets · {filtered.length}</h3>
          <span style={{font:'500 11px Sora,sans-serif',color:'var(--muted,#6B85C0)'}}>Click any row to update or delete</span>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5,fontFamily:'Sora,sans-serif'}}>
            <thead><tr style={{background:'rgba(0,31,92,.5)'}}>
              {['#','Ticket','Time','Customer','Phone','Meter','BU','Issue','Responsible','Age','Status'].map(h=><th key={h} style={{padding:'9px 11px',textAlign:'left',font:'700 9px Sora,sans-serif',textTransform:'uppercase',letterSpacing:'.06em',color:'var(--muted,#6B85C0)',whiteSpace:'nowrap'}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((t,i)=>(
                <tr key={t.num||i} onClick={()=>onEdit&&onEdit(t)} style={{cursor:'pointer',transition:'background .1s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.04)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={td}><span style={{fontFamily:'JetBrains Mono,monospace',color:'var(--muted,#6B85C0)'}}>{String(i+1).padStart(2,'0')}</span></td>
                  <td style={td}><span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:700,color:'#93C5FD'}}>#{t.num}</span></td>
                  <td style={td}><span style={{fontFamily:'JetBrains Mono,monospace',fontSize:11}}>{t.time}</span></td>
                  <td style={td}>{stripEmoji(t.name)}</td>
                  <td style={td}><span style={{fontFamily:'JetBrains Mono,monospace',color:'var(--muted,#6B85C0)',fontSize:10}}>{t.phone}</span></td>
                  <td style={td}><span style={{fontFamily:'JetBrains Mono,monospace',color:'var(--muted,#6B85C0)',fontSize:10}}>{t.meter||'—'}</span></td>
                  <td style={td}><span style={{display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:10,font:'700 9.5px/1 Sora,sans-serif',background:'rgba(59,130,246,.10)',color:'#93C5FD'}}>{t.bu}</span></td>
                  <td style={{...td,maxWidth:220,color:'var(--text,#F0F4FF)'}}>{cleanIssueForDisplay(t.issue)}</td>
                  <td style={td}>{t.resp}</td>
                  <td style={td}><AgeBadge created={t.created}/></td>
                  <td style={td}><StatusPill s={t.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length&&<div style={{padding:'40px 20px',textAlign:'center',color:'var(--muted,#6B85C0)',font:'500 12.5px Sora,sans-serif'}}>No tickets in this view. <span style={{color:'#FFC72C'}}>Try a different filter, or ➕ Add Ticket.</span></div>}
      </div>
    </div>
  );
};
const td={padding:'9px 11px',borderBottom:'1px solid rgba(255,255,255,.04)',color:'var(--text,#F0F4FF)',verticalAlign:'top'};

// ─── REFERENCE TABLE DATA ───────────────────────────────────
const REF_TABLE=[
  {sn:1,category:'Band Reclassification',party:'Nonye Angelina Nnadozie',color:'#818CF8'},
  {sn:2,category:'Billing',party:'Mojibola Adefuwa',color:'#34D399'},
  {sn:3,category:'Interruption / Voltage / Safety',party:'Ogheneyoreme Agbroko',color:'#F87171'},
  {sn:4,category:'Metering',party:'Holyland Umude',color:'#60A5FA'},
  {sn:5,category:'PPM Support (IT / General)',party:'Adetoun Adebayo',color:'#FBBF24'},
  {sn:6,category:'PPM Maintenance (Field / Faulty)',party:'Olusegun Owokade',color:'#F97316'},
  {sn:7,category:'Change of Name / Onboarding',party:'Clara Olutola',color:'#A78BFA'},
  {sn:8,category:'MYCRON',party:'Glory Mycron (BPS Africa)',color:'#2DD4BF'},
  {sn:9,category:'AMISA',party:'Festus Moko',color:'#FB7185'},
];

// ─── ADD TICKET ─────────────────────────────────────────────
const AddTicket = ({agent, onCreate}) => {
  const EMPTY = {num:'',name:'',phone:'',meter:'',addr:'',bu:'ISLAND',issue:'',category:'',resp:'Holyland Umude',status:'progress',note:''};
  const [pasted, setPasted]   = React.useState('');
  const [bulk,   setBulk]     = React.useState([]);    // [{...parsed, resp, status, note, _sel}]
  const [single, setSingle]   = React.useState(EMPTY); // single-ticket form fallback
  const [mode,   setMode]     = React.useState('bulk');// 'bulk' | 'single'

  // ── Handle paste ─────────────────────────────────────────
  const handlePaste = (txt) => {
    setPasted(txt);
    if (!txt.trim()) { setBulk([]); return; }

    const parsed = parseMultiple(txt);
    if (parsed.length > 1 || (parsed.length === 1 && parsed[0].num)) {
      // Enrich each with defaults
      const enriched = parsed.map(p => ({
        ...EMPTY, ...p,
        resp: p.resp || 'Holyland Umude',
        _sel: true,
      }));
      setBulk(enriched);
      setMode('bulk');
    } else {
      // Single ticket — populate the single form
      const p = parsed[0] || {};
      setSingle(f => ({...EMPTY,...f,...p}));
      setBulk([]);
      setMode('single');
    }
  };

  const stamp = () => {
    const now = new Date();
    const wat = new Date(now.toLocaleString('en-US',{timeZone:'Africa/Lagos'}));
    return {
      created: wat.toISOString().slice(0,16).replace('T',' '),
      time: wat.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),
    };
  };

  // ── Bulk add ─────────────────────────────────────────────
  const addBulk = () => {
    const selected = bulk.filter(t=>t._sel);
    if (!selected.length) return;
    const ts = stamp();
    selected.forEach(t => {
      const {_sel,...rest} = t;
      onCreate({...rest, ...ts});
    });
    window.EK_TOAST && window.EK_TOAST(`${selected.length} ticket${selected.length>1?'s':''} added.`);
    setPasted(''); setBulk([]); setMode('bulk');
  };

  // ── Single add ───────────────────────────────────────────
  const addSingle = () => {
    if (!single.num || !single.name) { window.EK_TOAST&&window.EK_TOAST('Need Ticket # and Customer name.','warn'); return; }
    onCreate({...single,...stamp()});
    setSingle(EMPTY); setPasted(''); setBulk([]);
    window.EK_TOAST && window.EK_TOAST(`Ticket #${single.num} added.`);
  };

  const setBulkField = (idx,k,v) => setBulk(b => b.map((t,i)=>i===idx?{...t,[k]:v}:t));
  const toggleSel = (idx) => setBulk(b => b.map((t,i)=>i===idx?{...t,_sel:!t._sel}:t));
  const setAllSel = (v) => setBulk(b => b.map(t=>({...t,_sel:v})));
  const setSF = (k,v) => setSingle(f=>({...f,[k]:v}));

  const selCount = bulk.filter(t=>t._sel).length;

  return (
    <div style={{padding:'22px 28px',maxWidth:1200}}>
      {/* ── Banner ─────────────────────────────────────── */}
      <div style={{background:agent.tint,border:`1px solid ${agent.color}55`,borderRadius:12,padding:'14px 18px',marginBottom:14,display:'flex',alignItems:'flex-start',gap:12}}>
        <span style={{fontSize:22}}>{agent.emoji}</span>
        <div>
          <div style={{font:'800 13px/1.2 Sora,sans-serif',color:'#fff'}}>Paste complaints from SharePoint — single or multiple at once</div>
          <div style={{font:'500 11.5px/1.5 Sora,sans-serif',color:'rgba(255,255,255,.7)',marginTop:3}}>
            Paste one complaint block or many. Each "NEW MOBILE APP COMPLAINT" block is auto-detected as a separate ticket. Fields: Ticket No → Ticket #, Address → Address, Description → Issue.
          </div>
        </div>
      </div>

      {/* ── Paste box ──────────────────────────────────── */}
      <textarea value={pasted} onChange={e=>handlePaste(e.target.value)}
        placeholder={"Paste one or more complaint blocks here…\n\n📱 NEW MOBILE APP COMPLAINT| 📅 18 May 2026 · 1:44 PM| 🎫 Ticket No: 720390| 👤 Customer: Clifford Benjamin| 📞 Phone: +2347079674724| 📍 Address: 12, isiba street, Itire | 🏢 Business Unit: MUSHIN| 📝 Description: Meter in tamper mode\n\n📱 NEW MOBILE APP COMPLAINT| ... (paste more below)"}
        style={{width:'100%',minHeight:110,padding:14,marginBottom:14,background:'var(--surface,#0D1B45)',color:'var(--text,#F0F4FF)',border:'1px solid var(--border,#1E3070)',borderRadius:10,fontFamily:'JetBrains Mono,monospace',fontSize:11.5,outline:'none',resize:'vertical',boxSizing:'border-box',lineHeight:1.6}}/>

      {/* ── BULK MODE ─────────────────────────────────── */}
      {mode==='bulk' && bulk.length>0 && (
        <div style={{marginBottom:32}}>
          {/* Bulk header */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            <div style={{font:'800 13px Sora,sans-serif',color:'var(--text,#fff)'}}>
              🎯 {bulk.length} ticket{bulk.length>1?'s':''} detected — select which to add
            </div>
            <button onClick={()=>setAllSel(true)} style={ghostBtn}>Select all</button>
            <button onClick={()=>setAllSel(false)} style={ghostBtn}>Deselect all</button>
            <div style={{flex:1}}/>
            <button onClick={addBulk} disabled={!selCount} style={{padding:'10px 20px',background:selCount?agent.color:'#334',color:'#fff',border:'none',borderRadius:9,font:'800 13px Sora,sans-serif',cursor:selCount?'pointer':'not-allowed',boxShadow:selCount?`0 6px 18px ${agent.color}44`:'none',transition:'all .2s'}}>
              ➕ Add {selCount} ticket{selCount!==1?'s':''}
            </button>
          </div>

          {/* Bulk ticket cards */}
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {bulk.map((t,idx)=>(
              <div key={idx} style={{background:'var(--card,#111D4A)',border:`1.5px solid ${t._sel?agent.color:'var(--border,#1E3070)'}`,borderRadius:12,padding:'12px 16px',transition:'border .15s',opacity:t._sel?1:.55}}>
                {/* Row 1: checkbox + ticket info */}
                <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                  <input type="checkbox" checked={t._sel} onChange={()=>toggleSel(idx)}
                    style={{width:18,height:18,accentColor:agent.color,marginTop:2,flexShrink:0,cursor:'pointer'}}/>
                  <div style={{flex:1,display:'grid',gridTemplateColumns:'auto 1fr 1fr 1fr 1fr',gap:'6px 16px',alignItems:'start'}}>
                    {/* Ticket # */}
                    <div>
                      <div style={lbl}>Ticket #</div>
                      <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:800,color:'#93C5FD',fontSize:14}}>#{t.num||'—'}</div>
                    </div>
                    {/* Customer */}
                    <div>
                      <div style={lbl}>Customer</div>
                      <div style={{font:'700 12px/1.3 Sora,sans-serif',color:'var(--text,#fff)'}}>{stripEmoji(t.name)||'—'}</div>
                      <div style={{font:'500 10.5px/1 Sora,sans-serif',color:'var(--muted,#6B85C0)',marginTop:2,fontFamily:'JetBrains Mono,monospace'}}>{t.phone||'—'}</div>
                    </div>
                    {/* BU + Meter */}
                    <div>
                      <div style={lbl}>BU · Meter</div>
                      <div style={{font:'700 12px/1.3 Sora,sans-serif',color:'#93C5FD'}}>{t.bu||'—'}</div>
                      <div style={{font:'500 10.5px/1 Sora,sans-serif',color:'var(--muted,#6B85C0)',marginTop:2,fontFamily:'JetBrains Mono,monospace'}}>{t.meter||'N/A'}</div>
                    </div>
                    {/* Issue */}
                    <div style={{gridColumn:'span 2'}}>
                      <div style={lbl}>Issue</div>
                      <div style={{font:'500 11.5px/1.45 Sora,sans-serif',color:'var(--text,#F0F4FF)'}}>{cleanIssueForDisplay(t.issue)}</div>
                      {t.addr&&<div style={{font:'500 10px/1.3 Sora,sans-serif',color:'var(--muted,#6B85C0)',marginTop:3}}>📍 {t.addr.slice(0,80)}</div>}
                    </div>
                  </div>
                </div>

                {/* Row 2: editable BU / Responsible / Status */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:10,paddingTop:10,borderTop:'1px solid var(--border,#1E3070)'}}>
                  <div>
                    <div style={lbl}>Business Unit</div>
                    <select value={t.bu||'ISLAND'} onChange={e=>setBulkField(idx,'bu',e.target.value)} style={sInp}>
                      {(window.EK_BUSINESS_UNITS||[]).map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={lbl}>Responsible Party</div>
                    <select value={t.resp||'Holyland Umude'} onChange={e=>setBulkField(idx,'resp',e.target.value)} style={sInp}>
                      {(window.EK_RESPONSIBLE_PARTIES||[]).map(r=><option key={r.sn} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={lbl}>Initial Status</div>
                    <select value={t.status||'progress'} onChange={e=>setBulkField(idx,'status',e.target.value)} style={sInp}>
                      <option value="progress">⏳ In Progress</option>
                      <option value="resolved">✅ Resolved</option>
                      <option value="unresolved">🔴 Unresolved</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom add button */}
          <div style={{display:'flex',gap:10,marginTop:14}}>
            <button onClick={addBulk} disabled={!selCount} style={{padding:'12px 22px',background:selCount?agent.color:'#334',color:'#fff',border:'none',borderRadius:10,font:'800 13px Sora,sans-serif',cursor:selCount?'pointer':'not-allowed',boxShadow:selCount?`0 6px 18px ${agent.color}44`:'none'}}>
              ➕ Add {selCount} ticket{selCount!==1?'s':''}
            </button>
            <button onClick={()=>{setPasted('');setBulk([]);}} style={{padding:'12px 22px',background:'rgba(255,255,255,.06)',color:'var(--text,#F0F4FF)',border:'1px solid var(--border,#1E3070)',borderRadius:10,font:'700 13px Sora,sans-serif',cursor:'pointer'}}>Clear</button>
          </div>
        </div>
      )}

      {/* ── SINGLE MODE (fallback / no paste) ─────────── */}
      {(mode==='single' || bulk.length===0) && (
        <div style={{marginBottom:32}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:14}}>
            <Field label="Ticket #"><input value={single.num} onChange={e=>setSF('num',e.target.value)} placeholder="710xxx" style={inp}/></Field>
            <Field label="Customer Name"><input value={single.name} onChange={e=>setSF('name',e.target.value)} style={inp}/></Field>
            <Field label="Phone"><input value={single.phone} onChange={e=>setSF('phone',e.target.value)} placeholder="+234…" style={inp}/></Field>
            <Field label="Meter / Account #"><input value={single.meter} onChange={e=>setSF('meter',e.target.value)} style={inp}/></Field>
            <Field label="Business Unit">
              <select value={single.bu} onChange={e=>setSF('bu',e.target.value)} style={inp}>
                {(window.EK_BUSINESS_UNITS||[]).map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Responsible Party">
              <select value={single.resp} onChange={e=>setSF('resp',e.target.value)} style={inp}>
                {(window.EK_RESPONSIBLE_PARTIES||[]).map(r=><option key={r.sn} value={r.name}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Address" full><input value={single.addr} onChange={e=>setSF('addr',e.target.value)} style={inp}/></Field>
            <Field label="Complaint / Issue" full><textarea value={single.issue} onChange={e=>setSF('issue',e.target.value)} style={{...inp,minHeight:72,resize:'vertical'}}/></Field>
            <Field label="Action Taken / Note" full><textarea value={single.note} onChange={e=>setSF('note',e.target.value)} style={{...inp,minHeight:56,resize:'vertical'}}/></Field>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={addSingle} style={{padding:'12px 22px',background:agent.color,color:'#fff',border:'none',borderRadius:10,font:'800 13px Sora,sans-serif',cursor:'pointer',boxShadow:`0 6px 18px ${agent.color}44`}}>➕ Add to my tickets</button>
            <button onClick={()=>{setSingle(EMPTY);setPasted('');setBulk([]);}} style={{padding:'12px 22px',background:'rgba(255,255,255,.06)',color:'var(--text,#F0F4FF)',border:'1px solid var(--border,#1E3070)',borderRadius:10,font:'700 13px Sora,sans-serif',cursor:'pointer'}}>Clear</button>
          </div>
        </div>
      )}

      {/* ── REFERENCE TABLE ─────────────────────────── */}
      <div style={{background:'var(--card,#111D4A)',border:'1px solid var(--border,#1E3070)',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'14px 20px',background:'linear-gradient(135deg,#001F5C,#1D4ED8)',display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:20}}>📋</span>
          <div>
            <div style={{font:'800 13px/1.1 Sora,sans-serif',color:'#fff'}}>Category → Responsible Party</div>
            <div style={{font:'500 10.5px/1 Sora,sans-serif',color:'rgba(255,255,255,.65)',marginTop:3}}>Quick reference while logging</div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'36px 1fr 1fr',padding:'8px 20px',background:'rgba(29,78,216,.12)',borderBottom:'1px solid var(--border,#1E3070)'}}>
          {['#','Complaint Category','Responsible Party'].map(h=><div key={h} style={{font:'800 9.5px/1 Sora,sans-serif',color:'#60A5FA',letterSpacing:'.06em',textTransform:'uppercase'}}>{h}</div>)}
        </div>
        {REF_TABLE.map((row,i)=>(
          <div key={row.sn} style={{display:'grid',gridTemplateColumns:'36px 1fr 1fr',padding:'10px 20px',background:i%2===0?'transparent':'rgba(255,255,255,.02)',borderBottom:'1px solid var(--border,#1E3070)',alignItems:'center'}}>
            <div style={{width:24,height:24,borderRadius:7,background:row.color+'25',border:'1.5px solid '+row.color+'70',display:'flex',alignItems:'center',justifyContent:'center',font:'800 10px/1 Sora,sans-serif',color:row.color}}>{row.sn}</div>
            <div style={{font:'600 12px/1.4 Sora,sans-serif',color:'var(--text,#F0F4FF)',paddingRight:16}}>{row.category}</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:row.color,flexShrink:0}}/>
              <span style={{font:'700 12px/1.4 Sora,sans-serif',color:'var(--text,#F0F4FF)'}}>{row.party}</span>
            </div>
          </div>
        ))}
        <div style={{padding:'10px 20px',background:'rgba(255,199,44,.07)',borderTop:'1px solid rgba(255,199,44,.2)',font:'500 11px/1.5 Sora,sans-serif',color:'#FCD34D',display:'flex',gap:8}}>
          <span>💡</span><span>Split category? Log primary first, tag second party in Action Taken.</span>
        </div>
      </div>
    </div>
  );
};

const inp={width:'100%',padding:'10px 12px',background:'var(--surface,#0D1B45)',color:'var(--text,#F0F4FF)',border:'1px solid var(--border,#1E3070)',borderRadius:8,fontFamily:'Sora,sans-serif',fontSize:12.5,outline:'none',boxSizing:'border-box'};
const sInp={width:'100%',padding:'7px 10px',background:'var(--surface,#0D1B45)',color:'var(--text,#F0F4FF)',border:'1px solid var(--border,#1E3070)',borderRadius:7,fontFamily:'Sora,sans-serif',fontSize:11.5,outline:'none',boxSizing:'border-box'};
const ghostBtn={padding:'6px 12px',background:'rgba(255,255,255,.06)',color:'var(--muted,#6B85C0)',border:'1px solid var(--border,#1E3070)',borderRadius:7,font:'600 11px Sora,sans-serif',cursor:'pointer'};
const lbl={font:'700 9px Sora,sans-serif',color:'var(--muted,#6B85C0)',letterSpacing:'.6px',textTransform:'uppercase',marginBottom:3};
const Field=({label,full,children})=>(<div style={{gridColumn:full?'1 / -1':'auto'}}><label style={{display:'block',font:'700 10px/1 Sora,sans-serif',color:'var(--muted,#6B85C0)',letterSpacing:'.6px',textTransform:'uppercase',marginBottom:5}}>{label}</label>{children}</div>);

// ── UPDATE TICKET MODAL ───────────────────────────────────────
const UpdateTicket=({ticket,onClose,onSave,onDelete,agent})=>{
  if(!ticket)return null;
  const [form,setForm]=React.useState(ticket);
  const [confirmDel,setConfirmDel]=React.useState(false);
  const setField=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=()=>{onSave(form);onClose();};
  const handleDelete=()=>{if(!confirmDel){setConfirmDel(true);return;}onDelete&&onDelete(ticket.num);onClose();};
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:900,background:'rgba(0,0,0,.65)',backdropFilter:'blur(6px)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'60px 20px 20px',overflowY:'auto'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:700,background:'var(--card,#111D4A)',border:`1px solid ${agent.color}55`,borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border,#1E3070)',display:'flex',justifyContent:'space-between',alignItems:'center',background:`linear-gradient(135deg,${agent.color}22,transparent)`}}>
          <div>
            <div style={{font:'800 10px Sora,sans-serif',color:agent.color,letterSpacing:'.10em',textTransform:'uppercase'}}>Update Ticket</div>
            <div style={{font:'800 17px Sora,sans-serif',color:'var(--text,#fff)',fontFamily:'JetBrains Mono,monospace',marginTop:3}}>#{ticket.num} · {stripEmoji(ticket.name)}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--muted,#6B85C0)',fontSize:20,cursor:'pointer',lineHeight:1}}>✕</button>
        </div>
        <div style={{padding:'18px 20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14,padding:'12px',background:'var(--surface,#0D1B45)',borderRadius:8,border:'1px solid var(--border,#1E3070)'}}>
            <Meta label="Customer" value={`${stripEmoji(ticket.name)} · ${ticket.phone}`}/>
            <Meta label="Meter" value={ticket.meter||'N/A'}/>
            <Meta label="BU" value={ticket.bu}/>
            <Meta label="Responsible" value={ticket.resp}/>
            <div style={{gridColumn:'1/-1'}}><Meta label="Address" value={ticket.addr}/></div>
            <div style={{gridColumn:'1/-1'}}><Meta label="Issue" value={cleanIssueForDisplay(ticket.issue)}/></div>
          </div>
          <Field label="Action Taken / Response from Responsible Party" full>
            <textarea value={form.note} onChange={e=>setField('note',e.target.value)} placeholder="Paste the response from Teams/WhatsApp here…" style={{...inp,minHeight:120,resize:'vertical',fontFamily:'JetBrains Mono,monospace',fontSize:11.5,lineHeight:1.6}}/>
          </Field>
          <div style={{marginTop:14,font:'700 10px Sora,sans-serif',color:'var(--muted,#6B85C0)',letterSpacing:'.6px',textTransform:'uppercase',marginBottom:8}}>Update status</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {[['resolved','✅ Resolved','#16A34A'],['progress','⏳ In Progress','#D97706'],['unresolved','🔴 Unresolved','#DC2626']].map(([k,lbl,c])=>(
              <button key={k} onClick={()=>setField('status',k)} style={{padding:12,borderRadius:8,border:form.status===k?`2px solid ${c}`:'2px solid var(--border,#1E3070)',background:form.status===k?`${c}22`:'var(--surface,#0D1B45)',color:'var(--text,#F0F4FF)',font:'700 12.5px Sora,sans-serif',cursor:'pointer',transition:'all .15s'}}>{lbl}</button>
            ))}
          </div>
          <div style={{marginTop:18,display:'flex',gap:10,alignItems:'center'}}>
            <button onClick={handleDelete} style={{padding:'10px 16px',background:confirmDel?'rgba(220,38,38,.25)':'rgba(220,38,38,.10)',color:confirmDel?'#FCA5A5':'#F87171',border:confirmDel?'1.5px solid #DC2626':'1px solid rgba(220,38,38,.35)',borderRadius:8,font:'700 12px Sora,sans-serif',cursor:'pointer'}}>
              {confirmDel?'⚠ Confirm delete?':'🗑 Delete ticket'}
            </button>
            {confirmDel&&<button onClick={()=>setConfirmDel(false)} style={{padding:'10px 12px',background:'transparent',color:'var(--muted,#6B85C0)',border:'1px solid var(--border,#1E3070)',borderRadius:8,font:'600 11px Sora,sans-serif',cursor:'pointer'}}>Cancel</button>}
            <div style={{flex:1}}/>
            <button onClick={onClose} style={{padding:'10px 18px',background:'rgba(255,255,255,.06)',color:'var(--text,#F0F4FF)',border:'1px solid var(--border,#1E3070)',borderRadius:8,font:'600 12px Sora,sans-serif',cursor:'pointer'}}>Cancel</button>
            <button onClick={save} style={{padding:'10px 22px',background:agent.color,color:'#fff',border:'none',borderRadius:8,font:'800 12.5px Sora,sans-serif',cursor:'pointer',boxShadow:`0 4px 14px ${agent.color}44`}}>Save update</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Meta=({label,value})=>(<div><div style={{font:'700 9px Sora,sans-serif',color:'var(--muted,#6B85C0)',letterSpacing:'.6px',textTransform:'uppercase',marginBottom:2}}>{label}</div><div style={{font:'500 12px/1.4 Sora,sans-serif',color:'var(--text,#F0F4FF)'}}>{value||'—'}</div></div>);

Object.assign(window,{MyTickets,AddTicket,UpdateTicket,StatusPill,AgeBadge,cleanIssueForDisplay,stripEmoji});
