import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnimeGrid from '../components/AnimeGrid';
import { searchAnime, getToken } from '../utils/kodik';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q) return;
    if (!getToken()) { setError('Сначала добавь API ключ в настройках'); return; }
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await searchAnime(q, { limit: 50 });
        setResults(res.results || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [q]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>Результаты поиска</h1>
          {q && <p className={styles.query}>«{q}»</p>}
          {!loading && results.length > 0 && (
            <p className={styles.count}>{results.length} результатов</p>
          )}
        </div>
        <AnimeGrid items={results} loading={loading} error={error} />
      </div>
    </div>
  );
}
