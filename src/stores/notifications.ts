import { atom, computed } from 'nanostores';
import { createBrowserSupabase } from '../lib/supabase';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'feature';
  message: string;
  created_at: string;
  is_read: boolean;
}

export const $notifications = atom<Notification[]>([]);
export const $unreadCount = computed($notifications, (ns) =>
  ns.filter((n) => !n.is_read).length
);

export function setNotifications(ns: Notification[]) {
  $notifications.set(ns);
}

export function addNotification(n: Notification) {
  $notifications.set([n, ...$notifications.get()]);
}

export function markAllRead() {
  $notifications.set(
    $notifications.get().map((n) => ({ ...n, is_read: true }))
  );
}

export async function loadNotifications() {
  const supabase = createBrowserSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from('notifications')
    .select('id, type, source_user_id, target_user_id, tweet_id, read, created_at')
    .eq('target_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (data) {
    const messages: Record<string, string> = {
      comment: '评论了你的推文',
      like: '赞了你的推文',
      star: '收藏了你的推文',
    };
    setNotifications(
      data.map((n: any) => ({
        id: n.id,
        type: n.type,
        message: messages[n.type] || '与你互动',
        created_at: n.created_at,
        is_read: n.read,
      }))
    );
  }
}
