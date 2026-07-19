import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

interface Story {
  title: string;
  story: string;
  name: string;
  location: string;
  program: string;
  image: string;
}

interface Props {
  vision: { heading: string; content: string };
  mission: { heading: string; content: string };
  stories: Story[];
  videoId: string;
  caption: string;
  mobileSlot?: React.ReactNode;
  showVideoMobile?: boolean;
}

const ACCENT = [
  { pill: "bg-pink-500/20 text-pink-300 border-pink-500/30", dot: "bg-pink-400", glow: "rgba(239,68,68,0.15)" },
  { pill: "bg-blue-500/20 text-blue-300 border-blue-500/30", dot: "bg-blue-400", glow: "rgba(59,130,246,0.15)" },
  { pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400", glow: "rgba(16,185,129,0.15)" },
  { pill: "bg-amber-500/20 text-amber-300 border-amber-500/30", dot: "bg-amber-400", glow: "rgba(245,158,11,0.15)" },
];

const DEFAULT_STORIES: Story[] = [
  { title: "From Struggle to Strength", story: "Meena came to us with nothing — no income, no support, no hope. After enrolling in our skill development program, she learned tailoring, started her own boutique, and now employs three other women.", name: "Meena Devi", location: "Secunderabad", program: "Skill Development", image: "/images/physical.png" },
  { title: "A Family Healed", story: "After his father's death, Ravi's family spiralled into debt and depression. Spandana's mental health team and legal advocacy cell helped them reclaim their land rights and regain their footing.", name: "Ravi Kumar", location: "Old City, Hyderabad", program: "Legal & Mental Health", image: "/images/mental.png" },
  { title: "Health That Changed Everything", story: "Saritha had ignored a chronic condition for years because she couldn't afford doctors. Our free medical camp diagnosed and treated her in a single day — the day her second life began.", name: "Saritha P.", location: "Begumpet", program: "Medical Aid", image: "/images/hero.png" },
];

function InlineCarousel({ stories }: { stories: Story[] }) {
  const list = stories.length ? stories : DEFAULT_STORIES;
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (next: number, d: number) => {
    setDir(d);
    setCur((next + list.length) % list.length);
  };

  useEffect(() => { setCur(0); }, [list.length]);
  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => go(cur + 1, 1), 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [cur, list.length, paused]);

  const st = list[cur];
  const c = ACCENT[cur % ACCENT.length];

  return (
    <div className="flex flex-col h-full">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/15 text-white/50 text-xs font-bold uppercase tracking-widest mb-4 self-start">
        Success Stories
      </div>

      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={`glow-${cur}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${c.glow}, transparent 70%)` }} />
        </AnimatePresence>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={cur} custom={dir}
            initial={{ opacity: 0, x: dir * 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative">
            <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border mb-3 ${c.pill}`}>{st.program}</span>

            <h3 className="text-base md:text-lg font-serif font-medium text-white mb-1.5 leading-snug">{st.title}</h3>
            <p className="text-white/55 text-xs md:text-sm leading-relaxed mb-3">{st.story}</p>

            <div className="flex items-center gap-2.5 pt-2.5 border-t border-white/10">
              <div className="w-7 h-7 rounded-lg bg-primary/60 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {st.name[0]}
              </div>
              <div>
                <p className="text-white text-xs font-semibold">{st.name}</p>
                <p className="text-white/35 text-xs">{st.location}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
        <div className="flex gap-1.5">
          {list.map((_, i) => (
            <button key={i} onClick={() => go(i, i > cur ? 1 : -1)}
              className={`rounded-full transition-all duration-300 ${i === cur ? `w-5 h-1.5 ${c.dot}` : "w-1.5 h-1.5 bg-white/20"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => go(cur - 1, -1)}
            className="w-8 h-8 rounded-full bg-white/8 border border-white/15 flex items-center justify-center hover:bg-white/15 transition-colors">
            <ChevronLeft size={15} className="text-white/60" />
          </button>
          <button onClick={() => setPaused(p => !p)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${paused ? "bg-white/20 border-white/30 hover:bg-white/25" : "bg-white/8 border-white/15 hover:bg-white/15"}`}>
            {paused ? <Play size={13} className="ml-0.5 text-white/80" /> : <Pause size={13} className="text-white/60" />}
          </button>
          <button onClick={() => go(cur + 1, 1)}
            className="w-8 h-8 rounded-full bg-white/8 border border-white/15 flex items-center justify-center hover:bg-white/15 transition-colors">
            <ChevronRight size={15} className="text-white/60" />
          </button>
        </div>
      </div>
    </div>
  );
}

function InlineVideoPlayer({ videoId, caption }: { videoId: string; caption: string }) {
  const [playing, setPlaying] = useState(false);
  const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "/images/center.png";

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/15 text-white/50 text-xs font-bold uppercase tracking-widest mb-4">
        Watch Our Story
      </div>
      <motion.div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#05091A] group" style={{ aspectRatio: "16/9" }}
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        {playing && videoId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
            title="Spandana story" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen className="absolute inset-0 w-full h-full" />
        ) : (
          <>
            <img src={thumb} alt="Watch our story" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05091A]/70 via-[#05091A]/20 to-transparent" />
            {videoId && (
              <button onClick={() => setPlaying(true)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 group/btn">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center backdrop-blur-sm group-hover/btn:bg-white/30 transition-colors shadow-2xl">
                  <Play size={20} className="ml-1 text-white" fill="white" />
                </motion.div>
                <span className="text-white/70 text-xs font-medium tracking-wide">{caption}</span>
              </button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VisionMissionBlock({ vision, mission, stories, videoId, caption, mobileSlot, showVideoMobile = true }: Props) {
  const [mobileTab, setMobileTab] = useState<"vision" | "mission">("vision");

  return (
    <section id="vision" className="scroll-mt-20 py-5 md:py-20 px-6 md:px-12 relative overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.022]"
        style={{ backgroundImage: "radial-gradient(circle, #0033A0 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-6 md:gap-14 items-stretch">

        {/* ── LEFT: Vision + Mission ── */}
        <div className="flex flex-col justify-center gap-0">

          {/* Mobile tab switcher — hidden on desktop */}
          <div className="flex md:hidden rounded-2xl bg-card border border-border p-1 mb-4 gap-1">
            {(["vision", "mission"] as const).map((tab) => (
              <button key={tab} onClick={() => setMobileTab(tab)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${mobileTab === tab ? "bg-primary text-white shadow-sm" : "text-muted-foreground"}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Vision */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className={`p-5 md:p-10 rounded-3xl bg-card border border-border/60 hover:border-primary/20 transition-colors ${mobileTab !== "vision" ? "hidden md:block" : ""}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Our Vision
            </div>
            <h2 className="text-xl md:text-3xl font-serif font-medium mb-3 text-foreground leading-snug">{vision.heading}</h2>
            <motion.div className="w-12 h-0.5 bg-primary mb-4" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} style={{ originX: 0 }} />
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{vision.content}</p>
          </motion.div>

          {/* Connector line — desktop only */}
          <div className="hidden md:flex items-center justify-center py-3 px-10">
            <motion.div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} />
          </div>

          {/* Mission */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
            className={`p-5 md:p-10 rounded-3xl bg-card border border-border/60 hover:border-primary/20 transition-colors ${mobileTab !== "mission" ? "hidden md:block" : ""}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Our Mission
            </div>
            <h2 className="text-xl md:text-3xl font-serif font-medium mb-3 text-foreground leading-snug">{mission.heading}</h2>
            <motion.div className="w-12 h-0.5 bg-primary mb-4" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.35 }} style={{ originX: 0 }} />
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{mission.content}</p>
          </motion.div>
        </div>

        {/* ── MOBILE SLOT — rendered between Vision/Mission and Success Stories on mobile ── */}
        {mobileSlot && (
          <div className="md:hidden -mx-6 px-0">
            {mobileSlot}
          </div>
        )}

        {/* ── RIGHT: Success Stories + Video ── */}
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
          className="flex flex-col gap-0 rounded-3xl overflow-hidden bg-[#05091A]">

          {/* Video — first on mobile, second on desktop */}
          <div className={`order-1 md:order-2 p-5 md:p-8${!showVideoMobile ? " max-md:hidden" : ""}`}>
            <InlineVideoPlayer videoId={videoId} caption={caption} />
          </div>

          {/* Divider */}
          <div className={`order-2 md:order-none mx-5 md:mx-8 h-px bg-white/8${!showVideoMobile ? " max-md:hidden" : ""}`} />

          {/* Success stories carousel — second on mobile, first on desktop */}
          <div className="order-3 md:order-1 flex-1 p-5 md:p-8">
            <InlineCarousel stories={stories} />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
