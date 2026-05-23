// Settings modal — theme picker, Excel import, JSON load,
// OneDrive sync URL, account sign-out.
// No template literals (Babel-safe).

const SettingsModal = ({open, onClose, theme, onTheme, themes=[], onSignOut}) => {
  if (!open) return null;

  const fileInputRef = React.useRef(null);
  const [syncUrl, setSyncUrl]     = React.useState(() => localStorage.getItem('ekedp_sync_url') || '');
  const [jsonPaste, setJsonPaste] = React.useState('');
  const [msg, setMsg]             = React.useState(null);

  const toast = (t, ok=true) => {
    setMsg({t, ok});
    setTimeout(() => setMsg(null), 4000);
  };

  // ── EXCEL IMPORT ──────────────────────────────────────────
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (typeof XLSX === 'undefined') {
      toast('SheetJS not loaded — refresh the page and try again.', false);
      return;
    }
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const wb = XLSX.read(ev.target.result, {type: 'array'});
        // Try "All Complaint" sheet, else first sheet
        const sheetName = wb.SheetNames.find(function(n){ return /all complaint/i.test(n); }) || wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, {defval: ''});

        const tickets = rows.map(function(r) {
          return {
            num:      String(r['Ticket']      || r['ID']               || ''),
            time:     r['Time']               || '',
            created:  r['Date/Time Received'] || r['Received Date']    || r['Time'] || '',
            name:     r['Customer']           || r['Customer Name']    || '',
            phone:    String(r['Phone']       || r['Telephone Number'] || ''),
            meter:    String(r['METER_NUMBER']|| r['Meter No']         || ''),
            addr:     r['Address']            || r['Customer Address'] || '',
            bu:       r['Business District']  || r['Business Unit']    || '',
            issue:    r['Issue']              || r['Complaint Description'] || '',
            category: r['Category']           || r['Complaint Category']   || '',
            status:   window.canonicalStatus  ? window.canonicalStatus(r['Status']) : (r['Status']||'').toLowerCase(),
            resp:     window.canonicalParty   ? window.canonicalParty('', r['Category']) : '',
            note:     r['Action Taken']       || '',
            channel:  r['Channel']            || 'Mobile App',
          };
        });

        localStorage.setItem('ekedp_imported_tickets', JSON.stringify(tickets));
        window.EK_IMPORTED_TICKETS = tickets;
        toast('Imported ' + tickets.length + ' tickets from "' + sheetName + '".');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        toast('Import failed: ' + err.message, false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── JSON LOAD ─────────────────────────────────────────────
  const loadJson = () => {
    if (!jsonPaste.trim()) { toast('Paste some JSON first.', false); return; }
    try {
      const d = JSON.parse(jsonPaste);
      localStorage.setItem('ekedp_snapshot', JSON.stringify(d));
      window.EK_SNAPSHOT = d;
      toast('JSON loaded — ' + Object.keys(d).length + ' keys found.');
      setJsonPaste('');
    } catch (e) {
      toast('Invalid JSON — ' + e.message, false);
    }
  };

  // ── SYNC URL ──────────────────────────────────────────────
  const saveSyncUrl = () => {
    localStorage.setItem('ekedp_sync_url', syncUrl);
    toast('Sync URL saved.');
  };
  const clearSyncUrl = () => {
    localStorage.removeItem('ekedp_sync_url');
    setSyncUrl('');
    toast('Sync URL cleared.');
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 20px 20px', overflowY: 'auto',
    }}>
      <div onClick={function(e){ e.stopPropagation(); }} style={{
        width: '100%', maxWidth: 600,
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255,255,255,.03)',
        }}>
          <h3 style={{font: '800 15px/1 Sora,sans-serif', color: 'var(--text)', margin: 0}}>⚙ Settings</h3>
          <button onClick={onClose} style={{background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1}}>✕</button>
        </div>

        {/* Toast */}
        {msg && (
          <div style={{
            padding: '11px 20px',
            borderBottom: '1px solid rgba(255,255,255,.06)',
            font: '700 12.5px Sora,sans-serif',
            background: msg.ok ? 'rgba(22,163,74,.15)' : 'rgba(220,38,38,.15)',
            color: msg.ok ? '#4ADE80' : '#F87171',
          }}>{msg.t}</div>
        )}

        <div style={{padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 22}}>

          {/* THEME */}
          <Sec title="🎨 Theme">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 8}}>
              <ThemeBtn id="auto" label="Auto" emoji="" sw="linear-gradient(135deg,#DBEAFE,#001040,#F59E0B)" desc="by time" onTheme={onTheme} active={false}/>
              {themes.map(function(t){
                return <ThemeBtn key={t.id} id={t.id} label={t.label} emoji={t.emoji} sw={t.sw} desc="" onTheme={onTheme} active={theme===t.id}/>;
              })}
            </div>
            <div style={{font: '500 11px Sora,sans-serif', color: 'var(--muted)'}}>
              Auto: ☀️ Daylight 6–11 AM · 🌅 Solar 12–4 PM · 🌙 Midnight otherwise (Lagos WAT)
            </div>
          </Sec>

          {/* EXCEL IMPORT */}
          <Sec title="📊 Import Excel (.xlsx) — All Complaint sheet">
            <p style={{font: '500 11.5px/1.5 Sora,sans-serif', color: 'var(--muted)', margin: '0 0 12px'}}>
              Upload your "All Complaint" Excel export. Columns auto-mapped: Ticket · Date/Time Received · Customer · Phone · METER_NUMBER · Address · Business District · Category · Status · Action Taken.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{display: 'none'}}
              onChange={handleFile}
            />
            <button
              onClick={function(){ if(fileInputRef.current) fileInputRef.current.click(); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 20px', background: '#107C41', color: '#fff',
                border: 'none', borderRadius: 8,
                font: '800 13px Sora,sans-serif', cursor: 'pointer',
              }}
            >
              📊 Choose Excel file (.xlsx)
            </button>
          </Sec>

          {/* JSON SNAPSHOT */}
          <Sec title="📋 Import JSON snapshot">
            <textarea
              value={jsonPaste}
              onChange={function(e){ setJsonPaste(e.target.value); }}
              placeholder='Paste JSON snapshot here — {"days":[…]} or {"tickets":[…]}'
              style={{
                width: '100%', minHeight: 80, padding: 11, marginBottom: 10,
                background: 'var(--bg)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: 8,
                fontFamily: 'JetBrains Mono,monospace', fontSize: 11.5,
                outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5,
              }}
            />
            <button onClick={loadJson} style={btnPrimary}>Load JSON →</button>
          </Sec>

          {/* ONEDRIVE SYNC */}
          <Sec title="☁️ OneDrive sync URL">
            <p style={{font: '500 11.5px/1.5 Sora,sans-serif', color: 'var(--muted)', margin: '0 0 10px'}}>
              Paste a direct-download URL from OneDrive (right-click file → Share → "Anyone with link" → copy, then change <span style={{fontFamily:'JetBrains Mono,monospace', color:'var(--text)'}}>?e=…</span> to <span style={{fontFamily:'JetBrains Mono,monospace', color:'var(--text)'}}>?download=1</span>). Both hubs read and write to this one JSON file.
            </p>
            <input
              value={syncUrl}
              onChange={function(e){ setSyncUrl(e.target.value); }}
              placeholder="https://onedrive.live.com/...?download=1"
              style={{
                width: '100%', padding: '10px 12px', marginBottom: 10,
                background: 'var(--bg)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: 8,
                fontFamily: 'JetBrains Mono,monospace', fontSize: 11,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{display: 'flex', gap: 8}}>
              <button onClick={saveSyncUrl} style={btnPrimary}>💾 Save URL</button>
              <button onClick={function(){ fetch(syncUrl).then(function(r){return r.json();}).then(function(d){window.EK_SYNC_DATA=d;toast('Synced — '+Object.keys(d).length+' keys.');}).catch(function(e){toast('Sync failed: '+e.message,false);}); }} style={btnSecondary}>⟳ Sync now</button>
              <button onClick={clearSyncUrl} style={btnSecondary}>Clear</button>
            </div>
          </Sec>

          {/* ACCOUNT */}
          <Sec title="Account">
            <p style={{font: '500 12px/1.4 Sora,sans-serif', color: 'var(--muted)', margin: '0 0 12px'}}>
              Signed in as <b style={{color: 'var(--text)'}}>Love Offei</b> · Manager · Managers Hub
            </p>
            <button
              onClick={function(){ onClose(); if(onSignOut) onSignOut(); }}
              style={btnDanger}
            >Sign out</button>
          </Sec>

        </div>
      </div>
    </div>
  );
};

const ThemeBtn = ({id, label, emoji, sw, desc, onTheme, active}) => (
  <button onClick={function(){ onTheme(id); }} style={{
    background: 'var(--surface)',
    border: active ? '2px solid #3B82F6' : '2px solid var(--border)',
    borderRadius: 10, padding: 10, cursor: 'pointer', textAlign: 'center',
    color: 'var(--text)', fontFamily: 'Sora,sans-serif', transition: 'all .15s',
  }}>
    <div style={{width: '100%', height: 40, borderRadius: 6, marginBottom: 6, background: sw, border: '1px solid rgba(255,255,255,.10)'}}/>
    <div style={{fontSize: 11, fontWeight: 800, color: active ? '#60A5FA' : 'var(--text)'}}>{emoji} {label}</div>
    {desc && <div style={{fontSize: 9, color: 'var(--muted)', marginTop: 2}}>{desc}</div>}
  </button>
);

const Sec = ({title, children}) => (
  <div>
    <div style={{font: '700 10px/1 Sora,sans-serif', color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 10}}>{title}</div>
    {children}
  </div>
);

const btnPrimary  = {padding: '10px 18px', background: '#001F5C', color: '#fff', border: 'none', borderRadius: 8, font: '800 12.5px Sora,sans-serif', cursor: 'pointer'};
const btnSecondary= {padding: '10px 14px', background: 'rgba(255,255,255,.06)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, font: '700 12px Sora,sans-serif', cursor: 'pointer'};
const btnDanger   = {padding: '10px 18px', background: 'rgba(220,38,38,.15)', color: '#F87171', border: '1px solid rgba(220,38,38,.3)', borderRadius: 8, font: '700 12.5px Sora,sans-serif', cursor: 'pointer'};

Object.assign(window, {SettingsModal});
