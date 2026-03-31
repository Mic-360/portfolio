import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'

export function VideoBackground() {
  const { mode } = useTheme()
  const showVideo =
    mode === 'sunny' ||
    mode === 'midnight' ||
    mode === 'autumn' ||
    mode === 'frieren'
  const sunnyAudioRef = useRef<HTMLAudioElement>(null)
  const midnightAudioRef = useRef<HTMLAudioElement>(null)
  const autumnAudioRef = useRef<HTMLAudioElement>(null)
  const frierenAudioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const sunnyAudio = sunnyAudioRef.current
    const midnightAudio = midnightAudioRef.current
    const autumnAudio = autumnAudioRef.current
    const frierenAudio = frierenAudioRef.current

    if (!sunnyAudio || !midnightAudio || !autumnAudio || !frierenAudio) {
      return
    }

    sunnyAudio.pause()
    midnightAudio.pause()
    autumnAudio.pause()
    frierenAudio.pause()

    sunnyAudio.currentTime = 0
    midnightAudio.currentTime = 0
    autumnAudio.currentTime = 0
    frierenAudio.currentTime = 0

    const activeAudio =
      mode === 'sunny'
        ? sunnyAudio
        : mode === 'midnight'
          ? midnightAudio
          : mode === 'autumn'
            ? autumnAudio
            : mode === 'frieren'
              ? frierenAudio
              : null

    if (!activeAudio) {
      return
    }

    activeAudio.volume = 0.45
    activeAudio.play().catch(() => {})

    return () => {
      activeAudio.pause()
    }
  }, [mode])

  const videoSource =
    mode === 'midnight'
      ? '/moon.mp4'
      : mode === 'autumn'
        ? '/fall.mp4'
        : mode === 'frieren'
          ? '/frieren.mp4'
          : '/leaves.mp4'

  const videoBlendMode =
    mode === 'midnight' || mode === 'frieren'
      ? 'overlay'
      : mode === 'autumn'
        ? 'soft-light'
        : 'multiply'

  const videoOpacity =
    mode === 'midnight'
      ? 0.74
      : mode === 'autumn'
        ? 0.82
        : mode === 'frieren'
          ? 0.62
          : 0.75

  const videoFilter =
    mode === 'midnight'
      ? 'brightness(1.18) contrast(1.14) saturate(0.9)'
      : mode === 'autumn'
        ? 'brightness(0.98) contrast(1.08) saturate(1.12)'
        : mode === 'frieren'
          ? 'brightness(0.94) contrast(1.04) saturate(0.72)'
          : undefined

  return (
    <>
      <audio ref={sunnyAudioRef} src="/forest.mp3" loop preload="auto" />
      <audio ref={midnightAudioRef} src="/night.mp3" loop preload="auto" />
      <audio ref={autumnAudioRef} src="/maple.mp3" loop preload="auto" />
      <audio ref={frierenAudioRef} src="/mozart.mp3" loop preload="auto" />

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
            {mode === 'midnight' ? (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,226,255,0.16),transparent_46%),linear-gradient(180deg,rgba(9,12,18,0.08),rgba(9,12,18,0.34))]" />
                <div className="absolute inset-0 mix-blend-multiply bg-[linear-gradient(180deg,rgba(7,10,16,0.06),rgba(7,10,16,0.28))]" />
              </>
            ) : mode === 'autumn' ? (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,179,78,0.16),transparent_42%),linear-gradient(180deg,rgba(61,34,18,0.08),rgba(61,34,18,0.22))]" />
                <div className="absolute inset-0 mix-blend-multiply bg-[linear-gradient(180deg,rgba(110,54,19,0.03),rgba(110,54,19,0.14))]" />
              </>
            ) : mode === 'frieren' ? (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(241,224,177,0.16),transparent_36%),radial-gradient(circle_at_right,rgba(141,164,180,0.14),transparent_42%),linear-gradient(180deg,rgba(227,220,204,0.08),rgba(92,103,120,0.18))]" />
                <div className="absolute inset-0 mix-blend-multiply bg-[linear-gradient(180deg,rgba(73,79,96,0.05),rgba(73,79,96,0.18))]" />
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
