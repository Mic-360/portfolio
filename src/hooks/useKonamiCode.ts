import { useEffect } from 'react'

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const

export function useKonamiCode(callback: () => void) {
  useEffect(() => {
    let index = 0

    const handler = (e: KeyboardEvent) => {
      if (e.key === KONAMI_SEQUENCE[index]) {
        index++
        if (index === KONAMI_SEQUENCE.length) {
          callback()
          index = 0
        }
      } else {
        index = e.key === KONAMI_SEQUENCE[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [callback])
}
