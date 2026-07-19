import { useState, useEffect } from "react";

const DEFAULT_ITEMS = [
  "10,000+ Families Supported",
  "25 Years of Service",
  "300+ Annual Volunteers",
  "5 Active Programs",
  "80G Certified — Donor Tax Benefit",
  "12A Registered — Govt. of India",
  "NGO Darpan — NITI Aayog Listed",
  "CSR 1 Registered",
  "Medical Aid · Skills · Legal Aid · Mental Health · Community",
  "Justice · Mercy · Compassion · Responsibility · Accountability",
  "Sahara Community Center — Our Operational Hub",
  "Social Architecture → Permanent Change",
  "Healthcare Access for the Underserved",
  "Building Futures, One Family at a Time",
];

export default function ImpactTicker() {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.ticker?.items) && d.ticker.items.length > 0) {
          setItems(d.ticker.items);
        }
      })
      .catch(() => {});
  }, []);

  const all = [...items, ...items];

  return (
    <div className="bg-foreground text-background py-3.5 overflow-hidden relative">
      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-track { animation: ticker 60s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="ticker-track flex items-center gap-0 w-max">
        {all.map((item, i) => (
          <span key={i} className="flex items-center gap-0 text-sm font-medium whitespace-nowrap">
            <span className="px-6 opacity-90">{item}</span>
            <span className="text-primary font-bold opacity-60 text-lg">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
