# 🎬 Vireon — Онлайн-кинотеатр на Kodik API

Профессиональный сайт для просмотра фильмов, сериалов, аниме и мультфильмов.
Дизайн вдохновлён Shikimori / Animego / Animori.

## ✨ Возможности

- 🏠 Главная с героем-баннером, онгоингами, топ аниме / фильмов / сериалов
- 🔍 Поиск по всей базе Kodik
- 📋 Каталог с фильтрами: категория, жанр, статус, год, сортировка
- 🎬 Страница просмотра:
  - Постер, рейтинг (Shikimori / IMDb / КП), жанры, описание
  - **Красивый селектор озвучек** (голосовые + субтитры отдельно)
  - Встроенный плеер Kodik с постером
  - **Player API** — отслеживание серии/сезона/времени в реальном времени
  - Список эпизодов с миниатюрами (если доступны)
  - Список актёров, подробная информация
  - Прогресс-бар онгоингов, таймер следующей серии
- 📱 Полностью адаптивный дизайн
- ⚡ Cloudflare Pages — деплой без сервера

## 🔑 API токен

Токен вшит в `src/utils/kodik.js` — строка `const TOKEN = '...'`

**Пользователь ничего не видит и не вводит!**

Получить/заменить токен: https://bd.kodikres.com/users/sites

## 🚀 Запуск

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # собрать dist/
```

## ☁️ Деплой Cloudflare Pages (бесплатно)

**Вариант А — перетащить папку:**
1. `npm run build`
2. dash.cloudflare.com → Pages → Create → Upload assets → загрузи `dist/`
3. Сайт готов с HTTPS!

**Вариант Б — через GitHub (автодеплой):**
1. Запушь на GitHub
2. Cloudflare Pages → Connect to Git → выбрать репо
3. Build command: `npm run build`
4. Output directory: `dist`

## 📁 Структура

```
vireon/
├── public/
│   ├── logo.png          ← логотип
│   └── _redirects        ← SPA роутинг для Cloudflare
├── src/
│   ├── components/       ← Navbar, MediaCard, MediaGrid, Footer
│   ├── pages/            ← Home, Search, Catalog, Watch, NotFound
│   ├── utils/kodik.js    ← Весь Kodik API (токен здесь)
│   └── styles/global.css ← Дизайн-система
├── index.html
├── package.json
└── vite.config.js
```

## 📡 Используемые данные из Kodik

| Данные | API поле |
|--------|----------|
| Постер | `material_data.anime_poster_url` / `poster_url` |
| Название | `material_data.title` / `anime_title` |
| Рейтинг | `shikimori_rating` / `imdb_rating` / `kinopoisk_rating` |
| Жанры | `anime_genres` / `genres` |
| Описание | `anime_description` / `description` |
| Статус | `anime_status` (ongoing/released/anons) |
| Эпизоды | `episodes` из `with_episodes=true` |
| Озвучки | Несколько результатов по одному ID |
| Плеер | `link` → iframe |
| Player API | postMessage `kodik_player_api` |

