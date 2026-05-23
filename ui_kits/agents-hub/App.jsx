// Agents Hub — App orchestrator.
//   Sign in → pick name → enter ekedp2026 → main shell.

const App = () => {
  const [agent, setAgent]   = React.useState(null);
  const [active, setActive] = React.useState('dashboard');
  const [editing, setEditing] = React.useState(null);
  const [toast, setToast]   = React.useState(null);

  const [tickets, setTickets] = React.useState({});
  const [alertCount, setAlertCount] = React.useState(0);
  const prevCountRef = React.useRef(null);

  React.useEffect(() => {
    setTickets(window.AGENT_TICKETS || {});
  }, []);

  // Alert when ticket count grows
  React.useEffect(() => {
    if (!agent) return;
    const count = (tickets[agent.id] || []).length;
    if (prevCountRef.current === null) { prevCountRef.current = count; return; }
    const diff = count - prevCountRef.current;
    if (diff > 0) {
      setAlertCount(a => a + diff);
      window.EK_TOAST && window.EK_TOAST(`🔔 ${diff} new ticket${diff>1?'s':''} assigned to you!`);
      // Browser notification
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('EKEDP Power App', {
          body: `${diff} new ticket${diff>1?'s':''} assigned to ${agent.name.split(' ')[0]}`,
          icon: '../../assets/ekedp-app-icon.png',
        });
      }
    }
    prevCountRef.current = count;
  }, [tickets, agent]);

  // Request notification permission on sign-in
  React.useEffect(() => {
    if (agent && window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [agent]);

  // Toast helper
  React.useEffect(() => {
    window.EK_TOAST = (msg, kind='ok') => {
      setToast({msg, kind});
      setTimeout(() => setToast(null), 3000);
    };
  }, []);

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const j = JSON.parse(e.target.result);
        // Support snapshot.json format (days[].tickets[]) or agent export ({tickets:[]})
        let allTickets = [];
        if (j.days && Array.isArray(j.days)) {
          j.days.forEach(d => (d.tickets||[]).forEach(t => allTickets.push(t)));
        } else if (j.tickets && Array.isArray(j.tickets)) {
          allTickets = j.tickets;
        } else {
          window.EK_TOAST && window.EK_TOAST('Unrecognised JSON format', 'warn');
          return;
        }
        // Filter to this agent's tickets by responsible party name match
        const myName = agent.name.toLowerCase();
        const mine = allTickets.filter(t => {
          const r = (t.resp||t.responsible||t.responsibleParty||'').toLowerCase();
          return r.includes(myName.split(' ')[0]) || r.includes(myName.split(' ')[1]||'__');
        });
        const mapped = mine.map(t => ({
          num: t.num || t.ticketNum || '',
          time: t.time || '',
          name: t.name || t.customerName || '',
          phone: t.phone || '',
          bu: t.bu || t.businessUnit || '',
          issue: t.issue || t.category || t.cat || '',
          resp: t.resp || t.responsible || agent.name,
          status: t.status || 'unresolved',
          note: t.note || t.resolutionNote || '',
        }));
        setTickets(tk => ({...tk, [agent.id]: mapped}));
        window.EK_TOAST && window.EK_TOAST(`✅ Loaded ${mapped.length} ticket${mapped.length!==1?'s':''} assigned to you.`);
      } catch(err) {
        window.EK_TOAST && window.EK_TOAST('Import error: ' + err.message, 'err');
      }
    };
    reader.readAsText(file);
  };

  if (!agent) {
    return <AgentsSignin onSubmit={(a) => {
      setAgent(a);
      setTimeout(() => window.EK_TOAST(`Signed in as ${a.name.split(' ')[0]}. ${(window.AGENT_TICKETS||{})[a.id]?.length || 0} tickets loaded.`), 200);
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
    setTickets(t => ({...t, [agent.id]: (t[agent.id]||[]).filter(x => x.num !== num)}));
    window.EK_TOAST && window.EK_TOAST('Ticket deleted.');
  };

  const screen = {
    dashboard: <AgentDashboard agent={agent} tickets={myTickets} onChange={setActive}/>,
    tickets: <MyTickets agent={agent} tickets={myTickets} onEdit={setEditing} onDelete={deleteTicket}/>,
    add:     <AddTicket agent={agent} onCreate={addTicket}/>,
    slot:    <SlotUpdates agent={agent} tickets={myTickets}/>,
    inbox:   <Inbox agent={agent}/>,
    export:  <ExportDay agent={agent} tickets={myTickets}/>,
    sync:    <AgentSync agent={agent} tickets={myTickets} onImport={handleImport}/>,
  }[active];

  return (
    <React.Fragment>
      <Shell agent={agent} active={active} onChange={(t)=>{setActive(t);if(t==='tickets')setAlertCount(0);}}
        onSignOut={() => { setAgent(null); setActive('dashboard'); }}
        onImport={handleImport}
        alertCount={alertCount}>
        {screen}
      </Shell>
      {editing && <UpdateTicket ticket={editing} agent={agent}
        onClose={()=>setEditing(null)}
        onSave={saveTicket}/>}
      {toast && (
        <div style={{
          position:'fixed', bottom:20, right:20, zIndex:9999,
          background: toast.kind==='warn' ? 'rgba(217,119,6,.95)' : toast.kind==='err' ? 'rgba(220,38,38,.95)' : 'rgba(22,163,74,.95)',
          color:'#fff', padding:'12px 18px', borderRadius:10,
          font:'700 12px Sora,sans-serif', boxShadow:'0 8px 32px rgba(0,0,0,.4)',
          maxWidth:320,
        }}>{toast.kind==='warn'?'⚠':toast.kind==='err'?'✕':'✔'} {toast.msg}</div>
      )}
    </React.Fragment>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
