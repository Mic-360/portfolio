import { useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    dataLayer: Array<unknown>
    gtag?: (...args: Array<unknown>) => void
  }
}

interface GoogleAnalyticsTrackerProps {
  measurementId: string
}

export function GoogleAnalyticsTracker({
  measurementId,
}: GoogleAnalyticsTrackerProps) {
  const location = useLocation()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let cancelled = false
    let idleHandle: number | undefined
    let timeoutHandle: number | undefined

    const load = () => {
      if (cancelled) return
      if (document.querySelector(`script[data-ga-id="${measurementId}"]`)) {
        setIsLoaded(true)
        return
      }

      window.dataLayer = window.dataLayer || []
      window.gtag =
        window.gtag ||
        function gtag(...args: Array<unknown>) {
          window.dataLayer.push(args)
        }
      window.gtag('js', new Date())
      window.gtag('config', measurementId, {
        send_page_view: false,
        anonymize_ip: true,
      })

      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      script.setAttribute('data-ga-id', measurementId)
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    }

    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(load, { timeout: 4000 })
    } else {
      timeoutHandle = window.setTimeout(load, 2000)
    }

    return () => {
      cancelled = true
      if (
        idleHandle !== undefined &&
        typeof window.cancelIdleCallback === 'function'
      ) {
        window.cancelIdleCallback(idleHandle)
      }
      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle)
      }
    }
  }, [measurementId])

  useEffect(() => {
    if (!isLoaded) return
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      return
    }

    const pagePath = `${location.pathname}${location.searchStr}${location.hash}`

    window.gtag('config', measurementId, {
      page_title: document.title,
      page_path: pagePath,
      page_location: window.location.href,
    })
  }, [
    isLoaded,
    location.hash,
    location.pathname,
    location.searchStr,
    measurementId,
  ])

  return null
}
