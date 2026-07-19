import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Images, X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  category: string;
  published: boolean;
  order: number;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data: GalleryItem[]) => {
        setItems(data.filter((i) => i.published).sort((a, b) => a.order - b.order));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];
  const filtered = activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  function openLightbox(idx: number) { setLightbox(idx); }
  function closeLightbox() { setLightbox(null); }
  function prev() { if (lightbox === null) return; setLightbox((lightbox - 1 + filtered.length) % filtered.length); }
  function next() { if (lightbox === null) return; setLightbox((lightbox + 1) % filtered.length); }

  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, filtered.length]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-x-hidden">
      <Nav />

      {/* ── Hero ── */}
      <section className="pt-28 pb-14 px-6 md:px-12 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white/90 text-sm font-medium mb-6 border border-white/20">
              <Images size={15} /> Photo Gallery
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-medium text-white mb-4 leading-tight">
              Our Work in<br /><span className="italic text-white/85">Pictures</span>
            </h1>
            <p className="text-base md:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
              Glimpses from the field — health camps, community gatherings, skill workshops, and the faces we serve every day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Category filter ── */}
      {!loading && categories.length > 1 && (
        <div className="sticky top-[5rem] z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="max-w-6xl mx-auto px-4 md:px-12 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Filter size={13} className="text-muted-foreground shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setLightbox(null); }}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  activeCategory === cat
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      <section className="py-10 px-4 md:px-12 flex-1">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-32">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-28 border border-dashed border-border rounded-2xl">
              <Images size={40} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">No photos yet</p>
              <p className="text-xs text-muted-foreground mt-1">Check back soon — we're always adding new memories.</p>
            </motion.div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-2xl bg-muted mb-3"
                    onClick={() => openLightbox(filtered.indexOf(item))}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      {item.title && (
                        <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{item.title}</p>
                      )}
                      {item.category && (
                        <span className="text-white/70 text-[10px] font-medium mt-0.5">{item.category}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/92 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 260, damping: 22 }}
              className="relative max-w-4xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filtered[lightbox].imageUrl}
                alt={filtered[lightbox].title}
                className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
              {(filtered[lightbox].title || filtered[lightbox].caption) && (
                <div className="mt-4 text-center max-w-lg">
                  {filtered[lightbox].title && (
                    <p className="text-white font-semibold text-base leading-snug">{filtered[lightbox].title}</p>
                  )}
                  {filtered[lightbox].caption && (
                    <p className="text-white/60 text-sm mt-1 leading-relaxed">{filtered[lightbox].caption}</p>
                  )}
                  {filtered[lightbox].category && (
                    <span className="inline-block mt-2 text-[11px] font-semibold uppercase tracking-widest text-white/40">{filtered[lightbox].category}</span>
                  )}
                </div>
              )}

              {/* Navigation */}
              {filtered.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="mt-3 text-white/40 text-xs font-medium">
                {lightbox + 1} / {filtered.length}
              </div>
            </motion.div>

            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
