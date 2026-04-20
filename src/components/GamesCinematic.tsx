import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { memo, useEffect, useRef, useState } from 'react'

import type { GameMeta } from '@/lib/games'

const APPLE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function GameCard({ game, index }: { game: GameMeta; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const youtubeId = game.videoUrl ? getYoutubeId(game.videoUrl) : null
  const cardRef = useRef<HTMLDivElement>(null)

  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const tilt = { stiffness: 220, damping: 22, mass: 0.5 }
  const rotateX = useSpring(rx, tilt)
  const rotateY = useSpring(ry, tilt)
  const glareX = useTransform(ry, [-8, 8], ['25%', '75%'])
  const glareY = useTransform(rx, [-8, 8], ['75%', '25%'])

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = cardRef.current?.getBoundingClientRect()
    if (!r) return
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 12)
    rx.set(-py * 10)
  }

  function handlePointerLeave() {
    setIsHovered(false)
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 100px 0px 0px' }}
      transition={{
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.05,
      }}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="group relative h-[60vh] min-h-100 w-[75vw] sm:w-[45vw] lg:w-[28vw] shrink-0 snap-center cursor-pointer overflow-hidden rounded-4xl bg-card/20 border border-white/5 shadow-2xl transition-[width,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-10 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)] sm:hover:w-[50vw] lg:hover:w-[36vw] transform-3d"
    >
      <div className="absolute inset-0 transform-[translateZ(0)]">
        <img
          src={game.posterUrl}
          alt={game.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-60"
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/800x1200/111/444?text=${encodeURIComponent(game.title)}`
          }}
        />

        <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/60 to-transparent pointer-events-none opacity-40 transition-opacity duration-700 group-hover:opacity-0" />
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-overlay"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([x, y]) =>
              `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.55), transparent 45%)`,
          ),
        }}
      />

      <div className="absolute inset-0 bg-black/10 transition-opacity duration-700 group-hover:opacity-30 dark:group-hover:opacity-50 pointer-events-none" />

      {game.videoUrl && (
        <div
          className={`pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen dark:mix-blend-normal transition-opacity duration-1000 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isHovered ? 1 : 0}&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0`}
              className="absolute inset-0 h-[150%] w-[150%] -translate-x-[16%] -translate-y-[16%] scale-[1.15] object-cover"
              allow="autoplay; encrypted-media"
              tabIndex={-1}
            />
          ) : (
            <video
              src={game.videoUrl}
              autoPlay={isHovered}
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          )}
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80" />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end transform-[translateZ(40px)]">
        <div className="translate-y-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2 drop-shadow-md">
            {game.series}
          </p>
          <h3 className="font-serif text-3xl font-medium tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl transition-all duration-700">
            {game.title}
          </h3>
        </div>
      </div>
    </motion.div>
  )
}

const GameCardMemo = memo(GameCard)

function CinematicHeader() {
  return (
    <div className="relative z-10 w-full mb-12 sm:mb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1, ease: APPLE_EASE }}
        className="flex items-center gap-4"
      >
        <span className="text-[10px] uppercase tracking-[0.32em] text-primary/70 font-semibold">
          Interactive Scapes
        </span>
        <motion.div
          className="h-px bg-primary/20 flex-1 max-w-[120px] sm:max-w-[240px] origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: APPLE_EASE, delay: 0.2 }}
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: APPLE_EASE, delay: 0.1 }}
        className="mt-8 max-w-4xl text-balance font-serif text-5xl leading-[1.04] tracking-tight text-foreground sm:text-7xl lg:text-8xl"
      >
        Games I Find worth{' '}
        <span className="relative inline-block text-primary">
          discussing
          <motion.svg
            viewBox="0 0 200 12"
            preserveAspectRatio="none"
            className="absolute -bottom-2 left-0 h-3 w-full overflow-visible text-primary/40"
            aria-hidden="true"
          >
            <motion.path
              d="M2,8 Q50,2 100,7 T198,6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: APPLE_EASE, delay: 0.8 }}
            />
          </motion.svg>
        </span>
        .
      </motion.h2>
    </div>
  )
}

export function GamesCinematic({ gamesData }: { gamesData: Array<GameMeta> }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let interval: number
    let isPaused = false

    const setupAutoScroll = () => {
      // 2.5 seconds matches Apple TV pacing perfectly
      interval = window.setInterval(() => {
        if (!scrollRef.current || isPaused) return
        const container = scrollRef.current
        const { scrollLeft, scrollWidth, clientWidth } = container

        // Scroll forward by approximately half the screen width
        // CSS scroll-snap handles the perfect card alignment
        const scrollAmount = clientWidth * 0.45

        let newScrollLeft = scrollLeft + scrollAmount

        // Reset to beginning if we hit the end
        if (newScrollLeft >= scrollWidth - clientWidth - 20) {
          newScrollLeft = 0
        }

        container.scrollTo({
          left: newScrollLeft,
          behavior: 'smooth',
        })
      }, 2500)
    }

    setupAutoScroll()

    const pause = () => {
      isPaused = true
    }
    const resume = () => {
      isPaused = false
    }

    const el = scrollRef.current
    if (el) {
      el.addEventListener('mouseenter', pause)
      el.addEventListener('mouseleave', resume)
      el.addEventListener('touchstart', pause, { passive: true })
      el.addEventListener('touchend', resume, { passive: true })
    }

    return () => {
      clearInterval(interval)
      if (el) {
        el.removeEventListener('mouseenter', pause)
        el.removeEventListener('mouseleave', resume)
        el.removeEventListener('touchstart', pause)
        el.removeEventListener('touchend', resume)
      }
    }
  }, [])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    if (scrollWidth > clientWidth) {
      setScrollProgress(scrollLeft / (scrollWidth - clientWidth))
    }
  }

  const nudge = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({
      left: el.scrollLeft + dir * el.clientWidth * 0.6,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = scrollRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const inView =
        r.top < window.innerHeight * 0.75 &&
        r.bottom > window.innerHeight * 0.25
      if (!inView) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        nudge(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        nudge(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/20 to-transparent" />

      {/* Background ambient light */}
      <div
        className="pointer-events-none absolute right-[10%] top-[20%] h-96 w-96 rounded-full bg-primary/5 blur-[120px] transition-all duration-1000"
        style={{ transform: `translateX(${scrollProgress * -100}px)` }}
      />
      <div
        className="pointer-events-none absolute left-[5%] bottom-[10%] h-64 w-64 rounded-full bg-primary/5 blur-[100px] transition-all duration-1000"
        style={{ transform: `translateX(${scrollProgress * 100}px)` }}
      />

      <div className="mx-auto w-full max-w-[1920px]">
        <div className="px-4 sm:px-8 max-w-7xl">
          <CinematicHeader />
        </div>

        <div className="relative mt-16 w-full group/gallery">
          {/* Scroll hints */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 sm:w-24 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 sm:w-24 bg-linear-to-l from-background to-transparent" />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-12 pt-6 sm:px-8 sm:gap-8 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Adding leading space */}
            <div className="shrink-0 w-0 sm:w-[5vw] lg:w-[10vw]" />
            {gamesData.map((game, i) => (
              <GameCardMemo key={game.id} game={game} index={i} />
            ))}
            {/* Trailing space */}
            <div className="shrink-0 w-[10vw]" />
          </div>

          {/* Scroll Indicator line */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 1 }}
            className="mx-auto mt-4 flex w-full max-w-md items-center gap-4 px-6"
          >
            <button
              type="button"
              aria-label="Previous"
              onClick={() => nudge(-1)}
              className="group/nav flex h-9 w-9 items-center justify-center rounded-full border border-border/15 bg-background/40 text-foreground/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:text-primary active:scale-95"
            >
              <span className="transition-transform duration-300 group-hover/nav:-translate-x-0.5">
                &larr;
              </span>
            </button>
            <div className="relative h-px flex-1 overflow-hidden bg-border/20">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary/60"
                animate={{ width: `${Math.max(5, scrollProgress * 100)}%` }}
                transition={{
                  type: 'spring',
                  stiffness: 120,
                  damping: 24,
                  mass: 0.4,
                }}
              />
            </div>
            <button
              type="button"
              aria-label="Next"
              onClick={() => nudge(1)}
              className="group/nav flex h-9 w-9 items-center justify-center rounded-full border border-border/15 bg-background/40 text-foreground/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:text-primary active:scale-95"
            >
              <span className="transition-transform duration-300 group-hover/nav:translate-x-0.5">
                &rarr;
              </span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
