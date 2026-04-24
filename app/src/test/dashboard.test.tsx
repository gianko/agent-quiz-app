import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import type { Attempt, User } from '@/lib/persistence'

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
  }
})

vi.mock('@/lib/persistence', () => ({
  getUser: vi.fn(),
  getAttempts: vi.fn(),
}))

import { getUser, getAttempts } from '@/lib/persistence'
const { DashboardContent } = await import('@/routes/dashboard')

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_USER: User = { username: 'Alice' }

function makeAttempt(
  id: string,
  categoryId: string,
  score: number,
  total: number,
  date: string,
): Attempt {
  return {
    id,
    categoryId,
    score,
    total,
    date,
    answers: Array.from({ length: total }, (_, i) => ({
      questionId: `q-${i}`,
      selected: `a-${i}`,
      correct: i < score,
    })),
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DashboardContent', () => {
  beforeEach(() => {
    vi.mocked(getUser).mockReturnValue(MOCK_USER)
    vi.mocked(getAttempts).mockReturnValue([])
  })

  it('shows username in greeting', async () => {
    render(<DashboardContent />)
    await waitFor(() => {
      expect(screen.getByText(/welcome back, alice/i)).toBeInTheDocument()
    })
  })

  it('shows empty state when no attempts exist', async () => {
    render(<DashboardContent />)
    await waitFor(() => {
      expect(screen.getByText(/haven't taken any quizzes yet/i)).toBeInTheDocument()
    })
  })

  it('empty state has a Start a Quiz link', async () => {
    render(<DashboardContent />)
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /start a quiz/i })
      expect(link).toHaveAttribute('href', '/')
    })
  })

  it('shows total quizzes count', async () => {
    vi.mocked(getAttempts).mockReturnValue([
      makeAttempt('a1', 'agent-fundamentals', 8, 10, '2026-04-24T10:00:00Z'),
      makeAttempt('a2', 'prompt-engineering', 6, 10, '2026-04-24T11:00:00Z'),
    ])
    render(<DashboardContent />)
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('computes average score correctly', async () => {
    vi.mocked(getAttempts).mockReturnValue([
      makeAttempt('a1', 'agent-fundamentals', 8, 10, '2026-04-24T10:00:00Z'), // 80%
      makeAttempt('a2', 'prompt-engineering', 6, 10, '2026-04-24T11:00:00Z'), // 60%
    ])
    render(<DashboardContent />)
    await waitFor(() => {
      expect(screen.getByText('70%')).toBeInTheDocument()
    })
  })

  it('shows best score per category', async () => {
    vi.mocked(getAttempts).mockReturnValue([
      makeAttempt('a1', 'agent-fundamentals', 7, 10, '2026-04-23T10:00:00Z'), // 70%
      makeAttempt('a2', 'agent-fundamentals', 9, 10, '2026-04-24T10:00:00Z'), // 90% — best
    ])
    render(<DashboardContent />)
    await waitFor(() => {
      expect(screen.getByText('90%')).toBeInTheDocument()
    })
  })

  it('shows at most 5 recent attempts', async () => {
    vi.mocked(getAttempts).mockReturnValue([
      makeAttempt('a1', 'agent-fundamentals', 5, 10, '2026-04-20T10:00:00Z'),
      makeAttempt('a2', 'agent-fundamentals', 5, 10, '2026-04-21T10:00:00Z'),
      makeAttempt('a3', 'agent-fundamentals', 5, 10, '2026-04-22T10:00:00Z'),
      makeAttempt('a4', 'agent-fundamentals', 5, 10, '2026-04-23T10:00:00Z'),
      makeAttempt('a5', 'agent-fundamentals', 5, 10, '2026-04-24T10:00:00Z'),
      makeAttempt('a6', 'agent-fundamentals', 5, 10, '2026-04-25T10:00:00Z'),
    ])
    render(<DashboardContent />)
    await waitFor(() => {
      const reviewLinks = screen.getAllByRole('link', { name: 'Review' })
      expect(reviewLinks).toHaveLength(5)
    })
  })

  it('links each recent attempt to its review page', async () => {
    vi.mocked(getAttempts).mockReturnValue([
      makeAttempt('attempt-xyz', 'agent-fundamentals', 8, 10, '2026-04-24T10:00:00Z'),
    ])
    render(<DashboardContent />)
    await waitFor(() => {
      const reviewLink = screen.getByRole('link', { name: 'Review' })
      expect(reviewLink).toHaveAttribute('href', '/review/$attemptId')
    })
  })

  it('shows category name for recent attempts', async () => {
    vi.mocked(getAttempts).mockReturnValue([
      makeAttempt('a1', 'agent-fundamentals', 8, 10, '2026-04-24T10:00:00Z'),
    ])
    render(<DashboardContent />)
    await waitFor(() => {
      // "Agent Fundamentals" appears in both the best-per-category card and the recent attempts row
      const matches = screen.getAllByText('Agent Fundamentals')
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })
  })
})
