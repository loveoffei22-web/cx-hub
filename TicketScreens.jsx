// Agents Hub — ticket screens.
// v2: all components are theme-aware via ThemeCtx.
//     New: AllComplaints screen (all agents merged).

// ─── SHARED ATOMS ────────────────────────────────────────────────
const StatusPill = ({s}) => {
  const map = {
    resolved:   {c:'#4ADE80', bg:'rgba(22,163,74,.15)',    label:'Resolved'},
    progress:   {c:'#FCD34D', bg:'rgba(217,119,6,.15)',    label:'In Progress'},
    unresolved: {c:'#F87171', bg:'rgba(220,38,38,.15)',    label:'Unresolved'},
    duplicate:  {c:'#9CA3AF', bg:'rgba(156,163,175,.15)',  label:'Duplicate'},
  };
  const v = map[s] || map.progress;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: 10, font: '700 10px/1 Sora,sans-serif',
      letterSpacing: '.04em', textTransform: 'uppercase',
      color: v.c, background: v.bg,
    }}>{v.label}</span>
  );
};

const AgeBadge = ({created}) => {
  const days  = window.getAgeDays && window.getAgeDays(created);
  const cls   = window.getAgeClass && window.getAgeClass(created);
  const lbl   = window.getAgeLabel && window.getAgeLabel(created);
  const styles = {
    'age-green': {bg:'#EAF3DE', c:'#3B6D11'},
    'age-amber': {bg:'#FAEEDA', c:'#854F0B'},
    'age-red':   {bg:'#FCEBEB', c:'#A32D2D'},
  };
  const v = (cls && styles[cls]) || styles['age-green'];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 20,
      font: '700 10.5px/1.3 Sora,sans-serif', whiteSpace: 'nowrap',
      background: v.bg, color: v.c,
    }}>{lbl || created || '—'}</span>
  );
};

// ─── MY TICKETS ──────────────────────────────────────────────────
const MyTickets = ({agent, tickets, onEdit}) => {
  const th = React.useContext(window.ThemeCtx);
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
  const counts = {
    all:        tickets.length,
    resolved:   tickets.filter(t => t.status === 'resolved').length,
    progress:   tickets.filter(t => t.status === 'progress').length,
    unresolved: tickets.filter(t => t.status === 'unresolved').length,
  };

  const tdStyle = {
    padding: '9px 11px',
    borderBottom: `1px solid ${th.tblRow || 'rgba(255,255,255,.04)'}`,
    color: th.text, verticalAlign: 'top',
  };

  return (
    <div style={{padding: '22px 28px'}}>
      {/* KPI filter chips */}
      <div style={{display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap'}}>
        {[
          ['all',        'All',          counts.all,        '#3B82F6'],
          ['resolved',   'Resolved',     counts.resolved,   '#4ADE80'],
          ['progress',   'In Progress',  counts.progress,   '#FCD34D'],
          ['unresolved', 'Unresolved',   counts.unresolved, '#F87171'],
        ].map(([k, label, n, c]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: '8px 14px', borderRadius: 8,
            border:  filter === k ? `2px solid ${c}` : `1px solid ${th.border}`,
            background: filter === k ? `${c}22` : th.card,
            color: th.text, font: '700 12px Sora,sans-serif',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all .15s',
          }}>
            {label}
            <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:11, color:c, fontWeight:800}}>{n}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: th.card, border: `1px solid ${th.border}`,
        borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${th.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: th.surface,
        }}>
          <h3 style={{font: '700 13px/1.2 Sora,sans-serif', color: th.text, margin: 0}}>
            My Tickets · {filtered.length}
          </h3>
          <span style={{font: '500 11px Sora,sans-serif', color: th.muted}}>
            Click any row to update
          </span>
        </div>

        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 11.5, fontFamily: 'Sora,sans-serif'}}>
            <thead>
              <tr style={{background: th.hdr}}>
                {['#','Ticket','Time','Customer','Phone','Meter','BU','Issue','Responsible','Age','Status'].map(h => (
                  <th key={h} style={{
                    padding: '9px 11px', textAlign: 'left',
                    font: '700 9px Sora,sans-serif', textTransform: 'uppercase',
                    letterSpacing: '.06em', color: th.muted, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.num} onClick={() => onEdit && onEdit(t)}
                  style={{cursor: 'pointer', transition: 'background .1s'}}
                  onMouseEnter={e => e.currentTarget.style.background = th.surface}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <span style={{fontFamily:'JetBrains Mono,monospace', color:th.muted}}>
                      {String(i+1).padStart(2,'0')}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#93C5FD'}}>
                      #{t.num}
                    </span>
                  </td>
                  <td style={tdStyle}>{t.time}</td>
                  <td style={tdStyle}>{t.name}</td>
                  <td style={tdStyle}>
                    <span style={{fontFamily:'JetBrains Mono,monospace', color:th.muted, fontSize:10}}>
                      {t.phone}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{fontFamily:'JetBrains Mono,monospace', color:th.muted, fontSize:10}}>
                      {t.meter}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:10,
                      font:'700 9.5px/1 Sora,sans-serif',background:'rgba(59,130,246,.10)',color:'#93C5FD',
                    }}>{t.bu}</span>
                  </td>
                  <td style={{...tdStyle, maxWidth:260}}>{t.issue}</td>
                  <td style={tdStyle}>{t.resp}</td>
                  <td style={tdStyle}><AgeBadge created={t.created}/></td>
                  <td style={tdStyle}><StatusPill s={t.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length && (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            color: th.muted, font: '500 12.5px Sora,sans-serif',
          }}>
            No tickets in this view.{' '}
            <span style={{color:'#FFC72C'}}>Try a different filter, or ➕ Add Ticket.</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ALL COMPLAINTS ───────────────────────────────────────────────
// Shows every ticket from every agent — used as the shared team view.
// Data flows from App.jsx: allTickets = flattened+sorted array with
//   _agentId, _agentName fields added to each ticket.
const AllComplaints = ({tickets}) => {
  const th = React.useContext(window.ThemeCtx);

  const [search,       setSearch]       = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [filterBU,     setFilterBU]     = React.useState('all');
  const [filterAgent,  setFilterAgent]  = React.useState('all');

  // Counts across the full unfiltered set
  const counts = React.useMemo(() => ({
    total:      tickets.length,
    resolved:   tickets.filter(t => t.status === 'resolved').length,
    progress:   tickets.filter(t => t.status === 'progress').length,
    unresolved: tickets.filter(t => t.status === 'unresolved').length,
  }), [tickets]);

  // Unique BUs and agents for filter dropdowns
  const buList = React.useMemo(() =>
    [...new Set(tickets.map(t => t.bu).filter(Boolean))].sort(),
  [tickets]);
  const agentList = React.useMemo(() =>
    [...new Set(tickets.map(t => t._agentName).filter(Boolean))].sort(),
  [tickets]);

  // Apply filters
  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return tickets.filter(t => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterBU     !== 'all' && t.bu      !== filterBU)     return false;
      if (filterAgent  !== 'all' && t._agentName !== filterAgent) return false;
      if (q && ![t.num, t.name, t.phone, t.bu, t.issue, t.resp, t.meter, t._agentName]
          .some(v => (v||'').toLowerCase().includes(q))) return false;
      return true;
    });
  }, [tickets, search, filterStatus, filterBU, filterAgent]);

  const tdStyle = {
    padding: '9px 11px',
    borderBottom: `1px solid ${th.tblRow || 'rgba(0,0,0,.04)'}`,
    color: th.text, verticalAlign: 'top', fontSize: 11.5,
  };

  // Small select style
  const sel = {
    padding: '8px 10px',
    background: th.card,
    border: `1px solid ${th.border}`,
    borderRadius: 8, color: th.text,
    fontFamily: 'Sora,sans-serif', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', outline: 'none',
  };

  return (
    <div style={{padding: '22px 28px'}}>
      {/* KPI row */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18}}>
        {[
          {label:'TOTAL',      v:counts.total,      c:'#3B82F6'},
          {label:'RESOLVED',   v:counts.resolved,   c:'#4ADE80'},
          {label:'IN PROGRESS',v:counts.progress,   c:'#FCD34D'},
          {label:'UNRESOLVED', v:counts.unresolved, c:'#F87171'},
        ].map(({label, v, c}) => (
          <div key={label} style={{
            background: th.card, border: `1px solid ${th.border}`,
            borderRadius: 10, padding: '12px 16px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{position:'absolute', top:0, left:0, right:0, height:3, background:c}}/>
            <div style={{
              font: '700 9px/1 Sora,sans-serif', color: th.muted,
              letterSpacing: '.10em', textTransform: 'uppercase', marginBottom: 5,
            }}>{label}</div>
            <div style={{
              fontFamily: 'JetBrains Mono,monospace', fontWeight: 800,
              fontSize: 26, color: c,
            }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Search + filters bar */}
      <div style={{display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center'}}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          flex: '1 1 200px', minWidth: 0,
          background: th.card, border: `1px solid ${th.border}`,
          borderRadius: 8, padding: '0 12px',
        }}>
          <span style={{color: th.muted, fontSize: 14}}>🔎</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ticket #, name, phone, BU, issue..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              padding: '9px 0', color: th.text,
              fontFamily: 'Sora,sans-serif', fontSize: 12,
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              background:'none',border:'none',color:th.muted,cursor:'pointer',fontSize:14,
            }}>✕</button>
          )}
        </div>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={sel}>
          <option value="all">All statuses</option>
          <option value="resolved">Resolved</option>
          <option value="progress">In Progress</option>
          <option value="unresolved">Unresolved</option>
        </select>

        <select value={filterBU} onChange={e => setFilterBU(e.target.value)} style={sel}>
          <option value="all">All BUs</option>
          {buList.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)} style={sel}>
          <option value="all">All agents</option>
          {agentList.map(a => <option key={a} value={a}>{a.split(' ')[0]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: th.card, border: `1px solid ${th.border}`,
        borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{
          padding: '13px 18px', borderBottom: `1px solid ${th.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: th.surface,
        }}>
          <h3 style={{font: '700 13px/1.2 Sora,sans-serif', color: th.text, margin: 0}}>
            All Complaints · {filtered.length}
            {filtered.length < tickets.length && (
              <span style={{font: '500 11px Sora,sans-serif', color: th.muted, marginLeft: 8}}>
                (filtered from {tickets.length})
              </span>
            )}
          </h3>
          <span style={{font: '500 11px Sora,sans-serif', color: th.muted}}>
            Sorted newest first · all agents
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            color: th.muted, font: '500 12.5px Sora,sans-serif',
          }}>
            No tickets match your filters.{' '}
            <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterBU('all'); setFilterAgent('all'); }}
              style={{background:'none',border:'none',color:'#FFC72C',font:'700 12.5px Sora,sans-serif',cursor:'pointer'}}>
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontFamily: 'Sora,sans-serif'}}>
              <thead>
                <tr style={{background: th.hdr}}>
                  {['#','Ticket','Time','Customer','Phone','BU','Category','Status','Agent','Note'].map(h => (
                    <th key={h} style={{
                      padding: '9px 11px', textAlign: 'left',
                      font: '700 9px Sora,sans-serif', textTransform: 'uppercase',
                      letterSpacing: '.06em', color: th.muted, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  // Agent accent color lookup
                  const agentRec = (window.EK_AGENTS || []).find(a => a.id === t._agentId);
                  const agentColor = agentRec?.color || '#6B85C0';
                  return (
                    <tr key={`${t._agentId}-${t.num}-${i}`}
                      style={{transition: 'background .1s'}}
                      onMouseEnter={e => e.currentTarget.style.background = th.surface}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdStyle}>
                        <span style={{fontFamily:'JetBrains Mono,monospace', color:th.muted, fontSize:10}}>
                          {String(i+1).padStart(2,'0')}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'#93C5FD', fontSize:11}}>
                          #{t.num}
                        </span>
                      </td>
                      <td style={{...tdStyle, whiteSpace:'nowrap'}}>
                        <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:10, color:th.muted}}>
                          {t.time}
                        </span>
                      </td>
                      <td style={{...tdStyle, fontWeight:600}}>{t.name}</td>
                      <td style={tdStyle}>
                        <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:10, color:th.muted}}>
                          {t.phone}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:10,
                          font:'700 9.5px/1 Sora,sans-serif',
                          background:'rgba(59,130,246,.10)',color:'#93C5FD',
                        }}>{t.bu}</span>
                      </td>
                      <td style={{...tdStyle, maxWidth:200}}>
                        <div style={{fontWeight:600, fontSize:11}}>{t.category || t.issue || '—'}</div>
                        {t.issue && t.category && (
                          <div style={{fontSize:10.5, color:th.muted, marginTop:2}}>
                            {t.issue.slice(0, 80)}{t.issue.length > 80 ? '…' : ''}
                          </div>
                        )}
                      </td>
                      <td style={tdStyle}><StatusPill s={t.status}/></td>
                      <td style={tdStyle}>
                        <span style={{
                          display:'inline-flex',alignItems:'center',gap:5,
                          padding:'2px 8px',borderRadius:10,
                          font:'700 9.5px/1 Sora,sans-serif',
                          background:`${agentColor}18`,color:agentColor,
                          whiteSpace:'nowrap',
                        }}>
                          {(t._agentName || '').split(' ')[0]}
                        </span>
                      </td>
                      <td style={{...tdStyle, maxWidth:200, color:th.muted, fontSize:11}}>
                        {t.note ? t.note.slice(0, 80) + (t.note.length > 80 ? '…' : '') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tip when empty */}
      {tickets.length === 0 && (
        <div style={{
          marginTop: 16, padding: '14px 18px',
          background: 'rgba(255,199,44,.08)', border: '1px dashed rgba(255,199,44,.30)',
          borderRadius: 10, font: '500 12px/1.55 Sora,sans-serif', color: '#FFC72C',
        }}>
          💡 No tickets loaded yet. Each agent should go to <strong>Import JSON</strong> and drop their daily export — or ask Esther to import the team's files at close of business.
        </div>
      )}
    </div>
  );
};

// ─── ADD TICKET ───────────────────────────────────────────────────
const AddTicket = ({agent, onCreate}) => {
  const th = React.useContext(window.ThemeCtx);
  const empty = {num:'', name:'', phone:'', meter:'', addr:'', bu:'ISLAND', issue:'', category:'METERING / UNABLE TO LOAD', resp:'Holyland Umude', status:'progress', note:''};
  const [form, setForm] = React.useState(empty);
  const [pasted, setPasted] = React.useState('');

  const setField = (k, v) => setForm(f => ({...f, [k]: v}));

  const tryParsePaste = (txt) => {
    setPasted(txt);
    const phoneMatch = txt.match(/(\+?234\d{10}|0\d{10})/);
    if (phoneMatch) setField('phone', phoneMatch[0]);
    const tktMatch = txt.match(/\b(7\d{5})\b/);
    if (tktMatch) setField('num', tktMatch[1]);
    const meterMatch = txt.match(/\b(\d{10,13})\b/);
    if (meterMatch && (!tktMatch || meterMatch[1] !== tktMatch[1])) setField('meter', meterMatch[1]);
    setField('issue', txt.slice(0, 200));
  };

  const create = () => {
    if (!form.num || !form.name) { alert('Need at least Ticket # and Customer name.'); return; }
    const now = new Date();
    const wat = new Date(now.toLocaleString('en-US', {timeZone:'Africa/Lagos'}));
    const newTk = {
      ...form,
      created: wat.toISOString().slice(0, 16).replace('T', ' '),
      time: wat.toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'}),
    };
    onCreate(newTk);
    setForm(empty); setPasted('');
  };

  const inp = {
    width: '100%', padding: '10px 12px',
    background: th.surface, color: th.text,
    border: `1px solid ${th.border}`,
    borderRadius: 8, fontFamily: 'Sora,sans-serif', fontSize: 12.5,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .15s, background .3s, color .3s',
  };

  return (
    <div style={{padding: '22px 28px', maxWidth: 1100}}>
      <div style={{
        background: `${agent.tint}`, border: `1px solid ${agent.color}55`,
        borderRadius: 12, padding: '14px 18px', marginBottom: 18,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <span style={{fontSize: 22}}>📋</span>
        <div>
          <div style={{font: '800 13px Sora,sans-serif', color: th.text}}>Add a new ticket</div>
          <div style={{font: '500 11.5px/1.5 Sora,sans-serif', color: th.muted, marginTop: 3}}>
            Drop the full text below — phone, meter and ticket number are auto-detected. Then fill in the rest.
          </div>
        </div>
      </div>

      <textarea value={pasted} onChange={e => tryParsePaste(e.target.value)}
        placeholder="Paste raw SharePoint complaint text here..."
        style={{
          ...inp, minHeight: 90, resize: 'vertical', lineHeight: 1.5,
          fontFamily: 'JetBrains Mono,monospace', fontSize: 11.5,
          marginBottom: 18,
        }}/>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14}}>
        <Field label="Ticket #" th={th}><input value={form.num} onChange={e=>setField('num',e.target.value)} placeholder="710xxx" style={inp}/></Field>
        <Field label="Customer Name" th={th}><input value={form.name} onChange={e=>setField('name',e.target.value)} style={inp}/></Field>
        <Field label="Phone" th={th}><input value={form.phone} onChange={e=>setField('phone',e.target.value)} placeholder="+234..." style={inp}/></Field>
        <Field label="Meter / Account #" th={th}><input value={form.meter} onChange={e=>setField('meter',e.target.value)} style={inp}/></Field>
        <Field label="Business Unit" th={th}>
          <select value={form.bu} onChange={e=>setField('bu',e.target.value)} style={inp}>
            {(window.EK_BUSINESS_UNITS||[]).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Responsible Party" th={th}>
          <select value={form.resp} onChange={e=>setField('resp',e.target.value)} style={inp}>
            {(window.EK_RESPONSIBLE_PARTIES||[]).map(r => <option key={r.sn} value={r.name}>{r.name}</option>)}
          </select>
        </Field>
        <Field label="Address" full th={th}><input value={form.addr} onChange={e=>setField('addr',e.target.value)} style={inp}/></Field>
        <Field label="Issue / Category" full th={th}><input value={form.issue} onChange={e=>setField('issue',e.target.value)} style={inp}/></Field>
        <Field label="Action Taken / Note" full th={th}>
          <textarea value={form.note} onChange={e=>setField('note',e.target.value)} style={{...inp, minHeight:64, resize:'vertical'}}/>
        </Field>
      </div>

      <div style={{display: 'flex', gap: 10}}>
        <button onClick={create} style={{
          padding: '12px 22px', background: agent.color, color: '#fff', border: 'none',
          borderRadius: 10, font: '800 13px Sora,sans-serif', cursor: 'pointer',
          boxShadow: `0 6px 18px ${agent.color}44`,
        }}>➕ Add to my tickets</button>
        <button onClick={() => { setForm(empty); setPasted(''); }} style={{
          padding: '12px 22px', background: th.surface, color: th.text,
          border: `1px solid ${th.border}`, borderRadius: 10,
          font: '700 13px Sora,sans-serif', cursor: 'pointer',
        }}>Clear</button>
      </div>
    </div>
  );
};

const Field = ({label, full, children, th}) => (
  <div style={{gridColumn: full ? '1 / -1' : 'auto'}}>
    <label style={{
      display: 'block', font: '700 10px/1 Sora,sans-serif',
      color: th?.muted || '#6B85C0', letterSpacing: '.6px',
      textTransform: 'uppercase', marginBottom: 5,
    }}>{label}</label>
    {children}
  </div>
);

// ─── UPDATE TICKET (Modal) ────────────────────────────────────────
const UpdateTicket = ({ticket, onClose, onSave, agent}) => {
  const th = React.useContext(window.ThemeCtx);
  if (!ticket) return null;
  const [form, setForm] = React.useState(ticket);
  const setField = (k, v) => setForm(f => ({...f, [k]:v}));
  const save = () => { onSave(form); onClose(); };

  const inp = {
    width: '100%', padding: '10px 12px',
    background: th.surface, color: th.text,
    border: `1px solid ${th.border}`,
    borderRadius: 8, fontFamily: 'Sora,sans-serif', fontSize: 12.5,
    outline: 'none', boxSizing: 'border-box',
    transition: 'background .3s, color .3s',
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '60px 20px 20px', overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 680,
        background: th.card,
        border: `1px solid ${agent.color}55`,
        borderRadius: 14, overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${th.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: `linear-gradient(135deg, ${agent.color}22, transparent)`,
        }}>
          <div>
            <div style={{font: '800 10px Sora,sans-serif', color: agent.color, letterSpacing: '.10em', textTransform: 'uppercase'}}>
              Update Ticket
            </div>
            <div style={{font: '800 17px Sora,sans-serif', color: th.text, fontFamily: 'JetBrains Mono,monospace', marginTop: 3}}>
              #{ticket.num} · {ticket.name}
            </div>
          </div>
          <button onClick={onClose} style={{background: 'none', border: 'none', color: th.muted, fontSize: 20, cursor: 'pointer'}}>✕</button>
        </div>

        <div style={{padding: '18px 20px'}}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14,
            padding: 12, background: th.surface, borderRadius: 8, border: `1px solid ${th.border}`,
          }}>
            <Meta label="Customer" value={`${ticket.name} · ${ticket.phone}`} th={th}/>
            <Meta label="Meter"    value={ticket.meter} th={th}/>
            <Meta label="BU"       value={ticket.bu} th={th}/>
            <Meta label="Responsible" value={ticket.resp} th={th}/>
            <div style={{gridColumn:'1/-1'}}><Meta label="Address" value={ticket.addr} th={th}/></div>
            <div style={{gridColumn:'1/-1'}}><Meta label="Issue"   value={ticket.issue} th={th}/></div>
          </div>

          <Field label="Action Taken / Response from Responsible Party" full th={{muted: th.muted}}>
            <textarea value={form.note} onChange={e => setField('note', e.target.value)}
              placeholder="Paste the response from Teams/WhatsApp here..."
              style={{...inp, minHeight: 120, resize: 'vertical', fontFamily: 'JetBrains Mono,monospace', fontSize: 11.5, lineHeight: 1.6}}/>
          </Field>

          <div style={{marginTop: 14, font: '700 10px Sora,sans-serif', color: th.muted, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 8}}>
            Update status
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8}}>
            {[
              ['resolved',   '✅ Resolved',    '#16A34A'],
              ['progress',   '⏳ In Progress', '#D97706'],
              ['unresolved', '🔴 Unresolved',  '#DC2626'],
            ].map(([k, lbl, c]) => (
              <button key={k} onClick={() => setField('status', k)} style={{
                padding: 12, borderRadius: 8,
                border: form.status === k ? `2px solid ${c}` : `2px solid ${th.border}`,
                background: form.status === k ? `${c}22` : th.surface,
                color: th.text, font: '700 12.5px Sora,sans-serif', cursor: 'pointer',
                transition: 'all .15s',
              }}>{lbl}</button>
            ))}
          </div>

          <div style={{marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
            <button onClick={onClose} style={{
              padding: '10px 18px', background: th.surface, color: th.text,
              border: `1px solid ${th.border}`, borderRadius: 8,
              font: '600 12px Sora,sans-serif', cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={save} style={{
              padding: '10px 22px', background: agent.color, color: '#fff', border: 'none',
              borderRadius: 8, font: '800 12.5px Sora,sans-serif', cursor: 'pointer',
              boxShadow: `0 4px 14px ${agent.color}44`,
            }}>Save update</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Meta = ({label, value, th}) => (
  <div>
    <div style={{font: '700 9px Sora,sans-serif', color: th?.muted || '#6B85C0', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 2}}>{label}</div>
    <div style={{font: '500 12px/1.4 Sora,sans-serif', color: th?.text || '#F0F4FF'}}>{value || '—'}</div>
  </div>
);

Object.assign(window, {MyTickets, AllComplaints, AddTicket, UpdateTicket, StatusPill, AgeBadge, Field, Meta});
