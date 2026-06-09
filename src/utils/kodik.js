// Kodik API utility
// Base: https://kodik-api.com
// Requires API token - get from bd.kodikres.com/users/sites after registration
// For development, a public token can be extracted automatically from kodik.info

const KODIK_API = 'https://kodik-api.com';

// Replace with your actual token from bd.kodikres.com
// or use the auto-detection method below
let API_TOKEN = import.meta.env.VITE_KODIK_TOKEN || '';

export function setToken(token) {
  API_TOKEN = token;
}

export function getToken() {
  return API_TOKEN;
}

/**
 * Search anime by title
 * @param {string} title - anime title
 * @param {object} opts - extra options
 */
export async function searchAnime(title, opts = {}) {
  if (!API_TOKEN) throw new Error('KODIK_TOKEN not set');

  const params = new URLSearchParams({
    token: API_TOKEN,
    title,
    with_material_data: 'true',
    types: 'anime,anime-serial',
    limit: opts.limit ?? 40,
    ...opts,
  });

  const res = await fetch(`${KODIK_API}/search?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Kodik API error: ${res.status}`);
  return res.json();
}

/**
 * Get anime list (latest / ongoing)
 * @param {object} opts - filter options
 */
export async function getAnimeList(opts = {}) {
  if (!API_TOKEN) throw new Error('KODIK_TOKEN not set');

  const params = new URLSearchParams({
    token: API_TOKEN,
    with_material_data: 'true',
    types: 'anime,anime-serial',
    limit: opts.limit ?? 40,
    ...opts,
  });

  const res = await fetch(`${KODIK_API}/list?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Kodik API error: ${res.status}`);
  return res.json();
}

/**
 * Get ongoing anime
 */
export async function getOngoing(limit = 20) {
  return getAnimeList({ anime_status: 'ongoing', limit, sort: 'updated_at', order: 'desc' });
}

/**
 * Get anime by shikimori ID (also returns all available translations)
 */
export async function getByShikimoriId(id) {
  if (!API_TOKEN) throw new Error('KODIK_TOKEN not set');

  const params = new URLSearchParams({
    token: API_TOKEN,
    shikimori_id: id,
    with_material_data: 'true',
    with_episodes: 'true',
  });

  const res = await fetch(`${KODIK_API}/search?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Kodik API error: ${res.status}`);
  return res.json();
}

/**
 * Get anime by genre
 */
export async function getByGenre(genre, limit = 40) {
  return getAnimeList({ anime_genres: genre, limit, sort: 'shikimori_rating', order: 'desc' });
}

/**
 * Get top rated anime
 */
export async function getTopRated(limit = 40) {
  return getAnimeList({ limit, sort: 'shikimori_rating', order: 'desc', types: 'anime,anime-serial' });
}

/**
 * Deduplicate results: group by shikimori_id, keep unique anime with best translation
 */
export function deduplicateResults(results) {
  const map = new Map();
  for (const item of results) {
    const key = item.shikimori_id || item.id;
    if (!map.has(key)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

/**
 * Get poster URL from item
 */
export function getPoster(item) {
  return (
    item?.material_data?.anime_poster_url ||
    item?.material_data?.poster_url ||
    item?.screenshots?.[0] ||
    null
  );
}

/**
 * Get rating from item
 */
export function getRating(item) {
  return (
    item?.material_data?.shikimori_rating ||
    item?.material_data?.kinopoisk_rating ||
    item?.material_data?.imdb_rating ||
    null
  );
}

/**
 * Get genres array from item
 */
export function getGenres(item) {
  return item?.material_data?.anime_genres || item?.material_data?.genres || [];
}

/**
 * Build embed URL for player
 * link field from Kodik is like: //kodik.info/serial/xxx/hash/720p
 */
export function buildEmbedUrl(link) {
  if (!link) return null;
  const base = link.startsWith('//') ? `https:${link}` : link;
  return base;
}

export const ANIME_GENRES = [
  'Экшен', 'Приключения', 'Комедия', 'Драма', 'Фэнтези',
  'Романтика', 'Школа', 'Повседневность', 'Сверхъестественное',
  'Психологическое', 'Триллер', 'Сёнен', 'Спорт', 'Исторический',
  'Военное', 'Фантастика', 'Самураи', 'Боевые искусства', 'Музыка',
];
