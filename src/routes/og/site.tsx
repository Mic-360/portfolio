import { createFileRoute } from '@tanstack/react-router'
import { siteInfo, siteMeta } from '@/config/site-data'
import { createOgImageResponse } from '@/lib/og'

function withCrawlerHeaders(response: Response) {
  const headers = new Headers(response.headers)
  headers.set('X-Robots-Tag', 'noindex, nofollow, noimageindex')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export const Route = createFileRoute('/og/site')({
  server: {
    handlers: {
      GET: async () =>
        withCrawlerHeaders(
          await createOgImageResponse({
            title: siteInfo.name,
            description: siteMeta.defaultDescription,
            label: 'Portfolio',
          }),
        ),
    },
  },
})
