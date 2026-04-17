import { createFileRoute } from '@tanstack/react-router'
import {
  aggregateByDay,
  calculateStats,
  getHealthData,
  updateHealthData,
} from '@/lib/health'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const rawData = await getHealthData()

          const parsedData = {
            steps: {
              stats: calculateStats(rawData.steps),
              dailyAggregates: aggregateByDay(rawData.steps, 'sum'),
              raw: rawData.steps,
            },
            activeEnergy: {
              stats: calculateStats(rawData.activeEnergy),
              dailyAggregates: aggregateByDay(rawData.activeEnergy, 'sum'),
              raw: rawData.activeEnergy,
            },
            restingEnergy: {
              stats: calculateStats(rawData.restingEnergy),
              dailyAggregates: aggregateByDay(rawData.restingEnergy, 'avg'),
              raw: rawData.restingEnergy,
            },
            distance: {
              stats: calculateStats(rawData.distance),
              dailyAggregates: aggregateByDay(rawData.distance, 'sum'),
              raw: rawData.distance,
            },
            spO2: {
              stats: calculateStats(rawData.spO2),
              dailyAggregates: aggregateByDay(rawData.spO2, 'avg'),
              raw: rawData.spO2,
            },
            heartRate: {
              stats: calculateStats(rawData.heartRate),
              dailyAggregates: aggregateByDay(rawData.heartRate, 'avg'),
              raw: rawData.heartRate,
            },
            sleep: {
              count: rawData.sleep?.length || 0,
              raw: rawData.sleep,
            },
            updatedAt: rawData.updatedAt,
          }

          return Response.json({
            status: 'ok',
            data: parsedData,
            timestamp: new Date().toISOString(),
          })
        } catch (error) {
          return Response.json(
            {
              status: 'error',
              message: 'Failed to fetch health data',
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
          const healthData = {
            steps: payload.steps || [],
            activeEnergy: payload.activeEnergy || [],
            restingEnergy: payload.restingEnergy || [],
            distance: payload.distance || [],
            spO2: payload.spO2 || [],
            sleep: payload.sleep || [],
            heartRate: payload.heartRate || [],
          }

          await updateHealthData({ data: healthData })

          return Response.json({
            status: 'success',
            message: 'Health data updated',
          })
        } catch (error) {
          return Response.json(
            {
              status: 'error',
              message: 'Failed to process health data',
              error: error instanceof Error ? error.message : String(error),
            },
            { status: 400 },
          )
        }
      },
    },
  },
})
