/**
 * Palette Generator Service — uses Claude Haiku 4.5 to design bold, modern
 * sports-broadcast-style color palettes for framed tribute pieces.
 *
 * Falls back gracefully to sensible defaults when ANTHROPIC_API_KEY is missing,
 * so local development works without keys.
 */

let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch (e) {
  // SDK not installed — fallback path will always be used
  Anthropic = null;
}

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1024;

// Sports-broadcast-style fallback (bold red, deep black, off-white)
const FALLBACK_PALETTE = {
  frameColor: '#0a0a0a',
  matBg: '#0a0a0a',
  bioBg: '#f4f4f4',
  bioNameColor: '#0a0a0a',
  bioTextColor: '#222222',
  bioAccent: '#c8102e',
  imageTint: null,
  rationale: 'Generated from fallback defaults (no API key configured).'
};

const SYSTEM_PROMPT = `You are a palette designer for premium framed sports/tribute pieces sold by Heroes Live Forever.

Aesthetic target: bold, modern, sports-broadcast feel (think MLB.com, ESPN graphics, Topps premium card design). The palette must read as confident, professional, and emotionally resonant — never muddy, never pastel, never generic.

You generate JSON palettes that drive the visual styling of a framed tribute piece. The fields you produce override default category themes and are used directly as CSS color values.

Rules for color selection:
- For sports figures: use that athlete's team / franchise / era colors when recognizable. Pull the dominant team color for an accent.
- For military / veterans: dignified-but-bold — deep navy, olive drab, gunmetal, with one assertive accent (crimson, gold, brass).
- For historical / national figures: era-appropriate richness — burgundy, parchment, ink, antique brass. Avoid washed-out beige; lean richer.
- For musicians / artists: stage-and-spotlight palettes — deep black/charcoal grounds with one saturated accent (electric blue, gold, neon).
- For personal heroes: warm but refined — warm grays, cream, brass, with a meaningful accent.

Output rules:
- Output STRICT valid JSON only. No prose before or after. No markdown code fences. No comments.
- All color fields must be valid 7-character lowercase hex codes (e.g. "#c8102e"). EXCEPTION: imageTint may be null when no tint is appropriate.
- Match this exact structure with these exact keys:
{
  "frameColor": "#hex",
  "matBg": "#hex",
  "bioBg": "#hex",
  "bioNameColor": "#hex",
  "bioTextColor": "#hex",
  "bioAccent": "#hex",
  "imageTint": "#hex or null",
  "rationale": "one sentence (max 30 words) explaining the specific color choices — name the team/era/influence."
}
- Ensure strong contrast between bioBg and bioTextColor (one light, one dark).
- Ensure bioNameColor reads cleanly on bioBg.
- bioAccent should be the boldest, most distinctive color — used sparingly for quotes/attributions.
- Be specific in rationale: name the team, the era, or the influence. Not "warm tones for a historical figure" — instead "1927 Yankees pinstripe navy with gold accent honoring his MVP year."`;

// In-memory cache: key = lowercased trimmed name
const cache = new Map();

// Lazily instantiate the client so missing keys don't crash at require time
let client = null;
function getClient() {
  if (client) return client;
  if (!Anthropic) return null;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  client = new Anthropic({ apiKey });
  return client;
}

/**
 * Validate a palette object has the required shape and hex format.
 * Returns true if valid, false otherwise.
 */
function isValidPalette(p) {
  if (!p || typeof p !== 'object') return false;
  const hexFields = ['frameColor', 'matBg', 'bioBg', 'bioNameColor', 'bioTextColor', 'bioAccent'];
  const hexRe = /^#[0-9a-fA-F]{6}$/;
  for (const f of hexFields) {
    if (typeof p[f] !== 'string' || !hexRe.test(p[f])) return false;
  }
  // imageTint can be null or a valid hex
  if (p.imageTint !== null && p.imageTint !== undefined && (typeof p.imageTint !== 'string' || !hexRe.test(p.imageTint))) {
    return false;
  }
  if (typeof p.rationale !== 'string' || !p.rationale.trim()) return false;
  return true;
}

/**
 * Extract JSON from a model response that may include stray prose or code fences.
 */
function extractJson(text) {
  if (!text) return null;
  let s = text.trim();
  // Strip ```json ... ``` fences if present
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  // Find the first { ... } block
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first === -1 || last === -1 || last < first) return null;
  const candidate = s.slice(first, last + 1);
  try {
    return JSON.parse(candidate);
  } catch (e) {
    return null;
  }
}

/**
 * Generate a color palette for a tribute piece.
 *
 * @param {Object} opts
 * @param {string} opts.name - hero's name (required)
 * @param {string} [opts.bio] - biographical text (truncated to 500 chars before sending)
 * @param {string} [opts.category] - category key (sports, military, historical, etc.)
 * @param {string} [opts.imageUrl] - reference image URL (mentioned textually; not vision-analyzed)
 * @returns {Promise<Object>} palette object
 */
async function generatePalette({ name, bio, category, imageUrl } = {}) {
  if (!name || !name.trim()) {
    throw new Error('name is required');
  }

  const cacheKey = name.trim().toLowerCase();
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const anthropic = getClient();
  if (!anthropic) {
    // Graceful fallback when SDK or API key is missing
    return { ...FALLBACK_PALETTE };
  }

  // Build the user message — keep it compact, the system prompt does the heavy lifting
  const parts = [`Hero: ${name.trim()}.`];
  if (bio && typeof bio === 'string') {
    parts.push(`Bio: ${bio.slice(0, 500)}.`);
  }
  if (category) {
    parts.push(`Category: ${category}.`);
  }
  if (imageUrl) {
    parts.push(`Reference image: ${imageUrl}`);
  }
  const userMessage = parts.join(' ');

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Lower temperature for more deterministic, on-brand palettes
      temperature: 0.4,
      // Prompt caching: the system prompt is large and static across requests.
      // Marking it with cache_control lets Anthropic cache it (5-min TTL by default)
      // so we only pay full-rate tokens on the first call.
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [
        { role: 'user', content: userMessage }
      ]
    });

    // Concatenate all text blocks in the response
    const text = (response.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    const parsed = extractJson(text);
    if (!isValidPalette(parsed)) {
      console.warn(`[paletteGenerator] Malformed palette response for "${name}". Using fallback. Raw:`, text);
      const fb = { ...FALLBACK_PALETTE, rationale: 'Generated from fallback defaults (model response was malformed).' };
      cache.set(cacheKey, fb);
      return fb;
    }

    // Normalize hex casing
    const palette = {
      frameColor: parsed.frameColor.toLowerCase(),
      matBg: parsed.matBg.toLowerCase(),
      bioBg: parsed.bioBg.toLowerCase(),
      bioNameColor: parsed.bioNameColor.toLowerCase(),
      bioTextColor: parsed.bioTextColor.toLowerCase(),
      bioAccent: parsed.bioAccent.toLowerCase(),
      imageTint: parsed.imageTint ? parsed.imageTint.toLowerCase() : null,
      rationale: parsed.rationale.trim()
    };

    cache.set(cacheKey, palette);
    return palette;
  } catch (err) {
    console.warn(`[paletteGenerator] API error for "${name}": ${err.message}. Using fallback.`);
    const fb = { ...FALLBACK_PALETTE, rationale: 'Generated from fallback defaults (API error).' };
    return fb;
  }
}

module.exports = { generatePalette };
