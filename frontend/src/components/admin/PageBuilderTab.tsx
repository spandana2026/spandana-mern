import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical, Eye, EyeOff, Save, Loader2, CheckCircle2, AlertCircle,
  Home, Activity, Heart, ShieldCheck, MessageSquare, Users, DollarSign,
  Star, Mail, Clock, Play, Globe, LayoutGrid, ChevronUp, ChevronDown,
  Monitor, Smartphone, Copy, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

/* ─── Section catalogue ─────────────────────────────────────────────────── */
interface SectionDef {
  key: string;
  visKey: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  desktopOnly?: boolean;
  mobileOnly?: boolean;
}

const SECTIONS: SectionDef[] = [
  { key: "hero",               visKey: "hero",               label: "Hero Banner",                  icon: Home,          desc: "Main hero — badge, headline, CTA buttons, and background image." },
  { key: "impactTicker",       visKey: "impactTicker",       label: "Impact Ticker",                icon: Activity,      desc: "Scrolling stats bar shown below the hero." },
  { key: "visionMission",      visKey: "visionMission",      label: "Vision & Mission + Video",     icon: Eye,           desc: "Vision/Mission text, success stories carousel, and the promo video embed." },
  { key: "coreValues",         visKey: "coreValues",         label: "Core Values",                  icon: ShieldCheck,   desktopOnly: true, desc: "Core values cards — desktop only (mobile version is embedded inside Vision section)." },
  { key: "testimonials",       visKey: "testimonials",       label: "Testimonials",                 icon: MessageSquare, desc: "Testimonial carousel — community voices." },
  { key: "programs",           visKey: "programs",           label: "Programs & Community Centers", icon: Users,         desc: "Physical & Mental Health programs from the Sahara Community Centers." },
  { key: "impactCalculator",   visKey: "impactCalculator",   label: "Your Impact",                  icon: DollarSign,    desc: "Donation impact calculator with tier cards." },
  { key: "volunteerSpotlight", visKey: "volunteerSpotlight", label: "Volunteer Spotlight",          icon: Star,          desc: "Featured volunteer stories and hours contributed." },
  { key: "campaignWidget",     visKey: "campaignWidget",     label: "Campaign Widget",              icon: Heart,         desc: "Fundraising campaign progress tracker." },
  { key: "newsletter",         visKey: "newsletter",         label: "Newsletter Sign-up",           icon: Mail,          desc: "Email subscription section at the bottom of the homepage." },
  { key: "timeline",           visKey: "timeline",           label: "Timeline",                     icon: Clock,         desc: "Organisation history milestones." },
  { key: "videoMobile",        visKey: "videoSectionMobile", label: "Video Section (Mobile)",       icon: Play,          mobileOnly: true, desc: "Promo video block shown on mobile below Vision section." },
  { key: "ads",                visKey: "moduleAds",          label: "Ads / Announcements",          icon: LayoutGrid,    desc: "Sponsor announcement carousel — drag to choose where it appears." },
];

/* ─── Default section order ─────────────────────────────────────────────── */
export const DEFAULT_SECTION_ORDER = SECTIONS.map((s) => s.key);

/* ─── Page visibility catalogue ─────────────────────────────────────────── */
const PAGE_VISIBILITY = [
  { key: "pageBlog",             label: "Blog",                     desc: "Articles, news and updates" },
  { key: "pageShop",             label: "Shop / Neenas Gifts",      desc: "Online store at neenasgifts.store" },
  { key: "pageGetInvolved",      label: "Get Involved / Volunteer",  desc: "Volunteer signup and partner portal" },
  { key: "pageSahara",           label: "Sahara Community Centers",  desc: "Program information and Sahara centers" },
  { key: "pagePhysicalHealth",   label: "Physical Health",           desc: "Body, skills & economic empowerment" },
  { key: "pageMentalHealth",     label: "Mental Health",             desc: "Mind, community & safe spaces programs" },
  { key: "pageVision",           label: "Vision & Mission",          desc: "About us page" },
  { key: "pageStories",          label: "Success Stories",           desc: "Community success stories page" },
  { key: "pageTestimonialsPage", label: "Testimonials Page",         desc: "Community voices and reviews" },
  { key: "pageTeam",             label: "Team Portal",               desc: "Staff and volunteer team portal" },
  { key: "pageDonate",           label: "Donate",                    desc: "Donation page and payment forms" },
  { key: "pageEvents",           label: "Events",                    desc: "Upcoming events and registrations" },
  { key: "pageGallery",          label: "Gallery",                   desc: "Photo and video gallery" },
  { key: "pageFunZone",          label: "Joy Zone / Fun Zone",       desc: "Games and interactive activities" },
  { key: "pageLive",             label: "Live Stream",               desc: "Live broadcast page" },
];

/* ─── Module visibility catalogue ───────────────────────────────────────── */
const MODULE_VISIBILITY = [
  { key: "moduleBlogPosts",          label: "Blog Posts Section",         desc: "Article listings shown on the blog page" },
  { key: "moduleStories",            label: "Success Story Cards",         desc: "Community success stories on homepage" },
  { key: "moduleTestimonialsBlock",  label: "Testimonials Carousel",       desc: "Community voices carousel on homepage" },
  { key: "moduleGallery",            label: "Gallery Grid",                desc: "Photo grid on the gallery page" },
  { key: "moduleGames",              label: "Game Listings",               desc: "Game cards in the Joy Zone" },
  { key: "moduleAds",                label: "Ads / Announcements Banner",  desc: "Sponsor announcements shown across pages — position controlled in the section list above." },
  { key: "moduleEvents",             label: "Events Listings",             desc: "Upcoming events cards" },
  { key: "moduleTeam",               label: "Team Members Display",        desc: "Staff and volunteer cards on the team page" },
  { key: "moduleVolunteerSpotlight", label: "Volunteer Spotlight",         desc: "Featured volunteer stories on homepage" },
];

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Props { token: string; }

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">{children}</label>;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function mergeOrder(stored: string[], all: string[]): string[] {
  const valid = stored.filter((k) => all.includes(k));
  const missing = all.filter((k) => !valid.includes(k));
  return [...valid, ...missing];
}

export default function PageBuilderTab({ token }: Props) {
  /* shared visibility (page + module toggles) */
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  /* per-device section orders */
  const [orderDesktop, setOrderDesktop] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [orderMobile, setOrderMobile]   = useState<string[]>(DEFAULT_SECTION_ORDER);
  /* per-device section visibility */
  const [visDesktop, setVisDesktop] = useState<Record<string, boolean>>({});
  const [visMobile, setVisMobile]   = useState<Record<string, boolean>>({});

  const [activeTab, setActiveTab] = useState<"desktop" | "mobile">("desktop");
  const [loaded, setLoaded]       = useState(false);
  const [saving, setSaving]       = useState(false);
  const [feedback, setFeedback]   = useState<{ ok: boolean; text: string } | null>(null);
  const [pageVisOpen, setPageVisOpen]     = useState(false);
  const [moduleVisOpen, setModuleVisOpen] = useState(false);

  const dragKey     = useRef<string | null>(null);
  const dragOverKey = useRef<string | null>(null);

  const allKeys = DEFAULT_SECTION_ORDER;

  /* ── Load settings ── */
  useState(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setVisibility(d?.visibility ?? {});

        const fallbackOrder = d?.sectionOrder?.length
          ? mergeOrder(d.sectionOrder as string[], allKeys)
          : DEFAULT_SECTION_ORDER;

        const storedDesktopOrder: string[] = d?.sectionOrderDesktop?.length
          ? mergeOrder(d.sectionOrderDesktop as string[], allKeys)
          : fallbackOrder;
        const storedMobileOrder: string[] = d?.sectionOrderMobile?.length
          ? mergeOrder(d.sectionOrderMobile as string[], allKeys)
          : storedDesktopOrder;

        setOrderDesktop(storedDesktopOrder);
        setOrderMobile(storedMobileOrder);

        const fallbackVis = (d?.visibility ?? {}) as Record<string, boolean>;
        setVisDesktop((d?.visibilityDesktop ?? fallbackVis) as Record<string, boolean>);
        setVisMobile((d?.visibilityMobile ?? fallbackVis) as Record<string, boolean>);

        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  });

  /* ── Active tab helpers ── */
  const activeOrder    = activeTab === "desktop" ? orderDesktop : orderMobile;
  const setActiveOrder = activeTab === "desktop" ? setOrderDesktop : setOrderMobile;
  const activeVis      = activeTab === "desktop" ? visDesktop : visMobile;
  const setActiveVis   = activeTab === "desktop" ? setVisDesktop : setVisMobile;

  function isVisible(visKey: string): boolean { return activeVis[visKey] !== false; }
  function toggleVisibility(visKey: string) {
    setActiveVis((prev) => ({ ...prev, [visKey]: !isVisible(visKey) }));
  }

  /* ── DnD handlers ── */
  function onDragStart(key: string) { dragKey.current = key; }
  function onDragOver(e: React.DragEvent, key: string) { e.preventDefault(); dragOverKey.current = key; }
  function onDrop() {
    if (!dragKey.current || !dragOverKey.current || dragKey.current === dragOverKey.current) return;
    const from = activeOrder.indexOf(dragKey.current);
    const to   = activeOrder.indexOf(dragOverKey.current);
    if (from < 0 || to < 0) return;
    const next = [...activeOrder];
    next.splice(from, 1);
    next.splice(to, 0, dragKey.current!);
    setActiveOrder(next);
    dragKey.current = null;
    dragOverKey.current = null;
  }

  /* ── Copy between tabs ── */
  function copyDesktopToMobile() {
    setOrderMobile([...orderDesktop]);
    setVisMobile({ ...visDesktop });
  }
  function copyMobileToDesktop() {
    setOrderDesktop([...orderMobile]);
    setVisDesktop({ ...visMobile });
  }

  /* ── Save ── */
  async function save() {
    setSaving(true);
    try {
      const current = await fetch("/api/settings").then((r) => r.json());
      const updated = {
        ...current,
        visibility: { ...(current.visibility ?? {}), ...visibility },
        sectionOrder:        orderDesktop,
        sectionOrderDesktop: orderDesktop,
        sectionOrderMobile:  orderMobile,
        visibilityDesktop:   visDesktop,
        visibilityMobile:    visMobile,
      };
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setFeedback({ ok: true, text: "Draft saved! Click Publish in the top bar to make it live." });
      } else {
        const json = await res.json().catch(() => ({})) as { error?: string };
        setFeedback({ ok: false, text: json.error ?? "Failed to save. Please try again." });
      }
    } catch {
      setFeedback({ ok: false, text: "Connection error. Please try again." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  }

  /* ── Filtered section list for active tab ── */
  const tabSections = activeOrder
    .map((key) => SECTIONS.find((s) => s.key === key))
    .filter((s): s is SectionDef => {
      if (!s) return false;
      if (activeTab === "desktop" && s.mobileOnly) return false;
      if (activeTab === "mobile"  && s.desktopOnly) return false;
      return true;
    });

  const visibleCount = tabSections.filter((s) => isVisible(s.visKey)).length;
  const hiddenCount  = tabSections.length - visibleCount;
  const heroHidden   = activeVis.hero === false;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  /* ── Shared toggle row renderer ── */
  function VisToggleRow({ visKey, label, desc }: { visKey: string; label: string; desc: string }) {
    const vis = visibility[visKey] !== false;
    return (
      <div className={`flex items-center justify-between px-3.5 py-3 rounded-xl border transition-colors ${vis ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40" : "bg-muted/30 border-border"}`}>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className={`hidden sm:block text-xs font-semibold ${vis ? "text-emerald-600" : "text-muted-foreground"}`}>{vis ? "Visible" : "Hidden"}</span>
          <Switch checked={vis} onCheckedChange={() => setVisibility(prev => ({ ...prev, [visKey]: !vis }))} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold">Page Builder</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {visibleCount} sections visible · {hiddenCount} hidden ·{" "}
            <span className="text-muted-foreground/60">drag handles to reorder</span>
          </p>
        </div>
        <Button className="rounded-full gap-2" onClick={save} disabled={saving}>
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Layout</>}
        </Button>
      </div>

      {/* ── Feedback ── */}
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${feedback.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {feedback.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero hidden warning ── */}
      <AnimatePresence>
        {heroHidden && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle size={15} className="shrink-0" />
            The Hero Banner is hidden on <strong>{activeTab === "desktop" ? "desktop" : "mobile"}</strong>. Visitors on this device will see a blank top area. Make sure another section starts the page.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile / Desktop tab switcher ── */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center bg-muted/50 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab("desktop")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "desktop" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Monitor size={14} />Desktop
          </button>
          <button
            onClick={() => setActiveTab("mobile")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "mobile" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Smartphone size={14} />Mobile
          </button>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {activeTab === "desktop" ? (
            <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5 h-8" onClick={copyDesktopToMobile}>
              <Copy size={11} />Copy to Mobile
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5 h-8" onClick={copyMobileToDesktop}>
              <Copy size={11} />Copy to Desktop
            </Button>
          )}
        </div>
      </div>

      {/* ── Info banner ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 text-xs text-blue-800 flex items-start gap-2">
        <GripVertical size={14} className="shrink-0 mt-0.5" />
        <span>
          You are editing the <strong>{activeTab === "desktop" ? "Desktop" : "Mobile"}</strong> layout.
          Drag the grip handle to reorder. Toggle visibility per section. Changes are independent between Desktop and Mobile.
        </span>
      </div>

      {/* ── Section list ── */}
      <div className="space-y-2">
        {tabSections.map((section, idx) => {
          const visible = isVisible(section.visKey);
          const Icon = section.icon;
          return (
            <motion.div
              key={`${activeTab}-${section.key}`}
              layout
              draggable
              onDragStart={() => onDragStart(section.key)}
              onDragOver={(e) => onDragOver(e, section.key)}
              onDrop={onDrop}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors cursor-grab active:cursor-grabbing ${
                visible
                  ? "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                  : "border-border bg-muted/30 opacity-60"
              }`}
            >
              <div className="text-muted-foreground/40 hover:text-muted-foreground shrink-0">
                <GripVertical size={18} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground/40 w-5 shrink-0 text-center">{idx + 1}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${visible ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/40"}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-semibold ${!visible ? "text-muted-foreground" : ""}`}>{section.label}</p>
                  {section.desktopOnly && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Desktop only</span>
                  )}
                  {section.mobileOnly && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">Mobile only</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug truncate">{section.desc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`hidden sm:block text-xs font-semibold ${visible ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {visible ? "Visible" : "Hidden"}
                </span>
                <Switch checked={visible} onCheckedChange={() => toggleVisibility(section.visKey)} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Page Visibility ── */}
      <div className="mt-6 bg-card border border-border rounded-2xl overflow-hidden">
        <button
          onClick={() => setPageVisOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 font-bold text-sm hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-primary shrink-0" />
            <span>Page Visibility</span>
            <span className="text-xs font-normal text-muted-foreground ml-1">
              {PAGE_VISIBILITY.filter(p => visibility[p.key] !== false).length}/{PAGE_VISIBILITY.length} visible
            </span>
          </div>
          {pageVisOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </button>
        {pageVisOpen && (
          <div className="px-5 pb-5 pt-1 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">Hidden pages are removed from the navigation and cannot be accessed by visitors. Content is always preserved.</p>
            {PAGE_VISIBILITY.map(p => (
              <VisToggleRow key={p.key} visKey={p.key} label={p.label} desc={p.desc} />
            ))}
          </div>
        )}
      </div>

      {/* ── Module Visibility ── */}
      <div className="mt-3 bg-card border border-border rounded-2xl overflow-hidden">
        <button
          onClick={() => setModuleVisOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 font-bold text-sm hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <LayoutGrid size={15} className="text-primary shrink-0" />
            <span>Module Visibility</span>
            <span className="text-xs font-normal text-muted-foreground ml-1">
              {MODULE_VISIBILITY.filter(m => visibility[m.key] !== false).length}/{MODULE_VISIBILITY.length} visible
            </span>
          </div>
          {moduleVisOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </button>
        {moduleVisOpen && (
          <div className="px-5 pb-5 pt-1 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">Hide or show content modules within pages. Hidden modules are removed from view but all content is preserved and can be restored anytime.</p>
            {MODULE_VISIBILITY.map(m => (
              <VisToggleRow key={m.key} visKey={m.key} label={m.label} desc={m.desc} />
            ))}
          </div>
        )}
      </div>

      {/* ── Quick toggles ── */}
      <div className="mt-4 bg-card border border-border rounded-2xl p-4">
        <Label>Quick {activeTab === "desktop" ? "Desktop" : "Mobile"} Section Toggles</Label>
        <p className="text-xs text-muted-foreground mb-3">Toggle all sections visible in this layout at once.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5" onClick={() => {
            const upd: Record<string, boolean> = {};
            tabSections.forEach((s) => { upd[s.visKey] = true; });
            setActiveVis((prev) => ({ ...prev, ...upd }));
          }}><Eye size={12} />Show All</Button>
          <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5" onClick={() => {
            const upd: Record<string, boolean> = {};
            tabSections.forEach((s) => { upd[s.visKey] = false; });
            setActiveVis((prev) => ({ ...prev, ...upd }));
          }}><EyeOff size={12} />Hide All</Button>
          <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5" onClick={() => setActiveOrder(DEFAULT_SECTION_ORDER)}>
            Reset Order
          </Button>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button className="rounded-full gap-2" onClick={save} disabled={saving}>
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Layout</>}
        </Button>
      </div>
    </div>
  );
}
