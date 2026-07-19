// Fix: frontend/src/pages/coloring.tsx calls POST /api/coloring/generate,
// but no matching backend route/controller existed at all (generation always failed).
//
// There is no AI image-generation API key configured anywhere in this project's
// .env (no OpenAI/Gemini/Stability key), so rather than add a new paid external
// dependency the site owner would have to sign up for and wire up, this generates
// simple black-outline "colouring book" SVG art procedurally on the server,
// picked by keyword from the child's prompt. It works out of the box, for free,
// with no extra configuration — and can be swapped for a real image-gen API later
// by replacing the body of `generateSvg()` below.

const W = 520, H = 540;
const STROKE = '#111';

function num(n) { return Number(n.toFixed(1)); }

// ── small drawing helpers (mirrors the style of the built-in sheets in coloring.tsx) ──
function circle(cx, cy, r, sw = 3) {
  return `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(r)}" fill="none" stroke="${STROKE}" stroke-width="${sw}"/>`;
}
function path(d, sw = 3) {
  return `<path d="${d}" fill="none" stroke="${STROKE}" stroke-width="${sw}"/>`;
}
function line(x1, y1, x2, y2, sw = 3) {
  return `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}" stroke="${STROKE}" stroke-width="${sw}"/>`;
}
function polygonPoints(cx, cy, r, points, rotationDeg = -90) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = ((rotationDeg + (i * 360) / points) * Math.PI) / 180;
    pts.push(`${num(cx + r * Math.cos(a))},${num(cy + r * Math.sin(a))}`);
  }
  return pts.join(' ');
}

function ground(y = 470) {
  return path(`M20,${y} Q${W / 2},${y - 20} ${W - 20},${y}`, 3);
}

// ── themed templates ────────────────────────────────────────────────────────
function starArt() {
  let s = '';
  const cx = W / 2, cy = 240;
  // 5-point star outline
  const outerR = 130, innerR = 55;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = ((-90 + i * 36) * Math.PI) / 180;
    pts.push(`${num(cx + r * Math.cos(a))},${num(cy + r * Math.sin(a))}`);
  }
  s += path(`M${pts.join(' L')} Z`, 4);
  // face
  s += circle(cx - 30, cy - 10, 10, 3);
  s += circle(cx + 30, cy - 10, 10, 3);
  s += path(`M${cx - 35},${cy + 30} Q${cx},${cy + 55} ${cx + 35},${cy + 30}`, 3);
  // small twinkles
  s += circle(90, 120, 14, 2.5); s += path(`M90,100 L90,140 M70,120 L110,120`, 2);
  s += circle(430, 400, 10, 2.5); s += path(`M430,388 L430,412 M418,400 L442,400`, 2);
  s += ground();
  return s;
}

function heartArt() {
  let s = '';
  const cx = W / 2, cy = 250;
  s += path(`M${cx},${cy + 150} C${cx - 200},${cy + 20} ${cx - 150},${cy - 170} ${cx},${cy - 60} C${cx + 150},${cy - 170} ${cx + 200},${cy + 20} ${cx},${cy + 150} Z`, 4);
  // little hearts around
  [[100, 90, 22], [420, 110, 18], [90, 420, 16], [430, 400, 20]].forEach(([x, y, r]) => {
    s += path(`M${x},${y + r * 0.6} C${x - r},${y - r * 0.4} ${x - r * 0.5},${y - r} ${x},${y - r * 0.2} C${x + r * 0.5},${y - r} ${x + r},${y - r * 0.4} ${x},${y + r * 0.6} Z`, 2.5);
  });
  return s;
}

function flowerArt() {
  let s = '';
  const cx = W / 2, cy = 250, petals = 7, petalR = 90;
  for (let i = 0; i < petals; i++) {
    const a = (i * 360) / petals;
    const rad = (a * Math.PI) / 180;
    const px = cx + Math.cos(rad) * 55, py = cy + Math.sin(rad) * 55;
    s += `<ellipse cx="${num(px)}" cy="${num(py)}" rx="${petalR / 2}" ry="${petalR / 3.2}" transform="rotate(${num(a)} ${num(px)} ${num(py)})" fill="none" stroke="${STROKE}" stroke-width="3"/>`;
  }
  s += circle(cx, cy, 42, 4);
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 * Math.PI) / 180;
    s += circle(cx + 22 * Math.cos(a), cy + 22 * Math.sin(a), 3, 1.5);
  }
  // stem + leaves
  s += path(`M${cx},${cy + 90} L${cx},430`, 4);
  s += path(`M${cx},330 C${cx - 60},320 ${cx - 70},370 ${cx - 10},380`, 3);
  s += path(`M${cx},380 C${cx + 60},370 ${cx + 70},420 ${cx + 10},430`, 3);
  s += ground(470);
  return s;
}

function sunArt() {
  let s = '';
  const cx = W / 2, cy = 210, r = 80;
  s += circle(cx, cy, r, 4);
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    s += line(cx + (r + 15) * Math.cos(a), cy + (r + 15) * Math.sin(a), cx + (r + 45) * Math.cos(a), cy + (r + 45) * Math.sin(a), 4);
  }
  s += circle(cx - 25, cy - 10, 8, 3); s += circle(cx + 25, cy - 10, 8, 3);
  s += path(`M${cx - 30},${cy + 25} Q${cx},${cy + 45} ${cx + 30},${cy + 25}`, 3);
  // clouds
  s += path('M60,420 a28,28 0 1,1 40,-15 a24,24 0 1,1 34,20 a22,22 0 1,1 -8,30 h-90 a24,24 0 0,1 24,-35Z', 3);
  s += ground(475);
  return s;
}

function rainbowArt() {
  let s = '';
  const cx = W / 2, cy = 420;
  for (let i = 0; i < 5; i++) s += path(`M${cx - 220},${cy} A${220 - i * 40},${220 - i * 40} 0 0 1 ${cx + 220},${cy}`, 3);
  s += path('M40,420 a30,30 0 1,1 45,-18 a26,26 0 1,1 36,22 h-95 a26,26 0 0,1 14,-4Z', 2.5);
  s += path('M480,300 a22,22 0 1,1 32,-13 a19,19 0 1,1 26,16 h-70 a19,19 0 0,1 12,-3Z', 2.5);
  return s;
}

function houseArt() {
  let s = '';
  s += path('M100,300 L260,160 L420,300 Z', 4);
  s += path('M130,300 L130,440 L390,440 L390,300', 4);
  s += path('M230,440 L230,340 L300,340 L300,440', 3);
  s += `<rect x="160" y="330" width="45" height="45" fill="none" stroke="${STROKE}" stroke-width="3"/>` + line(182.5, 330, 182.5, 375, 2) + line(160, 352.5, 205, 352.5, 2);
  s += `<rect x="325" y="330" width="45" height="45" fill="none" stroke="${STROKE}" stroke-width="3"/>` + line(347.5, 330, 347.5, 375, 2) + line(325, 352.5, 370, 352.5, 2);
  s += path('M330,180 L330,130 L360,130 L360,205', 3);
  s += circle(260, 240, 30, 3);
  s += ground(475);
  return s;
}

function treeArt() {
  let s = '';
  const cx = W / 2;
  s += path(`M${cx - 22},480 L${cx - 14},280 L${cx + 14},280 L${cx + 22},480 Z`, 4);
  s += circle(cx, 200, 100, 4);
  s += circle(cx - 90, 240, 65, 3);
  s += circle(cx + 90, 240, 65, 3);
  for (let i = 0; i < 6; i++) s += circle(cx - 60 + i * 24, 190 + (i % 2) * 20, 8, 1.5);
  s += ground(490);
  return s;
}

function fishArt() {
  let s = '';
  const cx = 240, cy = 260;
  s += path(`M${cx - 140},${cy} C${cx - 80},${cy - 90} ${cx + 60},${cy - 90} ${cx + 140},${cy} C${cx + 60},${cy + 90} ${cx - 80},${cy + 90} ${cx - 140},${cy} Z`, 4);
  s += path(`M${cx + 130},${cy} L${cx + 200},${cy - 50} L${cx + 200},${cy + 50} Z`, 3);
  s += circle(cx - 90, cy - 8, 9, 3);
  s += path(`M${cx - 20},${cy - 70} Q${cx},${cy - 40} ${cx + 20},${cy - 70}`, 2.5);
  s += path(`M${cx - 20},${cy + 70} Q${cx},${cy + 40} ${cx + 20},${cy + 70}`, 2.5);
  // bubbles + waves
  s += circle(380, 120, 10, 2); s += circle(410, 90, 6, 2); s += circle(360, 80, 5, 2);
  for (let i = 0; i < 3; i++) s += path(`M20,${470 + i * 15} Q${W / 4},${455 + i * 15} ${W / 2},${470 + i * 15} T${W - 20},${470 + i * 15}`, 2);
  return s;
}

function butterflyArt() {
  let s = '';
  const cx = W / 2, cy = 260;
  s += line(cx, cy - 90, cx, cy + 100, 4);
  [-1, 1].forEach((side) => {
    const x = cx + side * 6;
    s += `<ellipse cx="${num(x + side * 75)}" cy="${num(cy - 55)}" rx="80" ry="55" fill="none" stroke="${STROKE}" stroke-width="3"/>`;
    s += `<ellipse cx="${num(x + side * 65)}" cy="${num(cy + 55)}" rx="60" ry="70" fill="none" stroke="${STROKE}" stroke-width="3"/>`;
    s += circle(x + side * 75, cy - 55, 25, 2);
    s += circle(x + side * 65, cy + 55, 20, 2);
  });
  s += circle(cx, cy - 100, 12, 3);
  s += path(`M${cx - 6},${cy - 108} Q${cx - 30},${cy - 140} ${cx - 40},${cy - 130}`, 2);
  s += path(`M${cx + 6},${cy - 108} Q${cx + 30},${cy - 140} ${cx + 40},${cy - 130}`, 2);
  return s;
}

function catArt() {
  let s = '';
  const cx = W / 2, cy = 280;
  s += circle(cx, cy, 110, 4);
  s += path(`M${cx - 90},${cy - 80} L${cx - 60},${cy - 150} L${cx - 20},${cy - 90} Z`, 3);
  s += path(`M${cx + 90},${cy - 80} L${cx + 60},${cy - 150} L${cx + 20},${cy - 90} Z`, 3);
  s += circle(cx - 35, cy - 10, 12, 3); s += circle(cx + 35, cy - 10, 12, 3);
  s += path(`M${cx - 8},${cy + 20} L${cx + 8},${cy + 20} L${cx},${cy + 32} Z`, 2.5);
  s += path(`M${cx},${cy + 32} Q${cx},${cy + 50} ${cx - 20},${cy + 52}`, 2);
  s += path(`M${cx},${cy + 32} Q${cx},${cy + 50} ${cx + 20},${cy + 52}`, 2);
  [-1, 1].forEach((side) => {
    for (let i = 0; i < 3; i++) s += line(cx + side * 20, cy + 15 + i * 12, cx + side * 90, cy + 5 + i * 10, 2);
  });
  s += path(`M${cx + 90},${cy + 90} Q${cx + 170},${cy + 90} ${cx + 160},${cy}`, 3);
  return s;
}

function dogArt() {
  let s = '';
  const cx = W / 2, cy = 280;
  s += circle(cx, cy, 105, 4);
  s += `<ellipse cx="${cx - 95}" cy="${cy - 40}" rx="35" ry="60" transform="rotate(-25 ${cx - 95} ${cy - 40})" fill="none" stroke="${STROKE}" stroke-width="3"/>`;
  s += `<ellipse cx="${cx + 95}" cy="${cy - 40}" rx="35" ry="60" transform="rotate(25 ${cx + 95} ${cy - 40})" fill="none" stroke="${STROKE}" stroke-width="3"/>`;
  s += circle(cx - 35, cy - 5, 10, 3); s += circle(cx + 35, cy - 5, 10, 3);
  s += `<ellipse cx="${cx}" cy="${cy + 45}" rx="22" ry="16" fill="none" stroke="${STROKE}" stroke-width="3"/>`;
  s += path(`M${cx},${cy + 30} L${cx},${cy + 45}`, 2.5);
  s += path(`M${cx},${cy + 61} Q${cx - 20},${cy + 80} ${cx - 35},${cy + 65}`, 2);
  s += path(`M${cx},${cy + 61} Q${cx + 20},${cy + 80} ${cx + 35},${cy + 65}`, 2);
  return s;
}

function rocketArt() {
  let s = '';
  const cx = W / 2;
  s += path(`M${cx - 45},350 Q${cx - 45},150 ${cx},110 Q${cx + 45},150 ${cx + 45},350 Z`, 4);
  s += circle(cx, 220, 22, 3);
  s += path(`M${cx - 45},300 L${cx - 100},380 L${cx - 45},370 Z`, 3);
  s += path(`M${cx + 45},300 L${cx + 100},380 L${cx + 45},370 Z`, 3);
  s += path(`M${cx - 20},350 L${cx - 30},420 L${cx},400 L${cx + 30},420 L${cx + 20},350`, 3);
  // stars
  [[100, 100], [420, 140], [90, 400], [440, 420]].forEach(([x, y]) => {
    s += path(`M${x},${y - 12} L${x},${y + 12} M${x - 12},${y} L${x + 12},${y}`, 2);
  });
  return s;
}

function elephantArt() {
  let s = '';
  const cx = W / 2, cy = 260;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="130" ry="100" fill="none" stroke="${STROKE}" stroke-width="4"/>`;
  s += circle(cx - 60, cy - 60, 55, 3);
  s += circle(cx - 60, cy - 60, 30, 2);
  s += path(`M${cx + 90},${cy + 20} Q${cx + 150},${cy + 60} ${cx + 120},${cy + 130} Q${cx + 100},${cy + 150} ${cx + 80},${cy + 120}`, 3);
  [cx - 60, cx - 10].forEach((x) => s += `<ellipse cx="${x}" cy="${cy + 110}" rx="18" ry="10" fill="none" stroke="${STROKE}" stroke-width="2.5"/>`);
  [cx + 40, cx + 90].forEach((x) => s += `<ellipse cx="${x}" cy="${cy + 100}" rx="18" ry="10" fill="none" stroke="${STROKE}" stroke-width="2.5"/>`);
  s += circle(cx - 90, cy - 30, 8, 2.5);
  return s;
}

function birdArt() {
  let s = '';
  const cx = W / 2, cy = 250;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="90" ry="70" fill="none" stroke="${STROKE}" stroke-width="4"/>`;
  s += circle(cx + 80, cy - 55, 45, 3);
  s += path(`M${cx + 120},${cy - 55} L${cx + 155},${cy - 45} L${cx + 120},${cy - 35} Z`, 2.5);
  s += circle(cx + 95, cy - 65, 6, 2);
  s += path(`M${cx - 20},${cy - 40} Q${cx - 60},${cy - 90} ${cx - 100},${cy - 60}`, 3);
  s += path(`M${cx - 90},${cy + 50} L${cx - 130},${cy + 90} M${cx - 70},${cy + 60} L${cx - 90},${cy + 110} M${cx - 50},${cy + 65} L${cx - 50},${cy + 115}`, 2);
  return s;
}

function balloonArt() {
  let s = '';
  const xs = [180, 260, 340];
  xs.forEach((x, i) => {
    const cy = 150 + (i % 2 === 1 ? 20 : 0);
    s += `<ellipse cx="${x}" cy="${cy}" rx="55" ry="70" fill="none" stroke="${STROKE}" stroke-width="3"/>`;
    s += path(`M${x},${cy + 70} L${x},${cy + 90} L${x - 6},${cy + 100} L${x + 6},${cy + 110} L${x},${cy + 120} L${x},${cy + 380}`, 2.5);
  });
  return s;
}

const THEME_TEMPLATES = [
  { keys: ['star'], fn: starArt },
  { keys: ['heart', 'love'], fn: heartArt },
  { keys: ['flower', 'rose', 'garden', 'blossom'], fn: flowerArt },
  { keys: ['sun', 'sunshine', 'summer'], fn: sunArt },
  { keys: ['rainbow'], fn: rainbowArt },
  { keys: ['house', 'home'], fn: houseArt },
  { keys: ['tree', 'forest', 'jungle'], fn: treeArt },
  { keys: ['fish', 'ocean', 'sea', 'underwater', 'aquarium'], fn: fishArt },
  { keys: ['butterfly', 'moth'], fn: butterflyArt },
  { keys: ['cat', 'kitten', 'kitty'], fn: catArt },
  { keys: ['dog', 'puppy'], fn: dogArt },
  { keys: ['rocket', 'space', 'astronaut', 'planet'], fn: rocketArt },
  { keys: ['elephant'], fn: elephantArt },
  { keys: ['bird', 'parrot', 'peacock', 'owl'], fn: birdArt },
  { keys: ['balloon', 'birthday', 'party', 'celebration'], fn: balloonArt },
];

function pickTemplate(prompt) {
  const p = prompt.toLowerCase();
  for (const t of THEME_TEMPLATES) {
    if (t.keys.some((k) => p.includes(k))) return t.fn;
  }
  return null;
}

// Deterministic fallback "scene" for prompts that don't match a known keyword —
// still looks like a proper colouring page instead of a blank/error state.
function sceneArt(prompt) {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) hash = (hash * 31 + prompt.charCodeAt(i)) >>> 0;
  const cx = W / 2;
  let s = '';
  s += circle(cx - 150 + (hash % 40), 110, 55, 3); // sun
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    s += line((cx - 150) + 70 * Math.cos(a), 110 + 70 * Math.sin(a), (cx - 150) + 95 * Math.cos(a), 110 + 95 * Math.sin(a), 3);
  }
  s += path(`M${cx + 60},130 a28,28 0 1,1 40,-15 a24,24 0 1,1 34,20 a22,22 0 1,1 -8,30 h-90 a24,24 0 0,1 24,-35Z`, 3);
  s += flowerArtSmall(cx - 60, 400, hash);
  s += flowerArtSmall(cx + 90, 430, hash + 7);
  s += ground(470);
  // decorative polygon so every "unknown" prompt still gets a unique-looking centrepiece
  const sides = 5 + (hash % 3);
  const pts = polygonPoints(cx, 280, 70, sides).split(' ');
  s += path(`M${pts.join(' L')} Z`, 3);
  return s;
}
function flowerArtSmall(cx, cy, seed) {
  let s = '';
  const petals = 5 + (seed % 3);
  for (let i = 0; i < petals; i++) {
    const a = (i * 360) / petals;
    const rad = (a * Math.PI) / 180;
    const px = cx + Math.cos(rad) * 22, py = cy + Math.sin(rad) * 22;
    s += `<ellipse cx="${num(px)}" cy="${num(py)}" rx="18" ry="10" transform="rotate(${num(a)} ${num(px)} ${num(py)})" fill="none" stroke="${STROKE}" stroke-width="2"/>`;
  }
  s += circle(cx, cy, 14, 2);
  s += line(cx, cy + 20, cx, cy + 70, 2.5);
  return s;
}

export function generateSvg(prompt) {
  const template = pickTemplate(prompt);
  return template ? template() : sceneArt(prompt);
}

export async function generate(req, res) {
  const prompt = String(req.body?.prompt || '').trim().slice(0, 120);
  if (!prompt) return res.status(400).json({ error: 'A prompt is required' });
  const svg = generateSvg(prompt);
  res.json({ svg });
}
