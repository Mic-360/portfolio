import { Award, ImagesIcon } from 'lucide-react'
import { motion, useMotionValue, useScroll, useSpring } from 'motion/react'
import { Suspense, useEffect, useRef, useState } from 'react'
import CurrentIcon from '@/components/ui/current-icon'
import HealthstatIcon from '@/components/ui/healthstat-icon'
import LayersIcon from '@/components/ui/layers-icon'
import PenIcon from '@/components/ui/pen-icon'
import PreviousIcon from '@/components/ui/previous-icon'

const APPLE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function SectionHairline() {
  return (
    <div className="relative h-px flex-1 overflow-visible">
      {/* Base track */}
      <div className="absolute inset-x-0 bottom-1/2 h-px bg-border/20" />
      {/* Animated line */}
      <motion.svg
        viewBox="0 0 600 1"
        preserveAspectRatio="none"
        className="absolute inset-0 h-px w-full overflow-visible mix-blend-plus-lighter dark:mix-blend-screen"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hairline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.05" />
            <stop offset="20%" stopColor="var(--primary)" stopOpacity="0.6" />
            <stop offset="80%" stopColor="var(--primary)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <motion.line
          x1="0"
          y1="0.5"
          x2="600"
          y2="0.5"
          stroke="url(#hairline-grad)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.8, ease: APPLE_EASE, delay: 0.1 }}
        />
      </motion.svg>
      {/* Moving flare */}
      <motion.div
        className="absolute bottom-1/2 left-0 h-0.5 w-24 -translate-y-1/2 bg-primary blur-[2px]"
        initial={{ left: '-10%', opacity: 0 }}
        whileInView={{ left: '110%', opacity: [0, 1, 1, 0] }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 2.2, ease: APPLE_EASE, delay: 0.2 }}
      />
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const titleContent =
    title === 'blogs' ? (
      <span>
        <PenIcon
          size={16}
          className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50"
        />
        {title}
      </span>
    ) : title === 'projects' ? (
      <span>
        <LayersIcon
          size={18}
          className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50"
        />
        {title}
      </span>
    ) : title === 'certificates' ? (
      <span>
        <Award
          size={16}
          className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50"
        />
        {title}
      </span>
    ) : title === 'current' ? (
      <>
        <CurrentIcon
          size={18}
          className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50"
        />
        {title}
      </>
    ) : title === 'previous' ? (
      <>
        <PreviousIcon
          size={18}
          className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50"
        />
        {title}
      </>
    ) : title === 'healthstat' ? (
      <>
        <HealthstatIcon
          size={18}
          className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50"
        />
        {title}
      </>
    ) : title === 'pinterest' ? (
      <>
        <ImagesIcon
          size={18}
          className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50"
        />
        {title}
      </>
    ) : title === 'contact' ? (
      <p className="hidden">{title}</p>
    ) : (
      title
    )

  const isContact = title === 'contact'

  return (
    <motion.section
      initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1.1, ease: APPLE_EASE }}
      className="flex flex-col gap-10"
    >
      {title && !isContact ? (
        <div className="flex items-center gap-4 px-4 sm:px-6">
          <h2 className="shrink-0 text-[10px] font-medium uppercase tracking-[0.32em] text-muted-foreground/70">
            {titleContent}
          </h2>
          <SectionHairline />
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 0.4, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: APPLE_EASE, delay: 1.2 }}
            className="shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 tabular-nums"
          >
            §
          </motion.span>
        </div>
      ) : null}
      {children}
    </motion.section>
  )
}

export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: React.ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 22, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 22, mass: 0.4 })

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}

export function DeferredSection({
  children,
  minHeight,
}: {
  children: React.ReactNode
  minHeight?: number | string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          setVisible(true)
        }
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} style={minHeight ? { minHeight } : undefined}>
      {visible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  )
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  })
  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-60 h-px origin-left bg-linear-to-r from-primary/40 via-primary to-primary/40"
      style={{ scaleX }}
    />
  )
}

function InteractiveChart({
  data,
  color = 'var(--primary)',
  height = 40,
  type = 'line',
  formatValue = (v: number) => v.toString(),
}: {
  data: Array<{ value: number; timestamp: number }>
  color?: string
  height?: number
  type?: 'bar' | 'area' | 'scatter' | 'line'
  formatValue?: (v: number) => string
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const width = 300
  if (data.length === 0)
    return (
      <div
        style={{ height }}
        className="flex w-full items-center justify-center rounded-xs border border-primary/10 bg-primary/2 text-[8px] uppercase tracking-tighter opacity-20"
      >
        no signal
      </div>
    )

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const padY = type === 'bar' ? 0 : 4
  const points =
    data.length === 1
      ? [
          {
            x: width / 2,
            y: height / 2,
            val: values[0],
            timestamp: data[0].timestamp,
          },
        ]
      : data.map((d, i) => {
          const x = (i / (data.length - 1)) * width
          const y =
            height - ((d.value - min) / range) * (height - padY * 2) - padY
          return { x, y, val: d.value, timestamp: d.timestamp }
        })

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const svgX = (x / rect.width) * width

    let closestDist = Infinity
    let closestIdx = 0
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - svgX)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = i
      }
    })
    setHoverIndex(closestIdx)
  }

  let renderChart = null

  if (type === 'bar') {
    const barWidth = Math.max(2, (width / points.length) * 0.7)
    renderChart = points.map((p, i) => {
      const baseMin = Math.min(0, min)
      const rawY = height - ((p.val - baseMin) / (max - baseMin || 1)) * height
      const h = Math.max(1, height - rawY)
      return (
        <motion.rect
          key={i}
          initial={{ height: 0, y: height }}
          animate={{ height: h, y: rawY }}
          transition={{
            duration: 0.8,
            delay: i * 0.012,
            ease: [0.16, 1, 0.3, 1],
          }}
          x={p.x - barWidth / 2}
          width={barWidth}
          fill={color}
          opacity={hoverIndex === null ? 0.4 : hoverIndex === i ? 1 : 0.15}
          className="transition-opacity duration-200"
          rx={1}
        />
      )
    })
  } else if (type === 'scatter') {
    renderChart = points.map((p, i) => (
      <motion.circle
        key={i}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: hoverIndex === i ? 1.5 : 1,
          opacity: hoverIndex === null ? 0.5 : hoverIndex === i ? 1 : 0.2,
        }}
        transition={{ duration: 0.4, delay: i * 0.01, ease: [0.16, 1, 0.3, 1] }}
        cx={p.x}
        cy={p.y}
        r={2.5}
        fill={color}
        className="transition-opacity duration-200"
      />
    ))
  } else if (type === 'area') {
    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
      .join(' ')
    const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`
    renderChart = (
      <>
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          d={areaPath}
          fill={color}
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      </>
    )
  } else {
    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
      .join(' ')
    renderChart = (
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    )
  }

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null
  const activePointOffset = activePoint
    ? Math.min(88, Math.max(12, (activePoint.x / width) * 100))
    : 50

  return (
    <div
      className="group relative flex min-w-0 w-full items-center"
      style={{ height }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full cursor-crosshair overflow-visible touch-none"
        preserveAspectRatio="none"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {activePoint && (
          <line
            x1={activePoint.x}
            y1={0}
            x2={activePoint.x}
            y2={height}
            stroke="currentColor"
            className="pointer-events-none stroke-border/40 stroke-dashed stroke-1"
          />
        )}
        {renderChart}
        {activePoint && type !== 'bar' && (
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            r={3}
            fill={color}
            className="pointer-events-none drop-shadow-md"
          />
        )}
      </svg>
      {activePoint && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 2 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            left: `${activePointOffset}%`,
            transform: 'translate(-50%, calc(-100% - 0.75rem))',
          }}
          className="pointer-events-none absolute top-0 z-10 min-w-max rounded-xl border border-white/10 bg-background/60 px-3 py-1.5 text-[11px] leading-tight tabular-nums text-foreground shadow-[0_4px_24px_rgba(0,0,0,0.12)] backdrop-blur-2xl"
        >
          <span className="block font-semibold text-primary">
            {formatValue(activePoint.val)}
          </span>
          <span className="block text-muted-foreground/70 mt-0.5 font-medium">
            {new Date(activePoint.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </motion.div>
      )}
    </div>
  )
}

function MetricRow({
  label,
  samples,
  unit,
  type = 'sum',
  chartType = 'line',
  color,
  index,
  vitalCode,
  format = (v: number) => v.toLocaleString('en-US'),
}: {
  label: string
  samples?: Array<{
    value: number | string
    startDate?: string
    endDate: string
  }>
  unit: string
  type?: 'sum' | 'avg' | 'latest'
  chartType?: 'bar' | 'area' | 'scatter' | 'line'
  color?: string
  index?: number
  vitalCode?: string
  format?: (v: number) => string
}) {
  const processedData = (samples || []).map((s) => {
    let val = Number(s.value)
    if (isNaN(val) && s.startDate) {
      const start = new Date(s.startDate).getTime()
      const end = new Date(s.endDate).getTime()
      val = (end - start) / (1000 * 60 * 60)
    }
    return {
      ...s,
      value: isNaN(val) ? 0 : val,
      timestamp: new Date(s.endDate).getTime(),
    }
  })

  processedData.sort((a, b) => a.timestamp - b.timestamp)
  const graphData = processedData.slice(-40)
  const values = processedData.map((s) => s.value)

  let mainValue = 0
  if (type === 'sum') mainValue = values.reduce((a, b) => a + b, 0)
  else if (type === 'avg')
    mainValue = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0
  else
    mainValue = processedData.length
      ? [...processedData].sort(
          (a, b) =>
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
        )[0].value
      : 0

  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  const avgRaw = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0
  const range = max - min || 1
  const avgPct = ((avgRaw - min) / range) * 100
  const tickColor = color || 'var(--primary)'
  const idx =
    typeof index === 'number'
      ? String(index + 1).padStart(2, '0')
      : '··'
  const code = vitalCode ?? label.slice(0, 3).toUpperCase()

  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.85, ease: APPLE_EASE }}
      style={{ ['--metric-color' as never]: tickColor }}
      className="metric-row group grid min-w-0 grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-[auto_minmax(11rem,1fr)_minmax(0,1.6fr)_auto] sm:items-center sm:gap-6 sm:px-6 sm:py-7"
    >
      {/* Index gutter */}
      <div className="hidden sm:flex shrink-0 flex-col items-start gap-2 pl-2">
        <span className="font-mono text-[10px] tabular-nums tracking-[0.18em] text-muted-foreground/40">
          {idx}
        </span>
        <span
          className="block h-2.5 w-2.5 rounded-full ring-2 ring-background"
          style={{ background: tickColor }}
          aria-hidden="true"
        />
      </div>

      {/* Hero readout (label + big number) */}
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.32em]"
            style={{ color: tickColor }}
          >
            VTAL·{code}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/40 sm:hidden">
            {idx}
          </span>
          <span className="h-px flex-1 bg-foreground/8" />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-foreground/65 transition-colors duration-300 group-hover:text-foreground">
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="metric-row-value font-serif text-4xl font-light tabular-nums leading-[0.95] tracking-tight text-foreground/85 transition-colors duration-500 sm:text-5xl">
            {format(mainValue)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">
            {unit}
          </span>
        </div>
      </div>

      {/* Waveform */}
      <div className="relative min-w-0">
        <div className="pointer-events-none absolute inset-x-0 top-2 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.22em] text-muted-foreground/30">
          <span>trace · last 40</span>
          <span>{chartType}</span>
        </div>
        <div className="relative pt-5 pb-2">
          {/* horizontal mean reference */}
          <div
            className="pointer-events-none absolute left-0 right-0 z-0 h-px"
            style={{
              top: `calc(20px + ${100 - avgPct}% * 0.6)`,
              background: `repeating-linear-gradient(90deg, ${tickColor} 0 3px, transparent 3px 7px)`,
              opacity: 0.18,
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 h-16">
            <InteractiveChart
              data={graphData}
              color={tickColor}
              type={chartType}
              height={64}
              formatValue={(v) => format(v) + ' ' + unit}
            />
          </div>
        </div>
      </div>

      {/* Peak / Mean / Floor */}
      <div className="grid grid-cols-3 gap-2 sm:flex sm:w-32 sm:flex-col sm:gap-2 sm:pl-3 sm:border-l sm:border-foreground/8 font-mono text-[10px] tabular-nums">
        <StatLine
          icon="↑"
          label="peak"
          value={format(max)}
          accent={tickColor}
        />
        <StatLine icon="◇" label="mean" value={format(avgRaw)} />
        <StatLine
          icon="↓"
          label="floor"
          value={format(min)}
          accent={tickColor}
        />
      </div>
    </motion.div>
  )
}

function StatLine({
  icon,
  label,
  value,
  accent,
}: {
  icon: string
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
      <span className="flex items-center gap-1 text-muted-foreground/45">
        <span style={accent ? { color: accent, opacity: 0.85 } : undefined}>
          {icon}
        </span>
        <span className="uppercase tracking-[0.2em]">{label}</span>
      </span>
      <span className="truncate font-medium text-foreground/75">{value}</span>
    </div>
  )
}

export { MetricRow, Section }
