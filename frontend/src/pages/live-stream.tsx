import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Radio, Calendar, Clock, ExternalLink } from "lucide-react";
import Nav from "@/components/nav";
import { Button } from "@/components/ui/button";

interface LiveSettings {
  enabled: boolean;
  title: string;
  description: string;
  embedUrl: string;
  originalUrl: string;
  scheduledDate: string;
  scheduledTime: string;
  chatEnabled: boolean;
  chatUrl: string;
}

function toEmbedUrl(raw: string): string {
  if (!raw) return "";
  // Already an embed URL
  if (raw.includes("youtube.com/embed/") || raw.includes("youtu.be/embed/")) return raw;
  // youtube.com/watch?v=ID
  const watchMatch = raw.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`;
  // youtu.be/ID
  const shortMatch = raw.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1`;
  // youtube.com/live/ID
  const liveMatch = raw.match(/youtube\.com\/live\/([\w-]+)/);
  if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1`;
  return raw;
}

export default function LiveStreamPage() {
  const [live, setLive] = useState<LiveSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setLive(d?.liveStream ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0 });
  }, []);

  const embedUrl = live ? toEmbedUrl(live.embedUrl || live.originalUrl || "") : "";

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-28 md:pt-24 pb-16 px-4 md:px-8 max-w-5xl mx-auto">

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (!live || !live.enabled) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-24 gap-6"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Radio size={36} className="text-primary/50" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold mb-2">No Live Stream Right Now</h1>
              <p className="text-muted-foreground max-w-sm">
                There is no live program running at the moment. Check back when an event is scheduled.
              </p>
            </div>
          </motion.div>
        )}

        {!loading && live && live.enabled && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse shadow-md">
                  <Radio size={12} />
                  LIVE
                </span>
                <h1 className="text-xl md:text-2xl font-serif font-bold leading-tight">
                  {live.title || "Live Program"}
                </h1>
              </div>

              {live.originalUrl && (
                <Button asChild variant="outline" size="sm" className="rounded-full gap-1.5 self-start md:self-auto">
                  <a href={live.originalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={13} />
                    Open in YouTube
                  </a>
                </Button>
              )}
            </div>

            {/* Meta */}
            {(live.scheduledDate || live.scheduledTime) && (
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {live.scheduledDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {live.scheduledDate}
                  </span>
                )}
                {live.scheduledTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {live.scheduledTime}
                  </span>
                )}
              </div>
            )}

            {/* Player */}
            {embedUrl ? (
              <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-xl border border-border" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={embedUrl}
                  title={live.title || "Live Stream"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <div className="w-full rounded-2xl bg-muted/40 border border-border flex items-center justify-center" style={{ minHeight: 320 }}>
                <p className="text-muted-foreground text-sm">Stream URL not configured yet.</p>
              </div>
            )}

            {/* Live Chat */}
            {live.chatEnabled && live.chatUrl && (
              <div className="rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: 480 }}>
                <iframe
                  src={live.chatUrl}
                  title="Live Chat"
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Description */}
            {live.description && (
              <div className="bg-primary/5 rounded-2xl border border-primary/10 p-5">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {live.description}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
