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

export default function TimelineTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-2xl font-serif font-bold">Timeline</h2><p className="text-sm text-muted-foreground mt-1">25-year journey milestones shown on the homepage</p></div>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-full gap-2" onClick={() => { const arr = [...(settings.timeline ?? [])]; arr.push({ year: "", title: "", desc: "", highlight: false }); updateSettings(["timeline"], arr); }}><Plus size={14} />Add Milestone</Button>
                  <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save</>}</Button>
                </div>
              </div>
              <VisibilityBanner label="Timeline Section" visKey="timeline" settings={settings} updateSettings={updateSettings} description="The journey milestones section on the homepage." />
              {(settings.timeline ?? []).map((m: { year: string; title: string; desc: string; highlight?: boolean }, i: number) => (
                <SectionCard key={i} title={`${m.year || "Year"} — ${m.title || "Milestone"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium"><input type="checkbox" checked={!!m.highlight} onChange={(e) => { const arr = [...(settings.timeline ?? [])]; arr[i] = { ...arr[i], highlight: e.target.checked }; updateSettings(["timeline"], arr); }} className="w-4 h-4 rounded" /> Highlight (shows larger)</label>
                    <button onClick={() => { const arr = [...(settings.timeline ?? [])]; arr.splice(i, 1); updateSettings(["timeline"], arr); }} className="text-destructive hover:text-destructive/80 text-xs flex items-center gap-1"><Trash2 size={13} /> Remove</button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Year"><Input value={m.year} onChange={(e) => { const arr = [...(settings.timeline ?? [])]; arr[i] = { ...arr[i], year: e.target.value }; updateSettings(["timeline"], arr); }} placeholder="1999" /></Field>
                    <div className="sm:col-span-2"><Field label="Title"><Input value={m.title} onChange={(e) => { const arr = [...(settings.timeline ?? [])]; arr[i] = { ...arr[i], title: e.target.value }; updateSettings(["timeline"], arr); }} placeholder="Founded" /></Field></div>
                  </div>
                  <RichTextEditor label="Description" value={m.desc ?? ""} onChange={(html) => { const arr = [...(settings.timeline ?? [])]; arr[i] = { ...arr[i], desc: html }; updateSettings(["timeline"], arr); }} minHeight={80} placeholder="What happened this year…" />
                </SectionCard>
              ))}
              <div className="flex justify-end mt-4"><Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button></div>
            </div>
  );
}
