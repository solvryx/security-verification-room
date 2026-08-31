import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle, ArrowUpRight, BadgeCheck, Braces, Check, CheckCircle2,
  CircleSlash2, FileJson2, Fingerprint, KeyRound, LockKeyhole, Play,
  ScanSearch, ShieldAlert, ShieldCheck, TableProperties, X,
} from 'lucide-react';
import './styles.css';

type ProjectKey = 'boundary-auditor' | 'secret-sentry' | 'access-matrix' | 'release-gate' | 'api-contract';

const projects: Array<{ key: ProjectKey; code: string; name: string; promise: string }> = [
  { key: 'boundary-auditor', code: 'VR-01', name: 'BOUNDARY AUDITOR', promise: 'Trace before trust' },
  { key: 'secret-sentry', code: 'VR-02', name: 'SECRET SENTRY', promise: 'Redact before report' },
  { key: 'access-matrix', code: 'VR-03', name: 'ACCESS MATRIX', promise: 'Deny hidden drift' },
  { key: 'release-gate', code: 'VR-04', name: 'RELEASE GATE', promise: 'Block unsafe builds' },
  { key: 'api-contract', code: 'VR-05', name: 'API CONTRACT', promise: 'Pinpoint response drift' },
];
const validKeys = new Set(projects.map((project) => project.key));

function fromHash(): ProjectKey {
  const key = window.location.hash.slice(1) as ProjectKey;
  return validKeys.has(key) ? key : 'boundary-auditor';
}

function App() {
  const [active, setActive] = useState<ProjectKey>(fromHash);
  useEffect(() => {
    const listener = () => setActive(fromHash());
    window.addEventListener('hashchange', listener);
    return () => window.removeEventListener('hashchange', listener);
  }, []);
  function navigate(key: ProjectKey) {
    window.location.hash = key;
    setActive(key);
  }
  return (
    <main className="room">
      <aside className="rail">
        <div className="brand-block"><span>SRX</span><strong>SOLVRYX</strong><small>VERIFICATION ROOM</small></div>
        <nav aria-label="Security and quality projects">
          {projects.map((project, index) => (
            <button key={project.key} className={active === project.key ? 'active' : ''} onClick={() => navigate(project.key)}>
              <i>{String(index + 1).padStart(2, '0')}</i>
              <span><strong>{project.name}</strong><small>{project.promise}</small></span>
              <ArrowUpRight />
            </button>
          ))}
        </nav>
        <div className="rail-note"><LockKeyhole /><p>Local demonstrations<br />Synthetic evidence only</p></div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div><span>CASEWORK / SECURITY + QUALITY</span><b>Five controls. Every claim inspectable.</b></div>
          <div className="status"><i /> TEST BENCH ONLINE</div>
        </header>
        <div className="case-stage">
          {active === 'boundary-auditor' && <BoundaryAuditor />}
          {active === 'secret-sentry' && <SecretSentry />}
          {active === 'access-matrix' && <AccessMatrix />}
          {active === 'release-gate' && <ReleaseGate />}
          {active === 'api-contract' && <ApiContract />}
        </div>
        <footer><span>Self-initiated defensive case studies</span><span>No production systems or live credentials</span></footer>
      </section>
    </main>
  );
}

function BoundaryAuditor() {
  const [mode, setMode] = useState<'risk' | 'benign'>('risk');
  const [ran, setRan] = useState(false);
  const riskEvents = [
    ['01', 'read_file', 'private/.env', 'source'],
    ['02', 'browser_text', 'untrusted ticket body', 'untrusted'],
    ['03', 'send_email', 'external recipient', 'state change'],
  ];
  const benignEvents = [
    ['01', 'read_file', 'docs/faq.md', 'source'],
    ['02', 'approval', 'user confirmed send', 'control'],
    ['03', 'send_email', 'approved recipient', 'state change'],
  ];
  return (
    <CaseFrame
      code="VR-01" title="AGENT BOUNDARY AUDITOR" subtitle="Local tool-trace security review"
      problem="Tool-agent traces hide where untrusted input, secrets, and state-changing actions meet."
      decision="Correlate ordered trace events and report only explicit boundary violations with event indexes."
      control="A trace with approval evidence and no protected source returns zero findings."
      icon={<ShieldAlert />}
    >
      <div className="two-up">
        <section className="trace-card">
          <PanelTitle icon={<Braces />} label="EXPORTED TRACE" meta={`${mode === 'risk' ? 'risky' : 'benign'}_synthetic.json`} />
          <div className="switch-row">
            <button className={mode === 'risk' ? 'selected' : ''} onClick={() => { setMode('risk'); setRan(false); }}>risky sample</button>
            <button className={mode === 'benign' ? 'selected' : ''} onClick={() => { setMode('benign'); setRan(false); }}>benign control</button>
          </div>
          <div className="trace-list">{(mode === 'risk' ? riskEvents : benignEvents).map((event) => <div key={event[0]}><i>{event[0]}</i><b>{event[1]}</b><span>{event[2]}</span><small>{event[3]}</small></div>)}</div>
          <button className="action" onClick={() => setRan(true)}><Play /> Audit trace locally</button>
        </section>
        <section className="result-card" data-testid="boundary-result">
          <PanelTitle icon={<ScanSearch />} label="BOUNDARY VERDICT" meta="read-only analysis" />
          {!ran ? <Waiting text="Run the audit to correlate trust boundaries." /> : mode === 'risk' ? (
            <div className="verdict danger"><strong>02</strong><h3>HIGH-RISK BOUNDARIES</h3><p><b>E01 → E03</b> Protected source may reach an external action.</p><p><b>E02 → E03</b> Untrusted content precedes a state-changing tool without approval evidence.</p></div>
          ) : <Pass title="ZERO FINDINGS" text="Approval evidence is present and no protected source enters the action path." />}
        </section>
      </div>
    </CaseFrame>
  );
}

function SecretSentry() {
  const risky = 'SERVICE_URL=https://api.example.test\napi_key="demo_7Fx3Qv9Lm2Za8Nw4"\nMODE=preview';
  const clean = 'SERVICE_URL=https://api.example.test\nAPI_KEY=${INJECTED_AT_RUNTIME}\nMODE=preview';
  const [mode, setMode] = useState<'risk' | 'clean'>('risk');
  const [ran, setRan] = useState(false);
  return (
    <CaseFrame
      code="VR-02" title="SECRET SENTRY" subtitle="Redaction-first pattern inspection"
      problem="Secret scanners can leak the same credential they are meant to report."
      decision="Match locally, return line and rule, then expose only a redacted preview and stable fingerprint."
      control="Runtime placeholders and short non-secret values produce no finding."
      icon={<Fingerprint />}
    >
      <div className="two-up">
        <section className="code-card">
          <PanelTitle icon={<KeyRound />} label="LOCAL INPUT" meta=".env.synthetic" />
          <div className="switch-row"><button className={mode === 'risk' ? 'selected' : ''} onClick={() => { setMode('risk'); setRan(false); }}>seeded pattern</button><button className={mode === 'clean' ? 'selected' : ''} onClick={() => { setMode('clean'); setRan(false); }}>clean control</button></div>
          <pre>{mode === 'risk' ? risky : clean}</pre>
          <button className="action" onClick={() => setRan(true)}><ScanSearch /> Scan without network</button>
        </section>
        <section className="result-card" data-testid="secret-result">
          <PanelTitle icon={<BadgeCheck />} label="REDACTED RESULT" meta="raw value suppressed" />
          {!ran ? <Waiting text="The scanner never echoes a complete matched value." /> : mode === 'risk' ? (
            <div className="finding-sheet"><span>GENERIC_API_KEY</span><strong>LINE 02</strong><dl><div><dt>preview</dt><dd>dem...8Nw</dd></div><div><dt>fingerprint</dt><dd>9f1c4b62d081</dd></div><div><dt>disclosure</dt><dd>redacted</dd></div></dl></div>
          ) : <Pass title="CLEAN SAMPLE" text="No reportable secret pattern was returned." />}
        </section>
      </div>
    </CaseFrame>
  );
}

function AccessMatrix() {
  const [mode, setMode] = useState<'drift' | 'expected'>('drift');
  const [compared, setCompared] = useState(false);
  const rows = [
    ['viewer', 'reports', 'read', true],
    ['analyst', 'reports', 'export', true],
    ['support', 'billing', 'read', true],
    ['support', 'billing', 'export', mode === 'drift'],
  ];
  return (
    <CaseFrame
      code="VR-03" title="ACCESS MATRIX" subtitle="Authorization drift review"
      problem="A deployed permission can look harmless until it is compared with the approved policy."
      decision="Evaluate exact role-resource-action tuples and isolate unexpected or missing grants."
      control="A deployed matrix identical to the approved matrix returns zero drift."
      icon={<TableProperties />}
    >
      <div className="matrix-layout">
        <section className="matrix-card">
          <PanelTitle icon={<TableProperties />} label="DEPLOYED DECISIONS" meta="4 evaluated tuples" />
          <div className="switch-row"><button className={mode === 'drift' ? 'selected' : ''} onClick={() => { setMode('drift'); setCompared(false); }}>drift sample</button><button className={mode === 'expected' ? 'selected' : ''} onClick={() => { setMode('expected'); setCompared(false); }}>expected control</button></div>
          <table><thead><tr><th>ROLE</th><th>RESOURCE</th><th>ACTION</th><th>DECISION</th></tr></thead><tbody>{rows.map((row) => <tr key={row.slice(0, 3).join('-')} className={mode === 'drift' && row[0] === 'support' && row[2] === 'export' ? 'drift' : ''}><td>{String(row[0])}</td><td>{String(row[1])}</td><td>{String(row[2])}</td><td>{row[3] ? <Check /> : <X />}</td></tr>)}</tbody></table>
          <button className="action" onClick={() => setCompared(true)}><ScanSearch /> Compare to approved policy</button>
        </section>
        <section className="result-card compact" data-testid="access-result">
          <PanelTitle icon={<LockKeyhole />} label="POLICY DELTA" meta="default deny" />
          {!compared ? <Waiting text="Exact tuple comparison prevents implied permissions." /> : mode === 'drift' ? <div className="drift-proof"><AlertTriangle /><h3>UNEXPECTED GRANT</h3><code>support / billing / export</code><p>Approved policy: DENY<br />Deployed decision: ALLOW</p></div> : <Pass title="NO POLICY DRIFT" text="Deployed decisions match every approved tuple." />}
        </section>
      </div>
    </CaseFrame>
  );
}

function ReleaseGate() {
  const [mode, setMode] = useState<'unsafe' | 'safe'>('unsafe');
  const [ran, setRan] = useState(false);
  const unsafe = { DEBUG: 'true', CORS: '*', SECRET: 'default', HTTPS: 'false', SDK: '^4.2' };
  const safe = { DEBUG: 'false', CORS: 'app.example.test', SECRET: '${VAULT}', HTTPS: 'true', SDK: '4.2.1' };
  const config = mode === 'unsafe' ? unsafe : safe;
  return (
    <CaseFrame
      code="VR-04" title="RELEASE GATE" subtitle="Explainable pre-deploy controls"
      problem="A green build can still ship with dangerous configuration and floating dependencies."
      decision="Treat critical configuration failures as blockers and report every failed rule before deploy."
      control="A hardened synthetic configuration passes the same rule set without exceptions."
      icon={<ShieldCheck />}
    >
      <div className="release-layout">
        <section className="config-board">
          <PanelTitle icon={<FileJson2 />} label="RELEASE CANDIDATE" meta="config.preview.json" />
          <div className="switch-row"><button className={mode === 'unsafe' ? 'selected' : ''} onClick={() => { setMode('unsafe'); setRan(false); }}>unsafe sample</button><button className={mode === 'safe' ? 'selected' : ''} onClick={() => { setMode('safe'); setRan(false); }}>hardened control</button></div>
          <div className="config-grid">{Object.entries(config).map(([key, value]) => <div key={key}><span>{key}</span><strong>{value}</strong></div>)}</div>
          <button className="action" onClick={() => setRan(true)}><Play /> Evaluate release gate</button>
        </section>
        <section className="result-card" data-testid="release-result">
          <PanelTitle icon={<CircleSlash2 />} label="SHIP DECISION" meta="deterministic rules" />
          {!ran ? <Waiting text="No release claim exists until every rule is evaluated." /> : mode === 'unsafe' ? <div className="blocker-list"><div><b>CRITICAL</b><span>default-secret</span></div><div><b>HIGH</b><span>debug-enabled</span></div><div><b>HIGH</b><span>cors-wildcard</span></div><div><b>MEDIUM</b><span>dependency-unpinned</span></div><strong>RELEASE BLOCKED</strong></div> : <Pass title="RELEASE ELIGIBLE" text="All required configuration and pinning controls passed." />}
        </section>
      </div>
    </CaseFrame>
  );
}

function ApiContract() {
  const [mode, setMode] = useState<'broken' | 'valid'>('broken');
  const [ran, setRan] = useState(false);
  const broken = '{\n  "id": "usr_204",\n  "active": "yes",\n  "roles": ["viewer"]\n}';
  const valid = '{\n  "id": "usr_204",\n  "active": true,\n  "roles": ["viewer"],\n  "profile": { "region": "eu" }\n}';
  return (
    <CaseFrame
      code="VR-05" title="API CONTRACT" subtitle="Path-level response validation"
      problem="A response may remain valid JSON while quietly breaking downstream consumers."
      decision="Validate nested fields recursively and return exact paths, expected types, and actual types."
      control="A response matching the same schema returns an empty issue set."
      icon={<FileJson2 />}
    >
      <div className="contract-layout">
        <section className="code-card">
          <PanelTitle icon={<Braces />} label="API RESPONSE" meta="GET /v1/users/usr_204" />
          <div className="switch-row"><button className={mode === 'broken' ? 'selected' : ''} onClick={() => { setMode('broken'); setRan(false); }}>drift sample</button><button className={mode === 'valid' ? 'selected' : ''} onClick={() => { setMode('valid'); setRan(false); }}>valid control</button></div>
          <pre>{mode === 'broken' ? broken : valid}</pre>
          <button className="action" onClick={() => setRan(true)}><ScanSearch /> Validate response</button>
        </section>
        <section className="result-card" data-testid="contract-result">
          <PanelTitle icon={<BadgeCheck />} label="CONTRACT VERDICT" meta="schema user.v3" />
          {!ran ? <Waiting text="Validation reports paths, not a generic schema error." /> : mode === 'broken' ? <div className="contract-issues"><div><code>$.active</code><span>expected boolean</span><b>actual string</b></div><div><code>$.profile</code><span>expected present</span><b>actual missing</b></div></div> : <Pass title="CONTRACT SATISFIED" text="No missing fields or type mismatches were found." />}
        </section>
      </div>
    </CaseFrame>
  );
}

function CaseFrame({ code, title, subtitle, problem, decision, control, icon, children }: { code: string; title: string; subtitle: string; problem: string; decision: string; control: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <>
    <div className="case-heading"><div className="case-icon">{icon}</div><div><span>{code} / ACTIVE DOSSIER</span><h1>{title}</h1><p>{subtitle}</p></div></div>
    <div className="evidence-band"><article><i>01</i><span>PROBLEM</span><p>{problem}</p></article><article><i>02</i><span>WORKING DECISION</span><p>{decision}</p></article><article className="control"><i>03</i><span>NEGATIVE CONTROL</span><p>{control}</p></article></div>
    <div className="bench">{children}</div>
  </>;
}

function PanelTitle({ icon, label, meta }: { icon: React.ReactNode; label: string; meta: string }) { return <div className="panel-title"><span>{icon}{label}</span><small>{meta}</small></div>; }
function Waiting({ text }: { text: string }) { return <div className="waiting"><ScanSearch /><p>{text}</p></div>; }
function Pass({ title, text }: { title: string; text: string }) { return <div className="pass"><CheckCircle2 /><h3>{title}</h3><p>{text}</p></div>; }

createRoot(document.getElementById('root')!).render(<App />);
