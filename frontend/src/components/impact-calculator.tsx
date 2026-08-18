import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Stethoscope, BookOpen, HeartHandshake, Users, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const COLOR_MAP: Record<string, { gradient: string; bg: string; border: string }> = {
  pink:    { gradient: "from-pink-500 to-rose-600",     bg: "bg-pink-50 dark:bg-pink-950/30",     border: "border-pink-200 dark:border-pink-800"   },
  blue:    { gradient: "from-blue-500 to-indigo-600",   bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800"   },
  purple:  { gradient: "from-purple-500 to-violet-600", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800" },
  emerald: { gradient: "from-emerald-500 to-teal-600",  bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  amber:   { gradient: "from-amber-500 to-orange-600",  bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-800"  },
};

const PROG_COLORS = ["emerald", "blue", "pink", "amber", "purple"];
const PROG_ICONS  = [Stethoscope, BookOpen, HeartHandshake, Users, Utensils];
const PROG_TAGS   = ["", "Most popular", "", "", "Max impact"] as const;

const DEFAULT_PROGRAMS = [
  { icon: "🏥", name: "Medical Consultation",              desc: "Covers a complete primary checkup, diagnostic tests, medicines, and transport for one patient.",                         inr: [1500,1500,1500] as [number,number,number], usd: [18, 18, 18] as [number,number,number] },
  { icon: "📚", name: "Education & Child Empowerment",     desc: "Funds monthly tuition, remedial classes, and after-school academic support for one child.",                              inr: [2000,2000,2000] as [number,number,number], usd: [24, 24, 24] as [number,number,number] },
  { icon: "⚖️", name: "Mental Health & Legal Advocacy",     desc: "Sponsoring professional counseling, vital legal aid for vulnerable women facing violence, and support groups.",           inr: [2500,2500,2500] as [number,number,number], usd: [30, 30, 30] as [number,number,number] },
  { icon: "👵", name: "Elderly Care & Single Parents",      desc: "Covers medical care, nutrition, and everyday essentials for isolated seniors and single parents.",                        inr: [3000,3000,3000] as [number,number,number], usd: [36, 36, 36] as [number,number,number] },
  { icon: "🍲", name: "Community Nutrition & Food Relief",  desc: "Funds wholesome hot meals and monthly dry ration kits for families in brick kilns and ragpicker communities.",            inr: [5000,5000,5000] as [number,number,number], usd: [60, 60, 60] as [number,number,number] },
];

const DEFAULT_HEADING        = "See what your donation";
const DEFAULT_HEADING_ITALIC = "actually does.";
const DEFAULT_SUBTITLE       = "Every rupee goes directly to the ground. Pick a program below.";
const DEFAULT_NOTE           = "100% of your donation goes to the programs. Spandana Care Aid Foundation is a registered nonprofit.";

interface Program { icon: string; name: string; desc: string; inr: [number,number,number]; usd: [number,number,number]; }
interface ImpactSection { heading?: string; headingItalic?: string; subtitle?: string; note?: string; }

export default function ImpactCalculator() {
  const [selected, setSelected]           = useState(0);
  const [cfg, setCfg]                     = useState<ImpactSection>({});
  const [programs, setPrograms]           = useState<Program[]>(DEFAULT_PROGRAMS);
  const [donorType, setDonorType]         = useState<"indian" | "intl">("indian");
  const [donatePageSettings, setDonatePageSettings] = useState<any>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.impactSection) setCfg(d.impactSection);
        if (d?.donatePage) {
          setDonatePageSettings(d.donatePage);
          if (d.donatePage.programs?.length) setPrograms(d.donatePage.programs);
        }
        setSettingsLoaded(true);
      })
      .catch(() => setSettingsLoaded(true));
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        if (d?.country_code && d.country_code !== "IN") {
          setDonorType("intl");
        }
      })
      .catch(() => {});
  }, [settingsLoaded]);

  const activePrograms: DonateProgram[] = useMemo(() => {
    if (donorType === "indian") {
      if (donatePageSettings?.programsIndia?.length) {
        return donatePageSettings.programsIndia.map((p: any) => ({
          icon: p.icon,
          name: p.name,
          desc: p.desc,
          inr: p.inr,
          usd: [0, 0, 0],
        }));
      }
      return donatePageSettings?.programs ?? programs;
    } else {
      if (donatePageSettings?.programsIntl?.length) {
        return donatePageSettings.programsIntl.map((p: any) => ({
          icon: p.icon,
          name: p.name,
          desc: p.desc,
          inr: [0, 0, 0],
          usd: p.usd,
        }));
      }
      return donatePageSettings?.programs ?? programs;
    }
  }, [donorType, donatePageSettings, programs]);

  const heading  = cfg.heading       ?? DEFAULT_HEADING;
  const italic   = cfg.headingItalic ?? DEFAULT_HEADING_ITALIC;
  const subtitle = cfg.subtitle      ?? DEFAULT_SUBTITLE;
  const note     = cfg.note          ?? DEFAULT_NOTE;

  const idx   = Math.min(selected, activePrograms.length - 1);
  const prog  = activePrograms[idx]!;
  const color = PROG_COLORS[idx % PROG_COLORS.length]!;
  const style = COLOR_MAP[color] ?? COLOR_MAP["pink"]!;
  const Icon  = PROG_ICONS[idx % PROG_ICONS.length]!;

  const midInr = prog.inr[1] ?? prog.inr[0] ?? 0;
  const midUsd = prog.usd[1] ?? prog.usd[0] ?? 0;
  const currentPriceLabel = donorType === "indian"
    ? `₹${midInr.toLocaleString("en-IN")}`
    : `$${midUsd}`;

  return (
    <section className="py-12 md:py-20 px-4 md:px-8 bg-background overflow-hidden relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-widest mb-4">
            YOUR IMPACT
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight tracking-tight max-w-3xl mx-auto">
            {heading} <span className="italic font-normal relative inline-block text-foreground">{italic}<span className="absolute bottom-1 left-0 right-0 h-0.5 bg-primary/80 rounded-full" /></span>
          </h2>
          
          <p className="text-muted-foreground mt-3 text-xs sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
            {subtitle}
          </p>
        </motion.div>

        {/* Price-only Buttons (1 row on laptop, 1-2 rows on mobile, NO horizontal scroll) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 mb-10 max-w-full">
          {activePrograms.map((p, i) => {
            const pInr = p.inr[1] ?? p.inr[0] ?? 0;
            const pUsd = p.usd[1] ?? p.usd[0] ?? 0;
            const priceText = donorType === "indian"
              ? `₹${pInr.toLocaleString("en-IN")}`
              : `$${pUsd}`;
            const isSelected = idx === i;
            const tag = PROG_TAGS[i];

            return (
              <div key={i} className="relative pt-3">
                {tag && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap z-10">
                    {tag}
                  </span>
                )}
                <motion.button
                  onClick={() => setSelected(i)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-base font-bold transition-all duration-200 border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 ring-2 ring-primary/20 scale-105"
                      : "bg-card text-foreground border-border/80 hover:border-primary/50 hover:bg-accent/40"
                  }`}
                >
                  {priceText}
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Selected Impact Detail Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${idx}-${donorType}`}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative overflow-hidden ${style.bg} border ${style.border} rounded-[32px] p-6 sm:p-10 shadow-sm`}
          >
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8">
              {/* Left Squircle Icon */}
              <div className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-md transform transition-transform hover:scale-105`}>
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>

              {/* Middle Card Content */}
              <div className="flex-1 text-center md:text-left space-y-1.5">
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-muted-foreground block">
                  {currentPriceLabel} GIVES YOU
                </span>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  {prog.name}
                </h3>

                <p className="text-muted-foreground text-xs sm:text-base leading-relaxed max-w-xl">
                  {prog.desc}
                </p>
              </div>

              {/* Right CTA Button */}
              <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0 self-center">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    asChild
                    size="lg"
                    className={`w-full md:w-auto rounded-full h-11 sm:h-13 px-6 sm:px-8 text-xs sm:text-sm font-bold gap-2 bg-gradient-to-r ${style.gradient} border-0 text-white shadow-md hover:opacity-95 transition-all`}
                  >
                    <Link href="/donate">
                      <span>Donate {currentPriceLabel}</span>
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-xs text-muted-foreground mt-6 font-medium"
        >
          <p>{note}</p>
        </motion.div>
      </div>
    </section>
  );
}