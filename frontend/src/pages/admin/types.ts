interface BlogPost { id: string; category: string; title: string; excerpt: string; date: string; readTime: string; image: string; published: boolean; }
interface Product { id: string; name: string; price: number; category: string; tag: string; rating: number; reviews: number; desc: string; impact: string; image: string; }
interface ProgramItem { title: string; desc: string; }
/* ── CMS sub-types ─────────────────────────────────────────────────────── */
interface SeoConfig {
  title?: string; description?: string; keywords?: string;
  ogTitle?: string; ogDescription?: string; ogImage?: string;
  canonical?: string; indexable?: boolean; followLinks?: boolean;
  googleVerification?: string;
  pages?: Record<string, { title?: string; description?: string }>;
}
interface SocialLinks { facebook?: string; instagram?: string; twitter?: string; youtube?: string; linkedin?: string; }
interface BrandingConfig { logoUrl?: string; logoUrlWhite?: string; logoScale?: number; logoPosition?: string; tagline?: string; }
interface CampaignWidgetConfig { heading?: string; headingEmphasis?: string; description?: string; goal?: number; current?: number; reachedLabel?: string; buttonLabel?: string; }
interface VolunteerSpotlightConfig { badge?: string; ctaLabel?: string; heading?: string; headingItalic?: string; ctaUrl?: string; }
interface DonatePageConfig {
  heading?: string; subheading?: string; taxNote?: string;
  headingMobile?: string; subheadingMobile?: string;
  intlNote?: string; indianTabLabel?: string; intlTabLabel?: string;
  fcraEnabled?: boolean; geoAutoSwitch?: boolean;
  upiApps?: Record<string, unknown>;
  programs?: Array<{ icon: string; name: string; desc: string; inr: number[]; usd: number[] }>;
  programsIndia?: Array<{ icon: string; name: string; desc: string; inr: number[] }>;
  programsIntl?: Array<{ icon: string; name: string; desc: string; usd: number[] }>;
}
interface FloatingMenuConfig { enabled?: boolean; timerSeconds?: number; }
interface MusicTrack { title: string; artist?: string; url: string; }
export interface AdItem {
  id: string; sponsor: string; headline: string; body: string;
  imageUrl?: string; videoUrl?: string; ctaLabel: string; ctaUrl: string;
  skipTimer: number; enabled: boolean; target?: string; color?: string;
}
interface GameOverride {
  enabled?: boolean; isFree?: boolean; emoji?: string; title?: string; tagline?: string;
  showTo?: string; playMode?: string; priceIndia?: string; priceIntl?: string;
}
interface GameSettingsConfig {
  phonepeUpiId?: string; upiName?: string; upiQrUrl?: string; razorpayLink?: string;
  intlGateways?: Record<string, { link?: string; enabled?: boolean; method?: string; url?: string; note?: string }>;
  mode?: string;
  overrides?: Record<string, GameOverride>; gameOrder?: string[];
  prices?: Record<string, number>; pricesIntl?: Record<string, number>;
  trustTagline?: string; trustBody?: string; refundPolicy?: string; thankyouMsg?: string;
  verifyEnabled?: boolean; verifyCode?: string;
  flashNotes?: Array<Record<string, unknown>>;
  ctaText?: { adSupportMsg?: string; donateBtn?: string };
  bannerEnabled?: boolean; bannerHeading?: string; bannerBody?: string;
  adEnabled?: boolean; adPattern?: string[];
  ads?: AdItem[]; adsIndia?: AdItem[]; adsIntl?: AdItem[];
}
type PageHeroConfig = { badge?: string; heroHeading?: string; heroSub?: string; ctaHeading?: string; ctaDesc?: string; ctaButton1?: string; ctaButton2?: string; };
interface SaharaPageConfig {
  hero?: Record<string, string>; about?: Record<string, string>;
  stats?: Array<{ number?: string; label?: string }>;
  facilities?: Array<{ title?: string; desc?: string }>;
  programs?: Array<{ tag?: string; title?: string; desc?: string }>;
  hours?: Array<{ day?: string; time?: string }>;
  contact?: Record<string, string>; cta?: Record<string, string>;
  facilitiesSection?: Record<string, string>; programsSection?: Record<string, string>;
  visitSection?: Record<string, string>; [key: string]: unknown;
}
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

interface SiteAdItem {
  id: string; enabled?: boolean;
  title?: string; subtitle?: string; image?: string; link?: string;
  videoUrl?: string; bgColor?: string; textColor?: string;
  [key: string]: unknown;
}

export interface SiteSettings {
  hero: { badge: string; title: string; titleItalic: string; description: string; button1: string; button2: string; button1Href?: string; button2Href?: string; useMobileText?: boolean; mobileBadge?: string; mobileTitle?: string; mobileTitleItalic?: string; mobileDescription?: string; mobileTextAlign?: string; mobileButtonLayout?: string; };
  stats: Array<{ number: string; label: string }>;
  vision: { heading: string; content: string };
  mission: { heading: string; content: string };
  centerCaption: string;
  successStories: Array<{ title: string; story: string; name: string; location: string; program: string; image: string }>;
  promoVideoSection: { title: string; subtitle: string; bullets: string[] };
  testimonials: Array<{ quote: string; name: string; location: string; program: string }>;
  newsletter: { title: string; subtitle: string; buttonLabel?: string; successMsg?: string };
  timeline: Array<{ year: string; title: string; desc: string; highlight?: boolean }>;
  trustStrip: Array<{ label: string; sub: string }>;
  volunteers: Array<{ name: string; role: string; years: string; quote: string; hours: string; program: string }>;
  programsSection: {
    title: string; subtitle: string;
    physical: { label: string; title: string; subtitle: string; items: ProgramItem[]; };
    mental: { label: string; title: string; subtitle: string; items: ProgramItem[]; };
  };
  values: string[];
  getInvolved: { title: string; subtitle: string; };
  contact: { email: string; phone: string; address?: string };
  footer: { copyright: string; };
  theme?: { primaryColor: string; headingFont: string; bodyFont: string; textColor?: string; pageBackground?: string; };
  nav?: { links: Array<{ label: string; href: string; enabled?: boolean }>; donateLabel: string; getInvolvedLabel: string; shopLabel: string; shopUrl?: string };
  footerContent?: { brandSubtitle?: string; brandTagline: string; address: string; email: string; phone: string; showAddress?: boolean; showEmail?: boolean; showPhone?: boolean; social: Array<{ label: string; href: string; enabled?: boolean }>; certifications: Array<{ label: string; sub: string; enabled?: boolean }>; useMobileFooter?: boolean; mobileTagline?: string; mobileAddress?: string; mobilePhone?: string; mobileLayout?: string; showAddressMobile?: boolean; showEmailMobile?: boolean; showPhoneMobile?: boolean; showCertsMobile?: boolean; [key: string]: unknown };
  howItWorks?: { badge: string; heading: string; headingItalic: string; steps: Array<{ num: string; title: string; desc: string; color: string }>; buttonLabel: string };
  coreValuesSection?: { badge: string; taglines: string[]; descriptions: string[] };
  timelineSection?: { badge: string; heading: string; headingItalic: string };
  ticker?: { items: string[] };
  impactSection?: { heading: string; headingItalic: string; subtitle: string; note: string; tiers: Array<{ label: string; title: string; desc: string; tag: string; color: string }> };
  visibility?: { hero?: boolean; impactTicker?: boolean; visionMission?: boolean; coreValues?: boolean; testimonials?: boolean; programs?: boolean; impactCalculator?: boolean; volunteerSpotlight?: boolean; campaignWidget?: boolean; newsletter?: boolean; timeline?: boolean; [key: string]: boolean | undefined };
  /* Extended CMS fields */
  seo?: SeoConfig;
  social?: SocialLinks;
  branding?: BrandingConfig;
  promoVideoId?: string;
  campaignWidget?: CampaignWidgetConfig;
  volunteerSpotlight?: VolunteerSpotlightConfig;
  donatePage?: DonatePageConfig;
  upiId?: string; upiName?: string; upiQrUrl?: string;
  razorpayLink?: string; paypalLink?: string; stripeLink?: string; cashfreeLink?: string;
  showRazorpay?: boolean; showCashfree?: boolean; showPaypal?: boolean; showStripe?: boolean;
  bankAccountName?: string; bankAccountNumber?: string; bankIfsc?: string; bankName?: string; bankBranch?: string; swiftCode?: string;
  whatsappGroupLink?: string; whatsappGroupName?: string;
  floating_menu?: FloatingMenuConfig;
  contentProtection?: boolean;
  funZonePage?: FunZonePageConfig;
  gameSettings?: GameSettingsConfig;
  musicEnabled?: boolean; musicPlaylist?: MusicTrack[];
  adsEnabled?: boolean;
  visitorCountEnabled?: boolean;
  visitorCount?: number;
  visitorCountLabel?: string;
  ads?: SiteAdItem[];
  /* Hero images & carousel */
  heroImage?: string; heroImageMobile?: string;
  heroMode?: string; heroCarouselImages?: string[]; heroCarouselInterval?: number; heroCarouselTransition?: string;
  heroVideoUrl?: string; heroVideoFallback?: string;
  heroMobileMode?: string; heroMobileCarouselImages?: string[]; heroMobileCarouselInterval?: number; heroMobileCarouselTransition?: string;
  heroMobileVideoUrl?: string; heroMobileVideoFallback?: string;
  /* Mobile overrides */
  useMobileStats?: boolean; mobileStats?: Array<{ number: string; label: string }>;
  useMobileVision?: boolean;
  mobileVision?: { heading?: string; content?: string };
  mobileMission?: { heading?: string; content?: string };
  physicalHealthSections?: Array<{ label?: string; heading?: string; desc?: string; bullets?: string[]; impact?: string }>;
  mentalHealthSections?: Array<{ label?: string; heading?: string; desc?: string; bullets?: string[]; impact?: string }>;
  privacyPolicy?: { title?: string; lastUpdated?: string; content?: string };
  termsOfUse?: { title?: string; lastUpdated?: string; content?: string };
  sectionOrder?: string[];
  useMobilePrograms?: boolean; mobileProgramsTitle?: string; mobileProgramsSubtitle?: string;
  typography?: { headingWeight?: string; lineSpacing?: string; buttonRadius?: string; };
  heroLayout?: { textPosition?: string; height?: string; paddingTop?: number; paddingBottom?: number; fontScale?: number; };
  saharaPage?: SaharaPageConfig;
  visionPage?: PageHeroConfig;
  successStoriesPage?: PageHeroConfig;
  testimonialsPage?: PageHeroConfig;
  eventsPage?: { badge?: string; heading?: string; headingItalic?: string; subheading?: string; };
  blogPage?: { badge?: string; heading?: string; subheading?: string; };
  physicalHealthHero?: { badge?: string; heading?: string; subtitle?: string; headingMobile?: string; subtitleMobile?: string; ctaHeading?: string; ctaSubtext?: string; };
  mentalHealthHero?: { badge?: string; heading?: string; subtitle?: string; headingMobile?: string; subtitleMobile?: string; ctaHeading?: string; ctaSubtext?: string; };
  volunteerPage?: { heading?: string; subheading?: string; headingMobile?: string; subheadingMobile?: string; intro?: string; introMobile?: string; };
  [key: string]: unknown;
}

type Tab = "blog" | "shop" | "hero" | "vision" | "programs" | "siteinfo" | "seo" | "live-stream" | "testimonials" | "timeline" | "volunteers" | "successstories" | "sahara" | "theme" | "navigation" | "corevalues" | "visionpage" | "storiespage" | "testimonialspage" | "impact" | "subscribers" | "footer" | "team" | "events" | "ads" | "games" | "dashboard" | "physical-health" | "mental-health" | "get-involved" | "donate" | "fun-zone" | "health-programs" | "community-initiatives" | "gallery" | "blog-posts-crud" | "stories-crud" | "testimonials-crud" | "values-crud" | "game-listings" | "page-builder" | "floating-menu" | "music" | "volunteer-apps";


export type Tab = "blog" | "shop" | "hero" | "vision" | "programs" | "siteinfo" | "seo" | "live-stream" | "testimonials" | "timeline" | "volunteers" | "successstories" | "sahara" | "theme" | "navigation" | "corevalues" | "visionpage" | "storiespage" | "testimonialspage" | "impact" | "subscribers" | "footer" | "team" | "events" | "ads" | "games" | "dashboard" | "physical-health" | "mental-health" | "get-involved" | "donate" | "fun-zone" | "health-programs" | "community-initiatives" | "gallery" | "blog-posts-crud" | "stories-crud" | "testimonials-crud" | "values-crud" | "game-listings" | "page-builder" | "floating-menu" | "music" | "volunteer-apps";

export interface SettingsTabProps {
  settings: SiteSettings;
  updateSettings: (path: (string | number)[], val: unknown) => void;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  token: string;
  saving: boolean;
  onSave: () => void;
  showFeedback: (type: "success" | "error", msg: string) => void;
}

export interface TokenTabProps {
  token: string;
}