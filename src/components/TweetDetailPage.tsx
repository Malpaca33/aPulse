import { useState, useEffect } from 'react';
import { QueryProvider } from './QueryProvider';
import { TweetDetail } from './molecules/TweetDetail';
import { CommentSection } from './organisms/CommentSection';
import { ShareModal } from './organisms/ShareModal';
import { useTweet, useToggleTweetLike, useToggleTweetBookmark } from '../hooks/useTweet';

function TweetDetailContent() {
  const [tweetId, setTweetId] = useState<string | null>(null);
  const [shareTweet, setShareTweet] = useState<any>(null);

  useEffect(() => {
    const id = window.location.pathname.split('/').pop();
    if (id) setTweetId(id);
  }, []);

  const { data: tweet, isLoading, error } = useTweet(tweetId || '');
  const toggleLike = useToggleTweetLike();
  const toggleBookmark = useToggleTweetBookmark();

  if (!tweetId) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-white/45">
        <svg className="mr-3 h-5 w-5 animate-spin text-cyan-400" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
        </svg>
        加载中...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-white/45">
        <svg className="mr-3 h-5 w-5 animate-spin text-cyan-400" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
        </svg>
        加载中...
      </div>
    );
  }

  if (error || !tweet) {
    return (
      <div className="px-4 py-16 text-center text-white/50">
        <p className="text-lg">推文不存在或已被删除。</p>
        <a href="/" className="mt-4 inline-block rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.06]">
          返回首页
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Tweet detail */}
      <TweetDetail
        tweet={tweet}
        onLike={() => toggleLike.mutate({ tweetId: tweet.id, currentlyLiked: tweet.viewer_has_liked })}
        onBookmark={() => toggleBookmark.mutate({ tweetId: tweet.id, currentlyBookmarked: tweet.viewer_has_bookmarked })}
        onShare={() => setShareTweet(tweet)}
      />

      {/* Comments */}
      <CommentSection tweetId={tweetId} />

      {/* Share modal */}
      {shareTweet && (
        <ShareModal tweet={shareTweet} onClose={() => setShareTweet(null)} />
      )}
    </>
  );
}

export function TweetDetailPage() {
  return (
    <QueryProvider>
      <div className="mx-auto min-h-screen max-w-2xl border-x border-white/10 bg-black text-white">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
            <a
              href="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              aria-label="返回首页"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
              </svg>
            </a>
            <div>
              <h1 className="text-lg font-bold text-white">推文详情</h1>
            </div>
          </div>
        </header>

        <TweetDetailContent />
      </div>
    </QueryProvider>
  );
}
