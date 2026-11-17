import { useState } from "react";
import { api } from "./api.js";

const PROVIDERS = [
  ["Gmail", "G", "#ea4335", "Gmail / Google Workspace"],
  ["Outlook", "O", "#0a64c8", "Outlook / Microsoft 365"],
];
const STEPS = ["Authorising", "Fetching recent emails", "AI triage: who should reply?", "Ready"];

export default function Connect({ accounts, onDone, onCancel }) {
  const [prov, setProv] = useState(null);
  const [ask, setAsk] = useState(false);
  const [step, setStep] = useState(null);
  const [err, setErr] = useState("");
  const has = (n) => accounts?.some((a) => a.provider === n);

  async function run() {
    setAsk(false); setErr(""); setStep(0);
    const p = api("/accounts", "POST", { provider: prov });
    p.catch(() => {});
    try {
      for (let i = 1; i < 4; i++) { await new Promise((r) => setTimeout(r, 800)); setStep(i); }
      await p;
      setStep(4);
      setTimeout(onDone, 500);
    } catch (e) { setErr(e.message); setStep(null); }
  }

  if (step !== null)
    return (
      <div className="center"><div className="card">
        <h2>Setting up your inbox</h2>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s} className={i < step ? "d" : i === step ? "" : "mu"}>
              {i < step ? "✓" : i === step ? "…" : "○"} {i === 0 ? s + " " + prov : s}
            </div>
          ))}
        </div>
        <div className="bar"><i style={{ width: step * 25 + (step < 4 ? 12 : 0) + "%" }} /></div>
      </div></div>
    );

  return (
    <div className="center">
      <div className="logo">Inbox<b>ly</b></div>
      <h1 style={{ marginTop: 18 }}>Connect an email account</h1>
      <p className="mu">We only ask for read and send access. You can disconnect any time. (Prototype: connection is simulated with sample data.)</p>
      {err && <p style={{ color: "var(--er)" }}>{err}</p>}
      {PROVIDERS.map(([name, letter, color, label]) => (
        <button key={name} className="prov" disabled={has(name)} style={has(name) ? { opacity: 0.5 } : {}}
                onClick={() => { setProv(name); setAsk(true); }}>
          <span className="ic" style={{ background: color }}>{letter}</span>
          <span><b>{label}</b><br /><span className="mu" style={{ fontSize: 13 }}>{has(name) ? "Already connected" : "Click to connect"}</span></span>
        </button>
      ))}
      {onCancel && <button className="btn g" style={{ marginTop: 14 }} onClick={onCancel}>Back to dashboard</button>}
      {ask && (
        <div className="modal"><div className="card" style={{ maxWidth: 380 }}>
          <h2>{prov} wants access</h2>
          <p className="mu" style={{ fontSize: 14 }}>Inboxly will be able to:</p>
          <ul style={{ fontSize: 14, paddingLeft: 18 }}>
            <li>Read email messages and labels</li><li>Send replies on your behalf</li><li>See basic account info</li>
          </ul>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn g" style={{ flex: 1 }} onClick={() => setAsk(false)}>Cancel</button>
            <button className="btn" style={{ flex: 1 }} onClick={run}>Allow</button>
          </div>
        </div></div>
      )}
    </div>
  );
}
