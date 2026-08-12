import { useState } from "react";
import {
  Save, Loader2, Menu, Monitor, Palette, Type, Layout, Zap,
  Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Shield, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  settings: Record<string, unknown>;
  updateSettings: (path: (string | number)[], value: unknown) => void;
  saveSettings: () => void;
  saving: boolean;
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-5 shadow-sm scroll-mt-20">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={15} className="text-primary shrink-0" />
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

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const pickerValue = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-background"
          />
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000 or rgba(...)"
            className="flex-1 font-mono text-xs h-9"
          />
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, min, max, unit, hint }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; unit?: string; hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className="w-24 text-sm h-9"
        />
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </Field>
  );
}

function SelectField({ label, value, onChange, options, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

function RangeField({ label, value, onChange, min, max, unit }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; unit?: string;
}) {
  return (
    <Field label={`${label}: ${value}${unit ?? ""}`}>
      <input
        type="range"
        min={min}
        max={max}
        value={value ?? min}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </Field>
  );
}

const FONT_OPTIONS = [
  { value: "inherit", label: "Inherit from Theme" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Playfair Display, serif", label: "Playfair Display" },
  { value: "Lato, sans-serif", label: "Lato" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "Montserrat, sans-serif", label: "Montserrat" },
  { value: "Open Sans, sans-serif", label: "Open Sans" },
];

const POSITION_OPTIONS = [
  { value: "bottom-right", label: "Bottom Right (default)" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
];

const ANIMATION_OPTIONS = [
  { value: "slide", label: "Slide Up" },
  { value: "fade", label: "Fade In" },
  { value: "scale", label: "Scale Up" },
  { value: "none", label: "No Animation" },
];

const WEIGHT_OPTIONS = [
  { value: "400", label: "Normal (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semi-bold (600)" },
  { value: "700", label: "Bold (700)" },
];

const DEFAULT_MENU_ITEMS = [
  { emoji: "👁️", label: "Vision & Mission",         href: "/vision" },
  { emoji: "🏛️", label: "Sahara Community Centers", href: "/sahara" },
  { emoji: "📝", label: "Blog",                     href: "/blog" },
  { emoji: "❤️", label: "Donate",                   href: "/donate" },
  { emoji: "🤝", label: "Volunteer",                href: "/join-us" },
  { emoji: "🛍️", label: "Shop",                     href: "/shop" },
  { emoji: "🎮", label: "Joy Zone",                 href: "/fun-zone" },
];

type MenuItem = { emoji: string; label: string; href: string };

interface FloatingMenuSettings {
  enabled?: boolean; showMobile?: boolean; showDesktop?: boolean;
  position?: string; delaySeconds?: number; autoHideSeconds?: number; scrollTriggerPx?: number;
  animationStyle?: string; animationSpeedMs?: number;
  buttonSizePx?: number; menuWidthPx?: number; itemHeightPx?: number; itemGapPx?: number;
  iconSizePx?: number; borderRadiusPx?: number; labelFontSizePx?: number;
  labelFontWeight?: string; labelLetterSpacing?: number; fontFamily?: string;
  colorButtonBg?: string; colorButtonIcon?: string; colorMenuBg?: string;
  colorMenuText?: string; colorMenuBorder?: string; colorActiveHighlight?: string; colorShadow?: string;
  menuItems?: MenuItem[];
}

export default function FloatingMenuTab({ settings, updateSettings, saveSettings, saving }: Props) {
  const fm = (settings.floatingMenu ?? {}) as FloatingMenuSettings;

  function set(key: string, val: unknown) {
    updateSettings(["floatingMenu", key], val);
  }

  /* ── Menu items local state ── */
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = fm.menuItems;
    return Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_MENU_ITEMS;
  });

  function updateMenuItem(idx: number, field: keyof MenuItem, val: string) {
    const next = menuItems.map((item, i) => i === idx ? { ...item, [field]: val } : item);
    setMenuItems(next);
    updateSettings(["floatingMenu", "menuItems"], next);
  }

  function addMenuItem() {
    const next = [...menuItems, { emoji: "🔗", label: "New Link", href: "/" }];
    setMenuItems(next);
    updateSettings(["floatingMenu", "menuItems"], next);
  }

  function removeMenuItem(idx: number) {
    const next = menuItems.filter((_, i) => i !== idx);
    setMenuItems(next);
    updateSettings(["floatingMenu", "menuItems"], next);
  }

  function moveMenuItem(idx: number, dir: -1 | 1) {
    const next = [...menuItems];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setMenuItems(next);
    updateSettings(["floatingMenu", "menuItems"], next);
  }

  const enabled        = fm.enabled !== false;
  const showMobile     = fm.showMobile !== false;
  const showDesktop    = fm.showDesktop !== false;
  const position       = fm.position ?? "bottom-right";
  const delaySeconds   = fm.delaySeconds ?? 2;
  const autoHide       = fm.autoHideSeconds ?? 0;
  const scrollTrigger  = fm.scrollTriggerPx ?? 0;
  const animStyle      = fm.animationStyle ?? "slide";
  const animSpeed      = fm.animationSpeedMs ?? 250;
  const buttonSize     = fm.buttonSizePx ?? 52;
  const menuWidth      = fm.menuWidthPx ?? 200;
  const itemHeight     = fm.itemHeightPx ?? 44;
  const itemGap        = fm.itemGapPx ?? 8;
  const iconSize       = fm.iconSizePx ?? 18;
  const borderRadius   = fm.borderRadiusPx ?? 16;
  const labelFontSize  = fm.labelFontSizePx ?? 13;
  const labelWeight    = fm.labelFontWeight ?? "500";
  const letterSpacing  = fm.labelLetterSpacing ?? 0;
  const fontFamily     = fm.fontFamily ?? "inherit";
  const btnBg          = fm.colorButtonBg ?? "#1a5c52";
  const btnIcon        = fm.colorButtonIcon ?? "#ffffff";
  const menuBg         = fm.colorMenuBg ?? "#ffffff";
  const menuText       = fm.colorMenuText ?? "#1a1a1a";
  const menuBorder     = fm.colorMenuBorder ?? "#e5e7eb";
  const activeHighlight = fm.colorActiveHighlight ?? "#1a5c52";
  const shadowColor    = fm.colorShadow ?? "rgba(0,0,0,0.15)";

  const contentProtection = settings.contentProtection !== false;
  const donatePageCfg     = settings.donatePage as { fcraEnabled?: boolean; intlNote?: string } | undefined;
  const fcraEnabled       = donatePageCfg?.fcraEnabled !== false;
  const fcraText          = donatePageCfg?.intlNote ?? "";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Floating Menu</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure the floating navigation menu and site protection.
          </p>
        </div>
        <Button className="rounded-full gap-2" onClick={saveSettings} disabled={saving}>
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Changes</>}
        </Button>
      </div>

      {/* ── Menu Items ── */}
      <SectionCard title="Menu Items" icon={Link2}>
        <p className="text-xs text-muted-foreground -mt-2">
          These are the links shown in the floating navigation popup on mobile. Drag or use arrows to reorder.
        </p>
        <div className="space-y-2 mt-1">
          {menuItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-muted/40 rounded-xl border border-border">
              <GripVertical size={14} className="text-muted-foreground shrink-0" />
              <Input
                value={item.emoji}
                onChange={e => updateMenuItem(idx, "emoji", e.target.value)}
                placeholder="🔗"
                className="w-14 text-center text-base h-8 px-1"
              />
              <Input
                value={item.label}
                onChange={e => updateMenuItem(idx, "label", e.target.value)}
                placeholder="Page name"
                className="flex-1 h-8 text-sm"
              />
              <Input
                value={item.href}
                onChange={e => updateMenuItem(idx, "href", e.target.value)}
                placeholder="/page"
                className="w-32 h-8 text-xs font-mono"
              />
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => moveMenuItem(idx, -1)}
                  disabled={idx === 0}
                  className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => moveMenuItem(idx, 1)}
                  disabled={idx === menuItems.length - 1}
                  className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeMenuItem(idx)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addMenuItem} className="gap-1.5 rounded-full mt-1">
          <Plus size={13} />Add menu item
        </Button>
      </SectionCard>

      {/* ── Visibility & Behaviour ── */}
      <SectionCard title="Visibility & Behaviour" icon={Menu}>
        <ToggleRow label="Enable floating menu" hint="Master switch — turns the menu on or off site-wide." checked={enabled} onChange={(v) => set("enabled", v)} />
        <div className="border-t border-border pt-3 space-y-3">
          <ToggleRow label="Show on mobile" checked={showMobile} onChange={(v) => set("showMobile", v)} />
          <ToggleRow label="Show on desktop" checked={showDesktop} onChange={(v) => set("showDesktop", v)} />
        </div>
        <div className="border-t border-border pt-3">
          <SelectField label="Default position on screen" value={position} onChange={(v) => set("position", v)} options={POSITION_OPTIONS} hint="Users can also drag the menu to any position — it remembers where they left it." />
        </div>
        <div className="border-t border-border pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumberField label="Delay before appearing" value={delaySeconds} onChange={(v) => set("delaySeconds", v)} min={0} max={30} unit="sec" hint="0 = immediate" />
          <NumberField label="Auto-hide after" value={autoHide} onChange={(v) => set("autoHideSeconds", v)} min={0} max={120} unit="sec" hint="0 = never hide" />
          <NumberField label="Scroll trigger" value={scrollTrigger} onChange={(v) => set("scrollTriggerPx", v)} min={0} max={2000} unit="px" hint="0 = always show" />
        </div>
      </SectionCard>

      {/* ── Live Preview ── */}
      <SectionCard title="Live Preview" icon={Monitor}>
        <p className="text-xs text-muted-foreground -mt-2 mb-3">How the floating menu looks with the current settings.</p>
        <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden" style={{ height: 220 }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-slate-400">Your website content here</p>
          </div>
          <div
            className="absolute"
            style={{
              ...(position === "bottom-right"  ? { right: 16, bottom: 16 } : {}),
              ...(position === "bottom-left"   ? { left: 16,  bottom: 16 } : {}),
              ...(position === "bottom-center" ? { left: "50%", bottom: 16, transform: "translateX(-50%)" } : {}),
            }}
          >
            <div className="flex flex-col items-end gap-1 mb-1.5">
              {menuItems.slice(0, 4).map((item) => (
                <div key={item.href}
                  className="flex items-center gap-2 px-3 rounded-xl border shadow-sm"
                  style={{
                    height: itemHeight * 0.65,
                    minWidth: menuWidth * 0.6,
                    background: menuBg,
                    borderColor: menuBorder,
                    color: menuText,
                    fontSize: labelFontSize * 0.75,
                    fontWeight: labelWeight,
                    fontFamily,
                    letterSpacing: `${letterSpacing}px`,
                    boxShadow: `0 2px 8px ${shadowColor}`,
                    borderRadius: borderRadius * 0.5,
                  }}>
                  <span style={{ fontSize: labelFontSize * 0.85 }}>{item.emoji}</span>
                  {item.label}
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-center shadow-lg ml-auto"
              style={{
                width: buttonSize * 0.7,
                height: buttonSize * 0.7,
                background: btnBg,
                borderRadius: borderRadius * 0.5,
                boxShadow: `0 4px 16px ${shadowColor}`,
              }}>
              <Menu size={iconSize * 0.75} color={btnIcon} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Colours ── */}
      <SectionCard title="Colours" icon={Palette}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorField label="Button background" value={btnBg}           onChange={(v) => set("colorButtonBg", v)} />
          <ColorField label="Button icon"        value={btnIcon}         onChange={(v) => set("colorButtonIcon", v)} />
          <ColorField label="Menu background"    value={menuBg}          onChange={(v) => set("colorMenuBg", v)} />
          <ColorField label="Menu text"          value={menuText}        onChange={(v) => set("colorMenuText", v)} />
          <ColorField label="Menu border"        value={menuBorder}      onChange={(v) => set("colorMenuBorder", v)} />
          <ColorField label="Active highlight"   value={activeHighlight} onChange={(v) => set("colorActiveHighlight", v)} />
          <ColorField label="Shadow / glow"      value={shadowColor}     onChange={(v) => set("colorShadow", v)} />
        </div>
      </SectionCard>

      {/* ── Typography ── */}
      <SectionCard title="Typography" icon={Type}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Font family" value={fontFamily} onChange={(v) => set("fontFamily", v)} options={FONT_OPTIONS} />
          <SelectField label="Font weight" value={labelWeight} onChange={(v) => set("labelFontWeight", v)} options={WEIGHT_OPTIONS} />
          <NumberField label="Label font size" value={labelFontSize} onChange={(v) => set("labelFontSizePx", v)} min={10} max={24} unit="px" />
          <NumberField label="Letter spacing" value={letterSpacing} onChange={(v) => set("labelLetterSpacing", v)} min={-2} max={8} unit="px" />
        </div>
      </SectionCard>

      {/* ── Size & Spacing ── */}
      <SectionCard title="Size & Spacing" icon={Layout}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <RangeField label="Button size"   value={buttonSize}    onChange={(v) => set("buttonSizePx", v)}    min={36} max={80} unit="px" />
          <RangeField label="Border radius" value={borderRadius}  onChange={(v) => set("borderRadiusPx", v)}  min={0}  max={40} unit="px" />
          <NumberField label="Menu width"         value={menuWidth}   onChange={(v) => set("menuWidthPx", v)}   min={120} max={360} unit="px" />
          <NumberField label="Item height"        value={itemHeight}  onChange={(v) => set("itemHeightPx", v)}  min={32}  max={72}  unit="px" />
          <NumberField label="Icon size"          value={iconSize}    onChange={(v) => set("iconSizePx", v)}    min={12}  max={32}  unit="px" />
          <NumberField label="Gap between items"  value={itemGap}     onChange={(v) => set("itemGapPx", v)}     min={0}   max={24}  unit="px" />
        </div>
      </SectionCard>

      {/* ── Animation ── */}
      <SectionCard title="Animation" icon={Zap}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Open animation style" value={animStyle} onChange={(v) => set("animationStyle", v)} options={ANIMATION_OPTIONS} />
          <NumberField label="Animation speed" value={animSpeed} onChange={(v) => set("animationSpeedMs", v)} min={0} max={1000} unit="ms" hint="0 = instant" />
        </div>
      </SectionCard>

      {/* ── Content Protection ── */}
      <SectionCard title="Content Protection" icon={Shield}>
        <ToggleRow
          label="Block right-click & copy shortcuts"
          hint="When on, visitors can't right-click, Ctrl+C, Ctrl+U, or open DevTools. A friendly notice is shown instead."
          checked={contentProtection}
          onChange={(v) => updateSettings(["contentProtection"], v)}
        />
        <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
          This does not prevent determined users but stops casual copying of your text and images.
        </p>
      </SectionCard>

      {/* ── FCRA Notice ── */}
      <SectionCard title="FCRA / International Donation Notice" icon={Link2}>
        <ToggleRow
          label="Show FCRA notice on Donate page"
          hint="Displays the FCRA compliance message to international donors."
          checked={fcraEnabled}
          onChange={(v) => updateSettings(["donatePage", "fcraEnabled"], v)}
        />
        {fcraEnabled && (
          <Field label="Notice text" hint="Shown at the bottom of the International Donations tab.">
            <Textarea
              value={fcraText}
              onChange={e => updateSettings(["donatePage", "intlNote"], e.target.value)}
              placeholder="e.g. Spandana Care Aid Foundation is FCRA registered..."
              rows={3}
              className="text-sm resize-none"
            />
          </Field>
        )}
      </SectionCard>

      <div className="flex justify-end pt-2 pb-8">
        <Button className="rounded-full gap-2 px-6" onClick={saveSettings} disabled={saving}>
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save All Changes</>}
        </Button>
      </div>
    </div>
  );
}
