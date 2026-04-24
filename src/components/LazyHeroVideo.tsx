import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export function LazyHeroVideo({
  src,
  poster,
}: {
  src: string
  poster?: string
}) {
  const [shouldRender, setShouldRender] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '14%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.06, 1.18])
  const opacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 0.95, 0.5])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const el = containerRef.current
    if (!el) return

    let disposed = false
    const mount = () => {
      if (!disposed) setShouldRender(true)
    }

    const ric = (
      window as Window & {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number
      }
    ).requestIdleCallback

    const scheduleAfterIdle = (delay: number) => {
      const run = () => {
        if (typeof ric === 'function') {
          ric(mount, { timeout: 4000 })
        } else {
          window.setTimeout(mount, 1200)
        }
      }
      window.setTimeout(run, delay)
    }

    // Wait for the window load event (main thread quieter) before even considering the video.
    const start = () => {
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              io.disconnect()
              scheduleAfterIdle(300)
            }
          },
          { rootMargin: '0px', threshold: 0.15 },
        )
        io.observe(el)
        return () => io.disconnect()
      }
      scheduleAfterIdle(1500)
      return () => {}
    }

    let cleanup: (() => void) | undefined
    if (document.readyState === 'complete') {
      cleanup = start()
    } else {
      const onLoad = () => {
        cleanup = start()
      }
      window.addEventListener('load', onLoad, { once: true })
      cleanup = () => window.removeEventListener('load', onLoad)
    }
    return () => {
      disposed = true
      cleanup?.()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="hero-blend-media hero-home-video media-hover-image media-hover-fade absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {shouldRender ? (
        <motion.video
          src={src}
          poster={poster}
          style={{ y, scale, opacity }}
          className="h-full w-full object-cover will-change-transform"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
}
