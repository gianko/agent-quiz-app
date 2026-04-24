import type { AnswerRecord } from '@/lib/persistence'

export function computeScore(answers: AnswerRecord[]): number {
  return answers.filter((a) => a.correct).length
}

export function computePercentage(score: number, total: number): number {
  if (total === 0) return 0
  return Math.round((score / total) * 100)
}

export function getFeedback(percentage: number): string {
  if (percentage <= 40) return 'Needs review — keep studying!'
  if (percentage <= 70) return "Keep practicing, you're getting there!"
  if (percentage <= 90) return 'Good job! Solid understanding.'
  return "Excellent! You've mastered this."
}
