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

export default function SiteInfoTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-2xl font-serif font-bold">Values & Site Info</h2><p className="text-sm text-muted-foreground mt-1">Core values, volunteer section, contact details, footer</p></div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
              </div>
              {/* ── GLOBAL SETTINGS: SEO, Contact, Social, Branding ── */}
              <SectionCard title="SEO & Search Metadata">
                <Field label="Browser Tab Title">
                  <Input value={settings.seo?.title ?? ""} onChange={(e) => updateSettings(["seo", "title"], e.target.value)} placeholder="Spandana Care Aid Foundation | Building Communities" />
                </Field>
                <Field label="Meta Description">
                  <Textarea value={settings.seo?.description ?? ""} onChange={(e) => updateSettings(["seo", "description"], e.target.value)} className="min-h-[80px] resize-none" placeholder="Spandana Care Aid Foundation uplifts underserved families through health, dignity, and economic independence..." />
                  <p className="text-[11px] text-muted-foreground mt-1">Shown in Google search results. Keep under 160 characters.</p>
                </Field>
                <Field label="Keywords (comma-separated)">
                  <Input value={settings.seo?.keywords ?? ""} onChange={(e) => updateSettings(["seo", "keywords"], e.target.value)} placeholder="NGO, nonprofit, Hyderabad, community health, social welfare" />
                </Field>
                <Field label="Social Share Image (shown when site is shared on WhatsApp / Facebook)">
                  {settings.seo?.ogImage && (
                    <div className="flex items-center gap-3 p-2 bg-muted/40 rounded-xl border border-border mb-2">
                      <img src={settings.seo.ogImage} alt="OG" className="w-20 h-12 object-cover rounded-lg border border-border" />
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium">Image uploaded</p><p className="text-[10px] text-muted-foreground">Recommended 1200×630 px</p></div>
                      <Button type="button" variant="outline" size="sm" className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10 text-xs" onClick={() => updateSettings(["seo", "ogImage"], "")}>Remove</Button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const form = new FormData(); form.append("file", file);
                        try {
                          const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
                          const data = await res.json() as { url?: string; error?: string };
                          if (data.url) { updateSettings(["seo", "ogImage"], data.url); showFeedback("success", "Share image uploaded!"); }
                          else showFeedback("error", data.error ?? "Upload failed");
                        } catch { showFeedback("error", "Upload failed"); }
                      }} />
                    <span className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 rounded-xl py-3 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/20">
                      <Upload size={15} /> {settings.seo?.ogImage ? "Replace Share Image" : "Upload Share Image (1200×630 px recommended)"}
                    </span>
                  </label>
                </Field>
              </SectionCard>

              <SectionCard title="Global Contact Information">
                <Field label="Organisation Email Address">
                  <Input type="email" value={settings.contact?.email ?? ""} onChange={(e) => updateSettings(["contact", "email"], e.target.value)} placeholder="spandanacareaidfoundation@gmail.com" />
                </Field>
                <Field label="Phone / WhatsApp Number">
                  <Input value={settings.contact?.phone ?? ""} onChange={(e) => updateSettings(["contact", "phone"], e.target.value)} placeholder="+91 98765 43210" />
                </Field>
                <Field label="Office / Mailing Address">
                  <Textarea value={settings.contact?.address ?? ""} onChange={(e) => updateSettings(["contact", "address"], e.target.value)} className="min-h-[70px] resize-none" placeholder="Spandana Care Aid Foundation, Hyderabad, Telangana" />
                </Field>
              </SectionCard>

              <SectionCard title="Social Media Links">
                <p className="text-xs text-muted-foreground -mt-1 mb-3">Paste the full URL for each platform. Leave blank to hide that icon in the footer and navbar.</p>
                <Field label="Facebook"><Input value={settings.social?.facebook ?? ""} onChange={(e) => updateSettings(["social", "facebook"], e.target.value)} placeholder="https://facebook.com/spandana" /></Field>
                <Field label="Instagram"><Input value={settings.social?.instagram ?? ""} onChange={(e) => updateSettings(["social", "instagram"], e.target.value)} placeholder="https://instagram.com/spandana" /></Field>
                <Field label="Twitter / X"><Input value={settings.social?.twitter ?? ""} onChange={(e) => updateSettings(["social", "twitter"], e.target.value)} placeholder="https://twitter.com/spandana" /></Field>
                <Field label="YouTube"><Input value={settings.social?.youtube ?? ""} onChange={(e) => updateSettings(["social", "youtube"], e.target.value)} placeholder="https://youtube.com/@spandana" /></Field>
                <Field label="LinkedIn"><Input value={settings.social?.linkedin ?? ""} onChange={(e) => updateSettings(["social", "linkedin"], e.target.value)} placeholder="https://linkedin.com/company/spandana" /></Field>
              </SectionCard>

              <SectionCard title="Branding & Logo">
                <Field label="Primary Logo (Navigation & Emails)">
                  {settings.branding?.logoUrl && (
                    <div className="flex items-center gap-3 p-2 bg-muted/40 rounded-xl border border-border mb-2">
                      <img src={settings.branding.logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-lg border border-border bg-white p-1" />
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium">Logo uploaded</p><p className="text-[10px] text-muted-foreground">PNG with transparent background recommended</p></div>
                      <Button type="button" variant="outline" size="sm" className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10 text-xs" onClick={() => updateSettings(["branding", "logoUrl"], "")}>Remove</Button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="file" accept="image/png,image/svg+xml,image/webp" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const form = new FormData(); form.append("file", file);
                        try {
                          const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
                          const data = await res.json() as { url?: string; error?: string };
                          if (data.url) { updateSettings(["branding", "logoUrl"], data.url); showFeedback("success", "Logo uploaded!"); }
                          else showFeedback("error", data.error ?? "Upload failed");
                        } catch { showFeedback("error", "Upload failed"); }
                      }} />
                    <span className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 rounded-xl py-3 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/20">
                      <Upload size={15} /> {settings.branding?.logoUrl ? "Replace Logo" : "Upload Logo (PNG or SVG)"}
                    </span>
                  </label>
                  <p className="text-[11px] text-muted-foreground">Used in navigation, footer, and email templates. PNG with transparent background preferred.</p>
                </Field>

                <Field label="White Logo (for dark backgrounds — footer, banners)">
                  {settings.branding?.logoUrlWhite && (
                    <div className="flex items-center gap-3 p-2 bg-[#0a0f1e] rounded-xl border border-border mb-2">
                      <img src={settings.branding.logoUrlWhite} alt="White Logo" className="w-14 h-14 object-contain rounded-lg p-1" />
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium text-white/70">White logo uploaded</p><p className="text-[10px] text-white/40">Used in the footer and dark-background areas</p></div>
                      <Button type="button" variant="outline" size="sm" className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10 text-xs" onClick={() => updateSettings(["branding", "logoUrlWhite"], "")}>Remove</Button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="file" accept="image/png,image/svg+xml,image/webp" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const form = new FormData(); form.append("file", file);
                        try {
                          const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
                          const data = await res.json() as { url?: string; error?: string };
                          if (data.url) { updateSettings(["branding", "logoUrlWhite"], data.url); showFeedback("success", "White logo uploaded!"); }
                          else showFeedback("error", data.error ?? "Upload failed");
                        } catch { showFeedback("error", "Upload failed"); }
                      }} />
                    <span className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 rounded-xl py-3 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/20">
                      <Upload size={15} /> {settings.branding?.logoUrlWhite ? "Replace White Logo" : "Upload White Logo (PNG or SVG)"}
                    </span>
                  </label>
                  <p className="text-[11px] text-muted-foreground">If not uploaded, the primary logo with CSS invert/brightness-0 filter is used as fallback.</p>
                </Field>

                <Field label="Logo Scale">
                  <div className="flex items-center gap-4">
                    <input type="range" min={0.5} max={2.0} step={0.05}
                      value={settings.branding?.logoScale ?? 1}
                      onChange={(e) => updateSettings(["branding", "logoScale"], parseFloat(e.target.value))}
                      className="flex-1 accent-primary h-2 cursor-pointer" />
                    <span className="text-sm font-mono font-bold text-primary w-12 text-right shrink-0">
                      {(settings.branding?.logoScale ?? 1).toFixed(2)}×
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Scales the logo size in the header navigation. 1.00 = original uploaded size.</p>
                </Field>

                <Field label="Logo Alignment (Header)">
                  <div className="grid grid-cols-3 gap-2">
                    {(["left", "center", "right"] as const).map((pos) => (
                      <button key={pos} type="button"
                        onClick={() => updateSettings(["branding", "logoPosition"], pos)}
                        className={`h-10 rounded-xl border text-xs font-semibold capitalize flex items-center justify-center gap-1.5 transition-all ${(settings.branding?.logoPosition ?? "left") === pos ? "bg-primary text-white border-primary shadow-sm" : "border-border bg-background hover:border-primary/40"}`}>
                        {pos === "left" && "← Left"}
                        {pos === "center" && "• Center"}
                        {pos === "right" && "Right →"}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Controls the logo position in the navigation bar.</p>
                </Field>

                <Field label="Organisation Tagline">
                  <Input value={settings.branding?.tagline ?? ""} onChange={(e) => updateSettings(["branding", "tagline"], e.target.value)} placeholder="Building Communities through Social Architecture." />
                </Field>
              </SectionCard>

              <VisibilityToggleRow label="Impact Ticker" visKey="impactTicker" settings={settings} updateSettings={updateSettings} description="The scrolling stats bar shown below the hero." />
              <VisibilityToggleRow label="Campaign / Donation Widget" visKey="campaignWidget" settings={settings} updateSettings={updateSettings} description="The fundraising campaign widget on the homepage." />
              <VisibilityToggleRow label="Newsletter Section" visKey="newsletter" settings={settings} updateSettings={updateSettings} description="The email sign-up section at the bottom of the homepage." />
              <SectionCard title="Promo Video (YouTube)">
                <Field label="YouTube Video ID">
                  <Input value={settings.promoVideoId ?? ""} onChange={(e) => updateSettings(["promoVideoId"], e.target.value)} placeholder="e.g. dQw4w9WgXcQ (the part after ?v= in the YouTube URL)" />
                </Field>
                <p className="text-xs text-muted-foreground">Leave blank to hide the video section. Paste only the video ID, not the full URL.</p>
                <Field label="Section Heading">
                  <Input value={settings.promoVideoSection?.title ?? ""} onChange={(e) => updateSettings(["promoVideoSection", "title"], e.target.value)} placeholder="See Our Work in Action" />
                </Field>
                <RichTextEditor label="Section Subtitle" value={settings.promoVideoSection?.subtitle ?? ""} onChange={(html) => updateSettings(["promoVideoSection", "subtitle"], html)} minHeight={80} />
                <div className="grid gap-3">
                  <Label>Bullet Points (3 lines)</Label>
                  {(settings.promoVideoSection?.bullets ?? ["", "", ""]).map((b: string, i: number) => (
                    <Input key={i} value={b} onChange={(e) => {
                      const bullets = [...(settings.promoVideoSection?.bullets ?? ["", "", ""])];
                      bullets[i] = e.target.value;
                      updateSettings(["promoVideoSection", "bullets"], bullets);
                    }} placeholder={`Bullet point ${i + 1}`} />
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Newsletter Section">
                <Field label="Heading">
                  <Input value={settings.newsletter?.title ?? ""} onChange={(e) => updateSettings(["newsletter", "title"], e.target.value)} placeholder="Our Newsletter" />
                </Field>
                <RichTextEditor label="Subtitle" value={settings.newsletter?.subtitle ?? ""} onChange={(html) => updateSettings(["newsletter", "subtitle"], html)} minHeight={70} placeholder="Stories · updates · no spam · straight to inbox" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Subscribe Button Label">
                    <Input value={settings.newsletter?.buttonLabel ?? ""} onChange={(e) => updateSettings(["newsletter", "buttonLabel"], e.target.value)} placeholder="Subscribe" />
                  </Field>
                  <Field label="Success Message">
                    <Input value={settings.newsletter?.successMsg ?? ""} onChange={(e) => updateSettings(["newsletter", "successMsg"], e.target.value)} placeholder="You're subscribed!" />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard title="🎯 Campaign Widget" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-4">Controls the "Help us reach X families" campaign block shown on the homepage.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Heading"><Input value={settings.campaignWidget?.heading ?? ""} onChange={(e) => updateSettings(["campaignWidget", "heading"], e.target.value)} placeholder="Help us reach" /></Field>
                  <Field label="Heading Highlight"><Input value={settings.campaignWidget?.headingEmphasis ?? ""} onChange={(e) => updateSettings(["campaignWidget", "headingEmphasis"], e.target.value)} placeholder="6,000 families." /></Field>
                </div>
                <Field label="Description">
                  <Textarea value={settings.campaignWidget?.description ?? ""} onChange={(e) => updateSettings(["campaignWidget", "description"], e.target.value)} className="min-h-[60px] resize-none" placeholder="Every family we reach gets sustained support — not a one-time handout." />
                </Field>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Goal (number)" description="e.g. 6000"><Input type="number" min="0" value={settings.campaignWidget?.goal ?? ""} onChange={(e) => updateSettings(["campaignWidget", "goal"], Number(e.target.value))} placeholder="6000" /></Field>
                  <Field label="Current (reached)" description="e.g. 5247"><Input type="number" min="0" value={settings.campaignWidget?.current ?? ""} onChange={(e) => updateSettings(["campaignWidget", "current"], Number(e.target.value))} placeholder="5247" /></Field>
                  <Field label="Families Label"><Input value={settings.campaignWidget?.reachedLabel ?? ""} onChange={(e) => updateSettings(["campaignWidget", "reachedLabel"], e.target.value)} placeholder="Families reached" /></Field>
                </div>
                <Field label="Donate Button Label">
                  <Input value={settings.campaignWidget?.buttonLabel ?? ""} onChange={(e) => updateSettings(["campaignWidget", "buttonLabel"], e.target.value)} placeholder="Donate Now" />
                </Field>
              </SectionCard>

              <SectionCard title="🌟 Volunteer Spotlight Section" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-4">Controls the volunteer showcase block on the homepage.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Badge Text"><Input value={settings.volunteerSpotlight?.badge ?? ""} onChange={(e) => updateSettings(["volunteerSpotlight", "badge"], e.target.value)} placeholder="Volunteer Spotlight" /></Field>
                  <Field label="CTA Button Label"><Input value={settings.volunteerSpotlight?.ctaLabel ?? ""} onChange={(e) => updateSettings(["volunteerSpotlight", "ctaLabel"], e.target.value)} placeholder="Become a Volunteer" /></Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Heading (line 1)"><Input value={settings.volunteerSpotlight?.heading ?? ""} onChange={(e) => updateSettings(["volunteerSpotlight", "heading"], e.target.value)} placeholder="Meet the people" /></Field>
                  <Field label="Heading Italic (line 2)"><Input value={settings.volunteerSpotlight?.headingItalic ?? ""} onChange={(e) => updateSettings(["volunteerSpotlight", "headingItalic"], e.target.value)} placeholder="behind the change." /></Field>
                </div>
                <Field label="CTA URL"><Input value={settings.volunteerSpotlight?.ctaUrl ?? ""} onChange={(e) => updateSettings(["volunteerSpotlight", "ctaUrl"], e.target.value)} placeholder="/volunteer" /></Field>
              </SectionCard>

              <SectionCard title="Volunteer / Get Involved Section">
                <Field label="Section Title"><Input value={settings.getInvolved.title} onChange={(e) => updateSettings(["getInvolved", "title"], e.target.value)} /></Field>
                <RichTextEditor label="Section Subtitle" value={settings.getInvolved.subtitle ?? ""} onChange={(html) => updateSettings(["getInvolved", "subtitle"], html)} minHeight={80} />
              </SectionCard>
              <SectionCard title="Donate Page Settings">
                <p className="text-xs text-muted-foreground -mt-1 mb-2">Configure what appears on the /donate page.</p>
                <Field label="Page Heading">
                  <Input value={settings.donatePage?.heading ?? ""} onChange={(e) => updateSettings(["donatePage", "heading"], e.target.value)} placeholder="Every Rupee Builds a Future" />
                </Field>
                <RichTextEditor label="Page Subheading" value={settings.donatePage?.subheading ?? ""} onChange={(html) => updateSettings(["donatePage", "subheading"], html)} minHeight={70} />
                <RichTextEditor label="Tax / 80G Note" value={settings.donatePage?.taxNote ?? ""} onChange={(html) => updateSettings(["donatePage", "taxNote"], html)} minHeight={60} placeholder="Donations are eligible for 80G tax deduction..." />
                <div className="border-t border-border pt-3 mt-1">
                  <p className="text-xs font-semibold text-foreground mb-3">UPI Details</p>
                  <Field label="UPI ID">
                    <Input value={settings.upiId ?? ""} onChange={(e) => updateSettings(["upiId"], e.target.value)} placeholder="spandana@upi" />
                  </Field>
                  <Field label="UPI Account Name">
                    <Input value={settings.upiName ?? ""} onChange={(e) => updateSettings(["upiName"], e.target.value)} placeholder="Spandana Care Aid Foundation" />
                  </Field>
                  <Field label="UPI QR Code Image">
                    <div className="flex flex-col gap-2">
                      {settings.upiQrUrl && (
                        <div className="flex items-center gap-3 p-2 bg-muted/40 rounded-xl border border-border">
                          <img src={settings.upiQrUrl} alt="QR Code" className="w-16 h-16 object-contain rounded-lg border border-border bg-white" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">QR Code uploaded</p>
                            <p className="text-[10px] text-muted-foreground truncate">{settings.upiQrUrl}</p>
                          </div>
                          <Button type="button" variant="outline" size="sm" className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
                            onClick={() => updateSettings(["upiQrUrl"], "")}>Remove</Button>
                        </div>
                      )}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="file" accept="image/*" className="hidden"
                          onChange={async (e) => {
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
                </div>
                <div className="border-t border-border pt-3 mt-1">
                  <p className="text-xs font-semibold text-foreground mb-3">Bank Transfer Details</p>
                  <Field label="Account Name"><Input value={settings.bankAccountName ?? ""} onChange={(e) => updateSettings(["bankAccountName"], e.target.value)} placeholder="Spandana Care Aid Foundation" /></Field>
                  <Field label="Account Number"><Input value={settings.bankAccountNumber ?? ""} onChange={(e) => updateSettings(["bankAccountNumber"], e.target.value)} placeholder="XXXXXXXXXXXXXXXXXX" /></Field>
                  <Field label="IFSC Code"><Input value={settings.bankIfsc ?? ""} onChange={(e) => updateSettings(["bankIfsc"], e.target.value)} placeholder="SBIN0001234" /></Field>
                  <Field label="Bank Name"><Input value={settings.bankName ?? ""} onChange={(e) => updateSettings(["bankName"], e.target.value)} placeholder="State Bank of India" /></Field>
                  <Field label="Branch"><Input value={settings.bankBranch ?? ""} onChange={(e) => updateSettings(["bankBranch"], e.target.value)} placeholder="Hyderabad Main Branch" /></Field>
                </div>
                <div className="border-t border-border pt-3 mt-1">
                  <p className="text-xs font-semibold text-foreground mb-1">Online Payment Links</p>
                  <p className="text-[11px] text-muted-foreground mb-3">Toggle each method on to show it on the donate page. Save the link even if the toggle is off — it won't appear until you enable it.</p>
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
                </div>
              </SectionCard>
              <SectionCard title="WhatsApp Community Widget">
                <p className="text-xs text-muted-foreground -mt-1 mb-2">This controls the floating WhatsApp button on every page. Paste your WhatsApp group invite link below.</p>
                <Field label="WhatsApp Group Invite Link">
                  <Input value={settings.whatsappGroupLink ?? ""} onChange={(e) => updateSettings(["whatsappGroupLink"], e.target.value)} placeholder="https://chat.whatsapp.com/XXXXXXXXXXXX" />
                </Field>
                <Field label="Group Display Name">
                  <Input value={settings.whatsappGroupName ?? ""} onChange={(e) => updateSettings(["whatsappGroupName"], e.target.value)} placeholder="Spandana Community" />
                </Field>
              </SectionCard>

              <SectionCard title="📱 Floating Quick-Menu (Mobile)">
                <p className="text-xs text-muted-foreground -mt-1 mb-4">
                  The floating navigation menu appears on mobile screens when visitors first land on the page.
                  It auto-dismisses after the timer you set below.
                </p>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 mb-4">
                  <input
                    type="checkbox"
                    id="floatingMenuEnabled"
                    checked={settings.floating_menu?.enabled ?? true}
                    onChange={(e) => updateSettings(["floating_menu", "enabled"], e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="floatingMenuEnabled" className="text-sm font-medium cursor-pointer select-none">
                    Show floating menu on mobile
                  </label>
                </div>
                <Field
                  label="Auto-dismiss timer (seconds)"
                  description="How many seconds the menu stays visible before sliding away. Min 1 — Max 30."
                >
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={settings.floating_menu?.timerSeconds ?? 4}
                      onChange={(e) => {
                        const val = Math.min(30, Math.max(1, parseInt(e.target.value) || 4));
                        updateSettings(["floating_menu", "timerSeconds"], val);
                      }}
                      className="w-24"
                    />
                    <span className="text-xs text-muted-foreground">
                      Currently: <strong>{settings.floating_menu?.timerSeconds ?? 4}s</strong> — the progress bar at the bottom of the menu counts down this time.
                    </span>
                  </div>
                </Field>
              </SectionCard>
              <SectionCard title="Content Protection">
                <p className="text-xs text-muted-foreground -mt-1 mb-4">
                  When enabled, visitors cannot right-click, select text, or use keyboard shortcuts (Ctrl+C, Ctrl+U, F12, etc.) to copy or inspect site content.
                  Disable this if you want visitors to be able to copy text freely.
                </p>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                  <input
                    type="checkbox"
                    id="contentProtectionEnabled"
                    checked={settings.contentProtection !== false}
                    onChange={(e) => updateSettings(["contentProtection"], e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="contentProtectionEnabled" className="text-sm font-medium cursor-pointer select-none">
                    Enable right-click &amp; copy protection
                  </label>
                </div>
              </SectionCard>

              <SectionCard title="Contact Information">
                <Field label="Contact Email"><Input type="email" value={settings.contact?.email ?? ""} onChange={(e) => updateSettings(["contact", "email"], e.target.value)} /></Field>
                <Field label="Phone / WhatsApp"><Input value={settings.contact?.phone ?? ""} onChange={(e) => updateSettings(["contact", "phone"], e.target.value)} placeholder="+91 XXXXX XXXXX" /></Field>
              </SectionCard>
              <SectionCard title="Footer — Brand & Contact">
                <RichTextEditor label="Brand Tagline" value={settings.footerContent?.brandTagline ?? ""} onChange={(html) => updateSettings(["footerContent", "brandTagline"], html)} minHeight={70} />
                <Field label="Address (shown in Contact Us column)">
                  <Textarea value={settings.footerContent?.address ?? ""}
                    onChange={(e) => updateSettings(["footerContent", "address"], e.target.value)} className="min-h-[60px] resize-none" placeholder="Sahara Community Center,&#10;Hyderabad, Telangana, India" />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Footer Email">
                    <Input type="email" value={settings.footerContent?.email ?? ""}
                      onChange={(e) => updateSettings(["footerContent", "email"], e.target.value)} />
                  </Field>
                  <Field label="Footer Phone">
                    <Input value={settings.footerContent?.phone ?? ""}
                      onChange={(e) => updateSettings(["footerContent", "phone"], e.target.value)} placeholder="+91 XXXXX XXXXX" />
                  </Field>
                </div>
              </SectionCard>
              <SectionCard title="Footer — Social Media Links" defaultOpen={false}>
                {(settings.footerContent?.social ?? []).map((s: { label: string; href: string }, i: number) => (
                  <div key={i} className="grid sm:grid-cols-2 gap-4">
                    <Field label={`${s.label} Label`}>
                      <Input value={s.label} onChange={(e) => {
                        const arr = JSON.parse(JSON.stringify(settings.footerContent?.social ?? []));
                        arr[i] = { ...arr[i], label: e.target.value };
                        updateSettings(["footerContent", "social"], arr);
                      }} />
                    </Field>
                    <Field label="URL">
                      <Input value={s.href} onChange={(e) => {
                        const arr = JSON.parse(JSON.stringify(settings.footerContent?.social ?? []));
                        arr[i] = { ...arr[i], href: e.target.value };
                        updateSettings(["footerContent", "social"], arr);
                      }} placeholder="https://instagram.com/..." />
                    </Field>
                  </div>
                ))}
              </SectionCard>
              <SectionCard title="Footer — Certifications" defaultOpen={false}>
                {(settings.footerContent?.certifications ?? []).map((c: { label: string; sub: string }, i: number) => (
                  <div key={i} className="grid sm:grid-cols-2 gap-4">
                    <Field label={`Cert ${i + 1} — Name`}>
                      <Input value={c.label} onChange={(e) => {
                        const arr = JSON.parse(JSON.stringify(settings.footerContent?.certifications ?? []));
                        arr[i] = { ...arr[i], label: e.target.value };
                        updateSettings(["footerContent", "certifications"], arr);
                      }} />
                    </Field>
                    <Field label="Description">
                      <Input value={c.sub} onChange={(e) => {
                        const arr = JSON.parse(JSON.stringify(settings.footerContent?.certifications ?? []));
                        arr[i] = { ...arr[i], sub: e.target.value };
                        updateSettings(["footerContent", "certifications"], arr);
                      }} />
                    </Field>
                  </div>
                ))}
              </SectionCard>
              <SectionCard title="Footer — Copyright">
                <Field label="Copyright Text"><Input value={settings.footer?.copyright ?? ""} onChange={(e) => updateSettings(["footer", "copyright"], e.target.value)} /></Field>
              </SectionCard>
              <SectionCard title="How It Works Section" defaultOpen={false}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Badge Text">
                    <Input value={settings.howItWorks?.badge ?? "How it works"}
                      onChange={(e) => updateSettings(["howItWorks", "badge"], e.target.value)} />
                  </Field>
                  <Field label="Button Label">
                    <Input value={settings.howItWorks?.buttonLabel ?? "Start Now"}
                      onChange={(e) => updateSettings(["howItWorks", "buttonLabel"], e.target.value)} />
                  </Field>
                  <Field label="Heading (first part)">
                    <Input value={settings.howItWorks?.heading ?? "Three steps to"}
                      onChange={(e) => updateSettings(["howItWorks", "heading"], e.target.value)} />
                  </Field>
                  <Field label="Heading Italic (second part)">
                    <Input value={settings.howItWorks?.headingItalic ?? "real change."}
                      onChange={(e) => updateSettings(["howItWorks", "headingItalic"], e.target.value)} />
                  </Field>
                </div>
                {(settings.howItWorks?.steps ?? []).map((step: { num: string; title: string; desc: string }, i: number) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-4 grid gap-3">
                    <p className="text-xs font-semibold text-primary">Step {i + 1}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Number"><Input value={step.num} onChange={(e) => {
                        const arr = JSON.parse(JSON.stringify(settings.howItWorks?.steps ?? []));
                        arr[i] = { ...arr[i], num: e.target.value };
                        updateSettings(["howItWorks", "steps"], arr);
                      }} /></Field>
                      <Field label="Title"><Input value={step.title} onChange={(e) => {
                        const arr = JSON.parse(JSON.stringify(settings.howItWorks?.steps ?? []));
                        arr[i] = { ...arr[i], title: e.target.value };
                        updateSettings(["howItWorks", "steps"], arr);
                      }} /></Field>
                    </div>
                    <RichTextEditor label="Description" value={step.desc ?? ""} onChange={(html) => {
                      const arr = JSON.parse(JSON.stringify(settings.howItWorks?.steps ?? []));
                      arr[i] = { ...arr[i], desc: html };
                      updateSettings(["howItWorks", "steps"], arr);
                    }} minHeight={70} />
                  </div>
                ))}
              </SectionCard>
              <SectionCard title="Timeline Section Heading" defaultOpen={false}>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Badge Text">
                    <Input value={settings.timelineSection?.badge ?? "Our Journey"}
                      onChange={(e) => updateSettings(["timelineSection", "badge"], e.target.value)} />
                  </Field>
                  <Field label="Heading (first part)">
                    <Input value={settings.timelineSection?.heading ?? "25 years of"}
                      onChange={(e) => updateSettings(["timelineSection", "heading"], e.target.value)} />
                  </Field>
                  <Field label="Heading Italic (second part)">
                    <Input value={settings.timelineSection?.headingItalic ?? "showing up."}
                      onChange={(e) => updateSettings(["timelineSection", "headingItalic"], e.target.value)} />
                  </Field>
                </div>
              </SectionCard>
              <SectionCard title="Impact Ticker Items" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-1">Scrolling banner text items. One item per field.</p>
                <div className="flex justify-end mb-2">
                  <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => {
                    const arr = JSON.parse(JSON.stringify(settings.ticker?.items ?? []));
                    arr.push("New ticker item");
                    updateSettings(["ticker", "items"], arr);
                  }}><Plus size={12} />Add Item</Button>
                </div>
                {(settings.ticker?.items ?? []).map((item: string, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input value={item} onChange={(e) => {
                      const arr = JSON.parse(JSON.stringify(settings.ticker?.items ?? []));
                      arr[i] = e.target.value;
                      updateSettings(["ticker", "items"], arr);
                    }} className="flex-1" />
                    <button onClick={() => {
                      const arr = JSON.parse(JSON.stringify(settings.ticker?.items ?? []));
                      arr.splice(i, 1);
                      updateSettings(["ticker", "items"], arr);
                    }} className="text-destructive hover:text-destructive/80 shrink-0 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </SectionCard>
              <div className="flex justify-end mt-4">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
              </div>
            </div>
  );
}
