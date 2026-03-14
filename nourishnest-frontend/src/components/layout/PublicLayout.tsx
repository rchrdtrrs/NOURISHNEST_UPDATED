import { Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
