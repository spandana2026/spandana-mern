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

export default function StoriesPageTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Success Stories Page</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Controls the hero & CTA on <a href="/success-stories" target="_blank" className="underline text-primary hover:opacity-80">/success-stories</a>. Story cards are managed in the <button className="underline text-primary hover:opacity-80" onClick={() => (window as Window & { __spandanaSetTab?: (tab: string) => void }).__spandanaSetTab?.("successstories")}>Success Stories tab</button>.
                  </p>
                </div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Changes</>}
                </Button>
              </div>
              <SectionCard title="Page Hero">
                <Field label="Badge Text"><Input value={settings.successStoriesPage?.badge ?? ""} onChange={(e) => updateSettings(["successStoriesPage", "badge"], e.target.value)} placeholder="Success Stories" /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Hero Heading (line 1)"><Input value={settings.successStoriesPage?.heroHeading ?? ""} onChange={(e) => updateSettings(["successStoriesPage", "heroHeading"], e.target.value)} placeholder="Real people." /></Field>
                  <Field label="Hero Heading (italic line 2)"><Input value={settings.successStoriesPage?.heroSub ?? ""} onChange={(e) => updateSettings(["successStoriesPage", "heroSub"], e.target.value)} placeholder="Real change." /></Field>
                </div>
              </SectionCard>
              <SectionCard title="Call-to-Action Section" defaultOpen={false}>
                <Field label="CTA Heading"><Input value={settings.successStoriesPage?.ctaHeading ?? ""} onChange={(e) => updateSettings(["successStoriesPage", "ctaHeading"], e.target.value)} placeholder="Every story starts with a single step." /></Field>
                <RichTextEditor label="CTA Description" value={settings.successStoriesPage?.ctaDesc ?? ""} onChange={(html) => updateSettings(["successStoriesPage", "ctaDesc"], html)} minHeight={70} placeholder="Your support makes stories like these possible…" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Button 1 Label"><Input value={settings.successStoriesPage?.ctaButton1 ?? ""} onChange={(e) => updateSettings(["successStoriesPage", "ctaButton1"], e.target.value)} placeholder="Get Involved" /></Field>
                  <Field label="Button 2 Label"><Input value={settings.successStoriesPage?.ctaButton2 ?? ""} onChange={(e) => updateSettings(["successStoriesPage", "ctaButton2"], e.target.value)} placeholder="Donate Now" /></Field>
                </div>
              </SectionCard>
              <div className="flex justify-end mt-4">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Changes</>}
                </Button>
              </div>
            </div>
  );
}
