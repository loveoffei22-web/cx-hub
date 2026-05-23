// Agents Hub — App orchestrator.

const App = () => {
  const [agent, setAgent]     = React.useState(null);
  const [active, setActive]   = React.useState('tickets');
  const [editing, setEditing] = React.useState(null);
  const [toast, setToast]     = React.useState(null);

  const resolveAuto = () => {
    const h = new Date(new Date().toLocaleString('en-US',{timeZone:'Africa/Lagos'})).getHours();
    return h >= 6 && h < 12 ? 'daylight' : h >= 12 && h < 17 ? 'solar' : 'violet';
  };

  const [theme, setTheme] = React.useState(() =>
    localStorage.getItem('ekedp_shared_theme') ||
    localStorage.getItem('ekedp_agent_theme')  ||
    resolveAuto()
  );

  // Sync with Manager's Hub theme changes
  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ekedp_shared_theme' && e.newValue) setTheme(e.newValue);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // ALWAYS set data-theme attribute so every CSS theme rule fires
  React.useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('ekedp_agent_theme', theme);
  }, [theme]);

  const [tickets, setTickets] = React.useState({});
  React.useEffect(() => { setTickets(window.AGENT_TICKETS || {}); }, []);

  React.useEffect(() => {
    window.EK_TOAST = (msg, kind='ok') => {
      setToast({msg, kind});
      setTimeout(() => setToast(null), 3500);
    };
  }, []);

  if (!agent) {
    return <AgentsSignin onSubmit={(a) => {
      setAgent(a);
      setTimeout(() => window.EK_TOAST(
        `Signed in as ${a.name.split(' ')[0]}. ${(window.AGENT_TICKETS||{})[a.id]?.length || 0} tickets loaded.`
      ), 200);
    }}/>;
  }

  const myTickets = tickets[agent.id] || [];

  const addTicket = (newTk) => {
    setTickets(t => ({...t, [agent.id]: [newTk, ...(t[agent.id]||[])]}));
    setActive('tickets');
    window.EK_TOAST(`Ticket #${newTk.num} added.`);
  };

  const saveTicket = (updated) => {
    setTickets(t => ({
      ...t,
      [agent.id]: (t[agent.id]||[]).map(x => x.num === updated.num ? updated : x),
    }));
    window.EK_TOAST(`Ticket #${updated.num} updated.`);
  };

  const deleteTicket = (num) => {
    setTickets(t => ({
      ...t,
      [agent.id]: (t[agent.id]||[]).filter(x => x.num !== num),
    }));
    window.EK_TOAST(`Ticket #${num} deleted.`, 'warn');
  };

  const screen = {
    tickets: <MyTickets   agent={agent} tickets={myTickets} onEdit={setEditing}/>,
    add:     <AddTicket   agent={agent} onCreate={addTicket}/>,
    slot:    <SlotUpdates agent={agent} tickets={myTickets}/>,
    inbox:   <Inbox       agent={agent}/>,
    export:  <ExportDay   agent={agent} tickets={myTickets}/>,
  }[active];

  return (
    <React.Fragment>
      <Shell
        agent={agent} active={active} onChange={setActive}
        onSignOut={() => { setAgent(null); setActive('tickets'); }}
        theme={theme} onTheme={setTheme}
      >
        {screen}
      </Shell>

      {editing && (
        <UpdateTicket
          ticket={editing} agent={agent}
          onClose={() => setEditing(null)}
          onSave={saveTicket}
          onDelete={deleteTicket}
        />
      )}

      {toast && (
        <div style={{
          position:'fixed', bottom:20, right:20, zIndex:9999,
          background:
            toast.kind==='warn' ? 'rgba(217,119,6,.95)' :
            toast.kind==='err'  ? 'rgba(220,38,38,.95)' : 'rgba(22,163,74,.95)',
          color:'#fff', padding:'12px 18px', borderRadius:10,
          font:'700 12px Sora,sans-serif', boxShadow:'0 8px 32px rgba(0,0,0,.4)',
          maxWidth:340, lineHeight:1.4,
        }}>
          {toast.kind==='warn' ? '⚠ ' : toast.kind==='err' ? '✕ ' : '✔ '}{toast.msg}
        </div>
      )}
    </React.Fragment>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
