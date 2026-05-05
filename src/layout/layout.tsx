import { motion, type Variants } from 'motion/react'
import React from 'react'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  variants?: Variants
}

/**
 * Standard page variants used across the portfolio for consistent entrance animations.
 */
export const PAGE_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

export const PAGE_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
}

/**
 * PageLayout provides consistent padding, maximum width, and entrance animations
 * for top-level archive and index pages (Projects, Blog, Certificates, Pinterest).
 */
export function PageLayout({
  children,
  className = '',
  variants = PAGE_CONTAINER_VARIANTS,
}: PageLayoutProps) {
  return (
    <motion.section
      variants={variants}
      initial="hidden"
      animate="show"
      className={`mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 flex flex-col gap-16 ${className}`}
    >
      {children}
    </motion.section>
  )
}
