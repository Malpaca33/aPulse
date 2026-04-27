-- ============================================================
-- aPulse V3 — 精华 Star + 首页跟帖 + 书签视图
-- ============================================================

-- 1. 确保 is_featured 存在
ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- 2. featured_stars 精华星记录表
CREATE TABLE IF NOT EXISTS public.featured_stars (
  tweet_id uuid NOT NULL REFERENCES public.tweets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (tweet_id, user_id)
);

CREATE INDEX IF NOT EXISTS featured_stars_tweet_id_idx ON public.featured_stars(tweet_id);

ALTER TABLE public.featured_stars ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'everyone can see stars' AND tablename = 'featured_stars') THEN
    CREATE POLICY "everyone can see stars" ON public.featured_stars FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth users can star' AND tablename = 'featured_stars') THEN
    CREATE POLICY "auth users can star" ON public.featured_stars FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can unstar their own' AND tablename = 'featured_stars') THEN
    CREATE POLICY "users can unstar their own" ON public.featured_stars FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. 获取时间线（含每帖最近 3 条评论）
CREATE OR REPLACE FUNCTION public.get_timeline(max_results int DEFAULT 50)
RETURNS TABLE(
  id uuid, content text, image_url text, created_at timestamptz,
  user_id uuid, likes_count int, is_featured boolean,
  recent_comments json
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    t.id, t.content, t.image_url, t.created_at,
    t.user_id, t.likes_count, t.is_featured,
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

-- 4. 获取用户收藏时间线
CREATE OR REPLACE FUNCTION public.get_bookmark_timeline(uid uuid, max_results int DEFAULT 50)
RETURNS TABLE(
  id uuid, content text, image_url text, created_at timestamptz,
  user_id uuid, likes_count int, is_featured boolean,
  recent_comments json
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    t.id, t.content, t.image_url, t.created_at,
    t.user_id, t.likes_count, t.is_featured,
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

-- 5. 搜索时间线（含评论）
CREATE OR REPLACE FUNCTION public.search_timeline(query_text text, max_results int DEFAULT 20)
RETURNS TABLE(
  id uuid, content text, image_url text, created_at timestamptz,
  user_id uuid, likes_count int, is_featured boolean,
  recent_comments json
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    t.id, t.content, t.image_url, t.created_at,
    t.user_id, t.likes_count, t.is_featured,
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
SELECT 'aPulse V3 SQL ready!' AS status;
