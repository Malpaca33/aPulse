-- ============================================================
-- aPulse v7 — RLS 修复 + 管理增强
-- ============================================================

-- 1. profiles: 添加 INSERT policy（允许用户注册时自动创建）
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can insert their own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "users can insert their own profile" ON public.profiles
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. blog_posts 表（新增博客管理功能）
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'blog_posts publicly readable' AND tablename = 'blog_posts') THEN
    CREATE POLICY "blog_posts publicly readable" ON public.blog_posts
      FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can insert their own blog posts' AND tablename = 'blog_posts') THEN
    CREATE POLICY "users can insert their own blog posts" ON public.blog_posts
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can update their own blog posts' AND tablename = 'blog_posts') THEN
    CREATE POLICY "users can update their own blog posts" ON public.blog_posts
      FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users can delete their own blog posts' AND tablename = 'blog_posts') THEN
    CREATE POLICY "users can delete their own blog posts" ON public.blog_posts
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
