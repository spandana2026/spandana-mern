import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trophy, Dice1, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import HowToPlay from "@/components/games/how-to-play";
import { playSound } from "@/lib/sound";

const LUDO_STEPS = [
  { icon: "👥", text: "Choose 2, 3 or 4 players." },
  { icon: "🎲", text: "Tap \"Roll Dice!\" on your turn to roll." },
  { icon: "6️⃣", text: "You must roll a 6 to bring a piece out of home base." },
  { icon: "✨", text: "Tap a glowing piece to move it by the rolled number." },
  { icon: "⭐", text: "Star cells are safe zones — no captures allowed there." },
  { icon: "💥", text: "Land on an opponent on a non-star cell to send them back home." },
  { icon: "🔄", text: "Roll a 6 or capture an opponent = bonus extra turn!" },
  { icon: "🏆", text: "First player to get all 4 pieces to the centre wins." },
];

// ─── Board constants ──────────────────────────────────────────────────────────

const TRACK: [number, number][] = [
  [6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],
  [7,13],[8,13],[9,13],
  [10,13],[11,13],[12,13],[13,13],
  [13,12],[13,11],[13,10],[13,9],[13,8],
  [14,8],[14,7],[14,6],[13,6],
  [12,6],[11,6],[10,6],[9,6],[8,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0],
];

const START = [0, 13, 26, 39];

const HOME_COL: [number, number][][] = [
  [[7,1],[7,2],[7,3],[7,4],[7,5]],
  [[1,7],[2,7],[3,7],[4,7],[5,7]],
  [[7,13],[7,12],[7,11],[7,10],[7,9]],
  [[13,7],[12,7],[11,7],[10,7],[9,7]],
];

const SAFE_ABS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

const HOME_PIECES: [number, number][][] = [
  [[2,1],[2,4],[4,1],[4,4]],
  [[2,10],[2,13],[4,10],[4,13]],
  [[10,10],[10,13],[13,10],[13,13]],
  [[10,1],[10,4],[13,1],[13,4]],
];

const P_NAME  = ["Red", "Blue", "Green", "Yellow"];
const P_COLOR = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];
const P_LIGHT = ["#fee2e2", "#dbeafe", "#dcfce7", "#fef9c3"];
const P_DARK  = ["#b91c1c", "#1d4ed8", "#15803d", "#a16207"];
const P_HCOL  = ["#fca5a5", "#93c5fd", "#86efac", "#fde047"];

// ─── Logic ───────────────────────────────────────────────────────────────────

function absIdx(player: number, prog: number): number {
  return (START[player] + prog) % 52;
}

function getCell(player: number, prog: number): [number, number] | null {
  if (prog < 0) return HOME_PIECES[player][0]; // placeholder
  if (prog <= 51) return TRACK[absIdx(player, prog)];
  if (prog <= 56) return HOME_COL[player][prog - 52];
  return null; // done
}

type Pieces = number[][]; // [player][piece], -1=home, 0-51=track, 52-56=hcol, 57=done

function movablePieces(player: number, dice: number, pieces: Pieces): number[] {
  return pieces[player].map((prog, i) => {
    if (prog === 57) return false;
    if (prog === -1) return dice === 6;
    const np = prog + dice;
    return np <= 57;
  }).map((ok, i) => ok ? i : -1).filter(i => i >= 0);
}

interface MoveResult { pieces: Pieces; captured: boolean }

function applyMove(player: number, pieceIdx: number, dice: number, pieces: Pieces, numPlayers: number): MoveResult {
  const next: Pieces = pieces.map(row => [...row]);
  const cur = next[player][pieceIdx];
  let captured = false;

  const np = cur === -1 ? 0 : cur + dice;
  next[player][pieceIdx] = np;

  // Capture: only on main track (0-51)
  if (np >= 0 && np <= 51) {
    const myAbs = absIdx(player, np);
    if (!SAFE_ABS.has(myAbs)) {
      for (let p = 0; p < numPlayers; p++) {
        if (p === player) continue;
        for (let pi = 0; pi < 4; pi++) {
          const ep = next[p][pi];
          if (ep >= 0 && ep <= 51 && absIdx(p, ep) === myAbs) {
            next[p][pi] = -1;
            captured = true;
          }
        }
      }
    }
  }

  return { pieces: next, captured };
}

function checkWinner(pieces: Pieces, numPlayers: number): number | null {
  for (let p = 0; p < numPlayers; p++) {
    if (pieces[p].every(pr => pr === 57)) return p;
  }
  return null;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface GS {
  pieces:       Pieces;
  turn:         number;
  dice:         number | null;
  rolled:       boolean;
  movable:      number[];
  winner:       number | null;
  numPlayers:   number;
  extraTurn:    boolean;
  log:          string;
}

function initState(numPlayers: number): GS {
  return {
    pieces:     Array.from({ length: numPlayers }, () => [-1, -1, -1, -1]),
    turn:       0,
    dice:       null,
    rolled:     false,
    movable:    [],
    winner:     null,
    numPlayers,
    extraTurn:  false,
    log:        "Roll the dice!",
  };
}

// ─── Board cell classifier ────────────────────────────────────────────────────

function cellClass(r: number, c: number): string {
  if (r <= 5 && c <= 5)   return "red-home";
  if (r <= 5 && c >= 9)   return "blue-home";
  if (r >= 9 && c >= 9)   return "green-home";
  if (r >= 9 && c <= 5)   return "yellow-home";
  if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return "center";
  if (r === 7 && c >= 1 && c <= 5)  return "red-hcol";
  if (c === 7 && r >= 1 && r <= 5)  return "blue-hcol";
  if (r === 7 && c >= 9 && c <= 13) return "green-hcol";
  if (c === 7 && r >= 9 && r <= 13) return "yellow-hcol";
  return "path";
}

function isSafeCell(r: number, c: number): boolean {
  const idx = TRACK.findIndex(([tr, tc]) => tr === r && tc === c);
  return idx >= 0 && SAFE_ABS.has(idx);
}

// ─── Main component ───────────────────────────────────────────────────────────

const CELL = 23; // px per cell
const GRID = 15;

interface LudoProps {
  /* optional: controlled from outside for online mode */
  externalState?: GS;
  onMove?:  (player: number, piece: number, dice: number) => void;
  onRoll?:  () => void;
  myPlayer?: number;
  online?: boolean;
  waitingForOpponent?: boolean;
  preselectedPlayers?: number;
}

export default function LudoGame({ externalState, onMove, onRoll, myPlayer, online = false, waitingForOpponent, preselectedPlayers }: LudoProps) {
  const [numPlayers, setNumPlayers] = useState<number | null>(
    online ? (externalState?.numPlayers ?? 2) : preselectedPlayers ?? null
  );
  const [gs, setGs] = useState<GS | null>(preselectedPlayers ? initState(preselectedPlayers) : null);
  const [rolling, setRolling] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const diceFrames = useRef(0);

  const state = online && externalState ? externalState : gs;
  const isMyTurn = !online || state?.turn === myPlayer;

  // In online mode the player count screen is skipped; update if external state changes
  useEffect(() => {
    if (online && externalState) setNumPlayers(externalState.numPlayers);
  }, [online, externalState?.numPlayers]);

  function start(n: number) {
    setNumPlayers(n);
    setGs(initState(n));
  }

  function rollDice() {
    if (!state || state.rolled || state.winner || rolling) return;
    if (!isMyTurn) return;
    // Online: delegate to server
    if (online && onRoll) { onRoll(); return; }
    setRolling(true);
    diceFrames.current = 0;
    playSound("dice");
    const interval = setInterval(() => {
      diceFrames.current++;
      setGs(prev => prev ? { ...prev, dice: Math.ceil(Math.random() * 6) } : prev);
      if (diceFrames.current >= 8) {
        clearInterval(interval);
        setRolling(false);
        const finalDice = Math.ceil(Math.random() * 6);
        setGs(prev => {
          if (!prev) return prev;
          const movable = movablePieces(prev.turn, finalDice, prev.pieces);
          const log = movable.length === 0
            ? `${P_NAME[prev.turn]} rolled ${finalDice} — no moves! Turn passes.`
            : `${P_NAME[prev.turn]} rolled ${finalDice}. Choose a piece.`;
          const next = { ...prev, dice: finalDice, rolled: true, movable, log };
          if (movable.length === 0) {
            setTimeout(() => setGs(s => s ? advanceTurn(s) : s), 1200);
          }
          return next;
        });
      }
    }, 80);
  }

  function advanceTurn(s: GS): GS {
    let nextTurn = (s.turn + 1) % s.numPlayers;
    return { ...s, turn: nextTurn, dice: null, rolled: false, movable: [], log: `${P_NAME[nextTurn]}'s turn — roll the dice!` };
  }

  function handlePieceClick(player: number, pieceIdx: number) {
    if (!state || !state.rolled || state.winner) return;
    if (state.turn !== player) return;
    if (!state.movable.includes(pieceIdx)) return;
    if (online && onMove) {
      onMove(player, pieceIdx, state.dice!);
      return;
    }
    setGs(prev => {
      if (!prev || !prev.rolled || !prev.dice) return prev;
      const { pieces, captured } = applyMove(player, pieceIdx, prev.dice, prev.pieces, prev.numPlayers);
      const winner = checkWinner(pieces, prev.numPlayers);
      const extraTurn = prev.dice === 6 || captured;
      if (captured) playSound("capture");
      else playSound("move");
      if (winner !== null) {
        setTimeout(() => playSound("win"), 150);
        return { ...prev, pieces, winner, log: `🎉 ${P_NAME[winner]} wins!`, movable: [] };
      }
      const baseLog = `${P_NAME[player]} moved piece ${pieceIdx + 1}.`;
      if (extraTurn) {
        const newMovable = movablePieces(prev.turn, 0, pieces); // will re-roll
        return { ...prev, pieces, rolled: false, dice: null, movable: [], extraTurn: true, log: `${baseLog} Extra turn! Roll again.` };
      }
      let nextTurn = (player + 1) % prev.numPlayers;
      return { ...prev, pieces, turn: nextTurn, rolled: false, dice: null, movable: [], extraTurn: false, log: `${P_NAME[nextTurn]}'s turn!` };
    });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!numPlayers || !state) {
    return (
      <div className="flex flex-col items-center gap-5 py-4">
        <div className="text-5xl">🎲</div>
        <h3 className="text-xl font-bold">Ludo</h3>
        <p className="text-sm text-muted-foreground text-center">How many players?</p>
        <div className="grid grid-cols-3 gap-3 w-full">
          {[2, 3, 4].map(n => (
            <button key={n} onClick={() => start(n)}
              className="flex flex-col items-center gap-1 p-4 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all">
              <span className="text-2xl font-black text-primary">{n}</span>
              <span className="text-xs text-muted-foreground">Players</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center italic">Pass the phone between players on the same device</p>
      </div>
    );
  }

  const boardSize = GRID * CELL;

  // Build piece map: cell key → list of {player, pieceIdx, prog}
  const pieceMap: Record<string, { player: number; pieceIdx: number; prog: number }[]> = {};
  for (let p = 0; p < state.numPlayers; p++) {
    for (let pi = 0; pi < 4; pi++) {
      const prog = state.pieces[p][pi];
      if (prog === 57) continue; // finished
      let cell: [number, number] | null;
      if (prog === -1) {
        cell = HOME_PIECES[p][pi];
      } else {
        cell = getCell(p, prog);
      }
      if (!cell) continue;
      const key = `${cell[0]},${cell[1]}`;
      if (!pieceMap[key]) pieceMap[key] = [];
      pieceMap[key].push({ player: p, pieceIdx: pi, prog });
    }
  }

  const diceEmoji = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Player tags */}
      <div className="flex gap-2 w-full flex-wrap justify-center">
        {Array.from({ length: state.numPlayers }, (_, p) => (
          <div key={p} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all
            ${state.turn === p && !state.winner
              ? "border-current scale-105 shadow-md"
              : "border-transparent opacity-60"}`}
            style={{ color: P_COLOR[p], background: P_LIGHT[p] }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: P_COLOR[p] }} />
            {P_NAME[p]}
            {state.pieces[p].filter(x => x === 57).length > 0 && (
              <span>{"●".repeat(state.pieces[p].filter(x => x === 57).length)}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Dice + Controls (ABOVE board so it's always visible) ── */}
      {state.winner !== null ? (
        <div className="flex flex-col items-center gap-3 w-full py-1">
          <div className="text-4xl">🏆</div>
          <p className="font-bold text-lg" style={{ color: P_COLOR[state.winner] }}>
            {P_NAME[state.winner]} wins!
          </p>
          <Button onClick={() => { setGs(null); setNumPlayers(null); }} className="rounded-full gap-2">
            <RotateCcw size={14} /> Play Again
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 w-full">
          {/* Big roll button */}
          <motion.button
            onClick={rollDice}
            disabled={state.rolled || rolling || !isMyTurn}
            animate={rolling ? { rotate: [0, 18, -18, 12, -12, 0] } : {}}
            transition={{ duration: 0.08, repeat: rolling ? Infinity : 0 }}
            className={`flex-1 flex items-center justify-center gap-2.5 h-14 rounded-2xl text-base font-black border-2 transition-all select-none
              ${state.rolled || !isMyTurn
                ? "opacity-40 cursor-not-allowed border-border bg-muted text-muted-foreground"
                : "border-primary bg-primary text-white shadow-lg hover:shadow-xl cursor-pointer active:scale-95"}`}
            style={(!state.rolled && isMyTurn) ? { boxShadow: `0 4px 18px color-mix(in srgb, var(--primary) 45%, transparent)` } : {}}>
            <span className="text-2xl">{state.dice ? diceEmoji[state.dice] : "🎲"}</span>
            <span>{state.rolled ? (state.movable.length > 0 ? "Tap a glowing piece" : "No moves…") : (isMyTurn ? "Roll Dice!" : "Waiting…")}</span>
          </motion.button>

          <button onClick={() => setShowInfo(v => !v)}
            className={`w-10 h-14 rounded-2xl flex items-center justify-center transition-colors border shrink-0
              ${showInfo ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-border hover:text-foreground"}`}>
            <Info size={16} />
          </button>
        </div>
      )}

      {/* Status log */}
      <motion.div key={state.log}
        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
        className="text-xs text-center px-3 py-1.5 rounded-xl bg-muted/50 border border-border w-full text-muted-foreground">
        <span style={{ color: P_COLOR[state.turn] }} className="font-semibold">{P_NAME[state.turn]}</span>
        {" — "}{state.winner !== null ? `🏆 ${P_NAME[state.winner]} wins!` : state.log}
      </motion.div>

      {/* How to play — collapsible */}
      <AnimatePresence>
        {showInfo && (
          <motion.div key="htp" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            className="w-full">
            <HowToPlay steps={LUDO_STEPS} tip="Pass the phone to each player on their turn!" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board */}
      <div className="relative overflow-hidden rounded-xl border-2 border-border shadow-md"
        style={{ width: boardSize, height: boardSize }}>

        {/* Grid cells */}
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => {
            const cls = cellClass(r, c);
            let bg = "#ffffff";
            let border = "#e2e8f0";

            if      (cls === "red-home")    { bg = "#fee2e2"; }
            else if (cls === "blue-home")   { bg = "#dbeafe"; }
            else if (cls === "green-home")  { bg = "#dcfce7"; }
            else if (cls === "yellow-home") { bg = "#fef9c3"; }
            else if (cls === "red-hcol")    { bg = "#fca5a5"; }
            else if (cls === "blue-hcol")   { bg = "#93c5fd"; }
            else if (cls === "green-hcol")  { bg = "#86efac"; }
            else if (cls === "yellow-hcol") { bg = "#fde047"; }
            else if (cls === "center") {
              // Multi-color center segments
              if (r === 6 && c === 6) bg = "#fee2e2";
              else if (r === 6 && c === 7) bg = "#dbeafe";
              else if (r === 6 && c === 8) bg = "#dbeafe";
              else if (r === 7 && c === 6) bg = "#fef9c3";
              else if (r === 7 && c === 7) bg = "#f3f4f6";
              else if (r === 7 && c === 8) bg = "#dcfce7";
              else if (r === 8 && c === 6) bg = "#fef9c3";
              else if (r === 8 && c === 7) bg = "#dcfce7";
              else if (r === 8 && c === 8) bg = "#dcfce7";
            }

            const safe = isSafeCell(r, c);
            if (safe) { bg = "#f0fdf4"; border = "#86efac"; }

            // Home circle areas inside corner homes
            let isHomeCircle = false;
            if (cls === "red-home"    && r >= 1 && r <= 4 && c >= 1 && c <= 4) isHomeCircle = true;
            if (cls === "blue-home"   && r >= 1 && r <= 4 && c >= 10 && c <= 13) isHomeCircle = true;
            if (cls === "green-home"  && r >= 10 && r <= 13 && c >= 10 && c <= 13) isHomeCircle = true;
            if (cls === "yellow-home" && r >= 10 && r <= 13 && c >= 1 && c <= 4) isHomeCircle = true;
            if (isHomeCircle) { bg = P_LIGHT[
              cls === "red-home" ? 0 : cls === "blue-home" ? 1 : cls === "green-home" ? 2 : 3]; }

            return (
              <div key={`${r},${c}`} style={{
                position: "absolute",
                left: c * CELL, top: r * CELL,
                width: CELL, height: CELL,
                background: bg,
                border: `0.5px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8,
              }}>
                {safe && <span style={{ color: "#22c55e", fontSize: 10 }}>★</span>}
              </div>
            );
          })
        )}

        {/* Home corner circles */}
        {[0,1,2,3].filter(p => p < state.numPlayers).map(p => (
          HOME_PIECES[p].map(([r, c], pi) => (
            <div key={`home-circle-${p}-${pi}`} style={{
              position: "absolute",
              left: c * CELL + 2, top: r * CELL + 2,
              width: CELL - 4, height: CELL - 4,
              borderRadius: "50%",
              background: P_LIGHT[p],
              border: `2px solid ${P_COLOR[p]}`,
            }} />
          ))
        ))}

        {/* Arrow indicators for player start cells */}
        {[0,1,2,3].filter(p => p < state.numPlayers).map(p => {
          const [r, c] = TRACK[START[p]];
          return (
            <div key={`start-${p}`} style={{
              position: "absolute",
              left: c * CELL, top: r * CELL,
              width: CELL, height: CELL,
              background: P_COLOR[p],
              opacity: 0.3,
              pointerEvents: "none",
            }} />
          );
        })}

        {/* Pieces */}
        {Object.entries(pieceMap).map(([key, pieces]) => {
          const [r, c] = key.split(",").map(Number);
          return pieces.map((pc, stackIdx) => {
            const isMovable = state.turn === pc.player && state.rolled && state.movable.includes(pc.pieceIdx) && !state.winner && isMyTurn;
            const offsetX = pieces.length > 1 ? (stackIdx % 2) * (CELL / 2 - 1) - (CELL / 4 - 1) : 0;
            const offsetY = pieces.length > 2 ? Math.floor(stackIdx / 2) * (CELL / 2 - 1) - (CELL / 4 - 1) : 0;
            const size = pieces.length > 1 ? CELL * 0.45 : CELL * 0.65;

            return (
              <motion.div key={`piece-${pc.player}-${pc.pieceIdx}`}
                layout
                initial={{ scale: 0.5 }}
                animate={{
                  scale: isMovable ? [1, 1.25, 1] : 1,
                }}
                transition={isMovable ? { duration: 0.8, repeat: Infinity } : {}}
                onClick={() => handlePieceClick(pc.player, pc.pieceIdx)}
                style={{
                  position: "absolute",
                  left: c * CELL + CELL / 2 - size / 2 + offsetX,
                  top:  r * CELL + CELL / 2 - size / 2 + offsetY,
                  width: size, height: size,
                  borderRadius: "50%",
                  background: P_COLOR[pc.player],
                  border: `2px solid ${P_DARK[pc.player]}`,
                  cursor: isMovable ? "pointer" : "default",
                  zIndex: isMovable ? 10 : 5,
                  boxShadow: isMovable ? `0 0 8px ${P_COLOR[pc.player]}` : "0 1px 3px rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white",
                  fontSize: size * 0.4,
                  fontWeight: "bold",
                }}>
                {pc.pieceIdx + 1}
              </motion.div>
            );
          });
        })}
      </div>

    </div>
  );
}

export type { GS as LudoGS };
