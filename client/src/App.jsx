import { useEffect, useState } from "react";
import { api } from "./api.js";
import Auth from "./Auth.jsx";
import Connect from "./Connect.jsx";
import Dashboard from "./Dashboard.jsx";

export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem("t"));
  const [accounts, setAccounts] = useState(null);
  const [adding, setAdding] = useState(false);

  function logout() {
    localStorage.removeItem("t");
    setAuth(false);
    setAccounts(null);
  }
  const load = () => api("/accounts").then(setAccounts).catch(logout);
  useEffect(() => { if (auth) load(); }, [auth]);

  if (!auth) return <Auth onAuth={() => setAuth(true)} />;
  if (!accounts) return <div className="center mu">Loading…</div>;
  if (!accounts.length || adding)
    return <Connect accounts={accounts} onDone={() => { setAdding(false); load(); }}
                    onCancel={accounts.length ? () => setAdding(false) : null} />;
  return <Dashboard accounts={accounts} reload={load} onAdd={() => setAdding(true)} onLogout={logout} />;
}
