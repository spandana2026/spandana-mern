import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowRight, HeartHandshake, Leaf, Scale, Shield, Users, BookOpen, Brain, Megaphone, Play, Heart, ShieldCheck, UserCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Nav from "@/components/nav";
import CommunityChat from "@/components/community-chat";
import ImpactTicker from "@/components/impact-ticker";
import Testimonials from "@/components/testimonials";
import Newsletter from "@/components/newsletter";
import VisionMissionBlock from "@/components/vision-mission-block";
import ImpactCalculator from "@/components/impact-calculator";
import VolunteerSpotlight from "@/components/volunteer-spotlight";
import VolunteerModal from "@/components/volunteer-modal";
import TrustStrip from "@/components/trust-strip";
import CampaignWidget from "@/components/campaign-widget";
import Footer from "@/components/footer";
import { DEFAULT_SECTION_ORDER } from "@/components/admin/PageBuilderTab";
import AdsCarousel from "@/components/ads-carousel";
import Timeline from "@/components/timeline";

/* ─── Types ─── */
interface ProgramItem { title: string; desc: string; }
interface SiteSettings {
  hero: {
    badge: string; title: string; titleItalic: string; description: string; button1: string; button2: string;
    useMobileText?: boolean; mobileBadge?: string; mobileTitle?: string; mobileTitleItalic?: string; mobileDescription?: string;
  };
  heroImage?: string;
  heroImageMobile?: string;
  stats: Array<{ number: string; label: string }>;
  useMobileStats?: boolean;
  mobileStats?: Array<{ number: string; label: string }>;
  vision: { heading: string; content: string };
  mission: { heading: string; content: string };
  useMobileVision?: boolean;
  mobileVision?: { heading: string; content: string };
  mobileMission?: { heading: string; content: string };
  centerCaption: string;
  successStories: Array<{ title: string; story: string; name: string; location: string; program: string; image: string }>;
  promoVideoSection: { title: string; subtitle: string; bullets: string[] };
  testimonials: Array<{ quote: string; name: string; location: string; program: string }>;
  newsletter: { title: string; subtitle: string };
  timeline: Array<{ year: string; title: string; desc: string; highlight?: boolean }>;
  trustStrip: Array<{ label: string; sub: string }>;
  volunteers: Array<{ name: string; role: string; years: string; quote: string; hours: string; program: string }>;
  programsSection: { title: string; subtitle: string; physical: { label: string; title: string; subtitle: string; items: ProgramItem[]; }; mental: { label: string; title: string; subtitle: string; items: ProgramItem[]; }; };
  values: string[];
  getInvolved: { title: string; subtitle: string; };
  contact: { email: string; phone: string; };
  footer: { copyright: string; };
  promoVideoId: string;
  howItWorks?: { badge: string; heading: string; headingItalic: string; steps: Array<{ num: string; title: string; desc: string; color: string }>; buttonLabel: string };
  coreValuesSection?: { badge: string; taglines: string[]; descriptions: string[] };
  timelineSection?: { badge: string; heading: string; headingItalic: string };
  ticker?: { items: string[] };
  visibility?: { hero?: boolean; impactTicker?: boolean; visionMission?: boolean; coreValues?: boolean; testimonials?: boolean; programs?: boolean; impactCalculator?: boolean; volunteerSpotlight?: boolean; campaignWidget?: boolean; newsletter?: boolean; timeline?: boolean; heroMobile?: boolean; visionMissionMobile?: boolean; programsMobile?: boolean; impactTickerMobile?: boolean; testimonialsMobile?: boolean; impactCalculatorMobile?: boolean; volunteerSpotlightMobile?: boolean; newsletterMobile?: boolean; timelineMobile?: boolean; campaignWidgetMobile?: boolean; moduleAdsMobile?: boolean; moduleAds?: boolean; videoSectionMobile?: boolean; coreValuesMobile?: boolean; };
  sectionOrder?: string[];
  sectionOrderDesktop?: string[];
  sectionOrderMobile?: string[];
  visibilityDesktop?: Record<string, boolean>;
  visibilityMobile?: Record<string, boolean>;
  useMobilePrograms?: boolean; mobileProgramsTitle?: string; mobileProgramsSubtitle?: string;
  heroMode?: string; heroCarouselImages?: string[]; heroCarouselInterval?: number; heroCarouselTransition?: string;
  heroVideoUrl?: string; heroVideoFallback?: string;
  heroMobileMode?: string; heroMobileCarouselImages?: string[]; heroMobileCarouselInterval?: number; heroMobileCarouselTransition?: string;
  heroMobileVideoUrl?: string; heroMobileVideoFallback?: string;
  whatsappGroupLink?: string;
}

const DEFAULT: SiteSettings = {
  hero: { badge: "Building Communities through Social Architecture.", title: " ", titleItalic: " ", description: "Going beyond temporary relief to uplift underserved families through Health, Dignity, and Economic Independence.", button1: " Sahara Community Centers", button2: " Vision - Mission" },
  stats: [{ number: "25+", label: "Years of Service" }, { number: "10,000+", label: "Families Supported" }, { number: "5", label: "Active Programs" }, { number: "300+", label: "Annual Volunteers" }],
  vision: { heading: "Our Vision", content: "We envision a society where every individual—regardless of background—has access to fundamental rights, health, and dignity. Through sustainable Social Architecture, we foster permanent change rather than temporary relief." },
  mission: { heading: "Our Mission", content: "To uplift underserved families through a multi-dimensional approach centered on Physical and Mental Health, bridging the gap between resources and those in need through inclusive, secular, and practical community engagement." },
  centerCaption: "Sahara Community Center",
  successStories: [
    { title: "From Struggle to Strength", story: "Meena came to us with nothing — no income, no support, no hope. After enrolling in our skill development program, she learned tailoring, started her own boutique, and now employs three other women from her neighbourhood.", name: "Meena Devi", location: "Secunderabad", program: "Skill Development", image: "/images/physical.png" },
    { title: "A Family Healed", story: "After his father's death, Ravi's family spiralled into debt and depression. Spandana's mental health team and legal advocacy cell helped them reclaim their land rights and regain their footing — together.", name: "Ravi Kumar", location: "Old City, Hyderabad", program: "Legal & Mental Health", image: "/images/mental.png" },
    { title: "Health That Changed Everything", story: "Saritha had ignored a chronic condition for years because she couldn't afford doctors. Our free medical camp diagnosed and treated her in a single day. She calls it the day her second life began.", name: "Saritha P.", location: "Begumpet", program: "Medical Aid", image: "/images/hero.png" },
  ],
  promoVideoSection: {
    title: "See Our Work in Action",
    subtitle: "25 years of building communities — told in a few minutes. Watch how Spandana turns care into lasting change.",
    bullets: [
      "Reaching 10,000+ families across underserved communities",
      "Holistic care spanning health, livelihoods, and mental well-being",
      "Powered by 300+ dedicated volunteers every year",
    ],
  },
  testimonials: [
    { quote: "I was struggling to afford medicine for my children. Spandana's medical camp not only gave us free treatment — it gave us hope. Now I know we're not alone.", name: "Lakshmi M.", location: "Hyderabad", program: "Medical Aid" },
    { quote: "After the skill development training, I got my first real job at 34. My family finally has stability. I never thought it was possible — Spandana showed me it was.", name: "Raju K.", location: "Secunderabad", program: "Skill Development" },
    { quote: "The self-help group changed everything. I stopped feeling ashamed of asking for help. 25 women in our circle now support each other every single week.", name: "Anjali S.", location: "Begumpet", program: "Mental Health — Self-Help Group" },
    { quote: "They helped me navigate a legal dispute I didn't even know I had rights over. I kept my land. I kept my family's future. No words can describe what that means.", name: "Mohammed I.", location: "Old City", program: "Legal Advocacy" },
  ],
  newsletter: {
    title: "Join 5,000 changemakers.",
    subtitle: "Impact stories, volunteer opportunities, and community updates — straight to your inbox. No spam. Ever.",
  },
  timeline: [
    { year: "1999", title: "Founded", desc: "Spandana Care Aid Foundation is established with a bold vision — permanent change over temporary relief.", highlight: true },
    { year: "2001", title: "First Outreach", desc: "Community health camps reach underserved neighbourhoods in Hyderabad for the first time." },
    { year: "2004", title: "Sahara Center Opens", desc: "Our operational hub — the Sahara Community Center — becomes the heartbeat of all programs." },
    { year: "2007", title: "Skill Development Begins", desc: "Vocational training programs launch, giving hundreds of women and youth an economic lifeline." },
    { year: "2010", title: "Legal Advocacy Cell", desc: "A dedicated legal aid unit is established to fight for land rights, custody, and justice for the powerless." },
    { year: "2014", title: "Mental Health Focus", desc: "Self-help groups and awareness campaigns address the invisible crisis of mental health in the community." },
    { year: "2018", title: "Entrepreneur Initiative", desc: "Micro-grants and mentorship help community members launch small businesses and break the poverty cycle." },
    { year: "2022", title: "5,000 Families Reached", desc: "A landmark milestone — over 5,000 families have now received direct, sustained support from Spandana." },
    { year: "2024", title: "25 Years Strong", desc: "A quarter century of Social Architecture. Still building. Still showing up. The work isn't done.", highlight: true },
  ],
  trustStrip: [
    { label: "80G Certified",  sub: "Donor Tax Benefit" },
    { label: "12A Registered", sub: "Govt. of India" },
    { label: "NGO Darpan",     sub: "NITI Aayog Listed" },
    { label: "CSR 1",          sub: "Corporate Social Responsibility" },
    { label: "25+ Years",      sub: "Established 1999" },
  ],
  volunteers: [
    { name: "Priya Reddy",   role: "Healthcare Volunteer", years: "3 years", quote: "Every camp we run, I see people cry with relief. Not because they got medicine — but because someone showed up for them.", hours: "450+", program: "Medical Aid" },
    { name: "Arjun Sharma",  role: "Skills Trainer",       years: "5 years", quote: "I taught tailoring to 40 women last year. Two of them now run their own boutiques. That's what this is all about.", hours: "900+", program: "Skill Development" },
    { name: "Fatima Khan",   role: "Community Counselor",  years: "2 years", quote: "Mental health is still taboo here. But week by week, the self-help groups are changing that. I'm proud to be part of it.", hours: "280+", program: "Mental Health" },
    { name: "Vikram Nair",   role: "Legal Aid Volunteer",  years: "4 years", quote: "I've helped 60 families navigate the legal system. Most of them didn't even know they had rights. Now they do.", hours: "600+", program: "Legal Advocacy" },
  ],
  programsSection: { title: "Our Two Pillars of Care", subtitle: "We address wellbeing in its fullest sense — caring equally for the body and the mind, because neither can thrive without the other.", physical: { label: "Physical Health", title: "Body, Skills & Economic Empowerment", subtitle: "Holistic physical wellbeing alongside skills that build lasting economic independence.", items: [{ title: "Medical Aid", desc: "Healthcare access, screenings, and preventative care for vulnerable families." }, { title: "Entrepreneur Initiatives", desc: "Micro-entrepreneurship and peer-support groups for financial independence." }, { title: "Skill Development", desc: "Vocational training centers increasing employability and dignity." }, { title: "Legal Advocacy", desc: "Accessible legal guidance for underserved individuals and families." }, { title: "Environmental Stewardship", desc: "Community-driven sustainable living and carbon footprint reduction." }] }, mental: { label: "Mental Health", title: "Mind, Community & Safe Spaces", subtitle: "Mental wellness is the foundation of a thriving community. We normalise conversations and provide safe spaces.", items: [{ title: "Awareness Campaigns", desc: "Breaking stigmas and normalising mental health conversations in everyday life." }, { title: "Educational Outreach", desc: "Teaching communities how to identify mental health needs and offer meaningful help." }, { title: "Self-Help Groups", desc: "Peer-support circles fostering emotional resilience and community bonds." }, { title: "Counselling Access", desc: "Connecting families with trained counsellors and mental health professionals." }, { title: "Crisis Support", desc: "Safe, confidential spaces for shared experiences and immediate communal support." }] } },
  values: ["Justice", "Mercy", "Compassion", "Responsibility", "Accountability"],
  getInvolved: { title: "Join Our Mission", subtitle: "Whether you give your time, talent, or treasure — every contribution builds a better community." },
  contact: { email: "spandanacareaidfoundation@gmail.com", phone: "" },
  footer: { copyright: `© ${new Date().getFullYear()} Spandana Care Aid Foundation. All rights reserved.` },
  promoVideoId: "m0F3Qh67C5k",
};

const MOBILE_VALUE_COLORS = [
  { fill: "#1565C0", glow: "rgba(21,101,192,0.35)" },
  { fill: "#AD1457", glow: "rgba(173,20,87,0.35)" },
  { fill: "#6A1B9A", glow: "rgba(106,27,154,0.35)" },
  { fill: "#E65100", glow: "rgba(230,81,0,0.35)" },
  { fill: "#00695C", glow: "rgba(0,105,92,0.35)" },
];

const PHYSICAL_ICONS = [Shield, Users, BookOpen, Scale, Leaf];
const MENTAL_ICONS = [Megaphone, BookOpen, Users, HeartHandshake, Shield];
const VALUE_CONFIG = [
  { icon: Scale,          bg: "bg-blue-100 dark:bg-blue-950/50",     iconColor: "text-blue-600 dark:text-blue-400",     desc: "Ensuring fairness and equity for the underserved by removing systemic barriers to success." },
  { icon: Heart,          bg: "bg-rose-100 dark:bg-rose-950/50",     iconColor: "text-rose-600 dark:text-rose-400",     desc: "Acting with profound kindness toward those in distress, providing grace and support in times of crisis." },
  { icon: HeartHandshake, bg: "bg-purple-100 dark:bg-purple-950/50", iconColor: "text-purple-600 dark:text-purple-400", desc: "Deeply empathizing with and acting for the holistic well-being of every individual we encounter." },
  { icon: UserCheck,      bg: "bg-amber-100 dark:bg-amber-950/50",   iconColor: "text-amber-600 dark:text-amber-400",   desc: "Taking ownership of our mission and ensuring our actions create a sustainable, positive impact on society and the environment." },
  { icon: ShieldCheck,    bg: "bg-emerald-100 dark:bg-emerald-950/50", iconColor: "text-emerald-600 dark:text-emerald-400", desc: "Maintaining the highest standards of transparency and integrity in every initiative, remaining answerable to those we serve." },
];

/* ─── Core Values section ─── */
function CoreValues({ values, badge, taglines, descriptions }: { values: string[]; badge?: string; taglines?: string[]; descriptions?: string[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState<number | null>(null);
  const badgeText = badge ?? "Our Core Values";
  const taglineList = taglines?.length ? taglines : ["Build People Up", "Help People Grow", "Because People Matter"];
  return (
    <section id="values" className="py-5 md:py-12 px-6 md:px-12 bg-card overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 text-primary text-sm font-bold uppercase tracking-widest">
            {badgeText}
          </div>
          <div className="flex flex-row flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
            {taglineList.map((p, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-primary/40 text-base">✦</span>}
                <span className="font-serif italic">{p}</span>
              </span>
            ))}
          </div>
        </motion.div>
        {/* Mobile: compact 5-column icon row + tap-to-expand dropdown */}
        <div className="md:hidden">
          {/* Icon row */}
          <div className="grid grid-cols-5 gap-1 mb-2">
            {values.map((val, i) => {
              const cfg = VALUE_CONFIG[i] ?? VALUE_CONFIG[0];
              const Icon = cfg.icon;
              const vc = MOBILE_VALUE_COLORS[i];
              const isOpen = mobileOpen === i;
              return (
                <motion.button key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4, type: "spring", stiffness: 220 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setMobileOpen(isOpen ? null : i)}
                  className="flex flex-col items-center gap-1.5 min-w-0">
                  <div className="relative rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      backgroundColor: vc.fill,
                      boxShadow: isOpen ? `0 4px 16px ${vc.glow}` : `0 2px 8px ${vc.glow}`,
                      width: 44, height: 44, minWidth: 44,
                      outline: isOpen ? `2px solid ${vc.fill}` : "none",
                      outlineOffset: 2,
                    }}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="font-bold text-[8px] leading-tight text-center w-full truncate"
                    style={{ color: vc.fill }}>{val}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ color: vc.fill }}
                    className="opacity-60"
                  >
                    <ChevronDown size={10} />
                  </motion.div>
                </motion.button>
              );
            })}
          </div>

          {/* Expandable description panel */}
          <AnimatePresence mode="wait">
            {mobileOpen !== null && (() => {
              const i = mobileOpen;
              const cfg = VALUE_CONFIG[i] ?? VALUE_CONFIG[0];
              const Icon = cfg.icon;
              const vc = MOBILE_VALUE_COLORS[i];
              const desc = descriptions?.[i] ?? cfg.desc;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden">
                  <div className="rounded-2xl border p-4 mt-1"
                    style={{ borderColor: `${vc.fill}35`, background: `${vc.fill}08` }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: vc.fill, width: 34, height: 34 }}>
                        <Icon size={15} className="text-white" />
                      </div>
                      <h3 className="font-bold text-foreground text-base leading-tight"
                        style={{ color: vc.fill }}>{values[i]}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>

        {/* Desktop: grid layout */}
        <div className="hidden md:grid md:grid-cols-5 gap-3">
          {values.map((val, i) => {
            const cfg = VALUE_CONFIG[i] ?? VALUE_CONFIG[0];
            const Icon = cfg.icon;
            const isHov = hovered === i;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20, scale: 0.93 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45, type: "spring", stiffness: 240 }}
                animate={{ scale: isHov ? 1.03 : 1 }}
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
                style={{ borderColor: isHov ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border))", boxShadow: isHov ? "0 8px 24px hsl(var(--primary) / 0.12)" : "none" }}
                className="flex flex-col items-center justify-start p-4 rounded-2xl border bg-background cursor-default text-center min-h-[10rem]">
                <div className="flex flex-col items-center gap-3 w-full pt-2">
                  <motion.div animate={{ scale: isHov ? 1.12 : 1 }} transition={{ duration: 0.25 }}
                    className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className={cfg.iconColor} />
                  </motion.div>
                  <h3 className="font-bold text-foreground text-sm leading-tight">{val}</h3>
                </div>
                <AnimatePresence>
                  {isHov && (
                    <motion.p key="desc"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-xs text-muted-foreground leading-snug w-full">
                      {descriptions?.[i] ?? cfg.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Animated stat counter ─── */
function StatNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const num = parseInt(value.replace(/\D/g, ""), 10);
    if (isNaN(num)) { setDisplayed(value); return; }
    const suffix = value.replace(/[\d]/g, "");
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * num);
      setDisplayed(start + suffix);
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplayed(value);
    }
    requestAnimationFrame(tick);
  }, [inView, value]);

  return <span ref={ref}>{displayed}</span>;
}

/* ─── Tilt card wrapper ─── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 14;
    const y = ((e.clientY - top) / height - 0.5) * -14;
    el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale(1.04)`;
  }
  function resetMouse() {
    if (ref.current) ref.current.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
  }
  return (
    <div ref={ref} onMouseMove={handleMouse} onMouseLeave={resetMouse}
      style={{ transition: "transform 0.15s ease-out", transformStyle: "preserve-3d" }}
      className={className}>
      {children}
    </div>
  );
}

/* ─── Vision Video Player ─── */
function VisionVideoPlayer({ videoId, caption }: { videoId: string; caption: string }) {
  const [playing, setPlaying] = useState(false);
  /* Reset player when videoId changes — prevents Error 153 on stale embed */
  useState(() => { setPlaying(false); });
  const thumbUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : "/images/center.png";

  return (
    <div className="relative">
      {/* Main video card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, rotateY: 8 }}
        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9 }}
        className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#05091A] group"
        style={{ aspectRatio: "16/10" }}
      >
        {/* Thumbnail / iframe */}
        {playing && videoId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title="Spandana Care Aid Foundation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <>
            {/* Thumbnail */}
            <img
              src={thumbUrl}
              alt="Spandana story"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05091A]/80 via-[#05091A]/30 to-transparent" />

            {/* Play button */}
            {videoId && (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer"
                aria-label="Play video"
              >
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  {/* Pulsing ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white/20"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  />
                  <div className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl relative z-10">
                    <Play size={32} className="text-primary ml-1" fill="currentColor" />
                  </div>
                </motion.div>
                <span className="text-white/90 text-sm font-semibold tracking-wide drop-shadow">
                  Watch Our Story
                </span>
              </button>
            )}

            {/* Bottom label bar */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/70 text-xs font-medium">25+ Years of Social Architecture</span>
              </div>
              {!videoId && (
                <span className="text-white/50 text-xs">{caption}</span>
              )}
            </div>
          </>
        )}
      </motion.div>

      {/* Floating stat card */}
      <motion.div
        className="absolute -bottom-6 -left-6 bg-background p-5 rounded-2xl shadow-xl border border-border/50"
        initial={{ opacity: 0, x: -20, y: 20 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <HeartHandshake size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Families supported</div>
            <div className="text-xl font-serif font-bold text-foreground">10,000+</div>
          </div>
        </div>
      </motion.div>

      {/* Floating accent badge top-right */}
      <motion.div
        className="absolute -top-4 -right-4 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg"
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 300 }}
      >
        Est. 1999
      </motion.div>
    </div>
  );
}

/* ─── Scroll progress bar ─── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-[100] origin-left" style={{ scaleX: scrollYProgress }} />
  );
}

export default function Home() {
  const [s, setS] = useState<SiteSettings>(DEFAULT);
  const [videoOpen, setVideoOpen] = useState(false);
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [logoFloating, setLogoFloating] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [mobileCarouselIdx, setMobileCarouselIdx] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 140]);
  const isMobile = useIsMobile();
  const _sharedVis = s.visibility ?? {};
  const vis: Record<string, boolean | undefined> = isMobile
    ? (s.visibilityMobile ?? _sharedVis)
    : (s.visibilityDesktop ?? _sharedVis);
  const _secOrderDesktop: string[] = s.sectionOrderDesktop?.length
    ? s.sectionOrderDesktop
    : (s.sectionOrder?.length ? s.sectionOrder : DEFAULT_SECTION_ORDER);
  const secOrder: string[] = isMobile && s.sectionOrderMobile?.length
    ? s.sectionOrderMobile
    : _secOrderDesktop;
  const ord = (key: string) => { const i = secOrder.indexOf(key); return i >= 0 ? i * 10 : 990; };

  /* ── Mobile section visibility ── */
  const visHeroMobile = vis.heroMobile !== false;
  const visVisionMobile = vis.visionMissionMobile !== false;
  const visProgramsMobile = vis.programsMobile !== false;
  const visImpactTickerMobile = vis.impactTickerMobile !== false;
  const visTestimonialsMobile = vis.testimonialsMobile !== false;
  const visImpactCalculatorMobile = vis.impactCalculatorMobile !== false;
  const visVolunteerSpotlightMobile = vis.volunteerSpotlightMobile !== false;
  const visNewsletterMobile = vis.newsletterMobile !== false;
  const visTimelineMobile = vis.timelineMobile !== false;
  const visCampaignWidgetMobile = vis.campaignWidgetMobile !== false;
  const visModuleAdsMobile = vis.moduleAdsMobile !== false;

  /* ── Mobile hero text overrides ── */
  const heroMobile = isMobile && !!s.hero.useMobileText;
  const heroBadge = heroMobile && s.hero.mobileBadge ? s.hero.mobileBadge : s.hero.badge;
  const heroTitle = heroMobile && s.hero.mobileTitle ? s.hero.mobileTitle : s.hero.title;
  const heroTitleItalic = heroMobile && s.hero.mobileTitleItalic ? s.hero.mobileTitleItalic : s.hero.titleItalic;
  const heroDesc = heroMobile && s.hero.mobileDescription ? s.hero.mobileDescription : s.hero.description;
  /* ── Mobile stats override ── */
  const displayStats = isMobile && s.useMobileStats && s.mobileStats?.length ? s.mobileStats : s.stats;
  /* ── Mobile vision / mission override ── */
  const displayVision = isMobile && s.useMobileVision && s.mobileVision?.heading ? s.mobileVision : s.vision;
  const displayMission = isMobile && s.useMobileVision && s.mobileMission?.heading ? s.mobileMission : s.mission;
  /* ── Mobile programs header override ── */
  const programsTitle = isMobile && s.useMobilePrograms && s.mobileProgramsTitle
    ? s.mobileProgramsTitle : s.programsSection.title;
  const programsSubtitle = isMobile && s.useMobilePrograms && s.mobileProgramsSubtitle
    ? s.mobileProgramsSubtitle : s.programsSection.subtitle;

  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroBgState = useRef({ bgX: 0, scale: 1 });
  const heroPinchRef = useRef<{ initialDist: number; initialScale: number } | null>(null);
  const heroTouchRef = useRef<{ startX: number; startBgX: number } | null>(null);
  const heroAutoPanRef = useRef<{ rafId: number; dir: 1 | -1; paused: boolean }>({ rafId: 0, dir: 1, paused: false });

  function applyHeroBg() {
    const el = heroBgRef.current;
    if (!el) return;
    const { bgX, scale } = heroBgState.current;
    el.style.backgroundPositionX = `calc(50% + ${bgX}px)`;
    el.style.backgroundPositionY = "center";
    el.style.transform = `scale(${scale})`;
  }

  useEffect(() => {
    const el = heroRef.current;
    if (!el || !isMobile) return;

    function getTouchDist(touches: TouchList) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(e: TouchEvent) {
      heroAutoPanRef.current.paused = true;
      if (e.touches.length === 1) {
        heroTouchRef.current = { startX: e.touches[0].clientX, startBgX: heroBgState.current.bgX };
      }
      if (e.touches.length === 2) {
        heroPinchRef.current = {
          initialDist: getTouchDist(e.touches),
          initialScale: heroBgState.current.scale,
        };
        heroTouchRef.current = null;
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 1 && heroTouchRef.current) {
        const deltaX = e.touches[0].clientX - heroTouchRef.current.startX;
        const newBgX = Math.min(Math.max(heroTouchRef.current.startBgX + deltaX * 0.6, -250), 250);
        heroBgState.current.bgX = newBgX;
        applyHeroBg();
      }
      if (e.touches.length === 2 && heroPinchRef.current) {
        const dist = getTouchDist(e.touches);
        const ratio = dist / heroPinchRef.current.initialDist;
        const newScale = Math.min(Math.max(heroPinchRef.current.initialScale * ratio, 1.0), 2.5);
        heroBgState.current.scale = newScale;
        applyHeroBg();
      }
    }

    function onTouchEnd() {
      heroTouchRef.current = null;
      heroPinchRef.current = null;
      // Resume auto-pan from wherever the user left it
      heroAutoPanRef.current.paused = false;
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    // ── Auto-pan loop ──
    const AUTO_SPEED = 0.25;  // px per frame
    const AUTO_LIMIT = 160;   // max drift in either direction

    function autoPan() {
      if (!heroAutoPanRef.current.paused) {
        const state = heroBgState.current;
        state.bgX += AUTO_SPEED * heroAutoPanRef.current.dir;
        if (state.bgX >= AUTO_LIMIT)  { state.bgX = AUTO_LIMIT;  heroAutoPanRef.current.dir = -1; }
        if (state.bgX <= -AUTO_LIMIT) { state.bgX = -AUTO_LIMIT; heroAutoPanRef.current.dir = 1; }
        applyHeroBg();
      }
      heroAutoPanRef.current.rafId = requestAnimationFrame(autoPan);
    }

    heroAutoPanRef.current.rafId = requestAnimationFrame(autoPan);

    return () => {
      cancelAnimationFrame(heroAutoPanRef.current.rafId);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [isMobile]);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("spandana_settings");
      if (cached) setS({ ...DEFAULT, ...JSON.parse(cached) });
    } catch {}
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: SiteSettings) => {
        try { sessionStorage.setItem("spandana_settings", JSON.stringify(d)); } catch {}
        setS({ ...DEFAULT, ...d });
      })
      .catch(() => {});
  }, []);

  /* ── Carousel auto-cycle ── */
  useEffect(() => {
    const desktopMode = s.heroMode ?? "image";
    const desktopImages: string[] = s.heroCarouselImages ?? [];
    if (desktopMode !== "carousel" || desktopImages.length < 2) return;
    const interval = (s.heroCarouselInterval ?? 5) * 1000;
    const id = setInterval(() => setCarouselIdx((i) => (i + 1) % desktopImages.length), interval);
    return () => clearInterval(id);
  }, [s.heroMode, s.heroCarouselImages, s.heroCarouselInterval]);

  useEffect(() => {
    const mobileMode = s.heroMobileMode ?? "image";
    const mobileImages: string[] = s.heroMobileCarouselImages ?? [];
    if (mobileMode !== "carousel" || mobileImages.length < 2) return;
    const interval = (s.heroMobileCarouselInterval ?? 5) * 1000;
    const id = setInterval(() => setMobileCarouselIdx((i) => (i + 1) % mobileImages.length), interval);
    return () => clearInterval(id);
  }, [s.heroMobileMode, s.heroMobileCarouselImages, s.heroMobileCarouselInterval]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary selection:text-white overflow-x-hidden">
      <ScrollProgress />
      <Nav />

      {/* ── HERO ── */}
      {vis.hero !== false && (
      <section ref={heroRef} className={`relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-36 md:pt-24${!visHeroMobile ? " max-md:hidden" : ""}`}>
        {/* Parallax background — desktop: auto-pan; mobile: swipe + pinch-zoom */}
        {!isMobile ? (() => {
          const heroMode = s.heroMode ?? "image";
          /* ── Desktop: Video ── */
          if (heroMode === "video" && s.heroVideoUrl) {
            const rawUrl: string = s.heroVideoUrl;
            const ytMatch = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            const vmMatch = rawUrl.match(/vimeo\.com\/(\d+)/);
            const fallback = s.heroVideoFallback || s.heroImage || "/images/hero-indian.png";
            if (ytMatch) {
              return (
                <motion.div className="absolute inset-0 overflow-hidden" style={{ y: heroY }}>
                  <div className="absolute inset-0" style={{ backgroundImage: `url('${fallback}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`}
                    className="absolute pointer-events-none"
                    style={{ width: "160%", height: "160%", top: "-30%", left: "-30%", border: "none" }}
                    allow="autoplay; encrypted-media"
                    title="Hero background"
                  />
                </motion.div>
              );
            }
            if (vmMatch) {
              return (
                <motion.div className="absolute inset-0 overflow-hidden" style={{ y: heroY }}>
                  <div className="absolute inset-0" style={{ backgroundImage: `url('${fallback}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <iframe
                    src={`https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1&muted=1&loop=1&background=1`}
                    className="absolute pointer-events-none"
                    style={{ width: "160%", height: "160%", top: "-30%", left: "-30%", border: "none" }}
                    allow="autoplay; fullscreen"
                    title="Hero background"
                  />
                </motion.div>
              );
            }
            /* Direct video URL */
            return (
              <motion.div className="absolute inset-0 overflow-hidden" style={{ y: heroY }}>
                <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" poster={fallback}>
                  <source src={rawUrl} />
                </video>
              </motion.div>
            );
          }
          /* ── Desktop: Carousel ── */
          if (heroMode === "carousel") {
            const images: string[] = s.heroCarouselImages ?? [];
            const transition = s.heroCarouselTransition ?? "fade";
            const bgImg = images.length > 0 ? images[carouselIdx % images.length] : (s.heroImage || "/images/hero-indian.png");
            if (transition === "slide") {
              return (
                <motion.div className="absolute inset-0 overflow-hidden" style={{ y: heroY }}>
                  <AnimatePresence mode="wait">
                    <motion.div key={carouselIdx}
                      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
                      style={{ backgroundImage: `url('${bgImg}')` }}
                    />
                  </AnimatePresence>
                </motion.div>
              );
            }
            return (
              <motion.div className="absolute inset-0 overflow-hidden" style={{ y: heroY }}>
                <AnimatePresence mode="wait">
                  <motion.div key={carouselIdx}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
                    style={{ backgroundImage: `url('${bgImg}')` }}
                  />
                </AnimatePresence>
              </motion.div>
            );
          }
          /* ── Desktop: Single image (default) ── */
          return (
            <motion.div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
              style={{ y: heroY, backgroundImage: `url('${s.heroImage || "/images/hero-indian.png"}')` }}
              animate={{ x: ["0%", "-5%", "0%", "5%", "0%"] }}
              transition={{ duration: 40, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] }}
            />
          );
        })() : (() => {
          const mobileMode = s.heroMobileMode ?? "image";
          /* ── Mobile: Video ── */
          if (mobileMode === "video") {
            const rawUrl: string = s.heroMobileVideoUrl || s.heroVideoUrl || "";
            const ytMatch = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            const fallback = s.heroMobileVideoFallback || s.heroImageMobile || s.heroImage || "/images/hero-indian.png";
            if (ytMatch) {
              return (
                <motion.div className="absolute inset-0 overflow-hidden" style={{ y: heroY }}>
                  <div className="absolute inset-0" style={{ backgroundImage: `url('${fallback}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                    className="absolute pointer-events-none"
                    style={{ width: "160%", height: "160%", top: "-30%", left: "-30%", border: "none" }}
                    allow="autoplay; encrypted-media"
                    title="Hero background"
                  />
                </motion.div>
              );
            }
            if (rawUrl) {
              return (
                <motion.div className="absolute inset-0 overflow-hidden" style={{ y: heroY }}>
                  <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" poster={fallback}>
                    <source src={rawUrl} />
                  </video>
                </motion.div>
              );
            }
          }
          /* ── Mobile: Carousel ── */
          if (mobileMode === "carousel") {
            const images: string[] = s.heroMobileCarouselImages ?? [];
            const transition = s.heroMobileCarouselTransition ?? "fade";
            const bgImg = images.length > 0 ? images[mobileCarouselIdx % images.length] : (s.heroImageMobile || s.heroImage || "/images/hero-indian.png");
            if (transition === "slide") {
              return (
                <motion.div className="absolute inset-0 overflow-hidden" style={{ y: heroY }}>
                  <AnimatePresence mode="wait">
                    <motion.div key={mobileCarouselIdx}
                      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 bg-cover bg-no-repeat"
                      style={{ backgroundImage: `url('${bgImg}')`, backgroundPosition: "50% center" }}
                    />
                  </AnimatePresence>
                </motion.div>
              );
            }
            return (
              <motion.div className="absolute inset-0 overflow-hidden" style={{ y: heroY }}>
                <AnimatePresence mode="wait">
                  <motion.div key={mobileCarouselIdx}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cover bg-no-repeat"
                    style={{ backgroundImage: `url('${bgImg}')`, backgroundPosition: "50% center" }}
                  />
                </AnimatePresence>
              </motion.div>
            );
          }
          /* ── Mobile: Single image (default) ── */
          return (
            <motion.div className="absolute inset-0" style={{ y: heroY }}>
              <div
                ref={heroBgRef}
                className="absolute inset-0 bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url('${s.heroImageMobile || s.heroImage || "/images/hero-indian.png"}')`,
                  backgroundPosition: "50% center",
                  transformOrigin: "center center",
                }}
              />
            </motion.div>
          );
        })()}
        <div className="absolute inset-0 bg-[#0033A0] opacity-88" />

        {/* Animated orbs */}
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-300/10 blur-3xl pointer-events-none"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }} />

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 flex flex-col items-center">
          {/* Logo — clean entrance, then float starts only after entrance completes */}
          <motion.div
            className="mb-5 md:mb-10"
            initial={{ opacity: 0, scale: 0.88, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setLogoFloating(true)}
          >
            <motion.img
              src="/logo.png" alt="Spandana Care Aid Foundation"
              className="h-28 md:h-36 lg:h-40 xl:h-44 w-auto"
              style={{ filter: "brightness(0) invert(1)", WebkitFilter: "brightness(0) invert(1)", willChange: "transform" }}
              animate={logoFloating ? { y: [0, -8, 0] } : { y: 0 }}
              transition={logoFloating
                ? { duration: 3.8, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
                : { duration: 0 }}
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white/90 font-medium text-xs md:text-sm mb-6 md:mb-8 border border-white/25 backdrop-blur-sm text-center max-w-xs md:max-w-none"
          >
            <motion.span className="w-2 h-2 rounded-full bg-white flex-shrink-0" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
            <span>
              {heroBadge.includes('Social ') ? (
                <>
                  {heroBadge.split('Social ')[0]}
                  <br className="md:hidden" />
                  {'Social ' + heroBadge.split('Social ').slice(1).join('Social ')}
                </>
              ) : heroBadge}
            </span>
          </motion.div>

          {/* Headline — 2 clean lines */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-serif font-medium text-white leading-[1.1] mb-4 md:mb-6 tracking-tight drop-shadow-lg"
          >
            {heroTitle}<br />
            <span className="italic text-white/85">{heroTitleItalic}</span>
          </motion.h1>

          {/* Description — tight max-w to avoid orphan */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.8 }}
            className="text-base md:text-xl text-white/78 max-w-lg mx-auto mb-8 md:mb-12 leading-relaxed [text-wrap:balance]"
            dangerouslySetInnerHTML={{ __html: heroDesc }}
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <a
                href="/sahara"
                className="inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-3.5 shadow-2xl no-underline"
                style={{ backgroundColor: '#ffffff', textDecoration: 'none' }}
              >
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span className="text-base font-bold leading-tight whitespace-nowrap" style={{ color: '#0033A0' }}>
                    {s.hero.button1}
                  </span>
                  <span className="text-[9px] font-semibold tracking-wide uppercase leading-tight whitespace-nowrap" style={{ color: 'rgba(0,51,160,0.55)' }}>
                    An Initiative of Spandana Care Aid Foundation
                  </span>
                </div>
                <ArrowRight size={16} className="shrink-0" style={{ color: '#0033A0' }} />
              </a>
            </motion.div>
          </motion.div>

        </div>

        {/* ── Scroll down button ── */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          onClick={() => {
            const next = document.querySelector<HTMLElement>("[data-section='ticker'], [data-section='vision']");
            if (next) next.scrollIntoView({ behavior: "smooth" });
            else window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors cursor-pointer bg-transparent border-0 outline-none"
          aria-label="Scroll down"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={32} strokeWidth={1.5} />
          </motion.div>
        </motion.button>

      </section>
      )}

      {/* ── ORDERED SECTION FLOW — order driven by admin Page Builder ── */}
      <div className="flex flex-col">

      {/* impactTicker */}
      <div style={{ order: ord('impactTicker') }} className={!visImpactTickerMobile ? "max-md:hidden" : ""}>
        {vis.impactTicker !== false && <ImpactTicker />}
      </div>

      {/* visionMission */}
      <div style={{ order: ord('visionMission') }} className={!visVisionMobile ? "max-md:hidden" : ""}>
      {vis.visionMission !== false && (
      <VisionMissionBlock
        vision={displayVision}
        mission={displayMission}
        stories={s.successStories}
        videoId={s.promoVideoId}
        caption={s.centerCaption}
        showVideoMobile={vis.videoSectionMobile !== false}
        mobileSlot={<>
          {vis.coreValues !== false && vis.coreValuesMobile !== false && <CoreValues
            values={s.values}
            badge={s.coreValuesSection?.badge}
            taglines={s.coreValuesSection?.taglines}
            descriptions={s.coreValuesSection?.descriptions}
          />}
          <AdsCarousel />
        </>}
      />
      )}
      </div>{/* end visionMission */}

      {/* coreValues — desktop only; mobile version inside VisionMissionBlock above */}
      <div style={{ order: ord('coreValues') }} className="hidden md:block">
        {vis.coreValues !== false && (
          <CoreValues
            values={s.values}
            badge={s.coreValuesSection?.badge}
            taglines={s.coreValuesSection?.taglines}
            descriptions={s.coreValuesSection?.descriptions}
          />
        )}
      </div>

      {/* ads carousel — position controlled by Page Builder drag order */}
      <div style={{ order: ord('ads') }} className={!visModuleAdsMobile ? "max-md:hidden" : ""}>
        {vis.moduleAds !== false && <AdsCarousel />}
      </div>

      {/* testimonials */}
      <div style={{ order: ord('testimonials') }} className={!visTestimonialsMobile ? "max-md:hidden" : ""}>
        {vis.testimonials !== false && <Testimonials stories={s.testimonials} />}
      </div>

      {/* programs (desktop + mobile share one order slot) */}
      <div style={{ order: ord('programs') }}>
      {vis.programs !== false && (
      <section id="programs" className="hidden md:block py-14 md:py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-serif font-medium mb-3 md:mb-6">{programsTitle}</h2>
            <p className="hidden md:block text-lg text-muted-foreground">{programsSubtitle}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Physical */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              whileHover={{ y: -8, boxShadow: "0 24px 60px rgba(0,51,160,0.13)" }}
              className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col cursor-default">
              <div className="aspect-[16/9] overflow-hidden">
                <motion.img src="/images/physical.png" alt="Physical Health" className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }} />
              </div>
              <div className="p-5 md:p-10 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Shield size={20} />
                  </motion.div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">{s.programsSection.physical.label}</span>
                </div>
                <h3 className="text-lg md:text-2xl font-serif font-bold mb-2 md:mb-4 leading-snug">{s.programsSection.physical.title}</h3>
                <p className="hidden md:block text-muted-foreground leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: s.programsSection.physical.subtitle }} />
                <div className="space-y-4 flex-1">
                  {s.programsSection.physical.items.slice(0, 3).map((item, i) => {
                    const Icon = PHYSICAL_ICONS[i] ?? Shield;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                        whileHover={{ x: 4 }} className="flex items-start gap-3 group">
                        <motion.div whileHover={{ scale: 1.15, rotate: 5 }} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={16} />
                        </motion.div>
                        <div><p className="font-semibold text-sm group-hover:text-primary transition-colors">{item.title}</p><p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p></div>
                      </motion.div>
                    );
                  })}
                </div>
                <Link href="/sahara" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4 group">
                  See all {s.programsSection.physical.items.length} programs
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Mental */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
              whileHover={{ y: -8, boxShadow: "0 24px 60px rgba(109,40,217,0.1)" }}
              className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col cursor-default">
              <div className="aspect-[16/9] overflow-hidden">
                <motion.img src="/images/mental.png" alt="Mental Health" className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }} />
              </div>
              <div className="p-5 md:p-10 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Brain size={20} />
                  </motion.div>
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-700">{s.programsSection.mental.label}</span>
                </div>
                <h3 className="text-lg md:text-2xl font-serif font-bold mb-2 md:mb-4 leading-snug">{s.programsSection.mental.title}</h3>
                <p className="hidden md:block text-muted-foreground leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: s.programsSection.mental.subtitle }} />
                <div className="space-y-4 flex-1">
                  {s.programsSection.mental.items.slice(0, 3).map((item, i) => {
                    const Icon = MENTAL_ICONS[i] ?? Brain;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                        whileHover={{ x: 4 }} className="flex items-start gap-3 group">
                        <motion.div whileHover={{ scale: 1.15, rotate: 5 }} className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={16} />
                        </motion.div>
                        <div><p className="font-semibold text-sm group-hover:text-purple-700 transition-colors">{item.title}</p><p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p></div>
                      </motion.div>
                    );
                  })}
                </div>
                <Link href="/sahara" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-700 hover:underline underline-offset-4 group">
                  See all {s.programsSection.mental.items.length} programs
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      )}

      {/* programs mobile — compact tab view */}
      {vis.programs !== false && visProgramsMobile && (
      <section id="programs-mobile" className="md:hidden py-8 px-5">
        <div className="max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-center mb-6">
            <h2 className="text-xl font-serif font-medium leading-snug">{programsTitle}</h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{programsSubtitle}</p>
          </motion.div>
          <div className="space-y-3">
            {/* Physical Health pill */}
            <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
              className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield size={18} className="text-primary" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">{s.programsSection.physical.label}</span>
                  <h3 className="font-serif font-semibold text-sm leading-tight">{s.programsSection.physical.title}</h3>
                </div>
              </div>
              <div className="space-y-2">
                {s.programsSection.physical.items.slice(0, 3).map((item, i) => {
                  const Icon = PHYSICAL_ICONS[i] ?? Shield;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={12} className="text-primary" />
                      </div>
                      <p className="text-xs text-foreground font-medium leading-snug">{item.title}<span className="text-muted-foreground font-normal"> — {item.desc}</span></p>
                    </div>
                  );
                })}
              </div>
              <Link href="/programs/physical-health" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                All {s.programsSection.physical.items.length} programs <ArrowRight size={11} />
              </Link>
            </motion.div>
            {/* Mental Health pill */}
            <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.08 }}
              className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Brain size={18} className="text-purple-700" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-700 block">{s.programsSection.mental.label}</span>
                  <h3 className="font-serif font-semibold text-sm leading-tight">{s.programsSection.mental.title}</h3>
                </div>
              </div>
              <div className="space-y-2">
                {s.programsSection.mental.items.slice(0, 3).map((item, i) => {
                  const Icon = MENTAL_ICONS[i] ?? Brain;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={12} className="text-purple-700" />
                      </div>
                      <p className="text-xs text-foreground font-medium leading-snug">{item.title}<span className="text-muted-foreground font-normal"> — {item.desc}</span></p>
                    </div>
                  );
                })}
              </div>
              <Link href="/programs/mental-health" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:underline">
                All {s.programsSection.mental.items.length} programs <ArrowRight size={11} />
              </Link>
            </motion.div>
          </div>
          <div className="mt-4 text-center">
            <Link href="/sahara" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              View all programs <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
      )}

      </div>{/* end programs order slot */}

      {/* impactCalculator */}
      <div style={{ order: ord('impactCalculator') }} className={!visImpactCalculatorMobile ? "max-md:hidden" : ""}>
        {vis.impactCalculator !== false && <ImpactCalculator />}
      </div>

      {/* volunteerSpotlight */}
      <div style={{ order: ord('volunteerSpotlight') }} className={!visVolunteerSpotlightMobile ? "max-md:hidden" : ""}>
        {vis.volunteerSpotlight !== false && <VolunteerSpotlight volunteers={s.volunteers} onVolunteerClick={() => setVolunteerModalOpen(true)} />}
      </div>

      {/* campaignWidget */}
      <div style={{ order: ord('campaignWidget') }} className={!visCampaignWidgetMobile ? "max-md:hidden" : ""}>
        {vis.campaignWidget !== false && <CampaignWidget />}
      </div>

      {/* newsletter */}
      <div style={{ order: ord('newsletter') }} className={!visNewsletterMobile ? "max-md:hidden" : ""}>
        {vis.newsletter !== false && <Newsletter />}
      </div>

      {/* timeline */}
      <div style={{ order: ord('timeline') }} className={!visTimelineMobile ? "max-md:hidden" : ""}>
        {vis.timeline !== false && (
          <Timeline
            milestones={s.timeline}
            badge={s.timelineSection?.badge}
            heading={s.timelineSection?.heading}
            headingItalic={s.timelineSection?.headingItalic}
          />
        )}
      </div>

      </div>{/* end ordered section flow */}

      <Footer />

      {/* Volunteer Modal — mobile slide-up sheet */}
      <VolunteerModal
        open={volunteerModalOpen}
        onClose={() => setVolunteerModalOpen(false)}
        whatsappGroupLink={s.whatsappGroupLink}
      />

      {/* Community chat widget */}
      <CommunityChat />

      {/* YouTube lightbox */}
      <AnimatePresence>
        {videoOpen && s.promoVideoId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setVideoOpen(false)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${s.promoVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title="Promo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="w-full h-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
