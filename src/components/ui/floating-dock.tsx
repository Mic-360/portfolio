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
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:bg-background/88 hover:shadow-[0_10px_28px_-18px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
                  >
                    <div className="h-4 w-4">{item.icon}</div>
                  </button>
                ) : (
                  <a
                    href={item.href}
                    rel={item.rel}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:bg-background/88 hover:shadow-[0_10px_28px_-18px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
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
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/78 backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:bg-background/88 hover:shadow-[0_10px_28px_-18px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
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
        'mx-auto hidden h-16 items-end gap-4 px-4 pb-3 md:flex',
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
            className="absolute -top-8 left-1/2 w-fit rounded-md border border-border bg-popover px-2 py-0.5 text-xs whitespace-pre text-popover-foreground"
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
        className="cursor-pointer rounded-full border border-border bg-background/72 p-1 backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:bg-background/88 hover:shadow-[0_12px_30px_-18px_color-mix(in_oklab,var(--primary)_68%,transparent)]"
      >
        {content}
      </button>
    )
  }

  return (
    <a
      href={href}
      rel={rel}
      className="rounded-full border border-border bg-background/72 p-1 backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:bg-background/88 hover:shadow-[0_12px_30px_-18px_color-mix(in_oklab,var(--primary)_68%,transparent)]"
    >
      {content}
    </a>
  )
}
