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

export default function ProgramsTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div><h2 className="text-2xl font-serif font-bold">Programs Section</h2><p className="text-sm text-muted-foreground mt-1">Edit both health pillars and all program items</p></div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
              </div>

              <DeviceTabs>
                {(view) => view === "desktop" ? (
                  <>
                    <VisibilityToggleRow label="Show Programs on Desktop" description="The two health pillar cards shown on the homepage desktop view." visKey="programs" settings={settings} updateSettings={updateSettings} />

                    <SectionCard title="📝 Section Header">
                      <Field label="Section Title"><Input value={settings.programsSection.title} onChange={(e) => updateSettings(["programsSection", "title"], e.target.value)} /></Field>
                      <RichTextEditor label="Section Subtitle" value={settings.programsSection.subtitle ?? ""} onChange={(html) => updateSettings(["programsSection", "subtitle"], html)} minHeight={80} />
                    </SectionCard>
                  </>
                ) : (
                  <>
                    <VisibilityToggleRow label="Show Programs on Mobile" description="Toggle to hide the programs section on phone screens." visKey="programsMobile" settings={settings} updateSettings={updateSettings} />

                    <SectionCard title="✏️ Mobile Section Header">
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                        <input type="checkbox" id="useMobilePrograms" checked={settings.useMobilePrograms ?? false}
                          onChange={(e) => updateSettings(["useMobilePrograms"], e.target.checked)}
                          className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                        <label htmlFor="useMobilePrograms" className="text-sm font-medium cursor-pointer select-none">Use shorter header text on mobile</label>
                      </div>
                      <div className={`grid gap-4 ${!settings.useMobilePrograms ? "opacity-50 pointer-events-none" : ""}`}>
                        <p className="text-xs text-muted-foreground">Leave blank to fall back to the desktop text above.</p>
                        <Field label="Mobile Section Title"><Input value={settings.mobileProgramsTitle ?? ""} onChange={(e) => updateSettings(["mobileProgramsTitle"], e.target.value)} placeholder="Shorter title for phones" /></Field>
                        <RichTextEditor label="Mobile Section Subtitle" value={settings.mobileProgramsSubtitle ?? ""} onChange={(html) => updateSettings(["mobileProgramsSubtitle"], html)} minHeight={70} placeholder="Shorter subtitle for phones..." />
                      </div>
                    </SectionCard>
                  </>
                )}
              </DeviceTabs>
              <SectionCard title="Physical Health Pillar">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Pillar Label"><Input value={settings.programsSection.physical.label} onChange={(e) => updateSettings(["programsSection", "physical", "label"], e.target.value)} /></Field>
                  <Field label="Pillar Title"><Input value={settings.programsSection.physical.title} onChange={(e) => updateSettings(["programsSection", "physical", "title"], e.target.value)} /></Field>
                </div>
                <RichTextEditor label="Pillar Subtitle" value={settings.programsSection.physical.subtitle ?? ""} onChange={(html) => updateSettings(["programsSection", "physical", "subtitle"], html)} minHeight={70} />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2">Program Items</p>
                {settings.programsSection.physical.items.map((item, i) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-4 grid gap-3">
                    <p className="text-xs font-semibold text-primary">Item {i + 1}</p>
                    <Field label="Title"><Input value={item.title} onChange={(e) => updateProgramItem("physical", i, "title", e.target.value)} /></Field>
                    <RichTextEditor label="Description" value={item.desc ?? ""} onChange={(html) => updateProgramItem("physical", i, "desc", html)} minHeight={70} />
                  </div>
                ))}
              </SectionCard>
              <SectionCard title="Mental Health Pillar">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Pillar Label"><Input value={settings.programsSection.mental.label} onChange={(e) => updateSettings(["programsSection", "mental", "label"], e.target.value)} /></Field>
                  <Field label="Pillar Title"><Input value={settings.programsSection.mental.title} onChange={(e) => updateSettings(["programsSection", "mental", "title"], e.target.value)} /></Field>
                </div>
                <RichTextEditor label="Pillar Subtitle" value={settings.programsSection.mental.subtitle ?? ""} onChange={(html) => updateSettings(["programsSection", "mental", "subtitle"], html)} minHeight={70} />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2">Program Items</p>
                {settings.programsSection.mental.items.map((item, i) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-4 grid gap-3">
                    <p className="text-xs font-semibold text-purple-700">Item {i + 1}</p>
                    <Field label="Title"><Input value={item.title} onChange={(e) => updateProgramItem("mental", i, "title", e.target.value)} /></Field>
                    <RichTextEditor label="Description" value={item.desc ?? ""} onChange={(html) => updateProgramItem("mental", i, "desc", html)} minHeight={70} />
                  </div>
                ))}
              </SectionCard>
              <SectionCard title="Physical Health — Detail Page Subsections" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-2">Edit the tab label, heading, description, bullet points, and impact statement for each subsection on the Physical Health detail page.</p>
                {(settings.physicalHealthSections ?? []).map((s, i: number) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-4 grid gap-3">
                    <p className="text-xs font-semibold text-primary">Subsection {i + 1} — {s.label}</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Tab Label"><Input value={s.label ?? ""} onChange={(e) => { const arr = JSON.parse(JSON.stringify(settings.physicalHealthSections ?? [])); arr[i] = { ...arr[i], label: e.target.value }; updateSettings(["physicalHealthSections"], arr); }} /></Field>
                      <Field label="Section Heading"><Input value={s.heading ?? ""} onChange={(e) => { const arr = JSON.parse(JSON.stringify(settings.physicalHealthSections ?? [])); arr[i] = { ...arr[i], heading: e.target.value }; updateSettings(["physicalHealthSections"], arr); }} /></Field>
                    </div>
                    <RichTextEditor label="Description" value={s.desc ?? ""} onChange={(html) => { const arr = JSON.parse(JSON.stringify(settings.physicalHealthSections ?? [])); arr[i] = { ...arr[i], desc: html }; updateSettings(["physicalHealthSections"], arr); }} minHeight={90} />
                    <Field label="Bullet Points (one per line)"><Textarea value={(s.bullets ?? []).join("\n")} onChange={(e) => { const arr = JSON.parse(JSON.stringify(settings.physicalHealthSections ?? [])); arr[i] = { ...arr[i], bullets: e.target.value.split("\n") }; updateSettings(["physicalHealthSections"], arr); }} className="min-h-[100px] resize-none font-mono text-xs" /></Field>
                    <Field label="Impact Statement"><Input value={s.impact ?? ""} onChange={(e) => { const arr = JSON.parse(JSON.stringify(settings.physicalHealthSections ?? [])); arr[i] = { ...arr[i], impact: e.target.value }; updateSettings(["physicalHealthSections"], arr); }} /></Field>
                  </div>
                ))}
              </SectionCard>

              <SectionCard title="Mental Health — Detail Page Subsections" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-2">Edit the tab label, heading, description, bullet points, and impact statement for each subsection on the Mental Health detail page.</p>
                {(settings.mentalHealthSections ?? []).map((s, i: number) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-4 grid gap-3">
                    <p className="text-xs font-semibold text-purple-700">Subsection {i + 1} — {s.label}</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Tab Label"><Input value={s.label ?? ""} onChange={(e) => { const arr = JSON.parse(JSON.stringify(settings.mentalHealthSections ?? [])); arr[i] = { ...arr[i], label: e.target.value }; updateSettings(["mentalHealthSections"], arr); }} /></Field>
                      <Field label="Section Heading"><Input value={s.heading ?? ""} onChange={(e) => { const arr = JSON.parse(JSON.stringify(settings.mentalHealthSections ?? [])); arr[i] = { ...arr[i], heading: e.target.value }; updateSettings(["mentalHealthSections"], arr); }} /></Field>
                    </div>
                    <RichTextEditor label="Description" value={s.desc ?? ""} onChange={(html) => { const arr = JSON.parse(JSON.stringify(settings.mentalHealthSections ?? [])); arr[i] = { ...arr[i], desc: html }; updateSettings(["mentalHealthSections"], arr); }} minHeight={90} />
                    <Field label="Bullet Points (one per line)"><Textarea value={(s.bullets ?? []).join("\n")} onChange={(e) => { const arr = JSON.parse(JSON.stringify(settings.mentalHealthSections ?? [])); arr[i] = { ...arr[i], bullets: e.target.value.split("\n") }; updateSettings(["mentalHealthSections"], arr); }} className="min-h-[100px] resize-none font-mono text-xs" /></Field>
                    <Field label="Impact Statement"><Input value={s.impact ?? ""} onChange={(e) => { const arr = JSON.parse(JSON.stringify(settings.mentalHealthSections ?? [])); arr[i] = { ...arr[i], impact: e.target.value }; updateSettings(["mentalHealthSections"], arr); }} /></Field>
                  </div>
                ))}
              </SectionCard>

              <div className="flex justify-end mt-4">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
              </div>
            </div>
  );
}
