import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { QueryProvider } from './QueryProvider';
import { FeedLayout } from './templates/FeedLayout';
import { TweetComposer } from './molecules/TweetComposer';
import { Timeline } from './organisms/Timeline';
import { ShareModal } from './organisms/ShareModal';
import { $session, $sessionLoading, initSession, signInAnonymously, signInWithOAuth, signOut } from '../stores/session';
import { $dateFilter, clearDateFilter } from '../stores/dateFilter';
import { useTimeline } from '../hooks/useTimeline';
import { usePostTweet } from '../hooks/usePostTweet';
import { useToggleLike, useToggleBookmark, useDeleteTweet } from '../hooks/useMutations';
import { useRealtimeFeed } from '../hooks/useRealtime';
import { useProfile } from '../hooks/useProfile';

function FeedContent() {
  const session = useStore($session);
  const sessionLoading = useStore($sessionLoading);
  const dateFilter = useStore($dateFilter);
  const { data, isLoading, fetchNextPage, hasNextPage } = useTimeline();
  const { profile } = useProfile(session?.id);

  useRealtimeFeed();
  const postTweet = usePostTweet();
  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();
  const deleteTweet = useDeleteTweet();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [shareTweet, setShareTweet] = useState<any | null>(null);

  const tweets = (data?.pages.flatMap((p) => p) ?? [])
    .filter((t: any) => {
      if (!dateFilter) return true;
      const d = new Date(t.created_at);
      return d.getFullYear() === dateFilter.year &&
             d.getMonth() + 1 === dateFilter.month &&
             d.getDate() === dateFilter.day;
    })
    .map((t) => ({
      ...t,
      user: {
        nickname: t.profiles?.nickname || null,
        avatarUrl: null,
      },
    }));

  const user = session
    ? {
        nickname: profile?.nickname || session.user_metadata?.nickname || session.user_metadata?.name || session.user_metadata?.full_name || session.email || '用户',
        avatarUrl: profile?.avatarUrl || session.user_metadata?.avatar_url || null,
      }
    : null;

  const handleLogin = useCallback(async (provider: 'google' | 'qq') => {
    try {
      setLoginError(null);
      await signInWithOAuth(provider);
    } catch (e: any) {
      setLoginError(e?.message || '登录失败');
    }
  }, []);

  const handleAnonymousLogin = useCallback(async () => {
    try {
      setLoginError(null);
      await signInAnonymously();
    } catch (e: any) {
      setLoginError(e?.message || '登录失败');
    }
  }, []);

  const handleShare = useCallback((tweetId: string) => {
    const tweet = tweets.find((t: any) => t.id === tweetId);
    if (tweet) setShareTweet(tweet);
  }, [tweets]);

  return (
    <FeedLayout
      user={user}
      currentPath="/"
      onLogin={handleLogin}
      onAnonymousLogin={handleAnonymousLogin}
      onLogout={signOut}
      sessionLoading={sessionLoading}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 glass-header">
        <div className="px-4 h-12 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">动态</h1>
        </div>
      </div>

      {/* Composer */}
      {user && (
        <TweetComposer
          userAvatar={user.avatarUrl}
          userName={user.nickname}
          onSubmit={async (content, image) => {
            await postTweet.mutateAsync({ content, image });
          }}
        />
      )}

      {/* Date filter indicator */}
      {dateFilter && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-cyan-500/5">
          <span className="text-sm text-cyan-400 font-medium">
            {dateFilter.year}年{dateFilter.month}月{dateFilter.day}日的推文
          </span>
          <button
            onClick={clearDateFilter}
            className="text-xs text-tertiary hover:text-white transition-colors"
          >
            显示全部
          </button>
        </div>
      )}

      {/* Timeline */}
      <Timeline
        tweets={tweets}
        loading={isLoading || sessionLoading}
        onLike={(id) => toggleLike.mutate(id)}
        onBookmark={(id) => toggleBookmark.mutate(id)}
        onShare={handleShare}
        onDelete={(id) => deleteTweet.mutate(id)}
      />

      {/* Empty state */}
      {!isLoading && !sessionLoading && tweets.length === 0 && !dateFilter && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-secondary text-sm">还没有内容</p>
          <p className="text-tertiary text-xs">写下第一条动态吧</p>
        </div>
      )}

      {/* Load more */}
      {hasNextPage && !isLoading && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => fetchNextPage()}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            加载更多
          </button>
        </div>
      )}

      {/* Share Modal */}
      {shareTweet && (
        <ShareModal
          tweet={shareTweet}
          onClose={() => setShareTweet(null)}
        />
      )}
    </FeedLayout>
  );
}

export function FeedPage() {
  useEffect(() => {
    initSession();
  }, []);

  return (
    <QueryProvider>
      <FeedContent />
    </QueryProvider>
  );
}
