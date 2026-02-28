# 🏗️ Architecture — CleanMadurai.AI

> **Version**: 3.0 | **Last Updated**: 2026-02-28  
> A comprehensive architectural overview of the CleanMadurai.AI civic-tech platform.

---

## Table of Contents

- [System Overview](#system-overview)
- [High-Level Architecture](#high-level-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Database Schema](#database-schema)
- [Security Model](#security-model)
- [AI Pipeline](#ai-pipeline)
- [Design System](#design-system)

---

## System Overview

CleanMadurai.AI follows a **modern JAMstack architecture** with a React SPA frontend and Supabase BaaS (Backend-as-a-Service) backend. The system is designed for real-time data flow, AI-powered complaint triage, and role-based access control.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Citizen  │  │ Citizen  │  │  Admin   │  │ Citizen  │        │
│  │ (Mobile) │  │(Desktop) │  │(Desktop) │  │ (Tablet) │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       └──────────────┴──────────────┴──────────────┘             │
│                           │                                      │
│                    HTTPS / WSS                                   │
│                           │                                      │
├───────────────────────────┼──────────────────────────────────────┤
│                    FRONTEND SPA                                  │
│  React 19 + Vite 7 + Tailwind CSS v4 + GSAP 3                  │
│  ┌──────────────────────────────────────────┐                   │
│  │  Pages: Landing│Report│Track│Leaderboard │                   │
│  │         Heatmap│Chatbot│Simulator         │                   │
│  │  Admin: Dashboard│Complaints│Users│Wards  │                   │
│  │         Drivers│Analytics│Settings        │                   │
│  └────────────────────┬─────────────────────┘                   │
│                       │                                          │
├───────────────────────┼──────────────────────────────────────────┤
│                 SUPABASE BACKEND                                 │
│  ┌────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐              │
│  │  Auth  │ │PostgreSQL│ │ Storage │ │  Edge    │              │
│  │(OAuth) │ │   (RLS)  │ │ (Files) │ │Functions │              │
│  └────────┘ └──────────┘ └─────────┘ └──────────┘              │
│                                           │                      │
├───────────────────────────────────────────┼──────────────────────┤
│                 EXTERNAL SERVICES          │                      │
│  ┌──────────────────┐  ┌─────────────────┐│                      │
│  │ Google Gemini    │  │ Leaflet + CARTO ││                      │
│  │ 1.5 Pro API     │  │ Map Tiles       ││                      │
│  └──────────────────┘  └─────────────────┘│                      │
└───────────────────────────────────────────┴──────────────────────┘
```

---

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Frontend — React + Vite + GSAP"]
        LP["Landing Page<br/>(Parallax hero, animated KPIs, map)"]
        RP["Report Page<br/>(Multi-step complaint form)"]
        TP["Track Page<br/>(Animated status timeline)"]
        CB["Chatbot<br/>(Gemini AI assistant)"]
        LB["Leaderboard<br/>(Ward rankings + podium)"]
        HM["Heatmap<br/>(Complaint density map)"]
        SM["Simulator<br/>(Swachh score calculator)"]
        AD["Admin Panel<br/>(KPIs, complaints, users, wards, analytics)"]
    end

    subgraph Supabase["☁️ Supabase Backend"]
        AUTH["Supabase Auth<br/>(Email + Google OAuth)"]
        PG["PostgreSQL Database<br/>(complaints, users, wards, analytics)"]
        STORE["Supabase Storage<br/>(Complaint photos, resolution proofs)"]
        EDGE["Edge Functions<br/>(AI triage, auto-assign, analytics cron)"]
        RLS["Row Level Security<br/>(Role-based access)"]
        RT["Realtime<br/>(Live complaint updates)"]
    end

    subgraph External["🔗 External Services"]
        GEMINI["Gemini 1.5 Pro API<br/>(AI triage + chatbot)"]
        MAPS["Leaflet + CARTO Dark Tiles<br/>(Ward map visualization)"]
    end

    Client -->|Auth| AUTH
    Client -->|CRUD + Realtime| PG
    Client -->|Photo uploads| STORE
    EDGE -->|AI calls| GEMINI
    EDGE -->|Triggers| PG
    RLS -->|Protects| PG
    RT -->|Pushes changes| Client
```

---

## Frontend Architecture

### Component Hierarchy

```mermaid
graph TD
    Main["main.jsx<br/>(React.StrictMode + BrowserRouter + Toaster)"]
    App["App.jsx<br/>(Routes + Navbar + Layout)"]
    Nav["Navbar<br/>(Glass blur + mobile drawer)"]
    
    Main --> App
    App --> Nav
    
    subgraph CitizenPages["📄 Citizen Pages"]
        Landing["Landing.jsx"]
        Report["Report.jsx"]
        Track["Track.jsx"]
        Board["Leaderboard.jsx"]
        Heat["Heatmap.jsx"]
        Chat["Chatbot.jsx"]
        Sim["Simulator.jsx"]
        Auth["Auth.jsx"]
    end
    
    subgraph AdminPages["🔒 Admin Panel"]
        AL["AdminLayout.jsx<br/>(Sidebar + Header)"]
        AD["AdminDashboard.jsx"]
        AC["AdminComplaints.jsx"]
        AU["AdminUsers.jsx"]
        AW["AdminWards.jsx"]
        ADR["AdminDrivers.jsx"]
        AA["AdminAnalytics.jsx"]
        AM["AdminMap.jsx"]
    end
    
    subgraph SharedComponents["🧩 Shared Components"]
        WM["WardMap.jsx<br/>(Leaflet)"]
        AG["AuthGateway.jsx"]
        NB["NotificationBell.jsx"]
        BTN["Button.jsx"]
        BADGE["Badge.jsx"]
        GC["GlassCard.jsx"]
    end
    
    App --> CitizenPages
    App -->|AdminGateway| AdminPages
    CitizenPages --> SharedComponents
    AdminPages --> SharedComponents
```

### Routing Architecture

| Route | Component | Guard | Description |
|-------|-----------|-------|-------------|
| `/` | `Landing` | None | Public landing page |
| `/report` | `Report` | `AuthGateway` | Requires login |
| `/track` | `Track` | None | Public complaint tracker |
| `/leaderboard` | `Leaderboard` | None | Public ward rankings |
| `/heatmap` | `Heatmap` | None | Public density map |
| `/chatbot` | `Chatbot` | None | Public AI assistant |
| `/simulator` | `Simulator` | None | Public score calculator |
| `/admin/*` | `AdminLayout` | `AdminGateway` | Admin-only panel |

### State Management

The app uses **React hooks + Supabase client** for state management. There is no global state store (Redux/Zustand) — state is co-located within components and shared through custom hooks:

```
┌──────────────────────────────────────────┐
│              Custom Hooks                 │
│  ┌─────────────┐  ┌──────────────────┐   │
│  │  useAuth()  │  │ useComplaints()  │   │
│  │  - user     │  │ - complaints     │   │
│  │  - profile  │  │ - loading        │   │
│  │  - isAdmin  │  │ - dispatch()     │   │
│  │  - signIn() │  │ - realtime sub   │   │
│  │  - signUp() │  │                  │   │
│  │  - signOut()│  │                  │   │
│  └──────┬──────┘  └────────┬─────────┘   │
│         │                  │              │
│         ▼                  ▼              │
│  ┌──────────────────────────────────┐    │
│  │     Supabase Client (lib/)       │    │
│  │  supabase.js → createClient()    │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

---

## Backend Architecture

### Supabase Services Used

| Service | Purpose | Details |
|---------|---------|---------|
| **Auth** | User authentication | Email/password + Google OAuth, auto-role |
| **PostgreSQL** | Primary database | 7 tables with RLS policies |
| **Storage** | File storage | Complaint photos, resolution proofs |
| **Edge Functions** | Serverless compute | AI triage, daily analytics cron |
| **Realtime** | WebSocket push | Live complaint status updates |
| **RLS** | Access control | Role-based row-level policies |

### Edge Functions

#### 1. `ai-triage` — Complaint Priority Classification

```mermaid
sequenceDiagram
    participant C as Citizen (Frontend)
    participant S as Supabase DB
    participant E as Edge Function
    participant G as Gemini 1.5 Pro

    C->>S: INSERT complaint (type, description, photos)
    C->>E: POST /ai-triage {complaint_id, type, description}
    E->>G: Generate priority classification
    G-->>E: "critical" | "high" | "medium" | "low"
    E->>S: UPDATE complaint SET priority = AI result
    E->>S: INSERT timeline entry (AI triage)
    E-->>C: {priority: "high"}
```

#### 2. `daily-analytics` — Cron Job (Midnight IST)

```mermaid
sequenceDiagram
    participant CRON as Cron Schedule (18:30 UTC)
    participant E as Edge Function
    participant S as Supabase DB

    CRON->>E: Trigger daily-analytics
    E->>S: Fetch today's complaints
    S-->>E: [complaints array]
    E->>E: Aggregate (by type, ward, priority, resolution time)
    E->>S: UPSERT analytics_daily (today's stats)
    E-->>CRON: {ok: true}
```

---

## Data Flow Diagrams

### Complaint Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Citizen submits complaint
    Pending --> Pending: AI triage assigns priority
    Pending --> Dispatched: Admin assigns LCV driver
    Dispatched --> InProgress: Driver begins work
    InProgress --> Resolved: Driver uploads resolution photo
    Pending --> Escalated: >48h without resolution
    Dispatched --> Escalated: >24h without progress
    Resolved --> [*]
    Escalated --> Dispatched: Admin re-dispatches
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant SA as Supabase Auth
    participant DB as PostgreSQL
    participant T as Trigger

    U->>FE: Click Sign Up (Email or Google)
    FE->>SA: signUp() / signInWithOAuth()
    SA->>SA: Create auth.users entry
    SA->>T: AFTER INSERT trigger fires
    T->>DB: Check profiles count
    alt First user ever
        T->>DB: INSERT profile (role = admin_councillor)
    else Subsequent users
        T->>DB: INSERT profile (role = citizen)
    end
    SA-->>FE: Session token
    FE->>DB: Fetch profile (role, display_name)
    FE->>FE: Render based on role
```

### Real-Time Data Flow

```
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│   Admin      │        │   Supabase   │        │   Citizen   │
│  Dashboard   │◄──WSS──┤  Realtime    ├──WSS──►│   Track     │
│              │        │  (complaints)│        │   Page      │
└──────┬───────┘        └──────┬───────┘        └─────────────┘
       │                       │
       │ UPDATE status         │ postgres_changes
       │ = 'dispatched'        │ event: UPDATE
       ▼                       ▼
┌─────────────┐        ┌──────────────┐
│  PostgreSQL │◄───────┤  Timeline    │
│  complaints │        │  Entry       │
└─────────────┘        └──────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--o{ COMPLAINTS : submits
    PROFILES {
        uuid id PK "References auth.users.id"
        text email
        text display_name
        text role "admin_councillor | citizen"
        int ward_id "NULL for citizens"
        text phone
        timestamptz created_at
    }

    COMPLAINTS ||--o{ COMPLAINT_TIMELINE : has
    COMPLAINTS {
        uuid id PK
        uuid user_id FK "Citizen who filed"
        int ward_id FK
        text type "overflowing_bin | bulk_waste | etc"
        text description
        text priority "critical | high | medium | low"
        text status "pending | dispatched | in_progress | resolved | escalated"
        float latitude
        float longitude
        text address
        text_arr photo_urls
        text assigned_lcv
        text resolution_photo_url
        text resolution_notes
        timestamptz created_at
        timestamptz updated_at
        timestamptz resolved_at
    }

    COMPLAINT_TIMELINE {
        uuid id PK
        uuid complaint_id FK
        text status
        text message
        uuid actor_id FK
        timestamptz created_at
    }

    WARDS ||--o{ COMPLAINTS : contains
    WARDS {
        int ward_id PK
        text name
        text zone "North | South | Central | West | East"
        text councillor_name
        text councillor_party
        text councillor_phone
        float center_lat
        float center_lng
        jsonb boundary_polygon
        jsonb scores
    }

    LCV_DRIVERS {
        uuid id PK
        text name
        text phone
        text vehicle_number
        text assigned_zone
        text status "available | dispatched | off_duty"
        timestamptz last_updated
    }

    ANALYTICS_DAILY {
        date report_date PK
        int total_complaints
        int resolved_complaints
        float avg_resolution_hours
        jsonb by_type
        jsonb by_ward
        jsonb by_priority
    }

    APP_CONFIG {
        text key PK
        jsonb value
        timestamptz updated_at
    }
```

### Tables Summary

| Table | Purpose | Rows (Est.) |
|-------|---------|-------------|
| `profiles` | User accounts with roles | ~10K |
| `complaints` | Citizen-reported issues | ~50K |
| `complaint_timeline` | Status change history | ~200K |
| `wards` | 100 Madurai ward data + GeoJSON | 100 |
| `lcv_drivers` | Waste collection driver roster | ~50 |
| `analytics_daily` | Aggregated daily stats | ~365/yr |
| `app_config` | Admin settings key-value store | ~10 |

---

## Security Model

### Row Level Security (RLS) Matrix

| Table | Role | SELECT | INSERT | UPDATE | DELETE |
|-------|------|--------|--------|--------|--------|
| `profiles` | Citizen | Own only | — | Own only | — |
| `profiles` | Admin | All | — | Own only | — |
| `complaints` | Citizen | All | ✅ | Own only | — |
| `complaints` | Admin | All | — | All | All |
| `wards` | Anyone | All | — | — | — |
| `wards` | Admin | All | ✅ | ✅ | ✅ |
| `lcv_drivers` | Admin | All | ✅ | ✅ | ✅ |
| `analytics_daily` | Admin | All | — | — | — |

### Auth Flow
1. **Email/Password** or **Google OAuth** via Supabase Auth
2. **Auto-role assignment**: First user → `admin_councillor`, all others → `citizen`
3. **JWT tokens** in every request, validated server-side by RLS policies
4. **Route guards**: `AuthGateway` (citizen+) and `AdminGateway` (admin only)

---

## AI Pipeline

### Complaint Triage Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Complaint  │────►│  Edge Func   │────►│ Gemini 1.5   │
│   Created    │     │  ai-triage   │     │   Pro API    │
│  type + desc │     │              │     │              │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                     │
                            │◄────────────────────┘
                            │  priority: "critical"
                            ▼
                     ┌──────────────┐
                     │  UPDATE      │
                     │  complaint   │
                     │  + timeline  │
                     └──────────────┘
```

**Priority Classification Rules:**
| Priority | Criteria | Example |
|----------|----------|---------|
| 🔴 **Critical** | Health/safety risk | Dead animal, sewage overflow |
| 🟠 **High** | Heavy public impact | Overflowing bin in market area |
| 🟡 **Medium** | Standard issues | Missed collection, dirty toilet |
| 🟢 **Low** | Minor, non-urgent | Small littering, cosmetic issue |

### Chatbot Architecture
The Gemini-powered chatbot runs client-side using the `@google/generative-ai` SDK. It provides:
- Complaint filing guidance
- FAQ resolution
- Ward information lookup
- Status query assistance

---

## Design System

### Visual Philosophy
- **Linear/Vercel/Raycast** dark-mode aesthetic — premium, minimal, classy
- **Glassmorphism**: Frosted glass cards with subtle border glow on hover
- **Depth through animation**: Nothing is static; everything breathes

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--c-midnight` | `#0B0F19` | Primary background |
| `--c-midnight-light` | `#161B22` | Card backgrounds |
| `--c-midnight-lighter` | `#1C2333` | Elevated surfaces |
| `--c-emerald` | `#0DF39A` | Primary accent (CTAs, success) |
| `--c-saffron` | `#FFB703` | Warning, India accent |
| `--c-rose` | `#F43F5E` | Danger, critical alerts |
| `--glass-bg` | `rgba(22,27,34,0.6)` | Glass panel background |
| `--glass-border` | `rgba(255,255,255,0.08)` | Glass panel border |

### Typography

| Role | Font | Usage |
|------|------|-------|
| **Display** | Outfit | Headings, KPI numbers, nav logo |
| **Body** | Inter | Paragraphs, labels, form text |
| **Tamil** | Noto Sans Tamil | Tamil language toggle |

### Animation Catalog

| Element | Animation | Library |
|---------|-----------|---------|
| Hero background | Radial gradient + slow rotate | CSS + GSAP |
| Floating particles | Rise from bottom, parallax scroll | GSAP ScrollTrigger |
| Title text | Clip-path reveal (bottom→top wipe) | GSAP |
| KPI numbers | Count up from 0 on scroll enter | GSAP `.to()` |
| Cards | Scale(1.02) + border glow on hover | CSS transitions |
| Map overlay | Vertical wipe (scaleY 1→0) | GSAP ScrollTrigger |
| Page transitions | Fade + translateY | GSAP |
| Navbar | Glass blur, auto-hide on scroll | GSAP + useState |
| Skeleton loaders | Shimmer gradient sweep | CSS @keyframes |
| Leaderboard podium | Scale + glow entrance | GSAP stagger |

---

<p align="center">
  <em>For database details, see <a href="database.md">database.md</a> | For file details, see <a href="files.md">files.md</a></em>
</p>
