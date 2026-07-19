import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HeartHandshake, CheckCircle2, Loader2, X,
  MapPin, Phone, Mail, User, Briefcase, Calendar, AlertCircle, Cake, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

const AREAS = ["Medical Aid", "Mental Health", "Fundraising", "Legal Advocacy", "Environment", "Support", "Education", "Social Media", "Skill Development"] as const;
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
  if ((data.areasOfInterest as readonly string[]).includes("Education & Outreach") && !data.childrenDeclaration) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "This declaration is required for anyone working in Education & Outreach", path: ["childrenDeclaration"] });
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
  if (diffDays === 0) { birthdayMsg = "🎂 Happy Birthday! What a perfect day to join the Spandana family!"; birthdayColor = "text-rose-400"; }
  else if (diffDays > 0 && diffDays <= 30) { birthdayMsg = "🎊 Belated Birthday Wishes! Hope the celebrations were amazing."; birthdayColor = "text-amber-400"; }
  else if (diffDays < 0 && diffDays >= -30) { birthdayMsg = `🎈 Advance Birthday Wishes! ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} to go!`; birthdayColor = "text-sky-400"; }
  let clubMsg = "";
  if (age < 18) clubMsg = "✨ Young energy changes everything — you're just perfect for our volunteer world!";
  else if (age <= 19) clubMsg = "🌟 The teens are taking over — in the best way! Welcome aboard!";
  else if (age <= 29) clubMsg = "🚀 The 20s Club — where it all begins!";
  else if (age <= 39) clubMsg = "💪 The 30s — the decade of doing!";
  else if (age <= 49) clubMsg = "🌟 The 40s Club — wisdom meets unstoppable action!";
  else if (age <= 59) clubMsg = "🦁 The 50s Club — love your energy to volunteer!";
  else if (age <= 69) clubMsg = "👑 The 60s Club — your experience is our greatest superpower!";
  else clubMsg = "🏆 A legend, no less — your spirit inspires every single one of us!";
  return { age, birthdayMsg, birthdayColor, clubMsg };
}

function getOccupationAffirmation(occ: string): string {
  const o = occ.toLowerCase();
  if (o.includes("doctor") || o.includes("nurse") || o.includes("medical")) return "❤️ Healthcare heroes are the backbone of our Medical Aid camps!";
  if (o.includes("lawyer") || o.includes("advocate") || o.includes("legal")) return "⚖️ Legal minds like yours have changed lives at our advocacy drives!";
  if (o.includes("teacher") || o.includes("educator") || o.includes("professor")) return "📚 Educators like you light up our outreach programs!";
  if (o.includes("engineer") || o.includes("developer") || o.includes("tech") || o.includes("coder")) return "💻 Tech minds help us reach 10x more people — welcome aboard!";
  if (o.includes("psycholog") || o.includes("counsell") || o.includes("therapist")) return "🧠 Mental health champions — we've been waiting for you!";
  if (o.includes("student")) return "🎓 Students make the most passionate volunteers!";
  if (o.includes("retired")) return "🌺 Retirement + purpose = magic. We're honoured to have you!";
  if (o.includes("artist") || o.includes("designer")) return "🎨 Your creativity will bring our campaigns to life!";
  return "🌱 Every profession has a role at Spandana — can't wait to find yours!";
}

function ChipPicker({ options, value, onChange, grid }: { options: readonly string[]; value: string[]; onChange: (v: string[]) => void; grid?: boolean }) {
  return (
    <div className={grid ? "grid grid-cols-3 gap-1.5" : "flex flex-wrap gap-2"}>
      {options.map((opt) => {
        const sel = (value ?? []).includes(opt);
        const span = grid ? (CHIP_SPANS[opt] ?? 1) : 1;
        return (
          <button key={opt} type="button" aria-pressed={sel}
            onClick={() => onChange(sel ? value.filter(v => v !== opt) : [...value, opt])}
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
    const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, "0"), d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`); setText(`${d}/${m}/${y}`); setOpen(false);
  };
  return (
    <div className="relative flex items-center">
      <Input value={text} onChange={handleTextChange} placeholder="dd/mm/yyyy" maxLength={10} className="pr-10" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="absolute right-3 text-muted-foreground hover:text-primary transition-colors"><Calendar size={16} /></button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarUI mode="single" selected={selectedDate} onSelect={handleCalendarSelect}
            disabled={(date) => date > new Date()} captionLayout="dropdown" fromYear={1920} toYear={new Date().getFullYear()} />
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

interface VolunteerModalProps {
  open: boolean;
  onClose: () => void;
  whatsappGroupLink?: string;
}

export default function VolunteerModal({ open, onClose, whatsappGroupLink }: VolunteerModalProps) {
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
  const showMidAffirmation = watchedAddress.length >= 5;
  const showNearlyThereAffirmation = (watchedAreas as string[])?.length >= 1 && (watchedAvailability as string[])?.length >= 1;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSubmitted(false); setError(""); form.reset(); }, 400);
  };

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
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 md:hidden flex flex-col bg-background rounded-t-3xl shadow-2xl"
            style={{ maxHeight: "92dvh" }}
          >
            {/* Handle + header */}
            <div className="flex-shrink-0 px-5 pt-3 pb-4 border-b border-border">
              {/* Drag handle */}
              <div className="w-10 h-1 rounded-full bg-muted-foreground/25 mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartHandshake size={18} className="text-primary" />
                  <span className="font-bold text-sm">Volunteer Application</span>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <AnimatePresence mode="wait">

                {submitted ? (
                  /* ── SUCCESS STATE ── */
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                    className="flex flex-col items-center text-center py-6 gap-5">

                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="text-primary w-10 h-10" />
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-bold mb-1">
                        Welcome{firstName ? `, ${firstName}` : ""}! 🎉
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                        You've officially taken the first step. Our team will reach out within <strong>2–3 days</strong> to match you with the perfect program.
                      </p>
                    </div>

                    <div className="w-full rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left space-y-1">
                      <p className="text-xs font-semibold text-primary">What happens next?</p>
                      <p className="text-xs text-muted-foreground">📬 You'll get a confirmation email shortly.</p>
                      <p className="text-xs text-muted-foreground">📞 Our coordinator will call you within 2–3 days.</p>
                      <p className="text-xs text-muted-foreground">🤝 We'll match you to a program you'll love.</p>
                    </div>

                    {whatsappGroupLink && (
                      <div className="w-full rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-4 text-center space-y-2">
                        <p className="text-xs font-semibold text-foreground">Join our Volunteer WhatsApp Community</p>
                        <p className="text-xs text-muted-foreground">Get event updates and connect with fellow volunteers.</p>
                        <a href={whatsappGroupLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: "#25D366" }}>
                          Join the Community
                        </a>
                      </div>
                    )}

                    <Button size="lg" className="w-full rounded-full h-12 gap-2" onClick={handleClose}>
                      Continue Reading ↓
                    </Button>
                    <button onClick={() => setSubmitted(false)} className="text-xs text-muted-foreground underline underline-offset-2">
                      Submit another response
                    </button>
                  </motion.div>

                ) : (
                  /* ── FORM ── */
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-xs text-muted-foreground mb-5">
                      Hey there! This form is friendly — we promise it won't bite. Fields marked <strong>*</strong> are required.
                    </p>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                        <SectionLabel icon={User} className="tracking-wide">
                          {firstName ? `Nice to meet you, ${firstName}!` : "Tell us about yourself"}
                        </SectionLabel>

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
                            <FormControl><DobPicker value={field.value} onChange={field.onChange} /></FormControl>
                            <FormMessage />
                            <AnimatePresence>
                              {dobInfo && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 space-y-1">
                                  <p className="text-xs font-semibold text-primary">Age: {dobInfo.age} years old</p>
                                  <p className={`text-xs font-medium ${dobInfo.birthdayColor}`}>{dobInfo.birthdayMsg}</p>
                                  <p className="text-xs text-muted-foreground italic">{dobInfo.clubMsg}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </FormItem>
                        )} />

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

                        <FormField control={form.control} name="address" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address *</FormLabel>
                            <FormControl><Input placeholder="Street, City, State" {...field} /></FormControl>
                            <FormDescription className="text-xs">So we can connect you to programs near you.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <AnimatePresence>
                          {showMidAffirmation && (
                            <motion.div key="mid" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="rounded-xl bg-primary/8 border border-primary/20 px-4 py-3 text-center">
                              <p className="text-sm font-semibold text-primary">{firstName ? `💪 Halfway there, ${firstName}!` : "💪 You're halfway there!"}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Doing brilliantly — keep going!</p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="border-t border-border pt-5">
                          <SectionLabel icon={Briefcase} className="tracking-wide">
                            {firstName ? `${firstName}, what do you do?` : "Your professional side"}
                          </SectionLabel>
                        </div>

                        <FormField control={form.control} name="occupation" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation *</FormLabel>
                            <FormControl><Input placeholder="e.g. Doctor, Teacher, Engineer" {...field} /></FormControl>
                            <AnimatePresence>
                              {occAffirmation && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-primary font-medium mt-1.5 italic">{occAffirmation}</motion.p>
                              )}
                            </AnimatePresence>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="skills" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Skills <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                            <FormControl><Input placeholder="e.g. Counseling, Finance, Art…" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="border-t border-border pt-5">
                          <SectionLabel icon={Calendar} className="tracking-wide">
                            {firstName ? `${firstName}, where would you like to help?` : "Where would you like to help?"}
                          </SectionLabel>
                        </div>

                        <FormField control={form.control} name="areasOfInterest" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Areas of Interest * <span className="text-xs font-normal text-muted-foreground">(pick all that excite you)</span></FormLabel>
                            <FormControl>
                              <ChipPicker options={AREAS} value={field.value as string[]} onChange={field.onChange} grid />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="availability" render={({ field }) => (
                          <FormItem>
                            <FormLabel>When are you free? * <span className="text-xs font-normal text-muted-foreground">(select all that apply)</span></FormLabel>
                            <FormControl>
                              <ChipPicker options={AVAILABILITY} value={field.value as string[]} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <AnimatePresence>
                          {showNearlyThereAffirmation && (
                            <motion.div key="nearly" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="rounded-xl bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30 px-4 py-3 text-center">
                              <p className="text-sm font-semibold text-green-700 dark:text-green-400">{firstName ? `🌟 Almost there, ${firstName}!` : "🌟 Almost there!"}</p>
                              <p className="text-xs text-green-600/80 mt-0.5">Just a few more steps and you're part of the family! 🎉</p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="border-t border-border pt-5">
                          <SectionLabel icon={Phone} className="tracking-wide">Emergency Contact</SectionLabel>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {dobInfo && dobInfo.age < 18 ? "Required for volunteers under 18." : "Optional — someone we can reach during events."}
                          </p>
                        </div>

                        <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name {dobInfo && dobInfo.age < 18 ? "*" : "(optional)"}</FormLabel>
                            <FormControl><Input placeholder="Parent, partner, friend…" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone {dobInfo && dobInfo.age < 18 ? "*" : "(optional)"}</FormLabel>
                            <FormControl><Input placeholder="+91 XXXXX XXXXX" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="border-t border-border pt-5">
                          <SectionLabel icon={Mail} className="tracking-wide">
                            {firstName ? `Last one, ${firstName}` : "Almost done!"}
                          </SectionLabel>
                          <p className="text-xs text-muted-foreground mt-1">This is your moment — tell us what brings you here.</p>
                        </div>

                        <div className="rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30 px-4 py-3 text-center">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">✍️ Last stretch — you've got this!</p>
                          <p className="text-xs text-amber-600/80 mt-0.5">Even "I just want to help" is a perfect answer. 😊</p>
                        </div>

                        <FormField control={form.control} name="motivation" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Why do you want to volunteer? *</FormLabel>
                            <FormControl>
                              <Textarea placeholder={`${firstName ? `${firstName}, w` : "W"}hy does this cause call to you?`}
                                className="min-h-[100px] resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="border-t border-border pt-5">
                          <SectionLabel icon={Shield}>Safeguarding Declaration</SectionLabel>
                          <p className="text-xs text-muted-foreground mt-1">A standard requirement for all volunteers.</p>
                        </div>

                        <FormField control={form.control} name="declaration" render={({ field }) => (
                          <FormItem>
                            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
                              <FormControl>
                                <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} className="mt-0.5 shrink-0" />
                              </FormControl>
                              <div className="space-y-1">
                                <FormLabel className="text-sm font-medium leading-snug cursor-pointer">General Declaration *</FormLabel>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  I declare that I have no criminal convictions or pending cases, and all information provided is true and accurate.
                                </p>
                                <FormMessage />
                              </div>
                            </div>
                          </FormItem>
                        )} />

                        {error && (
                          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
                            <AlertCircle size={15} className="shrink-0" /> {error}
                          </div>
                        )}

                        <Button type="submit" size="lg" className="w-full rounded-full h-12 text-sm" disabled={submitting}>
                          {submitting
                            ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Submitting…</>
                            : firstName ? `Submit, ${firstName} — let's do this!` : "Submit My Application"}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground pb-2">
                          By submitting, you agree to be contacted by Spandana Care Aid Foundation regarding your application.
                        </p>

                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
