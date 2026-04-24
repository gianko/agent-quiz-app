export interface Choice {
  id: string
  text: string
}

export interface Question {
  id: string
  text: string
  choices: Choice[]
  correctAnswerId: string
  explanation: string
}

export interface Quiz {
  categoryId: string
  questions: Question[]
}

export interface Category {
  id: string
  title: string
  description: string
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories')
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function getQuizById(categoryId: string): Promise<Quiz | null> {
  const res = await fetch(`/api/quiz/${categoryId}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch quiz: ${categoryId}`)
  return res.json()
}
