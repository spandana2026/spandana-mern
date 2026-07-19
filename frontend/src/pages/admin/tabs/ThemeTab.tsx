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

const colorInputValue = (value: string | undefined, fallback: string) =>
  /^#[0-9a-f]{6}$/i.test(value ?? "") ? value! : fallback;

interface Props {
  settings: SiteSettings;
  updateSettings: (path: (string | number)[], val: unknown) => void;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  token: string;
  saving: boolean;
  onSave: () => void;
  showFeedback: (type: "success" | "error", msg: string) => void;
}

export default function ThemeTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-2xl font-serif font-bold">Theme & Fonts</h2><p className="text-sm text-muted-foreground mt-1">Brand colour, heading font, and body font</p></div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
              </div>
              <SectionCard title="Brand Colour">
                <Field label="Primary Colour">
                  <div className="flex items-center gap-3">
                    <input type="color" value={colorInputValue(settings.theme?.primaryColor, "#0033A0")}
                      onChange={(e) => updateSettings(["theme", "primaryColor"], e.target.value)}
                      className="w-12 h-10 rounded-xl border border-border cursor-pointer p-0.5 shrink-0" />
                    <Input value={settings.theme?.primaryColor ?? "#0033A0"}
                      onChange={(e) => updateSettings(["theme", "primaryColor"], e.target.value)}
                      placeholder="#0033A0" className="flex-1 font-mono" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Controls all buttons, icons, accents, and highlights. Changes apply after saving and refreshing.</p>
                </Field>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {["#0033A0","#1A56DB","#D97706","#059669","#7C3AED","#DC2626","#0891B2","#374151"].map((c) => (
                    <button key={c} onClick={() => updateSettings(["theme", "primaryColor"], c)}
                      className="w-full h-9 rounded-xl border-2 transition-all hover:scale-105"
                      style={{ backgroundColor: c, borderColor: settings.theme?.primaryColor === c ? "hsl(var(--foreground))" : "transparent" }}
                      title={c} />
                  ))}
                </div>
                <Field label="Body Text Colour" description="Controls heading and body text color across the site">
                  <div className="flex items-center gap-3 mt-2">
                    <input type="color" value={colorInputValue(settings.theme?.textColor, "#111827")}
                      onChange={(e) => updateSettings(["theme", "textColor"], e.target.value)}
                      className="w-12 h-10 rounded-xl border border-border cursor-pointer p-0.5 shrink-0" />
                    <Input value={settings.theme?.textColor ?? "#111827"}
                      onChange={(e) => updateSettings(["theme", "textColor"], e.target.value)}
                      placeholder="#111827" className="flex-1 font-mono" />
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {["#111827","#1F2937","#374151","#6B7280","#1a1a2e","#2d1a00","#0a1f3d","#1a0d2e"].map((c) => (
                      <button key={c} onClick={() => updateSettings(["theme", "textColor"], c)}
                        className="w-full h-9 rounded-xl border-2 transition-all hover:scale-105"
                        style={{ backgroundColor: c, borderColor: settings.theme?.textColor === c ? "hsl(var(--foreground))" : "transparent" }}
                        title={c} />
                    ))}
                  </div>
                </Field>
              </SectionCard>
              <SectionCard title="Typography">
                <Field label="Heading Font (titles, serif)">
                  <select value={settings.theme?.headingFont ?? "Montserrat"}
                    onChange={(e) => updateSettings(["theme", "headingFont"], e.target.value)}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm">
                    {["Montserrat","Playfair Display","Raleway","Poppins","Merriweather","Lora","Georgia","DM Serif Display"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Body Font (paragraphs, UI text)">
                  <select value={settings.theme?.bodyFont ?? "Open Sans"}
                    onChange={(e) => updateSettings(["theme", "bodyFont"], e.target.value)}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm">
                    {["Open Sans","Inter","Roboto","Nunito","Lato","Source Sans Pro","Noto Sans","IBM Plex Sans"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Heading Weight">
                  <div className="grid grid-cols-4 gap-2">
                    {([["400","Regular"],["500","Medium"],["600","Semi-Bold"],["700","Bold"]] as const).map(([w, label]) => (
                      <button key={w} type="button"
                        onClick={() => updateSettings(["typography", "headingWeight"], w)}
                        className={`h-9 rounded-xl border text-xs font-semibold transition-all ${(settings.typography?.headingWeight ?? "700") === w ? "bg-primary text-white border-primary shadow-sm" : "border-border bg-background hover:border-primary/40"}`}
                        style={{ fontWeight: Number(w) }}>{label}</button>
                    ))}
                  </div>
                </Field>
                <Field label="Body Line Spacing">
                  <div className="grid grid-cols-4 gap-2">
                    {([["1.4","Tight"],["1.6","Normal"],["1.8","Relaxed"],["2.2","Double"]] as const).map(([val, label]) => (
                      <button key={val} type="button"
                        onClick={() => updateSettings(["typography", "lineSpacing"], val)}
                        className={`h-9 rounded-xl border text-xs font-semibold transition-all ${(settings.typography?.lineSpacing ?? "1.6") === val ? "bg-primary text-white border-primary shadow-sm" : "border-border bg-background hover:border-primary/40"}`}>{label}</button>
                    ))}
                  </div>
                </Field>
                <p className="text-xs text-muted-foreground">Font changes apply after saving and refreshing the page.</p>
              </SectionCard>
              <SectionCard title="Button Style">
                <Field label="Corner Radius">
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      ["0rem","Sharp","rounded-none"],
                      ["0.375rem","Default","rounded-md"],
                      ["0.75rem","Rounded","rounded-xl"],
                      ["9999px","Pill","rounded-full"],
                    ] as const).map(([val, label, cls]) => (
                      <button key={val} type="button"
                        onClick={() => updateSettings(["typography", "buttonRadius"], val)}
                        className={`h-10 border text-xs font-semibold transition-all ${cls} ${(settings.typography?.buttonRadius ?? "0.375rem") === val ? "bg-primary text-white border-primary shadow-sm" : "border-border bg-background hover:border-primary/40"}`}>{label}</button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Controls the corner rounding of all buttons and cards across the site.</p>
                </Field>
              </SectionCard>
              <SectionCard title="Page Background">
                <Field label="Background Colour" description="Sets the page background across the whole site">
                  <div className="flex items-center gap-3 mt-2">
                    <input type="color" value={colorInputValue(settings.theme?.pageBackground, "#ffffff")}
                      onChange={(e) => updateSettings(["theme", "pageBackground"], e.target.value)}
                      className="w-12 h-10 rounded-xl border border-border cursor-pointer p-0.5 shrink-0" />
                    <Input value={settings.theme?.pageBackground ?? "#ffffff"}
                      onChange={(e) => updateSettings(["theme", "pageBackground"], e.target.value)}
                      placeholder="#ffffff" className="flex-1 font-mono" />
                  </div>
                </Field>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {[
                    { hex: "#ffffff",  label: "Pure White"  },
                    { hex: "#FAFAF8",  label: "Paper White" },
                    { hex: "#FDF8F0",  label: "Warm Cream"  },
                    { hex: "#F3F4F6",  label: "Light Gray"  },
                    { hex: "#F1F5F9",  label: "Slate"       },
                    { hex: "#0F172A",  label: "Midnight"    },
                  ].map(({ hex, label }) => (
                    <button key={hex} onClick={() => updateSettings(["theme", "pageBackground"], hex)}
                      className="flex flex-col items-center gap-1.5 group"
                      title={label}>
                      <div className="w-full h-9 rounded-xl border-2 transition-all hover:scale-105"
                        style={{ backgroundColor: hex, borderColor: (settings.theme?.pageBackground ?? "#ffffff") === hex ? "hsl(var(--foreground))" : "#d1d5db" }} />
                      <span className="text-[9px] text-muted-foreground leading-none text-center">{label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Changes apply after saving and refreshing.</p>
              </SectionCard>
              <SectionCard title="Hero Layout">
                <Field label="Hero Text Position">
                  <div className="grid grid-cols-4 gap-2">
                    {([["left","← Left"],["center","Center"],["right","Right →"],["bottom","↓ Bottom"]] as [string,string][]).map(([pos, label]) => (
                      <button key={pos} type="button"
                        onClick={() => updateSettings(["heroLayout", "textPosition"], pos)}
                        className={`h-10 rounded-xl border text-xs font-semibold transition-all ${(settings.heroLayout?.textPosition ?? "left") === pos ? "bg-primary text-white border-primary shadow-sm" : "border-border bg-background hover:border-primary/40"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Controls where the headline and CTA buttons appear over the hero image.</p>
                </Field>
                <Field label="Hero Banner Height">
                  <div className="grid grid-cols-3 gap-2">
                    {([["normal","Normal (~80vh)"],["tall","Tall (~90vh)"],["full","Full Screen"]] as [string,string][]).map(([val, label]) => (
                      <button key={val} type="button"
                        onClick={() => updateSettings(["heroLayout", "height"], val)}
                        className={`h-10 rounded-xl border text-xs font-semibold transition-all ${(settings.heroLayout?.height ?? "normal") === val ? "bg-primary text-white border-primary shadow-sm" : "border-border bg-background hover:border-primary/40"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Text Padding — Top (vh units)">
                  <div className="flex items-center gap-4">
                    <input type="range" min={0} max={40} step={2}
                      value={settings.heroLayout?.paddingTop ?? 10}
                      onChange={(e) => updateSettings(["heroLayout", "paddingTop"], parseInt(e.target.value))}
                      className="flex-1 accent-primary h-2 cursor-pointer" />
                    <span className="text-sm font-mono font-bold text-primary w-12 text-right shrink-0">
                      {settings.heroLayout?.paddingTop ?? 10}vh
                    </span>
                  </div>
                </Field>
                <Field label="Text Padding — Bottom (vh units)">
                  <div className="flex items-center gap-4">
                    <input type="range" min={0} max={40} step={2}
                      value={settings.heroLayout?.paddingBottom ?? 10}
                      onChange={(e) => updateSettings(["heroLayout", "paddingBottom"], parseInt(e.target.value))}
                      className="flex-1 accent-primary h-2 cursor-pointer" />
                    <span className="text-sm font-mono font-bold text-primary w-12 text-right shrink-0">
                      {settings.heroLayout?.paddingBottom ?? 10}vh
                    </span>
                  </div>
                </Field>
                <Field label="Font Size Multiplier">
                  <div className="flex items-center gap-4">
                    <input type="range" min={0.7} max={1.5} step={0.05}
                      value={settings.heroLayout?.fontScale ?? 1}
                      onChange={(e) => updateSettings(["heroLayout", "fontScale"], parseFloat(e.target.value))}
                      className="flex-1 accent-primary h-2 cursor-pointer" />
                    <span className="text-sm font-mono font-bold text-primary w-12 text-right shrink-0">
                      {(settings.heroLayout?.fontScale ?? 1).toFixed(2)}×
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Scales the hero headline and subtitle text size.</p>
                </Field>
                <p className="text-xs text-muted-foreground">Hero layout changes apply after saving and refreshing the page.</p>
              </SectionCard>

              <SectionCard title="Responsive Preview">
                <p className="text-xs text-muted-foreground mb-3">See how your typography choices look at mobile vs desktop size.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Mobile preview */}
                  <div className="border border-border rounded-2xl overflow-hidden">
                    <div className="bg-muted/60 px-3 py-1.5 flex items-center gap-1.5 border-b border-border">
                      <div className="w-2 h-2 rounded-full bg-red-400" /><div className="w-2 h-2 rounded-full bg-amber-400" /><div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-[10px] text-muted-foreground ml-1">Mobile (390px)</span>
                    </div>
                    <div className="p-4 bg-background" style={{ fontFamily: `'${settings.theme?.bodyFont ?? "Open Sans"}', sans-serif` }}>
                      <h2 className="text-base mb-1" style={{ fontFamily: `'${settings.theme?.headingFont ?? "Montserrat"}', sans-serif`, fontWeight: Number(settings.typography?.headingWeight ?? 700) }}>Building Society through Social Architecture</h2>
                      <p className="text-xs text-muted-foreground" style={{ lineHeight: settings.typography?.lineSpacing ?? "1.6" }}>We uplift underserved families through a multi-dimensional approach centered on health, dignity, and economic independence.</p>
                      <div className="mt-3 flex gap-2">
                        <span className="px-3 py-1 bg-primary text-white text-xs font-medium" style={{ borderRadius: settings.typography?.buttonRadius ?? "0.375rem" }}>Donate Now</span>
                        <span className="px-3 py-1 border border-border text-xs font-medium" style={{ borderRadius: settings.typography?.buttonRadius ?? "0.375rem" }}>Learn More</span>
                      </div>
                    </div>
                  </div>
                  {/* Desktop preview */}
                  <div className="border border-border rounded-2xl overflow-hidden">
                    <div className="bg-muted/60 px-3 py-1.5 flex items-center gap-1.5 border-b border-border">
                      <div className="w-2 h-2 rounded-full bg-red-400" /><div className="w-2 h-2 rounded-full bg-amber-400" /><div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-[10px] text-muted-foreground ml-1">Desktop (1280px)</span>
                    </div>
                    <div className="p-4 bg-background" style={{ fontFamily: `'${settings.theme?.bodyFont ?? "Open Sans"}', sans-serif` }}>
                      <h2 className="text-xl mb-1.5" style={{ fontFamily: `'${settings.theme?.headingFont ?? "Montserrat"}', sans-serif`, fontWeight: Number(settings.typography?.headingWeight ?? 700) }}>Building Society through Social Architecture</h2>
                      <p className="text-sm text-muted-foreground" style={{ lineHeight: settings.typography?.lineSpacing ?? "1.6" }}>We uplift underserved families through a multi-dimensional approach centered on Physical and Mental Health, bridging the gap between resources and those in need.</p>
                      <div className="mt-3 flex gap-2">
                        <span className="px-4 py-1.5 bg-primary text-white text-sm font-medium" style={{ borderRadius: settings.typography?.buttonRadius ?? "0.375rem" }}>Donate Now</span>
                        <span className="px-4 py-1.5 border border-border text-sm font-medium" style={{ borderRadius: settings.typography?.buttonRadius ?? "0.375rem" }}>Learn More</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
              <div className="flex justify-end mt-4">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
              </div>
            </div>
  );
}
