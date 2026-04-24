// ! NOTE: This file should only be imported from server-side code or via
// ! dynamic import() inside createServerFn handlers.

import { pinterest } from '@/config/site-data'

export type PinterestCreatedPin = {
  id: string
  url: string
  title: string
  description?: string
  imageUrl: string
  originalImageUrl: string
  imageWidth?: number
  imageHeight?: number
}

export type PinterestCreatedPinsPayload = {
  pins: Array<PinterestCreatedPin>
  fetchedAt: string
  profileUrl: string
  createdUrl: string
  createdBoardUrl: string
}

interface CacheEntry {
  data: PinterestCreatedPinsPayload
  expiresAt: number
}

const CACHE_TTL_MS = 15 * 60 * 1000
const MAX_PINS = 24
const REQUEST_TIMEOUT_MS = 12_000
const PIN_FETCH_CONCURRENCY = 4
const PIN_FETCH_RETRIES = 2
const PIN_FETCH_RETRY_DELAY_MS = 500
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

let cache: CacheEntry | null = null
let requestInFlight: Promise<PinterestCreatedPinsPayload> | null = null

function decodeHtml(value?: string): string {
  if (!value) return ''
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function normalizeUrl(url: string): string {
  return url
    .replace(/\\/g, '')
    .replace(/[?#].*$/, '')
    .replace(/\/$/, '')
}

function deriveOriginalPinterestImageUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname !== 'i.pinimg.com') return url

    const segments = parsed.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return url
    if (segments[0] === 'originals') return parsed.toString()

    segments[0] = 'originals'
    parsed.pathname = `/${segments.join('/')}`
    return parsed.toString()
  } catch {
    return url
  }
}

function uniqueOrdered<T>(values: Array<T>): Array<T> {
  const seen = new Set<T>()
  const out: Array<T> = []
  for (const value of values) {
    if (seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

function extractPinIdFromUrl(pinUrl: string): string | null {
  const numericMatch = pinUrl.match(/\/pin\/(\d+)(?:\/)?$/)
  if (numericMatch?.[1]) return numericMatch[1]

  const slugMatch = pinUrl.match(/\/pin\/[^/]+--(\d+)(?:\/)?$/)
  if (slugMatch?.[1]) return slugMatch[1]

  return null
}

function extractPinUrls(html: string): Array<string> {
  const pinMatches = Array.from(
    html.matchAll(/https:\/\/in\.pinterest\.com\/pin\/[^"'\s<>)]+/g),
  ).map((m) => normalizeUrl(m[0]))

  const canonicalPinUrls = pinMatches
    .map((url) => extractPinIdFromUrl(url))
    .filter((id): id is string => Boolean(id))
    .map((id) => `https://in.pinterest.com/pin/${id}`)

  return uniqueOrdered(canonicalPinUrls)
}

function extractMetaContent(html: string, key: string): string | undefined {
  const metaTagRegex = new RegExp(
    `<meta[^>]*(?:property|name)=["']${key}["'][^>]*>`,
    'gi',
  )

  const tags = Array.from(html.matchAll(metaTagRegex)).map((m) => m[0])
  for (const tag of tags) {
    const contentMatch = tag.match(/content=["']([^"']+)["']/i)
    if (contentMatch?.[1]) {
      return decodeHtml(contentMatch[1])
    }
  }

  return undefined
}

function parsePinId(pinUrl: string): string {
  return extractPinIdFromUrl(pinUrl) ?? pinUrl
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function mapWithConcurrency<T, TResult>(
  items: Array<T>,
  concurrency: number,
  mapper: (item: T) => Promise<TResult>,
): Promise<Array<TResult>> {
  if (items.length === 0) return []

  const results = new Array<TResult>(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      if (index >= items.length) {
        break
      }

      results[index] = await mapper(items[index])
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length))
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}

function stripTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanText(value?: string): string | undefined {
  if (!value) return undefined
  const cleaned = decodeHtml(value).replace(/\s+/g, ' ').trim()
  return cleaned.length > 0 ? cleaned : undefined
}

function extractFirstHeading(html: string): string | undefined {
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
  if (!heading) return undefined
  return cleanText(stripTags(heading))
}

type JsonLdPinMeta = {
  title?: string
  description?: string
}

function extractJsonLdPinMeta(html: string): JsonLdPinMeta {
  const blocks = Array.from(
    html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  )

  const entries: Array<Record<string, unknown>> = []

  for (const block of blocks) {
    const raw = block[1].trim()
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item === 'object') {
            entries.push(item as Record<string, unknown>)
          }
        }
      } else if (parsed && typeof parsed === 'object') {
        entries.push(parsed as Record<string, unknown>)
      }
    } catch {
      // Ignore invalid JSON-LD blocks.
    }
  }

  if (entries.length === 0) return {}

  const best =
    entries.find((entry) => {
      const type = String(entry['@type'] ?? '').toLowerCase()
      return type.includes('socialmediaposting') || type.includes('article')
    }) ?? entries[0]

  const title = cleanText(
    String(best.headline ?? best.title ?? best.name ?? ''),
  )

  const description = cleanText(
    String(best.description ?? best.articleBody ?? ''),
  )

  return {
    title,
    description,
  }
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`Pinterest fetch failed for ${url}: ${res.status}`)
    }

    return await res.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

async function fetchPin(pinUrl: string): Promise<PinterestCreatedPin | null> {
  try {
    const html = await fetchHtml(pinUrl)
    const jsonLd = extractJsonLdPinMeta(html)

    const ogImage = extractMetaContent(html, 'og:image')
    const fallbackImage =
      html.match(
        /https:\/\/i\.pinimg\.com\/[^"'\s<>)]+?\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"'\s<>)]*)?/i,
      )?.[0] ?? ''
    const imageUrl = normalizeUrl(ogImage || fallbackImage)

    if (!imageUrl) return null

    const pageTitle = cleanText(
      decodeHtml(html.match(/<title>([^<]+)<\/title>/i)?.[1]),
    )
    const h1Title = extractFirstHeading(html)

    const title =
      jsonLd.title ||
      h1Title ||
      cleanText(extractMetaContent(html, 'og:title')) ||
      pageTitle ||
      `Pin ${parsePinId(pinUrl)}`

    const description =
      jsonLd.description ||
      cleanText(extractMetaContent(html, 'description')) ||
      cleanText(extractMetaContent(html, 'og:description'))

    const widthRaw = extractMetaContent(html, 'og:image:width')
    const heightRaw = extractMetaContent(html, 'og:image:height')
    const width = widthRaw ? Number(widthRaw) : undefined
    const height = heightRaw ? Number(heightRaw) : undefined

    return {
      id: parsePinId(pinUrl),
      url: `${pinUrl}/`,
      title,
      description,
      imageUrl,
      originalImageUrl: deriveOriginalPinterestImageUrl(imageUrl),
      imageWidth: Number.isFinite(width) ? width : undefined,
      imageHeight: Number.isFinite(height) ? height : undefined,
    }
  } catch {
    return null
  }
}

async function fetchPinWithRetry(
  pinUrl: string,
): Promise<PinterestCreatedPin | null> {
  for (let attempt = 0; attempt <= PIN_FETCH_RETRIES; attempt++) {
    const pin = await fetchPin(pinUrl)
    if (pin) return pin

    if (attempt < PIN_FETCH_RETRIES) {
      await wait(PIN_FETCH_RETRY_DELAY_MS * (attempt + 1))
    }
  }

  return null
}

async function getCreatedPinUrls(): Promise<Array<string>> {
  const sourceUrls = [pinterest.createdBoardUrl, pinterest.createdUrl]
  const allUrls: Array<string> = []

  for (const sourceUrl of sourceUrls) {
    try {
      const html = await fetchHtml(sourceUrl)
      allUrls.push(...extractPinUrls(html))
    } catch {
      // Ignore source errors and continue with fallback source.
    }
  }

  return uniqueOrdered(allUrls).slice(0, MAX_PINS)
}

export async function getPinterestCreatedPinsInternal(): Promise<PinterestCreatedPinsPayload> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.data
  }

  if (requestInFlight) {
    return requestInFlight
  }

  requestInFlight = (async () => {
    try {
      const pinUrls = await getCreatedPinUrls()
      const pinResults = await mapWithConcurrency(
        pinUrls,
        PIN_FETCH_CONCURRENCY,
        (url) => fetchPinWithRetry(url),
      )
      const pins = pinResults.filter(
        (pin): pin is PinterestCreatedPin => pin !== null,
      )

      const payload: PinterestCreatedPinsPayload = {
        pins,
        fetchedAt: new Date().toISOString(),
        profileUrl: pinterest.profileUrl,
        createdUrl: pinterest.createdUrl,
        createdBoardUrl: pinterest.createdBoardUrl,
      }

      cache = {
        data: payload,
        expiresAt: Date.now() + CACHE_TTL_MS,
      }

      return payload
    } catch {
      if (cache) return cache.data
      return {
        pins: [],
        fetchedAt: new Date().toISOString(),
        profileUrl: pinterest.profileUrl,
        createdUrl: pinterest.createdUrl,
        createdBoardUrl: pinterest.createdBoardUrl,
      }
    } finally {
      requestInFlight = null
    }
  })()

  return requestInFlight
}
