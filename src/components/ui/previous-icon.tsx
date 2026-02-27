import { forwardRef, useImperativeHandle, useCallback } from 'react'
import type { AnimatedIconHandle, AnimatedIconProps } from './types'
import { motion, useAnimate } from 'motion/react'

const PreviousIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
    (
        { size = 24, color = 'currentColor', strokeWidth = 2, className = '' },
        ref,
    ) => {
        const [scope, animate] = useAnimate()

        const start = useCallback(async () => {
            animate(
                '.clock-hand',
                { rotate: [0, -360] },
                { duration: 1, ease: 'easeInOut' },
            )
            animate(
                '.history-arrow',
                { rotate: [0, -30, 0] },
                { duration: 1, ease: 'easeInOut' },
            )
        }, [animate])

        const stop = useCallback(() => {
            animate('.clock-hand', { rotate: 0 }, { duration: 0.5, ease: 'easeOut' })
            animate('.history-arrow', { rotate: 0 }, { duration: 0.5, ease: 'easeOut' })
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
                <motion.g className="history-arrow" style={{ transformOrigin: '12px 12px' }}>
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                </motion.g>
                <motion.g className="clock-hand" style={{ transformOrigin: '12px 12px' }}>
                    <path d="M12 7v5l4 2" />
                </motion.g>
            </motion.svg>
        )
    },
)

PreviousIcon.displayName = 'PreviousIcon'
export default PreviousIcon
