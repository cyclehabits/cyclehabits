import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import '@testing-library/jest-dom'

describe('AuthContext', () => {
  it('provides default null user when not authenticated', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
  })

  it('provides loading state initially', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.loading).toBe(true)
  })

  it('returns null user when used outside AuthProvider', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
  })
})

