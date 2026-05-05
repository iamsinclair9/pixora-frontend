const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const MODELS = [
  'google/gemini-flash-1.5', 
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.2-11b-vision-instruct',
  'qwen/qwen-2-vl-72b-instruct'
];

const PROMPT = `You are an expert photography curator.
Analyze the image and return ONLY a valid JSON object — no markdown, no extra text — with these exact keys:
{
  "title":    "<catchy photo title, max 60 chars>",
  "caption":  "<engaging caption that tells the story, max 180 chars>",
  "tags":     ["<tag1>", "<tag2>", "<tag3>", "<tag4>", "<tag5>"],
  "category": "<one word from: Nature | Animal | Architecture | People | Tech | Food | Urban | Abstract | Travel | Portrait>"
}`;

/** Convert a File to a base64 data-URI. */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/** Call one specific model. Returns parsed JSON or throws. */
async function callModel(model, dataUri) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Pixora',
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUri } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response content');

  // Strip markdown code fences if the model wraps its output
  const cleaned = content
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    title:    typeof parsed.title    === 'string' ? parsed.title.slice(0, 60)    : '',
    caption:  typeof parsed.caption  === 'string' ? parsed.caption.slice(0, 180) : '',
    tags:     Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8).map(String)   : [],
    category: typeof parsed.category === 'string' ? parsed.category              : '',
  };
}

/**
 * Analyse an image file using OpenRouter with sequential model fallback.
 * Returns metadata suggestions, or null if every model fails.
 *
 * @param {File} imageFile
 * @returns {Promise<{title,caption,tags,category}|null>}
 */
export async function suggestImageMetadata(imageFile) {
  if (!API_KEY) {
    console.error('[aiService] VITE_OPENROUTER_API_KEY is not set in .env');
    return null;
  }

  let dataUri;
  try {
    dataUri = await fileToBase64(imageFile);
  } catch (err) {
    console.error('[aiService] Could not read file:', err);
    return null;
  }

  for (const model of MODELS) {
    try {
      console.info(`[aiService] Trying model: ${model}`);
      const result = await callModel(model, dataUri);
      console.info(`[aiService] ✅ Success with: ${model}`);
      return result;
    } catch (err) {
      console.warn(`[aiService] ❌ ${model} failed:`, err.message);
    }
  }

  console.error('[aiService] All models exhausted — returning null');
  return null;
}

/**
 * Analyse an image from a public URL using OpenRouter.
 * Passes the URL directly — no download/base64 needed.
 *
 * @param {string} url - Publicly accessible image URL
 * @returns {Promise<{title,caption,tags,category}|null>}
 */
export async function suggestFromUrl(url) {
  if (!API_KEY) {
    console.error('[aiService] VITE_OPENROUTER_API_KEY is not set in .env');
    return null;
  }

  // We pass the URL directly as image_url — OpenRouter fetches it server-side
  const makePayload = (model) => ({
    model,
    max_tokens: 300,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url } },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  });

  for (const model of MODELS) {
    try {
      console.info(`[aiService:url] Trying model: ${model}`);

      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Pixora',
        },
        body: JSON.stringify(makePayload(model)),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response');

      const cleaned = content.trim()
        .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

      const parsed = JSON.parse(cleaned);
      console.info(`[aiService:url] ✅ Success with: ${model}`);

      return {
        title:    typeof parsed.title    === 'string' ? parsed.title.slice(0, 60)    : '',
        caption:  typeof parsed.caption  === 'string' ? parsed.caption.slice(0, 180) : '',
        tags:     Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8).map(String)   : [],
        category: typeof parsed.category === 'string' ? parsed.category              : '',
      };
    } catch (err) {
      console.warn(`[aiService:url] ❌ ${model} failed:`, err.message);
    }
  }

  console.error('[aiService:url] All models exhausted');
  return null;
}

/**
 * Analyse a natural language search query and return extracted criteria.
 */
export async function suggestSearchCriteria(query) {
  if (!API_KEY) return null;

  const SEARCH_PROMPT = `You are an expert photography curator. The user wants to search for: "${query}".
Extract the best search criteria to find photos in a gallery.
Return ONLY a valid JSON object — no markdown, no extra text — with these exact keys:
{
  "keyword": "<the core visual subject to search for, e.g. 'sunset', 'neon streets'>",
  "location": "<city or country if mentioned in query, else empty string>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "category": "<Must be exactly one of: Nature | Animal | Architecture | People | Tech | Food | Urban | Abstract | Travel | Portrait. If none fit perfectly, choose the closest or leave empty.>"
}`;

  for (const model of MODELS) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Pixora',
        },
        body: JSON.stringify({
          model,
          max_tokens: 150,
          temperature: 0.1,
          messages: [{ role: 'user', content: SEARCH_PROMPT }],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response');

      const cleaned = content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      
      console.info(`[aiService:search] ✅ Success with: ${model}`);
      return {
        q:  typeof parsed.keyword === 'string' ? parsed.keyword : '',
        loc: typeof parsed.location === 'string' ? parsed.location : '',
        tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).join(',') : '',
        category: typeof parsed.category === 'string' ? parsed.category : '',
      };
    } catch (err) {
       console.warn(`[aiService:search] ❌ ${model} failed:`, err.message);
    }
  }
  return null;
}

