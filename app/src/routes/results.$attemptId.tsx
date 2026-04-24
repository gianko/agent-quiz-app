import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { getAttemptById } from '@/lib/persistence'
import { computePercentage, getFeedback } from '@/lib/scoring'
import { Button, buttonVariants } from '@/components/ui/button'

export const Route = createFileRoute('/results/$attemptId')({
  component: ResultsPage,
})

function ResultsPage() {
  const { attemptId } = Route.useParams()
  const navigate = useNavigate()
  const attempt = getAttemptById(attemptId)

  if (!attempt) {
    return (
      <main className="p-6 max-w-2xl mx-auto space-y-4">
        <p className="text-destructive font-medium">Result not found.</p>
        <Link to="/" className="text-sm underline text-muted-foreground">
          Back to Home
        </Link>
      </main>
    )
  }

  const percentage = computePercentage(attempt.score, attempt.total)
  const feedback = getFeedback(percentage)

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Quiz Results</h1>

      <div className="rounded-lg border p-8 space-y-3 text-center">
        <div className="text-6xl font-bold">
          {attempt.score} / {attempt.total}
        </div>
        <div className="text-3xl text-muted-foreground font-medium">{percentage}%</div>
        <p className="text-base text-muted-foreground mt-1">{feedback}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() =>
            navigate({
              to: '/quiz/$categoryId',
              params: { categoryId: attempt.categoryId },
            })
          }
        >
          Retake Quiz
        </Button>
        <Link
          to="/review/$attemptId"
          params={{ attemptId }}
          className={buttonVariants({ variant: 'outline' })}
        >
          Review Answers
        </Link>
        <Link to="/" className={buttonVariants({ variant: 'ghost' })}>
          Back to Home
        </Link>
      </div>
    </main>
  )
}
