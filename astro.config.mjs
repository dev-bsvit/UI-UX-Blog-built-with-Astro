import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx()],
  output: 'hybrid',
  adapter: vercel(),
  site: 'https://your-blog-name.vercel.app', // ЗАМЕНИТЕ на ваш реальный Vercel домен
  build: {
    assets: '_astro'
  },
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }
  }
}); 