import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BlogPostsTab from "@/components/admin/BlogPostsTab";
import { SectionCard, Field } from "./shared";
import type { SiteSettings } from "../types";

interface Props {
  settings: SiteSettings;
  updateSettings: (path: (string | number)[], value: unknown) => void;
  token: string;
  saving: boolean;
  onSave: () => void;
}

/** Page copy and post management intentionally use the maintained CRUD component. */
export default function BlogTab({ settings, updateSettings, token, saving, onSave }: Props) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionCard title="Blog Page Hero">
        <p className="text-xs text-muted-foreground -mt-1 mb-4">Customise the hero content shown on the public blog page.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Badge Text">
            <Input value={settings.blogPage?.badge ?? ""} onChange={(event) => updateSettings(["blogPage", "badge"], event.target.value)} placeholder="Stories & Insights" />
          </Field>
          <Field label="Heading">
            <Input value={settings.blogPage?.heading ?? ""} onChange={(event) => updateSettings(["blogPage", "heading"], event.target.value)} placeholder="Our Blog" />
          </Field>
        </div>
        <Field label="Subheading">
          <Textarea value={settings.blogPage?.subheading ?? ""} onChange={(event) => updateSettings(["blogPage", "subheading"], event.target.value)} className="min-h-[80px] resize-none" />
        </Field>
        <div className="flex justify-end">
          <Button size="sm" className="rounded-full gap-2" onClick={onSave} disabled={saving}>
            {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : <><Save size={12} /> Save page copy</>}
          </Button>
        </div>
      </SectionCard>

      <BlogPostsTab token={token} />
    </div>
  );
}
