import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import type { CollectionEntry } from 'astro:content';

export async function GET(context: APIContext) {
  // Получаем все опубликованные посты
  const posts = await getCollection('posts', ({ data }: CollectionEntry<'posts'>) => {
    return !data.draft;
  });

  // Сортируем по дате (новые первыми)
  const sortedPosts = posts.sort((a: CollectionEntry<'posts'>, b: CollectionEntry<'posts'>) => 
    new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
  );

  const siteUrl = context.site?.href || 'https://localhost:4321';

  return rss({
    title: 'UI/UX Блог',
    description: 'Сучасний блог про UI/UX дизайн, інтерфейси та користувацький досвід',
    site: siteUrl,
    
    // RSS метаданные добавлены в customData ниже

    // Настройки фида
    items: sortedPosts.map((post: CollectionEntry<'posts'>) => {
      const postUrl = `${siteUrl}posts/${post.slug}`;
      
      return {
        title: post.data.title,
        description: post.data.excerpt,
        link: postUrl,
        guid: postUrl,
        
        // Даты
        pubDate: new Date(post.data.publishedAt),
        
        // Автор
        author: `${post.data.author.name}`,
        
        // Категории (теги как категории RSS)
        categories: post.data.tags,
        
        // Дополнительные метаданные
        customData: [
          `<category>${post.data.category}</category>`,
          `<readingTime>${post.data.readingTime}</readingTime>`,
          post.data.coverImage ? `<enclosure url="${siteUrl}${post.data.coverImage}" type="image/jpeg"/>` : '',
          post.data.featured ? '<featured>true</featured>' : '',
        ].filter(Boolean).join('\n'),
      };
    }),

    // Кастомные XML элементы для расширенных метаданных
            customData: `
          <language>uk-UA</language>
          <copyright>© ${new Date().getFullYear()} UI/UX Блог. Усі права захищені.</copyright>
          <managingEditor>editor@uiux-blog.ua (Команда UI/UX Блогу)</managingEditor>
          <webMaster>webmaster@uiux-blog.ua (Команда UI/UX Блогу)</webMaster>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <generator>Astro</generator>
      <docs>https://www.rssboard.org/rss-specification</docs>
      <ttl>60</ttl>
      <image>
        <url>${siteUrl}og-image.jpg</url>
        <title>UI/UX Блог</title>
        <link>${siteUrl}</link>
      </image>
      <skipHours>
        <hour>0</hour>
        <hour>1</hour>
        <hour>2</hour>
        <hour>3</hour>
        <hour>4</hour>
        <hour>5</hour>
      </skipHours>
      <skipDays>
        <day>Sunday</day>
      </skipDays>
    `,

    // Настройки стилизации
    stylesheet: '/rss-styles.xsl',
  });
} 