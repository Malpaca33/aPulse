import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '../lib/supabase';
import { TweetCard } from './molecules/TweetCard';

interface BookmarkedTweet {
  id: string;
  content: string;
  image_url: string | null;
  city: string | null;
  topic: string | null;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  profiles: { nickname: string | null } | null;
  viewer_has_liked: boolean;
  viewer_has_bookmarked: boolean;
}

export function BookmarksPage() {
  const [tweets, setTweets] = useState<BookmarkedTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('请先登录');
      setLoading(false);
      return;
    }

    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('tweet_id')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (bookmarksError) {
      setError('加载书签失败');
      setLoading(false);
      return;
    }

    if (!bookmarks || bookmarks.length === 0) {
      setTweets([]);
      setLoading(false);
      return;
    }

    const tweetIds = bookmarks.map((b: any) => b.tweet_id);
    const { data: tweetsData, error: tweetsError } = await supabase
      .from('tweets')
      .select('*')
      .in('id', tweetIds)
      .order('created_at', { ascending: false });

    if (tweetsError) {
      setError('加载推文失败');
      setLoading(false);
      return;
    }

    const tweets = tweetsData || [];
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

    let likedIds: string[] = [];
    const { data: likesData } = await supabase
      .from('tweet_likes')
      .select('tweet_id')
      .eq('user_id', session.user.id);
    likedIds = (likesData || []).map((l: any) => l.tweet_id);

    setTweets(tweets.map((t: any) => ({
      ...t,
      profiles: { nickname: profileMap[t.user_id] ?? null },
      viewer_has_liked: likedIds.includes(t.id),
      viewer_has_bookmarked: true,
    })) as BookmarkedTweet[]);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-secondary text-sm">
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-secondary text-sm">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 glass-header border-b border-glass-border">
        <div className="px-4 h-12 flex items-center">
          <h1 className="text-lg font-bold text-primary">书签</h1>
        </div>
      </div>
      {tweets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-secondary text-sm">还没有书签</p>
          <p className="text-tertiary text-xs mt-1">收藏的推文会显示在这里</p>
        </div>
      ) : (
        <div className="divide-y divide-border-subtle">
          {tweets.map((tweet) => (
            <TweetCard
              key={tweet.id}
              id={tweet.id}
              content={tweet.content}
              imageUrl={tweet.image_url}
              city={tweet.city}
              topic={tweet.topic}
              createdAt={tweet.created_at}
              user={{
                nickname: tweet.profiles?.nickname,
                avatarUrl: null,
              }}
              likesCount={tweet.likes_count}
              commentsCount={tweet.comments_count}
              isLiked={tweet.viewer_has_liked}
              isBookmarked={tweet.viewer_has_bookmarked}
            />
          ))}
        </div>
      )}
    </div>
  );
}
