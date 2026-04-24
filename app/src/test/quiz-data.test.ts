import { describe, it, expect } from 'vitest'
import { getCategories, getQuizById } from '@/lib/quiz-data'

describe('GET /api/categories', () => {
  it('returns all 3 categories', async () => {
    const categories = await getCategories()
    expect(categories).toHaveLength(3)
  })

  it('each category has id, title, description', async () => {
    const categories = await getCategories()
    for (const cat of categories) {
      expect(cat).toHaveProperty('id')
      expect(cat).toHaveProperty('title')
      expect(cat).toHaveProperty('description')
      expect(typeof cat.id).toBe('string')
      expect(typeof cat.title).toBe('string')
      expect(typeof cat.description).toBe('string')
    }
  })
})

describe('GET /api/quiz/:categoryId', () => {
  it('returns quiz for agent-fundamentals', async () => {
    const quiz = await getQuizById('agent-fundamentals')
    expect(quiz).not.toBeNull()
    expect(quiz!.categoryId).toBe('agent-fundamentals')
  })

  it('returns quiz for prompt-engineering', async () => {
    const quiz = await getQuizById('prompt-engineering')
    expect(quiz).not.toBeNull()
    expect(quiz!.categoryId).toBe('prompt-engineering')
  })

  it('returns quiz for model-selection', async () => {
    const quiz = await getQuizById('model-selection')
    expect(quiz).not.toBeNull()
    expect(quiz!.categoryId).toBe('model-selection')
  })

  it('each category has at least 10 questions', async () => {
    for (const id of ['agent-fundamentals', 'prompt-engineering', 'model-selection']) {
      const quiz = await getQuizById(id)
      expect(quiz!.questions.length).toBeGreaterThanOrEqual(10)
    }
  })

  it('each question has required fields', async () => {
    const quiz = await getQuizById('agent-fundamentals')
    for (const q of quiz!.questions) {
      expect(q).toHaveProperty('id')
      expect(q).toHaveProperty('text')
      expect(q).toHaveProperty('choices')
      expect(q).toHaveProperty('correctAnswerId')
      expect(q).toHaveProperty('explanation')
      expect(Array.isArray(q.choices)).toBe(true)
      expect(q.choices.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('each choice has id and text', async () => {
    const quiz = await getQuizById('agent-fundamentals')
    for (const q of quiz!.questions) {
      for (const c of q.choices) {
        expect(c).toHaveProperty('id')
        expect(c).toHaveProperty('text')
      }
    }
  })

  it('correctAnswerId matches one of the choices', async () => {
    const quiz = await getQuizById('agent-fundamentals')
    for (const q of quiz!.questions) {
      const choiceIds = q.choices.map((c) => c.id)
      expect(choiceIds).toContain(q.correctAnswerId)
    }
  })

  it('returns null for unknown categoryId', async () => {
    const quiz = await getQuizById('unknown-category')
    expect(quiz).toBeNull()
  })
})
