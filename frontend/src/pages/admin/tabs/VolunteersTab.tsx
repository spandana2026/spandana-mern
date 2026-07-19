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
import { SectionCard, Field, Label, DeviceTabs, VisibilityToggleRow, VisibilityBanner } from "./shared";
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

export default function VolunteersTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-2xl font-serif font-bold">Volunteer Spotlight</h2><p className="text-sm text-muted-foreground mt-1">Rotating volunteer profiles shown on the homepage</p></div>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-full gap-2" onClick={() => { const arr = [...(settings.volunteers ?? [])]; arr.push({ name: "", role: "", years: "", quote: "", hours: "", program: "" }); updateSettings(["volunteers"], arr); }}><Plus size={14} />Add Volunteer</Button>
                  <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save</>}</Button>
                </div>
              </div>
              <VisibilityBanner label="Volunteer Spotlight" visKey="volunteerSpotlight" settings={settings} updateSettings={updateSettings} description="The rotating volunteer profile cards shown on the homepage." />
              {(settings.volunteers ?? []).map((v: { name: string; role: string; years: string; quote: string; hours: string; program: string }, i: number) => (
                <SectionCard key={i} title={`${v.name || `Volunteer ${i + 1}`}${v.role ? ` — ${v.role}` : ""}`}>
                  <div className="flex justify-end mb-2">
                    <button onClick={() => { const arr = [...(settings.volunteers ?? [])]; arr.splice(i, 1); updateSettings(["volunteers"], arr); }} className="text-destructive hover:text-destructive/80 text-xs flex items-center gap-1"><Trash2 size={13} /> Remove</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Name"><Input value={v.name} onChange={(e) => { const arr = [...(settings.volunteers ?? [])]; arr[i] = { ...arr[i], name: e.target.value }; updateSettings(["volunteers"], arr); }} placeholder="Priya Reddy" /></Field>
                    <Field label="Role / Title"><Input value={v.role} onChange={(e) => { const arr = [...(settings.volunteers ?? [])]; arr[i] = { ...arr[i], role: e.target.value }; updateSettings(["volunteers"], arr); }} placeholder="Healthcare Volunteer" /></Field>
                    <Field label="Years Active"><Input value={v.years} onChange={(e) => { const arr = [...(settings.volunteers ?? [])]; arr[i] = { ...arr[i], years: e.target.value }; updateSettings(["volunteers"], arr); }} placeholder="3 years" /></Field>
                    <Field label="Hours Volunteered"><Input value={v.hours} onChange={(e) => { const arr = [...(settings.volunteers ?? [])]; arr[i] = { ...arr[i], hours: e.target.value }; updateSettings(["volunteers"], arr); }} placeholder="450+" /></Field>
                    <div className="sm:col-span-2"><Field label="Program"><Input value={v.program} onChange={(e) => { const arr = [...(settings.volunteers ?? [])]; arr[i] = { ...arr[i], program: e.target.value }; updateSettings(["volunteers"], arr); }} placeholder="Medical Aid" /></Field></div>
                  </div>
                  <RichTextEditor label="Quote" value={v.quote ?? ""} onChange={(html) => { const arr = [...(settings.volunteers ?? [])]; arr[i] = { ...arr[i], quote: html }; updateSettings(["volunteers"], arr); }} minHeight={90} placeholder="What volunteering means to them…" />
                </SectionCard>
              ))}
              <div className="flex justify-end mt-4"><Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button></div>
            </div>
  );
}
