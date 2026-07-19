import { Save, Loader2, Radio, Youtube, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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

interface Props {
  settings: Record<string, unknown>;
  updateSettings: (path: string[], value: unknown) => void;
  saveSettings: () => void;
  saving: boolean;
}

interface LiveStreamConfig {
  enabled?: boolean;
  embedUrl?: string; originalUrl?: string;
  title?: string; description?: string;
  scheduledDate?: string; scheduledTime?: string;
  chatEnabled?: boolean; chatUrl?: string;
  [key: string]: unknown;
}

export default function LiveStreamTab({ settings, updateSettings, saveSettings, saving }: Props) {
  const live = (settings.liveStream ?? {}) as LiveStreamConfig;
  const isOn = live.enabled === true;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Live Webcasting</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stream your programs live. Appears as a blinking LIVE button in the navigation.
          </p>
        </div>
        <Button className="rounded-full gap-2" onClick={saveSettings} disabled={saving}>
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Changes</>}
        </Button>
      </div>

      {/* Master toggle */}
      <div className={`rounded-2xl border-2 p-5 mb-5 flex items-center justify-between gap-4 transition-colors ${isOn ? "border-red-500/40 bg-red-500/5" : "border-border bg-card"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOn ? "bg-red-500" : "bg-muted"}`}>
            <Radio size={18} className={isOn ? "text-white animate-pulse" : "text-muted-foreground"} />
          </div>
          <div>
            <p className="font-semibold text-sm">{isOn ? "🔴 LIVE — Stream is ON" : "Stream is OFF"}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isOn
                ? "The LIVE button is visible in the website navigation right now."
                : "Toggle ON when your program starts. The LIVE button will appear in the nav."}
            </p>
          </div>
        </div>
        <Switch
          checked={isOn}
          onCheckedChange={(v) => updateSettings(["liveStream", "enabled"], v)}
          className="data-[state=checked]:bg-red-500"
        />
      </div>

      {/* Stream details */}
      <SectionCard title="Stream Details" icon={Youtube}>
        <Field
          label="YouTube / Stream URL"
          hint="Paste the YouTube Live URL (e.g. https://youtube.com/live/ABC123 or a watch?v= link). It will be auto-converted to an embed."
        >
          <Input
            value={live.embedUrl ?? live.originalUrl ?? ""}
            onChange={(e) => {
              updateSettings(["liveStream", "originalUrl"], e.target.value);
              updateSettings(["liveStream", "embedUrl"], e.target.value);
            }}
            placeholder="https://www.youtube.com/live/ABC123..."
            className="font-mono text-sm"
          />
        </Field>

        <Field label="Program / Event Title">
          <Input
            value={live.title ?? ""}
            onChange={(e) => updateSettings(["liveStream", "title"], e.target.value)}
            placeholder="Sahara Health Camp — Live Coverage"
          />
        </Field>

        <Field label="Description (shown below the stream)">
          <Textarea
            value={live.description ?? ""}
            onChange={(e) => updateSettings(["liveStream", "description"], e.target.value)}
            className="min-h-[90px] resize-none"
            placeholder="Join us for a live session on community health and wellness. All are welcome!"
          />
        </Field>
      </SectionCard>

      {/* Schedule */}
      <SectionCard title="Schedule (optional)" icon={Calendar}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Date" hint="Shown below the stream title on the live page.">
            <Input
              type="date"
              value={live.scheduledDate ?? ""}
              onChange={(e) => updateSettings(["liveStream", "scheduledDate"], e.target.value)}
            />
          </Field>
          <Field label="Time">
            <Input
              type="time"
              value={live.scheduledTime ?? ""}
              onChange={(e) => updateSettings(["liveStream", "scheduledTime"], e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Live chat */}
      <SectionCard title="Live Chat (optional)" icon={MessageSquare}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-sm font-medium">Show YouTube Live Chat</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Embeds the YouTube live chat panel below the stream player.
            </p>
          </div>
          <Switch
            checked={live.chatEnabled === true}
            onCheckedChange={(v) => updateSettings(["liveStream", "chatEnabled"], v)}
          />
        </div>

        {live.chatEnabled && (
          <Field
            label="Chat Embed URL"
            hint='From YouTube Studio → Live → Share → Embed chat. Paste the full chat URL.'
          >
            <Input
              value={live.chatUrl ?? ""}
              onChange={(e) => updateSettings(["liveStream", "chatUrl"], e.target.value)}
              placeholder="https://www.youtube.com/live_chat?v=ABC123&embed_domain=spandanacareaid.org"
              className="font-mono text-sm"
            />
          </Field>
        )}
      </SectionCard>

      {/* Preview hint */}
      <div className="rounded-xl bg-muted/40 border border-border p-4 text-sm text-muted-foreground flex gap-3">
        <Radio size={16} className="shrink-0 mt-0.5 text-primary" />
        <div>
          <p className="font-medium text-foreground mb-1">How it works</p>
          <ul className="space-y-1 text-[12px] leading-relaxed list-disc list-inside">
            <li>Toggle <strong>ON</strong> → a pulsing red <strong>LIVE</strong> button appears in the website header for all visitors (desktop + mobile).</li>
            <li>Clicking it takes visitors to <strong>/live</strong> where they see the embedded stream.</li>
            <li>Toggle <strong>OFF</strong> after the program → the LIVE button disappears automatically.</li>
            <li>No need to republish the site — it updates within seconds.</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-8">
        <Button className="rounded-full gap-2 px-6" onClick={saveSettings} disabled={saving}>
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Changes</>}
        </Button>
      </div>
    </div>
  );
}
