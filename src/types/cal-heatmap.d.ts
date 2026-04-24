declare module 'cal-heatmap' {
  export default class CalHeatmap {
    paint(options: any, plugins?: Array<any>): Promise<void> | void
    destroy(): Promise<void> | void
    previous(): void
    next(): void
  }
}

declare module 'cal-heatmap/plugins/Tooltip' {
  const Tooltip: any
  export default Tooltip
}

declare module 'cal-heatmap/plugins/LegendLite' {
  const LegendLite: any
  export default LegendLite
}

declare module 'cal-heatmap/plugins/CalendarLabel' {
  const CalendarLabel: any
  export default CalendarLabel
}

declare module 'cal-heatmap/cal-heatmap.css' {
  const stylesheet: unknown
  export default stylesheet
}
