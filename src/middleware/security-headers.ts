import { createMiddleware } from '@tanstack/react-start'
import { setResponseHeaders } from '@tanstack/react-start/server'

export const securityHeadersMiddleware = createMiddleware().server(
  async ({ next }) => {
    const result = await next()

    setResponseHeaders({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy':
        'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      'X-DNS-Prefetch-Control': 'on',
    })

    return result
  },
)
