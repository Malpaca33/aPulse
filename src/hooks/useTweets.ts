import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { createBrowserSupabase } from '../lib/supabase';

interface Tweet {
  id: string;
  content: string;
  image_url: string | null;
  city: string | null;
  topic: string | null;
  user_id: string;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
  profiles: {
    nickname: string | null;
  } | null;
  viewer_has_liked: boolean;
  viewer_has_bookmarked: boolean;
}

async function fetchTweets({ pageParam = 0 }: { pageParam: number }) {
  const supabase = createBrowserSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  const { data, error } = await supabase
    .from('tweets')
    .select('*')
    .order('created_at', { ascending: false })
    .range(pageParam, pageParam + 20);

  if (error) throw error;

  const tweets = data || [];

  // Fetch profiles for all unique user_ids
  const userIds = [...new Set(tweets.map((t: any) => t.user_id))];
  let profileMap: Record<string, string | null> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nickname')
      .in('id', userIds);
    if (profiles) {
      profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.nickname]));
    }
  }

  // Fetch current user's likes and bookmarks
  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  if (userId) {
    const [likesRes, bookmarksRes] = await Promise.all([
      supabase.from('tweet_likes').select('tweet_id').eq('user_id', userId),
      supabase.from('bookmarks').select('tweet_id').eq('user_id', userId),
    ]);
    likedIds = (likesRes.data || []).map((l: any) => l.tweet_id);
    bookmarkedIds = (bookmarksRes.data || []).map((b: any) => b.tweet_id);
  }

  return tweets.map((t: any) => ({
    ...t,
    profiles: { nickname: profileMap[t.user_id] ?? null },
    viewer_has_liked: likedIds.includes(t.id),
    viewer_has_bookmarked: bookmarkedIds.includes(t.id),
  })) as Tweet[];
}

export function useTimeline() {
  return useInfiniteQuery({
    queryKey: ['tweets', 'timeline'],
    queryFn: fetchTweets,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 20 ? allPages.length * 20 : undefined,
    initialPageParam: 0,
  });
}

async function postTweet({ content, imageUrl, city, topic }: {
  content: string;
  imageUrl?: string;
  city?: string;
  topic?: string;
}) {
  const supabase = createBrowserSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('请先登录');

  const { data, error } = await supabase
    .from('tweets')
    .insert({
      content,
      image_url: imageUrl || null,
      city: city || null,
      topic: topic || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function uploadImage(file: File): Promise<string> {
  const supabase = createBrowserSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('请先登录');

  const ext = file.name.split('.').pop();
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(path, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(path);

  return publicUrl;
}

export function usePostTweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, image, city, topic }: {
      content: string;
      image?: File;
      city?: string;
      topic?: string;
    }) => {
      let imageUrl: string | undefined;
      if (image) {
        imageUrl = await uploadImage(image);
      }
      return postTweet({ content, imageUrl, city, topic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tweetId: string) => {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { data: existing } = await supabase
        .from('tweet_likes')
        .select('id')
        .eq('tweet_id', tweetId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('tweet_likes').delete().eq('id', existing.id);
      } else {
        await supabase.from('tweet_likes').insert({ tweet_id: tweetId, user_id: user.id });
      }
    },
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey: ['tweets'] });
      const previousData = queryClient.getQueriesData({ queryKey: ['tweets'] });

      queryClient.setQueriesData({ queryKey: ['tweets'] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any[]) =>
            page.map((t: any) =>
              t.id === tweetId
                ? {
                    ...t,
                    viewer_has_liked: !t.viewer_has_liked,
                    likes_count: t.viewer_has_liked
                      ? Math.max(0, t.likes_count - 1)
                      : t.likes_count + 1,
                  }
                : t
            )
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _tweetId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
    },
  });
}

export function useDeleteTweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tweetId: string) => {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { error } = await supabase
        .from('tweets')
        .delete()
        .eq('id', tweetId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
    },
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tweetId: string) => {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('tweet_id', tweetId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('bookmarks').delete().eq('id', existing.id);
      } else {
        await supabase.from('bookmarks').insert({ tweet_id: tweetId, user_id: user.id });
      }
    },
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey: ['tweets'] });
      const previousData = queryClient.getQueriesData({ queryKey: ['tweets'] });

      queryClient.setQueriesData({ queryKey: ['tweets'] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any[]) =>
            page.map((t: any) =>
              t.id === tweetId
                ? { ...t, viewer_has_bookmarked: !t.viewer_has_bookmarked }
                : t
            )
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _tweetId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
    },
  });
}
