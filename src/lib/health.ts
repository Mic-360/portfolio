// Re-export server functions and types for use in route components.
// Route files should import from this module (not health.server.ts)
// to avoid the Vite import-protection warning in the client bundle.

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// ── Types / Schemas ──────────────────────────────────────────────────

export const healthSampleSchema = z.object({
  value: z.union([z.number(), z.string()]),
  startDate: z.string(),
  endDate: z.string(),
})

export type HealthSample = z.infer<typeof healthSampleSchema>

export const healthDataSchema = z.object({
  steps: z.array(healthSampleSchema).optional(),
  activeEnergy: z.array(healthSampleSchema).optional(),
  restingEnergy: z.array(healthSampleSchema).optional(),
  distance: z.array(healthSampleSchema).optional(),
  spO2: z.array(healthSampleSchema).optional(),
  sleep: z.array(healthSampleSchema).optional(),
  heartRate: z.array(healthSampleSchema).optional(),
  updatedAt: z.string().optional(),
})

export type HealthData = z.infer<typeof healthDataSchema>

// ── Server functions (RPC bridge) ────────────────────────────────────

export const getHealthData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getHealthDataInternal } = await import('./health.server')
    return getHealthDataInternal()
  },
)

export const updateHealthData = createServerFn({ method: 'POST' })
  .inputValidator(healthDataSchema)
  .handler(async ({ data }) => {
    const { writeHealthDataInternal } = await import('./health.server')
    return writeHealthDataInternal(data)
  })

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Aggregates granular health samples by day for cleaner visualization.
 */
export function aggregateByDay(
  samples: Array<HealthSample> = [],
  type: 'sum' | 'avg' = 'sum',
): Array<HealthSample & { value: number }> {
  if (!samples.length) return []

  const byDay: Record<string, { total: number; count: number }> = {}

  samples.forEach((s) => {
    const day = s.startDate.split('T')[0]
    const val = Number(s.value)
    if (isNaN(val)) return

    if (!byDay[day]) {
      byDay[day] = { total: 0, count: 0 }
    }
    byDay[day].total += val
    byDay[day].count++
  })

  return Object.entries(byDay)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, { total, count }]) => ({
      startDate: date,
      endDate: date,
      value: type === 'sum' ? total : total / count,
    }))
}
