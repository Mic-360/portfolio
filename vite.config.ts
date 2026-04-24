import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  build: {
    // Targets modern browsers to drop legacy core-js polyfills (PSI ~16KB savings).
    target: 'es2022',
    // Generates source maps for debugging without referencing them in HTML.
    sourcemap: 'hidden',
    cssCodeSplit: true,
    // Strip modulepreload hints for vendor chunks that are only reachable via
    // lazy imports. Without this, Vite preloads ~300 KB of JS (cal-heatmap, d3,
    // dotted-map, radix, cmdk) that won't run until the user scrolls or opens
    // the command menu.
    modulePreload: {
      polyfill: false,
      resolveDependencies: (_url, deps) => {
        const LAZY = [
          'vendor-cal-heatmap',
          'vendor-d3',
          'vendor-dotted-map',
          'vendor-radix',
          'vendor-cmdk',
          'vendor-jsdos',
          'vendor-shiki',
          'CommandMenu',
          'GitHubHeatmap',
          'GamesCinematic',
          'animated-testimonials',
          'world-map',
          'DoomEasterEgg',
        ]
        return deps.filter((d) => !LAZY.some((lib) => d.includes(lib)))
      },
    },
    rollupOptions: {
      output: {
        // Prevent Rollup from hoisting transitive imports, which was pulling
        // lazy-only vendor chunks (cal-heatmap, d3) into the main entry's
        // static graph via the shared __vitePreload helper.
        hoistTransitiveImports: false,
        manualChunks(id) {
          // Must check virtual preload helper BEFORE the node_modules gate —
          // the id is "\0vite/preload-helper.js" which does not contain
          // "node_modules". Letting it fall through caused it to be merged
          // into vendor-cal-heatmap, dragging that chunk into the main entry.
          if (id.includes('vite/preload-helper') || id.includes('vite/modulepreload-polyfill'))
            return 'vendor-vite'
          if (!id.includes('node_modules')) return
          if (id.includes('motion')) return 'vendor-motion'
          if (id.includes('@tabler/icons-react') || id.includes('lucide-react'))
            return 'vendor-icons'
          if (id.includes('@tanstack/react-query')) return 'vendor-query'
          if (id.includes('@tanstack/react-router')) return 'vendor-router'
          if (id.includes('@radix-ui') || id.includes('radix-ui'))
            return 'vendor-radix'
          if (id.includes('cmdk')) return 'vendor-cmdk'
          if (id.includes('/d3') || id.includes('\\d3')) return 'vendor-d3'
          if (id.includes('cal-heatmap')) return 'vendor-cal-heatmap'
          if (id.includes('dotted-map')) return 'vendor-dotted-map'
          if (id.includes('shiki')) return 'vendor-shiki'
          if (id.includes('js-dos')) return 'vendor-jsdos'
          return undefined
        },
      },
    },
  },
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'use-sync-external-store/shim/with-selector':
        'use-sync-external-store/shim/with-selector.js',
    },
  },
  plugins: [
    devtools(),
    nitro({
      compressPublicAssets: true,
      prerender: {
        concurrency: 1, // Avoid hitting rate limits during build
      },
      routeRules: {
        '/assets/**': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/**/*.woff2': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/**/*.mp4': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/**/*.mp3': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/**/*.png': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/**/*.jpg': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/**/*.jpeg': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/**/*.webp': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/**/*.avif': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/**/*.svg': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/**/*.ico': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/robots.txt': {
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          swr: false,
          cache: false,
        },
      },
    }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
})

export default config
