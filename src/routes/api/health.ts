import { createFileRoute } from '@tanstack/react-router'
import { writeHealthDataInternal } from '@/lib/health.server'

type HealthSample = {
    value: number | string
    startDate: string
    endDate: string
}

const aggregate = (samples: HealthSample[] | undefined, type: 'sum' | 'avg' | 'latest') => {
    if (!samples || !Array.isArray(samples) || samples.length === 0) return 0

    const values = samples.map(s => Number(s.value)).filter(v => !isNaN(v))
    if (values.length === 0) return 0

    if (type === 'sum') {
        return values.reduce((acc, v) => acc + v, 0)
    }
    if (type === 'avg') {
        return values.reduce((acc, v) => acc + v, 0) / values.length
    }
    if (type === 'latest') {
        return Number([...samples].sort((a, b) =>
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
        )[0].value) || 0
    }
    return 0
}

export const Route = createFileRoute('/api/health')({
    server: {
        handlers: {
            GET: async () => {
                return Response.json({
                    status: 'ok',
                    message: 'Server is healthy',
                    timestamp: new Date().toISOString(),
                })
            },
            POST: async ({ request }) => {
                try {
                    const payload = await request.json()

                    const healthData = {
                        steps: aggregate(payload.steps, 'sum'),
                        activeEnergy: aggregate(payload.activeEnergy, 'sum'),
                        restingEnergy: aggregate(payload.restingEnergy, 'sum'),
                        distance: aggregate(payload.distance, 'sum'),
                        spO2: aggregate(payload.spO2, 'avg'),
                        sleep: aggregate(payload.sleep, 'sum'),
                        heartRate: aggregate(payload.heartRate, 'avg'),
                    }

                    await writeHealthDataInternal(healthData)

                    return Response.json({
                        status: 'success',
                        message: 'Health data updated',
                        received: healthData,
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
