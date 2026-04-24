import type { Question, Choice } from '@/lib/quiz-data'

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function shuffleQuestions(questions: Question[]): Question[] {
  return shuffleArray(questions)
}

export function shuffleChoices(choices: Choice[]): Choice[] {
  return shuffleArray(choices)
}
