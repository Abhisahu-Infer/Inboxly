import { useEffect, useState } from "react";
import { api } from "./api.js";

const OWN = { client: "Client replies", assistant: "Assistant replies", none: "No reply needed" };
const FILTERS = [["all", "All"], ["client", "Needs client"], ["assistant", "Needs me"], ["none", "FYI"], ["high", "High priority"], ["done", "Done"]];
const when = (d) => new Date(d).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });

function Tags({ e }) {
  return (
    <>
      <span className={"tag t-" + e.owner}>{OWN[e.owner]}</span>
      <span className={"tag t-" + e.priority}>{e.priority === "med" ? "medium" : e.priority} priority</span>
      <span className="tag t-none">{e.category}</span>
    </>
  );
}

function toggleTheme() {
  const dark = matchMedia("(prefers-color-scheme: dark)").matches;
  const cur = document.documentElement.dataset.theme || (dark ? "dark" : "light");
  document.documentElement.dataset.theme = cur === "dark" ? "light" : "dark";
}

export default function Dashboard({ accounts, reload, onAdd, onLogout }) {
  const [view, setView] = useState("A");
  const [clients, setClients] = useState([]);
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState({});
  const [f, setF] = useState("all");
  const [cl, setCl] = useState("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [pc, setPc] = useState("");
  const [msg, setMsg] = useState("");
  const [tick, setTick] = useState(0);

  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(""), 1800); };
  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    api("/clients").then((c) => { setClients(c); setPc((p) => p || c[0]?._id || ""); });
  }, [accounts.length]);

  useEffect(() => {
    if (view === "A") {
      api(`/emails?client=${cl}&filter=${f}&q=${encodeURIComponent(q)}`).then(setEmails);
      api(`/stats?client=${cl}`).then(setStats);
    } else if (pc) {
      api(`/emails?client=${pc}&filter=client`).then(setEmails);
    }
  }, [view, f, cl, q, pc, tick]);

  async function act(id, body, m) {
    await api("/emails/" + id, "PATCH", body);
    refresh();
    if (m) toast(m);
  }
  async function sync() {
    await Promise.all(accounts.map((a) => api(`/accounts/${a._id}/sync`, "POST")));
    reload(); refresh(); toast("Synced just now");
  }
  async function simulate() {
    try { await api("/emails/simulate", "POST"); setSel(null); refresh(); toast("New email analysed by AI"); }
    catch (e) { toast(e.message); }
  }

  const e = emails.find((x) => x._id === sel);
  const cname = (x) => x.client?.name || "The client";
  const statCards = [["Total emails", stats.total], ["Need client", stats.needClient], ["Need assistant", stats.needAssistant], ["High priority", stats.high], ["Unread", stats.unread]];
  const pcName = clients.find((c) => c._id === pc)?.name || "";

  return (
    <div className="wrap">
      <div className="top">
        <div className="logo">Inbox<b>ly</b></div>
        <div className="tabs">
          <button className={view === "A" ? "on" : ""} onClick={() => setView("A")}>Assistant view</button>
          <button className={view === "C" ? "on" : ""} onClick={() => setView("C")}>Client view</button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span className="pill ok">● {accounts.map((a) => a.provider).join(" + ")} connected</span>
          <button className="btn g sm" onClick={sync}>↻ Sync</button>
          <button className="btn g sm" onClick={onAdd}>+ Account</button>
          <button className="btn g sm" onClick={toggleTheme}>◐</button>
          <button className="btn g sm" onClick={onLogout}>Log out</button>
        </div>
      </div>

      {view === "A" ? (
        <>
          <div className="stats">
            {statCards.map(([l, v]) => <div key={l} className="card stat"><b>{v ?? "–"}</b><span className="mu">{l}</span></div>)}
          </div>
          <div className="row">
            <select value={cl} onChange={(x) => setCl(x.target.value)}>
              <option value="">All clients</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input placeholder="Search emails…" value={q} onChange={(x) => setQ(x.target.value)} />
            <button className="btn sm" onClick={simulate}>+ Simulate incoming email</button>
          </div>
          <div className="row">
            {FILTERS.map(([k, l]) => <button key={k} className={"chip " + (f === k ? "on" : "")} onClick={() => setF(k)}>{l}</button>)}
          </div>
          <div className={"grid " + (e ? "det" : "")}>
            <div className="card lst" style={{ padding: 0 }}>
              {emails.length === 0 && <p className="mu" style={{ padding: 16 }}>Nothing here. Inbox zero 🎉</p>}
              {emails.map((m) => (
                <div key={m._id} className={`mail ${m.unread ? "u" : ""} ${sel === m._id ? "sel" : ""}`}
                     onClick={() => { setSel(m._id); if (m.unread) act(m._id, { unread: false }); }}>
                  <div className="m"><span className="s">{m.from}</span><span className="mu">{when(m.receivedAt)}</span></div>
                  <div className="s">{m.subject}</div>
                  <div className="p">{m.body}</div>
                  <div style={{ marginTop: 6 }}><Tags e={m} /></div>
                  <div className="mu" style={{ fontSize: 12, marginTop: 2 }}>{cname(m)}</div>
                </div>
              ))}
            </div>
            <div className="card dt">
              {!e ? <p className="mu">Select an email to see the AI analysis and a suggested reply.</p> : (
                <>
                  <button className="btn g sm back" onClick={() => setSel(null)}>← Back</button>
                  <h2>{e.subject}</h2>
                  <div className="mu" style={{ fontSize: 13 }}>From {e.from} · to {cname(e)} ({e.client?.provider}) · {when(e.receivedAt)}</div>
                  <p>{e.body}</p>
                  <div style={{ margin: "8px 0" }}><Tags e={e} /></div>
                  <div className="ai">
                    <b>✨ AI verdict: {e.owner === "client" ? cname(e) + " should reply personally" : e.owner === "assistant" ? "Assistant can handle this" : "No reply needed"}</b>
                    <div className="bar"><i style={{ width: e.confidence + "%" }} /></div>
                    <div className="mu" style={{ fontSize: 12 }}>{e.confidence}% confidence</div>
                    <p style={{ margin: "8px 0 0" }}>{e.reason}</p>
                  </div>
                  <div className="row">
                    <span className="mu" style={{ fontSize: 13 }}>Override:</span>
                    {["client", "assistant", "none"].map((o) => (
                      <button key={o} className="chip" onClick={() => act(e._id, { owner: o }, "Reassigned")}>{o === "none" ? "No reply" : o[0].toUpperCase() + o.slice(1)}</button>
                    ))}
                  </div>
                  {e.draft && <><b style={{ fontSize: 13 }}>Suggested draft</b><pre>{e.draft}</pre></>}
                  <div className="row">
                    <button className="btn sm" onClick={() => act(e._id, { done: !e.done })}>{e.done ? "Reopen" : "Mark done"}</button>
                    {e.owner === "client" && <button className="btn g sm" onClick={() => toast("Reminder sent to " + cname(e))}>Nudge client</button>}
                    {e.owner === "assistant" && <button className="btn g sm" onClick={() => toast("Draft sent for approval")}>Send draft</button>}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="row">
            <select value={pc} onChange={(x) => setPc(x.target.value)}>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <h1>Hi {pcName.split(" ")[0]} 👋</h1>
          <p className="mu">
            {emails.length ? `${emails.length} email${emails.length > 1 ? "s need" : " needs"} you personally. Your assistant handles the rest.` : "You’re all caught up. Your assistant has everything else."}
          </p>
          {emails.map((m) => (
            <div key={m._id} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><b>{m.from}</b><span className="mu" style={{ fontSize: 13 }}>{when(m.receivedAt)}</span></div>
              <div><b>{m.subject}</b></div>
              <p className="mu" style={{ margin: "4px 0 8px" }}>{m.body}</p>
              <div className="mu" style={{ fontSize: 12, marginBottom: 8 }}>✨ {m.reason}</div>
              <div className="row" style={{ margin: 0 }}>
                <button className="btn sm" onClick={() => act(m._id, { done: true }, "Marked as handled by you")}>I’ll reply</button>
                <button className="btn g sm" onClick={() => act(m._id, { owner: "assistant" }, "Passed to your assistant")}>Assistant, handle this</button>
                <button className="btn g sm" onClick={() => act(m._id, { owner: "none" }, "Marked as no reply needed")}>No reply needed</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}
