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

export default function SuccessStoriesTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-2xl font-serif font-bold">Success Stories</h2><p className="text-sm text-muted-foreground mt-1">Image + story cards shown after Vision & Mission</p></div>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-full gap-2" onClick={() => { const arr = [...(settings.successStories ?? [])]; arr.push({ title: "", story: "", name: "", location: "", program: "", image: "" }); updateSettings(["successStories"], arr); }}><Plus size={14} />Add Story</Button>
                  <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save</>}</Button>
                </div>
              </div>
              <VisibilityBanner label="Vision & Mission Block" visKey="visionMission" settings={settings} updateSettings={updateSettings} description="Success stories live inside the Vision & Mission block — toggling hides the whole block." />
              {(settings.successStories ?? []).map((s: { title: string; story: string; name: string; location: string; program: string; image: string }, i: number) => (
                <SectionCard key={i} title={`Story ${i + 1}${s.title ? ` — ${s.title}` : ""}`}>
                  <div className="flex justify-end mb-2">
                    <button onClick={() => { const arr = [...(settings.successStories ?? [])]; arr.splice(i, 1); updateSettings(["successStories"], arr); }} className="text-destructive hover:text-destructive/80 text-xs flex items-center gap-1"><Trash2 size={13} /> Remove</button>
                  </div>
                  <Field label="Story Title"><Input value={s.title} onChange={(e) => { const arr = [...(settings.successStories ?? [])]; arr[i] = { ...arr[i], title: e.target.value }; updateSettings(["successStories"], arr); }} placeholder="From Struggle to Strength" /></Field>
                  <RichTextEditor label="Story Text" value={s.story ?? ""} onChange={(html) => { const arr = [...(settings.successStories ?? [])]; arr[i] = { ...arr[i], story: html }; updateSettings(["successStories"], arr); }} minHeight={110} placeholder="The full story…" />
                  <Field label="Image URL"><Input value={s.image} onChange={(e) => { const arr = [...(settings.successStories ?? [])]; arr[i] = { ...arr[i], image: e.target.value }; updateSettings(["successStories"], arr); }} placeholder="/images/hero.png or https://…" /></Field>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Person Name"><Input value={s.name} onChange={(e) => { const arr = [...(settings.successStories ?? [])]; arr[i] = { ...arr[i], name: e.target.value }; updateSettings(["successStories"], arr); }} placeholder="Meena Devi" /></Field>
                    <Field label="Location"><Input value={s.location} onChange={(e) => { const arr = [...(settings.successStories ?? [])]; arr[i] = { ...arr[i], location: e.target.value }; updateSettings(["successStories"], arr); }} placeholder="Secunderabad" /></Field>
                    <Field label="Program"><Input value={s.program} onChange={(e) => { const arr = [...(settings.successStories ?? [])]; arr[i] = { ...arr[i], program: e.target.value }; updateSettings(["successStories"], arr); }} placeholder="Skill Development" /></Field>
                  </div>
                </SectionCard>
              ))}
              <div className="flex justify-end mt-4"><Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button></div>
            </div>
  );
}
