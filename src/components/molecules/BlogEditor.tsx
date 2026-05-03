import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface BlogEditorProps {
  initial?: { id: string; title: string; content: string; description: string; tags: string[]; published: boolean };
  saving?: boolean;
  error?: string | null;
  onSave: (data: { id?: string; title: string; content: string; description: string; tags: string[]; published: boolean }) => void;
  onClose: () => void;
}

export function BlogEditor({ initial, saving, error, onSave, onClose }: BlogEditorProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [published, setPublished] = useState(initial?.published ?? false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({
      id: initial?.id,
      title: title.trim(),
      content: content.trim(),
      description: description.trim(),
      tags,
      published,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm py-8">
      <div className="w-full max-w-3xl mx-4 rounded-2xl border border-glass-border glass-panel shadow-2xl animate-entrance">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
          <h2 className="text-lg font-bold text-primary">
            {initial ? '编辑文章' : '写文章'}
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-secondary hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-secondary mb-1.5 block">标题</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full bg-glass-bg border border-glass-border rounded-xl px-3.5 py-2.5 text-sm text-primary placeholder:text-tertiary outline-none focus:border-cyan-400/40 transition-colors"
              placeholder="文章标题"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-secondary mb-1.5 block">简介（可选）</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              className="w-full bg-glass-bg border border-glass-border rounded-xl px-3.5 py-2.5 text-sm text-primary placeholder:text-tertiary outline-none focus:border-cyan-400/40 transition-colors"
              placeholder="简短描述文章内容"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-medium text-secondary mb-1.5 block">内容（支持 Markdown）</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="w-full bg-glass-bg border border-glass-border rounded-xl px-3.5 py-2.5 text-sm text-primary placeholder:text-tertiary outline-none focus:border-cyan-400/40 transition-colors resize-y font-mono leading-relaxed"
              placeholder="使用 Markdown 格式书写..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-secondary mb-1.5 block">标签</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs text-cyan-400">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                }}
                maxLength={20}
                className="flex-1 bg-glass-bg border border-glass-border rounded-xl px-3.5 py-2 text-sm text-primary placeholder:text-tertiary outline-none focus:border-cyan-400/40 transition-colors"
                placeholder="输入标签后回车"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 rounded-xl border border-glass-border text-sm text-secondary hover:text-white hover:bg-white/5 transition-colors"
              >
                添加
              </button>
            </div>
          </div>

          {/* Publish toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setPublished(!published)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${published ? 'bg-cyan-500' : 'bg-white/15'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${published ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-secondary">
              {published ? '已发布' : '草稿'}
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-glass-border">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium text-secondary hover:text-white hover:bg-white/10 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
