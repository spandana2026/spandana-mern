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

export default function CoreValuesTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Core Values Page</h2>
                  <p className="text-sm text-muted-foreground mt-1">Edit all content shown on the <a href="/core-values" target="_blank" className="underline text-primary hover:opacity-80">/core-values</a> page</p>
                </div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Changes</>}
                </Button>
              </div>
              <VisibilityBanner label="Core Values Section (Homepage)" visKey="coreValues" settings={settings} updateSettings={updateSettings} description="The core values cards shown on the homepage." />
              <SectionCard title="Page Header">
                <Field label="Section Badge Text">
                  <Input value={settings.coreValuesSection?.badge ?? "Our Core Values"}
                    onChange={(e) => updateSettings(["coreValuesSection", "badge"], e.target.value)} />
                </Field>
                <div className="grid gap-3">
                  <Label>Tagline Phrases (3 italic phrases shown in hero)</Label>
                  {(settings.coreValuesSection?.taglines ?? ["Build People Up","Help People Grow","Because People Matter"]).map((t: string, i: number) => (
                    <Input key={i} value={t} onChange={(e) => {
                      const arr = JSON.parse(JSON.stringify(settings.coreValuesSection?.taglines ?? ["Build People Up","Help People Grow","Because People Matter"]));
                      arr[i] = e.target.value;
                      updateSettings(["coreValuesSection", "taglines"], arr);
                    }} placeholder={`Tagline ${i + 1}`} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Value Names (5 values)">
                <p className="text-xs text-muted-foreground -mt-1 mb-1">These names also appear as the card titles on the Core Values page and as the hero quick-nav pills.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {settings.values.map((val, i) => (
                    <Field key={i} label={`Value ${i + 1}`}>
                      <Input value={val} onChange={(e) => { const v = [...settings.values]; v[i] = e.target.value; updateSettings(["values"], v); }} />
                    </Field>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Value Descriptions" defaultOpen={false}>
                <p className="text-xs text-muted-foreground -mt-1 mb-1">
                  Shown on hover in the homepage compact section and as the full card text on the Core Values page.
                </p>
                {settings.values.map((_: string, i: number) => (
                  <div key={i}>
                    <RichTextEditor
                      label={`${settings.values[i] || `Value ${i + 1}`} — Description`}
                      value={(settings.coreValuesSection?.descriptions ?? [])[i] ?? ""}
                      onChange={(html) => {
                        const arr = JSON.parse(JSON.stringify(settings.coreValuesSection?.descriptions ?? Array(5).fill("")));
                        while (arr.length < 5) arr.push("");
                        arr[i] = html;
                        updateSettings(["coreValuesSection", "descriptions"], arr);
                      }}
                      minHeight={80}
                    />
                  </div>
                ))}
              </SectionCard>

              <div className="flex justify-end mt-4">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Changes</>}
                </Button>
              </div>
            </div>
  );
}
