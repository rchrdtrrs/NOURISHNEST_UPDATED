import { useNavigate } from 'react-router-dom'
import { LogOut, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'

export function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = user
    ? (user.first_name?.[0] ?? user.username[0]).toUpperCase()
    : '?'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Leaf className="h-5 w-5 text-primary" />
        <span className="font-bold">NourishNest</span>
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm md:block">{user?.username}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
