import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, GripVertical } from "lucide-react";

const STORAGE_KEY  = "spandana_floatmenu_seen";
const POSITION_KEY = "spandana_floatmenu_pos";

const DEFAULT_ITEMS = [
  { label: "Vision & Mission",         href: "/vision",    emoji: "👁️" },
  { label: "Sahara Community Centers", href: "/sahara",    emoji: "🏛️" },
  { label: "Blog",                     href: "/blog",      emoji: "📝" },
  { label: "Donate",                   href: "/donate",    emoji: "❤️" },
  { label: "Volunteer",                href: "/volunteer", emoji: "🤝" },
  { label: "Shop",                     href: "/shop",      emoji: "🛍️" },
  { label: "Joy Zone",                 href: "/fun-zone",  emoji: "🎮" },
];

interface Props { timerSeconds?: number }

export default function FloatingMenuPreview({ timerSeconds = 4 }: Props) {
  const VISIBLE_MS = (timerSeconds > 0 ? timerSeconds : 4) * 1000;
  const [visible, setVisible] = useState(false);
  const [items, setItems]     = useState(DEFAULT_ITEMS);
  const dismissTimer          = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((d) => {
        const saved = d?.floatingMenu?.menuItems;
        if (Array.isArray(saved) && saved.length > 0) setItems(saved);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try { if (localStorage.getItem(STORAGE_KEY)) return; } catch {}

    const showTimer = setTimeout(() => {
      setVisible(true);
      try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
      dismissTimer.current = setTimeout(() => setVisible(false), VISIBLE_MS);
    }, 3000);

    const onMenuOpen = () => {
      clearTimeout(showTimer);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      setVisible(false);
    };

    window.addEventListener("main-menu-open", onMenuOpen);
    return () => {
      clearTimeout(showTimer);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      window.removeEventListener("main-menu-open", onMenuOpen);
    };
  }, [VISIBLE_MS]);

  /* ── Drag ── */
  const menuRef  = useRef<HTMLDivElement>(null);
  const [pos, setPos]       = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragData = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(POSITION_KEY);
      if (raw) setPos(JSON.parse(raw));
    } catch {}
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragData.current = { startX: e.clientX, startY: e.clientY, origX: rect.left, origY: rect.top };
    setDragging(true);
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || !dragData.current) return;
    const el = menuRef.current;
    const dx = e.clientX - dragData.current.startX;
    const dy = e.clientY - dragData.current.startY;
    const newX = Math.max(4, Math.min(window.innerWidth  - (el?.offsetWidth  ?? 176) - 4, dragData.current.origX + dx));
    const newY = Math.max(72, Math.min(window.innerHeight - (el?.offsetHeight ?? 300) - 8, dragData.current.origY + dy));
    setPos({ x: newX, y: newY });
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (pos) {
      try { localStorage.setItem(POSITION_KEY, JSON.stringify(pos)); } catch {}
    }
    dragData.current = null;
  }

  const posStyle: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y }
    : { top: "50%", right: 12, transform: "translateY(-50%)" };

  return (
    <div className="md:hidden">
      <AnimatePresence>
        {visible && (
          <motion.div
            ref={menuRef}
            key="floating-menu"
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed z-40 w-44 rounded-2xl overflow-hidden border border-white/20 select-none"
            style={{
              ...posStyle,
              background: "rgba(160,200,240,0.18)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              boxShadow: "0 4px 20px rgba(0,20,80,0.12)",
              cursor: dragging ? "grabbing" : "default",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/15 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-1.5">
                <GripVertical size={10} className="text-white/50 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Explore</span>
              </div>
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => setVisible(false)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                aria-label="Close"
              >
                <X size={11} />
              </button>
            </div>

            <ul className="flex flex-col py-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onPointerDown={e => e.stopPropagation()}
                    onClick={() => setVisible(false)}
                    className="flex items-center gap-2.5 px-3 py-[7px] text-white/85 hover:text-white hover:bg-white/12 active:bg-white/20 transition-colors"
                  >
                    <span className="text-[13px] shrink-0 leading-none">{item.emoji}</span>
                    <span className="text-[12px] font-medium leading-none">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
