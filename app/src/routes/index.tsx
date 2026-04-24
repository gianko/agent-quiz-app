import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">AI Development Quiz</h1>
      <p className="text-muted-foreground mt-2">Select a category to get started.</p>
    </main>
  )
}
