import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LoginPage from './LoginPage'

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}))

vi.mock('@/lib/firebase/auth', () => ({ auth: {} }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

import * as firebaseAuth from 'firebase/auth'

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders app name and tagline', () => {
    renderLoginPage()
    expect(screen.getByText('CycleHabits')).toBeInTheDocument()
    expect(screen.getByText(/construa sua rotina/i)).toBeInTheDocument()
  })

  it('renders entrar and cadastrar tabs', () => {
    renderLoginPage()
    expect(screen.getByRole('tab', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /cadastrar/i })).toBeInTheDocument()
  })

  it('signs in with email and password and navigates to /dashboard', async () => {
    vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({} as any)
    renderLoginPage()

    fireEvent.change(screen.getByPlaceholderText('voce@email.com'), {
      target: { value: 'user@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'senha123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        'user@test.com',
        'senha123'
      )
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error on invalid credentials', async () => {
    vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(new Error('auth/wrong-password'))
    renderLoginPage()

    fireEvent.change(screen.getByPlaceholderText('voce@email.com'), {
      target: { value: 'user@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'errada' },
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha inválidos.')).toBeInTheDocument()
    })
  })

  it('signs in with Google and navigates to /dashboard', async () => {
    vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({} as any)
    renderLoginPage()

    fireEvent.click(screen.getByRole('button', { name: /continuar com google/i }))

    await waitFor(() => {
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error message when forgot password is clicked without email', async () => {
    renderLoginPage()
    fireEvent.click(screen.getByRole('button', { name: /esqueci a senha/i }))

    await waitFor(() => {
      expect(screen.getByText(/digite seu e-mail/i)).toBeInTheDocument()
    })
  })
})