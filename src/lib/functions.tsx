import { motion } from 'motion/react'
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
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-2 my-4"
    >
      <h2 className="font-semibold italic text-2xl underline underline-offset-2 decoration-primary flex items-center">
        {title === 'blogs' ? (
          <>
            <PenIcon size={20} className="inline-block mr-2" />
            {title}
          </>
        ) : title === 'projects' ? (
          <>
            <LayersIcon size={24} className="inline-block mr-2" />
            {title}
          </>
        ) : title === 'current' ? (
          <>
            <CurrentIcon size={24} className="inline-block mr-2" />
            {title}
          </>
        ) : title === 'previous' ? (
          <>
            <PreviousIcon size={24} className="inline-block mr-2" />
            {title}
          </>
        ) : title === 'healthstat' ? (
          <>
            <HealthstatIcon size={24} className="inline-block mr-2" />
            {title}
          </>
        ) : (
          title
        )}
      </h2>
      <div className="animus-sync-bar mb-2" />
      {children}
    </motion.section>
  )
}

function Sparkline({
  data,
  color = 'currentColor',
  height = 32,
}: {
  data: Array<{ value: number }>
  color?: string
  height?: number
}) {
  if (data.length < 2) return <div style={{ height }} />

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const width = 100
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-8 overflow-visible opacity-50 group-hover:opacity-100 transition-opacity"
      preserveAspectRatio="none"
    >
      <motion.polyline
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function StatCard({
  label,
  samples,
  unit,
  type = 'sum',
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
  format?: (v: number) => string
}) {
  const processedData = (samples || []).map((s) => {
    let val = Number(s.value)
    if (isNaN(val) && s.startDate) {
      const start = new Date(s.startDate).getTime()
      const end = new Date(s.endDate).getTime()
      val = (end - start) / (1000 * 60 * 60)
    }
    return { ...s, value: isNaN(val) ? 0 : val }
  })

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

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group animus-corner flex flex-col gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
    >
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] uppercase tracking-widest text-primary">
          {label}
        </span>
        <span className="text-xs font-medium">
          {format(mainValue)}{' '}
          <span className="text-[10px] text-muted-foreground font-normal">
            {unit}
          </span>
        </span>
      </div>
      <Sparkline data={processedData} color="var(--primary)" />
    </motion.div>
  )
}

export { Section, Sparkline, StatCard }
