const KEYS = {
  user: 'quizapp:user',
  attempts: 'quizapp:attempts',
} as const

export interface User {
  username: string
}

export interface AnswerRecord {
  questionId: string
  selected: string
  correct: boolean
}

export interface Attempt {
  id: string
  categoryId: string
  date: string
  score: number
  total: number
  answers: AnswerRecord[]
}

export function getUser(): User | null {
  const raw = localStorage.getItem(KEYS.user)
  if (!raw) return null
  return JSON.parse(raw) as User
}

export function saveUser(username: string): void {
  localStorage.setItem(KEYS.user, JSON.stringify({ username }))
}

export function getAttempts(): Attempt[] {
  const raw = localStorage.getItem(KEYS.attempts)
  if (!raw) return []
  return JSON.parse(raw) as Attempt[]
}

export function saveAttempt(attempt: Attempt): void {
  const existing = getAttempts()
  localStorage.setItem(KEYS.attempts, JSON.stringify([...existing, attempt]))
}

export function getAttemptById(id: string): Attempt | null {
  return getAttempts().find((a) => a.id === id) ?? null
}
