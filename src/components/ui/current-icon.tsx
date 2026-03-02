import { motion, useAnimate } from 'motion/react'
import { forwardRef, useCallback, useImperativeHandle } from 'react'
import type { AnimatedIconHandle, AnimatedIconProps } from './types'

const CurrentIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = 'currentColor', strokeWidth = 2, className = '' },
    ref,
  ) => {
    const [scope, animate] = useAnimate()

    const start = useCallback(() => {
      animate(
        '.pin-group',
        { y: [0, -4, 0] },
        { duration: 0.5, ease: 'easeInOut' },
      )
      animate(
        '.pin-shadow',
        { scale: [1, 0.6, 1], opacity: [0.5, 0.2, 0.5] },
        { duration: 0.5, ease: 'easeInOut' },
      )
    }, [animate])

    const stop = useCallback(() => {
      animate('.pin-group', { y: 0 }, { duration: 0.3, ease: 'easeOut' })
      animate(
        '.pin-shadow',
        { scale: 1, opacity: 0 },
        { duration: 0.3, ease: 'easeOut' },
      )
    }, [animate])

    useImperativeHandle(ref, () => ({
      startAnimation: start,
      stopAnimation: stop,
    }))

    return (
      <motion.svg
        ref={scope}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cursor-pointer ${className}`}
        style={{ overflow: 'visible' }}
        onHoverStart={start}
        onHoverEnd={stop}
      >
        <motion.ellipse
          className="pin-shadow"
          cx="12"
          cy="21"
          rx="4"
          ry="1.5"
          fill={color}
          stroke={color}
          initial={{ opacity: 0 }}
        />
        <motion.g className="pin-group">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </motion.g>
      </motion.svg>
    )
  },
)

CurrentIcon.displayName = 'CurrentIcon'
export default CurrentIcon
