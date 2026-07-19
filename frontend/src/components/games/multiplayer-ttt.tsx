import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Users, Wifi, WifiOff, RotateCcw, Share2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

type WsStatus = "connecting" | "open" | "closed";
type Screen = "lobby" | "waiting" | "playing" | "gameover";

interface GameState {
  board: (string | null)[];
  xIsNext: boolean;
  winner: string | null;
  isDraw: boolean;
  players: number;
}

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinLine(board: (string | null)[]): number[] | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

function buildShareUrl(roomId: string): string {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  return `${window.location.origin}${base}/fun-zone?room=${roomId}`;
}

export default function MultiplayerTTT({ initialRoom }: { initialRoom?: string }) {
  const [, navigate]   = useLocation();
  const wsRef          = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus]     = useState<WsStatus>("connecting");
  const [screen, setScreen]         = useState<Screen>("lobby");
  const [roomId, setRoomId]         = useState<string>("");
  const [joinCode, setJoinCode]     = useState(initialRoom ?? "");
  const [myIndex, setMyIndex]       = useState<0 | 1 | null>(null);
  const [game, setGame]             = useState<GameState | null>(null);
  const [copied, setCopied]         = useState(false);
  const [errMsg, setErrMsg]         = useState("");
  const [opponentLeft, setOpponentLeft] = useState(false);

  const mySymbol  = myIndex === 0 ? "X" : myIndex === 1 ? "O" : null;
  const isMyTurn  = game ? (game.xIsNext ? myIndex === 0 : myIndex === 1) : false;
  const winLine   = game?.winner ? getWinLine(game.board) : null;

  // ── WebSocket connection ─────────────────────────────────────────
  const connect = useCallback(() => {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${window.location.host}/api/ws`);
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = () => {
      setWsStatus("open");
      // If opened via shared link, auto-join
      if (initialRoom) {
        ws.send(JSON.stringify({ type: "join", roomId: initialRoom }));
      }
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === "created") {
        setRoomId(msg.roomId);
        setMyIndex(0);
        setScreen("waiting");
        setOpponentLeft(false);
      }
      if (msg.type === "joined") {
        setRoomId(msg.roomId);
        setMyIndex(msg.playerIndex);
        setOpponentLeft(false);
      }
      if (msg.type === "state") {
        setGame(msg as GameState);
        if (msg.players === 2) {
          if (msg.winner || msg.isDraw) setScreen("gameover");
          else setScreen("playing");
        }
      }
      if (msg.type === "error") {
        setErrMsg(msg.message as string);
      }
      if (msg.type === "opponent_left") {
        setOpponentLeft(true);
      }
      if (msg.type === "pong") { /* keep-alive handled */ }
    };

    ws.onclose = () => setWsStatus("closed");
    ws.onerror = () => setWsStatus("closed");
  }, [initialRoom]);

  useEffect(() => {
    connect();
    return () => { wsRef.current?.close(); };
  }, [connect]);

  // Heartbeat
  useEffect(() => {
    const id = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);
    return () => clearInterval(id);
  }, []);

  function send(msg: object) {
    wsRef.current?.send(JSON.stringify(msg));
  }

  function createGame() {
    setErrMsg("");
    send({ type: "create", gameType: "ttt" });
  }

  function joinGame() {
    setErrMsg("");
    const code = joinCode.toUpperCase().trim();
    if (code.length < 4) { setErrMsg("Enter the 6-letter room code."); return; }
    send({ type: "join", roomId: code });
  }

  function makeMove(cell: number) {
    if (!isMyTurn || game?.board[cell] || game?.winner || game?.isDraw) return;
    send({ type: "move", cell });
  }

  function resetGame() {
    send({ type: "reset" });
    setScreen("playing");
    setOpponentLeft(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(buildShareUrl(roomId)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({ title: "Play Tic-Tac-Toe with me!", url: buildShareUrl(roomId) }).catch(() => {});
    } else copyLink();
  }

  // ── Render helpers ───────────────────────────────────────────────

  const StatusBar = () => (
    <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-4
      ${wsStatus === "open" ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"}`}>
      {wsStatus === "open"
        ? <><Wifi size={11}/> Connected</>
        : <><WifiOff size={11}/> Disconnected — <button className="underline" onClick={connect}>reconnect</button></>}
    </div>
  );

  // ── LOBBY ────────────────────────────────────────────────────────
  if (screen === "lobby") return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar />
      <div className="text-center mb-2">
        <h3 className="text-xl font-bold">⭕ Multiplayer Tic-Tac-Toe</h3>
        <p className="text-sm text-muted-foreground mt-1">Play live with a friend anywhere in the world</p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Button onClick={createGame} disabled={wsStatus !== "open"}
          className="h-12 rounded-2xl text-base font-bold gap-2 w-full">
          <Users size={16}/> Create a Game Room
        </Button>

        <div className="relative flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">or join one</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={e => { setJoinCode(e.target.value.toUpperCase()); setErrMsg(""); }}
            onKeyDown={e => e.key === "Enter" && joinGame()}
            placeholder="Enter room code…"
            maxLength={8}
            className="flex-1 h-12 rounded-2xl border border-border bg-muted/50 px-4 text-base font-mono tracking-widest uppercase text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button onClick={joinGame} disabled={wsStatus !== "open" || joinCode.length < 4}
            className="h-12 px-5 rounded-2xl font-bold">
            Join
          </Button>
        </div>

        {errMsg && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-center">
            {errMsg}
          </motion.p>
        )}
      </div>
    </div>
  );

  // ── WAITING ──────────────────────────────────────────────────────
  if (screen === "waiting") return (
    <div className="flex flex-col items-center gap-5 py-4">
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
        ⏳
      </motion.div>
      <div className="text-center">
        <h3 className="text-xl font-bold">Waiting for opponent…</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Share the code or link with your friend
        </p>
      </div>

      {/* Room code */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl px-8 py-5 text-center w-full">
        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Room Code</p>
        <p className="text-4xl font-black font-mono tracking-[0.2em] text-primary">{roomId}</p>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2 w-full">
        <Button onClick={shareLink} variant="outline" className="flex-1 h-11 rounded-2xl gap-2">
          <Share2 size={14}/> Share Link
        </Button>
        <Button onClick={copyLink} variant="outline" className="flex-1 h-11 rounded-2xl gap-2">
          {copied ? <><Check size={14} className="text-green-500"/> Copied!</> : <><Copy size={14}/> Copy Code</>}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center italic">
        You are <span className="font-bold text-primary">X</span> · You go first
      </p>
    </div>
  );

  // ── PLAYING / GAMEOVER ───────────────────────────────────────────
  if ((screen === "playing" || screen === "gameover") && game) {
    const statusText = game.winner
      ? game.winner === mySymbol ? "🎉 You win!" : "😔 Opponent wins"
      : game.isDraw ? "🤝 It's a draw!"
      : isMyTurn ? "Your turn" : "Opponent's turn…";

    return (
      <div className="flex flex-col items-center gap-4">
        <StatusBar />

        {/* Player tags */}
        <div className="flex items-center gap-2 w-full">
          {[0, 1].map((pi) => {
            const sym   = pi === 0 ? "X" : "O";
            const isMe  = pi === myIndex;
            const active = game.xIsNext ? pi === 0 : pi === 1;
            return (
              <div key={pi}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all
                  ${active && !game.winner && !game.isDraw
                    ? "border-primary bg-primary/5 font-bold"
                    : "border-border bg-muted/30"}`}>
                <span className={`text-xl font-black ${sym === "X" ? "text-blue-500" : "text-rose-500"}`}>{sym}</span>
                <span className="text-sm">{isMe ? "You" : "Opponent"}</span>
                {active && !game.winner && !game.isDraw && (
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                    className="ml-auto w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Status banner */}
        <motion.div key={statusText}
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="text-base font-bold text-center py-1">
          {statusText}
        </motion.div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[300px] aspect-square">
          {game.board.map((cell, i) => {
            const isWinCell = winLine?.includes(i);
            return (
              <motion.button key={i}
                onClick={() => makeMove(i)}
                whileTap={!cell && isMyTurn ? { scale: 0.92 } : {}}
                disabled={!!cell || !isMyTurn || !!game.winner || game.isDraw}
                className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-4xl font-black transition-all
                  ${isWinCell ? "border-primary bg-primary/15 scale-105" : "border-border bg-card"}
                  ${!cell && isMyTurn && !game.winner && !game.isDraw ? "hover:border-primary/50 hover:bg-primary/5 cursor-pointer" : ""}
                  ${cell === "X" ? "text-blue-500" : "text-rose-500"}`}>
                <AnimatePresence>
                  {cell && (
                    <motion.span key={cell + i}
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 16 }}>
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Room code pill */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
          <Link2 size={10}/> Room <span className="font-mono font-bold text-foreground">{roomId}</span>
          <button onClick={copyLink} className="ml-1 hover:text-primary transition-colors">
            {copied ? <Check size={10} className="text-green-500"/> : <Copy size={10}/>}
          </button>
        </div>

        {/* Opponent left notice */}
        {opponentLeft && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-center w-full">
            Opponent disconnected. Share the link to invite them back.
          </motion.div>
        )}

        {/* Game over actions */}
        {(game.winner || game.isDraw) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 w-full">
            <Button onClick={resetGame} className="flex-1 h-11 rounded-2xl gap-2">
              <RotateCcw size={14}/> Play Again
            </Button>
            <Button onClick={shareLink} variant="outline" className="flex-1 h-11 rounded-2xl gap-2">
              <Share2 size={14}/> Invite
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  return null;
}
