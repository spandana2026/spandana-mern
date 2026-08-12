import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Header from "./Header";
import MobileMenu from "./MobileMenu";

const DEFAULT_LINKS: Array<{ label: string; href: string; enabled?: boolean }> = [
  { label: "Vision/Mission",           href: "/#vision" },
  { label: "Sahara Community Centers", href: "/sahara" },
  { label: "Gallery",                  href: "/gallery" },
  { label: "Joy Zone",                 href: "/fun-zone" },
  { label: "Blog",                     href: "/blog" },
];

const PAGE_VIS_MAP: Record<string, string> = {
  "/blog":     "pageBlog",
  "/gallery":  "pageGallery",
  "/fun-zone": "pageFunZone",
  "/sahara":   "pageSahara",
  "/#vision":  "pageVision",
  "/vision":   "pageVision",
  "/join-us":"pageGetInvolved",
  "/donate":   "pageDonate",
  "/shop":     "pageShop",
};

interface NavSettings {
  links?: Array<{ label: string; href: string; enabled?: boolean }>;
  donateLabel?: string;
  getInvolvedLabel?: string;
  shopLabel?: string;
  shopUrl?: string;
}

interface LiveSettings {
  enabled?: boolean;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/";

  const [navSettings, setNavSettings]       = useState<NavSettings>({});
  const [liveSettings, setLiveSettings]     = useState<LiveSettings>({});
  const [logoUrl, setLogoUrl]               = useState("/logo.png");
  const [logoScale, setLogoScale]           = useState(1);
  const [logoPosition, setLogoPosition]     = useState<"left" | "center" | "right">("left");
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});

  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.nav)                    setNavSettings(d.nav);
        if (d?.liveStream)             setLiveSettings(d.liveStream);
        if (d?.branding?.logoUrl)      setLogoUrl(d.branding.logoUrl);
        if (d?.branding?.logoScale)    setLogoScale(parseFloat(d.branding.logoScale) || 1);
        if (d?.branding?.logoPosition) setLogoPosition(d.branding.logoPosition);
        if (d?.visibility)             setPageVisibility(d.visibility);
      })
      .catch(() => {});
  }, []);

  const rawLinks = navSettings.links?.length ? navSettings.links : DEFAULT_LINKS;
  const donateLabel      = navSettings.donateLabel      ?? "Donate";
  const getInvolvedLabel = navSettings.getInvolvedLabel ?? "Get Involved";
  const shopLabel        = navSettings.shopLabel        ?? "Shop";
  const shopUrl          = navSettings.shopUrl          ?? "";

  const links = rawLinks
    .filter((l) => l.enabled !== false)
    .filter((l) => {
      const visKey = PAGE_VIS_MAP[l.href];
      return !visKey || pageVisibility[visKey] !== false;
    })
    .map((l) => {
      if (
        l.label === "Core Values" || l.href === "/#values" ||
        l.label === "Programs"   || l.href === "/programs"
      ) {
        return { label: "Sahara Community Centers", href: "/sahara" };
      }
      let href = l.href;
      if (href.startsWith("/#") && isHome) href = href.slice(1);
      return { ...l, href };
    })
    .filter((l, idx, arr) => arr.findIndex((x) => x.href === l.href) === idx);

  const openDropdown  = () => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); setProgramsOpen(true); };
  const closeDropdown = () => { hoverTimeout.current = setTimeout(() => setProgramsOpen(false), 120); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <Header
        open={open}
        onToggle={() => {
          const next = !open;
          setOpen(next);
          if (next) window.dispatchEvent(new CustomEvent("main-menu-open"));
        }}
        links={links}
        logoUrl={logoUrl}
        logoScale={logoScale}
        logoPosition={logoPosition}
        donateLabel={donateLabel}
        getInvolvedLabel={getInvolvedLabel}
        shopLabel={shopLabel}
        shopUrl={shopUrl}
        liveEnabled={!!liveSettings.enabled}
        pageVisibility={pageVisibility}
        programsOpen={programsOpen}
        onProgramsEnter={openDropdown}
        onProgramsLeave={closeDropdown}
        onProgramsClose={() => setProgramsOpen(false)}
      />
      <MobileMenu
        open={open}
        links={links}
        donateLabel={donateLabel}
        getInvolvedLabel={getInvolvedLabel}
        shopLabel={shopLabel}
        shopUrl={shopUrl}
        pageVisibility={pageVisibility}
        onClose={() => setOpen(false)}
      />
    </nav>
  );
}
