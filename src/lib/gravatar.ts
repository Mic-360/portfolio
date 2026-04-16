import type { AvatarOptions } from '@/config/gravatar'
import { gravatarConfig } from '@/config/gravatar'

/** Trim whitespace and lowercase an email address per Gravatar spec. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * SHA-256 hash of a normalized email. Uses the Web Crypto API which is
 * available in all modern browsers, Node 18+, and edge runtimes.
 */
export async function hashEmail(email: string): Promise<string> {
  const normalized = normalizeEmail(email)
  const encoded = new TextEncoder().encode(normalized)
  const buffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Build a Gravatar avatar URL from a hash and optional overrides. */
export function generateAvatarUrl(
  hash: string,
  options?: AvatarOptions,
): string {
  const { size, defaultImage, rating } = {
    ...gravatarConfig.defaults,
    ...options,
  }

  const params = new URLSearchParams()
  if (size) params.set('s', String(size))
  params.set('d', defaultImage)
  params.set('r', rating)

  return `${gravatarConfig.avatarBaseUrl}/${hash}?${params.toString()}`
}
