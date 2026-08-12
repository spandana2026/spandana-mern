import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Mail, Phone, MapPin, Instagram, Youtube, Facebook, Twitter, Eye } from "lucide-react";

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  Instagram, YouTube: Youtube, Facebook, Twitter, "Twitter / X": Twitter,
};

const NAV_LINKS = [
  { label: "Vision & Mission",       href: "/vision" },
  { label: "Sahara Community Centers", href: "/sahara" },
  { label: "Physical Health",        href: "/programs/physical-health" },
  { label: "Mental Health",          href: "/programs/mental-health" },
];

const DEFAULT_SOCIAL: Array<{ label: string; href: string; enabled?: boolean }> = [
  { label: "Instagram",   href: "#" },
  { label: "YouTube",     href: "#" },
  { label: "Facebook",    href: "#" },
  { label: "Twitter / X", href: "#" },
];

const DEFAULT_CERTS: Array<{ label: string; sub: string; enabled?: boolean }> = [
  { label: "80G Certified",    sub: "Tax exemption for donors" },
  { label: "12A Registered",   sub: "Income Tax exemption" },
  { label: "NGO Darpan",       sub: "Govt. of India listed" },
  { label: "CSR 1 Registered", sub: "Corporate Social Responsibility" },
];

interface FooterContent {
  brandSubtitle?: string;
  brandTagline: string;
  address: string;
  email: string;
  phone: string;
  showAddress?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  social: Array<{ label: string; href: string; enabled?: boolean }>;
  certifications: Array<{ label: string; sub: string; enabled?: boolean }>;
}

const DEFAULT_CONTENT: FooterContent = {
  brandTagline: "25+ years of Social Architecture — building permanent change through community, compassion, and care.",
  address: "Sahara Community Center,\nHyderabad, Telangana, India",
  email: "spandanacareaidfoundation@gmail.com",
  phone: "+91 90000 00000",
  social: DEFAULT_SOCIAL,
  certifications: DEFAULT_CERTS,
};

export default function Footer() {
  const [content, setContent] = useState<FooterContent>(DEFAULT_CONTENT);
  const [copyright, setCopyright] = useState(`© ${new Date().getFullYear()} Spandana Care Aid Foundation. All rights reserved.`);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [visitorEnabled, setVisitorEnabled] = useState(false);
  const [visitorLabel, setVisitorLabel] = useState("Visitors and counting");
  const [footerLogoUrl, setFooterLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.footerContent) setContent({ ...DEFAULT_CONTENT, ...d.footerContent });
        if (d?.footer?.copyright) setCopyright(d.footer.copyright);
        setVisitorLabel(d?.visitorCountLabel ?? "Visitors and counting");
        if (d?.branding?.logoUrlWhite) setFooterLogoUrl(d.branding.logoUrlWhite);
        else if (d?.branding?.logoUrl) setFooterLogoUrl(d.branding.logoUrl);
        fetch("/api/visitor-count")
          .then((r) => r.json())
          .then((v) => {
            if (v?.enabled !== false) {
              setVisitorEnabled(true);
              fetch("/api/visitor-count/increment", { method: "POST" })
                .then((r) => r.json())
                .then((inc) => setVisitorCount(inc.count))
                .catch(() => {});
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  const allSocial = content.social?.length ? content.social : DEFAULT_SOCIAL;
  const allCerts = content.certifications?.length ? content.certifications : DEFAULT_CERTS;
  const social = allSocial.filter(s => s.enabled !== false);
  const certs = allCerts.filter(c => c.enabled !== false);

  return (
    <footer className="bg-[#0a0f1e] text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      {/* ── Mobile layout ── */}
      <div className="md:hidden px-4 pt-5 pb-3">

        {/* Logo row + social icons side by side */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col gap-0.5">
            <img src={footerLogoUrl ?? "/logo.png"} alt="Spandana" className={`h-10 w-auto opacity-90 ${footerLogoUrl && footerLogoUrl !== "/logo.png" ? "" : "brightness-0 invert"}`} />
            {content.brandSubtitle && (
              <p className="text-[9px] tracking-[0.18em] uppercase text-white/30 font-medium">{content.brandSubtitle}</p>
            )}
          </div>
          <div className="flex gap-1.5">
            {social.map((s, i) => {
              const Icon = SOCIAL_ICONS[s.label] ?? Instagram;
              const isReal = s.href && s.href !== "#";
              return (
                <motion.a key={i} href={s.href} aria-label={s.label}
                  target={isReal ? "_blank" : undefined} rel="noopener noreferrer"
                  whileTap={{ scale: 0.92 }}
                  className="w-7 h-7 rounded-md bg-white/6 hover:bg-primary/80 border border-white/8 flex items-center justify-center">
                  <Icon size={13} className="text-white/60" />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Cert pills — scrollable row */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
          {certs.map((c, i) => (
            <div key={i} title={c.sub}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/8 shrink-0">
              <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
              <span className="text-[10px] font-semibold text-white/60 whitespace-nowrap">{c.label}</span>
            </div>
          ))}
        </div>

        {/* Quick Links + Contact in 2 columns */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-0 mb-3">
          {/* Quick links */}
          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30 mb-1.5">Links</h4>
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((n, i) => (
                <li key={i}>
                  <Link href={n.href} className="text-[12px] text-white/50 hover:text-white transition-colors">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30 mb-1.5">Contact</h4>
            <ul className="flex flex-col gap-1.5">
              {content.address && content.showAddress !== false && (
                <li className="flex items-start gap-1.5">
                  <MapPin size={11} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-[11px] text-white/50 leading-tight" style={{ whiteSpace: "pre-line" }}>
                    {content.address}
                  </span>
                </li>
              )}
              {content.email && content.showEmail !== false && (
                <li className="flex items-start gap-1.5">
                  <Mail size={11} className="text-primary mt-0.5 shrink-0" />
                  <a href={`mailto:${content.email}`} className="text-[11px] text-white/50 hover:text-white break-all leading-tight">
                    {content.email}
                  </a>
                </li>
              )}
              {content.phone && content.showPhone !== false && (
                <li className="flex items-center gap-1.5">
                  <Phone size={11} className="text-primary shrink-0" />
                  <a href={`tel:${content.phone.replace(/\s/g, "")}`} className="text-[11px] text-white/50 hover:text-white">
                    {content.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2" />

        {/* Bottom bar */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-white/25 leading-tight">{copyright}</span>
          <div className="flex items-center gap-3 text-[10px] text-white/25 shrink-0">
            <Link href="/privacy" className="hover:text-white/60">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60">Terms</Link>
          </div>
        </div>

        {visitorEnabled && visitorCount != null && (
          <div className="flex items-center gap-1 mt-1">
            <Eye size={9} className="text-white/20" />
            <span className="text-[9px] text-white/20 font-mono tracking-wider">
              {visitorCount.toLocaleString("en-IN")} {visitorLabel}
            </span>
          </div>
        )}
      </div>

      {/* ── Desktop layout (unchanged) ── */}
      <div className="hidden md:block">
        <div className="relative max-w-7xl mx-auto px-12 pt-10 pb-8 grid md:grid-cols-12 gap-6">

          {/* Brand column */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1">
              <img src={footerLogoUrl ?? "/logo.png"} alt="Spandana" className={`h-9 w-auto opacity-85 ${footerLogoUrl && footerLogoUrl !== "/logo.png" ? "" : "brightness-0 invert"}`} />
              {content.brandSubtitle && (
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium text-center">{content.brandSubtitle}</p>
              )}
            </div>
            <div className="flex justify-center gap-2">
              {social.map((s, i) => {
                const Icon = SOCIAL_ICONS[s.label] ?? Instagram;
                const isReal = s.href && s.href !== "#";
                return (
                  <motion.a key={i} href={s.href} aria-label={s.label}
                    target={isReal ? "_blank" : undefined} rel="noopener noreferrer"
                    whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.94 }}
                    className="w-8 h-8 rounded-lg bg-white/6 hover:bg-primary/80 border border-white/8 hover:border-primary flex items-center justify-center transition-all duration-200">
                    <Icon size={15} className="text-white/60" />
                  </motion.a>
                );
              })}
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">{content.brandTagline}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {certs.map((c, i) => (
                <div key={i} title={c.sub}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 hover:border-primary/40 transition-colors cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-[11px] font-semibold text-white/70 tracking-wide">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3">Quick Links</h4>
            <ul className="flex flex-col gap-1.5">
              {NAV_LINKS.map((n, i) => (
                <li key={i}>
                  <Link href={n.href} className="text-sm text-white/50 hover:text-white transition-all duration-150 hover:translate-x-1 inline-block">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3">Contact Us</h4>
            <ul className="flex flex-col gap-2.5">
              {content.address && content.showAddress !== false && (
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={13} className="text-primary" />
                  </div>
                  <span className="text-sm text-white/50 leading-relaxed" style={{ whiteSpace: "pre-line" }}>{content.address}</span>
                </li>
              )}
              {content.email && content.showEmail !== false && (
                <li className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Mail size={13} className="text-primary" />
                  </div>
                  <a href={`mailto:${content.email}`} className="text-sm text-white/50 hover:text-white transition-colors break-all">
                    {content.email}
                  </a>
                </li>
              )}
              {content.phone && content.showPhone !== false && (
                <li className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Phone size={13} className="text-primary" />
                  </div>
                  <a href={`tel:${content.phone.replace(/\s/g, "")}`} className="text-sm text-white/50 hover:text-white transition-colors">
                    {content.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-12">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-12 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-white/25">{copyright}</span>
          {visitorEnabled && visitorCount != null && (
            <div className="flex items-center gap-1.5">
              <Eye size={11} className="text-white/20" />
              <span className="text-[10px] text-white/20 font-mono tracking-wider">
                {visitorCount.toLocaleString("en-IN")} {visitorLabel}
              </span>
            </div>
          )}
          <div className="flex items-center gap-5 text-[11px] text-white/25">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
