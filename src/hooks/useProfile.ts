import { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabase } from '../lib/supabase';

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<{
    nickname: string;
    bio: string;
    avatarUrl: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { data } = await supabase
        .from('profiles')
        .select('nickname, bio, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile({
          nickname: data.nickname || '',
          bio: data.bio || '',
          avatarUrl: data.avatar_url || null,
        });
      } else {
        // Profile doesn't exist yet — try to create it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, nickname: '', bio: '' });

        if (!insertError) {
          setProfile({ nickname: '', bio: '', avatarUrl: null });
        }
        // If insert fails, RLS might block it — just leave profile as null
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
}

export function useUpdateProfile() {
  const [saving, setSaving] = useState(false);

  const updateProfile = useCallback(async (
    userId: string,
    data: { nickname?: string | null; bio?: string | null; avatarUrl?: string | null },
  ) => {
    setSaving(true);
    const supabase = createBrowserSupabase();

    const updates: Record<string, any> = {};
    if (data.nickname !== undefined) updates.nickname = data.nickname ?? '';
    if (data.bio !== undefined) updates.bio = data.bio ?? '';
    if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl;

    if (Object.keys(updates).length === 0) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    setSaving(false);
    if (error) throw error;
  }, []);

  return { updateProfile, saving };
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const supabase = createBrowserSupabase();

  // Validate file
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('图片大小不能超过 5MB');
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('仅支持 JPG、PNG、WebP 格式');
  }

  const ext = file.name.split('.').pop();
  const path = `${userId}/avatars/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(path);

  return publicUrl;
}
