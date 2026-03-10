// NOTE: This file should only be imported from server-side code or via
// dynamic import() inside createServerFn handlers (see gravatar-profile.ts).

import { gravatarConfig } from '@/config/gravatar'
import { gravatarProfileSchema } from '@/types/gravatar'
import type { GravatarProfile } from '@/types/gravatar'
import fs from 'node:fs'
import path from 'node:path'

// ── In-memory cache ──────────────────────────────────────────────────

interface CacheEntry {
  data: GravatarProfile
  expiresAt: number
}

const profileCache = new Map<string, CacheEntry>()

function getCached(key: string): GravatarProfile | null {
  const entry = profileCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    profileCache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key: string, data: GravatarProfile): void {
  profileCache.set(key, {
    data,
    expiresAt: Date.now() + gravatarConfig.cacheTtlMs,
  })
}

// ── Build-time file cache (persists across parallel SSR processes) ─────
const BUILD_CACHE_DIR = path.join(process.cwd(), '.tanstack', 'cache')

function getBuildCached(key: string): GravatarProfile | null {
  try {
    const cacheFile = path.join(BUILD_CACHE_DIR, `gravatar-${key}.json`)
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile)
      // Cache for 1 hour during build
      if (Date.now() - stats.mtimeMs < 60 * 60 * 1000) {
        return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
      }
    }
  } catch (e) {
    // Ignore cache errors
  }
  return null
}

function setBuildCache(key: string, data: GravatarProfile): void {
  try {
    if (!fs.existsSync(BUILD_CACHE_DIR)) {
      fs.mkdirSync(BUILD_CACHE_DIR, { recursive: true })
    }
    const cacheFile = path.join(BUILD_CACHE_DIR, `gravatar-${key}.json`)
    fs.writeFileSync(cacheFile, JSON.stringify(data))
  } catch (e) {
    // Ignore cache errors
  }
}

// ── Fetch ────────────────────────────────────────────────────────────

/**
 * Fetch a Gravatar profile from the v3 REST API with retries and caching.
 * @param identifier — SHA-256 hash of the email OR a profile slug.
 */
export async function fetchGravatarProfileInternal(
  identifier: string,
  retries = 2,
): Promise<GravatarProfile | null> {
  // Check build-time cache first if in build or server mode
  const buildCached = getBuildCached(identifier)
  if (buildCached) return buildCached

  // Check in-memory cache
  const cached = getCached(identifier)
  if (cached) return cached

  const url = `${gravatarConfig.apiBaseUrl}/${identifier}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'Bhaumic-Portfolio/1.0 (Contact: bhaumiksingh2000@gmail.com)',
  }

  // Attach API key if available (unlocks full profile data)
  const apiKey = process.env.GRAVATAR_API_KEY
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers })

      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After')
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 2000 * Math.pow(2, attempt)
        console.warn(`Gravatar API rate limited. Retrying in ${waitMs}ms...`)
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, waitMs))
          continue
        }
      }

      if (!res.ok) {
        if (res.status === 404) return null
        console.error(`Gravatar API error: ${res.status} ${res.statusText}`)
        return null
      }

      const json = await res.json()
      const profile = gravatarProfileSchema.parse(json)

      // Save to both caches
      setCache(identifier, profile)
      setBuildCache(identifier, profile)

      return profile
    } catch (error) {
      if (attempt < retries) {
        const waitMs = 1000 * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        continue
      }
      console.error('Error fetching Gravatar profile:', error)
      return null
    }
  }

  return null
}
