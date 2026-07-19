import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const SNAKES: Record<number, number> = { 99:78, 95:75, 93:73, 87:24, 64:60, 62:19, 54:34, 17:7 };
const LADDERS: Record<number, number> = { 4:14, 9:31, 20:38, 28:84, 40:59, 51:67, 63:81, 71:91 };
const P_COLORS = ["#ef4444", "#3b82f6"];
const P_EMOJIS = ["🔴", "🔵"];
const P_NAMES  = ["Player 1", "Player 2"];
const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function squareNum(row: number, col: number): number {
  const rowFromBottom = 9 - row;
  const inRow = rowFromBottom % 2 === 0 ? col : 9 - col;
  return rowFromBottom * 10 + inRow + 1;
}

export default function SnakesLadders() {
  const [pos, setPos]       = useState([1, 1]);
  const [turn, setTurn]     = useState(0);
  const [dice, setDice]     = useState<number|null>(null);
  const [msg, setMsg]       = useState("Roll the dice to start!");
  const [winner, setWinner] = useState<number|null>(null);
  const [rolling, setRolling] = useState(false);

  function roll() {
    if (rolling || winner !== null) return;
    setRolling(true);
    let ticks = 0;
    const anim = setInterval(() => {
      setDice(Math.floor(Math.random()*6)+1);
      if (++ticks >= 8) {
        clearInterval(anim);
        const d = Math.floor(Math.random()*6)+1;
        setDice(d);
        setRolling(false);
        applyMove(d);
      }
    }, 80);
  }

  function applyMove(d: number) {
    const curr = pos[turn];
    const raw  = curr + d;
    if (raw > 100) {
      setMsg(`${P_NAMES[turn]} needs exactly ${100-curr} to finish! Bounce back.`);
      setTimeout(() => setTurn(t => 1-t), 1500);
      return;
    }
    let dest = raw, note = "";
    if (SNAKES[dest])  { note = `🐍 Snake! ${dest} → ${SNAKES[dest]}`;  dest = SNAKES[dest]; }
    else if (LADDERS[dest]) { note = `🪜 Ladder! ${dest} → ${LADDERS[dest]}`; dest = LADDERS[dest]; }
    const newPos = [...pos]; newPos[turn] = dest;
    setPos(newPos);
    if (dest === 100) { setWinner(turn); setMsg(`🏆 ${P_NAMES[turn]} wins!`); return; }
    setMsg(note || `${P_NAMES[turn]} moved to ${dest}`);
    setTimeout(() => setTurn(t => 1-t), 1400);
  }

  function restart() {
    setPos([1,1]); setTurn(0); setDice(null);
    setMsg("Roll the dice to start!"); setWinner(null); setRolling(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {P_NAMES.map((name, i) => (
            <div key={i}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                turn === i && !winner ? "scale-105 shadow-sm" : "opacity-55"
              }`}
              style={{
                background: `${P_COLORS[i]}22`,
                color: P_COLORS[i],
                outline: turn === i && !winner ? `2px solid ${P_COLORS[i]}` : "none",
              }}>
              {P_EMOJIS[i]} {name}: sq.{pos[i]}
            </div>
          ))}
        </div>
        {winner !== null && (
          <Button size="sm" onClick={restart} className="rounded-full">New Game</Button>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden border-2 border-border shadow-sm">
        {Array(10).fill(null).map((_, ri) => (
          <div key={ri} className="grid grid-cols-10">
            {Array(10).fill(null).map((_, ci) => {
              const sq = squareNum(ri, ci);
              const p0 = pos[0] === sq, p1 = pos[1] === sq;
              const hasSnake = sq in SNAKES, hasLadder = sq in LADDERS;
              const alt = (ri + ci) % 2 === 0;
              return (
                <div key={ci}
                  className={`aspect-square flex flex-col items-center justify-center relative border-r border-b border-border/20 ${alt ? "bg-amber-50" : "bg-white"}`}
                  style={{ minHeight: 0 }}>
                  <span className="text-[7px] text-gray-400 font-medium leading-none">{sq}</span>
                  <div className="flex" style={{ fontSize: 9, lineHeight: 1 }}>
                    {hasSnake && <span>🐍</span>}
                    {hasLadder && <span>🪜</span>}
                  </div>
                  <div className="flex" style={{ fontSize: 12, lineHeight: 1 }}>
                    {p0 && <span>🔴</span>}
                    {p1 && <span>🔵</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 justify-center flex-wrap">
        <AnimatePresence mode="wait">
          {dice && (
            <motion.div key={dice}
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-12 h-12 rounded-xl bg-white border-2 border-border shadow-md flex items-center justify-center text-3xl select-none">
              {DICE_FACES[dice]}
            </motion.div>
          )}
        </AnimatePresence>
        <Button onClick={roll} disabled={rolling || winner !== null} className="rounded-full px-6">
          {rolling ? "🎲 Rolling…" : `🎲 Roll — ${P_EMOJIS[turn]} ${P_NAMES[turn]}`}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.p key={msg} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm font-semibold text-primary min-h-[1.5rem]">
          {msg}
        </motion.p>
      </AnimatePresence>

      <div className="flex gap-4 justify-center text-[10px] text-muted-foreground">
        <span>🐍 Snake = slide down</span>
        <span>🪜 Ladder = climb up</span>
      </div>
    </div>
  );
}
