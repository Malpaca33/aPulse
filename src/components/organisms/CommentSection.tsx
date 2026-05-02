import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $session } from '../../stores/session';
import { createBrowserSupabase } from '../../lib/supabase';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

const MAX_LENGTH = 500;

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

interface CommentSectionProps {
  tweetId: string;
}

export function CommentSection({ tweetId }: CommentSectionProps) {
  const session = useStore($session);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from('comments')
      .select('id, content, user_id, created_at')
      .eq('tweet_id', tweetId)
      .order('created_at', { ascending: true });

    if (!error && data) setComments(data);
  }, [tweetId]);

  // Initial load + Realtime
  useEffect(() => {
    loadComments();

    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel(`comments-${tweetId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `tweet_id=eq.${tweetId}` },
        () => loadComments()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tweetId, loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) { setStatus('请输入评论内容。'); return; }
    if (trimmed.length > MAX_LENGTH) { setStatus(`评论不能超过 ${MAX_LENGTH} 字。`); return; }
    if (!session) { setStatus('请先登录。'); return; }

    setSubmitting(true);
    setStatus('发送中...');
    const supabase = createBrowserSupabase();
    const { error } = await supabase.from('comments').insert({
      tweet_id: tweetId,
      content: trimmed,
      user_id: session.id,
    });

    if (error) {
      setStatus(error.message);
      setSubmitting(false);
      return;
    }

    setText('');
    setStatus('评论已发送。');
    setSubmitting(false);
    loadComments();
  };

  const handleDelete = async (commentId: string) => {
    if (!session) return;
    const supabase = createBrowserSupabase();
    const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('user_id', session.id);
    if (error) { setStatus(error.message); return; }
    loadComments();
  };

  const charCount = text.length;

  return (
    <section className="border-t border-white/10">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4 sm:px-6">
        <h2 className="text-base font-bold text-white">
          评论 <span className="text-sm font-normal text-white/45">({comments.length})</span>
        </h2>
      </div>

      {/* Comment form */}
      <div className="border-b border-white/10 px-4 py-4 sm:px-6">
        <form onSubmit={handleSubmit} className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-black uppercase text-white/60">
            {session ? session.email?.slice(0, 2).toUpperCase() || 'U' : 'C'}
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="写下你的评论..."
              className="min-h-[3rem] w-full resize-none border-0 bg-transparent px-0 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:ring-0"
            />
            <div className="mt-2 flex items-center justify-between">
              {status && <p className="text-xs text-white/45">{status}</p>}
              {!status && <div />}
              <div className="flex items-center gap-2">
                <span className={charCount > MAX_LENGTH ? 'text-xs text-rose-400' : 'text-xs text-white/45'}>
                  {charCount} / {MAX_LENGTH}
                </span>
                <button
                  type="submit"
                  disabled={!text.trim() || charCount > MAX_LENGTH || submitting}
                  className="rounded-full bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
                >
                  {submitting ? '发送中...' : '发送'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Comment list */}
      <div className="divide-y divide-white/10">
        {comments.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-white/35">
            还没有评论，来发表第一条吧。
          </div>
        ) : (
          comments.map((c) => {
            const isOwn = session?.id === c.user_id;
            return (
              <div key={c.id} className="group px-4 py-4 transition hover:bg-white/[0.02] sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[10px] font-black text-white/60">
                    {formatAuthor(c.user_id, session?.id).replace('@', '').slice(0, 2).toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        {formatAuthor(c.user_id, session?.id)}
                      </span>
                      <span className="text-xs text-white/25">&middot;</span>
                      <span className="text-xs text-white/40">
                        {formatRelativeTime(c.created_at)}
                      </span>
                      {isOwn && (
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="ml-auto text-xs text-rose-400/60 opacity-0 transition hover:text-rose-300 group-hover:opacity-100"
                        >
                          删除
                        </button>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/80">
                      {c.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
