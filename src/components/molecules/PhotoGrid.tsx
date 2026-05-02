import { motion } from 'framer-motion';
import type { Photo } from '../../hooks/usePhotos';

interface PhotoGridProps {
  photos: Photo[];
  accentColor?: 'cyan' | 'amber' | 'white';
  showEditButton?: boolean;
  onEdit?: (photo: Photo) => void;
}

const accentStyles = {
  cyan: {
    border: 'hover:border-cyan-400/40',
    gradient: 'from-black/80 to-transparent',
  },
  amber: {
    border: 'hover:border-amber-400/40',
    gradient: 'from-black/80 to-transparent',
  },
  white: {
    border: 'hover:border-white/20',
    gradient: 'from-black/80 to-transparent',
  },
};

export function PhotoGrid({ photos, accentColor = 'cyan', showEditButton = true, onEdit }: PhotoGridProps) {
  const styles = accentStyles[accentColor];

  if (!photos.length) return null;

  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        visible: { transition: { staggerChildren: 0.04 } },
      }}
    >
      {photos.map(p => (
        <motion.div
          key={p.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <a
            href={`/tweet/${p.id}`}
            className={`group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition ${styles.border}`}
          >
          <img
            src={p.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
          {showEditButton && onEdit && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(p); }}
              className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/70 opacity-0 backdrop-blur-sm transition hover:bg-cyan-500 hover:text-white group-hover:opacity-100"
              title="编辑照片信息"
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          )}
          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t ${styles.gradient} p-3 opacity-0 transition group-hover:opacity-100`}>
            {p.city && <p className="truncate text-xs text-white/90">📍 {p.city}</p>}
            {p.topic && <p className="truncate text-xs text-white/90">🏷 {p.topic}</p>}
            <p className="text-[10px] text-white/50">{new Date(p.created_at).toLocaleDateString('zh-CN')}</p>
          </div>
        </a>
      </motion.div>
      ))}
    </motion.div>
  );
}
