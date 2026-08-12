import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HeartHandshake, CheckCircle2, Loader2,
  MapPin, Phone, Mail, User, Briefcase, Calendar, AlertCircle, Cake, Shield, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

const AREAS = ["Medical Aid", "Mental Health", "Fundraising", "Legal Advocacy", "Environment", "Support", "Education", "Education & Outreach", "Social Media", "Skill Development"] as const;
const CHIP_SPANS: Record<string, number> = { "Legal Advocacy": 2, "Skill Development": 3 };
const AVAILABILITY = ["Weekdays (Morning)", "Weekdays (Evening)", "Weekends", "Flexible", "One-time Events Only"] as const;

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
  declaration: z.boolean().refine(val => val === true, "You must accept this declaration to proceed"),
  childrenDeclaration: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.areasOfInterest.includes("Education & Outreach") && !data.childrenDeclaration) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "This declaration is required for anyone working in Education & Outreach",
      path: ["childrenDeclaration"],
    });
  }
  if (data.dob) {
    const birth = new Date(data.dob);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    if (age < 18) {
      if (!data.emergencyContactName || data.emergencyContactName.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for volunteers under 18", path: ["emergencyContactName"] });
      }
      if (!data.emergencyContactPhone || data.emergencyContactPhone.length < 7) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for volunteers under 18", path: ["emergencyContactPhone"] });
      }
    }
  }
});

type FormData = z.infer<typeof schema>;


function computeDobInfo(dob: string): { age: number; birthdayMsg: string; birthdayColor: string; clubMsg: string } | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  const age = today.getFullYear() - birth.getFullYear() - (today < thisYearBirthday ? 1 : 0);

  if (age < 0 || age > 120) return null;

  const diffDays = Math.round((today.getTime() - thisYearBirthday.getTime()) / 86400000);

  let birthdayMsg = "";
  let birthdayColor = "";
  if (diffDays === 0) {
    birthdayMsg = "🎂 Happy Birthday! What a perfect day to join the Spandana family!";
    birthdayColor = "text-rose-400";
  } else if (diffDays > 0 && diffDays <= 30) {
    birthdayMsg = `🎊 Belated Birthday Wishes! Hope the celebrations were amazing.`;
    birthdayColor = "text-amber-400";
  } else if (diffDays < 0 && diffDays >= -30) {
    birthdayMsg = `🎈 Advance Birthday Wishes! ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} to go — the countdown is on!`;
    birthdayColor = "text-sky-400";
  }

  let clubMsg = "";
  if (age < 18) clubMsg = "✨ Wow — you are just perfect to be a part of our volunteer's world! Young energy changes everything.";
  else if (age <= 19) clubMsg = "🌟 Wow — you are just perfect to be a part of our volunteer's world! The teens are taking over — in the best way!";
  else if (age <= 29) clubMsg = "🚀 Wow — you are just perfect to be a part of our volunteer's world! The 20s Club is where it all begins!";
  else if (age <= 39) clubMsg = "💪 Wow — you are just perfect to be a part of our volunteer's world! Welcome to the 30s — the decade of doing!";
  else if (age <= 49) clubMsg = "🌟 Wow — you are just perfect to be a part of our volunteer's world! Welcome to the 40s Club — wisdom meets unstoppable action!";
  else if (age <= 59) clubMsg = "🦁 You still got a role to play with us — and what a role it will be! Welcome to the 50s Club. Love your energy to be a volunteer!";
  else if (age <= 69) clubMsg = "👑 You still got a role to play with us! Welcome to the 60s Club — your experience is our greatest superpower. Love your energy to be a volunteer!";
  else clubMsg = "🏆 You still got a role to play with us — a legend, no less! Your spirit inspires every single one of us. Love your energy to be a volunteer!";

  return { age, birthdayMsg, birthdayColor, clubMsg };
}

function getOccupationAffirmation(occ: string): string {
  const o = occ.toLowerCase();
  if (o.includes("doctor") || o.includes("physician") || o.includes("surgeon") || o.includes("nurse") || o.includes("medical")) return "❤️ Healthcare heroes are the backbone of our Medical Aid camps!";
  if (o.includes("lawyer") || o.includes("advocate") || o.includes("legal")) return "⚖️ Legal minds like yours have changed lives at our advocacy drives!";
  if (o.includes("teacher") || o.includes("educator") || o.includes("professor")) return "📚 Educators like you light up our outreach and literacy programs!";
  if (o.includes("engineer") || o.includes("developer") || o.includes("software") || o.includes("tech") || o.includes("coder")) return "💻 Tech minds help us reach 10x more people — welcome aboard!";
  if (o.includes("psycholog") || o.includes("counsell") || o.includes("therapist")) return "🧠 Mental health champions — we've been waiting for you!";
  if (o.includes("student")) return "🎓 Students make the most passionate volunteers — you're going to love this!";
  if (o.includes("retired")) return "🌺 Retirement + purpose = magic. We're honoured to have you!";
  if (o.includes("artist") || o.includes("designer") || o.includes("creative")) return "🎨 Your creativity will bring our campaigns to life!";
  return "🌱 Every profession has a role at Spandana — can't wait to find yours!";
}

function ChipPicker({ options, value, onChange, grid }: { options: readonly string[]; value: string[]; onChange: (v: string[]) => void; grid?: boolean }) {
  return (
    <div className={grid ? "grid grid-cols-3 gap-1.5" : "flex flex-wrap gap-2"}>
      {options.map((opt) => {
        const sel = (value ?? []).includes(opt);
        const span = grid ? (CHIP_SPANS[opt] ?? 1) : 1;
        return (
          <button key={opt} type="button"
            data-chip
            aria-pressed={sel}
            onClick={() => onChange(sel ? value.filter((v) => v !== opt) : [...value, opt])}
            style={span > 1 ? { gridColumn: `span ${span}` } : undefined}
            className={`py-1.5 px-1.5 rounded-lg border text-[11px] font-medium transition-all text-center leading-tight ${sel ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
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
    // Auto-insert slashes
    if (raw.length === 2 && !raw.includes("/")) raw = raw + "/";
    else if (raw.length === 5 && raw.split("/").length === 2) raw = raw + "/";
    raw = raw.slice(0, 10);
    setText(raw);
    const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, d, m, y] = match;
      const iso = `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
      const date = new Date(iso + "T00:00:00");
      if (!isNaN(date.getTime()) && date <= new Date()) onChange(iso);
    } else if (raw === "") {
      onChange("");
    }
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
          <CalendarUI
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            disabled={(date) => date > new Date()}
            captionLayout="dropdown"
            fromYear={1920}
            toYear={new Date().getFullYear()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SectionLabel({ icon: Icon, children, className }: { icon: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-bold uppercase text-primary ${className ?? "tracking-widest"}`}>
      <Icon size={13} />{children}
    </div>
  );
}

export default function VolunteerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [pageSettings, setPageSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d?.volunteerPage) setPageSettings(d.volunteerPage); })
      .catch(() => {});
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "", dob: "", email: "", phone: "", address: "",
      occupation: "", skills: "", motivation: "",
      emergencyContactName: "", emergencyContactPhone: "",
      areasOfInterest: [], availability: [],
    },
  });

  const watchedName = form.watch("fullName");
  const watchedDob = form.watch("dob");
  const watchedOccupation = form.watch("occupation");
  const watchedAddress = form.watch("address");
  const watchedAreas = form.watch("areasOfInterest");
  const watchedAvailability = form.watch("availability");

  const firstName = watchedName.trim().split(" ")[0] || "";
  const dobInfo = useMemo(() => computeDobInfo(watchedDob), [watchedDob]);
  const occAffirmation = watchedOccupation.length >= 3 ? getOccupationAffirmation(watchedOccupation) : "";

  // Progress affirmations
  const showMidAffirmation = watchedAddress.length >= 5;
  const showNearlyThereAffirmation = (watchedAreas as string[])?.length >= 1 && (watchedAvailability as string[])?.length >= 1;

  async function onSubmit(data: FormData) {
    setSubmitting(true); setError("");
    const age = dobInfo ? String(dobInfo.age) : "";
    try {
      const res = await fetch("/api/v1/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, age, dob: data.dob, formType: "volunteer" }),
      });
      const json = await res.json();
      if (res.ok && json.success) { setSubmitted(true); form.reset(); }
      else setError(json.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Could not send. Please check your connection and try again.");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-x-hidden">
      <Nav />

      <section className="pt-[6.5rem] pb-10 flex items-center justify-center md:pt-24 md:pb-8 px-6 md:px-12 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-lg md:text-4xl font-serif font-medium text-white mb-1 md:mb-2 leading-none whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="hidden md:block">{pageSettings.heading || "Don't just care — show up."}</span>
            <span className="md:hidden">{pageSettings.headingMobile || pageSettings.heading || "Don't just care — show up."}</span>
          </h1>
          <p className="text-xs md:text-sm text-white/65 max-w-md mx-auto">
            <span className="hidden md:block" dangerouslySetInnerHTML={{ __html: pageSettings.subheading || "Fill in the form and we'll reach out within 2–3 days." }} />
            <span className="md:hidden" dangerouslySetInnerHTML={{ __html: pageSettings.subheadingMobile || pageSettings.subheading || "Fill in the form and we'll reach out within 2–3 days." }} />
          </p>
        </div>
      </section>

      <section className="py-4 px-6 md:px-12 bg-card border-b border-border">
        <p className="max-w-4xl mx-auto text-xs text-muted-foreground leading-relaxed text-center">
          <span className="hidden md:block" dangerouslySetInnerHTML={{ __html: pageSettings.intro || "Join 300+ volunteers every week. One event or ongoing — every hour counts. Doctors, lawyers, teachers, coders — we have a place for everyone." }} />
          <span className="md:hidden" dangerouslySetInnerHTML={{ __html: pageSettings.introMobile || pageSettings.intro || "Join 300+ volunteers every week. One event or ongoing — every hour counts. Doctors, lawyers, teachers, coders — we have a place for everyone." }} />
        </p>
      </section>

      <section className="py-16 px-6 md:px-12 bg-background flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm relative">
            {/* Dismiss X — only show when form is active */}
            {!submitted && !dismissed && (
              <button
                onClick={() => setDismissed(true)}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
                aria-label="Fill later"
              >
                <X size={16} />
              </button>
            )}
            <AnimatePresence mode="wait">
              {dismissed ? (
                <motion.div key="dismissed" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  <div className="text-5xl mb-4">🕐</div>
                  <h3 className="text-xl font-serif font-medium mb-2">No rush — we'll be here!</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">Come back whenever you're ready. The form takes just a few minutes to fill.</p>
                  <Button className="rounded-full" onClick={() => setDismissed(false)}>Fill the form now</Button>
                </motion.div>
              ) : submitted ? (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="text-center py-10">
                  <CheckCircle2 className="mx-auto mb-6 text-primary w-16 h-16" />
                  <h3 className="text-2xl font-serif font-medium mb-3">Thank you for stepping up!</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                    We've received your application. Our team will contact you within 2–3 days. Welcome to the Spandana family.
                  </p>

                  {/* WhatsApp community CTA */}
                  <div className="mt-8 mx-auto max-w-sm rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-5">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.549 4.1 1.512 5.834L.057 23.43a.75.75 0 0 0 .916.905l5.726-1.494A11.938 11.938 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.725 9.725 0 0 1-4.942-1.347l-.354-.21-3.668.958.975-3.563-.228-.366A9.72 9.72 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                      </svg>
                      <p className="font-semibold text-sm text-foreground">Join our Volunteer WhatsApp Community</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Connect with fellow Spandana volunteers, get updates on events, and stay in the loop.</p>
                    <a
                      href="https://chat.whatsapp.com/INVITE_LINK_HERE"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      Join the Community
                    </a>
                  </div>

                  <Button variant="outline" className="mt-4 rounded-full px-8" onClick={() => setSubmitted(false)}>Submit Another Response</Button>
                </motion.div>
              ) : (
                <div key="form">
                  <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-serif font-bold mb-1 whitespace-nowrap">Join us Application</h2>
                    <p className="text-sm text-muted-foreground">Hey there! This form is friendly — we promise it won't bite.</p>
                    <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">Fields marked * are required.</p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                      {/* ── Personal Details ── */}
                      <SectionLabel icon={User} className="tracking-wide whitespace-nowrap">
                        {firstName ? `Nice to meet you, ${firstName}!` : "Tell us a little about yourself"}
                      </SectionLabel>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl><Input placeholder="What do we call you?" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Date of Birth → auto-computes age */}
                        <FormField control={form.control} name="dob" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth *</FormLabel>
                            <FormControl>
                              <DobPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                            <AnimatePresence>
                              {dobInfo && (
                                <motion.div
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                                  className="mt-2 space-y-1.5">
                                  <p className="text-xs font-semibold text-primary">Age: {dobInfo.age} years old</p>
                                  <p className={`text-xs font-medium ${dobInfo.birthdayColor}`}>{dobInfo.birthdayMsg}</p>
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
                          <FormDescription className="text-xs whitespace-nowrap">So we can connect you to programs near you.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* ── Mid-form motivational banner ── */}
                      <AnimatePresence>
                        {showMidAffirmation && (
                          <motion.div
                            key="mid-affirmation"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="rounded-xl bg-primary/8 border border-primary/20 px-4 py-3 text-center"
                          >
                            <p className="text-sm font-semibold text-primary">
                              {firstName ? `💪 Halfway there, ${firstName}!` : "💪 You're halfway there!"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">You're doing a brilliant job — keep going!</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ── Professional Details ── */}
                      <div className="border-t border-border pt-6">
                        <SectionLabel icon={Briefcase}>
                          {firstName ? `${firstName}, what do you do when you're not changing lives?` : "Your professional side"}
                        </SectionLabel>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <FormField control={form.control} name="occupation" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation / Profession *</FormLabel>
                            <FormControl><Input placeholder="e.g. Doctor, Teacher, Engineer" {...field} /></FormControl>
                            <AnimatePresence>
                              {occAffirmation && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                                  className="text-xs text-primary font-medium mt-1.5 italic">
                                  {occAffirmation}
                                </motion.p>
                              )}
                            </AnimatePresence>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="skills" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Skills <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                            <FormControl><Input placeholder="e.g. Counseling, Finance, Art…" {...field} /></FormControl>
                            <FormDescription className="text-xs whitespace-nowrap">Any hidden talents beyond your occupation.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {/* ── Volunteer Preferences ── */}
                      <div className="border-t border-border pt-6">
                        <SectionLabel icon={Calendar} className="tracking-wide whitespace-nowrap">
                          {firstName ? `Now ${firstName}, where do you see yourself making an impact?` : "Where would you like to help?"}
                        </SectionLabel>
                      </div>

                      <FormField control={form.control} name="areasOfInterest" render={({ field }) => (
                        <FormItem>
                          <FormLabel><span className="whitespace-nowrap">Areas of Interest * <span className="text-xs font-normal text-muted-foreground">(pick all that excite you)</span></span></FormLabel>
                          <FormControl>
                            <ChipPicker options={AREAS} value={field.value as string[]} onChange={field.onChange} grid />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="availability" render={({ field }) => (
                        <FormItem>
                          <FormLabel><span className="whitespace-nowrap">When are you free? * <span className="text-xs font-normal text-muted-foreground">(select all that apply)</span></span></FormLabel>
                          <FormControl>
                            <ChipPicker options={AVAILABILITY} value={field.value as string[]} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* ── Nearly there motivational banner ── */}
                      <AnimatePresence>
                        {showNearlyThereAffirmation && (
                          <motion.div
                            key="nearly-there"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="rounded-xl bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30 px-4 py-3 text-center"
                          >
                            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                              {firstName ? `🌟 Almost there, ${firstName}!` : "🌟 Almost there!"}
                            </p>
                            <p className="text-xs text-green-600/80 dark:text-green-500/80 mt-0.5">Just a few more steps and you're part of the Spandana family! 🎉</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ── Emergency Contact ── */}
                      <div className="border-t border-border pt-3">
                        <SectionLabel icon={Phone} className="tracking-wide whitespace-nowrap">Just in case — Emergency Contact</SectionLabel>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {dobInfo && dobInfo.age < 18
                            ? "Required for volunteers under 18 — a parent or guardian contact."
                            : "Optional — someone we can reach if needed during events."}
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name{dobInfo && dobInfo.age < 18 ? " *" : " (optional)"}</FormLabel>
                            <FormControl><Input placeholder="Parent, partner, friend…" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone{dobInfo && dobInfo.age < 18 ? " *" : " (optional)"}</FormLabel>
                            <FormControl><Input placeholder="+91 XXXXX XXXXX" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {/* ── Motivation ── */}
                      <div className="border-t border-border pt-6">
                        <SectionLabel icon={Mail} className="tracking-wide whitespace-nowrap">
                          {firstName ? `Last one, ${firstName} — the most important question` : "The most important question"}
                        </SectionLabel>
                        <p className="text-xs text-muted-foreground mt-1">This is your moment — tell us what brings you here in your own words.</p>
                      </div>

                      {/* ── Pre-motivation nudge ── */}
                      <div className="rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30 px-4 py-3 text-center">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">✍️ Last stretch — you've got this!</p>
                        <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-0.5">
                          Even "I just want to help people" is a perfect answer. No essays, no pressure — just your heart. 😊
                        </p>
                      </div>

                      <FormField control={form.control} name="motivation" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="whitespace-nowrap">Why do you want to volunteer with us? *</FormLabel>
                          <FormControl>
                            <Textarea placeholder={`${firstName ? `${firstName}, w` : "W"}hy does this cause call to you?`}
                              className="min-h-[120px] resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* ── Safeguarding Declaration ── */}
                      <div className="border-t border-border pt-6">
                        <SectionLabel icon={Shield}>Safeguarding Declaration</SectionLabel>
                        <p className="text-xs text-muted-foreground mt-1">
                          This is a standard requirement for all volunteers. Your honest declaration helps us keep everyone safe.
                        </p>
                      </div>

                      <FormField control={form.control} name="declaration" render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value ?? false}
                                onCheckedChange={field.onChange}
                                className="mt-0.5 shrink-0"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="text-sm font-medium leading-snug cursor-pointer">
                                General Declaration *
                              </FormLabel>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                I declare on my honour that I have no criminal convictions or pending criminal cases against me, and that all information provided in this application is true and accurate to the best of my knowledge.
                              </p>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )} />

                      {form.watch("areasOfInterest")?.includes("Education & Outreach") && (
                        <FormField control={form.control} name="childrenDeclaration" render={({ field }) => (
                          <FormItem>
                            <div className="flex items-start gap-3 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value ?? false}
                                  onCheckedChange={field.onChange}
                                  className="mt-0.5 shrink-0"
                                />
                              </FormControl>
                              <div className="space-y-1">
                                <FormLabel className="text-sm font-semibold text-primary leading-snug cursor-pointer">
                                  Children Safeguarding Declaration *
                                </FormLabel>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Since you've selected <strong>Education & Outreach</strong>, I additionally declare that I have never been convicted of, or charged with, any offence involving children or vulnerable persons. I am aware of the Protection of Children from Sexual Offences (POCSO) Act, 2012, and commit to upholding the highest standards of conduct when working with children and youth.
                                </p>
                                <FormMessage />
                              </div>
                            </div>
                          </FormItem>
                        )} />
                      )}

                      {error && (
                        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
                          <AlertCircle size={15} className="shrink-0" /> {error}
                        </div>
                      )}

                      <Button type="submit" size="lg" className="w-full rounded-full h-12 text-sm md:h-14 md:text-base" disabled={submitting}>
                        {submitting
                          ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Submitting your application…</>
                          : firstName
                            ? `Submit, ${firstName} — let's do this!`
                            : "Submit My Volunteer Application"}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground leading-5">
                        By submitting,<br />you <span className="font-semibold text-foreground">agree</span> to be contacted by<br />Spandana Care Aid Foundation<br />regarding your application.
                      </p>

                      <div className="border-t border-border pt-4 text-center space-y-2">
                        <p className="text-xs text-muted-foreground">Not ready to volunteer just yet? You can still make a difference.</p>
                        <a href="/donate">
                          <Button type="button" variant="outline" size="sm" className="rounded-full border-primary/40 text-primary hover:bg-primary/5 gap-2">
                            ❤️ Donate instead
                          </Button>
                        </a>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
