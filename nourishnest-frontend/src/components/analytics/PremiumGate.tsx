import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PremiumGate() {
  return (
    <div className="flex justify-center py-16">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Premium Feature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Analytics are available on Premium and Pro plans. Upgrade to unlock nutrition tracking,
            inventory health insights, and more.
          </p>
          <Button asChild>
            <Link to="/subscription">Upgrade now</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
