// Auto-extracted from admin.tsx — SubscribersTab
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Loader2, Plus, Trash2, Pencil, X, Eye, EyeOff,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Upload, Download, RefreshCw, ExternalLink, Lock, KeyRound,
  UserCheck, UserX, UserPlus, CalendarDays, MapPin, Clock,
  Send, History, Megaphone, Image, Globe, DollarSign, Mail,
  Star, FileText, FolderOpen, UsersRound, Sheet,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch }   from "@/components/ui/switch";

export default function SubscribersTab({ token }: { token: string }) {
  const [subs, setSubs] = useState<string[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function load() {
    setSubsLoading(true);
    fetch("/api/newsletter/subscribers", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setSubs(d.subscribers ?? []); setSubsLoading(false); })
      .catch(() => setSubsLoading(false));
  }

  function syncToSheet() {
    setSyncing(true);
    setSyncMsg(null);
    fetch("/api/newsletter/sync-to-sheet", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setSyncing(false);
        if (d.success) setSyncMsg({ ok: true, text: `Synced ${d.synced} subscriber${d.synced !== 1 ? "s" : ""} to Google Sheet.` });
        else setSyncMsg({ ok: false, text: d.error ?? "Sync failed." });
      })
      .catch(() => { setSyncing(false); setSyncMsg({ ok: false, text: "Network error. Try again." }); });
  }

  useEffect(() => { load(); }, []);

  function downloadCSV() {
    const csv = "Email\n" + subs.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "newsletter-subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = subs.filter((e) => e.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Newsletter Subscribers</h2>
          <p className="text-sm text-muted-foreground mt-1">{subs.length} subscriber{subs.length !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="rounded-full gap-2" onClick={load}><RefreshCw size={14} />Refresh</Button>
          <Button variant="outline" className="rounded-full gap-2" onClick={downloadCSV} disabled={subs.length === 0}><Download size={14} />Download CSV</Button>
          <Button className="rounded-full gap-2 bg-green-600 hover:bg-green-700" onClick={syncToSheet} disabled={subs.length === 0 || syncing}>
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <Sheet size={14} />}
            {syncing ? "Syncing…" : "Sync to Google Sheet"}
          </Button>
        </div>
      </div>

      {syncMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${syncMsg.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {syncMsg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {syncMsg.text}
        </div>
      )}

      {subsLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : subs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl">
          <Mail size={36} className="mx-auto mb-3 opacity-30" />
          <p>No subscribers yet.</p>
          <p className="text-xs mt-1">Emails will appear here as people subscribe on the website.</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emails…" className="max-w-xs" />
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[auto_1fr] divide-y divide-border">
              <div className="px-4 py-3 bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">#</div>
              <div className="px-4 py-3 bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</div>
              {filtered.map((email, i) => (
                <>
                  <div key={`n-${email}`} className="px-4 py-3 text-sm text-muted-foreground border-t border-border">{i + 1}</div>
                  <div key={`e-${email}`} className="px-4 py-3 text-sm font-mono border-t border-border">{email}</div>
                </>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">No results for "{search}"</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-right">Showing {filtered.length} of {subs.length}</p>
        </>
      )}
    </div>
  );
}