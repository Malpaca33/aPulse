globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getUserFromRequest } from '../../chunks/supabase_DL0FsLQC.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_C7YAWX8s.mjs';

const prerender = false;
function json(data, init) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
    ...init
  });
}
const GET = async ({ request }) => {
  const { user, supabase } = await getUserFromRequest(request);
  const { data: tweets, error } = await supabase.from("tweets").select("id, content, image_url, created_at, user_id, likes_count").order("created_at", { ascending: false }).limit(50);
  if (error) return json({ error: error.message }, { status: 500 });
  let likedTweetIds = [];
  if (user) {
    const { data: likes } = await supabase.from("tweet_likes").select("tweet_id").eq("user_id", user.id);
    if (likes) likedTweetIds = likes.map((row) => row.tweet_id);
  }
  return json({
    tweets: tweets?.map((tweet) => ({
      ...tweet,
      viewer_has_liked: likedTweetIds.includes(tweet.id)
    }))
  });
};
const POST = async ({ request }) => {
  const { user, supabase } = await getUserFromRequest(request);
  if (!user) return json({ error: "Authentication required." }, { status: 401 });
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const imageUrl = typeof body?.image_url === "string" && body.image_url.trim() ? body.image_url.trim() : null;
  if (!content && !imageUrl) {
    return json({ error: "Tweet content or image is required." }, { status: 400 });
  }
  if (content.length > 280) {
    return json({ error: "Tweet content must be 280 characters or fewer." }, { status: 400 });
  }
  const { data, error } = await supabase.from("tweets").insert({ content, image_url: imageUrl, user_id: user.id }).select("id, content, image_url, created_at, user_id, likes_count").single();
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ tweet: { ...data, viewer_has_liked: false } }, { status: 201 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
