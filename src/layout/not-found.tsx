import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-6 text-center px-4"
      >
        <img
          src="/frieren/404-frieren.svg"
          alt="404"
          className="h-56 w-56 object-contain hero-blend-media"
        />
        <h1 className="font-serif text-7xl md:text-9xl font-black tracking-tighter text-foreground">
          404
        </h1>
        <p className="max-w-md text-lg text-muted-foreground/60">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-4 rounded-full border border-border/20 bg-background/50 backdrop-blur-md px-8 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-foreground hover:text-background"
        >
          Return Home
        </Link>
      </motion.div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.08)_0%,transparent_60%)] opacity-50 blur-3xl" />
    </div>
  )
}