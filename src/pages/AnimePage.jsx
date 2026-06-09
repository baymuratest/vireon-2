import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getByShikimoriId, getPoster, getRating, getGenres, buildEmbedUrl, getToken } from '../utils/kodik';
import styles from './AnimePage.module.css';

export default function AnimePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const kodikId = searchParams.get('kodikId');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [playerActive, setPlayerActive] = useState(false);

  useEffect(() => {
    if (!getToken()) { setError('Добавь API ключ в настройках'); setLoading(false); return; }
    const load = async () => {
      try {
        const res = await getByShikimoriId(id);
        setData(res);
        if (res.results?.length) {
          const preferred = kodikId
            ? res.results.find(r => r.id === kodikId) || res.results[0]
            : res.results[0];
          setSelectedResult(preferred);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;
  if (error) return <div className={styles.error}><p>{error}</p></div>;
  if (!data || !selectedResult) return <div className={styles.error}><p>Аниме не найдено</p></div>;

  const mat = selectedResult?.material_data;
  const poster = getPoster(selectedResult);
  const rating = getRating(selectedResult);
  const genres = getGenres(selectedResult);
  const title = selectedResult?.title || mat?.title || 'Без названия';
  const titleOrig = selectedResult?.title_orig || mat?.title_en;
  const description = mat?.anime_description || mat?.description;
  const year = selectedResult?.year;
  const episodes = selectedResult?.episodes_count;
  const status = mat?.anime_status;
  const embedUrl = buildEmbedUrl(selectedResult?.link);

  // Unique translations
  const translations = data.results || [];

  const statusMap = {
    ongoing: { text: 'Онгоинг', color: '#22c55e' },
    released: { text: 'Вышел', color: '#06b6d4' },
    anons: { text: 'Анонс', color: '#f59e0b' },
  };
  const statusInfo = statusMap[status];

  return (
    <div className={styles.page}>
      {/* Blurred bg poster */}
      {poster && (
        <div className={styles.bgPoster} style={{ backgroundImage: `url(${poster})` }} />
      )}

      <div className={styles.inner}>
        {/* Top section */}
        <div className={styles.top}>
          <div className={styles.posterWrap}>
            {poster ? (
              <img src={poster} alt={title} className={styles.poster} />
            ) : (
              <div className={styles.posterFallback}>▶</div>
            )}
            {rating && (
              <div className={styles.ratingBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {Number(rating).toFixed(1)}
              </div>
            )}
          </div>

          <div className={styles.info}>
            {statusInfo && (
              <span className={styles.statusBadge} style={{ color: statusInfo.color, background: statusInfo.color + '18' }}>
                {statusInfo.text}
              </span>
            )}
            <h1 className={styles.title}>{title}</h1>
            {titleOrig && <p className={styles.titleOrig}>{titleOrig}</p>}

            <div className={styles.meta}>
              {year && <span className={styles.metaChip}>{year}</span>}
              {episodes && <span className={styles.metaChip}>{episodes} эп.</span>}
              {selectedResult?.quality && <span className={styles.metaChip}>{selectedResult.quality}</span>}
            </div>

            {genres.length > 0 && (
              <div className={styles.genres}>
                {genres.map(g => <span key={g} className={styles.genre}>{g}</span>)}
              </div>
            )}

            {description && <p className={styles.description}>{description}</p>}

            <button
              className={styles.watchBtn}
              onClick={() => setPlayerActive(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Смотреть
            </button>

            {/* Translations */}
            {translations.length > 1 && (
              <div className={styles.translations}>
                <p className={styles.transLabel}>Озвучка / субтитры:</p>
                <div className={styles.transList}>
                  {translations.map(t => (
                    <button
                      key={t.id}
                      className={`${styles.transBtn} ${selectedResult?.id === t.id ? styles.transBtnActive : ''}`}
                      onClick={() => { setSelectedResult(t); setPlayerActive(false); }}
                    >
                      <span className={t.translation?.type === 'voice' ? styles.voiceIcon : styles.subIcon}>
                        {t.translation?.type === 'voice' ? '🎙' : '📝'}
                      </span>
                      {t.translation?.title || 'Неизвестно'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Player */}
        {playerActive && embedUrl && (
          <div className={styles.playerSection}>
            <div className={styles.playerWrap}>
              <iframe
                src={embedUrl}
                className={styles.player}
                allowFullScreen
                allow="autoplay; fullscreen"
                title={title}
                frameBorder="0"
              />
            </div>
          </div>
        )}

        {!playerActive && (
          <div className={styles.playerPlaceholder} onClick={() => setPlayerActive(true)}>
            <div className={styles.playerPlaceholderBg}
              style={poster ? { backgroundImage: `url(${poster})` } : {}}
            />
            <div className={styles.playerPlayIcon}>
              <div className={styles.bigPlayBtn}>▶</div>
              <p>Нажми, чтобы смотреть</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
