import handler from '@tanstack/react-start/server-entry'
import {
  convertHtmlToMarkdown,
  wantsMarkdown,
} from './lib/markdown-negotiation.server'
import { handleWebBotAuthDirectory } from './lib/web-bot-auth.server'

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

    const webBotAuthResponse = handleWebBotAuthDirectory(req)
    if (webBotAuthResponse) return webBotAuthResponse

    if (pathname === '/.well-known/api-catalog') {
      const base = 'https://bhaumicsingh.dev'
      const catalog = {
        linkset: [
          {
            anchor: `${base}/api/health`,
            'service-doc': [
              {
                href: `${base}/llms-full.txt`,
                type: 'text/plain',
              },
            ],
            status: [
              {
                href: `${base}/api/health`,
                type: 'application/json',
              },
            ],
          },
          {
            anchor: `${base}/api/games`,
            'service-doc': [
              {
                href: `${base}/llms-full.txt`,
                type: 'text/plain',
              },
            ],
          },
          {
            anchor: `${base}/api/certificates`,
            'service-doc': [
              {
                href: `${base}/llms-full.txt`,
                type: 'text/plain',
              },
            ],
          },
          {
            anchor: `${base}/api/gravatar/{identifier}`,
            'service-doc': [
              {
                href: `${base}/llms-full.txt`,
                type: 'text/plain',
              },
            ],
          },
        ],
      }
      return new Response(JSON.stringify(catalog), {
        status: 200,
        headers: {
          'Content-Type': 'application/linkset+json',
          'Cache-Control':
            'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
          'Strict-Transport-Security':
            'max-age=31536000; includeSubDomains; preload',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (pathname === '/.well-known/oauth-authorization-server') {
      const base = 'https://bhaumicsingh.dev'
      const metadata = {
        issuer: base,
        jwks_uri: `${base}/.well-known/http-message-signatures-directory`,
        response_types_supported: ['none'],
        grant_types_supported: ['api_key'],
        token_endpoint_auth_methods_supported: ['private_key_jwt'],
        service_documentation: `${base}/llms-full.txt`,
        scopes_supported: ['read', 'write'],
      }
      return new Response(JSON.stringify(metadata), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control':
            'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
          'Strict-Transport-Security':
            'max-age=31536000; includeSubDomains; preload',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
    const acceptsMarkdown = wantsMarkdown(req)

    const response = await handler.fetch(req)

    const newHeaders = new Headers(response.headers)
    newHeaders.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    )

    if (pathname === '/') {
      const linkHeaders = [
        '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
        '</llms.txt>; rel="ai-agent"; type="text/plain"; title="LLMs context"',
        '</llms-full.txt>; rel="ai-agent"; type="text/plain"; title="LLMs full context"',
        '</sitemap.xml>; rel="sitemap"; type="application/xml"',
        '</rss>; rel="alternate"; type="application/rss+xml"; title="RSS Feed"',
        '</.well-known/security.txt>; rel="security-txt"; type="text/plain"',
        '</humans.txt>; rel="author"; type="text/plain"',
      ]
      newHeaders.set('Link', linkHeaders.join(', '))
    }

    if (
      acceptsMarkdown &&
      response.status === 200 &&
      newHeaders.get('Content-Type')?.includes('text/html')
    ) {
      const html = await response.text()
      const { markdown, tokens } = convertHtmlToMarkdown(html)
      newHeaders.set('Content-Type', 'text/markdown; charset=utf-8')
      newHeaders.set('x-markdown-tokens', String(tokens))
      newHeaders.set('Vary', 'Accept')
      newHeaders.set(
        'Content-Signal',
        'ai-train=yes, search=yes, ai-input=yes',
      )
      newHeaders.set(
        'Cache-Control',
        'public, max-age=60, s-maxage=3600, stale-while-revalidate=600',
      )
      newHeaders.delete('Content-Length')
      return new Response(markdown, {
        status: 200,
        statusText: response.statusText,
        headers: newHeaders,
      })
    }

    if (
      !newHeaders.has('Cache-Control') &&
      response.status === 200 &&
      newHeaders.get('Content-Type')?.includes('text/html')
    ) {
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
