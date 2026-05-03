import { useQuery } from '@tanstack/react-query';
import { createBrowserSupabase } from '../lib/supabase';

export interface TweetDetail {
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', data.user_id)
    .single();

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
