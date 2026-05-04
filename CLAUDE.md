# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

aPulse — a personal content expression hub built with **Astro 5 + Supabase + Tailwind CSS**, deployed on **Cloudflare Pages** (via `@astrojs/cloudflare`). Features short posts (pulses) with image upload, like/bookmark/comment, Google & anonymous auth, blog articles, photo wall with map view, and archive calendar.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production (Cloudflare Pages)
npm run preview  # Preview production build locally
```

## Architecture

### Rendering mode
Static (`output: 'static'`) — all pages pre-rendered at build time. API routes use `export const prerender = false` and run as serverless functions on Cloudflare.

### Supabase client pattern (`src/lib/supabase.ts`)
- **Browser client**: singleton `createBrowserSupabase()`, configured with `persistSession: true` for auth state persistence.
- **Server client**: `createServerSupabase(accessToken)`, used in API route handlers. Created per-request with the user's access token passed via `Authorization: Bearer` header.

### Key tables
- `tweets` — short posts (content, image_url, location, topic, likes_count)
- `tweet_likes` — like/unlike tracking
- `bookmarks` — bookmark tracking
- `comments` — inline comments on tweets
- `profiles` — user profiles (nickname, bio, avatar_url)
- `blog_posts` — long-form articles (title, slug, content, tags, published flag)

### RLS policies
- Tweets: publicly readable, authenticated users can insert/update/delete their own
- Blog posts: public can only read `published = true`, authors can read/write/delete their own
- Profiles: users can read any profile, update their own
- Comments: publicly readable, authenticated users can insert, authors can delete

### API routes
- `POST /api/tweets/:id/like` — toggle like
- Other mutations handled client-side via Supabase JS SDK

### Realtime
Browser subscribes to `postgres_changes` on `tweets` and `tweet_likes` tables for live feed updates.

### Storage
Images uploaded to Supabase Storage bucket `images`, path pattern: `{user_id}/{timestamp}-{filename}`. Bucket is public. RLS restricts uploads to authenticated users' own folders.

### Environment variables (`.env`)
- `PUBLIC_SUPABASE_URL` — Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key