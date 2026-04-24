import { http, HttpResponse } from 'msw'
import categories from '@/data/categories.json'
import agentFundamentals from '@/data/quizzes/agent-fundamentals.json'
import promptEngineering from '@/data/quizzes/prompt-engineering.json'
import modelSelection from '@/data/quizzes/model-selection.json'

const quizzes: Record<string, unknown> = {
  'agent-fundamentals': agentFundamentals,
  'prompt-engineering': promptEngineering,
  'model-selection': modelSelection,
}

export const handlers = [
  http.get('/api/categories', () => {
    return HttpResponse.json(categories)
  }),

  http.get('/api/quiz/:categoryId', ({ params }) => {
    const quiz = quizzes[params.categoryId as string]
    if (!quiz) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(quiz)
  }),
]
