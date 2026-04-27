-- ============================================================
-- aPulse Feature Evolution v2.1
-- 新增：bookmarks、comments、site_stats、is_featured、统计函数
-- 执行位置：Supabase Dashboard > SQL Editor
-- ============================================================

-- 0. 新增字段：精华帖标记
ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- ============================================================
-- 1. bookmarks 书签表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  tweet_id uuid NOT NULL REFERENCES public.tweets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (tweet_id, user_id)
);

CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON public.bookmarks(user_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 书签 RLS：仅用户本人可见/可增/可删
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can see their own bookmarks' AND tablename = 'bookmarks') THEN
    CREATE POLICY "users can see their own bookmarks" ON public.bookmarks
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can bookmark' AND tablename = 'bookmarks') THEN
    CREATE POLICY "users can bookmark" ON public.bookmarks
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can remove their own bookmarks' AND tablename = 'bookmarks') THEN
    CREATE POLICY "users can remove their own bookmarks" ON public.bookmarks
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 2. comments 评论表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id uuid NOT NULL REFERENCES public.tweets(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 500),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS comments_tweet_id_idx ON public.comments(tweet_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 评论 RLS：公开可读，认证用户可写，仅创建者可删
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'comments are publicly readable' AND tablename = 'comments') THEN
    CREATE POLICY "comments are publicly readable" ON public.comments
      FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated users can comment' AND tablename = 'comments') THEN
    CREATE POLICY "authenticated users can comment" ON public.comments
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can delete their own comments' AND tablename = 'comments') THEN
    CREATE POLICY "users can delete their own comments" ON public.comments
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 3. site_stats 统计表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL UNIQUE,
  metric_value bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 预置初始指标行
INSERT INTO public.site_stats (metric_name, metric_value) VALUES
  ('total_page_views', 0),
  ('total_posts', 0)
ON CONFLICT (metric_name) DO NOTHING;

-- 允许公开读取 site_stats（仅用于大盘展示）
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'site_stats are publicly readable' AND tablename = 'site_stats') THEN
    CREATE POLICY "site_stats are publicly readable" ON public.site_stats
      FOR SELECT TO public USING (true);
  END IF;
END $$;

-- ============================================================
-- 4. 统计函数
-- ============================================================

-- 4a. 页面访问量 +1 并返回新值
CREATE OR REPLACE FUNCTION public.increment_page_view()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.site_stats
  SET metric_value = metric_value + 1, updated_at = now()
  WHERE metric_name = 'total_page_views'
  RETURNING metric_value;
$$;

-- 4b. 获取发帖/评论最多的用户 Top N
CREATE OR REPLACE FUNCTION public.get_top_contributors(limit_count int DEFAULT 5)
RETURNS TABLE(user_id uuid, total_activity bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, COUNT(*)::bigint AS total_activity
  FROM (
    SELECT user_id FROM public.tweets
    UNION ALL
    SELECT user_id FROM public.comments
  ) all_activities
  GROUP BY user_id
  ORDER BY total_activity DESC
  LIMIT limit_count;
$$;

-- ============================================================
-- 5. Realtime：新增表加入发布
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookmarks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
  END IF;
END $$;

-- ============================================================
-- 完成
-- ============================================================
SELECT 'aPulse v2.1 migration complete!' AS status;
