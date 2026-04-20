import { motion, useInView, useScroll, useSpring } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import type { MotionValue } from 'motion/react'

import { previousRoles } from '@/config/site-data'

const APPLE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// F1 Track inspired sharper paths
const MOBILE_PATH =
  'M50,560 L50,470 C50,440 250,440 250,410 L250,280 C250,250 50,250 50,220 L50,90 C50,60 150,60 150,20'
const DESKTOP_PATH =
  'M40,160 L140,160 C180,160 200,40 240,40 L380,40 C420,40 440,160 480,160 L620,160 C660,160 680,40 720,40 L860,40 C900,40 920,160 960,160'

const MOBILE_CPS = [
  { cx: 50, cy: 440 },
  { cx: 250, cy: 250 },
  { cx: 50, cy: 90 },
]

const DESKTOP_CPS = [
  { cx: 240, cy: 40 },
  { cx: 480, cy: 160 },
  { cx: 720, cy: 40 },
]

function RoleCard({
  role,
  index,
  active,
  isRight,
  style,
}: {
  role: (typeof previousRoles)[number]
  index: number
  active: boolean
  isRight?: boolean
  style: React.CSSProperties
}) {
  return (
    <motion.a
      href={role.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16, filter: 'blur(10px)', scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        delay: 0.1 + index * 0.1,
        duration: 0.8,
        ease: APPLE_EASE,
      }}
      whileHover={{
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      className={`group/role absolute z-20 ${isRight ? 'text-right' : ''}`}
      style={style}
    >
      <motion.div
        animate={
          active
            ? {
                borderColor:
                  'color-mix(in oklab, var(--primary) 80%, transparent)',
                boxShadow:
                  '0 0 0 1px color-mix(in oklab, var(--primary) 30%, transparent), 0 20px 40px -10px color-mix(in oklab, var(--primary) 25%, transparent)',
              }
            : {
                borderColor:
                  'color-mix(in oklab, var(--border) 10%, transparent)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }
        }
        transition={{ duration: 0.5, ease: APPLE_EASE }}
        className="relative overflow-hidden rounded-[20px] border bg-background/50 p-4 backdrop-blur-3xl will-change-transform sm:w-64"
      >
        <div className="absolute top-0 right-0 p-2 opacity-10 font-mono text-5xl font-bold italic tracking-tighter mix-blend-overlay pointer-events-none">
          S{index + 1}
        </div>

        {/* Curbs accent */}
        <div
          className="absolute top-0 left-0 w-full h-1"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--primary) 0, var(--primary) 10px, transparent 10px, transparent 20px)',
            opacity: active ? 0.8 : 0.1,
            transition: 'opacity 0.5s ease',
          }}
        />

        <div
          className={`relative mt-2 flex items-start gap-4 ${isRight ? 'flex-row-reverse' : ''}`}
        >
          {role.icon && (
            <div className="relative shrink-0 overflow-hidden rounded-[14px] bg-white ring-1 ring-black/5 dark:ring-white/10">
              <img
                src={role.icon}
                alt={role.company}
                loading="lazy"
                className="h-10 w-10 object-contain p-1 mix-blend-luminosity opacity-80 transition-all duration-500 group-hover/role:mix-blend-normal group-hover/role:opacity-100"
              />
            </div>
          )}
          <div
            className={`flex flex-col min-w-0 ${isRight ? 'items-end' : ''}`}
          >
            <span className="font-serif text-lg tracking-tight text-foreground transition-colors duration-300 group-hover/role:text-primary truncate font-semibold">
              {role.company}
            </span>
            <span className="text-xs text-foreground/60 font-medium">
              {role.role}
            </span>
            <div
              className={`mt-3 grid grid-cols-2 gap-2 text-[10px] w-full ${isRight ? '' : ''}`}
            >
              <div
                className={`flex flex-col border-border/10 ${isRight ? 'text-right border-l pl-2' : 'border-r pr-2'}`}
              >
                <span className="text-muted-foreground/50 uppercase tracking-[0.2em] mb-0.5">
                  Time
                </span>
                <span className="font-mono font-bold text-primary/80 tabular-nums">
                  {role.duration}
                </span>
              </div>
              <div className={`flex flex-col ${isRight ? 'text-right' : ''}`}>
                <span className="text-muted-foreground/50 uppercase tracking-[0.2em] mb-0.5">
                  Loc
                </span>
                <span className="font-medium text-foreground/70 uppercase tracking-widest truncate">
                  {role.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.a>
  )
}

function TrackSVG({
  viewBox,
  path,
  checkpoints,
  activeCheckpoint,
  className,
  pathProgress,
}: {
  viewBox: string
  path: string
  checkpoints: Array<{ cx: number; cy: number }>
  activeCheckpoint: number
  className?: string
  pathProgress: MotionValue<number>
}) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="track-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main Track Silhouette */}
      <path
        d={path}
        stroke="var(--foreground)"
        strokeWidth="12"
        strokeOpacity="0.03"
        strokeLinejoin="bevel"
      />
      <path
        d={path}
        stroke="var(--foreground)"
        strokeWidth="1"
        strokeOpacity="0.1"
        strokeDasharray="4 8"
        strokeLinejoin="bevel"
      />

      {/* Animated Racing Line */}
      <motion.path
        d={path}
        stroke="url(#track-grad)"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="bevel"
        style={{ pathLength: pathProgress }}
      />

      {/* Apex points */}
      {checkpoints.map((cp, i) => (
        <g key={i}>
          <motion.rect
            x={cp.cx - 4}
            y={cp.cy - 4}
            width="8"
            height="8"
            fill={
              activeCheckpoint === i ? 'var(--primary)' : 'var(--background)'
            }
            stroke="var(--primary)"
            strokeWidth="1.5"
            transform={`rotate(45 ${cp.cx} ${cp.cy})`}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
              delay: 0.5 + i * 0.1,
            }}
          />
          {activeCheckpoint === i && (
            <motion.rect
              x={cp.cx - 12}
              y={cp.cy - 12}
              width="24"
              height="24"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="0.5"
              transform={`rotate(45 ${cp.cx} ${cp.cy})`}
              animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </g>
      ))}

      {/* Pace car blip */}
      <circle r="3" fill="var(--primary)">
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          rotate="auto"
          path={path}
          keyPoints="0;1"
          keyTimes="0;1"
          calcMode="linear"
        />
      </circle>
    </svg>
  )
}

export function PreviousRoadmap() {
  const [activeCheckpoint, setActiveCheckpoint] = useState(-1)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, margin: '-100px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 85%', 'end 35%'],
  })
  const pathProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.001,
  })

  useEffect(() => {
    if (!isInView) return
    const LAP = 8000
    const start = Date.now()
    const id = setInterval(() => {
      const p = ((Date.now() - start) % LAP) / LAP
      if (p > 0.15 && p < 0.25) setActiveCheckpoint(0)
      else if (p > 0.45 && p < 0.55) setActiveCheckpoint(1)
      else if (p > 0.75 && p < 0.85) setActiveCheckpoint(2)
      else setActiveCheckpoint(-1)
    }, 50)
    return () => clearInterval(id)
  }, [isInView])

  const roles = [...previousRoles].reverse()

  const mobilePositions: Array<React.CSSProperties> = [
    { top: '68%', left: '16%' },
    { top: '34%', right: '4%' },
    { top: '8%', left: '16%' },
  ]

  const desktopPositions: Array<React.CSSProperties> = [
    { top: '-4%', left: '8%' },
    { bottom: '-12%', left: '42%' },
    { top: '-4%', right: '0%' },
  ]

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden max-w-325 mx-auto w-full py-16 px-4"
    >
      <div className="lg:hidden relative w-full" style={{ height: 620 }}>
        <div className="absolute bottom-2 left-[50%] -translate-x-[50%] z-10 font-mono text-[9px] uppercase tracking-widest text-primary/50 flex flex-col items-center gap-2">
          <div className="flex gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          LIGHTS OUT
        </div>

        <div className="absolute top-0 left-[50%] -translate-x-[50%] z-10 font-mono text-[9px] uppercase tracking-widest text-foreground/40 flex items-center gap-2">
          FINISH
          <div className="w-4 h-4 grid grid-cols-2 bg-foreground/20">
            <div className="bg-foreground" />
            <div className="bg-transparent" />
            <div className="bg-transparent" />
            <div className="bg-foreground" />
          </div>
        </div>

        <TrackSVG
          viewBox="0 0 300 620"
          path={MOBILE_PATH}
          checkpoints={MOBILE_CPS}
          activeCheckpoint={activeCheckpoint}
          pathProgress={pathProgress}
          className="absolute inset-0 w-full h-full"
        />

        {roles.map((role, i) => (
          <RoleCard
            key={role.company}
            role={role}
            index={i}
            active={activeCheckpoint === i}
            isRight={i % 2 !== 0}
            style={mobilePositions[i]}
          />
        ))}
      </div>

      <div className="hidden lg:block relative" style={{ height: 260 }}>
        {roles.map((role, i) => (
          <RoleCard
            key={role.company}
            role={role}
            index={i}
            active={activeCheckpoint === i}
            style={desktopPositions[i]}
          />
        ))}

        <div className="absolute inset-0" style={{ perspective: '1200px' }}>
          <div
            className="w-full h-full"
            style={{
              transform: 'rotateX(45deg)',
              transformStyle: 'preserve-3d',
              transformOrigin: '50% 100%',
            }}
          >
            <div className="absolute bottom-[2%] left-[4%] z-10 font-mono text-[10px] uppercase tracking-widest text-primary/60 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span
                  className="w-2 h-2 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: '200ms' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: '400ms' }}
                />
              </div>
              START
            </div>

            <div className="absolute top-[35%] right-[2%] z-10 font-mono text-[10px] uppercase tracking-widest text-foreground/40 flex items-center gap-3">
              CHECKERED
              <div className="w-5 h-5 grid grid-cols-2 bg-foreground/20">
                <div className="bg-foreground/60" />
                <div className="bg-transparent" />
                <div className="bg-transparent" />
                <div className="bg-foreground/60" />
              </div>
            </div>

            <TrackSVG
              viewBox="0 0 1000 220"
              path={DESKTOP_PATH}
              checkpoints={DESKTOP_CPS}
              activeCheckpoint={activeCheckpoint}
              pathProgress={pathProgress}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
