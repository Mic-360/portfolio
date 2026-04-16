import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { previousRoles } from '@/config/site-data'

const MOBILE_PATH =
  'M150,560 C150,500 50,470 50,410 C50,350 250,310 250,250 C250,190 50,150 50,90 C50,45 150,20 150,15'
const DESKTOP_PATH =
  'M40,140 C100,140 140,40 260,40 C380,40 420,140 540,140 C660,140 700,40 820,40 C900,40 950,90 960,140'

const MOBILE_CPS = [
  { cx: 50, cy: 410 },
  { cx: 250, cy: 250 },
  { cx: 50, cy: 90 },
]
const DESKTOP_CPS = [
  { cx: 260, cy: 40 },
  { cx: 540, cy: 140 },
  { cx: 820, cy: 40 },
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
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.15,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        y: -3,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      className={`group/role absolute z-20 ${isRight ? 'text-right' : ''}`}
      style={style}
    >
      <motion.div
        animate={
          active
            ? {
                borderColor: 'var(--primary)',
                boxShadow:
                  '0 0 0 1px color-mix(in oklab, var(--primary) 20%, transparent), 0 8px 32px -8px color-mix(in oklab, var(--primary) 15%, transparent)',
              }
            : {
                borderColor:
                  'color-mix(in oklab, var(--border) 30%, transparent)',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)',
              }
        }
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-xl p-4 transition-all duration-500 group-hover/role:border-primary/30 group-hover/role:shadow-lg"
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/role:opacity-100" />

        <div
          className={`relative flex items-center gap-3 ${isRight ? 'flex-row-reverse' : ''}`}
        >
          {role.icon && (
            <motion.div
              animate={active ? { scale: 1.08 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative shrink-0"
            >
              <img
                src={role.icon}
                alt={role.company}
                width={40}
                height={40}
                loading="lazy"
                data-backlight="off"
                className="w-10 h-10 rounded-xl object-cover transition-all duration-500 group-hover/role:scale-105"
              />
              {active && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card/80"
                />
              )}
            </motion.div>
          )}
          <div
            className={`flex flex-col gap-0.5 min-w-0 ${isRight ? 'items-end' : ''}`}
          >
            <span className="font-semibold text-sm tracking-tight text-foreground transition-colors duration-300 group-hover/role:text-primary truncate">
              {role.company}
            </span>
            <span className="text-[11px] text-foreground/50 leading-tight">
              {role.role}
            </span>
            <div
              className={`flex items-center gap-2 mt-0.5 ${isRight ? 'flex-row-reverse' : ''}`}
            >
              <span className="text-[10px] font-medium text-primary/60 tabular-nums">
                {role.duration}
              </span>
              <span className="text-[9px] text-foreground/30">
                {role.location}
              </span>
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
}: {
  viewBox: string
  path: string
  checkpoints: Array<{ cx: number; cy: number }>
  activeCheckpoint: number
  className?: string
}) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={path}
        stroke="var(--foreground)"
        strokeWidth="36"
        strokeOpacity="0.02"
        strokeLinecap="round"
      />
      <path
        d={path}
        stroke="var(--border)"
        strokeWidth="20"
        strokeOpacity="0.15"
        strokeLinecap="round"
      />
      <path
        d={path}
        stroke="var(--primary)"
        strokeWidth="1"
        strokeOpacity="0.25"
        strokeDasharray="8 6"
        strokeLinecap="round"
      />

      {checkpoints.map((cp, i) => (
        <g key={i}>
          {activeCheckpoint === i && (
            <circle
              cx={cp.cx}
              cy={cp.cy}
              r="16"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="0.75"
              opacity="0.2"
              style={{
                transition: 'all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            />
          )}
          <circle
            cx={cp.cx}
            cy={cp.cy}
            r={activeCheckpoint === i ? 5 : 3}
            fill={activeCheckpoint === i ? 'var(--primary)' : 'none'}
            stroke="var(--primary)"
            strokeWidth="1.5"
            opacity={activeCheckpoint === i ? 0.9 : 0.2}
            style={{ transition: 'all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
          />
        </g>
      ))}

      <circle r="4" fill="var(--primary)" opacity="0.8">
        <animateMotion
          dur="10s"
          repeatCount="indefinite"
          rotate="auto"
          path={path}
        />
      </circle>
      <circle r="8" fill="var(--primary)" opacity="0.12">
        <animateMotion
          dur="10s"
          repeatCount="indefinite"
          rotate="auto"
          path={path}
        />
      </circle>
    </svg>
  )
}

export function PreviousRoadmap() {
  const [activeCheckpoint, setActiveCheckpoint] = useState(-1)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, margin: '-100px' })

  useEffect(() => {
    if (!isInView) return
    const LAP = 10000
    const start = Date.now()
    const id = setInterval(() => {
      const p = ((Date.now() - start) % LAP) / LAP
      if (p > 0.18 && p < 0.28) setActiveCheckpoint(0)
      else if (p > 0.43 && p < 0.55) setActiveCheckpoint(1)
      else if (p > 0.68 && p < 0.8) setActiveCheckpoint(2)
      else setActiveCheckpoint(-1)
    }, 60)
    return () => clearInterval(id)
  }, [isInView])

  const roles = [...previousRoles].reverse()

  const mobilePositions: Array<React.CSSProperties> = [
    { top: '64%', left: '30%' },
    { top: '36%', right: '2%' },
    { top: '8%', left: '30%' },
  ]

  const desktopPositions: Array<React.CSSProperties> = [
    { top: '-2%', left: '18%' },
    { bottom: '-4%', left: '43%' },
    { top: '-2%', right: '6%' },
  ]

  return (
    <div ref={sectionRef}>
      <div className="lg:hidden relative w-full" style={{ height: 580 }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.3em] text-primary/60 backdrop-blur-sm border border-primary/10">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-pulse" />
            start
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/3 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.3em] text-foreground/30 backdrop-blur-sm border border-border/15">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{
                backgroundImage:
                  'repeating-conic-gradient(var(--foreground) 0% 25%, transparent 0% 50%)',
                backgroundSize: '2.5px 2.5px',
                opacity: 0.25,
              }}
            />
            finish
          </span>
        </motion.div>

        <TrackSVG
          viewBox="0 0 300 580"
          path={MOBILE_PATH}
          checkpoints={MOBILE_CPS}
          activeCheckpoint={activeCheckpoint}
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

      <div className="hidden lg:block relative" style={{ height: 200 }}>
        {roles.map((role, i) => (
          <RoleCard
            key={role.company}
            role={role}
            index={i}
            active={activeCheckpoint === i}
            style={desktopPositions[i]}
          />
        ))}

        <div className="absolute inset-0" style={{ perspective: '1000px' }}>
          <div
            className="w-full h-full"
            style={{
              transform: 'rotateX(58deg) rotateY(-1deg)',
              transformStyle: 'preserve-3d',
              transformOrigin: '55% 90%',
            }}
          >
            <div className="absolute bottom-[12%] left-[4%] z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-0.5 text-[8px] font-medium uppercase tracking-[0.3em] text-primary/60 border border-primary/10">
                <span className="h-1 w-1 rounded-full bg-primary/50 animate-pulse" />
                start
              </span>
            </div>
            <div className="absolute top-[42%] right-[1%] z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground/3 px-2.5 py-0.5 text-[8px] font-medium uppercase tracking-[0.3em] text-foreground/25 border border-border/10">
                <div
                  className="w-2 h-2 rounded-xs"
                  style={{
                    backgroundImage:
                      'repeating-conic-gradient(var(--foreground) 0% 25%, transparent 0% 50%)',
                    backgroundSize: '2px 2px',
                    opacity: 0.2,
                  }}
                />
                finish
              </span>
            </div>

            <TrackSVG
              viewBox="0 0 1000 180"
              path={DESKTOP_PATH}
              checkpoints={DESKTOP_CPS}
              activeCheckpoint={activeCheckpoint}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
