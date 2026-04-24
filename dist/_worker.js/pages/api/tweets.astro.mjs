globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getUserFromRequest } from '../../chunks/supabase_KnSfRDel.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;

function json(data, init) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    ...init,
  });
}

function normalizeContent(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function GET({ request }) {
  const { user, supabase } = await getUserFromRequest(request);

  const { data: tweets, error } = await supabase
    .from('tweets')
    .select('id, content, created_at, user_id, likes_count')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  let likedTweetIds = [];

  if (user) {
    const { data: likes, error: likesError } = await supabase
      .from('tweet_likes')
      .select('tweet_id')
      .eq('user_id', user.id);

    if (likesError) {
      return json({ error: likesError.message }, { status: 500 });
    }

    likedTweetIds = likes.map((row) => row.tweet_id);
  }

  return json({
    tweets: tweets.map((tweet) => ({
      ...tweet,
      viewer_has_liked: likedTweetIds.includes(tweet.id),
    })),
  });
}

async function POST({ request }) {
  const { user, supabase } = await getUserFromRequest(request);

  if (!user) {
    return json({ error: 'Authentication required.' }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const content = normalizeContent(body?.content);

  if (!content) {
    return json({ error: 'Tweet content cannot be empty.' }, { status: 400 });
  }

  if (content.length > 280) {
    return json({ error: 'Tweet content must be 280 characters or fewer.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tweets')
    .insert({
      content,
    })
    .select('id, content, created_at, user_id, likes_count')
    .single();

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json(
    {
      tweet: {
        ...data,
        viewer_has_liked: false,
      },
    },
    { status: 201 },
  );
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
