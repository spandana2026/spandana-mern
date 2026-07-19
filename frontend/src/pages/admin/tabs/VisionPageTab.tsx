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

export default function VisionPageTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Vision Page</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Controls the hero & CTA on <a href="/vision" target="_blank" className="underline text-primary hover:opacity-80">/vision</a>. Vision & Mission text is managed in the <button className="underline text-primary hover:opacity-80" onClick={() => (window as Window & { __spandanaSetTab?: (tab: string) => void }).__spandanaSetTab?.("vision")}>Vision & Mission tab</button>.
                  </p>
                </div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Changes</>}
                </Button>
              </div>
              <SectionCard title="Page Hero">
                <Field label="Badge Text"><Input value={settings.visionPage?.badge ?? ""} onChange={(e) => updateSettings(["visionPage", "badge"], e.target.value)} placeholder="Vision & Mission" /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Hero Heading (line 1)"><Input value={settings.visionPage?.heroHeading ?? ""} onChange={(e) => updateSettings(["visionPage", "heroHeading"], e.target.value)} placeholder="The purpose that" /></Field>
                  <Field label="Hero Heading (italic line 2)"><Input value={settings.visionPage?.heroSub ?? ""} onChange={(e) => updateSettings(["visionPage", "heroSub"], e.target.value)} placeholder="drives everything we do." /></Field>
                </div>
              </SectionCard>
              <SectionCard title="Call-to-Action Section" defaultOpen={false}>
                <Field label="CTA Heading"><Input value={settings.visionPage?.ctaHeading ?? ""} onChange={(e) => updateSettings(["visionPage", "ctaHeading"], e.target.value)} placeholder="Ready to be part of the change?" /></Field>
                <RichTextEditor label="CTA Description" value={settings.visionPage?.ctaDesc ?? ""} onChange={(html) => updateSettings(["visionPage", "ctaDesc"], html)} minHeight={70} placeholder="Join Spandana's mission…" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Button 1 Label"><Input value={settings.visionPage?.ctaButton1 ?? ""} onChange={(e) => updateSettings(["visionPage", "ctaButton1"], e.target.value)} placeholder="Get Involved" /></Field>
                  <Field label="Button 2 Label"><Input value={settings.visionPage?.ctaButton2 ?? ""} onChange={(e) => updateSettings(["visionPage", "ctaButton2"], e.target.value)} placeholder="Donate Now" /></Field>
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
