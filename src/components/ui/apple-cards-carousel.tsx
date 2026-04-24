'use client'
import { useOutsideClick } from '@/hooks/use-outside-click'
import { cn } from '@/lib/utils'
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import type { JSX } from 'react'
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

interface CarouselProps {
  items: Array<JSX.Element>
  initialScroll?: number
  autoScroll?: boolean
  autoScrollInterval?: number
}

type Card = {
  src: string
  title: string
  category: string
  content: React.ReactNode
  hoverVideoUrl?: string
}

function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void
  currentIndex: number
}>({
  onCardClose: () => {},
  currentIndex: 0,
})

export const Carousel = ({
  items,
  initialScroll = 0,
  autoScroll = false,
  autoScrollInterval = 2800,
}: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const isAutoPausedRef = useRef(false)

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll
      checkScrollability()
    }
  }, [initialScroll])

  useEffect(() => {
    if (!autoScroll) return

    const interval = window.setInterval(() => {
      const carousel = carouselRef.current
      if (!carousel || isAutoPausedRef.current) return

      const { scrollLeft, scrollWidth, clientWidth } = carousel
      const nextLeft = scrollLeft + clientWidth * 0.45
      const endThreshold = scrollWidth - clientWidth - 16

      carousel.scrollTo({
        left: nextLeft >= endThreshold ? 0 : nextLeft,
        behavior: 'smooth',
      })
    }, autoScrollInterval)

    return () => {
      window.clearInterval(interval)
    }
  }, [autoScroll, autoScrollInterval, items.length])

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth)
    }
  }

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384 // (md:w-96)
      const gap = isMobile() ? 4 : 8
      const scrollPosition = (cardWidth + gap) * (index + 1)
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      })
      setCurrentIndex(index)
    }
  }

  const isMobile = () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return window && window.innerWidth < 768
  }

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
          ref={carouselRef}
          onScroll={checkScrollability}
          onMouseEnter={() => {
            isAutoPausedRef.current = true
          }}
          onMouseLeave={() => {
            isAutoPausedRef.current = false
          }}
          onTouchStart={() => {
            isAutoPausedRef.current = true
          }}
          onTouchEnd={() => {
            isAutoPausedRef.current = false
          }}
        >
          <div
            className={cn(
              'absolute right-0 z-1000 h-auto w-[5%] overflow-hidden bg-linear-to-l',
            )}
          ></div>

          <div
            className={cn(
              'flex flex-row justify-start gap-4 pl-4',
              'mx-auto max-w-7xl', // remove max-w-4xl if you want the carousel to span the full width of its container
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: 'easeOut',
                  },
                }}
                key={'card' + index}
                className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mr-10 flex justify-end gap-2">
          <button
            aria-label="Scroll carousel left"
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <button
            aria-label="Scroll carousel right"
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  )
}

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: Card
  index: number
  layout?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [canHoverPreview, setCanHoverPreview] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { onCardClose } = useContext(CarouselContext)
  const youtubeId = card.hoverVideoUrl ? getYoutubeId(card.hoverVideoUrl) : null

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const updateCanHoverPreview = () => {
      setCanHoverPreview(mediaQuery.matches)
    }

    updateCanHoverPreview()

    mediaQuery.addEventListener('change', updateCanHoverPreview)
    return () => {
      mediaQuery.removeEventListener('change', updateCanHoverPreview)
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  useOutsideClick(containerRef, () => handleClose())

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    onCardClose(index)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-60 mx-auto my-10 h-fit max-w-5xl rounded-3xl bg-white p-4 font-sans md:p-10 dark:bg-neutral-900"
            >
              <button
                className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white"
                onClick={handleClose}
              >
                <IconX className="h-6 w-6 text-neutral-100 dark:text-neutral-900" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-base font-medium text-black dark:text-white"
              >
                {card.category}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className="mt-4 text-2xl font-semibold text-neutral-700 md:text-5xl dark:text-white"
              >
                {card.title}
              </motion.p>
              <div className="py-10">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className="relative z-10 flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-100 md:h-160 md:w-96 dark:bg-neutral-900"
      >
        {card.hoverVideoUrl && isHovered && canHoverPreview ? (
          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
            {youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0`}
                className="absolute inset-0 h-[140%] w-[140%] -translate-x-[12%] -translate-y-[12%] scale-105 object-cover"
                allow="autoplay; encrypted-media"
                tabIndex={-1}
              />
            ) : (
              <video
                src={card.hoverVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-contain"
              />
            )}
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-0 z-30 bg-linear-to-b from-black via-black/30 to-black/60" />
        <div className="relative z-40 p-8">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-left font-sans text-sm font-medium md:text-base"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="mt-2 max-w-xs text-left font-sans text-xl font-semibold text-balance md:text-3xl"
          >
            {card.title}
          </motion.p>
        </div>
        <BlurImage
          src={card.src}
          alt={card.title}
          className="absolute inset-0 z-10 object-cover"
        />
      </motion.button>
    </>
  )
}

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: {
  height?: number
  width?: number
  src: string
  className?: string
  alt?: string
}) => {
  const [isLoading, setLoading] = useState(true)
  return (
    <img
      className={cn(
        'h-full w-full transition duration-300',
        isLoading ? 'blur-sm' : 'blur-0',
        className,
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      alt={alt ? alt : 'Background of a Game Card'}
      {...rest}
    />
  )
}
