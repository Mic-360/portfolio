import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'motion/react'

import type {GameMeta} from '@/lib/games';

function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function MarqueeRow({
  items,
  direction = 1,
  speed = 40,
  offset = 0,
}: {
  items: Array<GameMeta>
  direction?: 1 | -1
  speed?: number
  offset?: number
}) {
  const x = useMotionValue(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    // Measure width of one full set of items (total / 3)
    const oneSetWidth = el.scrollWidth / 3
    if (oneSetWidth === 0) return

    const from = direction === 1 ? 0 : -oneSetWidth
    const to = direction === 1 ? -oneSetWidth : 0

    // Duration based on distance / speed (px per second)
    const duration = oneSetWidth / speed

    x.set(from)

    controlsRef.current = animate(x, [from, to], {
      duration,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    })

    return () => {
      controlsRef.current?.stop()
    }
  }, [items, direction, speed, x])

  // Pause / resume without re-mounting the animation
  useEffect(() => {
    if (!controlsRef.current) return
    if (paused) {
      controlsRef.current.pause()
    } else {
      controlsRef.current.play()
    }
  }, [paused])

  const onEnter = useCallback(() => setPaused(true), [])
  const onLeave = useCallback(() => setPaused(false), [])

  return (
    <div
      className="flex w-fit select-none overflow-visible py-2"
      style={{ marginLeft: offset }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <motion.div
        ref={trackRef}
        className="flex will-change-transform"
        style={{ x }}
      >
        {/* Render 3 copies for seamless wrapping on wide screens */}
        {[0, 1, 2].map((copy) => (
          <div key={copy} className="flex gap-4 pr-4 sm:gap-6 sm:pr-6">
            {items.map((game) => (
              <GamePosterMemo key={`${game.id}-${copy}`} game={game} />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

function GamePoster({ game }: { game: GameMeta }) {
  const [isHovered, setIsHovered] = useState(false)
  const youtubeId = game.videoUrl ? getYoutubeId(game.videoUrl) : null

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="media-hover-parent group relative h-72 w-52 shrink-0 cursor-pointer overflow-hidden bg-card shadow-lg sm:h-96 sm:w-64"
    >
      <img
        src={game.posterUrl}
        alt={game.title}
        loading="lazy"
        className="media-hover-image media-hover-desaturate h-full w-full object-cover"
        onError={(e) => {
          // Fallback if the wiki image source breaks or changes
          e.currentTarget.src = `https://placehold.co/400x600/222420/8fb374?text=${encodeURIComponent(game.title)}`
        }}
      />

      {game.videoUrl && isHovered && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-active:opacity-100">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
              className="absolute inset-0 h-[150%] w-[150%] -translate-x-[16%] -translate-y-[16%] scale-110 object-fill"
              allow="autoplay; encrypted-media"
            />
          ) : (
            <video
              src={game.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          )}
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100 group-active:opacity-100" />

      <div className="absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-active:translate-y-0 group-active:opacity-100">
        <p className="text-[10px] uppercase tracking-[0.24em] text-primary/90">
          {game.series}
        </p>
        <p className="mt-1 font-serif text-lg font-semibold leading-tight text-foreground shadow-sm">
          {game.title}
        </p>
      </div>
    </div>
  )
}

// Memoize poster to prevent re-renders when the row-level pause state changes
const GamePosterMemo = memo(GamePoster)

export function GamesCinematic({ gamesData }: { gamesData: Array<GameMeta> }) {
  // Split games into 2 rows for the cinematic density
  const half = Math.ceil(gamesData.length / 2)
  const row1 = gamesData.slice(0, half)
  const row2 = gamesData.slice(half)

  return (
    <div className="relative overflow-hidden bg-background/30 py-16 sm:py-24">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-x-[16%] top-[10%] h-32 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-[12%] h-72 w-72 rounded-full bg-primary/5 blur-[120px]" />
      <div className="hero-grid-overlay absolute inset-0" />

      <div className="relative z-10 mb-10 flex w-full flex-col sm:mb-16">
        <div className="flex items-center gap-4">
          <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
            Interactive Worlds
          </p>
          <div className="h-px w-24 bg-linear-to-r from-primary/30 to-transparent sm:w-48" />
        </div>
        <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
          Games we can discuss on.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-8 text-foreground/78 sm:text-lg">
          A continuous feed of worlds explored, from stealth in historical
          shades to high speed across Vice City. Hover or tap to reveal the
          atmosphere.
        </p>
      </div>

      {/* Edge to edge marquee container */}
      <div className="relative z-10 flex w-full flex-col gap-4 overflow-hidden sm:gap-6">
        {/* Gradients to fade edges smoothly */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-linear-to-r from-background to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-linear-to-l from-background to-transparent sm:w-24" />

        <MarqueeRow items={row1} direction={1} speed={40} offset={-50} />
        <MarqueeRow items={row2} direction={-1} speed={35} offset={-250} />
      </div>
    </div>
  )
}
