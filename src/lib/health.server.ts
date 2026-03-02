// NOTE: This file should only be imported from server-side code or via
// dynamic import() inside createServerFn handlers (see health.ts).
import { z } from 'zod'

const HEALTH_SOURCES: Record<string, string> = import.meta.glob(
  '../content/health.json',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
)

let inMemoryHealthData: HealthData | null = null

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

function getBundledHealthData(): HealthData {
  const raw = Object.values(HEALTH_SOURCES)[0]
  if (!raw) {
    return {}
  }

  try {
    return healthDataSchema.parse(JSON.parse(raw))
  } catch (error) {
    console.error('Error parsing bundled health data:', error)
    return {}
  }
}

function readHealthData(): HealthData {
  try {
    if (inMemoryHealthData) {
      return inMemoryHealthData
    }

    return getBundledHealthData()
  } catch (error) {
    console.error('Error reading health data:', error)
    return {}
  }
}

function writeHealthData(data: HealthData) {
  const updatedData = {
    ...data,
    updatedAt: new Date().toISOString(),
  }

  inMemoryHealthData = healthDataSchema.parse(updatedData)
  return inMemoryHealthData
}

export const getHealthDataInternal = readHealthData
export const writeHealthDataInternal = writeHealthData
