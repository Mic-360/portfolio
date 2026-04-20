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
import { GoogleAnalyticsTracker } from '../components/GoogleAnalyticsTracker'
import { ThemeProvider } from '../components/ThemeProvider'
import { BacklightFilterDefs } from '../components/ui/backlight'
import { VideoBackground } from '../components/VideoBackground'
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
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Fira+Code:wght@400;500&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Fira+Code:wght@400;500&display=swap',
          media: 'print',
          'data-font-async': 'true',
        } as { rel: string; href: string; media: string },
        {
          rel: 'preconnect',
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <img src="/frieren/404-frieren.svg" alt="404" className="h-56 w-56" />
      <h1 className="font-serif text-6xl tracking-tight">404</h1>
      <p className="text-base text-muted-foreground/50">page not found</p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-all duration-300 hover:bg-primary"
      >
        Go Home
      </Link>
    </div>
  )
}

const WEBMCP_INIT_SCRIPT = `(function(){
  if (typeof navigator === 'undefined' || !navigator.modelContext || !navigator.modelContext.registerTool) return;
  if (navigator.userAgent && navigator.userAgent.indexOf('Nitro') !== -1) return;
  if (window.__webmcpRegistered) return;
  window.__webmcpRegistered = true;
  var ctx = navigator.modelContext;
  try {
    ctx.registerTool({
      name: 'get-site-context',
      title: 'Get Site Context',
      description: 'Retrieve structured information about this portfolio site including identity, expertise, blog index, project index, and certificates',
      inputSchema: { type: 'object', properties: { detail: { type: 'string', enum: ['short','full'], description: 'Level of detail: "short" for summary, "full" for comprehensive context' } } },
      annotations: { readOnlyHint: true },
      execute: async function(input){
        var endpoint = (input && input.detail === 'short') ? '/llms.txt' : '/llms-full.txt';
        var res = await fetch(endpoint);
        return { content: await res.text() };
      }
    });
    ctx.registerTool({
      name: 'search-blog',
      title: 'Search Blog Posts',
      description: 'Search and retrieve blog posts from this site via the RSS feed',
      inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Search term to filter blog posts by title' } } },
      annotations: { readOnlyHint: true },
      execute: async function(input){
        var res = await fetch('/rss');
        var xml = await res.text();
        var doc = new DOMParser().parseFromString(xml, 'application/xml');
        var items = Array.from(doc.querySelectorAll('item'));
        var posts = items.map(function(item){
          var get = function(tag){ var el = item.querySelector(tag); return el ? el.textContent || '' : ''; };
          return { title: get('title'), link: get('link'), description: get('description'), pubDate: get('pubDate') };
        });
        if (input && input.query) {
          var q = input.query.toLowerCase();
          return { posts: posts.filter(function(p){ return p.title.toLowerCase().indexOf(q) !== -1 || p.description.toLowerCase().indexOf(q) !== -1; }) };
        }
        return { posts: posts };
      }
    });
    ctx.registerTool({
      name: 'get-health-data',
      title: 'Get Health Data',
      description: 'Retrieve real-time health and fitness metrics including steps, heart rate, sleep, and SpO2',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async function(){
        var res = await fetch('/api/health');
        return await res.json();
      }
    });
    ctx.registerTool({
      name: 'get-page-markdown',
      title: 'Get Page as Markdown',
      description: 'Fetch any page on this site as clean markdown with navigation and scripts stripped',
      inputSchema: { type: 'object', properties: { path: { type: 'string', description: 'URL path to fetch, e.g. "/blog/my-post" or "/about"' } }, required: ['path'] },
      annotations: { readOnlyHint: true },
      execute: async function(input){
        var res = await fetch(input.path, { headers: { Accept: 'text/markdown' } });
        var tokens = res.headers.get('x-markdown-tokens');
        return { content: await res.text(), tokens: tokens ? parseInt(tokens, 10) : null };
      }
    });
  } catch (e) {}
})();`

function RootDocument({ children }: { children: React.ReactNode }) {
  const [showDoom, setShowDoom] = useState(false)
  const gaMeasurementId = env.VITE_GA_MEASUREMENT_ID
  useKonamiCode(useCallback(() => setShowDoom(true), []))

  useEffect(() => {
    const onTrigger = () => setShowDoom(true)
    window.addEventListener('portfolio:trigger-doom', onTrigger)
    return () => window.removeEventListener('portfolio:trigger-doom', onTrigger)
  }, [])

  useEffect(() => {
    const activateAsyncFontStyles = () => {
      document
        .querySelectorAll<HTMLLinkElement>('link[data-font-async]')
        .forEach((el) => {
          if (el.media !== 'all') el.media = 'all'
        })
    }

    if (document.readyState === 'complete') {
      activateAsyncFontStyles()
      return
    }

    window.addEventListener('load', activateAsyncFontStyles, { once: true })
    return () => window.removeEventListener('load', activateAsyncFontStyles)
  }, [])

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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          id="webmcp-init"
          dangerouslySetInnerHTML={{ __html: WEBMCP_INIT_SCRIPT }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <BacklightFilterDefs />
        <ThemeProvider>
          {gaMeasurementId ? (
            <GoogleAnalyticsTracker measurementId={gaMeasurementId} />
          ) : null}
          <VideoBackground />
          <FeedbackHandler />
          <CommandMenu />
          <main className="mx-auto w-full max-w-395 py-4 text-sm lowercase overflow-hidden">{children}</main>
          <Footer />
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
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
