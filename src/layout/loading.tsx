import { motion } from 'motion/react'

export default function GlobalPending() {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative overflow-hidden px-4">
          <h1 className="font-serif text-5xl font-black tracking-tighter text-muted-foreground/20 sm:text-7xl">
            Loading
          </h1>
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
            className="absolute inset-0 z-10 w-full bg-linear-to-r from-transparent via-foreground to-transparent opacity-80 mix-blend-overlay"
            style={{ WebkitMaskImage: 'linear-gradient(white, white)' }}
          />
          <h1 className="absolute top-full left-0 font-serif text-5xl font-black tracking-tighter text-muted-foreground/10 sm:text-7xl scale-y-[-1] opacity-30 blur-[2px]">
            Loading
          </h1>
        </div>

        <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: 'easeInOut',
            }}
            className="h-full w-1/2 bg-primary"
          />
        </div>
      </div>
    </div>
  )
}