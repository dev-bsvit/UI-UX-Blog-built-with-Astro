import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx()],
  output: 'hybrid',
  adapter: vercel({
    webAnalytics: {
      enabled: true
    },
    speedInsights: {
      enabled: true
    },
    edgeMiddleware: false
  }),
  site: 'https://ui-ux-blog-bsvit.vercel.app',
  build: {
    assets: '_astro'
  }
});