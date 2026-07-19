import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Loader2, Plus, Trash2, Pencil, X, Eye, EyeOff,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Upload, Download, RefreshCw, ExternalLink, Lock, KeyRound,
  UserCheck, UserX, UserPlus, CalendarDays, MapPin, Clock,
  Send, History, Megaphone, Image, Globe, Gamepad2,
  ToggleLeft, ToggleRight, DollarSign, Mail, Sheet,
  Star, Building2, Navigation, UsersRound, FileText, FolderOpen,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch }   from "@/components/ui/switch";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { SectionCard, Field, Label, DeviceTabs, VisibilityToggleRow } from "./shared";
import type { SiteSettings } from "./types";

interface Props {
  settings: SiteSettings;
  updateSettings: (path: (string | number)[], val: unknown) => void;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  token: string;
  saving: boolean;
  onSave: () => void;
  showFeedback: (type: "success" | "error", msg: string) => void;
}

type FunZoneSubTab = "hero" | "games" | "payments" | "pricing" | "ads" | "content" | "music";
type GameOverride = Record<string, unknown>;
type AdItem = { id?: string; title?: string; body?: string; imageUrl?: string; videoUrl?: string; enabled?: boolean; [key: string]: unknown };
const EMPTY_TRACK = { title: "", artist: "", url: "" };

export default function FunZoneTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  const [fzSubTab, setFzSubTab] = useState<FunZoneSubTab>("hero");
  const [newMusicTrack, setNewMusicTrack] = useState(EMPTY_TRACK);
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold flex items-center gap-2"><Gamepad2 size={22} /> Fun Zone / Joy Zone</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage the <a href="/fun-zone" target="_blank" className="underline text-primary">/fun-zone</a> page — hero, games, payments, pricing, ads, and content.</p>
                </div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Changes</>}
                </Button>
              </div>

              {/* ── FUN ZONE SUB-NAV ─────────────────────────────────── */}
              <div className="flex gap-1 mb-6 p-1 bg-muted/40 border border-border rounded-2xl overflow-x-auto">
                {([
                  { id: "hero",     emoji: "🎮", label: "Hero" },
                  { id: "games",    emoji: "🎲", label: "Games" },
                  { id: "payments", emoji: "💳", label: "Payments" },
                  { id: "pricing",  emoji: "💰", label: "Pricing" },
                  { id: "ads",      emoji: "📢", label: "Ads" },
                  { id: "content",  emoji: "✏️", label: "Content" },
                  { id: "music",    emoji: "🎵", label: "Playlist" },
                ] as const).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setFzSubTab(s.id)}
                    className={[
                      "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-w-0",
                      fzSubTab === s.id
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}>
                    <span>{s.emoji}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                ))}
              </div>

              {/* ══ HERO SUB-TAB ═══════════════════════════════════════ */}
              {fzSubTab === "hero" && (<>
              {/* ── MODE TOGGLE ───────────────────────────────────────── */}
              <SectionCard title="🕹️ Play Mode — Free or Pay to Play">
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Switch between Ad-Supported (all games free, short ad plays before each) and Pay to Play (visitors donate to unlock each game). You can switch anytime — no data is lost.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {([
                    {
                      value: "free",
                      label: "🎬 Ad-Supported",
                      sub: "Free to Play",
                      desc: "All games are free. A short sponsor ad plays before each game. No payment screen shown. Currency selector is hidden.",
                      color: "emerald",
                    },
                    {
                      value: "pay",
                      label: "💰 Pay to Play",
                      sub: "Donation-Gated",
                      desc: "Visitors pay a small amount to unlock each game. Funds go directly to Spandana programs. PhonePe / UPI payment screen is shown.",
                      color: "violet",
                    },
                  ] as const).map(opt => {
                    const currentMode = settings.gameSettings?.mode ?? "free";
                    const isSelected = currentMode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => updateSettings(["gameSettings", "mode"], opt.value)}
                        className={[
                          "text-left p-4 rounded-2xl border-2 transition-all",
                          isSelected
                            ? opt.value === "free"
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                              : "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                            : "border-border bg-muted/20 hover:border-primary/30",
                        ].join(" ")}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{opt.label}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.value === "free" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}>{opt.sub}</span>
                          {isSelected && <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-primary">✓ Active</span>}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300">
                  <strong>Currently:</strong>{" "}
                  {(settings.gameSettings?.mode ?? "free") === "free"
                    ? "🎬 Ad-Supported — all games are free. A sponsor ad plays before each launch."
                    : "💰 Pay to Play — visitors pay a small donation to unlock each game."}
                </div>
              </SectionCard>

              {/* ── HERO MODE BUTTONS ─────────────────────────────────── */}
              <SectionCard title="🎬 Hero Mode Buttons — Click to Play & Pay to Play" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Two self-selection buttons shown in the Joy Zone hero banner. Visitors pick their preferred mode and scroll directly to the game lobby. You control which buttons appear and what the default mode is.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-emerald-800">🎬 Click to Play</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Switch
                          checked={settings.funZonePage?.heroButtons?.showFree !== false}
                          onCheckedChange={v => updateSettings(["funZonePage", "heroButtons", "showFree"], v)}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground">Show</span>
                      </label>
                    </div>
                    <Field label="Button Label">
                      <Input value={settings.funZonePage?.heroButtons?.freeLabel ?? ""} onChange={e => updateSettings(["funZonePage", "heroButtons", "freeLabel"], e.target.value)} placeholder="Click to Play" />
                    </Field>
                    <Field label="Description">
                      <Input value={settings.funZonePage?.heroButtons?.freeDesc ?? ""} onChange={e => updateSettings(["funZonePage", "heroButtons", "freeDesc"], e.target.value)} placeholder="Watch a short ad · Free" />
                    </Field>
                  </div>
                  <div className="p-3 rounded-2xl border border-violet-200 bg-violet-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-violet-800">💰 Pay to Play</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Switch
                          checked={settings.funZonePage?.heroButtons?.showPay !== false}
                          onCheckedChange={v => updateSettings(["funZonePage", "heroButtons", "showPay"], v)}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground">Show</span>
                      </label>
                    </div>
                    <Field label="Button Label">
                      <Input value={settings.funZonePage?.heroButtons?.payLabel ?? ""} onChange={e => updateSettings(["funZonePage", "heroButtons", "payLabel"], e.target.value)} placeholder="Pay to Play" />
                    </Field>
                    <Field label="Description">
                      <Input value={settings.funZonePage?.heroButtons?.payDesc ?? ""} onChange={e => updateSettings(["funZonePage", "heroButtons", "payDesc"], e.target.value)} placeholder="Small donation · Unlock" />
                    </Field>
                  </div>
                </div>
                <Field label="Default Mode (which mode visitors get on landing)" description="Visitor can always switch via the buttons — this sets the starting state.">
                  <select
                    value={settings.funZonePage?.heroButtons?.defaultMode ?? "free"}
                    onChange={e => updateSettings(["funZonePage", "heroButtons", "defaultMode"], e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="free">🎬 Click to Play (Free / Ad-Supported) — default</option>
                    <option value="pay">💰 Pay to Play (Donation-gated)</option>
                  </select>
                </Field>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 mt-2">
                  <strong>How it works:</strong> Buttons appear in the hero section below "Play. Win. Make magic." Visitor taps one → mode is set → page scrolls to the game lobby. Both buttons are shown by default. Hide either to lock visitors into one mode without showing the choice.
                </div>

                {/* ── Button Style ── */}
                <div className="mt-5 pt-5 border-t border-border space-y-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Button Style</p>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Layout">
                      <select
                        value={settings.funZonePage?.heroButtons?.btnLayout ?? "side-by-side"}
                        onChange={e => updateSettings(["funZonePage", "heroButtons", "btnLayout"], e.target.value)}
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm">
                        <option value="side-by-side">⊞ Side by Side</option>
                        <option value="stacked">☰ Stacked (full-width)</option>
                      </select>
                    </Field>

                    <Field label="Size">
                      <select
                        value={settings.funZonePage?.heroButtons?.btnSize ?? "regular"}
                        onChange={e => updateSettings(["funZonePage", "heroButtons", "btnSize"], e.target.value)}
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm">
                        <option value="compact">Compact</option>
                        <option value="regular">Regular</option>
                        <option value="large">Large</option>
                      </select>
                    </Field>

                    <Field label="Shape">
                      <select
                        value={settings.funZonePage?.heroButtons?.btnShape ?? "rounded"}
                        onChange={e => updateSettings(["funZonePage", "heroButtons", "btnShape"], e.target.value)}
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm">
                        <option value="rounded">Rounded (2xl)</option>
                        <option value="pill">Pill (full)</option>
                        <option value="square">Square (lg)</option>
                      </select>
                    </Field>

                    <Field label="Text Alignment">
                      <select
                        value={settings.funZonePage?.heroButtons?.btnAlign ?? "center"}
                        onChange={e => updateSettings(["funZonePage", "heroButtons", "btnAlign"], e.target.value)}
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm">
                        <option value="center">Center</option>
                        <option value="left">Left</option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Click to Play — Color">
                      <select
                        value={settings.funZonePage?.heroButtons?.freeColor ?? "emerald"}
                        onChange={e => updateSettings(["funZonePage", "heroButtons", "freeColor"], e.target.value)}
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm">
                        <option value="emerald">🟢 Emerald (green)</option>
                        <option value="teal">🩵 Teal</option>
                        <option value="blue">🔵 Blue</option>
                        <option value="cyan">💎 Cyan</option>
                        <option value="sky">🌤 Sky</option>
                        <option value="lime">🍋 Lime</option>
                      </select>
                    </Field>

                    <Field label="Pay to Play — Color">
                      <select
                        value={settings.funZonePage?.heroButtons?.payColor ?? "violet"}
                        onChange={e => updateSettings(["funZonePage", "heroButtons", "payColor"], e.target.value)}
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm">
                        <option value="violet">🟣 Violet</option>
                        <option value="purple">💜 Purple</option>
                        <option value="rose">🌹 Rose</option>
                        <option value="pink">🩷 Pink</option>
                        <option value="amber">🟡 Amber</option>
                        <option value="orange">🟠 Orange</option>
                      </select>
                    </Field>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm text-foreground">Show emoji icon</p>
                      <p className="text-[10px] text-muted-foreground">The 🎬 and 💰 icons above the button label</p>
                    </div>
                    <Switch
                      checked={settings.funZonePage?.heroButtons?.showBtnEmoji !== false}
                      onCheckedChange={v => updateSettings(["funZonePage", "heroButtons", "showBtnEmoji"], v)}
                    />
                  </div>
                </div>
              </SectionCard>

              {/* Hero */}
              <SectionCard title="🎮 Hero Section">
                {/* ── Element Visibility ── */}
                <div className="mb-4 p-3 bg-muted/30 rounded-2xl border border-border/60 space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Show / Hide Hero Elements</p>
                  {([
                    { key: "showBadge",    label: "Badge pill" },
                    { key: "showHeading",  label: "Heading" },
                    { key: "showSubtitle", label: "Subtitle / tagline" },
                    { key: "showPills",    label: "Stat pills (mobile only)" },
                    { key: "showButtons",  label: "Click to Play / Pay to Play buttons" },
                  ] as const).map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-0.5">
                      <span className="text-sm text-foreground">{label}</span>
                      <Switch
                        checked={settings.funZonePage?.heroVisibility?.[key] !== false}
                        onCheckedChange={v => updateSettings(["funZonePage", "heroVisibility", key], v)}
                      />
                    </div>
                  ))}
                </div>
                <DeviceTabs>
                  {(view) => view === "desktop" ? (
                    <div className="grid gap-4">
                      <Field label="Badge Text" description="Shown in the pill above the heading">
                        <Input value={settings.funZonePage?.badge ?? ""} onChange={(e) => updateSettings(["funZonePage", "badge"], e.target.value)} placeholder="Joy Zone" />
                      </Field>
                      <RichTextEditor label='Heading — e.g. "Play, Laugh & Make a Difference"' value={settings.funZonePage?.headingDesktop ?? ""} onChange={(html) => updateSettings(["funZonePage", "headingDesktop"], html)} minHeight={60} placeholder="Play, Laugh & Make a Difference" />
                      <RichTextEditor label="Subtitle" value={settings.funZonePage?.subtitle ?? ""} onChange={(html) => updateSettings(["funZonePage", "subtitle"], html)} minHeight={60} placeholder="Every game you play sends a smile to a family in need." />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <p className="text-xs text-muted-foreground -mt-2">Mobile hero has a two-line gradient heading. Leave blank to use desktop values.</p>
                      <Field label="Heading — Line 1 (gradient)" description='e.g. "Play. Win."'>
                        <Input value={settings.funZonePage?.headingMobile1 ?? ""} onChange={(e) => updateSettings(["funZonePage", "headingMobile1"], e.target.value)} placeholder="Play. Win." />
                      </Field>
                      <Field label="Heading — Line 2 (white)" description='e.g. "Make magic."'>
                        <Input value={settings.funZonePage?.headingMobile2 ?? ""} onChange={(e) => updateSettings(["funZonePage", "headingMobile2"], e.target.value)} placeholder="Make magic." />
                      </Field>
                      <RichTextEditor label="Subtitle (Mobile) — leave blank to reuse desktop" value={settings.funZonePage?.subtitleMobile ?? ""} onChange={(html) => updateSettings(["funZonePage", "subtitleMobile"], html)} minHeight={60} placeholder="Same as desktop if empty" />
                    </div>
                  )}
                </DeviceTabs>
              </SectionCard>
              </>)}

              {/* ══ PAYMENTS SUB-TAB (India UPI) ════════════════════════ */}
              {fzSubTab === "payments" && (<>
              {/* ── INDIA UPI PAYMENT SETUP ───────────────────────────── */}
              <SectionCard title="🇮🇳 India — UPI Payment Setup">
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Configure UPI so visitors can pay to unlock games. Every payment goes directly to Spandana's programs. Without a UPI ID, paid games show a "not set up" message.
                </p>
                <Field label="PhonePe / UPI ID" description="e.g. spandana@ybl — this UPI ID receives all Joy Zone game unlock payments">
                  <Input value={settings.gameSettings?.phonepeUpiId ?? ""} onChange={(e) => updateSettings(["gameSettings", "phonepeUpiId"], e.target.value)} placeholder="spandana@ybl" />
                </Field>
                <Field label="UPI Account Name" description="Shown to visitors in their payment app during checkout">
                  <Input value={settings.gameSettings?.upiName ?? ""} onChange={(e) => updateSettings(["gameSettings", "upiName"], e.target.value)} placeholder="Spandana Care Aid Foundation" />
                </Field>
                <Field label="Payment QR Code" description="Visitors can scan this instead of tapping a deep link — helpful when buttons don't open their UPI app">
                  <div className="flex flex-col gap-2">
                    {settings.gameSettings?.upiQrUrl && (
                      <div className="flex items-center gap-3 p-2 bg-muted/40 rounded-xl border border-border">
                        <img src={settings.gameSettings.upiQrUrl} alt="QR" className="w-16 h-16 object-contain rounded-lg border border-border bg-white" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">QR Code uploaded</p>
                          <p className="text-[10px] text-muted-foreground truncate">{settings.gameSettings.upiQrUrl}</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10 text-xs" onClick={() => updateSettings(["gameSettings", "upiQrUrl"], "")}>Remove</Button>
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const form = new FormData(); form.append("file", file);
                        try {
                          const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
                          const data = await res.json() as { url?: string; error?: string };
                          if (data.url) { updateSettings(["gameSettings", "upiQrUrl"], data.url); showFeedback("success", "QR code uploaded!"); }
                          else showFeedback("error", data.error ?? "Upload failed");
                        } catch { showFeedback("error", "Upload failed"); }
                      }} />
                      <span className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/40 rounded-xl py-3 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/20">
                        <Upload size={15} /> {settings.gameSettings?.upiQrUrl ? "Replace QR Code" : "Upload QR Code Image"}
                      </span>
                    </label>
                  </div>
                </Field>
              </SectionCard>

              {/* ── RAZORPAY VERIFIED PAYMENTS ────────────────────────── */}
              <SectionCard title="🔐 Razorpay — Verified Payments">
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Add a Razorpay payment link to let players pay via card, net banking, UPI, or wallets. Unlike plain UPI deep links, Razorpay sends the player an instant payment receipt — so you can verify who paid. Players see a "Pay via Razorpay" button above the UPI options.
                </p>
                <Field label="Razorpay Payment Link" description="e.g. https://razorpay.me/@spandanacareaidfoundation — shown to players on the pay-to-play screen">
                  <Input
                    value={settings.gameSettings?.razorpayLink ?? ""}
                    onChange={(e) => updateSettings(["gameSettings", "razorpayLink"], e.target.value)}
                    placeholder="https://razorpay.me/@spandanacareaidfoundation"
                  />
                </Field>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300">
                  <strong>How to verify:</strong> Log in to your Razorpay dashboard → Payments. Every game payment shows the player's name, phone, and a receipt ID. Leave blank to show only UPI options.
                </div>
              </SectionCard>

              {/* ── INTERNATIONAL PAYMENT SETUP ───────────────────────── */}
              <SectionCard title="🌍 International Payment Setup" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Configure a payment link per country/region. Visitors outside India automatically see the button that matches their country — PayPal, UPI, bank transfer, etc. UPI remains visible as a fallback for diaspora with Indian bank accounts.
                </p>

                {(() => {
                  const REGIONS: { key: string; label: string; hint: string }[] = [
                    { key: "US", label: "🇺🇸 USA & Canada",    hint: "Covers US + CA visitors" },
                    { key: "AE", label: "🇦🇪 UAE",              hint: "Covers AE — many NRIs use UPI or PayPal here" },
                    { key: "GB", label: "🇬🇧 United Kingdom",   hint: "Covers GB visitors" },
                    { key: "AU", label: "🇦🇺 Australia & NZ",   hint: "Covers AU + NZ visitors" },
                    { key: "SG", label: "🇸🇬 Singapore",        hint: "Covers SG visitors" },
                    { key: "EU", label: "🇪🇺 Europe",           hint: "Covers DE, FR, IT, ES, NL, BE, AT, PT, FI, IE, GR…" },
                    { key: "default", label: "🌍 All Other Countries", hint: "Fallback for any country not listed above" },
                  ];
                  const gw = settings.gameSettings?.intlGateways ?? {};
                  return (
                    <div className="space-y-4">
                      {REGIONS.map(r => (
                        <div key={r.key} className="rounded-2xl border border-border p-4 space-y-3 bg-muted/20">
                          <div>
                            <p className="text-sm font-bold text-foreground">{r.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{r.hint}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Method">
                              <select
                                value={gw[r.key]?.method ?? ""}
                                onChange={e => updateSettings(["gameSettings", "intlGateways", r.key, "method"], e.target.value)}
                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm">
                                <option value="">— Off —</option>
                                <option value="PayPal">PayPal</option>
                                <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                                <option value="UPI (GPay)">UPI (GPay)</option>
                                <option value="Stripe">Stripe</option>
                                <option value="Razorpay">Razorpay</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Card Payment">Card Payment</option>
                                <option value="Other">Other</option>
                              </select>
                            </Field>
                            <Field label="Payment URL">
                              <Input
                                value={gw[r.key]?.url ?? ""}
                                onChange={e => updateSettings(["gameSettings", "intlGateways", r.key, "url"], e.target.value)}
                                placeholder="https://paypal.me/spandana"
                              />
                            </Field>
                          </div>
                          <Field label="Note (optional)" description="Shown below the button on the payment screen">
                            <Input
                              value={gw[r.key]?.note ?? ""}
                              onChange={e => updateSettings(["gameSettings", "intlGateways", r.key, "note"], e.target.value)}
                              placeholder="After payment, DM us on Instagram for your access code."
                            />
                          </Field>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300 mt-4">
                  <strong>How it works:</strong> The visitor's country is detected by IP. The matching region's button is shown. If no region is set for their country, the "All Other Countries" fallback is used. Leave a region's Method as "— Off —" to skip it and fall through to the next.
                </div>
              </SectionCard>
              </>)}

              {/* ══ GAMES SUB-TAB ═══════════════════════════════════════ */}
              {fzSubTab === "games" && (<>
              {/* ── GAME MANAGEMENT (India / Intl split) ──────────────── */}
              {(() => {
                const BUILTIN_META = [
                  { id: "ludo-multi", emoji: "🎲", title: "Ludo — Online",        defaultPrice: "₹30–₹50" },
                  { id: "ludo",       emoji: "🎲", title: "Ludo — Local",         defaultPrice: "₹20–₹40" },
                  { id: "ttt-multi",  emoji: "⭕", title: "Tic-Tac-Toe — Online", defaultPrice: "₹30" },
                  { id: "ttt",        emoji: "⭕", title: "Tic-Tac-Toe — Local",  defaultPrice: "₹20" },
                  { id: "memory",     emoji: "🃏", title: "Memory Match",         defaultPrice: "₹30" },
                  { id: "darts",      emoji: "🎯", title: "Darts",                defaultPrice: "₹30" },
                  { id: "tambola",    emoji: "🎱", title: "Tambola / Housie",     defaultPrice: "₹30" },
                  { id: "snakes",     emoji: "🐍", title: "Snakes & Ladders",     defaultPrice: "₹20" },
                  { id: "match3",     emoji: "🍬", title: "Match-3 Crush",        defaultPrice: "₹30" },
                  { id: "platformer", emoji: "🕹️", title: "Platform Hero",         defaultPrice: "₹30" },
                ];
                const overrides: Record<string, GameOverride> = settings.gameSettings?.overrides ?? {};
                const savedOrder: string[] = settings.gameSettings?.gameOrder ?? BUILTIN_META.map(g => g.id);
                const orderedMeta = [
                  ...savedOrder.map(id => BUILTIN_META.find(g => g.id === id)).filter(Boolean) as typeof BUILTIN_META,
                  ...BUILTIN_META.filter(g => !savedOrder.includes(g.id)),
                ];

                const moveGame = (id: string, dir: -1 | 1) => {
                  const cur = [...savedOrder];
                  const idx = cur.indexOf(id);
                  if (idx < 0) return;
                  const newIdx = idx + dir;
                  if (newIdx < 0 || newIdx >= cur.length) return;
                  [cur[idx], cur[newIdx]] = [cur[newIdx], cur[idx]];
                  updateSettings(["gameSettings", "gameOrder"], cur);
                };
                const updOv = (id: string, key: string, val: unknown) => {
                  const next = { ...overrides, [id]: { ...(overrides[id] ?? {}), [key]: val } };
                  updateSettings(["gameSettings", "overrides"], next);
                };

                const renderCard = (g: typeof BUILTIN_META[0], section: "india" | "intl") => {
                  const globalIdx = orderedMeta.findIndex(m => m.id === g.id);
                  const ov = overrides[g.id] ?? {};
                  const enabled = ov.enabled !== false;
                  const isFree  = ov.isFree === true;
                  return (
                    <div key={`${g.id}-${section}`} className={`rounded-2xl border transition-all ${enabled ? "border-border bg-card" : "border-border/40 bg-muted/20 opacity-60"}`}>
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        <div className="flex flex-col gap-0 shrink-0">
                          <button onClick={() => moveGame(g.id, -1)} disabled={globalIdx === 0}
                            className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors p-0.5"><ChevronUp size={13} /></button>
                          <button onClick={() => moveGame(g.id, 1)} disabled={globalIdx === orderedMeta.length - 1}
                            className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors p-0.5"><ChevronDown size={13} /></button>
                        </div>
                        <span className="text-xl shrink-0">{ov.emoji || g.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-tight truncate">{ov.title || g.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {g.defaultPrice}
                            {isFree && <span className="ml-2 text-emerald-600 font-bold">→ FREE override</span>}
                            {!enabled && <span className="ml-2 text-amber-600 font-bold">· Hidden</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <label className="flex flex-col items-center gap-0.5 cursor-pointer select-none">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wide">Free</span>
                            <Switch checked={isFree} onCheckedChange={v => updOv(g.id, "isFree", v)} disabled={!enabled} />
                          </label>
                          <label className="flex flex-col items-center gap-0.5 cursor-pointer select-none">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wide">Active</span>
                            <Switch checked={enabled} onCheckedChange={v => updOv(g.id, "enabled", v)} />
                          </label>
                        </div>
                      </div>
                      {enabled && (
                        <div className="border-t border-border/40 px-3 py-3 grid grid-cols-3 gap-2">
                          <Field label="Emoji">
                            <Input value={ov.emoji ?? ""} onChange={e => updOv(g.id, "emoji", e.target.value)} placeholder={g.emoji} className="font-mono text-center" />
                          </Field>
                          <Field label="Display Name">
                            <Input value={ov.title ?? ""} onChange={e => updOv(g.id, "title", e.target.value)} placeholder={g.title} />
                          </Field>
                          <Field label="Tagline">
                            <Input value={ov.tagline ?? ""} onChange={e => updOv(g.id, "tagline", e.target.value)} placeholder="Short tagline…" />
                          </Field>
                          <Field label="Audience" description="Who sees this game">
                            <select value={ov.showTo ?? "all"} onChange={e => updOv(g.id, "showTo", e.target.value)}
                              className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs">
                              <option value="all">🌍 Everyone</option>
                              <option value="india">🇮🇳 India only</option>
                              <option value="intl">🌐 International only</option>
                            </select>
                          </Field>
                          <Field label="Play Mode" description="Override global mode">
                            <select value={ov.playMode ?? "inherit"} onChange={e => updOv(g.id, "playMode", e.target.value)}
                              className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs">
                              <option value="inherit">🔗 Use global setting</option>
                              <option value="free">🎬 Click to Play</option>
                              <option value="pay">💰 Pay to Play</option>
                            </select>
                          </Field>
                          {section === "india" ? (
                            <Field label="Price (INR) ₹" description="Leave blank → global INR rate">
                              <Input type="number" min="0" step="1"
                                value={ov.priceIndia ?? ""}
                                onChange={e => updOv(g.id, "priceIndia", e.target.value !== "" ? Number(e.target.value) : null)}
                                placeholder="Global" />
                            </Field>
                          ) : (
                            <Field label="Price (USD) $" description="Leave blank → global USD rate">
                              <Input type="number" min="0" step="0.01"
                                value={ov.priceIntl ?? ""}
                                onChange={e => updOv(g.id, "priceIntl", e.target.value !== "" ? Number(e.target.value) : null)}
                                placeholder="Global" />
                            </Field>
                          )}
                        </div>
                      )}
                    </div>
                  );
                };

                const indiaGames = orderedMeta.filter(g => { const s = overrides[g.id]?.showTo ?? "all"; return s === "india" || s === "all"; });
                const intlGames  = orderedMeta.filter(g => { const s = overrides[g.id]?.showTo ?? "all"; return s === "intl"  || s === "all"; });

                return (
                  <>
                    <SectionCard title="🇮🇳 Indian Games">
                      <p className="text-xs text-muted-foreground -mt-2 mb-4">
                        Games shown to India visitors. Games set to "Everyone" appear here and in International. ↑↓ reorders globally across both sections.
                      </p>
                      <div className="space-y-2">
                        {indiaGames.map(g => renderCard(g, "india"))}
                        {indiaGames.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No games assigned to India. Set Audience to "India only" or "Everyone".</p>}
                      </div>
                      <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
                        <AlertCircle size={13} className="shrink-0 mt-0.5" />
                        <span><strong>Active OFF</strong> hides the game. <strong>Free ON</strong> skips payment. <strong>Price ₹</strong> overrides the global INR rate for this game only.</span>
                      </div>
                    </SectionCard>

                    <SectionCard title="🌍 International Games" defaultOpen={false}>
                      <p className="text-xs text-muted-foreground -mt-2 mb-4">
                        Games shown to visitors outside India. Games set to "Everyone" also appear here. Price $ overrides the global USD rate for this game only.
                      </p>
                      <div className="space-y-2">
                        {intlGames.map(g => renderCard(g, "intl"))}
                        {intlGames.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No games assigned to International. Set Audience to "International only" or "Everyone".</p>}
                      </div>
                      <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300">
                        <AlertCircle size={13} className="shrink-0 mt-0.5" />
                        <span><strong>Price $</strong> overrides the global USD pricing for this game. Leave blank to use the rates set in the Pricing tab.</span>
                      </div>
                    </SectionCard>
                  </>
                );
              })()}
              </>)}

              {/* ══ PRICING SUB-TAB ═════════════════════════════════════ */}
              {fzSubTab === "pricing" && (<>
              {/* ── GLOBAL PRICE DEFAULTS ─────────────────────────────── */}
              <SectionCard title="💰 Indian Pricing (INR)" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Base prices used for each play mode. Per-game "Free" overrides above always take priority over these values.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "solo",     label: "Solo (₹)",            desc: "Memory, Darts, Quiz, Match-3",    def: 30 },
                    { key: "online2p", label: "Online 2-player (₹)",  desc: "TTT Online · Ludo Online 2p",     def: 30 },
                    { key: "online4p", label: "Online 4-player (₹)",  desc: "Ludo Online 4p",                  def: 50 },
                    { key: "local2p",  label: "Local 2-player (₹)",   desc: "TTT Local · Ludo Local 2p",       def: 20 },
                    { key: "local4p",  label: "Local 4-player (₹)",   desc: "Ludo Local 4p",                   def: 40 },
                  ].map(({ key, label, desc, def }) => (
                    <div key={key}>
                      <Field label={label} description={desc}>
                        <Input type="number" min="0" step="1"
                          value={settings.gameSettings?.prices?.[key] ?? def}
                          onChange={(e) => {
                            const cur = settings.gameSettings?.prices ?? { online2p: 30, online4p: 50, local2p: 20, local4p: 40, solo: 30 };
                            updateSettings(["gameSettings", "prices"], { ...cur, [key]: Number(e.target.value) });
                          }} />
                      </Field>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                  <span className="font-semibold">Tip:</span> To make all games free at once, use the "Free" toggles per game above rather than setting prices to ₹0.
                </div>
              </SectionCard>

              {/* ── INTERNATIONAL PRICING ─────────────────────────────── */}
              <SectionCard title="🌍 International Prices (USD)" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Set fixed USD prices for visitors outside India. If left at 0, the system converts INR prices using live exchange rates. These USD prices only display — actual payment uses the UPI QR code for now.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "solo",     label: "Solo ($)",            desc: "Tambola, Match-3, Memory…",    def: 0 },
                    { key: "online2p", label: "Online 2-player ($)",  desc: "TTT Online, Ludo Online",      def: 0 },
                    { key: "online4p", label: "Online 4-player ($)",  desc: "Ludo Online 4-player",         def: 0 },
                    { key: "local2p",  label: "Local 2-player ($)",   desc: "Snakes & Ladders, TTT Local",  def: 0 },
                    { key: "local4p",  label: "Local 4-player ($)",   desc: "Ludo Local 4-player",          def: 0 },
                  ].map(({ key, label, desc, def }) => (
                    <div key={key}>
                      <Field label={label} description={desc}>
                        <Input type="number" min="0" step="0.5" placeholder="0 = use exchange rate"
                          value={settings.gameSettings?.pricesIntl?.[key] ?? def}
                          onChange={(e) => {
                            const cur = settings.gameSettings?.pricesIntl ?? {};
                            updateSettings(["gameSettings", "pricesIntl"], { ...cur, [key]: Number(e.target.value) });
                          }} />
                      </Field>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                  <span className="font-semibold">Note:</span> Online UPI payment is India-only. International visitors see the price but will need a future Stripe/PayPal integration to actually pay. Set to 0 to auto-convert from INR.
                </div>
              </SectionCard>
              </>)}

              {/* ══ PAYMENTS SUB-TAB (Trust + Access Code) ══════════════ */}
              {fzSubTab === "payments" && (<>
              {/* ── TRUST & TRANSPARENCY ──────────────────────────────── */}
              <SectionCard title="🛡️ Trust & Transparency Copy" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  The exact words visitors see before and during payment. Good copy here = visitors feel safe, not ripped off.
                </p>
                <Field label="Payment Screen — Trust Tagline" description="Short trust line shown under the game icon on the payment screen">
                  <Input value={settings.gameSettings?.trustTagline ?? ""} onChange={(e) => updateSettings(["gameSettings", "trustTagline"], e.target.value)} placeholder="Pay to unlock · 100% funds Spandana's cause" />
                </Field>
                <RichTextEditor label='"Where does my money go?" callout — shown as a green callout on the payment screen' value={settings.gameSettings?.trustBody ?? ""} onChange={(html) => updateSettings(["gameSettings", "trustBody"], html)} minHeight={80} placeholder="Every rupee you pay unlocks a game AND funds Spandana's healthcare, skill-training, and mental-health programs for families in need. We are an 80G-certified NGO." />
                <RichTextEditor label="Refund & Dispute Policy — shown at the bottom of the payment card" value={settings.gameSettings?.refundPolicy ?? ""} onChange={(html) => updateSettings(["gameSettings", "refundPolicy"], html)} minHeight={80} placeholder="Paid but can't access the game? Email care@spandana.org with your UPI reference number and we'll resolve it within 24 hours." />
                <Field label="Post-unlock Thank-you Message" description="Shown after payment confirmation. Type {price} to insert the amount dynamically.">
                  <Input value={settings.gameSettings?.thankyouMsg ?? ""} onChange={(e) => updateSettings(["gameSettings", "thankyouMsg"], e.target.value)} placeholder="₹{price} received — thank you for supporting Spandana ❤️" />
                </Field>
              </SectionCard>
              </>)}

              {/* ══ HERO SUB-TAB (Banner + Pills) ═══════════════════════ */}
              {fzSubTab === "hero" && (<>
              {/* ── LOBBY TRANSPARENCY BANNER ─────────────────────────── */}
              <SectionCard title="📢 Lobby Transparency Banner" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  A visible notice at the top of the Joy Zone game lobby explaining how pay-to-play works. Builds visitor trust before they reach the payment screen.
                </p>
                <Field label="Show Banner in Lobby">
                  <div className="flex items-center gap-3">
                    <Switch checked={settings.gameSettings?.bannerEnabled === true} onCheckedChange={(v) => updateSettings(["gameSettings", "bannerEnabled"], v)} />
                    <span className="text-sm text-muted-foreground">
                      {settings.gameSettings?.bannerEnabled ? "Banner is visible in the Joy Zone lobby" : "Banner is hidden"}
                    </span>
                  </div>
                </Field>
                {settings.gameSettings?.bannerEnabled && (
                  <>
                    <Field label="Banner Heading">
                      <Input value={settings.gameSettings?.bannerHeading ?? ""} onChange={(e) => updateSettings(["gameSettings", "bannerHeading"], e.target.value)} placeholder="Why do some games require a small donation?" />
                    </Field>
                    <RichTextEditor label="Banner Body" value={settings.gameSettings?.bannerBody ?? ""} onChange={(html) => updateSettings(["gameSettings", "bannerBody"], html)} minHeight={80} placeholder="We're a registered NGO, not a game company. A small donation unlocks the game and funds real programs for families in need. Free games are always free. Your trust matters." />
                  </>
                )}
              </SectionCard>

              {/* Mobile Stat Pills */}
              <SectionCard title="📱 Mobile Stat Pills" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-1">Three small badges shown below the heading on phones. Include the emoji in the text.</p>
                <div className="grid gap-3">
                  <Field label="Pill 1"><Input value={settings.funZonePage?.pill1 ?? ""} onChange={(e) => updateSettings(["funZonePage", "pill1"], e.target.value)} placeholder="🎮 7 games live" /></Field>
                  <Field label="Pill 2"><Input value={settings.funZonePage?.pill2 ?? ""} onChange={(e) => updateSettings(["funZonePage", "pill2"], e.target.value)} placeholder="🌐 Online play" /></Field>
                  <Field label="Pill 3"><Input value={settings.funZonePage?.pill3 ?? ""} onChange={(e) => updateSettings(["funZonePage", "pill3"], e.target.value)} placeholder="❤️ 100% to charity" /></Field>
                </div>
              </SectionCard>
              </>)}

              {/* ══ CONTENT SUB-TAB ═════════════════════════════════════ */}
              {fzSubTab === "content" && (<>
              {/* Coming Soon section text */}
              <SectionCard title="⭐ Coming Soon Section" defaultOpen={false}>
                <Field label="Section Title"><Input value={settings.funZonePage?.comingSoonTitle ?? ""} onChange={(e) => updateSettings(["funZonePage", "comingSoonTitle"], e.target.value)} placeholder="Coming Soon" /></Field>
                <RichTextEditor label="Section Description" value={settings.funZonePage?.comingSoonDesc ?? ""} onChange={(html) => updateSettings(["funZonePage", "comingSoonDesc"], html)} minHeight={60} placeholder="Most-played games in India — all with online multiplayer!" />
              </SectionCard>

              {/* Coming Soon Games list */}
              <SectionCard title="🎮 Coming Soon — Game Cards" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-3">Edit or reorder the "coming soon" game entries. Leave a field blank to keep the built-in default.</p>
                {(
                  (() => {
                    const DEFAULTS = [
                      { emoji: "🎱", title: "Tambola / Housie",  why: "Perfect for kitty parties — live number calls",    tag: "Kitty Fave"  },
                      { emoji: "🪀", title: "Snakes & Ladders",  why: "Classic family game — play with 4 friends",        tag: "Family Fun"  },
                      { emoji: "♟️", title: "Chess",             why: "Strategy 1v1 — challenge a friend online",         tag: "Strategic"   },
                      { emoji: "🔢", title: "2048",              why: "Number puzzle — simple but impossible to stop",     tag: "Obsession"   },
                      { emoji: "🔤", title: "Word Scramble",     why: "Unscramble words — great for all ages",            tag: "Family"      },
                      { emoji: "🎵", title: "Antakshari",        why: "Classic Indian music game — groups love it",       tag: "Party Hit"   },
                    ];
                    const saved: Array<{ emoji?: string; title?: string; why?: string; tag?: string }> =
                      settings.funZonePage?.comingSoonGames ?? [];
                    const items = DEFAULTS.map((d, i) => ({ ...d, ...(saved[i] ?? {}) }));
                    return items.map((item, idx) => (
                      <div key={idx} className="border border-border rounded-2xl p-4 mb-3 last:mb-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Game {idx + 1}</p>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <Field label="Emoji">
                            <Input value={saved[idx]?.emoji ?? ""}
                              onChange={(e) => {
                                const next = [...Array(Math.max(saved.length, idx + 1))].map((_, i) => saved[i] ?? {});
                                next[idx] = { ...next[idx], emoji: e.target.value };
                                updateSettings(["funZonePage", "comingSoonGames"], next);
                              }}
                              placeholder={DEFAULTS[idx]?.emoji} className="font-mono" />
                          </Field>
                          <Field label="Title">
                            <Input value={saved[idx]?.title ?? ""}
                              onChange={(e) => {
                                const next = [...Array(Math.max(saved.length, idx + 1))].map((_, i) => saved[i] ?? {});
                                next[idx] = { ...next[idx], title: e.target.value };
                                updateSettings(["funZonePage", "comingSoonGames"], next);
                              }}
                              placeholder={DEFAULTS[idx]?.title} />
                          </Field>
                          <Field label="Tag Label">
                            <Input value={saved[idx]?.tag ?? ""}
                              onChange={(e) => {
                                const next = [...Array(Math.max(saved.length, idx + 1))].map((_, i) => saved[i] ?? {});
                                next[idx] = { ...next[idx], tag: e.target.value };
                                updateSettings(["funZonePage", "comingSoonGames"], next);
                              }}
                              placeholder={DEFAULTS[idx]?.tag} />
                          </Field>
                          <div className="sm:col-span-3">
                            <Field label="Description">
                              <Input value={saved[idx]?.why ?? ""}
                                onChange={(e) => {
                                  const next = [...Array(Math.max(saved.length, idx + 1))].map((_, i) => saved[i] ?? {});
                                  next[idx] = { ...next[idx], why: e.target.value };
                                  updateSettings(["funZonePage", "comingSoonGames"], next);
                                }}
                                placeholder={DEFAULTS[idx]?.why} />
                            </Field>
                          </div>
                        </div>
                      </div>
                    ));
                  })()
                )}
              </SectionCard>
              </>)}

              {/* ══ MUSIC SUB-TAB ══════════════════════════════════════ */}
              {fzSubTab === "music" && settings && (<>
              <SectionCard title="🎵 Music Playlist — Floating Player">
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Add audio tracks to your site's floating music player. Visitors can play/pause, skip, and dismiss it. The player appears on all public pages.
                </p>

                {/* Enable toggle */}
                <Field label="Enable Music Player">
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => updateSettings(["musicEnabled"], !(settings.musicEnabled))}
                      className={`relative w-10 rounded-full transition-colors focus:outline-none ${settings.musicEnabled ? "bg-primary" : "bg-muted border border-border"}`}
                      style={{ height: 22 }}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.musicEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      {settings.musicEnabled ? "Floating player shown on the site" : "Player is hidden"}
                    </span>
                  </div>
                </Field>

                {/* Current playlist */}
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Current Playlist</p>
                  {(!(settings.musicPlaylist) || settings.musicPlaylist?.length === 0) && (
                    <div className="border-2 border-dashed border-border rounded-xl py-6 text-center text-sm text-muted-foreground">
                      No tracks yet. Add one below.
                    </div>
                  )}
                  {(settings.musicPlaylist ?? []).map((track: { title: string; artist?: string; url: string }, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-border mb-2 bg-muted/20">
                      <div className="text-xl">🎵</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{track.title}</p>
                        {track.artist && <p className="text-xs text-muted-foreground truncate">{track.artist}</p>}
                        <p className="text-[10px] text-muted-foreground truncate">{track.url}</p>
                      </div>
                      <button
                        onClick={() => {
                          const list = [...(settings.musicPlaylist ?? [])];
                          list.splice(idx, 1);
                          updateSettings(["musicPlaylist"], list);
                        }}
                        className="w-7 h-7 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors flex items-center justify-center shrink-0">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new track */}
                <div className="mt-4 border border-border rounded-2xl p-4 bg-muted/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Add Track</p>
                  <div className="space-y-2">
                    <Field label="Track Title *">
                      <Input value={newMusicTrack.title} onChange={e => setNewMusicTrack(p => ({ ...p, title: e.target.value }))} placeholder="Song name" />
                    </Field>
                    <Field label="Artist (optional)">
                      <Input value={newMusicTrack.artist} onChange={e => setNewMusicTrack(p => ({ ...p, artist: e.target.value }))} placeholder="Artist name" />
                    </Field>
                    <Field label="Audio URL *" description="Direct link to an MP3, OGG, or WAV file. Must end in .mp3, .ogg, .wav, or similar.">
                      <Input value={newMusicTrack.url} onChange={e => setNewMusicTrack(p => ({ ...p, url: e.target.value }))} placeholder="https://…/song.mp3" />
                    </Field>
                    <Button
                      className="rounded-full mt-1"
                      disabled={!newMusicTrack.title.trim() || !newMusicTrack.url.trim()}
                      onClick={() => {
                        const list = [...(settings.musicPlaylist ?? []), { ...newMusicTrack }];
                        updateSettings(["musicPlaylist"], list);
                        setNewMusicTrack({ title: "", artist: "", url: "" });
                      }}>
                      + Add to Playlist
                    </Button>
                  </div>
                </div>
              </SectionCard>
              </>)}

              {/* ══ PAYMENTS SUB-TAB (Access Code) ══════════════════════ */}
              {fzSubTab === "payments" && (<>
              {/* ── VERIFICATION / ACCESS CODE ────────────────────────── */}
              <SectionCard title="🔐 Access Code — Bypass Payment" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  When Pay to Play is active, visitors can enter this secret code to unlock all games for free. Great for event attendees, volunteers, or family. Case-insensitive.
                </p>
                <Field label="Enable Access Code">
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => updateSettings(["gameSettings", "verifyEnabled"], !(settings.gameSettings?.verifyEnabled))}
                      className={`relative w-10 rounded-full transition-colors focus:outline-none ${settings.gameSettings?.verifyEnabled ? "bg-primary" : "bg-muted border border-border"}`}
                      style={{ height: 22 }}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.gameSettings?.verifyEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      {settings.gameSettings?.verifyEnabled
                        ? "Code is active — visitors can enter it on the payment screen to unlock all games for free"
                        : "Access code is disabled"}
                    </span>
                  </div>
                </Field>
                {settings.gameSettings?.verifyEnabled && (
                  <>
                    <Field label="Secret Code" description="Share only with people who should get free access. Stored in your settings — not public.">
                      <Input
                        value={settings.gameSettings?.verifyCode ?? ""}
                        onChange={e => updateSettings(["gameSettings", "verifyCode"], e.target.value.toUpperCase())}
                        placeholder="e.g. SPANDANA2025"
                        className="font-mono tracking-widest uppercase text-base"
                      />
                    </Field>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300">
                      <strong>How it works:</strong> On the payment screen, visitors see "🔐 Have an access code?" → they enter this code → all games unlock instantly with no payment required.
                    </div>
                  </>
                )}
              </SectionCard>
              </>)}

              {/* ══ HERO SUB-TAB (Flash Notes + CTA) ═══════════════════ */}
              {fzSubTab === "hero" && (<>
              {/* ── FLASH NOTES ───────────────────────────────────────── */}
              <SectionCard title="⚡ Flash Notes — Lobby Pop-ups" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Animated messages that cycle at the top of the game lobby. Use them for announcements, encouragements, fun facts, or seasonal greetings. They rotate every ~7 seconds.
                </p>
                {(() => {
                  const notes: Array<{ text: string; emoji: string; enabled?: boolean }> =
                    (settings.gameSettings?.flashNotes ?? []) as Array<{ text: string; emoji: string; enabled?: boolean }>;
                  const setNotes = (arr: typeof notes) => updateSettings(["gameSettings", "flashNotes"], arr);
                  return (
                    <div className="space-y-2">
                      {notes.length === 0 && (
                        <div className="border border-dashed border-border rounded-xl p-5 text-center text-sm text-muted-foreground">
                          No flash notes yet. Add one below — they appear as animated toasts in the lobby.
                        </div>
                      )}
                      {notes.map((n, i) => (
                        <div key={i} className={`flex items-center gap-2 p-2.5 border border-border rounded-xl transition-all ${n.enabled === false ? "opacity-50" : ""}`}>
                          <Input
                            value={n.emoji}
                            onChange={e => { const a = [...notes]; a[i] = { ...a[i], emoji: e.target.value }; setNotes(a); }}
                            className="w-16 font-mono text-center text-lg"
                            placeholder="🎮"
                          />
                          <Input
                            value={n.text}
                            onChange={e => { const a = [...notes]; a[i] = { ...a[i], text: e.target.value }; setNotes(a); }}
                            placeholder="Flash message text…"
                            className="flex-1"
                          />
                          <label className="flex flex-col items-center gap-0.5 cursor-pointer select-none shrink-0">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground">On</span>
                            <Switch checked={n.enabled !== false} onCheckedChange={v => { const a = [...notes]; a[i] = { ...a[i], enabled: v }; setNotes(a); }} />
                          </label>
                          <button
                            onClick={() => setNotes(notes.filter((_, j) => j !== i))}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <Button
                        size="sm" variant="outline" className="rounded-full gap-2 w-full mt-1"
                        onClick={() => setNotes([...notes, { emoji: "🎮", text: "", enabled: true }])}>
                        <Plus size={13} /> Add Flash Note
                      </Button>
                      <p className="text-[10px] text-muted-foreground text-center">Notes rotate every 7 seconds while a visitor is in the game lobby. Only enabled notes are shown.</p>
                    </div>
                  );
                })()}
              </SectionCard>

              {/* ── BUTTONS & CTA TEXT ────────────────────────────────── */}
              <SectionCard title="✏️ Buttons & All Text — Full Editability" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Edit every label, button, and message across the Joy Zone page. Leave blank to use the default.
                </p>
                <div className="grid gap-3">
                  <Field label='"This ad supports…" message (shown under sponsor ads)'>
                    <Input
                      value={settings.gameSettings?.ctaText?.adSupportMsg ?? ""}
                      onChange={e => updateSettings(["gameSettings", "ctaText", "adSupportMsg"], e.target.value)}
                      placeholder="This ad supports free games on Spandana"
                    />
                  </Field>
                  <Field label='"Enjoying the game?" heading (in-game widget)'>
                    <Input
                      value={settings.funZonePage?.enjoyingText ?? ""}
                      onChange={e => updateSettings(["funZonePage", "enjoyingText"], e.target.value)}
                      placeholder="Enjoying the game?"
                    />
                  </Field>
                  <Field label='"Enjoying" subtext'>
                    <Input
                      value={settings.funZonePage?.enjoyingSubtext ?? ""}
                      onChange={e => updateSettings(["funZonePage", "enjoyingSubtext"], e.target.value)}
                      placeholder="Your contribution funds real community programs."
                    />
                  </Field>
                  <Field label='"Donate" button label (in-game widget)'>
                    <Input
                      value={settings.gameSettings?.ctaText?.donateBtn ?? ""}
                      onChange={e => updateSettings(["gameSettings", "ctaText", "donateBtn"], e.target.value)}
                      placeholder="Donate ❤️"
                    />
                  </Field>
                  <Field label='"Play Now" section heading'>
                    <Input
                      value={settings.funZonePage?.lobbyHeading ?? ""}
                      onChange={e => updateSettings(["funZonePage", "lobbyHeading"], e.target.value)}
                      placeholder="Play Now"
                    />
                  </Field>
                  <Field label='"More Activities" section heading'>
                    <Input
                      value={settings.funZonePage?.moreActivitiesHeading ?? ""}
                      onChange={e => updateSettings(["funZonePage", "moreActivitiesHeading"], e.target.value)}
                      placeholder="More Activities"
                    />
                  </Field>
                  <Field label='"Coming Soon" section heading'>
                    <Input
                      value={settings.funZonePage?.comingSoonHeading ?? ""}
                      onChange={e => updateSettings(["funZonePage", "comingSoonHeading"], e.target.value)}
                      placeholder="Coming Soon 🔜"
                    />
                  </Field>
                </div>
              </SectionCard>
              </>)}

              {/* ══ GAMES SUB-TAB (Add More) ════════════════════════════ */}
              {fzSubTab === "games" && (<>
              {/* Add More Games */}
              <SectionCard title="➕ Add More Games to Joy Zone" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Beyond the 8 built-in games, you can publish additional games (external links, NEENAS games, third-party embeds) that appear as cards in the Joy Zone lobby.
                </p>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Gamepad2 size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Game Listings</p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-3">Add a title, description, cover image, URL, and price. Published listings appear live in the Joy Zone under "More Games".</p>
                    <Button size="sm" className="rounded-full gap-2" onClick={() => window.__spandanaSetTab?.("game-listings")}>
                      <Plus size={13} /> Manage Game Listings
                    </Button>
                  </div>
                </div>
              </SectionCard>

              </>)}

              {/* ══ HERO SUB-TAB (Enjoying Widget) ══════════════════════ */}
              {fzSubTab === "hero" && (<>
              {/* Enjoying the game widget */}
              <SectionCard title="❤️ 'Enjoying the Game?' Widget" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-2 mb-1">Shown below a game while playing, with a Donate button.</p>
                <Field label="Heading"><Input value={settings.funZonePage?.enjoyingText ?? ""} onChange={(e) => updateSettings(["funZonePage", "enjoyingText"], e.target.value)} placeholder="Enjoying the game?" /></Field>
                <RichTextEditor label="Subtext" value={settings.funZonePage?.enjoyingSubtext ?? ""} onChange={(html) => updateSettings(["funZonePage", "enjoyingSubtext"], html)} minHeight={60} placeholder="Your contribution funds real community programs." />
              </SectionCard>

              </>)}

              {/* ══ ADS SUB-TAB ═════════════════════════════════════════ */}
              {fzSubTab === "ads" && (<>
              {/* ── HOW GEO ADS WORK ──────────────────────────────────── */}
              <SectionCard title="🌍 Geo-Targeted Ads — How It Works" defaultOpen={false}>
                <div className="space-y-3 text-sm">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-200">
                    <p className="font-bold text-orange-800 mb-1">🇮🇳 Indian Visitors</p>
                    <p className="text-orange-700 text-xs">Detected by IP address. Shown ads from the <strong>India Ads pool</strong>. Currency auto-switches to ₹ INR. Falls back to General Ads if India pool is empty.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                    <p className="font-bold text-blue-800 mb-1">🌐 International Visitors</p>
                    <p className="text-blue-700 text-xs">All non-India IPs. Shown ads from the <strong>International Ads pool</strong>. Currency auto-switches to their local currency (USD, GBP, AED, EUR, SGD, etc.). Falls back to General Ads if International pool is empty.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/60 border border-border">
                    <p className="font-bold text-foreground mb-1">🔁 Fallback Priority</p>
                    <p className="text-muted-foreground text-xs">India visitor → India pool → General pool → Built-in default cards<br />International visitor → International pool → General pool → Built-in default cards</p>
                  </div>
                </div>
              </SectionCard>

              {/* ── INDIA ADS ─────────────────────────────────────────── */}
              <SectionCard title="🇮🇳 Sponsor Ads — India (shown to Indian visitors)" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-4">
                  These ads are shown <strong>only to visitors from India</strong> (detected by IP). Perfect for local Indian brands, schools, shops, and services that want to reach an Indian audience.
                </p>
                {(() => {
                  const ads: AdItem[] = settings.gameSettings?.adsIndia ?? [];
                  const setAds = (arr: AdItem[]) => updateSettings(["gameSettings", "adsIndia"], arr);
                  const updAd = (i: number, key: string, val: unknown) => { const a = JSON.parse(JSON.stringify(ads)) as AdItem[]; a[i] = { ...a[i]!, [key]: val } as AdItem; setAds(a); };
                  const addAd = () => setAds([...ads, { id: `adin-${Date.now()}`, sponsor: "", headline: "India Sponsor Message", body: "", ctaLabel: "Learn More", ctaUrl: "", skipTimer: 5, enabled: true }]);
                  const removeAd = (i: number) => setAds(ads.filter((_, j) => j !== i));
                  return (
                    <div className="space-y-3">
                      {ads.length === 0 && <div className="border border-dashed border-orange-300 rounded-xl p-5 text-center text-sm text-muted-foreground bg-orange-50/40">No India ads yet. Add one below — Indian visitors will see the General Ads pool until India ads are configured.</div>}
                      {ads.map((ad, i) => (
                        <div key={ad.id ?? i} className="border border-orange-200 rounded-2xl p-4 space-y-3 bg-orange-50/30">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${ad.enabled ? "bg-emerald-400" : "bg-gray-300"}`} />
                            <span className="font-semibold text-sm flex-1 truncate">{ad.sponsor || ad.headline || `India Ad ${i + 1}`}</span>
                            <button onClick={() => updAd(i, "enabled", !ad.enabled)} className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${ad.enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{ad.enabled ? "Active" : "Paused"}</button>
                            <button onClick={() => removeAd(i)} className="text-muted-foreground/50 hover:text-destructive transition-colors ml-1"><X size={14} /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Sponsor Name"><Input value={ad.sponsor} onChange={e => updAd(i, "sponsor", e.target.value)} placeholder="Sunshine Academy" /></Field>
                            <Field label="Headline"><Input value={ad.headline} onChange={e => updAd(i, "headline", e.target.value)} placeholder="Quality Education in Hyderabad" /></Field>
                          </div>
                          <Field label="Body Text"><Input value={ad.body} onChange={e => updAd(i, "body", e.target.value)} placeholder="Admissions open 2025 · Classes 1–10" /></Field>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="CTA Label"><Input value={ad.ctaLabel} onChange={e => updAd(i, "ctaLabel", e.target.value)} placeholder="Learn More" /></Field>
                            <Field label="CTA URL"><Input value={ad.ctaUrl} onChange={e => updAd(i, "ctaUrl", e.target.value)} placeholder="https://..." /></Field>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Image / Logo URL (optional)"><Input value={ad.imageUrl ?? ""} onChange={e => updAd(i, "imageUrl", e.target.value)} placeholder="https://..." /></Field>
                            <Field label="Skip Timer (seconds)"><Input type="number" min="0" max="60" value={ad.skipTimer ?? 5} onChange={e => updAd(i, "skipTimer", Number(e.target.value))} /></Field>
                          </div>
                          <Field label="Video URL (optional — shown in long ad slot)" description="Direct link to .mp4 video. Plays muted, auto-play during the 20s countdown.">
                            <Input value={ad.videoUrl ?? ""} onChange={e => updAd(i, "videoUrl", e.target.value)} placeholder="https://example.com/ad.mp4" />
                          </Field>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" className="rounded-full gap-2 w-full border-orange-300 text-orange-700 hover:bg-orange-50" onClick={addAd}><Plus size={13} /> Add India Sponsor Ad</Button>
                    </div>
                  );
                })()}
              </SectionCard>

              {/* ── INTERNATIONAL ADS ─────────────────────────────────── */}
              <SectionCard title="🌐 Sponsor Ads — International (shown to non-India visitors)" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-4">
                  These ads are shown <strong>only to visitors outside India</strong> — UAE, USA, UK, Singapore, etc. Ideal for diaspora-focused sponsors or global brands. Currency auto-detects (USD, GBP, AED, EUR, SGD…).
                </p>
                {(() => {
                  const ads: AdItem[] = settings.gameSettings?.adsIntl ?? [];
                  const setAds = (arr: AdItem[]) => updateSettings(["gameSettings", "adsIntl"], arr);
                  const updAd = (i: number, key: string, val: unknown) => { const a = JSON.parse(JSON.stringify(ads)) as AdItem[]; a[i] = { ...a[i]!, [key]: val } as AdItem; setAds(a); };
                  const addAd = () => setAds([...ads, { id: `adintl-${Date.now()}`, sponsor: "", headline: "International Sponsor Message", body: "", ctaLabel: "Learn More", ctaUrl: "", skipTimer: 5, enabled: true }]);
                  const removeAd = (i: number) => setAds(ads.filter((_, j) => j !== i));
                  return (
                    <div className="space-y-3">
                      {ads.length === 0 && <div className="border border-dashed border-blue-300 rounded-xl p-5 text-center text-sm text-muted-foreground bg-blue-50/40">No international ads yet. Add one below — international visitors will see the General Ads pool until this is configured.</div>}
                      {ads.map((ad, i) => (
                        <div key={ad.id ?? i} className="border border-blue-200 rounded-2xl p-4 space-y-3 bg-blue-50/30">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${ad.enabled ? "bg-emerald-400" : "bg-gray-300"}`} />
                            <span className="font-semibold text-sm flex-1 truncate">{ad.sponsor || ad.headline || `Intl Ad ${i + 1}`}</span>
                            <button onClick={() => updAd(i, "enabled", !ad.enabled)} className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${ad.enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{ad.enabled ? "Active" : "Paused"}</button>
                            <button onClick={() => removeAd(i)} className="text-muted-foreground/50 hover:text-destructive transition-colors ml-1"><X size={14} /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Sponsor Name"><Input value={ad.sponsor} onChange={e => updAd(i, "sponsor", e.target.value)} placeholder="Gulf Remit Services" /></Field>
                            <Field label="Headline"><Input value={ad.headline} onChange={e => updAd(i, "headline", e.target.value)} placeholder="Send money home — lowest fees" /></Field>
                          </div>
                          <Field label="Body Text"><Input value={ad.body} onChange={e => updAd(i, "body", e.target.value)} placeholder="Instant transfers to India from UAE, UK, USA" /></Field>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="CTA Label"><Input value={ad.ctaLabel} onChange={e => updAd(i, "ctaLabel", e.target.value)} placeholder="Send Now" /></Field>
                            <Field label="CTA URL"><Input value={ad.ctaUrl} onChange={e => updAd(i, "ctaUrl", e.target.value)} placeholder="https://..." /></Field>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Image / Logo URL (optional)"><Input value={ad.imageUrl ?? ""} onChange={e => updAd(i, "imageUrl", e.target.value)} placeholder="https://..." /></Field>
                            <Field label="Skip Timer (seconds)"><Input type="number" min="0" max="60" value={ad.skipTimer ?? 5} onChange={e => updAd(i, "skipTimer", Number(e.target.value))} /></Field>
                          </div>
                          <Field label="Video URL (optional — shown in long ad slot)" description="Direct link to .mp4 video. Plays muted, auto-play during the 20s countdown.">
                            <Input value={ad.videoUrl ?? ""} onChange={e => updAd(i, "videoUrl", e.target.value)} placeholder="https://example.com/ad.mp4" />
                          </Field>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" className="rounded-full gap-2 w-full border-blue-300 text-blue-700 hover:bg-blue-50" onClick={addAd}><Plus size={13} /> Add International Sponsor Ad</Button>
                    </div>
                  );
                })()}
              </SectionCard>

              {/* ── GENERAL / FALLBACK ADS ────────────────────────────── */}
              <SectionCard title="🎯 General Ads — Fallback (shown when no geo-specific ads exist)" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-4">
                  These ads are the fallback — shown when the visitor's geo pool (India or International) is empty. Also used if geo-detection fails. Defaults to Spandana self-promo cards when this pool is also empty.
                </p>
                {(() => {
                  const ads: AdItem[] = settings.gameSettings?.ads ?? [];
                  const setAds = (arr: AdItem[]) => updateSettings(["gameSettings", "ads"], arr);
                  const updAd = (i: number, key: string, val: unknown) => {
                    const arr = JSON.parse(JSON.stringify(ads)) as AdItem[];
                    arr[i] = { ...arr[i]!, [key]: val } as AdItem;
                    setAds(arr);
                  };
                  const addAd = () => setAds([...ads, {
                    id: `ad-${Date.now()}`, sponsor: "", headline: "Sponsor Message",
                    body: "", ctaLabel: "Learn More", ctaUrl: "", skipTimer: 5, enabled: true,
                  }]);
                  const removeAd = (i: number) => setAds(ads.filter((_, idx) => idx !== i));
                  return (
                    <div className="space-y-3">
                      {ads.length === 0 && (
                        <div className="border border-dashed border-border rounded-xl p-5 text-center text-sm text-muted-foreground">
                          No general ads yet. Add one below — this is the fallback shown when geo-specific pools are empty.
                        </div>
                      )}
                      {ads.map((ad, i) => (
                        <div key={ad.id ?? i} className="border border-border rounded-2xl p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${ad.enabled ? "bg-emerald-400" : "bg-gray-300"}`} />
                            <span className="font-semibold text-sm text-foreground flex-1 truncate">{ad.sponsor || ad.headline || `Ad ${i + 1}`}</span>
                            <button onClick={() => updAd(i, "enabled", !ad.enabled)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${ad.enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                              {ad.enabled ? "Active" : "Paused"}
                            </button>
                            <button onClick={() => removeAd(i)} className="text-muted-foreground/50 hover:text-destructive transition-colors ml-1">
                              <X size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Sponsor Name">
                              <Input value={ad.sponsor} onChange={e => updAd(i, "sponsor", e.target.value)} placeholder="Sunshine Academy" />
                            </Field>
                            <Field label="Headline">
                              <Input value={ad.headline} onChange={e => updAd(i, "headline", e.target.value)} placeholder="Quality Education in Hyderabad" />
                            </Field>
                          </div>
                          <Field label="Body Text">
                            <Input value={ad.body} onChange={e => updAd(i, "body", e.target.value)} placeholder="Admissions open 2025 · Classes 1–10" />
                          </Field>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="CTA Label">
                              <Input value={ad.ctaLabel} onChange={e => updAd(i, "ctaLabel", e.target.value)} placeholder="Learn More" />
                            </Field>
                            <Field label="CTA URL">
                              <Input value={ad.ctaUrl} onChange={e => updAd(i, "ctaUrl", e.target.value)} placeholder="https://..." />
                            </Field>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Image / Logo URL (optional)">
                              <Input value={ad.imageUrl ?? ""} onChange={e => updAd(i, "imageUrl", e.target.value)} placeholder="https://..." />
                            </Field>
                            <Field label="Skip Timer (seconds)">
                              <Input type="number" min="0" max="60" value={ad.skipTimer ?? 5} onChange={e => updAd(i, "skipTimer", Number(e.target.value))} />
                            </Field>
                          </div>
                          <Field label="Video URL (optional — long ad)" description="Direct .mp4 link. Auto-plays muted during the 20s countdown in long ad slots.">
                            <Input value={ad.videoUrl ?? ""} onChange={e => updAd(i, "videoUrl", e.target.value)} placeholder="https://example.com/ad.mp4" />
                          </Field>
                          <Field label="Show To" description="Target by visitor region — useful for language or currency-specific ads">
                            <select value={ad.target ?? "all"}
                              onChange={e => updAd(i, "target", e.target.value)}
                              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm">
                              <option value="all">🌍 All Visitors</option>
                              <option value="india">🇮🇳 India Only</option>
                              <option value="intl">🌐 International Only</option>
                            </select>
                          </Field>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" className="rounded-full gap-2 w-full" onClick={addAd}>
                        <Plus size={13} /> Add General Fallback Ad
                      </Button>
                    </div>
                  );
                })()}
              </SectionCard>

              <SectionCard title="⚙️ Ad Gate Settings" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-4">
                  Controls how often and what type of ad plays before each game. The pattern repeats — e.g. Short–Short–Long means every 3rd play gets a 20-second ad.
                </p>
                <Field label="Ad Gate Enabled">
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => updateSettings(["gameSettings", "adEnabled"], !(settings.gameSettings?.adEnabled ?? true))}
                      className={`relative w-10 h-5.5 rounded-full transition-colors focus:outline-none ${settings.gameSettings?.adEnabled !== false ? "bg-primary" : "bg-muted border border-border"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.gameSettings?.adEnabled !== false ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {settings.gameSettings?.adEnabled !== false ? "Ads play before every game" : "Ads disabled — games load directly"}
                    </span>
                  </div>
                </Field>
                <Field label="Ad Pattern (repeating)">
                  <select
                    value={JSON.stringify(settings.gameSettings?.adPattern ?? ["short", "short", "long"])}
                    onChange={e => updateSettings(["gameSettings", "adPattern"], JSON.parse(e.target.value))}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value={JSON.stringify(["short", "short", "long"])}>Short · Short · Long (default — every 3rd is 20s)</option>
                    <option value={JSON.stringify(["short"])}>All Short (every game = 5s ad)</option>
                    <option value={JSON.stringify(["long"])}>All Long (every game = 20s ad)</option>
                    <option value={JSON.stringify(["short", "long"])}>Alternating (Short · Long · Short · Long…)</option>
                    <option value={JSON.stringify(["short", "short", "short", "long"])}>3 Short + 1 Long (4-game cycle)</option>
                  </select>
                </Field>
              </SectionCard>
              </>)}

              <div className="flex justify-end mt-2">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save All Changes</>}
                </Button>
              </div>
            </div>
  );
}
