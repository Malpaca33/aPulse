import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { QueryProvider } from './QueryProvider';
import { FeedLayout } from './templates/FeedLayout';
import { Timeline } from './organisms/Timeline';
import { $session, $sessionLoading, initSession, signInAnonymously, signInWithOAuth, signOut } from '../stores/session';
import { useTimeline, useToggleLike, useToggleBookmark, useDeleteTweet } from '../hooks/useTweets';

function ProfileContent() {
  const session = useStore($session);
  const sessionLoading = useStore($sessionLoading);
  const { data, isLoading } = useTimeline();
  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();
  const deleteTweet = useDeleteTweet();

  const user = session
    ? {
        nickname: session.user_metadata?.nickname || session.user_metadata?.name || session.user_metadata?.full_name || session.email || '用户',
        avatarUrl: session.user_metadata?.avatar_url || null,
      }
    : null;

  // Filter to only this user's tweets
  const myTweets = (data?.pages.flatMap((p) => p) ?? [])
    .filter((t: any) => t.user_id === session?.id)
    .map((t: any) => ({
      ...t,
      user: {
        nickname: t.profiles?.nickname || null,
        avatarUrl: null,
      },
    }));

  const initials = session?.email?.slice(0, 2).toUpperCase() || 'U';
  const tweetCount = myTweets.length;

  return (
    <FeedLayout
      user={user}
      currentPath="/profile"
      onLogin={(p) => signInWithOAuth(p)}
      onAnonymousLogin={signInAnonymously}
      onLogout={signOut}
      sessionLoading={sessionLoading}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-surface-primary/80 border-b border-border-subtle">
        <div className="px-4 h-12 flex items-center">
          <h1 className="text-lg font-bold text-primary">个人主页</h1>
        </div>
      </div>

      {/* Profile card */}
      <div className="border-b border-border-subtle px-4 py-6">
        {session ? (
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 shrink-0 rounded-full border-2 border-cyan-400/30 bg-white/[0.05] flex items-center justify-center text-lg font-black text-white/80">
              {initials}
            </div>
            <div className="min-w-0 flex-1 pt-2">
              <h2 className="text-xl font-bold text-primary">{user?.nickname || '用户'}</h2>
              <p className="text-sm text-tertiary mt-0.5">{session.email}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-secondary">
                  <strong className="text-primary">{tweetCount}</strong> 条推文
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-secondary text-sm mb-3">登录后查看个人主页</p>
          </div>
        )}
      </div>

      {/* User's tweets */}
      {session ? (
        <Timeline
          tweets={myTweets}
          loading={isLoading || sessionLoading}
          onLike={(id) => toggleLike.mutate(id)}
          onBookmark={(id) => toggleBookmark.mutate(id)}
          onDelete={(id) => deleteTweet.mutate(id)}
        />
      ) : (
        <div className="flex items-center justify-center py-20 text-sm text-tertiary">
          请先登录
        </div>
      )}
    </FeedLayout>
  );
}

export function ProfilePage() {
  useEffect(() => {
    initSession();
  }, []);

  return (
    <QueryProvider>
      <ProfileContent />
    </QueryProvider>
  );
}
