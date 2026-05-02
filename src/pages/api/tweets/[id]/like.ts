import type { APIRoute } from 'astro';
import { getUserFromRequest } from '../../../../lib/supabase.js';

export const prerender = false;

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    ...init,
  });
}

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const { user, supabase } = await getUserFromRequest(request);

  if (!user) return json({ error: 'Authentication required.' }, { status: 401 });

  const { data: existingLike } = await supabase
    .from('tweet_likes')
    .select('tweet_id')
    .eq('tweet_id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingLike) {
    const { error } = await supabase
      .from('tweet_likes')
      .delete()
      .eq('tweet_id', id)
      .eq('user_id', user.id);

    if (error) return json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase.from('tweet_likes').insert({
      tweet_id: id,
      user_id: user.id,
    });

    if (error) return json({ error: error.message }, { status: 500 });
  }

  const { data: tweet, error: tweetError } = await supabase
    .from('tweets')
    .select('id, content, image_url, created_at, user_id, likes_count')
    .eq('id', id)
    .single();

  if (tweetError) return json({ error: tweetError.message }, { status: 500 });

  return json({ tweet: { ...tweet, viewer_has_liked: !existingLike } });
};
