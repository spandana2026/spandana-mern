import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Target, Heart, Users, ArrowRight, Sparkles, BookOpen, Scale } from "lucide-react";
import { Link } from "wouter";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

interface Settings {
  vision: { heading: string; content: string };
  mission: { heading: string; content: string };
  stats: Array<{ number: string; label: string }>;
  visionPage?: {
    badge?: string;
    heroHeading?: string;
    heroSub?: string;
    ctaHeading?: string;
    ctaDesc?: string;
    ctaButton1?: string;
    ctaButton2?: string;
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

const PILLARS = [
  {
    icon: Heart,
    title: "Health & Dignity",
    desc: "Ensuring every person gets the medical care and respect they deserve, regardless of income.",
  },
  {
    icon: Users,
    title: "Community Unity",
    desc: "Building lasting bonds through self-help groups, cultural exchange, and shared purpose.",
  },
  {
    icon: Scale,
    title: "Economic Freedom",
    desc: "Equipping families with skills, legal knowledge, and opportunities to become self-reliant.",
  },
  {
    icon: BookOpen,
    title: "Permanent Change",
    desc: "Going beyond temporary relief to create systemic shifts that last generations.",
  },
];

export default function VisionPage() {
  const [s, setS] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setS)
      .catch(() => {});
  }, []);

  const vision = s?.vision ?? {
    heading: "Our Vision",
    content:
      "We envision a society where every individual—regardless of background—has access to fundamental rights, health, and dignity. Through sustainable Social Architecture, we foster permanent change rather than temporary relief.",
  };
  const mission = s?.mission ?? {
    heading: "Our Mission",
    content:
      "To uplift underserved families through a multi-dimensional approach centered on Physical and Mental Health, bridging the gap between resources and those in need through inclusive, secular, and practical community engagement.",
  };
  const stats = s?.stats ?? [
    { number: "25+", label: "Years of Service" },
    { number: "10,000+", label: "Families Supported" },
    { number: "5", label: "Active Programs" },
    { number: "300+", label: "Annual Volunteers" },
  ];
  const vp = s?.visionPage ?? {};
  const badge = vp.badge ?? "Vision & Mission";
  const heroHeading = vp.heroHeading ?? "The purpose that";
  const heroSub = vp.heroSub ?? "drives everything we do.";
  const ctaHeading = vp.ctaHeading ?? "Ready to be part of the change?";
  const ctaDesc =
    vp.ctaDesc ?? "Join Spandana's mission to create lasting change in underserved communities.";
  const ctaButton1 = vp.ctaButton1 ?? "Get Involved";
  const ctaButton2 = vp.ctaButton2 ?? "Donate Now";

  return (
    <>
      <Nav />
      <main className="pt-20">
        {/* ── HERO ── */}
        <section className="relative min-h-[55vh] flex flex-col items-center justify-center text-center overflow-hidden bg-primary px-6 py-20">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <motion.div
            className="absolute top-12 left-16 text-[180px] font-serif text-white/[0.04] select-none leading-none pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            V
          </motion.div>
          <motion.div
            className="absolute bottom-8 right-16 text-[140px] font-serif text-white/[0.04] select-none leading-none pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            M
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={12} /> {badge}
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-medium text-white mb-2 leading-tight">
              {heroHeading}
            </h1>
            <h1 className="text-3xl md:text-5xl font-serif italic text-white/50 leading-tight mb-6">
              {heroSub}
            </h1>
            <p className="text-white/65 text-base md:text-lg max-w-xl mx-auto">
              25 years of purposeful action — grounded in a clear vision, driven by a lived mission.
            </p>
          </motion.div>
        </section>

        {/* ── VISION & MISSION CARDS ── */}
        <section className="py-20 px-6 md:px-12 bg-background relative overflow-hidden">
          <div className="absolute -top-32 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-3xl border border-border bg-card p-8 md:p-10 flex flex-col gap-5 hover:border-primary/25 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Eye size={22} className="text-primary" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-bold uppercase tracking-widest self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Our Vision
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground">
                {vision.heading}
              </h2>
              <motion.div
                className="w-10 h-0.5 bg-primary"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ originX: 0 }}
              />
              <p className="text-muted-foreground leading-relaxed text-base">{vision.content}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="rounded-3xl border border-border bg-card p-8 md:p-10 flex flex-col gap-5 hover:border-primary/25 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Target size={22} className="text-primary" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-bold uppercase tracking-widest self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Our Mission
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground">
                {mission.heading}
              </h2>
              <motion.div
                className="w-10 h-0.5 bg-primary"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.35 }}
                style={{ originX: 0 }}
              />
              <p className="text-muted-foreground leading-relaxed text-base">{mission.content}</p>
            </motion.div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="py-14 px-6 md:px-12 bg-primary">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {stats.map((st, i) => (
              <motion.div key={i} variants={fadeUp}>
                <p className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">
                  {st.number}
                </p>
                <p className="text-white/60 text-sm uppercase tracking-widest font-medium">
                  {st.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── PILLARS ── */}
        <section className="py-20 px-6 md:px-12 bg-card">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                How We Work
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-medium">
                The four pillars of our work
              </h2>
            </motion.div>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {PILLARS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    whileHover={{ y: -6, boxShadow: "0 20px 56px rgba(0,51,160,0.10)" }}
                    className="bg-background border border-border rounded-2xl p-6 flex flex-col gap-4 cursor-default group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-foreground text-base">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
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
              {ctaHeading}
            </h2>
            <p className="text-white/65 mb-8 text-base md:text-lg" dangerouslySetInnerHTML={{ __html: ctaDesc }} />
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/get-involved"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-7 py-3 rounded-full hover:bg-white/90 transition-colors text-sm"
              >
                {ctaButton1} <ArrowRight size={15} />
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 bg-transparent text-white font-bold px-7 py-3 rounded-full border-2 border-white/40 hover:border-white transition-colors text-sm"
              >
                {ctaButton2}
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
