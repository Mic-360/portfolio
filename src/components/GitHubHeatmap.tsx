import { useEffect, useRef, useState } from 'react'
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

interface GitHubHeatmapProps {
  username: string
}

export default function GitHubHeatmap({ username }: GitHubHeatmapProps) {
  const calRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState<number | null>(null)
  const [contributions, setContributions] = useState<Array<any>>([])
  const [responsive, setResponsive] = useState({
    range: 12,
    cellSize: 9.5,
  })

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const updateResponsive = (width: number) => {
      let newSettings
      if (width < 300) {
        newSettings = { range: 3, cellSize: 18 }
      } else if (width < 380) {
        newSettings = { range: 4, cellSize: 16 }
      } else if (width < 480) {
        newSettings = { range: 5, cellSize: 14 }
      } else if (width < 600) {
        newSettings = { range: 8, cellSize: 12 }
      } else if (width < 750) {
        newSettings = { range: 11, cellSize: 11 }
      } else if (width < 900) {
        newSettings = { range: 12, cellSize: 12 }
      } else if (width < 1024) {
        newSettings = { range: 16, cellSize: 14 }
      } else if (width < 1400) {
        newSettings = { range: 14, cellSize: 16 }
      } else if (width < 1800) {
        newSettings = { range: 16, cellSize: 18 }
      } else {
        newSettings = { range: 20, cellSize: 20 }
      }

      setResponsive((prev) =>
        prev.range !== newSettings.range ||
        prev.cellSize !== newSettings.cellSize
          ? newSettings
          : prev,
      )
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      updateResponsive(entry.contentRect.width)
    })

    observer.observe(wrapper)
    updateResponsive(wrapper.clientWidth)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setLoading(true)
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1

    const flatten = (data: any) =>
      (data?.contributions || []).flat().map((d: any) => ({
        date: d.date,
        value: d.contributionCount,
      }))

    Promise.all([
      fetch(
        `https://github-contributions-api.deno.dev/${username}.json?y=${lastYear}`,
      ).then((r) => r.json()),
      fetch(
        `https://github-contributions-api.deno.dev/${username}.json`,
      ).then((r) => r.json()),
    ])
      .then(([lastYearData, recentData]) => {
        setTotal(
          (lastYearData?.totalContributions || 0) +
            (recentData?.totalContributions || 0),
        )
        // Merge and deduplicate by date (recent data wins on overlap)
        const map = new Map<string, { date: string; value: number }>()
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

  useEffect(() => {
    if (!contributions.length || !containerRef.current) return

    if (calRef.current) {
      try {
        calRef.current.destroy()
        calRef.current = null
      } catch (e) {
        console.warn('Error destroying CalHeatmap:', e)
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
            range: [
              '#21262d', // Blank grey
              '#344d3d',
              '#4c7b52',
              '#63a06a',
              '#7a9a65', // Primary green
            ],
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
        } catch (e) {
          // ignore
        }
      }
    }
  }, [contributions, responsive])

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    calRef.current?.previous()
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    calRef.current?.next()
  }

  return (
    <div
      ref={wrapperRef}
      className="mx-auto flex w-full max-w-370 flex-col gap-5"
    >
      <div className="mb-1 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-semibold uppercase tracking-[0.26em] text-primary/85">
            GitHub Activity
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {total
              ? `${total.toLocaleString()} total commits`
              : loading
                ? 'Syncing activity...'
                : 'No activity found'}
          </p>
        </div>
        {loading && (
          <div className="flex gap-1 mb-1">
            <div className="w-1 h-1 bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1 h-1 bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1 h-1 bg-primary animate-bounce" />
          </div>
        )}
      </div>

      <div className="relative flex w-full justify-center overflow-hidden">
        <div ref={containerRef} className="max-w-full" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/35 pt-3">
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-primary active:scale-95"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-primary active:scale-95"
          >
            Next →
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
          <span className="opacity-60">Less</span>
          <div id="cal-heatmap-legend" className="flex items-center"></div>
          <span className="opacity-60">More</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        click the graph to view my full github readme.
      </p>
    </div>
  )
}
