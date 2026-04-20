'use client'

import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

export type ExpandableCardItem = {
  id: string
  slug: string
  title: string
  summary: string
  date: string
  image: string
  eyebrow: string
  tags: Array<string>
  featured?: boolean
}

type ExpandableCardProps = {
  items: Array<ExpandableCardItem>
  formatMeta?: (item: ExpandableCardItem) => string
  className?: string
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [locked])
}

export function ExpandableCard({
  items,
  formatMeta,
  className,
}: ExpandableCardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const id = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [activeId, items],
  )

  useBodyScrollLock(Boolean(activeItem))

  useEffect(() => {
    if (!activeItem) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveId(null)
      }
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (!dialogRef.current || dialogRef.current.contains(target)) return
      setActiveId(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [activeItem])

  return (
    <>
      <div
        className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}
      >
        {items.map((item, index) => {
          const meta = formatMeta ? formatMeta(item) : item.date

          return (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 1,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              layoutId={`expandable-card-${item.id}-${id}`}
              onClick={() => setActiveId(item.id)}
              className={cn(
                'group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-4xl border border-white/10 bg-background/45 text-left shadow-2xl backdrop-blur-3xl transition-colors duration-500 hover:border-primary/25 hover:bg-background/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                item.featured && 'sm:col-span-2 lg:col-span-2',
              )}
            >
              <motion.div
                layoutId={`expandable-card-image-${item.id}-${id}`}
                className={cn(
                  'relative overflow-hidden border-b border-white/8',
                  item.featured ? 'aspect-16/8 sm:aspect-16/7' : 'aspect-4/3',
                )}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/15 to-transparent opacity-90" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 p-5 text-[10px] uppercase tracking-[0.24em] text-white/65 sm:p-6">
                  <span>{item.eyebrow}</span>
                  <span>{meta}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <motion.h3
                    layoutId={`expandable-card-title-${item.id}-${id}`}
                    className={cn(
                      'max-w-3xl font-serif leading-[1.02] tracking-tight text-white transition-colors duration-300 group-hover:text-primary-foreground',
                      item.featured ? 'text-2xl sm:text-3xl' : 'text-xl',
                    )}
                  >
                    {item.title}
                  </motion.h3>
                </div>
              </motion.div>

              <div
                className={cn(
                  'flex flex-1 flex-col justify-between gap-5 p-5 sm:p-6',
                  item.featured && 'sm:flex-row sm:items-end sm:gap-10',
                )}
              >
                <motion.p
                  layoutId={`expandable-card-summary-${item.id}-${id}`}
                  className={cn(
                    'max-w-2xl text-sm leading-7 text-foreground/62',
                    item.featured ? 'sm:text-base' : 'line-clamp-3',
                  )}
                >
                  {item.summary}
                </motion.p>

                <div className="flex items-center justify-between gap-4 border-t border-border/8 pt-3 sm:min-w-44 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
                  {item.tags.length > 0 ? (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/34">
                      {item.tags.slice(0, item.featured ? 4 : 3).join(' · ')}
                    </p>
                  ) : (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/24">
                      open note
                    </span>
                  )}
                  <span className="text-xs text-primary/60 transition-transform duration-300 group-hover:translate-x-1">
                    expand ↗
                  </span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {activeItem
        ? createPortal(
            <AnimatePresence>
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-80 bg-background/75 backdrop-blur-xl"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 18 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-0 z-90 flex items-center justify-center"
                  style={{
                    paddingTop: 'max(1rem, env(safe-area-inset-top))',
                    paddingRight: 'max(1rem, env(safe-area-inset-right))',
                    paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                    paddingLeft: 'max(1rem, env(safe-area-inset-left))',
                  }}
                >
                  <div className="flex h-full w-full items-center justify-center px-0 sm:px-4">
                    <motion.div
                      ref={dialogRef}
                      className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-4xl border border-white/10 bg-background/92 shadow-[0_40px_120px_rgb(0_0_0_/0.4)] max-h-[70svh] md:max-h-[70vh]"
                    >
                      <div className="relative h-[24svh] min-h-44 shrink-0 overflow-hidden sm:h-[28vh]">
                        <img
                          src={activeItem.image}
                          alt={activeItem.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-black/10" />
                        <button
                          type="button"
                          onClick={() => setActiveId(null)}
                          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-background/55 text-foreground backdrop-blur-md transition-colors hover:border-primary/40 hover:text-primary"
                          aria-label="Close expanded card"
                        >
                          <CloseIcon />
                        </button>
                        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:gap-4 sm:p-8 lg:p-10">
                          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-white/68">
                            <span>{activeItem.eyebrow}</span>
                            <span className="h-px w-8 bg-white/20" />
                            <span>
                              {formatMeta
                                ? formatMeta(activeItem)
                                : activeItem.date}
                            </span>
                          </div>
                          <h3 className="max-w-4xl font-serif text-2xl leading-none tracking-tight text-white sm:text-4xl lg:text-5xl">
                            {activeItem.title}
                          </h3>
                        </div>
                      </div>

                      <div className="grid min-h-0 flex-1 gap-8 overflow-y-auto p-5 sm:p-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)] lg:p-10">
                        <div className="grid content-start gap-6">
                          <p className="max-w-3xl text-base leading-8 text-foreground/74 sm:text-lg">
                            {activeItem.summary}
                          </p>

                          <div className="grid gap-3 text-sm leading-7 text-foreground/58">
                            <p>
                              Open the full post for the complete build notes,
                              code, and sharper edges than this preview can
                              reasonably fit.
                            </p>
                            <p>
                              The expanded view is for context. The article is
                              where the good stuff lives.
                            </p>
                          </div>
                        </div>

                        <div className="grid content-start gap-6 border-t border-border/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                          <div className="grid gap-2">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/55">
                              filed under
                            </p>
                            <p className="text-sm leading-7 text-foreground/72">
                              {activeItem.eyebrow}
                            </p>
                          </div>

                          {activeItem.tags.length > 0 ? (
                            <div className="grid gap-3">
                              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/55">
                                tags
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {activeItem.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full border border-border/12 bg-primary/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground/68"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          <div className="grid gap-3 pt-2">
                            <Link
                              to="/blog/$slug"
                              params={{ slug: activeItem.slug }}
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors duration-300 hover:bg-primary"
                            >
                              Read article
                              <span>→</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => setActiveId(null)}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-border/18 px-6 py-3 text-sm font-medium text-foreground/78 transition-colors duration-300 hover:border-primary/35 hover:text-primary"
                            >
                              Back to notes
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </>
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  )
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
