import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, ArrowRight, MessageCircle } from "lucide-react";

function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function CommunityChat() {
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(true);
  const [groupLink, setGroupLink] = useState("");
  const [groupName, setGroupName] = useState("Spandana Community");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.whatsappGroupLink) setGroupLink(d.whatsappGroupLink);
        if (d?.whatsappGroupName) setGroupName(d.whatsappGroupName);
      })
      .catch(() => {});
  }, []);

  function toggle() {
    setOpen((v) => !v);
    if (!open) setHasNew(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="w-[300px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#25D366] px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <WhatsAppIcon size={18} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{groupName}</p>
                  <p className="text-white/75 text-xs mt-0.5">WhatsApp Community</p>
                </div>
              </div>
              <button onClick={toggle} className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/15">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Users size={18} className="text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Join our community</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Get updates, volunteer alerts, and connect with fellow changemakers — all on WhatsApp.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs text-muted-foreground pl-1">
                {["Program updates & events", "Volunteer opportunities", "Impact stories from the field"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              {groupLink ? (
                <a
                  href={groupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm rounded-xl py-3 transition-colors"
                >
                  <WhatsAppIcon size={16} /> Join on WhatsApp <ArrowRight size={14} />
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 bg-muted text-muted-foreground text-xs rounded-xl py-3 text-center px-3">
                  <MessageCircle size={14} /> Group link not configured yet — set it in Admin → Site Info.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button — WhatsApp green */}
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="relative w-14 h-14 bg-[#25D366] rounded-full shadow-xl flex items-center justify-center text-white"
        style={{ boxShadow: "0 4px 24px rgba(37,211,102,0.45)" }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="wa" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <WhatsAppIcon size={24} />
            </motion.div>
          )}
        </AnimatePresence>

        {hasNew && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"
          />
        )}
        {hasNew && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#25D366]"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
          />
        )}
      </motion.button>
    </div>
  );
}
