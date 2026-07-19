import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Menu, X, Heart, ShoppingBag, HeartHandshake,
  ChevronDown, Shield, Brain, Radio, Gamepad2,
} from "lucide-react";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PROGRAMS_DROPDOWN = [
  { label: "Physical Health", href: "/programs/physical-health", icon: Shield, desc: "Medical, skills & economic" },
  { label: "Mental Health",   href: "/programs/mental-health",   icon: Brain,  desc: "Awareness, counselling & support" },
];

interface Props {
  open: boolean;
  onToggle: () => void;
  links: Array<{ label: string; href: string }>;
  logoUrl: string;
  logoScale: number;
  logoPosition: "left" | "center" | "right";
  donateLabel: string;
  getInvolvedLabel: string;
  shopLabel: string;
  shopUrl: string;
  liveEnabled: boolean;
  pageVisibility: Record<string, boolean>;
  programsOpen: boolean;
  onProgramsEnter: () => void;
  onProgramsLeave: () => void;
  onProgramsClose: () => void;
}

export default function Header({
  open,
  onToggle,
  links,
  logoUrl,
  logoScale,
  logoPosition,
  donateLabel,
  getInvolvedLabel,
  shopLabel,
  shopUrl,
  liveEnabled,
  pageVisibility,
  programsOpen,
  onProgramsEnter,
  onProgramsLeave,
  onProgramsClose,
}: Props) {
  const [location] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showDonate      = pageVisibility.pageDonate      !== false;
  const showGetInvolved = pageVisibility.pageGetInvolved !== false;
  const showShop        = pageVisibility.pageShop        !== false;

  return (
    <div
      className={`flex items-center px-4 md:px-12 h-16 md:h-20 ${
        logoPosition === "center"
          ? "justify-center relative"
          : logoPosition === "right"
          ? "justify-between flex-row-reverse"
          : "justify-between"
      }`}
    >
      {/* Logo */}
      <Link
        href="/"
        onClick={(e) => {
          if (location === "/") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className={`flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-pointer ${
          logoPosition === "center" ? "absolute left-1/2 -translate-x-1/2" : ""
        }`}
      >
        <motion.img
          src={logoUrl}
          alt="Spandana Care Aid Foundation"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-12 md:h-14 w-auto"
          style={{
            flexShrink: 0,
            transform: `scale(${logoScale})`,
            transformOrigin: logoPosition === "right" ? "right center" : "left center",
          }}
        />
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
        {links.map((l) => {
          const isSahara = l.label === "Sahara Community Centers" || l.href === "/sahara";

          if (isSahara) {
            return (
              <div
                key={l.label}
                className="relative"
                ref={dropdownRef}
                onMouseEnter={onProgramsEnter}
                onMouseLeave={onProgramsLeave}
              >
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

                <AnimatePresence>
                  {programsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-background border border-border rounded-2xl shadow-xl overflow-hidden"
                      onMouseEnter={onProgramsEnter}
                      onMouseLeave={onProgramsLeave}
                    >
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-background border-l border-t border-border" />
                      {PROGRAMS_DROPDOWN.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => { onProgramsClose(); window.scrollTo({ top: 0 }); }}
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
            <Link href="/volunteer">
              <HeartHandshake size={15} />
              {getInvolvedLabel}
            </Link>
          </Button>
        )}

        {liveEnabled && (
          <Link
            href="/live"
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-colors shadow-sm"
          >
            <Radio size={12} className="animate-pulse" />
            LIVE
          </Link>
        )}
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-3">
        {showDonate && (
          <Button asChild variant="outline" size="default" className="rounded-full border-primary text-primary hover:bg-primary/5 gap-1.5">
            <Link href="/donate">
              <Heart size={15} />
              {donateLabel}
            </Link>
          </Button>
        )}
        {showShop && (
          <Button asChild size="default" className="rounded-full px-5 gap-1.5">
            {shopUrl ? (
              <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                <ShoppingBag size={15} />
                {shopLabel}
              </a>
            ) : (
              <Link href="/shop">
                <ShoppingBag size={15} />
                {shopLabel}
              </Link>
            )}
          </Button>
        )}
      </div>

      {/* Mobile CTAs */}
      <div className="md:hidden flex items-center gap-4 ml-auto mr-3">
        {liveEnabled && (
          <Link
            href="/live"
            className="flex flex-col items-center justify-center gap-0.5"
            aria-label="Watch Live"
          >
            <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse shadow-sm">
              <Radio size={10} />
              LIVE
            </span>
          </Link>
        )}
        {showDonate && (
          <Link
            href="/donate"
            className="flex flex-col items-center justify-center gap-1 text-primary hover:text-primary/80 transition-colors"
            aria-label={donateLabel}
          >
            <Heart size={28} strokeWidth={2} />
            <span className="text-[12px] font-bold tracking-wide leading-none">{donateLabel}</span>
          </Link>
        )}
        {showGetInvolved && (
          <Link
            href="/volunteer"
            className="flex flex-col items-center justify-center gap-1 text-primary hover:text-primary/80 transition-colors"
            aria-label={getInvolvedLabel}
          >
            <HeartHandshake size={28} strokeWidth={2} />
            <span className="text-[12px] font-bold tracking-wide leading-none">Volunteer</span>
          </Link>
        )}
        {pageVisibility.pageFunZone !== false && (
          <Link
            href="/fun-zone"
            className="flex flex-col items-center justify-center gap-1 text-primary hover:text-primary/80 transition-colors"
            aria-label="Joy Zone"
          >
            <Gamepad2 size={28} strokeWidth={2} />
            <span className="text-[12px] font-bold tracking-wide leading-none">Joy Zone</span>
          </Link>
        )}
        {showShop && (
          shopUrl ? (
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 text-primary hover:text-primary/80 transition-colors"
              aria-label={shopLabel}
            >
              <ShoppingBag size={28} strokeWidth={2} />
              <span className="text-[12px] font-bold tracking-wide leading-none">{shopLabel}</span>
            </a>
          ) : (
            <Link
              href="/shop"
              className="flex flex-col items-center justify-center gap-1 text-primary hover:text-primary/80 transition-colors"
              aria-label={shopLabel}
            >
              <ShoppingBag size={28} strokeWidth={2} />
              <span className="text-[12px] font-bold tracking-wide leading-none">{shopLabel}</span>
            </Link>
          )
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-foreground"
        onClick={onToggle}
        aria-label="Toggle menu"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}
