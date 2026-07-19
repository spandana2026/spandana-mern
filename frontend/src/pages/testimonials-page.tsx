import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  program: string;
}

const COLORS = [
  {
    glow: "rgba(239,68,68,0.07)",
    avatar: "from-pink-500 to-rose-600",
    badge: "bg-pink-500/20 text-pink-300 border border-pink-500/30",
  },
  {
    glow: "rgba(59,130,246,0.07)",
    avatar: "from-blue-500 to-indigo-600",
    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  },
  {
    glow: "rgba(16,185,129,0.07)",
    avatar: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  },
  {
    glow: "rgba(245,158,11,0.07)",
    avatar: "from-amber-500 to-orange-600",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  },
];

const DEFAULT: Testimonial[] = [
  {
    quote:
      "I was struggling to afford medicine for my children. Spandana's medical camp not only gave us free treatment — it gave us hope. Now I know we're not alone.",
    name: "Lakshmi M.",
    location: "Hyderabad",
    program: "Medical Aid",
  },
  {
    quote:
      "After the skill development training, I got my first real job at 34. My family finally has stability. I never thought it was possible — Spandana showed me it was.",
    name: "Raju K.",
    location: "Secunderabad",
    program: "Skill Development",
  },
  {
    quote:
      "The self-help group changed everything. I stopped feeling ashamed of asking for help. 25 women in our circle now support each other every single week.",
    name: "Anjali S.",
    location: "Begumpet",
    program: "Mental Health",
  },
  {
    quote:
      "They helped me navigate a legal dispute I didn't even know I had rights over. I kept my land. I kept my family's future. No words can describe what that means.",
    name: "Mohammed I.",
    location: "Old City",
    program: "Legal Advocacy",
  },
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT);
  const [tp, setTp] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.testimonials?.length) setTestimonials(d.testimonials);
        setTp(d.testimonialsPage ?? {});
      })
      .catch(() => {});
  }, []);

  const badge = tp?.badge ?? "Testimonials";
  const heroHeading = tp?.heroHeading ?? "Lives changed.";
  const heroSub = tp?.heroSub ?? "In their own words.";
  const ctaHeading = tp?.ctaHeading ?? "Be part of the next story.";
  const ctaDesc =
    tp?.ctaDesc ?? "Your involvement could be the turning point for someone else's story.";
  const ctaButton1 = tp?.ctaButton1 ?? "Get Involved";
  const ctaButton2 = tp?.ctaButton2 ?? "Donate Now";

  return (
    <>
      <Nav />
      <main className="pt-20">
        {/* ── HERO ── */}
        <section className="relative flex flex-col items-center justify-center text-center overflow-hidden bg-[#05091A] px-6 py-14 md:py-24 md:min-h-[52vh]">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
              backgroundSize: "40px 40px",
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
            <h1 className="text-3xl md:text-5xl font-serif font-medium text-white mb-2 leading-tight">
              {heroHeading}
            </h1>
            <h1 className="text-3xl md:text-5xl font-serif italic text-white/40 leading-tight mb-6">
              {heroSub}
            </h1>
            <p className="text-white/55 text-base md:text-lg max-w-xl mx-auto">
              Every voice here represents a family transformed, a community strengthened.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {testimonials.length} voices of impact
          </motion.div>
        </section>

        {/* ── TESTIMONIALS GRID ── */}
        <section className="py-20 px-6 md:px-12 bg-[#05091A]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => {
              const c = COLORS[i % COLORS.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (i % 2) * 0.12 }}
                  className="bg-white/[0.04] border border-white/10 rounded-3xl p-7 md:p-9 flex flex-col gap-5 hover:border-white/20 transition-colors cursor-default"
                  style={{ boxShadow: `0 0 60px ${c.glow}` }}
                >
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white/80 text-base md:text-lg leading-relaxed italic flex-1">
                    "{t.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    {/* Mobile: slim gradient bar accent */}
                    <div className={`block md:hidden w-1 self-stretch rounded-full bg-gradient-to-b ${c.avatar} shrink-0`} />
                    {/* Desktop: avatar square */}
                    <div className={`hidden md:flex w-10 h-10 rounded-xl bg-gradient-to-br ${c.avatar} text-white font-bold text-sm items-center justify-center shrink-0 shadow-lg`}>
                      {t.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      {(() => {
                        const parts = t.program.split("—").map(p => p.trim());
                        return (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-white text-sm leading-snug">{t.name}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md text-right shrink-0 ${c.badge}`}>{parts[0]}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className="text-white/35 text-xs shrink-0">{t.location}</p>
                              {parts[1] && <span className={`text-xs font-bold px-2 py-0.5 rounded-md text-right shrink-0 ${c.badge}`}>{parts[1]}</span>}
                            </div>
                          </>
                        );
                      })()}
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
              <MessageCircle size={12} /> Join the Community
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
