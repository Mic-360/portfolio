import { createFileRoute } from '@tanstack/react-router'

function sanitizeFilename(value: string): string {
  return value
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

function isAllowedPinterestImageUrl(value: string | null): value is string {
  if (!value) return false

  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' && parsed.hostname === 'i.pinimg.com'
  } catch {
    return false
  }
}

export const Route = createFileRoute('/api/pinterest/download')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url)
        const image = requestUrl.searchParams.get('image')
        const fallback = requestUrl.searchParams.get('fallback')
        const name = requestUrl.searchParams.get('name') || 'pinterest-image'

        const candidates = [image, fallback].filter(
          (value, index, array): value is string =>
            isAllowedPinterestImageUrl(value) && array.indexOf(value) === index,
        )

        if (candidates.length === 0) {
          return Response.json(
            { message: 'A valid Pinterest image URL is required.' },
            { status: 400 },
          )
        }

        const fileBaseName = sanitizeFilename(name) || 'pinterest-image'

        for (const candidate of candidates) {
          const controller = new AbortController()
          const timeout = setTimeout(() => {
            controller.abort()
          }, 7000)

          try {
            const upstream = await fetch(candidate, {
              signal: controller.signal,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
              },
            })

            if (!upstream.ok || !upstream.body) {
              continue
            }

            const contentType =
              upstream.headers.get('content-type') || 'application/octet-stream'

            if (!contentType.toLowerCase().startsWith('image/')) {
              continue
            }

            const extension =
              contentType.match(/image\/(jpeg|jpg|png|webp|gif|avif)/i)?.[1] ||
              candidate.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i)?.[1] ||
              'jpg'

            return new Response(upstream.body, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileBaseName}.${extension.toLowerCase()}"`,
                'Cache-Control': 'no-store',
              },
            })
          } catch {
            continue
          } finally {
            clearTimeout(timeout)
          }
        }

        return Response.json(
          { message: 'Could not fetch the Pinterest image.' },
          { status: 502 },
        )
      },
    },
  },
})
