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

export default function SaharaTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {

            const sp         = (settings.saharaPage ?? {}) as SaharaPageConfig;
            const hero       = (sp.hero       ?? {}) as Record<string, string>;
            const about      = (sp.about      ?? {}) as Record<string, string>;
            const stats      = (sp.stats      ?? []) as Array<{ number?: string; label?: string }>;
            const facilities = (sp.facilities ?? []) as Array<{ title?: string; desc?: string }>;
            const programs   = (sp.programs   ?? []) as Array<{ tag?: string; title?: string; desc?: string }>;
            const hours      = (sp.hours      ?? []) as Array<{ day?: string; time?: string }>;
            const contact    = (sp.contact    ?? {}) as Record<string, string>;
            const cta        = (sp.cta        ?? {}) as Record<string, string>;

            function setSahara(updater: (curr: SaharaPageConfig) => SaharaPageConfig) {
              setSettings((prev) => {
                if (!prev) return prev;
                const next = JSON.parse(JSON.stringify(prev));
                next.saharaPage = updater((next.saharaPage ?? {}) as SaharaPageConfig);
                return next as SiteSettings;
              });
            }
            function setHero(key: string, val: string)    { setSahara((p) => ({ ...p, hero:    { ...(p.hero    ?? {}), [key]: val } })); }
            function setAbout(key: string, val: string)   { setSahara((p) => ({ ...p, about:   { ...(p.about   ?? {}), [key]: val } })); }
            function setContact(key: string, val: string) { setSahara((p) => ({ ...p, contact: { ...(p.contact ?? {}), [key]: val } })); }
            function setCta(key: string, val: string)     { setSahara((p) => ({ ...p, cta:     { ...(p.cta     ?? {}), [key]: val } })); }

            return (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div><h2 className="text-2xl font-serif font-bold">Sahara Community Centers</h2><p className="text-sm text-muted-foreground mt-1">Edit every section of the Sahara Community Centers page</p></div>
                  <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
                </div>

                {/* Hero */}
                <SectionCard title="Hero Section">
                  <Field label="Badge Text"><Input value={hero.badge ?? ""} onChange={(e) => setHero("badge", e.target.value)} /></Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Title (first line)"><Input value={hero.title ?? ""} onChange={(e) => setHero("title", e.target.value)} /></Field>
                    <Field label="Title Italic (second line)"><Input value={hero.titleItalic ?? ""} onChange={(e) => setHero("titleItalic", e.target.value)} /></Field>
                  </div>
                  <RichTextEditor label="Description" value={hero.description ?? ""} onChange={(html) => setHero("description", html)} minHeight={90} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Button 1"><Input value={hero.button1 ?? ""} onChange={(e) => setHero("button1", e.target.value)} /></Field>
                    <Field label="Button 2"><Input value={hero.button2 ?? ""} onChange={(e) => setHero("button2", e.target.value)} /></Field>
                  </div>
                </SectionCard>

                {/* Stats */}
                <SectionCard title="Stats Strip (4 numbers)">
                  {stats.map((s, i: number) => (
                    <div key={i} className="grid sm:grid-cols-2 gap-4">
                      <Field label={`Stat ${i + 1} — Number`}><Input value={s.number ?? ""} onChange={(e) => { const a = JSON.parse(JSON.stringify(stats)); a[i].number = e.target.value; setSahara((p) => ({ ...p, stats: a })); }} /></Field>
                      <Field label="Label"><Input value={s.label ?? ""} onChange={(e) => { const a = JSON.parse(JSON.stringify(stats)); a[i].label = e.target.value; setSahara((p) => ({ ...p, stats: a })); }} /></Field>
                    </div>
                  ))}
                </SectionCard>

                {/* About */}
                <SectionCard title="About Section">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Heading"><Input value={about.heading ?? ""} onChange={(e) => setAbout("heading", e.target.value)} /></Field>
                    <Field label="Heading Italic"><Input value={about.headingItalic ?? ""} onChange={(e) => setAbout("headingItalic", e.target.value)} /></Field>
                  </div>
                  <RichTextEditor label="Paragraph 1" value={about.para1 ?? ""} onChange={(html) => setAbout("para1", html)} minHeight={100} />
                  <RichTextEditor label="Paragraph 2" value={about.para2 ?? ""} onChange={(html) => setAbout("para2", html)} minHeight={100} />
                </SectionCard>

                {/* Facilities */}
                <SectionCard title="Facilities (6 spaces)">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Section Heading"><Input value={sp.facilitiesSection?.heading ?? ""} onChange={(e) => setSahara((p) => ({ ...p, facilitiesSection: { ...p.facilitiesSection, heading: e.target.value } }))} /></Field>
                    <Field label="Heading Italic"><Input value={sp.facilitiesSection?.headingItalic ?? ""} onChange={(e) => setSahara((p) => ({ ...p, facilitiesSection: { ...p.facilitiesSection, headingItalic: e.target.value } }))} /></Field>
                  </div>
                  <RichTextEditor label="Sub-text" value={sp.facilitiesSection?.subtext ?? ""} onChange={(html) => setSahara((p) => ({ ...p, facilitiesSection: { ...p.facilitiesSection, subtext: html } }))} minHeight={70} />
                  <hr className="border-border" />
                  {facilities.map((f, i: number) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-4 grid gap-3">
                      <p className="text-xs font-semibold text-primary">Facility {i + 1}</p>
                      <Field label="Name"><Input value={f.title ?? ""} onChange={(e) => { const a = JSON.parse(JSON.stringify(facilities)); a[i].title = e.target.value; setSahara((p) => ({ ...p, facilities: a })); }} /></Field>
                      <RichTextEditor label="Description" value={f.desc ?? ""} onChange={(html) => { const a = JSON.parse(JSON.stringify(facilities)); a[i].desc = html; setSahara((p) => ({ ...p, facilities: a })); }} minHeight={70} />
                    </div>
                  ))}
                </SectionCard>

                {/* Programs */}
                <SectionCard title="Active Programs">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Section Heading"><Input value={sp.programsSection?.heading ?? ""} onChange={(e) => setSahara((p) => ({ ...p, programsSection: { ...p.programsSection, heading: e.target.value } }))} /></Field>
                    <Field label="Heading Italic"><Input value={sp.programsSection?.headingItalic ?? ""} onChange={(e) => setSahara((p) => ({ ...p, programsSection: { ...p.programsSection, headingItalic: e.target.value } }))} /></Field>
                  </div>
                  <RichTextEditor label="Sub-text" value={sp.programsSection?.subtext ?? ""} onChange={(html) => setSahara((p) => ({ ...p, programsSection: { ...p.programsSection, subtext: html } }))} minHeight={70} />
                  <hr className="border-border" />
                  <div className="flex justify-end mb-1">
                    <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => { const a = JSON.parse(JSON.stringify(programs)); a.push({ tag: "Community", title: "", desc: "" }); setSahara((p) => ({ ...p, programs: a })); }}><Plus size={12} />Add Program</Button>
                  </div>
                  {programs.map((pg, i: number) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-4 grid gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-primary">Program {i + 1}</p>
                        <button onClick={() => { const a = JSON.parse(JSON.stringify(programs)); a.splice(i, 1); setSahara((p) => ({ ...p, programs: a })); }} className="text-destructive text-xs flex items-center gap-1 hover:text-destructive/80"><Trash2 size={12} /> Remove</button>
                      </div>
                      <Field label="Tag / Category"><Input value={pg.tag ?? ""} onChange={(e) => { const a = JSON.parse(JSON.stringify(programs)); a[i].tag = e.target.value; setSahara((p) => ({ ...p, programs: a })); }} placeholder="Physical Health, Education…" /></Field>
                      <Field label="Program Title"><Input value={pg.title ?? ""} onChange={(e) => { const a = JSON.parse(JSON.stringify(programs)); a[i].title = e.target.value; setSahara((p) => ({ ...p, programs: a })); }} /></Field>
                      <RichTextEditor label="Description" value={pg.desc ?? ""} onChange={(html) => { const a = JSON.parse(JSON.stringify(programs)); a[i].desc = html; setSahara((p) => ({ ...p, programs: a })); }} minHeight={70} />
                    </div>
                  ))}
                </SectionCard>

                {/* Hours */}
                <SectionCard title="Opening Hours">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Visit Section Heading"><Input value={sp.visitSection?.heading ?? ""} onChange={(e) => setSahara((p) => ({ ...p, visitSection: { ...p.visitSection, heading: e.target.value } }))} /></Field>
                    <Field label="Heading Italic"><Input value={sp.visitSection?.headingItalic ?? ""} onChange={(e) => setSahara((p) => ({ ...p, visitSection: { ...p.visitSection, headingItalic: e.target.value } }))} /></Field>
                  </div>
                  <RichTextEditor label="Inclusive Note (footer of hours)" value={sp.visitSection?.inclusiveNote ?? ""} onChange={(html) => setSahara((p) => ({ ...p, visitSection: { ...p.visitSection, inclusiveNote: html } }))} minHeight={70} />
                  <hr className="border-border" />
                  {hours.map((h, i: number) => (
                    <div key={i} className="grid sm:grid-cols-2 gap-4">
                      <Field label={`Row ${i + 1} — Day`}><Input value={h.day ?? ""} onChange={(e) => { const a = JSON.parse(JSON.stringify(hours)); a[i].day = e.target.value; setSahara((p) => ({ ...p, hours: a })); }} placeholder="Monday – Friday" /></Field>
                      <Field label="Time"><Input value={h.time ?? ""} onChange={(e) => { const a = JSON.parse(JSON.stringify(hours)); a[i].time = e.target.value; setSahara((p) => ({ ...p, hours: a })); }} placeholder="8:00 AM – 8:00 PM" /></Field>
                    </div>
                  ))}
                </SectionCard>

                {/* Contact */}
                <SectionCard title="Contact & Address">
                  <RichTextEditor label="Address / Directions" value={contact.address ?? ""} onChange={(html) => setContact("address", html)} minHeight={70} placeholder="Full address or directions note" />
                  <Field label="Email"><Input type="email" value={contact.email ?? ""} onChange={(e) => setContact("email", e.target.value)} /></Field>
                </SectionCard>

                {/* CTA */}
                <SectionCard title="Call-to-Action Section">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Heading (first line)"><Input value={cta.title ?? ""} onChange={(e) => setCta("title", e.target.value)} /></Field>
                    <Field label="Heading Italic (second line)"><Input value={cta.titleItalic ?? ""} onChange={(e) => setCta("titleItalic", e.target.value)} /></Field>
                  </div>
                  <RichTextEditor label="Description" value={cta.description ?? ""} onChange={(html) => setCta("description", html)} minHeight={80} />
                </SectionCard>

                <div className="flex justify-end mt-4">
                  <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
                </div>
              </div>
            );
}
