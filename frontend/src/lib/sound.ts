let ctx: AudioContext | null = null;

const STORAGE_KEY = "jz-sound";

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {}
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.25,
  delay = 0,
) {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.connect(g);
    g.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    g.gain.setValueAtTime(0, c.currentTime + delay);
    g.gain.linearRampToValueAtTime(gain, c.currentTime + delay + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration + 0.05);
  } catch {}
}

export type SoundType =
  | "tick"
  | "pop"
  | "match"
  | "mismatch"
  | "swap"
  | "combo"
  | "dice"
  | "move"
  | "capture"
  | "correct"
  | "wrong"
  | "win";

export function playSound(type: SoundType): void {
  if (!isSoundOn()) return;
  switch (type) {
    case "tick":
      tone(700, 0.06, "square", 0.12);
      break;
    case "pop":
      tone(520, 0.07, "sine", 0.28);
      tone(880, 0.1, "sine", 0.18, 0.05);
      break;
    case "match":
      tone(523, 0.09, "sine", 0.22);
      tone(659, 0.11, "sine", 0.2, 0.08);
      tone(784, 0.16, "sine", 0.18, 0.17);
      break;
    case "mismatch":
      tone(220, 0.14, "sawtooth", 0.1);
      break;
    case "swap":
      tone(440, 0.05, "sine", 0.14);
      tone(660, 0.07, "sine", 0.12, 0.06);
      break;
    case "combo":
      [523, 659, 784, 1047].forEach((f, i) =>
        tone(f, 0.15, "sine", 0.2, i * 0.1),
      );
      break;
    case "dice":
      for (let i = 0; i < 6; i++) {
        tone(180 + Math.random() * 220, 0.055, "square", 0.09, i * 0.065);
      }
      break;
    case "move":
      tone(440, 0.07, "sine", 0.18);
      tone(560, 0.09, "sine", 0.14, 0.06);
      break;
    case "capture":
      tone(320, 0.07, "sawtooth", 0.18);
      tone(200, 0.14, "sawtooth", 0.14, 0.07);
      break;
    case "correct":
      tone(659, 0.09, "sine", 0.22);
      tone(880, 0.14, "sine", 0.2, 0.09);
      break;
    case "wrong":
      tone(260, 0.08, "square", 0.16);
      tone(200, 0.14, "square", 0.13, 0.08);
      break;
    case "win":
      [523, 659, 784, 1047, 1319].forEach((f, i) =>
        tone(f, 0.22, "sine", 0.2, i * 0.11),
      );
      break;
  }
}
