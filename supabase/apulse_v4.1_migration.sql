-- ============================================================
-- aPulse V4.1 — 搜索增强 + 用户设置 + 流量统计
-- user_configs, traffic_stats, search_all RPC
-- ============================================================

-- 1. user_configs 用户设置表
CREATE TABLE IF NOT EXISTS public.user_configs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_email text DEFAULT '',
  notify_phone text DEFAULT '',
  email_notifications boolean NOT NULL DEFAULT false,
  phone_notifications boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can read own config' AND tablename = 'user_configs') THEN
    CREATE POLICY "users can read own config" ON public.user_configs
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can upsert own config' AND tablename = 'user_configs') THEN
    CREATE POLICY "users can upsert own config" ON public.user_configs
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can update own config' AND tablename = 'user_configs') THEN
    CREATE POLICY "users can update own config" ON public.user_configs
      FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 2. traffic_stats 流量统计表（ECG 图表数据源）
CREATE TABLE IF NOT EXISTS public.traffic_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  page_views int NOT NULL DEFAULT 0,
  active_users int NOT NULL DEFAULT 0,
  posts_count int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS traffic_stats_recorded_at_idx ON public.traffic_stats(recorded_at);

ALTER TABLE public.traffic_stats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'traffic_stats publicly readable' AND tablename = 'traffic_stats') THEN
    CREATE POLICY "traffic_stats publicly readable" ON public.traffic_stats
      FOR SELECT TO public USING (true);
  END IF;
END $$;

-- 插入一些模拟数据（V4 演示用）
INSERT INTO public.traffic_stats (recorded_at, page_views, active_users, posts_count) VALUES
  (timezone('utc'::text, now()) - interval '12 hours', 42, 3, 8),
  (timezone('utc'::text, now()) - interval '9 hours', 78, 5, 12),
  (timezone('utc'::text, now()) - interval '6 hours', 135, 8, 19),
  (timezone('utc'::text, now()) - interval '3 hours', 210, 12, 27),
  (timezone('utc'::text, now()), 289, 15, 35)
ON CONFLICT DO NOTHING;

-- 3. 跨表搜索 RPC（tweets + comments）
CREATE OR REPLACE FUNCTION public.search_all(query_text text, max_results int DEFAULT 20)
RETURNS TABLE(
  id uuid,
  content text,
  created_at timestamptz,
  user_id uuid,
  image_url text,
  likes_count int,
  source_type text,
  parent_tweet_id uuid,
  tweet_content text
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  -- tweets 结果
  SELECT
    t.id,
    t.content,
    t.created_at,
    t.user_id,
    t.image_url,
    t.likes_count,
    'tweet'::text AS source_type,
    NULL::uuid AS parent_tweet_id,
    NULL::text AS tweet_content
  FROM public.tweets t
  WHERE t.content ILIKE '%' || query_text || '%'

  UNION ALL

  -- comments 结果
  SELECT
    c.id,
    c.content,
    c.created_at,
    c.user_id,
    NULL::text AS image_url,
    0 AS likes_count,
    'comment'::text AS source_type,
    c.tweet_id AS parent_tweet_id,
    tw.content AS tweet_content
  FROM public.comments c
  JOIN public.tweets tw ON tw.id = c.tweet_id
  WHERE c.content ILIKE '%' || query_text || '%'

  ORDER BY created_at DESC
  LIMIT max_results;
$$;

-- 4. traffic_stats RPC：获取最近 N 条记录
CREATE OR REPLACE FUNCTION public.get_traffic_stats(hours_range int DEFAULT 24)
RETURNS TABLE(recorded_at timestamptz, page_views int, active_users int, posts_count int)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT recorded_at, page_views, active_users, posts_count
  FROM public.traffic_stats
  WHERE recorded_at >= timezone('utc'::text, now()) - (hours_range || ' hours')::interval
  ORDER BY recorded_at ASC;
$$;

-- 5. 新增 Realtime 订阅
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_configs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_configs;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'traffic_stats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.traffic_stats;
  END IF;
END $$;

-- ============================================================
SELECT 'aPulse V4.1 SQL ready!' AS status;
