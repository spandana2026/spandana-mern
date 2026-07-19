import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, ChevronDown, ChevronUp, CalendarDays, Tag } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: string;
  published: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Health": "bg-rose-100 text-rose-700 border-rose-200",
  "Skills": "bg-amber-100 text-amber-700 border-amber-200",
  "Mental Health": "bg-purple-100 text-purple-700 border-purple-200",
  "Legal": "bg-blue-100 text-blue-700 border-blue-200",
  "Environment": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Education": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Community": "bg-orange-100 text-orange-700 border-orange-200",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-primary/10 text-primary border-primary/20";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString("en-IN", { day: "numeric" }),
    month: d.toLocaleDateString("en-IN", { month: "short" }),
    year: d.toLocaleDateString("en-IN", { year: "numeric" }),
    full: d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    isPast: d < new Date(new Date().setHours(0, 0, 0, 0)),
  };
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const dt = formatDate(event.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45 }}
      className={`bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md ${dt.isPast ? "opacity-70" : ""}`}
    >
      <button
        className="w-full text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex items-stretch gap-0">
          <div className={`flex flex-col items-center justify-center px-4 py-5 min-w-[72px] shrink-0 ${dt.isPast ? "bg-muted" : "bg-primary"}`}>
            <span className={`text-2xl font-serif font-bold leading-none ${dt.isPast ? "text-muted-foreground" : "text-white"}`}>{dt.day}</span>
            <span className={`text-xs font-semibold uppercase tracking-wide mt-0.5 ${dt.isPast ? "text-muted-foreground" : "text-white/80"}`}>{dt.month}</span>
            <span className={`text-[10px] ${dt.isPast ? "text-muted-foreground" : "text-white/60"}`}>{dt.year}</span>
          </div>

          <div className="flex-1 px-4 py-4 flex flex-col justify-center gap-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${categoryColor(event.category)}`}>
                {event.category}
              </span>
              {dt.isPast && (
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  Past
                </span>
              )}
            </div>
            <h3 className="font-serif font-semibold text-base leading-snug line-clamp-2 text-foreground">{event.title}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={11} className="shrink-0" /> {event.time}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={11} className="shrink-0" /> <span className="truncate">{event.location}</span>
            </div>
          </div>

          <div className="flex items-center px-4 shrink-0">
            {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {event.image && (
                <div className="w-full h-44 overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="px-6 py-5">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{event.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary shrink-0" />
                    {dt.full}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-primary shrink-0" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary shrink-0" />
                    {event.location}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface EventsPageCms { badge?: string; heading?: string; headingItalic?: string; subheading?: string; }

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [cms, setCms] = useState<EventsPageCms>({});
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: Event[]) => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d?.eventsPage) setCms(d.eventsPage); })
      .catch(() => {});
  }, []);

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const filtered = events.filter((e) => {
    const d = new Date(e.date);
    if (filter === "upcoming") return d >= today;
    if (filter === "past") return d < today;
    return true;
  });

  const upcomingCount = events.filter((e) => new Date(e.date) >= today).length;
  const pastCount = events.filter((e) => new Date(e.date) < today).length;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-x-hidden">
      <Nav />

      <section className="pt-28 pb-16 px-6 md:px-12 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white/90 text-sm font-medium mb-6 border border-white/20">
              <CalendarDays size={15} /> {cms.badge ?? "Upcoming Events"}
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-medium text-white mb-5 leading-tight">
              {cms.heading ?? "Events &"}<br /><span className="italic text-white/85">{cms.headingItalic ?? "Community Gatherings"}</span>
            </h1>
            <p className="text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
              {cms.subheading ?? "From health camps to skill workshops — find out what's happening at Spandana and how you can be part of it."}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 px-6 md:px-12 flex-1">
        <div className="max-w-3xl mx-auto">

          <div className="flex items-center gap-2 mb-8 bg-muted/50 rounded-2xl p-1.5 w-fit">
            {([
              { key: "upcoming", label: `Upcoming (${upcomingCount})` },
              { key: "past", label: `Past (${pastCount})` },
              { key: "all", label: "All" },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === key ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-border rounded-2xl">
              <CalendarDays size={36} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground font-medium">No {filter === "upcoming" ? "upcoming" : filter === "past" ? "past" : ""} events right now.</p>
              <p className="text-xs text-muted-foreground mt-1">Check back soon — we're always planning something.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filtered.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
