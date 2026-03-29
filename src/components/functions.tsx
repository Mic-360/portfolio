import { motion } from 'motion/react'
import { Award, ImagesIcon } from 'lucide-react'
import CurrentIcon from '@/components/ui/current-icon'
import HealthstatIcon from '@/components/ui/healthstat-icon'
import LayersIcon from '@/components/ui/layers-icon'
import PenIcon from '@/components/ui/pen-icon'
import PreviousIcon from '@/components/ui/previous-icon'

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
        <PenIcon size={16} className="inline-block mr-2 h-8 w-8" />
        {title}
      </span>
    ) : title === 'projects' ? (
      <span>
        <LayersIcon size={18} className="inline-block mr-2 h-8 w-8" />
        {title}
      </span>
    ) : title === 'certificates' ? (
      <span>
        <Award size={16} className="inline-block mr-2 h-8 w-8" />
        {title}
      </span>
    ) : title === 'current' ? (
      <>
        <CurrentIcon size={18} className="inline-block mr-2 h-8 w-8" />
        {title}
      </>
    ) : title === 'previous' ? (
      <>
        <PreviousIcon size={18} className="inline-block mr-2 h-8 w-8" />
        {title}
      </>
    ) : title === 'healthstat' ? (
      <>
        <HealthstatIcon size={18} className="inline-block mr-2 h-8 w-8" />
        {title}
      </>
    ) : title === 'pinterest' ? (
      <>
        <ImagesIcon size={18} className="inline-block mr-2 h-8 w-8" />
        {title}
      </>
    ) : (
      title
    )

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="my-4 flex flex-col gap-6"
    >
      {title ? (
        <div className="flex items-center gap-4">
          <h2 className="shrink-0 text-lg font-semibold uppercase tracking-[0.32em] text-primary/85">
            {titleContent}
          </h2>
          <div className="h-px flex-1 bg-linear-to-r from-primary/30 via-border/40 to-transparent" />
        </div>
      ) : null}
      {children}
    </motion.section>
  )
}

function Sparkline({
  data,
  color = 'var(--primary)',
  height = 48,
}: {
  data: Array<{ value: number }>
  color?: string
  height?: number
}) {
  const width = 100
  if (data.length === 0)
    return (
      <div
        style={{ height }}
        className="h-12 w-full bg-primary/2 opacity-20 border border-primary/10 rounded-xs flex items-center justify-center text-[8px] uppercase tracking-tighter"
      >
        no signal
      </div>
    )

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const pad = 2
  const points =
    data.length === 1
      ? [
          { x: 0, y: height / 2 },
          { x: width, y: height / 2 },
        ]
      : values.map((v, i) => {
          const x = (i / (values.length - 1)) * width
          const y = height - ((v - min) / range) * (height - pad * 2) - pad
          return { x, y }
        })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
    .join(' ')

  return (
    <div className="relative overflow-hidden rounded-xl bg-linear-to-b from-primary/[0.08] via-transparent to-transparent">
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
          backgroundSize: '10% 25%',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-border/40" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-border/25" />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="relative z-10 w-full h-12 overflow-visible transition-all duration-500"
        preserveAspectRatio="none"
      >
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'linear' }}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          d={linePath}
          className="drop-shadow-[0_0_2px_var(--primary)]"
        />

        {/* Scanning Bit */}
        <motion.circle
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: [0, 1, 0],
            cx: points.map((p) => p.x),
            cy: points.map((p) => p.y),
          }}
          viewport={{ once: true }}
          transition={{
            duration: 1.5,
            ease: 'linear',
            opacity: { duration: 0.2 },
          }}
          r="1.5"
          fill={color}
          className="drop-shadow-[0_0_5px_var(--primary)]"
        />
      </svg>

      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-primary/5 to-transparent h-0.5 w-full animate-scanline opacity-10" />
    </div>
  )
}

function StatCard({
  label,
  samples,
  unit,
  type = 'sum',
  format = (v: number) => v.toLocaleString(),
  showStats = true,
}: {
  label: string
  samples?: Array<{
    value: number | string
    startDate?: string
    endDate: string
  }>
  unit: string
  type?: 'sum' | 'avg' | 'latest'
  format?: (v: number) => string
  showStats?: boolean
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

  // Sort by timestamp for proper time-series
  processedData.sort((a, b) => a.timestamp - b.timestamp)

  // Take last 40 samples for graph (time-aware)
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

  // Calculate min/max/avg for display
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  const avg = values.length ? mainValue : 0

  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 12 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col gap-4 border-t border-border/35 pt-4"
    >
      <div className="z-10 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-primary/70">
            {label}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {format(mainValue)}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-tight text-muted-foreground">
              {unit}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end opacity-50">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[6px] font-mono mt-1">REC</span>
        </div>
      </div>

      <Sparkline data={graphData} color="var(--primary)" />

      {showStats && graphData.length > 0 && (
        <div className="z-10 grid grid-cols-3 gap-1 text-[9px] opacity-80">
          <div className="text-center">
            <span className="block font-mono">avg</span>
            <span className="text-primary/80">{format(avg)}</span>
          </div>
          <div className="text-center">
            <span className="block font-mono">min</span>
            <span className="text-primary/60">{format(min)}</span>
          </div>
          <div className="text-center">
            <span className="block font-mono">max</span>
            <span className="text-primary/80">{format(max)}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export { Section, Sparkline, StatCard }
