import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // INI PENYELAMATNYA: Ngarahin CSS ke folder repo yang benar
  site: 'https://iqbalrachman.github.io',
  base: '/gemini-version_pkp2-extension', 
  
  output: 'static',
  build: { format: 'directory' },
  integrations: [tailwind()]
});
