import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export function LazyHeroVideo({ src }: { src: string }) {
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

	const mount = () => setShouldRender(true)
	const schedule = () => {
	  const ric = (
		window as Window & {
		  requestIdleCallback?: (
			cb: () => void,
			opts?: { timeout: number },
		  ) => number
		}
	  ).requestIdleCallback
	  if (typeof ric === 'function') {
		ric(mount, { timeout: 2500 })
		return
	  }
	  window.setTimeout(mount, 800)
	}

	if ('IntersectionObserver' in window) {
	  const io = new IntersectionObserver(
		(entries) => {
		  if (entries.some((e) => e.isIntersecting)) {
			io.disconnect()
			schedule()
		  }
		},
		{ rootMargin: '200px' },
	  )
	  io.observe(el)
	  return () => io.disconnect()
	}

	schedule()
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