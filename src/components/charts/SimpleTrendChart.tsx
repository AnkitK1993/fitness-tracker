import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDateLong, formatDateTick } from '../../lib/dates'
import { chart, chartMargin, tooltipStyle } from './chartTheme'

export interface TrendPoint {
  date: string // 'YYYY-MM-DD'
  value: number
}

interface SimpleTrendChartProps {
  data: TrendPoint[]
  /** Series name shown in the tooltip, e.g. "Best set" */
  name: string
  /** Format a raw value for tooltip/axis, e.g. (v) => `${v} kg` */
  formatValue: (value: number) => string
  height?: number
}

/** Single-series line chart over dates — shared by exercise progress and cardio trends. */
export function SimpleTrendChart({ data, name, formatValue, height = 260 }: SimpleTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={chartMargin}>
        <CartesianGrid stroke={chart.grid} strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateTick}
          tick={{ fill: chart.ink, fontSize: 12 }}
          axisLine={{ stroke: chart.axis }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: chart.ink, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={44}
          domain={['auto', 'auto']}
          tickFormatter={(v: number) => String(v)}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(label) => formatDateLong(String(label))}
          formatter={(value) => [formatValue(Number(value)), name]}
        />
        <Line
          type="monotone"
          dataKey="value"
          name={name}
          stroke={chart.series1}
          strokeWidth={2}
          dot={{ r: 3, fill: chart.series1, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
