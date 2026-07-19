import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Sparkles, ChevronLeft, Star, Brain,
  Palette, TreePine, Flame, Clock, Users, Wifi, ExternalLink,
  Volume2, VolumeX, Info, Globe, ChevronDown, Play, Heart, Gift,
} from "lucide-react";
import { playSound, isSoundOn, setSoundOn } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import TicTacToe from "@/components/games/tic-tac-toe";
import MemoryMatch from "@/components/games/memory-match";
import DartsGame from "@/components/games/darts";
import PayToPlay from "@/components/games/pay-to-play";
import MultiplayerTTT from "@/components/games/multiplayer-ttt";
import LudoGame from "@/components/games/ludo-game";
import MultiplayerLudo from "@/components/games/multiplayer-ludo";
import HowToPlay from "@/components/games/how-to-play";
import Match3Game from "@/components/games/match3";
import TambolaGame from "@/components/games/tambola";
import SnakesLadders from "@/components/games/snakes-ladders";
import PlatformerGame from "@/components/games/platformer";

type GameId = "ttt" | "ttt-multi" | "memory" | "darts" | "tambola" | "snakes" | "ludo" | "ludo-multi" | "match3" | "platformer";
type Screen  = "lobby" | "pay" | "play" | "ad" | "ext-play";
interface FunZonePageConfig {
  heroButtons?: { showBtnEmoji?: boolean; payLabel?: string; payDesc?: string; freeLabel?: string; freeDesc?: string; defaultMode?: string; btnLayout?: string; btnSize?: string; btnShape?: string; btnAlign?: string; freeColor?: string; payColor?: string; showFree?: boolean; showPay?: boolean; };
  heroVisibility?: Record<string, boolean>;
  badge?: string; headingDesktop?: string; subtitle?: string;
  headingMobile1?: string; headingMobile2?: string; subtitleMobile?: string;
  pill1?: string; pill2?: string; pill3?: string;
  comingSoonTitle?: string; comingSoonDesc?: string;
  comingSoonGames?: Array<Record<string, unknown>>; comingSoonHeading?: string;
  lobbyHeading?: string; moreActivitiesHeading?: string;
  enjoyingText?: string; enjoyingSubtext?: string;
}

interface GsAdRaw {
  enabled?: boolean; headline?: string; sponsor?: string; body?: string;
  ctaLabel?: string; ctaUrl?: string; imageUrl?: string; videoUrl?: string; icon?: string;
}

interface FzCurrency { code: string; symbol: string; flag: string; fallback: number; }
const FZ_CURRENCIES: FzCurrency[] = [
  { code: "INR", symbol: "₹",   flag: "🇮🇳", fallback: 1 },
  { code: "USD", symbol: "$",   flag: "🇺🇸", fallback: 0.012 },
  { code: "AUD", symbol: "A$",  flag: "🇦🇺", fallback: 0.018 },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪", fallback: 0.044 },
  { code: "GBP", symbol: "£",   flag: "🇬🇧", fallback: 0.0095 },
  { code: "EUR", symbol: "€",   flag: "🇪🇺", fallback: 0.011 },
  { code: "CAD", symbol: "C$",  flag: "🇨🇦", fallback: 0.016 },
  { code: "SGD", symbol: "S$",  flag: "🇸🇬", fallback: 0.016 },
];

const AD_CARDS = [
  { icon: "🌱", title: "Plant a Tree Today",          desc: "For just ₹50, Spandana plants a native tree in your name. 1,200+ trees and counting.",     cta: "Plant Now →",    href: "/donate" },
  { icon: "📚", title: "Sponsor a Child's Education", desc: "₹500/month funds books, uniforms & tuition for one child who needs a chance.",             cta: "Sponsor Now →", href: "/donate" },
  { icon: "🏥", title: "Fund a Medical Camp",         desc: "Help Spandana run free health check-ups in underserved villages across Andhra Pradesh.",   cta: "Donate →",       href: "/donate" },
  { icon: "❤️", title: "Support a Family This Month", desc: "₹2,000 sustains a family: healthcare, food support, and skill training — for one month.", cta: "Give Now →",     href: "/donate" },
];
type PricingType = "free" | "solo" | "online2p" | "local2p" | "online-variable" | "local-variable";

interface GamePrices { online2p: number; online4p: number; local2p: number; local4p: number; solo: number; }
const DEFAULT_PRICES: GamePrices = { online2p: 30, online4p: 50, local2p: 20, local4p: 40, solo: 30 };

function computePrice(pricingType: PricingType, players: number, prices: GamePrices): number | null {
  if (pricingType === "free") return null;
  if (pricingType === "solo") return prices.solo;
  if (pricingType === "online2p") return prices.online2p;
  if (pricingType === "local2p") return prices.local2p;
  if (pricingType === "online-variable") return players === 4 ? prices.online4p : prices.online2p;
  if (pricingType === "local-variable") return players === 4 ? prices.local4p : prices.local2p;
  return null;
}

function displayPrice(pricingType: PricingType, prices: GamePrices): string {
  if (pricingType === "free") return "Free";
  if (pricingType === "solo") return `₹${prices.solo}`;
  if (pricingType === "online2p") return `₹${prices.online2p}`;
  if (pricingType === "local2p") return `₹${prices.local2p}`;
  if (pricingType === "online-variable") return `₹${prices.online2p}–₹${prices.online4p}`;
  if (pricingType === "local-variable") return `₹${prices.local2p}–₹${prices.local4p}`;
  return "Free";
}

interface GameCard {
  id:          GameId;
  emoji:       string;
  title:       string;
  tagline:     string;
  ages:        string;
  players:     string;
  pricingType: PricingType;
  /* desktop styles */
  color:       string;
  border:      string;
  badge:       string;
  badgeColor:  string;
  /* mobile-only vivid styles */
  mobileGrad:  string;
  mobileGlow:  string;
  mobileBadge: string;
  hot?:        boolean;
  multiplayer?: boolean;
  audience?:   "india" | "intl" | "all";
}

const GAMES: GameCard[] = [
  {
    id: "ludo-multi", emoji: "🎲", title: "Ludo — Online",
    tagline: "Invite a friend via link. Full rules: captures, safe cells, home stretch.",
    ages: "All ages", players: "2–4 online", pricingType: "online-variable",
    color: "from-amber-50 to-orange-50", border: "border-amber-200",
    badge: "Multiplayer", badgeColor: "bg-amber-100 text-amber-700",
    mobileGrad: "linear-gradient(135deg,#f7971e 0%,#f54141 100%)",
    mobileGlow: "0 10px 28px rgba(247,90,30,0.55)",
    mobileBadge: "bg-white/20 text-white",
    hot: true, multiplayer: true, audience: "india",
  },
  {
    id: "ludo", emoji: "🎲", title: "Ludo — Local",
    tagline: "Pass the phone. 2–4 players. Roll, capture & race your pieces home!",
    ages: "All ages", players: "2–4 local", pricingType: "local-variable",
    color: "from-yellow-50 to-amber-50", border: "border-yellow-200",
    badge: "Pass & Play", badgeColor: "bg-yellow-100 text-yellow-700",
    mobileGrad: "linear-gradient(135deg,#fcb045 0%,#f77a0a 100%)",
    mobileGlow: "0 10px 28px rgba(247,150,30,0.5)",
    mobileBadge: "bg-white/20 text-white", audience: "india",
  },
  {
    id: "ttt-multi", emoji: "⭕", title: "Tic-Tac-Toe — Online",
    tagline: "Invite a friend anywhere in the world. Share a link, play live.",
    ages: "All ages", players: "2 online", pricingType: "online2p",
    color: "from-indigo-50 to-blue-50", border: "border-indigo-200",
    badge: "Multiplayer", badgeColor: "bg-indigo-100 text-indigo-700",
    mobileGrad: "linear-gradient(135deg,#4776e6 0%,#8e54e9 100%)",
    mobileGlow: "0 10px 28px rgba(100,90,240,0.5)",
    mobileBadge: "bg-white/20 text-white",
    multiplayer: true, audience: "intl",
  },
  {
    id: "ttt", emoji: "⭕", title: "Tic-Tac-Toe — Local",
    tagline: "Pass the phone. Play X vs O with a friend or beat the AI.",
    ages: "All ages", players: "1–2 local", pricingType: "local2p",
    color: "from-blue-50 to-slate-50", border: "border-blue-200",
    badge: "2P & AI", badgeColor: "bg-blue-100 text-blue-700",
    mobileGrad: "linear-gradient(135deg,#2193b0 0%,#6dd5ed 100%)",
    mobileGlow: "0 10px 28px rgba(33,147,176,0.5)",
    mobileBadge: "bg-white/25 text-white", audience: "intl",
  },
  {
    id: "memory", emoji: "🃏", title: "Memory Match",
    tagline: "Flip and match all pairs. Beat your best time!",
    ages: "All ages", players: "Solo", pricingType: "solo",
    color: "from-purple-50 to-pink-50", border: "border-purple-200",
    badge: "Brain Teaser", badgeColor: "bg-purple-100 text-purple-700",
    mobileGrad: "linear-gradient(135deg,#f953c6 0%,#b91d73 100%)",
    mobileGlow: "0 10px 28px rgba(185,29,115,0.5)",
    mobileBadge: "bg-white/20 text-white", audience: "intl",
  },
  {
    id: "darts", emoji: "🎯", title: "Darts",
    tagline: "Time your throw — aim for the bullseye! 6 throws.",
    ages: "All ages", players: "Solo", pricingType: "solo",
    color: "from-rose-50 to-orange-50", border: "border-rose-200",
    badge: "Precision", badgeColor: "bg-rose-100 text-rose-700",
    mobileGrad: "linear-gradient(135deg,#ff416c 0%,#ff4b2b 100%)",
    mobileGlow: "0 10px 28px rgba(255,65,108,0.5)",
    mobileBadge: "bg-white/20 text-white", audience: "intl",
  },
  {
    id: "tambola", emoji: "🎱", title: "Tambola / Housie",
    tagline: "Classic Indian number game — mark your ticket, shout Full House!",
    ages: "All ages", players: "Solo / Group", pricingType: "solo",
    color: "from-orange-50 to-rose-50", border: "border-orange-200",
    badge: "Party", badgeColor: "bg-orange-100 text-orange-700",
    mobileGrad: "linear-gradient(135deg,#f7971e 0%,#f4433c 100%)",
    mobileGlow: "0 10px 28px rgba(247,90,30,0.55)",
    mobileBadge: "bg-black/30 text-white",
    hot: true, audience: "india",
  },
  {
    id: "snakes", emoji: "🐍", title: "Snakes & Ladders",
    tagline: "Roll the dice, climb ladders, dodge snakes — classic family fun!",
    ages: "All ages", players: "2 local", pricingType: "local2p",
    color: "from-green-50 to-teal-50", border: "border-green-200",
    badge: "Pass & Play", badgeColor: "bg-green-100 text-green-700",
    mobileGrad: "linear-gradient(135deg,#11998e 0%,#38ef7d 100%)",
    mobileGlow: "0 10px 28px rgba(17,153,142,0.5)",
    mobileBadge: "bg-black/30 text-white", audience: "india",
  },
  {
    id: "match3", emoji: "🍬", title: "Match-3 Crush",
    tagline: "Swap candies, match 3+, chain combos. Beat your high score!",
    ages: "All ages", players: "Solo", pricingType: "solo",
    color: "from-pink-50 to-purple-50", border: "border-pink-200",
    badge: "Addictive", badgeColor: "bg-pink-100 text-pink-700",
    mobileGrad: "linear-gradient(135deg,#f953c6 0%,#b91d73 100%)",
    mobileGlow: "0 10px 28px rgba(185,29,115,0.55)",
    mobileBadge: "bg-white/20 text-white",
    hot: true, audience: "intl",
  },
  {
    id: "platformer", emoji: "🕹️", title: "Platform Hero",
    tagline: "Run, jump & collect stars — stomp the monsters to win!",
    ages: "Kids 4+", players: "Solo", pricingType: "solo",
    color: "from-sky-50 to-blue-50", border: "border-sky-200",
    badge: "Kids Fav", badgeColor: "bg-sky-100 text-sky-700",
    mobileGrad: "linear-gradient(135deg,#43cea2 0%,#185a9d 100%)",
    mobileGlow: "0 10px 28px rgba(24,90,157,0.55)",
    mobileBadge: "bg-white/20 text-white",
    hot: true, audience: "intl",
  },
];

const COMING_SOON = [
  { emoji: "♟️", title: "Chess",             why: "Strategy 1v1 — challenge a friend online",         tag: "Strategic",        tagColor: "bg-slate-100 text-slate-700",   mobileBg: "#1a1a2e" },
  { emoji: "🔢", title: "2048",              why: "Number puzzle — simple but impossible to stop",     tag: "Obsession",        tagColor: "bg-orange-100 text-orange-700", mobileBg: "#2d1a00" },
  { emoji: "🔤", title: "Word Scramble",     why: "Unscramble words — great for all ages",            tag: "Family",           tagColor: "bg-blue-100 text-blue-700",     mobileBg: "#0a1f3d" },
  { emoji: "🎵", title: "Antakshari",        why: "Classic Indian music game — groups love it",       tag: "Party Hit",        tagColor: "bg-rose-100 text-rose-700",     mobileBg: "#2d0a1a" },
  { emoji: "🃏", title: "Rummy",             why: "Classic card game — form sets and sequences",      tag: "Card Game",        tagColor: "bg-purple-100 text-purple-700", mobileBg: "#1a0d2e" },
  { emoji: "🎭", title: "Dumb Charades",     why: "Act it out — no words allowed! Team fun",          tag: "Team",             tagColor: "bg-yellow-100 text-yellow-700", mobileBg: "#2d2000" },
];


type AdContent = { icon?: string; title: string; desc?: string; cta: string; href: string; imageUrl?: string; videoUrl?: string; };

// ── Ad interstitial screen ────────────────────────────────────────
function AdScreen({ gameCard, adType, ad, onComplete, onBack, adSupportMsg }: {
  gameCard: GameCard;
  adType: "short" | "long";
  ad: AdContent;
  onComplete: () => void;
  onBack: () => void;
  adSupportMsg?: string;
}) {
  const totalTimer = adType === "short" ? 5 : 20;
  const [countdown, setCountdown] = useState(totalTimer);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); setCanContinue(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const progress = ((totalTimer - countdown) / totalTimer) * 100;

  return (
    <div className="max-w-sm mx-auto">
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ChevronLeft size={16} /> Back to games
      </button>

      <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10">
        {/* Top bar */}
        <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${adType === "short" ? "bg-violet-500/20 text-violet-300" : "bg-orange-500/20 text-orange-300"}`}>
              {adType === "short" ? "Short Ad" : "Long Ad"}
            </span>
            <span className="text-gray-500 text-[10px]">· Sponsored</span>
          </div>
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full transition-colors ${canContinue ? "bg-emerald-500 text-white" : "bg-white/10 text-white/60"}`}>
            {canContinue ? "Ready" : `${countdown}s`}
          </span>
        </div>

        {adType === "short" ? (
          <div className="bg-gradient-to-br from-orange-400 via-rose-500 to-pink-600 p-6 min-h-[280px] flex flex-col justify-between">
            <div>
              <div className="text-white/60 text-[10px] uppercase tracking-widest mb-2">Sponsor Message</div>
              <div className="text-white font-bold text-xl leading-tight mb-1">{ad.title}</div>
              <div className="text-white/80 text-sm">{ad.desc ?? ""}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 my-3 text-center shadow-lg overflow-hidden">
              {ad.imageUrl ? (
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-24 object-cover rounded-xl mb-3" />
              ) : (
                <div className="text-4xl mb-2">{ad.icon ?? "💡"}</div>
              )}
              <div className="text-gray-800 font-bold text-base">{ad.title}</div>
              {ad.desc && <div className="text-gray-500 text-xs mt-1">{ad.desc}</div>}
              {ad.href && (
                <a href={ad.href} target="_blank" rel="noopener noreferrer"
                  className="mt-2 text-rose-600 font-semibold text-sm block">
                  {ad.cta} →
                </a>
              )}
            </div>
            <div className="text-white/40 text-[10px] text-center">{adSupportMsg || "This ad supports free games on Spandana"}</div>
          </div>
        ) : (
          <div className="bg-black min-h-[280px] flex flex-col">
            <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
              {ad.videoUrl ? (
                <video
                  src={ad.videoUrl}
                  autoPlay muted playsInline
                  className="w-full max-h-44 rounded-xl object-cover mb-3 shadow-lg"
                  style={{ background: "#000" }}
                />
              ) : ad.imageUrl ? (
                <img src={ad.imageUrl} alt={ad.title} className="w-full max-h-44 rounded-xl object-cover mb-3 shadow-lg" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white text-3xl ml-1">▶</span>
                </div>
              )}
              <div className="text-white font-bold text-base text-center mb-1">{ad.title}</div>
              {ad.desc && <div className="text-gray-400 text-xs text-center mt-1">{ad.desc}</div>}
              {!ad.videoUrl && !ad.imageUrl && (
                <div className="mt-3 bg-white/5 rounded-xl px-4 py-2 text-white/50 text-xs text-center">
                  Sponsor message · {totalTimer}s
                </div>
              )}
            </div>
            {ad.href && (
              <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
                <div className="text-xl">{ad.icon ?? "🎯"}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-semibold truncate">{ad.title}</div>
                </div>
                <a href={ad.href} target="_blank" rel="noopener noreferrer"
                  className="ml-auto bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
                  {ad.cta} →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Progress + Continue */}
        <div className="bg-gray-900 px-4 py-3">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-violet-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }} />
          </div>
          <button
            disabled={!canContinue}
            onClick={canContinue ? onComplete : undefined}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${canContinue ? "bg-violet-600 text-white hover:bg-violet-500 shadow-lg" : "bg-white/5 text-white/20 cursor-not-allowed"}`}
          >
            {canContinue ? `Continue to ${gameCard.title} →` : `Wait ${countdown}s…`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Floating emoji decoration for hero (mobile only) ─────────────
interface FloatItem { emoji: string; cls: string; top: string; left?: string; right?: string; size: string; opacity: string; }
const FLOATERS: FloatItem[] = [
  { emoji: "🎲", cls: "fz-float-1", top: "10%",  left: "5%",  size: "text-4xl", opacity: "opacity-35" },
  { emoji: "🃏", cls: "fz-float-2", top: "18%",  right: "7%", size: "text-3xl", opacity: "opacity-30" },
  { emoji: "🎯", cls: "fz-float-3", top: "55%",  left: "4%",  size: "text-3xl", opacity: "opacity-25" },
  { emoji: "⭕", cls: "fz-float-4", top: "62%",  right: "5%", size: "text-4xl", opacity: "opacity-25" },
  { emoji: "🧠", cls: "fz-float-5", top: "38%",  left: "87%", size: "text-2xl", opacity: "opacity-20" },
  { emoji: "⭐", cls: "fz-float-1", top: "5%",   right: "20%",size: "text-3xl", opacity: "opacity-30" },
  { emoji: "🍬", cls: "fz-float-2", top: "75%",  left: "10%", size: "text-3xl", opacity: "opacity-20" },
  { emoji: "🎮", cls: "fz-float-3", top: "30%",  left: "2%",  size: "text-2xl", opacity: "opacity-20" },
];

// ── Main page ─────────────────────────────────────────────────────
export default function FunZonePage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sharedRoom     = params.get("room")?.toUpperCase() ?? undefined;
  const sharedLudoRoom = params.get("ludo")?.toUpperCase() ?? undefined;

  const [activeGame, setActiveGame]       = useState<GameId | null>(null);
  const [screen, setScreen]               = useState<Screen>("lobby");
  const [selectedPlayers, setSelectedPlayers] = useState<2 | 4>(2);
  const [prices, setPrices]               = useState<GamePrices>(DEFAULT_PRICES);
  const [phonepeUpiId, setPhonepeUpiId]   = useState<string>("");
  const [gameRazorpayLink, setGameRazorpayLink] = useState<string>("");
  const [fzPage, setFzPage]               = useState<FunZonePageConfig>({});
  const [gameOverrides, setGameOverrides] = useState<Record<string, { enabled?: boolean; isFree?: boolean; playMode?: string; title?: string; emoji?: string; tagline?: string; showTo?: string; priceIndia?: number | null; priceIntl?: number | null }>>({});
  const [externalGames, setExternalGames] = useState<Array<{ id: string; title: string; description: string; imageUrl: string; emoji: string; url: string; embedCode: string; category: string; isFree: boolean; price: number; published: boolean; sourceType: "url"|"embed"|"upload"|"library"; audience: "all"|"india"|"intl"; playMode: "free"|"ad"|"pay" }>>([]);
  const [pendingExtGame, setPendingExtGame] = useState<{ title: string; emoji: string; url: string; embedCode: string; sourceType: "url"|"embed"|"upload"|"library" } | null>(null);
  const [extPayGame, setExtPayGame]         = useState<{ title: string; emoji: string; price: number } | null>(null);
  const [soundOn, setSoundOnState]        = useState<boolean>(isSoundOn);
  const [gameUpiQrUrl, setGameUpiQrUrl]   = useState<string>("");
  const [trustTagline, setTrustTagline]   = useState<string>("");
  const [trustBody, setTrustBody]         = useState<string>("");
  const [refundPolicy, setRefundPolicy]   = useState<string>("");
  const [thankyouMsg, setThankyouMsg]     = useState<string>("");
  const [bannerEnabled, setBannerEnabled] = useState<boolean>(false);
  const [bannerHeading, setBannerHeading] = useState<string>("");
  const [bannerBody, setBannerBody]       = useState<string>("");

  // ── Currency converter ──────────────────────────────────────────
  const [fzCurrencyCode, setFzCurrencyCode] = useState<string>("INR");
  const [fzRates, setFzRates]               = useState<Record<string, number>>({});
  const [showCurrencyDrop, setShowCurrencyDrop] = useState(false);

  // ── Ad-unlock after 3 free plays ────────────────────────────────
  const [adPlayCount, setAdPlayCount]     = useState<number>(() =>
    parseInt(localStorage.getItem("fz_ad_count") || "0", 10));
  const [postAdScreen, setPostAdScreen]   = useState<"play" | "pay" | "ext-play">("play");
  const [adPending, setAdPending]         = useState<GameId | null>(null);
  const [sponsorAds, setSponsorAds]       = useState<AdContent[]>([]);
  const [adPattern, setAdPattern]         = useState<string[]>(["short", "short", "long"]);

  // ── Hero buttons + geo + region-split ads ───────────────────────
  const [heroButtons, setHeroButtons]     = useState<{showFree?:boolean;showPay?:boolean;defaultMode?:string;freeLabel?:string;payLabel?:string;freeDesc?:string;payDesc?:string;btnLayout?:string;btnSize?:string;btnShape?:string;btnAlign?:string;freeColor?:string;payColor?:string;showBtnEmoji?:boolean}>({});
  const [intlPaymentUrl, setIntlPaymentUrl]       = useState<string>("");
  const [intlPaymentMethod, setIntlPaymentMethod] = useState<string>("");
  const [intlPaymentNote, setIntlPaymentNote]     = useState<string>("");
  const [intlGateways, setIntlGateways]           = useState<Record<string, {method: string; url: string; note: string}>>({});
  const [userCountry, setUserCountry]     = useState<string>("");
  const [adsIndia, setAdsIndia]           = useState<AdContent[]>([]);
  const [adsIntl, setAdsIntl]             = useState<AdContent[]>([]);

  // ── Mode + ordering + verify + flash ────────────────────────────
  const [gameMode, setGameMode]           = useState<"free" | "pay">("free");
  const [gameOrder, setGameOrder]         = useState<string[]>([]);
  const [verifyCode, setVerifyCode]       = useState<string>("");
  const [verifyEnabled, setVerifyEnabled] = useState<boolean>(false);
  const [verifyInput, setVerifyInput]     = useState<string>("");
  const [showVerify, setShowVerify]       = useState<boolean>(false);
  const [verifyError, setVerifyError]     = useState<boolean>(false);
  const [verifyUnlocked, setVerifyUnlocked] = useState<boolean>(false);
  const [flashNotes, setFlashNotes]       = useState<Array<{text: string; emoji: string; enabled?: boolean}>>([]);
  const [currentFlash, setCurrentFlash]   = useState<{text: string; emoji: string} | null>(null);
  const [ctaText, setCtaText]             = useState<Record<string, string>>({});

  // ── Fetch exchange rates ─────────────────────────────────────────
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/INR")
      .then(r => r.json())
      .then((d) => { if (d?.rates) setFzRates(d.rates); })
      .catch(() => {});
  }, []);

  // ── Geo IP detection → auto currency ────────────────────────────
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then((d) => {
        const cc = (d?.country_code ?? "").toUpperCase();
        setUserCountry(cc);
        const COUNTRY_CURRENCY: Record<string, string> = {
          US: "USD", GB: "GBP", AU: "AUD", CA: "CAD", SG: "SGD",
          AE: "AED", NZ: "NZD", DE: "EUR", FR: "EUR", IT: "EUR",
          ES: "EUR", NL: "EUR", AT: "EUR", BE: "EUR", PT: "EUR",
          CH: "CHF", JP: "JPY", MY: "MYR", KW: "KWD", QA: "QAR",
          BH: "BHD", OM: "OMR", SA: "SAR", ZA: "ZAR", HK: "HKD",
          SE: "SEK", NO: "NOK", DK: "DKK", TH: "THB", PH: "PHP",
        };
        if (cc === "IN") setFzCurrencyCode("INR");
        else if (COUNTRY_CURRENCY[cc]) setFzCurrencyCode(COUNTRY_CURRENCY[cc]);
      })
      .catch(() => {});
  }, []);

  // ── Currency helpers ─────────────────────────────────────────────
  const fzCur = FZ_CURRENCIES.find(c => c.code === fzCurrencyCode) ?? FZ_CURRENCIES[0];
  const getFzRate = (code: string) =>
    code === "INR" ? 1 : (fzRates[code] || FZ_CURRENCIES.find(c => c.code === code)?.fallback || 1);
  const convertInr = (inr: number) => {
    if (fzCur.code === "INR") return `₹${inr}`;
    const v = Math.round(inr * getFzRate(fzCur.code));
    return `${fzCur.symbol}${v.toLocaleString()}`;
  };
  function displayPriceFz(pricingType: PricingType, p: GamePrices): string {
    if (pricingType === "free") return "Free";
    if (pricingType === "solo") return convertInr(p.solo);
    if (pricingType === "online2p") return convertInr(p.online2p);
    if (pricingType === "local2p") return convertInr(p.local2p);
    if (pricingType === "online-variable") return `${convertInr(p.online2p)}–${convertInr(p.online4p)}`;
    if (pricingType === "local-variable") return `${convertInr(p.local2p)}–${convertInr(p.local4p)}`;
    return "Free";
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOnState(next);
    setSoundOn(next);
    if (next) setTimeout(() => playSound("pop"), 50);
  }

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((data) => {
        const gs = data?.gameSettings ?? {};
        if (gs.prices)        setPrices({ ...DEFAULT_PRICES, ...gs.prices });
        if (gs.phonepeUpiId)     setPhonepeUpiId(gs.phonepeUpiId);
        if (gs.razorpayLink)     setGameRazorpayLink(gs.razorpayLink);
        if (gs.upiQrUrl)      setGameUpiQrUrl(gs.upiQrUrl);
        if (gs.overrides)     setGameOverrides(gs.overrides);
        if (gs.trustTagline)  setTrustTagline(gs.trustTagline);
        if (gs.trustBody)     setTrustBody(gs.trustBody);
        if (gs.refundPolicy)  setRefundPolicy(gs.refundPolicy);
        if (gs.thankyouMsg)   setThankyouMsg(gs.thankyouMsg);
        if (gs.bannerEnabled) setBannerEnabled(gs.bannerEnabled);
        if (gs.bannerHeading) setBannerHeading(gs.bannerHeading);
        if (gs.bannerBody)    setBannerBody(gs.bannerBody);
        if (gs.ads) {
          const enabled: AdContent[] = (gs.ads as GsAdRaw[])
            .filter((a: GsAdRaw) => a.enabled !== false)
            .map((a: GsAdRaw) => ({
              icon:     a.icon,
              title:    a.headline ?? a.sponsor ?? "Sponsor Message",
              desc:     a.body ?? "",
              cta:      a.ctaLabel ?? "Learn More",
              href:     a.ctaUrl ?? "/donate",
              imageUrl: a.imageUrl,
            }));
          if (enabled.length > 0) setSponsorAds(enabled);
        }
        if (gs.adPattern && Array.isArray(gs.adPattern)) setAdPattern(gs.adPattern);
        if (gs.mode === "pay" || gs.mode === "free") setGameMode(gs.mode);
        if (gs.gameOrder && Array.isArray(gs.gameOrder) && gs.gameOrder.length > 0) setGameOrder(gs.gameOrder);
        if (gs.verifyCode) setVerifyCode(gs.verifyCode);
        if (typeof gs.verifyEnabled === "boolean") setVerifyEnabled(gs.verifyEnabled);
        if (gs.flashNotes && Array.isArray(gs.flashNotes)) setFlashNotes(gs.flashNotes);
        if (gs.ctaText && typeof gs.ctaText === "object") setCtaText(gs.ctaText);
        if (gs.intlPaymentUrl)    setIntlPaymentUrl(gs.intlPaymentUrl);
        if (gs.intlPaymentMethod) setIntlPaymentMethod(gs.intlPaymentMethod);
        if (gs.intlPaymentNote)   setIntlPaymentNote(gs.intlPaymentNote);
        if (gs.intlGateways && typeof gs.intlGateways === "object") setIntlGateways(gs.intlGateways);

        // Hero buttons
        const hb = data?.funZonePage?.heroButtons;
        if (hb && typeof hb === "object") {
          setHeroButtons(hb);
          if (hb.defaultMode === "pay") setGameMode("pay");
          else if (hb.defaultMode === "free") setGameMode("free");
        }

        // Region-split ads
        const toAdContent = (arr: GsAdRaw[]): AdContent[] =>
          (arr ?? []).filter(a => a.enabled !== false && (a.headline || a.sponsor)).map(a => ({
            icon: a.imageUrl || a.videoUrl ? undefined : "🎯",
            title: a.headline || a.sponsor || "",
            desc: a.body,
            cta: a.ctaLabel || "Learn More",
            href: a.ctaUrl || "",
            imageUrl: a.imageUrl,
            videoUrl: a.videoUrl,
          }));
        if (gs.adsIndia?.length) setAdsIndia(toAdContent(gs.adsIndia));
        if (gs.adsIntl?.length)  setAdsIntl(toAdContent(gs.adsIntl));

        if (data?.funZonePage) setFzPage(data.funZonePage);
      })
      .catch(() => {});

    fetch("/api/game-listings")
      .then(r => r.json())
      .then((d) => Array.isArray(d) ? setExternalGames(d) : null)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (sharedRoom) { setActiveGame("ttt-multi"); setScreen("play"); }
  }, [sharedRoom]);

  useEffect(() => {
    if (sharedLudoRoom) { setActiveGame("ludo-multi"); setScreen("play"); }
  }, [sharedLudoRoom]);

  const card = activeGame ? GAMES.find(g => g.id === activeGame)! : null;

  const isVariablePrice = (id: GameId) => {
    const g = GAMES.find(c => c.id === id);
    return g?.pricingType === "online-variable" || g?.pricingType === "local-variable";
  };

  // ── Game ordering ────────────────────────────────────────────────
  const orderedGames: GameCard[] = (() => {
    if (gameOrder.length === 0) return GAMES;
    const byId: Record<string, GameCard> = Object.fromEntries(GAMES.map(g => [g.id, g]));
    const ordered = gameOrder.map(id => byId[id]).filter(Boolean) as GameCard[];
    const extras = GAMES.filter(g => !gameOrder.includes(g.id));
    return [...ordered, ...extras];
  })();

  // ── Flash notes cycle ────────────────────────────────────────────
  useEffect(() => {
    const active = flashNotes.filter(n => n.enabled !== false && n.text);
    if (active.length === 0 || screen !== "lobby") { setCurrentFlash(null); return; }
    let idx = 0;
    const show = () => { setCurrentFlash(active[idx % active.length]); idx++; };
    show();
    const t = setInterval(() => {
      setCurrentFlash(null);
      setTimeout(show, 500);
    }, 7000);
    return () => { clearInterval(t); setCurrentFlash(null); };
  }, [flashNotes, screen]);

  function openGame(id: GameId) {
    const g = GAMES.find(c => c.id === id)!;
    setActiveGame(id);
    setSelectedPlayers(2);
    setVerifyInput(""); setShowVerify(false); setVerifyError(false); setVerifyUnlocked(false);
    const pgMode = gameOverrides[id]?.playMode as string | undefined;
    const effectiveMode = pgMode ?? gameMode;
    const isFreeGame = effectiveMode === "free" || gameOverrides[id]?.isFree === true;
    const price = isFreeGame ? null : computePrice(g.pricingType, 2, prices);
    setAdPending(id);
    if (!isFreeGame && price !== null) {
      setScreen("pay");
    } else {
      setPostAdScreen("play");
      setScreen("ad");
    }
  }
  function onUnlock() {
    if (pendingExtGame) {
      const s = pendingExtGame.sourceType;
      if (s === "embed" || s === "upload") {
        setScreen("ext-play");
      } else {
        window.open(pendingExtGame.url, "_blank", "noopener,noreferrer");
        setPendingExtGame(null);
        setScreen("lobby");
      }
      setExtPayGame(null);
    } else {
      setScreen("play");
    }
  }
  function onAdWatched() {
    const next = adPlayCount + 1;
    localStorage.setItem("fz_ad_count", next.toString());
    setAdPlayCount(next);
    setAdPending(null);
    if (pendingExtGame) {
      if (pendingExtGame.sourceType === "embed") {
        setScreen("ext-play");
      } else {
        window.open(pendingExtGame.url, "_blank", "noopener,noreferrer");
        setPendingExtGame(null);
        setScreen("lobby");
      }
    } else {
      setScreen(postAdScreen);
    }
  }
  function openExternalGame(g: typeof externalGames[0]) {
    const isIndia = userCountry === "IN" || !userCountry;
    if (g.audience === "india" && userCountry && !isIndia) return;
    if (g.audience === "intl" && isIndia && userCountry) return;
    // "embed" and "upload" both open inline; "url" and "library" open in the iframe player too
    const opensInline = g.sourceType === "embed" || g.sourceType === "upload" || !!g.embedCode;
    const pending = { title: g.title, emoji: g.emoji || "🎮", url: g.url, embedCode: g.embedCode, sourceType: g.sourceType };
    if (g.playMode === "free") {
      if (opensInline) {
        setPendingExtGame(pending);
        setScreen("ext-play");
      } else {
        window.open(g.url, "_blank", "noopener,noreferrer");
      }
    } else if (g.playMode === "ad") {
      setPendingExtGame(pending);
      setAdPending("tambola");
      setPostAdScreen("ext-play");
      setScreen("ad");
    } else {
      // pay-to-play — show payment screen
      setPendingExtGame(pending);
      setExtPayGame({ title: g.title, emoji: g.emoji || "🎮", price: g.price || 0 });
      setScreen("pay");
    }
  }

  function goBack() {
    setActiveGame(null); setScreen("lobby"); setSelectedPlayers(2); setAdPending(null);
    setPendingExtGame(null); setExtPayGame(null);
    setVerifyInput(""); setShowVerify(false); setVerifyError(false); setVerifyUnlocked(false);
  }

  const isMultiplayerGame = card?.id === "ttt-multi" || card?.id === "ludo-multi";
  const currentPrice = card
    ? (() => {
        const pm = gameOverrides[card.id]?.playMode as string | undefined;
        const em = pm ?? gameMode;
        return (em === "free" || gameOverrides[card.id]?.isFree) ? null : computePrice(card.pricingType, selectedPlayers, prices);
      })()
    : null;
  const visibleGames = orderedGames.filter(g => {
    if (gameOverrides[g.id]?.enabled === false) return false;
    const showTo = gameOverrides[g.id]?.showTo ?? "all";
    if (showTo === "india" && userCountry !== "" && userCountry !== "IN") return false;
    if (showTo === "intl" && userCountry === "IN") return false;
    return true;
  });

  return (
    <>
    <div className="min-h-screen" style={{ background: "#0d0821" }}>
      <Nav />
      <main className="pt-24 md:pt-20">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-10 md:py-20 px-6 text-center"
          style={{ background: "linear-gradient(160deg,#0d0821 0%,#1b1050 45%,#0f2845 100%)" }}>

          {/* Floating emojis — mobile only */}
          {FLOATERS.map((f, i) => (
            <span key={i}
              className={`md:hidden absolute select-none pointer-events-none ${f.cls} ${f.size} ${f.opacity}`}
              style={{ top: f.top, left: f.left, right: f.right }}>
              {f.emoji}
            </span>
          ))}

          {(() => {
            const hv: Record<string, boolean> = fzPage.heroVisibility ?? {};
            return (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }} className="max-w-xl mx-auto relative z-10">

            {/* Badge */}
            {hv.showBadge !== false && (
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5 border border-white/25 backdrop-blur-sm text-white/90"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              <Sparkles size={13} className="text-yellow-300" />
              <span>🎮 {fzPage.badge || "Joy Zone — Level Up!"}</span>
            </div>
            )}

            {/* Heading */}
            {hv.showHeading !== false && (
            <h1 className="font-serif font-bold mb-4 text-[2.4rem] md:text-5xl leading-[1.08]">
              <span className="md:hidden">
                <span style={{ background: "linear-gradient(90deg,#fde68a 0%,#fb923c 35%,#f472b6 70%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {fzPage.headingMobile1 || "Play. Win."}
                </span>
                <br />
                <span className="text-white">{fzPage.headingMobile2 || "Make magic. ✨"}</span>
              </span>
              <span className="hidden md:inline text-white">
                {fzPage.headingDesktop ? (
                  fzPage.headingDesktop
                ) : (
                  <>Play, Laugh &{" "}
                    <span style={{ background: "linear-gradient(90deg,#fde68a 0%,#fb923c 60%,#f472b6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      Make a Difference
                    </span>
                  </>
                )}
              </span>
            </h1>
            )}

            {/* Subtext */}
            {hv.showSubtitle !== false && (
            <p className="text-base text-white/70 text-sm leading-relaxed">
              {(fzPage.subtitleMobile || fzPage.subtitle)
                ? (fzPage.subtitleMobile || fzPage.subtitle)
                : <>Every game you play <span className="text-yellow-300 font-semibold">sends a smile</span> to a family in need. 💛</>
              }
            </p>
            )}

            {/* Mobile stat pills — colourful Gen Z style */}
            {hv.showPills !== false && (
            <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
              {[
                { label: fzPage.pill1 || "🎮 8 Games Live", grad: "linear-gradient(90deg,#f97316,#ec4899)" },
                { label: fzPage.pill2 || "🌐 Online Play",  grad: "linear-gradient(90deg,#6366f1,#8b5cf6)" },
                { label: fzPage.pill3 || "❤️ 100% Charity", grad: "linear-gradient(90deg,#10b981,#06b6d4)" },
              ].map(({ label, grad }) => (
                <span key={label}
                  className="inline-flex items-center gap-1.5 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full"
                  style={{ background: grad, boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>
                  {label}
                </span>
              ))}
            </div>
            )}

            {/* ── Hero Mode Selection Buttons ── */}
            {hv.showButtons !== false && (heroButtons.showFree !== false || heroButtons.showPay !== false) && (
              (() => {
                // ── Button style lookups (Tailwind needs full class strings) ──
                const COLORS: Record<string, { sel: string; unsel: string; check: string }> = {
                  emerald: { sel: "bg-emerald-500/25 border-2 border-emerald-400 text-white", unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-emerald-300" },
                  teal:    { sel: "bg-teal-500/25 border-2 border-teal-400 text-white",    unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-teal-300"    },
                  blue:    { sel: "bg-blue-500/25 border-2 border-blue-400 text-white",    unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-blue-300"    },
                  cyan:    { sel: "bg-cyan-500/25 border-2 border-cyan-400 text-white",    unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-cyan-300"    },
                  sky:     { sel: "bg-sky-500/25 border-2 border-sky-400 text-white",      unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-sky-300"     },
                  lime:    { sel: "bg-lime-500/25 border-2 border-lime-400 text-white",    unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-lime-300"    },
                  violet:  { sel: "bg-violet-500/25 border-2 border-violet-400 text-white", unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-violet-300" },
                  purple:  { sel: "bg-purple-500/25 border-2 border-purple-400 text-white", unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-purple-300" },
                  rose:    { sel: "bg-rose-500/25 border-2 border-rose-400 text-white",    unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-rose-300"    },
                  pink:    { sel: "bg-pink-500/25 border-2 border-pink-400 text-white",    unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-pink-300"    },
                  amber:   { sel: "bg-amber-500/25 border-2 border-amber-400 text-white",  unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-amber-300"   },
                  orange:  { sel: "bg-orange-500/25 border-2 border-orange-400 text-white", unsel: "bg-white/8 border border-white/20 text-white/80", check: "text-orange-300" },
                };
                const SHAPES: Record<string, string> = { rounded: "rounded-2xl", pill: "rounded-full", square: "rounded-lg" };
                const SIZES: Record<string, { pad: string; label: string; desc: string; emoji: string; gap: string }> = {
                  compact: { pad: "py-3 px-3",  label: "text-[12px]", desc: "text-[9px]",  emoji: "text-2xl", gap: "gap-1"   },
                  regular: { pad: "py-4 px-3",  label: "text-[13px]", desc: "text-[10px]", emoji: "text-3xl", gap: "gap-1.5" },
                  large:   { pad: "py-5 px-4",  label: "text-[15px]", desc: "text-[11px]", emoji: "text-4xl", gap: "gap-2"   },
                };

                const layout    = heroButtons.btnLayout  as string ?? "side-by-side";
                const size      = SIZES[heroButtons.btnSize  as string ?? "regular"] ?? SIZES.regular;
                const shape     = SHAPES[heroButtons.btnShape as string ?? "rounded"] ?? SHAPES.rounded;
                const alignCls  = (heroButtons.btnAlign as string ?? "center") === "left" ? "items-start text-left" : "items-center text-center";
                const freeClr   = COLORS[heroButtons.freeColor as string ?? "emerald"] ?? COLORS.emerald;
                const payClr    = COLORS[heroButtons.payColor  as string ?? "violet"]  ?? COLORS.violet;
                const showEmoji = heroButtons.showBtnEmoji !== false;
                const bothShown = heroButtons.showFree !== false && heroButtons.showPay !== false;

                const wrapCls = [
                  "mt-7 mx-auto max-md:max-w-sm",
                  bothShown && layout === "side-by-side" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3",
                ].join(" ");

                const btnBase = `flex flex-col justify-center transition-all ${size.pad} ${shape} ${size.gap} ${alignCls}`;

                return (
                  <div className={wrapCls}>
                    {heroButtons.showFree !== false && (
                      <motion.button
                        whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                        onClick={() => { setGameMode("free"); setTimeout(() => document.getElementById("game-lobby")?.scrollIntoView({ behavior: "smooth" }), 50); }}
                        className={`${btnBase} ${gameMode === "free" ? freeClr.sel : freeClr.unsel}`}>
                        {showEmoji && <span className={`${size.emoji} leading-none`}>🎬</span>}
                        <div className={`font-extrabold ${size.label} leading-tight tracking-tight`}>
                          {heroButtons.freeLabel || "Click to Play"}
                        </div>
                        <div className={`${size.desc} opacity-65 leading-snug`}>
                          {heroButtons.freeDesc || "Watch a short ad · Free"}
                        </div>
                        {gameMode === "free" && (
                          <span className={`mt-1 text-[9px] font-black uppercase tracking-wider ${freeClr.check}`}>✓ Selected</span>
                        )}
                      </motion.button>
                    )}
                    {heroButtons.showPay !== false && (
                      <motion.button
                        whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                        onClick={() => { setGameMode("pay"); setTimeout(() => document.getElementById("game-lobby")?.scrollIntoView({ behavior: "smooth" }), 50); }}
                        className={`${btnBase} ${gameMode === "pay" ? payClr.sel : payClr.unsel}`}>
                        {showEmoji && <span className={`${size.emoji} leading-none`}>💰</span>}
                        <div className={`font-extrabold ${size.label} leading-tight tracking-tight`}>
                          {heroButtons.payLabel || "Pay to Play"}
                        </div>
                        <div className={`${size.desc} opacity-65 leading-snug`}>
                          {heroButtons.payDesc || (userCountry === "IN" ? `From ₹${prices.solo} · Donate` : "Small donation · Unlock")}
                        </div>
                        {gameMode === "pay" && (
                          <span className={`mt-1 text-[9px] font-black uppercase tracking-wider ${payClr.check}`}>✓ Selected</span>
                        )}
                      </motion.button>
                    )}
                  </div>
                );
              })()
            )}
          </motion.div>
            );
          })()}
        </section>

        {/* ── MAIN AREA ────────────────────────────────────────────── */}
        <section className="bg-background max-w-3xl mx-auto px-4 py-8 md:py-10">
          <AnimatePresence mode="wait">

            {/* ── LOBBY ──────────────────────────────────────────── */}
            {screen === "lobby" && (
              <motion.div id="game-lobby" key="lobby"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>

                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Gamepad2 size={20} className="text-primary" />
                    <span className="max-md:hidden">Play Now</span>
                    <span className="md:hidden" style={{ background: "linear-gradient(90deg,#fb923c,#f472b6,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      Play Now ✨
                    </span>
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* Currency selector — only in Pay to Play mode */}
                    {gameMode === "pay" && (
                      <div className="relative">
                        <motion.button
                          onClick={() => setShowCurrencyDrop(v => !v)}
                          whileTap={{ scale: 0.9 }}
                          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border transition-all
                            bg-muted text-muted-foreground border-border max-md:bg-white/10 max-md:text-white/80 max-md:border-white/20">
                          <Globe size={11} />
                          <span>{fzCur.flag} {fzCur.code}</span>
                          <ChevronDown size={10} />
                        </motion.button>
                        {showCurrencyDrop && (
                          <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-xl p-1 min-w-[130px]"
                            style={{ maxHeight: 220, overflowY: "auto" }}>
                            {FZ_CURRENCIES.map(c => (
                              <button key={c.code}
                                onClick={() => { setFzCurrencyCode(c.code); setShowCurrencyDrop(false); }}
                                className={[
                                  "w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors",
                                  c.code === fzCurrencyCode ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground",
                                ].join(" ")}>
                                <span>{c.flag}</span> {c.code}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  {/* Sound toggle */}
                    <motion.button
                      onClick={toggleSound}
                      whileTap={{ scale: 0.9 }}
                      title={soundOn ? "Sound ON — tap to mute" : "Sound OFF — tap to enable"}
                      className={[
                        "flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all",
                        soundOn
                          ? "bg-primary/10 text-primary border-primary/30 max-md:bg-white/15 max-md:text-white max-md:border-white/25"
                          : "bg-muted text-muted-foreground border-border max-md:bg-white/8 max-md:text-white/50 max-md:border-white/15",
                      ].join(" ")}>
                      {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      <span className="hidden sm:inline">{soundOn ? "Sound" : "Muted"}</span>
                    </motion.button>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full flex items-center gap-1 max-md:text-green-300 max-md:bg-green-900/30 max-md:border-green-700/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                      {visibleGames.length + externalGames.length} Live
                    </span>
                  </div>
                </div>

                {/* Flash notes toast */}
                <AnimatePresence>
                  {currentFlash && (
                    <motion.div
                      key={currentFlash.text}
                      initial={{ opacity: 0, y: -12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.35 }}
                      className="mb-3 flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold
                        max-md:border max-md:border-yellow-400/30 max-md:text-yellow-200
                        md:bg-amber-50 md:border md:border-amber-200 md:text-amber-900"
                      style={{ background: "rgba(251,191,36,0.12)" }}>
                      <span className="text-xl">{currentFlash.emoji}</span>
                      <span className="flex-1 leading-snug">{currentFlash.text}</span>
                      <button onClick={() => setCurrentFlash(null)} className="text-current opacity-40 hover:opacity-80 shrink-0">✕</button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Transparency banner */}
                {bannerEnabled && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-start gap-3 rounded-2xl px-4 py-3.5
                      md:bg-blue-50 md:border md:border-blue-200
                      max-md:border max-md:border-white/15"
                    style={{ background: "rgba(99,102,241,0.12)" }}>
                    <Info size={15} className="shrink-0 mt-0.5 max-md:text-indigo-300 md:text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold max-md:text-white/90 md:text-blue-800">
                        {bannerHeading || "Why do some games require a small donation?"}
                      </p>
                      <p className="text-xs mt-0.5 max-md:text-white/60 md:text-blue-700 leading-relaxed">
                        {bannerBody || "We're an NGO, not a game company. A small donation unlocks the game and funds real programs for families in need. Free games are always free."}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Game cards grid — grouped by Indian / International sections */}
                <div className="mb-10 space-y-6">
                  {(() => {
                    const getAudience = (g: typeof visibleGames[0]) =>
                      gameOverrides[g.id]?.showTo ?? g.audience ?? "all";
                    const indiaGames = visibleGames.filter(g => getAudience(g) === "india");
                    const intlGames  = visibleGames.filter(g => getAudience(g) === "intl");
                    const allGames   = visibleGames.filter(g => getAudience(g) === "all");

                    // Published external games merged into the same sections
                    const pubExt = externalGames.filter(g => g.published !== false);
                    const extIndia = pubExt.filter(g => (g.audience ?? "all") === "india");
                    const extIntl  = pubExt.filter(g => (g.audience ?? "all") === "intl");
                    const extAll   = pubExt.filter(g => (g.audience ?? "all") === "all");

                    type GG = { cat: string; emoji: string; label: string; games: typeof visibleGames; extGames: typeof pubExt };
                    const groups: GG[] = [
                      { cat: "india", emoji: "🇮🇳", label: "Indian Games",        games: indiaGames, extGames: extIndia },
                      { cat: "intl",  emoji: "🌐",  label: "International Games", games: intlGames,  extGames: extIntl  },
                      ...(allGames.length > 0 || extAll.length > 0
                        ? [{ cat: "all", emoji: "🎮", label: "All Games", games: allGames, extGames: extAll }]
                        : []),
                    ].filter(g => g.games.length > 0 || g.extGames.length > 0);
                    return groups.map(grp => (
                      <div key={grp.cat}>
                        {/* Category section header — visible on dark mobile AND light desktop */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm">{grp.emoji}</span>
                          <span className="text-[11px] font-black uppercase tracking-widest
                            max-md:text-white md:text-foreground/70
                            max-md:bg-white/15 md:bg-transparent
                            max-md:px-2.5 max-md:py-0.5 max-md:rounded-full">
                            {grp.label}
                          </span>
                          <div className="flex-1 h-px max-md:bg-white/20 md:bg-border" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {grp.games.map((g, i) => (
                            <motion.button key={g.id}
                              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.055 }}
                              whileHover={{ y: -4, scale: 1.025 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => openGame(g.id)}
                              className={[
                                "text-left flex flex-col gap-2 relative rounded-2xl transition-all",
                                `md:bg-gradient-to-br md:${g.color} md:border md:${g.border} md:p-5 md:shadow-sm md:hover:shadow-md`,
                                "max-md:p-4 max-md:border-0 max-md:text-white",
                              ].join(" ")}>

                              <span className="md:hidden absolute inset-0 rounded-2xl pointer-events-none"
                                style={{ background: g.mobileGrad, boxShadow: g.mobileGlow }} />

                              {g.hot && (
                                <span className="absolute -top-2 -right-1 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase z-10 bg-rose-500 max-md:fz-hot-pulse max-md:shadow-[0_0_12px_rgba(255,50,50,0.7)]">
                                  <Flame size={8} /> HOT
                                </span>
                              )}

                              <div className="relative z-10 flex flex-col gap-2 h-full">
                                <div className="flex items-start justify-between">
                                  <span className="text-4xl leading-none">{gameOverrides[g.id]?.emoji || g.emoji}</span>
                                  <div className="flex flex-col items-end gap-1">
                                    {/* Badge — solid dark bg on mobile for always-readable text */}
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full max-md:bg-black/35 max-md:text-white md:${g.badgeColor}`}>
                                      {g.badge}
                                    </span>
                                    <span className="text-[11px] font-black text-emerald-400">
                                      {(() => {
                                        const pm = gameOverrides[g.id]?.playMode as string | undefined;
                                        if ((pm ?? gameMode) === "free" || gameOverrides[g.id]?.isFree) return "Free ✓";
                                        const isIndiaUser = userCountry === "IN" || !userCountry;
                                        const perGame = isIndiaUser ? gameOverrides[g.id]?.priceIndia : gameOverrides[g.id]?.priceIntl;
                                        if (perGame != null && perGame > 0) return isIndiaUser ? `₹${perGame}` : `$${perGame}`;
                                        return displayPriceFz(g.pricingType, prices);
                                      })()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <h3 className="font-bold text-base leading-tight max-md:text-white md:text-foreground">
                                    {gameOverrides[g.id]?.title || g.title}
                                  </h3>
                                  <p className="text-xs mt-0.5 leading-snug max-md:text-white/70 md:text-muted-foreground line-clamp-2">
                                    {gameOverrides[g.id]?.tagline || g.tagline}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2.5 text-[11px] pt-1 border-t max-md:border-white/20 md:border-black/5 max-md:text-white/60 md:text-muted-foreground">
                                  <span className="flex items-center gap-1"><Clock size={9} /> {g.ages}</span>
                                  <span className="flex items-center gap-1"><Users size={9} /> {g.players}</span>
                                </div>
                              </div>
                            </motion.button>
                          ))}

                          {/* Admin-added games — rendered in the same grid as built-ins */}
                          {grp.extGames.map((g, i) => {
                            const playBadge = g.playMode === "free" ? "Free ✓"
                              : g.playMode === "ad" ? "Ad Gate"
                              : g.isFree ? "Free" : `₹${g.price}`;
                            const mobileBadgeColor = g.playMode === "free"
                              ? "bg-emerald-400/25 text-emerald-200"
                              : g.playMode === "ad" ? "bg-violet-400/25 text-violet-200"
                              : "bg-amber-400/25 text-amber-200";
                            const desktopBadgeColor = g.playMode === "free"
                              ? "bg-emerald-100 text-emerald-700"
                              : g.playMode === "ad" ? "bg-violet-100 text-violet-700"
                              : "bg-amber-100 text-amber-700";
                            const mobileGrads: Record<string, string> = {
                              india: "linear-gradient(135deg,#f7971e 0%,#f54141 100%)",
                              intl:  "linear-gradient(135deg,#4776e6 0%,#8e54e9 100%)",
                              all:   "linear-gradient(135deg,#f953c6 0%,#b91d73 100%)",
                            };
                            const desktopColors: Record<string, { color: string; border: string }> = {
                              india: { color: "from-orange-50 to-amber-50",  border: "border-orange-200" },
                              intl:  { color: "from-indigo-50 to-blue-50",   border: "border-indigo-200" },
                              all:   { color: "from-purple-50 to-pink-50",   border: "border-purple-200" },
                            };
                            const aud = g.audience ?? "all";
                            const mobileGrad = mobileGrads[aud] ?? mobileGrads["all"]!;
                            const { color, border } = desktopColors[aud] ?? desktopColors["all"]!;
                            return (
                              <motion.button key={g.id}
                                initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (grp.games.length + i) * 0.055 }}
                                whileHover={{ y: -4, scale: 1.025 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => openExternalGame(g)}
                                className={[
                                  "text-left flex flex-col gap-2 relative rounded-2xl transition-all",
                                  `md:bg-gradient-to-br md:${color} md:border md:${border} md:p-5 md:shadow-sm md:hover:shadow-md`,
                                  "max-md:p-4 max-md:border-0 max-md:text-white",
                                ].join(" ")}>

                                <span className="md:hidden absolute inset-0 rounded-2xl pointer-events-none"
                                  style={{ background: mobileGrad, boxShadow: "0 10px 28px rgba(0,0,0,0.35)" }} />

                                <div className="relative z-10 flex flex-col gap-2 h-full">
                                  <div className="flex items-start justify-between">
                                    {g.imageUrl
                                      ? <img src={g.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                      : <span className="text-4xl leading-none">{g.emoji || "🎮"}</span>}
                                    <div className="flex flex-col items-end gap-1">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full max-md:${mobileBadgeColor} md:${desktopBadgeColor}`}>
                                        {playBadge}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-bold text-base leading-tight max-md:text-white md:text-foreground">{g.title}</h3>
                                    {g.description && (
                                      <p className="text-xs mt-0.5 leading-snug max-md:text-white/70 md:text-muted-foreground line-clamp-2">{g.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] pt-1 border-t max-md:border-white/20 md:border-black/5 max-md:text-white/50 md:text-muted-foreground">
                                    {g.sourceType === "embed" || g.sourceType === "upload"
                                      ? <span className="mr-0.5">🖼️</span>
                                      : <ExternalLink size={9} className="mr-0.5" />}
                                    <span>{g.category || "Game"}</span>
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Coming Soon */}
                <div className="mb-3 flex items-center gap-2">
                  <Star size={17} className="text-amber-500" />
                  <h2 className="text-lg font-bold">{fzPage.comingSoonTitle || "Coming Soon"}</h2>
                </div>
                <p className="text-sm text-muted-foreground max-md:text-xs mb-4">
                  {fzPage.comingSoonDesc || "Most-played games in India — all with online multiplayer!"}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-2.5 mb-10">
                  {COMING_SOON.map((g, i) => {
                    const ov = ((fzPage.comingSoonGames ?? [])[i] ?? {}) as { emoji?: string; title?: string; why?: string; tag?: string };
                    return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28 + i * 0.055 }}
                      className={[
                        "flex items-center gap-3 p-3.5 rounded-2xl relative overflow-hidden",
                        /* desktop */ "md:border md:border-dashed md:border-border md:bg-muted/30 md:opacity-80",
                        /* mobile  */ "max-md:border-0",
                      ].join(" ")}>

                      {/* Mobile bg via span — pure CSS responsive, no JS */}
                      <span className="md:hidden absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ background: `${g.mobileBg}e6`, border: "1px solid rgba(255,255,255,0.1)" }} />

                      <span className="text-2xl shrink-0 relative z-10">{ov.emoji || g.emoji}</span>
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <p className="text-xs font-bold max-md:text-white/90 md:text-foreground leading-tight">{ov.title || g.title}</p>
                        </div>
                        <p className="text-[10px] max-md:text-white/50 md:text-muted-foreground leading-snug line-clamp-1">{ov.why || g.why}</p>
                      </div>
                      <span className="text-[9px] font-bold max-md:text-white/40 md:text-muted-foreground max-md:bg-white/10 md:bg-muted px-1.5 py-0.5 rounded shrink-0 relative z-10">
                        {ov.tag || "Soon"}
                      </span>
                    </motion.div>
                  )})}
                </div>


                {/* More activities */}
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Palette size={17} className="text-pink-500" /> More Activities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: Palette,  title: "Coloring Pages", desc: "Download & colour scenes",  href: "/coloring",        color: "text-pink-500",   mobileBg: "bg-pink-500/15",   border: "border-pink-500/25"   },
                    { icon: TreePine, title: "Plant a Tree",    desc: "Donate to grow our forest", href: "/donate",          color: "text-green-600",  mobileBg: "bg-green-500/15",  border: "border-green-500/25"  },
                    { icon: Brain,    title: "Success Stories", desc: "Read inspiring heroes",     href: "/success-stories", color: "text-blue-500",   mobileBg: "bg-blue-500/15",   border: "border-blue-500/25"   },
                  ].map(a => {
                    const Icon = a.icon;
                    return (
                      <Link key={a.title} href={a.href}
                        className={[
                          "flex items-center gap-3 p-4 rounded-2xl transition-all",
                          "md:border md:border-border md:hover:border-primary/30 md:hover:bg-primary/3",
                          `max-md:border max-md:${a.border} max-md:${a.mobileBg}`,
                        ].join(" ")}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 max-md:bg-white/10 md:bg-muted ${a.color}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold max-md:text-white/90 md:text-foreground">{a.title}</p>
                          <p className="text-xs max-md:text-white/50 md:text-muted-foreground">{a.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>
      </main>
      <Footer />
    </div>

    {/* ── FULL-SCREEN OVERLAYS (cover nav + footer on all screen sizes) ── */}
    <AnimatePresence>
      {screen === "play" && card && (
        <motion.div key="play-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] bg-background flex flex-col">

          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0 bg-background">
            <button onClick={goBack}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl font-semibold text-sm transition-colors shrink-0
                bg-muted hover:bg-muted/80 text-foreground border border-border">
              <ChevronLeft size={15} />
              <span>Back</span>
            </button>
            <span className="text-2xl">{card.emoji}</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold leading-tight text-foreground truncate">{card.title}</h2>
              <p className="text-[11px] text-muted-foreground">{card.players}</p>
            </div>
            <motion.button
              onClick={toggleSound}
              whileTap={{ scale: 0.88 }}
              title={soundOn ? "Mute sounds" : "Enable sounds"}
              className={[
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                soundOn
                  ? "bg-primary/10 text-primary border-primary/25"
                  : "bg-muted text-muted-foreground border-border",
              ].join(" ")}>
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </motion.button>
          </div>

          {/* Game content — scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-card border border-border rounded-3xl p-4 shadow-sm">
              {card.id === "ttt"        && <TicTacToe />}
              {card.id === "ttt-multi"  && <MultiplayerTTT initialRoom={sharedRoom} />}
              {card.id === "memory"     && <MemoryMatch />}
              {card.id === "darts"      && <DartsGame />}
              {card.id === "tambola"    && <TambolaGame />}
              {card.id === "snakes"     && <SnakesLadders />}
              {card.id === "ludo"       && <LudoGame preselectedPlayers={selectedPlayers} />}
              {card.id === "ludo-multi" && <MultiplayerLudo initialRoom={sharedLudoRoom} />}
              {card.id === "match3"     && <Match3Game />}
              {card.id === "platformer" && <PlatformerGame />}
            </div>

            {!isMultiplayerGame && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                className="mt-4 rounded-2xl px-5 py-4 flex items-center justify-between gap-3
                  bg-primary/5 border border-primary/15">
                <div>
                  <p className="text-sm font-semibold text-primary">{fzPage.enjoyingText || "Enjoying the game?"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{fzPage.enjoyingSubtext || "Your contribution funds real community programs."}</p>
                </div>
                <Button asChild size="sm" className="rounded-full shrink-0">
                  <Link href="/donate">{ctaText.donateBtn || "Donate ❤️"}</Link>
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {screen === "ext-play" && pendingExtGame && (
        <motion.div key="ext-play-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] bg-background flex flex-col">

          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0 bg-background">
            <button onClick={goBack}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl font-semibold text-sm transition-colors shrink-0
                bg-muted hover:bg-muted/80 text-foreground border border-border">
              <ChevronLeft size={15} />
              <span>Back</span>
            </button>
            <span className="text-2xl">{pendingExtGame.emoji}</span>
            <h2 className="text-base font-bold leading-tight truncate flex-1">{pendingExtGame.title}</h2>
          </div>

          {/* iframe fills every remaining pixel */}
          <div className="flex-1 overflow-hidden">
            {pendingExtGame.embedCode ? (
              <iframe
                src={pendingExtGame.embedCode.startsWith("<") ? undefined : pendingExtGame.embedCode}
                srcDoc={pendingExtGame.embedCode.startsWith("<") ? pendingExtGame.embedCode : undefined}
                title={pendingExtGame.title}
                className="w-full h-full"
                style={{ border: "none" }}
                allow="fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : pendingExtGame.url ? (
              <iframe
                src={pendingExtGame.url}
                title={pendingExtGame.title}
                className="w-full h-full"
                style={{ border: "none" }}
                allow="fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                <span className="text-4xl">{pendingExtGame.emoji}</span>
                <p className="text-sm">Unable to load game.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── AD SCREEN (full-screen overlay) ── */}
      {screen === "ad" && adPending && (() => {
        const adCard = GAMES.find(g => g.id === adPending)!;
        const rawAdType = adPattern[adPlayCount % Math.max(1, adPattern.length)] ?? "short";
        const currentAdType: "short" | "long" = rawAdType === "long" ? "long" : "short";
        const isIndia = userCountry === "IN" || !userCountry;
        const geoPool = isIndia && adsIndia.length > 0 ? adsIndia
          : !isIndia && adsIntl.length > 0 ? adsIntl
          : sponsorAds.length > 0 ? sponsorAds : AD_CARDS;
        const currentAd = geoPool[adPlayCount % geoPool.length];
        return (
          <motion.div key="ad-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[200] bg-background flex flex-col overflow-y-auto">
            <div className="w-full max-w-lg mx-auto p-4">
              <AdScreen gameCard={adCard} adType={currentAdType} ad={currentAd} onComplete={onAdWatched} onBack={goBack} adSupportMsg={ctaText.adSupportMsg} />
            </div>
          </motion.div>
        );
      })()}

      {/* ── PAY GATE (full-screen overlay) ── */}
      {screen === "pay" && (card || extPayGame) && (
        <motion.div key="pay-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] bg-background flex flex-col overflow-y-auto">
          <div className="w-full max-w-lg mx-auto p-4">
            <button onClick={goBack}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl font-semibold text-sm transition-colors
                bg-muted hover:bg-muted/80 text-foreground border border-border mb-6">
              <ChevronLeft size={15} /> Back to games
            </button>
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              {/* Verification / Access Code */}
              {verifyEnabled && gameMode === "pay" && !verifyUnlocked && (
                <div className="mb-5">
                  <button
                    className="text-xs text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                    onClick={() => setShowVerify(v => !v)}>
                    🔐 Have an access code?
                  </button>
                  <AnimatePresence>
                    {showVerify && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <div className="mt-2 flex gap-2">
                          <input
                            value={verifyInput}
                            onChange={e => { setVerifyInput(e.target.value.toUpperCase()); setVerifyError(false); }}
                            placeholder="Enter code…"
                            className={`flex-1 px-3 py-2 rounded-xl border text-sm font-mono uppercase tracking-widest bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${verifyError ? "border-red-400" : "border-border"}`}
                          />
                          <button
                            onClick={() => {
                              if (verifyInput.trim() === verifyCode.trim()) {
                                setVerifyUnlocked(true);
                                setScreen("play");
                              } else {
                                setVerifyError(true);
                              }
                            }}
                            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                            Apply
                          </button>
                        </div>
                        {verifyError && (
                          <p className="text-xs text-red-500 mt-1">❌ Invalid code — try again.</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Player count selector for variable-price games (built-in only) */}
              {card && isVariablePrice(card.id) && (
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Select Players</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([2, 4] as const).map(n => (
                      <button key={n} onClick={() => setSelectedPlayers(n)}
                        className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border-2 font-semibold text-sm transition-all
                          ${selectedPlayers === n ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40 text-muted-foreground"}`}>
                        <span className="text-xl">{n === 2 ? "👥" : "👨‍👩‍👧‍👦"}</span>
                        <span>{n} Players</span>
                        <span className="text-xs font-black text-primary">
                          ₹{computePrice(card.pricingType, n, prices)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* International payment block */}
              {userCountry !== "IN" && userCountry !== "" && (() => {
                const GATEWAY_KEY: Record<string, string> = {
                  US:"US", CA:"US", AE:"AE", GB:"GB", AU:"AU", NZ:"AU", SG:"SG",
                  DE:"EU", FR:"EU", IT:"EU", ES:"EU", NL:"EU", BE:"EU", AT:"EU",
                  PT:"EU", FI:"EU", IE:"EU", GR:"EU", SE:"EU", DK:"EU", NO:"EU",
                  CH:"EU", PL:"EU",
                };
                const key = GATEWAY_KEY[userCountry] ?? "default";
                const gw = (intlGateways[key]?.url ? intlGateways[key] : null)
                         ?? (intlGateways["default"]?.url ? intlGateways["default"] : null)
                         ?? (intlPaymentUrl ? { method: intlPaymentMethod, url: intlPaymentUrl, note: intlPaymentNote } : null);
                if (!gw?.url) return null;
                return (
                  <div className="mb-5 p-4 rounded-2xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 space-y-3">
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">🌍 International Payment</p>
                    <a href={gw.url} target="_blank" rel="noopener noreferrer"
                      className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 transition-colors text-sm">
                      Pay via {gw.method || "Online Payment"} →
                    </a>
                    {gw.note && <p className="text-xs text-blue-700 dark:text-blue-300 text-center">{gw.note}</p>}
                    <p className="text-[11px] text-muted-foreground text-center">UPI options also available below (PhonePe, GPay, Paytm)</p>
                  </div>
                );
              })()}

              <PayToPlay
                gameEmoji={card?.emoji ?? extPayGame?.emoji ?? "🎮"}
                gameTitle={card?.title ?? extPayGame?.title ?? ""}
                price={currentPrice ?? extPayGame?.price ?? 0}
                onUnlock={onUnlock}
                phonepeUpiId={phonepeUpiId}
                upiQrUrl={gameUpiQrUrl}
                razorpayLink={gameRazorpayLink}
                trustTagline={trustTagline}
                trustBody={trustBody}
                refundPolicy={refundPolicy}
                thankyouMsg={thankyouMsg}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
