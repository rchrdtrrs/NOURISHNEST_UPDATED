import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center py-16">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page not found</h2>
      <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
      <Button className="mt-6" asChild>
        <Link to="/inventory">Go home</Link>
      </Button>
    </div>
  )
}
