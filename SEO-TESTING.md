# SEO & Accessibility Testing Guide

## Фаза 3: Проверка SEO и доступности

### 🚀 Быстрый запуск с новыми зависимостями

```bash
# Обновить зависимости (включая @astrojs/rss)
npm install

# Запустить dev сервер
npm run dev
```

### 📊 SEO Тестирование

#### ✅ Content Collections
- [ ] Посты загружаются из `/src/content/posts/`
- [ ] Данные корректно типизированы
- [ ] Frontmatter валидируется по схеме
- [ ] Slug генерируется автоматически

**Проверить:**
- Откройте http://localhost:4321/posts/modern-ui-principles
- Откройте http://localhost:4321/posts/ux-research-guide
- Откройте http://localhost:4321/posts/web-accessibility

#### ✅ RSS Feed
- [ ] RSS генерируется по адресу `/rss.xml`
- [ ] Содержит корректные мета-данные
- [ ] Включает последние посты
- [ ] Валидный XML формат

**Проверить:**
- Откройте http://localhost:4321/rss.xml
- Проверьте валидность на https://validator.w3.org/feed/

#### ✅ Robots.txt
- [ ] Доступен по адресу `/robots.txt`
- [ ] Разрешает индексацию основных страниц
- [ ] Блокирует служебные директории
- [ ] Указывает на sitemap

**Проверить:**
- Откройте http://localhost:4321/robots.txt

#### ✅ Sitemap
- [ ] Автогенерируется Astro
- [ ] Включает все публичные страницы
- [ ] Корректные lastmod даты
- [ ] Доступен по `/sitemap-index.xml`

**Проверить:**
- Откройте http://localhost:4321/sitemap-index.xml

#### ✅ JSON-LD Schema
**На главной странице:**
- [ ] WebSite schema с названием и описанием
- [ ] Organization schema с логотипом

**На страницах постов:**
- [ ] Article schema с полными метаданными
- [ ] BreadcrumbList schema для навигации
- [ ] Person schema для автора

**Проверить:**
- Откройте любую страницу поста
- В DevTools → Console выполните: `JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)`

### 🎯 Meta Tags Проверка

#### ✅ Open Graph
- [ ] og:title, og:description, og:image
- [ ] og:type (website/article)
- [ ] og:url canonical
- [ ] og:site_name и og:locale

#### ✅ Twitter Cards
- [ ] twitter:card = "summary_large_image"
- [ ] twitter:title, twitter:description
- [ ] twitter:image

#### ✅ Article Meta (для постов)
- [ ] article:published_time
- [ ] article:modified_time (если есть)
- [ ] article:author
- [ ] article:section
- [ ] article:tag (для каждого тега)

**Проверить с расширениями:**
- **Meta SEO Inspector** (Chrome)
- **Detailed SEO Extension** (Firefox)

### ♿ Accessibility Тестирование

#### ✅ Skip Links
- [ ] Нажмите Tab на любой странице
- [ ] Первые ссылки должны быть "Перейти к основному контенту"
- [ ] Skip links работают корректно

#### ✅ Keyboard Navigation
- [ ] Tab навигация проходит логично
- [ ] Все интерактивные элементы доступны с клавиатуры
- [ ] Focus индикаторы видимы
- [ ] Esc закрывает модальные окна/меню

**Тестирование:**
1. Не используйте мышь совсем
2. Навигация только Tab, Shift+Tab, Enter, Space, Esc
3. Убедитесь, что можете добраться до всех функций

#### ✅ Screen Reader Support
- [ ] Все изображения имеют alt-текст
- [ ] Заголовки образуют логическую иерархию (H1 → H2 → H3)
- [ ] Ссылки имеют описательный текст
- [ ] Формы имеют labels

**Проверить:**
- Включите VoiceOver (Mac): Cmd+F5
- Включите Narrator (Windows): Win+Ctrl+Enter

#### ✅ Color & Contrast
- [ ] Контраст текста ≥ 4.5:1
- [ ] Контраст UI элементов ≥ 3:1
- [ ] Информация не передается только цветом
- [ ] Работает в режиме высокого контраста

**Инструменты:**
- Chrome DevTools → Lighthouse → Accessibility
- WebAIM Contrast Checker
- Colour Contrast Analyser

### 🔧 Automated Testing

#### Lighthouse Audit
```bash
# Установить lighthouse-cli
npm install -g lighthouse

# Запустить аудит
lighthouse http://localhost:4321 --output=html --output-path=lighthouse-report.html

# Проверить конкретную страницу поста
lighthouse http://localhost:4321/posts/modern-ui-principles --output=html
```

**Целевые метрики:**
- Performance: ≥ 95
- Accessibility: ≥ 95  
- Best Practices: ≥ 95
- SEO: ≥ 95

#### axe DevTools
1. Установите расширение axe DevTools
2. Откройте любую страницу
3. DevTools → axe DevTools → Scan ALL of my page
4. Исправьте найденные проблемы

### 📱 Mobile & Responsive Testing

#### ✅ Mobile Optimization
- [ ] Viewport meta tag установлен
- [ ] Touch targets ≥ 44px
- [ ] Текст читается без зума
- [ ] Horizontal scroll отсутствует

**Проверить в DevTools:**
- Toggle Device Toolbar (Cmd+Shift+M)
- Тестируйте iPhone SE (375px), iPad (768px), Desktop (1200px)

### 🔍 Core Web Vitals

#### ✅ Performance Metrics
- [ ] **LCP** (Largest Contentful Paint) ≤ 2.5s
- [ ] **INP** (Interaction to Next Paint) ≤ 200ms  
- [ ] **CLS** (Cumulative Layout Shift) ≤ 0.1

**Инструменты проверки:**
- Chrome DevTools → Performance
- PageSpeed Insights
- Web Vitals Extension

### 🛠 SEO Tools Validation

#### Google Tools
- **Google Search Console** — добавьте сайт и проверьте индексацию
- **Rich Results Test** — https://search.google.com/test/rich-results
- **PageSpeed Insights** — https://pagespeed.web.dev/

#### Third-party Tools  
- **Screaming Frog** — сканирование сайта
- **Semrush** — SEO аудит
- **Ahrefs** — проверка backlinks

### 📋 Final Checklist

#### 🎯 Must-have (критично)
- [ ] Все страницы имеют уникальные title и description
- [ ] Изображения имеют alt-текст
- [ ] Сайт доступен с клавиатуры
- [ ] RSS feed работает
- [ ] Robots.txt настроен
- [ ] JSON-LD schema валиден

#### ⭐ Nice-to-have (желательно)
- [ ] Open Graph изображения оптимизированы
- [ ] Structured data расширены
- [ ] Внутренние ссылки оптимизированы
- [ ] Breadcrumbs функциональны

### 🚨 Типичные проблемы

1. **RSS не загружается** — убедитесь, что `@astrojs/rss` установлен
2. **404 на страницах постов** — проверьте, что файлы в `src/content/posts/`
3. **Skip links не работают** — проверьте id="main-content" и id="navigation"
4. **JSON-LD ошибки** — валидируйте на https://validator.schema.org/

---

**Цель:** Lighthouse scores ≥ 95 по всем метрикам + zero accessibility violations 