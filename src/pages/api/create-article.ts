import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { slug, content, title, description } = body;

    if (!slug || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // В продакшене Vercel не позволяет записывать файлы
    // Поэтому возвращаем данные для ручного создания
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Article data prepared successfully',
      slug,
      content,
      instructions: [
        '1. Скопируйте содержимое ниже',
        '2. Создайте файл в src/content/posts/',
        '3. Назовите файл: ' + slug + '.mdx',
        '4. Вставьте содержимое и сохраните',
        '5. Перезапустите сервер'
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating article:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create article',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 