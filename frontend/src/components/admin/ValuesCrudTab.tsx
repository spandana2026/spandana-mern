import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, X, Loader2, CheckCircle2, AlertCircle, Pencil, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CoreValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  published: boolean;
  createdAt: string;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">{children}</label>;
}

const EMPTY: Omit<CoreValue, "id" | "createdAt"> = {
  title: "", description: "", icon: "✦", order: 0, published: true,
};

export default function ValuesCrudTab({ token }: { token: string }) {
  const [items, setItems] = useState<CoreValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CoreValue | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/values", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: CoreValue[]) => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function toast(ok: boolean, text: string) {
    setFeedback({ ok, text });
    setTimeout(() => setFeedback(null), 3200);
  }

  function openNew() { setEditing({ ...EMPTY, id: "", createdAt: "" }); setIsNew(true); }
  function openEdit(item: CoreValue) { setEditing({ ...item }); setIsNew(false); }

  async function save() {
    if (!editing || !editing.title.trim()) { toast(false, "Title is required."); return; }
    setSaving(true);
    const url = isNew ? "/api/admin/values" : `/api/admin/values/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    if (res.ok) { toast(true, isNew ? "Value created." : "Value updated."); setEditing(null); load(); }
    else toast(false, "Save failed.");
  }

  async function del(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admin/values/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    toast(true, "Deleted."); load();
  }

  function set<K extends keyof CoreValue>(key: K, val: CoreValue[K]) {
    setEditing((e) => e ? { ...e, [key]: val } : e);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Core Values</h2>
          <p className="text-sm text-muted-foreground mt-1">{items.length} value{items.length !== 1 ? "s" : ""} · Foundation principles</p>
        </div>
        <Button className="rounded-full gap-2" onClick={openNew}><Plus size={15} />Add Value</Button>
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
        {editing && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{isNew ? "New Core Value" : "Edit Value"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input value={editing.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Compassion" />
              </div>
              <div>
                <Label>Icon (emoji or symbol)</Label>
                <Input value={editing.icon} onChange={(e) => set("icon", e.target.value)} placeholder="✦ 💙 🌱" />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input type="number" value={editing.order} onChange={(e) => set("order", Number(e.target.value))} min={0} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="val-pub" checked={editing.published}
                  onChange={(e) => set("published", e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer" />
                <label htmlFor="val-pub" className="text-sm font-medium cursor-pointer select-none">Published</label>
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <textarea value={editing.description} onChange={(e) => set("description", e.target.value)}
                  rows={3} placeholder="What this value means to Spandana…"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border">
              <Button variant="outline" className="rounded-full" onClick={() => setEditing(null)}><X size={14} className="mr-1.5" />Cancel</Button>
              <Button className="rounded-full gap-1.5" onClick={save} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isNew ? "Add Value" : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : items.length === 0 && !editing ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
          <ShieldCheck size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <p className="font-semibold mb-1">No values defined yet</p>
          <p className="text-sm text-muted-foreground mb-6">Define the core principles that guide Spandana's work.</p>
          <Button className="rounded-full gap-2" onClick={openNew}><Plus size={15} />Add First Value</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div key={item.id} layout
              className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{item.title}</p>
                {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {item.published ? "Live" : "Hidden"}
                </span>
                <button onClick={() => openEdit(item)}
                  className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => del(item.id, item.title)}
                  className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
