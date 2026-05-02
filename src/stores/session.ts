import { atom, computed } from 'nanostores';
import { createBrowserSupabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const $session = atom<User | null>(null);
export const $isLoggedIn = computed($session, (s) => s !== null);
export const $isAnonymous = computed($session, (s) => s?.is_anonymous ?? true);
export const $sessionLoading = atom(true);

export function setSession(user: User | null) {
  $session.set(user);
  $sessionLoading.set(false);
}

export async function initSession() {
  try {
    const supabase = createBrowserSupabase();

    // 监听所有会话变化事件
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        $session.set(session.user);
      } else if (event === 'SIGNED_OUT') {
        $session.set(null);
      }
      $sessionLoading.set(false);
    });

    // 获取现有 session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      $session.set(session.user);
      $sessionLoading.set(false);
    }

    // 安全超时：3 秒后无论有无 session 都停止 loading
    setTimeout(() => {
      if ($sessionLoading.get()) {
        $sessionLoading.set(false);
      }
    }, 3000);
  } catch {
    $sessionLoading.set(false);
  }
}

export const LOGIN_METHODS = {
  google: { provider: 'google' as const, label: 'Google 登录', icon: 'G' },
  qq: { provider: 'qq' as const, label: 'QQ 登录', icon: 'Q' },
} as const;

export async function signInAnonymously() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  setSession(data.user);
}

export async function signInWithOAuth(provider: 'google' | 'qq') {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createBrowserSupabase();
  await supabase.auth.signOut();
  setSession(null);
}
