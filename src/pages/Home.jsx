import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimeGrid from '../components/AnimeGrid';
import { getOngoing, getTopRated, getToken, deduplicateResults } from '../utils/kodik';
import styles from './Home.module.css';

export default function Home() {
  const [ongoing, setOngoing] = useState([]);
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const hasToken = !!getToken();

  useEffect(() => {
    if (!hasToken) { setLoading(false); return; }
    const load = async () => {
      try {
        const [ongoingRes, topRes] = await Promise.all([
          getOngoing(20),
          getTopRated(20),
        ]);
        setOngoing(deduplicateResults(ongoingRes.results || []));
        setTop(deduplicateResults(topRes.results || []));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hasToken]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroBgOrb1} />
          <div className={styles.heroBgOrb2} />
          <div className={styles.heroGrid} />
        </div>
        <div className={styles.heroContent}>
          <p className={styles.heroLabel}>Powered by Kodik</p>
          <h1 className={styles.heroTitle}>
            <span>Смотри аниме</span><br />
            <span className={styles.heroAccent}>без границ</span>
          </h1>
          <p className={styles.heroSub}>Тысячи аниме, фильмов и сериалов с русской озвучкой и субтитрами</p>

          <form className={styles.heroSearch} onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Введи название аниме..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className={styles.heroSearchInput}
            />
            <button type="submit" className={styles.heroSearchBtn}>Найти</button>
          </form>

          <div className={styles.heroActions}>
            <Link to="/catalog" className={styles.btnPrimary}>Весь каталог</Link>
            {!hasToken && <Link to="/setup" className={styles.btnSecondary}>Подключить API</Link>}
          </div>
        </div>
      </section>

      {!hasToken && (
        <section className={styles.setupBanner}>
          <div className={styles.setupBannerInner}>
            <div className={styles.setupBannerIcon}>🔑</div>
            <div>
              <h3>Нужен API ключ Kodik</h3>
              <p>Для просмотра аниме необходимо подключить бесплатный API ключ от Kodik</p>
            </div>
            <Link to="/setup" className={styles.btnPrimary}>Настроить</Link>
          </div>
        </section>
      )}

      <div className={styles.sections}>
        {hasToken && (
          <>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.dot} style={{ background: '#22c55e' }} />
                  Онгоинги
                </h2>
                <Link to="/catalog?status=ongoing" className={styles.seeAll}>Все →</Link>
              </div>
              <AnimeGrid items={ongoing} loading={loading} error={error} deduplicate={false} />
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.dot} style={{ background: '#f59e0b' }} />
                  Топ по рейтингу
                </h2>
                <Link to="/catalog?sort=shikimori_rating" className={styles.seeAll}>Все →</Link>
              </div>
              <AnimeGrid items={top} loading={loading} error={error} deduplicate={false} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
