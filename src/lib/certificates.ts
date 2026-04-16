// ! Re-export server functions and types for use in route components.
// ! Route files should import from this module (not certificates.server.ts)
// ! to avoid the Vite import-protection warning in the client bundle.

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCertificateBySlugInternal, getCertificateIndexInternal, updateCertificatesDataInternal } from './certificates.server'

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

export const updateCertificatesSchema = z.array(certificateSchema.omit({ slug: true }))

export type CertificateMeta = z.infer<typeof certificateSchema>
export type CertificateUpdateInput = z.infer<typeof updateCertificatesSchema>[number]

export const getCertificateIndex = createServerFn({ method: 'GET' })
  .handler(() => {

    return getCertificateIndexInternal()
  })

export const getCertificateBySlug = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(({ data }) => {
    return getCertificateBySlugInternal(data.slug)
  })

export const updateCertificatesData = createServerFn({ method: 'POST' })
  .inputValidator(updateCertificatesSchema)
  .handler(({ data }) => {
    return updateCertificatesDataInternal(data)
  })
