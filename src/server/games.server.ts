// ! NOTE: This file should only be imported from server-side code or via
// ! dynamic import() inside createServerFn handlers (see games.ts).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import type { GameMeta } from '@/lib/games';
import { gameSchema } from '@/lib/games'

const GAMES_SOURCES: Record<string, string> = import.meta.glob(
  '../content/games.json',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
)

const DATA_DIR = join(process.cwd(), '.data')
const DATA_FILE = join(DATA_DIR, 'games.json')

let inMemoryGamesData: Array<GameMeta> | null = null

const gamesDataSchema = z.array(gameSchema)

function getBundledGamesData(): Array<GameMeta> {
  const raw = Object.values(GAMES_SOURCES)[0]
  if (!raw) {
    return []
  }

  try {
    return gamesDataSchema.parse(JSON.parse(raw))
  } catch (error) {
    console.error('Error parsing bundled games data:', error)
    return []
  }
}

function readPersistedData(): Array<GameMeta> | null {
  try {
    const raw = readFileSync(DATA_FILE, 'utf-8')
    return gamesDataSchema.parse(JSON.parse(raw))
  } catch {
    return null
  }
}

function persistData(data: Array<GameMeta>): void {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Failed to persist games data:', err)
  }
}

function readGamesData(): Array<GameMeta> {
  try {
    if (inMemoryGamesData) {
      return inMemoryGamesData
    }

    const persisted = readPersistedData()
    if (persisted) {
      inMemoryGamesData = persisted
      return persisted
    }

    return getBundledGamesData()
  } catch (error) {
    console.error('Error reading games data:', error)
    return []
  }
}

function updateGamesData(newGames: Array<GameMeta>) {
  const existingRecords = readGamesData()
  let hasChanges = false

  for (const game of newGames) {
    const duplicate = existingRecords.some(
      (existing) =>
        existing.id === game.id || existing.title === game.title
    )

    if (!duplicate) {
      existingRecords.push(game)
      hasChanges = true
    }
  }

  if (hasChanges) {
    const merged = gamesDataSchema.parse(existingRecords)
    inMemoryGamesData = merged
    persistData(inMemoryGamesData)
  }

  return inMemoryGamesData || existingRecords
}

export const getGamesDataInternal = readGamesData
export const updateGamesDataInternal = updateGamesData
