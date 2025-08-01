import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const postSlug = searchParams.get('postSlug');

    if (!postSlug) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Post slug is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // В реальной реализации здесь должен быть запрос к базе данных
    // Пока возвращаем пустой массив комментариев
    const comments = [];

    return new Response(JSON.stringify({
      success: true,
      comments,
      total: comments.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 