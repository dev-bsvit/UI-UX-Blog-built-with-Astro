import type { APIRoute } from 'astro';

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { postSlug, content, authorName, authorEmail, parentId } = body;

    // Валидация
    if (!postSlug || !content || !authorName) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Post slug, content and author name are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Создаем новый комментарий
    const comment = {
      id: generateId(),
      postSlug,
      content: content.trim(),
      authorName: authorName.trim(),
      authorEmail: authorEmail?.trim() || '',
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      approved: true, // Автоматически одобряем комментарии (можно изменить для модерации)
      likesCount: 0
    };

    // Возвращаем созданный комментарий
    // В реальной реализации здесь должно быть сохранение в базу данных
    // Пока возвращаем успешный ответ для интеграции с фронтендом
    return new Response(JSON.stringify({
      success: true,
      comment,
      message: 'Комментарий успешно добавлен!'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 