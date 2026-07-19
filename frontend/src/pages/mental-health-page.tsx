import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Megaphone, BookOpen, Users, HeartHandshake, Heart,
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
    id: "awareness-campaigns",
    icon: Megaphone,
    label: "Awareness Campaigns",
    heading: "Breaking Stigma. Starting Conversations.",
    desc: "In many communities, mental health is still a taboo topic — leaving countless people suffering in silence. Spandana's awareness campaigns meet people where they are: in schools, on streets, in community centres, creating safe spaces to simply talk.",
    bullets: [
      "Street plays (nukkad nataks) addressing mental health stigma",
      "Community rallies and public awareness drives",
      "Posters, pamphlets, and social media campaigns in Telugu and Urdu",
      "Partnerships with local schools and colleges for youth outreach",
      "Annual Mental Health Awareness Days with activities and speakers",
    ],
    impact: "Thousands of community members reached through stigma-reduction campaigns annually.",
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
  },
  {
    id: "educational-outreach",
    icon: BookOpen,
    label: "Educational Outreach",
    heading: "Teaching Communities to Recognise & Respond",
    desc: "Awareness alone is not enough — communities need tools to act. Our educational outreach programs teach ordinary people to identify signs of mental distress, respond with compassion, and connect others to appropriate care.",
    bullets: [
      "Teacher and parent training on identifying student mental health needs",
      "Youth peer-educator programs in schools and colleges",
      "Workshops for community health workers (ASHAs, anganwadi workers)",
      "Mental health first aid certification for community volunteers",
      "Resource kits and helpline information in local languages",
    ],
    impact: "Hundreds of trained community educators who carry the knowledge forward.",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  {
    id: "self-help-groups",
    icon: Users,
    label: "Self-Help Groups",
    heading: "The Power of Being Heard by Your Community",
    desc: "Healing happens in community. Spandana facilitates weekly self-help groups where members share experiences, offer mutual support, and build the emotional resilience needed to navigate life's challenges — together, without shame.",
    bullets: [
      "Weekly facilitated group sessions in communities and slum clusters",
      "Separate groups for women, youth, and elderly members",
      "Trained community facilitators to guide sessions",
      "Peer accountability and check-in systems between meetings",
      "Integration with other Spandana programs for holistic support",
    ],
    impact: "Dozens of active groups meeting weekly across Hyderabad communities.",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  {
    id: "counselling-access",
    icon: HeartHandshake,
    label: "Counselling Access",
    heading: "Professional Care, Within Reach",
    desc: "For many of the families we serve, professional mental health support feels impossibly distant — too expensive, too stigmatised, or too far away. Spandana bridges this gap by connecting families with trained counsellors who come to them.",
    bullets: [
      "Free or subsidised individual counselling sessions",
      "Empanelled counsellors from NIMHANS, Osmania University networks",
      "Home-visit counselling for homebound individuals",
      "Tele-counselling support for remote and shy beneficiaries",
      "Ongoing case management and follow-up for complex situations",
    ],
    impact: "Hundreds of counselling sessions provided annually at little or no cost.",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
  },
  {
    id: "crisis-support",
    icon: Heart,
    label: "Crisis Support",
    heading: "Safe Spaces When it Matters Most",
    desc: "Mental health crises do not wait for appointments. Spandana maintains a network of trained community responders and safe meeting spaces where individuals in distress can receive immediate, compassionate help without judgment.",
    bullets: [
      "24-hour community response network through trained volunteers",
      "Crisis de-escalation support and immediate referrals",
      "Safe house connections for domestic abuse survivors",
      "Post-crisis follow-up care and family counselling",
      "Collaboration with government mental health hotlines",
    ],
    impact: "Rapid community response to distress calls across partner neighbourhoods.",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
];

export default function MentalHealthPage() {
  const [active, setActive] = useState("awareness-campaigns");
  const [showTop, setShowTop] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [sectionOverrides, setSectionOverrides] = useState<Array<Record<string, unknown>>>([]);
  const [heroSettings, setHeroSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.mentalHealthSections) setSectionOverrides(d.mentalHealthSections);
        if (d?.mentalHealthHero) setHeroSettings(d.mentalHealthHero);
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
                      ? "bg-violet-700 text-white shadow-sm"
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
        <section className="relative min-h-[52vh] flex flex-col items-center justify-center text-center overflow-hidden bg-[#1e0a3c] px-6 py-20">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,92,246,0.18), transparent 70%)",
            }}
          />
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-xs font-bold uppercase tracking-widest mb-5">
              <Sparkles size={12} /> {heroSettings.badge || "Mental Health"}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-5 leading-tight">
              <span className="hidden md:block" dangerouslySetInnerHTML={{ __html: heroSettings.heading || "Mind, Community & Safe Spaces" }} />
              <span className="md:hidden" dangerouslySetInnerHTML={{ __html: heroSettings.headingMobile || heroSettings.heading || "Mind, Community & Safe Spaces" }} />
            </h1>
            <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto">
              <span className="hidden md:block" dangerouslySetInnerHTML={{ __html: heroSettings.subtitle || "Mental wellness is the foundation of a thriving community. We normalise conversations and provide safe spaces." }} />
              <span className="md:hidden" dangerouslySetInnerHTML={{ __html: heroSettings.subtitleMobile || heroSettings.subtitle || "Mental wellness is the foundation of a thriving community. We normalise conversations and provide safe spaces." }} />
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
                className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/65 text-xs font-semibold hover:bg-white/20 hover:text-white transition-colors"
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
                        ? "bg-violet-700 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={14} /> {s.label}
                  </button>
                );
              })}
              <div className="mt-4 pt-4 border-t border-border">
                <Link
                  href="/programs/physical-health"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Brain size={12} /> Physical Health →
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
                      className="w-10 h-0.5 bg-violet-600 mb-6"
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
                          <CheckCircle2 size={16} className="text-violet-600 mt-0.5 shrink-0" />
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
        <section className="py-20 px-6 md:px-12 bg-[#1e0a3c] relative overflow-hidden text-center">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(139,92,246,0.15), transparent 70%)",
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
              {heroSettings.ctaHeading || "Support mental health programs"}
            </h2>
            <p className="text-white/55 mb-8 text-base md:text-lg" dangerouslySetInnerHTML={{ __html: heroSettings.ctaSubtext || "Your support helps us run self-help groups, counselling sessions, and crisis response." }} />
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/get-involved"
                className="inline-flex items-center gap-2 bg-white text-violet-800 font-bold px-7 py-3 rounded-full hover:bg-white/90 transition-colors text-sm"
              >
                Get Involved <ArrowRight size={15} />
              </Link>
              <Link
                href="/programs/physical-health"
                className="inline-flex items-center gap-2 bg-transparent text-white font-bold px-7 py-3 rounded-full border-2 border-white/30 hover:border-white transition-colors text-sm"
              >
                Physical Health Program →
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
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-violet-700 text-white shadow-lg flex items-center justify-center hover:bg-violet-800 transition-colors"
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
