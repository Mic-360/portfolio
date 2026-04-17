import { URL, fileURLToPath } from 'node:url'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
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
