import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Конфигурация
const CONFIG = {
  webhookSecret: process.env.WEBHOOK_SECRET || 'your-webhook-secret',
  contentDir: path.join(process.cwd(), 'src/content/posts'),
  maxFileSize: 1024 * 1024, // 1MB
  allowedFormats: ['mdx', 'md'],
};

/**
 * Проверка подписи webhook
 */
function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!signature || !CONFIG.webhookSecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', CONFIG.webhookSecret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${expectedSignature}`),
    Buffer.from(signature)
  );
}

/**
 * Валидация frontmatter поста
 */
function validatePostData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Обязательные поля
  const requiredFields = ['title', 'description', 'publishedAt', 'author', 'tags', 'category', 'readingTime'];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Валидация типов
  if (data.title && typeof data.title !== 'string') {
    errors.push('Title must be a string');
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array');
  }

  if (data.author && typeof data.author !== 'object') {
    errors.push('Author must be an object');
  }

  if (data.author && !data.author.name) {
    errors.push('Author name is required');
  }

  // Валидация даты
  if (data.publishedAt) {
    const date = new Date(data.publishedAt);
    if (isNaN(date.getTime())) {
      errors.push('Invalid publishedAt date format');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Генерация slug из заголовка
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Удаляем спецсимволы
    .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
    .replace(/-+/g, '-') // Убираем повторяющиеся дефисы
    .trim();
}

/**
 * Создание MDX файла
 */
async function createMDXFile(data: any): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    const { frontmatter, content, slug } = data;
    
    // Валидация данных
    const validation = validatePostData(frontmatter);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Генерация имени файла
    const filename = slug || generateSlug(frontmatter.title);
    const filepath = path.join(CONFIG.contentDir, `${filename}.mdx`);

    // Проверка существования файла
    try {
      await fs.access(filepath);
      return {
        success: false,
        error: `File already exists: ${filename}.mdx`
      };
    } catch {
      // Файл не существует, можно создавать
    }

    // Создание frontmatter
    const frontmatterYaml = [
      '---',
      `title: "${frontmatter.title}"`,
      `description: "${frontmatter.description}"`,
      `publishedAt: ${frontmatter.publishedAt}`,
      frontmatter.updatedAt ? `updatedAt: ${frontmatter.updatedAt}` : '',
      'author:',
      `  name: "${frontmatter.author.name}"`,
      frontmatter.author.bio ? `  bio: "${frontmatter.author.bio}"` : '',
      frontmatter.author.social ? '  social:' : '',
      frontmatter.author.social?.twitter ? `    twitter: "${frontmatter.author.social.twitter}"` : '',
      frontmatter.author.social?.github ? `    github: "${frontmatter.author.social.github}"` : '',
      frontmatter.author.social?.website ? `    website: "${frontmatter.author.social.website}"` : '',
      `excerpt: "${frontmatter.excerpt}"`,
      frontmatter.coverImage ? `coverImage: "${frontmatter.coverImage}"` : '',
      frontmatter.coverImageAlt ? `coverImageAlt: "${frontmatter.coverImageAlt}"` : '',
      `tags: [${frontmatter.tags.map((tag: string) => `"${tag}"`).join(', ')}]`,
      `category: "${frontmatter.category}"`,
      `readingTime: "${frontmatter.readingTime}"`,
      frontmatter.featured ? `featured: ${frontmatter.featured}` : '',
      frontmatter.draft !== undefined ? `draft: ${frontmatter.draft}` : '',
      frontmatter.seo ? 'seo:' : '',
      frontmatter.seo?.metaTitle ? `  metaTitle: "${frontmatter.seo.metaTitle}"` : '',
      frontmatter.seo?.metaDescription ? `  metaDescription: "${frontmatter.seo.metaDescription}"` : '',
      frontmatter.seo?.canonicalUrl ? `  canonicalUrl: "${frontmatter.seo.canonicalUrl}"` : '',
      frontmatter.seo?.noIndex ? `  noIndex: ${frontmatter.seo.noIndex}` : '',
      frontmatter.seo?.ogImage ? `  ogImage: "${frontmatter.seo.ogImage}"` : '',
      '---',
      ''
    ].filter(line => line !== '').join('\n');

    // Создание полного содержимого файла
    const fileContent = frontmatterYaml + '\n' + content;

    // Проверка размера файла
    if (Buffer.byteLength(fileContent, 'utf8') > CONFIG.maxFileSize) {
      return {
        success: false,
        error: 'File size exceeds maximum allowed size'
      };
    }

    // Создание директории если не существует
    await fs.mkdir(CONFIG.contentDir, { recursive: true });

    // Сохранение файла
    await fs.writeFile(filepath, fileContent, 'utf8');

    return {
      success: true,
      filename: `${filename}.mdx`
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Отправка уведомления об успешном создании
 */
async function notifySuccess(filename: string) {
  // Здесь можно добавить интеграцию со Slack, Discord, email и т.д.
  console.log(`✅ New post created: ${filename}`);
  
  // Пример отправки в Slack (если настроен)
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🎉 Новая статья опубликована: ${filename}`,
          channel: '#content',
          username: 'Blog Bot'
        })
      });
      
      if (!response.ok) {
        console.warn('Failed to send Slack notification');
      }
    } catch (error) {
      console.warn('Error sending Slack notification:', error);
    }
  }
}

/**
 * POST /api/webhook/content
 * Создание нового поста через webhook
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Проверка Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Получение данных
    const payload = await request.text();
    
    // Проверка подписи webhook (в продакшене)
    if (process.env.NODE_ENV === 'production') {
      const signature = request.headers.get('x-webhook-signature') || '';
      if (!verifyWebhookSignature(payload, signature)) {
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Парсинг JSON
    let data;
    try {
      data = JSON.parse(payload);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Проверка обязательных полей
    if (!data.frontmatter || !data.content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: frontmatter, content' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Создание файла
    const result = await createMDXFile(data);
    
    if (result.success) {
      // Уведомление об успехе
      await notifySuccess(result.filename!);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Post created successfully',
          filename: result.filename
        }),
        { 
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Webhook error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

/**
 * GET /api/webhook/content
 * Проверка состояния webhook
 */
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'Content webhook is ready',
      timestamp: new Date().toISOString(),
      config: {
        maxFileSize: CONFIG.maxFileSize,
        allowedFormats: CONFIG.allowedFormats,
        contentDir: CONFIG.contentDir
      }
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}; 