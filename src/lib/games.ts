// ! Re-export server functions and types for use in route components.
// ! Route files should import from this module (not games.server.ts)
// ! to avoid the Vite import-protection warning in the client bundle.

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getGamesDataInternal, updateGamesDataInternal } from './games.server'

export const gameSchema = z.object({
  id: z.string(),
  title: z.string(),
  series: z.string(),
  posterUrl: z.string(),
  videoUrl: z.string().optional(),
})

export type GameMeta = z.infer<typeof gameSchema>

export const updateGamesSchema = z.array(gameSchema)

export const getGamesData = createServerFn({ method: 'GET' }).handler(
  () => {
    return getGamesDataInternal()
  },
)

export const updateGamesData = createServerFn({ method: 'POST' })
  .inputValidator(updateGamesSchema)
  .handler(({ data }) => {
    return updateGamesDataInternal(data)
  })
