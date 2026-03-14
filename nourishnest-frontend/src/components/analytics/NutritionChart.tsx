import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DailyNutrition } from '@/types/analytics.types'

interface NutritionChartProps {
  data: DailyNutrition[]
}

const LINES = [
  { key: 'calories', color: '#22c55e', label: 'Calories' },
  { key: 'protein_g', color: '#3b82f6', label: 'Protein (g)' },
  { key: 'carbs_g', color: '#f59e0b', label: 'Carbs (g)' },
  { key: 'fat_g', color: '#ef4444', label: 'Fat (g)' },
]

export function NutritionChart({ data }: NutritionChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {LINES.map(({ key, color, label }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            name={label}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
