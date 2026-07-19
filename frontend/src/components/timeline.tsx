import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface Milestone { year: string; title: string; desc: string; highlight?: boolean; }

interface TimelineProps {
  milestones?: Milestone[];
  badge?: string;
  heading?: string;
  headingItalic?: string;
}

const DEFAULT_MILESTONES: Milestone[] = [
  { year: "1999", title: "Founded", desc: "Spandana Care Aid Foundation is established with a bold vision — permanent change over temporary relief.", highlight: true },
  { year: "2001", title: "First Outreach", desc: "Community health camps reach underserved neighbourhoods in Hyderabad for the first time." },
  { year: "2004", title: "Sahara Center Opens", desc: "Our operational hub — the Sahara Community Center — becomes the heartbeat of all programs." },
  { year: "2007", title: "Skill Development Begins", desc: "Vocational training programs launch, giving hundreds of women and youth an economic lifeline." },
  { year: "2010", title: "Legal Advocacy Cell", desc: "A dedicated legal aid unit is established to fight for land rights, custody, and justice for the powerless." },
  { year: "2014", title: "Mental Health Focus", desc: "Self-help groups and awareness campaigns address the invisible crisis of mental health in the community." },
  { year: "2018", title: "Entrepreneur Initiative", desc: "Micro-grants and mentorship help community members launch small businesses and break the poverty cycle." },
  { year: "2022", title: "5,000 Families Reached", desc: "A landmark milestone — over 5,000 families have now received direct, sustained support from Spandana." },
  { year: "2024", title: "25 Years Strong", desc: "A quarter century of Social Architecture. Still building. Still showing up. The work isn't done.", highlight: true },
];

export default function Timeline({
  milestones = DEFAULT_MILESTONES,
  badge = "Our Journey",
  heading = "25 years of",
  headingItalic = "showing up.",
}: TimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="py-24 px-6 md:px-12 bg-background overflow-hidden" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            {badge}
          </div>
          <h2 className="text-2xl md:text-4xl font-serif font-medium">
            {heading} <span className="italic text-muted-foreground">{headingItalic}</span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-px md:-translate-x-1/2">
            <motion.div className="w-full bg-primary origin-top" style={{ height: lineHeight }} />
          </div>

          <div className="flex flex-col gap-0">
            {milestones.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }} transition={{ delay: 0.05, duration: 0.6 }}
                  className={`relative flex items-start gap-8 pb-12 md:${isLeft ? "flex-row" : "flex-row-reverse"} flex-row`}>

                  <div className={`hidden md:block w-[calc(50%-2rem)] text-${isLeft ? "right" : "left"}`}>
                    {isLeft && (
                      <div className={`inline-block p-5 rounded-2xl border ${m.highlight ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}>
                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{m.year}</div>
                        <h3 className={`font-serif font-medium mb-2 ${m.highlight ? "text-xl" : "text-lg"}`}>{m.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                      </div>
                    )}
                  </div>

                  <div className="relative z-10 shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-5">
                    <motion.div whileInView={{ scale: [0, 1.3, 1] }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }}
                      className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-background shadow-md ${m.highlight ? "bg-primary w-5 h-5 md:w-6 md:h-6" : "bg-primary/60"}`} />
                  </div>

                  <div className="flex-1 md:w-[calc(50%-2rem)]">
                    <div className={`md:hidden p-5 rounded-2xl border ${m.highlight ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}>
                      <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{m.year}</div>
                      <h3 className={`font-serif font-medium mb-2 ${m.highlight ? "text-xl" : "text-lg"}`}>{m.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                    </div>
                    {!isLeft && (
                      <div className={`hidden md:inline-block p-5 rounded-2xl border ${m.highlight ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}>
                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{m.year}</div>
                        <h3 className={`font-serif font-medium mb-2 ${m.highlight ? "text-xl" : "text-lg"}`}>{m.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
