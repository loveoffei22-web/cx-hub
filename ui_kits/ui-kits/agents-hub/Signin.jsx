// Sign-in for the Agents Hub. Same design language as the
// Managers Hub sign-in, with two extra moves:
//   1. Pick your name from the 5 agents (each with their photo)
//   2. Enter the shared password (ekedp2026)

// Password = each agent's first name (lowercase)

const AgentsSignin = ({onSubmit}) => {
  const [picked, setPicked] = React.useState(null);
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [err, setErr] = React.useState('');

  const submit = () => {
    if (!picked) return setErr('Pick your name first.');
    const expected = picked.name.split(' ')[0].toLowerCase();
    if (pw.toLowerCase() !== expected) return setErr('Wrong password.');
    setErr('');
    onSubmit(picked);
  };

  const photos = window.EK_AGENT_PHOTOS || {};

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(165deg,#FFFFFF 0%,#F0F6FF 55%,#DDEBFF 100%)',
      fontFamily:'Sora,sans-serif', padding:24, overflowY:'auto',
    }}>
      <div style={{
        width:'100%', maxWidth:440,
        background:'#fff', borderRadius:20, padding:'34px 32px 28px',
        boxShadow:'0 20px 60px rgba(15,30,79,.15), 0 0 0 1px rgba(15,30,79,.06)',
      }}>
        <div style={{marginBottom:16}}>
          <a href="../../agents-home.html" style={{display:'inline-flex',alignItems:'center',gap:6,font:'700 11px/1 Sora,sans-serif',color:'#64748B',textDecoration:'none',padding:'6px 12px',borderRadius:8,background:'#F1F5F9',border:'1px solid #E2E8F0'}}>
            ← Home
          </a>
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12, marginBottom:18}}>
          <div style={{
            width:74, height:74, borderRadius:18,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 12px 32px rgba(29,78,216,.32)',
            overflow:'hidden',
          }}>
            <img src="../../assets/ekedp-app-icon.png" alt="EKEDP Power App" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{font:'900 22px/1 Sora,sans-serif', color:'#0F1E4F', letterSpacing:'-.4px', whiteSpace:'nowrap'}}>
              EKEDP <span style={{color:'#1D4ED8'}}>Power App</span>
            </div>
            <div style={{font:'700 10.5px/1 Sora,sans-serif', color:'#64748B', letterSpacing:'.8px', marginTop:6, textTransform:'uppercase'}}>
              Agents Hub · Marina HQ
            </div>
          </div>
        </div>

        <div style={{font:'800 17px/1.2 Sora,sans-serif', color:'#0F1E4F', marginBottom:4}}>Welcome 👋</div>
        <div style={{font:'500 12.5px/1.45 Sora,sans-serif', color:'#475569', marginBottom:4}}>
          For Matthew, Racheal, Tomina, Esther, Loveth.
        </div>
        <div style={{font:'500 12.5px/1.45 Sora,sans-serif', color:'#475569', marginBottom:14}}>
          Pick your name then enter your password.
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14}}>
          {window.EK_AGENTS.map(a => {
            const isOn = picked?.id === a.id;
            return (
              <button key={a.id} onClick={() => setPicked(a)} style={{
                display:'flex', alignItems:'center', gap:9, padding:'9px 11px',
                border: isOn ? '2px solid ' + a.color : '1.5px solid #DBEAFE',
                background: isOn ? a.tint : '#fff',
                borderRadius:11, cursor:'pointer',
                font:'600 12.5px/1.2 Sora,sans-serif', color:'#0F1E4F',
                textAlign:'left', transition:'all .15s',
              }}>
                {photos[a.id] ? (
                  <img src={photos[a.id]} alt={a.name}
                    style={{
                      width:28, height:28, borderRadius:'50%', objectFit:'cover', flexShrink:0,
                      border: isOn ? '2px solid ' + a.color : '2px solid #E2E8F0',
                      boxShadow: isOn ? '0 2px 8px ' + a.color + '55' : 'none',
                    }}/>
                ) : (
                  <div style={{
                    width:28, height:28, borderRadius:'50%', flexShrink:0,
                    background: a.tint, border: '2px solid ' + a.color,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:14,
                  }}>{a.emoji}</div>
                )}
                <span style={{flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                  {a.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
          <div style={{
            border:'1.5px dashed #DBEAFE', borderRadius:11, padding:'9px 11px',
            font:'600 12px/1.2 Sora,sans-serif', color:'#94A3B8',
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'rgba(241,245,249,.5)',
          }}>
            Manager → Managers Hub
          </div>
        </div>

        <div style={{marginBottom:10}}>
          <label style={{display:'block', font:'700 10px/1 Sora,sans-serif', color:'#64748B', letterSpacing:'.6px', textTransform:'uppercase', marginBottom:5}}>Password</label>
          <div style={{
            display:'flex', alignItems:'center',
            background:'#fff', border:'1.5px solid #DBEAFE', borderRadius:11,
            padding:'0 14px',
          }}>
            <input value={pw} onChange={e=>setPw(e.target.value)}
              type={show?'text':'password'} onKeyDown={e=>e.key==='Enter'&&submit()}
              placeholder="your first name"
              style={{flex:1, background:'transparent', border:'none', outline:'none',
                color:'#0F1E4F', fontSize:14, fontWeight:600,
                padding:'12px 0', fontFamily:'inherit', minWidth:0}}/>
            <button type="button" onClick={()=>setShow(s=>!s)} style={{
              background:'none', border:'none', color:'#1D4ED8',
              font:'700 11px/1 Sora,sans-serif', cursor:'pointer',
            }}>{show?'HIDE':'SHOW'}</button>
          </div>
        </div>

        {err && <div style={{font:'700 12px/1.4 Sora,sans-serif', color:'#DC2626', marginBottom:8}}>{err}</div>}

        <button onClick={submit} style={{
          width:'100%', padding:13,
          background: picked ? 'linear-gradient(135deg, ' + picked.color + ', ' + picked.color + 'DD)' : 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
          border:'none', borderRadius:12, color:'#fff',
          font:'800 14px/1 Sora,sans-serif', letterSpacing:'.3px',
          cursor:'pointer', boxShadow: picked ? '0 8px 20px ' + picked.color + '44' : '0 8px 20px rgba(29,78,216,.28)',
          transition:'all .2s',
        }}>{picked ? 'Sign in as ' + picked.name.split(' ')[0] + ' \u2192' : 'Sign in \u2192'}</button>

        <div style={{marginTop:12, textAlign:'center', font:'500 11.5px/1.4 Sora,sans-serif', color:'#64748B'}}>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {AgentsSignin});
