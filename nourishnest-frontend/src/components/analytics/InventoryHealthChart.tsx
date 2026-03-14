import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { InventoryAnalytics } from '@/types/analytics.types'

interface InventoryHealthChartProps {
  data: InventoryAnalytics
}

const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b']

export function InventoryHealthChart({ data }: InventoryHealthChartProps) {
  const chartData = [
    { name: 'Fresh', value: data.total_items - data.perishable_items },
    { name: 'Perishable', value: data.perishable_items - data.expired_items },
    { name: 'Expired', value: data.expired_items },
    { name: 'Expiring soon', value: data.expiring_within_week },
  ].filter((d) => d.value > 0)

  if (!chartData.length) {
    return <p className="text-center text-muted-foreground py-8">No inventory data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
