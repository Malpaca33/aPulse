import { createBrowserSupabase } from '../../../lib/supabase';

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

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as BlogPost[];
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as BlogPost | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post';
}

export async function saveBlogPost(data: {
  id?: string;
  title: string;
  content: string;
  description?: string;
  tags?: string[];
  published?: boolean;
}): Promise<void> {
  const supabase = createBrowserSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('请先登录');

  const slug = slugify(data.title);

  if (data.id) {
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
}

export async function deleteBlogPost(id: string): Promise<void> {
  const supabase = createBrowserSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('请先登录');

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
