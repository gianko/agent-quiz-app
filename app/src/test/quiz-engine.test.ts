import { describe, it, expect } from 'vitest'
import { shuffleArray, shuffleQuestions, shuffleChoices } from '@/lib/randomize'
import { computeScore, computePercentage, getFeedback } from '@/lib/scoring'
import { quizReducer, initialQuizState } from '@/lib/quiz-reducer'
import type { Question, Choice } from '@/lib/quiz-data'
import type { QuizAction } from '@/lib/quiz-reducer'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeChoice = (id: string): Choice => ({ id, text: `Choice ${id}` })

const makeQuestion = (id: string, correctId: string): Question => ({
  id,
  text: `Question ${id}`,
  choices: ['a', 'b', 'c', 'd'].map(makeChoice),
  correctAnswerId: correctId,
  explanation: `Explanation for ${id}`,
})

const Q1 = makeQuestion('q1', 'a')
const Q2 = makeQuestion('q2', 'b')
const Q3 = makeQuestion('q3', 'c')
const QUESTIONS = [Q1, Q2, Q3]

// ─── shuffleArray ─────────────────────────────────────────────────────────────

describe('shuffleArray', () => {
  it('returns an array of the same length', () => {
    expect(shuffleArray([1, 2, 3, 4, 5])).toHaveLength(5)
  })

  it('contains all original elements', () => {
    const result = shuffleArray([1, 2, 3, 4, 5])
    expect(result.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate the original array', () => {
    const original = [1, 2, 3]
    shuffleArray(original)
    expect(original).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(shuffleArray([])).toEqual([])
  })

  it('handles single element', () => {
    expect(shuffleArray([42])).toEqual([42])
  })
})

// ─── shuffleQuestions ─────────────────────────────────────────────────────────

describe('shuffleQuestions', () => {
  it('returns all questions', () => {
    const result = shuffleQuestions(QUESTIONS)
    expect(result).toHaveLength(3)
    expect(result.map((q) => q.id).sort()).toEqual(['q1', 'q2', 'q3'])
  })

  it('does not mutate the input', () => {
    const copy = [...QUESTIONS]
    shuffleQuestions(QUESTIONS)
    expect(QUESTIONS).toEqual(copy)
  })
})

// ─── shuffleChoices ──────────────────────────────────────────────────────────

describe('shuffleChoices', () => {
  it('returns all choices', () => {
    const result = shuffleChoices(Q1.choices)
    expect(result).toHaveLength(4)
    expect(result.map((c) => c.id).sort()).toEqual(['a', 'b', 'c', 'd'])
  })
})

// ─── computeScore ─────────────────────────────────────────────────────────────

describe('computeScore', () => {
  it('returns 0 for empty answers', () => {
    expect(computeScore([])).toBe(0)
  })

  it('counts correct answers', () => {
    expect(
      computeScore([
        { questionId: 'q1', selected: 'a', correct: true },
        { questionId: 'q2', selected: 'x', correct: false },
        { questionId: 'q3', selected: 'c', correct: true },
      ])
    ).toBe(2)
  })

  it('returns 0 when all wrong', () => {
    expect(
      computeScore([
        { questionId: 'q1', selected: 'b', correct: false },
        { questionId: 'q2', selected: 'a', correct: false },
      ])
    ).toBe(0)
  })
})

// ─── computePercentage ───────────────────────────────────────────────────────

describe('computePercentage', () => {
  it('returns 100 for perfect score', () => {
    expect(computePercentage(10, 10)).toBe(100)
  })

  it('returns 0 for zero score', () => {
    expect(computePercentage(0, 10)).toBe(0)
  })

  it('rounds to nearest integer', () => {
    expect(computePercentage(1, 3)).toBe(33)
  })

  it('returns 0 for total=0 to avoid division by zero', () => {
    expect(computePercentage(0, 0)).toBe(0)
  })
})

// ─── getFeedback ─────────────────────────────────────────────────────────────

describe('getFeedback', () => {
  it('returns "Needs review" for 0%', () => {
    expect(getFeedback(0)).toBe('Needs review — keep studying!')
  })

  it('returns "Needs review" for 40%', () => {
    expect(getFeedback(40)).toBe('Needs review — keep studying!')
  })

  it('returns "Keep practicing" for 41%', () => {
    expect(getFeedback(41)).toBe("Keep practicing, you're getting there!")
  })

  it('returns "Keep practicing" for 70%', () => {
    expect(getFeedback(70)).toBe("Keep practicing, you're getting there!")
  })

  it('returns "Good job!" for 71%', () => {
    expect(getFeedback(71)).toBe('Good job! Solid understanding.')
  })

  it('returns "Good job!" for 90%', () => {
    expect(getFeedback(90)).toBe('Good job! Solid understanding.')
  })

  it('returns "Excellent!" for 91%', () => {
    expect(getFeedback(91)).toBe("Excellent! You've mastered this.")
  })

  it('returns "Excellent!" for 100%', () => {
    expect(getFeedback(100)).toBe("Excellent! You've mastered this.")
  })
})

// ─── quizReducer ─────────────────────────────────────────────────────────────

describe('quizReducer', () => {
  it('has correct initial state', () => {
    expect(initialQuizState.status).toBe('idle')
    expect(initialQuizState.currentIndex).toBe(0)
    expect(initialQuizState.answers).toEqual({})
  })

  it('START_QUIZ transitions to active with questions loaded', () => {
    const action: QuizAction = { type: 'START_QUIZ', questions: QUESTIONS }
    const state = quizReducer(initialQuizState, action)
    expect(state.status).toBe('active')
    expect(state.questions).toHaveLength(3)
    expect(state.currentIndex).toBe(0)
    expect(state.answers).toEqual({})
  })

  it('SELECT_ANSWER records the answer', () => {
    const started = quizReducer(initialQuizState, { type: 'START_QUIZ', questions: QUESTIONS })
    const action: QuizAction = { type: 'SELECT_ANSWER', questionId: 'q1', choiceId: 'a' }
    const state = quizReducer(started, action)
    expect(state.answers['q1']).toBe('a')
  })

  it('SELECT_ANSWER does not overwrite an existing answer (locked)', () => {
    const started = quizReducer(initialQuizState, { type: 'START_QUIZ', questions: QUESTIONS })
    const withAnswer = quizReducer(started, { type: 'SELECT_ANSWER', questionId: 'q1', choiceId: 'a' })
    const attempted = quizReducer(withAnswer, { type: 'SELECT_ANSWER', questionId: 'q1', choiceId: 'b' })
    expect(attempted.answers['q1']).toBe('a')
  })

  it('NEXT_QUESTION advances currentIndex', () => {
    const started = quizReducer(initialQuizState, { type: 'START_QUIZ', questions: QUESTIONS })
    const answered = quizReducer(started, { type: 'SELECT_ANSWER', questionId: 'q1', choiceId: 'a' })
    const next = quizReducer(answered, { type: 'NEXT_QUESTION' })
    expect(next.currentIndex).toBe(1)
  })

  it('NEXT_QUESTION on last question transitions to complete', () => {
    let state = quizReducer(initialQuizState, { type: 'START_QUIZ', questions: [Q1] })
    state = quizReducer(state, { type: 'SELECT_ANSWER', questionId: 'q1', choiceId: 'a' })
    state = quizReducer(state, { type: 'NEXT_QUESTION' })
    expect(state.status).toBe('complete')
  })

  it('RESET_QUIZ returns to initial state', () => {
    let state = quizReducer(initialQuizState, { type: 'START_QUIZ', questions: QUESTIONS })
    state = quizReducer(state, { type: 'SELECT_ANSWER', questionId: 'q1', choiceId: 'a' })
    state = quizReducer(state, { type: 'RESET_QUIZ' })
    expect(state).toEqual(initialQuizState)
  })
})
