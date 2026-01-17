import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import Footer from '../components/Footer'
import { siteInfo, siteMeta } from '../lib/site-data'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
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
        title: 'Bhaumik Singh — Portfolio',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/logo.gif',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo.gif',
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

  shellComponent: RootDocument,
})

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
    <html lang="en" data-theme="dark">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        {/* <Header /> */}
        <main className="mx-auto w-full max-w-2xl p-4 text-sm lowercase">
          {children}
        </main>
        <Footer />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
              defaultOpen: true,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
