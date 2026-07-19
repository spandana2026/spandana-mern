import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, Brain, ArrowRight, Sparkles,
  HeartHandshake, Stethoscope, BookOpen, Scale,
  Leaf, Megaphone, Users, Heart, ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const PHYSICAL_SUBS = [
  { icon: Stethoscope, label: "Medical Aid" },
  { icon: BookOpen, label: "Skill Development" },
  { icon: Users, label: "Entrepreneur Initiatives" },
  { icon: Scale, label: "Legal Advocacy" },
  { icon: Leaf, label: "Environmental Stewardship" },
];

const MENTAL_SUBS = [
  { icon: Megaphone, label: "Awareness Campaigns" },
  { icon: BookOpen, label: "Educational Outreach" },
  { icon: Users, label: "Self-Help Groups" },
  { icon: HeartHandshake, label: "Counselling Access" },
  { icon: Heart, label: "Crisis Support" },
];

const STATS = [
  { number: "25+", label: "Years of service" },
  { number: "10,000+", label: "Families reached" },
  { number: "2", label: "Core programs" },
  { number: "10", label: "Program subsections" },
];

interface Settings {
  programsSection?: { title?: string; subtitle?: string; };
}

interface HealthProgram {
  id: string; title: string; description: string;
  pillar: "physical" | "mental" | "community"; status: string;
  image: string; published: boolean; order: number;
}

interface CommunityInitiative {
  id: string; title: string; description: string;
  icon: string; image: string; status: string; published: boolean; order: number;
}

export default function Programs() {
  const [s, setS] = useState<Settings>({});
  const [programs, setPrograms] = useState<HealthProgram[]>([]);
  const [initiatives, setInitiatives] = useState<CommunityInitiative[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: Settings) => setS(d))
      .catch(() => {});
    fetch("/api/programs")
      .then((r) => r.json())
      .then((d: HealthProgram[]) => setPrograms(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch("/api/initiatives")
      .then((r) => r.json())
      .then((d: CommunityInitiative[]) => setInitiatives(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const title = s.programsSection?.title ?? "Our Programs";
  const subtitle =
    s.programsSection?.subtitle ??
    "A multi-dimensional approach to community upliftment — caring for the body, the mind, and the whole person.";

  return (
    <>
      <Nav />
      <main className="pt-20">
        {/* ── HERO ── */}
        <section className="relative min-h-[56vh] flex flex-col items-center justify-center text-center overflow-hidden bg-primary px-6 py-24">
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={12} /> 25+ Years of Impact
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-white mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </motion.div>

          {/* Two pill links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative z-10 flex flex-wrap gap-3 mt-10 justify-center"
          >
            <Link
              href="/programs/physical-health"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-primary font-bold text-sm hover:bg-white/90 transition-colors"
            >
              <Shield size={14} /> Physical Health <ChevronRight size={13} />
            </Link>
            <Link
              href="/programs/mental-health"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 border border-white/30 text-white font-bold text-sm hover:bg-white/20 transition-colors"
            >
              <Brain size={14} /> Mental Health <ChevronRight size={13} />
            </Link>
          </motion.div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="py-10 bg-foreground/[0.03] border-y border-border">
          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {STATS.map((st, i) => (
              <motion.div key={i} variants={fadeUp}>
                <p className="text-2xl md:text-3xl font-serif font-bold text-primary">{st.number}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1 font-medium">{st.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── TWO PROGRAM CARDS ── */}
        <section className="py-20 px-6 md:px-12 bg-background">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                Two Core Pillars
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-medium">
                Where we focus our energy
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Physical Health Card */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="group relative rounded-3xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8 md:p-10 flex flex-col h-full relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Shield size={26} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Program 01</div>
                      <h3 style={{ fontSize: "11px" }} className="font-serif font-bold tracking-wide">Physical Health</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                    Holistic physical wellbeing alongside skills that build lasting economic independence — from free medical camps to vocational training and legal support.
                  </p>
                  {/* Subsection chips */}
                  <div className="hidden md:flex flex-wrap gap-2 mb-8">
                    {PHYSICAL_SUBS.map((sub, i) => {
                      const Icon = sub.icon;
                      return (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-semibold">
                          <Icon size={11} /> {sub.label}
                        </span>
                      );
                    })}
                  </div>
                  <Link
                    href="/programs/physical-health#medical-aid"
                    className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary/90 transition-colors text-sm self-start"
                  >
                    Explore Program <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>

              {/* Mental Health Card */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="group relative rounded-3xl overflow-hidden border border-border bg-card hover:border-purple-400/30 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-8 md:p-10 flex flex-col h-full relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                      <Brain size={26} className="text-purple-700" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-1">Program 02</div>
                      <h3 style={{ fontSize: "11px" }} className="font-serif font-bold tracking-wide">Mental Health</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                    Mental wellness is the foundation of a thriving community. We normalise conversations, provide safe spaces, and connect families with the care they deserve.
                  </p>
                  {/* Subsection chips */}
                  <div className="hidden md:flex flex-wrap gap-2 mb-8">
                    {MENTAL_SUBS.map((sub, i) => {
                      const Icon = sub.icon;
                      return (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold">
                          <Icon size={11} /> {sub.label}
                        </span>
                      );
                    })}
                  </div>
                  <Link
                    href="/programs/mental-health#awareness-campaigns"
                    className="inline-flex items-center gap-2 bg-purple-700 text-white font-bold px-6 py-3 rounded-full hover:bg-purple-800 transition-colors text-sm self-start"
                  >
                    Explore Program <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── ACTIVE PROGRAMS (from CMS) ── */}
        {(programs.length > 0 || initiatives.length > 0) && (
          <section className="py-16 px-6 md:px-12 bg-foreground/[0.02] border-t border-border">
            <div className="max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                  Active Programs
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-medium">What we are running today</h2>
                <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl mx-auto">Programs and initiatives currently active in our communities.</p>
              </motion.div>

              {programs.length > 0 && (
                <div className="mb-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-5">Health Programs</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {programs.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.45 }}
                        className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
                        {p.image && <div className="h-36 overflow-hidden"><img src={p.image} alt={p.title} className="w-full h-full object-cover" /></div>}
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${p.pillar === "mental" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-primary/8 text-primary border-primary/15"}`}>{p.pillar}</span>
                            {p.status === "active" && <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active</span>}
                          </div>
                          <h3 className="font-serif font-semibold text-sm leading-snug text-foreground">{p.title}</h3>
                          {p.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{p.description}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {initiatives.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-5">Community Initiatives</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {initiatives.map((item, i) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.45 }}
                        className="bg-card border border-border rounded-2xl overflow-hidden hover:border-purple-300/50 transition-colors">
                        {item.image && <div className="h-36 overflow-hidden"><img src={item.image} alt={item.title} className="w-full h-full object-cover" /></div>}
                        <div className="p-5">
                          <div className="text-2xl mb-2">{item.icon}</div>
                          <h3 className="font-serif font-semibold text-sm leading-snug text-foreground">{item.title}</h3>
                          {item.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>}
                          {item.status === "active" && <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

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
              Want to support these programs?
            </h2>
            <p className="text-white/65 mb-8 text-base md:text-lg">
              Volunteer your time, donate resources, or spread the word. Every action creates ripples of change.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/get-involved"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-7 py-3 rounded-full hover:bg-white/90 transition-colors text-sm"
              >
                Get Involved <ArrowRight size={15} />
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 bg-transparent text-white font-bold px-7 py-3 rounded-full border-2 border-white/40 hover:border-white transition-colors text-sm"
              >
                Donate Now
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
