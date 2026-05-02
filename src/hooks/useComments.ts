import { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabase } from '../lib/supabase';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { nickname: string | null } | null;
}

export function useComments(tweetId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!tweetId) return;
    setLoading(true);
    const supabase = createBrowserSupabase();

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('tweet_id', tweetId)
      .order('created_at', { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const comments = data || [];
    // Fetch profiles
    const userIds = [...new Set(comments.map((c: any) => c.user_id))] as string[];
    let profileMap: Record<string, string | null> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname')
        .in('id', userIds);
      if (profiles) {
        profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.nickname]));
      }
    }

    setComments(comments.map((c: any) => ({
      ...c,
      profiles: { nickname: profileMap[c.user_id] ?? null },
    })));
    setLoading(false);
  }, [tweetId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, error, refetch: fetchComments };
}

export function usePostComment() {
  const [posting, setPosting] = useState(false);

  const postComment = useCallback(async (tweetId: string, content: string) => {
    setPosting(true);
    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { error } = await supabase
      .from('comments')
      .insert({ tweet_id: tweetId, content, user_id: user.id });

    setPosting(false);
    if (error) throw error;
  }, []);

  return { postComment, posting };
}
