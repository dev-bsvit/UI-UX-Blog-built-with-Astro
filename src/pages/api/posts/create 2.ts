import type { APIRoute } from 'astro';
import { db, Posts, Users, eq } from 'astro:db';

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff\s-]/g, '') // Поддержка кириллицы
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 50);
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, content, excerpt, tags, coverImage, category } = body;

    // Валидация
    if (!title || !content) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Title and content are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Создаем slug из заголовка
    let slug = generateSlug(title);
    
    // Проверяем уникальность slug
    const existingPost = await db.select().from(Posts).where(eq(Posts.slug, slug)).limit(1);
    if (existingPost.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    // Создаем новый пост
    const postId = generateId();
    const readingTime = calculateReadingTime(content);
    
    await db.insert(Posts).values({
      id: postId,
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      coverImage: coverImage || null,
      authorId: 'system-user', // Временно используем системного пользователя
      published: true,
      featured: false,
      tags: JSON.stringify(tags || []),
      category: category || 'Общее',
      readingTime,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      bookmarksCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date()
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Статья успешно создана!',
      slug,
      id: postId
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating post:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 