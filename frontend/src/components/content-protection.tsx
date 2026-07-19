import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, Mail } from "lucide-react";
import { Link } from "wouter";

export default function ContentProtection() {
  const [enabled, setEnabled] = useState(true);
  const [toast, setToast] = useState(false);
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.contentProtection === false) setEnabled(false);
      })
      .catch(() => {});
  }, []);

  function showToast() {
    setToast(true);
    if (toastTimer) clearTimeout(toastTimer);
    const t = setTimeout(() => setToast(false), 5000);
    setToastTimer(t);
  }

  useEffect(() => {
    if (!enabled) return;

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showToast();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const blocked =
        (ctrl && ["c", "u", "s", "p", "a"].includes(e.key.toLowerCase())) ||
        e.key === "F12" ||
        (ctrl && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()));

      if (blocked) {
        e.preventDefault();
        showToast();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled]);

  return (
    <>
      {/* Global no-select style — only injected when protection is enabled */}
      {enabled && (
        <style>{`
          body {
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
          }
          input, textarea, [contenteditable] {
            -webkit-user-select: text;
            -moz-user-select: text;
            user-select: text;
          }
        `}</style>
      )}

      {/* Friendly notice toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="protection-toast"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 z-[200] w-[min(88vw,360px)] rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: "rgba(0,25,80,0.94)", backdropFilter: "blur(16px)" }}
          >
            <div className="flex items-start gap-3 px-4 pt-4 pb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <ShieldAlert size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white leading-snug mb-1">
                  Content is protected
                </p>
                <p className="text-[11px] text-white/65 leading-relaxed">
                  Need any information? We're happy to help — just reach out and we'll share what you need.
                </p>
              </div>
              <button
                onClick={() => setToast(false)}
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors mt-0.5"
              >
                <X size={12} />
              </button>
            </div>
            <div className="px-4 pb-4">
              <Link
                href="/sahara"
                onClick={() => setToast(false)}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <Mail size={11} /> Contact us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
