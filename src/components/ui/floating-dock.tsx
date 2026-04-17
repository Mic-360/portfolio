'use client'
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { IconLayoutNavbarCollapse } from '@tabler/icons-react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react'

import { useRef, useState } from 'react'
import type { MotionValue } from 'motion/react'
import { cn } from '@/lib/utils'

export type DockItem = {
  title: string
  icon: React.ReactNode
  href?: string
  rel?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: Array<DockItem>
  desktopClassName?: string
  mobileClassName?: string
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  )
}

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: Array<DockItem>
  className?: string
}) => {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('relative block md:hidden', className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    aria-label={item.title}
                    title={item.title}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/15 bg-background/55 backdrop-blur-2xl backdrop-saturate-150 shadow-sm shadow-black/[0.03] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-background/70"
                  >
                    <div className="h-4 w-4">{item.icon}</div>
                  </button>
                ) : (
                  <a
                    href={item.href}
                    rel={item.rel}
                    aria-label={item.title}
                    title={item.title}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/15 bg-background/55 backdrop-blur-2xl backdrop-saturate-150 shadow-sm shadow-black/[0.03] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-background/70"
                  >
                    <div className="h-4 w-4">{item.icon}</div>
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border/15 bg-background/55 shadow-lg shadow-black/[0.03] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-background/70"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  )
}

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: Array<DockItem>
  className?: string
}) => {
  const mouseX = useMotionValue(Infinity)
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'mx-auto hidden h-16 items-end gap-2 rounded-2xl border border-border/15 bg-background/55 px-3 pb-2.5 shadow-lg shadow-black/[0.03] backdrop-blur-2xl backdrop-saturate-150 md:flex',
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  )
}

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  rel,
  onClick,
}: {
  mouseX: MotionValue
  title: string
  icon: React.ReactNode
  href?: string
  rel?: string
  onClick?: DockItem['onClick']
}) {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }

    return val - bounds.x - bounds.width / 2
  })

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40])
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40])

  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  )
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  )

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  const [hovered, setHovered] = useState(false)

  const content = (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex aspect-square items-center justify-center rounded-full"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 2, x: '-50%' }}
            className="absolute -top-8 left-1/2 w-fit rounded-lg border border-border/15 bg-background/70 px-2.5 py-1 text-[11px] font-medium whitespace-pre text-foreground/80 shadow-lg shadow-black/[0.04] backdrop-blur-2xl"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ width: widthIcon, height: heightIcon }}
        className="flex items-center justify-center"
      >
        {icon}
      </motion.div>
    </motion.div>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        aria-label={title}
        title={title}
        className="cursor-pointer rounded-full p-0.5 transition-[transform,background-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:bg-foreground/[0.06]"
      >
        {content}
      </button>
    )
  }

  return (
    <a
      href={href}
      rel={rel}
      aria-label={title}
      title={title}
      className="rounded-full p-0.5 transition-[transform,background-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:bg-foreground/[0.06]"
    >
      {content}
    </a>
  )
}
