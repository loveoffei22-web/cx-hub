// Agents Hub — Slot Updates, Inbox, Export Day, Import JSON.
// v2: all components theme-aware via ThemeCtx.
//     New: ImportJSON screen with drag-drop, merge logic.

// ─── SLOT UPDATES (WhatsApp text generator) ──────────────────────
const SlotUpdates = ({agent, tickets}) => {
  const th    = React.useContext(window.ThemeCtx);
  const [slot, setSlot] = React.useState('midday');

  const SLOT_META = {
    midday: {label:'Midday', emoji:'🌤️', time:'1–2 PM', stamp:'2:00 PM WAT'},
    cob:    {label:'COB',    emoji:'🌆', time:'4–5 PM', stamp:'5:00 PM WAT'},
  };
  const m = SLOT_META[slot];

  const res = tickets.filter(t => t.status === 'resolved');
  const prg = tickets.filter(t => t.status === 'progress');
  const unr = tickets.filter(t => t.status === 'unresolved');

  const wat     = new Date(new Date().toLocaleString('en-US', {timeZone:'Africa/Lagos'}));
  const dayLong = wat.toLocaleDateString('en-GB', {weekday:'long', day:'numeric', month:'long'});

  const msg = [
    `*EKEDP ${m.label.toUpperCase()} UPDATE — ${dayLong}*`,
    `_${agent.name} · ${m.emoji} ${m.stamp}_`,
    '',
    '📊 *Summary*',
    `Total: ${tickets.length}  |  ✅ Resolved: ${res.length}  |  ⏳ In Progress: ${prg.length}  |  🔴 Unresolved: ${unr.length}`,
    '',
    ...(res.length ? [`*✅ RESOLVED (${res.length})*`, ...res.map(t =>
      `#${t.num} · ${t.bu} · ${t.name}\n   ${t.issue}\n   ↳ ${t.resp} · ${(t.note||'—').slice(0,140)}`
    ), ''] : []),
    ...(prg.length ? [`*⏳ IN PROGRESS (${prg.length})*`, ...prg.map(t =>
      `#${t.num} · ${t.bu} · ${t.name}\n   ${t.issue}\n   ↳ ${t.resp} · ${(t.note||'—').slice(0,140)}`
    ), ''] : []),
    ...(unr.length ? [`*🔴 UNRESOLVED (${unr.length})*`, ...unr.map(t =>
      `#${t.num} · ${t.bu} · ${t.name}\n   ${t.issue}\n   ↳ ${t.resp} · ${(t.note||'—').slice(0,140)}`
    ), ''] : []),
    '— Sent from EKEDP Power App · Agents Hub',
  ].join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg);
      window.EK_TOAST && window.EK_TOAST('Copied! Paste into WhatsApp.');
    } catch {
      window.EK_TOAST && window.EK_TOAST('Copy failed — select text and Ctrl+C', 'warn');
    }
  };

  return (
    <div style={{padding:'22px 28px', maxWidth:1100}}>
      <div style={{display:'flex', gap:10, marginBottom:18, flexWrap:'wrap'}}>
        {Object.entries(SLOT_META).map(([k, v]) => (
          <button key={k} onClick={() => setSlot(k)} style={{
            padding: '10px 18px', borderRadius: 10,
            border: slot === k ? `2px solid ${agent.color}` : `1px solid ${th.border}`,
            background: slot === k ? agent.tint : th.card,
            color: th.text, font: '700 13px Sora,sans-serif', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all .15s',
          }}>
            <span style={{fontSize:18}}>{v.emoji}</span>
            <span>{v.label} <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:11, color:th.muted, marginLeft:6}}>{v.time}</span></span>
          </button>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        {/* WhatsApp preview */}
        <div style={{background:th.card, border:`1px solid ${th.border}`, borderRadius:12, overflow:'hidden'}}>
          <div style={{
            padding:'13px 16px', borderBottom:`1px solid ${th.border}`,
            display:'flex', justifyContent:'space-between', alignItems:'center',
            background:'rgba(37,211,102,.10)',
          }}>
            <h3 style={{font:'800 13px Sora,sans-serif', color:th.text, margin:0}}>💬 WhatsApp message</h3>
            <button onClick={copy} style={{
              padding:'7px 13px', background:'#25D366', color:'#fff', border:'none',
              borderRadius:7, font:'800 11.5px Sora,sans-serif', cursor:'pointer',
            }}>📋 Copy text</button>
          </div>
          <pre style={{
            margin:0, padding:'16px 18px',
            font:'500 12px/1.55 Sora,sans-serif',
            color:th.text, whiteSpace:'pre-wrap', wordBreak:'break-word',
            maxHeight:520, overflowY:'auto', background:'transparent',
          }}>{msg}</pre>
        </div>

        {/* KPI + list */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8}}>
            <Tile label="Total"      v={tickets.length}  c="#3B82F6" th={th}/>
            <Tile label="Resolved"   v={res.length}      c="#4ADE80" th={th}/>
            <Tile label="Progress"   v={prg.length}      c="#FCD34D" th={th}/>
            <Tile label="Unresolved" v={unr.length}      c="#F87171" th={th}/>
          </div>
          <div style={{background:th.card, border:`1px solid ${th.border}`, borderRadius:12, padding:'12px 14px'}}>
            <div style={{font:'800 11px Sora,sans-serif', color:th.text, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10}}>
              📌 Tickets included
            </div>
            {tickets.map(t => (
              <div key={t.num} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'7px 0', borderBottom:`1px solid ${th.tblRow||'rgba(255,255,255,.04)'}`,
                fontSize:11.5,
              }}>
                <span style={{fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#93C5FD', fontSize:11}}>#{t.num}</span>
                <span style={{flex:1, color:th.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                  {t.name} · {t.bu}
                </span>
                <StatusPill s={t.status}/>
              </div>
            ))}
            {!tickets.length && (
              <div style={{font:'500 12px Sora,sans-serif', color:th.muted, padding:'8px 0'}}>No tickets to include.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Tile = ({label, v, c, th}) => (
  <div style={{
    background: th?.card || '#111D4A',
    border: `1px solid ${th?.border || '#1E3070'}`,
    borderRadius: 8, padding: '10px 12px',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{position:'absolute', top:0, left:0, right:0, height:3, background:c}}/>
    <div style={{font:'800 9px Sora,sans-serif', color:th?.muted||'#6B85C0', letterSpacing:'.10em', textTransform:'uppercase'}}>
      {label}
    </div>
    <div style={{font:'800 22px JetBrains Mono,monospace', color:th?.text||'#fff', marginTop:4}}>{v}</div>
  </div>
);

// ─── INBOX ────────────────────────────────────────────────────────
const Inbox = ({agent}) => {
  const th = React.useContext(window.ThemeCtx);
  const messages = [
    {from:'Love Offei', kind:'note', t:'Yesterday', subj:'Watch out for repeated meter complaints on AJAH',
     body:'Three customers in the same compound have raised related complaints. Coordinate with Holyland — there may be a BU-wide cause. Tag me when you find out.'},
    {from:'Love Offei', kind:'data', t:'2 days ago', subj:'Roster update — you take Thursday day shift',
     body:`Per the new roster, ${agent.name.split(' ')[0]} is on the Thursday day shift. Your tickets for that day will route to you automatically.`},
    {from:'System', kind:'sync', t:'3 days ago', subj:'JSON sync confirmed',
     body:'Your last day-export landed in the shared OneDrive folder at 5:04 PM WAT. Love has ingested it.'},
  ];

  return (
    <div style={{padding:'22px 28px', maxWidth:900}}>
      <div style={{font:'700 11px Sora,sans-serif', color:th.muted, textTransform:'uppercase', letterSpacing:'.10em', marginBottom:12}}>
        Messages from Love & system events
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {messages.map((m, i) => (
          <div key={i} style={{
            background: th.card, border: `1px solid ${th.border}`,
            borderRadius: 12, padding:'14px 18px',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
              <div style={{
                width:32, height:32, borderRadius:'50%',
                background: m.kind==='note' ? '#1D4ED8' : m.kind==='data' ? agent.color : '#3A5299',
                color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                font:'800 13px Sora,sans-serif', flexShrink:0,
              }}>{m.kind==='note'?'📝':m.kind==='data'?'📊':'🔄'}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{font:'800 13px Sora,sans-serif', color:th.text}}>{m.subj}</div>
                <div style={{font:'500 10.5px Sora,sans-serif', color:th.muted, marginTop:2}}>{m.from} · {m.t}</div>
              </div>
            </div>
            <div style={{font:'500 12px/1.55 Sora,sans-serif', color:th.muted, paddingLeft:42}}>{m.body}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop:18, padding:'14px 18px',
        background:'rgba(255,199,44,.08)', border:'1px dashed rgba(255,199,44,.30)',
        borderRadius:10, font:'500 11.5px Sora,sans-serif', color:'#FFC72C',
      }}>
        💡 Once OneDrive sync is wired up, new messages from Love will land here automatically.
      </div>
    </div>
  );
};

// ─── IMPORT JSON ──────────────────────────────────────────────────
// Accepts agent export JSONs (the same format ExportDay produces).
// On upload it calls onImport({agentId, agentName, importedTickets}).
// Multiple files can be imported one after another — each MERGES
// into that agent's slot in the shared ticket store (no overwrites).
const ImportJSON = ({currentAgent, onImport}) => {
  const th = React.useContext(window.ThemeCtx);
  const fileRef  = React.useRef(null);
  const [dragging,  setDragging]  = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [log,       setLog]       = React.useState([]);   // [{ok, msg, agentName, count, file}]

  const addLog = (entry) => setLog(prev => [entry, ...prev].slice(0, 20));

  // Parse one JSON file and call onImport
  const processFile = (file) => {
    if (!file || !file.name.endsWith('.json')) {
      addLog({ok:false, msg:'Not a JSON file.', file:file?.name || '?'});
      window.EK_TOAST && window.EK_TOAST(`${file?.name} is not a JSON file`, 'err');
      return;
    }

    setImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const j = JSON.parse(e.target.result);

        // Must be an agent export: {exportedBy: {id, name}, tickets: [...]}
        if (!j.tickets || !Array.isArray(j.tickets)) {
          addLog({ok:false, msg:'Unrecognised format — needs {tickets:[…]}', file:file.name});
          window.EK_TOAST && window.EK_TOAST(`${file.name}: unrecognised format`, 'warn');
          setImporting(false);
          return;
        }

        const agentId   = j.exportedBy?.id   || currentAgent.id;
        const agentName = j.exportedBy?.name || currentAgent.name;

        // Normalise tickets to the internal shape
        const normalised = j.tickets.map(t => ({
          num:      t.num      || '',
          name:     t.name     || '',
          phone:    t.phone    || '',
          meter:    t.meter    || '',
          addr:     t.addr     || t.address || '',
          bu:       t.bu       || '',
          issue:    t.issue    || t.note    || '',
          category: t.category || '',
          resp:     t.resp     || t.assignee || '',
          note:     t.note     || t.resolutionNote || '',
          status:   t.status   || 'unresolved',
          time:     t.time     || '',
          created:  t.created  || '',
        }));

        onImport({agentId, agentName, importedTickets: normalised});
        addLog({ok:true, file:file.name, agentName, count: normalised.length,
          msg:`${normalised.length} ticket${normalised.length!==1?'s':''} from ${agentName}`});
      } catch (err) {
        addLog({ok:false, file:file.name, msg:`JSON parse error: ${err.message}`});
        window.EK_TOAST && window.EK_TOAST(`${file.name}: invalid JSON`, 'err');
      }
      setImporting(false);
    };
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    files.forEach(processFile);
  };

  const onFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
    e.target.value = '';  // allow re-picking same file
  };

  // Agents with their colours for the guide chips
  const agents = window.EK_AGENTS || [];

  return (
    <div style={{padding:'22px 28px', maxWidth:860}}>

      {/* Header */}
      <div style={{marginBottom:20}}>
        <h2 style={{font:'800 17px/1.1 Sora,sans-serif', color:th.text, margin:0}}>
          📂 Import Agent JSON
        </h2>
        <p style={{font:'500 12.5px/1.5 Sora,sans-serif', color:th.muted, marginTop:5}}>
          Drop one or more agent export files here. Each file is <strong>merged</strong> into
          that agent's tickets — new tickets are added, existing ones (same ticket #) are kept
          as-is. All Complaints updates immediately.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current && fileRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? agent_accent(currentAgent) : th.border}`,
          borderRadius: 16,
          background: dragging ? `${agent_accent(currentAgent)}12` : th.card,
          padding: '36px 28px', textAlign: 'center', cursor: 'pointer',
          transition: 'all .2s', marginBottom: 18,
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          multiple
          onChange={onFileInput}
          style={{display:'none'}}
        />
        <div style={{fontSize:40, marginBottom:10}}>
          {importing ? '⏳' : dragging ? '📥' : '📂'}
        </div>
        <div style={{font:'800 14px/1.2 Sora,sans-serif', color:th.text, marginBottom:5}}>
          {importing ? 'Processing…' : dragging ? 'Drop the file!' : 'Drop JSON file(s) here — or click to browse'}
        </div>
        <div style={{font:'500 11.5px Sora,sans-serif', color:th.muted}}>
          Supports multiple files at once. Each file = one agent's export.
        </div>
      </div>

      {/* Team guide */}
      <div style={{
        background: th.surface, border: `1px solid ${th.border}`,
        borderRadius: 12, padding: '16px 18px', marginBottom: 16,
      }}>
        <div style={{font:'700 10px/1 Sora,sans-serif', color:th.muted, letterSpacing:'.10em', textTransform:'uppercase', marginBottom:12}}>
          Team agent IDs — these are the IDs matched inside each JSON file
        </div>
        <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {agents.map(a => (
            <div key={a.id} style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'6px 12px', borderRadius:8,
              background:`${a.color}18`, border:`1px solid ${a.color}44`,
            }}>
              <span style={{fontSize:14}}>{a.emoji}</span>
              <div>
                <div style={{font:'700 11px/1 Sora,sans-serif', color:a.color}}>
                  {a.name.split(' ')[0]}
                </div>
                <div style={{font:'500 9.5px/1 Sora,sans-serif', color:th.muted, marginTop:2}}>
                  id: {a.id}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{font:'500 11px/1.5 Sora,sans-serif', color:th.muted, marginTop:10}}>
          💡 <strong>At COB</strong>, the team WhatsApp lead (usually Esther) imports all agents'
          files here — Racheal's, Matthew's, Tomina's, Loveth's, and their own — to keep
          All Complaints fully up to date for everyone.
        </div>
      </div>

      {/* Import log */}
      {log.length > 0 && (
        <div style={{
          background: th.card, border: `1px solid ${th.border}`,
          borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{
            padding:'12px 16px', borderBottom:`1px solid ${th.border}`,
            font:'700 11px/1 Sora,sans-serif', color:th.muted,
            letterSpacing:'.08em', textTransform:'uppercase',
            background: th.surface,
          }}>
            Import log — this session
          </div>
          {log.map((l, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'flex-start', gap:12,
              padding:'11px 16px', borderBottom: i < log.length-1 ? `1px solid ${th.border}` : 'none',
            }}>
              <span style={{fontSize:16, flexShrink:0, marginTop:1}}>
                {l.ok ? '✅' : '❌'}
              </span>
              <div style={{flex:1, minWidth:0}}>
                <div style={{
                  font:'700 11.5px/1.2 Sora,sans-serif',
                  color: l.ok ? '#4ADE80' : '#F87171',
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                }}>
                  {l.file}
                </div>
                <div style={{font:'500 11px/1.4 Sora,sans-serif', color:th.muted, marginTop:2}}>
                  {l.msg}
                </div>
              </div>
              {l.ok && l.count !== undefined && (
                <span style={{
                  fontFamily:'JetBrains Mono,monospace', fontSize:11,
                  fontWeight:800, color:'#4ADE80', flexShrink:0,
                }}>+{l.count}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper to get agent accent colour (falls back to #E30613)
const agent_accent = (agent) => agent?.color || '#E30613';

// ─── EXPORT DAY ───────────────────────────────────────────────────
const ExportDay = ({agent, tickets}) => {
  const th = React.useContext(window.ThemeCtx);
  const wat     = new Date(new Date().toLocaleString('en-US', {timeZone:'Africa/Lagos'}));
  const dateStr = wat.toISOString().slice(0, 10);

  const payload = {
    exportedAt: new Date().toISOString(),
    exportedBy: {name: agent.name, email: agent.email, id: agent.id},
    period:     {day: dateStr},
    tickets,
    stats: {
      total:      tickets.length,
      resolved:   tickets.filter(t => t.status === 'resolved').length,
      progress:   tickets.filter(t => t.status === 'progress').length,
      unresolved: tickets.filter(t => t.status === 'unresolved').length,
    },
  };
  const json = JSON.stringify(payload, null, 2);

  const download = () => {
    const blob = new Blob([json], {type:'application/json'});
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `ekedp_${agent.id}_${dateStr}.json`;
    a.click();
    window.EK_TOAST && window.EK_TOAST('JSON saved. Drop in the shared folder or share with Esther.');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      window.EK_TOAST && window.EK_TOAST('JSON copied to clipboard.');
    } catch {
      window.EK_TOAST && window.EK_TOAST('Copy failed — select text and Ctrl+C', 'warn');
    }
  };

  return (
    <div style={{padding:'22px 28px', maxWidth:1100}}>
      <div style={{
        background: agent.tint, border: `1px solid ${agent.color}55`,
        borderRadius: 12, padding: '14px 18px', marginBottom: 18,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <span style={{fontSize:22}}>📤</span>
        <div style={{flex:1}}>
          <div style={{font:'800 13px Sora,sans-serif', color:th.text}}>Export today's work as JSON</div>
          <div style={{font:'500 11.5px/1.5 Sora,sans-serif', color:th.muted, marginTop:3}}>
            Download this file and share it with the team lead (usually Esther). She will import it
            under <strong>Import JSON</strong> to update All Complaints for everyone.
          </div>
        </div>
        <div style={{display:'flex', gap:8, flexShrink:0}}>
          <button onClick={copy} style={{
            padding:'10px 14px', background:'rgba(255,255,255,.10)', color:th.text,
            border:`1px solid ${th.border}`, borderRadius:8,
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
        <Tile label="Total"      v={payload.stats.total}      c="#3B82F6" th={th}/>
        <Tile label="Resolved"   v={payload.stats.resolved}   c="#4ADE80" th={th}/>
        <Tile label="Progress"   v={payload.stats.progress}   c="#FCD34D" th={th}/>
        <Tile label="Unresolved" v={payload.stats.unresolved} c="#F87171" th={th}/>
      </div>

      <div style={{background:th.surface, border:`1px solid ${th.border}`, borderRadius:12, overflow:'hidden'}}>
        <div style={{
          padding:'13px 16px', borderBottom:`1px solid ${th.border}`,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <h3 style={{font:'700 13px Sora,sans-serif', color:th.text, margin:0}}>Preview</h3>
          <span style={{font:'500 11px Sora,sans-serif', color:th.muted}}>
            ekedp_{agent.id}_{dateStr}.json
          </span>
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

Object.assign(window, {SlotUpdates, Inbox, ExportDay, ImportJSON, Tile});
