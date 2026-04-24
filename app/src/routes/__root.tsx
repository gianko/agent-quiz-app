import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-6 py-3 flex gap-6 items-center">
        <Link to="/" className="font-semibold text-sm hover:underline">
          Quiz App
        </Link>
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:underline">
          Dashboard
        </Link>
      </nav>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  ),
})
