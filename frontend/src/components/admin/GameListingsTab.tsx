import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus, Trash2, X, Loader2, CheckCircle2, AlertCircle,
  Pencil, Gamepad2, Eye, EyeOff, GripVertical,
  Link2, Code2, Upload, Star, Search, Check,
  ArrowUp, ArrowDown, FolderOpen,
} from "lucide-react";

interface GameListing {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  emoji: string;
  url: string;
  embedCode: string;
  category: string;
  isFree: boolean;
  price: number;
  published: boolean;
  order: number;
  createdAt: string;
  sourceType: "url" | "embed" | "upload" | "library";
  audience: "all" | "india" | "intl";
  playMode: "free" | "ad" | "pay";
}

type PlayMode   = "free" | "ad" | "pay";
type SourceType = "url" | "embed" | "upload" | "library";
type DrawerMode = "edit" | "add" | null;

const EMPTY: Omit<GameListing, "id" | "createdAt"> = {
  title: "", description: "", imageUrl: "", emoji: "🎮",
  url: "", embedCode: "", category: "Educational",
  isFree: true, price: 0, published: true, order: 0,
  sourceType: "url", audience: "india", playMode: "free",
};

const PLAY_MODE_STYLE: Record<PlayMode, string> = {
  free: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ad:   "bg-violet-100  text-violet-700  border-violet-200",
  pay:  "bg-amber-100   text-amber-700   border-amber-200",
};
const PLAY_MODE_LABEL: Record<PlayMode, string> = {
  free: "🆓 Free",
  ad:   "📺 Ad Gate",
  pay:  "💳 Pay to Play",
};

const LIBRARY_GAMES = [
  { id: "chess",      emoji: "♟️", title: "Chess",          desc: "Classic 1v1 strategy",          audience: "intl"  as const },
  { id: "checkers",   emoji: "🔴", title: "Checkers",       desc: "Jump and capture the opponent",  audience: "intl"  as const },
  { id: "carrom",     emoji: "🔵", title: "Carrom",         desc: "Flick and pot the coins",        audience: "india" as const },
  { id: "kabaddi",    emoji: "🏃", title: "Kabaddi Quiz",   desc: "Indian sport trivia",            audience: "india" as const },
  { id: "2048",       emoji: "🔢", title: "2048",           desc: "Slide tiles to merge numbers",   audience: "intl"  as const },
  { id: "wordle",     emoji: "🔤", title: "Word Guess",     desc: "Guess the 5-letter word",        audience: "intl"  as const },
  { id: "cricket",    emoji: "🏏", title: "Cricket Quiz",   desc: "Test your cricket knowledge",    audience: "india" as const },
  { id: "antakshari", emoji: "🎵", title: "Antakshari",     desc: "Hindi song chain game",          audience: "india" as const },
];

/* ── small helpers ────────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
      {children}
    </p>
  );
}

/* ── Drawer ───────────────────────────────────────────────────────────── */
function GameDrawer({
  game, mode, defaultAudience, totalInSection, saving,
  onClose, onSave,
}: {
  game: GameListing | null;
  mode: DrawerMode;
  defaultAudience: "india" | "intl" | "all";
  totalInSection: number;
  saving: boolean;
  onClose: () => void;
  onSave: (data: Omit<GameListing, "id" | "createdAt">) => void;
}) {
  const isEdit = mode === "edit" && game;

  const [tab,         setTab]         = useState<"details" | "source">("details");
  const [sourceTab,   setSourceTab]   = useState<SourceType>(isEdit ? (game.sourceType ?? "url") : "library");
  const [title,       setTitle]       = useState(isEdit ? game.title       : "");
  const [description, setDescription] = useState(isEdit ? game.description : "");
  const [emoji,       setEmoji]       = useState(isEdit ? game.emoji       : "🎮");
  const [imageUrl,    setImageUrl]    = useState(isEdit ? game.imageUrl    : "");
  const [url,         setUrl]         = useState(isEdit ? game.url         : "https://");
  const [embedCode,   setEmbedCode]   = useState(isEdit ? game.embedCode   : "");
  const [audience,    setAudience]    = useState<"all" | "india" | "intl">(
    isEdit ? game.audience : defaultAudience
  );
  const [playMode,    setPlayMode]    = useState<PlayMode>(isEdit ? game.playMode : "free");
  const [price,       setPrice]       = useState(isEdit ? game.price : 30);
  const [order,       setOrder]       = useState(isEdit ? game.order : totalInSection + 1);
  const [published,   setPublished]   = useState(isEdit ? game.published : true);
  const [libSearch,   setLibSearch]   = useState("");
  const [selected,    setSelected]    = useState<string | null>(null);

  /* ── Upload state ─────────────────────────────────────────────────────── */
  type UploadStatus = "idle" | "uploading" | "done" | "error";
  const [uploadStatus,  setUploadStatus]  = useState<UploadStatus>("idle");
  const [uploadError,   setUploadError]   = useState("");
  const [uploadedUrl,   setUploadedUrl]   = useState(isEdit && game.sourceType === "upload" ? game.url : "");
  const [uploadName,    setUploadName]    = useState("");
  const [isDragOver,    setIsDragOver]    = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleZipUpload(file: File) {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setUploadError("Only .zip files are supported.");
      setUploadStatus("error");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File is too large (max 50 MB).");
      setUploadStatus("error");
      return;
    }
    setUploadStatus("uploading");
    setUploadError("");
    setUploadName(file.name);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("spandana_admin_token") ?? sessionStorage.getItem("spandana_admin_token") ?? "";
      const res = await fetch("/api/admin/game-listings/upload-zip", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setUploadedUrl(data.url);
      setUrl(data.url);
      setUploadStatus("done");
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
      setUploadStatus("error");
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleZipUpload(file);
  // handleZipUpload uses only setState setters + refs — stable, no deps needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleZipUpload(file);
    e.target.value = "";
  };

  const filteredLib = LIBRARY_GAMES.filter(g =>
    g.title.toLowerCase().includes(libSearch.toLowerCase()) ||
    g.desc.toLowerCase().includes(libSearch.toLowerCase())
  );

  function pickLibraryGame(id: string) {
    const g = LIBRARY_GAMES.find(x => x.id === id);
    if (!g) return;
    setSelected(id);
    setTitle(g.title);
    setEmoji(g.emoji);
    setAudience(g.audience);
  }

  function handleSave() {
    const effectiveSourceType = isEdit ? (game.sourceType ?? "url") : sourceTab;
    onSave({
      title, description, emoji, imageUrl,
      url: (effectiveSourceType === "url" || effectiveSourceType === "upload") ? url : "",
      embedCode: effectiveSourceType === "embed" ? embedCode : "",
      audience, playMode, price: playMode === "pay" ? price : 0,
      order, published, category: "Educational",
      isFree: playMode === "free",
      sourceType: effectiveSourceType as GameListing["sourceType"],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl">
              {isEdit ? emoji : <Plus size={18} className="text-indigo-500" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {isEdit ? game.title : "Add Game"}
              </h3>
              <span className="text-xs text-gray-400">
                {isEdit ? "External game" : "Choose from library or add your own"}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-6 pt-3 pb-1 shrink-0">
          <button onClick={() => setTab("details")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all
              ${tab === "details" ? "bg-indigo-100 text-indigo-700" : "text-gray-400 hover:text-gray-600"}`}>
            ✏️ Details & Settings
          </button>
          <button onClick={() => setTab("source")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all
              ${tab === "source" ? "bg-indigo-100 text-indigo-700" : "text-gray-400 hover:text-gray-600"}`}>
            🕹️ {isEdit ? "Game Source" : "Add Game"}
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 pb-6 pt-3 space-y-4 flex-1">

          {/* ── DETAILS TAB ─────────────────────────────────────────── */}
          {tab === "details" && <>

            {/* Visible toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-700">Visible in lobby</p>
                <p className="text-xs text-gray-400">Users will see this game card</p>
              </div>
              <button type="button" onClick={() => setPublished(p => !p)}
                className={`w-11 h-6 rounded-full relative transition-colors ${published ? "bg-green-500" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${published ? "left-5" : "left-0.5"}`} />
              </button>
            </div>

            {/* Emoji + Title */}
            <div className="flex gap-2">
              <div className="shrink-0">
                <Label>Emoji</Label>
                <input value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={4}
                  className="w-14 h-10 rounded-xl border border-gray-200 text-center text-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="flex-1">
                <Label>Game Title *</Label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter game name…"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Description (shown on card)</Label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder="Short tagline for the game…"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <p className="text-[10px] text-gray-400 mt-0.5">{description.length}/100 chars</p>
            </div>

            {/* Cover image */}
            <div>
              <Label>Cover Image URL (optional)</Label>
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://…/cover.jpg"
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            {/* Audience */}
            <div>
              <Label>Audience</Label>
              <div className="grid grid-cols-3 gap-2">
                {([["india","🇮🇳 India"],["intl","🌐 International"],["all","🌍 Everyone"]] as const).map(([v, lbl]) => (
                  <button key={v} type="button" onClick={() => setAudience(v)}
                    className={`py-2 rounded-2xl border-2 text-xs font-semibold transition-all
                      ${audience === v ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Play Mode */}
            <div>
              <Label>Play Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["free","ad","pay"] as PlayMode[]).map(m => (
                  <button key={m} type="button" onClick={() => setPlayMode(m)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 text-xs font-semibold transition-all
                      ${playMode === m ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}>
                    <span className="text-xl">{m === "free" ? "🆓" : m === "ad" ? "📺" : "💳"}</span>
                    {m === "free" ? "Free" : m === "ad" ? "Ad Gate" : "Pay to Play"}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            {playMode === "pay" && (
              <div>
                <Label>Price (₹) — type any amount</Label>
                <div className="flex gap-2 mb-2">
                  {[20,30,50,100].map(p => (
                    <button key={p} type="button" onClick={() => setPrice(p)}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all
                        ${price === p ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-100 text-gray-400"}`}>
                      ₹{p}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">₹</span>
                  <input type="number" value={price} min={1} max={9999}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full h-10 pl-7 pr-3 rounded-xl border-2 border-amber-300 text-sm font-bold text-amber-700 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
              </div>
            )}

            {/* Order */}
            <div>
              <Label>Display Order</Label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setOrder(o => Math.max(1, o - 1))}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500">
                  <ArrowUp size={14} />
                </button>
                <input type="number" value={order} min={1}
                  onChange={e => setOrder(Number(e.target.value))}
                  className="w-16 h-9 rounded-xl border border-gray-200 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                <button type="button" onClick={() => setOrder(o => o + 1)}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500">
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
          </>}

          {/* ── SOURCE TAB ────────────────────────────────────────────── */}
          {tab === "source" && <>
            <Label>How to add the game</Label>

            <div className="grid grid-cols-2 gap-2">
              {([
                { id: "library" as SourceType, icon: <Star size={15} />,   label: "Game Library",  sub: "Built-in & community" },
                { id: "url"     as SourceType, icon: <Link2 size={15} />,  label: "Game URL",      sub: "Paste any link" },
                { id: "embed"   as SourceType, icon: <Code2 size={15} />,  label: "Embed Code",    sub: "HTML / iframe" },
                { id: "upload"  as SourceType, icon: <Upload size={15} />, label: "Upload Files",  sub: "ZIP with index.html" },
              ]).map(s => (
                <button key={s.id} type="button" onClick={() => setSourceTab(s.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-xs font-semibold transition-all text-left
                    ${sourceTab === s.id ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                    ${sourceTab === s.id ? "bg-indigo-100" : "bg-gray-100"}`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="font-bold">{s.label}</p>
                    <p className={`font-normal ${sourceTab === s.id ? "text-indigo-400" : "text-gray-300"}`}>{s.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Library */}
            {sourceTab === "library" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={libSearch} onChange={e => setLibSearch(e.target.value)}
                    placeholder="Search games…"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {filteredLib.map(g => (
                    <button key={g.id} type="button" onClick={() => pickLibraryGame(g.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all
                        ${selected === g.id ? "border-indigo-400 bg-indigo-50" : "border-gray-100 hover:border-gray-200 bg-white"}`}>
                      <span className="text-xl shrink-0">{g.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{g.title}</p>
                        <p className="text-xs text-gray-400">{g.desc}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0
                        ${g.audience === "india" ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"}`}>
                        {g.audience === "india" ? "🇮🇳" : "🌐"}
                      </span>
                      {selected === g.id && <Check size={14} className="text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                </div>
                {selected && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-xs text-green-700 flex items-center gap-2">
                    <Check size={14} />
                    <span><strong>{LIBRARY_GAMES.find(g => g.id === selected)?.title}</strong> selected — go to Details & Settings then save.</span>
                  </div>
                )}
              </div>
            )}

            {/* URL */}
            {sourceTab === "url" && (
              <div className="space-y-3">
                <div>
                  <Label>Game URL</Label>
                  <input value={url} onChange={e => setUrl(e.target.value)}
                    placeholder="https://game-site.com/play/my-game"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  <p className="text-[10px] text-gray-400 mt-1">Loads inside a secure iframe on the Fun Zone page.</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-3 text-xs text-blue-700 space-y-1">
                  <p className="font-bold">✅ Works great with:</p>
                  <p>itch.io · GameDistribution · CrazyGames · Poki · any iframe-embeddable site</p>
                </div>
              </div>
            )}

            {/* Embed */}
            {sourceTab === "embed" && (
              <div className="space-y-3">
                <div>
                  <Label>Embed / HTML Code</Label>
                  <textarea value={embedCode} onChange={e => setEmbedCode(e.target.value)} rows={4}
                    placeholder={'<iframe src="https://..." width="100%" height="600"></iframe>'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  <p className="text-[10px] text-gray-400 mt-1">Paste the full &lt;iframe&gt; or &lt;script&gt; embed code from the game provider.</p>
                </div>
                <div className="bg-violet-50 rounded-2xl p-3 text-xs text-violet-700">
                  <p className="font-bold mb-1">💡 Where to get embed code</p>
                  <p>GameDistribution, Poki SDK, and most HTML5 game platforms offer a ready-made embed snippet in their publisher dashboard.</p>
                </div>
              </div>
            )}

            {/* Upload */}
            {sourceTab === "upload" && (
              <div className="space-y-3">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  className="hidden"
                  onChange={onFileChange}
                />

                {/* Drop zone */}
                {uploadStatus !== "done" && (
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={onDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 transition-colors cursor-pointer
                      ${isDragOver
                        ? "border-indigo-500 bg-indigo-100"
                        : uploadStatus === "uploading"
                          ? "border-indigo-300 bg-indigo-50 opacity-75 pointer-events-none"
                          : "border-indigo-300 bg-indigo-50 hover:border-indigo-400 hover:bg-indigo-100"
                      }`}
                    onClick={() => uploadStatus !== "uploading" && fileInputRef.current?.click()}
                  >
                    {uploadStatus === "uploading" ? (
                      <>
                        <Loader2 size={24} className="text-indigo-400 animate-spin" />
                        <p className="text-sm font-bold text-indigo-700">Uploading {uploadName}…</p>
                        <p className="text-xs text-indigo-400">Extracting and saving — please wait</p>
                      </>
                    ) : uploadStatus === "error" ? (
                      <>
                        <AlertCircle size={24} className="text-red-400" />
                        <p className="text-sm font-bold text-red-600">Upload failed</p>
                        <p className="text-xs text-red-400 text-center">{uploadError}</p>
                        <button type="button"
                          onClick={e => { e.stopPropagation(); setUploadStatus("idle"); setUploadError(""); fileInputRef.current?.click(); }}
                          className="mt-1 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors">
                          Try again
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-indigo-400" />
                        <p className="text-sm font-bold text-indigo-700">
                          {isDragOver ? "Drop ZIP here!" : "Drop game ZIP here"}
                        </p>
                        <p className="text-xs text-indigo-400">index.html must be at root — max 50 MB</p>
                        <button type="button"
                          onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors">
                          <FolderOpen size={13} />
                          Browse files
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Success state */}
                {uploadStatus === "done" && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-green-700">Game uploaded!</p>
                        <p className="text-xs text-green-500 break-all">{uploadName}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-2 border border-green-100">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Game URL</p>
                      <p className="text-xs text-gray-600 font-mono break-all">{uploadedUrl}</p>
                    </div>
                    <button type="button"
                      onClick={() => { setUploadStatus("idle"); setUploadedUrl(""); setUrl("https://"); fileInputRef.current?.click(); }}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-green-200 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors">
                      <Upload size={13} />
                      Replace with different ZIP
                    </button>
                  </div>
                )}

                <div className="bg-amber-50 rounded-2xl p-3 text-xs text-amber-700 space-y-1">
                  <p className="font-bold">📦 Requirements:</p>
                  <p>• ZIP must contain <code className="bg-amber-100 px-1 rounded">index.html</code> at root</p>
                  <p>• Max 50 MB · HTML5 / Phaser / Three.js / Canvas games</p>
                </div>
              </div>
            )}
          </>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={handleSave} disabled={saving || !title.trim()}
            className="w-full h-11 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {saving
              ? <Loader2 size={15} className="animate-spin" />
              : <Check size={15} />
            }
            {isEdit ? "Save Changes" : "Add to Section"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Game Row ─────────────────────────────────────────────────────────── */
function GameRow({
  game, onEdit, onDelete, onToggle,
}: {
  game: GameListing;
  onEdit: (g: GameListing) => void;
  onDelete: (g: GameListing) => void;
  onToggle: (g: GameListing) => void;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all
      ${game.published ? "bg-white border-gray-100" : "bg-gray-50 border-gray-100 opacity-55"}`}>
      <GripVertical size={16} className="text-gray-300 shrink-0 cursor-grab" />
      <span className="text-xl shrink-0">{game.emoji || "🎮"}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-900 truncate">{game.title}</span>
        </div>
        <span className={`inline-flex mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PLAY_MODE_STYLE[game.playMode]}`}>
          {PLAY_MODE_LABEL[game.playMode]}{game.playMode === "pay" && game.price ? ` ₹${game.price}` : ""}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button type="button" onClick={() => onToggle(game)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors
            ${game.published ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
          {game.published ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button type="button" onClick={() => onEdit(game)}
          className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
          <Pencil size={13} />
        </button>
        <button type="button" onClick={() => onDelete(game)}
          className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ── Section Panel ────────────────────────────────────────────────────── */
function GameSection({
  emoji, title, color, games,
  onEdit, onDelete, onToggle, onAdd,
}: {
  emoji: string; title: string; color: string;
  games: GameListing[];
  onEdit: (g: GameListing) => void;
  onDelete: (g: GameListing) => void;
  onToggle: (g: GameListing) => void;
  onAdd: () => void;
}) {
  const visible = games.filter(g => g.published).length;
  return (
    <div className="rounded-3xl border-2 overflow-hidden" style={{ borderColor: color + "40" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ background: color + "12" }}>
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{emoji}</span>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{title}</h3>
            <p className="text-xs text-gray-500">{visible}/{games.length} visible</p>
          </div>
        </div>
        <button type="button" onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-white"
          style={{ background: color }}>
          <Plus size={13} />Add Game
        </button>
      </div>
      <div className="p-3 space-y-2">
        {games.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            No games yet — click Add Game to start
          </div>
        ) : (
          games
            .slice()
            .sort((a, b) => a.order - b.order)
            .map(g => (
              <GameRow key={g.id} game={g}
                onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
            ))
        )}
      </div>
    </div>
  );
}

/* ── Main Tab ─────────────────────────────────────────────────────────── */
export default function GameListingsTab({ token }: { token: string }) {
  const [items,    setItems]    = useState<GameListing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [drawer,   setDrawer]   = useState<DrawerMode>(null);
  const [editing,  setEditing]  = useState<GameListing | null>(null);
  const [addAud,   setAddAud]   = useState<"india" | "intl" | "all">("india");
  const [saving,   setSaving]   = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/game-listings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((d: GameListing[]) => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function toast(ok: boolean, text: string) {
    setFeedback({ ok, text });
    setTimeout(() => setFeedback(null), 3200);
  }

  function openAdd(aud: "india" | "intl" | "all") {
    setAddAud(aud); setEditing(null); setDrawer("add");
  }
  function openEdit(game: GameListing) {
    setEditing(game); setDrawer("edit");
  }
  function closeDrawer() { setDrawer(null); setEditing(null); }

  async function handleSave(data: Omit<GameListing, "id" | "createdAt">) {
    if (!data.title.trim()) { toast(false, "Title is required."); return; }
    setSaving(true);
    const isNew = drawer === "add";
    const url   = isNew ? "/api/admin/game-listings" : `/api/admin/game-listings/${editing!.id}`;
    const res   = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      toast(true, isNew ? "Game added." : "Game updated.");
      closeDrawer(); load();
    } else {
      toast(false, "Save failed. Please try again.");
    }
  }

  async function handleDelete(game: GameListing) {
    if (!confirm(`Remove "${game.title}"?`)) return;
    const res = await fetch(`/api/admin/game-listings/${game.id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { toast(true, "Removed."); load(); }
    else toast(false, "Delete failed.");
  }

  async function handleToggle(game: GameListing) {
    const res = await fetch(`/api/admin/game-listings/${game.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...game, published: !game.published }),
    });
    if (res.ok) load();
  }

  const india = items.filter(g => g.audience === "india");
  const intl  = items.filter(g => g.audience === "intl");
  const all   = items.filter(g => g.audience === "all");

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Game Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} game{items.length !== 1 ? "s" : ""} · Manage external games shown in Joy Zone
          </p>
        </div>
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2
              ${feedback.ok
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"}`}>
            {feedback.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Indian Games */}
          <GameSection
            emoji="🇮🇳" title="Indian Games" color="#f97316"
            games={india}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onAdd={() => openAdd("india")}
          />

          {/* International Games */}
          <GameSection
            emoji="🌐" title="International Games" color="#6366f1"
            games={intl}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onAdd={() => openAdd("intl")}
          />

          {/* All Audiences */}
          {all.length > 0 && (
            <GameSection
              emoji="🌍" title="For Everyone" color="#10b981"
              games={all}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onAdd={() => openAdd("all")}
            />
          )}

          {/* Empty state */}
          {items.length === 0 && (
            <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
              <Gamepad2 size={48} className="mx-auto mb-4 text-muted-foreground/40" />
              <p className="font-semibold mb-1">No external games yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Add games from the library, a URL, embed code, or upload your own HTML5 game.
              </p>
              <button type="button" onClick={() => openAdd("india")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Plus size={15} />Add First Game
              </button>
            </div>
          )}
        </div>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {drawer && (
          <GameDrawer
            game={editing}
            mode={drawer}
            defaultAudience={addAud}
            totalInSection={
              addAud === "india" ? india.length
              : addAud === "intl" ? intl.length
              : all.length
            }
            saving={saving}
            onClose={closeDrawer}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
