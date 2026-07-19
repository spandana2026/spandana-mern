import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, X, Loader2, CheckCircle2, AlertCircle, Pencil, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  imageUrl: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
  createdAt: string;
}

const CATEGORIES = ["General", "Health", "Community", "Events", "Awareness", "Volunteer", "Announcements"];

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">{children}</label>;
}

const EMPTY: Omit<BlogPost, "id" | "createdAt" | "publishedAt"> = {
  title: "", slug: "", excerpt: "", content: "", author: "Spandana Team",
  category: "General", imageUrl: "", tags: [], published: false,
};

export default function BlogPostsTab({ token }: { token: string }) {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [tagsInput, setTagsInput] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/admin/blog-posts", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: BlogPost[]) => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function toast(ok: boolean, text: string) {
    setFeedback({ ok, text });
    setTimeout(() => setFeedback(null), 3200);
  }

  function openNew() {
    setEditing({ ...EMPTY, id: "", createdAt: "", publishedAt: "" });
    setTagsInput("");
    setIsNew(true);
  }

  function openEdit(item: BlogPost) {
    setEditing({ ...item });
    setTagsInput(item.tags.join(", "));
    setIsNew(false);
  }

  async function save() {
    if (!editing || !editing.title.trim()) { toast(false, "Title is required."); return; }
    setSaving(true);
    const payload = { ...editing, tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean) };
    const url = isNew ? "/api/admin/blog-posts" : `/api/admin/blog-posts/${editing.id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) { toast(true, isNew ? "Post created." : "Post updated."); setEditing(null); load(); }
    else toast(false, "Save failed — check all fields.");
  }

  async function del(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/blog-posts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    toast(true, "Deleted."); load();
  }

  function set<K extends keyof BlogPost>(key: K, val: BlogPost[K]) {
    setEditing((e) => e ? { ...e, [key]: val } : e);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Blog Posts</h2>
          <p className="text-sm text-muted-foreground mt-1">{items.length} post{items.length !== 1 ? "s" : ""} · Articles, news &amp; updates</p>
        </div>
        <Button className="rounded-full gap-2" onClick={openNew}><Plus size={15} />New Post</Button>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${feedback.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {feedback.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}{feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{isNew ? "New Blog Post" : "Edit Post"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Title *</Label>
                <Input value={editing.title} onChange={(e) => set("title", e.target.value)} placeholder="Post title" />
              </div>
              <div>
                <Label>Slug (auto-generated if blank)</Label>
                <Input value={editing.slug} onChange={(e) => set("slug", e.target.value)} placeholder="post-url-slug" />
              </div>
              <div>
                <Label>Author</Label>
                <Input value={editing.author} onChange={(e) => set("author", e.target.value)} placeholder="Author name" />
              </div>
              <div>
                <Label>Category</Label>
                <select value={editing.category} onChange={(e) => set("category", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Cover Image URL</Label>
                <Input value={editing.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…/image.jpg" />
              </div>
              <div className="sm:col-span-2">
                <Label>Excerpt (shown in listing)</Label>
                <textarea value={editing.excerpt} onChange={(e) => set("excerpt", e.target.value)}
                  rows={2} placeholder="Brief summary of the post…"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y" />
              </div>
              <div className="sm:col-span-2">
                <Label>Content</Label>
                <RichTextEditor
                  value={editing.content}
                  onChange={(html) => set("content", html)}
                  placeholder="Write the full post content here — use the toolbar to format headings, lists, links, and more…"
                  minHeight={240}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Tags (comma-separated)</Label>
                <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="health, community, events" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input type="checkbox" id="bp-pub" checked={editing.published}
                  onChange={(e) => set("published", e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer" />
                <label htmlFor="bp-pub" className="text-sm font-medium cursor-pointer select-none">Published (visible on site)</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border">
              <Button variant="outline" className="rounded-full" onClick={() => setEditing(null)}><X size={14} className="mr-1.5" />Cancel</Button>
              <Button className="rounded-full gap-1.5" onClick={save} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isNew ? "Create Post" : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : items.length === 0 && !editing ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
          <FileText size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <p className="font-semibold mb-1">No blog posts yet</p>
          <p className="text-sm text-muted-foreground mb-6">Create your first article to share news and updates.</p>
          <Button className="rounded-full gap-2" onClick={openNew}><Plus size={15} />Create First Post</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div key={item.id} layout
              className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
              {item.imageUrl && (
                <img src={item.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-border shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.author} · {item.category}</p>
                    {item.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.excerpt}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.published ? "Live" : "Draft"}
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
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
