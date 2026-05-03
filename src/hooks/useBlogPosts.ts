import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabase } from '../lib/supabase';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

async function fetchBlogPosts() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as BlogPost[];
}

async function fetchBlogPost(slug: string) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: fetchBlogPosts,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => fetchBlogPost(slug),
    enabled: !!slug,
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post';
}

export function useSaveBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id?: string;
      title: string;
      content: string;
      description?: string;
      tags?: string[];
      published?: boolean;
    }) => {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const slug = slugify(data.title);

      if (data.id) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: data.title,
            slug,
            content: data.content,
            description: data.description || '',
            tags: data.tags || [],
            published: data.published ?? false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            title: data.title,
            slug,
            content: data.content,
            description: data.description || '',
            tags: data.tags || [],
            published: data.published ?? false,
            user_id: user.id,
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}
