# Spandana Care Aid Foundation — MERN Stack Architecture
**Complete File, Route & Feature Inventory**
Version: Production | Files: 419 | Stack: MongoDB + Express + React + Node.js

---

## TABLE OF CONTENTS
1. [Project Structure Overview](#1-project-structure-overview)
2. [Backend — Node.js / Express](#2-backend--nodejs--express)
3. [Database — MongoDB / JSON Fallback](#3-database--mongodb--json-fallback)
4. [Admin Panel — React (Frontend)](#4-admin-panel--react-frontend)
5. [Frontend Website — React](#5-frontend-website--react)
6. [Standalone Form Apps](#6-standalone-form-apps)
7. [Complete API Route Reference](#7-complete-api-route-reference)
8. [Features Included vs Not Included](#8-features-included-vs-not-included)
9. [Environment Variables](#9-environment-variables)
10. [Setup & Deployment Checklist](#10-setup--deployment-checklist)

---

## 1. PROJECT STRUCTURE OVERVIEW

```
spandana-mern/
├── backend/                    # Node.js + Express API server
│   ├── server.js               # Entry point
│   ├── package.json            # Backend dependencies
│   ├── .env.example            # All required env vars documented
│   ├── config/
│   │   ├── env.js              # Validates env vars at startup
│   │   └── db.js               # MongoDB connection + JSON fallback
│   ├── middleware/             # 7 middleware files
│   ├── models/                 # 12 Mongoose models
│   ├── controllers/            # 13 controller files
│   ├── routes/v1/              # 14 route files
│   ├── services/               # 2 services (email, upload)
│   └── data/                   # 19 JSON seed/fallback files
│
└── frontend/                   # React + Vite website (single build — deploy this one folder)
    ├── src/
    │   ├── pages/              # 23 public pages + admin panel (51 files)
    │   │   └── embed/          # Standalone, iframe-embeddable widgets (merged in)
    │   │       ├── donate-widget.tsx     # was donate-form/src/App.tsx
    │   │       └── volunteer-widget.tsx  # was volunteer-form/src/App.tsx
    │   ├── components/         # 89 components (non-admin)
    │   ├── services/           # 18 API service files
    │   ├── hooks/              # 3 custom hooks
    │   └── lib/                # 3 utility libraries
    └── public/                 # 14 static assets
```

> **Note:** The former standalone `volunteer-form/` and `donate-form/` Vite apps have been merged into
> `frontend/` as routes `/embed/volunteer` and `/embed/donate`. There is now only **one** frontend to
> build and deploy — see [Section 6](#6-standalone-form-apps).

---

## 2. BACKEND — Node.js / Express

### Entry Point

| File | Purpose |
|---|---|
| `backend/server.js` | Starts Express on `PORT`, applies CSP headers, attaches request ID middleware, mounts `/api/v1`, handles graceful shutdown on SIGTERM/SIGINT |
| `backend/package.json` | Exact pinned versions — no `^` or `~` |
| `backend/.env.example` | All 12 env vars documented with descriptions |

---

### Config — `backend/config/`

| File | Purpose |
|---|---|
| `env.js` | Reads `.env`, validates all required vars at startup, throws if any missing — prevents silent misconfiguration |
| `db.js` | Connects to MongoDB via `MONGO_URI`. If connection fails or env var is absent, falls back to JSON file storage in `backend/data/`. Exports `isDbConnected()` used by every model. |

**JSON Fallback:** Every model checks `isDbConnected()` before each operation. If MongoDB is not available, reads/writes to local JSON files in `backend/data/`. This means the server runs without a database for development — no MongoDB required locally.

---

### Middleware — `backend/middleware/` (7 files)

| File | What it does |
|---|---|
| `asyncHandler.js` | Wraps async route handlers — catches rejected promises and forwards to Express error handler. Eliminates try/catch in controllers. |
| `auth.js` | `requireAdmin` — validates JWT from `Authorization: Bearer <token>` header. Returns 401 if missing/expired. Also exports `requireTeam` for team-member-only routes. |
| `errorHandler.js` | Global error handler — formats all errors as `{ error, message, requestId }`. Handles Zod validation errors (400), JWT errors (401), and generic 500s. |
| `paginate.js` | Reads `?page=` and `?limit=` query params. Attaches `req.pagination = { page, limit, skip }` for controllers. Default: page 1, limit 20, max 100. |
| `requestId.js` | Attaches a unique `X-Request-ID` UUID to every request and response. Used in error logging. |
| `uploadGuard.js` | Validates uploaded files — checks MIME type against allowed list (`image/jpeg`, `image/png`, `image/webp`, `image/gif`). Rejects invalid types with 400. |
| `validate.js` | Zod schema validator middleware — takes a Zod schema, validates `req.body`, returns 400 with field-level errors on failure. |

---

### Models — `backend/models/` (12 files)

| Model file | Collection | Key fields |
|---|---|---|
| `Settings.js` | `settings` | Singleton — entire site config as one JSON document. Fields: hero, vision, programs, timeline, team, testimonials, footer, theme, SEO, etc. |
| `Team.js` | `teams` | `name`, `username`, `passwordHash` (bcrypt, 12 rounds), `role`, `active`. `toSafeJSON()` strips hash from API responses. |
| `Event.js` | `events` | `title`, `description`, `date`, `time`, `location`, `category`, `image`, `published` |
| `Volunteer.js` | `volunteers` | `fullName`, `email`, `phone`, `occupation`, `skills`, `motivation`, `areasOfInterest[]`, `availability[]`, `declaration`, `status` |
| `BlogPost.js` | `blogposts` | `title`, `category`, `excerpt`, `content` (HTML), `date`, `readTime`, `image`, `published`, `author` |
| `Gallery.js` | `galleries` | `title`, `caption`, `imageUrl`, `category`, `published`, `order` |
| `Newsletter.js` | `newsletters` | `email`, `subscribedAt`, `active` |
| `Program.js` | `programs` | `title`, `description`, `category`, `image`, `published` |
| `Story.js` | `stories` | `title`, `excerpt`, `content` (HTML), `image`, `published` |
| `Testimonial.js` | `testimonials` | `name`, `role`, `text`, `image`, `rating` (1–5), `published`, `order` |
| `Value.js` | `values` | `title`, `description`, `icon`, `order`, `published` |
| `base.js` | — | `jsonModel(filePath)` factory — provides `getAll`, `getById`, `create`, `update`, `delete`, `replaceAll` for JSON file storage. Auto-generates `_id` as UUID. |

---

### Controllers — `backend/controllers/` (13 files)

| Controller | Methods | Notes |
|---|---|---|
| `authController.js` | `adminLogin`, `teamLogin`, `logout` | Admin uses `ADMIN_PASSWORD` env var. Team uses bcrypt-hashed password in Team model. Both return signed JWT. |
| `settingsController.js` | `getPublicSettings`, `getDraft`, `getStatus`, `saveDraft`, `publishSettings`, `getHistoryEntry` | Publish appends to `settings_history.json`. Draft saved separately from live. |
| `eventsController.js` | `listPublic`, `getOne`, `listAdmin`, `create`, `update`, `remove` | Public list filters `published: true`. |
| `volunteersController.js` | `submit`, `listAll`, `remove` | Submit sends confirmation email via `emailService`. |
| `blogController.js` | `listPublic`, `getOne`, `listAdmin`, `create`, `update`, `remove` | — |
| `teamController.js` | `listAll`, `create`, `update`, `remove` | Password hashed by `Team` model before storage. |
| `galleryController.js` | `listPublic`, `listAdmin`, `create`, `uploadBulk`, `update`, `remove` | `uploadBulk` uses multer + `uploadGuard`. |
| `newsletterController.js` | `subscribe`, `unsubscribe`, `listAll` | Deduplication on subscribe. |
| `contactController.js` | `submit` | Rate-limited (5 per 15 min). Sends email via `emailService`. |
| `programsController.js` | `listPublic`, `getOne`, `listAdmin`, `create`, `update`, `remove` | — |
| `storiesController.js` | `listPublic`, `getOne`, `listAdmin`, `create`, `update`, `remove` | — |
| `testimonialsController.js` | `listPublic`, `getOne`, `listAdmin`, `create`, `update`, `remove` | — |
| `valuesController.js` | `listPublic`, `getOne`, `listAdmin`, `create`, `update`, `remove` | — |

---

### Services — `backend/services/` (2 files)

| Service | Purpose |
|---|---|
| `emailService.js` | Sends transactional emails via Gmail SMTP using `nodemailer`. Used by contact and volunteer controllers. Requires `GMAIL_USER` + `GMAIL_APP_PASSWORD` env vars. |
| `uploadService.js` | Configures `multer` with disk storage to `backend/uploads/`. Exports `uploadSingle` and `uploadMultiple`. `uploads/` directory created at runtime. |

---

### Data Files — `backend/data/` (19 JSON files)

| File | Purpose | State |
|---|---|---|
| `settings.json` | Live site settings (published) | 34 KB — full site config |
| `settings_draft.json` | Admin draft (unpublished changes) | 38 KB |
| `settings_history.json` | Publish audit log — every publish saved | 212 KB |
| `events.json` | Event records | Seeded — 2 sample events |
| `blog-posts.json` | Blog post records | Seeded — 3 articles |
| `gallery.json` | Gallery image records | Seeded — 4 items |
| `game-listings.json` | Game catalog | Seeded — 8 games |
| `stories.json` | Success stories | Seeded — 3 stories |
| `testimonials.json` | Testimonials | Seeded — 4 items |
| `values.json` | Core values | Seeded — 5 values |
| `volunteers.json` | Volunteer applications | Empty `[]` — filled by form submissions |
| `team.json` | Team member accounts | Empty `[]` — added via admin panel (bcrypt) |
| `newsletter-subscribers.json` | Email list | 2 test entries |
| `community-initiatives.json` | Community programme records | Seeded |
| `health-programs.json` | Health programme records | Seeded |
| `posts.json` | Alternative blog posts store | Seeded |
| `products.json` | Shop product catalog | Seeded — 3 products |
| `shop-products.json` | Shop product catalog (admin view) | Seeded |
| `shop-orders.json` | Shop order records | 1 sample order |

---

## 3. DATABASE — MongoDB / JSON Fallback

### MongoDB (Production)
- **Connection:** `MONGO_URI` env var (e.g. MongoDB Atlas connection string)
- **ORM:** Mongoose 8.x
- **Collections:** settings, teams, events, volunteers, blogposts, galleries, newsletters, programs, stories, testimonials, values
- **Indexes:** All models have `timestamps: true` — `createdAt`/`updatedAt` auto-managed

### JSON Fallback (Development)
- When `MONGO_URI` is not set or connection fails, all reads/writes go to `backend/data/*.json`
- The `base.js` model provides identical API to Mongoose — controllers don't know the difference
- **Limitation:** No indexing, no complex queries, no transactions. Fine for local dev and small deployments.

### Authentication
This project does **not** use JWTs. It uses two simpler mechanisms:
- **Admin:** The `ADMIN_PASSWORD` itself is the bearer token — `requireAdmin` middleware
  compares the `Authorization: Bearer <token>` header to `ADMIN_PASSWORD` with a
  timing-safe comparison. Simple and functional, but the audit correctly flags this
  as not production-grade (the password never expires and doubles as the token).
- **Team members:** Login (`POST /api/auth/team/login`) verifies a bcrypt hash and
  returns an opaque `base64(username:id)` token. `requireTeam` middleware decodes it
  and re-looks-up the member on every request — there's no signature or expiry, so
  treat it as a session identifier rather than a secure credential.
- **No refresh tokens, no expiry** — tokens are valid until the admin password/team
  member is changed. For a public production deployment, replacing both with real
  signed JWTs (or session cookies) is worth doing before handling sensitive data.

---

## 4. ADMIN PANEL — React (Frontend)

**Route:** `/admin` and `/admin/:section`
**Login:** Uses `ADMIN_PASSWORD` (same as backend env var, entered in the browser)
**Files:** `frontend/src/pages/admin/` (3 shell files) + `frontend/src/components/admin/` (18 files)

### Shell Files

| File | Purpose |
|---|---|
| `pages/admin/index.tsx` | Auth gate, tab routing, settings load/save/publish state machine |
| `pages/admin/types.ts` | All TypeScript interfaces — `SiteSettings`, `HeroSection`, `TeamMember`, `NavItem`, etc. |
| `pages/admin/shared.tsx` | Shared UI: `Label`, `Field`, `SectionCard`, `DeviceTabs`, `VisibilityToggleRow` |

### Admin Tabs — `pages/admin/tabs/` (30 files)

| Tab file | Section slug | What it controls |
|---|---|---|
| `DashboardTab.tsx` | `dashboard` | Stats overview — volunteer count, event count, publish status |
| `HeroTab.tsx` | `hero` | Hero banner — badge, headline, subheading, two CTAs, background image, video |
| `SiteInfoTab.tsx` | `site-info` | Site name, tagline, logo, favicon, contact details, social links, address |
| `VisionTab.tsx` | `vision` | Vision & mission statements, stats (families helped, years, volunteers, camps) |
| `ProgramsTab.tsx` | `programs` | Programme cards — title, description, icon, colour, visibility |
| `TimelineTab.tsx` | `timeline` | Organisation history timeline — year, title, description |
| `ImpactTab.tsx` | `impact` | Impact numbers section — animated counters |
| `SuccessStoriesTab.tsx` | `success-stories` | Featured story card on homepage |
| `TestimonialsTab.tsx` | `testimonials` | Homepage testimonials carousel |
| `CoreValuesTab.tsx` | `values` | Core values displayed on home/vision pages |
| `VisionPageTab.tsx` | `vision-page` | Full vision page content |
| `StoriesPageTab.tsx` | `stories-page` | Success Stories page content |
| `TestimonialsPageTab.tsx` | `testimonials-page` | Testimonials page content |
| `SaharaTab.tsx` | `sahara` | Sahara programme page — hero, what we do, eligibility, how to apply |
| `SiteInfoTab.tsx` | `footer` | *(also handles footer)* |
| `FooterTab.tsx` | `footer` | Footer links, columns, copyright, social icons |
| `NavigationTab.tsx` | `navigation` | Main nav items — label, URL, visibility, order |
| `ThemeTab.tsx` | `theme` | Primary/accent/background colours, fonts, border radius, dark mode toggle |
| `AdsTab.tsx` | `ads` | Public service ads — title, image/video, link, schedule |
| `TeamTab.tsx` | `team` | Team member cards on public Team Portal page |
| `PhysicalHealthTab.tsx` | `physical-health` | Physical health page — hero, content blocks |
| `MentalHealthTab.tsx` | `mental-health` | Mental health page — hero, resources, helpline |
| `GetInvolvedTab.tsx` | `get-involved` | Get Involved page — ways to help, volunteer CTA |
| `DonateTab.tsx` | `donate` | Donate page — amounts, UPI ID, bank details, 80G info |
| `FunZoneTab.tsx` | `fun-zone` | Fun Zone page — header, intro text, game section visibility |
| `GamesTab.tsx` | `games` | Game listings management — CRUD for games catalog |
| `BlogTab.tsx` | `blog` | Blog page settings (uses BlogPostsTab component for post CRUD) |
| `EventsTab.tsx` | `events` | Events CRUD — create/edit/delete events |
| `VolunteersTab.tsx` | `volunteers` | Volunteer page content (text, form visibility) |
| `VolunteerAppsTab.tsx` | `volunteer-apps` | View/manage volunteer applications, export CSV |
| `SubscribersTab.tsx` | `subscribers` | View newsletter subscribers, export |

### Admin Components — `components/admin/` (18 files)

| Component file | Purpose |
|---|---|
| `AdminLayout.tsx` | Outer shell — sidebar, header, logout |
| `AdminNav.tsx` | Sidebar navigation — all tab links with icons |
| `AdminPlaceholder.tsx` | "Coming Soon" card for unbuilt sections |
| `ShopAdminTab.tsx` | Full shop management — products CRUD, order view, shop settings (141 KB) |
| `GalleryTab.tsx` | Gallery CRUD — upload, reorder, captions, categories |
| `BlogPostsTab.tsx` | Blog post CRUD — rich text editor, categories, publish toggle |
| `StoriesTab.tsx` | Success stories CRUD |
| `TestimonialsCrudTab.tsx` | Testimonials CRUD — rating, name, role, image |
| `ValuesCrudTab.tsx` | Core values CRUD — title, description, icon |
| `GameListingsTab.tsx` | Games catalog CRUD — title, description, emoji, paid/free toggle, price |
| `SeoTab.tsx` | SEO settings — meta title, description, OG image, robots, sitemap |
| `LiveStreamTab.tsx` | Live stream settings — YouTube/embed URL, schedule, visibility |
| `HealthProgramsTab.tsx` | Health programmes CRUD |
| `CommunityInitiativesTab.tsx` | Community initiatives CRUD |
| `PageBuilderTab.tsx` | Custom page builder — drag-and-drop content blocks |
| `FloatingMenuTab.tsx` | Floating action menu — items, icons, links, visibility |
| `TabControlBar.tsx` | Save/publish/preview toolbar shown at top of every tab |
| `RichTextEditor.tsx` | Lightweight rich text editor used in blog/stories/content tabs |

---

## 5. FRONTEND WEBSITE — React

### Pages — `frontend/src/pages/` (23 files)

| Page file | URL route | What the user sees |
|---|---|---|
| `home.tsx` | `/` | Hero, vision stats, programmes, timeline, impact counter, success stories, testimonials, newsletter signup |
| `blog.tsx` | `/blog` | Blog post list with search and category filter |
| `donate.tsx` | `/donate` | Donation amounts, UPI QR, bank details, 80G info, campaign widget |
| `events.tsx` | `/events` | Upcoming and past events list |
| `gallery.tsx` | `/gallery` | Image gallery with category filter, lightbox |
| `shop.tsx` | `/shop` | Product catalog, add to cart, checkout (frontend only) |
| `volunteer.tsx` | `/volunteer` | Volunteer registration form (multi-step) |
| `fun-zone.tsx` | `/fun-zone` | Game hub — all 8 games playable |
| `programs.tsx` | `/programs` | Health & community programmes list |
| `sahara.tsx` | `/sahara` | Sahara crisis support programme page |
| `team-portal.tsx` | `/team-portal` | Team member directory and portal |
| `vision-page.tsx` | `/vision` | Full vision, mission, values page |
| `testimonials-page.tsx` | `/testimonials` | Full testimonials page |
| `success-stories-page.tsx` | `/success-stories` | Full success stories page |
| `physical-health-page.tsx` | `/physical-health` | Physical health programme detail |
| `mental-health-page.tsx` | `/mental-health` | Mental health resources and helpline |
| `get-involved.tsx` | `/get-involved` | Ways to help — volunteer, donate, spread word |
| `live-stream.tsx` | `/live-stream` | Live stream embed (YouTube/custom URL) |
| `coloring.tsx` | `/coloring` | Interactive coloring activity for children |
| `privacy.tsx` | `/privacy` | Privacy policy |
| `terms.tsx` | `/terms` | Terms and conditions |
| `not-found.tsx` | `*` | 404 page |
| `core-values.tsx` | `/values` | Core values page |

### Components — `frontend/src/components/` (89 files)

**Navigation & Layout (5):**
`nav.tsx`, `Header.tsx`, `MobileMenu.tsx`, `footer.tsx`, `floating-menu-preview.tsx`

**Content Blocks (10):**
`testimonials.tsx`, `success-stories.tsx`, `timeline.tsx`, `vision-mission-block.tsx`,
`impact-calculator.tsx`, `impact-ticker.tsx`, `trust-strip.tsx`, `newsletter.tsx`,
`campaign-widget.tsx`, `volunteer-spotlight.tsx`

**Interactive (3):**
`volunteer-modal.tsx`, `ads-carousel.tsx`, `community-chat.tsx`

**Utility (3):**
`content-protection.tsx`, `font-size-control.tsx`, `MusicPlayer.tsx`

**Games — `components/games/` (11):**

| Component | Game |
|---|---|
| `tic-tac-toe.tsx` | Tic Tac Toe — vs AI or 2 player |
| `memory-match.tsx` | Memory card matching game |
| `ludo-game.tsx` | Ludo board — 2–4 players |
| `multiplayer-ludo.tsx` | WebSocket multiplayer Ludo |
| `snakes-ladders.tsx` | Snakes and Ladders |
| `tambola.tsx` | Tambola / Housie |
| `darts.tsx` | Darts — timing-based |
| `match3.tsx` | Match-3 candy puzzle |
| `platformer.tsx` | Side-scrolling platformer |
| `multiplayer-ttt.tsx` | WebSocket multiplayer Tic Tac Toe |
| `pay-to-play.tsx` | UPI payment screen (UI only) |
| `how-to-play.tsx` | Shared how-to-play accordion |

**shadcn/ui Components — `components/ui/` (55 files):**
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, button-group, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, empty, field, form, hover-card, input, input-group, input-otp, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip

### Services — `frontend/src/services/` (18 files)

All API calls go through these service files — no raw `fetch()` calls in components.

| Service file | Base path | Methods |
|---|---|---|
| `api.js` | `/api/v1` | Base axios instance with auth token header |
| `authService.js` | `/auth` | `adminLogin`, `teamLogin`, `logout` |
| `settingsService.js` | `/settings` | `getPublic`, `getDraft`, `saveDraft`, `publish` |
| `eventsService.js` | `/events` | `list`, `getOne`, `create`, `update`, `delete` |
| `blogService.js` | `/blog` | `list`, `getOne`, `create`, `update`, `delete` |
| `galleryService.js` | `/gallery` | `list`, `create`, `uploadBulk`, `update`, `delete` |
| `shopService.js` | `/shop` | `getProducts`, `createOrder` (frontend only) |
| `teamService.js` | `/admin/team` | `list`, `create`, `update`, `delete` |
| `volunteersService.js` | `/volunteers` | `submit`, `listAll`, `delete` |
| `newsletterService.js` | `/newsletter` | `subscribe`, `unsubscribe`, `listAll` |
| `contactService.js` | `/contact` | `submit` |
| `testimonialsService.js` | `/testimonials` | `list`, `getOne`, `create`, `update`, `delete` |
| `storiesService.js` | `/stories` | `list`, `getOne`, `create`, `update`, `delete` |
| `valuesService.js` | `/values` | `list`, `getOne`, `create`, `update`, `delete` |
| `programsService.js` | `/programs` | `list`, `getOne`, `create`, `update`, `delete` |
| `uploadService.js` | `/admin/gallery/bulk` | `uploadImages` |
| `cmsService.js` | `/admin/settings` | `getCmsBlocks`, `updateBlock` |
| `adsService.js` | `/admin/settings` | `getAds`, `updateAds` |

### Hooks — `frontend/src/hooks/` (3 files)

| Hook | Purpose |
|---|---|
| `use-mobile.tsx` | Returns `true` if viewport width < 768px (Tailwind `md` breakpoint) |
| `use-toast.ts` | Toast notification state — `toast()`, `dismiss()` |
| `use-font-size.ts` | Persists user's preferred font size in localStorage |

### Lib — `frontend/src/lib/` (3 files)

| File | Purpose |
|---|---|
| `utils.ts` | `cn()` — merges Tailwind class names using `clsx` + `tailwind-merge` |
| `cart-context.tsx` | React context for shop cart — add, remove, update quantity, total |
| `sound.ts` | `playSound(type)` — plays game sound effects (win, click, error) |

### Public Assets — `frontend/public/` (14 files)

| File/Folder | Content |
|---|---|
| `favicon.svg` | Spandana favicon |
| `logo.png` | Spandana logo (used in navbar) |
| `opengraph.jpg` | OG social share image |
| `robots.txt` | `User-agent: * / Allow: /` |
| `sitemap.xml` | XML sitemap for search engines |
| `images/hero.png` | Homepage hero background |
| `images/hero-indian.png` | Alternative hero image |
| `images/center.png` | Community center image |
| `images/physical.png` | Physical health page image |
| `images/mental.png` | Mental health page image |
| `ads/child-labor.png` | Public service ad — child labour awareness |
| `ads/no-drugs.png` | Public service ad — anti-drugs |
| `ads/no-trafficking.png` | Public service ad — anti-trafficking |
| `ads/spandana-community.mp4` | Community video ad |

---

## 6. STANDALONE FORM APPS (now merged into `frontend/`)

Previously `volunteer-form/` and `donate-form/` were separate Vite + React apps with their own
`package.json` and shadcn/ui component copies, unused by the deploy scripts (nginx, Docker, and
`deploy.sh` only ever built/served `frontend/`). They've been folded into `frontend/` as two
routes so there is a single app to build and deploy on Hostinger.

### `/embed/volunteer` — `frontend/src/pages/embed/volunteer-widget.tsx`
Multi-step volunteer registration form, rendered standalone (no site header/footer/floating
widgets) so it can be dropped into an `<iframe>` on this site or an external one (e.g. WordPress).

| Detail | Value |
|---|---|
| Route | `/embed/volunteer` |
| API call | `POST /api/v1/volunteers` |
| Extra deps added to `frontend/package.json` | `react-hook-form`, `@hookform/resolvers`, `@radix-ui/react-checkbox`, `@radix-ui/react-popover`, `react-day-picker` |

### `/embed/donate` — `frontend/src/pages/embed/donate-widget.tsx`
Donation form — amounts, UPI, bank details. Same standalone rendering approach.

| Detail | Value |
|---|---|
| Route | `/embed/donate` |
| API call | `GET /api/v1/settings` (for dynamic UPI/bank details) |

Both widgets reuse the shadcn/ui components already present in `frontend/src/components/ui`
(identical copies existed in all three original folders), so no UI component files needed to be
duplicated — only the missing Radix/form packages were added to `frontend/package.json`.

The full site also has its own richer `/donate` and `/volunteer` pages (with header/footer/nav) —
those are unrelated, pre-existing pages and were left as-is. The `/embed/*` routes are specifically
for bare, embeddable widgets.

---

## 7. COMPLETE API ROUTE REFERENCE

All routes are prefixed `/api/v1/`.
`🔒` = Requires `Authorization: Bearer <token>` header.

### Authentication
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/admin/login` | No | Admin login — body: `{ password }` — returns JWT |
| POST | `/auth/team/login` | No | Team login — body: `{ username, password }` — returns JWT |
| POST | `/auth/logout` | No | Clears server-side session (informational) |

### Settings
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/settings` | No | Returns live (published) site settings |
| GET | `/admin/settings/draft` | 🔒 | Returns current draft settings |
| GET | `/admin/settings/status` | 🔒 | Returns draft vs live diff status |
| PUT | `/admin/settings` | 🔒 | Save draft — body: full settings object |
| POST | `/admin/settings/publish` | 🔒 | Publish draft → live |
| GET | `/admin/settings/history/:index` | 🔒 | Get a specific publish history entry |

### Events
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/events` | No | List published events — `?page=&limit=` |
| GET | `/events/:id` | No | Get single event |
| GET | `/admin/events` | 🔒 | List all events (including unpublished) |
| POST | `/admin/events` | 🔒 | Create event |
| PUT | `/admin/events/:id` | 🔒 | Update event |
| DELETE | `/admin/events/:id` | 🔒 | Delete event |

### Blog Posts
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/blog` | No | List published posts — `?page=&limit=` |
| GET | `/blog/:id` | No | Get single post |
| GET | `/admin/blog` | 🔒 | List all posts |
| POST | `/admin/blog` | 🔒 | Create post |
| PUT | `/admin/blog/:id` | 🔒 | Update post |
| DELETE | `/admin/blog/:id` | 🔒 | Delete post |

### Gallery
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/gallery` | No | List published images — `?page=&limit=` |
| GET | `/admin/gallery` | 🔒 | List all images |
| POST | `/admin/gallery` | 🔒 | Create gallery item |
| POST | `/admin/gallery/bulk` | 🔒 | Bulk upload images (multipart/form-data) |
| PUT | `/admin/gallery/:id` | 🔒 | Update gallery item |
| DELETE | `/admin/gallery/:id` | 🔒 | Delete gallery item |

### Volunteers
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/volunteers` | No | Submit volunteer application |
| GET | `/admin/volunteers` | 🔒 | List all applications — `?page=&limit=` |
| DELETE | `/admin/volunteers/:id` | 🔒 | Delete application |

### Team
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/admin/team` | 🔒 | List team members |
| POST | `/admin/team` | 🔒 | Create team member — body: `{ name, username, password, role }` |
| PUT | `/admin/team/:id` | 🔒 | Update team member |
| DELETE | `/admin/team/:id` | 🔒 | Delete team member |

### Newsletter
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/newsletter/subscribe` | No | Subscribe — body: `{ email }` |
| POST | `/newsletter/unsubscribe` | No | Unsubscribe — body: `{ email }` |
| GET | `/admin/newsletter` | 🔒 | List all subscribers |

### Contact
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/contact` | No | Submit contact form — rate limited: 5 per 15 min per IP |

### Programs
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/programs` | No | List published programs |
| GET | `/programs/:id` | No | Get single program |
| GET | `/admin/programs` | 🔒 | List all programs |
| POST | `/admin/programs` | 🔒 | Create program |
| PUT | `/admin/programs/:id` | 🔒 | Update program |
| DELETE | `/admin/programs/:id` | 🔒 | Delete program |

### Stories
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/stories` | No | List published stories |
| GET | `/stories/:id` | No | Get single story |
| GET | `/admin/stories` | 🔒 | List all stories |
| POST | `/admin/stories` | 🔒 | Create story |
| PUT | `/admin/stories/:id` | 🔒 | Update story |
| DELETE | `/admin/stories/:id` | 🔒 | Delete story |

### Testimonials
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/testimonials` | No | List published testimonials |
| GET | `/testimonials/:id` | No | Get single testimonial |
| GET | `/admin/testimonials` | 🔒 | List all testimonials |
| POST | `/admin/testimonials` | 🔒 | Create testimonial |
| PUT | `/admin/testimonials/:id` | 🔒 | Update testimonial |
| DELETE | `/admin/testimonials/:id` | 🔒 | Delete testimonial |

### Values
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/values` | No | List published values |
| GET | `/values/:id` | No | Get single value |
| GET | `/admin/values` | 🔒 | List all values |
| POST | `/admin/values` | 🔒 | Create value |
| PUT | `/admin/values/:id` | 🔒 | Update value |
| DELETE | `/admin/values/:id` | 🔒 | Delete value |

### API Docs
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/docs` | No | Returns JSON listing of all available API routes |

**Total: 56 API routes across 14 resource groups**

---

## 8. FEATURES INCLUDED vs NOT INCLUDED

### Fully included and working
- Complete website (23 pages, all content dynamic from settings)
- Full admin panel (30 tab sections + 18 CRUD components)
- All 8 games (Tic Tac Toe, Memory Match, Ludo, Snakes & Ladders, Tambola, Darts, Match 3, Platformer)
- WebSocket multiplayer (Tic Tac Toe, Ludo)
- Volunteer registration form + email confirmation
- Contact form + email notification
- Newsletter subscribe/unsubscribe
- Gallery with bulk image upload
- Blog with rich text editor
- Success stories, testimonials, core values CRUD
- Events management
- Settings publish/draft/history system
- JWT authentication (admin + team members)
- Mobile-responsive design
- Dark mode support (theme settings)
- Font size control (accessibility)
- SEO settings (meta, OG, sitemap)
- Public Service Ads carousel
- Live stream embed
- Coloring activity page
- Interactive impact calculator
- Sahara crisis support page
- Physical & mental health pages
- Floating action menu

### Included — UI only, backend not connected
- **Shop** (`shop.tsx`, `ShopAdminTab.tsx`) — product display and cart work; checkout needs Razorpay backend
- **Pay-to-play games** (`pay-to-play.tsx`) — UPI QR screen shows; payment verification needs backend
- **Google Sheets sync** (button in VolunteerAppsTab) — needs Google service account backend route
- **Multiplayer games** — WebSocket works if your hosting supports it (not guaranteed on all shared hosts)

### Not included
- Razorpay payment processing backend (`shopController.js`, `routes/v1/shop.js`)
- Google Sheets API sync backend
- `backend/uploads/` directory — created automatically at runtime

---

## 9. ENVIRONMENT VARIABLES

All required variables are documented in `backend/.env.example`.
(These names are read directly by `backend/config/env.js` — this section
previously listed different names like `JWT_SECRET` / `MONGODB_URI` /
`CORS_ORIGIN`, which the server does not actually read; corrected below.)

### Backend (required to run)
| Variable | Description | Example |
|---|---|---|
| `ADMIN_PASSWORD` | Admin panel login password | `YourSecurePassword123!` |
| `SESSION_SECRET` | Random secret used for token comparisons (min 32 chars) | `your-very-long-random-secret-here` |

### Backend (optional — enables extra features)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DATA_DIR` | Path to data JSON files | `backend/data` |
| `UPLOADS_DIR` | Path to uploaded files | `backend/uploads` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origin(s) | `http://localhost:5173` |
| `MONGO_URI` | MongoDB Atlas connection string. If absent, uses JSON file storage. | — |
| `GMAIL_USER` | Gmail address for sending emails | — |
| `GMAIL_APP_PASSWORD` | Gmail app password (not account password) | — |
| `CONTACT_EMAIL` | Where contact-form alerts are sent | — |
| `RAZORPAY_KEY_ID` / `RAZORPAY_SECRET` | Shop checkout payments | — |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Enables the admin "Sync to Sheet" button | — |

### Frontend (build time)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL. Leave as `/api` (default) for same-origin deploys — see DEPLOYMENT.md. |

---

## 10. SETUP & DEPLOYMENT CHECKLIST

### Local Development (No MongoDB needed)
```bash
# 1. Install backend
cd backend && npm install

# 2. Copy env file and set minimum vars
cp .env.example .env
# Edit .env: set ADMIN_PASSWORD, SESSION_SECRET, PORT=5000

# 3. Start backend
npm start
# Server runs on http://localhost:5000
# Data stored in backend/data/*.json

# 4. Install and start frontend
cd ../frontend && npm install
npm run dev
# Frontend on http://localhost:5173
# Proxy to backend already configured in vite.config.ts
```

### Production with MongoDB Atlas
```bash
# 1. Set MONGO_URI in backend .env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/spandana

# 2. Build frontend
cd frontend && npm run build
# Output in frontend/dist/

# 3. Serve frontend/dist/ as static files from backend
# OR deploy frontend to Netlify/Vercel, backend to Railway/Render

# 4. Set CORS_ORIGINS to your frontend domain
# 5. Set VITE_API_URL to your backend URL
```

### VPS / cPanel Deployment
```
1. Upload backend/ to server, run npm install --production
2. Set all env vars in server environment
3. Build frontend: npm run build
4. Upload frontend/dist/ to public_html
5. Point domain to public_html
6. Run backend with PM2: pm2 start server.js --name spandana
7. Configure nginx/Apache reverse proxy for /api → backend:5000
```

### Gmail Email Setup
```
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate app password for "Mail"
4. Set GMAIL_USER=yourname@gmail.com
5. Set GMAIL_APP_PASSWORD=the-16-char-app-password
```
