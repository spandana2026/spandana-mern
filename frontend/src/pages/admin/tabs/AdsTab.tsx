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
import { SectionCard, Field, Label, DeviceTabs, VisibilityToggleRow } from "./shared";
import type { SiteSettings } from "./types";

const colorInputValue = (value: string | undefined, fallback: string) =>
  /^#[0-9a-f]{6}$/i.test(value ?? "") ? value! : fallback;

interface Props {
  settings: SiteSettings;
  updateSettings: (path: (string | number)[], val: unknown) => void;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  token: string;
  saving: boolean;
  onSave: () => void;
  showFeedback: (type: "success" | "error", msg: string) => void;
}

export default function AdsTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  return (

            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Ad Banners</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage sponsored banners displayed on the website carousel</p>
                </div>
                <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save</>}
                </Button>
              </div>

              {/* Enable/Disable ads */}
              <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Show Ad Banners on Website</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Toggle to show or hide the entire ads section from the site</p>
                </div>
                <Switch
                  checked={settings?.adsEnabled !== false}
                  onCheckedChange={(v) => updateSettings(["adsEnabled"], v)}
                />
              </div>

              {/* Visitor Counter Section */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Eye size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Visitor Counter</h3>
                    <p className="text-xs text-muted-foreground">Shown at the very bottom of the footer</p>
                  </div>
                  <div className="ml-auto">
                    <Switch
                      checked={settings?.visitorCountEnabled === true}
                      onCheckedChange={(v) => updateSettings(["visitorCountEnabled"], v)}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">Current Count</label>
                    <Input
                      type="number"
                      value={settings?.visitorCount ?? 0}
                      onChange={(e) => updateSettings(["visitorCount"], Number(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Set a starting base count. Real visits auto-increment this.</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">Counter Label</label>
                    <Input
                      value={settings?.visitorCountLabel ?? "Visitors and counting"}
                      onChange={(e) => updateSettings(["visitorCountLabel"], e.target.value)}
                      placeholder="Visitors and counting"
                    />
                  </div>
                </div>
              </div>

              {/* Ads list */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base">Ad Banners ({(settings?.ads ?? []).length})</h3>
                  <Button size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => {
                    const current = settings?.ads ?? [];
                    updateSettings(["ads"], [...current, { id: Date.now().toString(), title: "New Ad", subtitle: "", image: "", link: "", bgColor: "#f8fafc", textColor: "#334155", enabled: true }]);
                  }}>
                    <Plus size={13} /> Add Ad
                  </Button>
                </div>

                {(settings?.ads ?? []).length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                    <Megaphone size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No ads yet</p>
                    <p className="text-xs mt-1">Add your first sponsored banner above</p>
                  </div>
                )}

                {(settings?.ads ?? []).map((ad, i) => (
                  <motion.div key={ad.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">Ad #{i + 1}</span>
                        <Switch
                          checked={ad.enabled !== false}
                          onCheckedChange={(v) => {
                            const arr = [...(settings?.ads ?? [])];
                            arr[i] = { ...arr[i], enabled: v };
                            updateSettings(["ads"], arr);
                          }}
                        />
                        <span className="text-xs text-muted-foreground">{ad.enabled !== false ? "Visible" : "Hidden"}</span>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30 text-xs gap-1"
                        onClick={() => {
                          const arr = (settings?.ads ?? []).filter((_, idx: number) => idx !== i);
                          updateSettings(["ads"], arr);
                        }}>
                        <Trash2 size={12} /> Remove
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Ad Title *</label>
                        <Input value={ad.title ?? ""} onChange={(e) => {
                          const arr = [...(settings?.ads ?? [])];
                          arr[i] = { ...arr[i], title: e.target.value };
                          updateSettings(["ads"], arr);
                        }} placeholder="Company / Ad headline" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Subtitle</label>
                        <Input value={ad.subtitle ?? ""} onChange={(e) => {
                          const arr = [...(settings?.ads ?? [])];
                          arr[i] = { ...arr[i], subtitle: e.target.value };
                          updateSettings(["ads"], arr);
                        }} placeholder="Short description or tagline" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Image URL (logo/banner)</label>
                        <Input value={ad.image ?? ""} onChange={(e) => {
                          const arr = [...(settings?.ads ?? [])];
                          arr[i] = { ...arr[i], image: e.target.value };
                          updateSettings(["ads"], arr);
                        }} placeholder="https://..." />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Click URL</label>
                        <Input value={ad.link ?? ""} onChange={(e) => {
                          const arr = [...(settings?.ads ?? [])];
                          arr[i] = { ...arr[i], link: e.target.value };
                          updateSettings(["ads"], arr);
                        }} placeholder="https://advertiser.com" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Video URL <span className="font-normal text-muted-foreground/60">(YouTube, Vimeo, or direct .mp4 link — overrides image)</span>
                        </label>
                        <Input value={ad.videoUrl ?? ""} onChange={(e) => {
                          const arr = [...(settings?.ads ?? [])];
                          arr[i] = { ...arr[i], videoUrl: e.target.value };
                          updateSettings(["ads"], arr);
                        }} placeholder="https://youtube.com/watch?v=... or https://vimeo.com/... or /ads/video.mp4" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Background Color</label>
                        <div className="flex gap-2">
                          <input type="color" value={colorInputValue(ad.bgColor, "#f8fafc")}
                            onChange={(e) => {
                              const arr = [...(settings?.ads ?? [])];
                              arr[i] = { ...arr[i], bgColor: e.target.value };
                              updateSettings(["ads"], arr);
                            }}
                            className="w-10 h-9 rounded border border-border cursor-pointer p-0.5" />
                          <Input value={ad.bgColor ?? "#f8fafc"} onChange={(e) => {
                            const arr = [...(settings?.ads ?? [])];
                            arr[i] = { ...arr[i], bgColor: e.target.value };
                            updateSettings(["ads"], arr);
                          }} placeholder="#f8fafc" className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Text Color</label>
                        <div className="flex gap-2">
                          <input type="color" value={colorInputValue(ad.textColor, "#334155")}
                            onChange={(e) => {
                              const arr = [...(settings?.ads ?? [])];
                              arr[i] = { ...arr[i], textColor: e.target.value };
                              updateSettings(["ads"], arr);
                            }}
                            className="w-10 h-9 rounded border border-border cursor-pointer p-0.5" />
                          <Input value={ad.textColor ?? "#334155"} onChange={(e) => {
                            const arr = [...(settings?.ads ?? [])];
                            arr[i] = { ...arr[i], textColor: e.target.value };
                            updateSettings(["ads"], arr);
                          }} placeholder="#334155" className="flex-1" />
                        </div>
                      </div>
                    </div>
                    {ad.image && (
                      <div className="mt-3 p-3 rounded-xl border" style={{ background: ad.bgColor ?? "#f8fafc", color: ad.textColor ?? "#334155" }}>
                        <div className="flex items-center gap-3">
                          <img src={ad.image} alt="" className="h-10 w-16 object-contain rounded" />
                          <div>
                            <p className="font-bold text-sm">{ad.title}</p>
                            {ad.subtitle && <p className="text-xs opacity-75">{ad.subtitle}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
  );
}
