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

export default function GetInvolvedTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Get Involved / Volunteer</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage the <a href="/get-involved" target="_blank" className="underline text-primary">/get-involved</a> (volunteer) page</p>
                </div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Changes</>}</Button>
              </div>
              <SectionCard title="Page Hero">
                <DeviceTabs>
                  {(view) => view === "desktop" ? (
                    <div className="grid gap-4">
                      <Field label="Page Heading"><Input value={settings.volunteerPage?.heading ?? ""} onChange={(e) => updateSettings(["volunteerPage", "heading"], e.target.value)} placeholder="Don't just care — show up." /></Field>
                      <RichTextEditor label="Subheading" value={settings.volunteerPage?.subheading ?? ""} onChange={(html) => updateSettings(["volunteerPage", "subheading"], html)} minHeight={70} placeholder="Fill in the form and we'll reach out within 2–3 days." />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <p className="text-xs text-muted-foreground -mt-2">Leave blank to use the desktop version.</p>
                      <Field label="Heading (Mobile)"><Input value={settings.volunteerPage?.headingMobile ?? ""} onChange={(e) => updateSettings(["volunteerPage", "headingMobile"], e.target.value)} placeholder="Same as desktop if empty" /></Field>
                      <RichTextEditor label="Subheading (Mobile)" value={settings.volunteerPage?.subheadingMobile ?? ""} onChange={(html) => updateSettings(["volunteerPage", "subheadingMobile"], html)} minHeight={60} placeholder="Same as desktop if empty" />
                    </div>
                  )}
                </DeviceTabs>
              </SectionCard>
              <SectionCard title="Intro Bar Text">
                <DeviceTabs>
                  {(view) => view === "desktop" ? (
                    <RichTextEditor label="Intro Text" value={settings.volunteerPage?.intro ?? ""} onChange={(html) => updateSettings(["volunteerPage", "intro"], html)} minHeight={80} placeholder="Join 300+ volunteers every week. One event or ongoing — every hour counts. Doctors, lawyers, teachers, coders — we have a place for everyone." />
                  ) : (
                    <RichTextEditor label="Intro Text (Mobile)" value={settings.volunteerPage?.introMobile ?? ""} onChange={(html) => updateSettings(["volunteerPage", "introMobile"], html)} minHeight={70} placeholder="Leave empty to use desktop version" />
                  )}
                </DeviceTabs>
              </SectionCard>
              <SectionCard title="Homepage — Get Involved Section">
                <p className="text-xs text-muted-foreground -mt-2 mb-2">Controls the Get Involved block on the homepage.</p>
                <Field label="Section Title"><Input value={settings.getInvolved.title} onChange={(e) => updateSettings(["getInvolved", "title"], e.target.value)} /></Field>
                <RichTextEditor label="Section Subtitle" value={settings.getInvolved.subtitle ?? ""} onChange={(html) => updateSettings(["getInvolved", "subtitle"], html)} minHeight={80} />
              </SectionCard>
              <div className="flex justify-end mt-6">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Draft</>}</Button>
              </div>
            </div>
  );
}
