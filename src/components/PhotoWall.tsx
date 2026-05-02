import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QueryProvider } from './QueryProvider';
import { PhotoGrid } from './molecules/PhotoGrid';
import { MapView } from './molecules/MapView';
import { PhotoEditModal } from './molecules/PhotoEditModal';
import { usePhotos, useUpdatePhoto } from '../hooks/usePhotos';
import { cn } from '../lib/utils';

type ViewTab = 'topic' | 'city' | 'map';

const tabs: { key: ViewTab; label: string }[] = [
  { key: 'topic', label: '按主题' },
  { key: 'city', label: '按城市' },
  { key: 'map', label: '地图' },
];

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

function PhotoWallContent() {
  const { data: photos = [], isLoading, error } = usePhotos();
  const { updatePhoto } = useUpdatePhoto();
  const [currentTab, setCurrentTab] = useState<ViewTab>('topic');
  const [editing, setEditing] = useState<{ id: string; city: string; topic: string } | null>(null);

  const handleEdit = useCallback((photo: any) => {
    setEditing({ id: photo.id, city: photo.city || '', topic: photo.topic || '' });
  }, []);

  const handleSave = useCallback(async (id: string, updates: { city?: string | null; topic?: string | null }) => {
    await updatePhoto(id, updates);
  }, [updatePhoto]);

  const renderContent = () => {
    if (isLoading) {
      return <p className="py-12 text-center text-sm text-white/40">加载中...</p>;
    }
    if (error) {
      return <p className="py-12 text-center text-sm text-rose-400">加载失败: {(error as Error).message}</p>;
    }
    if (!photos.length) {
      return (
        <div className="py-20 text-center">
          <p className="mb-4 text-4xl">📷</p>
          <p className="text-white/40">还没有带照片的推文。发帖时带上图片、城市和主题标签吧。</p>
        </div>
      );
    }

    if (currentTab === 'map') {
      return <MapView photos={photos} />;
    }

    if (currentTab === 'topic') {
      const groups = groupBy(photos, p => p.topic || '未分类');
      const sorted = Object.entries(groups).sort(([a], [b]) => {
        if (a === '未分类') return 1;
        if (b === '未分类') return -1;
        return groups[b].length - groups[a].length;
      });

      return sorted.map(([topic, topicPhotos]) => (
        <section key={topic} className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-300">{topic}</span>
            <span className="text-xs text-white/35">{topicPhotos.length} 张</span>
          </div>
          <PhotoGrid photos={topicPhotos} accentColor="cyan" onEdit={handleEdit} />
        </section>
      ));
    }

    // city view
    const noCity: typeof photos = [];
    const cityMap = groupBy(photos, p => {
      if (!p.city) { noCity.push(p); return ''; }
      return p.city;
    });
    delete cityMap[''];

    const cityNames = Object.keys(cityMap).sort((a, b) => cityMap[b].length - cityMap[a].length);

    return (
      <>
        {cityNames.map(city => (
          <section key={city} className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-300">📍 {city}</span>
              <span className="text-xs text-white/35">{cityMap[city].length} 张</span>
            </div>
            <PhotoGrid photos={cityMap[city]} accentColor="amber" onEdit={handleEdit} />
          </section>
        ))}
        {noCity.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white/50">未标注城市</span>
              <span className="text-xs text-white/35">{noCity.length} 张</span>
            </div>
            <PhotoGrid photos={noCity} accentColor="white" onEdit={handleEdit} />
          </section>
        )}
      </>
    );
  };

  return (
    <section className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 transition hover:text-cyan-300">&larr; 返回主页</a>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">照片墙</h1>
            <p className="mt-1 text-sm text-white/55">按主题和城市浏览你的影像记录</p>
          </div>
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCurrentTab(tab.key)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  currentTab === tab.key
                    ? 'bg-cyan-500 font-bold text-black'
                    : 'bg-white/[0.05] text-white/60 hover:bg-white/10'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      {editing && (
        <PhotoEditModal
          photoId={editing.id}
          initialCity={editing.city}
          initialTopic={editing.topic}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

export function PhotoWall() {
  return (
    <QueryProvider>
      <PhotoWallContent />
    </QueryProvider>
  );
}
