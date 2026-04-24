import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Attempt } from '@/lib/persistence'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({
      children,
      to,
      params: _params,
      ...rest
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string; params?: unknown }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/lib/persistence', () => ({
  getAttemptById: vi.fn(),
}))

const mockNavigate = vi.fn()

import { getAttemptById } from '@/lib/persistence'
const { ReviewContent } = await import('@/routes/review.$attemptId')

// ─── Fixtures ─────────────────────────────────────────────────────────────────
// Uses real question/choice IDs from agent-fundamentals.json so answer-highlight
// tests can verify the correct and wrong answer labels.
// af-1 correctAnswerId = "af-1-b"
// af-2 correctAnswerId = "af-2-c"

const MOCK_ATTEMPT: Attempt = {
  id: 'attempt-1',
  categoryId: 'agent-fundamentals',
  date: '2026-04-24T12:00:00.000Z',
  score: 9,
  total: 10,
  answers: [
    // af-1: user picked correct answer (af-1-b)
    { questionId: 'af-1', selected: 'af-1-b', correct: true },
    // af-2: user picked wrong answer (af-2-a); correct is af-2-c
    { questionId: 'af-2', selected: 'af-2-a', correct: false },
    { questionId: 'af-3', selected: 'af-3-a', correct: true },
    { questionId: 'af-4', selected: 'af-4-a', correct: true },
    { questionId: 'af-5', selected: 'af-5-a', correct: true },
    { questionId: 'af-6', selected: 'af-6-a', correct: true },
    { questionId: 'af-7', selected: 'af-7-a', correct: true },
    { questionId: 'af-8', selected: 'af-8-a', correct: true },
    { questionId: 'af-9', selected: 'af-9-a', correct: true },
    { questionId: 'af-10', selected: 'af-10-a', correct: true },
  ],
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ReviewContent', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  it('shows error state for invalid attemptId', () => {
    vi.mocked(getAttemptById).mockReturnValue(null)
    render(<ReviewContent attemptId="nonexistent" />)
    expect(screen.getByText(/result not found/i)).toBeInTheDocument()
  })

  it('renders quiz question texts after loading data', async () => {
    vi.mocked(getAttemptById).mockReturnValue(MOCK_ATTEMPT)
    render(<ReviewContent attemptId="attempt-1" />)
    await waitFor(() => {
      expect(
        screen.getByText(/distinguishes an AI agent from a single LLM call/i),
      ).toBeInTheDocument()
    })
  })

  it('shows score summary from attempt', async () => {
    vi.mocked(getAttemptById).mockReturnValue(MOCK_ATTEMPT)
    render(<ReviewContent attemptId="attempt-1" />)
    await waitFor(() => {
      expect(screen.getByText(/9\s*\/\s*10/)).toBeInTheDocument()
    })
  })

  it('shows explanation for each question', async () => {
    vi.mocked(getAttemptById).mockReturnValue(MOCK_ATTEMPT)
    render(<ReviewContent attemptId="attempt-1" />)
    await waitFor(() => {
      // Each question renders an "Explanation:" label — 10 questions = 10 labels
      const labels = screen.getAllByText('Explanation:')
      expect(labels.length).toBe(10)
    })
  })

  it('labels the user\'s correct answer', async () => {
    vi.mocked(getAttemptById).mockReturnValue(MOCK_ATTEMPT)
    render(<ReviewContent attemptId="attempt-1" />)
    await waitFor(() => {
      // af-1-b is both correct and selected → "your answer" label
      expect(screen.getAllByText(/your answer/i).length).toBeGreaterThan(0)
    })
  })

  it('labels the user\'s wrong answer', async () => {
    vi.mocked(getAttemptById).mockReturnValue(MOCK_ATTEMPT)
    render(<ReviewContent attemptId="attempt-1" />)
    await waitFor(() => {
      // af-2: user picked af-2-a which is wrong → "your answer" label with wrong styling
      // and af-2-c should have a "correct answer" label
      expect(screen.getAllByText(/correct answer/i).length).toBeGreaterThan(0)
    })
  })

  it('has a Back to Results link', async () => {
    vi.mocked(getAttemptById).mockReturnValue(MOCK_ATTEMPT)
    render(<ReviewContent attemptId="attempt-1" />)
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /back to results/i })
      expect(link).toHaveAttribute('href', '/results/$attemptId')
    })
  })

  it('Retake Quiz navigates to the correct category', async () => {
    vi.mocked(getAttemptById).mockReturnValue(MOCK_ATTEMPT)
    render(<ReviewContent attemptId="attempt-1" />)
    const btn = await screen.findByRole('button', { name: /retake quiz/i })
    await userEvent.click(btn)
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/quiz/$categoryId',
      params: { categoryId: 'agent-fundamentals' },
    })
  })
})
