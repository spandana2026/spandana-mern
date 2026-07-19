import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, X, Loader2, CheckCircle2, AlertCircle, Upload, Images, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  category: string;
  published: boolean;
  order: number;
}

const CATEGORIES = ["General", "Events", "Health Camps", "Community", "Volunteers", "Fieldwork", "Awards"];

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">{children}</label>;
}

export default function GalleryTab({ token }: { token: string }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/gallery", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: GalleryItem[]) => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function toast(ok: boolean, text: string) {
    setFeedback({ ok, text });
    setTimeout(() => setFeedback(null), 3200);
  }

  async function bulkUpload(files: FileList) {
    if (files.length === 0) return;
    const MAX_SIZE = 8 * 1024 * 1024;
    const valid = Array.from(files).filter((f) => f.size <= MAX_SIZE);
    if (valid.length < files.length) toast(false, `${files.length - valid.length} file(s) skipped — max 8 MB each.`);
    if (valid.length === 0) return;

    setUploading(true);
    setUploadProgress(`Uploading ${valid.length} image${valid.length > 1 ? "s" : ""}…`);
    const fd = new FormData();
    valid.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/admin/gallery/bulk", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json() as GalleryItem[] | { error: string };
      if (res.ok && Array.isArray(data)) {
        toast(true, `${data.length} image${data.length > 1 ? "s" : ""} added to gallery!`);
        load();
      } else {
        toast(false, (data as { error: string }).error ?? "Upload failed");
      }
    } catch { toast(false, "Upload failed"); }
    finally { setUploading(false); setUploadProgress(""); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function updateItem() {
    if (!editItem) return;
    setSaving(true);
    const { id, ...rest } = editItem;
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(rest),
    });
    setSaving(false);
    if (res.ok) { toast(true, "Saved."); setEditItem(null); load(); }
    else toast(false, "Save failed");
  }

  async function del(id: string) {
    if (!confirm("Remove this photo from the gallery?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    toast(true, "Removed."); load();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Photo Gallery</h2>
          <p className="text-sm text-muted-foreground mt-1">{items.length} photo{items.length !== 1 ? "s" : ""} · Fieldwork, events &amp; community moments</p>
        </div>
        <Button className="rounded-full gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? uploadProgress : "Upload Photos"}
        </Button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files) bulkUpload(e.target.files); }} />

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${feedback.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {feedback.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}{feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit overlay */}
      <AnimatePresence>
        {editItem && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-5">
              <img src={editItem.imageUrl} alt="" className="w-24 h-24 rounded-xl object-cover border border-border shrink-0" />
              <div className="flex-1 grid gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Edit Photo Details</h3>
                  <button onClick={() => setEditItem(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Title (optional)</Label>
                    <Input value={editItem.title} onChange={(e) => setEditItem((i) => i ? { ...i, title: e.target.value } : i)} placeholder="Photo title" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select value={editItem.category}
                      onChange={(e) => setEditItem((i) => i ? { ...i, category: e.target.value } : i)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Caption (shown in gallery)</Label>
                    <Input value={editItem.caption} onChange={(e) => setEditItem((i) => i ? { ...i, caption: e.target.value } : i)} placeholder="Brief description of this photo..." />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <input type="checkbox" id="gal-pub" checked={editItem.published}
                      onChange={(e) => setEditItem((i) => i ? { ...i, published: e.target.checked } : i)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer" />
                    <label htmlFor="gal-pub" className="text-sm font-medium cursor-pointer select-none">Published (visible in gallery)</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <Button variant="outline" className="rounded-full" onClick={() => setEditItem(null)}><X size={14} className="mr-1.5" />Cancel</Button>
                  <Button className="rounded-full gap-1.5" onClick={updateItem} disabled={saving}>
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload drop area (when empty) */}
      {!loading && items.length === 0 && (
        <div
          className="border-2 border-dashed border-border rounded-2xl p-16 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
          onClick={() => fileRef.current?.click()}>
          <Images size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <p className="font-semibold text-foreground mb-1">Upload your first photos</p>
          <p className="text-sm text-muted-foreground">Select multiple images at once · JPEG, PNG, WebP · Max 8 MB each</p>
          <Button className="rounded-full gap-2 mt-6" disabled={uploading}>
            <Upload size={15} />Choose Photos
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : items.length > 0 && (
        <>
          {/* Bulk upload strip */}
          <div
            className="flex items-center gap-4 p-4 bg-muted/20 border border-dashed border-border rounded-2xl mb-5 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            onClick={() => fileRef.current?.click()}>
            <Upload size={18} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Add more photos</p>
              <p className="text-xs text-muted-foreground">Select multiple images at once · Max 8 MB each</p>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item) => (
              <motion.div key={item.id} layout className="group relative rounded-2xl overflow-hidden border border-border bg-muted aspect-square">
                <img src={item.imageUrl} alt={item.title || item.caption} className="w-full h-full object-cover" />
                {!item.published && (
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">Draft</div>
                )}
                {(item.title || item.caption) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    {item.title && <p className="text-white text-xs font-semibold truncate">{item.title}</p>}
                    {item.caption && <p className="text-white/80 text-[10px] truncate">{item.caption}</p>}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => setEditItem(item)}
                    className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-foreground hover:bg-white shadow-sm transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => del(item.id)}
                    className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-destructive hover:bg-white shadow-sm transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
