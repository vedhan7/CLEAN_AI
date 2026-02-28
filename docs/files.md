# 📁 File Structure — CleanMadurai.AI

> Complete file-by-file reference for the CleanMadurai.AI codebase.  
> **Total Source Files**: ~40 | **Total Lines**: ~3,000+

---

## Table of Contents

- [Root Files](#root-files)
- [Source Code (`src/`)](#source-code-src)
  - [Entry Points](#entry-points)
  - [Pages](#pages-srcpages)
  - [Admin Panel](#admin-panel-srcadmin)
  - [Components](#components-srccomponents)
  - [Hooks](#hooks-srchooks)
  - [Library](#library-srclib)
  - [Styles](#styles-srcstyles)
  - [Data](#data-srcdata)
- [Supabase Backend](#supabase-backend)
- [Scripts & Utilities](#scripts--utilities)
- [Public Assets](#public-assets)
- [Documentation](#documentation)

---

## Root Files

| File | Size | Description |
|------|------|-------------|
| `index.html` | 314 B | HTML entry point with `<div id="root">` and module script import |
| `package.json` | 812 B | NPM manifest: 12 dependencies + 4 dev dependencies |
| `vite.config.js` | 269 B | Vite config: React plugin + Tailwind CSS v4 plugin + deduplication |
| `.env` | — | Environment variables (Supabase URL + Anon Key) — **gitignored** |
| `.gitignore` | 352 B | Ignore patterns for node_modules, dist, .env, IDE files |
| `PROJECT-ARCHITECTURE.md` | 28 KB | Full project prompt & architecture spec (752 lines) |
| `madurai.kml` | 627 KB | Madurai ward boundaries in KML format (raw GIS data) |
| `kml_convert.cjs` | 2.5 KB | Script to convert KML → GeoJSON — **gitignored** |

---

## Source Code (`src/`)

### Entry Points

#### `src/main.jsx` — Application Bootstrap
```
React.StrictMode → BrowserRouter → Toaster → App
```
- Renders the root React tree into `#root`
- Wraps with `BrowserRouter` for client-side routing
- Adds `react-hot-toast` `Toaster` at `top-right`
- **Lines**: 16 | **Size**: 447 B

#### `src/App.jsx` — Route Definitions
```
Navbar (always visible)
Routes:
  / → Landing
  /report → AuthGateway → Report
  /track → Track
  /leaderboard → Leaderboard
  /heatmap → Heatmap
  /chatbot → Chatbot
  /simulator → Simulator
  /admin/* → AdminGateway → AdminLayout
```
- Defines all application routes
- Wraps protected routes with `AuthGateway` and `AdminGateway`
- Renders persistent `Navbar` above all pages
- **Lines**: 39 | **Size**: 1.5 KB

#### `src/index.css` — CSS Cascade Entry
```css
@import "tailwindcss";
@import "./styles/global.css";
@import "./styles/components.css";
@import "./styles/animations.css";
@import "./styles/responsive.css";
@import "./styles/map-overrides.css";
```
- Tailwind CSS v4 import (JIT engine)
- Cascading imports of custom design system
- **Lines**: 9 | **Size**: 244 B

---

### Pages (`src/pages/`)

| File | Size | Lines | Description |
|------|------|-------|-------------|
| **`Landing.jsx`** | 11.4 KB | 175 | Parallax hero with animated gradient, KPI cards (Active Wards, LCVs Deployed, Resolved, Avg Response), interactive WardMap, Swachh Gap analysis with progress bars, and Call-to-Action section |
| **`Report.jsx`** | 18.3 KB | ~350 | Multi-step report wizard: Step 1 (Location via Leaflet map + GPS), Step 2 (Issue type, description, photo upload), Step 3 (Review & submit). Calls AI triage edge function post-submit |
| **`Track.jsx`** | 10.3 KB | ~200 | Complaint tracker with search-by-ID, animated status timeline (Pending → Dispatched → In Progress → Resolved), real-time status updates via Supabase realtime |
| **`Leaderboard.jsx`** | 8.3 KB | ~160 | Ward rankings table showing all 100 Madurai wards, councillor details (name, party badge, phone), collection efficiency bars, cleanliness scores. Sortable and filterable |
| **`Heatmap.jsx`** | 4.4 KB | ~90 | Leaflet-based complaint density heatmap with ward polygon overlays, category filters, and priority color coding |
| **`Chatbot.jsx`** | 7.0 KB | ~140 | Gemini-powered conversational AI interface with message bubbles, typing indicator, suggested prompts, and message history |
| **`Simulator.jsx`** | 10.4 KB | ~200 | Swachh Survekshan score calculator with interactive sliders for Door-to-Door Collection, Waste Processing, Public Toilet Cleanliness, and more. Real-time score projection |
| **`Auth.jsx`** | 5.7 KB | ~110 | Standalone authentication page with sign-in/sign-up forms, Google OAuth button, and password reset flow |

#### Landing Page Screenshot

![Landing Page — Hero Section](screenshots/landing-hero.png)
*The cinematic parallax hero with animated gradient background and floating particles*

![Landing Page — Live KPIs](screenshots/landing-kpis.png)
*Real-time KPI cards and interactive ward map visualization*

---

### Admin Panel (`src/admin/`)

| File | Size | Lines | Description |
|------|------|-------|-------------|
| **`AdminLayout.jsx`** | 3.8 KB | ~80 | Admin shell with collapsible sidebar navigation, header with user info, and `<Outlet/>` for nested routes |
| **`AdminDashboard.jsx`** | 28.1 KB | 477 | Main dashboard: KPI cards (Citizens, Complaints, Resolution Rate, Avg Time), complaints table with real-time updates, dispatch modal, CSV report generation, broadcast notifications |
| **`AdminComplaints.jsx`** | 12.2 KB | ~230 | Full CRUD complaint manager with filters (status, priority, ward, date range), bulk actions (dispatch, escalate, resolve), individual dispatch modal |
| **`AdminUsers.jsx`** | 5.9 KB | ~120 | User management: citizen list, role display, account status, activity tracking |
| **`AdminWards.jsx`** | 4.9 KB | ~100 | Ward data management: 100 wards with councillor mapping, zone assignment, boundary polygon editing |
| **`AdminDrivers.jsx`** | 7.3 KB | ~140 | LCV driver roster: name, phone, vehicle number, zone, availability toggle (available / dispatched / off_duty) |
| **`AdminAnalytics.jsx`** | 9.1 KB | ~180 | Analytics dashboard with time-series charts, complaint trends, ward comparisons, CSV export functionality |
| **`AdminMap.jsx`** | 1.1 KB | ~25 | Admin-side map view for geographic complaint visualization |

#### Key Admin Functions

```
AdminDashboard.fetchDashboardData()  → Fetches KPIs, complaints, and analytics
AdminDashboard.handleDispatch(e)     → Assigns LCV driver to complaint
AdminDashboard.handleGenerateReport()→ Generates CSV report of complaints
AdminDashboard.handleBroadcast()     → Sends broadcast notifications
```

---

### Components (`src/components/`)

| File | Size | Description |
|------|------|-------------|
| **`Navbar.jsx`** | 6.1 KB | Responsive navigation bar with glass blur effect on scroll, mobile hamburger drawer, auth-aware links (Sign In/Log Out), admin panel link for admins, NotificationBell |
| **`AuthGateway.jsx`** | 3.5 KB | Route guard for citizen+ routes. Shows inline login form if not authenticated. Exports both `AuthGateway` (citizen+) and `AdminGateway` (admin only) |
| **`WardMap.jsx`** | 11.9 KB | Leaflet map component: renders 100 ward polygons from GeoJSON, CARTO dark tiles, color-coded by cleanliness score, hover tooltips with ward info |
| **`NotificationBell.jsx`** | 7.8 KB | Admin notification bell with dropdown panel, unread count badge, real-time notification updates via Supabase subscription |

#### UI Components (`src/components/ui/`)

| File | Size | Description |
|------|------|-------------|
| **`Button.jsx`** | 1.2 KB | Reusable button: variants (primary, secondary, ghost, danger), sizes, loading state, icon support |
| **`Badge.jsx`** | 1.3 KB | Status/priority/party badges with color coding. Supports: status badges (pending, dispatched, resolved), priority badges (critical→red, high→orange, medium→yellow, low→green), party badges (DMK, ADMK, BJP, INC, IND) |
| **`GlassCard.jsx`** | 341 B | Glassmorphism container: frosted glass background, subtle border, backdrop blur |

---

### Hooks (`src/hooks/`)

| File | Size | Description |
|------|------|-------------|
| **`useAuth.js`** | 2.4 KB | Authentication hook: manages user session, profile fetching, sign in/up/out, admin detection. Returns `{ user, profile, loading, signIn, signUp, signOut, isAdmin }` |
| **`useComplaints.js`** | 2.5 KB | Complaints hook: fetches all complaints, subscribes to Supabase Realtime for live INSERT/UPDATE/DELETE changes, provides `dispatchComplaint()` action |

#### Hook API Reference

```javascript
// useAuth() — Authentication State
const { user, profile, loading, signIn, signUp, signOut, isAdmin } = useAuth();

// useComplaints() — Complaint Data + Realtime
const { complaints, loading, dispatchComplaint } = useComplaints();
```

---

### Library (`src/lib/`)

| File | Size | Description |
|------|------|-------------|
| **`supabase.js`** | 342 B | Supabase client initialization using `createClient()` with environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Includes fallback placeholders for development |

---

### Styles (`src/styles/`)

| File | Size | Description |
|------|------|-------------|
| **`global.css`** | 748 B | CSS custom properties (color palette), body defaults, font stacks (Inter body, Outfit display, Noto Sans Tamil) |
| **`components.css`** | 1.1 KB | Glass panel styles, button variants, badge colors, form inputs, table styles |
| **`animations.css`** | 1.3 KB | GSAP keyframe definitions, shimmer loading, entrance animations, micro-interactions |
| **`responsive.css`** | 474 B | Mobile-first breakpoints, responsive grid utilities, touch-optimized spacing |
| **`map-overrides.css`** | 686 B | Leaflet dark-mode overrides: tile filter, popup styling, control styling, zoom button theming |

#### CSS Variable System

```css
:root {
    --c-midnight:        #0B0F19;     /* Primary background */
    --c-midnight-light:  #161b22;     /* Card/panel background */
    --c-midnight-lighter:#1c2333;     /* Elevated surface */
    --c-emerald:         #0DF39A;     /* Primary accent */
    --c-emerald-dim:     rgba(13,243,154,0.15); /* Accent at 15% */
    --c-saffron:         #FFB703;     /* Warning/India accent */
    --c-rose:            #F43F5E;     /* Danger/critical */
    --c-gray-300:        #D1D5DB;     /* Light text */
    --c-gray-400:        #9CA3AF;     /* Medium text */
    --c-gray-500:        #6B7280;     /* Muted text */
    --glass-bg:          rgba(22,27,34,0.6);      /* Glass panel */
    --glass-border:      rgba(255,255,255,0.08);  /* Glass border */
    --glass-blur:        blur(16px);              /* Backdrop blur */
}
```

---

### Data (`src/data/`)

| File | Size | Description |
|------|------|-------------|
| **`councillors.json`** | 42.3 KB | Static reference data for all 100 Madurai ward councillors: ward_id, name, party, phone, zone |

---

## Supabase Backend

### Edge Functions (`supabase/functions/`)

| Function | File | Description |
|----------|------|-------------|
| **`ai-triage`** | `supabase/functions/ai-triage/index.ts` | Accepts complaint data, calls Gemini 1.5 Pro for priority classification (critical/high/medium/low), updates complaint + creates timeline entry |
| **`daily-analytics`** | `supabase/functions/daily-analytics/index.ts` | Cron job at 18:30 UTC (midnight IST). Aggregates daily complaints by type, ward, priority. Calculates avg resolution time. Upserts into `analytics_daily` |

### Migrations (`supabase/migrations/`)

| File | Size | Description |
|------|------|-------------|
| **`20260228000000_initial_schema.sql`** | 9.6 KB | Creates all tables (profiles, complaints, complaint_timeline, wards, lcv_drivers, analytics_daily, app_config), triggers, RLS policies |
| **`add_notifications.sql`** | 2.6 KB | Adds notification table and related triggers for admin alerts |
| **`seed_sample_data.sql`** | 8.3 KB | Sample data for development: mock complaints, users, timeline entries |
| **`seed_wards.sql`** | 13.0 KB | Seeds all 100 Madurai wards with names, zones, councillor data, and coordinates |

---

## Scripts & Utilities

| File | Size | Description |
|------|------|-------------|
| **`scripts/gen_ward_sql.js`** | 2.1 KB | Node.js script to generate SQL INSERT statements from councillors.json + GeoJSON boundary data |
| **`kml_convert.cjs`** | 2.5 KB | CommonJS script to convert Madurai KML boundary data to GeoJSON format. **Gitignored** (one-time use) |

---

## Public Assets

| File | Size | Description |
|------|------|-------------|
| **`public/madurai-wards.geojson`** | 578 KB | GeoJSON boundary polygons for all 100 Madurai wards. Used by `WardMap.jsx` and `Heatmap.jsx` for polygon rendering |

---

## Documentation

| File | Description |
|------|-------------|
| **`README.md`** | Project overview, screenshots, quick start |
| **`docs/architecture.md`** | System architecture, diagrams, data flows |
| **`docs/files.md`** | This file — detailed file reference |
| **`docs/database.md`** | Database schema, RLS policies, migrations |
| **`docs/api-reference.md`** | Edge Functions and hook APIs |
| **`docs/design-system.md`** | Colors, typography, animations |
| **`docs/deployment.md`** | Deployment guide for Vercel + Supabase |
| **`docs/screenshots/`** | Application screenshots (9 files) |

---

## Dependency Graph

```
index.html
  └── src/main.jsx
       └── src/App.jsx
            ├── src/components/Navbar.jsx
            │    ├── src/components/ui/Button.jsx
            │    ├── src/components/NotificationBell.jsx
            │    ├── src/hooks/useAuth.js
            │    └── src/lib/supabase.js
            │
            ├── src/pages/Landing.jsx
            │    ├── src/components/ui/Button.jsx
            │    ├── src/components/ui/GlassCard.jsx
            │    ├── src/components/WardMap.jsx
            │    └── src/hooks/useAuth.js
            │
            ├── src/pages/Report.jsx
            │    ├── src/lib/supabase.js
            │    └── src/hooks/useAuth.js
            │
            ├── src/components/AuthGateway.jsx (guards)
            │
            └── src/admin/AdminLayout.jsx
                 ├── src/admin/AdminDashboard.jsx
                 │    ├── src/components/ui/GlassCard.jsx
                 │    ├── src/components/ui/Badge.jsx
                 │    ├── src/components/ui/Button.jsx
                 │    ├── src/hooks/useAuth.js
                 │    └── src/lib/supabase.js
                 ├── src/admin/AdminComplaints.jsx
                 ├── src/admin/AdminUsers.jsx
                 ├── src/admin/AdminWards.jsx
                 ├── src/admin/AdminDrivers.jsx
                 └── src/admin/AdminAnalytics.jsx
```

---

<p align="center">
  <em>See <a href="architecture.md">architecture.md</a> for system design | <a href="database.md">database.md</a> for schema details</em>
</p>
