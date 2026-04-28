-- aPulse — 精华星视图 RPC
-- 用于在"精华"标签页只显示用户标记了星标的推文

CREATE OR REPLACE FUNCTION public.get_starred_timeline(uid uuid, max_results int DEFAULT 50)
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
  FROM public.featured_stars s
  JOIN public.tweets t ON t.id = s.tweet_id
  WHERE s.user_id = uid
  ORDER BY s.created_at DESC
  LIMIT max_results;
$$;
