import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

    let fileCreated = false;
    let filePath = '';

    // Попытка создать файл локально (работает только в dev режиме)
    try {
      if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
        const postsDir = join(process.cwd(), 'src', 'content', 'posts');
        await mkdir(postsDir, { recursive: true });
        
        filePath = join(postsDir, `${slug}.mdx`);
        await writeFile(filePath, content, 'utf-8');
        fileCreated = true;
        
        console.log(`✅ Article created successfully: ${filePath}`);
      }
    } catch (fsError) {
      console.log('⚠️ Could not create file locally:', fsError.message);
    }

    if (fileCreated) {
      return new Response(JSON.stringify({ 
        success: true,
        fileCreated: true,
        message: 'Стаття успішно створена локально! Перезавантажте сторінку для відображення.',
        slug,
        filePath: filePath.replace(process.cwd(), '')
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // В продакшене возвращаем данные для ручного создания
      return new Response(JSON.stringify({ 
        success: true,
        fileCreated: false,
        message: 'Article data prepared successfully',
        slug,
        content,
        instructions: [
          '1. Скопіюйте контент нижче',
          '2. Створіть файл в src/content/posts/',
          '3. Назвіть файл: ' + slug + '.mdx',
          '4. Вставте контент і збережіть',
          '5. Перезапустіть сервер для відображення'
        ]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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