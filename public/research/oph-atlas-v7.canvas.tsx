import { useState, useHostTheme, Button, H1, H2, Text, Stack, Row } from 'cursor/canvas';

// Original teaching prototype. All inputs are synthetic. This is not an access-control boundary.
const bitsOf = (n: number) => Array.from({length: 6}, (_, i) => (n >> (5-i)) & 1);
const parityOf = (n: number) => bitsOf(n).reduce((a,b) => a ^ b, 0);
const states = Array.from({length: 64}, (_,i) => i);
const candidateStates = (secret: number, mask: number[]) => states.filter(n => parityOf(n) === parityOf(secret) && mask.every(i=>bitsOf(n)[i]===bitsOf(secret)[i]));
const roles = ['Public observer', 'Swordsman', 'Mage', 'First Person'];
const roleMasks = [[], [0,1], [2,3], [0,1,2,3,4,5]];
const refs = [
  ['OPH1', 'Finite Observer Consensus · r2040', 'Definition 3.1 and Theorem 3.2, pp. 15–16; scope §1.', 'https://philpapers.org/rec/MUEFOC'],
  ['OPH2', 'Observation-Determined Normal Forms', 'Companion proof reference; not independently audited.', 'https://github.com/FloatingPragma/observer-patch-holography/blob/main/extra/observable_normal_forms.pdf'],
  ['OPH3', 'See what one record can access', 'Visual inspiration: accessible past versus full retained log.', 'https://simulation.floatingpragma.io/spacetime?scene=observer-history'],
  ['OPH4', 'What different repair orders agree on', 'Visual inspiration: different endpoints, common quotient.', 'https://simulation.floatingpragma.io/agreement?scene=normal-forms'],
  ['OPH5', 'The OPH Machine · Introduction', 'Guided input, operation and output sequence.', 'https://learn.floatingpragma.io/book/machine/chapter/0'],
  ['OPH6', 'The Consensus Protocol', 'Learning structure; technical paper governs claim scope.', 'https://learn.floatingpragma.io/book/machine/chapter/9'],
  ['AP1', 'Privacy is Value · V6 formal specification', 'Privacy preconditions and reconstruction baseline.', 'https://github.com/mitchuski/agentprivacy-docs/blob/main/papers/v6/privacy_value_v6_formal_specification.md'],
  ['AP2', 'Conjecture register · C97', 'C9 and C16 remain 25%; this prototype promotes no conjecture.', 'https://github.com/mitchuski/agentprivacy-docs/blob/main/research/CONJECTURE_REGISTER_V6.md'],
];
const lessons = [
  {title:'Private state', input:'Six independent, fair bits.', operation:'Choose one of 64 equiprobable states.', output:'The First Person has the complete synthetic record.', assumption:'The uniform prior is declared. It is not a population model of people.', reference:'AP1 · privacy baseline', role:3, background:0},
  {title:'Scoped disclosure', input:'The private record and an authorised task: parity.', operation:'Disclose only whether the count of 1s is odd or even.', output:'A public observer sees one result; 32 states remain compatible.', assumption:'Sufficiency is relative to the parity task. It does not hold for every task.', reference:'OPH1 · observable fibers', role:0, background:0},
  {title:'Public verification', input:'Several private states sharing that reading.', operation:'Compare their parity; it remains the same.', output:'One public task answer without a unique private record.', assumption:'This is a computed toy predicate, not a cryptographic zero-knowledge proof.', reference:'OPH1 Thm 3.2 · task-quotient interpretation proposed', role:0, background:0},
  {title:'Delegation', input:'A Mage receives coordinates x2 and x3 plus parity.', operation:'Filter states by the information explicitly disclosed.', output:'Eight compatible states remain.', assumption:'A role label does not prove non-collusion or channel independence.', reference:'AP1 §§10.3–11 · enforceable regime required', role:2, background:0},
  {title:'Later inference', input:'The archive stays fixed; background reveals x0 through x4.', operation:'Combine those five bits with the existing parity.', output:'The sixth bit is deduced. Exactly one state remains.', assumption:'Additional information causes the change; compute alone does not defeat the bound.', reference:'AP2 C82 · mechanism only, no empirical rate', role:0, background:5},
];

export default function OPHAtlasV7() {
  const t = useHostTheme();
  const [tab, setTab] = useState(0);
  const [role, setRole] = useState(0);
  const [background, setBackground] = useState(0);
  const [coalition, setCoalition] = useState(false);
  const [secret, setSecret] = useState(43);
  const [step, setStep] = useState(0);
  const lesson = lessons[step];
  const activeRole = tab === 2 ? lesson.role : role;
  const activeBackground = tab === 2 ? lesson.background : background;
  const mask = [...new Set([...roleMasks[activeRole], ...Array.from({length:activeBackground},(_,i)=>i), ...(tab !== 2 && coalition ? [0,1,2,3] : [])])];
  const bits = bitsOf(secret), parity = parityOf(secret);
  const compatible = candidateStates(secret, mask);
  const inferred = [0,1,2,3,4,5].filter(i => !mask.includes(i) && compatible.every(n=>bitsOf(n)[i]===bits[i]));
  const uncertainty = Math.log2(compatible.length);
  const stroke = t.stroke.primary;
  const noteStyle = {fontSize:13, color:t.text.secondary, lineHeight:1.6};
  function restart() {setRole(0);setBackground(0);setCoalition(false);setSecret(43);setStep(0);}
  const graph = <svg viewBox="0 0 720 360" role="img" aria-label={`Six synthetic coordinates. ${mask.length} directly known, ${inferred.length} deduced. ${compatible.length} possible states.`} style={{width:'100%', minWidth:280, display:'block'}}>
    <title>Information available to {roles[activeRole]}</title>
    <text x="30" y="26" fill={t.text.secondary} fontSize="15">PRIVATE COORDINATES</text>
    <text x="460" y="26" fill={t.text.secondary} fontSize="15">PUBLIC TASK RESULT</text>
    {[0,1,2,3,4,5].map(i => {
      const known=mask.includes(i), deduced=inferred.includes(i), y=62+i*49;
      return <g key={i}>
        <path d={`M 174 ${y} C 315 ${y}, 330 174, 452 174`} fill="none" stroke={known||deduced?t.accent.primary:stroke} strokeWidth={known||deduced?2:1} strokeDasharray={deduced?'6 5':undefined} opacity={known||deduced?1:0.55}/>
        <rect x="30" y={y-18} width="144" height="36" rx="5" fill={known?t.fill.secondary:t.bg.editor} stroke={known||deduced?t.accent.primary:stroke} strokeDasharray={deduced?'5 4':undefined}/>
        <text x="43" y={y+5} fill={t.text.primary} fontSize="16">x{i}</text>
        <text x="82" y={y+5} fill={t.text.primary} fontSize="16">{known||deduced?bits[i]:'?'}</text>
        <text x="109" y={y+4} fill={t.text.secondary} fontSize="12">{known?'known':deduced?'deduced':'hidden'}</text>
      </g>;
    })}
    <rect x="452" y="125" width="236" height="99" rx="7" fill={t.fill.tertiary} stroke={t.accent.primary}/>
    <text x="476" y="155" fill={t.text.secondary} fontSize="15">PARITY</text>
    <text x="476" y="188" fill={t.text.primary} fontSize="24">{parity===1?'Odd':'Even'} · {parity}</text>
    <text x="476" y="209" fill={t.text.secondary} fontSize="13">Same answer across this fiber</text>
    <text x="452" y="280" fill={t.text.secondary} fontSize="14">Solid: disclosed · Dashed: deduced</text>
    <text x="452" y="303" fill={t.text.secondary} fontSize="14">Faded: unresolved coordinate</text>
    <text x="30" y="354" fill={t.text.secondary} fontSize="13">Logical dependency diagram; edges do not grant access.</text>
  </svg>;

  return <Stack gap={20} style={{padding:24,maxWidth:1160,margin:'0 auto',fontFamily:'system-ui, sans-serif',color:t.text.primary,background:t.bg.editor}}>
    <style>{`.oph-mobile-coordinates{display:none}@media(max-width:600px){.oph-desktop-diagram{display:none}.oph-mobile-coordinates{display:block}}`}</style>
    <Row justify="space-between" wrap>
      <div><Text style={{letterSpacing:2,fontSize:12,color:t.text.secondary}}>AGENTPRIVACY / ATLAS LAB / V7</Text><H1>Public agreement. Private ambiguity.</H1></div>
      <Button onClick={restart}>Reset example</Button>
    </Row>
    <Text style={noteStyle}>Analyst teaching view · 64 synthetic states · Original prototype inspired by OPH · No production access control</Text>
    <nav aria-label="Atlas experiments" style={{display:'flex',gap:8,flexWrap:'wrap',borderBottom:`1px solid ${stroke}`,paddingBottom:14}}>
      {['Observer access','Shared result','Guided route','References'].map((name,i)=><button key={name} onClick={()=>setTab(i)} aria-pressed={tab===i} style={{padding:'10px 14px',border:0,borderRadius:5,background:tab===i?t.fill.secondary:'transparent',color:tab===i?t.text.primary:t.text.secondary,fontSize:15,cursor:'pointer'}}>{name}</button>)}
    </nav>
    {tab<2 && <Row gap={20} wrap>
      <label>Observer <select value={role} onChange={e=>setRole(Number(e.target.value))} style={{marginLeft:10,padding:8,background:t.bg.elevated,color:t.text.primary,border:`1px solid ${stroke}`,borderRadius:4,fontSize:15}}>{roles.map((r,i)=><option key={r} value={i}>{r}</option>)}</select></label>
      <label style={{display:'flex',gap:8,alignItems:'center'}}><input type="checkbox" checked={coalition} onChange={e=>setCoalition(e.target.checked)}/>Combine Swordsman + Mage disclosures</label>
      <label style={{display:'flex',gap:10,alignItems:'center'}}>Background bits: {background}<input aria-label="Background bits" type="range" min="0" max="6" value={background} onChange={e=>setBackground(Number(e.target.value))}/></label>
    </Row>}
    {tab===2 && <div>
      <Row justify="space-between" wrap><H2>{step+1} / 5 · {lesson.title}</H2><Row><Button disabled={step===0} onClick={()=>setStep(step-1)}>Previous</Button><Button disabled={step===4} onClick={()=>setStep(step+1)}>Next</Button></Row></Row>
      <div style={{display:'flex',gap:24,flexWrap:'wrap',paddingTop:8}}>{(['input','operation','output'] as const).map(key=><div key={key} style={{flex:'1 1 210px'}}><Text style={{...noteStyle,textTransform:'uppercase',letterSpacing:1}}>{key}</Text><Text>{lesson[key]}</Text></div>)}</div>
    </div>}
    {tab!==3 && <div style={{display:'flex',gap:24,flexWrap:'wrap',alignItems:'start'}}>
      <div style={{flex:'3 1 500px',minWidth:0}}><div className="oph-desktop-diagram">{graph}</div><div className="oph-mobile-coordinates"><H2>Private coordinates</H2>{bits.map((b,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:`1px solid ${stroke}`,fontSize:16}}><span>x{i}</span><span>{mask.includes(i)||inferred.includes(i)?b:'?'}</span><span>{mask.includes(i)?'known':inferred.includes(i)?'deduced':'hidden'}</span></div>)}<H2>Public parity: {parity===1?'Odd':'Even'} · {parity}</H2><Text style={noteStyle}>Every compatible state has this task result.</Text></div></div>
      <aside aria-label="Exact finite-model results" style={{flex:'1 1 190px',padding:'18px 0',borderTop:`1px solid ${stroke}`}}>
        <Text style={noteStyle}>COMPATIBLE PRIVATE STATES</Text><div data-testid="candidate-count" style={{fontSize:24,fontWeight:600,padding:'6px 0 20px'}}>{compatible.length} / 64</div>
        <Text style={noteStyle}>CONDITIONAL UNCERTAINTY</Text><div data-testid="entropy" style={{fontSize:22,padding:'6px 0 20px'}}>{uncertainty} {uncertainty===1?'bit':'bits'}</div>
        <Text style={noteStyle}>BEST EXACT-STATE GUESS</Text><div data-testid="guess" style={{fontSize:22,padding:'6px 0 14px'}}>1 / {compatible.length}</div>
        <Text style={noteStyle}>Exact enumeration, uniform independent bits. These values describe this toy, not measured privacy of people.</Text>
      </aside>
    </div>}
    {tab===0 && <div style={{borderTop:`1px solid ${stroke}`,paddingTop:16}}><H2>Access and inference are different</H2><Text>{mask.length} coordinates are directly known. {inferred.length} more are logically deduced. {6-mask.length-inferred.length} remain unresolved.</Text><Text style={noteStyle}>Parity is always public. The Swordsman receives x0–x1; the Mage receives x2–x3. {background===0?'No background bits are revealed.':background===1?'Background reveals x0.':`Background reveals x0 through x${background-1}.`} These illustrative role masks do not assert conditional independence.</Text></div>}
    {tab===1 && <section aria-label="Compatible private-state grid">
      <H2>Different private states, one disclosed result</H2><Text style={noteStyle}>Choose a compatible state to change the synthetic interior while keeping every current disclosure fixed. Disabled states contradict an observation. Highlight marks the chosen example, visible only in this analyst view.</Text>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(82px,1fr))',gap:6,padding:'14px 0'}}>
        {states.map(n=><button key={n} disabled={!compatible.includes(n)} onClick={()=>setSecret(n)} aria-label={`Private state ${bitsOf(n).join('')}${n===secret?', selected':''}`} aria-pressed={n===secret} style={{fontFamily:'monospace',fontSize:15,padding:'9px 4px',border:`1px solid ${n===secret?t.accent.primary:stroke}`,borderRadius:4,background:n===secret?t.fill.secondary:t.bg.editor,color:compatible.includes(n)?t.text.primary:t.text.tertiary,opacity:compatible.includes(n)?1:0.45,cursor:compatible.includes(n)?'pointer':'default'}}>{bitsOf(n).join('')}</button>)}
      </div>
      <Text style={noteStyle}>This is a comparison of states, not a repair animation or cryptographic proof. Public-result sufficiency does not imply privacy for an unknown prior.</Text>
    </section>}
    {tab===2 && <div style={{borderLeft:`3px solid ${t.accent.primary}`,paddingLeft:18}}><Text>{lesson.assumption}</Text><Text style={noteStyle}>{lesson.reference}</Text>{step===4 && <Button onClick={()=>{setTab(1);setRole(0);setBackground(5);setCoalition(false);}}>Explore the remaining state</Button>}</div>}
    {tab===3 && <section><H2>References and claim boundaries</H2>
      <Text>V7 research intake. C9 / C16: methodological references, no promotion. C82: a toy illustration, no fitted rate. C97: no new market evidence.</Text>
      {refs.map(([id,title,scope,url])=><div key={id} style={{display:'flex',gap:18,padding:'16px 0',borderBottom:`1px solid ${stroke}`}}><span style={{fontFamily:'monospace',color:t.text.secondary,minWidth:46}}>{id}</span><div><a href={url} target="_blank" rel="noreferrer" style={{color:t.text.link,fontSize:16}}>{title}</a><Text style={noteStyle}>{scope}</Text></div></div>)}
      <Text style={{...noteStyle,paddingTop:18}}>Inspected 11 September 2026. Required bibliography, source hashes, conjecture dispositions, falsifiers and production integration conditions accompany the V7 research note. No OPH code or artwork is embedded.</Text>
    </section>}
    <footer style={{borderTop:`1px solid ${stroke}`,paddingTop:14,...noteStyle}}>Research prototype · public task = parity · supplied prior = uniform · current formal specification = V6 · conjecture authority = C97 register</footer>
  </Stack>;
}
