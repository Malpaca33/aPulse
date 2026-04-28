-- ============================================================
-- aPulse V5 — get_timeline 添加 city/topic 列
-- ============================================================

-- 1. 更新 get_timeline：添加 city, topic
DROP FUNCTION IF EXISTS public.get_timeline(int);
CREATE OR REPLACE FUNCTION public.get_timeline(max_results int DEFAULT 50)
RETURNS TABLE(
  id uuid, content text, image_url text, created_at timestamptz,
  user_id uuid, likes_count int, is_featured boolean,
  city text, topic text,
  recent_comments json
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    t.id, t.content, t.image_url, t.created_at,
    t.user_id, t.likes_count, t.is_featured,
    t.city, t.topic,
    COALESCE(
      (SELECT json_agg(sub ORDER BY sub.created_at ASC) FROM (
        SELECT c.id, c.content, c.created_at, c.user_id
        FROM public.comments c
        WHERE c.tweet_id = t.id
        ORDER BY c.created_at DESC
        LIMIT 3
      ) sub),
      '[]'::json
    ) AS recent_comments
  FROM public.tweets t
  ORDER BY t.created_at DESC
  LIMIT max_results;
$$;

-- 2. 更新 get_bookmark_timeline：添加 city, topic
DROP FUNCTION IF EXISTS public.get_bookmark_timeline(uid uuid, max_results int);
CREATE OR REPLACE FUNCTION public.get_bookmark_timeline(uid uuid, max_results int DEFAULT 50)
RETURNS TABLE(
  id uuid, content text, image_url text, created_at timestamptz,
  user_id uuid, likes_count int, is_featured boolean,
  city text, topic text,
  recent_comments json
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    t.id, t.content, t.image_url, t.created_at,
    t.user_id, t.likes_count, t.is_featured,
    t.city, t.topic,
    COALESCE(
      (SELECT json_agg(sub ORDER BY sub.created_at ASC) FROM (
        SELECT c.id, c.content, c.created_at, c.user_id
        FROM public.comments c
        WHERE c.tweet_id = t.id
        ORDER BY c.created_at DESC
        LIMIT 3
      ) sub),
      '[]'::json
    ) AS recent_comments
  FROM public.bookmarks b
  JOIN public.tweets t ON t.id = b.tweet_id
  WHERE b.user_id = uid
  ORDER BY b.created_at DESC
  LIMIT max_results;
$$;

-- 3. 更新 search_timeline：添加 city, topic
DROP FUNCTION IF EXISTS public.search_timeline(query_text text, max_results int);
CREATE OR REPLACE FUNCTION public.search_timeline(query_text text, max_results int DEFAULT 20)
RETURNS TABLE(
  id uuid, content text, image_url text, created_at timestamptz,
  user_id uuid, likes_count int, is_featured boolean,
  city text, topic text,
  recent_comments json
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    t.id, t.content, t.image_url, t.created_at,
    t.user_id, t.likes_count, t.is_featured,
    t.city, t.topic,
    COALESCE(
      (SELECT json_agg(sub ORDER BY sub.created_at ASC) FROM (
        SELECT c.id, c.content, c.created_at, c.user_id
        FROM public.comments c
        WHERE c.tweet_id = t.id
        ORDER BY c.created_at DESC
        LIMIT 3
      ) sub),
      '[]'::json
    ) AS recent_comments
  FROM public.tweets t
  WHERE t.content ILIKE '%' || query_text || '%'
  ORDER BY t.created_at DESC
  LIMIT max_results;
$$;

-- ============================================================
SELECT 'aPulse V5 SQL ready!' AS status;
