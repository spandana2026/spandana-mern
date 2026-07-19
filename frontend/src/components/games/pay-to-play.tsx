import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Sparkles, ShieldCheck, ExternalLink,
  AlertCircle, Info, QrCode, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  gameEmoji:    string;
  gameTitle:    string;
  price:        number;
  onUnlock:     () => void;
  phonepeUpiId?: string;
  upiQrUrl?:    string;
  razorpayLink?: string;
  trustTagline?: string;
  trustBody?:   string;
  refundPolicy?: string;
  thankyouMsg?: string;
}

type Step = "ready" | "waiting" | "success";
type TappedApp = "razorpay" | "phonepe" | "gpay" | "paytm" | "other" | null;

export default function PayToPlay({
  gameEmoji, gameTitle, price, onUnlock,
  phonepeUpiId, upiQrUrl, razorpayLink,
  trustTagline, trustBody, refundPolicy, thankyouMsg,
}: Props) {
  const [step, setStep]         = useState<Step>("ready");
  const [showQr, setShowQr]     = useState(false);
  const [paidVia, setPaidVia]   = useState<"upi" | "razorpay">("upi");
  const [tappedApp, setTappedApp] = useState<TappedApp>(null);

  const hasUpi      = !!(phonepeUpiId && phonepeUpiId.trim());
  const hasQr       = !!(upiQrUrl && upiQrUrl.trim());
  const hasRazorpay = !!(razorpayLink && razorpayLink.trim());
  const hasAny      = hasUpi || hasRazorpay;

  const note = encodeURIComponent(`Game:${gameTitle}`);
  const name = encodeURIComponent("Spandana Care Aid Foundation");

  const upiParams  = hasUpi
    ? `pa=${encodeURIComponent(phonepeUpiId!)}&pn=${name}&am=${price}&cu=INR&tn=${note}`
    : "";
  const phonepeUrl = hasUpi ? `phonepe://pay?${upiParams}` : "";
  const gpayUrl    = hasUpi ? `gpay://upi/pay?${upiParams}` : "";
  const paytmUrl   = hasUpi ? `paytmmp://pay?${upiParams}` : "";
  const upiUrl     = hasUpi ? `upi://pay?${upiParams}` : "";

  function openUpi(url: string, app: TappedApp) {
    setTappedApp(app);
    setPaidVia("upi");
    window.location.href = url;
    setTimeout(() => setStep("waiting"), 800);
  }

  function openRazorpay() {
    setTappedApp("razorpay");
    setPaidVia("razorpay");
    window.open(razorpayLink, "_blank");
    setTimeout(() => setStep("waiting"), 1200);
  }

  function handleConfirm() {
    setStep("success");
    setTimeout(() => onUnlock(), 1800);
  }

  const effectiveTagline  = trustTagline || "Pay to unlock · 100% funds Spandana's cause";
  const effectiveThankyou = (thankyouMsg || `₹${price} received — thank you for supporting Spandana ❤️`).replace("{price}", String(price));

  /* ── Payment button helpers ── */
  type AppBtn = { id: TappedApp; label: string; emoji: string; color: string; hover: string; onClick: () => void };

  const appButtons: AppBtn[] = [
    ...(hasRazorpay ? [{
      id: "razorpay" as TappedApp,
      label: "Razorpay",
      emoji: "💳",
      color: "bg-[#072654]",
      hover: "hover:bg-[#0d3980]",
      onClick: openRazorpay,
    }] : []),
    ...(hasUpi ? [
      { id: "phonepe" as TappedApp, label: "PhonePe", emoji: "📱", color: "bg-[#5f259f]", hover: "hover:bg-[#4e1e84]", onClick: () => openUpi(phonepeUrl, "phonepe") },
      { id: "gpay"    as TappedApp, label: "GPay",    emoji: "💳", color: "bg-[#1a73e8]", hover: "hover:bg-[#1557b0]", onClick: () => openUpi(gpayUrl, "gpay") },
      { id: "paytm"   as TappedApp, label: "Paytm",   emoji: "💰", color: "bg-[#00b9f1]", hover: "hover:bg-[#0099cc]", onClick: () => openUpi(paytmUrl, "paytm") },
    ] : []),
  ];

  const cols = appButtons.length === 1 ? "grid-cols-1" :
               appButtons.length === 2 ? "grid-cols-2" :
               appButtons.length === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <AnimatePresence mode="wait">

      {step === "ready" && (
        <motion.div key="ready"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
          className="flex flex-col items-center gap-4 py-2">

          {/* Game icon + tagline */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-5xl">
              {gameEmoji}
            </div>
            <h3 className="text-xl font-bold text-center">{gameTitle}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <ShieldCheck size={10} className="text-green-500" />
              {effectiveTagline}
            </div>
          </div>

          {/* Price bubble */}
          <div className="w-full flex flex-col items-center justify-center bg-primary/5 border border-primary/15 rounded-2xl py-4 gap-1">
            <p className="text-4xl font-black text-primary">₹{price}</p>
            <p className="text-xs text-muted-foreground">one-time unlock · {gameTitle}</p>
          </div>

          {hasAny ? (
            <div className="w-full flex flex-col gap-3">

              {/* ── Indian payment buttons grid ── */}
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">
                🇮🇳 Pay ₹{price} via
              </p>

              <div className={`grid ${cols} gap-2`}>
                {appButtons.map(({ id, label, emoji, color, hover, onClick }) => {
                  const tapped = tappedApp === id;
                  return (
                    <button key={id} onClick={onClick}
                      className={`h-14 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1
                        ${color} ${hover} active:scale-[0.97] transition-all text-white shadow-md relative`}>
                      {tapped ? (
                        <motion.div
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 16 }}
                          className="w-7 h-7 rounded-full bg-green-400 flex items-center justify-center">
                          <Check size={16} strokeWidth={3} className="text-white" />
                        </motion.div>
                      ) : (
                        <span className="text-xl leading-none">{emoji}</span>
                      )}
                      <span className={tapped ? "text-green-200" : ""}>{tapped ? "Tapped ✓" : label}</span>
                    </button>
                  );
                })}
              </div>

              {hasRazorpay && (
                <p className="text-[10px] text-center text-muted-foreground -mt-1">
                  Razorpay: cards · net banking · UPI · wallets — receipt sent instantly
                </p>
              )}

              {/* Other UPI app */}
              {hasUpi && (
                <>
                  <button onClick={() => openUpi(upiUrl, "other")}
                    className={`w-full h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2
                      border transition-all
                      ${tappedApp === "other" ? "border-green-400 bg-green-50 text-green-700" : "border-border hover:bg-muted text-muted-foreground"}`}>
                    {tappedApp === "other"
                      ? <><Check size={14} className="text-green-500" /> Opened ✓</>
                      : <><ExternalLink size={14} /> Open other UPI app</>}
                  </button>
                  {hasQr && (
                    <button onClick={() => setShowQr(v => !v)}
                      className="w-full h-9 rounded-xl text-xs font-medium flex items-center justify-center gap-2
                        border border-border hover:bg-muted text-muted-foreground transition-all">
                      <QrCode size={13} /> {showQr ? "Hide QR Code" : "Scan QR Code instead"}
                    </button>
                  )}
                  <AnimatePresence>
                    {showQr && hasQr && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <div className="flex flex-col items-center gap-2 py-4 bg-muted/30 rounded-2xl border border-border">
                          <img src={upiQrUrl} alt="UPI QR Code" className="w-44 h-44 object-contain rounded-xl border border-border bg-white p-2" />
                          <p className="text-[10px] text-muted-foreground">Scan with PhonePe · GPay · Paytm</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              <p className="text-[10px] text-center text-muted-foreground">
                After paying, tap below to unlock your game.
              </p>

              {/* "I've already paid" */}
              <Button variant="outline" className="w-full rounded-2xl gap-2" onClick={() => setStep("waiting")}>
                I've Already Paid — Unlock ✓
              </Button>

              {/* Where does money go? */}
              {trustBody && (
                <div className="flex items-start gap-2.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3">
                  <Info size={14} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-0.5">Where does my money go?</p>
                    <p className="text-[11px] text-green-700 dark:text-green-300 leading-relaxed">{trustBody}</p>
                  </div>
                </div>
              )}

              {/* Refund / dispute policy */}
              {refundPolicy && (
                <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                  <ShieldCheck size={11} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{refundPolicy}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Payments not set up yet</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    The admin needs to configure a Razorpay link or UPI ID in Joy Zone settings before payments can be accepted.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <ShieldCheck size={11} className="text-green-500" />
            Secure payment · Funds go directly to Spandana's programs
          </div>
        </motion.div>
      )}

      {step === "waiting" && (
        <motion.div key="waiting"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col items-center gap-5 py-8">
          <div className="text-5xl">{gameEmoji}</div>
          <div className="text-center">
            {paidVia === "razorpay" ? (
              <>
                <p className="font-bold text-lg">Razorpay payment opened 💳</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete payment of <span className="font-semibold text-primary">₹{price}</span> on Razorpay — you'll get a receipt. Then tap below.
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-lg">Payment opened in UPI app</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete payment of <span className="font-semibold text-primary">₹{price}</span> in the app, then tap below.
                </p>
              </>
            )}
          </div>
          <Button onClick={handleConfirm} className="w-full h-12 rounded-2xl text-base font-bold gap-2">
            <CheckCircle2 size={18} /> I've Paid ₹{price} — Unlock Game
          </Button>
          <button onClick={() => { setStep("ready"); setTappedApp(null); }} className="text-xs text-muted-foreground underline underline-offset-2">
            Go back
          </button>
        </motion.div>
      )}

      {step === "success" && (
        <motion.div key="success"
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col items-center gap-4 py-10">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 16 }}
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={44} className="text-green-500" />
          </motion.div>
          <div className="text-center">
            <h3 className="text-xl font-bold">Payment Confirmed! 🎉</h3>
            <p className="text-sm text-muted-foreground mt-1">{effectiveThankyou}</p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: 2, duration: 0.4 }}
            className="flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full font-semibold text-sm">
            <Sparkles size={15} /> Launching {gameTitle}…
          </motion.div>
        </motion.div>
      )}

    </AnimatePresence>
  );
}
