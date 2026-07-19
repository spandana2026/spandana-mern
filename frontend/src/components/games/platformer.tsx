import { useEffect, useRef, useState, useCallback } from "react";
import HowToPlay from "@/components/games/how-to-play";
import { playSound } from "@/lib/sound";

const W = 360;
const H = 480;
const GRAV    = 0.46;
const JUMP    = -11.5;
const SPEED   = 3.4;
const E_SPEED = 1.15;
const COIN_R  = 9;
const PLAT_H  = 14;

type Rect = { x: number; y: number; w: number; h: number };

const PLATS: Rect[] = [
  { x: 0,   y: 450, w: 360, h: 30 },
  { x: 20,  y: 365, w: 110, h: PLAT_H },
  { x: 232, y: 365, w: 108, h: PLAT_H },
  { x: 130, y: 310, w: 100, h: PLAT_H },
  { x: 30,  y: 258, w: 90,  h: PLAT_H },
  { x: 240, y: 258, w: 90,  h: PLAT_H },
  { x: 145, y: 205, w: 70,  h: PLAT_H },
  { x: 52,  y: 155, w: 68,  h: PLAT_H },
  { x: 240, y: 155, w: 68,  h: PLAT_H },
  { x: 148, y: 105, w: 64,  h: PLAT_H },
];

const COIN_POS = [
  {x:50,y:346},{x:75,y:346},{x:100,y:346},
  {x:252,y:346},{x:277,y:346},{x:302,y:346},
  {x:155,y:290},{x:180,y:290},
  {x:50,y:236},{x:75,y:236},
  {x:255,y:236},{x:280,y:236},
  {x:158,y:183},{x:180,y:183},{x:202,y:183},
  {x:68,y:133},{x:90,y:133},
  {x:254,y:133},{x:276,y:133},
  {x:163,y:82},{x:185,y:82},{x:207,y:82},
];

type EnemyDef = { platIdx: number; startX: number; dir: 1|-1 };
const ENEMY_DEFS: EnemyDef[] = [
  { platIdx: 1, startX: 30,  dir:  1 },
  { platIdx: 2, startX: 300, dir: -1 },
  { platIdx: 3, startX: 140, dir:  1 },
  { platIdx: 5, startX: 250, dir: -1 },
  { platIdx: 8, startX: 280, dir: -1 },
];

interface Enemy  { x: number; y: number; w: number; h: number; vx: number; alive: boolean; platIdx: number; invTimer: number; }
interface Coin   { x: number; y: number; collected: boolean; }
interface Player { x: number; y: number; w: number; h: number; vx: number; vy: number; onGround: boolean; facing: 1|-1; invTimer: number; }

function makeState() {
  const coins: Coin[] = COIN_POS.map(p => ({ ...p, collected: false }));
  const enemies: Enemy[] = ENEMY_DEFS.map(d => {
    const p = PLATS[d.platIdx];
    return { x: d.startX, y: p.y - 22, w: 22, h: 22, vx: E_SPEED * d.dir, alive: true, platIdx: d.platIdx, invTimer: 0 };
  });
  const player: Player = { x: 170, y: 410, w: 22, h: 26, vx: 0, vy: 0, onGround: false, facing: 1, invTimer: 0 };
  return { player, enemies, coins, lives: 3, score: 0, tick: 0 };
}

type GameState = ReturnType<typeof makeState>;
type Phase = "start" | "playing" | "dead" | "win";

function rectOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, tick: number) {
  if (p.invTimer > 0 && Math.floor(p.invTimer / 4) % 2 === 0) return;
  ctx.save();
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  ctx.translate(cx, cy);
  if (p.facing === -1) ctx.scale(-1, 1);

  const hh = p.h / 2;
  const hw = p.w / 2;

  ctx.fillStyle = "#e74c3c";
  ctx.beginPath();
  ctx.ellipse(0, -hh - 4, hw + 3, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(-hw - 3, -hh - 4, 3, 6);

  ctx.fillStyle = "#f39c12";
  ctx.fillRect(-hw, -hh, p.w, p.h - 8);

  ctx.fillStyle = "#2980b9";
  ctx.fillRect(-hw, -hh + p.h - 8, p.w, 8);

  ctx.fillStyle = "#fff";
  ctx.fillRect(4, -hh + 4, 8, 8);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(6, -hh + 6, 4, 4);

  const bob = Math.sin(tick * 0.3) * 1.5;
  ctx.fillStyle = "#795548";
  ctx.fillRect(-hw, hh - 2, 8, 5 + bob);
  ctx.fillRect(hw - 8, hh - 2, 8, 5 - bob);

  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, tick: number) {
  if (!e.alive) return;
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  if (e.vx > 0) ctx.scale(-1, 1);

  ctx.fillStyle = "#8e44ad";
  ctx.beginPath();
  ctx.arc(0, -e.h * 0.1, e.w * 0.52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6c3483";
  ctx.fillRect(-e.w * 0.4, 0, e.w * 0.8, e.h * 0.45);

  ctx.fillStyle = "#fff";
  ctx.fillRect(-e.w * 0.25, -e.h * 0.22, 7, 7);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(-e.w * 0.2, -e.h * 0.18, 4, 4);

  const bob = Math.sin(tick * 0.25) * 1.5;
  ctx.fillStyle = "#6c3483";
  ctx.fillRect(-e.w * 0.35, e.h * 0.38, 9, 5 + bob);
  ctx.fillRect(e.w * 0.1, e.h * 0.38, 9, 5 - bob);

  ctx.restore();
}

function drawCoin(ctx: CanvasRenderingContext2D, c: Coin, tick: number) {
  if (c.collected) return;
  const float = Math.sin(tick * 0.06 + c.x * 0.05) * 2;
  ctx.save();
  ctx.font = `${COIN_R * 2}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⭐", c.x, c.y + float);
  ctx.restore();
}

function drawPlatform(ctx: CanvasRenderingContext2D, p: Rect) {
  ctx.fillStyle = p.y > 430 ? "#27ae60" : "#8B5E3C";
  ctx.beginPath();
  ctx.roundRect(p.x, p.y, p.w, p.h, p.y > 430 ? 4 : 6);
  ctx.fill();
  ctx.fillStyle = p.y > 430 ? "#2ecc71" : "#A0714F";
  ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, 3);
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#74b9ff");
  sky.addColorStop(1, "#a8d8ea");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath(); ctx.ellipse(60, 60, 40, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(85, 50, 30, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(200, 80, 45, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(230, 68, 35, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(290, 40, 38, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(315, 30, 25, 15, 0, 0, Math.PI * 2); ctx.fill();
}

const STEPS = [
  { icon: "⬅️➡️", text: "Tap the ← → buttons (or arrow keys) to run." },
  { icon: "🔼",   text: "Tap ▲ or press Space / W / ↑ to jump. Hold for higher jumps." },
  { icon: "⭐",   text: "Collect all the gold stars — jump on platforms to reach them!" },
  { icon: "👾",   text: "Purple monsters patrol the platforms. Jump on their head to beat them." },
  { icon: "❤️",   text: "You have 3 lives. Touching a monster from the side costs one life." },
  { icon: "🏆",   text: "Collect every star to win! Higher platforms have more stars." },
];

export default function PlatformerGame() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef<GameState>(makeState());
  const keysRef    = useRef<Set<string>>(new Set());
  const touchRef   = useRef({ left: false, right: false, jump: false });
  const jumpUsed   = useRef(false);
  const animRef    = useRef<number>(0);
  const phaseRef   = useRef<Phase>("start");

  const [phase, setPhase]   = useState<Phase>("start");
  const [lives, setLives]   = useState(3);
  const [score, setScore]   = useState(0);
  const totalCoins = COIN_POS.length;

  const setPhaseSync = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const restart = useCallback(() => {
    stateRef.current = makeState();
    jumpUsed.current = false;
    setLives(3);
    setScore(0);
    setPhaseSync("playing");
  }, [setPhaseSync]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space","KeyA","KeyD","KeyW"].includes(e.code)) e.preventDefault();
      keysRef.current.add(e.code);
    };
    const offKey = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
      if (["ArrowUp","KeyW","Space"].includes(e.code)) jumpUsed.current = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", offKey);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", offKey); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function loop() {
      animRef.current = requestAnimationFrame(loop);
      if (phaseRef.current !== "playing") return;

      const s = stateRef.current;
      s.tick++;
      const { player: pl, enemies, coins } = s;

      const wantLeft  = keysRef.current.has("ArrowLeft")  || keysRef.current.has("KeyA")  || touchRef.current.left;
      const wantRight = keysRef.current.has("ArrowRight") || keysRef.current.has("KeyD")  || touchRef.current.right;
      const wantJump  = keysRef.current.has("ArrowUp")    || keysRef.current.has("KeyW")  || keysRef.current.has("Space") || touchRef.current.jump;

      if (wantLeft)  { pl.vx = -SPEED; pl.facing = -1; }
      else if (wantRight) { pl.vx = SPEED;  pl.facing = 1; }
      else pl.vx = 0;

      if (wantJump && pl.onGround && !jumpUsed.current) {
        pl.vy = JUMP;
        pl.onGround = false;
        jumpUsed.current = true;
        playSound("tick");
      }
      if (!wantJump) jumpUsed.current = false;

      pl.vy += GRAV;
      pl.x  += pl.vx;
      pl.y  += pl.vy;
      pl.x   = Math.max(0, Math.min(W - pl.w, pl.x));
      pl.onGround = false;

      if (pl.invTimer > 0) pl.invTimer--;

      for (const p of PLATS) {
        if (
          pl.x + pl.w > p.x && pl.x < p.x + p.w &&
          pl.y + pl.h > p.y && pl.y + pl.h < p.y + p.h + 10 &&
          pl.vy >= 0
        ) {
          pl.y       = p.y - pl.h;
          pl.vy      = 0;
          pl.onGround = true;
        }
      }

      if (pl.y > H + 60) {
        s.lives--;
        setLives(s.lives);
        playSound("wrong");
        if (s.lives <= 0) { setPhaseSync("dead"); return; }
        pl.x = 170; pl.y = 410; pl.vx = 0; pl.vy = 0; pl.invTimer = 90;
      }

      for (const e of enemies) {
        if (!e.alive) continue;
        if (e.invTimer > 0) { e.invTimer--; continue; }
        e.x += e.vx;
        const p = PLATS[e.platIdx];
        if (e.x < p.x) { e.x = p.x; e.vx = Math.abs(e.vx); }
        if (e.x + e.w > p.x + p.w) { e.x = p.x + p.w - e.w; e.vx = -Math.abs(e.vx); }
        e.y = p.y - e.h;

        if (pl.invTimer > 0) continue;
        if (!rectOverlap({ x: pl.x, y: pl.y, w: pl.w, h: pl.h }, e)) continue;

        const plBottom = pl.y + pl.h;
        const eTop     = e.y;
        if (pl.vy > 0 && plBottom - eTop < 18) {
          e.alive    = false;
          pl.vy      = JUMP * 0.65;
          s.score   += 50;
          setScore(s.score);
          playSound("correct");
        } else {
          s.lives--;
          setLives(s.lives);
          playSound("wrong");
          if (s.lives <= 0) { setPhaseSync("dead"); return; }
          pl.x = 170; pl.y = 410; pl.vx = 0; pl.vy = 0; pl.invTimer = 100;
        }
      }

      let collected = 0;
      for (const c of coins) {
        if (c.collected) { collected++; continue; }
        const dx = pl.x + pl.w / 2 - c.x;
        const dy = pl.y + pl.h / 2 - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < COIN_R + pl.w / 2) {
          c.collected = true;
          s.score += 10;
          setScore(s.score);
          playSound("tick");
          collected++;
        }
      }
      if (collected === coins.length) { setPhaseSync("win"); return; }

      drawBackground(ctx!);
      PLATS.forEach(p => drawPlatform(ctx!, p));
      coins.forEach(c => drawCoin(ctx!, c, s.tick));
      enemies.forEach(e => drawEnemy(ctx!, e, s.tick));
      drawPlayer(ctx!, pl, s.tick);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [setPhaseSync]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phaseRef.current === "playing") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawBackground(ctx);
    PLATS.forEach(p => drawPlatform(ctx, p));
    COIN_POS.forEach(c => { ctx.font = "18px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("⭐", c.x, c.y); });
  }, []);

  const startTouch = (k: "left" | "right" | "jump") => (e: React.TouchEvent) => { e.preventDefault(); touchRef.current[k] = true; };
  const endTouch   = (k: "left" | "right" | "jump") => (e: React.TouchEvent) => { e.preventDefault(); touchRef.current[k] = false; if (k === "jump") jumpUsed.current = false; };

  const scale = typeof window !== "undefined" ? Math.min(1, (window.innerWidth - 40) / W) : 1;

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <HowToPlay steps={STEPS} />

      <div className="flex items-center justify-between w-full max-w-[360px] px-1">
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`text-xl ${i < lives ? "opacity-100" : "opacity-20"}`}>❤️</span>
          ))}
        </div>
        <div className="text-sm font-bold text-foreground">⭐ {score} pts</div>
        <div className="text-xs text-muted-foreground font-semibold">
          {stateRef.current.coins.filter(c => c.collected).length}/{totalCoins} coins
        </div>
      </div>

      <div className="relative" style={{ width: W * scale, height: H * scale }}>
        <canvas
          ref={canvasRef}
          width={W} height={H}
          style={{ width: W * scale, height: H * scale, display: "block", borderRadius: 16, border: "2px solid #ddd" }}
        />

        {phase === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: "rgba(0,0,0,0.55)" }}>
            <div className="text-5xl mb-3">🕹️</div>
            <p className="text-white font-black text-2xl mb-1">Platform Hero</p>
            <p className="text-white/70 text-sm mb-6 text-center px-6">Collect all ⭐ stars, stomp the monsters!</p>
            <button onClick={restart}
              className="px-8 py-3 rounded-full bg-yellow-400 text-yellow-900 font-black text-lg shadow-lg hover:bg-yellow-300 active:scale-95 transition-all">
              Start Game!
            </button>
          </div>
        )}

        {phase === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: "rgba(180,0,0,0.7)" }}>
            <div className="text-5xl mb-3">💀</div>
            <p className="text-white font-black text-2xl mb-1">Game Over!</p>
            <p className="text-white/80 text-sm mb-1">Score: {score} pts</p>
            <p className="text-white/60 text-xs mb-5">Tip: Jump on their heads, not into them!</p>
            <button onClick={restart}
              className="px-8 py-3 rounded-full bg-white text-red-700 font-black text-lg shadow-lg hover:bg-gray-100 active:scale-95 transition-all">
              Try Again
            </button>
          </div>
        )}

        {phase === "win" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: "rgba(0,120,0,0.75)" }}>
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-white font-black text-2xl mb-1">You Win!</p>
            <p className="text-white/90 text-sm mb-1">Score: {score} pts — All stars collected!</p>
            <p className="text-yellow-300 text-xs mb-5">Amazing! You're a Platform Hero!</p>
            <button onClick={restart}
              className="px-8 py-3 rounded-full bg-yellow-400 text-yellow-900 font-black text-lg shadow-lg hover:bg-yellow-300 active:scale-95 transition-all">
              Play Again
            </button>
          </div>
        )}
      </div>

      {phase === "playing" && (
        <div className="flex items-center justify-between w-full max-w-[360px] px-2 mt-1">
          <div className="flex gap-3">
            <button
              onTouchStart={startTouch("left")} onTouchEnd={endTouch("left")}
              onMouseDown={() => { touchRef.current.left = true; }} onMouseUp={() => { touchRef.current.left = false; }}
              className="w-16 h-16 rounded-2xl bg-white/90 border-2 border-gray-300 shadow-lg text-2xl font-black text-gray-700 flex items-center justify-center active:scale-90 active:bg-gray-100 transition-all">
              ◀
            </button>
            <button
              onTouchStart={startTouch("right")} onTouchEnd={endTouch("right")}
              onMouseDown={() => { touchRef.current.right = true; }} onMouseUp={() => { touchRef.current.right = false; }}
              className="w-16 h-16 rounded-2xl bg-white/90 border-2 border-gray-300 shadow-lg text-2xl font-black text-gray-700 flex items-center justify-center active:scale-90 active:bg-gray-100 transition-all">
              ▶
            </button>
          </div>
          <button
            onTouchStart={startTouch("jump")} onTouchEnd={endTouch("jump")}
            onMouseDown={() => { touchRef.current.jump = true; }} onMouseUp={() => { touchRef.current.jump = false; }}
            className="w-20 h-16 rounded-2xl bg-yellow-400 border-2 border-yellow-500 shadow-lg text-2xl font-black text-yellow-900 flex items-center justify-center active:scale-90 active:bg-yellow-300 transition-all">
            ▲ Jump
          </button>
        </div>
      )}
    </div>
  );
}
