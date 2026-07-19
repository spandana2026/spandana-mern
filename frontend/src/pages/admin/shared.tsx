import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { SiteSettings } from "./types";

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">{children}</label>;
}

export function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label>{children}{description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}</div>;
}

export function SectionCard({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 font-bold text-base hover:bg-muted/30 transition-colors">
        {title}
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 grid gap-4">{children}</div>}
    </div>
  );
}

export type DeviceView = "desktop" | "mobile";
export function DeviceTabs({ children }: { children: (view: DeviceView) => React.ReactNode }) {
  const [view, setView] = useState<DeviceView>("desktop");
  return (
    <div>
      <div className="flex items-stretch gap-0 mb-6 bg-muted/40 rounded-2xl p-1.5 border border-border">
        <button
          onClick={() => setView("desktop")}
          className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${view === "desktop" ? "bg-card shadow-sm text-foreground border border-border/70" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
        >
          <span className="text-base leading-none">🖥</span> Desktop Version
        </button>
        <button
          onClick={() => setView("mobile")}
          className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${view === "mobile" ? "bg-card shadow-sm text-foreground border border-border/70" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
        >
          <span className="text-base leading-none">📱</span> Mobile Version
        </button>
      </div>
      {children(view)}
    </div>
  );
}

export function VisibilityToggleRow({ label, description, visKey, settings, updateSettings }: {
  label: string; description?: string; visKey: string;
  settings: SiteSettings; updateSettings: (path: (string | number)[], val: unknown) => void;
}) {
  const visible = settings.visibility?.[visKey] !== false;
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border mb-5 transition-colors ${visible ? "bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40" : "bg-muted/30 border-border"}`}>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <span className={`text-xs font-semibold ${visible ? "text-emerald-600" : "text-muted-foreground"}`}>{visible ? "Visible" : "Hidden"}</span>
        <Switch checked={visible} onCheckedChange={(v) => updateSettings(["visibility", visKey], v)} />
      </div>
    </div>
  );
}

