import type { APIRoute } from 'astro';
import { db, Posts, Users, eq, desc } from 'astro:db';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    
    const offset = (page - 1) * limit;

    // Базовый запрос
    let query = db
      .select({
        id: Posts.id,
        title: Posts.title,
        excerpt: Posts.excerpt,
        slug: Posts.slug,
        authorId: Posts.authorId,
        createdAt: Posts.createdAt,
        tags: Posts.tags,
        coverImage: Posts.coverImage,
        readingTime: Posts.readingTime,
        viewsCount: Posts.viewsCount,
        likesCount: Posts.likesCount,
        authorName: Users.name,
        authorAvatar: Users.avatar
      })
      .from(Posts)
      .leftJoin(Users, eq(Posts.authorId, Users.id))
      .where(eq(Posts.published, true))
      .orderBy(desc(Posts.createdAt))
      .limit(limit)
      .offset(offset);

    const posts = await query;

    // Фильтруем по тегу если указан
    let filteredPosts = posts;
    if (tag) {
      filteredPosts = posts.filter(post => {
        const postTags = JSON.parse(post.tags || '[]');
        return postTags.includes(tag);
      });
    }

    // Фильтруем по автору если указан
    if (author) {
      filteredPosts = filteredPosts.filter(post => post.authorId === author);
    }

    return new Response(JSON.stringify({
      posts: filteredPosts,
      pagination: {
        page,
        limit,
        total: filteredPosts.length,
        hasNext: filteredPosts.length === limit
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 