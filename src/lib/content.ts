// Re-export server functions and types for use in route components.
// Route files should import from this module (not content.server.ts)
// to avoid the Vite import-protection warning in the client bundle.

import { createServerFn } from '@tanstack/react-start'
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions'
import { z } from 'zod'

// ── Types ────────────────────────────────────────────────────────────

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

export type CertificateMeta = {
  id: number
  slug: string
  title: string
  issuer: string
  issued: string
  expires?: string
  credential_id: string | null
  skills: Array<string>
  verify_url: string
  image_url: string
}

// ── Server functions (RPC bridge) ────────────────────────────────────
// Each function lazily imports from content.server.ts inside the handler,
// keeping the .server module out of the client bundle entirely.

export const getBlogIndex = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const { getBlogIndexInternal } = await import('./content.server')
    return getBlogIndexInternal()
  })

export const getBlogPostBySlug = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { getBlogPostBySlugInternal } = await import('./content.server')
    return getBlogPostBySlugInternal(data.slug)
  })

export const getProjectIndex = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const { getProjectIndexInternal } = await import('./content.server')
    return getProjectIndexInternal()
  })

export const getProjectBySlug = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { getProjectBySlugInternal } = await import('./content.server')
    return getProjectBySlugInternal(data.slug)
  })

export const getCertificateIndex = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const { getCertificateIndexInternal } = await import('./content.server')
    return getCertificateIndexInternal()
  })

export const getCertificateBySlug = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { getCertificateBySlugInternal } = await import('./content.server')
    return getCertificateBySlugInternal(data.slug)
  })

export const getResume = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const { getResumeInternal } = await import('./content.server')
    return getResumeInternal()
  })
