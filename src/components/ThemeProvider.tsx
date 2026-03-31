import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'

export type ThemeMode =
  | 'normal'
  | 'sunny'
  | 'midnight'
  | 'autumn'
  | 'frieren'

const CYCLE_ORDER: Array<ThemeMode> = [
  'normal',
  'sunny',
  'midnight',
  'autumn',
  'frieren',
]

interface ThemeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  cycleTheme: () => void
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
    case 'autumn':
      html.setAttribute('data-theme', 'sunny')
      break
    case 'frieren':
      html.setAttribute('data-theme', 'frieren')
      break
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('normal')

  useEffect(() => {
    const stored = localStorage.getItem('theme-mode') as ThemeMode | null
    if (stored && CYCLE_ORDER.includes(stored)) {
      setModeState(stored)
      applyThemeAttributes(stored)
    }
  }, [])

  const setMode = useCallback(
    (newMode: ThemeMode) => {
      if (newMode === mode) return
      setModeState(newMode)
      localStorage.setItem('theme-mode', newMode)
      applyThemeAttributes(newMode)
    },
    [mode],
  )

  const cycleTheme = useCallback(() => {
    const idx = CYCLE_ORDER.indexOf(mode)
    const next = CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length]
    setMode(next)
  }, [mode, setMode])

  return (
    <ThemeContext.Provider value={{ mode, setMode, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
