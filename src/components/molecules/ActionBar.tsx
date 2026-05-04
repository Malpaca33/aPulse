import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Heart, Bookmark, MessageCircle, Share } from 'lucide-react';

interface ActionBarProps {
  likesCount: number;
  commentsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  hideBookmark?: boolean;
  onLike?: () => void;
  onBookmark?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function ActionBar({
  likesCount,
  commentsCount,
  isLiked,
  isBookmarked,
  hideBookmark,
  onLike,
  onBookmark,
  onComment,
  onShare,
}: ActionBarProps) {
  const [animating, setAnimating] = useState<string | null>(null);

  const handleClick = useCallback((action: string, handler?: () => void) => {
    setAnimating(action);
    handler?.();
    setTimeout(() => setAnimating(null), 350);
  }, []);

  return (
    <div className="flex items-center gap-1">
      {/* Comment */}
      <button
        onClick={() => handleClick('comment', onComment)}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-200',
          'text-tertiary hover:text-cyan-400 hover:bg-cyan-500/10'
        )}
      >
        <MessageCircle
          size={18}
          className={cn(
            'transition-all duration-200',
            animating === 'comment' && 'scale-110'
          )}
        />
        {commentsCount !== undefined && commentsCount > 0 && (
          <span className="text-xs">{commentsCount}</span>
        )}
      </button>

      {/* Like */}
      <button
        onClick={() => handleClick('like', onLike)}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-200',
          isLiked
            ? 'text-semantic-like hover:bg-rose-500/15'
            : 'text-tertiary hover:text-semantic-like hover:bg-rose-500/10'
        )}
      >
        <Heart
          size={18}
          className={cn(
            'transition-all duration-200',
            isLiked ? 'fill-semantic-like scale-110' : '',
            animating === 'like' && 'animate-like'
          )}
        />
        {likesCount > 0 && (
          <span className={cn('text-xs', isLiked && 'text-semantic-like')}>{likesCount}</span>
        )}
      </button>

      {/* Bookmark — 仅对登录用户显示 */}
      {!hideBookmark && (
        <button
          onClick={() => handleClick('bookmark', onBookmark)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-200',
            isBookmarked
              ? 'text-semantic-bookmark hover:bg-amber-500/15'
              : 'text-tertiary hover:text-semantic-bookmark hover:bg-amber-500/10'
          )}
        >
          <Bookmark
            size={18}
            className={cn(
              'transition-all duration-200',
              isBookmarked ? 'fill-semantic-bookmark scale-110' : '',
              animating === 'bookmark' && 'animate-bookmark'
            )}
          />
        </button>
      )}

      {/* Share */}
      <button
        onClick={() => handleClick('share', onShare)}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-tertiary transition-all duration-200 hover:text-cyan-400 hover:bg-cyan-500/10"
      >
        <Share
          size={18}
          className={cn(
            'transition-all duration-200',
            animating === 'share' && 'animate-share'
          )}
        />
      </button>
    </div>
  );
}
