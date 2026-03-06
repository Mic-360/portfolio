import { useCallback } from 'react'
import { useWebHaptics } from 'web-haptics/react'

export function useFeedback() {
    const haptic = useWebHaptics()

    const playSyntheticClick = useCallback(() => {
        if (typeof window === 'undefined') return

        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext)
            if (!AudioContextClass) return

            const context = new AudioContextClass()

            // Create a short, clicky sound
            const oscillator = context.createOscillator()
            const gain = context.createGain()

            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(400, context.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(1, context.currentTime + 0.1)

            gain.gain.setValueAtTime(0.1, context.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1)

            oscillator.connect(gain)
            gain.connect(context.destination)

            oscillator.start()
            oscillator.stop(context.currentTime + 0.1)

            // Cleanup context after sound finishes to save resources
            setTimeout(() => {
                context.close().catch(() => { })
            }, 200)
        } catch (e) {
            console.error('Failed to play synthetic click', e)
        }
    }, [])

    const triggerFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' = 'light') => {
        const isMobile = typeof navigator !== 'undefined' &&
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

        if (isMobile) {
            haptic.trigger(type)
        } else {
            playSyntheticClick()
        }
    }, [haptic, playSyntheticClick])

    return { triggerFeedback }
}
