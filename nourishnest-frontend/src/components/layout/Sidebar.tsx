import { NavLink } from 'react-router-dom'
import {
  Package,
  BookOpen,
  Sparkles,
  GitFork,
  History,
  Trophy,
  Globe,
  User,
  CreditCard,
  BarChart3,
  Leaf,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { to: '/inventory', icon: Package, label: 'Pantry' },
  { to: '/recipes', icon: BookOpen, label: 'Recipes' },
  { to: '/recipes/generate', icon: Sparkles, label: 'Generate' },
  { to: '/recipes/my-forks', icon: GitFork, label: 'My Forks' },
  { to: '/meals/history', icon: History, label: 'Meal History' },
  { to: '/meals/rewards', icon: Trophy, label: 'Rewards' },
  { to: '/community', icon: Globe, label: 'Community' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/subscription', icon: CreditCard, label: 'Subscription' },
]

export function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Leaf className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">NourishNest</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/recipes'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {user && (
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">
            {user.first_name || user.username}
          </p>
          <p className="text-xs font-medium capitalize text-primary">
            {user.subscription_tier} plan
          </p>
        </div>
      )}
    </aside>
  )
}
