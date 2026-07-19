import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Mail, Clock, Users, Heart, Leaf, BookOpen,
  Shield, HeartHandshake, ArrowRight, Building2, Sparkles,
  CalendarDays, Utensils, Dumbbell, Baby, Mic2, Star,
  Brain, Stethoscope, Scale, Megaphone, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import CommunityChat from "@/components/community-chat";
import VolunteerModal from "@/components/volunteer-modal";

/* ─── Types ─── */
interface SaharaStat   { number: string; label: string; }
interface SaharaItem   { title: string; desc: string; }
interface SaharaProg   { tag: string; title: string; desc: string; }
interface SaharaHour   { day: string; time: string; }
interface SaharaSection { heading: string; headingItalic: string; subtext: string; }
interface SaharaPage {
  hero:              { badge: string; title: string; titleItalic: string; description: string; button1: string; button2: string; };
  about:             { heading: string; headingItalic: string; para1: string; para2: string; };
  stats:             SaharaStat[];
  facilitiesSection: SaharaSection;
  facilities:        SaharaItem[];
  programsSection:   SaharaSection;
  programs:          SaharaProg[];
  visitSection:      { heading: string; headingItalic: string; inclusiveNote: string; };
  hours:             SaharaHour[];
  contact:           { address: string; email: string; };
  cta:               { title: string; titleItalic: string; description: string; };
}
interface HealthProgram {
  id: string; title: string; description: string;
  pillar: "physical" | "mental" | "community"; status: string;
  image: string; published: boolean; order: number;
}
interface CommunityInitiative {
  id: string; title: string; description: string;
  icon: string; image: string; status: string; published: boolean; order: number;
}
interface SiteSettings {
  saharaPage?: SaharaPage;
  whatsappGroupLink?: string;
  programsSection?: { title?: string; subtitle?: string; };
}

/* ─── Health Pillar sub-items ─── */
const PHYSICAL_SUBS = [
  { icon: Stethoscope, label: "Medical Aid" },
  { icon: BookOpen,    label: "Skill Development" },
  { icon: Users,       label: "Entrepreneur Initiatives" },
  { icon: Scale,       label: "Legal Advocacy" },
  { icon: Leaf,        label: "Environmental Stewardship" },
];
const MENTAL_SUBS = [
  { icon: Megaphone,     label: "Awareness Campaigns" },
  { icon: BookOpen,      label: "Educational Outreach" },
  { icon: Users,         label: "Self-Help Groups" },
  { icon: HeartHandshake, label: "Counselling Access" },
  { icon: Heart,         label: "Crisis Support" },
];

const DEFAULT_SAHARA: SaharaPage = {
  hero: {
    badge: "Established 1999 · Open to All",
    title: "Sahara",
    titleItalic: "Community Center",
    description: "A living, breathing hub where families find support, dignity, and opportunity — right in the heart of the community.",
    button1: "Explore Programs",
    button2: "Visit Us",
  },
  about: {
    heading: "More than a building —",
    headingItalic: "a second home.",
    para1: "The Sahara Community Center was built on the belief that true social change requires a permanent, welcoming space. Since 1999, we have served as the operational heart of Spandana Care Aid Foundation's mission — offering facilities, programs, and human connection under one roof.",
    para2: "Every square foot of Sahara exists to reduce barriers. Whether a family needs medical attention, a child needs a safe place to learn, or an entrepreneur needs mentorship — this is where the journey begins.",
  },
  stats: [
    { number: "1,200+", label: "Members" },
    { number: "6",      label: "Facilities" },
    { number: "30+",    label: "Events / Month" },
    { number: "25+",    label: "Years Serving" },
  ],
  facilitiesSection: {
    heading: "Spaces built for",
    headingItalic: "every need.",
    subtext: "Six purpose-built spaces, each designed to serve a distinct but interconnected community need.",
  },
  facilities: [
    { title: "Community Kitchen",        desc: "A fully-equipped shared kitchen hosting nutrition workshops, meal-sharing events, and cooking skills classes for families." },
    { title: "Health & Wellness Studio", desc: "Yoga, meditation, and physical therapy space open to all community members, with certified instructors." },
    { title: "Learning Resource Hub",    desc: "Library, computer stations, and tutoring rooms supporting children, youth, and adult literacy programs." },
    { title: "Children's Safe Zone",     desc: "A supervised, vibrant play and early-learning area where young children thrive in a safe environment." },
    { title: "Community Hall",           desc: "A versatile auditorium for town halls, cultural events, awareness campaigns, and skill-building workshops." },
    { title: "Community Garden",         desc: "An organic growing space that teaches sustainable agriculture while supplying fresh produce to local families." },
  ],
  programsSection: {
    heading: "Programmes that",
    headingItalic: "transform lives.",
    subtext: "Running across health, education, livelihood, and culture — all under the Sahara roof.",
  },
  programs: [
    { tag: "Physical Health", title: "Weekly Medical Camps",        desc: "Free health screenings, blood pressure checks, diabetes monitoring, and specialist referrals every Saturday." },
    { tag: "Mental Health",   title: "Self-Help Support Circles",   desc: "Confidential peer-support groups facilitated by trained counsellors every Tuesday and Thursday." },
    { tag: "Livelihood",      title: "Entrepreneurship Bootcamp",   desc: "12-week micro-enterprise program teaching business planning, digital payments, and market access." },
    { tag: "Education",       title: "After-School Excellence",     desc: "Daily tutoring, STEM activities, and mentorship for students from underserved families." },
    { tag: "Legal Aid",       title: "Legal Clinic",                desc: "Monthly free consultations with volunteer lawyers on housing, labour, and family matters." },
    { tag: "Community",       title: "Cultural Exchange Days",      desc: "Quarterly celebration of diverse cultures through food, art, music, and storytelling." },
  ],
  visitSection: {
    heading: "We're always",
    headingItalic: "open for you.",
    inclusiveNote: "All are welcome. The Sahara Community Center is secular, inclusive, and free to access for all community members regardless of background, faith, or circumstance.",
  },
  hours: [
    { day: "Monday – Friday", time: "8:00 AM – 8:00 PM" },
    { day: "Saturday",        time: "9:00 AM – 6:00 PM" },
    { day: "Sunday",          time: "10:00 AM – 4:00 PM" },
  ],
  contact: {
    address: "Sahara Community Center, Spandana Care Aid Foundation — contact us for directions",
    email: "spandanacareaidfoundation@gmail.com",
  },
  cta: {
    title: "Be part of",
    titleItalic: "the Sahara family.",
    description: "Volunteer your skills, join a programme, or simply stop by. Every person who walks through our doors makes us stronger.",
  },
};

/* Icons indexed by position (title/desc come from settings) */
const FACILITY_ICONS = [Utensils, Dumbbell, BookOpen, Baby, Mic2, Leaf];
const STAT_ICONS      = [Users, Building2, CalendarDays, Star];

/* Tag → colour mapping (tag values come from settings) */
const TAG_COLORS: Record<string, string> = {
  "Physical Health": "bg-blue-50 text-blue-700 border-blue-100",
  "Mental Health":   "bg-purple-50 text-purple-700 border-purple-100",
  "Livelihood":      "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Education":       "bg-amber-50 text-amber-700 border-amber-100",
  "Legal Aid":       "bg-rose-50 text-rose-700 border-rose-100",
  "Community":       "bg-teal-50 text-teal-700 border-teal-100",
};
function tagColor(tag: string) { return TAG_COLORS[tag] ?? "bg-muted text-muted-foreground border-border"; }

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp  = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.65 } } };

export default function Sahara() {
  const [p, setP] = useState<SaharaPage>(DEFAULT_SAHARA);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [whatsappGroupLink, setWhatsappGroupLink] = useState<string | undefined>();
  const [cmsPrograms, setCmsPrograms] = useState<HealthProgram[]>([]);
  const [cmsInitiatives, setCmsInitiatives] = useState<CommunityInitiative[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: SiteSettings) => {
        if (d.saharaPage) setP({ ...DEFAULT_SAHARA, ...d.saharaPage });
        if (d.whatsappGroupLink) setWhatsappGroupLink(d.whatsappGroupLink);
      })
      .catch(() => {});
    fetch("/api/programs")
      .then((r) => r.json())
      .then((d: HealthProgram[]) => setCmsPrograms(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch("/api/initiatives")
      .then((r) => r.json())
      .then((d: CommunityInitiative[]) => setCmsInitiatives(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary selection:text-white overflow-x-hidden">
      <Nav />

      {/* ── HERO ── */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden pt-16">
        <motion.div
          className="absolute inset-0 bg-[url('/images/hero.png')] bg-cover bg-center scale-105"
          initial={{ scale: 1.12 }} animate={{ scale: 1.04 }}
          transition={{ duration: 8, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-[#0033A0] opacity-85" />
        <motion.div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 7, repeat: Infinity }} />
        <motion.div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-blue-300/10 blur-3xl pointer-events-none"
          animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 9, repeat: Infinity, delay: 2 }} />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white/90 text-sm font-medium mb-6 border border-white/25 backdrop-blur-sm">
            <motion.span className="w-2 h-2 rounded-full bg-green-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
            {p.hero.badge}
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            className="text-[1.35rem] sm:text-3xl md:text-5xl font-serif font-medium text-white leading-[1.08] mb-5 tracking-tight drop-shadow-lg md:whitespace-nowrap">
            {p.hero.title}{" "}
            <br className="hidden md:block" />
            <span className="italic text-white/80">{p.hero.titleItalic}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.65 }}
            className="text-base md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: p.hero.description }}
          />

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.85 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full h-14 px-10 text-base font-semibold bg-white text-[#0033A0] hover:bg-white/92 shadow-2xl border-0 w-full sm:w-auto">
              <a href="#programs">{p.hero.button1}</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-10 text-base border-white/40 text-white hover:bg-white/12 hover:text-white backdrop-blur-sm w-full sm:w-auto">
              <a href="#visit">{p.hero.button2}</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="py-10 md:py-14 px-6 md:px-12 bg-primary">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {p.stats.map((stat, i) => {
            const Icon = STAT_ICONS[i] ?? Star;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mb-1">
                  <Icon size={18} className="text-white" />
                </div>
                <span className="text-2xl md:text-3xl font-serif font-bold text-white">{stat.number}</span>
                <span className="text-white/70 text-sm font-medium">{stat.label}</span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-background">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold uppercase tracking-widest mb-5">
              <Sparkles size={13} /> Our Story
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-medium mb-6 leading-snug">
              {p.about.heading}<br />
              <span className="italic text-muted-foreground">{p.about.headingItalic}</span>
            </h2>
            {/* Mobile: show para1 + collapsible para2 with Read More */}
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: p.about.para1 }} />

            {/* Desktop: always show para2 */}
            <p className="hidden md:block text-muted-foreground text-base md:text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: p.about.para2 }} />

            {/* Mobile: collapsible para2 */}
            <div className="md:hidden">
              <motion.div
                initial={false}
                animate={{ height: aboutExpanded ? "auto" : 0, opacity: aboutExpanded ? 1 : 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <p className="text-muted-foreground text-base leading-relaxed pb-3" dangerouslySetInnerHTML={{ __html: p.about.para2 }} />
              </motion.div>
              <button
                onClick={() => setAboutExpanded((v) => !v)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-1 focus:outline-none"
                aria-expanded={aboutExpanded}
              >
                {aboutExpanded ? "Show less" : "Read more"}
                <motion.span
                  animate={{ rotate: aboutExpanded ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex"
                >
                  <ArrowRight size={14} className="rotate-90" />
                </motion.span>
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-primary/8 relative">
              <img src="/images/hero.png" alt="Sahara Community Center" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0033A0]/40 to-transparent" />
              <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-xl border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart size={16} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">At the heart of</div>
                    <div className="text-sm font-bold text-foreground">Every program we run</div>
                  </div>
                </div>
              </div>
            </div>
            <motion.div className="absolute -top-4 -right-4 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg"
              initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.6, type: "spring", stiffness: 300 }}>
              Est. 1999
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── TWO CORE HEALTH PILLARS ── */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-foreground/[0.02] border-t border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              Two Core Pillars
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-medium">Where we focus our energy</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Physical Health */}
            <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="group relative rounded-3xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 md:p-10 flex flex-col h-full relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Shield size={26} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Program 01</div>
                    <h3 className="font-serif font-bold text-base">Physical Health</h3>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                  Holistic physical wellbeing alongside skills that build lasting economic independence — from free medical camps to vocational training and legal support.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {PHYSICAL_SUBS.map((sub, i) => {
                    const Icon = sub.icon;
                    return (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-semibold">
                        <Icon size={11} /> {sub.label}
                      </span>
                    );
                  })}
                </div>
                <Link href="/programs/physical-health"
                  className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary/90 transition-colors text-sm self-start">
                  Explore Program <ChevronRight size={15} />
                </Link>
              </div>
            </motion.div>
            {/* Mental Health */}
            <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
              className="group relative rounded-3xl overflow-hidden border border-border bg-card hover:border-purple-400/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 md:p-10 flex flex-col h-full relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                    <Brain size={26} className="text-purple-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-1">Program 02</div>
                    <h3 className="font-serif font-bold text-base">Mental Health</h3>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                  Mental wellness is the foundation of a thriving community. We normalise conversations, provide safe spaces, and connect families with the care they deserve.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {MENTAL_SUBS.map((sub, i) => {
                    const Icon = sub.icon;
                    return (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold">
                        <Icon size={11} /> {sub.label}
                      </span>
                    );
                  })}
                </div>
                <Link href="/programs/mental-health"
                  className="inline-flex items-center gap-2 bg-purple-700 text-white font-bold px-6 py-3 rounded-full hover:bg-purple-800 transition-colors text-sm self-start">
                  Explore Program <ChevronRight size={15} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section id="programs" className="py-16 md:py-24 px-6 md:px-12 bg-card">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <HeartHandshake size={13} /> Active Programs
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-medium mb-4">
              {p.programsSection.heading} <span className="italic text-muted-foreground">{p.programsSection.headingItalic}</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg" dangerouslySetInnerHTML={{ __html: p.programsSection.subtext }} />
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {p.programs.map((prog, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -6, boxShadow: "0 20px 56px rgba(0,0,0,0.07)" }}
                className="bg-background border border-border rounded-2xl p-6 flex flex-col gap-4 cursor-default">
                <span className={`self-start text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${tagColor(prog.tag)}`}>{prog.tag}</span>
                <div>
                  <h3 className="font-bold text-foreground text-base mb-2">{prog.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: prog.desc }} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CMS ACTIVE PROGRAMS & INITIATIVES ── */}
      {(cmsPrograms.length > 0 || cmsInitiatives.length > 0) && (
        <section className="py-16 px-6 md:px-12 bg-foreground/[0.02] border-t border-border">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                Active Programs
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-medium">What we are running today</h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl mx-auto">Programs and initiatives currently active in our communities.</p>
            </motion.div>
            {cmsPrograms.length > 0 && (
              <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-5">Health Programs</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {cmsPrograms.map((prog, i) => (
                    <motion.div key={prog.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.45 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
                      {prog.image && <div className="h-36 overflow-hidden"><img src={prog.image} alt={prog.title} className="w-full h-full object-cover" /></div>}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${prog.pillar === "mental" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-primary/8 text-primary border-primary/15"}`}>{prog.pillar}</span>
                          {prog.status === "active" && <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active</span>}
                        </div>
                        <h3 className="font-serif font-semibold text-sm leading-snug text-foreground">{prog.title}</h3>
                        {prog.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{prog.description}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {cmsInitiatives.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-5">Community Initiatives</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {cmsInitiatives.map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.45 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden hover:border-purple-300/50 transition-colors">
                      {item.image && <div className="h-36 overflow-hidden"><img src={item.image} alt={item.title} className="w-full h-full object-cover" /></div>}
                      <div className="p-5">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <h3 className="font-serif font-semibold text-sm leading-snug text-foreground">{item.title}</h3>
                        {item.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>}
                        {item.status === "active" && <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── FACILITIES ── */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <Building2 size={13} /> Facilities
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-medium mb-4">
              {p.facilitiesSection.heading} <span className="italic text-muted-foreground">{p.facilitiesSection.headingItalic}</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg" dangerouslySetInnerHTML={{ __html: p.facilitiesSection.subtext }} />
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {p.facilities.map((f, i) => {
              const Icon = FACILITY_ICONS[i] ?? Building2;
              return (
                <motion.div key={i} variants={fadeUp} whileHover={{ y: -6, boxShadow: "0 20px 56px rgba(0,51,160,0.10)" }}
                  className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 cursor-default group">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: f.desc }} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── VISIT US ── */}
      <section id="visit" className="py-16 md:py-24 px-6 md:px-12 bg-card">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold uppercase tracking-widest mb-5">
              <MapPin size={13} /> Visit Us
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-medium mb-6">
              {p.visitSection.heading} <span className="italic text-muted-foreground">{p.visitSection.headingItalic}</span>
            </h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><MapPin size={18} /></div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Address</div>
                  <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{p.contact.address}</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Mail size={18} /></div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Email</div>
                  <a href={`mailto:${p.contact.email}`} className="text-primary text-sm hover:underline">{p.contact.email}</a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-bold uppercase tracking-widest mb-5">
              <Clock size={13} /> Opening Hours
            </div>
            <div className="space-y-3">
              {p.hours.map((h, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-center justify-between py-4 px-5 rounded-xl border border-border bg-background">
                  <span className="font-medium text-foreground text-sm">{h.day}</span>
                  <span className="text-primary font-semibold text-sm">{h.time}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 p-5 rounded-2xl bg-primary/5 border border-primary/15">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: p.visitSection.inclusiveNote }} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-primary relative overflow-hidden">
        <motion.div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 mx-auto bg-white/15 rounded-full flex items-center justify-center mb-6">
            <HeartHandshake size={28} className="text-white" />
          </div>
          <h2 className="text-2xl md:text-4xl font-serif font-medium text-white mb-5 leading-snug">
            {p.cta.title}<br />
            <span className="italic text-white/75">{p.cta.titleItalic}</span>
          </h2>
          <p className="text-white/70 text-base md:text-lg mb-10 max-w-xl mx-auto" dangerouslySetInnerHTML={{ __html: p.cta.description }} />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" onClick={() => setVolunteerModalOpen(true)}
                className="rounded-full h-14 px-10 text-base font-semibold bg-white text-[#0033A0] hover:bg-white/92 shadow-2xl border-0 w-full sm:w-auto gap-2">
                Get Involved <ArrowRight size={18} />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-10 text-base border-white/40 text-white hover:bg-white/12 hover:text-white backdrop-blur-sm w-full sm:w-auto">
                <a href="#visit">Find Us</a>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
      <CommunityChat />

      <VolunteerModal
        open={volunteerModalOpen}
        onClose={() => setVolunteerModalOpen(false)}
        whatsappGroupLink={whatsappGroupLink}
      />
    </div>
  );
}
