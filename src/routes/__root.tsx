import { env } from '@/env'
import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import Footer from '../components/Footer'
import { gravatar, siteImages, siteInfo, siteMeta } from '../config/site-data'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { FeedbackHandler } from '../components/FeedbackHandler'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: () => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', 'en')
      // Disable native scroll restoration to ensure we have full control
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
  }

  const personJsonLd = {
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
      'Web Development',
      'Android Development',
      'Artificial Intelligence',
      'Cloud Computing',
      'DevOps',
      'React',
      'TypeScript',
      'Flutter',
      'Go',
      'Rust',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd),
          }}
        />
        {/* Google Analytics - Replace G-XXXXXXXXXX with actual tracking ID */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GY82L37E2F" />
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
        <main className="mx-auto w-full max-w-2xl p-4 text-sm lowercase">
          {children}
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  )
}
