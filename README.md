# 🎌 Vireon — Аниме плеер на Kodik API

Красивый React-сайт для просмотра аниме через Kodik API.

## ✨ Что умеет

- 🏠 Главная с онгоингами и топ аниме
- 🔍 Поиск по названию
- 📋 Каталог с фильтрами (жанр, статус, сортировка)
- 🎬 Страница аниме со встроенным плеером Kodik
- 🎙 Выбор озвучки / субтитров
- 📱 Полностью адаптивный дизайн

## 🚀 Быстрый старт

### 1. Установка

```bash
npm install
```

### 2. Получи API ключ Kodik

1. Зарегистрируйся на https://bd.kodikres.com/users/sites
2. Создай сайт и получи API token
3. Вставь токен на странице `/setup` в браузере

> Токен хранится только в localStorage твоего браузера!

### 3. Запуск локально

```bash
npm run dev
```

Открой http://localhost:5173

### 4. Сборка

```bash
npm run build
```

Папка `dist/` будет готова к деплою.

---

## ☁️ Деплой на Cloudflare Pages (БЕСПЛАТНО)

**Сервер НЕ нужен!** Vireon — это 100% статический SPA.

### Вариант A — через UI (проще):

1. Зайди на https://dash.cloudflare.com
2. Pages → Create a project → Upload assets
3. Загрузи содержимое папки `dist/`
4. Готово! Сайт получит `.pages.dev` домен с HTTPS

### Вариант B — через Git (автодеплой):

1. Запушь проект на GitHub
2. Cloudflare Pages → Connect to Git → выбери репо
3. Build command: `npm run build`
4. Build output directory: `dist`
5. При каждом push — автодеплой!

### Переменные окружения (опционально)

Если хочешь вшить токен в сборку (а не вводить в интерфейсе):

```
VITE_KODIK_TOKEN=твой_токен_здесь
```

В Cloudflare Pages: Settings → Environment Variables → Add variable

---

## 🏗️ Структура проекта

```
vireon/
├── public/
│   ├── _redirects        ← SPA роутинг для Cloudflare
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── AnimeCard.jsx
│   │   ├── AnimeGrid.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── SearchPage.jsx
│   │   ├── AnimePage.jsx
│   │   ├── CatalogPage.jsx
│   │   └── SetupPage.jsx
│   ├── utils/
│   │   └── kodik.js      ← Весь Kodik API
│   ├── styles/
│   │   └── global.css
│   └── App.jsx
├── index.html
├── vite.config.js
└── package.json
```

## 📡 Что берём из Kodik API

| Данные | Откуда |
|--------|--------|
| Название, год, описание | `material_data` |
| Постер | `material_data.anime_poster_url` |
| Рейтинг | `material_data.shikimori_rating` |
| Жанры | `material_data.anime_genres` |
| Количество эпизодов | `episodes_count` |
| Статус (онгоинг / вышел) | `material_data.anime_status` |
| Плеер (embed) | `link` → iframe |
| Список озвучек | несколько результатов по одному shikimori_id |

## 🔑 Как работает токен

- Сохраняется в `localStorage` браузера
- Можно прописать через `VITE_KODIK_TOKEN` в env для вшивки в сборку
- Никогда не покидает браузер пользователя

---

Made with ❤️ using React + Vite + Kodik API
