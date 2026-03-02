import { writeHealthDataInternal } from '@/lib/health.server'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/health')({
    server: {
        handlers: {
            GET: () => {
                return Response.json({
                    status: 'ok',
                    message: 'Server is healthy',
                    timestamp: new Date().toISOString(),
                })
            },
            POST: async ({ request }) => {
                try {
                    const payload = await request.json()

                    // We'll trust the schema validation in the server function or handle it here
                    // For now, let's just pass the arrays directly
                    const healthData = {
                        steps: payload.steps || [],
                        activeEnergy: payload.activeEnergy || [],
                        restingEnergy: payload.restingEnergy || [],
                        distance: payload.distance || [],
                        spO2: payload.spO2 || [],
                        sleep: payload.sleep || [],
                        heartRate: payload.heartRate || [],
                    }

                    await writeHealthDataInternal(healthData)

                    return Response.json({
                        status: 'success',
                        message: 'Health data updated',
                    })
                } catch (error) {
                    return Response.json({
                        status: 'error',
                        message: 'Failed to process health data',
                        error: error instanceof Error ? error.message : String(error),
                    }, { status: 400 })
                }
            },
        },
    },
})
