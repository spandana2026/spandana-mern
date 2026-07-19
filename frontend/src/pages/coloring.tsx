import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import Nav from "@/components/nav";

const W = 520, H = 540;

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function f(n: number) { return n.toFixed(1); }

function petalPath(cx: number, cy: number, r: number, hl: number, hw: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  const ax = cx + (r - hl) * Math.cos(a), ay = cy + (r - hl) * Math.sin(a);
  const bx = cx + (r + hl) * Math.cos(a), by = cy + (r + hl) * Math.sin(a);
  const px = -Math.sin(a) * hw, py = Math.cos(a) * hw;
  return `M${f(ax)},${f(ay)} C${f(ax+px*2)},${f(ay+py*2)} ${f(bx+px)},${f(by+py)} ${f(bx)},${f(by)} C${f(bx-px)},${f(by-py)} ${f(ax-px*2)},${f(ay-py*2)} ${f(ax)},${f(ay)}Z`;
}

function mandalaArt() {
  const cx = 260, cy = 270; let s = "";
  const P = (d: string, sw = 3) => `<path d="${d}" fill="none" stroke="#111" stroke-width="${sw}"/>`;
  const C = (r: number, sw = 3) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#111" stroke-width="${sw}"/>`;
  s += C(252, 4); s += C(246, 1.5);
  for (let i = 0; i < 8; i++) s += P(petalPath(cx, cy, 200, 48, 26, i * 45));
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 * Math.PI) / 180;
    s += `<circle cx="${f(cx+246*Math.cos(a))}" cy="${f(cy+246*Math.sin(a))}" r="5" fill="none" stroke="#111" stroke-width="2"/>`;
    const a2 = ((i*45-22.5)*Math.PI)/180, a3 = ((i*45+22.5)*Math.PI)/180;
    const d2m = cx+188*Math.cos(a2), d2y = cy+188*Math.sin(a2);
    const d3m = cx+188*Math.cos(a3), d3y = cy+188*Math.sin(a3);
    s += `<path d="M${f(cx+200*Math.cos(a2))},${f(cy+200*Math.sin(a2))} L${f(d2m+7)},${f(d2y)} L${f(d2m)},${f(d2y+7)} L${f(d2m-7)},${f(d2y)} L${f(d2m)},${f(d2y-7)}Z" fill="none" stroke="#111" stroke-width="1.5"/>`;
    s += `<path d="M${f(cx+200*Math.cos(a3))},${f(cy+200*Math.sin(a3))} L${f(d3m+7)},${f(d3y)} L${f(d3m)},${f(d3y+7)} L${f(d3m-7)},${f(d3y)} L${f(d3m)},${f(d3y-7)}Z" fill="none" stroke="#111" stroke-width="1.5"/>`;
  }
  for (let i = 0; i < 8; i++) s += P(petalPath(cx, cy, 155, 32, 17, i*45+22.5), 2.5);
  for (let i = 0; i < 16; i++) {
    const a = (i*22.5*Math.PI)/180;
    const x1=cx+128*Math.cos(a), y1=cy+128*Math.sin(a), x2=cx+152*Math.cos(a), y2=cy+152*Math.sin(a);
    const pw=8, ppx=-Math.sin(a)*pw, ppy=Math.cos(a)*pw;
    s += `<path d="M${f(x1)},${f(y1)} Q${f(x1+ppx*1.5)},${f(y1+ppy*1.5)} ${f(x2)},${f(y2)} Q${f(x2-ppx*1.5)},${f(y2-ppy*1.5)} ${f(x1)},${f(y1)}Z" fill="none" stroke="#111" stroke-width="2"/>`;
  }
  [133,116,93].forEach(r => s += C(r, 2.5));
  for (let i = 0; i < 12; i++) s += P(petalPath(cx, cy, 68, 22, 11, i*30), 2);
  [50,34,20].forEach(r => s += C(r, 2.5));
  s += `<circle cx="${cx}" cy="${cy}" r="11" fill="none" stroke="#111" stroke-width="2.5"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (i*45*Math.PI)/180;
    s += `<line x1="${f(cx+34*Math.cos(a))}" y1="${f(cy+34*Math.sin(a))}" x2="${f(cx+20*Math.cos(a))}" y2="${f(cy+20*Math.sin(a))}" stroke="#111" stroke-width="2"/>`;
  }
  return s;
}

function peacockArt() {
  const cx = 260, cy = 390; let s = "";
  const P = (d: string, sw = 3) => `<path d="${d}" fill="none" stroke="#111" stroke-width="${sw}"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="52" ry="68" fill="none" stroke="#111" stroke-width="4"/>`;
  s += P(`M${cx-17},${cy-65} C${cx-21},${cy-118} ${cx-11},${cy-152} ${cx},${cy-172} C${cx+11},${cy-152} ${cx+21},${cy-118} ${cx+17},${cy-65}`, 3.5);
  s += `<ellipse cx="${cx}" cy="${cy-184}" rx="20" ry="24" fill="none" stroke="#111" stroke-width="3.5"/>`;
  s += P(`M${cx-9},${cy-173} L${cx-22},${cy-165} L${cx-9},${cy-158}`, 2.5);
  s += `<circle cx="${cx+4}" cy="${cy-188}" r="5.5" fill="none" stroke="#111" stroke-width="2.5"/>`;
  s += `<circle cx="${cx+4}" cy="${cy-188}" r="2" fill="#111"/>`;
  for (let i=-2; i<=2; i++) {
    s += `<line x1="${cx+i*6}" y1="${cy-207}" x2="${cx+i*2}" y2="${cy-232}" stroke="#111" stroke-width="2"/>`;
    s += `<circle cx="${cx+i*2}" cy="${cy-233}" r="3.5" fill="none" stroke="#111" stroke-width="2"/>`;
  }
  for (let i=-5; i<=5; i++) {
    const angle=(i*17*Math.PI)/180;
    const ex=cx+188*Math.sin(angle), ey=cy-188*Math.cos(angle)+75;
    s += P(`M${cx},${cy-18} Q${f(cx+(ex-cx)*0.5+i*12)},${f(cy-95)} ${f(ex)},${f(ey)}`, 2.5);
    const fr=20;
    s += `<ellipse cx="${f(ex)}" cy="${f(ey)}" rx="${fr}" ry="${f(fr*1.25)}" fill="none" stroke="#111" stroke-width="2.5"/>`;
    s += `<ellipse cx="${f(ex)}" cy="${f(ey)}" rx="${f(fr*0.52)}" ry="${f(fr*0.62)}" fill="none" stroke="#111" stroke-width="2"/>`;
    s += `<ellipse cx="${f(ex)}" cy="${f(ey)}" rx="${f(fr*0.2)}" ry="${f(fr*0.25)}" fill="none" stroke="#111" stroke-width="1.5"/>`;
  }
  s += P(`M${cx+28},${cy-28} C${cx+62},${cy+8} ${cx+68},${cy+48} ${cx+44},${cy+58}`, 2.5);
  s += P(`M${cx-28},${cy-28} C${cx-62},${cy+8} ${cx-68},${cy+48} ${cx-44},${cy+58}`, 2.5);
  s += P(`M${cx-17},${cy+67} L${cx-21},${cy+110} L${cx-34},${cy+122}`, 2.5);
  s += P(`M${cx+17},${cy+67} L${cx+21},${cy+110} L${cx+34},${cy+122}`, 2.5);
  return s;
}

function oceanArt() {
  let s = "";
  const P = (d: string, sw = 3) => `<path d="${d}" fill="none" stroke="#111" stroke-width="${sw}"/>`;
  s += P(`M0,148 C58,132 118,162 178,148 C238,132 298,162 358,148 C418,132 478,162 520,148`, 2);
  s += P(`M0,162 C58,146 118,176 178,162 C238,146 298,176 358,162 C418,146 478,176 520,162`, 1.5);
  s += P(`M152,278 C132,254 130,224 148,208 C174,192 212,198 232,218 C252,234 255,262 238,280 C216,298 170,298 152,278Z`);
  s += P(`M152,278 C132,288 116,268 122,250 C116,268 102,288 113,304`, 2.5);
  s += `<circle cx="220" cy="228" r="8.5" fill="none" stroke="#111" stroke-width="2.5"/>`;
  s += `<circle cx="220" cy="228" r="3.5" fill="#111"/>`;
  for (let row=0; row<3; row++) for (let col=0; col<4; col++) {
    s += `<path d="M${165+col*18-row*5},${222+row*18} A13,13 0 0,1 ${165+col*18-row*5+15},${222+row*18}" fill="none" stroke="#111" stroke-width="1.5"/>`;
  }
  s += P(`M185,208 C183,182 200,168 215,165 C226,178 222,195 208,208Z`);
  s += P(`M180,272 C175,290 162,300 155,295 C157,282 168,272 180,272Z`);
  s += P(`M55,98 C43,88 43,73 55,68 C67,73 71,88 59,98Z`, 2.5);
  s += P(`M55,98 C45,104 37,94 40,83`, 2);
  s += `<circle cx="64" cy="76" r="3.5" fill="none" stroke="#111" stroke-width="2"/>`;
  s += `<circle cx="64" cy="76" r="1.5" fill="#111"/>`;
  s += P(`M415,205 C403,192 403,175 416,170 C429,175 433,192 420,205Z`, 2.5);
  s += P(`M415,205 C403,211 395,200 398,188`, 2);
  s += `<circle cx="424" cy="178" r="3.5" fill="none" stroke="#111" stroke-width="2"/>`;
  s += `<circle cx="424" cy="178" r="1.5" fill="#111"/>`;
  s += P(`M418,308 C443,298 452,322 438,337 C452,327 465,347 448,366 C465,350 467,380 442,390 C456,383 452,410 428,415 C418,420 414,412 416,404`, 2.5);
  s += `<circle cx="432" cy="292" r="11" fill="none" stroke="#111" stroke-width="2.5"/>`;
  s += `<circle cx="435" cy="287" r="3" fill="none" stroke="#111" stroke-width="2"/>`;
  s += P(`M448,330 C462,323 467,335 458,344`, 2);
  s += P(`M75,520 C63,490 88,470 75,444 C63,418 86,398 76,372`, 2.5);
  s += P(`M108,520 C120,488 96,464 110,436 C124,410 100,386 113,355`, 2.5);
  for (let y=375; y<520; y+=38) {
    s += P(`M75,${y} C58,${y-10} 54,${y-26} 64,${y-36}`, 2);
    s += P(`M108,${y-18} C126,${y-30} 130,${y-46} 120,${y-56}`, 2);
  }
  s += P(`M355,408 L367,438 L396,426 L374,450 L388,480 L355,462 L323,480 L337,450 L315,426 L344,438Z`);
  [52,92,142].forEach(x => [62,90,115].forEach(y => s += `<circle cx="${x}" cy="${y}" r="${3+((x+y)%4)}" fill="none" stroke="#111" stroke-width="1.5"/>`));
  s += P(`M228,488 C213,468 213,446 226,438 C248,430 265,443 268,460 C272,478 256,494 238,494Z`);
  s += P(`M226,438 C238,458 252,468 268,460`, 2); s += P(`M223,452 C236,462 250,468 264,464`, 1.5);
  s += P(`M148,515 L148,478 M133,478 L148,478 L163,478 M126,478 L126,458 M170,478 L170,458`, 3);
  s += `<circle cx="126" cy="455" r="7" fill="none" stroke="#111" stroke-width="2.5"/>`;
  s += `<circle cx="148" cy="475" r="8" fill="none" stroke="#111" stroke-width="2.5"/>`;
  s += `<circle cx="170" cy="455" r="7" fill="none" stroke="#111" stroke-width="2.5"/>`;
  return s;
}

const BUILT_IN_SHEETS = [
  { id: "mandala", label: "Mandala", emoji: "🌸", art: mandalaArt() },
  { id: "peacock", label: "Peacock", emoji: "🦚", art: peacockArt() },
  { id: "ocean",   label: "Ocean",   emoji: "🐠", art: oceanArt()   },
];

const PALETTE = [
  "#FF2D2D","#FF6B2D","#FFC72D","#FFE82D","#88DD00",
  "#2DBB6A","#2DC4FF","#2D5FFF","#8B2DFF","#CC2DFF",
  "#FF2D99","#FF99BB","#FFDDAA","#AAEEBB","#BBDDFF",
  "#EEBBFF","#FFFFFF","#CCCCCC","#888888","#222222",
];

function bfsFill(data: Uint8ClampedArray, x0: number, y0: number, fillR: number, fillG: number, fillB: number) {
  const idx = (y0 * W + x0) * 4;
  const tR = data[idx], tG = data[idx+1], tB = data[idx+2];
  if (tR < 80 && tG < 80 && tB < 80) return;
  if (tR===fillR && tG===fillG && tB===fillB) return;
  const TOL = 60;
  const visited = new Uint8Array(W * H);
  const stack = [y0 * W + x0];
  while (stack.length) {
    const pos = stack.pop()!;
    if (visited[pos]) continue;
    visited[pos] = 1;
    const x = pos % W, y = Math.floor(pos / W);
    const i = pos * 4;
    if (data[i]<80 && data[i+1]<80 && data[i+2]<80) continue;
    if (Math.abs(data[i]-tR)+Math.abs(data[i+1]-tG)+Math.abs(data[i+2]-tB) > TOL) continue;
    data[i]=fillR; data[i+1]=fillG; data[i+2]=fillB; data[i+3]=255;
    if (x>0) stack.push(pos-1);
    if (x<W-1) stack.push(pos+1);
    if (y>0) stack.push(pos-W);
    if (y<H-1) stack.push(pos+W);
  }
}

export default function ColoringPage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const colorRef   = useRef("#FF2D2D");
  const toolRef    = useRef<"fill"|"brush"|"erase">("fill");
  const brushRef   = useRef(14);
  const drawingRef = useRef(false);
  const undoStack  = useRef<ImageData[]>([]);
  const linesImg   = useRef<HTMLImageElement | null>(null);

  const [color,     setColorState] = useState("#FF2D2D");
  const [tool,      setToolState]  = useState<"fill"|"brush"|"erase">("fill");
  const [brushSize, setBrushState] = useState(14);
  const [sheets,    setSheets]     = useState(BUILT_IN_SHEETS);
  const [sheetIdx,  setSheetIdx]   = useState(0);
  const [canUndo,   setCanUndo]    = useState(false);
  const [aiPrompt,  setAiPrompt]   = useState("");
  const [generating,setGenerating] = useState(false);
  const [aiError,   setAiError]    = useState("");

  const setColor = (c: string) => { colorRef.current = c; setColorState(c); };
  const setTool  = (t: "fill"|"brush"|"erase") => { toolRef.current = t; setToolState(t); };
  const setBrush = (s: number) => { brushRef.current = s; setBrushState(s); };

  const ctx = () => canvasRef.current?.getContext("2d") ?? null;

  const stampLines = useCallback(() => {
    const c = ctx(); const img = linesImg.current;
    if (!c || !img) return;
    c.drawImage(img, 0, 0, W, H);
  }, []);

  const loadSheet = useCallback((art: string) => {
    const c = ctx();
    if (!c) return;
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
    undoStack.current = [];
    setCanUndo(false);
    const svgFull = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="white"/>
      ${art}
    </svg>`;
    const img = new Image();
    img.onload = () => {
      linesImg.current = img;
      const c2 = ctx();
      if (!c2) return;
      c2.fillStyle = "#ffffff";
      c2.fillRect(0, 0, W, H);
      c2.drawImage(img, 0, 0, W, H);
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgFull);
  }, []);

  useEffect(() => { loadSheet(sheets[sheetIdx].art); }, [sheetIdx, sheets]);

  const pushUndo = useCallback(() => {
    const c = ctx(); if (!c) return;
    undoStack.current = [...undoStack.current.slice(-8), c.getImageData(0, 0, W, H)];
    setCanUndo(true);
  }, []);

  const undo = useCallback(() => {
    const c = ctx(); if (!c || !undoStack.current.length) return;
    c.putImageData(undoStack.current[undoStack.current.length-1], 0, 0);
    undoStack.current = undoStack.current.slice(0, -1);
    setCanUndo(undoStack.current.length > 0);
  }, []);

  const clearCanvas = useCallback(() => {
    pushUndo();
    loadSheet(sheets[sheetIdx].art);
  }, [sheets, sheetIdx, loadSheet, pushUndo]);

  const getXY = useCallback((clientX: number, clientY: number) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(W-1, Math.floor((clientX - r.left) * W / r.width))),
      y: Math.max(0, Math.min(H-1, Math.floor((clientY - r.top)  * H / r.height))),
    };
  }, []);

  const doFill = useCallback((clientX: number, clientY: number) => {
    const c = ctx(); if (!c) return;
    const { x, y } = getXY(clientX, clientY);
    pushUndo();
    const imgData = c.getImageData(0, 0, W, H);
    const { r, g, b } = hexToRgb(colorRef.current);
    bfsFill(imgData.data, x, y, r, g, b);
    c.putImageData(imgData, 0, 0);
    stampLines();
  }, [getXY, pushUndo, stampLines]);

  const doBrushStart = useCallback((clientX: number, clientY: number) => {
    const c = ctx(); if (!c) return;
    if (!drawingRef.current) pushUndo();
    drawingRef.current = true;
    const { x, y } = getXY(clientX, clientY);
    c.beginPath();
    c.arc(x, y, toolRef.current === "erase" ? brushRef.current : brushRef.current / 2, 0, Math.PI * 2);
    c.fillStyle = toolRef.current === "erase" ? "#ffffff" : colorRef.current;
    c.fill();
    c.beginPath();
    c.moveTo(x, y);
  }, [getXY, pushUndo]);

  const doBrushMove = useCallback((clientX: number, clientY: number) => {
    if (!drawingRef.current) return;
    const c = ctx(); if (!c) return;
    const { x, y } = getXY(clientX, clientY);
    c.lineTo(x, y);
    c.strokeStyle = toolRef.current === "erase" ? "#ffffff" : colorRef.current;
    c.lineWidth   = toolRef.current === "erase" ? brushRef.current * 2 : brushRef.current;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.stroke();
    c.beginPath();
    c.moveTo(x, y);
    stampLines();
  }, [getXY, stampLines]);

  // Mouse
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (toolRef.current === "fill") doFill(e.clientX, e.clientY);
    else doBrushStart(e.clientX, e.clientY);
  }, [doFill, doBrushStart]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    doBrushMove(e.clientX, e.clientY);
  }, [doBrushMove]);

  const onMouseUp = useCallback(() => { drawingRef.current = false; }, []);

  // Touch
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    if (toolRef.current === "fill") doFill(t.clientX, t.clientY);
    else doBrushStart(t.clientX, t.clientY);
  }, [doFill, doBrushStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    doBrushMove(t.clientX, t.clientY);
  }, [doBrushMove]);

  const onTouchEnd = useCallback(() => { drawingRef.current = false; }, []);

  const download = () => {
    const a = document.createElement("a");
    a.download = `colouring-${sheets[sheetIdx].id}.png`;
    a.href = canvasRef.current!.toDataURL();
    a.click();
  };

  const generateSheet = async () => {
    if (!aiPrompt.trim() || generating) return;
    setGenerating(true);
    setAiError("");
    try {
      const res = await fetch("/api/coloring/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { svg } = await res.json() as { svg: string };
      const newSheet = { id: `ai-${Date.now()}`, label: aiPrompt.trim(), emoji: "✨", art: svg };
      setSheets(prev => {
        const next = [...prev, newSheet];
        setTimeout(() => setSheetIdx(next.length - 1), 0);
        return next;
      });
      setAiPrompt("");
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "Generation failed. Try again.");
    }
    setGenerating(false);
  };

  const TOOLS: { id: "fill"|"brush"|"erase"; icon: string; label: string }[] = [
    { id: "fill",  icon: "🪣", label: "Fill"  },
    { id: "brush", icon: "🖌️", label: "Brush" },
    { id: "erase", icon: "⬜", label: "Erase" },
  ];

  return (
    <div className="min-h-screen flex flex-col select-none"
      style={{ background: "linear-gradient(160deg,#1a0533 0%,#2d0b66 55%,#0d1f4a 100%)" }}>

      <Nav />

      <div className="flex flex-col flex-1 max-w-lg mx-auto w-full pb-6">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h1 className="text-white font-black text-xl tracking-tight" style={{ textShadow: "0 0 18px #a855f7" }}>
              🎨 Colour &amp; Create
            </h1>
            <p className="text-purple-300 text-xs opacity-70">Spandana Care Aid Foundation</p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={undo} disabled={!canUndo} title="Undo"
              className="w-9 h-9 rounded-xl text-sm flex items-center justify-center transition-all disabled:opacity-30 active:scale-95"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff" }}>↩</button>
            <button onClick={clearCanvas} title="Reset"
              className="w-9 h-9 rounded-xl text-sm flex items-center justify-center transition-all hover:bg-red-500 active:scale-95"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff" }}>🗑</button>
            <button onClick={download} title="Save"
              className="w-9 h-9 rounded-xl text-sm flex items-center justify-center transition-all hover:bg-green-600 active:scale-95"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff" }}>💾</button>
          </div>
        </div>

        {/* AI Prompt */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 items-center">
            <input
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generateSheet()}
              placeholder="Type anything… 'a unicorn', 'a rocket ship'"
              className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white placeholder-purple-400 outline-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(168,85,247,0.4)" }}
            />
            <button onClick={generateSheet} disabled={!aiPrompt.trim() || generating}
              className="px-3 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all disabled:opacity-50 active:scale-95"
              style={{ background: generating ? "#555" : "linear-gradient(135deg,#a855f7,#6366f1)", color: "#fff", minWidth: 72 }}>
              {generating ? "✦ …" : "✦ Draw"}
            </button>
          </div>
          {aiError && <p className="text-red-400 text-xs mt-1 px-1">{aiError}</p>}
        </div>

        {/* Sheet Tabs */}
        <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto">
          {sheets.map((s, i) => (
            <button key={s.id} onClick={() => setSheetIdx(i)}
              className="flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{
                background: i === sheetIdx ? "linear-gradient(135deg,#a855f7,#6366f1)" : "rgba(255,255,255,0.07)",
                color: i === sheetIdx ? "#fff" : "rgba(255,255,255,0.55)",
                border: `1.5px solid ${i === sheetIdx ? "#a855f7" : "transparent"}`,
                boxShadow: i === sheetIdx ? "0 3px 16px rgba(168,85,247,0.45)" : "none",
              }}>
              <span className="text-lg leading-tight">{s.emoji}</span>
              <span className="max-w-[56px] truncate">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="px-3">
          <div className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              border: "2px solid rgba(168,85,247,0.45)",
              boxShadow: "0 0 32px rgba(168,85,247,0.25)",
              cursor: tool === "fill" ? "crosshair" : "cell",
              touchAction: "none",
            }}>
            <canvas ref={canvasRef} width={W} height={H}
              className="block w-full"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
          </div>
        </div>

        {/* Tools */}
        <div className="flex gap-2 px-4 py-3">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{
                background: tool === t.id ? "linear-gradient(135deg,#a855f7,#6366f1)" : "rgba(255,255,255,0.07)",
                color: "#fff",
                border: `1.5px solid ${tool === t.id ? "#a855f7" : "rgba(255,255,255,0.12)"}`,
                boxShadow: tool === t.id ? "0 3px 14px rgba(168,85,247,0.4)" : "none",
              }}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Brush size */}
        {(tool === "brush" || tool === "erase") && (
          <div className="px-4 pb-2 flex items-center gap-3">
            <span className="text-purple-300 text-xs w-20">Size: {brushSize}px</span>
            <input type="range" min={3} max={40} value={brushSize}
              onChange={e => setBrush(Number(e.target.value))}
              className="flex-1 accent-purple-500" />
          </div>
        )}

        {/* Colour Palette */}
        <div className="px-4 pb-2 pt-1">
          <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex flex-wrap gap-2 justify-center">
              {PALETTE.map(c => (
                <button key={c} onClick={() => { setColor(c); setTool("fill"); }}
                  style={{
                    width: 32, height: 32,
                    borderRadius: "50%",
                    background: c,
                    border: color === c ? "3px solid white" : c === "#FFFFFF" ? "2px solid rgba(255,255,255,0.3)" : "2px solid rgba(0,0,0,0.15)",
                    transform: color === c ? "scale(1.28)" : "scale(1)",
                    boxShadow: color === c ? `0 0 10px ${c}88` : "none",
                    transition: "all 0.12s",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Back link */}
        <p className="text-center text-purple-400 text-xs pt-2">
          <Link href="/" className="hover:text-purple-200 transition-colors">← Back to home</Link>
        </p>

      </div>
    </div>
  );
}
