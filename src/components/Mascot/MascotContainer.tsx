import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { MascotInstance } from './MascotInstance'
import {
  generateInstanceId,
  getRandomInterval,
  getSafeRandomPosition,
} from '@/lib/mascot'
import { MASCOT_CONFIG } from '@/config/mascot-config'

interface ActiveMascot {
  id: string
  position: ReturnType<typeof getSafeRandomPosition>
  duration: number
}

export function MascotContainer() {
  const [activeMascot, setActiveMascot] = useState<ActiveMascot | null>(null)
  const [windowSize, setWindowSize] = useState<{
    width: number
    height: number
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // spawn timer
  useEffect(() => {
    const scheduleNextSpawn = () => {
      const interval = getRandomInterval(
        MASCOT_CONFIG.minSpawnInterval,
        MASCOT_CONFIG.maxSpawnInterval,
      )

      const timeoutId = setTimeout(() => {
        spawnMascot()
        scheduleNextSpawn()
      }, interval)

      return timeoutId
    }

    const timeoutId = scheduleNextSpawn()
    return () => clearTimeout(timeoutId)
  }, [])

  const spawnMascot = () => {
    if (activeMascot) return

    const position = getSafeRandomPosition(windowSize.width, windowSize.height)
    const duration = getRandomInterval(
      MASCOT_CONFIG.minDuration,
      MASCOT_CONFIG.maxDuration,
    )

    setActiveMascot({
      id: generateInstanceId(),
      position,
      duration,
    })
  }

  const handleMascotComplete = () => {
    setActiveMascot(null)
  }

  // Prevent hydration
  if (windowSize.width === 0) return null

  return (
    <AnimatePresence>
      {activeMascot && (
        <MascotInstance
          key={activeMascot.id}
          position={activeMascot.position}
          duration={activeMascot.duration}
          onComplete={handleMascotComplete}
        />
      )}
    </AnimatePresence>
  )
}
