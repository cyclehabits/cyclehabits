import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardPage from './DashboardPage'

vi.mock('@/hooks/useHabits', () => ({
  useHabits: () => ({ habits: [], loading: false }),
}))

vi.mock('@/hooks/useHabitLogs', () => ({
  useHabitLogs: () => ({ logs: {}, updateLog: vi.fn() }),
}))

vi.mock('@/contexts/auth/useAuth', () => ({
  useAuth: () => ({ user: { displayName: 'Ana Lima', uid: 'u1' } }),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o cabeçalho com "Hoje"', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Hoje')).toBeInTheDocument()
  })

  it('mostra mensagem quando não há hábitos', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/Nenhum hábito agendado/i)).toBeInTheDocument()
  })

  it('mostra progresso 0/0', () => {
    render(<DashboardPage />)
    expect(screen.getByText('0/0')).toBeInTheDocument()
  })
})