import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

interface BlogPost {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  published: boolean;
}

const categoryColors: Record<string, string> = {
  Community: "bg-primary/10 text-primary",
  "Mental Health": "bg-purple-100 text-purple-700",
  Empowerment: "bg-emerald-100 text-emerald-700",
  Environment: "bg-green-100 text-green-700",
  "Legal Aid": "bg-amber-100 text-amber-700",
  Health: "bg-red-100 text-red-700",
};

function getCategoryColor(cat: string) {
  return categoryColors[cat] ?? "bg-muted text-muted-foreground";
}

interface BlogPageCms { badge?: string; heading?: string; subheading?: string; }

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cms, setCms] = useState<BlogPageCms>({});

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data: BlogPost[]) => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d?.blogPage) setCms(d.blogPage); })
      .catch(() => {});
  }, []);

  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Header */}
      <section className="pt-32 pb-16 px-6 md:px-12 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/60 mb-3">{cms.badge ?? "Stories & Insights"}</p>
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">{cms.heading ?? "Our Blog"}</h1>
            <p className="text-lg text-white/75 max-w-xl leading-relaxed">
              {cms.subheading ?? "Field notes, impact stories, and conversations about community, health, and the work of building a better society."}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg">No blog posts yet. Check back soon!</p>
          </div>
        )}

        {!loading && featured && (
          <>
            {/* Featured Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-border shadow-sm mb-16 bg-card"
            >
              <div className="aspect-[4/3] md:aspect-auto">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 w-fit ${getCategoryColor(featured.category)}`}>
                  {featured.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 leading-snug">{featured.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                  <span className="flex items-center gap-1.5"><Calendar size={14} />{featured.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} />{featured.readTime}</span>
                </div>
                <Button className="rounded-full w-fit gap-2">Read Story <ArrowRight size={16} /></Button>
              </div>
            </motion.div>

            {/* Post Grid */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-3 gap-8">
                {rest.map((post, i) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6">
                      <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 w-fit ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                      <h3 className="font-serif font-bold text-lg leading-snug mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={12} />{post.date}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{post.readTime}</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
