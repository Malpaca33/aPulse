# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

aPulse — a Twitter/X-like social feed app built with **Astro 4 + Supabase + Tailwind CSS**, deployed on **Cloudflare Workers** (via `@astrojs/cloudflare`). Features tweet posting with image upload, like/unlike, GitHub & anonymous auth, and realtime feed updates via Supabase Realtime.

## Commands

```bash
npm run dev      # Start dev server (localhost:4321)
npm run build    # Build for production (Cloudflare Workers)
npm run preview  # Preview production build locally
```

## Architecture

### Rendering mode
Hybrid (`output: 'hybrid'`) — `src/pages/api/*.js` endpoints opt out of prerendering (`export const prerender = false;`) and run as serverless functions on Cloudflare. The main index page is a static Astro page with a client-side script.

### Supabase client pattern (`src/lib/supabase.js`)
- **Browser client**: singleton `createBrowserSupabase()`, used only in `<script>` tags on pages. Configured with `persistSession: true` for auth state persistence.
- **Server client**: `createServerSupabase(accessToken)`, used in API route handlers. Created per-request with the user's access token passed via `Authorization: Bearer` header.

### API routes
- `GET/POST /api/tweets` — list tweets (with `viewer_has_liked` flag per user) and create new ones
- `POST /api/tweets/:id/like` — toggle like on a tweet, removes existing like or adds new one

The like-count is maintained via a database trigger (`sync_tweet_likes_count`) rather than application logic.

### Database schema (`supabase/init-database.sql`)
Two tables: `tweets` (id, content, image_url, user_id, likes_count, created_at) and `tweet_likes` (tweet_id, user_id composite PK). RLS policies enforce: tweets publicly readable, only authenticated users can insert/update storage in their own folder, users can only see/like/unlike their own likes.

### Realtime
Browser subscribes to `postgres_changes` on both `tweets` and `tweet_likes` tables to auto-refresh the feed. Also polls every 15 seconds as fallback (in the legacy TweetApp component).

### Storage
Images uploaded to Supabase Storage bucket `images`, path pattern: `{user_id}/{timestamp}-{filename}`. Bucket is public. RLS restricts uploads to authenticated users in their own folder.

### Environment variables (`.env`)
- `PUBLIC_SUPABASE_URL` — Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

### Two component versions
There are two versions of the feed component in the repo: `src/components/TweetApp.astro` (legacy, simpler) and an inline `<script>` in `src/pages/index.astro` (current, with image upload support and character ring animation). The index page is the active one.
