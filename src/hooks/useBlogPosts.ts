import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBlogPosts, fetchBlogPost, saveBlogPost, deleteBlogPost } from '../features/posts/services/postService';
import type { BlogPost } from '../features/posts/services/postService';

export { type BlogPost };

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

export function useSaveBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}
