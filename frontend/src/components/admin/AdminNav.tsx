import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Settings, Navigation, Mail, Paintbrush,
  Home, Heart, Users, BookOpen, MessageSquare, Clock, Star,
  Building2, ShieldCheck, Eye, HeartHandshake, DollarSign, Gamepad2,
  CalendarDays, ShoppingBag, Megaphone, Lock, Image,
  Activity, Globe, GalleryHorizontal, Search, Radio, LayoutTemplate, Menu, UserCheck,
} from "lucide-react";
import { useFontSize, type FontSizeLevel } from "@/hooks/use-font-size";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",             label: "Dashboard",              icon: LayoutDashboard,   group: "Dashboard"        },

  { id: "siteinfo",              label: "Global Settings",        icon: Settings,           group: "Site"             },
  { id: "navigation",            label: "Navbar",                 icon: Navigation,         group: "Site"             },
  { id: "footer",                label: "Footer",                 icon: Mail,               group: "Site"             },
  { id: "theme",                 label: "Theme & Fonts",          icon: Paintbrush,         group: "Site"             },
  { id: "page-builder",          label: "Page Builder",           icon: LayoutTemplate,     group: "Site"             },
  { id: "seo",                   label: "SEO",                    icon: Search,             group: "Site"             },
  { id: "floating-menu",         label: "Floating Menu",          icon: Menu,               group: "Site"             },
  { id: "live-stream",           label: "Live Stream",            icon: Radio,              group: "Site"             },

  { id: "hero",                  label: "Home",                   icon: Home,               group: "Homepage"         },
  { id: "vision",                label: "Vision & Mission",       icon: Heart,              group: "Homepage"         },
  { id: "programs",              label: "Programs",               icon: Users,              group: "Homepage"         },
  { id: "corevalues",            label: "Core Values",            icon: ShieldCheck,        group: "Homepage"         },
  { id: "impact",                label: "Your Impact",            icon: DollarSign,         group: "Homepage"         },
  { id: "timeline",              label: "Timeline",               icon: Clock,              group: "Homepage"         },
  { id: "subscribers",           label: "Newsletter",             icon: Mail,               group: "Homepage"         },
  { id: "ads",                   label: "Ad Banners",             icon: Megaphone,          group: "Homepage"         },

  { id: "donate",                label: "Donate",                 icon: DollarSign,         group: "Pages"            },
  { id: "blog",                  label: "Blog",                   icon: BookOpen,           group: "Pages"            },
  { id: "sahara",                label: "Sahara",                 icon: Building2,          group: "Pages"            },
  { id: "get-involved",          label: "Get Involved",           icon: HeartHandshake,     group: "Pages"            },
  { id: "events",                label: "Events",                 icon: CalendarDays,       group: "Pages"            },
  { id: "fun-zone",              label: "Joy Zone",               icon: Gamepad2,           group: "Pages"            },
  { id: "shop",                  label: "Shop & NEENAS",          icon: ShoppingBag,        group: "Pages"            },
  { id: "team",                  label: "Team Portal",            icon: Lock,               group: "Pages"            },
  { id: "successstories",        label: "Success Stories",        icon: BookOpen,           group: "Pages"            },
  { id: "testimonials",          label: "Testimonials",           icon: MessageSquare,      group: "Pages"            },

  { id: "health-programs",       label: "Health Programs",        icon: Activity,           group: "Content"          },
  { id: "physical-health",       label: "Physical Health",        icon: Activity,           group: "Content"          },
  { id: "mental-health",         label: "Mental Health",          icon: Heart,              group: "Content"          },
  { id: "community-initiatives", label: "Community Initiatives",  icon: Globe,              group: "Content"          },
  { id: "gallery",               label: "Gallery",                icon: GalleryHorizontal,  group: "Content"          },
  { id: "blog-posts-crud",        label: "Blog Posts",             icon: BookOpen,           group: "Content"          },
  { id: "stories-crud",          label: "Stories",                icon: BookOpen,           group: "Content"          },
  { id: "testimonials-crud",     label: "Testimonials (CRUD)",    icon: MessageSquare,      group: "Content"          },
  { id: "values-crud",           label: "Values",                 icon: ShieldCheck,        group: "Content"          },
  { id: "game-listings",         label: "Game Listings",          icon: Image,              group: "Content"          },
  { id: "volunteers",            label: "Volunteers",             icon: Star,               group: "Content"          },
  { id: "volunteer-apps",        label: "Volunteer Applications", icon: UserCheck,          group: "Content"          },
];

const GROUPS = ["Dashboard", "Site", "Homepage", "Pages", "Content"];

interface AdminNavProps {
  onItemClick?: () => void;
}

const FONT_LEVELS: { level: FontSizeLevel; label: string; title: string }[] = [
  { level: 0, label: "A",  title: "Normal"  },
  { level: 1, label: "A",  title: "Large"   },
  { level: 2, label: "A",  title: "X-Large" },
  { level: 3, label: "A",  title: "Elderly" },
];

export default function AdminNav({ onItemClick }: AdminNavProps) {
  const [location] = useLocation();
  const { level, paperWhite, setTo, togglePaper } = useFontSize();

  function isActive(id: string) {
    if (id === "dashboard") {
      return location === "/admin" || location === "/admin/" || location === "/admin/dashboard";
    }
    return location === `/admin/${id}`;
  }

  return (
    <nav className="flex flex-col py-4 px-3 gap-0.5 overflow-y-auto flex-1 min-h-0">
      {GROUPS.map((group) => {
        const items = NAV_ITEMS.filter((i) => i.group === group);
        if (!items.length) return null;
        return (
          <div key={group} className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
              {group}
            </p>
            {items.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                href={`/admin/${id}`}
                onClick={onItemClick}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full mb-0.5 min-h-[44px]
                  ${isActive(id)
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <Icon size={15} className="shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>
        );
      })}

      <div className="mt-auto pt-3 border-t border-border space-y-1">
        <div className="px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Text Size</p>
          <div className="flex items-center gap-1 mb-2">
            {FONT_LEVELS.map((fl, i) => (
              <button
                key={fl.level}
                onClick={() => setTo(fl.level)}
                title={fl.title}
                aria-label={fl.title}
                className={`flex-1 h-8 rounded-lg font-bold transition-all border text-center
                  ${level === fl.level
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`}
                style={{ fontSize: i === 0 ? "10px" : i === 1 ? "11px" : i === 2 ? "13px" : "15px" }}
              >
                A
              </button>
            ))}
          </div>
          <button
            onClick={togglePaper}
            aria-label={paperWhite ? "Disable paper white mode" : "Enable paper white mode"}
            className={`w-full flex items-center gap-2 px-3 h-8 rounded-lg border text-xs font-medium transition-all
              ${paperWhite
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
          >
            <BookOpen size={12} />
            <span>Paper White</span>
            <span className={`ml-auto w-7 h-4 rounded-full transition-colors flex items-center px-0.5
              ${paperWhite ? "bg-amber-500" : "bg-muted"}`}>
              <span className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-300
                ${paperWhite ? "translate-x-3" : "translate-x-0"}`} />
            </span>
          </button>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted"
        >
          View Live Site ↗
        </a>
      </div>
    </nav>
  );
}
