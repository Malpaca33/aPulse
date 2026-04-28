export const prerender = false;

function json(data, init) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    ...init,
  });
}

const CF_TOKEN = import.meta.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT_ID = import.meta.env.CLOUDFLARE_ACCOUNT_ID;
const AI_MODEL = '@cf/meta/llama-4-maverick-17b';

const VALID_TOPICS = ['街拍', '风光', '人像', 'meme'];

function matchTopic(text) {
  const lower = (text || '').toLowerCase();
  for (const topic of VALID_TOPICS) {
    if (lower.includes(topic.toLowerCase())) return topic;
  }
  return null;
}

async function analyzeWithAI(imageUrl) {
  const imageResp = await fetch(imageUrl);
  if (!imageResp.ok) throw new Error(`Failed to fetch image: ${imageResp.status}`);

  const buffer = await imageResp.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';
  const dataUri = `data:${mimeType};base64,${base64}`;

  const body = {
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: dataUri,
          },
          {
            type: 'text',
            text: `Analyze this photo and return ONLY a JSON object (no markdown, no explanation) with these fields:
- "topic": choose one from ["街拍","风光","人像","meme"] based on the photo content. 街拍=street photography, 风光=landscape, 人像=portrait, meme=meme/humor
- "city": if you can identify a recognizable city or landmark, return the Chinese city name (e.g. "上海", "北京", "杭州"). Return null if unsure.
- "description": a short Chinese description (max 30 chars) of what's in the photo.
Example: {"topic":"风光","city":"上海","description":"外滩夜景，东方明珠塔在画面中"}`,
          },
        ],
      },
    ],
    max_tokens: 256,
  };

  const aiResp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${AI_MODEL}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  if (!aiResp.ok) {
    const errText = await aiResp.text();
    throw new Error(`AI API error ${aiResp.status}: ${errText.slice(0, 200)}`);
  }

  const result = await aiResp.json();
  const text = result?.result?.response || '';
  return extractJSON(text);
}

function extractJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text); } catch {}
  // Try to find JSON object in the text
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return null;
}

export async function POST({ request }) {
  try {
    if (!CF_TOKEN || !CF_ACCOUNT_ID) {
      return json({ topic: null, city: null, description: null });
    }

    const body = await request.json();
    const imageUrl = body.imageUrl;
    if (!imageUrl) return json({ error: 'imageUrl required' }, { status: 400 });

    const aiResult = await analyzeWithAI(imageUrl);
    if (!aiResult) return json({ topic: null, city: null, description: null });

    return json({
      topic: matchTopic(aiResult.topic),
      city: aiResult.city || null,
      description: aiResult.description || null,
    });
  } catch (err) {
    console.error('analyze-image error:', err.message);
    return json({ topic: null, city: null, description: null });
  }
}
