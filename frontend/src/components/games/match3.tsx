import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import HowToPlay from "./how-to-play";
import { playSound } from "@/lib/sound";

const GRID = 7;
const TYPES = 5;
const MAX_MOVES = 25;

const CANDY = [
  { bg: "radial-gradient(circle at 35% 30%, #ffb3d1 0%, #ff6b9d 45%, #c2185b 100%)", shadow: "rgba(255,107,157,0.55)", ring: "#ff6b9d" },
  { bg: "radial-gradient(circle at 35% 30%, #d9a0ff 0%, #a855f7 45%, #6d28d9 100%)", shadow: "rgba(168,85,247,0.55)",  ring: "#a855f7" },
  { bg: "radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 45%, #1d4ed8 100%)", shadow: "rgba(59,130,246,0.55)",  ring: "#3b82f6" },
  { bg: "radial-gradient(circle at 35% 30%, #86efac 0%, #22c55e 45%, #15803d 100%)", shadow: "rgba(34,197,94,0.55)",   ring: "#22c55e" },
  { bg: "radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 45%, #b45309 100%)", shadow: "rgba(245,158,11,0.55)",  ring: "#f59e0b" },
];

type Cell = number; // 0-4 candy type, -1 = empty

function noInitialMatch(g: Cell[][], r: number, c: number, t: number): boolean {
  if (c >= 2 && g[r][c - 1] === t && g[r][c - 2] === t) return false;
  if (r >= 2 && g[r - 1][c] === t && g[r - 2][c] === t) return false;
  return true;
}

function makeGrid(): Cell[][] {
  const g: Cell[][] = [];
  for (let r = 0; r < GRID; r++) {
    g[r] = [];
    for (let c = 0; c < GRID; c++) {
      let t: number;
      do { t = Math.floor(Math.random() * TYPES); }
      while (!noInitialMatch(g, r, c, t));
      g[r][c] = t;
    }
  }
  return g;
}

function findMatches(g: Cell[][]): Set<string> {
  const m = new Set<string>();
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c <= GRID - 3; c++) {
      const t = g[r][c];
      if (t < 0) continue;
      if (g[r][c + 1] === t && g[r][c + 2] === t) {
        let e = c + 2;
        while (e + 1 < GRID && g[r][e + 1] === t) e++;
        for (let i = c; i <= e; i++) m.add(`${r},${i}`);
      }
    }
  }
  for (let c = 0; c < GRID; c++) {
    for (let r = 0; r <= GRID - 3; r++) {
      const t = g[r][c];
      if (t < 0) continue;
      if (g[r + 1][c] === t && g[r + 2][c] === t) {
        let e = r + 2;
        while (e + 1 < GRID && g[e + 1][c] === t) e++;
        for (let i = r; i <= e; i++) m.add(`${i},${c}`);
      }
    }
  }
  return m;
}

function removeMatches(g: Cell[][], ms: Set<string>): Cell[][] {
  const ng = g.map(row => [...row]);
  for (const k of ms) {
    const [r, c] = k.split(",").map(Number);
    ng[r][c] = -1;
  }
  return ng;
}

function applyGravity(g: Cell[][]): Cell[][] {
  const ng = g.map(row => [...row]);
  for (let c = 0; c < GRID; c++) {
    const vals: number[] = [];
    for (let r = GRID - 1; r >= 0; r--) {
      if (ng[r][c] >= 0) vals.push(ng[r][c]);
    }
    while (vals.length < GRID) vals.push(Math.floor(Math.random() * TYPES));
    for (let r = GRID - 1; r >= 0; r--) {
      ng[r][c] = vals[GRID - 1 - r];
    }
  }
  return ng;
}

const HOW_TO_STEPS = [
  { icon: "👆", text: "Tap a candy to select it (it glows)." },
  { icon: "👆", text: "Tap an adjacent candy to swap them." },
  { icon: "🍬", text: "Match 3 or more in a row or column to score!" },
  { icon: "⛓️", text: "Cascades keep scoring automatically — no move needed." },
  { icon: "🏆", text: `Get the highest score in ${MAX_MOVES} moves.` },
];

export default function Match3Game() {
  const [grid, setGrid]         = useState<Cell[][]>(makeGrid);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [score, setScore]       = useState(0);
  const [moves, setMoves]       = useState(MAX_MOVES);
  const [busy, setBusy]         = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [popping, setPopping]   = useState<Set<string>>(new Set());
  const [combo, setCombo]       = useState(0);
  const busyRef = useRef(false);

  useEffect(() => { busyRef.current = busy; }, [busy]);

  const cascade = useCallback((g: Cell[][], extraScore = 0, comboCount = 0) => {
    const ms = findMatches(g);
    if (ms.size === 0) {
      setScore(s => s + extraScore);
      setBusy(false);
      setPopping(new Set());
      if (moves <= 0) setTimeout(() => setGameOver(true), 400);
      return;
    }
    const pts = ms.size * 10 * (comboCount + 1);
    setPopping(ms);
    setCombo(comboCount + 1);
    if (comboCount >= 1) {
      playSound("combo");
    } else {
      playSound("match");
    }
    setTimeout(() => {
      const next = applyGravity(removeMatches(g, ms));
      setGrid(next);
      setPopping(new Set());
      setTimeout(() => cascade(next, extraScore + pts, comboCount + 1), 250);
    }, 380);
  }, [moves]);

  function tap(r: number, c: number) {
    if (busyRef.current || gameOver) return;
    if (!selected) { playSound("tick"); setSelected([r, c]); return; }
    const [sr, sc] = selected;
    if (sr === r && sc === c) { setSelected(null); return; }
    const adjacent = (Math.abs(r - sr) + Math.abs(c - sc)) === 1;
    if (!adjacent) { playSound("tick"); setSelected([r, c]); return; }

    const ng = grid.map(row => [...row]);
    [ng[r][c], ng[sr][sc]] = [ng[sr][sc], ng[r][c]];
    const ms = findMatches(ng);
    if (ms.size === 0) { playSound("mismatch"); setSelected(null); return; }
    playSound("swap");

    setSelected(null);
    setBusy(true);
    busyRef.current = true;
    const newMoves = moves - 1;
    setMoves(newMoves);
    setPopping(ms);
    setCombo(1);
    setTimeout(() => {
      const next = applyGravity(removeMatches(ng, ms));
      setGrid(next);
      setPopping(new Set());
      if (newMoves <= 0) {
        const bonusPts = ms.size * 10;
        setScore(s => s + bonusPts);
        setBusy(false);
        setTimeout(() => setGameOver(true), 350);
      } else {
        setTimeout(() => cascade(next, ms.size * 10, 1), 250);
      }
    }, 380);
  }

  function restart() {
    setGrid(makeGrid());
    setSelected(null);
    setScore(0);
    setMoves(MAX_MOVES);
    setBusy(false);
    busyRef.current = false;
    setGameOver(false);
    setPopping(new Set());
    setCombo(0);
  }

  const movesLeft = moves;
  const pct = (movesLeft / MAX_MOVES) * 100;

  return (
    <div className="select-none">
      {/* Score bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Score</p>
          <p className="text-2xl font-black text-primary leading-none">{score}</p>
        </div>

        <AnimatePresence mode="wait">
          {combo > 1 && (
            <motion.div key={combo}
              initial={{ scale: 0.5, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-center">
              <p className="text-xs font-black text-amber-500 uppercase">🔥 Combo ×{combo}!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Moves</p>
          <p className={`text-2xl font-black leading-none ${movesLeft <= 5 ? "text-rose-500" : "text-foreground"}`}>{movesLeft}</p>
        </div>
      </div>

      {/* Moves bar */}
      <div className="w-full bg-muted rounded-full h-1.5 mb-4">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${movesLeft <= 5 ? "bg-rose-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }} />
      </div>

      {/* Grid */}
      <div className="relative">
        <div
          className="grid gap-1.5 mx-auto"
          style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, maxWidth: "min(100%, 360px)" }}>
          {grid.map((row, r) =>
            row.map((type, c) => {
              const key = `${r},${c}`;
              const isSel   = selected?.[0] === r && selected?.[1] === c;
              const isPop   = popping.has(key);
              const candy   = type >= 0 ? CANDY[type] : null;
              return (
                <motion.button
                  key={key}
                  animate={{
                    scale: isPop ? 0 : isSel ? 1.18 : 1,
                    opacity: isPop ? 0 : 1,
                  }}
                  transition={{ duration: isPop ? 0.3 : 0.15 }}
                  onClick={() => tap(r, c)}
                  className="aspect-square rounded-full p-[3px] focus:outline-none"
                  style={{
                    boxShadow: isSel
                      ? `0 0 0 2.5px white, 0 0 0 4px ${candy?.ring ?? "#aaa"}, 0 6px 16px ${candy?.shadow ?? "transparent"}`
                      : undefined,
                  }}>
                  {candy && (
                    <div className="w-full h-full rounded-full"
                      style={{
                        background: candy.bg,
                        boxShadow: isSel ? "none" : `0 3px 8px ${candy.shadow}`,
                      }} />
                  )}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Game Over overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-2xl bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
              <div className="text-5xl mb-1">🍬</div>
              <p className="text-xl font-black text-foreground">Game Over!</p>
              <p className="text-3xl font-black text-primary">{score} pts</p>
              <p className="text-sm text-muted-foreground">
                {score >= 500 ? "Incredible! You're a Match-3 master! 🏆" :
                 score >= 300 ? "Great run! Keep crushing! 🌟" :
                 "Good effort — try again for a higher score!"}
              </p>
              <Button className="rounded-full mt-1" onClick={restart}>Play Again 🍭</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <HowToPlay steps={HOW_TO_STEPS} tip="Aim for vertical + horizontal crosses — they fire multiple combos at once!" />
    </div>
  );
}
