import { NavLink } from 'react-router-dom'
import { Package, BookOpen, Globe, Trophy, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/inventory', icon: Package, label: 'Pantry' },
  { to: '/recipes', icon: BookOpen, label: 'Recipes' },
  { to: '/community', icon: Globe, label: 'Community' },
  { to: '/meals/rewards', icon: Trophy, label: 'Rewards' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card md:hidden">
      <ul className="flex">
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
