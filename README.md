# HuyVo Portfolio — V1.2.0 Media & Project Assets

A professional portfolio/CV web app built with Next.js, TypeScript, Supabase CMS and privacy-conscious analytics.

## Current version

**V1.2.0 — Media & Project Assets**

## Main features

- Portfolio landing page
- Professional CV sections
- Project portfolio and project case-study detail pages
- ATS-friendly `/resume`
- Print / Save PDF resume support
- Contact page and contact cards
- SEO, sitemap, robots, manifest, OpenGraph and JSON-LD
- Supabase-backed Real CMS Admin
- `/admin` Light / Dark / System theme switcher
- Visitor analytics dashboard in `/admin`
- Media & Project Assets management in `/admin`
- Fallback to `src/data/profile.ts` when Supabase is not configured

## Media & Project Assets

V1.2.0 adds URL-based media management. In `/admin → Media`, you can manage:

- Profile avatar image URL
- Resume/CV file URL
- Project icon / initials
- Project thumbnail image URL
- Project case-study gallery assets
- Asset type: Image, Screenshot, Diagram, Document, Video or Link
- Asset caption and alt text

Media is stored inside the existing `portfolio_profiles.data` JSONB field, so no extra Supabase table is required for this version.

Use public URLs only. For confidential work screenshots, sanitize the image before publishing.

## Analytics events

V1.1.0+ tracks public-site interactions through `/api/analytics` and stores them in Supabase table `portfolio_events`:

- `page_view`
- `project_view`
- `cta_click`
- `resume_download`
- `contact_click`

Admin pages are not tracked.

## Environment variables

Create these variables on Vercel:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password

# Optional CMS
SUPABASE_PORTFOLIO_TABLE=portfolio_profiles
SUPABASE_PORTFOLIO_ID=default
PORTFOLIO_REVALIDATE_SECONDS=60

# Optional Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true
SUPABASE_ANALYTICS_TABLE=portfolio_events
ANALYTICS_MAX_ROWS=5000
```

No extra environment variable is required for URL-based media in V1.2.0.

## Supabase setup

Run the full SQL file before using Save live or Analytics:

```text
supabase/schema.sql
```

This creates:

- `portfolio_profiles`
- `portfolio_events`

## Local development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

Local fallback admin password:

```text
huyvo-admin
```

## Build

```bash
npm run build
```

## Vercel deploy note

Keep Vercel Output Directory as the default. Do not set it to `out`.
