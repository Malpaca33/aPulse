-- ============================================================
-- aPulse V3.1 — Realtime 通知系统
-- notifications 表 + Postgres trigger + RLS
-- ============================================================

-- 1. notifications 表
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('comment', 'like', 'star')),
  source_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tweet_id uuid REFERENCES public.tweets(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS notifications_target_user_id_idx ON public.notifications(target_user_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications(target_user_id, read) WHERE read = false;

-- 2. RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can see their own notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "users can see their own notifications" ON public.notifications
      FOR SELECT TO authenticated USING (auth.uid() = target_user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can update their own notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "users can update their own notifications" ON public.notifications
      FOR UPDATE TO authenticated USING (auth.uid() = target_user_id) WITH CHECK (auth.uid() = target_user_id);
  END IF;
END $$;

-- 3. Trigger: 评论 → 通知
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id <> (SELECT user_id FROM public.tweets WHERE id = NEW.tweet_id) THEN
    INSERT INTO public.notifications (type, source_user_id, target_user_id, tweet_id)
    VALUES ('comment', NEW.user_id, (SELECT user_id FROM public.tweets WHERE id = NEW.tweet_id), NEW.tweet_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_comment_insert ON public.comments;
CREATE TRIGGER on_comment_insert
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_notification();

-- 4. Trigger: 点赞 → 通知
CREATE OR REPLACE FUNCTION public.handle_like_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id <> (SELECT user_id FROM public.tweets WHERE id = NEW.tweet_id) THEN
    INSERT INTO public.notifications (type, source_user_id, target_user_id, tweet_id)
    VALUES ('like', NEW.user_id, (SELECT user_id FROM public.tweets WHERE id = NEW.tweet_id), NEW.tweet_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_like_insert ON public.tweet_likes;
CREATE TRIGGER on_like_insert
  AFTER INSERT ON public.tweet_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_notification();

-- 5. Trigger: 精华 Star → 通知
CREATE OR REPLACE FUNCTION public.handle_star_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id <> (SELECT user_id FROM public.tweets WHERE id = NEW.tweet_id) THEN
    INSERT INTO public.notifications (type, source_user_id, target_user_id, tweet_id)
    VALUES ('star', NEW.user_id, (SELECT user_id FROM public.tweets WHERE id = NEW.tweet_id), NEW.tweet_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_star_insert ON public.featured_stars;
CREATE TRIGGER on_star_insert
  AFTER INSERT ON public.featured_stars
  FOR EACH ROW EXECUTE FUNCTION public.handle_star_notification();

-- 6. 加入 Realtime Publication
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- ============================================================
SELECT 'aPulse V3.1 notifications ready!' AS status;
