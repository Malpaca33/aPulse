globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getUserFromRequest } from '../../../../chunks/supabase_KnSfRDel.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;

function json(data, init) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    ...init,
  });
}

async function POST({ params, request }) {
  const { id } = params;
  const { user, supabase } = await getUserFromRequest(request);

  if (!user) {
    return json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { data: existingLike, error: existingLikeError } = await supabase
    .from('tweet_likes')
    .select('tweet_id')
    .eq('tweet_id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingLikeError) {
    return json({ error: existingLikeError.message }, { status: 500 });
  }

  if (existingLike) {
    const { error } = await supabase
      .from('tweet_likes')
      .delete()
      .eq('tweet_id', id)
      .eq('user_id', user.id);

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from('tweet_likes').insert({
      tweet_id: id,
      user_id: user.id,
    });

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }
  }

  const { data: tweet, error: tweetError } = await createTweetSnapshot(supabase, id);

  if (tweetError) {
    return json({ error: tweetError.message }, { status: 500 });
  }

  return json({
    tweet: {
      ...tweet,
      viewer_has_liked: !existingLike,
    },
  });
}

async function createTweetSnapshot(supabase, tweetId) {
  return supabase
    .from('tweets')
    .select('id, content, created_at, user_id, likes_count')
    .eq('id', tweetId)
    .single();
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
