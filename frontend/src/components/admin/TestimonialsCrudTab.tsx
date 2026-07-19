import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, X, Loader2, CheckCircle2, AlertCircle, Pencil, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  avatarUrl: string;
  rating: number;
  published: boolean;
  order: number;
  createdAt: string;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">{children}</label>;
}

const EMPTY: Omit<Testimonial, "id" | "createdAt"> = {
  name: "", role: "", organization: "", quote: "", avatarUrl: "", rating: 5, published: false, order: 0,
};

export default function TestimonialsCrudTab({ token }: { token: string }) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/testimonials", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: Testimonial[]) => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function toast(ok: boolean, text: string) {
    setFeedback({ ok, text });
    setTimeout(() => setFeedback(null), 3200);
  }

  function openNew() { setEditing({ ...EMPTY, id: "", createdAt: "" }); setIsNew(true); }
  function openEdit(item: Testimonial) { setEditing({ ...item }); setIsNew(false); }

  async function save() {
    if (!editing || !editing.name.trim()) { toast(false, "Name is required."); return; }
    setSaving(true);
    const url = isNew ? "/api/admin/testimonials" : `/api/admin/testimonials/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    if (res.ok) { toast(true, isNew ? "Testimonial added." : "Testimonial updated."); setEditing(null); load(); }
    else toast(false, "Save failed.");
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    toast(true, "Deleted."); load();
  }

  function set<K extends keyof Testimonial>(key: K, val: Testimonial[K]) {
    setEditing((e) => e ? { ...e, [key]: val } : e);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Testimonials</h2>
          <p className="text-sm text-muted-foreground mt-1">{items.length} testimonial{items.length !== 1 ? "s" : ""} · Voices of the community</p>
        </div>
        <Button className="rounded-full gap-2" onClick={openNew}><Plus size={15} />Add Testimonial</Button>
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
              <h3 className="font-semibold text-lg">{isNew ? "Add Testimonial" : "Edit Testimonial"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input value={editing.name} onChange={(e) => set("name", e.target.value)} placeholder="Person's name" />
              </div>
              <div>
                <Label>Role / Title</Label>
                <Input value={editing.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Volunteer, Parent" />
              </div>
              <div>
                <Label>Organization</Label>
                <Input value={editing.organization} onChange={(e) => set("organization", e.target.value)} placeholder="Company or community" />
              </div>
              <div>
                <Label>Avatar / Photo URL</Label>
                <Input value={editing.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} placeholder="https://…/avatar.jpg" />
              </div>
              <div>
                <Label>Star Rating</Label>
                <select value={editing.rating} onChange={(e) => set("rating", Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n}/5)</option>)}
                </select>
              </div>
              <div>
                <Label>Display Order</Label>
                <Input type="number" value={editing.order} onChange={(e) => set("order", Number(e.target.value))} min={0} />
              </div>
              <div className="sm:col-span-2">
                <Label>Quote *</Label>
                <textarea value={editing.quote} onChange={(e) => set("quote", e.target.value)}
                  rows={4} placeholder="Their words about Spandana…"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input type="checkbox" id="tm-pub" checked={editing.published}
                  onChange={(e) => set("published", e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer" />
                <label htmlFor="tm-pub" className="text-sm font-medium cursor-pointer select-none">Published (visible on site)</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border">
              <Button variant="outline" className="rounded-full" onClick={() => setEditing(null)}><X size={14} className="mr-1.5" />Cancel</Button>
              <Button className="rounded-full gap-1.5" onClick={save} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isNew ? "Add Testimonial" : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : items.length === 0 && !editing ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
          <MessageSquare size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <p className="font-semibold mb-1">No testimonials yet</p>
          <p className="text-sm text-muted-foreground mb-6">Add voices from your community to build trust and credibility.</p>
          <Button className="rounded-full gap-2" onClick={openNew}><Plus size={15} />Add First Testimonial</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div key={item.id} layout
              className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
              {item.avatarUrl ? (
                <img src={item.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-border shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0 text-lg font-bold text-muted-foreground">
                  {item.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{[item.role, item.organization].filter(Boolean).join(" · ")}</p>
                    <div className="flex mt-0.5">{Array.from({ length: item.rating }, (_, i) => <Star key={i} size={10} className="fill-amber-400 text-amber-400" />)}</div>
                    {item.quote && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">"{item.quote}"</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.published ? "Live" : "Draft"}
                    </span>
                    <button onClick={() => openEdit(item)}
                      className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => del(item.id, item.name)}
                      className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
