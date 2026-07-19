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

export default function MentalHealthTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Mental Health</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage the <a href="/programs/mental-health" target="_blank" className="underline text-primary">/programs/mental-health</a> page</p>
                </div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Changes</>}</Button>
              </div>
              <SectionCard title="Hero Section">
                <DeviceTabs>
                  {(view) => view === "desktop" ? (
                    <div className="grid gap-4">
                      <Field label="Badge Text"><Input value={settings.mentalHealthHero?.badge ?? ""} onChange={(e) => updateSettings(["mentalHealthHero", "badge"], e.target.value)} placeholder="Mental Health" /></Field>
                      <RichTextEditor label="Heading" value={settings.mentalHealthHero?.heading ?? ""} onChange={(html) => updateSettings(["mentalHealthHero", "heading"], html)} minHeight={70} placeholder="Mind, Community & Safe Spaces" />
                      <RichTextEditor label="Subtitle" value={settings.mentalHealthHero?.subtitle ?? ""} onChange={(html) => updateSettings(["mentalHealthHero", "subtitle"], html)} minHeight={70} placeholder="Mental wellness is the foundation of a thriving community." />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <p className="text-xs text-muted-foreground -mt-2">Leave blank to use the desktop version.</p>
                      <RichTextEditor label="Heading (Mobile)" value={settings.mentalHealthHero?.headingMobile ?? ""} onChange={(html) => updateSettings(["mentalHealthHero", "headingMobile"], html)} minHeight={70} placeholder="Same as desktop if empty" />
                      <RichTextEditor label="Subtitle (Mobile)" value={settings.mentalHealthHero?.subtitleMobile ?? ""} onChange={(html) => updateSettings(["mentalHealthHero", "subtitleMobile"], html)} minHeight={70} placeholder="Same as desktop if empty" />
                    </div>
                  )}
                </DeviceTabs>
                <Field label="CTA Heading"><Input value={settings.mentalHealthHero?.ctaHeading ?? ""} onChange={(e) => updateSettings(["mentalHealthHero", "ctaHeading"], e.target.value)} placeholder="Support mental health programs" /></Field>
                <RichTextEditor label="CTA Subtext" value={settings.mentalHealthHero?.ctaSubtext ?? ""} onChange={(html) => updateSettings(["mentalHealthHero", "ctaSubtext"], html)} minHeight={60} placeholder="Your support helps us run self-help groups, counselling sessions, and crisis response." />
              </SectionCard>
              {([
                { idx: 0, label: "Awareness Campaigns", defaultHeading: "Breaking Stigma. Starting Conversations.", defaultDesc: "In many communities, mental health is still a taboo topic. Spandana's awareness campaigns meet people where they are: in schools, on streets, in community centres." },
                { idx: 1, label: "Educational Outreach", defaultHeading: "Teaching Communities to Recognise & Respond", defaultDesc: "Awareness alone is not enough — communities need tools to act. Our educational outreach programs teach ordinary people to identify signs of mental distress." },
                { idx: 2, label: "Self-Help Groups", defaultHeading: "The Power of Being Heard by Your Community", defaultDesc: "Healing happens in community. Spandana facilitates weekly self-help groups where members share experiences, offer mutual support, and build emotional resilience." },
                { idx: 3, label: "Counselling Access", defaultHeading: "Professional Care, Within Reach", defaultDesc: "For many of the families we serve, professional mental health support feels impossibly distant. Spandana bridges this gap by connecting families with trained counsellors." },
                { idx: 4, label: "Crisis Support", defaultHeading: "Safe Spaces When it Matters Most", defaultDesc: "Mental health crises do not wait for appointments. Spandana maintains a network of trained community responders and safe meeting spaces." },
              ] as Array<{ idx: number; label: string; defaultHeading: string; defaultDesc: string }>).map(({ idx, label, defaultHeading, defaultDesc }) => {
                const secs = settings.mentalHealthSections ?? [];
                const sec = (secs[idx] ?? {}) as { label?: string; heading?: string; desc?: string; descMobile?: string; bullets?: string[]; impact?: string };
                const updateSec = (field: string, val: unknown) => {
                  const arr: unknown[] = JSON.parse(JSON.stringify(secs.length ? secs : [{},{},{},{},{}]));
                  while (arr.length <= idx) arr.push({});
                  (arr[idx] as Record<string, unknown>) = { ...(arr[idx] as Record<string, unknown>), [field]: val };
                  updateSettings(["mentalHealthSections"], arr);
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
                        placeholder={"Street plays addressing mental health stigma\nCommunity rallies and awareness drives\nPartnerships with local schools"}
                      />
                    </Field>
                    <Field label="Impact Statement"><Input value={sec.impact ?? ""} onChange={(e) => updateSec("impact", e.target.value)} placeholder="Thousands of community members reached annually." /></Field>
                  </SectionCard>
                );
              })}
              <div className="flex justify-end mt-6">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Draft</>}</Button>
              </div>
            </div>
  );
}
