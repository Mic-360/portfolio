// Re-export server functions for use in route components.
// Route files should import from this module (not gravatar.server.ts)
// to avoid the Vite import-protection warning in the client bundle.

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// ── Types ────────────────────────────────────────────────────────────

export type {
    GravatarProfile,
    VerifiedAccount,
    GalleryImage,
} from '@/types/gravatar'

// ── Server functions (RPC bridge) ────────────────────────────────────

export const getGravatarProfile = createServerFn({ method: 'GET' })
    .inputValidator(z.string().min(1))
    .handler(async ({ data: identifier }) => {
        const { fetchGravatarProfileInternal } = await import(
            './gravatar.server'
        )
        return fetchGravatarProfileInternal(identifier)
    })
