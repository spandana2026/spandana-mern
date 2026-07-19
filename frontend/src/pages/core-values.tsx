import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Heart, HeartHandshake, UserCheck, ShieldCheck, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

/* ─── Data ─── */
interface SiteSettings {
  values: string[];
  coreValuesSection?: {
    badge: string;
    taglines: string[];
    descriptions: string[];
  };
  footer: { copyright: string };
}

const DEFAULT: SiteSettings = {
  values: ["Justice", "Mercy", "Compassion", "Responsibility", "Accountability"],
  coreValuesSection: {
    badge: "Our Core Values",
    taglines: ["Build People Up", "Help People Grow", "Because People Matter"],
    descriptions: [
      "Ensuring fairness and equity for the underserved by removing systemic barriers to success.",
      "Acting with profound kindness toward those in distress, providing grace and support in times of crisis.",
      "Deeply empathizing with and acting for the holistic well-being of every individual we encounter.",
      "Taking ownership of our mission and ensuring our actions create a sustainable, positive impact on society and the environment.",
      "Maintaining the highest standards of transparency and integrity in every initiative, remaining answerable to those we serve.",
    ],
  },
  footer: { copyright: `© ${new Date().getFullYear()} Spandana Care Aid Foundation. All rights reserved.` },
};

const VALUE_CONFIG = [
  {
    icon: Scale,
    bg: "bg-blue-100 dark:bg-blue-950/60",
    iconColor: "text-blue-600 dark:text-blue-400",
    accent: "#1565C0",
    accentLight: "rgba(21,101,192,0.08)",
    accentBorder: "rgba(21,101,192,0.25)",
    accentGlow: "rgba(21,101,192,0.18)",
    symbol: "§",
  },
  {
    icon: Heart,
    bg: "bg-rose-100 dark:bg-rose-950/60",
    iconColor: "text-rose-600 dark:text-rose-400",
    accent: "#AD1457",
    accentLight: "rgba(173,20,87,0.08)",
    accentBorder: "rgba(173,20,87,0.25)",
    accentGlow: "rgba(173,20,87,0.18)",
    symbol: "♡",
  },
  {
    icon: HeartHandshake,
    bg: "bg-purple-100 dark:bg-purple-950/60",
    iconColor: "text-purple-600 dark:text-purple-400",
    accent: "#6A1B9A",
    accentLight: "rgba(106,27,154,0.08)",
    accentBorder: "rgba(106,27,154,0.25)",
    accentGlow: "rgba(106,27,154,0.18)",
    symbol: "∞",
  },
  {
    icon: UserCheck,
    bg: "bg-amber-100 dark:bg-amber-950/60",
    iconColor: "text-amber-600 dark:text-amber-400",
    accent: "#E65100",
    accentLight: "rgba(230,81,0,0.08)",
    accentBorder: "rgba(230,81,0,0.25)",
    accentGlow: "rgba(230,81,0,0.18)",
    symbol: "★",
  },
  {
    icon: ShieldCheck,
    bg: "bg-emerald-100 dark:bg-emerald-950/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    accent: "#00695C",
    accentLight: "rgba(0,105,92,0.08)",
    accentBorder: "rgba(0,105,92,0.25)",
    accentGlow: "rgba(0,105,92,0.18)",
    symbol: "✦",
  },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65 } },
};

export default function CoreValues() {
  const [s, setS] = useState<SiteSettings>(DEFAULT);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS({ ...DEFAULT, ...d, coreValuesSection: { ...DEFAULT.coreValuesSection, ...(d?.coreValuesSection ?? {}) } }))
      .catch(() => {});
  }, []);

  const cv = s.coreValuesSection ?? DEFAULT.coreValuesSection!;
  const badge = cv.badge ?? "Our Core Values";
  const taglines = cv.taglines?.length ? cv.taglines : DEFAULT.coreValuesSection!.taglines;
  const descriptions = cv.descriptions?.length ? cv.descriptions : DEFAULT.coreValuesSection!.descriptions;
  const values = s.values?.length === 5 ? s.values : DEFAULT.values;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary selection:text-white">
      <Nav />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-6 md:px-12 bg-primary text-white overflow-hidden">
        {/* Background blobs */}
        <motion.div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.7, 0.5] }} transition={{ duration: 10, repeat: Infinity }} />
        <motion.div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/4 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 14, repeat: Infinity, delay: 2 }} />

        {/* Floating symbol decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {VALUE_CONFIG.map((cfg, i) => (
            <motion.div key={i}
              className="absolute text-white/6 font-serif select-none"
              style={{ fontSize: `${80 + i * 14}px`, left: `${10 + i * 20}%`, top: `${15 + (i % 3) * 25}%` }}
              animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}>
              {cfg.symbol}
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 text-white/90 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm border border-white/20">
              <Sparkles size={13} className="text-yellow-300" />
              {badge}
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium leading-[1.1] mb-6">
            The principles that<br />
            <span className="italic text-white/75">guide everything we do.</span>
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center items-center gap-3 md:gap-5 text-white/70 text-sm md:text-base mb-10">
            {taglines.map((t, i) => (
              <span key={i} className="flex items-center gap-3">
                {i > 0 && <span className="text-white/30 text-lg">✦</span>}
                <span className="font-serif italic">{t}</span>
              </span>
            ))}
          </motion.div>

          {/* 5 value names as quick-nav pills */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap justify-center gap-2">
            {values.map((v, i) => (
              <button key={i} onClick={() => {
                document.getElementById(`value-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold tracking-wide transition-all hover:scale-105 backdrop-blur-sm">
                {v}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Values grid — full expanded cards ── */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-background">
        <motion.div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5 md:gap-6"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>

          {values.map((name, i) => {
            const cfg = VALUE_CONFIG[i] ?? VALUE_CONFIG[0];
            const Icon = cfg.icon;
            const desc = descriptions[i] ?? DEFAULT.coreValuesSection!.descriptions[i] ?? "";
            const isExp = expanded === i;

            return (
              <motion.div key={i} id={`value-${i}`} variants={fadeUp}
                className={`relative rounded-3xl border overflow-hidden transition-all duration-300 cursor-pointer ${i === 2 ? "md:col-span-2" : ""}`}
                style={{
                  borderColor: isExp ? cfg.accentBorder : "hsl(var(--border))",
                  boxShadow: isExp ? `0 12px 40px ${cfg.accentGlow}` : "none",
                  background: isExp ? cfg.accentLight : "hsl(var(--card))",
                }}
                onClick={() => setExpanded(isExp ? null : i)}>

                {/* Large decorative symbol */}
                <div className="absolute top-4 right-6 text-7xl font-serif select-none pointer-events-none transition-all duration-300"
                  style={{ color: cfg.accent, opacity: isExp ? 0.12 : 0.06 }}>
                  {cfg.symbol}
                </div>

                <div className="p-6 md:p-8">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <motion.div whileHover={{ scale: 1.08 }} className={`w-14 h-14 rounded-2xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={26} className={cfg.iconColor} />
                      </motion.div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: cfg.accent }}>
                          Value {String(i + 1).padStart(2, "0")}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-foreground leading-tight">{name}</h2>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: isExp ? 180 : 0 }} transition={{ duration: 0.25 }}
                      className="shrink-0 mt-1 text-muted-foreground">
                      <ChevronDown size={20} />
                    </motion.div>
                  </div>

                  {/* Always visible short teaser */}
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                    {desc}
                  </p>

                  {/* Expanded full content */}
                  <AnimatePresence>
                    {isExp && (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden">
                        <div className="pt-5 mt-5 border-t" style={{ borderColor: cfg.accentBorder }}>
                          <p className="text-foreground/80 leading-relaxed mb-4">{desc}</p>
                          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: cfg.accent }}>
                            <span>How we live this value</span>
                            <ArrowRight size={14} />
                          </div>
                          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                            {[
                              "Through equitable resource distribution, advocacy programs, and systemic policy engagement — ensuring every person we serve is treated with equal dignity.",
                              "Our emergency relief, counselling access, and mental health programs embody this value daily — showing up without judgment.",
                              "We listen before we act. Every program begins with community consultation, ensuring our work reflects the lived experiences of those we serve.",
                              "We measure our actions by their long-term impact. Regular audits, impact assessments, and honest reporting keep us accountable to our mission.",
                              "Quarterly impact reports, open donor records, and community feedback loops ensure the people we serve can hold us to account.",
                            ][i]}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Quote strip ── */}
      <section className="py-16 px-6 md:px-12 bg-primary/5 border-y border-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-2xl md:text-3xl font-serif italic text-foreground/80 leading-relaxed">
              "These are not aspirations written on a wall.<br className="hidden md:block" />
              They are the operating system<br className="hidden md:block" />
              of everything we do."
            </p>
            <p className="mt-5 text-sm font-bold uppercase tracking-widest text-primary">Spandana Care Aid Foundation</p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 md:px-12 bg-background text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">
            Believe in what we stand for?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-base">
            Join hands with a team that lives these values every single day — as a volunteer, donor, or community partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full h-12 px-8 font-bold gap-2">
              <Link href="/get-involved">Get Involved <ArrowRight size={17} /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full h-12 px-8 font-bold gap-2">
              <Link href="/#vision">Our Vision & Mission</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
