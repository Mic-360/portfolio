// ! NOTE: This file should only be imported from server-side code or via
// ! dynamic import() inside createServerFn handlers (see gravatar-profile.ts).

import fs from 'node:fs'
import path from 'node:path'


import type { GravatarProfile } from '@/types/gravatar'
import { gravatarConfig } from '@/config/gravatar'
import { gravatarProfileSchema } from '@/types/gravatar'

interface CacheEntry {
  data: GravatarProfile
  expiresAt: number
}

const profileCache = new Map<string, CacheEntry>()
const requestsInFlight = new Map<string, Promise<GravatarProfile | null>>()

function getCached(key: string, allowStale = false): GravatarProfile | null {
  const entry = profileCache.get(key)
  if (!entry) return null
  if (!allowStale && Date.now() > entry.expiresAt) {
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
const BUILD_CACHE_DIR = path.join(process.cwd(), '.tanstack', 'cache')

function getBuildCached(
  key: string,
  allowStale = false,
): GravatarProfile | null {
  try {
    const cacheFile = path.join(BUILD_CACHE_DIR, `gravatar-${key}.json`)
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile)
      // Cache for 1 hour during build
      if (allowStale || Date.now() - stats.mtimeMs < 60 * 60 * 1000) {
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

  const pendingRequest = requestsInFlight.get(identifier)
  if (pendingRequest) {
    return pendingRequest
  }

  const staleCached =
    getCached(identifier, true) ?? getBuildCached(identifier, true)

  const request = fetchGravatarProfileWithRetry(
    identifier,
    retries,
    staleCached,
  )
  requestsInFlight.set(identifier, request)

  try {
    return await request
  } finally {
    requestsInFlight.delete(identifier)
  }
}

async function fetchGravatarProfileWithRetry(
  identifier: string,
  retries: number,
  staleCached: GravatarProfile | null,
): Promise<GravatarProfile | null> {
  const url = `${gravatarConfig.apiBaseUrl}/${identifier}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'Bhaumic-Portfolio/1.0 (Contact: connect@bhaumicsingh.dev)',
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
        const waitMs = retryAfter
          ? parseInt(retryAfter) * 1000
          : 2000 * Math.pow(2, attempt)
        console.warn(`Gravatar API rate limited. Retrying in ${waitMs}ms...`)
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, waitMs))
          continue
        }

        if (staleCached) {
          console.warn('Serving stale Gravatar profile after rate limiting.')
          return staleCached
        }
      }

      if (!res.ok) {
        if (res.status === 404) return null
        console.error(`Gravatar API error: ${res.status} ${res.statusText}`)
        return staleCached
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
      return staleCached
    }
  }

  return staleCached
}
