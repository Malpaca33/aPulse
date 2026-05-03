import { useState, useRef, useCallback } from 'react';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';
import { ImagePlus, X, MapPin } from 'lucide-react';

interface TweetComposerProps {
  userAvatar?: string | null;
  userName?: string;
  onSubmit: (content: string, image?: File) => Promise<void>;
  placeholder?: string;
}

const MAX_CHARS = 280;

export function TweetComposer({
  userAvatar,
  userName,
  onSubmit,
  placeholder = '有什么想说的？',
}: TweetComposerProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !submitting;

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const removeImage = useCallback(() => {
    setImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }, [preview]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(content, image || undefined);
      setContent('');
      removeImage();
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, content, image, onSubmit, removeImage]);

  // Char ring SVG
  const circumference = 2 * Math.PI * 10;
  const strokeDashoffset = circumference * (1 - charsLeft / MAX_CHARS);

  return (
    <div className="flex gap-3 px-4 py-4 border-b border-glass-border glass-card rounded-none">
      <Avatar src={userAvatar} alt={userName || '我'} size="lg" />
      <div className="flex-1 min-w-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={Math.min(Math.max(content.split('\n').length, 4), 10)}
          className="w-full bg-transparent text-lg text-primary placeholder:text-tertiary resize-none outline-none mt-2 leading-relaxed"
        />
        {preview && (
          <div className="relative mt-2 rounded-2xl overflow-hidden border border-border-subtle">
            <img src={preview} alt="预览" className="max-h-60 w-full object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileRef.current?.click()}
              className="h-8 w-8 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              <ImagePlus size={20} />
            </button>
            <button className="h-8 w-8 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 transition-colors">
              <MapPin size={20} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative h-5 w-5">
              <svg className="transform -rotate-90 h-5 w-5" viewBox="0 0 24 24">
                <circle
                  cx="12" cy="12" r="10"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
                <circle
                  cx="12" cy="12" r="10"
                  fill="none"
                  stroke={isOverLimit ? '#f87171' : '#06b6d4'}
                  strokeWidth="2"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
            </div>
            <Button
              size="sm"
              disabled={!canSubmit}
              loading={submitting}
              onClick={handleSubmit}
            >
              发布
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
