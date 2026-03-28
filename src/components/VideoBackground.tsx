import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from './ThemeProvider'

export function VideoBackground() {
  const { mode } = useTheme()
  const showVideo = mode === 'sunny' || mode === 'midnight'

  return (
    <AnimatePresence>
      {showVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mode === 'midnight' ? 1 : 0.75 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="fixed inset-0 z-20 overflow-hidden pointer-events-none"
          style={{ mixBlendMode: 'multiply' }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-fill"
          >
            <source src="/leaves.mp4" type="video/mp4" />
          </video>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
