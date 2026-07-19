// Auto-extracted from admin.tsx — FooterTab
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionCard, Field, VisibilityToggleRow } from "./shared";
import {
  Save, Loader2, Plus, Trash2, Pencil, X, Eye, EyeOff,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Upload, Download, RefreshCw, ExternalLink, Lock, KeyRound,
  UserCheck, UserX, UserPlus, CalendarDays, MapPin, Clock,
  Send, History, Megaphone, Image, Globe, DollarSign, Mail,
  Star, FileText, FolderOpen, UsersRound,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch }   from "@/components/ui/switch";
import type { SiteSettings, DeviceView } from "./types";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function FooterTab({ settings, updateSettings, saveSettings, saving }: {
  settings: SiteSettings; updateSettings: (path: (string | number)[], val: unknown) => void;
  saveSettings: () => void; saving: boolean;
}) {
  const fc: NonNullable<SiteSettings["footerContent"]> = settings.footerContent ?? {
    brandTagline: "", address: "", email: "", phone: "", social: [], certifications: []
  };
  const [footerView, setFooterView] = useState<DeviceView>("desktop");
  const social: Array<{ label: string; href: string; enabled?: boolean }> = fc.social ?? [
    { label: "Instagram", href: "" }, { label: "YouTube", href: "" },
    { label: "Facebook", href: "" }, { label: "Twitter / X", href: "" },
  ];
  const certs: Array<{ label: string; sub: string; enabled?: boolean }> = fc.certifications ?? [
    { label: "80G Certified", sub: "Tax exemption for donors" },
    { label: "12A Registered", sub: "Income Tax exemption" },
    { label: "NGO Darpan", sub: "Govt. of India listed" },
    { label: "CSR 1 Registered", sub: "Corporate Social Responsibility" },
  ];

  function setSocial(i: number, field: "label" | "href", val: string) {
    const next = social.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    updateSettings(["footerContent", "social"], next);
  }
  function addSocial() { updateSettings(["footerContent", "social"], [...social, { label: "Platform", href: "" }]); }
  function removeSocial(i: number) { updateSettings(["footerContent", "social"], social.filter((_, idx) => idx !== i)); }
  function setCert(i: number, field: "label" | "sub", val: string) {
    const next = certs.map((c, idx) => idx === i ? { ...c, [field]: val } : c);
    updateSettings(["footerContent", "certifications"], next);
  }
  function addCert() { updateSettings(["footerContent", "certifications"], [...certs, { label: "", sub: "" }]); }
  function removeCert(i: number) { updateSettings(["footerContent", "certifications"], certs.filter((_, idx) => idx !== i)); }
  function setSocialEnabled(i: number, val: boolean) {
    const next = social.map((s, idx) => idx === i ? { ...s, enabled: val } : s);
    updateSettings(["footerContent", "social"], next);
  }
  function setCertEnabled(i: number, val: boolean) {
    const next = certs.map((c, idx) => idx === i ? { ...c, enabled: val } : c);
    updateSettings(["footerContent", "certifications"], next);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-serif font-bold">Footer</h2><p className="text-sm text-muted-foreground mt-1">Edit footer content, contact info, and social links</p></div>
        <Button className="rounded-full gap-2" onClick={saveSettings} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Draft</>}</Button>
      </div>

      {/* Device Tabs */}
      <div className="flex items-stretch gap-0 mb-6 bg-muted/40 rounded-2xl p-1.5 border border-border">
        <button onClick={() => setFooterView("desktop")}
          className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${footerView === "desktop" ? "bg-card shadow-sm text-foreground border border-border/70" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
          <span className="text-base leading-none">🖥</span> Desktop Version
        </button>
        <button onClick={() => setFooterView("mobile")}
          className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${footerView === "mobile" ? "bg-card shadow-sm text-foreground border border-border/70" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
          <span className="text-base leading-none">📱</span> Mobile Version
        </button>
      </div>

      {footerView === "desktop" ? (
        <>
          <VisibilityToggleRow label="Show Footer on Desktop" description="Toggle to hide the entire footer on desktop screens." visKey="footer" settings={settings} updateSettings={updateSettings} />

          <SectionCard title="🏷 Brand">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">Logo Subtitle</label>
              <Input value={fc.brandSubtitle ?? ""} onChange={(e) => updateSettings(["footerContent", "brandSubtitle"], e.target.value)} placeholder="Care Aid Foundation" />
              <p className="text-xs text-muted-foreground mt-1">Appears beneath the logo (e.g. "Care Aid Foundation")</p>
            </div>
            <div>
              <RichTextEditor label="Tagline" value={fc.brandTagline ?? ""} onChange={(html) => updateSettings(["footerContent", "brandTagline"], html)} minHeight={70} placeholder="25+ years of Social Architecture…" />
            </div>
          </SectionCard>

          <SectionCard title="📞 Contact Info">
            <div className="space-y-4">
              <div className={fc.showAddress === false ? "opacity-60" : ""}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Address</label>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{fc.showAddress !== false ? "Visible" : "Hidden"}</span>
                    <Switch checked={fc.showAddress !== false} onCheckedChange={(v) => updateSettings(["footerContent", "showAddress"], v)} />
                  </div>
                </div>
                <Textarea value={fc.address ?? ""} onChange={(e) => updateSettings(["footerContent", "address"], e.target.value)} className="min-h-[60px] resize-none" placeholder={"Sahara Community Center,\nHyderabad, Telangana, India"} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className={fc.showEmail === false ? "opacity-60" : ""}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{fc.showEmail !== false ? "Visible" : "Hidden"}</span>
                      <Switch checked={fc.showEmail !== false} onCheckedChange={(v) => updateSettings(["footerContent", "showEmail"], v)} />
                    </div>
                  </div>
                  <Input type="email" value={fc.email ?? ""} onChange={(e) => updateSettings(["footerContent", "email"], e.target.value)} placeholder="info@spandana.org" />
                </div>
                <div className={fc.showPhone === false ? "opacity-60" : ""}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</label>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{fc.showPhone !== false ? "Visible" : "Hidden"}</span>
                      <Switch checked={fc.showPhone !== false} onCheckedChange={(v) => updateSettings(["footerContent", "showPhone"], v)} />
                    </div>
                  </div>
                  <Input value={fc.phone ?? ""} onChange={(e) => updateSettings(["footerContent", "phone"], e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="🔗 Social Media Links">
            <div className="space-y-3">
              {social.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 ${s.enabled === false ? "opacity-60" : ""}`}>
                  <Switch checked={s.enabled !== false} onCheckedChange={(v) => setSocialEnabled(i, v)} className="shrink-0" />
                  <Input value={s.label} onChange={(e) => setSocial(i, "label", e.target.value)} placeholder="Platform name" className="w-28 shrink-0" />
                  <Input value={s.href} onChange={(e) => setSocial(i, "href", e.target.value)} placeholder="https://instagram.com/…" className="flex-1" />
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive shrink-0" onClick={() => removeSocial(i)}><X size={15} /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 mt-1" onClick={addSocial}><Plus size={13} />Add Platform</Button>
            </div>
          </SectionCard>

          <SectionCard title="🏅 Certifications & Registrations">
            <div className="space-y-3">
              {certs.map((c, i) => (
                <div key={i} className={`flex items-center gap-2 ${c.enabled === false ? "opacity-60" : ""}`}>
                  <Switch checked={c.enabled !== false} onCheckedChange={(v) => setCertEnabled(i, v)} className="shrink-0" />
                  <Input value={c.label} onChange={(e) => setCert(i, "label", e.target.value)} placeholder="80G Certified" className="w-36 shrink-0" />
                  <Input value={c.sub} onChange={(e) => setCert(i, "sub", e.target.value)} placeholder="Tax exemption for donors" className="flex-1" />
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive shrink-0" onClick={() => removeCert(i)}><X size={15} /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 mt-1" onClick={addCert}><Plus size={13} />Add Certification</Button>
            </div>
          </SectionCard>

          <SectionCard title="© Copyright Text">
            <Input value={settings.footer?.copyright ?? ""} onChange={(e) => updateSettings(["footer", "copyright"], e.target.value)}
              placeholder={`© ${new Date().getFullYear()} Spandana Care Aid Foundation. All rights reserved.`} />
          </SectionCard>

          <SectionCard title="🔒 Privacy Policy Page">
            <p className="text-xs text-muted-foreground -mt-1 mb-3">Edits the <a href="/privacy" target="_blank" className="underline text-primary hover:opacity-80">/privacy</a> page content.</p>
            <Field label="Page Title"><Input value={settings.privacyPolicy?.title ?? "Privacy Policy"} onChange={(e) => updateSettings(["privacyPolicy", "title"], e.target.value)} /></Field>
            <Field label="Last Updated"><Input value={settings.privacyPolicy?.lastUpdated ?? ""} onChange={(e) => updateSettings(["privacyPolicy", "lastUpdated"], e.target.value)} placeholder="e.g. May 2026" /></Field>
            <Field label="Content"><Textarea value={settings.privacyPolicy?.content ?? ""} onChange={(e) => updateSettings(["privacyPolicy", "content"], e.target.value)} className="min-h-[220px] resize-y font-mono text-xs" placeholder="Write your privacy policy here. Use **Heading** on its own line for section headings." /></Field>
            <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">**Heading**</code> on its own line to create a bold section heading.</p>
          </SectionCard>

          <SectionCard title="📄 Terms of Use Page">
            <p className="text-xs text-muted-foreground -mt-1 mb-3">Edits the <a href="/terms" target="_blank" className="underline text-primary hover:opacity-80">/terms</a> page content.</p>
            <Field label="Page Title"><Input value={settings.termsOfUse?.title ?? "Terms of Use"} onChange={(e) => updateSettings(["termsOfUse", "title"], e.target.value)} /></Field>
            <Field label="Last Updated"><Input value={settings.termsOfUse?.lastUpdated ?? ""} onChange={(e) => updateSettings(["termsOfUse", "lastUpdated"], e.target.value)} placeholder="e.g. May 2026" /></Field>
            <Field label="Content"><Textarea value={settings.termsOfUse?.content ?? ""} onChange={(e) => updateSettings(["termsOfUse", "content"], e.target.value)} className="min-h-[220px] resize-y font-mono text-xs" placeholder="Write your terms of use here. Use **Heading** on its own line for section headings." /></Field>
            <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">**Heading**</code> on its own line to create a bold section heading.</p>
          </SectionCard>
        </>
      ) : (
        <>
          <VisibilityToggleRow label="Show Footer on Mobile" description="Toggle to hide the entire footer on phone screens." visKey="footerMobile" settings={settings} updateSettings={updateSettings} />

          <SectionCard title="📱 Mobile Brand Tagline">
            <p className="text-xs text-muted-foreground -mt-1 mb-2">A shorter tagline for phone screens. Leave blank to use the desktop tagline.</p>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 mb-3">
              <input type="checkbox" id="useMobileFooter" checked={fc.useMobileFooter ?? false}
                onChange={(e) => updateSettings(["footerContent", "useMobileFooter"], e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
              <label htmlFor="useMobileFooter" className="text-sm font-medium cursor-pointer select-none">Use condensed footer text on mobile</label>
            </div>
            <div className={`grid gap-4 ${!fc.useMobileFooter ? "opacity-50 pointer-events-none" : ""}`}>
              <div>
                <RichTextEditor label="Mobile Tagline" value={fc.mobileTagline ?? ""} onChange={(html) => updateSettings(["footerContent", "mobileTagline"], html)} minHeight={60} placeholder="Shorter tagline for phones..." />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">Mobile Address (abbreviated)</label>
                <Input value={fc.mobileAddress ?? ""} onChange={(e) => updateSettings(["footerContent", "mobileAddress"], e.target.value)} placeholder="Hyderabad, Telangana" />
                <p className="text-xs text-muted-foreground mt-1">Shorter version of the address shown on phones.</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">Mobile Phone</label>
                <Input value={fc.mobilePhone ?? ""} onChange={(e) => updateSettings(["footerContent", "mobilePhone"], e.target.value)} placeholder="+91 98765 43210" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="📐 Mobile Footer Layout">
            <Field label="Column layout on phones" description="How footer columns are stacked on small screens.">
              <div className="flex gap-2 mt-1">
                {(["stacked", "compact"] as const).map((layout) => (
                  <button key={layout} onClick={() => updateSettings(["footerContent", "mobileLayout"], layout)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-sm font-semibold capitalize transition-all ${(fc.mobileLayout ?? "stacked") === layout ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {layout === "stacked" ? "↕ Stacked (full)" : "☰ Compact (minimal)"}
                  </button>
                ))}
              </div>
            </Field>
            <p className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">
              <span className="font-semibold">Stacked:</span> All columns shown, stacked vertically.<br />
              <span className="font-semibold">Compact:</span> Only logo, social links, and copyright shown — everything else hidden.
            </p>
          </SectionCard>

          <SectionCard title="👁 Mobile Field Visibility">
            <p className="text-xs text-muted-foreground -mt-1 mb-3">Control which individual fields show on phones.</p>
            <div className="space-y-2">
              {[
                { label: "Address", key: "showAddressMobile" },
                { label: "Email", key: "showEmailMobile" },
                { label: "Phone", key: "showPhoneMobile" },
                { label: "Certifications", key: "showCertsMobile" },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                  <span className="text-sm font-medium">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{fc[key] !== false ? "Visible" : "Hidden"}</span>
                    <Switch checked={fc[key] !== false} onCheckedChange={(v) => updateSettings(["footerContent", key], v)} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}

      <div className="flex justify-end mt-4">
        <Button className="rounded-full gap-2" onClick={saveSettings} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Draft</>}</Button>
      </div>
    </div>
  );
}

/* ── GAME DEFAULTS (mirrors fun-zone) ── */
const GAME_DEFS = [
  { id: "ludo-multi",  emoji: "🎲", title: "Ludo — Online",          pricingLabel: "Online variable (2P / 4P)" },
  { id: "ludo",        emoji: "🎲", title: "Ludo — Local",           pricingLabel: "Local variable (2P / 4P)"  },
  { id: "ttt-multi",   emoji: "⭕", title: "Tic-Tac-Toe — Online",   pricingLabel: "Online 2P fixed"            },
  { id: "ttt",         emoji: "⭕", title: "Tic-Tac-Toe — Local",    pricingLabel: "Local 2P fixed"             },
  { id: "memory",      emoji: "🃏", title: "Memory Match",           pricingLabel: "Solo"                       },
  { id: "darts",       emoji: "🎯", title: "Darts",                  pricingLabel: "Solo"                       },
  { id: "quiz",        emoji: "🧠", title: "Spandana Quiz",          pricingLabel: "Solo"                       },
];

interface GamesTabProps {
  settings: SiteSettings;
  updateSettings: (path: (string | number)[], val: unknown) => void;
  saveSettings: () => void;
  saving: boolean;
}



