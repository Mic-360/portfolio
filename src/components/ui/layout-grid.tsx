import { cn } from '@/lib/utils'
import React, { useState } from 'react'

type LayoutGridCard = {
  id: number
  content: React.ReactNode
  className?: string
  thumbnail: string
  width?: number
  height?: number
}

export const LayoutGrid = ({
  cards,
  className,
}: {
  cards: Array<LayoutGridCard>
  className?: string
}) => {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div
      className={cn(
        'columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4',
        className,
      )}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          className={cn('mb-4 break-inside-avoid', card.className)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <div
            className={cn(
              'relative w-full overflow-hidden rounded-2xl border border-border/10 bg-card/40 transition-all duration-300 ease-out',
              hovered !== null && hovered !== i && 'scale-[0.98] blur-sm',
            )}
            style={
              card.width && card.height
                ? { aspectRatio: `${card.width} / ${card.height}` }
                : undefined
            }
          >
            <img
              src={card.thumbnail}
              alt=""
              loading="lazy"
              width={card.width}
              height={card.height}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className={cn(
                'absolute inset-0 flex flex-col justify-end bg-black/50 p-4 transition-opacity duration-300',
                hovered === i ? 'opacity-100' : 'opacity-0',
              )}
            >
              {card.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
