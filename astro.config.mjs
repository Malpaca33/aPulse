import {defineConfig} from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',
  integrations: [tailwind(), react(), mdx()],
  adapter: cloudflare(),
  image: {
    service: { entrypoint: 'astro/assets/services/noop', config: {} },
  },
  vite: {
    optimizeDeps: {
      include: ['@supabase/supabase-js'],
    },
  },
});
