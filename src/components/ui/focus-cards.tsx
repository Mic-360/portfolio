import { cn } from '@/lib/utils'
import React, { useState } from 'react'

type FocusCard = {
  title: string
  src: string
}

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    overlay,
  }: {
    card: FocusCard
    index: number
    hovered: number | null
    setHovered: React.Dispatch<React.SetStateAction<number | null>>
    overlay?: React.ReactNode
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/10 bg-card/40 h-60 md:h-96 w-full transition-all duration-300 ease-out',
        hovered !== null && hovered !== index && 'blur-sm scale-[0.98]',
      )}
    >
      <img
        src={card.src}
        alt={card.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-end bg-black/50 p-4 transition-opacity duration-300',
          hovered === index ? 'opacity-100' : 'opacity-0',
        )}
      >
        {overlay ?? (
          <p className="text-lg font-medium tracking-tight text-white md:text-xl">
            {card.title}
          </p>
        )}
      </div>
    </div>
  ),
)

Card.displayName = 'Card'

export function FocusCards({
  cards,
  className,
  renderOverlay,
}: {
  cards: Array<FocusCard>
  className?: string
  renderOverlay?: (card: FocusCard, index: number) => React.ReactNode
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full',
        className,
      )}
    >
      {cards.map((card, index) => (
        <Card
          key={card.title + index}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          overlay={renderOverlay?.(card, index)}
        />
      ))}
    </div>
  )
}
