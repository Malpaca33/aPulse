import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $session } from '../../stores/session';

interface TweetDetailProps {
  tweet: {
    id: string;
    content: string;
    image_url: string | null;
    user_id: string;
    likes_count: number;
    created_at: string;
    profiles: { nickname: string | null } | null;
    viewer_has_liked: boolean;
    viewer_has_bookmarked: boolean;
  };
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
}

function formatAuthor(userId: string, currentUserId?: string) {
  if (currentUserId === userId) return '你';
  return `@${userId.slice(0, 8)}`;
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const formatter = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' });
  const secs = Math.round(diff / 1000);
  if (secs < 60) return formatter.format(-secs, 'second');
  if (secs < 3600) return formatter.format(-Math.round(secs / 60), 'minute');
  if (secs < 86400) return formatter.format(-Math.round(secs / 3600), 'hour');
  return formatter.format(-Math.round(secs / 86400), 'day');
}

export function TweetDetail({ tweet, onLike, onBookmark, onShare }: TweetDetailProps) {
  const session = useStore($session);
  const [likeAnim, setLikeAnim] = useState(false);
  const [bookmarkAnim, setBookmarkAnim] = useState(false);

  const authorName = tweet.profiles?.nickname || formatAuthor(tweet.user_id, session?.id);
  const initials = authorName.slice(0, 2).toUpperCase() || '?';

  const handleLike = () => {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    onLike();
  };

  const handleBookmark = () => {
    setBookmarkAnim(true);
    setTimeout(() => setBookmarkAnim(false), 400);
    onBookmark();
  };

  return (
    <article className="border-b border-white/10 px-4 py-5 sm:px-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-black text-white/80">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          {/* Author + Time */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-white">{authorName}</span>
            <span className="text-sm text-white/25">&middot;</span>
            <span className="text-sm text-white/45">{formatRelativeTime(tweet.created_at)}</span>
          </div>

          {/* Content */}
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-white/85">
            {tweet.content}
          </p>

          {/* Image */}
          {tweet.image_url && (
            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03]">
              <img src={tweet.image_url} alt="" loading="lazy" className="max-h-[30rem] w-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-4 flex items-center gap-6 border-t border-white/10 pt-3">
        {/* Like */}
        <button
          onClick={handleLike}
          type="button"
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition hover:bg-rose-500/10 ${
            tweet.viewer_has_liked ? 'text-rose-300' : 'text-white/55 hover:text-rose-300'
          }`}
          aria-label="点赞"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill={tweet.viewer_has_liked ? '#fb7185' : 'none'}
            stroke={tweet.viewer_has_liked ? '#fb7185' : 'currentColor'}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={likeAnim ? { animation: 'like-bounce 0.4s ease-out' } : undefined}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{tweet.likes_count}</span>
        </button>

        {/* Bookmark — 仅对登录用户显示 */}
        {session && !session.is_anonymous && (
          <button
            onClick={handleBookmark}
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition hover:bg-amber-500/10 ${
              tweet.viewer_has_bookmarked ? 'text-amber-300' : 'text-white/55 hover:text-amber-300'
            }`}
            aria-label="书签"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill={tweet.viewer_has_bookmarked ? '#f59e0b' : 'none'}
              stroke={tweet.viewer_has_bookmarked ? '#f59e0b' : 'currentColor'}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={bookmarkAnim ? { animation: 'bookmark-pop 0.4s ease-out' } : undefined}
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            <span>{tweet.viewer_has_bookmarked ? '已收藏' : '收藏'}</span>
          </button>
        )}

        {/* Share */}
        <button
          onClick={onShare}
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-white/55 transition hover:bg-cyan-500/10 hover:text-cyan-300"
          aria-label="分享"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" x2="12" y1="2" y2="15"/>
          </svg>
          <span>分享</span>
        </button>
      </div>
    </article>
  );
}
