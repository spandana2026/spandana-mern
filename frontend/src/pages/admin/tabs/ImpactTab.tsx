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

export default function ImpactTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {

            const ip = settings.impactSection ?? {} as NonNullable<SiteSettings["impactSection"]>;
            const tiers: Array<{ label: string; title: string; desc: string; tag: string; color: string }> = ip.tiers ?? [];

            function setImpact(updater: (curr: Record<string, unknown>) => Record<string, unknown>) {
              setSettings((prev) => {
                if (!prev) return prev;
                const curr: Record<string, unknown> = prev.impactSection ?? {};
                return { ...prev, impactSection: updater(curr) as SiteSettings["impactSection"] };
              });
            }

            return (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div><h2 className="text-2xl font-serif font-bold">Your Impact</h2><p className="text-sm text-muted-foreground mt-1">Donation tiers and messaging shown on the homepage</p></div>
                  <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save</>}</Button>
                </div>
                <VisibilityBanner label="Impact Calculator" visKey="impactCalculator" settings={settings} updateSettings={updateSettings} description="The donation impact calculator shown on the homepage." />
                <SectionCard title="Section Heading & Text">
                  <Field label="Heading (main)">
                    <Input value={ip.heading ?? "See what your donation"} onChange={(e) => setImpact((p) => ({ ...p, heading: e.target.value }))} placeholder="See what your donation" />
                  </Field>
                  <Field label="Heading Italic (second part)">
                    <Input value={ip.headingItalic ?? "actually does."} onChange={(e) => setImpact((p) => ({ ...p, headingItalic: e.target.value }))} placeholder="actually does." />
                  </Field>
                  <Field label="Subtitle / Description">
                    <Input value={ip.subtitle ?? "Every rupee goes directly to the ground. Pick an amount below."} onChange={(e) => setImpact((p) => ({ ...p, subtitle: e.target.value }))} placeholder="Every rupee goes directly to the ground…" />
                  </Field>
                  <RichTextEditor label="Small Note (shown at the bottom)" value={ip.note ?? "100% of your donation goes to the programs. Spandana Care Aid Foundation is a registered nonprofit."} onChange={(html) => setImpact((p) => ({ ...p, note: html }))} minHeight={60} placeholder="Trust / transparency note…" />
                </SectionCard>

                <div className="flex items-center gap-3 px-4 py-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl mt-2">
                  <DollarSign size={16} className="text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Programs synced from Donate page</p>
                    <p className="text-xs text-blue-700/80 dark:text-blue-300/70 mt-0.5">
                      The 5 programs shown in Your Impact now match the Indian and International programs on the donate page.
                      To add, rename, or edit programs, go to the{" "}
                      <button className="underline font-semibold hover:opacity-80" onClick={() => (window as Window & { __spandanaSetTab?: (tab: string) => void }).__spandanaSetTab?.("donate")}>Donate tab → Edit Programs</button>.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
                </div>
              </div>
            );
}
