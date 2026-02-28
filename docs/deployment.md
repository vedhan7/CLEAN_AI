# 🚢 Deployment Guide — CleanMadurai.AI

> Deploy CleanMadurai.AI to production with Vercel/Netlify + Supabase.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Supabase Setup](#supabase-setup)
- [Frontend Deployment](#frontend-deployment)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)

---

## Prerequisites

- **Node.js** 18+ and **npm** 9+
- A **Supabase** account (free tier works)
- A **Google Cloud** account with Gemini API enabled
- A **Vercel** or **Netlify** account (free tier works)
- **Git** repository pushed to GitHub

---

## Supabase Setup

### 1. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** from Settings → API

### 2. Run Database Migrations

Run the SQL files in order:

```bash
# Option A: Using Supabase CLI (recommended)
supabase link --project-ref your-project-ref
supabase db push

# Option B: Manually via SQL Editor
# 1. supabase/migrations/20260228000000_initial_schema.sql
# 2. supabase/migrations/add_notifications.sql
# 3. supabase/migrations/seed_wards.sql
# 4. supabase/migrations/seed_sample_data.sql (optional, for testing)
```

### 3. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Enable **Google OAuth** (optional):
   - Create OAuth credentials in Google Cloud Console
   - Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`
   - Add Client ID and Secret to Supabase

### 4. Create Storage Bucket

1. Go to **Storage** → **New Bucket**
2. Create bucket: `complaints` (public)
3. Add RLS policies:
   - Authenticated users can upload to `complaints/*`
   - Public read access for complaint photos

### 5. Deploy Edge Functions

```bash
# Set secrets
supabase secrets set GEMINI_API_KEY=your-gemini-api-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Deploy functions
supabase functions deploy ai-triage
supabase functions deploy daily-analytics

# Set cron schedule for daily-analytics
# (Configure in supabase dashboard or via CLI)
```

---

## Frontend Deployment

### Option A: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy (follow prompts)
vercel

# 4. Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY

# 5. Production deploy
vercel --prod
```

**Vercel Configuration:**
| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 18.x |

### Option B: Netlify

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Init project
netlify init

# 4. Deploy
netlify deploy --prod --dir=dist
```

Add `_redirects` file for SPA routing:
```
/*    /index.html   200
```

### Option C: Static Host (Manual)

```bash
# Build the production bundle
npm run build

# The dist/ folder contains your static site
# Upload to any static host (Apache, Nginx, S3, etc.)
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    root /var/www/cleanmadurai/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Environment Configuration

### Required Variables

| Variable | Where | Example |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Frontend | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Frontend | `eyJ...` |
| `VITE_GEMINI_API_KEY` | Frontend | `AIza...` |

### Supabase Secrets (Edge Functions)

| Variable | Where | How to Set |
|----------|-------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | `supabase secrets set` |
| `GEMINI_API_KEY` | Edge Functions | `supabase secrets set` |

### `.env.example` Template

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI
VITE_GEMINI_API_KEY=your-gemini-api-key
```

> ⚠️ **Never commit `.env` to Git!** It's already in `.gitignore`.

---

## Post-Deployment

### Verify Deployment

1. **Homepage loads**: Check hero section and KPIs render
2. **Auth works**: Test sign up → verify email → sign in
3. **Report flows**: Submit a test complaint → check DB
4. **Admin access**: First user should have admin panel
5. **Realtime**: Open two tabs, change complaint status, verify both update
6. **Edge Functions**: Submit complaint → verify AI priority assigned
7. **Maps**: Verify ward polygons render on map pages

### Custom Domain

**Vercel:**
```bash
vercel domains add cleanmadurai.ai
```

**Netlify:**
1. Go to Domain Settings → Add custom domain
2. Update DNS records

---

## Monitoring

### Supabase Dashboard
- **Auth**: Monitor sign-ups, active users
- **Database**: Query performance, row counts
- **Edge Functions**: Invocation logs, errors
- **Realtime**: Active connections, message counts
- **Storage**: Bucket usage, file counts

### Vercel Analytics
- **Web Vitals**: LCP, FID, CLS
- **Page views**: Traffic patterns
- **Error tracking**: Runtime errors

### Recommended Add-ons
- **Sentry** for error tracking
- **Plausible/Umami** for privacy-first analytics
- **UptimeRobot** for uptime monitoring

---

<p align="center">
  <em>See <a href="architecture.md">architecture.md</a> for system design | <a href="database.md">database.md</a> for schema setup</em>
</p>
