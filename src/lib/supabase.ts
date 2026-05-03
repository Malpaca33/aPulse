import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

function assertEnv(name: string, value: string): string {
  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${name}`);
  }
  return value;
}

function normalizeSupabaseUrl(value: string): string {
  const normalizedValue = assertEnv('PUBLIC_SUPABASE_URL', value).trim().replace(/^['"]|['"]$/g, '');
  let url: URL;
  try {
    url = new URL(normalizedValue);
  } catch {
    throw new Error('PUBLIC_SUPABASE_URL must be a valid URL like https://your-project.supabase.co');
  }
  return url.origin;
}

function normalizeSupabaseAnonKey(value: string): string {
  return assertEnv('PUBLIC_SUPABASE_ANON_KEY', value).trim().replace(/^['"]|['"]$/g, '');
}

function getSupabaseConfig() {
  return {
    url: normalizeSupabaseUrl(supabaseUrl),
    anonKey: normalizeSupabaseAnonKey(supabaseAnonKey),
  };
}

let browserClient: ReturnType<typeof createClient<Database>> | undefined;

export function createBrowserSupabase() {
  if (typeof window === 'undefined') {
    throw new Error('createBrowserSupabase() must only run in the browser.');
  }
  if (!browserClient) {
    const { url, anonKey } = getSupabaseConfig();
    browserClient = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}

export function createServerSupabase(accessToken?: string) {
  const { url, anonKey } = getSupabaseConfig();
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export function getAccessTokenFromRequest(request: Request): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.slice('Bearer '.length).trim();
}

export async function getUserFromRequest(request: Request) {
  const accessToken = getAccessTokenFromRequest(request);
  if (!accessToken) {
    return { accessToken: null, user: null, supabase: createServerSupabase() };
  }
  const supabase = createServerSupabase(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return { accessToken: null, user: null, supabase: createServerSupabase() };
  }
  return { accessToken, user: data.user, supabase };
}
