import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Heart, ShoppingBag, HeartHandshake,
  ChevronDown, Shield, Brain, Gamepad2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROGRAMS_DROPDOWN = [
  { label: "Physical Health", href: "/programs/physical-health", icon: Shield, desc: "Medical, skills & economic" },
  { label: "Mental Health",   href: "/programs/mental-health",   icon: Brain,  desc: "Awareness, counselling & support" },
];

interface Props {
  open: boolean;
  links: Array<{ label: string; href: string }>;
  donateLabel: string;
  getInvolvedLabel: string;
  shopLabel: string;
  shopUrl: string;
  pageVisibility: Record<string, boolean>;
  onClose: () => void;
}

export default function MobileMenu({
  open,
  links,
  donateLabel,
  getInvolvedLabel,
  shopLabel,
  shopUrl,
  pageVisibility,
  onClose,
}: Props) {
  const [mobilePrograms, setMobilePrograms] = useState(false);

  const showDonate      = pageVisibility.pageDonate      !== false;
  const showGetInvolved = pageVisibility.pageGetInvolved !== false;
  const showShop        = pageVisibility.pageShop        !== false;

  return (
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
                      onClick={onClose}
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
                                onClick={() => { onClose(); setMobilePrograms(false); }}
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
                onClick={onClose}
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                href={l.href}
                className="text-base font-medium text-foreground hover:text-primary py-2"
                onClick={onClose}
              >
                {l.label}
              </Link>
            );
          })}

          <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-border">
            {showDonate && (
              <Button asChild variant="outline" className="w-full rounded-full border-primary text-primary gap-1.5">
                <Link href="/donate" onClick={onClose}>
                  <Heart size={14} /> {donateLabel}
                </Link>
              </Button>
            )}
            {showGetInvolved && (
              <Button asChild className="w-full rounded-full gap-1.5">
                <Link href="/join-us" onClick={onClose}>
                  <HeartHandshake size={14} />
                  {getInvolvedLabel}
                </Link>
              </Button>
            )}
            {pageVisibility.pageFunZone !== false && (
              <Button asChild className="w-full rounded-full gap-1.5">
                <Link href="/fun-zone" onClick={onClose}>
                  <Gamepad2 size={14} />
                  Joy Zone
                </Link>
              </Button>
            )}
            {showShop && (
              <Button asChild className="w-full rounded-full gap-1.5">
                {shopUrl ? (
                  <a href={shopUrl} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                    <ShoppingBag size={14} />
                    {shopLabel}
                  </a>
                ) : (
                  <Link href="/shop" onClick={onClose}>
                    <ShoppingBag size={14} />
                    {shopLabel}
                  </Link>
                )}
              </Button>
            )}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}