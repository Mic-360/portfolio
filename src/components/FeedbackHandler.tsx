'use client'

import { useEffect } from 'react'
import { useFeedback } from '../hooks/use-feedback'

export function FeedbackHandler() {
    const { triggerFeedback } = useFeedback()

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const interactiveElement = target.closest('button, a, [role="button"], input[type="submit"], input[type="button"]')

            if (interactiveElement) {
                const isLink = interactiveElement.tagName === 'A' || interactiveElement.getAttribute('role') === 'button'
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
