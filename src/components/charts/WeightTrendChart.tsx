import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDateLong, formatDateTick } from '../../lib/dates'
import { kgToDisplay, round } from '../../lib/units'
import type { WeightUnit } from '../../types/user'
import type { BodyWeightLog } from '../../types/weight'
import { chart, chartMargin, tooltipStyle } from './chartTheme'

interface WeightTrendChartProps {
  logs: BodyWeightLog[] // any order; sorted internally
  weightUnit: WeightUnit
  goalWeightKg?: number
  height?: number
}

export function WeightTrendChart({ logs, weightUnit, goalWeightKg, height = 280 }: WeightTrendChartProps) {
  const data = [...logs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({ date: log.date, value: round(kgToDisplay(log.weightKg, weightUnit), 1) }))

  const goal = goalWeightKg !== undefined ? round(kgToDisplay(goalWeightKg, weightUnit), 1) : undefined

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={chartMargin}>
        <CartesianGrid stroke={chart.grid} vertical={false} />
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
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(label) => formatDateLong(String(label))}
          formatter={(value) => [`${value} ${weightUnit}`, 'Weight']}
        />
        {goal !== undefined && (
          <ReferenceLine
            y={goal}
            stroke={chart.referenceLine}
            strokeDasharray="6 4"
            label={{ value: `Goal ${goal} ${weightUnit}`, fill: chart.ink, fontSize: 12, position: 'insideTopRight' }}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          name="Weight"
          stroke={chart.series1}
          strokeWidth={2}
          dot={{ r: 3, fill: chart.series1, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
