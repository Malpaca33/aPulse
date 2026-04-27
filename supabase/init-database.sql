-- ============================================
-- aPulse 完整数据库初始化脚本
-- 版本: 2.0.0
-- 描述: 一键初始化所有表、策略、触发器和存储
-- 执行前请确保已登录 Supabase Dashboard
-- ============================================

-- 启用必要的扩展
create extension if not exists pgcrypto;

-- ============================================
-- 1. 创建核心数据表
-- ============================================

-- 推文表
create table if not exists public.tweets (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(content) <= 280),
  image_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  likes_count integer not null default 0 check (likes_count >= 0)
);

-- 点赞关联表
create table if not exists public.tweet_likes (
  tweet_id uuid not null references public.tweets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (tweet_id, user_id)
);

-- 创建索引
create index if not exists tweets_created_at_idx on public.tweets (created_at desc);
create index if not exists tweets_user_id_idx on public.tweets (user_id);
create index if not exists tweet_likes_user_id_idx on public.tweet_likes (user_id);

-- ============================================
-- 2. 创建存储桶
-- ============================================

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

-- ============================================
-- 3. 创建触发器函数
-- ============================================

create or replace function public.sync_tweet_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.tweets
    set likes_count = (
      select count(*)
      from public.tweet_likes
      where tweet_id = new.tweet_id
    )
    where id = new.tweet_id;
    return new;
  end if;

  update public.tweets
  set likes_count = (
    select count(*)
    from public.tweet_likes
    where tweet_id = old.tweet_id
  )
  where id = old.tweet_id;
  return old;
end;
$$;

-- 创建触发器
drop trigger if exists tweet_likes_count_after_insert on public.tweet_likes;
create trigger tweet_likes_count_after_insert
after insert on public.tweet_likes
for each row execute function public.sync_tweet_likes_count();

drop trigger if exists tweet_likes_count_after_delete on public.tweet_likes;
create trigger tweet_likes_count_after_delete
after delete on public.tweet_likes
for each row execute function public.sync_tweet_likes_count();

-- ============================================
-- 4. 启用行级安全 (RLS)
-- ============================================

alter table public.tweets enable row level security;
alter table public.tweet_likes enable row level security;

-- ============================================
-- 5. 创建 RLS 策略
-- ============================================

-- Tweets 表策略
drop policy if exists "tweets are publicly readable" on public.tweets;
create policy "tweets are publicly readable"
on public.tweets
for select
using (true);

-- 清除旧的 INSERT 策略
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tweets'
      and cmd = 'INSERT'
  loop
    execute format('drop policy if exists %I on public.tweets', existing_policy.policyname);
  end loop;
end
$$;

create policy "signed in users can post tweets"
on public.tweets
for insert
to public
with check (auth.uid() is not null and auth.uid() = user_id);

-- Tweet Likes 表策略
drop policy if exists "users can see their own likes" on public.tweet_likes;
create policy "users can see their own likes"
on public.tweet_likes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can like a tweet once" on public.tweet_likes;
create policy "users can like a tweet once"
on public.tweet_likes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can remove their own likes" on public.tweet_likes;
create policy "users can remove their own likes"
on public.tweet_likes
for delete
to authenticated
using (auth.uid() = user_id);

-- Storage 策略
drop policy if exists "public can read images bucket" on storage.objects;
create policy "public can read images bucket"
on storage.objects
for select
to public
using (bucket_id = 'images');

drop policy if exists "authenticated users can upload images" on storage.objects;
create policy "authenticated users can upload images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'images'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can update their own images" on storage.objects;
create policy "users can update their own images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'images'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'images'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can delete their own images" on storage.objects;
create policy "users can delete their own images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'images'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 6. 启用 Realtime 订阅
-- ============================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tweets'
  ) then
    alter publication supabase_realtime add table public.tweets;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tweet_likes'
  ) then
    alter publication supabase_realtime add table public.tweet_likes;
  end if;
end
$$;

-- ============================================
-- 完成！
-- ============================================
select '✅ aPulse 数据库初始化完成！' as status;
select '📊 已创建:' as info;
select '  - tweets 表' as component;
select '  - tweet_likes 表' as component;
select '  - images 存储桶' as component;
select '  - 自动同步点赞数触发器' as component;
select '  - 完整的 RLS 策略' as component;
select '  - Realtime 订阅' as component;
