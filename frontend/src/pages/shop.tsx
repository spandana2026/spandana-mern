import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ExternalLink, ArrowRight, Leaf, Heart, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

export default function Shop() {
  const [shopUrl, setShopUrl] = useState<string>("");
  const [shopLabel, setShopLabel] = useState("NEENAS Shop");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setShopUrl(d?.nav?.shopUrl ?? "");
        setShopLabel(d?.nav?.shopLabel ?? "NEENAS Shop");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const highlights = [
    { icon: Leaf, label: "Eco-Friendly Products", desc: "Handcrafted and sustainable goods made by our community artisans." },
    { icon: Heart, label: "100% Impact", desc: "Every purchase directly funds Spandana's education, health, and empowerment programs." },
    { icon: Sparkles, label: "Thrift & Upcycled", desc: "Beautifully upcycled fashion and home goods — good for you and the planet." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="pt-24 md:pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-emerald-50 py-20 md:py-32 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <ShoppingBag size={13} />
              NEENAS Shop
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">
              Shop with{" "}
              <span className="text-primary italic">Purpose</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Discover beautiful handcrafted, eco-friendly, and thrift products from NEENAS — our social enterprise. 100% of proceeds support Spandana Care Aid Foundation's programs.
            </p>

            {loading ? (
              <div className="flex justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>
            ) : shopUrl ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <a
                  href={shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-primary text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <ShoppingBag size={22} />
                  Shop Now on {shopLabel}
                  <ExternalLink size={16} />
                </a>
                <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                  <ExternalLink size={10} />
                  Opens in a new tab — hosted on the NEENAS platform
                </p>
              </motion.div>
            ) : (
              <div className="bg-card border border-dashed border-border rounded-2xl py-8 px-6 max-w-md mx-auto">
                <ShoppingBag size={36} className="mx-auto mb-3 text-muted-foreground/40" />
                <p className="font-semibold text-lg mb-1">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  The NEENAS online shop is being set up. Check back soon or contact us for orders.
                </p>
              </div>
            )}
          </motion.div>
        </section>

        {/* Highlights */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-3 gap-6">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <motion.div
                  key={h.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-primary" size={22} />
                  </div>
                  <h3 className="font-bold mb-2">{h.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* About NEENAS */}
        <section className="bg-primary/5 border-y border-primary/10 py-14 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">What is NEENAS?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              NEENAS is the social enterprise arm of Spandana Care Aid Foundation. It provides employment and income to underserved artisans, women entrepreneurs, and community members — channeling all profits back into our foundation's programs.
            </p>
            {shopUrl && (
              <Button asChild className="rounded-full gap-2">
                <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                  Browse Products <ArrowRight size={14} />
                </a>
              </Button>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
