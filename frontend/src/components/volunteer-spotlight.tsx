import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Star, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VolunteerSpotlightProps {
  volunteers?: Volunteer[];
  onVolunteerClick?: () => void;
}

interface Volunteer { name: string; role: string; years: string; quote: string; hours: string; program: string; }

const VOL_STYLES = [
  { color: "bg-pink-500",    badge: "bg-pink-500/20 text-pink-300",       glow: "rgba(236,72,153,0.15)" },
  { color: "bg-violet-500",  badge: "bg-violet-500/20 text-violet-300",   glow: "rgba(139,92,246,0.15)" },
  { color: "bg-emerald-500", badge: "bg-emerald-500/20 text-emerald-300", glow: "rgba(16,185,129,0.15)" },
  { color: "bg-amber-500",   badge: "bg-amber-500/20 text-amber-300",     glow: "rgba(245,158,11,0.15)" },
];

const DEFAULT_VOLUNTEERS: Volunteer[] = [
  { name: "Priya Reddy",   role: "Healthcare Volunteer",  years: "3 years", quote: "Every camp we run, I see people cry with relief. Not because they got medicine — but because someone showed up for them.", hours: "450+", program: "Medical Aid" },
  { name: "Arjun Sharma",  role: "Skills Trainer",        years: "5 years", quote: "I taught tailoring to 40 women last year. Two of them now run their own boutiques. That's what this is all about.", hours: "900+", program: "Skill Development" },
  { name: "Fatima Khan",   role: "Community Counselor",   years: "2 years", quote: "Mental health is still taboo here. But week by week, the self-help groups are changing that. I'm proud to be part of it.", hours: "280+", program: "Mental Health" },
  { name: "Vikram Nair",   role: "Legal Aid Volunteer",   years: "4 years", quote: "I've helped 60 families navigate the legal system. Most of them didn't even know they had rights. Now they do.", hours: "600+", program: "Legal Advocacy" },
];

interface VolSpotlightCms { badge?: string; heading?: string; headingItalic?: string; ctaLabel?: string; ctaUrl?: string; }

export default function VolunteerSpotlight({ volunteers = DEFAULT_VOLUNTEERS, onVolunteerClick }: VolunteerSpotlightProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cms, setCms] = useState<VolSpotlightCms>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d?.volunteerSpotlight) setCms(d.volunteerSpotlight); })
      .catch(() => {});
  }, []);
  const v = volunteers[current] ?? volunteers[0];
  const style = VOL_STYLES[current % VOL_STYLES.length];
  const isPlaying = !paused && !hovered;

  useEffect(() => { setCurrent(0); }, [volunteers]);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % volunteers.length), 5000);
    return () => clearInterval(t);
  }, [volunteers, isPlaying]);

  if (!v) return null;

  return (
    <section className="py-14 md:py-24 px-6 md:px-12 bg-[#05091A] relative overflow-hidden">
      {/* Ambient glow that shifts with the volunteer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`glow-${current}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${style.glow}, transparent 70%)` }}
        />
      </AnimatePresence>

      {/* Subtle grid texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-8 md:mb-14">
          {/* Mobile: CTA button replaces the heading */}
          <div className="md:hidden flex justify-center mb-4">
            {onVolunteerClick ? (
              <Button size="lg" onClick={onVolunteerClick}
                className="rounded-full h-11 px-7 font-semibold gap-2 bg-white text-[#05091A] hover:bg-white/90 border-0">
                {cms.ctaLabel ?? "Become a Volunteer"} <ArrowRight size={15} />
              </Button>
            ) : (
              <Button asChild size="lg"
                className="rounded-full h-11 px-7 font-semibold gap-2 bg-white text-[#05091A] hover:bg-white/90 border-0">
                <Link href={cms.ctaUrl ?? "/join-us"}>
                  {cms.ctaLabel ?? "Become a Volunteer"} <ArrowRight size={15} />
                </Link>
              </Button>
            )}
          </div>
          {/* Desktop: badge + heading */}
          <div className="hidden md:block">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
              {cms.badge ?? "Volunteer Spotlight"}
            </div>
            <h2 className="text-base md:text-4xl font-serif font-medium text-white whitespace-nowrap">
              {cms.heading ?? "Meet the people"} <span className="italic text-white/50">{cms.headingItalic ?? "behind the change."}</span>
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 md:gap-14 items-start">

          {/* LEFT — volunteer cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
            {/* Selector boxes — desktop only */}
            <div className="hidden md:grid md:col-span-2 md:grid-cols-1 gap-3">
              {volunteers.map((vol, i) => {
                const s = VOL_STYLES[i % VOL_STYLES.length];
                return (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 text-left ${current === i ? "border-white/30 bg-white/8" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}>
                    <div className={`w-9 h-9 rounded-full ${s.color} text-white text-sm font-bold flex items-center justify-center shrink-0`}>
                      {vol.name[0]}
                    </div>
                    <div className="block min-w-0">
                      <div className="text-sm font-semibold text-white leading-tight truncate">{vol.name}</div>
                      <div className="text-xs text-white/40">{vol.years}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="md:col-span-3 relative min-h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div key={current}
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-10 flex flex-col gap-5 md:gap-8 h-full cursor-default"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}>

                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl ${style.color} text-white text-2xl font-bold flex items-center justify-center shrink-0 shadow-lg`}>
                      {v.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{v.name}</h3>
                      <div className="text-sm text-white/50">{v.role}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${style.badge}`}>{v.program}</span>
                        <span className="text-xs text-white/35 font-medium whitespace-nowrap">{v.years}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-base md:text-lg text-white/75 leading-relaxed md:leading-loose italic flex-1">"{v.quote}"</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-sm text-white/50">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="font-bold text-white">{v.hours} hours</span> volunteered
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {volunteers.map((_, i) => (
                          <button key={i} onClick={() => setCurrent(i)}
                            className={`h-2 rounded-full transition-all ${i === current ? "bg-white w-5" : "w-2 bg-white/20"}`} />
                        ))}
                      </div>
                      <button
                        onClick={() => setPaused(p => !p)}
                        aria-label={paused ? "Resume auto-play" : "Pause auto-play"}
                        className="w-6 h-6 rounded-full bg-white/8 border border-white/15 flex items-center justify-center hover:bg-white/15 transition-colors"
                      >
                        {paused
                          ? <Play size={10} className="text-white/60 ml-0.5" />
                          : <Pause size={10} className="text-white/60" />
                        }
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT — CTA text — desktop only */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="hidden md:block text-center md:text-left mt-8 md:mt-0">
            <h3 className="text-2xl md:text-3xl font-serif font-medium text-white mb-4">
              Don't just care. <span className="italic text-white/60">Show up.</span>
            </h3>
            <p className="text-white/45 text-sm md:text-base mb-6 leading-loose">
              Your 2 hours a week could be<br />
              someone's turning point.<br />
              No experience needed —<br />
              <span className="text-white/70 font-medium not-italic">Just the will to make a difference.</span>
            </p>
            <Button asChild size="lg"
              className="rounded-full h-12 px-8 font-semibold gap-2 bg-white text-[#05091A] hover:bg-white/90 border-0">
              <Link href="/join-us">
                Become a Volunteer <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
