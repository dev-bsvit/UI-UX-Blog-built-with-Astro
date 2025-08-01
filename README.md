# 🎨 UI/UX Блог | Сучасний блог про дизайн

Високопродуктивний, SEO-оптимізований та адаптивний блог про UI/UX дизайн, створений з використанням **Astro + TypeScript + Tailwind CSS + MDX**.

## ✨ Ключові особливості

### 🚀 Продуктивність:
- **Lighthouse Performance** ≥ 95
- **Core Web Vitals** оптимізовані (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1)
- **JavaScript bundle** ≤ 100 KB
- **Статична генерація** з Astro
- **Lazy loading** зображень та контенту

### 🎨 Дизайн та UX:
- **Темна/світла тема** з плавними переходами
- **Адаптивний дизайн** для всіх пристроїв
- **Сучасна типографіка** (Inter + JetBrains Mono)
- **Smooth анімації** та hover ефекти
- **Accessibility-first** підхід

## 🧩 UI Компоненти

### Створені компоненти:
- **Header** - Адаптивна навігація з мобільним меню
- **ThemeSwitch** - Перемикач тем з анімацією
- **PostCard** - Картки статей з hover ефектами  
- **Tag** - Теги з множинними стилями та кольорами
- **AuthorBadge** - Автор з аватаром та ініціалами
- **Pagination** - Навігація по сторінках з accessibility
- **Footer** - Контакти, підписка, соціальні мережі

## 🔍 SEO & Accessibility

### SEO оптимізація:
- **Content Collections** - Типізовані колекції для постів та авторів
- **RSS Feed** - Автогенеруємий фід на `/rss.xml`
- **Robots.txt** - Налаштований для оптимальної індексації
- **Sitemap** - Автоматична генерація через Astro
- **JSON-LD** - Rich snippets для статей та авторів
- **Open Graph & Twitter Cards** - Повні мета-теги для соцмереж

### Accessibility:
- **Skip Links** - Швидка навігація для скрін-рідерів
- **ARIA мітки** - Коректні атрибути для всіх елементів  
- **Keyboard Navigation** - Повна доступність з клавіатури
- **Color Contrast** - WCAG AA сумісність
- **Screen Reader Support** - Оптимізація для VoiceOver/NVDA
- **Responsive Design** - Адаптивність для всіх пристроїв

## 🤖 Automation & CI/CD

### GitHub Actions:
- **Quality Check** - ESLint, Prettier, TypeScript перевірки
- **Lighthouse CI** - Автоматичне тестування продуктивності
- **Automated Deploy** - Деплой в Vercel/Netlify
- **Google Indexing** - Автоматична індексація нових сторінок

### Webhook API:
- **Content Endpoint** - `/api/webhook/content` для створення постів
- **Data Validation** - Перевірка структури та якості контенту
- **Auto-generated Slugs** - Автоматичне створення URL-friendly імен
- **Slack Notifications** - Сповіщення про новий контент

### n8n Workflow:
- **Complete Automation** - Від створення посту до індексації в Google
- **Error Handling** - Обробка помилок та сповіщення
- **Multi-step Processing** - Валідація, створення, деплой, індексація
- **Integration Ready** - Підключення до зовнішніх CMS та інструментів

### Content Validation:
- **SEO Optimization** - Перевірка meta-тегів, щільності ключових слів
- **Accessibility Checks** - Валідація alt-текстів, структури заголовків
- **Content Quality** - Аналіз читабельності та якості тексту
- **Automated Reports** - Детальні звіти в JSON форматі

## 🎨 Стек технологій

- **Astro** - Сучасний фреймворк для контент-орієнтованих сайтів
- **TypeScript** - Типізований JavaScript для надійності коду
- **Tailwind CSS** - Утилітарний CSS фреймворк для швидкої розробки UI
- **MDX** - Пишіть JSX в Markdown для інтерактивного контенту
- **pnpm** - Швидкий та ефективний менеджер пакетів

## 🚀 Запуск проекту

1.  **Клонуйте репозиторій:**
    ```bash
    git clone [ваш-репозиторій]
    cd ui-ux-blog
    ```
2.  **Встановіть залежності:**
    ```bash
    pnpm install
    # або npm install / yarn install
    ```
3.  **Запустіть режим розробки:**
    ```bash
    npm run dev
    ```
    Проект буде доступний за адресою `http://localhost:4321/`

4.  **Збірка проекту:**
    ```bash
    npm run build
    ```
    Статичні файли будуть згенеровані в папці `dist/`.

## 📝 Додавання контенту

Статті розміщуються в папці `src/content/posts/` в форматі MDX з повною типізацією:

```markdown
---
title: "Заголовок статті"
description: "Опис для SEO"
publishedAt: 2024-01-15
author:
  name: "Ім'я Автора"
  bio: "Коротка біографія"
tags: ["UI Дизайн", "UX"]
category: "Дизайн"
readingTime: "5 хв читання"
featured: true
---

# Вміст статті в MDX
```

## 🧪 Тестування

### Швидка перевірка:
```bash
npm run dev
```

### SEO & Accessibility аудит:
- Відкрийте `SEO-TESTING.md` для повного чек-листа
- Використовуйте Lighthouse для перевірки метрик
- Тестуйте з клавіатури (Tab навігація)
- Перевірте RSS: `/rss.xml`
- Валідуйте robots.txt: `/robots.txt`

### Автоматизація:
```bash
# Валідація якості контенту
npm run validate-content

# Індексація в Google
npm run google-indexing

# Тестування webhook API
npm run test-webhook

# Повний CI pipeline
npm run ci

# Деплой з індексацією
npm run deploy
```

### Налаштування автоматизації:
- Вивчіть `AUTOMATION-GUIDE.md` для детальних інструкцій
- Імпортуйте `n8n-workflows/blog-automation.json` в n8n
- Налаштуйте GitHub Secrets для автоматичного деплою
- Створіть Google Service Account для індексації

## 🗂 Файли автоматизації

### Створені файли:
- **`.github/workflows/deploy.yml`** - GitHub Actions CI/CD pipeline
- **`scripts/google-indexing.js`** - Скрипт індексації в Google
- **`scripts/validate-content.js`** - Валідація якості контенту
- **`src/pages/api/webhook/content.ts`** - API endpoint для webhook
- **`n8n-workflows/blog-automation.json`** - n8n workflow конфігурація
- **`lighthouserc.json`** - Конфігурація Lighthouse CI
- **`test-data/sample-post.json`** - Тестові дані для webhook
- **`AUTOMATION-GUIDE.md`** - Детальне керівництво з налаштування

---

**Статус**: Фаза 4 (Automation) завершена  
**Наступні етапи**: Фінальне тестування продуктивності 