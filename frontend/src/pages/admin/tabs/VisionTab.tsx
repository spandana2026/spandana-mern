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

export default function VisionTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div><h2 className="text-2xl font-serif font-bold">Vision & Mission</h2><p className="text-sm text-muted-foreground mt-1">Edit the About Us section content</p></div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
              </div>

              <DeviceTabs>
                {(view) => view === "desktop" ? (
                  <>
                    <VisibilityToggleRow label="Show Vision & Mission on Desktop" description="Hides the entire About Us block (Vision, Mission, Stories & Video) on desktop." visKey="visionMission" settings={settings} updateSettings={updateSettings} />

                    <SectionCard title="👁 Our Vision">
                      <Field label="Section Heading"><Input value={settings.vision.heading} onChange={(e) => updateSettings(["vision", "heading"], e.target.value)} /></Field>
                      <RichTextEditor label="Vision Text (full desktop version)" value={settings.vision.content ?? ""} onChange={(html) => updateSettings(["vision", "content"], html)} minHeight={120} />
                    </SectionCard>

                    <SectionCard title="🎯 Our Mission">
                      <Field label="Section Heading"><Input value={settings.mission.heading} onChange={(e) => updateSettings(["mission", "heading"], e.target.value)} /></Field>
                      <RichTextEditor label="Mission Text (full desktop version)" value={settings.mission.content ?? ""} onChange={(html) => updateSettings(["mission", "content"], html)} minHeight={120} />
                    </SectionCard>

                    <SectionCard title="🏛 Community Center Caption">
                      <Field label="Caption (shown under center photo)"><Input value={settings.centerCaption} onChange={(e) => updateSettings(["centerCaption"], e.target.value)} /></Field>
                    </SectionCard>
                  </>
                ) : (
                  <>
                    <VisibilityToggleRow label="Show Vision & Mission on Mobile" description="Toggle to hide the About Us block on phone screens." visKey="visionMissionMobile" settings={settings} updateSettings={updateSettings} />
                    <VisibilityToggleRow label="Show Video on Mobile" description="Toggle to hide the video player (Sahara Community Center) on phone screens. Success stories remain visible." visKey="videoSectionMobile" settings={settings} updateSettings={updateSettings} />

                    <SectionCard title="✏️ Mobile Text Override">
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                        <input type="checkbox" id="useMobileVision" checked={settings.useMobileVision ?? false}
                          onChange={(e) => updateSettings(["useMobileVision"], e.target.checked)}
                          className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                        <label htmlFor="useMobileVision" className="text-sm font-medium cursor-pointer select-none">Use shorter text on mobile screens</label>
                      </div>
                      <div className={`grid gap-4 ${!settings.useMobileVision ? "opacity-50 pointer-events-none" : ""}`}>
                        <p className="text-xs text-muted-foreground">Leave any field blank to fall back to the desktop version.</p>
                        <Field label="Mobile Vision Heading">
                          <Input value={settings.mobileVision?.heading ?? ""} onChange={(e) => updateSettings(["mobileVision", "heading"], e.target.value)} placeholder="Shorter heading for phones" />
                        </Field>
                        <RichTextEditor label="Mobile Vision Text" value={settings.mobileVision?.content ?? ""} onChange={(html) => updateSettings(["mobileVision", "content"], html)} minHeight={80} placeholder="Shorter vision text for mobile screens..." />
                        <Field label="Mobile Mission Heading">
                          <Input value={settings.mobileMission?.heading ?? ""} onChange={(e) => updateSettings(["mobileMission", "heading"], e.target.value)} placeholder="Shorter heading for phones" />
                        </Field>
                        <RichTextEditor label="Mobile Mission Text" value={settings.mobileMission?.content ?? ""} onChange={(html) => updateSettings(["mobileMission", "content"], html)} minHeight={80} placeholder="Shorter mission text for mobile screens..." />
                      </div>
                    </SectionCard>

                    <SectionCard title="📐 Mobile Layout">
                      <Field label="Text Alignment" description="How the vision and mission text is aligned on phones.">
                        <div className="flex gap-2 mt-1">
                          {(["left", "center"] as const).map((align) => (
                            <button key={align} onClick={() => updateSettings(["visionMobileTextAlign"], align)}
                              className={`flex-1 py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${(settings.visionMobileTextAlign ?? "left") === align ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                              {align === "left" ? "⬜ Left" : "⬛ Centre"}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </SectionCard>
                  </>
                )}
              </DeviceTabs>

              <div className="flex justify-end mt-4">
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>{saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Draft</>}</Button>
              </div>
            </div>
  );
}
