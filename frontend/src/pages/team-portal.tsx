import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, LogOut, FileText, Image, FolderOpen, ExternalLink, Search, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TEAM_TOKEN_KEY = "spandana_team_token";
const TEAM_MEMBER_KEY = "spandana_team_member";

const ICON_MAP: Record<string, React.ElementType> = {
  file: FileText,
  image: Image,
  folder: FolderOpen,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Branding": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Photos": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "Reports": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Templates": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "General": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-primary/10 text-primary";
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  driveLink: string;
  icon: string;
  addedAt: string;
}

interface Member {
  name: string;
  username: string;
  role: string;
}

/* ── Login screen ──────────────────────────────────────────────────────────── */
function LoginScreen({ onLogin }: { onLogin: (token: string, member: Member) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/team/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json() as { token?: string; member?: unknown; error?: string };
      if (res.ok) {
        localStorage.setItem(TEAM_TOKEN_KEY, json.token ?? "");
        localStorage.setItem(TEAM_MEMBER_KEY, JSON.stringify(json.member));
        onLogin(json.token ?? "", json.member as Member);
      } else {
        setError(json.error ?? "Login failed");
      }
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0033A0] via-[#001f6b] to-[#0a0f1e] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Spandana" className="h-14 w-auto mx-auto brightness-0 invert mb-4" />
          <h1 className="text-2xl font-serif font-bold text-white">Core Team Portal</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to access team resources</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white/70 text-sm mb-1.5 block">Username</Label>
              <Input
                value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="your.username"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/50"
                autoComplete="username"
              />
            </div>
            <div>
              <Label className="text-white/70 text-sm mb-1.5 block">Password</Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/50 pr-10"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full rounded-xl bg-white text-[#0033A0] hover:bg-white/90 font-semibold h-10">
              {loading ? "Signing in…" : <><LogIn size={15} className="mr-2" /> Sign In</>}
            </Button>
          </form>
          <p className="text-center text-white/35 text-xs mt-5">
            Forgot password? Ask your admin to reset it from the Admin Panel.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Resource card ─────────────────────────────────────────────────────────── */
function ResourceCard({ res }: { res: Resource }) {
  const Icon = ICON_MAP[res.icon] ?? FileText;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{res.title}</h3>
          {res.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{res.description}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 mt-auto">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColor(res.category)}`}>
          {res.category}
        </span>
        <a href={res.driveLink} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="rounded-full h-7 text-xs gap-1.5 hover:bg-primary hover:text-white hover:border-primary transition-colors">
            Open <ExternalLink size={11} />
          </Button>
        </a>
      </div>
    </motion.div>
  );
}

/* ── Portal (logged in) ────────────────────────────────────────────────────── */
function Portal({ token, member, onLogout }: { token: string; member: Member; onLogout: () => void }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team/resources", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setResources(await res.json() as Resource[]);
      else onLogout();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token, onLogout]);

  useEffect(() => { loadResources(); }, [loadResources]);

  const categories = ["All", ...Array.from(new Set(resources.map((r) => r.category)))];

  const filtered = resources.filter((r) => {
    const matchCat = activeCategory === "All" || r.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#0033A0] text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Spandana" className="h-8 w-auto brightness-0 invert" />
            <div className="border-l border-white/20 pl-3">
              <p className="text-xs text-white/50 leading-none">Core Team Portal</p>
              <p className="text-sm font-semibold leading-tight mt-0.5">{member.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs">
              <Shield size={11} /> {member.role}
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full gap-1.5 text-xs">
              <LogOut size={13} /> Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources…" className="pl-9 rounded-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${activeCategory === cat ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resources grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">{resources.length === 0 ? "No resources yet" : "No results found"}</p>
            <p className="text-sm mt-1">{resources.length === 0 ? "Ask the admin to add resources." : "Try a different search or category."}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((r, i) => (
                <motion.div key={r.id} layout transition={{ delay: i * 0.04 }}>
                  <ResourceCard res={r} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────────────────────────── */
export default function TeamPortal() {
  const [token, setToken] = useState(() => localStorage.getItem(TEAM_TOKEN_KEY) ?? "");
  const [member, setMember] = useState<Member | null>(() => {
    try { return JSON.parse(localStorage.getItem(TEAM_MEMBER_KEY) ?? "null"); } catch { return null; }
  });

  function handleLogin(t: string, m: Member) { setToken(t); setMember(m); }
  function handleLogout() {
    localStorage.removeItem(TEAM_TOKEN_KEY);
    localStorage.removeItem(TEAM_MEMBER_KEY);
    setToken(""); setMember(null);
  }

  if (!token || !member) return <LoginScreen onLogin={handleLogin} />;
  return <Portal token={token} member={member} onLogout={handleLogout} />;
}
