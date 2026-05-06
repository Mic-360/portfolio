import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

dayjs.extend(localeData)

type ContributionEntry = { date: string; value: number }

type ResponsiveConfig = { range: number; cellSize: number }

type HeatmapInstance = {
  paint: (options: any, plugins?: Array<any>) => Promise<void> | void
  destroy: () => Promise<void> | void
  previous: () => void
  next: () => void
}

async function loadHeatmapModules() {
  const [
    { default: CalHeatmap },
    _styles,
    { default: Tooltip },
    { default: LegendLite },
    { default: CalendarLabel },
  ] = await Promise.all([
    import('cal-heatmap'),
    import('cal-heatmap/cal-heatmap.css'),
    import('cal-heatmap/plugins/Tooltip'),
    import('cal-heatmap/plugins/LegendLite'),
    import('cal-heatmap/plugins/CalendarLabel'),
  ])

  return { CalHeatmap, Tooltip, LegendLite, CalendarLabel }
}

function destroyHeatmap(instance: HeatmapInstance | null) {
  if (!instance) return

  try {
    const result = instance.destroy()
    if (result && typeof result.catch === 'function') {
      void result.catch(() => {})
    }
  } catch (_error) {
    return
  }
}

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
  const [contributions, setContributions] = useState<Array<ContributionEntry>>(
    [],
  )

  useEffect(() => {
    setLoading(true)
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1

    const flatten = (data: any): Array<ContributionEntry> =>
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

function useDeferredVisibility(ref: React.RefObject<HTMLDivElement | null>) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isVisible || typeof window === 'undefined') return

    const el = ref.current
    if (!el) return

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setIsVisible(true)
            observer.disconnect()
          }
        },
        { rootMargin: '240px' },
      )

      observer.observe(el)
      return () => observer.disconnect()
    }

    setIsVisible(true)
  }, [isVisible, ref])

  return isVisible
}

interface GithubHeatmapProps {
  username: string
}

export default function GithubHeatmap({ username }: GithubHeatmapProps) {
  const calRef = useRef<HeatmapInstance | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { loading, total, contributions } = useContributions(username)
  const responsive = useResponsiveSize(wrapperRef)
  const isVisible = useDeferredVisibility(wrapperRef)
  const [isHeatmapReady, setIsHeatmapReady] = useState(false)

  const stats = useMemo(() => {
    if (!contributions.length)
      return { active: 0, streak: 0, peak: 0, peakDate: null as string | null }

    const sorted = [...contributions].sort((a, b) => (a.date < b.date ? -1 : 1))
    let active = 0
    let peak = 0
    let peakDate: string | null = null
    for (const c of sorted) {
      if (c.value > 0) active += 1
      if (c.value > peak) {
        peak = c.value
        peakDate = c.date
      }
    }

    let streak = 0
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      if (sorted[i].value > 0) streak += 1
      else if (streak > 0) break
    }

    return { active, streak, peak, peakDate }
  }, [contributions])

  useEffect(() => {
    if (!isVisible || !contributions.length || !containerRef.current) return

    let cancelled = false
    setIsHeatmapReady(false)

    const mount = async () => {
      const { CalHeatmap, Tooltip, LegendLite, CalendarLabel } =
        await loadHeatmapModules()

      if (cancelled || !containerRef.current) return

      destroyHeatmap(calRef.current)
      calRef.current = null

      const cal = new CalHeatmap()

      await cal.paint(
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
              range: ['#21262d', '#344d3d', '#4c7b52', '#7a9a65', '#63a06a'],
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

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (cancelled) {
        destroyHeatmap(cal)
        return
      }

      calRef.current = cal
      setIsHeatmapReady(true)
    }

    mount().catch((error) => {
      console.error('Error loading GitHub heatmap:', error)
      if (!cancelled) {
        setIsHeatmapReady(false)
      }
    })

    return () => {
      cancelled = true
      destroyHeatmap(calRef.current)
      calRef.current = null
    }
  }, [contributions, isVisible, responsive])

  const handlePrevious = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    calRef.current?.previous()
  }, [])

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    calRef.current?.next()
  }, [])

  const tapeStats = [
    {
      label: 'total',
      value:
        total !== null ? total.toLocaleString('en-US') : loading ? '———' : '0',
    },
    { label: 'active', value: stats.active.toLocaleString('en-US') },
    { label: 'streak', value: `${stats.streak}d` },
    {
      label: 'peak',
      value: stats.peak ? stats.peak.toLocaleString('en-US') : '0',
      sub: stats.peakDate ? dayjs(stats.peakDate).format('MMM D') : undefined,
    },
  ]

  return (
    <motion.div
      ref={wrapperRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full"
    >
      {/* Header — instrument label ribbon */}
      <div className="mb-3 flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/55">
            git telemetry
          </span>
          <span className="hidden h-px w-8 bg-foreground/15 sm:block" />
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/40 sm:inline">
            @{username}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/55">
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              syncing
            </span>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              live
            </>
          )}
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">
            {dayjs().format('YYYY.MM.DD')}
          </span>
        </div>
      </div>

      {/* Tape body — instrument bezel */}
      <div className="instrument-panel relative overflow-hidden border border-foreground/10">
        <span className="instrument-bracket-bl" />
        <span className="instrument-bracket-br" />

        {/* Stats strip */}
        <div className="relative grid grid-cols-2 divide-foreground/8 border-b border-foreground/10 sm:grid-cols-4 sm:divide-x">
          {tapeStats.map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col gap-1 border-foreground/8 px-4 py-3 sm:px-5 sm:py-4 nth-[-n+2]:border-b sm:nth-[-n+2]:border-b-0"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/45">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-foreground/8" />
                <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/55">
                  {s.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-serif text-2xl font-light tabular-nums leading-none tracking-tight text-foreground sm:text-3xl">
                  {s.value}
                </span>
                {s.sub ? (
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">
                    {s.sub}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Tape feed — perforation top */}
        <div
          className="pointer-events-none h-1 w-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, color-mix(in oklab, var(--foreground) 18%, transparent) 0 4px, transparent 4px 12px)',
          }}
          aria-hidden="true"
        />

        {/* Heatmap canvas */}
        <div className="commit-tape relative px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/55">
              365·day trace
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/40">
              ch·{responsive.range}
            </span>
          </div>
          <div className="github-heatmap-shell relative flex w-full justify-center overflow-hidden">
            <div ref={containerRef} className="min-h-47.5 w-full max-w-full" />
            {!isHeatmapReady && !loading ? null : null}
          </div>
        </div>

        {/* Tape feed — perforation bottom */}
        <div
          className="pointer-events-none h-1 w-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, color-mix(in oklab, var(--foreground) 18%, transparent) 0 4px, transparent 4px 12px)',
          }}
          aria-hidden="true"
        />

        {/* Control bezel */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!isHeatmapReady}
              className="group/btn flex items-center gap-1.5 border border-foreground/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70 transition-all duration-200 hover:border-foreground/25 hover:bg-foreground/3 hover:text-foreground active:scale-95 disabled:opacity-40"
            >
              <span className="transition-transform duration-300 group-hover/btn:-translate-x-0.5">
                ◀
              </span>
              prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!isHeatmapReady}
              className="group/btn flex items-center gap-1.5 border border-l-0 border-foreground/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70 transition-all duration-200 hover:border-foreground/25 hover:bg-foreground/3 hover:text-foreground active:scale-95 disabled:opacity-40"
            >
              next
              <span className="transition-transform duration-300 group-hover/btn:translate-x-0.5">
                ▶
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
            <span>intensity</span>
            <span className="text-muted-foreground/35">·</span>
            <span>low</span>
            <div id="cal-heatmap-legend" className="flex items-center" />
            <span>high</span>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-3 flex items-center justify-between gap-3 px-1">
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/35">
          tap card · open full readme ↗
        </span>
        <span className="hidden font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/35 sm:inline">
          src · github contributions
        </span>
      </div>
    </motion.div>
  )
}
