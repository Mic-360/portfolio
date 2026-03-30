import { createFileRoute } from '@tanstack/react-router'
import { getCertificateBySlug } from '@/lib/certificates'
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

export const Route = createFileRoute('/og/certificates/$slug')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const certificate = await getCertificateBySlug({ data: { slug: params.slug } })

        if (!certificate) {
          return new Response('Not found', { status: 404 })
        }

        const imageUrl = certificate.image_url 
          ? (certificate.image_url.startsWith('http') ? certificate.image_url : `${process.env.PUBLIC_SITE_URL || 'http://localhost:3000'}${certificate.image_url}`)
          : undefined;

        return withCrawlerHeaders(
          await createOgImageResponse({
            title: certificate.title,
            description: `Issued by ${certificate.issuer}`,
            label: 'Certificate',
            date: certificate.issued,
            image: imageUrl,
          }),
        )
      },
    },
  },
})
