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

interface Props {
  settings: SiteSettings;
  updateSettings: (path: (string | number)[], val: unknown) => void;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  token: string;
  saving: boolean;
  onSave: () => void;
  showFeedback: (type: "success" | "error", msg: string) => void;
}

export default function NavigationTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {

            const DEFAULT_NAV_LINKS = [
              { label: "Vision/Mission",           href: "/#vision",   enabled: true },
              { label: "Sahara Community Centers", href: "/sahara",    enabled: true },
              { label: "Gallery",                  href: "/gallery",   enabled: true },
              { label: "Joy Zone",                  href: "/fun-zone",  enabled: true },
              { label: "Blog",                     href: "/blog",      enabled: true },
            ];
            const navLinks: Array<{ label: string; href: string; enabled?: boolean }> =
              settings.nav?.links?.length
                ? settings.nav.links
                : DEFAULT_NAV_LINKS;

            const updateLinks = (links: typeof navLinks) => updateSettings(["nav", "links"], links);

            return (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-serif font-bold">Navigation Bar</h2>
                    <p className="text-sm text-muted-foreground mt-1">Control which pages appear in the header — on both desktop and mobile</p>
                  </div>
                  <Button className="rounded-full gap-2" onClick={onSave} disabled={saving}>
                    {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Changes</>}
                  </Button>
                </div>

                {/* ── Nav links list ── */}
                <SectionCard title="Menu Pages (Desktop & Mobile)">
                  <p className="text-xs text-muted-foreground -mt-1 mb-4">
                    These links appear in the desktop header and in the mobile slide-out menu.
                    Toggle the switch to show or hide a link without deleting it.
                    Use <code className="bg-muted px-1 rounded text-[11px]">/#vision</code> for homepage anchors or <code className="bg-muted px-1 rounded text-[11px]">/sahara</code> for internal pages.
                  </p>

                  <div className="flex flex-col gap-3">
                    {navLinks.map((link, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border space-y-3 transition-colors ${link.enabled !== false ? "border-border" : "border-border/50 bg-muted/40 opacity-60"}`}
                      >
                        {/* Row header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Link {i + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              {link.enabled !== false ? "Visible" : "Hidden"}
                            </span>
                            <Switch
                              checked={link.enabled !== false}
                              onCheckedChange={(v) => {
                                const updated = JSON.parse(JSON.stringify(navLinks));
                                updated[i] = { ...updated[i], enabled: v };
                                updateLinks(updated);
                              }}
                            />
                            <button
                              onClick={() => {
                                const updated = navLinks.filter((_, idx) => idx !== i);
                                updateLinks(updated);
                              }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Remove this link"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Label + URL */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label="Menu Label">
                            <Input
                              value={link.label}
                              onChange={(e) => {
                                const updated = JSON.parse(JSON.stringify(navLinks));
                                updated[i] = { ...updated[i], label: e.target.value };
                                updateLinks(updated);
                              }}
                              placeholder="e.g. Vision & Mission"
                            />
                          </Field>
                          <Field label="Page URL">
                            <Input
                              value={link.href}
                              onChange={(e) => {
                                const updated = JSON.parse(JSON.stringify(navLinks));
                                updated[i] = { ...updated[i], href: e.target.value };
                                updateLinks(updated);
                              }}
                              placeholder="e.g. /sahara or /#vision"
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add / Reset buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg gap-1.5"
                      onClick={() => updateLinks([...navLinks, { label: "", href: "/", enabled: true }])}
                    >
                      <Plus size={13} /> Add Link
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-lg gap-1.5 text-muted-foreground"
                      onClick={() => updateLinks(DEFAULT_NAV_LINKS)}
                    >
                      Reset to Defaults
                    </Button>
                  </div>
                </SectionCard>

                {/* ── Button labels ── */}
                <SectionCard title="Header Button Labels">
                  <p className="text-xs text-muted-foreground -mt-1 mb-4">
                    These appear as action buttons in the header on desktop, and as icon+label shortcuts in the mobile top bar.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Donate Button">
                      <Input
                        value={settings.nav?.donateLabel ?? "Donate"}
                        onChange={(e) => updateSettings(["nav", "donateLabel"], e.target.value)}
                        placeholder="Donate"
                      />
                    </Field>
                    <Field label="Get Involved / Volunteer Button">
                      <Input
                        value={settings.nav?.getInvolvedLabel ?? "Get Involved"}
                        onChange={(e) => updateSettings(["nav", "getInvolvedLabel"], e.target.value)}
                        placeholder="Get Involved"
                      />
                    </Field>
                    <Field label="Shop Button Label">
                      <Input
                        value={settings.nav?.shopLabel ?? "Shop"}
                        onChange={(e) => updateSettings(["nav", "shopLabel"], e.target.value)}
                        placeholder="Shop"
                      />
                    </Field>
                    <Field
                      label="Shop External URL"
                      description="Leave blank to use the built-in shop page. When filled, the Shop button opens this URL in a new tab."
                    >
                      <Input
                        placeholder="https://neenasgifts.store"
                        value={settings.nav?.shopUrl ?? ""}
                        onChange={(e) => updateSettings(["nav", "shopUrl"], e.target.value)}
                      />
                    </Field>
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

