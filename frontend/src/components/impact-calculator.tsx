import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Stethoscope, BookOpen, Heart, Users, Sprout } from "lucide-react";
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
const PROG_ICONS  = [Sprout, BookOpen, Stethoscope, Heart, Users];
const PROG_TAGS   = ["", "Most popular", "", "Max impact", "Legacy"] as const;

const DEFAULT_PROGRAMS = [
  { icon: "🌱", name: "Plant a Tree",        desc: "Native tree planted in your name",                     inr: [50,  100, 250]  as [number,number,number], usd: [1,  3,  5]  as [number,number,number] },
  { icon: "📚", name: "Sponsor a Child",      desc: "Books, uniform & tuition for one month",               inr: [500, 1000,2000] as [number,number,number], usd: [6,  12, 25] as [number,number,number] },
  { icon: "🏥", name: "Medical Consultation", desc: "Free checkup & medicines for one patient",             inr: [500, 1000,2500] as [number,number,number], usd: [6,  15, 30] as [number,number,number] },
  { icon: "🍱", name: "Feed a Family",        desc: "Nutritious meals for a week",                          inr: [200, 500, 1000] as [number,number,number], usd: [3,  6,  12] as [number,number,number] },
  { icon: "💧", name: "Clean Water Access",   desc: "Water purification support for a household",           inr: [1000,2500,5000] as [number,number,number], usd: [12, 30, 60] as [number,number,number] },
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
  const [geoDetected, setGeoDetected]     = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.impactSection) setCfg(d.impactSection);
        if (d?.donatePage?.programs?.length) setPrograms(d.donatePage.programs);
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
          setGeoDetected(true);
        }
      })
      .catch(() => {});
  }, [settingsLoaded]);

  const heading  = cfg.heading       ?? DEFAULT_HEADING;
  const italic   = cfg.headingItalic ?? DEFAULT_HEADING_ITALIC;
  const subtitle = cfg.subtitle      ?? DEFAULT_SUBTITLE;
  const note     = cfg.note          ?? DEFAULT_NOTE;

  const idx   = Math.min(selected, programs.length - 1);
  const prog  = programs[idx]!;
  const color = PROG_COLORS[idx % PROG_COLORS.length]!;
  const style = COLOR_MAP[color] ?? COLOR_MAP["blue"]!;
  const Icon  = PROG_ICONS[idx % PROG_ICONS.length]!;

  const midInr = prog.inr[1] ?? prog.inr[0] ?? 0;
  const midUsd = prog.usd[1] ?? prog.usd[0] ?? 0;
  const btnLabel = donorType === "indian"
    ? `₹${midInr.toLocaleString("en-IN")}`
    : `$${midUsd}`;

  return (
    <section className="py-14 md:py-24 px-6 md:px-12 bg-card overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          {/* Badge + toggle */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold uppercase tracking-widest">
              Your Impact
            </div>
            <div className="flex bg-muted rounded-full p-0.5 gap-0.5">
              <button
                onClick={() => { setDonorType("indian"); setSelected(0); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${donorType === "indian" ? "bg-white text-foreground shadow-sm dark:bg-card" : "text-muted-foreground hover:text-foreground"}`}
              >🇮🇳 India</button>
              <button
                onClick={() => { setDonorType("intl"); setSelected(0); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${donorType === "intl" ? "bg-white text-foreground shadow-sm dark:bg-card" : "text-muted-foreground hover:text-foreground"}`}
              >🌍 International</button>
            </div>
          </div>

          {geoDetected && (
            <p className="text-[10px] text-muted-foreground mb-3">
              📍 International view based on your location
            </p>
          )}

          <h2 className="text-3xl md:text-5xl font-serif font-medium">
            {heading} <span className="italic text-muted-foreground">{italic}</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-base">{subtitle}</p>
        </motion.div>

        {/* Program Selector */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center gap-3 mb-10">
          {programs.map((p, i) => {
            const pInr = p.inr[1] ?? p.inr[0] ?? 0;
            const pUsd = p.usd[1] ?? p.usd[0] ?? 0;
            return (
              <motion.button key={i} onClick={() => setSelected(i)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className={`relative px-4 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-200 mt-3
                  ${idx === i
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                    : "border-border text-foreground hover:border-primary/50 bg-background"}`}
              >
                {PROG_TAGS[i] && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                    {PROG_TAGS[i]}
                  </span>
                )}
                <span className="mr-1">{p.icon}</span>
                {donorType === "indian"
                  ? `₹${pInr.toLocaleString("en-IN")}`
                  : `$${pUsd}`}
              </motion.button>
            );
          })}
        </div>

        {/* Impact Card */}
        <AnimatePresence mode="wait">
          <motion.div key={`${idx}-${donorType}`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`${style.bg} border-2 ${style.border} rounded-3xl p-5 md:p-12 flex flex-col md:flex-row items-center gap-5 md:gap-8`}
          >
            <div className={`shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-xl`}>
              <Icon size={44} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">
                {btnLabel} goes to
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-3">{prog.name}</h3>
              <p className="text-muted-foreground leading-relaxed text-base">{prog.desc}</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="w-full md:w-auto shrink-0">
              <Button asChild size="lg" className={`rounded-full h-13 px-8 font-bold gap-2 bg-gradient-to-r ${style.gradient} border-0 text-white shadow-lg w-full md:w-auto`}>
                <Link href="/donate">Donate {btnLabel} <ArrowRight size={18} /></Link>
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          {note}
        </motion.p>
      </div>
    </section>
  );
}
