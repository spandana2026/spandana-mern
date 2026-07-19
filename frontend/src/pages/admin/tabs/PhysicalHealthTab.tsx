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

export default function PhysicalHealthTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Physical Health</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage the <a href="/programs/physical-health" target="_blank" className="underline text-primary">/programs/physical-health</a> page</p>
                </div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Changes</>}</Button>
              </div>
              <SectionCard title="Hero Section">
                <DeviceTabs>
                  {(view) => view === "desktop" ? (
                    <div className="grid gap-4">
                      <Field label="Badge Text"><Input value={settings.physicalHealthHero?.badge ?? ""} onChange={(e) => updateSettings(["physicalHealthHero", "badge"], e.target.value)} placeholder="Physical Health" /></Field>
                      <RichTextEditor label="Heading" value={settings.physicalHealthHero?.heading ?? ""} onChange={(html) => updateSettings(["physicalHealthHero", "heading"], html)} minHeight={70} placeholder="Body, Skills & Economic Empowerment" />
                      <RichTextEditor label="Subtitle" value={settings.physicalHealthHero?.subtitle ?? ""} onChange={(html) => updateSettings(["physicalHealthHero", "subtitle"], html)} minHeight={70} placeholder="Holistic physical wellbeing alongside skills that build lasting economic independence." />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <p className="text-xs text-muted-foreground -mt-2">Leave blank to use the desktop version.</p>
                      <RichTextEditor label="Heading (Mobile)" value={settings.physicalHealthHero?.headingMobile ?? ""} onChange={(html) => updateSettings(["physicalHealthHero", "headingMobile"], html)} minHeight={70} placeholder="Same as desktop if empty" />
                      <RichTextEditor label="Subtitle (Mobile)" value={settings.physicalHealthHero?.subtitleMobile ?? ""} onChange={(html) => updateSettings(["physicalHealthHero", "subtitleMobile"], html)} minHeight={70} placeholder="Same as desktop if empty" />
                    </div>
                  )}
                </DeviceTabs>
                <Field label="CTA Heading"><Input value={settings.physicalHealthHero?.ctaHeading ?? ""} onChange={(e) => updateSettings(["physicalHealthHero", "ctaHeading"], e.target.value)} placeholder="Support physical health programs" /></Field>
                <RichTextEditor label="CTA Subtext" value={settings.physicalHealthHero?.ctaSubtext ?? ""} onChange={(html) => updateSettings(["physicalHealthHero", "ctaSubtext"], html)} minHeight={60} placeholder="Your contribution directly funds medical camps, vocational training, and more." />
              </SectionCard>
              {([
                { idx: 0, label: "Medical Aid", defaultHeading: "Free Healthcare for Every Family", defaultDesc: "Access to quality healthcare is not a privilege — it is a right. Spandana organises large-scale free medical camps providing check-ups, diagnostics, medicines, and specialist referrals." },
                { idx: 1, label: "Skill Development", defaultHeading: "Building Livelihoods Through Training", defaultDesc: "Unemployment and underemployment trap families in cycles of poverty. Spandana's vocational training centres equip individuals with practical, market-relevant skills." },
                { idx: 2, label: "Entrepreneur Initiatives", defaultHeading: "Micro-Enterprise & Peer Support", defaultDesc: "Economic independence comes not just from jobs but from ownership. Through self-help groups and seed capital support, we help low-income families start small businesses." },
                { idx: 3, label: "Legal Advocacy", defaultHeading: "Know Your Rights. Claim Your Rights.", defaultDesc: "Many underserved families face legal challenges — land disputes, domestic violence cases, labour exploitation. Spandana bridges the gap between the law and the community." },
                { idx: 4, label: "Environmental Stewardship", defaultHeading: "Sustainable Living for Healthier Communities", defaultDesc: "Environmental degradation disproportionately harms the communities we serve. Spandana integrates ecological awareness into all programs." },
              ] as Array<{ idx: number; label: string; defaultHeading: string; defaultDesc: string }>).map(({ idx, label, defaultHeading, defaultDesc }) => {
                const secs = settings.physicalHealthSections ?? [];
                const sec = (secs[idx] ?? {}) as { label?: string; heading?: string; desc?: string; descMobile?: string; bullets?: string[]; impact?: string };
                const updateSec = (field: string, val: unknown) => {
                  const arr: unknown[] = JSON.parse(JSON.stringify(secs.length ? secs : [{},{},{},{},{}]));
                  while (arr.length <= idx) arr.push({});
                  (arr[idx] as Record<string, unknown>) = { ...(arr[idx] as Record<string, unknown>), [field]: val };
                  updateSettings(["physicalHealthSections"], arr);
                };
                return (
                  <SectionCard key={idx} title={`Section ${idx + 1}: ${label}`} defaultOpen={false}>
                    <Field label="Tab Label"><Input value={sec.label ?? ""} onChange={(e) => updateSec("label", e.target.value)} placeholder={label} /></Field>
                    <Field label="Section Heading"><Input value={sec.heading ?? ""} onChange={(e) => updateSec("heading", e.target.value)} placeholder={defaultHeading} /></Field>
                    <DeviceTabs>
                      {(view) => view === "desktop" ? (
                        <RichTextEditor label="Description" value={sec.desc ?? ""} onChange={(html) => updateSec("desc", html)} minHeight={100} placeholder={defaultDesc} />
                      ) : (
                        <div className="grid gap-2">
                          <p className="text-xs text-muted-foreground">Shorter text for mobile. Leave blank to use desktop version.</p>
                          <RichTextEditor label="Description (Mobile)" value={sec.descMobile ?? ""} onChange={(html) => updateSec("descMobile", html)} minHeight={80} placeholder="Leave empty to use desktop description" />
                        </div>
                      )}
                    </DeviceTabs>
                    <Field label="Bullet Points (one per line)">
                      <Textarea
                        value={(Array.isArray(sec.bullets) ? sec.bullets : []).join("\n")}
                        onChange={(e) => updateSec("bullets", e.target.value.split("\n"))}
                        className="min-h-[120px] resize-none font-mono text-xs"
                        placeholder={"Free medical camps with multi-speciality doctors\nPreventative screenings\nFree medicines and follow-up care"}
                      />
                    </Field>
                    <Field label="Impact Statement"><Input value={sec.impact ?? ""} onChange={(e) => updateSec("impact", e.target.value)} placeholder="Thousands of consultations delivered annually." /></Field>
                  </SectionCard>
                );
              })}
              <div className="flex justify-end mt-6">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Draft</>}</Button>
              </div>
            </div>
  );
}
