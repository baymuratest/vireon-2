import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnimeGrid from '../components/AnimeGrid';
import { getAnimeList, getToken, ANIME_GENRES } from '../utils/kodik';
import styles from './CatalogPage.module.css';

const SORT_OPTIONS = [
  { value: 'updated_at', label: 'Новые' },
  { value: 'shikimori_rating', label: 'По рейтингу' },
  { value: 'year', label: 'По году' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'ongoing', label: 'Онгоинги' },
  { value: 'released', label: 'Вышедшие' },
  { value: 'anons', label: 'Анонсы' },
];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextPage, setNextPage] = useState(null);

  const sort = searchParams.get('sort') || 'updated_at';
  const status = searchParams.get('status') || '';
  const genre = searchParams.get('genre') || '';

  useEffect(() => {
    if (!getToken()) { setError('Добавь API ключ в настройках'); return; }
    const run = async () => {
      setLoading(true); setError('');
      try {
        const opts = { sort, order: 'desc', limit: 40 };
        if (status) opts.anime_status = status;
        if (genre) opts.anime_genres = genre;
        const res = await getAnimeList(opts);
        setItems(res.results || []);
        setNextPage(res.next_page || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [sort, status, genre]);

  const loadMore = async () => {
    if (!nextPage) return;
    setLoading(true);
    try {
      const res = await fetch(nextPage, { method: 'POST' });
      const data = await res.json();
      setItems(prev => [...prev, ...(data.results || [])]);
      setNextPage(data.next_page || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Каталог аниме</h1>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Статус</label>
            <div className={styles.pills}>
              {STATUS_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={`${styles.pill} ${status === o.value ? styles.pillActive : ''}`}
                  onClick={() => update('status', o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Сортировка</label>
            <div className={styles.pills}>
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={`${styles.pill} ${sort === o.value ? styles.pillActive : ''}`}
                  onClick={() => update('sort', o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Жанр</label>
            <div className={styles.pills}>
              <button
                className={`${styles.pill} ${!genre ? styles.pillActive : ''}`}
                onClick={() => update('genre', '')}
              >Все</button>
              {ANIME_GENRES.map(g => (
                <button
                  key={g}
                  className={`${styles.pill} ${genre === g ? styles.pillActive : ''}`}
                  onClick={() => update('genre', g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimeGrid items={items} loading={loading && items.length === 0} error={error} deduplicate={true} />

        {nextPage && !loading && (
          <div className={styles.loadMore}>
            <button onClick={loadMore} className={styles.loadMoreBtn}>
              Загрузить ещё
            </button>
          </div>
        )}
        {loading && items.length > 0 && (
          <div className={styles.loadingMore}>
            <div className={styles.spinner} />
          </div>
        )}
      </div>
    </div>
  );
}
