import { createFileRoute } from '@tanstack/react-router'
import { getCertificateIndex, updateCertificatesData } from '@/lib/certificates'

export const Route = createFileRoute('/api/certificates')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const data = await getCertificateIndex()

          return Response.json({
            status: 'ok',
            data: data,
            timestamp: new Date().toISOString(),
          })
        } catch (error) {
          return Response.json(
            {
              status: 'error',
              message: 'Failed to fetch certificates data',
              error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
          )
        }
      },
      POST: async ({ request }) => {
        try {
          const payload = await request.json()
          const incomingCerts = Array.isArray(payload) ? payload : [payload]

          const updated = await updateCertificatesData({ data: incomingCerts })

          return Response.json({
            status: 'success',
            message: 'Certificates data updated',
            data: updated,
          })
        } catch (error) {
          return Response.json(
            {
              status: 'error',
              message: 'Failed to process certificates data',
              error: error instanceof Error ? error.message : String(error),
            },
            { status: 400 },
          )
        }
      },
    },
  },
})
