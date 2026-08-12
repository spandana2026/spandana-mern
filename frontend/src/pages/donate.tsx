import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle2, Globe, Building2, ChevronDown, ChevronUp, ArrowRight, RefreshCw, ChevronDown as DropIcon, AlertCircle } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import CommunityChat from "@/components/community-chat";

interface DonateProgram {
  icon: string;
  name: string;
  desc: string;
  inr: [number, number, number];
  usd: [number, number, number];
  showFor?: "both" | "indian" | "intl";
}

interface DonateSettings {
  upiId?: string; upiName?: string; upiQrUrl?: string;
  bankName?: string; bankAccountName?: string; bankAccountNumber?: string;
  bankIfsc?: string; bankBranch?: string;
  razorpayLink?: string; paypalLink?: string; stripeLink?: string; cashfreeLink?: string;
  showRazorpay?: boolean; showCashfree?: boolean; showPaypal?: boolean; showStripe?: boolean;
  donatePage?: {
    heading?: string; subheading?: string; taxNote?: string;
    headingMobile?: string; subheadingMobile?: string;
    programs?: DonateProgram[];
    intlNote?: string;
    fcraEnabled?: boolean;
    geoAutoSwitch?: boolean;
    upiApps?: { phonepe?: boolean; tez?: boolean; paytm?: boolean; upi?: boolean };
    indianTabLabel?: string;
    intlTabLabel?: string;
  };
}

function safeHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript\s*:/gi, "");
}

const DEFAULT_PROGRAMS: DonateProgram[] = [
  { icon: "🌱", name: "Plant a Tree",        desc: "Native tree planted in your name",               inr: [50,  100,  250],  usd: [1,  3,  5]  },
  { icon: "📚", name: "Sponsor a Child",      desc: "Books, uniform & tuition for one month",         inr: [500, 1000, 2000], usd: [6,  12, 25] },
  { icon: "🏥", name: "Medical Consultation", desc: "Free checkup & medicines for one patient",       inr: [500, 1000, 2500], usd: [6,  15, 30] },
  { icon: "🍱", name: "Feed a Family",        desc: "Nutritious meals for a week",                    inr: [200, 500,  1000], usd: [3,  6,  12] },
  { icon: "💧", name: "Clean Water Access",   desc: "Water purification support for a household",     inr: [1000,2500, 5000], usd: [12, 30, 60] },
];

interface Currency { code: string; symbol: string; flag: string; name: string; fallback: number; }
const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$",   flag: "🇺🇸", name: "US Dollar",         fallback: 0.012  },
  { code: "AUD", symbol: "A$",  flag: "🇦🇺", name: "Australian Dollar", fallback: 0.018  },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪", name: "UAE Dirham",        fallback: 0.044  },
  { code: "GBP", symbol: "£",   flag: "🇬🇧", name: "British Pound",     fallback: 0.0095 },
  { code: "EUR", symbol: "€",   flag: "🇪🇺", name: "Euro",              fallback: 0.011  },
  { code: "CAD", symbol: "C$",  flag: "🇨🇦", name: "Canadian Dollar",   fallback: 0.016  },
  { code: "SGD", symbol: "S$",  flag: "🇸🇬", name: "Singapore Dollar",  fallback: 0.016  },
];

const PhonePeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="9" fill="#5f259f"/>
    <path d="M11 8.5h9.8c5.5 0 9.6 3.8 9.6 9.1 0 3.8-2 7-5.2 8.5l5.6 9.4h-5.8l-5-8.5h-3.9v8.5H11V8.5zm5.1 4.2v10.1h4.5c2.7 0 4.6-2 4.6-5s-1.9-5.1-4.6-5.1h-4.5z" fill="white"/>
    <circle cx="30" cy="11" r="3.5" fill="#04C8C8"/>
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
  { app: "tez"     as const, label: "GPay",     Icon: GPayIcon    },
  { app: "paytm"   as const, label: "Paytm",    Icon: PaytmIcon   },
  { app: "upi"     as const, label: "BHIM/UPI", Icon: BhimIcon    },
];

function upiHref(app: "phonepe"|"tez"|"paytm"|"upi", id: string, name: string, amtInr: string) {
  const q = `pa=${encodeURIComponent(id)}&pn=${encodeURIComponent(name)}&tn=Donation+to+Spandana&cu=INR${amtInr ? `&am=${amtInr}` : ""}`;
  if (app === "phonepe") return `phonepe://pay?${q}`;
  if (app === "tez")     return `tez://upi/pay?${q}`;
  if (app === "paytm")   return `paytmmp://pay?${q}`;
  return `upi://pay?${q}`;
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); }); }}
      className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/8"
    >
      <AnimatePresence mode="wait">
        {done
          ? <motion.span key="y" initial={{ scale: 0.7 }} animate={{ scale: 1 }}><CheckCircle2 size={12} className="text-emerald-500" /></motion.span>
          : <motion.span key="n" initial={{ scale: 0.7 }} animate={{ scale: 1 }}><Copy size={12} /></motion.span>}
      </AnimatePresence>
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export default function DonatePage() {
  const [settings, setSettings]         = useState<DonateSettings>({});
  const [donorType, setDonorType]       = useState<"indian" | "intl">("indian");
  const [programIdx, setProgramIdx]     = useState(0);
  const [tierIdx, setTierIdx]           = useState<number | null>(null);
  const [custom, setCustom]             = useState("");
  const [currencyCode, setCurrencyCode] = useState("AUD");
  const [rates, setRates]               = useState<Record<string, number>>({});
  const [rateLoading, setRateLoading]   = useState(false);
  const [bankOpen, setBankOpen]         = useState(false);
  const [wireOpen, setWireOpen]         = useState(false);
  const [dropOpen, setDropOpen]         = useState(false);
  const [geoDetected, setGeoDetected]   = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((d) => { setSettings(d ?? {}); setSettingsLoaded(true); })
      .catch(() => { setSettingsLoaded(true); });
  }, []);

  const fetchRates = () => {
    setRateLoading(true);
    fetch("https://open.er-api.com/v6/latest/INR")
      .then(r => r.json())
      .then((d) => { if (d?.rates) setRates(d.rates); })
      .catch(() => {})
      .finally(() => setRateLoading(false));
  };
  useEffect(() => { fetchRates(); }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    if (settings.donatePage?.geoAutoSwitch === false) return;
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then((d) => {
        if (d?.country_code && d.country_code !== "IN") {
          setDonorType("intl");
        }
        setGeoDetected(true);
      })
      .catch(() => {});
  }, [settingsLoaded]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cur = CURRENCIES.find(c => c.code === currencyCode) ?? CURRENCIES[0];
  const programs: DonateProgram[] = settings.donatePage?.programs ?? DEFAULT_PROGRAMS;
  const prog = programs[Math.min(programIdx, programs.length - 1)] ?? programs[0];

  const getRate = (code: string) =>
    code === "INR" ? 1 : (rates[code] || CURRENCIES.find(c => c.code === code)?.fallback || 1);

  const usdToDisplay = (usd: number): number => usd * (getRate(cur.code) / getRate("USD"));

  const fmtDisplay = (usd: number): string => {
    if (cur.code === "USD") return `$${usd}`;
    const d = usdToDisplay(usd);
    const rounded = d < 10 ? d.toFixed(2) : Math.round(d).toLocaleString();
    return `${cur.symbol}${rounded}`;
  };

  const finalAmtInr = (): string => {
    if (tierIdx !== null) return String(prog.inr[tierIdx] ?? "");
    const n = parseFloat(custom);
    return !isNaN(n) && n > 0 ? String(Math.round(n)) : "";
  };
  const amtInr = finalAmtInr();

  const upiId    = settings.upiId   ?? "";
  const upiName  = settings.upiName ?? "Spandana Care Aid Foundation";
  const upiQrUrl = settings.upiQrUrl ?? "";
  const dynamicQrUrl = upiId && amtInr
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amtInr}&cu=INR&tn=Donation+to+Spandana`)}`
    : null;
  const qrSrc = dynamicQrUrl ?? upiQrUrl;

  const heading  = settings.donatePage?.heading  || "Give with Joy";
  const subhead  = settings.donatePage?.subheading || "Every rupee reaches a life that needs it.";
  const taxNote  = settings.donatePage?.taxNote  || "Donations are eligible for 80G income tax deduction. Receipt issued on request.";
  const intlNote = settings.donatePage?.intlNote || "Spandana Care Aid Foundation is FCRA-registered. All international donations comply with FCRA regulations. A receipt is issued for all contributions.";
  const indianTabLabel = settings.donatePage?.indianTabLabel || "🇮🇳 Indian Donor";
  const intlTabLabel   = settings.donatePage?.intlTabLabel   || "🌍 International / NRI";
  const hasBank  = settings.bankAccountNumber || settings.bankIfsc;
  const hasIntl  = (settings.showRazorpay && settings.razorpayLink) || (settings.showCashfree && settings.cashfreeLink) || (settings.showPaypal && settings.paypalLink) || (settings.showStripe && settings.stripeLink);
  const fcraEnabled = settings.donatePage?.fcraEnabled !== false;

  const upiApps = settings.donatePage?.upiApps ?? {};
  const visibleAppButtons = APP_BUTTONS.filter(b => upiApps[b.app] !== false);

  const changeProg = (i: number) => {
    setProgramIdx(i); setTierIdx(null); setCustom("");
  };

  const donationSummary = (): string => {
    if (donorType === "indian") {
      if (tierIdx !== null) return `₹${(prog.inr[tierIdx] ?? 0).toLocaleString("en-IN")}`;
      const n = parseFloat(custom);
      return !isNaN(n) && n > 0 ? `₹${Math.round(n).toLocaleString("en-IN")}` : "";
    } else {
      if (tierIdx !== null) return fmtDisplay(prog.usd[tierIdx] ?? 0);
      const n = parseFloat(custom);
      return !isNaN(n) && n > 0 ? `${cur.symbol}${n.toLocaleString()}` : "";
    }
  };
  const summary = donationSummary();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8f9fa" }}>
      <Nav />

      {/* ── Hero + Tabs ── */}
      <div className="bg-gradient-to-br from-violet-700 to-indigo-800 pt-24 pb-8 md:pt-28 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="text-white/60 text-[10px] uppercase tracking-widest mb-1">
            Spandana Care Aid Foundation
          </div>
          <h1 className="text-white font-bold text-2xl md:text-3xl leading-tight mb-1">{heading}</h1>
          <p className="text-white/70 text-xs md:text-sm mb-5 max-w-xs mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: safeHtml(subhead) }} />

          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-xs font-bold text-white">
              {donorType === "indian" ? indianTabLabel : intlTabLabel}
            </span>
          </div>
          {geoDetected && (
            <p className="text-center text-white/50 text-[10px] mt-2">
              📍 Detected automatically based on your location
            </p>
          )}
        </motion.div>
      </div>

      {/* ── Content ── */}
      <section className="flex-1 px-4 -mt-4 pb-16 max-w-lg mx-auto w-full space-y-3">

        {/* Program selector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Choose a Program</p>
          <div className="space-y-2">
            {programs.map((p, i) => (
              <div key={i}>
                <button
                  onClick={() => changeProg(i)}
                  className={`w-full flex gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${programIdx === i ? "border-violet-500 bg-violet-50" : "border-border/60 hover:border-border"}`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-xs text-foreground leading-snug">{p.name}</p>
                      {programIdx === i && (
                        <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                    <p className={`text-[10px] mt-0.5 leading-relaxed transition-all ${
                      programIdx === i
                        ? "text-violet-700/80 whitespace-normal"
                        : "text-muted-foreground truncate"
                    }`}>{p.desc}</p>
                  </div>
                </button>

                {/* Inline amount buttons — appear right under selected program */}
                <AnimatePresence>
                  {programIdx === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 pb-1 px-1">
                        <div className="flex gap-2">
                          {(donorType === "indian" ? p.inr : p.usd).map((amt, ti) => (
                            <button
                              key={ti}
                              onClick={() => { setTierIdx(tierIdx === ti ? null : ti); setCustom(""); }}
                              className={`flex-1 py-2 rounded-xl border-2 font-bold text-xs transition-all ${tierIdx === ti ? "border-violet-500 bg-violet-500 text-white shadow-sm" : "border-violet-200 text-violet-700 bg-violet-50 hover:border-violet-400"}`}
                            >
                              {donorType === "indian"
                                ? `₹${(amt as number).toLocaleString("en-IN")}`
                                : fmtDisplay(amt as number)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Amount card — currency picker + custom input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {donorType === "indian" ? "Custom Amount (₹)" : "Custom Amount"}
            </p>
            {donorType === "intl" && (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(v => !v)}
                  className="flex items-center gap-1.5 bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-muted/70 transition-colors"
                >
                  <span>{cur.flag}</span>
                  <span>{cur.code}</span>
                  <DropIcon size={10} className={`text-muted-foreground transition-transform ${dropOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.13 }}
                      className="absolute right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[160px]"
                    >
                      {CURRENCIES.map(c => (
                        <button
                          key={c.code}
                          onClick={() => { setCurrencyCode(c.code); setDropOpen(false); setTierIdx(null); setCustom(""); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-muted/60 transition-colors text-left ${c.code === currencyCode ? "bg-primary/8 text-primary font-bold" : "text-foreground"}`}
                        >
                          <span>{c.flag}</span>
                          <span className="font-semibold">{c.code}</span>
                          <span className="ml-auto text-muted-foreground">{c.symbol}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {donorType === "intl" && cur.code !== "USD" && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-[10px] text-muted-foreground">1 USD ≈ {cur.symbol}{usdToDisplay(1).toFixed(2)}</span>
              <button onClick={fetchRates} className="text-muted-foreground hover:text-primary transition-colors">
                <RefreshCw size={10} className={rateLoading ? "animate-spin" : ""} />
              </button>
              <span className="text-[10px] text-muted-foreground/50">· live rate</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2.5 focus-within:border-violet-400 transition-colors">
            <span className="text-sm font-bold text-muted-foreground shrink-0">
              {donorType === "indian" ? "₹" : cur.symbol}
            </span>
            <input
              type="number" min="0.01" step="any" placeholder="Enter any amount"
              value={custom}
              onChange={e => { setCustom(e.target.value); setTierIdx(null); }}
              className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 placeholder:font-normal min-w-0"
            />
            {custom && <button onClick={() => setCustom("")} className="text-muted-foreground/50 hover:text-foreground text-xs shrink-0">✕</button>}
          </div>

          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-border flex items-center justify-between"
              >
                <p className="text-xs text-muted-foreground">
                  Donating to: <span className="font-semibold text-foreground">{prog.icon} {prog.name}</span>
                </p>
                <p className="text-sm font-bold text-violet-700">{summary}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── INDIAN TAB ── */}
        <AnimatePresence mode="wait">
          {donorType === "indian" && (
            <motion.div key="indian" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">

              {/* UPI */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-gradient-to-r from-orange-50/80 to-rose-50/60">
                  <span className="text-base">🇮🇳</span>
                  <p className="font-bold text-sm">Pay via UPI</p>
                  {amtInr && (
                    <span className="ml-auto text-[10px] font-semibold text-orange-700 bg-orange-100 rounded-full px-2.5 py-0.5 shrink-0">
                      ₹{parseInt(amtInr).toLocaleString("en-IN")} pre-filled
                    </span>
                  )}
                </div>
                {upiId ? (
                  <div className="p-4 space-y-3">
                    <div className="md:hidden">
                      {amtInr && (
                        <p className="text-[10px] text-center text-emerald-700 font-semibold bg-emerald-50 rounded-lg py-1.5 px-3 mb-3">
                          ✓ Amount pre-filled — tap your app below
                        </p>
                      )}
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">Open your app</p>
                      <div className={`grid gap-2 ${visibleAppButtons.length <= 2 ? "grid-cols-2" : visibleAppButtons.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
                        {visibleAppButtons.map(({ app, label, Icon }) => (
                          <a key={app} href={upiHref(app, upiId, upiName, amtInr)}
                            className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50/50 transition-all active:scale-95 bg-white/60">
                            <Icon />
                            <span className="text-[10px] font-medium text-foreground leading-tight text-center">{label}</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {qrSrc ? (
                      <div className="hidden md:flex flex-col items-center gap-2">
                        <AnimatePresence mode="wait">
                          <motion.div key={qrSrc} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                            className="border-2 border-orange-100 rounded-2xl p-3 bg-white shadow-md inline-block">
                            <img src={qrSrc} alt="UPI QR Code" className="w-44 h-44 object-contain" />
                          </motion.div>
                        </AnimatePresence>
                        <p className="text-xs text-muted-foreground">
                          {dynamicQrUrl ? `Scan to pay ₹${parseInt(amtInr).toLocaleString("en-IN")} via UPI` : "Scan with any UPI app"}
                        </p>
                      </div>
                    ) : (
                      <div className="hidden md:flex w-44 h-44 mx-auto rounded-2xl bg-orange-50/40 border-2 border-dashed border-orange-200 flex-col items-center justify-center text-center px-3">
                        <p className="text-xs text-muted-foreground">Select an amount above to generate QR</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5">
                      <div>
                        <p className="text-[10px] text-violet-500 font-medium">UPI ID</p>
                        <p className="font-mono font-bold text-xs text-violet-800">{upiId}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{upiName}</p>
                      </div>
                      <CopyBtn text={upiId} />
                    </div>
                  </div>
                ) : (
                  <div className="p-5 text-center">
                    <p className="text-sm text-muted-foreground">UPI not configured yet.</p>
                  </div>
                )}
              </div>

              {/* Bank Transfer */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button onClick={() => setBankOpen(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors">
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
                            { label: "Account Name",   value: settings.bankAccountName   },
                            { label: "Account Number", value: settings.bankAccountNumber },
                            { label: "IFSC",           value: settings.bankIfsc          },
                            { label: "Bank",           value: settings.bankName          },
                            { label: "Branch",         value: settings.bankBranch        },
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
                        <div className="p-4 text-center"><p className="text-sm text-muted-foreground">Bank details not configured.</p></div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── INTERNATIONAL TAB ── */}
          {donorType === "intl" && (
            <motion.div key="intl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">

              {fcraEnabled && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-emerald-600 text-sm">✓</span>
                  <p className="text-[11px] font-semibold text-emerald-700">FCRA Registered — Foreign contributions accepted legally</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: safeHtml(intlNote) }} />
              </div>

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <Globe size={16} className="text-muted-foreground" />
                  <p className="font-bold text-sm">Payment Methods</p>
                </div>
                {hasIntl ? (
                  <div className="p-4 space-y-2">
                    {settings.showRazorpay && settings.razorpayLink && (
                      <a href={settings.razorpayLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between bg-[#072654] text-white rounded-xl px-4 py-3 hover:bg-[#0d3980] transition-colors">
                        <div>
                          <p className="font-semibold text-sm">Razorpay</p>
                          <p className="text-white/60 text-[10px]">Cards, NetBanking, UPI</p>
                        </div>
                        <ArrowRight size={14} />
                      </a>
                    )}
                    {settings.showCashfree && settings.cashfreeLink && (
                      <a href={settings.cashfreeLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between bg-[#1a56db] text-white rounded-xl px-4 py-3 hover:bg-[#1548c4] transition-colors">
                        <div>
                          <p className="font-semibold text-sm">Cashfree</p>
                          <p className="text-white/60 text-[10px]">Cards · UPI · Net banking</p>
                        </div>
                        <ArrowRight size={14} />
                      </a>
                    )}
                    {settings.showPaypal && settings.paypalLink && (
                      <a href={settings.paypalLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between bg-[#003087] text-white rounded-xl px-4 py-3 hover:bg-[#00256b] transition-colors">
                        <div>
                          <p className="font-semibold text-sm">PayPal</p>
                          <p className="text-white/60 text-[10px]">Credit / Debit Card · PayPal balance</p>
                        </div>
                        <ArrowRight size={14} />
                      </a>
                    )}
                    {settings.showStripe && settings.stripeLink && (
                      <a href={settings.stripeLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between bg-[#635bff] text-white rounded-xl px-4 py-3 hover:bg-[#4f48d9] transition-colors">
                        <div>
                          <p className="font-semibold text-sm">Stripe</p>
                          <p className="text-white/60 text-[10px]">All major cards worldwide</p>
                        </div>
                        <ArrowRight size={14} />
                      </a>
                    )}

                    <button onClick={() => setWireOpen(v => !v)}
                      className="w-full flex items-center justify-between bg-muted/40 border border-border rounded-xl px-4 py-3 hover:bg-muted/60 transition-colors text-left">
                      <div>
                        <p className="font-semibold text-sm">Wire / Bank Transfer</p>
                        <p className="text-[10px] text-muted-foreground">SWIFT · NEFT · FCRA account</p>
                      </div>
                      {wireOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </button>
                    <AnimatePresence>
                      {wireOpen && hasBank && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <div className="bg-muted/20 border border-border rounded-xl p-3 space-y-1.5 text-xs">
                            {[
                              { label: "Account Name",   value: settings.bankAccountName   },
                              { label: "Account Number", value: settings.bankAccountNumber },
                              { label: "IFSC / SWIFT",   value: settings.bankIfsc          },
                              { label: "Bank",           value: settings.bankName          },
                              { label: "Branch",         value: settings.bankBranch        },
                            ].filter(r => r.value).map(({ label, value }) => (
                              <div key={label} className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground shrink-0">{label}</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono font-semibold text-foreground text-right">{value}</span>
                                  <CopyBtn text={value!} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="p-5 text-center">
                    <p className="text-sm text-muted-foreground">International payment methods not configured yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tax note */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground text-center px-2 pb-2"
          dangerouslySetInnerHTML={{ __html: safeHtml(taxNote) }}
        />
      </section>

      <Footer />
      <CommunityChat />
    </div>
  );
}