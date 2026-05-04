import { createBrowserSupabase } from '../../../lib/supabase';

export interface Photo {
  id: string;
  image_url: string;
  city: string | null;
  topic: string | null;
  created_at: string;
  content: string | null;
}

export async function fetchPhotos(limit = 100): Promise<Photo[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from('tweets')
    .select('id, image_url, city, topic, created_at, content')
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as Photo[];
}

export async function updatePhotoMetadata(id: string, updates: { city?: string | null; topic?: string | null }): Promise<void> {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from('tweets')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}
