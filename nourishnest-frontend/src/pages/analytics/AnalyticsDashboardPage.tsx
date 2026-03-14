import { useState } from 'react'
import { BarChart2, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PremiumGate } from '@/components/analytics/PremiumGate'
import { NutritionChart } from '@/components/analytics/NutritionChart'
import { InventoryHealthChart } from '@/components/analytics/InventoryHealthChart'
import { useNutritionAnalytics, useInventoryAnalytics } from '@/hooks/useAnalytics'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'

const DAY_OPTIONS = [7, 14, 30]

export function AnalyticsDashboardPage() {
  const { user } = useAuth()
  const [days, setDays] = useState(7)

  if (!user?.is_premium) return <PremiumGate />

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: nutrition, isLoading: nutritionLoading } = useNutritionAnalytics(days)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: inventory, isLoading: inventoryLoading } = useInventoryAnalytics()

  const tagData = inventory
    ? Object.entries(inventory.tag_distribution).map(([name, count]) => ({ name, count }))
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {DAY_OPTIONS.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? 'default' : 'outline'}
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {nutritionLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : nutrition ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Total calories', value: nutrition.total_calories, unit: 'kcal' },
              { label: 'Avg protein', value: (nutrition.avg_protein ?? 0).toFixed(1), unit: 'g/day' },
              { label: 'Avg carbs', value: (nutrition.avg_carbs ?? 0).toFixed(1), unit: 'g/day' },
              { label: 'Avg fat', value: (nutrition.avg_fat ?? 0).toFixed(1), unit: 'g/day' },
            ].map(({ label, value, unit }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">
                    {label} ({unit})
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Nutrition over {days} days
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nutrition.daily_breakdown.length > 0 ? (
                <NutritionChart data={nutrition.daily_breakdown} />
              ) : (
                <p className="text-center text-muted-foreground py-8">No data for this period</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      {inventoryLoading ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : inventory ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Inventory Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InventoryHealthChart data={inventory} />
            </CardContent>
          </Card>

          {inventory.expiring_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="py-2 text-left font-medium">Item</th>
                        <th className="py-2 text-left font-medium">Expires</th>
                        <th className="py-2 text-left font-medium">Days left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.expiring_items.slice(0, 10).map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2 text-muted-foreground">
                            {formatDate(item.expiry_date)}
                          </td>
                          <td className="py-2">
                            <span
                              className={
                                item.days_until_expiry <= 3 ? 'text-destructive font-medium' : ''
                              }
                            >
                              {item.days_until_expiry}d
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {tagData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Inventory by Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={tagData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  )
}
