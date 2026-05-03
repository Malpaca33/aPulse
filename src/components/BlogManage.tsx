import { useState, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { Pencil, Trash2, Plus, ExternalLink } from 'lucide-react';
import { QueryProvider } from './QueryProvider';
import { FeedLayout } from './templates/FeedLayout';
import { BlogEditor } from './molecules/BlogEditor';
import { $session, $sessionLoading, initSession, signInAnonymously, signInWithOAuth, signOut } from '../stores/session';
import { useBlogPosts, useSaveBlogPost, useDeleteBlogPost } from '../hooks/useBlogPosts';

function BlogManageContent() {
  const session = useStore($session);
  const sessionLoading = useStore($sessionLoading);
  const { data: posts = [], isLoading } = useBlogPosts();
  const { mutateAsync: savePost, isPending: saving } = useSaveBlogPost();
  const { mutateAsync: deletePost } = useDeleteBlogPost();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editPost, setEditPost] = useState<any>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSave = useCallback(async (data: any) => {
    setSaveError(null);
    try {
      await savePost(data);
      setEditorOpen(false);
      setEditPost(null);
    } catch (e: any) {
      setSaveError(e?.message || '保存失败');
    }
  }, [savePost]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deletePost(id);
      setDeleteConfirm(null);
    } catch {}
  }, [deletePost]);

  const user = session
    ? { nickname: session.user_metadata?.nickname || session.email || '用户', avatarUrl: null }
    : null;

  const publishedPosts = posts.filter(p => p.published);
  const draftPosts = posts.filter(p => !p.published);

  return (
    <FeedLayout
      user={user}
      currentPath="/blog/manage"
      onLogin={(p) => signInWithOAuth(p)}
      onAnonymousLogin={signInAnonymously}
      onLogout={signOut}
      sessionLoading={sessionLoading}
      hideRightSidebar
    >
      {/* Header */}
      <div className="sticky top-0 z-10 glass-header border-b border-glass-border">
        <div className="px-4 h-12 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">文章管理</h1>
          <button
            onClick={() => { setEditPost(null); setEditorOpen(true); setSaveError(null); }}
            className="flex items-center gap-1.5 rounded-full bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            <Plus size={14} />
            写文章
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-tertiary">加载中...</div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-secondary text-sm">还没有文章</p>
            <button
              onClick={() => { setEditPost(null); setEditorOpen(true); setSaveError(null); }}
              className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
            >
              写第一篇
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Published posts */}
            {publishedPosts.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-3">已发布 ({publishedPosts.length})</h2>
                <div className="space-y-2">
                  {publishedPosts.map(post => (
                    <PostRow key={post.id} post={post} onEdit={() => { setEditPost(post); setEditorOpen(true); }} onDelete={() => setDeleteConfirm(post.id)} />
                  ))}
                </div>
              </section>
            )}

            {/* Drafts */}
            {draftPosts.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-3">草稿 ({draftPosts.length})</h2>
                <div className="space-y-2">
                  {draftPosts.map(post => (
                    <PostRow key={post.id} post={post} onEdit={() => { setEditPost(post); setEditorOpen(true); }} onDelete={() => setDeleteConfirm(post.id)} isDraft />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Blog Editor Modal */}
      {editorOpen && (
        <BlogEditor
          initial={editPost || undefined}
          saving={saving}
          error={saveError}
          onSave={handleSave}
          onClose={() => { setEditorOpen(false); setEditPost(null); setSaveError(null); }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl border border-glass-border glass-panel p-6 animate-entrance">
            <h3 className="text-base font-bold text-primary mb-2">确认删除</h3>
            <p className="text-sm text-secondary mb-5">删除后无法恢复，确定要删除这篇文章吗？</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl text-sm text-secondary hover:text-white hover:bg-white/10 transition-colors">取消</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-xl bg-rose-500 text-sm font-semibold text-white hover:bg-rose-400 transition-colors">删除</button>
            </div>
          </div>
        </div>
      )}
    </FeedLayout>
  );
}

function PostRow({ post, onEdit, onDelete, isDraft }: { post: any; onEdit: () => void; onDelete: () => void; isDraft?: boolean }) {
  const date = new Date(post.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="glass-card rounded-xl p-4 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-primary truncate">{post.title}</h3>
          {isDraft && <span className="text-[10px] rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-400">草稿</span>}
        </div>
        <p className="text-xs text-tertiary">{date} · {post.slug}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {post.published && (
          <a
            href={`/blog/${post.slug}`}
            className="h-7 w-7 rounded-full flex items-center justify-center text-secondary hover:text-cyan-400 hover:bg-white/5 transition-colors"
            title="查看"
          >
            <ExternalLink size={14} />
          </a>
        )}
        <button onClick={onEdit} className="h-7 w-7 rounded-full flex items-center justify-center text-secondary hover:text-white hover:bg-white/10 transition-colors" title="编辑">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="h-7 w-7 rounded-full flex items-center justify-center text-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="删除">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function BlogManage() {
  return (
    <QueryProvider>
      <BlogManageContent />
    </QueryProvider>
  );
}
