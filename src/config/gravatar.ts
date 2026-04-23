/**
 * Gravatar configuration — single source of truth for avatar and profile settings.
 */

/** Default avatar fallback styles supported by Gravatar. */
export const AVATAR_DEFAULTS = [
  'identicon',
  'retro',
  'monsterid',
  'robohash',
  'initials',
  'mp',
  'wavatar',
  '404',
] as const

export type AvatarDefault = (typeof AVATAR_DEFAULTS)[number]

/** Content-rating levels for avatar images. */
export type AvatarRating = 'g' | 'pg' | 'r' | 'x'

export interface AvatarOptions {
  /** Image width/height in pixels (1-2048). */
  size?: number
  /** Fallback image style when no avatar is set. */
  defaultImage?: AvatarDefault
  /** Maximum content rating to return. */
  rating?: AvatarRating
}

export const gravatarConfig = {
  /** Owner email used throughout the portfolio. */
  email: 'bhaumiksingh2000@gmail.com',

  /** Profile slug (used as identifier when hash isn't needed). */
  slug: 'bhaumic',

  /** Gravatar avatar CDN base. */
  avatarBaseUrl: 'https://gravatar.com/avatar',

  /** Gravatar REST API v3 base. */
  apiBaseUrl: 'https://api.gravatar.com/v3/profiles',

  /** Server-side cache TTL in milliseconds (6 hours). */
  cacheTtlMs: 6 * 60 * 60 * 1000,

  /** Default avatar options applied when none are specified. */
  defaults: {
    size: 256,
    defaultImage: 'initials' as AvatarDefault,
    rating: 'g' as AvatarRating,
  },
} as const
