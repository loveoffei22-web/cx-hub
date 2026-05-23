// Agents Hub — Slot Updates, Inbox, Export Day.

// ─── SLOT UPDATES (WhatsApp text generator) ─────────────────
const SlotUpdates = ({agent, tickets}) => {
  const [slot, setSlot] = React.useState('midday');
  const SLOT_META = {
    midday: {label:'Midday', emoji:'🌤️', time:'1–2 PM', stamp:'2:00 PM WAT'},
    cob:    {label:'COB',    emoji:'🌆', time:'4–5 PM', stamp:'5:00 PM WAT'},
  };
  const m = SLOT_META[slot];

  const res = tickets.filter(t => t.status==='resolved');
  const prg = tickets.filter(t => t.status==='progress');
  const unr = tickets.filter(t => t.status==='unresolved');

  const wat = new Date(new Date().toLocaleString('en-US',{timeZone:'Africa/Lagos'}));
  const dayLong = wat.toLocaleDateString('en-GB',{weekday:'long', day:'numeric', month:'long'});

  // WhatsApp-friendly plain text. Bold via * .. *.
  const msg = [
    `*EKEDP ${m.label.toUpperCase()} UPDATE — ${dayLong}*`,
    `_${agent.name} · ${m.emoji} ${m.stamp}_`,
    ``,
    `📊 *Summary*`,
    `Total: ${tickets.length}  |  ✅ Resolved: ${res.length}  |  ⏳ In Progress: ${prg.length}  |  🔴 Unresolved: ${unr.length}`,
    ``,
    ...(res.length ? [`*✅ RESOLVED (${res.length})*`, ...res.map(t =>
      `#${t.num} · ${t.bu} · ${t.name}\n   ${t.issue}\n   ↳ ${t.resp} · ${(t.note||'—').slice(0,140)}`
    ), ''] : []),
    ...(prg.length ? [`*⏳ IN PROGRESS (${prg.length})*`, ...prg.map(t =>
      `#${t.num} · ${t.bu} · ${t.name}\n   ${t.issue}\n   ↳ ${t.resp} · ${(t.note||'—').slice(0,140)}`
    ), ''] : []),
    ...(unr.length ? [`*🔴 UNRESOLVED (${unr.length})*`, ...unr.map(t =>
      `#${t.num} · ${t.bu} · ${t.name}\n   ${t.issue}\n   ↳ ${t.resp} · ${(t.note||'—').slice(0,140)}`
    ), ''] : []),
    `— Sent from EKEDP Power App · Agents Hub`,
  ].join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg);
      window.EK_TOAST && window.EK_TOAST('Copied! Paste into WhatsApp.');
    } catch (e) {
      window.EK_TOAST && window.EK_TOAST('Copy failed — select text and Ctrl+C', 'warn');
    }
  };

  return (
    <div style={{padding:'22px 28px', maxWidth:1100}}>
      <div style={{display:'flex', gap:10, marginBottom:18, flexWrap:'wrap'}}>
        {Object.entries(SLOT_META).map(([k,v]) => (
          <button key={k} onClick={()=>setSlot(k)} style={{
            padding:'10px 18px', borderRadius:10,
            border: slot===k ? `2px solid ${agent.color}` : '1px solid #1E3070',
            background: slot===k ? agent.tint : '#111D4A',
            color:'#F0F4FF', font:'700 13px Sora,sans-serif', cursor:'pointer',
            display:'flex', alignItems:'center', gap:8,
          }}>
            <span style={{fontSize:18}}>{v.emoji}</span>
            <span>{v.label} <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'#6B85C0', marginLeft:6}}>{v.time}</span></span>
          </button>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        {/* WhatsApp message preview */}
        <div style={{background:'#111D4A', border:'1px solid #1E3070', borderRadius:12, overflow:'hidden'}}>
          <div style={{padding:'13px 16px', borderBottom:'1px solid #1E3070', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(37,211,102,.10)'}}>
            <h3 style={{font:'800 13px Sora,sans-serif', color:'#fff', margin:0}}>💬 WhatsApp message</h3>
            <button onClick={copy} style={{
              padding:'7px 13px', background:'#25D366', color:'#fff', border:'none',
              borderRadius:7, font:'800 11.5px Sora,sans-serif', cursor:'pointer',
            }}>📋 Copy text</button>
          </div>
          <pre style={{
            margin:0, padding:'16px 18px',
            font:'500 12px/1.55 Sora,sans-serif',
            color:'#F0F4FF', whiteSpace:'pre-wrap', wordBreak:'break-word',
            maxHeight:520, overflowY:'auto',
            fontFamily:'Sora,sans-serif',
          }}>{msg}</pre>
        </div>

        {/* KPI strip + per-status preview */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8}}>
            <Tile label="Total" v={tickets.length} c="#3B82F6"/>
            <Tile label="Resolved" v={res.length} c="#4ADE80"/>
            <Tile label="Progress" v={prg.length} c="#FCD34D"/>
            <Tile label="Unresolved" v={unr.length} c="#F87171"/>
          </div>
          <div style={{background:'#111D4A', border:'1px solid #1E3070', borderRadius:12, padding:'12px 14px'}}>
            <div style={{font:'800 11px Sora,sans-serif', color:'#fff', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10}}>📌 Tickets included</div>
            {tickets.map(t => (
              <div key={t.num} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,.04)',
                fontSize:11.5,
              }}>
                <span style={{fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#93C5FD', fontSize:11}}>#{t.num}</span>
                <span style={{flex:1, color:'#F0F4FF', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.name} · {t.bu}</span>
                <StatusPill s={t.status}/>
              </div>
            ))}
            {!tickets.length && <div style={{font:'500 12px Sora,sans-serif', color:'#6B85C0', padding:'8px 0'}}>No tickets to include.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Tile = ({label, v, c}) => (
  <div style={{background:'#111D4A', border:'1px solid #1E3070', borderRadius:8, padding:'10px 12px', position:'relative', overflow:'hidden'}}>
    <div style={{position:'absolute', top:0, left:0, right:0, height:3, background:c}}/>
    <div style={{font:'800 9px Sora,sans-serif', color:'#6B85C0', letterSpacing:'.10em', textTransform:'uppercase'}}>{label}</div>
    <div style={{font:'800 22px JetBrains Mono,monospace', color:'#fff', marginTop:4}}>{v}</div>
  </div>
);

// ─── INBOX (messages / data pushes from Love) ───────────────
const Inbox = ({agent}) => {
  // Placeholder: in production, this reads from the shared OneDrive JSON.
  const messages = [
    {from:'Love Offei', kind:'note', t:'Yesterday', subj:'Watch out for repeated meter complaints on AJAH',
     body:'Three customers in the same compound have raised related complaints. Coordinate with Holyland — there may be a BU-wide cause. Tag me when you find out.'},
    {from:'Love Offei', kind:'data', t:'2 days ago', subj:'Roster update — you take Thursday day shift',
     body:'Per the new roster, ' + agent.name.split(' ')[0] + ' is on the Thursday day shift. Your tickets for that day will route to you automatically.'},
    {from:'System', kind:'sync', t:'3 days ago', subj:'JSON sync confirmed',
     body:'Your last day-export landed in the shared OneDrive folder at 5:04 PM WAT. Love has ingested it.'},
  ];
  return (
    <div style={{padding:'22px 28px', maxWidth:900}}>
      <div style={{font:'700 11px Sora,sans-serif', color:'#6B85C0', textTransform:'uppercase', letterSpacing:'.10em', marginBottom:12}}>
        Messages from Love & system events
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {messages.map((m,i) => (
          <div key={i} style={{
            background:'#111D4A', border:'1px solid #1E3070', borderRadius:12,
            padding:'14px 18px',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
              <div style={{
                width:32, height:32, borderRadius:'50%',
                background: m.kind==='note' ? '#1D4ED8' : m.kind==='data' ? agent.color : '#3A5299',
                color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                font:'800 13px Sora,sans-serif', flexShrink:0,
              }}>{m.kind==='note'?'📝':m.kind==='data'?'📊':'🔄'}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{font:'800 13px Sora,sans-serif', color:'#fff'}}>{m.subj}</div>
                <div style={{font:'500 10.5px Sora,sans-serif', color:'#6B85C0', marginTop:2}}>{m.from} · {m.t}</div>
              </div>
            </div>
            <div style={{font:'500 12px/1.55 Sora,sans-serif', color:'rgba(240,244,255,.85)', paddingLeft:42}}>{m.body}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop:18, padding:'14px 18px',
        background:'rgba(255,199,44,.08)', border:'1px dashed rgba(255,199,44,.30)',
        borderRadius:10, font:'500 11.5px Sora,sans-serif', color:'#FFC72C',
      }}>
        💡 Once OneDrive sync is wired up, new messages from Love will land here automatically. For now this view is a placeholder.
      </div>
    </div>
  );
};

// ─── EXPORT DAY ─────────────────────────────────────────────
const ExportDay = ({agent, tickets}) => {
  const wat = new Date(new Date().toLocaleString('en-US',{timeZone:'Africa/Lagos'}));
  const dateStr = wat.toISOString().slice(0,10);

  const payload = {
    exportedAt: new Date().toISOString(),
    exportedBy: {name: agent.name, email: agent.email, id: agent.id},
    period: {day: dateStr},
    tickets,
    stats: {
      total: tickets.length,
      resolved: tickets.filter(t=>t.status==='resolved').length,
      progress: tickets.filter(t=>t.status==='progress').length,
      unresolved: tickets.filter(t=>t.status==='unresolved').length,
    },
  };
  const json = JSON.stringify(payload, null, 2);

  const download = () => {
    const blob = new Blob([json], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ekedp_${agent.id}_${dateStr}.json`;
    a.click();
    window.EK_TOAST && window.EK_TOAST('JSON saved. Drop in the OneDrive folder.');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      window.EK_TOAST && window.EK_TOAST('JSON copied to clipboard.');
    } catch(e) {
      window.EK_TOAST && window.EK_TOAST('Copy failed — select text and Ctrl+C', 'warn');
    }
  };

  return (
    <div style={{padding:'22px 28px', maxWidth:1100}}>
      <div style={{
        background:`${agent.tint}`, border:`1px solid ${agent.color}55`,
        borderRadius:12, padding:'14px 18px', marginBottom:18,
        display:'flex', alignItems:'flex-start', gap:12,
      }}>
        <span style={{fontSize:22}}>📤</span>
        <div style={{flex:1}}>
          <div style={{font:'800 13px Sora,sans-serif', color:'#fff'}}>Export today's work as JSON</div>
          <div style={{font:'500 11.5px/1.5 Sora,sans-serif', color:'rgba(255,255,255,.7)', marginTop:3}}>
            Save as a file, then drop it in the shared OneDrive folder. Love's Managers Hub picks it up automatically.
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={copy} style={{
            padding:'10px 14px', background:'rgba(255,255,255,.10)', color:'#fff',
            border:'1px solid rgba(255,255,255,.20)', borderRadius:8,
            font:'700 12px Sora,sans-serif', cursor:'pointer',
          }}>📋 Copy</button>
          <button onClick={download} style={{
            padding:'10px 16px', background: agent.color, color:'#fff', border:'none',
            borderRadius:8, font:'800 12.5px Sora,sans-serif', cursor:'pointer',
            boxShadow:`0 6px 18px ${agent.color}55`,
          }}>⬇ Download JSON</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:18}}>
        <Tile label="Total" v={payload.stats.total} c="#3B82F6"/>
        <Tile label="Resolved" v={payload.stats.resolved} c="#4ADE80"/>
        <Tile label="Progress" v={payload.stats.progress} c="#FCD34D"/>
        <Tile label="Unresolved" v={payload.stats.unresolved} c="#F87171"/>
      </div>

      <div style={{background:'#0D1B45', border:'1px solid #1E3070', borderRadius:12, overflow:'hidden'}}>
        <div style={{padding:'13px 16px', borderBottom:'1px solid #1E3070', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{font:'700 13px Sora,sans-serif', color:'#fff', margin:0}}>Preview</h3>
          <span style={{font:'500 11px Sora,sans-serif', color:'#6B85C0'}}>ekedp_{agent.id}_{dateStr}.json</span>
        </div>
        <pre style={{
          margin:0, padding:'14px 18px',
          font:'500 11px/1.55 JetBrains Mono,monospace',
          color:'#93C5FD', whiteSpace:'pre-wrap', wordBreak:'break-word',
          maxHeight:380, overflowY:'auto', background:'transparent',
        }}>{json}</pre>
      </div>
    </div>
  );
};

Object.assign(window, {SlotUpdates, Inbox, ExportDay});
