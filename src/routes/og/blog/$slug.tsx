import { createFileRoute } from '@tanstack/react-router'
import { getBlogPostBySlug } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { createOgImageResponse } from '@/lib/og'

function withCrawlerHeaders(response: Response) {
  const headers = new Headers(response.headers)
  headers.set('X-Robots-Tag', 'noindex, nofollow, noimageindex')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export const Route = createFileRoute('/og/blog/$slug')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const post = await getBlogPostBySlug({ data: { slug: params.slug } })

        if (!post) {
          return new Response('Not found', { status: 404 })
        }

        const imageUrl = post.image
          ? post.image.startsWith('http')
            ? post.image
            : `${process.env.PUBLIC_SITE_URL || 'http://localhost:3000'}${post.image}`
          : undefined

        return withCrawlerHeaders(
          await createOgImageResponse({
            title: post.title,
            description: post.summary,
            label: 'Blog',
            date: formatDate(post.date),
            image: imageUrl,
          }),
        )
      },
    },
  },
})
