import { useState, useCallback } from 'react';
import { Avatar } from '../atoms/Avatar';
import { ActionBar } from './ActionBar';
import { useComments, usePostComment } from '../../hooks/useComments';
import { useStore } from '@nanostores/react';
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
  onComment,
  onShare,
  onDelete,
}: TweetCardProps) {
  const timeAgo = formatTimeAgo(createdAt);
  const session = useStore($session);
  const { comments, loading: commentsLoading, refetch } = useComments(id);
  const { postComment, posting } = usePostComment();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const MAX_VISIBLE_COMMENTS = 4;
  const hasMoreComments = comments.length > MAX_VISIBLE_COMMENTS;

  const handleCommentClick = useCallback(() => {
    setShowCommentInput((v) => !v);
    onComment?.();
  }, [onComment]);

  const handleSubmitComment = useCallback(async () => {
    if (!commentInput.trim() || posting) return;
    try {
      await postComment(id, commentInput.trim());
      setCommentInput('');
      refetch();
    } catch {}
  }, [commentInput, posting, id, postComment, refetch]);

  const isAuthor = session?.id === tweetUserId;
  const tweetUrl = `/tweet/${id}`;

  return (
    <article className="group flex gap-3 px-4 py-3 transition-colors hover:bg-white/[0.01]">
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

        {/* Comment input — on demand */}
        {showCommentInput && session && (
          <div className="mt-2 pt-3 border-t border-border-subtle">
            <div className="flex gap-2">
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="写下你的评论..."
                className="flex-1 bg-surface-secondary border border-border-default rounded-xl px-3 py-2 text-sm text-primary placeholder:text-tertiary outline-none focus:border-cyan-400/40 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentInput.trim() || posting}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {posting ? '...' : '发送'}
              </button>
            </div>
          </div>
        )}

        {/* Comments — only if there are comments to show */}
        {!commentsLoading && comments.length > 0 && (
          <div className="mt-2 pt-3 border-t border-border-subtle space-y-2">
            {comments.slice(0, MAX_VISIBLE_COMMENTS).map((c: any) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-tertiary shrink-0 mt-0.5">
                  {(c.profiles?.nickname || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-primary">
                      {c.profiles?.nickname || '匿名'}
                    </span>
                    <span className="text-[10px] text-tertiary">
                      {formatTimeAgo(c.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-primary/80 whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))}
            {hasMoreComments && (
              <a
                href={tweetUrl}
                className="block text-xs text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
              >
                查看全部 {comments.length} 条评论
              </a>
            )}
          </div>
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
