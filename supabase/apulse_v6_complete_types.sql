-- File: supabase/apulse_v6_complete_types.sql (选中 SQL 后直接在 Dashboard 的 SQL Editor 中粘贴运行)
-- ============================================================
-- aPulse V6 — 补齐缺失列 + Realtime 启用确认
-- 在现有表结构基础上补充 avatar_url、comments_count
-- ============================================================

-- 1. profiles 添加 avatar_url
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. tweets 添加 comments_count（已有的话跳过）
ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS comments_count int NOT NULL DEFAULT 0;

-- 3. 更新 comments_count 触发器（当评论插入/删除时自动更新）
CREATE OR REPLACE FUNCTION public.sync_tweet_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tweets SET comments_count = comments_count + 1 WHERE id = NEW.tweet_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tweets SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.tweet_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_comments_count ON public.comments;
CREATE TRIGGER sync_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_tweet_comments_count();

-- 4. 确认关键表已加入 Realtime publication
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tweets') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tweets;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tweet_likes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tweet_likes;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- ============================================================
SELECT 'aPulse V6 SQL ready!' AS status;
