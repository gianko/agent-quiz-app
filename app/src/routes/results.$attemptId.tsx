import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/results/$attemptId')({
  component: ResultsPage,
})

function ResultsPage() {
  const { attemptId } = Route.useParams()
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Results</h1>
      <p className="text-muted-foreground mt-2">Attempt: {attemptId}</p>
    </main>
  )
}
