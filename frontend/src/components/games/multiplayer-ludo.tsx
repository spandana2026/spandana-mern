import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Users, Wifi, WifiOff, Share2, Link2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import LudoGame, { type LudoGS } from "./ludo-game";

type WsStatus = "connecting" | "open" | "closed";
type Screen   = "lobby" | "waiting" | "playing";

const P_NAME  = ["Red", "Blue", "Green", "Yellow"];
const P_COLOR = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];

function buildShareUrl(roomId: string): string {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  return `${window.location.origin}${base}/fun-zone?ludo=${roomId}`;
}

export default function MultiplayerLudo({ initialRoom }: { initialRoom?: string }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");
  const [screen,   setScreen]   = useState<Screen>("lobby");
  const [roomId,   setRoomId]   = useState("");
  const [joinCode, setJoinCode] = useState(initialRoom ?? "");
  const [myIndex,  setMyIndex]  = useState<number | null>(null);
  const [gs,       setGs]       = useState<LudoGS | null>(null);
  const [copied,   setCopied]   = useState(false);
  const [errMsg,   setErrMsg]   = useState("");
  const [opponentLeft, setOpponentLeft] = useState(false);

  const connect = useCallback(() => {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${window.location.host}/api/ws`);
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = () => {
      setWsStatus("open");
      if (initialRoom) ws.send(JSON.stringify({ type: "join", roomId: initialRoom }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data) as Record<string, unknown> & { type: string };

      if (msg.type === "created") {
        setRoomId(msg.roomId as string);
        setMyIndex(0);
        setScreen("waiting");
        setOpponentLeft(false);
      }
      if (msg.type === "joined") {
        setRoomId(msg.roomId as string);
        setMyIndex(msg.playerIndex as number);
        setOpponentLeft(false);
      }
      if (msg.type === "ludo-state") {
        const { type: _t, ...rest } = msg;
        setGs(rest as unknown as LudoGS);
        if ((msg.players as number) >= 2) setScreen("playing");
      }
      if (msg.type === "error") {
        setErrMsg(msg.message as string);
      }
      if (msg.type === "opponent_left") {
        setOpponentLeft(true);
      }
    };

    ws.onclose = () => setWsStatus("closed");
    ws.onerror = () => setWsStatus("closed");
  }, [initialRoom]);

  useEffect(() => { connect(); return () => wsRef.current?.close(); }, [connect]);

  useEffect(() => {
    const id = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);
    return () => clearInterval(id);
  }, []);

  function send(msg: object) { wsRef.current?.send(JSON.stringify(msg)); }

  function createGame() { setErrMsg(""); send({ type: "create", gameType: "ludo" }); }
  function joinGame()   {
    setErrMsg("");
    const code = joinCode.toUpperCase().trim();
    if (code.length < 4) { setErrMsg("Enter the room code."); return; }
    send({ type: "join", roomId: code });
  }

  function handleRoll() { send({ type: "ludo-roll" }); }
  function handleMove(player: number, piece: number, _dice: number) {
    send({ type: "ludo-move", piece });
  }
  function handleReset() { send({ type: "ludo-reset" }); }

  function copyLink() {
    navigator.clipboard.writeText(buildShareUrl(roomId)).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  }
  function shareLink() {
    if (navigator.share) navigator.share({ title: "Play Ludo with me!", url: buildShareUrl(roomId) }).catch(() => {});
    else copyLink();
  }

  const isMyTurn = gs && myIndex !== null && gs.turn === myIndex;

  const StatusBar = () => (
    <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-3
      ${wsStatus === "open" ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"}`}>
      {wsStatus === "open"
        ? <><Wifi size={11}/> Connected</>
        : <><WifiOff size={11}/> Disconnected — <button className="underline" onClick={connect}>reconnect</button></>}
    </div>
  );

  // ── LOBBY ─────────────────────────────────────────────────────────────────
  if (screen === "lobby") return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar />
      <div className="text-center">
        <h3 className="text-xl font-bold">🎲 Multiplayer Ludo</h3>
        <p className="text-sm text-muted-foreground mt-1">Invite a friend anywhere — play live via a link</p>
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
          <input value={joinCode}
            onChange={e => { setJoinCode(e.target.value.toUpperCase()); setErrMsg(""); }}
            onKeyDown={e => e.key === "Enter" && joinGame()}
            placeholder="Room code…"
            maxLength={8}
            className="flex-1 h-12 rounded-2xl border border-border bg-muted/50 px-4 text-base font-mono tracking-widest uppercase text-center focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <Button onClick={joinGame} disabled={wsStatus !== "open" || joinCode.length < 4}
            className="h-12 px-5 rounded-2xl font-bold">Join</Button>
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

  // ── WAITING ───────────────────────────────────────────────────────────────
  if (screen === "waiting") return (
    <div className="flex flex-col items-center gap-5 py-4">
      <motion.div animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
        ⏳
      </motion.div>
      <div className="text-center">
        <h3 className="text-xl font-bold">Waiting for opponent…</h3>
        <p className="text-sm text-muted-foreground mt-1">Share the code or link with your friend</p>
      </div>
      <div className="bg-primary/5 border border-primary/20 rounded-2xl px-8 py-5 text-center w-full">
        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Room Code</p>
        <p className="text-4xl font-black font-mono tracking-[0.2em] text-primary">{roomId}</p>
      </div>
      <div className="flex gap-2 w-full">
        <Button onClick={shareLink} variant="outline" className="flex-1 h-11 rounded-2xl gap-2">
          <Share2 size={14}/> Share Link
        </Button>
        <Button onClick={copyLink} variant="outline" className="flex-1 h-11 rounded-2xl gap-2">
          {copied ? <><Check size={14} className="text-green-500"/> Copied!</> : <><Copy size={14}/> Copy Code</>}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center italic">
        You are <span className="font-bold" style={{ color: myIndex !== null ? P_COLOR[myIndex] : undefined }}>
          {myIndex !== null ? P_NAME[myIndex] : "—"}
        </span>
      </p>
    </div>
  );

  // ── PLAYING ───────────────────────────────────────────────────────────────
  if (screen === "playing" && gs) {
    const overriddenGs: LudoGS = {
      ...gs,
      // Override roll behavior: we handle rolls via WS
    };

    return (
      <div className="flex flex-col gap-3">
        <StatusBar />

        {/* Player tag */}
        <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-2.5 border border-border">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: myIndex !== null ? P_COLOR[myIndex] : "#999" }} />
            <span className="text-sm font-semibold">
              You are <span style={{ color: myIndex !== null ? P_COLOR[myIndex] : undefined }}>
                {myIndex !== null ? P_NAME[myIndex] : "Spectator"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link2 size={10}/>
            <span className="font-mono font-bold text-foreground">{roomId}</span>
            <button onClick={copyLink} className="hover:text-primary ml-1">
              {copied ? <Check size={10} className="text-green-500"/> : <Copy size={10}/>}
            </button>
          </div>
        </div>

        {opponentLeft && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-center">
            Opponent disconnected. Share the link to invite them back.
          </motion.div>
        )}

        {/* The Ludo board — controlled externally */}
        <OnlineLudoBoard
          gs={overriddenGs}
          myIndex={myIndex ?? 0}
          onRoll={handleRoll}
          onMove={handleMove}
          onReset={handleReset}
        />
      </div>
    );
  }

  return null;
}

// ─── Online board wrapper ─────────────────────────────────────────────────────

interface BoardProps {
  gs:      LudoGS;
  myIndex: number;
  onRoll:  () => void;
  onMove:  (player: number, piece: number, dice: number) => void;
  onReset: () => void;
}

function OnlineLudoBoard({ gs, myIndex, onRoll, onMove, onReset }: BoardProps) {
  return (
    <LudoGame
      externalState={gs}
      onMove={onMove}
      onRoll={onRoll}
      myPlayer={myIndex}
      online={true}
    />
  );
}
