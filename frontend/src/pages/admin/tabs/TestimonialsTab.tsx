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

export default function TestimonialsTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-2xl font-serif font-bold">Testimonials</h2><p className="text-sm text-muted-foreground mt-1">Real stories shown on the homepage</p></div>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-full gap-2" onClick={() => { const t = [...(settings.testimonials ?? [])]; t.push({ quote: "", name: "", location: "", program: "" }); updateSettings(["testimonials"], t); }}><Plus size={14} />Add Story</Button>
                  <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save</>}</Button>
                </div>
              </div>
              <VisibilityBanner label="Testimonials Section" visKey="testimonials" settings={settings} updateSettings={updateSettings} description="The rotating testimonial cards shown on the homepage." />
              {(settings.testimonials ?? []).map((t: { quote: string; name: string; location: string; program: string }, i: number) => (
                <SectionCard key={i} title={`Story ${i + 1}${t.name ? ` — ${t.name}` : ""}`}>
                  <div className="flex justify-end mb-2">
                    <button onClick={() => { const arr = [...(settings.testimonials ?? [])]; arr.splice(i, 1); updateSettings(["testimonials"], arr); }} className="text-destructive hover:text-destructive/80 text-xs flex items-center gap-1"><Trash2 size={13} /> Remove</button>
                  </div>
                  <RichTextEditor label="Quote / Story" value={t.quote ?? ""} onChange={(html) => { const arr = [...(settings.testimonials ?? [])]; arr[i] = { ...arr[i], quote: html }; updateSettings(["testimonials"], arr); }} minHeight={100} placeholder="Their story in their own words…" />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Name"><Input value={t.name} onChange={(e) => { const arr = [...(settings.testimonials ?? [])]; arr[i] = { ...arr[i], name: e.target.value }; updateSettings(["testimonials"], arr); }} placeholder="Lakshmi M." /></Field>
                    <Field label="Location"><Input value={t.location} onChange={(e) => { const arr = [...(settings.testimonials ?? [])]; arr[i] = { ...arr[i], location: e.target.value }; updateSettings(["testimonials"], arr); }} placeholder="Hyderabad" /></Field>
                    <Field label="Program"><Input value={t.program} onChange={(e) => { const arr = [...(settings.testimonials ?? [])]; arr[i] = { ...arr[i], program: e.target.value }; updateSettings(["testimonials"], arr); }} placeholder="Medical Aid" /></Field>
                  </div>
                </SectionCard>
              ))}
              <div className="flex justify-end mt-4"><Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button></div>
            </div>
  );
}
