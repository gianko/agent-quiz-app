import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useUser } from '@/hooks/useUser'
import { UsernamePrompt } from '@/components/UsernamePrompt'

function RootLayout() {
  const { user, setUsername } = useUser()

  return (
    <div className="min-h-screen bg-background">
      {!user && <UsernamePrompt onSubmit={setUsername} />}
      <nav className="border-b px-6 py-3 flex gap-6 items-center">
        <Link to="/" className="font-semibold text-sm hover:underline">
          Quiz App
        </Link>
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:underline">
          Dashboard
        </Link>
        {user && (
          <span className="ml-auto text-sm text-muted-foreground">
            {user.username}
          </span>
        )}
      </nav>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
