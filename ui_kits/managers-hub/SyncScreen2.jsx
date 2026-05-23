// OneDrive Sync screen — Microsoft Graph via MSAL.
// Uses string concatenation to avoid Babel template-literal issues.

const SyncScreen = () => {
  const [account, setAccount]   = React.useState(null);
  const [msalApp, setMsalApp]   = React.useState(null);
  const [clientId, setClientId] = React.useState(() => localStorage.getItem('ekedp_client_id') || '');
  const [statusMsg, setStatusMsg] = React.useState('');
  const [statusOk, setStatusOk]   = React.useState(true);
  const [lastSync, setLastSync]   = React.useState(() => localStorage.getItem('ekedp_last_sync') || '');
  const [busy, setBusy] = React.useState(false);

  const FOLDER   = 'EKEDP CX Live';
  const FILENAME = 'ekedp-cx-live.json';

  const toast = (msg, ok=true) => { setStatusMsg(msg); setStatusOk(ok); };

  const initMsal = (id) => {
    if (!window.msal) { toast('MSAL not loaded — check internet connection.', false); return; }
    try {
      const app = new window.msal.PublicClientApplication({
        auth: {
          clientId: id,
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: window.location.origin + window.location.pathname,
        },
        cache: { cacheLocation: 'localStorage' },
      });
      setMsalApp(app);
      const accounts = app.getAllAccounts();
      if (accounts.length > 0) setAccount(accounts[0]);
    } catch(e) { toast('MSAL init failed: ' + e.message, false); }
  };

  const saveClientId = () => {
    localStorage.setItem('ekedp_client_id', clientId);
    initMsal(clientId);
    toast('Client ID saved. Now sign in with Microsoft below.');
  };

  const signIn = async () => {
    if (!msalApp) { toast('Save your Client ID first.', false); return; }
    setBusy(true);
    try {
      const result = await msalApp.loginPopup({
        scopes: ['Files.ReadWrite', 'User.Read'],
        prompt: 'select_account',
      });
      setAccount(result.account);
      toast('Signed in as ' + result.account.name);
    } catch(e) {
      toast('Sign-in failed: ' + e.message, false);
    } finally { setBusy(false); }
  };

  const signOut = () => {
    if (msalApp && account) msalApp.logoutPopup();
    setAccount(null);
    toast('Signed out.');
  };

  const getToken = async () => {
    const result = await msalApp.acquireTokenSilent({
      scopes: ['Files.ReadWrite'],
      account,
    });
    return result.accessToken;
  };

  const syncNow = async () => {
    if (!account) { toast('Sign in with Microsoft first.', false); return; }
    setBusy(true); toast('Syncing...');
    try {
      const token = await getToken();
      const url = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + FOLDER + '/' + FILENAME + ':/content';
      const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
      if (!res.ok) throw new Error('File not found (' + res.status + '). Create ' + FOLDER + '/' + FILENAME + ' in your OneDrive first.');
      const data = await res.json();
      window.EK_SYNC_DATA = data;
      const t = new Date().toISOString();
      setLastSync(t); localStorage.setItem('ekedp_last_sync', t);
      toast('Synced — ' + Object.keys(data).join(', '));
    } catch(e) {
      toast('Sync failed: ' + e.message, false);
    } finally { setBusy(false); }
  };

  const pushData = async () => {
    if (!account) { toast('Sign in with Microsoft first.', false); return; }
    setBusy(true); toast('Pushing...');
    try {
      const token = await getToken();
      const url = 'https://graph.microsoft.com/v1.0/me/drive/root:/' + FOLDER + '/' + FILENAME + ':/content';
      const payload = {
        source: 'managers-hub',
        timestamp: new Date().toISOString(),
        tickets: window.EK_IMPORTED_TICKETS || [],
      };
      const res = await fetch(url, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Upload failed (' + res.status + ')');
      const t = new Date().toISOString();
      setLastSync(t); localStorage.setItem('ekedp_last_sync', t);
      toast('Pushed to OneDrive.');
    } catch(e) {
      toast('Push failed: ' + e.message, false);
    } finally { setBusy(false); }
  };

  return (
    <div style={{padding:'22px 28px', maxWidth:860}}>
      <div style={{marginBottom:18}}>
        <h2 style={{font:'800 17px/1.2 Sora,sans-serif', color:'var(--text)', margin:0}}>☁️ OneDrive Sync</h2>
        <p style={{font:'500 11.5px/1.45 Sora,sans-serif', color:'var(--muted)', margin:'4px 0 0'}}>
          One shared JSON file in your OneDrive. Both the Managers Hub and all 5 Agents Hubs read &amp; write to it — 100% accurate data across machines.
        </p>
      </div>

      {statusMsg && (
        <div style={{
          padding:'10px 16px', borderRadius:8, marginBottom:14,
          background: statusOk ? 'rgba(22,163,74,.15)' : 'rgba(220,38,38,.15)',
          border: statusOk ? '1px solid rgba(22,163,74,.3)' : '1px solid rgba(220,38,38,.3)',
          font:'600 12px Sora,sans-serif',
          color: statusOk ? '#4ADE80' : '#F87171',
        }}>{statusMsg}</div>
      )}

      <SyncCard num="1" title="Azure AD App Client ID">
        <p style={hint}>Register a free app at <b style={{color:'#93C5FD'}}>portal.azure.com → App registrations</b>. Copy the Application (client) ID and paste below. Only once.</p>
        <div style={{display:'flex', gap:8}}>
          <input value={clientId} onChange={e=>setClientId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            style={inp}/>
          <Btn onClick={saveClientId} color="#001F5C">💾 Save</Btn>
        </div>
      </SyncCard>

      <SyncCard num="2" title="Sign in with Microsoft">
        {account ? (
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#60A5FA,#1D4ED8)', display:'flex', alignItems:'center', justifyContent:'center', font:'800 15px Sora,sans-serif', color:'#fff'}}>
              {(account.name||'L')[0]}
            </div>
            <div>
              <div style={{font:'700 13px Sora,sans-serif', color:'var(--text)'}}>{account.name}</div>
              <div style={{font:'500 11px Sora,sans-serif', color:'var(--muted)'}}>{account.username}</div>
            </div>
            <Btn onClick={signOut} color="#DC2626" style={{marginLeft:'auto'}}>Sign out</Btn>
          </div>
        ) : (
          <Btn onClick={signIn} color="#0078D4" disabled={busy}>
            {busy ? '⏳ Signing in...' : '🔑 Sign in with Microsoft (EKEDP email)'}
          </Btn>
        )}
      </SyncCard>

      <SyncCard num="3" title="Sync">
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14}}>
          <StatTile label="Status"    value={account ? 'Connected' : 'Not signed in'} color={account ? '#4ADE80' : '#F87171'}/>
          <StatTile label="Last sync" value={lastSync ? new Date(lastSync).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) + ' ' + new Date(lastSync).toLocaleDateString('en-GB') : '—'} mono/>
          <StatTile label="File"      value={FOLDER + '/' + FILENAME}/>
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <Btn onClick={syncNow}  color="#16A34A" disabled={!account||busy}>⟳ Pull from OneDrive</Btn>
          <Btn onClick={pushData} color="#001F5C" disabled={!account||busy}>↑ Push to OneDrive</Btn>
        </div>
      </SyncCard>

      <div style={{
        background:'rgba(59,130,246,.06)', border:'1px dashed rgba(59,130,246,.25)',
        borderRadius:10, padding:'14px 16px',
        font:'500 12px/1.6 Sora,sans-serif', color:'rgba(240,244,255,.80)',
      }}>
        <b style={{color:'var(--text)'}}>How it works:</b> Both hubs sign in with EKEDP Microsoft accounts and read/write the same <span style={{fontFamily:'JetBrains Mono,monospace', color:'#93C5FD'}}>ekedp-cx-live.json</span> in your OneDrive. No shared passwords or copy-paste URLs — just work logins.
      </div>
    </div>
  );
};

const SyncCard = ({num, title, children}) => (
  <div style={{background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 18px', marginBottom:12}}>
    <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
      <div style={{width:24, height:24, borderRadius:'50%', background:'#E30613', color:'#fff', font:'900 12px Sora,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>{num}</div>
      <div style={{font:'800 13px Sora,sans-serif', color:'var(--text)'}}>{title}</div>
    </div>
    {children}
  </div>
);

const StatTile = ({label, value, color='var(--text)', mono}) => (
  <div style={{background:'rgba(255,255,255,.03)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px'}}>
    <div style={{font:'700 9px Sora,sans-serif', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.10em'}}>{label}</div>
    <div style={{font:'700 12px/1.3 ' + (mono?'JetBrains Mono,monospace':'Sora,sans-serif'), color, marginTop:4, wordBreak:'break-all'}}>{value}</div>
  </div>
);

const Btn = ({children, onClick, color='#001F5C', disabled, style={}}) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding:'10px 16px', background: disabled ? 'rgba(255,255,255,.06)' : color,
    color:'#fff', border:'none', borderRadius:8,
    font:'800 12px Sora,sans-serif', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? .5 : 1, ...style,
  }}>{children}</button>
);

const hint = {font:'500 11.5px/1.5 Sora,sans-serif', color:'var(--muted)', marginBottom:10};
const inp  = {flex:1, padding:'9px 11px', background:'var(--bg)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:8, fontFamily:'JetBrains Mono,monospace', fontSize:11, outline:'none'};

Object.assign(window, {SyncScreen});
