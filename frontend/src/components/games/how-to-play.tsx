import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";

interface Step {
  icon: string;
  text: string;
}

interface HowToPlayProps {
  steps: Step[];
  tip?: string;
}

export default function HowToPlay({ steps, tip }: HowToPlayProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full rounded-2xl border border-border overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookOpen size={14} className="text-primary" />
          How to Play
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <ChevronDown size={16} className="text-muted-foreground" />
        </motion.span>
      </button>

      {/* Steps */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="steps"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <ol className="flex flex-col gap-0 px-4 pt-3 pb-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start py-2 border-b border-border/50 last:border-0">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex items-start gap-1.5 flex-1">
                    <span className="text-base leading-none mt-0.5">{step.icon}</span>
                    <span className="text-sm text-foreground/80 leading-snug">{step.text}</span>
                  </div>
                </li>
              ))}
            </ol>
            {tip && (
              <div className="mx-4 mb-4 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
                💡 {tip}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
