// Auto-extracted from admin.tsx — EventsTab
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Loader2, Plus, Trash2, Pencil, X, Eye, EyeOff,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Upload, Download, RefreshCw, ExternalLink, Lock, KeyRound,
  UserCheck, UserX, UserPlus, CalendarDays, MapPin, Clock,
  Send, History, Megaphone, Image, Globe, DollarSign, Mail,
  Star, FileText, FolderOpen, UsersRound,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch }   from "@/components/ui/switch";

interface AdminEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: string;
  published: boolean;
  volunteersNeeded?: number;
  volunteersAttended?: number;
}

const EVENT_CATEGORIES = ["General", "Health", "Community", "Education", "Fundraiser", "Volunteer"];
const EMPTY_EVENT: Omit<AdminEvent, "id"> = {
  title: "", date: "", time: "", location: "", description: "", image: "",
  category: "General", published: true, volunteersNeeded: 0, volunteersAttended: 0,
};

export default function EventsTab({ token }: { token: string }) {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<AdminEvent, "id">>(EMPTY_EVENT);
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/events", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d: AdminEvent[]) => { setEvents(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function showFeedback(ok: boolean, text: string) {
    setFeedback({ ok, text });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function save() {
    setSaving(true);
    const url = editing ? `/api/admin/events/${editing.id}` : "/api/admin/events";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    const json = await res.json();
    setSaving(false);
    if (res.ok) { showFeedback(true, editing ? "Event updated." : "Event created."); setAdding(false); setEditing(null); load(); }
    else showFeedback(false, json.error ?? "Save failed.");
  }

  async function del(id: string) {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { showFeedback(true, "Event deleted."); load(); }
    else { const json = await res.json().catch(() => ({})); showFeedback(false, json.error ?? "Delete failed."); }
  }

  async function togglePublish(ev: AdminEvent) {
    await fetch(`/api/admin/events/${ev.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...ev, published: !ev.published }) });
    load();
  }

  function startEdit(ev: AdminEvent) { setEditing(ev); setForm({ title: ev.title, date: ev.date, time: ev.time, location: ev.location, description: ev.description, image: ev.image, category: ev.category, published: ev.published, volunteersNeeded: ev.volunteersNeeded ?? 0, volunteersAttended: ev.volunteersAttended ?? 0 }); setAdding(true); }
  function cancelForm() { setAdding(false); setEditing(null); setForm(EMPTY_EVENT); }

  function formatDateDisplay(d: string) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }

  const showForm = adding || !!editing;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Events</h2>
          <p className="text-sm text-muted-foreground mt-1">{events.length} event{events.length !== 1 ? "s" : ""} · visible at <a href="/events" target="_blank" className="underline text-primary">/events</a></p>
        </div>
        {!showForm && <Button className="rounded-full gap-2" onClick={() => { setForm(EMPTY_EVENT); setAdding(true); setEditing(null); }}><Plus size={16} />Add Event</Button>}
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
            <h3 className="font-semibold text-base mb-5">{editing ? "Edit Event" : "Add New Event"}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Event Title *</label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Annual Health Camp 2026" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Date *</label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Time *</label>
                <Input value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} placeholder="e.g. 9:00 AM – 4:00 PM" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Location *</label>
                <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Sahara Community Center, Secunderabad" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Image Path</label>
                <Input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="/images/physical.png" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Description *</label>
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe the event, what to expect, who should attend..." className="min-h-[100px] resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Volunteers Needed</label>
                <Input type="number" min={0} value={form.volunteersNeeded ?? 0} onChange={(e) => setForm((f) => ({ ...f, volunteersNeeded: parseInt(e.target.value) || 0 }))} placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Volunteers Attended</label>
                <Input type="number" min={0} value={form.volunteersAttended ?? 0} onChange={(e) => setForm((f) => ({ ...f, volunteersAttended: parseInt(e.target.value) || 0 }))} placeholder="0" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Published</label>
                <button type="button" onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.published ? "bg-primary" : "bg-muted-foreground/30"}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${form.published ? "translate-x-4" : "translate-x-1"}`} />
                </button>
                <span className="text-xs text-muted-foreground">{form.published ? "Visible on /events" : "Hidden from public"}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-border">
              <Button variant="outline" className="rounded-full" onClick={cancelForm}><X size={14} className="mr-1.5" />Cancel</Button>
              <Button className="rounded-full gap-1.5" onClick={save} disabled={saving || !form.title || !form.date || !form.location}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{editing ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted-foreground">
          <CalendarDays size={36} className="mx-auto mb-3 opacity-30" />
          <p>No events yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className={`bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow ${!ev.published ? "opacity-60" : ""}`}>
              <div className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[56px] shrink-0 ${ev.published ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                <span className="text-lg font-bold leading-none">{ev.date ? new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric" }) : "—"}</span>
                <span className="text-[10px] font-semibold uppercase">{ev.date ? new Date(ev.date).toLocaleDateString("en-IN", { month: "short" }) : ""}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm truncate">{ev.title}</p>
                  {!ev.published && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">Hidden</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock size={10} />{ev.time}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} /><span className="truncate max-w-[180px]">{ev.location}</span></span>
                  <span className="text-primary font-medium">{ev.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs" onClick={() => togglePublish(ev)}>
                  {ev.published ? <EyeOff size={12} /> : <Eye size={12} />}{ev.published ? "Hide" : "Show"}
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs" onClick={() => startEdit(ev)}><Pencil size={12} />Edit</Button>
                <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => del(ev.id)}><Trash2 size={12} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


