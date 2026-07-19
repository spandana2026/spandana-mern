const BASE = import.meta.env.VITE_API_URL || '/api/v1';
function getToken() { return localStorage.getItem('spandana_admin_token') || ''; }
export const uploadService = {
  async uploadSingle(file, endpoint='/admin/gallery') {
    const form = new FormData(); form.append('file', file);
    const res = await fetch(`${BASE}${endpoint}`, { method:'POST', headers:{ Authorization:`Bearer ${getToken()}` }, body:form });
    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error||'Upload failed'); }
    return res.json();
  },
  async uploadBulk(files) {
    const form = new FormData(); for(const f of files) form.append('files',f);
    const res = await fetch(`${BASE}/admin/gallery/bulk`, { method:'POST', headers:{ Authorization:`Bearer ${getToken()}` }, body:form });
    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error||'Upload failed'); }
    return res.json();
  },
};
