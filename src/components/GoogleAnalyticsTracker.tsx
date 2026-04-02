import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

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

  useEffect(() => {
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
    location.hash,
    location.pathname,
    location.searchStr,
    measurementId,
  ])

  return null
}
