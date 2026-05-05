import { ErrorComponentProps, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'

export default function GlobalError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex max-w-lg flex-col items-center gap-6 text-center px-4"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <svg
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={reset}
            className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-all hover:bg-primary"
          >
            Try Again
          </button>
          <Link
            to="/"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
          >
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
