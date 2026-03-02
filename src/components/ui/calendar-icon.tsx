import { forwardRef, useCallback, useImperativeHandle } from 'react'
import { motion, useAnimate } from 'motion/react'
import type { AnimatedIconHandle, AnimatedIconProps } from './types'

const CalendarIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
    (
        { size = 24, color = 'currentColor', strokeWidth = 2, className = '' },
        ref,
    ) => {
        const [scope, animate] = useAnimate()

        const start = useCallback(async () => {
            await animate(
                '.calendar-header',
                { y: -2 },
                { duration: 0.2, ease: 'easeOut' },
            )
            await animate(
                '.calendar-header',
                { y: 0 },
                { duration: 0.2, ease: 'easeIn' },
            )
        }, [animate])

        const stop = useCallback(() => {
            animate(
                '.calendar-header',
                { y: 0 },
                { duration: 0.2, ease: 'easeInOut' },
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
                onHoverStart={start}
                onHoverEnd={stop}
            >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <motion.g className="calendar-header">
                    <path d="M16 2v4" />
                    <path d="M8 2v4" />
                    <path d="M3 10h18" />
                </motion.g>
            </motion.svg>
        )
    },
)

CalendarIcon.displayName = 'CalendarIcon'
export default CalendarIcon
