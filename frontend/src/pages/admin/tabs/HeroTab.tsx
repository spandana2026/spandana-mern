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

export default function HeroTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div><h2 className="text-2xl font-serif font-bold">Hero & Stats</h2><p className="text-sm text-muted-foreground mt-1">Edit the main banner and impact numbers</p></div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
              </div>

              <DeviceTabs>
                {(view) => view === "desktop" ? (
                  <>
                    <VisibilityToggleRow label="Show Hero on Desktop" description="The full-screen banner at the top of the homepage." visKey="hero" settings={settings} updateSettings={updateSettings} />

                    {/* ── Background Mode ── */}
                    <SectionCard title="🎬 Background Mode">
                      <div className="flex gap-2">
                        {([["image","🖼","Image","Single static photo"],["carousel","🎠","Carousel","Multiple images cycling"],["video","🎬","Video","YouTube / Vimeo URL"]] as const).map(([mode, emoji, label, desc]) => {
                          const active = (settings.heroMode ?? "image") === mode;
                          return (
                            <button key={mode} onClick={() => updateSettings(["heroMode"], mode)}
                              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                              <span className="text-lg leading-none">{emoji}</span>
                              <span>{label}</span>
                              <span className="text-[10px] font-normal opacity-70">{desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </SectionCard>

                    {/* ── Image mode ── */}
                    {(settings.heroMode ?? "image") === "image" && (
                    <SectionCard title="🖼 Background Image — Landscape">
                      <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-primary text-xs font-bold">🖥</span></div>
                        <div>
                          <p className="text-xs font-bold text-foreground mb-0.5">Optimised for Wide / Landscape Screens</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Recommended: <span className="font-semibold text-foreground">1920 × 1080 px</span> (16:9 landscape)<br />
                            Minimum: 1280 × 720 px · Max 5 MB · JPG, PNG, WebP<br />
                            The image pans left/right automatically on desktop.
                          </p>
                        </div>
                      </div>
                      {settings.heroImage && (
                        <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                          <img src={settings.heroImage} alt="Hero background" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-[#0033A0]/60 flex items-center justify-center">
                            <span className="text-white/70 text-xs font-semibold bg-black/30 px-3 py-1 rounded-full">Preview (with blue overlay)</span>
                          </div>
                          <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-destructive hover:bg-white transition-colors shadow" onClick={() => updateSettings(["heroImage"], "")}><X size={13} /></button>
                        </div>
                      )}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            if (file.size > 5 * 1024 * 1024) { showFeedback("error", "File too large — max 5 MB"); return; }
                            const form = new FormData(); form.append("file", file);
                            try {
                              const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
                              const data = await res.json() as { url?: string; error?: string };
                              if (data.url) { updateSettings(["heroImage"], data.url); showFeedback("success", "Desktop hero image uploaded! Save to apply."); }
                              else showFeedback("error", data.error ?? "Upload failed");
                            } catch { showFeedback("error", "Upload failed"); }
                          }} />
                        <span className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 rounded-xl py-4 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/20">
                          <Upload size={16} /> {settings.heroImage ? "Replace Desktop Image" : "Upload Desktop Image"}
                        </span>
                      </label>
                      <p className="text-[11px] text-muted-foreground -mt-2">After uploading, click <span className="font-semibold">Save Changes</span> to publish.</p>
                    </SectionCard>
                    )}

                    {/* ── Carousel mode ── */}
                    {(settings.heroMode ?? "image") === "carousel" && (
                    <SectionCard title="🎠 Carousel Images — Desktop">
                      <p className="text-xs text-muted-foreground">Add up to 6 landscape images (1920×1080 recommended). They cycle automatically at the interval you set.</p>
                      <div className="space-y-2">
                        {(settings.heroCarouselImages ?? []).map((imgUrl: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/20">
                            <img src={imgUrl} alt={`Slide ${i + 1}`} className="w-20 h-12 object-cover rounded-lg shrink-0 border border-border" />
                            <span className="text-xs flex-1 text-muted-foreground">Slide {i + 1}</span>
                            <button onClick={() => { const arr = [...(settings.heroCarouselImages ?? [])]; arr.splice(i, 1); updateSettings(["heroCarouselImages"], arr); }}
                              className="w-7 h-7 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors shrink-0">
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {(settings.heroCarouselImages ?? []).length < 6 && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              if (file.size > 5 * 1024 * 1024) { showFeedback("error", "File too large — max 5 MB"); return; }
                              const formData = new FormData(); formData.append("file", file);
                              try {
                                const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
                                const data = await res.json() as { url?: string; error?: string };
                                if (data.url) { const arr = [...(settings.heroCarouselImages ?? []), data.url]; updateSettings(["heroCarouselImages"], arr); showFeedback("success", `Slide ${arr.length} added!`); }
                                else showFeedback("error", data.error ?? "Upload failed");
                              } catch { showFeedback("error", "Upload failed"); }
                            }} />
                          <span className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 rounded-xl py-4 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/20">
                            <Upload size={16} /> Add Slide {(settings.heroCarouselImages ?? []).length + 1}
                          </span>
                        </label>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4 pt-1">
                        <Field label="Slide Duration (seconds)">
                          <Input type="number" min="2" max="30" value={settings.heroCarouselInterval ?? 5} onChange={(e) => updateSettings(["heroCarouselInterval"], Number(e.target.value))} />
                        </Field>
                        <Field label="Transition Style">
                          <div className="flex gap-2 mt-1">
                            {(["fade", "slide"] as const).map((t) => (
                              <button key={t} onClick={() => updateSettings(["heroCarouselTransition"], t)}
                                className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${(settings.heroCarouselTransition ?? "fade") === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                                {t === "fade" ? "✨ Fade" : "➡ Slide"}
                              </button>
                            ))}
                          </div>
                        </Field>
                      </div>
                    </SectionCard>
                    )}

                    {/* ── Video mode ── */}
                    {(settings.heroMode ?? "image") === "video" && (
                    <SectionCard title="🎬 Background Video — Desktop">
                      <Field label="YouTube or Vimeo URL" description="The video will autoplay muted and loop silently in the background.">
                        <Input value={settings.heroVideoUrl ?? ""} onChange={(e) => updateSettings(["heroVideoUrl"], e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                      </Field>
                      <Field label="Fallback Image" description="Shown on slow connections or if the video fails to load.">
                        <Input value={settings.heroVideoFallback ?? ""} onChange={(e) => updateSettings(["heroVideoFallback"], e.target.value)} placeholder="/images/hero.png or paste an image URL" />
                      </Field>
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-300">
                        <span className="shrink-0 mt-0.5">⚠</span>
                        <span>YouTube videos must be set to embeddable in YouTube Studio. For best results use a short, looping clip without audio.</span>
                      </div>
                    </SectionCard>
                    )}

                    <SectionCard title="✏️ Banner Text">
                      <Field label="Badge Text"><Input value={settings.hero.badge} onChange={(e) => updateSettings(["hero", "badge"], e.target.value)} /></Field>
                      <Field label="Main Title (first line)"><Input value={settings.hero.title} onChange={(e) => updateSettings(["hero", "title"], e.target.value)} /></Field>
                      <Field label="Title Italic (second line)"><Input value={settings.hero.titleItalic} onChange={(e) => updateSettings(["hero", "titleItalic"], e.target.value)} /></Field>
                      <RichTextEditor label="Description" value={settings.hero.description ?? ""} onChange={(html) => updateSettings(["hero", "description"], html)} minHeight={100} />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Button 1 Label"><Input value={settings.hero.button1} onChange={(e) => updateSettings(["hero", "button1"], e.target.value)} /></Field>
                        <Field label="Button 2 Label"><Input value={settings.hero.button2} onChange={(e) => updateSettings(["hero", "button2"], e.target.value)} /></Field>
                      </div>
                      <div className="border-t border-border pt-3 mt-2">
                        <p className="text-xs font-semibold text-foreground mb-3">Button Destinations</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label="Button 1 goes to"><Input value={settings.hero.button1Href ?? "/programs"} onChange={(e) => updateSettings(["hero", "button1Href"], e.target.value)} placeholder="/programs" /></Field>
                          <Field label="Button 2 goes to"><Input value={settings.hero.button2Href ?? "/vision"} onChange={(e) => updateSettings(["hero", "button2Href"], e.target.value)} placeholder="/vision" /></Field>
                        </div>
                      </div>
                    </SectionCard>

                    <SectionCard title="📊 Impact Stats (4 numbers)">
                      {settings.stats.map((stat, i) => (
                        <div key={i} className="grid sm:grid-cols-2 gap-4">
                          <Field label={`Stat ${i + 1} — Number`}><Input value={stat.number} onChange={(e) => { const s = [...settings.stats]; s[i] = { ...s[i], number: e.target.value }; updateSettings(["stats"], s); }} /></Field>
                          <Field label="Label"><Input value={stat.label} onChange={(e) => { const s = [...settings.stats]; s[i] = { ...s[i], label: e.target.value }; updateSettings(["stats"], s); }} /></Field>
                        </div>
                      ))}
                    </SectionCard>
                  </>
                ) : (
                  <>
                    <VisibilityToggleRow label="Show Hero on Mobile" description="Toggle to hide the hero banner entirely on phones." visKey="heroMobile" settings={settings} updateSettings={updateSettings} />

                    {/* ── Mobile Background Mode ── */}
                    <SectionCard title="🎬 Mobile Background Mode">
                      <div className="flex gap-2">
                        {([["image","🖼","Image","Single static photo"],["carousel","🎠","Carousel","Multiple images cycling"],["video","🎬","Video","YouTube / Vimeo URL"]] as const).map(([mode, emoji, label, desc]) => {
                          const active = (settings.heroMobileMode ?? "image") === mode;
                          return (
                            <button key={mode} onClick={() => updateSettings(["heroMobileMode"], mode)}
                              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                              <span className="text-lg leading-none">{emoji}</span>
                              <span>{label}</span>
                              <span className="text-[10px] font-normal opacity-70">{desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </SectionCard>

                    {/* ── Mobile Image mode ── */}
                    {(settings.heroMobileMode ?? "image") === "image" && (
                    <SectionCard title="🖼 Background Image — Portrait / Square">
                      <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl dark:bg-orange-950/20 dark:border-orange-800/40">
                        <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center dark:bg-orange-900/40"><span className="text-xs">📱</span></div>
                        <div>
                          <p className="text-xs font-bold text-foreground mb-0.5">Optimised for Portrait / Square Mobile Screens</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Recommended: <span className="font-semibold text-foreground">1080 × 1350 px</span> (4:5 portrait)<br />
                            Also works: 1:1 square (1080 × 1080) · Max 5 MB · JPG, PNG, WebP<br />
                            <span className="text-amber-600 font-medium">If blank, the desktop image is used on phones.</span>
                          </p>
                        </div>
                      </div>
                      {settings.heroImageMobile && (
                        <div className="relative rounded-xl overflow-hidden border border-border bg-muted max-w-[180px]" style={{ aspectRatio: "4/5" }}>
                          <img src={settings.heroImageMobile} alt="Mobile hero" className="w-full h-full object-cover" />
                          <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-destructive hover:bg-white transition-colors shadow" onClick={() => updateSettings(["heroImageMobile"], "")}><X size={13} /></button>
                        </div>
                      )}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            if (file.size > 5 * 1024 * 1024) { showFeedback("error", "File too large — max 5 MB"); return; }
                            const form = new FormData(); form.append("file", file);
                            try {
                              const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
                              const data = await res.json() as { url?: string; error?: string };
                              if (data.url) { updateSettings(["heroImageMobile"], data.url); showFeedback("success", "Mobile image uploaded! Save to apply."); }
                              else showFeedback("error", data.error ?? "Upload failed");
                            } catch { showFeedback("error", "Upload failed"); }
                          }} />
                        <span className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 hover:border-orange-400 rounded-xl py-4 text-sm text-muted-foreground hover:text-orange-600 transition-colors bg-orange-50/30 dark:border-orange-800/40 dark:bg-orange-950/10">
                          <Upload size={16} /> {settings.heroImageMobile ? "Replace Mobile Image" : "Upload Mobile Image"}
                        </span>
                      </label>
                      <p className="text-[11px] text-muted-foreground -mt-2">After uploading, click <span className="font-semibold">Save Changes</span> to publish.</p>
                    </SectionCard>
                    )}

                    {/* ── Mobile Carousel mode ── */}
                    {(settings.heroMobileMode ?? "image") === "carousel" && (
                    <SectionCard title="🎠 Carousel Images — Mobile">
                      <p className="text-xs text-muted-foreground">Add up to 6 portrait images (1080×1350 recommended). They cycle automatically at the set interval.</p>
                      <div className="space-y-2">
                        {(settings.heroMobileCarouselImages ?? []).map((imgUrl: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/20">
                            <img src={imgUrl} alt={`Mobile Slide ${i + 1}`} className="w-12 h-16 object-cover rounded-lg shrink-0 border border-border" style={{ aspectRatio: "4/5" }} />
                            <span className="text-xs flex-1 text-muted-foreground">Slide {i + 1}</span>
                            <button onClick={() => { const arr = [...(settings.heroMobileCarouselImages ?? [])]; arr.splice(i, 1); updateSettings(["heroMobileCarouselImages"], arr); }}
                              className="w-7 h-7 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors shrink-0">
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {(settings.heroMobileCarouselImages ?? []).length < 6 && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              if (file.size > 5 * 1024 * 1024) { showFeedback("error", "File too large — max 5 MB"); return; }
                              const formData = new FormData(); formData.append("file", file);
                              try {
                                const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
                                const data = await res.json() as { url?: string; error?: string };
                                if (data.url) { const arr = [...(settings.heroMobileCarouselImages ?? []), data.url]; updateSettings(["heroMobileCarouselImages"], arr); showFeedback("success", `Mobile Slide ${arr.length} added!`); }
                                else showFeedback("error", data.error ?? "Upload failed");
                              } catch { showFeedback("error", "Upload failed"); }
                            }} />
                          <span className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 hover:border-orange-400 rounded-xl py-4 text-sm text-muted-foreground hover:text-orange-600 transition-colors bg-orange-50/30 dark:border-orange-800/40 dark:bg-orange-950/10">
                            <Upload size={16} /> Add Mobile Slide {(settings.heroMobileCarouselImages ?? []).length + 1}
                          </span>
                        </label>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4 pt-1">
                        <Field label="Slide Duration (seconds)">
                          <Input type="number" min="2" max="30" value={settings.heroMobileCarouselInterval ?? 5} onChange={(e) => updateSettings(["heroMobileCarouselInterval"], Number(e.target.value))} />
                        </Field>
                        <Field label="Transition Style">
                          <div className="flex gap-2 mt-1">
                            {(["fade", "slide"] as const).map((t) => (
                              <button key={t} onClick={() => updateSettings(["heroMobileCarouselTransition"], t)}
                                className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${(settings.heroMobileCarouselTransition ?? "fade") === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                                {t === "fade" ? "✨ Fade" : "➡ Slide"}
                              </button>
                            ))}
                          </div>
                        </Field>
                      </div>
                    </SectionCard>
                    )}

                    {/* ── Mobile Video mode ── */}
                    {(settings.heroMobileMode ?? "image") === "video" && (
                    <SectionCard title="🎬 Background Video — Mobile">
                      <Field label="YouTube or Vimeo URL" description="The video will autoplay muted and loop in the background on mobile.">
                        <Input value={settings.heroMobileVideoUrl ?? ""} onChange={(e) => updateSettings(["heroMobileVideoUrl"], e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                      </Field>
                      <Field label="Fallback Image" description="Shown on slow connections or if the video fails to load.">
                        <Input value={settings.heroMobileVideoFallback ?? ""} onChange={(e) => updateSettings(["heroMobileVideoFallback"], e.target.value)} placeholder="/images/hero.png or paste an image URL" />
                      </Field>
                    </SectionCard>
                    )}

                    <SectionCard title="✏️ Mobile Banner Text">
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                        <input type="checkbox" id="useMobileText" checked={settings.hero.useMobileText ?? false}
                          onChange={(e) => updateSettings(["hero", "useMobileText"], e.target.checked)}
                          className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                        <label htmlFor="useMobileText" className="text-sm font-medium cursor-pointer select-none">Use different text on mobile (shorter, punchier)</label>
                      </div>
                      <div className={`grid gap-4 ${!settings.hero.useMobileText ? "opacity-50 pointer-events-none" : ""}`}>
                        <p className="text-xs text-muted-foreground">Leave any field blank to fall back to the desktop version.</p>
                        <Field label="Mobile Badge Text"><Input value={settings.hero.mobileBadge ?? ""} onChange={(e) => updateSettings(["hero", "mobileBadge"], e.target.value)} placeholder="Short badge for phones" /></Field>
                        <Field label="Mobile Main Title"><Input value={settings.hero.mobileTitle ?? ""} onChange={(e) => updateSettings(["hero", "mobileTitle"], e.target.value)} placeholder="Shorter title for phones" /></Field>
                        <Field label="Mobile Title Italic (second line)"><Input value={settings.hero.mobileTitleItalic ?? ""} onChange={(e) => updateSettings(["hero", "mobileTitleItalic"], e.target.value)} /></Field>
                        <RichTextEditor label="Mobile Description" value={settings.hero.mobileDescription ?? ""} onChange={(html) => updateSettings(["hero", "mobileDescription"], html)} minHeight={80} placeholder="Shorter description for mobile screens." />
                      </div>
                    </SectionCard>

                    <SectionCard title="📐 Mobile Layout Options">
                      <Field label="Text Alignment on Mobile" description="Controls how the hero text is aligned on phones.">
                        <div className="flex gap-2 mt-1">
                          {(["center", "left"] as const).map((align) => (
                            <button key={align} onClick={() => updateSettings(["hero", "mobileTextAlign"], align)}
                              className={`flex-1 py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${(settings.hero.mobileTextAlign ?? "center") === align ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                              {align === "center" ? "⬛ Centre" : "⬜ Left"}
                            </button>
                          ))}
                        </div>
                      </Field>
                      <Field label="Button Layout on Mobile" description="How the two CTA buttons are arranged on phones.">
                        <div className="flex gap-2 mt-1">
                          {(["stacked", "row"] as const).map((layout) => (
                            <button key={layout} onClick={() => updateSettings(["hero", "mobileButtonLayout"], layout)}
                              className={`flex-1 py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${(settings.hero.mobileButtonLayout ?? "stacked") === layout ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                              {layout === "stacked" ? "↕ Stacked" : "↔ Side by Side"}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </SectionCard>

                    <SectionCard title="📊 Mobile Stats Override">
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                        <input type="checkbox" id="useMobileStats" checked={settings.useMobileStats ?? false}
                          onChange={(e) => updateSettings(["useMobileStats"], e.target.checked)}
                          className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                        <label htmlFor="useMobileStats" className="text-sm font-medium cursor-pointer select-none">Use different stats on mobile</label>
                      </div>
                      <div className={`grid gap-4 ${!settings.useMobileStats ? "opacity-50 pointer-events-none" : ""}`}>
                        <p className="text-xs text-muted-foreground">Leave a number blank to fall back to the desktop version.</p>
                        {(settings.mobileStats ?? settings.stats.map((s) => ({ number: s.number, label: s.label }))).map((stat, i) => (
                          <div key={i} className="grid sm:grid-cols-2 gap-4">
                            <Field label={`Mobile Stat ${i + 1} — Number`}><Input value={stat.number ?? ""} onChange={(e) => {
                              const arr = [...(settings.mobileStats ?? settings.stats.map((s) => ({ number: s.number, label: s.label })))];
                              arr[i] = { ...arr[i], number: e.target.value }; updateSettings(["mobileStats"], arr);
                            }} /></Field>
                            <Field label="Label"><Input value={stat.label ?? ""} onChange={(e) => {
                              const arr = [...(settings.mobileStats ?? settings.stats.map((s) => ({ number: s.number, label: s.label })))];
                              arr[i] = { ...arr[i], label: e.target.value }; updateSettings(["mobileStats"], arr);
                            }} /></Field>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </>
                )}
              </DeviceTabs>

              <div className="flex justify-end mt-4">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
              </div>
            </div>
  );
}
