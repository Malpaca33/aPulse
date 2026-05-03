import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';

interface EditProfileModalProps {
  nickname: string;
  bio: string;
  avatarUrl: string | null;
  saving: boolean;
  error?: string | null;
  onSave: (data: { nickname: string; bio: string; avatarFile?: File }) => void;
  onClose: () => void;
}

export function EditProfileModal({
  nickname,
  bio,
  avatarUrl,
  saving,
  error,
  onSave,
  onClose,
}: EditProfileModalProps) {
  const [editNickname, setEditNickname] = useState(nickname);
  const [editBio, setEditBio] = useState(bio);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = () => {
    onSave({
      nickname: editNickname,
      bio: editBio,
      ...(avatarFile ? { avatarFile } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-glass-border glass-panel shadow-2xl animate-entrance">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
          <h2 className="text-lg font-bold text-primary">编辑个人资料</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-secondary hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5">
          {/* Error */}
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-cyan-400/30 bg-white/[0.05]">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-black text-white/40">
                    {(editNickname || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <Upload size={16} className="text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">头像</p>
              <p className="text-xs text-tertiary">点击上传新头像，建议 512x512，最大 5MB</p>
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="text-xs font-medium text-secondary mb-1.5 block">昵称</label>
            <input
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              maxLength={30}
              className="w-full bg-glass-bg border border-glass-border rounded-xl px-3.5 py-2.5 text-sm text-primary placeholder:text-tertiary outline-none focus:border-cyan-400/40 transition-colors"
              placeholder="输入昵称"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-medium text-secondary mb-1.5 block">简介</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              maxLength={160}
              rows={3}
              className="w-full bg-glass-bg border border-glass-border rounded-xl px-3.5 py-2.5 text-sm text-primary placeholder:text-tertiary outline-none focus:border-cyan-400/40 transition-colors resize-none"
              placeholder="介绍一下自己..."
            />
            <p className="text-[11px] text-tertiary text-right mt-1">{editBio.length}/160</p>
          </div>
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
            disabled={saving || !editNickname.trim()}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
