// Auto-extracted from admin.tsx — DashboardTab
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { SectionCard } from "./shared";
import {
  Save, Loader2, Plus, Trash2, Pencil, X, Eye, EyeOff,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Upload, Download, RefreshCw, ExternalLink, Lock, KeyRound,
  UserCheck, UserX, UserPlus, CalendarDays, MapPin, Clock,
  Send, History, Megaphone, Image, Globe, DollarSign, Mail,
  Star, FileText, FolderOpen, UsersRound,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch }   from "@/components/ui/switch";

interface StatusData {
  status: string;
  env: string;
  timestamp: string;
  storage: {
    mongo: {
      configured: boolean;
      connected: boolean;
      mode: "mongodb" | "json-fallback";
      readyState: number;
    };
  };
}

export default function DashboardTab({ token }: { token: string }) {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    fetch("/api/v1/status")
      .then((r) => r.json())
      .then((d: StatusData) => { setStatus(d); setLoadingStatus(false); })
      .catch(() => { setStatusError("Could not reach the API server."); setLoadingStatus(false); });
  }, []);

  const mongo = status?.storage?.mongo;
  const isConnected = !!mongo?.configured && !!mongo?.connected;
  const isFallback = mongo?.mode === "json-fallback";

  return (
    <div className="space-y-6">
      <SectionCard title="System Status">
        {loadingStatus && (
          <p className="text-sm text-gray-500 py-2">Checking status…</p>
        )}
        {statusError && (
          <p className="text-sm text-red-600 py-2">{statusError}</p>
        )}
        {status && (
          <div className="space-y-4">
            {/* DB status */}
            <div className={`rounded-lg border p-4 ${isConnected ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-block w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-amber-400"}`} />
                <span className="font-semibold text-sm">
                  {isConnected ? "MongoDB Connected" : "Dev Mode — JSON File Storage"}
                </span>
              </div>
              {isFallback && (
                <div className="text-xs text-amber-800 space-y-1">
                  <p>{mongo?.configured ? "MONGO_URI is set but the connection could not be established." : "No MONGO_URI is configured."} All data is saved to local JSON files in <code className="bg-amber-100 px-1 rounded">backend/data/</code>.</p>
                  <p className="font-medium mt-2">To connect MongoDB:</p>
                  <ol className="list-decimal list-inside space-y-0.5 pl-1">
                    <li>Set <code className="bg-amber-100 px-1 rounded">MONGO_URI</code> in <code className="bg-amber-100 px-1 rounded">backend/.env</code>.</li>
                    <li>If using MongoDB Atlas, allow-list your server's IP under Network Access.</li>
                    <li>Restart the backend server.</li>
                    <li>Return here — the status badge will turn green.</li>
                  </ol>
                </div>
              )}
              {isConnected && (
                <p className="text-xs text-green-800">MongoDB is connected. All reads/writes use the live database.</p>
              )}
            </div>

            {/* Environment row */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <span><strong>Environment:</strong> {status.env}</span>
              <span><strong>API Status:</strong> {status.status}</span>
              <span><strong>Last checked:</strong> {new Date(status.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Quick Links" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "Site Settings", tab: "siteinfo" },
            { label: "Events", tab: "events" },
            { label: "Gallery", tab: "gallery" },
            { label: "Shop & NEENAS", tab: "shop" },
            { label: "Health Programs", tab: "health-programs" },
            { label: "Footer", tab: "footer" },
          ].map(({ label, tab }) => (
            <button
              key={tab}
              onClick={() => navigate(`/admin/${tab}`)}
              className="text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}



