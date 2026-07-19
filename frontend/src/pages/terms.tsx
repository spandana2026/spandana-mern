import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

interface PolicyContent {
  title: string;
  lastUpdated: string;
  content: string;
}

function renderContent(raw: string) {
  return raw.split("\n\n").map((block, i) => {
    if (block.startsWith("**") && block.endsWith("**")) {
      return <h3 key={i} className="text-lg font-bold text-foreground mt-6 mb-2">{block.replace(/\*\*/g, "")}</h3>;
    }
    const parts = block.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") ? <strong key={j}>{p.replace(/\*\*/g, "")}</strong> : p
    );
    return <p key={i} className="text-muted-foreground leading-relaxed mb-4">{parts}</p>;
  });
}

export default function TermsOfUse() {
  const [terms, setTerms] = useState<PolicyContent>({
    title: "Terms of Use",
    lastUpdated: "",
    content: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d?.termsOfUse) setTerms(d.termsOfUse); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#0033A0] text-white py-16 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-8">
            <ArrowLeft size={15} /> Back to Home
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-serif font-bold mb-3"
          >
            {terms.title}
          </motion.h1>
          {terms.lastUpdated && (
            <p className="text-white/50 text-sm">Last updated: {terms.lastUpdated}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="prose-spandana"
        >
          {renderContent(terms.content)}
        </motion.div>
      </div>
    </div>
  );
}
