import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { PositionData } from '@/lib/mascot'
import { MASCOT_CONFIG } from '@/config/mascot-config'
import { generateInstanceId } from '@/lib/mascot'

const SVG_OPTIONS = ['frieren.svg', 'fern.svg', 'frienbook.svg', 'party.svg', 'team.svg']

export interface MascotInstanceProps {
  position: PositionData
  duration: number
  onComplete: () => void
}

export function MascotInstance({
  position,
  duration,
  onComplete,
}: MascotInstanceProps) {
  const [instanceId] = useState(() => generateInstanceId())
  const [selectedSvg] = useState(() => SVG_OPTIONS[Math.floor(Math.random() * SVG_OPTIONS.length)])

  // Auto-dismiss
  useEffect(() => {
    const dismissTimeout = setTimeout(onComplete, duration)
    return () => clearTimeout(dismissTimeout)
  }, [duration, onComplete])

  const containerVariants = {
    enter: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  return (
    <motion.div
      key={instanceId}
      className="fixed pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: MASCOT_CONFIG.zIndex,
      }}
      variants={containerVariants}
      initial="enter"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-40 h-40">
        <img
          src={`/frieren/${selectedSvg}`}
          alt="Mascot"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
    </motion.div>
  )
}
