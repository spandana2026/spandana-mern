import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import FloatingMenuPreview from "@/components/floating-menu-preview";
import ContentProtection from "@/components/content-protection";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Blog from "@/pages/blog";
import Shop from "@/pages/shop";
import Admin from "@/pages/admin";
import GetInvolved from "@/pages/get-involved";
import Programs from "@/pages/programs";
import Sahara from "@/pages/sahara";
import CoreValues from "@/pages/core-values";
import PhysicalHealthPage from "@/pages/physical-health-page";
import MentalHealthPage from "@/pages/mental-health-page";
import VisionPage from "@/pages/vision-page";
import SuccessStoriesPage from "@/pages/success-stories-page";
import TestimonialsPage from "@/pages/testimonials-page";
import PrivacyPolicy from "@/pages/privacy";
import TermsOfUse from "@/pages/terms";
import TeamPortal from "@/pages/team-portal";
import DonatePage from "@/pages/donate";
import VolunteerPage from "@/pages/volunteer";
import EventsPage from "@/pages/events";
import GalleryPage from "@/pages/gallery";
import ColoringPage from "@/pages/coloring";
import FunZonePage from "@/pages/fun-zone";
import LiveStreamPage from "@/pages/live-stream";
import DonateWidget from "@/pages/embed/donate-widget";
import VolunteerWidget from "@/pages/embed/volunteer-widget";
import FontSizeControl from "@/components/font-size-control";
import { useFontSize, type FontSizeLevel } from "@/hooks/use-font-size";
import { BookOpen } from "lucide-react";
import MusicPlayer from "@/components/MusicPlayer";

const queryClient = new QueryClient();

function hexToHsl(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "225 100% 31%";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function getFontParam(name: string, isHeading: boolean): string {
  const weights = isHeading ? ":wght@400;500;600;700;800" : ":ital,wght@0,300;0,400;0,600;1,400";
  return encodeURIComponent(name) + weights;
}

/* ─────────────────────────────────────────────────────────────────────────
   SeoApplier — must be rendered inside WouterRouter so useLocation works.
   Fetches settings once, then re-applies meta tags on every route change.
───────────────────────────────────────────────────────────────────────── */
function SeoApplier() {
  const [location] = useLocation();
  const [seo, setSeo] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSeo(d?.seo ?? {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (Object.keys(seo).length === 0) return;

    const pages: Record<string, { title?: string; description?: string }> =
      seo.pages ?? {};
    const pageMeta = pages[location] ?? {};

    const title =
      pageMeta.title || seo.title || "Spandana Care Aid Foundation";
    const description =
      pageMeta.description || seo.description || "";
    const ogTitle       = seo.ogTitle       || title;
    const ogDescription = seo.ogDescription || description;
    const robots = `${seo.indexable !== false ? "index" : "noindex"}, ${seo.followLinks !== false ? "follow" : "nofollow"}`;

    document.title = title;

    const setMeta = (sel: string, attr: string, val: string) => {
      if (!val) return;
      const el = document.querySelector(sel) as HTMLMetaElement | null;
      if (el) el.setAttribute(attr, val);
    };

    setMeta('meta[name="description"]',         "content", description);
    setMeta('meta[name="robots"]',               "content", robots);
    setMeta('meta[name="keywords"]',             "content", seo.keywords ?? "");
    setMeta('meta[property="og:title"]',         "content", ogTitle);
    setMeta('meta[property="og:description"]',   "content", ogDescription);
    setMeta('meta[property="og:url"]',           "content", window.location.href);
    if (seo.ogImage) setMeta('meta[property="og:image"]',  "content", seo.ogImage);
    setMeta('meta[name="twitter:title"]',        "content", ogTitle);
    setMeta('meta[name="twitter:description"]',  "content", ogDescription);
    if (seo.ogImage) setMeta('meta[name="twitter:image"]', "content", seo.ogImage);
    if (seo.canonical) {
      const base = seo.canonical.replace(/\/$/, "");
      const full = location === "/" ? seo.canonical : `${base}${location}`;
      const linkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (linkEl) linkEl.href = full;
    }
    if (seo.googleVerification)
      setMeta('meta[name="google-site-verification"]', "content", seo.googleVerification);
  }, [location, seo]);

  return null;
}

function ThemeApplier() {
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        const theme = d?.theme;
        if (!theme) return;

        if (theme.primaryColor) {
          const hsl = hexToHsl(theme.primaryColor);
          const root = document.documentElement;
          root.style.setProperty("--primary", hsl);
          root.style.setProperty("--ring", hsl);
          root.style.setProperty("--sidebar-primary", hsl);
        }

        if (theme.textColor) {
          const textHsl = hexToHsl(theme.textColor);
          const root = document.documentElement;
          root.style.setProperty("--foreground", textHsl);
          root.style.setProperty("--card-foreground", textHsl);
          root.style.setProperty("--popover-foreground", textHsl);
        }

        if (theme.pageBackground) {
          const bgHsl = hexToHsl(theme.pageBackground);
          const root = document.documentElement;
          root.style.setProperty("--background", bgHsl);
          root.style.setProperty("--card", bgHsl);
        }

        const headingFont = theme.headingFont ?? "Montserrat";
        const bodyFont = theme.bodyFont ?? "Open Sans";

        const existing = document.getElementById("spandana-dynamic-fonts");
        if (existing) existing.remove();

        const link = document.createElement("link");
        link.id = "spandana-dynamic-fonts";
        link.rel = "stylesheet";
        const families = [
          getFontParam(headingFont, true),
          getFontParam(bodyFont, false),
        ].join("&family=");
        link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
        document.head.appendChild(link);

        const root = document.documentElement;
        root.style.setProperty("--app-font-serif", `'${headingFont}', sans-serif`);
        root.style.setProperty("--app-font-sans", `'${bodyFont}', sans-serif`);

        const typo = d?.typography;
        if (typo) {
          if (typo.headingWeight) root.style.setProperty("--heading-font-weight", typo.headingWeight);
          if (typo.lineSpacing) root.style.setProperty("--body-line-height", typo.lineSpacing);
          if (typo.buttonRadius) root.style.setProperty("--radius", typo.buttonRadius);
        }
      })
      .catch(() => {});
  }, []);

  return null;
}

/* ─────────────────────────────────────────────────────────────────────────
   PreviewBridge — listens for postMessage from the admin Live Preview panel.
   Applies theme / typography changes instantly (no save needed).
   Also handles navigation messages so the preview follows the admin tab.
───────────────────────────────────────────────────────────────────────── */
function PreviewBridge() {
  useEffect(() => {
    function handle(e: MessageEvent) {
      if (!e.data || typeof e.data !== "object") return;

      if (e.data.type === "SPANDANA_LIVE_PREVIEW") {
        const s = e.data.settings;
        if (!s) return;

        const theme = s.theme;
        const root  = document.documentElement;

        if (theme?.primaryColor) {
          const hsl = hexToHsl(theme.primaryColor);
          root.style.setProperty("--primary", hsl);
          root.style.setProperty("--ring",    hsl);
          root.style.setProperty("--sidebar-primary", hsl);
        }
        if (theme?.textColor) {
          const hsl = hexToHsl(theme.textColor);
          root.style.setProperty("--foreground",          hsl);
          root.style.setProperty("--card-foreground",     hsl);
          root.style.setProperty("--popover-foreground",  hsl);
        }

        if (theme?.pageBackground) {
          const hsl = hexToHsl(theme.pageBackground);
          root.style.setProperty("--background", hsl);
          root.style.setProperty("--card",       hsl);
        }

        const headingFont = theme?.headingFont ?? "Montserrat";
        const bodyFont    = theme?.bodyFont    ?? "Open Sans";
        root.style.setProperty("--app-font-serif", `'${headingFont}', sans-serif`);
        root.style.setProperty("--app-font-sans",  `'${bodyFont}', sans-serif`);

        const existing = document.getElementById("spandana-preview-fonts");
        if (existing) existing.remove();
        const link    = document.createElement("link");
        link.id       = "spandana-preview-fonts";
        link.rel      = "stylesheet";
        const families = [
          getFontParam(headingFont, true),
          getFontParam(bodyFont,    false),
        ].join("&family=");
        link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
        document.head.appendChild(link);

        const typo = s.typography;
        if (typo) {
          if (typo.headingWeight) root.style.setProperty("--heading-font-weight", typo.headingWeight);
          if (typo.lineSpacing)   root.style.setProperty("--body-line-height",    typo.lineSpacing);
          if (typo.buttonRadius)  root.style.setProperty("--radius",              typo.buttonRadius);
        }

        window.__spandanaPreviewSettings = s;
        window.dispatchEvent(new CustomEvent("spandana-preview-update", { detail: s }));
      }

      if (e.data.type === "SPANDANA_NAVIGATE") {
        const path = e.data.path;
        if (typeof path === "string") {
          window.__spandanaNavigate?.(path);
        }
      }
    }

    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);
  return null;
}

/* Exposes wouter's navigate so PreviewBridge can drive the router */
function NavigationExposer() {
  const [, navigate] = useLocation();
  useEffect(() => {
    window.__spandanaNavigate = navigate;
    return () => { delete window.__spandanaNavigate; };
  }, [navigate]);
  return null;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function RefreshToHome() {
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog" component={Blog} />
      <Route path="/shop" component={Shop} />
      <Route path="/get-involved" component={GetInvolved} />
      <Route path="/programs" component={Sahara} />
      <Route path="/sahara" component={Sahara} />
      <Route path="/core-values" component={CoreValues} />
      <Route path="/programs/physical-health" component={PhysicalHealthPage} />
      <Route path="/programs/mental-health" component={MentalHealthPage} />
      <Route path="/vision" component={VisionPage} />
      <Route path="/success-stories" component={SuccessStoriesPage} />
      <Route path="/testimonials" component={TestimonialsPage} />
      <Route path="/team" component={TeamPortal} />
      <Route path="/donate" component={DonatePage} />
      <Route path="/volunteer" component={VolunteerPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/coloring" component={ColoringPage} />
      <Route path="/fun-zone" component={FunZonePage} />
      <Route path="/live" component={LiveStreamPage} />
      <Route path="/embed/donate" component={DonateWidget} />
      <Route path="/embed/volunteer" component={VolunteerWidget} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfUse} />
      <Route path="/admin/:section?" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function isEmbedRoute(loc: string) {
  return loc.startsWith("/embed/");
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [location] = useLocation();
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (isEmbedRoute(location)) return null;
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-28 right-4 md:bottom-24 md:right-6 z-40 w-10 h-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <ChevronUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function ScrollDown() {
  const [visible, setVisible] = useState(true);
  const [location] = useLocation();
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (location === "/admin" || location === "/team" || isEmbedRoute(location)) return null;
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-down"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" })}
          aria-label="Scroll down"
          className="fixed bottom-28 right-4 md:bottom-24 md:right-6 z-40 w-10 h-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

const FONT_LEVELS: { level: FontSizeLevel; textClass: string; label?: string; title: string }[] = [
  { level: 0, textClass: "text-xs",  label: "Normal",  title: "Normal text size"  },
  { level: 1, textClass: "text-sm",                    title: "Large text size"   },
  { level: 2, textClass: "text-base",                  title: "X-Large text size" },
  { level: 3, textClass: "text-xl",  label: "Elderly", title: "Elderly text size" },
];

function MobileAccessibilityBar() {
  const [location] = useLocation();
  const { level, paperWhite, setTo, togglePaper } = useFontSize();
  if (location === "/admin" || location === "/team" || isEmbedRoute(location)) return null;

  return (
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 flex items-center gap-2 px-4 py-1.5 bg-background/90 backdrop-blur-sm border-t border-border shadow-sm">
      {/* Font size buttons */}
      <div className="flex items-center gap-0.5 bg-muted rounded-lg px-1 py-0.5 border border-border">
        {FONT_LEVELS.map((fl) => (
          <button
            key={fl.level}
            onClick={() => setTo(fl.level)}
            title={fl.title}
            aria-label={fl.title}
            className={`flex items-center gap-0.5 h-6 rounded-md px-1.5 font-bold transition-all
              ${level === fl.level
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            <span className={fl.textClass}>A</span>
            {fl.label && <span className="text-[8px] font-semibold leading-none">{fl.label}</span>}
          </button>
        ))}
      </div>

      {/* Paper White toggle */}
      <button
        onClick={togglePaper}
        aria-label={paperWhite ? "Disable paper white" : "Enable paper white"}
        className={`flex items-center gap-1.5 h-6 px-2 rounded-lg border text-[10px] font-semibold transition-all
          ${paperWhite
            ? "bg-amber-100 border-amber-300 text-amber-800"
            : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"}`}
      >
        <BookOpen size={10} />
        <span>Paper White</span>
        <span className={`w-5 h-3 rounded-full flex items-center px-0.5 transition-colors
          ${paperWhite ? "bg-amber-500" : "bg-muted"}`}>
          <span className={`w-2 h-2 rounded-full bg-white shadow transition-transform duration-300
            ${paperWhite ? "translate-x-2" : "translate-x-0"}`} />
        </span>
      </button>
    </div>
  );
}

function ConditionalFontSizeControl() {
  const [location] = useLocation();
  const hidden = location === "/admin" || location.startsWith("/admin/") || location === "/team" || isEmbedRoute(location);
  if (hidden) return null;
  return <FontSizeControl />;
}

function ConditionalMusicPlayer() {
  const [loc] = useLocation();
  if (loc === "/admin" || loc.startsWith("/admin/") || loc === "/team" || isEmbedRoute(loc)) return null;
  return <MusicPlayer />;
}

function ConditionalContentProtection() {
  const [loc] = useLocation();
  if (isEmbedRoute(loc)) return null;
  return <ContentProtection />;
}

function ConditionalFloatingMenu() {
  const [loc] = useLocation();
  const [timerSeconds, setTimerSeconds] = useState(4);
  const [menuEnabled, setMenuEnabled] = useState(true);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("spandana_settings");
      if (cached) {
        const s = JSON.parse(cached);
        if (s?.floating_menu?.timerSeconds != null) setTimerSeconds(s.floating_menu.timerSeconds);
        if (s?.floating_menu?.enabled != null) setMenuEnabled(s.floating_menu.enabled);
        return;
      }
    } catch {}
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s: { floating_menu?: { enabled?: boolean; timerSeconds?: number } }) => {
        if (s?.floating_menu?.timerSeconds != null) setTimerSeconds(s.floating_menu.timerSeconds);
        if (s?.floating_menu?.enabled != null) setMenuEnabled(s.floating_menu.enabled);
      })
      .catch(() => {});
  }, []);

  if (loc !== "/") return null;
  if (!menuEnabled) return null;
  return <FloatingMenuPreview timerSeconds={timerSeconds} />;
}

function AppInner() {
  return (
    <>
      <ThemeApplier />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <RefreshToHome />
        <ScrollToTop />
        <SeoApplier />
        <PreviewBridge />
        <NavigationExposer />
        <Router />
        <ConditionalFontSizeControl />
        <ConditionalFloatingMenu />
        <ConditionalMusicPlayer />
      </WouterRouter>
      <BackToTop />
      <ScrollDown />
      <ConditionalContentProtection />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppInner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
