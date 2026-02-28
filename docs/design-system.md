# 🎨 Design System — CleanMadurai.AI

> Colors, typography, components, and animation specifications.

---

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Color System](#color-system)
- [Typography](#typography)
- [Glassmorphism System](#glassmorphism-system)
- [Component Library](#component-library)
- [Animation Catalog](#animation-catalog)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Icon System](#icon-system)

---

## Design Philosophy

CleanMadurai.AI follows a **Linear/Vercel/Raycast** dark-mode aesthetic — premium, minimal, and classy.

### Core Principles
- **Dark-First**: Deep midnight backgrounds with vibrant emerald accents
- **Glassmorphism**: Frosted glass cards with border glow on hover
- **Depth Through Motion**: Nothing is static; everything breathes
- **Information Density**: Data-rich dashboards without visual clutter
- **Accessibility**: WCAG AA contrast ratios on all text

---

## Color System

### CSS Custom Properties

```css
:root {
    /* ── Backgrounds ── */
    --c-midnight:         #0B0F19;     /* Primary background */
    --c-midnight-light:   #161b22;     /* Card/panel surface */
    --c-midnight-lighter: #1c2333;     /* Elevated surface */

    /* ── Accents ── */
    --c-emerald:          #0DF39A;     /* Primary accent (CTAs, success) */
    --c-emerald-dim:      rgba(13, 243, 154, 0.15);  /* Subtle highlight */
    --c-saffron:          #FFB703;     /* Warning, India accent */
    --c-rose:             #F43F5E;     /* Danger, critical */

    /* ── Neutrals ── */
    --c-gray-300:         #D1D5DB;     /* Light text */
    --c-gray-400:         #9CA3AF;     /* Secondary text */
    --c-gray-500:         #6B7280;     /* Muted text */

    /* ── Glass Effect ── */
    --glass-bg:           rgba(22, 27, 34, 0.6);      /* Panel fill */
    --glass-border:       rgba(255, 255, 255, 0.08);  /* Panel border */
    --glass-blur:         blur(16px);                  /* Backdrop blur */
}
```

### Color Palette Visual

```
┌─────────────────────────────────────────────────────────────┐
│  BACKGROUNDS                                                │
│  ██████ #0B0F19  midnight         (base background)        │
│  ██████ #161B22  midnight-light   (cards, panels)          │
│  ██████ #1C2333  midnight-lighter (elevated surfaces)      │
│                                                             │
│  ACCENTS                                                    │
│  ██████ #0DF39A  emerald          (primary CTA, success)   │
│  ██████ #FFB703  saffron          (warnings, India flag)   │
│  ██████ #F43F5E  rose             (danger, critical)       │
│                                                             │
│  NEUTRALS                                                   │
│  ██████ #D1D5DB  gray-300         (primary text)           │
│  ██████ #9CA3AF  gray-400         (secondary text)         │
│  ██████ #6B7280  gray-500         (muted/disabled)         │
└─────────────────────────────────────────────────────────────┘
```

### Semantic Color Usage

| Context | Color | Token |
|---------|-------|-------|
| Primary buttons, success states | Emerald | `--c-emerald` |
| Background, page base | Deep navy | `--c-midnight` |
| Card surfaces | Slightly lighter navy | `--c-midnight-light` |
| Warning badges, KPI trends | Saffron | `--c-saffron` |
| Error states, critical priority | Rose | `--c-rose` |
| Body text | Light gray | `--c-gray-300` |
| Labels, secondary text | Medium gray | `--c-gray-400` |
| Disabled/muted | Dark gray | `--c-gray-500` |

### Badge Color Mapping

| Badge Type | Value | Color |
|------------|-------|-------|
| **Priority** | Critical | 🔴 Rose (#F43F5E) |
| **Priority** | High | 🟠 Orange (#F97316) |
| **Priority** | Medium | 🟡 Yellow (#EAB308) |
| **Priority** | Low | 🟢 Emerald (#0DF39A) |
| **Status** | Pending | ⚪ Gray (#6B7280) |
| **Status** | Dispatched | 🔵 Blue (#3B82F6) |
| **Status** | In Progress | 🟡 Yellow (#EAB308) |
| **Status** | Resolved | 🟢 Emerald (#0DF39A) |
| **Status** | Escalated | 🔴 Rose (#F43F5E) |
| **Party** | DMK | 🔴 Red |
| **Party** | ADMK | 🟢 Green |
| **Party** | BJP | 🟠 Saffron |

---

## Typography

### Font Stack

```css
/* Display headings */
h1, h2, h3, h4, h5, h6, .font-display {
    font-family: 'Outfit', 'Inter', system-ui, sans-serif;
}

/* Body text */
body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Tamil language */
.tamil {
    font-family: 'Noto Sans Tamil', sans-serif;
}
```

### Type Scale

| Element | Font | Weight | Size | Usage |
|---------|------|--------|------|-------|
| Hero Title | Outfit | 800 | 4rem+ | "Transforming Madurai." |
| Page Title | Outfit | 700 | 2rem | "Track Complaint" |
| Section Title | Outfit | 600 | 1.5rem | "Live Control Center" |
| KPI Numbers | Outfit | 700 | 2.5rem | "1,204" |
| Body Text | Inter | 400 | 1rem | Paragraphs, descriptions |
| Labels | Inter | 500 | 0.875rem | Form labels, captions |
| Small/Meta | Inter | 400 | 0.75rem | Timestamps, helper text |

---

## Glassmorphism System

### Glass Panel

```css
.glass-panel {
    background: var(--glass-bg);         /* rgba(22, 27, 34, 0.6) */
    border: 1px solid var(--glass-border); /* rgba(255, 255, 255, 0.08) */
    backdrop-filter: var(--glass-blur);    /* blur(16px) */
    border-radius: 12px;
}

.glass-panel:hover {
    border-color: rgba(13, 243, 154, 0.2);  /* Emerald glow on hover */
    box-shadow: 0 0 20px rgba(13, 243, 154, 0.05);
}
```

### Glass Card Variants

| Variant | Background | Border | Effect |
|---------|-----------|--------|--------|
| Default | 60% opacity | 8% white | Subtle frost |
| Hover | 60% opacity | 20% emerald | Emerald glow border |
| Active | 70% opacity | 30% emerald | Strong glow + shadow |
| KPI Card | 50% opacity | 10% white | Extra transparent |

---

## Component Library

### Buttons

| Variant | Background | Text | Border | Hover Effect |
|---------|-----------|------|--------|--------------|
| **Primary** | `--c-emerald` | `--c-midnight` | transparent | scale(1.05) + shadow glow |
| **Secondary** | transparent | `--c-emerald` | emerald/40 | bg emerald/10 |
| **Ghost** | transparent | `--c-gray-400` | none | text brightens |
| **Danger** | `--c-rose` | white | transparent | scale(1.05) |

### Form Inputs

```css
input, textarea, select {
    background: var(--c-midnight-light);
    border: 1px solid var(--glass-border);
    color: white;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    transition: border-color 0.2s;
}

input:focus {
    border-color: var(--c-emerald);
    outline: none;
    box-shadow: 0 0 0 3px var(--c-emerald-dim);
}
```

### Tables

```css
table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

th {
    background: var(--c-midnight-lighter);
    color: var(--c-gray-400);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
}

tr:hover td {
    background: rgba(255, 255, 255, 0.02);
}
```

---

## Animation Catalog

### GSAP Animations

| Element | Animation | Duration | Ease | Trigger |
|---------|-----------|----------|------|---------|
| Hero background | Radial gradient rotate | 20s loop | linear | On mount |
| Floating particles | y: 100vh → 0, parallax | 1-2s | power2.out | On mount |
| Title text | Clip-path polygon wipe | 0.8s | power3.out | On mount (delayed 0.5s) |
| Subtitle | Gradient text reveal | 0.6s | power2.out | After title |
| KPI numbers | Count up 0 → value | 2s | power1.out | ScrollTrigger (enter) |
| Card entrance | y: 50 → 0, opacity 0 → 1 | 0.6s | back.out(1.7) | ScrollTrigger (stagger) |
| Map overlay | scaleY: 1 → 0 | Scrub | none | ScrollTrigger (scrub) |
| Stats bars | scaleX: 0 → 1 | 1.5s | power2.out | ScrollTrigger (enter) |
| Page transition | opacity + translateY | 0.3s | power2.inOut | Route change |
| Navbar blur | Opacity 0 → 1 | 0.3s | ease | Scroll > 20px |
| Podium entrance | scale + glow | 0.8s | back.out(2) | ScrollTrigger (stagger) |

### CSS Animations

```css
/* Shimmer loading skeleton */
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
.skeleton {
    background: linear-gradient(90deg,
        var(--c-midnight-light) 25%,
        var(--c-midnight-lighter) 50%,
        var(--c-midnight-light) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

/* Typing indicator (chatbot) */
@keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
}
.typing-dot {
    animation: bounce 1.4s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

/* Button hover glow */
.btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(13, 243, 154, 0.3);
}

/* Card hover glow */
.glass-panel:hover {
    transform: scale(1.02);
    border-color: rgba(13, 243, 154, 0.2);
}
```

### ScrollTrigger Configuration

```javascript
// Standard entrance animation
gsap.from(element, {
    scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
    },
    y: 50,
    opacity: 0,
    duration: 0.6,
    ease: 'back.out(1.7)'
});

// Parallax effect
gsap.to(background, {
    scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: true
    },
    y: '50%'
});
```

---

## Responsive Breakpoints

| Breakpoint | Width | Target |
|-----------|-------|--------|
| **Mobile** | < 640px | Phones (portrait) |
| **Tablet** | 640px – 1024px | Tablets (portrait/landscape) |
| **Desktop** | 1024px – 1280px | Laptops |
| **Wide** | > 1280px | Desktop monitors |

### Key Responsive Behaviors

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Navbar | Hamburger + full-screen drawer | Hamburger | Inline links |
| KPI Cards | 1 column stack | 2 columns | 4 columns |
| Admin Layout | No sidebar, stacked | Collapsed sidebar | Full sidebar |
| Map | Full-width, 300px | Full-width, 400px | Contained, 500px |
| Tables | Horizontal scroll | Responsive | Full width |
| Buttons | Full width | Auto width | Auto width |

---

## Icon System

**Library:** Lucide React (tree-shakeable)

### Commonly Used Icons

| Icon | Component | Usage |
|------|-----------|-------|
| `Leaf` | Navbar logo | Brand icon |
| `TriangleAlert` | Landing CTA | Report issue |
| `ArrowRight` | Buttons | Navigation CTAs |
| `ShieldCheck` | Landing features | Security/trust |
| `Truck` | Admin dispatch | LCV vehicle |
| `TrendingUp` | KPI cards | Positive trends |
| `Activity` | KPI cards | Active metrics |
| `BarChart2` | Analytics | Chart icon |
| `Users` | Admin users | User management |
| `AlertTriangle` | Dashboard | Complaint alerts |
| `CheckCircle` | Status | Resolved state |
| `Clock` | Dashboard | Response time |
| `MapPin` | Report/Map | Location marker |
| `Menu` / `X` | Navbar | Hamburger toggle |
| `LogIn` / `LogOut` | Auth | Auth actions |
| `Bell` | NotificationBell | Notifications |
| `Send` | Chatbot | Send message |
| `FileDown` | Analytics | CSV export |
| `Map` | Admin | Map view |

### Import Pattern

```jsx
import { Leaf, ArrowRight, ShieldCheck } from 'lucide-react';

// Usage: Icons accept size and className props
<Leaf className="text-[var(--c-emerald)]" size={28} />
```

---

<p align="center">
  <em>See <a href="architecture.md">architecture.md</a> for system design | <a href="files.md">files.md</a> for file reference</em>
</p>
