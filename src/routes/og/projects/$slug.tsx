import { createFileRoute } from '@tanstack/react-router'
import { getProjectBySlugInternal } from '@/lib/content.server'
import { formatDate } from '@/lib/format'
import { createOgImageResponse } from '@/lib/og.server'

export const Route = createFileRoute('/og/projects/$slug')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const project = await getProjectBySlugInternal(params.slug)

        if (!project) {
          return new Response('Not found', { status: 404 })
        }

        return await createOgImageResponse({
          title: project.title,
          description: project.summary,
          label: 'Project',
          date: formatDate(project.date),
        })
      },
    },
  },
})
