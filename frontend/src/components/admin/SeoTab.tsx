import { useState } from "react";
import { Upload, Save, Loader2, Search, Share2, Code, Globe, ShieldCheck, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

/* ── Local helpers (duplicated from admin.tsx pattern) ── */
function SectionCard({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 mb-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={15} className="text-primary shrink-0" />}
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value?.length ?? 0;
  const over = len > max;
  return (
    <p className={`text-[11px] mt-1 ${over ? "text-destructive font-medium" : "text-muted-foreground"}`}>
      {len} / {max} characters{over ? " — too long, Google will truncate" : ""}
    </p>
  );
}

interface Props {
  settings: Record<string, unknown>;
  updateSettings: (path: string[], value: unknown) => void;
  saveSettings: () => void;
  saving: boolean;
  token: string;
  showFeedback: (type: "success" | "error", msg: string) => void;
}

interface SeoConfig {
  title?: string; description?: string; keywords?: string; canonical?: string;
  ogTitle?: string; ogDescription?: string; ogImage?: string;
  googleVerification?: string; bingVerification?: string;
  structuredData?: boolean; indexable?: boolean; followLinks?: boolean;
  pages?: Record<string, unknown>;
  [key: string]: unknown;
}

export default function SeoTab({ settings, updateSettings, saveSettings, saving, token, showFeedback }: Props) {
  const seo = (settings.seo ?? {}) as SeoConfig;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">SEO & Discoverability</h2>
          <p className="text-sm text-muted-foreground mt-1">Control how Google and social platforms see your site</p>
        </div>
        <Button className="rounded-full gap-2" onClick={saveSettings} disabled={saving}>
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Changes</>}
        </Button>
      </div>

      {/* ── Google Search ── */}
      <SectionCard title="Google Search Appearance" icon={Search}>
        <Field
          label="Page Title (shown as browser tab + Google headline)"
          hint="Keep under 60 characters for best display in search results."
        >
          <Input
            value={seo.title ?? ""}
            onChange={(e) => updateSettings(["seo", "title"], e.target.value)}
            placeholder="Spandana Care Aid Foundation | Building Communities"
          />
          <CharCount value={seo.title ?? ""} max={60} />
        </Field>

        <Field label="Meta Description (shown under the page title in Google)">
          <Textarea
            value={seo.description ?? ""}
            onChange={(e) => updateSettings(["seo", "description"], e.target.value)}
            className="min-h-[80px] resize-none"
            placeholder="Spandana Care Aid Foundation uplifts underserved families through health, dignity, and economic independence across India."
          />
          <CharCount value={seo.description ?? ""} max={160} />
        </Field>

        <Field
          label="Keywords (comma-separated)"
          hint="Not a ranking factor for Google, but used by other search engines like Bing."
        >
          <Input
            value={seo.keywords ?? ""}
            onChange={(e) => updateSettings(["seo", "keywords"], e.target.value)}
            placeholder="NGO, nonprofit, Hyderabad, community health, social welfare, India"
          />
        </Field>

        <Field
          label="Canonical URL"
          hint="The authoritative URL of your homepage. Prevents duplicate content issues."
        >
          <Input
            value={seo.canonical ?? "https://spandanacareaid.org/"}
            onChange={(e) => updateSettings(["seo", "canonical"], e.target.value)}
            placeholder="https://spandanacareaid.org/"
          />
        </Field>
      </SectionCard>

      {/* ── Social Sharing ── */}
      <SectionCard title="Social Share Preview (WhatsApp, Facebook, LinkedIn)" icon={Share2}>
        <Field label="Share Title (defaults to Page Title if left blank)">
          <Input
            value={seo.ogTitle ?? ""}
            onChange={(e) => updateSettings(["seo", "ogTitle"], e.target.value)}
            placeholder="Spandana Care Aid Foundation"
          />
        </Field>

        <Field label="Share Description (defaults to Meta Description if left blank)">
          <Textarea
            value={seo.ogDescription ?? ""}
            onChange={(e) => updateSettings(["seo", "ogDescription"], e.target.value)}
            className="min-h-[70px] resize-none"
            placeholder="Empowering underserved communities through education, healthcare, and livelihood programs across India."
          />
        </Field>

        <Field label="Share Image (recommended 1200 × 630 px, under 1 MB)">
          {seo.ogImage && (
            <div className="flex items-center gap-3 p-2 bg-muted/40 rounded-xl border border-border mb-2">
              <img src={seo.ogImage} alt="OG preview" className="w-24 h-14 object-cover rounded-lg border border-border" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">Image uploaded</p>
                <p className="text-[10px] text-muted-foreground">Shown when shared on WhatsApp / Facebook / LinkedIn</p>
              </div>
              <Button
                type="button" variant="outline" size="sm"
                className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
                onClick={() => updateSettings(["seo", "ogImage"], "")}
              >Remove</Button>
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const form = new FormData();
                form.append("file", file);
                try {
                  const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
                  const data = await res.json() as { url?: string; error?: string };
                  if (data.url) { updateSettings(["seo", "ogImage"], data.url); showFeedback("success", "Share image uploaded!"); }
                  else showFeedback("error", data.error ?? "Upload failed");
                } catch { showFeedback("error", "Upload failed"); }
              }}
            />
            <span className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 rounded-xl py-3 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/20">
              <Upload size={15} />
              {seo.ogImage ? "Replace Share Image" : "Upload Share Image (1200×630 px recommended)"}
            </span>
          </label>
        </Field>
      </SectionCard>

      {/* ── Verification ── */}
      <SectionCard title="Search Console & Site Verification" icon={ShieldCheck}>
        <Field
          label="Google Search Console Verification Code"
          hint='Paste only the content value from the <meta name="google-site-verification" content="..."> tag.'
        >
          <Input
            value={seo.googleVerification ?? ""}
            onChange={(e) => updateSettings(["seo", "googleVerification"], e.target.value)}
            placeholder="abc123XYZ..."
            className="font-mono text-sm"
          />
        </Field>

        <Field
          label="Bing Webmaster Verification Code"
          hint='Paste only the content value from the Bing meta verification tag.'
        >
          <Input
            value={seo.bingVerification ?? ""}
            onChange={(e) => updateSettings(["seo", "bingVerification"], e.target.value)}
            placeholder="abc123XYZ..."
            className="font-mono text-sm"
          />
        </Field>
      </SectionCard>

      {/* ── Structured Data ── */}
      <SectionCard title="Structured Data (Google Rich Results)" icon={Code}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Enable Organisation Schema</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Adds JSON-LD markup so Google can show your organisation's logo, social profiles, and contact info in search results.
            </p>
          </div>
          <Switch
            checked={seo.structuredData !== false}
            onCheckedChange={(v) => updateSettings(["seo", "structuredData"], v)}
          />
        </div>

        {seo.structuredData !== false && (
          <div className="mt-3 p-3 bg-muted/40 rounded-xl border border-border text-[11px] text-muted-foreground font-mono leading-relaxed">
            {`{ "@type": "NGO", "name": "Spandana Care Aid Foundation", "url": "https://spandanacareaid.org", ... }`}
          </div>
        )}
      </SectionCard>

      {/* ── Crawling ── */}
      <SectionCard title="Crawling & Indexing" icon={Globe}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Allow search engines to index this site</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Turn this off only during development. Disabling blocks Google from showing your site in search results.
            </p>
          </div>
          <Switch
            checked={seo.indexable !== false}
            onCheckedChange={(v) => updateSettings(["seo", "indexable"], v)}
          />
        </div>

        <div className="flex items-start justify-between gap-4 pt-2 border-t border-border">
          <div>
            <p className="text-sm font-medium">Allow search engines to follow links</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Recommended to keep on. Disabling prevents Google from discovering other pages through this site.
            </p>
          </div>
          <Switch
            checked={seo.followLinks !== false}
            onCheckedChange={(v) => updateSettings(["seo", "followLinks"], v)}
          />
        </div>

        <div className="mt-3 p-3 bg-muted/40 rounded-xl border border-border">
          <p className="text-[11px] font-medium mb-1 text-muted-foreground">Current robots.txt directive preview:</p>
          <pre className="text-[11px] font-mono text-foreground/80">
{`User-agent: *\n${seo.indexable !== false ? "Allow: /" : "Disallow: /"}\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: https://spandanacareaid.org/sitemap.xml`}
          </pre>
        </div>
      </SectionCard>

      {/* ── Per-Page Meta ── */}
      <PerPageMeta seo={seo} updateSettings={updateSettings} />

      <div className="flex justify-end pt-2 pb-8">
        <Button className="rounded-full gap-2 px-6" onClick={saveSettings} disabled={saving}>
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save All SEO Settings</>}
        </Button>
      </div>
    </div>
  );
}

/* ── Per-page meta sub-component ── */
const SITE_PAGES = [
  { path: "/",                label: "Home" },
  { path: "/donate",          label: "Donate" },
  { path: "/fun-zone",        label: "Joy Zone" },
  { path: "/join-us",         label: "Volunteer" },
  { path: "/programs",        label: "Programs" },
  { path: "/events",          label: "Events" },
  { path: "/gallery",         label: "Gallery" },
  { path: "/blog",            label: "Blog" },
  { path: "/shop",            label: "Shop" },
  { path: "/team",            label: "Team" },
  { path: "/vision",          label: "Vision" },
  { path: "/core-values",     label: "Core Values" },
  { path: "/success-stories", label: "Success Stories" },
  { path: "/testimonials",    label: "Testimonials" },
  { path: "/get-involved",    label: "Get Involved" },
];

function PerPageMeta({
  seo,
  updateSettings,
}: {
  seo: Record<string, any>;
  updateSettings: (path: string[], value: unknown) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const pages: Record<string, { title?: string; description?: string }> = seo.pages ?? {};

  return (
    <div className="bg-card rounded-2xl border border-border p-5 mb-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <FileText size={15} className="text-primary shrink-0" />
        <h3 className="font-semibold text-sm">Per-Page Titles &amp; Descriptions</h3>
      </div>
      <p className="text-[11px] text-muted-foreground mb-4">
        Override the site-wide title and description for individual pages. These are used in the browser tab,
        Google search results, and (in production) WhatsApp / Facebook link previews.
        Leave blank to inherit the site-wide values above.
      </p>

      <div className="space-y-1">
        {SITE_PAGES.map(({ path, label }) => {
          const meta = pages[path] ?? {};
          const hasCustom = meta.title || meta.description;
          const isOpen = open === path;
          return (
            <div key={path} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : path)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-sm shrink-0">{label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground truncate">{path}</span>
                  {hasCustom && (
                    <span className="text-[9px] font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5 shrink-0">
                      Custom
                    </span>
                  )}
                </div>
                {isOpen
                  ? <ChevronUp size={13} className="text-muted-foreground shrink-0" />
                  : <ChevronDown size={13} className="text-muted-foreground shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-border space-y-3 bg-muted/20">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Page Title
                    </label>
                    <Input
                      value={meta.title ?? ""}
                      onChange={(e) => updateSettings(["seo", "pages", path, "title"], e.target.value)}
                      placeholder={`e.g. ${label} | Spandana Care Aid Foundation`}
                    />
                    <p className={`text-[11px] mt-0.5 ${(meta.title?.length ?? 0) > 60 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {meta.title?.length ?? 0} / 60 characters
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Meta Description
                    </label>
                    <Textarea
                      value={meta.description ?? ""}
                      onChange={(e) => updateSettings(["seo", "pages", path, "description"], e.target.value)}
                      className="min-h-[72px] resize-none"
                      placeholder="Brief description shown in Google search results under the page title."
                    />
                    <p className={`text-[11px] mt-0.5 ${(meta.description?.length ?? 0) > 160 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {meta.description?.length ?? 0} / 160 characters
                    </p>
                  </div>
                  {hasCustom && (
                    <button
                      onClick={() => {
                        updateSettings(["seo", "pages", path, "title"], "");
                        updateSettings(["seo", "pages", path, "description"], "");
                      }}
                      className="text-[11px] text-destructive hover:text-destructive/80 font-medium"
                    >
                      Clear custom meta for this page
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
