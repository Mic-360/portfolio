import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
// @ts-ignore: cal-heatmap ships without compatible types for this import path.
import CalHeatmap from 'cal-heatmap'
import 'cal-heatmap/cal-heatmap.css'
// @ts-ignore: plugin modules do not expose typed entry points.
import Tooltip from 'cal-heatmap/plugins/Tooltip'
// @ts-ignore: plugin modules do not expose typed entry points.
import LegendLite from 'cal-heatmap/plugins/LegendLite'
// @ts-ignore: plugin modules do not expose typed entry points.
import CalendarLabel from 'cal-heatmap/plugins/CalendarLabel'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'

dayjs.extend(localeData)

type ContributionEntry = { date: string; value: number }

type ResponsiveConfig = { range: number; cellSize: number }

function getResponsiveConfig(width: number): ResponsiveConfig {
  if (width < 300) return { range: 3, cellSize: 18 }
  if (width < 380) return { range: 4, cellSize: 16 }
  if (width < 480) return { range: 5, cellSize: 14 }
  if (width < 600) return { range: 8, cellSize: 12 }
  if (width < 750) return { range: 11, cellSize: 11 }
  if (width < 900) return { range: 12, cellSize: 12 }
  if (width < 1024) return { range: 16, cellSize: 14 }
  if (width < 1400) return { range: 14, cellSize: 16 }
  if (width < 1800) return { range: 16, cellSize: 18 }
  return { range: 20, cellSize: 20 }
}

function useContributions(username: string) {
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState<number | null>(null)
  const [contributions, setContributions] = useState<ContributionEntry[]>([])

  useEffect(() => {
    setLoading(true)
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1

    const flatten = (data: any): ContributionEntry[] =>
      (data?.contributions || []).flat().map((d: any) => ({
        date: d.date,
        value: d.contributionCount,
      }))

    Promise.all([
      fetch(
        `https://github-contributions-api.deno.dev/${username}.json?y=${lastYear}`,
      ).then((r) => r.json()),
      fetch(`https://github-contributions-api.deno.dev/${username}.json`).then(
        (r) => r.json(),
      ),
    ])
      .then(([lastYearData, recentData]) => {
        setTotal(
          (lastYearData?.totalContributions || 0) +
            (recentData?.totalContributions || 0),
        )
        const map = new Map<string, ContributionEntry>()
        for (const entry of flatten(lastYearData)) map.set(entry.date, entry)
        for (const entry of flatten(recentData)) map.set(entry.date, entry)
        setContributions(Array.from(map.values()))
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching GitHub contributions:', err)
        setLoading(false)
      })
  }, [username])

  return { loading, total, contributions }
}

function useResponsiveSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [config, setConfig] = useState<ResponsiveConfig>({
    range: 12,
    cellSize: 9.5,
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = (width: number) => {
      setConfig((prev) => {
        const next = getResponsiveConfig(width)
        return prev.range === next.range && prev.cellSize === next.cellSize
          ? prev
          : next
      })
    }

    const observer = new ResizeObserver((entries) => {
      update(entries[0].contentRect.width)
    })

    observer.observe(el)
    update(el.clientWidth)
    return () => observer.disconnect()
  }, [ref])

  return config
}

interface GitHubHeatmapProps {
  username: string
}

export default function GitHubHeatmap({ username }: GitHubHeatmapProps) {
  const calRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { loading, total, contributions } = useContributions(username)
  const responsive = useResponsiveSize(wrapperRef)

  useEffect(() => {
    if (!contributions.length || !containerRef.current) return

    if (calRef.current) {
      try {
        calRef.current.destroy()
        calRef.current = null
      } catch (_e) {
        // ignore
      }
    }

    const cal = new CalHeatmap()

    cal.paint(
      {
        itemSelector: containerRef.current,
        domain: {
          type: 'month',
          gutter: 2,
          label: { text: 'MMM', textAlign: 'start', position: 'top' },
        },
        subDomain: {
          type: 'ghDay',
          radius: 2,
          width: responsive.cellSize,
          height: responsive.cellSize,
          gutter: 3,
        },
        date: {
          start: dayjs()
            .subtract(responsive.range - 2, 'month')
            .startOf('month')
            .toDate(),
        },
        range: responsive.range,
        data: {
          source: contributions,
          type: 'json',
          x: 'date',
          y: 'value',
        },
        scale: {
          color: {
            type: 'threshold',
            range: ['#21262d', '#344d3d', '#4c7b52', '#63a06a', '#7a9a65'],
            domain: [1, 5, 10, 15],
          },
        },
      },
      [
        [
          Tooltip,
          {
            text: (_date: any, value: any, dayjsDate: any) => {
              return `${value || 0} contributions on ${dayjsDate.format('dddd, MMMM D, YYYY')}`
            },
          },
        ],
        [
          LegendLite,
          {
            includeBlank: true,
            itemSelector: '#cal-heatmap-legend',
            radius: 2,
            width: 10,
            height: 10,
            gutter: 3,
          },
        ],
        [
          CalendarLabel,
          {
            width: 30,
            textAlign: 'start',
            text: () =>
              dayjs
                .localeData()
                .weekdaysShort()
                .map((d, i) => (i % 2 === 0 ? '' : d)),
            padding: [22, 0, 0, 0],
          },
        ],
      ],
    )
    calRef.current = cal

    return () => {
      if (calRef.current) {
        try {
          calRef.current.destroy()
        } catch (_e) {
          // ignore
        }
      }
    }
  }, [contributions, responsive])

  const handlePrevious = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    calRef.current?.previous()
  }, [])

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    calRef.current?.next()
  }, [])

  return (
    <motion.div
      ref={wrapperRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className="mx-auto flex w-full flex-col gap-4 rounded-2xl border border-border/10 bg-card/30 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">
            GitHub Activity
          </h3>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
            {total
              ? `${total.toLocaleString()} total commits`
              : loading
                ? 'Syncing activity...'
                : 'No activity found'}
          </p>
        </div>
        {loading ? (
          <div className="flex gap-1">
            <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="h-1 w-1 rounded-full bg-primary animate-bounce" />
          </div>
        ) : null}
      </div>

      {/* Heatmap */}
      <div className="relative flex w-full justify-center overflow-hidden">
        <div ref={containerRef} className="max-w-full" />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/10 pt-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrevious}
            className="rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 transition-all duration-200 hover:bg-foreground/[0.04] hover:text-primary active:scale-95"
          >
            &larr; Prev
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 transition-all duration-200 hover:bg-foreground/[0.04] hover:text-primary active:scale-95"
          >
            Next &rarr;
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground/50">
          <span>Less</span>
          <div id="cal-heatmap-legend" className="flex items-center" />
          <span>More</span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/35 uppercase tracking-[0.15em]">
        click to view full github readme
      </p>
    </motion.div>
  )
}
