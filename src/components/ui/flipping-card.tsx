import React from 'react'

import { cn } from '@/lib/utils'

interface FlippingCardProps {
  className?: string
  height?: number
  width?: number
  frontContent?: React.ReactNode
  backContent?: React.ReactNode
}

export function FlippingCard({
  className,
  frontContent,
  backContent,
  height = 300,
  width = 350,
}: FlippingCardProps) {
  return (
    <div
      className="group/flipping-card perspective-[1000px]"
      style={
        {
          '--height': `${height}px`,
          '--width': `${width}px`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          'relative rounded-xl border border-neutral-200 bg-white shadow-lg transition-all duration-700 transform-3d group-hover/flipping-card:transform-[rotateY(180deg)] dark:border-neutral-800 dark:bg-neutral-950',
          'h-(--height) w-(--width)',
          className,
        )}
      >
        {/* Front Face */}
        <div className="absolute inset-0 h-full w-full transform-[rotateY(0deg)] rounded-[inherit] backface-hidden transform-3d overflow-hidden bg-card-foreground">
          <div className="h-full w-full transform-[translateZ(70px)_scale(.98)] rounded-[inherit]">
            {frontContent}
          </div>
        </div>
        {/* Back Face */}
        <div className="absolute inset-0 h-full w-full transform-[rotateY(180deg)] rounded-[inherit] backface-hidden transform-3d overflow-hidden bg-card-foreground dark:bg-card-background">
          <div className="h-full w-full transform-[translateZ(70px)_scale(.98)] rounded-[inherit]">
            {backContent}
          </div>
        </div>
      </div>
    </div>
  )
}
