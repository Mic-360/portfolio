import handler from '@tanstack/react-start/server-entry'

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const pathname = url.pathname.toLowerCase()

    if (pathname === '/llms-full.txt') {
      url.pathname = '/llms-full/txt'
      req = new Request(url.toString(), req)
    }

    if (pathname === '/sitemap.xml') {
      url.pathname = '/sitemap/xml'
      req = new Request(url.toString(), req)
    }

    // 1. Domain Redirects
    if (url.hostname === 'www.bhaumicsingh.dev') {
      url.hostname = 'bhaumicsingh.dev'
      return Response.redirect(url.toString(), 301)
    }

    // 2. Bot/Scanner Protection
    // Block common paths for WordPress scanners, etc. to avoid heavy SSR for 404s
    const blockPaths = [
      '/wp-admin',
      '/wp-content',
      '/wp-includes',
      '/wordpress',
      '/xmlrpc.php',
      '/phpmyadmin',
      '/phpmy-admin',
      '/administrator',
      '/admin.php',
      '/cgi-bin',
      '.php',
      '.env',
      '/.git',
    ]

    if (blockPaths.some((p) => pathname.includes(p))) {
      return new Response('Blocked', {
        status: 410,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      })
    }

    const response = await handler.fetch(req)

    // Create new headers object to avoid immutable headers error
    const newHeaders = new Headers(response.headers)
    newHeaders.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    )

    // 3. Performance/CDN Caching
    // Add default caching for HTML pages if not already set
    if (
      !newHeaders.has('Cache-Control') &&
      response.status === 200 &&
      newHeaders.get('Content-Type')?.includes('text/html')
    ) {
      // 1 minute client cache, 1 hour CDN cache, 10 min SWR
      newHeaders.set(
        'Cache-Control',
        'public, max-age=60, s-maxage=3600, stale-while-revalidate=600',
      )
    }

    if (
      response.status === 200 &&
      [
        '/robots.txt',
        '/llms.txt',
        '/humans.txt',
        '/manifest.json',
        '/site.webmanifest',
        '/favicon.ico',
      ].includes(pathname)
    ) {
      newHeaders.set(
        'Cache-Control',
        'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      )
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    })
  },
}
