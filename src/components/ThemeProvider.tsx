import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type {CSSProperties, ReactNode } from 'react';

export type ThemeMode =
  | 'normal'
  | 'sunny'
  | 'midnight'
  | 'frieren'

export interface ThemeTransitionOrigin {
  x: number
  y: number
}

const CYCLE_ORDER: Array<ThemeMode> = [
  'normal',
  'sunny',
  'midnight',
  'frieren',
]

interface ThemeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode, origin?: ThemeTransitionOrigin) => void
  cycleTheme: (origin?: ThemeTransitionOrigin) => void
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'normal',
  setMode: () => {},
  cycleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

function applyThemeAttributes(newMode: ThemeMode) {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  html.setAttribute('data-theme-mode', newMode)
  switch (newMode) {
    case 'normal':
      html.setAttribute('data-theme', 'dark')
      break
    case 'sunny':
      html.setAttribute('data-theme', 'sunny')
      break
    case 'midnight':
      html.setAttribute('data-theme', 'midnight')
      break
    case 'frieren':
      html.setAttribute('data-theme', 'frieren')
      break
  }
}

function resolveTransitionOrigin(_origin?: ThemeTransitionOrigin) {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 }
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }
}

function getTransitionRadius(origin: ThemeTransitionOrigin) {
  if (typeof window === 'undefined') {
    return 0
  }

  return Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  )
}

function applyTransitionMetadata(origin: ThemeTransitionOrigin) {
  const html = document.documentElement
  html.style.setProperty('--theme-transition-x', `${origin.x}px`)
  html.style.setProperty('--theme-transition-y', `${origin.y}px`)
  html.style.setProperty(
    '--theme-transition-radius',
    `${getTransitionRadius(origin)}px`,
  )
  html.setAttribute('data-theme-transition', 'radial')
}

function clearTransitionMetadata() {
  const html = document.documentElement
  html.removeAttribute('data-theme-transition')
  html.style.removeProperty('--theme-transition-x')
  html.style.removeProperty('--theme-transition-y')
  html.style.removeProperty('--theme-transition-radius')
}

interface ThemeTransitionState {
  key: number
  origin: ThemeTransitionOrigin
  radius: number
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('normal')
  const [transitionState, setTransitionState] =
    useState<ThemeTransitionState | null>(null)
  const transitionTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('theme-mode') as ThemeMode | null
    if (stored && CYCLE_ORDER.includes(stored)) {
      setModeState(stored)
      applyThemeAttributes(stored)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  const setMode = useCallback(
    (newMode: ThemeMode, origin?: ThemeTransitionOrigin) => {
      if (newMode === mode) return

      setModeState(newMode)
      localStorage.setItem('theme-mode', newMode)
      applyThemeAttributes(newMode)

      if (
        typeof document === 'undefined' ||
        typeof window === 'undefined' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        clearTransitionMetadata()
        setTransitionState(null)
        return
      }

      const transitionOrigin = resolveTransitionOrigin(origin)
      const radius = getTransitionRadius(transitionOrigin)
      applyTransitionMetadata(transitionOrigin)
      setTransitionState({
        key: Date.now(),
        origin: transitionOrigin,
        radius,
      })

      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current)
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        clearTransitionMetadata()
        setTransitionState(null)
        transitionTimeoutRef.current = null
      }, 700)
    },
    [mode],
  )

  const cycleTheme = useCallback((origin?: ThemeTransitionOrigin) => {
    const idx = CYCLE_ORDER.indexOf(mode)
    const next = CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length]
    setMode(next, origin)
  }, [mode, setMode])

  return (
    <ThemeContext.Provider value={{ mode, setMode, cycleTheme }}>
      {children}
      <AnimatePresence>
        {transitionState ? (
          <ThemeTransitionOverlay
            key={transitionState.key}
            origin={transitionState.origin}
            radius={transitionState.radius}
          />
        ) : null}
      </AnimatePresence>
    </ThemeContext.Provider>
  )
}

function ThemeTransitionOverlay({
  origin,
  radius,
}: {
  origin: ThemeTransitionOrigin
  radius: number
}) {
  const style = {
    '--theme-transition-x': `${origin.x}px`,
    '--theme-transition-y': `${origin.y}px`,
  } as CSSProperties

  const expandedRadius = Math.max(radius, 1)

  return (
    <motion.div
      aria-hidden
      className="theme-transition-overlay"
      style={style}
      initial={{
        opacity: 0,
        clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
        filter: 'blur(0px) saturate(1)',
      }}
      animate={{
        opacity: [0, 0.78, 0.2, 0],
        clipPath: `circle(${expandedRadius}px at ${origin.x}px ${origin.y}px)`,
        filter: ['blur(0px) saturate(1)', 'blur(0px) saturate(1)', 'blur(8px) saturate(0.96)', 'blur(20px) saturate(0.9)'],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    />
  )
}
