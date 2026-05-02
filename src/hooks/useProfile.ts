import { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabase } from '../lib/supabase';

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<{
    nickname: string;
    bio: string;
    avatarUrl: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const supabase = createBrowserSupabase();
    supabase
      .from('profiles')
      .select('nickname, bio, avatar_url')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            nickname: data.nickname || '',
            bio: data.bio || '',
            avatarUrl: data.avatar_url || null,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  return { profile, loading };
}

export function useUpdateProfile() {
  const [saving, setSaving] = useState(false);

  const updateProfile = useCallback(async (
    userId: string,
    data: { nickname?: string; bio?: string; avatarUrl?: string | null },
  ) => {
    setSaving(true);
    const supabase = createBrowserSupabase();

    const updates: Record<string, any> = {};
    if (data.nickname !== undefined) updates.nickname = data.nickname;
    if (data.bio !== undefined) updates.bio = data.bio;
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
  const ext = file.name.split('.').pop();
  const path = `avatars/${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(path);

  return publicUrl;
}
