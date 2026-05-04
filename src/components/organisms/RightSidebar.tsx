import { useEffect, useState } from 'react';
import { MapPin, BarChart3 } from 'lucide-react';
import { SearchBar } from '../molecules/SearchBar';
import { createBrowserSupabase } from '../../lib/supabase';

function GlassCard({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`glass-card rounded-2xl p-4 animate-entrance-up ${className}`} style={style}>
      {children}
    </div>
  );
}

export function RightSidebar() {
  const [stats, setStats] = useState<{ tweets: number; articles: number; photos: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createBrowserSupabase();
        const [tweetsRes, articlesRes, photosRes] = await Promise.all([
          supabase.from('tweets').select('id', { count: 'exact', head: true }),
          supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('published', true),
          supabase.from('tweets').select('id', { count: 'exact', head: true }).not('image_url', 'is', null),
        ]);
        setStats({
          tweets: tweetsRes.count ?? 0,
          articles: articlesRes.count ?? 0,
          photos: photosRes.count ?? 0,
        });
      } catch {
        // 静默失败
      }
    };
    fetchStats();
  }, []);

  return (
    <aside className="flex flex-col gap-4 py-4">
      {/* Search */}
      <GlassCard style={{ animationDelay: '0ms' }}>
        <SearchBar />
      </GlassCard>

      {/* Stats */}
      <GlassCard style={{ animationDelay: '60ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-primary">内容概览</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(
            stats
              ? [
                  { label: '动态', value: stats.tweets, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  { label: '文章', value: stats.articles, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: '照片', value: stats.photos, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ]
              : [
                  { label: '动态', value: '—', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  { label: '文章', value: '—', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: '照片', value: '—', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ]
          ).map((item) => (
            <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[11px] text-secondary mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Map link */}
      <GlassCard style={{ animationDelay: '180ms' }}>
        <a href="/photos" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-indigo-500/30 transition-all">
            <MapPin size={18} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary group-hover:text-white transition-colors">照片地图</p>
            <p className="text-[11px] text-tertiary">按城市查看拍摄的照片</p>
          </div>
        </a>
      </GlassCard>
    </aside>
  );
}
