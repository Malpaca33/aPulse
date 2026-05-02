import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '../lib/supabase';

export function ArchivePage() {
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const year = params.get('year');
  const month = params.get('month');
  const day = params.get('day');

  useEffect(() => {
    if (!year || !month || !day) {
      setLoading(false);
      return;
    }
    const supabase = createBrowserSupabase();
    const start = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00Z`;
    const end = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T23:59:59Z`;

    supabase
      .from('tweets')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setTweets(data || []);
        setLoading(false);
      });
  }, [year, month, day]);

  if (!year || !month || !day) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-secondary text-sm">
        请从归档日历中选择一个日期
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-secondary text-sm">
        加载中...
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-primary mb-4">{year}年{month}月{day}日</h2>
      {tweets.length === 0 ? (
        <p className="text-secondary text-sm">当天没有推文</p>
      ) : (
        <div className="space-y-4">
          {tweets.map((t: any) => (
            <div key={t.id} className="p-4 rounded-2xl border border-border-default bg-surface-secondary">
              <p className="text-sm text-primary whitespace-pre-wrap">{t.content}</p>
              {t.image_url && (
                <img src={t.image_url} alt="" className="mt-2 w-full max-h-[400px] object-contain bg-black rounded-xl" loading="lazy" />
              )}
              <p className="text-xs text-tertiary mt-2">{new Date(t.created_at).toLocaleString('zh-CN')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
