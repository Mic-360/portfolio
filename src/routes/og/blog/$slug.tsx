import { createFileRoute } from '@tanstack/react-router'
import { getBlogPostBySlugInternal } from '@/lib/content.server'
import { formatDate } from '@/lib/format'
import { createOgImageResponse } from '@/lib/og.server'

export const Route = createFileRoute('/og/blog/$slug')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const post = await getBlogPostBySlugInternal(params.slug)

        if (!post) {
          return new Response('Not found', { status: 404 })
        }

        return await createOgImageResponse({
          title: post.title,
          description: post.summary,
          label: 'Blog',
          date: formatDate(post.date),
        })
      },
    },
  },
})
