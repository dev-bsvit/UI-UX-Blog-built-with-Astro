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

  const siteUrl = context.site?.href || 'https://ui-ux-blog-bsvit.vercel.app/';

  return rss({
    title: 'UI/UX Блог - Дизайн та Розробка',
    description: 'Сучасні статті про UI/UX дизайн, користувацький досвід, веб-розробку та доступність. Практичні поради, тренди та інструменти для дизайнерів і розробників.',
    site: siteUrl,
    
    // Настройки фида
    items: sortedPosts.map((post: CollectionEntry<'posts'>) => {
      const postUrl = `${siteUrl}posts/${post.slug}`;
      const imageUrl = post.data.cover ? 
        (post.data.cover.startsWith('http') ? post.data.cover : `${siteUrl}${post.data.cover.replace(/^\//, '')}`) 
        : `${siteUrl}og-image.jpg`;
      
      return {
        title: post.data.title,
        description: post.data.excerpt || post.data.description || '',
        content: post.data.excerpt || post.data.description || '',
        link: postUrl,
        guid: postUrl,
        
        // Даты
        pubDate: new Date(post.data.publishedAt),
        
        // Автор
        author: `${post.data.author?.email || 'editor@uiux-blog.ua'} (${post.data.author?.name || 'UI/UX Блог'})`,
        
        // Категории (теги как категории RSS)
        categories: [
          post.data.category || 'Загальне',
          ...(post.data.tags || [])
        ],
        
        // Дополнительные метаданные
        customData: [
          `<category domain="${siteUrl}categories">${post.data.category || 'Загальне'}</category>`,
          `<readingTime>${post.data.readingTime || '5 хв читання'}</readingTime>`,
          `<enclosure url="${imageUrl}" type="image/jpeg" length="0"/>`,
          post.data.featured ? '<featured>true</featured>' : '',
          `<source url="${postUrl}">UI/UX Блог</source>`,
          `<creator>${post.data.author?.name || 'UI/UX Блог'}</creator>`,
        ].filter(Boolean).join('\n      '),
      };
    }),

    // Кастомные XML элементы для расширенных метаданных
    customData: `
    <language>uk-UA</language>
    <copyright>© ${new Date().getFullYear()} UI/UX Блог. Усі права захищені.</copyright>
    <managingEditor>editor@uiux-blog.ua (Редакція UI/UX Блогу)</managingEditor>
    <webMaster>webmaster@uiux-blog.ua (Технічна підтримка)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Astro RSS Generator</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
    <rating>(PICS-1.1 "http://www.classify.org/safesurf/" l gen true for "http://uiux-blog.ua" r (SS~~000 1))</rating>
    <image>
      <url>${siteUrl}og-image.jpg</url>
      <title>UI/UX Блог</title>
      <link>${siteUrl}</link>
      <description>Логотип UI/UX Блогу</description>
      <width>144</width>
      <height>144</height>
    </image>
    <atom:link href="${siteUrl}rss.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>
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
    <category domain="${siteUrl}categories">UI/UX Design</category>
    <category domain="${siteUrl}categories">Web Development</category>
    <category domain="${siteUrl}categories">User Experience</category>
    <category domain="${siteUrl}categories">Accessibility</category>
    `,

    // Настройки стилизации
    stylesheet: '/rss-styles.xsl',
  });
} 