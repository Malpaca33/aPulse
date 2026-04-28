-- aPulse 照片墙 — 为推文添加城市和主题标签

ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS topic text;

CREATE INDEX IF NOT EXISTS tweets_city_idx ON public.tweets(city);
CREATE INDEX IF NOT EXISTS tweets_topic_idx ON public.tweets(topic);
CREATE INDEX IF NOT EXISTS tweets_image_city_idx ON public.tweets(city) WHERE image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS tweets_image_topic_idx ON public.tweets(topic) WHERE image_url IS NOT NULL;
