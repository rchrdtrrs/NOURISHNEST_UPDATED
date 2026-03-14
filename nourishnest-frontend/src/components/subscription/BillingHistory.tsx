import { useTransactions } from '@/hooks/useSubscription'
import { Skeleton } from '@/components/ui/skeleton'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function BillingHistory() {
  const { data: transactions, isLoading } = useTransactions()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (!transactions?.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No billing history yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Transaction ID</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b last:border-0">
              <td className="px-4 py-3">{formatDate(tx.created_at)}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.paypal_transaction_id}</td>
              <td className="px-4 py-3 text-right font-medium">
                {tx.currency} {parseFloat(tx.amount).toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                  {tx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
