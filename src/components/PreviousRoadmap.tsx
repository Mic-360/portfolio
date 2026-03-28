import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { previousRoles } from '@/config/site-data'

const MOBILE_PATH =
  'M150,580 C150,520 40,490 40,430 C40,370 260,330 260,270 C260,210 40,170 40,110 C40,60 150,30 150,20'
const DESKTOP_PATH =
  'M30,260 C100,260 150,40 280,40 C410,40 440,260 560,260 C680,260 720,40 840,40 C920,40 960,160 980,160'

const MOBILE_CPS = [
  { cx: 40, cy: 430 },
  { cx: 260, cy: 270 },
  { cx: 40, cy: 110 },
]
const DESKTOP_CPS = [
  { cx: 280, cy: 40 },
  { cx: 560, cy: 260 },
  { cx: 840, cy: 40 },
]

function RoleLabel({
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
      initial={{ opacity: 0, x: isRight ? 20 : -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
      className={`group/role absolute z-20 flex items-center gap-3 ${isRight ? 'flex-row-reverse' : ''}`}
      style={style}
    >
      {role.icon && (
        <img
          src={role.icon}
          alt={role.company}
          width={40}
          height={40}
          loading="lazy"
          className={`w-9 h-9 lg:w-10 lg:h-10 shrink-0 rounded-full border-2 object-cover transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            active
              ? 'border-primary scale-110 drop-shadow-[0_0_12px_var(--primary)]'
              : 'border-primary/40 group-hover/role:scale-[1.3] group-hover/role:rotate-[360deg] group-hover/role:border-primary group-hover/role:drop-shadow-[0_0_10px_var(--primary)]'
          }`}
        />
      )}
      <div className={`flex flex-col gap-0.5 ${isRight ? 'items-end' : ''}`}>
        <span
          className={`font-black text-sm lg:text-base transition-colors duration-300 ${active ? 'text-primary' : 'text-foreground group-hover/role:text-primary'}`}
        >
          {role.company}
        </span>
        <span className="text-[8px] font-mono text-primary/70 tabular-nums tracking-widest">
          {role.duration}
        </span>
        <span className="text-[10px] text-foreground/60 italic">
          {role.role}
        </span>
        <span className="text-[8px] font-mono text-foreground/35 uppercase tracking-wider">
          {role.location}
        </span>
      </div>
    </motion.a>
  )
}

function TrackSVG({
  viewBox,
  path,
  checkpoints,
  activeCheckpoint,
  carSize,
  className,
}: {
  viewBox: string
  path: string
  checkpoints: Array<{ cx: number; cy: number }>
  activeCheckpoint: number
  carSize: number
  className?: string
}) {
  const half = carSize / 2
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Ground shadow */}
      <path
        d={path}
        stroke="var(--foreground)"
        strokeWidth="40"
        strokeOpacity="0.03"
        strokeLinecap="square"
      />
      {/* Road surface */}
      <path
        d={path}
        stroke="var(--primary)"
        strokeWidth="26"
        strokeOpacity="0.07"
        strokeLinecap="square"
      />
      {/* Edge lines */}
      <path
        d={path}
        stroke="var(--primary)"
        strokeWidth="26"
        strokeOpacity="0.04"
        strokeLinecap="square"
      />
      {/* Center dashes */}
      <path
        d={path}
        stroke="var(--primary)"
        strokeWidth="1.5"
        strokeOpacity="0.2"
        strokeDasharray="10 7"
        strokeLinecap="square"
      />

      {/* Checkpoints */}
      {checkpoints.map((cp, i) => (
        <g key={i}>
          {/* Outer ring on active */}
          {activeCheckpoint === i && (
            <circle
              cx={cp.cx}
              cy={cp.cy}
              r="18"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1"
              opacity="0.25"
              style={{ transition: 'all 0.3s ease' }}
            />
          )}
          <circle
            cx={cp.cx}
            cy={cp.cy}
            r={activeCheckpoint === i ? 10 : 5}
            fill={activeCheckpoint === i ? 'var(--primary)' : 'none'}
            stroke="var(--primary)"
            strokeWidth="2"
            opacity={activeCheckpoint === i ? 1 : 0.3}
            style={{ transition: 'all 0.3s ease' }}
          />
        </g>
      ))}

      <image
        href="/car.svg"
        width={carSize}
        height={carSize}
        x={-half}
        y={-half}
        transform={`rotate(-180, 0, 0)`}
      >
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          rotate="auto"
          path={path}
        />
      </image>
    </svg>
  )
}

export function PreviousRoadmap() {
  const [activeCheckpoint, setActiveCheckpoint] = useState(-1)

  useEffect(() => {
    const LAP = 8000
    const start = Date.now()
    const id = setInterval(() => {
      const p = ((Date.now() - start) % LAP) / LAP
      if (p > 0.18 && p < 0.28) setActiveCheckpoint(0)
      else if (p > 0.43 && p < 0.55) setActiveCheckpoint(1)
      else if (p > 0.68 && p < 0.8) setActiveCheckpoint(2)
      else setActiveCheckpoint(-1)
    }, 60)
    return () => clearInterval(id)
  }, [])

  const roles = [...previousRoles].reverse()

  const mobilePositions: Array<React.CSSProperties> = [
    { top: '67%', left: '28%' },
    { top: '39%', right: '4%' },
    { top: '11%', left: '28%' },
  ]

  const desktopPositions: Array<React.CSSProperties> = [
    { top: '4%', left: '20%' },
    { bottom: '6%', left: '46%' },
    { top: '4%', right: '8%' },
  ]

  return (
    <>
      {/* ── Mobile: diagonal S-curve (bottom → top), labels alternate sides ── */}
      <div className="lg:hidden relative w-full" style={{ height: 600 }}>
        {/* Start label */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary/50 animate-pulse" />
          <span className="text-[7px] font-mono font-black uppercase tracking-[0.4em] text-primary">
            start
          </span>
        </div>

        {/* Finish label */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-xs border border-primary/40"
            style={{
              backgroundImage:
                'repeating-conic-gradient(var(--primary) 0% 25%, transparent 0% 50%)',
              backgroundSize: '3px 3px',
            }}
          />
          <span className="text-[7px] font-mono font-black uppercase tracking-[0.4em] text-foreground/35">
            finish
          </span>
        </div>

        <TrackSVG
          viewBox="0 0 300 600"
          path={MOBILE_PATH}
          checkpoints={MOBILE_CPS}
          activeCheckpoint={activeCheckpoint}
          carSize={22}
          className="absolute inset-0 w-full h-full"
        />

        {roles.map((role, i) => (
          <RoleLabel
            key={role.company}
            role={role}
            index={i}
            active={activeCheckpoint === i}
            isRight={i % 2 !== 0}
            style={mobilePositions[i]}
          />
        ))}
      </div>

      {/* ── Desktop: 3D perspective track (top-right viewing angle) ── */}
      <div className="hidden lg:block relative" style={{ height: 180 }}>
        {/* Labels — outside the 3D container for readability */}
        {roles.map((role, i) => (
          <RoleLabel
            key={role.company}
            role={role}
            index={i}
            active={activeCheckpoint === i}
            style={desktopPositions[i]}
          />
        ))}

        {/* 3D perspective container */}
        <div
          className="absolute inset-0"
          style={{ perspective: '900px' }}
        >
          <div
            className="w-full h-full"
            style={{
              transform: 'rotateX(52deg) rotateY(-6deg)',
              transformStyle: 'preserve-3d',
              transformOrigin: '50% 85%',
            }}
          >
            {/* Start flag */}
            <div className="absolute bottom-[14%] left-[1%] z-10 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/50 animate-pulse" />
              <span className="text-[7px] font-mono font-black uppercase tracking-[0.4em] text-primary">
                start
              </span>
            </div>
            {/* Finish flag */}
            <div className="absolute top-[48%] right-[2%] z-10 flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-xs border border-primary/40"
                style={{
                  backgroundImage:
                    'repeating-conic-gradient(var(--primary) 0% 25%, transparent 0% 50%)',
                  backgroundSize: '3px 3px',
                }}
              />
              <span className="text-[7px] font-mono font-black uppercase tracking-[0.4em] text-foreground/35">
                finish
              </span>
            </div>

            <TrackSVG
              viewBox="0 0 1000 260"
              path={DESKTOP_PATH}
              checkpoints={DESKTOP_CPS}
              activeCheckpoint={activeCheckpoint}
              carSize={30}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </>
  )
}
