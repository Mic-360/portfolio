import { createServerFn } from '@tanstack/react-start'
import fs from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'

const HEALTH_FILE = path.join(process.cwd(), 'src', 'content', 'health.json')

export const healthDataSchema = z.object({
    steps: z.number().optional(),
    activeEnergy: z.number().optional(),
    restingEnergy: z.number().optional(),
    distance: z.number().optional(),
    spO2: z.number().optional(),
    sleep: z.number().optional(),
    heartRate: z.number().optional(),
    updatedAt: z.string().optional(),
})

export type HealthData = z.infer<typeof healthDataSchema>

async function readHealthData(): Promise<HealthData> {
    try {
        const raw = await fs.readFile(HEALTH_FILE, 'utf-8')
        return healthDataSchema.parse(JSON.parse(raw))
    } catch {
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

export const getHealthData = createServerFn({ method: 'GET' }).handler(
    async () => readHealthData(),
)

export const updateHealthData = createServerFn({ method: 'POST' })
    .inputValidator(healthDataSchema)
    .handler(async ({ data }) => {
        return writeHealthData(data)
    })

export const getHealthDataInternal = readHealthData
export const writeHealthDataInternal = writeHealthData
