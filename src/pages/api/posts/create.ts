import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
    const slug = generateSlug(title) + '-' + Date.now();
    const readingTime = calculateReadingTime(content);
    
    // Создаем frontmatter для MDX файла
    const frontmatter = `---
title: "${title}"
description: "${excerpt || content.substring(0, 200).replace(/"/g, '\\"')}"
publishedAt: ${new Date().toISOString()}
author:
  name: "Автор блогу"
  bio: "Автор статей блогу"
  avatar: "/logo.svg"
excerpt: "${excerpt || content.substring(0, 200).replace(/"/g, '\\"')}"
tags: [${tags ? tags.map((tag: string) => `"${tag}"`).join(', ') : ''}]
category: "${category || 'Общее'}"
readingTime: "${readingTime} хв читання"
featured: false
cover: "${coverImage || '/images/posts/default.png'}"
draft: false
---

${content}`;

    // Создаем файл в src/content/posts/
    const postsDir = join(process.cwd(), 'src', 'content', 'posts');
    const filePath = join(postsDir, `${slug}.mdx`);
    
    try {
      await mkdir(postsDir, { recursive: true });
      await writeFile(filePath, frontmatter, 'utf-8');
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Статья успешно создана!',
        slug,
        filePath: `src/content/posts/${slug}.mdx`
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (fsError) {
      console.error('File system error:', fsError);
      
      // Если не можем писать в файлы (например, на Vercel), возвращаем данные для скачивания
      return new Response(JSON.stringify({
        success: true,
        message: 'Статья подготовлена для скачивания',
        slug,
        downloadContent: frontmatter,
        fileName: `${slug}.mdx`,
        instructions: [
          '1. Скопируйте контент ниже в файл',
          '2. Сохраните файл как ' + slug + '.mdx',
          '3. Поместите файл в папку src/content/posts/',
          '4. Статья появится на сайте после деплоя'
        ]
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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