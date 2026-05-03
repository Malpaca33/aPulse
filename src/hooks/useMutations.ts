import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabase } from '../lib/supabase';

export function useToggleLike(extraInvalidateKeys?: string[][]) {
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
        context.previousData.forEach(([key, data]: [string[], unknown]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: (_data, _err, tweetId) => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      if (extraInvalidateKeys) {
        extraInvalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
    },
  });
}

export function useToggleBookmark(extraInvalidateKeys?: string[][]) {
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
        context.previousData.forEach(([key, data]: [string[], unknown]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: (_data, _err, tweetId) => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      if (extraInvalidateKeys) {
        extraInvalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
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
