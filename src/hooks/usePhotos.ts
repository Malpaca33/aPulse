import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabase } from '../lib/supabase';

export interface Photo {
  id: string;
  image_url: string;
  city: string | null;
  topic: string | null;
  created_at: string;
  content: string | null;
}

async function fetchPhotos(): Promise<Photo[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from('tweets')
    .select('id, image_url, city, topic, created_at, content')
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data || []) as Photo[];
}

export function usePhotos() {
  return useQuery({
    queryKey: ['photos'],
    queryFn: fetchPhotos,
  });
}

export function useUpdatePhoto() {
  const queryClient = useQueryClient();

  return {
    updatePhoto: async (id: string, updates: { city?: string | null; topic?: string | null }) => {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from('tweets')
        .update({
          ...(updates.city !== undefined && { city: updates.city || null }),
          ...(updates.topic !== undefined && { topic: updates.topic || null }),
        })
        .eq('id', id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  };
}
