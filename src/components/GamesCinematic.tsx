import { motion } from 'motion/react'

import type { GameMeta } from '@/lib/games'

import { Card, Carousel } from '@/components/ui/apple-cards-carousel'

const APPLE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function GameExpandedContent({ game }: { game: GameMeta }) {
  const youtubeId = game.videoUrl ? getYoutubeId(game.videoUrl) : null

  return (
    <div className="flex flex-col gap-8">
      {game.videoUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          ) : (
            <video
              src={game.videoUrl}
              autoPlay
              controls
              playsInline
              className="h-full w-full object-cover"
            />
          )}
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
          <img
            src={game.posterUrl}
            alt={game.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        <span className="inline-block rounded-full border border-white/10 bg-background/60 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-primary/70 backdrop-blur-sm">
          {game.series}
        </span>
      </div>
    </div>
  )
}

function CinematicHeader() {
  return (
    <div className="relative z-10 w-full mb-4 sm:mb-6">
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
          className="h-px bg-primary/20 flex-1 max-w-30 sm:max-w-60 origin-left"
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
        className="mt-8 max-w-4xl text-balance font-serif text-5xl leading-[1.04] tracking-tight text-foreground"
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
  const cards = gamesData.map((game, index) => (
    <Card
      key={game.id}
      card={{
        src: game.posterUrl,
        title: game.title,
        category: game.series,
        content: <GameExpandedContent game={game} />,
        hoverVideoUrl: game.videoUrl,
      }}
      index={index}
      layout
    />
  ))

  return (
    <section className="relative overflow-hidden py-4 sm:py-6">
      <div className="mx-auto w-full max-w-480">
        <div className="px-4 sm:px-8 max-w-7xl">
          <CinematicHeader />
        </div>
        <Carousel items={cards} autoScroll autoScrollInterval={2600} />
      </div>
    </section>
  )
}
