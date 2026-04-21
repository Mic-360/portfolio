// ! Re-export server functions and types for use in route components.
// ! Route files should import from this module (not content.server.ts)
// ! to avoid the Vite import-protection warning in the client bundle.

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  getBlogIndexInternal,
  getBlogPostBySlugInternal,
  getBlogPostsWithHtmlInternal,
  getProjectBySlugInternal,
  getProjectIndexInternal,
  getResumeInternal,
} from '@/server/content.server'

export type BlogMeta = {
  slug: string
  title: string
  date: string
  summary: string
  tags: Array<string>
  categories: Array<string>
  image?: string
}

export type BlogPost = BlogMeta & {
  html: string
}

export type ProjectMeta = {
  slug: string
  title: string
  date: string
  summary: string
  stack: Array<string>
  links: Array<{ label: string; url: string }>
  tags: Array<string>
  categories: Array<string>
  image?: string
}

export type ProjectPost = ProjectMeta & {
  html: string
}

export const getBlogIndex = createServerFn({ method: 'GET' })
  .handler(async () => {
    return getBlogIndexInternal()
  })

export const getBlogPostBySlug = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    return getBlogPostBySlugInternal(data.slug)
  })

export const getProjectIndex = createServerFn({ method: 'GET' })
  .handler(async () => {
    return getProjectIndexInternal()
  })

export const getProjectBySlug = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    return getProjectBySlugInternal(data.slug)
  })

export const getBlogPostsWithHtml = createServerFn({ method: 'GET' })
  .handler(async () => {
    return getBlogPostsWithHtmlInternal()
  })

export const getResume = createServerFn({ method: 'GET' })
  .handler(async () => {
    return getResumeInternal()
  })
