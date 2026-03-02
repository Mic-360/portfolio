import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import Footer from '../components/Footer'
import { gravatar, siteImages, siteInfo, siteMeta } from '../lib/site-data'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: () => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', 'en')
    }
  },

  head: () => ({
    meta: [
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
        title: 'Bhaumic Singh — Portfolio',
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
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '64x64',
        href: '/favicon-64x64.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '128x128',
        href: '/favicon-128x128.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '256x256',
        href: '/favicon-256x256.png',
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
        title: 'RSS',
        href: '/rss',
      },
    ],
  }),

  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">page not found</p>
      <Link
        to="/"
        className="mt-4 rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        go home
      </Link>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteMeta.siteName,
    url: siteMeta.baseUrl,
    description: siteMeta.defaultDescription,
    publisher: {
      '@type': 'Person',
      name: siteInfo.name,
    },
  }

  return (
    <html data-theme="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <main className="mx-auto w-full max-w-2xl p-4 text-sm lowercase">
          {children}
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  )
}
