import handler from '@tanstack/react-start/server-entry'
import {
  convertHtmlToMarkdown,
  wantsMarkdown,
} from '@/server/markdown-negotiation.server'
import { handleWebBotAuthDirectory } from '@/server/web-bot-auth.server'

function appendVary(headers: Headers, value: string) {
  const existing = headers.get('Vary')
  if (!existing) {
    headers.set('Vary', value)
    return
  }

  const parts = existing.split(',').map((part) => part.trim().toLowerCase())

  if (!parts.includes(value.toLowerCase())) {
    headers.set('Vary', `${existing}, ${value}`)
  }
}

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

    if (pathname === '/.well-known/oauth-protected-resource') {
      const base = 'https://bhaumicsingh.dev'
      const metadata = {
        resource: base,
        authorization_servers: [base],
        scopes_supported: ['read', 'write'],
        bearer_methods_supported: ['header'],
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

    if (pathname === '/.well-known/mcp/server-card.json') {
      const base = 'https://bhaumicsingh.dev'
      const card = {
        serverInfo: {
          name: 'bhaumicsingh-portfolio',
          version: '1.0.0',
          description:
            'Portfolio and blog by Bhaumic Singh — full stack software engineer',
        },
        endpoint: `${base}/mcp`,
        capabilities: {
          resources: true,
          tools: true,
          prompts: false,
        },
      }
      return new Response(JSON.stringify(card), {
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

    if (pathname === '/.well-known/agent-card.json') {
      const base = 'https://bhaumicsingh.dev'
      const card = {
        name: 'bhaumicsingh-portfolio',
        version: '1.0.0',
        description:
          'Portfolio and blog by Bhaumic Singh — full stack software engineer. Provides blog posts, project case studies, certificates, health metrics, and games data.',
        supportedInterfaces: [
          {
            url: `${base}/api`,
            protocol: 'https',
          },
        ],
        capabilities: {
          streaming: false,
          pushNotifications: false,
        },
        skills: [
          {
            id: 'content-retrieval',
            name: 'Content Retrieval',
            description:
              'Retrieve blog posts, project details, certificates, and profile information',
          },
          {
            id: 'health-data',
            name: 'Health Data',
            description:
              'Access real-time health and fitness metrics including steps, heart rate, and sleep data',
          },
          {
            id: 'games-data',
            name: 'Games Data',
            description: 'Retrieve gaming library and activity data',
          },
        ],
      }
      return new Response(JSON.stringify(card), {
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

    if (pathname === '/.well-known/agent-skills/index.json') {
      const base = 'https://bhaumicsingh.dev'
      const index = {
        $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
        skills: [
          {
            name: 'content-retrieval',
            type: 'skill-md',
            description:
              'Retrieve structured portfolio content including blog posts, project case studies, certificates, and Gravatar profile data',
            url: `${base}/.well-known/agent-skills/content-retrieval/SKILL.md`,
            digest:
              'sha256:90aefd5af751eaa213403c01f7a742d9e939943edb0fcc1e5e8155e55e8b247e',
          },
          {
            name: 'health-data',
            type: 'skill-md',
            description:
              'Access real-time health and fitness metrics including steps, heart rate, sleep, SpO2, distance, and energy data',
            url: `${base}/.well-known/agent-skills/health-data/SKILL.md`,
            digest:
              'sha256:5dfaeb3185cb075c84005891fd60497bd3b4fe0b17a006d7e2229db247cfa185',
          },
          {
            name: 'games-data',
            type: 'skill-md',
            description:
              'Retrieve and update gaming library data including titles, platforms, playtime, and status',
            url: `${base}/.well-known/agent-skills/games-data/SKILL.md`,
            digest:
              'sha256:8d5165bc3da94ece806b59e1ffa664f018a1e98fe1e1493b2e6ea158cc69ff14',
          },
          {
            name: 'blog-feed',
            type: 'skill-md',
            description:
              'Subscribe to and retrieve blog posts via RSS 2.0, sitemap, or direct page access with markdown negotiation',
            url: `${base}/.well-known/agent-skills/blog-feed/SKILL.md`,
            digest:
              'sha256:dc9ab02d83f605a0ad0fdd8e65a8bd2625bc4f3eddc5138da9741c095ec4939d',
          },
          {
            name: 'markdown-negotiation',
            type: 'skill-md',
            description:
              'Request any page as clean markdown via Accept: text/markdown header with token count estimation',
            url: `${base}/.well-known/agent-skills/markdown-negotiation/SKILL.md`,
            digest:
              'sha256:5be16af456edcdc561a338c0ecb617283f85b2db6d1852bdb303e9b0fedc14a2',
          },
          {
            name: 'pinterest-download',
            type: 'skill-md',
            description:
              'Download Pinterest images via server-side proxy bypassing CORS and hotlink restrictions',
            url: `${base}/.well-known/agent-skills/pinterest-download/SKILL.md`,
            digest:
              'sha256:0ae4dbf31f38d81a5a0eb47a8e17861ce57e439cf8ec684b1b9d926129bb431c',
          },
          {
            name: 'site-context',
            type: 'skill-md',
            description:
              'Retrieve full site context optimized for LLM consumption via llms.txt and llms-full.txt',
            url: `${base}/.well-known/agent-skills/site-context/SKILL.md`,
            digest:
              'sha256:f39ac9c2ebfc551d38b20c31058926ab84a451a18b7e468cd0da3802958fbd5d',
          },
          {
            name: 'og-images',
            type: 'skill-md',
            description:
              'Generate dynamic Open Graph images for blog posts, projects, and the homepage',
            url: `${base}/.well-known/agent-skills/og-images/SKILL.md`,
            digest:
              'sha256:9a101b741ac1a4d021ad1261458a424037baa8111a8a3ce3a7fd865517d80c05',
          },
        ],
      }
      return new Response(JSON.stringify(index), {
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
    let upstreamRequest = req

    if (acceptsMarkdown && ['GET', 'HEAD'].includes(req.method)) {
      const upstreamHeaders = new Headers(req.headers)
      upstreamHeaders.set('Accept', 'text/html,application/xhtml+xml')
      upstreamRequest = new Request(req.url, {
        method: req.method,
        headers: upstreamHeaders,
      })
    }

    const response = await handler.fetch(upstreamRequest)

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
      appendVary(newHeaders, 'Accept')
      newHeaders.set('Content-Signal', 'ai-train=no, search=yes, ai-input=no')
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
