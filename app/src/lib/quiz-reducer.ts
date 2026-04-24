import type { Question } from '@/lib/quiz-data'

export interface QuizState {
  status: 'idle' | 'active' | 'complete'
  questions: Question[]
  currentIndex: number
  answers: Record<string, string> // questionId → choiceId
}

export type QuizAction =
  | { type: 'START_QUIZ'; questions: Question[] }
  | { type: 'SELECT_ANSWER'; questionId: string; choiceId: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET_QUIZ' }

export const initialQuizState: QuizState = {
  status: 'idle',
  questions: [],
  currentIndex: 0,
  answers: {},
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...initialQuizState,
        status: 'active',
        questions: action.questions,
      }

    case 'SELECT_ANSWER': {
      // Locked — ignore if already answered
      if (state.answers[action.questionId] !== undefined) return state
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.choiceId },
      }
    }

    case 'NEXT_QUESTION': {
      const isLast = state.currentIndex >= state.questions.length - 1
      if (isLast) {
        return { ...state, status: 'complete' }
      }
      return { ...state, currentIndex: state.currentIndex + 1 }
    }

    case 'RESET_QUIZ':
      return initialQuizState

    default:
      return state
  }
}
