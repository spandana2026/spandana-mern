// Auto-extracted from admin.tsx — GamesTab
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionCard, Field } from "./shared";
import {
  Save, Loader2, Plus, Trash2, Pencil, X, Eye, EyeOff,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Upload, Download, RefreshCw, ExternalLink, Lock, KeyRound,
  UserCheck, UserX, UserPlus, CalendarDays, MapPin, Clock,
  Send, History, Megaphone, Image, Globe, DollarSign, Mail,
  Star, FileText, FolderOpen, UsersRound, Gamepad2,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Switch }   from "@/components/ui/switch";

export default function GamesTab({ settings, updateSettings, saveSettings, saving }: GamesTabProps) {
  const gs = settings.gameSettings ?? {
    phonepeUpiId: "",
    prices: { online2p: 30, online4p: 50, local2p: 20, local4p: 40, solo: 30 },
    overrides: {},
  };
  const prices = gs.prices ?? { online2p: 30, online4p: 50, local2p: 20, local4p: 40, solo: 30 };
  const overrides: Record<string, GameOverride> = gs.overrides ?? {};

  function setGs(field: string, val: unknown) {
    updateSettings(["gameSettings", field], val);
  }
  function setPrice(key: string, val: number) {
    updateSettings(["gameSettings", "prices", key], val);
  }
  function setOverride(gameId: string, field: string, val: unknown) {
    const nextOverrides = { ...overrides, [gameId]: { ...(overrides[gameId] ?? {}), [field]: val } };
    updateSettings(["gameSettings", "overrides"], nextOverrides);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold flex items-center gap-2"><Gamepad2 size={22} />Games & Payments</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure game prices, names, and PhonePe payments.</p>
        </div>
        <Button className="rounded-full gap-2" onClick={saveSettings} disabled={saving}>
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save Changes</>}
        </Button>
      </div>

      {/* PhonePe */}
      <SectionCard title="💳 Spandana Care Aid Foundation — Game Payment UPI">
        <div className="bg-[#5f259f]/5 border border-[#5f259f]/20 rounded-xl px-4 py-3 text-sm text-[#5f259f] mb-2 flex items-start gap-2">
          <span className="text-lg">📱</span>
          <span>Enter the <strong>Spandana Care Aid Foundation</strong> UPI ID. All game payments go directly to Spandana — separate from the Neenas shop UPI.</span>
        </div>
        <Field label="Spandana UPI ID" description="e.g. spandanacareaid@ybl — payments will show merchant name: Spandana Care Aid Foundation">
          <Input
            value={gs.phonepeUpiId ?? ""}
            onChange={(e) => setGs("phonepeUpiId", e.target.value)}
            placeholder="spandanacareaid@ybl"
            className="font-mono"
          />
        </Field>
        {gs.phonepeUpiId ? (
          <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} /> Payments active — players will see a PhonePe pay button.
          </p>
        ) : (
          <p className="text-xs text-amber-600 font-medium mt-1">
            ⚠ No UPI ID set — payment button will show "not configured" to players.
          </p>
        )}
      </SectionCard>

      {/* Payment Gateway — future integration */}
      <SectionCard title="🔒 Payment Gateway (Future — Server-Side Verification)" defaultOpen={false}>
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Current UPI is honour-system only</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              PhonePe / GPay deep links open the payment app but the website has no way to confirm if the player actually paid.
              To enforce verified payments, you need a payment gateway. Connect one below when ready.
            </p>
          </div>
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Choose a gateway to integrate</p>
        <div className="flex flex-col gap-3">
          <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors group">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="text-sm font-semibold">Razorpay</p>
                <p className="text-xs text-muted-foreground">Most popular in India · UPI, Cards, Net Banking · 2% per txn</p>
              </div>
            </div>
            <span className="text-xs text-primary font-medium group-hover:underline">razorpay.com →</span>
          </a>
          <a href="https://www.cashfree.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors group">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏦</span>
              <div>
                <p className="text-sm font-semibold">Cashfree Payments</p>
                <p className="text-xs text-muted-foreground">Indian gateway · UPI, Cards, Wallets · Competitive rates</p>
              </div>
            </div>
            <span className="text-xs text-primary font-medium group-hover:underline">cashfree.com →</span>
          </a>
          <a href="https://business.phonepe.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors group">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-sm font-semibold">PhonePe for Business</p>
                <p className="text-xs text-muted-foreground">Official PhonePe merchant API · Direct UPI verification</p>
              </div>
            </div>
            <span className="text-xs text-primary font-medium group-hover:underline">business.phonepe.com →</span>
          </a>
        </div>
        <p className="text-[11px] text-muted-foreground mt-4 text-center">
          Once you sign up with any of the above, ask your developer to integrate the API keys here.
        </p>
      </SectionCard>

      {/* Pricing */}
      <SectionCard title="₹ Game Pricing">
        <p className="text-sm text-muted-foreground mb-3">Set the base price for each game mode. Variable-player games (Ludo) use 2P and 4P prices.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Online — 2 Players (₹)" description="e.g. TTT Online, Ludo Online 2P">
            <Input type="number" min={0} value={prices.online2p}
              onChange={(e) => setPrice("online2p", parseInt(e.target.value) || 0)} />
          </Field>
          <Field label="Online — 4 Players (₹)" description="e.g. Ludo Online 4P">
            <Input type="number" min={0} value={prices.online4p}
              onChange={(e) => setPrice("online4p", parseInt(e.target.value) || 0)} />
          </Field>
          <Field label="Local — 2 Players (₹)" description="e.g. TTT Local, Ludo Local 2P">
            <Input type="number" min={0} value={prices.local2p}
              onChange={(e) => setPrice("local2p", parseInt(e.target.value) || 0)} />
          </Field>
          <Field label="Local — 4 Players (₹)" description="e.g. Ludo Local 4P">
            <Input type="number" min={0} value={prices.local4p}
              onChange={(e) => setPrice("local4p", parseInt(e.target.value) || 0)} />
          </Field>
          <Field label="Solo (₹)" description="e.g. Memory Match, Darts, Quiz">
            <Input type="number" min={0} value={prices.solo}
              onChange={(e) => setPrice("solo", parseInt(e.target.value) || 0)} />
          </Field>
        </div>
      </SectionCard>

      {/* Per-game overrides */}
      <SectionCard title="🎮 Individual Game Settings">
        <p className="text-sm text-muted-foreground mb-4">Rename games, change emojis, or disable specific games from the Joy Zone page.</p>
        <div className="flex flex-col gap-4">
          {GAME_DEFS.map((def) => {
            const ov = overrides[def.id] ?? {};
            const isEnabled = ov.enabled !== false;
            return (
              <div key={def.id} className={`border rounded-2xl p-4 transition-all ${isEnabled ? "border-border" : "border-dashed border-muted-foreground/30 opacity-60"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{ov.emoji ?? def.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{ov.title ?? def.title}</p>
                      <p className="text-xs text-muted-foreground">{def.pricingLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{isEnabled ? "Enabled" : "Disabled"}</span>
                    <Switch checked={isEnabled} onCheckedChange={(v) => setOverride(def.id, "enabled", v)} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Display Name">
                    <Input value={ov.title ?? def.title}
                      onChange={(e) => setOverride(def.id, "title", e.target.value || def.title)}
                      placeholder={def.title} />
                  </Field>
                  <Field label="Emoji">
                    <Input value={ov.emoji ?? def.emoji}
                      onChange={(e) => setOverride(def.id, "emoji", e.target.value || def.emoji)}
                      placeholder={def.emoji} className="font-mono w-24" />
                  </Field>
                  <Field label="Tagline" description="Short description shown on the game card">
                    <Input value={ov.tagline ?? ""}
                      onChange={(e) => setOverride(def.id, "tagline", e.target.value)}
                      placeholder="e.g. Flip and match all pairs. Beat your best time!" />
                  </Field>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="flex justify-end mt-2">
        <Button className="rounded-full gap-2" onClick={saveSettings} disabled={saving}>
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save All Changes</>}
        </Button>
      </div>
    </div>
  );
}

/* ─── Dashboard Tab ──────────────────────────────────────────────────────── */
interface StatusData {
  status: string;
  timestamp: string;
  env: string;
  storage: {
    mysql: {
      configured: boolean;
      ping: "ok" | "error" | "unavailable";
      error: string | null;
      mode: "mysql" | "json-fallback";
    };
  };
}