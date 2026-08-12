import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFontSize, type FontSizeLevel } from "@/hooks/use-font-size";
import { BookOpen, Type } from "lucide-react";

const LEVELS: { level: FontSizeLevel; textClass: string; label?: string; title: string }[] = [
  { level: 0, textClass: "text-xs",   label: "Normal",  title: "Normal text size"  },
  { level: 1, textClass: "text-sm",                     title: "Large text size"   },
  { level: 2, textClass: "text-base",                   title: "X-Large text size" },
  { level: 3, textClass: "text-xl",   label: "Elderly", title: "Elderly text size" },
];

export default function FontSizeControl() {
  const { level, paperWhite, setTo, togglePaper } = useFontSize();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      setMobileOpen(false);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 220);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* ── Mobile only: compact "Aa" trigger, top-left, just below the navbar ── */}
      <motion.div
        ref={mobileRef}
        animate={{ opacity: isScrolling ? 0 : 1, y: isScrolling ? -18 : 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={`md:hidden fixed top-[100px] left-3 z-40 flex flex-col items-start gap-2 ${isScrolling ? "pointer-events-none" : ""}`}
      >
        <div className="flex items-center gap-2">
          <motion.button
          onClick={() => setMobileOpen((o) => !o)}
          whileTap={{ scale: 0.94 }}
          aria-label="Text size options"
          aria-expanded={mobileOpen}
          className={`flex items-center gap-1.5 px-3 h-9 rounded-full border shadow-lg transition-colors duration-300
            ${paperWhite
              ? "bg-[#FBF8F0]/95 border-amber-200/80 shadow-amber-100"
              : "bg-background/95 backdrop-blur-md border-border/80 shadow-black/10"}
            ${mobileOpen ? (paperWhite ? "ring-2 ring-amber-300" : "ring-2 ring-primary/40") : ""}`}
        >
          <Type size={14} className={paperWhite ? "text-amber-700" : "text-primary"} />
          <span className={`text-[11px] font-bold ${paperWhite ? "text-amber-800" : "text-foreground"}`}>
            Text Size
          </span>
          </motion.button>

          <motion.button
            onClick={togglePaper}
            whileTap={{ scale: 0.94 }}
            aria-label={paperWhite ? "Disable paper white mode" : "Enable paper white mode"}
            aria-pressed={paperWhite}
            className={`flex items-center gap-1.5 px-3 h-9 rounded-full border shadow-lg transition-all duration-300
              ${paperWhite
                ? "bg-amber-50/95 border-amber-300 text-amber-800 shadow-amber-100"
                : "bg-background/95 backdrop-blur-md border-border/80 text-muted-foreground shadow-black/10"}`}
          >
            <BookOpen size={14} />
            <span className="text-[11px] font-bold">Paper White</span>
            <span className={`w-4 h-4 rounded-full border-2 transition-colors ${paperWhite ? "border-amber-500 bg-amber-500" : "border-current/40 bg-transparent"}`}>
              {paperWhite && <span className="block w-full h-full rounded-full border-2 border-amber-50" />}
            </span>
          </motion.button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className={`flex flex-col gap-2 p-2 rounded-2xl border shadow-lg transition-colors duration-300
                ${paperWhite
                  ? "bg-[#FBF8F0] border-amber-200/70 shadow-amber-100"
                  : "bg-background/95 backdrop-blur-md border-border"}`}
            >
              <div className="flex items-center gap-0.5">
                {LEVELS.map((l) => (
                  <motion.button
                    key={l.level}
                    onClick={() => setTo(l.level)}
                    whileTap={{ scale: 0.88 }}
                    title={l.title}
                    aria-label={l.title}
                    className={`h-8 rounded-xl font-bold transition-all flex items-center justify-center gap-1
                      ${l.label ? "px-2" : "w-7"}
                      ${level === l.level
                        ? paperWhite
                          ? "bg-amber-700 text-white shadow-sm"
                          : "bg-primary text-white shadow-sm"
                        : paperWhite
                          ? "text-stone-500 hover:bg-amber-50 hover:text-stone-800"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    <span className={l.textClass}>A</span>
                    {l.label && (
                      <span className="text-[9px] font-semibold tracking-wide leading-none">{l.label}</span>
                    )}
                  </motion.button>
                ))}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Desktop only: full font size + Paper White strip, bottom-left ── */}
      <div className="hidden md:flex fixed bottom-20 left-3 z-50 flex-col gap-1.5 items-start">
        <div className={`flex items-center gap-0.5 px-1.5 py-1 rounded-2xl border shadow-md transition-colors duration-300
          ${paperWhite
            ? "bg-[#FBF8F0] border-amber-200/70 shadow-amber-100"
            : "bg-background/95 backdrop-blur-md border-border"}`}>
          {LEVELS.map((l) => (
            <motion.button
              key={l.level}
              onClick={() => setTo(l.level)}
              whileTap={{ scale: 0.88 }}
              title={l.title}
              aria-label={l.title}
              className={`h-8 rounded-xl font-bold transition-all flex items-center justify-center gap-1
                ${l.label ? "px-2" : "w-7"}
                ${level === l.level
                  ? paperWhite
                    ? "bg-amber-700 text-white shadow-sm"
                    : "bg-primary text-white shadow-sm"
                  : paperWhite
                    ? "text-stone-500 hover:bg-amber-50 hover:text-stone-800"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <span className={l.textClass}>A</span>
              {l.label && (
                <span className="text-[9px] font-semibold tracking-wide leading-none">{l.label}</span>
              )}
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={togglePaper}
          whileTap={{ scale: 0.95 }}
          aria-label={paperWhite ? "Disable paper white mode" : "Enable paper white mode for easier reading"}
          className={`flex items-center gap-2 px-3 h-8 rounded-2xl border text-xs font-semibold transition-all duration-300 shadow-md
            ${paperWhite
              ? "bg-amber-50 border-amber-300 text-amber-800 shadow-amber-100"
              : "bg-background/95 backdrop-blur-md border-border text-muted-foreground hover:text-foreground hover:border-primary/30"}`}
        >
          <BookOpen size={13} />
          <span>Paper White</span>
          <span className={`ml-auto w-7 h-4 rounded-full transition-colors flex items-center px-0.5
            ${paperWhite ? "bg-amber-500" : "bg-muted"}`}>
            <span className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-300
              ${paperWhite ? "translate-x-3" : "translate-x-0"}`} />
          </span>
        </motion.button>
      </div>
    </>
  );
}
