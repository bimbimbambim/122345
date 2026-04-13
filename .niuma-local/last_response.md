# Нюма Режим — Ответ ИИ

> Время: 13.04.2026, 16:05:49
> Раунд: 2
> Проект: 3333

---

## Содержимое

## Ситуация

На компьютере **не установлены Docker и Python**, поэтому backend локально не запустить.

**Варианты:**

### 1. Backend работает на удалённом сервере?
Если у тебя уже есть развёрнутый backend (Railway, VPS и т.д.) — просто укажи его URL, я обновлю настройки админки.

### 2. Установить Docker Desktop
Скачай с [docker.com/desktop](https://www.docker.com/products/docker-desktop/) и после установки запусти:
```bash
docker compose up -d postgres redis backend
```
Тогда backend поднимется автоматически на `localhost:8000`.

### 3. Установить Python
Скачай Python 3.11 с [python.org](https://python.org), затем запущу backend через `uvicorn`.

**Пароль для панели готов:** `lensy-admin-2024` (записан в `.env`)

---
