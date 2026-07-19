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
import { SectionCard, Field, Label, DeviceTabs, VisibilityToggleRow } from "./shared";
import type { SiteSettings } from "./types";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface Props {
  settings: SiteSettings;
  updateSettings: (path: (string | number)[], val: unknown) => void;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  token: string;
  saving: boolean;
  onSave: () => void;
  showFeedback: (type: "success" | "error", msg: string) => void;
}

export default function DonateTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Donate Page</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage the <a href="/donate" target="_blank" className="underline text-primary">/donate</a> page content and payment details</p>
                </div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Changes</>}</Button>
              </div>
              <SectionCard title="Page Header">
                <DeviceTabs>
                  {(view) => view === "desktop" ? (
                    <div className="grid gap-4">
                      <Field label="Page Heading"><Input value={settings.donatePage?.heading ?? ""} onChange={(e) => updateSettings(["donatePage", "heading"], e.target.value)} placeholder="Give with Joy" /></Field>
                      <RichTextEditor label="Subheading" value={settings.donatePage?.subheading ?? ""} onChange={(html) => updateSettings(["donatePage", "subheading"], html)} minHeight={70} placeholder="Your support reaches those who need it most." />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <p className="text-xs text-muted-foreground -mt-2">Leave blank to use the desktop version.</p>
                      <Field label="Heading (Mobile)"><Input value={settings.donatePage?.headingMobile ?? ""} onChange={(e) => updateSettings(["donatePage", "headingMobile"], e.target.value)} placeholder="Same as desktop if empty" /></Field>
                      <RichTextEditor label="Subheading (Mobile)" value={settings.donatePage?.subheadingMobile ?? ""} onChange={(html) => updateSettings(["donatePage", "subheadingMobile"], html)} minHeight={60} placeholder="Same as desktop if empty" />
                    </div>
                  )}
                </DeviceTabs>
                <RichTextEditor label="Tax / 80G Note" value={settings.donatePage?.taxNote ?? ""} onChange={(html) => updateSettings(["donatePage", "taxNote"], html)} minHeight={60} placeholder="Donations are eligible for 80G income tax deduction. Receipt issued on request." />
              </SectionCard>
              <SectionCard title="UPI Payment">
                <Field label="UPI ID"><Input value={settings.upiId ?? ""} onChange={(e) => updateSettings(["upiId"], e.target.value)} placeholder="spandana@upi" /></Field>
                <Field label="UPI Account Name"><Input value={settings.upiName ?? ""} onChange={(e) => updateSettings(["upiName"], e.target.value)} placeholder="Spandana Care Aid Foundation" /></Field>
                <Field label="UPI QR Code Image">
                  <div className="flex flex-col gap-2">
                    {settings.upiQrUrl && (
                      <div className="flex items-center gap-3 p-2 bg-muted/40 rounded-xl border border-border">
                        <img src={settings.upiQrUrl} alt="QR Code" className="w-16 h-16 object-contain rounded-lg border border-border bg-white" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">QR Code uploaded</p>
                          <p className="text-[10px] text-muted-foreground truncate">{settings.upiQrUrl}</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10 text-xs" onClick={() => updateSettings(["upiQrUrl"], "")}>Remove</Button>
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const form = new FormData();
                        form.append("file", file);
                        try {
                          const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
                          const data = await res.json() as { url?: string; error?: string };
                          if (data.url) { updateSettings(["upiQrUrl"], data.url); showFeedback("success", "QR code uploaded!"); }
                          else showFeedback("error", data.error ?? "Upload failed");
                        } catch { showFeedback("error", "Upload failed"); }
                      }} />
                      <span className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/40 rounded-xl py-3 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/20">
                        <Upload size={15} /> {settings.upiQrUrl ? "Replace QR Code" : "Upload QR Code Image"}
                      </span>
                    </label>
                  </div>
                </Field>
                <div className="mt-4 pt-4 border-t border-border/60">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">UPI App Buttons (Mobile)</p>
                  <p className="text-[11px] text-muted-foreground mb-3 -mt-1">Choose which UPI apps appear as quick-tap buttons on mobile. All are shown by default.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: "phonepe", label: "PhonePe",  emoji: "🟣" },
                      { key: "tez",     label: "GPay",     emoji: "🔵" },
                      { key: "paytm",   label: "Paytm",    emoji: "🩵" },
                      { key: "upi",     label: "BHIM/UPI", emoji: "🟢" },
                    ] as const).map(({ key, label, emoji }) => (
                      <div key={key} className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2 border border-border/60">
                        <span className="text-sm text-foreground">{emoji} {label}</span>
                        <Switch
                          checked={settings.donatePage?.upiApps?.[key] !== false}
                          onCheckedChange={v => updateSettings(["donatePage", "upiApps", key], v)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-2 gap-3">
                  <Field label="🇮🇳 Indian Tab Label">
                    <Input
                      value={settings.donatePage?.indianTabLabel ?? ""}
                      onChange={(e) => updateSettings(["donatePage", "indianTabLabel"], e.target.value)}
                      placeholder="🇮🇳 Indian Donor"
                    />
                  </Field>
                  <Field label="🌍 International Tab Label">
                    <Input
                      value={settings.donatePage?.intlTabLabel ?? ""}
                      onChange={(e) => updateSettings(["donatePage", "intlTabLabel"], e.target.value)}
                      placeholder="🌍 International / NRI"
                    />
                  </Field>
                </div>
                <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Geo Auto-Switch Tab</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Auto-select the International tab for visitors outside India</p>
                  </div>
                  <Switch
                    checked={settings.donatePage?.geoAutoSwitch !== false}
                    onCheckedChange={v => updateSettings(["donatePage", "geoAutoSwitch"], v)}
                  />
                </div>
              </SectionCard>
              <SectionCard title="Bank Transfer" defaultOpen={false}>
                <Field label="Account Name"><Input value={settings.bankAccountName ?? ""} onChange={(e) => updateSettings(["bankAccountName"], e.target.value)} placeholder="Spandana Care Aid Foundation" /></Field>
                <Field label="Account Number"><Input value={settings.bankAccountNumber ?? ""} onChange={(e) => updateSettings(["bankAccountNumber"], e.target.value)} placeholder="XXXXXXXXXXXXXXXXXX" /></Field>
                <Field label="IFSC Code"><Input value={settings.bankIfsc ?? ""} onChange={(e) => updateSettings(["bankIfsc"], e.target.value)} placeholder="SBIN0001234" /></Field>
                <Field label="Bank Name"><Input value={settings.bankName ?? ""} onChange={(e) => updateSettings(["bankName"], e.target.value)} placeholder="State Bank of India" /></Field>
                <Field label="Branch"><Input value={settings.bankBranch ?? ""} onChange={(e) => updateSettings(["bankBranch"], e.target.value)} placeholder="Hyderabad Main Branch" /></Field>
              </SectionCard>
              <SectionCard title="Online Payment Links" defaultOpen={false}>
                <p className="text-[11px] text-muted-foreground -mt-1 mb-3">Toggle each method on to show it on the donate page. Save the link even if the toggle is off — it won't appear until you enable it.</p>
                {[
                  { key: "Razorpay",  showKey: "showRazorpay",  linkKey: "razorpayLink",  ph: "https://razorpay.me/...",                    desc: "🇮🇳 Indian cards · Net banking · UPI · Wallets · International" },
                  { key: "Cashfree",  showKey: "showCashfree",  linkKey: "cashfreeLink",  ph: "https://payments.cashfree.com/forms/...",    desc: "🇮🇳 Indian & international · Cards · UPI · Net banking" },
                  { key: "PayPal",    showKey: "showPaypal",    linkKey: "paypalLink",    ph: "https://paypal.me/...",                       desc: "🌍 International & NRI donors" },
                  { key: "Stripe",    showKey: "showStripe",    linkKey: "stripeLink",    ph: "https://buy.stripe.com/...",                  desc: "🌍 International donors · USD / EUR / GBP" },
                ].map(({ key, showKey, linkKey, ph, desc }) => (
                  <div key={key} className="mb-3 rounded-xl border border-border bg-muted/20 overflow-hidden">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <Switch checked={(settings as Record<string, unknown>)[showKey] === true} onCheckedChange={(v) => updateSettings([showKey], v)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none">{key}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{desc}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${(settings as Record<string, unknown>)[showKey] ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                        {(settings as Record<string, unknown>)[showKey] ? "ON" : "OFF"}
                      </span>
                    </div>
                    <div className="px-3 pb-3 border-t border-border/50">
                      <Input className="mt-2 text-xs" value={(settings as Record<string, unknown>)[linkKey] as string | undefined ?? ""} onChange={(e) => updateSettings([linkKey], e.target.value)} placeholder={ph} />
                    </div>
                  </div>
                ))}
              </SectionCard>

              <SectionCard title="💳 Programs & Pricing" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-4">
                  Five giving programs shown on the donate page. Each program has 3 INR tiers (Indian donors) and 3 USD tiers (international / NRI donors). USD amounts auto-convert to AUD, GBP, AED etc. using live rates.
                </p>
                {(() => {
                  const DEFAULT_P = [
                    { icon: "🌱", name: "Plant a Tree",        desc: "Native tree planted in your name",               inr: [50,  100,  250],  usd: [1,  3,  5]  },
                    { icon: "📚", name: "Sponsor a Child",      desc: "Books, uniform & tuition for one month",         inr: [500, 1000, 2000], usd: [6,  12, 25] },
                    { icon: "🏥", name: "Medical Consultation", desc: "Free checkup & medicines for one patient",       inr: [500, 1000, 2500], usd: [6,  15, 30] },
                    { icon: "🍱", name: "Feed a Family",        desc: "Nutritious meals for a week",                    inr: [200, 500,  1000], usd: [3,  6,  12] },
                    { icon: "💧", name: "Clean Water Access",   desc: "Water purification support for a household",     inr: [1000,2500, 5000], usd: [12, 30, 60] },
                  ];
                  const progs: Array<{ icon: string; name: string; desc: string; inr: number[]; usd: number[] }> =
                    (settings.donatePage?.programs ?? DEFAULT_P) as Array<{ icon: string; name: string; desc: string; inr: number[]; usd: number[] }>;
                  const setProgs = (arr: typeof progs) => updateSettings(["donatePage", "programs"], arr);
                  const upd = (pi: number, key: string, val: string) => {
                    const arr = JSON.parse(JSON.stringify(progs));
                    arr[pi] = { ...arr[pi], [key]: val };
                    setProgs(arr);
                  };
                  const updTier = (pi: number, type: "inr" | "usd", ti: number, val: number) => {
                    const arr = JSON.parse(JSON.stringify(progs));
                    const tiers = [...(arr[pi][type] ?? [0, 0, 0])];
                    tiers[ti] = val;
                    arr[pi] = { ...arr[pi], [type]: tiers };
                    setProgs(arr);
                  };
                  return (
                    <div className="space-y-4">
                      {progs.map((p, pi) => (
                        <div key={pi} className="border border-border rounded-2xl p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{p.icon}</span>
                            <span className="font-semibold text-sm text-foreground">{p.name}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">Program {pi + 1}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Icon (emoji)">
                              <Input value={p.icon} onChange={e => upd(pi, "icon", e.target.value)} placeholder="🌱" className="font-mono" />
                            </Field>
                            <Field label="Program Name">
                              <Input value={p.name} onChange={e => upd(pi, "name", e.target.value)} placeholder="Plant a Tree" />
                            </Field>
                          </div>
                          <Field label="Short Description">
                            <Input value={p.desc ?? ""} onChange={e => upd(pi, "desc", e.target.value)} placeholder="Native tree planted in your name" />
                          </Field>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">🇮🇳 INR Tiers (Indian Donors)</p>
                            <div className="grid grid-cols-3 gap-2">
                              {(["Low (₹)", "Mid (₹)", "High (₹)"] as const).map((lbl, ti) => (
                                <Field key={ti} label={lbl}>
                                  <Input type="number" min="0" value={(p.inr ?? [0, 0, 0])[ti] ?? 0}
                                    onChange={e => updTier(pi, "inr", ti, Number(e.target.value))} />
                                </Field>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">🌍 USD Tiers (International / NRI)</p>
                            <div className="grid grid-cols-3 gap-2">
                              {(["Low ($)", "Mid ($)", "High ($)"] as const).map((lbl, ti) => (
                                <Field key={ti} label={lbl}>
                                  <Input type="number" min="0" value={(p.usd ?? [0, 0, 0])[ti] ?? 0}
                                    onChange={e => updTier(pi, "usd", ti, Number(e.target.value))} />
                                </Field>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </SectionCard>

              <SectionCard title="🌍 International FCRA Notice" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-3">
                  Shown as an info box on the International / NRI donor tab of the donate page.
                </p>
                <div className="flex items-center justify-between mb-4 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Show FCRA Registered badge</p>
                    <p className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">Green "FCRA Registered ✓" pill shown at top of international tab</p>
                  </div>
                  <Switch
                    checked={settings.donatePage?.fcraEnabled !== false}
                    onCheckedChange={v => updateSettings(["donatePage", "fcraEnabled"], v)}
                  />
                </div>
                <RichTextEditor
                  label="FCRA Notice Text"
                  value={settings.donatePage?.intlNote ?? ""}
                  onChange={html => updateSettings(["donatePage", "intlNote"], html)}
                  minHeight={70}
                  placeholder="Spandana Care Aid Foundation is FCRA-registered. All international donations comply with FCRA regulations. A receipt is issued for all contributions."
                />
              </SectionCard>

              <div className="flex justify-end mt-6">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Draft</>}</Button>
              </div>
            </div>
  );
}

