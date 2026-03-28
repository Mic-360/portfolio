// NOTE: This file should only be imported from server-side code or via
// dynamic import() inside createServerFn handlers (see health.ts).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

const HEALTH_SOURCES: Record<string, string> = import.meta.glob(
  '../content/health.json',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
)

const DATA_DIR = join(process.cwd(), '.data')
const DATA_FILE = join(DATA_DIR, 'health.json')

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

const METRIC_KEYS = [
  'steps',
  'activeEnergy',
  'restingEnergy',
  'distance',
  'spO2',
  'sleep',
  'heartRate',
] as const

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

function readPersistedData(): HealthData | null {
  try {
    const raw = readFileSync(DATA_FILE, 'utf-8')
    return healthDataSchema.parse(JSON.parse(raw))
  } catch {
    return null
  }
}

function persistData(data: HealthData): void {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Failed to persist health data:', err)
  }
}

function readHealthData(): HealthData {
  try {
    if (inMemoryHealthData) {
      return inMemoryHealthData
    }

    const persisted = readPersistedData()
    if (persisted) {
      inMemoryHealthData = persisted
      return persisted
    }

    return getBundledHealthData()
  } catch (error) {
    console.error('Error reading health data:', error)
    return {}
  }
}

function writeHealthData(data: HealthData) {
  const existing = readHealthData()

  const merged: HealthData = { updatedAt: new Date().toISOString() }

  for (const key of METRIC_KEYS) {
    const incoming = data[key]
    const current = existing[key]
    // Use incoming if it has data, otherwise keep existing
    merged[key] = incoming?.length ? incoming : current
  }

  inMemoryHealthData = healthDataSchema.parse(merged)
  persistData(inMemoryHealthData)
  return inMemoryHealthData
}

export const getHealthDataInternal = readHealthData
export const writeHealthDataInternal = writeHealthData
