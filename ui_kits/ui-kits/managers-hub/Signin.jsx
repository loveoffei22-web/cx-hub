// Sign-in overlay — Managers Hub.
// Logo top, blends naturally, no agent strip, no manager photo on login.

const Signin = ({onSubmit}) => {
  const [email, setEmail] = React.useState('love@ekedp.com');
  const [pw, setPw] = React.useState('••••••••');
  const [show, setShow] = React.useState(false);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(165deg,#FFFFFF 0%,#F0F6FF 55%,#DDEBFF 100%)',
      fontFamily:'Sora,sans-serif', padding:24,
    }}>
      <div style={{
        width:'100%', maxWidth:420,
        background:'#fff', borderRadius:20, padding:'36px 32px',
        boxShadow:'0 20px 60px rgba(15,30,79,.15), 0 0 0 1px rgba(15,30,79,.06)',
        position:'relative',
      }}>
        <div style={{marginBottom:16}}>
          <a href="../../index.html" style={{display:'inline-flex',alignItems:'center',gap:6,font:'700 11px/1 Sora,sans-serif',color:'#64748B',textDecoration:'none',padding:'6px 12px',borderRadius:8,background:'#F1F5F9',border:'1px solid #E2E8F0'}}>
            ← Home
          </a>
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginBottom:28}}>

          {/* EKEDP Logo — no clipping, blends naturally */}
          <img
            src="../../assets/ekedp-app-icon.png"
            alt="EKEDP Power App"
            style={{
              width:90, height:90,
              objectFit:'contain',
              filter:'drop-shadow(0 8px 18px rgba(29,78,216,.18))',
            }}
          />

          {/* App name */}
          <div style={{textAlign:'center', marginTop:4}}>
            <div style={{font:'900 24px/1 Sora,sans-serif', color:'#0F1E4F', letterSpacing:'-.4px', whiteSpace:'nowrap'}}>
              EKEDP <span style={{color:'#1D4ED8'}}>Power App</span>
            </div>
            <div style={{font:'700 11px/1 Sora,sans-serif', color:'#64748B', letterSpacing:'.8px', marginTop:6, textTransform:'uppercase'}}>
              Managers Hub · Marina HQ
            </div>
          </div>

        </div>

        <div style={{font:'800 20px/1 Sora,sans-serif', color:'#0F1E4F', marginBottom:4}}>Welcome back 👋</div>
        <div style={{font:'500 13px/1.45 Sora,sans-serif', color:'#475569', marginBottom:4}}>
          For Love &amp; supervisors only.
        </div>
        <div style={{font:'500 13px/1.45 Sora,sans-serif', color:'#475569', marginBottom:18}}>
          Sign in to your access.
        </div>

        <Field label="Email">
          <input value={email} onChange={e=>setEmail(e.target.value)}
            style={fieldInput} placeholder="you@email.com"/>
        </Field>
        <Field label="Password">
          <input value={pw} onChange={e=>setPw(e.target.value)}
            type={show?'text':'password'} style={fieldInput}/>
          <button type="button" onClick={()=>setShow(s=>!s)} style={{
            background:'none', border:'none', color:'#1D4ED8',
            font:'700 11px/1 Sora,sans-serif', cursor:'pointer',
          }}>{show?'HIDE':'SHOW'}</button>
        </Field>

        <button onClick={onSubmit} style={{
          width:'100%', marginTop:14, padding:14,
          background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',
          border:'none', borderRadius:12, color:'#fff',
          font:'800 15px/1 Sora,sans-serif', letterSpacing:'.3px',
          cursor:'pointer', boxShadow:'0 8px 20px rgba(29,78,216,.28)',
        }}>Sign in →</button>

        <div style={{marginTop:14, textAlign:'center', font:'500 12px/1.45 Sora,sans-serif', color:'#64748B'}}>
          No account? Ask your admin to add you.
        </div>
        <div style={{marginTop:10, textAlign:'center'}}>
          <button style={{
            background:'none', border:'none', color:'#1D4ED8',
            font:'700 12px/1 Sora,sans-serif', cursor:'pointer', textDecoration:'underline',
          }}>Forgot password? · Reset access</button>
        </div>
      </div>
    </div>
  );
};

const fieldInput = {
  flex:1, background:'transparent', border:'none', outline:'none',
  color:'#0F1E4F', fontSize:14, fontWeight:600,
  padding:'13px 0', fontFamily:'inherit', minWidth:0,
};

const Field = ({label, children}) => (
  <div style={{marginBottom:12}}>
    <label style={{display:'block', font:'700 10px/1 Sora,sans-serif', color:'#64748B', letterSpacing:'.6px', textTransform:'uppercase', marginBottom:5}}>{label}</label>
    <div style={{
      display:'flex', alignItems:'center',
      background:'#fff', border:'1.5px solid #DBEAFE', borderRadius:11,
      padding:'0 14px', boxShadow:'0 2px 6px rgba(15,30,79,.04)',
    }}>{children}</div>
  </div>
);

Object.assign(window, {Signin});
