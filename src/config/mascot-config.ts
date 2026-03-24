/**
 * Frieren Mascot Configuration
 * Adjust these values to fine-tune mascot behavior, timing, and audio
 */

export interface MascotConfig {
  // Spawn timing (milliseconds)
  minSpawnInterval: number
  maxSpawnInterval: number

  // Appearance duration (milliseconds)
  minDuration: number
  maxDuration: number

  // Audio & effects
  soundVolume: number // 0-1
  enableSound: boolean
  enableSpeech: boolean
  enableChaos: boolean

  // Behavior probabilities
  movementChance: number // 0-1
  gestureChance: number // 0-1
  soundChance: number // 0-1
  chaosChance: number // 0-1
  speechChance: number // 0-1

  // Animation settings
  maxSpeechBubbles: number
  zIndex: number
}

export const MASCOT_CONFIG: MascotConfig = {
  // Spawn every 3-12 seconds
  minSpawnInterval: 3000,
  maxSpawnInterval: 12000,

  // Appear for 15-30 seconds
  minDuration: 15000,
  maxDuration: 30000,

  // Audio settings
  soundVolume: 0.6,
  enableSound: true,
  enableSpeech: true,
  enableChaos: true,

  // Behavior probabilities
  movementChance: 0.6,
  gestureChance: 0.4,
  soundChance: 0.5,
  chaosChance: 0.2,
  speechChance: 0.3,

  // Animation
  maxSpeechBubbles: 2,
  zIndex: 9998, // Below any modals but above most content
}
