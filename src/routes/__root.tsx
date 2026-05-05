import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { AnimatePresence } from 'motion/react'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { FeedbackHandler } from '@/components/FeedbackHandler'
import { useKonamiCode } from '@/hooks/useKonamiCode'

import { FloatingNavDock } from '@/components/FloatingNavDock'
import Footer from '@/components/Footer'
import { GoogleAnalyticsTracker } from '@/components/GoogleAnalyticsTracker'
import { LazyCommandMenu } from '@/components/LazyCommandMenu'
import { ThemeProvider } from '@/components/ThemeProvider'
import { BacklightFilterDefs } from '@/components/ui/backlight'
import { VideoBackground } from '@/components/VideoBackground'
import { getDefaultSeoConfig } from '@/lib/seo'

import { env } from '@/env'
import { WEBMCP_INIT_SCRIPT } from '@/lib/utils'
import NotFound from '@/layout/not-found'
import GlobalError from '@/layout/error'
import GlobalPending from '@/layout/loading'
import { siteInfo } from '@/config/site-data'
import { CrowdCanvas } from '@/components/CrowdCanvas'

const DoomEasterEgg = React.lazy(() => import('@/components/DoomEasterEgg'))

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

  head: () => getDefaultSeoConfig(),

  notFoundComponent: NotFound,
  errorComponent: GlobalError,
  pendingComponent: GlobalPending,
  shellComponent: RootDocument,
})

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
    let initialized = false
    const initializeCal = async () => {
      if (initialized) return
      initialized = true
      try {
        const { getCalApi } = await import('@calcom/embed-react')
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

    // Defer Cal.com embed until the user shows intent (pointer or first scroll).
    // Keeps ~22KB off the critical path on first paint.
    const opts: AddEventListenerOptions = { once: true, passive: true }
    const trigger = () => void initializeCal()
    window.addEventListener('pointerdown', trigger, opts)
    window.addEventListener('pointermove', trigger, opts)
    window.addEventListener('scroll', trigger, opts)
    window.addEventListener('keydown', trigger, opts)

    // Fallback: warm it up lazily after a long idle window if the user hasn't interacted.
    const hasIdleCallback = typeof window.requestIdleCallback === 'function'
    let idleId: number | undefined
    let timeoutId: number | undefined
    const warmStart = () => {
      if (hasIdleCallback) {
        idleId = window.requestIdleCallback(trigger, { timeout: 6000 })
      } else {
        timeoutId = window.setTimeout(trigger, 5000)
      }
    }
    const onLoad = () => window.setTimeout(warmStart, 2500)
    if (document.readyState === 'complete') {
      onLoad()
    } else {
      window.addEventListener('load', onLoad, { once: true })
    }

    return () => {
      window.removeEventListener('pointerdown', trigger)
      window.removeEventListener('pointermove', trigger)
      window.removeEventListener('scroll', trigger)
      window.removeEventListener('keydown', trigger)
      window.removeEventListener('load', onLoad)
      if (
        idleId !== undefined &&
        typeof window.cancelIdleCallback === 'function'
      ) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
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
      <body className="relative bg-background text-foreground antialiased min-h-screen">
        <BacklightFilterDefs />
        <ThemeProvider>
          {gaMeasurementId ? (
            <GoogleAnalyticsTracker measurementId={gaMeasurementId} />
          ) : null}
          <VideoBackground />
          <FeedbackHandler />
          <LazyCommandMenu />
          <main className="mx-auto w-full text-sm lowercase overflow-hidden [view-transition-name:main-content] ">
            {children}
          </main>
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
        <CrowdCanvas src="/all-peeps.png" rows={15} cols={7} />
        <Scripts />
      </body>
    </html>
  )
}
