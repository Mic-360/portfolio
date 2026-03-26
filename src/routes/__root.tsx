import { getCalApi } from '@calcom/embed-react'
import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { AnimatePresence } from 'motion/react'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { FeedbackHandler } from '../components/FeedbackHandler'
import { useKonamiCode } from '../hooks/useKonamiCode'

import { CommandMenu } from '../components/CommandMenu'
import { FloatingNavDock } from '../components/FloatingNavDock'
import Footer from '../components/Footer'
import { gravatar, siteImages, siteInfo, siteMeta } from '../config/site-data'

import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'

import { env } from '@/env'

const DoomEasterEgg = React.lazy(() => import('../components/DoomEasterEgg'))

class DoomErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: () => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', 'en')
      // Disable native scroll restoration
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }
    }
  },

  head: () => {
    const meta = [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'theme-color',
        content: siteMeta.themeColor,
      },
      {
        name: 'robots',
        content:
          'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      {
        name: 'googlebot',
        content:
          'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      {
        name: 'bingbot',
        content: 'index, follow',
      },
      {
        property: 'og:site_name',
        content: siteMeta.siteName,
      },
      {
        property: 'og:locale',
        content: siteMeta.locale,
      },
      {
        name: 'twitter:site',
        content: siteMeta.twitterHandle,
      },
      {
        name: 'twitter:creator',
        content: siteMeta.twitterHandle,
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: siteMeta.defaultTitle,
      },
      {
        property: 'og:description',
        content: siteMeta.defaultDescription,
      },
      {
        property: 'og:url',
        content: siteMeta.baseUrl,
      },
      {
        property: 'og:image',
        content: `${siteMeta.baseUrl}${siteMeta.defaultImage}`,
      },
      {
        property: 'og:image:width',
        content: '1200',
      },
      {
        property: 'og:image:height',
        content: '630',
      },
      {
        property: 'og:image:type',
        content: 'image/png',
      },
      {
        property: 'og:image:alt',
        content: siteMeta.defaultTitle,
      },
      {
        name: 'twitter:title',
        content: siteMeta.defaultTitle,
      },
      {
        name: 'twitter:description',
        content: siteMeta.defaultDescription,
      },
      {
        name: 'twitter:image',
        content: `${siteMeta.baseUrl}${siteMeta.defaultImage}`,
      },
      {
        name: 'twitter:image:alt',
        content: siteMeta.defaultTitle,
      },
      {
        title: 'Bhaumic Singh — Full Stack Software Engineer Portfolio',
      },
      {
        name: 'description',
        content: siteMeta.defaultDescription,
      },
      {
        name: 'author',
        content: siteInfo.name,
      },
      {
        name: 'creator',
        content: siteInfo.name,
      },
      {
        name: 'publisher',
        content: siteInfo.name,
      },
      {
        name: 'keywords',
        content: siteMeta.keywords,
      },
      {
        name: 'geo.region',
        content: 'IN-UP',
      },
      {
        name: 'geo.placename',
        content: siteInfo.location,
      },
      {
        property: 'profile:first_name',
        content: 'Bhaumic',
      },
      {
        property: 'profile:last_name',
        content: 'Singh',
      },
      {
        property: 'profile:username',
        content: 'bhaumic',
      },
      {
        name: 'color-scheme',
        content: 'dark light',
      },
      {
        name: 'format-detection',
        content: 'telephone=no',
      },
    ]

    if (env.VITE_GOOGLE_SITE_VERIFICATION) {
      meta.push({
        name: 'google-site-verification',
        content: env.VITE_GOOGLE_SITE_VERIFICATION,
      })
    }

    if (env.VITE_BING_SITE_VERIFICATION) {
      meta.push({
        name: 'msvalidate.01',
        content: env.VITE_BING_SITE_VERIFICATION,
      })
    }

    if (env.VITE_YANDEX_SITE_VERIFICATION) {
      meta.push({
        name: 'yandex-verification',
        content: env.VITE_YANDEX_SITE_VERIFICATION,
      })
    }

    return {
      meta,
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteMeta.siteName,
            url: siteMeta.baseUrl,
            description: siteMeta.defaultDescription,
            inLanguage: 'en-US',
            publisher: {
              '@type': 'Person',
              name: siteInfo.name,
              url: siteMeta.baseUrl,
              image: `${siteMeta.baseUrl}${siteImages.profilePhoto}`,
              sameAs: [
                'https://github.com/Mic-360',
                'https://x.com/bhaumicsingh',
                'https://www.linkedin.com/in/bhaumic/',
                'https://www.instagram.com/bhaumic.singh/',
                gravatar.profileUrl,
                gravatar.verifiedDomain,
              ],
            },
          }),
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: siteInfo.name,
            alternateName: ['Bhaumic', 'भौमिक सिंह'],
            url: siteMeta.baseUrl,
            image: [
              `${siteMeta.baseUrl}${siteImages.profilePhoto}`,
              gravatar.avatarUrl,
            ],
            jobTitle: siteInfo.currentRole,
            worksFor: {
              '@type': 'Organization',
              name: siteInfo.currentCompany,
              url: siteInfo.currentCompanyUrl,
            },
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Prayagraj',
              addressRegion: 'Uttar Pradesh',
              addressCountry: 'IN',
            },
            alumniOf: {
              '@type': 'CollegeOrUniversity',
              name: 'ITER, SOA University',
            },
            knowsAbout: [
              'React',
              'Next.js',
              'Flutter',
              'Rust',
              'Full Stack Web Development',
              'Android Development',
              'Artificial Intelligence (AI)',
              'Cloud Computing',
              'DevOps',
              'TypeScript',
              'Go',
              'Python',
            ],
            sameAs: [
              'https://github.com/Mic-360',
              'https://x.com/bhaumicsingh',
              'https://www.linkedin.com/in/bhaumic/',
              'https://www.instagram.com/bhaumic.singh/',
              gravatar.profileUrl,
              gravatar.verifiedDomain,
            ],
          }),
        },
      ],
      links: [
        {
          rel: 'stylesheet',
          href: appCss,
        },
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '192x192',
          href: '/web-app-manifest-192x192.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '512x512',
          href: '/web-app-manifest-512x512.png',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'manifest',
          href: '/manifest.json',
        },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: 'Bhaumic Singh — RSS Feed',
          href: '/rss',
        },
        {
          rel: 'alternate',
          type: 'text/plain',
          title: 'Bhaumic Singh — LLMs full context',
          href: '/llms-full.txt',
        },
        {
          rel: 'me',
          href: gravatar.profileUrl,
        },
        {
          rel: 'me',
          href: 'https://github.com/Mic-360',
        },
        {
          rel: 'me',
          href: 'https://x.com/bhaumicsingh',
        },
        {
          rel: 'me',
          href: 'https://www.linkedin.com/in/bhaumic/',
        },
        {
          rel: 'author',
          href: '/humans.txt',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossOrigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Fira+Code:wght@400;500&display=swap',
        },
        {
          rel: 'preconnect',
          href: 'https://gravatar.com',
        },
        {
          rel: 'dns-prefetch',
          href: 'https://gravatar.com',
        },
      ],
    }
  },

  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <img
        src='/frieren/404-frieren.svg'
        alt='404'
        className='h-64 w-64'
      />
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">page not found</p>
      <Link
        to="/"
        className="mt-4 hover:bg-primary px-6 py-2 text-primary-foreground transition-colors bg-primary/20"
      >
        home
      </Link>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const [showDoom, setShowDoom] = useState(false)
  useKonamiCode(useCallback(() => setShowDoom(true), []))

  useEffect(() => {
    const initializeCal = async () => {
      try {
        const cal = await getCalApi({ namespace: 'connect' })
        cal('ui', {
          cssVarsPerTheme: {
            light: { 'cal-brand': '#7a9a65' },
            dark: { 'cal-brand': '#7a9a65' },
          },
          hideEventTypeDetails: false,
          layout: 'week_view',
        })
      } catch (error) {
        console.error('Failed to initialize Cal.com:', error)
      }
    }

    const hasIdleCallback = typeof window.requestIdleCallback === 'function'

    const timeoutId = hasIdleCallback
      ? window.requestIdleCallback(
          () => {
            void initializeCal()
          },
          { timeout: 3000 },
        )
      : window.setTimeout(() => {
          void initializeCal()
        }, 1)

    return () => {
      if (hasIdleCallback && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(timeoutId)
        return
      }

      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      !navigator.userAgent.includes('Nitro')
    ) {
      const cat = `
   |\\__/,|   (\`\\
 _.|o o  |_   ) )
-(((---(((--------`
      console.log(cat)
      console.log('Hi there! 👋 You found the easter egg!')
      console.log(
        `Looking for a developer? Let's talk: https://cal.com/${siteInfo.calLink}`,
      )
    }
  }, [])

  return (
    <html data-theme="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Google Analytics - Replace G-XXXXXXXXXX with actual tracking ID */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-GY82L37E2F"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GY82L37E2F');
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <FeedbackHandler />
        <CommandMenu />
        <main className="mx-auto w-full max-w-2xl p-4 text-sm lowercase">
          {children}
        </main>
        <Footer />
        <div className="h-20" />
        <FloatingNavDock />
        <DoomErrorBoundary onError={() => setShowDoom(false)}>
          <Suspense fallback={null}>
            <AnimatePresence>
              {showDoom && (
                <DoomEasterEgg
                  key="doom"
                  onClose={() => setShowDoom(false)}
                />
              )}
            </AnimatePresence>
          </Suspense>
        </DoomErrorBoundary>
        <Scripts />
      </body>
    </html>
  )
}
