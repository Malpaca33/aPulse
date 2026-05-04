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
    // URL hash 中有 access_token 时手动提取（处理 OAuth 回调）
    const hashStr = window.location.hash || '';
    if (hashStr && hashStr.includes('access_token')) {
      try {
        const params = new URLSearchParams(hashStr.replace(/^#/, ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          const supabase = createBrowserSupabase();
          const { data } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (data?.session) {
            $session.set(data.session.user);
            $sessionLoading.set(false);
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }
        }
      } catch {
        // 静默降级，继续尝试从 storage 恢复
      }
    }

    // 通过 localStorage 恢复 session
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      $session.set(session.user);
      $sessionLoading.set(false);
    }

    // 安全超时
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
    options: {
      redirectTo: window.location.origin + '/',
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createBrowserSupabase();
  await supabase.auth.signOut();
  setSession(null);
}
