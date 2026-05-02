import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface ShareTweet {
  id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  user_id?: string;
  user?: { nickname?: string | null };
}

interface ShareModalProps {
  tweet: ShareTweet | null;
  onClose: () => void;
}

export function ShareModal({ tweet, onClose }: ShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (tweet) {
      generatePoster(tweet);
    } else {
      setPreviewUrl(null);
      setStatus('');
    }
  }, [tweet]);

  if (!tweet) return null;

  async function generatePoster(t: ShareTweet) {
    setGenerating(true);
    setStatus('正在生成海报...');
    setPreviewUrl(null);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const W = 600;
      const pad = 44;
      const cw = W - pad * 2;
      const ctx = canvas.getContext('2d')!;

      // Load image if present
      let img: HTMLImageElement | null = null;
      let imgW = 0, imgH = 0;
      if (t.image_url) {
        try {
          img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img!.onload = () => resolve();
            img!.onerror = () => reject();
            img!.src = t.image_url!;
            setTimeout(() => reject(new Error('timeout')), 5000);
          });
          const maxW = cw;
          const maxH = 360;
          const ratio = img.naturalWidth / img.naturalHeight;
          if (ratio >= maxW / maxH) {
            imgW = maxW;
            imgH = maxW / ratio;
          } else {
            imgH = maxH;
            imgW = maxH * ratio;
          }
        } catch {
          img = null;
        }
      }

      // Word-wrap text
      ctx.font = "17px -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif";
      const contentLines: string[] = [];
      if (t.content) {
        let line = '';
        for (const ch of t.content) {
          if (ctx.measureText(line + ch).width > cw) {
            contentLines.push(line);
            line = ch;
          } else {
            line += ch;
          }
        }
        if (line) contentLines.push(line);
      }

      // Calculate canvas height
      let H = pad;
      H += 28; // brand
      H += 28; // padding
      if (img) H += imgH + 28;
      H += contentLines.length * 28;
      if (!t.content && !img) H += 28;
      H += 24;
      H += 16;
      H += pad;

      canvas.width = W;
      canvas.height = Math.max(H, 280);

      // Dark gradient background
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#0b0b14');
      bg.addColorStop(0.4, '#0e0e1b');
      bg.addColorStop(1, '#09090f');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, canvas.height, 24);
      ctx.fill();

      // Brand dot
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(pad + 5, pad + 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Brand text
      ctx.fillStyle = '#ffffff';
      ctx.font = "600 17px -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif";
      ctx.fillText('aPulse', pad + 18, pad + 16);

      let y = pad + 28 + 28;

      // Image
      if (img) {
        const ix = pad + (cw - imgW) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(ix, y, imgW, imgH, 18);
        ctx.clip();
        ctx.drawImage(img, ix, y, imgW, imgH);
        ctx.restore();
        y += imgH + 28;
      }

      // Content text
      ctx.fillStyle = '#e8e8e8';
      ctx.font = "17px -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif";
      if (contentLines.length) {
        for (const line of contentLines) {
          ctx.fillText(line, pad, y + 22);
          y += 28;
        }
      } else if (!img) {
        ctx.fillStyle = '#666';
        ctx.fillText('分享自 aPulse', pad, y + 22);
        y += 28;
      }

      y += 8;

      // Separator
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(W - pad, y);
      ctx.stroke();
      y += 20;

      // Timestamp
      const ts = new Date(t.created_at).toLocaleString('zh-CN', { hour12: false });
      ctx.fillStyle = '#4a4a55';
      ctx.font = "11px -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif";
      ctx.fillText(ts, pad, y + 30);

      // Slogan
      ctx.fillStyle = 'rgba(56,189,248,0.35)';
      ctx.font = "11px -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif";
      const slogan = '说什么都能被听见';
      ctx.fillText(slogan, W - pad - ctx.measureText(slogan).width, canvas.height - pad + 4);

      const dataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(dataUrl);
      setStatus('');
    } catch {
      setStatus('海报生成失败');
    } finally {
      setGenerating(false);
    }
  }

  async function copyPosterImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('no blob');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setStatus('海报已复制到剪贴板');
    } catch {
      const a = document.createElement('a');
      a.download = `apulse-${tweet.id}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      setStatus('已下载海报图片');
    }
  }

  async function copyTweetLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/tweet/${tweet.id}`);
      setStatus('链接已复制');
    } catch {
      setStatus(`${window.location.origin}/tweet/${tweet.id}`);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-3xl border border-border-default bg-surface-primary p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-primary">分享推文</h3>
          <button
            onClick={onClose}
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-tertiary hover:bg-white/5 hover:text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="rounded-2xl border border-border-default bg-black/20 p-3 mb-4">
          {generating ? (
            <div className="flex items-center justify-center h-48 text-sm text-tertiary">
              生成中...
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="海报预览" className="w-full rounded-xl" />
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-tertiary">
              生成失败
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyPosterImage}
            className="flex-1 rounded-full bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            复制海报图片
          </button>
          <button
            onClick={copyTweetLink}
            className="rounded-full border border-border-default px-4 py-2.5 text-sm font-semibold text-secondary hover:border-cyan-400/40 hover:text-white transition-colors"
          >
            复制链接
          </button>
        </div>

        {status && (
          <p className="mt-3 text-center text-xs text-tertiary">{status}</p>
        )}
      </div>
    </div>
  );
}
