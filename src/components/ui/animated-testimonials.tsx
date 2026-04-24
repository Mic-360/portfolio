import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'

import { siteMeta } from '@/config/site-data'
import { useEffect, useState } from 'react'
import { LinkPreview } from './link-preview'

type Testimonial = {
  quote: string
  name: string
  designation: string
  src: string
}
export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  className,
}: {
  testimonials: Array<Testimonial>
  autoplay?: boolean
  className?: string
}) => {
  const [active, setActive] = useState(0)

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length)
  }

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const isActive = (index: number) => {
    return index === active
  }

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000)
      return () => clearInterval(interval)
    }
  }, [autoplay])

  const getStableRotate = (index: number) => {
    return ((index * 7 + 3) % 21) - 10
  }
  return (
    <div
      className={
        className ??
        'mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12'
      }
    >
      <div className="relative grid md:grid-cols-[0.45fr_0.55fr] items-center gap-6">
        <div className="relative h-52 w-full sm:h-64">
          <AnimatePresence>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.src}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  z: -100,
                  rotate: getStableRotate(index),
                }}
                animate={{
                  opacity: isActive(index) ? 1 : 0.7,
                  scale: isActive(index) ? 1 : 0.95,
                  z: isActive(index) ? 0 : -100,
                  rotate: isActive(index) ? 0 : getStableRotate(index),
                  zIndex: isActive(index)
                    ? 40
                    : testimonials.length + 2 - index,
                  y: isActive(index) ? [0, -80, 0] : 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  z: 100,
                  rotate: getStableRotate(index),
                }}
                transition={{
                  duration: 0.4,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 origin-bottom"
              >
                <img
                  src={testimonial.src}
                  alt={testimonial.name}
                  width={500}
                  height={500}
                  loading="lazy"
                  decoding="async"
                  draggable={true}
                  data-backlight="off"
                  className="h-full w-full rounded-2xl object-contain object-center bg-foreground/5 p-3"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex flex-col h-full justify-between gap-5 py-4">
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut',
            }}
          >
            <h3 className="font-serif text-base leading-tight tracking-tight text-foreground">
              {testimonials[active].name}
            </h3>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-primary/50">
              {testimonials[active].designation}
            </p>
            <motion.p className="mt-4 text-xs leading-relaxed text-muted-foreground/60">
              {testimonials[active].quote.split(' ').map((word, index) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: 'blur(10px)',
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: 'blur(0px)',
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: 'easeInOut',
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="group/button flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-background/60 backdrop-blur-sm transition-colors hover:bg-background/80"
            >
              <IconArrowLeft className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover/button:rotate-12" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next testimonial"
              className="group/button flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-background/60 backdrop-blur-sm transition-colors hover:bg-background/80"
            >
              <IconArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover/button:-rotate-12" />
            </button>
            <span className="ml-auto text-[10px] tabular-nums tracking-[0.2em] text-muted-foreground/30">
              {String(active + 1).padStart(2, '0')}/
              {String(testimonials.length).padStart(2, '0')}
            </span>
            <LinkPreview
              url={siteMeta.baseUrl + '/certificates'}
              className="text-xs text-muted-foreground/70 transition-colors duration-300 hover:text-primary"
            >
              all credentials <span>&rarr;</span>
            </LinkPreview>
          </div>
        </div>
      </div>
    </div>
  )
}
