// ============================================================
//  VIREON — Kodik API wrapper
//  Токен хранится здесь в коде. Пользователь его не видит.
// ============================================================

// ⚠️  ЗАМЕНИ НА СВОЙ ТОКЕН из bd.kodikres.com/users/sites
const TOKEN = 'ecc052e27cd7c4fe1c781701a2f574a6';

const BASE = 'https://kodik-api.com';

// Базовая POST-функция
async function api(endpoint, params = {}) {
  const body = new URLSearchParams({ token: TOKEN, ...params });
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Kodik API ${res.status}`);
  return res.json();
}

// ─── /list ──────────────────────────────────────────────────

export function getList(params = {}) {
  return api('/list', {
    with_material_data: 'true',
    limit: 40,
    ...params,
  });
}

// Новинки (все типы)
export function getLatest(limit = 40) {
  return getList({ sort: 'updated_at', order: 'desc', limit });
}

// Только аниме
export function getAnimeList(params = {}) {
  return getList({ types: 'anime,anime-serial', ...params });
}

// Только фильмы
export function getMovies(params = {}) {
  return getList({
    types: 'foreign-movie,russian-movie,anime',
    sort: 'updated_at',
    order: 'desc',
    ...params,
  });
}

// Только сериалы
export function getSerials(params = {}) {
  return getList({
    types: 'foreign-serial,russian-serial,cartoon-serial,anime-serial',
    sort: 'updated_at',
    order: 'desc',
    ...params,
  });
}

// Мультфильмы
export function getCartoons(params = {}) {
  return getList({
    types: 'foreign-cartoon,russian-cartoon,soviet-cartoon,cartoon-serial',
    sort: 'updated_at',
    order: 'desc',
    ...params,
  });
}

// Онгоинг аниме
export function getOngoing(limit = 40) {
  return getList({
    types: 'anime-serial',
    anime_status: 'ongoing',
    sort: 'updated_at',
    order: 'desc',
    limit,
  });
}

// Топ по рейтингу Shikimori (аниме)
export function getTopAnime(limit = 40) {
  return getList({
    types: 'anime,anime-serial',
    sort: 'shikimori_rating',
    order: 'desc',
    limit,
    has_field: 'shikimori_id',
  });
}

// Топ по рейтингу IMDb (фильмы)
export function getTopMovies(limit = 40) {
  return getList({
    types: 'foreign-movie,russian-movie',
    sort: 'imdb_rating',
    order: 'desc',
    limit,
    has_field: 'imdb_id',
  });
}

// Топ по рейтингу KinoPoisk (сериалы)
export function getTopSerials(limit = 40) {
  return getList({
    types: 'foreign-serial,russian-serial',
    sort: 'kinopoisk_rating',
    order: 'desc',
    limit,
    has_field: 'kinopoisk_id',
  });
}

// ─── /search ────────────────────────────────────────────────

export function searchAll(title, params = {}) {
  return api('/search', {
    with_material_data: 'true',
    title,
    limit: 50,
    ...params,
  });
}

export function getById(shikimori_id) {
  return api('/search', {
    with_material_data: 'true',
    with_episodes: 'true',
    shikimori_id,
  });
}

export function getByKinopoiskId(kinopoisk_id) {
  return api('/search', {
    with_material_data: 'true',
    with_episodes: 'true',
    kinopoisk_id,
  });
}

export function getByKodikId(id) {
  return api('/search', {
    with_material_data: 'true',
    with_episodes: 'true',
    id,
  });
}

// ─── /genres ────────────────────────────────────────────────

export function getGenresList(types = 'anime,anime-serial') {
  return api('/genres', { types, genres_type: 'shikimori' });
}

// ─── /translations/v2 ───────────────────────────────────────

export function getTranslations(types = 'anime,anime-serial') {
  return api('/translations/v2', { types });
}

// ─── Pagination ─────────────────────────────────────────────

export async function fetchNextPage(nextPageUrl) {
  const url = new URL(nextPageUrl);
  // Сохраняем все параметры из next_page URL
  const params = Object.fromEntries(url.searchParams.entries());
  const res = await fetch(`${BASE}${url.pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) throw new Error(`Kodik API ${res.status}`);
  return res.json();
}

// ─── Helpers ────────────────────────────────────────────────

export function getPoster(item) {
  return (
    item?.material_data?.anime_poster_url ||
    item?.material_data?.poster_url ||
    item?.material_data?.drama_poster_url ||
    item?.screenshots?.[0] ||
    null
  );
}

export function getTitle(item) {
  return (
    item?.material_data?.title ||
    item?.material_data?.anime_title ||
    item?.title ||
    'Без названия'
  );
}

export function getRating(item) {
  return (
    item?.material_data?.shikimori_rating ||
    item?.material_data?.imdb_rating ||
    item?.material_data?.kinopoisk_rating ||
    null
  );
}

export function getRatingLabel(item) {
  if (item?.material_data?.shikimori_rating) return { val: item.material_data.shikimori_rating, src: 'Shikimori' };
  if (item?.material_data?.imdb_rating) return { val: item.material_data.imdb_rating, src: 'IMDb' };
  if (item?.material_data?.kinopoisk_rating) return { val: item.material_data.kinopoisk_rating, src: 'КП' };
  return null;
}

export function getGenres(item) {
  return (
    item?.material_data?.anime_genres ||
    item?.material_data?.genres ||
    item?.material_data?.all_genres ||
    []
  );
}

export function getDescription(item) {
  return (
    item?.material_data?.anime_description ||
    item?.material_data?.description ||
    null
  );
}

export function buildEmbedUrl(link) {
  if (!link) return null;
  return link.startsWith('//') ? `https:${link}` : link;
}

export function getTypeLabel(type) {
  const map = {
    'anime': 'Аниме',
    'anime-serial': 'Аниме сериал',
    'foreign-movie': 'Фильм',
    'russian-movie': 'Фильм (RU)',
    'foreign-serial': 'Сериал',
    'russian-serial': 'Сериал (RU)',
    'foreign-cartoon': 'Мультфильм',
    'russian-cartoon': 'Мультфильм',
    'soviet-cartoon': 'Советский м/ф',
    'cartoon-serial': 'Мульт-сериал',
    'documentary-serial': 'Документальный',
    'multi-part-film': 'Многосерийный',
  };
  return map[type] || type;
}

export function getTypeColor(type) {
  if (type?.includes('anime')) return '#7c3aed';
  if (type?.includes('movie')) return '#0ea5e9';
  if (type?.includes('serial')) return '#10b981';
  if (type?.includes('cartoon')) return '#f59e0b';
  return '#6b7280';
}

// Дедупликация по shikimori_id или kinopoisk_id или kodik id
export function deduplicate(results) {
  const seen = new Map();
  for (const item of results) {
    const key = item.shikimori_id || item.kinopoisk_id || item.imdb_id || item.id;
    if (!seen.has(key)) seen.set(key, item);
  }
  return Array.from(seen.values());
}

// Категории для навигации
export const CATEGORIES = [
  { id: 'all',      label: 'Всё',        icon: '🌐', types: '' },
  { id: 'anime',    label: 'Аниме',      icon: '⛩',  types: 'anime,anime-serial' },
  { id: 'movies',   label: 'Фильмы',     icon: '🎬', types: 'foreign-movie,russian-movie' },
  { id: 'serials',  label: 'Сериалы',    icon: '📺', types: 'foreign-serial,russian-serial' },
  { id: 'cartoons', label: 'Мультфильмы',icon: '🎨', types: 'foreign-cartoon,russian-cartoon,soviet-cartoon,cartoon-serial' },
];

export const ANIME_GENRES = [
  'Экшен','Приключения','Комедия','Драма','Фэнтези','Романтика',
  'Школа','Повседневность','Сверхъестественное','Психологическое',
  'Триллер','Сёнен','Спорт','Исторический','Боевые искусства',
  'Фантастика','Самураи','Музыка','Ужасы','Меха',
];

export const SORT_OPTIONS = [
  { value: 'updated_at',       label: 'Новые' },
  { value: 'shikimori_rating', label: 'Shikimori рейтинг' },
  { value: 'imdb_rating',      label: 'IMDb рейтинг' },
  { value: 'kinopoisk_rating', label: 'КиноПоиск рейтинг' },
  { value: 'year',             label: 'По году' },
  { value: 'created_at',       label: 'По добавлению' },
];

export const STATUS_OPTIONS = [
  { value: '',         label: 'Все' },
  { value: 'ongoing',  label: '🟢 Онгоинг' },
  { value: 'released', label: '✅ Вышел' },
  { value: 'anons',    label: '🔔 Анонс' },
];

export async function fetchNextPage(nextPageUrl) {
  const url = new URL(nextPageUrl);
  const params = Object.fromEntries(url.searchParams.entries());
  const res = await fetch(`${url.origin}${url.pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) throw new Error(`Kodik API ${res.status}`);
  return res.json();
}
