import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import HowToPlay from "@/components/games/how-to-play";

const DARTS_STEPS = [
  { icon: "👀", text: "Watch the yellow crosshair — it moves automatically across the board." },
  { icon: "🎯", text: "Tap THROW! the moment the crosshair is over your target zone." },
  { icon: "🔴", text: "Aim for the centre — Bull's-eye scores 50 points!" },
  { icon: "🟢", text: "Inner rings score more; outer rings score less." },
  { icon: "6️⃣", text: "You get 6 throws per game." },
  { icon: "🏆", text: "Rack up as many points as you can to beat your personal best!" },
];

const THROWS = 6;
const BOARD_R = 130;

type Dart = { x: number; y: number; score: number };

function scoreFromPos(dx: number, dy: number): { score: number; zone: string; color: string } {
  const dist = Math.sqrt(dx * dx + dy * dy) / BOARD_R;
  if (dist <= 0.065)  return { score: 50, zone: "Bull's-eye!", color: "#e74c3c" };
  if (dist <= 0.135)  return { score: 25, zone: "Bull",        color: "#e74c3c" };
  if (dist <= 0.32)   return { score: 20, zone: "Triple 20",   color: "#27ae60" };
  if (dist <= 0.50)   return { score: 15, zone: "Double 15",   color: "#2980b9" };
  if (dist <= 0.70)   return { score: 10, zone: "Single 10",   color: "#2980b9" };
  if (dist <= 0.88)   return { score: 5,  zone: "Outer 5",     color: "#8e44ad" };
  if (dist <= 1.0)    return { score: 2,  zone: "Edge",        color: "#7f8c8d" };
  return { score: 0, zone: "Miss!", color: "#bdc3c7" };
}

export default function DartsGame() {
  const boardRef   = useRef<SVGSVGElement>(null);
  const [darts, setDarts]     = useState<Dart[]>([]);
  const [lastScore, setLast]  = useState<{ score: number; zone: string; color: string } | null>(null);
  const [done, setDone]       = useState(false);
  const [best, setBest]       = useState<number | null>(null);
  const [crosshair, setCrosshair] = useState({ x: 0, y: 0 });
  const animRef = useRef<number | undefined>(undefined);
  const tRef = useRef(0);

  useEffect(() => {
    const animate = (ts: number) => {
      tRef.current = ts;
      const t = ts / 1000;
      const x = Math.sin(t * 1.7) * 55 + Math.sin(t * 0.9) * 30;
      const y = Math.cos(t * 1.4) * 50 + Math.cos(t * 1.1) * 25;
      setCrosshair({ x, y });
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const throwDart = useCallback(() => {
    if (done || darts.length >= THROWS) return;
    const { x, y } = crosshair;
    const s = scoreFromPos(x, y);
    setLast(s);
    const newDarts = [...darts, { x, y, score: s.score }];
    setDarts(newDarts);
    if (newDarts.length >= THROWS) {
      const total = newDarts.reduce((a, d) => a + d.score, 0);
      setBest(prev => prev === null || total > prev ? total : prev);
      setDone(true);
    }
  }, [crosshair, darts, done]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === "Space") throwDart(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [throwDart]);

  const restart = () => { setDarts([]); setLast(null); setDone(false); };
  const total = darts.reduce((a, d) => a + d.score, 0);
  const SIZE = BOARD_R * 2 + 20;
  const C = SIZE / 2;

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center py-4">
      <div className="text-5xl mb-3">🎯</div>
      <h3 className="text-2xl font-bold mb-1">Game Over!</h3>
      <p className="text-4xl font-black text-primary mb-1">{total} pts</p>
      {best !== null && <p className="text-sm text-amber-600 font-semibold mb-4">
        {total >= best ? "🏆 New best!" : `Best: ${best} pts`}
      </p>}
      <div className="flex flex-wrap justify-center gap-2 mb-5">
        {darts.map((d, i) => {
          const s = scoreFromPos(d.x, d.y);
          return (
            <span key={i} className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: s.color + "22", color: s.color }}>
              #{i+1} {d.score}pt
            </span>
          );
        })}
      </div>
      <Button onClick={restart} className="rounded-full gap-1.5">
        <RotateCcw size={14} /> Play Again
      </Button>
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-muted-foreground">
          Throws: <span className="font-bold text-foreground">{darts.length}/{THROWS}</span>
        </span>
        <span className="text-muted-foreground">
          Score: <span className="font-bold text-primary text-lg">{total}</span>
        </span>
        {best !== null && <span className="text-xs font-semibold text-amber-600">Best {best}</span>}
      </div>

      {/* Last score flash */}
      <AnimatePresence mode="wait">
        {lastScore && (
          <motion.div key={darts.length}
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm font-bold px-4 py-1.5 rounded-full"
            style={{ background: lastScore.color + "22", color: lastScore.color }}>
            +{lastScore.score} — {lastScore.zone}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dartboard */}
      <svg ref={boardRef} width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="touch-none select-none">
        {/* Rings */}
        {[
          { r: 1.00, fill: "#c0392b" },
          { r: 0.88, fill: "#2c3e50" },
          { r: 0.70, fill: "#c0392b" },
          { r: 0.50, fill: "#2c3e50" },
          { r: 0.32, fill: "#27ae60" },
          { r: 0.135, fill: "#c0392b" },
          { r: 0.065, fill: "#2ecc71" },
        ].map(({ r, fill }, i) => (
          <circle key={i} cx={C} cy={C} r={BOARD_R * r} fill={fill}
            stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        ))}
        {/* Wire lines */}
        {[0,30,60,90,120,150].map(deg => {
          const rad = (deg * Math.PI) / 180;
          return <line key={deg}
            x1={C} y1={C}
            x2={C + Math.cos(rad) * BOARD_R}
            y2={C + Math.sin(rad) * BOARD_R}
            stroke="rgba(255,255,255,0.10)" strokeWidth={0.8} />;
        })}
        {/* Score labels */}
        {[50,25,20,15,10,5].map((s, i) => {
          const radii = [0, 0.1, 0.24, 0.41, 0.60, 0.79];
          const r = BOARD_R * radii[i];
          return <text key={s} x={C + r} y={C + 4}
            fill="rgba(255,255,255,0.5)" fontSize={9} fontWeight="bold" textAnchor="middle">
            {s}
          </text>;
        })}
        {/* Thrown darts */}
        {darts.map((d, i) => (
          <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{ transformOrigin: `${C + d.x}px ${C + d.y}px` }}>
            <circle cx={C + d.x} cy={C + d.y} r={5} fill="#f39c12" stroke="white" strokeWidth={1.5} />
            <text x={C + d.x} y={C + d.y - 9} fill="white" fontSize={8} fontWeight="bold" textAnchor="middle">
              {d.score}
            </text>
          </motion.g>
        ))}
        {/* Moving crosshair */}
        {!done && (
          <g transform={`translate(${C + crosshair.x}, ${C + crosshair.y})`}>
            <circle r={10} fill="none" stroke="#f1c40f" strokeWidth={2} />
            <line x1={-14} x2={-6} y1={0} y2={0} stroke="#f1c40f" strokeWidth={1.5} />
            <line x1={6}  x2={14} y1={0} y2={0} stroke="#f1c40f" strokeWidth={1.5} />
            <line x1={0}  x2={0}  y1={-14} y2={-6} stroke="#f1c40f" strokeWidth={1.5} />
            <line x1={0}  x2={0}  y1={6}  y2={14} stroke="#f1c40f" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      {/* Throw button */}
      {!done && (
        <motion.button
          onClick={throwDart}
          whileTap={{ scale: 0.92 }}
          className="w-full max-w-[260px] h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-lg active:shadow-sm flex items-center justify-center gap-2"
        >
          <Target size={20} /> THROW!
        </motion.button>
      )}
      <p className="text-[11px] text-muted-foreground">
        Tap THROW when the crosshair is over your target
      </p>

      <HowToPlay steps={DARTS_STEPS} tip="The crosshair slows near the edges — great for edge shots!" />
    </div>
  );
}
