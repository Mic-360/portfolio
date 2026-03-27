import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export type CardStackItem = {
  id: number
  name?: string
  designation?: string
  content: React.ReactNode
}

interface CardStackProps {
  items: Array<CardStackItem>
  offset?: number
  scaleFactor?: number
  flipEveryMs?: number
  className?: string
  cardClassName?: string
}

export const CardStack = ({
  items,
  offset = 10,
  scaleFactor = 0.05,
  flipEveryMs = 5000,
  className,
  cardClassName,
}: CardStackProps) => {
  const [cards, setCards] = useState<Array<CardStackItem>>(items)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    setCards(items)
  }, [items])

  useEffect(() => {
    if (items.length <= 1) {
      return
    }

    intervalRef.current = window.setInterval(() => {
      setCards((prevCards) => {
        if (prevCards.length <= 1) {
          return prevCards
        }

        const next = [...prevCards]
        const last = next.pop()
        if (!last) {
          return prevCards
        }

        next.unshift(last)
        return next
      })
    }, flipEveryMs)

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [items.length, flipEveryMs])

  return (
    <div className={cn('relative h-96 w-full max-w-152', className)}>
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className={cn(
            'absolute inset-x-0 top-0 mx-auto flex h-88 w-full flex-col justify-between overflow-hidden shadow-xl backdrop-blur-xs',
            index === 0 ? 'pointer-events-auto' : 'pointer-events-none',
            cardClassName,
          )}
          style={{
            position: 'absolute',
            transformOrigin: 'top center',
          }}
          animate={{
            top: index * -offset,
            scale: 1 - index * scaleFactor,
            zIndex: cards.length - index,
          }}
        >
          <div className="min-h-0 flex-1 text-sm text-foreground/90">
            {card.content}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
