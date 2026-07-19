import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Stethoscope, BookOpen, Users, Scale, Leaf,
  ArrowRight, ChevronUp, Sparkles, CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

interface SubSection {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  heading: string;
  desc: string;
  bullets: string[];
  impact: string;
  color: string;
  bg: string;
}

const SECTIONS: SubSection[] = [
  {
    id: "medical-aid",
    icon: Stethoscope,
    label: "Medical Aid",
    heading: "Free Healthcare for Every Family",
    desc: "Access to quality healthcare is not a privilege — it is a right. Spandana organises large-scale free medical camps providing check-ups, diagnostics, medicines, and specialist referrals for vulnerable communities who cannot otherwise afford care.",
    bullets: [
      "Free medical camps with multi-speciality doctors",
      "Preventative screenings (blood pressure, diabetes, vision, dental)",
      "Free medicines and follow-up care",
      "Referrals to government hospitals and specialists",
      "Mother & child health support for at-risk families",
    ],
    impact: "Thousands of consultations delivered annually at zero cost to beneficiaries.",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  {
    id: "skill-development",
    icon: BookOpen,
    label: "Skill Development",
    heading: "Building Livelihoods Through Training",
    desc: "Unemployment and underemployment trap families in cycles of poverty. Spandana's vocational training centres equip individuals — especially youth and women — with practical, market-relevant skills that open doors to dignified work.",
    bullets: [
      "Vocational training in tailoring, electronics, and IT",
      "Women's empowerment batches with flexible schedules",
      "Industry-linked placement support after training",
      "Certificate programmes recognised by local employers",
      "Ongoing mentorship from working professionals",
    ],
    impact: "Hundreds of trained graduates now in formal employment each year.",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  {
    id: "entrepreneur-initiatives",
    icon: Users,
    label: "Entrepreneur Initiatives",
    heading: "Micro-Enterprise & Peer Support",
    desc: "Economic independence comes not just from jobs but from ownership. Through self-help groups and seed capital support, we help low-income families start small businesses and build collective financial resilience.",
    bullets: [
      "Self-Help Groups (SHGs) for women and marginalised groups",
      "Seed funding and micro-loan facilitation",
      "Business literacy and financial planning workshops",
      "Market linkages for artisans and home-based businesses",
      "Peer accountability circles to sustain growth",
    ],
    impact: "Dozens of active SHGs with hundreds of member families now economically independent.",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  {
    id: "legal-advocacy",
    icon: Scale,
    label: "Legal Advocacy",
    heading: "Know Your Rights. Claim Your Rights.",
    desc: "Many underserved families face legal challenges they are entirely unprepared for — land disputes, domestic violence cases, labour exploitation, and lack of government entitlements. Spandana bridges the gap between the law and the community.",
    bullets: [
      "Free legal awareness workshops in communities",
      "Support in accessing government welfare schemes",
      "Guidance on land rights, inheritance, and tenant protection",
      "Referrals to pro-bono lawyers and legal aid centres",
      "Help navigating the court system and filing complaints",
    ],
    impact: "Hundreds of families empowered with legal knowledge and connected to free counsel.",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
  },
  {
    id: "environmental-stewardship",
    icon: Leaf,
    label: "Environmental Stewardship",
    heading: "Sustainable Living for Healthier Communities",
    desc: "Environmental degradation disproportionately harms the communities we serve. Spandana integrates ecological awareness into all programs — empowering families to protect their environment and reduce their footprint.",
    bullets: [
      "Community kitchen gardens and urban farming initiatives",
      "Waste segregation and composting drives in slum clusters",
      "Tree-planting campaigns with school and colony participation",
      "Awareness about air quality, water safety, and pollution",
      "Eco-friendly livelihood alternatives (e.g. reusable bag production)",
    ],
    impact: "Greener, healthier neighbourhoods with families who are environmental advocates.",
    color: "text-teal-700",
    bg: "bg-teal-50 border-teal-200",
  },
];

export default function PhysicalHealthPage() {
  const [active, setActive] = useState("medical-aid");
  const [showTop, setShowTop] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [sectionOverrides, setSectionOverrides] = useState<Array<Record<string, unknown>>>([]);
  const [heroSettings, setHeroSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.physicalHealthSections) setSectionOverrides(d.physicalHealthSections);
        if (d?.physicalHealthHero) setHeroSettings(d.physicalHealthHero);
      })
      .catch(() => {});
  }, []);

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));

    const onScroll = () => {
      const threshold = window.innerHeight * 0.45;
      setShowTop(window.scrollY > 400);
      setPastHero(window.scrollY > threshold);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // jump to hash section on load
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && sectionRefs.current[hash]) {
      setTimeout(() => sectionRefs.current[hash]?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    }
  }, []);

  const sections = SECTIONS.map((s, i) => ({ ...s, ...(sectionOverrides[i] ?? {}) }));

  return (
    <>
      <Nav />
      <main className="pt-28">
        {/* ── STICKY SUB-NAV (always visible) ── */}
        <div className="fixed top-20 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
          <div className="max-w-6xl mx-auto px-3 flex items-center py-2">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  title={s.label}
                  className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 px-1 md:px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <Icon size={13} />
                  <span className="hidden md:inline whitespace-nowrap">{s.label}</span>
                  <span className="md:hidden text-[8px] leading-tight text-center truncate w-full">{s.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="relative min-h-[52vh] flex flex-col items-center justify-center text-center overflow-hidden bg-primary px-6 py-20">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-widest mb-5">
              <Sparkles size={12} /> {heroSettings.badge || "Physical Health"}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-5 leading-tight">
              <span className="hidden md:block" dangerouslySetInnerHTML={{ __html: heroSettings.heading || "Body, Skills & Economic Empowerment" }} />
              <span className="md:hidden" dangerouslySetInnerHTML={{ __html: heroSettings.headingMobile || heroSettings.heading || "Body, Skills & Economic Empowerment" }} />
            </h1>
            <p className="text-white/65 text-base md:text-lg max-w-xl mx-auto">
              <span className="hidden md:block" dangerouslySetInnerHTML={{ __html: heroSettings.subtitle || "Holistic physical wellbeing alongside skills that build lasting economic independence." }} />
              <span className="md:hidden" dangerouslySetInnerHTML={{ __html: heroSettings.subtitleMobile || heroSettings.subtitle || "Holistic physical wellbeing alongside skills that build lasting economic independence." }} />
            </p>
          </motion.div>

          {/* Sub-section pills */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative z-10 flex flex-wrap justify-center gap-2 mt-8"
          >
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-semibold hover:bg-white/20 hover:text-white transition-colors"
              >
                {s.label}
              </button>
            ))}
          </motion.div>
        </section>

        {/* ── CONTENT ── */}
        <section className="py-16 px-6 md:px-12 bg-background">
          <div className="max-w-6xl mx-auto flex gap-12 items-start">
            {/* Sticky sidebar (desktop only) */}
            <aside className="hidden lg:flex flex-col gap-1 w-52 shrink-0 sticky top-32 self-start max-h-[calc(100vh-9rem)] overflow-y-auto no-scrollbar">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-3">
                Subsections
              </p>
              {sections.map((s) => {
                const Icon = s.icon;
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={14} /> {s.label}
                  </button>
                );
              })}
              <div className="mt-4 pt-4 border-t border-border">
                <Link
                  href="/programs/mental-health"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Shield size={12} /> Mental Health →
                </Link>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 flex flex-col gap-20">
              {sections.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.section
                    key={s.id}
                    id={s.id}
                    ref={(el) => { sectionRefs.current[s.id] = el; }}
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="scroll-mt-36"
                  >
                    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.bg}`}>
                        <Icon size={18} className={s.color} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${s.color}`}>
                        {s.label}
                      </span>
                    </motion.div>
                    <motion.h2 variants={fadeUp} className="text-base md:text-lg font-serif font-semibold mb-4">
                      {s.heading}
                    </motion.h2>
                    <motion.div
                      variants={fadeUp}
                      className="w-10 h-0.5 bg-primary mb-6"
                      style={{ originX: 0 }}
                    />
                    <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed text-base mb-8 max-w-2xl">
                      <span className="hidden md:block" dangerouslySetInnerHTML={{ __html: s.desc ?? "" }} />
                      <span className="md:hidden" dangerouslySetInnerHTML={{ __html: (s as { descMobile?: string }).descMobile || s.desc || "" }} />
                    </motion.p>

                    <motion.div variants={stagger} className="grid sm:grid-cols-2 gap-3 mb-8">
                      {s.bullets.map((b, bi) => (
                        <motion.div
                          key={bi}
                          variants={fadeUp}
                          className="flex items-start gap-3 bg-card border border-border rounded-xl p-4"
                        >
                          <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground leading-relaxed">{b}</span>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      variants={fadeUp}
                      className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${s.bg}`}
                    >
                      <Sparkles size={15} className={`${s.color} mt-0.5 shrink-0`} />
                      <p className={`text-sm font-semibold ${s.color}`}>{s.impact}</p>
                    </motion.div>
                  </motion.section>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-6 md:px-12 bg-primary relative overflow-hidden text-center">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-white mb-4">
              {heroSettings.ctaHeading || "Support physical health programs"}
            </h2>
            <p className="text-white/65 mb-8 text-base md:text-lg" dangerouslySetInnerHTML={{ __html: heroSettings.ctaSubtext || "Your contribution directly funds medical camps, vocational training, and more." }} />
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/get-involved"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-7 py-3 rounded-full hover:bg-white/90 transition-colors text-sm"
              >
                Get Involved <ArrowRight size={15} />
              </Link>
              <Link
                href="/programs/mental-health"
                className="inline-flex items-center gap-2 bg-transparent text-white font-bold px-7 py-3 rounded-full border-2 border-white/40 hover:border-white transition-colors text-sm"
              >
                Mental Health Program →
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Floating back-to-top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 12 }}
            transition={{ duration: 0.25 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
            aria-label="Back to top"
          >
            <ChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
