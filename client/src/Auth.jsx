import { useState } from "react";
import { api } from "./api.js";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("up");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const d = await api(mode === "up" ? "/auth/signup" : "/auth/login", "POST", f);
      localStorage.setItem("t", d.token);
      onAuth();
    } catch (x) { setErr(x.message); }
  }

  return (
    <div className="center">
      <div className="logo">Inbox<b>ly</b></div>
      <h1 style={{ marginTop: 18 }}>Every client inbox, one calm place.</h1>
      <p className="mu">Connect your clients’ email, let AI work out who needs to reply, and never chase an unanswered thread again.</p>
      <form className="card" onSubmit={submit}>
        <div className="tabs" style={{ marginBottom: 12 }}>
          <button type="button" className={mode === "up" ? "on" : ""} style={{ flex: 1 }} onClick={() => setMode("up")}>Sign up</button>
          <button type="button" className={mode === "in" ? "on" : ""} style={{ flex: 1 }} onClick={() => setMode("in")}>Log in</button>
        </div>
        {mode === "up" && <input placeholder="Full name" value={f.name} onChange={set("name")} style={{ marginBottom: 8 }} />}
        <input type="email" placeholder="Work email" value={f.email} onChange={set("email")} style={{ marginBottom: 8 }} required />
        <input type="password" placeholder="Password (6+ characters)" value={f.password} onChange={set("password")} style={{ marginBottom: 12 }} required />
        {err && <p style={{ color: "var(--er)", margin: "0 0 10px" }}>{err}</p>}
        <button className="btn" style={{ width: "100%" }}>{mode === "up" ? "Create account" : "Log in"}</button>
      </form>
    </div>
  );
}
