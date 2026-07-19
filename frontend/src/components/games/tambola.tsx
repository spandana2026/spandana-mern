import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

function genTicket(): (number | null)[][] {
  const colRanges = [[1,9],[10,19],[20,29],[30,39],[40,49],[50,59],[60,69],[70,79],[80,90]];
  const used = new Set<number>();
  const grid: (number | null)[][] = Array(3).fill(null).map(() => Array(9).fill(null));
  for (let row = 0; row < 3; row++) {
    const cols = [...Array(9).keys()].sort(() => Math.random()-0.5).slice(0,5).sort((a,b)=>a-b);
    for (const col of cols) {
      const [lo, hi] = colRanges[col];
      let n = lo + Math.floor(Math.random()*(hi-lo+1));
      let t = 0;
      while (used.has(n) && t++ < 50) n = lo + Math.floor(Math.random()*(hi-lo+1));
      used.add(n);
      grid[row][col] = n;
    }
  }
  return grid;
}

function shuffle90(): number[] {
  return [...Array(90)].map((_,i) => i+1).sort(() => Math.random()-0.5);
}

function checkWins(ticket: (number | null)[][], markedKeys: Set<string>): string[] {
  const markedNums = new Set<number>();
  markedKeys.forEach(k => {
    const [r, c] = k.split("-").map(Number);
    const n = ticket[r]?.[c]; if (n) markedNums.add(n);
  });
  const found: string[] = [];
  if (markedNums.size >= 5) found.push("⚡ Early Five");
  for (let r = 0; r < 3; r++) {
    const nums = ticket[r].filter(Boolean) as number[];
    if (nums.length && nums.every(n => markedNums.has(n))) found.push(`✅ Line ${r+1}`);
  }
  const all = ticket.flat().filter(Boolean) as number[];
  if (all.length && all.every(n => markedNums.has(n))) found.push("🏆 Full House");
  return found;
}

// ── Solo Game ─────────────────────────────────────────────────────
function SoloGame() {
  const [ticket]   = useState(genTicket);
  const [queue]    = useState(shuffle90);
  const [callIdx, setCallIdx]   = useState(0);
  const [calledSet, setCalledSet] = useState<Set<number>>(new Set());
  const [lastNum, setLastNum]   = useState<number|null>(null);
  const [marked, setMarked]     = useState<Set<string>>(new Set());
  const [wins, setWins]         = useState<string[]>([]);
  const [autoOn, setAutoOn]     = useState(false);
  const [speed, setSpeed]       = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  function callNext() {
    if (callIdx >= 90) return;
    const n = queue[callIdx];
    setCalledSet(p => new Set([...p, n]));
    setLastNum(n);
    setCallIdx(i => i+1);
  }

  function toggleMark(r: number, c: number) {
    const n = ticket[r][c];
    if (!n || !calledSet.has(n)) return;
    const k = `${r}-${c}`;
    setMarked(p => { const s = new Set(p); s.has(k) ? s.delete(k) : s.add(k); return s; });
  }

  useEffect(() => {
    const newW = checkWins(ticket, marked).filter(w => !wins.includes(w));
    if (newW.length) setWins(p => [...p, ...newW]);
  }, [marked]);

  useEffect(() => {
    if (autoOn) { timerRef.current = setInterval(callNext, speed * 1000); }
    else { if (timerRef.current) clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoOn, speed, callIdx]);

  const recentCalls = [...calledSet].slice(-8).reverse();

  return (
    <div className="space-y-4">
      <CallerWidget lastNum={lastNum} callIdx={callIdx} recentCalls={recentCalls} wins={wins}
        onCallNext={callNext} autoOn={autoOn} onToggleAuto={() => setAutoOn(v=>!v)}
        speed={speed} onSpeedChange={setSpeed} />

      <Ticket ticket={ticket} calledSet={calledSet} marked={marked} onToggle={toggleMark} label="Your Ticket" />

      <p className="text-center text-[11px] text-muted-foreground">
        Tap yellow numbers (called) to mark them on your ticket
      </p>

      {callIdx >= 90 && (
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">All 90 numbers called!</p>
          <Button onClick={() => {
            setCallIdx(0); setCalledSet(new Set()); setLastNum(null);
            setMarked(new Set()); setWins([]); setAutoOn(false);
          }} className="rounded-full">New Game 🎱</Button>
        </div>
      )}
    </div>
  );
}

// ── Pass & Play Game ──────────────────────────────────────────────
function PassAndPlayGame({ numPlayers }: { numPlayers: number }) {
  const [tickets]   = useState<(number|null)[][][]>(() => Array.from({ length: numPlayers }, genTicket));
  const [queue]     = useState(shuffle90);
  const [callIdx, setCallIdx]    = useState(0);
  const [calledSet, setCalledSet] = useState<Set<number>>(new Set());
  const [lastNum, setLastNum]    = useState<number|null>(null);
  const [marked, setMarked]      = useState<Set<string>[]>(() => Array.from({ length: numPlayers }, () => new Set<string>()));
  const [wins, setWins]          = useState<string[][]>(() => Array.from({ length: numPlayers }, () => []));
  const [autoOn, setAutoOn]      = useState(false);
  const [speed, setSpeed]        = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  // Pass & Play phase: -1 = caller view, 0..N-1 = player N is marking
  const [ppPhase, setPpPhase] = useState<number>(-1);
  // hidden = showing "hand phone to player N" screen
  const [hidden, setHidden] = useState(false);

  function callNext() {
    if (callIdx >= 90) return;
    const n = queue[callIdx];
    setCalledSet(p => new Set([...p, n]));
    setLastNum(n);
    setCallIdx(i => i+1);
  }

  function startMarking() {
    setPpPhase(0);
    setHidden(true);
  }

  function toggleMark(playerIdx: number, r: number, c: number) {
    const n = tickets[playerIdx][r][c];
    if (!n || !calledSet.has(n)) return;
    const k = `${r}-${c}`;
    setMarked(prev => {
      const next = prev.map((s, i) => {
        if (i !== playerIdx) return s;
        const ns = new Set(s); ns.has(k) ? ns.delete(k) : ns.add(k); return ns;
      });
      return next;
    });
  }

  function doneMarking() {
    const pIdx = ppPhase;
    const newW = checkWins(tickets[pIdx], marked[pIdx]).filter(w => !wins[pIdx].includes(w));
    if (newW.length) {
      setWins(prev => prev.map((w, i) => i === pIdx ? [...w, ...newW] : w));
    }
    if (pIdx + 1 >= numPlayers) {
      setPpPhase(-1);
      setHidden(false);
    } else {
      setPpPhase(pIdx + 1);
      setHidden(true);
    }
  }

  useEffect(() => {
    if (autoOn) { timerRef.current = setInterval(callNext, speed * 1000); }
    else { if (timerRef.current) clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoOn, speed, callIdx]);

  const recentCalls = [...calledSet].slice(-8).reverse();
  const allWins = wins.flatMap((w, i) => w.map(v => `P${i+1}: ${v}`));

  if (ppPhase === -1) {
    return (
      <div className="space-y-4">
        <CallerWidget lastNum={lastNum} callIdx={callIdx} recentCalls={recentCalls} wins={allWins}
          onCallNext={callNext} autoOn={autoOn} onToggleAuto={() => setAutoOn(v=>!v)}
          speed={speed} onSpeedChange={setSpeed} />

        {lastNum !== null && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onClick={startMarking}
            className="w-full py-3 rounded-2xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 transition-colors flex items-center justify-center gap-2">
            📲 Pass Phone — All Players Mark Tickets
          </motion.button>
        )}

        {/* All-player win summary */}
        {allWins.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {allWins.map((w, i) => (
              <span key={i} className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">{w}</span>
            ))}
          </div>
        )}

        {callIdx >= 90 && (
          <p className="text-center text-sm font-semibold text-muted-foreground">All 90 numbers called!</p>
        )}
      </div>
    );
  }

  const pIdx = ppPhase;

  if (hidden) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10">
        <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-4xl">
          📱
        </div>
        <div className="text-center">
          <p className="font-bold text-xl mb-1">Hand phone to</p>
          <p className="text-3xl font-black text-violet-600">Player {pIdx + 1}</p>
          <p className="text-sm text-muted-foreground mt-2">Don't peek! Tap when ready to mark.</p>
        </div>
        <Button
          className="rounded-full px-8 py-3 text-base font-bold bg-violet-600 hover:bg-violet-500"
          onClick={() => setHidden(false)}>
          I'm Ready — Show My Ticket
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5">
        <div>
          <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Player {pIdx + 1} marking</p>
          {lastNum !== null && (
            <p className="text-sm font-semibold mt-0.5">Last called: <span className="text-violet-600 font-black">{lastNum}</span></p>
          )}
        </div>
        <span className="text-2xl">👤</span>
      </div>

      {wins[pIdx].length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {wins[pIdx].map((w, i) => (
            <span key={i} className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow animate-bounce">{w}</span>
          ))}
        </div>
      )}

      <Ticket
        ticket={tickets[pIdx]}
        calledSet={calledSet}
        marked={marked[pIdx]}
        onToggle={(r, c) => toggleMark(pIdx, r, c)}
        label={`Player ${pIdx + 1}'s Ticket`}
      />

      <p className="text-center text-[11px] text-muted-foreground">
        Tap yellow numbers (called) to mark them
      </p>

      <Button
        className="w-full rounded-2xl py-3 font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white"
        onClick={doneMarking}>
        ✅ Done — {pIdx + 1 < numPlayers ? `Pass to Player ${pIdx + 2}` : "Back to Caller"}
      </Button>
    </div>
  );
}

// ── Reusable: Caller widget ───────────────────────────────────────
function CallerWidget({ lastNum, callIdx, recentCalls, wins, onCallNext, autoOn, onToggleAuto, speed, onSpeedChange }:
  { lastNum: number|null; callIdx: number; recentCalls: number[]; wins: string[];
    onCallNext: () => void; autoOn: boolean; onToggleAuto: () => void;
    speed: number; onSpeedChange: (s: number) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.div key={lastNum ?? "start"}
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.4, opacity: 0 }}
            className="w-20 h-20 rounded-full flex items-center justify-center font-black text-4xl text-white shadow-xl select-none"
            style={{ background: "linear-gradient(135deg,#f97316,#ec4899)" }}>
            {lastNum ?? "🎱"}
          </motion.div>
        </AnimatePresence>
        <p className="text-xs text-muted-foreground font-semibold">{callIdx}/90 numbers called</p>
      </div>

      {recentCalls.length > 0 && (
        <div className="flex gap-1.5 justify-center flex-wrap">
          {recentCalls.map((n, i) => (
            <span key={n}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i === 0 ? "bg-rose-500 text-white scale-110 shadow" : "bg-muted text-foreground"
              }`}>{n}</span>
          ))}
        </div>
      )}

      {wins.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 justify-center">
          {wins.map(w => (
            <span key={w} className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow animate-bounce">{w}</span>
          ))}
        </motion.div>
      )}

      <div className="flex gap-2 justify-center flex-wrap">
        <Button onClick={onCallNext} disabled={callIdx >= 90 || autoOn} className="rounded-full px-5">
          Call Next 🎱
        </Button>
        <Button variant={autoOn ? "default" : "outline"} onClick={onToggleAuto} className="rounded-full px-4">
          {autoOn ? "⏸ Pause" : "▶ Auto-Call"}
        </Button>
        {autoOn && (
          <select value={speed} onChange={e => onSpeedChange(Number(e.target.value))}
            className="rounded-full px-3 py-1.5 text-xs border border-border bg-background">
            <option value={2}>Fast (2s)</option>
            <option value={3}>Normal (3s)</option>
            <option value={5}>Slow (5s)</option>
            <option value={8}>Very Slow (8s)</option>
          </select>
        )}
      </div>
    </div>
  );
}

// ── Reusable: Ticket grid ─────────────────────────────────────────
function Ticket({ ticket, calledSet, marked, onToggle, label }:
  { ticket: (number|null)[][]; calledSet: Set<number>; marked: Set<string>;
    onToggle: (r: number, c: number) => void; label?: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-orange-400 shadow-md">
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-center text-[11px] font-black py-1.5 tracking-widest uppercase">
        🎱 {label || "Tambola Ticket"}
      </div>
      {ticket.map((row, ri) => (
        <div key={ri} className={`grid grid-cols-9 ${ri < 2 ? "border-b border-orange-200" : ""}`}>
          {row.map((num, ci) => {
            const isMarked = marked.has(`${ri}-${ci}`);
            const isCalled = !!(num && calledSet.has(num));
            return (
              <button key={ci} onClick={() => onToggle(ri, ci)}
                disabled={!num || !isCalled}
                className={[
                  "aspect-square flex items-center justify-center text-xs font-bold transition-all border-r last:border-r-0",
                  !num ? "bg-orange-50/60" :
                  isMarked ? "bg-emerald-500 text-white" :
                  isCalled ? "bg-yellow-200 text-orange-900 cursor-pointer hover:bg-yellow-300" :
                  "bg-white text-gray-700",
                ].join(" ")}>
                {num ? (isMarked ? "✓" : String(num)) : ""}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Mode setup screen ─────────────────────────────────────────────
type GameMode = "solo" | "pass" | null;

export default function TambolaGame() {
  const [mode, setMode] = useState<GameMode>(null);
  const [numPlayers, setNumPlayers] = useState(2);
  const [ppConfigured, setPpConfigured] = useState(false);

  if (mode === null) {
    return (
      <div className="space-y-5 py-2">
        <div className="text-center">
          <p className="text-2xl mb-1">🎱</p>
          <h2 className="font-bold text-lg">Tambola / Housie</h2>
          <p className="text-sm text-muted-foreground mt-1">Classic Indian number game</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setMode("solo")}
            className="p-5 rounded-2xl border-2 border-border hover:border-orange-400 hover:bg-orange-50/50 transition-all text-left group">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎮</span>
              <div>
                <p className="font-bold text-base">Solo Game</p>
                <p className="text-xs text-muted-foreground">One ticket, call numbers yourself</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode("pass")}
            className="p-5 rounded-2xl border-2 border-border hover:border-violet-400 hover:bg-violet-50/50 transition-all text-left group">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👨‍👩‍👧‍👦</span>
              <div>
                <p className="font-bold text-base">Pass & Play</p>
                <p className="text-xs text-muted-foreground">2–6 players, one phone. Take turns marking your ticket!</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === "pass" && !ppConfigured) {
    return (
      <div className="space-y-5 py-2">
        <div className="text-center">
          <button
            onClick={() => setMode(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1 mx-auto">
            ← Back
          </button>
          <p className="text-2xl mb-1">👨‍👩‍👧‍👦</p>
          <h2 className="font-bold text-lg">Pass & Play Setup</h2>
          <p className="text-sm text-muted-foreground mt-1">How many players?</p>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[2,3,4,5,6].map(n => (
            <button
              key={n}
              onClick={() => setNumPlayers(n)}
              className={[
                "py-3 rounded-2xl border-2 font-bold text-sm transition-all",
                numPlayers === n ? "border-violet-500 bg-violet-50 text-violet-700" : "border-border hover:border-violet-300",
              ].join(" ")}>
              {n}
            </button>
          ))}
        </div>

        <div className="p-4 bg-muted/40 rounded-xl text-xs text-muted-foreground space-y-1">
          <p>📱 One phone, {numPlayers} players. Each player gets their own ticket.</p>
          <p>🎱 Host calls numbers. Phone is passed to each player to mark their ticket after each call.</p>
          <p>🏆 First to Full House wins!</p>
        </div>

        <Button
          className="w-full rounded-2xl py-3 font-bold text-base bg-violet-600 hover:bg-violet-500 text-white"
          onClick={() => setPpConfigured(true)}>
          Start Game with {numPlayers} Players 🎱
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setMode(null); setPpConfigured(false); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          ← New Game
        </button>
        {mode === "pass" && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-700">
            Pass & Play · {numPlayers} Players
          </span>
        )}
      </div>
      {mode === "solo"
        ? <SoloGame />
        : <PassAndPlayGame numPlayers={numPlayers} />
      }
    </div>
  );
}
