import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getUser, getAttempts, type Attempt } from '@/lib/persistence'
import { getCategories, type Category } from '@/lib/quiz-data'
import { computePercentage } from '@/lib/scoring'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return <DashboardContent />
}

export function DashboardContent() {
  const user = getUser()
  const attempts = getAttempts()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    )
  }

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.title]))

  const totalQuizzes = attempts.length
  const avgScore =
    totalQuizzes === 0
      ? 0
      : Math.round(
          attempts.reduce((sum, a) => sum + computePercentage(a.score, a.total), 0) / totalQuizzes,
        )

  const bestByCategory: Record<string, number> = {}
  for (const a of attempts) {
    const pct = computePercentage(a.score, a.total)
    if (bestByCategory[a.categoryId] === undefined || pct > bestByCategory[a.categoryId]) {
      bestByCategory[a.categoryId] = pct
    }
  }

  const recentAttempts = [...attempts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">
        {user ? `Welcome back, ${user.username}` : 'Dashboard'}
      </h1>

      {totalQuizzes === 0 ? (
        <div className="rounded-lg border p-8 text-center space-y-3">
          <p className="text-muted-foreground">You haven't taken any quizzes yet.</p>
          <Link to="/" className={buttonVariants()}>
            Start a Quiz
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalQuizzes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgScore}%</div>
              </CardContent>
            </Card>
          </div>

          {categories.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Best Score per Category</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {categories.map((c) => (
                  <Card key={c.id}>
                    <CardHeader>
                      <CardTitle className="text-sm">{c.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {bestByCategory[c.id] !== undefined ? `${bestByCategory[c.id]}%` : '—'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-3">Recent Attempts</h2>
            <div className="space-y-2">
              {recentAttempts.map((a: Attempt) => {
                const pct = computePercentage(a.score, a.total)
                const date = new Date(a.date).toLocaleDateString()
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">
                        {categoryMap[a.categoryId] ?? a.categoryId}
                      </div>
                      <div className="text-xs text-muted-foreground">{date}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold">
                        {a.score}/{a.total} ({pct}%)
                      </span>
                      <Link
                        to="/review/$attemptId"
                        params={{ attemptId: a.id }}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
