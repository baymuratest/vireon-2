import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MediaGrid from '../components/MediaGrid';
import MediaCard from '../components/MediaCard';
import {
  getLatest, getOngoing, getTopAnime, getTopMovies, getTopSerials,
  getPoster, getTitle, getRating, getDescription, buildEmbedUrl,
  deduplicate, CATEGORIES
} from '../utils/kodik';
import s from './Home.module.css';

// Hero banner rotator
function HeroBanner({ items }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[idx];
  const poster = getPoster(item);
  const title  = getTitle(item);
  const desc   = getDescription(item);
  const rating = getRating(item);
  const id     = item?.id;
  const ext    = item?.shikimori_id || item?.kinopoisk_id || id;

  return (
    <div className={s.hero}>
      {/* Background */}
      {poster && <div className={s.heroBg} style={{ backgroundImage: `url(${poster})` }} />}
      <div className={s.heroOverlay} />

      <div className={s.heroContent}>
        <div className={s.heroMeta}>
          {item?.year && <span className={s.heroMetaChip}>{item.year}</span>}
          {rating && (
            <span className={s.heroMetaChip}>
              ⭐ {Number(rating).toFixed(1)}
            </span>
          )}
          {item?.material_data?.anime_status === 'ongoing' && (
            <span className={s.ongoingBadge}>● Онгоинг</span>
          )}
        </div>

        <h1 className={s.heroTitle}>{title}</h1>

        {desc && <p className={s.heroDesc}>{desc.slice(0, 200)}{desc.length > 200 ? '...' : ''}</p>}

        <div className={s.heroActions}>
          <Link to={`/watch/${encodeURIComponent(id)}?ext=${ext}`} className={s.heroPlay}>
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>
            Смотреть
          </Link>
          <Link to={`/watch/${encodeURIComponent(id)}?ext=${ext}`} className={s.heroInfo}>
            Подробнее
          </Link>
        </div>
      </div>

      {/* Dots */}
      <div className={s.heroDots}>
        {items.map((_, i) => (
          <button
            key={i}
            className={`${s.heroDot} ${i === idx ? s.heroDotActive : ''}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>

      {/* Thumbnails row */}
      <div className={s.heroThumbs}>
        {items.map((it, i) => {
          const p = getPoster(it);
          return (
            <button
              key={i}
              className={`${s.heroThumb} ${i === idx ? s.heroThumbActive : ''}`}
              onClick={() => setIdx(i)}
            >
              {p ? <img src={p} alt="" /> : <div className={s.thumbFallback}>▶</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Category quick-nav
function CategoryNav() {
  return (
    <div className={s.catNav}>
      {CATEGORIES.map(c => (
        <Link
          key={c.id}
          to={c.id === 'all' ? '/catalog' : `/catalog?cat=${c.id}`}
          className={s.catChip}
        >
          <span className={s.catIcon}>{c.icon}</span>
          {c.label}
        </Link>
      ))}
    </div>
  );
}

// Row section
function Section({ title, dot, items, loading, seeAllHref }) {
  return (
    <section className={s.section}>
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-dot" style={{ background: dot }} />
          {title}
        </h2>
        {seeAllHref && <Link to={seeAllHref} className="see-all">Все →</Link>}
      </div>
      <MediaGrid items={items} loading={loading} skeletonCount={10} />
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const [heroItems,   setHeroItems]   = useState([]);
  const [latest,      setLatest]      = useState([]);
  const [ongoing,     setOngoing]     = useState([]);
  const [topAnime,    setTopAnime]    = useState([]);
  const [topMovies,   setTopMovies]   = useState([]);
  const [topSerials,  setTopSerials]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [latestRes, ongoingRes, topAnimeRes, topMovRes, topSerRes] = await Promise.all([
          getLatest(20),
          getOngoing(10),
          getTopAnime(20),
          getTopMovies(20),
          getTopSerials(20),
        ]);
        const latestItems = deduplicate(latestRes.results || []);
        setHeroItems(latestItems.slice(0, 6));
        setLatest(latestItems);
        setOngoing(deduplicate(ongoingRes.results || []));
        setTopAnime(deduplicate(topAnimeRes.results || []));
        setTopMovies(deduplicate(topMovRes.results || []));
        setTopSerials(deduplicate(topSerRes.results || []));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className={s.page}>
      {/* Hero */}
      {heroItems.length > 0 && !loading
        ? <HeroBanner items={heroItems} />
        : (
          <div className={s.heroFallback}>
            <div className={s.heroFallbackOrb1} />
            <div className={s.heroFallbackOrb2} />
            <div className={s.heroFallbackGrid} />
            <div className={s.heroFallbackContent}>
              <p className={s.heroLabel}>HD · 4K · Без рекламы</p>
              <h1 className={s.heroFallbackTitle}>
                Кино без <span className={s.grad}>границ</span>
              </h1>
              <p className={s.heroFallbackSub}>
                Фильмы, сериалы, аниме — всё в одном месте
              </p>
              <form onSubmit={handleSearch} className={s.heroSearchForm}>
                <input
                  type="text"
                  placeholder="Поиск фильмов, аниме, сериалов..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  className={s.heroSearchInput}
                />
                <button type="submit" className={s.heroSearchBtn}>Найти</button>
              </form>
            </div>
          </div>
        )
      }

      <div className={s.content}>
        {/* Category nav */}
        <CategoryNav />

        {/* Sections */}
        <Section
          title="Новинки"
          dot="var(--accent)"
          items={latest}
          loading={loading}
          seeAllHref="/catalog"
        />
        {ongoing.length > 0 && (
          <Section
            title="Онгоинги"
            dot="#34d399"
            items={ongoing}
            loading={false}
            seeAllHref="/catalog?cat=anime&status=ongoing"
          />
        )}
        <Section
          title="Топ аниме"
          dot="var(--primary-light)"
          items={topAnime}
          loading={loading}
          seeAllHref="/catalog?cat=anime&sort=shikimori_rating"
        />
        <Section
          title="Топ фильмы"
          dot="#38bdf8"
          items={topMovies}
          loading={loading}
          seeAllHref="/catalog?cat=movies&sort=imdb_rating"
        />
        <Section
          title="Топ сериалы"
          dot="#fb7185"
          items={topSerials}
          loading={loading}
          seeAllHref="/catalog?cat=serials&sort=kinopoisk_rating"
        />

        {error && <div className="error-box"><p>{error}</p></div>}
      </div>
    </div>
  );
}
