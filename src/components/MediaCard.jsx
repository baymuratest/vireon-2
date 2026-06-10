import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPoster, getTitle, getRating, getGenres, getTypeLabel, getTypeColor } from '../utils/kodik';
import s from './MediaCard.module.css';

export default function MediaCard({ item, index = 0 }) {
  const [imgErr, setImgErr] = useState(false);
  const poster  = imgErr ? null : getPoster(item);
  const title   = getTitle(item);
  const rating  = getRating(item);
  const genres  = getGenres(item).slice(0, 2);
  const year    = item?.year || item?.material_data?.year;
  const eps     = item?.episodes_count;
  const typeLabel = getTypeLabel(item?.type);
  const typeColor = getTypeColor(item?.type);
  const status  = item?.material_data?.anime_status;
  const id      = item?.shikimori_id || item?.kinopoisk_id || item?.id;

  const statusDot = status === 'ongoing' ? '#34d399' : null;

  return (
    <Link
      to={`/watch/${encodeURIComponent(item?.id)}?ext=${id}`}
      className={s.card}
      style={{ animationDelay: `${Math.min(index * 0.04, 0.4)}s` }}
    >
      {/* Poster */}
      <div className={s.poster}>
        {poster && !imgErr
          ? <img src={poster} alt={title} onError={() => setImgErr(true)} loading="lazy" />
          : <div className={s.fallback} style={{ '--tc': typeColor }}>
              <span className={s.fallbackIcon}>▶</span>
            </div>
        }
        <div className={s.overlay}>
          <div className={s.playBtn}>
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        {rating && (
          <div className={s.rating}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--gold)">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {Number(rating).toFixed(1)}
          </div>
        )}
        <div className={s.typeBadge} style={{ background: typeColor + '22', color: typeColor }}>
          {typeLabel}
        </div>
        {statusDot && <div className={s.statusDot} style={{ background: statusDot }} />}
      </div>

      {/* Info */}
      <div className={s.info}>
        <h3 className={s.title}>{title}</h3>
        <div className={s.meta}>
          {year && <span>{year}</span>}
          {eps  && <span>{eps} эп.</span>}
        </div>
        {genres.length > 0 && (
          <div className={s.genres}>
            {genres.map(g => <span key={g} className={s.genre}>{g}</span>)}
          </div>
        )}
      </div>
    </Link>
  );
}
