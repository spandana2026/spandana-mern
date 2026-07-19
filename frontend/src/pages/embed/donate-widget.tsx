import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, CheckCircle2, Globe, Building2,
  ChevronDown, ChevronUp, ArrowRight, RefreshCw,
  ChevronDown as DropIcon, Stethoscope, BookOpen, Heart, Users, Sprout,
} from "lucide-react";

/* ─── Types ─── */
interface DonatePreset { amount: number; label?: string; title: string; desc: string; tag: string; color: string; }
interface DonateSettings {
  upiId?: string; upiName?: string; upiQrUrl?: string;
  bankName?: string; bankAccountName?: string; bankAccountNumber?: string;
  bankIfsc?: string; bankBranch?: string;
  razorpayLink?: string; paypalLink?: string; stripeLink?: string; cashfreeLink?: string;
  showRazorpay?: boolean; showCashfree?: boolean; showPaypal?: boolean; showStripe?: boolean;
  donatePage?: { heading?: string; subheading?: string; taxNote?: string; presets?: DonatePreset[] };
}

/* ─── Color map ─── */
const COLOR_MAP: Record<string, { gradient: string; bg: string; border: string }> = {
  pink:    { gradient: "from-pink-500 to-rose-600",    bg: "bg-pink-50",    border: "border-pink-200" },
  blue:    { gradient: "from-blue-500 to-indigo-600",  bg: "bg-blue-50",    border: "border-blue-200" },
  purple:  { gradient: "from-purple-500 to-violet-600",bg: "bg-purple-50",  border: "border-purple-200" },
  emerald: { gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  amber:   { gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50",   border: "border-amber-200" },
};
const TIER_ICONS = [Stethoscope, BookOpen, Heart, Users, Sprout];

const DEFAULT_PRESETS: DonatePreset[] = [
  { amount: 500,   label: "₹500",    title: "1 Medical Consultation",  desc: "Covers a full diagnostic consultation, medicines, and transport for one family in need.",              tag: "Most popular", color: "pink" },
  { amount: 1000,  label: "₹1,000",  title: "Skill Training Kit",       desc: "Provides vocational training materials for one person, opening doors to economic independence.",       tag: "",             color: "blue" },
  { amount: 2500,  label: "₹2,500",  title: "Mental Health Support",    desc: "Funds 4 counselling sessions for someone struggling alone — dignity, not charity.",                    tag: "",             color: "purple" },
  { amount: 5000,  label: "₹5,000",  title: "Family's Monthly Support", desc: "Sustains an entire family for one month: healthcare, food support, and skill development.",            tag: "Max impact",   color: "emerald" },
  { amount: 10000, label: "₹10,000", title: "Community Initiative",     desc: "Plants an entire micro-program: a self-help group, training batch, or legal aid camp in the community.", tag: "Legacy",     color: "amber" },
];

/* ─── Currency config ─── */
interface Currency { code: string; symbol: string; flag: string; name: string; fallback: number; }
const CURRENCIES: Currency[] = [
  { code: "INR", symbol: "₹",   flag: "🇮🇳", name: "Indian Rupee",      fallback: 1 },
  { code: "USD", symbol: "$",   flag: "🇺🇸", name: "US Dollar",         fallback: 0.012 },
  { code: "AUD", symbol: "A$",  flag: "🇦🇺", name: "Australian Dollar", fallback: 0.018 },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪", name: "UAE Dirham",        fallback: 0.044 },
  { code: "GBP", symbol: "£",   flag: "🇬🇧", name: "British Pound",     fallback: 0.0095 },
  { code: "EUR", symbol: "€",   flag: "🇪🇺", name: "Euro",              fallback: 0.011 },
  { code: "CAD", symbol: "C$",  flag: "🇨🇦", name: "Canadian Dollar",   fallback: 0.016 },
  { code: "SGD", symbol: "S$",  flag: "🇸🇬", name: "Singapore Dollar",  fallback: 0.016 },
  { code: "CHF", symbol: "Fr",  flag: "🇨🇭", name: "Swiss Franc",       fallback: 0.011 },
  { code: "JPY", symbol: "¥",   flag: "🇯🇵", name: "Japanese Yen",      fallback: 1.8 },
];

/* ─── Brand icons ─── */
const PhonePeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill="#5f259f"/>
    <path d="M30 22h24c10 0 18 8 18 18v4c0 6-3 11-8 14l10 20H58L49 60H42v18H30V22zm12 10v18h10c4 0 7-3 7-7v-4c0-4-3-7-7-7H42z" fill="white"/>
  </svg>
);
const GPayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill="white" stroke="#e5e7eb" strokeWidth="3"/>
    <path d="M72 50c0-2-.2-4-.5-6H50v11.4h12.4c-.5 3-2.2 5.6-4.7 7.3v6h7.6C68.9 64.3 72 57.7 72 50z" fill="#4285F4"/>
    <path d="M50 74c6.5 0 11.9-2.1 15.8-5.8l-7.6-6c-2.1 1.4-4.8 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9H28.6v6.2C32.5 68.9 40.7 74 50 74z" fill="#34A853"/>
    <path d="M36.5 54.6c-.5-1.4-.7-3-.7-4.6s.3-3.2.7-4.6v-6.2H28.6C26.9 42.5 26 46.1 26 50s.9 7.5 2.6 10.8l7.9-6.2z" fill="#FBBC05"/>
    <path d="M50 35.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.9C61.9 28.3 56.5 26 50 26c-9.3 0-17.5 5.1-21.4 12.6l7.9 6.2c1.9-5.7 7.2-9.3 13.5-9.3z" fill="#EA4335"/>
  </svg>
);
const PaytmIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill="#00BAF2"/>
    <rect x="20" y="33" width="18" height="18" fill="white" rx="2"/>
    <rect x="42" y="33" width="38" height="8" fill="white" rx="2"/>
    <rect x="42" y="45" width="38" height="8" fill="white" rx="2"/>
    <rect x="20" y="57" width="60" height="8" fill="white" rx="2"/>
  </svg>
);
const BhimIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill="#00833E"/>
    <path d="M25 30h20c10 0 17 6 17 16s-7 16-17 16H37v8H25V30zm12 10v12h7c3.5 0 6-2 6-6s-2.5-6-6-6H37z" fill="white"/>
    <path d="M65 30l-8 28h8l8-28h-8z" fill="#FF6B00"/>
  </svg>
);

const APP_BUTTONS = [
  { app: "phonepe" as const, label: "PhonePe",  Icon: PhonePeIcon },
  { app: "tez"     as const, label: "GPay",     Icon: GPayIcon },
  { app: "paytm"   as const, label: "Paytm",    Icon: PaytmIcon },
  { app: "upi"     as const, label: "BHIM/UPI", Icon: BhimIcon },
];

function upiHref(app: "phonepe"|"tez"|"paytm"|"upi", id: string, name: string, amtInr: string) {
  const q = `pa=${encodeURIComponent(id)}&pn=${encodeURIComponent(name)}&tn=Donation+to+Spandana&cu=INR${amtInr ? `&am=${amtInr}` : ""}`;
  if (app === "phonepe") return `phonepe://pay?${q}`;
  if (app === "tez")     return `tez://upi/pay?${q}`;
  if (app === "paytm")   return `paytmmp://pay?${q}`;
  return `upi://pay?${q}`;
}

/* ─── Helpers ─── */
function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); }); }}
      className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/8">
      <AnimatePresence mode="wait">
        {done
          ? <motion.span key="y" initial={{ scale: 0.7 }} animate={{ scale: 1 }}><CheckCircle2 size={12} className="text-emerald-500" /></motion.span>
          : <motion.span key="n" initial={{ scale: 0.7 }} animate={{ scale: 1 }}><Copy size={12} /></motion.span>}
      </AnimatePresence>
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function fmt(amount: number, cur: Currency): string {
  const decimals = cur.code === "JPY" ? 0 : 2;
  const n = cur.code === "JPY" ? Math.round(amount) : parseFloat(amount.toFixed(decimals));
  return `${cur.symbol}${n.toLocaleString("en-US", { maximumFractionDigits: decimals })}`;
}

/* ─── Donate Widget (standalone, embeddable via iframe at /embed/donate) ─── */
export default function DonateWidget() {
  const [settings, setSettings]     = useState<DonateSettings>({});
  const [bankOpen, setBankOpen]     = useState(false);
  const [intlOpen, setIntlOpen]     = useState(true);
  const [selectedBase, setSelectedBase] = useState<number | null>(null);
  const [custom, setCustom]         = useState("");
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [rates, setRates]           = useState<Record<string, number>>({});
  const [rateLoading, setRateLoading] = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const cur = CURRENCIES.find(c => c.code === currencyCode) ?? CURRENCIES[0];

  useEffect(() => {
    fetch("/api/v1/settings")
      .then(r => r.json())
      .then((d: DonateSettings) => setSettings(d ?? {}))
      .catch(() => {});
  }, []);

  const fetchRates = () => {
    setRateLoading(true);
    fetch("https://open.er-api.com/v6/latest/INR")
      .then(r => r.json())
      .then((d: { rates?: Record<string, number> }) => { if (d?.rates) setRates(d.rates); })
      .catch(() => {})
      .finally(() => setRateLoading(false));
  };
  useEffect(() => { fetchRates(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getRate = (code: string): number => {
    if (code === "INR") return 1;
    if (rates[code]) return rates[code];
    return CURRENCIES.find(c => c.code === code)?.fallback ?? 1;
  };

  const inrToDisplay = (inr: number) => inr * getRate(cur.code);

  const customInr = (): number => {
    const n = parseFloat(custom.replace(/[^0-9.]/g, ""));
    if (isNaN(n) || n <= 0) return 0;
    if (cur.code === "INR") return n;
    return n / getRate(cur.code);
  };

  const finalInr = (): string => {
    if (custom.trim()) { const n = Math.round(customInr()); return n > 0 ? n.toString() : ""; }
    if (selectedBase !== null) return selectedBase.toString();
    return "";
  };

  const displaySummary = (): string => {
    if (custom.trim()) {
      const inr = Math.round(customInr());
      if (inr <= 0) return "";
      const display = inrToDisplay(inr);
      return cur.code === "INR" ? `₹${inr.toLocaleString()}` : `${fmt(display, cur)} ≈ ₹${inr.toLocaleString()}`;
    }
    if (selectedBase !== null) {
      const display = inrToDisplay(selectedBase);
      return cur.code === "INR" ? `₹${selectedBase.toLocaleString()}` : `${fmt(display, cur)} ≈ ₹${selectedBase.toLocaleString()}`;
    }
    return "";
  };

  const heading    = settings.donatePage?.heading    || "Give with Joy";
  const subheading = settings.donatePage?.subheading || "Your support reaches those who need it most.";
  const taxNote    = settings.donatePage?.taxNote    || "Donations are eligible for income tax deduction under 80G. Receipt issued on request.";
  const hasBank    = settings.bankAccountNumber || settings.bankIfsc;
  const hasIntl    = (settings.showRazorpay && settings.razorpayLink) || (settings.showCashfree && settings.cashfreeLink) || (settings.showPaypal && settings.paypalLink) || (settings.showStripe && settings.stripeLink);
  const amtInr     = finalInr();
  const summary    = displaySummary();
  const presets    = settings.donatePage?.presets?.length ? settings.donatePage.presets : DEFAULT_PRESETS;
  const activeTierIdx = selectedBase !== null && !custom ? presets.findIndex(p => p.amount === selectedBase) : -1;
  const activeTier = activeTierIdx >= 0 ? (presets[activeTierIdx] ?? null) : null;

  const upiId    = settings.upiId   ?? "";
  const upiName  = settings.upiName ?? "Spandana Care Aid Foundation";
  const upiQrUrl = settings.upiQrUrl ?? "";
  const dynamicQrUrl = upiId && amtInr
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amtInr}&cu=INR&tn=Donation+to+Spandana`)}`
    : null;
  const qrSrc = dynamicQrUrl ?? upiQrUrl;

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "linear-gradient(160deg, #fff7ed 0%, #fdf2f8 40%, #f0fdf4 100%)" }}>

      {/* ── Header ── */}
      <header style={{ background: "linear-gradient(135deg, #0033A0 0%, #1a52c8 100%)" }} className="text-white">
        <div className="max-w-lg mx-auto px-5 py-6 md:py-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Spandana Care Aid Foundation</p>
              <p className="text-xs text-white/80 font-medium">Building Communities through Social Architecture</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-400/25 text-orange-100 text-[11px] font-bold uppercase tracking-widest mb-3">
            <Heart size={11} className="fill-orange-300 text-orange-300" /> Give with Purpose
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">{heading}</h1>
          <p className="text-sm text-white/65 max-w-xs leading-relaxed">{subheading}</p>
          <div className="flex gap-5 mt-5 pt-5 border-t border-white/15">
            {[["10k+", "Families helped"], ["25+", "Years"], ["100%", "Goes to programs"], ["80G", "Tax deductible"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-base md:text-xl font-serif font-bold text-white leading-none">{n}</p>
                <p className="text-[10px] text-white/55 mt-0.5 leading-tight">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-lg mx-auto space-y-3">

          {/* Amount picker */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-2xl p-4 shadow-sm">

            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Choose Amount</p>

              {/* Currency dropdown */}
              <div className="relative" ref={dropRef}>
                <button onClick={() => setDropOpen(v => !v)}
                  className="flex items-center gap-1.5 bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-primary/8 hover:border-primary/30 transition-colors">
                  <span>{cur.flag}</span>
                  <span>{cur.code}</span>
                  <DropIcon size={10} className={`text-muted-foreground transition-transform ${dropOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[180px]">
                      {CURRENCIES.map(c => (
                        <button key={c.code} onClick={() => { setCurrencyCode(c.code); setDropOpen(false); setSelectedBase(null); setCustom(""); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-muted/60 transition-colors text-left ${c.code === currencyCode ? "bg-primary/8 text-primary font-bold" : "text-foreground"}`}>
                          <span className="text-base">{c.flag}</span>
                          <div><span className="font-semibold">{c.code}</span><span className="text-muted-foreground ml-1.5">{c.symbol}</span></div>
                          <span className="ml-auto text-muted-foreground font-normal">{c.name.split(" ")[0]}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {cur.code !== "INR" && (
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[10px] text-muted-foreground">1 {cur.code} ≈ ₹{(1 / getRate(cur.code)).toFixed(2)}</span>
                <button onClick={fetchRates} title="Refresh rate" className="text-muted-foreground hover:text-primary transition-colors">
                  <RefreshCw size={10} className={rateLoading ? "animate-spin" : ""} />
                </button>
                <span className="text-[10px] text-muted-foreground/50">· live rate</span>
              </div>
            )}

            {/* Preset pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {presets.map((preset, i) => {
                const displayed = fmt(inrToDisplay(preset.amount), cur);
                const isActive = selectedBase === preset.amount && !custom;
                const s = COLOR_MAP[preset.color] ?? COLOR_MAP.blue;
                return (
                  <button key={i} onClick={() => { setSelectedBase(isActive ? null : preset.amount); setCustom(""); }}
                    className={`relative px-4 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      isActive ? `bg-gradient-to-r ${s.gradient} text-white border-transparent shadow-md` : "border-border text-foreground hover:border-primary/40 bg-white/60"
                    }`}>
                    {preset.tag && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                        {preset.tag}
                      </span>
                    )}
                    {displayed}
                  </button>
                );
              })}
            </div>

            {/* Impact card */}
            <AnimatePresence mode="wait">
              {activeTier && (() => {
                const s = COLOR_MAP[activeTier.color] ?? COLOR_MAP.blue;
                const Icon = TIER_ICONS[activeTierIdx % TIER_ICONS.length];
                return (
                  <motion.div key={activeTierIdx}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className={`${s.bg} border-2 ${s.border} rounded-xl p-3 flex items-center gap-3 mb-3`}>
                    <div className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{activeTier.label ?? `₹${activeTier.amount.toLocaleString()}`} gives you</p>
                      <p className="text-sm font-semibold text-foreground leading-snug">{activeTier.title}</p>
                      <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">{activeTier.desc}</p>
                    </div>
                    {activeTier.tag && (
                      <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${s.gradient} text-white uppercase tracking-wide`}>{activeTier.tag}</span>
                    )}
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* Custom input */}
            <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors">
              <span className="text-sm font-bold text-muted-foreground shrink-0">{cur.symbol}</span>
              <input type="number" min="0.01" step="any" placeholder="Enter custom amount"
                value={custom}
                onChange={e => { setCustom(e.target.value); setSelectedBase(null); }}
                className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 placeholder:font-normal min-w-0" />
              {custom && <button onClick={() => setCustom("")} className="text-muted-foreground/50 hover:text-foreground text-xs shrink-0">✕</button>}
            </div>

            <AnimatePresence>
              {summary && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Donating</p>
                  <p className="text-sm font-bold text-primary">{summary}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── UPI ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-2xl overflow-hidden shadow-sm">

            <div className="px-4 py-3 border-b border-orange-100 flex items-center gap-2 bg-gradient-to-r from-orange-50/80 to-rose-50/60">
              <span className="text-base">🇮🇳</span>
              <p className="font-bold text-sm">UPI Payment</p>
              {amtInr && (
                <span className="ml-auto text-[10px] font-semibold text-orange-700 bg-orange-100 rounded-full px-2.5 py-0.5 shrink-0">
                  {cur.code !== "INR" ? `₹${parseInt(amtInr).toLocaleString()} charged` : summary}
                </span>
              )}
            </div>

            {upiId ? (
              <div className="p-4 space-y-4">
                {/* Mobile: app buttons */}
                <div className="md:hidden">
                  {amtInr && (
                    <p className="text-[10px] text-center text-emerald-700 font-semibold bg-emerald-50 rounded-lg py-1.5 px-3 mb-3">
                      ✓ Amount pre-filled — tap your app below
                    </p>
                  )}
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">Open your app</p>
                  <div className="grid grid-cols-4 gap-2">
                    {APP_BUTTONS.map(({ app, label, Icon }) => (
                      <a key={app} href={upiHref(app, upiId, upiName, amtInr)}
                        className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50/50 transition-all active:scale-95 bg-white/60">
                        <Icon />
                        <span className="text-[10px] font-medium text-foreground leading-tight text-center">{label}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Desktop: QR */}
                {qrSrc ? (
                  <div className="hidden md:flex flex-col items-center gap-2">
                    <AnimatePresence mode="wait">
                      <motion.div key={qrSrc} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                        className="border-2 border-orange-100 rounded-2xl p-3 bg-white shadow-md inline-block">
                        <img src={qrSrc} alt="UPI QR Code" className="w-44 h-44 object-contain" />
                      </motion.div>
                    </AnimatePresence>
                    <p className="text-xs text-muted-foreground">
                      {dynamicQrUrl ? `Scan to pay ₹${parseInt(amtInr).toLocaleString()} via UPI` : "Scan with any UPI app"}
                    </p>
                  </div>
                ) : (
                  <div className="hidden md:flex w-44 h-44 mx-auto rounded-2xl bg-orange-50/40 border-2 border-dashed border-orange-200 flex-col items-center justify-center text-center px-3">
                    <p className="text-xs text-muted-foreground">QR not configured</p>
                  </div>
                )}

                {/* UPI ID row */}
                <div className="flex items-center justify-between bg-muted/40 rounded-xl px-3 py-2.5 border border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground">UPI ID</p>
                    <p className="font-mono font-bold text-sm text-foreground">{upiId}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{upiName}</p>
                  </div>
                  <CopyBtn text={upiId} />
                </div>

                {cur.code !== "INR" && (
                  <p className="text-[10px] text-center text-muted-foreground">
                    UPI processes in ₹INR. Converted at live rate on checkout.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-5 text-center">
                <p className="text-sm text-muted-foreground">UPI payment details coming soon.</p>
              </div>
            )}
          </motion.div>

          {/* ── Bank Transfer ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
            <button onClick={() => setBankOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-orange-50/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <Building2 size={16} className="text-muted-foreground" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Bank Transfer</p>
                  <p className="text-xs text-muted-foreground">NEFT / RTGS / Cheque</p>
                </div>
              </div>
              {bankOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {bankOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-border">
                  {hasBank ? (
                    <div className="p-4 space-y-2">
                      {[
                        { label: "Account Name",   value: settings.bankAccountName },
                        { label: "Account Number", value: settings.bankAccountNumber },
                        { label: "IFSC",           value: settings.bankIfsc },
                        { label: "Bank",           value: settings.bankName },
                        { label: "Branch",         value: settings.bankBranch },
                      ].filter(r => r.value).map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 border border-border">
                          <div>
                            <p className="text-[10px] text-muted-foreground">{label}</p>
                            <p className="font-mono text-sm font-semibold text-foreground">{value}</p>
                          </div>
                          <CopyBtn text={value!} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Bank details not configured yet.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Cards & Online Payment ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
            <button onClick={() => setIntlOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-orange-50/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <Globe size={16} className="text-muted-foreground" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Cards & Online Payment</p>
                  <p className="text-xs text-muted-foreground">Indian &amp; International donors welcome</p>
                </div>
              </div>
              {intlOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {intlOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-border">
                  {hasIntl ? (
                    <div className="p-4 space-y-2">
                      {settings.showRazorpay && settings.razorpayLink && (
                        <a href={settings.razorpayLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between bg-[#072654] text-white rounded-xl px-4 py-3 hover:bg-[#0d3980] transition-colors">
                          <div>
                            <p className="font-semibold text-sm">Razorpay</p>
                            <p className="text-[10px] text-blue-200">🇮🇳 Indian cards · Net banking · UPI · Wallets · International</p>
                          </div>
                          <ArrowRight size={14} />
                        </a>
                      )}
                      {settings.showCashfree && settings.cashfreeLink && (
                        <a href={settings.cashfreeLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between bg-[#1a56db] text-white rounded-xl px-4 py-3 hover:bg-[#1548c4] transition-colors">
                          <div>
                            <p className="font-semibold text-sm">Cashfree</p>
                            <p className="text-[10px] text-blue-200">🇮🇳 Indian &amp; International · Cards · UPI · Net banking</p>
                          </div>
                          <ArrowRight size={14} />
                        </a>
                      )}
                      {settings.showPaypal && settings.paypalLink && (
                        <a href={settings.paypalLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between bg-[#003087] text-white rounded-xl px-4 py-3 hover:bg-[#00256b] transition-colors">
                          <div>
                            <p className="font-semibold text-sm">PayPal</p>
                            <p className="text-[10px] text-blue-200">🌍 International &amp; NRI donors</p>
                          </div>
                          <ArrowRight size={14} />
                        </a>
                      )}
                      {settings.showStripe && settings.stripeLink && (
                        <a href={settings.stripeLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between bg-[#635bff] text-white rounded-xl px-4 py-3 hover:bg-[#4f48d9] transition-colors">
                          <div>
                            <p className="font-semibold text-sm">Stripe</p>
                            <p className="text-[10px] text-purple-200">🌍 International donors · USD / EUR / GBP</p>
                          </div>
                          <ArrowRight size={14} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Online payment links not configured yet.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Tax note */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
            className="text-xs text-muted-foreground text-center px-2 pb-2">{taxNote}
          </motion.p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-orange-100/60">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Spandana Care Aid Foundation · All rights reserved</p>
        <p className="text-xs text-muted-foreground mt-1">
          Questions?{" "}
          <a href="mailto:spandanacareaidfoundation@gmail.com" className="text-primary hover:underline">
            spandanacareaidfoundation@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}

