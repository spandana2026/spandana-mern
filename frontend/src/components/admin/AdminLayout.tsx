import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LogOut, Monitor, Tablet, Smartphone, ExternalLink,
  PanelRight, Maximize2, RefreshCw, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminNav from "./AdminNav";

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

type DeviceSize = "mobile" | "tablet" | "desktop";
const DEVICES: { id: DeviceSize; label: string; icon: React.ElementType; width: number }[] = [
  { id: "mobile",  label: "Mobile",  icon: Smartphone, width: 375  },
  { id: "tablet",  label: "Tablet",  icon: Tablet,     width: 768  },
  { id: "desktop", label: "Desktop", icon: Monitor,    width: 1280 },
];

export default function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [device,      setDevice]      = useState<DeviceSize>("mobile");
  const [overlayDev,  setOverlayDev]  = useState<DeviceSize>("mobile");
  const [previewPath, setPreviewPath] = useState("/");

  const iframeRef        = useRef<HTMLIFrameElement>(null);
  const settingsRef      = useRef<unknown>(null);
  const navigatedPathRef = useRef<string>("/");

  function closeDrawer() { setDrawerOpen(false); }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const base   = typeof window !== "undefined"
    ? import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""
    : "";

  function iframeSrc(path: string) {
    return origin + base + path;
  }

  function postToIframe(msg: unknown) {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  }

  function sendPreviewSettings(s: unknown) {
    postToIframe({ type: "SPANDANA_LIVE_PREVIEW", settings: s });
  }

  function navigatePreview(path: string) {
    if (navigatedPathRef.current !== path) {
      navigatedPathRef.current = path;
      postToIframe({ type: "SPANDANA_NAVIGATE", path });
    }
  }

  function handleIframeLoad() {
    navigatedPathRef.current = previewPath;
    if (settingsRef.current) {
      setTimeout(() => sendPreviewSettings(settingsRef.current), 150);
    }
  }

  useEffect(() => {
    window.__spandanaPreview = (settings: unknown) => {
      settingsRef.current = settings;
      if (panelOpen) sendPreviewSettings(settings);
    };
    window.__spandanaPreviewPath = (path: string) => {
      setPreviewPath(path);
    };
    return () => {
      delete window.__spandanaPreview;
      delete window.__spandanaPreviewPath;
    };
  }, [panelOpen]);

  useEffect(() => {
    if (panelOpen) navigatePreview(previewPath);
  }, [previewPath, panelOpen]);

  useEffect(() => {
    if (panelOpen && settingsRef.current) {
      setTimeout(() => sendPreviewSettings(settingsRef.current), 200);
    }
  }, [panelOpen]);

  const activeDevice = DEVICES.find((d) => d.id === device)!;

  const panelWidth = 420;

  return (
    <div className="h-dvh overflow-hidden bg-muted/30 flex flex-col">

      {/* ── Top header ── */}
      <header className="bg-primary text-primary-foreground px-4 md:px-6 py-3 flex items-center justify-between shadow-md shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          <img src="/logo.png" alt="Spandana" className="h-8 md:h-9 w-auto brightness-0 invert" />
          <div className="hidden sm:block">
            <p className="font-bold text-base leading-tight">Spandana Admin</p>
            <p className="text-xs text-white/60">Content Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-2">
          {/* Desktop: toggle side panel */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.innerWidth >= 768) {
                setPanelOpen((v) => !v);
              } else {
                setOverlayOpen(true);
              }
            }}
            className={`rounded-full border-white/30 hover:bg-white/10 bg-transparent gap-1.5 min-h-[36px] transition-colors ${panelOpen ? "bg-white/15 text-white border-white/50" : "text-white"}`}
          >
            <PanelRight size={14} />
            <span className="hidden sm:inline">{panelOpen ? "Hide Preview" : "Live Preview"}</span>
          </Button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
          >
            <ExternalLink size={12} /> View Site
          </a>

          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/30 text-white hover:bg-white/10 bg-transparent gap-1.5 min-h-[36px]"
            onClick={onLogout}
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* ── Body: sidebar + content + preview panel ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Desktop sidebar */}
        <aside className="w-56 bg-card border-r border-border hidden md:flex flex-col shrink-0 overflow-hidden">
          <AdminNav />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              key="mobile-drawer-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 md:hidden"
            >
              <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} aria-hidden="true" />
              <motion.div
                key="mobile-drawer-panel"
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 top-0 bottom-0 w-64 bg-card shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary shrink-0">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Spandana" className="h-8 w-auto brightness-0 invert" />
                    <div>
                      <p className="font-bold text-sm text-white leading-tight">Admin</p>
                      <p className="text-[10px] text-white/60">Content Management</p>
                    </div>
                  </div>
                  <button onClick={closeDrawer}
                    className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close navigation menu">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <AdminNav onItemClick={closeDrawer} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto p-5 md:p-10 [scrollbar-gutter:stable]">
          {children}
        </main>

        {/* ── Live Preview Side Panel (desktop) ── */}
        <AnimatePresence>
          {panelOpen && (
            <motion.aside
              key="preview-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: panelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:flex flex-col bg-[#0c1120] border-l border-white/10 shrink-0 overflow-hidden"
              style={{ width: panelWidth }}
            >
              {/* Panel toolbar */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 shrink-0 gap-2">
                <div className="flex items-center gap-1 bg-white/8 rounded-xl p-0.5">
                  {DEVICES.map((d) => {
                    const Icon = d.icon;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setDevice(d.id)}
                        title={`${d.label} (${d.width}px)`}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                          device === d.id
                            ? "bg-primary text-white shadow-sm"
                            : "text-white/50 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Icon size={12} />
                        <span className="hidden lg:inline">{d.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (iframeRef.current) {
                        iframeRef.current.src = iframeSrc(previewPath);
                      }
                    }}
                    title="Refresh preview"
                    className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <RefreshCw size={13} />
                  </button>
                  <button
                    onClick={() => setOverlayOpen(true)}
                    title="Full screen preview"
                    className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Maximize2 size={13} />
                  </button>
                  <button
                    onClick={() => setPanelOpen(false)}
                    title="Close preview"
                    className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Live badge */}
              <div className="px-3 py-1.5 border-b border-white/5 flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE PREVIEW
                </span>
                <span className="text-[10px] text-white/30 truncate">{previewPath}</span>
              </div>

              {/* Preview frame area */}
              <div className="flex-1 overflow-auto bg-[#080d18] flex items-start justify-center py-3 px-2">
                <div
                  className="bg-white rounded-xl shadow-2xl overflow-hidden border border-white/10 transition-all duration-200"
                  style={{
                    width: Math.min(activeDevice.width, panelWidth - 16),
                    minHeight: 500,
                  }}
                >
                  {/* Mini browser chrome */}
                  <div className="bg-[#f1f3f4] border-b border-gray-200 px-3 py-1.5 flex items-center gap-1.5 shrink-0">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-1.5 bg-white rounded px-2 py-0.5 text-[9px] text-gray-400 border border-gray-200 truncate">
                      {origin}{base}{previewPath}
                    </div>
                    <a
                      href={iframeSrc(previewPath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronRight size={11} />
                    </a>
                  </div>

                  <iframe
                    ref={iframeRef}
                    src={iframeSrc("/")}
                    title="Live Preview"
                    className="w-full border-0"
                    style={{
                      height: 640,
                      width: Math.min(activeDevice.width, panelWidth - 16),
                    }}
                    onLoad={handleIframeLoad}
                  />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── Full-screen Overlay Preview ── */}
      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            key="preview-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex flex-col"
          >
            <div className="flex items-center justify-between px-4 md:px-8 py-3 bg-[#0a0f1e] border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <p className="text-white font-bold text-sm">Website Preview</p>
                <div className="flex items-center gap-1 bg-white/8 rounded-xl p-1">
                  {DEVICES.map((d) => {
                    const Icon = d.icon;
                    return (
                      <button key={d.id} onClick={() => setOverlayDev(d.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          overlayDev === d.id
                            ? "bg-primary text-white shadow-sm"
                            : "text-white/60 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Icon size={13} />
                        <span className="hidden sm:inline">{d.label}</span>
                        <span className="hidden sm:inline text-[10px] opacity-60">({d.width}px)</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={iframeSrc(previewPath)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10">
                  <ExternalLink size={12} /> Open in new tab
                </a>
                <button onClick={() => setOverlayOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-start justify-center py-6 px-4">
              <motion.div
                key={overlayDev}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                style={{
                  width: DEVICES.find((d) => d.id === overlayDev)!.width,
                  minHeight: 800,
                  maxWidth: "100%",
                }}
              >
                <div className="bg-[#f1f3f4] border-b border-gray-200 px-4 py-2 flex items-center gap-2 shrink-0">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-2 bg-white rounded-md px-3 py-1 text-[11px] text-gray-500 border border-gray-200 truncate">
                    {origin}{base}{previewPath}
                  </div>
                  <Monitor size={12} className="text-gray-400 shrink-0" />
                </div>
                <iframe
                  src={iframeSrc(previewPath)}
                  title="Site Preview"
                  className="w-full border-0"
                  style={{ height: 800 }}
                  loading="lazy"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
