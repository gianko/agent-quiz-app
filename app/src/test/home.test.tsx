import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { getCategories, getQuizById } from '@/lib/quiz-data'
import type { Category, Quiz } from '@/lib/quiz-data'

// Mock TanStack Router Link so LearnModeOverlay renders without a router context
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({ children, to, params, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string; params?: unknown }) => (
      <a href={to} {...rest}>{children}</a>
    ),
  }
})

const { LearnModeOverlay } = await import('@/routes/index')

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CATEGORY: Category = {
  id: 'agent-fundamentals',
  title: 'Agent Fundamentals',
  description: 'Test your knowledge of AI agents.',
}

const QUIZ: Quiz = {
  categoryId: 'agent-fundamentals',
  questions: [
    {
      id: 'q1',
      text: 'What is ReAct?',
      choices: [
        { id: 'a', text: 'A pattern combining reasoning and acting' },
        { id: 'b', text: 'A React hook' },
      ],
      correctAnswerId: 'a',
      explanation: 'ReAct interleaves reasoning traces with actions.',
    },
    {
      id: 'q2',
      text: 'What is an agent?',
      choices: [
        { id: 'c', text: 'A model that uses tools' },
        { id: 'd', text: 'A static prompt' },
      ],
      correctAnswerId: 'c',
      explanation: 'An agent uses tools to accomplish tasks.',
    },
  ],
}

// ─── Data layer (uses MSW server) ─────────────────────────────────────────────

describe('home page data layer', () => {
  it('getCategories returns all 3 categories', async () => {
    const categories = await getCategories()
    expect(categories).toHaveLength(3)
  })

  it('getQuizById returns quiz for learn mode', async () => {
    const quiz = await getQuizById('agent-fundamentals')
    expect(quiz).not.toBeNull()
    expect(quiz!.questions.length).toBeGreaterThan(0)
  })
})

// ─── LearnModeOverlay ─────────────────────────────────────────────────────────

describe('LearnModeOverlay', () => {
  it('renders the category title', () => {
    render(<LearnModeOverlay category={CATEGORY} quiz={QUIZ} onClose={() => {}} />)
    expect(screen.getByText('Learn: Agent Fundamentals')).toBeInTheDocument()
  })

  it('renders all question texts', () => {
    render(<LearnModeOverlay category={CATEGORY} quiz={QUIZ} onClose={() => {}} />)
    expect(screen.getByText(/What is ReAct\?/)).toBeInTheDocument()
    expect(screen.getByText(/What is an agent\?/)).toBeInTheDocument()
  })

  it('marks correct answers with "(correct)" label', () => {
    render(<LearnModeOverlay category={CATEGORY} quiz={QUIZ} onClose={() => {}} />)
    const correctLabels = screen.getAllByText('(correct)')
    expect(correctLabels).toHaveLength(2)
  })

  it('renders explanations for each question', () => {
    render(<LearnModeOverlay category={CATEGORY} quiz={QUIZ} onClose={() => {}} />)
    expect(screen.getByText(/ReAct interleaves reasoning traces/)).toBeInTheDocument()
    expect(screen.getByText(/An agent uses tools/)).toBeInTheDocument()
  })

  it('calls onClose when × button is clicked', () => {
    const onClose = vi.fn()
    render(<LearnModeOverlay category={CATEGORY} quiz={QUIZ} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close learn mode'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Close button is clicked', () => {
    const onClose = vi.fn()
    render(<LearnModeOverlay category={CATEGORY} quiz={QUIZ} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has a Start Quiz link to the correct category', () => {
    render(<LearnModeOverlay category={CATEGORY} quiz={QUIZ} onClose={() => {}} />)
    const link = screen.getByRole('link', { name: 'Start Quiz' })
    expect(link).toHaveAttribute('href', '/quiz/$categoryId')
  })
})
