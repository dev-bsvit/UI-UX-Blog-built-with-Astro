# 🔧 Настройка переменных окружения

## Шаг 1: Создание локального файла переменных

1. **Создайте файл `.env.local` в корне проекта** (рядом с `package.json`)
2. **Скопируйте в него следующие переменные:**

```env
# Firebase Configuration (ваши реальные данные)
VITE_FIREBASE_API_KEY=AIzaSyCPGe7HUB7xrfEH12gB-Ccgd6anRP140SA
VITE_FIREBASE_AUTH_DOMAIN=enuance-b2f45.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=enuance-b2f45
VITE_FIREBASE_STORAGE_BUCKET=enuance-b2f45.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=374493765632
VITE_FIREBASE_APP_ID=1:374493765632:web:990f4881850aaa221878e5
VITE_FIREBASE_MEASUREMENT_ID=G-NZ8LEGJRDW

# Site Configuration
SITE_URL=http://localhost:4321
NODE_ENV=development
```

## Шаг 2: Настройка для Vercel (продакшен)

### Вариант A: Через веб-интерфейс Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Найдите ваш проект
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте каждую переменную:

| Имя переменной | Значение |
|---|---|
| `VITE_FIREBASE_API_KEY` | `AIzaSyCPGe7HUB7xrfEH12gB-Ccgd6anRP140SA` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `enuance-b2f45.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `enuance-b2f45` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `enuance-b2f45.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `374493765632` |
| `VITE_FIREBASE_APP_ID` | `1:374493765632:web:990f4881850aaa221878e5` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-NZ8LEGJRDW` |

### Вариант B: Через командную строку (если установлен Vercel CLI)

```bash
# Установка Vercel CLI (если еще не установлен)
npm i -g vercel

# Добавление переменных
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add VITE_FIREBASE_MEASUREMENT_ID
```

## Шаг 3: Проверка

После настройки переменных:

1. **Локально:** Перезапустите сервер разработки
2. **На Vercel:** Сделайте новый деплой

## ⚠️ Важные замечания

- **НЕ** добавляйте `.env.local` в Git (он уже в `.gitignore`)
- **Префикс `VITE_`** обязателен для переменных, используемых в браузере
- **Переменные без префикса** доступны только на сервере
- **Перезапускайте** сервер разработки после изменения переменных

## 🔍 Как проверить, что переменные работают

Добавьте в любой компонент:

```javascript
console.log('Firebase API Key:', import.meta.env.VITE_FIREBASE_API_KEY);
```

Если видите ваш ключ в консоли - все работает правильно! 