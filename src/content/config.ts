import { defineCollection, z } from 'astro:content';

// Схема для статей блога
const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Основная информация
    title: z.string(),
    description: z.string(),
    
    // Даты
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    
    // Автор
    author: z.object({
      name: z.string(),
      avatar: z.string().optional(),
      bio: z.string().optional(),
      social: z.object({
        twitter: z.string().optional(),
        github: z.string().optional(),
        website: z.string().optional(),
      }).optional(),
    }),
    
    // Контент и SEO
    excerpt: z.string(),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    
    // Категоризация
    tags: z.array(z.string()),
    category: z.string(),
    
    // Метаданные
    readingTime: z.string(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    
    // SEO специфичные поля
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      canonicalUrl: z.string().optional(),
      noIndex: z.boolean().default(false),
      ogImage: z.string().optional(),
    }).optional(),
    
    // Дополнительные поля
    relatedPosts: z.array(z.string()).optional(),
    tableOfContents: z.boolean().default(true),
  }),
});

// Схема для страниц
const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    
    // SEO
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      canonicalUrl: z.string().optional(),
      noIndex: z.boolean().default(false),
    }).optional(),
    
    // Layout специфичные поля
    layout: z.string().default('default'),
    showHeader: z.boolean().default(true),
    showFooter: z.boolean().default(true),
  }),
});

// Схема для авторов
const authorsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string().optional(),
    position: z.string().optional(),
    company: z.string().optional(),
    
    // Социальные сети
    social: z.object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
      website: z.string().optional(),
      email: z.string().optional(),
    }).optional(),
    
    // Метаданные
    joinedAt: z.string(),
    expertise: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
  }),
});

// Схема для категорий
const categoriesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    slug: z.string(),
    color: z.string().optional(),
    icon: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

// Экспорт коллекций
export const collections = {
  posts: postsCollection,
  pages: pagesCollection,
  authors: authorsCollection,
  categories: categoriesCollection,
}; 