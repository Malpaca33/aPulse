import {createClient} from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

function assertEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${name}`);
  }

  return value;
}

function normalizeSupabaseUrl(value) {
  const normalizedValue = assertEnv('PUBLIC_SUPABASE_URL', value).trim().replace(/^['"]|['"]$/g, '');

  let url;

  try {
    url = new URL(normalizedValue);
  } catch {
    throw new Error('PUBLIC_SUPABASE_URL must be a valid URL like https://your-project.supabase.co');
  }

  // Supabase client expects the project origin, not a product endpoint like /rest/v1.
  return url.origin;
}

function normalizeSupabaseAnonKey(value) {
  return assertEnv('PUBLIC_SUPABASE_ANON_KEY', value).trim().replace(/^['"]|['"]$/g, '');
}

function getSupabaseConfig() {
  return {
    url: normalizeSupabaseUrl(supabaseUrl),
    anonKey: normalizeSupabaseAnonKey(supabaseAnonKey),
  };
}

let browserClient;

export function createBrowserSupabase() {
  if (typeof window === 'undefined') {
    throw new Error('createBrowserSupabase() must only run in the browser.');
  }

  if (!browserClient) {
    const { url, anonKey } = getSupabaseConfig();
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}

export function createServerSupabase(accessToken) {
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
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

export function getAccessTokenFromRequest(request) {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
}

export async function getUserFromRequest(request) {
  const accessToken = getAccessTokenFromRequest(request);

  if (!accessToken) {
    return { accessToken: null, user: null, supabase: createServerSupabase() };
  }

  const supabase = createServerSupabase(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return { accessToken: null, user: null, supabase: createServerSupabase() };
  }

  return {
    accessToken,
    user: data.user,
    supabase,
  };
}
