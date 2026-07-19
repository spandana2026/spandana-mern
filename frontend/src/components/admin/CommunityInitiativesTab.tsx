import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Save, X, Loader2, CheckCircle2, AlertCircle, Upload, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CommunityInitiative {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  status: "active" | "completed";
  published: boolean;
  order: number;
}

type InitForm = Omit<CommunityInitiative, "id">;

const EMPTY_FORM: InitForm = {
  title: "", description: "", icon: "🤝", image: "",
  status: "active", published: true, order: 0,
};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">{children}</label>;
}

const COMMON_ICONS = ["🤝", "🏠", "👩", "❤️", "🌱", "📚", "🏥", "💪", "🎓", "🌍", "👥", "⭐", "🔨", "🎯", "🕊️"];

export default function CommunityInitiativesTab({ token }: { token: string }) {
  const [items, setItems] = useState<CommunityInitiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<InitForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<CommunityInitiative | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/initiatives", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: CommunityInitiative[]) => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function toast(ok: boolean, text: string) {
    setFeedback({ ok, text });
    setTimeout(() => setFeedback(null), 3200);
  }

  function startEdit(item: CommunityInitiative) {
    setEditing(item);
    setForm({ title: item.title, description: item.description, icon: item.icon, image: item.image, status: item.status, published: item.published, order: item.order });
    setShowForm(true);
  }

  function cancel() { setEditing(null); setForm(EMPTY_FORM); setShowForm(false); }

  async function uploadImage(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast(false, "Image too large — max 5 MB"); return; }
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) { setForm((f) => ({ ...f, image: data.url! })); toast(true, "Image uploaded!"); }
      else toast(false, data.error ?? "Upload failed");
    } catch { toast(false, "Upload failed"); }
    finally { setUploading(false); }
  }

  async function save() {
    if (!form.title.trim()) { toast(false, "Title is required"); return; }
    setSaving(true);
    const url = editing ? `/api/admin/initiatives/${editing.id}` : "/api/admin/initiatives";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    const json = await res.json();
    setSaving(false);
    if (res.ok) { toast(true, editing ? "Initiative updated." : "Initiative created."); cancel(); load(); }
    else toast(false, json.error ?? "Save failed");
  }

  async function del(id: string) {
    if (!confirm("Delete this initiative?")) return;
    await fetch(`/api/admin/initiatives/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    toast(true, "Deleted."); load();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Community Initiatives</h2>
          <p className="text-sm text-muted-foreground mt-1">{items.length} initiative{items.length !== 1 ? "s" : ""} · Programmes, drives, and outreach</p>
        </div>
        {!showForm && (
          <Button className="rounded-full gap-2" onClick={() => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); }}>
            <Plus size={16} />Add Initiative
          </Button>
        )}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${feedback.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {feedback.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}{feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-base">{editing ? "Edit Initiative" : "Add New Initiative"}</h3>
              <button onClick={cancel} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-start">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Sahara Community Center" />
                </div>
                <div>
                  <Label>Icon (emoji)</Label>
                  <Input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="w-20 text-center text-xl" maxLength={4} />
                </div>
              </div>
              <div>
                <Label>Quick-pick Icons</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ICONS.map((ic) => (
                    <button key={ic} type="button" onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                      className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center hover:bg-primary/10 transition-colors ${form.icon === ic ? "border-primary bg-primary/10" : "border-border"}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as InitForm["status"] }))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="min-h-[90px] resize-none" placeholder="Describe this initiative, its goals, and the community it serves..." />
              </div>
              <div>
                <Label>Initiative Image</Label>
                {form.image && (
                  <div className="flex items-center gap-3 p-2 bg-muted/40 rounded-xl border border-border mb-2">
                    <img src={form.image} alt="" className="w-14 h-14 rounded-lg object-cover border border-border" />
                    <div className="flex-1 min-w-0 text-xs text-muted-foreground truncate">{form.image}</div>
                    <Button type="button" variant="outline" size="sm" className="rounded-lg text-destructive border-destructive/30 text-xs"
                      onClick={() => setForm((f) => ({ ...f, image: "" }))}>Remove</Button>
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                  <span className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 rounded-xl py-3 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/20">
                    {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    {uploading ? "Uploading..." : form.image ? "Replace Image" : "Upload Image"}
                  </span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="init-pub" checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary cursor-pointer" />
                <label htmlFor="init-pub" className="text-sm font-medium cursor-pointer select-none">Published (visible on website)</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-border">
              <Button variant="outline" className="rounded-full" onClick={cancel}><X size={14} className="mr-1.5" />Cancel</Button>
              <Button className="rounded-full gap-1.5" onClick={save} disabled={saving || !form.title.trim()}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {editing ? "Update Initiative" : "Create Initiative"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Globe size={40} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium">No initiatives yet.</p>
          <p className="text-sm mt-1">Click "Add Initiative" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-14 h-14 rounded-xl border border-border bg-muted/30 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${item.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>{item.status}</span>
                  {!item.published && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Draft</span>}
                </div>
                <p className="font-semibold text-sm truncate">{item.title}</p>
                {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs" onClick={() => startEdit(item)}><Pencil size={12} />Edit</Button>
                <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => del(item.id)}><Trash2 size={12} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
