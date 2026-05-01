'use client'

import { motion } from 'motion/react'
import * as React from 'react'

import { useOutsideClick } from '@/hooks/use-outside-click'
import { cn } from '@/lib/utils'

export interface HoverExpandItem {
  label: string
  sublabel?: string
  image: string
  imageAlt?: string
  description?: string
  details?: React.ReactNode
  action?: React.ReactNode
}

export interface HoverExpandProps {
  items: HoverExpandItem[]
  collapsedHeight?: number
  expandedHeight?: number
  className?: string
  enableTouchExpand?: boolean
}

export function HoverExpand({
  items,
  collapsedHeight = 68,
  expandedHeight = 320,
  className,
  enableTouchExpand = true,
}: HoverExpandProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [supportsHover, setSupportsHover] = React.useState(false)
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return
    }

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')

    const updateSupportsHover = () => {
      const nextSupportsHover = mediaQuery.matches

      setSupportsHover(nextSupportsHover)

      if (nextSupportsHover) {
        setSelectedIndex(null)
        return
      }

      setHoveredIndex(null)
    }

    updateSupportsHover()
    mediaQuery.addEventListener('change', updateSupportsHover)

    return () => mediaQuery.removeEventListener('change', updateSupportsHover)
  }, [])

  useOutsideClick(containerRef, () => {
    if (!supportsHover) {
      setSelectedIndex(null)
    }
  })

  const activeIndex = supportsHover ? hoveredIndex : selectedIndex

  return (
    <div ref={containerRef} className={cn('flex w-full flex-col', className)}>
      <div className="w-full border-t border-current opacity-15" />

      {items.map((item, i) => {
        const isExpanded = activeIndex === i
        const isMuted = activeIndex !== null && !isExpanded

        return (
          <React.Fragment key={`${item.label}-${i}`}>
            <motion.div
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-label={
                item.sublabel ? `${item.label}, ${item.sublabel}` : item.label
              }
              data-expanded={isExpanded}
              className={cn(
                'group/hover-expand relative w-full overflow-hidden text-left outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary/60',
                supportsHover || enableTouchExpand
                  ? 'cursor-pointer'
                  : 'cursor-default',
              )}
              animate={{
                height: isExpanded ? expandedHeight : collapsedHeight,
                opacity: isMuted ? 0.42 : 1,
              }}
              transition={{
                height: {
                  type: 'spring',
                  stiffness: 280,
                  damping: 32,
                  mass: 0.9,
                },
                opacity: { duration: 0.22, ease: 'easeOut' },
              }}
              onMouseEnter={() => {
                if (supportsHover) {
                  setHoveredIndex(i)
                }
              }}
              onMouseLeave={() => {
                if (supportsHover) {
                  setHoveredIndex(null)
                }
              }}
              onClick={() => {
                if (!supportsHover && enableTouchExpand) {
                  setSelectedIndex((current) => (current === i ? null : i))
                }
              }}
              onKeyDown={(event) => {
                if (event.currentTarget !== event.target) {
                  return
                }

                if (event.key === 'Escape') {
                  event.preventDefault()
                  setHoveredIndex(null)
                  setSelectedIndex(null)
                  return
                }

                if (event.key !== 'Enter' && event.key !== ' ') {
                  return
                }

                event.preventDefault()

                if (supportsHover) {
                  setHoveredIndex((current) => (current === i ? null : i))
                  return
                }

                if (enableTouchExpand) {
                  setSelectedIndex((current) => (current === i ? null : i))
                }
              }}
            >
              <motion.div
                className="absolute inset-0 h-full w-full"
                initial={false}
                animate={{
                  opacity: isExpanded ? 1 : 0.08,
                  scale: isExpanded ? 1 : 1.04,
                }}
                transition={{
                  opacity: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
                  scale: { duration: 0.55, ease: [0.23, 1, 0.32, 1] },
                }}
              >
                <img
                  src={item.image}
                  alt={item.imageAlt ?? item.label}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/72 to-background/28" />
                <div className="absolute inset-0 bg-linear-to-t from-black/78 via-black/20 to-transparent" />
              </motion.div>

              <div className="absolute inset-0 flex h-full flex-col justify-between px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center justify-between gap-3">
                  <motion.span
                    className="text-xs tabular-nums text-primary"
                    animate={{
                      opacity: isExpanded ? 0.75 : 0.45,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </motion.span>

                  {item.sublabel ? (
                    <motion.span
                      className="text-[10px] uppercase tracking-[0.28em] text-primary sm:text-xs"
                      animate={{ opacity: isExpanded ? 1 : 0.55 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.sublabel}
                    </motion.span>
                  ) : null}
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  <motion.h3
                    className="max-w-3xl font-serif tracking-tight text-foreground"
                    style={{ fontSize: 'clamp(1.35rem, 3vw, 2.75rem)' }}
                    animate={{ y: isExpanded ? 0 : 6 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {item.label}
                  </motion.h3>

                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isExpanded ? 1 : 0,
                      y: isExpanded ? 0 : 12,
                      filter: isExpanded ? 'blur(0px)' : 'blur(6px)',
                    }}
                    transition={{
                      duration: 0.32,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    className={cn(
                      'grid gap-3 overflow-hidden',
                      isExpanded
                        ? 'pointer-events-auto'
                        : 'pointer-events-none',
                    )}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      {item.details ? item.details : null}

                      {item.action ? (
                        <div
                          className="pt-1"
                          onClick={(event) => event.stopPropagation()}
                          onMouseDown={(event) => event.stopPropagation()}
                        >
                          {item.action}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <div className="w-full border-t border-current opacity-15" />
          </React.Fragment>
        )
      })}
    </div>
  )
}
