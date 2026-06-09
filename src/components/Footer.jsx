import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>VIREON</span>
          <p className={styles.desc}>Смотри аниме в лучшем качестве.<br/>Контент предоставляется сервисом Kodik.</p>
        </div>
        <div className={styles.links}>
          <Link to="/">Главная</Link>
          <Link to="/catalog">Каталог</Link>
          <Link to="/setup">Настройка API</Link>
        </div>
        <div className={styles.copy}>
          <p>© 2025 Vireon. Powered by Kodik API.</p>
        </div>
      </div>
    </footer>
  );
}
