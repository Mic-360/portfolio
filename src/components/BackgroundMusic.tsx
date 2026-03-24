import { useEffect, useRef } from 'react'

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const unmutedRef = useRef(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.5

    audio.muted = true
    audio
      .play()
      .then(() => {
        setTimeout(() => {
          audio.muted = false
          unmutedRef.current = true
        }, 500)
      })
      .catch(() => {
        const enableSound = () => {
          audio.muted = false
          audio.play().catch((err) => console.debug('Playback failed:', err))
          document.removeEventListener('click', enableSound)
        }
        document.addEventListener('click', enableSound)
      })

    return () => {
      document.removeEventListener('click', () => {})
    }
  }, [])

  return (
    <audio ref={audioRef} src="/frieren/frieren.mp3" loop className="hidden" />
  )
}
