import { useInfiniteQuery } from '@tanstack/react-query';
import { createBrowserSupabase } from '../lib/supabase';

export interface TweetFeedItem {
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
  profiles: { nickname: string | null } | null;
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

  const userIds = [...new Set(tweets.map((t) => t.user_id))] as string[];
  let profileMap: Record<string, string | null> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nickname')
      .in('id', userIds);
    if (profiles) {
      profileMap = Object.fromEntries(profiles.map((p) => [p.id, p.nickname]));
    }
  }

  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  if (userId) {
    const [likesRes, bookmarksRes] = await Promise.all([
      supabase.from('tweet_likes').select('tweet_id').eq('user_id', userId),
      supabase.from('bookmarks').select('tweet_id').eq('user_id', userId),
    ]);
    likedIds = (likesRes.data || []).map((l) => l.tweet_id);
    bookmarkedIds = (bookmarksRes.data || []).map((b) => b.tweet_id);
  }

  return tweets.map((t) => ({
    ...t,
    profiles: { nickname: profileMap[t.user_id] ?? null },
    viewer_has_liked: likedIds.includes(t.id),
    viewer_has_bookmarked: bookmarkedIds.includes(t.id),
  })) as TweetFeedItem[];
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
