import { motion } from 'motion/react'

export default function AnimusGrid() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none">
      {/* Base Grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--primary)/0.03)_1px,transparent_1px)] bg-size-[40px_40px]"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, black, transparent)',
        }}
      />

      {/* DNA Helix / Data Stream Effect (Simulated with floating particles) */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            initial={{
              x:
                Math.random() *
                (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y:
                Math.random() *
                (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * -100],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(var(--background)/0.8)_100%)]" />
    </div>
  )
}
