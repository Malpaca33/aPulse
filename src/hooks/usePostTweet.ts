import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabase } from '../lib/supabase';

async function postTweet({ content, imageUrl, city, topic }: {
  content: string;
  imageUrl?: string;
  city?: string;
  topic?: string;
}) {
  const supabase = createBrowserSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('请先登录');

  const { data, error } = await supabase
    .from('tweets')
    .insert({
      content,
      image_url: imageUrl || null,
      city: city || null,
      topic: topic || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function uploadImage(file: File): Promise<string> {
  const supabase = createBrowserSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('请先登录');

  const ext = file.name.split('.').pop();
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(path, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(path);

  return publicUrl;
}

export function usePostTweet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, image, city, topic }: {
      content: string;
      image?: File;
      city?: string;
      topic?: string;
    }) => {
      let imageUrl: string | undefined;
      if (image) {
        imageUrl = await uploadImage(image);
      }
      return postTweet({ content, imageUrl, city, topic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
    },
  });
}
