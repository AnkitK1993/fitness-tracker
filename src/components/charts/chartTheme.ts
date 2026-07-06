import type { CSSProperties } from 'react'

/** Chart chrome tokens — resolved from CSS variables so light/dark swap automatically. */
export const chart = {
  series1: 'var(--chart-series-1)',
  grid: 'var(--chart-grid)',
  axis: 'var(--chart-axis)',
  ink: 'var(--text-muted)',
  referenceLine: 'var(--text-secondary)',
  tooltipBg: 'var(--surface-raised)',
  tooltipBorder: 'var(--border)',
}

export const chartMargin = { top: 8, right: 12, bottom: 4, left: 0 }

export const tooltipStyle: CSSProperties = {
  backgroundColor: 'var(--surface-raised)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: 13,
}
