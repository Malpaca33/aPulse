import { useState, useCallback } from 'react';
import { useComments, usePostComment } from '../../hooks/useComments';
import { useStore } from '@nanostores/react';
import { $session } from '../../stores/session';

const MAX_VISIBLE_COMMENTS = 4;

export function InlineComments({ tweetId, tweetUrl }: { tweetId: string; tweetUrl: string }) {
  const session = useStore($session);
  const { comments, loading, refetch } = useComments(tweetId);
  const { postComment, posting } = usePostComment();
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || posting) return;
    await postComment(tweetId, input.trim());
    setInput('');
    setShowInput(false);
    refetch();
  }, [input, posting, tweetId, postComment, refetch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const hasMore = comments.length > MAX_VISIBLE_COMMENTS;

  if (loading || comments.length === 0) return null;

  return (
    <div className="mt-2 pt-3 border-t border-border-subtle space-y-2">
      {/* Comment input — appears inline */}
      {showInput && session && (
        <div className="flex gap-2 pb-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="写下你的评论..."
            className="flex-1 bg-surface-secondary border border-border-default rounded-xl px-3 py-2 text-sm text-primary placeholder:text-tertiary outline-none focus:border-cyan-400/40 transition-colors"
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || posting}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {posting ? '...' : '发送'}
          </button>
        </div>
      )}

      {/* Comment list */}
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

      {hasMore && (
        <a
          href={tweetUrl}
          className="block text-xs text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
        >
          查看全部 {comments.length} 条评论
        </a>
      )}
    </div>
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
