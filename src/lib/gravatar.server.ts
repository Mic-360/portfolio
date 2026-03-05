// NOTE: This file should only be imported from server-side code or via
// dynamic import() inside createServerFn handlers (see gravatar-profile.ts).

import { gravatarConfig } from '@/config/gravatar'
import { gravatarProfileSchema } from '@/types/gravatar'
import type { GravatarProfile } from '@/types/gravatar'

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

// ── Fetch ────────────────────────────────────────────────────────────

/**
 * Fetch a Gravatar profile from the v3 REST API.
 * @param identifier — SHA-256 hash of the email OR a profile slug.
 */
export async function fetchGravatarProfileInternal(
    identifier: string,
): Promise<GravatarProfile | null> {
    // Check cache first
    const cached = getCached(identifier)
    if (cached) return cached

    const url = `${gravatarConfig.apiBaseUrl}/${identifier}`

    const headers: Record<string, string> = {
        Accept: 'application/json',
    }

    // Attach API key if available (unlocks full profile data)
    const apiKey = process.env.GRAVATAR_API_KEY
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
    }

    try {
        const res = await fetch(url, { headers })

        if (!res.ok) {
            if (res.status === 404) return null
            console.error(
                `Gravatar API error: ${res.status} ${res.statusText}`,
            )
            return null
        }

        const json = await res.json()
        const profile = gravatarProfileSchema.parse(json)

        setCache(identifier, profile)
        return profile
    } catch (error) {
        console.error('Error fetching Gravatar profile:', error)
        return null
    }
}
