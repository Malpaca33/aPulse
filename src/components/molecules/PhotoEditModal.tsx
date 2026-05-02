import { useState } from 'react';
import { PROVINCES, PROVINCE_NAMES, TOPICS } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface PhotoEditModalProps {
  photoId: string | null;
  initialCity: string;
  initialTopic: string;
  onSave: (id: string, updates: { city?: string | null; topic?: string | null }) => Promise<void>;
  onClose: () => void;
}

export function PhotoEditModal({ photoId, initialCity, initialTopic, onSave, onClose }: PhotoEditModalProps) {
  const [city, setCity] = useState(initialCity);
  const [topic, setTopic] = useState(initialTopic);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [showProvinceGrid, setShowProvinceGrid] = useState(false);
  const [showCityGrid, setShowCityGrid] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  if (!photoId) return null;

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
    setShowCityGrid(true);
  };

  const handleCitySelect = (c: string) => {
    setCity(c);
    setShowProvinceGrid(false);
    setShowCityGrid(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus('保存中...');
    try {
      await onSave(photoId, { city: city || null, topic: topic || null });
      setStatus('已保存 ✓');
      setTimeout(onClose, 800);
    } catch (e: any) {
      setStatus(e?.message || '保存失败');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-3xl border border-white/10 bg-zinc-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">编辑照片信息</h3>
          <button onClick={onClose} type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition hover:bg-white/[0.06] hover:text-white">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="space-y-4">
          {/* City selector */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">城市</p>
            <button
              onClick={() => { setShowProvinceGrid(!showProvinceGrid); setShowCityGrid(false); }}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              📍 <span>{city || '未选择'}</span>
            </button>
            {/* Province grid */}
            {showProvinceGrid && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {PROVINCE_NAMES.map(pr => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => handleProvinceSelect(pr)}
                    className={cn(
                      'rounded-xl border px-2 py-2.5 text-xs font-semibold transition',
                      selectedProvince === pr
                        ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200'
                        : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200'
                    )}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            )}
            {/* City grid */}
            {showCityGrid && selectedProvince && (
              <div className="mt-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">选择城市</p>
                <div className="flex flex-wrap gap-2">
                  {PROVINCES[selectedProvince].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCitySelect(c)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs transition',
                        city === c
                          ? 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                          : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-200'
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Topic selector */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">风格</p>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs transition',
                    topic === t
                      ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30'
                      : 'border-white/10 bg-white/[0.04] text-white/60 hover:border-cyan-400/30 hover:text-white'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            type="button"
            className="w-full rounded-full bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
          {status && <p className="text-center text-xs text-white/40">{status}</p>}
        </div>
      </div>
    </div>
  );
}
