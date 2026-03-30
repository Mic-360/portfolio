// Re-export server functions and types for use in route components.
// Route files should import from this module (not certificates.server.ts)
// to avoid the Vite import-protection warning in the client bundle.

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// ── Types / Schemas ──────────────────────────────────────────────────

export const certificateSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  issuer: z.string(),
  issued: z.string(),
  expires: z.string().optional(),
  credential_id: z.string().nullable(),
  skills: z.array(z.string()),
  verify_url: z.string(),
  image_url: z.string(),
})

export type CertificateMeta = z.infer<typeof certificateSchema>

export const updateCertificatesSchema = z.array(certificateSchema.omit({ slug: true }))

// ── Server functions (RPC bridge) ────────────────────────────────────

export const getCertificateIndex = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { getCertificateIndexInternal } = await import('./certificates.server')
    return getCertificateIndexInternal()
  })

export const getCertificateBySlug = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { getCertificateBySlugInternal } = await import('./certificates.server')
    return getCertificateBySlugInternal(data.slug)
  })

export const updateCertificatesData = createServerFn({ method: 'POST' })
  .inputValidator(updateCertificatesSchema)
  .handler(async ({ data }) => {
    const { updateCertificatesDataInternal } = await import('./certificates.server')
    return updateCertificatesDataInternal(data)
  })
