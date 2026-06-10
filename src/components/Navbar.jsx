import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../utils/kodik';
import s from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inputRef = useRef();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/search?q=${encodeURIComponent(q.trim())}`); setQ(''); inputRef.current?.blur(); }
  };

  return (
    <header className={`${s.header} ${scrolled ? s.scrolled : ''}`}>
      <div className={s.inner}>

        {/* Logo */}
        <Link to="/" className={s.logo}>
          <img src="/logo.png" alt="Vireon" className={s.logoImg} />
          <span className={s.logoText}>VIREON</span>
        </Link>

        {/* Desktop nav */}
        <nav className={s.nav}>
          <NavLink to="/" end className={({isActive}) => `${s.navLink} ${isActive ? s.active : ''}`}>Главная</NavLink>
          {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
            <NavLink
              key={cat.id}
              to={`/catalog?cat=${cat.id}`}
              className={({isActive}) => `${s.navLink} ${isActive ? s.active : ''}`}
            >
              {cat.label}
            </NavLink>
          ))}
          <NavLink to="/catalog" end className={({isActive}) => `${s.navLink} ${isActive ? s.active : ''}`}>Каталог</NavLink>
        </nav>

        {/* Search */}
        <form className={`${s.search} ${searchFocus ? s.searchFocused : ''}`} onSubmit={submit}>
          <svg className={s.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск фильмов, аниме, сериалов..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            className={s.searchInput}
          />
        </form>

        {/* Burger */}
        <button className={`${s.burger} ${mobileOpen ? s.burgerOpen : ''}`} onClick={() => setMobileOpen(v => !v)} aria-label="Меню">
          <span/><span/><span/>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={s.mobile}>
          <form className={s.mobileSearch} onSubmit={submit}>
            <input
              type="text"
              placeholder="Поиск..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className={s.searchInput}
              autoFocus
            />
          </form>
          <NavLink to="/" end className={s.mobileLink}>🏠 Главная</NavLink>
          {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
            <NavLink key={cat.id} to={`/catalog?cat=${cat.id}`} className={s.mobileLink}>
              {cat.icon} {cat.label}
            </NavLink>
          ))}
          <NavLink to="/catalog" className={s.mobileLink}>📋 Каталог</NavLink>
        </div>
      )}
    </header>
  );
}
