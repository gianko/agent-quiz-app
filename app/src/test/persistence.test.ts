import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getUser,
  saveUser,
  saveAttempt,
  getAttempts,
  getAttemptById,
} from '@/lib/persistence'
import type { Attempt } from '@/lib/persistence'

const mockStorage: Record<string, string> = {}

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value },
    removeItem: (key: string) => { delete mockStorage[key] },
    clear: () => Object.keys(mockStorage).forEach((k) => delete mockStorage[k]),
  })
})

const makeAttempt = (overrides: Partial<Attempt> = {}): Attempt => ({
  id: 'attempt-1',
  categoryId: 'agent-fundamentals',
  date: '2026-04-24T10:00:00.000Z',
  score: 8,
  total: 10,
  answers: [{ questionId: 'q1', selected: 'c1', correct: true }],
  ...overrides,
})

describe('getUser', () => {
  it('returns null when no user saved', () => {
    expect(getUser()).toBeNull()
  })

  it('returns saved user after saveUser', () => {
    saveUser('alice')
    expect(getUser()).toEqual({ username: 'alice' })
  })
})

describe('saveUser', () => {
  it('persists under namespaced key', () => {
    saveUser('bob')
    expect(localStorage.getItem('quizapp:user')).toBe(JSON.stringify({ username: 'bob' }))
  })

  it('overwrites previous username', () => {
    saveUser('alice')
    saveUser('bob')
    expect(getUser()).toEqual({ username: 'bob' })
  })
})

describe('getAttempts', () => {
  it('returns empty array when no attempts saved', () => {
    expect(getAttempts()).toEqual([])
  })

  it('returns all saved attempts', () => {
    const a1 = makeAttempt({ id: 'a1' })
    const a2 = makeAttempt({ id: 'a2' })
    saveAttempt(a1)
    saveAttempt(a2)
    expect(getAttempts()).toEqual([a1, a2])
  })
})

describe('saveAttempt', () => {
  it('appends to existing attempts', () => {
    const a1 = makeAttempt({ id: 'a1' })
    const a2 = makeAttempt({ id: 'a2' })
    saveAttempt(a1)
    saveAttempt(a2)
    expect(getAttempts()).toHaveLength(2)
  })

  it('persists under namespaced key', () => {
    const a = makeAttempt()
    saveAttempt(a)
    const stored = JSON.parse(localStorage.getItem('quizapp:attempts')!)
    expect(stored).toEqual([a])
  })
})

describe('getAttemptById', () => {
  it('returns null for unknown id', () => {
    expect(getAttemptById('nope')).toBeNull()
  })

  it('returns the correct attempt by id', () => {
    const a1 = makeAttempt({ id: 'a1' })
    const a2 = makeAttempt({ id: 'a2' })
    saveAttempt(a1)
    saveAttempt(a2)
    expect(getAttemptById('a2')).toEqual(a2)
  })
})
