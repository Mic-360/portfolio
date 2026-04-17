'use client'

import { useEffect, useRef } from 'react'
import { useFeedback } from '../hooks/use-feedback'
import { SETTINGS_EVENT, getFeedbackEnabled } from '@/lib/settings'

export function FeedbackHandler() {
  const { triggerFeedback } = useFeedback()
  const enabledRef = useRef(true)

  useEffect(() => {
    enabledRef.current = getFeedbackEnabled()
    const onChange = () => {
      enabledRef.current = getFeedbackEnabled()
    }
    window.addEventListener(SETTINGS_EVENT, onChange)
    return () => window.removeEventListener(SETTINGS_EVENT, onChange)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!enabledRef.current) return
      const target = e.target as HTMLElement
      const interactiveElement = target.closest(
        'button, a, [role="button"], input[type="submit"], input[type="button"]',
      )

      if (interactiveElement) {
        const isLink =
          interactiveElement.tagName === 'A' ||
          interactiveElement.getAttribute('role') === 'button'
        triggerFeedback(isLink ? 'selection' : 'light')
      }
    }

    // Only add listener if we're in the browser
    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleClick)
      return () => window.removeEventListener('click', handleClick)
    }
  }, [triggerFeedback])

  return null
}
