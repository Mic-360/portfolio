/**
 * Mascot utility functions for positioning, timing, and behavior selection
 */

export interface PositionData {
  x: number
  y: number
  isLeftHalf: boolean
}

/**
 * Calculate safe random position within viewport
 * Avoids edges and reserved zones
 */
export function getSafeRandomPosition(
  viewportWidth: number,
  viewportHeight: number,
): PositionData {
  const EDGE_PADDING = 40
  const BOTTOM_PADDING = 80 // Reserved for floating dock
  const TOP_PADDING = 60 // Reserved for nav

  const minX = EDGE_PADDING
  const maxX = viewportWidth - EDGE_PADDING - 120 // Frieren SVG width estimate
  const minY = TOP_PADDING
  const maxY = viewportHeight - BOTTOM_PADDING - 120 // Frieren SVG height estimate

  const x = Math.random() * (maxX - minX) + minX
  const y = Math.random() * (maxY - minY) + minY

  return {
    x: Math.max(minX, Math.min(x, maxX)),
    y: Math.max(minY, Math.min(y, maxY)),
    isLeftHalf: x < viewportWidth / 2,
  }
}

/**
 * Get random interval between min and max
 */
export function getRandomInterval(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Generate unique instance ID
 */
export function generateInstanceId(): string {
  return `mascot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
