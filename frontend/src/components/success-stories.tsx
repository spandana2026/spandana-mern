import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";

export interface SuccessStory {
  title: string;
  story: string;
  name: string;
  location: string;
  program: string;
  image: string;
}

const ACCENT_COLORS = [
  { pill: "bg-pink-500/20 text-pink-300 border border-pink-500/30",    avatar: "from-pink-500 to-rose-600",     dot: "bg-pink-400",    glow: "rgba(239,68,68,0.12)"  },
  { pill: "bg-blue-500/20 text-blue-300 border border-blue-500/30",    avatar: "from-blue-500 to-indigo-600",   dot: "bg-blue-400",    glow: "rgba(59,130,246,0.12)" },
  { pill: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", avatar: "from-emerald-500 to-teal-600", dot: "bg-emerald-400", glow: "rgba(16,185,129,0.12)" },
  { pill: "bg-amber-500/20 text-amber-300 border border-amber-500/30", avatar: "from-amber-500 to-orange-600",  dot: "bg-amber-400",   glow: "rgba(245,158,11,0.12)" },
];

const DEFAULT_STORIES: SuccessStory[] = [
  {
    title: "From Struggle to Strength",
    story: "Meena came to us with nothing — no income, no support, no hope. After enrolling in our skill development program, she learned tailoring, started her own boutique, and now employs three other women from her neighbourhood.",
    name: "Meena Devi",
    location: "Secunderabad",
    program: "Skill Development",
    image: "/images/physical.png",
  },
  {
    title: "A Family Healed",
    story: "After his father's death, Ravi's family spiralled into debt and depression. Spandana's mental health team and legal advocacy cell helped them reclaim their land rights and regain their footing — together.",
    name: "Ravi Kumar",
    location: "Old City, Hyderabad",
    program: "Legal & Mental Health",
    image: "/images/mental.png",
  },
  {
    title: "Health That Changed Everything",
    story: "Saritha had ignored a chronic condition for years because she couldn't afford doctors. Our free medical camp diagnosed and treated her in a single day. She calls it the day her second life began.",
    name: "Saritha P.",
    location: "Begumpet",
    program: "Medical Aid",
    image: "/images/hero.png",
  },
];

export default function SuccessStories({ stories = DEFAULT_STORIES }: { stories?: SuccessStory[] }) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const [storyPinned, setStoryPinned] = useState(false);

  const go = (next: number, direction: number) => {
    setDir(direction);
    setStoryPinned(false);
    setCurrent((next + stories.length) % stories.length);
  };

  useEffect(() => {
    setCurrent(0);
    setStoryPinned(false);
  }, [stories]);

  useEffect(() => {
    const t = setInterval(() => go(current + 1, 1), 6000);
    return () => clearInterval(t);
  }, [current, stories.length]);

  const s = stories[current];
  const c = ACCENT_COLORS[current % ACCENT_COLORS.length];

  if (!s) return null;

  return (
    <section className="py-20 px-6 md:px-12 bg-[#05091A] relative overflow-hidden">
      {/* Ambient glow */}
      <AnimatePresence mode="wait">
        <motion.div key={`sg-${current}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 55% 45% at 60% 50%, ${c.glow}, transparent 70%)` }}
        />
      </AnimatePresence>

      {/* Dot texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
            Success Stories
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-white">
            Real people. <span className="italic text-white/45">Real change.</span>
          </h2>
        </motion.div>

        {/* Card */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={current} custom={dir}
              initial={{ opacity: 0, x: dir * 80, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: dir * -80, scale: 0.96 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="grid md:grid-cols-2 gap-0 bg-white/[0.04] border border-white/10 rounded-3xl"
            >
              {/* Image side — handles its own rounded corners so the card doesn't need overflow-hidden */}
              <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden rounded-t-3xl md:rounded-tl-3xl md:rounded-bl-3xl md:rounded-tr-none md:rounded-br-none">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#05091A]/80 via-transparent to-transparent" />
                {/* Program badge over image */}
                <div className="absolute top-4 left-4">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm ${c.pill}`}>{s.program}</span>
                </div>
              </div>

              {/* Text side */}
              <div className="flex flex-col justify-center p-8 md:p-10">
                <h3 className="text-2xl md:text-3xl font-serif font-medium text-white mb-4 leading-snug">{s.title}</h3>
                <div className="mb-8">
                  {/* Desktop: always show full story */}
                  <p className="hidden md:block text-white/65 leading-relaxed text-base">{s.story}</p>
                  {/* Mobile: collapsed with expand button */}
                  <div className="md:hidden">
                    <div style={storyPinned ? {} : { height: "4.875rem", overflow: "hidden" }}>
                      <p className="text-white/65 leading-relaxed text-base">{s.story}</p>
                    </div>
                    <button
                      onClick={() => setStoryPinned(p => !p)}
                      className="mt-2 flex items-center gap-1 text-[11px] text-white/35 active:text-white/70 cursor-pointer select-none"
                    >
                      {storyPinned
                        ? <><ChevronUp size={12} /> Read less</>
                        : <><ChevronDown size={12} /> Read more</>
                      }
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.avatar} text-white font-bold text-base flex items-center justify-center shrink-0 shadow-lg`}>
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{s.name}</p>
                    <p className="text-white/40 text-xs">{s.location}</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-9 h-9 rounded-full bg-white/8 border border-white/15 flex items-center justify-center">
                      <ArrowUpRight size={15} className="text-white/50" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Arrows */}
          <button onClick={() => go(current - 1, -1)}
            className="absolute -left-5 md:-left-7 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/8 border border-white/15 flex items-center justify-center hover:bg-white/15 transition-colors"
            aria-label="Previous">
            <ChevronLeft size={20} className="text-white/70" />
          </button>
          <button onClick={() => go(current + 1, 1)}
            className="absolute -right-5 md:-right-7 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/8 border border-white/15 flex items-center justify-center hover:bg-white/15 transition-colors"
            aria-label="Next">
            <ChevronRight size={20} className="text-white/70" />
          </button>
        </div>

        {/* Dots + counter */}
        <div className="flex items-center justify-center gap-4 mt-7">
          <div className="flex gap-2">
            {stories.map((_, i) => (
              <button key={i} onClick={() => go(i, i > current ? 1 : -1)}
                className={`rounded-full transition-all duration-300 ${i === current ? `w-6 h-2 ${c.dot}` : "w-2 h-2 bg-white/20"}`} />
            ))}
          </div>
          <span className="text-white/25 text-xs font-mono">{current + 1} / {stories.length}</span>
        </div>
      </div>
    </section>
  );
}
