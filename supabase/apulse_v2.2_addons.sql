-- ============================================================
-- aPulse v2.2 — 增量迁移
-- site_metadata、profiles、删除RLS、搜索函数
-- ============================================================

-- ============================================================
-- 1. site_metadata 统计表（命名按你要求）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.site_metadata (key, value) VALUES
  ('total_visits', 0)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.site_metadata ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'site_metadata publicly readable' AND tablename = 'site_metadata') THEN
    CREATE POLICY "site_metadata publicly readable" ON public.site_metadata
      FOR SELECT TO public USING (true);
  END IF;
END $$;

-- RPC：访问量 +1 并返回
CREATE OR REPLACE FUNCTION public.increment_visit_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.site_metadata
  SET value = value + 1, updated_at = timezone('utc'::text, now())
  WHERE key = 'total_visits'
  RETURNING value;
$$;

-- ============================================================
-- 2. 推文 DELETE 的 RLS 策略（仅创建者可删）
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can delete their own tweets' AND tablename = 'tweets') THEN
    CREATE POLICY "users can delete their own tweets" ON public.tweets
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 3. profiles 用户档案表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text DEFAULT '',
  bio text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles publicly readable' AND tablename = 'profiles') THEN
    CREATE POLICY "profiles publicly readable" ON public.profiles
      FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can update their own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "users can update their own profile" ON public.profiles
      FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ============================================================
-- 4. 搜索：模糊查询推文内容
-- ============================================================
CREATE OR REPLACE FUNCTION public.search_tweets(query_text text, max_results int DEFAULT 20)
RETURNS TABLE(id uuid, content text, image_url text, created_at timestamptz, user_id uuid, likes_count int)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, content, image_url, created_at, user_id, likes_count
  FROM public.tweets
  WHERE content ILIKE '%' || query_text || '%'
  ORDER BY created_at DESC
  LIMIT max_results;
$$;

-- ============================================================
-- 5. 发帖榜（仅推文，不含评论）
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_top_posters(limit_count int DEFAULT 5)
RETURNS TABLE(user_id uuid, post_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, COUNT(*)::bigint
  FROM public.tweets
  GROUP BY user_id
  ORDER BY post_count DESC
  LIMIT limit_count;
$$;

-- ============================================================
SELECT 'aPulse v2.2 done!' AS status;
