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

    // Путь к папке с постами
    const postsDir = join(process.cwd(), 'src', 'content', 'posts');
    
    // Создаем папку если не существует
    await mkdir(postsDir, { recursive: true });
    
    // Путь к файлу статьи
    const filePath = join(postsDir, `${slug}.mdx`);
    
    // Записываем файл
    await writeFile(filePath, content, 'utf-8');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Article created successfully',
      slug 
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