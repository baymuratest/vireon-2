import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPoster, getRating, getGenres } from '../utils/kodik';
import styles from './AnimeCard.module.css';

export default function AnimeCard({ item, index = 0 }) {
  const [imgError, setImgError] = useState(false);
  const poster = imgError ? null : getPoster(item);
  const rating = getRating(item);
  const genres = getGenres(item).slice(0, 2);
  const title = item?.title || item?.material_data?.title || 'Без названия';
  const year = item?.year || item?.material_data?.year;
  const episodes = item?.episodes_count;
  const status = item?.material_data?.anime_status;

  const statusLabel = {
    ongoing: { text: 'Онгоинг', color: '#22c55e' },
    released: { text: 'Вышел', color: '#06b6d4' },
    anons: { text: 'Анонс', color: '#f59e0b' },
  }[status] || null;

  const animeId = item?.shikimori_id || item?.id;

  return (
    <Link
      to={`/anime/${animeId}?kodikId=${item?.id}`}
      className={styles.card}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className={styles.poster}>
        {poster && !imgError ? (
          <img src={poster} alt={title} onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className={styles.posterFallback}>
            <span>▶</span>
          </div>
        )}
        <div className={styles.overlay}>
          <div className={styles.playBtn}>▶</div>
        </div>
        {rating && (
          <div className={styles.rating}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {Number(rating).toFixed(1)}
          </div>
        )}
        {statusLabel && (
          <div className={styles.statusBadge} style={{ background: statusLabel.color + '22', color: statusLabel.color }}>
            {statusLabel.text}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          {year && <span className={styles.metaItem}>{year}</span>}
          {episodes && <span className={styles.metaItem}>{episodes} эп.</span>}
        </div>
        {genres.length > 0 && (
          <div className={styles.genres}>
            {genres.map(g => <span key={g} className={styles.genre}>{g}</span>)}
          </div>
        )}
      </div>
    </Link>
  );
}
