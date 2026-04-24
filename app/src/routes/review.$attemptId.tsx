import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getAttemptById } from '@/lib/persistence'
import type { Attempt } from '@/lib/persistence'
import { getQuizById } from '@/lib/quiz-data'
import type { Quiz } from '@/lib/quiz-data'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/review/$attemptId')({
  component: ReviewPage,
})

function ReviewPage() {
  const { attemptId } = Route.useParams()
  return <ReviewContent attemptId={attemptId} />
}

export function ReviewContent({ attemptId }: { attemptId: string }) {
  const navigate = useNavigate()
  const attempt: Attempt | null = getAttemptById(attemptId)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!attempt) {
      setLoading(false)
      return
    }
    getQuizById(attempt.categoryId).then((q) => {
      setQuiz(q)
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.categoryId])

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

  if (loading || !quiz) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <p className="text-muted-foreground">Loading review…</p>
      </main>
    )
  }

  const answerMap = Object.fromEntries(attempt.answers.map((a) => [a.questionId, a]))

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Answer Review</h1>
        <span className="text-muted-foreground text-sm">
          {attempt.score} / {attempt.total} correct
        </span>
      </div>

      <ol className="space-y-6 list-none">
        {quiz.questions.map((question, idx) => {
          const record = answerMap[question.id]
          const selectedId = record?.selected ?? ''
          const correctId = question.correctAnswerId

          return (
            <li key={question.id} className="rounded-lg border p-5 space-y-4">
              <p className="font-medium">
                <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                {question.text}
              </p>

              <ul className="space-y-2 list-none">
                {question.choices.map((choice) => {
                  const isSelected = choice.id === selectedId
                  const isCorrect = choice.id === correctId

                  const cls = cn(
                    'rounded-lg border px-4 py-3 text-sm w-full text-left flex items-center gap-2',
                    isCorrect
                      ? 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100'
                      : isSelected
                        ? 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
                        : 'border-border opacity-60',
                  )

                  return (
                    <li key={choice.id} className={cls}>
                      <span className="flex-1">{choice.text}</span>
                      {isCorrect && isSelected && (
                        <span className="shrink-0 text-xs font-semibold text-green-700 dark:text-green-300">
                          ✓ your answer
                        </span>
                      )}
                      {isCorrect && !isSelected && (
                        <span className="shrink-0 text-xs font-semibold text-green-700 dark:text-green-300">
                          ✓ correct answer
                        </span>
                      )}
                      {!isCorrect && isSelected && (
                        <span className="shrink-0 text-xs font-semibold text-red-700 dark:text-red-300">
                          ✗ your answer
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>

              <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Explanation: </span>
                {question.explanation}
              </div>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/results/$attemptId"
          params={{ attemptId }}
          className={buttonVariants({ variant: 'outline' })}
        >
          Back to Results
        </Link>
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
      </div>
    </main>
  )
}
