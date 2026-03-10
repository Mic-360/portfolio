import { createFileRoute } from '@tanstack/react-router'
import { getProjectBySlugInternal } from '@/lib/content.server'
import { formatDate } from '@/lib/format'
import { createOgImageResponse } from '@/lib/og.server'

function withCrawlerHeaders(response: Response) {
  const headers = new Headers(response.headers)
  headers.set('X-Robots-Tag', 'noindex, nofollow, noimageindex')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export const Route = createFileRoute('/og/projects/$slug')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const project = await getProjectBySlugInternal(params.slug)

        if (!project) {
          return new Response('Not found', { status: 404 })
        }

        return withCrawlerHeaders(
          await createOgImageResponse({
            title: project.title,
            description: project.summary,
            label: 'Project',
            date: formatDate(project.date),
          }),
        )
      },
    },
  },
})
