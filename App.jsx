// Agents Hub — App orchestrator.
// Sign in → pick name → enter ekedp2026 → main shell.
// v2: theme system, localStorage persistence, All Complaints, import-merge

// ── THEME DEFINITIONS ────────────────────────────────────────────
const THEMES = {
  midnight: {
    bg:      '#060E2B',
    surface: '#0D1B45',
    card:    '#111D4A',
    border:  '#1E3070',
    text:    '#F0F4FF',
    muted:   '#6B85C0',
    sub:     '#3A5299',
    hdr:     'rgba(0,31,92,.75)',
    tblRow:  'rgba(255,255,255,.04)',
    dark:    true,
  },
  daylight: {
    bg:      '#F4F6FB',
    surface: '#FFFFFF',
    card:    '#FFFFFF',
    border:  '#E2E8F0',
    text:    '#0F172A',
    muted:   '#64748B',
    sub:     '#94A3B8',
    hdr:     '#EFF6FF',
    tblRow:  'rgba(0,0,0,.025)',
    dark:    false,
  },
  solar: {
    bg:      '#2A1A06',
    surface: '#3F2C12',
    card:    '#52391B',
    border:  '#7A5A28',
    text:    '#FFF7E5',
    muted:   '#E8C98A',
    sub:     '#C9A968',
    hdr:     'rgba(74,39,6,.80)',
    tblRow:  'rgba(255,255,255,.04)',
    dark:    true,
  },
};

// Auto-theme: daylight 06:00–17:59 WAT, midnight otherwise
const getAutoTheme = () => {
  const h = new Date(new Date().toLocaleString('en-US', {timeZone:'Africa/Lagos'})).getHours();
  return (h >= 6 && h < 18) ? 'daylight' : 'midnight';
};

// Global context — every component can pull {bg, surface, card, border, text, muted, sub, dark}
const ThemeCtx = React.createContext(THEMES.midnight);
// Expose for other files loaded via <script> tags
window.ThemeCtx = ThemeCtx;
window.THEMES   = THEMES;

// ── APP ──────────────────────────────────────────────────────────
const App = () => {
  // ── theme ────────────────────────────────────────────────────
  const [themeName, setThemeName] = React.useState(
    () => localStorage.getItem('ek_theme') || 'midnight'
  );
  const resolvedTheme = themeName === 'auto' ? getAutoTheme() : themeName;
  const th = THEMES[resolvedTheme] || THEMES.midnight;

  React.useEffect(() => {
    localStorage.setItem('ek_theme', themeName);
  }, [themeName]);

  // Auto-theme: re-resolve every minute
  const [, forceRender] = React.useState(0);
  React.useEffect(() => {
    if (themeName !== 'auto') return;
    const id = setInterval(() => forceRender(n => n + 1), 60_000);
    return () => clearInterval(id);
  }, [themeName]);

  // ── state ────────────────────────────────────────────────────
  const [agent,   setAgent]   = React.useState(null);
  const [active,  setActive]  = React.useState('tickets');
  const [editing, setEditing] = React.useState(null);
  const [toast,   setToast]   = React.useState(null);

  // Tickets persisted to localStorage — keyed by agentId
  const [tickets, setTickets] = React.useState(() => {
    try {
      const saved = localStorage.getItem('ek_all_tickets');
      if (saved) return JSON.parse(saved);
    } catch (_) { /* ignore */ }
    return window.AGENT_TICKETS || {};
  });

  React.useEffect(() => {
    try { localStorage.setItem('ek_all_tickets', JSON.stringify(tickets)); }
    catch (_) { /* storage full — ignore */ }
  }, [tickets]);

  // ── toast helper ─────────────────────────────────────────────
  React.useEffect(() => {
    window.EK_TOAST = (msg, kind = 'ok') => {
      setToast({msg, kind});
      setTimeout(() => setToast(null), 3500);
    };
  }, []);

  // ── sign in screen ───────────────────────────────────────────
  if (!agent) {
    return (
      <ThemeCtx.Provider value={th}>
        <AgentsSignin onSubmit={(a) => {
          setAgent(a);
          const n = (tickets[a.id] || []).length;
          setTimeout(() => window.EK_TOAST(`Signed in as ${a.name.split(' ')[0]}. ${n} ticket${n!==1?'s':''} loaded.`), 200);
        }}/>
      </ThemeCtx.Provider>
    );
  }

  // ── derived data ─────────────────────────────────────────────
  const myTickets = tickets[agent.id] || [];

  // All Complaints = flatten every agent's tickets, tag each with agent info
  const allTickets = React.useMemo(() => {
    const agents = window.EK_AGENTS || [];
    return Object.entries(tickets)
      .flatMap(([agentId, tks]) => {
        const agentRec = agents.find(a => a.id === agentId);
        const agentName = agentRec?.name || agentId;
        return tks.map(t => ({...t, _agentId: agentId, _agentName: agentName}));
      })
      .sort((a, b) => {
        // Sort by ticket number descending (newest first)
        const na = parseInt(a.num || '0', 10);
        const nb = parseInt(b.num || '0', 10);
        return nb - na;
      });
  }, [tickets]);

  // ── ticket mutations ─────────────────────────────────────────
  const addTicket = (newTk) => {
    setTickets(t => ({...t, [agent.id]: [newTk, ...(t[agent.id] || [])]}));
    setActive('tickets');
    window.EK_TOAST(`Ticket #${newTk.num} added.`);
  };

  const saveTicket = (updated) => {
    setTickets(t => ({
      ...t,
      [agent.id]: (t[agent.id] || []).map(x => x.num === updated.num ? updated : x),
    }));
    window.EK_TOAST(`Ticket #${updated.num} updated.`);
  };

  // ── IMPORT MERGE ─────────────────────────────────────────────
  // importAgentData merges tickets for a specific agent
  // (keyed by exportedBy.id in the JSON, or current agent as fallback)
  // New tickets (unseen num) are prepended; existing are left untouched.
  const importAgentData = React.useCallback(({agentId, agentName, importedTickets}) => {
    setTickets(prev => {
      const existing  = prev[agentId] || [];
      const seenNums  = new Set(existing.map(t => t.num));
      const fresh     = importedTickets.filter(t => !seenNums.has(t.num));
      const updated   = [...fresh, ...existing];

      window.EK_TOAST(
        `✅ Merged ${fresh.length} new ticket${fresh!==1?'s':''} from ${agentName}` +
        (fresh.length < importedTickets.length
          ? ` (${importedTickets.length - fresh.length} already existed, skipped)`
          : ''),
        'ok'
      );
      return {...prev, [agentId]: updated};
    });
  }, []);

  // ── screen routing ───────────────────────────────────────────
  const screen = {
    tickets: <MyTickets  agent={agent} tickets={myTickets} onEdit={setEditing}/>,
    all:     <AllComplaints tickets={allTickets} />,
    add:     <AddTicket  agent={agent} onCreate={addTicket}/>,
    slot:    <SlotUpdates agent={agent} tickets={myTickets}/>,
    import:  <ImportJSON  currentAgent={agent} onImport={importAgentData}/>,
    export:  <ExportDay   agent={agent} tickets={myTickets}/>,
  }[active] || null;

  return (
    <ThemeCtx.Provider value={th}>
      <Shell
        agent={agent}
        active={active}
        onChange={setActive}
        themeName={themeName}
        onTheme={setThemeName}
        onSignOut={() => { setAgent(null); setActive('tickets'); }}
      >
        {screen}
      </Shell>

      {editing && (
        <UpdateTicket
          ticket={editing}
          agent={agent}
          onClose={() => setEditing(null)}
          onSave={saveTicket}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
          background:
            toast.kind === 'warn' ? 'rgba(217,119,6,.95)' :
            toast.kind === 'err'  ? 'rgba(220,38,38,.95)' :
                                    'rgba(22,163,74,.95)',
          color: '#fff', padding: '12px 18px', borderRadius: 10,
          font: '700 12px Sora,sans-serif',
          boxShadow: '0 8px 32px rgba(0,0,0,.4)',
          maxWidth: 340, lineHeight: 1.45,
        }}>
          {toast.kind === 'warn' ? '⚠ ' : toast.kind === 'err' ? '✕ ' : '✔ '}
          {toast.msg}
        </div>
      )}
    </ThemeCtx.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
