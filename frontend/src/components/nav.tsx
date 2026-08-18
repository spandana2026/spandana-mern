import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Menu, X, Home, Heart, ShoppingBag, HeartHandshake, BookOpen,
  ChevronDown, Shield, Brain, Radio, Gamepad2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFontSize, type FontSizeLevel } from "@/hooks/use-font-size";

const FONT_LEVELS: { level: FontSizeLevel; textClass: string; label?: string; title: string }[] = [
  { level: 0, textClass: "text-xs",   label: "Normal",  title: "Normal text size"  },
  { level: 1, textClass: "text-sm",                     title: "Large text size"   },
  { level: 2, textClass: "text-base",                   title: "X-Large text size" },
  { level: 3, textClass: "text-xl",   label: "Elderly", title: "Elderly text size" },
];

const DEFAULT_LINKS: Array<{ label: string; href: string; enabled?: boolean }> = [
  { label: "Vision/Mission",           href: "/#vision" },
  { label: "Sahara Community Centers", href: "/sahara" },
  { label: "Gallery",                  href: "/gallery" },
  { label: "Joy Zone",                  href: "/fun-zone" },
  { label: "Blog",                     href: "/blog" },
];

const PROGRAMS_DROPDOWN = [
  { label: "Physical Health", href: "/programs/physical-health", icon: Shield, desc: "Medical, skills & economic" },
  { label: "Mental Health",   href: "/programs/mental-health",   icon: Brain,  desc: "Awareness, counselling & support" },
];

interface NavSettings {
  links?: Array<{ label: string; href: string; enabled?: boolean }>;
  donateLabel?: string;
  getInvolvedLabel?: string;
  shopLabel?: string;
  shopUrl?: string;
}

interface LiveSettings {
  enabled?: boolean;
  title?: string;
}

// Cache the last-known /api/settings response so the navbar can hydrate
// instantly on the very next load/reload instead of starting from a blank
// {} state. Without this, hidden admin links briefly fall back to
// DEFAULT_LINKS (all visible) until the network request resolves, which is
// the "hidden link flashes then disappears" glitch.
const NAV_CACHE_KEY = "spandana:nav-settings-cache";

function readNavCache(): any {
  try {
    const raw = localStorage.getItem(NAV_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeNavCache(d: any) {
  try {
    localStorage.setItem(NAV_CACHE_KEY, JSON.stringify(d));
  } catch {
    // ignore (private browsing / storage disabled)
  }
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [mobilePrograms, setMobilePrograms] = useState(false);
  const [location] = useLocation();
  const { level, paperWhite, setTo, togglePaper } = useFontSize();
  const isHome = location === "/";
  const cachedSettings = useRef<any>(readNavCache());
  const [navSettings, setNavSettings] = useState<NavSettings>(cachedSettings.current?.nav ?? {});
  const [liveSettings, setLiveSettings] = useState<LiveSettings>(cachedSettings.current?.liveStream ?? {});
  const [logoUrl, setLogoUrl] = useState(cachedSettings.current?.branding?.logoUrl || "/logo.png");
  const [logoScale, setLogoScale] = useState(parseFloat(cachedSettings.current?.branding?.logoScale) || 1);
  const [logoPosition, setLogoPosition] = useState<"left" | "center" | "right">(cachedSettings.current?.branding?.logoPosition ?? "left");
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(cachedSettings.current?.visibility ?? {});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.nav) setNavSettings(d.nav);
        if (d?.liveStream) setLiveSettings(d.liveStream);
        if (d?.branding?.logoUrl) setLogoUrl(d.branding.logoUrl);
        if (d?.branding?.logoScale) setLogoScale(parseFloat(d.branding.logoScale) || 1);
        if (d?.branding?.logoPosition) setLogoPosition(d.branding.logoPosition);
        if (d?.visibility) setPageVisibility(d.visibility);
        // Refresh the cache so the *next* load/reload starts from this
        // known-good state instead of defaults.
        writeNavCache(d);
      })
      .catch(() => {});
  }, []);

  const rawLinks = navSettings.links?.length ? navSettings.links : DEFAULT_LINKS;
  const donateLabel = navSettings.donateLabel ?? "Donate";
  const getInvolvedLabel = navSettings.getInvolvedLabel ?? "Get Involved";
  const shopLabel = navSettings.shopLabel ?? "Shop";
  const shopUrl = navSettings.shopUrl ?? "";

  const PAGE_VIS_MAP: Record<string, string> = {
    "/blog": "pageBlog",
    "/gallery": "pageGallery",
    "/fun-zone": "pageFunZone",
    "/sahara": "pageSahara",
    "/#vision": "pageVision",
    "/vision": "pageVision",
    "/join-us": "pageGetInvolved",
    "/donate": "pageDonate",
    "/shop": "pageShop",
  };
  const showDonate = pageVisibility.pageDonate !== false;
  const showGetInvolved = pageVisibility.pageGetInvolved !== false;
  const showShop = pageVisibility.pageShop !== false;

  const links = rawLinks
    .filter(l => l.enabled !== false)
    .filter(l => {
      const visKey = PAGE_VIS_MAP[l.href];
      return !visKey || pageVisibility[visKey] !== false;
    })
    .map((l) => {
      // Normalise old entries to Sahara Community Centers
      if (l.label === "Core Values" || l.href === "/#values" || l.label === "Programs" || l.href === "/programs") {
        return { label: "Sahara Community Centers", href: "/sahara" };
      }
      let href = l.href;
      if (href.startsWith("/#") && isHome) href = href.slice(1);
      return { ...l, href };
    })
    .filter((l, idx, arr) => arr.findIndex((x) => x.href === l.href) === idx);

  const openDropdown = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setProgramsOpen(true);
  };
  const closeDropdown = () => {
    hoverTimeout.current = setTimeout(() => setProgramsOpen(false), 120);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50"
    >
      {/* ── Row 1: Main nav (logo + links + hamburger) ── */}
      <div className={`flex items-center px-3 sm:px-6 md:px-12 h-16 sm:h-20 md:h-24 ${logoPosition === "center" ? "justify-center relative" : logoPosition === "right" ? "justify-between flex-row-reverse" : "justify-between"}`}>

        {/* Logo — fixed-size reserved box so nothing shifts while the image loads */}
        <Link
          href="/"
          onClick={(e) => {
            if (location === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className={`flex items-center shrink-0 w-[100px] xs:w-[115px] sm:w-[135px] md:w-[190px] h-11 xs:h-13 sm:h-16 md:h-20 opacity-95 hover:opacity-100 transition-opacity cursor-pointer ${logoPosition === "center" ? "absolute left-1/2 -translate-x-1/2" : ""} ${logoPosition === "right" ? "justify-end" : "justify-start"}`}
        >
          <img
            src={logoUrl}
            alt="Spandana Care Aid Foundation"
            width={190}
            height={80}
            className="h-full w-auto max-w-full object-contain"
            style={{
              transform: `scale(${logoScale})`,
              transformOrigin: logoPosition === "right" ? "right center" : "left center",
            }}
          />
        </Link>

      {/* ── Desktop links ── */}
      <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
        {links.map((l) => {
          const isSahara = l.label === "Sahara Community Centers" || l.href === "/sahara";

          if (isSahara) {
            return (
              <div
                key={l.label}
                className="relative"
                ref={dropdownRef}
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
              >
                {/* Sahara trigger */}
                <Link
                  href="/sahara"
                  className="flex items-center gap-1 hover:text-primary transition-colors group"
                >
                  Sahara Community Centers
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${programsOpen ? "rotate-180 text-primary" : ""}`}
                  />
                </Link>

                {/* Dropdown panel */}
                <AnimatePresence>
                  {programsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-background border border-border rounded-2xl shadow-xl overflow-hidden"
                      onMouseEnter={openDropdown}
                      onMouseLeave={closeDropdown}
                    >
                      {/* Arrow */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-background border-l border-t border-border" />

                      {/* Sub-items */}
                      {PROGRAMS_DROPDOWN.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => { setProgramsOpen(false); window.scrollTo({ top: 0 }); }}
                            className="flex items-center gap-3 px-4 py-3.5 hover:bg-primary/5 transition-colors group/item"
                          >
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover/item:bg-primary transition-colors">
                              <Icon size={13} className="text-primary group-hover/item:text-white" />
                            </div>
                            <p className="text-sm font-semibold text-foreground group-hover/item:text-primary transition-colors">
                              {item.label}
                            </p>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return l.href.startsWith("#") || l.href.startsWith("/#") ? (
            <a key={l.label} href={l.href} className="hover:text-primary transition-colors">
              {l.label}
            </a>
          ) : (
            <Link key={l.label} href={l.href} className="hover:text-primary transition-colors">
              {l.label}
            </Link>
          );
        })}

        {showGetInvolved && (
        <Button asChild size="default" className="rounded-full px-5 gap-1.5">
          <Link href="/join-us">
            <HeartHandshake size={18} />
            {getInvolvedLabel}
          </Link>
        </Button>
        )}

        {/* LIVE button — desktop */}
        {liveSettings.enabled && (
          <Link
            href="/live"
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-colors shadow-sm"
          >
            <Radio size={12} className="animate-pulse" />
            LIVE
          </Link>
        )}
      </div>

      {/* ── Desktop CTA ── */}
      <div className="hidden md:flex items-center gap-3">
        <Button asChild size="default" className="rounded-full px-4 gap-1.5 bg-primary text-white hover:bg-primary/90">
          <Link href="/">
            <Home size={18} />
            Home
          </Link>
        </Button>
        {showDonate && (
        <Button asChild variant="outline" size="default" className="rounded-full border-primary text-primary hover:bg-primary/5 gap-1.5">
          <Link href="/donate">
            <Heart size={18} />
            {donateLabel}
          </Link>
        </Button>
        )}
        {showShop && (
        <Button asChild size="default" className="rounded-full px-5 gap-1.5">
          {shopUrl ? (
            <a href={shopUrl} target="_blank" rel="noopener noreferrer">
              <ShoppingBag size={18} />
              {shopLabel}
            </a>
          ) : (
            <Link href="/shop">
              <ShoppingBag size={18} />
              {shopLabel}
            </Link>
          )}
        </Button>
        )}
      </div>

      {/* ── Mobile Header Layout: Explicit margins between logos & text labels ── */}
      <div className="md:hidden flex items-center justify-between gap-1 xs:gap-1.5 flex-1 ml-1 sm:ml-3">
        {/* LIVE button — mobile */}
        {liveSettings.enabled && (
          <Link
            href="/live"
            className="flex flex-col items-center justify-center gap-0.5 shrink-0 px-1"
            aria-label="Watch Live"
          >
            <span className="flex items-center gap-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
              <Radio size={10} />
              LIVE
            </span>
          </Link>
        )}
        <Link href="/" className="flex flex-col items-center justify-center gap-0.5 shrink-0 text-primary hover:text-primary/80 transition-colors px-1" aria-label="Home">
          <Home size={30} strokeWidth={2.2} />
          <span className="text-[10px] xs:text-[11px] font-bold tracking-tight leading-none whitespace-nowrap">Home</span>
        </Link>
        {showDonate && (
        <Link href="/donate" className="flex flex-col items-center justify-center gap-0.5 shrink-0 text-primary hover:text-primary/80 transition-colors px-1" aria-label={donateLabel}>
          <Heart size={30} strokeWidth={2.2} />
          <span className="text-[10px] xs:text-[11px] font-bold tracking-tight leading-none whitespace-nowrap">{donateLabel}</span>
        </Link>
        )}
        {showGetInvolved && (
        <Link href="/join-us" className="flex flex-col items-center justify-center gap-0.5 shrink-0 text-primary hover:text-primary/80 transition-colors px-1" aria-label={getInvolvedLabel}>
          <HeartHandshake size={30} strokeWidth={2.2} />
          <span className="text-[10px] xs:text-[11px] font-bold tracking-tight leading-none whitespace-nowrap">Join Us</span>
        </Link>
        )}
        {showShop && (shopUrl ? (
          <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-0.5 shrink-0 text-primary hover:text-primary/80 transition-colors px-1" aria-label={shopLabel}>
            <ShoppingBag size={30} strokeWidth={2.2} />
            <span className="text-[10px] xs:text-[11px] font-bold tracking-tight leading-none whitespace-nowrap">{shopLabel}</span>
          </a>
        ) : (
          <Link href="/shop" className="flex flex-col items-center justify-center gap-0.5 shrink-0 text-primary hover:text-primary/80 transition-colors px-1" aria-label={shopLabel}>
            <ShoppingBag size={30} strokeWidth={2.2} />
            <span className="text-[10px] xs:text-[11px] font-bold tracking-tight leading-none whitespace-nowrap">{shopLabel}</span>
          </Link>
        ))}

        {/* ── Mobile hamburger: Transparent background & Black icon ── */}
        <button
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-transparent text-black dark:text-white hover:bg-black/5 transition-colors p-1 ml-0.5"
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) window.dispatchEvent(new CustomEvent("main-menu-open"));
          }}
          aria-label="Toggle menu"
        >
          {open ? <X size={26} strokeWidth={2.2} /> : <Menu size={24} strokeWidth={2.2} />}
        </button>
      </div>

      </div>{/* end Row 1 */}

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg py-6 px-6 flex flex-col gap-1 md:hidden max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            {links.map((l) => {
              const isSahara = l.label === "Sahara Community Centers" || l.href === "/sahara";

              if (isSahara) {
                return (
                  <div key={l.label}>
                    <div className="flex items-center justify-between">
                      <Link
                        href="/sahara"
                        className="text-base font-medium text-foreground hover:text-primary py-2 flex-1"
                        onClick={() => setOpen(false)}
                      >
                        Sahara Community Centers
                      </Link>
                      <button
                        onClick={() => setMobilePrograms(!mobilePrograms)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Toggle programs menu"
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${mobilePrograms ? "rotate-180 text-primary" : ""}`}
                        />
                      </button>
                    </div>

                    <AnimatePresence>
                      {mobilePrograms && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-3 pl-3 border-l-2 border-primary/20 flex flex-col gap-1 py-1">
                            {PROGRAMS_DROPDOWN.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => { setOpen(false); setMobilePrograms(false); }}
                                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-primary/5 transition-colors group"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Icon size={13} className="text-primary" />
                                  </div>
                                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return l.href.startsWith("#") || l.href.startsWith("/#") ? (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-base font-medium text-foreground hover:text-primary py-2"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-base font-medium text-foreground hover:text-primary py-2"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              );
            })}

            <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-border">
              {showDonate && (
              <Button asChild variant="outline" className="w-full rounded-full border-primary text-primary gap-1.5">
                <Link href="/donate" onClick={() => setOpen(false)}>
                  <Heart size={14} /> {donateLabel}
                </Link>
              </Button>
              )}
              <Button asChild className="w-full rounded-full gap-1.5">
                <Link href="/join-us" onClick={() => setOpen(false)}>
                  <HeartHandshake size={14} />
                  {getInvolvedLabel}
                </Link>
              </Button>
              <Button asChild className="w-full rounded-full gap-1.5">
                {shopUrl ? (
                  <a href={shopUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                    <ShoppingBag size={14} />
                    {shopLabel}
                  </a>
                ) : (
                  <Link href="/shop" onClick={() => setOpen(false)}>
                    <ShoppingBag size={14} />
                    {shopLabel}
                  </Link>
                )}
              </Button>
            </div>

            {/* ── Accessibility ── */}
            <div className="pt-3 border-t border-border flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Text Size</p>
              <div className="flex items-center gap-2">
                {FONT_LEVELS.map((fl) => (
                  <motion.button
                    key={fl.level}
                    onClick={() => setTo(fl.level)}
                    whileTap={{ scale: 0.88 }}
                    title={fl.title}
                    aria-label={fl.title}
                    className={`flex-1 h-10 rounded-xl font-bold transition-all flex items-center justify-center gap-1 border
                      ${level === fl.level
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "text-muted-foreground border-border hover:border-primary/50"}`}
                  >
                    <span className={fl.textClass}>A</span>
                    {fl.label && (
                      <span className="text-[9px] font-semibold tracking-wide leading-none">
                        {fl.label}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
              <button
                onClick={togglePaper}
                aria-label={paperWhite ? "Disable paper white mode" : "Enable paper white mode"}
                className={`flex items-center gap-3 px-4 h-10 rounded-xl border text-sm font-semibold transition-all duration-300
                  ${paperWhite
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "border-border text-muted-foreground hover:border-primary/30"}`}
              >
                <BookOpen size={15} />
                <span>Paper White</span>
                <span
                  className={`ml-auto w-8 h-5 rounded-full transition-colors flex items-center px-0.5
                    ${paperWhite ? "bg-amber-500" : "bg-muted"}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-300
                      ${paperWhite ? "translate-x-3" : "translate-x-0"}`}
                  />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}