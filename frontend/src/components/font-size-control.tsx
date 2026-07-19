import { motion } from "framer-motion";
import { useFontSize, type FontSizeLevel } from "@/hooks/use-font-size";
import { BookOpen } from "lucide-react";

const LEVELS: { level: FontSizeLevel; textClass: string; label?: string; title: string }[] = [
  { level: 0, textClass: "text-xs",   label: "Normal",  title: "Normal text size"  },
  { level: 1, textClass: "text-sm",                     title: "Large text size"   },
  { level: 2, textClass: "text-base",                   title: "X-Large text size" },
  { level: 3, textClass: "text-xl",   label: "Elderly", title: "Elderly text size" },
];

export default function FontSizeControl() {
  const { level, paperWhite, setTo, togglePaper } = useFontSize();

  return (
    <>
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
