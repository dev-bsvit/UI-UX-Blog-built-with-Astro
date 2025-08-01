# 🤖 Automation Guide | Руководство по автоматизации блога

## Обзор системы автоматизации

Создана полная система автоматизации для блога, включающая:

1. **GitHub Actions** — CI/CD pipeline
2. **Webhook API** — прием нового контента
3. **Google Indexing API** — автоматическая индексация
4. **n8n Workflow** — оркестрация всех процессов
5. **Content Validation** — проверка качества контента

---

## 🚀 GitHub Actions Workflow

### Файл: `.github/workflows/deploy.yml`

**Триггеры:**
- Push в ветку `main`
- Pull Request в `main`

**Этапы:**
1. **Quality Check** — проверка кода, линтинг, типы
2. **Lighthouse CI** — тестирование производительности
3. **Deploy** — деплой в продакшн (Vercel/Netlify)
4. **Google Indexing** — автоматическая индексация
5. **Cleanup** — очистка артефактов

### Необходимые секреты в GitHub:

```bash
# Vercel (если используете)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Или Netlify (альтернатива)
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id

# Google Indexing API
GOOGLE_SERVICE_ACCOUNT_KEY=base64_encoded_service_account_json

# Общие
SITE_URL=https://your-domain.com
SLACK_WEBHOOK=your_slack_webhook_url
```

---

## 🔗 Webhook API

### Endpoint: `/api/webhook/content`

**Методы:**
- `GET` — проверка статуса
- `POST` — создание нового поста

### Формат данных для POST:

```json
{
  "action": "new_post",
  "frontmatter": {
    "title": "Заголовок статьи",
    "description": "Описание для SEO",
    "publishedAt": "2024-01-20",
    "author": {
      "name": "Имя Автора",
      "bio": "Краткая биография",
      "social": {
        "twitter": "username",
        "website": "https://example.com"
      }
    },
    "excerpt": "Краткое описание статьи...",
    "tags": ["Tag1", "Tag2"],
    "category": "Design",
    "readingTime": "5 мин чтения",
    "featured": false,
    "draft": false,
    "coverImage": "/images/posts/image.jpg",
    "coverImageAlt": "Описание изображения",
    "seo": {
      "metaTitle": "SEO заголовок",
      "metaDescription": "SEO описание"
    }
  },
  "content": "# Заголовок\n\nКонтент статьи в Markdown...",
  "slug": "optional-custom-slug"
}
```

### Переменные окружения:

```bash
WEBHOOK_SECRET=your_webhook_secret_key
SLACK_WEBHOOK_URL=your_slack_webhook_url
NODE_ENV=production
```

### Тестирование webhook:

```bash
# Локальное тестирование
npm run test-webhook

# Или через curl
curl -X POST http://localhost:4321/api/webhook/content \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sha256=your_signature" \
  -d @test-data/sample-post.json
```

---

## 📊 Google Indexing API

### Файл: `scripts/google-indexing.js`

**Функции:**
- Автоматическое получение всех URL для индексации
- Пакетная отправка с защитой от rate limiting
- Подробные отчеты о результатах
- Сохранение логов в `reports/`

### Настройка Google Service Account:

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Indexing API
4. Создайте Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Скачайте JSON ключ
5. Добавьте Service Account в Google Search Console:
   - Search Console → Settings → Users and permissions
   - Add user → введите email Service Account
   - Права: Full

### Использование:

```bash
# Ручной запуск индексации
npm run google-indexing

# С проверкой статуса
CHECK_STATUS=true npm run google-indexing

# Настройка переменных окружения
export GOOGLE_SERVICE_ACCOUNT_KEY="$(base64 -i path/to/service-account.json)"
export SITE_URL="https://your-domain.com"
```

---

## 🔄 n8n Workflow

### Файл: `n8n-workflows/blog-automation.json`

**Описание workflow:**

1. **Webhook Trigger** — принимает POST запросы
2. **Content Filter** — проверяет тип действия
3. **Data Processing** — валидация и трансформация данных
4. **Blog API Call** — отправка в webhook API блога
5. **Success Check** — проверка успешности создания
6. **GitHub Dispatch** — триггер деплоя через GitHub Actions
7. **Slack Notification** — уведомление в Slack
8. **Indexing Delay** — ожидание перед индексацией
9. **Google Indexing** — автоматическая индексация в Google

### Импорт в n8n:

1. Установите n8n: `npm install -g n8n`
2. Запустите: `n8n start`
3. Откройте http://localhost:5678
4. Import workflow из `n8n-workflows/blog-automation.json`

### Настройка переменных среды в n8n:

```bash
# API endpoints
BLOG_API_URL=https://your-domain.com
GITHUB_API_URL=https://api.github.com
BLOG_URL=https://your-domain.com

# Credentials
WEBHOOK_SECRET=your_webhook_secret
GITHUB_TOKEN=your_github_token
GITHUB_REPO=username/repository
SLACK_WEBHOOK_URL=your_slack_webhook

# Google OAuth (настройте в n8n UI)
# Используйте Google OAuth2 API credential type
```

---

## ✅ Content Validation

### Файл: `scripts/validate-content.js`

**Проверки:**
- Frontmatter валидация
- Длина заголовков и описаний
- Структура заголовков (H1 → H2 → H3)
- SEO оптимизация
- Accessibility (alt-текст, ссылки)
- Качество контента (запрещенные слова, длина предложений)
- Плотность ключевых слов

### Конфигурация в `scripts/validate-content.js`:

```javascript
const CONFIG = {
  minTitleLength: 10,
  maxTitleLength: 60,
  minDescriptionLength: 50,
  maxDescriptionLength: 160,
  minContentLength: 500,
  maxTagsCount: 8,
  requiredCategories: ['Design', 'Research', 'Accessibility', 'Development'],
  bannedWords: ['click here', 'read more', 'very', 'really', 'just'],
  seoKeywords: {
    minDensity: 0.5, // %
    maxDensity: 3.0  // %
  }
};
```

### Использование:

```bash
# Валидация всех постов
npm run validate-content

# В составе CI pipeline
npm run ci
```

---

## 🔧 Lighthouse CI

### Файл: `lighthouserc.json`

**Настройки:**
- **Performance** ≥ 95
- **Accessibility** ≥ 95
- **Best Practices** ≥ 95
- **SEO** ≥ 95

**Проверяемые страницы:**
- Главная страница
- Все созданные посты
- RSS и Sitemap

### Локальный запуск:

```bash
# Установка lighthouse
npm install -g @lhci/cli

# Запуск аудита
npm run build
npm run preview # в отдельном терминале
lhci autorun

# Или через GitHub Actions (автоматически)
```

---

## 📋 Complete Automation Flow

### Полный процесс автоматизации:

1. **Создание контента** через n8n webhook или прямой API
2. **Валидация данных** в n8n workflow
3. **Создание MDX файла** через webhook API
4. **Триггер GitHub Actions** через repository dispatch
5. **CI/CD процесс:**
   - Quality checks
   - Lighthouse audit
   - Build & Deploy
6. **Google индексация** после деплоя
7. **Уведомления** в Slack

### Схема архитектуры:

```
External CMS/Tool → n8n Webhook → Blog Webhook API → GitHub Actions → Deploy → Google Indexing
                                        ↓
                                 Content Validation
                                        ↓
                                   Slack Notifications
```

---

## 🚨 Troubleshooting

### Частые проблемы:

1. **Webhook не отвечает**
   - Проверьте, что dev сервер запущен
   - Валидна ли подпись webhook'a в продакшене

2. **GitHub Actions падает**
   - Проверьте все секреты в Settings → Secrets
   - Убедитесь, что токены активны

3. **Google Indexing не работает**
   - Проверьте формат Service Account ключа (base64)
   - Убедитесь, что Service Account добавлен в Search Console

4. **n8n workflow ошибки**
   - Проверьте все переменные окружения
   - Убедитесь, что все credentials настроены

### Логи и отчеты:

```bash
# Логи валидации контента
reports/content-validation-YYYY-MM-DD.json

# Логи Google индексации
reports/indexing-report-YYYY-MM-DD.json

# Lighthouse отчеты
lighthouse-reports/
```

---

## 🎯 Следующие шаги

1. **Настройте все секреты** в GitHub и переменные в n8n
2. **Протестируйте webhook** с помощью `npm run test-webhook`
3. **Импортируйте workflow** в n8n
4. **Настройте Google Service Account** для индексации
5. **Настройте Slack уведомления** (опционально)

**Система готова к продакшену!** 🚀

---

## 📖 Дополнительные ресурсы

- [n8n Documentation](https://docs.n8n.io/)
- [Google Indexing API Guide](https://developers.google.com/search/apis/indexing-api/v3/quickstart)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci) 