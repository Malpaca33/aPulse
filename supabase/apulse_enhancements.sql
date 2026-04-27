-- aPulse 高级功能增强 SQL 脚本
-- 在 Supabase SQL Editor 中执行此脚本以启用所有功能

-- 1. 确保 tweets 表有 image_url 字段
alter table public.tweets add column if not exists image_url text;

-- 2. 创建 images 存储桶（如果不存在）
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

-- 3. 确保 tweet_likes 表存在
create table if not exists public.tweet_likes (
  tweet_id uuid not null references public.tweets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (tweet_id, user_id)
);

create index if not exists tweet_likes_user_id_idx on public.tweet_likes (user_id);

-- 4. 设置 Storage 策略
-- 允许所有人读取 images 桶
drop policy if exists "public can read images bucket" on storage.objects;
create policy "public can read images bucket"
on storage.objects
for select
to public
using (bucket_id = 'images');

-- 允许已认证用户上传图片到 images 桶
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

-- 允许用户更新自己的图片
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

-- 允许用户删除自己的图片
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

-- 5. 点赞功能的 RLS 策略
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

-- 6. 确保实时订阅已启用
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

-- 完成提示
select '✅ aPulse 数据库配置已完成！' as status;
