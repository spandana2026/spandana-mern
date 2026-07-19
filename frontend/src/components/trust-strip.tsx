import { motion } from "framer-motion";
import { ShieldCheck, Award, FileCheck, Globe, BadgeCheck } from "lucide-react";

interface Badge { label: string; sub: string; }

const BADGE_ICONS = [ShieldCheck, FileCheck, Globe, Award, BadgeCheck];

const DEFAULT_BADGES: Badge[] = [
  { label: "80G Certified",  sub: "Donor Tax Benefit" },
  { label: "12A Registered", sub: "Govt. of India" },
  { label: "NGO Darpan",     sub: "NITI Aayog Listed" },
  { label: "CSR 1",          sub: "Corporate Social Responsibility" },
  { label: "25+ Years",      sub: "Established 1999" },
];

export default function TrustStrip({ badges = DEFAULT_BADGES }: { badges?: Badge[] }) {
  return (
    <section className="py-10 px-6 md:px-12 bg-card border-y border-border">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap items-center justify-center gap-5 md:gap-10">
          {badges.map((b, i) => {
            const Icon = BADGE_ICONS[i % BADGE_ICONS.length];
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground leading-tight">{b.label}</div>
                  <div className="text-xs text-muted-foreground">{b.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
