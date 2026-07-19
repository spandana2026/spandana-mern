import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import AdminLayout      from "@/components/admin/AdminLayout";
import TabControlBar    from "@/components/admin/TabControlBar";
import AdminPlaceholder from "@/components/admin/AdminPlaceholder";
import RichTextEditor   from "@/components/admin/RichTextEditor";

// Already-separate component tabs
import HealthProgramsTab      from "@/components/admin/HealthProgramsTab";
import CommunityInitiativesTab from "@/components/admin/CommunityInitiativesTab";
import GalleryTab             from "@/components/admin/GalleryTab";
import BlogPostsTab           from "@/components/admin/BlogPostsTab";
import StoriesTab             from "@/components/admin/StoriesTab";
import TestimonialsCrudTab    from "@/components/admin/TestimonialsCrudTab";
import ValuesCrudTab          from "@/components/admin/ValuesCrudTab";
import GameListingsTab        from "@/components/admin/GameListingsTab";
import SeoTab                 from "@/components/admin/SeoTab";
import LiveStreamTab          from "@/components/admin/LiveStreamTab";
import ShopAdminTab           from "@/components/admin/ShopAdminTab";
import PageBuilderTab         from "@/components/admin/PageBuilderTab";
import FloatingMenuTab        from "@/components/admin/FloatingMenuTab";

// Split tab files — one per tab
import VolunteerAppsTab     from "./tabs/VolunteerAppsTab";
import EventsTab            from "./tabs/EventsTab";
import SubscribersTab       from "./tabs/SubscribersTab";
import FooterTab            from "./tabs/FooterTab";
import GamesTab             from "./tabs/GamesTab";
import DashboardTab         from "./tabs/DashboardTab";
import HeroTab              from "./tabs/HeroTab";
import VisionTab            from "./tabs/VisionTab";
import ProgramsTab          from "./tabs/ProgramsTab";
import SuccessStoriesTab    from "./tabs/SuccessStoriesTab";
import TestimonialsTab      from "./tabs/TestimonialsTab";
import TimelineTab          from "./tabs/TimelineTab";
import VolunteersTab        from "./tabs/VolunteersTab";
import SiteInfoTab          from "./tabs/SiteInfoTab";
import ImpactTab            from "./tabs/ImpactTab";
import SaharaTab            from "./tabs/SaharaTab";
import ThemeTab             from "./tabs/ThemeTab";
import NavigationTab        from "./tabs/NavigationTab";
import CoreValuesTab        from "./tabs/CoreValuesTab";
import VisionPageTab        from "./tabs/VisionPageTab";
import StoriesPageTab       from "./tabs/StoriesPageTab";
import TestimonialsPageTab  from "./tabs/TestimonialsPageTab";
import BlogTab              from "./tabs/BlogTab";
import AdsTab               from "./tabs/AdsTab";
import TeamTab              from "./tabs/TeamTab";
import PhysicalHealthTab    from "./tabs/PhysicalHealthTab";
import MentalHealthTab      from "./tabs/MentalHealthTab";
import GetInvolvedTab       from "./tabs/GetInvolvedTab";
import DonateTab            from "./tabs/DonateTab";
import FunZoneTab           from "./tabs/FunZoneTab";

import type { SiteSettings, Tab } from "./types";

const TOKEN_KEY = "spandana_admin_token";

function normalizeSettings(data: Partial<SiteSettings>): SiteSettings {
  const emptyPillar = { label: "", title: "", subtitle: "", items: [] };
  return {
    ...data,
    hero: { badge: "", title: "", titleItalic: "", description: "", button1: "", button2: "", ...data.hero },
    stats: data.stats ?? [],
    vision: { heading: "", content: "", ...data.vision },
    mission: { heading: "", content: "", ...data.mission },
    centerCaption: data.centerCaption ?? "",
    timeline: data.timeline ?? [],
    values: data.values ?? [],
    coreValuesSection: {
      badge: "Our Core Values",
      taglines: ["Build People Up", "Help People Grow", "Because People Matter"],
      descriptions: [],
      ...data.coreValuesSection,
    },
    getInvolved: { title: "", subtitle: "", ...data.getInvolved },
    contact: { email: "", phone: "", ...data.contact },
    footer: { copyright: "", ...data.footer },
    programsSection: {
      title: "",
      subtitle: "",
      ...data.programsSection,
      physical: { ...emptyPillar, ...data.programsSection?.physical },
      mental: { ...emptyPillar, ...data.programsSection?.mental },
    },
    impactSection: data.impactSection ?? { heading: "", headingItalic: "", subtitle: "", note: "", tiers: [] },
  } as SiteSettings;
}

const TAB_TO_PREVIEW_PATH: Partial<Record<Tab, string>> = {
  hero: "/", vision: "/", siteinfo: "/", theme: "/", navigation: "/",
  corevalues: "/", timeline: "/", impact: "/", testimonials: "/",
  dashboard: "/", volunteers: "/", successstories: "/", footer: "/",
  subscribers: "/", programs: "/", sahara: "/programs", "page-builder": "/",
  "floating-menu": "/", "values-crud": "/core-values",
  donate: "/donate",
  "fun-zone": "/fun-zone", games: "/fun-zone", "game-listings": "/fun-zone", ads: "/fun-zone",
  blog: "/blog", "blog-posts-crud": "/blog",
  shop: "/shop", gallery: "/gallery", events: "/events",
  "get-involved": "/get-involved",
  "health-programs": "/programs/physical-health",
  "physical-health": "/programs/physical-health",
  "mental-health": "/programs/mental-health",
  visionpage: "/vision", storiespage: "/success-stories",
  "stories-crud": "/success-stories",
  testimonialspage: "/testimonials", "testimonials-crud": "/testimonials",
  "live-stream": "/live", "community-initiatives": "/programs",
  team: "/team", seo: "/",
};

export default function Admin() {
  const [token,     setToken]     = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loginError,setLoginError]= useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [location, navigate] = useLocation();
  const tab = (location.replace(/^\/admin\/?/, "") || "dashboard") as Tab;
  const setTab = (id: Tab) => navigate(`/admin/${id}`);
  useEffect(() => { (window as any).__spandanaSetTab = setTab; return () => { delete (window as any).__spandanaSetTab; }; }, []);

  const [settings,      setSettings]      = useState<SiteSettings | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [publishing,    setPublishing]    = useState(false);
  const [hasDraft,      setHasDraft]      = useState(false);
  const [scheduleAt,    setScheduleAt]    = useState("");
  const [scheduledAt,   setScheduledAt]   = useState<string | null>(null);
  const [historyEntries,setHistoryEntries]= useState<Array<{ index: number; publishedAt: string }>>([]);
  const [feedback,      setFeedback]      = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const isLoggedIn = !!token;

  function showFeedback(type: "success" | "error", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoggingIn(true); setLoginError("");
    try {
      const res  = await fetch("/api/v1/auth/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const json = await res.json() as { token?: string; error?: string };
      if (res.ok && json.token) { localStorage.setItem(TOKEN_KEY, json.token); setToken(json.token); setPassword(""); }
      else setLoginError(json.error ?? "Invalid password");
    } catch { setLoginError("Could not connect to server"); }
    finally { setLoggingIn(false); }
  }

  function handleLogout() { localStorage.removeItem(TOKEN_KEY); setToken(""); }

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/v1/admin/settings/draft", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setSettings(normalizeSettings(await res.json() as SiteSettings));
    const statusRes = await fetch("/api/v1/admin/settings/status", { headers: { Authorization: `Bearer ${token}` } });
    if (statusRes.ok) {
      const s = await statusRes.json() as { hasDraft: boolean; history: Array<{ index: number; publishedAt: string }>; scheduledAt?: string };
      setHasDraft(s.hasDraft);
      setScheduledAt(s.scheduledAt ?? null);
      setHistoryEntries(s.history ?? []);
    }
  }, [token]);

  useEffect(() => { if (isLoggedIn) loadSettings(); }, [isLoggedIn, tab, loadSettings]);

  function updateSettings(path: (string | number)[], val: unknown) {
    setSettings((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev) as Record<string, unknown>;
      let cur: Record<string, unknown> = next;
      for (let i = 0; i < path.length - 1; i++) {
        const k = path[i] as string;
        if (cur[k] == null || typeof cur[k] !== "object") cur[k] = {};
        cur = cur[k] as Record<string, unknown>;
      }
      cur[path[path.length - 1] as string] = val;
      return next as unknown as SiteSettings;
    });
  }

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(settings) });
      if (res.ok) { showFeedback("success", "Draft saved"); setHasDraft(true); }
      else showFeedback("error", "Save failed");
    } finally { setSaving(false); }
  }

  async function publishNow() {
    setPublishing(true);
    try {
      const res = await fetch("/api/v1/admin/settings/publish", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { showFeedback("success", "Published!"); setHasDraft(false); }
      else showFeedback("error", "Publish failed");
    } finally { setPublishing(false); }
  }

  async function schedulePublish() { showFeedback("success", `Scheduled for ${scheduleAt}`); }
  async function cancelSchedule()  { setScheduledAt(null); }

  async function revertTo(index: number) {
    const res = await fetch(`/api/v1/admin/settings/history/${index}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { const data = await res.json() as SiteSettings; setSettings(data); showFeedback("success", "Reverted to previous version. Save draft to keep."); }
    else showFeedback("error", "Revert failed");
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-lg space-y-5">
          <div className="text-center mb-2">
            <h1 className="text-2xl font-serif font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">Spandana Care Aid Foundation</p>
          </div>
          {loginError && <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl">{loginError}</p>}
          <div className="relative">
            <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-12 text-sm" autoFocus />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
          <button type="submit" disabled={loggingIn || !password} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
            {loggingIn && <Loader2 size={16} className="animate-spin" />}
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  // ── Shared props for settings-based tabs ─────────────────────────────────
  const settingsProps = { settings: settings!, updateSettings, setSettings, token, saving, onSave: saveSettings, showFeedback };

  return (
    <AdminLayout onLogout={handleLogout}>
      {/* Global feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg text-sm font-medium ${feedback.type === "success" ? "bg-emerald-600 text-white" : "bg-destructive text-white"}`}>
            {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Per-tab control bar */}
      <TabControlBar
        tab={tab}
        settings={settings as Record<string, unknown> | null}
        updateSettings={updateSettings}
        saveSettings={saveSettings}
        publishNow={publishNow}
        schedulePublish={schedulePublish}
        cancelSchedule={cancelSchedule}
        saving={saving}
        publishing={publishing}
        hasDraft={hasDraft}
        scheduledAt={scheduledAt}
        historyEntries={historyEntries}
        revertTo={revertTo}
        scheduleAt={scheduleAt}
        setScheduleAt={setScheduleAt}
      />

      {/* ── Tab Router ── */}
      {tab === "dashboard"           && <DashboardTab            token={token} />}
      {tab === "hero"          && settings && <HeroTab             {...settingsProps} />}
      {tab === "vision"        && settings && <VisionTab           {...settingsProps} />}
      {tab === "programs"      && settings && <ProgramsTab         {...settingsProps} />}
      {tab === "successstories"&& settings && <SuccessStoriesTab   {...settingsProps} />}
      {tab === "testimonials"  && settings && <TestimonialsTab     {...settingsProps} />}
      {tab === "timeline"      && settings && <TimelineTab         {...settingsProps} />}
      {tab === "volunteers"    && settings && <VolunteersTab       {...settingsProps} />}
      {tab === "siteinfo"      && settings && <SiteInfoTab         {...settingsProps} />}
      {tab === "impact"        && settings && <ImpactTab           {...settingsProps} />}
      {tab === "sahara"        && settings && <SaharaTab           {...settingsProps} />}
      {tab === "theme"         && settings && <ThemeTab            {...settingsProps} />}
      {tab === "navigation"    && settings && <NavigationTab       {...settingsProps} />}
      {tab === "corevalues"    && settings && <CoreValuesTab       {...settingsProps} />}
      {tab === "visionpage"    && settings && <VisionPageTab       {...settingsProps} />}
      {tab === "storiespage"   && settings && <StoriesPageTab      {...settingsProps} />}
      {tab === "testimonialspage" && settings && <TestimonialsPageTab {...settingsProps} />}
      {tab === "physical-health" && settings && <PhysicalHealthTab  {...settingsProps} />}
      {tab === "mental-health"   && settings && <MentalHealthTab    {...settingsProps} />}
      {tab === "get-involved"    && settings && <GetInvolvedTab     {...settingsProps} />}
      {tab === "donate"          && settings && <DonateTab          {...settingsProps} />}
      {tab === "fun-zone"        && settings && <FunZoneTab         {...settingsProps} />}
      {tab === "ads"             && settings && <AdsTab             {...settingsProps} />}
      {tab === "blog"            && settings && <BlogTab            {...settingsProps} />}
      {tab === "team"            && settings && <TeamTab            {...settingsProps} />}
      {tab === "subscribers"     && <SubscribersTab  token={token} />}
      {tab === "footer"          && settings && <FooterTab settings={settings} updateSettings={updateSettings} />}
      {tab === "events"          && <EventsTab       token={token} />}
      {tab === "games"           && settings && <GamesTab settings={settings} updateSettings={updateSettings} />}
      {tab === "volunteer-apps"  && <VolunteerAppsTab token={token} />}
      {tab === "shop"            && <ShopAdminTab     token={token} />}
      {tab === "gallery"         && <GalleryTab       token={token} />}
      {tab === "health-programs" && <HealthProgramsTab token={token} />}
      {tab === "community-initiatives" && <CommunityInitiativesTab token={token} />}
      {tab === "blog-posts-crud" && <BlogPostsTab     token={token} />}
      {tab === "stories-crud"    && <StoriesTab       token={token} />}
      {tab === "testimonials-crud" && <TestimonialsCrudTab token={token} />}
      {tab === "values-crud"     && <ValuesCrudTab    token={token} />}
      {tab === "game-listings"   && <GameListingsTab  token={token} />}
      {tab === "seo"             && settings && <SeoTab settings={settings} updateSettings={updateSettings} token={token} />}
      {tab === "live-stream"     && settings && <LiveStreamTab settings={settings} updateSettings={updateSettings} token={token} onSave={saveSettings} />}
      {tab === "page-builder"    && <PageBuilderTab   token={token} />}
      {tab === "floating-menu"   && settings && <FloatingMenuTab settings={settings} updateSettings={updateSettings} token={token} onSave={saveSettings} />}
    </AdminLayout>
  );
}
