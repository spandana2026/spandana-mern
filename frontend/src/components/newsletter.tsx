import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";

interface NewsletterCms { title?: string; subtitle?: string; buttonLabel?: string; successMsg?: string; }

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cms, setCms] = useState<NewsletterCms>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d?.newsletter) setCms(d.newsletter); })
      .catch(() => {});
  }, []);

  const title      = cms.title       ?? "Our Newsletter";
  const subtitle   = cms.subtitle    ?? "Stories · updates · no spam · straight to inbox";
  const btnLabel   = cms.buttonLabel ?? "Subscribe";
  const successMsg = cms.successMsg  ?? "You're subscribed!";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-8 px-6 bg-primary">
      <div className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.form key="form" onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-center gap-2">
              <div className="shrink-0 text-left sm:text-left">
                <p className="text-white font-bold text-sm leading-tight">{title}</p>
                <p className="text-white/55 text-[10px] leading-tight">{subtitle}</p>
              </div>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="flex-1 h-10 rounded-xl px-4 text-sm bg-white/15 border border-white/25 text-white placeholder:text-white/45 outline-none focus:bg-white/20 w-full sm:w-auto"
              />
              <button type="submit" disabled={loading}
                className="h-10 px-5 rounded-xl bg-white text-primary text-sm font-bold flex items-center gap-1.5 hover:bg-white/90 transition-colors shrink-0 w-full sm:w-auto justify-center">
                {loading
                  ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}><Send size={14} /></motion.span>
                  : <><Send size={14} /> {btnLabel}</>}
              </button>
            </motion.form>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-white py-1">
              <CheckCircle size={18} className="text-green-300" />
              <span className="text-sm font-semibold">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
