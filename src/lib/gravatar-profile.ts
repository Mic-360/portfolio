// ! Re-export server functions for use in route components.
// ! Route files should import from this module (not gravatar.server.ts)
// ! to avoid the Vite import-protection warning in the client bundle.

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export type {
  GalleryImage,
  GravatarProfile,
  VerifiedAccount,
} from '@/types/gravatar'

export const getGravatarProfile = createServerFn({ method: 'GET' })
  .inputValidator(z.string().min(1))
  .handler(async ({ data: identifier }) => {
    const { fetchGravatarProfileInternal } =
      await import('@/server/gravatar.server')
    return fetchGravatarProfileInternal(identifier)
  })
