# ✨ LENSY AI — AI Фото Студия

Telegram Mini App + Bot для создания профессиональных AI фотосессий из селфи.

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Zustand, React Query |
| Backend | FastAPI, SQLAlchemy, PostgreSQL, Redis |
| AI | Replicate API (IP-Adapter, SDXL, FLUX) |
| Bot | aiogram 3 |
| Deploy | Netlify (frontend), Railway/Render (backend) |

---

## Быстрый старт

### 1. Клонирование и настройка переменных

```bash
cp .env.example .env
# Заполни .env своими ключами
```

### 2. Запуск через Docker Compose (рекомендуется)

```bash
docker-compose up -d
```

Это запустит: PostgreSQL, Redis, FastAPI backend, Telegram bot.

### 3. Запуск фронтенда

```bash
cd frontend
npm install
npm run dev
```

Фронтенд будет доступен на `http://localhost:5173`.

---

## Ручной запуск

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Bot

```bash
cd bot
pip install -r requirements.txt
python bot.py
```

---

## Настройка Telegram

### Создание бота

1. Открой [@BotFather](https://t.me/BotFather)
2. `/newbot` → задай имя и username
3. Скопируй `BOT_TOKEN` в `.env`
4. `/mybots` → выбери бота → Bot Settings → Menu Button → настрой WebApp URL

### Настройка Mini App

```
/newapp → выбери бота → укажи URL фронтенда (WEBAPP_URL)
```

### Webhook для платежей (опционально)

Настрой webhook для получения `successful_payment` событий:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-backend.com/api/payments/webhook/telegram"
```

---

## Переменные окружения

| Переменная | Описание |
|-----------|---------|
| `BOT_TOKEN` | Токен бота от BotFather |
| `WEBAPP_URL` | URL задеплоенного фронтенда |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `REPLICATE_API_TOKEN` | Токен Replicate API (replicate.com) |
| `SECRET_KEY` | Секретный ключ для JWT |
| `AWS_*` | S3 bucket для хранения фото (опционально) |

---

## Структура проекта

```
3333/
├── frontend/              # React Mini App
│   ├── src/
│   │   ├── api/           # Axios клиент + роуты
│   │   ├── components/    # UI компоненты
│   │   ├── data/          # Стили, пакеты монет, планы
│   │   ├── hooks/         # useTelegram, custom hooks
│   │   ├── pages/         # Home, Trends, Sessions, Profile
│   │   ├── store/         # Zustand store
│   │   └── types/         # TypeScript типы
│   └── package.json
│
├── backend/               # FastAPI
│   ├── app/
│   │   ├── api/routes/    # auth, users, generations, payments, admin
│   │   ├── core/          # config, database
│   │   ├── models/        # SQLAlchemy модели
│   │   └── services/      # AI генерация
│   └── requirements.txt
│
├── bot/                   # aiogram бот
│   ├── bot.py
│   └── requirements.txt
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Деплой

### Frontend → Netlify

```bash
cd frontend
npm run build
# Загрузи папку dist/ в Netlify
# Или подключи репозиторий и настрой build command: npm run build
```

### Backend → Railway

1. Создай новый проект на [railway.app](https://railway.app)
2. Подключи GitHub репозиторий
3. Выбери папку `backend/`
4. Добавь PostgreSQL и Redis сервисы
5. Заполни переменные окружения

### Bot → Railway / VPS

Запусти бот как отдельный сервис:
```bash
python bot.py
```

---

## Монетизация

| Продукт | Цена |
|---------|------|
| Бесплатная генерация | 0₽ (1 раз) |
| 40 🔥 огоньков | 100₽ |
| 140 🔥 огоньков | 300₽ |
| 260 🔥 огоньков | 500₽ |
| 600 🔥 огоньков | 1000₽ |
| Подписка BASIC | 299₽/мес |
| Подписка PRO | 499₽/мес |
| Подписка MAX | 799₽/мес |
| 1 генерация (без подписки) | 129₽ |

---

## Лицензия

MIT
