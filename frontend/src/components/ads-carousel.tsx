import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone, Pause, Play, Volume2, VolumeX } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  videoUrl?: string;
  link?: string;
  bgColor?: string;
  textColor?: string;
  enabled?: boolean;
}

type VideoType = "youtube" | "vimeo" | "direct";
interface ParsedVideo { type: VideoType; embedUrl: string; videoId?: string; }

function parseVideoEmbed(url: string): ParsedVideo | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) {
    const id = ytMatch[1];
    return { type: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&enablejsapi=1`, videoId: id };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1`, videoId: vimeoMatch[1] };
  }
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return { type: "direct", embedUrl: url };
  }
  return null;
}

const PLACEHOLDER_ADS: Ad[] = [
  {
    id: "1",
    title: "Advertise With Us",
    subtitle: "Reach thousands of visitors who care about social impact. Contact us to place your ad here.",
    bgColor: "#f8fafc",
    textColor: "#334155",
  },
];

export default function AdsCarousel() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        const allAds: Ad[] = (d?.ads ?? []).filter((a: Ad) => a.enabled !== false);
        setAds(allAds);
        setAdsEnabled(d?.adsEnabled !== false);
      })
      .catch(() => {});
  }, []);

  const displayAds = ads.length > 0 ? ads : PLACEHOLDER_ADS;

  const go = (next: number, direction: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDir(direction);
    setCurrent((next + displayAds.length) % displayAds.length);
  };

  useEffect(() => {
    if (displayAds.length <= 1 || paused) return;
    const parsed = parseVideoEmbed(displayAds[current]?.videoUrl ?? "");
    const duration = parsed ? 10000 : 6000;
    timerRef.current = setTimeout(() => go(current + 1, 1), duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [displayAds.length, paused, current]);

  const toggleMute = (parsed: ParsedVideo) => {
    const next = !muted;
    setMuted(next);
    if (parsed.type === "youtube" && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: next ? "mute" : "unMute", args: "" }), "*"
      );
    } else if (parsed.type === "vimeo" && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ method: "setVolume", value: next ? 0 : 1 }), "*"
      );
    } else if (parsed.type === "direct" && videoRef.current) {
      videoRef.current.muted = next;
    }
  };

  if (!adsEnabled) return null;

  const ad = displayAds[current];
  const hasImage = !!ad.image;
  const parsed = ad.videoUrl ? parseVideoEmbed(ad.videoUrl) : null;
  const isVideo = !!parsed;

  return (
    <section className="w-full py-2 px-8 md:px-8">
      <div className="max-w-xs mx-auto">

        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            <Megaphone size={10} />
            <span>Sponsored</span>
          </div>
          <a
            href="mailto:info@spandanacareaid.org?subject=Advertise%20with%20Spandana"
            className="text-[10px] text-primary hover:underline font-medium"
          >
            Place your ad here &amp; support our mission →
          </a>
        </div>

        {/* Card + arrows wrapper */}
        <div className="relative">

          {/* Success-stories style arrows — outside the card */}
          <button
            onClick={() => go(current - 1, -1)}
            className="absolute -left-7 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/8 border border-black/12 flex items-center justify-center hover:bg-black/15 transition-colors z-10"
            aria-label="Previous ad"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <button
            onClick={() => go(current + 1, 1)}
            className="absolute -right-7 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/8 border border-black/12 flex items-center justify-center hover:bg-black/15 transition-colors z-10"
            aria-label="Next ad"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>

          {/* Card */}
          <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-white">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={ad.id}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative w-full"
                style={{ aspectRatio: isVideo ? "9 / 16" : "1 / 1" }}
              >
                {/* ── VIDEO ── */}
                {isVideo && parsed ? (
                  <>
                    {parsed.type === "direct" ? (
                      <video
                        ref={videoRef}
                        src={parsed.embedUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay muted loop playsInline
                      />
                    ) : (
                      <iframe
                        ref={iframeRef}
                        src={parsed.embedUrl}
                        className="absolute inset-0 w-full h-full border-0"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        title={ad.title}
                      />
                    )}
                    <button
                      onClick={() => toggleMute(parsed)}
                      aria-label={muted ? "Unmute video" : "Mute video"}
                      className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors backdrop-blur-sm"
                    >
                      {muted ? <VolumeX size={14} className="text-white" /> : <Volume2 size={14} className="text-white" />}
                    </button>
                    {(ad.title || ad.link) && (
                      <>
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between z-10">
                          {ad.title && <p className="font-semibold text-white text-sm drop-shadow leading-snug line-clamp-1">{ad.title}</p>}
                          {ad.link && (
                            <a href={ad.link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-white hover:bg-white/90 rounded-full px-3 py-1 text-xs font-semibold shadow text-gray-800 transition-all shrink-0 ml-2">
                              Visit <ExternalLink size={9} />
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : hasImage ? (
                  /* ── IMAGE ── */
                  <>
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    {(ad.title || ad.subtitle || ad.link) && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 px-5 py-4">
                          {ad.title && <p className="font-bold text-white text-base leading-snug drop-shadow">{ad.title}</p>}
                          {ad.subtitle && <p className="text-white/80 text-sm mt-0.5 line-clamp-2 drop-shadow">{ad.subtitle}</p>}
                          {ad.link && (
                            <a href={ad.link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mt-2 bg-white hover:bg-white/90 rounded-full px-4 py-1.5 text-xs font-semibold shadow text-gray-800 transition-all">
                              Visit <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  /* ── TEXT ONLY ── */
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
                    style={{ background: ad.bgColor ?? "#f8fafc", color: ad.textColor ?? "#334155" }}
                  >
                    <p className="font-bold text-lg">{ad.title}</p>
                    {ad.subtitle && <p className="text-sm opacity-75">{ad.subtitle}</p>}
                    {ad.link && (
                      <a href={ad.link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-white/80 hover:bg-white border border-black/10 rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm transition-all mt-2"
                        style={{ color: ad.textColor ?? "#334155" }}>
                        Visit <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Dots + pause — always visible */}
            <div className="flex items-center justify-center gap-2 py-2 bg-white">
              {displayAds.length > 1 && (
                <div className="flex gap-1.5">
                  {displayAds.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => go(i, i > current ? 1 : -1)}
                      className={`h-1.5 rounded-full transition-all ${i === current ? "bg-primary w-5" : "bg-gray-300 w-1.5"}`}
                      aria-label={`Go to ad ${i + 1}`}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => setPaused(p => !p)}
                aria-label={paused ? "Resume auto-play" : "Pause auto-play"}
                className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                {paused
                  ? <Play size={11} className="text-gray-600 ml-0.5" />
                  : <Pause size={11} className="text-gray-600" />
                }
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
