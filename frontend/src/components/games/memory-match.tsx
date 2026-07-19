import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import HowToPlay from "@/components/games/how-to-play";
import { playSound } from "@/lib/sound";

const MEMORY_STEPS = [
  { icon: "🃏", text: "All 16 cards start face-down showing a \"?\"." },
  { icon: "👆", text: "Tap any card to flip it and reveal the emoji." },
  { icon: "🔍", text: "Tap a second card — if both emojis match, they stay face-up!" },
  { icon: "⏪", text: "If they don't match, both flip back after a moment. Remember where they were!" },
  { icon: "✅", text: "Match all 8 pairs to complete the game." },
  { icon: "⚡", text: "Try to finish in fewer moves and less time to beat your best score." },
];

const EMOJIS = ["🌳","💙","📚","🌸","🤝","🏥","⭐","🎨"];
function makeCards() {
  return [...EMOJIS, ...EMOJIS]
    .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
}

export default function MemoryMatch() {
  const [cards, setCards]         = useState(makeCards);
  const [picked, setPicked]       = useState<number[]>([]);
  const [moves, setMoves]         = useState(0);
  const [seconds, setSeconds]     = useState(0);
  const [running, setRunning]     = useState(false);
  const [locked, setLocked]       = useState(false);
  const [done, setDone]           = useState(false);
  const [best, setBest]           = useState<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const flip = useCallback((idx: number) => {
    if (locked || cards[idx].matched || cards[idx].flipped) return;
    if (!running) setRunning(true);
    playSound("tick");

    const next = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    const newPicked = [...picked, idx];
    setCards(next);

    if (newPicked.length === 1) {
      setPicked(newPicked);
      return;
    }

    setMoves(m => m + 1);
    setLocked(true);
    const [a, b] = newPicked;
    if (next[a].emoji === next[b].emoji) {
      const matched = next.map((c, i) =>
        i === a || i === b ? { ...c, matched: true } : c
      );
      playSound("pop");
      setCards(matched);
      setPicked([]);
      setLocked(false);
      if (matched.every(c => c.matched)) {
        setRunning(false);
        setDone(true);
        setBest(prev => prev === null || seconds < prev ? seconds : prev);
        setTimeout(() => playSound("win"), 300);
      }
    } else {
      setTimeout(() => {
        playSound("mismatch");
        setCards(prev => prev.map((c, i) =>
          i === a || i === b ? { ...c, flipped: false } : c
        ));
        setPicked([]);
        setLocked(false);
      }, 900);
    }
  }, [cards, picked, locked, running, seconds]);

  function restart() {
    setCards(makeCards());
    setPicked([]);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    setLocked(false);
    setDone(false);
  }

  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-bold mb-1">Matched all pairs!</h3>
      <p className="text-muted-foreground text-sm mb-5">
        {moves} moves · {fmt(seconds)} · {best !== null && best <= seconds ? "🏆 New best!" : ""}
      </p>
      <div className="flex justify-center gap-4 mb-2">
        <div className="flex flex-col items-center bg-primary/5 rounded-2xl px-5 py-3">
          <Zap size={16} className="text-primary mb-1" />
          <span className="text-2xl font-bold">{moves}</span>
          <span className="text-xs text-muted-foreground">Moves</span>
        </div>
        <div className="flex flex-col items-center bg-primary/5 rounded-2xl px-5 py-3">
          <Clock size={16} className="text-primary mb-1" />
          <span className="text-2xl font-bold">{fmt(seconds)}</span>
          <span className="text-xs text-muted-foreground">Time</span>
        </div>
        {best !== null && (
          <div className="flex flex-col items-center bg-amber-50 rounded-2xl px-5 py-3">
            <span className="text-sm mb-1">🏆</span>
            <span className="text-2xl font-bold">{fmt(best)}</span>
            <span className="text-xs text-muted-foreground">Best</span>
          </div>
        )}
      </div>
      <Button onClick={restart} className="rounded-full mt-4 gap-1.5">
        <RotateCcw size={14} /> Play Again
      </Button>
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stats bar */}
      <div className="flex items-center gap-5 text-sm">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Zap size={13} className="text-primary" />
          <span className="font-bold text-foreground">{moves}</span> moves
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock size={13} className="text-primary" />
          <span className="font-bold text-foreground font-mono">{fmt(seconds)}</span>
        </span>
        {best !== null && (
          <span className="text-xs text-amber-600 font-semibold">Best {fmt(best)}</span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, idx) => (
          <motion.button
            key={card.id}
            onClick={() => flip(idx)}
            whileTap={{ scale: 0.9 }}
            className="w-[68px] h-[68px] rounded-xl relative cursor-pointer"
            style={{ perspective: 600 }}
          >
            <motion.div
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.32 }}
              style={{ transformStyle: "preserve-3d", position: "relative", width: "100%", height: "100%" }}
            >
              {/* Back */}
              <div className="absolute inset-0 rounded-xl bg-primary flex items-center justify-center"
                style={{ backfaceVisibility: "hidden" }}>
                <span className="text-white/40 text-xl font-black">?</span>
              </div>
              {/* Front */}
              <div className={`absolute inset-0 rounded-xl flex items-center justify-center text-3xl
                ${card.matched ? "bg-green-100 border-2 border-green-400" : "bg-amber-50 border-2 border-amber-200"}`}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                {card.emoji}
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>

      <Button onClick={restart} variant="outline" size="sm" className="rounded-full gap-1.5 mt-1">
        <RotateCcw size={13} /> Shuffle & Restart
      </Button>

      <HowToPlay steps={MEMORY_STEPS} tip="Focus on the position of unmatched cards — memory beats luck every time!" />
    </div>
  );
}
