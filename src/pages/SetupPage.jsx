import React, { useState, useEffect } from 'react';
import { setToken, getToken } from '../utils/kodik';
import styles from './SetupPage.module.css';

export default function SetupPage() {
  const [token, setTokenInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [current, setCurrent] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('vireon_token') || '';
    setCurrent(t);
    setTokenInput(t);
  }, []);

  const save = () => {
    const t = token.trim();
    localStorage.setItem('vireon_token', t);
    setToken(t);
    setCurrent(t);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clear = () => {
    localStorage.removeItem('vireon_token');
    setToken('');
    setCurrent('');
    setTokenInput('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.icon}>🔑</div>
          <h1 className={styles.title}>Настройка API ключа</h1>
          <p className={styles.subtitle}>
            Для работы Vireon нужен API ключ от сервиса <strong>Kodik</strong> — бесплатного видеохостинга аниме.
          </p>

          {current && (
            <div className={styles.currentBadge}>
              <span className={styles.dot} />
              API ключ подключён
            </div>
          )}

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <div>
                <h3>Зарегистрируйся на Kodik</h3>
                <p>Перейди на сайт и создай аккаунт владельца сайта</p>
                <a href="https://bd.kodikres.com/users/sites" target="_blank" rel="noreferrer" className={styles.link}>
                  bd.kodikres.com → Мои сайты
                </a>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <div>
                <h3>Получи API ключ</h3>
                <p>В личном кабинете на странице «Мои сайты» скопируй свой токен</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <div>
                <h3>Вставь ключ ниже</h3>
                <p>Ключ сохраняется локально в браузере и никуда не отправляется</p>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>API Token</label>
            <input
              type="text"
              className={styles.input}
              value={token}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="Вставь токен сюда..."
              spellCheck={false}
            />
          </div>

          <div className={styles.actions}>
            <button onClick={save} className={styles.btnSave}>
              {saved ? '✓ Сохранено!' : 'Сохранить'}
            </button>
            {current && (
              <button onClick={clear} className={styles.btnClear}>Удалить ключ</button>
            )}
          </div>

          <div className={styles.note}>
            <h4>📌 Важно</h4>
            <ul>
              <li>Ключ хранится только в твоём браузере (localStorage)</li>
              <li>Kodik предоставляет контент бесплатно для некоммерческих проектов</li>
              <li>Для деплоя на Cloudflare Pages — просто загрузи папку <code>dist</code> после <code>npm run build</code></li>
              <li>Никакой сервер не нужен — всё работает на статическом хостинге</li>
            </ul>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🚀 Деплой на Cloudflare Pages</h2>
          <div className={styles.deploySteps}>
            <div className={styles.codeBlock}>
              <code>npm install</code>
            </div>
            <div className={styles.codeBlock}>
              <code>npm run build</code>
            </div>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>
              Затем зайди на <strong>dash.cloudflare.com</strong> → Pages → Create → Upload assets → загрузи папку <code>dist/</code>. Сайт заработает мгновенно с HTTPS и CDN по всему миру — полностью бесплатно!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
