import { createFileRoute } from '@tanstack/react-router'
import { getGamesData, updateGamesData } from '@/lib/games'

export const Route = createFileRoute('/api/games')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const data = await getGamesData()

          return Response.json({
            status: 'ok',
            data: data,
            timestamp: new Date().toISOString(),
          })
        } catch (error) {
          return Response.json(
            {
              status: 'error',
              message: 'Failed to fetch games data',
              error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
          )
        }
      },
      POST: async ({ request }) => {
        try {
          const { requirePostApiKey } = await import(
            '@/lib/api-auth.server'
          )
          const authFailure = requirePostApiKey(request)
          if (authFailure) {
            return authFailure
          }

          const payload = await request.json()
          const incomingGames = Array.isArray(payload) ? payload : [payload]

          const updated = await updateGamesData({ data: incomingGames })

          return Response.json({
            status: 'success',
            message: 'Games data updated',
            data: updated,
          })
        } catch (error) {
          return Response.json(
            {
              status: 'error',
              message: 'Failed to process games data',
              error: error instanceof Error ? error.message : String(error),
            },
            { status: 400 },
          )
        }
      },
    },
  },
})
