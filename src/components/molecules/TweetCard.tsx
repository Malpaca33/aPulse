import { useState, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { Avatar } from '../atoms/Avatar';
import { ActionBar } from './ActionBar';
import { InlineComments } from './InlineComments';
import { $session } from '../../stores/session';

interface TweetCardProps {
  id: string;
  content: string;
  imageUrl?: string | null;
  city?: string | null;
  topic?: string | null;
  userId: string;
  createdAt: string;
  user: {
    nickname?: string | null;
    avatarUrl?: string | null;
  };
  likesCount: number;
  commentsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onBookmark?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

export function TweetCard({
  id,
  content,
  imageUrl,
  city,
  topic,
  userId: tweetUserId,
  createdAt,
  user,
  likesCount,
  commentsCount,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  onShare,
  onDelete,
}: TweetCardProps) {
  const timeAgo = formatTimeAgo(createdAt);
  const session = useStore($session);
  const [showComments, setShowComments] = useState(false);

  const handleCommentClick = useCallback(() => {
    setShowComments((v) => !v);
  }, []);

  const isAuthor = session?.id === tweetUserId;
  const tweetUrl = `/tweet/${id}`;

  return (
    <article className="group flex gap-3 px-4 py-3 transition-all duration-200 rounded-none last-of-type:rounded-b-2xl border-b border-border-subtle last:border-b-0">
      {/* Avatar */}
      <div className="shrink-0">
        <Avatar src={user.avatarUrl} alt={user.nickname || '用户'} size="lg" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        {/* Clickable body */}
        <a href={tweetUrl} className="block space-y-1">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-primary truncate">
              {user.nickname || '匿名用户'}
            </span>
            <span className="text-tertiary shrink-0">{timeAgo}</span>
            {city && (
              <>
                <span className="text-tertiary">·</span>
                <span className="text-tertiary truncate">{city}</span>
              </>
            )}
          </div>

          {/* Body */}
          <p className="text-[15px] leading-relaxed text-primary whitespace-pre-wrap break-words">
            {content}
          </p>

          {/* Image */}
          {imageUrl && (
            <div className="mt-2 rounded-2xl overflow-hidden border border-border-subtle">
              <img
                src={imageUrl}
                alt="推文图片"
                className="w-full max-h-[520px] object-contain bg-black"
                loading="lazy"
              />
            </div>
          )}

          {/* Topic tag */}
          {topic && (
            <span className="inline-block mt-1 text-xs text-cyan-400 bg-cyan-500/10 rounded-full px-2.5 py-0.5">
              #{topic}
            </span>
          )}
        </a>

        {/* Actions + Delete */}
        <div className="pt-1 flex items-center justify-between">
          <ActionBar
            likesCount={likesCount}
            commentsCount={commentsCount}
            isLiked={isLiked}
            isBookmarked={isBookmarked}
            hideBookmark={!session || session.is_anonymous}
            onLike={onLike}
            onBookmark={onBookmark}
            onComment={handleCommentClick}
            onShare={onShare}
          />
          {isAuthor && onDelete && (
            <button
              onClick={onDelete}
              className="text-xs rounded-full px-2.5 py-1 text-rose-400/50 transition-all duration-200 hover:text-rose-400 hover:bg-rose-500/10"
              title="删除推文"
            >
              删除
            </button>
          )}
        </div>

        {/* Inline Comments */}
        {showComments && (
          <InlineComments tweetId={id} tweetUrl={tweetUrl} />
        )}
      </div>
    </article>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
