const BASE = import.meta.env.VITE_API_URL || '/api/v1';
function getToken() { return localStorage.getItem('spandana_admin_token') || ''; }
async function req(method, path, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) { const t = getToken(); if (t) headers['Authorization'] = `Bearer ${t}`; }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body != null ? JSON.stringify(body) : undefined });
  if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); const err = new Error(e.error || 'Request failed'); err.status = res.status; throw err; }
  return res.json();
}
export const api = { get:(p,a)=>req('GET',p,null,a), post:(p,b,a)=>req('POST',p,b,a), put:(p,b,a)=>req('PUT',p,b,a), delete:(p,a)=>req('DELETE',p,null,a) };
