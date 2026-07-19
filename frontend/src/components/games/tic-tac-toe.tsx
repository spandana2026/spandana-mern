import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Bot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import HowToPlay from "@/components/games/how-to-play";
import { playSound } from "@/lib/sound";

const TTT_STEPS = [
  { icon: "👥", text: "Choose 2 Players (pass the phone) or play vs the AI." },
  { icon: "❌", text: "X always goes first." },
  { icon: "👆", text: "Tap any empty square to place your symbol." },
  { icon: "3️⃣", text: "Get 3 in a row — across, down, or diagonal — to win!" },
  { icon: "🤝", text: "If all 9 squares fill with no winner, it's a draw." },
  { icon: "🔁", text: "Tap \"New Game\" to play again, or \"Change Mode\" to switch." },
];

type Cell = "X" | "O" | null;
type Mode = "2player" | "ai";

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function getWinner(b: Cell[]): { winner: Cell; line: number[] } | null {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d])
      return { winner: b[a], line: [a, c, d] };
  }
  return null;
}

function minimax(b: Cell[], isMax: boolean): number {
  const w = getWinner(b);
  if (w?.winner === "O") return 10;
  if (w?.winner === "X") return -10;
  if (!b.includes(null)) return 0;
  const scores = b
    .map((cell, i) => {
      if (cell) return null;
      const nb = [...b];
      nb[i] = isMax ? "O" : "X";
      return minimax(nb, !isMax);
    })
    .filter((s) => s !== null) as number[];
  return isMax ? Math.max(...scores) : Math.min(...scores);
}

function bestMove(b: Cell[]): number {
  let best = -Infinity, move = -1;
  b.forEach((cell, i) => {
    if (cell) return;
    const nb = [...b];
    nb[i] = "O";
    const s = minimax(nb, false);
    if (s > best) { best = s; move = i; }
  });
  return move;
}

export default function TicTacToe() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });

  const result = getWinner(board);
  const isDraw = !result && !board.includes(null);

  const reset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setXTurn(true);
  }, []);

  const play = useCallback((i: number) => {
    if (board[i] || result || isDraw) return;
    playSound("tick");
    const nb = [...board];
    nb[i] = xTurn ? "X" : "O";
    const r = getWinner(nb);
    const d = !r && !nb.includes(null);
    setBoard(nb);
    if (r) { playSound("win"); setScores(s => ({ ...s, [r.winner!]: s[r.winner! as "X"|"O"] + 1 })); return; }
    if (d) { playSound("mismatch"); setScores(s => ({ ...s, draw: s.draw + 1 })); return; }
    if (mode === "ai") {
      setXTurn(false);
      setTimeout(() => {
        const nb2 = [...nb];
        const m = bestMove(nb2);
        if (m === -1) return;
        nb2[m] = "O";
        const r2 = getWinner(nb2);
        const d2 = !r2 && !nb2.includes(null);
        playSound("tick");
        setBoard(nb2);
        if (r2) { playSound("win"); setScores(s => ({ ...s, O: s.O + 1 })); return; }
        if (d2) { playSound("mismatch"); setScores(s => ({ ...s, draw: s.draw + 1 })); return; }
        setXTurn(true);
      }, 350);
    } else {
      setXTurn(t => !t);
    }
  }, [board, result, isDraw, xTurn, mode]);

  if (!mode) return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-sm text-muted-foreground font-medium">Choose your mode</p>
      <div className="flex gap-3">
        <Button onClick={() => setMode("2player")} variant="outline" className="rounded-xl gap-2 h-12 px-5">
          <Users size={16} /> 2 Players
        </Button>
        <Button onClick={() => setMode("ai")} className="rounded-xl gap-2 h-12 px-5">
          <Bot size={16} /> vs AI
        </Button>
      </div>
    </div>
  );

  const winLine = result?.line ?? [];

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Score strip */}
      <div className="flex items-center gap-4 text-sm font-semibold">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-blue-500">{scores.X}</span>
          <span className="text-xs text-muted-foreground">{mode === "ai" ? "You" : "X"}</span>
        </div>
        <div className="flex flex-col items-center px-3 border-x border-border">
          <span className="text-2xl font-bold text-muted-foreground">{scores.draw}</span>
          <span className="text-xs text-muted-foreground">Draw</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-rose-500">{scores.O}</span>
          <span className="text-xs text-muted-foreground">{mode === "ai" ? "AI" : "O"}</span>
        </div>
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        <motion.div key={result ? "win" : isDraw ? "draw" : xTurn ? "x" : "o"}
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={`text-sm font-semibold px-4 py-1.5 rounded-full ${
            result ? (result.winner === "X" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700")
            : isDraw ? "bg-amber-100 text-amber-700"
            : xTurn ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
          }`}>
          {result
            ? `${result.winner === "X" ? (mode === "ai" ? "You win! 🎉" : "X wins! 🎉") : (mode === "ai" ? "AI wins 🤖" : "O wins! 🎉")}`
            : isDraw ? "It's a draw! 🤝"
            : xTurn ? (mode === "ai" ? "Your turn (X)" : "X's turn") : (mode === "ai" ? "AI thinking…" : "O's turn")}
        </motion.div>
      </AnimatePresence>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => {
          const isWin = winLine.includes(i);
          return (
            <motion.button
              key={i}
              onClick={() => play(i)}
              whileTap={{ scale: 0.93 }}
              className={`w-[88px] h-[88px] rounded-2xl text-4xl font-black flex items-center justify-center transition-colors
                ${!cell && !result && !isDraw ? "hover:bg-primary/5 cursor-pointer" : "cursor-default"}
                ${isWin ? "bg-primary/15 border-2 border-primary" : "bg-muted/60 border border-border"}`}
            >
              <AnimatePresence>
                {cell && (
                  <motion.span
                    initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    className={cell === "X" ? "text-blue-500" : "text-rose-500"}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline" size="sm" className="rounded-full gap-1.5">
          <RotateCcw size={13} /> New Game
        </Button>
        <Button onClick={() => { setMode(null); reset(); setScores({ X: 0, O: 0, draw: 0 }); }}
          variant="ghost" size="sm" className="rounded-full">
          Change Mode
        </Button>
      </div>

      <HowToPlay steps={TTT_STEPS} tip="AI uses perfect strategy — try to trap it in a corner!" />
    </div>
  );
}
