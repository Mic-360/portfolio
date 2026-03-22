import { createFileRoute } from '@tanstack/react-router'
import { fetchGravatarProfileInternal } from '@/lib/gravatar.server'

export const Route = createFileRoute('/api/gravatar/$identifier')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { identifier } = params

        try {
          const profile = await fetchGravatarProfileInternal(identifier)

          if (!profile) {
            return Response.json(
              { status: 'error', message: 'Profile not found' },
              { status: 404 },
            )
          }

          return new Response(JSON.stringify(profile), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control':
                'public, s-maxage=21600, stale-while-revalidate=3600',
            },
          })
        } catch (error) {
          return Response.json(
            {
              status: 'error',
              message: 'Failed to fetch Gravatar profile',
              error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
