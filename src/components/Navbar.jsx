import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>▶</span>
          <span className={styles.logoText}>VIREON</span>
        </Link>

        <div className={styles.links}>
          <Link to="/" className={styles.link}>Главная</Link>
          <Link to="/catalog" className={styles.link}>Каталог</Link>
          <Link to="/setup" className={styles.link}>Настройка</Link>
        </div>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Найти аниме..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn} aria-label="Поиск">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </form>

        <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Меню">
          <span className={menuOpen ? styles.burgerActive : ''}></span>
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/" className={styles.mobileLink}>Главная</Link>
          <Link to="/catalog" className={styles.mobileLink}>Каталог</Link>
          <Link to="/setup" className={styles.mobileLink}>Настройка</Link>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <input
              type="text"
              placeholder="Найти аниме..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className={styles.searchInput}
            />
          </form>
        </div>
      )}
    </nav>
  );
}
