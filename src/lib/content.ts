// Re-export server functions and types for use in route components.
// Route files should import from this module (not content.server.ts)
// to avoid the Vite import-protection warning in the client bundle.

import { createServerFn } from '@tanstack/react-start'
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

// ── Server functions (RPC bridge) ────────────────────────────────────
// Each function lazily imports from content.server.ts inside the handler,
// keeping the .server module out of the client bundle entirely.

export const getBlogIndex = createServerFn({ method: 'GET' }).handler(
    async () => {
        const { getBlogIndexInternal } = await import('./content.server')
        return getBlogIndexInternal()
    },
)

export const getBlogPostBySlug = createServerFn({ method: 'GET' })
    .inputValidator(z.object({ slug: z.string() }))
    .handler(async ({ data }) => {
        const { getBlogPostBySlugInternal } = await import('./content.server')
        return getBlogPostBySlugInternal(data.slug)
    })

export const getProjectIndex = createServerFn({ method: 'GET' }).handler(
    async () => {
        const { getProjectIndexInternal } = await import('./content.server')
        return getProjectIndexInternal()
    },
)

export const getProjectBySlug = createServerFn({ method: 'GET' })
    .inputValidator(z.object({ slug: z.string() }))
    .handler(async ({ data }) => {
        const { getProjectBySlugInternal } = await import('./content.server')
        return getProjectBySlugInternal(data.slug)
    })

export const getResume = createServerFn({ method: 'GET' }).handler(async () => {
    const { getResumeInternal } = await import('./content.server')
    return getResumeInternal()
})
