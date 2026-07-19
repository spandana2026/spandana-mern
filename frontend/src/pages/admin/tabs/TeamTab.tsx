import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Loader2, Plus, Trash2, Pencil, X, Eye, EyeOff,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Upload, Download, RefreshCw, ExternalLink, Lock, KeyRound,
  UserCheck, UserX, UserPlus, CalendarDays, MapPin, Clock,
  Send, History, Megaphone, Image, Globe, Gamepad2,
  ToggleLeft, ToggleRight, DollarSign, Mail, Sheet,
  Star, Building2, Navigation, Users, FileText, FolderOpen,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch }   from "@/components/ui/switch";
import { SectionCard, Field, Label, DeviceTabs, VisibilityToggleRow } from "./shared";
import type { SiteSettings } from "../types";

interface Props {
  settings: SiteSettings;
  updateSettings: (path: (string | number)[], val: unknown) => void;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  token: string;
  saving: boolean;
  onSave: () => void;
  showFeedback: (type: "success" | "error", msg: string) => void;
}

interface TeamMember {
  id: string;
  name: string;
  username: string;
  role: string;
  active: boolean;
}

interface TeamResource {
  id: string;
  title: string;
  description: string;
  category: string;
  driveLink: string;
  icon: string;
}

const EMPTY_MEMBER = { name: "", username: "", password: "", role: "Member" };
const EMPTY_RESOURCE = { title: "", description: "", category: "General", driveLink: "", icon: "file" };

export default function TeamTab({ settings, updateSettings, setSettings, token, saving, onSave, showFeedback }: Props) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamResources, setTeamResources] = useState<TeamResource[]>(() => {
    const resources = settings.teamResources;
    return Array.isArray(resources) ? resources as TeamResource[] : [];
  });
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState(EMPTY_MEMBER);
  const [showMemberPass, setShowMemberPass] = useState(false);
  const [revealedPassId, setRevealedPassId] = useState<string | null>(null);
  const [resettingMemberId, setResettingMemberId] = useState<string | null>(null);
  const [resetPassVal, setResetPassVal] = useState("");
  const [showResetPass, setShowResetPass] = useState(false);
  const [addingResource, setAddingResource] = useState(false);
  const [editingResource, setEditingResource] = useState<TeamResource | null>(null);
  const [resourceForm, setResourceForm] = useState(EMPTY_RESOURCE);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/admin/team", { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Unable to load team members");
      const data = await response.json() as Array<TeamMember & { _id?: string }>;
      setTeamMembers(data.map(({ _id, ...member }) => ({ ...member, id: member.id ?? _id ?? "", active: member.active !== false })));
    } catch {
      showFeedback("error", "Could not load team members.");
    } finally {
      setLoading(false);
    }
  }, [token, showFeedback]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  async function saveMember() {
    const editing = editingMember;
    const body = editing
      ? { name: memberForm.name, role: memberForm.role, ...(memberForm.password ? { password: memberForm.password } : {}) }
      : memberForm;
    try {
      const response = await fetch(editing ? `/api/v1/admin/team/${editing.id}` : "/api/v1/admin/team", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error();
      setAddingMember(false); setEditingMember(null); setMemberForm(EMPTY_MEMBER);
      showFeedback("success", editing ? "Team member updated." : "Team member added.");
      await loadMembers();
    } catch {
      showFeedback("error", "Could not save team member.");
    }
  }

  async function toggleMemberActive(member: TeamMember) {
    try {
      const response = await fetch(`/api/v1/admin/team/${member.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ active: !member.active }) });
      if (!response.ok) throw new Error();
      await loadMembers();
    } catch { showFeedback("error", "Could not update team member."); }
  }

  async function resetMemberPassword(id: string) {
    if (!resetPassVal.trim()) return;
    try {
      const response = await fetch(`/api/v1/admin/team/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ password: resetPassVal }) });
      if (!response.ok) throw new Error();
      setResettingMemberId(null); setResetPassVal(""); showFeedback("success", "Password reset.");
    } catch { showFeedback("error", "Could not reset password."); }
  }

  async function deleteMember(id: string) {
    if (!window.confirm("Delete this team member?")) return;
    try {
      const response = await fetch(`/api/v1/admin/team/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error();
      showFeedback("success", "Team member deleted."); await loadMembers();
    } catch { showFeedback("error", "Could not delete team member."); }
  }

  function saveResource() {
    const resource = { ...resourceForm, id: editingResource?.id ?? crypto.randomUUID() };
    const resources = editingResource
      ? teamResources.map((item) => item.id === editingResource.id ? resource : item)
      : [...teamResources, resource];
    setTeamResources(resources);
    updateSettings(["teamResources"], resources);
    setAddingResource(false); setEditingResource(null); setResourceForm(EMPTY_RESOURCE);
    showFeedback("success", "Resource updated. Save the draft to publish this change.");
  }

  function deleteResource(id: string) {
    if (!window.confirm("Delete this resource?")) return;
    const resources = teamResources.filter((resource) => resource.id !== id);
    setTeamResources(resources);
    updateSettings(["teamResources"], resources);
    showFeedback("success", "Resource removed. Save the draft to publish this change.");
  }

  return (

            <div className="max-w-4xl mx-auto space-y-10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Team Portal</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage team member accounts and shared resources</p>
                </div>
                <a href="/team" target="_blank" className="text-xs text-primary underline underline-offset-2 hover:opacity-80">View Portal ↗</a>
              </div>

              {/* Members section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base flex items-center gap-2"><Users size={16} className="text-primary" /> Team Members</h3>
                  <Button size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => { setAddingMember(true); setEditingMember(null); setMemberForm({ name: "", username: "", password: "", role: "Member" }); }}>
                    <UserPlus size={13} /> Add Member
                  </Button>
                </div>

                <AnimatePresence>
                  {(addingMember || editingMember) && (
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                      className="bg-card border border-primary/30 rounded-2xl p-5 mb-4 shadow-sm">
                      <h4 className="font-semibold text-sm mb-4">{editingMember ? "Edit Member" : "Add New Member"}</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                          <Input value={memberForm.name} onChange={(e) => setMemberForm((f) => ({ ...f, name: e.target.value }))} placeholder="Dr. Anitha Reddy" /></div>
                        <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Username</label>
                          <Input value={memberForm.username} onChange={(e) => setMemberForm((f) => ({ ...f, username: e.target.value }))} placeholder="anitha.reddy" disabled={!!editingMember} /></div>
                        <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">{editingMember ? "New Password (leave blank to keep)" : "Password"}</label>
                          <div className="relative">
                            <Input type={showMemberPass ? "text" : "password"} value={memberForm.password} onChange={(e) => setMemberForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="pr-10" />
                            <button type="button" onClick={() => setShowMemberPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                              {showMemberPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                        <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role</label>
                          <Input value={memberForm.role} onChange={(e) => setMemberForm((f) => ({ ...f, role: e.target.value }))} placeholder="Coordinator" /></div>
                      </div>
                      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setAddingMember(false); setEditingMember(null); }}>Cancel</Button>
                        <Button size="sm" className="rounded-full gap-1.5" onClick={saveMember} disabled={saving || !memberForm.name || (!editingMember && (!memberForm.username || !memberForm.password))}>
                          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}{editingMember ? "Update" : "Add Member"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary w-7 h-7" /></div> : (
                  <div className="space-y-2">
                    {teamMembers.map((m) => (
                      <div key={m.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                        <div className="p-4 flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{m.name}</p>
                            <p className="text-xs text-muted-foreground">@{m.username} · {m.role}</p>
                            {/* Password display */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <Lock size={10} className="text-muted-foreground/50 shrink-0" />
                              {m.password ? (
                                <>
                                  <span className="text-xs font-mono text-muted-foreground tracking-wider select-all">
                                    {revealedPassId === m.id ? m.password : "••••••••"}
                                  </span>
                                  <button type="button" onClick={() => setRevealedPassId(revealedPassId === m.id ? null : m.id)}
                                    className="text-muted-foreground/50 hover:text-primary transition-colors ml-0.5" title={revealedPassId === m.id ? "Hide password" : "Show password"}>
                                    {revealedPassId === m.id ? <EyeOff size={11} /> : <Eye size={11} />}
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-amber-600 font-medium">No password set — please reset</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                              {m.active ? "Active" : "Inactive"}
                            </span>
                            <Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs" title={m.active ? "Deactivate" : "Activate"} onClick={() => toggleMemberActive(m)}>
                              {m.active ? <UserX size={12} /> : <UserCheck size={12} />}
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
                              title="Reset Password"
                              onClick={() => { setResettingMemberId(resettingMemberId === m.id ? null : m.id); setResetPassVal(""); setShowResetPass(false); setEditingMember(null); setRevealedPassId(null); }}>
                              <KeyRound size={12} /> Reset
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs" onClick={() => { setEditingMember(m); setAddingMember(false); setResettingMemberId(null); setMemberForm({ name: m.name, username: m.username, password: "", role: m.role }); }}>
                              <Pencil size={12} />
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => deleteMember(m.id)}>
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                        {/* Inline reset password panel */}
                        <AnimatePresence>
                          {resettingMemberId === m.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="border-t border-amber-200 bg-amber-50/60 px-4 py-3 flex items-center gap-3">
                                <KeyRound size={14} className="text-amber-600 shrink-0" />
                                <p className="text-xs font-medium text-amber-700 shrink-0">New password for @{m.username}:</p>
                                <div className="relative flex-1 max-w-xs">
                                  <Input
                                    type={showResetPass ? "text" : "password"}
                                    value={resetPassVal}
                                    onChange={(e) => setResetPassVal(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && resetMemberPassword(m.id)}
                                    placeholder="Enter new password"
                                    className="h-8 text-xs pr-9 bg-white border-amber-300 focus:border-amber-500"
                                    autoFocus
                                  />
                                  <button type="button" onClick={() => setShowResetPass((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    {showResetPass ? <EyeOff size={13} /> : <Eye size={13} />}
                                  </button>
                                </div>
                                <Button size="sm" className="h-8 rounded-lg text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                                  onClick={() => resetMemberPassword(m.id)} disabled={saving || !resetPassVal.trim()}>
                                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                                </Button>
                                <button onClick={() => setResettingMemberId(null)} className="text-muted-foreground hover:text-foreground ml-1"><X size={14} /></button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    {teamMembers.length === 0 && !loading && (
                      <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-2xl">
                        <Users size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No team members yet. Add your first member above.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Resources section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base flex items-center gap-2"><FolderOpen size={16} className="text-primary" /> Shared Resources</h3>
                  <Button size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => { setAddingResource(true); setEditingResource(null); setResourceForm({ title: "", description: "", category: "General", driveLink: "", icon: "file" }); }}>
                    <Plus size={13} /> Add Resource
                  </Button>
                </div>

                <AnimatePresence>
                  {(addingResource || editingResource) && (
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                      className="bg-card border border-primary/30 rounded-2xl p-5 mb-4 shadow-sm">
                      <h4 className="font-semibold text-sm mb-4">{editingResource ? "Edit Resource" : "Add New Resource"}</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2"><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
                          <Input value={resourceForm.title} onChange={(e) => setResourceForm((f) => ({ ...f, title: e.target.value }))} placeholder="Brand Logo Pack" /></div>
                        <div className="sm:col-span-2"><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Google Drive Link</label>
                          <Input value={resourceForm.driveLink} onChange={(e) => setResourceForm((f) => ({ ...f, driveLink: e.target.value }))} placeholder="https://drive.google.com/..." /></div>
                        <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                          <select value={resourceForm.category} onChange={(e) => setResourceForm((f) => ({ ...f, category: e.target.value }))}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            {["Branding", "Photos", "Reports", "Templates", "General"].map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon</label>
                          <select value={resourceForm.icon} onChange={(e) => setResourceForm((f) => ({ ...f, icon: e.target.value }))}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="file">Document</option>
                            <option value="image">Image</option>
                            <option value="folder">Folder</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2"><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description (optional)</label>
                          <Input value={resourceForm.description} onChange={(e) => setResourceForm((f) => ({ ...f, description: e.target.value }))} placeholder="Official logo files in SVG, PNG, PDF formats" /></div>
                      </div>
                      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setAddingResource(false); setEditingResource(null); }}>Cancel</Button>
                        <Button size="sm" className="rounded-full gap-1.5" onClick={saveResource} disabled={saving || !resourceForm.title || !resourceForm.driveLink}>
                          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}{editingResource ? "Update" : "Add Resource"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  {teamResources.map((r) => (
                    <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        {r.icon === "image" ? <FileText size={16} /> : r.icon === "folder" ? <FolderOpen size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.category}{r.description ? ` · ${r.description}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={r.driveLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs"><ExternalLink size={11} />Open</Button>
                        </a>
                        <Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs" onClick={() => { setEditingResource(r); setAddingResource(false); setResourceForm({ title: r.title, description: r.description, category: r.category, driveLink: r.driveLink, icon: r.icon }); }}>
                          <Pencil size={12} />
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => deleteResource(r.id)}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {teamResources.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-2xl">
                      <FolderOpen size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No resources yet. Add your first resource above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
  );
}
