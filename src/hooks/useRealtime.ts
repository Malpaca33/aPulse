import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStore } from '@nanostores/react';
import { createBrowserSupabase } from '../lib/supabase';
import { $session } from '../stores/session';
import { addNotification, type Notification } from '../stores/notifications';

export function useRealtimeFeed() {
  const queryClient = useQueryClient();
  const session = useStore($session);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    const channels: ReturnType<typeof supabase.channel>[] = [];

    // 监听新推文 → 刷新时间线
    const tweetChannel = supabase
      .channel('feed-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tweets' },
        () => queryClient.invalidateQueries({ queryKey: ['tweets'] })
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tweet_likes' },
        () => queryClient.invalidateQueries({ queryKey: ['tweets'] })
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        () => queryClient.invalidateQueries({ queryKey: ['tweets'] })
      )
      .subscribe();

    channels.push(tweetChannel);

    // 登录用户：监听通知
    if (session?.id) {
      const notifChannel = supabase
        .channel('notif-changes')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `target_user_id=eq.${session.id}`,
          },
          (payload) => {
            const n = payload.new as any;
            addNotification({
              id: n.id,
              type: n.type,
              message: '',
              created_at: n.created_at,
              is_read: n.read ?? false,
            });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        )
        .subscribe();

      channels.push(notifChannel);
    }

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [queryClient, session?.id]);
}
