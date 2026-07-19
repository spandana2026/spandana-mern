// Shared building blocks used by every admin tab file (Auto-extracted from admin.tsx).
//
// NOTE: This file was missing from the original project export — every tab in
// src/pages/admin/tabs/ imports from "./shared", but the module itself wasn't
// included, which made the whole app fail to build. It's been reconstructed here
// based on how each export is used across all 24 tab files (props, behavior, and
// visual language match the rest of the admin panel).
import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Monitor, Smartphone } from "lucide-react";

/* ── SectionCard ───────────────────────────────────────────────────────────
   Collapsible card wrapper used to group a set of related fields under a title. */
export function SectionCard({
  title,
  description,
  defaultOpen = true,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div>
          <h3 className="font-serif font-semibold text-base">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {open ? <ChevronUp size={18} className="shrink-0 text-muted-foreground" /> : <ChevronDown size={18} className="shrink-0 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

/* ── Field ─────────────────────────────────────────────────────────────────
   Labeled wrapper around a single form control. */
export function Field({
  label,
  description,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

/* ── Label ─────────────────────────────────────────────────────────────────
   Plain field label — used standalone in a few tabs, and internally by Field. */
export function Label({ children }: { children: ReactNode }) {
  return <label className="text-sm font-medium text-foreground/80 block">{children}</label>;
}

/* ── DeviceTabs ────────────────────────────────────────────────────────────
   Desktop / Mobile switcher — most homepage sections have separate desktop and
   mobile copy, so each tab that edits one wraps its fields in <DeviceTabs>. */
export function DeviceTabs({ children }: { children: (view: "desktop" | "mobile") => ReactNode }) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-border p-1 bg-muted/40">
        <button
          type="button"
          onClick={() => setView("desktop")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${view === "desktop" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
        >
          <Monitor size={13} /> Desktop
        </button>
        <button
          type="button"
          onClick={() => setView("mobile")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${view === "mobile" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
        >
          <Smartphone size={13} /> Mobile
        </button>
      </div>
      {children(view)}
    </div>
  );
}

/* ── VisibilityToggleRow ──────────────────────────────────────────────────
   Show/hide switch for a homepage section, backed by settings.visibility[visKey]. */
export function VisibilityToggleRow({
  label,
  description,
  visKey,
  settings,
  updateSettings,
}: {
  label: string;
  description?: string;
  visKey: string;
  settings: { visibility?: Record<string, boolean | undefined> };
  updateSettings: (path: (string | number)[], value: unknown) => void;
}) {
  const checked = settings.visibility?.[visKey] ?? true;
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => updateSettings(["visibility", visKey], !checked)}
        className={`shrink-0 relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

/** Backwards-compatible card wrapper used by the extracted homepage tabs. */
export function VisibilityBanner(props: Parameters<typeof VisibilityToggleRow>[0]) {
  return <VisibilityToggleRow {...props} />;
}
