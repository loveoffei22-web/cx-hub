// Settings modal — theme picker, JSON load, OneDrive sync, account.
// Uses EK_BUS (SharedDataBus.js) so every loaded JSON auto-populates all hubs.

const SettingsModal = ({open, onClose, theme, onTheme, themes=[], onSignOut}) => {
  if (!open) return null;

  const fileInputRef  = React.useRef(null);
  const [syncUrl, setSyncUrl]       = React.useState(() => localStorage.getItem('ekedp_sync_url') || '');
  const [jsonPaste, setJsonPaste]   = React.useState('');
  const [msg, setMsg]               = React.useState(null);
  const [busStatus, setBusStatus]   = React.useState(() => window.EK_BUS ? window.EK_BUS.summary() : 'Bus not loaded');
  const [syncing, setSyncing]       = React.useState(false);

  const toast = (t, ok=true) => {
    setMsg({t, ok});
    setBusStatus(window.EK_BUS ? window.EK_BUS.summary() : '—');
    setTimeout(() => setMsg(null), 5000);
  };

  // ── Parse + validate JSON, save via EK_BUS ──────────────────────────────
  const processJSON = (raw, source) => {
    if (!raw || !raw.trim()) { toast('Nothing to load — paste your JSON first.', false); return false; }
    try {
      var parsed = JSON.parse(raw);
      // Support both { days: [...] } and raw array
      var days = Array.isArray(parsed) ? parsed : (parsed.days || null);
      if (!days || !days.length) { toast('JSON loaded but no "days" array found — check format.', false); return false; }

      var totalTickets = days.reduce(function(n, d) { return n + (d.tickets||[]).length; }, 0);

      var saved = window.EK_BUS.save(days, { source: source || 'paste', savedAt: new Date().toISOString() });
      if (!saved) { toast('Failed to save — localStorage may be full.', false); return false; }

      // Also update EK_DATA.SNAP so current session sees it immediately
      if (window.EK_DATA) {
        window.EK_DATA.SNAP = { days: days, activeDay: days[days.length-1].dayNum };
      }

      toast('✅ ' + days.length + ' days · ' + totalTickets + ' tickets loaded and pushed to all hubs!', true);
      return true;
    } catch(e) {
      toast('Invalid JSON — ' + e.message, false);
      return false;
    }
  };

  // ── Paste JSON ───────────────────────────────────────────────────────────
  const loadJson = () => processJSON(jsonPaste, 'paste') && setJsonPaste('');

  // ── Excel import ─────────────────────────────────────────────────────────
  const handleFile = (e) => {
    var file = e.target.files[0];
    if (!file) return;
    if (typeof XLSX === 'undefined') { toast('SheetJS not loaded — refresh and try again.', false); return; }
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var wb = XLSX.read(ev.target.result, {type:'array'});
        var sheetName = wb.SheetNames.find(function(n){ return /all complaint/i.test(n); }) || wb.SheetNames[0];
        var ws = wb.Sheets[sheetName];
        var rows = XLSX.utils.sheet_to_json(ws, {defval:''});
        var tickets = rows.map(function(r) {
          return {
            id: 'xl_' + Math.random().toString(36).slice(2),
            num:         String(r['Ticket'] || r['Ticket ID'] || r['ID'] || ''),
            time:        r['Time'] || '',
            name:        r['Customer Name'] || r['Customer'] || '',
            phone:       String(r['Telephone'] || r['Phone'] || ''),
            meter:       String(r['Meter/Account No.'] || r['METER_NUMBER'] || r['Meter No'] || ''),
            address:     r['Customer Address'] || r['Address'] || '',
            email:       r['Email'] || '',
            bu:          r['Business Unit'] || r['Business District'] || '',
            category:    r['Complaint Category'] || r['Category'] || '',
            subcategory: r['Complaint Sub-Category'] || r['Subcategory'] || '',
            note:        r['Action Taken'] || '',
            complaint:   r['Complaint Description'] || r['Issue'] || '',
            responsible: r['Responsible Party'] || '',
            channel:     r['Channel'] || 'Mobile App',
            status:      (function(s) {
              s = String(s).toLowerCase();
              if (s.includes('unresolved')) return 'unresolved';
              if (s.includes('resolved'))   return 'resolved';
              if (s.includes('progress'))   return 'progress';
              return 'unresolved';
            })(r['Status'] || ''),
            locked: false,
          };
        });

        // Wrap in a single day
        var today = new Date();
        var days = [{
          dayNum: today.getDate(),
          dateBig: today.getDate() + ' ' + ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][today.getMonth()],
          year: today.getFullYear() + ' · ' + ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][today.getDay()],
          tag: '📊 EXCEL IMPORT',
          headerSub: 'Customer Experience · Marina HQ · Mobile App Channel',
          execSummary: 'Imported from Excel: ' + sheetName,
          tickets: tickets,
          updatedBy: 'Excel Import',
          updatedDate: today.toLocaleDateString('en-GB'),
        }];

        var saved = window.EK_BUS.save(days, { source: 'excel', file: file.name });
        if (saved) toast('✅ Excel imported — ' + tickets.length + ' tickets pushed to all hubs!', true);
        else toast('Excel parsed but save failed.', false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch(err) {
        toast('Excel import failed: ' + err.message, false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── OneDrive URL fetch ───────────────────────────────────────────────────
  const saveSyncUrl = () => {
    localStorage.setItem('ekedp_sync_url', syncUrl);
    toast('Sync URL saved.');
  };

  const syncNow = async () => {
    if (!syncUrl.trim()) { toast('Paste a OneDrive URL first.', false); return; }
    setSyncing(true);
    try {
      // Convert 1drv.ms share links
      var url = syncUrl.trim();
      if (/1drv\.ms/i.test(url) && !url.includes('download=1')) {
        url = url + (url.includes('?') ? '&' : '?') + 'download=1';
      }
      var r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' — check the URL and sharing settings');
      var data = await r.json();
      var ok = processJSON(JSON.stringify(data), 'onedrive');
      if (!ok) throw new Error('Data received but format not recognised');
    } catch(e) {
      toast('Sync failed: ' + e.message, false);
    } finally {
      setSyncing(false);
    }
  };

  const clearData = () => {
    if (!window.confirm('Clear all shared data? All hubs will lose current data.')) return;
    window.EK_BUS.clear();
    toast('Shared data cleared.', true);
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:900,
      background:'rgba(0,0,0,.65)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'flex-start', justifyContent:'center',
      padding:'40px 20px 20px', overflowY:'auto',
    }}>
      <div onClick={function(e){e.stopPropagation();}} style={{
        width:'100%', maxWidth:640,
        background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:16, overflow:'hidden',
      }}>

        {/* Header */}
        <div style={{padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,.03)'}}>
          <h3 style={{font:'800 15px/1 Sora,sans-serif', color:'var(--text)', margin:0}}>⚙ Settings</h3>
          <button onClick={onClose} style={{background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer', lineHeight:1}}>✕</button>
        </div>

        {/* Toast */}
        {msg && (
          <div style={{
            padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,.06)',
            font:'700 12.5px Sora,sans-serif',
            background: msg.ok ? 'rgba(22,163,74,.15)' : 'rgba(220,38,38,.15)',
            color: msg.ok ? '#4ADE80' : '#F87171',
          }}>{msg.t}</div>
        )}

        {/* Live bus status banner */}
        <div style={{
          padding:'10px 20px', borderBottom:'1px solid var(--border)',
          background:'rgba(59,130,246,.06)',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
        }}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{width:8, height:8, borderRadius:'50%', background: busStatus.includes('No data') ? '#F59E0B' : '#4ADE80', display:'inline-block', flexShrink:0}}/>
            <span style={{font:'600 11.5px Sora,sans-serif', color:'var(--text)'}}>{busStatus}</span>
          </div>
          <button onClick={clearData} style={{
            background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.3)',
            color:'#F87171', padding:'4px 10px', borderRadius:6,
            font:'700 10px Sora,sans-serif', cursor:'pointer',
          }}>Clear data</button>
        </div>

        <div style={{padding:'18px 20px', display:'flex', flexDirection:'column', gap:22}}>

          {/* THEME */}
          <Sec title="🎨 Theme">
            <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:8}}>
              <ThemeBtn id="auto" label="Auto" emoji="" sw="linear-gradient(135deg,#DBEAFE,#001040,#F59E0B)" desc="by time" onTheme={onTheme} active={false}/>
              {themes.map(function(t){ return <ThemeBtn key={t.id} id={t.id} label={t.label} emoji={t.emoji} sw={t.sw} desc="" onTheme={onTheme} active={theme===t.id}/>; })}
            </div>
            <div style={{font:'500 11px Sora,sans-serif', color:'var(--muted)'}}>Auto: ☀️ Daylight 6–11 AM · 🌅 Solar 12–4 PM · 🌙 Midnight otherwise (Lagos WAT)</div>
          </Sec>

          {/* LEVEL 1 TEST — Paste JSON */}
          <Sec title="📋 Load JSON — paste or drop (Level 1 test)">
            <div style={{
              background:'rgba(59,130,246,.08)', border:'1px solid rgba(59,130,246,.25)',
              borderRadius:8, padding:'10px 14px', marginBottom:12,
              font:'500 11.5px/1.5 Sora,sans-serif', color:'rgba(240,244,255,.8)',
            }}>
              💡 <strong style={{color:'#93C5FD'}}>How this works:</strong> Paste your JSON here → click Load →
              data is saved to shared storage and <strong style={{color:'#93C5FD'}}>pushed to every open hub automatically</strong>.
              No refresh needed.
            </div>
            <textarea value={jsonPaste} onChange={function(e){setJsonPaste(e.target.value);}}
              placeholder={'Paste JSON here — { "days": [...] }\n\nFor Level 1 test, paste the test JSON provided in chat.\nFor production, paste your Power Automate output.'}
              style={{
                width:'100%', minHeight:100, padding:11, marginBottom:10,
                background:'var(--bg)', color:'var(--text)',
                border:'1px solid var(--border)', borderRadius:8,
                fontFamily:'JetBrains Mono,monospace', fontSize:11,
                outline:'none', resize:'vertical', boxSizing:'border-box', lineHeight:1.5,
              }}/>
            <div style={{display:'flex', gap:8}}>
              <button onClick={loadJson} style={btnPrimary}>▶ Load JSON → push to all hubs</button>
              <button onClick={function(){setJsonPaste('');}} style={btnSecondary}>✕ Clear</button>
            </div>
          </Sec>

          {/* EXCEL IMPORT */}
          <Sec title="📊 Import Excel (.xlsx)">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{display:'none'}} onChange={handleFile}/>
            <button onClick={function(){if(fileInputRef.current) fileInputRef.current.click();}} style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'11px 20px', background:'#107C41', color:'#fff',
              border:'none', borderRadius:8, font:'800 12px Sora,sans-serif', cursor:'pointer',
            }}>📊 Choose Excel file (.xlsx)</button>
            <div style={{font:'500 11px Sora,sans-serif', color:'var(--muted)', marginTop:8}}>
              Maps SharePoint columns automatically. Data pushed to all hubs on import.
            </div>
          </Sec>

          {/* ONEDRIVE URL — Level 2 */}
          <Sec title="☁️ OneDrive sync URL (Level 2 test)">
            <div style={{
              background:'rgba(255,199,44,.06)', border:'1px solid rgba(255,199,44,.2)',
              borderRadius:8, padding:'10px 14px', marginBottom:12,
              font:'500 11.5px/1.5 Sora,sans-serif', color:'rgba(240,244,255,.75)',
            }}>
              💡 Upload your JSON to OneDrive → Share with "Anyone with link" → paste URL below → click Sync.
              Format: <code style={{fontFamily:'JetBrains Mono,monospace', color:'#FFC72C'}}>https://1drv.ms/u/s!Axx...?download=1</code>
            </div>
            <input value={syncUrl} onChange={function(e){setSyncUrl(e.target.value);}}
              placeholder="https://1drv.ms/u/s!Axxxxxxxxx?download=1"
              style={{
                width:'100%', padding:'10px 12px', marginBottom:10,
                background:'var(--bg)', color:'var(--text)',
                border:'1px solid var(--border)', borderRadius:8,
                fontFamily:'JetBrains Mono,monospace', fontSize:11,
                outline:'none', boxSizing:'border-box',
              }}/>
            <div style={{display:'flex', gap:8}}>
              <button onClick={saveSyncUrl} style={btnPrimary}>💾 Save URL</button>
              <button onClick={syncNow} disabled={syncing} style={Object.assign({}, btnSecondary, syncing?{opacity:.5}:{})}>
                {syncing ? '⏳ Fetching...' : '⟳ Sync now → push to all hubs'}
              </button>
            </div>
          </Sec>

          {/* ACCOUNT */}
          <Sec title="Account">
            <p style={{font:'500 12px/1.4 Sora,sans-serif', color:'var(--muted)', margin:'0 0 12px'}}>
              Signed in as <b style={{color:'var(--text)'}}>Love Offei</b> · Manager · Managers Hub
            </p>
            <button onClick={function(){onClose(); if(onSignOut) onSignOut();}} style={btnDanger}>Sign out</button>
          </Sec>

        </div>
      </div>
    </div>
  );
};

const ThemeBtn = ({id, label, emoji, sw, desc, onTheme, active}) => (
  <button onClick={function(){onTheme(id);}} style={{
    background:'var(--surface)', border: active ? '2px solid #3B82F6' : '2px solid var(--border)',
    borderRadius:10, padding:10, cursor:'pointer', textAlign:'center', color:'var(--text)',
    fontFamily:'Sora,sans-serif', transition:'all .15s',
  }}>
    <div style={{width:'100%', height:40, borderRadius:6, marginBottom:6, background:sw, border:'1px solid rgba(255,255,255,.10)'}}/>
    <div style={{fontSize:11, fontWeight:800, color:active?'#60A5FA':'var(--text)'}}>{emoji} {label}</div>
    {desc && <div style={{fontSize:9, color:'var(--muted)', marginTop:2}}>{desc}</div>}
  </button>
);

const Sec = ({title, children}) => (
  <div>
    <div style={{font:'700 10px/1 Sora,sans-serif', color:'var(--muted)', letterSpacing:'.6px', textTransform:'uppercase', marginBottom:10}}>{title}</div>
    {children}
  </div>
);

const btnPrimary   = {padding:'10px 18px', background:'#001F5C', color:'#fff', border:'none', borderRadius:8, font:'800 12.5px Sora,sans-serif', cursor:'pointer'};
const btnSecondary = {padding:'10px 14px', background:'rgba(255,255,255,.06)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:8, font:'700 12px Sora,sans-serif', cursor:'pointer'};
const btnDanger    = {padding:'10px 18px', background:'rgba(220,38,38,.15)', color:'#F87171', border:'1px solid rgba(220,38,38,.3)', borderRadius:8, font:'700 12.5px Sora,sans-serif', cursor:'pointer'};

Object.assign(window, {SettingsModal});
