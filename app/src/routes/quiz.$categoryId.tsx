import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/quiz/$categoryId')({
  component: QuizPage,
})

function QuizPage() {
  const { categoryId } = Route.useParams()
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Quiz</h1>
      <p className="text-muted-foreground mt-2">Category: {categoryId}</p>
    </main>
  )
}
