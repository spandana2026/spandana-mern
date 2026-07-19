import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Users, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface CampaignCms {
  heading?: string;
  headingEmphasis?: string;
  description?: string;
  goal?: number;
  current?: number;
  reachedLabel?: string;
  buttonLabel?: string;
}

function AnimatedNumber({ target, duration = 1.8 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return <span ref={ref}>{val.toLocaleString("en-IN")}</span>;
}

export default function CampaignWidget() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [cms, setCms] = useState<CampaignCms>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d?.campaignWidget) setCms(d.campaignWidget); })
      .catch(() => {});
  }, []);

  const GOAL    = cms.goal    ?? 6000;
  const CURRENT = cms.current ?? 5247;
  const PCT     = Math.round((CURRENT / GOAL) * 100);
  const heading         = cms.heading         ?? "Help us reach";
  const headingEmphasis = cms.headingEmphasis ?? "6,000 families.";
  const description     = cms.description     ?? "Every family we reach gets sustained support — not a one-time handout.";
  const reachedLabel    = cms.reachedLabel    ?? "Families reached";
  const buttonLabel     = cms.buttonLabel     ?? "Donate Now";

  return (
    <section className="py-12 md:py-20 px-6 md:px-12 bg-background" ref={ref}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto bg-gradient-to-br from-primary/8 via-primary/4 to-transparent border border-primary/20 rounded-3xl p-6 md:p-12">

        <div className="flex flex-col gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active Campaign
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground">{heading} <span className="text-primary">{headingEmphasis}</span></h2>
            <p className="text-muted-foreground mt-2 text-sm">{description}</p>
          </div>
          <div className="flex gap-6 text-center self-start">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-foreground font-serif tabular-nums"><AnimatedNumber target={CURRENT} /></div>
              <div className="text-xs text-muted-foreground mt-1">{reachedLabel}</div>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="text-2xl md:text-3xl font-bold text-foreground font-serif tabular-nums">{GOAL.toLocaleString("en-IN")}</div>
              <div className="text-xs text-muted-foreground mt-1">Goal</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-4 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full relative"
              initial={{ width: 0 }} animate={inView ? { width: `${PCT}%` } : { width: 0 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </motion.div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-8">
          <span className="font-bold text-primary">{PCT}% of goal reached</span>
          <span className="flex items-center gap-1"><TrendingUp size={12} /> <AnimatedNumber target={GOAL - CURRENT} /> families to go</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button asChild size="lg" className="rounded-full h-13 px-10 font-bold gap-2 w-full sm:w-auto">
              <Link href="/donate">{buttonLabel} <ArrowRight size={18} /></Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button asChild size="lg" variant="ghost" className="rounded-full h-13 px-8 font-semibold gap-2 text-primary hover:bg-primary/8">
              <Link href="/get-involved"><Users size={16} /> Volunteer Instead</Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
