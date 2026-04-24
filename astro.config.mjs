import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'hybrid',
  integrations: [tailwind()],
  adapter: cloudflare(),
  image: {
    service: { entrypoint: 'astro/assets/services/noop', config: {} },
  },
});
