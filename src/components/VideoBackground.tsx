import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from './ThemeProvider'
import { SETTINGS_EVENT, getMuteAudio } from '@/lib/settings'

const AUDIO_VOLUME = 0.45

export function VideoBackground() {
  const { mode } = useTheme()
  const showVideo = mode === 'sunny'
  const sunnyAudioRef = useRef<HTMLAudioElement>(null)
  const midnightAudioRef = useRef<HTMLAudioElement>(null)
  const frierenAudioRef = useRef<HTMLAudioElement>(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    setMuted(getMuteAudio())
    const onChange = () => setMuted(getMuteAudio())
    window.addEventListener(SETTINGS_EVENT, onChange)
    return () => window.removeEventListener(SETTINGS_EVENT, onChange)
  }, [])

  useEffect(() => {
    const sunnyAudio = sunnyAudioRef.current
    const midnightAudio = midnightAudioRef.current
    const frierenAudio = frierenAudioRef.current

    if (!sunnyAudio || !midnightAudio || !frierenAudio) {
      return
    }

    sunnyAudio.pause()
    midnightAudio.pause()
    frierenAudio.pause()

    sunnyAudio.currentTime = 0
    midnightAudio.currentTime = 0
    frierenAudio.currentTime = 0

    const activeAudio = mode === 'sunny' ? sunnyAudio : undefined

    if (!activeAudio) {
      return
    }

    activeAudio.volume = muted ? 0 : AUDIO_VOLUME
    activeAudio.play().catch(() => {})

    return () => {
      activeAudio.pause()
    }
  }, [mode, muted])

  const videoSource = '/leaves.mp4'

  const videoBlendMode = 'multiply'

  const videoOpacity = 0.75

  const videoFilter = undefined

  return (
    <>
      <audio ref={sunnyAudioRef} src="/forest.mp3" loop preload="none" />

      <AnimatePresence mode="wait">
        {showVideo && (
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: videoOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="fixed inset-0 z-20 overflow-hidden pointer-events-none"
            style={{ mixBlendMode: videoBlendMode }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-fill"
              style={{ filter: videoFilter }}
            >
              <source src={videoSource} type="video/mp4" />
            </video>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
