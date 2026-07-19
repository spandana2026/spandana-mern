import { useState } from "react";
import { Save, Send, Calendar, Clock, History, Loader2, Eye, EyeOff, AlertTriangle, CheckCircle2, X, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface TabConfig {
  mode: "settings" | "crud" | "none";
  visKey?: string;
  label: string;
  description?: string;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  dashboard:           { mode: "none",     label: "Dashboard" },

  siteinfo:            { mode: "settings", visKey: "siteInfo",           label: "Global Settings",       description: "Global site configuration visible on all pages." },
  seo:                 { mode: "settings", visKey: "seo",                label: "SEO",                   description: "Search engine meta tags, og image, and keywords." },
  "live-stream":       { mode: "settings", visKey: "liveStream",         label: "Live Stream Banner",    description: "The live stream notification banner shown site-wide." },
  navigation:          { mode: "settings", visKey: "navigation",         label: "Navbar",                description: "The top navigation bar shown on every page." },
  footer:              { mode: "settings", visKey: "footer",             label: "Footer",                description: "The site footer shown on every page." },
  theme:               { mode: "settings", visKey: "theme",              label: "Theme & Fonts",         description: "Global colour palette and typography applied site-wide." },
  "page-builder":      { mode: "settings", visKey: "pageBuilder",        label: "Page Builder",          description: "Section ordering and visibility controls for all pages." },
  "floating-menu":     { mode: "settings", visKey: "floatingMenu",       label: "Floating Menu",         description: "The floating action menu shown on all pages." },

  hero:                { mode: "settings", visKey: "hero",               label: "Home / Hero",           description: "The main hero banner on the homepage." },
  vision:              { mode: "settings", visKey: "visionMission",      label: "Vision & Mission",      description: "The vision and mission section on the homepage." },
  programs:            { mode: "settings", visKey: "programs",           label: "Programs",              description: "The programs overview section on the homepage." },
  "physical-health":   { mode: "settings", visKey: "physicalHealth",     label: "Physical Health",       description: "The physical health page section." },
  "mental-health":     { mode: "settings", visKey: "mentalHealth",       label: "Mental Health",         description: "The mental health page section." },
  sahara:              { mode: "settings", visKey: "sahara",             label: "Sahara",                description: "The Sahara community centre section." },
  "get-involved":      { mode: "settings", visKey: "getInvolved",        label: "Get Involved",          description: "The volunteer / get involved section." },
  donate:              { mode: "settings", visKey: "donate",             label: "Donate",                description: "The donate page and donation sections." },
  blog:                { mode: "settings", visKey: "blog",               label: "Blog",                  description: "The blog section on the website." },
  successstories:      { mode: "settings", visKey: "successStories",     label: "Success Stories",       description: "The success stories section on the homepage." },
  testimonials:        { mode: "settings", visKey: "testimonials",       label: "Testimonials",          description: "The testimonials carousel on the homepage." },
  corevalues:          { mode: "settings", visKey: "coreValues",         label: "Core Values",           description: "The core values section on the homepage." },
  "fun-zone":          { mode: "settings", visKey: "funZone",            label: "Fun Zone",              description: "The fun zone / games section." },
  events:              { mode: "settings", visKey: "events",             label: "Events",                description: "The upcoming events section." },
  games:               { mode: "settings", visKey: "games",              label: "Games",                 description: "The games and payments section." },
  timeline:            { mode: "settings", visKey: "timeline",           label: "Timeline",              description: "The foundation history timeline section." },
  volunteers:          { mode: "settings", visKey: "volunteers",         label: "Volunteers",            description: "The volunteer spotlight section." },
  impact:              { mode: "settings", visKey: "impact",             label: "Your Impact",           description: "The donation impact calculator section." },
  subscribers:         { mode: "settings", visKey: "newsletter",         label: "Newsletter",            description: "The email newsletter sign-up section." },
  ads:                 { mode: "settings", visKey: "adBanners",          label: "Ad Banners",            description: "Promotional ad banners shown on the site." },
  shop:                { mode: "settings", visKey: "shop",               label: "Shop & NEENAS",         description: "The NEENAS gift shop section and links." },
  team:                { mode: "settings", visKey: "team",               label: "Team Portal",           description: "The team portal and member area." },
  visionpage:          { mode: "settings", visKey: "visionPage",         label: "Vision Page",           description: "The dedicated Vision page." },
  storiespage:         { mode: "settings", visKey: "storiesPage",        label: "Stories Page",          description: "The dedicated Stories page." },
  testimonialspage:    { mode: "settings", visKey: "testimonialsPage",   label: "Testimonials Page",     description: "The dedicated Testimonials page." },

  "health-programs":        { mode: "crud", visKey: "healthPrograms",       label: "Health Programs",       description: "All published health programs shown on the site." },
  "community-initiatives":  { mode: "crud", visKey: "communityInitiatives", label: "Community Initiatives", description: "All published community initiatives shown on the site." },
  gallery:                  { mode: "crud", visKey: "gallery",              label: "Gallery",               description: "The photo gallery section shown on the site." },
  "blog-posts-crud":        { mode: "crud", visKey: "blogPostsCrud",        label: "Blog Posts",            description: "Published blog posts shown on the site." },
  "stories-crud":           { mode: "crud", visKey: "storiesCrud",          label: "Stories",               description: "Published impact stories shown on the site." },
  "testimonials-crud":      { mode: "crud", visKey: "testimonialsCrud",     label: "Testimonials",          description: "Published testimonials shown on the site." },
  "values-crud":            { mode: "crud", visKey: "valuesCrud",           label: "Core Values",           description: "Published core values shown on the site." },
  "game-listings":          { mode: "crud", visKey: "gameListings",         label: "Game Listings",         description: "Published games shown in the fun zone." },
};

interface Props {
  tab: string;
  settings: Record<string, unknown> | null;
  updateSettings: (path: (string | number)[], val: unknown) => void;
  saveSettings: () => void;
  publishNow: () => void;
  schedulePublish: () => void;
  cancelSchedule: () => void;
  saving: boolean;
  publishing: boolean;
  hasDraft: boolean;
  scheduledAt: string | null;
  historyEntries: Array<{ index: number; publishedAt: string }>;
  revertTo: (index: number) => void;
  scheduleAt: string;
  setScheduleAt: (val: string) => void;
}

export default function TabControlBar({
  tab, settings, updateSettings, saveSettings, publishNow, schedulePublish,
  cancelSchedule, saving, publishing, hasDraft, scheduledAt,
  historyEntries, revertTo, scheduleAt, setScheduleAt,
}: Props) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const config = TAB_CONFIG[tab];
  if (!config || config.mode === "none") return null;

  const vis = (settings?.visibility ?? {}) as Record<string, boolean | undefined>;
  const isVisible = config.visKey ? vis[config.visKey] !== false : true;

  const isCrud = config.mode === "crud";

  function toggleVisibility() {
    if (!config.visKey) return;
    updateSettings(["visibility", config.visKey], !isVisible);
    if (!isCrud) {
      setTimeout(() => saveSettings(), 50);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm mb-6 overflow-hidden">
      {/* ── Top row: visibility + status + publish controls ── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">

        {/* Visibility toggle */}
        {config.visKey && (
          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-colors ${
            isVisible
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-muted border-border text-muted-foreground"
          }`}>
            {isVisible
              ? <Eye size={13} className="shrink-0" />
              : <EyeOff size={13} className="shrink-0" />}
            <span className="text-xs font-semibold">{isVisible ? "Visible" : "Hidden"}</span>
            <Switch
              checked={isVisible}
              onCheckedChange={toggleVisibility}
              className="scale-75 -mr-1"
            />
          </div>
        )}

        {/* Status badge — settings tabs only */}
        {!isCrud && (
          <div className="flex items-center gap-1.5">
            {scheduledAt ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                <Clock size={11} />Scheduled: {new Date(scheduledAt).toLocaleString()}
                <button onClick={cancelSchedule} className="ml-0.5 hover:text-red-600 transition-colors">
                  <X size={11} />
                </button>
              </span>
            ) : hasDraft ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                <AlertTriangle size={11} />Draft — not yet live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={11} />Published
              </span>
            )}
          </div>
        )}

        {/* CRUD note */}
        {isCrud && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Database size={11} />Records save instantly — no publish needed
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Revert history — settings only */}
        {!isCrud && historyEntries.length > 0 && (
          <div className="relative">
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs h-8"
              onClick={() => setHistoryOpen(!historyOpen)}>
              <History size={12} />Revert
            </Button>
            {historyOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-2 border-b border-border text-xs font-semibold text-muted-foreground px-3">
                  Published Versions
                </div>
                {historyEntries.map((entry) => (
                  <button key={entry.index}
                    onClick={() => { revertTo(entry.index); setHistoryOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors flex items-center gap-2">
                    <Clock size={11} className="shrink-0 text-muted-foreground" />
                    {new Date(entry.publishedAt).toLocaleString()}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Schedule — settings only */}
        {!isCrud && (
          <div className="relative">
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs h-8"
              onClick={() => setScheduleOpen(!scheduleOpen)}>
              <Calendar size={12} />Schedule
            </Button>
            {scheduleOpen && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-popover border border-border rounded-xl shadow-xl z-50 p-3 space-y-2">
                <p className="text-xs font-semibold">Schedule publish</p>
                <input
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 rounded-full text-xs h-7"
                    onClick={() => { schedulePublish(); setScheduleOpen(false); }}
                    disabled={!scheduleAt || publishing}>
                    {publishing
                      ? <Loader2 size={12} className="animate-spin mr-1" />
                      : <Calendar size={12} className="mr-1" />}
                    Set Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full text-xs h-7"
                    onClick={() => setScheduleOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save Draft — settings only */}
        {!isCrud && (
          <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs h-8"
            onClick={saveSettings} disabled={saving}>
            {saving
              ? <Loader2 size={12} className="animate-spin" />
              : <Save size={12} />}
            Save Draft
          </Button>
        )}

        {/* Publish Now — settings only */}
        {!isCrud && (
          <Button size="sm"
            className="rounded-full gap-1.5 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={publishNow} disabled={publishing}>
            {publishing
              ? <Loader2 size={12} className="animate-spin" />
              : <Send size={12} />}
            Publish Now
          </Button>
        )}
      </div>

      {/* ── Bottom row: label + description ── */}
      <div className="px-4 py-2.5 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isVisible ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
        <div>
          <span className="text-xs font-semibold text-foreground">{config.label}</span>
          {config.description && (
            <span className="text-xs text-muted-foreground ml-2">{config.description}</span>
          )}
        </div>
      </div>
    </div>
  );
}
