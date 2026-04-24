import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getCategories, getQuizById } from '@/lib/quiz-data'
import type { Category, Quiz } from '@/lib/quiz-data'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [learnData, setLearnData] = useState<{ category: Category; quiz: Quiz } | null>(null)
  const [learnLoading, setLearnLoading] = useState(false)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories.'))
      .finally(() => setLoading(false))
  }, [])

  async function openLearnMode(category: Category) {
    setLearnLoading(true)
    try {
      const quiz = await getQuizById(category.id)
      if (quiz) setLearnData({ category, quiz })
    } finally {
      setLearnLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <p className="text-muted-foreground">Loading categories…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <p className="text-destructive font-medium">{error}</p>
      </main>
    )
  }

  return (
    <>
      <main className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">AI Development Quiz</h1>
          <p className="text-muted-foreground mt-1">Select a category to get started.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex gap-2">
                <Link
                  to="/quiz/$categoryId"
                  params={{ categoryId: category.id }}
                  className={buttonVariants({ size: 'sm' })}
                >
                  Start Quiz
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openLearnMode(category)}
                  disabled={learnLoading}
                >
                  Learn
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {learnData && (
        <LearnModeOverlay
          category={learnData.category}
          quiz={learnData.quiz}
          onClose={() => setLearnData(null)}
        />
      )}
    </>
  )
}

interface LearnModeOverlayProps {
  category: Category
  quiz: Quiz
  onClose: () => void
}

export function LearnModeOverlay({ category, quiz, onClose }: LearnModeOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl bg-background border rounded-xl shadow-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Learn: {category.title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            aria-label="Close learn mode"
          >
            ×
          </button>
        </div>

        <div className="space-y-8">
          {quiz.questions.map((question, i) => (
            <div key={question.id} className="space-y-3">
              <p className="font-medium text-sm">
                {i + 1}. {question.text}
              </p>
              <ul className="space-y-1.5">
                {question.choices.map((choice) => (
                  <li
                    key={choice.id}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm',
                      choice.id === question.correctAnswerId
                        ? 'border border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {choice.text}
                    {choice.id === question.correctAnswerId && (
                      <span className="ml-2 text-xs font-semibold">(correct)</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Explanation: </span>
                {question.explanation}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2 border-t">
          <Link
            to="/quiz/$categoryId"
            params={{ categoryId: category.id }}
            className={buttonVariants()}
          >
            Start Quiz
          </Link>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
