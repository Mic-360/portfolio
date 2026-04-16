import { motion } from 'motion/react'
import { Award, ImagesIcon } from 'lucide-react'
import { useState, useRef } from 'react'
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
        <PenIcon size={16} className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50" />
        {title}
      </span>
    ) : title === 'projects' ? (
      <span>
        <LayersIcon size={18} className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50" />
        {title}
      </span>
    ) : title === 'certificates' ? (
      <span>
        <Award size={16} className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50" />
        {title}
      </span>
    ) : title === 'current' ? (
      <>
        <CurrentIcon size={18} className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50" />
        {title}
      </>
    ) : title === 'previous' ? (
      <>
        <PreviousIcon size={18} className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50" />
        {title}
      </>
    ) : title === 'healthstat' ? (
      <>
        <HealthstatIcon size={18} className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50" />
        {title}
      </>
    ) : title === 'pinterest' ? (
      <>
        <ImagesIcon size={18} className="inline-block mr-1.5 h-3.5 w-3.5 opacity-50" />
        {title}
      </>
    ) : (
      title
    )

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col gap-8"
    >
      {title ? (
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          {titleContent}
        </h2>
      ) : null}
      {children}
    </motion.section>
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

  const width = 300 // internal viewBox width
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
      ? [{ x: width / 2, y: height / 2, val: values[0], timestamp: data[0].timestamp }]
      : data.map((d, i) => {
          const x = (i / (data.length - 1)) * width
          const y = height - ((d.value - min) / range) * (height - padY * 2) - padY
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
      // Calculate origin (usually 0 if minimum is 0, otherwise floor)
      const baseMin = Math.min(0, min)
      const rawY = height - ((p.val - baseMin) / (max - baseMin || 1)) * height
      const h = Math.max(1, height - rawY)
      return (
        <motion.rect
          key={i}
          initial={{ height: 0, y: height }}
          animate={{ height: h, y: rawY }}
          transition={{ duration: 0.5, delay: i * 0.015, ease: 'easeOut' }}
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
        transition={{ duration: 0.3, delay: i * 0.01 }}
        cx={p.x}
        cy={p.y}
        r={2.5}
        fill={color}
        className="transition-all duration-200"
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
          transition={{ duration: 1 }}
          d={areaPath}
          fill={color}
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
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
        transition={{ duration: 1, ease: 'easeOut' }}
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    )
  }

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div
      className="group relative flex w-full items-center"
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
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute -top-8 right-0 z-10 whitespace-nowrap rounded-md border border-border/40 bg-background/90 px-2.5 py-1 text-[10px] tabular-nums text-foreground shadow-xs backdrop-blur-md"
        >
          <span className="mr-2 font-semibold text-primary">
            {formatValue(activePoint.val)}
          </span>
          <span className="text-muted-foreground opacity-80">
            {new Date(activePoint.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}{' '}
            {new Date(activePoint.timestamp).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
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
  format = (v: number) => v.toLocaleString(),
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
          (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
        )[0].value
      : 0

  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  const avg = values.length ? mainValue : 0

  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 12 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group flex flex-col gap-6 py-5 transition-colors sm:flex-row sm:items-center"
    >
      <div className="flex w-full shrink-0 flex-col gap-1 sm:w-36">
        <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-primary/70">
          {label}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="tabular-nums text-2xl font-semibold tracking-tight text-foreground">
            {format(mainValue)}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-tight text-muted-foreground">
            {unit}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1 h-12">
        <InteractiveChart
          data={graphData}
          color={color || 'var(--primary)'}
          type={chartType}
          height={48}
          formatValue={(v) => format(v) + ' ' + unit}
        />
      </div>

      <div className="hidden w-24 shrink-0 flex-col gap-1 text-right font-mono text-[10px] tabular-nums opacity-60 transition-opacity group-hover:opacity-100 sm:flex sm:justify-center">
        <div className="flex w-full justify-between">
          <span className="text-muted-foreground">avg</span>
          <span className="text-foreground">{format(avg)}</span>
        </div>
        <div className="flex w-full justify-between">
          <span className="text-muted-foreground">min</span>
          <span className="text-foreground">{format(min)}</span>
        </div>
        <div className="flex w-full justify-between">
          <span className="text-muted-foreground">max</span>
          <span className="text-foreground">{format(max)}</span>
        </div>
      </div>
    </motion.div>
  )
}

export { Section, MetricRow }
