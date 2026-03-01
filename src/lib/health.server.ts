// NOTE: This file should only be imported from server-side code or via
// dynamic import() inside createServerFn handlers (see health.ts).
import fs from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'

const HEALTH_FILE = path.join(process.cwd(), 'src', 'content', 'health.json')

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

async function readHealthData(): Promise<HealthData> {
    try {
        const raw = await fs.readFile(HEALTH_FILE, 'utf-8')
        return healthDataSchema.parse(JSON.parse(raw))
    } catch (error) {
        console.error('Error reading health data:', error)
        return {}
    }
}

async function writeHealthData(data: HealthData) {
    const updatedData = {
        ...data,
        updatedAt: new Date().toISOString(),
    }
    await fs.writeFile(HEALTH_FILE, JSON.stringify(updatedData, null, 2))
    return updatedData
}

export const getHealthDataInternal = readHealthData
export const writeHealthDataInternal = writeHealthData

