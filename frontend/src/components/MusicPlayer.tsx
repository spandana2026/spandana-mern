import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Music, X, Volume2, VolumeX } from "lucide-react";

interface Track {
  title: string;
  artist?: string;
  url: string;
}

export default function MusicPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [muted, setMuted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<Track | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((d) => {
        if (d?.musicEnabled === false) return;
        const pl = d?.musicPlaylist;
        if (Array.isArray(pl) && pl.length > 0) {
          setTracks(pl.filter(t => t?.url));
        }
      })
      .catch(() => {});
  }, []);

  const currentTrack = tracks[currentIdx] ?? null;

  const loadTrack = useCallback((idx: number, play: boolean) => {
    const t = tracks[idx];
    if (!t || !audioRef.current) return;
    trackRef.current = t;
    audioRef.current.src = t.url;
    audioRef.current.load();
    if (play) audioRef.current.play().catch(() => setIsPlaying(false));
  }, [tracks]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", () => {
        setCurrentIdx(i => {
          const next = (i + 1) % tracks.length;
          return next;
        });
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (tracks.length > 0 && !visible && !dismissed) {
      setVisible(true);
    }
  }, [tracks]);

  useEffect(() => {
    if (!audioRef.current || tracks.length === 0) return;
    const wasPlaying = isPlaying;
    loadTrack(currentIdx, wasPlaying);
  }, [currentIdx, tracks]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
  }, [muted]);

  function togglePlay() {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || audioRef.current.src === window.location.href) {
        loadTrack(currentIdx, true);
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  }

  function prev() {
    setCurrentIdx(i => (i - 1 + tracks.length) % tracks.length);
  }

  function next() {
    setCurrentIdx(i => (i + 1) % tracks.length);
  }

  function dismiss() {
    audioRef.current?.pause();
    setIsPlaying(false);
    setVisible(false);
    setDismissed(true);
  }

  if (!visible || tracks.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          style={{ width: minimized ? "auto" : "min(calc(100vw - 32px), 400px)" }}>

          {minimized ? (
            /* ── Mini pill ── */
            <div className="flex items-center gap-2 bg-gray-900/95 backdrop-blur-lg text-white rounded-full px-3 py-2 shadow-2xl border border-white/10">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                onClick={() => setMinimized(false)}
                className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors max-w-[140px]">
                <Music size={11} className="shrink-0 text-violet-400" />
                <span className="truncate">{currentTrack?.title ?? "Music"}</span>
              </button>
            </div>
          ) : (
            /* ── Full player ── */
            <div className="bg-gray-900/95 backdrop-blur-lg text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <Music size={13} className="text-violet-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Now Playing</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMinimized(true)}
                    className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors text-xs">
                    —
                  </button>
                  <button
                    onClick={dismiss}
                    className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Track info */}
              <div className="px-4 pb-3">
                <AnimatePresence mode="wait">
                  <motion.div key={currentIdx}
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}>
                    <p className="font-bold text-sm leading-tight truncate">{currentTrack?.title ?? "—"}</p>
                    {currentTrack?.artist && (
                      <p className="text-xs text-white/50 mt-0.5 truncate">{currentTrack.artist}</p>
                    )}
                    <p className="text-[10px] text-white/30 mt-0.5">{currentIdx + 1} / {tracks.length}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-2 px-4 pb-4">
                <button onClick={() => setMuted(v => !v)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                  {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={prev}
                    disabled={tracks.length <= 1}
                    className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors disabled:opacity-30">
                    <SkipBack size={17} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors shadow-lg">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                  </button>
                  <button onClick={next}
                    disabled={tracks.length <= 1}
                    className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors disabled:opacity-30">
                    <SkipForward size={17} />
                  </button>
                </div>
                <div className="w-8" />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
