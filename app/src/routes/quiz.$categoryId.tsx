import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useEffect, useReducer, useRef, useState } from 'react'
import { getQuizById } from '@/lib/quiz-data'
import { quizReducer, initialQuizState } from '@/lib/quiz-reducer'
import { shuffleQuestions, shuffleChoices } from '@/lib/randomize'
import { saveAttempt } from '@/lib/persistence'
import type { AnswerRecord } from '@/lib/persistence'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/quiz/$categoryId')({
  component: QuizPage,
})

function QuizPage() {
  const { categoryId } = Route.useParams()
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(quizReducer, initialQuizState)
  const [notFound, setNotFound] = useState(false)
  const attemptSaved = useRef(false)

  // Load quiz and start engine
  useEffect(() => {
    let cancelled = false
    getQuizById(categoryId).then((quiz) => {
      if (cancelled) return
      if (!quiz) { setNotFound(true); return }
      const shuffled = shuffleQuestions(quiz.questions).map((q) => ({
        ...q,
        choices: shuffleChoices(q.choices),
      }))
      dispatch({ type: 'START_QUIZ', questions: shuffled })
    })
    return () => { cancelled = true }
  }, [categoryId])

  // When quiz completes, save attempt and navigate to results
  useEffect(() => {
    if (state.status !== 'complete' || attemptSaved.current) return
    attemptSaved.current = true

    const answers: AnswerRecord[] = state.questions.map((q) => ({
      questionId: q.id,
      selected: state.answers[q.id] ?? '',
      correct: state.answers[q.id] === q.correctAnswerId,
    }))
    const score = answers.filter((a) => a.correct).length
    const attempt = {
      id: crypto.randomUUID(),
      categoryId,
      date: new Date().toISOString(),
      score,
      total: state.questions.length,
      answers,
    }
    saveAttempt(attempt)
    navigate({ to: '/results/$attemptId', params: { attemptId: attempt.id } })
  }, [state.status, state.questions, state.answers, categoryId, navigate])

  if (notFound) {
    return (
      <main className="p-6 max-w-2xl mx-auto space-y-4">
        <p className="text-destructive font-medium">Quiz not found for category: {categoryId}</p>
        <Link to="/" className="text-sm underline text-muted-foreground">Back to Home</Link>
      </main>
    )
  }

  if (state.status === 'idle') {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <p className="text-muted-foreground">Loading quiz…</p>
      </main>
    )
  }

  const question = state.questions[state.currentIndex]
  const selectedChoiceId = state.answers[question.id]
  const isAnswered = selectedChoiceId !== undefined
  const total = state.questions.length
  const progressValue = Math.round((state.currentIndex / total) * 100)

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {state.currentIndex + 1} of {total}</span>
        </div>
        <Progress value={progressValue} />
      </div>

      {/* Question */}
      <div className="text-lg font-medium leading-snug">{question.text}</div>

      {/* Choices */}
      <div className="space-y-3">
        {question.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id
          const isCorrect = choice.id === question.correctAnswerId

          let choiceClass = 'border rounded-lg px-4 py-3 text-sm text-left w-full transition-colors'
          if (!isAnswered) {
            choiceClass = cn(choiceClass, 'hover:bg-muted cursor-pointer border-border')
          } else if (isCorrect) {
            choiceClass = cn(choiceClass, 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100')
          } else if (isSelected && !isCorrect) {
            choiceClass = cn(choiceClass, 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100')
          } else {
            choiceClass = cn(choiceClass, 'border-border opacity-60')
          }

          return (
            <button
              key={choice.id}
              className={choiceClass}
              disabled={isAnswered}
              onClick={() =>
                dispatch({ type: 'SELECT_ANSWER', questionId: question.id, choiceId: choice.id })
              }
            >
              {choice.text}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {isAnswered && (
        <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Explanation: </span>
          {question.explanation}
        </div>
      )}

      {/* Next button */}
      {isAnswered && (
        <Button onClick={() => dispatch({ type: 'NEXT_QUESTION' })}>
          {state.currentIndex < total - 1 ? 'Next Question' : 'See Results'}
        </Button>
      )}
    </main>
  )
}
