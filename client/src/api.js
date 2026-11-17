// In production set VITE_API_URL (e.g. https://your-app.onrender.com) in the Vercel dashboard.
const BASE = (import.meta.env.VITE_API_URL || "") + "/api";

export async function api(path, method = "GET", body) {
  const t = localStorage.getItem("t");
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: "Bearer " + t } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
