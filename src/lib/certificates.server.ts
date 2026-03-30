// NOTE: This file should only be imported from server-side code or via
// dynamic import() inside createServerFn handlers (see certificates.ts).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { certificateSchema, type CertificateMeta } from './certificates'

const CERTIFICATE_SOURCES: Record<string, string> = import.meta.glob(
  '../content/certificate.json',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
)

const DATA_DIR = join(process.cwd(), '.data')
const DATA_FILE = join(DATA_DIR, 'certificate.json')

let inMemoryCertificatesData: CertificateMeta[] | null = null

const certificatesDataSchema = z.array(certificateSchema)

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function processCertificates(raw: any[]): CertificateMeta[] {
  return raw.map((cert) => ({
    ...cert,
    slug: slugify(cert.title),
  }))
}

function getBundledCertificatesData(): CertificateMeta[] {
  const raw = Object.values(CERTIFICATE_SOURCES)[0]
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    const processed = processCertificates(parsed)
    return certificatesDataSchema.parse(processed)
  } catch (error) {
    console.error('Error parsing bundled certificate data:', error)
    return []
  }
}

function readPersistedData(): CertificateMeta[] | null {
  try {
    const raw = readFileSync(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    const processed = processCertificates(parsed)
    return certificatesDataSchema.parse(processed)
  } catch {
    return null
  }
}

function persistData(data: CertificateMeta[]): void {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Failed to persist certificate data:', err)
  }
}

function readCertificateIndex(): CertificateMeta[] {
  try {
    if (inMemoryCertificatesData) {
      return inMemoryCertificatesData
    }

    const persisted = readPersistedData()
    if (persisted) {
      inMemoryCertificatesData = persisted
      return persisted
    }

    return getBundledCertificatesData()
  } catch (error) {
    console.error('Error reading certificate data:', error)
    return []
  }
}

function readCertificateBySlug(slug: string): CertificateMeta | null {
  const certs = readCertificateIndex()
  return certs.find((c) => c.slug === slug) ?? null
}

function updateCertificatesData(newCerts: CertificateMeta[]) {
  const existingRecords = readCertificateIndex()
  let hasChanges = false

  for (const cert of newCerts) {
    // Matching logic for duplicates: title OR credential_id OR verify_url
    const duplicate = existingRecords.some((existing) => 
      (existing.title === cert.title) || 
      (cert.credential_id && existing.credential_id === cert.credential_id) || 
      (existing.verify_url === cert.verify_url)
    )

    if (!duplicate) {
      existingRecords.push({
        ...cert,
        slug: slugify(cert.title)
      })
      hasChanges = true
    }
  }

  if (hasChanges) {
    const merged = certificatesDataSchema.parse(existingRecords)
    inMemoryCertificatesData = merged
    persistData(inMemoryCertificatesData)
  }

  return inMemoryCertificatesData || existingRecords
}

export const getCertificateIndexInternal = readCertificateIndex
export const getCertificateBySlugInternal = readCertificateBySlug
export const updateCertificatesDataInternal = updateCertificatesData
