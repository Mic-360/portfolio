import { useCallback } from 'react'
import { useWebHaptics } from 'web-haptics/react'

let sharedAudioContext: AudioContext | null = null

export function useFeedback() {
  const haptic = useWebHaptics()

  const playSyntheticClick = useCallback((frequency = 400, volume = 0.1) => {
    if (typeof window === 'undefined') return

    try {
      if (!sharedAudioContext) {
        const AudioContextClass =
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          window.AudioContext || (window as any).webkitAudioContext
        
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (AudioContextClass) {
          sharedAudioContext = new AudioContextClass()
        }
      }

      if (!sharedAudioContext) return

      if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume()
      }

      const context = sharedAudioContext
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, context.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        1,
        context.currentTime + 0.1,
      )

      gain.gain.setValueAtTime(volume, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1)

      oscillator.connect(gain)
      gain.connect(context.destination)

      oscillator.start()
      oscillator.stop(context.currentTime + 0.1)
    } catch (e) {
      console.error('Failed to play synthetic click', e)
    }
  }, [])

  const triggerFeedback = useCallback(
    (
      type:
        | 'light'
        | 'medium'
        | 'heavy'
        | 'success'
        | 'warning'
        | 'error'
        | 'selection' = 'light',
    ) => {
      const isMobile =
        typeof navigator !== 'undefined' &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )

      if (isMobile) {
        haptic.trigger(type)
      } else {
        switch (type) {
          case 'selection':
            playSyntheticClick(600, 0.08)
            break
          case 'error':
            playSyntheticClick(150, 0.15)
            break
          default:
            playSyntheticClick(400, 0.1)
        }
      }
    },
    [haptic, playSyntheticClick],
  )

  return { triggerFeedback }
}
