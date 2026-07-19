// Auto-extracted from admin.tsx — VolunteerAppsTab
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

export default function VolunteerAppsTab({ token }: { token: string }) {
  const [apps, setApps] = useState<VolunteerApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteError, setDeleteError] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/admin/volunteers", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: VolunteerApp[]) => { setApps(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Remove this volunteer application from the server?")) return;
    setDeleting(id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/volunteers/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setDeleteError(json.error ?? "Delete failed. Please try again.");
        return;
      }
      load();
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  function downloadCsv() {
    if (!apps.length) return;
    const headers = ["Submitted At", "Full Name", "Email", "Phone", "Age", "Address", "Occupation", "Skills", "Areas of Interest", "Availability", "Emergency Contact", "Emergency Phone", "Motivation"];
    const rows = apps.map((a) => [
      a.submittedAt, a.fullName, a.email, a.phone, a.age ?? "", a.address ?? "",
      a.occupation, a.skills ?? "", (a.areasOfInterest ?? []).join("; "),
      (a.availability ?? []).join("; "), a.emergencyContactName ?? "", a.emergencyContactPhone ?? "",
      `"${(a.motivation ?? "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "volunteer-applications.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = apps.filter((a) =>
    !search || a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.occupation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto">
      {deleteError && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" /> {deleteError}
        </div>
      )}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-serif font-bold">Volunteer Applications</h2>
          <p className="text-sm text-muted-foreground mt-1">{apps.length} total submission{apps.length !== 1 ? "s" : ""} — saved locally on server</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={downloadCsv} disabled={!apps.length}>
            <Download size={13} /> Export CSV
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search by name, email, or occupation…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-5 rounded-xl"
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading applications…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <UserPlus size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{search ? "No matches found" : "No applications yet"}</p>
          <p className="text-xs mt-1">{search ? "Try a different search term" : "Submissions from the volunteer form will appear here"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <UserCheck size={15} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{a.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.email} · {a.occupation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(a.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {expanded === a.id ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
                </div>
              </button>

              {expanded === a.id && (
                <div className="px-5 pb-5 border-t border-border bg-muted/10">
                  <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
                    {[
                      ["Phone", a.phone],
                      ["Age", a.age],
                      ["Address", a.address],
                      ["Skills", a.skills],
                      ["Areas of Interest", (a.areasOfInterest ?? []).join(", ")],
                      ["Availability", (a.availability ?? []).join(", ")],
                      ["Emergency Contact", a.emergencyContactName],
                      ["Emergency Phone", a.emergencyContactPhone],
                    ].map(([label, val]) => val ? (
                      <div key={label as string}>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                        <p className="text-sm">{val}</p>
                      </div>
                    ) : null)}
                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Motivation</p>
                      <p className="text-sm leading-relaxed">{a.motivation}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Declaration: {a.declaration ? "✓ Accepted" : "—"} · Children safeguarding: {a.childrenDeclaration ? "✓ Accepted" : "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">Submitted: {new Date(a.submittedAt).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="destructive" size="sm" className="rounded-full gap-2" onClick={() => del(a.id)} disabled={deleting === a.id}>
                      {deleting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


