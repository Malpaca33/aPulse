import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabase } from '../lib/supabase';

interface TweetDetail {
  id: string;
  content: string;
  image_url: string | null;
  city: string | null;
  topic: string | null;
  user_id: string;
  likes_count: number;
  created_at: string;
  profiles: { nickname: string | null } | null;
  viewer_has_liked: boolean;
  viewer_has_bookmarked: boolean;
}

async function fetchTweet(id: string): Promise<TweetDetail> {
  const supabase = createBrowserSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('tweets')
    .select('id, content, image_url, city, topic, user_id, likes_count, created_at')
    .eq('id', id)
    .single();

  if (error || !data) throw new Error('推文不存在');

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', data.user_id)
    .single();

  // Check like/bookmark status
  let viewer_has_liked = false;
  let viewer_has_bookmarked = false;
  if (user) {
    const [likeRes, bookmarkRes] = await Promise.all([
      supabase.from('tweet_likes').select('id').eq('tweet_id', id).eq('user_id', user.id).maybeSingle(),
      supabase.from('bookmarks').select('id').eq('tweet_id', id).eq('user_id', user.id).maybeSingle(),
    ]);
    viewer_has_liked = !!likeRes.data;
    viewer_has_bookmarked = !!bookmarkRes.data;
  }

  return {
    ...data,
    profiles: profile || { nickname: null },
    viewer_has_liked,
    viewer_has_bookmarked,
  };
}

export function useTweet(id: string) {
  return useQuery({
    queryKey: ['tweet', id],
    queryFn: () => fetchTweet(id),
    enabled: !!id,
  });
}

export function useToggleTweetLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tweetId, currentlyLiked }: { tweetId: string; currentlyLiked: boolean }) => {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      if (currentlyLiked) {
        await supabase.from('tweet_likes').delete().eq('tweet_id', tweetId).eq('user_id', user.id);
      } else {
        await supabase.from('tweet_likes').insert({ tweet_id: tweetId, user_id: user.id });
      }
    },
    onMutate: async ({ tweetId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['tweet', tweetId] });
      const previous = queryClient.getQueryData<TweetDetail>(['tweet', tweetId]);
      queryClient.setQueryData<TweetDetail>(['tweet', tweetId], (old) => {
        if (!old) return old;
        return {
          ...old,
          viewer_has_liked: !currentlyLiked,
          likes_count: currentlyLiked ? Math.max(0, old.likes_count - 1) : old.likes_count + 1,
        };
      });
      return { previous };
    },
    onError: (_err, { tweetId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tweet', tweetId], context.previous);
      }
    },
    onSettled: (_data, _err, { tweetId }) => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      queryClient.invalidateQueries({ queryKey: ['tweet', tweetId] });
    },
  });
}

export function useToggleTweetBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tweetId, currentlyBookmarked }: { tweetId: string; currentlyBookmarked: boolean }) => {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      if (currentlyBookmarked) {
        await supabase.from('bookmarks').delete().eq('tweet_id', tweetId).eq('user_id', user.id);
      } else {
        await supabase.from('bookmarks').insert({ tweet_id: tweetId, user_id: user.id });
      }
    },
    onMutate: async ({ tweetId, currentlyBookmarked }) => {
      const previous = queryClient.getQueryData<TweetDetail>(['tweet', tweetId]);
      queryClient.setQueryData<TweetDetail>(['tweet', tweetId], (old) => {
        if (!old) return old;
        return { ...old, viewer_has_bookmarked: !currentlyBookmarked };
      });
      return { previous };
    },
    onError: (_err, { tweetId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tweet', tweetId], context.previous);
      }
    },
    onSettled: (_data, _err, { tweetId }) => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      queryClient.invalidateQueries({ queryKey: ['tweet', tweetId] });
    },
  });
}
