import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Sparkles, ArrowRight, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

interface Story {
  title: string;
  story: string;
  name: string;
  location: string;
  program: string;
  image: string;
}

const ACCENT = [
  {
    pill: "bg-pink-500/20 text-pink-300 border border-pink-500/30",
    avatar: "from-pink-500 to-rose-600",
    glow: "rgba(239,68,68,0.06)",
  },
  {
    pill: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    avatar: "from-blue-500 to-indigo-600",
    glow: "rgba(59,130,246,0.06)",
  },
  {
    pill: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    avatar: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.06)",
  },
  {
    pill: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    avatar: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.06)",
  },
];

const DEFAULT_STORIES: Story[] = [
  {
    title: "From Struggle to Strength",
    story:
      "Meena came to us with nothing — no income, no support, no hope. After enrolling in our skill development program, she learned tailoring, started her own boutique, and now employs three other women from her neighbourhood.",
    name: "Meena Devi",
    location: "Secunderabad",
    program: "Skill Development",
    image: "/images/physical.png",
  },
  {
    title: "A Family Healed",
    story:
      "After his father's death, Ravi's family spiralled into debt and depression. Spandana's mental health team and legal advocacy cell helped them reclaim their land rights and regain their footing — together.",
    name: "Ravi Kumar",
    location: "Old City, Hyderabad",
    program: "Legal & Mental Health",
    image: "/images/mental.png",
  },
  {
    title: "Health That Changed Everything",
    story:
      "Saritha had ignored a chronic condition for years because she couldn't afford doctors. Our free medical camp diagnosed and treated her in a single day. She calls it the day her second life began.",
    name: "Saritha P.",
    location: "Begumpet",
    program: "Medical Aid",
    image: "/images/hero.png",
  },
];

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<Story[]>(DEFAULT_STORIES);
  const [sp, setSp] = useState<any>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.successStories?.length) setStories(d.successStories);
        setSp(d.successStoriesPage ?? {});
      })
      .catch(() => {});
  }, []);

  const badge = sp?.badge ?? "Success Stories";
  const heroHeading = sp?.heroHeading ?? "Real people.";
  const heroSub = sp?.heroSub ?? "Real change.";
  const ctaHeading = sp?.ctaHeading ?? "Every story starts with a single step.";
  const ctaDesc =
    sp?.ctaDesc ?? "Your support makes stories like these possible every single day.";
  const ctaButton1 = sp?.ctaButton1 ?? "Get Involved";
  const ctaButton2 = sp?.ctaButton2 ?? "Donate Now";

  return (
    <>
      <Nav />
      <main className="pt-20">
        {/* ── HERO ── */}
        <section className="relative flex flex-col items-center justify-center text-center overflow-hidden bg-[#05091A] px-6 py-14 md:py-24 md:min-h-[52vh]">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(239,68,68,0.07), transparent 70%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 border border-white/15 text-white/70 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={12} /> {badge}
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-medium text-white mb-2 leading-tight">
              {heroHeading}
            </h1>
            <h1 className="text-4xl md:text-6xl font-serif italic text-white/40 leading-tight mb-6">
              {heroSub}
            </h1>
            <p className="text-white/55 text-base md:text-lg max-w-xl mx-auto">
              Behind every statistic is a name, a family, a turning point. These are their stories.
            </p>
          </motion.div>

          {/* Story count pill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            {stories.length} stories of impact
          </motion.div>
        </section>

        {/* ── STORIES GRID ── */}
        <section className="py-20 px-6 md:px-12 bg-[#05091A]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((s, i) => {
              const c = ACCENT[i % ACCENT.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden flex flex-col hover:border-white/20 transition-colors group cursor-default"
                  style={{ boxShadow: `0 0 60px ${c.glow}` }}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={s.image || "/images/hero.png"}
                      alt={s.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05091A]/80 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${c.pill}`}
                      >
                        {s.program}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-6 gap-4">
                    <h3 className="text-xl font-serif font-medium text-white leading-snug">
                      {s.title}
                    </h3>
                    <div className="flex-1">
                      <div style={expanded.has(i) ? {} : { height: "4.25rem", overflow: "hidden" }}>
                        {s.story && s.story.startsWith("<")
                          ? <div className="text-white/55 text-sm leading-relaxed rte-story-output" dangerouslySetInnerHTML={{ __html: s.story }} />
                          : <p className="text-white/55 text-sm leading-relaxed">{s.story}</p>
                        }
                      </div>
                      <button
                        onClick={() => setExpanded(prev => {
                          const next = new Set(prev);
                          next.has(i) ? next.delete(i) : next.add(i);
                          return next;
                        })}
                        className="mt-1.5 flex items-center gap-1 text-[11px] text-white/30 hover:text-white/55 transition-colors cursor-pointer select-none"
                      >
                        {expanded.has(i)
                          ? <><ChevronUp size={11} /> Read less</>
                          : <><ChevronDown size={11} /> Read more</>
                        }
                      </button>
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.avatar} text-white font-bold text-sm flex items-center justify-center shrink-0`}
                      >
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{s.name}</p>
                        <p className="text-white/35 text-xs flex items-center gap-1">
                          <MapPin size={10} /> {s.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-widest mb-4">
              <Heart size={12} /> Make a Difference
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-4">
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
