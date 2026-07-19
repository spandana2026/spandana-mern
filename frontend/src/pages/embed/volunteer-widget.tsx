import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HeartHandshake, CheckCircle2, Loader2,
  MapPin, Phone, Mail, User, Briefcase, Calendar,
  Cake, Shield, ChevronDown, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form, FormControl, FormDescription, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

/* ─── Constants ─── */
const AREAS = [
  "Medical Aid", "Mental Health", "Fundraising", "Legal Advocacy",
  "Environment", "Support", "Education", "Education & Outreach",
  "Social Media", "Skill Development",
] as const;

const AVAILABILITY = [
  "Weekdays (Morning)", "Weekdays (Evening)",
  "Weekends", "Flexible", "One-time Events Only",
] as const;

const CHIP_SPANS: Record<string, number> = { "Legal Advocacy": 2, "Skill Development": 3 };

/* ─── Schema ─── */
const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  dob: z.string().min(1, "Please enter your date of birth"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your address"),
  occupation: z.string().min(2, "Please enter your occupation"),
  skills: z.string().optional(),
  areasOfInterest: z.array(z.enum(AREAS)).min(1, "Please select at least one area"),
  availability: z.array(z.enum(AVAILABILITY)).min(1, "Please select your availability"),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  motivation: z.string().min(10, "Please share why you'd like to volunteer"),
  declaration: z.boolean().refine(v => v === true, "You must accept this declaration"),
  childrenDeclaration: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.areasOfInterest.includes("Education & Outreach") && !data.childrenDeclaration) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "This declaration is required for Education & Outreach",
      path: ["childrenDeclaration"],
    });
  }
  if (data.dob) {
    const birth = new Date(data.dob);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    if (age < 18) {
      if (!data.emergencyContactName || data.emergencyContactName.length < 2)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for volunteers under 18", path: ["emergencyContactName"] });
      if (!data.emergencyContactPhone || data.emergencyContactPhone.length < 7)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for volunteers under 18", path: ["emergencyContactPhone"] });
    }
  }
});

type FormData = z.infer<typeof schema>;

/* ─── Helpers ─── */
function computeDobInfo(dob: string) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  const age = today.getFullYear() - birth.getFullYear() - (today < thisYearBirthday ? 1 : 0);
  if (age < 0 || age > 120) return null;
  const diffDays = Math.round((today.getTime() - thisYearBirthday.getTime()) / 86400000);
  let birthdayMsg = "", birthdayColor = "";
  if (diffDays === 0) { birthdayMsg = "🎂 Happy Birthday! What a perfect day to join the Spandana family!"; birthdayColor = "text-rose-500"; }
  else if (diffDays > 0 && diffDays <= 30) { birthdayMsg = "🎊 Belated Birthday Wishes!"; birthdayColor = "text-amber-500"; }
  else if (diffDays < 0 && diffDays >= -30) { birthdayMsg = `🎈 Advance Birthday Wishes! ${Math.abs(diffDays)} days to go!`; birthdayColor = "text-sky-500"; }
  let clubMsg = "";
  if (age < 18) clubMsg = "✨ Young energy changes everything — welcome aboard!";
  else if (age <= 29) clubMsg = "🚀 The 20s Club is where it all begins!";
  else if (age <= 39) clubMsg = "💪 The 30s — the decade of doing!";
  else if (age <= 49) clubMsg = "🌟 The 40s Club — wisdom meets unstoppable action!";
  else if (age <= 59) clubMsg = "🦁 The 50s Club — love your energy to volunteer!";
  else if (age <= 69) clubMsg = "👑 The 60s Club — your experience is our superpower!";
  else clubMsg = "🏆 A legend, no less — your spirit inspires everyone!";
  return { age, birthdayMsg, birthdayColor, clubMsg };
}

function getOccupationAffirmation(occ: string) {
  const o = occ.toLowerCase();
  if (o.includes("doctor") || o.includes("nurse") || o.includes("medical")) return "❤️ Healthcare heroes are the backbone of our Medical Aid camps!";
  if (o.includes("lawyer") || o.includes("advocate") || o.includes("legal")) return "⚖️ Legal minds like yours have changed lives at our advocacy drives!";
  if (o.includes("teacher") || o.includes("educator") || o.includes("professor")) return "📚 Educators like you light up our outreach and literacy programs!";
  if (o.includes("engineer") || o.includes("developer") || o.includes("tech") || o.includes("coder")) return "💻 Tech minds help us reach 10x more people — welcome aboard!";
  if (o.includes("psycholog") || o.includes("counsell") || o.includes("therapist")) return "🧠 Mental health champions — we've been waiting for you!";
  if (o.includes("student")) return "🎓 Students make the most passionate volunteers — you're going to love this!";
  if (o.includes("retired")) return "🌺 Retirement + purpose = magic. We're honoured to have you!";
  return "🌱 Every profession has a role at Spandana — can't wait to find yours!";
}

/* ─── Sub-components ─── */
function ChipPicker({ options, value, onChange, grid }: {
  options: readonly string[]; value: string[]; onChange: (v: string[]) => void; grid?: boolean;
}) {
  return (
    <div className={grid ? "grid grid-cols-3 gap-1.5" : "flex flex-wrap gap-2"}>
      {options.map((opt) => {
        const sel = (value ?? []).includes(opt);
        const span = grid ? (CHIP_SPANS[opt] ?? 1) : 1;
        return (
          <button key={opt} type="button"
            aria-pressed={sel}
            onClick={() => onChange(sel ? value.filter(v => v !== opt) : [...value, opt])}
            style={span > 1 ? { gridColumn: `span ${span}` } : undefined}
            className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all text-center leading-tight ${
              sel ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}>
            {sel && <span className="mr-0.5">✓</span>}{opt}
          </button>
        );
      })}
    </div>
  );
}

function DobPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => {
    if (!value) return "";
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  });
  const selectedDate = value ? new Date(value + "T00:00:00") : undefined;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d/]/g, "");
    if (raw.length === 2 && !raw.includes("/")) raw = raw + "/";
    else if (raw.length === 5 && raw.split("/").length === 2) raw = raw + "/";
    raw = raw.slice(0, 10);
    setText(raw);
    const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, d, m, y] = match;
      const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      const date = new Date(iso + "T00:00:00");
      if (!isNaN(date.getTime()) && date <= new Date()) onChange(iso);
    } else if (raw === "") onChange("");
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setText(`${d}/${m}/${y}`);
    setOpen(false);
  };

  return (
    <div className="relative flex items-center">
      <Input value={text} onChange={handleTextChange} placeholder="dd/mm/yyyy" maxLength={10} className="pr-10" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="absolute right-3 text-muted-foreground hover:text-primary transition-colors">
            <Calendar size={16} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarUI mode="single" selected={selectedDate} onSelect={handleCalendarSelect}
            disabled={(date) => date > new Date()} captionLayout="dropdown" fromYear={1920} toYear={new Date().getFullYear()} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
      <Icon size={13} />{children}
    </div>
  );
}

/* ─── Volunteer Widget (standalone, embeddable via iframe at /embed/volunteer) ─── */
export default function VolunteerWidget() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "", dob: "", email: "", phone: "", address: "",
      occupation: "", skills: "", motivation: "",
      emergencyContactName: "", emergencyContactPhone: "",
      areasOfInterest: [], availability: [],
      declaration: false, childrenDeclaration: false,
    },
  });

  const watchedName = form.watch("fullName");
  const watchedDob = form.watch("dob");
  const watchedOccupation = form.watch("occupation");
  const watchedAddress = form.watch("address");
  const watchedAreas = form.watch("areasOfInterest");
  const watchedAvail = form.watch("availability");

  const firstName = watchedName.trim().split(" ")[0] || "";
  const dobInfo = useMemo(() => computeDobInfo(watchedDob), [watchedDob]);
  const occAffirmation = watchedOccupation.length >= 3 ? getOccupationAffirmation(watchedOccupation) : "";
  const showMidAffirmation = watchedAddress.length >= 5;
  const showNearlyThere = watchedAreas.length >= 1 && watchedAvail.length >= 1;

  async function onSubmit(data: FormData) {
    setSubmitting(true); setError("");
    const age = dobInfo ? String(dobInfo.age) : "";
    try {
      const res = await fetch("/api/v1/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, age, dob: data.dob }),
      });
      const json = await res.json();
      if (res.ok && json.success) { setSubmitted(true); form.reset(); }
      else setError(json.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Could not send. Please check your connection and try again.");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">

      {/* ── Header ── */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 py-5 md:py-8">
          {/* Top: logo + org name */}
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <HeartHandshake size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/60">Spandana Care Aid Foundation</p>
              <p className="text-xs md:text-sm text-white/80 font-medium">Building Communities through Social Architecture</p>
            </div>
          </div>
          {/* Heading */}
          <h1 className="text-2xl md:text-4xl font-serif font-semibold text-white leading-tight mb-2">
            Don't just care —<br className="md:hidden" /> <span className="italic">show up.</span>
          </h1>
          <p className="text-sm text-white/65 max-w-lg">
            Fill in the form below and our team will reach out within 2–3 days.
            Doctors, lawyers, teachers, coders — we have a place for everyone.
          </p>
          {/* Stats strip */}
          <div className="flex gap-4 md:gap-8 mt-5 pt-5 border-t border-white/15">
            {[["300+", "Volunteers weekly"], ["25+", "Years of service"], ["50+", "Programs"], ["10k+", "Families helped"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-lg md:text-2xl font-serif font-bold text-white leading-none">{n}</p>
                <p className="text-[10px] md:text-xs text-white/55 mt-0.5 leading-tight">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Form card ── */}
      <main className="flex-1 py-8 md:py-14 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">

            {/* ── Success state ── */}
            {submitted ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-3xl p-10 md:p-14 text-center shadow-sm">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
                  <CheckCircle2 className="mx-auto mb-6 text-primary w-16 h-16" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-3">Thank you for stepping up!</h2>
                <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                  We've received your application. Our team will contact you within 2–3 days.
                  Welcome to the Spandana family. 💙
                </p>

                {/* WhatsApp CTA */}
                <div className="mt-8 mx-auto max-w-sm rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-5 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.549 4.1 1.512 5.834L.057 23.43a.75.75 0 0 0 .916.905l5.726-1.494A11.938 11.938 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.725 9.725 0 0 1-4.942-1.347l-.354-.21-3.668.958.975-3.563-.228-.366A9.72 9.72 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                    </svg>
                    <p className="font-semibold text-sm text-foreground">Join our Volunteer WhatsApp Community</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Connect with fellow Spandana volunteers and get event updates.</p>
                  <a href="https://chat.whatsapp.com/INVITE_LINK_HERE" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#25D366" }}>
                    Join the Community
                  </a>
                </div>
                <Button variant="outline" className="mt-5 rounded-full px-8" onClick={() => setSubmitted(false)}>
                  Submit Another Response
                </Button>
              </motion.div>
            ) : (

              /* ── Form ── */
              <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm">

                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Heart size={15} className="text-primary" fill="currentColor" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-serif font-bold">Volunteer Application</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">This form is friendly — we promise it won't bite. Fields marked * are required.</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">

                    {/* ── 1. Personal details ── */}
                    <SectionLabel icon={User}>
                      {firstName ? `Nice to meet you, ${firstName}!` : "Tell us about yourself"}
                    </SectionLabel>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl><Input placeholder="What do we call you?" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="dob" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <DobPicker value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                          <AnimatePresence>
                            {dobInfo && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 space-y-1">
                                <p className="text-xs font-semibold text-primary">Age: {dobInfo.age} years old</p>
                                {dobInfo.birthdayMsg && <p className={`text-xs font-medium ${dobInfo.birthdayColor}`}>{dobInfo.birthdayMsg}</p>}
                                <p className="text-xs text-muted-foreground italic">{dobInfo.clubMsg}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone / WhatsApp *</FormLabel>
                          <FormControl><Input placeholder="+91 XXXXX XXXXX" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl><Input placeholder="Street, City, State" {...field} /></FormControl>
                        <FormDescription className="text-xs">So we can connect you to programs near you.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Mid-form affirmation */}
                    <AnimatePresence>
                      {showMidAffirmation && (
                        <motion.div key="mid" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="rounded-xl bg-primary/8 border border-primary/20 px-4 py-3 text-center">
                          <p className="text-sm font-semibold text-primary">
                            You're halfway there, {firstName || "friend"}! Just a few more details. 💙
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── 2. Background ── */}
                    <SectionLabel icon={Briefcase}>Your background</SectionLabel>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="occupation" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation *</FormLabel>
                          <FormControl><Input placeholder="Doctor, Teacher, Student…" {...field} /></FormControl>
                          {occAffirmation && <p className="text-xs text-primary/80 italic mt-1">{occAffirmation}</p>}
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="skills" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Skills</FormLabel>
                          <FormControl><Input placeholder="Photography, First aid, Teaching…" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* ── 3. Areas of interest ── */}
                    <SectionLabel icon={MapPin}>Areas of interest *</SectionLabel>

                    <FormField control={form.control} name="areasOfInterest" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ChipPicker options={AREAS} value={field.value} onChange={field.onChange} grid />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* ── 4. Availability ── */}
                    <SectionLabel icon={Calendar}>Availability *</SectionLabel>

                    <FormField control={form.control} name="availability" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ChipPicker options={AVAILABILITY} value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Nearly there affirmation */}
                    <AnimatePresence>
                      {showNearlyThere && (
                        <motion.div key="near" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-center dark:bg-emerald-950/30 dark:border-emerald-800">
                          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            Almost there! Just two more steps. 🌟
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── 5. Emergency contact (shown conditionally) ── */}
                    {dobInfo && dobInfo.age < 18 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-5">
                        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 dark:bg-amber-950/30 dark:border-amber-800">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                            Since you're under 18, we need an emergency contact.
                          </p>
                        </div>
                        <SectionLabel icon={Shield}>Emergency contact</SectionLabel>
                        <div className="grid sm:grid-cols-2 gap-5">
                          <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Name *</FormLabel>
                              <FormControl><Input placeholder="Parent / Guardian name" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Phone *</FormLabel>
                              <FormControl><Input placeholder="+91 XXXXX XXXXX" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </motion.div>
                    )}

                    {/* ── 6. Motivation ── */}
                    <SectionLabel icon={Heart}>Your motivation *</SectionLabel>

                    <FormField control={form.control} name="motivation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Why do you want to volunteer with us? *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us what inspires you to give your time…" className="min-h-[100px] resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* ── 7. Declarations ── */}
                    <div className="space-y-4 rounded-2xl bg-muted/40 border border-border p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Declarations</p>

                      <FormField control={form.control} name="declaration" render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-3">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                          </FormControl>
                          <div className="flex flex-col gap-1">
                            <FormLabel className="text-sm font-medium leading-snug cursor-pointer">
                              I confirm that all information provided is accurate. I understand that Spandana may conduct background checks for certain roles. *
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )} />

                      <AnimatePresence>
                        {watchedAreas.includes("Education & Outreach") && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                            <FormField control={form.control} name="childrenDeclaration" render={({ field }) => (
                              <FormItem className="flex flex-row items-start gap-3">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                                </FormControl>
                                <div className="flex flex-col gap-1">
                                  <FormLabel className="text-sm font-medium leading-snug cursor-pointer">
                                    I acknowledge that working with children requires additional responsibility. I agree to uphold child safety standards. *
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* ── Error message ── */}
                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="rounded-xl bg-destructive/10 border border-destructive/25 px-4 py-3 text-sm text-destructive font-medium">
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── Submit ── */}
                    <Button type="submit" disabled={submitting} size="lg"
                      className="w-full rounded-2xl text-base font-semibold h-14 shadow-md">
                      {submitting ? (
                        <><Loader2 size={18} className="animate-spin mr-2" /> Submitting…</>
                      ) : (
                        <><HeartHandshake size={18} className="mr-2" /> Submit My Volunteer Application</>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Your information is kept confidential and used only for volunteer coordination.
                    </p>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer strip */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Spandana Care Aid Foundation · All rights reserved
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Questions? Email us at{" "}
              <a href="mailto:spandanacareaidfoundation@gmail.com" className="text-primary hover:underline">
                spandanacareaidfoundation@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

