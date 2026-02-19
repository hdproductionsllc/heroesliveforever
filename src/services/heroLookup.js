/**
 * Hero Lookup Service — fetches biographical data from Wikipedia's free REST API.
 * No API key required.
 */

const https = require('https');

const WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary';

// Category detection keyword maps (order matters — first match wins)
const CATEGORY_KEYWORDS = [
  {
    category: 'military',
    words: [
      'soldier', 'general', 'admiral', 'military', 'veteran', 'army', 'navy',
      'marine', 'medal of honor', 'officer', 'colonel', 'sergeant', 'lieutenant',
      'corporal', 'brigadier', 'marshal', 'commando', 'ranger', 'paratrooper',
      'war hero', 'air force'
    ]
  },
  {
    category: 'national',
    words: [
      'president of', 'prime minister', 'chancellor', 'statesman', 'head of state',
      'first lady', 'governor', 'senator', 'political leader'
    ]
  },
  {
    category: 'music',
    words: [
      'musician', 'singer', 'songwriter', 'composer', 'rapper', 'guitarist',
      'pianist', 'conductor', 'band', 'vocalist', 'drummer', 'bassist',
      'saxophonist', 'violinist', 'opera'
    ]
  },
  {
    category: 'sports',
    words: [
      'player', 'athlete', 'quarterback', 'pitcher', 'coach', 'championship',
      'nba', 'nfl', 'mlb', 'nhl', 'footballer', 'boxer', 'olympian',
      'sprinter', 'swimmer', 'tennis', 'golfer', 'racing driver', 'wrestler',
      'martial artist', 'baseman', 'outfielder', 'guard', 'forward', 'center'
    ]
  },
  {
    category: 'historical',
    words: [
      'president', 'king', 'queen', 'philosopher', 'scientist', 'inventor',
      'explorer', 'author', 'writer', 'professor', 'mathematician', 'poet',
      'painter', 'artist', 'architect', 'theologian', 'reformer', 'activist',
      'astronaut', 'aviator', 'nurse', 'physician', 'engineer', 'scholar',
      'historian', 'educator', 'philanthropist', 'filmmaker', 'director',
      'journalist', 'novelist', 'playwright', 'dramatist'
    ]
  }
];

/**
 * Generic HTTPS GET with redirect following.
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const request = (targetUrl, redirectCount) => {
      if (redirectCount > 5) return reject(new Error('Too many redirects'));
      https.get(targetUrl, { headers: { 'User-Agent': 'HeroesLiveForever/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return request(res.headers.location, redirectCount + 1);
        }
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
          resolve(JSON.parse(body));
        });
      }).on('error', reject);
    };
    request(url, 0);
  });
}

/**
 * Fetch a Wikipedia page summary via REST API.
 * Returns structured data: title, description, thumbnail, originalimage, short extract.
 */
function fetchWikiSummary(title) {
  return httpsGet(`${WIKI_API}/${encodeURIComponent(title)}`);
}

/**
 * Fetch the full introductory section from the MediaWiki API.
 * Returns much richer text than the summary endpoint (multiple paragraphs).
 */
function fetchFullIntro(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(title)}&format=json&redirects=true`;
  return httpsGet(url).then(data => {
    const pages = data.query && data.query.pages;
    if (!pages) return '';
    const page = Object.values(pages)[0];
    return (page && page.extract) || '';
  }).catch(() => '');
}

/**
 * Fetch all images from a Wikipedia article's media list.
 * Returns image file titles (e.g. "File:Photo.jpg") filtered for actual photos.
 */
function fetchMediaList(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`;
  return httpsGet(url).then(data => {
    return (data.items || [])
      .map(item => item.title)
      .filter(t => /\.(jpe?g|png)$/i.test(t));
  }).catch(() => []);
}

/**
 * Get image info (URL + dimensions) for a batch of Wikipedia file titles.
 * Uses the MediaWiki imageinfo API which accepts multiple titles at once.
 */
function fetchImageInfo(fileTitles) {
  if (fileTitles.length === 0) return Promise.resolve([]);
  const titles = fileTitles.join('|');
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|size|mime&format=json`;
  return httpsGet(url).then(data => {
    const pages = data.query && data.query.pages;
    if (!pages) return [];
    return Object.values(pages)
      .filter(p => p.imageinfo && p.imageinfo[0])
      .map(p => {
        const ii = p.imageinfo[0];
        return {
          filename: p.title.replace(/^File:/, ''),
          url: ii.url,
          width: ii.width,
          height: ii.height,
          pixels: ii.width * ii.height,
          aspectRatio: ii.width / ii.height,
          mime: ii.mime
        };
      });
  }).catch(() => []);
}

/**
 * Fetch and classify all usable images from a Wikipedia article.
 * Returns { portrait, hero, extra } — best images for each panel role.
 *
 * Strategy:
 * - portrait: the article's main image (usually a headshot/portrait)
 * - hero: the largest non-portrait image from the media list (dramatic/scenic)
 * - extra: next best image for a tertiary panel
 */
async function fetchHeroImages(title, mainImageUrl) {
  const fileTitles = await fetchMediaList(title);
  if (fileTitles.length === 0) return { portrait: mainImageUrl, hero: null, extra: null };

  const images = await fetchImageInfo(fileTitles);

  // Filter: must be JPEG/PNG, at least 300px on shortest side
  const usable = images.filter(img =>
    /^image\/(jpeg|png)$/.test(img.mime) &&
    Math.min(img.width, img.height) >= 300
  );

  // Separate: the main article image vs everything else
  const mainFilename = mainImageUrl ? decodeURIComponent(mainImageUrl.split('/').pop()) : '';
  const others = usable.filter(img => img.filename !== mainFilename);

  // Sort candidates by total pixels (largest = most dramatic)
  others.sort((a, b) => b.pixels - a.pixels);

  // Skip images that are clearly not about the person:
  // tiny icons, logos, maps, audio waveforms, coats of arms
  const skipPatterns = /\b(logo|icon|flag|coat.of.arms|map|diagram|chart|waveform|signature)\b/i;
  const candidates = others.filter(img => !skipPatterns.test(img.filename));

  return {
    portrait: mainImageUrl,
    hero: candidates[0] ? candidates[0].url : null,
    extra: candidates[1] ? candidates[1].url : null
  };
}

/**
 * Check whether a Wikipedia summary looks like a biographical article (a person).
 * Uses the description field which Wikipedia provides as a concise classification.
 */
function isLikelyPerson(summaryData) {
  const desc = (summaryData.description || '').toLowerCase();

  // Date ranges in description are the strongest biographical signal
  if (/\(\d{4}.\d{4}\)/.test(desc) || /\(born\s/.test(desc)) return true;
  if (/\d{4}.\d{4}/.test(desc)) return true;

  // Person-role keywords
  const personWords = [
    'president', 'writer', 'author', 'singer', 'player', 'general',
    'artist', 'actor', 'actress', 'politician', 'scientist', 'soldier',
    'musician', 'poet', 'philosopher', 'explorer', 'inventor', 'athlete',
    'officer', 'composer', 'novelist', 'filmmaker', 'activist', 'leader',
    'coach', 'statesman', 'aviator', 'astronaut', 'nurse', 'physician',
    'professor', 'boxer', 'swimmer', 'guitarist', 'drummer', 'rapper',
    'philanthropist', 'reformer', 'theologian', 'historian', 'painter',
    'architect', 'engineer', 'educator', 'journalist', 'playwright'
  ];
  for (const w of personWords) {
    if (desc.includes(w)) return true;
  }

  // Non-person signals — reject early
  const notPerson = [
    'country', 'city', 'state', 'province', 'territory', 'region',
    'film', 'album', 'song', 'band', 'river', 'mountain', 'lake',
    'television', 'series', 'novel', 'video game', 'software',
    'municipality', 'village', 'town', 'county', 'island', 'list of'
  ];
  for (const w of notPerson) {
    if (desc.includes(w)) return false;
  }

  // Uncertain — accept (better to show something than nothing)
  return true;
}

/**
 * Search Wikipedia for the best person match.
 * Uses opensearch for fuzzy matching (handles typos, partial names),
 * then verifies each candidate is a biographical article.
 */
async function searchForPerson(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=10&format=json`;

  let data;
  try {
    data = await httpsGet(url);
  } catch (e) {
    return null;
  }

  const titles = data[1] || [];
  if (titles.length === 0) return null;

  // Verify top candidates in parallel for speed
  const candidates = titles.slice(0, 5);
  const results = await Promise.allSettled(
    candidates.map(t => fetchWikiSummary(t.replace(/\s+/g, '_')))
  );

  // Return the first result that's a biographical article
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const summary = result.value;
      if (summary.extract && summary.type !== 'disambiguation' && isLikelyPerson(summary)) {
        return summary.title;
      }
    }
  }

  return null;
}

/**
 * Extract birth and death years from Wikipedia description and extract text.
 * Wikipedia often puts dates in the description like "English writer (1892–1973)"
 * or in the extract like "(January 3, 1892 – September 2, 1973)".
 */
function extractYears(description, extract) {
  let birthYear = '';
  let deathYear = '';

  // Combine both sources for searching
  const sources = [description || '', extract || ''];

  for (const text of sources) {
    if (birthYear) break;

    // Pattern: (Year–Year) or (Year – Year) — compact date range
    const compactDates = text.match(/\((\d{4})\s*[\u2013\u2014\-–—]\s*(\d{4})\)/);
    if (compactDates) {
      birthYear = compactDates[1];
      deathYear = compactDates[2];
      break;
    }

    // Pattern: (Month Day, Year – Month Day, Year)
    const fullDates = text.match(
      /\((?:[A-Z][a-z]+ \d{1,2},? )?\[?(\d{4})\]?\s*[\u2013\u2014\-–—]\s*(?:[A-Z][a-z]+ \d{1,2},? )?\[?(\d{4})\]?\)/
    );
    if (fullDates) {
      birthYear = fullDates[1];
      deathYear = fullDates[2];
      break;
    }

    // Pattern: (born Year) or (born Month Day, Year)
    const bornMatch = text.match(/\(born\s+(?:[A-Z][a-z]+ \d{1,2},?\s+)?(\d{4})\)/i);
    if (bornMatch) {
      birthYear = bornMatch[1];
      break;
    }

    // Pattern: born Year (without parens)
    const bornLoose = text.match(/born\s+(?:[A-Z][a-z]+ \d{1,2},?\s+)?(\d{4})/i);
    if (bornLoose) {
      birthYear = bornLoose[1];
      break;
    }

    // Pattern: Year – Year without parentheses
    const looseDates = text.match(/(\d{4})\s*[\u2013\u2014\-–—]\s*(\d{4})/);
    if (looseDates) {
      birthYear = looseDates[1];
      deathYear = looseDates[2];
      break;
    }
  }

  return { birthYear, deathYear };
}

/**
 * Detect the most likely category from Wikipedia description + extract.
 * The description is checked first (higher signal) before the longer extract.
 */
function detectCategory(description, extract) {
  const desc = (description || '').toLowerCase();
  const full = (extract || '').toLowerCase();

  // First pass: check the short description only (highest signal)
  for (const { category, words } of CATEGORY_KEYWORDS) {
    for (const word of words) {
      if (desc.includes(word)) {
        return category;
      }
    }
  }

  // Second pass: check the full extract
  for (const { category, words } of CATEGORY_KEYWORDS) {
    for (const word of words) {
      if (full.includes(word)) {
        return category;
      }
    }
  }

  return 'historical'; // sensible default
}

/**
 * Build an attribution string from the Wikipedia description.
 * e.g. "English author and philologist" → "Author | Philologist"
 */
function buildAttribution(description) {
  if (!description) return '';

  // Remove dates in parentheses: "(1892–1973)" or "(born 1963)"
  let clean = description.replace(/\s*\(.*?\)/g, '').trim();

  // Remove leading article
  clean = clean.replace(/^an?\s+/i, '');

  // Remove nationality/demonym prefix — one or two capitalized words before the roles
  // e.g. "English", "American", "South African-born", "New Zealand"
  // Only strip if what remains starts with a lowercase role word (not a preposition)
  const demonymMatch = clean.match(/^(?:[A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)\s+/);
  if (demonymMatch) {
    const afterStrip = clean.slice(demonymMatch[0].length);
    // If remainder starts with a lowercase word, it's likely a role after a demonym
    // If it starts with a preposition ("of", "the", "from"), the stripped word was a title
    if (afterStrip && !/^(?:of|the|from|in|at|for|to)\s/i.test(afterStrip)) {
      clean = afterStrip;
    }
  }

  // Strip date ranges: "from YYYY to YYYY", "from YYYY until YYYY"
  clean = clean.replace(/\s*from\s+\d{4}\s+(?:to|until)\s+\d{4}/i, '');

  // Clean up any leading "and" or ","
  clean = clean.replace(/^(?:and\s+|,\s*)/i, '');

  // Split on "and", ",", "&" to get individual roles
  const roles = clean
    .split(/\s*(?:,\s*and\s+|,\s+|\s+and\s+|&)\s*/i)
    .map(part => {
      return part
        .replace(/\s*who .*/i, '')
        .replace(/\s*known .*/i, '')
        .replace(/\s*considered .*/i, '')
        .trim();
    })
    .filter(r => r.length > 1 && r.length < 40);

  // Capitalize each role
  const capitalized = roles.map(r =>
    r.charAt(0).toUpperCase() + r.slice(1)
  );

  return capitalized.slice(0, 3).join(' | ');
}

/**
 * Clean a Wikipedia extract: strip formulaic first sentence, pronunciation
 * guides, em dashes, and other formatting artifacts.
 * Returns the full cleaned text (no word-count truncation).
 */
function cleanBio(extract) {
  if (!extract) return '';

  let text = extract;

  // Strip the formulaic first sentence ("Name (dates) was a/an ...").
  // Keep it only if the total extract is very short.
  const firstSentenceEnd = text.search(/\.\s/);
  if (firstSentenceEnd > 0) {
    const withoutFirst = text.substring(firstSentenceEnd + 1).trim();
    if (withoutFirst.split(/\s+/).length >= 30) {
      text = withoutFirst;
    }
  }

  // Replace em dashes with commas
  text = text.replace(/\s*[\u2014—]\s*/g, ', ');

  // Replace en dashes used as em dashes (surrounded by spaces)
  text = text.replace(/\s+[\u2013–]\s+/g, ', ');

  // Strip pronunciation guides: (/ˈtɒlkiːn/ TOL-keen; ...) etc.
  text = text.replace(/\s*\([^)]*\/[^)]*\/[^)]*\)\s*/g, ' ');

  // Clean up double spaces, double commas, leading commas
  text = text.replace(/,\s*,/g, ',');
  text = text.replace(/\s{2,}/g, ' ');
  text = text.replace(/^\s*,\s*/, '');

  return text.trim();
}

/**
 * Trim and clean a Wikipedia extract for use as a bio.
 * Target: 90–140 words. Enough to fill the bio panel with balanced margins.
 * Strips the formulaic first sentence ("Name was a ..."), cleans formatting.
 */
function trimBio(extract) {
  const text = cleanBio(extract);
  if (!text) return '';

  // Trim to ~140 words, ending at a sentence boundary
  const words = text.split(/\s+/).filter(w => w);
  if (words.length > 140) {
    let trimmed = words.slice(0, 140).join(' ');
    const lastPeriod = trimmed.lastIndexOf('.');
    if (lastPeriod > trimmed.length * 0.4) {
      trimmed = trimmed.substring(0, lastPeriod + 1);
    }
    return trimmed;
  }

  return text;
}

/**
 * Main lookup function. Takes a hero name, returns populated fields.
 */
async function lookupHero(name) {
  const title = name.trim().replace(/\s+/g, '_');

  // Step 1: Try direct lookup (fast path for exact names)
  let data, fullIntro;
  try {
    [data, fullIntro] = await Promise.all([
      fetchWikiSummary(title),
      fetchFullIntro(title)
    ]);

    // Reject if disambiguation, no extract, or not a person
    if (data.type === 'disambiguation' || !data.extract || !isLikelyPerson(data)) {
      data = null;
    }
  } catch (err) {
    data = null;
    fullIntro = '';
  }

  // Step 2: Fallback — smart search for typos, partial names, disambiguation
  if (!data) {
    const resolvedTitle = await searchForPerson(name);
    if (!resolvedTitle) {
      throw new Error(`No Wikipedia article found for "${name}". Try a more specific name.`);
    }

    const resolved = resolvedTitle.replace(/\s+/g, '_');
    [data, fullIntro] = await Promise.all([
      fetchWikiSummary(resolved),
      fetchFullIntro(resolved)
    ]);

    if (!data.extract) {
      throw new Error(`No Wikipedia article found for "${name}".`);
    }
  }

  const { birthYear, deathYear } = extractYears(data.description, fullIntro || data.extract);
  const category = detectCategory(data.description, data.extract);

  // Use the full intro for a richer bio; fall back to summary extract
  const rawSource = fullIntro || data.extract;
  const bio = trimBio(rawSource);
  const fullBioText = cleanBio(rawSource);
  const attribution = buildAttribution(data.description);
  const thumbnailUrl = data.thumbnail ? data.thumbnail.source : null;

  const mainImageUrl = data.originalimage ? data.originalimage.source : null;

  // Fetch additional images from the article for all panels
  const resolvedTitle = (data.title || name).replace(/\s+/g, '_');
  const heroImages = await fetchHeroImages(resolvedTitle, mainImageUrl);

  return {
    name: data.title || name,
    birthYear,
    deathYear,
    category,
    subcategory: '',
    bio,
    fullBio: fullBioText,
    quote: '',
    attribution,
    thumbnailUrl,
    images: {
      hero: heroImages.hero || mainImageUrl,      // Dramatic/largest → hero panel
      secondary: heroImages.portrait || mainImageUrl, // Portrait → smaller panel
      tertiary: heroImages.extra || null              // Third image if available
    }
  };
}

/**
 * Convert a Wikimedia full-size image URL to a thumbnail URL at a given width.
 * Pattern: insert /thumb/ segment and append /{width}px-{filename}
 */
function makeThumbUrl(fullUrl, width) {
  try {
    const url = new URL(fullUrl);
    const parts = url.pathname.split('/');
    const filename = parts[parts.length - 1];

    // Already a thumb URL — just change the size suffix
    const thumbIdx = parts.indexOf('thumb');
    if (thumbIdx !== -1) {
      parts[parts.length - 1] = `${width}px-${filename}`;
      url.pathname = parts.join('/');
      return url.toString();
    }

    // Insert /thumb/ before the hash directory
    // Standard path: /wikipedia/commons/{hash1}/{hash2}/File.jpg
    // Thumb path:    /wikipedia/commons/thumb/{hash1}/{hash2}/File.jpg/{width}px-File.jpg
    const commonsIdx = parts.indexOf('commons');
    if (commonsIdx !== -1 && commonsIdx + 3 < parts.length) {
      parts.splice(commonsIdx + 1, 0, 'thumb');
      parts.push(`${width}px-${filename}`);
      url.pathname = parts.join('/');
      return url.toString();
    }
  } catch (e) {
    // Fall through
  }
  return fullUrl;
}

/**
 * Fetch all viable images from a Wikipedia article for the gallery picker.
 * Reuses fetchMediaList + fetchImageInfo with the same filtering as fetchHeroImages.
 * Returns images sorted by pixel count (largest first) with thumbnail URLs.
 */
async function fetchGallery(title) {
  const fileTitles = await fetchMediaList(title);
  if (fileTitles.length === 0) return [];

  // MediaWiki API limits titles per request — batch in groups of 50
  const batches = [];
  for (let i = 0; i < fileTitles.length; i += 50) {
    batches.push(fileTitles.slice(i, i + 50));
  }

  const batchResults = await Promise.all(batches.map(b => fetchImageInfo(b)));
  const images = batchResults.flat();

  // Same filtering as fetchHeroImages: JPEG/PNG, min 300px shortest side
  const skipPatterns = /\b(logo|icon|flag|coat.of.arms|map|diagram|chart|waveform|signature)\b/i;

  const viable = images
    .filter(img =>
      /^image\/(jpeg|png)$/.test(img.mime) &&
      Math.min(img.width, img.height) >= 300 &&
      !skipPatterns.test(img.filename)
    )
    .sort((a, b) => b.pixels - a.pixels)
    .map(img => ({
      url: img.url,
      thumb: makeThumbUrl(img.url, 200),
      width: img.width,
      height: img.height,
      filename: img.filename
    }));

  return viable;
}

module.exports = { lookupHero, fetchGallery };
