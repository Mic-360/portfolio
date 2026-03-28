import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from './ThemeProvider'
import type { ThemeMode } from './ThemeProvider'

const transitionColors: Record<ThemeMode, string> = {
  normal: '#111210',
  sunny: '#faf5eb',
  midnight: '#0a0a0f',
}

export function ThemeSwitcher() {
  const { mode, isTransitioning } = useTheme()

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key={mode}
          className="fixed inset-0 z-[100] pointer-events-none"
          style={{ backgroundColor: transitionColors[mode] }}
          initial={{ clipPath: 'circle(0% at 50% 100%)' }}
          animate={{ clipPath: 'circle(150% at 50% 100%)' }}
          exit={{ opacity: 0 }}
          transition={{
            clipPath: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.4, ease: 'easeOut' },
          }}
        />
      )}
    </AnimatePresence>
  )
}
