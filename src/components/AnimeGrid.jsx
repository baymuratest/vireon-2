import React from 'react';
import AnimeCard from './AnimeCard';
import { deduplicateResults } from '../utils/kodik';
import styles from './AnimeGrid.module.css';

export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className="skeleton" style={{ aspectRatio: '2/3' }} />
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton" style={{ height: '14px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

export default function AnimeGrid({ items, loading, error, deduplicate = true }) {
  const list = deduplicate && items ? deduplicateResults(items) : items || [];

  if (error) {
    return (
      <div className={styles.errorBox}>
        <div className={styles.errorIcon}>⚠️</div>
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!list.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🌸</div>
        <p>Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {list.map((item, i) => (
        <AnimeCard key={item.id || i} item={item} index={i} />
      ))}
    </div>
  );
}
