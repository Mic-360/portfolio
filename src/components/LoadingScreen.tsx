import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from 'motion/react'
import { useEffect, useState } from 'react'

const WORD = 'bhaumic'
const DURATION = 3.2
const EXIT_EASE = [0.76, 0, 0.24, 1] as const
const EASE_OUT = [0.22, 1, 0.36, 1] as const

const LETTER_OFFSETS: Array<{ x: number; y: number; r: number; d: number }> = [
  { x: -120, y: -60, r: -28, d: 0.05 },
  { x: 80, y: 90, r: 22, d: 0.55 },
  { x: -40, y: 110, r: -16, d: 0.18 },
  { x: 140, y: -90, r: 30, d: 0.7 },
  { x: -150, y: 70, r: -22, d: 0.32 },
  { x: 60, y: -110, r: 18, d: 0.85 },
  { x: 130, y: 60, r: -12, d: 0.42 },
]

export function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const widthPct = useTransform(count, (v) => `${v}%`)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setDisplay(v))
    const controls = animate(count, 100, {
      duration: DURATION,
      ease: [0.65, 0, 0.35, 1],
    })

    let exitTimer: number | undefined
    controls.then(() => {
      exitTimer = window.setTimeout(() => setVisible(false), 520)
    })

    return () => {
      controls.stop()
      unsub()
      if (exitTimer) window.clearTimeout(exitTimer)
    }
  }, [count, rounded])

  useEffect(() => {
    if (!visible) {
      document.documentElement.style.removeProperty('overflow')
      document.body.style.removeProperty('overflow')
      return
    }
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  }, [visible])

  const letters = WORD.split('')

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="loading-screen"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{
            clipPath: 'inset(0 0 100% 0)',
            transition: { duration: 1, ease: EXIT_EASE },
          }}
          className="fixed inset-0 z-100 flex flex-col items-center justify-between overflow-hidden bg-background px-6 pb-10 pt-12 sm:pb-16 sm:pt-20"
          style={{ willChange: 'clip-path, opacity' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="flex w-full items-center justify-between text-[10px] uppercase tracking-[0.4em] text-primary dark:text-primary-foreground/55"
          >
            <span>est · 2001</span>
            <span className="hidden sm:block">prayagraj · in</span>
            <span>portfolio · v8</span>
          </motion.div>

          <div className="relative flex w-full flex-1 items-center justify-center">
            <span className="sr-only">{WORD}</span>
            <div
              aria-hidden="true"
              className="relative flex select-none items-center justify-center font-serif italic leading-none tracking-tight"
              style={{
                fontSize: 'clamp(5rem, 20vw, 16rem)',
                letterSpacing: '-0.04em',
              }}
            >
              {letters.map((char, i) => {
                const o = LETTER_OFFSETS[i % LETTER_OFFSETS.length]
                return (
                  <span key={i} className="relative inline-block">
                    <motion.span
                      className="absolute inset-0 text-accent"
                      initial={{
                        x: o.x * 0.6,
                        y: o.y * 0.6 + 14,
                        rotate: o.r * 0.6,
                        scale: 0.7,
                        opacity: 0,
                        filter: 'blur(6px)',
                      }}
                      animate={{
                        x: 6,
                        y: 8,
                        rotate: -2,
                        scale: 1,
                        opacity: 0.85,
                        filter: 'blur(0px)',
                      }}
                      transition={{
                        duration: 0.9,
                        ease: EASE_OUT,
                        delay: 0.2 + o.d,
                      }}
                      style={{ transformOrigin: '50% 70%' }}
                    >
                      {char}
                    </motion.span>
                    <motion.span
                      className="relative inline-block text-primary"
                      initial={{
                        x: o.x,
                        y: o.y,
                        rotate: o.r,
                        scale: 0.55,
                        opacity: 0,
                        filter: 'blur(8px)',
                      }}
                      animate={{
                        x: 0,
                        y: 0,
                        rotate: 0,
                        scale: 1,
                        opacity: 1,
                        filter: 'blur(0px)',
                      }}
                      transition={{
                        duration: 1,
                        ease: EASE_OUT,
                        delay: 0.35 + o.d,
                      }}
                      style={{ transformOrigin: '50% 70%' }}
                    >
                      {char}
                    </motion.span>
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col items-center gap-3">
            <div className="flex items-baseline gap-2 font-mono text-sm tracking-widest text-primary dark:text-primary-foreground">
              <motion.span className="tabular-nums">{display}</motion.span>
              <span className="text-primary/60 dark:text-primary-foreground/60">
                %
              </span>
            </div>
            <div className="relative h-px w-full overflow-hidden bg-primary dark:bg-primary-foreground/25">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary dark:bg-primary-foreground"
                style={{ width: widthPct }}
              />
            </div>
            <div className="mt-1 flex w-full items-center justify-between text-[10px] uppercase tracking-[0.32em] text-primary dark:text-primary-foreground/55">
              <span>loading assets</span>
              <span>full stack engineer</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingScreen
