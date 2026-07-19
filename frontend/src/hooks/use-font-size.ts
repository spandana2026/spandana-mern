import { useState, useEffect } from "react";

export type FontSizeLevel = 0 | 1 | 2 | 3;

const SIZES: Record<FontSizeLevel, { pct: string }> = {
  0: { pct: "100%"  },
  1: { pct: "112.5%"},
  2: { pct: "120%"  },
  3: { pct: "132%"  },
};

const SIZE_KEY   = "spandana-font-size";
const PAPER_KEY  = "spandana-paper-white";

function applySize(level: FontSizeLevel) {
  document.documentElement.style.fontSize = SIZES[level].pct;
  if (level === 3) {
    document.documentElement.classList.add("elderly-mode");
  } else {
    document.documentElement.classList.remove("elderly-mode");
  }
}

function applyPaper(on: boolean) {
  if (on) {
    document.documentElement.classList.add("paper-white-mobile");
  } else {
    document.documentElement.classList.remove("paper-white-mobile");
  }
}

export function useFontSize() {
  const [level, setLevel] = useState<FontSizeLevel>(() => {
    try {
      const n = Number(localStorage.getItem(SIZE_KEY));
      return (Number.isInteger(n) && n >= 0 && n <= 3) ? (n as FontSizeLevel) : 0;
    } catch { return 0; }
  });

  const [paperWhite, setPaperWhite] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem(PAPER_KEY);
      return val === null ? true : val !== "0";
    }
    catch { return true; }
  });

  useEffect(() => {
    applySize(level);
    localStorage.setItem(SIZE_KEY, String(level));
  }, [level]);

  useEffect(() => {
    applyPaper(paperWhite);
    localStorage.setItem(PAPER_KEY, paperWhite ? "1" : "0");
  }, [paperWhite]);

  const setTo = (l: FontSizeLevel) => setLevel(l);
  const togglePaper = () => setPaperWhite((p) => !p);

  return { level, paperWhite, setTo, togglePaper };
}
