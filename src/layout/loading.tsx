import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export default function GlobalPending() {
  const [progress, setProgress] = useState(10)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 250) // Increment every 250ms

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-9999 bg-background overflow-hidden font-sans text-foreground selection:bg-white selection:text-black">
      <div
        className={`relative w-full h-full p-8 flex flex-col transition-all duration-700 ease-in-out ${
          progress === 100
            ? 'items-center justify-start pt-24'
            : 'items-center justify-center'
        }`}
      >
        {/* Loader Card */}
        <motion.div
          layout
          transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
          className="bg-zinc-900 rounded-xl shadow-2xl shadow-black/40 border border-white/5 p-6 w-full max-w-md z-50 flex flex-col gap-8"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-500">
              LOADER
            </span>
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
            </div>
          </div>

          {/* Loading Bar (10 squares) */}
          <div className="flex gap-2 justify-between">
            {Array.from({ length: 10 }).map((_, i) => {
              const threshold = (i + 1) * 10
              const isActive = progress >= threshold
              return (
                <div
                  key={i}
                  className={`h-10 flex-1 rounded-md transition-colors duration-300 ${
                    isActive ? 'bg-zinc-200' : 'bg-zinc-800'
                  }`}
                />
              )
            })}
          </div>

          {/* Percentage */}
          <div className="text-right flex justify-end">
            <span className="text-5xl font-light tracking-tighter text-zinc-100 font-serif">
              {progress}%
            </span>
          </div>
        </motion.div>

        {/* USEFUL INFO Card */}
        <AnimatePresence>
          {progress >= 50 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
              className="absolute bottom-12 right-12 bg-zinc-900 rounded-xl shadow-2xl shadow-black/40 border border-white/5 p-6 w-80 flex-col gap-4 z-40 hidden md:flex"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-500">
                  USEFUL INFO
                </span>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed font-serif italic">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Right Sticker */}
        <AnimatePresence>
          {progress >= 80 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 12 }}
              animate={{ opacity: 1, scale: 1, rotate: 12 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
              className="absolute top-24 right-24 bg-zinc-900 shadow-2xl shadow-black/40 border border-white/5 p-5 w-52 text-center z-30 hidden lg:block"
            >
              <p className="font-mono text-sm font-bold uppercase tracking-tight text-zinc-100 leading-relaxed">
                WITH ❤️ FROM PUNJAB, INDIA
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Left Sticker */}
        <AnimatePresence>
          {progress >= 80 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              transition={{
                type: 'spring',
                bounce: 0.4,
                duration: 0.6,
                delay: 0.1,
              }}
              className="absolute bottom-32 left-24 bg-zinc-900 shadow-2xl shadow-black/40 border border-white/5 p-5 w-64 text-left z-30 hidden lg:block"
            >
              <p className="font-mono text-[13px] font-bold uppercase tracking-tight text-zinc-100 leading-relaxed">
                LOADERS, SHADERS, <br />
                GREAT UI/UX <br />
                COLLECTION <br />
                SEP 2025
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
