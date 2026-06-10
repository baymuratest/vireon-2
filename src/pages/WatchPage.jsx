import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  getByKodikId, getById, getByKinopoiskId,
  getPoster, getTitle, getRating, getRatingLabel,
  getGenres, getDescription, buildEmbedUrl,
  getTypeLabel, getTypeColor
} from '../utils/kodik';
import s from './WatchPage.module.css';

/* ─── Player API hook ─────────────────────────────────────── */
function useKodikPlayer(iframeRef) {
  const [info, setInfo] = useState({ episode: null, season: null, translation: null, time: 0, duration: 0, playing: false });

  useEffect(() => {
    const handler = (e) => {
      const { key, value } = e.data || {};
      if (!key) return;
      if (key === 'kodik_player_time_update')    setInfo(p => ({ ...p, time: value }));
      if (key === 'kodik_player_duration_update') setInfo(p => ({ ...p, duration: value }));
      if (key === 'kodik_player_play')            setInfo(p => ({ ...p, playing: true }));
      if (key === 'kodik_player_pause')           setInfo(p => ({ ...p, playing: false }));
      if (key === 'kodik_player_video_ended')     setInfo(p => ({ ...p, playing: false }));
      if (key === 'kodik_player_current_episode') setInfo(p => ({ ...p, ...value }));
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const send = useCallback((value) => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage({ key: 'kodik_player_api', value }, '*');
  }, [iframeRef]);

  const play    = () => send({ method: 'play' });
  const pause   = () => send({ method: 'pause' });
  const seek    = (s) => send({ method: 'seek', seconds: s });
  const setVol  = (v) => send({ method: 'volume', volume: v });
  const goEp    = (season, episode) => send({ method: 'change_episode', season, episode });

  return { info, play, pause, seek, setVol, goEp };
}

/* ─── Translation selector ────────────────────────────────── */
function TranslationSelector({ translations, selectedId, onSelect }) {
  const [tab, setTab] = useState('voice');

  const voice = translations.filter(t => t?.translation?.type === 'voice');
  const subs  = translations.filter(t => t?.translation?.type === 'subtitles');
  const list  = tab === 'voice' ? voice : subs;

  if (!translations.length) return null;

  return (
    <div className={s.transBox}>
      <div className={s.transHeader}>
        <span className={s.transTitle}>Перевод</span>
        <div className={s.transTabs}>
          {voice.length > 0 && (
            <button className={`${s.transTab} ${tab === 'voice' ? s.transTabActive : ''}`} onClick={() => setTab('voice')}>
              🎙 Озвучка ({voice.length})
            </button>
          )}
          {subs.length > 0 && (
            <button className={`${s.transTab} ${tab === 'subtitles' ? s.transTabActive : ''}`} onClick={() => setTab('subtitles')}>
              📝 Субтитры ({subs.length})
            </button>
          )}
        </div>
      </div>
      <div className={s.transList}>
        {list.map(t => {
          const active = t.id === selectedId;
          const quality = t.quality?.replace('WEB-DLRip ', '').replace('WEB-DL ', '') || '';
          const lastEp = t.last_episode;
          const lastS  = t.last_season;
          return (
            <button
              key={t.id}
              className={`${s.transCard} ${active ? s.transCardActive : ''}`}
              onClick={() => onSelect(t)}
            >
              <div className={s.transCardInner}>
                <div className={s.transName}>{t.translation?.title || '—'}</div>
                <div className={s.transMeta}>
                  {quality && <span className={s.transQuality}>{quality}</span>}
                  {lastEp && <span className={s.transEp}>до {lastS ? `${lastS}×` : ''}Ep.{lastEp}</span>}
                </div>
              </div>
              {active && <div className={s.transActiveCheck}>✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Episodes view ───────────────────────────────────────── */
function EpisodesView({ seasons, seasonKeys, playerGoEp, currentEp, currentSeason }) {
  const [curS, setCurS] = useState(seasonKeys[seasonKeys.length - 1] || seasonKeys[0]);
  const episodes = seasons[curS]?.episodes || {};
  const epKeys   = Object.keys(episodes).sort((a, b) => Number(a) - Number(b));

  return (
    <div className={s.epSection}>
      {seasonKeys.length > 1 && (
        <div className={s.seasonRow}>
          {seasonKeys.map(sk => (
            <button
              key={sk}
              className={`${s.seasonBtn} ${curS === sk ? s.seasonBtnActive : ''}`}
              onClick={() => setCurS(sk)}
            >
              Сезон {sk}
            </button>
          ))}
        </div>
      )}
      <div className={s.epGrid}>
        {epKeys.map(ep => {
          const isActive = String(currentEp) === ep && String(currentSeason) === curS;
          const link = typeof episodes[ep] === 'string' ? episodes[ep] : episodes[ep]?.link;
          const epTitle = episodes[ep]?.title;
          const screenshots = episodes[ep]?.screenshots;
          return (
            <button
              key={ep}
              className={`${s.epCard} ${isActive ? s.epCardActive : ''}`}
              onClick={() => playerGoEp(Number(curS), Number(ep))}
              title={epTitle || `Серия ${ep}`}
            >
              {screenshots?.[0] && (
                <div className={s.epThumb}>
                  <img src={screenshots[0]} alt={`Ep ${ep}`} loading="lazy" />
                </div>
              )}
              <div className={s.epInfo}>
                <span className={s.epNum}>{ep}</span>
                {epTitle && <span className={s.epTitle}>{epTitle}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */
export default function WatchPage() {
  const { id }   = useParams();
  const [sp]     = useSearchParams();
  const ext      = sp.get('ext') || '';

  const [allResults,  setAllResults]  = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [playerOn,    setPlayerOn]    = useState(false);
  const [tab,         setTab]         = useState('episodes');
  const [liked,       setLiked]       = useState(false);
  const [inList,      setInList]      = useState(false);

  const iframeRef = useRef(null);
  const { info, play, pause, seek, setVol, goEp } = useKodikPlayer(iframeRef);
  const rawId = decodeURIComponent(id);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(''); setPlayerOn(false);
      try {
        let res;
        try { res = await getByKodikId(rawId); } catch {}
        if (!res?.results?.length && ext && /^\d+$/.test(ext)) {
          try { res = await getById(ext); } catch {}
        }
        if (!res?.results?.length && ext && /^\d+$/.test(ext)) {
          try { res = await getByKinopoiskId(ext); } catch {}
        }
        if (!res?.results?.length) throw new Error('Материал не найден');
        setAllResults(res.results);
        setSelected(res.results[0]);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rawId, ext]);

  const handleSelectTranslation = (t) => {
    setSelected(t);
    setPlayerOn(false);
    setTimeout(() => setPlayerOn(true), 100);
  };

  if (loading) return (
    <div className="page-wrapper">
      <div className="spinner-wrap" style={{ minHeight: '80vh' }}><div className="spinner"/></div>
    </div>
  );

  if (error) return (
    <div className="page-wrapper">
      <div className="page-inner" style={{ paddingTop: 80 }}>
        <div className="error-box">
          <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
          <h3>Не удалось загрузить</h3>
          <p>{error}</p>
          <Link to="/" className="btn-ghost" style={{ marginTop: 20, display: 'inline-flex' }}>← На главную</Link>
        </div>
      </div>
    </div>
  );

  if (!selected) return null;

  const mat        = selected?.material_data;
  const poster     = getPoster(selected);
  const title      = getTitle(selected);
  const titleOrig  = selected?.title_orig || mat?.title_en;
  const desc       = getDescription(selected);
  const rating     = getRatingLabel(selected);
  const genres     = getGenres(selected);
  const year       = selected?.year || mat?.year;
  const eps        = selected?.episodes_count;
  const type       = selected?.type;
  const typeColor  = getTypeColor(type);
  const status     = mat?.anime_status;
  const ageRating  = mat?.rating_mpaa || (mat?.minimal_age ? `${mat.minimal_age}+` : null);
  const tagline    = mat?.tagline;
  const studios    = mat?.anime_studios || [];
  const countries  = mat?.countries || [];
  const duration   = mat?.duration;
  const directors  = mat?.directors?.slice(0, 3) || [];
  const actors     = mat?.actors?.slice(0, 10) || [];
  const nextEp     = mat?.next_episode_at;
  const epsAired   = mat?.episodes_aired;
  const epsTotal   = mat?.episodes_total || eps;
  const lastSeason = selected?.last_season;
  const seasons    = selected?.seasons || {};
  const seasonKeys = Object.keys(seasons).sort((a, b) => Number(a) - Number(b));

  // Build embed URL with all useful params
  const baseLink = selected?.link;
  let embedUrl = buildEmbedUrl(baseLink);
  if (embedUrl && poster) {
    embedUrl += (embedUrl.includes('?') ? '&' : '?') + `poster=${encodeURIComponent(poster)}`;
  }
  if (embedUrl) {
    embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'auto_translation=false';
  }

  const statusMap = {
    ongoing:  { label: 'Онгоинг',  color: '#34d399', dot: true },
    released: { label: 'Завершён', color: '#38bdf8', dot: false },
    anons:    { label: 'Анонс',    color: '#fbbf24', dot: false },
  };
  const si = statusMap[status];

  const progressPct = epsAired && epsTotal ? Math.round((epsAired / epsTotal) * 100) : null;
  const hasTabs = seasonKeys.length > 0 || actors.length > 0;

  return (
    <div className={s.page}>
      {poster && <div className={s.backdrop} style={{ backgroundImage: `url(${poster})` }}/>}
      <div className={s.backdropFade}/>

      <div className={s.wrap}>

        {/* ── Breadcrumb ── */}
        <nav className={s.crumb}>
          <Link to="/">Главная</Link><span>›</span>
          <Link to="/catalog">Каталог</Link><span>›</span>
          <span className={s.crumbCurrent}>{title}</span>
        </nav>

        {/* ── Main grid ── */}
        <div className={s.main}>

          {/* Poster column */}
          <aside className={s.aside}>
            <div className={s.posterWrap}>
              {poster
                ? <img src={poster} alt={title} className={s.poster}/>
                : <div className={s.posterFb} style={{ '--tc': typeColor }}>▶</div>
              }
              {rating && (
                <div className={s.ratingBadge}>
                  ⭐ {Number(rating.val).toFixed(1)}
                  <span>{rating.src}</span>
                </div>
              )}
              {si && (
                <div className={s.statusBadge} style={{ background: si.color + '22', color: si.color }}>
                  {si.dot && <span className={s.statusDot} style={{ background: si.color }}/>}
                  {si.label}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <button className={s.watchBtn} onClick={() => { setPlayerOn(true); document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
              <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>
              Смотреть
            </button>

            <div className={s.actionRow}>
              <button className={`${s.actionBtn} ${liked ? s.actionBtnOn : ''}`} onClick={() => setLiked(v => !v)} title="В избранное">
                <svg viewBox="0 0 24 24" width="16" height="16" fill={liked ? '#fb7185' : 'none'} stroke={liked ? '#fb7185' : 'currentColor'} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {liked ? 'В избранном' : 'Избранное'}
              </button>
              <button className={`${s.actionBtn} ${inList ? s.actionBtnOn : ''}`} onClick={() => setInList(v => !v)} title="Смотрю">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                {inList ? 'Смотрю' : 'В список'}
              </button>
            </div>

            {/* Quick stats */}
            <div className={s.quickStats}>
              {year && <div className={s.qs}><span>Год</span><b>{year}</b></div>}
              {type && <div className={s.qs}><span>Тип</span><b style={{ color: typeColor }}>{getTypeLabel(type)}</b></div>}
              {duration && <div className={s.qs}><span>Длина</span><b>{duration} мин</b></div>}
              {epsTotal && <div className={s.qs}><span>Эпизоды</span><b>{epsAired !== undefined ? `${epsAired}/${epsTotal}` : epsTotal}</b></div>}
              {lastSeason > 1 && <div className={s.qs}><span>Сезоны</span><b>{lastSeason}</b></div>}
              {ageRating && <div className={s.qs}><span>Рейтинг</span><b>{ageRating}</b></div>}
            </div>

            {/* Progress bar for ongoing */}
            {progressPct !== null && (
              <div className={s.progressWrap}>
                <div className={s.progressLabel}>
                  <span>Выпущено</span><span>{epsAired}/{epsTotal}</span>
                </div>
                <div className={s.progressBar}>
                  <div className={s.progressFill} style={{ width: progressPct + '%' }}/>
                </div>
              </div>
            )}
          </aside>

          {/* Info column */}
          <div className={s.info}>
            <div className={s.typeLine}>
              <span className={s.typeChip} style={{ background: typeColor + '20', color: typeColor }}>{getTypeLabel(type)}</span>
              {ageRating && <span className={s.ageChip}>{ageRating}</span>}
              {si && (
                <span className={s.statusChip} style={{ background: si.color + '18', color: si.color }}>
                  {si.dot && '● '}{si.label}
                </span>
              )}
            </div>

            <h1 className={s.title}>{title}</h1>
            {titleOrig && titleOrig !== title && <p className={s.titleOrig}>{titleOrig}</p>}
            {tagline && <p className={s.tagline}>«{tagline}»</p>}

            {/* Rating row */}
            {rating && (
              <div className={s.ratingRow}>
                <div className={s.ratingBig}>
                  <svg viewBox="0 0 24 24" fill="var(--gold)" width="20" height="20">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className={s.ratingVal}>{Number(rating.val).toFixed(2)}</span>
                  <span className={s.ratingSrc}>{rating.src}</span>
                </div>
                {mat?.shikimori_votes && <span className={s.ratingVotes}>{Number(mat.shikimori_votes).toLocaleString()} оценок</span>}
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className={s.genreRow}>
                {genres.map(g => (
                  <Link key={g} to={`/catalog?genre=${encodeURIComponent(g)}`} className={s.genreTag}>{g}</Link>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className={s.metaGrid}>
              {countries.length > 0 && <MetaItem label="Страна" value={countries.join(', ')} />}
              {studios.length > 0   && <MetaItem label="Студия" value={studios.join(', ')} />}
              {directors.length > 0 && <MetaItem label="Режиссёр" value={directors.join(', ')} />}
              {nextEp               && <MetaItem label="Следующий эп." value={new Date(nextEp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} accent />}
              {mat?.aired_at        && <MetaItem label="Начало показа" value={new Date(mat.aired_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })} />}
              {mat?.released_at     && <MetaItem label="Конец показа" value={new Date(mat.released_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })} />}
            </div>

            {/* Description */}
            {desc && <ExpandableText text={desc} />}

            {/* Next episode countdown */}
            {nextEp && si?.dot && (
              <div className={s.nextEpBanner}>
                <span className={s.nextEpDot}/>
                <span>Следующий эпизод: <b>{new Date(nextEp).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</b></span>
              </div>
            )}
          </div>
        </div>

        {/* ── Translation Selector ── */}
        <TranslationSelector
          translations={allResults}
          selectedId={selected?.id}
          onSelect={handleSelectTranslation}
        />

        {/* ── Player ── */}
        <section id="player-section" className={s.playerSection}>
          <div className={s.playerHeader}>
            <div className={s.playerHeaderLeft}>
              <span className={s.playerTitle}>
                {info.episode ? `Сезон ${info.season || 1} · Серия ${info.episode}` : 'Плеер'}
              </span>
              {selected?.translation && (
                <span className={s.playerTrans}>{selected.translation.title}</span>
              )}
            </div>
            {info.duration > 0 && (
              <span className={s.playerTime}>
                {Math.floor(info.time / 60)}:{String(Math.floor(info.time % 60)).padStart(2, '0')} / {Math.floor(info.duration / 60)}:{String(Math.floor(info.duration % 60)).padStart(2, '0')}
              </span>
            )}
          </div>

          {playerOn && embedUrl ? (
            <div className={s.playerWrap}>
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className={s.playerIframe}
                allowFullScreen
                allow="autoplay; fullscreen"
                title={title}
                frameBorder="0"
                scrolling="no"
              />
            </div>
          ) : (
            <div className={s.playerPlaceholder} onClick={() => setPlayerOn(true)}
              style={poster ? { backgroundImage: `url(${poster})` } : {}}
            >
              <div className={s.placeholderOverlay}/>
              <div className={s.placeholderContent}>
                <div className={s.bigPlayBtn}>
                  <svg viewBox="0 0 24 24" fill="white" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p className={s.placeholderText}>Нажми для просмотра</p>
                <p className={s.placeholderSub}>{selected?.translation?.title || ''} · {selected?.quality || ''}</p>
              </div>
            </div>
          )}
        </section>

        {/* ── Tabs: Episodes / Info ── */}
        {hasTabs && (
          <div className={s.tabs}>
            <div className={s.tabBar}>
              {seasonKeys.length > 0 && (
                <button className={`${s.tabBtn} ${tab === 'episodes' ? s.tabBtnActive : ''}`} onClick={() => setTab('episodes')}>
                  Эпизоды {eps ? `(${eps})` : ''}
                </button>
              )}
              {actors.length > 0 && (
                <button className={`${s.tabBtn} ${tab === 'cast' ? s.tabBtnActive : ''}`} onClick={() => setTab('cast')}>
                  Актёры
                </button>
              )}
              <button className={`${s.tabBtn} ${tab === 'details' ? s.tabBtnActive : ''}`} onClick={() => setTab('details')}>
                Подробнее
              </button>
            </div>

            {tab === 'episodes' && seasonKeys.length > 0 && (
              <EpisodesView
                seasons={seasons}
                seasonKeys={seasonKeys}
                playerGoEp={goEp}
                currentEp={info.episode}
                currentSeason={info.season}
              />
            )}

            {tab === 'cast' && actors.length > 0 && (
              <div className={s.castGrid}>
                {actors.map(a => (
                  <div key={a} className={s.castCard}>
                    <div className={s.castAvatar}>{a[0]}</div>
                    <span className={s.castName}>{a}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'details' && (
              <div className={s.detailsGrid}>
                {year         && <DetailRow k="Год выпуска" v={year} />}
                {countries.join(', ') && <DetailRow k="Страна" v={countries.join(', ')} />}
                {duration     && <DetailRow k="Продолжительность" v={`${duration} мин.`} />}
                {studios.join(', ') && <DetailRow k="Студия" v={studios.join(', ')} />}
                {directors.join(', ') && <DetailRow k="Режиссёр" v={directors.join(', ')} />}
                {mat?.writers?.join(', ') && <DetailRow k="Сценарий" v={mat.writers.slice(0,3).join(', ')} />}
                {mat?.composers?.join(', ') && <DetailRow k="Музыка" v={mat.composers.slice(0,2).join(', ')} />}
                {mat?.premiere_ru  && <DetailRow k="Премьера (RU)" v={new Date(mat.premiere_ru).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} />}
                {mat?.premiere_world && <DetailRow k="Мировая премьера" v={new Date(mat.premiere_world).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} />}
                {mat?.kinopoisk_rating && <DetailRow k="КиноПоиск" v={`${Number(mat.kinopoisk_rating).toFixed(1)} (${Number(mat.kinopoisk_votes||0).toLocaleString()} голосов)`} />}
                {mat?.imdb_rating      && <DetailRow k="IMDb" v={`${Number(mat.imdb_rating).toFixed(1)} (${Number(mat.imdb_votes||0).toLocaleString()} голосов)`} />}
                {mat?.shikimori_rating && <DetailRow k="Shikimori" v={`${Number(mat.shikimori_rating).toFixed(2)} (${Number(mat.shikimori_votes||0).toLocaleString()} голосов)`} />}
                {mat?.anime_kind       && <DetailRow k="Вид аниме" v={mat.anime_kind.toUpperCase()} />}
                {mat?.anime_licensed_by?.length && <DetailRow k="Лицензия RU" v={mat.anime_licensed_by.join(', ')} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetaItem({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</span>
      <span style={{ fontSize: 13, color: accent ? 'var(--accent)' : 'var(--text)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function DetailRow({ k, v }) {
  return (
    <div className={s.detailRow}>
      <span className={s.detailKey}>{k}</span>
      <span className={s.detailVal}>{v}</span>
    </div>
  );
}

function ExpandableText({ text }) {
  const [exp, setExp] = useState(false);
  const short = text.length > 300;
  const shown = !short || exp ? text : text.slice(0, 300) + '...';
  return (
    <div className={s.descWrap}>
      <p className={s.desc}>{shown}</p>
      {short && (
        <button className={s.descToggle} onClick={() => setExp(v => !v)}>
          {exp ? 'Свернуть ↑' : 'Читать полностью ↓'}
        </button>
      )}
    </div>
  );
}
