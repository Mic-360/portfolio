import { motion, useAnimate } from 'motion/react'
import { forwardRef, useCallback, useImperativeHandle } from 'react'
import type { AnimatedIconHandle, AnimatedIconProps } from './types'

const HealthstatIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = 'currentColor', strokeWidth = 2, className = '' },
    ref,
  ) => {
    const [scope, animate] = useAnimate()

    const start = useCallback(() => {
      animate(
        '.heart-icon',
        { scale: [1, 1.2, 1, 1.15, 1] },
        { duration: 0.6, ease: 'easeInOut' },
      )
    }, [animate])

    const stop = useCallback(() => {
      animate('.heart-icon', { scale: 1 }, { duration: 0.3, ease: 'easeOut' })
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
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cursor-pointer ${className}`}
        style={{ overflow: 'visible' }}
        onHoverStart={start}
        onHoverEnd={stop}
      >
        <motion.path
          className="heart-icon"
          d="M19.5 12.572l-7.5 7.428l-7.5-7.428a5 5 0 1 1 7.5-6.566a5 5 0 1 1 7.5 6.572"
          style={{ transformOrigin: 'center' }}
        />
      </motion.svg>
    )
  },
)

HealthstatIcon.displayName = 'HealthstatIcon'
export default HealthstatIcon
