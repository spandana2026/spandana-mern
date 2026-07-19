import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Pause, Play } from "lucide-react";

interface Story { quote: string; name: string; location: string; program: string; }

const PROGRAM_COLORS = [
  { glow: "rgba(239,68,68,0.15)",  avatar: "from-pink-500 to-rose-600",    badge: "bg-pink-500/20 text-pink-300 border border-pink-500/30",   dot: "bg-pink-400"    },
  { glow: "rgba(59,130,246,0.15)", avatar: "from-blue-500 to-indigo-600",   badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",    dot: "bg-blue-400"    },
  { glow: "rgba(16,185,129,0.15)", avatar: "from-emerald-500 to-teal-600",  badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", dot: "bg-emerald-400" },
  { glow: "rgba(245,158,11,0.15)", avatar: "from-amber-500 to-orange-600",  badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",  dot: "bg-amber-400"   },
];

const DEFAULT_STORIES: Story[] = [
  { quote: "I was struggling to afford medicine for my children. Spandana's medical camp not only gave us free treatment — it gave us hope. Now I know we're not alone.", name: "Lakshmi M.", location: "Hyderabad", program: "Medical Aid" },
  { quote: "After the skill development training, I got my first real job at 34. My family finally has stability. I never thought it was possible — Spandana showed me it was.", name: "Raju K.", location: "Secunderabad", program: "Skill Development" },
  { quote: "The self-help group changed everything. I stopped feeling ashamed of asking for help. 25 women in our circle now support each other every single week.", name: "Anjali S.", location: "Begumpet", program: "Mental Health — Self-Help Group" },
  { quote: "They helped me navigate a legal dispute I didn't even know I had rights over. I kept my land. I kept my family's future. No words can describe what that means.", name: "Mohammed I.", location: "Old City", program: "Legal Advocacy" },
];

export default function Testimonials({ stories = DEFAULT_STORIES }: { stories?: Story[] }) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const go = (next: number, direction: number) => {
    setDir(direction);
    setCurrent((next + stories.length) % stories.length);
  };

  const isPlaying = !paused && !hovered;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => go(current + 1, 1), 5500);
    return () => clearInterval(t);
  }, [current, stories.length, isPlaying]);

  const s = stories[current];
  const c = PROGRAM_COLORS[current % PROGRAM_COLORS.length];

  return (
    <section className="py-5 md:py-24 px-6 md:px-12 bg-[#05091A] relative overflow-hidden">
      {/* Ambient glow that shifts with the story */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`glow-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${c.glow}, transparent 70%)` }}
        />
      </AnimatePresence>

      {/* Subtle grid texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />


      <div className="relative z-[1] max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
            Testimonials
          </div>
          <h2 className="text-base md:text-4xl font-serif font-medium text-white whitespace-nowrap md:whitespace-normal">
            Lives Changed.<span className="hidden md:inline"><br /></span>{" "}<span className="italic text-white/45">In their own words.</span>
          </h2>
        </motion.div>

        {/* Card */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={current}
              custom={dir}
              initial={{ opacity: 0, x: dir * 80, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: dir * -80, scale: 0.96 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-12 cursor-default"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4 md:mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm md:text-2xl text-white/90 leading-relaxed font-light italic mb-4 md:mb-10">
                "{s.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 md:gap-4">
                {/* Mobile: slim gradient bar accent */}
                <div className={`block md:hidden w-1 self-stretch rounded-full bg-gradient-to-b ${c.avatar} shrink-0`} />
                {/* Desktop: avatar square */}
                <div className={`hidden md:flex rounded-2xl bg-gradient-to-br ${c.avatar} text-white font-bold text-base items-center justify-center shrink-0 shadow-lg`}
                  style={{ width: 46, height: 46 }}>
                  {s.name[0]}
                </div>

                <div className="flex-1 min-w-0">
                  {(() => {
                    const parts = s.program.split("—").map(p => p.trim());
                    return (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-white text-sm md:text-base leading-snug">{s.name}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md text-right shrink-0 ${c.badge}`}>{parts[0]}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-white/40 text-xs shrink-0">{s.location}</p>
                          {parts[1] && <span className={`text-xs font-bold px-2 py-0.5 rounded-md text-right shrink-0 ${c.badge}`}>{parts[1]}</span>}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Arrow buttons */}
          <button
            onClick={() => go(current - 1, -1)}
            className="absolute left-2 md:-left-7 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/8 border border-white/15 flex items-center justify-center hover:bg-white/15 transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft size={20} className="text-white/70" />
          </button>
          <button
            onClick={() => go(current + 1, 1)}
            className="absolute right-2 md:-right-7 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/8 border border-white/15 flex items-center justify-center hover:bg-white/15 transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight size={20} className="text-white/70" />
          </button>
        </div>

        {/* Dots + counter + pause */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="flex gap-2">
            {stories.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i, i > current ? 1 : -1)}
                className={`rounded-full transition-all duration-300 ${i === current ? `w-6 h-2 ${c.dot}` : "w-2 h-2 bg-white/20"}`}
              />
            ))}
          </div>
          <span className="text-white/25 text-xs font-mono">{current + 1} / {stories.length}</span>
          <button
            onClick={() => setPaused(p => !p)}
            aria-label={paused ? "Resume auto-play" : "Pause auto-play"}
            className="w-7 h-7 rounded-full bg-white/8 border border-white/15 flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            {paused
              ? <Play size={12} className="text-white/60 ml-0.5" />
              : <Pause size={12} className="text-white/60" />
            }
          </button>
        </div>
      </div>
    </section>
  );
}
